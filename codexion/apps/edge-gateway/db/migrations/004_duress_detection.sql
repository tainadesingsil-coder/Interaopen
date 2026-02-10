CREATE TABLE IF NOT EXISTS watch_telemetry (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    hr INTEGER NOT NULL,
    steps INTEGER NOT NULL,
    spo2 REAL,
    recorded_at TEXT NOT NULL,
    ingested_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_watch_telemetry_device_time
    ON watch_telemetry (device_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS duress_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hr_threshold INTEGER NOT NULL,
    sustain_seconds INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL DEFAULT 60,
    max_steps_delta INTEGER NOT NULL DEFAULT 0,
    cooldown_seconds INTEGER NOT NULL DEFAULT 180,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_duress_rules_active_updated
    ON duress_rules (active, updated_at DESC);
