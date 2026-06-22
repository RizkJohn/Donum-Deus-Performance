# Skills — Deus Performance

Developer operations reference. All `make` targets run from the repo root.

## Make targets

| Target | Command | What it does |
|--------|---------|--------------|
| `make dev` | `docker compose up --build` | Full stack: Postgres + FastAPI (:8000) + Next.js (:3000) |
| `make api` | `uvicorn deus_api.main:app --reload --port 8000` | FastAPI service only (SQLite, mock LLM) |
| `make web` | `cd apps/web && npm run dev` | Next.js site only (:3000) |
| `make test` | `cd apps/api && python3 -m pytest -q` | Full Python test suite (offline, ~442 cases) |
| `make seed-library` | `cd apps/api && python3 scripts/port_library.py` | Regenerate `apps/api/data/*.json` from engine markdown |
| `make bot` | `cd packages/content-gen && python3 bot.py` | Run content bot once |
| `make bot-daemon` | `cd packages/content-gen && python3 bot.py --daemon` | Run content bot as scheduler |

## Python API (`apps/api/`)

```bash
# Install
cd apps/api && pip install -e ".[dev]"

# Run tests
python3 -m pytest -q                   # all tests
python3 -m pytest tests/test_qc_checks.py -v   # specific file
python3 -m pytest -k "fatigue" -v      # filter by keyword

# Regenerate derived JSON
python3 scripts/port_library.py

# Run with real LLM
LLM_PROVIDER=claude ANTHROPIC_API_KEY=sk-ant-... uvicorn deus_api.main:app --reload
```

## Next.js web (`apps/web/`)

```bash
cd apps/web
npm install
npm run dev        # dev server on :3000
npm run build      # standalone build for deployment
npx tsc --noEmit   # type-check (must pass before commit)
npm run lint       # ESLint
```

Environment: copy `.env.local.example` → `.env.local`, set `ANTHROPIC_API_KEY`.

## Engine spec files (`packages/engine/`)

```bash
# After editing exercise_library.md or substitution_rules.md:
make seed-library   # regenerate apps/api/data/*.json
make test           # verify no drift

# Test a specific QC rule change:
cd apps/api && python3 -m pytest tests/test_qc_checks.py -v
```

## Docker full stack

```bash
docker compose up --build       # start all services
docker compose down             # stop
docker compose down -v          # stop + wipe volumes (DB reset)
```

Services: `db` (Postgres :5432), `api` (FastAPI :8000), `web` (Next.js :3000).
No API key required — the API defaults to the mock LLM provider.

## Git workflow

```bash
# Working branch: claude/brave-thompson-6ljrq6
git push -u origin claude/brave-thompson-6ljrq6

# Conventional Commits scope reference:
# feat(engine): ...    packages/engine/ changes
# feat(api): ...       apps/api/ changes
# feat(web): ...       apps/web/ changes
# feat(content-gen):   packages/content-gen/ changes
# docs: ...            documentation changes
# chore: ...           tooling, deps, CI
```

## Content bot (`packages/content-gen/`)

```bash
cd packages/content-gen
pip install -r requirements.txt
python3 bot.py              # generate POSTS_PER_RUN posts and exit
python3 bot.py --daemon     # run as scheduler (SCHEDULE_CRON env var)
```

Requires `NOTION_TOKEN` and `ANTHROPIC_API_KEY` environment variables.
