# ATHLETE STATE (PERSISTENT)

Do NOT ask the model to remember implicitly. Maintain structured state
externally, keyed by athlete email, folded forward every cycle. This is the
single biggest upgrade over a static prompt-template coaching system.

## SHAPE (AthleteState — JSON blob, one row per athlete)

{
  "training_age":            "Beginner|Intermediate|Advanced",
  "goal_priority":           ["primary", "...secondary"],
  "movement_restrictions":   ["injury strings"],
  "fatigue_index":           "0–1 running EMA (0 fresh → 1 fried)",
  "recovery_capacity":       "low|moderate|high",
  "exercise_aversion":       ["string"],
  "preferred_modalities":    ["string"],
  "recent_movement_patterns":{"pattern": "exposure count"},
  "recent_exercise_exposure":{"exercise_id": "exposure count"},
  "novelty_tolerance":       "low|medium|high",
  "compliance_score":        "0–1 running EMA of completion",
  "cycle_count":             "int"
}

## LIFECYCLE
1. load_or_init — rehydrate stored state (or init) and fold in the current
   check-in (profile, goals, injuries, preferences). fatigue_index = acute on
   cycle 0, else EMA(0.5).
2. assess + generate — read-only against state.
3. update_exposure — decay the rolling window (×0.5), then count this cycle's
   prescribed work; cycle_count += 1.
4. fold_feedback — reinforcement signals adjust compliance_score + fatigue_index.

## RULES
- Pure functions; persistence is the route's responsibility.
- recovery_capacity derived from age + training_age when not supplied.
- Erasure (GDPR/CCPA) deletes the athlete_state row with the rest of the data.
