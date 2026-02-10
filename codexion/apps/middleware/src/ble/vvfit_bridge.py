from __future__ import annotations

import asyncio
import inspect
import json
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Dict, Iterable, Optional

from src.security.crypto import AES256Cipher

try:
    from bleak import BleakClient, BleakScanner
except Exception:  # noqa: BLE001
    BleakClient = None
    BleakScanner = None

WatchEventHandler = Callable[[Dict[str, Any]], Awaitable[None]]
BeaconSeenHandler = Callable[[Dict[str, Any]], Any]


class VvfitBleBridge:
    """
    BLE adapter for Vvfit-compatible watches.
    Includes write_characteristic support to trigger haptic alerts.
    """

    def __init__(
        self,
        watch_mac_address: str,
        notify_char_uuid: str,
        write_char_uuid: str,
        cipher: AES256Cipher,
    ) -> None:
        self._watch_mac_address = watch_mac_address
        self._notify_char_uuid = notify_char_uuid
        self._write_char_uuid = write_char_uuid
        self._cipher = cipher
        self._event_handlers: list[WatchEventHandler] = []
        self._client: Optional["BleakClient"] = None

    @property
    def is_connected(self) -> bool:
        return bool(self._client and self._client.is_connected)

    def register_event_handler(self, handler: WatchEventHandler) -> None:
        self._event_handlers.append(handler)

    async def connect_watch(self) -> bool:
        if BleakClient is None:
            raise RuntimeError("Bleak is not available. Install dependencies first.")
        if not self._watch_mac_address:
            return False
        if self.is_connected:
            return True

        client = BleakClient(self._watch_mac_address)
        await client.connect()
        await client.start_notify(self._notify_char_uuid, self._notification_callback)
        self._client = client
        return True

    async def disconnect_watch(self) -> None:
        if self._client is None:
            return
        if self._client.is_connected:
            try:
                await self._client.stop_notify(self._notify_char_uuid)
            except Exception:  # noqa: BLE001
                pass
            await self._client.disconnect()
        self._client = None

    async def write_characteristic(self, payload: bytes) -> None:
        if not self._client or not self._client.is_connected:
            raise RuntimeError("Watch is not connected by BLE.")
        await self._client.write_gatt_char(self._write_char_uuid, payload, response=True)

    async def send_haptic_alert(
        self,
        title: str,
        message: str,
        context: Dict[str, Any] | None = None,
    ) -> None:
        command = {
            "type": "visitor_alert",
            "title": title,
            "message": message,
            "context": context or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await self.write_characteristic(
            json.dumps(command, ensure_ascii=True, separators=(",", ":")).encode("utf-8")
        )

    def _notification_callback(self, _characteristic: Any, data: bytearray) -> None:
        event = self._decode_watch_packet(bytes(data))
        for handler in self._event_handlers:
            outcome = handler(event)
            if inspect.isawaitable(outcome):
                asyncio.create_task(outcome)

    def _decode_watch_packet(self, raw_data: bytes) -> Dict[str, Any]:
        text = raw_data.decode("utf-8", errors="ignore").strip()
        if not text:
            return {"type": "watch_raw", "raw_hex": raw_data.hex()}
        try:
            packet = json.loads(text)
        except json.JSONDecodeError:
            return {"type": "watch_raw", "raw_text": text}

        if isinstance(packet, dict) and {"nonce_b64", "ciphertext_b64"}.issubset(packet.keys()):
            try:
                decrypted = self._cipher.decrypt_payload(packet["nonce_b64"], packet["ciphertext_b64"])
            except ValueError as exc:
                return {
                    "type": "watch_encrypted_packet_error",
                    "error": str(exc),
                }
            decrypted["packet_encrypted"] = True
            return decrypted

        if isinstance(packet, dict):
            return packet
        return {"type": "watch_packet", "payload": packet}

    @staticmethod
    async def scan_beacons_once(
        beacon_ids: Iterable[str],
        on_seen: BeaconSeenHandler,
        scan_seconds: float = 4.0,
    ) -> None:
        if BleakScanner is None:
            return

        normalized_ids = {item.upper() for item in beacon_ids}
        strongest_by_beacon: Dict[str, Dict[str, Any]] = {}

        def _detection_callback(device: Any, advertisement_data: Any) -> None:
            candidates = []
            if getattr(device, "address", None):
                candidates.append(str(device.address).upper())
            if getattr(device, "name", None):
                candidates.append(str(device.name).upper())
            if getattr(advertisement_data, "local_name", None):
                candidates.append(str(advertisement_data.local_name).upper())

            beacon_match = next((item for item in candidates if item in normalized_ids), None)
            if beacon_match is None:
                return

            event = {
                "beacon_id": beacon_match,
                "rssi": int(getattr(advertisement_data, "rssi", -200)),
                "seen_at": datetime.now(timezone.utc).isoformat(),
            }
            previous = strongest_by_beacon.get(beacon_match)
            if previous is None or event["rssi"] > previous["rssi"]:
                strongest_by_beacon[beacon_match] = event

        scanner = BleakScanner(detection_callback=_detection_callback)
        await scanner.start()
        await asyncio.sleep(scan_seconds)
        await scanner.stop()

        for event in strongest_by_beacon.values():
            outcome = on_seen(event)
            if inspect.isawaitable(outcome):
                await outcome
