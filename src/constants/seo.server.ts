import {
  createSeoConfig,
  generateMetadata as _generateMetadata,
  generateProfileMetadata as _generateProfileMetadata,
  generateProductMetadata as _generateProductMetadata,
  generateCategoryMetadata as _generateCategoryMetadata,
  generateBlogMetadata as _generateBlogMetadata,
  generateAuctionMetadata as _generateAuctionMetadata,
  generateSearchMetadata as _generateSearchMetadata,
} from "@mohasinac/appkit/server";
import type { Metadata } from "next";
import type {
  SeoConfig,
  ProductSeoInput,
  CategorySeoInput,
  BlogSeoInput,
  AuctionSeoInput,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "./seo";

export type {
  SeoConfig,
  ProductSeoInput,
  CategorySeoInput,
  BlogSeoInput,
  AuctionSeoInput,
};

// 🛑 Single source of truth for the canonical host: appkit.config.js `seo.siteUrl`,
// surfaced here through SEO_CONFIG. Do NOT reintroduce a local env chain.
//
// This file used to read `NEXT_PUBLIC_APP_URL || NEXT_PUBLIC_SITE_URL ||
// "https://letitrip.in"` independently of appkit.config.js's hardcoded literal.
// Both claimed to be canonical; neither deferred to the other. When the Vercel
// env was pointed at the www host, page canonicals/og:url/JSON-LD followed it
// and robots.txt/sitemap/metadataBase did not — so every URL in the sitemap
// 307-redirected and Google dropped the site. See the comment in appkit.config.js.
//
// Enforced by scripts/audit-seo-canonical-host.mjs.
const SITE_URL = SEO_CONFIG.siteUrl;

export const LETITRIP_SEO: SeoConfig = createSeoConfig({
  siteName: "LetItRip",
  siteUrl: SITE_URL,
  defaultTitle: "LetItRip — India's Collectibles Marketplace",
  defaultDescription:
    "Buy, sell & auction action figures, trading cards, spinning tops, model kits and more. India's largest collectibles marketplace.",
  defaultImage: `${SITE_URL}/media/site-og-image`,
  locale: "en_IN",
});

export function generateMetadata(
  config: Parameters<typeof _generateMetadata>[0],
): Metadata {
  return _generateMetadata(config, LETITRIP_SEO);
}

export function generateProductMetadata(product: ProductSeoInput): Metadata {
  return _generateProductMetadata(product, LETITRIP_SEO);
}

export function generateCategoryMetadata(category: CategorySeoInput): Metadata {
  return _generateCategoryMetadata(category, LETITRIP_SEO);
}

export function generateBlogMetadata(post: BlogSeoInput): Metadata {
  return _generateBlogMetadata(post, LETITRIP_SEO);
}

export function generateAuctionMetadata(auction: AuctionSeoInput): Metadata {
  return _generateAuctionMetadata(auction, LETITRIP_SEO);
}

export function generateProfileMetadata(
  user: Parameters<typeof _generateProfileMetadata>[0],
): Metadata {
  return _generateProfileMetadata(user, LETITRIP_SEO);
}

export function generateSearchMetadata(q: string, category?: string): Metadata {
  return _generateSearchMetadata(q, category, LETITRIP_SEO);
}

export { createSeoConfig };
