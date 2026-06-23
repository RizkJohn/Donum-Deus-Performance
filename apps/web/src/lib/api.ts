import type { AssessRequest, AssessResponse, ProgramRecord } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** POST /api/assess — submit the assessment funnel payload. Called from browser. */
export async function submitAssessment(body: AssessRequest): Promise<AssessResponse> {
  const res = await fetch("/api/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      if (err?.message) detail = err.message;
    } catch {
      // non-JSON body
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<AssessResponse>;
}
