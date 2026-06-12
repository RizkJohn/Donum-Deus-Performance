# Deus Performance — Product Architecture

> Foundational architecture for the live product. The `engine/` markdown specs
> remain the **source of truth** for all training logic; this document defines
> how those specs become a running system.

## Guiding decisions

| Decision | Choice | Rationale |
|---|---|---|
| First milestone | Engine pipeline + revamped landing | Highest-value foundation; no auth/payments yet |
| Backend | Python 3.11, FastAPI, PostgreSQL | Pydantic maps 1:1 to the engine JSON contracts |
| LLM layer | Provider-agnostic interface | Claude (Anthropic) default; mock provider for key-free dev/tests; Qwen3/DeepSeek/OpenAI swappable |
| Frontend | Next.js + React + Tailwind | SEO, analytics, funnel A/B testing — parity with top coaching platforms |
| Repo shape | Monorepo (`apps/`, `packages/`) | One contract, two consumers (API + web) |

## System diagram

```
            apps/web (Next.js)                       apps/api (FastAPI)
┌───────────────────────────────┐      ┌─────────────────────────────────────┐
│ Landing  →  /assess funnel    │ POST │ /v1/assess          /v1/generate    │
│ (lead capture, 4-step quiz)   │─────▶│      │                   │          │
│ /program/[id] result view     │◀─────│      ▼                   ▼          │
└───────────────────────────────┘ JSON │  Lead store      ┌──────────────┐   │
                                       │  (Postgres)      │   PIPELINE   │   │
                                       │                  └──────┬───────┘   │
                                       └─────────────────────────┼───────────┘
                                                                 │
        ┌────────────────────────────────────────────────────────┤
        │ 1. Input validation     (Pydantic ← input_contract.md) │
        │ 2. Decision engine      (deterministic: CNS split,     │
        │    volume budget, movement coverage, fatigue rules)    │
        │ 3. Prompt assembly      (prompt_wrapper.md roles:      │
        │    SYSTEM=engine_instructions, DEVELOPER=specs+plan)   │
        │ 4. LLM provider         (claude | mock | …) fills      │
        │    exercise slots only — never safety logic            │
        │ 5. QC gate              (one check per hard rule)      │
        │ 6. Retry orchestrator   (≤3 attempts, constrain        │
        │    offending fields, simplify on repeat failure)       │
        │ 7. Persist + return     (program_runs table)           │
        └────────────────────────────────────────────────────────┘
```

**The determinism boundary is the safety case.** The LLM never decides CNS
distribution, volume, coverage, fatigue response, or progression flags — the
decision engine pre-computes a `PrecomputedPlan` (weekly split, CNS per day,
per-session slot budget, required movement patterns, allowed exercise pool)
and the LLM only fills exercise slots within it. The QC gate re-validates
every hard rule regardless of what the model returns.

## Repository layout

```
.
├── engine/               # Markdown specs — SOURCE OF TRUTH (loaded as prompts)
├── apps/
│   ├── api/              # FastAPI engine pipeline service
│   │   ├── deus_api/
│   │   │   ├── models/   # Pydantic contracts (input_contract, program, library)
│   │   │   ├── engine/   # spec_loader, decision_engine, fatigue, qc/, retry, pipeline
│   │   │   ├── llm/      # base (Protocol), claude, mock, factory
│   │   │   ├── routes/   # /v1/generate, /v1/assess, /healthz
│   │   │   └── db/       # SQLAlchemy models + session (leads, program_runs)
│   │   ├── data/         # exercise_library.json, substitution_rules.json (DERIVED)
│   │   ├── scripts/      # port_library.py (markdown → JSON generator)
│   │   └── tests/
│   └── web/              # Next.js marketing site + assessment funnel
├── packages/schemas/     # Shared JSON Schemas (derived from engine/*.md)
├── frontend/             # Legacy static mockups (deus_v2.html = design reference)
├── docker-compose.yml    # postgres + api + web
└── Makefile              # make dev / make test / make seed-library
```

## Engine spec → code mapping

