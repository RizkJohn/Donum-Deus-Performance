import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TIERS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Curriculum — Donum Dei Performance",
  description:
    "Three levels of engagement: Foundation ($20/mo), Practice ($120/mo), Stewardship ($240/mo). The methodology does not vary by level.",
};

export default function CurriculumPage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        {/* Header */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">Curriculum</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[22px] text-ink max-w-[600px]"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Three levels of <em className="text-warm">engagement.</em>
          </h1>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] max-w-[600px]">
            The methodology does not vary by level. The doctrine does not vary by
            level. What differs is the depth of the relationship between the
            practitioner and the practice — and accordingly, the degree of direct
            oversight that relationship requires.
          </p>
        </section>

        {/* Levels */}
        <div className="border-t border-line">
          <div className="mx-auto max-w-[1300px] px-5 py-[40px] md:px-[52px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line">
              {TIERS.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col p-[24px] md:p-[32px] relative"
                  style={{ background: t.featured ? "var(--bg1)" : "var(--bg)" }}
                >
                  {t.featuredLabel && (
                    <div className="absolute top-0 right-0 bg-accent font-mono text-[7px] tracking-[0.18em] uppercase px-[10px] py-[5px]"
                         style={{ color: "#f3efe8" }}>
                      {t.featuredLabel}
                    </div>
                  )}
                  <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-accent mb-[6px]">
                    {t.level}
                  </div>
                  <div className="font-play font-normal text-[26px] text-ink mb-[6px] leading-[1.1]">
                    {t.name}
                  </div>
                  <p className="font-bask text-[13px] text-ink2 leading-[1.7] mb-[20px]">
                    {t.desc}
                  </p>
                  <div className="mb-[4px]">
                    <span className="font-play font-normal text-[42px] text-ink leading-[1]">
                      <span className="text-[22px] text-ink3 align-top mt-[8px] inline-block">$</span>
                      {t.price}
                    </span>
                  </div>
                  <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 mb-[24px]">
                    {t.period}
                  </div>
                  <ul className="flex flex-col gap-[9px] mb-[28px] flex-1">
                    {t.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-[8px]">
                        <span className="text-accent mt-[2px] flex-shrink-0 font-mono text-[10px]">
                          ✓
                        </span>
                        <span className="font-bask text-[12px] text-ink2 leading-[1.6]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/assess"
                    className="btn-primary text-center w-full mb-[8px]"
                    style={{ fontSize: "10px", padding: "11px 20px" }}
                  >
                    Start free assessment
                  </Link>
                  {/* Plain <a>, not next/link: /checkout is a redirecting
                      Route Handler, not a page — Link's client-side soft-
                      navigation would issue an RSC prefetch instead of
                      following the redirect. */}
                  <a
                    href={`/checkout?tier=${t.id}`}
                    className="text-center w-full font-mono text-[9px] uppercase tracking-[0.1em] text-ink3 hover:text-ink transition-colors"
                    style={{ padding: "6px 0" }}
                  >
                    Already assessed? Subscribe →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Uncertainty note */}
        <div className="mx-auto max-w-[1300px] px-5 py-[28px] md:px-[52px]">
          <div className="border border-line bg-bg1 p-[24px] text-center max-w-[760px] mx-auto">
            <p className="font-bask italic text-[14px] text-ink3 mb-[14px]">
              Uncertain which level of engagement is appropriate for your
              situation?
            </p>
            <Link href="/correspondence" className="btn-ghost">
              Submit a correspondence →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
