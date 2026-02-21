import type { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONFIG.siteUrl;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/seller/",
          "/user/",
          "/auth/",
          "/checkout/",
          "/cart/",
          "/demo/",
          "/_next/",
          "/profile/*/edit",
        ],
      },
      {
        // Block GPTBot and similar AI scrapers from specific content
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "CCBot"],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
