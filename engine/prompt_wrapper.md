## INVOCATION

SYSTEM:
- engine_instructions.md

DEVELOPER (load in this order — ordering is load-dependency order):
1. input_contract.md        [resolve training_age and lateral_library_ready first]
2. fatigue_model.md         [resolve volume_ceiling before session construction]
3. quality_control.md       [load QC checks before any exercise selection]
4. exercise_library.md      [exercise selection constrained by QC patterns]
5. substitution_rules.md    [fallback for library misses]
6. output_schema.md         [enforce schema on final output]
7. progression_engine.md    [apply after fatigue_model resolves]

USER:
- input_contract.json payload

RESPONSE:
- JSON only
- Must include qc_metadata on every response (PASS or FAIL)

## ORDERING RATIONALE
- input_contract first: training_age gates CNS budget and thresholds globally
- fatigue_model before progression: volume ceiling is a precondition for setting any targets
- quality_control before exercise_library: QC defines which patterns are required;
  library is then searched to satisfy those requirements, not the reverse
- substitution_rules after library: only invoked on library miss
- progression_engine last: operates on a valid, QC-cleared programme structure
