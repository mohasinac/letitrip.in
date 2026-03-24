# @mohasinac/\* Full Migration Plan — letitrip.in

> **Goal**: letitrip.in delegates all reusable domain logic to `@mohasinac/*`
> packages. App-specific configuration, overrides, and letitrip-only business
> logic stay local.
>
> **Start date**: 2026-03-19 | **Last updated**: 2026-03-24
> **Active workspace**: `D:\proj\letitrip.in`

---

## Blocker Analysis (2026-03-24)

Before reading the phase-by-phase tracker, understand WHY certain routes stay local permanently:

| Blocker                               | Affected routes                                                                                         | Explanation                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PII encryption**                    | `/api/user/profile`, `/api/user/addresses`, `/api/user/orders`, `/api/admin/users`, `/api/admin/orders` | letitrip encrypts PII fields (email, phone, address) at rest via AES. Package repos use raw `IRepository<T>` with no encryption layer. Encrypted reads/writes must stay in local Firebase-backed repos.                                                                                                                                  |
| **Firebase session tracking**         | All `/api/auth/*` routes                                                                                | letitrip maintains a `sessions` Firestore collection tracking device info, revocation status, and activity. This is letitrip-specific. The packages handle cookie creation/verification via `ISessionProvider` but do NOT manage the sessions collection.                                                                                |
| **Firebase REST API for passwords**   | `/api/auth/login`, `/api/auth/register`                                                                 | Password verification uses `accounts:signInWithPassword` REST endpoint (requires `FIREBASE_API_KEY`). `IAuthProvider` does not abstract this — it's Firebase-specific. Creating a session cookie requires a Firebase ID token; `ISessionProvider.createSession(AuthPayload)` cannot create a Firebase session cookie from payload alone. |
| **Cart schema mismatch**              | `/api/cart/*`                                                                                           | letitrip stores the cart as a **single document per user** (doc ID = userId, items array inside). The `feat-cart` package is designed for a **collection per item** (one doc per cart item). Not compatible without a schema migration.                                                                                                  |
| **Subcollection pattern**             | `/api/user/wishlist`, `/api/user/addresses`                                                             | These use Firestore subcollections (`users/{uid}/wishlist/{productId}`). `IRepository<T>` targets top-level collections; subcollection paths are not supported without a provider-level extension.                                                                                                                                       |
| **Razorpay / Shiprocket**             | `/api/payment/*`, `/api/seller/shipping`, `/api/seller/payouts`                                         | These providers are not yet wrapped in `IPaymentProvider` / `IShippingProvider` implementations. Stub packages (`@mohasinac/payment-razorpay`, `@mohasinac/shipping-shiprocket`) don't exist yet.                                                                                                                                        |
| **Auction schema mismatch**           | `/api/bids/*`, `/api/auctions/*`                                                                        | letitrip bid documents use `productId` field; `feat-auctions` uses `auctionId`. Different field name causes Sieve filter `auctionId=={value}` to return no results. Requires a Firestore schema migration.                                                                                                                               |
| **Complex aggregation**               | `/api/admin/dashboard`, `/api/admin/analytics`, `/api/promotions`                                       | These routes combine reads from multiple repositories and compute derived stats. No general-purpose aggregation abstraction exists in packages.                                                                                                                                                                                          |
| **letitrip-specific response shapes** | Admin list routes                                                                                       | Admin list endpoints return `{ products: [...], meta: {...} }` (field name `products`). Package handlers return `{ items: [...], ... }`. Changing the shape requires updating all admin hooks/views simultaneously — a larger refactor.                                                                                                  |

---

## Current Status (2026-03-24)

### ✅ COMPLETE — Infrastructure Layer

