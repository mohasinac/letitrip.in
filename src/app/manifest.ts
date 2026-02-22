import type { MetadataRoute } from "next";

/**
 * Web App Manifest
 * Enables PWA installability on mobile and desktop.
 * Icons are served from /public/icons/ — generate PNGs at those sizes for production.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LetItRip",
    short_name: "LetItRip",
    description:
      "Multi-Seller E-commerce & Auction Platform — shop, bid, and sell.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    categories: ["shopping", "marketplace"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",

        purpose: "any maskable" as any,
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Browse Products",
        url: "/",
        description: "Browse the latest products",
      },
      {
        name: "Auctions",
        url: "/auctions",
        description: "Join live auction bidding",
      },
    ],
  };
}
