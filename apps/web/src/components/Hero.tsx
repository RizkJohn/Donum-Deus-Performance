import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-[1300px] px-5 pt-[72px] pb-9 md:px-[52px] md:pt-[68px] md:pb-[52px]">
      <div className="max-w-[720px]">
        <div className="flex items-center gap-[10px] font-mono text-[8px] tracking-[0.3em] uppercase text-ink3 mb-[14px]">
          <span className="w-[18px] h-px bg-line2 flex-shrink-0" aria-hidden="true" />
          Train the mind. The body follows.
        </div>
        <h1
          className="font-play font-normal leading-[1.0] tracking-[-0.02em] mb-[20px] text-ink"
          style={{ fontSize: "clamp(36px, 8vw, 80px)" }}
        >
          The body is not
          <br />a project.
          <br />
          It is a <em className="text-accent">practice.</em>
        </h1>
        <p className="font-bask text-[16px] text-ink2 leading-[1.9] max-w-[430px] mb-[24px] pl-[16px] border-l border-line2">
          Donum Dei Performance is a philosophy-driven practice that bridges ancient
          wisdom and modern athletic discipline. Every plateau is a philosophical
          problem before it becomes a physical one — the Stoics, the
          existentialists, and the Eastern masters resolved the questions every
          serious athlete eventually meets. We build the mind that builds the
          body.
        </p>
        <div className="flex gap-[14px] items-center flex-wrap">
          <Link href="/assess" className="btn-primary">
            Begin the Assessment
          </Link>
          <Link href="/dispatches" className="btn-ghost">
            Read the Dispatches →
          </Link>
        </div>
      </div>
    </section>
  );
}
