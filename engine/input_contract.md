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
    "fatigue_score": "number",
    "fatigue_state": "low|moderate|high",
    "injuries": ["string"]
  }
}