# DDP Engine Architecture
## Donum Deus Performance — Training System v2

---

## 1. SYSTEM OVERVIEW

The DDP Training Engine is a constraint-driven programme generation system.
It takes a structured client payload, applies a deterministic rule hierarchy,
and returns a validated, periodised training programme as JSON.

No improvisation. No partial outputs. All constraint violations enumerated before rejection.

---

## 2. PIPELINE (ORDERED)

```
[Client / Practitioner Input]
         |
         v
[n8n Orchestrator]
  - Receives input_contract.json payload
  - Routes to Claude Decision Engine
  - Manages retry loop (max 3 attempts per retry_policy.md)
         |
         v
[INPUT VALIDATION]
  - input_contract.md enforced
  - Reject on missing/maltyped required fields
  - Resolve: training_age -> CNS budget (SECTION 1, quality_control.md)
  - Resolve: lateral_library_ready flag (optional; defaults false)
  - Output: validated_payload + profile_context
         |
         v
[FATIGUE MODEL]
  - Source: state.fatigue_score
  - Output: fatigue_state + volume_ceiling
  - volume_ceiling is a hard constraint consumed by all downstream workers
  - Consumed BEFORE session construction; cannot be overridden
         |
         v
[QUALITY CONTROL — PRE-GENERATION GATE]
  - Load quality_control.md (12 checks defined)
  - Profile gate applied: CNS budget locked to training_age
  - Checks 1-12 define what the generated programme MUST satisfy
  - QC does not generate — it defines the constraint envelope
         |
         v
[CLAUDE DECISION ENGINE]
  Worker pipeline (ordered):
  1. VALIDATE    - Confirm constraints from QC are satisfiable given input
  2. COMPUTE     - Generate weekly_split (CNS assignment, day placement)
  3. SELECT      - Populate sessions from exercise_library (exact match)
  4. SUBSTITUTE  - Resolve library misses via substitution_rules.md
  5. BALANCE     - Check push:pull ratio, laterality balance, plane diversity
  6. VARIABILISE - Apply rules 7a-7d across the full week
  7. BOUND       - Apply volume bounds (per session + weekly by training_age)
         |
         v
[QUALITY CONTROL — POST-GENERATION VALIDATION]
  - All 12 checks run against generated output
  - Returns: qc_result = PASS | FAIL
  - PASS: output proceeds to schema validation
  - FAIL: all failed_checks returned to orchestrator; triggers retry_policy.md
         |
         v
[OUTPUT SCHEMA VALIDATION]
  - output_schema.md enforced (JSON Schema)
  - qc_metadata block required on every output
  - additionalProperties: false enforced at root and nested levels
         |
         v
[PROGRESSION ENGINE]
  - Operates on QC-cleared, schema-valid programme
  - Applies load_step, state flag (progress/maintain/deload)
  - Applies macro-level exercise rotation at 6-8 week block boundary
  - Appends progression flag to output flags[]
         |
         v
[PostgreSQL Source of Truth]
  - Programme stored with: client_id, generated_at, qc_metadata, flags
  - Enables week-over-week comparison for progression and variability tracking
         |
         v
[UI — Custom Frontend / Coda]
  - Renders weekly_split and daily sessions
  - Surfaces qc_metadata.movement_planes_covered, push_pull_ratio
         |
         v
[Logs & Readiness]
  - Session completion, performance delta, fatigue readiness
  |
  v (feedback)
[n8n Orchestrator]
  - Readiness data feeds next cycle fatigue_score
  - Programme history feeds variability check (prevent week-over-week repeats)
```

---

## 3. FILE DEPENDENCY MAP

```
input_contract.md
  |-> training_age  -> quality_control.md SECTION 1 (CNS budget)
  |-> lateral_library_ready -> quality_control.md CHECK_3 (resolution path)
  |-> injuries      -> quality_control.md CHECK_3 (jump waiver)
  |-> fatigue_score -> fatigue_model.md (state + volume_ceiling)

fatigue_model.md
  |-> volume_ceiling -> engine_instructions.md (session construction limit)
  |-> volume_ceiling -> quality_control.md CHECK_12 (enforcement)

quality_control.md
  |-> SECTION 1     -> engine_instructions.md (CNS budget)
  |-> CHECK_3       -> exercise_library.md (pattern enum must include lateral)
  |-> CHECK_5       -> engine (push:pull enforcement)
  |-> CHECK_6       -> engine (laterality balance)
  |-> CHECK_7       -> engine + retry_policy.md (variability — reshuffle strategy)
  |-> CHECK_11      -> exercise_library.md (exact match required)
  |-> CHECK_12      -> fatigue_model.md (volume_ceiling consumption)

exercise_library.md
  |-> pattern enum  -> quality_control.md CHECK_3 (lateral required)
  |-> exact ids     -> substitution_rules.md (primary_id references)

substitution_rules.md
  |-> plane preservation rule -> quality_control.md CHECK_3, CHECK_5

output_schema.md
  |-> qc_metadata field -> quality_control.md SECTION 3 (PASS result structure)

retry_policy.md
  |-> CATEGORY E (variability) -> quality_control.md CHECK_7
  |-> CATEGORY C (coverage)    -> quality_control.md CHECK_3, CHECK_4

progression_engine.md
  |-> exercise rotation -> quality_control.md CHECK_7 (macro variability)
  |-> deload trigger    -> fatigue_model.md (fatigue_state)
```

