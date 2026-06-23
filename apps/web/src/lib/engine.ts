import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Paths — consistent across generate and assess routes
// ---------------------------------------------------------------------------

const ENGINE_DIR = join(process.cwd(), "..", "..", "packages", "engine");
const DATA_DIR = join(process.cwd(), "..", "api", "data");

function readSpec(name: string): string {
  return readFileSync(join(ENGINE_DIR, name), "utf-8");
}

// Loaded once at module init — cached across warm invocations
export const SPECS = {
  instructions: readSpec("engine_instructions.md"),
  outputSchema: readSpec("output_schema.md"),
  exerciseLibrary: readSpec("exercise_library.md"),
  substitutionRules: readSpec("substitution_rules.md"),
  progressionEngine: readSpec("progression_engine.md"),
  fatigueModel: readSpec("fatigue_model.md"),
  qualityControl: readSpec("quality_control.md"),
};

export const DEVELOPER_SPECS = [
  `### output_schema.md\n\n${SPECS.outputSchema}`,
  `### exercise_library.md\n\n${SPECS.exerciseLibrary}`,
  `### substitution_rules.md\n\n${SPECS.substitutionRules}`,
  `### progression_engine.md\n\n${SPECS.progressionEngine}`,
  `### fatigue_model.md\n\n${SPECS.fatigueModel}`,
  `### quality_control.md\n\n${SPECS.qualityControl}`,
].join("\n\n---\n\n");

// ---------------------------------------------------------------------------
// Exercise library
// ---------------------------------------------------------------------------

export interface Exercise {
  id: string;
  name: string;
  pattern: string;
  cns: "High" | "Low";
  laterality: "Unilateral" | "Bilateral";
}

export const INJURY_BLOCKS: Record<string, string[]> = {
  shoulder: ["pullups", "arnold_press", "incline_db_press", "med_ball_slam"],
  knee: ["front_squat", "back_squat", "broad_jump", "bulgarian_split_squat"],
  back: [
    "barbell_deadlift",
    "trap_bar_deadlift",
    "jefferson_curl",
    "db_swings",
    "med_ball_slam",
  ],
  wrist: ["pushups", "bear_crawl"],
  ankle: ["broad_jump"],
};

export function blockedIdsForInjuries(injuries: string[]): Set<string> {
  const blocked = new Set<string>();
  for (const injury of injuries) {
    const needle = injury.toLowerCase();
    for (const [keyword, ids] of Object.entries(INJURY_BLOCKS)) {
      if (needle.includes(keyword)) ids.forEach((id) => blocked.add(id));
    }
  }
  return blocked;
}

export function loadExercises(): Exercise[] {
  return JSON.parse(readFileSync(join(DATA_DIR, "exercise_library.json"), "utf-8"));
}

// ---------------------------------------------------------------------------
// Deterministic engine
// ---------------------------------------------------------------------------

const DAY_ORDER = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];
const TARGET_DAYS: Record<string, number> = {
  Beginner: 3, Intermediate: 4, Advanced: 5,
};
const BASE_VOLUME: Record<string, number> = {
  Beginner: 5, Intermediate: 6, Advanced: 7,
};

export interface PlanDay {
  day: string;
  cns: "High" | "Low";
  focus: string;
}

export interface PrecomputedPlan {
  weekly_split: PlanDay[];
  max_exercises_per_session: number;
  required_progression_flag: string;
  fatigue_score: number;
  fatigue_state: "high" | "moderate" | "low";
  allowed_exercises: Exercise[];
}

