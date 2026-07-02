"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How is this different from a template app?",
    a: "Template apps assign you a pre-written plan and rename it. Deus generates your week from your actual constraints — schedule, sport days, fatigue, injuries — and every program must pass a hard quality-control gate before you see it: nervous-system load limits, complete movement coverage, fixed block order, no training to failure on primary lifts. If a valid program cannot be built from your constraints, the engine says so rather than handing you a compromised one.",
  },
  {
    q: "What if I'm injured?",
    a: "You declare injury sites in the assessment, and the engine resolves them through a fixed substitution map — each blocked exercise swaps to an approved alternative that preserves the same movement pattern and the same nervous-system cost. Your week stays complete; the irritated joint stays out of the line of fire. Deus is not medical care: train within the guidance of your physician or physical therapist.",
  },
  {
    q: "What equipment do I need?",
    a: "A reasonably equipped gym covers everything. If a prescribed exercise is unavailable to you, the substitution system replaces it with an approved alternative in the same movement pattern — the structure of the week never degrades to fill a gap.",
  },
  {
    q: "How does fatigue actually change my program?",
    a: "Each week you report a fatigue score from one to five. Below 3.0 the program runs as planned. From 3.0 the engine begins moderating. At 4.0 and above, volume is cut by roughly thirty percent while intensity is preserved — you keep the quality of the stimulus and shed its cost. The response is deterministic: the same inputs always produce the same adjustment.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Every tier is month-to-month with no contract and no cancellation fee. The assessment itself is free and requires no card — you see a real program before any commitment.",
  },
  {
    q: "Who builds the programs — a person or a machine?",
    a: "Both, by design. Deterministic rules decide everything that touches safety: training-day split, nervous-system distribution, volume budget, movement coverage, progression and deload flags. A language model fills exercise selections inside that frame, and the result is re-validated against every rule. On the Practice and Stewardship tiers, a human coach reviews and refines on top.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-line bg-bg1 px-6 py-24 md:px-12 scroll-mt-[60px]">
      <div className="mx-auto max-w-[900px]">
        <p className="kicker mb-4">Questions</p>
        <h2 className="font-play text-[clamp(32px,4vw,52px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
          Asked, <em className="font-normal italic text-warm">answered.</em>
        </h2>
        <div className="mt-11 border-t border-line">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-[22px] py-5 text-left font-mono text-[12px] font-medium uppercase tracking-[0.06em] text-ink transition-colors hover:text-accent"
                  >
                    {f.q}
                    <span
                      aria-hidden="true"
                      className={`shrink-0 font-play text-[22px] leading-none text-warm transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  hidden={!isOpen}
                  className="pb-[22px] font-bask text-[15px] leading-[1.8] text-ink3"
                >
                  {f.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
