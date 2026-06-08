# ─────────────────────────────────────────────────────────────
# Delly Gold — Docker helpers
# Auto-detects docker compose v2 vs docker-compose v1
# Usage: make up | make down | make logs | make rebuild
# ─────────────────────────────────────────────────────────────

# Detect compose command
COMPOSE := $(shell docker compose version > /dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

.PHONY: up down logs restart rebuild shell status clean help

## Start containers in background (build if needed)
up:
	$(COMPOSE) up -d --build

## Stop and remove containers
down:
	$(COMPOSE) down

## Follow logs
logs:
	$(COMPOSE) logs -f

## Restart app container
restart:
	$(COMPOSE) restart app

## Full rebuild — no cache
rebuild:
	$(COMPOSE) down
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

## Open shell in running container
shell:
	$(COMPOSE) exec app sh

## Show container status
status:
	$(COMPOSE) ps

## Remove containers + volumes (WARNING: deletes database!)
clean:
	@echo "⚠️  This will DELETE the database volume!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
	$(COMPOSE) down -v

## Show this help
help:
	@echo ""
	@echo "  Delly Gold — Docker commands"
	@echo "  ─────────────────────────────"
	@grep -E '^## ' Makefile | sed 's/## /  /'
	@echo ""
