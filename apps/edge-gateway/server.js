const cors = require('cors');
const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');

const PORT = Number(process.env.PORT || 8787);
const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, 'data', 'edge-gateway.sqlite');
const AUTO_SEED_ON_BOOT = process.env.AUTO_SEED_ON_BOOT !== 'false';
const COMMAND_DELAY_MS = Number(process.env.COMMAND_DELAY_MS || 900);

const app = express();
app.use(cors());
app.use(express.json());

function ensureDatabaseDirectory() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

function openDatabase() {
  ensureDatabaseDirectory();
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function runMigrations(db) {
  const migrationDir = path.join(__dirname, 'db', 'migrations');
  if (!fs.existsSync(migrationDir)) {
    return;
  }
  const files = fs
    .readdirSync(migrationDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    db.exec(sql);
  }
}

function parsePayload(payloadJson) {
  try {
    return JSON.parse(payloadJson);
  } catch (_error) {
    return {};
  }
}

function mapEvent(row) {
  return {
    id: row.id,
    type: row.type,
    payload: parsePayload(row.payload_json),
    created_at: row.created_at,
  };
}

function mapCommand(row) {
  return {
    id: row.id,
    type: row.type,
    payload: parsePayload(row.payload_json),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function parseLimit(rawLimit) {
  const numeric = Number.parseInt(String(rawLimit ?? 50), 10);
  if (!Number.isFinite(numeric)) {
    return 50;
  }
  return Math.max(1, Math.min(200, numeric));
}

const db = openDatabase();
runMigrations(db);

const insertEventStmt = db.prepare(
  `
  INSERT INTO events (id, type, payload_json, created_at)
  VALUES (@id, @type, @payload_json, @created_at)
`
);
const getEventStmt = db.prepare(
  `
  SELECT id, type, payload_json, created_at
  FROM events
  WHERE id = ?
`
);
const listFeedStmt = db.prepare(
  `
  SELECT id, type, payload_json, created_at
  FROM events
  ORDER BY created_at DESC
  LIMIT ?
`
);
const countEventsStmt = db.prepare(`SELECT COUNT(*) AS count FROM events`);

const insertCommandStmt = db.prepare(
  `
  INSERT INTO commands (id, type, payload_json, status, created_at, updated_at)
  VALUES (@id, @type, @payload_json, @status, @created_at, @updated_at)
`
);
const getCommandStmt = db.prepare(
  `
  SELECT id, type, payload_json, status, created_at, updated_at
  FROM commands
  WHERE id = ?
`
);
const updateCommandStatusStmt = db.prepare(
  `
  UPDATE commands
  SET status = @status, updated_at = @updated_at
  WHERE id = @id
`
);

function createEvent(type, payload) {
  const id = randomUUID();
  const created_at = nowIso();
  insertEventStmt.run({
    id,
    type,
    payload_json: JSON.stringify(payload ?? {}),
    created_at,
  });
  return mapEvent(getEventStmt.get(id));
}

function createCommand(type, payload, status = 'pending') {
  const id = randomUUID();
  const timestamp = nowIso();
  insertCommandStmt.run({
    id,
    type,
    payload_json: JSON.stringify(payload ?? {}),
    status,
    created_at: timestamp,
    updated_at: timestamp,
  });
  return mapCommand(getCommandStmt.get(id));
}

function setCommandStatus(commandId, status) {
  const updated_at = nowIso();
  updateCommandStatusStmt.run({
    id: commandId,
    status,
    updated_at,
  });
  return mapCommand(getCommandStmt.get(commandId));
}

function listFeed(limit) {
  return listFeedStmt.all(limit).map(mapEvent);
}

function seedFakeEvents(amount = 10) {
  const templates = [
    {
      type: 'intercom.called',
      payload: { tower: 'A', unit: '1203', visitor_name: 'Camila Ferreira' },
    },
    {
      type: 'access.approve.success',
      payload: { intercom_event_id: 'seed', target: 'main_gate' },
    },
    {
      type: 'access.deny.success',
      payload: { intercom_event_id: 'seed', target: 'service_gate' },
    },
    {
      type: 'patrol.checkin',
      payload: { checkpoint: 'C3', guard: 'Joao Pereira' },
    },
    {
      type: 'safety.alert',
      payload: { level: 'warning', zone: 'Garagem' },
    },
  ];

  for (let index = 0; index < amount; index += 1) {
    const template = templates[index % templates.length];
    createEvent(template.type, {
      ...template.payload,
      seed_index: index + 1,
    });
  }
}

if (AUTO_SEED_ON_BOOT) {
  const current = countEventsStmt.get().count;
  if (current === 0) {
    seedFakeEvents(10);
    // One-time bootstrap to make feed test-ready after first run.
    console.log('Seed inicial aplicado com 10 eventos.');
  }
}

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
const wsClients = new Set();

function broadcast(channel, data) {
  const payload = JSON.stringify({
    channel,
    data,
    sent_at: nowIso(),
  });
  for (const client of wsClients) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
}

function notifyEvent(event) {
  broadcast('feed.event', event);
}

function notifyCommand(command) {
  broadcast('command.status', command);
}

function resolveCommandAsync(command, successEventType, failEventType) {
  setTimeout(() => {
    const hasFailed = Math.random() < 0.12;
    const status = hasFailed ? 'fail' : 'success';
    const updatedCommand = setCommandStatus(command.id, status);
    notifyCommand(updatedCommand);

    const eventType = hasFailed ? failEventType : successEventType;
    const event = createEvent(eventType, {
      command_id: command.id,
      command_type: command.type,
      status: updatedCommand.status,
      payload: updatedCommand.payload,
    });
    notifyEvent(event);
  }, COMMAND_DELAY_MS);
}

server.on('upgrade', (request, socket, head) => {
  if (request.url !== '/ws') {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws);
  });
});

wss.on('connection', (ws) => {
  wsClients.add(ws);
  ws.send(
    JSON.stringify({
      channel: 'gateway.ready',
      data: {
        message: 'Conexao WebSocket estabelecida.',
        server_time: nowIso(),
      },
    })
  );
  ws.send(
    JSON.stringify({
      channel: 'feed.snapshot',
      data: listFeed(20),
    })
  );

  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

app.get('/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'edge-gateway',
    ws_clients: wsClients.size,
    time: nowIso(),
  });
});

