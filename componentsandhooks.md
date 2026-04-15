# Letitrip -> Appkit Consolidation Plan (Dependency-First)

Last verified: 2026-04-15
Verification source: live filesystem check across both folders (`letitrip.in` + `appkit`)

---

## Goal
Keep `letitrip.in` as a thin consumer only.

Allowed to remain in `letitrip.in`:
- Delegations/thin shells
- Route wiring (`src/app`, `src/app/api`)
- Server-action entrypoints (`src/actions`) as thin wrappers only
- Provider wiring (`src/providers.config.ts`, `src/features.config.ts`)
- Market/app-specific config
- SDK drivers and runtime wiring (payment/shipping/firebase/pwa)
- Stubs and adapters that only bridge appkit APIs

Everything else should be owned by appkit.

---

## Current Inventory Snapshot

### letitrip counts (remaining local code)
- `src/components`: 52 files
- `src/hooks`: 17 files
- `src/repositories`: 32 files
- `src/db/schema`: 29 files
- `src/db/seed-data`: 21 files
- `src/helpers`: 9 files
- `src/features`: 375 files across 19 modules

### critical dependency debt (server-side)
- `src/actions`: 35 total files
- actions with local repository imports: 32
- actions with local db imports: 26

This means server-side ownership is still too local, so server migration must come before UI-only phases.

### recovered scope context from older tracker
- Older git-tracked version of this file contained `Total files to migrate/delete: ~370+ letitrip files`.
- Current tracker is shorter because it is dependency-first, not because UI backlog is small.
- Remaining local UI backlog is still significant and must be handled explicitly:
  - `src/components`: 52 files
  - `src/hooks`: 17 files

Execution rule:
- Do not treat “phase list is shorter” as “migration is nearly done”.
- Use file profiles below as source-of-truth batch inputs.

---

## Verified Legacy Phase Status (P01-P14)

Re-verified by file existence in letitrip.

| Phase | Legacy scope | Verified status |
|---|---|---|
| P01 | Core form + feedback | ✅ done (10/10 deleted) |
| P02 | UI primitives | ✅ done (10/10 deleted) |
| P03 | Infra components | ✅ done (10/10 deleted) |
| P04 | Media + filter UI | ✅ done (10/10 deleted) |
| P05 | Feature filters + product UI | ✅ done (10/10 deleted) |
| P06 | Layout shell part 1 | 🔄 7/10 done, 3 remaining |
| P07 | Layout shell part 2 + core hooks | 🔄 5/10 done, 5 remaining |
| P08 | Auth + media hooks | ✅ done for listed files (7/7) |
| P09 | Cart + checkout hooks | ✅ done (10/10 deleted) |
| P10 | Social + utility hooks | 🔄 5/10 done, 5 remaining |
| P11 | Remaining hooks | ⬜ 1/8 done, 7 remaining |
| P12 | Repositories quick wins | ⬜ 0/10 done |
| P13 | Repositories part 2 | ⬜ 0/10 done |
| P14 | Repositories part 3 | ⬜ 0/11 done |

Important correction:
- Legacy plan marked several areas complete before repository/server consolidation.
- Dependency order should be reversed: server-first, then hooks, then feature UI cleanup.

---

## Dependency-Ordered 10-File Batches

Source of truth from older tracker still applies:
- Everything reusable moves to appkit.
- Letitrip keeps thin shells, route wiring, app config, and market-specific drivers only.
- Work in fixed batches of exactly 10 files to keep migration deterministic and resumable.

Batch execution contract for every batch:
1. Build or merge generic implementation in appkit.
2. Update letitrip imports/callers to appkit.
3. Delete or reduce letitrip file to thin shell/delegation.
4. Run type-check before closing batch.

### Batch B01 (repos foundation, dependency root)
- `src/repositories/copilot-log.repository.ts`
- `src/repositories/newsletter.repository.ts`
- `src/repositories/base.repository.ts`
- `src/repositories/index.ts`
- `src/repositories/cart.repository.ts`
- `src/repositories/categories.repository.ts`
- `src/repositories/blog.repository.ts`
- `src/repositories/address.repository.ts`
- `src/repositories/order.repository.ts`
- `src/repositories/product.repository.ts`

### Batch B02 (repos business core)
- `src/repositories/review.repository.ts`
- `src/repositories/payout.repository.ts`
- `src/repositories/store.repository.ts`
- `src/repositories/store-address.repository.ts`
- `src/repositories/event.repository.ts`
- `src/repositories/eventEntry.repository.ts`
- `src/repositories/notification.repository.ts`
- `src/repositories/offer.repository.ts`
- `src/repositories/coupons.repository.ts`
- `src/repositories/wishlist.repository.ts`

