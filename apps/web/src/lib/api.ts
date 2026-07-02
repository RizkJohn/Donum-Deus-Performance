import type {
  AssessRequest,
  AssessResponse,
  Feedback,
  MyProgramsResponse,
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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

/** POST /v1/feedback — submit reinforcement signals after a training cycle. */
export function submitFeedback(
  body: Feedback,
): Promise<{ ok: boolean; state_summary: unknown }> {
  return request("/v1/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /v1/me/programs — the dashboard's data source (auth required). */
export function getMyPrograms(token: string): Promise<MyProgramsResponse> {
  return request<MyProgramsResponse>("/v1/me/programs", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
}