app.get('/feed', (request, response) => {
  const limit = parseLimit(request.query.limit);
  const items = listFeed(limit);
  response.json({
    items,
    count: items.length,
    limit,
  });
});

app.post('/webhooks/intercom', (request, response) => {
  const tower = normalizeText(request.body?.tower);
  const unit = normalizeText(request.body?.unit);
  const visitor_name = normalizeText(request.body?.visitor_name) || null;

  if (!tower || !unit) {
    response.status(422).json({
      error: 'tower and unit are required',
    });
    return;
  }

  const event = createEvent('intercom.called', {
    tower,
    unit,
    visitor_name,
    source: 'intercom-webhook',
  });
  notifyEvent(event);

  response.status(201).json({
    ok: true,
    intercom_event_id: event.id,
    event,
  });
});

app.post('/actions/access/approve', (request, response) => {
  const intercom_event_id = normalizeText(request.body?.intercom_event_id);
  const target = normalizeText(request.body?.target);

  if (!intercom_event_id || !['service_gate', 'main_gate'].includes(target)) {
    response.status(422).json({
      error: 'intercom_event_id and valid target are required',
    });
    return;
  }

  const command = createCommand('access.approve', {
    intercom_event_id,
    target,
  });
  notifyCommand(command);

  const requestedEvent = createEvent('access.approve.requested', {
    command_id: command.id,
    intercom_event_id,
    target,
  });
  notifyEvent(requestedEvent);

  resolveCommandAsync(
    command,
    'access.approve.success',
    'access.approve.fail'
  );

  response.status(202).json({
    ok: true,
    command,
    event: requestedEvent,
  });
});

app.post('/actions/access/deny', (request, response) => {
  const intercom_event_id = normalizeText(request.body?.intercom_event_id);

  if (!intercom_event_id) {
    response.status(422).json({
      error: 'intercom_event_id is required',
    });
    return;
  }

  const command = createCommand('access.deny', {
    intercom_event_id,
  });
  notifyCommand(command);

  const requestedEvent = createEvent('access.deny.requested', {
    command_id: command.id,
    intercom_event_id,
  });
  notifyEvent(requestedEvent);

  resolveCommandAsync(command, 'access.deny.success', 'access.deny.fail');

  response.status(202).json({
    ok: true,
    command,
    event: requestedEvent,
  });
});

app.post('/actions/emergency/lockdown', (request, response) => {
  const reason = normalizeText(request.body?.reason) || 'manual_lockdown';
  const scope = normalizeText(request.body?.scope) || 'all_gates';

  const command = createCommand('emergency.lockdown', {
    reason,
    scope,
  });
  notifyCommand(command);

  const requestedEvent = createEvent('emergency.lockdown.requested', {
    command_id: command.id,
    reason,
    scope,
  });
  notifyEvent(requestedEvent);

  resolveCommandAsync(
    command,
    'emergency.lockdown.success',
    'emergency.lockdown.fail'
  );

  response.status(202).json({
    ok: true,
    command,
    event: requestedEvent,
  });
});

server.listen(PORT, () => {
  console.log(`Edge Gateway executando em http://localhost:${PORT}`);
  console.log(`WebSocket em ws://localhost:${PORT}/ws`);
  console.log(`SQLite DB: ${DB_PATH}`);
});
