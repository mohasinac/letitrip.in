# letitrip.in — Developer Instructions & Architecture Guide

> Last updated: 2026-04-25  
> Stack: Next.js 16 · TypeScript · Firebase · Tailwind CSS · @mohasinac/appkit  
> Live site: https://www.letitrip.in

---

## Build Issues and Resolutions

### Root Causes of Build Failures
- **Client Components Importing Server Code**: Client components (marked with "use client") were importing from `@mohasinac/appkit`, which includes server-side code like Firebase Admin SDK and Node.js modules (e.g., `fs`, `child_process`). This caused Next.js Turbopack to bundle server-only modules into client bundles, leading to "Can't resolve 'fs'" errors.
- **Barrel Exports Pulling in Unintended Dependencies**: The main `appkit/src/index.ts` barrel file exported everything, including server components and providers, causing transitive imports of server code in client builds.
- **Lack of Separate Entry Points**: No clear separation between client-safe and server-side exports, leading to incorrect imports.

### Correct Way to Export and Import from Appkit
- **Entry Points**:
  - `@mohasinac/appkit/client`: For client components, hooks, UI primitives, and client-safe features. Exports are marked with "use client" and exclude server dependencies.
  - `@mohasinac/appkit/server`: For server components, actions, and server-side logic.
  - `@mohasinac/appkit/ui`: For UI components and layout primitives.
  - `@mohasinac/appkit`: Main entry for general use, but avoid in client components to prevent server code inclusion.
- **Import Guidelines**:
  - Client components (pages with "use client"): Import from `@mohasinac/appkit/client`.
  - Server components and actions: Import from `@mohasinac/appkit` or specific sub-paths.
  - UI/layout: Import from `@mohasinac/appkit/ui` or `@mohasinac/appkit/client`.
- **Export Strategy**:
  - Client-safe items (UI, hooks, client providers) go in `client.ts`.
  - Server items stay in `index.ts` or `server.ts`.
  - Use `serverExternalPackages` in `next.config.js` to exclude server modules from client bundles.
- **Resolution Applied**: Added client exports to `client.ts`, updated client page imports, and configured `serverExternalPackages` to exclude Firebase and Node.js modules.

---

## Table of Contents

