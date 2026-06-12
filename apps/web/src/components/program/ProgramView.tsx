import type { Program, Session } from "@/lib/types";

function listItemText(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name : JSON.stringify(item);
    const extras = ["duration", "intensity", "notes", "sets", "reps"]
      .map((k) => o[k])
      .filter((v): v is string | number => typeof v === "string" || typeof v === "number");
    return extras.length > 0 ? `${name} — ${extras.join(" · ")}` : name;
  }
  return String(item);
}

function SessionCard({ session, cns, focus }: { session: Session; cns?: string; focus?: string }) {
  return (
    <article className="overflow-hidden border border-line bg-bg">
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-bg1 px-5 py-[13px]">
        <h3 className="font-play text-[18px] font-black uppercase text-ink">
          {session.day}
        </h3>
        {cns && (
          <span
            className={`border px-[9px] py-[3px] font-mono text-[8px] uppercase tracking-[0.12em] ${
              cns === "High"
                ? "border-[rgba(196,154,82,0.28)] bg-[rgba(196,154,82,0.1)] text-warm"
                : "border-line bg-bg text-sage"
            }`}
          >
            {cns} CNS
          </span>
        )}
        {focus && (
          <span className="ml-auto text-[10px] text-ink3">{focus}</span>
        )}
      </header>
      {session.blocks.map((block) => (
        <section
          key={block.type}
          className="border-b border-line px-5 py-4 last:border-b-0"
        >
          <h4 className="mb-[11px] flex items-center gap-[10px] font-mono text-[8px] uppercase tracking-[0.22em] text-warm after:h-px after:flex-1 after:bg-line after:content-['']">
            {block.type}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Exercise", "Sets", "Reps", "Rest", "Notes"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="border-b border-line pb-[7px] pl-0 pr-4 text-left font-mono text-[7px] font-normal uppercase tracking-[0.16em] text-ink3 last:pr-0 [&:not(:first-child)]:pl-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.exercises.map((ex, i) => (
                  <tr key={`${ex.name}-${i}`}>
                    <td className="border-b border-line py-2 align-top font-mono text-[11px] font-medium text-ink [tr:last-child_&]:border-b-0">
                      {ex.name}
                    </td>
                    <td className="border-b border-line py-2 pl-4 align-top text-[11px] text-ink2 [tr:last-child_&]:border-b-0">
                      {ex.sets}
                    </td>
                    <td className="border-b border-line py-2 pl-4 align-top text-[11px] text-ink2 [tr:last-child_&]:border-b-0">
                      {ex.reps}
                    </td>
                    <td className="border-b border-line py-2 pl-4 align-top text-[11px] text-ink2 [tr:last-child_&]:border-b-0">
                      {ex.rest}
                    </td>
                    <td className="border-b border-line py-2 pl-4 align-top text-[11px] text-ink3 [tr:last-child_&]:border-b-0">
                      {ex.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </article>
  );
}

export default function ProgramView({ program }: { program: Program }) {
  const splitByDay = new Map(program.weekly_split.map((d) => [d.day, d]));

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-11 md:px-12">
      {/* Weekly split strip */}
      <h2 className="kicker mb-4">Weekly split</h2>
      <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {program.weekly_split.map((d) => (
          <div
            key={d.day}
            className={`relative overflow-hidden border border-line bg-bg p-[14px] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:content-[''] ${
              d.cns === "High" ? "before:bg-warm" : "before:bg-sage"
            }`}
          >
            <p className="mb-1 font-play text-[17px] font-black uppercase leading-none text-ink">
              {d.day.slice(0, 3)}
            </p>
            <p
              className={`mb-[3px] font-mono text-[7px] uppercase tracking-[0.18em] ${
                d.cns === "High" ? "text-warm" : "text-sage"
              }`}
            >
              {d.cns} CNS
            </p>
            <p className="text-[10px] leading-[1.35] text-ink3">{d.focus}</p>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <h2 className="kicker mb-4">Sessions</h2>
      <div className="flex flex-col gap-4">
        {program.sessions.map((s) => {
          const split = splitByDay.get(s.day);
          return (
            <SessionCard
              key={s.day}
              session={s}
              cns={split?.cns}
              focus={split?.focus}
            />
          );
        })}
      </div>

      {/* Conditioning */}
      {program.conditioning.length > 0 && (
        <section className="mt-10">
          <h2 className="kicker mb-4">Conditioning</h2>
          <ul className="flex flex-col gap-px border border-line bg-line">
            {program.conditioning.map((c, i) => (
              <li key={i} className="bg-bg px-5 py-3 text-[11px] text-ink2">
                {listItemText(c)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Mobility */}
      {program.mobility.length > 0 && (
        <section className="mt-10">
          <h2 className="kicker mb-4">Mobility</h2>
          <ul className="flex flex-col gap-px border border-line bg-line">
            {program.mobility.map((m, i) => (
              <li key={i} className="bg-bg px-5 py-3 text-[11px] text-ink2">
                {listItemText(m)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Flags */}
      {program.flags.length > 0 && (
        <section className="mt-10">
          <h2 className="kicker mb-4">Flags</h2>
          <ul className="flex flex-wrap gap-2">
            {program.flags.map((f) => (
              <li
                key={f}
                className="border border-accent3 bg-accent2 px-[11px] py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-accent"
              >
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
