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

export type TrainingEnvironment = "full_gym" | "home" | "minimal";
export type NoveltyTolerance = "low" | "medium" | "high";
export type RecoveryCapacity = "low" | "moderate" | "high";

export interface Preferences {
  training_environment: TrainingEnvironment;
  preferred_modalities: string[];
  exercise_aversions: string[];
  novelty_tolerance: NoveltyTolerance;
  recovery_capacity?: RecoveryCapacity | null;
}

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
    sleep: number;
    soreness: number;
    energy: number;
    stress: number;
    injuries: string[];
  };
  preferences?: Preferences;
}

// ---- Assessment Layer output (mirrors models/assessment.py) ----

export type TrainingState =
  | "primed"
  | "balanced"
  | "functional_overreach"
  | "depleted";

export type Stimulus =
  | "progressive_overload"
  | "volume_maintenance"
  | "volume_reduction"
  | "technical_deload";

export type IntensityTarget = "low" | "moderate" | "moderate-high" | "high";

export interface TrainingAssessment {
  readiness_score: number;
  training_state: TrainingState;
  recovery_classification: RecoveryCapacity;
  overload_tolerance: number;
  recommended_stimulus: Stimulus;
  progression_path: "progress" | "maintain" | "deload";
  movement_priority: string[];
  novelty_target: number;
  intensity_target: IntensityTarget;
  intensity_range: string;
  exclusions: string[];
  summary: string;
}

export interface AthleteStateSummary {
  cycle_count: number;
  fatigue_index: number;
  compliance_score: number;
  recovery_capacity: RecoveryCapacity;
  novelty_tolerance: NoveltyTolerance;
  recent_movement_patterns: Record<string, number>;
}

export interface Feedback {
  email: string;
  run_id: string;
  completion_pct: number;
  rpe_drift?: number;
  soreness?: number;
  skipped_exercises?: string[];
  substitutions?: string[];
  enjoyment?: number;
  performance_note?: string;
}

export interface AssessRequest {
  email: string;
  payload: AssessPayload;
}

export interface AssessResponse {
  id: string;
  program: ProgramOrError;
  assessment: TrainingAssessment | null;
  state_summary: AthleteStateSummary | null;
}

export interface ProgramRecord {
  id: string;
  email: string;
  payload: AssessPayload;
  program: ProgramOrError;
  assessment: TrainingAssessment | null;
  state_summary: AthleteStateSummary | null;
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
