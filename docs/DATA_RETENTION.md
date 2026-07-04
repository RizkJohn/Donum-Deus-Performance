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
  feedback, athlete state, and lead rows for an email — already implemented,
  GDPR/CCPA right to erasure. **Known gaps (open, tracked below)**: the
  `users` account row is *not* yet deleted by this endpoint, and the endpoint
  does not verify the requester owns the email.
- **Export on request**: `GET /v1/data` returns everything held for an email —
  already implemented, GDPR right of access. Same ownership-verification gap.
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

## Open gaps — must close before public launch

Both found auditing `routes/assess.py` against this policy; neither is a
drift risk in code review because they are behavioral, not structural:

1. **Erasure skips accounts.** `DELETE /v1/data` predates the `users` table
   and was never extended — email, password hash, and Stripe IDs survive a
   "complete" erasure. Extending it must handle an active subscription
   (cancel via Stripe first, or retain minimal billing records under the
   legal-obligation exception) — not a blind row delete.
2. **No ownership verification.** `DELETE /v1/data` and `GET /v1/data`
   accept any email unauthenticated: anyone who knows a client's address
   can export or destroy their history. Needs an email-confirmation loop
   (funnel users have no account) and/or an authenticated session path.
