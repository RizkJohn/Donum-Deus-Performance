# Deus Performance — Product Architecture

> Foundational architecture for the live product. The `engine/` markdown specs
> remain the **source of truth** for all training logic; this document defines
> how those specs become a running system.

## Guiding decisions

| Decision | Choice | Rationale |
|---|---|---|
| First milestone | Engine pipeline + revamped landing | Highest-value foundation |
| Accounts | Stateless JWT (FastAPI) + httpOnly cookie BFF (Next.js) | Two separately-deployed services; Next.js Route Handlers hold the browser-facing session, FastAPI stays a pure token-verifying API |
| Billing | Stripe Checkout + Billing Portal | No self-built payment/subscription logic; tier↔price resolved server-side from env, never hardcoded client-side |
| Email | Provider-agnostic (`mock`\|`resend`) | Same pattern as `LLM_PROVIDER` — offline by default, one real provider swapped in via env |
| Backend | Python 3.11, FastAPI, PostgreSQL | Pydantic maps 1:1 to the engine JSON contracts |
| LLM layer | Provider-agnostic + tiered models | Claude (Anthropic) default; mock provider for key-free dev/tests. Tiered per stage: Opus 4.8 reasons over the assessment, Sonnet 4.6 generates sessions, Haiku 4.5 powers chat — assessment is deterministic by default so Opus only bills on demand |
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
        ┌────────────────────────────────────────────────────────┐
        │ 0. Athlete state        (load/init by email; exposure, │
        │    fatigue index, compliance fold forward each cycle)  │
        │ 1. Input validation     (Pydantic ← input_contract.md) │
        │ 2. Assessment Layer     (DETERMINISTIC abstractions:   │
        │    readiness, training state, stimulus, priorities,    │
        │    novelty target, intensity, exclusions — not workouts)│
        │ 3. Variation engine     (novelty scoring vs exposure;  │
        │    reorder allowed pool, prioritise under-trained)     │
        │ 4. Decision engine      (deterministic: CNS split,     │
        │    volume budget, coverage, fatigue; consumes 2 & 3)   │
        │ 5. Prompt assembly      (prompt_wrapper.md roles +     │
        │    compressed programming directives)                  │
        │ 6. LLM provider         (Sonnet generation tier) fills │
        │    exercise slots only — never safety logic            │
        │ 7. QC gate              (one check per hard rule)      │
        │ 8. Retry orchestrator   (≤3 attempts, constrain fields)│
        │ 9. Persist + return     (program_runs + athlete_states;│
        │    program + coach's read + state summary)             │
        └────────────────────────────────────────────────────────┘
   Reinforcement: POST /v1/feedback (completion/RPE/soreness) ──▶ athlete_states
```

**The determinism boundary is the safety case.** Both the Assessment Layer and
the decision engine are deterministic. The LLM never decides CNS distribution,
volume, coverage, fatigue response, progression flags, readiness, or stimulus —
the decision engine pre-computes a `PrecomputedPlan` (weekly split, CNS per day,
per-session slot budget, required movement patterns, allowed exercise pool) and
the LLM only fills exercise slots within it. The QC gate re-validates every hard
rule regardless of what the model returns.

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
│   │   │   ├── routes/   # /v1/generate, /v1/assess, /v1/auth/*, /v1/me/*,
│   │   │   │             # /v1/billing/*, /healthz
│   │   │   ├── auth/     # hashing (bcrypt), tokens (PyJWT), get_current_user dep
│   │   │   ├── billing/  # thin Stripe SDK wrapper (client.py)
│   │   │   ├── email/    # base (Protocol), mock, resend_provider, factory
│   │   │   └── db/       # SQLAlchemy models + session (leads, program_runs, users)
│   │   ├── alembic/      # migrations — env.py reads DATABASE_URL + Base.metadata
│   │   ├── data/         # exercise_library.json, substitution_rules.json (DERIVED)
│   │   ├── scripts/      # port_library.py (markdown → JSON generator)
│   │   └── tests/
│   └── web/              # Next.js marketing site + assessment funnel
├── packages/schemas/     # Shared JSON Schemas (derived from engine/*.md)
├── frontend/             # Legacy static mockups (deus_v2.html = design reference)
├── docker-compose.yml    # postgres + api + web
└── Makefile              # make dev / make test / make seed-library / make migrate
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
| `assessment_layer.md` | Deterministic `assess()` → `TrainingAssessment` | `engine/assessment.py` |
| `athlete_state.md` | Persistent state lifecycle (load/exposure/feedback) | `engine/athlete_state.py`, `db/models.py` |
| `variation_engine.md` | Novelty scoring + pool prioritisation | `engine/variation.py` |
| `reinforcement_signals.md` | Feedback fold-in | `routes/feedback.py`, `engine/athlete_state.py` |

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

- **Landing (`/`)** — philosophy-driven doctrine site (parchment/navy palette;
  Playfair Display / DM Mono / Libre Baskerville via `next/font`): Hero →
  DoctrineQuote → Principles → Inscription → OrderSection → FinalCta. Dedicated
  sub-pages carry the rest: `/philosophy`, `/methodology`, `/curriculum`
  (pricing — see `lib/pricing.ts`), `/dispatches`, `/reference`,
  `/correspondence`. (`Pricing.tsx`/`Faq.tsx`/`HowItWorks.tsx`/`Method.tsx`/
  `FieldReports.tsx` exist but are not currently imported by any route — kept
  in sync, not wired in.)
- **Funnel (`/assess`)** — multi-step quiz mapping to `input_contract.md`
  (profile → goals → schedule → state → practice/preferences → email/review,
  with an optional "create an account" checkbox on the final step), POSTs to
  `/v1/assess`, routes to result.
- **Result (`/program/[id]`)** — the **Coach's Read** (the `TrainingAssessment`
  abstraction: readiness, training state, stimulus, priorities, intensity),
  weekly split (CNS badges), session cards, block tables, a **downloadable
  branded program PDF** (`@react-pdf/renderer`, client-side — zero server cost),
  and a **check-in form** posting reinforcement signals to `/v1/feedback`.
- **Dashboard (`/dashboard`)** — protected (see below); current program +
  history, reusing `ProgramView`/`CoachsRead`/`DownloadPdfButton`.
- SEO: per-route metadata, sitemap, robots, OpenGraph, JSON-LD.

## Accounts, billing, and email

- **Accounts**: FastAPI (`routes/auth.py`) issues a stateless JWT on
  signup/login (`bcrypt` hash, `PyJWT` sign, `AUTH_JWT_SECRET` — override in
  any real deployment). Next.js Route Handlers under `app/api/auth/*` are the
  actual session boundary: they call FastAPI, then set an httpOnly `deus_session`
  cookie on the *web* origin, sidestepping cross-origin cookie issues between
  the two separately-deployed services. `proxy.ts` (Next.js 16's file
  convention, formerly `middleware.ts`) protects `/dashboard`. `GET
  /v1/me/programs` (`routes/me.py`) joins `Lead.email == current_user.email` —
  the same join `routes/assess.py` already uses for GDPR export — so an
  account sees every program ever generated for its address, including ones
  from before the account existed. No FK added to `program_runs`/`leads` —
  deliberate, to avoid coupling accounts to the funnel's pre-signup data;
  Alembic (`apps/api/alembic/`) could add one in a future migration if that
  changes, but it isn't a tooling limitation anymore.
- **Billing**: `routes/billing.py` — `POST /v1/billing/checkout {tier}` creates
  a Stripe Checkout Session (tier→price resolved from `STRIPE_PRICE_*` env
  vars); `POST /v1/billing/portal` opens the Billing Portal; `POST
  /v1/billing/webhook` (signature-verified) syncs `User.subscription_tier
  /status` on `checkout.session.completed` / `customer.subscription.updated
  /deleted`. `app/checkout/route.ts` is a redirecting Next.js Route Handler
  (not a page) — pricing CTAs link to it with a plain `<a>`, not `next/link`,
  since `Link`'s client-side soft-navigation would issue an RSC prefetch
  instead of following the redirect. Returns a clear 400 instead of an SDK
  crash when Stripe env vars are unset.
- **Email**: mirrors the `llm/` provider-agnostic pattern exactly —
  `EMAIL_PROVIDER=mock` (default, offline, in-memory outbox for tests) |
  `resend`. Triggers: program-ready email after a successful `/v1/assess`,
  welcome email on signup.

## Local development

```
docker compose up        # postgres + api (mock provider) + web — no API key needed
make test                # pytest: unit + 100-program contract test (mock provider)
LLM_PROVIDER=claude ANTHROPIC_API_KEY=... # switch to real generation
make migrate              # apply Alembic migrations to $DATABASE_URL
make migration m="..."    # autogenerate a new migration from a model change
```

Schema changes: edit `db/models.py`, then `make migration m="..."` to
autogenerate the revision, review the generated `alembic/versions/*.py` by
hand, and commit it alongside the model change. The Docker image runs
`alembic upgrade head` before `uvicorn` starts, so any deployed environment
(docker-compose's Postgres today, whatever hosts production Postgres next)
picks up new migrations on deploy automatically.

## Shipped in this milestone

- Persistent athlete state (`athlete_states`), two-layer Assessment→Programming
  split, variation/novelty engine, reinforcement signals (`/v1/feedback`),
  tiered models, and a client-rendered program PDF.
- Accounts (signup/login/dashboard), Stripe billing (checkout/portal/webhook),
  and provider-agnostic email delivery (program-ready + welcome).

## Known gotcha — CSP vs. dev-mode hydration

`next.config.ts`'s CSP `script-src` has no `unsafe-eval`. Turbopack's **dev**
client relies on `eval()` for HMR, so under `next dev` the browser silently
blocks it and React never finishes hydrating — buttons/forms fall back to raw
HTML behavior (e.g. a form native-submits as a GET instead of running its
`onSubmit`). Production builds never call `eval()`, so `next build && next
start` is unaffected. **Verify interactive changes against a production
build, not `next dev`**, until this is resolved (tracked: either add a CSP
nonce for dev builds only, or accept dev-mode's reduced HMR fidelity).

## Deferred (documented stubs)

- Gating the PDF/ongoing adaptation behind the subscription status Stripe
  reports (billing is wired; enforcement is not).
- Haiku chat-coach surface (model tier configured; UI not built).
- Password reset / email verification; OAuth/social login.
- Long-horizon mesocycle planning beyond per-cycle exposure/compliance
  (deload-every-6–8-weeks); program_runs + athlete_states are the seed.
- Redis/Qdrant.
