# CLAUDE.md — apps/web

Next.js 16 marketing site and assessment funnel for Deus Performance.

## Stack

- Next.js 16 (App Router), React 19, Tailwind CSS 3, TypeScript 5.7
- `@anthropic-ai/sdk ^0.105.0` — server-side only (never imported in browser code)
- Standalone output (`output: "standalone"`) for Vercel/Docker deployment

## Key environment variables

| Var | Required | Purpose |
|-----|----------|---------|
| `ANTHROPIC_API_KEY` | Yes (for `/api/generate`) | Server-side key; never exposed to browser |
| `NEXT_PUBLIC_API_URL` | Dev only | Points to FastAPI service (`http://localhost:8000`) |

Copy `apps/web/.env.local.example` → `apps/web/.env.local` and fill in values.

## App Router layout (`src/app/`)

```
src/app/
├── (marketing)/          # Route group — URL prefix not added
│   ├── page.tsx          # /
│   ├── apply/            # /apply  (assessment funnel)
│   ├── doctrine/         # /doctrine  (stub)
│   └── about/            # /about     (stub)
├── journal/              # /journal   (stub — needs MDX pipeline)
├── engine/[id]/          # /engine/:id  (auth-gated programme view)
├── dashboard/            # /dashboard   (stub — needs Supabase auth)
└── api/generate/         # POST /api/generate  (server-side Anthropic proxy)
    └── route.ts
```

## `/api/generate` route (`src/app/api/generate/route.ts`)

Server-side Node.js route that mirrors the Python pipeline:

1. Validates the `IntakePayload` (client_profile, goals, schedule, state).
2. Loads `packages/engine/*.md` spec files at module init (cached across warm
   invocations via `readFileSync` at top level).
3. Loads `apps/api/data/exercise_library.json` and runs the **deterministic
   decision engine** in TypeScript: fatigue scoring, day selection, dynamic
   CNS assignment, volume budget, injury filtering.
4. Builds DEVELOPER context block (spec files + precomputed plan JSON).
5. Calls `claude-sonnet-4-6` with:
   - SYSTEM: `engine_instructions.md` (cache_control: ephemeral)
   - DEVELOPER: spec files + plan (cache_control: ephemeral)
   - USER: intake payload JSON
6. Strips markdown fences from response, parses JSON, returns programme.

Error responses: `INVALID_REQUEST` (400), `SERVER_ERROR` (500),
`ENGINE_REFUSED` (502), `UPSTREAM_ERROR` (502), `PARSE_ERROR` (502).

## Vercel file tracing (`next.config.ts`)

The route reads files outside the Next.js project directory. The config
bundles them into the standalone output:

```typescript
outputFileTracingRoot: path.join(__dirname, "../.."),  // repo root
experimental: {
  outputFileTracingIncludes: {
    "/api/generate": [
      "../../packages/engine/*.md",
      "../../apps/api/data/*.json",
    ],
  },
}
```

## Development

```bash
cd apps/web
npm install
npm run dev      # starts on :3000
npm run build    # standalone output in .next/standalone/
npm run lint
```

TypeScript check: `npx tsc --noEmit` (must pass with 0 errors before committing).

## Component structure (`src/components/`)

- `assess/AssessmentFunnel.tsx` — multi-step intake form; POSTs to `/api/generate`
  and redirects to `/engine/:id`
- `assess/ProgramView.tsx` — renders the returned programme JSON
- Top-level marketing components: `Nav`, `Hero`, `Method`, `HowItWorks`,
  `Pricing`, `Faq`, `FieldReports`, `FinalCta`, `Footer`

## Notes

- `src/lib/api.ts` — shared fetch helpers; `src/lib/types.ts` — shared TypeScript
  types between components and the API route.
- Do not import `@anthropic-ai/sdk` outside `src/app/api/` — it must stay
  server-only.
- `export const dynamic = "force-dynamic"` is set on the generate route to
  prevent static pre-rendering.
