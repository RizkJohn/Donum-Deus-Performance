# CLAUDE.md — apps/api

FastAPI engine pipeline service for Deus Performance.

## Stack

- Python 3.11, FastAPI ≥0.110, Pydantic v2, SQLAlchemy 2.0 (async)
- LLM: provider-agnostic. `LLM_PROVIDER=mock` (default, offline) or `claude`
  (Anthropic SDK, model `claude-opus-4-8` by default)
- DB: SQLite in dev (`deus.db`), Postgres in production

## Key environment variables

| Var | Default | Purpose |
|-----|---------|---------|
| `LLM_PROVIDER` | `mock` | `mock` or `claude` |
| `ANTHROPIC_API_KEY` | `""` | Required when `LLM_PROVIDER=claude` |
| `ANTHROPIC_MODEL` | `claude-opus-4-8` | Override model |
| `DATABASE_URL` | `sqlite+aiosqlite:///./deus.db` | Database connection |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed origins |

## Pipeline (`deus_api/engine/`)

```
GenerateRequest (validated)
  → decision_engine.build_plan()   # deterministic: day selection, CNS, volume, injuries
  → LLM provider (mock or claude)  # fills exercise slots only
  → qc/validator.validate()        # hard-rule gate — reject if any check fails
  → retry (≤ max_attempts=3)       # constrain offending fields on each retry
  → programme JSON or UNSATISFIABLE_CONSTRAINTS
```

The deterministic engine makes ALL structural decisions before the LLM is
called. The LLM's only job is selecting exercises from `allowed_exercises`.

## Module map

| Path | Purpose |
|------|---------|
| `deus_api/main.py` | FastAPI app factory + lifespan |
| `deus_api/config.py` | Settings (pydantic-settings, env-file) |
| `deus_api/engine/decision_engine.py` | Deterministic plan builder |
| `deus_api/engine/fatigue.py` | Fatigue scoring and volume reduction |
| `deus_api/engine/spec_loader.py` | Loads `packages/engine/*.md` at startup |
| `deus_api/engine/library_loader.py` | Loads `data/exercise_library.json` |
| `deus_api/engine/substitution.py` | Injury/equipment exercise blocking |
| `deus_api/engine/qc/checks.py` | Individual QC check functions |
| `deus_api/engine/qc/validator.py` | Runs all checks, returns QCReport |
| `deus_api/llm/mock.py` | Offline deterministic provider (tests) |
| `deus_api/llm/claude.py` | Anthropic SDK provider (claude-opus-4-8) |
| `deus_api/models/input_contract.py` | Pydantic `GenerateRequest` |
| `deus_api/models/decision.py` | `PrecomputedPlan`, `PlanDay`, coverage groups |
| `deus_api/routes/generate.py` | `POST /generate` |
| `deus_api/routes/assess.py` | `POST /assess` |

## Data files (`data/`)

`data/exercise_library.json` and `data/substitution_rules.json` are **derived**
from `packages/engine/*.md`. Never edit them by hand. Regenerate with:

```bash
make seed-library
# or: cd apps/api && python3 scripts/port_library.py
```

`apps/api/tests/test_library_sync.py` fails on drift between markdown and JSON.

## Running tests

```bash
make test
# or:
cd apps/api
pip install -e ".[dev]"
python3 -m pytest -q
```

Test suite is offline (mock provider). Run after any engine spec or Python change.
442 tests — includes a 400-case program contract test.

## CNS budget rule

The decision engine applies a **dynamic** High-CNS cap:
- `fatigue_score ≥ 4.0` ("high") → max **1** High-CNS training day
- `fatigue_score < 4.0` → max **2** High-CNS training days

No consecutive High-CNS days. Pre-sport day is always Low CNS.
This is enforced in `decision_engine.py` (plan building) and
`qc/checks.py::check_cns_limits` (validation).
