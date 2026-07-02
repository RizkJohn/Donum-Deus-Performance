# Launch checklist — what's left for you to do

Everything code-side is done and pushed to `claude/pre-launch-checklist-dz68cb`.
What remains needs your identity, payment method, or a product call — things
no amount of code can do for you. This is the short version; each linked doc
has the full detail.

## 1. Security (do this first, costs nothing)
- [ ] Revoke/rotate the Notion integration token at
      [notion.so/my-integrations](https://www.notion.so/my-integrations) —
      the value that was briefly committed in `apps/content_bot/.env.example`
      should be treated as compromised regardless of whether it's still
      technically valid.
- [ ] Branches: intentionally left alone per your call, to keep documented
      snapshots until launch. When you're ready, delete these four from
      GitHub's UI (Branches tab → trash icon) — they're fully merged into
      `main`, zero risk of losing anything:
      `claude/price-model-messaging-revamp-jdny6y`,
      `claude/privacy-security-compliance-qbf0b0`,
      `claude/serene-brown-ajjw3e`, `claude/vercel-deployment-error-6ic72y`.

## 2. Create accounts (all free to start)
- [ ] [console.anthropic.com](https://console.anthropic.com) — API key
- [ ] [dashboard.stripe.com](https://dashboard.stripe.com) — test mode first
- [ ] [resend.com](https://resend.com) — verify `deusperformance.com` as a
      sending domain
- [ ] [railway.app](https://railway.app) — API + Postgres host
- [ ] [vercel.com](https://vercel.com) — web host
- [ ] Domain registrar (Cloudflare Registrar recommended, at-cost pricing)
- [ ] Optional, free: [sentry.io](https://sentry.io) (error monitoring — code
      is already wired, just needs a DSN), [uptimerobot.com](https://uptimerobot.com)
      (pings `/healthz`)

## 3. Get every real credential into the right place
Full walkthrough with exact dashboard clicks: **`docs/SECRETS_SETUP.md`**.
Short version: copy `apps/api/.env.example` → `.env`, fill in each value as
you get it, run `make check-env` to see what's still missing.

## 4. Deploy
Full runbook: **`docs/DEPLOYMENT.md`**. Order matters: API on Railway first
(get its URL) → web on Vercel (point `NEXT_PUBLIC_API_URL` at it) → domain →
go back and set `CORS_ORIGINS`/`WEB_URL` on Railway to the real domain →
update the Stripe webhook URL to the deployed API → run
`ENVIRONMENT=production python3 apps/api/scripts/check_launch_readiness.py`
before pointing real traffic at it.

## 5. One open product decision (not code — needs your call)
**Should a free/unpaid account be able to use the engine and download
programs?** Stripe billing is fully wired (checkout, portal, webhook,
`User.subscription_status`), but nothing currently checks that status before
serving a program or PDF — anyone with an account gets full access today.
That's fine for a small, hand-picked first cohort you're onboarding directly;
it becomes a real revenue leak the moment signups are open to the public.
Tell me when you want this gated and I'll wire it — it's a scoped change,
just one I didn't want to guess the UX for (hard paywall vs. a one-time free
program vs. something else).

## 6. Content/legal pass (not code)
- [ ] Read `/privacy` and `/terms` once more against what the assessment
      funnel actually collects (injuries, training history) — it's already
      written US-primary/international-universal, just worth a final human
      read before real users' health-adjacent data starts flowing through it.
- [ ] `CONTACT_EMAIL` in `.env` currently defaults to
      `hello@deusperformance.com` — make sure that inbox exists (or change
      the value) before `/correspondence` submissions start arriving there.

## What shipped since the last check-in (no action needed from you)
CNS engine fix (fatigue-adjusted 3/2/1 cap), password reset flow
(`/forgot-password`, `/reset-password`), a working contact form
(`/correspondence` now actually sends), Sentry + Vercel Analytics wired
dormant, `make check-env` launch-readiness gate, Railway/Vercel deployment
config. Full detail in the commit history on this branch.
