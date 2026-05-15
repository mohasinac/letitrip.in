"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-01: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-01) */
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
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Row,
  Section,
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

const ALL_COLLECTIONS: SeedCollectionName[] = [
  ...CORE_COLLECTIONS,
  ...LISTINGS_COLLECTIONS,
  ...TRANSACTIONAL_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
  ...SYSTEM_COLLECTIONS,
  ...MODERATION_COLLECTIONS,
];

const DEFAULT_SELECTED: SeedCollectionName[] = [
  ...CORE_COLLECTIONS,
  ...LISTINGS_COLLECTIONS,
  ...TRANSACTIONAL_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
];

// ─── Collection metadata ──────────────────────────────────────────────────────

type GroupKey = "core" | "listings" | "transactional" | "content" | "system" | "moderation";

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
    target: 25,
    description: "All platform accounts: 1 admin, 7 sellers, 17 buyers. Auth records + Firestore profile docs with hashed passwords and role custom claims.",
    slugPattern: "user-{firstName}-{lastName}-{emailPrefix}  (e.g. user-ravi-sharma-ravikar)",
    mediaFields: ["photoURL"],
    mediaSlugPatterns: [
      { type: "user-avatar", pattern: "user-{firstName}-{lastName}-avatar.{ext}", example: "user-ravi-sharma-avatar.webp" },
    ],
    seededItems: [
      "1 admin — admin@letitrip.in / Admin@123",
      "7 sellers — aryan (Pokémon Palace), nisha (CardGame Hub), vikram-mehta (Diecast Depot), rohit-joshi (Beyblade Arena), admin-letitrip (LetItRip Official), priya-singh (Tokyo Toys), amit (Gundam Galaxy)",
      "17 buyers — Buyers 1–17 with realistic Indian names, phone numbers, cities across India",
      "Password hash, displayName, photoURL, role claims per user",
    ],
    pendingItems: [
      "Store-owner accounts for Vintage Vault",
      "1 banned/deactivated account for moderation testing",
    ],
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
      { name: "passwordHash", type: "string",    pii: true, note: "server-only, never returned to client" },
      { name: "createdAt",    type: "timestamp", sortable: true, filterable: true },
      { name: "updatedAt",    type: "timestamp", sortable: true },
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
    target: 35,
    description: "Unified addresses collection (SB-UNI-A 2026-05-13). Discriminated by ownerType:\"user\"|\"store\" + ownerId. Holds buyer delivery addresses AND store pickup addresses. Indian format with pincode/state/city. One default address per (ownerType, ownerId) pair enforced at the repo level.",
    slugPattern: "auto-ID (top-level addresses/{addressId})",
    seededItems: [
      "11 user addresses linked to buyer accounts (ownerType:user)",
      "13 store pickup addresses across all 8 stores (ownerType:store)",
      "Mix of Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune locations",
      "Correct pincode + landmark format for Indian addresses",
      "One default address per owner-pair",
    ],
    pendingItems: [
      "Additional addresses for Kolkata, Ahmedabad, Jaipur",
      "Corporate / office address type",
      "Pickup availability schedule fields for store addresses",
    ],
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
    target: 8,
    description: "Seller storefronts — each with logo, banner, about text, social links, and a linked seller user account.",
    slugPattern: "store-{name}  (e.g. store-mistys-water-cards)",
    mediaFields: ["storeLogoURL", "storeBannerURL"],
    mediaSlugPatterns: [
      { type: "store-logo",   pattern: "store-{name}-logo.{ext}",   example: "store-mistys-water-cards-logo.webp" },
      { type: "store-banner", pattern: "store-{name}-banner.{ext}", example: "store-mistys-water-cards-banner.webp" },
    ],
    seededItems: [
      "Misty's Water Cards — Pokémon TCG specialist, Mumbai",
      "Surge's Electric Emporium — Pokémon TCG, Delhi",
      "Speed King Diecast — Hot Wheels, Bangalore",
      "Bladers' Paradise — Beyblade Burst, Chennai",
      "Anime Vault India — Anime figures + merch, Hyderabad",
      "Retro Vault India — Retro gaming cartridges + consoles",
      "Cosplay India Hub — Cosplay accessories + props",
      "LetItRip Official — Platform's own curated store",
    ],
    pendingItems: [
      "Store rating averages (computed from reviews)",
      "Store-level featured/verified badges",
      "Social media handles (Instagram, YouTube) per store",
    ],
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
    target: 95,
    description:
      "Unified categories collection (SB-UNI 2026-05-13). Holds 4 discriminated row types via categoryType: " +
      "(1) category — 3-tier hierarchy (root → subcategory → leaf); " +
      "(2) sublisting — tier-N+1 leaves under a parent, carry optional itemCode (e.g. \"108/120\"); " +
      "(3) brand — tier-0 self-rooted brand storefronts with brandWebsite/brandCountry/brandFounded/brandBannerImage; " +
      "(4) bundle — pricing-aware product packs with bundlePriceInPaise + bundleQueryRule (static/dynamic) + bundleStockStatus + bundleProductIds[]. " +
      "Old standalone sublistingCategories / brands / bundles collections + repos all deleted.",
    slugPattern:
      "category-{name} | sublisting-{name} | brand-{name} | bundle-{name}",
    mediaFields: ["display.coverImage", "display.icon", "brandBannerImage"],
    mediaSlugPatterns: [
      { type: "category-image", pattern: "category-{name}-image.{ext}", example: "category-pokemon-cards-image.webp" },
      { type: "brand-banner", pattern: "brand-banner-{name}.{ext}", example: "brand-banner-bandai.webp" },
      { type: "bundle-cover", pattern: "bundle-image-{slug}-1-{date}.{ext}", example: "bundle-image-pokemon-tcg-starter-pack-2026-1-20260101.jpg" },
    ],
    seededItems: [
      "22 hierarchy categories (categoryType:\"category\"): Trading Cards, Diecast Vehicles, Action Figures & Statues, Spinning Tops, Model Kits, Vintage & Rare + tier-2 leaves",
      "12 sublistings (categoryType:\"sublisting\"): Base Set 102/102, Hot Wheels Redlines, Beyblade X Series, Gundam MG, Nendoroid Early Series, etc.",
      "25 brands (categoryType:\"brand\"): Bandai, Hasbro, Takara-Tomy, Mattel, Pokémon Co., Konami, Funko, NECA, McFarlane, Good Smile, Hot Wheels, Tomica, Beyblade + 12 extended",
      "3 bundles (categoryType:\"bundle\"): Pokémon TCG Starter Pack 2026, Gunpla PG Arrivals 2026, Beyblade X Launch Pack 2025 (OOS)",
    ],
    pendingItems: [
      "AdminBundleEditorView rebuild against CategoryDocument (spec S-SBUNI-3)",
      "Public bundle detail + listing routes rebuild (spec S-SBUNI-3)",
      "More leaf-category coverage to reach P26 target",
    ],
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
    target: 132,
    description: "All product types in one collection. Standard = buy now. Auction = bidding. Pre-order = deposit. Prize-draw = paid entry, crypto.randomInt reveal. 100+ standard, 20 auctions, 10 pre-orders, 2 prize-draws.",
    slugPattern: "product-{name}-{category}-{condition}-{seller}-{n}  /  auction-…  /  preorder-…  /  prize-…",
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
      "100 standard products across 8 stores (P23 expansion: +50 new products)",
      "Pokémon Palace: 13 standard — ETBs, booster boxes, SIR singles (Charizard, Pikachu, Mewtwo)",
      "CardGame Hub: 13 standard — OP-03/05/06 boxes, YGO 25th tin, LOB singles, MTG Duskmourn",
      "Diecast Depot: 13 standard — Car Culture, RLC Porsche, Tomica LC300/Type R, Corgi DB5, Matchbox",
      "Beyblade Arena: 10 standard — BX-01 to BX-16 starters, boosters, launchers",
      "LetItRip Official: 11 standard — figma, Nendoroid, SHF, MAFEX, Funko figures",
      "Tokyo Toys India: 12 standard — figma, Nendoroid, GSC scale, ALTER scale, Funko",
      "Gundam Galaxy: 11 standard — HG/MG/RG/PG kits including PG Unleashed",
      "Vintage Vault: 7 standard — WOTC Pokémon, vintage YGO, Hot Wheels Redline, GI Joe MOC",
      "12 auctions, 8 pre-orders — across all auction-capable stores",
      "2 prize-draws (S7-PrizeDraws-prep3 2026-05-13): prize-pokemon-mystery-box-june (10 items @ ₹5/entry, 50 max) + prize-hot-wheels-treasure-hunt (8 items @ ₹299/entry, 100 max). Each carries prizeDrawItems[] with images/condition/estimatedValue + reveal-window dates + prizeGithubFileUrl proof-of-fairness link.",
    ],
    pendingItems: [
      "14 more auctions (target 20) — mix of active, upcoming, ended",
      "2 more pre-orders (target 10) — DBZ, One Piece",
      "Grouped listings (product bundles)",
      "Real YouTube video IDs for unboxing/review content",
      "More prize-draws (target 10) — Beyblade BX-launch lot, Funko Pop chase set",
    ],
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
    target: 120,
    description: "Bid history for all auction listings. Each auction has 4–12 bids with realistic price escalation.",
    slugPattern: "bid-{productName}-{userFirstName}-{YYYYMMDD}-{random6}  (e.g. bid-charizard-auction-ravi-20260507-ab12cd)",
    seededItems: [
      "26 bids across 6 auctions",
      "Realistic bid amounts — each bid > previous by ₹50–₹500",
      "Mixed users bidding (buyer1–4 + sellers cross-bidding)",
      "Timestamps spread over auction duration",
      "productId matches auction slug (id === slug enforced)",
    ],
    pendingItems: [
      "94 more bids when auctions expand to 20",
      "Outbid notifications for all non-winning bidders",
      "Max bid (proxy bidding) flag on select bids",
    ],
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
    target: 35,
    description: "Purchase orders across all statuses. Each order has line items, shipping info, timestamps, and linked buyer + store.",
    slugPattern: "order-{itemCount}-{YYYYMMDD}-{random6}  (e.g. order-3-20260507-ab12cd)",
    mediaSlugPatterns: [
      { type: "invoice", pattern: "invoice-{orderId}-{YYYYMMDD}.pdf", example: "invoice-order-3-20260507-ab12cd-20260507.pdf" },
    ],
    seededItems: [
      "35 orders in all statuses (P26 expansion: +25 new orders)",
      "DELIVERED ×17, SHIPPED ×5, PROCESSING ×3, PENDING ×2, RETURN_REQUESTED ×1, CANCELLED ×2, REFUNDED ×1",
      "Line items with product snapshots (title, image, price at order time)",
      "Multi-item orders (bundles), single-item orders",
      "All 8 stores represented, all 7 buyer cohorts",
    ],
    pendingItems: [
      "COD payment method orders",
      "Orders with coupon discounts applied",
    ],
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
    target: 20,
    description: "Active and abandoned carts — both guest (localStorage-style) and authenticated user carts in Firestore.",
    slugPattern: "auto-ID",
    seededItems: [
      "5 carts — 3 authenticated (userId), 2 guest (sessionId)",
      "1–4 items per cart with product snapshot",
      "Accurate subtotals in INR paise",
    ],
    pendingItems: [
      "15 more carts to reach target 20",
      "Abandoned cart recovery flag",
      "Coupon applied state in cart",
    ],
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
    target: 10,
    description: "One document per user holding the items[] array. Top-level collection; doc id === slug === wishlist-{userSlug}. Cap WISHLIST_MAX (20) enforced inside a Firestore transaction.",
    slugPattern: "wishlist-{userSlug}  (e.g. wishlist-user-mohsin-c — id === slug)",
    seededItems: [
      "One doc per buyer (≈10 docs); each items[] sized 1–15",
      "Mix of standard, auction, and pre-order products",
      "items ordered newest-first (addedAt desc)",
      "productSnapshot { title, thumb, currentPrice } per item",
    ],
    pendingItems: [
      "Public wishlist sharing (URL slug on wishlist)",
    ],
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
    target: 10,
    description: "One document per user holding viewed-product items[]. Top-level collection; doc id === slug === history-{userSlug}. Soft cap HISTORY_MAX (50) — silent FIFO trim. Re-visit dedups by productId and unshifts to position 0.",
    slugPattern: "history-{userSlug}  (e.g. history-user-mohsin-c — id === slug)",
    seededItems: [
      "One doc per buyer; each items[] sized 5–30 across mixed productTypes",
      "items ordered newest-first (viewedAt desc) — same product never duplicates",
      "productSnapshot { title, thumb, price, storeId, storeName } per item",
    ],
    pendingItems: [
      "AdminHistoryView read-only listing under System group",
    ],
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
    target: 20,
    description: "Global platform coupons + store-specific discount codes. Flat-amount and percentage types.",
    slugPattern: "coupon-*  (e.g. coupon-summer20)",
    seededItems: [
      "WELCOME10 — 10% off first order, max ₹200, new users only",
      "POKEMON25 — 25% off Pokémon category (min ₹1500)",
      "FREESHIP999 — Free shipping on orders ≥ ₹999",
      "BLADER20 — ₹200 flat off Beyblade products",
      "VIP2026 — 15% off everything, VIP users only",
    ],
    pendingItems: [
      "15 more coupons to reach target 20",
      "Store-specific coupons (SURGE15, SPEEDKING10, ANIMEVAULT20)",
      "Flash sale coupons with 24h expiry",
      "Referral reward coupons",
      "Used/expired coupons for moderation testing",
    ],
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
    target: 60,
    description: "Product reviews with star ratings, text, and optional media. Linked to product + buyer user.",
    slugPattern: "review-{productName}-{userFirstName}-{YYYYMMDD}  (e.g. review-charizard-psa10-ravi-20260507)",
    mediaFields: ["images[]  (optional)"],
    mediaSlugPatterns: [
      { type: "review-image", pattern: "review-{productId}-image-{n}.{ext}", example: "review-product-charizard-psa10-image-1.webp" },
      { type: "review-video", pattern: "review-{productId}-video-1.{ext}",   example: "review-product-charizard-psa10-video-1.mp4" },
    ],
    seededItems: [
      "60 reviews across 8 stores (P25 expansion: +25 new reviews)",
      "Rating breakdown: 5★ ×52, 4★ ×6, 3★ ×2",
      "Rich review text (2–5 sentences per review, realistic Indian collector voice)",
      "Verified purchase flag on all reviews",
      "Featured reviews highlighted per store",
      "createdAt spread over past 4 months",
    ],
    pendingItems: [
      "Review with images (seller response test)",
      "Seller responses on select reviews",
    ],
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
    target: 25,
    description: "Seller payout records — linked to stores, orders, and bank account details (masked).",
    slugPattern: "payout-{storeName}-{YYYYMMDD}-{random6}  (e.g. payout-pokemon-palace-20260507-ab12cd)",
    mediaSlugPatterns: [
      { type: "payout-doc", pattern: "payout-doc-{storeName}-{YYYYMMDD}.pdf", example: "payout-doc-pokemon-palace-20260507.pdf" },
    ],
    seededItems: [
      "7 payouts across 4 stores",
      "Statuses: PAID ×4, PENDING ×2, PROCESSING ×1",
      "Amount in INR paise after platform commission",
      "Masked bank account details (PII-safe)",
    ],
    pendingItems: [
      "18 more payout records to reach target 25",
      "FAILED payout for error-handling tests",
      "Bulk payout batch records",
    ],
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
    target: 20,
    description: "Editorial blog content covering hobby guides, product reviews, event coverage, and market news.",
    slugPattern: "blog-{title}-{category}  (e.g. blog-how-to-grade-pokemon-cards-guides)",
    mediaFields: ["coverImage", "youtubeId"],
    mediaSlugPatterns: [
      { type: "blog-cover",            pattern: "blog-{title}-{category}-image-{n}.{ext}", example: "blog-how-to-grade-pokemon-cards-guides-image-1.webp" },
      { type: "blog-content-image",    pattern: "blog-{title}-{category}-image-{n}.{ext}", example: "blog-how-to-grade-pokemon-cards-guides-image-2.webp" },
      { type: "blog-additional-image", pattern: "blog-{title}-{category}-image-{n}.{ext}", example: "blog-how-to-grade-pokemon-cards-guides-image-3.webp" },
      { type: "rich-text-image",       pattern: "rich-text-{entity}-{name}-image-{n}.{ext}", example: "rich-text-blog-how-to-grade-cards-image-1.webp" },
    ],
    seededItems: [
      "8 posts: How to Grade Pokémon Cards, Hot Wheels Treasure Hunt Guide, Beyblade Burst Meta Analysis, Top 10 Anime Figures 2025, Retro Gaming Hidden Gems, Cosplay Accessory Guide, Pokémon TCG Scarlet & Violet Set Review, Selling on LetItRip Guide",
      "Rich HTML content (600–1200 words) with h2/h3 headings",
      "SEO: title, metaDescription, og:image per post",
      "Tags, category, author, readTime, publishedAt",
    ],
    pendingItems: [
      "12 more posts to reach target 20",
      "Video embed posts (YouTube unboxing coverage)",
      "Guest author posts",
    ],
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
    target: 15,
    description: "Collectibles events: tournaments, toy fairs, trade meets, cosplay conventions.",
    slugPattern: "event-{title}  (e.g. event-pokemon-regional-tournament-mumbai)",
    mediaFields: ["bannerImage"],
    mediaSlugPatterns: [
      { type: "event-cover",            pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-1.webp" },
      { type: "event-image",            pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-2.webp" },
      { type: "event-winner-image",     pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-3.webp" },
      { type: "event-additional-image", pattern: "event-{title}-image-{n}.{ext}", example: "event-pokemon-regional-tournament-mumbai-image-4.webp" },
    ],
    seededItems: [
      "8 events: Pokémon Regional Tournament Mumbai, Hot Wheels Collector Fair Delhi, Anime Expo Bangalore, Beyblade Burst Open Chennai, TCG Trade Meet Hyderabad, Cosplay Championship Pune, Retro Gaming Fest, LetItRip Summer Sale Event",
      "Event types: TOURNAMENT, CONVENTION, MEETUP, SALE",
      "Location + date + registration link + banner image",
      "Capacity and current registration count",
    ],
    pendingItems: [
      "7 more events to reach target 15",
      "Online-only event type",
      "Recurring event series",
    ],
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
    ],
  },
  eventEntries: {
    label: "Event Registrations",
    icon: "🎫",
    group: "content",
    target: 25,
    description: "User registrations for events. Linked to event + user with registration timestamp.",
    slugPattern: "auto-ID",
    seededItems: [
      "2 event registrations (buyer accounts)",
    ],
    pendingItems: [
      "23 more registrations to reach target 25",
      "Waitlist status entries",
      "Team registrations (tournament format)",
    ],
    uiPath: "/admin/events",
    fields: [
      { name: "eventId",         type: "ref",       filterable: true, indexed: true },
      { name: "userId",          type: "ref",       filterable: true, indexed: true },
      { name: "userDisplayName", type: "string",    searchable: true },
      { name: "userEmail",       type: "string",    filterable: true, pii: true },
      { name: "status",          type: "enum",      filterable: true, indexed: true },
      { name: "createdAt",       type: "timestamp", sortable: true, indexed: true },
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
    target: 10,
    description: "Homepage hero carousel slides — full-width banners driving traffic to featured products, events, and sales.",
    slugPattern: "slide-{title}-{timestamp}  (e.g. slide-summer-sale-hero-1746614400000)",
    mediaFields: ["background.url", "background.mobileUrl"],
    mediaSlugPatterns: [
      { type: "carousel-image", pattern: "carousel-{title}-image.{ext}", example: "carousel-summer-sale-hero-image.webp" },
    ],
    seededItems: [
      "6 slides (5 active respecting MAX_ACTIVE_SLIDES limit)",
      "Slide types: image background + gradient overlay",
      "CTA buttons (primary + secondary) per slide",
      "Zone config (text alignment, overlay opacity)",
      "sortOrder + autoplay settings",
    ],
    pendingItems: [
      "4 more slides to reach target 10",
      "Video-background slides",
      "Per-slide mobile crop settings",
      "Real product hero images (not placeholder)",
    ],
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
    target: 25,
    description: "All homepage layout sections: featured products, trending, flash sale, brand rows, ads, FAQs preview, social feed.",
    slugPattern: "section-*  (e.g. section-featured-products)",
    mediaFields: ["config.imageUrl  (ad-banner / custom-cards types)"],
    seededItems: [
      "19 enabled sections covering: hero, featured-products, trending, new-arrivals, flash-sale, brand-list, category-grid, ad-banner, faq-preview, blog-preview, events-preview, social-feed",
      "3 disabled placeholder sections (S7): featured-bundles, prize-draws, event-raffles — enabled flag flips to true when upstream collections/fields ship",
      "1 disabled placeholder section: collection-cards (mixed-resource strip)",
      "sortOrder on all sections, isVisible + maxItems per section",
    ],
    pendingItems: [
      "Wire data fetching for SB11 sections when bundles collection + listingType='prize-draw' + events.hasRaffle land",
      "Wire per-collection data fetch for EX5 collection-cards section",
    ],
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
    target: 55,
    description: "FAQ entries across Help Centre categories. Homepage-eligible FAQs shown in the FAQ section.",
    slugPattern: "faq-*  (e.g. faq-how-does-bidding-work)",
    seededItems: [
      "59 FAQs across 7 categories: general, orders_payment, shipping_delivery, returns_refunds, product_information, account_security, technical_support",
      "Homepage-eligible FAQs marked showOnHomepage=true (8 entries)",
      "Footer-eligible FAQs marked showInFooter=true (5 entries)",
      "Rich HTML answers (200–800 words each) with cross-FAQ links",
      "SB5-B (S7-prep): 6 bundles + prize-draw entries (faq-what-is-bundle, faq-how-create-bundle, faq-what-is-prize-draw, faq-prize-draw-fairness, faq-prize-draw-refund, faq-prize-draw-reveal)",
    ],
    pendingItems: [
      "Optional: dedicated 'listings' category (currently bucketed under product_information)",
      "Optional: Tier DX migration — answers reference docs.letitrip.in once that surface ships",
    ],
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
    target: 40,
    description: "In-app notifications covering all 10 notification types. Mix of read and unread.",
    slugPattern: "notif-*",
    seededItems: [
      "10 notifications across all types: order-shipped, auction-outbid, auction-won, preorder-update, review-reply, coupon-expiring, payout-sent, new-follower, system-alert, wishlist-sale",
      "Mix of isRead: true/false for notification badge testing",
      "Linked entityId + entityType for deep-linking",
    ],
    pendingItems: [
      "30 more to reach target 40",
      "Bulk system announcements",
      "Push notification delivery status",
    ],
    uiPath: "/user/notifications",
    fields: [
      { name: "userId",     type: "ref",       filterable: true, indexed: true },
      { name: "type",       type: "enum",      filterable: true, indexed: true },
      { name: "title",      type: "string",    searchable: true },
      { name: "body",       type: "string",    searchable: true },
      { name: "isRead",     type: "boolean",   filterable: true, indexed: true },
      { name: "entityId",   type: "ref",       filterable: true, note: "deep-link target ID" },
      { name: "entityType", type: "enum",      filterable: true },
      { name: "createdAt",  type: "timestamp", sortable: true, indexed: true },
    ],
  },
  sessions: {
    label: "Sessions",
    icon: "🔐",
    group: "system",
    target: 20,
    description: "Active user sessions for auth testing. Device info, IP (masked), last active timestamp.",
    slugPattern: "auto-ID",
    seededItems: [
      "19 session records across all user accounts",
      "Mix of mobile / desktop / tablet userAgent",
      "isActive, expiresAt, lastActiveAt per session",
    ],
    pendingItems: [
      "1 more to reach target 20",
    ],
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
    description: "Single global settings document with 12 setting groups controlling the entire platform.",
    slugPattern: "site_settings/global  (singleton)",
    mediaFields: ["branding.logo", "branding.favicon", "seoDefaults.ogImage"],
    seededItems: [
      "1 doc at site_settings/global",
      "12 groups: Branding, Appearance, Announcement Banner, SEO Defaults, Contact + Social, Watermark, Fees + Commissions, Integrations + API Keys, Shipping Defaults, Auction Config, Platform Limits, Legal Pages",
      "Feature flags: enableAuctions, enablePreOrders, enableCOD, enableSocialFeed",
      "Razorpay + Shiprocket integration keys (test mode)",
    ],
    pendingItems: [],
    uiPath: "/admin/site",
    fields: [
      { name: "branding",       type: "map", note: "name, logo, favicon, colors" },
      { name: "appearance",     type: "map", note: "theme, font, dark mode default" },
      { name: "announcementBanner", type: "map", note: "enabled, text, link, color" },
      { name: "seoDefaults",    type: "map", note: "title, description, og:image" },
      { name: "contactSocial",  type: "map", note: "email, phone, social handles" },
      { name: "watermark",      type: "map", note: "type (text|image), text, imageUrl, size %, opacity %" },
      { name: "fees",           type: "map", note: "platformFeeRate, gstRate" },
      { name: "integrations",   type: "map", note: "Razorpay, Shiprocket keys (test)" },
      { name: "shipping",       type: "map", note: "defaultCarrier, freeShippingThreshold" },
      { name: "auctionConfig",  type: "map", note: "extensionMinutes, minBidIncrement" },
      { name: "platformLimits", type: "map", note: "maxImagesPerProduct, maxActiveSlides" },
      { name: "legalPages",     type: "map", note: "ToS, privacy, refund policy URLs" },
    ],
  },
  conversations: {
    label: "Conversations",
    icon: "💬",
    group: "transactional",
    target: 20,
    description: "Buyer–seller message threads. Messages embedded as an array per doc (up to ~200 entries). RTDB ping paths `chats/{id}/lastUpdate` + `chats/user/{uid}/lastUpdate` drive live refetch on send/mark-read.",
    slugPattern: "conv-{product-slug}-{buyer}-{seller}-NNN",
    seededItems: [
      "8 buyer↔seller threads — pre-purchase QA, shipping delays, returns, offers, bulk orders",
      "Mixed read/unread states + unreadBuyer / unreadSeller counters",
      "Indexed (buyerId, lastMessageAt desc) + (storeId, lastMessageAt desc)",
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
    target: 20,
    description: "Bundle listings that group multiple products (e.g. a full booster box set).",
    slugPattern: "grouped-*",
    seededItems: ["Demo grouped listings"],
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
    target: 10,
    description: "SEO-first scam registry. Phones, UPI IDs, and emails stored as plaintext so Google indexes them — victims searching a number find the profile. All submissions start as pending_review. Three subcollections per profile: incidents (victim reports), comments (public discussion), contests (disputes).",
    slugPattern: "scammer-{identifier}  (e.g. scammer-9876543210-at-paytm)",
    seededItems: [
      "scammer-rahul-advance-payment — verified, advance_payment_ghost, ₹1,000 lost",
      "scammer-fake-pokemon-seller-upi — pending_review, fake_preorder_listing, ₹2,200 lost",
      "scammer-mistaken-identity-case — rejected, delivery dispute, OLX",
    ],
    pendingItems: [
      "Subcollection seed: incidents, comments, contests per profile (SCAM9)",
      "More verified profiles across scam types",
    ],
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
    target: 10,
    description: "User support tickets across all 8 categories (order_issue, billing_payment, account, listing_dispute, scam_report, refund_request, auction_dispute, general). Covers all 5 statuses. Enforces per-user active ticket limits (max 2 general + max 1 per eligible order). BAN9 Functions: onSupportTicketCreate notifies reporter + employees; onSupportTicketUpdate notifies on status change.",
    slugPattern: "ticket-{userId}-{category}-{seq}  (e.g. ticket-rahul-order-001)",
    seededItems: [
      "ticket-rahul-order-001 — order_issue, in_progress, high, assigned to Simran Kaur",
      "ticket-priya-refund-001 — refund_request, open, normal",
      "ticket-arjun-account-001 — account, waiting_on_user, normal",
      "ticket-meera-dispute-001 — listing_dispute, resolved, normal",
      "ticket-rahul-auction-001 — auction_dispute, closed, low",
      "ticket-kavya-general-001 — general, open, low",
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
};

// ─── Group labels ─────────────────────────────────────────────────────────────

const GROUP_CONFIG: Record<GroupKey, { label: string; icon: string }> = {
  core: { label: "Core Foundation", icon: "🗂️" },
  listings: { label: "Listings & Bids", icon: "📦" },
  transactional: { label: "Transactional", icon: "🛒" },
  content: { label: "Content & Marketing", icon: "📣" },
  system: { label: "System & Config", icon: "⚙️" },
  moderation: { label: "Trust & Safety", icon: "🚨" },
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
    <div>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider m-0">
          📐 Schema Fields <span className="text-zinc-400 dark:text-slate-500 font-normal normal-case tracking-normal">({fields.length} fields)</span>
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="filter fields…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-32"
          />
          <button
            onClick={() => setShowPiiOnly((v) => !v)}
            className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-colors ${
              showPiiOnly
                ? "bg-red-500 text-white border-red-500"
                : "border-zinc-300 dark:border-slate-600 text-zinc-500 dark:text-slate-400 hover:border-red-400 hover:text-red-500"
            }`}
          >
            🔒 PII only
          </button>
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
    </div>
  );
}

// ─── Resource Accordion Card ──────────────────────────────────────────────────

function ResourceAccordionCard({
  col,
  meta,
  selected,
  onToggle,
  dbStatus,
  runState,
  runError,
  isRunning,
  isLoadingStatus,
  onRefreshOne,
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
    // Refresh this card's count when expanding so it always shows live DB state
    if (next) onRefreshOne();
  }

  const seedCount = dbStatus?.seedCount ?? 0;
  const existingCount = dbStatus?.existingCount ?? 0;
  const target = meta.target;
  const pct = target > 0 ? Math.min(100, Math.round((existingCount / target) * 100)) : 0;

  const isComplete = existingCount >= seedCount && seedCount > 0;
  const isEmpty = existingCount === 0;
  const isPartial = !isComplete && !isEmpty;

  const statusVariant = runState === "done"
    ? "success"
    : runState === "error"
    ? "danger"
    : isComplete
    ? "success"
    : isPartial
    ? "warning"
    : "default";

  const statusLabel = runState === "running"
    ? "seeding…"
    : runState === "done"
    ? "done"
    : runState === "error"
    ? "error"
    : isComplete
    ? "seeded"
    : isPartial
    ? `${pct}%`
    : "empty";

  const borderColor =
    runState === "running"
      ? "border-amber-400 dark:border-amber-500"
      : runState === "done"
      ? "border-emerald-400 dark:border-emerald-600"
      : runState === "error"
      ? "border-red-400 dark:border-red-600"
      : runState === "queued"
      ? "border-zinc-300 dark:border-slate-600"
      : expanded
      ? "border-zinc-300 dark:border-slate-600"
      : "border-zinc-200 dark:border-slate-800";

  const bgColor =
    runState === "running"
      ? "bg-amber-50 dark:bg-amber-900/10"
      : runState === "done"
      ? "bg-emerald-50 dark:bg-emerald-900/10"
      : runState === "error"
      ? "bg-red-50 dark:bg-red-900/10"
      : "";

  return (
    <Div className={`rounded-xl border transition-colors ${borderColor} ${bgColor} overflow-hidden`}>
      {/* ── Collapsed header ── */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-lg leading-none shrink-0">{meta.icon}</span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-white flex-1">
          {meta.label}
        </span>
        <StatusDot state={runState} />
        {/* Counts */}
        <Div className="flex items-center gap-2 shrink-0">
          {isLoadingStatus ? (
            <span className="text-xs text-zinc-400 dark:text-slate-500">…</span>
          ) : dbStatus ? (
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold ${
                isComplete
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40"
                  : isEmpty
                  ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                  : "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40"
              }`}
            >
              {existingCount}/{seedCount}
            </span>
          ) : null}
          <Badge variant={statusVariant as "success" | "warning" | "danger" | "default"}>
            {statusLabel}
          </Badge>
          <span className="text-zinc-400 dark:text-slate-500 text-xs w-4 text-center select-none">
            {expanded ? "▲" : "▼"}
          </span>
        </Div>
        {/* Checkbox outside accordion, on the far right */}
        <Div
          className="shrink-0 ml-1"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          <Checkbox
            id={`col-${col}`}
            checked={selected}
            onChange={onToggle}
            disabled={isRunning}
            label=""
          />
        </Div>
      </button>

      {/* Inline seed progress bar */}
      {dbStatus && seedCount > 0 && (
        <div className="px-4 pb-2">
          <SeedProgressBar seeded={existingCount} target={seedCount} size="sm" />
        </div>
      )}

      {/* Error message */}
      {runError && (
        <div className="px-4 pb-2">
          <span className="text-xs text-red-600 dark:text-red-400" title={runError}>
            ✗ {runError}
          </span>
        </div>
      )}

      {/* ── Expanded body ── */}
      {expanded && (
        <Div className="border-t border-zinc-200 dark:border-slate-700 px-5 py-4 bg-white dark:bg-slate-900/60">
          <Stack gap="md">
            {/* Description */}
            <p className="text-sm text-zinc-600 dark:text-slate-300 leading-relaxed m-0">
              {meta.description}
            </p>

            {/* Slug pattern + media fields */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-700 dark:text-indigo-300 font-mono">
                🔑 {meta.slugPattern}
              </span>
              {meta.mediaFields?.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 text-xs text-violet-700 dark:text-violet-300 font-mono">
                  🖼️ {f}
                </span>
              ))}
            </div>

            {/* Media slug patterns table */}
            {meta.mediaSlugPatterns && meta.mediaSlugPatterns.length > 0 && (
              <Div>
                <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2 m-0">
                  🖼️ Media Slug Patterns (SEO filenames)
                </p>
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

            {/* Target progress */}
            <Div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-slate-200">
                  Target: {target} docs
                </span>
                <span className="text-xs font-mono text-zinc-500 dark:text-slate-400">
                  DB: {existingCount} · Seed file: {seedCount}
                </span>
              </div>
              <SeedProgressBar seeded={existingCount} target={target} />
            </Div>

            {/* What's seeded */}
            <Div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 m-0">
                ✓ What&apos;s Seeded
              </p>
              <div className="flex flex-col gap-1.5">
                {meta.seededItems.map((item, i) => (
                  <p key={i} className="text-sm text-zinc-700 dark:text-slate-300 leading-snug pl-3 border-l-2 border-emerald-400 dark:border-emerald-700 m-0">
                    {item}
                  </p>
                ))}
              </div>
            </Div>

            {/* Pending items */}
            {meta.pendingItems.length > 0 && (
              <Div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 m-0">
                  ⏳ Pending / Needed
                </p>
                <div className="flex flex-col gap-1.5">
                  {meta.pendingItems.map((item, i) => (
                    <p key={i} className="text-sm text-zinc-600 dark:text-slate-400 leading-snug pl-3 border-l-2 border-amber-400 dark:border-amber-700 m-0">
                      {item}
                    </p>
                  ))}
                </div>
              </Div>
            )}

            {/* Schema fields table */}
            <SchemaFieldsTable fields={meta.fields} />

            {/* PII note */}
            {meta.piiFields && meta.piiFields.length > 0 && (
              <Div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
                <span className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                  🔒 PII fields: <strong>{meta.piiFields.join(", ")}</strong> — masked in DB with Firestore encryption. Never returned in full to client.
                </span>
              </Div>
            )}

            {/* View in app link */}
            <div>
              <a
                href={meta.uiPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline font-medium"
              >
                → View in app: {meta.uiPath}
              </a>
            </div>
          </Stack>
        </Div>
      )}
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
      <button
        type="button"
        onClick={() => onSelectAll(!allSelected)}
        disabled={isRunning}
        className="text-xs text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 shrink-0 disabled:opacity-40 transition-colors"
      >
        {allSelected ? "deselect group" : "select group"}
      </button>
    </div>
  );
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
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line) as {
                type: string; collection?: string; status?: string;
                error?: string; done?: number;
              };
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
            } catch { /* malformed line */ }
          }
        }
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

      {/* ── Sticky control toolbar ── */}
      <div
        className="sticky z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-slate-800 shadow-sm"
        style={{ top: "var(--header-height, 0px)" }}
      >
        <Container size="2xl">
          <div className="py-2.5 flex flex-col gap-2">

            {/* Row 1: title + selection count + quick-select + refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white m-0 leading-none">
                  📋 Resource Collections
                  <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-slate-400">
                    {selectedCollections.size} / {ALL_COLLECTIONS.length} selected
                    {isFiltered && (
                      <span className="ml-1 text-amber-600 dark:text-amber-400">
                        · {filteredCollections.length} match
                      </span>
                    )}
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setSelectedCollections(new Set(ALL_COLLECTIONS))} disabled={isRunning}>Select All</Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedCollections(new Set(DEFAULT_SELECTED))} disabled={isRunning}>Default</Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedCollections(new Set())} disabled={isRunning}>Clear</Button>
                <Button size="sm" variant="outline" onClick={fetchStatus} disabled={isRunning || isLoadingStatus}>
                  {isLoadingStatus ? "…" : "↻ Refresh"}
                </Button>
              </div>
            </div>

            {/* Row 2: search + sort | dry-run checkbox + action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-500 text-sm pointer-events-none">🔍</span>
                <input
                  type="text"
                  placeholder="Search collections…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-xs">✕</button>
                )}
              </div>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="text-sm rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 shrink-0"
              >
                <option value="default">Sort: Default</option>
                <option value="name-asc">Name A → Z</option>
                <option value="name-desc">Name Z → A</option>
                <option value="target-desc">Target ↑ highest</option>
                <option value="target-asc">Target ↓ lowest</option>
                <option value="db-desc">DB count ↑ most</option>
                <option value="db-asc">DB count ↓ fewest</option>
              </select>
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-slate-700 shrink-0" />
              {/* Dry-run toggle + seed buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    disabled={isRunning}
                    className="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-600 dark:text-slate-300 whitespace-nowrap">Dry run</span>
                </label>
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isRunning}
                  onClick={() => run("load")}
                  disabled={isRunning || selectedCollections.size === 0}
                >
                  {dryRun ? "⚡ Dry Add" : "⚡ Add Seed"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => run("delete")}
                  disabled={isRunning || selectedCollections.size === 0}
                >
                  {dryRun ? "🗑️ Dry Remove" : "🗑️ Remove"}
                </Button>
              </div>
            </div>

            {/* Row 3: group chips | status chips | clear */}
            <div className="flex flex-col sm:flex-row gap-1.5 sm:items-center sm:gap-3">
              {/* Group filter */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium shrink-0">Group:</span>
                {(["all", "core", "listings", "transactional", "content", "system", "moderation"] as const).map((g) => {
                  const active = filterGroup === g;
                  const cfg = g === "all" ? { label: "All", icon: "☰" } : { label: GROUP_CONFIG[g].label, icon: GROUP_CONFIG[g].icon };
                  return (
                    <button
                      key={g}
                      onClick={() => setFilterGroup(g)}
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                        active
                          ? "bg-amber-500 text-white"
                          : "bg-zinc-200 dark:bg-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      <span>{cfg.icon}</span>
                      <span className="hidden sm:inline ml-0.5">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-slate-700 shrink-0" />
              {/* Status filter */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-zinc-500 dark:text-slate-400 font-medium shrink-0">Status:</span>
                {([
                  { key: "all",     label: "All",        activeClass: "bg-amber-500 text-white" },
                  { key: "seeded",  label: "✓ Seeded",   activeClass: "bg-emerald-500 text-white" },
                  { key: "partial", label: "⏳ Partial",  activeClass: "bg-amber-500 text-white" },
                  { key: "empty",   label: "✗ Empty",    activeClass: "bg-red-500 text-white" },
                ] as const).map(({ key, label, activeClass }) => (
                  <button
                    key={key}
                    onClick={() => setFilterStatus(key as StatusFilter)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      filterStatus === key
                        ? activeClass
                        : "bg-zinc-200 dark:bg-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {isFiltered && (
                  <button
                    onClick={() => { setSearchQuery(""); setFilterGroup("all"); setFilterStatus("all"); setSortBy("default"); }}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline ml-1 shrink-0"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

          </div>
        </Container>
      </div>

      {/* ── Scrollable content ── */}
      <Container size="2xl">
        <Stack gap="lg" className="py-8">

          {/* Hero header */}
          <div className="flex flex-col items-center text-center gap-3 pt-2">
            <span className="text-5xl leading-none">🎮</span>
            <h1 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 m-0">
              LetItRip Demo Seed
            </h1>
            <p className="text-base text-zinc-600 dark:text-slate-300 max-w-xl m-0">
              Admin seed tool — expand each resource card to see what&apos;s seeded, pending counts, live DB state, and the UI path to verify.
            </p>
          </div>

          {/* DB overview stats — always visible */}
          <Div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Div className="rounded-xl p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono leading-none">
                {isLoadingStatus ? <span className="text-zinc-300 dark:text-slate-600">—</span> : totalExistingDocs.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500 dark:text-slate-400">docs in DB</span>
            </Div>
            <Div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 text-center flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono leading-none">
                {isLoadingStatus ? <span className="text-amber-200 dark:text-amber-900">—</span> : totalSeedDocs.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500 dark:text-slate-400">docs in seed files</span>
            </Div>
            <Div className="rounded-xl p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center flex flex-col gap-1">
              <span className="text-2xl font-extrabold text-zinc-500 dark:text-slate-300 font-mono leading-none">
                {totalTargetDocs.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500 dark:text-slate-400">total target docs</span>
            </Div>
          </Div>

          {/* Progress bar — visible while running */}
          {isRunning && (
            <Div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-700">
              <Text className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                {dryRun ? "Dry-running" : "Seeding"} collections…
              </Text>
              <ProgressBar value={completedCount} total={totalQueued} />
            </Div>
          )}

          {/* Done summary */}
          {!isRunning && totalQueued > 0 && (
            <Div
              className={`rounded-xl p-4 border ${
                errorCount > 0
                  ? "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700"
                  : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  errorCount > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {errorCount > 0
                  ? `✗ Completed with ${errorCount} error${errorCount > 1 ? "s" : ""} — ${completedCount - errorCount} succeeded`
                  : `✓ ${dryRun ? "Dry run" : "Seed"} complete — all ${completedCount} collections processed`}
              </Text>
              {errorCount > 0 && (
                <Stack gap="xs" className="mt-2">
                  {Object.entries(colErrors).map(([col, msg]) => (
                    <Text key={col} className="text-xs text-red-600 dark:text-red-400">
                      <strong>{COLLECTION_META[col as SeedCollectionName]?.label ?? col}:</strong> {msg}
                    </Text>
                  ))}
                </Stack>
              )}
            </Div>
          )}

          {/* Collection list — grouped or flat */}
          {filteredCollections.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500 dark:text-slate-400">
              No collections match your filters.
            </div>
          ) : isFiltered ? (
            <div className="flex flex-col gap-1.5">
              {paginatedCollections.map((col) => (
                <ResourceAccordionCard
                  key={col}
                  col={col}
                  meta={COLLECTION_META[col]}
                  selected={selectedCollections.has(col)}
                  onToggle={() => toggleCollection(col)}
                  dbStatus={getColStatus(col)}
                  runState={colRunStates[col] ?? "idle"}
                  runError={colErrors[col]}
                  isRunning={isRunning}
                  isLoadingStatus={isLoadingStatus}
                  onRefreshOne={fetchStatus}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {groups.map(({ key, cols }) => {
                const allGroupSelected = cols.every((c) => selectedCollections.has(c));
                return (
                  <div key={key}>
                    <GroupDivider
                      groupKey={key}
                      allSelected={allGroupSelected}
                      onSelectAll={(select) => toggleGroup(cols, select)}
                      isRunning={isRunning}
                    />
                    <div className="flex flex-col gap-1.5 mt-2">
                      {cols.map((col) => (
                        <ResourceAccordionCard
                          key={col}
                          col={col}
                          meta={COLLECTION_META[col]}
                          selected={selectedCollections.has(col)}
                          onToggle={() => toggleCollection(col)}
                          dbStatus={getColStatus(col)}
                          runState={colRunStates[col] ?? "idle"}
                          runError={colErrors[col]}
                          isRunning={isRunning}
                          isLoadingStatus={isLoadingStatus}
                          onRefreshOne={fetchStatus}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {isFiltered && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-slate-700">
              <span className="text-xs text-zinc-500 dark:text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCollections.length)} of {filteredCollections.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded-lg text-sm font-medium border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      n === page
                        ? "bg-amber-500 text-white font-bold"
                        : "border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded-lg text-sm font-medium border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}

          {/* Seed scale summary */}
          <Div className="rounded-2xl p-5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
            <h3 className="text-base font-bold text-amber-600 dark:text-amber-400 m-0 mb-4">
              📊 Target Seed Scale
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0">
              {[
                ["Standard Products", "100+"],
                ["Auction Listings", "20"],
                ["Pre-orders", "10"],
                ["Categories (3-tier)", "55+"],
                ["Users (all roles)", "15+"],
                ["Stores", "8"],
                ["Brands", "25+"],
                ["Reviews", "60+"],
                ["Orders (all statuses)", "35+"],
                ["Bids (auction history)", "120+"],
                ["FAQs (all categories)", "55+"],
                ["Blog Posts", "20+"],
                ["Events", "15+"],
                ["Coupons (global + store)", "20+"],
                ["Notifications (all types)", "40+"],
                ["Wishlists", "40+"],
              ].map(([label, count]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-white/5 last:border-0">
                  <span className="text-sm text-zinc-700 dark:text-slate-300">{label}</span>
                  <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </Div>

        </Stack>
      </Container>
    </Section>
  );
}
