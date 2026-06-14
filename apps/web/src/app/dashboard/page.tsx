"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getMe, listPrograms, ApiError } from "@/lib/api";
import type { AuthUser, ProgramRecord } from "@/lib/types";
import { isEngineError } from "@/lib/types";

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "1";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [programs, setPrograms] = useState<ProgramRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dp_token");
    if (!token) {
      router.replace("/sign-in");
      return;
    }
    Promise.all([getMe(), listPrograms()])
      .then(([me, runs]) => {
        setUser(me);
        setPrograms(runs);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("dp_token");
          localStorage.removeItem("dp_user");
          router.replace("/sign-in");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  function signOut() {
    localStorage.removeItem("dp_token");
    localStorage.removeItem("dp_user");
    router.replace("/");
  }

  if (loading) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
        Loading…
      </p>
    );
  }

  return (
    <>
      <header className="border-b border-line bg-bg1 px-6 py-8 md:px-12">
        <div className="mx-auto max-w-[1180px] flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-[7px] font-mono text-[8px] uppercase tracking-[0.24em] text-accent">
              Dashboard
            </p>
            <h1 className="font-play text-[26px] font-black uppercase tracking-[-0.01em] text-ink">
              {user?.email}
            </h1>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink3">
              Plan:{" "}
              <span className="text-accent">
                {user?.subscription_tier ?? "free"}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            {user?.subscription_tier === "free" && (
              <Link href="/#pricing" className="btn-primary">
                Upgrade →
              </Link>
            )}
            <button
              onClick={signOut}
              className="border border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink3 hover:border-ink3 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-10 md:px-12">
        {upgraded && (
          <div className="mb-8 border border-accent3 bg-accent2 px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
              Subscription activated — welcome to Deus Performance.
            </p>
          </div>
        )}

        <h2 className="kicker mb-5">Your programs</h2>

        {programs.length === 0 ? (
          <div className="border border-line bg-bg1 px-6 py-10 text-center">
            <p className="mb-4 font-bask text-[15px] leading-[1.8] text-ink2">
              No programs yet. Run the free assessment to generate your first week.
            </p>
            <Link href="/assess" className="btn-primary">
              Start assessment →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-px border border-line bg-line">
            {programs.map((p) => {
              const hasError = isEngineError(p.program);
              const goal =
                !hasError && p.payload?.goals?.primary
                  ? p.payload.goals.primary
                  : null;
              return (
                <Link
                  key={p.id}
                  href={`/program/${p.id}`}
                  className="flex items-center justify-between gap-4 bg-bg px-5 py-4 hover:bg-bg1 transition-colors"
                >
                  <div>
                    <p className="font-mono text-[11px] font-medium text-ink">
                      {goal ?? "Program"}
                    </p>
                    <p className="mt-[2px] font-mono text-[9px] text-ink3">
                      {new Date(p.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {hasError ? (
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-danger">
                      Error
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
                      View →
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
                Loading…
              </p>
            </div>
          }
        >
          <DashboardInner />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
