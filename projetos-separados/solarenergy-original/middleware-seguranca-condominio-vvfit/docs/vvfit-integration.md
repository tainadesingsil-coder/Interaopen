# Vvfit Integration Scheme (Telemetry + Commands)

This document describes how to ingest Vvfit-compatible wearable data and how to send commands (write characteristic) back to the watch.

## 1) Integration modes

### Mode A - SDK/API available
1. Portaria backend receives data from Vvfit SDK/API (HR, SpO2, steps, battery).
2. Adapter normalizes payloads into middleware format.
3. Middleware stores payload in `telemetry_samples`.
4. Coercion engine checks HR spike without activity and creates `coercion_alerts`.

### Mode B - No public API (direct BLE interception)
1. Edge node uses `BleakClient.start_notify()` on watch notification characteristic.
2. Notification packets are parsed as JSON (or decrypted if wrapped as AES envelope).
3. Telemetry packets are written to local outbox + persisted to DB when connected.
4. Commands to the watch are sent with `write_gatt_char()` (write characteristic).

## 2) BLE characteristics used

- Service UUID (default): `0000fee0-0000-1000-8000-00805f9b34fb`
- Notify characteristic (watch -> edge): `0000fee1-0000-1000-8000-00805f9b34fb`
- Write characteristic (edge -> watch): `0000fee2-0000-1000-8000-00805f9b34fb`

> Replace UUIDs with exact values discovered in your hardware model.

## 3) Packet normalization contract

Expected telemetry packet:

```json
{
  "type": "telemetry",
  "watch_id": "watch-01",
  "hr_bpm": 142,
  "spo2": 97.4,
  "steps_last_minute": 2,
  "activity_detected": false,
  "recorded_at": "2026-02-10T18:31:00Z"
}
```

Expected intercom decision packet:

```json
{
  "type": "intercom_decision",
  "event_id": "f40b91e3-6f83-4f49-8ef8-8a6f02051fe8",
  "watch_id": "watch-01",
  "decision": "approve"
}
```

## 4) Write characteristic command for haptic alert

When a visitor arrives, middleware sends:

```json
{
  "type": "visitor_alert",
  "title": "Visitante na portaria",
  "message": "Joao solicitando acesso para unidade 1203.",
  "context": {
    "event_id": "f40b91e3-6f83-4f49-8ef8-8a6f02051fe8",
    "actions": ["approve", "deny"]
  }
}
```

This payload is encoded as UTF-8 and sent via `write_gatt_char()` to trigger vibration and action screen on the wearable.

## 5) Telemetry mapping to database

| Vvfit field           | Middleware field      | PostgreSQL table      |
|-----------------------|-----------------------|-----------------------|
| heart_rate            | hr_bpm                | telemetry_samples     |
| oxygen_saturation     | spo2                  | telemetry_samples     |
| steps                 | steps_total           | telemetry_samples     |
| steps_per_minute      | steps_last_minute     | telemetry_samples     |
| movement_flag         | activity_detected     | telemetry_samples     |
| generated_alert       | status=triggered      | coercion_alerts       |

## 6) Local-first behavior

Critical actions (lock release, intercom decision, coercion alerts) are always queued in local SQLite outbox (`runtime/edge_outbox.db`) before any cloud sync attempt.

If internet is down:
- gate opening still executes in LAN,
- watch still receives intercom haptic command by BLE,
- security logs stay buffered locally until synchronization recovers.
