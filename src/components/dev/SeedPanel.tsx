"use client";

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

const CORE_COLLECTIONS: SeedCollectionName[] = [
  "users", "addresses", "stores", "storeAddresses", "brands", "categories",
];

const LISTINGS_COLLECTIONS: SeedCollectionName[] = [
  "products", "bids",
];

const TRANSACTIONAL_COLLECTIONS: SeedCollectionName[] = [
  "orders", "carts", "wishlists", "coupons", "reviews", "payouts",
];

const CONTENT_COLLECTIONS: SeedCollectionName[] = [
  "blogPosts", "events", "eventEntries", "carouselSlides", "homepageSections", "faqs",
];

const SYSTEM_COLLECTIONS: SeedCollectionName[] = [
  "notifications", "sessions", "siteSettings",
];

const MODERATION_COLLECTIONS: SeedCollectionName[] = [
  "scammerProfiles",
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
    target: 15,
    description: "All platform accounts: 1 admin, 4–6 sellers, 8+ buyers. Auth records + Firestore profile docs with hashed passwords and role custom claims.",
    slugPattern: "user-{firstName}-{lastName}-{emailPrefix}  (e.g. user-ravi-sharma-ravikar)",
    mediaFields: ["photoURL"],
    mediaSlugPatterns: [
      { type: "user-avatar", pattern: "user-{firstName}-{lastName}-avatar.{ext}", example: "user-ravi-sharma-avatar.webp" },
    ],
    seededItems: [
      "1 admin — admin@letitrip.in / Admin@123",
      "4 sellers — ravi (Pokémon), priya (Hot Wheels), arjun (Beyblade), meera (Anime)",
      "4 buyers — buyer1–4 with realistic Indian names, phone numbers, addresses",
      "Password hash, displayName, photoURL, role claims per user",
    ],
    pendingItems: [
      "4 more buyers to reach target 15",
      "2 store-owner seller accounts for Retro Vault + Cosplay Hub",
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
  addresses: {
    label: "Delivery Addresses",
    icon: "📍",
    group: "core",
    target: 25,
    description: "Buyer delivery addresses — Indian format with pincode, state, city. Each buyer has 2–3 saved addresses with one marked default.",
    slugPattern: "auto-ID  (sub-collection under users/{userId}/addresses)",
    seededItems: [
      "11 addresses linked to buyer accounts",
      "Mix of Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune locations",
      "Correct pincode + landmark format for Indian addresses",
      "One default address per user",
    ],
    pendingItems: [
      "14 more addresses to reach target 25",
      "Kolkata, Ahmedabad, Jaipur coverage",
      "Corporate / office address type",
    ],
    uiPath: "/user/addresses",
    piiFields: ["fullName", "phone", "addressLine1"],
    fields: [
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
      { name: "createdAt",        type: "timestamp", sortable: true },
    ],
  },
  storeAddresses: {
    label: "Store / Pickup Addresses",
    icon: "🏬",
    group: "core",
    target: 15,
    description: "Physical pickup / warehouse addresses for stores. Used in orders and listing pickups.",
    slugPattern: "auto-ID",
    seededItems: [
      "8 store addresses — one primary per store",
      "Pickup instructions and operating hours per address",
      "storeId cross-reference on every record",
    ],
    pendingItems: [
      "7 more for secondary warehouses",
      "Pickup availability schedule fields",
    ],
    uiPath: "/admin/stores",
    fields: [
      { name: "label",        type: "string",    searchable: true },
      { name: "fullName",     type: "string",    pii: true },
      { name: "phone",        type: "string",    pii: true },
      { name: "addressLine1", type: "string",    pii: true },
      { name: "city",         type: "string",    filterable: true },
      { name: "state",        type: "string",    filterable: true },
      { name: "postalCode",   type: "string",    filterable: true },
      { name: "isDefault",    type: "boolean",   filterable: true, indexed: true },
      { name: "createdAt",    type: "timestamp", sortable: true, indexed: true },
    ],
  },
  brands: {
    label: "Brands",
    icon: "🏷️",
    group: "core",
    target: 25,
    description: "Official collectibles brands with logo, country of origin, and category associations.",
    slugPattern: "brand-*  (e.g. brand-hot-wheels)",
    mediaFields: ["logoURL", "bannerURL"],
    seededItems: [
      "Pokémon Company — TCG, video games",
      "Bandai — Beyblade, anime figures, Gunpla",
      "Hasbro — Transformers, G.I. Joe",
      "Takara-Tomy — Beyblade Metal, diecast Tomica",
      "Mattel — Hot Wheels, Barbie, Fisher-Price",
      "Konami — Yu-Gi-Oh! TCG",
      "Funko — Pop! figures",
      "NECA — Collectible statues and action figures",
      "McFarlane Toys — Spawn, DC, sports figures",
      "Good Smile Company — Nendoroids, figma",
      "Hot Wheels — Diecast cars (Mattel sub-brand)",
      "Tomica — Japanese diecast (Takara-Tomy)",
      "MadBox / Kotobukiya — Model kits",
    ],
    pendingItems: [
      "12 more brands: Kotobukiya, Alter, Max Factory, Medicom, Sideshow, Diamond Select, JAKKS, Spin Master, Cardfight Vanguard, Dragon Ball Super Card Game, Bushiroad, Panini",
    ],
    uiPath: "/admin/brands",
    fields: [
      { name: "name",         type: "string",    searchable: true, sortable: true },
      { name: "slug",         type: "string",    filterable: true, indexed: true },
      { name: "description",  type: "string",    searchable: true },
      { name: "country",      type: "string",    filterable: true, sortable: true },
      { name: "founded",      type: "number",    sortable: true },
      { name: "isActive",     type: "boolean",   filterable: true, indexed: true },
      { name: "displayOrder", type: "number",    sortable: true },
      { name: "productCount", type: "number",    sortable: true },
      { name: "createdAt",    type: "timestamp", sortable: true },
    ],
  },
  categories: {
    label: "Categories",
    icon: "🗂️",
    group: "core",
    target: 55,
    description: "3-tier nested category tree: root → subcategory → leaf. Covers all collectibles verticals on the platform.",
    slugPattern: "category-{name}  (e.g. category-action-figures)",
    mediaFields: ["display.coverImage", "display.icon"],
    mediaSlugPatterns: [
      { type: "category-image", pattern: "category-{name}-image.{ext}", example: "category-pokemon-cards-image.webp" },
    ],
    seededItems: [
      "6 root categories: Trading Cards, Diecast Vehicles, Anime & Manga Figures, Spinning Tops, Action Figures & Statues, Retro Gaming",
      "17 tier-2 subcategories (e.g. Pokémon TCG, Yu-Gi-Oh!, Hot Wheels, Beyblades Burst, Nendoroids)",
      "Correct parentId cross-references on all child categories",
      "sortOrder, icon, isActive, seoDescription per category",
    ],
    pendingItems: [
      "32 more leaf categories to reach 55 target",
      "Board Games & Card Games root",
      "Cosplay Accessories root",
      "Vintage & Rare tier",
      "Model Kits tier (Gunpla, Kotobukiya)",
      "Comics & Manga (physical)",
    ],
    uiPath: "/categories",
    fields: [
      { name: "name",          type: "string",    searchable: true, sortable: true },
      { name: "slug",          type: "string",    filterable: true, indexed: true },
      { name: "description",   type: "string",    searchable: true },
      { name: "tier",          type: "number",    filterable: true, sortable: true, indexed: true },
      { name: "rootId",        type: "ref",       filterable: true, indexed: true },
      { name: "parentIds",     type: "array",     filterable: true, indexed: true },
      { name: "isLeaf",        type: "boolean",   filterable: true, indexed: true },
      { name: "isFeatured",    type: "boolean",   filterable: true, indexed: true },
      { name: "isActive",      type: "boolean",   filterable: true, indexed: true },
      { name: "isSearchable",  type: "boolean",   filterable: true, indexed: true },
      { name: "order",         type: "number",    sortable: true },
      { name: "position",      type: "number",    sortable: true },
      { name: "metrics.totalItemCount", type: "number", sortable: true },
      { name: "createdAt",     type: "timestamp", sortable: true, indexed: true },
    ],
  },
  products: {
    label: "Products (Standard + Auctions + Pre-orders)",
    icon: "📦",
    group: "listings",
    target: 130,
    description: "All product types in one collection. Standard = buy now. Auction = bidding. Pre-order = deposit. 100+ standard, 20 auctions, 10 pre-orders.",
    slugPattern: "product-{name}-{category}-{condition}-{seller}-{n}  /  auction-…  /  preorder-…",
    mediaFields: ["images[]", "youtubeId"],
    mediaSlugPatterns: [
      { type: "product-image",    pattern: "product-{name}-{category}-{store}-image-{n}.{ext}",   example: "product-charizard-psa10-pokemon-cards-mistys-image-1.webp" },
      { type: "product-video",    pattern: "product-{name}-{category}-{store}-video-{n}.{ext}",   example: "product-charizard-psa10-pokemon-cards-mistys-video-1.mp4" },
      { type: "auction-image",    pattern: "auction-{name}-{category}-{store}-image-{n}.{ext}",   example: "auction-charizard-1st-ed-pokemon-mistys-image-1.webp" },
      { type: "preorder-image",   pattern: "preorder-{name}-{category}-{store}-image-{n}.{ext}",  example: "preorder-sv5-booster-box-pokemon-surge-image-1.webp" },
      { type: "rich-text-image",  pattern: "rich-text-{entity}-{name}-image-{n}.{ext}",           example: "rich-text-product-charizard-psa10-image-1.webp" },
    ],
    seededItems: [
      "20 standard products across 8 stores — Charizard PSA-10, Base Set Booster Box, Hot Wheels '69 Camaro, Beyblade B-190 Burst, Nendoroid Naruto…",
      "6 auctions — live + ended + upcoming, realistic bid histories",
      "5 pre-orders — active (deposits open), upcoming, soldOut",
      "4 products marked isFeatured=true, 4 marked isPromoted=true",
      "3–5 customFields per product (Grade, Edition, Condition, Year, Set name)",
      "1–2 customSections per product (Box Contents, Authenticity, Compatibility)",
      "3+ real product images per listing; 1 YouTube unboxing/review video ID",
    ],
    pendingItems: [
      "80 more standard products to reach 100 target (Hot Wheels: 25+, Pokémon: 20+, Beyblade: 15+, Anime figures: 15+, Retro gaming: 10+, Cosplay: 5+)",
      "14 more auctions (target 20) — mix of active, upcoming, ended",
      "5 more pre-orders (target 10) — DBZ, One Piece, Gunpla",
      "Grouped listings (product bundles)",
      "Real product images from official brand sites + Wikipedia Commons",
      "Real YouTube video IDs for unboxing/review content",
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
      { name: "sellerId",      type: "ref",       filterable: true, indexed: true },
      { name: "sellerEmail",   type: "string",    filterable: true, pii: true },
      { name: "featured",      type: "boolean",   filterable: true, indexed: true },
      { name: "isAuction",     type: "boolean",   filterable: true, indexed: true },
      { name: "isPreOrder",    type: "boolean",   filterable: true, indexed: true },
      { name: "isPromoted",    type: "boolean",   filterable: true, indexed: true },
      { name: "auctionEndDate",type: "timestamp", filterable: true, sortable: true },
      { name: "currentBid",    type: "number",    sortable: true },
      { name: "bidCount",      type: "number",    sortable: true },
      { name: "avgRating",     type: "number",    sortable: true },
      { name: "tags",          type: "array",     filterable: true },
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
      "10 orders in all statuses: DELIVERED ×4, SHIPPED ×2, PROCESSING ×2, PENDING ×1, CANCELLED ×1",
      "Line items with product snapshots (title, image, price at order time)",
      "Shipping address from buyer's saved addresses",
      "Order total in INR paise, GST line item, shipping fee",
      "createdAt timestamps spread over past 6 months",
    ],
    pendingItems: [
      "25 more orders to reach target 35",
      "REFUNDED ×3, RETURN_REQUESTED ×2 statuses for moderation testing",
      "Orders with multiple line items (bundles)",
      "COD payment method orders",
    ],
    uiPath: "/admin/orders",
    fields: [
      { name: "userId",        type: "ref",       filterable: true, indexed: true },
      { name: "userEmail",     type: "string",    filterable: true, pii: true, indexed: true },
      { name: "userName",      type: "string",    searchable: true, pii: true },
      { name: "sellerId",      type: "ref",       filterable: true, indexed: true },
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
      { name: "items[].isAuction",    type: "boolean",filterable: true },
      { name: "items[].isPreOrder",   type: "boolean",filterable: true },
      { name: "appliedCoupons",type: "array" },
      { name: "createdAt",     type: "timestamp", sortable: true },
      { name: "updatedAt",     type: "timestamp", sortable: true },
    ],
  },
  wishlists: {
    label: "Wishlists",
    icon: "💖",
    group: "transactional",
    target: 40,
    description: "User wishlist entries — each is a product + user pair with addedAt timestamp.",
    slugPattern: "auto-ID",
    seededItems: [
      "19 wishlist entries across 4 buyer accounts",
      "Mix of standard, auction, and pre-order products",
      "createdAt timestamps for recency sorting",
    ],
    pendingItems: [
      "21 more entries to reach target 40",
      "Public wishlist sharing (URL slug on wishlist)",
    ],
    uiPath: "/wishlist",
    fields: [
      { name: "userId",        type: "ref",       filterable: true, indexed: true },
      { name: "productId",     type: "ref",       filterable: true, indexed: true },
      { name: "productTitle",  type: "string",    searchable: true },
      { name: "productPrice",  type: "number",    sortable: true },
      { name: "productStatus", type: "enum",      filterable: true },
      { name: "addedAt",       type: "timestamp", sortable: true, indexed: true },
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
      { name: "sellerId",         type: "ref",       filterable: true },
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
      "15 reviews distributed across 8 stores",
      "Rating breakdown: 5★ ×11, 4★ ×2, 3★ ×1, 2★ ×1",
      "Rich review text (2–4 sentences per review)",
      "Verified purchase flag on all reviews",
      "createdAt spread over past 4 months",
    ],
    pendingItems: [
      "45 more reviews to reach target 60",
      "Review with images (seller response test)",
      "1-star reviews for moderation testing",
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
    slugPattern: "payout-{sellerName}-{YYYYMMDD}-{random6}  (e.g. payout-ravi-sharma-20260507-ab12cd)",
    mediaSlugPatterns: [
      { type: "payout-doc", pattern: "payout-doc-{sellerName}-{YYYYMMDD}.pdf", example: "payout-doc-ravi-sharma-20260507.pdf" },
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
      { name: "sellerId",      type: "ref",       filterable: true, indexed: true },
      { name: "sellerName",    type: "string",    searchable: true },
      { name: "sellerEmail",   type: "string",    filterable: true, pii: true, indexed: true },
      { name: "amount",        type: "number",    sortable: true },
      { name: "grossAmount",   type: "number",    sortable: true },
      { name: "platformFee",   type: "number",    sortable: true },
      { name: "status",        type: "enum",      filterable: true, sortable: true, indexed: true },
      { name: "paymentMethod", type: "enum",      filterable: true },
      { name: "bankAccount.accountNumberMasked", type: "string", note: "last 4 digits only" },
      { name: "upiId",         type: "string",    pii: true },
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
      "19 sections covering: hero, featured-products, trending, new-arrivals, flash-sale, brand-list, category-grid, ad-banner, faq-preview, blog-preview, events-preview, social-feed",
      "sortOrder on all sections",
      "isVisible + maxItems per section",
      "Section titles and subtitles",
    ],
    pendingItems: [
      "6 more sections to reach target 25",
      "Google Reviews section",
      "Custom cards marketing section",
      "Store spotlight section",
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
      "21 FAQs across categories: Ordering & Checkout, Shipping & Delivery, Returns & Refunds, Auction Bidding, Selling on LetItRip, Authenticity & Grading",
      "5 FAQs marked isHomepageEligible=true",
      "Rich text answers with links",
      "sortOrder per category",
    ],
    pendingItems: [
      "34 more FAQs to reach target 55",
      "Pre-order FAQs category",
      "Account & Security FAQs",
      "Payment Methods FAQs (UPI, COD, EMI)",
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
      { name: "watermark",      type: "map", note: "enabled, opacity, position" },
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
    description: "Buyer–seller message threads. Each conversation links a buyer, a store, and an optional product.",
    slugPattern: "auto-ID",
    seededItems: ["Demo conversations between buyers and sellers"],
    pendingItems: [],
    uiPath: "/store/messages",
    fields: [
      { name: "buyerUid",   type: "ref",       filterable: true, indexed: true },
      { name: "storeId",    type: "ref",       filterable: true, indexed: true },
      { name: "productId",  type: "ref",       filterable: true },
      { name: "status",     type: "enum",      filterable: true },
      { name: "createdAt",  type: "timestamp", sortable: true, indexed: true },
    ],
  },
  sublistingCategories: {
    label: "Sublisting Categories",
    icon: "🏷️",
    group: "listings",
    target: 20,
    description: "Category tree for sub-listings (e.g. individual cards within a set).",
    slugPattern: "sublisting-category-*",
    seededItems: ["Demo sublisting category hierarchy"],
    pendingItems: [],
    uiPath: "/admin/sublisting-categories",
    fields: [
      { name: "name",      type: "string", searchable: true },
      { name: "parentId",  type: "ref",    filterable: true, indexed: true },
      { name: "isLeaf",    type: "boolean",filterable: true },
      { name: "createdAt", type: "timestamp", sortable: true },
    ],
  },
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
      <Div className="flex items-center gap-3 px-4 py-3">
        <Checkbox
          id={`col-${col}`}
          checked={selected}
          onChange={onToggle}
          disabled={isRunning}
          label=""
        />
        {/* Expand toggle */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex-1 flex items-center gap-2 text-left"
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
        </button>
      </Div>

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
                {(["all", "core", "listings", "transactional", "content", "system"] as const).map((g) => {
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
