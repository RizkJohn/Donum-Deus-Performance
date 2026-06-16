.PHONY: dev test seed-library api web bot bot-daemon n8n n8n-import n8n-logs n8n-shell

dev: ## run the full stack (postgres + api + web + n8n), mock provider by default
	docker compose up --build

api: ## run the API locally (sqlite, mock provider)
	cd apps/api && uvicorn deus_api.main:app --reload --port 8000

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

n8n: ## start n8n only (http://localhost:5678 — create owner account on first launch)
	docker compose up postgres n8n

n8n-import: ## import all workflows from n8n/workflows/ into the running n8n container
	docker compose exec n8n n8n import:workflow --separate --input=/workflows

n8n-logs: ## tail n8n container logs
	docker compose logs -f n8n

n8n-shell: ## open a shell inside the n8n container
	docker compose exec n8n sh
