import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProgramView from "@/components/program/ProgramView";
import CoachsRead from "@/components/program/CoachsRead";
import CheckInForm from "@/components/program/CheckInForm";
import DownloadPdfButton from "@/components/program/DownloadPdfButton";
import { getProgram } from "@/lib/api";
import { fatigueStateFor, isEngineError, type ProgramRecord } from "@/lib/types";
import { TIERS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Weekly Program",
  description: "Your engine-generated weekly training program.",
  robots: { index: false, follow: false },
};

function FailureNotice({
  title,
  body,
  reasons,
}: {
  title: string;
  body: string;
  reasons?: string[];
}) {
  return (
    <div className="mx-auto max-w-[560px] px-6 py-24">
      <p className="kicker mb-4">Program unavailable</p>
      <h1 className="mb-5 font-play text-[32px] font-black leading-[1] tracking-[-0.02em] text-ink">
        {title}
      </h1>
      <p className="mb-8 font-bask text-[15px] leading-[1.8] text-ink2">
        {body}
      </p>
      {reasons && reasons.length > 0 && (
        <ul className="mb-8 flex flex-col gap-px border border-line bg-line">
          {reasons.map((r) => (
            <li
              key={r}
              className="flex items-start gap-3 bg-bg px-5 py-4 text-[12px] leading-[1.7] text-ink2"
            >
              <span aria-hidden="true" className="shrink-0 text-danger">
                —
              </span>
              {r}
            </li>
          ))}
        </ul>
      )}
      <Link href="/assess" className="btn-primary">
        Start a new assessment →
      </Link>
    </div>
  );
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let record: ProgramRecord | null = null;
  let failed = false;
  try {
    record = await getProgram(id);
  } catch {
    failed = true;
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        {failed || !record ? (
          <FailureNotice
            title="This program could not be found."
            body="The link may be incorrect, the program may have expired, or the engine may be unreachable. Run a fresh assessment — it takes two minutes."
          />
        ) : isEngineError(record.program) ? (
          <FailureNotice
            title="The engine declined to compromise."
            body="A complete, safe week could not be built from the submitted constraints. Rather than deliver a degraded program, the engine returned the conflict. Adjust your answers and run the assessment again."
            reasons={record.program.reasons}
          />
        ) : (
          <>
            <header className="border-b border-line bg-bg1 px-6 py-8 md:px-12">
              <div className="mx-auto max-w-[1180px]">
                <p className="mb-[7px] font-mono text-[8px] uppercase tracking-[0.24em] text-accent">
                  Engine output · Validated
                </p>
                <h1 className="mb-[9px] font-play text-[26px] font-black uppercase tracking-[-0.01em] text-ink">
                  Your weekly program
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-accent3 bg-accent2 px-[11px] py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-accent">
                    {record.payload.goals.primary}
                  </span>
                  <span className="border border-line bg-bg px-[11px] py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
                    {record.payload.schedule.available_days.length} training days
                  </span>
                  <span className="border border-line bg-bg px-[11px] py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
                    {record.payload.schedule.session_duration} min sessions
                  </span>
                  <span className="border border-line bg-bg px-[11px] py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
                    Fatigue: {fatigueStateFor((record.payload.state.sleep + record.payload.state.soreness + record.payload.state.energy + record.payload.state.stress) / 4)}
                  </span>
                  <span className="border border-line bg-bg px-[11px] py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
                    Generated {new Date(record.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            </header>
            <div className="mx-auto max-w-[1180px] px-6 pt-10 md:px-12">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
                <p className="max-w-[440px] font-bask text-[14px] italic leading-[1.7] text-ink2">
                  Your complete week, validated and ready. Keep the document —
                  it is yours.
                </p>
                <DownloadPdfButton record={record} />
              </div>
              {record.assessment && (
                <CoachsRead
                  assessment={record.assessment}
                  state={record.state_summary}
                />
              )}
            </div>
            <ProgramView program={record.program} />
            <div className="mx-auto max-w-[1180px] px-6 md:px-12">
              <CheckInForm runId={record.id} email={null} />
            </div>
            <section className="border-t border-line px-6 py-16 text-center md:px-12">
              <p className="mb-2 font-play text-[15px] italic text-warm">
                Donum Dei.
              </p>
              <p className="mx-auto mb-8 max-w-[420px] font-bask text-[15px] leading-[1.8] text-ink2">
                This is week one. Keep the engine adapting to you — fatigue
                check-ins, progression, variation, substitutions — from
                ${TIERS[0].price}/month.
              </p>
              <Link href="/#pricing" className="btn-primary">
                See plans
              </Link>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
