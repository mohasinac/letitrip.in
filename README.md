# LetItRip.in — Multi-Seller E-commerce & Auction Platform

> Next.js 16 · TypeScript · Firebase · Tailwind CSS · Razorpay · i18n (EN/HI)

---

## Overview

LetItRip.in is a production-grade multi-seller marketplace and auction platform built on the Next.js 16 App Router. It supports standard product listings, time-limited auctions with real-time bidding, a full seller dashboard, admin controls, Razorpay payments, Firebase backend services, and bilingual (English / Hindi) support throughout.

---

## Feature Highlights

| Domain               | What it does                                                                  |
| -------------------- | ----------------------------------------------------------------------------- |
| **Products**         | Multi-seller catalog, inventory, variants, conditions, image gallery          |
| **Auctions**         | Time-limited bidding, real-time bid updates via Firebase RTDB, reserve prices |
| **Orders**           | End-to-end order lifecycle, shipping tracking, refund flow                    |
| **Cart & Checkout**  | Persistent cart, address selection, coupon codes, Razorpay payment modal      |
| **Stores**           | Individual seller storefronts with ratings and product listings               |
| **Blog**             | CMS-style blog with categories, featured posts, search                        |
| **Events**           | Promotional events (sales, offers, polls, surveys, feedback)                  |
| **FAQs**             | Searchable FAQ with categories, helpful voting, view counts                   |
| **Reviews**          | Product reviews with star ratings                                             |
| **Search**           | Full-text search powered by Algolia                                           |
| **Promotions**       | Coupon management, discount codes, promotional banners                        |
| **Notifications**    | In-app notification bell with real-time unread count                          |
| **Wishlist**         | Saved products, auctions, categories, and stores                              |
| **Seller Dashboard** | Order management, product/auction CRUD, payouts, analytics                    |
| **Admin Dashboard**  | Platform-wide controls, user management, moderation, bulk actions             |
| **PWA**              | Installable progressive web app with service worker (Serwist)                 |

---

## Tech Stack

| Layer          | Technology                                                    |
| -------------- | ------------------------------------------------------------- |
| **Framework**  | Next.js 16.1.6 — App Router, React Server Components          |
| **Language**   | TypeScript 5, strict mode                                     |
| **Styling**    | Tailwind CSS 3.4 + `THEME_CONSTANTS` design system            |
| **Database**   | Firebase Firestore (CRUD), Firebase RTDB (real-time events)   |
| **Auth**       | Firebase Admin SDK — HttpOnly session cookies (no client SDK) |
| **Storage**    | Firebase Storage — server-side upload only                    |
| **Functions**  | Firebase Cloud Functions (cron jobs + Firestore triggers)     |
| **Payments**   | Razorpay — UPI, cards, netbanking (India)                     |
| **Email**      | Resend                                                        |
| **Search**     | Algolia `algoliasearch` v5                                    |
| **i18n**       | `next-intl` v4 — English + Hindi                              |
| **Rich Text**  | TipTap v3                                                     |
| **Charts**     | Recharts v3                                                   |
| **Media**      | `sharp` image processing, `fluent-ffmpeg` video               |
| **Validation** | Zod v4                                                        |
| **Dev Server** | Turbopack (`npm run dev`)                                     |
| **Prod Build** | Webpack (`npm run build`)                                     |
| **Testing**    | Jest + React Testing Library                                  |

---

## Architecture

The codebase follows a strict three-tier layered architecture:

```
Tier 3 — Pages        src/app/
  Thin orchestration shells. Each page ≤ 150 lines.
  Composes Tier 1 + Tier 2 only.

Tier 2 — Feature Modules   src/features/<name>/
  Self-contained vertical slices. Each owns:
    components/   hooks/   types/   constants/   index.ts
  Imports Tier 1 only. Never imports from another feature.

Tier 1 — Shared Primitives  src/components/  src/hooks/
                             src/utils/       src/helpers/
                             src/classes/     src/constants/
  Feature-agnostic building blocks.
  Extractable to @letitrip/* npm packages with only tsconfig changes.
```

**Import rule (enforced via lint):** Always use barrel imports — `@/components`, `@/hooks`, `@/features/products` — never deep paths.

### Feature Modules (`src/features/`)