---

## 4. CNS BUDGET TABLE

Resolved from training_age before any session is constructed.
Hardcoded caps are not permitted — always resolve from this table.

| training_age | max_high_cns_per_week | Notes                                |
|--------------|-----------------------|--------------------------------------|
| Beginner     | 2                     | Lower neural recovery capacity       |
| Intermediate | 3                     | Standard CNS budget                  |
| Advanced     | 4                     | Highest budget; no consecutive High  |

Additional rules (all profiles):
- No consecutive High CNS days
- Day before sport_day = Low CNS
- Day after any High day = Low CNS or rest

---

## 5. MOVEMENT PATTERN TAXONOMY

### Pattern Enum (exercise_library.md)
squat | hinge | push_h | push_v | pull_h | pull_v | rotation | anti_rotation | carry | locomotion | jump | lateral

### Plane Mapping (QC CHECK_3, CHECK_4)
| Plane      | Patterns                                         |
|------------|--------------------------------------------------|
| Sagittal   | squat, hinge, push_h, push_v, pull_h, pull_v, jump |
| Transverse | rotation, anti_rotation                          |
| Frontal    | lateral                                          |
| Gait       | carry, locomotion                                |

### Weekly Coverage Requirements (ALL mandatory)
Sagittal: all 7 patterns >= 1 session each (jump waivable on injury)
Transverse: rotation AND anti_rotation >= 1 session each
Frontal: lateral >= 1 session (3-path resolution — see quality_control.md CHECK_3)
Gait: carry >= 1, locomotion >= 1

### Session Plane Diversity
| Session CNS | Min Planes |
|-------------|------------|
| High        | 3          |
| Low         | 2          |

---

## 6. QUALITY CONTROL — CHECK SUMMARY

All 12 checks must pass in BOTH test and live modes.

| Check | Name                          | Gated By             |
|-------|-------------------------------|----------------------|
| 1     | Schema Integrity              | output_schema.md     |
| 2     | CNS Budget & Placement        | training_age profile |
| 3     | Movement Coverage — Weekly    | all planes required  |
| 4     | Movement Coverage — Session   | plane diversity/session |
| 5     | Push:Pull Ratio               | pull >= push weekly  |
| 6     | Laterality Balance            | accessory block only |
| 7     | Variability — Intra-Week      | rules 7a-7d          |
| 8     | Block Integrity               | per block sub-rules  |
| 9     | Volume Bounds                 | training_age profile |
| 10    | Conditioning Interference     | CNS + fatigue gate   |
| 11    | Library Compliance            | exact match only     |
| 12    | Fatigue-Volume Alignment      | volume_ceiling map   |

---

## 7. RETRY POLICY SUMMARY

| Failure Category | Checks       | Strategy                          |
|------------------|--------------|-----------------------------------|
| A — Schema       | 1, 11        | Constrain offending field only    |
| B — CNS          | 2, 10        | Restructure weekly split          |
| C — Coverage     | 3, 4         | Add missing pattern exercise      |
| D — Ratio        | 5, 6         | Swap (do not add volume)          |
| E — Variability  | 7            | Reshuffle full week               |
| F — Volume       | 9, 12        | Reduce volume, preserve intensity |

Max attempts: 3. On attempt 3 failure: UNSATISFIABLE_CONSTRAINTS with full reasons[].

---

## 8. KNOWN OPEN ITEMS

| Item | Status | Blocker |
|------|--------|---------|
| lateral pattern exercises not yet in library | OPEN | CHECK_3 path (a) unresolvable; proxy paths active |
| engine_instructions CNS cap was hardcoded at 2 | RESOLVED (this release) | Replaced with profile gate |
| ENGINE_INSTRUCTIONS__CORE_SYSTEM_BRAIN_ push/pull combined | RESOLVED (this release) | Now separate requirements |
| fatigue_model had no volume_ceiling output | RESOLVED (this release) | Added to model output |
| output_schema had no qc_metadata field | RESOLVED (this release) | Added as required field |
| substitution_rules had no plane preservation rule | RESOLVED (this release) | Rule added |
| retry_policy had wrong strategy for variability failures | RESOLVED (this release) | Category E added |

---

## 9. TECH STACK REFERENCE

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Orchestration  | n8n                                     |
| Decision Engine| Anthropic Claude API (dual-model)       |
|   Assessment   | claude-opus                             |
|   Generation   | claude-sonnet                           |
| Database       | PostgreSQL (Supabase)                   |
| Auth           | Supabase Auth                           |
| Payments       | Stripe                                  |
| Email          | Resend                                  |
| Frontend       | Astro or Next.js on Vercel              |

---

_Last updated: quality_control.md v2 — CNS profile gate, multi-plane coverage,
push:pull ratio, laterality balance, 12-check QC, variability rules 7a-7d._
