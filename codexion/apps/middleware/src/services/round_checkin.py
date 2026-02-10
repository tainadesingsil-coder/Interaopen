from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, Optional


class RoundCheckinService:
    """Creates guard check-ins from BLE beacon proximity sightings."""

    def __init__(
        self,
        beacon_checkpoint_map: Dict[str, str],
        min_rssi: int,
        cooldown_seconds: int,
    ) -> None:
        self._beacon_checkpoint_map = beacon_checkpoint_map
        self._min_rssi = min_rssi
        self._cooldown = timedelta(seconds=cooldown_seconds)
        self._last_checkin_by_guard_and_checkpoint: Dict[str, datetime] = {}

    def register_sighting(
        self,
        guard_id: str,
        beacon_id: str,
        rssi: int,
        observed_at: datetime | None = None,
    ) -> Optional[Dict[str, str | int]]:
        if rssi < self._min_rssi:
            return None
        checkpoint = self._beacon_checkpoint_map.get(beacon_id)
        if checkpoint is None:
            return None

        current_time = observed_at or datetime.now(timezone.utc)
        key = f"{guard_id}:{checkpoint}"
        last = self._last_checkin_by_guard_and_checkpoint.get(key)
        if last and current_time - last < self._cooldown:
            return None

        self._last_checkin_by_guard_and_checkpoint[key] = current_time
        return {
            "guard_id": guard_id,
            "beacon_id": beacon_id,
            "checkpoint": checkpoint,
            "rssi": rssi,
            "checked_in_at": current_time.isoformat(),
        }
