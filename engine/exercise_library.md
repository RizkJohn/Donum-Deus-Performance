# Exercise Library

Approved exercise pool. The decision engine selects **only** from this list,
by exact `name` match — no synonyms, no invented movements. Each entry is
classified for the constraint engine:

- **pattern** — primary movement pattern (drives weekly movement coverage).
- **cns** — central-nervous-system demand (`High` = heavy axial / maximal
  intent / high skill; `Low` = everything else). Governs CNS scheduling.
- **laterality** — `Unilateral` or `Bilateral` (the engine prefers unilateral
  work where it improves balance and reduces asymmetry).
- **level** — minimum training age required to program it safely.
- **equipment** — equipment needed (used for substitutions; default profile is
  a fully equipped gym).
- **muscles** — primary musculature trained.
- **contraindications** — injury tags for which the movement is removed.

## FORMAT (MANDATORY — fixed field order)

```
- id: snake_case_unique
  name: Exact Display Name
  pattern: [squat|hinge|push_h|push_v|pull_h|pull_v|rotation|anti_rotation|carry|locomotion|jump]
  cns: [High|Low]
  laterality: [Unilateral|Bilateral]
  level: [Beginner|Intermediate|Advanced]
  equipment: [barbell|dumbbell|kettlebell|machine|cable|bodyweight|band|medicine_ball|trap_bar|ez_bar|bench|pullup_bar|box|sled|landmine|suspension|slider]
  muscles: [free-text list]
  contraindications: [shoulder|knee|lower_back|wrist|ankle|elbow|hip|neck]   # optional; omit or [] if none
```

## LIBRARY

### SQUAT
- id: barbell_back_squat
  name: Barbell Back Squat
  pattern: squat
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell]
  muscles: [quadriceps, glutes, adductors, erectors]
  contraindications: [knee, lower_back]
- id: front_squat
  name: Front Squat
  pattern: squat
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell]
  muscles: [quadriceps, glutes, erectors, upper back]
  contraindications: [knee, lower_back, wrist]
- id: high_bar_squat
  name: High Bar Squat
  pattern: squat
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [barbell]
  muscles: [quadriceps, glutes, adductors]
  contraindications: [knee, lower_back]
- id: safety_bar_squat
  name: Safety Bar Squat
  pattern: squat
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell]
  muscles: [quadriceps, glutes, erectors, upper back]
  contraindications: [knee, lower_back]
- id: goblet_squat
  name: Goblet Squat
  pattern: squat
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell, kettlebell]
  muscles: [quadriceps, glutes, core]
  contraindications: [knee]
- id: bulgarian_split_squat
  name: Bulgarian Split Squat
  pattern: squat
  cns: Low
  laterality: Unilateral
  level: Intermediate
  equipment: [dumbbell, bench]
  muscles: [quadriceps, glutes, adductors]
  contraindications: [knee]
- id: hack_squat_machine
  name: Hack Squat Machine
  pattern: squat
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine]
  muscles: [quadriceps, glutes]
  contraindications: [knee]
- id: leg_press
  name: Leg Press
  pattern: squat
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine]
  muscles: [quadriceps, glutes, adductors]
  contraindications: []
- id: box_squat
  name: Box Squat
  pattern: squat
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell, box]
  muscles: [quadriceps, glutes, hamstrings, erectors]
  contraindications: [lower_back]
- id: dumbbell_squat
  name: Dumbbell Squat
  pattern: squat
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell]
  muscles: [quadriceps, glutes, core]
  contraindications: [knee]
- id: pistol_squat
  name: Pistol Squat
  pattern: squat
  cns: Low
  laterality: Unilateral
  level: Advanced
  equipment: [bodyweight]
  muscles: [quadriceps, glutes, adductors, core]
  contraindications: [knee, ankle]
- id: belt_squat
  name: Belt Squat
  pattern: squat
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [machine]
  muscles: [quadriceps, glutes]
  contraindications: []

