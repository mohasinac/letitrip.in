# letitrip.in — App-Level Component / Constant / Action Index

> **Living document.** Update after every task that adds, renames, or removes an entry.
> **Before creating anything new** — check this file AND `appkit/index.md` first.
> Paths are relative to `d:\proj\letitrip.in\src\`.

## Index

- [Constants](#constants--srcconstants)
- [Server Actions](#server-actions--srcactions)
- [Routing / Shell Components](#routing--shell-components--srccomponentsrouting)
- [Auth Page Clients](#auth-page-clients--srccomponentsauth)
- [User Page Clients](#user-page-clients--srccomponentsuser)
- [Admin Page Clients](#admin-page-clients--srccomponentsadmin)
- [Homepage Components](#homepage-components--srccomponentshomepage)
- [Dev Tools](#dev-tools--srccomponentsdev)
- [Key Layout Files](#key-layout-files-not-components--do-not-duplicate)

---

## Constants — `src/constants/`

| Name / Export | File | What it does |
|--------------|------|-------------|
| `API_ROUTES` | `api.ts` | All API endpoint strings with ADMIN / STORE / USER sub-objects — use these everywhere, never hardcode `/api/...` strings |
| `ROUTES` | `routes.ts` | Re-export of `ROUTES` from appkit route-map (all page paths) |
| `ADMIN_NAV_GROUPS` | `navigation.tsx` | Admin sidebar nav group config (never define inline in layout) |
| `STORE_NAV_GROUPS` | `navigation.tsx` | Seller dashboard sidebar nav group config |
| `USER_NAV_GROUPS` | `navigation.tsx` | User account sidebar nav group config |
| `SIDEBAR_SUPPORT_LINKS` | `navigation.tsx` | Support links shown at bottom of all sidebars |
| `FOOTER_LINK_GROUPS` | `navigation.tsx` | Footer link column groups |
| `MAIN_NAV_ITEMS` | `navigation.tsx` | Top navbar items (public header navigation) |
| `BRAND`, `getBrandCopyright` | `brand.ts` | Brand identity strings (name, description, social URLs, copyright helper) |
| `FOOTER_TRUST_BAR_ITEMS`, `FOOTER_SOCIAL_LINKS`, `FOOTER_BOTTOM_LINKS` | `footer.tsx` | Footer static data — trust bar (5 items + SVG icons), social links, bottom utility links (sitemap/robots/security) |
| `SEARCH_LABELS` | `search.ts` | Search overlay label strings |
| `SEO_CONFIG`, `generatePageMeta`, `generateProductMeta`, `generateStoreMeta`, `generateCategoryMeta`, `generateBrandMeta`, `generateEventMeta` | `seo.server.ts` | Server-side SEO metadata generators for generateMetadata() |
| `FIELD_NAMES` | `field-names.ts` | Firestore field name constants (prevents typo bugs in queries) |
| `HOMEPAGE_DATA` | `homepage-data.ts` | Static homepage section fallback data |
| `FAQ_CATEGORIES` | `faq.ts` | FAQ category labels + slugs |
| `THEME_CONFIG` | `theme.ts` | App theme token defaults |
| `UI_CONFIG` | `ui.ts` | UI-level config (breakpoints, z-index, etc.) |
| `APP_CONFIG` | `config.ts` | App-wide runtime config (site name, domain, etc.) |
| `STORE_ORDERS_TABS`, `StoreOrdersTabId` | `dashboard-tabs.ts` | Order status filter tabs: all/pending/processing/shipped/delivered/cancelled/refunded/return_requested |
| `STORE_REVIEWS_TABS`, `StoreReviewsTabId` | `dashboard-tabs.ts` | Review status filter tabs: all/pending/replied/flagged |
| `STORE_REVIEWS_ROLE_TABS`, `StoreReviewsRoleTabId` | `dashboard-tabs.ts` | Role-perspective tabs for the store /reviews page: received/given_to_buyers/written_as_customer |
| `ADMIN_PRODUCTS_TABS`, `AdminProductsTabId` | `dashboard-tabs.ts` | Product listing type tabs: all/standard/auction/pre-order/prize-draw/bundle |
| `ADMIN_ORDERS_TABS`, `AdminOrdersTabId` | `dashboard-tabs.ts` | Alias of `STORE_ORDERS_TABS` for admin context |
| `ADMIN_USERS_TABS`, `AdminUsersTabId` | `dashboard-tabs.ts` | User status tabs: all/active/suspended |
| `ADMIN_STORES_TABS`, `AdminStoresTabId` | `dashboard-tabs.ts` | Store status tabs: all/active/pending/suspended |
| `ADMIN_EVENTS_TABS`, `AdminEventsTabId` | `dashboard-tabs.ts` | Event type tabs: all/sale/offer/poll/survey/feedback |
| `ADMIN_BLOG_TABS`, `AdminBlogTabId` | `dashboard-tabs.ts` | Blog status tabs: all/draft/published |
| `ADMIN_PAYOUTS_TABS`, `AdminPayoutsTabId` | `dashboard-tabs.ts` | Payout status tabs: all/pending/processing/paid/failed |
| `ADMIN_USER_DETAIL_TABS`, `AdminUserDetailTabId` | `dashboard-tabs.ts` | Area tabs on admin user detail page: overview/orders/store/reviews/sessions/bids/reports |
| `USER_ORDERS_TABS`, `UserOrdersTabId` | `dashboard-tabs.ts` | Alias of `STORE_ORDERS_TABS` for user context |
| `USER_PROFILE_TABS`, `UserProfileTabId` | `dashboard-tabs.ts` | User profile area tabs: overview/orders/wishlist/reviews/addresses/sessions |

---

## Server Actions — `src/actions/`

> Server actions are called from Server Components or via `"use server"` forms. Never import in `"use client"` components — use the equivalent hook from appkit instead.

| File | Key exports | What it does |
|------|------------|-------------|
| `product.actions.ts` | `getProducts`, `getProductById`, `getProductBySlug`, `getProfileStoreProducts`, `getStoreStorefrontProducts` | Fetch products from Firestore; `getProfileStoreProducts` + `getStoreStorefrontProducts` are store-scoped variants (renamed from `getSellerProducts`/`getSellerStorefrontProducts` in ARCH refactor) |
| `admin.actions.ts` | `getAdminStats`, `updateProductStatus` | Admin mutations |
| `admin-read.actions.ts` | `getAdminUsers`, `getAdminOrders`, `getAdminReviews` | Admin read-only fetches |
| `admin-coupon.actions.ts` | `getAdminCoupons`, `createCoupon`, `updateCoupon`, `deleteCoupon` | Admin coupon CRUD |
| `blog.actions.ts` | `getBlogPosts`, `getBlogPostBySlug`, `createBlogPost`, `updateBlogPost` | Blog CRUD |
| `carousel.actions.ts` | `getCarouselSlides`, `createSlide`, `updateSlide`, `deleteSlide` | Carousel CRUD |
| `category.actions.ts` | `getCategories`, `getCategoryBySlug`, `getCategoryTree` | Category reads |
| `cart.actions.ts` | `getCart`, `addToCart`, `removeFromCart`, `updateCartItem` | Cart mutations |
| `checkout.actions.ts` | `initiateCheckout`, `confirmOrder` | Checkout flow |
| `order.actions.ts` | `getOrders`, `getOrderById`, `updateOrderStatus` | Order reads + status |
| `address.actions.ts` | `getAddresses`, `createAddress`, `updateAddress`, `deleteAddress` | Address CRUD |
| `store.actions.ts` | `getStores`, `getStoreBySlug`, `createStore`, `updateStore` | Store reads/mutations |
| `store-address.actions.ts` | `getStoreAddresses`, `createStoreAddress` | Store pickup address CRUD |
| `seller.actions.ts` | `getSellerStore`, `updateSellerStorefront` | Seller-specific store mutations |
| `seller-coupon.actions.ts` | `getStoreCoupons`, `createSellerCoupon` | Seller coupon CRUD (`getStoreCoupons` was `getSellerCoupons` before ARCH refactor) |
| `review.actions.ts` | `getReviews`, `createReview`, `deleteReview` | Review CRUD |
| `bid.actions.ts` | `getBids`, `placeBid`, `cancelBid` | Bid mutations |
| `profile.actions.ts` | `getProfile`, `updateProfile` | User profile mutations |
| `wishlist.actions.ts` | `getWishlist`, `addToWishlist`, `removeFromWishlist` | Wishlist mutations |
| `faq.actions.ts` | `getFAQs`, `getFAQBySlug` | FAQ reads |
| `search.actions.ts` | `searchProducts`, `getNavSuggestions` | Search queries |
| `sections.actions.ts` | `getHomepageSections`, `updateSection`, `reorderSections` | Homepage section mutations |
| `notification.actions.ts` | `getNotifications`, `markNotificationRead` | Notification mutations |
| `offer.actions.ts` | `makeOffer`, `acceptOffer`, `rejectOffer` | Offer flow |
| `coupon.actions.ts` | `validateCoupon`, `applyCoupon` | Coupon validation |
| `promotions.actions.ts` | `getPromotions`, `getFeaturedDeals` | Promotion reads |
| `pre-order.actions.ts` | `getPreOrders`, `getPreOrderById` | Pre-order reads |
| `event.actions.ts` | `getEvents`, `getEventBySlug`, `registerForEvent` | Event reads + registration |
| `newsletter.actions.ts` | `subscribeNewsletter` | Newsletter subscribe |
| `contact.actions.ts` | `submitContactForm` | Contact form submit |
| `refund.actions.ts` | `requestRefund` | Refund request |
| `site-settings.actions.ts` | `getSiteSettings`, `updateSiteSettings` | Site settings reads/writes |
| `demo-seed.actions.ts` | `runSeed`, `clearSeed`, `getSeedStatus` | Seed data management (admin-only) |
| `realtime-token.actions.ts` | `getRealTimeToken` | Firebase RTDB auth token |
| `chat.actions.ts` | `getChatHistory`, `sendMessage` | Messaging |

---

## Routing / Shell Components — `src/components/routing/`

| Name | File | What it does |
|------|------|-------------|
| `CartRouteClient` | `routing/CartRouteClient.tsx` | Client-side cart drawer/page wrapper |
| `CheckoutRouteClient` | `routing/CheckoutRouteClient.tsx` | Checkout page client wrapper |
| `CheckoutSuccessRouteClient` | `routing/CheckoutSuccessRouteClient.tsx` | Post-checkout success client wrapper |
| `RoutePlaceholderView` | `routing/RoutePlaceholderView.tsx` | Placeholder for unbuilt pages |

---

## Auth Page Clients — `src/components/auth/`

| Name | File | What it does |
|------|------|-------------|
| `LoginPageClient` | `auth/LoginPageClient.tsx` | Login page client component |
| `RegisterPageClient` | `auth/RegisterPageClient.tsx` | Registration page client component |
| `ForgotPasswordPageClient` | `auth/ForgotPasswordPageClient.tsx` | Forgot password client |
| `ResetPasswordPageClient` | `auth/ResetPasswordPageClient.tsx` | Reset password client |
| `VerifyEmailPageClient` | `auth/VerifyEmailPageClient.tsx` | Email verification client |

---

## User Page Clients — `src/components/user/`

| Name | File | What it does |
|------|------|-------------|
| `UserAddressesClient` | `user/UserAddressesClient.tsx` | Addresses list — set-default + two-step delete confirm |
| `AddAddressClient` | `user/AddAddressClient.tsx` | Add address client wrapper |
| `EditAddressClient` | `user/EditAddressClient.tsx` | Edit address client wrapper |
| `ProfilePageClient` | `user/ProfilePageClient.tsx` | Profile page client wrapper |
| `FontToggleClient` | `user/FontToggleClient.tsx` | Font size toggle (accessibility) |

---

## Admin Page Clients — `src/components/admin/`

| Name | File | What it does |
|------|------|-------------|
| `AdminAnalyticsClient` | `admin/AdminAnalyticsClient.tsx` | Analytics page client wrapper |

## Admin API Routes — `src/app/api/admin/` (notable additions)

| Route file | Method | Purpose |
|-----------|--------|---------|
| `payouts/export/route.ts` | GET | CSV export of payouts — auth: admin/moderator; up to 1000 rows sorted by createdAt desc; columns: id, storeId, storeName, amount, status, transactionId, periodStart, periodEnd, createdAt |
| `event-entries/route.ts` | GET | All event entries — auth: admin/moderator; limit param; via eventEntryRepository.findAll (LL12) |
| `event-entries/[id]/route.ts` | PATCH | Update entry status (CONFIRMED/WAITLISTED/CANCELLED) — auth: admin/moderator (LL12) |
| `notifications/route.ts` | GET | All notifications — auth: admin/moderator; limit param; via notificationRepository.findAll (LL13) |
| `notifications/[id]/route.ts` | DELETE | Delete notification — auth: admin/moderator (LL13) |
| `notifications/[id]/resend/route.ts` | POST | Resend notification — marks isRead=false to simulate re-delivery (LL13) |
| `carts/route.ts` | GET | All carts — auth: admin/moderator; limit param; via cartRepository.findAll (LL14) |
| `wishlists/route.ts` | GET | Cross-user wishlist items — auth: admin/moderator; uses Firestore collectionGroup("wishlist") (subcollection, no cross-user repo method); userId extracted from ref path (LL15) |
| `newsletter/export/route.ts` | GET | CSV export of newsletter subscribers — auth: admin/moderator; newsletterRepository.list({pageSize:"10000"}); columns: id, email, status, source, subscribedAt, createdAt; Content-Disposition attachment (B6/VA14) |
| `feature-flags/route.ts` | GET | Get feature flags — auth: admin/moderator; reads siteSettings.featureFlags + featureFlagRollouts (VA17) |
| `feature-flags/route.ts` | PUT | Update feature flags — auth: admin; zod {flags, rollouts}; writes via siteSettingsRepository.updateSingleton (VA17) |
| `store-addresses/route.ts` | GET | All store addresses — auth: admin/moderator; optional storeId param → specific subcollection or collectionGroup("addresses"); returns id, storeId, label, city, state, pincode, isPickupLocation, createdAt (LL17) |
| `features/route.ts` | GET/POST | productFeatures admin CRUD (FI3) — GET filters by scope/storeId/isActive; POST admin-only zod-validated create |
| `features/[id]/route.ts` | GET/PUT/DELETE | productFeatures item — DELETE returns 409 when feature is referenced by any product (FI3) |
| `shipments/route.ts` | GET/POST | Feature A — list/create procurement shipments; 409 on duplicate `shipmentNumber` |
| `shipments/[id]/route.ts` | GET/PATCH/DELETE | Feature A — shipment header; DELETE 409s while any item is still linked |
| `shipments/[id]/lots/route.ts` | GET/POST | Feature A — list/create lots (≤10 per shipment) |
| `shipments/[id]/lots/[lotId]/route.ts` | GET/PATCH/DELETE | Feature A — single lot header + remainder fields |
| `shipments/[id]/lots/[lotId]/items/route.ts` | GET/POST | Feature A — paginated item list / single item create |
| `shipments/[id]/lots/[lotId]/items/bulk/route.ts` | POST | Feature A — bulk paste-import, ≤500 rows, single `WriteBatch` |
| `shipments/[id]/lots/[lotId]/items/[itemId]/route.ts` | PATCH/DELETE | Feature A — edit/delete/unlink a single item (`linkedProductId: null` clears the link) |
| `shipments/[id]/lots/[lotId]/items/[itemId]/link/route.ts` | POST | Feature A — link a main item to a new/existing pre-order product |
| `shipments/projections/route.ts` | GET | Feature A — real paginated `shipmentLots` query, sortable by profit/revenue/newest |
| `catalogue/route.ts` | GET | Feature B — admin approval queue (`listingStatus === "pending_admin_approval"`) |
| `catalogue/[id]/approve/route.ts` | POST | Feature B — creates the product under `store-letitrip-official` |
| `catalogue/[id]/reject/route.ts` | POST | Feature B — records a rejection reason |
| `orders/[id]/payment-verify/route.ts` | PATCH | Feature C — admin manual-payment verification; writes `order.paymentRecord` |
| `users/[uid]/hard-ban/route.ts` | POST | Enqueues the `hardBanCascade` job (2026-08-15) via `enqueueJob()` — returns `{jobId, customToken}` immediately; the 8-stage cascade now runs in the `onJobCreated` Firebase Function, not inline |
| `users/bulk/route.ts` | POST | Bulk suspend/restore/delete (2026-08-15) — `{action, ids}`, `BULK_MAX=50`, bounded `Promise.all`; suspend/delete both soft-disable only |
| `notifications/bulk/route.ts` | POST | Bulk mark-read/delete (2026-08-15) — same bounded `Promise.all` shape |
| `payouts/weekly/route.ts` | POST | Enqueues the `payoutsWeekly` job (2026-08-15) — was ~150 lines of inline duplicate-of-the-scheduled-Function logic, now a thin `enqueueJob()` call |
| `sessions/route.ts` | GET | Per-uid Firebase Auth enrichment fixed from a sequential `for` loop to `Promise.all` (2026-08-15 — Rule #6 N+1) |
| `tester-checklist-items/route.ts` | GET/POST | Tester QA checklist catalog list/create (2026-08-17) |
| `tester-checklist-items/[id]/route.ts` | GET/PUT/PATCH/DELETE | Tester checklist item CRUD (2026-08-17) |
| `tester-feedback/route.ts` | GET | Flat list of every tester's checklist responses (2026-08-17) |
| `tester-feedback/[id]/route.ts` | PATCH | Mark a tester response reviewed (2026-08-17) |
| `tester-feedback/report/route.ts` | GET | Coverage report — per-item yes/no counts + "no"-answer issues list (2026-08-17) |
| `tester-feedback/export/route.ts` | GET | Downloads `TesterChecklistResponseRepository.getMarkdownReport()` as a Markdown file (`Content-Disposition: attachment; filename="tester-feedback-report-<date>.md"`) — same content as `npm run tester:export-feedback`; wired to the "Download Report" button on `AdminTesterFeedbackView` (2026-08-17) |

---

## Tester QA Program Routes — `src/app/api/user/tester-checklist/` (2026-08-17)

| Route file | Method | Purpose |
|-----------|--------|---------|
| `route.ts` | GET | Active checklist items joined with the current tester's own responses (Tester Hub hydration); 403 if `user.isTester !== true` |
| `[checklistItemId]/route.ts` | PUT | Upserts `{ answer?, comment?, screenshotUrl? }` for the current tester + item — deterministic-ID upsert, the persistence mechanism behind reload-safe checklist state |

Pages: `/user/tester` (Tester Hub), `/admin/tester-checklist` (catalog CRUD), `/admin/tester-feedback` (Report/Issues/Submissions). All three are thin shims delegating to the `TesterHubView`/`AdminTesterChecklistView`/`AdminTesterFeedbackView` appkit exports — see `appkit/index.md`.

---

## Store (Seller) API Routes — `src/app/api/store/` (notable entries)

| Route file | Method | Purpose |
|-----------|--------|---------|
| `orders/[id]/route.ts` | GET/PATCH | Seller-scoped order detail + status/tracking update — uses `storeRepository.findByOwnerId(uid)` + `productRepository.findByStore(storeId)` for auth (ARCH refactor Session 81) |
| `payouts/route.ts` | GET | Seller payout list + stats — now filters by `storeId` (was `sellerId`); uses `findByStoreAndStatus` (ARCH refactor Session 81) |
| `offers/route.ts` | GET/POST | Seller offers — filters by `storeId`/`storeName` (was `sellerId`/`sellerName`) (ARCH refactor Session 81) |
| `coupons/route.ts` | GET/POST | Seller coupon list + create — scoped to store |
| `coupons/[id]/route.ts` | GET/PATCH/DELETE | Seller coupon detail + mutations — seller-scoped with admin override; enforces percentage ≤ 100 (CU refactor Session 78) |
| `orders/route.ts` | GET | Seller order list — scoped to store's products |
| `analytics/route.ts` | GET | Seller analytics — forwards date range to Firebase Function, now uses `storeId` |
| `products/route.ts` | GET/POST | Seller product list + create |
| `templates/route.ts` | GET/POST | Product template list (store-scoped) + create — (G1 S4) |
| `templates/[id]/route.ts` | GET/PUT/DELETE | Product template detail + mutations — seller-scoped (G1 S4) |
| `features/route.ts` | GET/POST | Seller productFeatures — GET returns `{ items, total, limit, isFull }`; POST forces `scope=store + storeId=owner's store`, 409 at 20-cap (FI4) |
| `features/[id]/route.ts` | GET/PUT/DELETE | Seller feature item — 403 when feature isn't owned by the authenticated seller's store (FI4) |
| `profile/route.ts` | PUT | Change store slug — validates format, checks availability, batch-migrates document ID (O1 S4) |
| `slug/check/route.ts` | GET | Check if a store slug is available — returns `{ available, reason }` (O1 S4) |
| `orders/[id]/route.ts` | PATCH | Feature C addition — `{ markCodCollected, codCollectionNote }` writes `paymentRecord` (method:"cod"); 400 if `paymentMethod !== "cod"` |

