/**
 * @fileoverview TypeScript Module
 * @module src/app/robots
 * @description This file contains functionality related to robots
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { MetadataRoute } from "next";

/**
 * Performs robots operation
 *
 * @returns {MetadataRoute.Robots} The robots result
 *
 * @example
 * const result = robots();
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://letitrip.in";

  return {
    /** Rules */
    rules: [
      {
        /** User Agent */
        userAgent: "*",
        /** Allow */
        allow: "/",
        /** Disallow */
        disallow: [
          "/api/",
          "/user/",
          "/seller/",
          "/admin/",
          "/logout",
          "/unauthorized",
          "/*?*utm_*", // Exclude URLs with UTM parameters
          "/*?*ref=*", // Exclude URLs with ref parameters
        ],
      },
      {
        /** User Agent */
        userAgent: "Googlebot",
        /** Allow */
        allow: "/",
        /** Disallow */
        disallow: [
          "/api/",
          "/user/",
          "/seller/",
          "/admin/",
          "/logout",
          "/unauthorized",
        ],
        /** Crawl Delay */
        crawlDelay: 0,
      },
      {
        /** User Agent */
        userAgent: "Googlebot-Image",
        /** Allow */
        allow: ["/public/", "/_next/image"],
        /** Disallow */
        disallow: ["/user/", "/seller/", "/admin/"],
      },
      {
        /** User Agent */
        userAgent: "Bingbot",
        /** Allow */
        allow: "/",
        /** Disallow */
        disallow: [
          "/api/",
          "/user/",
          "/seller/",
          "/admin/",
          "/logout",
          "/unauthorized",
        ],
        /** Crawl Delay */
        crawlDelay: 1,
      },
    ],
    /** Sitemap */
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
