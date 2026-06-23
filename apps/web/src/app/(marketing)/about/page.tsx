import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Deus Performance",
  description:
    "Deus Performance is a training system built on constraint, not convenience. The institution, the model, and the operating entity.",
};

const TIERS = [
  {
    name: "Foundation",
    sub: "Self-service engine",
    price: "Free",
    desc: "The assessment funnel and programme engine, open to everyone. Run the two-minute intake, receive a validated weekly programme. No coaching relationship, no check-ins — just the system, applied to your inputs.",
    items: [
      "Full programme generation",
      "CNS-managed weekly split",
      "Fatigue-adaptive volume",
      "Injury substitutions",
      "No card required",
    ],
    accent: false,
  },
  {
    name: "Practice",
    sub: "Hybrid coaching",
    price: "$49 / mo",
    desc: "The engine running every week, with a practitioner reviewing outputs and managing progression. Weekly fatigue check-ins, deload timing, substitution decisions, and direct access for questions.",
    items: [
      "Everything in Foundation",
      "Weekly programme regeneration",
      "Practitioner review of each week",
      "Progression and deload management",
      "Check-in thread, 48h response time",
    ],
    accent: true,
  },
  {
    name: "Stewardship",
    sub: "Full case management",
    price: "$149 / mo",
    desc: "Full practitioner-to-athlete relationship. Movement quality assessment, sport-specific programming integration, and ongoing case management. Built for athletes with a performance target.",
    items: [
      "Everything in Practice",
      "Movement quality assessment",
      "Sport / competition periodisation",
      "Video review of primary lifts",
      "Priority response, 24h turnaround",
    ],
    accent: false,
  },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">

        {/* Hero */}
        <header className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <p className="kicker mb-6">About</p>
            <h1 className="mb-8 font-play text-[clamp(48px,6vw,80px)] font-black leading-[0.93] tracking-[-0.02em] text-ink">
              Deus Performance is an institution.{" "}
              <em className="font-normal italic text-warm">Not a person.</em>
            </h1>
            <p className="max-w-[580px] font-bask text-[18px] leading-[1.85] text-ink2">
              It does not follow trends, personalities, or preferences. It operates within a fixed set of physiological constraints and produces training programmes that meet every one of them — or returns an error rather than compromise.
            </p>
          </div>
        </header>

        {/* What it solves */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px] grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <p className="kicker mb-5">The problem</p>
              <h2 className="mb-7 font-play text-[clamp(30px,3.5vw,46px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
                Most AI-generated training is unconstrained pattern matching.
              </h2>
              <div className="flex flex-col gap-5 font-bask text-[16px] leading-[1.85] text-ink2">
                <p>
                  A language model reads your inputs and produces something plausible. Plausible means it looks like a training programme. It does not mean it satisfies the physiological requirements of a training programme. There is no check for CNS distribution. No requirement for movement pattern coverage. No deload logic. No injury accommodation beyond a best guess.
                </p>
                <p>
                  The result is training that is well-formatted but structurally unsound. The model is not wrong on purpose — it simply has no mechanism for being right in the ways that matter.
                </p>
              </div>
            </div>
            <div>
              <p className="kicker mb-5">The solution</p>
              <h2 className="mb-7 font-play text-[clamp(30px,3.5vw,46px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
                The deterministic engine runs before the model does.
              </h2>
              <div className="flex flex-col gap-5 font-bask text-[16px] leading-[1.85] text-ink2">
                <p>
                  Before any language model sees your intake, the engine computes the weekly structure: which days train, which sessions are High-CNS, what the volume budget is given your fatigue state, and which exercises are available given your injuries. The model does not decide any of this. It fills exercise slots within a structure the model cannot change.
                </p>
                <p>
                  After generation, a QC gate runs twelve independent checks. A programme that passes eleven checks is rejected the same as one that passes none. The standard is complete compliance — not approximate compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The model / tiers */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <p className="kicker mb-5">The model</p>
            <h2 className="mb-4 font-play text-[clamp(30px,3.5vw,46px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
              Three tiers. One engine.{" "}
              <em className="font-normal italic text-warm">The same rules.</em>
            </h2>
            <p className="mb-14 max-w-[580px] font-bask text-[16px] leading-[1.85] text-ink2">
              Every tier runs through the same deterministic engine and the same QC gate. The difference is the level of practitioner involvement — not the quality of the underlying system.
            </p>
            <div className="grid grid-cols-1 gap-px border border-line bg-line lg:grid-cols-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`flex flex-col p-8 ${tier.accent ? "bg-bg2" : "bg-bg"}`}
                >
                  <div className="mb-6 flex-1">
                    {tier.accent && (
                      <p className="mb-3 font-mono text-[8px] uppercase tracking-[0.22em] text-accent">
                        Most popular
                      </p>
                    )}
                    <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
                      {tier.sub}
                    </p>
                    <h3 className="mb-1 font-play text-[28px] font-black italic text-ink">
                      {tier.name}
                    </h3>
                    <p className="mb-5 font-mono text-[18px] font-medium text-accent">
                      {tier.price}
                    </p>
                    <p className="mb-5 text-[12px] leading-[1.8] text-ink3">
                      {tier.desc}
                    </p>
                    <ul className="flex flex-col gap-[7px]">
                      {tier.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 font-mono text-[10px] text-ink3">
                          <span className="mt-px text-accent" aria-hidden="true">—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={tier.name === "Foundation" ? "/apply" : "/apply"}
                    className={`mt-4 block text-center py-[12px] font-mono text-[10px] font-medium uppercase tracking-[0.14em] transition-opacity hover:opacity-80 ${
                      tier.accent
                        ? "bg-accent text-[#0b0f0c]"
                        : "border border-line2 text-ink3 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {tier.name === "Foundation" ? "Start free →" : "Apply →"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Operating entity */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px] grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="kicker mb-5">The operating entity</p>
              <h2 className="mb-7 font-play text-[clamp(30px,3.5vw,46px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
                Riz Management LLC
              </h2>
              <div className="flex flex-col gap-5 font-bask text-[16px] leading-[1.85] text-ink2">
                <p>
                  Deus Performance is operated by Riz Management LLC. The company was founded with a single premise: that the tools of high-performance coaching — the constraint logic, the periodisation models, the movement hierarchy — should be accessible to anyone willing to submit to the system.
                </p>
                <p>
                  The engine does not have a waiting list. It does not have a minimum commitment. It does not require a relationship before it will tell you the truth about your training inputs. The Foundation tier is free precisely because the barrier to evidence-based programming should not be access to the right coach.
                </p>
                <p>
                  The higher tiers exist for athletes who need more than a programme — who need progression management, competition timing, and a practitioner who will review what the engine produces and ensure it is applied correctly to their specific situation.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-0 self-start border border-line">
              <div className="border-b border-line bg-bg1 px-7 py-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
                  Contact
                </p>
              </div>
              {[
                ["Institution", "Deus Performance"],
                ["Operating entity", "Riz Management LLC"],
                ["Tagline", "The body is a gift. Train it accordingly."],
                ["Engine", "Constraint-driven adaptive training"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 border-b border-line bg-bg px-7 py-4 last:border-b-0">
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink3">
                    {k}
                  </span>
                  <span className="font-bask text-[13px] text-ink2">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center md:px-12">
          <p className="mb-3 font-play text-[16px] italic text-warm">Donum Dei.</p>
          <h2 className="mb-6 font-play text-[clamp(30px,4vw,52px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
            The assessment is free. The rules are not negotiable.
          </h2>
          <p className="mx-auto mb-10 max-w-[420px] font-bask text-[16px] leading-[1.85] text-ink2">
            Two minutes. A complete, validated week. No card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply" className="btn-primary">
              Start your free assessment →
            </Link>
            <Link href="/doctrine" className="btn-ghost">
              Read the doctrine
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
