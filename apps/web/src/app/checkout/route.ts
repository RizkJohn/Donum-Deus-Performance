import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

// GET /checkout?tier=foundation — not a page, a redirect handler. Logged-out
// visitors go to signup first; logged-in visitors get sent straight to a
// Stripe-hosted Checkout session.
export async function GET(req: NextRequest) {
  const tier = req.nextUrl.searchParams.get("tier");
  if (!tier) {
    return NextResponse.redirect(new URL("/curriculum", req.url));
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const next = `/checkout?tier=${encodeURIComponent(tier)}`;
    return NextResponse.redirect(
      new URL(`/signup?next=${encodeURIComponent(next)}`, req.url),
    );
  }

  const upstream = await fetch(`${API_URL}/v1/billing/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tier }),
  });

  if (!upstream.ok) {
    return NextResponse.redirect(new URL("/curriculum?checkout=unavailable", req.url));
  }

  const data = await upstream.json();
  return NextResponse.redirect(data.url);
}
