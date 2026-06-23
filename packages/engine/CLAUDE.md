# CLAUDE.md — packages/engine

Canonical machine-spec files for the Deus Performance training engine.
These files are **loaded as LLM prompts at runtime** — they are not compiled
or imported as code. The lowercase files here are the single source of truth.

## What lives here

Only **lowercase** spec files exist in this directory. There are no uppercase
companion files. Every training rule, constraint, schema, and exercise in the
system originates here.

## Prompt role assignments (per `prompt_wrapper.md`)

| File | LLM role |
|------|----------|
| `engine_instructions.md` | SYSTEM |
| `output_schema.md` | DEVELOPER |
| `exercise_library.md` | DEVELOPER |
| `substitution_rules.md` | DEVELOPER |
| `progression_engine.md` | DEVELOPER |
| `fatigue_model.md` | DEVELOPER |
| `quality_control.md` | DEVELOPER |
| `input_contract.md` | USER (payload schema reference) |
| `retry_policy.md` | reference only |
| `prompt_wrapper.md` | reference only |

## Editing rules

**Propagate all changes.** Any edit to a schema enum, value range, or exercise
name must be reflected in every file that references it:

- New movement pattern → update `exercise_library.md`, `quality_control.md`
  coverage list, and `engine_instructions.md`.
- New exercise → add to `exercise_library.md`; if substitutable, add to
  `substitution_rules.md`; re-run `make seed-library` to regenerate
  `apps/api/data/*.json`.
- Changed fatigue threshold → update `fatigue_model.md`, check
  `engine_instructions.md` and `quality_control.md` for references.

After any change to `exercise_library.md` or `substitution_rules.md`, run:

```bash
make seed-library
make test
```

`test_library_sync.py` will fail if the JSON drifts from the markdown.

## Hard constraints (never relax without updating QC and decision engine)

- **CNS:** fatigue_score ≥ 4.0 → max 1 High day; otherwise max 2. No
  consecutive High days. Pre-sport day is Low CNS.
- **Block order:** Warmup → Power → Strength → Accessory → Core → Mobility.
- **Volume:** ≤ 8 exercises/session.
- **Exercises:** must match library exactly — no synonyms.
- **Output:** JSON only. Failure → `{"error":"UNSATISFIABLE_CONSTRAINTS"}`.
- **Objective hierarchy:** Joint Integrity → Movement Quality → Strength →
  Work Capacity → Hypertrophy → Sport/Skill.

## Spec file style

Terse, imperative. ALL-CAPS section headers:
`## DETERMINISM RULES (MANDATORY)`. No prose explanations — rules only.
Match the style of the file you are editing.
