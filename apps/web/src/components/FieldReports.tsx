// NOTE: Testimonials below are illustrative placeholders, not real client
// quotes. Replace with verified field reports before public launch.

const REPORTS = [
  {
    quote:
      "Three programs a week for a year and my knees stopped complaining. Nothing flashy — the work just arrives in the right order.",
    initials: "MK",
    name: "M. Kessler",
    meta: "Foundation tier · 14 months",
  },
  {
    quote:
      "I play pickup on Thursdays. The engine quietly made Wednesday a light day every single week. No app I've used understood that.",
    initials: "DR",
    name: "D. Ramirez",
    meta: "Practice tier · 8 months",
  },
  {
    quote:
      "I reported a rough sleep week and the volume dropped before I asked. Same lifts, less grind, no lost ground. That earned my trust.",
    initials: "AS",
    name: "A. Sayed",
    meta: "Foundation tier · 6 months",
  },
];

export default function FieldReports() {
  return (
    <section className="border-y border-line bg-bg1 px-6 py-[88px] md:px-12">
      <div className="mx-auto max-w-[1280px]">
        <p className="kicker mb-4">Field reports</p>
        <h2 className="font-play text-[clamp(32px,4vw,52px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
          Tested in <em className="font-normal italic text-warm">ordinary weeks.</em>
        </h2>
        <div className="mt-11 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {REPORTS.map((r) => (
            <figure key={r.name} className="flex flex-col bg-bg px-7 py-8">
              <span
                aria-hidden="true"
                className="mb-[14px] block font-play text-[44px] leading-none text-accent opacity-40"
              >
                &ldquo;
              </span>
              <blockquote className="mb-[22px] flex-1 font-bask text-[16px] italic leading-[1.7] text-ink">
                {r.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-line pt-[18px]">
                <span className="flex h-[38px] w-[38px] items-center justify-center bg-bg3 font-mono text-[12px] font-medium tracking-[0.05em] text-accent">
                  {r.initials}
                </span>
                <span>
                  <span className="block font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink">
                    {r.name}
                  </span>
                  <span className="block text-[10px] tracking-[0.06em] text-ink3">
                    {r.meta}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
