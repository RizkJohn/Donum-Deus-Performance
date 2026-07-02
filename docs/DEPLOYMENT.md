# Deployment — Railway (API + Postgres) + Vercel (web)

Two separately-deployed services, matching local dev (`docker compose up`):
FastAPI + Postgres on Railway, Next.js on Vercel. Both platforms deploy
straight from GitHub — no custom CI/CD workflow needed; their native GitHub
integration handles build + deploy on every push to `main`.

See `docs/SECRETS_SETUP.md` for where each credential below comes from.

## 1. API + Postgres on Railway

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
   → select this repo.
2. **Leave the service's root directory as the repo root** (not `apps/api`).
   `railway.json` at the repo root already points the build at
   `apps/api/Dockerfile`, and that Dockerfile's `COPY` paths (`apps/api/...`,
   `engine`) are relative to the repo root — the same reason
   `docker-compose.yml` builds it with `context: .`. Setting a custom root
   directory here would break the build.
3. New → Database → PostgreSQL, in the same project. Railway auto-populates
   a `DATABASE_URL`-shaped reference; wire it to the API service as
   `DATABASE_URL` (Railway's variable reference syntax, e.g.
   `${{Postgres.DATABASE_URL}}`) but note the app expects the `asyncpg`
   driver — set it explicitly to
   `postgresql+asyncpg://<user>:<password>@<host>:<port>/<db>` using the
   Postgres service's individual connection fields rather than Railway's
   default `postgresql://` string.
4. Set the API service's environment variables (Settings → Variables) per
   `apps/api/.env.example` / `docs/SECRETS_SETUP.md`: `ENVIRONMENT=production`,
   `AUTH_JWT_SECRET`, `LLM_PROVIDER=claude` + `ANTHROPIC_API_KEY`, the five
   `STRIPE_*` vars, `EMAIL_PROVIDER=resend` + `RESEND_API_KEY`,
   `CORS_ORIGINS` and `WEB_URL` (set both once you have the Vercel URL from
   step 2 below — a placeholder is fine for the first deploy).
5. Railway assigns a public URL (or attach your own domain, e.g.
   `api.deusperformance.com`, under Settings → Networking). This is the value
   for `NEXT_PUBLIC_API_URL` in Vercel and for the Stripe webhook endpoint.
6. Health check: Railway pings `/healthz` per `railway.json`; the deploy is
   marked unhealthy (and rolled back) if it doesn't respond.

## 2. Web on Vercel

1. [vercel.com](https://vercel.com) → New Project → import this repo.
2. Framework preset: Next.js (auto-detected). **Root Directory: `apps/web`**
   — Vercel builds directly from the Next.js source here; it does not use
   `apps/web/Dockerfile` (that file is only for `docker compose`/self-hosting).
3. Environment variable: `NEXT_PUBLIC_API_URL` = the Railway API URL from
   step 1.5 above.
4. Deploy. Vercel gives you a `*.vercel.app` URL immediately; attach the real
   domain under Project → Settings → Domains once purchased (step 3).
5. Go back to Railway and set `CORS_ORIGINS` and `WEB_URL` to this real
   domain (not the Vercel preview URL) — auth cookies and CORS both depend on
   this matching exactly.

## 3. Domain

Register `deusperformance.com` (Cloudflare Registrar is at-cost, no markup).
Point it at Vercel per Vercel's domain instructions (usually a couple of DNS
records); if you want `api.deusperformance.com` for the backend too, add that
as a custom domain on the Railway service and point its DNS record at
Railway's target per their instructions.

## 4. After both are live

- Update the Stripe webhook endpoint (dashboard.stripe.com → Developers →
  Webhooks) to `https://api.deusperformance.com/v1/billing/webhook` (or
  whatever the Railway URL/custom domain is) — the test-mode endpoint from
  local development won't receive production events.
- Verify the sending domain in Resend for `EMAIL_FROM` to deliver.
- From a machine with the same env vars set (or via Railway's shell), run
  `ENVIRONMENT=production python3 apps/api/scripts/check_launch_readiness.py`
  to confirm nothing required is missing before pointing real traffic at it.

## Optional, free-tier, recommended before taking real traffic

- **Sentry** (error monitoring) — already wired (`deus_api/main.py`): set
  `SENTRY_DSN` in Railway's env vars and it activates automatically, no code
  changes needed. Leave it unset and it's a complete no-op — catches
  production auth/billing/LLM failures you'd otherwise only find by a user
  reporting them.
- **Vercel Analytics** — already wired (`app/layout.tsx`, `@vercel/analytics`).
  Activates automatically once deployed on Vercel; nothing to configure.
- **UptimeRobot** — not wired (nothing to wire — it's an external pinger).
  Point it at `https://<your-api-domain>/healthz`; alerts you if the API goes
  down.
- **PostHog** (free tier) — not wired yet. Funnel/drop-off visibility beyond
  what Vercel Analytics' page views give you; add if/when you want it.