| Component                          | Status | How it works                                                          |
| ---------------------------------- | ------ | --------------------------------------------------------------------- |
| `providers.config.ts`              | ✅     | `registerProviders()` wires db, auth, email, storage, style           |
| `features.config.ts`               | ✅     | All Tier B+C features enabled                                         |
| `tsconfig.json` paths              | ✅     | 40+ `@mohasinac/*` path aliases                                       |
| `next.config.js` transpilePackages | ✅     | All packages transpiled                                               |
| `src/i18n/request.ts`              | ✅     | `mergeFeatureMessages()` from `@mohasinac/cli/i18n`                   |
| `src/app/layout.tsx`               | ✅     | Imports `@/providers.config` at startup                               |
| `src/lib/firebase/admin.ts`        | ✅     | Thin shim → `@mohasinac/db-firebase`                                  |
| `src/lib/errors/`                  | ✅     | Thin shims → `@mohasinac/errors`                                      |
| `src/lib/security/csp.ts`          | ✅     | Thin shim → `@mohasinac/security`                                     |
| `src/lib/security/rate-limit.ts`   | ✅     | Thin shim → `@mohasinac/security`                                     |
| `src/lib/seo/`                     | ✅     | Thin shim → `@mohasinac/seo`                                          |
| `src/lib/monitoring/`              | ✅     | Thin shim → `@mohasinac/monitoring`                                   |
| `src/lib/api-client.ts`            | ✅     | Thin shim → `@mohasinac/http`                                         |
| `src/classes/`                     | ✅     | Barrel re-export → `@mohasinac/core` (keep as backward-compat barrel) |

### ✅ COMPLETE — Infrastructure Layer

| Component                          | Status | How it works                                                          |
| ---------------------------------- | ------ | --------------------------------------------------------------------- |
| `providers.config.ts`              | ✅     | `registerProviders()` wires db, auth, email, storage, style           |
| `features.config.ts`               | ✅     | All Tier B+C features enabled                                         |
| `tsconfig.json` paths              | ✅     | 40+ `@mohasinac/*` path aliases                                       |
| `next.config.js` transpilePackages | ✅     | All packages transpiled                                               |
| `src/i18n/request.ts`              | ✅     | `mergeFeatureMessages()` from `@mohasinac/cli/i18n`                   |
| `src/app/layout.tsx`               | ✅     | Imports `@/providers.config` at startup                               |
| `src/lib/firebase/admin.ts`        | ✅     | Thin shim → `@mohasinac/db-firebase`                                  |
| `src/lib/errors/`                  | ✅     | Thin shims → `@mohasinac/errors`                                      |
| `src/lib/security/csp.ts`          | ✅     | Thin shim → `@mohasinac/security`                                     |
| `src/lib/security/rate-limit.ts`   | ✅     | Thin shim → `@mohasinac/security`                                     |
| `src/lib/seo/`                     | ✅     | Thin shim → `@mohasinac/seo`                                          |
| `src/lib/monitoring/`              | ✅     | Thin shim → `@mohasinac/monitoring`                                   |
| `src/lib/api-client.ts`            | ✅     | Thin shim → `@mohasinac/http`                                         |
| `src/classes/`                     | ✅     | Barrel re-export → `@mohasinac/core` (keep as backward-compat barrel) |

### ✅ COMPLETE — API Route Delegation