---

## User Catalogue API Routes — `src/app/api/user/catalogue/` (Feature B)

| Route file | Method | Purpose |
|-----------|--------|---------|
| `route.ts` | GET/POST | List own catalogue items / create (any authed user/seller/admin) |
| `[id]/route.ts` | GET/PATCH/DELETE | Single item CRUD, ownership-checked; PATCH re-stamps `lastImageUpdateAt` only when `images` is part of the patch |
| `[id]/list/route.ts` | POST | Direct list — seller → own store, admin → `store-letitrip-official` (no personal store) |
| `[id]/submit/route.ts` | POST | Buyer "Request to sell" — flips `listingStatus` to `pending_admin_approval` |

Public: `src/app/api/catalogue/[ownerSlug]/route.ts` — GET, `visibility:"public"` items only, no auth.

---

## Layout Components — `src/components/layout/`

| Name | File | What it does |
|------|------|-------------|
| `FooterNewsletterSlot` | `layout/FooterNewsletterSlot.tsx` | Footer newsletter subscribe form — calls POST /api/newsletter/subscribe with source "footer"; shows success state |

## Homepage Components — `src/components/homepage/`

| Name | File | What it does |
|------|------|-------------|
| `HomepageNewsletterForm` | `homepage/HomepageNewsletterForm.tsx` | Newsletter form for homepage section |
| `AdSlots` | `homepage/AdSlots.tsx` | Ad slot placeholders |
| `AdRuntimeInitializer` | `ads/AdRuntimeInitializer.tsx` | Initialises ad runtime on mount |

