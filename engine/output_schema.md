## output_schema.json (ENFORCED)

{
  "type": "object",
  "required": ["program_summary","weekly_split","sessions","conditioning","flags"],
  "additionalProperties": false,
  "properties": {

    "program_summary": {
      "type": "object",
      "required": ["week_theme","training_days","fatigue_state","progression_flag","key_focuses"],
      "additionalProperties": false,
      "properties": {
        "week_theme": {
          "type": "string", "minLength": 5, "maxLength": 100,
          "description": "One sentence. E.g. 'Strength focus — moderate volume, maintain current loads' or 'Deload week — full recovery and joint care'"
        },
        "training_days":    {"type": "integer", "minimum": 1, "maximum": 7},
        "fatigue_state":    {"type": "string",  "enum": ["low","moderate","high"]},
        "progression_flag": {"type": "string",  "enum": ["progress","maintain","deload"]},
        "key_focuses": {
          "type": "array", "minItems": 1, "maxItems": 4,
          "items": {"type": "string", "maxLength": 80},
          "description": "2–4 plain-language coaching priorities. E.g. 'Build vertical pulling strength', 'Protect CNS before Thursday game'"
        }
      }
    },

    "weekly_split": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["day","cns","focus","estimated_duration_min"],
        "additionalProperties": false,
        "properties": {
          "day":  {"type": "string", "enum": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]},
          "cns":  {"type": "string", "enum": ["High","Low"]},
          "focus":{"type": "string", "minLength": 1, "maxLength": 60},
          "estimated_duration_min": {"type": "integer", "minimum": 15, "maximum": 120}
        }
      }
    },

    "sessions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["day","session_intent","blocks"],
        "additionalProperties": false,
        "properties": {
          "day": {"type": "string", "enum": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]},
          "session_intent": {
            "type": "string", "minLength": 10, "maxLength": 200,
            "description": "One plain-language sentence. What this session builds and why. E.g. 'Build explosive lower-body power while keeping CNS load low ahead of Thursday's game.'"
          },
          "blocks": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type","block_intent","exercises"],
              "additionalProperties": false,
              "properties": {
                "type": {"type": "string", "enum": ["Warmup","Power","Strength","Accessory","Core","Mobility"]},
                "block_intent": {
                  "type": "string", "minLength": 5, "maxLength": 120,
                  "description": "One sentence on what this block achieves. E.g. 'Prime glutes and mobilise the thoracic spine before loading.'"
                },
                "exercises": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["name","sets","reps","rest","load_guidance","notes"],
                    "additionalProperties": false,
                    "properties": {
                      "name":  {"type": "string"},
                      "sets":  {"type": "integer", "minimum": 1, "maximum": 6},
                      "reps":  {"type": "string",  "pattern": "^([0-9]+(-[0-9]+)?|AMRAP|Hold [0-9]+s)$"},
                      "rest":  {"type": "string",  "pattern": "^[0-9]+(\\.[0-9]+)? ?(sec|min)$"},
                      "load_guidance": {
                        "type": "string", "maxLength": 80,
                        "description": "Never empty. E.g. '70–75% 1RM', 'RPE 7', 'Bodyweight', '2–3 RIR', 'Technique focus — no load'"
                      },
                      "notes": {
                        "type": "string", "maxLength": 160,
                        "description": "Primary coaching cue. Include tempo when relevant. E.g. 'Brace before descent; 3-1-1 tempo' or 'Stop 2 reps short of failure'"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    "conditioning": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["day","modality","duration_min","intensity","description"],
        "additionalProperties": false,
        "properties": {
          "day":      {"type": "string", "enum": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]},
          "modality": {"type": "string", "enum": ["carries","locomotion","circuits","steady_state","intervals","sport_practice"]},
          "duration_min": {"type": "integer", "minimum": 5, "maximum": 30},
          "intensity":    {"type": "string", "enum": ["low","moderate","high"]},
          "description": {
            "type": "string", "maxLength": 250,
            "description": "Plain-language protocol. E.g. '3 rounds: 40m farmer carry → 20m bear crawl, rest 90 sec between rounds'"
          }
        }
      }
    },

    "flags": {"type": "array", "items": {"type": "string"}}
  }
}

## PLAIN-LANGUAGE REQUIREMENTS (enforced by QC)

Every text field must be readable by a client without a coach present:
- `week_theme`: state the training purpose plainly. No jargon.
- `session_intent`: conversational — explain the goal and the reason in one sentence.
- `block_intent`: briefly explain what the block achieves physiologically. One sentence.
- `load_guidance`: never empty. No external load → "Bodyweight" or "Technique focus — no load".
- `notes`: lead with the most important coaching cue. Include tempo notation when relevant (e.g. "3-1-1 tempo").

## BLOCK-LEVEL EXERCISE COUNTS (enforced by QC)
- Warmup:    2–4 exercises
- Power:     1–2 exercises
- Strength:  2–3 exercises
- Accessory: 2–3 exercises
- Core:      1–2 exercises
- Mobility:  2–4 exercises
