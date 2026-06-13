import type { Metadata } from "next";
import Nav from "@/components/Nav";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Deus Performance account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-[60px]">
        <LoginForm />
      </main>
    </>
  );
}