0. [Work Tracker — Tasks & Status](#0-work-tracker--tasks--status)
1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Package Dependencies](#4-package-dependencies)
5. [Environment Setup](#5-environment-setup)
6. [Live Site — Full Page Inventory](#6-live-site--full-page-inventory)
7. [Homepage Architecture — CMS-Driven Sections](#7-homepage-architecture--cms-driven-sections)
8. [Carousel & Horizontal Slider System](#8-carousel--horizontal-slider-system)
9. [Listing Pages — Filter / Search / Sort / Pagination Regression](#9-listing-pages--filter--search--sort--pagination-regression)
10. [Authenticated Pages — Slot-Shell Pattern & What's Empty](#10-authenticated-pages--slot-shell-pattern--whats-empty)
11. [Cart & Checkout — Broken Implementation](#11-cart--checkout--broken-implementation)
12. [Live Site vs Current Build — Master Gap Table](#12-live-site-vs-current-build--master-gap-table)
13. [Regression Catalog — Specific Bugs](#13-regression-catalog--specific-bugs)
14. [Product Detail Page — Full Breakdown](#14-product-detail-page--full-breakdown)
15. [Data Flow Diagrams](#15-data-flow-diagrams)
16. [API Routes Reference](#16-api-routes-reference)
17. [Authentication & Security](#17-authentication--security)
18. [Development Workflow](#18-development-workflow)
19. [Firebase & Cloud Functions](#19-firebase--cloud-functions)
20. [Feature Flags](#20-feature-flags)
21. [Remaining Pages — Detail Page Analysis](#21-remaining-pages--detail-page-analysis)

---

## 0. Work Tracker — Tasks & Status

> Update status column as tasks complete: `[ ]` pending · `[~]` in progress · `[x]` done  
> Legend: **P0** = blocks everything · **P1** = high impact · **P2–P6** = sequenced by dependency

### P0 — Appkit Core Bugs _(fix before anything else — these break every page)_

| # | Status | Task | File | Impact |
|---|--------|------|------|--------|
| 1 | `[ ]` | Fix `perView` — implement ResizeObserver item-width calc | `appkit/src/ui/components/HorizontalScroller.tsx:67` | All carousels show all cards flat |
| 2 | `[ ]` | Fix dark mode CSS — replace `prefers-color-scheme` with `.dark` selector | `appkit/src/ui/components/HorizontalScroller.style.css:71` | Arrows invisible when dark mode toggled |
| 3 | `[ ]` | Fix grid slide width — add `flex: 0 0 100%` to `appkit-hscroller__slide` | `appkit/src/ui/components/HorizontalScroller.tsx:122` | 2-row grid scroll breaks mid-slide |
| 4 | `[ ]` | Fix HeroCarousel — add fallback banner when `slides.length === 0` | `appkit/src/features/homepage/components/HeroCarousel.tsx:97` | Blank gap in homepage locally |
| 5 | `[ ]` | Fix ad slot keys — map `section.type` → correct key, not `section.order` | `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx:137` | Ad slots never fire |
| 6 | `[ ]` | Fix FAQ data — call `faqRepository.getHomepageFAQs()` instead of `items={[]}` | `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx:326` | FAQ always shows empty |
| 7 | `[ ]` | Add `case "brands":` render case to homepage section switch | `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` | Brands section silently dropped |

### P1 — Product Detail Page _(high-traffic, high-impact)_

| # | Status | Task | File | Impact |
|---|--------|------|------|--------|
| 8 | `[ ]` | Gallery: replace CSS `background-image` div with `<img>` + `ImageLightbox` | `appkit/src/features/products/components/ProductDetailPageView.tsx` | Image not clickable, no lightbox |
| 9 | `[ ]` | Wire `renderTabs` → `ProductTabs` (Description / Specs / Delivery / Reviews) | Same file | Tabs section missing below fold |
| 10 | `[ ]` | Wire `renderRelated` → `RelatedProducts` carousel | Same file | No "you might also like" |
| 11 | `[ ]` | Wire `BuyBar` for mobile sticky actions | Same file | No sticky buy bar on mobile |

### P2 — Listing Page Toolbars _(every listing page is missing search/filter/sort/pages)_

| # | Status | Task | File | Impact |
|---|--------|------|------|--------|
| 12 | `[x]` | Auctions: replace bare view with `AuctionsView` + `ProductFilters` + `Pagination` | `appkit/src/features/auctions/components/AuctionsListView.tsx` + `src/app/[locale]/auctions/page.tsx` | ✅ Done — AuctionsListView → AuctionsIndexListing (useUrlTable + SlottedListingView) |
| 13 | `[x]` | Products: same — use `ProductsView` shell | `appkit/src/features/products/components/ProductsIndexPageView.tsx` + page | ✅ Done — ProductsIndexPageView → ProductsIndexListing (useUrlTable + SlottedListingView) |
| 14 | `[x]` | Pre-orders listing: same pattern | `appkit/src/features/pre-orders/components/PreOrdersListView.tsx` | ✅ Done phase 26.3 — PreOrdersIndexListing created (useUrlTable + useProducts(isPreOrder:true)) |
| 15 | `[x]` | Stores listing: same pattern | `appkit/src/features/stores/components/StoresIndexPageView.tsx` | ✅ Done phase 26.4 — StoresIndexListing created (useUrlTable + useStores) |

### P3 — Detail Page Slot-Shells _(detail pages render layout chrome only)_

| # | Status | Task | File | Impact |
|---|--------|------|------|--------|
| 16 | `[ ]` | Auction detail: pass `renderGallery` / `renderInfo` / `renderBidForm` / `renderMobileBidForm` | `src/app/[locale]/auctions/[id]/page.tsx` | Auction detail page is blank |
| 17 | `[ ]` | Pre-order detail: pass `renderGallery` / `renderInfo` / `renderBuyBar` | `src/app/[locale]/pre-orders/[id]/page.tsx` | Pre-order detail is blank |
| 18 | `[ ]` | Public profile: server-fetch user data, pass to `PublicProfileView` | `src/app/[locale]/profile/[userId]/page.tsx` | Shows "—" for all stats |

### P4 — Dashboard Slot-Shell Wiring _(authenticated pages all blank)_

| # | Status | Task | File | Impact |
|---|--------|------|------|--------|
| 19 | `[ ]` | User hub: wire `renderProfile` / `renderNav` / `renderRecentOrders` | `src/app/[locale]/user/page.tsx` | User homepage blank |
| 20 | `[ ]` | User orders: wire `renderTable` to orders fetch | `src/app/[locale]/user/orders/page.tsx` | Orders page blank |
| 21 | `[ ]` | User wishlist: wire `renderProducts` / `renderTabs` / `renderSearch` / `renderSort` | `src/app/[locale]/user/wishlist/page.tsx` | Wishlist has data but no display |
| 22 | `[ ]` | User addresses, settings, notifications, messages, offers | `src/app/[locale]/user/*/page.tsx` | All blank |
| 23 | `[ ]` | Seller dashboard: wire `renderStats` / `renderQuickActions` / `renderRevenueChart` / `renderTopProducts` / `renderRecentListings` | `src/app/[locale]/seller/page.tsx` | Seller dashboard blank |
| 24 | `[ ]` | Seller analytics, store, offers, shipping | `src/app/[locale]/seller/*/page.tsx` | All blank |
| 25 | `[ ]` | Admin dashboard: wire `renderCharts` + `renderRecentActivity` (stats already work) | `src/app/[locale]/admin/dashboard/page.tsx` | Charts + activity missing |
| 26 | `[ ]` | Admin analytics, site settings | `src/app/[locale]/admin/*/page.tsx` | Blank |

### P5 — Cart & Checkout _(transactional flow broken end-to-end)_

| # | Status | Task | File | Impact |
|---|--------|------|------|--------|
| 27 | `[ ]` | Cart: call `/api/cart` when authenticated; merge guest cart on login | `src/components/routing/CartRouteClient.tsx` | Auth users see empty cart |
| 28 | `[ ]` | Cart: add coupon code field + multi-seller grouping + shipping estimate | Same | Missing on all carts |
| 29 | `[ ]` | Checkout: real address selection from `/api/user/addresses` | `src/components/routing/CheckoutRouteClient.tsx` | Hardcoded fake inputs |
| 30 | `[ ]` | Checkout: Razorpay modal → payment verify → order creation | Same | [Place Order] does nothing |
| 31 | `[ ]` | Checkout success: wire `CheckoutSuccessRouteClient` | `src/components/routing/CheckoutSuccessRouteClient.tsx` | Success page is also a stub |

### P6 — Infrastructure & Seed Data

| # | Status | Task | File | Impact |
|---|--------|------|------|--------|
| 32 | `[ ]` | Firestore seed script: `carousel_slides` + `homepage_sections` + `site_settings` | `scripts/seed-firestore.ts` (new) | Homepage blank locally |
| 33 | `[ ]` | Rebuild appkit after all P0 fixes; confirm `npm run build` passes | — | Verify no TypeScript/build regressions |

### Reference implementations (already correct — use as patterns)

| Page | Component | What it does right |
|------|-----------|-------------------|
| `/events/[id]` | `EventDetailView` | Page fetches data + passes ALL 5 render props |
| `/search/[slug]/tab/.../page/...` | `SearchView` | Page fetches + wires search, filters, results, pagination |
| `/promotions/[tab]` | `PromotionsView` | Page fetches + wires all render slots + labels |

---

---

## 1. Project Overview

**letitrip.in** is a full-featured Indian multi-vendor marketplace built on Next.js 16 App Router.
It supports direct-buy products, live auctions, pre-orders, seller storefronts, an AI copilot,
Razorpay payments, Shiprocket fulfillment, and a CMS-driven homepage.

Regional defaults:
- Currency: INR (₹)
- Locale: en-IN
- Timezone: Asia/Kolkata
- Phone prefix: +91

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                             │
│   React 19 · Next.js App Router · Tailwind CSS · React Query        │
│   PWA (Serwist) · Firebase Client SDK (Auth, RTDB only)             │
└──────────────────────┬──────────────────────────────────────────────┘
                       │  HTTP / Server Components / Server Actions
┌──────────────────────▼──────────────────────────────────────────────┐
│                     NEXT.JS SERVER (SSR/ISR)                        │
│   App Router pages · Server Components · Server Actions             │
│   next-intl (i18n) · Serwist SW · API Routes                        │
│                                                                     │
│   ┌─────────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│   │  @mohasinac/    │   │  Firebase Admin  │   │  External APIs  │  │
│   │  appkit         │   │  SDK (server-    │   │  Razorpay       │  │
│   │  (local mono-   │   │  side only)      │   │  Shiprocket     │  │
│   │  repo lib)      │   │                  │   │  Resend (email) │  │
│   └────────┬────────┘   └────────┬─────────┘   │  Gemini AI      │  │
│            │                    │              │  Upstash Redis  │  │
└────────────┼────────────────────┼──────────────┴────────────────┘  │
             │                    │                                    │
┌────────────▼────────────────────▼──────────────────────────────────┐
│                         FIREBASE PLATFORM                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Firestore   │  │  Auth        │  │  RTDB      │  │  Storage │ │
│  │  (all data)  │  │  (users,     │  │  (live     │  │  (media) │ │
│  │              │  │   sessions)  │  │   bids,    │  │          │ │
│  │  !! client   │  │              │  │   notifs)  │  │          │ │
│  │  access OFF  │  │              │  │            │  │          │ │
│  └──────────────┘  └──────────────┘  └────────────┘  └──────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Cloud Functions  (triggers, scheduled jobs, webhooks)      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

> **Critical rule**: Firestore security rules deny ALL client-side access.
> Every read/write goes through Next.js API routes using the Firebase Admin SDK.

---

## 3. Monorepo Structure

```
letitrip.in/
│
├── src/                          # Next.js application
│   ├── app/                      # App Router (pages + API routes)
│   │   ├── [locale]/             # All user-facing pages
│   │   │   ├── page.tsx          # Homepage → delegates to MarketplaceHomepageView
│   │   │   ├── products/         # Product listing & detail
│   │   │   ├── auctions/         # Auction listing & detail
│   │   │   ├── events/           # Events
│   │   │   ├── pre-orders/       # Pre-orders
│   │   │   ├── cart/             # Shopping cart
│   │   │   ├── checkout/         # Checkout flow
│   │   │   ├── user/             # User dashboard (orders, profile, etc.)
│   │   │   ├── seller/           # Seller dashboard
│   │   │   ├── admin/            # Admin panel (15+ pages)
│   │   │   ├── blog/             # Blog
│   │   │   ├── stores/           # Store directory
│   │   │   └── auth/             # Login, register, reset
│   │   └── api/                  # API routes (Admin SDK, server-side only)
│   │
│   ├── actions/                  # Server Actions (thin wrappers over appkit)
│   ├── components/               # Letitrip-specific React components
│   │   ├── homepage/             # AdSlots, HomepageNewsletterForm, AdRuntimeInitializer
│   │   ├── auth/                 # Login, register, forgot-password UIs
│   │   ├── routing/              # Cart, Checkout, Success client wrappers
│   │   └── dev/                  # PokemonSeedPanel (demo data)
│   ├── constants/
│   │   ├── theme.ts              # Extends @mohasinac/tokens with letitrip overrides
│   │   ├── routes.ts             # All route constants
│   │   └── config.ts             # App configuration
│   ├── lib/
│   │   └── firebase/             # Firebase client config, auth-server helpers
│   ├── features/                 # Feature-scoped components (about page, etc.)
│   ├── validation/               # Zod schemas for API boundary validation
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript types
│   └── i18n/                     # next-intl routing config
│
├── appkit/                       # @mohasinac/appkit — local monorepo dependency
│   └── src/
│       ├── features/
│       │   ├── homepage/         # HeroCarousel, SectionCarousel, all section components
│       │   ├── products/         # ProductDetailPageView, ProductGrid, BuyBar, etc.
│       │   └── media/            # MediaImage, MediaVideo, MediaLightbox
│       ├── repositories/         # Firestore data access layer
│       ├── ui/                   # Shared UI (HorizontalScroller, ImageLightbox, etc.)
│       ├── providers/            # Firebase, email, storage providers
│       └── tokens/               # Design tokens (THEME_CONSTANTS base)
│
├── functions/                    # Firebase Cloud Functions
│   └── src/
│       ├── triggers/             # Firestore event triggers
│       ├── jobs/                 # Scheduled jobs (payouts, cleanup)
│       └── index.ts              # Function exports
│
├── messages/                     # next-intl message catalogs (en only currently)
├── scripts/qa/                   # Smoke test scripts (Playwright, API)
│
├── next.config.js                # Transpiles appkit, image domains, next-intl
├── tailwind.config.js            # Extends appkit tokens, dark mode: class
├── firebase.json                 # Emulator config, deployment targets
├── firestore.rules               # AUTO-GENERATED — do not edit manually
├── firestore.indexes.json        # Index definitions (79KB)
└── .env.example                  # All required environment variables
```

---

## 4. Package Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.1.6 | React framework, App Router, SSR/ISR |
| `react` / `react-dom` | ^19.2.0 | UI library |
| `typescript` | ^5.9.3 | Type safety |
| `@mohasinac/appkit` | file:./appkit | Local marketplace core library |

### Firebase

| Package | Version | Purpose |
|---------|---------|---------|
| `firebase` | ^12.8.0 | Client SDK — Auth, Storage, RTDB only |
| `firebase-admin` | ^13.8.0 | Server SDK — Firestore, all admin operations |
| `@auth/firebase-adapter` | ^2.11.1 | Auth session adapter |

### State & Forms

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | ^5.90.21 | Server state, caching, re-fetching |
| `react-hook-form` | ^7.71.2 | Form state management |
| `@hookform/resolvers` | ^5.2.2 | Zod resolver for react-hook-form |
| `zod` | ^4.3.6 | Schema validation (API boundaries, forms) |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^3.4.0 | Utility-first CSS (dark mode: class) |
| `tailwind-merge` | ^3.5.0 | Deduplicate Tailwind class strings |
| `lucide-react` | ^0.575.0 | Icon library |
| `recharts` | ^3.7.0 | Admin analytics charts |

### Payments & Commerce

| Package | Version | Purpose |
|---------|---------|---------|
| `razorpay` | ^2.9.6 | Payment gateway (orders, OTP, events) |
| `resend` | ^6.9.1 | Transactional emails |
| `sharp` | ^0.33.5 | Server-side image processing |

### Infrastructure

| Package | Version | Purpose |
|---------|---------|---------|
| `@upstash/redis` | ^1.37.0 | Redis client for rate limiting |
| `@upstash/ratelimit` | ^2.0.8 | Rate limiting (auth, API) |
| `next-intl` | ^4.8.3 | i18n, locale routing |
| `serwist` | ^9.5.7 | Service Worker / PWA |
| `axios` | ^1.13.5 | HTTP client |
| `@google/generative-ai` | ^0.24.1 | Gemini AI copilot chat |

---

## 5. Environment Setup

Copy `.env.example` → `.env.local` and fill every variable. Key groups:

```
# Firebase Admin (server-side only)
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY        # literal \n line breaks required
FIREBASE_ADMIN_DATABASE_URL

# Firebase Client (browser-visible)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_DATABASE_URL

# Encryption (generate with: openssl rand -hex 32)
PII_ENCRYPTION_KEY                 # 64-char hex
SETTINGS_ENCRYPTION_KEY
HMAC_SECRET                        # session cookie signing

# Services
RESEND_API_KEY
RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
GEMINI_API_KEY
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
```

### Running locally

```bash
npm install
npm run watch:appkit   # terminal 1 — rebuilds appkit on save
npm run dev            # terminal 2 — Next.js dev server
```

### CRITICAL: Seed Firestore data first

The homepage is database-driven. Without seed data it renders a completely blank page.

```bash
# Option A — demo seed endpoint (easiest)
curl -X POST http://localhost:3000/api/demo/seed

# Option B — Firebase emulator with exported snapshot
firebase emulators:start --import ./emulator-data
```

Emulator ports: Functions 5001 · Firestore 8080 · RTDB 9000 · Auth 9099 · Storage 9199 · UI 4000

---

## 6. Live Site — Full Page Inventory

This section documents exactly what the live site (letitrip.in) shows, from a direct analysis
of the rendered pages. Use this as the reference target when building locally.

### 6a. Navigation Header (all pages)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [L LetItRip logo]  Today's Deals        🔍(⌘K) [🛒] [👤]  [☀/🌙] [EN▾] │
│─────────────────────────────────────────────────────────────────────────── │
│  Home  Products  Auctions  Pre-Orders  Categories  Stores  Events  Blog    │
│  Reviews                                                                   │
│  Login  Register  (when not authenticated)                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

### 6b. Homepage — All Sections in Order

```
┌────────────────────────────────────────────────────────────────┐
│  ANNOUNCEMENT BAR                                              │
│  "🎉 Up to 15% Off on Pokémon TCG this week — Use code SAVE15" │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  HERO CAROUSEL (5 slides, snap-scroll)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [SLIDE BACKGROUND IMAGE — full bleed]                   │  │
│  │                                                          │  │
│  │  Grid mode (this slide):  3 columns × 2 rows             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │ Card 1   │  │ Card 2   │  │ Card 3   │               │  │
│  │  │ (image+  │  │          │  │          │               │  │
│  │  │  title)  │  │          │  │          │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │ Card 4   │  │ Card 5   │  │ Card 6   │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  │                                                          │  │
│  │           Overlay mode (other slides):                   │  │
│  │      Centred title + subtitle + CTA button               │  │
│  └──────────────────────────────────────────────────────────┘  │
│     ●●●●●  (dot nav, active dot has 4s progress fill)          │
│     [‹ prev]  [next ›]  (bottom-right arrow buttons)           │
│     Bottom fade: white→transparent gradient                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "Pokémon Base Set 151"  (featured carousel — slide-level)     │
│  4 product cards + 1 auction card horizontally                 │
│  Charizard ₹89,999 · Blastoise ₹34,999 · Zapdos ₹12,999       │
│  1st Ed Charizard PSA7  [🔥 AUCTION]  "Current bid: ₹3,49,999" │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "Shop by Type"  —  Pokémon type browse cards                  │
│  ←  [💧Water] [🔥Fire] [⚡Electric] [🔮Psychic] [🌿Grass]  →  │
│  [🥊Fighting]     horizontal scroll, 6 type cards              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  STATS  (4 counters in a row)                                  │
│  10,000+ Products · 2,000+ Verified Sellers                    │
│  50,000+ Happy Buyers · 4.8/5 Average Rating                   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  TRUST INDICATORS  "Why Choose Us"  (4 icon cards)             │
│  🔒 Secure Payments · 🚀 Fast Delivery                         │
│  🔄 Easy Returns · 🎧 24/7 Support                             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "How LetItRip Works"  (3-step section)                        │
│  1. Browse & Discover  2. Bid or Buy  3. Get It Delivered      │
│  [Start Shopping] CTA button                                   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "Shop by Category"  (horizontal scroller, arrows)             │
│  ← [Pokémon Cards] [Sealed Products "6"] [Accessories 🎒"4"] → │
│  "View all →"                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "Shop by Brand"  (horizontal scroller, arrows)                │
│  Brand carousel — separate section from categories             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "Featured Products"  "Handpicked items just for you"          │
│  HORIZONTAL SCROLLER — 3 cards visible at a time               │
│  ┌──────┐  ┌──────┐  ┌──────┐  [← →]  "View all →"           │
│  │ Prod │  │ Prod │  │ Prod │  ▶ next 3 on arrow click        │
│  │  img │  │  img │  │  img │                                 │
│  │ name │  │ name │  │ name │                                 │
│  │ ₹999 │  │ ₹699 │  │ ₹999 │                                 │
│  └──────┘  └──────┘  └──────┘                                 │
│  18 total products, 3 at a time, scroll to see more            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "⚡ LIVE AUCTIONS"  "Bid on exclusive items"                   │
│  Horizontal scroller with arrows  "View all →"                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "COMING SOON"  "Reserve Before It Ships"                      │
│  Pre-orders horizontal scroller  "View all →"                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "TOP STORES"  "Featured Stores"                               │
│  Store cards horizontal scroller  "View all →"                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "EVENTS & OFFERS"                                             │
│  Events horizontal scroller  "View all →"                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "What Our Customers Say"                                      │
│  HORIZONTAL SCROLLER — reviews carousel with arrows            │
│  ★★★★★  name  date  title  excerpt  "N found this helpful"     │
│  6+ review cards  "See all reviews →"                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "🔒 YOUR DATA IS SAFE"  "Security You Can Trust"              │
│  4 cards: Bank-Grade Encryption · Secure Connections           │
│  Strict Access Controls · Data Minimization                    │
│  [Learn More About Our Security →]                             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  FAQ  "Frequently Asked Questions"                             │
│  Tabs: ℹ️General 💳Orders & Payment 🚚Shipping 🔄Returns ...   │
│  (Shows "No data available" on live — FAQ not seeded)          │
│  "View all →"                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  NEWSLETTER  "Stay Updated"                                    │
│  [email input]  [Subscribe]                                    │
│  "We respect your privacy. Unsubscribe at any time."           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  "FROM THE BLOG"  "Tips, stories, and insights"                │
│  Blog articles horizontal scroller  "View all →"              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  FEATURES BAR (pre-footer trust strip)                         │
│  🚚 Free Shipping · 🔄 Easy Returns                            │
│  🔒 Secure Payment · 🎧 24/7 Support · ✅ Authentic Sellers    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  FOOTER                                                        │
│  Logo + tagline + social icons (FB, IG, TW, LI)               │
│  Newsletter "Stay in the loop" + subscribe field               │
│  Columns: Shop · Support · For Sellers · Learn · Legal         │
│  © 2026 LetItRip. Built with ❤️ in India                       │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  MOBILE BOTTOM NAV (sticky)                                    │
│  🏠 Home · 📦 Products · 🔍 Search · 🛒 Cart · 👤 Profile     │
└────────────────────────────────────────────────────────────────┘
```

### 6c. Product Detail Page — /products/pokemon-charizard-9-pocket-binder

```
┌──────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Home > Products > Accessories > Pokémon 9-Pocket... │
└──────────────────────────────────────────────────────────────────┘

┌────────────────────────────┬─────────────────────┬──────────────┐
│  GALLERY COLUMN            │  INFO COLUMN         │  ACTION RAIL │
│                            │                      │  (sticky)    │
│  ┌──────────────────────┐  │  Title:              │              │
│  │                      │  │  "Pokémon 9-Pocket   │  ₹1,499.00  │
│  │   MAIN IMAGE         │  │  Binder (360 cards,  │              │
│  │   (large, ~square)   │  │  Charizard Cover)"   │  [Add Cart]  │
│  │                      │  │                      │  [Buy Now]   │
│  │   click → lightbox   │  │  [In Stock ✓]        │  [Wishlist]  │
│  │                      │  │  30 in stock         │              │
│  └──────────────────────┘  │  ⚡ Faster Delivery  │              │
│  ┌────┐ ┌────┐            │                      │              │
│  │ T1 │ │ T2 │  thumbnails │  ₹1,499.00           │              │
│  └────┘ └────┘            │                      │              │
│  "1 / 2" counter          │  Seller: [store link] │              │
│                            │                      │              │
│                            │  ─────────────────── │              │
│                            │  Tabs:               │              │
│                            │  Description │ Specs  │              │
│                            │  Delivery & Returns   │              │
│                            │  Reviews              │              │
│                            │                      │              │
│                            │  Specifications ▾    │              │
│                            │  Brand: Ultra PRO    │              │
│                            │  Capacity: 360 cards │              │
│                            │  Art: Charizard      │              │
│                            │                      │              │
│                            │  Delivery & Returns ▾│              │
│                            │  Shipped in box      │              │
│                            │  7-day returns       │              │
│                            │                      │              │
│                            │  Tags: #binder       │              │
│                            │  #accessories ...    │              │
└────────────────────────────┴─────────────────────┴──────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  BELOW-FOLD                                                      │
│  "You might also like" — related products                        │
└──────────────────────────────────────────────────────────────────┘

LIGHTBOX (when image is clicked):
┌──────────────────────────────────────────────────────────────────┐
│                          [X close]                               │
│                         "1 / 2"                                  │
│                                                                  │
│  [‹]            [IMAGE — full screen, object-fit: contain]  [›] │
│                                                                  │
│                        🔍 Scroll to zoom                         │
└──────────────────────────────────────────────────────────────────┘
```

### 6d. Pre-Footer Trust Strip (all pages)

```
┌─────────────────────────────────────────────────────────────────┐
│  🚚 Free Shipping  🔄 Easy Returns  🔒 Secure Payment           │
│  🎧 24/7 Support   ✅ Authentic Sellers                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Homepage Architecture — CMS-Driven Sections

The homepage at `src/app/[locale]/page.tsx` is a thin shell:

```tsx
export default async function Page() {
  return (
    <MarketplaceHomepageView
      newsletterFormSlot={<HomepageNewsletterForm />}
      adSlots={{ afterHero, afterFeaturedProducts, afterReviews, afterFAQ }}
    />
  );
}
```

`MarketplaceHomepageView` (appkit) fetches from Firestore on every request (ISR: 120s):

```
carouselRepository.getActiveSlides()   → Firestore: carousel_slides
siteSettingsRepository.getSingleton()  → Firestore: site_settings
homepageSectionsRepository             → Firestore: homepage_sections
  .getEnabledSections()
```

### Available section types

| DB type | Component | Status |
|---------|-----------|--------|
| `welcome` | WelcomeSection | ✅ Renders |
| `stats` | StatsCounterSection | ⚠️ Only renders if `cfg.stats` array is non-empty |
| `trust-indicators` | TrustFeaturesSection | ✅ Renders (hardcoded defaults) |
| `categories` | ShopByCategorySection | ✅ Renders |
| `brands` | *(missing)* | ❌ No render case — silently dropped |
| `products` | FeaturedProductsSection | ✅ Renders |
| `auctions` | FeaturedAuctionsSection | ✅ Renders |
| `pre-orders` | FeaturedPreOrdersSection | ✅ Renders |
| `stores` | FeaturedStoresSection | ✅ Renders |
| `events` | EventsSection | ✅ Renders |
| `reviews` | HomepageCustomerReviewsSection | ✅ Renders |
| `banner` | CTABannerSection | ✅ Renders |
| `features` | SecurityHighlightsSection | ✅ Renders |
| `whatsapp-community` | WhatsAppCommunitySection | ✅ Renders |
| `faq` | FAQSection | ⚠️ Always empty — hardcoded `items={[]}` |
| `newsletter` | NewsletterSection | ✅ Renders |
| `blog-articles` | BlogArticlesSection | ✅ Renders |

### Ad slot injection

```typescript
// In MarketplaceHomepageView — BUG: key logic is broken (see Section 10, Bug #3)
const adSlotKey = `after${section.order}` as keyof typeof adSlots;
// adSlots keys are: afterHero, afterFeaturedProducts, afterReviews, afterFAQ
// section.order is a NUMBER (0, 1, 2...) so `after0`, `after1` never match the string keys
```

---

## 8. Carousel & Horizontal Slider System

### Component hierarchy

```
HeroCarousel
  └── CSS snap-scroll (flex overflow-x:auto scroll-snap-type:x mandatory)
      Dot nav with 4s progress-fill animation
      Arrow buttons bottom-right
      Returns null when slides.length === 0 (no fallback!)

SectionCarousel<T>
  └── HorizontalScroller<T>
        CSS classes: appkit-hscroller__*
        showArrows: true  → absolute-positioned ‹ › buttons
        snapToItems       → scroll-snap-align:start on items
        showFadeEdges     → gradient fade left/right
        showScrollbar:false → scrollbar-width:none

HorizontalScroller internals:
  Single-row mode (rows=1):
    Each item → <div class="appkit-hscroller__item flex-none" style="width:Npx flexShrink:0">
    width computed by ResizeObserver from perView config (phase-24.1 ✅)
  Grid mode (rows>1):
    Items grouped in slides of 6 (3×2 grid)
    Each slide → <div class="appkit-hscroller__slide grid grid-cols-1 sm:grid-cols-3"
                           style="width:100% flexShrink:0"> (phase-24.3 ✅)
```

### The perView prop — ✅ FIXED (phase-24.1)

`resolvePerView()` helper maps `PerViewConfig` breakpoints to container width.
`ResizeObserver` on the scroll container computes `itemWidth = (containerWidth - (n-1)*gap) / n`
and applies it as `style={{ width: itemWidth, flexShrink: 0 }}` on each item.

**Live site behavior**: 3 products visible at once, arrows scroll 3 at a time.
**Current build behavior**: Same — perView={base:1,sm:2,md:3} now respected.

### Carousel CSS — dark mode — ✅ FIXED (phase-24.2)

`HorizontalScroller.style.css` now uses `.dark .appkit-hscroller__arrow { ... }` and
`.dark .appkit-hscroller__fade--left/right { ... }` class selectors, matching Tailwind's
class-based dark mode. `@media (prefers-color-scheme: dark)` blocks removed.

---

## 9. Listing Pages — Filter / Search / Sort / Pagination — Reuse Appkit Components

### Component Architecture — Mobile & Desktop Both Coded

**All appkit listing components support both mobile and desktop automatically.**  
You do NOT need to write separate mobile code. Use these components:

| Component | Desktop | Mobile | When to Use |
|-----------|---------|--------|-------------|
| **`<ListingLayout>`** | Persistent sidebar + toolbar | Filter drawer + stacked toolbar | Public listing pages (products, auctions, stores, categories, etc.) |
| **`<SlottedListingView>`** | Manual toolbar assembly | Manual toolbar assembly | Admin dashboards, seller pages, custom layouts |
| **`<FilterDrawer>`** | N/A (inside ListingLayout) | Bottom drawer | Do NOT use directly — wrapped in ListingLayout |
| **`<SideDrawer>`** | Side panel | Full-screen modal | Edit/create forms (addresses, products, etc.) |

### Example: Using ListingLayout (Mobile + Desktop Automatic)

```tsx
// appkit/src/features/products/components/ProductsIndexListing.tsx
import { ListingLayout, SlottedListingView, Input, SortDropdown } from "@mohasinac/appkit/ui";

export function ProductsIndexListing() {
  const table = useUrlTable(...);
  const { products, total, totalPages, page, isLoading } = useProducts(...);

  return (
    <ListingLayout
      // Desktop: sticky toolbar with search, sort, view toggle
      // Mobile: two rows — [Filter Search] [Sort View]
      searchSlot={<Input placeholder="Search..." />}
      sortSlot={<SortDropdown options={...} />}
      
      // Desktop: left sidebar
      // Mobile: filter button → bottom drawer
      filterContent={<ProductFilters table={table} />}
      filterActiveCount={activeCount}
      onFilterApply={handleApply}
      onFilterClear={handleClear}
      
      // Rest of slots...
    >
      <ProductGrid products={products} />
    </ListingLayout>
  );
}
```

**What you get automatically:**

```
┌─ DESKTOP (lg+) ──────────────────────────────┐
│ [Filter ▼]  [Search...]  [Sort ▼]  [View]  │
├─────────┬──────────────────────────────────┤
│ Filter  │ ProductGrid (responsive cards)  │
│ panel   │                                  │
│ (sticky)│ Pagination ▼                     │
└─────────┴──────────────────────────────────┘

┌─ MOBILE (<lg) ────────────────────────────┐
│ [Filter ▼] [Search...] [Sort ▼] [View]   │
├────────────────────────────────────────────┤
│ ProductGrid (single column)                │
│                                            │
│ Pagination ▼                               │
│                                            │
│ (When filter button clicked → bottom drawer)│
└────────────────────────────────────────────┘
```

## 9. Listing Pages — Filter / Search / Sort / Pagination Regression

### What the live site has on every listing page

Every public listing page (auctions, products, pre-orders, stores, events) on the live site
shows a full interactive toolbar. Screenshot evidence from `/auctions`:

```
LIVE SITE — /auctions
══════════════════════════════════════════════════════════════════════
  Live Auctions
  Bid on unique items — auctions ending soon

  ┌───────────────────────────────────────────────────────────────┐
  │  [▼ Filters]  [  Search auctions...  ] [🔍]  Sort by [Ending Soonest ▾]  │
  └───────────────────────────────────────────────────────────────┘

  [No data found]
  [There are no items to display.]
══════════════════════════════════════════════════════════════════════
```

```
LOCAL DEV — /auctions
══════════════════════════════════════════════════════════════════════
  Live Auctions
  (no subtitle)

  (no toolbar at all — no filters, no search, no sort dropdown)

              🔨
    No live auctions right now
    Check back soon for new listings.
══════════════════════════════════════════════════════════════════════
```

Differences highlighted:
- **Subtitle** "Bid on unique items — auctions ending soon" — missing
- **[▼ Filters] button** — missing (should open a drawer with filter facets)
- **Search input** [Search auctions...] + [🔍] submit — missing
- **Sort dropdown** [Sort by: Ending Soonest ▾] — missing
- **Empty state copy** different ("No data found" vs "No live auctions right now")
- **Pagination** — missing (would show `‹ 1 2 3 ... › ` below the grid)

### Root cause

Every public listing page calls a simple server component from appkit that bypasses
the entire filter/search/sort infrastructure:

```tsx
// src/app/[locale]/auctions/page.tsx — current
export default function Page() {
  return <AuctionsListView />;   // plain server component, no toolbar
}

// appkit/src/features/auctions/components/AuctionsListView.tsx — current
export async function AuctionsListView() {
  const auctions = await productRepository.list({ ... });
  return (
    <Main>
      <Section>
        <Heading>Live Auctions</Heading>   // just a heading
        <MarketplaceAuctionGrid auctions={auctions} />  // just the grid
      </Section>
    </Main>
  );
}
// No search. No sort. No filters. No pagination. No subtitle.
```

The infrastructure to build the live-site toolbar EXISTS in appkit but is not wired:

```
appkit/src/ui/components/SlottedListingView.tsx
  Slots: renderHeader, renderSearch, renderSort, renderFilters,
         renderActiveFilters, renderBulkActions, renderTable, renderPagination
  Props: manageSearch, manageSort, inlineToolbar
  → Used by AuctionsView and ProductsView shells, which ARE also present
  → But neither shell is used by AuctionsListView or ProductsIndexPageView

appkit/src/features/products/components/AuctionsView.tsx
  → Extends SlottedListingView with manageSearch, manageSort, inlineToolbar
  → NEVER used (AuctionsListView bypasses it entirely)

appkit/src/features/products/components/ProductFilters.tsx
  Filter facets: category, condition, price range (₹0-₹500k slider), brand, seller, tags
  Sort options: Newest First, Price High→Low, Price Low→High, Title A-Z, Most Viewed
  → NEVER wired to any public listing page

appkit/src/features/filters/FilterPanel.tsx
  Declarative config-driven filter renderer (facet-single, facet-multi, range-number,
  range-date, switch types)
  Uses UrlTable interface (URL search params — filters reflected in URL)
  → NEVER used on public pages

appkit/src/ui/components/Pagination.tsx
  Smart ellipsis pagination: ‹ 1 2 3 ... 8 9 › with First/Last
  currentPage, totalPages, onPageChange
  → NEVER wired to any public listing page
```

### Affected listing pages

| Page | Current component | Missing from current |
|------|-------------------|---------------------|
| `/auctions` | `AuctionsListView` → `AuctionsIndexListing` ✅ | ✅ toolbar: search, sort, filters (ProductFilters), pagination (useUrlTable) |
| `/products` | `ProductsIndexPageView` → `ProductsIndexListing` ✅ | ✅ toolbar: search, sort, filters, pagination (useUrlTable) |
| `/pre-orders` | `PreOrdersListView` → `PreOrdersIndexListing` ✅ | ✅ toolbar: search, sort, pagination (phase 26.3) |
| `/stores` | `StoresIndexPageView` → `StoresIndexListing` ✅ | ✅ toolbar: search, sort, pagination (phase 26.4) |
| `/events` | appkit view (server) | filters, search, sort, pagination |
| `/categories` | `CategoriesIndexPageView` (server) | search, sort, pagination |
| `/blog` | appkit view (server) | search, category filter, pagination |
| `/reviews` | appkit view (server) | sort, filter by rating, pagination |
| `/search` | appkit view | may be functional — not verified |

### What the filter drawer should contain (ProductFilters)

```
FILTER DRAWER (slide-in from left on [▼ Filters] click)
┌────────────────────────┐
│  Filters          [×]  │
├────────────────────────┤
│  ▾ Category            │
│   ☐ Pokémon Cards      │
│   ☐ Sealed Products    │
│   ☐ Accessories        │
├────────────────────────┤
│  ▾ Condition           │
│   ☐ New                │
│   ☐ Used               │
│   ☐ Refurbished        │
│   ☐ Broken             │
├────────────────────────┤
│  ▾ Price Range         │
│  ₹ [0    ] — [500000]  │
│  ──●━━━━━━━━━━━━━━●──  │
├────────────────────────┤
│  ▾ Brand               │
│   ○ Ultra PRO          │
│   ○ Pokémon            │
├────────────────────────┤
│  ▾ Seller              │
│   ○ MistyWaterGym      │
└────────────────────────┘
```

### What the sort options should be

Auctions sort: Ending Soonest · Highest Bid · Lowest Starting Bid · Newest First
Products sort: Newest First · Price High→Low · Price Low→High · Title A-Z · Most Viewed

### Pagination component (built, unused)

```
[‹]  [1]  [2]  [3]  ...  [8]  [9]  [›]
     ^^^^ current page highlighted
```
Sizes: sm / md / lg. Smart ellipsis: collapses middle pages when >7 total.

---

## 10. Authenticated Pages — Slot-Shell Pattern & What's Empty

### The "Slot-Shell" architecture (and why everything is blank)

Every view in appkit is designed as a **render-prop shell**. The view manages layout and
state machinery; the consumer (letitrip.in) passes `renderXxx` props to fill slots with
actual content. Example:

```tsx
// appkit shell definition:
export function UserAccountHubView({ renderProfile, renderNav, renderRecentOrders }) {
  return (
    <StackedViewShell sections={[renderProfile?.(), renderNav?.(), renderRecentOrders?.()]} />
  );
}

// letitrip.in page — passes NOTHING:
export default function Page() {
  return <UserAccountHubView />;   // ← all slots are undefined → renders nothing
}
```

This pattern is repeated across **every** user/seller/admin page. The pages call the
appkit views with zero props, so every slot returns `undefined`, and the user sees only
a page-level layout chrome with empty content.

### User dashboard — slot status

| Page | Component | Slots required | Status |
|------|-----------|----------------|--------|
| `/user` | `UserAccountHubView` | renderProfile, renderNav, renderRecentOrders | ❌ All empty |
| `/user/profile` | `ProfileView` | renderStats, renderActions | ❌ All empty |
| `/user/orders` | `UserOrdersView` | renderTable | ❌ Empty table (returns null) |
| `/user/wishlist` | `WishlistView` | renderProducts, renderTabs, renderSearch, renderSort | ❌ Has data logic, no display |
| `/user/addresses` | `UserAddressesView` | renderList, renderForm | ❌ Empty |
| `/user/settings` | `UserSettingsView` | renderSections | ❌ Empty |
| `/user/notifications` | `UserNotificationsView` | renderItems, renderTabs | ❌ Empty |
| `/user/messages` | `MessagesView` | renderChatList, renderChatWindow | ❌ Empty |
| `/user/offers` | `UserOffersView` | renderItems | ❌ Empty |
| `/user/become-seller` | `BecomeSellerView` | renderForm | ❌ Empty (or stub form) |

**Visual:** What `UserAccountHubView` renders with no props:

```
LOCAL /user
══════════════════════════════════════════
  [page layout chrome — header + footer]

  (blank content area — all render slots
   return undefined → StackedViewShell
   renders zero sections)
══════════════════════════════════════════

LIVE /user
══════════════════════════════════════════
  [sidebar: Orders · Wishlist · Addresses
            Messages · Offers · Settings
            Become a Seller]

  [profile card: avatar, name, email,
   member since date]

  [recent orders list: last 3 orders
   with status badge + track link]

  [quick stats: total orders, wishlist
   items, active offers]
══════════════════════════════════════════
```

### WishlistView — data exists, nothing renders

`WishlistView` is a special case: it has real data-fetching logic (`useWishlist` hook,
client-side filter + sort), manages its own state (`activeTab`, `search`, `sort`,
`viewMode`, `selectedIds`), BUT all display is behind render props:

```tsx
// WishlistView renders:
renderTabs?.(activeTab, setActiveTab)       // ← undefined → no tab bar
renderSearch?.(search, setSearch)            // ← undefined → no search
renderSort?.(sort, setSort)                  // ← undefined → no sort
renderProducts?.(displayedItems, isLoading) // ← undefined → no grid!
renderPagination?.(total)                    // ← undefined → no pages
```

User sees a "My Wishlist" heading and a loading state, then nothing.

### Seller dashboard — all slots empty

```
LOCAL /seller
══════════════════════════════════════════
  [Seller Dashboard heading only]
  (no stats, no revenue chart, no quick
   actions, no recent listings, nothing)
══════════════════════════════════════════

LIVE /seller
══════════════════════════════════════════
  [Sidebar: Products · Orders · Auctions
            Analytics · Coupons · Offers
            Store · Payouts · Shipping]

  [Stats row: Total Sales ₹X · Orders N
              Active Listings N · Rating ★]

  [Revenue chart: line chart (Recharts)]

  [Top Products table: title, sales, rev]

  [Recent Orders list with status badges]
══════════════════════════════════════════
```

| Page | Component | Self-contained? | Local status |
|------|-----------|-----------------|--------------|
| `/seller` | `SellerDashboardView` | ❌ All slots | ❌ Empty shell |
| `/seller/products` | `SellerProductsView` | ✅ Has own fetch + table | ⚠️ Partially works |
| `/seller/orders` | `SellerOrdersView` | ✅ Has own fetch + table | ⚠️ Partially works |
| `/seller/analytics` | `SellerAnalyticsView` | ❌ Slots: renderStats, renderChart | ❌ Empty |
| `/seller/store` | `SellerStoreView` | ❌ Slots: renderForm | ❌ Empty |
| `/seller/coupons` | `SellerCouponsView` | ⚠️ Mixed | ⚠️ Partial |
| `/seller/payouts` | `SellerPayoutsView` | ⚠️ Mixed | ⚠️ Partial |
| `/seller/auctions` | `SellerAuctionsView` | ⚠️ Mixed | ⚠️ Partial |
| `/seller/offers` | `SellerOffersView` | ❌ Slots | ❌ Empty |
| `/seller/shipping` | `SellerShippingView` | ❌ Slots | ❌ Empty |

### Admin dashboard — partially functional

`AdminDashboardView` is the exception — it has self-contained data fetching:

```tsx
// AdminDashboardView fetches own data and renders DashboardStatsGrid
const query = useQuery({ queryKey: ["admin-dashboard"], queryFn: ... });
// Stats grid renders with or without renderStats prop
<DashboardStatsGrid stats={resolvedStats} isLoading={busy} />
```

**What works locally:** Stats cards (total users, orders, products) IF the API returns data.  
**What's empty:** `renderQuickActions`, `renderCharts`, `renderRecentActivity` — all undefined.

| Admin page | Component | Local status |
|------------|-----------|--------------|
| `/admin/dashboard` | `AdminDashboardView` | ⚠️ Stats only, no charts/actions |
| `/admin/users` | `AdminUsersView` | ⚠️ Partial — has fetch + table scaffold |
| `/admin/products` | `AdminProductsView` | ⚠️ Partial — has fetch + table scaffold |
| `/admin/orders` | `AdminOrdersView` | ⚠️ Partial — has fetch + table scaffold |
| `/admin/analytics` | `AdminAnalyticsView` | ❌ Empty (renderCharts slot) |
| `/admin/payouts` | `AdminPayoutsView` | ⚠️ Partial |
| `/admin/blog` | `AdminBlogView` | ⚠️ Partial |
| `/admin/carousel` | `AdminCarouselView` | ⚠️ Partial |
| `/admin/sections` | `AdminSectionsView` | ⚠️ Partial |
| `/admin/site` | `AdminSiteView` | ❌ Empty (renderForm slot) |
| `/admin/ads` | `AdminAdsView` | ❌ Placeholder |

---

## 11. Cart & Checkout — Broken Implementation

### Cart — guest-only, no real cart integration

`src/components/routing/CartRouteClient.tsx` uses `useGuestCart` (localStorage-based
anonymous cart) instead of the authenticated cart API:

```
CURRENT CartRouteClient behavior:
  ┌────────────────────────────────────────┐
  │  Cart                                  │
  │  [CartItemRow × N from localStorage]  │
  │  Subtotal: ₹X (calculated client-side) │
  │  [Checkout →]                          │
  └────────────────────────────────────────┘
  useGuestCart() — localStorage only
  NO: authenticated user cart from /api/cart
  NO: coupon code input
  NO: promo/discount display
  NO: address pre-selection
  NO: estimated delivery date
  NO: seller grouping (multi-seller orders)
  NO: cart merge on login
```

```
LIVE SITE cart:
  ┌────────────────────────────────────────┐
  │  Cart (N items)                        │
  │  ┌──────────────────────────────────┐  │
  │  │ [img] Product name       ₹1,499  │  │
  │  │ Seller: MistyWaterGym    [- 1 +] │  │
  │  │ [Remove] [Save for later]        │  │
  │  └──────────────────────────────────┘  │
  │  ┌──────────────────────┐              │
  │  │ Coupon [________][→] │              │
  │  └──────────────────────┘              │
  │  Subtotal:          ₹1,499             │
  │  Shipping:          ₹99               │
  │  Coupon discount:   -₹0               │
  │  ─────────────────────                │
  │  Total:             ₹1,598            │
  │  [Proceed to Checkout →]              │
  └────────────────────────────────────────┘
```

### Checkout — explicit placeholder stub

`src/components/routing/CheckoutRouteClient.tsx` is a placeholder with hardcoded inputs.
The code itself has a comment acknowledging this:

```tsx
// From CheckoutRouteClient.tsx:
<Text className="text-sm text-zinc-600">
  This route is now wired to appkit checkout shell;
  transactional bindings are next.    // ← explicit acknowledgement it's a stub
</Text>
```

```
CURRENT checkout:
  ┌─────────────────────────────────┐
  │  Checkout                       │
  │  Step 1 of 3                    │
  │  ┌─────────────────────────┐    │
  │  │  Shipping               │    │
  │  │  [Full name          ]  │    │
  │  │  [Phone number       ]  │    │
  │  │  [Address line       ]  │    │
  │  │  "transactional         │    │
  │  │   bindings are next"    │    │
  │  └─────────────────────────┘    │
  │  ┌─────────────────┐            │
  │  │  Order Summary  │            │
  │  │  No checkout    │            │
  │  │  items yet.     │            │
  │  │  [Place Order]  │  ← does   │
  │  └─────────────────┘    nothing │
  └─────────────────────────────────┘
  NO: address from user's saved addresses
  NO: Razorpay payment integration
  NO: order review step with real items
  NO: coupon validation at checkout
  NO: shipping cost calculation
  NO: place order API call
```

```
LIVE checkout:
  ┌───────────────────────────────────────────┐
  │  Checkout                                 │
  │  ●──────●──────●                          │
  │  Address Payment  Review                  │
  │                                           │
  │  [Saved addresses list]                   │
  │  [+ Add new address]                      │
  │                                           │
  │  ──────────────────────────               │
  │  [Continue to Payment →]                  │
  │                                           │
  │  [Order Summary card — live items + total]│
  └───────────────────────────────────────────┘
  Step 2 → Razorpay modal opens
  Step 3 → Review + confirm
  On place order → POST /api/checkout + /api/payment/create-order
```

### What needs to be wired

| Feature | Required | Currently |
|---------|----------|-----------|
| Authenticated cart from `/api/cart` | Yes | `useGuestCart` only |
| Cart merge on login | Yes | Not implemented |
| Coupon code field | Yes | Missing |
| Multi-seller grouping | Yes | Missing |
| Shipping cost display | Yes | Missing |
| Saved addresses at checkout | Yes | Hardcoded inputs |
| Razorpay modal integration | Yes | `[Place Order]` does nothing |
| Order creation API call | Yes | Not connected |
| Checkout success redirect | Yes | `CheckoutSuccessRouteClient` is also a stub |

---

## 12. Live Site vs Current Build — Master Gap Table

### Why the homepage is blank locally

The homepage is 100% database-driven. A fresh environment has no Firestore data:
- `carousel_slides` collection → empty → HeroCarousel returns `null` (no fallback)
- `homepage_sections` collection → empty → zero sections render

```
LIVE SITE (seeded Firestore)         LOCAL DEV (empty Firestore)
══════════════════════════           ════════════════════════════
 Announcement Bar                     Announcement Bar (fallback text)
 Hero Carousel (5 slides)         ✗   [placeholder "Coming Soon" banner]
 "Pokémon Base Set 151" section   ✗   [nothing]
 Shop by Type section             ✗   [nothing]
 Stats (4 counters)               ✗   [nothing]
 Trust Indicators                 ✗   [nothing]
 How It Works                     ✗   [nothing]
 Shop by Category scroller        ✗   [nothing]
 Shop by Brand scroller           ✗   [nothing — brands unrenderable]
 Featured Products scroller       ✗   [nothing]
 Live Auctions scroller           ✗   [nothing]
 Pre-Orders scroller              ✗   [nothing]
 Top Stores scroller              ✗   [nothing]
 Events section                   ✗   [nothing]
 Customer Reviews scroller        ✗   [nothing]
 Security section                 ✗   [nothing]
 FAQ (empty on live too)          ✗   [nothing]
 Newsletter section               ✗   [nothing]
 Blog Articles scroller           ✗   [nothing]
 Features bar / footer            ✅  footer renders
```

### Carousel cards-per-view regression

```
LIVE SITE                              CURRENT BUILD (phase-24.1 ✅)
─────────────────────────────          ─────────────────────────────────────────
Featured Products section:             Featured Products section:
  ┌──────┐ ┌──────┐ ┌──────┐  ←→       ┌──────┐ ┌──────┐ ┌──────┐  ←→
  │ card │ │ card │ │ card │            │ card │ │ card │ │ card │
  │      │ │      │ │      │            │      │ │      │ │      │
  └──────┘ └──────┘ └──────┘           └──────┘ └──────┘ └──────┘
  3 visible, arrows scroll by 3        perView={base:1,sm:2,md:3} respected.
  18 cards total = 6 "pages"           ResizeObserver calculates item width.
```

### Product page gallery regression

```
LIVE SITE                              CURRENT BUILD
─────────────────────────────          ────────────────────────────
Product gallery:                       Product gallery:
  ┌──────────────────────┐               ┌──────────────────────┐
  │  [main image]        │               │  [background-image   │
  │  clickable → opens   │               │   CSS div]           │
  │  full-screen         │               │  NOT clickable       │
  │  lightbox            │               │  NO lightbox         │
  └──────────────────────┘               └──────────────────────┘
  ┌──┐ ┌──┐                             (no thumbnails)
  │T1│ │T2│  thumbnail strip
  └──┘ └──┘
  "1 / 2" counter

Lightbox (on click):                   No lightbox exists on this page.
  ┌─────────────────────────┐          ImageLightbox component EXISTS in
  │ [X]         "1 / 2"    │          appkit/src/ui/components/ but is
  │                         │          NOT imported or used anywhere in
  │ [‹]  [image full]  [›] │          ProductDetailPageView.tsx
  │                         │
  │         🔍 scroll zoom  │
  └─────────────────────────┘
```

### Full section comparison table

| Section / Feature | Live Site | Current Build | Root Cause |
|-------------------|-----------|---------------|------------|
| **LISTING PAGES** | | | |
| Auctions: subtitle | ✅ "Bid on unique items" | ✅ Done (phase 26.1) | AuctionsIndexListing wired |
| Auctions: filter drawer | ✅ [▼ Filters] button | ✅ Done (phase 26.1) | ProductFilters wired via useUrlTable |
| Auctions: search bar | ✅ [Search auctions...] | ✅ Done (phase 26.1) | SlottedListingView manageSearch |
| Auctions: sort dropdown | ✅ [Ending Soonest ▾] | ✅ Done (phase 26.1) | SlottedListingView manageSort |
| Products: filter/search/sort | ✅ | ✅ Done (phase 26.2) | ProductsIndexListing wired |
| All listing pages: pagination | ✅ ‹ 1 2 3 ... › | ✅ Done (phase 26.1–26.4) | Pagination in all Index*Listing via useUrlTable.setPage |
| Filter: category facets | ✅ | ✅ Done (phase 26.1–26.2) | ProductFilters.tsx wired in auctions+products |
| Filter: price range slider | ✅ ₹0–₹500k | ✅ Done (phase 26.1–26.2) | RangeFilter wired via ProductFilters |
| Filter: condition/brand/tags | ✅ | ✅ Done (phase 26.1–26.2) | ProductFilters handles all facets |
| Filter URL persistence | ✅ params in URL | ✅ Done (phase 26) | useUrlTable uses router.replace for all filter changes |
| **CART & CHECKOUT** | | | |
| Cart: authenticated items | ✅ From `/api/cart` | ✅ Done (phase 28.1) | useCartQuery + useAuth; guest cart merges on login |
| Cart: coupon code input | ✅ | ✅ Done (phase 28.2) | POST /api/cart/coupon + coupon input with Apply/Remove UX; discount shown in breakdown |
| Cart: multi-seller grouping | ✅ | ✅ Done (phase 28.3) | groupBySeller() groups items by sellerId; seller headers shown when multi-seller |
| Cart: shipping cost estimate | ✅ | ✅ Done (phase 28.3) | "Calculated at checkout" placeholder in CartSummary breakdown |
| Checkout: saved addresses | ✅ | ✅ Done (phase 28.4) | CheckoutAddressStep + useAddresses; renders address cards |
| Checkout: Razorpay modal | ✅ | ✅ Done (phase 28.5) | create-order → loadRazorpayScript → openRazorpayModal → verify |
| Checkout: order creation API | ✅ | ✅ Done (phase 28.6) | POST /api/payment/verify + /api/checkout (COD); redirects to /checkout/success |
| Checkout: steps (3) | ✅ Address → Payment → Review | ✅ Done (phase 28.4–28.6) | Address → OTP → Payment with real handlers |
| **USER DASHBOARD** | | | |
| `/user` hub page | ✅ Profile + nav + recent orders | ❌ Empty shell | No render props passed |
| `/user/profile` | ✅ Stats + edit form | ❌ Empty shell | No render props passed |
| `/user/orders` | ✅ Order list + search | ❌ Empty (renderTable=null) | renderTable not passed |
| `/user/wishlist` | ✅ Grid + tabs + search + sort | ❌ Has data, no display | renderProducts not passed |
| `/user/addresses` | ✅ Address list + add form | ❌ Empty shell | No render props passed |
| `/user/settings` | ✅ Password, account, sessions | ❌ Empty shell | No render props passed |
| `/user/notifications` | ✅ Notification list + tabs | ❌ Empty shell | No render props passed |
| `/user/messages` | ✅ Chat list + window | ❌ Empty shell | No render props passed |
| User sidebar nav | ✅ All sections linked | ❌ Missing / empty | UserSidebar not wired |
| **SELLER DASHBOARD** | | | |
| `/seller` dashboard | ✅ Stats + chart + actions | ❌ Empty shell | All render slots unimplemented |
| `/seller/products` | ✅ Table + search + create | ⚠️ Partial (has own fetch) | renderHeader not passed |
| `/seller/orders` | ✅ Table + status | ⚠️ Partial | Similar |
| `/seller/analytics` | ✅ Revenue chart + metrics | ❌ Empty shell | renderStats/renderChart not passed |
| `/seller/store` | ✅ Store setup form | ❌ Empty shell | renderForm not passed |
| Seller sidebar nav | ✅ Full menu | ❌ Not assembled | SellerSidebar not wired |
| **ADMIN** | | | |
| `/admin/dashboard` | ✅ Full stats + charts + activity | ⚠️ Stats only, no charts | renderCharts/renderRecentActivity empty |
| `/admin/users` | ✅ Table + search + edit | ⚠️ Partial | Has table scaffold |
| `/admin/analytics` | ✅ Charts + metrics | ❌ Empty | renderCharts not passed |
| `/admin/site` | ✅ Site settings form | ❌ Empty | renderForm not passed |
| Admin sidebar | ✅ Full menu | ⚠️ Present but not fully wired | AdminSidebar exists |
| **HOMEPAGE** | | | |
| Announcement bar | ✅ Custom text from DB | ⚠️ Hardcoded fallback | No site_settings doc |
| Hero carousel 5 slides | ✅ | ❌ Invisible (returns null) | No carousel_slides docs |
| Hero carousel fallback | N/A | ✅ Done (phase-24.4) | Placeholder banner with "Coming Soon" |
| Welcome section | ✅ | ❌ | No homepage_sections doc |
| Stats section | ✅ | ❌ | No doc or empty stats array |
| Trust indicators | ✅ | ❌ | No doc |
| How It Works | ✅ | ❌ | No doc |
| Shop by Category | ✅ HScroller | ❌ | No doc |
| Shop by Brand | ✅ | ✅ Done (phase-24.7) | BrandsSection + case "brands": added |
| Featured Products | ✅ 3 per view | ✅ Done (phase-24.1) | perView now uses ResizeObserver |
| Live Auctions | ✅ | ❌ | No doc |
| Pre-Orders | ✅ | ❌ | No doc |
| Top Stores | ✅ | ❌ | No doc |
| Events | ✅ | ❌ | No doc |
| Customer Reviews | ✅ | ❌ | No doc |
| Security section | ✅ | ❌ | No doc |
| FAQ section | ⚠️ Empty on live | ✅ Done (phase-24.6) | faqsRepository.getHomepageFAQs() wired |
| Newsletter | ✅ | ❌ | No doc |
| Blog Articles | ✅ | ❌ | No doc |
| Pre-footer trust strip | ✅ 5 icons | ✅/❌ | Depends on appkit component |
| Product gallery + lightbox | ✅ | ✅ Done (phase-25.1) | ProductGalleryClient: <img> + ImageLightbox |
| Product thumbnails | ✅ | ✅ Done (phase-25.2) | Thumbnail strip + counter in ProductGalleryClient |
| Product sticky buy bar | ✅ | ✅ Done (phase-25.5) | BuyBar sibling, lg:hidden |
| Product tabs (desc/specs) | ✅ | ✅ Done (phase-25.3) | ProductTabsShell: desc/specs/reviews |
| Related products section | ✅ | ✅ Done (phase-25.4) | RelatedProducts + ProductGrid (same category) |
| HScroller: 3 cards at once | ✅ | ✅ Done (phase-24.1) | perView ResizeObserver implemented |
| HScroller: dark mode arrows | ✅ | ✅ Done (phase-24.2) | .dark class selectors added |
| Ad slots | ⚠️ Placeholder | ✅ Done (phase-24.5) | AD_SLOT_MAP[section.type] key lookup |

---

## 13. Regression Catalog — Specific Bugs

### BUG 0 — All listing pages: no search, filter, sort, or pagination toolbar

**Files:**
- `appkit/src/features/auctions/components/AuctionsListView.tsx`
- `appkit/src/features/products/components/ProductsIndexPageView.tsx`
- (and equivalent views for pre-orders, stores, events, blog, reviews)

Every public listing page is a bare server component that renders only a `<Heading>` and
a grid. The full toolbar infrastructure is completely bypassed:

```
AuctionsListView (current):          AuctionsListView (should be):
  <Main>                               <AuctionsView    ← use this shell
    <Heading>Live Auctions</Heading>     title="Live Auctions"
    <MarketplaceAuctionGrid />           subtitle="Bid on unique items..."
  </Main>                               renderSearch={...}
                                         renderSort={...}
No subtitle, no search,                  renderFilters={...}
no sort, no pagination.                  renderPagination={...}
                                       />
```

**Components that exist but are unused:**

| Component | Path | Purpose |
|-----------|------|---------|
| `AuctionsView` | `appkit/src/features/products/components/AuctionsView.tsx` | Auction toolbar shell (manageSearch + manageSort + inlineToolbar) |
| `ProductsView` | `appkit/src/features/products/components/ProductsView.tsx` | Products toolbar shell |
| `ProductFilters` | `appkit/src/features/products/components/ProductFilters.tsx` | Full filter panel (category, condition, price, brand, seller, tags) |
| `FilterPanel` | `appkit/src/features/filters/FilterPanel.tsx` | Declarative config-driven filters with URL param persistence |
| `Pagination` | `appkit/src/ui/components/Pagination.tsx` | Smart ellipsis page nav ‹ 1 2 3 … › |
| `SlottedListingView` | `appkit/src/ui/components/SlottedListingView.tsx` | Base shell with renderSearch/renderSort/renderFilters/renderPagination slots |

**Effect:** Users cannot search, filter, or sort any listings. Results are hardcoded to
page 1 / 24 items. No way to navigate to further pages.

> ✅ Fixed phase 26 — All 4 listing pages now use Index*Listing client components (AuctionsIndexListing, ProductsIndexListing, PreOrdersIndexListing, StoresIndexListing) with useUrlTable + SlottedListingView full toolbar. ProductFilters + Pagination wired via useUrlTable URL-backed state.

---

### BUG 1 — HorizontalScroller: `perView` prop is discarded

**File:** `appkit/src/ui/components/HorizontalScroller.tsx` line 67

```tsx
void perView;  // BUG: prop is accepted in interface but never used
```

**Effect:** All carousels show every card simultaneously. With `minItemWidth=220`, a 1200px
container shows ~5 cards at once instead of 3. The responsive breakpoint config
`{base:1, sm:2, md:3}` is completely ignored.

**Fix needed:** Implement `perView` to calculate item `width` as:
```
itemWidth = (containerWidth - (perView - 1) * gap) / perView
```
This must be reactive to viewport width (use `ResizeObserver`), matching the current
breakpoint from the `PerViewConfig` object.

> ✅ Fixed phase-24.1 — resolvePerView() helper + ResizeObserver calculates itemWidth per breakpoint

---

### BUG 2 — HeroCarousel: returns null when no slides, no fallback

**File:** `appkit/src/features/homepage/components/HeroCarousel.tsx` line 97-99

```tsx
if (!slides || slides.length === 0) {
  return null;  // BUG: leaves a blank gap in the layout locally
}
```

**Effect:** Locally (unseeded Firestore), the hero area is completely invisible. The page
looks broken with a large gap between the announcement bar and whatever renders below.

**Fix needed:** Return a static placeholder/skeleton banner when `slides.length === 0`.

> ✅ Fixed phase-24.4 — Returns branded placeholder with "Coming Soon" text matching heroMinH height

---

### BUG 3 — Ad slot key logic never matches

**File:** `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` line 137

```tsx
const adSlotKey = `after${section.order}` as keyof typeof adSlots;
// Produces: "after0", "after1", "after2"...
// adSlots keys are: "afterHero", "afterFeaturedProducts", "afterReviews", "afterFAQ"
// These never match → no ad slot ever renders
```

**Effect:** The four ad slots passed from `src/app/[locale]/page.tsx` are never injected
into the page, even if configured.

**Fix needed:** Map section type to the correct slot key, not section order:
```tsx
const AD_SLOT_MAP: Record<string, keyof MarketplaceHomepageViewAdSlots> = {
  products: "afterFeaturedProducts",
  reviews: "afterReviews",
  faq: "afterFAQ",
};
const adSlotKey = AD_SLOT_MAP[section.type];
// The `afterHero` slot should be injected after the HeroCarousel directly,
// not via the section loop.
```

> ✅ Fixed phase-24.5 — AD_SLOT_MAP[section.type] replaces after${section.order}; afterHero already wired directly

---

### BUG 4 — FAQ section always renders with empty data

**File:** `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` lines 326-333

```tsx
case "faq": {
  return (
    <FAQSection
      tabs={[]}       // BUG: hardcoded empty
      activeTab=""    // BUG: hardcoded empty
      items={[]}      // BUG: hardcoded empty
      ...
    />
  );
}
```

**Effect:** The FAQ section renders on the homepage (when the `faq` doc exists in DB with
`showOnHomepage: true`) but always shows "No data available".

**Fix needed:** Fetch FAQ data from `faqRepository.getHomepageFAQs()` inside
`MarketplaceHomepageView` before rendering, and pass real items/tabs.

> ✅ Fixed phase-24.6 — faqsRepository.getHomepageFAQs() fetched in parallel; items mapped and passed to FAQSection

---

### BUG 5 — `brands` section type has no render case

**File:** `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` — switch statement

The `brands` type is in the schema and can be created via admin. The `renderSection()`
switch falls through to `default: return null`. Any brands section saved to Firestore is
silently dropped without any console warning.

**Fix needed:** Either add a `case "brands":` with a BrandsCarousel component, or
remove the type from the admin UI and schema.

> ✅ Fixed phase-24.7 — BrandsSection.tsx created (uses useTopBrands hook); case "brands": added to switch

---

### BUG 6 — ProductDetailPageView: no gallery, no lightbox, no tabs

**File:** `appkit/src/features/products/components/ProductDetailPageView.tsx`

Current gallery render:
```tsx
renderGallery={() =>
  primaryImage ? (
    <Div
      role="img"
      className="aspect-square w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${primaryImage})` }}  // BUG: CSS bg, not img
    />
  ) : null
}
```

**Missing vs live site:**
- Image rendered as CSS `background-image` instead of `<img>` tag (no lightbox events)
- No thumbnail strip for multiple images
- No image counter ("1 / 2")
- `ImageLightbox` component exists at `appkit/src/ui/components/ImageLightbox.tsx` but
  is never imported or used
- `renderTabs` slot is never populated (no Specifications, Description, Reviews tabs)
- `renderRelated` slot is never populated (no "You might also like")
- Action rail has basic Add to Cart button only — no Buy Now, no actual cart integration
- No sticky buy bar on scroll (BuyBar component exists in appkit but not wired)

**Fix needed:**
1. Replace CSS `background-image` div with a proper image gallery component
2. Add `ImageLightbox` with `useState` for open/index tracking
3. Add thumbnail strip for `images.slice(1)`
4. Wire `renderTabs` to Specifications / Description / Reviews
5. Wire `renderRelated` to `RelatedProducts` component
6. Wire `BuyBar` for mobile sticky actions

> ✅ Fixed phase 25 — ProductGalleryClient (<img> + thumbnail strip + ImageLightbox);
> ProductTabsShell (desc/specs/reviews); RelatedProducts + ProductGrid wired;
> BuyBar sibling for mobile sticky actions (lg:hidden)

---

### BUG 7 — HorizontalScroller dark mode: wrong CSS mechanism

**File:** `appkit/src/ui/components/HorizontalScroller.style.css` lines 71-79, 102-108

```css
@media (prefers-color-scheme: dark) {  /* BUG: uses OS-level media query */
  .appkit-hscroller__arrow { ... }
  .appkit-hscroller__fade--left { background: linear-gradient(to right, #111827, transparent); }
}
```

The app uses **Tailwind class-based** dark mode (adding `dark` class to `<html>`).
The CSS media query fires based on OS preference, NOT the in-app dark mode toggle.

**Effect:** When the user toggles dark mode in the app without changing their OS setting:
- Arrow buttons remain white-on-white background (invisible)
- Fade edges show white gradient against dark bg (looks broken)

**Fix needed:** Remove `@media (prefers-color-scheme: dark)` blocks and replace with
`.dark .appkit-hscroller__arrow { ... }` and `.dark .appkit-hscroller__fade--left { ... }`.

> ✅ Fixed phase-24.2 — @media (prefers-color-scheme: dark) replaced with .dark class selectors throughout

---

### BUG 8 — Grid mode slides lack explicit width

**File:** `appkit/src/ui/components/HorizontalScroller.tsx` lines 118-130

In grid mode (`rows > 1`), each slide group renders:
```tsx
<div className="appkit-hscroller__slide grid grid-cols-1 sm:grid-cols-3 gap-4">
  {/* 6 cards */}
</div>
```

This slide div has `flex: none` (from `appkit-hscroller__item`) but no width. In the
flex scroll container it will size to content rather than `100%` of the container, so
scrolling by `containerWidth * 0.8` may land mid-slide.

**Fix needed:** Add `width: 100%` or `flex: 0 0 100%` to `appkit-hscroller__slide`.

> ✅ Fixed phase-24.3 — style={{ width: "100%", flexShrink: 0 }} added to slide wrapper div

---

## 14. Product Detail Page — Full Breakdown

### What the live site has

```
3-column layout (grid-3 via DetailViewShell):

COL 1 — Gallery:          COL 2 — Info:            COL 3 — Actions (sticky):
  - Main image             - Title h1                - Price
  - Click → lightbox       - [In Stock] badge        - [Add to Cart] primary btn
  - Thumbnail strip        - Stock count             - [Buy Now] secondary btn
  - "N / total" counter    - ⚡ Faster Delivery      - [♡ Wishlist] ghost btn
                           - Price ₹X,XXX.XX
                           - Seller: [store link]   BELOW FOLD:
                           - Tags: #tag #tag         - ProductTabs (tabbed):
                                                       Description
                                                       Specifications
                                                       Delivery & Returns
                                                       Reviews
                                                     - RelatedProducts carousel
```

### What the current build has (after phase 25)

```
3-column layout (structure correct):

COL 1 — Gallery (✅ fixed):   COL 2 — Info:            COL 3 — Actions:
  - <img> tag ✅               - Title h1                - Price
  - Click → ImageLightbox ✅   - Price                   - [Add to Cart]
  - Thumbnail strip ✅         - Description (RichText)  - [Add to Wishlist]
  - "N / M" counter ✅         - Seller name

BELOW FOLD (✅ fixed):
  - ProductTabsShell: Description / Specifications / Reviews tabs ✅
  - RelatedProducts carousel (same category, 4 items max) ✅
  - BuyBar (mobile sticky, price + Add to Cart, lg:hidden) ✅
```

### Required components (all now wired)

| Component | Path | Status |
|-----------|------|--------|
| `ImageLightbox` | appkit/src/ui/components/ImageLightbox.tsx | ✅ Used via ProductGalleryClient |
| `ProductGalleryClient` | appkit/src/features/products/components/ProductGalleryClient.tsx | ✅ Created phase 25.1 |
| `ProductTabsShell` | appkit/src/features/products/components/ProductTabsShell.tsx | ✅ Created phase 25.3 |
| `RelatedProducts` | appkit/src/features/products/components/RelatedProducts.tsx | ✅ Wired phase 25.4 |
| `BuyBar` | appkit/src/features/products/components/BuyBar.tsx | ✅ Wired phase 25.5 |
| `ReviewsList` | appkit/src/features/reviews/components/ReviewsList.tsx | ✅ Wired in tabs phase 25.3 |

---

## 15. Data Flow Diagrams

### Homepage section render flow

```
src/app/[locale]/page.tsx
  └─ <MarketplaceHomepageView>   (appkit server component, ISR 120s)
        │
        ├─ carouselRepository.getActiveSlides()
        │    └─ Firestore: carousel_slides WHERE active=true ORDER BY order LIMIT 5
        │
        ├─ siteSettingsRepository.getSingleton()
        │    └─ Firestore: site_settings/singleton
        │
        └─ homepageSectionsRepository.getEnabledSections()
             └─ Firestore: homepage_sections WHERE enabled=true ORDER BY order
                  │
                  └─ renderSection(section, adSlots, newsletterFormSlot)
                       └─ switch(section.type) → one of 16 components
```

### Product purchase flow

```
User              Browser                 Next.js API          Firestore    Razorpay
 │                   │                        │                    │            │
 │── Add to cart ───>│                        │                    │            │
 │                   │── POST /api/cart ─────>│── write cart ─────>│            │
 │── Checkout ──────>│                        │                    │            │
 │                   │── POST /api/checkout   │                    │            │
 │                   │   /preflight ─────────>│── read products ──>│            │
 │                   │── POST /api/payment/   │                    │            │
 │                   │   create-order ───────>│────────────────────────────────>│
 │                   │<── { orderId, amount } │                    │<── order ──│
 │<── Razorpay modal─│                        │                    │            │
 │── Pay ────────────────────────────────────────────────────────────────────>  │
 │                   │<── POST /api/payment/verify (client-side)               │
 │                   │── verify HMAC sig      │                    │            │
 │                   │── write order ────────>│                    │            │
 │<── Order confirmed│                        │                    │            │
```

### Live auction bid flow

```
User A           Next.js API        Firebase RTDB          User B
  │                  │                   │                     │
  │── GET /realtime/ │                   │                     │
  │   token ────────>│                   │                     │
  │<── JWT ──────────│                   │                     │
  │── Subscribe RTDB ──────────────────>│                     │
  │── POST /api/bids>│── write bid ─────>│── push event ──────>│
  │<── confirmed ────│                   │                     │
```

---

## 16. API Routes Reference

All routes use Firebase Admin SDK. No client-side Firestore.

### Auth

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/login` | Rate-limited |
| POST | `/api/auth/register` | Creates Firebase Auth user |
| POST | `/api/auth/forgot-password` | Sends reset email (Resend) |
| POST | `/api/auth/google/start` | Google OAuth |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/logout` | Clears `__session` cookie |

### Products & Commerce

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/products` | No |
| GET | `/api/products/[id]` | No |
| POST | `/api/products` | Admin/seller |
| GET | `/api/categories` | No |
| GET | `/api/cart` | User |
| POST | `/api/cart` | User |
| POST | `/api/checkout/preflight` | User |
| POST | `/api/payment/create-order` | User |
| POST | `/api/payment/verify` | User |
| POST | `/api/payment/webhook` | Razorpay |

### Content

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/carousel` | Active slides |
| POST | `/api/carousel` | Admin only |
| GET | `/api/homepage-sections` | Enabled sections |
| GET | `/api/blog` | Blog posts |
| GET | `/api/search` | Global search |

### Admin (all require admin role)

`/api/admin/dashboard` · `/api/admin/users` · `/api/admin/orders`
`/api/admin/products` · `/api/admin/analytics` · `/api/admin/payouts/weekly`

### Seller (all require seller role)

`/api/seller/products` · `/api/seller/orders` · `/api/seller/analytics`
`/api/seller/store` · `/api/seller/payouts`

---

## 17. Authentication & Security

### Session cookie

- Name: `__session` (httpOnly, secure, sameSite: strict)
- Duration: 5 days
- Signing: `HMAC_SECRET`
- Validated server-side on every request

### Firestore rules

Rules are **auto-generated** — do NOT edit `firestore.rules` manually:
```bash
npm run firebase:generate   # regenerates from appkit scripts
```

### Rate limiting

- Auth endpoints: Upstash Redis AUTH preset
- API mutation routes: per-route custom limits
- All limits keyed by IP + user ID

---

## 18. Development Workflow

### Scripts

```bash
npm run dev                    # Start dev server (:3000)
npm run watch:appkit           # Rebuild appkit on save (run in parallel with dev)
npm run build                  # Production build
npm run lint                   # ESLint (runs on pre-commit hook)
npm run lint:fix               # Auto-fix ESLint issues
npm run test                   # Jest unit tests
npm run test:smoke             # API smoke tests
npm run test:smoke:browser     # Playwright browser tests
npm run firebase:generate      # Regen firestore.rules + indexes
npm run firebase:deploy        # Deploy all Firebase resources
npm run firebase:deploy:rules  # Deploy rules/storage only (fast)
npm run firebase:reset         # Reset emulator data
```

### Appkit development cycle

`@mohasinac/appkit` is a local file dep at `./appkit`. Changes to appkit source
require a rebuild before Next.js picks them up:

```
Terminal 1: npm run watch:appkit   ← keeps appkit built continuously
Terminal 2: npm run dev            ← Next.js reads built appkit output
```

Any change to appkit carousel/slider/product components goes through this cycle.

### Tailwind and appkit tokens

`tailwind.config.js` content paths include `node_modules/@mohasinac/**` to pick up
appkit Tailwind classes. `src/constants/theme.ts` extends `@mohasinac/tokens`
THEME_CONSTANTS with letitrip-specific overrides: brand colors, grid presets,
carousel dot styles, badge variants.

---

## 19. Firebase & Cloud Functions

### Deployment

```bash
npm run firebase:deploy          # All resources
npm run firebase:deploy:rules    # Rules + storage only
npm run firebase:deploy:indexes  # Indexes only
```

### Cloud Functions structure

```
functions/src/
├── index.ts              # Function exports
├── triggers/             # Firestore event triggers (order create, payment, etc.)
├── jobs/                 # Scheduled (weekly payouts, cleanup)
└── repositories/         # Data access layer for functions
```

### Emulator ports

| Service | Port |
|---------|------|
| Functions | 5001 |
| Firestore | 8080 |
| Realtime Database | 9000 |
| Auth | 9099 |
| Storage | 9199 |
| UI | 4000 |

---

## 20. Feature Flags

Defined in `src/features.config.ts`.

### Enabled

**Tier B (Core):** layout, forms, filters, media, auth, account, products, categories,
cart, wishlist, checkout, orders, payments, blog, reviews, faq, search, homepage, admin

**Tier C (Letitrip-specific):** events, auctions, promotions, seller, stores, pre-orders

### Disabled

consultation, concern, corporate, before-after, loyalty, collections, whatsappBot

---

## Appendix: Key File Locations

| What | Where |
|------|-------|
| Homepage page (thin shell) | `src/app/[locale]/page.tsx` |
| Homepage view (appkit) | `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` |
| Hero carousel | `appkit/src/features/homepage/components/HeroCarousel.tsx` |
| Section carousel wrapper | `appkit/src/features/homepage/components/SectionCarousel.tsx` |
| HorizontalScroller (BUG: perView voided) | `appkit/src/ui/components/HorizontalScroller.tsx` |
| HorizontalScroller CSS (BUG: dark mode) | `appkit/src/ui/components/HorizontalScroller.style.css` |
| ImageLightbox (built, unused) | `appkit/src/ui/components/ImageLightbox.tsx` |
| ImageLightbox CSS | `appkit/src/ui/components/ImageLightbox.style.css` |
| Product detail page (BUG: no gallery/tabs) | `appkit/src/features/products/components/ProductDetailPageView.tsx` |
| Product detail view | `appkit/src/features/products/components/ProductDetailView.tsx` |
| Product tabs (unused) | `appkit/src/features/products/components/ProductTabs.tsx` |
| Related products (unused) | `appkit/src/features/products/components/RelatedProducts.tsx` |
| Buy bar (unused) | `appkit/src/features/products/components/BuyBar.tsx` |
| Theme constants | `src/constants/theme.ts` |
| Feature flags | `src/features.config.ts` |
| Ad slots | `src/components/homepage/AdSlots.tsx` |
| Newsletter form | `src/components/homepage/HomepageNewsletterForm.tsx` |
| Carousel admin actions | `src/actions/carousel.actions.ts` |
| Section admin actions | `src/actions/sections.actions.ts` |
| Firestore rules (auto-generated) | `firestore.rules` |
| Environment template | `.env.example` |
| Auction detail page view | `appkit/src/features/auctions/components/AuctionDetailPageView.tsx` |
| Pre-order detail page view | `appkit/src/features/pre-orders/components/PreOrderDetailPageView.tsx` |
| Store detail layout | `appkit/src/features/stores/components/StoreDetailLayoutView.tsx` |
| Event detail view | `appkit/src/features/events/components/EventDetailView.tsx` |
| Public profile view | `appkit/src/features/about/components/PublicProfileView.tsx` |
| Search view (slot-shell) | `appkit/src/features/search/components/SearchView.tsx` |
| Promotions view | `appkit/src/features/promotions/components/PromotionsView.tsx` |

---

## 21. Remaining Pages — Detail Page Analysis

This section covers pages beyond the main listing/dashboard surfaces: auction detail,
pre-order detail, store hub, event detail, public profile, search, and promotions.

### Auction Detail — `AuctionDetailPageView`

**File:** `appkit/src/features/auctions/components/AuctionDetailPageView.tsx`  
**Page:** `src/app/[locale]/auctions/[id]/page.tsx` — passes only `id`

This is a **self-contained component** that fetches its own product data via
`productRepository.findByIdOrSlug(id)`, then passes render props to `AuctionDetailView`.

```
LOCAL /auctions/[id]                    LIVE /auctions/[id]
═══════════════════════════════         ════════════════════════════════════════
  If product found:                       COL 1: Gallery
    AuctionDetailView renders shell          main image → lightbox
    BUT renderGallery/renderInfo/            thumbnail strip
    renderBidForm are NOT passed             "N / M" counter
    from the page → all slots empty       COL 2: Info
                                             title h1
  If product not found:                     current bid: ₹X,XXX
    "Auction Not Found" error page           reserve: met / not met
                                             ends in: countdown timer
                                             [Place Bid ₹___] form
                                             bid history list
                                           COL 3: Actions (sticky)
                                             [Place Bid] primary
                                             [Watch] secondary
                                             [Ask Seller] link
```

**Root cause:** Page passes no render props. `AuctionDetailView` (the layout shell)
has `renderGallery`, `renderInfo`, `renderBidForm`, `renderMobileBidForm` slots —
all undefined → blank layout chrome only.

**Components that exist but are unused in local:**

| Component | Path | Purpose |
|-----------|------|---------|
| `AuctionBidForm` | `appkit/src/features/auctions/components/AuctionBidForm.tsx` | Real-time bid input + submit via RTDB |
| `AuctionDetailView` | `appkit/src/features/auctions/components/AuctionDetailView.tsx` | 3-col layout shell |
| `AuctionCountdown` | `appkit/src/features/auctions/components/AuctionCountdown.tsx` | Live countdown via RTDB |
| `AuctionBidHistory` | `appkit/src/features/auctions/components/AuctionBidHistory.tsx` | Real-time bid feed |

---

### Pre-Order Detail — `PreOrderDetailPageView`

**File:** `appkit/src/features/pre-orders/components/PreOrderDetailPageView.tsx`  
**Page:** `src/app/[locale]/pre-orders/[id]/page.tsx` — passes only `id`

Same pattern: self-contained data fetch, passes render props to `PreOrderDetailView`
shell. Page passes no render props → all slots (`renderGallery`, `renderInfo`,
`renderBuyBar`) are undefined.

```
LOCAL /pre-orders/[id]                 LIVE /pre-orders/[id]
═══════════════════════════════        ═══════════════════════════════════════
  Layout chrome only.                    Gallery (same as product page)
  (or error if product not found)        Title + release date badge
                                         Price + estimated shipping
                                         [Reserve Now] / [Notify Me] CTA
                                         Expected ship: Month YYYY
                                         Progress bar: X of Y reserved
```

---

### Store Detail — `StoreDetailLayoutView`

**File:** `appkit/src/features/stores/components/StoreDetailLayoutView.tsx`  
**Pages:** `src/app/[locale]/stores/[storeSlug]/layout.tsx` (and tab pages under it)

Store detail uses a **layout + children** pattern, not render props. The layout fetches
the store by slug and renders the store header (banner, avatar, name, rating).
Individual tab pages (`products`, `auctions`, `reviews`, `about`) are separate
Next.js pages that pass `StoreProductsPageView`, etc., as children.

```
LIVE /stores/[slug]                    LOCAL /stores/[slug]
═══════════════════════════════════    ═══════════════════════════════════════
  [store banner image]                   [store header — works if store exists
  [store avatar] StoreName                in Firestore]
  ★ 4.8 (234 reviews)                   Tabs: Products | Auctions | Reviews
  [Location] [Since 2022] [Verified]         | About (links render)
  ─────────────────────────────          Tab content:
  [Products] [Auctions] [Reviews]          Products: StoreProductsPageView
             [About]                         (⚠️ has own fetch, may partially work)
                                           Auctions: (⚠️ partial)
  Products tab:                          Reviews: (⚠️ partial)
    [filter/sort toolbar]               About: (⚠️ partial)
    [product grid]
    [pagination]
```

**Note:** Store detail is more functional than most pages because the layout itself
handles data fetching, and the tab pages are self-contained. The main gaps are the
toolbar (filter/sort/pagination) inside each tab — same root cause as listing pages.

---

### Event Detail — `EventDetailView`

**File:** `appkit/src/features/events/components/EventDetailView.tsx`  
**Page:** `src/app/[locale]/events/[id]/page.tsx`

This is a **pure slot-shell** — does no data fetching. BUT the page DOES fetch data
via `getPublicEventById()` and `getEventLeaderboard()`, then passes render props.
This means event detail is **actually more complete** than most pages locally.

```
LOCAL /events/[id]                     LIVE /events/[id]
══════════════════════════════         ════════════════════════════════════════
  All render slots ARE passed:           [event cover image hero]
  - renderCoverImage ✅                  [Event Title — large h1]
  - renderHeader ✅                      [Date range badge]
  - renderContent ✅                     [Participate CTA]
  - renderLeaderboard ✅                 [Leaderboard table]
  - renderParticipateAction ✅
                                        Status: ✅ FUNCTIONAL LOCALLY
  Page fetches all required data
  and wires the slots.
```

**This is the correct pattern** — the page file does the work of fetching and wiring.
Event detail should be used as a reference implementation for fixing other detail pages.

---

### Public Profile — `PublicProfileView`

**File:** `appkit/src/features/about/components/PublicProfileView.tsx`  
**Page:** `src/app/[locale]/profile/[userId]/page.tsx` — passes only `userId`

This is a **layout shell with hardcoded placeholders**. The component acknowledges
it's incomplete with a code comment: "data is injected by the consumer page via
server-fetched props — in Phase 3 consumers pass data."

```
LOCAL /profile/[userId]               LIVE /profile/[userId]
══════════════════════════════        ════════════════════════════════════════
  Renders profile shell with            [banner image]
  all placeholder values:               [avatar] DisplayName
  - displayName: "—"                    [★ rating] [N reviews] [Verified]
  - avatarUrl: placeholder              [Member since: Month YYYY]
  - reviewCount: "—"                    Stats: N Listings · N Sales · N Reviews
  - listingCount: "—"
  - joinedAt: "—"                       Tabs: Listings | Reviews | About
  Shows "No listings"                   [product grid for listings]
  Shows "No reviews"                    [review list]
```

---

### Search — `SearchView`

**Files:**
- `appkit/src/features/search/components/SearchView.tsx` — slot-shell
- `src/app/[locale]/search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]/page.tsx` — full page

The parameterized search route (`/search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]`)
**fetches real data** via `searchProducts()` and passes all render props. The base
`/search` route renders an empty search input form.

```
LOCAL /search/[slug]/tab/[tab]/sort/[sort]/page/[page]
══════════════════════════════════════════════════════
  ✅ Works: data fetched, render props wired
  renderSearchInput ✅ — populated
  renderFilters ✅ — populated (if filters passed)
  renderResults ✅ — populated with product cards
  renderPagination ✅ — populated

  Status: MOSTLY FUNCTIONAL (same filter/sort gaps as listing pages)
```

**This is the best-implemented public page** — the search route fully wires the
slot-shell with real data, including pagination and basic filters.

---

### Promotions — `PromotionsView`

**File:** `appkit/src/features/promotions/components/PromotionsView.tsx`  
**Page:** `src/app/[locale]/promotions/[tab]/page.tsx`

The promotions page **fetches data** via `getPromotions()` and passes all render props.
It requires a `labels` object (12 label strings) and `hasContent` boolean.

```
LOCAL /promotions/[tab]                LIVE /promotions/[tab]
═══════════════════════════════        ════════════════════════════════════════
  ✅ Page fetches promotions data        Coupon codes grid
  ✅ Passes renderCoupons                Flash deals section
  ✅ Passes renderDealsSection           Featured products section
  ✅ Passes labels object                Tab navigation (All/Coupons/Deals)
  ✅ Passes hasContent flag
                                        Status: ✅ FUNCTIONAL LOCALLY
  Status: MOSTLY FUNCTIONAL
  (may show empty state if no
   promotions docs in local DB)
```

---

### Remaining Pages — Status Summary

| Page | Route | Data Fetching | Render Props Wired | Local Status |
|------|-------|---------------|-------------------|--------------|
| Auction detail | `/auctions/[id]` | ✅ In PageView | ✅ All 6 slots wired (phase 32) | ✅ Functional |
| Pre-order detail | `/pre-orders/[id]` | ✅ In PageView | ✅ All 5 slots wired (phase 32) | ✅ Functional |
| Store detail | `/stores/[slug]` | ✅ In layout | ✅ Uses children pattern | ⚠️ Partial |
| Store tab: products | `/stores/[slug]/products` | ✅ Self-contained | N/A | ⚠️ Partial |
| Event detail | `/events/[id]` | ✅ In page | ✅ All slots wired | ✅ Functional |
| Public profile | `/profile/[userId]` | ❌ Not yet | N/A | ⚠️ Placeholders only |
| Search (parameterized) | `/search/[slug]/...` | ✅ In page | ✅ All slots wired | ✅ Functional |
| Search (base) | `/search` | ❌ Empty form | N/A | ⚠️ Input only |
| Promotions | `/promotions/[tab]` | ✅ In page | ✅ All slots wired | ✅ Functional |
| Auction participate | `/events/[id]/participate` | ✅ In page | ✅ Wired | ✅ Functional |

**Key insight:** Pages that fetch their own data and pass render props (events, search,
promotions) are functional. Pages that rely on the PageView to fetch and then hand off
to a slot-shell without wiring props (auctions, pre-orders) are empty. The event detail
page is the **gold-standard pattern** to follow when fixing auction and pre-order detail.
