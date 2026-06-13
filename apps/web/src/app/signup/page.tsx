import type { Metadata } from "next";
import Nav from "@/components/Nav";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Deus Performance account to save your programs.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <SignupForm />
      </main>
    </>
  );
}
