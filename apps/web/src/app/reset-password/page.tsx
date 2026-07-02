"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof body?.detail === "string" ? body.detail : "This reset link is invalid or has expired.",
        );
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <p className="font-bask text-[14px] leading-[1.8] text-ink2">
        This link is missing its reset token. Request a new one from{" "}
        <Link href="/forgot-password" className="text-accent underline underline-offset-2">
          the reset page
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <p className="font-bask text-[14px] leading-[1.8] text-ink2">
        Password updated. Redirecting you to log in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="field-label" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        <section className="mx-auto max-w-[440px] px-5 py-[64px] md:px-0">
          <p className="kicker mb-4">Account</p>
          <h1 className="mb-6 font-play text-[clamp(28px,4vw,44px)] font-black leading-[0.97] tracking-[-0.02em] text-ink">
            Choose a <em className="font-normal italic text-warm">new password.</em>
          </h1>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
