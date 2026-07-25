# First-Year Budget & Spending Plan

*Donum Dei Performance · Riz Management LLC — prepared July 2026*

The operating principle: **nothing scales ahead of revenue.** Every line item
is either a ~$5/mo fixed floor or triggered by actual usage (AI generation,
email volume, card transactions). You can run the entire brand for the first
year for **well under $200**, most of it a single cheap server.

Prices verified July 2026 — see Sources. Verify at signup; they move.

> **Interim status (2026-07-25):** the website's host is temporarily
> **Vercel**, not Netlify (Netlify's production build 404s until the rebrand
> branch merges — see `docs/DEPLOYMENT.md`). This changes the $0 website line
> below: Vercel's Hobby tier is free but its ToS prohibits commercial use
> (cited above), so this business needs **Vercel Pro (~$20/mo)** for as long
> as it stays on Vercel — confirm the team's current plan. Everything else in
> this budget (the VPS backend line) is unaffected.

---

## Architecture (what runs where, and what it costs)

| Layer | Service | Plan | Cost |
|---|---|---|---|
| Website (Next.js) | **Netlify** | Free (commercial use allowed) | **$0** |
| Engine API + the 13 automations + database | **1 VPS** (Hetzner CX22) + self-hosted n8n + Postgres | ~€4.50/mo | **~$5/mo** |
| Operations hub (CRM, content, Q&A, newsletter) | **Notion** | Free | **$0** |
| Transactional + marketing email | **Resend** | Free (3k/mo, 100/day) | **$0** |
| Program generation + content drafting | **Anthropic API** | Usage-based | **pennies/use** |
| Subscription billing | **Stripe** | No monthly fee | **2.9% + $0.30 / charge** |
| Object/file storage | — none needed | (PDF is client-side) | **$0** |

Why not the "free" managed alternatives for the parts that cost money here:
Vercel's free tier forbids commercial use ($20/mo Pro required); managed n8n
Cloud is ~€20/mo. Self-hosting those two on one $5 box is the saving.

---

## Fixed monthly floor (pre-revenue)

| Item | Monthly |
|---|---|
| Hetzner CX22 VPS (API + Postgres + n8n + Caddy) | ~$5.00 |
| Netlify · Notion · Resend · n8n license | $0 |
| **Fixed floor** | **~$5/mo** |

Domain `donumdeiperformance.com` is ~$12/year (≈ $1/mo amortized).

## Usage-based costs (only when used)

**Anthropic API** — bills only with `LLM_PROVIDER=claude`. Rough per-unit:

| Action | Est. cost each |
|---|---|
| Weekly program generation (Sonnet, incl. retries) | ~$0.10–0.25 |
| Blog post draft | ~$0.02–0.05 |
| Newsletter / Q&A / social draft | ~$0.01–0.03 |

At pre-revenue volume (say 50 assessments + a dozen content pieces/month) that's
**~$5–15/mo**. You can run `LLM_PROVIDER=mock` ($0) during pure-marketing phase
and switch to real generation the moment someone pays — at which point the cost
is trivial against a $20–240/mo subscription. **AI is self-funding.**

**Stripe** — 2.9% + $0.30 per successful charge. On a $120 Practice
subscription that's ~$3.78. A cost *of* revenue, never overhead.

---

## First-year total — three scenarios

| Scenario | What it assumes | Year 1 total |
|---|---|---|
| **Rock-bottom** | Oracle Always-Free VPS ($0) + `mock` AI; domain only | **~$12–15** |
| **Recommended** | Hetzner CX22 (~$59/yr) + domain ($12) + real AI once clients exist (~$60–120/yr) | **~$130–190** |
| **With early traction** | Above + Resend Pro ($20/mo) from ~month 8 when list > 100 | **~$230–320** |

Even the "traction" case stays under ~$320 for the year, and the extra spend
only appears *after* you have an email list worth paying to reach.

---

## Month-by-month plan

| Phase | Months | Spend | Notes |
|---|---|---|---|
| **Build / soft launch** | 1–2 | Domain ($12) + VPS ($5/mo) + `mock` AI | ~$22 total. Site + funnel live, no AI bill yet. |
| **Launch** | 3–6 | VPS ($5/mo) + real AI (~$5–15/mo) + Stripe live | ~$10–20/mo. First paying clients cover it immediately. |
| **Grow** | 7–12 | Above + Resend Pro ($20/mo) *only if* list > 100 | ~$25–40/mo, revenue-funded. |

**Break-even:** a **single** Foundation client ($20/mo) covers the entire fixed
infrastructure floor. One Practice client ($120/mo) covers infrastructure + AI +
Resend Pro with ~$95 to spare.

---

## Scaling triggers (spend only when the metric says so)

| Trigger | Action | Added cost |
|---|---|---|
| Email list > 100 or > 3k sends/mo | Resend Free → Pro | +$20/mo |
| n8n/API load climbs (many concurrent clients) | CX22 → CX32 (8 GB) | +~$5/mo |
| Netlify free limits hit (unlikely for a marketing site) | Netlify Free → Pro | +$19/mo |
| Heavy generation volume | Anthropic usage rises | usage-based, revenue-funded |

---

## Optional / not-included (business, not infrastructure)

- **LLC formation** (if Riz Management LLC isn't already formed): one-time
  ~$50–500 depending on state, plus any annual franchise/report fee
  (e.g. CA $800/yr; many states $0–50). This is a legal cost, independent of
  the tech budget above — confirm your state's fees.
- **Accounting / bookkeeping software**: optional; free tiers (Wave) exist.

---

## The one-line summary

**~$5/month gets the entire brand live and automated.** The first paying client
covers it. Everything above that floor is either revenue-funded usage or a
deliberate upgrade you choose once the numbers justify it.

---

*Sources (July 2026): [Hetzner pricing](https://bestusavps.com/reviews/hetzner/),
[Vercel Hobby is non-commercial](https://vercel.com/docs/plans/hobby),
[Oracle free-tier reduction](https://www.infoq.com/news/2026/07/oracle-cloud-free-tier-limits/),
[Neon free tier](https://neon.com/pricing), [Netlify pricing](https://www.netlify.com/pricing/),
[Resend pricing](https://resend.com/pricing), [Anthropic pricing](https://www.anthropic.com/pricing).
Figures are estimates; confirm current rates before committing.*
