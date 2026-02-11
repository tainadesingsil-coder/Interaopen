from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager, suppress
from datetime import datetime, timezone
from typing import Any, Dict, Literal
from uuid import uuid4

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.ble.vvfit_bridge import VvfitBleBridge
from src.config import Settings, load_settings
from src.security.crypto import AES256Cipher
from src.services.access_control import AccessControlService, parse_authorized_uuids
from src.services.coercion import CoercionService, TelemetrySample
from src.services.round_checkin import RoundCheckinService
from src.telemetry_sender import send_heartbeat, send_telemetry
from src.storage.edge_outbox import EdgeOutbox


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def model_dump(model: BaseModel) -> Dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump()  # type: ignore[return-value]
    return model.dict()  # type: ignore[return-value]


class EncryptedEnvelope(BaseModel):
    watch_id: str
    nonce_b64: str
    ciphertext_b64: str


class VisitorWebhookEvent(BaseModel):
    event_id: str | None = None
    unit_id: str
    visitor_name: str
    watch_id: str | None = None
    apartment_lock_id: str | None = None
    camera_snapshot_url: str | None = None


class IntercomDecisionEvent(BaseModel):
    event_id: str
    watch_id: str
    decision: Literal["approve", "deny", "aprovar", "recusar"]
    apartment_lock_id: str | None = None


class BeaconProximityEvent(BaseModel):
    guard_id: str
    beacon_id: str
    rssi: int
    observed_at: datetime | None = None


class TelemetryPayload(BaseModel):
    watch_id: str
    hr_bpm: int = Field(ge=0, le=260)
    spo2: float | None = Field(default=None, ge=50, le=100)
    steps_last_minute: int = Field(default=0, ge=0)
    activity_detected: bool = False
    recorded_at: datetime | None = None


class VibrateCommand(BaseModel):
    title: str = "Condominio"
    message: str
    context: Dict[str, Any] = Field(default_factory=dict)


settings: Settings = load_settings()
cipher = AES256Cipher(settings.aes256_key_b64)
outbox = EdgeOutbox(settings.outbox_db_path)
access_service = AccessControlService(parse_authorized_uuids(settings.authorized_uuids_raw))
coercion_service = CoercionService(
    hr_threshold=settings.coercion_hr_threshold,
    steps_threshold=settings.coercion_steps_threshold,
)
normalized_beacon_map = {key.upper(): value for key, value in settings.guard_beacon_map.items()}
round_service = RoundCheckinService(
    beacon_checkpoint_map=normalized_beacon_map,
    min_rssi=settings.beacon_rssi_threshold,
    cooldown_seconds=settings.beacon_checkin_cooldown_seconds,
)
ble_bridge = VvfitBleBridge(
    watch_mac_address=settings.watch_mac_address,
    notify_char_uuid=settings.vvfit_notify_char_uuid,
    write_char_uuid=settings.vvfit_write_char_uuid,
    cipher=cipher,
)
background_tasks: list[asyncio.Task[Any]] = []
default_guard_id = (
    f"guard-{settings.watch_mac_address.replace(':', '')[-6:].lower()}"
    if settings.watch_mac_address
    else "guard-edge-default"
)


def _normalize_decision(decision: str) -> str:
    normalized = decision.strip().lower()
    if normalized in {"approve", "aprovar"}:
        return "approve"
    if normalized in {"deny", "recusar"}:
        return "deny"
    return normalized


async def trigger_local_lock(lock_id: str) -> bool:
    """
    Local-first lock trigger stub.
    Replace this with local network command to lock controller.
    """
    await asyncio.sleep(0.05)
    outbox.append_event(
        "lock_trigger",
        {
            "lock_id": lock_id,
            "triggered_at": utc_now().isoformat(),
            "status": "ok",
        },
    )
    return True


async def forward_intercom_decision(payload: Dict[str, Any]) -> bool:
    if not settings.intercom_decision_url:
        return False
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            response = await client.post(settings.intercom_decision_url, json=payload)
            response.raise_for_status()
        return True
    except Exception as exc:  # noqa: BLE001
        outbox.append_event(
            "intercom_forward_error",
            {
                "error": str(exc),
                "payload": payload,
                "occurred_at": utc_now().isoformat(),
            },
        )
        return False