### Batch B03 (repos long tail)
- `src/repositories/session.repository.ts`
- `src/repositories/token.repository.ts`
- `src/repositories/site-settings.repository.ts`
- `src/repositories/sms-counter.repository.ts`
- `src/repositories/unit-of-work.ts`
- `src/repositories/chat.repository.ts`
- `src/repositories/carousel.repository.ts`
- `src/repositories/faqs.repository.ts`
- `src/repositories/homepage-sections.repository.ts`
- `src/repositories/failed-checkout.repository.ts`

### Batch B04 (schema foundation)
- `src/db/schema/field-names.ts`
- `src/db/schema/index.ts`
- `src/db/schema/users.ts`
- `src/db/schema/tokens.ts`
- `src/db/schema/sessions.ts`
- `src/db/schema/site-settings.ts`
- `src/db/schema/sms-counters.ts`
- `src/db/schema/stores.ts`
- `src/db/schema/store-addresses.ts`
- `src/db/schema/newsletter-subscribers.ts`

### Batch B05 (schema entities part 1)
- `src/db/schema/addresses.ts`
- `src/db/schema/bids.ts`
- `src/db/schema/blog-posts.ts`
- `src/db/schema/carousel-slides.ts`
- `src/db/schema/cart.ts`
- `src/db/schema/categories.ts`
- `src/db/schema/chat.ts`
- `src/db/schema/copilot-logs.ts`
- `src/db/schema/coupons.ts`
- `src/db/schema/events.ts`

### Batch B06 (schema entities part 2 + tooling)
- `src/db/schema/failed-checkouts.ts`
- `src/db/schema/faqs.ts`
- `src/db/schema/homepage-sections.ts`
- `src/db/schema/notifications.ts`
- `src/db/schema/offers.ts`
- `src/db/schema/orders.ts`
- `src/db/schema/payouts.ts`
- `src/db/schema/products.ts`
- `src/db/schema/reviews.ts`
- `src/db/indices/merge-indices.ts`

### Batch B07 (seed data part 1)
- `src/db/seed-data/addresses-seed-data.ts`
- `src/db/seed-data/bids-seed-data.ts`
- `src/db/seed-data/blog-posts-seed-data.ts`
- `src/db/seed-data/carousel-slides-seed-data.ts`
- `src/db/seed-data/cart-seed-data.ts`
- `src/db/seed-data/categories-seed-data.ts`
- `src/db/seed-data/coupons-seed-data.ts`
- `src/db/seed-data/events-seed-data.ts`
- `src/db/seed-data/faq-seed-data.ts`
- `src/db/seed-data/homepage-sections-seed-data.ts`

### Batch B08 (seed data part 2)
- `src/db/seed-data/index.ts`
- `src/db/seed-data/notifications-seed-data.ts`
- `src/db/seed-data/orders-seed-data.ts`
- `src/db/seed-data/payouts-seed-data.ts`
- `src/db/seed-data/products-seed-data.ts`
- `src/db/seed-data/reviews-seed-data.ts`
- `src/db/seed-data/sessions-seed-data.ts`
- `src/db/seed-data/site-settings-seed-data.ts`
- `src/db/seed-data/store-addresses-seed-data.ts`
- `src/db/seed-data/stores-seed-data.ts`

### Batch B09 (seed close + helpers)
- `src/db/seed-data/users-seed-data.ts`
- `src/db/indices/tokens.index.json`
- `src/db/indices/users.index.json`
- `src/helpers/auth/auth.helper.ts`
- `src/helpers/auth/token.helper.ts`
- `src/helpers/logging/error-logger.ts`
- `src/helpers/logging/server-error-logger.ts`
- `src/helpers/validation/address.helper.ts`
- `src/helpers/index.ts`
- `src/helpers/auth/index.ts`

### Batch B10 (helpers + shared libs part 1)
- `src/helpers/logging/index.ts`
- `src/helpers/validation/index.ts`
- `src/lib/encryption.ts`
- `src/lib/pii.ts`
- `src/lib/email.ts`
- `src/lib/server-logger.ts`
- `src/lib/api/api-handler.ts`
- `src/lib/query/firebase-sieve.ts`
- `src/lib/query/index.ts`
- `src/lib/validation/schemas.ts`

