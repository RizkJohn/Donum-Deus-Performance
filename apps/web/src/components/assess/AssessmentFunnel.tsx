"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitAssessment } from "@/lib/api";
import {
  fatigueStateFor,
  isEngineError,
  type AssessRequest,
  type Day,
  type Goal,
  type NoveltyTolerance,
  type TrainingAge,
  type TrainingEnvironment,
} from "@/lib/types";

const DAYS: Day[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const GOALS: Goal[] = [
  "Strength",
  "Fat Loss",
  "Athletic Performance",
  "General Health",
  "Hypertrophy",
];

const TRAINING_AGES: TrainingAge[] = ["Beginner", "Intermediate", "Advanced"];

const DURATIONS = [30, 45, 60, 75, 90];

const INJURY_OPTIONS = [
  "Shoulder",
  "Knee",
  "Lower Back",
  "Wrist",
  "Ankle",
  "None",
];

const FATIGUE_STEPS = [1, 2, 3, 4, 5] as const;

const FATIGUE_FACTORS = [
  {
    key: "sleep" as const,
    label: "Sleep",
    hint: "How did you sleep last night?",
    low: "Excellent",
    high: "Terrible",
  },
  {
    key: "soreness" as const,
    label: "Soreness",
    hint: "Current muscle soreness.",
    low: "None",
    high: "Severe",
  },
  {
    key: "energy" as const,
    label: "Energy",
    hint: "Overall energy level right now.",
    low: "High",
    high: "Depleted",
  },
  {
    key: "stress" as const,
    label: "Stress",
    hint: "Psychological / life stress load.",
    low: "Calm",
    high: "Severe",
  },
] as const;

const ENVIRONMENTS: { value: TrainingEnvironment; label: string }[] = [
  { value: "full_gym", label: "Full gym" },
  { value: "home", label: "Home" },
  { value: "minimal", label: "Minimal" },
];

const MODALITIES = [
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Machines",
  "Bands",
  "Bodyweight",
  "Sled",
];

const AVERSIONS = [
  "Burpees",
  "Running",
  "Barbell",
  "Kettlebell",
  "Jumping",
  "Lunges",
];

const NOVELTY: { value: NoveltyTolerance; label: string; hint: string }[] = [
  { value: "low", label: "Familiar", hint: "Repeat what works" },
  { value: "medium", label: "Balanced", hint: "Steady rotation" },
  { value: "high", label: "Varied", hint: "Fresh stimulus often" },
];

const STEPS = [
  { title: "Profile", sub: "Who is training" },
  { title: "Goals", sub: "What it is for" },
  { title: "Schedule", sub: "When you can train" },
  { title: "State", sub: "Fatigue & injuries" },
  { title: "Practice", sub: "Environment & preference" },
  { title: "Review", sub: "Confirm & generate" },
];

type Phase = "form" | "submitting" | "engine_error" | "network_error";

export default function AssessmentFunnel() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const [errorReasons, setErrorReasons] = useState<string[]>([]);
  const [validation, setValidation] = useState<string | null>(null);

  // Step 1 — profile
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [trainingAge, setTrainingAge] = useState<TrainingAge | "">("");

  // Step 2 — goals
  const [primaryGoal, setPrimaryGoal] = useState<Goal | "">("");
  const [secondaryGoals, setSecondaryGoals] = useState<Goal[]>([]);

  // Step 3 — schedule
  const [availableDays, setAvailableDays] = useState<Day[]>([]);
  const [sportName, setSportName] = useState("");
  const [sportDays, setSportDays] = useState<Day[]>([]);
  const [duration, setDuration] = useState(60);

  // Step 4 — state
  const [sleepScore, setSleepScore] = useState(2);
  const [sorenessScore, setSorenessScore] = useState(2);
  const [energyScore, setEnergyScore] = useState(2);
  const [stressScore, setStressScore] = useState(2);
  const [injuries, setInjuries] = useState<string[]>([]);

  // Step 5 — practice / preferences
  const [trainingEnvironment, setTrainingEnvironment] =
    useState<TrainingEnvironment>("full_gym");
  const [preferredModalities, setPreferredModalities] = useState<string[]>([]);
  const [exerciseAversions, setExerciseAversions] = useState<string[]>([]);
  const [noveltyTolerance, setNoveltyTolerance] =
    useState<NoveltyTolerance>("medium");

  // Step 6 — email + consent
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");

  const fatigueScore = useMemo(
    () => (sleepScore + sorenessScore + energyScore + stressScore) / 4,
    [sleepScore, sorenessScore, energyScore, stressScore],
  );
  const fatigueState = useMemo(() => fatigueStateFor(fatigueScore), [fatigueScore]);

  function toggle<T>(list: T[], value: T, set: (v: T[]) => void) {
    set(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  }

  function toggleInjury(value: string) {
    if (value === "None") {
      setInjuries(injuries.includes("None") ? [] : ["None"]);
    } else {
      const next = injuries.includes(value)
        ? injuries.filter((v) => v !== value)
        : [...injuries.filter((v) => v !== "None"), value];
      setInjuries(next);
    }
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      const a = Number(age);
      const w = Number(weight);
      if (!age || !Number.isFinite(a) || a < 13 || a > 100)
        return "Enter an age between 13 and 100.";
      if (!weight || !Number.isFinite(w) || w < 60 || w > 600)
        return "Enter a body weight in pounds (60–600).";
      if (!trainingAge) return "Select your training age.";
    }
    if (s === 1) {
      if (!primaryGoal) return "Select a primary goal.";
    }
    if (s === 2) {
      if (availableDays.length === 0)
        return "Select at least one available training day.";
      if (sportName.trim() && sportDays.length === 0)
        return "Select the days you play your sport, or clear the sport name.";
      if (!sportName.trim() && sportDays.length > 0)
        return "Name your sport, or clear the selected sport days.";
    }
    if (s === 5) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "Enter a valid email address.";
      if (!consented)
        return "Confirm that you have read and agree to the Privacy Policy and Terms of Service.";
      if (createAccount && password.length < 8)
        return "Choose a password of at least 8 characters, or uncheck account creation.";
    }
    return null;
  }

  function next() {
    const v = validateStep(step);
    if (v) {
      setValidation(v);
      return;
    }
    setValidation(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setValidation(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function buildRequest(): AssessRequest {
    const orderedAvailable = DAYS.filter((d) => availableDays.includes(d));
    const orderedSport = DAYS.filter((d) => sportDays.includes(d));
    const sport = sportName.trim().toLowerCase();
    return {
      email: email.trim(),
      payload: {
        client_profile: {
          age: Number(age),
          weight: Number(weight),
          training_age: trainingAge as TrainingAge,
        },
        goals: {
          primary: primaryGoal as Goal,
          secondary: secondaryGoals.filter((g) => g !== primaryGoal),
        },
        schedule: {
          available_days: orderedAvailable,
          sport_days:
            sport && orderedSport.length > 0 ? { [sport]: orderedSport } : {},
          session_duration: duration,
        },
        state: {
          sleep: sleepScore,
          soreness: sorenessScore,
          energy: energyScore,
          stress: stressScore,
          injuries: injuries.filter((i) => i !== "None"),
        },
        preferences: {
          training_environment: trainingEnvironment,
          preferred_modalities: preferredModalities,
          exercise_aversions: exerciseAversions,
          novelty_tolerance: noveltyTolerance,
        },
      },
    };
  }

  async function submit() {
    const v = validateStep(5);
    if (v) {
      setValidation(v);
      return;
    }
    setValidation(null);
    setPhase("submitting");
    try {
      const res = await submitAssessment(buildRequest());
      if (isEngineError(res.program)) {
        setErrorReasons(res.program.reasons);
        setPhase("engine_error");
        return;
      }
      if (createAccount) {
        // Best-effort: an existing account (or any hiccup) never blocks the
        // athlete from seeing the program they just generated.
        try {
          await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
        } catch {
          // ignored — the program itself still delivers
        }
      }
      router.push(`/program/${res.id}`);
    } catch {
      setPhase("network_error");
    }
  }

  // ---- non-form phases ----

  if (phase === "submitting") {
    return (
      <div
        className="flex flex-col items-center px-6 py-24 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="animate-pulse font-play text-[64px] font-black italic leading-none text-line2">
          D.
        </p>
        <p className="mb-6 mt-1 font-play text-[13px] italic text-warm">
          Mensura ante motum.
        </p>
        <h2 className="mb-2 font-mono text-[17px] font-medium uppercase tracking-[0.08em] text-ink">
          Generating your week
        </h2>
        <p className="mb-6 max-w-[360px] text-[11px] tracking-[0.04em] text-ink3">
          The engine is distributing nervous-system load, budgeting volume, and
          validating movement coverage. This takes a moment.
        </p>
        <div className="h-[2px] w-[280px] overflow-hidden bg-line">
          <div className="h-full w-1/2 animate-pulse bg-accent" />
        </div>
      </div>
    );
  }

  if (phase === "engine_error") {
    return (
      <div className="mx-auto max-w-[560px] px-6 py-24">
        <p className="kicker mb-4">Unsatisfiable constraints</p>
        <h2 className="mb-5 font-play text-[32px] font-black leading-[1] tracking-[-0.02em] text-ink">
          The engine declined to{" "}
          <em className="font-normal italic text-warm">compromise.</em>
        </h2>
        <p className="mb-6 font-bask text-[15px] leading-[1.8] text-ink2">
          A complete, safe week could not be built from your answers. Rather
          than hand you a degraded program, the engine returns the conflict.
          Adjust the inputs below and try again.
        </p>
        <ul className="mb-8 flex flex-col gap-px border border-line bg-line">
          {errorReasons.map((r) => (
            <li
              key={r}
              className="flex items-start gap-3 bg-bg px-5 py-4 text-[12px] leading-[1.7] text-ink2"
            >
              <span aria-hidden="true" className="shrink-0 text-danger">
                —
              </span>
              {r}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setPhase("form");
            setStep(2);
          }}
        >
          Adjust your answers
        </button>
      </div>
    );
  }

  if (phase === "network_error") {
    return (
      <div className="mx-auto max-w-[560px] px-6 py-24">
        <p className="kicker mb-4">Connection failed</p>
        <h2 className="mb-5 font-play text-[32px] font-black leading-[1] tracking-[-0.02em] text-ink">
          We could not reach the engine.
        </h2>
        <p className="mb-8 font-bask text-[15px] leading-[1.8] text-ink2">
          Your answers are preserved. Check your connection and submit again.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setPhase("form")}
        >
          Return to review
        </button>
      </div>
    );
  }

  // ---- form ----

  const summary = buildRequestSafe();

  function buildRequestSafe() {
    try {
      return buildRequest();
    } catch {
      return null;
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[1160px] items-start gap-11 px-6 py-11 md:px-11 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-[78px]">
        <p className="font-play text-[18px] font-black uppercase tracking-[0.2em] text-accent">
          Donum Dei
        </p>
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink3">
          Free assessment
        </p>
        <p className="mb-8 mt-1 font-play text-[12px] italic text-warm">
          Donum Dei.
        </p>
        <ol className="flex flex-col">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              aria-current={i === step ? "step" : undefined}
              className={`flex items-start gap-3 border-b border-line py-[13px] last:border-b-0 transition-opacity ${
                i === step ? "opacity-100" : i < step ? "opacity-60" : "opacity-35"
              }`}
            >
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center border font-mono text-[10px] font-medium ${
                  i < step
                    ? "border-accent bg-accent text-[#0b0f0c]"
                    : i === step
                      ? "border-accent bg-accent2 text-accent"
                      : "border-line2 text-ink3"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span>
                <span className="block font-mono text-[11px] font-medium uppercase tracking-[0.07em] text-ink">
                  {s.title}
                </span>
                <span className="block text-[9px] text-ink3">{s.sub}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-7 h-[2px] bg-line" aria-hidden="true">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </aside>

      {/* Form card */}
      <div className="border border-line bg-bg">
        <div className="flex items-center justify-between border-b border-line bg-bg1 px-[26px] py-4">
          <h1 className="font-mono text-[13px] font-medium uppercase tracking-[0.06em] text-ink">
            {STEPS[step].title}
          </h1>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink3">
            Step {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="px-[26px] py-7">
          {step === 0 && (
            <fieldset className="border-0 p-0">
              <legend className="sr-only">Profile</legend>
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="age">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    inputMode="numeric"
                    min={13}
                    max={100}
                    className="field-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="weight">
                    Body weight (lbs)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    inputMode="numeric"
                    min={60}
                    max={600}
                    className="field-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-2">
                <span className="field-label">Training age</span>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Training age"
                >
                  {TRAINING_AGES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={trainingAge === t}
                      onClick={() => setTrainingAge(t)}
                      className={`chip-btn ${trainingAge === t ? "chip-btn-sel" : ""}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[9px] italic text-ink3">
                  Beginner: under 1 year of structured training. Advanced: 4+
                  years.
                </p>
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="border-0 p-0">
              <legend className="sr-only">Goals</legend>
              <div className="mb-6">
                <label className="field-label" htmlFor="primary-goal">
                  Primary goal
                </label>
                <select
                  id="primary-goal"
                  className="field-input"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value as Goal)}
                >
                  <option value="" disabled>
                    Select a goal
                  </option>
                  {GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="field-label">Secondary goals (optional)</span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Secondary goals"
                >
                  {GOALS.filter((g) => g !== primaryGoal).map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={secondaryGoals.includes(g)}
                      onClick={() => toggle(secondaryGoals, g, setSecondaryGoals)}
                      className={`chip-btn ${
                        secondaryGoals.includes(g) ? "chip-btn-sel" : ""
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[9px] italic text-ink3">
                  The objective hierarchy still governs: joint integrity and
                  movement quality come before everything you select here.
                </p>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="border-0 p-0">
              <legend className="sr-only">Schedule</legend>
              <div className="mb-6">
                <span className="field-label">Available training days</span>
                <div
                  className="grid grid-cols-4 gap-[6px] sm:grid-cols-7"
                  role="group"
                  aria-label="Available training days"
                >
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={availableDays.includes(d)}
                      onClick={() => toggle(availableDays, d, setAvailableDays)}
                      className={`chip-btn px-1 text-[9px] ${
                        availableDays.includes(d) ? "chip-btn-sel" : ""
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="field-label" htmlFor="sport-name">
                  Sport (optional)
                </label>
                <input
                  id="sport-name"
                  type="text"
                  className="field-input mb-3"
                  placeholder="e.g. basketball"
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                />
                <span className="field-label">Sport days</span>
                <div
                  className="grid grid-cols-4 gap-[6px] sm:grid-cols-7"
                  role="group"
                  aria-label="Sport days"
                >
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={sportDays.includes(d)}
                      onClick={() => toggle(sportDays, d, setSportDays)}
                      className={`chip-btn px-1 text-[9px] ${
                        sportDays.includes(d) ? "chip-btn-sel" : ""
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[9px] italic text-ink3">
                  The day before any sport day is automatically kept low-load.
                </p>
              </div>
              <div>
                <label className="field-label" htmlFor="duration">
                  Session duration
                </label>
                <select
                  id="duration"
                  className="field-input"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} minutes
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="border-0 p-0">
              <legend className="sr-only">Current state</legend>
              <div className="mb-3 flex flex-col gap-5">
                {FATIGUE_FACTORS.map(({ key, label, hint, low, high }) => {
                  const scoreMap = {
                    sleep: sleepScore,
                    soreness: sorenessScore,
                    energy: energyScore,
                    stress: stressScore,
                  };
                  const setMap = {
                    sleep: setSleepScore,
                    soreness: setSorenessScore,
                    energy: setEnergyScore,
                    stress: setStressScore,
                  };
                  const current = scoreMap[key];
                  const set = setMap[key];
                  return (
                    <div key={key}>
                      <div className="mb-[6px] flex items-baseline justify-between">
                        <span className="field-label mb-0">{label}</span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink3">
                          {hint}
                        </span>
                      </div>
                      <div
                        className="grid grid-cols-5 gap-[5px]"
                        role="radiogroup"
                        aria-label={label}
                      >
                        {FATIGUE_STEPS.map((n) => {
                          const sel = current === n;
                          const selClass =
                            n <= 2
                              ? "border-accent3 bg-accent2 text-accent"
                              : n === 3
                                ? "border-[rgba(196,154,82,0.28)] bg-[rgba(196,154,82,0.1)] text-warm"
                                : "border-[rgba(184,68,68,0.28)] bg-[rgba(184,68,68,0.1)] text-danger";
                          return (
                            <button
                              key={n}
                              type="button"
                              role="radio"
                              aria-checked={sel}
                              aria-label={`${label} ${n}`}
                              onClick={() => set(n)}
                              className={`flex h-[42px] flex-col items-center justify-center border font-mono text-[11px] font-medium transition-colors ${
                                sel
                                  ? selClass
                                  : "border-line bg-bg2 text-ink3 hover:border-line2"
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-[4px] flex justify-between font-mono text-[8px] text-ink3">
                        <span>{low}</span>
                        <span>{high}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mb-1 mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink3">
                Derived fatigue state:{" "}
                <span
                  className={
                    fatigueState === "low"
                      ? "text-accent"
                      : fatigueState === "moderate"
                        ? "text-warm"
                        : "text-danger"
                  }
                >
                  {fatigueState} (avg {fatigueScore.toFixed(1)})
                </span>
                {fatigueState === "high" && (
                  <span className="ml-2 normal-case tracking-normal">
                    — volume will be reduced ~30%, intensity preserved
                  </span>
                )}
              </p>
              <div className="mt-6">
                <span className="field-label">Current injuries or pain</span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Injuries"
                >
                  {INJURY_OPTIONS.map((inj) => (
                    <button
                      key={inj}
                      type="button"
                      aria-pressed={injuries.includes(inj)}
                      onClick={() => toggleInjury(inj)}
                      className={`chip-btn ${
                        injuries.includes(inj) ? "chip-btn-sel" : ""
                      }`}
                    >
                      {inj}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[9px] italic text-ink3">
                  Affected joints are routed around via approved substitutions —
                  the week stays complete.
                </p>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="border-0 p-0">
              <legend className="sr-only">Practice & preferences</legend>
              <div className="mb-6">
                <span className="field-label">Training environment</span>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Training environment"
                >
                  {ENVIRONMENTS.map((e) => (
                    <button
                      key={e.value}
                      type="button"
                      role="radio"
                      aria-checked={trainingEnvironment === e.value}
                      onClick={() => setTrainingEnvironment(e.value)}
                      className={`chip-btn ${trainingEnvironment === e.value ? "chip-btn-sel" : ""}`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <span className="field-label">Preferred implements (optional)</span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Preferred implements"
                >
                  {MODALITIES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={preferredModalities.includes(m)}
                      onClick={() => toggle(preferredModalities, m, setPreferredModalities)}
                      className={`chip-btn ${preferredModalities.includes(m) ? "chip-btn-sel" : ""}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <span className="field-label">Movements to avoid (optional)</span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Movements to avoid"
                >
                  {AVERSIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={exerciseAversions.includes(a)}
                      onClick={() => toggle(exerciseAversions, a, setExerciseAversions)}
                      className={`chip-btn ${exerciseAversions.includes(a) ? "chip-btn-sel" : ""}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[9px] italic text-ink3">
                  A preference, not a hard block — coverage is preserved; the
                  engine simply selects around them where it can.
                </p>
              </div>
              <div>
                <span className="field-label">Variation</span>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Variation"
                >
                  {NOVELTY.map((n) => (
                    <button
                      key={n.value}
                      type="button"
                      role="radio"
                      aria-checked={noveltyTolerance === n.value}
                      onClick={() => setNoveltyTolerance(n.value)}
                      className={`flex flex-col items-center gap-[2px] px-2 py-[10px] ${
                        noveltyTolerance === n.value ? "chip-btn-sel" : "chip-btn"
                      }`}
                    >
                      <span className="text-[11px] font-medium">{n.label}</span>
                      <span className="font-mono text-[7px] uppercase tracking-[0.1em] text-ink3">
                        {n.hint}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[9px] italic text-ink3">
                  The variation engine tracks what you have trained and rotates
                  stimulus to keep adaptation alive — this sets how aggressively.
                </p>
              </div>
            </fieldset>
          )}

          {step === 5 && summary && (
            <div>
              <dl className="mb-6 flex flex-col gap-px border border-line bg-line">
                {[
                  [
                    "Profile",
                    `${summary.payload.client_profile.age} yrs · ${summary.payload.client_profile.weight} lbs · ${summary.payload.client_profile.training_age}`,
                  ],
                  [
                    "Goals",
                    [
                      summary.payload.goals.primary,
                      ...summary.payload.goals.secondary,
                    ].join(", "),
                  ],
                  [
                    "Schedule",
                    `${summary.payload.schedule.available_days
                      .map((d) => d.slice(0, 3))
                      .join(", ")} · ${summary.payload.schedule.session_duration} min`,
                  ],
                  [
                    "Sport",
                    Object.entries(summary.payload.schedule.sport_days)
                      .map(
                        ([s, ds]) =>
                          `${s} (${ds.map((d) => d.slice(0, 3)).join(", ")})`
                      )
                      .join("; ") || "None",
                  ],
                  [
                    "State",
                    `Fatigue ${fatigueScore.toFixed(1)} (${fatigueState}) · Sleep ${sleepScore} · Soreness ${sorenessScore} · Energy ${energyScore} · Stress ${stressScore}${
                      summary.payload.state.injuries.length
                        ? ` · ${summary.payload.state.injuries.join(", ")}`
                        : " · No injuries"
                    }`,
                  ],
                  [
                    "Practice",
                    `${ENVIRONMENTS.find((e) => e.value === trainingEnvironment)?.label} · Variation: ${noveltyTolerance}${
                      preferredModalities.length ? ` · Prefers ${preferredModalities.join(", ")}` : ""
                    }${exerciseAversions.length ? ` · Avoids ${exerciseAversions.join(", ")}` : ""}`,
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex bg-bg1 px-5 py-3">
                    <dt className="min-w-[90px] font-mono text-[8px] uppercase leading-[2.4] tracking-[0.22em] text-accent">
                      {k}
                    </dt>
                    <dd className="font-mono text-[11px] leading-[1.8] text-ink">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <label className="field-label" htmlFor="email">
                Email — your program is delivered here
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-2 text-[9px] italic text-ink3">
                No card required. No spam — the program and nothing else.
              </p>

              {/* Consent */}
              <label className="mt-5 flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="mt-[2px] h-[14px] w-[14px] shrink-0 cursor-pointer accent-[var(--accent)]"
                />
                <span className="text-[10px] leading-[1.7] text-ink3 group-hover:text-ink2 transition-colors">
                  I have read and agree to the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-accent underline underline-offset-2 hover:text-ink transition-colors"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-accent underline underline-offset-2 hover:text-ink transition-colors"
                  >
                    Terms of Service
                  </Link>
                  . I understand that Donum Dei Performance is a practice of
                  performance education and this program does not constitute
                  medical or clinical advice.
                </span>
              </label>

              {/* Optional account creation */}
              <label className="mt-5 flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="create-account"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-[2px] h-[14px] w-[14px] shrink-0 cursor-pointer accent-[var(--accent)]"
                />
                <span className="text-[10px] leading-[1.7] text-ink3 group-hover:text-ink2 transition-colors">
                  Create an account so this program (and every one after it)
                  is waiting in a dashboard — optional.
                </span>
              </label>
              {createAccount && (
                <div className="mt-3">
                  <label className="field-label" htmlFor="account-password">
                    Password
                  </label>
                  <input
                    id="account-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    className="field-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="mt-2 text-[9px] italic text-ink3">
                    At least 8 characters.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-bg1 px-[26px] py-4">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn-ghost">
              ← Back
            </button>
          ) : (
            <Link href="/" className="btn-ghost">
              ← Home
            </Link>
          )}
          <div className="flex items-center gap-4">
            {validation && (
              <p role="alert" className="text-[10px] tracking-[0.06em] text-danger">
                {validation}
              </p>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="cursor-pointer border-0 bg-accent px-[26px] py-[11px] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#0b0f0c] transition-opacity hover:opacity-80"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="cursor-pointer border-0 bg-accent px-[26px] py-[11px] font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#0b0f0c] transition-opacity hover:opacity-80"
              >
                Generate my week →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
