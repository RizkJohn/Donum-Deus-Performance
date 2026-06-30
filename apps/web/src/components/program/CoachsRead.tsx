import type { AthleteStateSummary, TrainingAssessment } from "@/lib/types";

const GROUP_LABEL: Record<string, string> = {
  squat: "Squat",
  hinge: "Hinge",
  push: "Push",
  pull: "Pull",
  rotation: "Rotation",
  carry: "Carry",
  jump: "Jump",
};

function human(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg p-[14px]">
      <p className="mb-[5px] font-mono text-[7px] uppercase tracking-[0.2em] text-warm">
        {label}
      </p>
      <p className="font-play text-[15px] font-bold leading-tight text-ink">
        {value}
      </p>
    </div>
  );
}

export default function CoachsRead({
  assessment,
  state,
}: {
  assessment: TrainingAssessment;
  state?: AthleteStateSummary | null;
}) {
  const readiness = Math.round(assessment.readiness_score * 100);
  return (
    <section className="mb-10">
      <h2 className="kicker mb-4">The coach&apos;s read</h2>
      <div className="border border-line bg-bg1">
        <div className="border-b border-line px-5 py-4">
          <p className="font-bask text-[15px] italic leading-[1.7] text-ink2">
            {assessment.summary}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Readiness" value={`${readiness}%`} />
          <Stat label="Training state" value={human(assessment.training_state)} />
          <Stat label="Stimulus" value={human(assessment.recommended_stimulus)} />
          <Stat label="Intensity" value={assessment.intensity_target} />
          <Stat
            label="Variation target"
            value={`${Math.round(assessment.novelty_target * 100)}%`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink3">
            Movement priority
          </span>
          {assessment.movement_priority.slice(0, 4).map((g, i) => (
            <span
              key={g}
              className={`border px-[9px] py-[3px] font-mono text-[8px] uppercase tracking-[0.1em] ${
                i === 0
                  ? "border-accent3 bg-accent2 text-accent"
                  : "border-line bg-bg text-ink3"
              }`}
            >
              {GROUP_LABEL[g] ?? g}
            </span>
          ))}
          <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.14em] text-ink3">
            {assessment.intensity_range}
          </span>
        </div>
        {state && state.cycle_count > 1 && (
          <div className="border-t border-line bg-bg2 px-5 py-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink3">
              Adaptive cycle {state.cycle_count} · compliance{" "}
              {Math.round(state.compliance_score * 100)}% · the engine is
              programming against your training history, not from scratch.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
