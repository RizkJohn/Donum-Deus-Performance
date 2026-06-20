## RETRY POLICY

max_attempts: 3

## ON FAILURE (GENERAL)
1. Return full error context to engine (all failed_checks, not first only)
2. Identify failure category (see FAILURE CATEGORIES below)
3. Apply category-specific retry strategy
4. Regenerate

## FAILURE CATEGORIES AND RETRY STRATEGIES

### CATEGORY A — Schema / Library failures (CHECK_1, CHECK_11)
Strategy: constrain offending fields only
  - Identify exact offending exercise.name or field
  - Replace with library-valid alternative via substitution_rules
  - Regenerate affected session only

### CATEGORY B — CNS / Schedule failures (CHECK_2, CHECK_10)
Strategy: restructure weekly split
  - Re-derive CNS budget from profile gate
  - Reassign High/Low days without changing exercise content
  - Regenerate weekly_split and session order; do not change exercise selection

### CATEGORY C — Movement coverage failures (CHECK_3, CHECK_4)
Strategy: add missing pattern
  - Identify which pattern/plane is absent
  - Insert one exercise of missing pattern into most appropriate session
  - Do not remove existing exercises unless volume exceeds CHECK_9
  - If lateral is missing and lateral_library_ready = false: add unilateral squat proxy

### CATEGORY D — Ratio / Balance failures (CHECK_5, CHECK_6)
Strategy: swap, do not add
  - For push:pull imbalance: replace one push exercise with a pull of equivalent CNS/laterality
  - For laterality: replace one bilateral accessory with a unilateral equivalent
  - Do not increase total volume to fix ratio

### CATEGORY E — Variability failures (CHECK_7)
Strategy: reshuffle full week — do not constrain individual exercises
  - Map all exercise.names across all sessions
  - Identify consecutive-day repeats (7a), pattern concentration (7b), frequency (7c)
  - Reshuffle exercise-to-session assignment across the full weekly_split
  - Preserve CNS classification of each session during reshuffle
  - Do not regenerate exercises — only reassign which session they appear in

### CATEGORY F — Volume / Fatigue failures (CHECK_9, CHECK_12)
Strategy: reduce volume, preserve intensity
  - Remove accessory exercises first (lowest transfer per unit fatigue)
  - Remove conditioning second
  - Never reduce primary lift load to fix a volume failure

## ON REPEAT FAILURE (attempt 2+)
- Escalate to simplification:
  - Reduce exercise count to minimum valid (5 per session)
  - Remove optional conditioning entirely
  - Flag "SIMPLIFIED_PROGRAMME" in output flags
- On attempt 3 failure: return UNSATISFIABLE_CONSTRAINTS with full reasons[]

## ON CATEGORY E REPEAT FAILURE
- If variability cannot be satisfied after reshuffle:
  - Check if available_days is too low (< 3) to distribute patterns without concentration
  - If yes: flag "SCHEDULE_TOO_DENSE_FOR_VARIABILITY" and relax rule 7b only
  - Maintain rules 7a, 7c, 7d
