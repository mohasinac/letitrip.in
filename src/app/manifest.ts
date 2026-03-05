import type { MetadataRoute } from "next";
import { ROUTES } from "@/constants";

/**
 * Web App Manifest
 * Enables PWA installability on mobile and desktop.
 * Icons are served from /public/ — generate PNGs at those sizes for production.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LetItRip — Shop, Bid & Sell",
    short_name: "LetItRip",
    description:
      "India's multi-seller marketplace — shop unique products, join live auctions, and sell from your own store.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    categories: ["shopping", "marketplace", "business"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
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
        url: ROUTES.PUBLIC.PRODUCTS,
        description: "Browse the latest products",
      },
      {
        name: "Live Auctions",
        url: ROUTES.PUBLIC.AUCTIONS,
        description: "Join live auction bidding",
      },
      {
        name: "Categories",
        url: ROUTES.PUBLIC.CATEGORIES,
        description: "Explore product categories",
      },
      {
        name: "Stores",
        url: ROUTES.PUBLIC.STORES,
        description: "Browse seller storefronts",
      },
    ],
  };
}
