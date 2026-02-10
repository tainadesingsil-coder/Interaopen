const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { runMigrations } = require('../src/migrations');

const DB_PATH =
  process.env.DB_PATH ||
  path.join(__dirname, '..', 'data', 'edge-gateway.sqlite');
const MIGRATION_DIR = path.join(__dirname, '..', 'db', 'migrations');
const AMOUNT = Number(process.env.SEED_AMOUNT || 10);

function nowIsoOffset(minutesAgo) {
  const value = new Date(Date.now() - minutesAgo * 60 * 1000);
  return value.toISOString();
}

function seed() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db, MIGRATION_DIR);

  const insertEventStmt = db.prepare(
    `
    INSERT INTO events (id, type, payload_json, created_at)
    VALUES (@id, @type, @payload_json, @created_at)
  `
  );
  const tx = db.transaction((rows) => {
    for (const row of rows) {
      insertEventStmt.run(row);
    }
  });

  const templates = [
    {
      type: 'intercom.called',
      payload: { tower: 'A', unit: '1203', visitor_name: 'Visitante Teste' },
    },
    {
      type: 'access.approve.success',
      payload: { target: 'main_gate', intercom_event_id: 'seed-event' },
    },
    {
      type: 'access.deny.success',
      payload: { intercom_event_id: 'seed-event' },
    },
    {
      type: 'emergency.lockdown.requested',
      payload: { reason: 'drill', scope: 'all_gates' },
    },
    {
      type: 'patrol.checkin',
      payload: { guard: 'Ronda 02', checkpoint: 'B2' },
    },
  ];

  const rows = [];
  for (let index = 0; index < AMOUNT; index += 1) {
    const tpl = templates[index % templates.length];
    rows.push({
      id: randomUUID(),
      type: tpl.type,
      payload_json: JSON.stringify({
        ...tpl.payload,
        seed_index: index + 1,
      }),
      created_at: nowIsoOffset(AMOUNT - index),
    });
  }
  tx(rows);

  const total = db.prepare('SELECT COUNT(*) AS count FROM events').get().count;
  db.close();
  console.log(`Seed finalizado. ${AMOUNT} eventos inseridos. Total no feed: ${total}`);
}

seed();
