# 🏢 Codexion - Plataforma de Segurança para Condomínios

Monorepo com **dashboard**, **edge-gateway** (REST + WebSocket) e **middleware** (BLE / Vvfit).

## Estrutura

```text
codexion/
  apps/
    edge-gateway/   # Node.js (REST + WS) - local-first (SQLite)
    dashboard/      # Next.js (Console operacional)
    middleware/     # Python (FastAPI + BLE)
  docker-compose.yml
  .env.example
  Makefile
```

## 🚀 Início rápido (1 comando)

```bash
cd codexion
make setup
make start
```

Acessos:
- **Dashboard**: http://localhost:3000
  - Login: `ADM` / `123456`
- **Edge API**: http://localhost:8787
- **WS**: ws://localhost:8787/ws
- **Middleware API**: http://localhost:8081

## 🔧 Variáveis de ambiente

Copie e ajuste:

```bash
cd codexion
cp .env.example .env
```

Principais:
- `NEXT_PUBLIC_EDGE_API_URL` (HTTP) e `NEXT_PUBLIC_EDGE_WS_URL` (WebSocket) → usados pelo dashboard
- `NEXT_PUBLIC_MIDDLEWARE_API_URL` → usado para enviar notificação/comando ao relógio
- `EDGE_GATEWAY_URL` → usado pelo middleware dentro do Docker network

## 🧪 Teste rápido: criar evento de interfone

```bash
curl -X POST http://localhost:8787/webhooks/intercom \
  -H "Content-Type: application/json" \
  -d '{"tower":"A","unit":"101","visitor_name":"Teste"}'
```

Abra o dashboard e veja o evento na timeline.

### Aprovar / Recusar acesso (via API)

1) Crie o evento e copie o `intercom_event_id` do retorno.  
2) Execute uma ação:

```bash
# Aprovar (portão principal)
curl -X POST http://localhost:8787/actions/access/approve \
  -H "Content-Type: application/json" \
  -d '{"intercom_event_id":"<ID_DO_EVENTO>","target":"main_gate"}'

# Recusar
curl -X POST http://localhost:8787/actions/access/deny \
  -H "Content-Type: application/json" \
  -d '{"intercom_event_id":"<ID_DO_EVENTO>"}'
```

O dashboard acompanha a fila em tempo real (WS + polling).

## ✅ Health check

```bash
curl http://localhost:8787/health
```

## 🧪 Testes

```bash
cd codexion
make test
```

## 🧰 Rodar sem Docker (modo dev)

Em 3 terminais:

```bash
# 1) Edge
cd codexion/apps/edge-gateway
npm install
PORT=8787 node server.js
```

```bash
# 2) Dashboard
cd codexion/apps/dashboard
npm install
NEXT_PUBLIC_EDGE_API_URL=http://localhost:8787 \\
NEXT_PUBLIC_EDGE_WS_URL=ws://localhost:8787/ws \\
npm run dev
```

```bash
# 3) Middleware (opcional)
cd codexion/apps/middleware
pip install -r requirements.txt
EDGE_GATEWAY_URL=http://localhost:8787 python main.py
```

## Observações

- O **edge-gateway** é **local-first** hoje e usa **SQLite** por padrão.
- O `postgres` no `docker-compose.yml` já fica pronto como base para evoluir o backend para DB compartilhado quando necessário.
 - BLE em container pode exigir permissões extras no host (dependendo do SO/driver).
