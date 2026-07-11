# Data Platform — Centralization Decision

*Donum Dei Performance · July 2026*

## The question

All information flowing in (leads, assessments, check-ins, questions) and
out (programs, emails, posts, newsletters) needs one place where a human
can see and steer it. Does Notion satisfy that on both the company side and
the client side — and if not, what is the most cost-effective alternative
with the best UI/UX?

## The answer

**Two-layer architecture. Postgres stays the system of record; Notion is
the single operations hub.** Notion alone does not satisfy every aspect —
and nothing in its category does — so the design leans on each layer for
what it is actually good at:

| Concern | Layer | Why |
|---|---|---|
| Accounts, auth, billing state, program JSON, athlete state | **Postgres** (already behind the API) | Transactional integrity, schema enforcement, no rate limits, queried by the engine on every request. Notion is unsuitable here: ~3 req/s rate limit, no transactions, no foreign keys. |
| CRM, client roster, content calendar, newsletter pipeline, Q&A queue, automation log | **Notion HQ** | Best-in-class reading/editing UX, the databases double as approval queues (status fields are the human↔machine interface), free on the current plan, already in the stack (content bot). |
| Client-facing delivery | **Web app + email** (Next.js + Resend) | Clients never touch Notion; they get the site dashboard, the PDF, and email. |

Everything inbound and outbound passes through the Notion HQ databases via
n8n, so the "one place to look" requirement is met without forcing the
transactional load into a tool that cannot carry it.

## Where Notion falls short (and how the design compensates)

1. **Rate limits (~3 req/s)** — n8n workflows batch and space writes; the
   engine never blocks on Notion (mirroring is async, after the fact).
2. **No relational integrity** — join key is the client email everywhere;
   Postgres holds the real relations.
3. **No hard validation** — select-option "contracts" are documented in
   `automation/README.md`; workflows fail loudly to the Automation Log.
4. **Client portal** — Notion is not client-facing; the web app is.

## Alternatives evaluated

| Option | Cost (approx, mid-2026) | Verdict |
|---|---|---|
| **Notion** (current) | Free tier covers a solo operator; Plus ~$10–12/user/mo if limits are hit | **Chosen.** Already in the workspace, best UX for a non-engineer operator, n8n + API support, doubles as docs/wiki. |
| Airtable | Team ~$20/user/mo for meaningful record limits | Better typed fields and views, but 2× cost, second tool to learn, and the record caps bite exactly when the client list grows. |
| Baserow / NocoDB (self-hosted) | ~$5–10/mo VPS, software free | Cheapest at scale and truly relational, but you become the DBA; UI is serviceable, not delightful. The right migration target **if** Notion limits ever hurt. |
| Google Sheets | Free | No status/select integrity, brittle automations, poor audit trail. Rejected. |
| HubSpot/Pipedrive CRM + separate tools | $15–50+/mo, per seat | Solves only the CRM slice; fragments content/Q&A/programs across more tools — the opposite of centralizing. |

Prices move; verify before committing to a paid tier. The architecture is
deliberately swappable: every workflow touches Notion through eight database
IDs in `automation/README.md`, so re-pointing to Baserow/NocoDB later is a
day of work, not a rebuild.

## The hub

- **Notion HQ page**: `Donum Dei Performance — HQ`
  (https://app.notion.com/p/39a21819e2ce8154acc9e34adc4ac721) — databases for
  Leads (CRM), Clients, Programs, Check-ins, Q&A Inbox, Newsletter Issues,
  Automation Log, plus the pre-existing Content Calendar.
- **Flow**: website/webhooks → n8n → API (`/v1/assess`, `/v1/generate`,
  `/v1/feedback`) → Postgres, mirrored into Notion → Claude drafts content /
  replies → human flips a status → n8n delivers via Resend → status marked
  Sent and logged.
