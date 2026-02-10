# Edge Gateway (Node.js + WebSocket) - Local-First

Gateway local para dashboard de portaria com:
- REST API para webhook e comandos,
- WebSocket para feed em tempo real,
- persistencia SQLite (MVP),
- fila local-first de comandos com retries exponenciais,
- migrations SQL e seed de eventos fake.

## Estrutura

```text
apps/edge-gateway/
  server.js
  package.json
  package-lock.json
  .gitignore
  src/
    migrations.js
    command-queue.js
  db/
    migrations/
      001_init.sql
      002_commands_local_first.sql
  scripts/
    migrate.js
    seed.js
  tests/
    command-queue.test.js
  data/
    .gitkeep
```

## Rodar localmente

```bash
cd apps/edge-gateway
npm install
npm run dev
```

`npm run dev` sobe o servidor em `http://localhost:8787`, aplica migrations automaticamente e (se banco vazio) cria 10 eventos seed para teste de feed.

## Comando unico para seed + start

```bash
npm run start:seed
```

## Local-First Queue

Cada comando entra na tabela `commands` e passa por estados:

`pending -> dispatched -> success | failed`

Regras:
- retries exponenciais com teto configuravel,
- ate 5 tentativas por padrao (`COMMAND_MAX_RETRIES=5`),
- replay manual de falhas por endpoint,
- em `OFFLINE_MODE=true`, comandos criticos executam localmente sem depender da internet.

Variaveis de ambiente uteis:

```bash
PORT=8787
DB_PATH=./data/edge-gateway.sqlite
OFFLINE_MODE=false
COMMAND_MAX_RETRIES=5
RETRY_BASE_MS=1000
RETRY_MAX_MS=30000
QUEUE_POLL_MS=1000
```

## Endpoints REST

### `POST /webhooks/intercom`
Body:

```json
{
  "tower": "A",
  "unit": "1203",
  "visitor_name": "Camila Ferreira"
}
```

### `POST /actions/access/approve`
Body:

```json
{
  "intercom_event_id": "uuid-do-evento",
  "target": "main_gate"
}
```

`target` permitido: `main_gate` ou `service_gate`.

### `POST /actions/access/deny`
Body:

```json
{
  "intercom_event_id": "uuid-do-evento"
}
```

### `POST /actions/emergency/lockdown`
Body (opcional):

```json
{
  "reason": "manual_lockdown",
  "scope": "all_gates"
}
```

### `GET /feed?limit=50`
Retorna os eventos mais recentes.

### `GET /health`
Retorna estado da aplicacao:
- `offline_mode`
- `db_ok`
- `ws_clients_count`

### `GET /commands?status=pending,failed&limit=50`
Lista comandos da fila.

- `status` aceita: `pending`, `dispatched`, `success`, `failed`, ou `all`
- padrao: `pending,failed`

### `POST /commands/replay`
Reenfileira comandos com falha.

Body para replay de um comando:

```json
{
  "command_id": "uuid-do-comando-failed"
}
```

Sem body (ou sem `command_id`) faz replay em lote de todos `failed`.

## WebSocket

Conectar em:

```text
ws://localhost:8787/ws
```

Canais emitidos:
- `feed.event` (novo evento no feed),
- `command.status` (status `pending/dispatched/success/failed`),
- `feed.snapshot` (snapshot inicial ao conectar),
- `commands.snapshot` (snapshot inicial dos comandos),
- `gateway.ready` (handshake inicial).

## Migrations e Seed manual

```bash
npm run migrate
npm run seed
```

## Testes

```bash
npm test
```

Testes cobrem:
- backoff exponencial,
- transicoes de status da fila,
- comportamento local-only para comandos criticos em modo offline.

## Banco (SQLite)

Arquivo padrao:

```text
apps/edge-gateway/data/edge-gateway.sqlite
```

Tabelas:
- `events(id, type, payload_json, created_at)`
- `commands(id, type, payload_json, status, retry_count, max_retries, next_attempt_at, last_error, created_at, updated_at)`
