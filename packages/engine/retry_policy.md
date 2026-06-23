## RETRY POLICY

max_attempts: 3

on_failure:
1. return error context to model
2. constrain offending fields only
3. regenerate

on_repeat_failure:
- escalate or simplify:
  - reduce exercise count
  - remove optional conditioning