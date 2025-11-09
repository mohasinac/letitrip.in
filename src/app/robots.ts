import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://justforview.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
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
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/user/",
          "/seller/",
          "/admin/",
          "/logout",
          "/unauthorized",
        ],
        crawlDelay: 0,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/public/", "/_next/image"],
        disallow: ["/user/", "/seller/", "/admin/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/user/",
          "/seller/",
          "/admin/",
          "/logout",
          "/unauthorized",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
