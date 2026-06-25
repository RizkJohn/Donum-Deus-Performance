"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  "Philosophy",
  "Methodology",
  "Curriculum",
  "Dispatches",
  "Reference",
  "Correspondence",
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] h-[58px] flex items-center justify-between border-b border-line px-[52px] max-md:px-[18px]"
      style={{ background: "rgba(243,239,232,0.97)", backdropFilter: "blur(14px)" }}
    >
      <Link href="/" className="flex flex-row items-center gap-[9px] group">
        <svg
          className="text-ink3 group-hover:text-accent transition-colors flex-shrink-0"
          width="15"
          height="14"
          viewBox="0 0 15 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 7L7.5 1.5L13.5 7"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 5.8V12.5H6V9H9V12.5H12V5.8"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-bask text-[14px] tracking-[0.01em] text-ink">
          <em>Deus</em> <strong>Performance</strong>
        </span>
      </Link>

      <div className="hidden md:flex gap-[30px] items-center">
        {NAV_LINKS.map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase()}`}
            className="font-mono text-[9px] tracking-[0.17em] uppercase text-ink3 hover:text-ink transition-colors"
          >
            {item}
          </Link>
        ))}
        <Link
          href="/assess"
          className="font-mono text-[9px] tracking-[0.15em] uppercase px-[18px] py-[7px] border border-accent text-accent hover:bg-accent hover:text-[#f3efe8] transition-all"
        >
          Begin Assessment
        </Link>
      </div>

      <button
        className="md:hidden bg-transparent border-none text-ink text-[20px] cursor-pointer leading-none"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        ☰
      </button>

      {open && (
        <div className="md:hidden absolute top-[58px] left-0 right-0 bg-bg flex flex-col items-start px-[18px] py-[13px] border-b border-line gap-[13px] z-[99]">
          {NAV_LINKS.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="font-mono text-[9px] tracking-[0.17em] uppercase text-ink3 hover:text-ink transition-colors"
              onClick={() => setOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link
            href="/assess"
            className="font-mono text-[9px] tracking-[0.15em] uppercase px-[18px] py-[9px] border border-accent text-accent w-full text-center mt-[5px] hover:bg-accent hover:text-[#f3efe8] transition-all"
            onClick={() => setOpen(false)}
          >
            Begin Assessment
          </Link>
        </div>
      )}
    </nav>
  );
}
