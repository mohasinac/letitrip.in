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

export type {
  SeoConfig,
  ProductSeoInput,
  CategorySeoInput,
  BlogSeoInput,
  AuctionSeoInput,
};

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://letitrip.in";

export const LETITRIP_SEO: SeoConfig = createSeoConfig({
  siteName: "LetiTrip",
  siteUrl: SITE_URL,
  defaultTitle: "LetiTrip — India's Collectibles Marketplace",
  defaultDescription:
    "Buy, sell & auction Pokémon TCG, Hot Wheels, anime figures, Beyblades and more. India's largest collectibles marketplace.",
  defaultImage: `${SITE_URL}/media/site-og-image`,
  twitterHandle: "@letitrip",
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