async def process_telemetry(payload: TelemetryPayload, source: str) -> Dict[str, Any]:
    recorded_at = payload.recorded_at or utc_now()
    telemetry_event = {
        "watch_id": payload.watch_id,
        "hr_bpm": payload.hr_bpm,
        "spo2": payload.spo2,
        "steps_last_minute": payload.steps_last_minute,
        "activity_detected": payload.activity_detected,
        "recorded_at": recorded_at.isoformat(),
        "source": source,
    }
    outbox.append_event("telemetry_sample", telemetry_event)

    # Mirror telemetry to the Edge Gateway (best-effort, non-blocking).
    asyncio.create_task(
        send_telemetry(
            device_id=payload.watch_id,
            hr=payload.hr_bpm,
            steps=payload.steps_last_minute,
            spo2=payload.spo2,
            timestamp=recorded_at.isoformat(),
        )
    )
    asyncio.create_task(
        send_heartbeat(
            device_id=payload.watch_id,
            session_id=payload.watch_id,
            hr=payload.hr_bpm,
            steps=payload.steps_last_minute,
            spo2=payload.spo2,
            timestamp=recorded_at.isoformat(),
        )
    )

    sample = TelemetrySample(
        watch_id=payload.watch_id,
        hr_bpm=payload.hr_bpm,
        spo2=payload.spo2,
        steps_last_minute=payload.steps_last_minute,
        activity_detected=payload.activity_detected,
        recorded_at=recorded_at,
    )
    alert = coercion_service.evaluate(sample)
    if alert:
        alert_payload = {
            **alert,
            "source": source,
            "recorded_at": recorded_at.isoformat(),
        }
        outbox.append_event("coercion_alert", alert_payload)
        return {"stored": True, "coercion_alert": True, "alert": alert_payload}
    return {"stored": True, "coercion_alert": False}


async def register_beacon_sighting(
    guard_id: str,
    beacon_id: str,
    rssi: int,
    observed_at: datetime | None = None,
) -> Dict[str, Any]:
    checkin = round_service.register_sighting(
        guard_id=guard_id,
        beacon_id=beacon_id.upper(),
        rssi=rssi,
        observed_at=observed_at,
    )
    if checkin:
        outbox.append_event("guard_round_checkin", checkin)
        return {"checkin_created": True, "checkin": checkin}

    return {
        "checkin_created": False,
        "reason": "below_rssi_threshold_or_unknown_beacon_or_cooldown",
    }


async def process_watch_event(event: Dict[str, Any]) -> None:
    event_type = str(event.get("type", "")).lower()
    if event_type == "telemetry":
        try:
            telemetry = TelemetryPayload(**event)
        except Exception as exc:  # noqa: BLE001
            outbox.append_event(
                "watch_event_parse_error",
                {
                    "error": str(exc),
                    "event": event,
                    "occurred_at": utc_now().isoformat(),
                },
            )
            return
        await process_telemetry(telemetry, source="ble_notify")
        return

    if event_type == "intercom_decision":
        decision = {
            "event_id": event.get("event_id", ""),
            "watch_id": event.get("watch_id", "unknown"),
            "decision": _normalize_decision(str(event.get("decision", "deny"))),
            "received_at": utc_now().isoformat(),
        }
        outbox.append_event("intercom_decision", decision)
        await forward_intercom_decision(decision)
        return

    outbox.append_event(
        "watch_event_raw",
        {
            "event": event,
            "received_at": utc_now().isoformat(),
        },
    )


async def watch_connection_loop() -> None:
    while True:
        try:
            if settings.watch_mac_address:
                await ble_bridge.connect_watch()
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001
            outbox.append_event(
                "ble_watch_connection_error",
                {
                    "error": str(exc),
                    "occurred_at": utc_now().isoformat(),
                },
            )
        await asyncio.sleep(8)


async def beacon_scan_loop() -> None:
    if not normalized_beacon_map:
        return
    while True:
        try:
            await VvfitBleBridge.scan_beacons_once(
                beacon_ids=normalized_beacon_map.keys(),
                on_seen=lambda sighting: register_beacon_sighting(
                    guard_id=default_guard_id,
                    beacon_id=sighting["beacon_id"],
                    rssi=int(sighting["rssi"]),
                    observed_at=utc_now(),
                ),
                scan_seconds=4.0,
            )
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001
            outbox.append_event(
                "beacon_scan_error",
                {
                    "error": str(exc),
                    "occurred_at": utc_now().isoformat(),
                },
            )
        await asyncio.sleep(2)


async def outbox_sync_loop() -> None:
    if not settings.cloud_sync_url:
        return
    while True:
        unsynced = outbox.list_unsynced(limit=30)
        if unsynced:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    for event in unsynced:
                        response = await client.post(settings.cloud_sync_url, json=event)
                        response.raise_for_status()
                        outbox.mark_synced(event["id"])
            except asyncio.CancelledError:
                raise
            except Exception as exc:  # noqa: BLE001
                if unsynced:
                    outbox.mark_error(unsynced[0]["id"], str(exc))
        await asyncio.sleep(settings.outbox_sync_interval_seconds)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ble_bridge.register_event_handler(process_watch_event)
    background_tasks.append(asyncio.create_task(watch_connection_loop()))
    background_tasks.append(asyncio.create_task(beacon_scan_loop()))
    background_tasks.append(asyncio.create_task(outbox_sync_loop()))
    try:
        yield
    finally:
        for task in background_tasks:
            task.cancel()
        for task in background_tasks:
            with suppress(asyncio.CancelledError):
                await task
        await ble_bridge.disconnect_watch()


app = FastAPI(
    title="Middleware Seguranca Condominio Wearable",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "time_utc": utc_now().isoformat(),
        "watch_connected": ble_bridge.is_connected,
        "beacon_monitor_enabled": bool(normalized_beacon_map),
        "cloud_sync_enabled": bool(settings.cloud_sync_url),
    }


