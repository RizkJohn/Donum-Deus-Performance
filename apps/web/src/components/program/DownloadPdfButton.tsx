"use client";

import { useState } from "react";
import type { ProgramRecord } from "@/lib/types";

export default function DownloadPdfButton({ record }: { record: ProgramRecord }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function handleDownload() {
    setBusy(true);
    setError(false);
    try {
      // Dynamic import: react-pdf renders entirely client-side (zero server
      // cost) and stays out of the server bundle.
      const [{ pdf }, { ProgramPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ProgramPdf"),
      ]);
      const blob = await pdf(<ProgramPdf record={record} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `deus-program-${record.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="btn-primary disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Preparing your document…" : "Download program (PDF)"}
      </button>
      {error && (
        <p role="alert" className="text-[10px] tracking-[0.06em] text-danger">
          The document could not be generated. Try again.
        </p>
      )}
    </div>
  );
}