| Route                                  | Package                      | Status                                                                                       |
| -------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `GET /api/blog`                        | `@mohasinac/feat-blog`       | ✅ 2-line stub                                                                               |
| `GET /api/blog/[slug]`                 | `@mohasinac/feat-blog`       | ✅ 2-line stub (`blogSlugGET as GET`)                                                        |
| `GET /api/events`                      | `@mohasinac/feat-events`     | ✅ 2-line stub                                                                               |
| `GET /api/stores`                      | `@mohasinac/feat-stores`     | ✅ 2-line stub                                                                               |
| `GET /api/stores/[storeSlug]`          | `@mohasinac/feat-stores`     | ✅ 2-line stub                                                                               |
| `GET /api/products`                    | `@mohasinac/feat-products`   | ✅ hybrid stub (POST local)                                                                  |
| `GET /api/products/[id]`               | `@mohasinac/feat-products`   | ✅ hybrid stub (PATCH+DELETE local)                                                          |
| `GET /api/reviews`                     | `@mohasinac/feat-reviews`    | ✅ hybrid stub (POST local) — supports featured/latest/aggregate modes                       |
| `GET /api/reviews/[id]`                | `@mohasinac/feat-reviews`    | ✅ hybrid stub (PATCH+DELETE local)                                                          |
| `GET /api/categories`                  | `@mohasinac/feat-categories` | ✅ hybrid stub (POST local) — flat/tree/tier/brand/slug modes added                          |
| `GET /api/categories/[id]`             | `@mohasinac/feat-categories` | ✅ 2-line stub (`categoryItemGET as GET`)                                                    |
| `GET /api/homepage-sections`           | `@mohasinac/feat-homepage`   | ✅ hybrid stub (POST local) — admin session auth for ?includeDisabled                        |
| `GET /api/homepage-sections/[id]`      | `@mohasinac/feat-homepage`   | ✅ hybrid stub (PATCH+DELETE local) — `homepageSectionItemGET`                               |
| `GET /api/carousel`                    | `@mohasinac/feat-homepage`   | ✅ hybrid stub (POST local) — `carouselGET`                                                  |
| `GET /api/carousel/[id]`               | `@mohasinac/feat-homepage`   | ✅ hybrid stub (PATCH+DELETE local) — `carouselItemGET`                                      |
| `GET /api/search`                      | `@mohasinac/feat-search`     | ✅ 2-line stub (Firestore only; Algolia via `ISearchProvider` future)                        |
| `GET /api/events/[id]`                 | `@mohasinac/feat-events`     | ✅ 2-line stub (poll results + survey leaderboard in package handler)                        |
| `GET/POST /api/pre-orders`             | `@mohasinac/feat-pre-orders` | ✅ 2-line stub                                                                               |
| `GET /api/stores/[storeSlug]/products` | `@mohasinac/feat-stores`     | ✅ 2-line stub (`storeProductsGET`)                                                          |
| `GET /api/stores/[storeSlug]/auctions` | `@mohasinac/feat-stores`     | ✅ 2-line stub (`storeAuctionsGET`)                                                          |
| `GET /api/stores/[storeSlug]/reviews`  | `@mohasinac/feat-stores`     | ✅ 2-line stub (`storeReviewsGET`)                                                           |
| `GET /api/auth/me`                     | `@mohasinac/feat-auth`       | ✅ 2-line stub (`authMeGET as GET`) — returns verified user via `IAuthProvider.getUser(uid)` |

---

## Phase 1 — Complete Existing Package Stubs (Tier B)

These packages already have GET handlers exported. Create 2-line stubs in letitrip.in
to delegate the public read endpoint. **POST/PATCH/DELETE stay local** because they
contain auth, validation, and complex business logic specific to letitrip.

| Action          | Route                         | Package                      | Method | Status     | Blocker                                                                                   |
| --------------- | ----------------------------- | ---------------------------- | ------ | ---------- | ----------------------------------------------------------------------------------------- |
| ~~Create stub~~ | `/api/products`               | `@mohasinac/feat-products`   | GET    | ✅ Done    | —                                                                                         |
| ~~Create stub~~ | `/api/products/[id]`          | `@mohasinac/feat-products`   | GET    | ✅ Done    | —                                                                                         |
| ~~Create stub~~ | `/api/reviews`                | `@mohasinac/feat-reviews`    | GET    | ✅ Done    | Package enhanced: featured/latest modes + aggregate stats added                           |
| ~~Create stub~~ | `/api/reviews/[id]`           | `@mohasinac/feat-reviews`    | GET    | ✅ Done    | reviewItemGET added to package                                                            |
| ~~Create stub~~ | `/api/categories`             | `@mohasinac/feat-categories` | GET    | ✅ Done    | Package enhanced: flat/tier/brand/showOnHomepage/tree modes; hook updated to expect array |
| ~~Create stub~~ | `/api/categories/[id]`        | `@mohasinac/feat-categories` | GET    | ✅ Done    | categoryItemGET added to package                                                          |
| ~~Create stub~~ | `/api/homepage-sections`      | `@mohasinac/feat-homepage`   | GET    | ✅ Done    | Package enhanced: admin session cookie auth for ?includeDisabled=true                     |
| ~~Create stub~~ | `/api/homepage-sections/[id]` | `@mohasinac/feat-homepage`   | GET    | ✅ Done    | homepageSectionItemGET added to package                                                   |
| ~~Create stub~~ | `/api/carousel`               | `@mohasinac/feat-homepage`   | GET    | ✅ Done    | carouselGET added to package; CarouselSlide + CarouselSlideCard types added               |
| ~~Create stub~~ | `/api/carousel/[id]`          | `@mohasinac/feat-homepage`   | GET    | ✅ Done    | carouselItemGET added to package                                                          |
| Create stub     | `/api/faqs`                   | `@mohasinac/feat-faq`        | GET    | 🔴 Blocked | Package missing `{{companyName}}` variable interpolation — **keep local permanently**     |
| n/a             | `/api/faqs/[id]`              | n/a                          | GET    | 🔴 Blocked | Same interpolation blocker — **keep local permanently**                                   |

