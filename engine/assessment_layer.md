# ASSESSMENT LAYER

Separate ASSESSMENT from PROGRAMMING. This layer reasons over the validated
payload + persistent athlete_state and emits ABSTRACTIONS — never workouts.
The programming layer (decision engine + LLM fill) consumes its output.

Deterministic by default (zero LLM cost, offline-testable). When
`LLM_PROVIDER=claude`, an Opus-tier model MAY narrate `summary`; the structured
fields stay rule-computed.

## OUTPUT (TrainingAssessment)

{
  "readiness_score":        "0–1   (0.6·acute + 0.4·chronic load)",
  "training_state":         "primed | balanced | functional_overreach | depleted",
  "recovery_classification":"low | moderate | high",
  "overload_tolerance":     "0–1   (training_age × readiness × compliance)",
  "recommended_stimulus":   "progressive_overload | volume_maintenance | volume_reduction | technical_deload",
  "progression_path":       "progress | maintain | deload",
  "movement_priority":      ["coverage-group keys, least-trained first, goal-biased"],
  "novelty_target":         "0–1",
  "intensity_target":       "low | moderate | moderate-high | high",
  "intensity_range":        "human-readable RPE / %1RM band",
  "exclusions":             ["blocked exercise ids (injuries ∪ aversions)"],
  "summary":                "the coach's read — surfaced in UI + program PDF"
}

## RULES
- readiness: acute = 1 − (fatigue_score−1)/4; chronic = 1 − fatigue_index.
- training_state thresholds: ≥0.75 primed · ≥0.5 balanced · ≥0.3 functional_overreach · else depleted.
- depleted ⇒ recommended_stimulus = technical_deload (overrides the flag).
- intensity = goal base, stepped DOWN by training_state, then capped by
  training_age ceiling (Beginner never reaches "high").
- exclusions never reduce weekly movement coverage below satisfiable — injuries
  hard-block, aversions are soft (kept for coverage, de-prioritised).
- Same inputs ⇒ same assessment (determinism).
