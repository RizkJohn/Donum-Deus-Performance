import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-play",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
  variable: "--font-bask",
  display: "swap",
});

const SITE_URL = "https://deusperformance.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Deus Performance — Adaptive Training Engine",
    template: "%s — Deus Performance",
  },
  description:
    "Constraint-driven adaptive training. A two-minute assessment becomes a complete, CNS-managed weekly program — built by an engine, governed by hard rules. The body is a gift. Train it accordingly.",
  openGraph: {
    title: "Deus Performance — Adaptive Training Engine",
    description:
      "Constraint-driven adaptive training. A two-minute assessment becomes a complete, CNS-managed weekly program.",
    url: SITE_URL,
    siteName: "Deus Performance",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deus Performance — Adaptive Training Engine",
    description:
      "Constraint-driven adaptive training. A two-minute assessment becomes a complete, CNS-managed weekly program.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Deus Performance",
  legalName: "Riz Management LLC",
  url: SITE_URL,
  slogan: "Deus. The body is a gift. Train it accordingly.",
  description:
    "Constraint-driven adaptive training engine. Personalized weekly programs governed by hard safety rules: CNS load management, complete movement coverage, fatigue-adaptive volume.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmMono.variable} ${baskerville.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <div className="grain" aria-hidden="true" />
        <div className="grid-lines" aria-hidden="true" />
        <Providers>
          <div className="relative z-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