**Note**: Routes that also have POST currently will keep the POST handler local.
The 2-line file becomes a hybrid:

```ts
// src/app/api/categories/route.ts
export { GET } from "@mohasinac/feat-categories";
export const POST = createApiHandler<...>({ ... }); // keep local
```

**Permanently local routes** (letitrip-specific business logic that cannot be generalised):

- `GET /api/faqs` + `GET /api/faqs/[id]` — variable interpolation from `siteSettingsRepository` (keeps `{{companyName}}` etc.)

> Previously listed as permanently local but now **migrated to packages**: search, events/[id], stores sub-routes.
> Algolia search can be re-enabled by registering `@mohasinac/search-algolia` as `ISearchProvider`.

---

## Phase 2 — Complete Incomplete Packages + Wire Stubs (Tier C)

The following packages exist but are missing `src/api/` route handlers. Add GET
handlers then wire letitrip stubs.

### 2-A: feat-auctions

**Status**: ✅ Package handler added (`packages/packages/feat-auctions/src/api/route.ts`)

**Blocker for letitrip wire**: letitrip Firestore bid documents use `productId` field;
package uses `auctionId`. Hook `useAuctionDetail` passes `?productId=...`.
The Sieve filter `auctionId=={value}` finds no results in letitrip's "bids" collection.

**letitrip stub**: NOT YET WIRED — keep local `GET` until schema migration renames field.

### 2-B: feat-promotions

**Status**: ✅ Package handler added (`packages/packages/feat-promotions/src/api/route.ts`)

**Blocker for letitrip wire**: local `GET /api/promotions` aggregates three repos
(`findPromoted()` + `findFeatured()` + `getActiveCoupons()`). Package returns only
coupons — incompatible response shape.

**letitrip stub**: NOT WIRED — keep local aggregate handler permanently.

### 2-C: feat-pre-orders

**Status**: ✅ Package handler added + letitrip stub wired (`src/app/api/pre-orders/route.ts`)

Delegates GET + POST to `@mohasinac/feat-pre-orders`. Uses the `preOrders` Firestore
collection. When letitrip records pre-orders, use this collection (not the `isPreOrder`
product flag for the list endpoint).

### 2-D: feat-seller (complex — deferred to Phase 4)

Multiple sub-routes with Razorpay business logic.  
See Phase 4 for details.

---

## Phase 3 — Move Repositories to Packages

Each local `src/repositories/*.repository.ts` should move to its `feat-*` package
so all three projects benefit from the same implementation.

### Migration table

