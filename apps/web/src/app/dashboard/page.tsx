import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProgramView from "@/components/program/ProgramView";
import CoachsRead from "@/components/program/CoachsRead";
import DownloadPdfButton from "@/components/program/DownloadPdfButton";
import LogoutButton from "@/components/dashboard/LogoutButton";
import ManageSubscriptionButton from "@/components/dashboard/ManageSubscriptionButton";
import { ApiError, getMyPrograms } from "@/lib/api";
import { isEngineError, type MyProgramsResponse, type ProgramRecord } from "@/lib/types";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your current program and training history.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/login?next=/dashboard");
  }

  let data: MyProgramsResponse;
  try {
    data = await getMyPrograms(token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login?next=/dashboard");
    }
    return (
      <>
        <Nav />
        <main className="min-h-screen pt-[60px]">
          <div className="mx-auto max-w-[560px] px-6 py-24">
            <p className="kicker mb-4">Dashboard unavailable</p>
            <h1 className="mb-5 font-play text-[32px] font-black leading-[1] tracking-[-0.02em] text-ink">
              We could not reach the engine.
            </h1>
            <p className="mb-8 font-bask text-[15px] leading-[1.8] text-ink2">
              Check your connection and try again.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const [current, ...history] = data.programs;

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <header className="border-b border-line bg-bg1 px-6 py-8 md:px-12">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-[7px] font-mono text-[8px] uppercase tracking-[0.24em] text-accent">
                Dashboard
              </p>
              <h1 className="font-play text-[26px] font-black uppercase tracking-[-0.01em] text-ink">
                {data.email}
              </h1>
              {data.state_summary && (
                <p className="mt-[6px] font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
                  Cycle {data.state_summary.cycle_count} · compliance{" "}
                  {Math.round(data.state_summary.compliance_score * 100)}%
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <ManageSubscriptionButton />
              <LogoutButton />
            </div>
          </div>
        </header>

        {!current ? (
          <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
            <p className="mb-2 font-play text-[15px] italic text-warm">Donum Dei.</p>
            <h2 className="mb-5 font-play text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-ink">
              No program yet.
            </h2>
            <p className="mb-8 font-bask text-[15px] leading-[1.8] text-ink2">
              Run the free assessment and your first week will appear here.
            </p>
            <Link href="/assess" className="btn-primary">
              Start free assessment →
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto max-w-[1180px] px-6 pt-10 md:px-12">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
                <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-accent">
                  Current program · {new Date(current.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {!isEngineError(current.program) && (
                  <DownloadPdfButton
                    record={{ ...current, email: data.email, state_summary: data.state_summary } as ProgramRecord}
                  />
                )}
              </div>
              {current.assessment && !isEngineError(current.program) && (
                <CoachsRead assessment={current.assessment} state={data.state_summary} />
              )}
            </div>
            {!isEngineError(current.program) && <ProgramView program={current.program} />}

            {history.length > 0 && (
              <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-12">
                <h2 className="kicker mb-4">History</h2>
                <ul className="flex flex-col gap-px border border-line bg-line">
                  {history.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/program/${p.id}`}
                        className="flex items-center justify-between gap-4 bg-bg px-5 py-4 text-[12px] text-ink2 transition-colors hover:bg-bg1"
                      >
                        <span>
                          {new Date(p.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent">
                          View →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
