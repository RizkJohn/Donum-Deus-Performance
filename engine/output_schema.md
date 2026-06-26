{
  "type": "object",
  "required": ["weekly_split","sessions","conditioning","mobility","flags","qc_metadata"],
  "additionalProperties": false,
  "properties": {
    "weekly_split": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["day","cns","focus"],
        "additionalProperties": false,
        "properties": {
          "day": {"type":"string","enum":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]},
          "cns": {"type":"string","enum":["High","Low"]},
          "focus": {"type":"string","minLength":1}
        }
      }
    },
    "sessions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["day","blocks"],
        "additionalProperties": false,
        "properties": {
          "day": {"type":"string","enum":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]},
          "blocks": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type","exercises"],
              "additionalProperties": false,
              "properties": {
                "type": {"type":"string","enum":["Warmup","Power","Strength","Accessory","Core","Mobility"]},
                "exercises": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["name","sets","reps","rest","notes"],
                    "additionalProperties": false,
                    "properties": {
                      "name":  {"type":"string"},
                      "sets":  {"type":"integer","minimum":1,"maximum":6},
                      "reps":  {"type":"string","pattern":"^([0-9]+(-[0-9]+)?|AMRAP)$"},
                      "rest":  {"type":"string","pattern":"^[0-9]+(\\.[0-9]+)? ?(sec|min)$"},
                      "notes": {"type":"string","maxLength":120}
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "conditioning": {"type":"array"},
    "mobility":     {"type":"array"},
    "flags":        {"type":"array","items":{"type":"string"}},
    "qc_metadata": {
      "type": "object",
      "required": ["qc_result"],
      "additionalProperties": false,
      "properties": {
        "qc_result":              {"type":"string","enum":["PASS","FAIL"]},
        "cns_budget_used":        {"type":"integer"},
        "cns_budget_max":         {"type":"integer"},
        "movement_planes_covered":{"type":"array","items":{"type":"string"}},
        "push_pull_ratio":        {"type":"number"},
        "unilateral_ratio":       {"type":"number"},
        "variability_flags":      {"type":"array","items":{"type":"string"}},
        "failed_checks":          {"type":"array","items":{"type":"string"}},
        "regenerate":             {"type":"boolean"}
      }
    }
  }
}
