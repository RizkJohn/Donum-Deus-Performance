## LOAD_STEP
- small: +2.5%
- medium: +5%

## STATES
- progress
- maintain
- deload

## RULES BY MODALITY

### STRENGTH
- Increase load 2.5–5% on successful completion.
- Two consecutive failures → reduce load 5%.

### HYPERTROPHY
- Increase reps before increasing load.
- No training to failure.

### POWER
- Do not increase volume.
- Increase intent and speed per rep.

### DELOAD
- Schedule every 6–8 weeks OR when fatigue_state = high.
- Early triggers: performance drop, RPE spike, inconsistent output.
- Reduce volume; maintain load.

## MEASURABILITY
Progress must track at least one: load, reps, or movement quality.

## OUTPUT HOOK
Return flag in "flags": ["progress" | "maintain" | "deload"]
