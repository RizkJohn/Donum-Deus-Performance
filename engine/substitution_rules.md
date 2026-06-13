## FORMAT
primary_id -> [alt_id_1, alt_id_2]

## RULES
- Keep same pattern and cns
- Prefer same laterality
- If no valid substitute exists → return UNSATISFIABLE_CONSTRAINTS

## SUBSTITUTIONS (CANONICAL)

### LOWER BODY
trap_bar_deadlift -> [barbell_deadlift]
barbell_deadlift -> [trap_bar_deadlift]
front_squat -> [back_squat]
back_squat -> [front_squat]
bulgarian_split_squat -> [atg_split_squat]
atg_split_squat -> [bulgarian_split_squat]
goblet_squat -> [deep_squat_hold]
single_leg_rdl -> [db_rdl]
db_rdl -> [single_leg_rdl]

### UPPER BODY
db_bench_press -> [cable_chest_press, pushups]
single_arm_db_press -> [cable_chest_press, db_bench_press, pushups]
cable_chest_press -> [db_bench_press, pushups]
pushups -> [db_bench_press, cable_chest_press]
incline_db_press -> [arnold_press]
single_arm_db_overhead_press -> [landmine_press, arnold_press, incline_db_press]
landmine_press -> [single_arm_db_overhead_press, arnold_press]
arnold_press -> [incline_db_press]
pullups -> [lat_pulldown]
lat_pulldown -> [pullups, cable_pullover]
single_arm_lat_pulldown -> [cable_pullover, lat_pulldown, pullups]
cable_pullover -> [lat_pulldown, pullups]
chest_supported_row -> [inverted_row, face_pull]
inverted_row -> [chest_supported_row, face_pull]
single_arm_db_row -> [face_pull, chest_supported_row, inverted_row]
face_pull -> [chest_supported_row, inverted_row]

### POWER
broad_jump -> [vertical_jump, box_jump]
vertical_jump -> [broad_jump, box_jump]
box_jump -> [broad_jump, vertical_jump]
lateral_bound -> [single_leg_hop]
single_leg_hop -> [lateral_bound]
med_ball_slam -> [med_ball_rotational_throw]
med_ball_rotational_throw -> [med_ball_slam]
cable_woodchop -> [landmine_rotation, ninety_ninety_hips]
landmine_rotation -> [cable_woodchop, ninety_ninety_hips]

### CORE
hanging_leg_raise -> [dead_bug, ab_wheel_rollout]
dead_bug -> [pallof_press_alternative, hanging_leg_raise]
pallof_press_alternative -> [side_plank, dead_bug]
side_plank -> [pallof_press_alternative, dead_bug]
ab_wheel_rollout -> [dead_bug, hanging_leg_raise]

### CONDITIONING
farmer_carry -> [overhead_carry, suitcase_carry]
suitcase_carry -> [waiter_carry, cross_body_carry]
overhead_carry -> [farmer_carry]
waiter_carry -> [suitcase_carry, cross_body_carry]
cross_body_carry -> [suitcase_carry, waiter_carry]
bear_crawl -> [lateral_shuffle, carioca]
sled_push -> [sprint]
lateral_shuffle -> [carioca, bear_crawl]
carioca -> [lateral_shuffle, bear_crawl]
sprint -> [sled_push]
