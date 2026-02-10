BEGIN TRANSACTION;

CREATE TABLE commands_v2 (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'dispatched', 'success', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 5,
    next_attempt_at TEXT,
    last_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT INTO commands_v2 (
    id,
    type,
    payload_json,
    status,
    retry_count,
    max_retries,
    next_attempt_at,
    last_error,
    created_at,
    updated_at
)
SELECT
    id,
    type,
    payload_json,
    CASE
        WHEN status = 'fail' THEN 'failed'
        ELSE status
    END AS status,
    0 AS retry_count,
    5 AS max_retries,
    updated_at AS next_attempt_at,
    NULL AS last_error,
    created_at,
    updated_at
FROM commands;

DROP TABLE commands;
ALTER TABLE commands_v2 RENAME TO commands;

CREATE INDEX IF NOT EXISTS idx_commands_created_at ON commands (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commands_status ON commands (status);
CREATE INDEX IF NOT EXISTS idx_commands_next_attempt ON commands (next_attempt_at);

COMMIT;
