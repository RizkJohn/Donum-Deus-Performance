# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this repository is

**Deus Performance (DP)** — by Riz Management LLC — is a
**constraint-driven adaptive training engine**. The repo contains:

1. **`packages/engine/`** — the "brain": lowercase markdown spec files defining
   how an LLM generates weekly training programs from a structured client payload.
   Loaded as prompts at runtime; never compiled. **Source of truth** for all
   training logic.
2. **`apps/api/`** — FastAPI engine pipeline service (Python 3.11, Pydantic v2,
   SQLAlchemy). Provider-agnostic LLM layer: `LLM_PROVIDER=mock` (default;
   deterministic, offline, no API key) or `claude` (Anthropic SDK,
   `claude-opus-4-8`). Pipeline: input validation → deterministic decision engine
   → LLM exercise-fill → QC gate → retry (≤3) → program or
   `UNSATISFIABLE_CONSTRAINTS`.
3. **`apps/web/`** — Next.js 16 + Tailwind marketing site + assessment funnel
   (live frontend; dark sage design ported from `frontend/deus_v2.html`).
   Includes a server-side Anthropic proxy at `src/app/api/generate/route.ts`
   (`claude-sonnet-4-6`; API key never leaves the server).
4. **`api/`** — Vercel Edge Function stubs at repo root: `generate.ts`,
   `intake.ts`, `apply.ts`, `newsletter.ts`. Architecture reference stubs;
   real programme generation is served by `apps/web/src/app/api/generate/`.
5. **`packages/schemas/`** — shared JSON Schemas derived from `packages/engine/*.md`.
6. **`packages/content-gen/`** — social content generator (Python bot).
7. **`frontend/`** — legacy standalone HTML mockups (design reference only;
   `deus_v2.html` is the source for the Next.js port).
8. **`scripts/seed.sql`** — Supabase schema (practitioners, intake_profiles,
   programmes, applications, subscribers).
9. **`docs/architecture/`** — system design and reference guides.
10. **`docs/deprecated/`** — archived documents no longer operationally relevant.

**Derived-data discipline:** `apps/api/data/*.json` is generated from the
engine markdown by `make seed-library` — never hand-edit the JSON;
`apps/api/tests/test_library_sync.py` fails on drift.

## Repository layout

```
.
├── packages/
│   ├── engine/        # Training-system spec files — SOURCE OF TRUTH (lowercase only)
│   ├── content-gen/   # Social content generator (Python bot)
│   └── schemas/       # Shared JSON Schemas (derived from engine/)
├── apps/
│   ├── api/           # FastAPI engine pipeline (deus_api/, data/, scripts/, tests/)
│   └── web/           # Next.js 16 marketing site + assessment funnel
│       └── src/
│           ├── app/
│           │   ├── (marketing)/  # /, /doctrine, /about, /apply
│           │   ├── journal/      # Blog (MDX)
│           │   ├── engine/       # Auth-gated programme tool (T1+)
│           │   ├── dashboard/    # Practitioner portal (auth-gated)
│           │   └── api/generate/ # Server-side Anthropic proxy (Node.js runtime)
│           ├── components/       # Shared UI components
│           └── content/          # MDX blog articles
├── api/               # Vercel Edge Function stubs (architecture reference)
├── scripts/
│   └── seed.sql       # Supabase schema seed
├── frontend/          # Legacy static HTML mockups (design reference)
├── docs/
│   ├── architecture/  # ARCHITECTURE.md + reference guides
│   └── deprecated/    # Archived documents
├── docker-compose.yml # postgres + api (:8000) + web (:3000)
├── Makefile           # make dev / test / seed-library / api / web
└── README.md          # Top-level overview
```

## Running & testing

- `docker compose up --build` — full stack, no API key needed (mock provider).
- `make test` — pytest suite in `apps/api/tests/` (offline; includes a 400+
  case program contract test). Run after any engine or API change.
- `make seed-library` — regenerate `apps/api/data/*.json` after editing
  `packages/engine/exercise_library.md` or `packages/engine/substitution_rules.md`.
- Web: `cd apps/web && npm install && npm run dev` (starts on `:3000`).
- For `/api/generate` to work locally, set `ANTHROPIC_API_KEY` in
  `apps/web/.env.local` (see `apps/web/.env.local.example`).

## The engine (`packages/engine/`)

The engine is a pipeline of constraints. An LLM receives a structured client
payload and must return a complete weekly program as **JSON only — no prose.**

Flow: `input_contract` → `engine_instructions` + `fatigue_model` +
`progression_engine` → `quality_control` gate → `output_schema`, with
`substitution_rules` applied for equipment/injury constraints.

Only **lowercase** spec files exist in `packages/engine/`. These are the
canonical, terse, machine-spec versions — JSON schemas, enums, rule lists.
There are no uppercase companion files.

### Engine file map

