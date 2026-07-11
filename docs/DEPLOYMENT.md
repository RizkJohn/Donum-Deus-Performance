# Deployment — Everything on One VPS

The whole product — Postgres, the engine API, the Next.js site, n8n, and an
auto-HTTPS reverse proxy — runs on a **single VPS** with one command via
`docker-compose.prod.yml`. This guide takes you from "no server" to "live at
your domain."

The Compose file, Caddy config, and the web build-arg wiring are **validated**
(compose config, Caddy config, and the browser bundle's API URL were all
checked against Docker Compose v5 / Caddy 2 / n8n 2.29.10).

---

## Which VPS

**Recommended: Hetzner Cloud CX22** — 2 vCPU, 4 GB RAM, 40 GB SSD, ~€4.5/mo.
Best price-to-performance in the market, and 4 GB comfortably runs the whole
stack (the Next.js build is the only memory-hungry step, and 4 GB clears it).

| Provider / plan | vCPU / RAM / disk | ~ Price | Notes |
|---|---|---|---|
| **Hetzner CX22** ✅ | 2 / 4 GB / 40 GB | **~€4.5/mo** | Best value. EU + US (Ashburn, Hillsboro) regions. Recommended. |
| DigitalOcean Basic | 2 / 4 GB / 80 GB | ~$24/mo | Friendliest UI, superb docs, 1-click Docker droplet. Pay ~5× for the polish. |
| Vultr / Linode | 2 / 4 GB / 80 GB | ~$24/mo | Comparable to DigitalOcean. |
| Hetzner CX11 / 2 GB | 1 / 2 GB / 20 GB | ~€3.3/mo | Works only if you build the web image with swap enabled (step 7). Tight. |
| Contabo | big specs, low price | ~$6/mo | Oversold and slower; avoid for production. |

Pick a region near your customers. If unsure: Hetzner **Ashburn, VA** (US-East)
or **Nuremberg** (EU). The rest of this guide is provider-agnostic once you
have an Ubuntu 24.04 server and its IP.

**Minimum:** 2 GB RAM works with a swap file (step 7). **Comfortable:** 4 GB.

---

## Before you start — gather these

- A **domain** (`donumdeiperformance.com`) with access to its DNS settings.
- **Anthropic API key** (`sk-ant-…`) — for real program generation + the
  Claude-drafting workflows.
- **Resend API key** (`re_…`) + your sending domain added in Resend.
- **Stripe** secret key + price IDs (only when you switch billing on — you can
  launch without).

---

## Step 1 — Create the server

On Hetzner Cloud (console.hetzner.cloud): **New Project → Add Server**:
- Image: **Ubuntu 24.04**
- Type: **CX22** (shared vCPU)
- Add your **SSH key** (paste your public key; on your laptop it's
  `~/.ssh/id_ed25519.pub`, or create one with `ssh-keygen -t ed25519`)
- Create, then copy the server's **public IPv4**.

## Step 2 — Point DNS at the server

At your domain registrar, create three **A records** → the server IP:

| Type | Name | Value |
|---|---|---|
| A | `@`   (apex → donumdeiperformance.com) | `SERVER_IP` |
| A | `api` | `SERVER_IP` |
| A | `n8n` | `SERVER_IP` |

DNS can take 5–60 minutes to propagate. Caddy will not get certificates until
these resolve, so do this now.

## Step 3 — First login and basic hardening

```bash
ssh root@SERVER_IP

# create a non-root user and give it sudo
adduser ddp && usermod -aG sudo ddp
rsync --archive --chown=ddp:ddp ~/.ssh /home/ddp   # copy your SSH key over

# firewall: allow SSH + web only
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

Log back in as the new user: `ssh ddp@SERVER_IP`.

## Step 4 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker   # run docker without sudo
docker --version && docker compose version        # confirm both
```

## Step 5 — Get the code

```bash
git clone https://github.com/<your-org>/donum-dei-performance.git
cd donum-dei-performance
```

## Step 6 — Configure the environment

```bash
cp .env.prod.example .env
# generate the three secrets and paste them in:
openssl rand -hex 32        # -> AUTH_JWT_SECRET
openssl rand -hex 32        # -> N8N_ENCRYPTION_KEY
openssl rand -base64 24     # -> POSTGRES_PASSWORD
nano .env
```

Fill in the domains, the three generated secrets, and your Anthropic + Resend
keys. Leave the Stripe block blank for now if you're launching before billing.
`.env` is gitignored — it never leaves the server.

## Step 7 — (2 GB servers only) add swap

