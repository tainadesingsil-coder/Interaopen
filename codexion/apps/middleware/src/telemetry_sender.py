from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import httpx

EDGE_URL = os.getenv("EDGE_GATEWAY_URL", "http://edge-gateway:8787").rstrip("/")


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def send_telemetry(
    device_id: str,
    hr: int,
    steps: int,
    spo2: Optional[float] = None,
    battery_level: Optional[int] = None,
    timestamp: Optional[str] = None,
) -> bool:
    payload: Dict[str, Any] = {
        "device_id": device_id,
        "hr": hr,
        "steps": steps,
        "spo2": spo2,
        "battery_level": battery_level,
        "timestamp": timestamp or _utc_now_iso(),
        "source": "middleware",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{EDGE_URL}/telemetry/watch", json=payload)
            response.raise_for_status()
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"❌ Erro ao enviar telemetria ao EDGE: {exc}")
        return False


async def send_heartbeat(
    device_id: str,
    session_id: Optional[str] = None,
    battery_level: Optional[int] = None,
    hr: Optional[int] = None,
    steps: Optional[int] = None,
    spo2: Optional[float] = None,
    timestamp: Optional[str] = None,
) -> None:
    payload: Dict[str, Any] = {
        "device_id": device_id,
        "session_id": session_id,
        "battery_level": battery_level,
        "hr": hr,
        "steps": steps,
        "spo2": spo2,
        "timestamp": timestamp or _utc_now_iso(),
        "source": "middleware",
    }

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            await client.post(f"{EDGE_URL}/watch/heartbeat", json=payload)
    except Exception:
        # Best-effort heartbeat.
        return
from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

EDGE_URL = os.getenv("EDGE_GATEWAY_URL", "http://edge-gateway:8787").rstrip("/")


def _utc_iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def send_telemetry(
    device_id: str,
    hr: int,
    steps: int,
    spo2: Optional[float],
    *,
    battery_level: Optional[int] = None,
    timestamp: Optional[str] = None,
) -> bool:
    payload: dict[str, Any] = {
        "device_id": device_id,
        "hr": hr,
        "steps": steps,
        "spo2": spo2,
        "timestamp": timestamp or _utc_iso_now(),
    }
    if battery_level is not None:
        payload["battery_level"] = battery_level

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{EDGE_URL}/telemetry/watch", json=payload)
            response.raise_for_status()
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"❌ Erro ao enviar telemetria para o EDGE: {exc}")
        return False


async def send_heartbeat(
    device_id: str,
    session_id: str,
    *,
    timestamp: Optional[str] = None,
) -> None:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            await client.post(
                f"{EDGE_URL}/watch/heartbeat",
                json={
                    "device_id": device_id,
                    "session_id": session_id,
                    "timestamp": timestamp or _utc_iso_now(),
                },
            )
    except Exception:
        # Heartbeat should never crash the middleware.
        return