| Module        | Domain                                                    |
| ------------- | --------------------------------------------------------- |
| `about/`      | About page sections                                       |
| `admin/`      | Admin dashboard views                                     |
| `auth/`       | Login, register, OAuth, email verify                      |
| `blog/`       | Blog listing, article detail                              |
| `cart/`       | Cart UI, checkout flow                                    |
| `categories/` | Category browsing + inline creation widget                |
| `contact/`    | Contact page + form                                       |
| `events/`     | Event listing + banners                                   |
| `faq/`        | FAQ search, accordion, sidebar, voting                    |
| `homepage/`   | Hero carousel, featured sections, trust indicators        |
| `products/`   | Product card, grid, detail, image gallery, filters        |
| `promotions/` | Coupon cards, product promo sections                      |
| `reviews/`    | Review cards, rating display                              |
| `search/`     | Search results, filter row                                |
| `seller/`     | Seller dashboard, payout, addresses                       |
| `stores/`     | Store listing, store card                                 |
| `user/`       | Profile, sessions, notification bell, address widgets     |
| `wishlist/`   | Wishlist tabs (products / auctions / categories / stores) |

### Page Routes (`src/app/[locale]/`)

All routes are locale-prefixed (`/en/`, `/hi/`) and resolved by `src/proxy.ts`.

```
/                   Homepage
/products           Product catalog
/products/[slug]    Product detail
/auctions           Auction listing
/auctions/[slug]    Auction detail
/stores             Store directory
/stores/[slug]      Store detail
/categories         Category browser
/cart               Shopping cart
/checkout           Checkout
/search             Search results
/blog               Blog listing
/blog/[slug]        Blog article
/events             Active events
/faqs               FAQ page
/promotions         Coupons & promotions
/reviews            Reviews listing
/auth/login         Sign in
/auth/register      Sign up
/auth/verify-email  Email verification
/user/*             User dashboard (profile, orders, sessions, wishlist)
/seller/*           Seller dashboard (products, auctions, orders, payouts)
/admin/*            Admin dashboard (users, orders, settings, moderation)
/about              About page
/contact            Contact page
/help               Help center
/privacy            Privacy policy
/terms              Terms of service
/refund-policy      Refund policy
/unauthorized       Access denied
/track              Order tracking
```

### API Routes (`src/app/api/`)

Backend-only Firebase architecture — all auth, Firestore, and Storage operations happen in API routes using the Firebase Admin SDK. The UI never holds credentials.

Key API surfaces:

| Prefix                 | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `/api/auth/*`          | Login, logout, register, OAuth, session activity, password reset |
| `/api/products/*`      | Product CRUD, search, bulk actions                               |
| `/api/auctions/*`      | Auction CRUD, bid placement                                      |
| `/api/orders/*`        | Order lifecycle, fulfilment, shipping                            |
| `/api/payment/*`       | Razorpay order creation, signature verify, webhook               |
| `/api/admin/*`         | User management, role assignment, platform settings              |
| `/api/seller/*`        | Seller-facing order/product management, payouts                  |
| `/api/blog/*`          | Blog CRUD                                                        |
| `/api/reviews/*`       | Review submission and moderation                                 |
| `/api/notifications/*` | Notification read/mark                                           |
| `/api/logs/write`      | Server-side log ingestion                                        |

---

## Authentication & Security

**Auth model:** Backend-only Firebase Admin SDK. The Firebase client SDK is **never** used for Auth/Firestore/Storage.

- Every auth operation flows through Next.js API routes
- Sessions stored as HttpOnly, Secure, SameSite=Strict cookies (`__session`, `__session_id`)
- 5-day session TTL with per-navigation activity refresh
- Sessions tracked in Firestore `sessions` collection; revocable from "My Sessions" UI
- API routes call `verifySessionCookie()` (wraps `adminAuth.verifySessionCookie(cookie, true)`)

**RBAC — four roles with inheritance:**

```
admin ⊃ moderator ⊃ seller ⊃ user
```

Protection options: `<ProtectedRoute>` component, `<RouteProtection>` auto-detection, `withProtectedRoute` HOC, `useHasRole()` / `useCanAccess()` hooks, `hasRouteAccess()` server utility. All route permissions declared in `RBAC_CONFIG` in `src/constants/rbac.ts`.

**Proxy (`src/proxy.ts`)**: Intercepts every non-asset, non-API request for locale detection and URL rewriting. Crash-safe — any unhandled error redirects to the static `/public/error.html` to prevent redirect loops.

---

## Payments

Razorpay integration (India — UPI, cards, netbanking):