### HINGE
- id: barbell_deadlift
  name: Barbell Deadlift
  pattern: hinge
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [barbell]
  muscles: [glutes, hamstrings, erectors, lats, traps]
  contraindications: [lower_back]
- id: trap_bar_deadlift
  name: Trap Bar Deadlift
  pattern: hinge
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [trap_bar]
  muscles: [glutes, hamstrings, erectors, quadriceps]
  contraindications: [lower_back]
- id: romanian_deadlift
  name: Romanian Deadlift
  pattern: hinge
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell]
  muscles: [hamstrings, glutes, erectors]
  contraindications: [lower_back]
- id: kettlebell_swing
  name: Kettlebell Swing
  pattern: hinge
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [kettlebell]
  muscles: [glutes, hamstrings, erectors, core]
  contraindications: [lower_back]
- id: sumo_deadlift
  name: Sumo Deadlift
  pattern: hinge
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [barbell]
  muscles: [glutes, adductors, hamstrings, erectors, traps]
  contraindications: [lower_back, hip]
- id: deficit_deadlift
  name: Deficit Deadlift
  pattern: hinge
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [barbell]
  muscles: [glutes, hamstrings, erectors, quadriceps]
  contraindications: [lower_back]
- id: dumbbell_rdl
  name: Dumbbell Romanian Deadlift
  pattern: hinge
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell]
  muscles: [hamstrings, glutes, erectors]
  contraindications: [lower_back]
- id: single_leg_rdl
  name: Single Leg Romanian Deadlift
  pattern: hinge
  cns: Low
  laterality: Unilateral
  level: Intermediate
  equipment: [dumbbell]
  muscles: [hamstrings, glutes, erectors, core]
  contraindications: [lower_back]
- id: hip_thrust
  name: Barbell Hip Thrust
  pattern: hinge
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [barbell, bench]
  muscles: [glutes, hamstrings]
  contraindications: []
- id: glute_ham_raise
  name: Glute Ham Raise
  pattern: hinge
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [machine]
  muscles: [hamstrings, glutes, erectors]
  contraindications: []
- id: seated_leg_curl
  name: Seated Leg Curl
  pattern: hinge
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine]
  muscles: [hamstrings]
  contraindications: []
- id: cable_pull_through
  name: Cable Pull Through
  pattern: hinge
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [cable]
  muscles: [glutes, hamstrings, erectors]
  contraindications: []

### PUSH
- id: barbell_bench_press
  name: Barbell Bench Press
  pattern: push_h
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell, bench]
  muscles: [pectorals, anterior deltoids, triceps]
  contraindications: [shoulder, elbow]
- id: db_bench_press
  name: DB Bench Press
  pattern: push_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell, bench]
  muscles: [pectorals, anterior deltoids, triceps]
  contraindications: [shoulder]
- id: incline_barbell_press
  name: Incline Barbell Press
  pattern: push_h
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell, bench]
  muscles: [upper pectorals, anterior deltoids, triceps]
  contraindications: [shoulder, elbow]
- id: incline_db_press
  name: Incline DB Press
  pattern: push_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell, bench]
  muscles: [upper pectorals, anterior deltoids, triceps]
  contraindications: [shoulder]
- id: push_up
  name: Push Up
  pattern: push_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [pectorals, anterior deltoids, triceps, core]
  contraindications: [shoulder, wrist]
- id: machine_chest_press
  name: Machine Chest Press
  pattern: push_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine]
  muscles: [pectorals, anterior deltoids, triceps]
  contraindications: []
- id: dip
  name: Chest Dip
  pattern: push_h
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [bodyweight]
  muscles: [lower pectorals, triceps, anterior deltoids]
  contraindications: [shoulder, elbow]
- id: cable_chest_fly
  name: Cable Chest Fly
  pattern: push_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [cable]
  muscles: [pectorals, anterior deltoids]
  contraindications: [shoulder]
