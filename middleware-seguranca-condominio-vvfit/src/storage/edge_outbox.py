from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List
from uuid import uuid4


class EdgeOutbox:
    """Local-first outbox for buffering critical events while offline."""

    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._connection = sqlite3.connect(str(db_path), check_same_thread=False)
        self._connection.row_factory = sqlite3.Row
        self._create_schema()

    def _create_schema(self) -> None:
        with self._lock:
            self._connection.execute(
                """
                CREATE TABLE IF NOT EXISTS outbox_events (
                    id TEXT PRIMARY KEY,
                    event_type TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    synced INTEGER NOT NULL DEFAULT 0,
                    synced_at TEXT,
                    last_error TEXT
                );
                """
            )
            self._connection.commit()

    def append_event(self, event_type: str, payload: Dict[str, Any]) -> str:
        event_id = str(uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        with self._lock:
            self._connection.execute(
                """
                INSERT INTO outbox_events (id, event_type, payload_json, created_at, synced)
                VALUES (?, ?, ?, ?, 0);
                """,
                (event_id, event_type, json.dumps(payload, ensure_ascii=True), created_at),
            )
            self._connection.commit()
        return event_id

    def list_unsynced(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._lock:
            rows = self._connection.execute(
                """
                SELECT id, event_type, payload_json, created_at
                FROM outbox_events
                WHERE synced = 0
                ORDER BY created_at ASC
                LIMIT ?;
                """,
                (limit,),
            ).fetchall()
        return [
            {
                "id": row["id"],
                "event_type": row["event_type"],
                "payload": json.loads(row["payload_json"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]

    def mark_synced(self, event_id: str) -> None:
        synced_at = datetime.now(timezone.utc).isoformat()
        with self._lock:
            self._connection.execute(
                """
                UPDATE outbox_events
                SET synced = 1, synced_at = ?, last_error = NULL
                WHERE id = ?;
                """,
                (synced_at, event_id),
            )
            self._connection.commit()

    def mark_error(self, event_id: str, error_message: str) -> None:
        with self._lock:
            self._connection.execute(
                """
                UPDATE outbox_events
                SET last_error = ?
                WHERE id = ?;
                """,
                (error_message[:400], event_id),
            )
            self._connection.commit()
