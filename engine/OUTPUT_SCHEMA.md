# output_schema.md

## REQUIRED FORMAT (JSON ONLY)

{
  "weekly_split": [
    {
      "day": "Monday",
      "cns": "High",
      "focus": "Lower Strength"
    }
  ],
  "sessions": [
    {
      "day": "Monday",
      "blocks": [
        {
          "type": "Power",
          "exercises": [
            {
              "name": "Trap Bar Jump",
              "sets": 4,
              "reps": 3,
              "rest": "2-3 min",
              "notes": "Max intent"
            }
          ]
        }
      ]
    }
  ],
  "conditioning": [],
  "mobility": [],
  "flags": []
}

---

## RULES
- JSON only (no text outside)
- All fields required
- No null values
- Exercises must exist in library

Reject invalid outputs.

End.