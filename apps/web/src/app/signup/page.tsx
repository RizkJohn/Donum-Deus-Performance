"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body?.detail === "string" ? body.detail : "Could not create your account.",
        );
      }
      const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
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
            Create your <em className="font-normal italic text-warm">account.</em>
          </h1>
          <p className="mb-8 font-bask text-[14px] leading-[1.8] text-ink2">
            Save every program the engine builds for you in one place — no
            need to keep track of individual links.
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
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="confirm">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="field-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="text-[11px] tracking-[0.04em] text-danger">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn-primary disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.1em] text-ink3">
            Already have an account?{" "}
            <Link href="/login" className="text-accent underline underline-offset-2">
              Log in
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