1. Client calls service → `POST /api/payment/create-order` (server creates Razorpay order, returns `orderId` + `keyId`)
2. Client opens Razorpay checkout modal
3. On success: `POST /api/payment/verify` verifies HMAC signature and fulfils the order
4. Server writes result to Firebase RTDB payment bridge channel
5. Client `usePaymentEvent` hook receives the real-time result without polling

All amounts server-side in paise (`rupeesToPaise()` / `paiseToRupees()` helpers).

---

## Internationalisation

Two locales: **English (`en`)** and **Hindi (`hi`)**. Every user-visible string lives in `messages/en.json` / `messages/hi.json`. Components use `useTranslations(namespace)` from `next-intl`. Hardcoded strings in JSX are a lint violation.

---

## Shared Primitives (Tier 1)

### Design System

`THEME_CONSTANTS` in `src/constants/theme.ts` — Tailwind utility maps covering colors, typography, spacing, grid, flex, card, input, button, badge, alert, shadow, and transition patterns. **Never** hardcode Tailwind classes for shared patterns — always use `THEME_CONSTANTS.*`.

### Typography & Semantic HTML

Custom primitives replace raw HTML tags: `Heading`, `Text`, `Caption`, `Label`, `Span`, `TextLink` for typography; `Button`, `Section`, `Nav`, `Ul`, `Li`, `Card` for structure. Raw HTML tags (`<h1>`, `<p>`, `<button>`, etc.) are prohibited in JSX.

### Media

`MediaImage`, `MediaVideo`, `MediaAvatar`, `MediaGallery` from `@/components` — all media wrapped in `aspect-*` containers. Never use fixed `h-[px]` wrappers.

### Key Hooks

| Hook                                                | Purpose                                   |
| --------------------------------------------------- | ----------------------------------------- |
| `useAuth`                                           | Session user, role, loading state         |
| `useApiQuery` / `useApiMutation`                    | Service-layer data fetching               |
| `useUrlTable`                                       | Filter / sort / page state in URL params  |
| `usePendingTable`                                   | Staged filters with explicit Apply button |
| `useMessage`                                        | Toast / snackbar notifications            |
| `useBulkAction`                                     | Bulk-action request lifecycle             |
| `useBulkSelection`                                  | Multi-select state for data tables        |
| `useRealtimeEvent`                                  | Firebase RTDB subscription wrapper        |
| `usePaymentEvent` / `useAuthEvent` / `useBulkEvent` | Domain RTDB bridges                       |
| `useSwipe` / `useGesture` / `useLongPress`          | Touch gesture detection                   |

### Singleton Classes (`src/classes/`)

`CacheManager`, `StorageManager`, `Logger`, `EventBus`, `Queue` — imported as instances from `@/classes`.

---

## Cloud Functions (`functions/src/`)

| Type     | File                         | Schedule / Trigger                                                       |
| -------- | ---------------------------- | ------------------------------------------------------------------------ |
| Cron     | `weeklyPayoutEligibility.ts` | Every Sunday — marks sellers payout-eligible with 5% platform commission |
| Triggers | `functions/src/triggers/`    | Firestore document triggers (order status, review moderation)            |

All Firebase Functions logic lives in `functions/src/`. Scheduled jobs and triggers **must not** be placed in Next.js API routes.

---

## Prerequisites

- Node.js 20+
- Firebase project with Firestore, Realtime Database, Storage, and Authentication enabled
- Razorpay account
- Resend account
- Algolia application (optional — search degrades gracefully)
- Vercel account (for deployment)

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in credentials
cp .env.example .env.local

# 3. Start dev server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables (`.env.local`)

| Variable                             | Purpose                                           |
| ------------------------------------ | ------------------------------------------------- |
| `FIREBASE_PROJECT_ID`                | Firestore / Auth project                          |
| `FIREBASE_ADMIN_PRIVATE_KEY`         | Admin SDK private key                             |
| `FIREBASE_ADMIN_CLIENT_EMAIL`        | Admin SDK service account email                   |
| `NEXT_PUBLIC_FIREBASE_*`             | Client config for RTDB custom-token subscriptions |
| `RAZORPAY_KEY_ID`                    | Razorpay API key                                  |
| `RAZORPAY_KEY_SECRET`                | Razorpay secret                                   |
| `RAZORPAY_WEBHOOK_SECRET`            | Webhook HMAC secret                               |
| `RESEND_API_KEY`                     | Transactional email                               |
| `ALGOLIA_APP_ID` / `ALGOLIA_API_KEY` | Search                                            |
| `NEXT_PUBLIC_APP_URL`                | Canonical app URL                                 |

