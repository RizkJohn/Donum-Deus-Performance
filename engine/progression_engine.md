# Progression Engine

How load and volume advance week to week. The current readiness state sets a
single `flag` returned in the program's `flags` array; the flag governs the
next block's adjustment.

## States (from the fatigue model)
- `progress` — readiness is good; advance.
- `maintain` — hold; consolidate.
- `deload` — back off to recover.

## Load steps (strength / primary lifts)
- Successful session at target reps + RIR → **+2.5%** (upper body) / **+5%**
  (lower body) next exposure.
- Failed target twice in a row → **−5%** and rebuild.
- Progression must be measurable: load, reps, or movement control.

## By goal emphasis
- **Strength / Athletic:** progress load first, reps fixed in band.
- **Hypertrophy / Fat Loss / General:** double progression — add reps to the
  top of the band, then add load and reset to the bottom.
- **Power:** progress intent/velocity, not load or volume.

## Deload triggers
Every **6–8 weeks**, or earlier on a `deload` fatigue flag, a measured
performance drop, or persistently high RPE. A deload cuts volume (not
intensity) for one week.

> Note: scheduled-by-week deloads require training-history persistence
> (program-run history); the fatigue-triggered deload is fully active today.
