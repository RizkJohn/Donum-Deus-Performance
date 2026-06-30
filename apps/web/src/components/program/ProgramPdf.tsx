"use client";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  isEngineError,
  type Program,
  type ProgramRecord,
  type Session,
} from "@/lib/types";

// Brand palette (mirrors apps/web/src/app/globals.css :root tokens).
const C = {
  bg: "#e9e1d1",
  bg1: "#e2d9c6",
  bg2: "#dacfb9",
  line: "#c4b89e",
  ink: "#1d2a44",
  ink2: "#3a4862",
  ink3: "#857f6e",
  accent: "#1f3a5f",
  warm: "#94763c",
  sage: "#8ea88a",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.ink,
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: C.ink,
    paddingBottom: 10,
    marginBottom: 16,
  },
  wordmark: { fontFamily: "Times-Bold", fontSize: 26, letterSpacing: 2, color: C.ink },
  sub: { fontFamily: "Courier", fontSize: 7, letterSpacing: 2, color: C.ink3, marginTop: 3 },
  motto: { fontFamily: "Times-Italic", fontSize: 11, color: C.warm },
  rightLabel: { fontFamily: "Courier", fontSize: 7, letterSpacing: 2, color: C.accent, textTransform: "uppercase" },
  rightValue: { fontFamily: "Times-Bold", fontSize: 14, color: C.ink, marginTop: 2 },
  kicker: { fontFamily: "Courier", fontSize: 7, letterSpacing: 3, color: C.accent, textTransform: "uppercase", marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: C.line, backgroundColor: C.bg1, paddingVertical: 3, paddingHorizontal: 7, fontFamily: "Courier", fontSize: 7, color: C.ink2, textTransform: "uppercase", letterSpacing: 1 },
  readBox: { borderWidth: 1, borderColor: C.line, backgroundColor: C.bg1, marginBottom: 18 },
  readSummary: { fontFamily: "Times-Italic", fontSize: 11, color: C.ink2, lineHeight: 1.5, padding: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  statRow: { flexDirection: "row" },
  stat: { flex: 1, padding: 8, borderRightWidth: 1, borderRightColor: C.line },
  statLast: { flex: 1, padding: 8 },
  statLabel: { fontFamily: "Courier", fontSize: 6, letterSpacing: 1, color: C.warm, textTransform: "uppercase", marginBottom: 3 },
  statValue: { fontFamily: "Times-Bold", fontSize: 11, color: C.ink },
  splitRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 18 },
  splitCell: { borderTopWidth: 2, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg1, padding: 7, width: 70 },
  splitDay: { fontFamily: "Times-Bold", fontSize: 12, color: C.ink, textTransform: "uppercase" },
  splitCns: { fontFamily: "Courier", fontSize: 6, letterSpacing: 1, marginTop: 2, textTransform: "uppercase" },
  splitFocus: { fontSize: 7, color: C.ink3, marginTop: 2 },
  sectionTitle: { fontFamily: "Times-Bold", fontSize: 14, color: C.ink, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
  session: { borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, marginBottom: 10 },
  sessionHead: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.bg1, borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 6, paddingHorizontal: 10 },
  sessionDay: { fontFamily: "Times-Bold", fontSize: 13, color: C.ink, textTransform: "uppercase" },
  cnsTag: { fontFamily: "Courier", fontSize: 6, letterSpacing: 1, paddingVertical: 2, paddingHorizontal: 5, borderWidth: 1, textTransform: "uppercase" },
  block: { paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line },
  blockLabel: { fontFamily: "Courier", fontSize: 7, letterSpacing: 2, color: C.warm, textTransform: "uppercase", marginBottom: 5 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.line, paddingVertical: 3 },
  thRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 3, marginBottom: 1 },
  th: { fontFamily: "Courier", fontSize: 6, letterSpacing: 1, color: C.ink3, textTransform: "uppercase" },
  cExercise: { width: "40%", paddingRight: 4 },
  cSets: { width: "10%" },
  cReps: { width: "16%" },
  cRest: { width: "16%" },
  cNotes: { width: "18%" },
  exName: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: C.ink },
  cell: { fontSize: 8, color: C.ink2 },
  cellMuted: { fontSize: 7.5, color: C.ink3 },
  listRow: { borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, padding: 6, marginBottom: 3, fontSize: 8, color: C.ink2 },
  flagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
  flag: { borderWidth: 1, borderColor: C.accent, backgroundColor: "#1f3a5f12", color: C.accent, paddingVertical: 2, paddingHorizontal: 7, fontFamily: "Courier", fontSize: 7, textTransform: "uppercase" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerMotto: { fontFamily: "Times-Italic", fontSize: 7.5, color: C.warm, maxWidth: 360 },
  footerPage: { fontFamily: "Courier", fontSize: 7, color: C.ink3 },
});

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

