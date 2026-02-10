const cors = require('cors');
const express = require('express');
const Database = require('better-sqlite3');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');

const { runMigrations } = require('./src/migrations');
const { createLockProviderFromEnv } = require('./src/adapters/locks');
const {
  MAX_RETRIES_DEFAULT,
  RETRY_BASE_MS_DEFAULT,
  RETRY_MAX_MS_DEFAULT,
  computeFailureTransition,
  shouldExecuteLocallyOnly,
} = require('./src/command-queue');

const PORT = Number(process.env.PORT || 8787);
const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, 'data', 'edge-gateway.sqlite');
const MIGRATION_DIR = path.join(__dirname, 'db', 'migrations');
const AUTO_SEED_ON_BOOT = process.env.AUTO_SEED_ON_BOOT !== 'false';
const OFFLINE_MODE = String(process.env.OFFLINE_MODE || 'false') === 'true';

const COMMAND_MAX_RETRIES = Number(
  process.env.COMMAND_MAX_RETRIES || MAX_RETRIES_DEFAULT
);
const RETRY_BASE_MS = Number(process.env.RETRY_BASE_MS || RETRY_BASE_MS_DEFAULT);
const RETRY_MAX_MS = Number(process.env.RETRY_MAX_MS || RETRY_MAX_MS_DEFAULT);
const QUEUE_POLL_MS = Number(process.env.QUEUE_POLL_MS || 1000);
const LOCAL_FAILURE_RATE = Number(process.env.LOCAL_FAILURE_RATE || 0.08);
const REMOTE_FAILURE_RATE = Number(process.env.REMOTE_FAILURE_RATE || 0.2);

const COMMAND_STATUSES = ['pending', 'dispatched', 'success', 'failed'];

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
    retry_count: row.retry_count,
    max_retries: row.max_retries,
    next_attempt_at: row.next_attempt_at,
    last_error: row.last_error,
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

function parseLimit(rawLimit, defaultValue = 50) {
  const numeric = Number.parseInt(String(rawLimit ?? defaultValue), 10);
  if (!Number.isFinite(numeric)) {
    return defaultValue;
  }
  return Math.max(1, Math.min(200, numeric));
}

function parseCommandStatuses(rawValue) {
  if (!rawValue) {
    return ['pending', 'failed'];
  }
  if (rawValue === 'all') {
    return [...COMMAND_STATUSES];
  }
  const statuses = String(rawValue)
    .split(',')
    .map((item) => item.trim())
    .filter((item) => COMMAND_STATUSES.includes(item));
  if (statuses.length === 0) {
    return ['pending', 'failed'];
  }
  return [...new Set(statuses)];
}

const db = openDatabase();
runMigrations(db, MIGRATION_DIR);
const lockProvider = createLockProviderFromEnv(process.env);

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
  INSERT INTO commands (
    id, type, payload_json, status, retry_count, max_retries,
    next_attempt_at, last_error, created_at, updated_at
  )
  VALUES (
    @id, @type, @payload_json, @status, @retry_count, @max_retries,
    @next_attempt_at, @last_error, @created_at, @updated_at
  )
`
);
const getCommandStmt = db.prepare(
  `
  SELECT
    id, type, payload_json, status, retry_count, max_retries,
    next_attempt_at, last_error, created_at, updated_at
  FROM commands
  WHERE id = ?
`
);
const setCommandPayloadStmt = db.prepare(
  `
  UPDATE commands
  SET payload_json = @payload_json, updated_at = @updated_at
  WHERE id = @id
`
);
const setCommandDispatchedStmt = db.prepare(
  `
  UPDATE commands
  SET status = 'dispatched', updated_at = @updated_at
  WHERE id = @id
`
);
const setCommandSuccessStmt = db.prepare(
  `
  UPDATE commands
  SET
    status = 'success',
    next_attempt_at = NULL,
    last_error = NULL,
    updated_at = @updated_at
  WHERE id = @id
`
);
const setCommandFailedStmt = db.prepare(
  `
  UPDATE commands
  SET
    status = 'failed',
    retry_count = @retry_count,
    next_attempt_at = @next_attempt_at,
    last_error = @last_error,
    updated_at = @updated_at
  WHERE id = @id
