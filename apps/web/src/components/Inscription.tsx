export default function Inscription() {
  return (
    <div
      className="border-t border-b border-line px-[52px] py-[34px] text-center max-md:px-5"
      style={{ background: "var(--bg2)" }}
    >
      <div className="max-w-[640px] mx-auto">
        <p
          className="font-bask italic text-ink leading-[1.75] mb-[16px]"
          style={{ fontSize: "clamp(16px, 2vw, 23px)" }}
        >
          &ldquo;Do you not know that your body is a temple?{" "}
          <strong className="not-italic font-bold text-accent">Honor it</strong>{" "}
          — with every session, every recovery, every decision made in full
          awareness of what it is.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-[13px] font-mono text-[8px] tracking-[0.22em] uppercase text-ink3">
          <span className="w-[28px] h-px bg-line2" aria-hidden="true" />
          The Standard · Deus Performance
          <span className="w-[28px] h-px bg-line2" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
