import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * T2/T3 application handler — writes to Supabase applications table.
 * TODO: validate fields, insert application row, send confirmation via Resend.
 */
export default async function handler(_req: NextRequest): Promise<Response> {
  return new Response(JSON.stringify({ error: "NOT_IMPLEMENTED" }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}
