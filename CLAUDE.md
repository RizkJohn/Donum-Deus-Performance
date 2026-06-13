# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this repository is

**Deus Performance (DP)** — by Riz Management LLC — is a
**constraint-driven adaptive training engine**. The repo contains:

1. **`engine/`** — the "brain": markdown spec files defining how an LLM
   generates weekly training programs from a structured client payload. They
   are **loaded as prompts at runtime** by the API (see
   `engine/prompt_wrapper.md` and `apps/api/deus_api/engine/spec_loader.py`),
   not compiled, and remain the **source of truth** for all training logic.
2. **`apps/api/`** — FastAPI engine pipeline service (Python 3.11, Pydantic,
   SQLAlchemy). Provider-agnostic LLM layer: `LLM_PROVIDER=mock` (default;
   deterministic, offline, no API key) or `claude` (Anthropic SDK). Pipeline:
   input validation → deterministic decision engine → LLM exercise-fill →
   QC gate → retry (≤3) → program or `UNSATISFIABLE_CONSTRAINTS`.
3. **`apps/web/`** — Next.js 15 + Tailwind marketing site + assessment funnel
   (the live frontend; dark sage design ported from `frontend/deus_v2.html`).
4. **`packages/schemas/`** — shared JSON Schemas derived from `engine/*.md`.
5. **`frontend/`** — legacy standalone HTML mockups (design reference only).
6. **`business/` + `docs/`** — strategy and reference material;
   `docs/ARCHITECTURE.md` is the system design for the live product.

**Derived-data discipline:** `apps/api/data/*.json` is generated from the
engine markdown by `make seed-library` — never hand-edit the JSON;
`apps/api/tests/test_library_sync.py` fails on drift.

## Repository layout

```
.
├── engine/        # Training-system spec files — SOURCE OF TRUTH
├── apps/
│   ├── api/       # FastAPI engine pipeline (deus_api/, data/, scripts/, tests/)
│   └── web/       # Next.js marketing site + assessment funnel
├── packages/
│   └── schemas/   # Shared JSON Schemas (derived)
├── frontend/      # Legacy static HTML mockups (design reference)
├── business/      # Business plan / strategy
├── docs/          # ARCHITECTURE.md + reference guides
├── docker-compose.yml   # postgres + api (:8000) + web (:3000)
├── Makefile             # make dev / test / seed-library / api / web
└── README.md      # Top-level overview
```

## Running & testing

- `docker compose up --build` — full stack, no API key needed (mock provider).
- `make test` — pytest suite in `apps/api/tests/` (offline; includes a 400+
  case program contract test). Run after any engine or API change.
- `make seed-library` — regenerate `apps/api/data/*.json` after editing
  `engine/exercise_library.md` or `engine/substitution_rules.md`.
- Web: `cd apps/web && npm install && npm run dev` (or `npm run build`).

## The engine (`engine/`)

The engine is a pipeline of constraints. An LLM receives a structured client
payload and must return a complete weekly program as **JSON only — no prose.**

Flow: `input_contract` → `engine_instructions` + `fatigue_model` +
`progression_engine` → `quality_control` gate → `output_schema`, with
`substitution_rules` applied for equipment/injury constraints.

### One canonical file per concept

The engine overhaul consolidated the old dual lowercase/UPPERCASE files into a
**single canonical markdown file per concept** (the redundant UPPERCASE
narrative companions and the `ARCHITECTURE_SUMMARY.md` / `FINAL_STACK.md` files
were removed). Each `engine/*.md` file is the sole source of truth for its
concept. When you change a rule, propagate it to the code that enforces it
(`apps/api/deus_api/engine/`) and the tests.

### Engine file map

| File | Purpose |
|------|---------|
| `engine_instructions.md` | Master rules: objective hierarchy, determinism, CNS, coverage, session structure, failure mode |
| `input_contract.md` | Client payload JSON schema + how each parameter drives the engine |
| `output_schema.md` | Enforced program output JSON schema |
| `exercise_library.md` | Approved pool: `id, name, pattern, cns, laterality, level, equipment, muscles, contraindications` |
| `substitution_rules.md` | `primary_id -> [alt_ids]`; preserve pattern + cns |
| `programming.md` | Goal-driven loading prescriptions (NASM/ACSM/NSCA) + volume budgeting |
| `fatigue_model.md` | Fatigue scoring (1–5), volume-not-intensity rule, `progress/maintain/deload` |
| `progression_engine.md` | Load steps (+2.5% / +5%), progression states, deload triggers |
| `quality_control.md` | Pre-output QC gate — the 14 checks; all must pass or regenerate |
| `retry_policy.md` | Max 3 attempts, constrain offending fields, simplify, else UNSATISFIABLE |
| `prompt_wrapper.md` | Which files go in SYSTEM / DEVELOPER / USER roles |

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
  `feat(engine): ...`, `feat(frontend): ...`, `docs: ...`, `chore: ...`.
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
