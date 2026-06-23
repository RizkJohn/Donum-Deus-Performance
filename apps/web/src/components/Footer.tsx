import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 pb-7 pt-11 md:px-12">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3">
        <p className="flex items-baseline gap-2">
          <span className="font-play text-[13px] font-black tracking-[0.18em] text-accent">
            DEUS
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink3">
            Performance
          </span>
          <span className="font-play text-[12px] italic text-warm">
            Donum Dei.
          </span>
        </p>
        <nav className="flex gap-5" aria-label="Footer">
          <Link
            href="/#method"
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink3 transition-colors hover:text-ink"
          >
            Method
          </Link>
          <Link
            href="/#pricing"
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink3 transition-colors hover:text-ink"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink3 transition-colors hover:text-ink"
          >
            FAQ
          </Link>
          <Link
            href="/apply"
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent transition-opacity hover:opacity-80"
          >
            Free Assessment
          </Link>
        </nav>
        <p className="font-mono text-[9px] tracking-[0.06em] text-ink3">
          © {new Date().getFullYear()} Riz Management LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
