"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyMagicLink, ApiError } from "@/lib/api";

function VerifyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("No token provided.");
      return;
    }
    verifyMagicLink(token)
      .then((res) => {
        localStorage.setItem("dp_token", res.access_token);
        localStorage.setItem("dp_user", JSON.stringify(res.user));
        router.replace("/dashboard");
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? "This link has expired or is invalid. Request a new one."
            : "Something went wrong. Try signing in again."
        );
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <>
        <p className="mb-4 font-play text-[22px] font-black text-ink">
          Link expired
        </p>
        <p className="mb-6 font-bask text-[14px] leading-[1.7] text-ink2">
          {error}
        </p>
        <a href="/sign-in" className="btn-primary">
          Back to sign-in →
        </a>
      </>
    );
  }

  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
      Verifying…
    </p>
  );
}

export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-[380px] text-center">
        <Suspense
          fallback={
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
              Loading…
            </p>
          }
        >
          <VerifyInner />
        </Suspense>
      </div>
    </main>
  );
}
