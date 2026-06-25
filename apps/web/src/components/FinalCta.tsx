import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="px-[52px] py-[56px] border-t border-line text-center relative overflow-hidden max-md:px-5">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-play italic font-normal pointer-events-none select-none whitespace-nowrap leading-[1]"
        style={{
          fontSize: "clamp(80px, 14vw, 200px)",
          color: "rgba(31,58,95,0.05)",
        }}
        aria-hidden="true"
      >
        body
      </div>
      <div className="relative z-[1]">
        <p className="font-bask italic text-[14px] text-warm mb-[11px]">deus</p>
        <h2
          className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[14px] text-ink"
          style={{ fontSize: "clamp(30px, 4.3vw, 56px)" }}
        >
          The gift was given.
          <br />
          <strong>Now honor it.</strong>
        </h2>
        <p className="font-bask text-[15px] text-ink2 mx-auto mb-[34px] max-w-[480px] leading-[1.85]">
          Complete the intake. A programme is constructed around your current
          state, your schedule, and your body&apos;s actual constraints — from
          first principles, not from defaults.
        </p>
        <Link
          href="/assess"
          className="btn-primary"
          style={{ fontSize: "11px", padding: "13px 40px" }}
        >
          Begin the Assessment
        </Link>
        <p className="font-mono text-[8px] tracking-[0.1em] text-ink3 mt-[9px]">
          No account required to begin
        </p>
      </div>
    </section>
  );
}
