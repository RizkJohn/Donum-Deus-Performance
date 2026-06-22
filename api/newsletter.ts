import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Email capture — inserts into Supabase subscribers table and triggers
 * lead-magnet delivery ("The Doctrine" PDF) via Resend.
 * TODO: validate email, upsert subscriber row, fire Resend transactional email.
 */
export default async function handler(_req: NextRequest): Promise<Response> {
  return new Response(JSON.stringify({ error: "NOT_IMPLEMENTED" }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}
