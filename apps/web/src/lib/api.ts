import type { AssessRequest, AssessResponse, ProgramRecord } from "./types";

/** Base URL for the FastAPI engine — used only server-side. */
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Internal API key for server-side calls to the FastAPI service.
 * Never exposed to the browser (not NEXT_PUBLIC_).
 */
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** Build headers for server-side FastAPI requests. */
function serverHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (INTERNAL_API_KEY) h["X-API-Key"] = INTERNAL_API_KEY;
  return h;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...serverHeaders(),
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
 *
 * Called from the browser via the /api/assess Next.js proxy route so the
 * INTERNAL_API_KEY is never sent to the client.
 */
export function submitAssessment(body: AssessRequest): Promise<AssessResponse> {
  return fetch("/api/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (res) => {
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const b = await res.json();
        if (b?.detail) detail = JSON.stringify(b.detail);
      } catch {
        // keep statusText
      }
      throw new ApiError(res.status, detail);
    }
    return res.json() as Promise<AssessResponse>;
  });
}

/** GET /v1/programs/:id — fetch a stored program run (server-side only). */
export function getProgram(id: string): Promise<ProgramRecord> {
  return request<ProgramRecord>(`/v1/programs/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
}
