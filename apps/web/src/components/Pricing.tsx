"use client";

import { useState } from "react";
import Link from "next/link";
import { createCheckout, ApiError } from "@/lib/api";
import type { PricingTier } from "@/lib/types";

const TIERS: {
  name: string;
  tier: PricingTier;
  price: number;
  desc: string;
  featured: boolean;
  features: string[];
}[] = [
  {
    name: "Engine",
    tier: "engine",
    price: 49,
    desc: "The full adaptive engine, self-directed.",
    featured: false,
    features: [
      "AI-generated weekly programs",
      "Fatigue check-ins that adjust volume",
      "Equipment & injury substitutions",
      "Complete movement coverage, every week",
    ],
  },
  {
    name: "Hybrid",
    tier: "hybrid",
    price: 199,
    desc: "The engine, reviewed by a human coach.",
    featured: true,
    features: [
      "Everything in Engine",
      "Monthly coach review of your programming",
      "Form feedback on submitted video",
      "Direct messaging with your coach",
    ],
  },
  {
    name: "Premium",
    tier: "premium",
    price: 750,
    desc: "A dedicated coach, engine-assisted.",
    featured: false,
    features: [
      "Everything in Hybrid",
      "Dedicated coach",
      "Custom periodization across training blocks",
      "Weekly one-on-one consults",
    ],
  },
];

function CheckoutButton({
  tier,
  featured,
}: {
  tier: PricingTier;
  featured: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const token = typeof window !== "undefined" ? localStorage.getItem("dp_token") : null;
    if (!token) {
      window.location.href = "/sign-in";
      return;
    }
    setLoading(true);
    try {
      const { url } = await createCheckout(tier);
      window.location.href = url;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/sign-in";
      }
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full px-[18px] py-[13px] text-center font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#0b0f0c] transition-opacity hover:opacity-80 disabled:opacity-50 ${
        featured ? "bg-warm" : "bg-accent"
      }`}
    >
      {loading ? "Redirecting…" : "Get started →"}
    </button>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1280px] scroll-mt-[60px] px-6 py-24 md:px-12">
      <p className="kicker mb-4">Pricing</p>
      <h2 className="mb-7 font-play text-[clamp(36px,5vw,62px)] font-black leading-[0.94] tracking-[-0.02em] text-ink">
        Choose your <em className="font-normal italic text-warm">measure.</em>
      </h2>
      <p className="max-w-[560px] font-bask text-[16px] leading-[1.8] text-ink2">
        Start with the free assessment — no card required. See your first
        program before you decide anything.
      </p>

      <div className="mt-11 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col p-[30px] pt-10 transition-colors ${
              t.featured ? "bg-bg2" : "bg-bg hover:bg-bg1"
            }`}
          >
            {t.featured && (
              <span className="absolute right-[14px] top-[14px] bg-accent px-[10px] py-1 font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-[#0b0f0c]">
                Most popular
              </span>
            )}
            <p className="mb-[14px] font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
              {t.name === "Engine"
                ? "Self-directed"
                : t.name === "Hybrid"
                  ? "Coach-reviewed"
                  : "Coach-led"}
            </p>
            <h3 className="mb-[6px] font-play text-[20px] font-bold uppercase tracking-[0.02em] text-ink">
              {t.name}
            </h3>
            <p className="mb-6 min-h-[40px] font-bask text-[13px] italic leading-[1.6] text-ink3">
              {t.desc}
            </p>
            <p className="font-play text-[52px] font-black leading-none tracking-[-0.02em] text-ink">
              <em className="mr-[3px] text-[20px] font-normal italic text-ink3">
                $
              </em>
              {t.price}
            </p>
            <p className="mb-[26px] mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">
              Per month
            </p>
            <ul className="mb-7 flex flex-1 flex-col gap-[10px]">
              {t.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-[10px] text-[11px] leading-[1.6] text-ink2"
                >
                  <span aria-hidden="true" className="shrink-0 text-accent">
                    —
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton tier={t.tier} featured={t.featured} />
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-ink3">
        Start with the free assessment — no card required.
      </p>
    </section>
  );
}
