from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional


@dataclass(frozen=True)
class TelemetrySample:
    watch_id: str
    hr_bpm: int
    spo2: float | None
    steps_last_minute: int
    activity_detected: bool
    recorded_at: datetime


class CoercionService:
    """
    Detects emotional coercion scenarios:
    high HR without physical activity.
    """

    def __init__(
        self,
        hr_threshold: int,
        steps_threshold: int,
        alert_cooldown_seconds: int = 180,
    ) -> None:
        self._hr_threshold = hr_threshold
        self._steps_threshold = steps_threshold
        self._alert_cooldown = timedelta(seconds=alert_cooldown_seconds)
        self._last_alert_by_watch: Dict[str, datetime] = {}

    def evaluate(self, sample: TelemetrySample) -> Optional[Dict[str, str | int | float]]:
        if sample.hr_bpm < self._hr_threshold:
            return None
        if sample.activity_detected:
            return None
        if sample.steps_last_minute > self._steps_threshold:
            return None

        now_utc = datetime.now(timezone.utc)
        last_alert = self._last_alert_by_watch.get(sample.watch_id)
        if last_alert and now_utc - last_alert < self._alert_cooldown:
            return None

        self._last_alert_by_watch[sample.watch_id] = now_utc
        return {
            "watch_id": sample.watch_id,
            "hr_bpm": sample.hr_bpm,
            "spo2": sample.spo2 if sample.spo2 is not None else -1,
            "steps_last_minute": sample.steps_last_minute,
            "activity_detected": int(sample.activity_detected),
            "triggered_at": now_utc.isoformat(),
            "kind": "silent_coercion_alert",
        }
