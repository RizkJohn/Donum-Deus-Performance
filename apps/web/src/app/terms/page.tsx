import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Deus Performance",
  description:
    "Terms governing use of Deus Performance — the adaptive training engine operated by Riz Management LLC.",
};

const EFFECTIVE_DATE = "28 June 2026";

export default function TermsPage() {
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
            Terms of <em className="text-warm">Service.</em>
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[36px]">
            Effective date — {EFFECTIVE_DATE} &nbsp;·&nbsp; Riz Management LLC
          </p>

          {/* Health warning */}
          <div className="border border-[rgba(184,68,68,0.35)] bg-[rgba(184,68,68,0.06)] px-[20px] py-[18px] mb-[48px]">
            <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-danger mb-[8px]">
              Health &amp; Safety Notice
            </p>
            <p className="font-bask text-[13px] text-ink2 leading-[1.8]">
              Deus Performance is a practice of performance education. It is
              {" "}<strong className="text-ink">not</strong> a medical provider
              and does not offer medical advice, diagnosis, or clinical
              treatment of any kind. Consult a licensed clinician before
              beginning any new training program. Exercise carries inherent
              risk, and by using the Service you voluntarily assume that risk —
              see Sections 4 and 5.
            </p>
          </div>

          {/* TOC */}
          <nav
            aria-label="Terms contents"
            className="mb-[52px] border border-line bg-bg1 px-[24px] py-[22px]"
          >
            <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-ink3 mb-[14px]">
              Contents
            </p>
            <ol className="flex flex-col gap-[6px]">
              {[
                ["#agreement", "Agreement to These Terms"],
                ["#eligibility", "Eligibility"],
                ["#not-medical", "Not Medical Advice"],
                ["#assumption-of-risk", "Assumption of Risk & Release of Liability"],
                ["#medical-clearance", "Medical Clearance & Health Representations"],
                ["#service", "Description of the Service"],
                ["#responsibilities", "Your Responsibilities"],
                ["#ip", "Intellectual Property"],
                ["#disclaimer", "Disclaimer of Warranties"],
                ["#liability", "Limitation of Liability"],
                ["#indemnification", "Indemnification"],
                ["#time-limit", "Time Limit for Bringing Claims"],
                ["#disputes", "Governing Law and Dispute Resolution"],
                ["#consumer-rights", "Preservation of Consumer Rights"],
                ["#termination", "Termination"],
                ["#severability", "Severability"],
                ["#general", "Entire Agreement, Waiver, and Assignment"],
                ["#changes", "Changes to These Terms"],
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
            <section id="agreement">
              <SN n={1} />
              <h2 className="section-head">Agreement to These Terms</h2>
              <P>
                These Terms of Service (&ldquo;Terms&rdquo;) are a legally
                binding agreement between you and Riz Management LLC
                (&ldquo;Deus Performance,&rdquo; &ldquo;we,&rdquo;
                &ldquo;us,&rdquo; &ldquo;our&rdquo;) governing your access to
                and use of the website at deusperformance.com and the associated
                training program generation service (the &ldquo;Service&rdquo;).
              </P>
              <P>
                By accessing the Service, submitting the assessment, or
                generating a training program, you confirm that you have read,
                understood, and agreed to these Terms — including the assumption
                of risk and release in Section 4, the disclaimers in Section 9,
                and the binding arbitration and class-action waiver in Section
                13. If you do not agree, do not use the Service.
              </P>
            </section>

            {/* 2 */}
            <section id="eligibility">
              <SN n={2} />
              <h2 className="section-head">Eligibility</h2>
              <P>
                You must be at least 13 years of age to use the Service. By
                using the Service you represent and warrant that you meet this
                requirement and have the legal capacity to enter into a binding
                agreement in your jurisdiction.
              </P>
              <P>
                Users between 13 and 17 should use the Service with the
                knowledge and consent of a parent or legal guardian, who accepts
                these Terms on the minor&rsquo;s behalf. If you are a parent or
                guardian who becomes aware that your minor child has submitted
                personal information without your consent, contact us
                immediately for deletion.
              </P>
            </section>

            {/* 3 */}
            <section id="not-medical">
              <SN n={3} />
              <h2 className="section-head">Not Medical Advice</h2>
              <P>
                Deus Performance is a practice of performance education. Training
                programs generated by the Service are produced by an automated
                constraint-based engine and, in some configurations, an AI
                language model. They are provided for informational and
                educational purposes only.
              </P>
              <ul className="flex flex-col gap-[8px] border border-[rgba(184,68,68,0.3)] bg-[rgba(184,68,68,0.04)] px-[20px] py-[18px]">
                {[
                  "The Service does not constitute medical advice, medical diagnosis, rehabilitation guidance, or clinical treatment of any kind.",
                  "Injury-accommodation features route programming around selected body parts using approved exercise substitutions — this is not a substitute for professional clinical evaluation or physical therapy.",
                  "Always consult a licensed physician, sports medicine professional, or certified clinician before beginning or modifying any exercise program, particularly if you have existing injuries, chronic conditions, or medical history that may affect exercise safety.",
                  "Reliance on any information provided by the Service is solely at your own risk.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-[10px]">
                    <span aria-hidden="true" className="shrink-0 text-danger mt-[1px] font-mono text-[10px]">—</span>
                    <span className="font-bask text-[13px] text-ink2 leading-[1.75]">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4 */}
            <section id="assumption-of-risk">
              <SN n={4} />
              <h2 className="section-head">
                Assumption of Risk &amp; Release of Liability
              </h2>
              <P>
                Physical exercise carries inherent and unavoidable risks. You
                understand and acknowledge that participating in any training
                program obtained through the Service is voluntary and that you
                do so entirely at your own risk. These risks exist even when a
                program is followed correctly and include, without limitation:
              </P>
              <ul className="flex flex-col gap-[8px] border border-[rgba(184,68,68,0.3)] bg-[rgba(184,68,68,0.04)] px-[20px] py-[18px]">
                {[
                  "Muscle, joint, ligament, tendon, or connective-tissue strains, sprains, tears, and other musculoskeletal injuries.",
                  "Cardiovascular events, fainting, heat illness, dehydration, or, in rare cases, serious injury or death.",
                  "Aggravation of pre-existing conditions, injuries, or vulnerabilities, whether or not disclosed.",
                  "Injury arising from improper form, overexertion, fatigue, inadequate recovery, unsafe equipment, or your training environment.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-[10px]">
                    <span aria-hidden="true" className="shrink-0 text-danger mt-[1px] font-mono text-[10px]">—</span>
                    <span className="font-bask text-[13px] text-ink2 leading-[1.75]">{item}</span>
                  </li>
                ))}
              </ul>
              <P className="mt-[12px]">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU KNOWINGLY
                AND VOLUNTARILY ASSUME ALL RISKS ASSOCIATED WITH YOUR USE OF THE
                SERVICE AND ANY TRAINING PROGRAM, AND YOU RELEASE, WAIVE, AND
                DISCHARGE RIZ MANAGEMENT LLC AND ITS OFFICERS, DIRECTORS,
                EMPLOYEES, AND AGENTS FROM ANY AND ALL CLAIMS, DEMANDS, OR CAUSES
                OF ACTION FOR PERSONAL INJURY, ILLNESS, DEATH, OR PROPERTY DAMAGE
                ARISING OUT OF OR RELATED TO YOUR PARTICIPATION IN ANY PROGRAM
                OBTAINED THROUGH THE SERVICE, WHETHER CAUSED BY ORDINARY
                NEGLIGENCE OR OTHERWISE.
              </P>
              <P>
                This release does not apply to gross negligence, recklessness,
                willful misconduct, fraud, or any liability that cannot be waived
                or released under the mandatory law of your jurisdiction. Where a
                full release is not permitted, it applies to the maximum extent
                the law allows. This assumption of risk and release is a material
                inducement for us to provide the assessment tier at no charge and
                survives termination of these Terms.
              </P>
            </section>

            {/* 5 */}
            <section id="medical-clearance">
              <SN n={5} />
              <h2 className="section-head">
                Medical Clearance &amp; Health Representations
              </h2>
              <P>
                By using the Service you represent and warrant that you are in
                good general health and have no medical condition, injury, or
                impairment that would make exercise unsafe — or, if you do, that
                you have obtained clearance from a licensed physician before
                using any program generated by the Service.
              </P>
              <ul className="flex flex-col gap-[8px] border border-line bg-bg1 px-[20px] py-[18px]">
                {[
                  "You have provided accurate and complete information about your injuries, health state, and physical condition in the assessment.",
                  "You will stop exercising immediately and seek medical attention if you experience pain, dizziness, chest discomfort, shortness of breath, faintness, or any other warning sign.",
                  "You will not exceed your own capabilities and will scale, modify, or discontinue any exercise based on how your body responds.",
                  "You understand the Service is not a substitute for professional medical care, diagnosis, or physical therapy, and that you remain solely responsible for deciding whether a program is appropriate for you.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-[10px]">
                    <span aria-hidden="true" className="shrink-0 text-accent mt-[1px] font-mono text-[10px]">—</span>
                    <span className="font-bask text-[13px] text-ink2 leading-[1.75]">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 6 */}
            <section id="service">
              <SN n={6} />
              <h2 className="section-head">Description of the Service</h2>
              <P>
                Deus Performance provides a free automated assessment that collects
                your physical profile, goals, schedule, and current state, then
                generates a weekly strength and conditioning program governed by
                hard constraints: CNS load management, movement pattern coverage,
                volume limits, and fatigue-adaptive adjustments.
              </P>
              <P>
                The Service is provided at no charge for the assessment tier. Paid
                engagement tiers (Foundation, Practice, Stewardship) may be offered
                separately and are subject to additional terms communicated at the
                time of purchase.
              </P>
            </section>

            {/* 7 */}
            <section id="responsibilities">
              <SN n={7} />
              <h2 className="section-head">Your Responsibilities</h2>
              <P>You agree to:</P>
              <ul className="flex flex-col gap-[8px] border border-line bg-bg1 px-[20px] py-[18px]">
                {[
                  "Provide accurate, current, and complete information in the assessment. Program quality depends entirely on accurate inputs.",
                  "Use the Service only for lawful purposes and in accordance with these Terms.",
                  "Not attempt to reverse-engineer, disassemble, scrape, or extract the engine's constraint rules, exercise library, or proprietary content at scale.",
                  "Not use automated means to submit multiple assessments, probe the API, or circumvent rate limits.",
                  "Not submit false health information to obtain a program that misrepresents your physical state.",
                  "Report security vulnerabilities or data issues through our Correspondence page rather than exploiting them.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-[10px]">
                    <span aria-hidden="true" className="shrink-0 text-accent mt-[1px] font-mono text-[10px]">—</span>
                    <span className="font-bask text-[13px] text-ink2 leading-[1.75]">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 8 */}
            <section id="ip">
              <SN n={8} />
              <h2 className="section-head">Intellectual Property</h2>
              <P>
                All content on the Deus Performance website — including the engine
                architecture, constraint rules, exercise library, editorial content
                (Dispatches), design system, and program output structure — is
                the intellectual property of Riz Management LLC, protected by
                copyright and applicable law.
              </P>
              <P>
                The personalized training program generated for you is provided
                for your personal, non-commercial use. You may not redistribute,
                resell, or sublicense program outputs without express written
                permission.
              </P>
              <P>
                Your submitted assessment data remains your information. We do not
                claim ownership over data you provide — see our{" "}
                <Link href="/privacy" className="text-accent hover:text-ink transition-colors">
                  Privacy Policy
                </Link>{" "}
                for how it is handled.
              </P>
            </section>

            {/* 9 */}
            <section id="disclaimer">
              <SN n={9} />
              <h2 className="section-head">Disclaimer of Warranties</h2>
              <P>
                THE SERVICE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS
                WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY
                APPLICABLE LAW, RIZ MANAGEMENT LLC EXPRESSLY DISCLAIMS ALL
                WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </P>
              <ul className="flex flex-col gap-[8px] border border-line bg-bg1 px-[20px] py-[18px]">
                {[
                  "Implied warranties of merchantability, fitness for a particular purpose, and non-infringement.",
                  "Any warranty that the Service will meet your requirements or achieve any particular fitness or performance result.",
                  "Any warranty that the Service will be uninterrupted, timely, secure, or error-free.",
                  "Any warranty regarding the accuracy or completeness of AI-generated exercise selections.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-[10px]">
                    <span aria-hidden="true" className="shrink-0 text-accent mt-[1px] font-mono text-[10px]">—</span>
                    <span className="font-bask text-[13px] text-ink2 leading-[1.75]">{item}</span>
                  </li>
                ))}
              </ul>
              <P className="mt-[12px]">
                Exercise carries inherent risk. Results depend on individual
                factors including genetics, effort, consistency, nutrition, sleep,
                and adherence — none of which the Service controls.
              </P>
            </section>

            {/* 10 */}
            <section id="liability">
              <SN n={10} />
              <h2 className="section-head">Limitation of Liability</h2>
              <P>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                SHALL RIZ MANAGEMENT LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR
                AGENTS BE LIABLE FOR ANY:
              </P>
              <ul className="flex flex-col gap-[8px] border border-line bg-bg1 px-[20px] py-[18px]">
                {[
                  "Indirect, incidental, special, consequential, or punitive damages.",
                  "Loss of profits, data, goodwill, or other intangible losses.",
                  "Physical injury, illness, or harm arising from exercise performed in reliance on generated programs.",
                  "Damages arising from service interruptions, data loss, or third-party actions.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-[10px]">
                    <span aria-hidden="true" className="shrink-0 text-accent mt-[1px] font-mono text-[10px]">—</span>
                    <span className="font-bask text-[13px] text-ink2 leading-[1.75]">{item}</span>
                  </li>
                ))}
              </ul>
              <P className="mt-[12px]">
                Our total aggregate liability to you for any claim arising from or
                related to the Service shall not exceed the greater of (a) the
                amount you paid us in the 12 months preceding the claim or (b) USD
                $50. Some jurisdictions do not allow limitations on liability for
                personal injury or implied warranties — in such jurisdictions, our
                liability is limited to the minimum extent permitted by law.
              </P>
            </section>

            {/* 11 */}
            <section id="indemnification">
              <SN n={11} />
              <h2 className="section-head">Indemnification</h2>
              <P>
                You agree to indemnify, defend, and hold harmless Riz Management
                LLC and its affiliates, officers, agents, and employees from and
                against any claims, liabilities, damages, losses, and expenses
                (including reasonable legal fees) arising out of or connected with
                your access to or use of the Service, your violation of these
                Terms, your submission of inaccurate health information, or your
                violation of any third-party rights.
              </P>
            </section>

            {/* 12 */}
            <section id="time-limit">
              <SN n={12} />
              <h2 className="section-head">Time Limit for Bringing Claims</h2>
              <P>
                To the extent permitted by applicable law, any claim or cause of
                action arising out of or related to the Service or these Terms
                must be commenced within one (1) year after the claim accrued.
                After that period, the claim is permanently barred. Where a
                one-year period is shorter than the minimum your jurisdiction
                allows, the shortest period permitted by that law applies
                instead. This Section does not apply where it is prohibited by
                mandatory consumer-protection law.
              </P>
            </section>

            {/* 13 */}
            <section id="disputes">
              <SN n={13} />
              <h2 className="section-head">Governing Law and Dispute Resolution</h2>
              <P>
                These Terms are governed by the laws of the State of Delaware,
                United States, without regard to its conflict-of-law provisions.
              </P>
              <P>
                Before initiating any formal proceeding, you agree to contact us
                in good faith to attempt informal resolution. If the dispute is
                not resolved within 30 days, it may be submitted to binding
                individual arbitration administered by a mutually agreed
                arbitration body (such as AAA or JAMS) under its applicable
                rules, except that either party may seek injunctive or other
                equitable relief from a court of competent jurisdiction to protect
                intellectual property or prevent irreparable harm.
              </P>
              <P>
                <strong className="text-ink">Class action waiver:</strong> you
                and Riz Management LLC agree that all disputes will be resolved on
                an individual basis and not as part of a class, consolidated, or
                representative proceeding. You waive any right to participate in a
                class action to the extent permitted by applicable law.
              </P>
              <P>
                This arbitration clause does not apply to users in jurisdictions
                where mandatory arbitration of consumer disputes is prohibited by
                law, including the EU, UK, and Canada. Those users may bring
                claims in the courts of their local jurisdiction.
              </P>
            </section>

            {/* 14 */}
            <section id="consumer-rights">
              <SN n={14} />
              <h2 className="section-head">Preservation of Consumer Rights</h2>
              <P>
                Nothing in these Terms is intended to waive or limit any rights
                you hold under mandatory consumer protection or data protection
                law in your jurisdiction that cannot be excluded by contract.
                Where any provision of these Terms — including the assumption of
                risk, release, disclaimers, liability cap, arbitration clause, or
                class-action waiver — conflicts with a non-waivable right you
                hold, that right prevails and the remainder of these Terms stays
                in effect. Non-waivable rights include those under:
              </P>
              <ul className="flex flex-col gap-[8px] border border-line bg-bg1 px-[20px] py-[18px]">
                {[
                  "US federal consumer protection laws (FTC Act, CAN-SPAM, COPPA).",
                  "US state privacy laws (CCPA/CPRA, Texas TDPSA, Virginia CDPA, Washington MHMD, and other applicable state laws).",
                  "EU and UK consumer and data protection law (GDPR, UK GDPR, Consumer Rights Directive).",
                  "Canadian federal and provincial consumer protection and privacy laws (PIPEDA, provincial privacy acts).",
                  "Australian Consumer Law and the Privacy Act 1988.",
                  "Any other mandatory consumer or data protection rights applicable in your jurisdiction.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-[10px]">
                    <span aria-hidden="true" className="shrink-0 text-accent mt-[1px] font-mono text-[10px]">—</span>
                    <span className="font-bask text-[13px] text-ink2 leading-[1.75]">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 15 */}
            <section id="termination">
              <SN n={15} />
              <h2 className="section-head">Termination</h2>
              <P>
                We reserve the right to suspend or terminate your access to the
                Service at any time, without notice, if we determine that you have
                violated these Terms, are misusing the Service, or if we are
                required to do so by law.
              </P>
              <P>
                You may stop using the Service at any time. Sections that by their
                nature should survive termination — including Intellectual
                Property, Assumption of Risk &amp; Release of Liability, Disclaimer
                of Warranties, Limitation of Liability, Indemnification, Time Limit
                for Bringing Claims, Governing Law and Dispute Resolution, and
                Severability — shall survive.
              </P>
            </section>

            {/* 16 */}
            <section id="severability">
              <SN n={16} />
              <h2 className="section-head">Severability</h2>
              <P>
                If any provision of these Terms is held invalid, illegal, or
                unenforceable by a court or arbitrator of competent jurisdiction,
                that provision will be modified to the minimum extent necessary to
                make it enforceable, or if it cannot be so modified, severed, and
                the remaining provisions will continue in full force and effect.
              </P>
              <P>
                If the class-action waiver in Section 13 is found unenforceable as
                to a particular claim, only that claim will be severed from
                arbitration and proceed in court; the remainder of the
                dispute-resolution provisions continue to apply to all other
                claims.
              </P>
            </section>

            {/* 17 */}
            <section id="general">
              <SN n={17} />
              <h2 className="section-head">
                Entire Agreement, Waiver, and Assignment
              </h2>
              <P>
                These Terms, together with the{" "}
                <Link href="/privacy" className="text-accent hover:text-ink transition-colors">
                  Privacy Policy
                </Link>{" "}
                and any additional terms presented at the time of a paid
                purchase, constitute the entire agreement between you and Riz
                Management LLC regarding the Service and supersede all prior
                agreements and understandings on the subject.
              </P>
              <P>
                Our failure to enforce any provision of these Terms is not a
                waiver of our right to enforce it later. A waiver is effective
                only if made in writing by us.
              </P>
              <P>
                You may not assign or transfer these Terms without our prior
                written consent. We may assign these Terms, in whole or in part,
                in connection with a merger, acquisition, reorganization, or sale
                of assets, or by operation of law.
              </P>
            </section>

            {/* 18 */}
            <section id="changes">
              <SN n={18} />
              <h2 className="section-head">Changes to These Terms</h2>
              <P>
                We may modify these Terms from time to time. Material changes will
                be indicated by an updated effective date. We encourage you to
                review this page periodically.
              </P>
              <P>
                Your continued use of the Service following a material update
                constitutes acceptance of the revised Terms. If you do not agree
                to revised Terms, stop using the Service.
              </P>
            </section>

            {/* 19 */}
            <section id="contact">
              <SN n={19} />
              <h2 className="section-head">Contact</h2>
              <P>
                Questions about these Terms, or notices required under them, should
                be sent to:
              </P>
              <div className="border border-line bg-bg1 px-[20px] py-[18px] mb-[16px]">
                {[
                  ["Legal contact", "Riz Management LLC · Deus Performance"],
                  ["Email", "legal@deusperformance.com"],
                ].map(([label, value]) => (
                  <div key={label} className="mb-[14px] last:mb-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[2px]">
                      {label}
                    </p>
                    <p className="font-bask text-[14px] text-ink">{value}</p>
                  </div>
                ))}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3 mb-[2px]">
                    Web
                  </p>
                  <Link
                    href="/correspondence"
                    className="font-bask text-[14px] text-accent hover:text-ink transition-colors"
                  >
                    deusperformance.com/correspondence
                  </Link>
                </div>
              </div>
            </section>
          </div>

          <hr className="border-0 h-px bg-line my-[52px]" />
          <div className="flex gap-6">
            <Link href="/privacy" className="btn-ghost text-[10px]">
              Privacy Policy &#8594;
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

function SN({ n }: { n: number }) {
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
