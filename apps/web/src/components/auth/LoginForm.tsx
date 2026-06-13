"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in — send to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("We could not reach the engine. Try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[420px] px-6 py-20">
      <p className="kicker mb-4">Member access</p>
      <h1 className="mb-2 font-play text-[32px] font-black leading-[1] tracking-[-0.02em] text-ink">
        Sign in.
      </h1>
      <p className="mb-8 font-bask text-[15px] leading-[1.8] text-ink2">
        Return to your programs and keep the engine adapting to you.
      </p>

      <form onSubmit={onSubmit} className="border border-line bg-bg p-7">
        <div className="mb-5">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="field-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 border border-[rgba(184,68,68,0.28)] bg-[rgba(184,68,68,0.1)] px-3 py-[10px] text-[11px] tracking-[0.04em] text-danger"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in →"}
        </button>
      </form>

      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink3">
        No account?{" "}
        <Link href="/signup" className="text-accent hover:opacity-80">
          Create one
        </Link>
      </p>
    </div>
  );
}
