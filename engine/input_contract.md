# Input Contract

The client payload the engine consumes. Strict: all fields required, no extra
keys, validated before processing. This is exactly what the assessment funnel
collects — and every field below is **used** by the decision engine.

## Schema (STRICT)
```
{
  "client_profile": {
    "age": "number",                       // recovery scaling (≥55 = masters)
    "weight": "number",                     // context only; loads are %1RM/RIR
    "training_age": "Beginner|Intermediate|Advanced"
  },
  "goals": {
    "primary": "string",                    // sets the loading scheme
    "secondary": ["string"]
  },
  "schedule": {
    "available_days": ["Monday", ... "Sunday"],
    "sport_days": {"basketball": ["Monday"]},
    "session_duration": "number"            // minutes; caps exercises/session
  },
  "state": {
    "fatigue_score": "number",              // 1–5; sets volume + flag
    "fatigue_state": "low|moderate|high",
    "injuries": ["string"]                  // remove contraindicated exercises
  }
}
```

## How each parameter drives the engine
| Parameter | Effect |
|---|---|
| `training_age` | Training days/week, base volume, and which exercise `level`s are allowed. |
| `age` | ≥ 55 reduces volume ×0.85 and caps High-CNS days at 1. |
| `weight` | Context only — prescriptions are relative (%1RM / RIR), not absolute load. |
| `goals.primary` | Resolves to a goal profile → sets/reps/rest/intent, volume bias, conditioning dose (`programming.md`). |
| `available_days` / `sport_days` | Training-day selection, CNS spacing, pre-sport Low-CNS day. |
| `session_duration` | Time budget caps exercises per session (≈ 7 min each after warmup/mobility). |
| `fatigue_score` / `fatigue_state` | Volume reduction and progression flag (`fatigue_model.md`). |
| `injuries` | Normalized to contraindication tags; matching exercises are removed (substituted within pattern + CNS). |