function SessionCard({ session }: { session: Session }) {
  return (
    <View style={s.session} wrap={false}>
      <View style={s.sessionHead}>
        <Text style={s.sessionDay}>{session.day}</Text>
      </View>
      {session.blocks.map((block) => (
        <View key={block.type} style={s.block}>
          <Text style={s.blockLabel}>{block.type}</Text>
          <View style={s.thRow}>
            <Text style={[s.th, s.cExercise]}>Exercise</Text>
            <Text style={[s.th, s.cSets]}>Sets</Text>
            <Text style={[s.th, s.cReps]}>Reps</Text>
            <Text style={[s.th, s.cRest]}>Rest</Text>
            <Text style={[s.th, s.cNotes]}>Notes</Text>
          </View>
          {block.exercises.map((ex, i) => (
            <View key={`${ex.name}-${i}`} style={s.tr}>
              <Text style={[s.exName, s.cExercise]}>{ex.name}</Text>
              <Text style={[s.cell, s.cSets]}>{ex.sets}</Text>
              <Text style={[s.cell, s.cReps]}>{ex.reps}</Text>
              <Text style={[s.cell, s.cRest]}>{ex.rest}</Text>
              <Text style={[s.cellMuted, s.cNotes]}>{ex.notes}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function ProgramPdf({ record }: { record: ProgramRecord }) {
  const program = record.program;
  const generated = new Date(record.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const Footer = () => (
    <View style={s.footer} fixed>
      <Text style={s.footerMotto}>
        Deus. The body is a gift. Train it accordingly. — Not medical advice;
        this programme does not constitute clinical guidance.
      </Text>
      <Text
        style={s.footerPage}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );

  if (isEngineError(program)) {
    return (
      <Document title="Deus Performance — Program">
        <Page size="A4" style={s.page}>
          <View style={s.header}>
            <View>
              <Text style={s.wordmark}>DEUS</Text>
              <Text style={s.sub}>PERFORMANCE</Text>
            </View>
            <Text style={s.motto}>Donum Dei.</Text>
          </View>
          <Text style={s.sectionTitle}>Unsatisfiable constraints</Text>
          {program.reasons.map((r, i) => (
            <Text key={i} style={s.listRow}>
              — {r}
            </Text>
          ))}
          <Footer />
        </Page>
      </Document>
    );
  }

  const p: Program = program;
  const a = record.assessment;

  return (
    <Document title="Deus Performance — Weekly Program" author="Deus Performance">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.wordmark}>DEUS</Text>
            <Text style={s.sub}>PERFORMANCE · DONUM DEI</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.rightLabel}>Weekly Program</Text>
            <Text style={s.rightValue}>{generated}</Text>
          </View>
        </View>

        <View style={s.chipRow}>
          <Text style={s.chip}>{record.payload.goals.primary}</Text>
          <Text style={s.chip}>
            {record.payload.schedule.available_days.length} training days
          </Text>
          <Text style={s.chip}>
            {record.payload.schedule.session_duration} min sessions
          </Text>
          {a && <Text style={s.chip}>Readiness {Math.round(a.readiness_score * 100)}%</Text>}
        </View>

        {a && (
          <>
            <Text style={s.kicker}>The coach&apos;s read</Text>
            <View style={s.readBox}>
              <Text style={s.readSummary}>{a.summary}</Text>
              <View style={s.statRow}>
                <View style={s.stat}>
                  <Text style={s.statLabel}>Training state</Text>
                  <Text style={s.statValue}>{a.training_state.replace(/_/g, " ")}</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statLabel}>Stimulus</Text>
                  <Text style={s.statValue}>{a.recommended_stimulus.replace(/_/g, " ")}</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statLabel}>Intensity</Text>
                  <Text style={s.statValue}>{a.intensity_target}</Text>
                </View>
                <View style={s.statLast}>
                  <Text style={s.statLabel}>Range</Text>
                  <Text style={s.statValue}>{a.intensity_range}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <Text style={s.kicker}>Weekly split</Text>
        <View style={s.splitRow}>
          {p.weekly_split.map((d) => (
            <View
              key={d.day}
              style={[s.splitCell, { borderTopColor: d.cns === "High" ? C.warm : C.sage }]}
            >
              <Text style={s.splitDay}>{d.day.slice(0, 3)}</Text>
              <Text style={[s.splitCns, { color: d.cns === "High" ? C.warm : C.sage }]}>
                {d.cns} CNS
              </Text>
              <Text style={s.splitFocus}>{d.focus}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Sessions</Text>
        {p.sessions.map((session) => (
          <SessionCard key={session.day} session={session} />
        ))}

        {p.conditioning.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Conditioning</Text>
            {p.conditioning.map((c, i) => (
              <Text key={i} style={s.listRow}>
                {listItemText(c)}
              </Text>
            ))}
          </View>
        )}

        {p.mobility.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Mobility</Text>
            {p.mobility.map((m, i) => (
              <Text key={i} style={s.listRow}>
                {listItemText(m)}
              </Text>
            ))}
          </View>
        )}

        {p.flags.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>Flags</Text>
            <View style={s.flagRow}>
              {p.flags.map((f) => (
                <Text key={f} style={s.flag}>
                  {f}
                </Text>
              ))}
            </View>
          </View>
        )}

        <Footer />
      </Page>
    </Document>
  );
}

export default ProgramPdf;