`
);
const listReadyCommandsStmt = db.prepare(
  `
  SELECT
    id, type, payload_json, status, retry_count, max_retries,
    next_attempt_at, last_error, created_at, updated_at
  FROM commands
  WHERE
    status IN ('pending', 'failed')
    AND retry_count < max_retries
    AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
  ORDER BY created_at ASC
  LIMIT ?
`
);
const countCommandsByStatusStmt = db.prepare(
  `
  SELECT status, COUNT(*) AS count
  FROM commands
  GROUP BY status
`
);
const resetFailedCommandStmt = db.prepare(
  `
  UPDATE commands
  SET
    status = 'pending',
    retry_count = 0,
    next_attempt_at = @next_attempt_at,
    last_error = NULL,
    updated_at = @updated_at
  WHERE id = @id AND status = 'failed'
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

function createCommand(type, payload) {
  const id = randomUUID();
  const timestamp = nowIso();
  insertCommandStmt.run({
    id,
    type,
    payload_json: JSON.stringify(payload ?? {}),
    status: 'pending',
    retry_count: 0,
    max_retries: COMMAND_MAX_RETRIES,
    next_attempt_at: timestamp,
    last_error: null,
    created_at: timestamp,
    updated_at: timestamp,
  });
  return mapCommand(getCommandStmt.get(id));
}

function updateCommandPayload(commandId, payload) {
  setCommandPayloadStmt.run({
    id: commandId,
    payload_json: JSON.stringify(payload ?? {}),
    updated_at: nowIso(),
  });
  return mapCommand(getCommandStmt.get(commandId));
}

function setCommandDispatched(commandId) {
  setCommandDispatchedStmt.run({
    id: commandId,
    updated_at: nowIso(),
  });
  return mapCommand(getCommandStmt.get(commandId));
}

function setCommandSuccess(commandId) {
  setCommandSuccessStmt.run({
    id: commandId,
    updated_at: nowIso(),
  });
  return mapCommand(getCommandStmt.get(commandId));
}

function setCommandFailed(commandId, transition, errorMessage) {
  setCommandFailedStmt.run({
    id: commandId,
    retry_count: transition.retry_count,
    next_attempt_at: transition.next_attempt_at,
    last_error: String(errorMessage || 'unknown_error').slice(0, 500),
    updated_at: nowIso(),
  });
  return mapCommand(getCommandStmt.get(commandId));
}

function listFeed(limit) {
  return listFeedStmt.all(limit).map(mapEvent);
}

function listCommands(statuses, limit) {
  const placeholders = statuses.map(() => '?').join(', ');
  const statement = db.prepare(
    `
    SELECT
      id, type, payload_json, status, retry_count, max_retries,
      next_attempt_at, last_error, created_at, updated_at
    FROM commands
    WHERE status IN (${placeholders})
    ORDER BY created_at DESC
    LIMIT ?
  `
  );
  return statement.all(...statuses, limit).map(mapCommand);
}

