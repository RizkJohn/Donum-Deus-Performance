## CHECKS (ALL MUST PASS — reject and regenerate if any fail)

### SCHEMA
- schema_valid: all required fields present; no extra fields; types correct

### MOVEMENT COVERAGE
- coverage_ok: sessions collectively include all groups:
  squat, hinge, push (h or v), pull (h or v), rotation or anti_rotation, carry or locomotion, jump
  Exception: jump may be omitted when no High-CNS training days exist

### CNS RULES
- max_high_cns: High-CNS days ≤ 2 per week
- no_consecutive_high: no two adjacent days are both High CNS
- sport_day_cns: day immediately before a sport_day is Low CNS
- post_high_is_low: day after a High-CNS training day is Low CNS or Rest

### VOLUME
- volume_ok: total exercises per session ≤ 8
- block_volume_ok:
  - Power ≤ 2 exercises
  - Strength ≤ 3 exercises
  - Accessory ≤ 3 exercises
  - Core ≤ 2 exercises

### BLOCK ORDER & PRESENCE
- block_order_ok: blocks appear only in this order (skipped blocks do not break it):
  Warmup → Power → Strength → Accessory → Core → Mobility
- warmup_present: every training session contains a Warmup block
- mobility_present: every training session contains a Mobility block

### GOAL ALIGNMENT
- strength goal         → Strength block present; reps 3–6; sets 3–5
- hypertrophy goal      → Accessory block ≥ 2 exercises; reps 6–12; sets 3–4
- fat_loss goal         → conditioning present; Accessory ≥ 2 exercises per session
- athletic_performance  → Power block present on at least one non-sport training day
- endurance goal        → conditioning total duration ≥ 15 min per week
- mobility goal         → Mobility block ≥ 3 exercises per session
- rehabilitation goal   → no High-CNS exercises; Warmup and Mobility ≥ 2 exercises each

### FATIGUE COMPLIANCE
- conditioning_absent_if_high: if fatigue_state = high → conditioning array is empty
- volume_reduced_if_high: if fatigue_state = high → exercises per session ≤ fatigue-adjusted budget
- intensity_maintained: reduce reps/volume only; never reduce set load target

### EXERCISE VALIDITY
- library_only: every exercise.name is an exact match in exercise_library.md
- equipment_ok: no exercise requires equipment absent from the client's equipment list
- injury_ok: no exercise uses a movement pattern blocked by client injuries

### LOAD GUIDANCE
- load_guidance_present: every exercise has a non-empty load_guidance field
- no_amrap_primary: Strength and Power blocks must not use reps = "AMRAP"
- rir_on_primary: Strength and Power block load_guidance must indicate RIR or RPE

### PROGRESSION
- flag_present: flags array contains exactly one of [progress, maintain, deload]
- deload_consistent: if flags = [deload] → session volume is reduced from baseline

### SESSION INTEGRITY
- day_order_ok: weekly_split and sessions ordered Monday → Sunday; no duplicate days
- duration_ok: estimated time ≤ schedule.session_duration
  (estimate: 3 min/set × total sets across all blocks + 5 min Warmup + 5 min Mobility)

## RESULT
If any check fails → reject and regenerate (see retry_policy.md).
Reason codes must name the failed check(s) for targeted retry.
