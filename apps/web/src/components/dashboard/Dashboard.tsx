"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { listMyPrograms } from "@/lib/api";
import type { MyProgram } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProgramCard({ p }: { p: MyProgram }) {
  const days = p.payload.schedule.available_days.length;
  return (
    <Link
      href={`/program/${p.id}`}
      className="group flex flex-col border border-line bg-bg1 p-5 transition-colors hover:border-line2"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink3">
          {formatDate(p.created_at)}
        </span>
        {p.is_error ? (
          <span className="border border-[rgba(184,68,68,0.28)] bg-[rgba(184,68,68,0.1)] px-[9px] py-[2px] font-mono text-[8px] uppercase tracking-[0.12em] text-danger">
            Constraints not satisfiable
          </span>
        ) : (
          <span className="border border-accent3 bg-accent2 px-[9px] py-[2px] font-mono text-[8px] uppercase tracking-[0.12em] text-accent">
            Valid program
          </span>
        )}
      </div>
      <h3 className="mb-3 font-play text-[20px] font-black leading-[1.1] tracking-[-0.01em] text-ink">
        {p.payload.goals.primary}
      </h3>
      <div className="flex flex-wrap gap-2">
        <span className="border border-line bg-bg px-[10px] py-[3px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
          {p.payload.client_profile.training_age}
        </span>
        <span className="border border-line bg-bg px-[10px] py-[3px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
          {days} training {days === 1 ? "day" : "days"}
        </span>
      </div>
      <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-ink3 transition-colors group-hover:text-accent">
        View program →
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border border-line bg-bg1 px-6 py-16 text-center">
      <p className="mb-2 font-play text-[15px] italic text-warm">Donum Dei.</p>
      <h2 className="mb-3 font-play text-[24px] font-black leading-[1.1] tracking-[-0.01em] text-ink">
        No programs yet.
      </h2>
      <p className="mx-auto mb-7 max-w-[380px] font-bask text-[15px] leading-[1.8] text-ink2">
        Take the two-minute assessment and the engine will build your first
        complete, CNS-managed week.
      </p>
      <Link href="/assess" className="btn-primary">
        Take the assessment →
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [programs, setPrograms] = useState<MyProgram[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Protect the route once auth has resolved.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Load the user's programs.
  useEffect(() => {
    if (!token) return;
    let active = true;
    listMyPrograms(token)
      .then((res) => {
        if (active) setPrograms(res);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [token]);

  function handleSignOut() {
    logout();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <div
        className="flex items-center justify-center px-6 py-32"
        role="status"
        aria-live="polite"
      >
        <p className="animate-pulse font-play text-[48px] font-black italic text-line2">
          D.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-14 md:px-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="kicker mb-3">Your account</p>
          <h1 className="mb-1 font-play text-[30px] font-black leading-[1] tracking-[-0.02em] text-ink">
            Welcome back.
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink3">
            {user.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/assess" className="btn-primary">
            Generate a new program →
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="btn-ghost"
          >
            Sign out
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="border border-[rgba(184,68,68,0.28)] bg-[rgba(184,68,68,0.1)] px-5 py-4 text-[12px] leading-[1.7] text-danger">
          We could not load your programs. Refresh the page to try again.
        </div>
      ) : programs === null ? (
        <div
          className="flex items-center justify-center px-6 py-24"
          role="status"
          aria-live="polite"
        >
          <p className="animate-pulse font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
            Loading your programs…
          </p>
        </div>
      ) : programs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
            {programs.length} {programs.length === 1 ? "program" : "programs"} ·
            newest first
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