| Spec file | Consumed as | By |
|---|---|---|
| `engine_instructions.md` | SYSTEM prompt text, verbatim | `spec_loader` |
| `output_schema.md` | JSON Schema (extracted) + Pydantic `Program` model + DEVELOPER prompt | schemas, models, prompt |
| `input_contract.md` | Pydantic `GenerateRequest` model | API validation (422 on malformed) |
| `exercise_library.md` | Parsed at build time → `data/exercise_library.json` | decision engine, QC, prompt |
| `substitution_rules.md` | Parsed at build time → `data/substitution_rules.json` | substitution resolver |
| `fatigue_model.md` | Deterministic Python (`fatigue.py`) + DEVELOPER prompt | decision engine |
| `progression_engine.md` | Deterministic flag computation + DEVELOPER prompt | decision engine |
| `quality_control.md` | One Python check function per rule + DEVELOPER prompt | QC gate |
| `retry_policy.md` | Retry orchestrator behavior | `retry.py` |
| `prompt_wrapper.md` | Role assignment for prompt assembly | `prompt_builder` |

**Markdown stays canonical.** Structured data (library, substitutions) is
ported to JSON by `scripts/port_library.py`; a sync test fails CI if the
committed JSON drifts from the markdown. Never hand-edit the derived JSON.
Code reads **lowercase** spec files only (per CLAUDE.md, they are the source
of truth; UPPERCASE files are narrative companions).

## QC gate — hard-rule checklist

Each is a pure function returning `{name, passed, offending_fields, reasons}`:

1. `schema_valid` — strict structural validation (`additionalProperties:false`, enums, regexes, sets 1–6, notes ≤120)
2. `cns_limits` — ≤2 High-CNS days/week; no consecutive High days
3. `pre_sport_low_cns` — day before any sport day is Low CNS
4. `movement_coverage` — week covers squat, hinge, push, pull, rotation/anti-rotation, carry/locomotion, jump
5. `block_order` — Warmup→Power→Strength→Accessory→Core→Mobility; days Mon→Sun
6. `library_only` — every exercise name exists exactly in the library
7. `volume_ok` — ≤8 exercises per session
8. `intensity_safety` — no AMRAP/failure on Power/Strength primaries (1–3 RIR)
9. `fatigue_applied` — fatigue ≥4.0 ⇒ volume reduced ~30%, intensity untouched
10. `progression_flag` — flags contain the deterministically computed progress/maintain/deload
11. `training_days_match` — sessions only on available, non-sport days

Failure ⇒ retry (≤3) with offending fields constrained; final failure ⇒
`{"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]}` — never a partial plan.

## LLM provider interface

```python
class LLMProvider(Protocol):
    name: str
    async def generate(self, *, system: str, developer: str, user: str,
                       json_schema: dict) -> GenerationResult: ...
```

- `ClaudeProvider` — Anthropic SDK, schema-constrained JSON output, prompt
  caching on the static spec blocks, refusal handling.
- `MockProvider` — deterministic, offline, key-free: builds a valid program
  directly from the `PrecomputedPlan` + library. Powers all tests and local
  dev (`LLM_PROVIDER=mock`, the default). Has a fault-injection mode to test
  the retry path.
- Selection via `LLM_PROVIDER` env var in `llm/factory.py`.

## Web app (marketing + funnel)

- **Landing (`/`)** — revamp of `deus_v2.html` design (dark sage palette
  `#0b0f0c` / accent `#7caf58`; Playfair Display / DM Mono / Libre
  Baskerville via `next/font`), restructured for conversion: hero with single
  CTA → free AI assessment, social proof, method, three-tier pricing
  (Self-Service / Hybrid / Premium per business blueprint), FAQ, final CTA.
- **Funnel (`/assess`)** — multi-step quiz mapping 1:1 to `input_contract.md`
  (profile → goals → schedule → state → email/review), POSTs to
  `/v1/assess`, routes to result.
- **Result (`/program/[id]`)** — renders weekly split (CNS badges), session
  cards, block tables.
- SEO: per-route metadata, sitemap, robots, OpenGraph, JSON-LD.

## Local development

```
docker compose up        # postgres + api (mock provider) + web — no API key needed
make test                # pytest: unit + 100-program contract test (mock provider)
LLM_PROVIDER=claude ANTHROPIC_API_KEY=... # switch to real generation
```

## Deferred (documented stubs)

- Fatigue sub-scores (sleep/soreness/energy/stress) in the input contract —
  payload currently carries a single `fatigue_score`; averaging helper exists.
- Deload-every-6–8-weeks needs training-history persistence (program_runs is
  the seed for this).
- Auth, payments, dashboard, check-ins, chat coach, Redis/Qdrant — later
  milestones per the business roadmap.
