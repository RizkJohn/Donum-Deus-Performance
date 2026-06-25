import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { DISPATCHES } from "@/lib/dispatches";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return DISPATCHES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dispatch = DISPATCHES.find((d) => d.slug === slug);
  if (!dispatch) return {};
  return {
    title: `${dispatch.tag} — Deus Performance Dispatches`,
    description: dispatch.dek,
  };
}

export default async function DispatchPostPage({ params }: Props) {
  const { slug } = await params;
  const idx = DISPATCHES.findIndex((d) => d.slug === slug);
  if (idx === -1) notFound();

  const dispatch = DISPATCHES[idx];
  const prev = idx > 0 ? DISPATCHES[idx - 1] : null;
  const next = idx < DISPATCHES.length - 1 ? DISPATCHES[idx + 1] : null;

  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        <div className="mx-auto max-w-[760px] px-5 py-[52px] md:px-[32px]">
          {/* Back link */}
          <Link
            href="/dispatches"
            className="font-mono text-[8px] tracking-[0.18em] uppercase text-ink3 hover:text-ink transition-colors mb-[36px] flex items-center gap-[6px]"
          >
            ← All Dispatches
          </Link>

          {/* Tag */}
          <div className="font-mono text-[8px] tracking-[0.22em] uppercase text-accent mb-[12px]">
            {dispatch.tag}
          </div>

          {/* Title */}
          <h1
            className="font-play font-normal leading-[1.0] tracking-[-0.02em] mb-[10px] text-ink"
            style={{ fontSize: "clamp(28px, 4.5vw, 56px)" }}
          >
            {dispatch.title}{" "}
            {dispatch.titleEm && (
              <em className="text-warm">{dispatch.titleEm}</em>
            )}
          </h1>

          {/* Dek */}
          <p className="font-bask italic text-[15px] text-ink2 leading-[1.75] mb-[20px]">
            {dispatch.dek}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-[16px] font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 mb-[36px] pb-[28px] border-b border-line">
            <span>{dispatch.school}</span>
            <span className="w-px h-[10px] bg-line2" aria-hidden="true" />
            <span>{dispatch.read} read</span>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-[20px]">
            {dispatch.body.map((para, i) => (
              <div key={i}>
                <p
                  className="font-bask leading-[1.9] text-ink2"
                  style={{ fontSize: i === 0 ? "16px" : "14px" }}
                >
                  {para}
                </p>
                {i === 0 && (
                  <blockquote className="my-[28px] pl-[18px] border-l-2 border-accent">
                    <p className="font-bask italic text-[15px] text-ink leading-[1.75]">
                      &ldquo;{dispatch.quote}&rdquo;
                    </p>
                  </blockquote>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-[44px] p-[24px] border border-line bg-bg1">
            <p className="font-bask italic text-[13px] text-ink2 mb-[14px] leading-[1.7]">
              {dispatch.cta}
            </p>
            <Link
              href="/assess"
              className="btn-primary"
              style={{ fontSize: "10px", padding: "10px 24px" }}
            >
              Begin the Assessment
            </Link>
          </div>

          {/* Post navigation */}
          <div className="mt-[44px] pt-[28px] border-t border-line flex flex-col sm:flex-row gap-4 justify-between">
            {prev ? (
              <Link
                href={`/dispatches/${prev.slug}`}
                className="group flex flex-col gap-[4px] max-w-[240px]"
              >
                <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-ink3 group-hover:text-accent transition-colors">
                  ← Previous
                </span>
                <span className="font-bask text-[13px] text-ink leading-[1.4] group-hover:text-accent transition-colors">
                  {prev.tag}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/dispatches/${next.slug}`}
                className="group flex flex-col gap-[4px] text-right max-w-[240px] ml-auto"
              >
                <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-ink3 group-hover:text-accent transition-colors">
                  Next →
                </span>
                <span className="font-bask text-[13px] text-ink leading-[1.4] group-hover:text-accent transition-colors">
                  {next.tag}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
