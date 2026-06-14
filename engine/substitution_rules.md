# Substitution Rules

When an exercise is removed (injury contraindication or unavailable
equipment), the engine swaps in an alternative that **preserves the movement
pattern and CNS demand**, prefers the same laterality, and stays at or below
the client's training level.

## RULES
- Preserve `pattern` and `cns` exactly.
- Prefer the same `laterality`.
- Never downgrade a compound to an isolation movement.
- Never substitute a power/explosive movement with a hypertrophy rep movement.
- If no valid substitute exists → `UNSATISFIABLE_CONSTRAINTS`.

## FORMAT
`primary_id -> [alt_id_1, alt_id_2]`

## SUBSTITUTIONS
barbell_back_squat -> [high_bar_squat, safety_bar_squat, front_squat]
front_squat -> [high_bar_squat, safety_bar_squat, barbell_back_squat]
high_bar_squat -> [barbell_back_squat, front_squat, safety_bar_squat]
safety_bar_squat -> [barbell_back_squat, high_bar_squat, box_squat]
box_squat -> [barbell_back_squat, safety_bar_squat, high_bar_squat]
goblet_squat -> [dumbbell_squat, band_goblet_squat, bodyweight_squat]
dumbbell_squat -> [goblet_squat, band_goblet_squat, bodyweight_squat]
hack_squat_machine -> [leg_press, belt_squat, goblet_squat]
leg_press -> [hack_squat_machine, belt_squat, goblet_squat]
belt_squat -> [hack_squat_machine, leg_press, goblet_squat]
bulgarian_split_squat -> [band_split_squat, bodyweight_split_squat, dumbbell_squat]
pistol_squat -> [shrimp_squat, bulgarian_split_squat]
barbell_deadlift -> [trap_bar_deadlift, sumo_deadlift, deficit_deadlift]
trap_bar_deadlift -> [barbell_deadlift, sumo_deadlift, romanian_deadlift]
sumo_deadlift -> [barbell_deadlift, trap_bar_deadlift, deficit_deadlift]
deficit_deadlift -> [barbell_deadlift, sumo_deadlift, trap_bar_deadlift]
romanian_deadlift -> [trap_bar_deadlift, kettlebell_swing, barbell_deadlift]
kettlebell_swing -> [romanian_deadlift, trap_bar_deadlift]
dumbbell_rdl -> [single_leg_rdl, band_rdl, cable_pull_through]
single_leg_rdl -> [dumbbell_rdl, single_leg_hip_hinge, band_rdl]
hip_thrust -> [glute_bridge, cable_pull_through, dumbbell_rdl]
glute_ham_raise -> [seated_leg_curl, dumbbell_rdl, hip_thrust]
seated_leg_curl -> [glute_ham_raise, dumbbell_rdl]
cable_pull_through -> [hip_thrust, dumbbell_rdl, glute_ham_raise]
barbell_bench_press -> [incline_barbell_press]
incline_barbell_press -> [barbell_bench_press]
db_bench_press -> [machine_chest_press, incline_db_press, push_up]
incline_db_press -> [db_bench_press, machine_chest_press, push_up]
push_up -> [incline_push_up, band_push_up, db_bench_press]
machine_chest_press -> [db_bench_press, incline_db_press, cable_chest_fly]
dip -> [push_up, db_bench_press, machine_chest_press]
cable_chest_fly -> [machine_chest_press, db_bench_press, push_up]
overhead_press -> [push_press]
push_press -> [overhead_press]
db_shoulder_press -> [seated_db_press, band_overhead_press, pike_push_up]
seated_db_press -> [db_shoulder_press, machine_shoulder_press, arnold_press]
machine_shoulder_press -> [db_shoulder_press, seated_db_press, arnold_press]
arnold_press -> [db_shoulder_press, seated_db_press, machine_shoulder_press]
single_arm_db_press -> [db_shoulder_press, arnold_press, machine_shoulder_press]
barbell_bent_row -> [pendlay_row]
pendlay_row -> [barbell_bent_row]
chest_supported_row -> [machine_row, seated_cable_row, single_arm_db_row]
single_arm_db_row -> [chest_supported_row, seated_cable_row, machine_row]
seated_cable_row -> [machine_row, chest_supported_row, inverted_row]
machine_row -> [seated_cable_row, chest_supported_row, inverted_row]
inverted_row -> [suspension_row, feet_elevated_inverted_row, band_row]
landmine_row -> [chest_supported_row, single_arm_db_row, seated_cable_row]
pull_up -> [chin_up, weighted_pull_up]
weighted_pull_up -> [pull_up, chin_up]
chin_up -> [pull_up, weighted_pull_up]
lat_pulldown -> [neutral_grip_pulldown, band_lat_pulldown, suspension_pulldown]
neutral_grip_pulldown -> [lat_pulldown, assisted_pull_up, single_arm_pulldown]
single_arm_pulldown -> [lat_pulldown, neutral_grip_pulldown]
assisted_pull_up -> [band_assisted_pull_up, suspension_pulldown, lat_pulldown]
cable_woodchop -> [band_woodchop, cable_rotation, cable_low_to_high_chop]
cable_rotation -> [band_rotation, cable_woodchop, cable_low_to_high_chop]
cable_low_to_high_chop -> [cable_woodchop, cable_rotation]
landmine_rotation -> [cable_woodchop, russian_twist, cable_rotation]
russian_twist -> [landmine_rotation, cable_rotation, cable_woodchop]
med_ball_rotational_throw -> [med_ball_shotput_throw]
med_ball_shotput_throw -> [med_ball_rotational_throw]
dead_bug -> [bird_dog, hollow_body_hold, plank]
plank -> [side_plank, dead_bug, hollow_body_hold]
side_plank -> [plank, pallof_press, bird_dog]
pallof_press -> [band_pallof_press, band_anti_rotation_hold, side_plank]
ab_wheel_rollout -> [stir_the_pot, hollow_body_hold, plank]
hanging_leg_raise -> [hollow_body_hold, ab_wheel_rollout, dead_bug]
bird_dog -> [dead_bug, side_plank, plank]
stir_the_pot -> [ab_wheel_rollout, plank, hollow_body_hold]
hollow_body_hold -> [dead_bug, plank, hanging_leg_raise]
farmer_carry -> [suitcase_carry, band_resisted_march, weighted_vest_carry]
suitcase_carry -> [farmer_carry, band_anchored_carry, suspension_anchored_carry]
front_rack_carry -> [farmer_carry, suitcase_carry, waiter_carry]
waiter_carry -> [suitcase_carry, farmer_carry, front_rack_carry]
overhead_carry -> [heavy_trap_bar_carry]
heavy_trap_bar_carry -> [overhead_carry]
walking_lunge -> [reverse_lunge_walk, band_resisted_walk, bear_crawl]
reverse_lunge_walk -> [walking_lunge, sled_drag, bear_crawl]
sled_drag -> [walking_lunge, reverse_lunge_walk, bear_crawl]
bear_crawl -> [walking_lunge, reverse_lunge_walk, sled_drag]
sled_push -> [heavy_sled_march]
heavy_sled_march -> [sled_push]
box_jump -> [vertical_jump, squat_jump, broad_jump]
broad_jump -> [box_jump, vertical_jump, squat_jump]
vertical_jump -> [box_jump, squat_jump, broad_jump]
squat_jump -> [vertical_jump, band_resisted_squat_jump, tuck_jump]
depth_jump -> [box_jump, broad_jump, squat_jump]
med_ball_slam -> [med_ball_overhead_throw, med_ball_chest_throw]
med_ball_chest_throw -> [med_ball_slam, med_ball_overhead_throw]
med_ball_overhead_throw -> [med_ball_slam, med_ball_chest_throw]

