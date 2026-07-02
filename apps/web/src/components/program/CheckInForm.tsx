"use client";

import { useState } from "react";
import { submitFeedback } from "@/lib/api";

const COMPLETION = [
  { label: "All of it", value: 1 },
  { label: "Most", value: 0.8 },
  { label: "About half", value: 0.5 },
  { label: "Little", value: 0.25 },
];

const EFFORT = [
  { label: "Easier", value: -1 },
  { label: "As planned", value: 0 },
  { label: "Harder", value: 1 },
];

const SCALE = [1, 2, 3, 4, 5];

export default function CheckInForm({
  runId,
  email,
}: {
  runId: string;
  email: string | null;
}) {
  const [emailInput, setEmailInput] = useState(email ?? "");
  const [completion, setCompletion] = useState<number>(1);
  const [effort, setEffort] = useState<number>(0);
  const [soreness, setSoreness] = useState<number>(2);
  const [phase, setPhase] = useState<"form" | "saving" | "done" | "error">("form");

  async function save() {
    const e = emailInput.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setPhase("error");
      return;
    }
    setPhase("saving");
    try {
      await submitFeedback({
        email: e,
        run_id: runId,
        completion_pct: completion,
        rpe_drift: effort,
        soreness,
      });
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  if (phase === "done") {
    return (
      <section className="mt-10 border border-line bg-bg1 px-5 py-6">
        <p className="mb-1 font-play text-[15px] italic text-warm">Logged.</p>
        <p className="font-bask text-[14px] leading-[1.7] text-ink2">
          The engine folds this into your athlete state — your next week
          autoregulates on what actually happened, not the intake alone.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="kicker mb-4">Close the loop</h2>
      <div className="border border-line bg-bg1 px-5 py-5">
        <p className="mb-5 font-bask text-[14px] italic leading-[1.7] text-ink2">
          When the week is done, tell the engine how it went. Reinforcement
          signals make the adaptation real.
        </p>

        {!email && (
          <div className="mb-5">
            <label className="field-label" htmlFor="checkin-email">
              Email (the one tied to this program)
            </label>
            <input
              id="checkin-email"
              type="email"
              autoComplete="email"
              className="field-input"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>
        )}

        <div className="mb-5">
          <span className="field-label">How much did you complete?</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Completion">
            {COMPLETION.map((c) => (
              <button
                key={c.label}
                type="button"
                role="radio"
                aria-checked={completion === c.value}
                onClick={() => setCompletion(c.value)}
                className={`chip-btn ${completion === c.value ? "chip-btn-sel" : ""}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <span className="field-label">Effort vs. prescribed</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Effort">
            {EFFORT.map((c) => (
              <button
                key={c.label}
                type="button"
                role="radio"
                aria-checked={effort === c.value}
                onClick={() => setEffort(c.value)}
                className={`chip-btn ${effort === c.value ? "chip-btn-sel" : ""}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <span className="field-label">Residual soreness (1 none · 5 severe)</span>
          <div className="grid max-w-[280px] grid-cols-5 gap-[5px]" role="radiogroup" aria-label="Soreness">
            {SCALE.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={soreness === n}
                onClick={() => setSoreness(n)}
                className={`flex h-[40px] items-center justify-center border font-mono text-[11px] ${
                  soreness === n
                    ? "border-accent3 bg-accent2 text-accent"
                    : "border-line bg-bg2 text-ink3 hover:border-line2"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={phase === "saving"}
            className="btn-primary disabled:cursor-wait disabled:opacity-70"
          >
            {phase === "saving" ? "Logging…" : "Log this week"}
          </button>
          {phase === "error" && (
            <p role="alert" className="text-[10px] tracking-[0.06em] text-danger">
              Enter a valid email and try again.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
