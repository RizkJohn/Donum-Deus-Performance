# Fatigue Model

The client reports readiness as a `fatigue_score` (1–5) plus a categorical
`fatigue_state` (low / moderate / high). The score is authoritative. (When raw
sub-scores — sleep, soreness, energy, stress — are later added to the input
contract, `fatigue_score` becomes their average; the engine already supports
that computation.)

## Score → action
| fatigue_score | progression flag | volume |
|---|---|---|
| < 3.0 | `progress` | normal |
| 3.0 – 3.9 | `maintain` | normal |
| ≥ 4.0 | `deload` | **reduced 30%** |

## State thresholds
`≥ 4.0 → high`, `3.0–3.9 → moderate`, `< 3.0 → low`.

## Hard rule — volume, never intensity
Fatigue reduces **volume only**. The strength load (%1RM / RIR target) is
locked; under high fatigue the engine drops accessory volume and removes
optional conditioning rather than lowering the working weight, preserving the
strength stimulus while managing total stress.

## Order of reduction under high fatigue
1. Remove conditioning → 2. Reduce accessory volume → 3. Maintain primary
intensity. The per-session exercise budget is scaled ×0.70 (floored at 3).
