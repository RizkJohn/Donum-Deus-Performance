## FORMAT (MANDATORY)
- id: snake_case_unique
- name: exact_display_name
- pattern: [squat|hinge|push_h|push_v|pull_h|pull_v|rotation|anti_rotation|carry|locomotion|jump]
- cns: [High|Low]
- laterality: [Unilateral|Bilateral]

## LIBRARY (CANONICAL — exact name match required)

### LOWER BODY
- id: trap_bar_deadlift
  name: Trap Bar Deadlift
  pattern: hinge
  cns: High
  laterality: Bilateral
- id: barbell_deadlift
  name: Barbell Deadlift
  pattern: hinge
  cns: High
  laterality: Bilateral
- id: front_squat
  name: Front Squat
  pattern: squat
  cns: High
  laterality: Bilateral
- id: back_squat
  name: Back Squat
  pattern: squat
  cns: High
  laterality: Bilateral
- id: bulgarian_split_squat
  name: Bulgarian Split Squat
  pattern: squat
  cns: Low
  laterality: Unilateral
- id: atg_split_squat
  name: ATG Split Squat
  pattern: squat
  cns: Low
  laterality: Unilateral
- id: single_leg_rdl
  name: Single Leg RDL
  pattern: hinge
  cns: Low
  laterality: Unilateral
- id: db_rdl
  name: DB RDL
  pattern: hinge
  cns: Low
  laterality: Bilateral

### UPPER BODY
- id: incline_db_press
  name: Incline DB Press
  pattern: push_v
  cns: Low
  laterality: Bilateral
- id: db_bench_press
  name: DB Bench Press
  pattern: push_h
  cns: Low
  laterality: Bilateral
- id: arnold_press
  name: Arnold Press
  pattern: push_v
  cns: Low
  laterality: Bilateral
- id: pullups
  name: Pullups
  pattern: pull_v
  cns: Low
  laterality: Bilateral
- id: lat_pulldown
  name: Lat Pulldown
  pattern: pull_v
  cns: Low
  laterality: Bilateral
- id: chest_supported_row
  name: Chest Supported Row
  pattern: pull_h
  cns: Low
  laterality: Bilateral
- id: inverted_row
  name: Inverted Row
  pattern: pull_h
  cns: Low
  laterality: Bilateral

### POWER
- id: broad_jump
  name: Broad Jump
  pattern: jump
  cns: High
  laterality: Bilateral
- id: vertical_jump
  name: Vertical Jump
  pattern: jump
  cns: High
  laterality: Bilateral
- id: med_ball_slam
  name: Med Ball Slam
  pattern: rotation
  cns: High
  laterality: Bilateral

### CORE
- id: hanging_leg_raise
  name: Hanging Leg Raise
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
- id: dead_bug
  name: Dead Bug
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
- id: pallof_press_alternative
  name: Pallof Press Alternative
  pattern: anti_rotation
  cns: Low
  laterality: Unilateral

### CONDITIONING
- id: farmer_carry
  name: Farmer Carry
  pattern: carry
  cns: Low
  laterality: Bilateral
- id: bear_crawl
  name: Bear Crawl
  pattern: locomotion
  cns: Low
  laterality: Bilateral
- id: pushups
  name: Pushups
  pattern: push_h
  cns: Low
  laterality: Bilateral
- id: db_swings
  name: DB Swings
  pattern: hinge
  cns: Low
  laterality: Bilateral

### MOBILITY
- id: ninety_ninety_hips
  name: 90/90 Hips
  pattern: rotation
  cns: Low
  laterality: Bilateral
- id: jefferson_curl
  name: Jefferson Curl
  pattern: hinge
  cns: Low
  laterality: Bilateral
- id: deep_squat_hold
  name: Deep Squat Hold
  pattern: squat
  cns: Low
  laterality: Bilateral

## RULES
- Only use listed exercises (exact name match, no synonyms).
- Preserve movement intent.
- Prefer unilateral where possible.
