const PRIORITIES = [
  {
    n: "1",
    title: "Joint Integrity",
    desc: "Ankles, knees, hips, spine, shoulders — protected without exception",
  },
  {
    n: "2",
    title: "Movement Quality",
    desc: "Coordination and sequencing before any load is added",
  },
  {
    n: "3",
    title: "Strength",
    desc: "Relative and absolute, built on a foundation of quality movement",
  },
  {
    n: "4",
    title: "Work Capacity",
    desc: "Without the accumulation of systemic fatigue that undermines the above",
  },
  {
    n: "5",
    title: "Hypertrophy",
    desc: "Functional and proportionate — never in excess of what the structure supports",
  },
  {
    n: "6",
    title: "Performance",
    desc: "Context-specific, always protected by the five priorities beneath it",
  },
];

export default function OrderSection() {
  return (
    <section className="mx-auto max-w-[1300px] px-5 py-9 md:px-[52px] md:py-[56px]">
      <div className="max-w-[620px]">
        <div className="kicker mb-[11px]">The Order of Priority</div>
        <h2
          className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[7px] text-ink"
          style={{ fontSize: "clamp(28px, 3.6vw, 48px)" }}
        >
          When objectives conflict,
          <br />
          the doctrine{" "}
          <em className="text-warm">resolves</em> them.
        </h2>
        <p className="font-bask text-[14px] text-ink2 mb-[28px] leading-[1.8] max-w-[370px]">
          Every programme produced by this institution resolves competing demands
          in a fixed hierarchy. Structural integrity is never traded for
          performance. Performance is never traded for aesthetics. The order is
          non-negotiable.
        </p>
        <div className="flex flex-col">
          {PRIORITIES.map((item) => (
            <div key={item.n} className="order-item">
              <div className="font-play italic text-[22px] text-line2 leading-[1] min-w-[22px] flex-shrink-0 mt-[2px]">
                {item.n}
              </div>
              <div>
                <div className="font-mono font-medium text-[10px] uppercase tracking-[0.08em] text-ink">
                  {item.title}
                </div>
                <div className="text-[10px] text-ink3 mt-[2px]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
