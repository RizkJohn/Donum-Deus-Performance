import type {
  AssessRequest,
  AssessResponse,
  AuthResponse,
  AuthUser,
  CheckoutResponse,
  PricingTier,
  ProgramRecord,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dp_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = JSON.stringify(body.detail);
    } catch {
      // non-JSON error body; keep statusText
    }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

/** POST /v1/assess — submit the assessment funnel payload. */
export function submitAssessment(body: AssessRequest): Promise<AssessResponse> {
  return request<AssessResponse>("/v1/assess", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /v1/programs/:id — fetch a stored program run (server-side). */
export function getProgram(id: string): Promise<ProgramRecord> {
  return request<ProgramRecord>(`/v1/programs/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
}

// ---- Auth ----

/** POST /v1/auth/magic-link — send sign-in email. */
export function sendMagicLink(email: string): Promise<{ status: string }> {
  return request("/v1/auth/magic-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** GET /v1/auth/verify — exchange magic-link token for session. */
export function verifyMagicLink(token: string): Promise<AuthResponse> {
  return request<AuthResponse>(`/v1/auth/verify?token=${encodeURIComponent(token)}`);
}

/** GET /v1/auth/me — fetch current user (requires token in localStorage). */
export function getMe(): Promise<AuthUser> {
  return request<AuthUser>("/v1/auth/me");
}

/** POST /v1/billing/checkout — create Stripe Checkout session. */
export function createCheckout(tier: PricingTier): Promise<CheckoutResponse> {
  return request<CheckoutResponse>("/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
}

/** GET /v1/programs — list programs for the authenticated user. */
export function listPrograms(): Promise<ProgramRecord[]> {
  return request<ProgramRecord[]>("/v1/programs");
}
