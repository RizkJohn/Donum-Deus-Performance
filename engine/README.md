# Engine — System Files

These markdown files are the **single source of truth** for all training
logic. They are loaded as prompts at runtime by the API
(`apps/api/deus_api/engine/spec_loader.py`) — not compiled. Structured data
(the exercise library and substitution graph) is ported to JSON by
`make seed-library`; never hand-edit the derived JSON.

> There is **one canonical file per concept** (the former UPPERCASE narrative
> companions were consolidated away in the engine overhaul).

## File map
| File | Purpose |
|------|---------|
| `engine_instructions.md` | Master ruleset: objective hierarchy, determinism, CNS, coverage, session structure, failure mode |
| `input_contract.md` | Client payload schema + how each parameter drives the engine |
| `output_schema.md` | Enforced program output JSON schema |
| `exercise_library.md` | Approved exercise pool (id, name, pattern, cns, laterality, level, equipment, muscles, contraindications) |
| `substitution_rules.md` | Pattern/CNS-preserving substitutions for injury/equipment |
| `programming.md` | Goal-driven loading prescriptions (NASM/ACSM/NSCA) + volume budgeting |
| `fatigue_model.md` | Readiness scoring → volume reduction + progression flag |
| `progression_engine.md` | Load steps, progression states, deload triggers |
| `quality_control.md` | Pre-output QC gate — the 14 checks |
| `retry_policy.md` | Retry behavior and unsatisfiable-constraint handling |
| `prompt_wrapper.md` | SYSTEM / DEVELOPER / USER role mapping |

## How the engine runs
`input_contract` → deterministic decision engine (split, CNS, volume budget,
goal prescriptions, allowed pool after level + injury filtering) → LLM fills
exercises → `quality_control` gate → `retry_policy` → program
(`output_schema`) or `UNSATISFIABLE_CONSTRAINTS`. See `docs/ARCHITECTURE.md`
for the full system design.
