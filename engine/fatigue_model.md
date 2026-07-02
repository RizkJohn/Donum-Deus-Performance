## INPUTS (scored 1–5 each)
- sleep
- soreness
- energy
- stress

## SCORING
fatigue_score = average(sleep, soreness, energy, stress)

## THRESHOLDS
>=4.0 → high
3.0–3.9 → moderate
<3.0 → low

## RULES
- >=4.0: reduce session volume 30%; never increase intensity.
- 3.0–3.9: maintain program as written.
- <3.0: allow progression per progression_engine.

## CNS BUDGET (fatigue-adjusted)
Max High-CNS days/week is capped at 3, reduced by current fatigue tier:
- <3.0 (low): max 3 High CNS days/week
- 3.0–3.9 (moderate): max 2 High CNS days/week
- >=4.0 (high): max 1 High CNS day/week
No consecutive High CNS days, at any tier.
