const PRINCIPLES = [
  {
    num: "i.",
    title: "The Gift Is Not Permanent by Default",
    body: "Joints degrade without protection. Movement patterns dissolve without practice. Strength erodes without intelligent load. The body's capacity is not a fixed inheritance — it is a living account that requires deposits.",
  },
  {
    num: "ii.",
    title: "Intensity Is Not Evidence of Care",
    body: "Volume that destroys the infrastructure it was meant to develop is not diligence — it is waste. The measure of a sound program is not its severity. It is the structural integrity it protects and the capacity it returns over time.",
  },
  {
    num: "iii.",
    title: "The Decades Are the Measure",
    body: "A body trained for thirty years of useful life outperforms one that peaked at thirty-two. Longevity is not a concession made to age. It is the strategy that makes sustained performance possible.",
  },
];

export default function Principles() {
  return (
    <section className="mx-auto max-w-[1300px] grid grid-cols-1 gap-[28px] items-start px-5 py-9 md:grid-cols-2 md:gap-[72px] md:px-[52px] md:py-[56px]">
      <div>
        <div className="kicker mb-[14px]">Foundational Principles</div>
        <h2
          className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[30px] text-ink"
          style={{ fontSize: "clamp(34px, 4.3vw, 56px)" }}
        >
          What <em>Deus</em>
          <br />
          demands in <strong>practice.</strong>
        </h2>
        <div className="font-bask text-[15px] text-ink2 leading-[1.9]">
          <p className="mb-[17px]">
            <strong className="text-ink font-bold">Deus</strong> — the divine
            source. The body is given, not earned. A gift carries the obligation
            to receive it well: you do not discard it or let it deteriorate
            through indifference. You develop it with the care the giver
            intended.
          </p>
          <p className="mb-[17px]">
            The body&apos;s capacity for adaptation, strength, and recovery is
            extraordinary by design. Its tolerance for sustained neglect is not.
          </p>
          <p>
            The institution holds that physical development is not a pursuit of
            aesthetics or performance metrics. It is an act of stewardship over
            something that was given rather than earned. That framing changes
            everything about how a program is built.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-px bg-line">
        {PRINCIPLES.map((p) => (
          <div key={p.num} className="principle-card">
            <div className="font-play italic text-[32px] text-line2 leading-[1] mb-[7px]">
              {p.num}
            </div>
            <div className="font-mono font-medium text-[10px] uppercase tracking-[0.11em] mb-[7px] text-ink3">
              {p.title}
            </div>
            <div className="text-[11px] text-ink3 leading-[1.82]">{p.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
