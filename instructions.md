# Instructions — Deus Performance

Developer setup and working guide for the Deus Performance monorepo.

## Prerequisites

- Node.js 20+, npm 10+
- Python 3.11+
- Docker + Docker Compose (for full-stack local development)
- An Anthropic API key (only needed to test the real LLM path)

## First-time setup

### Full stack (recommended)

```bash
git clone git@github.com:RizkJohn/Donum-Deus-Performance.git
cd Donum-Deus-Performance
docker compose up --build
```

Open `http://localhost:3000` (web) and `http://localhost:8000/docs` (FastAPI).
No API key needed — the API defaults to the offline mock LLM.

### Web only

```bash
cd apps/web
npm install
cp .env.local.example .env.local   # add ANTHROPIC_API_KEY if testing /api/generate
npm run dev
```

### API only

```bash
cd apps/api
pip install -e ".[dev]"
uvicorn deus_api.main:app --reload --port 8000
```

## Monorepo structure

The repo is organised into three zones:

| Zone | Path | Language |
|------|------|----------|
| Engine specs | `packages/engine/` | Markdown (prompt files) |
| Backend API | `apps/api/` | Python 3.11 |
| Frontend | `apps/web/` | TypeScript / Next.js |
| Content bot | `packages/content-gen/` | Python |
| Edge stubs | `api/` | TypeScript (Vercel) |

## Where logic lives

The training engine is defined in **markdown**, not code. `packages/engine/*.md`
files are the source of truth. Both the Python API and the Next.js proxy load
them at runtime as LLM prompts.

The **deterministic engine** (day selection, CNS assignment, volume budget,
injury filtering) is implemented in two places and must be kept in sync:

- Python: `apps/api/deus_api/engine/decision_engine.py`
- TypeScript: `apps/web/src/app/api/generate/route.ts`

## Making changes

### Changing a training rule

1. Edit the relevant `packages/engine/*.md` file.
2. If you changed `exercise_library.md` or `substitution_rules.md`, run
   `make seed-library` to regenerate `apps/api/data/*.json`.
3. Update both Python and TypeScript implementations if the rule affects the
   deterministic engine.
4. Run `make test` — all 442 tests must pass.

### Changing the exercise library

1. Edit `packages/engine/exercise_library.md`.
2. Update `packages/engine/substitution_rules.md` if substitution paths change.
3. Run `make seed-library`.
4. Run `make test` (test_library_sync.py will catch drift).

### Changing the web UI

1. `cd apps/web && npm run dev`.
2. Edit components in `src/components/` or pages in `src/app/`.
3. Run `npx tsc --noEmit` — must pass with 0 errors.
4. Run `npm run lint`.

### Adding a new API route (Python)

Routes live in `apps/api/deus_api/routes/`. Register new routers in
`deus_api/main.py`. All input/output models go in `deus_api/models/`.

## LLM providers

The Python API supports two providers (set via `LLM_PROVIDER`):

| Provider | Use case | Key required |
|----------|----------|--------------|
| `mock` (default) | Tests, local dev, CI | No |
| `claude` | Production, integration testing | `ANTHROPIC_API_KEY` |

The mock provider (`deus_api/llm/mock.py`) builds a deterministic programme
directly from the precomputed plan without an API call. It is the only
provider used in the test suite.

The Next.js `/api/generate` route always calls Claude (`claude-sonnet-4-6`).
Set `ANTHROPIC_API_KEY` in `apps/web/.env.local`.

## Testing

```bash
make test             # all Python tests (offline)
cd apps/api && python3 -m pytest tests/test_qc_checks.py -v   # QC rules only
cd apps/api && python3 -m pytest tests/test_100_programs.py -v # contract tests
cd apps/web && npx tsc --noEmit    # TypeScript type check
```

Tests are offline — no network, no API key, no database required.

## Deployment

The web app deploys to Vercel as a standalone Next.js output. Key config
in `apps/web/next.config.ts`:

- `output: "standalone"` — self-contained serverless bundle.
- `outputFileTracingRoot` set to repo root so `packages/engine/*.md` and
  `apps/api/data/*.json` are included in the bundle for `/api/generate`.

The Python API can be deployed as a Docker container (`apps/api/Dockerfile`).

## Branch and PR conventions

- Active feature branch: `claude/brave-thompson-6ljrq6` (PR #10).
- Never push directly to `main`.
- Conventional Commits: `feat(scope): description`.
- Do not create PRs unless explicitly requested.

## Key files at a glance

| File | Why you'd edit it |
|------|-------------------|
| `packages/engine/engine_instructions.md` | Change core training rules |
| `packages/engine/exercise_library.md` | Add/remove exercises |
| `packages/engine/quality_control.md` | Modify QC checks |
| `packages/engine/output_schema.md` | Change programme JSON shape |
| `apps/api/deus_api/engine/decision_engine.py` | Python deterministic engine |
| `apps/web/src/app/api/generate/route.ts` | TypeScript deterministic engine + proxy |
| `apps/api/deus_api/engine/qc/checks.py` | Python QC check implementations |
| `scripts/seed.sql` | Supabase schema |
| `docker-compose.yml` | Service orchestration |
