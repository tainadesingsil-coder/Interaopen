const { randomUUID } = require('crypto');

function normalizeUuid(uuidRaw) {
  const hex = String(uuidRaw || '')
    .toLowerCase()
    .replace(/[^0-9a-f]/g, '');
  if (hex.length !== 32) {
    return null;
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseBeaconIdentity(input) {
  const uuid = normalizeUuid(input?.uuid);
  const major = Number.parseInt(String(input?.major), 10);
  const minor = Number.parseInt(String(input?.minor), 10);
  if (!uuid || !Number.isFinite(major) || !Number.isFinite(minor)) {
    return null;
  }
  return { uuid, major, minor };
}

class PatrolService {
  constructor(options) {
    this.db = options.db;
    this.createEvent = options.createEvent;
    this.notifyEvent = options.notifyEvent;
    this.logger = options.logger || console;
    this.nowFn = options.nowFn || (() => new Date());
    this.defaultRssiThreshold = Number(options.defaultRssiThreshold ?? -68);
    this.defaultConfirmReadings = Number(options.defaultConfirmReadings ?? 3);
    this.defaultDebounceSeconds = Number(options.defaultDebounceSeconds ?? 180);
    this.proximityCounters = new Map();

    this._prepareStatements();
  }

  _nowIso() {
    return this.nowFn().toISOString();
  }

  _prepareStatements() {
    this.upsertRouteStmt = this.db.prepare(
      `
      INSERT INTO patrol_routes (
        id, name, user_id, rssi_threshold, confirm_readings, debounce_seconds,
        active, created_at, updated_at
      )
      VALUES (
        @id, @name, @user_id, @rssi_threshold, @confirm_readings, @debounce_seconds,
        @active, @created_at, @updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        user_id = excluded.user_id,
        rssi_threshold = excluded.rssi_threshold,
        confirm_readings = excluded.confirm_readings,
        debounce_seconds = excluded.debounce_seconds,
        active = excluded.active,
        updated_at = excluded.updated_at
    `
    );
    this.getRouteStmt = this.db.prepare(
      `
      SELECT
        id, name, user_id, rssi_threshold, confirm_readings, debounce_seconds, active,
        created_at, updated_at
      FROM patrol_routes
      WHERE id = ?
    `
    );
    this.clearRouteBeaconsStmt = this.db.prepare(
      `
      DELETE FROM patrol_route_devices
      WHERE route_id = ?
    `
    );
    this.insertOrUpdateBeaconStmt = this.db.prepare(
      `
      INSERT INTO devices (
        id, type, name, uuid, major, minor, metadata_json, created_at, updated_at
      )
      VALUES (
        @id, 'beacon', @name, @uuid, @major, @minor, @metadata_json, @created_at, @updated_at
      )
      ON CONFLICT(type, uuid, major, minor) DO UPDATE SET
        name = excluded.name,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at
    `
    );
    this.selectBeaconStmt = this.db.prepare(
      `
      SELECT id, type, name, uuid, major, minor, metadata_json
      FROM devices
      WHERE type = 'beacon' AND uuid = ? AND major = ? AND minor = ?
    `
    );
    this.linkRouteBeaconStmt = this.db.prepare(
      `
      INSERT OR IGNORE INTO patrol_route_devices (route_id, device_id)
      VALUES (?, ?)
    `
    );
    this.listRouteBeaconsStmt = this.db.prepare(
      `
      SELECT
        d.id AS device_id,
        d.name AS beacon_name,
        d.uuid,
        d.major,
        d.minor
      FROM patrol_route_devices prd
      JOIN devices d ON d.id = prd.device_id
      WHERE prd.route_id = ?
      ORDER BY d.name ASC, d.uuid ASC
    `
    );
    this.findRouteMatchesByBeaconStmt = this.db.prepare(
      `
      SELECT
        pr.id AS route_id,
        pr.name AS route_name,
        pr.user_id,
        pr.rssi_threshold,
        pr.confirm_readings,
        pr.debounce_seconds,
        d.id AS device_id,
        d.name AS beacon_name,
        d.uuid,
        d.major,
        d.minor
      FROM patrol_routes pr
      JOIN patrol_route_devices prd ON pr.id = prd.route_id
      JOIN devices d ON d.id = prd.device_id
      WHERE
        pr.active = 1
        AND d.type = 'beacon'
        AND d.uuid = ?
        AND d.major = ?
        AND d.minor = ?
    `
    );
    this.findManualRouteMatchStmt = this.db.prepare(
      `
      SELECT
        pr.id AS route_id,
        pr.name AS route_name,
        pr.user_id,
        pr.rssi_threshold,
        pr.confirm_readings,
        pr.debounce_seconds,
        d.id AS device_id,
        d.name AS beacon_name,
        d.uuid,
        d.major,
        d.minor
      FROM patrol_routes pr
      JOIN patrol_route_devices prd ON pr.id = prd.route_id
      JOIN devices d ON d.id = prd.device_id
      WHERE
        pr.active = 1
        AND d.type = 'beacon'
        AND d.uuid = ?
        AND d.major = ?
        AND d.minor = ?
        AND (? IS NULL OR pr.id = ?)
        AND (? IS NULL OR pr.user_id = ?)
      ORDER BY pr.updated_at DESC
      LIMIT 1
    `
    );
    this.getLastCheckinStmt = this.db.prepare(
      `
      SELECT created_at
      FROM patrol_checkins
      WHERE route_id = ? AND user_id = ? AND device_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `
    );
    this.insertCheckinStmt = this.db.prepare(
      `
      INSERT INTO patrol_checkins (
        id, route_id, user_id, device_id, beacon_uuid, beacon_major, beacon_minor, rssi, source, created_at
      )
      VALUES (
        @id, @route_id, @user_id, @device_id, @beacon_uuid, @beacon_major, @beacon_minor, @rssi, @source, @created_at
      )
    `
    );
  }

  _sanitizeRouteInput(payload) {
    const routeName = String(payload?.name || '').trim();
    const userId = String(payload?.user_id || '').trim();
    const routeId = String(payload?.route_id || '').trim() || randomUUID();

    if (!routeName) {
      throw new Error('name is required');
    }
    if (!userId) {
      throw new Error('user_id is required');
    }

    const beaconsRaw = Array.isArray(payload?.beacons) ? payload.beacons : [];
    if (beaconsRaw.length === 0) {
      throw new Error('beacons is required and must be a non-empty array');
    }

    const beacons = beaconsRaw.map((item) => {
      const beacon = parseBeaconIdentity(item);
      if (!beacon) {
        throw new Error('beacons entries must have valid uuid, major and minor');
      }
      return {
        ...beacon,
        name: String(item?.name || item?.label || '').trim() || null,
      };
    });

    const thresholdValue = Number.parseInt(String(payload?.rssi_threshold), 10);
    const confirmValue = Number.parseInt(String(payload?.confirm_readings), 10);
    const debounceValue = Number.parseInt(String(payload?.debounce_seconds), 10);

    const rssiThreshold = Number.isFinite(thresholdValue)
      ? thresholdValue
      : this.defaultRssiThreshold;
    const confirmReadings = Number.isFinite(confirmValue)
      ? Math.max(1, confirmValue)
      : this.defaultConfirmReadings;
    const debounceSeconds = Number.isFinite(debounceValue)
      ? Math.max(0, debounceValue)
      : this.defaultDebounceSeconds;

    return {
      routeId,
      routeName,
      userId,
      beacons,
      rssiThreshold,
      confirmReadings,
      debounceSeconds,
      active: payload?.active === false ? 0 : 1,
    };
  }

  upsertRoute(payload) {
    const routeData = this._sanitizeRouteInput(payload);
    const timestamp = this._nowIso();

    const tx = this.db.transaction(() => {
      this.upsertRouteStmt.run({
        id: routeData.routeId,
        name: routeData.routeName,
        user_id: routeData.userId,
        rssi_threshold: routeData.rssiThreshold,
        confirm_readings: routeData.confirmReadings,
        debounce_seconds: routeData.debounceSeconds,
        active: routeData.active,
        created_at: timestamp,
        updated_at: timestamp,
      });

      this.clearRouteBeaconsStmt.run(routeData.routeId);

      for (const beacon of routeData.beacons) {
        this.insertOrUpdateBeaconStmt.run({
          id: randomUUID(),
          name: beacon.name,
          uuid: beacon.uuid,
          major: beacon.major,
          minor: beacon.minor,
          metadata_json: '{}',
          created_at: timestamp,
          updated_at: timestamp,
        });
        const storedBeacon = this.selectBeaconStmt.get(
          beacon.uuid,
          beacon.major,
          beacon.minor
        );
        this.linkRouteBeaconStmt.run(routeData.routeId, storedBeacon.id);
      }
    });
    tx();

    const route = this.getRouteStmt.get(routeData.routeId);
    const beacons = this.listRouteBeaconsStmt.all(routeData.routeId);
    return {
      route: {
        ...route,
        active: Boolean(route.active),
      },
      beacons,
    };
  }

  processBeaconReading(reading) {
    const beacon = parseBeaconIdentity(reading);
    if (!beacon) {
      return { matched_routes: 0, checkins: [] };
    }
    const rssi = Number.parseInt(String(reading?.rssi ?? -200), 10);
    const seenAt = String(reading?.seen_at || this._nowIso());
    const matches = this.findRouteMatchesByBeaconStmt.all(
      beacon.uuid,
      beacon.major,
      beacon.minor
    );
    if (matches.length === 0) {
      return { matched_routes: 0, checkins: [] };
    }

    const checkins = [];
    for (const match of matches) {
      const counterKey = `${match.user_id}:${match.device_id}`;
      const previous = this.proximityCounters.get(counterKey) || {
        consecutive: 0,
      };
      const aboveThreshold = rssi >= Number(match.rssi_threshold);

      const nextCounter = {
        consecutive: aboveThreshold ? previous.consecutive + 1 : 0,
        seen_at: seenAt,
      };
      this.proximityCounters.set(counterKey, nextCounter);

      if (nextCounter.consecutive < Number(match.confirm_readings)) {
        continue;
      }

      this.proximityCounters.set(counterKey, {
        consecutive: 0,
        seen_at: seenAt,
      });

      const result = this._registerCheckinIfAllowed({
        routeMatch: match,
        rssi,
        source: 'ble',
      });
      checkins.push(result);
    }

    return {
      matched_routes: matches.length,
      checkins,
    };
  }

  manualCheckin(payload) {
    const routeId = String(payload?.route_id || '').trim() || null;
    const userId = String(payload?.user_id || '').trim() || null;
    const identity = parseBeaconIdentity(payload);
    if (!identity) {
      throw new Error('uuid, major and minor are required');
    }
    const rssi = Number.parseInt(String(payload?.rssi ?? -60), 10);

    const routeMatch = this.findManualRouteMatchStmt.get(
      identity.uuid,
      identity.major,
      identity.minor,
      routeId,
      routeId,
      userId,
      userId
    );
    if (!routeMatch) {
      throw new Error('no active route found for beacon/manual checkin');
    }

    return this._registerCheckinIfAllowed({
      routeMatch,
      rssi,
      source: 'manual',
    });
  }

  _registerCheckinIfAllowed({ routeMatch, rssi, source }) {
    const now = this._nowIso();
    const last = this.getLastCheckinStmt.get(
      routeMatch.route_id,
      routeMatch.user_id,
      routeMatch.device_id
    );

    if (last?.created_at) {
      const elapsedSeconds =
        (Date.parse(now) - Date.parse(last.created_at)) / 1000;
      if (elapsedSeconds < Number(routeMatch.debounce_seconds)) {
        return {
          created: false,
          reason: 'debounced',
          debounce_seconds: Number(routeMatch.debounce_seconds),
          elapsed_seconds: Math.max(0, Math.floor(elapsedSeconds)),
          route_id: routeMatch.route_id,
          user_id: routeMatch.user_id,
          beacon: {
            uuid: routeMatch.uuid,
            major: routeMatch.major,
            minor: routeMatch.minor,
            name: routeMatch.beacon_name,
          },
        };
      }
    }

    const checkinId = randomUUID();
    this.insertCheckinStmt.run({
      id: checkinId,
      route_id: routeMatch.route_id,
      user_id: routeMatch.user_id,
      device_id: routeMatch.device_id,
      beacon_uuid: routeMatch.uuid,
      beacon_major: routeMatch.major,
      beacon_minor: routeMatch.minor,
      rssi,
      source,
      created_at: now,
    });

    const payload = {
      checkin_id: checkinId,
      route_id: routeMatch.route_id,
      route_name: routeMatch.route_name,
      user_id: routeMatch.user_id,
      beacon: {
        uuid: routeMatch.uuid,
        major: routeMatch.major,
        minor: routeMatch.minor,
        name: routeMatch.beacon_name,
      },
      rssi,
      source,
      created_at: now,
    };
    const event = this.createEvent('patrol.checkin', payload);
    this.notifyEvent(event);

    return {
      created: true,
      checkin: payload,
      event,
    };
  }
}

module.exports = {
  PatrolService,
  parseBeaconIdentity,
  normalizeUuid,
};
