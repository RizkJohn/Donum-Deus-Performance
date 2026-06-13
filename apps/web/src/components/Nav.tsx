"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Nav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleSignOut() {
    logout();
    router.push("/");
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-line bg-[rgba(11,15,12,0.94)] px-6 backdrop-blur-md md:px-12">
      <Link href="/" className="flex items-baseline gap-[10px]">
        <span className="font-play text-[17px] font-black uppercase tracking-[0.22em] text-accent">
          Deus
        </span>
        <span className="hidden text-[9px] uppercase tracking-[0.14em] text-ink3 sm:inline">
          Performance · Riz Management
        </span>
      </Link>
      <div className="flex items-center gap-4 md:gap-[30px]">
        <Link
          href="/#method"
          className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition-colors hover:text-ink sm:inline"
        >
          Method
        </Link>
        <Link
          href="/#pricing"
          className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition-colors hover:text-ink sm:inline"
        >
          Pricing
        </Link>
        <Link
          href="/#faq"
          className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition-colors hover:text-ink sm:inline"
        >
          FAQ
        </Link>
        {!loading && user ? (
          <>
            <Link
              href="/dashboard"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition-colors hover:text-ink"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="cursor-pointer bg-transparent font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition-colors hover:text-ink"
          >
            Sign in
          </Link>
        )}
        <Link
          href="/assess"
          className="bg-accent px-[22px] py-[9px] font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#0b0f0c] transition-opacity hover:opacity-85"
        >
          Free Assessment
        </Link>
      </div>
    </nav>
  );
}
