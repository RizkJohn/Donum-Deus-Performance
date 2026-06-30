# VARIATION ENGINE

The anti-repetition mechanism. Adaptation is NOT randomness — rotate within
progression continuity. Operates on exposure tracked in athlete_state; it only
REORDERS / PRIORITISES the already-safe allowed pool. It never removes an
exercise the week needs for movement coverage.

## DERIVED METADATA (from existing library fields — no library-schema change)
- stimulus          ← pattern  (e.g. squat→lower_strength, jump→power)
- stability_demand  ← laterality  (Unilateral→high, Bilateral→moderate)
- fatigue_cost      ← cns  (High→0.8, Low→0.4)

## SCORING
- exercise_novelty(id) = 1 / (1 + recent_exercise_exposure[id])   → 1.0 if unseen.
- prioritize_pool: sort allowed ids by novelty × (0.5 + novelty_target),
  descending, id-tiebroken (deterministic). Novel first.
- avoid_recent_ids: soft set where novelty < (1 − novelty_target). A PROMPT
  hint only — coverage always wins.
- prioritized_groups: coverage groups ordered by ascending pattern exposure
  (least-trained first) → movement_priority.

## INTEGRATION
- decision engine sets allowed_exercise_ids to the prioritised order and demotes
  soft aversions to the tail; required coverage groups sequenced by priority.
- mock/LLM fill picks novel-first within each group → variation across cycles,
  same safety guarantees.