### Batch B11 (shared libs part 2)
- `src/lib/consent-otp.ts`
- `src/lib/tokens.ts`
- `src/lib/firebase/auth-helpers.ts`
- `src/lib/firebase/realtime-db.ts`
- `src/lib/firebase/rtdb-paths.ts`
- `src/lib/media/finalize.ts`
- `src/lib/monitoring/analytics.ts`
- `src/lib/monitoring/index.ts`
- `src/constants/rbac.ts`
- `src/constants/messages.ts`

### Batch B12 (server actions: account + checkout)
- `src/actions/address.actions.ts`
- `src/actions/cart.actions.ts`
- `src/actions/coupon.actions.ts`
- `src/actions/order.actions.ts`
- `src/actions/checkout.actions.ts`
- `src/actions/refund.actions.ts`
- `src/actions/wishlist.actions.ts`
- `src/actions/store-address.actions.ts`
- `src/actions/store.actions.ts`
- `src/actions/profile.actions.ts`

### Batch B13 (server actions: catalog + content)
- `src/actions/category.actions.ts`
- `src/actions/product.actions.ts`
- `src/actions/blog.actions.ts`
- `src/actions/sections.actions.ts`
- `src/actions/faq.actions.ts`
- `src/actions/promotions.actions.ts`
- `src/actions/search.actions.ts`
- `src/actions/newsletter.actions.ts`
- `src/actions/notification.actions.ts`
- `src/actions/contact.actions.ts`

### Batch B14 (server actions: seller + events)
- `src/actions/bid.actions.ts`
- `src/actions/event.actions.ts`
- `src/actions/offer.actions.ts`
- `src/actions/seller-coupon.actions.ts`
- `src/actions/seller.actions.ts`
- `src/actions/realtime-token.actions.ts`
- `src/actions/chat.actions.ts`
- `src/actions/site-settings.actions.ts`
- `src/actions/carousel.actions.ts`
- `src/actions/demo-seed.actions.ts`

### Batch B15 (server actions: admin + hook bridges)
- `src/actions/admin.actions.ts`
- `src/actions/admin-coupon.actions.ts`
- `src/actions/admin-read.actions.ts`
- `src/actions/review.actions.ts`
- `src/actions/index.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useRBAC.ts`
- `src/hooks/useUrlTable.ts`
- `src/hooks/useUnsavedChanges.ts`
- `src/hooks/useContactSubmit.ts`

### Batch B16 (hooks finalization)
- `src/hooks/index.ts`
- `src/hooks/useBulkEvent.ts`
- `src/hooks/useChat.ts`
- `src/hooks/useHomepageSections.ts`
- `src/hooks/useProductReviews.ts`
- `src/hooks/useProfile.ts`
- `src/hooks/usePublicProfile.ts`
- `src/hooks/useRazorpay.ts`
- `src/hooks/useRelatedProducts.ts`
- `src/hooks/useSellerStorefront.ts`

### Batch B17 (hooks + layout + shared components)
- `src/hooks/useStoreAddressSelector.ts`
- `src/hooks/useWishlistToggle.ts`
- `src/components/layout/BottomNavbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/MainNavbar.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TitleBar.tsx`
- `src/components/ui/SideDrawer.tsx`
- `src/components/typography/TextLink.tsx`
- `src/components/modals/ConfirmDeleteModal.tsx`

### Batch B18 (component domain set 1)
- `src/components/modals/UnsavedChangesModal.tsx`
- `src/components/user/AddressCard.tsx`
- `src/components/user/AddressForm.tsx`
- `src/components/user/AddressSelectorCreate.tsx`
- `src/components/user/NotificationBell.tsx`
- `src/components/user/StoreAddressSelectorCreate.tsx`
- `src/components/categories/CategoryCard.tsx`
- `src/components/categories/CategoryForm.tsx`
- `src/components/categories/CategorySelectorCreate.tsx`
- `src/components/categories/CategoryTableColumns.tsx`

### Batch B19 (component domain set 2)
- `src/components/orders/OrderCard.tsx`
- `src/components/pre-orders/PreOrderCard.tsx`
- `src/components/admin/AdminFilterBar.tsx`
- `src/components/admin/AdminPageHeader.tsx`
- `src/components/admin/DrawerFormFooter.tsx`
- `src/components/utility/BackgroundRenderer.tsx`
- `src/components/utility/BackToTop.tsx`
- `src/components/utility/ResponsiveView.tsx`
- `src/components/utility/Search.tsx`
- `src/components/auctions/AuctionCard.tsx`

