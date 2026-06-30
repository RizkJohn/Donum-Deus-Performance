import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Philosophy — Deus Performance",
  description:
    "Why we exist. Performance education grounded in Stoicism, Existentialism, Eastern philosophy, and Greek Virtue Ethics.",
};

const SCHOOLS = [
  {
    idx: "i · Stoicism",
    name: "The Dichotomy of Control",
    greek: "prohairesis — the faculty of choice",
    body: "The result was never yours to own — the clock, the podium, the verdict of others. What's yours is the rep you didn't skip, the breath you governed, the standard you held when no one was watching. Master the input. Release the outcome. The Stoics built a discipline on that one division — and it's the only game you can actually win.",
    figures: "Epictetus · Marcus Aurelius · Seneca",
  },
  {
    idx: "ii · Existentialism",
    name: "Meaning in the Effort",
    greek: "amor fati — love of one's fate",
    body: "Everyone wants the result. Nietzsche demanded something harder: love the fate that produces it — the dawn sessions no one applauds, the plateaus that test your patience, the setbacks that expose your character. Not tolerate the grind. Want it. The athlete who loves the work never runs out of reasons to show up.",
    figures: "Nietzsche · Sartre · Camus · Frankl",
  },
  {
    idx: "iii · Eastern Philosophy",
    name: "Effortless Action",
    greek: "wú wéi — acting without forcing",
    body: "Wu wei isn't passivity. It's what's left when training runs so deep that execution stops being a decision. Forcing creates tension. Tension creates error. Error kills performance. You can't grip your way to a personal best. The practice gets drilled until it disappears — so on the day, you trust it and let the result come.",
    figures: "Laozi · Zhuangzi · Zen tradition",
  },
  {
    idx: "iv · Greek Virtue Ethics",
    name: "Excellence as a Way of Being",
    greek: "aretē — excellence · eudaimonia — flourishing",
    body: "Arete was never a medal. It was the full, consistent expression of your highest capability — in how you train, how you rest, how you show up when no one's watching. Eudaimonia, human flourishing, gets built across thousands of unseen decisions. Build the person, and the results follow. Your pursuit isn't a season. It's a standard.",
    figures: "Aristotle · the Hellenic tradition",
  },
];

const COMMITMENTS = [
  {
    n: "i.",
    title: "Structure Before Load",
    body: "Joint integrity is the non-negotiable first priority of every programme. It's not a constraint on development — it's the precondition for it. Skip it, and every rep after just compensates for what the structure can't support.",
  },
  {
    n: "ii.",
    title: "Built From First Principles",
    body: "Every programme is built from your actual inputs: age, body composition, schedule, fatigue state, movement restrictions, goals. No template. No default filling in what wasn't examined.",
  },
  {
    n: "iii.",
    title: "Intelligent Overload Only",
    body: "The programme tells the difference between productive stress — the kind that drives adaptation — and accumulated damage. Volume adjusts to your current state. Progression only happens when the conditions for it exist.",
  },
  {
    n: "iv.",
    title: "The Decades Are the Measure",
    body: "Every decision made today is an investment in your capacity twenty years out. That horizon is what separates developing a body from burning through one.",
  },
];

const REFUSALS = [
  "Present a template as a custom programme. If the intake doesn't change the output, the intake is theater and the output is dishonest.",
  "Prescribe volume that trades joint integrity for short-term performance. The structural cost always gets paid. Only the timing is uncertain.",
  "Disregard fatigue state. A programme that can't adapt to where you are today is a schedule, not a programme. Schedules don't build anything that matters.",
  "Let conditioning undermine the strength work it's supposed to complement. Everything in a session costs fatigue. Only spend it where the return matches.",
];

