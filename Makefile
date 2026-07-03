.PHONY: dev test seed-library api web bot bot-daemon migrate migration

dev: ## run the full stack (postgres + api + web), mock provider by default
	docker compose up --build

api: ## run the API locally (sqlite, mock provider)
	cd apps/api && uvicorn deus_api.main:app --reload --port 8000

migrate: ## apply pending Alembic migrations to $DATABASE_URL (or .env)
	cd apps/api && alembic upgrade head

migration: ## autogenerate a new migration from model changes: make migration m="add x"
	cd apps/api && alembic revision --autogenerate -m "$(m)"

web: ## run the marketing site locally
	cd apps/web && npm run dev

test: ## run the engine test suite (mock provider, offline)
	cd apps/api && python3 -m pytest -q

seed-library: ## regenerate derived JSON from the canonical engine markdown
	cd apps/api && python3 scripts/port_library.py

bot: ## run the content bot once (generates POSTS_PER_RUN posts and exits)
	cd apps/content_bot && pip install -q -r requirements.txt && python3 bot.py

bot-daemon: ## run the content bot as a scheduler daemon (SCHEDULE_CRON env var)
	cd apps/content_bot && pip install -q -r requirements.txt && python3 bot.py --daemon
