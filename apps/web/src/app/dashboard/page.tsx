import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Dashboard from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your saved Deus Performance programs.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <Dashboard />
      </main>
      <Footer />
    </>
  );
}
