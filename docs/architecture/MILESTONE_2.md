# Milestone 2 — Voice & Data Layer

## Current state

The engine pipeline is complete and tested (442 passing). The landing page
is live. The assessment funnel (`/apply`) and programme view (`/engine/[id]`)
are wired to `POST /api/generate`. The Supabase schema is designed.

What is missing:

| Gap | Impact |
|-----|--------|
| `/doctrine`, `/about`, `/journal` are empty stubs | No brand depth; visitors leave without a reason to trust DP |
| No programme persistence | Generated programmes disappear on refresh; `/engine/[id]` has no real data source |
| No email capture | The subscriber table exists but nothing writes to it |
| No auth | Dashboard stub; no practitioner accounts |
| Content bot pillars are sport-specific (swimming-heavy) | Brand voice is undefined on socials |

---

## Milestone 2 tracks

### Track A — Brand voice

Priority: **execute before Track B**. A live funnel with no brand depth converts
poorly regardless of how well the engine works. These pages are already in the
nav — stubs actively hurt credibility.

#### A1 — `/doctrine` page

The philosophy page. This is the intellectual backbone of DP's market position.
It must answer: *why constraints*, *why movement over muscle groups*, *why CNS
management*, *why the objective hierarchy*.

Structure:
1. **The premise** — the body is not a machine to be maximised; it is a system
   to be governed. Most training fails because it lacks an objective hierarchy.
2. **The hierarchy** — Joint Integrity → Movement Quality → Strength → Work
   Capacity → Hypertrophy → Sport/Skill. Why this order is not arbitrary.
3. **CNS management** — what it is, why consecutive High-CNS sessions destroy
   adaptation, why the engine enforces the cap dynamically based on fatigue state.
4. **Movement, not muscle** — squat, hinge, push, pull, rotation, carry, jump.
   The seven patterns. Why splits are an organisational convenience, not a
   physiological principle.
5. **The constraint advantage** — why a system that cannot improvise produces
   better outcomes than a coach who can do anything.

Tone: dense, precise, no hype. Playfair Display headings, DM Mono for rules
and principles (as they appear in the engine), Libre Baskerville body copy.

#### A2 — `/about` page

Who is Deus Performance. Not a biography — a positioning statement.

Structure:
1. **The institution** — Deus Performance is a training system, not a person.
   It does not follow trends. It follows constraints.
2. **The origin** — built to solve a specific problem: most AI-generated training
   is unconstrained improvisation. DP enforces physiological rules before the
   model touches the programme.
3. **The model** — three tiers: foundation (self-service engine), practice
   (hybrid coaching), stewardship (full case management). Each tier is a
   different level of constraint enforcement.
4. **The operating entity** — Riz Management LLC.

#### A3 — Journal: first three articles

Establishes intellectual authority and SEO surface area. Each article should be
1,200–1,800 words, MDX, authored under the DP brand (no byline).

| Article | Slug | Angle |
|---------|------|-------|
| "Why CNS fatigue is the constraint most coaches ignore" | `cns-fatigue-constraint` | Explains the dynamic budget: why training hard on consecutive days doesn't double adaptation — it compounds debt. Introduces the fatigue scoring model. |
| "Seven patterns. One week. The movement hierarchy explained." | `movement-hierarchy` | The seven patterns, why coverage matters over muscle targeting, how the engine enforces weekly coverage regardless of day count. |
| "What 1–3 RIR actually means on a primary lift" | `rir-primary-lifts` | Why DP never trains to failure on power/strength primaries. The distinction between intensity and volume fatigue. The evidence for RIR-based autoregulation. |

MDX pipeline: `apps/web/src/content/` → `apps/web/src/app/journal/[slug]/page.tsx`.

#### A4 — Social content strategy

The content bot (`packages/content-gen/`) is functional but the pillars are
swimming-heavy. Refactor to reflect DP's actual positioning:

