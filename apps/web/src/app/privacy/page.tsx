import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Deus Performance",
  description:
    "How Deus Performance collects, uses, and protects your personal information, and how to exercise your data rights.",
};

const EFFECTIVE_DATE = "28 June 2026";

const SECTIONS = [
  {
    id: "who-we-are",
    title: "Who We Are",
    body: [
      "Deus Performance is operated by Riz Management LLC (\"we,\" \"us,\" \"our\"). We provide a constraint-driven adaptive training engine that generates personalised weekly training programmes from a structured assessment.",
      "Questions about this policy or requests to exercise your data rights should be directed through our correspondence page or by email to the address listed in the Contact section at the end of this document.",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
  {
    id: "what-we-collect",
    title: "Information We Collect",
    body: [
      "We collect only the information required to generate your training programme. No data is collected speculatively or in anticipation of future features.",
    ],
    items: [
      {
        label: "Contact information",
        detail:
          "Your email address, submitted on the final step of the assessment, used to associate your programme with a retrievable record.",
      },
      {
        label: "Physical profile",
        detail:
          "Age (years) and body weight (pounds). Used by the engine to establish baseline volume and load parameters.",
      },
      {
        label: "Training experience",
        detail:
          "Self-reported training age (Beginner, Intermediate, or Advanced). Used to calibrate exercise complexity and progression rate.",
      },
      {
        label: "Fitness goals",
        detail:
          "A primary goal and optional secondary goals selected from a fixed list. Used to weight the objective hierarchy that governs programme construction.",
      },
      {
        label: "Schedule",
        detail:
          "Available training days, session duration, and — if applicable — sport name and competition days. Used to distribute workload across the week and protect pre-sport days.",
      },
      {
        label: "Current state",
        detail:
          "Subjective 1–5 ratings for sleep quality, muscle soreness, energy level, and psychological stress, together with a selection of current pain or injury sites from a fixed list (Shoulder, Knee, Lower Back, Wrist, Ankle). Used to derive a fatigue state that modulates volume, and to route the programme around injured joints via approved substitutions.",
      },
    ],
    subsections: null as null | { label: string; items: string[] }[],
    footer:
      "We do not collect your name, phone number, payment card details, government-issued identifiers, location data, social media profiles, or any browsing history beyond what is implicit in the server receiving your request.",
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    body: [
      "Every data point collected is used for a single purpose: constructing and returning your training programme. Specifically:",
    ],
    items: [
      {
        label: "Programme generation",
        detail:
          "Your profile, goals, schedule, and state data are passed to the Deus Performance engine, which applies hard constraint rules and — optionally — an AI language model (Anthropic Claude) to produce the output. The model receives your structured inputs; it does not receive your email address.",
      },
      {
        label: "Programme retrieval",
        detail:
          "Your email address is stored alongside a unique programme identifier so that your generated week can be retrieved later if you return to the link.",
      },
      {
        label: "Service improvement",
        detail:
          "Aggregated, anonymised records of engine inputs and outputs may be reviewed to improve constraint rules and quality control. Individual records are not analysed for marketing purposes.",
      },
    ],
    subsections: null as null | { label: string; items: string[] }[],
    footer:
      "We do not use your information to send promotional email, serve targeted advertising, build demographic profiles, or sell your data. We have never sold personal information and will not do so.",
  },
  {
    id: "legal-basis",
    title: "Legal Basis for Processing (GDPR)",
    body: [
      "If you are located in the European Economic Area (EEA) or United Kingdom, we rely on the following legal bases under the General Data Protection Regulation (GDPR) and UK GDPR:",
    ],
    items: [
      {
        label: "Contract performance",
        detail:
          "Processing your assessment data and email address is necessary to deliver the training programme you requested — the service cannot function without it.",
      },
      {
        label: "Consent",
        detail:
          "Before submitting your assessment, you are asked to confirm that you have read and agree to this policy. You may withdraw consent at any time by requesting deletion of your data.",
      },
      {
        label: "Legitimate interests",
        detail:
          "We retain anonymised engine inputs to improve constraint accuracy, which constitutes a legitimate interest. We do not override your privacy rights in doing so.",
      },
    ],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
  {
    id: "data-sharing",
    title: "Data Sharing and Third Parties",
    body: [
      "We do not sell, rent, or trade your personal information. We share data with third parties only where technically necessary to operate the service:",
    ],
    items: [
      {
        label: "Anthropic (AI provider)",
        detail:
          "When the engine is configured to use Claude (Anthropic's AI model), your structured training payload — excluding your email address — is transmitted to Anthropic's API to generate exercise selections. Anthropic's data handling is governed by their own Privacy Policy and Data Processing Agreement. In default (mock) mode, no data leaves our servers.",
      },
      {
        label: "Google Fonts",
        detail:
          "Our website loads typefaces (Playfair Display, DM Mono, Libre Baskerville) from Google Fonts CDN. Google may log the font request; no personal data we hold is transmitted. See Google's Privacy Policy for details.",
      },
      {
        label: "Infrastructure providers",
        detail:
          "Our database and API are hosted on cloud infrastructure. These providers act as data processors under contractual obligations and do not use your data for their own purposes.",
      },
    ],
    subsections: null as null | { label: string; items: string[] }[],
    footer:
      "We may disclose your information if required by law, court order, or to protect the rights, property, or safety of Riz Management LLC or others. We will notify you to the extent permitted by law.",
  },
  {
    id: "cookies",
    title: "Cookies, Analytics, and Tracking",
    body: [
      "Deus Performance does not use cookies, browser storage, or client-side tracking of any kind. We do not operate an analytics platform, advertising pixel, or session-recording tool.",
      "The only network requests your browser makes are to load fonts from Google Fonts CDN and to communicate with our API when you submit the assessment. No tracking scripts execute on any page.",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
  {
    id: "data-retention",
    title: "Data Retention",
    body: [
      "Your assessment data and programme are retained indefinitely so that you can retrieve your programme via its unique link. We do not currently operate automated deletion schedules.",
      "You may request deletion of your data at any time — see Your Rights below. Upon a verified deletion request we will permanently remove your email address and all associated assessment records from our database within 30 days.",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: [
      "Depending on your location, you may have the following rights with respect to your personal information. We will respond to verified requests within the timeframes required by applicable law (generally 30 days, with a possible 30-day extension).",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: [
      {
        label: "GDPR Rights (EEA & UK residents)",
        items: [
          "Right of access — obtain a copy of the personal data we hold about you.",
          "Right to rectification — correct inaccurate data.",
          "Right to erasure — have your data deleted (right to be forgotten).",
          "Right to restriction — limit how we process your data.",
          "Right to data portability — receive your data in a structured, machine-readable format.",
          "Right to object — object to processing based on legitimate interests.",
          "Right to withdraw consent — withdraw consent at any time without affecting the lawfulness of prior processing.",
          "Right to lodge a complaint — with your local supervisory authority (e.g. ICO in the UK, your national DPA in the EU).",
        ],
      },
      {
        label: "CCPA / CPRA Rights (California residents)",
        items: [
          "Right to know — what personal information we collect, use, disclose, and sell (we do not sell).",
          "Right to delete — request deletion of your personal information.",
          "Right to correct — request correction of inaccurate personal information.",
          "Right to opt-out of sale or sharing — we do not sell or share personal information for cross-context behavioural advertising.",
          "Right to non-discrimination — we will not discriminate against you for exercising these rights.",
        ],
      },
    ],
    footer:
      "To exercise any of these rights, contact us via the Correspondence page or by email. Please include your email address as submitted in the assessment so we can locate your record. We may need to verify your identity before processing the request.",
  },
  {
    id: "children",
    title: "Children's Privacy (COPPA)",
    body: [
      "Deus Performance is not directed at children under the age of 13. Our assessment form requires a minimum age of 13 and will not process submissions from younger individuals.",
      "We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, contact us immediately and we will delete it without delay.",
      "Users between 13 and 17 should use the service with the knowledge and consent of a parent or legal guardian.",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
  {
    id: "security",
    title: "Data Security",
    body: [
      "We implement reasonable technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These include encrypted data transmission (HTTPS), security response headers, and restricted access to production database credentials.",
      "No method of transmission or storage is completely secure. While we work to protect your information, we cannot guarantee absolute security. In the event of a data breach that affects your rights and freedoms, we will notify relevant authorities and affected individuals as required by law.",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
  {
    id: "international",
    title: "International Data Transfers",
    body: [
      "Riz Management LLC is based in the United States. If you access the service from the EEA, UK, or another jurisdiction with data protection laws that differ from US law, your information will be transferred to and processed in the United States.",
      "Where required by law, we rely on appropriate transfer mechanisms (such as Standard Contractual Clauses for GDPR purposes) or the adequacy of protections in place with our service providers. By submitting the assessment and consenting to this policy, EEA and UK residents acknowledge this transfer.",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Material changes will be indicated by a revised effective date at the top of the page. We encourage you to review this policy periodically.",
      "Your continued use of the service following any update constitutes your acceptance of the revised terms.",
    ],
    items: null as null | { label: string; detail: string }[],
    subsections: null as null | { label: string; items: string[] }[],
    footer: null as string | null,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        <section className="mx-auto max-w-[860px] px-5 py-[52px] md:px-[32px]">
          <div className="kicker mb-[14px]">Legal</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[16px] text-ink"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Privacy <em className="text-warm">Policy.</em>
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[36px]">
            Effective date — {EFFECTIVE_DATE} · Riz Management LLC
          </p>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] mb-[48px]">
            This policy describes how Deus Performance (operated by Riz
            Management LLC) collects, uses, and protects your personal
            information when you use our assessment and training programme
            service. We collect the minimum data necessary to generate your
            programme. We do not sell your data. We do not run advertising.
          </p>

          {/* Table of contents */}
          <nav
            aria-label="Policy contents"
            className="mb-[52px] border border-line bg-bg1 px-[24px] py-[22px]"
          >
            <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-ink3 mb-[14px]">
              Contents
            </p>
            <ol className="flex flex-col gap-[6px]">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent hover:text-ink transition-colors"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent hover:text-ink transition-colors"
                >
                  {SECTIONS.length + 1}. Contact
                </a>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-[48px]">
            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-[6px]">
                  {i + 1}.
                </h2>
                <h3 className="font-play font-normal text-[22px] text-ink mb-[16px] leading-[1.2]">
                  {s.title}
                </h3>
                {s.body.map((p, pi) => (
                  <p
                    key={pi}
                    className="font-bask text-[14px] text-ink2 leading-[1.85] mb-[12px]"
                  >
                    {p}
                  </p>
                ))}
                {s.items && (
                  <ul className="flex flex-col gap-px bg-line border border-line my-[16px]">
                    {s.items.map((item) => (
                      <li
                        key={item.label}
                        className="bg-bg flex flex-col sm:flex-row items-stretch"
                      >
                        <div className="sm:min-w-[180px] sm:border-r border-b sm:border-b-0 border-line px-[16px] py-[12px] font-mono text-[9px] uppercase tracking-[0.12em] text-ink flex items-start flex-shrink-0 pt-[14px]">
                          {item.label}
                        </div>
                        <div className="px-[16px] py-[12px]">
                          <p className="font-bask text-[13px] text-ink2 leading-[1.8]">
                            {item.detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {s.subsections && (
                  <div className="flex flex-col gap-[24px] my-[16px]">
                    {s.subsections.map((sub) => (
                      <div
                        key={sub.label}
                        className="border border-line bg-bg1 px-[20px] py-[18px]"
                      >
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent mb-[12px]">
                          {sub.label}
                        </p>
                        <ul className="flex flex-col gap-[8px]">
                          {sub.items.map((item, ii) => (
                            <li key={ii} className="flex items-start gap-[10px]">
                              <span
                                aria-hidden="true"
                                className="shrink-0 text-accent mt-[1px] font-mono text-[10px]"
                              >
                                —
                              </span>
                              <span className="font-bask text-[13px] text-ink2 leading-[1.75]">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {s.footer && (
                  <p className="font-bask text-[14px] text-ink2 leading-[1.85] mt-[12px]">
                    {s.footer}
                  </p>
                )}
              </section>
            ))}

            {/* Contact section */}
            <section id="contact">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-[6px]">
                {SECTIONS.length + 1}.
              </h2>
              <h3 className="font-play font-normal text-[22px] text-ink mb-[16px] leading-[1.2]">
                Contact
              </h3>
              <p className="font-bask text-[14px] text-ink2 leading-[1.85] mb-[12px]">
                To exercise your data rights, report a concern, or ask a
                question about this policy, contact us through the Correspondence
                page or by email:
              </p>
              <div className="border border-line bg-bg1 px-[20px] py-[18px] mb-[24px]">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[4px]">
                  Data controller
                </p>
                <p className="font-bask text-[14px] text-ink mb-[16px]">
                  Riz Management LLC · Deus Performance
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[4px]">
                  Email
                </p>
                <p className="font-bask text-[14px] text-ink mb-[16px]">
                  privacy@deusperformance.com
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[4px]">
                  Web
                </p>
                <Link
                  href="/correspondence"
                  className="font-bask text-[14px] text-accent hover:text-ink transition-colors"
                >
                  deusperformance.com/correspondence
                </Link>
              </div>
              <p className="font-bask text-[14px] text-ink2 leading-[1.85]">
                EEA and UK residents who are unsatisfied with our response have
                the right to lodge a complaint with their national supervisory
                authority.
              </p>
            </section>
          </div>

          <hr className="border-0 h-px bg-line my-[52px]" />
          <div className="flex gap-6">
            <Link href="/terms" className="btn-ghost text-[10px]">
              Terms of Service &#8594;
            </Link>
            <Link href="/assess" className="btn-ghost text-[10px]">
              Begin Assessment &#8594;
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
