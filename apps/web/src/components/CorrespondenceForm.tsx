"use client";

import { useState } from "react";

// Where correspondence is routed. Privacy / data-rights requests and general
// inquiries all reach a monitored inbox; the Privacy Policy and Terms name this
// same address as the channel for exercising data rights.
const ROUTING_EMAIL = "privacy@donumdeiperformance.com";

export default function CorrespondenceForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const given = String(data.get("givenName") ?? "").trim();
    const family = String(data.get("familyName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const inquiry = String(data.get("inquiry") ?? "general");
    const context = String(data.get("context") ?? "").trim();

    const subject = `Correspondence — ${inquiry} — ${given} ${family}`.trim();
    const body = [
      `Name: ${given} ${family}`,
      `Email: ${email}`,
      `Nature of inquiry: ${inquiry}`,
      "",
      context,
    ].join("\n");

    // Hand off to the visitor's mail client so the message is genuinely sent to
    // a monitored inbox (no server-side collection of this form's contents).
    window.location.href = `mailto:${ROUTING_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-line bg-bg1 p-[28px] text-center">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-accent mb-[10px]">
          Received
        </p>
        <p className="font-bask italic text-[14px] text-ink2 leading-[1.75]">
          Your correspondence has been routed to{" "}
          <a
            href={`mailto:${ROUTING_EMAIL}`}
            className="text-accent underline underline-offset-2 hover:text-ink transition-colors not-italic"
          >
            {ROUTING_EMAIL}
          </a>
          . If your mail client did not open, please write to us there directly.
          A reply will follow within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        <div>
          <label className="field-label" htmlFor="corr-given">Given Name</label>
          <input
            id="corr-given"
            name="givenName"
            type="text"
            required
            className="field-input"
            placeholder="John"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="corr-family">Family Name</label>
          <input
            id="corr-family"
            name="familyName"
            type="text"
            required
            className="field-input"
            placeholder="Smith"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        <div>
          <label className="field-label" htmlFor="corr-email">Email</label>
          <input
            id="corr-email"
            name="email"
            type="email"
            required
            className="field-input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="corr-inquiry">Nature of Inquiry</label>
          <select
            id="corr-inquiry"
            name="inquiry"
            className="field-input"
            defaultValue="general"
          >
            <option value="general">General inquiry</option>
            <option value="privacy">Privacy / data request</option>
            <option value="foundation">Level I — Foundation</option>
            <option value="practice">Level II — Practice</option>
            <option value="stewardship">Level III — Stewardship</option>
          </select>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="corr-context">Context</label>
        <textarea
          id="corr-context"
          name="context"
          rows={5}
          className="field-input resize-none"
          placeholder="Your objective, current situation, constraints, history — whatever provides relevant context for the inquiry."
        />
      </div>
      <button type="submit" className="btn-primary w-full text-center py-[13px]">
        Submit Correspondence
      </button>
    </form>
  );
}
