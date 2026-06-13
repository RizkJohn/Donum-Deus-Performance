# Retry Policy

When the QC gate rejects a program, the engine retries before giving up.

```
max_attempts: 3

on_failure:
  1. Return the QC failure context to the model.
  2. Constrain ONLY the offending fields (named by the failed checks).
  3. Regenerate.

on_repeat_failure (attempt ≥ 2):
  - Simplify: reduce exercise count toward the minimum that meets coverage,
    and remove optional conditioning.

on_exhaustion (all attempts fail):
  - Return {"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]} — never a
    partial plan.
```

The deterministic decision engine can also return `UNSATISFIABLE_CONSTRAINTS`
**before** any model call (e.g. no available training days, or an injury that
removes an entire required movement pattern) — in that case no attempts are
spent.
