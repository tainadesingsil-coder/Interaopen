from __future__ import annotations

import base64
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict

from dotenv import load_dotenv

load_dotenv()


def _default_dev_key_b64() -> str:
    # Development-only fallback to avoid boot crashes in local scaffold mode.
    return base64.b64encode(bytes.fromhex("00" * 32)).decode("ascii")


def _parse_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def _parse_guard_map(raw_value: str) -> Dict[str, str]:
    if not raw_value.strip():
        return {}
    try:
        parsed = json.loads(raw_value)
    except json.JSONDecodeError:
        return {}
    if not isinstance(parsed, dict):
        return {}
    result: Dict[str, str] = {}
    for key, value in parsed.items():
        result[str(key)] = str(value)
    return result


@dataclass(frozen=True)
class Settings:
    api_host: str
    api_port: int
    aes256_key_b64: str
    watch_mac_address: str
    vvfit_service_uuid: str
    vvfit_notify_char_uuid: str
    vvfit_write_char_uuid: str
    coercion_hr_threshold: int
    coercion_steps_threshold: int
    beacon_rssi_threshold: int
    beacon_checkin_cooldown_seconds: int
    outbox_db_path: Path
    outbox_sync_interval_seconds: int
    cloud_sync_url: str
    intercom_decision_url: str
    authorized_uuids_raw: str
    guard_beacon_map: Dict[str, str]


def load_settings() -> Settings:
    outbox_db_path = Path(os.getenv("OUTBOX_DB_PATH", "./runtime/edge_outbox.db")).resolve()
    guard_map_raw = os.getenv("GUARD_BEACON_MAP", "{}")
    return Settings(
        api_host=os.getenv("API_HOST", "0.0.0.0"),
        api_port=_parse_int("API_PORT", 8081),
        aes256_key_b64=os.getenv("EDGE_AES256_KEY_B64", _default_dev_key_b64()),
        watch_mac_address=os.getenv("WATCH_MAC_ADDRESS", "").strip(),
        vvfit_service_uuid=os.getenv(
            "VVFIT_SERVICE_UUID", "0000fee0-0000-1000-8000-00805f9b34fb"
        ).strip(),
        vvfit_notify_char_uuid=os.getenv(
            "VVFIT_NOTIFY_CHAR_UUID", "0000fee1-0000-1000-8000-00805f9b34fb"
        ).strip(),
        vvfit_write_char_uuid=os.getenv(
            "VVFIT_WRITE_CHAR_UUID", "0000fee2-0000-1000-8000-00805f9b34fb"
        ).strip(),
        coercion_hr_threshold=_parse_int("COERCION_HR_THRESHOLD", 130),
        coercion_steps_threshold=_parse_int("COERCION_STEPS_THRESHOLD", 15),
        beacon_rssi_threshold=_parse_int("BEACON_RSSI_THRESHOLD", -68),
        beacon_checkin_cooldown_seconds=_parse_int("BEACON_CHECKIN_COOLDOWN_SECONDS", 120),
        outbox_db_path=outbox_db_path,
        outbox_sync_interval_seconds=_parse_int("OUTBOX_SYNC_INTERVAL_SECONDS", 15),
        cloud_sync_url=os.getenv("CLOUD_SYNC_URL", "").strip(),
        intercom_decision_url=os.getenv("INTERCOM_DECISION_URL", "").strip(),
        authorized_uuids_raw=os.getenv("AUTHORIZED_UUIDS", "").strip(),
        guard_beacon_map=_parse_guard_map(guard_map_raw),
    )