function resetFailedCommands(commandId = null) {
  const now = nowIso();
  if (commandId) {
    const changed = resetFailedCommandStmt.run({
      id: commandId,
      next_attempt_at: now,
      updated_at: now,
    }).changes;
    if (changed === 0) {
      return [];
    }
    return [mapCommand(getCommandStmt.get(commandId))];
  }

  const failed = listCommands(['failed'], 500);
  const tx = db.transaction((items) => {
    for (const item of items) {
      resetFailedCommandStmt.run({
        id: item.id,
        next_attempt_at: now,
        updated_at: now,
      });
    }
  });
  tx(failed);
  return failed.map((item) => mapCommand(getCommandStmt.get(item.id)));
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

function emitCommandEvent(command, stage, extras = {}) {
  const event = createEvent(`${command.type}.${stage}`, {
    command_id: command.id,
    status: command.status,
    retry_count: command.retry_count,
    max_retries: command.max_retries,
    payload: command.payload,
    ...extras,
  });
  notifyEvent(event);
  return event;
}

function simulateLocalExecution() {
  if (Math.random() < LOCAL_FAILURE_RATE) {
    return {
      ok: false,
      error: 'local_controller_unreachable',
    };
  }
  return {
    ok: true,
  };
}

function simulateRemoteDispatch() {
  if (OFFLINE_MODE) {
    return {
      ok: false,
      error: 'offline_mode_enabled',
    };
  }
  if (Math.random() < REMOTE_FAILURE_RATE) {
    return {
      ok: false,
      error: 'remote_ack_timeout',
    };
  }
  return {
    ok: true,
  };
}

async function executeAccessApprove(command) {
  const target = String(command.payload?.target || '').trim();
  if (!['service_gate', 'main_gate'].includes(target)) {
    return {
      ok: false,
      error: 'invalid_gate_target',
      stage: 'local_gate',
      command,
    };
  }

  let gateResult;
  try {
    gateResult = await lockProvider.openGate(target);
  } catch (error) {
    gateResult = {
      ok: false,
      provider: lockProvider.constructor?.name || 'unknown',
      target,
      error: String(error?.message || 'gate_provider_error'),
    };
  }

  if (!gateResult.ok) {
    const failedPayload = {
      ...command.payload,
      gate_last_error: gateResult.error || 'gate_open_failed',
      gate_last_attempt_at: nowIso(),
    };
    command = updateCommandPayload(command.id, failedPayload);

    const gateFailedEvent = createEvent('gate.failed', {
      command_id: command.id,
      target,
      provider: gateResult.provider || 'unknown',
      error: gateResult.error || 'gate_open_failed',
      details: gateResult.details || null,
    });
    notifyEvent(gateFailedEvent);

    return {
      ok: false,
      error: gateResult.error || 'gate_open_failed',
      stage: 'local_gate',
      command,
    };
  }

  const successPayload = {
    ...command.payload,
    gate_opened_at: nowIso(),
    gate_provider: gateResult.provider || 'unknown',
    gate_open_details: gateResult.details || null,
  };
  command = updateCommandPayload(command.id, successPayload);

  const gateOpenedEvent = createEvent('gate.opened', {
    command_id: command.id,
    target,
    provider: gateResult.provider || 'unknown',
    details: gateResult.details || null,
  });
  notifyEvent(gateOpenedEvent);

  return {
    ok: true,
    command,
    stage: 'gate_opened',
  };
}

async function executeCommandLocalFirst(command) {
  if (command.type === 'access.approve') {
    return executeAccessApprove(command);
  }

  const payload = { ...command.payload };
  const localOnly = shouldExecuteLocallyOnly(command.type, OFFLINE_MODE);

  if (!payload.local_executed_at) {
    const localResult = simulateLocalExecution(command);
    if (!localResult.ok) {
      return {
        ok: false,
        error: localResult.error,
        stage: 'local',
        command,
      };
    }
    payload.local_executed_at = nowIso();
    payload.local_execution_mode = localOnly ? 'offline_local' : 'local_first';
    command = updateCommandPayload(command.id, payload);
  }

  if (localOnly) {
    return {
      ok: true,
      command,
      stage: 'local_offline',
    };
  }

  const remoteResult = simulateRemoteDispatch(command);
  if (!remoteResult.ok) {
    return {
      ok: false,
      error: remoteResult.error,
      stage: 'remote',
      command,
    };
  }
  return {
    ok: true,
    command,
    stage: 'local_and_remote',
  };
}

let queueBusy = false;

async function processCommandQueue() {
  if (queueBusy) {
    return;
  }
  queueBusy = true;

  try {
    const now = nowIso();
    const queueItems = listReadyCommandsStmt.all(now, 20).map(mapCommand);

    for (const item of queueItems) {
      const dispatched = setCommandDispatched(item.id);
      notifyCommand(dispatched);
      emitCommandEvent(dispatched, 'dispatched', {
        offline_mode: OFFLINE_MODE,
      });

      const result = await executeCommandLocalFirst(dispatched);
      if (result.ok) {
        const success = setCommandSuccess(dispatched.id);
        notifyCommand(success);
        emitCommandEvent(success, 'success', {
          execution_stage: result.stage,
          offline_mode: OFFLINE_MODE,
        });
        continue;
      }

      const transition = computeFailureTransition({
        retryCount: dispatched.retry_count,
        maxRetries: dispatched.max_retries,
        baseDelayMs: RETRY_BASE_MS,
        maxDelayMs: RETRY_MAX_MS,
      });
      const failed = setCommandFailed(dispatched.id, transition, result.error);
      notifyCommand(failed);
      emitCommandEvent(failed, 'failed', {
        execution_stage: result.stage,
        error: result.error,
        will_retry: transition.will_retry,
        next_attempt_at: transition.next_attempt_at,
      });
    }
  } finally {
    queueBusy = false;
  }
}

function wakeQueue() {
  setImmediate(() => {
    processCommandQueue().catch((error) => {
      console.error('Erro ao processar fila de comandos:', error);
    });
  });
}

setInterval(() => {
  processCommandQueue().catch((error) => {
    console.error('Erro no loop da fila:', error);
  });
}, QUEUE_POLL_MS);

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
        offline_mode: OFFLINE_MODE,
      },
    })
  );
  ws.send(
    JSON.stringify({
      channel: 'feed.snapshot',
      data: listFeed(20),
    })
  );
  ws.send(
    JSON.stringify({
      channel: 'commands.snapshot',
      data: listCommands(['pending', 'failed', 'dispatched'], 50),
    })
  );

  ws.on('close', () => {
    wsClients.delete(ws);
  });
});

