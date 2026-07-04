# Data Retention & Privacy Stance

> **Status: DRAFT — pending owner adoption.** This documents the position the
> build already implements, so the policy and the code state the same facts.
> It is an internal engineering stance, not legal advice; have counsel review
> before publishing any customer-facing version.

## What we hold, and why

| Data | Table(s) | Why it exists |
|---|---|---|
| Email address | `leads`, `users`, `athlete_states`, `feedback` | Account identity and the join key for program history |
| Assessment payload (goals, schedule, injuries, fatigue state) | `program_runs.payload` | Input the program was generated from; needed to adapt future cycles |
| Generated programs + QC trail | `program_runs` | The product itself, and the audit trail that it passed every safety gate |
| Training state (exposure, fatigue index, compliance) | `athlete_states` | Folded forward each cycle — this is what makes programming adaptive |
| Check-in signals (RPE, soreness, completion) | `feedback` | Reinforcement input to the next cycle |
| Password hash (bcrypt), Stripe customer/subscription IDs | `users` | Authentication and billing. We never store card numbers — Stripe does |

Injury and readiness fields make assessment data **health-adjacent**. It is
treated as sensitive: never sold, never shared beyond the processors below,
never used for anything except generating and adapting the client's program.

## Processors (who else touches it)

- **Neon** — Postgres hosting (the tables above).
- **Anthropic** — assessment payloads are sent for program generation when
  `LLM_PROVIDER=claude`. Not used to train models per API terms.
- **Stripe** — billing identity and subscription state.
- **Resend** — email address, for program-ready and welcome email delivery.

## Retention

- **Active clients**: retained while the relationship is active — history is
  the input to adaptive programming, so deleting it degrades the product.
- **Erasure on request**: `DELETE /v1/data` permanently removes programs,
  feedback, athlete state, lead rows, **and any account** for an email —
  GDPR/CCPA right to erasure. An active Stripe subscription is cancelled
  first; if cancellation fails, nothing is deleted (the client is never
  left silently paying for an erased account).
- **Export on request**: `GET /v1/data` returns everything held for an
  email — GDPR right of access.
- **Ownership verification**: both endpoints require a short-lived (30 min)
  confirmation code requested via `POST /v1/data/request` and delivered
  only to the email address itself — possession proves ownership. The
  request endpoint answers identically whether or not the address has data
  (no enumeration), and is rate-limited.
- **Dormant funnel leads** (assessed, never became a client): reviewed for
  deletion after **24 months** of inactivity. *(Owner to confirm the window.)*
- **Backups**: Neon point-in-time recovery retains deleted rows until its
  recovery window (7 days on current plan) elapses; erasure is complete once
  the window rolls past the deletion.

## Commitments

1. Collect only what the engine consumes — every field held is either in
   `input_contract.md` or required for auth/billing.
2. Erasure means erasure: one endpoint, all tables, no soft-delete residue.
3. Any new data category (e.g. video uploads, if a form-check feature ships)
   gets added to this document **before** the feature ships, not after.

## Gap history

Two gaps were found auditing `routes/assess.py` against this policy when it
was first drafted; **both are closed**:

1. ~~Erasure skips accounts~~ — `DELETE /v1/data` now deletes the `users`
   row, cancelling any active Stripe subscription first (a cancellation
   failure aborts the erasure entirely rather than orphaning billing).
2. ~~No ownership verification~~ — both data endpoints are gated behind a
   purpose-scoped confirmation token emailed to the address by
   `POST /v1/data/request`. Export tokens cannot erase and vice versa;
   data tokens are rejected as session tokens.

Remaining known limitation: there is no web UI for data requests yet — the
flow is API-only (the emailed code is used against the endpoints directly).
A `/data` page in `apps/web` is the natural follow-up.
