## output_schema.json (ENFORCED)

{
  "type": "object",
  "required": ["weekly_split","sessions","conditioning","mobility","flags"],
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
        "type":"object",
        "required":["day","blocks"],
        "additionalProperties": false,
        "properties":{
          "day":{"type":"string","enum":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]},
          "blocks":{
            "type":"array",
            "items":{
              "type":"object",
              "required":["type","exercises"],
              "additionalProperties": false,
              "properties":{
                "type":{"type":"string","enum":["Warmup","Power","Strength","Accessory","Core","Mobility"]},
                "exercises":{
                  "type":"array",
                  "items":{
                    "type":"object",
                    "required":["name","sets","reps","rest","notes"],
                    "additionalProperties": false,
                    "properties":{
                      "name":{"type":"string"},
                      "sets":{"type":"integer","minimum":1,"maximum":6},
                      "reps":{"type":"string","pattern":"^([0-9]+(-[0-9]+)?|AMRAP)$"},
                      "rest":{"type":"string","pattern":"^[0-9]+(\\.[0-9]+)? ?(sec|min)$"},
                      "notes":{"type":"string","maxLength":120}
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "conditioning":{"type":"array"},
    "mobility":{"type":"array"},
    "flags":{"type":"array","items":{"type":"string"}}
  }
}