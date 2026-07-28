import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Donum Dei Performance",
  description:
    "How Donum Dei Performance collects, uses, and protects your personal information, and how to exercise your data rights.",
};

const EFFECTIVE_DATE = "28 June 2026";

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
            Effective date — {EFFECTIVE_DATE} &nbsp;·&nbsp; Riz Management LLC
          </p>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] mb-[16px]">
            Donum Dei Performance is operated by Riz Management LLC, a US entity.
            Most of our clients are US residents. This policy is written
            primarily to satisfy US federal and state privacy requirements, and
            is structured to meet equivalent standards in any other jurisdiction
            where our service is accessible.
          </p>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] mb-[48px]">
            We collect the minimum data necessary to generate your program. We
            do not sell your data, share it for advertising, or run tracking of
            any kind.
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
              {[
                ["#who-we-are", "Who We Are"],
                ["#what-we-collect", "Information We Collect"],
                ["#health-data", "Health & Wellness Data"],
                ["#how-we-use", "How We Use Your Information"],
                ["#no-sale", "We Do Not Sell Your Data"],
                ["#data-sharing", "Data Sharing and Third Parties"],
                ["#cookies", "Cookies, Analytics, and Tracking"],
                ["#data-retention", "Data Retention"],
                ["#us-rights", "Your Rights — US Residents"],
                ["#international-rights", "Your Rights — International"],
                ["#children", "Children's Privacy (COPPA)"],
                ["#security", "Data Security"],
                ["#changes", "Changes to This Policy"],
                ["#contact", "Contact"],
              ].map(([href, label], i) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-mono text-[9px] uppercase tracking-[0.1em] text-accent hover:text-ink transition-colors"
                  >
                    {i + 1}. {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-[48px]">

            {/* 1 */}
            <section id="who-we-are">
              <SectionNumber n={1} />
              <h2 className="section-head">Who We Are</h2>
              <P>
                Donum Dei Performance is operated by Riz Management LLC
                (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;). We
                are a US-based company providing a constraint-driven adaptive
                training engine that generates personalized weekly training
                programs from a structured assessment. Our service is available
                to users globally; where local law imposes requirements beyond
                what this policy already satisfies, we comply with those
                requirements.
              </P>
              <P>
                Questions about this policy or requests to exercise your data
                rights should be directed through our correspondence page or by
                email to the address listed in the Contact section.
              </P>
            </section>

            {/* 2 */}
            <section id="what-we-collect">
              <SectionNumber n={2} />
              <h2 className="section-head">Information We Collect</h2>
              <P>
                We collect only the information required to generate your
                training program. No data is collected speculatively.
              </P>
              <Table
                rows={[
                  {
                    label: "Contact information",
                    detail:
                      "Your email address, submitted on the final step of the assessment, used to associate your program with a retrievable record.",
                  },
                  {
                    label: "Physical profile",
                    detail:
                      "Age (years) and body weight (pounds). Used to establish baseline volume and load parameters.",
                  },
                  {
                    label: "Training experience",
                    detail:
                      "Self-reported training age (Beginner, Intermediate, or Advanced). Used to calibrate exercise complexity and progression rate.",
                  },
                  {
                    label: "Fitness goals",
                    detail:
                      "Primary goal and optional secondary goals selected from a fixed list. Used to weight the objective hierarchy governing program construction.",
                  },
                  {
                    label: "Schedule",
                    detail:
                      "Available training days, session duration, and — if applicable — sport name and sport days. Used to distribute workload and protect pre-sport days.",
                  },
                  {
                    label: "Health & wellness state",
                    detail:
                      "Subjective 1–5 ratings for sleep quality, muscle soreness, energy level, and psychological stress, plus current pain or injury sites (Shoulder, Knee, Lower Back, Wrist, Ankle). Treated as sensitive personal information — see Section 3.",
                  },
                ]}
              />
              <P>
                We do not collect your name, phone number, payment card details,
                government-issued identifiers, precise location, biometric data,
                social media profiles, race, ethnicity, religion, sexual
                orientation, or any financial information.
              </P>
            </section>

            {/* 3 */}
            <section id="health-data">
              <SectionNumber n={3} />
              <h2 className="section-head">Health &amp; Wellness Data</h2>
              <P>
                The state data collected in the assessment — injury sites, sleep
                quality, soreness, energy, and stress scores — constitutes
                health and wellness information. While Donum Dei Performance is not a
                covered entity under HIPAA (we are a fitness education service,
                not a healthcare provider), we treat this data with the
                heightened protections required by US state laws that
                specifically regulate consumer health data.
              </P>
              <P>
                In particular, we comply with the{" "}
                <strong className="text-ink">
                  Washington My Health MY Data Act (MHMD)
                </strong>{" "}
                and treat health and wellness data as{" "}
                <strong className="text-ink">
                  sensitive personal information
                </strong>{" "}
                under the California Consumer Privacy Act / California Privacy
                Rights Act (CCPA/CPRA) and equivalent state laws.
              </P>
              <div className="border border-line bg-bg1 px-[20px] py-[18px] my-[16px]">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent mb-[12px]">
                  Commitments for health & wellness data
                </p>
                <BulletList
                  items={[
                    "Used exclusively to generate your training program — not for any other purpose.",
                    "Never sold, shared for advertising, or disclosed to insurers, employers, or data brokers.",
                    "Not used to make decisions about your insurance, employment, credit, or housing.",
                    "Transmitted to Anthropic's API (when Claude is the configured LLM provider) only as structured fitness inputs — your email is never included in AI model calls.",
                    "Deleted permanently upon a verified erasure request within 30 days.",
                  ]}
                />
              </div>
              <P>
                You may request deletion of your health data at any time
                independently of your other data — see Section 9 (Your Rights).
              </P>
            </section>

            {/* 4 */}
            <section id="how-we-use">
              <SectionNumber n={4} />
              <h2 className="section-head">How We Use Your Information</h2>
              <P>
                Every data point collected serves a single operational purpose:
                constructing and returning your training program.
              </P>
              <Table
                rows={[
                  {
                    label: "Program generation",
                    detail:
                      "Your profile, goals, schedule, and state are passed to the engine, which applies hard constraint rules and — optionally — an AI language model to produce exercise selections and load parameters.",
                  },
                  {
                    label: "Program retrieval",
                    detail:
                      "Your email is stored alongside a unique program ID so your generated week can be retrieved via the link we return.",
                  },
                  {
                    label: "Service improvement",
                    detail:
                      "Aggregated, anonymised engine inputs and outputs may be reviewed to improve constraint accuracy and quality control logic. Individual records are not profiled for marketing.",
                  },
                ]}
              />
              <P>
                We do not use your data to send promotional email, serve
                advertising, build behavioral profiles, infer characteristics
                you have not disclosed, or train AI models on your personal
                information.
              </P>
            </section>

            {/* 5 */}
            <section id="no-sale">
              <SectionNumber n={5} />
              <h2 className="section-head">We Do Not Sell Your Data</h2>
              <div className="border border-line bg-bg1 px-[20px] py-[18px]">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent mb-[10px]">
                  Explicit statement — required by multiple US state laws
                </p>
                <p className="font-bask text-[14px] text-ink leading-[1.85]">
                  Riz Management LLC does not sell, rent, trade, or share your
                  personal information with third parties for monetary or other
                  valuable consideration. We have never done so. We do not share
                  your personal information for cross-context behavioral
                  advertising. This applies to all categories of personal
                  information we hold, including health and wellness data.
                </p>
              </div>
              <P className="mt-[16px]">
                If our data practices ever change to include any form of sale or
                sharing for advertising, we will update this policy, provide
                notice, and obtain any consent required by applicable law before
                doing so. US residents have the right to opt out of such sale or
                sharing at any time under their applicable state law (see Section
                9) — that right is moot today because no sale or sharing occurs.
              </P>
            </section>

            {/* 6 */}
            <section id="data-sharing">
              <SectionNumber n={6} />
              <h2 className="section-head">Data Sharing and Third Parties</h2>
              <P>
                We share data with third parties only where technically necessary
                to operate the service:
              </P>
              <Table
                rows={[
                  {
                    label: "Anthropic (AI provider)",
                    detail:
                      "When the engine is configured to use Claude, your structured training payload — excluding your email address — is transmitted to Anthropic's API to generate exercise selections. Anthropic's data handling is governed by their own Privacy Policy and Data Processing Agreement. In default mode no data leaves our servers.",
                  },
                  {
                    label: "Google Fonts",
                    detail:
                      "Our website loads typefaces from Google Fonts CDN. Google may log the font request; no personal data we hold is transmitted. See Google's Privacy Policy for details.",
                  },
                  {
                    label: "Infrastructure providers",
                    detail:
                      "Our database and API are hosted on cloud infrastructure. Providers act as data processors under contractual obligations and do not use your data for their own purposes.",
                  },
                ]}
              />
              <P>
                We may disclose personal information if required by a valid
                court order, subpoena, or legal process, or to protect the
                rights, property, or safety of Riz Management LLC, our users, or
                the public. We will notify you to the extent legally permitted
                before complying with such a request.
              </P>
            </section>

            {/* 7 */}
            <section id="cookies">
              <SectionNumber n={7} />
              <h2 className="section-head">
                Cookies, Analytics, and Tracking
              </h2>
              <P>
                Donum Dei Performance does not use cookies, browser storage (localStorage
                or sessionStorage), or client-side tracking of any kind. We do not
                operate an analytics platform, advertising pixel, session-recording
                tool, or fingerprinting script.
              </P>
              <P>
                The only network requests your browser makes while using this site
                are to load typefaces from Google Fonts CDN and to communicate with
                our API when you submit the assessment. No tracking scripts execute
                on any page.
              </P>
              <P>
                Because we do not use cookies or tracking, no cookie consent banner
                or opt-out mechanism is required. If this changes, we will update
                this policy and implement any required consent mechanism before
                deploying new tracking.
              </P>
            </section>

            {/* 8 */}
            <section id="data-retention">
              <SectionNumber n={8} />
              <h2 className="section-head">Data Retention</h2>
              <P>
                Your assessment data and program are retained so that you can
                retrieve your program via its unique link. We do not currently
                operate automated deletion schedules.
              </P>
              <P>
                You may request deletion of your data at any time — see Section 9.
                Upon a verified deletion request we will permanently remove your
                email address and all associated assessment records from our
                database within 30 days, consistent with our obligations under
                CCPA/CPRA, the Washington MHMD Act, and equivalent state and
                international laws.
              </P>
            </section>

            {/* 9 */}
            <section id="us-rights">
              <SectionNumber n={9} />
              <h2 className="section-head">Your Rights — US Residents</h2>
              <P>
                The United States Federal Trade Commission (FTC) requires that
                privacy policies accurately describe data practices, which this
                policy does. A growing number of US states have enacted
                comprehensive consumer privacy laws that give residents specific
                rights over their personal information. We honor those rights
                for all users, not only residents of states that mandate them.
              </P>

              {/* FTC */}
              <SubBox label="Federal (FTC Act)">
                <BulletList
                  items={[
                    "You can contact us if you believe our stated privacy practices are inaccurate or misleading.",
                    "The FTC enforces accurate data-practice disclosures. If you have an unresolved concern, you may file a complaint at ftc.gov/complaint.",
                  ]}
                />
              </SubBox>

              {/* Multi-state rights */}
              <SubBox
                label="State consumer privacy rights — all major US state laws"
                note="California (CCPA/CPRA), Texas (TDPSA), Virginia (CDPA), Colorado (CPA), Connecticut (CTDPA), Florida (FDBR), Utah (UCPA), Oregon (OCPA), Montana, Nevada, and others"
              >
                <BulletList
                  items={[
                    "Right to know — what categories and specific pieces of personal information we collect, use, disclose, and sell (we do not sell).",
                    "Right to access — obtain a copy of the personal information we hold about you.",
                    "Right to delete — request deletion of your personal information. We will delete it within 30 days of a verified request.",
                    "Right to correct — request correction of inaccurate personal information.",
                    "Right to opt out of sale or sharing — we do not sell or share personal information for advertising. This right is granted but there is nothing to opt out of.",
                    "Right to non-discrimination — we will not deny service, charge different prices, or provide a lesser quality of service because you exercised a privacy right.",
                    "Right to data portability — receive your data in a structured, machine-readable format.",
                  ]}
                />
              </SubBox>

              {/* MHMD */}
              <SubBox label="Washington My Health MY Data Act (MHMD) — health & wellness data">
                <BulletList
                  items={[
                    "You may request that we stop collecting your consumer health data at any time by ceasing use of the assessment.",
                    "You may request deletion of all health and wellness data we hold for your email address.",
                    "We will not sell, share, or use your health data for purposes beyond generating your program.",
                    "We obtained your affirmative consent before collecting health data, via the consent checkbox on the assessment form.",
                  ]}
                />
              </SubBox>

              {/* COPPA */}
              <SubBox label="Children's Online Privacy Protection Act (COPPA)">
                <BulletList
                  items={[
                    "The Service is not directed at children under 13. Our assessment enforces a minimum age of 13.",
                    "We do not knowingly collect personal information from children under 13.",
                    "Parents or guardians who believe their child has submitted data may contact us for immediate deletion.",
                  ]}
                />
              </SubBox>

              <P>
                To exercise any of these rights, contact us via the
                Correspondence page or by email (see Section 14). Please include
                the email address you submitted in the assessment. We will verify
                your identity before processing the request and respond within
                the timeframe required by your state&rsquo;s law (generally 45
                days, with a possible 45-day extension).
              </P>
            </section>

            {/* 10 */}
            <section id="international-rights">
              <SectionNumber n={10} />
              <h2 className="section-head">Your Rights — International</h2>
              <P>
                Our service is accessible globally. We apply the same data
                minimization and rights-honoring approach regardless of
                jurisdiction. The following summarizes rights under the major
                international frameworks applicable to non-US users.
              </P>

              <SubBox label="EU General Data Protection Regulation (GDPR) & UK GDPR">
                <P className="mb-[12px]">
                  Legal bases: contract performance (generating the program
                  you requested), consent (checkbox at assessment submission),
                  and legitimate interests (improving constraint accuracy via
                  anonymised data). You may withdraw consent at any time by
                  requesting deletion.
                </P>
                <BulletList
                  items={[
                    "Right of access (Art. 15) — obtain a copy of personal data we hold.",
                    "Right to rectification (Art. 16) — correct inaccurate data.",
                    "Right to erasure (Art. 17) — have your data deleted.",
                    "Right to restriction (Art. 18) — limit processing.",
                    "Right to portability (Art. 20) — receive data in structured format.",
                    "Right to object (Art. 21) — object to processing based on legitimate interests.",
                    "Right to lodge a complaint with your national supervisory authority (e.g. ICO in the UK, your national DPA in the EU).",
                  ]}
                />
                <P className="mt-[12px]">
                  International transfers: we are US-based; transfers from the
                  EEA/UK to the US rely on standard contractual clauses where
                  required or the adequacy of our service providers&rsquo;
                  protections.
                </P>
              </SubBox>

              <SubBox label="Canada (PIPEDA / provincial laws)">
                <BulletList
                  items={[
                    "You may request access to your personal information and correction of inaccuracies.",
                    "You may withdraw consent, subject to legal or contractual restrictions.",
                    "Complaints may be directed to the Office of the Privacy Commissioner of Canada.",
                  ]}
                />
              </SubBox>

              <SubBox label="Australia (Privacy Act 1988)">
                <BulletList
                  items={[
                    "You may request access to and correction of your personal information.",
                    "Complaints may be directed to the Office of the Australian Information Commissioner.",
                  ]}
                />
              </SubBox>

              <SubBox label="Brazil (LGPD) / other jurisdictions">
                <P>
                  We apply the rights most analogous to those in your
                  jurisdiction (access, correction, deletion, portability, and
                  objection). Contact us and we will honor the applicable
                  requirements.
                </P>
              </SubBox>
            </section>

            {/* 11 */}
            <section id="children">
              <SectionNumber n={11} />
              <h2 className="section-head">Children&rsquo;s Privacy (COPPA)</h2>
              <P>
                Donum Dei Performance is not directed at children under the age of 13.
                Our assessment enforces a minimum age of 13 and rejects
                submissions below this threshold in compliance with the
                Children&rsquo;s Online Privacy Protection Act (COPPA).
              </P>
              <P>
                We do not knowingly collect, use, or disclose personal
                information from children under 13. If you believe we have
                inadvertently collected such information, contact us immediately
                and we will delete it without delay and without charge.
              </P>
              <P>
                Users between 13 and 17 should use the service with the knowledge
                and consent of a parent or legal guardian.
              </P>
            </section>

            {/* 12 */}
            <section id="security">
              <SectionNumber n={12} />
              <h2 className="section-head">Data Security</h2>
              <P>
                We implement reasonable technical and organizational measures to
                protect your personal information. These include:
              </P>
              <BulletList
                items={[
                  "Encrypted data transmission (HTTPS/TLS) for all traffic.",
                  "HTTP security response headers (Content-Security-Policy, Strict-Transport-Security with HSTS preload, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).",
                  "Rate limiting on assessment endpoints to prevent automated abuse.",
                  "Restricted access to production database credentials.",
                  "No storage of payment card data (we use third-party payment processors for any paid tiers).",
                ]}
              />
              <P>
                No method of transmission or storage is completely secure. We
                cannot guarantee absolute security. In the event of a data breach
                that is likely to result in a risk to your rights and freedoms,
                we will notify you and relevant authorities as required by
                applicable law — within 72 hours for GDPR-covered individuals,
                and within the timeframe required by applicable US state breach
                notification laws.
              </P>
            </section>

            {/* 13 */}
            <section id="changes">
              <SectionNumber n={13} />
              <h2 className="section-head">Changes to This Policy</h2>
              <P>
                We may update this policy from time to time as the service
                evolves or as legal requirements change. Material changes will be
                indicated by a revised effective date. We encourage you to review
                this page periodically.
              </P>
              <P>
                Your continued use of the service following a material update
                constitutes acceptance of the revised policy. Where required by
                law we will obtain fresh consent before processing your data
                under materially changed terms.
              </P>
            </section>

            {/* 14 */}
            <section id="contact">
              <SectionNumber n={14} />
              <h2 className="section-head">Contact</h2>
              <P>
                To exercise any data right, report a concern, or ask a question
                about this policy, contact us through our Correspondence page or
                by email. Please include your email address as submitted in the
                assessment so we can locate your record.
              </P>
              <div className="border border-line bg-bg1 px-[20px] py-[18px] mb-[16px]">
                <Row label="Data controller" value="Riz Management LLC · Donum Dei Performance" />
                <Row label="Email" value="privacy@donumdeiperformance.com" />
                <Row
                  label="Web"
                  value={
                    <Link
                      href="/correspondence"
                      className="font-bask text-[14px] text-accent hover:text-ink transition-colors"
                    >
                      donumdeiperformance.com/correspondence
                    </Link>
                  }
                />
              </div>
              <P>
                EU and UK residents who are unsatisfied with our response have
                the right to lodge a complaint with their national supervisory
                authority. California residents may also contact the California
                Privacy Protection Agency (CPPA). Washington residents may
                contact the Washington State Attorney General.
              </P>
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

/* ---- internal layout components ---- */

function SectionNumber({ n }: { n: number }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-[6px]">
      {n}.
    </p>
  );
}

function P({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-bask text-[14px] text-ink2 leading-[1.85] mb-[12px] ${className}`}>
      {children}
    </p>
  );
}

function Table({ rows }: { rows: { label: string; detail: string }[] }) {
  return (
    <ul className="flex flex-col gap-px bg-line border border-line my-[16px]">
      {rows.map((row) => (
        <li
          key={row.label}
          className="bg-bg flex flex-col sm:flex-row items-stretch"
        >
          <div className="sm:min-w-[180px] sm:border-r border-b sm:border-b-0 border-line px-[16px] pt-[14px] pb-[12px] font-mono text-[9px] uppercase tracking-[0.12em] text-ink flex items-start flex-shrink-0">
            {row.label}
          </div>
          <div className="px-[16px] py-[12px]">
            <p className="font-bask text-[13px] text-ink2 leading-[1.8]">
              {row.detail}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SubBox({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-bg1 px-[20px] py-[18px] mb-[16px]">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent mb-[4px]">
        {label}
      </p>
      {note && (
        <p className="font-mono text-[8px] text-ink3 tracking-[0.08em] mb-[12px] leading-[1.6]">
          {note}
        </p>
      )}
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-[8px]">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-[10px]">
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
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="mb-[14px] last:mb-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[2px]">
        {label}
      </p>
      {typeof value === "string" ? (
        <p className="font-bask text-[14px] text-ink">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}
