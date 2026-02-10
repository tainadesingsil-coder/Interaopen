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

## 🧪 Teste rápido: criar evento de interfone

```bash
curl -X POST http://localhost:8787/webhooks/intercom \
  -H "Content-Type: application/json" \
  -d '{"tower":"A","unit":"101","visitor_name":"Teste"}'
```

Abra o dashboard e veja o evento na timeline.

## ✅ Health check

```bash
curl http://localhost:8787/health
```

## Observações

- O **edge-gateway** é **local-first** hoje e usa **SQLite** por padrão.
- O `postgres` no `docker-compose.yml` já fica pronto como base para evoluir o backend para DB compartilhado quando necessário.
