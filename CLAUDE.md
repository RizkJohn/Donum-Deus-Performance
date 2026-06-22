# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this repository is

**Deus Performance (DP)** — by Riz Management LLC — is a
**constraint-driven adaptive training engine**. The repo contains:

1. **`packages/engine/`** — the "brain": markdown spec files defining how an LLM
   generates weekly training programs from a structured client payload. They
   are **loaded as prompts at runtime** by the API (see
   `packages/engine/prompt_wrapper.md` and `apps/api/deus_api/engine/spec_loader.py`),
   not compiled, and remain the **source of truth** for all training logic.
2. **`apps/api/`** — FastAPI engine pipeline service (Python 3.11, Pydantic,
   SQLAlchemy). Provider-agnostic LLM layer: `LLM_PROVIDER=mock` (default;
   deterministic, offline, no API key) or `claude` (Anthropic SDK). Pipeline:
   input validation → deterministic decision engine → LLM exercise-fill →
   QC gate → retry (≤3) → program or `UNSATISFIABLE_CONSTRAINTS`.
   Being superseded by `api/` (Vercel Edge Functions) per the 90-day MVP plan.
3. **`apps/web/`** — Next.js 15 + Tailwind marketing site + assessment funnel
   (the live frontend; dark sage design ported from `frontend/deus_v2.html`).
4. **`api/`** — Vercel Edge Function stubs: `generate.ts`, `intake.ts`,
   `apply.ts`, `newsletter.ts`. These proxy Anthropic calls server-side so the
   API key is never in the browser. Implementation target: Month 1 Week 3.
5. **`packages/schemas/`** — shared JSON Schemas derived from `packages/engine/*.md`.
6. **`packages/content-gen/`** — social content generator (Python bot + future
   TSX admin tool at `/admin/content`).
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
│   ├── engine/        # Training-system spec files — SOURCE OF TRUTH
│   ├── content-gen/   # Social content generator (Python bot)
│   └── schemas/       # Shared JSON Schemas (derived from engine/)
├── apps/
│   ├── api/           # FastAPI engine pipeline (deus_api/, data/, scripts/, tests/)
│   └── web/           # Next.js marketing site + assessment funnel
│       └── src/
│           ├── app/
│           │   ├── (marketing)/  # /, /doctrine, /about, /apply
│           │   ├── journal/      # Blog (MDX)
│           │   ├── engine/       # Auth-gated programme tool (T1+)
│           │   └── dashboard/    # Practitioner portal (auth-gated)
│           └── content/          # MDX blog articles
├── api/               # Vercel Edge Functions (generate, intake, apply, newsletter)
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
- Web: `cd apps/web && npm install && npm run dev` (or `npm run build`).

## The engine (`packages/engine/`)

The engine is a pipeline of constraints. An LLM receives a structured client
payload and must return a complete weekly program as **JSON only — no prose.**

Flow: `input_contract` → `engine_instructions` + `fatigue_model` +
`progression_engine` → `quality_control` gate → `output_schema`, with
`substitution_rules` applied for equipment/injury constraints.

### Dual-file naming convention — IMPORTANT

Each engine concept exists as **two files**:

- **lowercase** (e.g. `engine_instructions.md`, `output_schema.md`) — the
  **canonical, terse, machine-spec** version: JSON schemas, enums, rule lists.
- **UPPERCASE** (e.g. `ENGINE_INSTRUCTIONS_CORE.md`, `OUTPUT_SCHEMA.md`) — a
  longer, **narrative/explanatory** companion version.

> Note: `packages/engine/README.md` describes the uppercase files as "legacy reference
> copies (identical content)." This is **not accurate** — the two versions
> differ in length and content (the uppercase ones are generally more verbose
> and prose-like). Treat the **lowercase files as the source of truth** for
> precise schemas and rules. When you change a rule, check whether the
> corresponding uppercase file also needs updating to stay consistent, and
> mention the discrepancy if it matters.

Uppercase↔lowercase pairs:
`engine_instructions` ↔ `ENGINE_INSTRUCTIONS_CORE`,
`exercise_library` ↔ `EXERCISE_LIBRARY`,
`fatigue_model` ↔ `FATIGUE_MODEL`,
`input_contract` ↔ `INPUT_CONTRACT`,
`output_schema` ↔ `OUTPUT_SCHEMA`,
`progression_engine` ↔ `PROGRESSION_ENGINE`,
`quality_control` ↔ `QUALITY_CONTROL_CHECK`,
`substitution_rules` ↔ `SUBSTITUTION_RULES`.
`ARCHITECTURE_SUMMARY.md` and `FINAL_STACK.md` exist only in uppercase.

### Engine file map

| File | Purpose |
|------|---------|
| `engine_instructions.md` | Master rules: determinism, priority resolution, exercise selection, ordering, failure mode |
| `exercise_library.md` | Approved exercise pool + entry format (`id`, `name`, `pattern`, `cns`, `laterality`) |
| `fatigue_model.md` | Fatigue scoring (0–5) and `low/moderate/high` thresholds |
| `input_contract.md` | Client payload JSON schema (profile, goals, schedule, state) |
| `output_schema.md` | Enforced program output JSON schema |
| `progression_engine.md` | Load steps (+2.5% / +5%) and `progress/maintain/deload` flags |
| `quality_control.md` | Pre-output QC gate; all checks must pass or regenerate |
| `substitution_rules.md` | `primary_id -> [alt_ids]`; preserve pattern + cns |
| `retry_policy.md` | Max 3 attempts, constrain offending fields, simplify on repeat failure |
| `prompt_wrapper.md` | Which files go in SYSTEM / DEVELOPER / USER roles |
| `ARCHITECTURE_SUMMARY.md` | High-level runtime architecture (n8n → Claude → workers → Postgres → UI) |
| `FINAL_STACK.md` | One-line role of each spec file |

### Hard engine rules (do not violate when editing specs)

These constraints are load-bearing — keep them internally consistent across
files if you touch them:

- **Output is JSON only.** No prose. On unsatisfiable input, return
  `{"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]}`.
- **CNS:** max 2 High-CNS days/week; no consecutive High-CNS days; pre-sport day
  is Low CNS.
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
