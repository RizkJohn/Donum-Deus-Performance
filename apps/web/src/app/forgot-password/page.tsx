"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      // Always show the same confirmation — the API never reveals whether
      // the account exists, and neither should this page.
      setSent(true);
      setBusy(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        <section className="mx-auto max-w-[440px] px-5 py-[64px] md:px-0">
          <p className="kicker mb-4">Account</p>
          <h1 className="mb-6 font-play text-[clamp(28px,4vw,44px)] font-black leading-[0.97] tracking-[-0.02em] text-ink">
            Reset your <em className="font-normal italic text-warm">password.</em>
          </h1>
          {sent ? (
            <p className="font-bask text-[14px] leading-[1.8] text-ink2">
              If that email has an account, a reset link is on its way. Check your inbox — the
              link expires in one hour.
            </p>
          ) : (
            <>
              <p className="mb-8 font-bask text-[14px] leading-[1.8] text-ink2">
                Enter the email you signed up with and we&apos;ll send a link to choose a new
                password.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary disabled:cursor-wait disabled:opacity-70"
                >
                  {busy ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-ink3">
            <Link href="/login" className="text-accent underline underline-offset-2">
              Back to log in
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
