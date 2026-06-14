"use client";

import type { Metadata } from "next";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { sendMagicLink, ApiError } from "@/lib/api";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    try {
      await sendMagicLink(email);
      setState("sent");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <>
      <Nav />
      <main className="flex min-h-screen items-center justify-center px-6 pt-[60px]">
        <div className="w-full max-w-[400px] py-16">
          <p className="kicker mb-4">Account</p>
          <h1 className="mb-2 font-play text-[28px] font-black leading-[1] tracking-[-0.02em] text-ink">
            Sign in
          </h1>
          <p className="mb-8 font-bask text-[14px] leading-[1.8] text-ink2">
            Enter your email. We&rsquo;ll send a sign-in link — no password required.
          </p>

          {state === "sent" ? (
            <div className="border border-line bg-bg1 px-5 py-6">
              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
                Check your inbox
              </p>
              <p className="font-bask text-[14px] leading-[1.7] text-ink2">
                A sign-in link was sent to <strong>{email}</strong>. It expires
                in one hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-line bg-bg px-4 py-3 font-mono text-[12px] text-ink placeholder:text-ink3 focus:border-accent focus:outline-none"
              />
              {state === "error" && (
                <p className="font-mono text-[10px] text-danger">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={state === "loading"}
                className="btn-primary disabled:opacity-50"
              >
                {state === "loading" ? "Sending…" : "Send sign-in link →"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
