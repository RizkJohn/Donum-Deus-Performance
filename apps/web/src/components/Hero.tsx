import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-[1300px] grid grid-cols-1 gap-[30px] items-center px-5 pt-[44px] pb-9 md:grid-cols-[1.1fr_1fr] md:gap-[72px] md:px-[52px] md:pt-[60px] md:pb-[52px]">
      {/* Left */}
      <div>
        <div className="flex items-center gap-[10px] font-mono text-[8px] tracking-[0.3em] uppercase text-ink3 mb-[14px]">
          <span className="w-[18px] h-px bg-line2 flex-shrink-0" aria-hidden="true" />
          Train the mind. The body follows.
        </div>
        <h1
          className="font-play font-normal leading-[1.0] tracking-[-0.02em] mb-[20px] text-ink"
          style={{ fontSize: "clamp(46px, 5.8vw, 80px)" }}
        >
          The body is not
          <br />a project.
          <br />
          It is a <em className="text-accent">practice.</em>
        </h1>
        <p className="font-bask text-[16px] text-ink2 leading-[1.9] max-w-[430px] mb-[24px] pl-[16px] border-l border-line2">
          Deus Performance is a philosophy-driven practice that bridges ancient
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

      {/* Right: etymology panel */}
      <div className="border border-line bg-bg1">
        <div className="px-[17px] py-[9px] border-b border-line font-mono text-[7px] tracking-[0.22em] uppercase text-ink3 bg-bg2">
          Etymology · Derivation of the institutional name
        </div>

        <div className="flex items-stretch border-b border-line">
          <div className="px-[17px] py-[13px] font-play italic text-[18px] text-warm min-w-[110px] border-r border-line flex items-center flex-shrink-0 max-[480px]:min-w-0 max-[480px]:w-full max-[480px]:border-r-0 max-[480px]:border-b max-[480px]:flex-none">
            corpus
          </div>
          <div className="px-[17px] py-[13px]">
            <div className="font-mono text-[7px] tracking-[0.2em] uppercase text-ink3 mb-[3px]">
              Latin noun · neuter · third declension
            </div>
            <div className="font-mono font-medium text-[11px] text-ink mb-[3px]">
              The body; something given freely
            </div>
            <div className="text-[9px] text-ink3 leading-[1.55]">
              The body is not earned — it is received. That receiving carries
              weight. It is a gift, and a gift obligates the one who holds it.
            </div>
          </div>
        </div>

        <div className="flex items-stretch border-b border-line">
          <div className="px-[17px] py-[13px] font-play italic text-[18px] text-warm min-w-[110px] border-r border-line flex items-center flex-shrink-0 max-[480px]:min-w-0 max-[480px]:w-full max-[480px]:border-r-0 max-[480px]:border-b max-[480px]:flex-none">
            deus
          </div>
          <div className="px-[17px] py-[13px]">
            <div className="font-mono text-[7px] tracking-[0.2em] uppercase text-ink3 mb-[3px]">
              Latin noun · masculine · second declension
            </div>
            <div className="font-mono font-medium text-[11px] text-ink mb-[3px]">
              God; the divine source
            </div>
            <div className="text-[9px] text-ink3 leading-[1.55]">
              Root of English: deity, divine. The source exceeds the recipient.
              The origin of the gift is greater than the gift itself.
            </div>
          </div>
        </div>

        <div className="px-[17px] py-[14px] bg-bg2">
          <div className="font-play italic text-[16px] text-accent mb-[4px]">
            deus dedit
          </div>
          <div className="font-bask italic text-[12px] text-ink2 leading-[1.65]">
            God has given. A statement of origin and obligation in two words.
            The institution&apos;s name is its doctrine.
          </div>
        </div>
      </div>
    </section>
  );
}