export function buildPrecomputedPlan(
  payload: IntakePayload,
  exercises: Exercise[]
): PrecomputedPlan {
  const { client_profile, schedule, state } = payload;

  const fatigueScore = parseFloat(
    (
      Math.max(
        1,
        Math.min(5, (state.sleep + state.soreness + state.energy + state.stress) / 4)
      )
    ).toFixed(2)
  );
  const fatigueState: "high" | "moderate" | "low" =
    fatigueScore >= 4.0 ? "high" : fatigueScore >= 3.0 ? "moderate" : "low";
  const flag =
    fatigueScore >= 4.0 ? "deload" : fatigueScore >= 3.0 ? "maintain" : "progress";

  const baseVol = BASE_VOLUME[client_profile.training_age] ?? 6;
  const volumeBudget =
    fatigueState === "high" ? Math.max(3, Math.floor(baseVol * 0.7)) : baseVol;

  const maxHighCns = fatigueState === "high" ? 1 : 2;

  const sportDaySet = new Set<string>(
    Object.values(schedule.sport_days ?? {}).flat() as string[]
  );
  const eligible = DAY_ORDER.filter(
    (d) =>
      (schedule.available_days as string[]).includes(d) && !sportDaySet.has(d)
  );
  const n = Math.min(TARGET_DAYS[client_profile.training_age] ?? 4, eligible.length);
  const chosen: string[] = [];
  if (n === 1) {
    chosen.push(eligible[0]);
  } else if (n > 1) {
    const idxSet = new Set(
      Array.from({ length: n }, (_, i) =>
        Math.round((i * (eligible.length - 1)) / (n - 1))
      )
    );
    for (const i of Array.from(idxSet).sort((a, b) => a - b)) {
      chosen.push(eligible[i]);
    }
  }

  const preSport = new Set(
    Array.from(sportDaySet).map(
      (d) => DAY_ORDER[(DAY_ORDER.indexOf(d) - 1 + 7) % 7]
    )
  );
  const highDays = new Set<string>();
  for (const day of chosen) {
    if (highDays.size >= maxHighCns) break;
    if (preSport.has(day)) continue;
    const idx = DAY_ORDER.indexOf(day);
    const adjacent = new Set([
      DAY_ORDER[(idx - 1 + 7) % 7],
      DAY_ORDER[(idx + 1) % 7],
    ]);
    if ([...adjacent].some((d) => highDays.has(d))) continue;
    highDays.add(day);
  }

  const weeklySplit: PlanDay[] = chosen.map((d) => ({
    day: d,
    cns: highDays.has(d) ? "High" : "Low",
    focus: highDays.has(d) ? "Strength & Power" : "Movement & Capacity",
  }));

  const injuries: string[] = state.injuries ?? [];
  const blocked = blockedIdsForInjuries(injuries);
  const allowedExercises = exercises.filter((e) => !blocked.has(e.id));

  return {
    weekly_split: weeklySplit,
    max_exercises_per_session: volumeBudget,
    required_progression_flag: flag,
    fatigue_score: fatigueScore,
    fatigue_state: fatigueState,
    allowed_exercises: allowedExercises,
  };
}

// ---------------------------------------------------------------------------
// Intake payload schema
// ---------------------------------------------------------------------------

export interface IntakePayload {
  client_profile: {
    age: number;
    weight: number;
    training_age: "Beginner" | "Intermediate" | "Advanced";
  };
  goals: {
    primary: string;
    secondary: string[];
  };
  schedule: {
    available_days: string[];
    sport_days: Record<string, string[]>;
    session_duration: number;
  };
  state: {
    sleep: number;
    soreness: number;
    energy: number;
    stress: number;
    injuries: string[];
  };
}

export function isValidPayload(body: unknown): body is IntakePayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return !!b.client_profile && !!b.goals && !!b.schedule && !!b.state;
}

// ---------------------------------------------------------------------------
// Programme generation (calls Claude)
// ---------------------------------------------------------------------------

export interface GenerationResult {
  programme: unknown;
  plan: PrecomputedPlan;
}

export async function generateProgramme(
  payload: IntakePayload
): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const exercises = loadExercises();
  const plan = buildPrecomputedPlan(payload, exercises);

  const planBlock =
    "### PRECOMPUTED PLAN (MANDATORY — do not deviate)\n\n" +
    "Your weekly_split MUST equal the plan's weekly_split exactly. " +
    "Sessions only on planned days. Select exercises ONLY from allowed_exercises " +
    "(exact name match). flags MUST include the required_progression_flag.\n\n" +
    JSON.stringify(plan, null, 2);

  const developerContext = DEVELOPER_SPECS + "\n\n---\n\n" + planBlock;

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: SPECS.instructions,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: developerContext,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: JSON.stringify(payload, null, 2) }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Model refused to generate programme");
  }

  const responseText =
    message.content.find((b) => b.type === "text")?.text ?? "";

  const cleaned = responseText
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  const programme = JSON.parse(cleaned);
  return { programme, plan };
}
