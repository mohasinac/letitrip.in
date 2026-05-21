"use client";
// audit-auth-gates-ok — imports @/actions/demo-seed.types (types only, no function calls)

/**
 * SeedPanel — Admin data management and schema documentation panel.
 *
 * Route: /[locale]/demo/seed  (admin-only; controlled by featureFlags.seedPanel in siteSettings)
 * Enabled/disabled from Admin → Feature Flags. Safe to run on live servers when enabled.
 *
 * Per-resource accordion cards: each collection has its own expandable card showing
 * seeded items, pending items, DB state, target counts, schema fields, slug patterns,
 * media slug patterns, and SEO filename conventions.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ACTIONS,
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Row,
  Section,
  Select,
  Stack,
  Text,
  Div,
} from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";
import type { SeedCollectionName } from "@/actions/demo-seed.types";

// ─── Collection order ─────────────────────────────────────────────────────────

// SB-UNI-A 2026-05-13 — store addresses merged into top-level `addresses`
// collection with ownerType:"user"|"store" discriminator. The legacy
// "storeAddresses" entry was removed.
const CORE_COLLECTIONS: SeedCollectionName[] = [
  "users", "addresses", "stores", "categories",
];

const LISTINGS_COLLECTIONS: SeedCollectionName[] = [
  "products", "bids", "groupedListings", "productFeatures",
];

const TRANSACTIONAL_COLLECTIONS: SeedCollectionName[] = [
  "orders", "carts", "wishlists", "history", "coupons", "reviews", "payouts", "conversations",
];

const CONTENT_COLLECTIONS: SeedCollectionName[] = [
  "blogPosts", "events", "eventEntries", "carousels", "carouselSlides", "homepageSections", "faqs",
];

const SYSTEM_COLLECTIONS: SeedCollectionName[] = [
  "notifications", "sessions", "siteSettings",
];

const MODERATION_COLLECTIONS: SeedCollectionName[] = [
  "scammerProfiles",
  "supportTickets",
];

// S-STORE-CROSS-D — Quick Seed group: 14 new S-STORE collections (11 + 3 RBAC).
const STORE_COLLECTIONS: SeedCollectionName[] = [
  "payoutMethods",
  "shippingConfigs",
  "analyticsCards",
  "analyticsAlerts",
  "storeCategories",
  "listingTemplates",
  "moderationQueue",
  "reports",
  "itemRequests",
  "storeWhatsAppConfig",
  "storeGoogleConfig",
  "roleOverrides",
  "customRoles",
  "adminNotifications",
];

const ALL_COLLECTIONS: SeedCollectionName[] = [
  ...CORE_COLLECTIONS,
  ...LISTINGS_COLLECTIONS,
  ...TRANSACTIONAL_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
  ...SYSTEM_COLLECTIONS,
  ...MODERATION_COLLECTIONS,
  ...STORE_COLLECTIONS,
];

const DEFAULT_SELECTED: SeedCollectionName[] = [
  ...CORE_COLLECTIONS,
  ...LISTINGS_COLLECTIONS,
  ...TRANSACTIONAL_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
];

// ─── Collection metadata ──────────────────────────────────────────────────────

type GroupKey = "core" | "listings" | "transactional" | "content" | "system" | "moderation" | "store";

interface FieldDef {
  name: string;
  type: "string" | "number" | "boolean" | "timestamp" | "array" | "map" | "ref" | "enum";
  searchable?: true;
  filterable?: true;
  sortable?: true;
  pii?: true;
  indexed?: true;
  note?: string;
}

interface MediaSlugPattern {
  type: string;
  pattern: string;
  example: string;
}

interface CollectionMeta {
  label: string;
  icon: string;
  group: GroupKey;
  target: number;
  description: string;
  slugPattern: string;
  mediaFields?: string[];
  mediaSlugPatterns?: MediaSlugPattern[];
  seededItems: string[];
  pendingItems: string[];
  uiPath: string;
  piiFields?: string[];
  nameKey?: string;
  fields: FieldDef[];
}

const COLLECTION_META: Record<SeedCollectionName, CollectionMeta> = {
  users: {
    label: "Users",
    icon: "👤",
    group: "core",
    target: 3,
    description: "All platform accounts: 1 admin, 1 seller+buyer (Kaiba), 1 buyer (Yugi). Auth records + Firestore profile docs.",
    slugPattern: "user-{name}  (e.g. user-yugi-muto)",
    mediaFields: ["photoURL"],
    mediaSlugPatterns: [
      { type: "user-avatar", pattern: "user-{name}-avatar.{ext}", example: "user-yugi-muto-avatar.webp" },
    ],
    seededItems: [
      "3 users total: 1 admin (user-admin-letitrip), 1 seller+buyer (user-seto-kaiba), 1 buyer (user-yugi-muto)",
      "Admin — admin@letitrip.in — owns store-letitrip-official",
      "Kaiba — seto.kaiba@kaibacorp.com — owns store-kaiba-corp-cards, also buys",
      "Yugi — yugi.muto@domino-city.jp — buyer only",
      "YGOPRODECK card art used as avatars (Dark Magician, Blue-Eyes, Exodia)",
    ],
    pendingItems: [],
    uiPath: "/admin/users",
    piiFields: ["email", "phoneNumber", "displayName"],
    fields: [
      { name: "uid",          type: "string",    filterable: true, indexed: true },
      { name: "email",        type: "string",    searchable: true, filterable: true, pii: true, indexed: true, note: "blind-indexed via emailIndex" },
      { name: "emailIndex",   type: "string",    filterable: true, indexed: true, note: "HMAC blind index — never display raw" },
      { name: "phoneNumber",  type: "string",    filterable: true, pii: true, indexed: true, note: "blind-indexed via phoneIndex" },
      { name: "displayName",  type: "string",    searchable: true, pii: true },
      { name: "photoURL",     type: "string",    pii: true },
      { name: "role",         type: "enum",      filterable: true, sortable: true, indexed: true },
      { name: "emailVerified",type: "boolean",   filterable: true, indexed: true },
      { name: "disabled",     type: "boolean",   filterable: true, indexed: true },
      { name: "storeId",      type: "ref",       filterable: true },
      { name: "storeSlug",    type: "string",    filterable: true, indexed: true },
      { name: "storeStatus",  type: "enum",      filterable: true, indexed: true },
      { name: "passwordHash",            type: "string",    pii: true, note: "server-only, never returned to client" },
      { name: "notificationPreferences", type: "map",       note: "channels: {email?,whatsapp?,sms?}; types: {orderUpdates?,bids?,offers?,reviews?,messages?,promotions?,system?}" },
      { name: "createdAt",               type: "timestamp", sortable: true, filterable: true },
      { name: "updatedAt",               type: "timestamp", sortable: true },
    ],
  },
  // SB-UNI-A 2026-05-13 — unified top-level `addresses` collection. Holds
  // both buyer delivery addresses (ownerType:"user") and store pickup
  // addresses (ownerType:"store"). Subcollection paths
  // `users/{uid}/addresses` and `stores/{slug}/addresses` are deprecated.
  addresses: {
    label: "Addresses (User + Store)",
    icon: "📍",
    group: "core",
    target: 8,
    description: "Unified addresses collection (SB-UNI-A). Discriminated by ownerType:\"user\"|\"store\" + ownerId. 5 user addresses (Domino City / Tokyo) + 3 store addresses (HQ / warehouse / fulfillment).",
    slugPattern: "auto-ID (top-level addresses/{addressId})",
    seededItems: [
      "5 user addresses: Yugi (2 Domino City), Kaiba (2 Tokyo), Admin (1 Mumbai)",
      "3 store addresses: Kaiba Corp HQ, warehouse, fulfillment center",
      "One default address per owner-pair",
    ],
    pendingItems: [],
    uiPath: "/user/addresses",
    piiFields: ["fullName", "phone", "addressLine1"],
    fields: [
      { name: "ownerType",    type: "enum",      filterable: true, indexed: true },
      { name: "ownerId",      type: "ref",       filterable: true, indexed: true },
      { name: "label",        type: "string",    searchable: true },
      { name: "fullName",     type: "string",    searchable: true, pii: true },
      { name: "phone",        type: "string",    pii: true },
      { name: "addressLine1", type: "string",    pii: true },
      { name: "addressLine2", type: "string",    pii: true },
      { name: "landmark",     type: "string" },
      { name: "city",         type: "string",    filterable: true, sortable: true },
      { name: "state",        type: "string",    filterable: true, sortable: true },
      { name: "postalCode",   type: "string",    filterable: true },
      { name: "country",      type: "string",    filterable: true },
      { name: "isDefault",    type: "boolean",   filterable: true, indexed: true },
      { name: "createdAt",    type: "timestamp", sortable: true, indexed: true },
    ],
  },
  // SB-UNI-A 2026-05-13 — `storeAddresses` legacy alias removed; addresses
  // entry above covers both ownerType:"user" and ownerType:"store" rows.
  stores: {
    label: "Stores",
    icon: "🏪",
    group: "core",
    target: 2,
    description: "Seller storefronts. 2 stores: LetItRip Official (admin) and Kaiba Corp Card Vault (Kaiba).",
    slugPattern: "store-{name}  (e.g. store-kaiba-corp-cards)",
    mediaFields: ["storeLogoURL", "storeBannerURL"],
    mediaSlugPatterns: [
      { type: "store-logo",   pattern: "store-{name}-logo.{ext}",   example: "store-kaiba-corp-cards-logo.webp" },
      { type: "store-banner", pattern: "store-{name}-banner.{ext}", example: "store-kaiba-corp-cards-banner.webp" },
    ],
    seededItems: [
      "store-letitrip-official — Platform's own store, owned by admin",
      "store-kaiba-corp-cards — Kaiba's premium card shop, YGO singles + sealed",
    ],
    pendingItems: [],
    uiPath: "/stores",
    fields: [
      { name: "storeSlug",        type: "string",    filterable: true, indexed: true },
      { name: "storeName",        type: "string",    searchable: true, sortable: true },
      { name: "ownerId",          type: "ref",       filterable: true, indexed: true },
      { name: "status",           type: "enum",      filterable: true, sortable: true, indexed: true },
      { name: "storeCategory",    type: "string",    filterable: true },
      { name: "isPublic",         type: "boolean",   filterable: true },
      { name: "isVacationMode",   type: "boolean",   filterable: true },
      { name: "location",         type: "string",    filterable: true },
      { name: "storeDescription", type: "string",    searchable: true },
      { name: "stats.totalProducts", type: "number", sortable: true },
      { name: "stats.averageRating", type: "number", sortable: true },
      // S-SBUNI-RULES 2026-05-13 — shipping configuration
      { name: "shippingConfig",                        type: "map",   note: "StoreShippingConfig — providers[] array of ShippingProviderConfig (id/label/type/fee/ETA/isActive)" },
      { name: "shippingConfig.providers[].providerId", type: "string", note: "Unique id within store; referenced by CartItemDocument.chosenShippingProviderId" },
      { name: "shippingConfig.providers[].type",       type: "enum",   note: "shiprocket | self-courier | store-pickup | free" },
      { name: "shippingConfig.providers[].fee",        type: "map",    note: "{ flatInPaise?, percentOfOrder?, freeAboveInPaise?, minInPaise? }" },
      { name: "createdAt",        type: "timestamp", sortable: true },
    ],
  },
  // SB-UNI-A 2026-05-13 — `storeAddresses` card removed. Store pickup
  // addresses now live in the unified top-level `addresses` collection
  // with ownerType:"store".
  // SB-UNI-C — brands folded into categories with categoryType:"brand".
  categories: {
    label: "Categories",
    icon: "🗂️",
    group: "core",
    target: 30,
    description:
      "Unified categories collection (SB-UNI). 25 categories (YGO-themed hierarchy) + 5 brands (Konami, Bandai, etc.).",
    slugPattern:
      "category-{name} | brand-{name}",
    mediaFields: ["display.coverImage", "display.icon", "brandBannerImage"],
    mediaSlugPatterns: [
      { type: "category-image", pattern: "category-{name}-image.{ext}", example: "category-yugioh-tcg-image.webp" },
      { type: "brand-banner", pattern: "brand-banner-{name}.{ext}", example: "brand-banner-konami.webp" },
    ],
    seededItems: [
      "25 hierarchy categories: YGO TCG, Booster Packs, Structure Decks, Spell Cards, Trap Cards, Monster Cards, etc.",
      "5 brands (categoryType:\"brand\"): Konami, Bandai, Upper Deck, Shueisha, Kazuki Takahashi",
    ],
    pendingItems: [],
    uiPath: "/categories",
    fields: [
      { name: "name",                 type: "string",    searchable: true, sortable: true },
      { name: "slug",                 type: "string",    filterable: true, indexed: true },
      { name: "description",          type: "string",    searchable: true },
      { name: "categoryType",         type: "enum",      filterable: true, indexed: true, note: "category | sublisting | brand | bundle" },
      { name: "tier",                 type: "number",    filterable: true, sortable: true, indexed: true },
      { name: "rootId",               type: "ref",       filterable: true, indexed: true },
      { name: "parentIds",            type: "array",     filterable: true, indexed: true },
      { name: "isLeaf",               type: "boolean",   filterable: true, indexed: true },
      { name: "isFeatured",           type: "boolean",   filterable: true, indexed: true },
      { name: "isActive",             type: "boolean",   filterable: true, indexed: true },
      { name: "isSearchable",         type: "boolean",   filterable: true, indexed: true },
      { name: "order",                type: "number",    sortable: true },
      { name: "position",             type: "number",    sortable: true },
      { name: "metrics.totalItemCount", type: "number",  sortable: true },
      // Sublisting-only field
      { name: "itemCode",             type: "string",    searchable: true, note: "categoryType=\"sublisting\" only" },
      // Brand-only fields
      { name: "brandWebsite",         type: "string",    note: "categoryType=\"brand\" only" },
      { name: "brandCountry",         type: "string",    filterable: true, note: "categoryType=\"brand\" only" },
      { name: "brandFounded",         type: "number",    sortable: true, note: "categoryType=\"brand\" only" },
      { name: "brandBannerImage",     type: "string",    note: "categoryType=\"brand\" only" },
      // Bundle-only fields
      { name: "bundlePriceInPaise",   type: "number",    sortable: true, note: "categoryType=\"bundle\" only" },
      { name: "bundleQueryRule",      type: "map",       note: "static productIds[] | dynamic filter (categoryType=\"bundle\")" },
      { name: "bundleStockStatus",    type: "enum",      filterable: true, note: "in_stock | partial | out_of_stock" },
      { name: "bundleProductIds",     type: "array",     filterable: true, indexed: true, note: "Auto-indexed for onProductStockChange Function" },
      { name: "bundleQueryResolvedAt", type: "timestamp", note: "Last resolve of dynamic rule" },
      { name: "createdByStoreId",     type: "ref",       filterable: true, indexed: true, note: "Bundle/store-created category scoping" },
      { name: "createdAt",            type: "timestamp", sortable: true, indexed: true },
    ],
  },
  products: {
    label: "Products (Standard + Auctions + Pre-orders + Prize Draws)",
    icon: "📦",
    group: "listings",
    target: 92,
    description: "All product types in one collection. 59 standard + 8 bundles + 20 auctions + 5 pre-orders. YGO cards, sealed product, accessories.",
    slugPattern: "product-{name}  /  auction-{name}  /  preorder-{name}",
    mediaFields: ["images[]", "youtubeId", "prizeDrawItems[].images[]"],
    mediaSlugPatterns: [
      { type: "product-image",    pattern: "product-{name}-{category}-{store}-image-{n}.{ext}",   example: "product-charizard-psa10-pokemon-cards-mistys-image-1.webp" },
      { type: "product-video",    pattern: "product-{name}-{category}-{store}-video-{n}.{ext}",   example: "product-charizard-psa10-pokemon-cards-mistys-video-1.mp4" },
      { type: "auction-image",    pattern: "auction-{name}-{category}-{store}-image-{n}.{ext}",   example: "auction-charizard-1st-ed-pokemon-mistys-image-1.webp" },
      { type: "preorder-image",   pattern: "preorder-{name}-{category}-{store}-image-{n}.{ext}",  example: "preorder-sv5-booster-box-pokemon-surge-image-1.webp" },
      { type: "prize-image",      pattern: "prize-{name}-{store}-image-{n}.{ext}",                example: "prize-pokemon-mystery-box-june-image-1.webp" },
      { type: "rich-text-image",  pattern: "rich-text-{entity}-{name}-image-{n}.{ext}",           example: "rich-text-product-charizard-psa10-image-1.webp" },
    ],
    seededItems: [
      "59 standard products: 10 admin merch (playmats, sleeves, deck boxes) + 49 Kaiba singles/sealed/extras",
      "8 bundles: starter deck combos, booster pack bundles",
      "20 auctions (16 Kaiba + 4 Admin): PSA/BGS/CGC graded cards, BIN auctions, ended auctions",
      "5 pre-orders: 25th Anniversary LOB, GX Tournament Pack, Blue-Eyes Tin, Dark Magician Structure Deck, Master Duel Bundle",
      "Two-Axis Status Model: status (published/draft/in_review/archived) orthogonal to isSold + availableQuantity",
      "YGOPRODECK card art images throughout",
    ],
    pendingItems: [],
    uiPath: "/products",
    fields: [
      { name: "title",         type: "string",    searchable: true, sortable: true },
      { name: "slug",          type: "string",    filterable: true },
      { name: "description",   type: "string",    searchable: true },
      { name: "category",      type: "string",    filterable: true, indexed: true },
      { name: "subcategory",   type: "string",    filterable: true },
      { name: "brand",         type: "string",    filterable: true },
      { name: "price",         type: "number",    filterable: true, sortable: true },
      { name: "status",        type: "enum",      filterable: true, sortable: true, indexed: true },
      { name: "condition",     type: "enum",      filterable: true },
      { name: "storeId",       type: "ref",       filterable: true, indexed: true },
      { name: "storeName",     type: "string",    searchable: true },
      { name: "featured",      type: "boolean",   filterable: true, indexed: true },
      { name: "listingType",   type: "enum",      filterable: true, indexed: true, note: "standard|auction|pre-order|prize-draw|classified|digital-code|live (SB1-G + SB-UNI-F)" },
      // SB-UNI-H 2026-05-13 — eBay-style hybrid auction BIN.
      { name: "buyItNowPriceInPaise", type: "number",    note: "auction Buy-It-Now price; hidden once bidsHaveStarted (SB-UNI-H)" },
      { name: "bidsHaveStarted",      type: "boolean",   note: "flips to true on first bid; locks out BIN (SB-UNI-H)" },
      // SB-UNI-G 2026-05-13 — TCGPlayer grading + card metadata.
      { name: "grading.service",      type: "enum",      indexed: true, note: "PSA|BGS|CGC|SGC|OTHER (SB-UNI-G)" },
      { name: "grading.grade",        type: "number",    sortable: true, indexed: true, note: "0-10; BGS allows 0.5 increments (SB-UNI-G)" },
      { name: "grading.certNumber",   type: "string",    note: "slab cert lookup id (SB-UNI-G)" },
      { name: "grading.slabImageMedia", type: "string",  note: "media slug for the slab image (SB-UNI-G)" },
      { name: "card.setName",         type: "string",    indexed: true, note: "TCG set name (SB-UNI-G)" },
      { name: "card.cardNumber",      type: "string",    indexed: true, note: "card number within the set, e.g. \"108/120\" (SB-UNI-G)" },
      { name: "card.setYear",         type: "number",    note: "year the set was published (SB-UNI-G)" },
      { name: "card.rarity",          type: "string",    note: "Common|Uncommon|Rare|Holo|… (SB-UNI-G)" },
      { name: "card.language",        type: "string",    note: "ISO code: en|jp|… (SB-UNI-G)" },
      // SB-UNI-I 2026-05-13 — Classified-listing fields.
      { name: "classified.meetupArea.city", type: "string", indexed: true, note: "drives (listingType, city, createdAt) index (SB-UNI-I)" },
      { name: "classified.contactMethod",   type: "enum",  note: "chat|phone|both (SB-UNI-I)" },
      { name: "classified.acceptsShipping", type: "boolean", note: "seller offers shipping in addition to meetup (SB-UNI-I)" },
      { name: "classified.negotiable",      type: "boolean", note: "price is negotiable (SB-UNI-I)" },
      // SB-UNI-J 2026-05-13 — Digital-code listing fields.
      { name: "digitalCode.codeDeliveryMethod", type: "enum", note: "auto-claim|manual-email (SB-UNI-J)" },
      { name: "digitalCode.codesAvailable",     type: "number", note: "atomic counter; codes subcollection holds encrypted code strings (SB-UNI-J)" },
      { name: "digitalCode.redemptionInstructions", type: "string", note: "surfaced on order detail page (SB-UNI-J)" },
      // SB-UNI-K 2026-05-13 — Live-item listing fields.
      { name: "liveItem.species",       type: "string",    indexed: true, note: "taxonomic; powers (listingType, species, status) index (SB-UNI-K)" },
      { name: "liveItem.jurisdictionAllowed", type: "array", note: "ISO 3166-2 codes; checkout enforces buyer state inclusion (SB-UNI-K)" },
      { name: "liveItem.vendorVerified", type: "boolean",   note: "admin verification gate for creation (SB-UNI-K)" },
      { name: "liveItem.cites",          type: "string",    note: "CITES permit number for Appendix I/II species (SB-UNI-K)" },
      // SB-UNI-L cohort 1 2026-05-13 — Catalog/Offer split foundation.
      { name: "catalogProductId",       type: "ref",       indexed: true, note: "offer→catalog link; participates in /catalog/{slug} aggregation (SB-UNI-L)" },
      { name: "isPromoted",    type: "boolean",   filterable: true, indexed: true },
      { name: "auctionEndDate",type: "timestamp", filterable: true, sortable: true },
      { name: "currentBid",    type: "number",    sortable: true },
      { name: "bidCount",      type: "number",    sortable: true },
      { name: "avgRating",     type: "number",    sortable: true },
      { name: "tags",          type: "array",     filterable: true },
      { name: "customFields",  type: "array",     note: "up to 50; key/type/value/unit per row (L1)" },
      { name: "customSections",type: "array",     note: "up to 3; each has title/text/fields[] (L3)" },
      // SB1-B / SB4 — prize-draw fields. Only populated when listingType === "prize-draw".
      { name: "prizeDrawItems",        type: "array",     note: "3–16 items; each { itemNumber, title, images, condition, estimatedValue, isWon }" },
      { name: "pricePerEntry",         type: "number",    note: "INR paise per entry — drives the cart/checkout unit price" },
      { name: "prizeMaxEntries",       type: "number",    note: "Hard cap; checkout rejects with PRIZE_POOL_FULL when reached" },
      { name: "prizeCurrentEntries",   type: "number",    note: "Atomically incremented inside the checkout transaction" },
      { name: "prizeRevealWindowStart",type: "timestamp", filterable: true, indexed: true, note: "Open transition runs on the every-5-min scheduler" },
      { name: "prizeRevealWindowEnd",  type: "timestamp", filterable: true, indexed: true, note: "Close transition runs on the every-5-min scheduler" },
      { name: "prizeRevealStatus",     type: "enum",      filterable: true, indexed: true, note: "pending → open → closed" },
      { name: "prizeRevealDeadlineDays",type: "number",   note: "Buyer's reveal window post-payment (default 3)" },
      { name: "prizeGithubFileUrl",    type: "string",    note: "Public proof-of-fairness link — RNG audit log" },
      { name: "maxPerUser",            type: "number",    filterable: true, note: "SB6 cap; enforced via orderRepository.countByUserAndProduct" },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
    ],
  },
  bids: {
    label: "Auction Bids",
    icon: "⚡",
    group: "listings",
    target: 80,
    description: "Bid history for all 20 auction listings. 2–8 bids per auction with realistic price escalation.",
    slugPattern: "bid-{productName}-{userFirstName}-{YYYYMMDD}-{random6}",
    seededItems: [
      "80 bids across 20 auctions (Yugi and Kaiba bidding against each other)",
      "Realistic bid amounts — each bid > previous by ₹50–₹2000",
      "Active/outbid/won status distribution",
      "productId matches auction slug (id === slug enforced)",
    ],
    pendingItems: [],
    uiPath: "/admin/bids",
    fields: [
      { name: "productId",    type: "ref",       filterable: true, indexed: true },
      { name: "productTitle", type: "string",    searchable: true },
      { name: "userId",       type: "ref",       filterable: true, indexed: true },
      { name: "userName",     type: "string",    searchable: true },
      { name: "userEmail",    type: "string",    filterable: true, pii: true, indexed: true },
      { name: "bidAmount",    type: "number",    filterable: true, sortable: true },
      { name: "status",       type: "enum",      filterable: true, indexed: true },
      { name: "isWinning",    type: "boolean",   filterable: true, indexed: true },
      { name: "bidDate",      type: "timestamp", sortable: true, indexed: true },
      { name: "autoMaxBid",   type: "number",    note: "server-only proxy bid amount" },
      { name: "createdAt",    type: "timestamp", sortable: true },
    ],
  },
  orders: {
    label: "Orders",
    icon: "🛒",
    group: "transactional",
    target: 50,
    description: "Purchase orders across all statuses. 50 orders (Yugi→Kaiba, Yugi→Admin, Admin→Kaiba, Kaiba→Admin).",
    slugPattern: "order-{itemCount}-{YYYYMMDD}-{random6}",
    mediaSlugPatterns: [
      { type: "invoice", pattern: "invoice-{orderId}-{YYYYMMDD}.pdf", example: "invoice-order-3-20260507-ab12cd-20260507.pdf" },
    ],
    seededItems: [
      "50 orders: 25 Yugi→Kaiba, 5 Yugi→Admin, 12 Admin→Kaiba, 8 Kaiba→Admin",
      "All statuses seeded: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURN_REQUESTED, REFUNDED",
      "Mix of standard, auction, pre-order order types",
    ],
    pendingItems: [],
    uiPath: "/admin/orders",
    fields: [
      { name: "userId",        type: "ref",       filterable: true, indexed: true },
      { name: "userEmail",     type: "string",    filterable: true, pii: true, indexed: true },
      { name: "userName",      type: "string",    searchable: true, pii: true },
      { name: "storeId",       type: "ref",       filterable: true, indexed: true },
      { name: "storeName",     type: "string",    searchable: true },
      { name: "productId",     type: "ref",       filterable: true, indexed: true },
      { name: "productTitle",  type: "string",    searchable: true },
      { name: "status",        type: "enum",      filterable: true, sortable: true, indexed: true },
      { name: "paymentStatus", type: "enum",      filterable: true, sortable: true, indexed: true },
      { name: "paymentMethod", type: "enum",      filterable: true, indexed: true },
      { name: "totalPrice",    type: "number",    sortable: true },
      { name: "shippingFee",   type: "number",    sortable: true },
      { name: "couponCode",    type: "string",    filterable: true },
      { name: "trackingNumber",type: "string",    filterable: true },
      { name: "payoutStatus",  type: "enum",      filterable: true, indexed: true },
      { name: "orderDate",     type: "timestamp", sortable: true, filterable: true, indexed: true },
      // Order discriminators set by checkout actions when items are split into prize-draw/bundle/pre-order groups.
      { name: "orderType",     type: "enum",      filterable: true, indexed: true, note: "standard|preorder|auction|offer|prize-draw|bundle (drives reveal + refund flows)" },
      { name: "offerId",       type: "ref",       filterable: true, indexed: true, note: "Set when orderType=offer; reverse-pointer to offers/{id}" },
      { name: "bundleId",      type: "ref",       filterable: true, indexed: true, note: "Set when orderType=bundle; reverse-pointer to bundles/{id}" },
      // SB4 / SB6-C / SB8-A — prize-draw order fields. Populated when orderType=prize-draw.
      { name: "prizeDrawProductId",   type: "ref",      filterable: true, indexed: true, note: "Source product id — reveal API verifies this matches the URL param" },
      { name: "prizeRevealDeadline",  type: "timestamp",filterable: true, indexed: true, note: "min(windowStart + revealDeadlineDays, windowEnd); expiry handler auto-refunds past this" },
      { name: "prizeRevealExpired",   type: "boolean",  filterable: true, note: "Set true by scheduledPrizeRevealExpiry when refunded out" },
      { name: "prizeWon",             type: "map",      note: "{ itemNumber, title, images, wonAt } — present iff reveal API has run" },
      { name: "isNonRefundable",      type: "boolean",  note: "true for prize-draw + bundle orders; flips to false when pool-exhaust or deadline auto-refund runs" },
      // S-SBUNI-RULES 2026-05-13 — refund + batch + shipping-proof fields
      { name: "paymentBatchId",        type: "string",    filterable: true, indexed: true, note: "Groups orders from one Razorpay payment (N orders, 1 transaction). Internal ref only." },
      { name: "refunds",               type: "array",     note: "OrderRefundEvent[] — append-only log; each entry has refundId/type/amount/reason/refundedAt/refundedBy + optional razorpayRefundId | manualTransactionId" },
      { name: "contestable",           type: "boolean",   filterable: true, note: "Permanently false once any refund is posted; disables dispute/RMA/INR for the order" },
      { name: "shippingProofUrl",      type: "string",    note: "Signed-URL media slug set by seller after dispatch (via /api/store/orders/[id]/shipping-proof)" },
      { name: "shippingProofMimeType", type: "string",    note: "MIME type of the shipping proof document" },
      { name: "shippingProofUploadedAt",  type: "timestamp", note: "When the shipping proof was uploaded" },
      { name: "shippingProofUploadedBy",  type: "ref",    note: "uid of the seller/admin who uploaded the proof" },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
    ],
  },
  carts: {
    label: "Shopping Carts",
    icon: "🛍️",
    group: "transactional",
    target: 4,
    description: "Active carts — 3 authenticated (Yugi, Kaiba, Admin) + 1 guest.",
    slugPattern: "auto-ID",
    seededItems: [
      "4 carts — 3 authenticated (Yugi, Kaiba, Admin), 1 guest (sessionId)",
      "YGO card products in cart with product snapshot",
      "Accurate subtotals in INR paise",
    ],
    pendingItems: [],
    uiPath: "/cart",
    fields: [
      { name: "userId",        type: "ref",       filterable: true, indexed: true },
      { name: "items",         type: "array",     note: "array of CartItemDocument" },
      { name: "items[].productId",    type: "ref",    filterable: true },
      { name: "items[].price",        type: "number", sortable: true },
      { name: "items[].listingType",  type: "enum",   filterable: true, note: "snapshot at add-to-cart time (SB1-G)" },
      // SB-UNI-4 2026-05-13 — bundle cart-line foundation. When set, productId references
      // the bundle category id and price carries the locked bundlePriceInPaise.
      { name: "items[].bundleCategorySlug", type: "string", note: "set when the line represents a bundle (categoryType:'bundle')" },
      { name: "items[].bundleProductIds",   type: "array",  note: "snapshot of bundle members at add-to-cart time" },
      // S-SBUNI-RULES 2026-05-13 — shipping provider selection
      { name: "items[].chosenShippingProviderId",  type: "string", note: "Provider id picked by buyer from ShippingPicker; snapshotted at cart-time" },
      { name: "items[].chosenShippingFeeInPaise",  type: "number", note: "Resolved fee at pick time (flat + percent - freeAbove); locked at checkout" },
      { name: "appliedCoupons",type: "array" },
      { name: "createdAt",     type: "timestamp", sortable: true },
      { name: "updatedAt",     type: "timestamp", sortable: true },
    ],
  },
  wishlists: {
    label: "Wishlists",
    icon: "💖",
    group: "transactional",
    target: 3,
    description: "One document per user. 3 wishlists: Yugi (8 items), Kaiba (5 items), Admin (4 items).",
    slugPattern: "wishlist-{userSlug}  (e.g. wishlist-user-yugi-muto)",
    seededItems: [
      "3 docs: wishlist-user-yugi-muto (8), wishlist-user-seto-kaiba (5), wishlist-user-admin-letitrip (4)",
      "Mix of standard, auction, and pre-order YGO products",
      "items ordered newest-first (addedAt desc)",
    ],
    pendingItems: [],
    uiPath: "/user/wishlist",
    fields: [
      { name: "userId",     type: "ref",       filterable: true, indexed: true },
      { name: "items",      type: "array",     note: "WishlistItem[] — productId/productType/addedAt/priceAtAdd/productSnapshot" },
      { name: "updatedAt",  type: "timestamp", sortable: true },
    ],
  },
  history: {
    label: "History (recently viewed)",
    icon: "🕓",
    group: "transactional",
    target: 3,
    description: "One document per user. 3 history docs: Yugi (15 items), Kaiba (8 items), Admin (10 items).",
    slugPattern: "history-{userSlug}  (e.g. history-user-yugi-muto)",
    seededItems: [
      "3 docs: history-user-yugi-muto (15), history-user-seto-kaiba (8), history-user-admin-letitrip (10)",
      "items ordered newest-first (viewedAt desc) — no duplicates",
    ],
    pendingItems: [],
    uiPath: "/user/history",
    fields: [
      { name: "userId",     type: "ref",       filterable: true, indexed: true },
      { name: "items",      type: "array",     note: "HistoryItem[] — productId/productType/viewedAt/productSnapshot" },
      { name: "updatedAt",  type: "timestamp", sortable: true },
    ],
  },
  coupons: {
    label: "Coupons",
    icon: "🎟️",
    group: "transactional",
    target: 10,
    description: "5 admin coupons + 5 seller coupons. YGO-themed discount codes.",
    slugPattern: "coupon-*  (e.g. coupon-heart-of-the-cards)",
    seededItems: [
      "5 admin coupons: HEART-OF-CARDS, MILLENNIUM-DEAL, SHADOW-REALM-SALE, DUEL-DISK-DISCOUNT, EXODIA-VIP",
      "5 seller coupons (Kaiba): KAIBA-CORP-15, BLUE-EYES-BUNDLE, OBELISK-PROMO, TOURNAMENT-PACK, RARE-HUNTER-10",
    ],
    pendingItems: [],
    uiPath: "/admin/coupons",
    fields: [
      { name: "code",             type: "string",    searchable: true, filterable: true },
      { name: "name",             type: "string",    searchable: true },
      { name: "description",      type: "string",    searchable: true },
      { name: "type",             type: "enum",      filterable: true, indexed: true },
      { name: "scope",            type: "enum",      filterable: true },
      { name: "storeId",          type: "ref",       filterable: true, indexed: true },
      { name: "validity.isActive",type: "boolean",   filterable: true, indexed: true },
      { name: "validity.endDate", type: "timestamp", filterable: true, sortable: true },
      { name: "usage.currentUsage",type: "number",   sortable: true },
      { name: "usage.totalLimit", type: "number",    sortable: true },
      { name: "restrictions.firstTimeUserOnly", type: "boolean", filterable: true },
      { name: "createdAt",        type: "timestamp", sortable: true },
    ],
  },
  reviews: {
    label: "Product Reviews",
    icon: "⭐",
    group: "transactional",
    target: 35,
    description: "Product reviews with star ratings, text. Linked to product + buyer. YGO collector voice.",
    slugPattern: "review-{productName}-{userName}-{YYYYMMDD}",
    mediaFields: ["images[]  (optional)"],
    mediaSlugPatterns: [
      { type: "review-image", pattern: "review-{productId}-image-{n}.{ext}", example: "review-product-charizard-psa10-image-1.webp" },
      { type: "review-video", pattern: "review-{productId}-video-1.{ext}",   example: "review-product-charizard-psa10-video-1.mp4" },
    ],
    seededItems: [
      "35 reviews across 2 stores (Yugi + Kaiba + Admin reviewing each other's products)",
      "YGO collector voice — Duel Monsters references",
      "Verified purchase flag on all reviews",
    ],
    pendingItems: [],
    uiPath: "/admin/reviews",
    fields: [
      { name: "productId",    type: "ref",       filterable: true, indexed: true },
      { name: "productTitle", type: "string",    searchable: true },
      { name: "userId",       type: "ref",       filterable: true, indexed: true },
      { name: "userName",     type: "string",    searchable: true },
      { name: "rating",       type: "number",    filterable: true, sortable: true, indexed: true },
      { name: "title",        type: "string",    searchable: true },
      { name: "comment",      type: "string",    searchable: true },
      { name: "status",       type: "enum",      filterable: true, indexed: true },
      { name: "verified",     type: "boolean",   filterable: true, indexed: true },
      { name: "featured",     type: "boolean",   filterable: true, indexed: true },
      { name: "helpfulCount", type: "number",    sortable: true },
      { name: "reportCount",  type: "number",    sortable: true },
      { name: "createdAt",    type: "timestamp", sortable: true, indexed: true },
    ],
  },
  payouts: {
    label: "Payouts",
    icon: "💳",
    group: "transactional",
    target: 5,
    description: "Seller payout records for Kaiba Corp and LetItRip Official stores.",
    slugPattern: "payout-{storeName}-{YYYYMMDD}-{random6}",
    mediaSlugPatterns: [
      { type: "payout-doc", pattern: "payout-doc-{storeName}-{YYYYMMDD}.pdf", example: "payout-doc-pokemon-palace-20260507.pdf" },
    ],
    seededItems: [
      "5 payouts across 2 stores (Kaiba Corp + LetItRip Official)",
      "Statuses: PAID, PENDING, PROCESSING mix",
    ],
    pendingItems: [],
    uiPath: "/admin/payouts",
    fields: [
      { name: "storeId",       type: "ref",       filterable: true, indexed: true },
      { name: "storeName",     type: "string",    searchable: true },
      { name: "amount",        type: "number",    sortable: true, note: "Gross seller amount in paise after platformFee deduction" },
      { name: "netAmount",     type: "number",    sortable: true, note: "amount − sum(refundDeductions); floored at 0; undefined = no deductions applied" },
      { name: "grossAmount",   type: "number",    sortable: true },
      { name: "platformFee",   type: "number",    sortable: true },
      { name: "status",        type: "enum",      filterable: true, sortable: true, indexed: true },
      { name: "paymentMethod", type: "enum",      filterable: true },
      { name: "bankAccount.accountNumberMasked", type: "string", note: "last 4 digits only" },
      { name: "upiId",         type: "string",    pii: true },
      // S-SBUNI-RULES 2026-05-13 — refund deductions
      { name: "refundDeductions", type: "array", note: "PayoutRefundDeduction[] — each entry: orderId/refundId/refundedAmount/deductedAmount/reason/appliedAt. Applied while status=pending." },
      { name: "requestedAt",   type: "timestamp", sortable: true, indexed: true },
      { name: "processedAt",   type: "timestamp", sortable: true },
    ],
  },
  blogPosts: {
    label: "Blog Posts",
    icon: "📝",
    group: "content",
    target: 6,
    description: "6 blog posts (5 published + 1 draft). YGO-themed content with YGOPRODECK cover art.",
    slugPattern: "blog-{title}",
    mediaFields: ["coverImage", "youtubeId"],
    mediaSlugPatterns: [
      { type: "blog-cover",            pattern: "blog-{title}-{category}-image-{n}.{ext}", example: "blog-how-to-grade-pokemon-cards-guides-image-1.webp" },
      { type: "blog-content-image",    pattern: "blog-{title}-{category}-image-{n}.{ext}", example: "blog-how-to-grade-pokemon-cards-guides-image-2.webp" },
      { type: "blog-additional-image", pattern: "blog-{title}-{category}-image-{n}.{ext}", example: "blog-how-to-grade-pokemon-cards-guides-image-3.webp" },
      { type: "rich-text-image",       pattern: "rich-text-{entity}-{name}-image-{n}.{ext}", example: "rich-text-blog-how-to-grade-cards-image-1.webp" },
    ],
    seededItems: [
      "6 posts: Card Grading Guide, Blue-Eyes History, Dark Magician Legacy, Tournament Prep, Collecting on a Budget, Sealed Product Investment (draft)",
      "YGOPRODECK cover art on all published posts",
    ],
    pendingItems: [],
    uiPath: "/blog",
    fields: [
      { name: "title",          type: "string",    searchable: true, sortable: true },
      { name: "slug",           type: "string",    filterable: true, indexed: true },
      { name: "excerpt",        type: "string",    searchable: true },
      { name: "content",        type: "string",    searchable: true },
      { name: "category",       type: "enum",      filterable: true, indexed: true },
      { name: "tags",           type: "array",     filterable: true },
      { name: "status",         type: "enum",      filterable: true, indexed: true },
      { name: "isFeatured",     type: "boolean",   filterable: true, indexed: true },
      { name: "authorId",       type: "ref",       filterable: true },
      { name: "authorName",     type: "string",    searchable: true },
      { name: "readTimeMinutes",type: "number",    sortable: true },
      { name: "views",          type: "number",    sortable: true },
      { name: "publishedAt",    type: "timestamp", sortable: true, filterable: true, indexed: true },
      { name: "createdAt",      type: "timestamp", sortable: true },
    ],
  },
  events: {
    label: "Events",
    icon: "🎪",
    group: "content",
    target: 8,
    description: "YGO-themed events: tournaments, sales, polls, surveys, raffles, spin-wheel. 8 events + 5 entries.",
    slugPattern: "event-{title}  (e.g. event-battle-city-tournament)",
    mediaFields: ["bannerImage"],
    mediaSlugPatterns: [
      { type: "event-cover",            pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-1.webp" },
      { type: "event-image",            pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-2.webp" },
      { type: "event-winner-image",     pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-3.webp" },
      { type: "event-additional-image", pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-4.webp" },
    ],
    seededItems: [
      "8 events: Battle City Tournament (poll), Duelist Kingdom Survey, Shadow Realm Flash Sale, Kaiba Corp Grand Prix (feedback), Millennium Puzzle Raffle (open_raffle), Heart of the Cards Spin Wheel (spin_wheel), Duel Academy Entrance Exam (top_n_scorers, ended), Duelist League Sale",
      "5 event entries across events (Yugi + Kaiba + Admin registrations)",
    ],
    pendingItems: [],
    uiPath: "/events",
    fields: [
      { name: "title",      type: "string",    searchable: true, sortable: true },
      { name: "slug",       type: "string",    filterable: true },
      { name: "type",       type: "enum",      filterable: true, indexed: true },
      { name: "status",     type: "enum",      filterable: true, indexed: true },
      { name: "tags",       type: "array",     filterable: true },
      { name: "startsAt",   type: "timestamp", filterable: true, sortable: true, indexed: true },
      { name: "endsAt",     type: "timestamp", filterable: true, sortable: true },
      { name: "stats.totalEntries",   type: "number", sortable: true },
      { name: "stats.approvedEntries",type: "number", sortable: true },
      { name: "createdBy",  type: "ref",       filterable: true },
      { name: "createdAt",  type: "timestamp", sortable: true },
      // SB9 raffle fields (S8 2026-05-13) — only populated when hasRaffle:true
      { name: "hasRaffle",               type: "boolean",   filterable: true, indexed: true, note: "SB9 — gates raffle execution paths" },
      { name: "raffleType",              type: "enum",      filterable: true, note: "open_raffle|top_n_scorers|top_n_participants|spin_wheel" },
      { name: "raffleTopN",              type: "number",    note: "winner pool size for top_n_* raffles" },
      { name: "rafflePrize",             type: "string",    note: "human-readable prize description" },
      { name: "rafflePrizeCouponId",     type: "ref",       note: "coupon auto-issued to winner" },
      { name: "raffleGithubFunctionUrl", type: "string",    note: "proof-of-fairness link" },
      { name: "raffleWinnerUserId",      type: "ref",       indexed: true, note: "set after trigger" },
      { name: "raffleWinnerDisplayName", type: "string" },
      { name: "raffleWinnerEntryId",     type: "ref" },
      { name: "raffleTriggeredAt",       type: "timestamp", sortable: true },
      { name: "raffleEntryCount",        type: "number",    sortable: true },
      // SB9 spin_wheel fields — only populated when type === "spin_wheel"
      { name: "spinPrizes",    type: "array",     note: "SpinPrize[]: id/label/couponId?/weight/isActive" },
      { name: "spinMaxPerUser",type: "number",    note: "max spins per user per window" },
      { name: "spinWindowStart",type: "timestamp",filterable: true },
      { name: "spinWindowEnd",  type: "timestamp",filterable: true },
    ],
  },
  eventEntries: {
    label: "Event Registrations",
    icon: "🎫",
    group: "content",
    target: 5,
    description: "Event registrations. 5 entries across events for Yugi, Kaiba, and Admin.",
    slugPattern: "auto-ID",
    seededItems: [
      "5 event entries across events (Yugi + Kaiba + Admin registrations)",
    ],
    pendingItems: [],
    uiPath: "/admin/events",
    fields: [
      { name: "eventId",         type: "ref",       filterable: true, indexed: true },
      { name: "userId",          type: "ref",       filterable: true, indexed: true },
      { name: "userDisplayName", type: "string",    searchable: true },
      { name: "userEmail",       type: "string",    filterable: true, pii: true },
      { name: "status",          type: "enum",      filterable: true, indexed: true },
      { name: "createdAt",       type: "timestamp", sortable: true, indexed: true },
      // SB9 spin fields (S8 2026-05-13) — only populated on spin_wheel event entries
      { name: "raffleEligible",      type: "boolean",   filterable: true, note: "SB9 — entry qualifies for raffle draw" },
      { name: "spinUsed",            type: "boolean",   filterable: true, note: "SB9 spin_wheel — user has spun" },
      { name: "spinPrizeId",         type: "string",    note: "SB9 — id of the SpinPrize won" },
      { name: "spinPrizeCouponCode", type: "string",    note: "SB9 — coupon code issued after spin" },
      { name: "spinWonAt",           type: "timestamp", sortable: true, note: "SB9 — when the spin was recorded" },
    ],
  },
  carousels: {
    label: "Named Carousels",
    icon: "🗂️",
    group: "content",
    target: 5,
    description: "Named carousel containers (EX2). Each carousel holds up to 5 slide IDs. carouselId on CarouselSectionConfig selects which carousel to render; null = default hero.",
    slugPattern: "carousel-{name}  (e.g. carousel-hero-default)",
    seededItems: [
      "1 default carousel (carousel-hero-default, slideIds: [])",
    ],
    pendingItems: [
      "4 more named carousels for category/event/brand features",
    ],
    uiPath: "/admin/carousels",
    fields: [
      { name: "id",         type: "string",    filterable: true },
      { name: "name",       type: "string",    searchable: true },
      { name: "slideIds",   type: "array" },
      { name: "createdBy",  type: "ref" },
      { name: "createdAt",  type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",  type: "timestamp", sortable: true },
    ],
  },
  carouselSlides: {
    label: "Hero Carousel Slides",
    icon: "🎠",
    group: "content",
    target: 6,
    description: "Homepage hero carousel slides. 6 slides (5 active + 1 inactive). YGOPRODECK card art backgrounds.",
    slugPattern: "slide-{title}",
    mediaFields: ["background.url", "background.mobileUrl"],
    mediaSlugPatterns: [
      { type: "carousel-image", pattern: "carousel-{title}-image.{ext}", example: "carousel-summer-sale-hero-image.webp" },
    ],
    seededItems: [
      "6 slides (5 active): Blue-Eyes hero, Dark Magician featured, Exodia collection, Tournament announcement, Booster pack promo, Inactive draft",
    ],
    pendingItems: [],
    uiPath: "/admin/carousel",
    fields: [
      { name: "title",      type: "string",    searchable: true, sortable: true },
      { name: "order",      type: "number",    sortable: true, filterable: true, indexed: true },
      { name: "active",     type: "boolean",   filterable: true, indexed: true },
      { name: "background", type: "map",       note: "image/video/gradient config" },
      { name: "cards",      type: "array",     note: "up to 6 zone cards per slide" },
      { name: "settings.autoplayDelayMs", type: "number" },
      { name: "createdBy",  type: "ref",       filterable: true, indexed: true },
      { name: "createdAt",  type: "timestamp", sortable: true, indexed: true },
    ],
  },
  homepageSections: {
    label: "Homepage Sections",
    icon: "🏠",
    group: "content",
    target: 24,
    description: "All homepage layout sections. 24 sections with YGO-themed copy. autoScroll on all horizontal sections.",
    slugPattern: "section-*  (e.g. section-featured-products)",
    mediaFields: ["config.imageUrl  (ad-banner / custom-cards types)"],
    seededItems: [
      "24 sections: welcome, hero carousel, featured products, trending, new arrivals, auctions, pre-orders, category grid, brand list, blog preview, events preview, FAQ preview, trust badges, how-it-works, newsletter, WhatsApp CTA, ad banners, and more",
      "YGO-themed section titles and descriptions",
      "autoScroll enabled on all horizontal scroller sections",
    ],
    pendingItems: [],
    uiPath: "/admin/sections",
    fields: [
      { name: "type",    type: "enum",    filterable: true, indexed: true },
      { name: "order",   type: "number",  sortable: true, filterable: true, indexed: true },
      { name: "enabled", type: "boolean", filterable: true, indexed: true },
      { name: "config",  type: "map",     note: "section-specific config object" },
      { name: "createdAt",type: "timestamp", sortable: true },
    ],
  },
  faqs: {
    label: "FAQs",
    icon: "❓",
    group: "content",
    target: 25,
    description: "25 FAQs: 20 YGO-specific + 5 general collectibles marketplace. Mixed per user request.",
    slugPattern: "faq-*  (e.g. faq-how-does-bidding-work)",
    seededItems: [
      "25 FAQs across categories: general, orders_payment, shipping_delivery, returns_refunds, product_information, account_security",
      "YGO-specific FAQs (card grading, booster odds, tournament rules, etc.)",
      "General marketplace FAQs (shipping, returns, payments)",
    ],
    pendingItems: [],
    uiPath: "/support",
    fields: [
      { name: "question",      type: "string",    searchable: true },
      { name: "answer.text",   type: "string",    searchable: true },
      { name: "category",      type: "enum",      filterable: true, indexed: true },
      { name: "seo.slug",      type: "string",    filterable: true, indexed: true },
      { name: "tags",          type: "array",     filterable: true, indexed: true },
      { name: "searchTokens",  type: "array",     filterable: true, indexed: true, note: "pre-tokenized for keyword search" },
      { name: "showOnHomepage",type: "boolean",   filterable: true, indexed: true },
      { name: "showInFooter",  type: "boolean",   filterable: true },
      { name: "isPinned",      type: "boolean",   filterable: true, indexed: true },
      { name: "priority",      type: "number",    sortable: true, filterable: true, indexed: true },
      { name: "order",         type: "number",    sortable: true },
      { name: "isActive",      type: "boolean",   filterable: true, indexed: true },
      { name: "stats.views",   type: "number",    sortable: true },
      { name: "stats.helpful", type: "number",    sortable: true, indexed: true },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
    ],
  },
  notifications: {
    label: "Notifications",
    icon: "🔔",
    group: "system",
    target: 23,
    description: "23 notifications: 10 Yugi, 8 Kaiba, 5 Admin. All notification types covered.",
    slugPattern: "notif-*",
    seededItems: [
      "23 notifications across all types — Yugi (10), Kaiba (8), Admin (5)",
      "Mix of isRead: true/false for notification badge testing",
      "Linked entityId + entityType for deep-linking",
    ],
    pendingItems: [],
    uiPath: "/user/notifications",
    fields: [
      { name: "userId",      type: "ref",       filterable: true, indexed: true },
      { name: "type",        type: "enum",      filterable: true, indexed: true },
      { name: "title",       type: "string",    searchable: true },
      { name: "message",     type: "string",    searchable: true, note: "full notification body (distinct from title)" },
      { name: "isRead",      type: "boolean",   filterable: true, indexed: true },
      { name: "priority",    type: "enum",      filterable: true, indexed: true, note: "low|normal|high|urgent" },
      { name: "actionUrl",   type: "string",    note: "deep-link CTA target" },
      { name: "actionLabel", type: "string",    note: "CTA button label" },
      { name: "readAt",      type: "timestamp", sortable: true },
      { name: "entityId",    type: "ref",       filterable: true, indexed: true, note: "deep-link target ID" },
      { name: "entityType",  type: "enum",      filterable: true },
      { name: "relatedId",   type: "ref",       filterable: true, note: "secondary related entity" },
      { name: "relatedType", type: "string",    filterable: true },
      { name: "createdAt",   type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",   type: "timestamp", sortable: true },
    ],
  },
  sessions: {
    label: "Sessions",
    icon: "🔐",
    group: "system",
    target: 5,
    description: "5 sessions: 3 active (Yugi, Kaiba, Admin), 1 expired, 1 revoked.",
    slugPattern: "auto-ID",
    seededItems: [
      "5 session records — 3 active, 1 expired, 1 revoked",
      "Mix of mobile / desktop userAgent",
    ],
    pendingItems: [],
    uiPath: "/admin/users",
    fields: [
      { name: "userId",              type: "ref",       filterable: true, indexed: true },
      { name: "isActive",            type: "boolean",   filterable: true, indexed: true },
      { name: "expiresAt",           type: "timestamp", filterable: true, sortable: true, indexed: true },
      { name: "lastActivity",        type: "timestamp", filterable: true, sortable: true, indexed: true },
      { name: "deviceInfo.browser",  type: "string",    filterable: true },
      { name: "deviceInfo.os",       type: "string",    filterable: true },
      { name: "deviceInfo.device",   type: "string",    filterable: true },
      { name: "deviceInfo.ip",       type: "string",    pii: true, note: "masked — never exposed to client" },
      { name: "location.country",    type: "string",    filterable: true },
      { name: "createdAt",           type: "timestamp", sortable: true, indexed: true },
    ],
  },
  siteSettings: {
    label: "Site Settings",
    icon: "⚙️",
    group: "system",
    target: 1,
    description: "Single global settings document with 13 setting groups controlling the entire platform.",
    slugPattern: "site_settings/global  (singleton)",
    mediaFields: ["branding.logo", "branding.favicon", "seoDefaults.ogImage"],
    seededItems: [
      "1 doc at site_settings/global",
      "13 groups: Branding, Appearance, Announcement Banner, SEO Defaults, Contact + Social, Watermark, Fees + Commissions, Integrations + API Keys, Shipping Defaults, Auction Config, Platform Limits, Legal Pages, Notification Channels",
      "Feature flags: enableAuctions, enablePreOrders, enableCOD, enableSocialFeed",
      "Razorpay + Shiprocket integration keys (test mode)",
      "notificationChannels: inApp always-on, email/whatsapp/sms all disabled by default",
    ],
    pendingItems: [],
    uiPath: "/admin/site",
    fields: [
      { name: "branding",              type: "map", note: "name, logo, favicon, colors" },
      { name: "appearance",            type: "map", note: "theme, font, dark mode default" },
      { name: "announcementBanner",    type: "map", note: "enabled, text, link, color" },
      { name: "seoDefaults",           type: "map", note: "title, description, og:image" },
      { name: "contactSocial",         type: "map", note: "email, phone, social handles" },
      { name: "watermark",             type: "map", note: "type (text|image), text, imageUrl, size %, opacity %" },
      { name: "fees",                  type: "map", note: "platformFeeRate, gstRate" },
      { name: "integrations",          type: "map", note: "Razorpay, Shiprocket keys (test)" },
      { name: "shipping",              type: "map", note: "defaultCarrier, freeShippingThreshold" },
      { name: "auctionConfig",         type: "map", note: "extensionMinutes, minBidIncrement" },
      { name: "platformLimits",        type: "map", note: "maxImagesPerProduct, maxActiveSlides" },
      { name: "legalPages",            type: "map", note: "ToS, privacy, refund policy URLs" },
      { name: "notificationChannels",  type: "map", note: "inApp (always-on), email, whatsapp, sms — each with enabled + minPriority" },
    ],
  },
  conversations: {
    label: "Conversations",
    icon: "💬",
    group: "transactional",
    target: 5,
    description: "Buyer–seller message threads between Yugi, Kaiba, and Admin. YGO-themed conversations.",
    slugPattern: "conv-{product-slug}-{buyer}-{seller}-NNN",
    seededItems: [
      "5 conversation threads — Yugi↔Kaiba, Admin↔Kaiba, etc.",
      "Mixed read/unread states + unreadBuyer / unreadSeller counters",
    ],
    pendingItems: [],
    uiPath: "/user/messages",
    fields: [
      { name: "buyerId",          type: "ref",       filterable: true, indexed: true },
      { name: "storeId",          type: "ref",       filterable: true, indexed: true },
      { name: "productId",        type: "ref",       filterable: true },
      { name: "status",           type: "enum",      filterable: true, note: "active | archived | blocked" },
      { name: "messages",         type: "array",     note: "{ id, senderId, senderRole, body, isRead, sentAt }[]" },
      { name: "lastMessage",      type: "string" },
      { name: "lastMessageAt",    type: "timestamp", sortable: true, indexed: true },
      { name: "unreadBuyer",      type: "number" },
      { name: "unreadSeller",     type: "number" },
      { name: "createdAt",        type: "timestamp", sortable: true },
    ],
  },
  // SB-UNI-B — sublistingCategories merged into categories with categoryType:"sublisting".
  groupedListings: {
    label: "Grouped Listings",
    icon: "📦",
    group: "listings",
    target: 3,
    description: "3 grouped listings: LOB box + pack/promo, Kaiba deck + singles, POTD box + pack/promo.",
    slugPattern: "group-*",
    seededItems: ["3 groups with isGroupParent + groupChildSlugs wired"],
    pendingItems: [],
    uiPath: "/admin/grouped-listings",
    fields: [
      { name: "title",    type: "string",    searchable: true },
      { name: "storeId",  type: "ref",       filterable: true, indexed: true },
      { name: "status",   type: "enum",      filterable: true },
      { name: "createdAt",type: "timestamp", sortable: true, indexed: true },
    ],
  },
  scammerProfiles: {
    label: "Scammer Profiles",
    icon: "🚨",
    group: "moderation",
    target: 3,
    description: "Scam registry with YGO-themed entries. 3 profiles: verified, pending review, rejected.",
    slugPattern: "scammer-{identifier}",
    seededItems: [
      "3 scammer profiles: rare-card-scam (verified), fake-blue-eyes (pending_review), mistaken-seller (rejected)",
    ],
    pendingItems: [],
    uiPath: "/admin/scammers",
    fields: [
      { name: "seoSlug",       type: "string",    searchable: true },
      { name: "displayNames",  type: "array",     searchable: true, indexed: true },
      { name: "phones",        type: "array",     searchable: true, indexed: true },
      { name: "upiIds",        type: "array",     searchable: true, indexed: true },
      { name: "emails",        type: "array",     searchable: true, indexed: true },
      { name: "scamType",      type: "enum",      filterable: true, indexed: true },
      { name: "scamPlatform",  type: "enum",      filterable: true, indexed: true },
      { name: "status",        type: "enum",      filterable: true, indexed: true },
      { name: "amountLost",    type: "number",    sortable: true },
      { name: "reportedBy",    type: "ref",       indexed: true },
      { name: "reportedByAnon",type: "boolean" },
      { name: "verifiedBy",    type: "ref" },
      { name: "verifiedAt",    type: "timestamp" },
      { name: "isContested",   type: "boolean",   filterable: true, indexed: true },
      { name: "incidentCount", type: "number",    sortable: true, indexed: true },
      { name: "commentCount",  type: "number",    sortable: true },
      { name: "contestCount",  type: "number",    sortable: true },
      { name: "views",         type: "number",    sortable: true, indexed: true },
      { name: "tags",          type: "array",     filterable: true },
      { name: "evidence",      type: "array",     note: "/media/ proxy URLs only" },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",     type: "timestamp", sortable: true, indexed: true },
    ],
  },
  supportTickets: {
    label: "Support Tickets",
    icon: "🎫",
    group: "moderation",
    target: 4,
    description: "Support tickets from Yugi, Kaiba, and Admin. Mix of categories and statuses.",
    slugPattern: "ticket-{userId}-{category}-{seq}",
    seededItems: [
      "4 support tickets: order issue (Yugi), refund request (Kaiba), auction dispute (Yugi), general (Admin)",
    ],
    pendingItems: [],
    uiPath: "/admin/support-tickets",
    fields: [
      { name: "userId",           type: "ref",       indexed: true },
      { name: "userEmail",        type: "string",    note: "denormalized for admin display" },
      { name: "userDisplayName",  type: "string",    note: "denormalized for admin display" },
      { name: "category",         type: "enum",      filterable: true, indexed: true },
      { name: "subject",          type: "string",    searchable: true },
      { name: "description",      type: "string" },
      { name: "orderId",          type: "ref",       note: "required when category=order_issue" },
      { name: "status",           type: "enum",      filterable: true, indexed: true },
      { name: "priority",         type: "enum",      filterable: true, indexed: true },
      { name: "assignedTo",       type: "ref",       indexed: true },
      { name: "assignedToName",   type: "string",    note: "denormalized" },
      { name: "internalNotes",    type: "string",    note: "admin-only, never sent to user" },
      { name: "messages",         type: "array",     note: "TicketMessage[]: id, authorId, authorRole, body, attachments?, createdAt" },
      { name: "resolvedAt",       type: "timestamp" },
      { name: "closedAt",         type: "timestamp" },
      { name: "createdAt",        type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",        type: "timestamp", sortable: true, indexed: true },
    ],
  },
  offers: {
    label: "Offers (Make-an-Offer)",
    icon: "🤝",
    group: "transactional",
    target: 10,
    description: "Make-an-Offer negotiations between buyers and sellers. Buyers submit offers on listed products; sellers can accept, decline, or counter. Accepted offers lock the price and the buyer is redirected to checkout. A paid offer creates a linked order with offerId set.",
    slugPattern: "offer-{buyerName}-{productName}-{status}  (semantic seed IDs only; production uses Firestore auto-IDs)",
    seededItems: [
      "10 offers across all 7 statuses: pending ×2, accepted ×1, declined ×1, countered ×2, expired ×1, withdrawn ×1, paid ×2",
      "Yugi as buyer on Kaiba Corp: offer-yugi-blue-eyes-pending, offer-yugi-dark-magician-paid",
      "Admin as buyer on Kaiba Corp: offer-admin-exodia-countered, offer-admin-pot-of-greed-paid",
      "Kaiba as buyer on LetItRip Official: offer-kaiba-sleeve-pending, offer-kaiba-mat-declined",
    ],
    pendingItems: [],
    uiPath: "/admin/offers",
    fields: [
      { name: "productId",     type: "ref",       filterable: true, indexed: true },
      { name: "productTitle",  type: "string",    searchable: true },
      { name: "storeId",       type: "ref",       filterable: true, indexed: true },
      { name: "storeName",     type: "string",    searchable: true },
      { name: "buyerUid",      type: "ref",       filterable: true, indexed: true },
      { name: "buyerName",     type: "string",    searchable: true, pii: true },
      { name: "buyerEmail",    type: "string",    filterable: true, pii: true, indexed: true },
      { name: "listedPrice",   type: "number",    sortable: true, note: "paise" },
      { name: "offerAmount",   type: "number",    sortable: true, note: "paise — buyer's initial offer" },
      { name: "counterAmount", type: "number",    note: "paise — seller counter (status=countered)" },
      { name: "lockedPrice",   type: "number",    note: "paise — final agreed price (status=accepted|paid)" },
      { name: "currency",      type: "string",    filterable: true },
      { name: "status",        type: "enum",      filterable: true, indexed: true, note: "pending|accepted|declined|countered|expired|withdrawn|paid" },
      { name: "buyerNote",     type: "string",    searchable: true },
      { name: "sellerNote",    type: "string",    searchable: true },
      { name: "expiresAt",     type: "timestamp", filterable: true, indexed: true },
      { name: "acceptedAt",    type: "timestamp", sortable: true },
      { name: "respondedAt",   type: "timestamp", sortable: true },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",     type: "timestamp", sortable: true },
    ],
  },
  productFeatures: {
    label: "Product Features",
    icon: "🏅",
    group: "listings",
    target: 10,

    description: "Reusable feature badges products opt into via product.features[]. Two scopes: platform (admin-curated, available to every store) and store (seller-owned custom, capped at 20/store). Products may reference up to 10 features.",
    slugPattern: "feature-*",
    seededItems: [
      "feature-free-shipping",
      "feature-verified-seller",
      "feature-accept-returns",
      "feature-condition-new",
      "feature-condition-used",
      "feature-featured",
      "feature-promoted",
      "feature-auction-winner-badge",
      "feature-shipping-paid-by-seller",
      "feature-preorder-confirmed",
    ],
    pendingItems: [],
    uiPath: "/admin/features",
    fields: [
      { name: "label",        type: "string",    searchable: true },
      { name: "icon",         type: "string",    note: "icon-set name key OR SVG path-d" },
      { name: "iconColor",    type: "string",    note: "--appkit-color-* token" },
      { name: "category",     type: "enum",      filterable: true },
      { name: "scope",        type: "enum",      filterable: true, indexed: true },
      { name: "storeId",      type: "ref",       filterable: true, indexed: true, note: "required when scope=store" },
      { name: "productTypes", type: "array",     filterable: true },
      { name: "isActive",     type: "boolean",   filterable: true, indexed: true },
      { name: "displayOrder", type: "number",    sortable: true },
      { name: "createdAt",    type: "timestamp", sortable: true },
      { name: "updatedAt",    type: "timestamp", sortable: true },
    ],
  },

  // ───── S-STORE collections (Tier S-STORE) ─────────────────────────────

  payoutMethods: {
    label: "Payout Methods",
    icon: "💳",
    group: "store",
    target: 4,
    description: "Seller payout destinations — UPI VPA, bank account, card, or other. One default per store. Seeded for 2 stores.",
    slugPattern: "payout-method-{store}-{type}-{purpose}",
    seededItems: [
      "payout-method-letitrip-official-upi-default",
      "payout-method-letitrip-official-bank",
      "payout-method-kaiba-corp-upi-default",
      "payout-method-kaiba-corp-bank",
    ],
    pendingItems: [],
    uiPath: "/store/payout-methods",
    piiFields: ["upiVpa", "accountNumber", "accountHolderName"],
    fields: [
      { name: "sellerId",          type: "ref",       indexed: true },
      { name: "storeId",           type: "ref",       indexed: true, filterable: true },
      { name: "type",              type: "enum",      indexed: true, filterable: true, note: "upi|bank|card|other" },
      { name: "label",             type: "string",    searchable: true },
      { name: "upiVpa",            type: "string",    pii: true, note: "type=upi" },
      { name: "accountNumber",     type: "string",    pii: true, note: "type=bank" },
      { name: "ifscCode",          type: "string",    note: "type=bank" },
      { name: "accountHolderName", type: "string",    pii: true, note: "type=bank" },
      { name: "bankName",          type: "string",    note: "type=bank" },
      { name: "isDefault",         type: "boolean",   filterable: true, indexed: true },
      { name: "isActive",          type: "boolean",   filterable: true, indexed: true },
      { name: "createdAt",         type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",         type: "timestamp", sortable: true },
    ],
  },

  shippingConfigs: {
    label: "Shipping Configs",
    icon: "📦",
    group: "store",
    target: 6,
    description: "Per-store shipping rules. Stores may run multiple configs — flat / free-above / weight / express / pickup / custom — with one default. Selected per-listing or at checkout based on cart contents.",
    slugPattern: "ship-config-{store}-{method}",
    seededItems: [
      "ship-config-letitrip-official-free / -express / -pickup",
      "ship-config-kaiba-corp-flat / -free-999 / -express",
    ],
    pendingItems: [],
    uiPath: "/store/shipping-configs",
    fields: [
      { name: "storeId",                type: "ref",       indexed: true, filterable: true },
      { name: "label",                  type: "string",    searchable: true },
      { name: "method",                 type: "enum",      indexed: true, filterable: true, note: "free|flat|weight|express|pickup|custom" },
      { name: "flatRateInPaise",        type: "number",    sortable: true, note: "method=flat|express" },
      { name: "pricePerKgInPaise",      type: "number",    sortable: true, note: "method=weight" },
      { name: "freeAbovePaise",         type: "number",    sortable: true, note: "method=free" },
      { name: "expressSurchargeInPaise",type: "number",    note: "method=express" },
      { name: "estimatedDays",          type: "number",    sortable: true },
      { name: "zones",                  type: "array",     filterable: true },
      { name: "isDefault",              type: "boolean",   filterable: true, indexed: true },
      { name: "isActive",               type: "boolean",   filterable: true, indexed: true },
      { name: "createdAt",              type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",              type: "timestamp", sortable: true },
    ],
  },

  analyticsCards: {
    label: "Analytics Cards",
    icon: "📊",
    group: "store",
    target: 12,
    description: "Dashboard cards for seller + admin analytics. Built-in cards ship by default; sellers can add custom cards via the dashboard. Each card has a metric key, type (metric/line/bar/pie/table), and visibility toggle.",
    slugPattern: "ac-{scope}-{metric}",
    seededItems: [
      "Seller built-ins (Kaiba Corp): revenue-30d, orders-30d, aov, traffic, top-products",
      "Admin built-ins: platform-gmv, active-stores, pending-moderation, open-reports",
    ],
    pendingItems: [],
    uiPath: "/store/analytics/cards",
    fields: [
      { name: "scope",      type: "enum",      indexed: true, filterable: true, note: "seller|admin" },
      { name: "ownerId",    type: "ref",       indexed: true },
      { name: "title",      type: "string",    searchable: true },
      { name: "type",       type: "enum",      filterable: true, note: "metric|line|bar|pie|table|custom" },
      { name: "metric",     type: "string",    filterable: true },
      { name: "filters",    type: "map" },
      { name: "position",   type: "number",    sortable: true },
      { name: "isBuiltIn",  type: "boolean",   filterable: true },
      { name: "isVisible",  type: "boolean",   filterable: true, indexed: true },
      { name: "createdAt",  type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",  type: "timestamp", sortable: true },
    ],
  },

  analyticsAlerts: {
    label: "Analytics Alerts",
    icon: "🚨",
    group: "store",
    target: 6,
    description: "Threshold-based alerts for seller + admin metrics. Triggers fire when the metric crosses the threshold in a given window. Notifications fan out via configured channels (in-app, email, WhatsApp).",
    slugPattern: "alert-{metric}-{owner}",
    seededItems: [
      "alert-low-stock-kaiba-corp",
      "alert-no-sales-kaiba-corp",
      "alert-platform-error-rate (admin)",
      "alert-fraud-surge (admin)",
    ],
    pendingItems: [],
    uiPath: "/store/analytics/alerts",
    fields: [
      { name: "scope",          type: "enum",      indexed: true, filterable: true },
      { name: "ownerId",        type: "ref",       indexed: true },
      { name: "label",          type: "string",    searchable: true },
      { name: "metric",         type: "string",    filterable: true, indexed: true },
      { name: "operator",       type: "enum",      note: ">|<|>=|<=|==|!=" },
      { name: "threshold",      type: "number",    sortable: true },
      { name: "windowHours",    type: "number",    sortable: true },
      { name: "isActive",       type: "boolean",   filterable: true, indexed: true },
      { name: "notifyChannels", type: "array",     note: "in-app|email|whatsapp" },
      { name: "lastTriggeredAt",type: "timestamp", sortable: true },
      { name: "createdAt",      type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",      type: "timestamp", sortable: true },
    ],
  },

  storeCategories: {
    label: "Storefront Categories",
    icon: "🗂️",
    group: "store",
    target: 8,
    description: "Per-store catalogue groupings (not platform categories). Used to organise a store's own page — \"Ultra Rares\", \"Spell Cards\", etc. Each holds a manually-curated list of productIds.",
    slugPattern: "scat-{store}-{label}",
    seededItems: [
      "scat-kaiba-corp-ultra-rares / -spell-cards / -sealed-product / -graded-cards",
      "scat-letitrip-official-accessories / -playmats / -sleeves / -merch",
    ],
    pendingItems: [],
    uiPath: "/store/categories",
    fields: [
      { name: "storeId",       type: "ref",       indexed: true, filterable: true },
      { name: "label",         type: "string",    searchable: true },
      { name: "slug",          type: "string",    indexed: true },
      { name: "displayOrder",  type: "number",    sortable: true, indexed: true },
      { name: "productIds",    type: "array" },
      { name: "isActive",      type: "boolean",   filterable: true, indexed: true },
      { name: "description",   type: "string",    searchable: true },
      { name: "coverImageUrl", type: "string" },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",     type: "timestamp", sortable: true },
    ],
  },

  listingTemplates: {
    label: "Listing Templates",
    icon: "📝",
    group: "store",
    target: 6,
    description: "Seller-defined templates that pre-fill the product create form. One per listingType (standard / auction / pre-order / prize-draw / bundle / classified / digital-code / live). Shared templates can be reused by team members on the same store.",
    slugPattern: "tmpl-{listingType}-{name}",
    seededItems: [
      "tmpl-standard-yugioh-single",
      "tmpl-auction-graded-card",
      "tmpl-preorder-sealed-product",
      "tmpl-bundle-starter-deck",
    ],
    pendingItems: [],
    uiPath: "/store/listing-templates",
    fields: [
      { name: "storeId",     type: "ref",       indexed: true, filterable: true },
      { name: "ownerId",     type: "ref",       indexed: true },
      { name: "name",        type: "string",    searchable: true },
      { name: "description", type: "string",    searchable: true },
      { name: "listingType", type: "enum",      filterable: true, indexed: true, note: "8 listing types" },
      { name: "defaults",    type: "map",       note: "JSON applied to product create form" },
      { name: "isShared",    type: "boolean",   filterable: true, indexed: true },
      { name: "isActive",    type: "boolean",   filterable: true, indexed: true },
      { name: "usageCount",  type: "number",    sortable: true },
      { name: "createdAt",   type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",   type: "timestamp", sortable: true },
    ],
  },

  moderationQueue: {
    label: "Moderation Queue",
    icon: "🛡️",
    group: "store",
    target: 6,
    description: "Pending media (video / image / rich-text) awaiting trust-and-safety review. Items flow in from product, review, event, blog, and storefront contexts. Admins approve / reject; rejected items are blocked from publishing.",
    slugPattern: "mod-{mediaType}-{entity}",
    seededItems: [
      "mod-video-blue-eyes-ultimate (pending)",
      "mod-image-kaiba-corp-banner (pending)",
      "mod-review-exodia-set (approved)",
      "mod-blog-grading-guide (auto-approved)",
    ],
    pendingItems: [],
    uiPath: "/admin/moderation",
    fields: [
      { name: "mediaType",     type: "enum",      indexed: true, filterable: true, note: "video|image|rich-text" },
      { name: "mediaUrl",      type: "string" },
      { name: "thumbnailUrl",  type: "string" },
      { name: "entityType",    type: "enum",      indexed: true, filterable: true },
      { name: "entityId",      type: "ref",       indexed: true },
      { name: "ownerId",       type: "ref",       indexed: true },
      { name: "storeId",       type: "ref",       indexed: true },
      { name: "status",        type: "enum",      indexed: true, filterable: true, note: "pending|approved|rejected|auto-approved" },
      { name: "reason",        type: "string" },
      { name: "reviewerId",    type: "ref" },
      { name: "reviewedAt",    type: "timestamp", sortable: true },
      { name: "submittedAt",   type: "timestamp", sortable: true, indexed: true },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",     type: "timestamp", sortable: true },
    ],
  },

  reports: {
    label: "Reports",
    icon: "🚩",
    group: "store",
    target: 6,
    description: "Buyer-submitted reports against listings / stores / reviews / users / blog / comments. Workflow: pending → under-review (assigned) → actioned / dismissed. Rate-limited per reporter at the API layer.",
    slugPattern: "report-{reason}-{entity}",
    seededItems: [
      "report-counterfeit-blue-eyes (pending)",
      "report-scam-fake-psa-grade (under-review)",
      "report-spam-review-exodia (actioned)",
      "report-harassment-comment (dismissed)",
    ],
    pendingItems: [],
    uiPath: "/admin/reports",
    fields: [
      { name: "entityType",    type: "enum",      indexed: true, filterable: true },
      { name: "entityId",      type: "ref",       indexed: true },
      { name: "reporterId",    type: "ref",       indexed: true },
      { name: "reporterEmail", type: "string",    pii: true },
      { name: "reason",        type: "enum",      indexed: true, filterable: true, note: "scam|counterfeit|prohibited|inappropriate|harassment|spam|ip-violation|other" },
      { name: "detail",        type: "string",    searchable: true },
      { name: "evidenceUrls",  type: "array" },
      { name: "status",        type: "enum",      indexed: true, filterable: true },
      { name: "assignedTo",    type: "ref" },
      { name: "resolution",    type: "string" },
      { name: "resolvedAt",    type: "timestamp", sortable: true },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",     type: "timestamp", sortable: true },
    ],
  },

  itemRequests: {
    label: "Item Request Board",
    icon: "🔎",
    group: "store",
    target: 6,
    description: "Community bulletin board for buyer item requests. OP posts a request → admin approves (PII filter) → request goes live → sellers reply → OP can start a private chat with a respondent. Replies are PII-filtered server-side.",
    slugPattern: "irq-{title-slug}",
    seededItems: [
      "irq-exodia-left-arm-1st-ed (open)",
      "irq-blue-eyes-lob-psa10 (open)",
      "irq-dark-magician-girl-mfc (pending-approval)",
    ],
    pendingItems: [],
    uiPath: "/item-requests",
    fields: [
      { name: "opUserId",         type: "ref",       indexed: true },
      { name: "opDisplayName",    type: "string",    searchable: true },
      { name: "title",            type: "string",    searchable: true },
      { name: "description",      type: "string",    searchable: true },
      { name: "category",         type: "string",    filterable: true, indexed: true },
      { name: "brand",            type: "string",    filterable: true },
      { name: "maxBudgetInPaise", type: "number",    sortable: true, note: "paise" },
      { name: "imageUrls",        type: "array" },
      { name: "status",           type: "enum",      indexed: true, filterable: true, note: "pending-approval|open|fulfilled|closed|rejected" },
      { name: "replies",          type: "array",     note: "inline up to cap; spillover in subcollection. PII-filtered on write." },
      { name: "replyCount",       type: "number",    sortable: true },
      { name: "approvedAt",       type: "timestamp", sortable: true },
      { name: "approvedBy",       type: "ref" },
      { name: "closedAt",         type: "timestamp" },
      { name: "createdAt",        type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",        type: "timestamp", sortable: true },
    ],
  },

  storeWhatsAppConfig: {
    label: "WhatsApp Config",
    icon: "💬",
    group: "store",
    target: 2,
    description: "Per-store WhatsApp Business connection. Paid add-on (Rs 499/month). Holds business profile name, catalog URL, auto-reply, welcome message, and onboarding status with Meta Cloud API.",
    slugPattern: "whatsapp-{store}",
    seededItems: [
      "whatsapp-kaiba-corp (connected + paid)",
      "whatsapp-letitrip-official (pending onboarding)",
    ],
    pendingItems: [],
    uiPath: "/store/whatsapp",
    piiFields: ["phoneNumber"],
    fields: [
      { name: "storeId",            type: "ref",       indexed: true },
      { name: "isConnected",        type: "boolean",   filterable: true, indexed: true },
      { name: "isPaid",             type: "boolean",   filterable: true },
      { name: "phoneNumber",        type: "string",    pii: true },
      { name: "businessProfileName",type: "string",    searchable: true },
      { name: "catalogUrl",         type: "string" },
      { name: "autoReply",          type: "string" },
      { name: "welcomeMessage",     type: "string" },
      { name: "onboardingStatus",   type: "enum",      filterable: true, note: "pending|approved|rejected" },
      { name: "createdAt",          type: "timestamp", sortable: true },
      { name: "updatedAt",          type: "timestamp", sortable: true },
    ],
  },

  roleOverrides: {
    label: "Role Overrides",
    icon: "🔑",
    group: "store",
    target: 5,
    description: "Per-user permission patches — grant/revoke specific permission keys on top of the user's base role. Optional storeId scope (null = global).",
    slugPattern: "role-override-{user}-{scope}",
    seededItems: [],
    pendingItems: [],
    uiPath: "/admin/roles",
    fields: [
      { name: "userId",             type: "ref",       indexed: true, filterable: true },
      { name: "storeId",            type: "ref",       indexed: true, filterable: true },
      { name: "grantedPermissions", type: "array" },
      { name: "revokedPermissions", type: "array" },
      { name: "customRoleIds",      type: "array" },
      { name: "reason",             type: "string" },
      { name: "createdBy",          type: "ref" },
      { name: "expiresAt",          type: "timestamp", indexed: true, sortable: true },
      { name: "createdAt",          type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",          type: "timestamp", sortable: true },
    ],
  },
  customRoles: {
    label: "Custom Roles",
    icon: "🛡️",
    group: "store",
    target: 5,
    description: "Admin-defined role bundles. Layer on top of the 5 built-in roles (user/seller/moderator/employee/admin). Hold a curated permission list.",
    slugPattern: "role-{name}",
    seededItems: [],
    pendingItems: [],
    uiPath: "/admin/roles",
    fields: [
      { name: "name",         type: "string",    searchable: true },
      { name: "slug",         type: "string",    indexed: true },
      { name: "description",  type: "string",    searchable: true },
      { name: "permissions",  type: "array" },
      { name: "inheritsFrom", type: "ref" },
      { name: "scope",        type: "enum",      filterable: true, indexed: true, note: "global|store" },
      { name: "isActive",     type: "boolean",   filterable: true, indexed: true },
      { name: "createdBy",    type: "ref" },
      { name: "createdAt",    type: "timestamp", sortable: true, indexed: true },
      { name: "updatedAt",    type: "timestamp", sortable: true },
    ],
  },
  adminNotifications: {
    label: "Admin Notifications",
    icon: "🔔",
    group: "store",
    target: 10,
    description: "Admin inbox — system / security / moderation / payouts / fraud / growth alerts. Bypasses per-user notification prefs. Targeted via audienceUserIds (empty = all admins).",
    slugPattern: "adm-notif-{category}-{ts}",
    seededItems: [],
    pendingItems: [],
    uiPath: "/admin/admin-notifications",
    fields: [
      { name: "category",        type: "enum",      filterable: true, indexed: true, note: "system|security|moderation|payouts|fraud|growth" },
      { name: "title",           type: "string",    searchable: true },
      { name: "body",            type: "string",    searchable: true },
      { name: "severity",        type: "enum",      filterable: true, indexed: true },
      { name: "isRead",          type: "boolean",   filterable: true, indexed: true },
      { name: "entityType",      type: "string",    filterable: true },
      { name: "entityId",        type: "ref" },
      { name: "audienceUserIds", type: "array" },
      { name: "createdAt",       type: "timestamp", sortable: true, indexed: true },
      { name: "readAt",          type: "timestamp", sortable: true },
    ],
  },
  storeGoogleConfig: {
    label: "Google Reviews Config",
    icon: "🌐",
    group: "store",
    target: 2,
    description: "Per-store Google Business profile sync. Holds Place ID + business name + cached avg-rating + total-reviews + last-sync timestamp. The actual review fetch is offloaded to a Firebase Function (60s ceiling).",
    slugPattern: "google-{store}",
    seededItems: [
      "google-kaiba-corp (connected — 47 reviews @ 4.8)",
      "google-letitrip-official (not connected)",
    ],
    pendingItems: [],
    uiPath: "/store/google-reviews",
    fields: [
      { name: "storeId",            type: "ref",       indexed: true },
      { name: "isConnected",        type: "boolean",   filterable: true, indexed: true },
      { name: "placeId",            type: "string",    note: "Google Places ID (ChIJ…)" },
      { name: "businessName",       type: "string",    searchable: true },
      { name: "averageRating",      type: "number",    sortable: true },
      { name: "totalReviews",       type: "number",    sortable: true },
      { name: "lastSyncedAt",       type: "timestamp", sortable: true },
      { name: "oauthRefreshToken",  type: "string",    pii: true, note: "encrypted at rest; never returned to client" },
      { name: "createdAt",          type: "timestamp", sortable: true },
      { name: "updatedAt",          type: "timestamp", sortable: true },
    ],
  },
};

// ─── Group labels ─────────────────────────────────────────────────────────────

const GROUP_CONFIG: Record<GroupKey, { label: string; icon: string }> = {
  core: { label: "Core Foundation", icon: "🗂️" },
  listings: { label: "Listings & Bids", icon: "📦" },
  transactional: { label: "Transactional", icon: "🛒" },
  content: { label: "Content & Marketing", icon: "📣" },
  system: { label: "System & Config", icon: "⚙️" },
  moderation: { label: "Trust & Safety", icon: "🚨" },
  store: { label: "Store (S-STORE)", icon: "🏪" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ColStatus = {
  name: SeedCollectionName;
  seedCount: number;
  existingCount: number;
};

type ColRunState = "idle" | "queued" | "running" | "done" | "error";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Div className="w-full">
      <Row justify="between" className="mb-1">
        <Text className="text-xs text-zinc-600 dark:text-slate-400">
          {value} / {total} collections
        </Text>
        <Text className="text-xs font-mono text-zinc-600 dark:text-slate-400">{pct}%</Text>
      </Row>
      <Div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-slate-700 overflow-hidden">
        <Div
          className="h-full rounded-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </Div>
    </Div>
  );
}

function StatusDot({ state }: { state: ColRunState }) {
  if (state === "running")
    return (
      <span
        className="inline-block w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0"
        aria-label="Running"
      />
    );
  if (state === "queued")
    return <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-zinc-300 dark:border-slate-600 shrink-0" aria-label="Queued" />;
  if (state === "done")
    return <span className="text-emerald-500 shrink-0" aria-label="Done">✓</span>;
  if (state === "error")
    return <span className="text-red-500 shrink-0" aria-label="Error">✗</span>;
  return null;
}

function SeedProgressBar({
  seeded,
  target,
  size = "md",
}: {
  seeded: number;
  target: number;
  size?: "sm" | "md";
}) {
  const pct = target > 0 ? Math.min(100, Math.round((seeded / target) * 100)) : 0;
  const color =
    pct >= 100 ? "bg-emerald-500 dark:bg-emerald-400" : pct > 0 ? "bg-amber-500 dark:bg-amber-400" : "bg-zinc-300 dark:bg-slate-600";
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <Div className={`w-full ${h} rounded-full bg-zinc-200 dark:bg-slate-700 overflow-hidden`}>
      <Div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </Div>
  );
}

// ─── Schema fields table ─────────────────────────────────────────────────────

const TYPE_CHIP: Record<FieldDef["type"], string> = {
  string:    "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  number:    "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  boolean:   "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
  timestamp: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  array:     "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
  map:       "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  ref:       "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  enum:      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
};

function Cap({ active, label, color }: { active?: boolean; label: string; color: string }) {
  if (!active) return <span className="text-zinc-300 dark:text-slate-700 text-xs select-none">—</span>;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none ${color}`}>
      {label}
    </span>
  );
}

function SchemaFieldsTable({ fields }: { fields: FieldDef[] }) {
  const [query, setQuery] = useState("");
  const [showPiiOnly, setShowPiiOnly] = useState(false);

  const shown = fields.filter((f) => {
    if (showPiiOnly && !f.pii) return false;
    if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider m-0">
          📐 Schema Fields <span className="text-zinc-400 dark:text-slate-500 font-normal normal-case tracking-normal">({fields.length} fields)</span>
        </Text>
        <div className="flex items-center gap-2">
          <Input
            bare
            type="text"
            placeholder="filter fields…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-32"
          />
          <Button
            type="button"
            onClick={() => setShowPiiOnly((v) => !v)}
            className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-colors ${
              showPiiOnly
                ? "bg-red-500 text-white border-red-500"
                : "border-zinc-300 dark:border-slate-600 text-zinc-500 dark:text-slate-400 hover:border-red-400 hover:text-red-500"
            }`}
          >
            🔒 PII only
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-slate-700">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-slate-800/60 border-b border-zinc-200 dark:border-slate-700">
              <th className="text-left px-3 py-2 font-semibold text-zinc-600 dark:text-slate-300 w-[38%]">Field</th>
              <th className="text-left px-2 py-2 font-semibold text-zinc-600 dark:text-slate-300 w-[14%]">Type</th>
              <th className="text-center px-2 py-2 font-semibold text-zinc-600 dark:text-slate-300">🔍</th>
              <th className="text-center px-2 py-2 font-semibold text-zinc-600 dark:text-slate-300">⚙️</th>
              <th className="text-center px-2 py-2 font-semibold text-zinc-600 dark:text-slate-300">↕</th>
              <th className="text-center px-2 py-2 font-semibold text-zinc-600 dark:text-slate-300">🔒</th>
              <th className="text-center px-2 py-2 font-semibold text-zinc-600 dark:text-slate-300">📇</th>
              <th className="text-left px-2 py-2 font-semibold text-zinc-600 dark:text-slate-300">Note</th>
            </tr>
            <tr className="bg-zinc-50 dark:bg-slate-800/60 border-b border-zinc-200 dark:border-slate-700">
              <th className="px-3 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-left" />
              <th className="px-2 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-left" />
              <th className="px-2 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-center">Search</th>
              <th className="px-2 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-center">Filter</th>
              <th className="px-2 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-center">Sort</th>
              <th className="px-2 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-center">PII</th>
              <th className="px-2 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-center">Index</th>
              <th className="px-2 pb-1.5 text-[10px] font-normal text-zinc-400 dark:text-slate-500 text-left" />
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center text-zinc-400 dark:text-slate-500">
                  No fields match filter.
                </td>
              </tr>
            ) : (
              shown.map((f) => (
                <tr
                  key={f.name}
                  className={`border-b border-zinc-100 dark:border-slate-800 last:border-0 transition-colors ${
                    f.pii ? "bg-red-50/40 dark:bg-red-900/5" : "hover:bg-zinc-50/60 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-zinc-800 dark:text-slate-200 break-all">{f.name}</td>
                  <td className="px-2 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold leading-none ${TYPE_CHIP[f.type]}`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Cap active={f.searchable} label="✓" color="bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Cap active={f.filterable} label="✓" color="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Cap active={f.sortable} label="✓" color="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Cap active={f.pii} label="🔒" color="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Cap active={f.indexed} label="✓" color="bg-zinc-200 dark:bg-slate-700 text-zinc-600 dark:text-slate-300" />
                  </td>
                  <td className="px-2 py-2 text-zinc-400 dark:text-slate-500 italic text-[10px] max-w-[120px] truncate" title={f.note}>
                    {f.note ?? ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {[
          { label: "🔍 Searchable", color: "text-sky-600 dark:text-sky-400" },
          { label: "⚙️ Filterable", color: "text-violet-600 dark:text-violet-400" },
          { label: "↕ Sortable",   color: "text-teal-600 dark:text-teal-400" },
          { label: "🔒 PII",        color: "text-red-600 dark:text-red-400" },
          { label: "📇 Indexed",    color: "text-zinc-500 dark:text-slate-400" },
        ].map(({ label, color }) => (
          <span key={label} className={`text-[10px] font-medium ${color}`}>{label}</span>
        ))}
      </div>
    </>
  );
}

// ─── Resource Accordion Card helpers ─────────────────────────────────────────

function renderAccordionCollapsedHeader({
  meta, runState, isLoadingStatus, dbStatus, existingCount, seedCount, isComplete, isEmpty,
  statusVariant, statusLabel, expanded, col, selected, onToggle, isRunning,
}: {
  meta: CollectionMeta;
  runState: ColRunState;
  isLoadingStatus: boolean;
  dbStatus: ColStatus | undefined;
  existingCount: number;
  seedCount: number;
  isComplete: boolean;
  isEmpty: boolean;
  statusVariant: string;
  statusLabel: string;
  expanded: boolean;
  col: SeedCollectionName;
  selected: boolean;
  onToggle: () => void;
  isRunning: boolean;
}) {
  return (
    <>
      <span className="text-lg leading-none shrink-0">{meta.icon}</span>
      <span className="text-sm font-semibold text-zinc-900 dark:text-white flex-1">{meta.label}</span>
      <StatusDot state={runState} />
      <Div className="flex items-center gap-2 shrink-0">
        {isLoadingStatus ? (
          <span className="text-xs text-zinc-400 dark:text-slate-500">…</span>
        ) : dbStatus ? (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold ${isComplete ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40" : isEmpty ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30" : "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40"}`}>
            {existingCount}/{seedCount}
          </span>
        ) : null}
        <Badge variant={statusVariant as "success" | "warning" | "danger" | "default"}>{statusLabel}</Badge>
        <span className="text-zinc-400 dark:text-slate-500 text-xs w-4 text-center select-none">{expanded ? "▲" : "▼"}</span>
      </Div>
      <Div className="shrink-0 ml-1" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
        <Checkbox id={`col-${col}`} checked={selected} onChange={onToggle} disabled={isRunning} label="" />
      </Div>
    </>
  );
}

function renderAccordionExpandedBody(meta: CollectionMeta, existingCount: number, seedCount: number, target: number) {
  return (
    <Div className="border-t border-zinc-200 dark:border-slate-700 px-5 py-4 bg-white dark:bg-slate-900/60">
      <Stack gap="md">
        <Text className="text-sm text-zinc-600 dark:text-slate-300 leading-relaxed m-0">{meta.description}</Text>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-700 dark:text-indigo-300 font-mono">🔑 {meta.slugPattern}</span>
          {meta.mediaFields?.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 text-xs text-violet-700 dark:text-violet-300 font-mono">🖼️ {f}</span>
          ))}
        </div>

        {meta.mediaSlugPatterns && meta.mediaSlugPatterns.length > 0 && (
          <Div>
            <Text className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2 m-0">🖼️ Media Slug Patterns (SEO filenames)</Text>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-slate-700">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-slate-800/60 border-b border-zinc-200 dark:border-slate-700">
                    <th className="text-left px-3 py-2 font-semibold text-zinc-600 dark:text-slate-300 w-[22%]">Context type</th>
                    <th className="text-left px-3 py-2 font-semibold text-zinc-600 dark:text-slate-300 w-[40%]">Pattern</th>
                    <th className="text-left px-3 py-2 font-semibold text-zinc-600 dark:text-slate-300">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.mediaSlugPatterns.map((p) => (
                    <tr key={p.type} className="border-b border-zinc-100 dark:border-slate-800 last:border-0 hover:bg-zinc-50/60 dark:hover:bg-slate-800/30">
                      <td className="px-3 py-2 font-mono text-indigo-700 dark:text-indigo-300 whitespace-nowrap">{p.type}</td>
                      <td className="px-3 py-2 font-mono text-zinc-700 dark:text-slate-300 text-[10px] break-all">{p.pattern}</td>
                      <td className="px-3 py-2 font-mono text-zinc-400 dark:text-slate-500 italic text-[10px] break-all">{p.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Div>
        )}

        <Div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-700 dark:text-slate-200">Target: {target} docs</span>
            <span className="text-xs font-mono text-zinc-500 dark:text-slate-400">DB: {existingCount} · Seed file: {seedCount}</span>
          </div>
          <SeedProgressBar seeded={existingCount} target={target} />
        </Div>

        <Div>
          <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 m-0">✓ What&apos;s Seeded</Text>
          <div className="flex flex-col gap-1.5">
            {meta.seededItems.map((item, i) => (
              <Text key={i} className="text-sm text-zinc-700 dark:text-slate-300 leading-snug pl-3 border-l-2 border-emerald-400 dark:border-emerald-700 m-0">{item}</Text>
            ))}
          </div>
        </Div>

        {meta.pendingItems.length > 0 && (
          <Div>
            <Text className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 m-0">⏳ Pending / Needed</Text>
            <div className="flex flex-col gap-1.5">
              {meta.pendingItems.map((item, i) => (
                <Text key={i} className="text-sm text-zinc-600 dark:text-slate-400 leading-snug pl-3 border-l-2 border-amber-400 dark:border-amber-700 m-0">{item}</Text>
              ))}
            </div>
          </Div>
        )}

        <SchemaFieldsTable fields={meta.fields} />

        {meta.piiFields && meta.piiFields.length > 0 && (
          <Div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
            <span className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
              🔒 PII fields: <strong>{meta.piiFields.join(", ")}</strong> — masked in DB with Firestore encryption. Never returned in full to client.
            </span>
          </Div>
        )}

        <>
          <Button type="button" variant="ghost" onClick={() => window.open(meta.uiPath, "_blank")} className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline font-medium p-0 h-auto">
            → View in app: {meta.uiPath}
          </Button>
        </>
      </Stack>
    </Div>
  );
}

// ─── Resource Accordion Card ──────────────────────────────────────────────────

function ResourceAccordionCard({
  col, meta, selected, onToggle, dbStatus, runState, runError, isRunning, isLoadingStatus, onRefreshOne,
}: {
  col: SeedCollectionName;
  meta: CollectionMeta;
  selected: boolean;
  onToggle: () => void;
  dbStatus: ColStatus | undefined;
  runState: ColRunState;
  runError: string | undefined;
  isRunning: boolean;
  isLoadingStatus: boolean;
  onRefreshOne: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    if (next) onRefreshOne();
  }

  const seedCount = dbStatus?.seedCount ?? 0;
  const existingCount = dbStatus?.existingCount ?? 0;
  const target = meta.target;
  const pct = target > 0 ? Math.min(100, Math.round((existingCount / target) * 100)) : 0;

  const isComplete = existingCount >= seedCount && seedCount > 0;
  const isEmpty = existingCount === 0;
  const isPartial = !isComplete && !isEmpty;

  const statusVariant = runState === "done" ? "success" : runState === "error" ? "danger" : isComplete ? "success" : isPartial ? "warning" : "default";
  const statusLabel = runState === "running" ? "seeding…" : runState === "done" ? "done" : runState === "error" ? "error" : isComplete ? "seeded" : isPartial ? `${pct}%` : "empty";

  const borderColor =
    runState === "running" ? "border-amber-400 dark:border-amber-500" :
    runState === "done" ? "border-emerald-400 dark:border-emerald-600" :
    runState === "error" ? "border-red-400 dark:border-red-600" :
    runState === "queued" ? "border-zinc-300 dark:border-slate-600" :
    expanded ? "border-zinc-300 dark:border-slate-600" : "border-zinc-200 dark:border-slate-800";

  const bgColor =
    runState === "running" ? "bg-amber-50 dark:bg-amber-900/10" :
    runState === "done" ? "bg-emerald-50 dark:bg-emerald-900/10" :
    runState === "error" ? "bg-red-50 dark:bg-red-900/10" : "";

  return (
    <Div className={`rounded-xl border transition-colors ${borderColor} ${bgColor} overflow-hidden`}>
      <Button type="button" onClick={toggleExpanded} className="w-full flex items-center gap-2 px-4 py-3 text-left">
        {renderAccordionCollapsedHeader({ meta, runState, isLoadingStatus, dbStatus, existingCount, seedCount, isComplete, isEmpty, statusVariant, statusLabel, expanded, col, selected, onToggle, isRunning })}
      </Button>

      {dbStatus && seedCount > 0 && (
        <div className="px-4 pb-2"><SeedProgressBar seeded={existingCount} target={seedCount} size="sm" /></div>
      )}

      {runError && (
        <div className="px-4 pb-2">
          <span className="text-xs text-red-600 dark:text-red-400" title={runError}>✗ {runError}</span>
        </div>
      )}

      {expanded && renderAccordionExpandedBody(meta, existingCount, seedCount, target)}
    </Div>
  );
}

// ─── Group divider ────────────────────────────────────────────────────────────

function GroupDivider({
  groupKey,
  allSelected,
  onSelectAll,
  isRunning,
}: {
  groupKey: GroupKey;
  allSelected: boolean;
  onSelectAll: (select: boolean) => void;
  isRunning: boolean;
}) {
  const { label, icon } = GROUP_CONFIG[groupKey];
  return (
    <div className="flex items-center gap-2 pt-4 pb-1">
      <span className="text-sm leading-none">{icon}</span>
      <span className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-slate-700" />
      <Button
        type="button"
        variant="ghost"
        onClick={() => onSelectAll(!allSelected)}
        disabled={isRunning}
        className="text-xs text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 shrink-0 disabled:opacity-40 transition-colors"
      >
        {allSelected ? "deselect group" : "select group"}
      </Button>
    </div>
  );
}

// ─── NDJSON stream helpers ────────────────────────────────────────────────────

interface NdjsonProgressEvent {
  type: string;
  collection?: string;
  status?: string;
  error?: string;
  done?: number;
}

type ColRunStateSetter = React.Dispatch<React.SetStateAction<Record<string, ColRunState>>>;
type ColErrorsSetter = React.Dispatch<React.SetStateAction<Record<string, string>>>;
type CompletedCountSetter = React.Dispatch<React.SetStateAction<number>>;

/**
 * Parse a single NDJSON line from the seed stream and dispatch the
 * appropriate state update. Extracted to reduce nesting inside the
 * stream reader loop.
 */
