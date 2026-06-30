const STEPS = [
  {
    num: "I.",
    title: "Assessment",
    body: "A short, deliberate intake: profile, goals, schedule, current fatigue, injuries, and how you prefer to train. No guesswork enters the system.",
  },
  {
    num: "II.",
    title: "The engine reads you, then builds",
    body: "First a deterministic read — readiness, training state, stimulus, movement priority. Then a complete, QC-validated week, delivered as a branded PDF that is yours to keep.",
  },
  {
    num: "III.",
    title: "Train, check in, adapt",
    body: "Weekly check-ins feed your persistent athlete state. Load, variation, and progression adjust to your fatigue and adherence — decided by rule, not mood.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="border-y border-line bg-bg1 px-6 py-24 md:px-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <p className="kicker mb-4">How it works</p>
        <h2 className="mb-12 font-play text-[clamp(32px,4vw,52px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
          From answers to{" "}
          <em className="font-normal italic text-warm">ordered effort.</em>
        </h2>
        <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className="relative bg-bg p-8 transition-colors hover:bg-bg2"
            >
              <p className="mb-4 font-play text-[44px] font-normal italic leading-none text-line2">
                {s.num}
              </p>
              <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
                {s.title}
              </h3>
              <p className="text-[12px] leading-[1.8] text-ink3">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
