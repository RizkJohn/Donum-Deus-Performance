"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(
          typeof data?.detail === "string" ? data.detail : "Billing is not available yet.",
        );
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink3 transition-colors hover:text-ink disabled:opacity-60"
      >
        {busy ? "Opening billing…" : "Manage subscription"}
      </button>
      {error && (
        <p role="alert" className="text-[10px] tracking-[0.04em] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
