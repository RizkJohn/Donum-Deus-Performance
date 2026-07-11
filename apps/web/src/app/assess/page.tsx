import type { Metadata } from "next";
import Nav from "@/components/Nav";
import AssessmentFunnel from "@/components/assess/AssessmentFunnel";

export const metadata: Metadata = {
  title: "Free Assessment",
  description:
    "Two minutes of questions — profile, goals, schedule, fatigue — and the Donum Dei engine builds your complete weekly program. Free, no card required.",
};

export default function AssessPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <AssessmentFunnel />
      </main>
    </>
  );
}
