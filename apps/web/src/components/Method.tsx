const FEATURES = [
  {
    title: "CNS load management",
    body: "At most two high-CNS days per week, never back-to-back. Pre-sport days are always low load. Your nervous system is budgeted like capital.",
  },
  {
    title: "Complete movement coverage",
    body: "Every week covers squat, hinge, push, pull, rotation, carry, and jump. No pattern is skipped because it is unfashionable.",
  },
  {
    title: "Fatigue-adaptive volume",
    body: "Report high fatigue and the engine cuts volume — not intensity — by roughly thirty percent. The stimulus stays; the cost drops.",
  },
  {
    title: "Progression with deload logic",
    body: "Loads step forward in measured increments. When the data says hold or back off, the program holds or backs off. Progress is a flag, not a feeling.",
  },
  {
    title: "Never to failure",
    body: "Primary lifts stop one to three reps short of failure, every time. Longevity is a constraint the engine cannot violate.",
  },
];

const HIERARCHY = [
  { rank: "i.", name: "Joint Integrity", desc: "The non-negotiable foundation" },
  { rank: "ii.", name: "Movement Quality", desc: "Patterns before load" },
  { rank: "iii.", name: "Strength", desc: "Force, expressed safely" },
  { rank: "iv.", name: "Work Capacity", desc: "The engine beneath it" },
  { rank: "v.", name: "Hypertrophy", desc: "Tissue, built deliberately" },
  { rank: "vi.", name: "Sport / Skill", desc: "Expression, last" },
];

export default function Method() {
  return (
    <section id="method" className="mx-auto max-w-[1280px] scroll-mt-[60px] px-6 py-24 md:px-12">
      <p className="kicker mb-4">The method</p>
      <h2 className="mb-7 font-play text-[clamp(36px,5vw,62px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
        Constraints, <em className="font-normal italic text-warm">not content.</em>
      </h2>
      <p className="mb-12 max-w-[660px] font-bask text-[17px] leading-[1.8] text-ink2">
        Most apps hand you a template. Deus runs every program through hard
        rules — the same rules a careful coach holds in their head — and
        rejects anything that violates them.
      </p>

      <div className="mt-11 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="bg-bg p-7 transition-colors hover:bg-bg1">
            <p className="mb-3 font-play text-[40px] font-normal italic leading-none text-line2">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
              {f.title}
            </h3>
            <p className="text-[11px] leading-[1.8] text-ink3">{f.body}</p>
          </div>
        ))}
        <div className="bg-bg2 p-7">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
            Objective hierarchy — never reordered
          </p>
          <ol className="flex flex-col">
            {HIERARCHY.map((h) => (
              <li
                key={h.name}
                className="flex items-center gap-4 border-b border-line py-[7px] last:border-b-0"
              >
                <span className="min-w-[24px] font-play text-[18px] italic leading-none text-line2">
                  {h.rank}
                </span>
                <span>
                  <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink">
                    {h.name}
                  </span>
                  <span className="block text-[9px] text-ink3">{h.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
