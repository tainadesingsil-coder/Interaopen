const { randomUUID } = require('crypto');

function toIso(timestampRaw) {
  if (!timestampRaw) {
    return new Date().toISOString();
  }
  const date = new Date(timestampRaw);
  if (Number.isNaN(date.getTime())) {
    throw new Error('timestamp is invalid');
  }
  return date.toISOString();
}

function clampNumber(value, { min, max, fallback }) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

class DuressService {
  constructor(options) {
    this.db = options.db;
    this.nowFn = options.nowFn || (() => new Date());
    this.lastAlertByDevice = new Map();
    this.defaultRuleName = options.defaultRuleName || 'Padrao Portaria';
    this.defaultHrThreshold = Number(options.defaultHrThreshold || 130);
    this.defaultSustainSeconds = Number(options.defaultSustainSeconds || 20);
    this.defaultWindowSeconds = Number(options.defaultWindowSeconds || 60);
    this.defaultMaxStepsDelta = Number(options.defaultMaxStepsDelta || 0);
    this.defaultCooldownSeconds = Number(options.defaultCooldownSeconds || 180);

    this._prepareStatements();
    this.ensureDefaultRule();
  }

  _nowIso() {
    return this.nowFn().toISOString();
  }

  _prepareStatements() {
    this.insertTelemetryStmt = this.db.prepare(
      `
      INSERT INTO watch_telemetry (
        id, device_id, hr, steps, spo2, recorded_at, ingested_at
      )
      VALUES (
        @id, @device_id, @hr, @steps, @spo2, @recorded_at, @ingested_at
      )
    `
    );
    this.listTelemetryWindowStmt = this.db.prepare(
      `
      SELECT id, device_id, hr, steps, spo2, recorded_at, ingested_at
      FROM watch_telemetry
      WHERE device_id = ? AND recorded_at >= ? AND recorded_at <= ?
      ORDER BY recorded_at ASC
    `
    );
    this.listRulesStmt = this.db.prepare(
      `
      SELECT
        id, name, hr_threshold, sustain_seconds, window_seconds,
        max_steps_delta, cooldown_seconds, active, created_at, updated_at
      FROM duress_rules
      ORDER BY active DESC, updated_at DESC
    `
    );
    this.getRuleByIdStmt = this.db.prepare(
      `
      SELECT
        id, name, hr_threshold, sustain_seconds, window_seconds,
        max_steps_delta, cooldown_seconds, active, created_at, updated_at
      FROM duress_rules
      WHERE id = ?
    `
    );
    this.getActiveRuleStmt = this.db.prepare(
      `
      SELECT
        id, name, hr_threshold, sustain_seconds, window_seconds,
        max_steps_delta, cooldown_seconds, active, created_at, updated_at
      FROM duress_rules
      WHERE active = 1
      ORDER BY updated_at DESC
      LIMIT 1
    `
    );
    this.insertRuleStmt = this.db.prepare(
      `
      INSERT INTO duress_rules (
        id, name, hr_threshold, sustain_seconds, window_seconds,
        max_steps_delta, cooldown_seconds, active, created_at, updated_at
      )
      VALUES (
        @id, @name, @hr_threshold, @sustain_seconds, @window_seconds,
        @max_steps_delta, @cooldown_seconds, @active, @created_at, @updated_at
      )
    `
    );
    this.updateRuleStmt = this.db.prepare(
      `
      UPDATE duress_rules
      SET
        name = @name,
        hr_threshold = @hr_threshold,
        sustain_seconds = @sustain_seconds,
        window_seconds = @window_seconds,
        max_steps_delta = @max_steps_delta,
        cooldown_seconds = @cooldown_seconds,
        active = @active,
        updated_at = @updated_at
      WHERE id = @id
    `
    );
    this.deactivateAllRulesStmt = this.db.prepare(
      `
      UPDATE duress_rules
      SET active = 0, updated_at = ?
    `
    );
    this.countRulesStmt = this.db.prepare(
      `
      SELECT COUNT(*) AS count
      FROM duress_rules
    `
    );
  }

