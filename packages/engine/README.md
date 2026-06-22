# Engine — System Files

All files here are canonical. They are loaded directly as LLM prompts at runtime
by `apps/api/deus_api/engine/spec_loader.py`.

## File Map

| File | Role | Loaded by API |
|------|------|:---:|
| `engine_instructions.md` | Master rules: determinism, objective hierarchy, CNS, program rules, fatigue management | SYSTEM |
| `output_schema.md` | Enforced JSON Schema for program output | DEVELOPER |
| `exercise_library.md` | Approved exercise pool (id, name, pattern, cns, laterality) | DEVELOPER |
| `substitution_rules.md` | Equipment/injury substitution map (pattern + CNS preserved) | DEVELOPER |
| `progression_engine.md` | Load steps, progression states, deload triggers | DEVELOPER |
| `fatigue_model.md` | Input scoring, thresholds, volume/intensity rules | DEVELOPER |
| `quality_control.md` | Pre-output QC gate — all checks must pass or regenerate | DEVELOPER |
| `input_contract.md` | Client payload JSON schema (passed as USER message) | USER |
| `retry_policy.md` | Max 3 attempts, error escalation, simplification strategy | reference |
| `prompt_wrapper.md` | SYSTEM / DEVELOPER / USER role assignments | reference |
