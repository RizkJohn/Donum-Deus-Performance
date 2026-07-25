# Legal & Privacy Compliance Review — Deus Performance

**Entity:** Riz Management LLC (operating as Deus Performance)
**Scope:** Entire codebase — landing/marketing site, assessment funnel, API
pipeline, data persistence, third-party processors, and the existing legal
pages.
**Date of review:** 2026-07-25
**Reviewer:** Automated codebase audit (engineering-level).

> **This document is not legal advice.** It is an engineering compliance audit
> intended to be handed to a licensed attorney for review before the legal
> pages are relied upon in production. Several items below (governing-law
> choice, entity formation state, effective dates, and the enforceability of
> the liability/waiver language in each target jurisdiction) require a lawyer's
> sign-off.

---

## 0. On the goal "a user cannot sue us for compliance issues"

This is the one objective that cannot be delivered as literally stated, and it
is important to be direct about why:

- **Statutory privacy and consumer-protection rights are non-waivable.** GDPR,
  UK GDPR, CCPA/CPRA, the Washington My Health My Data Act, COPPA, the FTC Act,
  and their peers cannot be contracted away. A Terms of Service that *claimed*
  to strip those rights would itself be an unfair/deceptive practice and would
  weaken, not strengthen, the company's position.
- **What terms *can* legitimately do** is limit exposure for ordinary claims:
  disclaim warranties, cap damages, require individual arbitration, waive class
  actions, secure indemnification, and — most importantly for a training
  product — obtain a conspicuous **assumption of risk and release** for
  exercise-related injury. Those are standard and generally enforceable.
- **The single largest litigation risk in this codebase was not a missing
  clause — it was code that contradicted the promises the legal pages already
  make.** A plaintiff's strongest case is "you said X in your privacy policy
  and did Y." The highest-value work in this review was closing those
  code-vs-policy gaps (see Findings F1 and F4). That is done.

The remedial work in this review therefore does two things: (a) strengthens the
legitimate liability protections, and (b) makes the product's behavior match its
stated policies so the protections actually hold up.

---

## 1. What was already strong

The product is in far better shape than a typical pre-launch codebase:

- A substantive **Privacy Policy** (`apps/web/src/app/privacy/page.tsx`) and
  **Terms of Service** (`apps/web/src/app/terms/page.tsx`) already exist, are
  routed, and are linked from the footer and the assessment consent gate.
- Health/wellness data is explicitly identified and given heightened treatment
  (HIPAA-scope disclaimer, Washington MHMD, CCPA/CPRA "sensitive PI").
- No advertising trackers, analytics pixels, cookies, or data sales — the
  "no cookie banner required" claim is backed by the actual dependency tree.
- A "Preservation of Consumer Rights" clause already carves out non-waivable
  statutory rights (the correct, honest approach).
- Passwords are hashed with bcrypt; sessions are httpOnly, `secure`,
  `sameSite=lax`; TLS + strong security headers are configured.

---

## 2. Data inventory (what is collected, where it goes)

| Data | Collected where | Persisted | Shared with |
|------|-----------------|-----------|-------------|
| Email | Assessment step 6, signup, login, check-in | `leads`, `athlete_states` (PK), `feedback`, `users` | Resend (email delivery), Stripe (billing) |
| Age, body weight, training age | Assessment step 0 | `program_runs.payload` (raw JSON) | Anthropic (if `LLM_PROVIDER=claude`) |
| Goals, schedule, sport | Assessment steps 1–2 | `program_runs.payload` | Anthropic (Claude mode) |
| **Health/wellness state** (sleep, soreness, energy, stress, injuries) | Assessment step 3 | `program_runs.payload`, `program_runs.assessment` | Anthropic (Claude mode) — email is **excluded** from AI calls |
| Password | Signup / optional account | `users.hashed_password` (bcrypt) | — |
| Payment | Stripe-hosted checkout only | Stripe customer/subscription IDs only | Stripe |

