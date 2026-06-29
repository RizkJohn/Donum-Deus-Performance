/**
 * Server-side proxy for POST /v1/assess.
 *
 * The browser submits assessment data to this Next.js route handler (same
 * origin), which forwards it to the FastAPI service with the INTERNAL_API_KEY
 * header. The key never leaves the server and is never exposed to the client.
 */
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const API_KEY = process.env.INTERNAL_API_KEY ?? "";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/v1/assess`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { detail: "Engine unreachable. Please try again later." },
      { status: 502 }
    );
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
