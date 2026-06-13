import type {
  AssessRequest,
  AssessResponse,
  AuthResponse,
  MyProgram,
  ProgramRecord,
  User,
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

/** Build an Authorization header object when a token is present. */
function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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

/**
 * POST /v1/assess — submit the assessment funnel payload.
 * When a token is supplied, the run attaches to the account and the
 * backend derives the email (omit `email` from the body); otherwise email
 * is required.
 */
export function submitAssessment(
  body: AssessRequest,
  token?: string | null
): Promise<AssessResponse> {
  return request<AssessResponse>("/v1/assess", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

/** POST /v1/auth/register — create an account. */
export function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** POST /v1/auth/login — exchange credentials for a token. */
export function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** GET /v1/auth/me — validate a token and return the current user. */
export function me(token: string): Promise<User> {
  return request<User>("/v1/auth/me", {
    headers: authHeaders(token),
    cache: "no-store",
  });
}

/** GET /v1/me/programs — the signed-in user's program runs (newest first). */
export function listMyPrograms(token: string): Promise<MyProgram[]> {
  return request<MyProgram[]>("/v1/me/programs", {
    headers: authHeaders(token),
    cache: "no-store",
  });
}

/** GET /v1/programs/:id — fetch a stored program run (server-side). */
export function getProgram(id: string): Promise<ProgramRecord> {
  return request<ProgramRecord>(`/v1/programs/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
}
