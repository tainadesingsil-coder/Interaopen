.PHONY: help setup start stop restart logs clean ps test

COMPOSE ?= docker compose

help:
	@echo "Comandos disponíveis:"
	@echo "  make setup    - Configura ambiente pela primeira vez"
	@echo "  make start    - Inicia todos os serviços"
	@echo "  make stop     - Para todos os serviços"
	@echo "  make restart  - Reinicia todos os serviços"
	@echo "  make ps       - Mostra status dos containers"
	@echo "  make logs     - Logs em tempo real"
	@echo "  make clean    - Remove volumes e dados"
	@echo "  make test     - Roda testes do edge-gateway"

setup:
	@test -f .env || cp .env.example .env
	$(COMPOSE) build

start:
	$(COMPOSE) up -d
	@echo "✅ Serviços rodando!"
	@echo "📊 Dashboard: http://localhost:3000"
	@echo "🔌 Edge API: http://localhost:8787"
	@echo "🗄️  PostgreSQL: localhost:5432"
	@echo "🧠 Middleware API: http://localhost:8081"

stop:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

clean:
	$(COMPOSE) down -v

test:
	$(COMPOSE) exec edge-gateway npm test
