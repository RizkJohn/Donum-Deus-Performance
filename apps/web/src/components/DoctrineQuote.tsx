export default function DoctrineQuote() {
  return (
    <div
      className="border-t border-b border-line px-[52px] py-[40px] relative overflow-hidden max-md:px-5"
      style={{ background: "var(--bg1)" }}
    >
      <div
        className="absolute font-play font-black pointer-events-none select-none"
        style={{
          top: "-90px",
          left: "12px",
          fontSize: "500px",
          lineHeight: 1,
          color: "rgba(31,58,95,0.05)",
        }}
        aria-hidden="true"
      >
        &ldquo;
      </div>
      <div className="max-w-[840px] mx-auto relative z-[1]">
        <p
          className="font-bask italic text-ink leading-[1.65] mb-[20px]"
          style={{ fontSize: "clamp(19px, 2.6vw, 32px)" }}
        >
          &ldquo;The body is not an obstacle to be overcome. It is the{" "}
          <strong className="not-italic font-bold text-accent">medium</strong>{" "}
          through which everything you will ever accomplish passes. To neglect
          it diminishes the gift. To develop it with intelligence — that is the
          only act of gratitude that remains.&rdquo;
        </p>
        <div className="flex items-center gap-[13px] font-mono text-[8px] tracking-[0.24em] uppercase text-ink3">
          <span className="w-[22px] h-px bg-line2 flex-shrink-0" aria-hidden="true" />
          Founding Doctrine · Deus Performance
        </div>
      </div>
    </div>
  );
}