- id: overhead_press
  name: Overhead Press
  pattern: push_v
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell]
  muscles: [deltoids, triceps, upper traps]
  contraindications: [shoulder, lower_back]
- id: db_shoulder_press
  name: DB Shoulder Press
  pattern: push_v
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell]
  muscles: [deltoids, triceps]
  contraindications: [shoulder]
- id: push_press
  name: Push Press
  pattern: push_v
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [barbell]
  muscles: [deltoids, triceps, quadriceps, glutes]
  contraindications: [shoulder, lower_back]
- id: seated_db_press
  name: Seated DB Shoulder Press
  pattern: push_v
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell, bench]
  muscles: [deltoids, triceps]
  contraindications: [shoulder]
- id: machine_shoulder_press
  name: Machine Shoulder Press
  pattern: push_v
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine]
  muscles: [deltoids, triceps]
  contraindications: [shoulder]
- id: arnold_press
  name: Arnold Press
  pattern: push_v
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [dumbbell]
  muscles: [deltoids, triceps]
  contraindications: [shoulder]
- id: single_arm_db_press
  name: Single Arm DB Overhead Press
  pattern: push_v
  cns: Low
  laterality: Unilateral
  level: Intermediate
  equipment: [dumbbell]
  muscles: [deltoids, triceps, core]
  contraindications: [shoulder]

### PULL
- id: chest_supported_row
  name: Chest Supported Row
  pattern: pull_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell, bench]
  muscles: [lats, rhomboids, mid traps, biceps]
  contraindications: []
- id: barbell_bent_row
  name: Barbell Bent Over Row
  pattern: pull_h
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [barbell]
  muscles: [lats, rhomboids, mid traps, erectors, biceps]
  contraindications: [lower_back]
- id: pendlay_row
  name: Pendlay Row
  pattern: pull_h
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [barbell]
  muscles: [lats, rhomboids, mid traps, erectors, biceps]
  contraindications: [lower_back]
- id: single_arm_db_row
  name: Single Arm DB Row
  pattern: pull_h
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [dumbbell, bench]
  muscles: [lats, rhomboids, mid traps, biceps]
  contraindications: []
- id: seated_cable_row
  name: Seated Cable Row
  pattern: pull_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [cable]
  muscles: [lats, rhomboids, mid traps, biceps]
  contraindications: []
- id: machine_row
  name: Machine Row
  pattern: pull_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine]
  muscles: [lats, rhomboids, mid traps, biceps]
  contraindications: []
- id: inverted_row
  name: Inverted Row
  pattern: pull_h
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [bodyweight, suspension]
  muscles: [lats, rhomboids, mid traps, biceps, core]
  contraindications: []
- id: landmine_row
  name: Landmine Row
  pattern: pull_h
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [landmine, barbell]
  muscles: [lats, rhomboids, mid traps, biceps]
  contraindications: [lower_back]
- id: pull_up
  name: Pull Up
  pattern: pull_v
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [bodyweight, pullup_bar]
  muscles: [lats, biceps, rhomboids, lower traps]
  contraindications: [shoulder, elbow]
- id: weighted_pull_up
  name: Weighted Pull Up
  pattern: pull_v
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [bodyweight, pullup_bar]
  muscles: [lats, biceps, rhomboids, lower traps]
  contraindications: [shoulder, elbow]
- id: chin_up
  name: Chin Up
  pattern: pull_v
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [bodyweight, pullup_bar]
  muscles: [lats, biceps, rhomboids]
  contraindications: [shoulder, elbow]
- id: lat_pulldown
  name: Lat Pulldown
  pattern: pull_v
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine, cable]
  muscles: [lats, biceps, rhomboids]
  contraindications: [shoulder]
- id: neutral_grip_pulldown
  name: Neutral Grip Pulldown
  pattern: pull_v
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine, cable]
  muscles: [lats, biceps, rhomboids]
  contraindications: [shoulder]
