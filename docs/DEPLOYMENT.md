# Deployment — Netlify Website + One Cheap VPS Backend

> **Interim status (2026-07-25):** Part 2 below (Netlify) is paused by
> deliberate decision, not merely pending this branch's merge — **Vercel**
> is the production host until an explicit revisit, or until superseded
> outright by a planned Cloudflare Workers migration. (At the time of this
> note, `main` also lacked `netlify.toml`, so Netlify's production build
> 404'd for that additional reason too; that specific cause resolves on
> merge, but the Vercel decision doesn't — don't treat a merge as a signal
> to cut back over.) Vercel is already connected via native Git integration,
> Next.js auto-detected, builds green. Flag: Vercel's Hobby (free) tier
> prohibits commercial use — confirm the team is on a paid plan before
> relying on it past short-term testing. Part 1 (the VPS backend) is
> unaffected and unchanged.

The cost-optimal, low-ops production setup for a pre-revenue brand:

```
                    donumdeiperformance.com
                             │
         ┌───────────────────┴───────────────────┐
         │                                        │
   ┌─────▼──────┐                      ┌──────────▼───────────┐
   │  NETLIFY   │  apex + www          │   VPS (Hetzner CX22)  │
   │  (free)    │                      │   ~€4.50/mo           │
   │  Next.js   │  browser calls ───▶  │   api.<domain>  → API │
   │  website   │  api.<domain>        │   n8n.<domain>  → n8n │
   └────────────┘                      │   + Postgres + Caddy  │
                                       └───────────┬───────────┘
   Managed free tiers:                             │
   Notion (ops hub) · Resend (email) ◀── n8n ──────┘
   Anthropic (generation, usage-based)
```

- **Website** → Netlify's free tier (commercial use allowed, unlike Vercel's
  Hobby plan). Zero ops, global CDN, auto-HTTPS, deploy on `git push`.
- **Backend** (engine API + Postgres + the 13 n8n automations) → one small
  VPS, because n8n must be always-on. Caddy gives it automatic HTTPS.
- **Everything else** → free managed tiers (Notion, Resend) or usage-based
  (Anthropic, Stripe).

All config here is **validated** (backend compose config, Caddy config, and
`netlify.toml` were checked against Docker Compose v5 / Caddy 2 / n8n 2.29.10).
First-year cost breakdown: `docs/BUDGET.md`.

---

## Before you start

- A **domain** (`donumdeiperformance.com`) with DNS access.
- **Anthropic** API key (`sk-ant-…`), **Resend** API key (`re_…`) + verified
  sending domain. **Stripe** keys only when you switch billing on.
- A **GitHub** repo for this code (Netlify deploys from it).

---

# Part 1 — The VPS backend (API + Postgres + n8n)

## 1.1 Create the server

Recommended: **Hetzner Cloud CX22** (2 vCPU / 4 GB / 40 GB, ~€4.50/mo). At
console.hetzner.cloud → **Add Server**: Ubuntu 24.04, type CX22, add your SSH
key, create, and copy the public IPv4.

*(Cheaper: Oracle Always-Free ARM = $0 but less reliable; see BUDGET.md.)*

## 1.2 DNS — two records to the VPS

At your registrar, point the two **backend** subdomains at the server IP:

| Type | Name | Value |
|---|---|---|
| A | `api` | `SERVER_IP` |
| A | `n8n` | `SERVER_IP` |

(The apex `donumdeiperformance.com` is pointed at Netlify in Part 2 — leave it
for now.)

## 1.3 Harden and install Docker

```bash
ssh root@SERVER_IP
adduser ddp && usermod -aG sudo ddp
rsync --archive --chown=ddp:ddp ~/.ssh /home/ddp
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
# log back in as ddp, then:
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
```

## 1.4 Clone and configure

```bash
git clone https://github.com/<your-org>/donum-dei-performance.git
cd donum-dei-performance
cp .env.prod.example .env
openssl rand -hex 32     # -> AUTH_JWT_SECRET
openssl rand -hex 32     # -> N8N_ENCRYPTION_KEY
openssl rand -base64 24  # -> POSTGRES_PASSWORD
nano .env                # domains, the 3 secrets, Anthropic + Resend keys
```

## 1.5 Launch the backend

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Builds the API image, pulls postgres + n8n + Caddy, and Caddy auto-issues
certificates for `api.<domain>` and `n8n.<domain>`. Verify:

```bash
curl -s https://api.donumdeiperformance.com/healthz     # engine up
curl -s https://n8n.donumdeiperformance.com/healthz      # -> {"status":"ok"}
```

## 1.6 Import the automations

