# Programming Parameters (goal-driven)

The client's **primary goal** sets the loading scheme. The decision engine
resolves the goal to a canonical profile (NASM / ACSM / NSCA aligned) and
injects concrete per-block prescriptions into the plan. Aliases map free-text
goals onto these profiles (e.g. "muscle"/"size" → Hypertrophy,
"weight loss"/"recomp" → Fat Loss, "sport"/"power" → Athletic Performance);
anything unrecognized falls back to General Health.

`reps` are written to match the output schema (`n`, `lo-hi`, or `AMRAP`).
Never AMRAP on Power/Strength primaries. Rest is `n sec` / `n min`.

## Strength
- Power: 4 × 3 @ 3 min — maximal intent.
- Strength: 4 × 3–5 @ 3 min — 85%+ 1RM, 1–2 RIR, explosive concentric.
- Accessory: 3 × 6–8 @ 2 min — controlled, 1–2 RIR.
- Core: 3 × 8–10 @ 60 sec. Conditioning: none. Volume bias: 0.9×.
- Strength-block rep band (QC-enforced): **2–6**.

## Hypertrophy
- Power: 3 × 3 @ 2 min (primer). Strength: 4 × 6–8 @ 2 min — 1–2 RIR, full ROM.
- Accessory: 3 × 10–12 @ 75 sec — 1 RIR, controlled tempo.
- Core: 3 × 12–15 @ 45 sec. Conditioning: ~5 min. Volume bias: 1.2×.
- Strength-block rep band: **5–12**.

## Fat Loss
- Power: 3 × 3 @ 2 min. Strength: 3 × 8–12 @ 75 sec — retain muscle, 1–2 RIR.
- Accessory: 3 × 12–15 @ 45 sec — short rest, elevated heart rate.
- Core: 3 × 12–15 @ 30 sec. Conditioning: ~15 min. Volume bias: 1.1×.
- Strength-block rep band: **6–15**.

## Athletic Performance
- Power: 4 × 3 @ 2 min — maximal velocity / intent.
- Strength: 4 × 4–6 @ 2.5 min — heavy with explosive intent, 1–2 RIR.
- Accessory: 3 × 8–10 @ 90 sec — unilateral bias, control landings.
- Core: 3 × 8–10 @ 45 sec — rotary power and bracing. Conditioning: ~10 min.
- Volume bias: 1.0×. Strength-block rep band: **3–6**.

## General Health
- Power: 3 × 3 @ 2 min (submaximal). Strength: 3 × 8–10 @ 90 sec — 2–3 RIR.
- Accessory: 2 × 10–12 @ 60 sec. Core: 2 × 10–12 @ 45 sec.
- Conditioning: ~10 min. Volume bias: 1.0×. Strength-block rep band: **6–12**.

## Volume budgeting
Per-session exercise count = base by training age (Beginner 5 / Intermediate 6
/ Advanced 7) × goal volume bias × age factor (×0.85 if ≥ 55), capped by the
session-duration time budget and the hard maximum of 8, then reduced 30% when
fatigue is high (see `fatigue_model.md`).