New pillar categories:
- `constraint-training — [topic]` — the DP method explained through specific rules
- `cns-management — [topic]` — fatigue, load management, session sequencing
- `movement-patterns — [topic]` — the seven patterns, technique, why they matter
- `objective-hierarchy — [topic]` — the prioritisation model applied to real situations
- `recovery-science — [topic]` — sleep, HRV, adaptation windows
- `athlete-mindset — [topic]` — internal standards, process over outcome

Platforms: Instagram (carousel + Reels), TikTok, Threads.
Output: 6 posts per run via `make bot`, pushed to Notion for scheduling.

---

### Track B — Data layer

Depends on: Track A pages can be built independently. Track B enables the
practitioner flow that makes DP a real product, not just a demo.

#### B1 — Supabase integration

Install `@supabase/supabase-js` in `apps/web`. Add environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Create `apps/web/src/lib/supabase.ts` — client singleton (anon key for
browser, service role key for server routes).

Run `scripts/seed.sql` against the Supabase project to create the five tables:
`practitioners`, `intake_profiles`, `programmes`, `applications`, `subscribers`.

#### B2 — Programme persistence

After `/api/generate` returns a valid programme, save it to the `programmes`
table before returning the response. Return the programme `id` alongside the
output so the client can redirect to `/engine/:id`.

Currently `/engine/[id]` likely reads from local state or URL params — change
it to load the programme from Supabase by `id` at page render time
(`generateStaticParams` or a server component data fetch).

Schema match: `output` column is `JSONB` and matches `output_schema.md` exactly.

#### B3 — Email capture

After the assessment funnel completes and the programme generates, capture the
email address in the `subscribers` table with `source: 'engine'`.

If the user came from the `/apply` funnel before generating, also write to
`intake_profiles` so their state is persisted for return visits.

#### B4 — Supabase Auth + dashboard

Add `@supabase/auth-helpers-nextjs` or use the new `@supabase/ssr` package.
Gate `/dashboard` behind auth. Practitioners sign in with email magic link or
OAuth (Google).

The dashboard shows:
- Recent programmes (from `programmes` table)
- Intake profile state (current fatigue, injuries, schedule)
- Re-generate button (pre-fills the funnel from saved state)

This is the minimum practitioner loop: intake → generate → save → review → regenerate.

---

## Execution order

```
Week 1:  A1 /doctrine content + MDX pipeline scaffolding
Week 2:  A2 /about content + A3 first two journal articles
Week 3:  B1 Supabase integration + B2 programme persistence
Week 4:  B3 email capture + A4 content bot pillars refactor + A3 third article
Week 5:  B4 auth + dashboard MVP
```

Track A and B can run in parallel on separate branches. Brand content (A) does
not depend on the data layer (B). The data layer (B) does not depend on brand
content (A).

---

## Definition of done

- [x] `/doctrine` renders with full content, matches dark sage design
- [x] `/about` renders with full content
- [x] `/journal` lists articles; `/journal/[slug]` renders MDX
- [x] `packages/content-gen/` pillars updated to DP brand positioning (32 DP-brand pillars across 6 categories)
- [x] `engine.ts` shared logic extracted; `/api/assess` route (generate + persist + email capture)
- [x] `supabase.ts` server client; `/engine/[id]` queries Supabase directly
- [x] Journal article 1: "Why CNS Fatigue Is the Constraint Most Coaches Ignore" (`cns-fatigue-constraint`)
- [x] Journal article 2: "Seven Patterns. One Week. The Movement Hierarchy Explained." (`movement-hierarchy`)
- [x] Journal article 3: "What 1–3 RIR Actually Means on a Primary Lift" (`rir-primary-lifts`)
- [ ] Supabase project credentials connected; `scripts/seed.sql` run against project
- [ ] Programmes saved to Supabase after generation; `/engine/[id]` loads from DB (needs credentials)
- [ ] Email captured to `subscribers` table at assessment completion (needs credentials)
- [ ] `/dashboard` auth-gated; shows recent programmes for signed-in practitioner (B4 — deferred)
- [ ] All CI checks passing (pytest + tsc + Next.js build)
