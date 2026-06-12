import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-line px-6 py-[104px] text-center md:px-12">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-play text-[clamp(80px,16vw,220px)] font-black leading-none tracking-[-0.02em] text-[rgba(124,175,88,0.04)]"
      >
        DEUS
      </span>
      <div className="relative">
        <p className="mb-[14px] font-play text-[17px] italic text-warm">
          Donum Dei.
        </p>
        <h2 className="mb-[18px] font-play text-[clamp(36px,5vw,66px)] font-black leading-[0.95] tracking-[-0.02em] text-ink">
          The body is a gift.
          <br />
          <em className="font-normal italic">Train it accordingly.</em>
        </h2>
        <p className="mx-auto mb-10 max-w-[460px] font-bask text-[16px] leading-[1.8] text-ink2">
          Two minutes of questions. One complete, governed week of training.
          Nothing to pay, nothing to install.
        </p>
        <Link href="/assess" className="btn-primary">
          Start your free assessment →
        </Link>
        <p className="mt-3 font-mono text-[9px] tracking-[0.1em] text-ink3">
          No credit card · No commitment
        </p>
      </div>
    </section>
  );
}