### Batch B20 (component barrels and structural cleanup)
- `src/components/auctions/AuctionGrid.tsx`
- `src/components/index.ts`
- `src/components/admin/index.ts`
- `src/components/auctions/index.ts`
- `src/components/auth/index.ts`
- `src/components/categories/index.ts`
- `src/components/filters/index.ts`
- `src/components/layout/index.ts`
- `src/components/media/index.ts`
- `src/components/orders/index.ts`

### Batch B21 (component barrels part 2)
- `src/components/pre-orders/index.ts`
- `src/components/products/index.ts`
- `src/components/products/Product.types.ts`
- `src/components/providers/index.ts`
- `src/components/providers/MonitoringProvider.tsx`
- `src/components/providers/QueryProvider.tsx`
- `src/components/stores/index.ts`
- `src/components/user/index.ts`
- `src/components/utility/index.ts`
- `src/components/ui/index.ts`

### Batch B22 (constants and utilities)
- `src/constants/address.ts`
- `src/constants/error-messages.ts`
- `src/constants/faq.ts`
- `src/constants/homepage-data.ts`
- `src/constants/success-messages.ts`
- `src/constants/theme.ts`
- `src/constants/ui-labels-admin.ts`
- `src/constants/ui-labels-core.ts`
- `src/utils/business-day.ts`
- `src/utils/guest-cart.ts`

### Batch B23 (final shared-vs-local classification)
- `src/components/media-modals.client.ts`
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/auth/RoleGate.tsx`
- `src/components/categories/Category.types.ts`
- `src/constants/ui.ts`
- `src/constants/api-endpoints.ts`
- `src/constants/config.ts`
- `src/constants/navigation.tsx`
- `src/constants/routes.ts`
- `src/constants/seo.ts`

### Batch B24 (local keep-list audit + features kickoff)
Keep local (app-specific or driver wiring):
- `src/constants/site.ts`
- `src/lib/integration-keys.ts`
- `src/lib/firebase/config.ts`
- `src/lib/firebase/client-config.ts`
- `src/lib/firebase/auth-server.ts`
- `src/lib/firebase/realtime.ts`
- `src/lib/firebase/storage.ts`
- `src/lib/payment/razorpay.ts`
- `src/lib/shiprocket/client.ts`
- `src/lib/pwa/runtime-caching.ts`

### Feature-module continuation after B24 (still mandatory)
Because old goal was ~370+ files, continue fixed 10-file sprints for `src/features` until empty.

Suggested sprint counts by feature folder (10 files per sprint):
- `about` (11 files): 2 sprints
- `admin` (102 files): 11 sprints
- `auth` (8 files): 1 sprint
- `blog` (5 files): 1 sprint
- `cart` (26 files): 3 sprints
- `categories` (7 files): 1 sprint
- `contact` (4 files): 1 sprint
- `copilot` (5 files): 1 sprint
- `events` (37 files): 4 sprints
- `faq` (4 files): 1 sprint
- `homepage` (28 files): 3 sprints
- `products` (24 files): 3 sprints
- `promotions` (5 files): 1 sprint
- `reviews` (5 files): 1 sprint
- `search` (4 files): 1 sprint
- `seller` (48 files): 5 sprints
- `stores` (12 files): 2 sprints
- `user` (36 files): 4 sprints
- `wishlist` (4 files): 1 sprint

Execution note:
- Always run feature sprints in dependency order: shared contracts/types -> repositories/server helpers -> hooks -> UI components/views -> index/barrels.

---

## Complexity-Based Delivery Buckets

Use this when planning weekly slices:

- Bucket S (small, low risk): constants/messages, minor hooks, small features
- Bucket M (medium): layout leftovers, medium feature modules, helper moves
- Bucket L (large): repository waves, schema/seed, actions/routes refactor
- Bucket XL (highest): seller/admin consolidation + final enforcement pass

Rule:
- Never schedule Bucket M/S UI work ahead of unresolved Bucket L/XL server dependencies.

---

## Immediate Next Execution Slice (Recommended)

1. Execute Batch B01 end-to-end and close it only after type-check is clean.
2. Execute Batch B02 immediately after B01, then update dependent action imports touched by those repositories.
3. Continue vertical dependency flow B03 -> B04 -> B05 -> B06 before any UI-heavy batches.
4. Complete one vertical path end-to-end inside each batch:
   - migrate repo to appkit
   - update dependent action(s)
   - update dependent api route(s)
   - delete local implementation

This keeps dependency order correct and preserves the older 370+ migration goal without skipping hidden backlog.
