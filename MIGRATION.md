# letitrip.in → appkit Migration Tracker

**Last verified:** 2026-04-15  
**Goal:** Reduce letitrip.in to a thin consumer — routes, server-action entrypoints, provider wiring, market config, and SDK drivers only.

---

## Summary

| Phase | Scope | Files | Status |
|-------|-------|-------|--------|
| P1 | Schema Layer | 30 | ✅ 30/30 |
| P2 | Repository Layer | 32 | ⬜ |
| P3 | Seed Data | 21 | ⬜ |
| P4 | Server Utilities | 18 | ⬜ |
| P5 | Hooks | 16 | ⬜ |
| P6 | Shared Components | 30 | ⬜ |
| P7 | Feature Modules | ~375 | ⬜ |
| P8 | Constants & Utils | 13 | ⬜ |
| P9 | Action Thinning | 35 | ⬜ |

**Total to migrate/delete: ~570 files**

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
src/actions/                          — Server action entrypoints (thin wrappers)
```

---

## Execution Contract

For every file migrated:
1. Verify appkit target already exists OR create the generic implementation in appkit.
2. Update all letitrip import sites to point at `@mohasinac/appkit/...`.
3. Delete the letitrip file (or reduce to a thin delegation if it's a legitimate local).
4. After every 10-file batch: run `tsc --noEmit` in both repos. Fix all errors before continuing.

---

## Phase 1 — Schema Layer

**Target in appkit:** `src/features/<entity>/schemas/` (field constants, collection names, default shapes)  
**Dependency:** Nothing depends on schemas upstream. Start here.

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
| `src/db/schema/chat.ts` | `src/features/admin/schemas/` | ⬜ |
| `src/db/schema/site-settings.ts` | `src/features/admin/schemas/` | ⬜ |
| `src/db/schema/carousel-slides.ts` | `src/features/homepage/schemas/` | ⬜ |
| `src/db/schema/homepage-sections.ts` | `src/features/homepage/schemas/` | ⬜ |
| `src/db/schema/faqs.ts` | `src/features/faq/schemas/` | ⬜ |
| `src/db/schema/newsletter-subscribers.ts` | `src/core/` (already has newsletter.repository.ts) | ⬜ |
| `src/db/schema/copilot-logs.ts` | `src/features/copilot/` | ⬜ |
| `src/db/schema/failed-checkouts.ts` | `src/features/checkout/schemas/` | ⬜ |
| `src/db/schema/sms-counters.ts` | `src/features/auth/schemas/` | ⬜ |
| `src/db/indices/merge-indices.ts` | `appkit/scripts/` or delete | ⬜ |

---

## Phase 2 — Repository Layer

**Target in appkit:** `src/features/<entity>/repository/` — implement or verify existing.  
**Dependency:** Phase 1 schemas must be done first.

Note: `copilot-log.repository.ts` and `newsletter.repository.ts` are already in `appkit/src/core/`.

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/repositories/base.repository.ts` | verify `src/contracts/repository.ts` covers this | ⬜ |
| `src/repositories/index.ts` | delete (barrel) | ⬜ |
| `src/repositories/copilot-log.repository.ts` | already in `appkit/src/core/` — delete letitrip copy | ⬜ |
| `src/repositories/newsletter.repository.ts` | already in `appkit/src/core/` — delete letitrip copy | ⬜ |
| `src/repositories/user.repository.ts` | `src/features/auth/repository/` | ⬜ |
| `src/repositories/token.repository.ts` | `src/features/auth/repository/` | ⬜ |
| `src/repositories/session.repository.ts` | `src/features/auth/repository/` | ⬜ |
| `src/repositories/address.repository.ts` | `src/features/account/repository/` | ⬜ |
| `src/repositories/cart.repository.ts` | `src/features/cart/repository/` | ⬜ |
| `src/repositories/categories.repository.ts` | `src/features/categories/repository/` | ⬜ |
| `src/repositories/product.repository.ts` | `src/features/products/repository/` | ⬜ |
| `src/repositories/order.repository.ts` | `src/features/orders/repository/` | ⬜ |
| `src/repositories/review.repository.ts` | `src/features/reviews/repository/` | ⬜ |
| `src/repositories/blog.repository.ts` | `src/features/blog/repository/` | ⬜ |
| `src/repositories/event.repository.ts` | `src/features/events/repository/` | ⬜ |
| `src/repositories/eventEntry.repository.ts` | `src/features/events/repository/` | ⬜ |
| `src/repositories/bid.repository.ts` | `src/features/auctions/repository/` | ⬜ |
| `src/repositories/coupons.repository.ts` | `src/features/promotions/repository/` | ⬜ |
| `src/repositories/offer.repository.ts` | `src/features/seller/repository/` | ⬜ |
| `src/repositories/payout.repository.ts` | `src/features/payments/repository/` | ⬜ |
| `src/repositories/store.repository.ts` | `src/features/stores/repository/` | ⬜ |
| `src/repositories/store-address.repository.ts` | `src/features/stores/repository/` | ⬜ |
| `src/repositories/notification.repository.ts` | `src/features/admin/repository/` | ⬜ |
| `src/repositories/chat.repository.ts` | `src/features/admin/repository/` | ⬜ |
| `src/repositories/site-settings.repository.ts` | `src/features/admin/repository/` | ⬜ |
| `src/repositories/carousel.repository.ts` | `src/features/homepage/repository/` | ⬜ |
| `src/repositories/homepage-sections.repository.ts` | `src/features/homepage/repository/` | ⬜ |
| `src/repositories/faqs.repository.ts` | `src/features/faq/repository/` | ⬜ |
| `src/repositories/wishlist.repository.ts` | `src/features/wishlist/repository/` | ⬜ |
| `src/repositories/sms-counter.repository.ts` | `src/features/auth/repository/` | ⬜ |
| `src/repositories/failed-checkout.repository.ts` | `src/features/checkout/repository/` | ⬜ |
| `src/repositories/unit-of-work.ts` | `src/contracts/` or delete | ⬜ |

