## LOAD_STEP
- small:  +2.5%
- medium: +5%

## STATES
- progress
- maintain
- deload

## OUTPUT HOOK
Return flag in "flags": ["progress","maintain","deload"]

## DELOAD TRIGGER
- Every 6-8 weeks (scheduled)
- Or when performance drops across 2+ consecutive sessions on same lift

## EXERCISE ROTATION (VARIABILITY AT MACRO LEVEL)
After each 6-8 week block, rotate primary lift selection within the same pattern.
  Example: barbell_back_squat (Weeks 1-8) -> front_squat or safety_bar_squat (Weeks 9-16)
This preserves pattern coverage (squat) while preventing neural accommodation and
satisfying long-term variability intent from quality_control.md CHECK_7.

Do not rotate pattern — only rotate exercise within the same pattern family.

## PROGRESSION SEQUENCE
1. Resolve fatigue_state from fatigue_model (consume volume_ceiling first)
2. Apply load step if state = "progress"
3. Hold load if state = "maintain"
4. Reduce load -10% if state = "deload"; reduce volume, maintain frequency