Canonical input schema: `engine/input_contract.md` ↔
`apps/api/deus_api/models/input_contract.py`. Default provider is `mock`
(offline, no data leaves the server).

---

## 3. Findings

Severity reflects legal/privacy exposure. "Status" is as of this change set.

### F1 — Unauthenticated data export & erasure  ·  **Critical**  ·  ✅ Fixed
`GET /v1/data` and `DELETE /v1/data` accepted an email address alone, with no
authentication or ownership verification. Anyone who knew or guessed an email
could **export another person's health/assessment data** or **permanently
delete it**. This directly contradicted the Privacy Policy's promise that "we
will verify your identity before processing the request," creating both a
privacy violation (GDPR Art. 15/32, CCPA verified-request rules) and a
deceptive-practice exposure (FTC Act §5).

**Fix:** Both endpoints now require an authenticated account
(`get_current_user`) and operate strictly on the caller's own verified email,
taken from the session token — never from client input. The web funnel never
called these endpoints, so no user-facing behavior breaks. Anonymous
assessment users exercise their rights via the Correspondence/email channel,
where identity is verified manually. (`apps/api/deus_api/routes/assess.py`,
tests in `apps/api/tests/test_routes.py`.)

### F2 — Public program endpoint leaks email + full health payload  ·  **High**  ·  ⚠ Open
`GET /v1/programs/{run_id}` returns the associated **email address and the
complete raw health payload** to anyone possessing the (unguessable) UUID. It is
used by the public "share your program" link, so it is intentionally
unauthenticated. The health payload in a share link the user controls is
defensible; **returning the email address is not** — it is PII unnecessary to
render a program.
**Recommended:** drop `email` (and consider dropping `payload`) from this public
response, or gate it behind auth. Requires a coordinated web
(`apps/web/src/lib/api.ts`, `types.ts`, program page) + API change and was left
out of this pass to avoid breaking the share-link rendering.

### F3 — Orphaned health records from `POST /v1/generate`  ·  **Medium**  ·  ⚠ Open
`POST /v1/generate` persists a full health payload with **no linked email**, so
those records are unreachable by the email-keyed export/erasure endpoints — a
right-to-erasure gap.
**Recommended:** either don't persist direct-`generate` runs, associate them
with an identity, or add an administrative purge path.

### F4 — Documented data-rights channel was non-functional  ·  **High**  ·  ✅ Fixed
The Correspondence form (`CorrespondenceForm.tsx`) — named by both the Privacy
Policy and Terms as *the* channel for exercising data rights — only set local
state and **transmitted nothing**. A non-working rights mechanism is itself a
GDPR/CCPA deficiency.
**Fix:** the form now routes submissions via `mailto:` to
`privacy@deusperformance.com` (a monitored, published address), and the
confirmation state states the routing address explicitly so users have a real,
verifiable channel with no server-side collection of the message body.

### F5 — COPPA age floor enforced only client-side  ·  **Medium**  ·  ✅ Fixed
The 13+ minimum existed only in the React validator; the API accepted any age
`> 0`. A modified client could submit data for a child under 13.
**Fix:** `ClientProfile.age` now enforces `ge=13` in Pydantic
(`apps/api/deus_api/models/input_contract.py`), matching the policy and COPPA.

### F6 — Committed live-looking Notion secret  ·  **High (secrets hygiene)**  ·  ✅ Redacted / ⚠ must rotate
`apps/content_bot/.env.example` contained a real-looking Notion integration
token and database ID (every other `.env.example` used placeholders).
**Fix:** replaced with placeholders. **Action still required:** the original
value remains in git history and **must be rotated/revoked** in Notion
regardless of this change.

### F7 — Default JWT signing secret is a checked-in placeholder  ·  **Medium**  ·  ⚠ Deployment control
`config.py` defaults `auth_jwt_secret` to `dev-insecure-secret-change-me-...`.
If a deployment forgets to override it, all sessions are forgeable.
**Recommended:** fail startup in production if the secret is unset/default;
document in the deploy runbook.

