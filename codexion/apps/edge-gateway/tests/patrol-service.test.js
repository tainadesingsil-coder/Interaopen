import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import Database from 'better-sqlite3';

import migrationsModule from '../src/migrations.js';
import patrolModule from '../src/core/patrolService.js';

const { runMigrations } = migrationsModule;
const { PatrolService } = patrolModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_DIR = path.join(__dirname, '..', 'db', 'migrations');

function createPatrolHarness() {
  const db = new Database(':memory:');
  runMigrations(db, MIGRATION_DIR);

  const clock = {
    value: Date.UTC(2026, 1, 10, 12, 0, 0),
  };
  const emitted = [];
  const createdEvents = [];

  const service = new PatrolService({
    db,
    nowFn: () => new Date(clock.value),
    createEvent: (type, payload) => {
      const event = {
        id: `evt-${createdEvents.length + 1}`,
        type,
        payload,
        created_at: new Date(clock.value).toISOString(),
      };
      createdEvents.push(event);
      return event;
    },
    notifyEvent: (event) => emitted.push(event),
  });

  return {
    db,
    service,
    clock,
    emitted,
    createdEvents,
  };
}

describe('PatrolService BLE checkin rules', () => {
  it('registra checkin somente apos 3 leituras acima do limiar', () => {
    const harness = createPatrolHarness();
    harness.service.upsertRoute({
      route_id: 'route-1',
      name: 'Ronda Noturna',
      user_id: 'guard-01',
      rssi_threshold: -68,
      confirm_readings: 3,
      debounce_seconds: 180,
      beacons: [
        {
          uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
          major: 100,
          minor: 7,
          name: 'Portao Norte',
        },
      ],
    });

    const reading = {
      uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
      major: 100,
      minor: 7,
      rssi: -62,
    };

    const first = harness.service.processBeaconReading(reading);
    const second = harness.service.processBeaconReading(reading);
    const third = harness.service.processBeaconReading(reading);

    expect(first.checkins.length).toBe(0);
    expect(second.checkins.length).toBe(0);
    expect(third.checkins.length).toBe(1);
    expect(third.checkins[0].created).toBe(true);
    expect(harness.emitted[0].type).toBe('patrol.checkin');
  });

  it('aplica debounce de 3 minutos para o mesmo beacon', () => {
    const harness = createPatrolHarness();
    harness.service.upsertRoute({
      route_id: 'route-2',
      name: 'Ronda Torre B',
      user_id: 'guard-02',
      rssi_threshold: -70,
      confirm_readings: 3,
      debounce_seconds: 180,
      beacons: [
        {
          uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
          major: 100,
          minor: 8,
        },
      ],
    });

    const reading = {
      uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
      major: 100,
      minor: 8,
      rssi: -63,
    };

    harness.service.processBeaconReading(reading);
    harness.service.processBeaconReading(reading);
    const initial = harness.service.processBeaconReading(reading);
    expect(initial.checkins[0].created).toBe(true);

    harness.service.processBeaconReading(reading);
    harness.service.processBeaconReading(reading);
    const blocked = harness.service.processBeaconReading(reading);
    expect(blocked.checkins[0].created).toBe(false);
    expect(blocked.checkins[0].reason).toBe('debounced');

    harness.clock.value += 181 * 1000;
    harness.service.processBeaconReading(reading);
    harness.service.processBeaconReading(reading);
    const afterDebounce = harness.service.processBeaconReading(reading);
    expect(afterDebounce.checkins[0].created).toBe(true);
  });
});
