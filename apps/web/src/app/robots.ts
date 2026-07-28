import type { MetadataRoute } from "next";

const SITE_URL = "https://donumdeiperformance.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/program/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