- id: single_arm_pulldown
  name: Single Arm Cable Pulldown
  pattern: pull_v
  cns: Low
  laterality: Unilateral
  level: Intermediate
  equipment: [cable]
  muscles: [lats, biceps, rhomboids]
  contraindications: [shoulder]
- id: assisted_pull_up
  name: Assisted Pull Up
  pattern: pull_v
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [machine]
  muscles: [lats, biceps, rhomboids]
  contraindications: [shoulder]

### ROTATION
- id: cable_woodchop
  name: Cable Woodchop
  pattern: rotation
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [cable]
  muscles: [obliques, transverse abdominis, core]
  contraindications: [lower_back]
- id: landmine_rotation
  name: Landmine Rotation
  pattern: rotation
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [landmine, barbell]
  muscles: [obliques, shoulders, core]
  contraindications: [lower_back]
- id: med_ball_rotational_throw
  name: Medicine Ball Rotational Throw
  pattern: rotation
  cns: High
  laterality: Unilateral
  level: Intermediate
  equipment: [medicine_ball]
  muscles: [obliques, hips, shoulders, core]
  contraindications: [lower_back]
- id: cable_rotation
  name: Standing Cable Rotation
  pattern: rotation
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [cable]
  muscles: [obliques, transverse abdominis]
  contraindications: [lower_back]
- id: russian_twist
  name: Russian Twist
  pattern: rotation
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [medicine_ball, bodyweight]
  muscles: [obliques, rectus abdominis]
  contraindications: [lower_back]
- id: cable_low_to_high_chop
  name: Cable Low to High Chop
  pattern: rotation
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [cable]
  muscles: [obliques, hips, shoulders]
  contraindications: [lower_back]
- id: med_ball_shotput_throw
  name: Medicine Ball Shotput Throw
  pattern: rotation
  cns: High
  laterality: Unilateral
  level: Intermediate
  equipment: [medicine_ball]
  muscles: [obliques, shoulders, hips, core]
  contraindications: [lower_back, shoulder]

### CORE
- id: dead_bug
  name: Dead Bug
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [rectus abdominis, transverse abdominis]
  contraindications: []
- id: plank
  name: Plank
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [transverse abdominis, rectus abdominis, shoulders]
  contraindications: []
- id: pallof_press
  name: Pallof Press
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [cable, band]
  muscles: [obliques, transverse abdominis, core]
  contraindications: []
- id: side_plank
  name: Side Plank
  pattern: anti_rotation
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [obliques, transverse abdominis, glutes]
  contraindications: []
- id: ab_wheel_rollout
  name: Ab Wheel Rollout
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [bodyweight]
  muscles: [rectus abdominis, transverse abdominis, lats]
  contraindications: [lower_back]
- id: hanging_leg_raise
  name: Hanging Leg Raise
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [pullup_bar, bodyweight]
  muscles: [rectus abdominis, hip flexors, transverse abdominis]
  contraindications: [shoulder]
- id: bird_dog
  name: Bird Dog
  pattern: anti_rotation
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [erectors, glutes, transverse abdominis]
  contraindications: []
- id: stir_the_pot
  name: Stir The Pot
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [bodyweight]
  muscles: [rectus abdominis, transverse abdominis, shoulders]
  contraindications: [lower_back, shoulder]
- id: hollow_body_hold
  name: Hollow Body Hold
  pattern: anti_rotation
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [rectus abdominis, transverse abdominis, hip flexors]
  contraindications: []

### CARRY
- id: farmer_carry
  name: Farmer Carry
  pattern: carry
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [dumbbell, kettlebell]
  muscles: [traps, forearms, core, glutes]
  contraindications: []
- id: suitcase_carry
  name: Suitcase Carry
  pattern: carry
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [dumbbell, kettlebell]
  muscles: [obliques, traps, forearms, core]
  contraindications: []
- id: front_rack_carry
  name: Front Rack Carry
  pattern: carry
  cns: Low
  laterality: Bilateral
  level: Intermediate
  equipment: [kettlebell, dumbbell]
  muscles: [core, upper back, shoulders, forearms]
  contraindications: []
