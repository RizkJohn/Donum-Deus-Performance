.PHONY: dev test seed-library api web bot bot-daemon check-env

dev: ## run the full stack (postgres + api + web), mock provider by default
	docker compose up --build

api: ## run the API locally (sqlite, mock provider)
	cd apps/api && uvicorn deus_api.main:app --reload --port 8000

web: ## run the marketing site locally
	cd apps/web && npm run dev

test: ## run the engine test suite (mock provider, offline)
	cd apps/api && python3 -m pytest -q

seed-library: ## regenerate derived JSON from the canonical engine markdown
	cd apps/api && python3 scripts/port_library.py

check-env: ## report which production secrets are missing (see docs/SECRETS_SETUP.md)
	cd apps/api && python3 scripts/check_launch_readiness.py

bot: ## run the content bot once (generates POSTS_PER_RUN posts and exits)
	cd apps/content_bot && pip install -q -r requirements.txt && python3 bot.py

bot-daemon: ## run the content bot as a scheduler daemon (SCHEDULE_CRON env var)
	cd apps/content_bot && pip install -q -r requirements.txt && python3 bot.py --daemon
