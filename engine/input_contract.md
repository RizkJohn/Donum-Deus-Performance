## REQUIRED (STRICT)

{
  "client_profile": {
    "age": "integer 13–80",
    "sex": "male|female|other (optional)",
    "weight": "number (kg)",
    "height_cm": "number (optional)",
    "training_age": "Beginner|Intermediate|Advanced|Elite",
    "lifestyle": "sedentary|lightly_active|active|very_active (optional, default: active)"
  },
  "goals": {
    "primary": "strength|hypertrophy|fat_loss|athletic_performance|general_fitness|endurance|mobility|rehabilitation",
    "secondary": ["<same enum as primary>"]
  },
  "schedule": {
    "available_days": ["Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday"],
    "sport_days": {"<sport>": ["<Day>"]},
    "session_duration": "integer 30–120 (minutes)"
  },
  "equipment": ["barbell|dumbbells|cables|machines|kettlebells|resistance_bands|pull_up_bar|sled|med_ball|bodyweight_only"],
  "state": {
    "sleep":    "integer 1–5  (1=excellent, 5=terrible)",
    "soreness": "integer 1–5  (1=none, 5=severe)",
    "energy":   "integer 1–5  (1=high, 5=depleted)",
    "stress":   "integer 1–5  (1=calm, 5=severe)",
    "injuries": ["string — body region + limitation, e.g. 'left knee: no single-leg loading'"]
  },
  "history": {
    "consecutive_training_weeks": "integer (optional, 0 if unknown)",
    "last_deload_week": "YYYY-MM-DD (optional, null if unknown)"
  }
}

## VALID SPORT KEYS (sport_days)
basketball, soccer, football, baseball, tennis, volleyball, swimming, cycling, running,
mma, bjj, wrestling, hockey, lacrosse, golf, rugby, other

## EQUIPMENT DEFAULTS
If equipment is omitted or empty → assume [barbell, dumbbells, cables, machines, pull_up_bar].

## DERIVED (computed by engine — never supplied by client)
- fatigue_score = average(sleep, soreness, energy, stress), clamped [1–5]
- fatigue_state = high (>=4.0) | moderate (3.0–3.9) | low (<3.0)
- deload_due = consecutive_training_weeks >= 6 OR last_deload_week older than 8 weeks

## GOAL → TRAINING EMPHASIS
- strength            → Strength block dominant; 3–5 sets, 3–6 reps; Power secondary
- hypertrophy         → Accessory block dominant; 3–4 sets, 6–12 reps; Strength secondary
- fat_loss            → Conditioning + Accessory dominant; circuit-friendly; volume ≥ moderate
- athletic_performance→ Power + Strength co-dominant; sport-day CNS protected
- general_fitness     → Balanced; all blocks present; moderate load
- endurance           → Conditioning dominant; Strength secondary; carry/locomotion prioritised
- mobility            → Mobility block extended (≥3 exercises); Strength 2 lifts max; joint integrity first
- rehabilitation      → Warmup + Mobility dominant; Low CNS only; avoid all blocked patterns

## INJURY → BLOCKED PATTERNS
- knee        → squat and jump (injured side if unilateral)
- shoulder    → push_v, push_h, pull_v (injured side)
- lower back  → High-CNS hinge only; use Low-CNS substitutes
- hip         → squat, unilateral hinge; no jump
- Use substitution_rules.md for all pattern replacements.
