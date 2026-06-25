import Link from "next/link";

const FOOTER_LINKS = [
  "Philosophy",
  "Methodology",
  "Curriculum",
  "Dispatches",
  "Reference",
  "Correspondence",
];

export default function Footer() {
  return (
    <footer className="border-t border-line px-[52px] py-[22px] max-md:px-5">
      <div className="mx-auto max-w-[1300px] flex items-center justify-between flex-wrap gap-[14px]">
        <div className="font-bask italic text-[12px] text-warm">
          deus · the gift of God
        </div>
        <nav className="flex gap-5 flex-wrap" aria-label="Footer navigation">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 hover:text-ink transition-colors"
            >
              {item}
            </Link>
          ))}
          <Link
            href="/assess"
            className="font-mono text-[8px] tracking-[0.14em] uppercase text-ink3 hover:text-ink transition-colors"
          >
            Assessment
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-[1300px] mt-[10px] pt-[10px] border-t border-line font-mono text-[8px] text-ink3 tracking-[0.04em] leading-[1.7]">
        © {new Date().getFullYear()} Riz Management LLC. All rights reserved.
        &nbsp;·&nbsp; Deus Performance is a practice of performance education.
        It does not constitute medical, rehabilitation, or clinical advice of
        any kind. Consult a licensed clinician before beginning any new training
        programme.
      </div>
    </footer>
  );
}
