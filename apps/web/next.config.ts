import type { NextConfig } from "next";

// The API origin the browser is actually allowed to call. Computed at build
// time so a plain-HTTP local/docker-compose API (the documented default) is
// not silently blocked by CSP — `https:` alone only covers HTTPS deployments.
function apiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").origin;
  } catch {
    return "http://localhost:8000";
  }
}

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information sent to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser feature access
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Force HTTPS for 2 years, include subdomains, eligible for preload list
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  // Notes:
  //  - 'unsafe-inline' for script-src is required for the JSON-LD structured data
  //    rendered via dangerouslySetInnerHTML in layout.tsx. A future improvement
  //    would replace this with a nonce via Next.js middleware.
  //  - fonts.googleapis.com (stylesheet) and fonts.gstatic.com (font files) are
  //    required for Google Fonts loaded via next/font.
  //  - connect-src includes https: for any HTTPS API deployment, plus the
  //    exact configured NEXT_PUBLIC_API_URL origin so a plain-HTTP local/
  //    docker-compose API isn't blocked (the two are not the same set).
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      `connect-src 'self' https: ${apiOrigin()}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
