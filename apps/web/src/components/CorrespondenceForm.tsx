"use client";

import { useState } from "react";

export default function CorrespondenceForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-line bg-bg1 p-[28px] text-center">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-accent mb-[10px]">
          Received
        </p>
        <p className="font-bask italic text-[14px] text-ink2 leading-[1.75]">
          We&apos;ll reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
        <div>
          <label className="field-label">First Name</label>
          <input
            type="text"
            required
            className="field-input"
            placeholder="John"
          />
        </div>
        <div>
          <label className="field-label">Last Name</label>
          <input
            type="text"
            required
            className="field-input"
            placeholder="Smith"
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
          />
        </div>
        <div>
          <label className="field-label">What&apos;s This About?</label>
          <select className="field-input" defaultValue="general">
            <option value="general">General enquiry</option>
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
          className="field-input resize-none"
          placeholder="Your goal, current situation, constraints, history — whatever's relevant."
        />
      </div>
      <button type="submit" className="btn-primary w-full text-center py-[13px]">
        Send Correspondence
      </button>
    </form>
  );
}
