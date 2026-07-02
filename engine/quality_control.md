## CHECKS (ALL MUST PASS)

- schema_valid: boolean
- cns_valid:
  - max High days is fatigue-adjusted: 3 (low) / 2 (moderate) / 1 (high) — see
    fatigue_model.md CNS BUDGET
  - no consecutive High
- movement_coverage:
  - includes: squat, hinge, push_h/push_v, pull_h/pull_v, rotation/anti_rotation, carry/locomotion, jump
- volume_ok:
  - total_exercises_per_session ≤ 8
- library_only:
  - every exercise.name exists in library

## RESULT
If any false:
→ reject and regenerate
