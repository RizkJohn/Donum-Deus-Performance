import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CorrespondenceForm from "@/components/CorrespondenceForm";

export const metadata: Metadata = {
  title: "Correspondence — Donum Dei Performance",
  description:
    "Direct inquiry for level selection, complex presentations, or any matter outside the standard intake process.",
};

const CONTACT_INFO = [
  {
    label: "Format",
    value: "Remote · In-person (select locations)",
    desc: "In-person engagement available for Stewardship practitioners.",
  },
  {
    label: "Response window",
    value: "Monday – Friday · 09:00 – 18:00",
    desc: "Stewardship practitioners: urgent matters are addressed outside these hours.",
  },
];

export default function CorrespondencePage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        {/* Header */}
        <section className="mx-auto max-w-[1300px] px-5 py-[52px] md:px-[52px]">
          <div className="kicker mb-[14px]">Correspondence</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[18px] text-ink"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Direct <em className="text-warm">inquiry.</em>
          </h1>
          <p className="font-bask text-[15px] text-ink2 leading-[1.85] max-w-[560px]">
            For level inquiries, complex presentations, or any matter that falls
            outside the intake process. All correspondence is reviewed within one
            business day.
          </p>
        </section>

        {/* Two-column layout */}
        <div className="border-t border-line">
          <div className="mx-auto max-w-[1300px] px-5 py-[40px] md:px-[52px]">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-px bg-line">
              {/* Contact info */}
              <div className="bg-bg p-[24px] md:p-[36px]">
                <div className="flex flex-col gap-[1px] bg-line border border-line mb-[28px]">
                  {CONTACT_INFO.map((row) => (
                    <div key={row.label} className="bg-bg p-[16px]">
                      <div className="font-mono text-[8px] tracking-[0.18em] uppercase text-ink3 mb-[4px]">
                        {row.label}
                      </div>
                      <div className="font-mono text-[11px] text-ink mb-[4px]">
                        {row.value}
                      </div>
                      <div className="font-bask text-[11px] text-ink3 leading-[1.6]">
                        {row.desc}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="font-bask italic text-[12px] text-ink3 leading-[1.75]">
                  No automated routing. All submissions are read and responded to
                  directly.
                </p>
              </div>

              {/* Form */}
              <div className="bg-bg p-[24px] md:p-[36px]">
                <CorrespondenceForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
