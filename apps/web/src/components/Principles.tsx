const PRINCIPLES = [
  {
    num: "i.",
    title: "The Gift Is Not Permanent by Default",
    body: "Joints degrade without protection. Movement dissolves without practice. Strength erodes without smart load. Capacity isn't a fixed inheritance — it's an account, and it only grows with deposits.",
  },
  {
    num: "ii.",
    title: "Intensity Is Not Evidence of Care",
    body: "Volume that wrecks the infrastructure it's supposed to build isn't diligence. It's waste. A good programme isn't measured by how hard it hits — it's measured by what it protects and what it returns.",
  },
  {
    num: "iii.",
    title: "The Decades Are the Measure",
    body: "A body built for thirty years of output beats one that peaked at thirty-two. Longevity isn't a concession to age. It's the strategy.",
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
            source. The body is given, not earned. A gift comes with an
            obligation: don&apos;t waste it. Don&apos;t let it erode through
            indifference. Develop it with the care it was given with.
          </p>
          <p className="mb-[17px]">
            The body&apos;s capacity to adapt, strengthen, and recover is
            extraordinary by design. Its tolerance for neglect is not.
          </p>
          <p>
            Physical development isn&apos;t a pursuit of aesthetics or
            metrics. It&apos;s stewardship of something you were given, not
            something you earned. That changes how a programme gets built.
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
