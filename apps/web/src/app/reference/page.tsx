import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Reference — Donum Dei Performance",
  description:
    "Common questions on the practice: philosophy and training, custom programming, equipment, injury management, conditioning methods, and more.",
};

export default function ReferencePage() {
  return (
    <>
      <Nav />
      <main className="pt-[58px]">
        <section className="mx-auto max-w-[860px] px-5 py-[52px] md:px-[32px]">
          <div className="kicker mb-[14px]">Reference</div>
          <h1
            className="font-play font-normal leading-[0.97] tracking-[-0.02em] mb-[36px] text-ink"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            Common <em className="text-warm">questions</em>
            <br />
            on the practice.
          </h1>
          <FaqAccordion />
        </section>
      </main>
      <Footer />
    </>
  );
}