---

## Scripts

### Development

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build (Webpack)
npm start            # Start production server
npx tsc --noEmit     # Type-check only (no emit)
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm test             # Jest test suite
npm test -- --watch  # Watch mode
npm test -- --coverage  # Coverage report
```

### Deployment — Firestore / Firebase

```powershell
# Deploy Firestore composite indices
.\scripts\deploy-firestore-indices.ps1

# Deploy Firestore, Storage, and RTDB security rules
.\scripts\deploy-firestore-rules.ps1

# Deploy Cloud Functions
.\scripts\deploy-functions.ps1

# Check Firestore index status
.\scripts\check-firestore-status.ps1
```

### Deployment — Vercel

```powershell
# Sync .env.local → Vercel (all environments)
.\scripts\sync-env-to-vercel.ps1

# Dry-run (preview what would sync)
.\scripts\sync-env-to-vercel.ps1 -DryRun

# Pull env from Vercel to local file
.\scripts\pull-env-from-vercel.ps1
```

### Seed Data

```bash
# Seed all collections
npx ts-node scripts/seed-all-data.ts

# Seed only FAQs
npm run seed:faqs
```

---

## Production Build

```bash
npm run build   # Webpack build (Turbopack has a chunk bug with large const objects in Next.js 16)
npm start
```

Before any PR or deployment:

```bash
npx tsc --noEmit   # must be zero errors
npm run build      # must succeed
npm test           # must pass
```

---

## Testing

```bash
npm test                            # All tests
npm test -- --watch                 # Watch mode
npm test -- --coverage              # Coverage
npm test -- --testPathPattern=foo   # Filter by path
```

Tests live alongside the code they test (`*.test.ts` / `*.test.tsx`). Mock Firebase and Next.js in `jest.setup.ts`.

---

## Documentation

| Document                                                             | Purpose                                                                                               |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [docs/GUIDE.md](./docs/GUIDE.md)                                     | Complete code inventory — every function, hook, component, constant, schema, repository, API endpoint |
| [docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)                 | Canonical patterns and code snippets                                                                  |
| [docs/AUTH.md](./docs/AUTH.md)                                       | Authentication architecture, session model, OAuth popup bridge                                        |
| [docs/RBAC.md](./docs/RBAC.md)                                       | Role-based access control — roles, config, protection patterns                                        |
| [docs/PAYMENT.md](./docs/PAYMENT.md)                                 | Razorpay integration, order flow, RTDB bridge                                                         |
| [docs/ERROR_HANDLING.md](./docs/ERROR_HANDLING.md)                   | Error architecture, logging, error pages                                                              |
| [docs/SECURITY.md](./docs/SECURITY.md)                               | Security practices, OWASP compliance                                                                  |
| [docs/APPLICATION_GRAPH.md](./docs/APPLICATION_GRAPH.md)             | Full page/component/hook/API dependency map                                                           |
| [docs/STYLING_GUIDE.md](./docs/STYLING_GUIDE.md)                     | Styling standards, THEME_CONSTANTS usage                                                              |
| [docs/BULK_ACTIONS.md](./docs/BULK_ACTIONS.md)                       | Bulk action API specification                                                                         |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md)                             | Version history (March 2026 onward)                                                                   |
| [docs/CHANGELOG_ARCHIVE.md](./docs/CHANGELOG_ARCHIVE.md)             | Archived history (v1.0.0 – v1.2.0)                                                                    |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                                 | Contribution workflow and rules                                                                       |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | Mandatory coding rules and architecture constraints                                                   |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Key rules:

- Barrel imports only — `@/components`, never `@/components/ui/Button`
- No raw HTML tags — use `Heading`, `Text`, `Button`, `Section`, etc.
- No hardcoded strings — use `useTranslations()` from `next-intl`
- No Firebase client SDK in UI — Auth/Firestore/Storage are backend-only
- Pages ≤ 150 lines — extract to `src/features/<name>/components/<Domain>View.tsx`
- No `console.log()` — use `logger` (client) or `serverLogger` (API routes)
- Filter/sort/page state in URL — use `useUrlTable`, never `useState`
- Build must pass before handing back: `npx tsc --noEmit` → `npm run build`

---

## License

MIT