# --- bodyweight, suspension, and band variations (modality balance) ---

# SQUAT (Low CNS)
bodyweight_squat -> [tempo_bodyweight_squat, band_goblet_squat, suspension_squat]
tempo_bodyweight_squat -> [bodyweight_squat, suspension_squat, band_goblet_squat]
bodyweight_split_squat -> [band_split_squat, bulgarian_split_squat, step_up]
step_up -> [bodyweight_split_squat, band_split_squat, bulgarian_split_squat]
shrimp_squat -> [pistol_squat, bulgarian_split_squat]
suspension_squat -> [bodyweight_squat, tempo_bodyweight_squat, band_goblet_squat]
band_goblet_squat -> [band_front_squat, goblet_squat, bodyweight_squat]
band_front_squat -> [band_goblet_squat, goblet_squat, suspension_squat]
band_split_squat -> [bodyweight_split_squat, bulgarian_split_squat, step_up]
kettlebell_front_squat -> [goblet_squat, band_front_squat, dumbbell_squat]

# HINGE (Low CNS)
glute_bridge -> [single_leg_glute_bridge, hip_thrust, band_pull_through]
single_leg_glute_bridge -> [glute_bridge, single_leg_rdl, band_pull_through]
bodyweight_good_morning -> [single_leg_hip_hinge, band_good_morning, glute_bridge]
single_leg_hip_hinge -> [single_leg_rdl, bodyweight_good_morning, band_rdl]
nordic_hamstring_curl -> [glute_ham_raise, suspension_leg_curl, seated_leg_curl]
suspension_leg_curl -> [seated_leg_curl, glute_ham_raise, nordic_hamstring_curl]
band_good_morning -> [bodyweight_good_morning, band_rdl, band_pull_through]
band_pull_through -> [cable_pull_through, band_rdl, band_good_morning]
band_rdl -> [band_pull_through, dumbbell_rdl, single_leg_hip_hinge]
band_kettlebell_swing -> [band_pull_through, band_rdl, cable_pull_through]