async function streamNdjsonResponse(
  body: ReadableStream<Uint8Array>,
  setColRunStates: ColRunStateSetter,
  setColErrors: ColErrorsSetter,
  setCompletedCount: CompletedCountSetter,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    lines.forEach((line) => parseNdjsonLine(line, setColRunStates, setColErrors, setCompletedCount));
  }
}

function parseNdjsonLine(
  line: string,
  setColRunStates: ColRunStateSetter,
  setColErrors: ColErrorsSetter,
  setCompletedCount: CompletedCountSetter,
): void {
  if (!line.trim()) return;
  try {
    const event = JSON.parse(line) as NdjsonProgressEvent;
    if (event.type === "progress" && event.collection) {
      if (event.status === "running") {
        setColRunStates((prev) => ({ ...prev, [event.collection!]: "running" }));
      } else if (event.status === "done") {
        setColRunStates((prev) => ({ ...prev, [event.collection!]: "done" }));
        setCompletedCount(event.done ?? 0);
      } else if (event.status === "error") {
        setColRunStates((prev) => ({ ...prev, [event.collection!]: "error" }));
        setColErrors((prev) => ({ ...prev, [event.collection!]: event.error ?? "Unknown error" }));
        setCompletedCount(event.done ?? 0);
      }
    }
  } catch { /* malformed line — skip */ }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SeedPanel() {
  const [status, setStatus] = useState<ColStatus[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState<Set<SeedCollectionName>>(
    new Set(DEFAULT_SELECTED)
  );
  const [colRunStates, setColRunStates] = useState<Record<string, ColRunState>>({});
  const [colErrors, setColErrors] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalQueued, setTotalQueued] = useState(0);

  // ─── Search / filter / sort / pagination ────────────────────────────────────
  type SortKey = "default" | "name-asc" | "name-desc" | "target-asc" | "target-desc" | "db-asc" | "db-desc";
  type StatusFilter = "all" | "seeded" | "partial" | "empty";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState<GroupKey | "all">("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const toggleCollection = (col: SeedCollectionName) => {
    const next = new Set(selectedCollections);
    if (next.has(col)) next.delete(col);
    else next.add(col);
    setSelectedCollections(next);
  };

  const toggleGroup = (cols: SeedCollectionName[], select: boolean) => {
    const next = new Set(selectedCollections);
    cols.forEach((c) => (select ? next.add(c) : next.delete(c)));
    setSelectedCollections(next);
  };

  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch(API_ROUTES.DEMO.SEED, { method: "GET" });
      const payload = await res.json();
      setStatus((payload?.data?.collections ?? []) as ColStatus[]);
    } catch {
      // non-fatal
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Initial load only — no polling. Refresh manually or after a run completes.
  useEffect(() => { void fetchStatus(); }, [fetchStatus]);

  const getColStatus = (col: SeedCollectionName) => status.find((s) => s.name === col);

  async function run(action: "load" | "delete") {
    const queue = ALL_COLLECTIONS.filter((c) => selectedCollections.has(c));
    if (queue.length === 0) return;

    setIsRunning(true);
    setCompletedCount(0);
    setTotalQueued(queue.length);
    setColErrors({});
    setColRunStates(Object.fromEntries(queue.map((c) => [c, "queued" as ColRunState])));

    try {
      const res = await fetch(API_ROUTES.DEMO.SEED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, collections: queue, dryRun }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        setColRunStates(Object.fromEntries(queue.map((c) => [c, "error" as ColRunState])));
        setColErrors(Object.fromEntries(queue.map((c) => [c, err.message ?? "Request failed"])));
        return;
      }

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("x-ndjson") && res.body) {
        // Stream NDJSON — server emits one line per collection as it completes
        await streamNdjsonResponse(res.body, setColRunStates, setColErrors, setCompletedCount);
      } else {
        // Dry-run returns plain JSON — mark all done at once
        const data = await res.json();
        if (data.success) {
          setColRunStates(Object.fromEntries(queue.map((c) => [c, "done" as ColRunState])));
          setCompletedCount(queue.length);
        } else {
          setColRunStates(Object.fromEntries(queue.map((c) => [c, "error" as ColRunState])));
          setColErrors(Object.fromEntries(queue.map((c) => [c, data.message ?? "Failed"])));
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setColRunStates(Object.fromEntries(queue.map((c) => [c, "error" as ColRunState])));
      setColErrors(Object.fromEntries(queue.map((c) => [c, msg])));
    }

    await fetchStatus();
    setIsRunning(false);
  }

  const errorCount = Object.keys(colErrors).length;
  const totalTargetDocs = ALL_COLLECTIONS.reduce(
    (sum, col) => sum + (COLLECTION_META[col]?.target ?? 0), 0
  );
  const totalExistingDocs = status.reduce((sum, s) => sum + s.existingCount, 0);
  const totalSeedDocs = status.reduce((sum, s) => sum + s.seedCount, 0);

  // ─── Group sections ──────────────────────────────────────────────────────────

  const groups: Array<{ key: GroupKey; cols: SeedCollectionName[] }> = [
    { key: "core", cols: CORE_COLLECTIONS },
    { key: "listings", cols: LISTINGS_COLLECTIONS },
    { key: "transactional", cols: TRANSACTIONAL_COLLECTIONS },
    { key: "content", cols: CONTENT_COLLECTIONS },
    { key: "system", cols: SYSTEM_COLLECTIONS },
    { key: "moderation", cols: MODERATION_COLLECTIONS },
    { key: "store", cols: STORE_COLLECTIONS },
  ];

  // ─── Filtered / sorted / paginated collections ───────────────────────────────

  const isFiltered =
    searchQuery.trim() !== "" ||
    filterGroup !== "all" ||
    filterStatus !== "all" ||
    sortBy !== "default";

  const filteredCollections = useMemo(() => {
    let result: SeedCollectionName[] = [...ALL_COLLECTIONS];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((col) => {
        const m = COLLECTION_META[col];
        return m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      });
    }

    if (filterGroup !== "all") {
      result = result.filter((col) => COLLECTION_META[col].group === filterGroup);
    }

    if (filterStatus !== "all") {
      result = result.filter((col) => {
        const st = status.find((s) => s.name === col);
        const existing = st?.existingCount ?? 0;
        const seed = st?.seedCount ?? 0;
        if (filterStatus === "seeded") return seed > 0 && existing >= seed;
        if (filterStatus === "empty") return existing === 0;
        if (filterStatus === "partial") return existing > 0 && existing < seed;
        return true;
      });
    }

    if (sortBy !== "default") {
      result = [...result].sort((a, b) => {
        const ma = COLLECTION_META[a];
        const mb = COLLECTION_META[b];
        const sa = status.find((s) => s.name === a);
        const sb = status.find((s) => s.name === b);
        switch (sortBy) {
          case "name-asc":    return ma.label.localeCompare(mb.label);
          case "name-desc":   return mb.label.localeCompare(ma.label);
          case "target-asc":  return ma.target - mb.target;
          case "target-desc": return mb.target - ma.target;
          case "db-asc":      return (sa?.existingCount ?? 0) - (sb?.existingCount ?? 0);
          case "db-desc":     return (sb?.existingCount ?? 0) - (sa?.existingCount ?? 0);
          default:            return 0;
        }
      });
    }

    return result;
  }, [searchQuery, filterGroup, filterStatus, sortBy, status]);

  const totalPages = Math.max(1, Math.ceil(filteredCollections.length / PAGE_SIZE));
  const paginatedCollections = filteredCollections.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever the filter set changes
  useEffect(() => { setPage(1); }, [searchQuery, filterGroup, filterStatus, sortBy]);

  return (
    <Section className="min-h-screen bg-white dark:bg-slate-950 text-zinc-900 dark:text-white">
      {renderSeedPanelToolbar({ selectedCollections, setSelectedCollections, isFiltered, filteredCollections, isRunning, fetchStatus, isLoadingStatus, searchQuery, setSearchQuery, sortBy, setSortBy, dryRun, setDryRun, run, filterGroup, setFilterGroup, filterStatus, setFilterStatus })}

      <Container size="2xl">
        <Stack gap="lg" className="py-8">
          {renderSeedPanelHero()}
          {renderSeedPanelStats({ isLoadingStatus, totalExistingDocs, totalSeedDocs, totalTargetDocs })}

          {isRunning && (
            <Div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-700">
              <Text className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">{dryRun ? "Dry-running" : "Seeding"} collections…</Text>
              <ProgressBar value={completedCount} total={totalQueued} />
            </Div>
          )}

          {!isRunning && totalQueued > 0 && renderSeedPanelDoneSummary({ errorCount, dryRun, completedCount, colErrors })}

          {renderSeedPanelCollectionList({ filteredCollections, isFiltered, paginatedCollections, selectedCollections, toggleCollection, getColStatus, colRunStates, colErrors, isRunning, isLoadingStatus, fetchStatus, groups, toggleGroup })}

          {isFiltered && totalPages > 1 && renderSeedPanelPagination({ page, setPage, totalPages, PAGE_SIZE, filteredCollections })}

          {renderSeedScaleSummary()}
        </Stack>
      </Container>
    </Section>
  );
}