- id: overhead_carry
  name: Overhead Carry
  pattern: carry
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [kettlebell, dumbbell]
  muscles: [shoulders, core, traps, forearms]
  contraindications: [shoulder]
- id: heavy_trap_bar_carry
  name: Heavy Trap Bar Carry
  pattern: carry
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [trap_bar]
  muscles: [traps, forearms, core, glutes]
  contraindications: [lower_back]
- id: waiter_carry
  name: Waiter Carry
  pattern: carry
  cns: Low
  laterality: Unilateral
  level: Intermediate
  equipment: [kettlebell, dumbbell]
  muscles: [shoulders, core, forearms]
  contraindications: [shoulder]

### LOCOMOTION
- id: walking_lunge
  name: Walking Lunge
  pattern: locomotion
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [dumbbell, bodyweight]
  muscles: [quadriceps, glutes, hamstrings, core]
  contraindications: [knee]
- id: sled_push
  name: Sled Push
  pattern: locomotion
  cns: High
  laterality: Bilateral
  level: Beginner
  equipment: [sled]
  muscles: [quadriceps, glutes, calves, core]
  contraindications: []
- id: sled_drag
  name: Sled Drag
  pattern: locomotion
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [sled]
  muscles: [quadriceps, glutes, hamstrings, calves]
  contraindications: []
- id: bear_crawl
  name: Bear Crawl
  pattern: locomotion
  cns: Low
  laterality: Bilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [shoulders, core, quadriceps, hip flexors]
  contraindications: [wrist, shoulder]
- id: reverse_lunge_walk
  name: Reverse Lunge Walk
  pattern: locomotion
  cns: Low
  laterality: Unilateral
  level: Beginner
  equipment: [dumbbell, bodyweight]
  muscles: [quadriceps, glutes, hamstrings]
  contraindications: [knee]
- id: heavy_sled_march
  name: Heavy Sled March
  pattern: locomotion
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [sled]
  muscles: [quadriceps, glutes, calves, core]
  contraindications: []

### JUMP
- id: box_jump
  name: Box Jump
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Beginner
  equipment: [box, bodyweight]
  muscles: [quadriceps, glutes, calves, hamstrings]
  contraindications: [knee, ankle]
- id: broad_jump
  name: Broad Jump
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [bodyweight]
  muscles: [glutes, hamstrings, quadriceps, calves]
  contraindications: [knee, ankle]
- id: med_ball_slam
  name: Medicine Ball Slam
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Beginner
  equipment: [medicine_ball]
  muscles: [lats, core, shoulders, hips]
  contraindications: []
- id: med_ball_chest_throw
  name: Medicine Ball Chest Throw
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Beginner
  equipment: [medicine_ball]
  muscles: [pectorals, shoulders, triceps, core]
  contraindications: [shoulder]
- id: depth_jump
  name: Depth Jump
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Advanced
  equipment: [box, bodyweight]
  muscles: [quadriceps, glutes, calves, hamstrings]
  contraindications: [knee, ankle]
- id: vertical_jump
  name: Vertical Jump
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Beginner
  equipment: [bodyweight]
  muscles: [quadriceps, glutes, calves]
  contraindications: [knee, ankle]
- id: squat_jump
  name: Squat Jump
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [bodyweight]
  muscles: [quadriceps, glutes, calves]
  contraindications: [knee, ankle]
- id: med_ball_overhead_throw
  name: Medicine Ball Overhead Throw
  pattern: jump
  cns: High
  laterality: Bilateral
  level: Intermediate
  equipment: [medicine_ball]
  muscles: [shoulders, lats, core, hips]
  contraindications: [shoulder]

## RULES
- Select only from this list; match `name` exactly (no synonyms).
- Respect `level`: do not program an exercise above the client's training age.
- Remove any exercise whose `contraindications` intersect the client's injuries.
- Prefer unilateral variations where they serve the goal.
