"use client";

import { useState } from "react";

export default function CorrespondenceForm() {
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("general");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/correspondence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          given_name: givenName,
          family_name: familyName,
          email,
          inquiry_type: inquiryType,
          message,
        }),
      });
      if (!res.ok) {
        throw new Error("Something went wrong sending your message. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-line bg-bg1 p-[28px] text-center">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-accent mb-[10px]">
          Received
        </p>
        <p className="font-bask italic text-[14px] text-ink2 leading-[1.75]">
          A reply will follow within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        <div>
          <label className="field-label">Given Name</label>
          <input
            type="text"
            required
            className="field-input"
            placeholder="John"
            value={givenName}
            onChange={(e) => setGivenName(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Family Name</label>
          <input
            type="text"
            required
            className="field-input"
            placeholder="Smith"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        <div>
          <label className="field-label">Email</label>
          <input
            type="email"
            required
            className="field-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Nature of Inquiry</label>
          <select
            className="field-input"
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
          >
            <option value="general">General inquiry</option>
            <option value="foundation">Level I — Foundation</option>
            <option value="practice">Level II — Practice</option>
            <option value="stewardship">Level III — Stewardship</option>
          </select>
        </div>
      </div>
      <div>
        <label className="field-label">Context</label>
        <textarea
          rows={5}
          required
          className="field-input resize-none"
          placeholder="Your objective, current situation, constraints, history — whatever provides relevant context for the inquiry."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-[11px] tracking-[0.04em] text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full text-center py-[13px] disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Sending…" : "Submit Correspondence"}
      </button>
    </form>
  );
}
