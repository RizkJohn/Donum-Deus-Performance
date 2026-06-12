# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this repository is

**Deus Performance (DP)** — by Riz Management LLC — is a
**constraint-driven adaptive training engine**, specified as documentation
rather than executable code. The repo contains three things:

1. **`engine/`** — the "brain": a set of markdown spec files that define how an
   LLM (Claude) should generate weekly training programs from a structured
   client payload. These specs are loaded as system/developer/user prompts (see
   `engine/prompt_wrapper.md`), not compiled.
2. **`frontend/`** — standalone single-file HTML landing pages (no build step,
   no framework, no dependencies).
3. **`business/` + `docs/`** — strategy, brand, domain, and redesign reference
   material.

There is **no application code, no package manager, no build system, and no
test suite.** This is a content/spec repository. Do not invent tooling
(`package.json`, CI, linters) unless explicitly asked.

## Repository layout

```
.
├── engine/        # Training-system spec files (the LLM decision engine)
├── frontend/      # Client-facing static HTML mockups
├── business/      # Business plan / strategy
├── docs/          # Reference guides (architecture, domains)
└── README.md      # Top-level overview
```

## The engine (`engine/`)

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

> Note: `engine/README.md` describes the uppercase files as "legacy reference
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
- **Branch:** active development branch is `claude/claude-md-docs-049pbr`.
  Develop, commit, and push there; never push to `main` without explicit
  permission. Push with `git push -u origin <branch>`.
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
