import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Curriculum — Deus Performance",
  description:
    "Three levels of engagement: Foundation ($27/mo), Practice ($87/mo), Stewardship ($197/mo). The methodology does not vary by level.",
};

const LEVELS = [
  {
    level: "Level I",
    name: "Foundation",
    desc: "A complete programme, delivered for independent execution.",
    fee: "27",
    period: "Per month · No minimum term",
    featured: false,
    featuredLabel: null,
    includes: [
      "Programme constructed from your intake profile",
      "Rebuild on demand when your state or schedule changes",
      "Full weekly structure and daily session detail",
      "Movement notes and substitution library",
      "Print and PDF export",
      "Written correspondence — 48-hour response",
    ],
    tier: "foundation",
  },
  {
    level: "Level II",
    name: "Practice",
    desc: "Foundation, with direct oversight and monthly programme review.",
    fee: "87",
    period: "Per month · No minimum term",
    featured: true,
    featuredLabel: "Most selected",
    includes: [
      "Everything in Foundation",
      "Monthly 45-minute review with Deus Performance",
      "Weekly movement review via video submission",
      "Substitutions built for specific restrictions",
      "In-cycle programme adjustments between rebuilds",
      "Priority correspondence — 24-hour response",
    ],
    tier: "practice",
  },
  {
    level: "Level III",
    name: "Stewardship",
    desc: "A full engagement structured around the practitioner's entire life.",
    fee: "197",
    period: "Per month · Six-month minimum",
    featured: false,
    featuredLabel: null,
    includes: [
      "Everything in Practice",
      "Weekly 30-minute consultation",
      "Daily correspondence — 12-hour response",
      "Quarterly assessment and full programme recalibration",
      "Travel, event, and peak-output cycle planning",
      "Injury, setback, and return-to-practice management",
    ],
    tier: "stewardship",
  },
];

export default function CurriculumPage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        {/* Header */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">Curriculum</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[22px] text-ink max-w-[600px]"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Three levels of <em className="text-warm">engagement.</em>
          </h1>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] max-w-[600px]">
            The methodology does not vary by level. The doctrine does not vary by
            level. What differs is the depth of the relationship between the
            practitioner and the practice — and accordingly, the degree of direct
            oversight that relationship requires.
          </p>
        </section>

        {/* Levels */}
        <div className="border-t border-line">
          <div className="mx-auto max-w-[1300px] px-5 py-[40px] md:px-[52px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line">
              {LEVELS.map((l) => (
                <div
                  key={l.level}
                  className="flex flex-col p-[24px] md:p-[32px] relative"
                  style={{ background: l.featured ? "var(--bg1)" : "var(--bg)" }}
                >
                  {l.featuredLabel && (
                    <div className="absolute top-0 right-0 bg-accent font-mono text-[7px] tracking-[0.18em] uppercase px-[10px] py-[5px]"
                         style={{ color: "#f3efe8" }}>
                      {l.featuredLabel}
                    </div>
                  )}
                  <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-accent mb-[6px]">
                    {l.level}
                  </div>
                  <div className="font-play font-normal text-[26px] text-ink mb-[6px] leading-[1.1]">
                    {l.name}
                  </div>
                  <p className="font-bask text-[13px] text-ink2 leading-[1.7] mb-[20px]">
                    {l.desc}
                  </p>
                  <div className="mb-[4px]">
                    <span className="font-play font-normal text-[42px] text-ink leading-[1]">
                      <span className="text-[22px] text-ink3 align-top mt-[8px] inline-block">$</span>
                      {l.fee}
                    </span>
                  </div>
                  <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 mb-[24px]">
                    {l.period}
                  </div>
                  <ul className="flex flex-col gap-[9px] mb-[28px] flex-1">
                    {l.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-[8px]">
                        <span className="text-accent mt-[2px] flex-shrink-0 font-mono text-[10px]">
                          ✓
                        </span>
                        <span className="font-bask text-[12px] text-ink2 leading-[1.6]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/assess?tier=${l.tier}`}
                    className="btn-primary text-center w-full"
                    style={{ fontSize: "10px", padding: "11px 20px" }}
                  >
                    Apply — {l.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Uncertainty note */}
        <div className="mx-auto max-w-[1300px] px-5 py-[28px] md:px-[52px]">
          <div className="border border-line bg-bg1 p-[24px] text-center max-w-[760px] mx-auto">
            <p className="font-bask italic text-[14px] text-ink3 mb-[14px]">
              Uncertain which level of engagement is appropriate for your
              situation?
            </p>
            <Link href="/correspondence" className="btn-ghost">
              Submit a correspondence →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
