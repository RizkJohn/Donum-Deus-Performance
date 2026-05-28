## DETERMINISM RULES (MANDATORY)
- Output JSON only. No prose.
- Do not invent fields, values, or exercises.
- If a constraint cannot be satisfied, return:
  {"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]}
- Prefer simplest valid solution (minimize exercise count while meeting requirements).
- No synonyms; use exact names from exercise_library.

## PRIORITY RESOLUTION
If conflicts occur:
1. CNS rules
2. Schedule constraints
3. Movement coverage
4. Fatigue rules
5. Volume targets

## EXERCISE SELECTION
- Select from library by exact match.
- If equipment/injury blocks a choice, use substitution_rules only.

## IDENTITY & ORDER
- Maintain stable ordering:
  weekly_split ordered Mon→Sun
  sessions ordered Mon→Sun
  blocks ordered: Warmup, Power, Strength, Accessory, Core, Mobility

## FAILURE MODE
- If any rule violated → return error object (do not output partial plans).