```bash
./automation/import-workflows.sh n8n     # -> "Successfully imported 13 workflows."
```

Then open `https://n8n.donumdeiperformance.com`, create the owner login, add
the four credentials (`Notion API`, `Anthropic (x-api-key)`, `Resend (Bearer)`,
`Stripe API`), share the Notion HQ page with your integration, and toggle each
workflow **Active**. Details: `automation/SETUP.md`.

---

# Part 2 — The website on Netlify

No code changes needed — `netlify.toml` (already in the repo) points Netlify at
`apps/web` and pins the Next.js runtime.

## 2.1 Connect the repo

netlify.com → **Add new site → Import an existing project** → pick your GitHub
repo. Netlify reads `netlify.toml` and pre-fills the build settings
(base `apps/web`, `npm run build`, Next.js runtime).

## 2.2 Set the API URL

In **Site settings → Environment variables**, confirm/set:

```
NEXT_PUBLIC_API_URL = https://api.donumdeiperformance.com
```

(It's also in `netlify.toml`; the UI value wins if you ever need to change it
without a commit.) This is baked into the browser bundle at build time, so it
must be your live API domain. Trigger a deploy.

## 2.3 Point the domain at Netlify

**Site settings → Domain management → Add custom domain** →
`donumdeiperformance.com`. Follow Netlify's instructions to either use Netlify
DNS or add their `A`/`CNAME` records at your registrar for the apex + `www`.
Netlify provisions HTTPS automatically.

## 2.4 Verify end to end

Open `https://donumdeiperformance.com` — the site loads over HTTPS, and the
assessment funnel (which calls `https://api.donumdeiperformance.com`) returns a
program. If the browser console shows CORS or `localhost:8000` calls, see
Troubleshooting.

---

# Part 3 — Wire the outside world

- **Website forms → n8n webhooks**: point the funnel and correspondence form at
  `https://n8n.donumdeiperformance.com/webhook/ddp-lead`, `…/ddp-generate`,
  `…/ddp-checkin`, `…/ddp-question`.
- **Resend**: verify your sending domain (DKIM/SPF at your registrar) or
  deliverability suffers.
- **Stripe** (when going paid): put real keys/price IDs in `.env`,
  `docker compose -f docker-compose.prod.yml up -d api` to reload, confirm the
  Stripe Trigger in workflow 10 registered, and add the API's own
  `https://api.donumdeiperformance.com/v1/billing/webhook` as a second Stripe
  webhook endpoint (it's Stripe's source of truth for Postgres).

## Smoke test

```bash
curl -X POST https://n8n.donumdeiperformance.com/webhook/ddp-lead \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","source":"Website Assessment"}'
```

→ a row in Notion **Leads (CRM)**, a welcome email, and a success row in the
**Automation Log**.

---

## Operating it

```bash
# backend updates (on the VPS)
git pull && docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f api
# website updates: just `git push` — Netlify rebuilds automatically.
```

**Backups (weekly / before updates):**

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U donum_dei donum_dei | gzip > ddp-db-$(date +%F).sql.gz
docker run --rm -v donum-dei-performance_n8n_data:/data -v $PWD:/backup alpine \
  tar czf /backup/n8n-data-$(date +%F).tar.gz -C /data .
```

Keep `.env` safe — losing `N8N_ENCRYPTION_KEY` makes saved n8n credentials
undecryptable.

## Troubleshooting

- **Frontend calls `localhost:8000`** — Netlify built with the wrong API URL.
  Fix `NEXT_PUBLIC_API_URL` in Netlify env and redeploy (it's a build-time
  value).
- **CORS errors** — `WEB_DOMAIN` in the VPS `.env` must equal the domain you
  visit; the API sets `CORS_ORIGINS` from it. `docker compose -f
  docker-compose.prod.yml up -d api` after changing.
- **Caddy cert errors** — `api`/`n8n` A records must resolve to the VPS before
  Caddy can issue certs; `docker compose -f docker-compose.prod.yml restart caddy`.
- **n8n webhooks unreachable** — `N8N_DOMAIN` must resolve and Caddy be up;
  n8n already runs behind one proxy hop (`N8N_PROXY_HOPS=1`).

Want the whole backend on one box *including* the site instead (no Netlify)?
The base `docker-compose.yml` has a `web` service and the `automation` profile
for exactly that — but Netlify keeps the site up independently of the VPS and
costs nothing, which is why it's the default here.

Cost breakdown: `docs/BUDGET.md`. Workflow reference + Notion IDs:
`automation/README.md`. n8n credential setup: `automation/SETUP.md`.
