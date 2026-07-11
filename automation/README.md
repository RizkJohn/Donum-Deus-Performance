# Donum Dei Performance — Automation Suite

Nine importable [n8n](https://n8n.io) workflows covering the full operating
loop of the practice: lead capture, program generation and delivery,
check-ins and progression, content, newsletters, Q&A, and monitoring.

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

The legacy `apps/content_bot/` container still works and writes to the same
Content Calendar; run either it **or** workflow 05/09 for social generation,
not both, or you will get duplicate drafts.

## One-time setup

### 1. Credentials (n8n → Credentials → New)

| Credential name (must match) | Type | Value |
|---|---|---|
| `Notion API` | Notion API | Internal integration secret from notion.so/my-integrations. Share the **Donum Dei Performance — HQ** page (and the Content Calendar) with the integration. |
| `Anthropic (x-api-key)` | Header Auth | Header name `x-api-key`, value your `sk-ant-...` key |
| `Resend (Bearer)` | Header Auth | Header name `Authorization`, value `Bearer re_...` |

Workflows reference credentials by these exact names; on import n8n asks you
to map them once.

### 2. Environment variables (n8n instance)

```
DONUM_DEI_API_URL=https://api.donumdeiperformance.com   # or http://api:8000 in compose
DDP_WEB_URL=https://donumdeiperformance.com
DDP_EMAIL_FROM=Donum Dei Performance <programs@donumdeiperformance.com>
DDP_OWNER_EMAIL=johnrizkalla2300@gmail.com
DDP_CLAUDE_MODEL=claude-sonnet-5                        # optional override
```

Every workflow falls back to a sane default if a variable is unset.

### 3. Import

n8n → Workflows → Import from File → select each JSON in `automation/n8n/`.
All workflows import **inactive**; activate them after mapping credentials.
Point the website funnel at the webhook URLs n8n shows on activation
(`/webhook/ddp-lead`, `/webhook/ddp-generate`, `/webhook/ddp-checkin`,
`/webhook/ddp-question`).

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

Any of: n8n Cloud (fastest, ~€20/mo), or self-hosted free via Docker on the
same host as the API — add to `docker-compose.yml`:

```yaml
  n8n:
    image: docker.n8n.io/n8nio/n8n
    ports: ["5678:5678"]
    environment:
      - DONUM_DEI_API_URL=http://api:8000
    volumes:
      - n8n_data:/home/node/.n8n
```

See `docs/DATA_PLATFORM.md` for why Notion is the ops hub and what the
evaluated alternatives were.