// ─── SeedPanel sub-renderers ──────────────────────────────────────────────────

type SortKey = "default" | "name-asc" | "name-desc" | "target-asc" | "target-desc" | "db-asc" | "db-desc";
type StatusFilter = "all" | "seeded" | "partial" | "empty";

function renderSeedPanelToolbar({
  selectedCollections, setSelectedCollections, isFiltered, filteredCollections, isRunning, fetchStatus, isLoadingStatus,
  searchQuery, setSearchQuery, sortBy, setSortBy, dryRun, setDryRun, run, filterGroup, setFilterGroup, filterStatus, setFilterStatus,
}: {
  selectedCollections: Set<SeedCollectionName>;
  setSelectedCollections: React.Dispatch<React.SetStateAction<Set<SeedCollectionName>>>;
  isFiltered: boolean;
  filteredCollections: SeedCollectionName[];
  isRunning: boolean;
  fetchStatus: () => void;
  isLoadingStatus: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortBy: SortKey;
  setSortBy: React.Dispatch<React.SetStateAction<SortKey>>;
  dryRun: boolean;
  setDryRun: (v: boolean) => void;
  run: (action: "load" | "delete") => void;
  filterGroup: GroupKey | "all";
  setFilterGroup: React.Dispatch<React.SetStateAction<GroupKey | "all">>;
  filterStatus: StatusFilter;
  setFilterStatus: React.Dispatch<React.SetStateAction<StatusFilter>>;
}) {
  return (
    <div className="sticky z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-slate-800 shadow-sm" style={{ top: "var(--header-height, 0px)" }}>
      <Container size="2xl">
        <div className="py-2.5 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <Heading level={2} className="text-sm font-bold text-zinc-900 dark:text-white m-0 leading-none">
                📋 Resource Collections
                <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-slate-400">
                  {selectedCollections.size} / {ALL_COLLECTIONS.length} selected
                  {isFiltered && <span className="ml-1 text-amber-600 dark:text-amber-400">· {filteredCollections.length} match</span>}
                </span>
              </Heading>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setSelectedCollections(new Set(ALL_COLLECTIONS))} disabled={isRunning}>Select All</Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedCollections(new Set(DEFAULT_SELECTED))} disabled={isRunning}>Default</Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedCollections(new Set())} disabled={isRunning}>Clear</Button>
              <Button size="sm" variant="outline" onClick={fetchStatus} disabled={isRunning || isLoadingStatus}>{isLoadingStatus ? "…" : "↻ Refresh"}</Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-500 text-sm pointer-events-none">🔍</span>
              <Input bare type="text" placeholder="Search collections…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400" />
              {searchQuery && <Button type="button" variant="ghost" onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-xs p-0 h-auto">✕</Button>}
            </div>
            <div className="shrink-0">
              <Select
                variant="ghost"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="text-sm rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                options={[
                  { value: "default", label: "Sort: Default" },
                  { value: "name-asc", label: "Name A → Z" },
                  { value: "name-desc", label: "Name Z → A" },
                  { value: "target-desc", label: "Target ↑ highest" },
                  { value: "target-asc", label: "Target ↓ lowest" },
                  { value: "db-desc", label: "DB count ↑ most" },
                  { value: "db-asc", label: "DB count ↓ fewest" },
                ]}
              />
            </div>
            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-slate-700 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Checkbox
                label={<span className="text-xs text-zinc-600 dark:text-slate-300 whitespace-nowrap">Dry run</span>}
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                disabled={isRunning}
              />
              <Button size="sm" variant="primary" isLoading={isRunning} onClick={() => run("load")} disabled={isRunning || selectedCollections.size === 0}>{dryRun ? "⚡ Dry Add" : "⚡ Add Seed"}</Button>
              <Button size="sm" variant="danger" onClick={() => run("delete")} disabled={isRunning || selectedCollections.size === 0}>{dryRun ? "🗑️ Dry Remove" : ACTIONS.ADMIN["reset-seed-data"].label}</Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1.5 sm:items-center sm:gap-3">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium shrink-0">Group:</span>
              {(["all", "core", "listings", "transactional", "content", "system", "moderation"] as const).map((g) => {
                const active = filterGroup === g;
                const cfg = g === "all" ? { label: "All", icon: "☰" } : { label: GROUP_CONFIG[g].label, icon: GROUP_CONFIG[g].icon };
                return (
                  <Button type="button" key={g} onClick={() => setFilterGroup(g)} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${active ? "bg-amber-500 text-white" : "bg-zinc-200 dark:bg-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-300 dark:hover:bg-slate-600"}`}>
                    <span>{cfg.icon}</span>
                    <span className="hidden sm:inline ml-0.5">{cfg.label}</span>
                  </Button>
                );
              })}
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-slate-700 shrink-0" />
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium shrink-0">Status:</span>
              {([
                { key: "all", label: "All", activeClass: "bg-amber-500 text-white" },
                { key: "seeded", label: "✓ Seeded", activeClass: "bg-emerald-500 text-white" },
                { key: "partial", label: "⏳ Partial", activeClass: "bg-amber-500 text-white" },
                { key: "empty", label: "✗ Empty", activeClass: "bg-red-500 text-white" },
              ] as const).map(({ key, label, activeClass }) => (
                <Button type="button" key={key} onClick={() => setFilterStatus(key as StatusFilter)} className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${filterStatus === key ? activeClass : "bg-zinc-200 dark:bg-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-300 dark:hover:bg-slate-600"}`}>{label}</Button>
              ))}
              {isFiltered && (
                <Button type="button" variant="ghost" onClick={() => { setSearchQuery(""); setFilterGroup("all"); setFilterStatus("all"); setSortBy("default"); }} className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline ml-1 shrink-0 p-0 h-auto">✕ Clear</Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function renderSeedPanelHero() {
  return (
    <div className="flex flex-col items-center text-center gap-3 pt-2">
      <span className="text-5xl leading-none">🎮</span>
      <Heading level={1} className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 m-0">LetItRip Demo Seed</Heading>
      <Text className="text-base text-zinc-600 dark:text-slate-300 max-w-xl m-0">Admin seed tool — expand each resource card to see what&apos;s seeded, pending counts, live DB state, and the UI path to verify.</Text>
    </div>
  );
}

function renderSeedPanelStats({ isLoadingStatus, totalExistingDocs, totalSeedDocs, totalTargetDocs }: { isLoadingStatus: boolean; totalExistingDocs: number; totalSeedDocs: number; totalTargetDocs: number }) {
  return (
    <Div className="grid grid-cols-3 gap-3 sm:gap-4">
      <Div className="rounded-xl p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center flex flex-col gap-1">
        <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono leading-none">{isLoadingStatus ? <span className="text-zinc-300 dark:text-slate-600">—</span> : totalExistingDocs.toLocaleString()}</span>
        <span className="text-xs text-zinc-500 dark:text-slate-400">docs in DB</span>
      </Div>
      <Div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 text-center flex flex-col gap-1">
        <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono leading-none">{isLoadingStatus ? <span className="text-amber-200 dark:text-amber-900">—</span> : totalSeedDocs.toLocaleString()}</span>
        <span className="text-xs text-zinc-500 dark:text-slate-400">docs in seed files</span>
      </Div>
      <Div className="rounded-xl p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center flex flex-col gap-1">
        <span className="text-2xl font-extrabold text-zinc-500 dark:text-slate-300 font-mono leading-none">{totalTargetDocs.toLocaleString()}</span>
        <span className="text-xs text-zinc-500 dark:text-slate-400">total target docs</span>
      </Div>
    </Div>
  );
}

function renderSeedPanelDoneSummary({ errorCount, dryRun, completedCount, colErrors }: { errorCount: number; dryRun: boolean; completedCount: number; colErrors: Record<string, string> }) {
  return (
    <Div className={`rounded-xl p-4 border ${errorCount > 0 ? "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700" : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700"}`}>
      <Text className={`text-sm font-semibold ${errorCount > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
        {errorCount > 0 ? `✗ Completed with ${errorCount} error${errorCount > 1 ? "s" : ""} — ${completedCount - errorCount} succeeded` : `✓ ${dryRun ? "Dry run" : "Seed"} complete — all ${completedCount} collections processed`}
      </Text>
      {errorCount > 0 && (
        <Stack gap="xs" className="mt-2">
          {Object.entries(colErrors).map(([col, msg]) => (
            <Text key={col} className="text-xs text-red-600 dark:text-red-400"><strong>{COLLECTION_META[col as SeedCollectionName]?.label ?? col}:</strong> {msg}</Text>
          ))}
        </Stack>
      )}
    </Div>
  );
}

function renderAccordionCard(col: SeedCollectionName, props: { selectedCollections: Set<SeedCollectionName>; toggleCollection: (col: SeedCollectionName) => void; getColStatus: (col: SeedCollectionName) => ColStatus | undefined; colRunStates: Record<string, ColRunState>; colErrors: Record<string, string>; isRunning: boolean; isLoadingStatus: boolean; fetchStatus: () => void }) {
  return (
    <ResourceAccordionCard
      key={col}
      col={col}
      meta={COLLECTION_META[col]}
      selected={props.selectedCollections.has(col)}
      onToggle={() => props.toggleCollection(col)}
      dbStatus={props.getColStatus(col)}
      runState={props.colRunStates[col] ?? "idle"}
      runError={props.colErrors[col]}
      isRunning={props.isRunning}
      isLoadingStatus={props.isLoadingStatus}
      onRefreshOne={props.fetchStatus}
    />
  );
}

function renderSeedPanelCollectionList(p: {
  filteredCollections: SeedCollectionName[];
  isFiltered: boolean;
  paginatedCollections: SeedCollectionName[];
  selectedCollections: Set<SeedCollectionName>;
  toggleCollection: (col: SeedCollectionName) => void;
  getColStatus: (col: SeedCollectionName) => ColStatus | undefined;
  colRunStates: Record<string, ColRunState>;
  colErrors: Record<string, string>;
  isRunning: boolean;
  isLoadingStatus: boolean;
  fetchStatus: () => void;
  groups: Array<{ key: GroupKey; cols: SeedCollectionName[] }>;
  toggleGroup: (cols: SeedCollectionName[], select: boolean) => void;
}) {
  if (p.filteredCollections.length === 0) {
    return <div className="py-10 text-center text-sm text-zinc-500 dark:text-slate-400">No collections match your filters.</div>;
  }
  if (p.isFiltered) {
    return <div className="flex flex-col gap-1.5">{p.paginatedCollections.map((col) => renderAccordionCard(col, p))}</div>;
  }
  return (
    <div className="flex flex-col gap-1">
      {p.groups.map(({ key, cols }) => {
        const allGroupSelected = cols.every((c) => p.selectedCollections.has(c));
        return (
          <div key={key}>
            <GroupDivider groupKey={key} allSelected={allGroupSelected} onSelectAll={(select) => p.toggleGroup(cols, select)} isRunning={p.isRunning} />
            <div className="flex flex-col gap-1.5 mt-2">{cols.map((col) => renderAccordionCard(col, p))}</div>
          </div>
        );
      })}
    </div>
  );
}

function renderSeedPanelPagination({ page, setPage, totalPages, PAGE_SIZE, filteredCollections }: { page: number; setPage: React.Dispatch<React.SetStateAction<number>>; totalPages: number; PAGE_SIZE: number; filteredCollections: SeedCollectionName[] }) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-slate-700">
      <span className="text-xs text-zinc-500 dark:text-slate-400">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCollections.length)} of {filteredCollections.length}</span>
      <div className="flex items-center gap-1">
        <Button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 rounded-lg text-sm font-medium border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors">‹ Prev</Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <Button type="button" key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? "bg-amber-500 text-white font-bold" : "border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700"}`}>{n}</Button>
        ))}
        <Button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded-lg text-sm font-medium border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors">Next ›</Button>
      </div>
    </div>
  );
}

function renderSeedScaleSummary() {
  return (
    <Div className="rounded-2xl p-5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
      <Heading level={3} className="text-base font-bold text-amber-600 dark:text-amber-400 m-0 mb-4">📊 Target Seed Scale</Heading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0">
        {[
          ["Standard Products", "100+"], ["Auction Listings", "20"], ["Pre-orders", "10"],
          ["Categories (3-tier)", "55+"], ["Users (all roles)", "15+"], ["Stores", "8"],
          ["Brands", "25+"], ["Reviews", "60+"], ["Orders (all statuses)", "42+"],
          ["Bids (auction history)", "120+"], ["FAQs (all categories)", "55+"], ["Blog Posts", "20+"],
          ["Events", "15+"], ["Coupons (global + store)", "20+"], ["Notifications (all types)", "47+"], ["Wishlists", "40+"],
        ].map(([label, count]) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-white/5 last:border-0">
            <span className="text-sm text-zinc-700 dark:text-slate-300">{label}</span>
            <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </Div>
  );
}
