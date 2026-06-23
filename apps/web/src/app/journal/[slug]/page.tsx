import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getAllArticles, getArticle } from "@/lib/articles";
import { MDXRemote } from "next-mdx-remote/rsc";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
  };
}

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mb-5 mt-12 font-play text-[clamp(22px,3vw,32px)] font-black leading-[1.1] tracking-[-0.01em] text-ink"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mb-4 mt-8 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-accent"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-5 font-bask text-[16px] leading-[1.9] text-ink2" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-5 flex flex-col gap-2 pl-0" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="flex items-start gap-3 font-bask text-[16px] leading-[1.8] text-ink2">
      <span className="mt-1 shrink-0 text-accent" aria-hidden="true">—</span>
      <span {...props} />
    </li>
  ),
  hr: () => <hr className="my-10 border-0 border-t border-line" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-mono text-[14px] font-medium text-ink" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded-none border border-line bg-bg2 px-[6px] py-[2px] font-mono text-[12px] text-warm"
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="border-b border-accent3 text-ink2 transition-colors hover:border-accent hover:text-accent"
      {...props}
    />
  ),
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <header className="border-b border-line px-6 py-14 md:px-12">
          <div className="mx-auto max-w-[800px]">
            <Link
              href="/journal"
              className="mb-6 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 transition-colors hover:text-ink"
            >
              ← Journal
            </Link>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
              {article.category}
            </p>
            <h1 className="mb-5 font-play text-[clamp(32px,5vw,58px)] font-black leading-[1.0] tracking-[-0.02em] text-ink">
              {article.title}
            </h1>
            <p className="mb-6 font-bask text-[17px] leading-[1.8] text-ink2">
              {article.description}
            </p>
            <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.16em] text-ink3">
              <span>
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span>{article.readTime} read</span>
            </div>
          </div>
        </header>

        <article className="px-6 py-14 md:px-12">
          <div className="mx-auto max-w-[800px]">
            <MDXRemote source={article.content} components={mdxComponents} />
          </div>
        </article>

        <footer className="border-t border-line px-6 py-14 md:px-12">
          <div className="mx-auto flex max-w-[800px] flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
                Continue reading
              </p>
              <Link href="/journal" className="btn-ghost text-ink2 hover:text-ink">
                ← All articles
              </Link>
            </div>
            <Link href="/apply" className="btn-primary">
              Start your free assessment →
            </Link>
          </div>
        </footer>
      </main>
      <Footer />
    </>
  );
}
