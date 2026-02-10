# Edge Gateway (Node.js + WebSocket)

Gateway local para dashboard de portaria com:
- REST API para webhook e comandos,
- WebSocket para feed em tempo real,
- persistencia SQLite (MVP),
- migrations SQL e seed de eventos fake.

## Estrutura

```text
apps/edge-gateway/
  server.js
  package.json
  .gitignore
  db/
    migrations/
      001_init.sql
  scripts/
    migrate.js
    seed.js
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

## WebSocket

Conectar em:

```text
ws://localhost:8787/ws
```

Canais emitidos:
- `feed.event` (novo evento no feed),
- `command.status` (status `pending/success/fail`),
- `feed.snapshot` (snapshot inicial ao conectar),
- `gateway.ready` (handshake inicial).

## Migrations e Seed manual

```bash
npm run migrate
npm run seed
```

## Banco (SQLite)

Arquivo padrao:

```text
apps/edge-gateway/data/edge-gateway.sqlite
```

Tabelas:
- `events(id, type, payload_json, created_at)`
- `commands(id, type, payload_json, status, created_at, updated_at)`
