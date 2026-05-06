"use client";

/**
 * SeedPanel — Dev-only UI for loading / deleting seed data.
 *
 * Route: /[locale]/demo/seed
 * Per-resource accordion cards: each collection has its own expandable card
 * showing seeded items, pending items, DB state, target counts and metrics.
 */

import { useState, useEffect, useCallback } from "react";
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

const ALL_COLLECTIONS: SeedCollectionName[] = [
  ...CORE_COLLECTIONS,
  ...LISTINGS_COLLECTIONS,
  ...TRANSACTIONAL_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
  ...SYSTEM_COLLECTIONS,
];

const DEFAULT_SELECTED: SeedCollectionName[] = [
  ...CORE_COLLECTIONS,
  ...LISTINGS_COLLECTIONS,
  ...TRANSACTIONAL_COLLECTIONS,
  ...CONTENT_COLLECTIONS,
];

// ─── Collection metadata ──────────────────────────────────────────────────────

type GroupKey = "core" | "listings" | "transactional" | "content" | "system";

interface CollectionMeta {
  label: string;
  icon: string;
  group: GroupKey;
  target: number;
  description: string;
  seededItems: string[];
  pendingItems: string[];
  uiPath: string;
  piiFields?: string[];
  nameKey?: string;
}

const COLLECTION_META: Record<SeedCollectionName, CollectionMeta> = {
  users: {
    label: "Users",
    icon: "👤",
    group: "core",
    target: 15,
    description: "All platform accounts: 1 admin, 4–6 sellers, 8+ buyers. Auth records + Firestore profile docs with hashed passwords and role custom claims.",
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
    piiFields: ["email", "phone", "displayName"],
  },
  addresses: {
    label: "Delivery Addresses",
    icon: "📍",
    group: "core",
    target: 25,
    description: "Buyer delivery addresses — Indian format with pincode, state, city. Each buyer has 2–3 saved addresses with one marked default.",
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
    uiPath: "/account/addresses",
    piiFields: ["fullName", "phone", "addressLine1"],
  },
  stores: {
    label: "Stores",
    icon: "🏪",
    group: "core",
    target: 8,
    description: "Seller storefronts — each with logo, banner, about text, social links, and a linked seller user account.",
    seededItems: [
      "Misty's Water Cards — Pokémon TCG specialist, Mumbai",
      "Surge's Electric Emporium — Pokémon TCG, Delhi",
      "Speed King Diecast — Hot Wheels, Bangalore",
      "Bladers' Paradise — Beyblade Burst, Chennai",
      "Anime Vault India — Anime figures + merch, Hyderabad",
      "Retro Vault India — Retro gaming cartridges + consoles",
      "Cosplay India Hub — Cosplay accessories + props",
      "LetiTrip Official — Platform's own curated store",
    ],
    pendingItems: [
      "Store rating averages (computed from reviews)",
      "Store-level featured/verified badges",
      "Social media handles (Instagram, YouTube) per store",
    ],
    uiPath: "/stores",
  },
  storeAddresses: {
    label: "Store / Pickup Addresses",
    icon: "🏬",
    group: "core",
    target: 15,
    description: "Physical pickup / warehouse addresses for stores. Used in orders and listing pickups.",
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
  },
  brands: {
    label: "Brands",
    icon: "🏷️",
    group: "core",
    target: 25,
    description: "Official collectibles brands with logo, country of origin, and category associations.",
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
  },
  categories: {
    label: "Categories",
    icon: "🗂️",
    group: "core",
    target: 55,
    description: "3-tier nested category tree: root → subcategory → leaf. Covers all collectibles verticals on the platform.",
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
  },
  products: {
    label: "Products (Standard + Auctions + Pre-orders)",
    icon: "📦",
    group: "listings",
    target: 130,
    description: "All product types in one collection. Standard = buy now. Auction = bidding. Pre-order = deposit. 100+ standard, 20 auctions, 10 pre-orders.",
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
  },
  bids: {
    label: "Auction Bids",
    icon: "⚡",
    group: "listings",
    target: 120,
    description: "Bid history for all auction listings. Each auction has 4–12 bids with realistic price escalation.",
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
  },
  orders: {
    label: "Orders",
    icon: "🛒",
    group: "transactional",
    target: 35,
    description: "Purchase orders across all statuses. Each order has line items, shipping info, timestamps, and linked buyer + store.",
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
  },
  carts: {
    label: "Shopping Carts",
    icon: "🛍️",
    group: "transactional",
    target: 20,
    description: "Active and abandoned carts — both guest (localStorage-style) and authenticated user carts in Firestore.",
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
    uiPath: "/account/cart",
  },
  wishlists: {
    label: "Wishlists",
    icon: "💖",
    group: "transactional",
    target: 40,
    description: "User wishlist entries — each is a product + user pair with addedAt timestamp.",
    seededItems: [
      "19 wishlist entries across 4 buyer accounts",
      "Mix of standard, auction, and pre-order products",
      "createdAt timestamps for recency sorting",
    ],
    pendingItems: [
      "21 more entries to reach target 40",
      "Public wishlist sharing (URL slug on wishlist)",
    ],
    uiPath: "/account/wishlist",
  },
  coupons: {
    label: "Coupons",
    icon: "🎟️",
    group: "transactional",
    target: 20,
    description: "Global platform coupons + store-specific discount codes. Flat-amount and percentage types.",
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
  },
  reviews: {
    label: "Product Reviews",
    icon: "⭐",
    group: "transactional",
    target: 60,
    description: "Product reviews with star ratings, text, and optional media. Linked to product + buyer user.",
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
  },
  payouts: {
    label: "Payouts",
    icon: "💳",
    group: "transactional",
    target: 25,
    description: "Seller payout records — linked to stores, orders, and bank account details (masked).",
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
  },
  blogPosts: {
    label: "Blog Posts",
    icon: "📝",
    group: "content",
    target: 20,
    description: "Editorial blog content covering hobby guides, product reviews, event coverage, and market news.",
    seededItems: [
      "8 posts: How to Grade Pokémon Cards, Hot Wheels Treasure Hunt Guide, Beyblade Burst Meta Analysis, Top 10 Anime Figures 2025, Retro Gaming Hidden Gems, Cosplay Accessory Guide, Pokémon TCG Scarlet & Violet Set Review, Selling on LetiTrip Guide",
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
  },
  events: {
    label: "Events",
    icon: "🎪",
    group: "content",
    target: 15,
    description: "Collectibles events: tournaments, toy fairs, trade meets, cosplay conventions.",
    seededItems: [
      "8 events: Pokémon Regional Tournament Mumbai, Hot Wheels Collector Fair Delhi, Anime Expo Bangalore, Beyblade Burst Open Chennai, TCG Trade Meet Hyderabad, Cosplay Championship Pune, Retro Gaming Fest, LetiTrip Summer Sale Event",
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
  },
  eventEntries: {
    label: "Event Registrations",
    icon: "🎫",
    group: "content",
    target: 25,
    description: "User registrations for events. Linked to event + user with registration timestamp.",
    seededItems: [
      "2 event registrations (buyer accounts)",
    ],
    pendingItems: [
      "23 more registrations to reach target 25",
      "Waitlist status entries",
      "Team registrations (tournament format)",
    ],
    uiPath: "/admin/events",
  },
  carouselSlides: {
    label: "Hero Carousel Slides",
    icon: "🎠",
    group: "content",
    target: 10,
    description: "Homepage hero carousel slides — full-width banners driving traffic to featured products, events, and sales.",
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
  },
  homepageSections: {
    label: "Homepage Sections",
    icon: "🏠",
    group: "content",
    target: 25,
    description: "All homepage layout sections: featured products, trending, flash sale, brand rows, ads, FAQs preview, social feed.",
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
    uiPath: "/admin/homepage",
  },
  faqs: {
    label: "FAQs",
    icon: "❓",
    group: "content",
    target: 55,
    description: "FAQ entries across Help Centre categories. Homepage-eligible FAQs shown in the FAQ section.",
    seededItems: [
      "21 FAQs across categories: Ordering & Checkout, Shipping & Delivery, Returns & Refunds, Auction Bidding, Selling on LetiTrip, Authenticity & Grading",
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
  },
  notifications: {
    label: "Notifications",
    icon: "🔔",
    group: "system",
    target: 40,
    description: "In-app notifications covering all 10 notification types. Mix of read and unread.",
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
    uiPath: "/account/notifications",
  },
  sessions: {
    label: "Sessions",
    icon: "🔐",
    group: "system",
    target: 20,
    description: "Active user sessions for auth testing. Device info, IP (masked), last active timestamp.",
    seededItems: [
      "19 session records across all user accounts",
      "Mix of mobile / desktop / tablet userAgent",
      "isActive, expiresAt, lastActiveAt per session",
    ],
    pendingItems: [
      "1 more to reach target 20",
    ],
    uiPath: "/admin/sessions",
  },
  siteSettings: {
    label: "Site Settings",
    icon: "⚙️",
    group: "system",
    target: 1,
    description: "Single global settings document with 12 setting groups controlling the entire platform.",
    seededItems: [
      "1 doc at site_settings/global",
      "12 groups: Branding, Appearance, Announcement Banner, SEO Defaults, Contact + Social, Watermark, Fees + Commissions, Integrations + API Keys, Shipping Defaults, Auction Config, Platform Limits, Legal Pages",
      "Feature flags: enableAuctions, enablePreOrders, enableCOD, enableSocialFeed",
      "Razorpay + Shiprocket integration keys (test mode)",
    ],
    pendingItems: [],
    uiPath: "/admin/settings",
  },
};

// ─── Group labels ─────────────────────────────────────────────────────────────

const GROUP_CONFIG: Record<GroupKey, { label: string; icon: string }> = {
  core: { label: "Core Foundation", icon: "🗂️" },
  listings: { label: "Listings & Bids", icon: "📦" },
  transactional: { label: "Transactional", icon: "🛒" },
  content: { label: "Content & Marketing", icon: "📣" },
  system: { label: "System & Config", icon: "⚙️" },
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
}) {
  const [expanded, setExpanded] = useState(false);

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
      <Div className="flex items-center gap-2 px-3 py-2.5">
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
          onClick={() => setExpanded((p) => !p)}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
        >
          <Text className="text-base shrink-0">{meta.icon}</Text>
          <Text className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
            {meta.label}
          </Text>
          <StatusDot state={runState} />
          <Div className="flex-1" />
          {/* Counts */}
          <Div className="flex items-center gap-1.5 shrink-0">
            {isLoadingStatus ? (
              <Text className="text-[0.65rem] text-zinc-400">…</Text>
            ) : dbStatus ? (
              <Text
                className={`text-[0.65rem] font-mono px-1.5 py-0.5 rounded ${
                  isComplete
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
                    : isEmpty
                    ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                    : "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
                }`}
              >
                {existingCount}/{seedCount}
              </Text>
            ) : null}
            <Badge variant={statusVariant as "success" | "warning" | "danger" | "default"}>
              {statusLabel}
            </Badge>
            <Text className="text-zinc-400 dark:text-slate-500 text-xs w-4 text-center">
              {expanded ? "▲" : "▼"}
            </Text>
          </Div>
        </button>
      </Div>

      {/* Inline seed progress bar */}
      {dbStatus && seedCount > 0 && (
        <Div className="px-3 pb-1">
          <SeedProgressBar seeded={existingCount} target={seedCount} size="sm" />
        </Div>
      )}

      {/* Error message */}
      {runError && (
        <Div className="px-3 pb-2">
          <Text className="text-[0.65rem] text-red-600 dark:text-red-400 truncate" title={runError}>
            ✗ {runError}
          </Text>
        </Div>
      )}

      {/* ── Expanded body ── */}
      {expanded && (
        <Div className="border-t border-zinc-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-950/40">
          <Stack gap="sm">
            {/* Description */}
            <Text className="text-xs text-zinc-600 dark:text-slate-400 leading-relaxed">
              {meta.description}
            </Text>

            {/* Target progress */}
            <Div>
              <Row justify="between" className="mb-1">
                <Text className="text-[0.7rem] font-semibold text-zinc-700 dark:text-slate-300">
                  Target: {target} docs
                </Text>
                <Text className="text-[0.7rem] font-mono text-zinc-500 dark:text-slate-500">
                  DB: {existingCount} • Seed file: {seedCount}
                </Text>
              </Row>
              <SeedProgressBar seeded={existingCount} target={target} />
            </Div>

            {/* What's seeded */}
            <Div>
              <Text className="text-[0.7rem] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">
                ✓ What's Seeded
              </Text>
              <Stack gap="xs">
                {meta.seededItems.map((item, i) => (
                  <Text key={i} className="text-[0.7rem] text-zinc-700 dark:text-slate-300 leading-snug pl-2 border-l-2 border-emerald-300 dark:border-emerald-800">
                    {item}
                  </Text>
                ))}
              </Stack>
            </Div>

            {/* Pending items */}
            {meta.pendingItems.length > 0 && (
              <Div>
                <Text className="text-[0.7rem] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                  ⏳ Pending / Needed
                </Text>
                <Stack gap="xs">
                  {meta.pendingItems.map((item, i) => (
                    <Text key={i} className="text-[0.7rem] text-zinc-600 dark:text-slate-400 leading-snug pl-2 border-l-2 border-amber-300 dark:border-amber-800">
                      {item}
                    </Text>
                  ))}
                </Stack>
              </Div>
            )}

            {/* PII note */}
            {meta.piiFields && meta.piiFields.length > 0 && (
              <Div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-slate-800">
                <Text className="text-[0.65rem] text-zinc-500 dark:text-slate-400">
                  🔒 PII fields: {meta.piiFields.join(", ")} — masked in DB with Firestore encryption.
                </Text>
              </Div>
            )}

            {/* View in app link */}
            <Row>
              <a
                href={meta.uiPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.7rem] text-amber-600 dark:text-amber-400 hover:underline"
              >
                → View in app: {meta.uiPath}
              </a>
            </Row>
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
    <Div className="flex items-center gap-2 pt-2 pb-0.5">
      <Text className="text-xs">{icon}</Text>
      <Text className="text-xs font-bold text-zinc-500 dark:text-slate-500 uppercase tracking-widest">
        {label}
      </Text>
      <Div className="flex-1 h-px bg-zinc-200 dark:bg-slate-800" />
      <button
        type="button"
        onClick={() => onSelectAll(!allSelected)}
        disabled={isRunning}
        className="text-[0.65rem] text-zinc-400 hover:text-zinc-700 dark:hover:text-slate-300 shrink-0 disabled:opacity-40"
      >
        {allSelected ? "deselect group" : "select group"}
      </button>
    </Div>
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

  useEffect(() => { void fetchStatus(); }, [fetchStatus]);

  const getColStatus = (col: SeedCollectionName) => status.find((s) => s.name === col);

  async function run(action: "load" | "delete") {
    const queue = ALL_COLLECTIONS.filter((c) => selectedCollections.has(c));
    if (queue.length === 0) return;

    setIsRunning(true);
    setCompletedCount(0);
    setTotalQueued(queue.length);
    setColErrors({});

    const initial: Record<string, ColRunState> = {};
    queue.forEach((c) => (initial[c] = "queued"));
    setColRunStates(initial);

    let done = 0;
    for (const col of queue) {
      setColRunStates((prev) => ({ ...prev, [col]: "running" }));
      try {
        const res = await fetch(API_ROUTES.DEMO.SEED, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, collections: [col], dryRun }),
        });
        const data = await res.json();
        setColRunStates((prev) => ({ ...prev, [col]: data.success ? "done" : "error" }));
        if (!data.success) {
          setColErrors((prev) => ({ ...prev, [col]: data.message ?? "Unknown error" }));
        }
      } catch (err) {
        setColRunStates((prev) => ({ ...prev, [col]: "error" }));
        setColErrors((prev) => ({
          ...prev,
          [col]: err instanceof Error ? err.message : "Network error",
        }));
      }
      done++;
      setCompletedCount(done);
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
  ];

  return (
    <Section className="min-h-screen bg-white dark:bg-slate-950 text-zinc-900 dark:text-white py-8">
      <Container size="2xl">
        <Stack gap="lg">

          {/* Header */}
          <Stack gap="sm" className="items-center text-center">
            <Text className="text-5xl">🎮</Text>
            <Heading level={1} className="text-amber-600 dark:text-amber-400 text-3xl font-extrabold">
              LetItRip Demo Seed
            </Heading>
            <Text className="text-zinc-700 dark:text-slate-300 max-w-xl">
              Dev seed tool — expand each resource card to see what's seeded, pending counts, DB state and the UI path to verify it.
            </Text>
            <Badge variant="danger">DEV ONLY — Not available in production</Badge>
          </Stack>

          {/* DB overview stats */}
          {status.length > 0 && (
            <Div className="grid grid-cols-3 gap-3">
              <Div className="rounded-xl p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center">
                <Text className="text-xl font-bold text-zinc-900 dark:text-white font-mono">
                  {totalExistingDocs.toLocaleString()}
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-slate-400">docs in DB</Text>
              </Div>
              <Div className="rounded-xl p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center">
                <Text className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {totalSeedDocs.toLocaleString()}
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-slate-400">docs in seed files</Text>
              </Div>
              <Div className="rounded-xl p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center">
                <Text className="text-xl font-bold text-zinc-500 dark:text-slate-400 font-mono">
                  {totalTargetDocs.toLocaleString()}
                </Text>
                <Text className="text-xs text-zinc-500 dark:text-slate-400">total target docs</Text>
              </Div>
            </Div>
          )}

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

          {/* Controls header */}
          <Div className="rounded-xl p-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
            <Stack gap="md">
              <Row justify="between" className="items-center flex-wrap gap-2">
                <Stack gap="xs">
                  <Heading level={2} className="text-lg font-bold text-zinc-900 dark:text-white mt-0">
                    📋 Resource Collections
                  </Heading>
                  <Text className="text-xs text-zinc-600 dark:text-slate-300">
                    {selectedCollections.size} of {ALL_COLLECTIONS.length} selected — expand any card to see details, pending items, and DB state.
                  </Text>
                </Stack>
                <Row gap="sm">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCollections(new Set(ALL_COLLECTIONS))}
                    disabled={isRunning}
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCollections(new Set(DEFAULT_SELECTED))}
                    disabled={isRunning}
                  >
                    Default
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCollections(new Set())}
                    disabled={isRunning}
                  >
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchStatus}
                    disabled={isRunning || isLoadingStatus}
                  >
                    {isLoadingStatus ? "…" : "↻ Refresh"}
                  </Button>
                </Row>
              </Row>

              {/* Flat accordion list grouped by visual dividers */}
              <Stack gap="xs">
                {groups.map(({ key, cols }) => {
                  const allGroupSelected = cols.every((c) => selectedCollections.has(c));
                  return (
                    <Div key={key}>
                      <GroupDivider
                        groupKey={key}
                        allSelected={allGroupSelected}
                        onSelectAll={(select) => toggleGroup(cols, select)}
                        isRunning={isRunning}
                      />
                      <Stack gap="xs" className="mt-1">
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
                          />
                        ))}
                      </Stack>
                    </Div>
                  );
                })}
              </Stack>
            </Stack>
          </Div>

          {/* Controls */}
          <Stack gap="sm">
            <Row justify="center">
              <Checkbox
                label={
                  <Text className="text-sm text-zinc-800 dark:text-slate-200">
                    Dry Run (preview only — no writes)
                  </Text>
                }
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                disabled={isRunning}
              />
            </Row>
            <Row gap="md" justify="center" className="flex-wrap">
              <Button
                variant="primary"
                size="lg"
                isLoading={isRunning}
                onClick={() => run("load")}
                disabled={isRunning || selectedCollections.size === 0}
              >
                {dryRun ? "⚡ Dry Run Add Seed" : "⚡ Add / Upsert Seed Data"}
              </Button>
              <Button
                variant="danger"
                size="lg"
                onClick={() => run("delete")}
                disabled={isRunning || selectedCollections.size === 0}
              >
                {dryRun ? "🗑️ Dry Run Remove Seed" : "🗑️ Remove Seed Data"}
              </Button>
            </Row>
          </Stack>

          {/* Seed scale summary */}
          <Div className="rounded-xl p-5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10">
            <Heading level={3} className="text-amber-600 dark:text-amber-400 mt-0 mb-3">
              📊 Target Seed Scale
            </Heading>
            <Div className="grid grid-cols-2 gap-x-8 gap-y-1">
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
                <Row key={label} justify="between" className="py-0.5 border-b border-zinc-100 dark:border-white/5">
                  <Text className="text-xs text-zinc-700 dark:text-slate-300">{label}</Text>
                  <Text className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{count}</Text>
                </Row>
              ))}
            </Div>
          </Div>

        </Stack>
      </Container>
    </Section>
  );
}