Skip on 4 GB. On a 2 GB box, give the Next.js build headroom:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Step 8 — Launch the whole stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First run builds the API and web images and pulls postgres, n8n, and Caddy
(3–6 minutes). Caddy then fetches Let's Encrypt certificates for all three
domains automatically. Watch it happen:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

## Step 9 — Verify it's live

```bash
curl -I https://donumdeiperformance.com          # site      -> 200
curl -s https://api.donumdeiperformance.com/healthz   # engine -> {"status":"ok"} equivalent
curl -s https://n8n.donumdeiperformance.com/healthz   # n8n     -> {"status":"ok"}
```

Open `https://donumdeiperformance.com` in a browser — the site loads over
HTTPS and the assessment funnel talks to the API.

## Step 10 — Bring the automations online

```bash
./automation/import-workflows.sh n8n     # -> "Successfully imported 13 workflows."
```

Then open `https://n8n.donumdeiperformance.com`:
1. Create the **owner login** (first visit).
2. **Credentials → Add** — with these exact names: `Notion API`,
   `Anthropic (x-api-key)`, `Resend (Bearer)`, `Stripe API`
   (values + types in `automation/SETUP.md` step 7).
3. **Share the Notion HQ page** with your Notion integration so the workflows
   can read/write the databases.
4. Open each workflow → map its credential(s) → toggle **Active**.

## Step 11 — Wire the outside world

- **Website forms** → point the assessment funnel and correspondence form at
  the n8n webhook URLs (`https://n8n.donumdeiperformance.com/webhook/ddp-lead`,
  `…/ddp-generate`, `…/ddp-checkin`, `…/ddp-question`).
- **Resend** → confirm your sending domain is **Verified** in the Resend
  dashboard (DKIM/SPF records at your registrar), or delivery will be poor.
- **Stripe** (when going paid) → put the real keys/price IDs in `.env`, run
  `docker compose -f docker-compose.prod.yml up -d api` to reload, and confirm
  the Stripe Trigger in workflow 10 registered its webhook. The API's own
  `/v1/billing/webhook` at `https://api.donumdeiperformance.com/v1/billing/webhook`
  stays Stripe's source of truth — add it as a second Stripe webhook endpoint.

## Step 12 — Smoke test the loop

```bash
curl -X POST https://n8n.donumdeiperformance.com/webhook/ddp-lead \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","source":"Website Assessment"}'
```

→ a row appears in the Notion **Leads (CRM)** database, a welcome email sends,
and the **Automation Log** database gets a success row.

---

## Operating it

```bash
# update to the latest code
git pull
docker compose -f docker-compose.prod.yml up -d --build

# logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml ps

# restart one service
docker compose -f docker-compose.prod.yml restart n8n
```

**Backups (do this weekly / before updates):**

```bash
# postgres (accounts, programs, billing state)
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U donum_dei donum_dei | gzip > ddp-db-$(date +%F).sql.gz

# n8n volume (workflows, credentials, onboarding Wait-state) — copy it out
docker run --rm -v donum-dei-performance_n8n_data:/data -v $PWD:/backup alpine \
  tar czf /backup/n8n-data-$(date +%F).tar.gz -C /data .
```

Also keep a copy of `.env` somewhere safe — losing `N8N_ENCRYPTION_KEY` makes
saved n8n credentials undecryptable.

## Costs

| Item | Monthly |
|---|---|
| Hetzner CX22 VPS (runs everything) | ~€4.5 |
| Domain | ~$1 (amortised annual) |
| Resend | $0 free tier → $20 Pro when list > ~100 |
| Anthropic API | pay-per-use (cents per program/draft) |
| **Fixed baseline** | **~€5/mo** |

## Troubleshooting

- **Caddy cert errors / site not HTTPS** — DNS A records must resolve to the
  server *before* Caddy can issue certs. Check `dig donumdeiperformance.com`,
  then `docker compose -f docker-compose.prod.yml restart caddy`.
- **Frontend calls `localhost:8000`** — the web image was built with the wrong
  API URL. It's a build arg: rebuild with `docker compose -f
  docker-compose.prod.yml up -d --build web` after `API_DOMAIN` is correct in
  `.env`.
- **Web build killed / OOM on a 2 GB box** — add the swap file (step 7).
- **CORS errors in the browser** — `WEB_DOMAIN` in `.env` must match the domain
  you're visiting; the API sets `CORS_ORIGINS` from it. Rebuild `api` after
  changing.
- **n8n webhooks unreachable / Stripe can't reach it** — `N8N_DOMAIN` must
  resolve and Caddy must be up; n8n is behind one proxy hop (`N8N_PROXY_HOPS=1`
  is already set).

The n8n-specific runbook (credentials, workflow activation) is
`automation/SETUP.md`; the workflow reference and Notion IDs are
`automation/README.md`.