---

## Phase 3 — Seed Data

**Target in appkit:** `src/seed/` (already exists) or `src/features/<entity>/` factory files.  
**Dependency:** Phase 1 + Phase 2 done first.

| File | Status |
|------|--------|
| `src/db/seed-data/users-seed-data.ts` | ⬜ |
| `src/db/seed-data/sessions-seed-data.ts` | ⬜ |
| `src/db/seed-data/addresses-seed-data.ts` | ⬜ |
| `src/db/seed-data/stores-seed-data.ts` | ⬜ |
| `src/db/seed-data/store-addresses-seed-data.ts` | ⬜ |
| `src/db/seed-data/categories-seed-data.ts` | ⬜ |
| `src/db/seed-data/products-seed-data.ts` | ⬜ |
| `src/db/seed-data/cart-seed-data.ts` | ⬜ |
| `src/db/seed-data/orders-seed-data.ts` | ⬜ |
| `src/db/seed-data/reviews-seed-data.ts` | ⬜ |
| `src/db/seed-data/blog-posts-seed-data.ts` | ⬜ |
| `src/db/seed-data/events-seed-data.ts` | ⬜ |
| `src/db/seed-data/bids-seed-data.ts` | ⬜ |
| `src/db/seed-data/coupons-seed-data.ts` | ⬜ |
| `src/db/seed-data/payouts-seed-data.ts` | ⬜ |
| `src/db/seed-data/notifications-seed-data.ts` | ⬜ |
| `src/db/seed-data/carousel-slides-seed-data.ts` | ⬜ |
| `src/db/seed-data/homepage-sections-seed-data.ts` | ⬜ |
| `src/db/seed-data/faq-seed-data.ts` | ⬜ |
| `src/db/seed-data/site-settings-seed-data.ts` | ⬜ |
| `src/db/seed-data/index.ts` | ⬜ |

---

## Phase 4 — Server Utilities

**Dependency:** Independent of P1–P3. Can overlap, but keep separate commits.

