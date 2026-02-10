from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional


def parse_authorized_uuids(raw_value: str) -> Dict[str, str]:
    """
    Parse map in format: "uuid_a:resident_1,uuid_b:resident_2".
    """
    result: Dict[str, str] = {}
    if not raw_value.strip():
        return result
    for pair in raw_value.split(","):
        piece = pair.strip()
        if not piece:
            continue
        if ":" not in piece:
            continue
        uuid_plain, resident_id = piece.split(":", maxsplit=1)
        uuid_plain = uuid_plain.strip()
        resident_id = resident_id.strip()
        if uuid_plain and resident_id:
            result[uuid_plain] = resident_id
    return result


@dataclass(frozen=True)
class AccessDecision:
    granted: bool
    reason: str
    resident_id: Optional[str]
    lock_id: str


class AccessControlService:
    """Validates encrypted UUID payloads coming from wearable devices."""

    def __init__(self, authorized_uuid_map: Dict[str, str]) -> None:
        self._authorized_uuid_map = authorized_uuid_map

    async def evaluate_access(
        self,
        encrypted_uuid_plain: str,
        lock_id: str,
        resident_id: str | None,
    ) -> AccessDecision:
        expected_resident = self._authorized_uuid_map.get(encrypted_uuid_plain)
        if expected_resident is None:
            return AccessDecision(
                granted=False,
                reason="uuid_not_registered",
                resident_id=resident_id,
                lock_id=lock_id,
            )

        if resident_id and resident_id != expected_resident:
            return AccessDecision(
                granted=False,
                reason="uuid_resident_mismatch",
                resident_id=resident_id,
                lock_id=lock_id,
            )

        return AccessDecision(
            granted=True,
            reason="access_granted",
            resident_id=expected_resident,
            lock_id=lock_id,
        )
