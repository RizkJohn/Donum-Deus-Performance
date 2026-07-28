import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Methodology — Donum Dei Performance",
  description:
    "Six principles of program construction. CNS management, movement inventory, session architecture, and constraint-first training design.",
};

const PRINCIPLES = [
  {
    n: "i.",
    title: "CNS Management",
    body: "A maximum of two high-demand sessions per week. No consecutive high-output days. Conditioning is never permitted to impair the strength work it nominally supports. The nervous system is treated as a finite resource — not a training target.",
  },
  {
    n: "ii.",
    title: "Movement Inventory",
    body: "Every weekly cycle must contain a squat pattern, a hinge pattern, horizontal push and pull, vertical push and pull, rotation or anti-rotation, and gait or carry. Any pattern absent from the week is a gap. Gaps are corrected before delivery.",
  },
  {
    n: "iii.",
    title: "Session Architecture",
    body: "Warmup, power expression (when appropriate), strength, accessory work, core, and mobility cooldown. The sequence is fixed by logic. Volume within each block is calibrated to the practitioner's current state. Redundant work is removed.",
  },
  {
    n: "iv.",
    title: "State-Adaptive Volume",
    body: "Three states are recognized: progress, maintain, deload. The program is built to the current state, not the desired one. Volume is reduced before intensity. Conditioning is removed before accessories. The hierarchy of reduction is fixed.",
  },
  {
    n: "v.",
    title: "Schedule Anchoring",
    body: "High-demand sessions are placed furthest from the practitioner's highest-obligation days. Lower-body and rotational stress are never stacked in adjacent sessions. The training week is structured around the practitioner's life, not against it.",
  },
  {
    n: "vi.",
    title: "Constraint-First Construction",
    body: "A program is not generated and then checked. It is built from resolved constraints outward. Every exercise, every volume prescription, every rest interval has a reason. Nothing is present because it was the nearest available option.",
  },
];

const PROCESS = [
  {
    n: "01",
    title: "Assessment",
    desc: "Profile, objectives, schedule density, and current state evaluated. No ambiguous inputs accepted.",
  },
  {
    n: "02",
    title: "Directive",
    desc: "Training state classified. Fatigue index computed. Progression direction, movement priorities, and constraints resolved.",
  },
  {
    n: "03",
    title: "Construction",
    desc: "Weekly structure and daily sessions built from directives. Exercise selection scored against novelty, fatigue cost, and equipment.",
  },
  {
    n: "04",
    title: "Delivery",
    desc: "Complete program delivered. Every constraint satisfied before it reaches you. Print or export as PDF.",
  },
];

export default function MethodologyPage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        {/* Header */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">Methodology</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[22px] text-ink max-w-[700px]"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Six <em className="text-warm">principles</em> of program
            construction.
          </h1>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] max-w-[620px]">
            The mind is trained first; the body follows. But conviction is not a
            method — every program produced by this institution is a structured
            weekly training system resolved against a fixed set of constraints.
            No session is delivered unless all constraints are satisfied.
          </p>
        </section>

        {/* Principles grid */}
        <div className="border-t border-line">
          <div className="mx-auto max-w-[1300px] px-5 py-[40px] md:px-[52px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line">
              {PRINCIPLES.map((p) => (
                <div key={p.n} className="bg-bg p-[24px] md:p-[28px]">
                  <div className="font-play italic text-[32px] text-line2 mb-[10px] leading-[1]">
                    {p.n}
                  </div>
                  <div className="font-mono font-medium text-[10px] uppercase tracking-[0.11em] mb-[10px] text-ink">
                    {p.title}
                  </div>
                  <p className="font-bask text-[13px] text-ink2 leading-[1.85]">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">The Process</div>
          <h2
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[28px] text-ink"
            style={{ fontSize: "clamp(26px, 3.5vw, 48px)" }}
          >
            From assessment <em className="text-warm">to program.</em>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {PROCESS.map((step) => (
              <div key={step.n} className="bg-bg p-[22px] md:p-[28px]">
                <div className="font-play italic text-[40px] text-line2 mb-[6px] leading-[1]">
                  {step.n}
                </div>
                <div className="font-mono font-medium text-[10px] uppercase tracking-[0.1em] text-ink mb-[8px]">
                  {step.title}
                </div>
                <p className="font-bask text-[13px] text-ink2 leading-[1.85]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="border-t border-line px-5 py-[44px] text-center md:px-[52px]">
          <p className="font-bask text-[14px] text-ink2 mb-[20px] leading-[1.8]">
            The methodology does not vary by level of engagement. What differs is
            the depth of oversight.
          </p>
          <div className="flex flex-col sm:flex-row gap-[14px] items-center justify-center">
            <Link href="/assess" className="btn-primary">
              Begin the Assessment
            </Link>
            <Link href="/curriculum" className="btn-ghost">
              View the Curriculum →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