| Local file                        | Target package    | Target path                                  |
| --------------------------------- | ----------------- | -------------------------------------------- |
| `address.repository.ts`           | `feat-account`    | `src/repository/address.repository.ts`       |
| `bid.repository.ts`               | `feat-auctions`   | `src/repository/bid.repository.ts`           |
| `blog.repository.ts`              | `feat-blog`       | ⚠️ already in package — verify               |
| `cart.repository.ts`              | `feat-cart`       | `src/repository/cart.repository.ts`          |
| `categories.repository.ts`        | `feat-categories` | ⚠️ already in package — verify               |
| `coupons.repository.ts`           | `feat-promotions` | `src/repository/coupons.repository.ts`       |
| `event.repository.ts`             | `feat-events`     | ⚠️ already in package — verify               |
| `eventEntry.repository.ts`        | `feat-events`     | `src/repository/event-entry.repository.ts`   |
| `faqs.repository.ts`              | `feat-faq`        | ⚠️ already in package — verify               |
| `homepage-sections.repository.ts` | `feat-homepage`   | ⚠️ already in package — verify               |
| `notification.repository.ts`      | `feat-account`    | `src/repository/notification.repository.ts`  |
| `order.repository.ts`             | `feat-orders`     | `src/repository/order.repository.ts`         |
| `payout.repository.ts`            | `feat-seller`     | `src/repository/payout.repository.ts`        |
| `product.repository.ts`           | `feat-products`   | ⚠️ already in package — verify               |
| `review.repository.ts`            | `feat-reviews`    | ⚠️ already in package — verify               |
| `store.repository.ts`             | `feat-stores`     | ⚠️ already in package — verify               |
| `user.repository.ts`              | `feat-account`    | `src/repository/user.repository.ts`          |
| `wishlist.repository.ts`          | `feat-wishlist`   | `src/repository/wishlist.repository.ts`      |
| `carousel.repository.ts`          | `feat-homepage`   | `src/repository/carousel.repository.ts`      |
| `chat.repository.ts`              | local             | stays local (letitrip-specific)              |
| `copilot-log.repository.ts`       | local             | stays local (letitrip-specific)              |
| `failed-checkout.repository.ts`   | local             | stays local or `feat-checkout`               |
| `newsletter.repository.ts`        | local             | stays local (letitrip-specific)              |
| `offer.repository.ts`             | `feat-promotions` | `src/repository/offer.repository.ts`         |
| `session.repository.ts`           | local             | stays local                                  |
| `site-settings.repository.ts`     | local             | stays local                                  |
| `sms-counter.repository.ts`       | local             | stays local                                  |
| `store-address.repository.ts`     | `feat-stores`     | `src/repository/store-address.repository.ts` |
| `token.repository.ts`             | local             | stays local                                  |

**After migration**: Local `@/repositories` index keeps re-exports for backward compat
until all callers are updated to import from the package directly.

---

## Phase 4 — Complex Routes (Seller, Admin, Cart, Orders, Auth, Payments)

These routes contain significant letitrip-specific business logic. They should be
migrated to packages **after** the packages gain proper auth middleware support.

### Required package enhancements before migration

