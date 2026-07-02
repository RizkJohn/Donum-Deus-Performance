# Secrets setup — going from mock/offline to a live launch

Every real credential the product needs lives in **environment variables**,
never in application code or a database the app manages itself. That's
deliberate: env vars are what every hosting platform (Vercel, Render, Fly.io,
Railway, etc.) gives you a dashboard for, they're never committed to git, and
they're the same mechanism `docker compose` and CI already use here. There is
no in-app "settings" screen for API keys — don't build one; it would mean
storing production secrets in the product's own database, which is a bigger
risk than the problem it solves for a single-operator business.

`apps/api/.env.example` is the authoritative list of every variable the
backend reads (`deus_api/config.py`). This doc is the walkthrough for
obtaining each real value and knowing where it goes.

## How to use this

1. Copy `apps/api/.env.example` to `apps/api/.env` for local dev — it already
   works with zero keys (mock LLM, mock email, sqlite, no Stripe).
2. As you obtain each real credential below, add it to `apps/api/.env`
   locally to test it, then set the same variable in your **hosting
   platform's** environment-variable settings once a host is chosen (see the
   stack proposal) — that's the production copy, not this repo.
3. Run `make check-env` any time to see what's still missing or still at an
   insecure default. It's informational in dev; set `ENVIRONMENT=production`
   (only in the real deployment's env vars, never locally) to make it a hard
   pass/fail gate you check before flipping the site live.
4. Never commit a real value into `.env.example` — that's exactly the mistake
   that leaked the Notion key. `.env` (the real file, not `.env.example`) is
   already gitignored.

## Per-service walkthrough

### 1. `AUTH_JWT_SECRET` — required, no external account needed
Any long random string, generated once and never shared. Locally:
```
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Put the output in `.env` locally and in your host's env vars for production —
**use a different value for each**, and never the shipped
`dev-insecure-secret-change-me-before-any-real-deploy` default.

### 2. `ANTHROPIC_API_KEY` — required to generate real programs
Console → [console.anthropic.com](https://console.anthropic.com) → API Keys →
Create Key. Set `LLM_PROVIDER=claude` alongside it. Until this is set the
product runs in `mock` mode: fully functional for testing, but every user
gets deterministic placeholder programs, not real ones.

### 3. `DATABASE_URL` — required
Format: `postgresql+asyncpg://user:password@host:5432/dbname`. Where this
points depends on the hosting decision (see the stack proposal below) — a
managed Postgres add-on gives you this connection string directly. Local dev
and `docker compose up` already work without touching this.

### 4. Stripe — required to take payments
1. [dashboard.stripe.com](https://dashboard.stripe.com) → start in **test
   mode** first.
2. Products → create three recurring products matching `apps/web/src/lib/pricing.ts`
   (Foundation $20/mo, Practice $120/mo, Stewardship $240/mo) → copy each
   price ID (`price_...`) into `STRIPE_PRICE_FOUNDATION` /
   `STRIPE_PRICE_PRACTICE` / `STRIPE_PRICE_STEWARDSHIP`.
3. Developers → API keys → copy the **secret key** into `STRIPE_SECRET_KEY`
   (test key first: `sk_test_...`).
4. Developers → Webhooks → Add endpoint → `https://<your-api-domain>/v1/billing/webhook`
   → subscribe to `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted` → copy
   the **signing secret** into `STRIPE_WEBHOOK_SECRET`.
5. Test an end-to-end checkout with a [Stripe test card](https://docs.stripe.com/testing)
   before switching any of the above to live-mode equivalents
   (`sk_live_...`, live price IDs, a live webhook endpoint).

### 5. Resend — required to actually send emails
[resend.com](https://resend.com) → API Keys → create one → `RESEND_API_KEY`.
Set `EMAIL_PROVIDER=resend`. You'll also need to verify the sending domain
(`deusperformance.com`) in Resend's dashboard (DNS TXT/DKIM records) before
`EMAIL_FROM=Deus Performance <programs@deusperformance.com>` will deliver —
until then, leave `EMAIL_PROVIDER=mock` (emails are logged, not sent, and
nothing crashes).

### 6. `CORS_ORIGINS` / `WEB_URL` / `NEXT_PUBLIC_API_URL`
Once both services are deployed: `CORS_ORIGINS` and `WEB_URL` (API's env) =
your web app's real URL; `NEXT_PUBLIC_API_URL` (web's env) = your API's real
URL. Both are plain URLs, not secrets, but wrong values will break
sign-in/checkout redirects silently, so `make check-env` flags leftover
`localhost` values.

## Not yet needed
`apps/content_bot` (the Notion social-post generator) has its own
`ANTHROPIC_API_KEY` and `NOTION_API_KEY` — it's a side tool for content
scheduling, not part of the product's request path, so it's not gated by
`make check-env` and isn't required for launch.
