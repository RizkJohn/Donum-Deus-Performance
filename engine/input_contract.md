## REQUIRED (STRICT)

{
  "client_profile": {
    "age": "number",
    "weight": "number",
    "training_age": "Beginner|Intermediate|Advanced"
  },
  "goals": {
    "primary": "string",
    "secondary": ["string"]
  },
  "schedule": {
    "available_days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "sport_days": {"basketball": ["Monday"]},
    "session_duration": "number"
  },
  "state": {
    "sleep":    "number 1–5  (1=excellent, 5=terrible)",
    "soreness": "number 1–5  (1=none, 5=severe)",
    "energy":   "number 1–5  (1=high, 5=depleted)",
    "stress":   "number 1–5  (1=calm, 5=severe)",
    "injuries": ["string"]
  }
}

## OPTIONAL (athlete-state seed — defaults applied when omitted; legacy payloads valid)

{
  "preferences": {
    "training_environment": "full_gym|home|minimal   (default full_gym)",
    "preferred_modalities": ["string"],
    "exercise_aversions":   ["string"],
    "novelty_tolerance":    "low|medium|high   (default medium)",
    "recovery_capacity":    "low|moderate|high|null   (derived from age+training_age when null)"
  }
}

- preferences feed ONLY the Assessment Layer + Variation Engine. They never
  touch the deterministic safety core (CNS / coverage / volume / intensity).

## DERIVED (computed by engine — never supplied by client)
- fatigue_score = average(sleep, soreness, energy, stress), clamped [1–5]
- fatigue_state = high (>=4.0) | moderate (3.0–3.9) | low (<3.0)
}