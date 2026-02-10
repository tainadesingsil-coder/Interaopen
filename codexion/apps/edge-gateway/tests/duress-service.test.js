import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import Database from 'better-sqlite3';

import migrationsModule from '../src/migrations.js';
import duressModule from '../src/core/duressService.js';

const { runMigrations } = migrationsModule;
const { DuressService } = duressModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_DIR = path.join(__dirname, '..', 'db', 'migrations');

function createHarness() {
  const db = new Database(':memory:');
  runMigrations(db, MIGRATION_DIR);
  const clock = {
    value: Date.UTC(2026, 1, 10, 12, 0, 0),
  };
  const service = new DuressService({
    db,
    nowFn: () => new Date(clock.value),
    defaultHrThreshold: 120,
    defaultSustainSeconds: 20,
    defaultWindowSeconds: 60,
    defaultMaxStepsDelta: 0,
    defaultCooldownSeconds: 120,
  });
  return { service, clock };
}

function addSample(service, clock, payload) {
  const result = service.ingestTelemetry({
    device_id: 'watch-1',
    hr: payload.hr,
    steps: payload.steps,
    spo2: payload.spo2 ?? 98,
    timestamp: new Date(clock.value).toISOString(),
  });
  clock.value += payload.advanceMs ?? 10000;
  return result;
}

describe('DuressService', () => {
  it('dispara suspeita quando HR fica acima do limiar sem aumento de passos', () => {
    const { service, clock } = createHarness();

    addSample(service, clock, { hr: 125, steps: 1000, advanceMs: 10000 });
    addSample(service, clock, { hr: 128, steps: 1000, advanceMs: 10000 });
    const result = addSample(service, clock, {
      hr: 130,
      steps: 1000,
      advanceMs: 10000,
    });

    expect(result.suspected).toBe(true);
    expect(result.reason).toBe('duress_rule_matched');
    expect(result.summary.steps_delta).toBe(0);
    expect(result.summary.max_high_duration_seconds).toBeGreaterThanOrEqual(20);
  });

  it('nao dispara quando ha atividade detectada por passos', () => {
    const { service, clock } = createHarness();

    addSample(service, clock, { hr: 125, steps: 1000, advanceMs: 10000 });
    addSample(service, clock, { hr: 126, steps: 1010, advanceMs: 10000 });
    const result = addSample(service, clock, {
      hr: 127,
      steps: 1025,
      advanceMs: 10000,
    });

    expect(result.suspected).toBe(false);
    expect(result.reason).toBe('activity_detected_by_steps');
  });

  it('respeita cooldown operacional entre alertas', () => {
    const { service, clock } = createHarness();

    addSample(service, clock, { hr: 130, steps: 2000, advanceMs: 10000 });
    addSample(service, clock, { hr: 132, steps: 2000, advanceMs: 10000 });
    const first = addSample(service, clock, {
      hr: 133,
      steps: 2000,
      advanceMs: 10000,
    });
    expect(first.suspected).toBe(true);

    addSample(service, clock, { hr: 131, steps: 2000, advanceMs: 10000 });
    addSample(service, clock, { hr: 132, steps: 2000, advanceMs: 10000 });
    const second = addSample(service, clock, {
      hr: 134,
      steps: 2000,
      advanceMs: 10000,
    });
    expect(second.suspected).toBe(false);
    expect(second.reason).toBe('cooldown_active');
  });
});
