# REINFORCEMENT SIGNALS

Without feedback, adaptation stays superficial. Capture what actually happened
after a cycle and fold it back into athlete_state so the NEXT assessment
autoregulates on real adherence/effort, not intake alone.

## INPUT (FeedbackIn → POST /v1/feedback)

{
  "email":            "string",
  "run_id":           "string (the program this feedback is about)",
  "completion_pct":   "0–1   fraction of prescribed work done",
  "rpe_drift":        "−5..5  actual − planned RPE",
  "soreness":         "1–5",
  "skipped_exercises":["string"],
  "substitutions":    ["string"],
  "enjoyment":        "1–5",
  "performance_note": "string (≤500)"
}

## FOLD-IN
- compliance_score ← EMA(0.5) of completion_pct.
- fatigue_index ← raised by high soreness (>3) and positive rpe_drift (harder
  than planned), clamped [0,1].
- Stored as an audit record (feedback table) AND merged into athlete_state.

## DOWNSTREAM
- compliance_score scales overload_tolerance in the Assessment Layer.
- fatigue_index lowers chronic readiness next cycle → autoregulated stimulus.
