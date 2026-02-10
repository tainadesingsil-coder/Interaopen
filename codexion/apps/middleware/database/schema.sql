-- PostgreSQL schema for wearable condo security middleware.
-- Requires PostgreSQL 14+.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS condominiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums (id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    unit_code TEXT NOT NULL,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_levels (
    id SMALLSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS resident_access_levels (
    resident_id UUID NOT NULL REFERENCES residents (id) ON DELETE CASCADE,
    access_level_id SMALLINT NOT NULL REFERENCES access_levels (id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (resident_id, access_level_id)
);

CREATE TABLE IF NOT EXISTS wearables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents (id) ON DELETE SET NULL,
    device_kind TEXT NOT NULL DEFAULT 'watch',
    vendor TEXT NOT NULL DEFAULT 'vvfit-compatible',
    serial_number TEXT,
    mac_address TEXT UNIQUE,
    vvfit_device_id TEXT,
    edge_key_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums (id) ON DELETE CASCADE,
    lock_name TEXT NOT NULL,
    location_description TEXT NOT NULL,
    controller_ip INET,
    controller_port INTEGER,
    status TEXT NOT NULL DEFAULT 'online',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lock_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lock_id UUID NOT NULL REFERENCES locks (id) ON DELETE CASCADE,
    access_level_id SMALLINT NOT NULL REFERENCES access_levels (id) ON DELETE CASCADE,
    allowed_schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (lock_id, access_level_id)
);

CREATE TABLE IF NOT EXISTS access_events (
    id BIGSERIAL PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resident_id UUID REFERENCES residents (id) ON DELETE SET NULL,
    wearable_id UUID REFERENCES wearables (id) ON DELETE SET NULL,
    lock_id UUID REFERENCES locks (id) ON DELETE SET NULL,
    encrypted_uuid_hash TEXT NOT NULL,
    granted BOOLEAN NOT NULL,
    reason TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'edge',
    edge_node_id TEXT
);

CREATE TABLE IF NOT EXISTS visitor_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intercom_event_id TEXT UNIQUE NOT NULL,
    unit_code TEXT NOT NULL,
    visitor_name TEXT NOT NULL,
    camera_snapshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    decided_by_resident_id UUID REFERENCES residents (id) ON DELETE SET NULL,
    target_lock_id UUID REFERENCES locks (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS guard_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID REFERENCES residents (id) ON DELETE SET NULL,
    guard_code TEXT UNIQUE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums (id) ON DELETE CASCADE,
    checkpoint_name TEXT NOT NULL,
    area_code TEXT NOT NULL,
    beacon_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patrol_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums (id) ON DELETE CASCADE,
    route_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patrol_route_checkpoints (
    route_id UUID NOT NULL REFERENCES patrol_routes (id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES security_checkpoints (id) ON DELETE CASCADE,
    sequence_no INTEGER NOT NULL,
    PRIMARY KEY (route_id, checkpoint_id)
);

CREATE TABLE IF NOT EXISTS patrol_checkins (
    id BIGSERIAL PRIMARY KEY,
    guard_profile_id UUID REFERENCES guard_profiles (id) ON DELETE SET NULL,
    checkpoint_id UUID REFERENCES security_checkpoints (id) ON DELETE SET NULL,
    beacon_rssi INTEGER NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL DEFAULT 'ble-proximity'
);

CREATE TABLE IF NOT EXISTS telemetry_samples (
    id BIGSERIAL PRIMARY KEY,
    wearable_id UUID REFERENCES wearables (id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    hr_bpm INTEGER,
    spo2 NUMERIC(5,2),
    steps_total INTEGER,
    steps_last_minute INTEGER,
    activity_detected BOOLEAN NOT NULL DEFAULT FALSE,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coercion_alerts (
    id BIGSERIAL PRIMARY KEY,
    wearable_id UUID REFERENCES wearables (id) ON DELETE SET NULL,
    telemetry_sample_id BIGINT REFERENCES telemetry_samples (id) ON DELETE SET NULL,
    hr_bpm INTEGER NOT NULL,
    steps_last_minute INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'triggered',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS edge_outbox (
    id UUID PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced BOOLEAN NOT NULL DEFAULT FALSE,
    synced_at TIMESTAMPTZ,
    last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_residents_condominium ON residents (condominium_id);
CREATE INDEX IF NOT EXISTS idx_wearables_resident ON wearables (resident_id);
CREATE INDEX IF NOT EXISTS idx_access_events_time ON access_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_events_lock ON access_events (lock_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_calls_status ON visitor_calls (status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_patrol_checkins_guard_time ON patrol_checkins (guard_profile_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_wearable_time ON telemetry_samples (wearable_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_coercion_alerts_status ON coercion_alerts (status, triggered_at DESC);
