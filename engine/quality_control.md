## ENVIRONMENT
- scope: test | live
- enforcement: IDENTICAL in both modes — no bypass permitted in test

---

## SECTION 1 — PROFILE GATE

Resolve cns_budget before any other check. Source: client_profile.training_age.

| training_age | max_high_cns_per_week |
|--------------|-----------------------|
| Beginner     | 2                     |
| Intermediate | 3                     |
| Advanced     | 4                     |

Apply resolved value to CHECK_2.

---

## SECTION 2 — CHECKS (ALL 12 MUST PASS)

---

### CHECK_1: SCHEMA INTEGRITY
- All required fields from output_schema present and correctly typed
- No additional properties outside schema definition
- weekly_split and sessions arrays: non-empty
- Every session in sessions[] has a corresponding day in weekly_split[]

---

### CHECK_2: CNS BUDGET & PLACEMENT
- high_cns_count ≤ max_high_cns (from SECTION 1)
- no_consecutive_high: no two adjacent training days both = "High"
- pre_sport_day: day immediately before any entry in schedule.sport_days = "Low"
- post_high_output: day immediately after any "High" day = "Low" or unscheduled
- Fail with reason if any sub-rule violated

---

### CHECK_3: MOVEMENT COVERAGE — WEEKLY PATTERNS (ALL REQUIRED)

Every pattern below must appear in ≥1 exercise across the full weekly programme.

#### Sagittal Plane
- squat: ≥1
- hinge: ≥1
- push_h: ≥1 (horizontal push — treated separately from push_v)
- push_v: ≥1 (vertical push — treated separately from push_h)
- pull_h: ≥1 (horizontal pull — treated separately from pull_v)
- pull_v: ≥1 (vertical pull — treated separately from pull_h)
- jump: ≥1 (waive only if injury_flags contain: knee | ankle | hip)

#### Transverse Plane
- rotation: ≥1
- anti_rotation: ≥1

#### Frontal Plane
- lateral: ≥1 — resolved by priority order:
  a. exercise.pattern = "lateral" (requires library entry — preferred resolution)
  b. exercise.pattern = "squat" AND exercise.laterality = "Unilateral" (lateral load proxy)
  c. exercise.pattern = "locomotion" AND exercise.notes contains "lateral" or "shuffle"
  → If none of a/b/c satisfied: CHECK_3 fails on frontal_plane

#### Locomotion / Gait
- carry: ≥1
- locomotion: ≥1 (may share session with carry)

---

### CHECK_4: MOVEMENT COVERAGE — SESSION-LEVEL PLANE DIVERSITY

For each scheduled training session, count the distinct planes represented by the
exercise patterns in that session.

Plane → pattern mapping:
- Sagittal: squat, hinge, push_h, push_v, pull_h, pull_v, jump
- Transverse: rotation, anti_rotation
- Frontal: lateral, carry (if loaded unilateral), locomotion (if lateral)

Enforcement:
- High CNS session: ≥3 distinct planes required
- Low CNS session: ≥2 distinct planes required

Fail if any session falls below threshold.

---

### CHECK_5: PUSH:PULL RATIO — WEEKLY

Count all exercises (all blocks) by pattern across the full week:
  push_total = count(push_h) + count(push_v)
  pull_total  = count(pull_h) + count(pull_v)

Enforcement:
- pull_total ≥ push_total (minimum parity)
- Ideal target: pull_total / push_total ≥ 1.2 (pull-dominant)
- Flag "PUSH_PULL_IMBALANCE" if push_total > pull_total; reject output

---

### CHECK_6: LATERALITY BALANCE — WEEKLY

Scope: Accessory block exercises only.

  unilateral_count = exercises where exercise.laterality = "Unilateral"
  unilateral_ratio = unilateral_count / total_accessory_exercises

Thresholds by training_age:
- Beginner:     unilateral_ratio ≥ 0.30
- Intermediate: unilateral_ratio ≥ 0.40
- Advanced:     unilateral_ratio ≥ 0.40

Reject if below threshold.

---

### CHECK_7: VARIABILITY — INTRA-WEEK DISTRIBUTION

Rule 7a — No exercise.name may repeat in consecutive training sessions.
  consecutive = two sessions on adjacent days with no rest day between them

Rule 7b — Pattern concentration cap:
  For each pattern, count sessions containing ≥1 exercise of that pattern.
  max_sessions_per_pattern ≤ floor(total_training_days / 2) + 1
  Fail if any single pattern exceeds this cap.

