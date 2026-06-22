import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Method from "@/components/Method";
import FieldReports from "@/components/FieldReports";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Deus Performance — Adaptive Training Engine",
  description:
    "A two-minute assessment becomes a complete, CNS-managed weekly training program. Constraint-driven, movement-based, fatigue-adaptive. Free assessment — no card required.",
};

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Method />
        <FieldReports />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
