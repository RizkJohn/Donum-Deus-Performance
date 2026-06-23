import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Doctrine",
  description:
    "The full Deus Performance methodology. The priority hierarchy, CNS management, the seven movement patterns, and why constraint beats improvisation.",
};

const HIERARCHY = [
  {
    rank: "I",
    name: "Joint Integrity",
    latin: "Integritas",
    body: "A damaged joint cannot express strength. It cannot produce power. It cannot be trained. Everything else on this list is downstream of it. The engine places joint health above every other objective — not as a precaution, but as a logical constraint. You cannot build on a broken foundation.",
  },
  {
    rank: "II",
    name: "Movement Quality",
    latin: "Qualitas",
    body: "Pattern before load. A squat performed poorly under weight does not build a stronger squat — it builds a stronger fault. Every session begins with a movement preparation block precisely because quality decays under fatigue and accumulates only through rehearsal. The engine enforces a warmup before any loaded work. It is not optional.",
  },
  {
    rank: "III",
    name: "Strength",
    latin: "Fortitudo",
    body: "Force production, expressed safely and progressively. Strength is not a peak-and-fade quality — it compounds across training ages if the load is managed. The engine steps loads forward in measured increments: 2.5% for upper body, 5% for lower. When the data says hold, it holds. Progress is a flag computed from your fatigue state, not a feeling.",
  },
  {
    rank: "IV",
    name: "Work Capacity",
    latin: "Capacitas",
    body: "The engine beneath everything else. Aerobic base, lactate threshold, conditioning — the qualities that allow you to sustain effort, recover between sets, and maintain technique under load. Work capacity does not appear in every session. It appears where the programme can accommodate it without compromising the structure above it.",
  },
  {
    rank: "V",
    name: "Hypertrophy",
    latin: "Augmentum",
    body: "Tissue, built as a consequence of the work above it — not as the primary goal. Muscle grows when recovery is sufficient, movement quality is consistent, and load is progressively managed. Chasing hypertrophy in isolation, at the expense of the four objectives above it, is the source of most overuse injuries in recreational training.",
  },
  {
    rank: "VI",
    name: "Sport / Skill",
    latin: "Ars",
    body: "The expression of all the qualities above it in the context of a specific demand. Sport performance is last not because it is unimportant — it is often the reason someone trains — but because it cannot be built on an unstable foundation. An athlete with poor joint integrity and inadequate work capacity does not perform better because they practised their sport more. They get injured faster.",
  },
];

const PATTERNS = [
  {
    id: "squat",
    name: "Squat",
    desc: "Knee-dominant loading through full range. The foundation of lower-body strength and athletic power.",
  },
  {
    id: "hinge",
    name: "Hinge",
    desc: "Hip-dominant loading through a long lever. Posterior chain development, hamstring integrity, and power transfer.",
  },
  {
    id: "push_h",
    name: "Horizontal Push",
    desc: "Force production in the transverse plane. Chest, shoulder, and tricep development through pressing mechanics.",
  },
  {
    id: "push_v",
    name: "Vertical Push",
    desc: "Overhead force production. Shoulder stability, rotator cuff health, and overhead strength.",
  },
  {
    id: "pull_h",
    name: "Horizontal Pull",
    desc: "Scapular retraction and posterior chain upper body. Essential counterbalance to horizontal push volume.",
  },
  {
    id: "pull_v",
    name: "Vertical Pull",
    desc: "Lat engagement and shoulder depression. Foundational for upper body force production and posture.",
  },
  {
    id: "rotation",
    name: "Rotation / Anti-Rotation",
    desc: "Trunk stiffness and rotational power. The core as a force-transfer mechanism, not a cosmetic feature.",
  },
  {
    id: "carry",
    name: "Carry / Locomotion",
    desc: "Loaded movement under time and distance. Grip, trunk stability, and structural resilience.",
  },
  {
    id: "jump",
    name: "Jump",
    desc: "Rate of force development and landing mechanics. Power expression and neuromuscular readiness.",
  },
];