Rule 7c — Exercise frequency cap:
  No single exercise.name may appear in >2 sessions within the same week.

Rule 7d — Horizontal push cap:
  push_h exercises across the week ≤ total_training_days
  (prevents horizontal push becoming the dominant stimulus)

Fail if any of 7a–7d violated; return which rule and which exercise/pattern triggered it.

---

### CHECK_8: BLOCK INTEGRITY — PER SESSION

For every session, validate each block against the following:

Warmup:
- exercise count: 2–5
- must contain ≥1 exercise tagged as joint_prep or mobility
- must contain ≥1 activation exercise (low CNS, low fatigue cost)

Strength:
- exercise count: 1–2
- rep range: 3–6 for all exercises
- rest: ≥ "2 min" per exercise

Accessory:
- exercise count: 2–4
- rep range: 6–12 for all exercises
- unilateral bias enforced (see CHECK_6)

Core:
- exercise count: 1–3
- must include ≥1 exercise with pattern = "anti_rotation"
- must include ≥1 exercise addressing anti-extension (note field check or pattern)

Mobility:
- exercise count: 1–4
- must cover ≥2 of the following joint targets (resolved from exercise.notes or name):
  hip | thoracic | ankle | shoulder

Fail with block name and violation if any sub-rule missed.

---

### CHECK_9: VOLUME BOUNDS

Per session:
- total_exercises: ≥5 and ≤8
- total_sets: ≤22

Weekly totals (Strength + Accessory blocks only):
  | training_age | max_weekly_sets |
  |--------------|-----------------|
  | Beginner     | ≤ 60            |
  | Intermediate | ≤ 80            |
  | Advanced     | ≤ 100           |

Fail if either per-session or weekly cap exceeded.

---

### CHECK_10: CONDITIONING INTERFERENCE

- Conditioning must not appear in the same session as High CNS strength work
- If conditioning block present:
  - duration ≤ 25 min
  - placement: after Mobility block only (never before Strength)
- High-impact conditioning (pattern = jump | locomotion at sprint intensity):
  - blocked if fatigue_state = "high"
  - blocked on pre_sport_day

---

### CHECK_11: LIBRARY COMPLIANCE

- Every exercise.name must resolve to an exact id match in exercise_library
- No synonyms, abbreviations, or display name variations permitted
- If match fails: do not attempt substitution here — return UNSATISFIABLE_CONSTRAINTS
  with offending exercise.name listed; defer to substitution_rules.md

---

### CHECK_12: FATIGUE-VOLUME ALIGNMENT

Cross-reference fatigue_model output with programme volume:

  | fatigue_state | conditioning_block | accessory_exercises | notes                    |
  |---------------|--------------------|---------------------|--------------------------|
  | low           | permitted          | ≤4                  | standard volume          |
  | moderate      | permitted          | ≤2                  | reduce accessory         |
  | high          | must be empty      | ≤1                  | maintain intensity only  |

If programme volume exceeds fatigue-adjusted ceiling: reject and regenerate.

---

## SECTION 3 — RESULT

### PASS — all 12 checks valid
Return:
{
  "qc_result": "PASS",
  "cns_budget_used": N,
  "cns_budget_max": N,
  "movement_planes_covered": ["sagittal", "transverse", "frontal", "locomotion"],
  "push_pull_ratio": N,
  "unilateral_ratio": N,
  "variability_flags": [],
  "flags": []
}

### FAIL — any check invalid
Return:
{
  "qc_result": "FAIL",
  "failed_checks": [
    "CHECK_N: description of violation"
  ],
  "regenerate": true
}

Do not output partial programmes.
Trigger retry_policy.md on FAIL.
All failed_checks must be returned together — do not short-circuit on first failure.

---

## SECTION 4 — DEPENDENCY NOTES

The following require corresponding library updates to fully resolve all checks:

1. CHECK_3 frontal_plane resolution path (a): pattern = "lateral" must exist as a valid
   enum value in exercise_library.md and have corresponding exercises added to the library.
   Until added, resolution falls to proxy paths (b) and (c).

2. engine_instructions.md and ENGINE_INSTRUCTIONS__CORE_SYSTEM_BRAIN still reference
   "Max 2 High CNS days/week" — these must be updated to reference SECTION 1 of this
   file to prevent conflict. Quality Control takes precedence.