# PUSH_H (Low CNS)
incline_push_up -> [push_up, band_chest_press, suspension_push_up]
decline_push_up -> [push_up, dip, archer_push_up]
archer_push_up -> [decline_push_up, dip, push_up]
suspension_push_up -> [push_up, band_push_up, incline_push_up]
band_push_up -> [push_up, band_chest_press, suspension_push_up]
band_chest_press -> [band_chest_fly, push_up, machine_chest_press]
band_chest_fly -> [cable_chest_fly, band_chest_press, machine_chest_press]

# PUSH_V (Low CNS unless noted)
pike_push_up -> [decline_pike_push_up, suspension_overhead_press, band_overhead_press]
decline_pike_push_up -> [pike_push_up, db_shoulder_press, band_overhead_press]
wall_handstand_push_up -> [overhead_press, push_press]
suspension_overhead_press -> [pike_push_up, band_overhead_press, db_shoulder_press]
band_overhead_press -> [band_arnold_press, db_shoulder_press, pike_push_up]
band_arnold_press -> [arnold_press, band_overhead_press, db_shoulder_press]
band_single_arm_press -> [single_arm_db_press, band_overhead_press, band_arnold_press]

# PULL_H (Low CNS)
feet_elevated_inverted_row -> [inverted_row, suspension_row, band_row]
suspension_row -> [inverted_row, feet_elevated_inverted_row, band_row]
band_row -> [band_single_arm_row, seated_cable_row, suspension_row]
band_face_pull -> [band_row, band_single_arm_row, suspension_row]
band_single_arm_row -> [band_row, single_arm_db_row, suspension_row]

# PULL_V (Low CNS unless noted)
band_assisted_pull_up -> [band_assisted_chin_up, assisted_pull_up, suspension_pulldown]
band_assisted_chin_up -> [band_assisted_pull_up, assisted_pull_up, suspension_pulldown]
band_lat_pulldown -> [band_straight_arm_pulldown, lat_pulldown, suspension_pulldown]
band_straight_arm_pulldown -> [band_lat_pulldown, lat_pulldown, suspension_pulldown]
suspension_pulldown -> [band_lat_pulldown, assisted_pull_up, neutral_grip_pulldown]
archer_pull_up -> [pull_up, chin_up, weighted_pull_up]

# ROTATION (Low CNS)
bicycle_crunch -> [russian_twist, bodyweight_windmill, band_rotation]
bodyweight_windmill -> [bicycle_crunch, russian_twist, band_rotation]
band_woodchop -> [band_rotation, band_low_to_high_chop, cable_woodchop]
band_rotation -> [band_woodchop, band_low_to_high_chop, cable_rotation]
band_low_to_high_chop -> [band_woodchop, band_rotation, cable_low_to_high_chop]

# ANTI_ROTATION (Low CNS)
band_pallof_press -> [pallof_press, band_anti_rotation_hold, band_dead_bug]
band_anti_rotation_hold -> [band_pallof_press, pallof_press, side_plank]
band_dead_bug -> [dead_bug, band_pallof_press, bird_dog]

# CARRY (Low CNS)
band_resisted_march -> [band_anchored_carry, weighted_vest_carry, farmer_carry]
band_anchored_carry -> [band_resisted_march, suitcase_carry, suspension_anchored_carry]
band_overhead_carry -> [band_anchored_carry, waiter_carry, band_resisted_march]
weighted_vest_carry -> [farmer_carry, band_resisted_march, front_rack_carry]
suspension_anchored_carry -> [band_anchored_carry, suitcase_carry, band_resisted_march]

# LOCOMOTION (Low CNS)
lateral_band_walk -> [monster_walk, band_resisted_walk, crab_walk]
monster_walk -> [lateral_band_walk, band_resisted_walk, crab_walk]
band_resisted_walk -> [lateral_band_walk, monster_walk, walking_lunge]
crab_walk -> [bear_crawl, monster_walk, lateral_band_walk]

# JUMP (High CNS)
band_resisted_squat_jump -> [band_resisted_vertical_jump, squat_jump, vertical_jump]
band_resisted_broad_jump -> [broad_jump, band_resisted_squat_jump, band_resisted_vertical_jump]
band_resisted_vertical_jump -> [band_resisted_squat_jump, vertical_jump, squat_jump]
tuck_jump -> [squat_jump, vertical_jump, box_jump]
