## OUTPUT
- fatigue_score: number (0-5)
- fatigue_state: ["low","moderate","high"]
- volume_ceiling:
    conditioning_permitted: boolean
    max_accessory_exercises: number

## THRESHOLDS
>= 4.0 -> high
3.0-3.9 -> moderate
< 3.0  -> low

## VOLUME CEILING MAP
Emit volume_ceiling alongside fatigue_state on every model call.
Engine and QC (CHECK_12) consume volume_ceiling directly.

  | fatigue_state | conditioning_permitted | max_accessory_exercises |
  |---------------|------------------------|-------------------------|
  | low           | true                   | 4                       |
  | moderate      | true                   | 2                       |
  | high          | false                  | 1                       |

## CONSUMPTION ORDER
fatigue_model must be resolved BEFORE progression_engine and BEFORE session construction.
volume_ceiling is a hard constraint — engine does not override it.

## EXAMPLE OUTPUT
{
  "fatigue_score": 3.4,
  "fatigue_state": "moderate",
  "volume_ceiling": {
    "conditioning_permitted": true,
    "max_accessory_exercises": 2
  }
}
