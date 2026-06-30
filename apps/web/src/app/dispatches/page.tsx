import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { DISPATCHES } from "@/lib/dispatches";

export const metadata: Metadata = {
  title: "Dispatches — Deus Performance",
  description:
    "Commentary on mind and practice. The doctrine, worked out one idea at a time — Stoicism, Existentialism, Eastern philosophy, and Greek Virtue Ethics in the training hall.",
};

export default function DispatchesPage() {
  const [featured, ...rest] = DISPATCHES;

  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        {/* Header */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">Dispatches</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[18px] text-ink"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Commentary on mind
            <br />
            <em className="text-warm">and</em> practice.
          </h1>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] max-w-[560px]">
            The doctrine, worked out one idea at a time. Each dispatch takes a
            single principle and drags it into the training hall — where the
            abstraction either holds up or it doesn&apos;t.
          </p>
        </section>

        {/* Featured dispatch */}
        <div className="border-t border-line">
          <div className="mx-auto max-w-[1300px] px-5 md:px-[52px]">
            <Link
              href={`/dispatches/${featured.slug}`}
              className="flex flex-col md:flex-row gap-0 hover:bg-bg1 transition-colors border-b border-line group"
            >
              <div className="flex-1 p-[28px] md:p-[40px] md:border-r border-b md:border-b-0 border-line">
                <div className="font-mono text-[7px] tracking-[0.22em] uppercase text-accent mb-[10px]">
                  Featured Dispatch
                </div>
                <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 mb-[8px]">
                  {featured.tag}
                </div>
                <h2
                  className="font-play font-normal leading-[1.0] tracking-[-0.02em] mb-[10px] text-ink group-hover:text-accent transition-colors"
                  style={{ fontSize: "clamp(22px, 3vw, 40px)" }}
                >
                  {featured.title}{" "}
                  {featured.titleEm && <em className="text-warm">{featured.titleEm}</em>}
                </h2>
                <p className="font-bask text-[13px] text-ink2 leading-[1.75]">
                  {featured.dek}
                </p>
              </div>
              <div className="flex-1 p-[28px] md:p-[40px] flex flex-col justify-between">
                <blockquote className="font-bask italic text-[14px] text-ink leading-[1.8] mb-[18px] border-l-2 border-accent pl-[14px]">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
                <div>
                  <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 mb-[8px]">
                    {featured.school} · {featured.read}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.13em] uppercase text-accent">
                    Read the dispatch →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Dispatch list */}
        <div className="mx-auto max-w-[1300px] px-5 md:px-[52px]">
          {rest.map((d, i) => (
            <Link
              key={d.slug}
              href={`/dispatches/${d.slug}`}
              className="flex flex-col sm:flex-row items-start gap-4 sm:gap-0 py-[22px] border-b border-line hover:bg-bg1 transition-colors px-0 sm:px-0 group"
            >
              <div className="font-play italic text-[28px] text-line2 sm:min-w-[56px] leading-[1] flex-shrink-0 sm:pt-[2px]">
                {String(i + 2).padStart(2, "0")}
              </div>
              <div className="flex-1 sm:pr-[20px]">
                <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 mb-[5px]">
                  {d.tag}
                </div>
                <div className="font-play font-normal text-[18px] text-ink mb-[5px] group-hover:text-accent transition-colors leading-[1.2]">
                  {d.title} {d.titleEm && <em className="text-warm">{d.titleEm}</em>}
                </div>
                <p className="font-bask text-[12px] text-ink3 leading-[1.7]">
                  {d.dek}
                </p>
              </div>
              <div className="sm:text-right sm:min-w-[120px] flex-shrink-0">
                <div className="font-mono text-[8px] tracking-[0.12em] uppercase text-ink3 mb-[4px]">
                  {d.thinker}
                </div>
                <div className="font-mono text-[8px] tracking-[0.1em] uppercase text-accent">
                  {d.read} · Read →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="py-[40px]" />
      </main>
      <Footer />
    </>
  );
}
