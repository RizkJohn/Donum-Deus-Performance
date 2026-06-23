# Deus Performance
*by Riz Management LLC*

> *The body is a gift. Train it accordingly.*

---

Deus Performance is a **constraint-driven adaptive training engine** — a system that takes a structured client intake and returns a complete weekly training programme generated under hard physiological rules. No improvisation. No muscle-group splits. No training to failure.

---

## How it works

```
Client intake (profile · goals · schedule · fatigue state · injuries)
        │
        ▼
Deterministic engine  ──  fatigue score → CNS plan → volume budget → allowed exercises
        │
        ▼
claude-sonnet-4-6  ──  fills exercise slots only (never decides structure)
        │
        ▼
QC gate  ──  12 hard-rule checks; reject + retry if any fail (≤ 3 attempts)
        │
        ▼
Weekly training programme  ──  sessions · blocks · sets · reps · rest · notes
```

The LLM never decides CNS distribution, volume, fatigue response, or progression flags. The deterministic engine pre-computes those constraints; the model only selects exercises within the permitted pool. The QC gate re-validates every rule regardless of what the model returns.

---

## Objective hierarchy

The engine enforces a fixed priority order — never reordered:

1. Joint Integrity
2. Movement Quality
3. Strength
4. Work Capacity
5. Hypertrophy
6. Sport / Skill Performance

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Engine specs | Markdown (`packages/engine/`) — source of truth |
| Backend API | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| LLM (API) | Anthropic SDK — `claude-opus-4-8` (mock provider for dev/tests) |
| LLM (web proxy) | Anthropic SDK — `claude-sonnet-4-6` |
| Frontend | Next.js 16, React 19, Tailwind CSS 3, TypeScript |
| Database | PostgreSQL (Supabase) |
| Infra | Docker Compose (local), Vercel (web), Railway/Fly (API) |

---

## Repository layout

```
.
├── packages/
│   ├── engine/         # Markdown spec files — SOURCE OF TRUTH (lowercase only)
│   ├── content-gen/    # Social content generator (Python bot)
│   └── schemas/        # JSON Schemas derived from engine/
├── apps/
│   ├── api/            # FastAPI engine pipeline (Python)
│   │   ├── deus_api/   # models, engine, llm providers, routes, qc
│   │   ├── data/       # derived JSON (exercise library, substitutions)
│   │   └── tests/      # pytest suite — 442 tests, offline
│   └── web/            # Next.js 16 marketing site + assessment funnel
│       └── src/app/
│           ├── (marketing)/    # /, /apply, /doctrine, /about
│           ├── journal/        # Blog (MDX)
│           ├── engine/[id]/    # Programme result view
│           ├── dashboard/      # Practitioner portal
│           └── api/generate/   # Server-side Anthropic proxy
├── api/                # Vercel Edge Function stubs (architecture reference)
├── scripts/seed.sql    # Supabase schema
├── frontend/           # Legacy static mockups (design reference)
├── docs/architecture/  # System design and reference guides
└── docker-compose.yml  # postgres + api (:8000) + web (:3000)
```

---

## Quick start

```bash
# Full stack — no API key needed (mock LLM provider)
docker compose up --build

# Engine test suite (offline, 442 tests)
make test

# Regenerate derived JSON after editing engine/*.md
make seed-library

# Web only
cd apps/web && npm install && npm run dev

# API only
cd apps/api && pip install -e ".[dev]" && uvicorn deus_api.main:app --reload
```

For the live `/api/generate` route, copy `apps/web/.env.local.example` →
`apps/web/.env.local` and set `ANTHROPIC_API_KEY`.

---

## Engine rules (non-negotiable)

- **CNS budget:** fatigue_score ≥ 4.0 → max 1 High-CNS day; otherwise max 2. No consecutive High days. Pre-sport day is always Low CNS.
- **Block order:** Warmup → Power → Strength → Accessory → Core → Mobility.
- **Movement coverage:** squat, hinge, push (horizontal + vertical), pull (horizontal + vertical), rotation/anti-rotation, carry/locomotion, jump — every week.
- **Volume:** ≤ 8 exercises per session.
- **Intensity:** 1–3 RIR on primary lifts. Never to failure.
- **Exercise source:** library only. No synonyms. No invented exercises.

---

## Web routes

| Route | Status |
|-------|--------|
| `/` | Live |
| `/apply` | Live — 4-step assessment funnel |
| `/engine/[id]` | Live — programme result view |
| `POST /api/generate` | Live — server-side Anthropic proxy |
| `/doctrine` | Stub |
| `/about` | Stub |
| `/journal` | Stub |
| `/dashboard` | Stub — needs Supabase auth |

---

## Brand

- **Institution:** Deus Performance
- **Operating entity:** Riz Management LLC
- **Tagline:** *Deus. The body is a gift. Train it accordingly.*
- **Tone:** Precise, disciplined, no hype. Movement-based, constraint-driven.

---

## Development reference

See [`instructions.md`](instructions.md) for setup guide and change workflows.
See [`skills.md`](skills.md) for make targets and command reference.
See [`CLAUDE.md`](CLAUDE.md) for AI assistant guidance.
