/**
 * features.config.ts — letitrip.in marketplace
 *
 * Enables / disables @mohasinac/feat-* packages for this project.
 * The CLI reads this file when running `@mohasinac/cli add <name>` or
 * `@mohasinac/cli remove <name>`.
 *
 * withFeatures() in next.config.js reads this to populate transpilePackages.
 * mergeFeatureMessages() in i18n/request.ts reads this to merge i18n fragments.
 */

import type { FeaturesConfig } from "@mohasinac/appkit";

export default {
  // ── Shell (always on) ────────────────────────────────────────────────────
  layout: true,
  forms: true,
  filters: true,
  media: true,

  // ── Shared domain (Tier B) ───────────────────────────────────────────────
  auth: true,
  account: true,
  products: true,
  categories: true,
  cart: true,
  wishlist: true,
  checkout: true,
  orders: true,
  payments: true,
  blog: true,
  reviews: true,
  faq: true,
  search: true,
  homepage: true,
  admin: true,

  // ── letitrip-specific (Tier C) ───────────────────────────────────────────
  events: true,
  auctions: true,
  promotions: true,
  seller: true,
  stores: true,
  "pre-orders": true,

  // ── Other projects — not used here ──────────────────────────────────────
  consultation: false,
  concern: false,
  corporate: false,
  "before-after": false,
  loyalty: false,
  collections: false,
  preorders: false,
  whatsappBot: false,
} satisfies FeaturesConfig;

