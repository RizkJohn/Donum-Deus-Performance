# input_contract.md

## REQUIRED INPUT

{
  "client_profile": {
    "age": 0,
    "weight": 0,
    "training_age": "Intermediate"
  },
  "goals": {
    "primary": "",
    "secondary": []
  },
  "schedule": {
    "available_days": [],
    "sport_days": {},
    "session_duration": 60
  },
  "state": {
    "fatigue_score": 0,
    "injuries": []
  }
}

---

## RULES
- All fields required
- No missing keys
- Normalize before processing

End.