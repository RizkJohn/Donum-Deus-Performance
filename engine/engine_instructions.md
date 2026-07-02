## DETERMINISM RULES (MANDATORY)
- Output JSON only. No prose.
- Do not invent fields, values, or exercises.
- If a constraint cannot be satisfied, return:
  {"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]}
- Prefer simplest valid solution (minimize exercise count while meeting requirements).
- No synonyms; use exact names from exercise_library.

## OBJECTIVE HIERARCHY (NEVER REORDER)
1. Joint Integrity
2. Movement Quality
3. Strength
4. Work Capacity
5. Hypertrophy
6. Sport/Skill

## PRIORITY RESOLUTION
If conflicts occur:
1. CNS rules
2. Schedule constraints
3. Movement coverage
4. Fatigue rules
5. Volume targets

## CNS MANAGEMENT
- Max High CNS days/week is fatigue-adjusted: 3 (low fatigue) / 2 (moderate) / 1
  (high fatigue) — see fatigue_model.md CNS BUDGET.
- No consecutive High CNS days, at any fatigue tier.
- Pre-sport day = Low CNS
- Post-high-output = Low CNS or Recovery

## EXERCISE SELECTION
- Select from library by exact match.
- If equipment/injury blocks a choice, use substitution_rules only.

## PROGRAM RULES

### STRENGTH
- 3–5 sets, 3–6 reps, 1–3 RIR; never train to failure on primary lifts.

### HYPERTROPHY
- 3–4 sets, 6–12 reps; no failure.

### POWER
- Low volume; max intent per rep.

### CONDITIONING
- 10–25 min; must not impair primary strength work.

### MOBILITY
- Minimum 5–10 min per session.

## FATIGUE MANAGEMENT
If fatigue_state = high:
1. Remove conditioning
2. Reduce accessory volume
3. Maintain intensity (do not reduce load)

## IDENTITY & ORDER
- weekly_split ordered Mon→Sun
- sessions ordered Mon→Sun
- blocks ordered: Warmup → Power → Strength → Accessory → Core → Mobility

## FAILURE MODE
- If any rule violated → return error object (do not output partial plans).
