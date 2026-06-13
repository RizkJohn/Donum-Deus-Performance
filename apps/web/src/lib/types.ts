// Program contract types — mirror engine/output_schema.md exactly.

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type CNS = "High" | "Low";

export type BlockType =
  | "Warmup"
  | "Power"
  | "Strength"
  | "Accessory"
  | "Core"
  | "Mobility";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
}

export interface Block {
  type: BlockType;
  exercises: Exercise[];
}

export interface Session {
  day: Day;
  blocks: Block[];
}

export interface SplitDay {
  day: Day;
  cns: CNS;
  focus: string;
}

export interface Program {
  weekly_split: SplitDay[];
  sessions: Session[];
  conditioning: unknown[];
  mobility: unknown[];
  flags: string[];
}

export interface EngineError {
  error: "UNSATISFIABLE_CONSTRAINTS";
  reasons: string[];
}

export type ProgramOrError = Program | EngineError;

// ---- Assessment payload (mirrors engine/input_contract.md) ----

export type TrainingAge = "Beginner" | "Intermediate" | "Advanced";

export type Goal =
  | "Strength"
  | "Fat Loss"
  | "Athletic Performance"
  | "General Health"
  | "Hypertrophy";

export type FatigueState = "low" | "moderate" | "high";

export interface AssessPayload {
  client_profile: {
    age: number;
    weight: number;
    training_age: TrainingAge;
  };
  goals: {
    primary: Goal;
    secondary: Goal[];
  };
  schedule: {
    available_days: Day[];
    sport_days: Record<string, Day[]>;
    session_duration: number;
  };
  state: {
    fatigue_score: number;
    fatigue_state: FatigueState;
    injuries: string[];
  };
}

export interface AssessRequest {
  /** Required for anonymous submissions; omitted when authenticated (the
   * backend derives it from the account). */
  email?: string;
  payload: AssessPayload;
}

export interface AssessResponse {
  id: string;
  program: ProgramOrError;
}

export interface ProgramRecord {
  id: string;
  email: string;
  payload: AssessPayload;
  program: ProgramOrError;
  created_at: string;
}

// ---- Auth & accounts ----

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** A program run attached to the signed-in account (GET /v1/me/programs). */
export interface MyProgram {
  id: string;
  payload: AssessPayload;
  program: ProgramOrError;
  is_error: boolean;
  created_at: string;
}

export function isEngineError(p: ProgramOrError): p is EngineError {
  return (
    typeof p === "object" &&
    p !== null &&
    "error" in p &&
    (p as EngineError).error === "UNSATISFIABLE_CONSTRAINTS"
  );
}

export function fatigueStateFor(score: number): FatigueState {
  if (score >= 4.0) return "high";
  if (score >= 3.0) return "moderate";
  return "low";
}
