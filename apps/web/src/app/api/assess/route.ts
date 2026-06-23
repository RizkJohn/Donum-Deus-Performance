/**
 * POST /api/assess
 *
 * Primary production endpoint for the assessment funnel.
 * Accepts {email, payload}, generates the weekly programme, persists to
 * Supabase, and returns {id, program}.
 *
 * Replaces the Python /v1/assess endpoint for the web-native flow.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateProgramme, isValidPayload, type IntakePayload } from "@/lib/engine";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface AssessBody {
  email: string;
  payload: IntakePayload;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidBody(body: unknown): body is AssessBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" &&
    isValidEmail(b.email) &&
    isValidPayload(b.payload)
  );
}

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

  if (!isValidBody(body)) {
    return NextResponse.json(
      {
        error: "INVALID_REQUEST",
        message: "Request must include a valid email and complete intake payload",
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

  const { email, payload } = body;

  // Generate programme
  let programme: unknown;
  let flags: string[] = [];
  try {
    const result = await generateProgramme(payload);
    programme = result.programme;
    const prog = result.programme as Record<string, unknown>;
    if (Array.isArray(prog?.flags)) flags = prog.flags as string[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Engine error";
    if (msg === "Model refused to generate programme") {
      return NextResponse.json(
        { error: "ENGINE_REFUSED", message: msg },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "UPSTREAM_ERROR", message: msg }, { status: 502 });
  }

  // Persist to Supabase
  let supabase;
  try {
    supabase = getSupabaseServer();
  } catch {
    // Supabase not configured — return programme without persistence
    return NextResponse.json({
      id: crypto.randomUUID(),
      program: programme,
    });
  }

  const { data: programmeRow, error: programmeError } = await supabase
    .from("programmes")
    .insert({
      output: { programme, payload },
      week_start: new Date().toISOString().split("T")[0],
      flags: flags,
    })
    .select("id, created_at")
    .single();

  if (programmeError || !programmeRow) {
    // Return programme without persistence rather than failing the user
    return NextResponse.json({
      id: crypto.randomUUID(),
      program: programme,
    });
  }

  // Capture subscriber (upsert — ignore duplicates)
  await supabase
    .from("subscribers")
    .upsert({ email, source: "engine" }, { onConflict: "email", ignoreDuplicates: true });

  return NextResponse.json({
    id: programmeRow.id,
    program: programme,
  });
}
