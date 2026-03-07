# LetItRip.in — Full Platform Plan

> **Stack:** Next.js 16 (App Router) · TypeScript · Firebase (Firestore, Admin Auth, Storage, RTDB, Functions) · Razorpay · Algolia · next-intl (EN/HI) · Tailwind CSS · Resend · PWA
> **Payment:** Razorpay (UPI, cards, netbanking) · COD toggle · RipCoins loyalty redemption
> **Architecture:** Three-tier pluggable design — thin Pages → Feature Modules → Shared Primitives

---

## Table of Contents

0. [Development Setup](#0-development-setup)
   - 0.1 [Prerequisites](#01-prerequisites)
   - 0.2 [Environment Variables](#02-environment-variables)
   - 0.3 [Development Commands](#03-development-commands)
   - 0.4 [Git Workflow](#04-git-workflow)
   - 0.5 [Coding Standards](#05-coding-standards)
   - 0.6 [Testing Strategy](#06-testing-strategy)
1. [Site Overview](#1-site-overview)
2. [Site Map](#2-site-map)
   - 2.1 [All Pages & Routes](#21-all-pages--routes)
   - 2.2 [Navigation Structure](#22-navigation-structure)
3. [System Architecture](#3-system-architecture)
   - 3.1 [Three-Tier Design](#31-three-tier-design)
   - 3.2 [Folder Structure](#32-folder-structure)
   - 3.3 [Feature Modules](#33-feature-modules)
4. [Firestore Schema](#4-firestore-schema)
5. [Constants & Design System](#5-constants--design-system)
6. [Feature Breakdown](#6-feature-breakdown)
   - 6.1 [Product Catalog](#61-product-catalog)
   - 6.2 [Auctions & Bidding](#62-auctions--bidding)
   - 6.3 [Cart & Checkout](#63-cart--checkout)
   - 6.4 [Orders & Fulfilment](#64-orders--fulfilment)
   - 6.5 [Stores & Sellers](#65-stores--sellers)
   - 6.6 [Reviews System](#66-reviews-system)
   - 6.7 [Blog & Content](#67-blog--content)
   - 6.8 [Events & Promotions](#68-events--promotions)
   - 6.9 [FAQs](#69-faqs)
   - 6.10 [Search (Algolia)](#610-search-algolia)
   - 6.11 [Wishlist](#611-wishlist)
   - 6.12 [Notifications](#612-notifications)
   - 6.13 [RipCoins (Loyalty)](#613-ripcoins-loyalty)
   - 6.14 [Pre-orders](#614-pre-orders)
   - 6.15 [Chat](#615-chat)
7. [Authentication & Sessions](#7-authentication--sessions)
8. [RBAC — Role-Based Access Control](#8-rbac--role-based-access-control)
9. [Payment System](#9-payment-system)
10. [Seller Dashboard](#10-seller-dashboard)
11. [Admin Dashboard](#11-admin-dashboard)
12. [API Routes](#12-api-routes)
13. [Cloud Functions](#13-cloud-functions)
14. [i18n — Internationalisation](#14-i18n--internationalisation)
15. [PWA & Service Worker](#15-pwa--service-worker)
16. [Security Architecture](#16-security-architecture)
17. [Implementation Status](#17-implementation-status)

---

## 0. Development Setup

### 0.1 Prerequisites

| Tool         | Version  | Install                            |
| ------------ | -------- | ---------------------------------- |
| Node.js      | ≥ 20 LTS | [nodejs.org](https://nodejs.org)   |
| npm          | ≥ 10     | bundled with Node.js               |
| Firebase CLI | ≥ 13     | `npm i -g firebase-tools`          |
| Git          | ≥ 2.40   | [git-scm.com](https://git-scm.com) |

**OS:** Windows 11 · **Shell:** PowerShell · **Workspace:** `D:\proj\letitrip.in`

**Recommended VS Code extensions:** ESLint · Prettier · Tailwind CSS IntelliSense · Firebase Explorer

---

### 0.2 Environment Variables

Create `.env.local` at repo root (never commit).

```bash
# ─── Firebase Client (public — safe in browser) ───────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=    # RTDB for real-time auction bids + payment bridge

# ─── Firebase Admin SDK (server-only — NEVER expose client-side) ──────────────
FIREBASE_SERVICE_ACCOUNT_JSON=        # full JSON string of service account key

# ─── Razorpay ─────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=          # same as RAZORPAY_KEY_ID — safe for client

# ─── Algolia Search ───────────────────────────────────────────────────────────
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=       # search-only API key (public)
ALGOLIA_ADMIN_KEY=                    # server-only — index writes

# ─── Email ────────────────────────────────────────────────────────────────────
RESEND_API_KEY=

# ─── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> All `NEXT_PUBLIC_` prefixed variables are bundled into the client. Everything else is server-only.

---

### 0.3 Development Commands

```bash
npm run dev          # dev server (Turbopack) — http://localhost:3000
npm run build        # production build (Webpack)
npx tsc --noEmit     # type-check only
npm test             # Jest + React Testing Library
npm run lint         # ESLint
```

```powershell
.\scripts\deploy-firestore-indices.ps1   # Firestore composite indices
.\scripts\deploy-firestore-rules.ps1     # Firestore/Storage/RTDB security rules
.\scripts\deploy-functions.ps1           # Firebase Cloud Functions
.\scripts\sync-env-to-vercel.ps1         # sync .env.local → Vercel
.\scripts\pull-env-from-vercel.ps1       # pull env from Vercel
```

---

### 0.4 Git Workflow

```
main          ← production-ready; protected; all CI checks must pass
  └─ dev      ← integration branch; feature branches merged here first
```

**Commit convention (Conventional Commits):**

```
feat(auctions): add real-time bid counter to auction card
fix(payment): reject Razorpay orders with mismatched server amount
chore(deps): bump firebase-admin to 12.x
refactor(products): extract ProductFeatureBadges to Tier 2
docs(guide): update API endpoints index for new seller routes
```

**Pre-merge gate:** `npx tsc --noEmit` → `npm run lint` → `npm run build` all pass.

---

### 0.5 Coding Standards

| Area           | Rule                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Language       | TypeScript strict mode. `any` is forbidden — use `unknown` + type guards                            |
| Imports        | Barrel imports only — `@/components`, `@/features/products`, never deep paths                       |
| Components     | Server Components by default; `"use client"` only when hooks/browser APIs are needed                |
| State          | URL params for filter/sort/pagination (`useUrlTable`); React Context for session                    |
| Firebase       | Admin SDK server-only. No Firebase client SDK for Auth/Firestore/Storage                            |
| Data flow      | UI → Hook → Service → `apiClient` — never `fetch()` directly in components                          |
| Strings        | `useTranslations()` for all user-visible text in JSX. `UI_LABELS` for non-JSX constants             |
| Styling        | `THEME_CONSTANTS` tokens — never raw Tailwind strings or inline `style={}`                          |
| HTML           | No raw `<div>`, `<p>`, `<h1>` etc. — use `Section`, `Text`, `Heading`, `Button` from `@/components` |
| Logging        | `logger` (client) / `serverLogger` (API routes). No `console.log()`                                 |
| Error handling | `try/catch` at API route and Cloud Function boundaries only. Use `useMessage()` not `alert()`       |
| File naming    | `PascalCase.tsx` for components, `camelCase.ts` for non-component modules                           |
| Page length    | Pages ≤ 150 lines — extract to `src/features/<name>/components/<Domain>View.tsx`                    |

---

### 0.6 Testing Strategy

| Layer       | Tool                         | Scope                                                                           |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------- |
| Unit        | Jest                         | `utils/`, `helpers/` (formatCurrency, paiseToRupees, slug, discount validation) |
| Component   | Jest + React Testing Library | UI primitives (Button, Badge, DataTable, PriceDisplay)                          |
| Integration | Jest + Firestore Emulator    | API routes (`/api/payment/verify`, `/api/orders/*`, `/api/auctions/bid`)        |
| E2E         | (planned) Playwright         | browse → add to cart → checkout; auction → bid → win                            |

Test files co-located: `src/utils/currency.test.ts`, `src/components/ui/Button.test.tsx`.
Run all: `npm test`. Coverage threshold: 70%.

---

## 1. Site Overview

LetItRip.in is a production-grade **multi-seller marketplace and auction platform** targeting Indian buyers and sellers. It supports both standard product listings and time-limited real-time auction bidding, with a full suite of seller tools, admin controls, Razorpay payments, and a loyalty coin system.

### Business Characteristics

| Property        | Value                                                                                  |
| --------------- | -------------------------------------------------------------------------------------- |
| Market          | India                                                                                  |
| Currency        | INR (₹) — all amounts in rupees; Razorpay paise internally                             |
| Listing types   | Fixed-price products + time-limited auctions                                           |
| Item condition  | New, like-new, good, fair, poor                                                        |
| Seller model    | Multi-seller marketplace — sellers register, get approved, manage their own storefront |
| Payment gateway | Razorpay (UPI, cards, netbanking, no-cost EMI)                                         |
| COD             | Toggle in admin settings                                                               |
| Loyalty         | RipCoins — earned on purchases, redeemable at checkout                                 |
| Shipping        | Seller-managed; India only (pan-India)                                                 |
| Languages       | English (default) + Hindi                                                              |
| Auth model      | Firebase Admin SDK only — HttpOnly session cookies, no Firebase client SDK for auth    |
| RBAC            | `user` → `seller` → `moderator` → `admin` (hierarchical inheritance)                   |
| Search          | Algolia full-text search                                                               |
| Real-time       | Firebase RTDB for live bid updates and payment outcome bridge                          |
| PWA             | Installable — service worker via Serwist                                               |

---

## 2. Site Map

### 2.1 All Pages & Routes

All routes are locale-prefixed (`/en/`, `/hi/`) via `next-intl`. English is the default (no prefix when using `localePrefix: "as-needed"`).

#### `/` — Homepage

**Route:** `src/app/[locale]/page.tsx`

| Section                   | Content                                             | Implementation                                    |
| ------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Announcement bar          | Rotating messages from Firestore                    | `AnnouncementBar` ← `settings/siteConfig`         |
| Hero carousel             | Full-width slides with CTA buttons                  | `HeroCarousel` ← `carouselSlides` (Firestore)     |
| Top categories strip      | Category tiles linking to `/categories`             | `TopCategoriesSection` ← `categories` (Firestore) |
| Featured products section | Product carousel from admin-configured section      | `FeaturedProductsSection` ← `homepageSections`    |
| Featured auctions section | Live auction cards with real-time countdown         | `FeaturedAuctionsSection` ← `homepageSections`    |
| Featured stores section   | Active seller storefronts                           | `FeaturedStoresSection` ← `stores`                |
| Customer reviews carousel | Approved review cards with star ratings             | `CustomerReviewsSection` ← `reviews`              |
| Blog articles section     | Latest/featured blog posts                          | `BlogArticlesSection` ← `blogPosts`               |
| FAQ accordion             | Top-level FAQs                                      | `FAQSection` ← `faqs`                             |
| Trust indicators          | Free shipping · Secure payment · RipCoins · Returns | `TrustIndicatorsSection` (static)                 |
| Newsletter signup         | Email input + Subscribe                             | `NewsletterSignup` → `/api/newsletter`            |
| Footer                    | Nav links, socials, policies, locale switcher       | `FooterLayout`                                    |

---

#### `/products` — Product Catalog

**Route:** `src/app/[locale]/products/page.tsx`

| Element      | Content                                                       |
| ------------ | ------------------------------------------------------------- |
| Search bar   | Algolia-powered live search                                   |
| Filter panel | Category, condition, price range, seller, in-stock only, sort |
| Product grid | Responsive — 4 cols desktop / 2 cols mobile                   |
| Filter state | URL params via `useUrlTable` — shareable/bookmarkable         |
| Pagination   | URL-based (`?page=N`)                                         |

---

#### `/products/[slug]` — Product Detail

**Route:** `src/app/[locale]/products/[slug]/page.tsx`

| Element           | Content                                                             |
| ----------------- | ------------------------------------------------------------------- |
| Image gallery     | Zoomable multi-image gallery with `MediaLightbox` fullscreen viewer |
| Video player      | Inline `MediaVideo` if product has video                            |
| Price / condition | `PriceDisplay` — sale price + compare-at + condition badge          |
| Feature badges    | New / Featured / Pre-order / Auction badging                        |
| Quantity selector | Stepper with stock max guard                                        |
| Add to Cart / Bid | Context-aware CTA (product → cart, auction → bid form)              |
| Wishlist button   | Toggles Firestore users wishlist via `WishlistButton`               |
| Seller info       | Store name + ratings + link to storefront                           |
| Reviews section   | Star distribution, full review list, submit review                  |
| Related products  | `RelatedProducts` carousel                                          |
| Specifications    | Accordion (condition, location, return policy, delivery)            |

---

#### `/auctions` — Auction Listing

**Route:** `src/app/[locale]/auctions/page.tsx`

| Element        | Content                                                                |
| -------------- | ---------------------------------------------------------------------- |
| Live countdown | Real-time countdown badge on each card (RTDB `onValue`)                |
| Bid count      | Live bid counter per auction                                           |
| Filter/sort    | Status (live, upcoming, ended), category, price, end time              |
| Auction cards  | `AuctionCard` — current price, countdown, bid count, reserve indicator |

---

#### `/auctions/[slug]` — Auction Detail

**Route:** `src/app/[locale]/auctions/[slug]/page.tsx`

| Element            | Content                                                          |
| ------------------ | ---------------------------------------------------------------- |
| Real-time bid feed | `BidHistory` — live-updating via Firebase RTDB `useRealtimeBids` |
| Place bid form     | `PlaceBidForm` — minimum bid validation, auto-increment          |
| Countdown timer    | `CountdownDisplay` tied to `endsAt` Firestore field              |
| Reserve price      | "Reserve not met" / "Reserve met" indicator                      |
| Outbid alert       | Toast when another bidder tops your bid (RTDB listener)          |
| Buy-now option     | Direct purchase if seller set `buyNowPrice`                      |

---

#### `/stores` — Store Directory

**Route:** `src/app/[locale]/stores/page.tsx`

Grid of active, public seller storefronts with search + category filter.

---

#### `/stores/[slug]` — Seller Storefront

**Route:** `src/app/[locale]/stores/[slug]/page.tsx`

| Element         | Content                                                |
| --------------- | ------------------------------------------------------ |
| Store banner    | `MediaImage` — full-width banner from `storeBannerURL` |
| Store logo      | `MediaAvatar` + store name + bio                       |
| Stats           | Total sales, rating, member since                      |
| Active listings | Product grid filtered by `ownerId`                     |
| Active auctions | Auction grid filtered by `ownerId`                     |
| Reviews         | Seller reviews tab                                     |
| Policies        | Return + shipping policy from store doc                |

---

#### `/categories` — Category Browser

**Route:** `src/app/[locale]/categories/page.tsx`

Hierarchical category grid (parent → children). Each category links to `/products?category=<slug>`.

---

#### `/cart` — Shopping Cart

**Route:** `src/app/[locale]/cart/page.tsx`

| Element         | Content                                                      |
| --------------- | ------------------------------------------------------------ |
| Empty state     | "Your cart is empty" + CTA to `/products`                    |
| Line items      | Image, title, seller, unit price, qty stepper, remove button |
| Promo code      | `PromoCodeInput` — server-validated coupon discount          |
| RipCoins toggle | "Use X RipCoins (save ₹Y)" if user has balance               |
| Order summary   | Subtotal, discount, shipping, total                          |
| Checkout CTA    | → `/checkout`                                                |

---

#### `/checkout` — Checkout

**Route:** `src/app/[locale]/checkout/page.tsx`

Multi-step checkout: Address → Review → Payment → Confirm.

| Step         | Content                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| Address      | `AddressSelectorCreate` — choose saved or add new; India states dropdown |
| Order review | Readonly line items + final totals                                       |
| Payment      | Razorpay modal (UPI/card/netbanking) or COD if enabled                   |
| Confirm      | `CheckoutSuccessView` — order ID, summary, next steps                    |

---

#### `/track` — Order Tracking

**Route:** `src/app/[locale]/track/page.tsx`

Guest-accessible order tracking by order ID + email. Shows status timeline from `orders/{id}.statusHistory`.

---

#### `/search` — Search Results

**Route:** `src/app/[locale]/search/page.tsx`

Algolia-powered full-text search across products and auctions. SSR results + client-side refinement.

---

#### `/blog` — Blog Index

**Route:** `src/app/[locale]/blog/page.tsx`

| Element         | Content                                            |
| --------------- | -------------------------------------------------- |
| Category tabs   | `BlogCategoryTabs` — filters by category           |
| Featured post   | `BlogFeaturedCard` — hero-style featured post      |
| Post grid       | `BlogCard` grid — title, cover, author, date, tags |
| Search / filter | URL param `?q=` + `?category=`                     |

---

#### `/blog/[slug]` — Blog Article

**Route:** `src/app/[locale]/blog/[slug]/page.tsx`

Cover image, title, author, published date, rich-text body (TipTap rendered), related products widget, social share.

---

#### `/events` — Events & Sales

**Route:** `src/app/[locale]/events/page.tsx`

Active promotional events (sales, offers, polls, surveys). `EventBanner` for featured events.

---

#### `/faqs` — FAQ Page

**Route:** `src/app/[locale]/faqs/page.tsx`

| Element          | Content                                                  |
| ---------------- | -------------------------------------------------------- |
| Search bar       | Live filter on FAQ content                               |
| Category sidebar | `FAQCategorySidebar` — filter by category                |
| Accordion list   | `FAQAccordion` — expandable Q&A with view count          |
| Helpful voting   | `FAQHelpfulButtons` — thumbs up/down, persisted per user |
| Related FAQs     | `RelatedFAQs` — similar questions at bottom              |
| Contact CTA      | `ContactCTA` → `/contact` if no answer found             |

---

#### `/promotions` — Coupons & Promotions

**Route:** `src/app/[locale]/promotions/page.tsx`

Active public coupon codes with `CouponCard`. One-click copy. Conditions shown (min order, expiry, applicable categories).

---

#### `/reviews` — Reviews Listing

**Route:** `src/app/[locale]/reviews/page.tsx`

Platform-wide approved reviews — filterable by star rating, product, seller.

---

#### `/pre-orders` — Pre-order Listings

**Route:** `src/app/[locale]/pre-orders/page.tsx`

Products with `isPreorder: true`. `PreOrderDetailView` shows ETA, deposit amount, full payment on arrival.

---

#### `/seller-guide` — Seller Guide

**Route:** `src/app/[locale]/seller-guide/page.tsx`

Static guide for prospective sellers — how to register, list items, manage orders, get paid.

---

#### `/profile` — User Quick Profile Redirect

**Route:** `src/app/[locale]/profile/page.tsx` → redirects to `/user`

---

#### Auth Pages

| Route                   | Purpose                             |
| ----------------------- | ----------------------------------- |
| `/auth/login`           | Email + password + Google + Apple   |
| `/auth/register`        | Account creation                    |
| `/auth/verify-email`    | Email verification gate             |
| `/auth/forgot-password` | Reset email request                 |
| `/auth/reset-password`  | New password entry (token from URL) |

---

#### User Dashboard (`/user/*`)

| Route                 | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `/user`               | Profile overview + stats (`ProfileHeader`)     |
| `/user/orders`        | Order history + status badges                  |
| `/user/orders/[id]`   | Order detail + `OrderTrackingView` timeline    |
| `/user/wishlist`      | Tabbed wishlist — products / auctions / stores |
| `/user/addresses`     | Saved address cards + add/edit/delete          |
| `/user/settings`      | Profile info, password, email/phone verify     |
| `/user/sessions`      | Active sessions list with remote revoke        |
| `/user/notifications` | Notification bell + full notification list     |

---

#### Seller Dashboard (`/seller/*`)

| Route               | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `/seller`           | Store setup OR analytics overview                   |
| `/seller/products`  | Product CRUD — list, create, edit, delete           |
| `/seller/auctions`  | Auction CRUD — create, monitor, end early           |
| `/seller/orders`    | Orders for this seller's products only              |
| `/seller/payouts`   | Payout history + request payout                     |
| `/seller/analytics` | Revenue chart (Recharts), top products, stats cards |
| `/seller/store`     | Store profile edit — banner, logo, bio, policies    |

---

#### Admin Dashboard (`/admin/*`)

| Route               | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| `/admin`            | Platform stats + quick actions                          |
| `/admin/users`      | User list + role management + ban/unban                 |
| `/admin/products`   | All products moderation                                 |
| `/admin/orders`     | Platform-wide order management                          |
| `/admin/stores`     | Seller store approvals + suspend                        |
| `/admin/carousel`   | Homepage carousel slide CRUD + reorder                  |
| `/admin/sections`   | Homepage section CRUD + config (carousel config UI)     |
| `/admin/categories` | Category tree management                                |
| `/admin/reviews`    | Review moderation queue                                 |
| `/admin/faqs`       | FAQ CRUD                                                |
| `/admin/blog`       | Blog post CRUD with TipTap rich text                    |
| `/admin/coupons`    | Coupon management + usage stats                         |
| `/admin/events`     | Event/promotion management                              |
| `/admin/payouts`    | Payout approval queue                                   |
| `/admin/site`       | Site settings — contact, social, announcement bar, etc. |
| `/admin/sessions`   | Admin session manager — view/revoke any user session    |

---

#### Static / Policy Pages

| Route            | Content                                    |
| ---------------- | ------------------------------------------ |
| `/about`         | About LetItRip platform                    |
| `/contact`       | `ContactForm` + info sidebar               |
| `/help`          | Help centre articles                       |
| `/privacy`       | Privacy policy                             |
| `/terms`         | Terms of service                           |
| `/refund-policy` | Refund & return policy                     |
| `/cookies`       | Cookie policy                              |
| `/unauthorized`  | Access denied page with countdown redirect |

---

### 2.2 Navigation Structure

```
[Announcement bar — rotating messages from Firestore siteConfig]

[LetItRip logo]  [Products] [Auctions] [Stores] [Categories] [Events]
                 [Search 🔍]  [Locale switcher]  [Notifications 🔔]
                 [Account 👤]  [Wishlist ♡]  [Cart 🛒(count)]

Mobile: Bottom nav — Home · Auctions · Seller · Wishlist · Profile

Sidebar (desktop admin/seller): Collapsible with icon + label groups
```

All nav items are locale-aware (`Link` from `src/i18n/navigation.ts`).

---

## 3. System Architecture

### 3.1 Three-Tier Design

```
┌────────────────────────────────────────────────────────────────┐
│  Tier 3 — Page Layer         src/app/[locale]/                 │
│  Thin orchestration. ≤150 lines each. Composes Tier 1 + 2.     │
├────────────────────────────────────────────────────────────────┤
│  Tier 2 — Feature Modules    src/features/<name>/              │
│  Vertical domain slices. Own: components/, hooks/, types/,     │
│  constants/, index.ts. Imports Tier 1 only.                    │
│  NEVER imports from another feature.                           │
├────────────────────────────────────────────────────────────────┤
│  Tier 1 — Shared Primitives  src/components/  src/hooks/       │
│                               src/utils/      src/helpers/     │
│                               src/classes/    src/constants/   │
│  Feature-agnostic. Extractable to @letitrip/* npm packages.    │
└────────────────────────────────────────────────────────────────┘
```

**Import rule (enforced via lint):** Always use barrel imports.

```tsx
import { Button, Badge } from "@/components"; // ✅ Tier 1
import { ProductCard } from "@/features/products"; // ✅ Tier 2
import { ProductCard } from "@/components/products"; // ❌ forbidden
import { CartButton } from "@/features/cart"; // ❌ cross-feature in a feature
```

---

### 3.2 Folder Structure

```
src/
├── app/
│   ├── layout.tsx              ← Root HTML shell (<html lang>)
│   ├── globals.css
│   ├── [locale]/
│   │   ├── layout.tsx          ← NextIntlClientProvider + all providers
│   │   ├── page.tsx            ← Homepage
│   │   ├── products/           ← /products + /products/[slug]
│   │   ├── auctions/           ← /auctions + /auctions/[slug]
│   │   ├── stores/             ← /stores + /stores/[slug]
│   │   ├── cart/               ← /cart
│   │   ├── checkout/           ← /checkout
│   │   ├── track/              ← /track (guest order tracking)
│   │   ├── search/             ← /search
│   │   ├── blog/               ← /blog + /blog/[slug]
│   │   ├── events/             ← /events
│   │   ├── faqs/               ← /faqs
│   │   ├── promotions/         ← /promotions
│   │   ├── reviews/            ← /reviews
│   │   ├── pre-orders/         ← /pre-orders
│   │   ├── categories/         ← /categories
│   │   ├── auth/               ← /auth/login + register + verify…
│   │   ├── user/               ← /user/* (protected)
│   │   ├── seller/             ← /seller/* (seller-protected)
│   │   ├── admin/              ← /admin/* (admin-protected)
│   │   ├── about/              ← /about
│   │   ├── contact/            ← /contact
│   │   ├── help/               ← /help
│   │   └── [policy pages]      ← /privacy /terms /refund-policy /cookies
│   └── api/                    ← All backend API routes (no locale)
│
├── features/                   ← Tier 2 — feature modules
│   ├── products/               ← ProductCard, ProductGrid, ProductFilters…
│   ├── auth/                   ← LoginForm, RegisterForm, OAuth…
│   ├── cart/                   ← CartItemList, CheckoutView…
│   ├── orders/                 ← OrderTrackingView, OrderStatusForm…
│   ├── auctions/               ← AuctionCard, BidHistory, PlaceBidForm…
│   ├── stores/                 ← StoreCard, StoreGrid…
│   ├── seller/                 ← SellerDashboard, SellerStoreView…
│   ├── admin/                  ← All admin views and forms
│   ├── user/                   ← ProfileHeader, AddressCard, NotificationBell…
│   ├── blog/                   ← BlogCard, BlogFeaturedCard…
│   ├── homepage/               ← HeroCarousel, FeaturedProductsSection…
│   ├── categories/             ← CategoryCard, CategoryGrid…
│   ├── reviews/                ← ReviewCard…
│   ├── search/                 ← SearchFiltersRow, SearchResultsSection…
│   ├── faq/                    ← FAQAccordion, FAQCategorySidebar…
│   ├── contact/                ← ContactForm, ContactInfoSidebar…
│   ├── events/                 ← EventBanner…
│   ├── promotions/             ← CouponCard, ProductSection…
│   ├── about/                  ← AboutView…
│   └── wishlist/               ← WishlistTabs…
│
├── components/                 ← Tier 1 — pure generic primitives
│   ├── ui/                     ← Button, Card, Badge, DataTable, PriceDisplay…
│   ├── forms/                  ← Input, Select, Textarea, Toggle, Slider…
│   ├── typography/             ← Heading, Text, Caption, Label, Span, TextLink
│   ├── semantic/               ← Section, Article, Nav, Ul, Li…
│   ├── media/                  ← MediaImage, MediaVideo, MediaAvatar, MediaGallery, MediaLightbox
│   ├── feedback/               ← Alert, Modal, Toast
│   ├── modals/                 ← ConfirmDeleteModal, ImageCropModal, UnsavedChangesModal
│   ├── utility/                ← Search, BackToTop, ResponsiveView…
│   ├── layout/                 ← NavbarLayout, SidebarLayout, FooterLayout, TitleBarLayout…
│   ├── admin/                  ← AdminPageHeader, RichTextEditor, ImageUpload…
│   ├── auth/                   ← ProtectedRoute, RoleGate
│   └── providers/              ← MonitoringProvider
│
├── hooks/                      ← Tier 1 shared hooks
│   ├── useAuth.ts              ← useLogin, useRegister, useGoogleLogin…
│   ├── useApiQuery.ts          ← useApiQuery, useApiMutation
│   ├── useProfile.ts
│   ├── useAddresses.ts
│   ├── useRazorpay.ts          ← Razorpay modal integration
│   ├── useRealtimeBids.ts      ← Firebase RTDB bid feed
│   ├── useRealtimeEvent.ts     ← RTDB generic bridge (usePaymentEvent, useAuthEvent)
│   ├── useUrlTable.ts          ← URL-based filter/sort/page state
│   ├── useMessage.ts           ← Toast notifications (no alert())
│   └── …
│
├── utils/                      ← Tier 1 pure functions
│   ├── currency.ts             ← formatCurrency, rupeesToPaise, paiseToRupees
│   ├── slug.ts                 ← slugify, generateSlug
│   ├── date.ts                 ← formatDate, timeAgo, isExpired
│   └── …
│
├── helpers/                    ← Tier 1 business-logic helpers
│   ├── discount.ts             ← calcDiscount, applyCoupon
│   ├── ripcoins.ts             ← ripCoinsToRupees, canRedeem
│   └── …
│
├── classes/                    ← Tier 1 singletons
│   ├── CacheManager.ts         ← In-memory TTL cache
│   ├── StorageManager.ts       ← localStorage/sessionStorage wrapper
│   ├── Logger.ts               ← client-side structured logger
│   ├── EventBus.ts             ← publish/subscribe event bus
│   └── Queue.ts                ← priority task queue
│
├── constants/                  ← Tier 1 app-wide constants
│   ├── ui.ts                   ← UI_LABELS, UI_PLACEHOLDERS, UI_HELP_TEXT
│   ├── theme.ts                ← THEME_CONSTANTS (all Tailwind tokens)
│   ├── routes.ts               ← ROUTES (all app paths)
│   ├── api-endpoints.ts        ← API_ENDPOINTS (all /api/* paths)
│   ├── rbac.ts                 ← RBAC_CONFIG, ROLE_HIERARCHY
│   ├── site.ts                 ← SITE_CONFIG
│   ├── seo.ts                  ← SEO_CONFIG, generateMetadata
│   ├── navigation.tsx          ← MAIN_NAV_ITEMS, SIDEBAR_NAV_GROUPS
│   ├── address.ts              ← ADDRESS_TYPES, INDIAN_STATES
│   └── messages.ts             ← ERROR_MESSAGES, SUCCESS_MESSAGES
│
├── repositories/               ← Data access layer (Firestore + Admin SDK)
│   ├── user.repository.ts
│   ├── product.repository.ts
│   ├── auction.repository.ts
│   ├── order.repository.ts
│   ├── store.repository.ts
│   ├── review.repository.ts
│   ├── blog.repository.ts
│   ├── cart.repository.ts
│   ├── coupon.repository.ts
│   ├── faq.repository.ts
│   ├── category.repository.ts
│   └── …
│
├── services/                   ← Client service layer (apiClient wrappers)
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── order.service.ts
│   ├── seller.service.ts
│   ├── cart.service.ts
│   ├── checkout.service.ts
│   └── …
│
├── db/
│   ├── schema/                 ← TypeScript Firestore document types
│   ├── seed-data/              ← Development seed data
│   └── indices/                ← Firestore composite index definitions
│
├── lib/                        ← Server-side lib modules
│   ├── firebase-admin.ts       ← Admin SDK init (db, auth, storage, rtdb)
│   ├── payment/razorpay.ts     ← Razorpay order create, verify, fetch
│   ├── email/resend.ts         ← Email send helpers (order confirm, etc.)
│   └── algolia/               ← Algolia index helpers (index product, delete)
│
├── i18n/
│   ├── routing.ts              ← defineRouting({ locales: ['en','hi'], … })
│   ├── request.ts              ← getRequestConfig (server per-request)
│   └── navigation.ts           ← createNavigation (locale-aware Link, useRouter)
│
├── types/                      ← Shared TypeScript types
├── contexts/                   ← React context providers
├── proxy.ts                    ← next-intl middleware (locale detection)
└── sw.ts                       ← Service worker (Serwist PWA)
```

---

### 3.3 Feature Modules

Each feature is a self-contained vertical slice:

```
src/features/products/
├── components/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductFilters.tsx
│   ├── ProductDetailView.tsx
│   ├── ProductImageGallery.tsx
│   ├── ProductFeatureBadges.tsx
│   ├── ProductActions.tsx
│   ├── ProductSortBar.tsx
│   ├── RelatedProducts.tsx
│   ├── AddToCartButton.tsx
│   ├── AuctionCard.tsx
│   ├── AuctionDetailView.tsx
│   ├── BidHistory.tsx
│   ├── PlaceBidForm.tsx
│   └── PreOrderDetailView.tsx
├── hooks/
│   └── useProducts.ts   (product listing + filtering)
├── types/
│   └── index.ts         (ProductFilter, ProductSort)
├── constants/
│   └── index.ts         (PRODUCT_SORT_OPTIONS, CONDITION_OPTIONS)
└── index.ts             ← public barrel exports
```

---

## 4. Firestore Schema

All collection names are constants in `src/db/schema/field-names.ts` — never hardcoded strings.

```
/users/{userId}
  email, displayName, photoURL, role, isEmailVerified, isPhoneVerified,
  phone, ripCoins, totalOrders, storeId?, storeSlug?, storeStatus?,
  wishlist { productIds[], auctionIds[], categoryIds[], storeIds[] },
  createdAt, updatedAt

/sessions/{sessionId}
  userId, ipAddress, userAgent, device, location, lastActivityAt,
  expiresAt, isRevoked, createdAt

/stores/{storeSlug}
  ownerId, storeSlug, storeName, storeDescription, storeCategory,
  storeLogoURL, storeBannerURL, bio, website, location, socialLinks,
  returnPolicy, shippingPolicy, isVacationMode, vacationMessage,
  isPublic, status (pending|active|suspended|rejected), stats, createdAt

/products/{productId}
  sellerId, storeSlug, title, slug, description, price, compareAtPrice,
  condition (new|like-new|good|fair|poor), category, images[], mainImage,
  video?, isAuction, isPreorder, preorderEta?, depositAmount?,
  featured, active, inStock, stock, sku, tags[],
  rating, reviewCount, createdAt, updatedAt

/auctions/{auctionId}
  sellerId, storeSlug, productId, title, slug, description, startPrice,
  reservePrice?, buyNowPrice?, currentBid, currentBidderId,
  bidCount, status (upcoming|live|ended|cancelled),
  startsAt, endsAt, images[], category, createdAt, updatedAt

/bids/{bidId}
  auctionId, bidderId, bidderName, amount, isWinning, createdAt

/orders/{orderId}
  buyerId, sellerId, storeSlug, items[{ productId, title, price, qty, image }],
  subtotal, discount, shipping, total, currency (INR),
  couponCode?, couponDiscount?, ripCoinsUsed?, ripCoinsDiscount?,
  paymentMethod (razorpay|cod), paymentStatus (pending|authorized|paid|failed|refunded|cod_pending),
  razorpayOrderId?, razorpayPaymentId?,
  shippingAddress { name, line1, line2, city, state, pincode, phone },
  status (pending|confirmed|processing|shipped|delivered|cancelled|return_requested|refunded),
  statusHistory[{ status, timestamp, note?, changedBy }],
  trackingNumber?, courier?, estimatedDelivery?,
  isPreorder, createdAt, updatedAt

/cart/{userId}/items/{itemId}
  productId, title, price, image, qty, sellerId, addedAt

/reviews/{reviewId}
  productId, sellerId, reviewerId, reviewerName, reviewerAvatar?,
  rating (1-5), title?, body, images[], video?,
  status (pending|approved|rejected), featured,
  helpfulCount, notHelpfulCount,
  sellerReply?, sellerReplyAt?,
  createdAt, updatedAt

/categories/{categoryId}
  name, slug, description, image, parentId?, children[], sortOrder,
  productCount, isActive, createdAt

/blogPosts/{postId}
  title, slug, body (TipTap JSON), coverImage, author { name, avatar },
  category, tags[], status (draft|published|archived),
  publishedAt?, metaTitle, metaDescription, ogImage,
  viewCount, related products[], createdAt, updatedAt

/faqs/{faqId}
  question, answer (rich text), category, tags[], sortOrder,
  viewCount, helpfulCount, notHelpfulCount,
  status (draft|published), createdAt, updatedAt

/coupons/{couponCode}
  code, type (percentage|flat|free_shipping|buy_x_get_y),
  value, maxDiscount?, minOrderValue, usageLimit, usedCount,
  usageLimitPerUser, startsAt, expiresAt, isActive,
  applicableCategories[]?, applicableProducts[]?,
  createdAt, updatedAt

/coupons/{couponCode}/usage/{usageId}
  userId, orderId, discountApplied, usedAt

/events/{eventId}
  title, slug, description, type (sale|offer|poll|survey|feedback),
  bannerImage, startsAt, endsAt, isActive, config{}, createdAt

/carouselSlides/{slideId}
  title, subtitle, imageUrl, ctaLabel, ctaHref, sortOrder, isActive, createdAt

/homepageSections/{sectionId}
  type (welcome|hero|featured|categories|products|auctions|stores|events|reviews|blog|trust|features|advertisement),
  title, subtitle, config{}, sortOrder, isActive, createdAt

/notifications/{notificationId}
  userId, type, title, body, isRead, link?, data{}, createdAt

/addresses/{addressId}
  userId, label (home|work|other), name, line1, line2?, city,
  state, pincode, country (IN), phone, isDefault, createdAt

/ripcoins/{userId}
  balance, lifetimeEarned, lifetimeRedeemed,
  transactions[{ type (earn|redeem|expire), amount, orderId?, description, createdAt }]

/payouts/{payoutId}
  sellerId, storeSlug, amount, status (pending|approved|paid|rejected),
  bankAccount{ accountNumber, ifsc, bankName, accountHolder },
  requestedAt, processedAt?, adminNote?

/newsletterSubscribers/{subscriberId}
  email, name?, locale, status (active|unsubscribed), subscribedAt

/chat/{chatId}
  participants [buyerId, sellerId], productId?, auctionId?,
  lastMessage, lastMessageAt, unreadCounts{[userId]: number},
  createdAt

/chat/{chatId}/messages/{messageId}
  senderId, text, attachments[]?, isRead, createdAt

/settings/siteConfig
  siteName, logoUrl, faviconUrl, announcementBar { messages[], isActive },
  maintenanceMode, featureFlags{}, contactInfo{}, socialLinks{},
  trustBadges[], footerLinks[], createdAt, updatedAt

/settings/paymentSettings
  razorpayEnabled, codEnabled, codFee, ripCoinsEnabled,
  ripCoinsEarnRate (₹X spent = 1 coin), ripCoinsRedeemRate (1 coin = ₹X),
  prepaidDiscountPercent?, updatedAt

/tokens/{tokenId}
  userId, type (email_verify|password_reset|phone_otp),
  token (hashed), expiresAt, usedAt?, createdAt

/smsCounters/{date}
  count, updatedAt
```

---

## 5. Constants & Design System

### THEME_CONSTANTS

All Tailwind utility strings are accessed via `THEME_CONSTANTS` from `@/constants` — never write raw Tailwind strings directly in JSX.

Key token groups:

- `themed.*` — backgrounds, text colors, borders (auto dark mode)
- `flex.*` — pre-composed flex containers (row, col, center, between…)
- `grid.*` — responsive grids (cols1–cols6, autoFill, sidebar, halves…)
- `spacing.*` — gap, padding, margin with axis + side variants
- `page.container.*` — max-width + mx-auto + responsive padding presets (sm/md/lg/xl/2xl/full)
- `typography.*` — heading + body + caption
- `button.*`, `card.*`, `input.*` — component base styles
- `zIndex.*`, `position.*`, `size.*`, `overflow.*`
- `animation.*` — fast/normal/slow durations
- `rating.*` — star color tokens
- `badge.*`, `pageHeader.*`, `sectionBg.*` — semantic presets

### Component Primitives

**Typography** (no raw HTML): `Heading`, `Text`, `Caption`, `Label`, `Span`, `TextLink`

**Form**: `Input`, `Select`, `Textarea`, `Toggle`, `Checkbox`, `Slider`, `Radio`

**Semantic**: `Section`, `Article`, `Main`, `Aside`, `Nav`, `Ul`, `Ol`, `Li`

**Media**: `MediaImage`, `MediaVideo`, `MediaAvatar`, `MediaGallery`, `MediaLightbox`

**Feedback**: `Alert`, `Modal`, `Toast` → via `useMessage()` hook

**UI**: `Button`, `Card`, `Badge`, `DataTable`, `ListingLayout`, `PriceDisplay`, `RatingDisplay`, `CountdownDisplay`, `Pagination`, `StepperNav`, `StatsGrid`

---

## 6. Feature Breakdown

### 6.1 Product Catalog

- Multi-seller listings with condition, images, video, category
- Filter/sort via URL params (`useUrlTable`) — category, condition, price range, seller, in-stock
- Algolia search indexes on create/update/delete (server-side, via `lib/algolia/`)
- Product `slug` auto-generated from title at creation
- `isPreorder` flag triggers `PreOrderDetailView` with ETA + deposit flow
- `isFeatured` flag surfaces in homepage featured sections
- Admin can moderate (approve/reject/suspend) any listing
- Sellers manage their own products via `/seller/products`

### 6.2 Auctions & Bidding

**Real-time bidding architecture:**

```
Seller creates auction → Firestore auctionDoc (status: upcoming)
        ↓  startsAt reached  (Cloud Function scheduler)
       status: live → RTDB node /auctions/{id}/bids created
        ↓
Bidder clicks "Place Bid"
   → POST /api/auctions/[id]/bid  (validates min + reserve)
   → Firestore bid doc created
   → RTDB /auctions/{id}/currentBid updated (triggers all listeners)
        ↓
useRealtimeBids (RTDB onValue) → live BidHistory card updates
CountdownDisplay (endsAt) → timer per client
        ↓
endsAt reached → Cloud Function → status: ended
   → winner notification created → payout reserved
```

- Reserve price support — "Reserve not met" badge until met
- Buy-now option for instant purchase during live auction
- Outbid real-time toast notification (RTDB listener)
- Sellers can end auctions early
- Admin moderation: suspend any auction

### 6.3 Cart & Checkout

- Firestore-backed persistent cart (`/cart/{userId}/items/`) — survives page refresh
- Coupon code: server-validated via `POST /api/coupons/validate`
- RipCoins redemption: toggle at checkout, server-enforced max
- Multi-step checkout with URL-based step progression
- Razorpay modal opens client-side; all amounts server-verified
- COD available when admin-enabled in `settings/paymentSettings`
- `useCheckout` hook orchestrates the full flow: address → create order → payment → confirm

### 6.4 Orders & Fulfilment

| Status             | Actor         | Trigger                                   |
| ------------------ | ------------- | ----------------------------------------- |
| `pending`          | System        | Order created, payment not yet confirmed  |
| `confirmed`        | System        | Razorpay webhook payment.captured         |
| `processing`       | Seller        | Seller marks as processing in dashboard   |
| `shipped`          | Seller        | Seller adds tracking number               |
| `delivered`        | System/Seller | Courier confirms + seller marks delivered |
| `cancelled`        | Buyer/Seller  | Within cancellation window                |
| `return_requested` | Buyer         | Within return window                      |
| `refunded`         | Admin/Seller  | Refund processed                          |

- Full `statusHistory` array — append-only audit log
- `OrderTrackingView` — timeline display with icons and timestamps
- Email confirmation via Resend on `confirmed` status
- RipCoins earned after `delivered` status (Cloud Function)
- Sellers see only their own orders via `/seller/orders`

### 6.5 Stores & Sellers

**Seller onboarding flow:**

```
User registers → requests seller role (or admin promotes)
   ↓
POST /api/seller/store → creates StoreDocument + mirrors storeId on user
   ↓
Admin reviews at /admin/stores → Approve / Reject
   ↓
On approval: store.status = "active"  user.storeStatus = "approved"
   ↓
Seller can now list products and auctions
```

- Store page accessible at `/stores/[storeSlug]`
- `isVacationMode` — hides listings, shows vacation banner
- Seller analytics: Recharts revenue chart, top products, payout stats

### 6.6 Reviews System

- Only buyers with a `delivered` order for that product can submit
- Review submitted as `status: pending` — invisible until admin approves
- `MediaGallery` for up to 5 review images; optional video
- Seller can publicly reply to approved reviews
- Admin moderation queue at `/admin/reviews`
- "Was this helpful?" voting (Firestore `helpfulCount` / `notHelpfulCount`)
- Product `rating` + `reviewCount` denormalized (Cloud Function on approve)
- `featured` flag — admin can pin a review on the product page

### 6.7 Blog & Content

- TipTap v3 rich text editor in admin (`RichTextEditor`)
- Posts: draft / published / archived
- Category system with `BlogCategoryTabs`
- `BlogFeaturedCard` hero display for flagged posts
- Related products widget at article bottom
- SEO: per-post `metaTitle`, `metaDescription`, `ogImage`, `publishedAt` Structured Data
- ISR with `revalidate` — fast loads with fresh content

### 6.8 Events & Promotions

- Events: sales, offers, polls, surveys, feedback forms
- `EventBanner` component — auto-hides when `endsAt` is past
- Coupons: percentage, flat, free-shipping, buy-X-get-Y
- Coupon validation: 7 server-side checks (expiry, min order, usage limit, per-user limit, category scope)
- Public coupons visible on `/promotions` with one-click copy
- Admin coupon panel: usage stats, bulk expiry, auto-generate code

### 6.9 FAQs

- Category-filtered accordion (`FAQAccordion`)
- `viewCount` incremented on open (debounced)
- Helpful/Not Helpful voting — persisted per `userId` in Firestore
- Related FAQs sidebar — same category + similar tags
- Contact CTA if no helpful FAQs found
- Admin CRUD at `/admin/faqs`

### 6.10 Search (Algolia)

- `algoliasearch` v5 with server-side index management
- Indexed fields: `title`, `description`, `category`, `tags`, `condition`, `slug`
- Indexing triggered server-side on POST/PATCH/DELETE `/api/products/*`
- `/search` page: SSR initial results + client-side refinement
- `SearchFiltersRow` — filter by category, condition, price range, in-stock

### 6.11 Wishlist

- Firestore-backed: `users/{uid}.wishlist` with four sub-lists: products, auctions, categories, stores
- `WishlistButton` optimistic UI — instant toggle, background Firestore write
- Tabbed wishlist page (`/user/wishlist`) with `WishlistTabs`
- Wishlist count badge on navbar heart icon

### 6.12 Notifications

- Firestore-backed `/notifications/{id}` — created server-side on relevant events
- `NotificationBell` in TitleBar — real-time unread count via `onSnapshot`
- Full notification list at `/user/notifications`
- Notification types: order status, bid outbid, new message, review approved, payout processed
- Bulk actions: mark all read, delete read

### 6.13 RipCoins (Loyalty)

- Earn: `settings/paymentSettings.ripCoinsEarnRate` (₹X spent = 1 coin) — awarded on `delivered` status
- Redeem: `ripCoinsRedeemRate` (1 coin = ₹X discount) — applied at checkout
- Balance tracked in `/ripcoins/{userId}` with full transaction ledger
- `ProfileStatsGrid` shows current balance and lifetime
- Admin can manually adjust balance with a note

### 6.14 Pre-orders

- Products with `isPreorder: true` + `preorderEta` field
- `PreOrderDetailView` — ETA display, deposit amount, "Pay Deposit" CTA
- Deposit order flow: partial payment via Razorpay, balance due on arrival
- `/pre-orders` listing page filters `isPreorder === true`

### 6.15 Chat

- Buyer–Seller messaging around a product or auction
- Firestore `/chat/{chatId}/messages/{messageId}` — real-time via `onSnapshot`
- `unreadCounts` map on chat doc — drives notification badge
- Image attachments via `POST /api/media/upload`
- Admin can view/moderate flagged conversations

---

## 7. Authentication & Sessions

**Auth model:** Backend-only Firebase Admin SDK. The Firebase client SDK is **never** used for Auth, Firestore, or Storage.

```
Client sign-in flow:
  1. User submits email/password (or Google/Apple OAuth popup)
  2. Client calls POST /api/auth/login (or /api/auth/oauth)
  3. API route: verify credentials via Admin SDK, create session cookie
  4. Response sets __session (HttpOnly, Secure, SameSite=Strict, 5-day TTL)
  5. Subsequent requests: verifySessionCookie() in each API route

Session tracking:
  - Each login creates a doc in /sessions/{sessionId}
  - Per-navigation activity refresh (5-min debounce)
  - "My Sessions" in /user/settings — list active sessions
  - One-click remote revoke from any device
  - Admin can revoke any user's sessions at /admin/sessions
```

**OAuth bridge pattern** (Google / Apple popup):

```
Client opens popup → Firebase client popup auth → gets idToken
   → POST /api/auth/oauth { idToken }
   → API verifies with Admin SDK → creates session cookie
   → RTDB /auth_events/{uid} signals popup completion
   → useAuthEvent hook picks it up → redirect
```

---

## 8. RBAC — Role-Based Access Control

```
admin ⊃ moderator ⊃ seller ⊃ user
```

| Role        | Can do                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| `user`      | Browse, buy, review, wishlist, manage own orders & profile                    |
| `seller`    | All of user + manage own store, products, auctions, orders, payouts           |
| `moderator` | All of seller + moderate reviews, FAQs, blog posts, view all orders           |
| `admin`     | All of moderator + user management, role assignment, ban/unban, site settings |

**Protection patterns:**

```tsx
// Component-level
<ProtectedRoute requireAuth requireRole="seller">
  <SellerDashboard />
</ProtectedRoute>

// Route-level (RBAC_CONFIG)
[ROUTES.SELLER.DASHBOARD]: {
  requireAuth: true,
  allowedRoles: ["seller", "moderator", "admin"],
}

// Server-side API guard
const user = await verifySessionCookie(request);
if (!hasRole(user, "admin")) return forbidden();

// Hook-level
const { canAccess } = useCanAccess("seller");
const isAdmin = useHasRole("admin");
```

---

## 9. Payment System

### Razorpay Flow

```
1. POST /api/payment/event/init
   ← { eventId, customToken }   (creates RTDB pending node)
   ← subscribe RTDB /payment_events/{eventId}

2. POST /api/payment/create-order
   { amount (rupees) }
   ← { razorpayOrderId, amount (paise), currency, keyId }

3. Client opens Razorpay modal (checkout.js via useRazorpay)
   User pays via UPI / card / netbanking

4. POST /api/payment/verify
   { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId }
   → HMAC signature verification
   → Server-side amount re-check (prevents under-payment exploit)
   → Create Order doc in Firestore
   → Award RipCoins (async)
   → Trigger confirmation email (Resend)
   → Write outcome to RTDB /payment_events/{eventId}

5. usePaymentEvent hook receives outcome → redirect to /checkout/success
```

### Security

- Razorpay signature verified with HMAC-SHA256 (`RAZORPAY_KEY_SECRET`)
- Server recalculates expected amount — client-provided amount is **never trusted**
- Webhook endpoint (`POST /api/payment/webhook`) independently handles `payment.captured`
- RTDB cleanup Cloud Function removes stale payment bridge nodes after 30 min

### COD Flow

- Enabled via `settings/paymentSettings.codEnabled`
- Order created with `paymentMethod: "cod"`, `paymentStatus: "cod_pending"`
- Seller confirms cash receipt → marks `paymentStatus: "paid"` in dashboard
- COD fee added if `codFee > 0` (shown in cart summary)

---

## 10. Seller Dashboard

| Section          | Features                                                                          |
| ---------------- | --------------------------------------------------------------------------------- |
| Store setup      | `SellerStoreSetupView` for new sellers — name, description, category              |
| Store profile    | Banner upload, logo, bio, website, return/shipping policies, vacation mode        |
| Products         | `DataTable` with create/edit/delete; bulk publish/unpublish; image upload + crop  |
| Auctions         | Create with start price, reserve, buy-now, end time; monitor live bids; end early |
| Orders           | Filter by status; update status with notes; add tracking number                   |
| Analytics        | Revenue Recharts chart, top products table, payout stats grid                     |
| Payouts          | Request payout with bank details; history table with status badges                |
| Status indicator | `SellerStoreView` banner for pending/suspended/rejected stores                    |

---

## 11. Admin Dashboard

### Stats Widgets (Overview)

| Widget                     | Data                                      |
| -------------------------- | ----------------------------------------- |
| Revenue (today/week/month) | Sum of `paymentStatus: "paid"` orders     |
| Orders today               | Count + status breakdown                  |
| Pending reviews            | Moderation queue count                    |
| Pending store approvals    | New seller applications count             |
| Pending payouts            | Payout requests awaiting approval         |
| Low stock alerts           | Products with `stock < 5`                 |
| Active auctions            | Live auction count                        |
| Recent orders              | Latest 10 orders with quick status update |

### Admin Panels

| Panel       | Features                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Users       | `DataTable`, role assignment dropdown, ban/unban toggle, revoke sessions, search by email/name    |
| Products    | All listings — approve, suspend, delete; bulk actions; filter by seller/category/status           |
| Orders      | Platform-wide; filter all statuses; export CSV; manual status override                            |
| Stores      | Approve / Reject / Suspend seller applications; view store profile                                |
| Reviews     | Pending moderation queue; approve / reject with reason; bulk approve; flagged queue               |
| Blog        | TipTap rich text CRUD; draft/published/archived; scheduled publish                                |
| FAQs        | CRUD with category + sort order; bulk publish                                                     |
| Carousel    | Slide CRUD + drag-to-reorder (`sortOrder`); max active slides enforced                            |
| Sections    | Homepage section CRUD; structured carousel config UI (type-specific fields, auto-scroll, etc.)    |
| Categories  | Hierarchical tree editor; parent/child; `productCount` denormalized                               |
| Coupons     | Full coupon lifecycle; usage stats; export usage log                                              |
| Events      | Event/promotion CRUD with date pickers                                                            |
| Payouts     | Approve/reject payout requests; mark as paid                                                      |
| Site        | `SiteBasicInfoForm`, `SiteContactForm`, `SiteSocialLinksForm`, payment settings, announcement bar |
| Sessions    | `AdminSessionsManager` — view/revoke any user's sessions                                          |
| Commissions | `SiteCommissionsForm` — platform fee percentage settings                                          |

---

## 12. API Routes

All backend API routes live under `src/app/api/`. Firebase Admin SDK only — no client SDK here.

```
POST   /api/auth/login                 ← email/password login → session cookie
POST   /api/auth/register              ← create account
POST   /api/auth/logout                ← clear session cookie
POST   /api/auth/oauth                 ← Google/Apple idToken → session cookie
POST   /api/auth/forgot-password       ← send reset email (Resend)
POST   /api/auth/reset-password        ← validate token + update password
GET    /api/auth/session               ← verify cookie → return user profile
POST   /api/auth/activity              ← refresh session lastActivityAt

GET    /api/products                   ← listing (filter, sort, paginate)
POST   /api/products                   ← create (seller/admin)
GET    /api/products/[id]              ← single product
PATCH  /api/products/[id]              ← update
DELETE /api/products/[id]              ← delete + remove from Algolia

GET    /api/auctions                   ← listing
POST   /api/auctions                   ← create auction
GET    /api/auctions/[id]              ← single auction
PATCH  /api/auctions/[id]              ← update
POST   /api/auctions/[id]/bid          ← place bid (validates min, auth)
POST   /api/auctions/[id]/end          ← end early (seller/admin)

GET    /api/orders                     ← list (buyer/seller/admin scoped)
POST   /api/orders                     ← create order (COD flow)
GET    /api/orders/[id]                ← single order
PATCH  /api/orders/[id]                ← update status, tracking (seller/admin)
POST   /api/orders/[id]/cancel         ← cancellation request

POST   /api/payment/event/init         ← create RTDB payment bridge node
POST   /api/payment/create-order       ← create Razorpay order
POST   /api/payment/verify             ← HMAC verify + fulfil order
POST   /api/payment/webhook            ← Razorpay webhook (payment.captured)

GET    /api/cart                       ← get cart items
POST   /api/cart                       ← add item
PATCH  /api/cart/[itemId]              ← update qty
DELETE /api/cart/[itemId]              ← remove item
POST   /api/coupons/validate           ← server-side coupon check

GET    /api/stores                     ← public store listing
GET    /api/stores/[slug]              ← store detail
GET    /api/stores/[slug]/products     ← store's products
GET    /api/stores/[slug]/auctions     ← store's auctions
GET    /api/stores/[slug]/reviews      ← store reviews

GET    /api/reviews                    ← list approved reviews
POST   /api/reviews                    ← submit review (verified buyer check)
PATCH  /api/reviews/[id]               ← update (owner only)
DELETE /api/reviews/[id]
POST   /api/reviews/[id]/vote          ← helpful/not-helpful vote
POST   /api/reviews/[id]/reply         ← seller reply

GET    /api/blog                       ← list posts
POST   /api/blog                       ← create (admin)
GET    /api/blog/[slug]                ← single post
PATCH  /api/blog/[slug]
DELETE /api/blog/[slug]

GET    /api/faqs                       ← list FAQs
POST   /api/faqs                       ← create (admin)
PATCH  /api/faqs/[id]
DELETE /api/faqs/[id]
POST   /api/faqs/[id]/vote             ← helpful vote

GET    /api/categories                 ← category tree
POST   /api/categories
PATCH  /api/categories/[id]
DELETE /api/categories/[id]

GET    /api/user/profile               ← current user profile
PATCH  /api/user/profile               ← update display name, avatar
POST   /api/user/avatar                ← upload + crop avatar
GET    /api/user/addresses             ← list addresses
POST   /api/user/addresses             ← create address
PATCH  /api/user/addresses/[id]        ← update
DELETE /api/user/addresses/[id]
PATCH  /api/user/addresses/[id]/default ← set default

GET    /api/user/orders                ← buyer's order history
GET    /api/user/notifications         ← user notifications
PATCH  /api/user/notifications/[id]    ← mark read
POST   /api/user/notifications/mark-all ← mark all read
GET    /api/user/sessions              ← active sessions
DELETE /api/user/sessions/[id]         ← revoke session

GET    /api/seller/store               ← GET store, POST create, PATCH update
POST   /api/seller/store
PATCH  /api/seller/store
GET    /api/seller/products            ← seller's product listing
GET    /api/seller/orders              ← seller's orders
GET    /api/seller/payouts             ← payout history
POST   /api/seller/payouts             ← request payout
GET    /api/seller/analytics           ← revenue + stats

GET    /api/admin/users                ← all users
PATCH  /api/admin/users/[uid]/role     ← assign role
PATCH  /api/admin/users/[uid]/ban      ← ban / unban
GET    /api/admin/stores               ← all stores
PATCH  /api/admin/stores/[uid]         ← approve / reject / suspend
GET    /api/admin/reviews              ← pending + all reviews
PATCH  /api/admin/reviews/[id]         ← approve / reject
GET    /api/admin/payouts              ← payout queue
PATCH  /api/admin/payouts/[id]         ← approve / reject / mark paid
GET    /api/admin/sessions             ← all sessions
DELETE /api/admin/sessions/[id]        ← revoke any session

GET    /api/homepage-sections          ← active sections
POST   /api/homepage-sections          ← create (admin)
PATCH  /api/homepage-sections/[id]
DELETE /api/homepage-sections/[id]
POST   /api/homepage-sections/reorder  ← update sortOrder

GET    /api/carousel                   ← active slides
POST   /api/carousel
PATCH  /api/carousel/[id]
DELETE /api/carousel/[id]
POST   /api/carousel/reorder

GET    /api/coupons                    ← admin coupon list
POST   /api/coupons
PATCH  /api/coupons/[code]
DELETE /api/coupons/[code]

POST   /api/media/upload               ← upload image/video → Firebase Storage
POST   /api/media/crop                 ← server-side image crop (sharp)
POST   /api/media/trim                 ← server-side video trim (fluent-ffmpeg)

GET    /api/settings                   ← site config + payment settings
PATCH  /api/settings/site              ← update site config (admin)
PATCH  /api/settings/payment           ← update payment settings (admin)

POST   /api/newsletter                 ← subscribe / unsubscribe

GET    /api/search                     ← Algolia proxy (hides admin key)

POST   /api/logs/write                 ← ingest client logs to server

POST   /api/chat                       ← create chat room
GET    /api/chat/[id]/messages         ← message history
POST   /api/chat/[id]/messages         ← send message
```

Each route is created with `createApiHandler` (centralized error handling, logging, auth extraction).

---

## 13. Cloud Functions

All scheduled jobs and Firestore triggers live in `functions/src/` — **never** inside Next.js API routes.

```
Triggers:
  onProductWrite       → sync to Algolia index on create/update/delete
  onReviewApprove      → update product rating + reviewCount atomically
  onOrderDelivered     → award RipCoins to buyer (earn rate from settings)
  onAuctionEnd         → finalize winner, send notifications, create order
  onBidPlaced          → update RTDB currentBid, notify previous high bidder

Scheduled (cron):
  auctions/scheduler   ← every 5 min — set status: upcoming→live, live→ended
  payment/cleanup      ← every 30 min — remove stale RTDB payment_events nodes
  sessions/cleanup     ← daily — delete expired session docs
  coins/expiry         ← monthly — expire RipCoins unused > 12 months
  lowstock/alert       ← daily — email admin if stock < threshold
```

---

## 14. i18n — Internationalisation

**Library:** `next-intl` v4 (App Router native)

| Locale | Language | Status     |
| ------ | -------- | ---------- |
| `en`   | English  | Default ✅ |
| `hi`   | Hindi    | Active ✅  |

```
messages/
  en.json     ← source of truth (100% complete)
  hi.json     ← Hindi translations
  in.json     ← (planned) Bahasa Indonesia
  mh.json     ← (planned) Marathi / Mh variant
  tn.json     ← (planned) Tamil Nadu variant
  ts.json     ← (planned) Telangana variant
```

**Routing:** `localePrefix: "as-needed"` — `/products` (English) vs `/hi/products` (Hindi)

**Rules:**

- Client components → `useTranslations('namespace')`
- Server components → `await getTranslations('namespace')`
- Never call `useTranslations` at module scope
- Interpolation: `t("key", { variable })` — never `.replace()`
- Dynamic Firestore content: `LocalizedString { en: string; hi?: string }` + `getLocalizedValue(field, locale)`

**Translation namespaces (en.json top-level keys):**
`loading`, `empty`, `errorPages`, `actions`, `sort`, `form`, `status`, `roles`, `confirm`, `messages`, `nav`, `auth`, `profile`, `wishlist`, `settings`, `table`, `products`, `cart`, `orders`, `checkout`, `auctions`, `search`, `seller`, `homepage`, `footer`, `accessibility`, `sellerStore`, `blog`, `faqs`, `promotions`, `events`, `reviews`, `categories`, `notifications`

---

## 15. PWA & Service Worker

- **Library:** Serwist (Workbox successor)
- **Entry point:** `src/sw.ts`
- **Manifest:** `src/app/manifest.ts` — name, icons, theme color, display mode
- **Public HTML fallbacks:** `public/auth.html`, `public/error.html` — crash-safe proxy fallback
- **Caching strategy:**
  - Static assets: cache-first
  - API routes: network-first
  - Images: stale-while-revalidate
- **Installable:** "Add to Home Screen" prompt on mobile
- **Offline fallback:** Custom offline page for navigation requests

---

## 16. Security Architecture

| Area                       | Implementation                                                                   |
| -------------------------- | -------------------------------------------------------------------------------- |
| Auth tokens                | HttpOnly, Secure, SameSite=Strict session cookies — no token in JS               |
| Firebase SDK isolation     | Admin SDK server-only — client never holds credentials                           |
| Payment integrity          | Server recalculates amount before Razorpay order creation; rejects mismatches    |
| Razorpay webhook           | HMAC-SHA256 signature verification via `RAZORPAY_WEBHOOK_SECRET`                 |
| File upload                | Stage locally → POST FormData to API route → server writes to Firebase Storage   |
| Input validation           | Zod v4 on all API route inputs + client forms                                    |
| XSS                        | TipTap output sanitised server-side before storage; no `dangerouslySetInnerHTML` |
| RBAC enforcement           | `verifySessionCookie()` + role check in every protected API route                |
| Rate limiting              | Session creation endpoint rate-limited (AUTH.RATE_LIMIT_EXCEEDED)                |
| Firestore rules            | `firestore.rules` — all reads/writes validated server-side; client has no access |
| Storage rules              | `storage.rules` — enforces authenticated upload paths                            |
| RTDB rules                 | `database.rules.json` — payment bridge write-once, read scoped by eventId        |
| Session revocation         | Per-session `isRevoked` flag; `adminAuth.revokeRefreshTokens()` on full logout   |
| No `console.log()`         | `logger` (client) / `serverLogger` (API routes) — structured + levelled          |
| No `alert()` / `confirm()` | `useMessage()` toast + `ConfirmDeleteModal`                                      |
| Logging                    | Client errors → `POST /api/logs/write` → server log ingestion                    |

---

## 17. Implementation Status

### Fully Implemented ✅

| Domain                  | Status                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| Three-tier architecture | Complete — all business components in `src/features/`, Tier 1 fully extracted   |
| Firebase Admin Auth     | HttpOnly session cookies, OAuth popup bridge, session tracking + revoke         |
| RBAC system             | 4 roles, `RBAC_CONFIG`, `ProtectedRoute`, `useHasRole`, server-side guards      |
| Product catalog         | CRUD, filters (URL params), Algolia indexing, image gallery, `MediaLightbox`    |
| Auction system          | Real-time bids via RTDB, `useRealtimeBids`, `BidHistory`, `CountdownDisplay`    |
| Cart & Checkout         | Persistent Firestore cart, coupon, RipCoins toggle, multi-step checkout         |
| Razorpay payments       | Full flow — create order, verify, RTDB bridge, webhook, amount integrity check  |
| Orders                  | Full lifecycle, `statusHistory`, `OrderTrackingView`, guest tracking page       |
| Seller dashboard        | Store CRUD, product/auction management, analytics, payouts, vacation mode       |
| Admin dashboard         | Users, stores approval, orders, reviews, blog, FAQs, carousel, sections, site   |
| Reviews                 | Submit, moderate, helpful vote, seller reply, `MediaGallery`                    |
| Blog                    | TipTap editor, draft/published, `BlogFeaturedCard`, SEO metadata                |
| FAQs                    | Accordion, helpful voting, category sidebar, related FAQs, Contact CTA          |
| Wishlist                | 4-tab (products/auctions/categories/stores), `WishlistButton` optimistic UI     |
| Notifications           | Real-time bell (`onSnapshot`), full list, bulk mark read/delete                 |
| RipCoins                | Earn/redeem/expire logic, balance display, transaction ledger                   |
| i18n (EN + HI)          | `next-intl` v4, `[locale]` routing, translation files, `LocaleSwitcher`         |
| Design system           | `THEME_CONSTANTS` fully documented, all component primitives extracted          |
| Media system            | `MediaImage`, `MediaVideo`, `MediaAvatar`, `MediaGallery`, `MediaLightbox`      |
| PWA                     | Serwist service worker, `manifest.ts`, installable                              |
| Stores                  | `StoreDocument`, `storeRepository`, separate from seller user, public directory |
| Sessions                | Per-session tracking, "My Sessions" page, admin session manager                 |
| Store entity separation | `StoreDocument` in `/stores/{slug}`, mirrored on user doc                       |
| Seed data               | 50 products, 29 reviews, full relationship coverage, Picsum stable URLs         |
| Cloud Functions         | Auction scheduler, payment cleanup, RTDB triggers, session cleanup              |

### Planned / In Progress

| Domain                 | Notes                                                                             |
| ---------------------- | --------------------------------------------------------------------------------- |
| Chat system            | Schema defined; API routes + UI components pending                                |
| Pre-orders deposit     | `PreOrderDetailView` built; partial-payment Razorpay flow pending                 |
| Playwright E2E tests   | Jest + RTL unit tests present; E2E suite planned                                  |
| Additional locales     | `in.json`, `mh.json`, `tn.json`, `ts.json` message files present; routing pending |
| Seller guide page      | Route exists; content pending                                                     |
| Help centre            | Route exists; article system pending                                              |
| SMS notifications      | `smsCounters` schema present; provider integration pending                        |
| Shiprocket / courier   | Manual shipping + tracking number today; Shiprocket API integration planned       |
| Admin analytics charts | Seller charts done; platform-wide Recharts dashboard in progress                  |

---

## Appendix: What FatCat Collectibles & Licorice Herbals Plans Contributed

The two reference plans were single-seller storefronts with WhatsApp-based payments — simpler checkout models suited to small D2C Indian brands. Key ideas evaluated:

| Idea from reference plans             | LetItRip decision                                                          |
| ------------------------------------- | -------------------------------------------------------------------------- |
| WhatsApp payment (zero gateway fees)  | Not used — Razorpay preferred; multi-seller commission model needs gateway |
| Loyalty coins                         | ✅ Implemented as **RipCoins**                                             |
| Announcement bar from Firestore       | ✅ Implemented in `settings/siteConfig.announcementBar`                    |
| ISR for product/collection pages      | ✅ Used on product detail, blog, categories pages                          |
| Trust badges section                  | ✅ `TrustIndicatorsSection` on homepage                                    |
| FAQ accordion from Firestore          | ✅ `FAQSection` on homepage + dedicated `/faqs` page                       |
| Shiprocket integration                | Planned for seller shipping workflow                                       |
| Corporate gifting                     | Not applicable for general marketplace                                     |
| Free consultation booking             | Not applicable                                                             |
| LocalizedString for Firestore content | ✅ Same pattern used for bilingual product/blog content                    |
| Rich-text admin editor                | ✅ TipTap v3 for blog + product descriptions                               |
| Seller vacation mode                  | ✅ `isVacationMode` on `StoreDocument`                                     |
| Review moderation queue               | ✅ Admin `/admin/reviews` pending queue                                    |
| Invoice PDF download                  | Planned                                                                    |
