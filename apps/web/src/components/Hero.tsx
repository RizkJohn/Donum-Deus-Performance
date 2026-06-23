import Link from "next/link";

const STATS = [
  "2 min assessment",
  "Personalized weekly program",
  "No credit card",
];

export default function Hero() {
  return (
    <header className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 px-6 pb-24 pt-[110px] md:px-12 lg:grid-cols-2 lg:gap-20">
      <div>
        <p className="kicker mb-7">Adaptive Training Engine</p>
        <h1 className="mb-8 font-play text-[clamp(48px,6.5vw,88px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
          Train with precision.{" "}
          <em className="font-normal italic text-accent">
            Live without limit.
          </em>
        </h1>
        <p className="mb-10 max-w-[420px] border-l-2 border-line2 pl-5 font-bask text-[17px] leading-[1.85] text-ink2">
          A constraint-driven engine builds your week the way a serious coach
          would — complete movement coverage, managed nervous-system load,
          volume that adapts to your fatigue. Human-grade programming, without
          the waitlist.
        </p>
        <div className="mb-10 flex flex-wrap items-center gap-[14px]">
          <Link href="/apply" className="btn-primary">
            Start your free assessment →
          </Link>
          <Link href="/#method" className="btn-ghost">
            See the method
          </Link>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5">
          {STATS.map((s) => (
            <li
              key={s}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink3"
            >
              <span aria-hidden="true" className="text-accent">
                —
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="hidden lg:block">
        <div className="border border-line bg-bg1 p-10">
          <p
            aria-hidden="true"
            className="mb-5 font-play text-[clamp(68px,8vw,112px)] font-black italic leading-[0.9] tracking-[-0.02em] text-line2"
          >
            Deus.
          </p>
          <div className="mb-5 h-px bg-line" />
          <div className="flex flex-col gap-px bg-line">
            {[
              {
                latin: "Donum",
                word: "The gift",
                def: "The body is given once. Stewardship is not optional.",
              },
              {
                latin: "Disciplina",
                word: "The discipline",
                def: "Order of effort: joint integrity before load, quality before volume.",
              },
              {
                latin: "Mensura",
                word: "The measure",
                def: "Every session governed by hard rules — never by enthusiasm.",
              },
            ].map((r) => (
              <div key={r.latin} className="flex items-stretch bg-bg">
                <span className="flex min-w-[120px] items-center border-r border-line px-[18px] py-[14px] font-play text-[20px] italic text-warm">
                  {r.latin}
                </span>
                <span className="flex flex-col justify-center gap-[2px] px-[18px] py-[14px] text-[10px] tracking-[0.06em] text-ink3">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
                    {r.word}
                  </span>
                  {r.def}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
