import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Practitioner dashboard — programme history and rebooking.",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      {/* TODO: Practitioner dashboard — auth-gated, Supabase session required */}
    </main>
  );
}
