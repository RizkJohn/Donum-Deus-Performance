/**
 * POST /api/generate
 *
 * Engine endpoint — server-side Anthropic proxy for programme generation.
 * The API key never leaves the server.
 *
 * For the full assess+persist flow (saves to Supabase), use POST /api/assess.
 * This route returns raw programme JSON without persistence.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateProgramme, isValidPayload } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_REQUEST", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!isValidPayload(body)) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "Missing required fields: client_profile, goals, schedule, state",
      },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Engine not configured — ANTHROPIC_API_KEY missing" },
      { status: 500 }
    );
  }

  try {
    const { programme } = await generateProgramme(body);
    return NextResponse.json(programme);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Engine error";
    if (msg === "Model refused to generate programme") {
      return NextResponse.json(
        { error: "ENGINE_REFUSED", message: msg },
        { status: 502 }
      );
    }
    if (msg.includes("JSON")) {
      return NextResponse.json(
        { error: "PARSE_ERROR", message: "Engine returned non-JSON output" },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "UPSTREAM_ERROR", message: msg }, { status: 502 });
  }
}
