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
    "sport_days": {"sport_name": ["Day"]},
    "session_duration": "number"
  },
  "state": {
    "fatigue_score": "number",
    "fatigue_state": "low|moderate|high",
    "injuries": ["string"]
  }
}

## OPTIONAL

{
  "lateral_library_ready": "boolean"
}

## FIELD NOTES

training_age:
  Drives CNS budget resolution (quality_control.md SECTION 1) and laterality/volume thresholds.
  Must be present. No default value.
  Beginner     -> max_high_cns = 2
  Intermediate -> max_high_cns = 3
  Advanced     -> max_high_cns = 4

lateral_library_ready:
  Signals whether exercise_library contains lateral-pattern entries.
  true  -> engine uses CHECK_3 frontal plane resolution path (a) [pattern = "lateral"]
  false -> engine uses proxy paths (b) or (c); flag "LATERAL_LIBRARY_INCOMPLETE" in output flags
  Omit  -> engine defaults to false; proxy paths used

injuries:
  Used to waive jump requirement in CHECK_3 if value contains: "knee" | "ankle" | "hip"
  Engine must not drop other patterns due to injury — only waive jump.

fatigue_state:
  Must align with fatigue_score via fatigue_model.md thresholds.
  If mismatch detected, engine uses fatigue_score to recompute fatigue_state and logs a flag.

## VALIDATION
Reject payload if any required field is missing or incorrectly typed.
Return: {"error":"INVALID_INPUT","reasons":[...]}
