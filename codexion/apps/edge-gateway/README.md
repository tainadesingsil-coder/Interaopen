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
    adapters/
      ble/
        beaconScanner.js
      locks/
        ILockProvider.js
        MockLockProvider.js
        RelayLockProvider.js
        index.js
    migrations.js
    command-queue.js
    core/
      duressService.js
      patrolService.js
  db/
    migrations/
      001_init.sql
      002_commands_local_first.sql
      003_patrol_ble.sql
      004_duress_detection.sql
      005_watch_bridge.sql
  scripts/
    migrate.js
    seed.js
  tests/
    beacon-scanner.test.js
    command-queue.test.js
    duress-service.test.js
    lock-provider.test.js
    patrol-service.test.js
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
LOCK_PROVIDER=mock
MOCK_LOCK_DELAY_MS=400
MOCK_LOCK_SUCCESS_RATE=0.9
BLE_SCANNER_ENABLED=false
BLE_ALLOW_DUPLICATES=true
DURESS_HR_THRESHOLD=130
DURESS_SUSTAIN_SECONDS=20
DURESS_WINDOW_SECONDS=60
DURESS_MAX_STEPS_DELTA=0
DURESS_COOLDOWN_SECONDS=180
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

Fluxo local-first do approve:
- cria comando `pending`,
- fila processa e chama `openGate(target)` no provider de fechadura,
- atualiza comando para `success` ou `failed`,
- gera eventos `gate.opened` ou `gate.failed`.

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
- `connected_watch_count`

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

### `POST /patrol/routes`
Configura rota de ronda com beacons BLE.

Body:

```json
{
  "route_id": "rota-a-noite",
  "name": "Ronda Noturna Torre A",
  "user_id": "guard-01",
  "rssi_threshold": -68,
  "confirm_readings": 3,
  "debounce_seconds": 180,
  "beacons": [
    {
      "uuid": "fda50693-a4e2-4fb1-afcf-c6eb07647825",
      "major": 100,
      "minor": 7,
      "name": "Portao Norte"
    }
  ]
}
```

### `POST /patrol/checkin/manual`
Fallback para registrar checkin manual quando BLE nao estiver disponivel.

Body:

```json
{
  "route_id": "rota-a-noite",
  "user_id": "guard-01",
  "uuid": "fda50693-a4e2-4fb1-afcf-c6eb07647825",
  "major": 100,
  "minor": 7,
  "rssi": -61
}
```

Regra de debounce tambem se aplica ao checkin manual.

### `GET /duress/rules`
Lista regras de coacao e qual esta ativa.

### `POST /duress/rules`
Cria/atualiza regra operacional de coacao.

Body exemplo:

```json
{
  "name": "Padrao Portaria",
  "hr_threshold": 130,
  "sustain_seconds": 20,
  "window_seconds": 60,
  "max_steps_delta": 0,
  "cooldown_seconds": 180,
  "active": true
}
```

### `POST /telemetry/watch`
Recebe telemetria de relogio:

```json
{
  "device_id": "watch-01",
  "hr": 135,
  "steps": 2200,
  "spo2": 97.5,
  "timestamp": "2026-02-10T12:00:00Z"
}
```

Regra aplicada:
- janela deslizante de 60s (configuravel),
- HR acima do limiar por tempo sustentado,
- sem aumento de passos.

Quando detectar:
- gera evento `duress.suspected`,
- cria comando silencioso `notify.security`.

### `GET /telemetry/watch/latest?device_id=watch-01`
Retorna o ultimo registro de telemetria por dispositivo (ou de todos quando sem filtro).

### `GET /watch/session`
Lista sessoes de relogios e estado de conexao atual.

### `POST /watch/session/connect`
Registra conexao de relogio (bridge navegador -> edge):

```json
{
  "device_id": "watch-01",
  "device_name": "Vvfit M6"
}
```

### `POST /watch/session/disconnect`
Marca sessao como desconectada:

```json
{
  "device_id": "watch-01"
}
```

### `POST /watch/heartbeat`
Atualiza heartbeat operacional e status de bateria/HR:

```json
{
  "device_id": "watch-01",
  "battery_level": 83,
  "hr": 88,
  "steps": 2440,
  "spo2": 97,
  "timestamp": "2026-02-10T12:00:00Z"
}
```

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
- `watch.snapshot` (snapshot de sessoes de relogio),
- `watch.session` (mudanca de sessao),
- `watch.heartbeat` (heartbeat operacional),
- `gateway.ready` (handshake inicial).

Eventos de ronda emitidos em tempo real:
- `patrol.route.configured`
- `patrol.checkin`

Eventos de coacao emitidos em tempo real:
- `duress.suspected`
- `duress.rule.updated`

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
- parse de iBeacon via manufacturer data,
- backoff exponencial,
- transicoes de status da fila,
- comportamento local-only para comandos criticos em modo offline,
- adapter de fechadura mock/relay,
- logica de ronda com 3 leituras + debounce de 3 minutos,
- detector de coacao com janela deslizante e cooldown.

## Banco (SQLite)

Arquivo padrao:

```text
apps/edge-gateway/data/edge-gateway.sqlite
```

Tabelas:
- `events(id, type, payload_json, created_at)`
- `commands(id, type, payload_json, status, retry_count, max_retries, next_attempt_at, last_error, created_at, updated_at)`
- `devices(id, type, uuid, major, minor, ...)`
- `patrol_routes(...)`
- `patrol_route_devices(route_id, device_id)`
- `patrol_checkins(...)`
- `watch_telemetry(...)`
- `duress_rules(...)`
- `watch_sessions(...)`
- `watch_heartbeats(...)`
