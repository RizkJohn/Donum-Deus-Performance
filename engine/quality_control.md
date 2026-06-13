# Quality Control Gate

Every generated program passes through this gate before delivery. **All checks
must pass.** Any failure rejects the program; the engine retries with the
offending fields constrained (`retry_policy.md`) and, if it cannot satisfy the
constraints, returns `UNSATISFIABLE_CONSTRAINTS` — never a partial plan. The
gate re-validates every hard rule regardless of what the model returned.

## Checks (all must pass)
1. **schema_valid** — strict structural validation: enums, rep/rest patterns,
   `sets` 1–6, `notes` ≤ 120 chars, no extra fields.
2. **cns_limits** — ≤ 2 High-CNS days; no consecutive High-CNS days.
3. **pre_sport_low_cns** — the day before any sport day is Low CNS.
4. **movement_coverage** — week covers squat, hinge, push (h/v), pull (h/v),
   rotation/anti-rotation, carry/locomotion, jump.
5. **block_order** — Warmup → Power → Strength → Accessory → Core → Mobility;
   days and split ordered Mon→Sun.
6. **library_only** — every `exercise.name` exists exactly in the library.
7. **volume_ok** — ≤ 8 exercises per session.
8. **intensity_safety** — no AMRAP / training-to-failure on Power/Strength
   primaries (1–3 RIR maintained).
9. **fatigue_applied** — volume respects the fatigue-adjusted budget; intensity
   untouched.
10. **progression_flag** — `flags` contains the computed progress/maintain/deload.
11. **plan_adherence** — the split matches the deterministic plan; sessions only
    on planned training days.
12. **injury_blocks** — no exercise contraindicated by the client's injuries.
13. **level_appropriate** — no exercise above the client's training level.
14. **goal_prescription** — Strength-block reps fall in the goal's loading band;
    Power-block reps stay explosive (≤ 6).
