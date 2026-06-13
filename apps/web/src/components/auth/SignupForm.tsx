"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupForm() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setFieldError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setFieldError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFieldError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That email is already registered.");
      } else if (err instanceof ApiError && err.status === 422) {
        setFieldError(
          "That email or password was rejected. Use a valid email and a password of at least 8 characters."
        );
      } else {
        setError("We could not reach the engine. Try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[420px] px-6 py-20">
      <p className="kicker mb-4">Create account</p>
      <h1 className="mb-2 font-play text-[32px] font-black leading-[1] tracking-[-0.02em] text-ink">
        Begin.
      </h1>
      <p className="mb-8 font-bask text-[15px] leading-[1.8] text-ink2">
        An account keeps every generated week in one place and lets the engine
        progress against your history.
      </p>

      <form onSubmit={onSubmit} className="border border-line bg-bg p-7" noValidate>
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
        <div className="mb-5">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-2 text-[9px] italic text-ink3">
            At least 8 characters.
          </p>
        </div>
        <div className="mb-6">
          <label className="field-label" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="field-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {fieldError && (
          <p
            role="alert"
            className="mb-5 text-[10px] tracking-[0.06em] text-danger"
          >
            {fieldError}
          </p>
        )}
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
          {submitting ? "Creating…" : "Create account →"}
        </button>
      </form>

      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink3">
        Already a member?{" "}
        <Link href="/login" className="text-accent hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  );
}
