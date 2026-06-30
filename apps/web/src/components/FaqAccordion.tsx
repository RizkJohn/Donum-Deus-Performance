"use client";

import { useState } from "react";

type FaqItem = {
  q: string;
  a: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What does philosophy have to do with training?",
    a: "Everything a training plan alone can't reach. The mechanical problems — load, volume, recovery — are solved. What actually stalls athletes isn't mechanical: governing what you can't control, sustaining effort without motivation, performing without forcing, holding a standard no one's watching. The Stoics, existentialists, and Eastern traditions worked this out over two thousand years. The methodology is physical; the framework underneath it isn't. The Dispatches lay out the full connection.",
  },
  {
    q: "What makes this different from a generic coaching app?",
    a: "Generic apps produce templates. We produce programmes through a two-stage process: an assessment engine classifies your training state into a structured directive — training phase, fatigue index, progression direction, movement priorities. That directive builds the sessions. No two intake profiles produce the same output.",
  },
  {
    q: "Is access to a training facility required?",
    a: "No. The intake captures your equipment — full facility, dumbbells only, or minimal setup — and exercise selection adapts to it. The required movement patterns stay intact regardless of what you have access to.",
  },
  {
    q: "How is injury or physical restriction handled?",
    a: "Restrictions entered at intake become exclusion criteria. The engine routes around them. For complex, post-surgical, or chronic cases, Practice or Stewardship is the right entry point — those levels include direct correspondence and oversight that automation alone can't replace.",
  },
  {
    q: "How frequently should the programme be rebuilt?",
    a: "Rebuild when your state changes materially: a schedule shift, a fatigue spike, coming off a deload, or six to eight weeks in the same block. Foundation members rebuild on demand. Practice and Stewardship members get in-cycle adjustments built into their level.",
  },
  {
    q: "What conditioning methods are used?",
    a: "Short, purpose-built work: loaded carries, kettlebell or dumbbell circuits, tempo work, bodyweight complexes. All of it runs 10–25 minutes and is chosen to protect the strength work, not undercut it. Long steady-state work only shows up if it's an explicit goal of yours.",
  },
  {
    q: "What is the minimum term for each level?",
    a: "Foundation and Practice have no minimum term. Stewardship requires six months. Structural adaptation doesn't compound meaningfully on shorter horizons — Stewardship is built for the long game. After that, it runs month to month or steps down a level.",
  },
  {
    q: "Do you provide medical or rehabilitation advice?",
    a: "No. Deus Performance is performance education — not medical advice, rehabilitation guidance, or clinical counsel of any kind. If you have an active medical condition, consult a licensed clinician before starting any programme.",
  },
  {
    q: "Who administers the programme?",
    a: "Deus Performance operates as an independent practice. We handle all programme delivery, correspondence, and review directly. For anything outside this reference, use the Correspondence page.",
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
