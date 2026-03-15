/**
 * @mohasinac/cli/next
 *
 * Next.js config helper that reads features.config.ts and automatically
 * populates transpilePackages, so you never hand-edit that list again.
 *
 * Usage in next.config.js:
 *
 *   const { withFeatures } = require("@mohasinac/cli/next");
 *   const features = require("./features.config").default;
 *
 *   module.exports = withFeatures(features)({
 *     serverExternalPackages: ["firebase-admin"],
 *     // ... other Next.js config
 *   });
 */

import type { FeaturesConfig } from "@mohasinac/contracts";

/**
 * Maps a feature name to its package name(s).
 * Always-present packages (contracts, core, etc.) are included unconditionally.
 * Feature flag packages are included only when the feature is enabled.
 */
const ALWAYS_TRANSPILE: string[] = [
  "@mohasinac/contracts",
  "@mohasinac/core",
  "@mohasinac/react",
  "@mohasinac/ui",
  "@mohasinac/http",
  "@mohasinac/next",
  "@mohasinac/tokens",
  "@mohasinac/css-tailwind",
  "@mohasinac/css-vanilla",
];

/** Maps feature config key → @mohasinac/feat-* package name */
const FEATURE_PACKAGE_MAP: Record<string, string> = {
  layout: "@mohasinac/feat-layout",
  forms: "@mohasinac/feat-forms",
  filters: "@mohasinac/feat-filters",
  media: "@mohasinac/feat-media",
  auth: "@mohasinac/feat-auth",
  account: "@mohasinac/feat-account",
  products: "@mohasinac/feat-products",
  categories: "@mohasinac/feat-categories",
  cart: "@mohasinac/feat-cart",
  wishlist: "@mohasinac/feat-wishlist",
  checkout: "@mohasinac/feat-checkout",
  orders: "@mohasinac/feat-orders",
  payments: "@mohasinac/feat-payments",
  blog: "@mohasinac/feat-blog",
  reviews: "@mohasinac/feat-reviews",
  faq: "@mohasinac/feat-faq",
  search: "@mohasinac/feat-search",
  homepage: "@mohasinac/feat-homepage",
  admin: "@mohasinac/feat-admin",
  events: "@mohasinac/feat-events",
  auctions: "@mohasinac/feat-auctions",
  promotions: "@mohasinac/feat-promotions",
  seller: "@mohasinac/feat-seller",
  stores: "@mohasinac/feat-stores",
  "pre-orders": "@mohasinac/feat-pre-orders",
  consultation: "@mohasinac/feat-consultation",
  concern: "@mohasinac/feat-concern",
  corporate: "@mohasinac/feat-corporate",
  "before-after": "@mohasinac/feat-before-after",
  loyalty: "@mohasinac/feat-loyalty",
  collections: "@mohasinac/feat-collections",
  preorders: "@mohasinac/feat-preorders",
  "whatsapp-bot": "@mohasinac/feat-whatsapp-bot",
};

/**
 * Resolves the transpilePackages list from a FeaturesConfig.
 * Returns ALWAYS_TRANSPILE plus any feature packages that are enabled.
 */
export function resolveTranspilePackages(features: FeaturesConfig): string[] {
  const featurePackages = Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([key]) => FEATURE_PACKAGE_MAP[key])
    .filter((pkg): pkg is string => pkg !== undefined);

  return [...ALWAYS_TRANSPILE, ...featurePackages];
}

export interface NextConfig {
  transpilePackages?: string[];
  [key: string]: unknown;
}

/**
 * Wraps a Next.js config object, injecting transpilePackages derived from
 * the enabled features.
 *
 * @example
 * ```js
 * // next.config.js
 * const { withFeatures } = require("@mohasinac/cli/next");
 * const features = require("./features.config").default;
 *
 * module.exports = withFeatures(features)({ serverExternalPackages: ["firebase-admin"] });
 * ```
 */
export function withFeatures(
  features: FeaturesConfig,
): (nextConfig: NextConfig) => NextConfig {
  return function applyFeatures(nextConfig: NextConfig): NextConfig {
    const fromFeatures = resolveTranspilePackages(features);
    const existing = nextConfig.transpilePackages ?? [];
    // Merge: feature-derived packages first, then any manually specified extras
    const merged = [
      ...fromFeatures,
      ...existing.filter((p) => !fromFeatures.includes(p)),
    ];
    return { ...nextConfig, transpilePackages: merged };
  };
}
