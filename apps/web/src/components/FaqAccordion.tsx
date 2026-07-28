"use client";

import { useState } from "react";

type FaqItem = {
  q: string;
  a: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What does philosophy have to do with training?",
    a: "Everything that a training plan alone cannot reach. The mechanical problems of programming — load, volume, recovery — are solved. The problems that actually stall athletes are not mechanical: governing what you cannot control, sustaining effort without motivation, performing without forcing, holding a standard no one is watching. The Stoics, existentialists, and Eastern traditions worked these out over two thousand years. The methodology is physical; the framework beneath it is not. The Dispatches set out the connection in full.",
  },
  {
    q: "What distinguishes this institution from a generic coaching application?",
    a: "Generic applications produce templates. This institution produces programs through a two-stage process: an assessment engine first classifies the practitioner's training state, producing a structured directive — training phase, fatigue index, progression direction, movement priorities. That directive is then used to construct the sessions. No two intake profiles produce the same output.",
  },
  {
    q: "Is access to a training facility required?",
    a: "No. The intake captures equipment context — full facility, dumbbells only, or minimal setup — and exercise selection is adapted accordingly. The movement patterns required by the methodology remain intact regardless of available equipment.",
  },
  {
    q: "How is injury or physical restriction handled?",
    a: "Restrictions entered during intake are translated into exclusion criteria. The construction engine routes around them. For complex, post-surgical, or chronic presentations, the Practice or Stewardship level is the appropriate entry point — those levels include direct correspondence and oversight that cannot be substituted by automated constraint resolution alone.",
  },
  {
    q: "How frequently should the program be rebuilt?",
    a: "Rebuild when the practitioner's state changes materially: schedule shifts, significant fatigue accumulation, return from a deload, or six to eight weeks of continuous work in the current block. Foundation practitioners rebuild on demand. Practice and Stewardship practitioners receive in-cycle adjustments as part of their level of engagement.",
  },
  {
    q: "What conditioning methods are used?",
    a: "Short-duration, purpose-directed work: loaded carries, kettlebell or dumbbell circuits, tempo work, and bodyweight complexes. All conditioning is 10–25 minutes in duration and selected to protect the strength work, not impair it. Long-duration steady-state work is not prescribed unless it is an explicit objective of the practitioner.",
  },
  {
    q: "What is the minimum term for each level?",
    a: "Foundation and Practice carry no minimum term. Stewardship requires a six-month commitment. Structural adaptation does not compound meaningfully over shorter horizons, and the Stewardship level is designed specifically for long-horizon development. After the initial period, engagement continues month to month or transitions to a lower level.",
  },
  {
    q: "Does this institution provide medical or rehabilitation advice?",
    a: "No. Donum Dei Performance is a practice of performance education. It does not constitute medical advice, rehabilitation guidance, or clinical counsel of any kind. Practitioners with active medical conditions should consult a licensed clinician before enrolling in any program.",
  },
  {
    q: "Who administers the program?",
    a: "Donum Dei Performance operates as an independent practice. All program delivery, correspondence, and review is handled through the institution. For any inquiry outside the scope of this reference, use the Correspondence page.",
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border-b border-line">
          <button
            className="w-full flex items-center justify-between gap-4 py-[16px] text-left cursor-pointer bg-transparent border-none group"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            aria-expanded={openIdx === i}
          >
            <span className="font-bask text-[14px] text-ink leading-[1.6] group-hover:text-accent transition-colors">
              {item.q}
            </span>
            <span
              className="font-mono text-[18px] text-ink3 flex-shrink-0 leading-none transition-transform duration-200"
              style={{ transform: openIdx === i ? "rotate(45deg)" : "none" }}
              aria-hidden="true"
            >
              +
            </span>
          </button>
          {openIdx === i && (
            <div className="pb-[18px] pr-[28px]">
              <p className="font-bask text-[13px] text-ink2 leading-[1.85]">
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
