# Donum Dei Performance — Automation Suite

Thirteen importable [n8n](https://n8n.io) workflows covering the full
operating loop of the practice: lead capture and nurture, billing and
onboarding, program generation and delivery, check-ins and progression,
content, newsletters, Q&A, monitoring, and an owner business digest.

The design contract: **Postgres (behind the API) is the transactional system
of record; Notion is the human-facing operations hub; n8n is the courier
between them.** Claude drafts, a human approves, Resend delivers. Nothing
client-facing is sent by a machine without either a hard QC gate (programs)
or an explicit human approval status (Q&A, newsletter, content).

## The workflows

| File | Trigger | What it does |
|------|---------|--------------|
| `01-lead-intake-crm.json` | `POST /webhook/ddp-lead` | Assessment funnel / correspondence form → Notion **Leads (CRM)** → welcome email → log |
| `02-program-generation-delivery.json` | `POST /webhook/ddp-generate` | Client payload → engine `/v1/generate` → mirror to Notion **Programs** → program-ready email → `UNSATISFIABLE_CONSTRAINTS` escalates to a human |
| `03-weekly-checkin-reminders.json` | Sundays 17:00 | Emails every Active client a check-in reminder, advances **Next Check-in** date |
| `04-checkin-ingest-progression.json` | `POST /webhook/ddp-checkin` | Check-in → engine `/v1/feedback` → Notion **Check-ins** → updates client **Fatigue Flag** → flags coach on pain / high fatigue / low adherence |
| `05-content-blog-pipeline.json` | Mondays 08:00 | Drafts the next queued Blog idea in the **Content Calendar** (or generates 3 new ideas if the queue is empty); human reviews before anything publishes |
| `06-newsletter-dispatch.json` | Daily 09:00 | Drafts **Planned** issues due within 7 days → `Review`; sends **Scheduled** issues whose date arrived → `Sent`. Never sends from `Review`. |
| `07-qa-autoresponder.json` | `POST /webhook/ddp-question` + every 15 min | Claude drafts a reply into the **Q&A Inbox** (`Drafted` / `Needs Human`); dispatcher sends only rows a human flipped to `Approved` |
| `08-ops-monitor.json` | Every 15 min | `GET /healthz`; on failure emails the owner and writes an `error` row to the **Automation Log** |
| `09-social-repurpose.json` | Wednesdays 10:00 | Latest Published blog post → platform-native Instagram / TikTok / Threads drafts in the **Content Calendar** |
| `10-stripe-billing-lifecycle.json` | Stripe Trigger | `checkout.session.completed` → upsert **Clients** (Active + tier + Stripe customer id) → kick onboarding; `invoice.payment_failed` → dunning email; `customer.subscription.deleted` → mark Churned + win-back email |
| `11-client-onboarding-sequence.json` | `POST /webhook/ddp-onboard` | Day 0 / Day 3 / Day 7 welcome drip (Wait nodes) — called by workflow 10 on conversion |
| `12-lead-nurture.json` | Daily 11:00 | Leads **Assessed** but not converted for 3+ days → one conversion nudge → mark **Contacted** |
| `13-owner-weekly-digest.json` | Mondays 07:00 | Emails you a one-screen operating report: new leads, active clients, estimated MRR, check-in rate, avg adherence, flagged check-ins, open Q&A |

Workflow 10 uses n8n's **native Stripe Trigger**, which registers its own
endpoint and verifies event signatures for you — point a Stripe webhook at
n8n via the credential, no signing-secret handling in the workflow. This is
the *ops-side* mirror; the API's own `/v1/billing/webhook` remains Stripe's
source of truth for subscription state in Postgres. Run both — they do
different jobs (Postgres truth vs. Notion hub + client comms).

The legacy `apps/content_bot/` container still works and writes to the same
Content Calendar; run either it **or** workflow 05/09 for social generation,
not both, or you will get duplicate drafts.

## Costs & vendor choice

**You can launch this entire suite for $0/month.** The stack was chosen so
the free tier is genuinely production-viable and the paid path is a no-op
upgrade — no re-platforming, no rebuilding workflows.

| Layer | Launch choice | Cost at launch | When to upgrade | Upgrade cost |
|---|---|---|---|---|
| **Email** | Resend | Free — 3,000/mo, 100/day, 1 domain | List > ~100 or nearing 3k/mo | **Resend Pro $20/mo** (50k emails) — same API, zero workflow changes |
| **Automation** | n8n **self-hosted** (Community Edition) | Free — unlimited executions; ~$5/mo VPS, or $0 co-located with the API | Never for cost; only if you want managed hosting | n8n Cloud ~€20/mo (optional convenience) |
| **LLM drafting** | Anthropic API (Claude) | Pay-per-use, cents per draft | — | scales linearly, no tier cliff |

**Why not the alternatives:**

- **Zapier / Make** meter every step (task- and operation-based). These
  workflows are 5–18 nodes each, which burns their quotas fast and pushes
  you to $20–50+/mo quickly. Self-hosted n8n has **no execution ceiling and
  no per-task fee**, so it gets *cheaper* relative to them as you scale.
- **Amazon SES** is cheaper per-email ($0.10/1k) but you would build
  templates, dashboards, and bounce/unsubscribe handling yourself. Not worth
  it for a solo operator until email is a major cost centre.
- **Dedicated newsletter platforms** (Kit — free to 10k subscribers;
  Beehiiv — free to 2.5k) beat Resend *only for the marketing newsletter* at
  scale. They are not built in here because splitting transactional from
  newsletter fragments the hub. If newsletter growth ever becomes a primary
  channel, move **only** workflow 06 to Kit/Beehiiv and keep Resend for
  everything transactional — the other twelve workflows are untouched.

**Free-tier watch-out:** Resend's 100 emails/day cap means a single
newsletter blast to more than ~100 recipients exceeds the free daily limit.
Workflow 06 already paces sends, but the hard cap is the trigger to move to
Resend Pro. Verify current pricing at signup — these numbers move.

## One-time setup

### 1. Credentials (n8n → Credentials → New)

| Credential name (must match) | Type | Value |
|---|---|---|
| `Notion API` | Notion API | Internal integration secret from notion.so/my-integrations. Share the **Donum Dei Performance — HQ** page (and the Content Calendar) with the integration. |
| `Anthropic (x-api-key)` | Header Auth | Header name `x-api-key`, value your `sk-ant-...` key |
| `Resend (Bearer)` | Header Auth | Header name `Authorization`, value `Bearer re_...` |
| `Stripe API` | Stripe API | Your Stripe secret key (`sk_live_...` / `sk_test_...`). Used only by workflow 10's Stripe Trigger; it registers and verifies its own webhook. |

Workflows reference credentials by these exact names; on import n8n asks you
to map them once.

### 2. Environment variables (n8n instance)

```
DONUM_DEI_API_URL=https://api.donumdeiperformance.com   # or http://api:8000 in compose
DDP_WEB_URL=https://donumdeiperformance.com
DDP_EMAIL_FROM=Donum Dei Performance <programs@donumdeiperformance.com>
DDP_OWNER_EMAIL=johnrizkalla2300@gmail.com
DDP_CLAUDE_MODEL=claude-sonnet-5                        # optional override
N8N_WEBHOOK_BASE=https://n8n.donumdeiperformance.com    # how workflow 10 reaches workflow 11's webhook
```

Every workflow falls back to a sane default if a variable is unset.
`N8N_WEBHOOK_BASE` should be your n8n instance's public URL (defaults to
`http://localhost:5678`, correct for a single self-hosted instance).