@app.post("/api/access/unlock")
async def unlock_from_encrypted_uuid(envelope: EncryptedEnvelope) -> Dict[str, Any]:
    try:
        decoded_payload = cipher.decrypt_payload(envelope.nonce_b64, envelope.ciphertext_b64)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid encrypted payload.")

    encrypted_uuid_plain = str(decoded_payload.get("uuid", "")).strip()
    lock_id = str(decoded_payload.get("lock_id", "")).strip()
    resident_id = str(decoded_payload.get("resident_id", "")).strip() or None
    if not encrypted_uuid_plain or not lock_id:
        raise HTTPException(status_code=422, detail="Payload must include uuid and lock_id.")

    decision = await access_service.evaluate_access(
        encrypted_uuid_plain=encrypted_uuid_plain,
        lock_id=lock_id,
        resident_id=resident_id,
    )

    lock_opened = False
    if decision.granted:
        lock_opened = await trigger_local_lock(lock_id)

    response = {
        "granted": decision.granted,
        "reason": decision.reason,
        "resident_id": decision.resident_id,
        "lock_id": decision.lock_id,
        "lock_opened": lock_opened,
    }
    outbox.append_event(
        "access_attempt",
        {
            "watch_id": envelope.watch_id,
            "request_payload": decoded_payload,
            "response": response,
            "occurred_at": utc_now().isoformat(),
        },
    )
    return response


@app.post("/api/webhooks/intercom/visitor")
async def intercom_visitor_webhook(payload: VisitorWebhookEvent) -> Dict[str, Any]:
    event_data = model_dump(payload)
    event_id = payload.event_id or str(uuid4())
    event_data["event_id"] = event_id
    event_data["received_at"] = utc_now().isoformat()
    outbox.append_event("intercom_visitor", event_data)

    delivered_to_watch = False
    if ble_bridge.is_connected:
        try:
            await ble_bridge.send_haptic_alert(
                title="Visitante na portaria",
                message=f"{payload.visitor_name} solicitando acesso para unidade {payload.unit_id}.",
                context={
                    "event_id": event_id,
                    "actions": ["approve", "deny"],
                    "camera_snapshot_url": payload.camera_snapshot_url,
                },
            )
            delivered_to_watch = True
        except Exception as exc:  # noqa: BLE001
            outbox.append_event(
                "intercom_watch_alert_error",
                {
                    "error": str(exc),
                    "event_id": event_id,
                    "occurred_at": utc_now().isoformat(),
                },
            )

    return {
        "status": "received",
        "event_id": event_id,
        "delivered_to_watch": delivered_to_watch,
        "local_first": True,
    }


@app.post("/api/watch/intercom/decision")
async def watch_intercom_decision(payload: IntercomDecisionEvent) -> Dict[str, Any]:
    decision = _normalize_decision(payload.decision)
    decision_payload = {
        "event_id": payload.event_id,
        "watch_id": payload.watch_id,
        "decision": decision,
        "apartment_lock_id": payload.apartment_lock_id,
        "decided_at": utc_now().isoformat(),
    }
    outbox.append_event("intercom_decision", decision_payload)
    forwarded = await forward_intercom_decision(decision_payload)

    lock_opened = False
    if decision == "approve" and payload.apartment_lock_id:
        lock_opened = await trigger_local_lock(payload.apartment_lock_id)

    return {
        "status": "accepted",
        "forwarded_to_intercom": forwarded,
        "lock_opened": lock_opened,
    }


@app.post("/api/security/beacon/proximity")
async def beacon_proximity(payload: BeaconProximityEvent) -> Dict[str, Any]:
    return await register_beacon_sighting(
        guard_id=payload.guard_id,
        beacon_id=payload.beacon_id,
        rssi=payload.rssi,
        observed_at=payload.observed_at,
    )


@app.post("/api/watch/telemetry")
async def telemetry_plain(payload: TelemetryPayload) -> Dict[str, Any]:
    return await process_telemetry(payload, source="api_plain")


@app.post("/api/watch/telemetry/encrypted")
async def telemetry_encrypted(envelope: EncryptedEnvelope) -> Dict[str, Any]:
    try:
        decoded_payload = cipher.decrypt_payload(envelope.nonce_b64, envelope.ciphertext_b64)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid encrypted payload.")

    if "watch_id" not in decoded_payload:
        decoded_payload["watch_id"] = envelope.watch_id
    try:
        telemetry = TelemetryPayload(**decoded_payload)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=422, detail=f"Invalid telemetry payload: {exc}")
    return await process_telemetry(telemetry, source="api_encrypted")


@app.post("/api/watch/command/vibrate")
async def vibrate_watch(payload: VibrateCommand) -> Dict[str, Any]:
    if not ble_bridge.is_connected:
        raise HTTPException(status_code=409, detail="Watch is not connected.")
    await ble_bridge.send_haptic_alert(
        title=payload.title,
        message=payload.message,
        context=payload.context,
    )
    return {"status": "sent"}


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.api_host, port=settings.api_port, reload=False)