---

## Dev Tools — `src/components/dev/`

| Name | File | What it does |
|------|------|-------------|
| `SeedPanel` | `dev/SeedPanel.tsx` | Admin seed data management UI (feature-flag gated) |
| `DevToolbar` | `dev/DevToolbar.tsx` | Development toolbar (debug info, env indicator) |

---

## Key Layout Files (not components — do not duplicate)

| File | Role |
|------|------|
| `src/app/[locale]/LayoutShellClient.tsx` | Public layout shell — header + navbar + footer |
| `src/app/[locale]/admin/layout.tsx` | Admin area layout + sidebar nav |
| `src/app/[locale]/store/layout.tsx` | Seller dashboard layout + sidebar nav |
| `src/app/[locale]/user/layout.tsx` | User account layout + sidebar nav |
| `src/app/[locale]/user/returns/page.tsx` | Returns & refunds list — filters orders by `return_requested` status |
| `src/app/[locale]/user/orders/[id]/cancel/page.tsx` | Order cancel — reason form + `cancelOrderAction`; guards non-cancellable statuses |
| `src/app/[locale]/user/orders/[id]/invoice/page.tsx` | Invoice print view — renders order as printable invoice; "Print / Save as PDF" button; action bar hidden in print media |
| `src/app/[locale]/user/settings/page.tsx` | Settings page — Account/Privacy/Appearance tabs; email change (`useChangeEmail`), password change, data export, Contact Support link |
| `src/app/api/user/export/route.ts` | GET `/api/user/export` — auth required; returns profile + addresses + orders as `attachment` JSON file |
| `src/app/[locale]/demo/layout.tsx` | Demo/seed area layout (admin-protected) |
| `src/app/[locale]/store/templates/page.tsx` | Product templates list (SideDrawer create/edit) — templates for pre-filling new listings (G1 S4) |
| `src/app/[locale]/store/slug/page.tsx` | Store URL/slug management — current slug display, availability check, slug change with Firestore migration (O1 S4) |
