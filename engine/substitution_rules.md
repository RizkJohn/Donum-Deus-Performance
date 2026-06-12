## FORMAT
primary_id -> [alt_id_1, alt_id_2]

## RULES
- Keep same pattern and cns
- Prefer same laterality
- If no valid substitute exists → return UNSATISFIABLE_CONSTRAINTS

## SUBSTITUTIONS (CANONICAL)
trap_bar_deadlift -> [barbell_deadlift]
barbell_deadlift -> [trap_bar_deadlift]
front_squat -> [back_squat]
back_squat -> [front_squat]
bulgarian_split_squat -> [atg_split_squat]
atg_split_squat -> [bulgarian_split_squat]
single_leg_rdl -> [db_rdl]
db_rdl -> [single_leg_rdl]
pullups -> [lat_pulldown]
lat_pulldown -> [pullups]
chest_supported_row -> [inverted_row]
inverted_row -> [chest_supported_row]
db_bench_press -> [pushups]
pushups -> [db_bench_press]
incline_db_press -> [arnold_press]
arnold_press -> [incline_db_press]
broad_jump -> [vertical_jump]
vertical_jump -> [broad_jump]
hanging_leg_raise -> [dead_bug]
dead_bug -> [pallof_press_alternative]
pallof_press_alternative -> [dead_bug]
