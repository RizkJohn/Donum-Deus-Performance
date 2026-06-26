## DETERMINISM RULES (MANDATORY)
- Output JSON only. No prose.
- Do not invent fields, values, or exercises.
- If a constraint cannot be satisfied, return:
  {"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]}
- Prefer simplest valid solution (minimize exercise count while meeting requirements).
- No synonyms; use exact names from exercise_library.
- Enumerate ALL violations before returning error — do not short-circuit on first failure.

## PRIORITY RESOLUTION
If conflicts occur, resolve in this order:
1. CNS budget (profile-gated — resolve from quality_control.md SECTION 1 before construction)
2. Schedule constraints (sport days, session density)
3. Movement coverage — all planes (sagittal, transverse, frontal, gait)
4. Fatigue-volume alignment (consume fatigue_model.volume_ceiling before setting volume)
5. Push:pull ratio + laterality balance
6. Variability rules (7a–7d)
7. Volume targets

## CNS BUDGET (PROFILE-GATED)
Resolve before any session is constructed. Source: client_profile.training_age.
  Beginner:     max_high_cns = 2
  Intermediate: max_high_cns = 3
  Advanced:     max_high_cns = 4
No consecutive High CNS days.
Pre-sport day = Low CNS.
Post-High day = Low CNS or unscheduled.

## MOVEMENT REQUIREMENTS (WEEKLY — ALL REQUIRED)
Sagittal:   squat, hinge, push_h, push_v, pull_h, pull_v, jump
Transverse: rotation, anti_rotation
Frontal:    lateral (resolve via quality_control.md CHECK_3 priority paths a→b→c)
Gait:       carry, locomotion

CRITICAL: push_h and push_v are independent requirements. Satisfying one does not satisfy the other.
CRITICAL: pull_h and pull_v are independent requirements. Satisfying one does not satisfy the other.

## SESSION PLANE DIVERSITY
High CNS session: patterns must span >= 3 distinct planes
Low CNS session:  patterns must span >= 2 distinct planes
Plane map:
  Sagittal:   squat, hinge, push_h, push_v, pull_h, pull_v, jump
  Transverse: rotation, anti_rotation
  Frontal:    lateral, carry (unilateral loaded), locomotion (lateral)

## PUSH:PULL RATIO
  push_total = count(push_h) + count(push_v) across all sessions
  pull_total = count(pull_h) + count(pull_v) across all sessions
Enforce: pull_total >= push_total
Ideal:   pull_total / push_total >= 1.2

## LATERALITY (ACCESSORY BLOCK)
  unilateral_ratio = unilateral_count / total_accessory_exercises
  Beginner:             >= 0.30
  Intermediate/Advanced: >= 0.40

## VARIABILITY RULES
7a: No exercise.name repeated in consecutive training sessions
7b: No pattern in > floor(training_days/2)+1 sessions
7c: No exercise.name in > 2 sessions/week
7d: push_h count across week <= total_training_days

## VOLUME BOUNDS
Per session: exercises 5-8, sets <= 22
Weekly (Strength + Accessory only):
  Beginner:     <= 60 sets
  Intermediate: <= 80 sets
  Advanced:     <= 100 sets

## EXERCISE SELECTION
- Select from library by exact match only.
- If equipment or injury blocks a choice, use substitution_rules.md only.
- Substitutions must preserve: pattern, CNS classification, laterality, and plane coverage.

## IDENTITY & ORDER
Stable ordering required:
  weekly_split: Mon -> Sun
  sessions:     Mon -> Sun
  blocks:       Warmup, Power, Strength, Accessory, Core, Mobility

## FAILURE MODE
- Any rule violated -> return error object. Do not output partial plans.
- Return ALL violations in reasons[] before returning. Do not short-circuit.