  _mapRule(row) {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      name: row.name,
      hr_threshold: row.hr_threshold,
      sustain_seconds: row.sustain_seconds,
      window_seconds: row.window_seconds,
      max_steps_delta: row.max_steps_delta,
      cooldown_seconds: row.cooldown_seconds,
      active: Boolean(row.active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  ensureDefaultRule() {
    const count = this.countRulesStmt.get().count;
    if (count > 0) {
      return;
    }
    const timestamp = this._nowIso();
    this.insertRuleStmt.run({
      id: randomUUID(),
      name: this.defaultRuleName,
      hr_threshold: this.defaultHrThreshold,
      sustain_seconds: this.defaultSustainSeconds,
      window_seconds: this.defaultWindowSeconds,
      max_steps_delta: this.defaultMaxStepsDelta,
      cooldown_seconds: this.defaultCooldownSeconds,
      active: 1,
      created_at: timestamp,
      updated_at: timestamp,
    });
  }

  listRules() {
    return this.listRulesStmt.all().map((row) => this._mapRule(row));
  }

  getActiveRule() {
    return this._mapRule(this.getActiveRuleStmt.get());
  }

  upsertRule(payload) {
    const idRaw = String(payload?.id || '').trim();
    const existing = idRaw ? this.getRuleByIdStmt.get(idRaw) : null;
    const timestamp = this._nowIso();

    const active = payload?.active === false ? 0 : 1;
    const base = existing || this.getActiveRuleStmt.get() || {};

    const ruleData = {
      id: existing ? existing.id : idRaw || randomUUID(),
      name: String(payload?.name || base.name || this.defaultRuleName).trim(),
      hr_threshold: clampNumber(payload?.hr_threshold ?? base.hr_threshold, {
        min: 60,
        max: 240,
        fallback: this.defaultHrThreshold,
      }),
      sustain_seconds: clampNumber(payload?.sustain_seconds ?? base.sustain_seconds, {
        min: 5,
        max: 300,
        fallback: this.defaultSustainSeconds,
      }),
      window_seconds: clampNumber(payload?.window_seconds ?? base.window_seconds, {
        min: 30,
        max: 300,
        fallback: this.defaultWindowSeconds,
      }),
      max_steps_delta: clampNumber(payload?.max_steps_delta ?? base.max_steps_delta, {
        min: 0,
        max: 2000,
        fallback: this.defaultMaxStepsDelta,
      }),
      cooldown_seconds: clampNumber(payload?.cooldown_seconds ?? base.cooldown_seconds, {
        min: 0,
        max: 3600,
        fallback: this.defaultCooldownSeconds,
      }),
      active,
      created_at: existing?.created_at || timestamp,
      updated_at: timestamp,
    };

    const tx = this.db.transaction(() => {
      if (ruleData.active === 1) {
        this.deactivateAllRulesStmt.run(timestamp);
      }
      if (existing) {
        this.updateRuleStmt.run(ruleData);
      } else {
        this.insertRuleStmt.run(ruleData);
      }
    });
    tx();

    return this._mapRule(this.getRuleByIdStmt.get(ruleData.id));
  }

  ingestTelemetry(payload) {
    const deviceId = String(payload?.device_id || '').trim();
    if (!deviceId) {
      throw new Error('device_id is required');
    }

    const hr = clampNumber(payload?.hr, {
      min: 0,
      max: 260,
      fallback: Number.NaN,
    });
    const steps = clampNumber(payload?.steps, {
      min: 0,
      max: 10000000,
      fallback: Number.NaN,
    });
    if (!Number.isFinite(hr)) {
      throw new Error('hr is required');
    }
    if (!Number.isFinite(steps)) {
      throw new Error('steps is required');
    }

    const spo2Raw = payload?.spo2;
    const spo2 =
      spo2Raw === null || spo2Raw === undefined
        ? null
        : clampNumber(spo2Raw, {
            min: 50,
            max: 100,
            fallback: null,
          });
    const recordedAt = toIso(payload?.timestamp);
    const ingestedAt = this._nowIso();

    const sample = {
      id: randomUUID(),
      device_id: deviceId,
      hr: Number(hr),
      steps: Number(steps),
      spo2: spo2 === null ? null : Number(spo2),
      recorded_at: recordedAt,
      ingested_at: ingestedAt,
    };
    this.insertTelemetryStmt.run(sample);

    const rule = this.getActiveRule();
    if (!rule) {
      return {
        sample,
        rule: null,
        suspected: false,
        reason: 'no_active_rule',
      };
    }

    const windowStartIso = new Date(
      Date.parse(recordedAt) - rule.window_seconds * 1000
    ).toISOString();
    const windowSamples = this.listTelemetryWindowStmt.all(
      deviceId,
      windowStartIso,
      recordedAt
    );

    const evaluation = this._evaluateWindow(windowSamples, rule);
    if (!evaluation.suspected) {
      return {
        sample,
        rule,
        suspected: false,
        reason: evaluation.reason,
        summary: evaluation.summary,
      };
    }

    const nowMs = Date.parse(recordedAt);
    const lastAlert = this.lastAlertByDevice.get(deviceId);
    if (
      Number.isFinite(lastAlert) &&
      nowMs - lastAlert < rule.cooldown_seconds * 1000
    ) {
      return {
        sample,
        rule,
        suspected: false,
        reason: 'cooldown_active',
        summary: evaluation.summary,
      };
    }

    this.lastAlertByDevice.set(deviceId, nowMs);
    return {
      sample,
      rule,
      suspected: true,
      reason: 'duress_rule_matched',
      summary: evaluation.summary,
    };
  }

  _evaluateWindow(samples, rule) {
    if (!samples || samples.length < 2) {
      return {
        suspected: false,
        reason: 'insufficient_samples',
        summary: {
          sample_count: samples?.length || 0,
          max_high_duration_seconds: 0,
          steps_delta: 0,
        },
      };
    }

    let minSteps = Number.POSITIVE_INFINITY;
    let maxSteps = Number.NEGATIVE_INFINITY;
    let segmentStartMs = null;
    let segmentEndMs = null;
    let maxHighMs = 0;

    for (const row of samples) {
      const rowSteps = Number(row.steps);
      minSteps = Math.min(minSteps, rowSteps);
      maxSteps = Math.max(maxSteps, rowSteps);

      const rowTimeMs = Date.parse(row.recorded_at);
      if (Number(row.hr) > Number(rule.hr_threshold)) {
        if (segmentStartMs === null) {
          segmentStartMs = rowTimeMs;
        }
        segmentEndMs = rowTimeMs;
      } else if (segmentStartMs !== null && segmentEndMs !== null) {
        maxHighMs = Math.max(maxHighMs, segmentEndMs - segmentStartMs);
        segmentStartMs = null;
        segmentEndMs = null;
      }
    }

    if (segmentStartMs !== null && segmentEndMs !== null) {
      maxHighMs = Math.max(maxHighMs, segmentEndMs - segmentStartMs);
    }

    const stepsDelta = maxSteps - minSteps;
    if (stepsDelta > Number(rule.max_steps_delta)) {
      return {
        suspected: false,
        reason: 'activity_detected_by_steps',
        summary: {
          sample_count: samples.length,
          max_high_duration_seconds: Number((maxHighMs / 1000).toFixed(1)),
          steps_delta: stepsDelta,
        },
      };
    }

    if (maxHighMs < Number(rule.sustain_seconds) * 1000) {
      return {
        suspected: false,
        reason: 'hr_not_sustained',
        summary: {
          sample_count: samples.length,
          max_high_duration_seconds: Number((maxHighMs / 1000).toFixed(1)),
          steps_delta: stepsDelta,
        },
      };
    }

    return {
      suspected: true,
      reason: 'matched',
      summary: {
        sample_count: samples.length,
        max_high_duration_seconds: Number((maxHighMs / 1000).toFixed(1)),
        steps_delta: stepsDelta,
      },
    };
  }
}

module.exports = {
  DuressService,
};