### 3. Import

One command imports all 13 (the Compose file mounts `automation/n8n` into the
container):

```bash
./automation/import-workflows.sh        # -> "Successfully imported 13 workflows."
```

Or manually: n8n → Workflows → Import from File → each JSON in
`automation/n8n/`. Either way they import **inactive**; activate after mapping
credentials. Point the website funnel at the webhook URLs n8n shows on
activation (`/webhook/ddp-lead`, `/webhook/ddp-generate`,
`/webhook/ddp-checkin`, `/webhook/ddp-question`).

**Full server runbook — host, HTTPS, credentials, going live: see
[`automation/SETUP.md`](./SETUP.md).** The Compose service, env template, and
import script are tested working against **n8n 2.29.10**.

### 4. Notion database IDs (already wired in)

Created under [Donum Dei Performance — HQ](https://app.notion.com/p/39a21819e2ce8154acc9e34adc4ac721):

| Database | Database ID | Data source ID |
|---|---|---|
| Leads (CRM) | `64097635-af29-43a7-bc79-654d3f6e2bca` | `4c026373-e0d1-42f9-8174-6cfde6116f48` |
| Clients | `8880de55-6bcb-4b72-a9a1-3932a1f774f8` | `0b5ed3f9-5dbf-4b05-b1dc-4a87c4673558` |
| Programs | `c535740b-0d1c-4985-9c9c-15b8ed7218a3` | `baeb0fdf-4462-4317-a81a-5480a9c31f4a` |
| Check-ins | `878cac7c-3a3b-4379-b7fe-e79a12ca9431` | `aed9563a-6138-4033-9e56-e50c1ce5358b` |
| Q&A Inbox | `8646ee02-f6f2-439d-95f7-5d59fd297d2f` | `68709828-2d57-4184-9722-c8f371cd4a51` |
| Newsletter Issues | `9ea17487-0cd3-4864-9726-73f10c978eaf` | `819cc680-e9d6-401c-afde-9a71b23fcb43` |
| Automation Log | `82f1b617-35af-423c-9780-65166c39adc4` | `ec0b7d7e-4dab-4ce7-b42d-fb14115e3fea` |
| Content Calendar (existing) | `a8e02b86-8818-4243-93cb-3eac8f9cf978` | `88bf899d-a0aa-4c8a-9d24-c243a87008f3` |

If a Notion request 404s on a database ID, retry with the data source ID —
which of the two the REST API accepts depends on the database's API
generation.

## The status-field contract

Statuses are the interface between humans and machines. n8n only ever acts
on these transitions:

- **Content Calendar**: `Idea` → (bot drafts) → `Drafted` → *you* → `Scheduled`/`Published`
- **Newsletter Issues**: `Planned` → (bot drafts) → `Review` → *you* → `Scheduled` → (bot sends) → `Sent`
- **Q&A Inbox**: `New`/`Drafted`/`Needs Human` → *you* → `Approved` → (bot sends) → `Sent`

Renaming a status option in Notion without updating the matching workflow
breaks that workflow silently. Change them together.

## Where n8n runs

**Recommended: self-host (free, unlimited executions).** The n8n service is
already wired into the repo's root `docker-compose.yml` under the
`automation` profile — one command brings up the whole stack:

```bash
docker compose --profile automation up -d
```

It runs on the same Docker network as the API (reachable at `http://api:8000`),
persists to the `n8n_data` volume (which holds workflows, credentials, and the
Wait-node state for the onboarding drip, so day-3/day-7 emails survive
restarts), and binds IPv4 explicitly to avoid the IPv6 crash-loop in n8n 2.x.
n8n Cloud (~€20/mo) is an optional managed alternative; you do not need it to
launch.

**The step-by-step server runbook is [`automation/SETUP.md`](./SETUP.md)** —
host, HTTPS reverse proxy, credentials, wiring the website and Stripe, and a
smoke test. See `docs/DATA_PLATFORM.md` for why Notion is the ops hub and what
the evaluated alternatives were.