### F8 — No encryption at rest for health data  ·  **Medium**  ·  ⚠ Open
`program_runs` and `athlete_states` store injury/wellness data as plain JSON
columns. The Privacy Policy promises "reasonable technical measures" (which TLS
+ access controls arguably satisfy), but sensitive-health data warrants more.
**Recommended:** application-layer or database-level encryption for the health
payload, or document the compensating controls relied upon.

### F9 — Erasure does not remove the account or cancel billing  ·  **Low/Medium**  ·  ⚠ Open (by design)
The erasure endpoint deletes leads/runs/feedback/state but not the `users` row
or the Stripe subscription. This is reasonable for billing integrity but leaves
`email` + `hashed_password` + Stripe IDs after a "delete my data" request.
**Recommended:** provide an explicit account-closure flow and document the legal
basis for retaining billing records.

### F10 — Legacy `frontend/*.html` prototypes  ·  **Low**  ·  ⚠ Open
The static mockups in `frontend/` contain dead "Terms/Privacy forthcoming"
links and collect a broader field set (height, free-text injury/notes) than the
live app. They are not routed by the Next.js app but sit in the repo.
**Recommended:** remove them, or clearly mark them non-production, so they can't
be mistaken for the live legal surface.

### F11 — `injuries` is free-text at the API layer  ·  **Low**  ·  ⚠ Open
The live UI restricts injuries to six chips, but the Pydantic contract accepts
any `list[str]`, so a direct API client could submit arbitrary free-text health
detail (more sensitive data than intended).
**Recommended:** enum-constrain or length/character-sanitize `injuries`.

---

## 4. Legal-document changes made in this review

Applied to `apps/web/src/app/terms/page.tsx` (Terms of Service):

- **New §4 — Assumption of Risk & Release of Liability.** A dedicated,
  conspicuous, capitalized clause enumerating the inherent risks of exercise and
  releasing the entity from injury claims arising from ordinary negligence, with
  the standard carve-outs (gross negligence, willful misconduct, non-waivable
  law). This is the most important protection for a training product and was
  previously only implied inside the disclaimer/limitation sections.
- **New §5 — Medical Clearance & Health Representations.** User represents good
  health or physician clearance, accurate disclosure, and responsibility for
  stopping when warning signs appear.
- **New §12 — Time Limit for Bringing Claims** (1-year contractual limitations
  period, subject to mandatory law).
- **New §16 — Severability** (including arbitration/class-waiver blow-up
  handling).
- **New §17 — Entire Agreement, Waiver, and Assignment.**
- Survival clause rewritten to reference sections by name (robust to
  renumbering); cross-references and the Health & Safety banner updated.

Applied to `apps/web/src/components/assess/AssessmentFunnel.tsx`: the consent
checkbox now conspicuously captures assumption of risk at the point of assent
("…and I acknowledge and voluntarily assume the inherent risks of exercise"),
strengthening enforceability of the release incorporated by reference.

The Privacy Policy was left substantively unchanged — it was already strong;
the code fixes (F1, F4, F5) bring the product's behavior into line with what it
already promises.

---

## 5. Recommended follow-up before launch

1. **Attorney review** of the Terms and Privacy Policy, confirming: Delaware
   governing-law choice vs. the LLC's actual formation state; enforceability of
   the release and liability cap in target states; and effective dates.
2. **Rotate the exposed Notion token** (F6) — redaction does not remove it from
   git history.
3. **Confirm `privacy@` and `legal@deusperformance.com` inboxes are monitored**
   — they are now the operative rights-request channel.
4. Address the open findings above (F2, F3, F7, F8, F9, F10, F11) on a risk-
   prioritized basis; F2 is the next most important.
5. Harden the deploy runbook so the JWT secret (F7) cannot ship as the default.

---

## 6. Verification

- API test suite: **491 passed** (`make test`), including the three
  new/updated tests covering authenticated export/erasure and the
  unauthenticated-access rejection.
- Web app: **`tsc --noEmit` clean** after the Terms rewrite and the
  Correspondence-form and consent-checkbox changes.