app.get('/health', (_request, response) => {
  let dbOk = true;
  try {
    db.prepare('SELECT 1 AS ok').get();
  } catch (_error) {
    dbOk = false;
  }
  response.json({
    ok: dbOk,
    service: 'edge-gateway',
    offline_mode: OFFLINE_MODE,
    db_ok: dbOk,
    ws_clients_count: wsClients.size,
    lock_provider: lockProvider.constructor?.name || 'unknown',
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

app.get('/commands', (request, response) => {
  const statuses = parseCommandStatuses(request.query.status);
  const limit = parseLimit(request.query.limit);
  const items = listCommands(statuses, limit);
  response.json({
    items,
    count: items.length,
    statuses,
    limit,
  });
});

app.post('/commands/replay', (request, response) => {
  const commandId = normalizeText(request.body?.command_id);
  const replayed = resetFailedCommands(commandId || null);

  if (commandId && replayed.length === 0) {
    response.status(404).json({
      error: 'failed command not found for replay',
    });
    return;
  }

  for (const command of replayed) {
    notifyCommand(command);
  }

  const replayEvent = createEvent('commands.replay.requested', {
    command_id: commandId || null,
    replayed_count: replayed.length,
  });
  notifyEvent(replayEvent);
  wakeQueue();

  response.json({
    ok: true,
    replayed_count: replayed.length,
    commands: replayed,
    event: replayEvent,
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
  const requestedEvent = emitCommandEvent(command, 'requested', {
    intercom_event_id,
    target,
  });
  wakeQueue();

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
  const requestedEvent = emitCommandEvent(command, 'requested', {
    intercom_event_id,
  });
  wakeQueue();

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
  const requestedEvent = emitCommandEvent(command, 'requested', {
    reason,
    scope,
  });
  wakeQueue();

  response.status(202).json({
    ok: true,
    command,
    event: requestedEvent,
  });
});

server.listen(PORT, () => {
  const counts = countCommandsByStatusStmt.all();
  console.log(`Edge Gateway executando em http://localhost:${PORT}`);
  console.log(`WebSocket em ws://localhost:${PORT}/ws`);
  console.log(`SQLite DB: ${DB_PATH}`);
  console.log(`OFFLINE_MODE: ${OFFLINE_MODE}`);
  console.log(`Lock provider: ${lockProvider.constructor?.name || 'unknown'}`);
  console.log(
    `Fila local-first pronta. Status atuais: ${JSON.stringify(counts)}`
  );
});
