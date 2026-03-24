# @mohasinac/\* Full Migration Plan — letitrip.in

> **Goal**: letitrip.in delegates all reusable domain logic to `@mohasinac/*`
> packages. App-specific configuration, overrides, and letitrip-only business
> logic stay local.
>
> **Start date**: 2026-03-19 **Active workspace**: `D:\proj\letitrip.in`

---

## Current Status (2026-03-19)

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

| Route                         | Package                      | Status                                                                 |
| ----------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| `GET /api/blog`               | `@mohasinac/feat-blog`       | ✅ 2-line stub                                                         |
| `GET /api/blog/[slug]`        | `@mohasinac/feat-blog`       | ✅ 2-line stub (`blogSlugGET as GET`)                                  |
| `GET /api/events`             | `@mohasinac/feat-events`     | ✅ 2-line stub                                                         |
| `GET /api/stores`             | `@mohasinac/feat-stores`     | ✅ 2-line stub                                                         |
| `GET /api/stores/[storeSlug]` | `@mohasinac/feat-stores`     | ✅ 2-line stub                                                         |
| `GET /api/products`           | `@mohasinac/feat-products`   | ✅ hybrid stub (POST local)                                            |
| `GET /api/products/[id]`      | `@mohasinac/feat-products`   | ✅ hybrid stub (PATCH+DELETE local)                                    |
| `GET /api/reviews`            | `@mohasinac/feat-reviews`    | ✅ hybrid stub (POST local) — supports featured/latest/aggregate modes |
| `GET /api/reviews/[id]`       | `@mohasinac/feat-reviews`    | ✅ hybrid stub (PATCH+DELETE local)                                    |
| `GET /api/categories`         | `@mohasinac/feat-categories` | ✅ hybrid stub (POST local) — flat/tree/tier/brand/slug modes added    |

---

## Phase 1 — Complete Existing Package Stubs (Tier B)

These packages already have GET handlers exported. Create 2-line stubs in letitrip.in
to delegate the public read endpoint. **POST/PATCH/DELETE stay local** because they
contain auth, validation, and complex business logic specific to letitrip.

| Action          | Route                    | Package                      | Method | Status     | Blocker                                                                                   |
| --------------- | ------------------------ | ---------------------------- | ------ | ---------- | ----------------------------------------------------------------------------------------- |
| ~~Create stub~~ | `/api/products`          | `@mohasinac/feat-products`   | GET    | ✅ Done    | —                                                                                         |
| ~~Create stub~~ | `/api/products/[id]`     | `@mohasinac/feat-products`   | GET    | ✅ Done    | —                                                                                         |
| ~~Create stub~~ | `/api/reviews`           | `@mohasinac/feat-reviews`    | GET    | ✅ Done    | Package enhanced: featured/latest modes + aggregate stats added                           |
| ~~Create stub~~ | `/api/reviews/[id]`      | `@mohasinac/feat-reviews`    | GET    | ✅ Done    | reviewItemGET added to package                                                            |
| ~~Create stub~~ | `/api/categories`        | `@mohasinac/feat-categories` | GET    | ✅ Done    | Package enhanced: flat/tier/brand/showOnHomepage/tree modes; hook updated to expect array |
| Create stub     | `/api/faqs`              | `@mohasinac/feat-faq`        | GET    | 🔴 Blocked | Package missing `{{companyName}}` variable interpolation from site settings               |
| Create stub     | `/api/homepage-sections` | `@mohasinac/feat-homepage`   | GET    | 🟡 Partial | Public GET compatible; admin `?includeDisabled=true` not supported in package             |

**Package enhancements needed to unblock remaining routes:**

- `feat-faq`: Accept site-settings-style variable map; interpolate in handler
- `feat-homepage`: Add `?includeDisabled=true` with admin auth guard

**Note**: Routes that also have POST currently will keep the POST handler local.
The 2-line file becomes a hybrid:

```ts
// src/app/api/categories/route.ts
export { GET } from "@mohasinac/feat-categories";
export const POST = createApiHandler<...>({ ... }); // keep local
```

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

**Status**: ✅ Package handler added (`packages/packages/feat-pre-orders/src/api/route.ts`)

**Note**: letitrip pre-orders are products with `isPreOrder: true` flag, not a
dedicated `preOrders` Firestore collection. No `/api/pre-orders` local route exists
and none is needed until a dedicated collection is introduced.

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

| Phase           | Description                               | Status                                                 | Routes affected     |
| --------------- | ----------------------------------------- | ------------------------------------------------------ | ------------------- |
| Infra           | Infrastructure shims + wiring             | ✅ Done                                                | —                   |
| Stubs-A         | Blog/Events/Stores 2-line stubs           | ✅ Done                                                | 5 routes            |
| Phase 1 partial | products + products/[id] GET stubs        | ✅ Done                                                | +2 routes (7 total) |
| Phase 1 blocked | reviews/faqs/categories/homepage-sections | 🔴 Blocked                                             | see blocker notes   |
| Phase 2-A       | feat-auctions api handler                 | ✅ Handler added; stub not wired (schema mismatch)     | —                   |
| Phase 2-B       | feat-promotions api handler               | ✅ Handler added; stub not wired (aggregate response)  | —                   |
| Phase 2-C       | feat-pre-orders api handler               | ✅ Handler added; no stub needed (no local collection) | —                   |
| Phase 2-D       | feat-seller api handlers                  | 🔲 Future                                              | +9                  |
| Phase 3         | Repository migration                      | 🔲 Future                                              | —                   |
| Phase 4         | Auth + complex routes                     | 🔲 Future (needs auth in packages)                     | +71                 |
| Phase 5         | Hooks migration                           | 🔲 Future                                              | —                   |
| Phase 6         | Component migration                       | 🔲 Future                                              | —                   |

**Progress**: 7 / ~100 delegatable routes = ~7%
**After Phase 1 unblocked**: 11 / ~100 = ~11%
**After Phase 4**: ~82 / ~100 = ~82%

---

## Quick Reference — Package Handler Pattern

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
