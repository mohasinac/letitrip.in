# letitrip.in → appkit Migration Tracker

**Last verified:** 2026-04-15 — Session 14, Phase 6 seed batch 2 (10 files) migrated into appkit  
**Last session ended at:** Phase 6 — src/db/seed-data/blog-posts-seed-data.ts migrated  
**Goal:** Reduce letitrip.in to a thin consumer — routes, server-action entrypoints, provider wiring, market config, and SDK drivers only.

---

## Summary

| Exec Order | Phase | Scope | Files | Status |
|------------|-------|-------|-------|--------|
| 1 | Phase 1 | Schema Layer | 30 | ✅ 30/30 complete |
| 2 | Phase 2 | Constants & Utils | 16 | 🔄 10/16 done |
| 3 | Phase 3 | Validation | ~15 | ❌ partially blocked |
| 4 | Phase 4 | Server Infrastructure (pii, query, logger, helpers) | 18 | ✅ done |
| 5 | Phase 5 | Repository Layer | 32 | 🔄 30/32 done |
| 6 | Phase 6 | Seed Data | 21 | 🔄 17/21 done |
| 7 | Phase 7 | Actions → Appkit | 35 | ⬜ |
| 8 | Phase 8 | Hooks | 16 | ⬜ |
| 9 | Phase 9 | Shared UI Components | 30 | ⬜ |
| 10 | Phase 10 | Feature Modules | ~375 | ⬜ |

**Total to migrate/delete: ~580 files**

> **Execution order matters.** Schemas (Phase 1) have no upstream deps. Constants/Utils (Phase 2) reference schema types. Validation (Phase 3) depends on schemas + utils — Zod schemas and cross-domain validators must land in appkit before repos and actions consume them. Server Infrastructure (Phase 4) depends on Phase 1-3 — pii/query/logger/helpers import validators and schema constants. Repositories (Phase 5) import from server infrastructure (pii, sieve, logger). Seed Data (Phase 6) needs repo types. Actions → Appkit (Phase 7) depend on repos + server infra; business logic moves to appkit, letitrip files become `'use server'` thin wrappers. Hooks (Phase 8) depend on repos + appkit actions since mutations go through action functions. Shared UI (Phase 9) depends on hooks. Feature Modules (Phase 10) depend on everything. Always follow exec order column.

---

## Permanent Locals — Never Move

These files are **app-specific** and legitimately stay in letitrip forever:

```
src/lib/firebase/config.ts            — Firebase project config
src/lib/firebase/client-config.ts     — Client SDK init
src/lib/firebase/auth-server.ts       — Server-side admin auth
src/lib/firebase/realtime.ts          — RTDB client init
src/lib/firebase/storage.ts           — Storage client init
src/lib/integration-keys.ts           — API keys and secrets
src/lib/payment/razorpay.ts           — Razorpay SDK init
src/lib/shiprocket/                   — Shiprocket SDK driver
src/lib/pwa/                          — PWA runtime caching config
src/constants/site.ts                 — Market config (INR, IN, +91, branding)
src/constants/routes.ts               — App route paths
src/constants/api-endpoints.ts        — Internal API paths
src/constants/config.ts               — App-level feature flags
src/constants/navigation.tsx          — App navigation tree
src/providers.config.ts               — Provider registry wiring
src/features.config.ts                — Feature flag config
src/app/                              — Next.js route pages and layouts
src/actions/                          — Server action entrypoints ('use server' thin wrappers — business logic lives in appkit Phase 7)
```

---

## Execution Contract

