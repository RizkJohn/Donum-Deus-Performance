# Shared JSON Schemas

Machine schemas consumed by both `apps/api` (Pydantic mirrors) and `apps/web`
(TypeScript types in `src/lib/types.ts`).

**These are DERIVED artifacts.** The source of truth is the lowercase engine
markdown:

- `output_schema.schema.json` — extracted verbatim from `engine/output_schema.md`
- `input_contract.schema.json` — authored from `engine/input_contract.md`
  (the markdown is pseudo-JSON, so the strict schema lives here)

When the engine specs change, propagate here, to
`apps/api/donum_dei_api/models/`, and to `apps/web/src/lib/types.ts`.