export default function DoctrinePage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">

        {/* Hero */}
        <header className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <p className="kicker mb-6">The Doctrine</p>
            <h1 className="mb-8 font-play text-[clamp(48px,6vw,80px)] font-black leading-[0.93] tracking-[-0.02em] text-ink">
              The body is governed{" "}
              <em className="font-normal italic text-warm">by laws.</em>
            </h1>
            <p className="max-w-[580px] font-bask text-[18px] leading-[1.85] text-ink2">
              Most training fails not because the effort is lacking but because the structure is wrong. Deus Performance does not optimise effort. It enforces correct structure — a fixed hierarchy of objectives, hard rules for load management, and a system that refuses to deliver a programme it cannot stand behind.
            </p>
          </div>
        </header>

        {/* The Premise */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px] grid grid-cols-1 gap-16 lg:grid-cols-[1fr_480px]">
            <div>
              <p className="kicker mb-5">The premise</p>
              <h2 className="mb-7 font-play text-[clamp(32px,4vw,52px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
                A system that cannot improvise is better than a coach who can do anything.
              </h2>
              <div className="flex flex-col gap-5 font-bask text-[16px] leading-[1.85] text-ink2">
                <p>
                  Improvisation is the source of most training errors. High load because you are feeling good. Skipping the mobility block because it is boring. Programming the bench press three times because you enjoy it. Skipping the deload because you cannot afford to lose a week.
                </p>
                <p>
                  The engine does not care what you enjoy. It cares what the inputs say and what the rules require. It has no ego invested in any particular exercise selection. It does not know what is fashionable. It applies the same hierarchy to every intake, every time.
                </p>
                <p>
                  This is not a limitation. It is the point. A well-specified constraint system produces more consistent outcomes than a talented human who is occasionally inconsistent — which is all humans, under pressure, over time.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-px border border-line bg-line">
              {[
                ["The engine enforces the rules.", "It does not negotiate them."],
                ["Your goals are an input.", "The hierarchy is a constant."],
                ["A failed QC check returns nothing.", "Not a degraded programme — nothing."],
                ["Unsatisfiable constraints", "are returned as an error, not ignored."],
              ].map(([a, b]) => (
                <div key={a} className="bg-bg px-6 py-5">
                  <p className="mb-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink">
                    {a}
                  </p>
                  <p className="text-[11px] leading-[1.7] text-ink3">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Objective hierarchy */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <p className="kicker mb-5">The hierarchy</p>
            <h2 className="mb-4 font-play text-[clamp(32px,4vw,52px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
              Six objectives. One order.{" "}
              <em className="font-normal italic text-warm">Never reordered.</em>
            </h2>
            <p className="mb-14 max-w-[600px] font-bask text-[16px] leading-[1.85] text-ink2">
              This is not a framework we invented. It is the sequence your physiology already operates on. Violate it and you get injured, then weaker, then slower. The engine enforces it as a hard constraint — no goal input overrides the hierarchy.
            </p>
            <div className="flex flex-col gap-px bg-line border border-line">
              {HIERARCHY.map((h) => (
                <div key={h.rank} className="grid grid-cols-1 gap-0 bg-bg lg:grid-cols-[200px_1fr]">
                  <div className="flex flex-col justify-center gap-1 border-b border-line bg-bg1 px-7 py-6 lg:border-b-0 lg:border-r">
                    <span className="font-play text-[40px] font-black italic leading-none text-line2">
                      {h.rank}
                    </span>
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
                      {h.name}
                    </span>
                    <span className="font-play text-[13px] italic text-warm">
                      {h.latin}
                    </span>
                  </div>
                  <div className="px-7 py-6">
                    <p className="font-bask text-[15px] leading-[1.85] text-ink2">
                      {h.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CNS Management */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px] grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <p className="kicker mb-5">CNS management</p>
              <h2 className="mb-7 font-play text-[clamp(30px,3.5vw,46px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
                Your nervous system has a budget. Most programmes do not account for it.
              </h2>
              <div className="flex flex-col gap-5 font-bask text-[16px] leading-[1.85] text-ink2">
                <p>
                  High-CNS training — heavy compound lifts, maximal velocity work, power expressions — draws on a different reservoir than high-volume accessory work. You can train hard on consecutive days if the CNS demand is low. You cannot recover from back-to-back heavy sessions at the same rate you recover from volume work.
                </p>
                <p>
                  The engine enforces a dynamic budget: at most two High-CNS days per week under normal conditions, reduced to one when your fatigue state is high. No two High-CNS days can be scheduled consecutively. The day before any competition or sport day is always Low-CNS — the engine ensures you arrive fresh.
                </p>
                <p>
                  This is not conservative programming. It is accurate programming. The stimulus from a High-CNS session accumulates for 48–72 hours. Ignoring this does not make you harder. It makes your next session less effective and the one after that worse still.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-0 border border-line">
              <div className="border-b border-line bg-bg1 px-7 py-5">
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
                  CNS budget rule
                </p>
                <p className="font-play text-[22px] font-black italic text-ink">
                  Dynamic, not fixed
                </p>
              </div>
              {[
                { label: "Fatigue state: Low / Moderate", value: "Max 2 High-CNS days", color: "text-accent" },
                { label: "Fatigue state: High (score ≥ 4.0)", value: "Max 1 High-CNS day", color: "text-warm" },
                { label: "Consecutive High days", value: "Never permitted", color: "text-danger" },
                { label: "Day before sport / competition", value: "Always Low CNS", color: "text-ink3" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between border-b border-line bg-bg px-7 py-4 last:border-b-0">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink3">
                    {label}
                  </span>
                  <span className={`font-mono text-[10px] font-medium uppercase tracking-[0.1em] ${color}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seven Patterns */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <p className="kicker mb-5">The patterns</p>
            <h2 className="mb-4 font-play text-[clamp(30px,3.5vw,46px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
              Nine patterns. Every week.{" "}
              <em className="font-normal italic text-warm">Without exception.</em>
            </h2>
            <p className="mb-12 max-w-[600px] font-bask text-[16px] leading-[1.85] text-ink2">
              Muscle-group splits are an organisational convenience, not a physiological principle. The body is not a collection of muscles to be targeted in sequence — it is a system of movement patterns that must all be trained to remain capable. The engine enforces coverage of all nine patterns across every training week, regardless of how many sessions that week contains.
            </p>
            <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {PATTERNS.map((p) => (
                <div key={p.id} className="bg-bg p-6 hover:bg-bg1 transition-colors">
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
                    {p.id.replace("_", " ")}
                  </p>
                  <h3 className="mb-2 font-play text-[20px] font-black italic text-ink">
                    {p.name}
                  </h3>
                  <p className="text-[11px] leading-[1.8] text-ink3">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Constraint Advantage */}
        <section className="border-b border-line px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1180px] grid grid-cols-1 gap-16 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="kicker mb-5">The constraint advantage</p>
              <h2 className="mb-7 font-play text-[clamp(30px,3.5vw,46px)] font-black leading-[0.96] tracking-[-0.02em] text-ink">
                Hard rules produce more consistent outcomes than flexible guidelines.
              </h2>
              <div className="flex flex-col gap-5 font-bask text-[16px] leading-[1.85] text-ink2">
                <p>
                  A QC gate runs on every programme the engine produces. Twelve checks, every time. If any check fails — wrong CNS distribution, missing a movement pattern, incorrect progression flag, an exercise not in the approved library — the engine retries. It does not produce a programme that passes nine of twelve checks and calls it good enough. The standard is twelve of twelve, or nothing.
                </p>
                <p>
                  On the third failed attempt, the engine returns <span className="font-mono text-[13px] text-warm">UNSATISFIABLE_CONSTRAINTS</span> with the specific conflict. This is not a failure mode. It is the system working correctly. A programme built from contradictory inputs is not a programme — it is an approximation that papers over a real problem. The engine surfaces the problem instead of hiding it.
                </p>
                <p>
                  The result is a system that cannot be argued with, cannot be flattered, and cannot make the comfortable choice when the correct one is harder. That is not a limitation. It is the feature.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="border border-line bg-bg1 p-7">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
                  QC gate — 12 checks
                </p>
                <ul className="flex flex-col gap-[6px]">
                  {[
                    "Schema validity",
                    "CNS limits (dynamic budget)",
                    "Pre-sport Low CNS",
                    "Movement coverage (9 patterns)",
                    "Block order",
                    "Library-only exercises",
                    "Volume cap (≤8 / session)",
                    "Intensity safety (1–3 RIR)",
                    "Fatigue volume applied",
                    "Progression flag correct",
                    "Plan adherence",
                    "Injury blocks respected",
                  ].map((check) => (
                    <li key={check} className="flex items-center gap-3 font-mono text-[10px] text-ink3">
                      <span className="text-accent" aria-hidden="true">—</span>
                      {check}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/apply" className="btn-primary text-center">
                Run the engine →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center md:px-12">
          <p className="kicker mb-4 justify-center">Start here</p>
          <h2 className="mb-6 font-play text-[clamp(32px,4vw,56px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
            Two minutes.{" "}
            <em className="font-normal italic text-warm">One complete week.</em>
          </h2>
          <p className="mx-auto mb-10 max-w-[480px] font-bask text-[16px] leading-[1.85] text-ink2">
            The assessment takes less than two minutes. The engine applies everything on this page to your inputs and returns a complete, validated weekly programme. No card required.
          </p>
          <Link href="/apply" className="btn-primary">
            Start your free assessment →
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
