import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Engine endpoint — Anthropic proxy for programme generation.
 * Intake payload → Opus assessment → Sonnet generation → QC → JSON output.
 * API key is never sent to the browser; all Anthropic calls go through here.
 *
 * TODO: implement auth check (Supabase session), rate limiting (10 req/hr),
 *       Opus assessment call, Sonnet generation call, QC gate, Supabase cache.
 */
export default async function handler(_req: NextRequest): Promise<Response> {
  return new Response(JSON.stringify({ error: "NOT_IMPLEMENTED" }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}
