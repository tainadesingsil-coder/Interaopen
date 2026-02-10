CREATE TABLE IF NOT EXISTS watch_sessions (
    device_id TEXT PRIMARY KEY,
    device_name TEXT,
    connected INTEGER NOT NULL DEFAULT 0,
    battery_level INTEGER,
    last_hr INTEGER,
    last_steps INTEGER,
    last_spo2 REAL,
    connected_at TEXT,
    disconnected_at TEXT,
    last_seen_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_watch_sessions_connected ON watch_sessions (connected, updated_at DESC);

CREATE TABLE IF NOT EXISTS watch_heartbeats (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES watch_sessions(device_id) ON DELETE CASCADE,
    battery_level INTEGER,
    hr INTEGER,
    steps INTEGER,
    spo2 REAL,
    recorded_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_watch_heartbeats_device_time
    ON watch_heartbeats (device_id, created_at DESC);
