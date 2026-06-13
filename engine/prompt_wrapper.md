# Prompt Wrapper

How the spec files map onto roles when the engine invokes the LLM
(`apps/api/deus_api/engine/prompt_builder.py`).

## SYSTEM
- `engine_instructions.md` — the master ruleset and objective hierarchy.

## DEVELOPER
- `output_schema.md` — the enforced output JSON schema.
- `exercise_library.md` — the allowed pool (injected pre-filtered to the
  client's level and injuries).
- `substitution_rules.md` — pattern/CNS-preserving swaps.
- `programming.md` — goal-driven loading prescriptions.
- `progression_engine.md` — progression flag and load steps.
- `fatigue_model.md` — readiness → volume/flag.
- `quality_control.md` — the gate the output must satisfy.
- **Precomputed plan** — the deterministic split, per-day CNS, exercise budget,
  per-block prescriptions, allowed exercises, and progression flag.

## USER
- The validated `input_contract` payload (JSON).

## RESPONSE
- **JSON only**, conforming to `output_schema.md`. No prose.
