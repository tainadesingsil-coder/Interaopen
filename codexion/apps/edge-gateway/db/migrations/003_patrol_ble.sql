CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT,
    uuid TEXT,
    major INTEGER,
    minor INTEGER,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (type, uuid, major, minor)
);

CREATE INDEX IF NOT EXISTS idx_devices_type_beacon ON devices (type, uuid, major, minor);

CREATE TABLE IF NOT EXISTS patrol_routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rssi_threshold INTEGER NOT NULL DEFAULT -68,
    confirm_readings INTEGER NOT NULL DEFAULT 3,
    debounce_seconds INTEGER NOT NULL DEFAULT 180,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patrol_routes_user ON patrol_routes (user_id, active);

CREATE TABLE IF NOT EXISTS patrol_route_devices (
    route_id TEXT NOT NULL REFERENCES patrol_routes(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    PRIMARY KEY (route_id, device_id)
);

CREATE TABLE IF NOT EXISTS patrol_checkins (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL REFERENCES patrol_routes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    beacon_uuid TEXT NOT NULL,
    beacon_major INTEGER NOT NULL,
    beacon_minor INTEGER NOT NULL,
    rssi INTEGER NOT NULL,
    source TEXT NOT NULL DEFAULT 'ble',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patrol_checkins_route ON patrol_checkins (route_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patrol_checkins_device ON patrol_checkins (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patrol_checkins_debounce ON patrol_checkins (route_id, user_id, device_id, created_at DESC);