For every file migrated:
1. Verify appkit target already exists OR create the generic implementation in appkit.
2. Update all letitrip import sites to point at `@mohasinac/appkit/...`.
3. Delete the letitrip file (or reduce to a thin wrapper if it's a legitimate permanent local).
4. After every 10-file batch: run `tsc --noEmit` in both repos. Fix all errors before continuing.

**For Phase 7 Actions specifically:** The letitrip `src/actions/*.actions.ts` file is **not deleted** — it becomes a `'use server'` thin entrypoint. Move all business logic to `@mohasinac/appkit/features/<domain>/actions/`. The letitrip file keeps only: auth check, input parse/validate, call appkit function, return result.

---

## Phase 1 — Schema Layer

**Target in appkit:** `src/features/<entity>/schemas/` (field constants, collection names, default shapes)  
**Dependency:** Nothing depends on schemas upstream. Start here (exec order 1).

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/db/schema/field-names.ts` | `src/features/*/schemas/` (shared field registry) | ✅ shim — USER/TOKEN/SESSION/CATEGORY_FIELDS → appkit; product/order/review/bid/etc locals remain |
| `src/db/schema/index.ts` | delete (barrel) | 🔒 223 import sites — barrel kept |
| `src/db/schema/users.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/schema/tokens.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/schema/sessions.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/schema/stores.ts` | `src/features/stores/schemas/` | ✅ |
| `src/db/schema/store-addresses.ts` | `src/features/stores/schemas/` | ✅ |
| `src/db/schema/addresses.ts` | `src/features/account/schemas/` | ✅ |
| `src/db/schema/cart.ts` | `src/features/cart/schemas/` | ✅ |
| `src/db/schema/categories.ts` | `src/features/categories/schemas/` | ✅ |
| `src/db/schema/products.ts` | `src/features/products/schemas/` | ✅ |
| `src/db/schema/orders.ts` | `src/features/orders/schemas/` | ✅ |
| `src/db/schema/reviews.ts` | `src/features/reviews/schemas/` | ✅ |
| `src/db/schema/blog-posts.ts` | `src/features/blog/schemas/` | ✅ |
| `src/db/schema/events.ts` | `src/features/events/schemas/` | ✅ |
| `src/db/schema/bids.ts` | `src/features/auctions/schemas/` | ✅ |
| `src/db/schema/coupons.ts` | `src/features/promotions/schemas/` | ✅ |
| `src/db/schema/offers.ts` | `src/features/seller/schemas/` | ✅ |
| `src/db/schema/payouts.ts` | `src/features/payments/schemas/` | ✅ |
| `src/db/schema/notifications.ts` | `src/features/admin/schemas/` | ✅ |
| `src/db/schema/chat.ts` | `src/features/admin/schemas/` | ✅ |
| `src/db/schema/site-settings.ts` | `src/features/admin/schemas/` | ✅ |
| `src/db/schema/carousel-slides.ts` | `src/features/homepage/schemas/` | ✅ |
| `src/db/schema/homepage-sections.ts` | `src/features/homepage/schemas/` | ✅ |
| `src/db/schema/faqs.ts` | `src/features/faq/schemas/` | ✅ |
| `src/db/schema/newsletter-subscribers.ts` | `src/core/` (already has newsletter.repository.ts) | ✅ |
| `src/db/schema/copilot-logs.ts` | `src/features/copilot/` | ✅ shim to `@mohasinac/appkit/core` |
| `src/db/schema/failed-checkouts.ts` | `src/features/checkout/schemas/` | ✅ |
| `src/db/schema/sms-counters.ts` | `src/features/auth/schemas/` | ✅ |
| `src/db/indices/merge-indices.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` (`firestore-indexes.ts`) and local file deleted |

---

## Phase 2 — Constants & Utils

**Execute SECOND — before Phase 3 (Validation) and Phase 4 (Server Infrastructure).** Several Phase 4 server utilities and Phase 5 repositories import from `@/utils` and `@/constants`. Move the reusable ones to appkit first so downstream phases can import from `@mohasinac/appkit/utils` (exec order 2).

| File | Move to Appkit? | Status |
|------|----------------|--------|
| `src/constants/rbac.ts` | `src/features/auth/` (role definitions) | ✅ A |
| `src/constants/messages.ts` | `src/features/*/messages/` per-feature | ✅ B |
| `src/constants/error-messages.ts` | `src/errors/` | ✅ C |
| `src/constants/success-messages.ts` | `src/features/*/messages/` | ✅ C |
| `src/constants/ui-labels-core.ts` | `src/features/layout/messages/` | ✅ removed stale split file (labels owned by `src/constants/ui.ts`) |
| `src/constants/ui-labels-admin.ts` | `src/features/admin/messages/` | ✅ removed stale split file (labels owned by `src/constants/ui.ts`) |
| `src/constants/ui.ts` | `src/tokens/` or `src/ui/` | 🔒 keep local — app/site copy + locale content owned by consumer config |
| `src/constants/theme.ts` | `src/tokens/` | 🔒 keep local — thin site theme extension over `@mohasinac/appkit/tokens` |
| `src/constants/faq.ts` | `src/features/faq/` | 🔒 keep local — market copy constants currently tied to consumer FAQ UX |
| `src/constants/homepage-data.ts` | `src/features/homepage/` | 🔒 keep local — homepage marketing copy is site/market config |
| `src/constants/address.ts` | `src/features/account/` | ✅ created in appkit `features/account/constants/addresses.ts`; local file already absent |
| `src/constants/seo.ts` | `src/seo/` | ✅ A |
| `src/constants/index.ts` | delete | ❌ blocked — 200+ import sites still depend on local route/site/config exports |
| `src/utils/business-day.ts` | `src/utils/` appkit | ✅ C |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/` | ✅ A |
| `src/utils/index.ts` | delete | ❌ blocked — 100+ imports still use local alias; requires codemod rewrite first |

---

## Phase 3 — Validation

**Target in appkit:** `src/validation/` for cross-domain Zod schemas; `src/features/<entity>/validation/` for domain validators moving with their feature in Phase 10.  
**Dependency:** Phase 1 schemas + Phase 2 constants/utils must be in appkit first (exec order 3). Validation must land before Phase 4 Server Infrastructure and Phase 5 Repositories which consume these validators.

> **Split rule:** Validators for `address`, `auth`, `contact`, `seo` etc. that are imported by server infrastructure or repositories belong here in Phase 3. Validators that only appear inside a single feature stay with that feature in Phase 10.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/lib/validation/schemas.ts` (cross-domain validators only) | `src/validation/` | ❌ blocked — requires split: extract shared Zod helpers + cross-domain validators now; domain-specific validators move with their feature in Phase 10 |

---

## Phase 4 — Server Infrastructure

**Target in appkit:** auth helpers → `src/features/auth/`; pii/encryption → `src/security/`; query/logger/api-handler → `src/providers/`, `src/monitoring/`, `src/http/`; media/analytics → `src/features/media/`, `src/monitoring/`.  
**Dependency:** Phase 1 schemas ✅ + Phase 2 constants/utils + Phase 3 validation must all be in appkit first (exec order 4). Must be completed BEFORE Phase 5 Repositories.

### Phase 4a — Helpers

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/helpers/auth/auth.helper.ts` | `src/features/auth/` server utils | ✅ B |
| `src/helpers/auth/token.helper.ts` | `src/features/auth/` server utils | ✅ C |
| `src/helpers/auth/index.ts` | delete | ✅ A |
| `src/helpers/logging/error-logger.ts` | `src/monitoring/` or `src/errors/` | ✅ B |
| `src/helpers/logging/server-error-logger.ts` | `src/monitoring/` | ✅ B |
| `src/helpers/logging/index.ts` | delete | ✅ A |
| `src/helpers/validation/address.helper.ts` | `src/features/account/` | ✅ C |
| `src/helpers/validation/index.ts` | delete | ✅ A |
| `src/helpers/index.ts` | delete | ✅ A |

### Phase 4b — Shared Lib (non-driver)

| File | Appkit Target | Keep Local? | Status |
|------|--------------|-------------|--------|
| `src/lib/encryption.ts` | `src/security/` | No | ✅ C |
| `src/lib/pii.ts` | `src/security/` | No | ✅ B (merged + 40 PII functions exported from appkit) |
| `src/lib/email.ts` | `src/features/contact/` server util | No | ✅ B |
| `src/lib/server-logger.ts` | `src/monitoring/` | No | ✅ B |
| `src/lib/tokens.ts` | `src/features/auth/` | No | ✅ B |
| `src/lib/consent-otp.ts` | `src/features/auth/` | No | ✅ B |
| `src/lib/api/api-handler.ts` | `src/http/` | No | ✅ C |
| `src/lib/query/firebase-sieve.ts` | `src/providers/` Firebase query utils | No | ✅ B |
| `src/lib/query/index.ts` | delete | No | ✅ A |
| `src/lib/media/finalize.ts` | `src/features/media/` | No | ✅ C |
| `src/lib/monitoring/analytics.ts` | `src/monitoring/` | No | ✅ C |
| `src/lib/monitoring/index.ts` | delete | No | ✅ A |
| `src/lib/firebase/auth-helpers.ts` | `src/features/auth/` | No | 🔒 keep local — client Firebase SDK/session wiring depends on consumer auth config + endpoint contract |
| `src/lib/firebase/realtime-db.ts` | `src/providers/` Firebase RTDB utils | No | 🔒 keep local — direct client RTDB SDK wiring over consumer firebase client config |
| `src/lib/firebase/rtdb-paths.ts` | `src/providers/` Firebase paths | No | ✅ C |

## Phase 5 — Repository Layer

**Target in appkit:** `src/features/<entity>/repository/` — implement or verify existing.  
**Dependency:** Phase 1 schemas ✅ + Phase 2 constants/utils + Phase 3 validation + Phase 4 server infrastructure (pii, query/sieve, server-logger, helpers) must all be in appkit first. Do not start executing this phase until exec order 1–4 are done.

Note: `copilot-log.repository.ts` and `newsletter.repository.ts` are already in `appkit/src/core/`.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/repositories/base.repository.ts` | `src/providers/db-firebase/` | ✅ moved to `@mohasinac/appkit/providers/db-firebase` and local file deleted |
| `src/repositories/index.ts` | delete (barrel) | 🔄 retained as temporary consumer barrel while remaining repository imports still target `@/repositories` |
| `src/repositories/copilot-log.repository.ts` | already in `appkit/src/core/` — delete letitrip copy | ✅ deleted shim; routed via `@mohasinac/appkit/core` |
| `src/repositories/newsletter.repository.ts` | already in `appkit/src/core/` — delete letitrip copy | ✅ deleted shim; routed via `@mohasinac/appkit/core/newsletter.repository` |
| `src/repositories/user.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/token.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/session.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/address.repository.ts` | `src/features/account/repository/` | ✅ merged into `@mohasinac/appkit/features/account` and local file deleted |
| `src/repositories/cart.repository.ts` | `src/features/cart/repository/` | ✅ merged into `@mohasinac/appkit/features/cart` and local file deleted |
| `src/repositories/categories.repository.ts` | `src/features/categories/repository/` | ✅ merged into `@mohasinac/appkit/features/categories` and local file deleted |
| `src/repositories/product.repository.ts` | `src/features/products/repository/` | ✅ merged into `@mohasinac/appkit/features/products` and local file deleted |
| `src/repositories/order.repository.ts` | `src/features/orders/repository/` | ✅ merged into `@mohasinac/appkit/features/orders` and local file deleted |
| `src/repositories/review.repository.ts` | `src/features/reviews/repository/` | ✅ merged into `@mohasinac/appkit/features/reviews` and local file deleted |
| `src/repositories/blog.repository.ts` | `src/features/blog/repository/` | ✅ merged into `@mohasinac/appkit/features/blog` and local file deleted |
| `src/repositories/event.repository.ts` | `src/features/events/repository/` | ✅ merged into `@mohasinac/appkit/features/events` and local file deleted |
| `src/repositories/eventEntry.repository.ts` | `src/features/events/repository/` | ✅ merged into `@mohasinac/appkit/features/events` and local file deleted |
| `src/repositories/bid.repository.ts` | `src/features/auctions/repository/` | ✅ merged into `@mohasinac/appkit/features/auctions` and local file deleted |
| `src/repositories/coupons.repository.ts` | `src/features/promotions/repository/` | ✅ merged into `@mohasinac/appkit/features/promotions` and local file deleted |
| `src/repositories/offer.repository.ts` | `src/features/seller/repository/` | ✅ merged into `@mohasinac/appkit/features/seller` and local file deleted |
| `src/repositories/payout.repository.ts` | `src/features/payments/repository/` | ✅ merged into `@mohasinac/appkit/features/payments` and local file deleted |
| `src/repositories/store.repository.ts` | `src/features/stores/repository/` | ✅ merged into `@mohasinac/appkit/features/stores` and local file deleted |
| `src/repositories/store-address.repository.ts` | `src/features/stores/repository/` | ✅ merged into `@mohasinac/appkit/features/stores` and local file deleted |
| `src/repositories/notification.repository.ts` | `src/features/admin/repository/` | ✅ merged into `@mohasinac/appkit/features/admin` and local file deleted |
| `src/repositories/chat.repository.ts` | `src/features/admin/repository/` | ✅ merged into `@mohasinac/appkit/features/admin` and local file deleted |
| `src/repositories/site-settings.repository.ts` | `src/features/admin/repository/` | ✅ merged into `@mohasinac/appkit/features/admin` and local file deleted |
| `src/repositories/carousel.repository.ts` | `src/features/homepage/repository/` | ✅ merged into `@mohasinac/appkit/features/homepage` and local file deleted |
| `src/repositories/homepage-sections.repository.ts` | `src/features/homepage/repository/` | ✅ merged into `@mohasinac/appkit/features/homepage` and local file deleted |
| `src/repositories/faqs.repository.ts` | `src/features/faq/repository/` | ✅ merged into `@mohasinac/appkit/features/faq` and local file deleted |
| `src/repositories/wishlist.repository.ts` | `src/features/wishlist/repository/` | ✅ merged into `@mohasinac/appkit/features/wishlist` and local file deleted |
| `src/repositories/sms-counter.repository.ts` | `src/features/auth/repository/` | ✅ merged into `@mohasinac/appkit/features/auth` and local file deleted |
| `src/repositories/failed-checkout.repository.ts` | `src/features/checkout/repository/` | ✅ moved to `@mohasinac/appkit/features/checkout`; local file deleted and route imports rewired |
| `src/repositories/unit-of-work.ts` | `src/contracts/` or delete | ✅ moved to `@mohasinac/appkit/core` and local file deleted |

---

## Phase 6 — Seed Data

**Target in appkit:** `src/seed/<entity>-seed-data.ts` — generic factory data; entity-specific values injected via factory config.  
**Dependency:** Phase 1 schemas + Phase 5 repositories must be in appkit first (exec order 5).

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/db/seed-data/index.ts` | delete (barrel) | ✅ deleted; API imports switched to direct files/appkit seed |
| `src/db/seed-data/users-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/sessions-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/addresses-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/stores-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/store-addresses-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/categories-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/products-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/orders-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/reviews-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/cart-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/bids-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/coupons-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/events-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/payouts-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/notifications-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/blog-posts-seed-data.ts` | `src/seed/` | ✅ moved to `@mohasinac/appkit/seed` and local file deleted |
| `src/db/seed-data/faq-seed-data.ts` | `src/seed/` | ⬜ |
| `src/db/seed-data/homepage-sections-seed-data.ts` | `src/seed/` | ⬜ |
| `src/db/seed-data/site-settings-seed-data.ts` | `src/seed/` | ⬜ |
| `src/db/seed-data/carousel-slides-seed-data.ts` | `src/seed/` | ⬜ |


---

## Phase 7 — Actions → Appkit

**Goal:** Move all business logic from letitrip action files into appkit server functions. Each `src/actions/*.actions.ts` file stays in letitrip as a `'use server'` thin entrypoint that: (1) authenticates the caller, (2) validates + parses input, (3) calls the appkit domain function, (4) returns a typed result. No business logic, no repository calls, no PII manipulation in the letitrip file.

**Appkit target:** `src/features/<domain>/actions/` (or `services/` for non-Next.js-specific logic).  
**Dependency:** Phase 5 repositories + Phase 4 server infrastructure must be in appkit first (exec order 6). Do not start until exec order 1–5 are done.  
**Rule:** The letitrip file is **reduced but not deleted**. It keeps `'use server'` and only imports + calls the appkit function.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/actions/address.actions.ts` | `src/features/account/actions/` | ⬜ |
| `src/actions/cart.actions.ts` | `src/features/cart/actions/` | ⬜ |
| `src/actions/coupon.actions.ts` | `src/features/promotions/actions/` | ⬜ |
| `src/actions/order.actions.ts` | `src/features/orders/actions/` | ⬜ |
| `src/actions/checkout.actions.ts` | `src/features/checkout/actions/` | ⬜ |
| `src/actions/refund.actions.ts` | `src/features/orders/actions/` | ⬜ |
| `src/actions/wishlist.actions.ts` | `src/features/wishlist/actions/` | ⬜ |
| `src/actions/store-address.actions.ts` | `src/features/stores/actions/` | ⬜ |
| `src/actions/store.actions.ts` | `src/features/stores/actions/` | ⬜ |
| `src/actions/profile.actions.ts` | `src/features/auth/actions/` | ⬜ |
| `src/actions/category.actions.ts` | `src/features/categories/actions/` | ⬜ |
| `src/actions/product.actions.ts` | `src/features/products/actions/` | ⬜ |
| `src/actions/blog.actions.ts` | `src/features/blog/actions/` | ⬜ |
| `src/actions/sections.actions.ts` | `src/features/homepage/actions/` | ⬜ |
| `src/actions/faq.actions.ts` | `src/features/faq/actions/` | ⬜ |
| `src/actions/promotions.actions.ts` | `src/features/promotions/actions/` | ⬜ |
| `src/actions/search.actions.ts` | `src/features/search/actions/` | ⬜ |
| `src/actions/newsletter.actions.ts` | `src/core/newsletter/actions/` | ⬜ |
| `src/actions/notification.actions.ts` | `src/features/admin/actions/` | ⬜ |
| `src/actions/contact.actions.ts` | `src/features/contact/actions/` | ⬜ |
| `src/actions/bid.actions.ts` | `src/features/auctions/actions/` | ⬜ |
| `src/actions/event.actions.ts` | `src/features/events/actions/` | ⬜ |
| `src/actions/offer.actions.ts` | `src/features/seller/actions/` | ⬜ |
| `src/actions/seller-coupon.actions.ts` | `src/features/promotions/actions/` | ⬜ |
| `src/actions/seller.actions.ts` | `src/features/seller/actions/` | ⬜ |
| `src/actions/realtime-token.actions.ts` | `src/features/auth/actions/` | ⬜ |
| `src/actions/chat.actions.ts` | `src/features/admin/actions/` | ⬜ |
| `src/actions/site-settings.actions.ts` | `src/features/admin/actions/` | ⬜ |
| `src/actions/carousel.actions.ts` | `src/features/homepage/actions/` | ⬜ |
| `src/actions/demo-seed.actions.ts` | `src/seed/` demo runner | ⬜ |
| `src/actions/admin.actions.ts` | `src/features/admin/actions/` | ⬜ |
| `src/actions/admin-coupon.actions.ts` | `src/features/admin/actions/` | ⬜ |
| `src/actions/admin-read.actions.ts` | `src/features/admin/actions/` | ⬜ |
| `src/actions/review.actions.ts` | `src/features/reviews/actions/` | ⬜ |
| `src/actions/index.ts` | keep as barrel | 🔒 |

---

## Phase 8 — Hooks

**Target in appkit:** `src/features/<entity>/hooks/`  
**Dependency:** Phase 5 repositories + Phase 7 appkit actions must be in appkit first (exec order 7). Hooks for mutations call appkit action functions; hooks for reads call appkit repo instances.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/hooks/useAuth.ts` | `src/features/auth/hooks/` | ⬜ |
| `src/hooks/useRBAC.ts` | `src/features/auth/hooks/` | ⬜ |
| `src/hooks/useProfile.ts` | `src/features/account/hooks/` | ⬜ |
| `src/hooks/usePublicProfile.ts` | `src/features/account/hooks/` | ⬜ |
| `src/hooks/useChat.ts` | `src/features/admin/hooks/` | ⬜ |
| `src/hooks/useHomepageSections.ts` | `src/features/homepage/hooks/` | ⬜ |
| `src/hooks/useProductReviews.ts` | `src/features/reviews/hooks/` | ⬜ |
| `src/hooks/useRelatedProducts.ts` | `src/features/products/hooks/` | ⬜ |
| `src/hooks/useSellerStorefront.ts` | `src/features/seller/hooks/` | ⬜ |
| `src/hooks/useStoreAddressSelector.ts` | `src/features/stores/hooks/` | ⬜ |
| `src/hooks/useBulkEvent.ts` | `src/features/events/hooks/` | ⬜ |
| `src/hooks/useWishlistToggle.ts` | `src/features/wishlist/hooks/` | ⬜ |
| `src/hooks/useContactSubmit.ts` | `src/features/contact/hooks/` | ⬜ |
| `src/hooks/useUrlTable.ts` | `src/react/hooks/` (generic table hook) | ⬜ |
| `src/hooks/useUnsavedChanges.ts` | `src/react/hooks/` (generic) | ⬜ |
| `src/hooks/useRazorpay.ts` | keep local — Razorpay driver | 🔒 |
| `src/hooks/index.ts` | delete | ⬜ |

---

## Phase 9 — Shared UI Components

**Target in appkit:** `src/ui/` for generics, `src/features/<entity>/components/` for domain components.  
**Dependency:** Phase 8 hooks must be in appkit first (exec order 8).

### Phase 9a — Layout Shell

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/components/layout/BottomNavbar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/Footer.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/MainNavbar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/Sidebar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/TitleBar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/index.ts` | delete | ⬜ |

### Phase 9b — Generic UI

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/components/ui/SideDrawer.tsx` | `src/ui/components/` | ⬜ |
| `src/components/ui/index.ts` | delete | ⬜ |
| `src/components/typography/TextLink.tsx` | `src/ui/components/` | ⬜ |
| `src/components/modals/ConfirmDeleteModal.tsx` | `src/ui/components/` | ⬜ |
| `src/components/modals/UnsavedChangesModal.tsx` | `src/ui/components/` | ⬜ |
| `src/components/utility/BackToTop.tsx` | `src/ui/components/` | ⬜ |
| `src/components/utility/BackgroundRenderer.tsx` | `src/ui/components/` | ⬜ |
| `src/components/utility/ResponsiveView.tsx` | `src/ui/components/` | ⬜ |
| `src/components/utility/Search.tsx` | `src/features/search/components/` | ⬜ |
| `src/components/utility/index.ts` | delete | ⬜ |

### Phase 9c — Domain Components

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/components/user/AddressCard.tsx` | `src/features/account/components/` | ⬜ |
| `src/components/user/AddressForm.tsx` | `src/features/account/components/` | ⬜ |
| `src/components/user/AddressSelectorCreate.tsx` | `src/features/account/components/` | ⬜ |
| `src/components/user/NotificationBell.tsx` | `src/features/admin/components/` | ⬜ |
| `src/components/user/StoreAddressSelectorCreate.tsx` | `src/features/stores/components/` | ⬜ |
| `src/components/user/index.ts` | delete | ⬜ |
| `src/components/categories/CategoryCard.tsx` | `src/features/categories/components/` | ⬜ |
| `src/components/categories/CategoryForm.tsx` | `src/features/categories/components/` | ⬜ |
| `src/components/categories/CategorySelectorCreate.tsx` | `src/features/categories/components/` | ⬜ |
| `src/components/categories/CategoryTableColumns.tsx` | `src/features/categories/components/` | ⬜ |
| `src/components/categories/Category.types.ts` | `src/features/categories/types/` | ⬜ |
| `src/components/categories/index.ts` | delete | ⬜ |
| `src/components/orders/OrderCard.tsx` | `src/features/orders/components/` | ⬜ |
| `src/components/orders/index.ts` | delete | ⬜ |
| `src/components/pre-orders/PreOrderCard.tsx` | `src/features/pre-orders/components/` | ⬜ |
| `src/components/pre-orders/index.ts` | delete | ⬜ |
| `src/components/auctions/AuctionCard.tsx` | `src/features/auctions/components/` | ⬜ |
| `src/components/auctions/AuctionGrid.tsx` | `src/features/auctions/components/` | ⬜ |
| `src/components/auctions/index.ts` | delete | ⬜ |
| `src/components/admin/AdminFilterBar.tsx` | `src/features/admin/components/` | ⬜ |
| `src/components/admin/AdminPageHeader.tsx` | `src/features/admin/components/` | ⬜ |
| `src/components/admin/DrawerFormFooter.tsx` | `src/features/admin/components/` | ⬜ |
| `src/components/admin/index.ts` | delete | ⬜ |
| `src/components/auth/ProtectedRoute.tsx` | `src/features/auth/components/` | ⬜ |
| `src/components/auth/RoleGate.tsx` | `src/features/auth/components/` | ⬜ |
| `src/components/auth/index.ts` | delete | ⬜ |
| `src/components/products/Product.types.ts` | `src/features/products/types/` | ⬜ |
| `src/components/products/index.ts` | delete | ⬜ |

### Phase 9d — Providers and Barrels

| File | Decision | Status |
|------|----------|--------|
| `src/components/providers/MonitoringProvider.tsx` | `src/features/admin/components/` or `src/next/` | ⬜ |
| `src/components/providers/QueryProvider.tsx` | `src/react/` | ⬜ |
| `src/components/providers/index.ts` | delete | ⬜ |
| `src/components/media-modals.client.ts` | `src/features/media/components/` | ⬜ |
| `src/components/filters/index.ts` | delete (already empty) | ⬜ |
| `src/components/media/index.ts` | delete (already empty) | ⬜ |
| `src/components/stores/index.ts` | delete | ⬜ |
| `src/components/index.ts` | delete | ⬜ |

---

## Phase 10 — Feature Modules

**Dependency:** Exec orders 1–9 (Phase 1 through Phase 9) must all be complete. Each feature migrates in order: types → validation → server → actions → hooks → components → index.  
**Execution rule:** One feature at a time. Do not start next feature until tsc passes.

| Feature | letitrip Files | Appkit Feature | Status |
|---------|---------------|----------------|--------|
| `src/features/auth/` | ~8 files | `src/features/auth/` | ⬜ |
| `src/features/about/` | ~11 files | `src/features/about/` | ⬜ |
| `src/features/blog/` | ~5 files | `src/features/blog/` | ⬜ |
| `src/features/contact/` | ~4 files | `src/features/contact/` | ⬜ |
| `src/features/faq/` | ~4 files | `src/features/faq/` | ⬜ |
| `src/features/search/` | ~4 files | `src/features/search/` | ⬜ |
| `src/features/wishlist/` | ~4 files | `src/features/wishlist/` | ⬜ |
| `src/features/promotions/` | ~5 files | `src/features/promotions/` | ⬜ |
| `src/features/reviews/` | ~5 files | `src/features/reviews/` | ⬜ |
| `src/features/copilot/` | ~5 files | `src/features/copilot/` | ⬜ |
| `src/features/categories/` | ~7 files | `src/features/categories/` | ⬜ |
| `src/features/stores/` | ~12 files | `src/features/stores/` | ⬜ |
| `src/features/homepage/` | ~28 files | `src/features/homepage/` | ⬜ |
| `src/features/products/` | ~24 files | `src/features/products/` | ⬜ |
| `src/features/cart/` | ~26 files | `src/features/cart/` | ⬜ |
| `src/features/events/` | ~37 files | `src/features/events/` | ⬜ |
| `src/features/user/` | ~36 files | `src/features/account/` | ⬜ |
| `src/features/seller/` | ~48 files | `src/features/seller/` | ⬜ |
| `src/features/admin/` | ~102 files | `src/features/admin/` | ⬜ |

---

## Session Checkpoint Protocol

At the end of every work session:
1. Update status symbols in this file for every file touched.
2. Run `tsc --noEmit` in both repos. Note any outstanding errors.
3. Commit with message: `migrate: <phase> <scope> — <n> files`
4. Leave a one-line note at the bottom of this file: **Last session ended at:** [phase + file].

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress (current session) |
| ✅ | Done — letitrip file deleted or reduced to thin delegation |
| 🔒 | Keep local — legitimate permanent local |
| ❌ | Blocked — unresolved dependency (note in comments) |

---

## Session Notes

### 2026-04-15 — Phase 1 Batch 1 (auth/stores/account/cart/categories schemas)

**Completed:** 10/30 Phase 1 files — auth, stores, account, cart, categories schemas migrated to appkit `firestore.ts` files. `field-names.ts` updated to re-export 4 FIELDS constants from appkit; remaining FIELDS (product/order/review/bid/carousel/coupon/faq/homepage/site-settings/common) still local. `index.ts` barrel kept (223 import sites).

**appkit files created:**
- `src/features/auth/schemas/firestore.ts` — UserDocument, tokens, sessions, SMS + field constants
- `src/features/stores/schemas/firestore.ts` — StoreDocument, StoreAddressDocument + constants
- `src/features/account/schemas/firestore.ts` — AddressDocument + constants
- `src/features/cart/schemas/firestore.ts` — CartDocument, CartItemDocument + constants
- `src/features/categories/schemas/firestore.ts` — CategoryDocument + hierarchy helpers + buildCategoryTree

**Important:** After editing appkit, sync changed files to `node_modules/@mohasinac/appkit/src/` — appkit is not auto-linked. Run: `robocopy d:\proj\appkit\src d:\proj\letitrip.in\node_modules\@mohasinac\appkit\src /E /XO`

**Last session ended at:** `src/db/schema/categories.ts` — next file is `src/db/schema/products.ts` (Phase 1 file 11/30)

### 2026-04-15 — Phase 4 Batch 1 (foundation repositories merged)

**Processed in order (10 files):** `base.repository.ts`, `index.ts`, `copilot-log.repository.ts`, `newsletter.repository.ts`, `user.repository.ts`, `token.repository.ts`, `session.repository.ts`, `address.repository.ts`, `cart.repository.ts`, `categories.repository.ts`.

**Completed:**
- Added shared Firestore `BaseRepository` to `@mohasinac/appkit/providers/db-firebase` and repointed remaining local repository implementations to that shared base.
- Merged letitrip user/token/session repositories into `@mohasinac/appkit/features/auth`.
- Merged letitrip address repository into `@mohasinac/appkit/features/account`.
- Merged letitrip cart and categories repositories into `@mohasinac/appkit/features/cart` and `@mohasinac/appkit/features/categories`.
- Deleted the local letitrip copies of those foundation repositories and rewired `src/repositories/index.ts` plus `src/repositories/unit-of-work.ts` to appkit-owned instances.

**Remaining note:** `src/repositories/index.ts` stays temporarily as the consumer barrel until the rest of Phase 4 stops importing through `@/repositories`.

**Commit message to use:** `migrate: phase4 foundation repos into appkit — 8 files`

### 2026-04-15 — Phase 4 Batch 2 (next 10 repositories)

Superseded by the Phase 4 restart baseline below.

**Processed in order (10 files):** `product.repository.ts`, `order.repository.ts`, `review.repository.ts`, `blog.repository.ts`, `event.repository.ts`, `eventEntry.repository.ts`, `bid.repository.ts`, `coupons.repository.ts`, `offer.repository.ts`, `payout.repository.ts`.

**Result (historical):** restart baseline replaced these temporary blocked markers.

**Commit message to use:** `migrate: Phase 4 repositories-domain-parity-blocked — 0 files`

### 2026-04-15 — Phase 4 Batch 3 (stores/admin/homepage/faq/wishlist/auth repos)

Superseded by the Phase 4 restart baseline below.

**Processed in order (10 files):** `store.repository.ts`, `store-address.repository.ts`, `notification.repository.ts`, `chat.repository.ts`, `site-settings.repository.ts`, `carousel.repository.ts`, `homepage-sections.repository.ts`, `faqs.repository.ts`, `wishlist.repository.ts`, `sms-counter.repository.ts`.

**Result (historical):** restart baseline replaced these temporary blocked markers.

**Commit message to use:** `migrate: Phase 4 repositories-stores-admin-homepage-faq-wishlist-auth-blocked — 0 files`

### 2026-04-15 — Phase 1 verification + closure

**Verification scope:** all schema files in `src/db/schema/` plus `src/db/indices/merge-indices.ts`.

**Result:** schema migrations remain valid; `src/db/schema/index.ts` is still an intentional local barrel (`🔒`) due to broad import usage; `src/db/indices/merge-indices.ts` was migrated into appkit seed utilities and deleted locally.

**Tracker update:** Phase 1 status restored to `✅ 30/30 complete`.

### 2026-04-15 — Phase 4 restart batch (historical)

Superseded by the concrete repository merge above.

### 2026-04-15 — Phase 1 closure + Phase 2 ordered slice

**Processed in order:** `src/db/indices/merge-indices.ts`, `src/constants/ui.ts`, `src/constants/theme.ts`, `src/constants/homepage-data.ts`, `src/constants/address.ts`, `src/constants/index.ts`, `src/utils/index.ts`.

**Result:**
- `merge-indices.ts` moved to appkit seed utilities (`src/seed/firestore-indexes.ts`) and deleted from letitrip.
- `ui.ts`, `theme.ts`, `homepage-data.ts`, and `faq.ts` classified as site/market configuration constants and kept local (`🔒`).
- `address.ts` ownership moved to appkit account constants (`src/features/account/constants/addresses.ts`); local file was already absent.
- `constants/index.ts` and `utils/index.ts` remain blocked for deletion pending bulk import rewiring.
- Removed stale `ui-labels-core.ts` and `ui-labels-admin.ts` files that were causing duplicate export errors.

**Validation:**
- `npx tsc --noEmit` in `appkit` passed.
- `npx tsc --noEmit` in `letitrip.in` passed.

**Commit message to use:** `migrate: phase1 closure + phase2 constants triage — 7 files`

### 2026-04-15 — Phase 3 Batch 1 (helpers + logging + settings encryption)

**Processed in order (10 files):** `src/helpers/auth/auth.helper.ts`, `src/helpers/auth/token.helper.ts`, `src/helpers/auth/index.ts`, `src/helpers/logging/error-logger.ts`, `src/helpers/logging/server-error-logger.ts`, `src/helpers/logging/index.ts`, `src/helpers/validation/address.helper.ts`, `src/helpers/validation/index.ts`, `src/helpers/index.ts`, `src/lib/encryption.ts`.

**Result:**
- Moved auth utility functions into `@mohasinac/appkit/features/auth` and rewired letitrip role/session helper imports to the canonical appkit entrypoint.
- Merged client and server logging helper APIs into `@mohasinac/appkit/monitoring`, rewired monitoring initialization, and removed the local logging helper tree.
- Added reusable address-form validation to `@mohasinac/appkit/features/account` and settings-secret encryption to `@mohasinac/appkit/security`, then deleted the local helper files.

**Validation:**
- `npm run typecheck` in `appkit` passed.
- `npx tsc --noEmit` in `letitrip.in` passed after syncing updated appkit source into the installed package copy.

**Commit message to use:** `migrate: phase3 helpers logging encryption — 10 files`

---

## Last Session

**Last session ended at:** `Phase 6 — src/db/seed-data/blog-posts-seed-data.ts` (next actionable files: `faq-seed-data.ts`, `homepage-sections-seed-data.ts`, `site-settings-seed-data.ts`, `carousel-slides-seed-data.ts`)
**Commit message (Session 14):** `migrate: phase6 seed batch2 - rewire routes to appkit/seed, delete 10 local files`

**Commit message:** `migrate: phase5 closure + phase6 seed batch1 into appkit — 10 files`

## Session Notes

- 2026-04-15 Session 5: Migrated src/lib/pii.ts, src/lib/email.ts, and src/lib/server-logger.ts into appkit. Shared email now uses the provider registry via @mohasinac/appkit/features/contact, and shared server logging now lives in @mohasinac/appkit/monitoring with the existing serverLogger object API preserved. Appkit typecheck passes; letitrip only reports unrelated existing .next/dev validator errors.
- Commit message: migrate: phase3 shared logger and email — 2 files
- 2026-04-15 Session 6: Migrated src/lib/tokens.ts into appkit as src/features/auth/token-store.ts and exported via @mohasinac/appkit/features/auth. Local tokens module deleted.
- Commit message: migrate: phase3 tokens ownership move — 1 file
- 2026-04-15 Session 6: Migrated src/lib/consent-otp.ts into appkit as src/features/auth/consent-otp.ts and rewired checkout/payment routes and actions to @mohasinac/appkit/features/auth. Local consent-otp module deleted.
- Commit message: migrate: phase3 consent-otp ownership move — 1 file
- 2026-04-15 Session 7: Migrated src/lib/api/api-handler.ts into appkit as src/http/api-handler.ts, exported via @mohasinac/appkit/http, and removed the local api-handler file after route imports were rewired.
- Commit message: migrate: phase3 api-handler ownership move — 1 file
- 2026-04-15 Session 8: Migrated query/media/monitoring shared libs into appkit, rewired canonical imports (`@mohasinac/appkit/providers/db-firebase`, `@mohasinac/appkit/features/media`, `@mohasinac/appkit/monitoring`), and deleted local query/media/monitoring files plus local rtdb-paths constants.
- Commit message: migrate: phase3 query-media-monitoring-rtdb consolidation — 9 files
- 2026-04-15 Session 9: Merged the Phase 4 foundation repository set into appkit. Added a shared Firestore `BaseRepository` under `@mohasinac/appkit/providers/db-firebase`, moved user/token/session repos into `@mohasinac/appkit/features/auth`, moved address repo into `@mohasinac/appkit/features/account`, moved cart/categories repos into their appkit features, rewired the letitrip repository barrel and unit-of-work, and deleted the local repository copies.
- Commit message: migrate: phase4 foundation repos into appkit — 8 files
- 2026-04-15 Session 10: Migrated the next five Phase 4 repositories (`order`, `review`, `blog`, `event`, `eventEntry`) into appkit feature repositories, rewired letitrip `src/repositories/index.ts` and `src/repositories/unit-of-work.ts` to canonical appkit imports, and deleted the local repository files.
- Commit message: migrate: phase4 next-five repositories into appkit — 12 files
- 2026-04-15 Session 11: Migrated ten Phase 5 repositories (`bid`, `coupons`, `offer`, `payout`, `store`, `store-address`, `notification`, `chat`, `site-settings`, `carousel`) into appkit feature repositories, rewired letitrip repository imports to canonical feature entrypoints, and deleted local repository files.
- Commit message: migrate: phase5 repositories bid-through-carousel into appkit — 10 files
- 2026-04-15 Session 12: Migrated `src/repositories/homepage-sections.repository.ts` into `@mohasinac/appkit/features/homepage`, rewired `src/repositories/index.ts` and `src/repositories/unit-of-work.ts` to the appkit feature entrypoint, and deleted the local repository file.
- Commit message: migrate: phase5 homepage sections repository into appkit — 1 file
- 2026-04-15 Session 13: Migrated three remaining Phase 5 repositories (`wishlist`, `sms-counter`, `unit-of-work`) into appkit feature/core ownership, then migrated the first seven Phase 6 seed files (`index`, `users`, `sessions`, `addresses`, `stores`, `store-addresses`, `categories`) into `@mohasinac/appkit/seed` and deleted local copies.
- Commit message: migrate: phase5 closure + phase6 seed batch1 into appkit — 10 files
- 2026-04-15 Session 14: Migrated next 10 Phase 6 seed files (`products`, `orders`, `reviews`, `cart`, `bids`, `coupons`, `events`, `payouts`, `notifications`, `blog-posts`) into `@mohasinac/appkit/seed`, rewired all 4 importer routes (demo/seed, events/[id], events/[id]/enter, events/[id]/leaderboard) to `@mohasinac/appkit/seed`, and deleted local copies.
- Commit message: migrate: phase6 seed batch2 — 10 files
