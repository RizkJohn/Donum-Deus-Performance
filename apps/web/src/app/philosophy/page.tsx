import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Philosophy — Deus Performance",
  description:
    "Why this institution exists. Performance education grounded in Stoicism, Existentialism, Eastern philosophy, and Greek Virtue Ethics.",
};

const SCHOOLS = [
  {
    idx: "i · Stoicism",
    name: "The Dichotomy of Control",
    greek: "prohairesis — the faculty of choice",
    body: "The result is never yours to own — the clock, the podium, the verdict of others. What is yours is the rep you did not skip, the breath you governed, the standard you held when no one was watching. Master the input; release the outcome. The Stoics built an entire discipline on that division, and it is the only game an athlete can actually win.",
    figures: "Epictetus · Marcus Aurelius · Seneca",
  },
  {
    idx: "ii · Existentialism",
    name: "Meaning in the Effort",
    greek: "amor fati — love of one's fate",
    body: "Everyone wants the result. Nietzsche asked for something harder: to love the fate that produces it — the dawn sessions no one applauds, the plateaus that test patience, the setbacks that expose character. Not to tolerate the grind, but to will it. The athlete who finds meaning in the work never runs out of reason to return to it.",
    figures: "Nietzsche · Sartre · Camus · Frankl",
  },
  {
    idx: "iii · Eastern Philosophy",
    name: "Effortless Action",
    greek: "wú wéi — acting without forcing",
    body: "Wu wei is not passivity. It is what remains when training runs so deep that execution stops being a decision. Forcing creates tension; tension creates error; error destroys performance. You cannot grip your way to a personal best. The practice is built to be drilled until it disappears — so that on the day, you trust it and let the result arrive.",
    figures: "Laozi · Zhuangzi · Zen tradition",
  },
  {
    idx: "iv · Greek Virtue Ethics",
    name: "Excellence as a Way of Being",
    greek: "aretē — excellence · eudaimonia — flourishing",
    body: "Arete was never a medal. It was the full, consistent expression of one's highest capability — in how you train, how you rest, how you show up unobserved. Eudaimonia, human flourishing, is built across thousands of decisions no one sees. Build the person, and the results follow. Your pursuit is not a season. It is a standard.",
    figures: "Aristotle · the Hellenic tradition",
  },
];

const COMMITMENTS = [
  {
    n: "i.",
    title: "Structure Before Load",
    body: "Joint integrity is the non-negotiable first priority of every programme. It is not a constraint on development — it is the precondition for development. Without it, all subsequent work is spent compensating for what the structure no longer supports.",
  },
  {
    n: "ii.",
    title: "Built From First Principles",
    body: "Every programme is constructed from the practitioner's actual inputs: age, body composition, schedule density, fatigue state, movement restrictions, and stated objectives. No template is applied. No default fills an unexamined variable.",
  },
  {
    n: "iii.",
    title: "Intelligent Overload Only",
    body: "The programme distinguishes between productive stress — the kind that drives adaptation — and accumulated damage. Volume is modulated to the practitioner's current state. Progression is applied only when the conditions for it exist.",
  },
  {
    n: "iv.",
    title: "The Decades Are the Measure",
    body: "Every decision made in programming today is an investment in the practitioner's capacity twenty years from now. That horizon is what separates the development of a body from the consumption of one.",
  },
];

const REFUSALS = [
  "Present a template as a custom programme. If the intake does not materially change the output, the intake serves no purpose and the output is dishonest.",
  "Prescribe volume that compromises joint integrity in exchange for short-term performance. The structural cost is always paid. Only the timing is uncertain.",
  "Disregard fatigue state. A programme that cannot adapt to where the practitioner is today is a schedule, not a programme. Schedules do not build anything of consequence.",
  "Allow conditioning to undermine the strength work it is intended to complement. Everything in a session has a fatigue cost. Only expenditures with commensurate returns are permitted.",
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
            Performance education has been reduced to a product category.
            Templates are sold as precision. Volume is sold as care. Generic
            outputs are sold as personalisation. This institution was founded to
            work against every part of that.
          </p>
        </section>

        {/* Etymology */}
        <div className="border-t border-b border-line" style={{ background: "var(--bg1)" }}>
          <div className="mx-auto max-w-[1300px] px-5 py-[40px] md:px-[52px]">
            <div className="font-mono text-[8px] tracking-[0.24em] uppercase text-ink3 mb-[22px]">
              Etymology · A detailed account of the institutional name
            </div>
            <div className="flex flex-col gap-[1px] bg-line max-w-[860px]">
              {[
                {
                  word: "corpus",
                  pos: "Latin noun · neuter · third declension",
                  meaning: "The body; a thing freely given without prior obligation",
                  note: "The body is given freely. A gift carries a specific social weight — a gift received without reciprocal obligation nonetheless creates a debt of respect toward the giver's intention. To receive a gift and treat it carelessly is not neutrality. It is refusal.",
                },
                {
                  word: "deus",
                  pos: "Latin noun · masculine · second declension · from Proto-Indo-European *dyew-",
                  meaning: "God; a divine being; the ultimate and originating source",
                  note: "Root of English: deity, divine, divinity. Deus positions the source of the gift as categorically greater than both the gift and its recipient. The capacity you carry in your body was not constructed by you. It arrived through a process that exceeds your authorship.",
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
                  God has given. A statement of origin that is also a statement
                  of responsibility. If the body is a gift of divine origin, then
                  how it is trained is a moral question, not merely a technical
                  one. This institution holds that the answer to that question is
                  structured, intelligent, long-horizon physical development. The
                  name is the doctrine.
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
              &ldquo;Most practitioners do not fail because they lack effort.
              They fail because no one built a system around their actual life —
              their schedule, their body, their current state.{" "}
              <strong className="not-italic font-bold" style={{ color: "#f3efe8" }}>
                That is the problem this institution was built to solve.
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
              Every athletic plateau is a{" "}
              <em className="text-accent">philosophical</em> problem before it
              becomes a physical one. The Stoics, the existentialists, and the
              Eastern masters solved the same questions the modern athlete faces:
              how to govern what cannot be controlled, how to find meaning in
              suffering, how to{" "}
              <em className="text-warm">perform without forcing.</em>
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
            The methodology is physical. The framework beneath it is not. Every
            programme this institution builds rests on four bodies of thought
            that have spent two thousand years answering the questions a training
            plan alone cannot.
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
          <div className="kicker mb-[14px]">Institutional Commitments</div>
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
          <div className="kicker mb-[14px]">What the institution will not do</div>
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