1. **Auth middleware** in packages: A `requireAuth()` wrapper that uses `getProviders().auth`
   to verify the Firebase session cookie (analogous to letitrip's `createApiHandler`)
2. **Seller auth**: `requireSeller()` — verifies user has `seller` role via `getProviders().auth`

### Target stubs (future Phase 4)

| Route group          | Total routes | Package target             |
| -------------------- | ------------ | -------------------------- |
| `POST /api/cart/*`   | 3            | `@mohasinac/feat-cart`     |
| `POST /api/checkout` | 1            | `@mohasinac/feat-checkout` |
| `/api/orders/*`      | 3            | `@mohasinac/feat-orders`   |
| `/api/payment/*`     | 5            | `@mohasinac/feat-payments` |
| `/api/auth/*`        | 10           | `@mohasinac/feat-auth`     |
| `/api/profile/*`     | 6            | `@mohasinac/feat-account`  |
| `/api/user/*`        | 4            | `@mohasinac/feat-account`  |
| `/api/seller/*`      | 9            | `@mohasinac/feat-seller`   |
| `/api/admin/*`       | 30           | `@mohasinac/feat-admin`    |

### Routes that stay local permanently (letitrip-specific)

- `/api/copilot/*` — AI chat feature
- `/api/chat/*` — Peer-to-peer chat
- `/api/demo/*` — Demo seeding
- `/api/realtime/*` — Firebase RTDB SSE
- `/api/logs/*` — Server log forwarding
- `/api/site-settings` — Global config

---

## Phase 5 — Domain Hooks to Packages

Move hooks from `src/hooks/` to their respective feat-\* packages.

| Hook                  | Target package                   |
| --------------------- | -------------------------------- |
| `useAddresses.ts`     | `feat-account`                   |
| `useBids.ts`          | `feat-auctions`                  |
| `useCart*.ts`         | `feat-cart`                      |
| `useCheckout*.ts`     | `feat-checkout`                  |
| `useOrders.ts`        | `feat-orders`                    |
| `useProducts*.ts`     | `feat-products`                  |
| `useProfile.ts`       | `feat-account`                   |
| `useRazorpay.ts`      | `feat-payments`                  |
| `useSellerStore.ts`   | `feat-seller`                    |
| `useWishlist.ts`      | `feat-wishlist`                  |
| Browser/UI hooks (10) | Already in `@mohasinac/react` ✅ |

---

## Phase 6 — Feature Component Migration

Move pure display components (views, cards, grids) from `src/features/*/components`
that have no letitrip-specific state to their feat-\* packages.

This enables hobson, licorice, and future projects to share these components.

---

## Migration Completion Tracker

| Phase           | Description                               | Status                                                 | Routes affected      |
| --------------- | ----------------------------------------- | ------------------------------------------------------ | -------------------- |
| Infra           | Infrastructure shims + wiring             | ✅ Done                                                | —                    |
| Stubs-A         | Blog/Events/Stores 2-line stubs           | ✅ Done                                                | 5 routes             |
| Phase 1 partial | products + products/[id] GET stubs        | ✅ Done                                                | +2 routes (7 total)  |
| Phase 1 blocked | reviews/faqs/categories/homepage-sections | ✅ Done (faqs permanently local)                       | +9 routes (16 total) |
| Phase 1 ext     | carousel + homepage-sections item GETs    | ✅ Done                                                | +4 routes (20 total) |
| Phase 2-A       | feat-auctions api handler                 | ✅ Handler added; stub not wired (schema mismatch)     | —                    |
| Phase 2-B       | feat-promotions api handler               | ✅ Handler added; stub not wired (aggregate response)  | —                    |
| Phase 2-C       | feat-pre-orders stub wired                | ✅ Done (new `api/pre-orders/route.ts` stub)           | +1 route             |
| Phase 2-E       | feat-search api handler + stub            | ✅ Done (Firestore search; Firestore-only, no Algolia) | +1 route             |
| Phase 2-F       | feat-events [id] api handler + stub       | ✅ Done (poll results + leaderboard in package)        | +1 route             |
| Phase 2-G       | feat-stores sub-route handlers + stubs    | ✅ Done (products, auctions, reviews)                  | +3 routes            |
| Auth-me         | feat-auth GET /api/auth/me                | ✅ Done (`authMeGET` via `IAuthProvider.getUser()`)    | +1 route (28 total)  |
| Phase 2-D       | feat-seller api handlers                  | 🔲 Future (Razorpay/Shiprocket blocker)                | +9                   |
| Phase 3         | Repository migration to packages          | ⚠️ Partial — see below                                 | —                    |
| Phase 4         | Auth + complex routes                     | 🔲 Future — see blockers above                         | ~71                  |
| Phase 5         | Domain hooks migration to packages        | 🔲 Future                                              | —                    |
| Phase 6         | Feature component migration               | 🔲 Future                                              | —                    |

**Progress (2026-03-24)**: 28 / ~100 delegatable routes = **~28%**
**After Phase 4 (unblocked auth + account + orders)**: ~70 / ~100 = ~70%
**Permanently local** (~30 routes): auth login/register/logout/session, cart, wishlist, addresses, orders, payments, seller-payouts, admin-dashboard

### Phase 3 Repository Status

Most feat-\* packages already have `src/repository/` files using `IRepository<T>` from contracts.
These are the **portable** repositories. letitrip's local repos in `src/repositories/` use a
Firebase-specific `BaseRepository` with PII encryption — they are **not replaced** by the packages.

| Local repo                        | Package repo status                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `blog.repository.ts`              | ✅ `feat-blog/src/repository/blog.repository.ts`                                       |
| `categories.repository.ts`        | ✅ `feat-categories/src/repository/`                                                   |
| `event.repository.ts`             | ✅ `feat-events/src/repository/`                                                       |
| `faqs.repository.ts`              | ✅ `feat-faq/src/repository/`                                                          |
| `homepage-sections.repository.ts` | ✅ `feat-homepage/src/repository/`                                                     |
| `product.repository.ts`           | ✅ `feat-products/src/repository/`                                                     |
| `review.repository.ts`            | ✅ `feat-reviews/src/repository/`                                                      |
| `store.repository.ts`             | ✅ `feat-stores/src/repository/`                                                       |
| `cart.repository.ts`              | ✅ `feat-cart/src/repository/` (different schema — see Cart blocker)                   |
| `order.repository.ts`             | ✅ `feat-orders/src/repository/` (PII — local version stays authoritative)             |
| `user.repository.ts`              | ✅ `feat-account/src/repository/` (PII — local version stays authoritative)            |
| `wishlist.repository.ts`          | ✅ `feat-wishlist/src/repository/` (subcollection — local version stays authoritative) |
| `address.repository.ts`           | Local only (PII subcollection)                                                         |
| `bid.repository.ts`               | Local only (schema mismatch with feat-auctions)                                        |
| `chat.repository.ts`              | Local only (letitrip-specific)                                                         |
| `copilot-log.repository.ts`       | Local only (letitrip-specific)                                                         |
| `failed-checkout.repository.ts`   | Local only                                                                             |
| `newsletter.repository.ts`        | Local only                                                                             |
| `offer.repository.ts`             | Local only (promotions aggregate)                                                      |
| `payout.repository.ts`            | Local only (Razorpay integration)                                                      |
| `session.repository.ts`           | Local only (letitrip session tracking)                                                 |
| `site-settings.repository.ts`     | Local only                                                                             |
| `sms-counter.repository.ts`       | Local only                                                                             |
| `store-address.repository.ts`     | Local only                                                                             |
| `token.repository.ts`             | Local only                                                                             |
| `coupons.repository.ts`           | Local only (promotions aggregate)                                                      |
| `notification.repository.ts`      | Local only                                                                             |

**Conclusion**: letitrip KEEPS all its local repos. The package repos are portable copies for
licorice/hobson — they run alongside, not instead of, the local repos.

### What "Permanently Local" Means

These routes will **never** be 2-line stubs because they require letitrip-specific infrastructure:

```
/api/auth/login              — Firebase REST password verification + session tracking
/api/auth/register           — Firebase Admin createUser + session tracking + email
/api/auth/logout             — Firestore session revocation + Firebase token revocation
/api/auth/session            — Session cookie from ID token + Firestore session tracking
/api/auth/session/validate   — Session + Firestore session tracking validation
/api/auth/google/*           — RTDB popup bridge (letitrip-specific)
/api/auth/event/init         — RTDB auth event (letitrip-specific)
/api/user/profile            — PII-encrypted user document
/api/user/addresses          — PII-encrypted Firestore subcollection
/api/user/orders             — PII-encrypted order documents
/api/user/wishlist           — Firestore subcollection pattern
/api/user/sessions           — letitrip session tracking
/api/cart/*                  — Single-document-per-user schema (no package match)
/api/payment/*               — Razorpay SDK (no IPaymentProvider impl yet)
/api/seller/payouts          — Razorpay Payouts API
/api/seller/shipping         — Shiprocket (no IShippingProvider impl yet)
/api/admin/dashboard         — Multi-repo aggregation
/api/admin/analytics         — Multi-repo aggregation
/api/admin/users             — PII-encrypted user documents
/api/admin/orders            — PII-encrypted order documents
/api/bids/*                  — auctionId/productId schema mismatch
/api/copilot/*               — AI chat (letitrip-specific)
/api/chat/*                  — Peer-to-peer chat (letitrip-specific)
/api/realtime/*              — Firebase RTDB SSE
/api/site-settings           — Global config singleton
/api/logs/*                  — Server log forwarding
/api/faqs/*                  — Variable interpolation from siteSettings
/api/promotions              — Aggregate (coupons + featured + offered products)
```

---

## Next Unblocked Work

### NW-1: Admin list GET stubs (response shape migration + hook update required)

Before wiring admin list stubs, the response shape mismatch must be resolved:

- **Package returns**: `{ success: true, data: { items: [], total, page, ... } }`
- **letitrip hooks expect**: `{ data: { products: [] } }` or `{ data: { posts: [] } }` etc.

**Resolution**: Update letitrip admin hooks to use the package field name `items` instead of domain-specific names. Then create admin package handlers + stubs for:

| Route                     | Notes                                     |
| ------------------------- | ----------------------------------------- |
| `GET /api/admin/products` | No PII; Sieve-compatible; admin role only |
| `GET /api/admin/blog`     | No PII; Sieve-compatible; admin role only |
| `GET /api/admin/events`   | No PII; Sieve-compatible; admin role only |
| `GET /api/admin/stores`   | No PII; Sieve-compatible; admin role only |
| `GET /api/admin/coupons`  | No PII; Sieve-compatible; admin role only |
| `GET /api/admin/reviews`  | No PII; Sieve-compatible; admin role only |
| `GET /api/admin/sessions` | No PII; letitrip-specific tracking        |

**Estimated effort**: 1 session — update 5-6 package handlers + 6 hooks + 6 stubs.

### NW-2: Migrate local `createApiHandler` to `createRouteHandler` (non-PII routes)

letitrip's local `createApiHandler` is functionally equivalent to `createRouteHandler` from
`@mohasinac/next` except:

1. `createApiHandler` fetches the full `UserDocument` from Firestore on each authenticated request
2. `createRouteHandler` only provides the session claims (`uid`, `email`, `role`) — no Firestore read

Routes that only need `user.uid` and `user.role` (the majority) can switch to `createRouteHandler`
without behavior change. Routes that need `user.displayName` or letitrip-specific fields (`user.seller`, etc.)
must either do their own repo lookup or stay with `createApiHandler`.

**Estimated effort**: 2-3 sessions — audit all ~60 local routes, switch ~40 to `createRouteHandler`.

### NW-3: Cart schema migration (unblocks feat-cart delegation)

Current: `carts/{userId}` — single doc with `items: CartItem[]` array.  
Required: `carts/{docId}` — one doc per cart item, `userId` field for querying.

This is a Firestore data migration (needs a script + dual-read period). After the migration,
`GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/[itemId]` can be delegated to `feat-cart`.

### NW-4: Auction schema fix (unblocks feat-auctions)

Rename Firestore `bids/{docId}.productId` → `bids/{docId}.auctionId`. After migration,
`GET /api/bids?productId=` stub can delegate to `feat-auctions`.

---

```ts
// packages/feat-<name>/src/api/route.ts

import { NextResponse } from "next/server";
import { getProviders } from "@mohasinac/contracts";
import type { MyItem, MyListResponse } from "../types/index.js";

function numParam(url: URL, key: string, fallback: number) {
  const v = url.searchParams.get(key);
  const n = v !== null ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const page = numParam(url, "page", 1);
    const pageSize = numParam(url, "pageSize", 20);
    const sort = url.searchParams.get("sort") ?? "-createdAt";

    // Build Sieve filter string from query params
    const parts: string[] = [];
    const active = url.searchParams.get("isActive");
    if (active !== null) parts.push(`isActive==${active}`);
    const filters = parts.join(",");

    const { db } = getProviders();
    if (!db)
      return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const repo = db.getRepository<MyItem>("my-collection");
    const result = await repo.findAll({
      filters,
      sort,
      page,
      perPage: pageSize,
    });

    const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
    const body: MyListResponse = {
      items: result.data,
      total: result.total,
      page: result.page,
      pageSize,
      totalPages,
      hasMore: result.page < totalPages,
    };

    return NextResponse.json({ success: true, data: body });
  } catch (err) {
    console.error("[feat-<name>] GET failed", err);
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 },
    );
  }
}
```

```ts
// letitrip.in — 2-line stub (GET-only)
// src/app/api/<route>/route.ts
export { GET } from "@mohasinac/feat-<name>";

// letitrip.in — hybrid stub (GET from package, POST local)
export { GET } from "@mohasinac/feat-<name>";
export const POST = createApiHandler<...>({ handler: async ({ request, user }) => { ... } });
```

---

## Dev Commands

```bash
# Type check
cd D:\proj\letitrip.in; npx tsc --noEmit
cd D:\proj\packages; npm run typecheck

# Build packages
cd D:\proj\packages; node scripts/build-all.mjs

# Start dev server
cd D:\proj\letitrip.in; npm run dev
```
