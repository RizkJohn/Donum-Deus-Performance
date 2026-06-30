import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import DoctrineQuote from "@/components/DoctrineQuote";
import Principles from "@/components/Principles";
import Inscription from "@/components/Inscription";
import OrderSection from "@/components/OrderSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Deus Performance — A Practice of Physical Stewardship",
  description:
    "Philosophy-driven training built on joint integrity, movement quality, and capacity that lasts decades. The body is a gift. Train it accordingly.",
};

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <DoctrineQuote />
        <Principles />
        <hr className="h-px border-0 bg-line mx-[52px] max-md:mx-5" />
        <Inscription />
        <OrderSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
