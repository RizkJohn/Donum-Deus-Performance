import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Intake form handler — persists practitioner profile to Supabase intake_profiles.
 * TODO: validate payload against input_contract schema, upsert to Supabase.
 */
export default async function handler(_req: NextRequest): Promise<Response> {
  return new Response(JSON.stringify({ error: "NOT_IMPLEMENTED" }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}
