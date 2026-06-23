import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Training science, doctrine, and the high-performer life. Articles from Deus Performance.",
};

export default function JournalPage() {
  const articles = getAllArticles();

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <header className="border-b border-line px-6 py-16 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <p className="kicker mb-5">Journal</p>
            <h1 className="mb-5 font-play text-[clamp(40px,5.5vw,72px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
              Training science.{" "}
              <em className="font-normal italic text-warm">Written precisely.</em>
            </h1>
            <p className="max-w-[500px] font-bask text-[17px] leading-[1.85] text-ink2">
              The methodology behind the engine — explained in full for athletes who want to understand what the constraints are and why they exist.
            </p>
          </div>
        </header>

        <section className="px-6 py-14 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            {articles.length === 0 ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink3">
                No articles yet.
              </p>
            ) : (
              <div className="flex flex-col gap-px border border-line bg-line">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/journal/${article.slug}`}
                    className="group grid grid-cols-1 gap-3 bg-bg px-7 py-6 transition-colors hover:bg-bg1 md:grid-cols-[1fr_160px]"
                  >
                    <div>
                      <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.22em] text-accent">
                        {article.category}
                      </p>
                      <h2 className="mb-2 font-play text-[20px] font-black leading-[1.15] tracking-[-0.01em] text-ink group-hover:text-accent transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-[11px] leading-[1.7] text-ink3">
                        {article.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1 md:items-end md:justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink3">
                        {new Date(article.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink3">
                        {article.readTime}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
