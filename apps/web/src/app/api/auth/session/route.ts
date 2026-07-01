import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Presence-only check for UI state (e.g. Nav's Log in / Dashboard toggle).
// The real security boundary is server-side: FastAPI verifies the token's
// signature/expiry on every authenticated request regardless of what this
// reports.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return NextResponse.json({ authed: Boolean(token) });
}
