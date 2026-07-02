// Single source of truth for tier names, pricing, and feature lists —
// consumed by both the homepage Pricing section and the /curriculum page so
// the two can never drift out of sync again. `id` is also what's POSTed to
// `/v1/billing/checkout` — the API resolves the Stripe price from its own
// settings, so nothing Stripe-specific needs to live here.

export type TierId = "foundation" | "practice" | "stewardship";

export interface Tier {
  id: TierId;
  level: string;
  name: string;
  tagline: string;
  desc: string;
  price: number;
  period: string;
  featured: boolean;
  featuredLabel: string | null;
  // Short bullets for the homepage pricing cards.
  features: string[];
  // Fuller bullets, with response-time commitments, for /curriculum.
  includes: string[];
}

export const TIERS: Tier[] = [
  {
    id: "foundation",
    level: "Level I",
    name: "Foundation",
    tagline: "Self-directed",
    desc: "The complete engine, self-directed.",
    price: 20,
    period: "Per month · No minimum term",
    featured: false,
    featuredLabel: null,
    features: [
      "Adaptive weekly programs that learn from your history",
      "Your coach's read — readiness, stimulus, priorities — every week",
      "A downloadable, branded program PDF each cycle",
      "Fatigue check-ins, variation, and injury/equipment substitutions",
    ],
    includes: [
      "Program constructed from your intake profile",
      "Rebuild on demand when your state or schedule changes",
      "Full weekly structure and daily session detail",
      "Movement notes and substitution library",
      "Print and PDF export",
      "Written correspondence — 48-hour response",
    ],
  },
  {
    id: "practice",
    level: "Level II",
    name: "Practice",
    tagline: "Coach-reviewed",
    desc: "The engine, reviewed by a human coach.",
    price: 120,
    period: "Per month · No minimum term",
    featured: true,
    featuredLabel: "Most selected",
    features: [
      "Everything in Foundation",
      "Monthly coach review of your programming",
      "Weekly movement review via video submission",
      "Priority correspondence — 24-hour response",
    ],
    includes: [
      "Everything in Foundation",
      "Monthly 45-minute review with Deus Performance",
      "Weekly movement review via video submission",
      "Substitutions built for specific restrictions",
      "In-cycle program adjustments between rebuilds",
      "Priority correspondence — 24-hour response",
    ],
  },
  {
    id: "stewardship",
    level: "Level III",
    name: "Stewardship",
    tagline: "Coach-led",
    desc: "A dedicated coach, structured around your entire practice.",
    price: 240,
    period: "Per month · Six-month minimum",
    featured: false,
    featuredLabel: null,
    features: [
      "Everything in Practice",
      "Weekly one-on-one consultation",
      "Daily correspondence — 12-hour response",
      "Travel, event, and peak-output cycle planning",
    ],
    includes: [
      "Everything in Practice",
      "Weekly 30-minute consultation",
      "Daily correspondence — 12-hour response",
      "Quarterly assessment and full program recalibration",
      "Travel, event, and peak-output cycle planning",
      "Injury, setback, and return-to-practice management",
    ],
  },
];

export function tierById(id: string): Tier | undefined {
  return TIERS.find((t) => t.id === id);
}
