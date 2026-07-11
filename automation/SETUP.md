# Self-Hosting the Donum Dei Performance Automation — Runbook

A start-to-finish guide to running the 13-workflow suite on your own server.
Everything in the repo (Compose service, env template, import script) is
**tested working against n8n 2.29.10** — the import of all 13 workflows, the
Compose config, and container boot were all verified end-to-end.

Budget: ~30–45 minutes. Recurring cost: **$0** (n8n is free; a small VPS is
~$5/mo, or $0 if you run it on the same box as the API).

---

## What you provide (I can't do these for you)

| # | Thing | Where to get it |
|---|-------|-----------------|
| 1 | A small Linux server with a public IP | Hetzner (~$5/mo), DigitalOcean, Fly.io, Railway, or the box already running the API |
| 2 | A domain/subdomain for n8n | e.g. `n8n.donumdeiperformance.com` → an A record to the server IP |
| 3 | Notion integration secret | notion.so/my-integrations → New integration → copy secret |
| 4 | Anthropic API key | console.anthropic.com → API keys (`sk-ant-…`) |
| 5 | Resend API key + verified domain | resend.com → API keys (`re_…`) and verify your sending domain |
| 6 | Stripe secret key | dashboard.stripe.com → Developers → API keys (`sk_live_…`) |

Keys 3–6 are entered **once inside the n8n UI** (step 7), never committed to
the repo. n8n stores them encrypted.

---

## Step 1 — Install Docker on the server

```bash
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version   # confirm both work
```

## Step 2 — Get the code

```bash
git clone https://github.com/<your-org>/donum-dei-performance.git
cd donum-dei-performance
```

## Step 3 — Configure the environment

```bash
cp automation/.env.example .env
# generate the encryption key and paste it into .env as N8N_ENCRYPTION_KEY:
openssl rand -hex 32
nano .env
```

Set at minimum in `.env`:

```
N8N_ENCRYPTION_KEY=<the openssl output>       # REQUIRED, never change later
N8N_HOST=n8n.donumdeiperformance.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.donumdeiperformance.com/
N8N_WEBHOOK_BASE=https://n8n.donumdeiperformance.com
N8N_SECURE_COOKIE=true
DDP_EMAIL_FROM=Donum Dei Performance <programs@donumdeiperformance.com>
DDP_OWNER_EMAIL=you@yourdomain.com
```

`.env` is gitignored — it never gets committed.

## Step 4 — Start the stack

```bash
docker compose --profile automation up -d
```

That launches postgres + api + web + n8n on one box. To run **only** n8n
(API lives elsewhere), set `DONUM_DEI_API_URL` to the API's public URL in
`.env` and start just the service: `docker compose --profile automation up -d n8n`.

Confirm n8n is healthy:

```bash
curl -s localhost:5678/healthz     # -> {"status":"ok"}
```

## Step 5 — Put HTTPS in front of n8n

Webhooks and the Stripe Trigger need a public HTTPS URL. Easiest is Caddy,
which gets you an automatic certificate. Create `Caddyfile`:

```
n8n.donumdeiperformance.com {
    reverse_proxy localhost:5678
}
```

```bash
docker run -d --name caddy --network host \
  -v $PWD/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data caddy:latest
```

Now `https://n8n.donumdeiperformance.com` reaches your n8n. (Any reverse
proxy works — nginx, Traefik, a cloud load balancer. The only requirement is
HTTPS terminating in front of port 5678.)

## Step 6 — Create your n8n owner account

Open `https://n8n.donumdeiperformance.com` and set the owner email +
password when prompted. This is n8n's built-in login — there is no separate
admin to configure.

## Step 7 — Add the four credentials

In n8n: **Credentials → Add credential**. Create these with the **exact
names** the workflows expect:

| Credential | Type | Value |
|---|---|---|
| `Notion API` | Notion API | your integration secret |
| `Anthropic (x-api-key)` | Header Auth | header `x-api-key` = `sk-ant-…` |
| `Resend (Bearer)` | Header Auth | header `Authorization` = `Bearer re_…` |
| `Stripe API` | Stripe API | your `sk_live_…` (or `sk_test_…`) |

Then **share the Notion HQ page with your integration** (open the HQ page in
Notion → ••• → Connections → add your integration), so the workflows can
read and write the databases.

## Step 8 — Import the 13 workflows

```bash
./automation/import-workflows.sh
```

Verified output: `Successfully imported 13 workflows.` followed by the list.
They all arrive **inactive**.

## Step 9 — Map credentials and activate

For each workflow (they open with credential fields flagged):

1. Open it, click any node showing "credential not set", pick the matching
   credential from step 7.
2. Toggle **Active** (top-right).

Tip: select all 13 in the workflow list and add a shared tag ("donum-dei")
to group them — tags were intentionally left empty in the files because
n8n's importer rejects bare-string tags.

## Step 10 — Wire the outside world in

- **Website forms** → point them at the webhook URLs n8n shows on each active
  webhook workflow:
  - `…/webhook/ddp-lead` (assessment funnel + correspondence form)
  - `…/webhook/ddp-generate` (program generation)
  - `…/webhook/ddp-checkin` (weekly check-in)
  - `…/webhook/ddp-question` (Q&A)
- **Stripe** → in workflow 10, open the Stripe Trigger node and copy its
  webhook URL, or let it auto-register. Confirm in Stripe → Developers →
  Webhooks that events `checkout.session.completed`, `invoice.payment_failed`,
  and `customer.subscription.deleted` are being sent. (This is the *ops-side*
  mirror; your API's own `/v1/billing/webhook` stays Stripe's source of truth
  — keep both.)

## Step 11 — Smoke-test

- POST a test lead:
  ```bash
  curl -X POST https://n8n.donumdeiperformance.com/webhook/ddp-lead \
    -H 'Content-Type: application/json' \
    -d '{"name":"Test","email":"test@example.com","source":"Website Assessment"}'
  ```
  → a row appears in the Notion **Leads (CRM)** database and a welcome email
  is sent.
- Watch the **Automation Log** database — every workflow writes a
  success/error row there.

---

## Keeping it running

```bash
docker compose --profile automation pull   # update images
docker compose --profile automation up -d   # apply
docker compose logs -f n8n                   # tail logs
```

Back up the `n8n_data` Docker volume (it holds workflows, credentials, and
the Wait-node state for the onboarding drip) and your `.env` (the encryption
key). Lose the key and saved credentials can't be decrypted.

## Troubleshooting (issues seen and pre-solved)

- **n8n container restart-loops with "address ':: ' is not available"** — the
  Compose already sets `N8N_LISTEN_ADDRESS=0.0.0.0` to force IPv4. If you
  removed it, put it back.
- **Import fails with `workflows_tags.tagId` NOT NULL** — a workflow JSON has
  a bare-string tag. All shipped files use `"tags": []`; keep it that way.
- **Webhooks don't fire / Stripe can't reach n8n** — `WEBHOOK_URL` and
  `N8N_HOST` must match your real HTTPS domain, and the reverse proxy must be
  terminating TLS in front of port 5678.
- **Notion 404 on a database ID** — retry with the data-source ID (both are
  listed in `automation/README.md`).

The workflow-by-workflow reference, all database IDs, and the cost analysis
live in `automation/README.md`.