| File | Role | Prompt slot |
|------|------|-------------|
| `engine_instructions.md` | Master rules: determinism, priority, selection, ordering, failure | SYSTEM |
| `output_schema.md` | Enforced programme output JSON schema | DEVELOPER |
| `exercise_library.md` | Approved exercise pool (`id`, `name`, `pattern`, `cns`, `laterality`) | DEVELOPER |
| `substitution_rules.md` | `primary_id → [alt_ids]`; preserve pattern + cns | DEVELOPER |
| `progression_engine.md` | Load steps (+2.5% / +5%) and `progress/maintain/deload` flags | DEVELOPER |
| `fatigue_model.md` | Fatigue scoring (0–5) and `low/moderate/high` thresholds | DEVELOPER |
| `quality_control.md` | Pre-output QC gate; all checks must pass or regenerate | DEVELOPER |
| `input_contract.md` | Client payload JSON schema (passed as USER message) | USER |
| `retry_policy.md` | Max 3 attempts, constrain offending fields, simplify on repeat | reference |
| `prompt_wrapper.md` | SYSTEM / DEVELOPER / USER role assignments | reference |

### Hard engine rules (do not violate when editing specs)

These constraints are load-bearing — keep them internally consistent across
all files if you touch them:

- **Output is JSON only.** No prose. On unsatisfiable input, return
  `{"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]}`.
- **CNS budget is dynamic:** fatigue_score ≥ 4.0 ("high") → max **1** High-CNS
  day; moderate/low → max **2** High-CNS days. No consecutive High days.
  Pre-sport day is always Low CNS.
- **Weekly movement coverage required:** squat, hinge, push (h/v), pull (h/v),
  rotation/anti-rotation, carry/locomotion, jump.
- **Block order is fixed:** Warmup → Power → Strength → Accessory → Core →
  Mobility. Days order Mon→Sun.
- **Exercises must match the library exactly** — no synonyms, no invented
  exercises. Equipment/injury blocks resolve only via `substitution_rules.md`.
- Never train to failure on primary lifts (1–3 RIR). Volume ≤ 8 exercises/session.
- Objective hierarchy (never reorder): Joint Integrity → Movement Quality →
  Strength → Work Capacity → Hypertrophy → Sport/Skill.

When changing a schema enum, value range, or exercise name, **propagate the
change** to every file that references it (e.g. a new pattern must appear in
`exercise_library`, `quality_control` coverage list, and `engine_instructions`).

## Web routes (`apps/web/src/app/`)

| Route | File | Status |
|-------|------|--------|
| `/` | `(marketing)/page.tsx` | Live |
| `/apply` | `(marketing)/apply/page.tsx` | Live (was `/assess`) |
| `/doctrine` | `(marketing)/doctrine/page.tsx` | Stub — needs content |
| `/about` | `(marketing)/about/page.tsx` | Stub — needs content |
| `/journal` | `journal/page.tsx` | Stub — needs MDX pipeline |
| `/engine/[id]` | `engine/[id]/page.tsx` | Live (was `/program/[id]`) |
| `/dashboard` | `dashboard/page.tsx` | Stub — needs Supabase auth |
| `POST /api/generate` | `api/generate/route.ts` | Live — server-side Anthropic proxy |

## Frontend (`frontend/`)

Three standalone HTML files, each self-contained (inline `<style>`, Google
Fonts via CDN, no JS framework, no build):

- `deus_v1.html` — initial landing page / engine interface.
- `deus_v2.html` — redesigned DP site (**current**).
- `Deus_Performance.html` — largest/full variant.

To preview, open the file directly in a browser — there is nothing to compile or
serve. Design uses CSS custom properties (dark sage/green palette defined in
`:root`) and fonts Playfair Display, DM Mono, Libre Baskerville. Keep edits
within a single file and preserve the existing token system.

## Conventions

- **Commits:** Conventional Commits with a scope, e.g.
  `feat(engine): ...`, `feat(web): ...`, `feat(api): ...`,
  `feat(content-gen): ...`, `docs: ...`, `chore: ...`.
- **Branch:** develop on the active feature branch; never push to `main`
  without explicit permission. Push with `git push -u origin <branch>`.
- **Do not create pull requests** unless the user explicitly asks.
- **Spec style:** terse, imperative, ALL-CAPS section headers in lowercase
  canonical files (`## DETERMINISM RULES (MANDATORY)`). Match the surrounding
  style of the file you edit.
- `.gitignore` already excludes `.DS_Store`, `*.log`, `node_modules/`, `.env*`,
  `dist/`, `.cache/`.

## Brand voice (for any user-facing copy)

- Institution: **Deus Performance**; operating entity: **Riz Management LLC**.
- Tagline: *Deus. The body is a gift. Train it accordingly.*
- Tone: precise, disciplined, no hype. Movement-based, constraint-driven.