### 4a — Helpers

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/helpers/auth/auth.helper.ts` | `src/features/auth/` server utils | ⬜ |
| `src/helpers/auth/token.helper.ts` | `src/features/auth/` server utils | ⬜ |
| `src/helpers/auth/index.ts` | delete | ⬜ |
| `src/helpers/logging/error-logger.ts` | `src/monitoring/` or `src/errors/` | ⬜ |
| `src/helpers/logging/server-error-logger.ts` | `src/monitoring/` | ⬜ |
| `src/helpers/logging/index.ts` | delete | ⬜ |
| `src/helpers/validation/address.helper.ts` | `src/features/account/` | ⬜ |
| `src/helpers/validation/index.ts` | delete | ⬜ |
| `src/helpers/index.ts` | delete | ⬜ |

### 4b — Shared Lib (non-driver)

| File | Appkit Target | Keep Local? | Status |
|------|--------------|-------------|--------|
| `src/lib/encryption.ts` | `src/security/` | No | ⬜ |
| `src/lib/pii.ts` | `src/security/` | No | ⬜ |
| `src/lib/email.ts` | `src/features/contact/` server util | No | ⬜ |
| `src/lib/server-logger.ts` | `src/monitoring/` | No | ⬜ |
| `src/lib/tokens.ts` | `src/features/auth/` | No | ⬜ |
| `src/lib/consent-otp.ts` | `src/features/auth/` | No | ⬜ |
| `src/lib/api/api-handler.ts` | `src/http/` | No | ⬜ |
| `src/lib/query/firebase-sieve.ts` | `src/providers/` Firebase query utils | No | ⬜ |
| `src/lib/query/index.ts` | delete | No | ⬜ |
| `src/lib/media/finalize.ts` | `src/features/media/` | No | ⬜ |
| `src/lib/monitoring/analytics.ts` | `src/monitoring/` | No | ⬜ |
| `src/lib/monitoring/index.ts` | delete | No | ⬜ |
| `src/lib/validation/schemas.ts` | `src/validation/` | No | ⬜ |
| `src/lib/firebase/auth-helpers.ts` | `src/features/auth/` | No | ⬜ |
| `src/lib/firebase/realtime-db.ts` | `src/providers/` Firebase RTDB utils | No | ⬜ |
| `src/lib/firebase/rtdb-paths.ts` | `src/providers/` Firebase paths | No | ⬜ |

---

## Phase 5 — Hooks

**Target in appkit:** `src/features/<entity>/hooks/`  
**Dependency:** Phase 2 repositories should be in appkit first.

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

## Phase 6 — Shared Components

**Target in appkit:** `src/ui/` for generics, `src/features/<entity>/components/` for domain components.  
**Dependency:** Phase 5 hooks done first.

### 6a — Layout Shell

| File | Appkit Target | Status |
|------|--------------|--------|
| `src/components/layout/BottomNavbar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/Footer.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/MainNavbar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/Sidebar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/TitleBar.tsx` | `src/features/layout/components/` | ⬜ |
| `src/components/layout/index.ts` | delete | ⬜ |

### 6b — Generic UI

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

### 6c — Domain Components

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

### 6d — Providers and Barrels

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

## Phase 7 — Feature Modules

**Dependency:** P1–P6 done. Each feature migrates in this order: types → server → hooks → components → index.  
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

## Phase 8 — Constants & Utils

| File | Move to Appkit? | Status |
|------|----------------|--------|
| `src/constants/rbac.ts` | `src/features/auth/` (role definitions) | ⬜ |
| `src/constants/messages.ts` | `src/features/*/messages/` per-feature | ⬜ |
| `src/constants/error-messages.ts` | `src/errors/` | ⬜ |
| `src/constants/success-messages.ts` | `src/features/*/messages/` | ⬜ |
| `src/constants/ui-labels-core.ts` | `src/features/layout/messages/` | ⬜ |
| `src/constants/ui-labels-admin.ts` | `src/features/admin/messages/` | ⬜ |
| `src/constants/ui.ts` | `src/tokens/` or `src/ui/` | ⬜ |
| `src/constants/theme.ts` | `src/tokens/` | ⬜ |
| `src/constants/faq.ts` | `src/features/faq/` | ⬜ |
| `src/constants/homepage-data.ts` | `src/features/homepage/` | ⬜ |
| `src/constants/address.ts` | `src/features/account/` | ⬜ |
| `src/constants/seo.ts` | `src/seo/` | ⬜ |
| `src/constants/index.ts` | delete | ⬜ |
| `src/utils/business-day.ts` | `src/utils/` appkit | ⬜ |
| `src/utils/guest-cart.ts` | `src/features/cart/utils/` | ⬜ |
| `src/utils/index.ts` | delete | ⬜ |

---

## Phase 9 — Action Thinning

**Goal:** Each action file becomes a thin entrypoint that calls an appkit repository or server function.  
**Dependency:** P1–P8 must be done for the relevant domain first.  
**Rule:** Do NOT move action files to appkit. Reduce them, not relocate them.

Actions thin-down checklist — for each file, remove any inline business logic and replace with appkit calls:

| File | Dependencies Done? | Thinned? |
|------|--------------------|----------|
| `src/actions/address.actions.ts` | needs P2 account repo | ⬜ |
| `src/actions/cart.actions.ts` | needs P2 cart repo | ⬜ |
| `src/actions/coupon.actions.ts` | needs P2 promotions repo | ⬜ |
| `src/actions/order.actions.ts` | needs P2 orders repo | ⬜ |
| `src/actions/checkout.actions.ts` | needs P2 checkout repo | ⬜ |
| `src/actions/refund.actions.ts` | needs P2 orders repo | ⬜ |
| `src/actions/wishlist.actions.ts` | needs P2 wishlist repo | ⬜ |
| `src/actions/store-address.actions.ts` | needs P2 stores repo | ⬜ |
| `src/actions/store.actions.ts` | needs P2 stores repo | ⬜ |
| `src/actions/profile.actions.ts` | needs P2 auth repo | ⬜ |
| `src/actions/category.actions.ts` | needs P2 categories repo | ⬜ |
| `src/actions/product.actions.ts` | needs P2 products repo | ⬜ |
| `src/actions/blog.actions.ts` | needs P2 blog repo | ⬜ |
| `src/actions/sections.actions.ts` | needs P2 homepage repo | ⬜ |
| `src/actions/faq.actions.ts` | needs P2 faq repo | ⬜ |
| `src/actions/promotions.actions.ts` | needs P2 promotions repo | ⬜ |
| `src/actions/search.actions.ts` | needs P2 search repo | ⬜ |
| `src/actions/newsletter.actions.ts` | needs P4 core newsletter | ⬜ |
| `src/actions/notification.actions.ts` | needs P2 admin repo | ⬜ |
| `src/actions/contact.actions.ts` | needs P4 email util | ⬜ |
| `src/actions/bid.actions.ts` | needs P2 auctions repo | ⬜ |
| `src/actions/event.actions.ts` | needs P2 events repo | ⬜ |
| `src/actions/offer.actions.ts` | needs P2 seller repo | ⬜ |
| `src/actions/seller-coupon.actions.ts` | needs P2 promotions repo | ⬜ |
| `src/actions/seller.actions.ts` | needs P2 seller repo | ⬜ |
| `src/actions/realtime-token.actions.ts` | needs P4 auth util | ⬜ |
| `src/actions/chat.actions.ts` | needs P2 admin repo | ⬜ |
| `src/actions/site-settings.actions.ts` | needs P2 admin repo | ⬜ |
| `src/actions/carousel.actions.ts` | needs P2 homepage repo | ⬜ |
| `src/actions/demo-seed.actions.ts` | needs P3 seed data | ⬜ |
| `src/actions/admin.actions.ts` | needs P7 admin feature | ⬜ |
| `src/actions/admin-coupon.actions.ts` | needs P7 admin feature | ⬜ |
| `src/actions/admin-read.actions.ts` | needs P7 admin feature | ⬜ |
| `src/actions/review.actions.ts` | needs P2 reviews repo | ⬜ |
| `src/actions/index.ts` | keep as barrel | 🔒 |

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

---

## Session Notes

### 2026-04-15 — P1 Batch 1 (auth/stores/account/cart/categories schemas)

**Completed:** 10/30 P1 files — auth, stores, account, cart, categories schemas migrated to appkit `firestore.ts` files. `field-names.ts` updated to re-export 4 FIELDS constants from appkit; remaining FIELDS (product/order/review/bid/carousel/coupon/faq/homepage/site-settings/common) still local. `index.ts` barrel kept (223 import sites).

**appkit files created:**
- `src/features/auth/schemas/firestore.ts` — UserDocument, tokens, sessions, SMS + field constants
- `src/features/stores/schemas/firestore.ts` — StoreDocument, StoreAddressDocument + constants
- `src/features/account/schemas/firestore.ts` — AddressDocument + constants
- `src/features/cart/schemas/firestore.ts` — CartDocument, CartItemDocument + constants
- `src/features/categories/schemas/firestore.ts` — CategoryDocument + hierarchy helpers + buildCategoryTree

**Important:** After editing appkit, sync changed files to `node_modules/@mohasinac/appkit/src/` — appkit is not auto-linked. Run: `robocopy d:\proj\appkit\src d:\proj\letitrip.in\node_modules\@mohasinac\appkit\src /E /XO`

**Last session ended at:** `src/db/schema/categories.ts` — next file is `src/db/schema/products.ts` (P1 file 11/30)
| ❌ | Blocked — unresolved dependency (note in comments) |

---

## Last Session

**Last session ended at:** — (not started)