export default function PhilosophyPage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        {/* Header */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">Philosophy</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[22px] text-ink max-w-[700px]"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Why this institution <em className="text-warm">exists.</em>
          </h1>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] max-w-[620px]">
            Performance education got reduced to a product category. Templates
            get sold as precision. Volume gets sold as care. Generic output
            gets sold as personalisation. We exist to fight every part of
            that.
          </p>
        </section>

        {/* Etymology */}
        <div className="border-t border-b border-line" style={{ background: "var(--bg1)" }}>
          <div className="mx-auto max-w-[1300px] px-5 py-[40px] md:px-[52px]">
            <div className="font-mono text-[8px] tracking-[0.24em] uppercase text-ink3 mb-[22px]">
              Etymology · What the name actually means
            </div>
            <div className="flex flex-col gap-[1px] bg-line max-w-[860px]">
              {[
                {
                  word: "corpus",
                  pos: "Latin noun · neuter · third declension",
                  meaning: "The body; given freely, without prior obligation",
                  note: "The body is given freely. But a gift still carries weight — receiving it creates a debt of respect toward what the giver intended. Treat it carelessly, and that's not neutral. That's refusal.",
                },
                {
                  word: "deus",
                  pos: "Latin noun · masculine · second declension · from Proto-Indo-European *dyew-",
                  meaning: "God; the divine, originating source",
                  note: "Root of deity, divine, divinity. Deus puts the source above both the gift and the one who receives it. The capacity in your body wasn't built by you. It arrived through something bigger than your authorship.",
                },
              ].map((row) => (
                <div
                  key={row.word}
                  className="bg-bg flex flex-col sm:flex-row items-stretch"
                >
                  <div className="sm:min-w-[130px] sm:border-r border-b sm:border-b-0 border-line px-[17px] py-[13px] font-play italic text-[22px] text-warm flex items-center flex-shrink-0">
                    {row.word}
                  </div>
                  <div className="px-[17px] py-[13px]">
                    <div className="font-mono text-[7px] tracking-[0.2em] uppercase text-ink3 mb-[4px]">
                      {row.pos}
                    </div>
                    <div className="font-mono font-medium text-[11px] text-ink mb-[5px]">
                      {row.meaning}
                    </div>
                    <div className="text-[11px] text-ink3 leading-[1.65]">
                      {row.note}
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-bg2 px-[17px] py-[16px]">
                <div className="font-play italic text-[20px] text-accent mb-[6px]">
                  deus dedit
                </div>
                <div className="font-bask italic text-[13px] text-ink2 leading-[1.7] max-w-[620px]">
                  God has given. A statement of origin that's also a statement
                  of responsibility. If the body is a gift, training it is a
                  moral question, not just a technical one. Our answer:
                  structured, intelligent, long-horizon development. The name
                  is the doctrine.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Founding premise accent band */}
        <div
          className="px-5 py-[44px] md:px-[52px]"
          style={{ background: "var(--accent)" }}
        >
          <div className="mx-auto max-w-[860px]">
            <p
              className="font-bask italic leading-[1.7] mb-[14px]"
              style={{ fontSize: "clamp(15px, 2.2vw, 22px)", color: "rgba(243,239,232,0.9)" }}
            >
              &ldquo;Most people don&apos;t fail from lack of effort. They
              fail because no one built a system around their actual life —
              their schedule, their body, their current state.{" "}
              <strong className="not-italic font-bold" style={{ color: "#f3efe8" }}>
                That&apos;s the problem we exist to solve.
              </strong>
              &rdquo;
            </p>
            <div
              className="font-mono text-[8px] tracking-[0.22em] uppercase"
              style={{ color: "rgba(243,239,232,0.5)" }}
            >
              Founding Premise · Deus Performance
            </div>
          </div>
        </div>

        {/* Core thesis band */}
        <div className="border-t border-b border-line px-5 py-[36px] text-center md:px-[52px]" style={{ background: "var(--bg2)" }}>
          <div className="mx-auto max-w-[760px]">
            <p
              className="font-bask italic text-ink leading-[1.75] mb-[14px]"
              style={{ fontSize: "clamp(15px, 2vw, 21px)" }}
            >
              Every plateau is{" "}
              <em className="text-accent">philosophical</em> before it&apos;s
              physical. The Stoics, the existentialists, and the Eastern
              masters already solved what the modern athlete is facing: how to
              govern what you can&apos;t control, how to find meaning in the
              grind, how to{" "}
              <em className="text-warm">perform without forcing it.</em>
            </p>
            <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-ink3">
              Core Thesis · Deus Performance
            </div>
          </div>
        </div>

        {/* Four schools */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">The Intellectual Foundation</div>
          <h2
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[10px] text-ink"
            style={{ fontSize: "clamp(28px, 3.8vw, 52px)" }}
          >
            Four traditions that govern the <em className="text-warm">practice.</em>
          </h2>
          <p className="font-bask text-[14px] text-ink2 leading-[1.85] mb-[36px] max-w-[580px]">
            The methodology is physical. The framework underneath it isn&apos;t.
            Every programme rests on four traditions that spent two thousand
            years answering questions a training plan alone can&apos;t.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line">
            {SCHOOLS.map((s) => (
              <div key={s.idx} className="bg-bg p-[24px] md:p-[32px]">
                <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-accent mb-[8px]">
                  {s.idx}
                </div>
                <div className="font-play font-normal text-[18px] text-ink mb-[4px] leading-[1.2]">
                  {s.name}
                </div>
                <div className="font-bask italic text-[11px] text-warm mb-[13px]">
                  {s.greek}
                </div>
                <p className="font-bask text-[13px] text-ink2 leading-[1.85] mb-[14px]">
                  {s.body}
                </p>
                <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3">
                  {s.figures}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[28px] text-center">
            <Link href="/dispatches" className="btn-ghost">
              Read these worked out in full — the Dispatches →
            </Link>
          </div>
        </section>

        <hr className="border-0 h-px bg-line mx-5 md:mx-[52px]" />

        {/* Commitments */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">Core Commitments</div>
          <h2
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[28px] text-ink"
            style={{ fontSize: "clamp(28px, 3.8vw, 52px)" }}
          >
            Four <em className="text-warm">premises</em> that define the
            practice.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line mb-[52px]">
            {COMMITMENTS.map((c) => (
              <div key={c.n} className="bg-bg p-[22px] md:p-[28px]">
                <div className="font-play italic text-[28px] text-line2 mb-[8px] leading-[1]">
                  {c.n}
                </div>
                <div className="font-mono font-medium text-[10px] uppercase tracking-[0.1em] text-ink mb-[8px]">
                  {c.title}
                </div>
                <p className="font-bask text-[13px] text-ink2 leading-[1.85]">
                  {c.body}
                </p>
              </div>
            ))}
          </div>

          {/* Refusals */}
          <div className="kicker mb-[14px]">What we won&apos;t do</div>
          <h3
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[24px] text-ink"
            style={{ fontSize: "clamp(22px, 3vw, 42px)" }}
          >
            The limits of the <em className="text-warm">practice.</em>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line mb-[40px]">
            {REFUSALS.map((r, i) => (
              <div key={i} className="bg-bg p-[22px] md:p-[28px]">
                <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-danger mb-[8px]">
                  Refused
                </div>
                <p className="font-bask text-[13px] text-ink2 leading-[1.85]">
                  {r}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/assess" className="btn-primary">
              Begin the Assessment
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
