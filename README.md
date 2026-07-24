# Donum Dei Performance
*by Riz Management LLC*

> *Donum Dei — the body is a gift. Train it accordingly.*

---

## Repository Structure

```
donum-dei-performance/
├── apps/
│   ├── api/             # FastAPI engine pipeline service (Python)
│   │   ├── donum_dei_api/               # models, engine (decision/QC/retry), llm providers, routes
│   │   ├── data/                   # derived JSON (exercise library, substitutions)
│   │   ├── scripts/port_library.py # markdown → JSON generator
│   │   └── tests/                  # pytest suite incl. 400+ program contract test
│   └── web/             # Next.js marketing site + assessment funnel (TypeScript)
│
├── packages/schemas/    # Shared JSON Schemas (derived from engine/*.md)
│
├── automation/          # n8n workflow suite + ops automation guide
│   ├── README.md                   # credentials, env vars, import steps, Notion IDs
│   └── n8n/                        # 13 importable workflows (leads, billing, programs, content, Q&A…)
│
├── engine/              # Core training system brain (SOURCE OF TRUTH)
│   ├── engine_instructions.md      # System rules & CNS management
│   ├── exercise_library.md         # Approved exercise pool
│   ├── fatigue_model.md            # Fatigue scoring & accumulation rules
│   ├── input_contract.md           # Client payload schema
│   ├── output_schema.md            # Program output format
│   ├── progression_engine.md       # Load/volume progression logic
│   ├── quality_control.md          # QC checklist (pre-output gate)
│   ├── substitution_rules.md       # Exercise substitution logic
│   ├── retry_policy.md             # Error handling & retry behavior
│   ├── prompt_wrapper.md           # API prompt wrapping instructions
│   └── ARCHITECTURE_SUMMARY.md    # High-level system architecture
│
├── frontend/            # Legacy static mockups (design reference)
│   ├── donum_dei_v1.html                # Initial landing page / engine interface
│   └── donum_dei_v2.html                # Redesigned DDP site (basis for apps/web)
│
├── business/            # Business strategy & planning
│   └── DDHoldings_Business_Plan.md # Full blueprint, projections, brand system
│
├── docs/                # Reference documentation
│   ├── ARCHITECTURE.md              # Full system design for the live product
│   ├── DEPLOYMENT.md               # Prod deploy: Netlify web + cheap VPS backend
│   ├── BUDGET.md                   # First-year cost + spending plan (~$5/mo floor)
│   ├── RedesignGuide.md            # Frontend redesign specifications
│   ├── DATA_PLATFORM.md            # Centralization: Postgres + Notion HQ decision
│   └── io-vs-com-org-guide.md      # Domain strategy guide
│
├── docker-compose.yml       # Local dev stack (+ `automation` profile: self-hosted n8n)
├── docker-compose.prod.yml  # VPS backend: postgres + api + n8n + Caddy (auto-HTTPS)
├── Caddyfile                 # Reverse proxy for the VPS backend
├── netlify.toml               # Website deploy config (apps/web → Netlify)
├── .env.prod.example          # VPS backend environment template
└── README.md
```

## Status

- **Rebrand** — complete across code, specs, business docs, and legacy
  mockups; verified with the full API test suite (489 passing) and a clean
  web production build.
- **Automation** — 13 n8n workflows covering the full lifecycle (leads →
  conversion → onboarding → programs → check-ins → content → newsletter →
  Q&A → billing → monitoring → owner digest), verified end-to-end in Docker.
- **Operations hub** — Notion HQ live with all 8 databases wired to the
  workflows (`automation/README.md` has every database ID).
- **Deployment** — architecture decided and built: Netlify (site, free) +
  one ~$5/mo VPS (API + Postgres + n8n behind Caddy). Not yet live — domain
  purchase, VPS provisioning, and credentials are the remaining launch steps
  (`docs/DEPLOYMENT.md`, `docs/BUDGET.md`).

---

## System Overview

Donum Dei Performance (DDP) is a **constraint-driven adaptive training engine** operating under a fixed objective hierarchy:

1. Joint Integrity
2. Movement Quality
3. Strength
4. Work Capacity
5. Hypertrophy
6. Sport / Skill Performance

The engine takes a structured client payload and returns a complete weekly training program conforming to CNS management rules, movement pattern coverage requirements, and fatigue accumulation constraints.

---

## Engine Architecture

**Input** → `input_contract.md`  
Client profile, goals, schedule, fatigue state, injuries

**Processing** → `engine_instructions.md` + `fatigue_model.md` + `progression_engine.md`  
CNS classification, session design, movement pattern validation, QC gate

**Output** → `output_schema.md`  
Structured weekly program: sessions, blocks, exercises, sets, reps, rest, notes

**Substitution** → `substitution_rules.md`  
Equipment constraints, injury flags, fatigue-adjusted alternatives

---

## Operating Principles

- No improvisation. System operates within defined constraints.
- Movement-based design, not muscle-group splits.
- Full-body exposure across the training week.
- Maximum 2 High CNS sessions per week. No consecutive High CNS days.
- Never train to failure on primary lifts (1–3 RIR maintained).
- Deload every 6–8 weeks or on performance drop.

---

## Running the product

See `docs/ARCHITECTURE.md` for the full system design. For production, the
site deploys to **Netlify** (free) and the backend (API + Postgres + n8n) runs
on **one ~$5/mo VPS** — full runbook in **`docs/DEPLOYMENT.md`**, costs in
**`docs/BUDGET.md`**.

```bash
docker compose up --build   # local dev: postgres + api (:8000) + web (:3000) — no API key needed
make test                   # engine test suite (offline, mock provider)
make seed-library           # regenerate derived JSON after editing engine/*.md

# production backend, on the VPS (see docs/DEPLOYMENT.md):
docker compose -f docker-compose.prod.yml up -d --build   # postgres + api + n8n + caddy
```

The API defaults to `LLM_PROVIDER=mock` (deterministic, offline). For real
generation set `LLM_PROVIDER=claude` and `ANTHROPIC_API_KEY`. The pipeline:
input validation → deterministic decision engine (CNS split, volume, coverage,
fatigue) → LLM exercise-fill → QC gate (one check per hard rule) → retry (≤3)
→ program or `UNSATISFIABLE_CONSTRAINTS`.

---

## Brand

- **Institution**: Donum Dei Performance
- **Operating entity**: Riz Management LLC
- **Tagline**: *Donum Dei. The body is a gift. Train it accordingly.*
- **Service model**: Fulfillment-as-a-service coaching practice

---

*End.*
