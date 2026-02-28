# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Development phases (Phases 1–67) completed between 2026-01-01 and 2026-02-28.

---

### HorizontalScroller — Generic Horizontal Scroll Container (2026-03-01)

#### Added

- `src/components/ui/HorizontalScroller.tsx` — generic `HorizontalScroller<T>` component with two layout modes:
  - **`rows=1` (default)** — single-row flex carousel with optional thin scrollbar below
  - **`rows>1`** — CSS `grid-auto-flow:column` multi-row grid scroller (items fill top→bottom per column), scrollbar below:
    ```
    <| col1r1  col2r1  col3r1  … |>
       col1r2  col2r2  col3r2
       col1r3  col2r3  col3r3
       ════scrollbar════
    ```
  - Height driven by item content — no hardcoded height
  - Auto-computed visible column count (`⌊containerWidth ÷ (itemWidth + gap)⌋`) when `count` omitted
  - Left / right arrow buttons paging by `count` columns; only shown when overflow exists
  - `ArrowLeft` / `ArrowRight` keyboard navigation (`enableKeyboard` prop, default `true`)
  - Circular seamless auto-scroll (single-row only) via tripled items array; position-reset debounced 350 ms after scroll settles
  - `showScrollbar` prop — shows `scrollbarThinX` horizontal scrollbar at bottom (default `false`)
  - `rows`, `pauseOnHover`, `showArrows`, `showScrollbar`, `enableKeyboard`, `itemWidth`, `gap`, `autoScrollInterval`, `keyExtractor`, `className`, `scrollerClassName` props
  - Exported as `HorizontalScroller` + `HorizontalScrollerProps` from `@/components/ui` and `@/components`

#### Changed

- `FeaturedProductsSection` — **mobile** (`md:hidden`): single-row circular `autoScroll` carousel; **desktop** (`hidden md:block`): `rows={3}` grid with `showScrollbar`, up to 30 products
- `FeaturedAuctionsSection` — same responsive split; `rows={3}` + `showScrollbar` on desktop
- `BlogCategoryTabs` — replaced `overflow-x-auto` flex div with `HorizontalScroller` (`autoScroll={false}`, `showScrollbar`, `gap={8}`)
- `SectionTabs` — desktop nav replaced with `HorizontalScroller` (`gap={0}`, `autoScroll={false}`, `showScrollbar`); arrows appear when tab list overflows

---

### Static FAQs + Newsletter Removal (2026-03-15)

#### Added

- `src/constants/faq-data.ts` — 102 static FAQ entries (`StaticFAQItem[]`) across 7 categories; exported helper functions `getStaticFaqsByCategory`, `getAllStaticFaqs`, `getStaticFaqCategoryCounts`
- `StaticFAQItem` type exported from `@/constants`

#### Changed

- `FAQSection` (homepage) — now reads from static constants (`getStaticFaqsByCategory`); shows **10 FAQs per category** (up from 6) with a "View All →" button that includes a `+N` count badge when more FAQs exist; no loading skeleton or API calls
- `FAQPageContent` — replaced `useAllFaqs()` API hook with direct `STATIC_FAQS` constant; removed `isLoading` skeleton; removed "newest" sort option (no `createdAt` on static data)
- `FAQAccordion` — type changed from `FAQDocument[]` to `StaticFAQItem[]`; `answer` field simplified to `string`
- `src/constants/index.ts` — exports `STATIC_FAQS`, `getStaticFaqsByCategory`, `getAllStaticFaqs`, `getStaticFaqCategoryCounts`, `StaticFAQItem`

#### Removed

- **Newsletter feature** entirely from the UI and all supporting layers:
  - Pages: `/admin/newsletter`, `/api/newsletter/subscribe`, `/api/admin/newsletter`, `/api/admin/newsletter/[id]`
  - Components: `NewsletterSection`, `AdminNewsletterView`, `NewsletterTableColumns`
  - Hooks: `useNewsletterSubscribe`, `useAdminNewsletter`, `usePublicFaqs`, `useAllFaqs`
  - Services: `newsletter.service.ts`
  - Repository: `newsletter.repository.ts`
  - Schema: `newsletter.ts`
  - Seed data: `scripts/seed-data/newsletter-seed-data.ts`
  - Admin nav tab for Newsletter removed from `AdminTabs`
  - `<NewsletterSection />` removed from homepage

---

### Firebase Cloud Functions — Scheduled Jobs + Firestore Triggers (2026-03-01)

#### Added

- **`functions/`** — new standalone Firebase Functions package (Node 20, TypeScript, 2nd-gen / Cloud Run).
- **`functions/src/config/firebase-admin.ts`** — shared Admin SDK init (no explicit credential; uses ADC in production).
- **`functions/src/config/constants.ts`** — centralised `SCHEDULES`, `REGION` (`asia-south1`), `BATCH_LIMIT`, business timeouts, and all Firestore collection names.
- **`functions/src/utils/logger.ts`** — `logInfo` / `logError` / `logWarn` wrappers over `firebase-functions/v2` logger.
- **`functions/src/utils/batchHelper.ts`** — `batchDelete` and `batchUpdate` utilities that auto-split operations at the 400-doc limit.

**Scheduled jobs** (all 2nd-gen `onSchedule`, `asia-south1` region):

| Export                  | Schedule         | What it does                                                                                   |
| ----------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `auctionSettlement`     | every 5 min      | Settles expired auctions — marks bids `won`/`lost`, creates winner Order, pushes notifications |
| `pendingOrderTimeout`   | every 60 min     | Cancels orders unpaid for > 24 h, sends `order_cancelled` notification                         |
| `couponExpiry`          | 00:05 UTC daily  | Deactivates coupons whose `validity.endDate` has passed                                        |
| `expiredTokenCleanup`   | 03:00 UTC daily  | Deletes expired email-verification and password-reset tokens                                   |
| `expiredSessionCleanup` | 02:00 UTC daily  | Deletes expired session documents                                                              |
| `payoutBatch`           | 06:00 UTC daily  | Sweeps pending payouts → Razorpay Payouts API; retries up to 3× then marks `failed`            |
| `productStatsSync`      | 01:00 UTC daily  | Recomputes `avgRating` + `reviewCount` on all published products from approved reviews         |
| `cartPrune`             | Sunday 04:00 UTC | Deletes carts idle for > 30 days                                                               |
| `notificationPrune`     | Monday 01:00 UTC | Deletes read notifications older than 90 days                                                  |

**Firestore triggers**:

| Export                | Trigger                     | What it does                                                                                                                  |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `onBidPlaced`         | `bids/{bidId}` onCreate     | Demotes previous winner to `outbid`, updates product `currentBid`/`bidCount`, sends Firestore notification + Realtime DB push |
| `onOrderStatusChange` | `orders/{orderId}` onUpdate | On status change: writes typed notification, Realtime DB push, and transactional Resend email (confirmed/shipped/delivered)   |

- **`functions/src/index.ts`** — entry point exporting all 11 functions.
- **`functions/package.json`** — dependencies: `firebase-admin ^13`, `firebase-functions ^6`.
- **`functions/tsconfig.json`** — targets `es2020`, `commonjs`, strict mode.
- **`functions/.env.example`** — documents required secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_ACCOUNT_NUMBER`, `RESEND_API_KEY`.
- **`functions/.gitignore`** — excludes `lib/`, `node_modules/`, `.env`.
- **`firebase.json`** — added `functions` codebase config and `emulators.functions` (port 5001).
- **`scripts/deploy-functions.ps1`** — PowerShell script to `npm ci` + `tsc` + `firebase deploy --only functions`; supports `-FunctionName` for single-function deploys and `-OnlyBuild` for dry runs.

#### Notes

- All jobs use the `batchDelete` / `batchUpdate` helpers to stay under the 500-op Firestore batch ceiling.
- `payoutBatch` calls Razorpay via native `fetch`; credentials must be set as Firebase Secrets before deploying.
- `onOrderStatusChange` sends Resend emails only for `confirmed`, `shipped`, and `delivered` transitions; credentials are environment-injected.
- `onBidPlaced` writes to `auction_bids/{productId}` in Realtime DB for live auction UI updates.

---

### Bug Fixes — AdvertisementBanner null guard + Missing Firestore indexes (2026-03-01)

#### Fixed

- **`src/components/homepage/AdvertisementBanner.tsx`** — added `!banner.content` to the early-return guard. The component crashed with `TypeError: can't access property "title", banner.content is undefined` when a homepage section document existed but its `config.content` field was absent.
- **`firestore.indexes.json`** — added three composite indexes that were missing and causing `FAILED_PRECONDITION` (HTTP 500) on the homepage:
  - `products`: `isAuction ASC` + `createdAt DESC` — required by `/api/products?isAuction=true&...&sorts=-createdAt`
  - `categories`: `isActive ASC` + `tier ASC` + `order ASC` — required by `CategoriesRepository.buildTree`
  - `blogPosts`: `isFeatured ASC` + `status ASC` + `publishedAt DESC` — required by `BlogRepository.listPublished` with `?featured=true&sorts=-publishedAt`
- Indexes deployed to Firebase (`firebase deploy --only firestore:indexes`).

---

### Firebase Functions — Coding Rules Compliance Refactor (2026-03-01)

#### Changed

- **`functions/src/lib/errors.ts`** _(new)_ — Typed error classes mirroring the main app's `src/lib/errors/`: `FnError` (base), `ConfigurationError`, `NotFoundError`, `IntegrationError` (with `service` + `statusCode` fields), `DatabaseError`, `ValidationError`. No raw `throw new Error()` anywhere in the functions package.
- **`functions/src/constants/messages.ts`** _(new)_ — All notification titles, message templates, email subjects, and system error strings as typed constants (`AUCTION_MESSAGES`, `BID_MESSAGES`, `ORDER_MESSAGES`, `EMAIL_SUBJECTS`, `FN_ERROR_MESSAGES`). Eliminates all hardcoded strings from jobs and triggers (RULE 3).
- **`functions/src/repositories/`** _(new — 10 files + barrel)_ — Repository pattern for all Firestore access (RULE 12). Jobs and triggers never call `db.collection()` directly.

| Repository               | Key methods                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `productRepository`      | `getExpiredAuctions`, `getPublishedIds`, `updateStats`, `incrementBidCount`, `updateStatus` |
| `bidRepository`          | `getActiveByProduct`, `getWinningBid`, `markWon/Lost/Outbid/Winning`                        |
| `orderRepository`        | `getTimedOutPending`, `cancelInBatch`, `createFromAuction`                                  |
| `sessionRepository`      | `getExpiredRefs`                                                                            |
| `tokenRepository`        | `getExpiredEmailVerificationRefs`, `getExpiredPasswordResetRefs`                            |
| `couponRepository`       | `getExpiredActiveRefs`, `deactivateInBatch`                                                 |
| `cartRepository`         | `getStaleRefs`                                                                              |
| `payoutRepository`       | `getPending`, `markProcessing`, `recordSuccess`, `recordFailure`                            |
| `notificationRepository` | `getOldReadRefs`, `createInBatch`, `create`                                                 |
| `reviewRepository`       | `getApprovedRatingAggregate`                                                                |

- **All 9 job files** — Replaced `db.collection(COLLECTIONS.*)` queries with repository calls; replaced `throw new Error(...)` with typed error classes; replaced hardcoded notification strings with `ORDER_MESSAGES.*` / `AUCTION_MESSAGES.*` constants.
- **`functions/src/triggers/onBidPlaced.ts`** — Replaced direct Firestore reads/writes with `bidRepository`, `productRepository`, `notificationRepository`; replaced hardcoded notification title/message with `BID_MESSAGES.*`.
- **`functions/src/triggers/onOrderStatusChange.ts`** — Replaced `STATUS_CONFIG` hardcoded strings with `ORDER_MESSAGES.*`; replaced `subjectMap` with `EMAIL_SUBJECTS.*`; replaced Resend error throw with `IntegrationError`; replaced direct Firestore notification write with `notificationRepository.create()`.

#### Build verification

- `npx tsc --noEmit` → **0 errors**
- `npm run build` → **exit 0**

---

### Seed Data Expansion — blogPosts, events, eventEntries, notifications, payouts (2026-02-28)

#### Added

- **`scripts/seed-data/blog-posts-seed-data.ts`** — 8 blog posts (6 published, 1 draft, 1 archived) spanning all `BlogPostCategory` values (`guides`, `tips`, `news`, `updates`, `community`). Two posts marked `isFeatured: true`.
- **`scripts/seed-data/events-seed-data.ts`** — 5 events covering every `EventType` (`sale`, `offer`, `poll`, `survey`, `feedback`) with appropriate `saleConfig` / `offerConfig` / `pollConfig` / `surveyConfig` / `feedbackConfig` blocks. 8 event entries (`EventEntryDocument`) exercising all `EntryReviewStatus` values including one flagged entry.
- **`scripts/seed-data/notifications-seed-data.ts`** — 16 in-app notifications distributed across 5 users, covering all 15 `NotificationType` values (`welcome`, `order_placed`, `order_shipped`, `order_delivered`, `order_confirmed`, `bid_placed`, `bid_outbid`, `bid_won`, `bid_lost`, `review_approved`, `product_available`, `promotion`, `system`). Mix of read and unread.
- **`scripts/seed-data/payouts-seed-data.ts`** — 7 payout records across 4 sellers, covering all 4 `PayoutStatus` values (`pending`, `processing`, `completed`, `failed`). Includes both `bank_transfer` and `upi` payment methods with masked bank details.
- **`coupon-HOLI15`** added to `scripts/seed-data/coupons-seed-data.ts` — required FK for `event-holi-offer-2026-offer.offerConfig.couponId`.

#### Changed

- **`scripts/seed-data/index.ts`** — Added exports for `blogPostsSeedData`, `eventsSeedData`, `eventEntriesSeedData`, `notificationsSeedData`, `payoutsSeedData`.
- **`scripts/seed-all-data.ts`** — Added imports for all 5 new data arrays and 5 new collection constants (`BLOG_POSTS_COLLECTION`, `EVENTS_COLLECTION`, `EVENT_ENTRIES_COLLECTION`, `NOTIFICATIONS_COLLECTION`, `PAYOUT_COLLECTION`). Added seeding blocks for each collection. Updated `allCollections` array.
- **`scripts/seed-data/RELATIONSHIPS.md`** — Updated statistics summary; added FK consistency tables and seeding order for all new collections.

---

### TASK-46 — Wire BlogArticlesSection to live API; hide when no featured posts (2026-02-28)

#### Changed

- **`src/components/homepage/BlogArticlesSection.tsx`** — Replaced hardcoded `MOCK_BLOG_ARTICLES` with `useApiQuery` + `blogService.getFeatured(4)`. Section now renders only when the API returns ≥ 1 featured post (`isFeatured: true`) and stays hidden while loading or when the result is empty. Field references updated: `thumbnail` → `coverImage`, `readTime` → `readTimeMinutes` to match `BlogPostDocument`.
- **`src/services/blog.service.ts`** — Added `getFeatured(count?: number)` — calls `GET /api/blog?featured=true&pageSize={count}&sorts=-publishedAt`.
- **`src/components/homepage/__tests__/BlogArticlesSection.test.tsx`** — Rewritten to mock `useApiQuery`; covers loading (returns null), empty (returns null), data-present, image fallback, and accessibility cases.
- **`src/services/__tests__/blog.service.test.ts`** — Added two test cases for `getFeatured()` (default count and custom count).

#### Removed

- **`src/constants/homepage-data.ts`** — Deleted `BlogArticle` interface and `MOCK_BLOG_ARTICLES` constant — no callers remain now that the component uses the live API.
- **`src/constants/index.ts`** — Removed `MOCK_BLOG_ARTICLES` and `BlogArticle` type re-exports.

---

### TASK-45 — Comprehensive Sieve compliance & schema field constant audit (2026-03-01)

#### Fixed

- **`src/repositories/faqs.repository.ts`** — `SIEVE_FIELDS` key `helpful` corrected to `"stats.helpful"` with `path: FAQ_FIELDS.STAT.HELPFUL` so the nested field resolves correctly in Firestore queries.
- **`src/services/faq.service.ts`** — `listPublic` Sieve filter changed from `published==true` (non-existent field) to `isActive==true`.
- **`src/hooks/usePublicFaqs.ts`** — `useAllFaqs` query fixed from `faqService.list("isActive=true")` (invalid raw param) to `faqService.list("filters=isActive==true&sorts=-priority,order")` (correct Sieve DSL).
- **`src/app/api/categories/route.ts`** — `parentId` branch: replaced `findAll().filter(...)` with `getChildren(parentId)` (Firestore-native). Default path no longer double-loads the collection; tree branch uses `tree.length` for result meta.
- **`src/repositories/categories.repository.ts`** — `getCategoryBySlug()` hardcoded `"slug"` → `CATEGORY_FIELDS.SLUG`. `buildTree()` default path replaced `findAll()` with a targeted Firestore query (`IS_ACTIVE==true`, ordered by `TIER` + `ORDER`). Added `SIEVE_FIELDS` + `list(SieveModel)` for admin flat listing.
- **`src/repositories/carousel.repository.ts`** — Added `SIEVE_FIELDS` + `list(SieveModel)` for admin paginated listing.
- **`src/app/api/carousel/route.ts`** — Admin path `findAll()` replaced with `(await carouselRepository.list({sorts:"order", page:"1", pageSize:"100"})).items`.
- **`src/app/api/homepage-sections/route.ts`** — `findAll().filter(s => s.enabled)` replaced with `getEnabledSections()` (Firestore-native).
- **`src/app/api/faqs/route.ts`** — POST handler's `findAll()` used to compute `maxOrder` replaced with a single-document Sieve query `{sorts:"-order", page:"1", pageSize:"1"}`.
- **`src/app/api/admin/coupons/route.ts`** — `page` / `pageSize` (numbers from `getNumberParam`) wrapped with `String()` before passing to `couponsRepository.list()` to satisfy `SieveModel` string types.
- **`src/repositories/session.repository.ts`** — Four hardcoded Firestore field strings (`"userId"`, `"lastActivity"`, `"expiresAt"`) replaced with `SESSION_FIELDS.*` constants. Added `SIEVE_FIELDS` + `list(SieveModel)` + `listForUser(userId, SieveModel)`.
- **`src/repositories/coupons.repository.ts`** — `getActiveCoupons()` and `getCouponsExpiringSoon()` replaced in-memory date filtering with Firestore-native range queries on `COUPON_FIELDS.VALIDITY_FIELDS.IS_ACTIVE` + `VALIDITY_FIELDS.END_DATE`. Relies on existing composite index in `firestore.indexes.json`.
- **`src/repositories/newsletter.repository.ts`** — `getStats()` replaced full-collection scan with `count()` aggregations (parallel) + `.select(NEWSLETTER_FIELDS.SOURCE)` scoped to active subscribers for source breakdown.
- **`src/repositories/homepage-sections.repository.ts`** — Added `HOMEPAGE_SECTION_FIELDS` import, `SIEVE_FIELDS`, and `list(SieveModel)` method.
- **`src/repositories/notification.repository.ts`** — Added `SIEVE_FIELDS`, `list(SieveModel)`, and `listForUser(userId, SieveModel)` methods.

#### Removed

- **`src/repositories/blog.repository.ts`** — Deleted legacy `findPublished()` (in-memory pagination), `findAllPublished()`, and `findAll()` methods — all superseded by the existing Sieve-based `listPublished()` and `listAll()`. No external callers existed.
- **`src/repositories/product.repository.ts`** — Deleted unused `findPublished()` shorthand — no callers; superseded by `list(SieveModel)`.

---

### TASK-44 — Migrate cart and checkout components from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/cart/CartItemList.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")`; empty state text and "Start Shopping" link now use `t()`.
- **`src/components/cart/CartItemRow.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")`; remove button label now uses `t("remove")`.
- **`src/components/cart/CartSummary.tsx`** — Replaced `UI_LABELS` with `useTranslations("cart")` + `useTranslations("loading")`; all 12 label refs (order summary, subtotal, item count, discount, shipping, tax, total, loading, checkout, continue shopping) use `t()`.
- **`src/components/checkout/CheckoutAddressStep.tsx`** — Replaced `UI_LABELS` with `useTranslations("checkout")`; select-address heading, no-addresses, and add-address labels use `t()`.
- **`src/components/checkout/CheckoutOrderReview.tsx`** — Replaced `UI_LABELS` with `useTranslations("checkout")` + `useTranslations("cart")`; shipping address, order items, payment method, and total labels use `t()`.
- **`src/components/checkout/OrderSuccessActions.tsx`** — Added `"use client"` directive (was server component); removed module-level `const LABELS = UI_LABELS.ORDER_SUCCESS_PAGE`; replaced with `useTranslations("orderSuccess")` + `useTranslations("orders")`.
- **`messages/en.json`** — Added 5 keys to `cart` namespace: `startShopping`, `itemsSubtotal`, `discount`, `shippingCalculated`, `taxCalculated`.
- **`messages/en.json`** — Added 5 keys to `checkout` namespace: `noAddresses`, `shippingTo`, `changeAddress`, `orderItems`, `paymentOnDelivery`.
- **`messages/hi.json`** — Same 10 keys added with Hindi translations.

#### Tests

- **`src/components/cart/__tests__/CartItemList.test.tsx`** — New; 3 tests covering empty state, items list, and conditional empty-state rendering.
- **`src/components/cart/__tests__/CartItemRow.test.tsx`** — New; 3 tests covering product title, remove label, and updating opacity.
- **`src/components/cart/__tests__/CartSummary.test.tsx`** — New; 8 tests covering order summary heading, total, checkout/continue-shopping buttons, loading state, discount row, click handler, disabled state.
- **`src/components/checkout/__tests__/CheckoutAddressStep.test.tsx`** — New; 5 tests covering heading, no-addresses state, add-address button (empty and non-empty), and address rendering.
- **`src/components/checkout/__tests__/CheckoutOrderReview.test.tsx`** — New; 7 tests covering shipping label, change-address, order items heading, quantity label, payment method, cod text, and total.
- **`src/components/checkout/__tests__/OrderSuccessActions.test.tsx`** — New; 4 tests covering view-order, continue-shopping, orders title, and link rendering.

---

### TASK-43 — Migrate 7 product display components from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/products/ProductCard.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; `featured`, `auction`, `promoted`, `sold`, `outOfStock` badges now use `t()`.
- **`src/components/products/ProductFilters.tsx`** — Replaced `UI_LABELS` + `UI_PLACEHOLDERS` with `useTranslations("products")`; all filter labels and placeholders now use `t()`.
- **`src/components/products/ProductGrid.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; empty-state messages now use `t()`.
- **`src/components/products/ProductSortBar.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; moved module-level `SORT_OPTIONS` array inside component function body; sort options and count text use `t()`.
- **`src/components/products/ProductInfo.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")` + `useTranslations("loading")`; all 20 label references replaced.
- **`src/components/products/ProductReviews.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")` + `useTranslations("actions")`; reviews heading, empty state, verified badge, helpful count, and pagination buttons use `t()`.
- **`src/components/products/RelatedProducts.tsx`** — Replaced `UI_LABELS` with `useTranslations("products")`; section title uses `t("relatedTitle")`.
- **`messages/en.json`** — Added 31 new keys to `products` namespace: `featured`, `auction`, `promoted`, `filters`, `clearFilters`, `filterCategory`, `filterAllCategories`, `filterPriceRange`, `filterMinPrice`, `filterMaxPrice`, `showing`, `sortBy`, `sortNewest`, `sortOldest`, `sortPriceLow`, `sortPriceHigh`, `sortNameAZ`, `sortNameZA`, `currentBid`, `startingBid`, `totalBids`, `auctionEnds`, `availableStock`, `placeBid`, `reviewsTitle`, `reviewsNone`, `reviewsBeFirst`, `verifiedPurchase`, `helpful`, `relatedTitle`, `features`, `shipping`, `returnPolicy`.
- **`messages/hi.json`** — Same 31 keys added with Hindi translations.

#### Tests

- **`src/components/products/__tests__/ProductCard.test.tsx`** — New; 6 tests covering badge rendering for featured, auction, promoted, sold, outOfStock.
- **`src/components/products/__tests__/ProductFilters.test.tsx`** — New; 5 tests covering filter labels and conditional clearFilters button.
- **`src/components/products/__tests__/ProductGrid.test.tsx`** — New; 3 tests covering product rendering, empty state, loading skeletons.
- **`src/components/products/__tests__/ProductSortBar.test.tsx`** — New; 4 tests covering sort label, count display, and sort dropdown.
- **`src/components/products/__tests__/ProductInfo.test.tsx`** — New; 8 tests covering product title, badges, description, action button, sold/outOfStock states.
- **`src/components/products/__tests__/ProductReviews.test.tsx`** — New; 7 tests covering empty state, review rendering, verified badge, helpful count, loading skeletons, pagination.
- **`src/components/products/__tests__/RelatedProducts.test.tsx`** — New; 3 tests covering heading rendering, loading skeletons, empty state.

---

### TASK-42 — Migrate `DrawerFormFooter.tsx` default prop values from `UI_LABELS` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/admin/DrawerFormFooter.tsx`** — Removed `UI_LABELS` import; added `useTranslations("actions")` and `useTranslations("loading")`; changed default prop values (`submitLabel`, `deleteLabel`, `cancelLabel`) from `UI_LABELS.ACTIONS.*` constants to `undefined`; resolved defaults inside function body via `submitLabel ?? t("save")` etc.; replaced `UI_LABELS.LOADING.SAVING` in JSX with `tLoading("saving")`.

#### Tests

- **`src/components/admin/__tests__/DrawerFormFooter.test.tsx`** — Rewritten; removed `UI_LABELS` import; added `next-intl` mock; 5 tests covering default translation keys, custom label props, loading state, callback handlers, and conditional delete button.

---

### TASK-41 — Convert 5 admin table column files from `UI_LABELS` to `useTranslations` hooks (2026-02-28)

#### Changed

- **`src/components/admin/products/ProductTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminProducts")` + `useTranslations("actions")`; renamed `getProductTableColumns` → `useProductTableColumns`; replaced all `LABELS.*` + `UI_LABELS.ACTIONS.*` with translation keys.
- **`src/components/admin/orders/OrderTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminOrders")` + `useTranslations("actions")`; renamed `getOrderTableColumns` → `useOrderTableColumns`; replaced hardcoded column headers (`"Order ID"`, `"Product"`, `"Customer"`, `"Amount"`, `"Status"`, `"Payment"`) with `t()` calls.
- **`src/components/admin/bids/BidTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminBids")` + `useTranslations("actions")`; renamed `getBidTableColumns` → `useBidTableColumns`; replaced all `LABELS.*` references.
- **`src/components/admin/users/UserTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminUsers")` + `useTranslations("actions")`; renamed `getUserTableColumns` → `useUserTableColumns`; replaced `UI_LABELS.TABLE.*`, `UI_LABELS.FORM.*`, `UI_LABELS.STATUS.*`, `UI_LABELS.ADMIN.USERS.*` with translation keys; added `colName`, `colEmail`, `colRole`, `colStatus`, `colJoined`, `colLastLogin`, `emailNotVerified`, `never` keys.
- **`src/components/admin/sections/SectionTableColumns.tsx`** — Added `"use client"` + `useTranslations("adminSections")` + `useTranslations("actions")`; renamed `getSectionTableColumns` → `useSectionTableColumns`; replaced hardcoded `"Order"`, `"Title"`, `UI_LABELS.TABLE.STATUS`, `UI_LABELS.STATUS.ACTIVE/INACTIVE` with translation keys; renamed loop var `t` → `st` to avoid shadowing.
- **`src/components/admin/products/index.ts`**, **`src/components/admin/orders/index.ts`**, **`src/components/admin/bids/index.ts`**, **`src/components/admin/users/index.ts`**, **`src/components/admin/sections/index.ts`**, **`src/components/admin/index.ts`** — Updated barrel exports for all renamed hook functions.
- **`src/features/admin/components/AdminProductsView.tsx`**, **`AdminOrdersView.tsx`**, **`AdminBidsView.tsx`**, **`AdminUsersView.tsx`**, **`AdminSectionsView.tsx`** — Updated imports and call sites from `getX` → `useX`.
- **`src/features/seller/components/SellerProductsView.tsx`**, **`SellerOrdersView.tsx`** — Updated to `useProductTableColumns` / `useOrderTableColumns`; removed `useMemo` wrappers (hooks cannot be called inside `useMemo`).
- **`messages/en.json`** — Added `colOrderId`, `colProduct`, `colCustomer`, `colAmount`, `colStatus`, `colPayment`, `colDetails` to `adminOrders`; `status` to `adminBids`; `colName`, `colEmail`, `colRole`, `colStatus`, `colJoined`, `colLastLogin`, `emailNotVerified`, `never` to `adminUsers`; `colStatus`, `statusActive`, `statusInactive`, `colOrder`, `colTitle` to `adminSections`.
- **`messages/hi.json`** — Added matching Hindi translations for all new keys.
- **`docs/APPLICATION_GRAPH.md`** — Updated component references from `ProductTableColumns` → `useProductTableColumns`, `OrderTableColumns` → `useOrderTableColumns`, `SectionTableColumns` → `useSectionTableColumns`.

#### Tests

- **`src/components/admin/products/__tests__/ProductTableColumns.test.tsx`** — Created; 3 tests for hook structure and action callbacks.
- **`src/components/admin/orders/__tests__/OrderTableColumns.test.tsx`** — Created; 2 tests for hook structure and view callback.
- **`src/components/admin/bids/__tests__/BidTableColumns.test.tsx`** — Created; 2 tests for hook structure and view callback.
- **`src/components/admin/users/__tests__/UserTableColumns.test.tsx`** — Created; 4 tests for hook structure, ban and unban callbacks.
- **`src/components/admin/sections/__tests__/SectionTableColumns.test.tsx`** — Rewritten for hook pattern; 3 tests for structure and action callbacks.
- 14 view/page test mock files updated to reference `useX` hook names instead of `getX` function names.

---

### TASK-40 — Migrate `SectionForm.tsx` to `useTranslations` + `Checkbox` component (2026-02-28)

#### Changed

- **`src/components/admin/sections/SectionForm.tsx`** — Added `"use client"` + `useTranslations("adminSections")`; replaced `const LABELS = UI_LABELS.ADMIN.SECTIONS` and all `LABELS.*` references with `t()` calls; replaced `UI_LABELS.ADMIN.CATEGORIES.ENABLED` with `t("enabled")`; replaced hardcoded `"Title"`, `"Description"`, `"Order"`, `"Enter section description..."` with translation keys; replaced raw `<input type="checkbox">` block with `<Checkbox>` component from `@/components`; removed `UI_LABELS` import.
- **`messages/en.json`** — Added `sectionType`, `title`, `description`, `order`, `enabled`, `descriptionPlaceholder`, `configuration` keys to `adminSections` namespace.
- **`messages/hi.json`** — Added matching Hindi translations for new `adminSections` keys.

#### Tests

- **`src/components/admin/sections/__tests__/SectionForm.test.tsx`** — Updated to use `next-intl` mock (`useTranslations: () => (key) => key`); updated assertions to use translation key strings instead of `UI_LABELS` values; all 4 tests pass.

---

### TASK-39 — Migrate admin dashboard components to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/admin/dashboard/QuickActionsGrid.tsx`** — Removed `UI_LABELS` import; added `useTranslations('adminDashboard')`; moved `QUICK_ACTIONS` array inside component function so `t()` is accessible; replaced 4 hardcoded strings (`quickActions`, `manageUsers`, `reviewDisabled`, `manageContent`).
- **`src/components/admin/dashboard/RecentActivityCard.tsx`** — Added `"use client"` directive; added `useTranslations('adminDashboard')`; replaced 5 hardcoded strings (`recentActivity`, `newUsers`, `newUsersRegistered` with ICU plural, `systemStatus`, `allSystemsOperational`).
- **`src/components/admin/AdminStatsCards.tsx`** — Added `"use client"` directive; removed `UI_LABELS` import; added `useTranslations('adminStats')`; moved `STAT_CARDS` array builder inside component; replaced 6 stat-card labels (`totalUsers`, `activeUsers`, `newUsers`, `disabledUsers`, `totalProducts`, `totalOrders`).
- **`messages/en.json`** — Added `adminDashboard` namespace (9 keys: `quickActions`, `manageUsers`, `reviewDisabled`, `manageContent`, `recentActivity`, `newUsers`, `newUsersRegistered`, `systemStatus`, `allSystemsOperational`) and `adminStats` namespace (6 keys: `totalUsers`, `activeUsers`, `newUsers`, `disabledUsers`, `totalProducts`, `totalOrders`).
- **`messages/hi.json`** — Added matching Hindi translations for `adminDashboard` and `adminStats` namespaces.

#### Tests

- **`src/components/admin/dashboard/__tests__/QuickActionsGrid.test.tsx`** — Created; 5 tests covering renders, quick-action links, and heading.
- **`src/components/admin/dashboard/__tests__/RecentActivityCard.test.tsx`** — Created; 6 tests covering stats display, activity section, and system status.
- **`src/components/admin/__tests__/AdminStatsCards.test.tsx`** — Updated to use next-intl mock and translation key assertions (removed `UI_LABELS` references).

---

### TASK-38 — Add missing `coupons: type+createdAt` Firestore composite index (2026-02-28)

#### Added

- **`firestore.indexes.json`** — Added composite index `{ collectionGroup: "coupons", fields: [type ASC, createdAt DESC] }`. This was the only index identified in the D.2 audit table not covered by TASK-30–33.

#### Changed

- **`docs/APPLICATION_GRAPH.md`** — D.2 section header updated to include TASK-38; coupons row `type+createdAt` moved from "Missing" → "Defined" column; status updated to ✅.

---

### TASK-37 — Migrate `EmailVerificationCard` + `PhoneVerificationCard` to `useTranslations` (2026-02-28)

#### Changed

- **`src/components/user/settings/EmailVerificationCard.tsx`** — Removed unused `UI_LABELS` import; added `useTranslations('userSettings')`; replaced all 7 hardcoded English strings with `t('key')` calls (`emailVerificationTitle`, `verified`, `notVerified`, `verifiedMessage`, `notVerifiedMessage`, `sending`, `resendVerification`).
- **`src/components/user/settings/PhoneVerificationCard.tsx`** — Removed unused `UI_LABELS` import; added `useTranslations('userSettings')`; replaced all 7 hardcoded English strings (`phoneVerificationTitle`, `verified`, `notVerified`, `phoneNotAdded`, `phoneVerifiedMessage`, `phoneNotVerifiedMessage`, `verifying`, `verify`).
- **`messages/en.json`** — Added new `userSettings` namespace with 13 keys: `emailVerificationTitle`, `phoneVerificationTitle`, `verified`, `notVerified`, `verifiedMessage`, `notVerifiedMessage`, `sending`, `resendVerification`, `phoneNotAdded`, `phoneVerifiedMessage`, `phoneNotVerifiedMessage`, `verifying`, `verify`.
- **`messages/hi.json`** — Same 13 keys added with Hindi translations.

#### Updated

- **`src/components/user/settings/__tests__/EmailVerificationCard.test.tsx`** — Added `next-intl` mock + 7 new tests covering translation key rendering, badge variants, loading states.
- **`src/components/user/settings/__tests__/PhoneVerificationCard.test.tsx`** — Added `next-intl` mock + 8 new tests covering phone absent/present states, verification badges, loading labels.

---

### TASK-36 — Migrate `SellerQuickActions` + `SellerRecentListings` to `useTranslations` (2026-02-28)

#### Changed

- **`src/features/seller/components/SellerQuickActions.tsx`** — Removed `UI_LABELS` import; added `useTranslations('sellerDashboard')`; replaced all `UI_LABELS.SELLER_PAGE.*` references with `t('key')`; fixed "Add Product" navigation to correctly route to `ROUTES.SELLER.PRODUCTS_NEW` (was incorrectly pointing to `ROUTES.SELLER.PRODUCTS`).
- **`src/features/seller/components/SellerRecentListings.tsx`** — Removed `UI_LABELS` import; added `useTranslations('sellerDashboard')`; replaced `UI_LABELS.SELLER_PAGE.RECENT_LISTINGS` → `t('recentListings')` and `UI_LABELS.ACTIONS.VIEW_ALL` → `t('viewAll')`.
- **`messages/en.json`** — Extended `sellerDashboard` namespace with 6 new keys: `quickActions`, `viewProducts`, `viewAuctions`, `viewSales`, `recentListings`, `viewAll`.
- **`messages/hi.json`** — Added same 6 keys with Hindi translations.

#### Added

- **`src/features/seller/components/__tests__/SellerQuickActions.test.tsx`** — 6 new tests: heading renders, all 4 action buttons render with correct `useTranslations` keys, navigation verified for each button.
- **`src/features/seller/components/__tests__/SellerRecentListings.test.tsx`** — 6 new tests: null render when loading, null render when empty, heading and view-all button render, product titles shown, view-all navigates to `/seller/products`, max-5-item limit enforced.

---

### DOCS — APPLICATION_GRAPH.md stale reference cleanup (2026-02-28)

#### Changed

- **APPLICATION_GRAPH.md** — Feature module tree: removed stale `⚠️ MISSING: ForgotPasswordView` and `⚠️ MISSING: VerifyEmailView` warnings from `auth/components/`; both views were created in TASK-11 and TASK-12 and are now listed as present.
- **APPLICATION_GRAPH.md** — Feature module tree: removed `⚠️ CONFLICT` warning for `events/services/event.service.ts`; Tier-2 duplicate was deleted in TASK-27. Updated to show resolution.
- **APPLICATION_GRAPH.md** — Feature module tree: removed `⚠️ MISSING: SellerCreateProductView` warning from `seller/components/`; component was created in TASK-28. Added `SellerCreateProductView ✅ (TASK-28)` and `SellerDashboardView ✅ (TASK-15)` to the listing.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 7 (MediaUploadField): marked ✅ RESOLVED via TASK-10; `MediaUploadField.tsx` exists at `src/components/admin/MediaUploadField.tsx`.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 11 (`useAuth.ts` Firebase SDK): marked ✅ RESOLVED via TASK-21; `signInWithEmail` wrapper added to `auth-helpers.ts`, direct Firebase imports removed.
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 12 (`SessionContext.tsx` Firebase SDK): marked ✅ RESOLVED via TASK-22; `subscribeToAuthState` wrapper added, only `import type { User }` remains (type-only, no runtime dependency).
- **APPLICATION_GRAPH.md** — Mandatory Improvements item 13 (`BlogForm`/`ProductForm` `UI_LABELS`): marked ✅ RESOLVED via TASK-23 and TASK-24; all admin components now use `useTranslations`.
- **APPLICATION_GRAPH.md** — Refactoring Opportunities table: `auth/forgot-password/page.tsx` and `auth/verify-email/page.tsx` rows updated to show ✅ RESOLVED (TASK-11/12).
- **APPLICATION_GRAPH.md** — D.2 index coverage table: added resolved banner above the table noting all ⚠️/❌ entries were fixed by TASK-30–33.

#### Summary

All 9 stale warning references in `APPLICATION_GRAPH.md` (from TASK-11, 12, 21, 22, 23, 27, 28 and index tasks) are now updated to reflect their resolved state. The living document accurately reflects the current codebase state.

---

### TASK-29 — Document 17 Undocumented Hooks in GUIDE.md and QUICK_REFERENCE.md (2026-02-28)

#### Added

- **TASK-29 (P2):** `docs/GUIDE.md` — added `useGoogleLogin` and `useAppleLogin` to Authentication Hooks section with full signature, return type, and examples.
- **TASK-29 (P2):** `docs/GUIDE.md` — expanded Profile Hooks section with individual entries for `useAddress(id)`, `useCreateAddress`, `useUpdateAddress`, `useDeleteAddress`, `useSetDefaultAddress`; each includes file reference, purpose, parameters, and return types.
- **TASK-29 (P2):** `docs/GUIDE.md` — added new **FAQ Data Hooks** section with `usePublicFaqs` and `useAllFaqs` entries.
- **TASK-29 (P2):** `docs/GUIDE.md` — added new **Category Hooks** section with `useCategories` and `useCreateCategory` entries, each with usage example.
- **TASK-29 (P2):** `docs/QUICK_REFERENCE.md` — added new **Hooks Quick Lookup** section with seven category tables (Authentication, Session Management, RBAC, User Data, Content Data, Gestures & UX, Uploads & Media) covering all 17 previously undocumented hooks plus existing hooks for completeness.

#### Changed

- **TASK-29 (P2):** `docs/GUIDE.md` — replaced stale `useStorageUpload` section (hook deleted in TASK-20) with `useMediaUpload` documenting the canonical backend-upload hook.
- **TASK-29 (P2):** `docs/QUICK_REFERENCE.md` — expanded hooks line in Key File Locations to enumerate newly documented hooks by name.
- **TASK-29 (P2):** `docs/APPLICATION_GRAPH.md` — marked Mandatory Improvement #18 (undocumented hooks) as ✅ RESOLVED.
- **TASK-29 (P2):** `docs/IMPLEMENTATION_PLAN.md` — marked TASK-29 as ✅ DONE.

#### Summary

All 17 hooks listed in the TASK-29 audit are now fully documented in both GUIDE.md and QUICK_REFERENCE.md. No code changes were needed — this was a documentation-only task.

---

### TASK-18 — Systemic UI_LABELS Migration to useTranslations (2026-02-28)

#### Changed

- **TASK-18-E (P0):** `src/components/promotions/CouponCard.tsx` — removed `UI_LABELS` import; added `useTranslations("promotions")`; moved `getDiscountLabel` helper inside the component to access the hook.
- **TASK-18-E (P0):** `src/components/admin/AdminSessionsManager.tsx` — removed `UI_LABELS` import; added `useTranslations("adminSessions")` and `useTranslations("loading")`; replaced all `UI_LABELS.ADMIN.SESSIONS.*` and `UI_LABELS.LOADING.DEFAULT` usages.
- **TASK-18-E (P0):** `src/components/ErrorBoundary.tsx` — extracted `ErrorFallbackView` functional component to use `useTranslations("errorPages")` and `useTranslations("actions")`; `ErrorBoundary.render()` now delegates to `<ErrorFallbackView />`; removed `UI_LABELS` import.
- **TASK-18-E (P0):** `src/components/admin/RichTextEditor.tsx`, `src/components/checkout/OrderSuccessHero.tsx`, `src/components/checkout/OrderSuccessCard.tsx`, `src/components/checkout/OrderSummaryPanel.tsx`, `src/components/products/AddToCartButton.tsx`, `src/components/search/SearchResultsSection.tsx`, `src/components/search/SearchFiltersRow.tsx` — all migrated from `UI_LABELS` to `useTranslations` (completed this session).
- **messages/en.json, messages/hi.json** — added new keys to `checkout` (`orderTotal`, `taxIncluded`, `shippingFree`), `orderSuccess` (full namespace), `cart` (`itemCount`, `shippingFree`), `search` (`noResultsTitle`, `noResultsSubtitle`, `clearFilters`, `priceRange`, `minPrice`, `maxPrice`, `categoryFilter`, `allCategories`), `promotions` (`copyCode`, `copied`, `validUntil`, `off`, `flatOff`, `freeShipping`, `buyXGetY`, `specialOffer`, `statusActive`), and new namespace `adminSessions` (`confirmRevoke`, `confirmRevokeMessage`, `confirmRevokeAll`, `confirmRevokeAllMessage`).
- **messages/en.json, messages/hi.json** — removed duplicate `sellerAnalytics` and `sellerPayouts` keys (second shorter occurrences were overriding the first full versions).

#### Added

- **TASK-18-E (P0):** `src/components/promotions/__tests__/CouponCard.test.tsx` — NEW — 8 tests covering discount labels, active badge, copy button, and valid-until date.
- **TASK-18-E (P0):** `src/components/products/__tests__/AddToCartButton.test.tsx` — NEW — 4 tests covering default label, auction label, loading label, disabled state.
- **TASK-18-E (P0):** `src/components/search/__tests__/SearchFiltersRow.test.tsx` — NEW — 6 tests covering category filter, price range, clear filters visibility.

#### Summary

TASK-18 is now fully complete. All 35 client components that used `UI_LABELS` in JSX have been migrated to `useTranslations()` (next-intl). Groups A–E all done. Total new/updated tests for this task: 115+.

#### Added

- **TASK-15 (P2):** `src/features/seller/components/SellerDashboardView.tsx` — NEW — feature view component containing all seller dashboard logic (auth guard, product fetch, stats derivation, JSX); moved from fat page to feature module.
- **TASK-15 (P2):** `src/features/seller/components/__tests__/SellerDashboardView.test.tsx` — NEW — 6 tests. All pass.
- **TASK-15 (P2):** `src/features/seller/components/SellerStatCard.tsx` — MOVED from `src/components/seller/SellerStatCard.tsx`; this component was only used on the seller dashboard page.
- **TASK-15 (P2):** `src/features/seller/components/SellerQuickActions.tsx` — MOVED from `src/components/seller/SellerQuickActions.tsx`.
- **TASK-15 (P2):** `src/features/seller/components/SellerRecentListings.tsx` — MOVED from `src/components/seller/SellerRecentListings.tsx`.

#### Changed

- **TASK-15 (P2):** `src/app/[locale]/seller/page.tsx` — reduced from 144-line fat page to a 10-line thin shell that renders `<SellerDashboardView />`.
- **TASK-15 (P2):** `src/features/seller/components/index.ts` — added exports for `SellerDashboardView`, `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings`.
- **TASK-15 (P2):** `src/components/seller/index.ts` — removed exports for `SellerStatCard`, `SellerQuickActions`, `SellerRecentListings` (now in features/seller).
- **TASK-15 (P2):** `src/app/[locale]/seller/__tests__/page.test.tsx` — rewritten for thin-shell assertion (1 test).

---

### Fifteenth Implementation Pass — Seller Product Creation Flow (2026-02-28)

#### Added

- **TASK-28 (P1):** `src/app/api/seller/products/route.ts` — NEW — `GET` (list seller's own products, Sieve-filtered by `sellerId`) + `POST` (create product with `status: 'draft'`, sellerInfo from session).
- **TASK-28 (P1):** `src/features/seller/components/SellerCreateProductView.tsx` — NEW — full-page product creation form using `ProductForm`, `AdminPageHeader`, `useApiMutation(sellerService.createProduct)`, `useTranslations('sellerProducts')`, redirects on success.
- **TASK-28 (P1):** `src/app/[locale]/seller/products/new/page.tsx` — NEW — 5-line thin shell at `ROUTES.SELLER.PRODUCTS_NEW`.
- **TASK-28 (P1):** `src/features/seller/components/__tests__/SellerCreateProductView.test.tsx` — NEW — 6 tests.
- **TASK-28 (P1):** `src/app/api/seller/products/__tests__/route.test.ts` — NEW — 3 tests (GET filters, POST creates, POST 400 validation).
- **TASK-28 (P1):** `src/app/[locale]/seller/products/new/__tests__/page.test.tsx` — NEW — 1 test.

#### Changed

- **TASK-28 (P1):** `src/constants/api-endpoints.ts` — added `SELLER.PRODUCTS: "/api/seller/products"`.
- **TASK-28 (P1):** `src/services/seller.service.ts` — added `sellerService.createProduct(data)` and `sellerService.listMyProducts(params?)`.
- **TASK-28 (P1):** `src/features/seller/components/index.ts` — added `SellerCreateProductView` export.
- **TASK-28 (P1):** `src/constants/rbac.ts` — added `ROUTES.SELLER.DASHBOARD` RBAC entry (prefix match covers all `/seller/*` sub-routes).
- **TASK-28 (P1):** `messages/en.json` + `messages/hi.json` — added `createProductSubtitle`, `createSuccess`, `cancel` keys to `sellerProducts` namespace.

---

### Fourteenth Implementation Pass — CheckoutSuccessView Extraction (2026-02-28)

#### Added

- **TASK-17 (P2):** `src/components/checkout/CheckoutSuccessView.tsx` — NEW — extracted from `checkout/success/page.tsx`; contains `useSearchParams`, `useEffect` redirect guard, `useApiQuery` order fetch, loading/error/fallback/success JSX.
- **TASK-17 (P2):** `src/components/checkout/__tests__/CheckoutSuccessView.test.tsx` — NEW — 6 tests covering: null/redirect when no orderId, spinner, fallback UI on error, orderId shown in fallback, success render, no redirect when orderId present.

#### Changed

- **TASK-17 (P2):** `src/app/[locale]/checkout/success/page.tsx` — reduced from ~100 lines to 9-line thin shell: `<Suspense><CheckoutSuccessView /></Suspense>`.
- **TASK-17 (P2):** `src/components/checkout/index.ts` — added `CheckoutSuccessView` export.
- **TASK-17 (P2):** `src/app/[locale]/checkout/success/__tests__/page.test.tsx` — rewritten as thin-shell test (1 test).

---

### Thirteenth Implementation Pass — Address Pages useApiMutation Migration (2026-02-28)

#### Changed

- **TASK-16 (P2):** `src/app/[locale]/user/addresses/add/page.tsx` — replaced `useState(saving)` + manual `addressService.create()` try/catch + `logger` with `useCreateAddress({ onSuccess, onError })` from `@/hooks`; removed `addressService` and `logger` imports from the page.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/edit/[id]/page.tsx` — replaced `useState(saving/deleting)` + manual `addressService.update/delete()` try/catch with `useUpdateAddress(id, {...})` + `useDeleteAddress({...})`; migrated `useApiQuery({ queryKey: ['address', id] })` to `useAddress(id)` hook.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/add/__tests__/page.test.tsx` — updated mocks to reflect `useCreateAddress` usage; removed `UI_LABELS` dependency.
- **TASK-16 (P2):** `src/app/[locale]/user/addresses/edit/[id]/__tests__/page.test.tsx` — updated mocks to reflect `useAddress`, `useUpdateAddress`, `useDeleteAddress` usage; removed `UI_LABELS` dependency.

---

#### Added

- **TASK-14 (P2):** `src/hooks/useProfileStats.ts` — NEW — encapsulates the two `useApiQuery` calls (orders count + addresses count) from the user profile page; returns `{ orderCount, addressCount, isLoading }`.
- **TASK-14 (P2):** `src/hooks/__tests__/useProfileStats.test.ts` — NEW — 5 tests. All pass.

#### Changed

- **TASK-14 (P2):** `src/app/[locale]/user/profile/page.tsx` — replaced inline `useApiQuery` calls and manual stat derivation with `useProfileStats(!!user)`; removed `orderService` + `addressService` direct imports from the page.
- **TASK-14 (P2):** `src/hooks/index.ts` — added `export { useProfileStats } from "./useProfileStats"`.

---

### Tenth Implementation Pass — URL-Driven Sort State + Orders View Extraction (2026-03-01)

#### Added

- **TASK-13 (P2):** `src/features/admin/hooks/useAdminOrders.ts` — NEW — data layer hook wrapping `useApiQuery` + `useApiMutation` for the admin orders list and update operations; follows `useAdminBlog` / `useAdminUsers` pattern.
- **TASK-13 (P2):** `src/features/admin/components/AdminOrdersView.tsx` — NEW — extracted orders CRUD view including `useUrlTable` filter/sort state, `SideDrawer` for order-status editing, `DataTable`, `TablePagination`, and `AdminPageHeader`; last admin page to be extracted.
- **TASK-13 (P2):** `src/features/admin/hooks/__tests__/useAdminOrders.test.ts` — NEW — 5 tests. All pass.
- **TASK-13 (P2):** `src/features/admin/components/__tests__/AdminOrdersView.test.tsx` — NEW — 6 tests. All pass.
- **TASK-19 (P1):** `src/components/faq/__tests__/FAQPageContent.test.tsx` — NEW — 8 tests covering render, FAQ display, sort change via `table.setSort`, `useUrlTable` usage verification. All pass.

#### Changed

- **TASK-13 (P2):** `src/app/[locale]/admin/orders/[[...action]]/page.tsx` — reduced to 12-line thin shell delegating to `<AdminOrdersView action={action} />`; all state, hooks, and JSX moved to `AdminOrdersView`.
- **TASK-13 (P2):** `src/features/admin/hooks/index.ts` — added `export * from "./useAdminOrders"`.
- **TASK-13 (P2):** `src/features/admin/index.ts` — added `export { AdminOrdersView } from "./components/AdminOrdersView"`.
- **TASK-13 (P2):** `messages/en.json` + `messages/hi.json` — added `adminOrders.noOrders` translation key (was hardcoded `"No orders found"`).
- **TASK-19 (P1):** `src/components/faq/FAQPageContent.tsx` — replaced `const [sortOption, setSortOption] = useState<FAQSortOption>("helpful")` with `useUrlTable({ defaults: { sort: "helpful" } })`; sort selection is now URL-driven and bookmarkable. `onSortChange` calls `table.setSort(sort)` instead of `setSortOption`.

---

### Ninth Implementation Pass — UI_LABELS → useTranslations Migration (2026-03-01)

#### Added

- **TASK-24 (P0):** Added `next-intl` `useTranslations` to three admin components that were using `UI_LABELS` in JSX, violating Rule 2.
  - `src/components/admin/users/__tests__/UserDetailDrawer.test.tsx` — NEW — 6 tests covering render, role display, action buttons. All pass.
  - `src/components/admin/blog/__tests__/BlogTableColumns.test.tsx` — NEW — 2 tests covering hook behaviour. All pass.
- **TASK-25 (P0):** Added `formFieldTypes` i18n namespace to `messages/en.json` and `messages/hi.json` (12 form field type labels).
  - `src/features/events/components/__tests__/EventFormDrawer.test.tsx` — NEW — 4 tests covering render, drawer visibility, event type options. All pass.

#### Changed

- **TASK-24 (P0):** `src/components/admin/users/UserDetailDrawer.tsx` — removed `UI_LABELS` import; added `useTranslations("adminUsers")` inside component; all JSX labels now translation-aware.
- **TASK-24 (P0):** `src/components/admin/users/UserFilters.tsx` — removed `UI_LABELS` import; moved `TABS` and `ROLE_OPTIONS` arrays inside component function; added `useTranslations` calls for `adminUsers`, `roles`, `actions`, `form` namespaces.
- **TASK-24 (P0):** `src/components/admin/blog/BlogTableColumns.tsx` — converted `getBlogTableColumns` factory function to `useBlogTableColumns` hook; added `useTranslations("adminBlog")` and `useTranslations("actions")`; removed `UI_LABELS` import.
- **TASK-24 (P0):** `src/features/admin/components/AdminBlogView.tsx` — updated to call `useBlogTableColumns` hook instead of `getBlogTableColumns` factory.
- **TASK-24 (P0):** `src/components/admin/blog/index.ts`, `src/components/admin/index.ts` — renamed export from `getBlogTableColumns` to `useBlogTableColumns`.
- **TASK-24 (P0):** `src/components/admin/users/__tests__/UserFilters.test.tsx` — fully rewritten with `useTranslations` mocks; 8 tests.
- **TASK-25 (P0):** `src/features/events/constants/EVENT_TYPE_OPTIONS.ts` — replaced `UI_LABELS`-dependent `EVENT_TYPE_OPTIONS` with values-only `EVENT_TYPE_VALUES` array + `EventTypeValue` type.
- **TASK-25 (P0):** `src/features/events/constants/EVENT_STATUS_OPTIONS.ts` — replaced `UI_LABELS`-dependent `EVENT_STATUS_OPTIONS` with values-only `EVENT_STATUS_VALUES` array + `EventStatusFilterValue` type.
- **TASK-25 (P0):** `src/features/events/constants/FORM_FIELD_TYPE_OPTIONS.ts` — replaced `UI_LABELS`-dependent `FORM_FIELD_TYPE_OPTIONS` with values-only `FORM_FIELD_TYPE_VALUES` array + `FormFieldTypeValue` type.
- **TASK-25 (P0):** `src/features/events/components/EventFormDrawer.tsx` — import changed to `EVENT_TYPE_VALUES`; added `useTranslations("eventTypes")`; options now rendered as `tEventTypes(value)`.
- **TASK-25 (P0):** `src/features/events/components/SurveyFieldBuilder.tsx` — import changed to `FORM_FIELD_TYPE_VALUES`; added `useTranslations("formFieldTypes")`; options now rendered as `tFieldTypes(value)`.
- **TASK-25 (P0):** `src/features/events/index.ts` — updated barrel exports: `EVENT_TYPE_OPTIONS` → `EVENT_TYPE_VALUES`, `EVENT_STATUS_OPTIONS` → `EVENT_STATUS_VALUES`, `FORM_FIELD_TYPE_OPTIONS` → `FORM_FIELD_TYPE_VALUES`.
- **TASK-25 (P0):** `src/features/events/components/__tests__/SurveyFieldBuilder.test.tsx` — updated mock to `FORM_FIELD_TYPE_VALUES`; added `next-intl` mock.
- **TASK-25 (P0):** `src/app/[locale]/admin/events/__tests__/page.test.tsx` — updated mock to use `EVENT_TYPE_VALUES` and `EVENT_STATUS_VALUES`.
- `messages/en.json`, `messages/hi.json` — added `views`, `author`, `publishedOn` keys to `adminBlog` namespace (TASK-24); added `formFieldTypes` namespace (TASK-25).

---

### Eighth Implementation Pass — Page Thickness Cleanup: Auth Views (2026-02-28)

#### Added

- **TASK-11 (P2):** Created `src/features/auth/components/ForgotPasswordView.tsx` — all form logic, state, and API calls extracted from `forgot-password/page.tsx`. Page reduced to 5-line thin shell. Added to feature barrel.
  - `src/features/auth/components/__tests__/ForgotPasswordView.test.tsx` — 17 tests covering render, input, loading, error, success, navigation. All pass.
- **TASK-12 (P2):** Created `src/features/auth/components/VerifyEmailView.tsx` — `VerifyEmailContent` (token handling, `useEffect`, `useVerifyEmail` callback, loading/success/error states) + Suspense wrapper. Page reduced to 5-line thin shell. Added to feature barrel.
  - `src/features/auth/components/__tests__/VerifyEmailView.test.tsx` — 8 tests covering loading state, token-on-mount call, no-token error, success navigation, API error display, home-navigation. All pass.

#### Changed

- **TASK-11 (P2):** `src/app/[locale]/auth/forgot-password/page.tsx` — reduced from 170-line fat page to 5-line thin shell delegating to `ForgotPasswordView`.
- **TASK-12 (P2):** `src/app/[locale]/auth/verify-email/page.tsx` — reduced from 168-line fat page to 5-line thin shell delegating to `VerifyEmailView`.
- `src/features/auth/components/index.ts` — added `ForgotPasswordView` and `VerifyEmailView` exports.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-11 and TASK-12 as ✅ DONE.

---

### Seventh Implementation Pass — Rule 11 Upload Violations + Rule 2 String Cleanup (2026-02-28)

#### Removed

- **TASK-20 (P0):** Deleted `src/hooks/useStorageUpload.ts` and `src/hooks/__tests__/useStorageUpload.test.ts` — hook imported Firebase Storage client SDK (`ref`, `uploadBytes`, `getDownloadURL`, `deleteObject` from `firebase/storage`) in violation of Rule 11.
  - Removed `useStorageUpload` and `UploadOptions`/`UploadState` exports from `src/hooks/index.ts`.
  - Removed `useStorageUpload` section from `src/hooks/README.md`.
- **TASK-27 (P0):** Deleted Tier-2 `src/features/events/services/event.service.ts` — Rule 21 mandates one service per domain; Tier-1 `src/services/event.service.ts` is the single source of truth.

#### Changed

- **TASK-20 (P0):** Migrated `src/components/AvatarUpload.tsx` from `useStorageUpload` to `useMediaUpload`.
  - Now stages file locally → on save builds `FormData { file, metadata }` → POST `/api/media/upload` (Firebase Admin SDK).
  - Progress bar simplified (boolean `isLoading` replaces progress %-state).
  - Error display sourced from `uploadApiError` returned by `useMediaUpload`.
  - Alert `onClose` now calls `resetUpload()` to clear API error state.
  - `AvatarUpload.test.tsx` fully rewritten: 17 tests, mocking `useMediaUpload`. All pass.
- **TASK-27 (P0):** Fixed 3 test files broken by Tier-2 service deletion:
  - `FeedbackEventSection.test.tsx` + `PollVotingSection.test.tsx`: updated `jest.mock` path from `../../services/event.service` → `@/services`.
  - `events/[id]/participate/__tests__/page.test.tsx`: added `EventParticipateView` to `@/features/events` mock; updated tests to match thin-shell page.

#### Fixed

- **TASK-23 (P1):** Removed unused `UI_LABELS` import and dead `const LABELS = UI_LABELS.ADMIN.PRODUCTS` from `src/components/admin/products/ProductForm.tsx`. Component correctly uses `useTranslations` for all JSX text (Rule 2).
  - ProductForm tests: 8/8 pass.
- **TASK-04 (P1):** `BlogForm` Checkbox integration — already implemented; marked done in plan.
- **TASK-05 (P1):** `ProductForm` Checkbox integration — already implemented; marked done in plan.

---

### Milestone: Sixth Implementation Pass — Firebase Infrastructure + P0 Rule Fixes (2026-02-28)

#### Fixed

- **TASK-30 (P0):** Fixed critical `blogPosts` Firestore index collection name mismatch.
  - Removed 2 stale `collectionGroup: "posts"` index entries (pointed at non-existent collection).
  - Added 5 correct `blogPosts` composite indexes: `status+publishedAt`, `status+createdAt`, `status+category+publishedAt`, `status+featured+publishedAt`, `authorId+createdAt`.
  - Added 3 `notifications` composite indexes: `userId+createdAt`, `userId+isRead+createdAt`, `userId+type+createdAt`.
  - **Impact:** Eliminates full-collection scans on all blog listing queries (`/api/blog`, `/api/admin/blog`, homepage blog section).

- **TASK-31 (P0):** Added all missing high-traffic Firestore composite indexes.
  - `products`: `status+category+createdAt`, `status+availableQuantity+createdAt`.
  - `orders`: `userId+productId` (used by `orderRepository.hasUserPurchased()` for review eligibility).
  - `bids`: `productId+status+bidAmount DESC` (used by `bidRepository.getActiveBidsRanked()` for auction leaderboard).
  - `sessions`: 4-field `userId+isActive+expiresAt DESC+lastActivity DESC` (required when inequality filter + multiple orderBy fields are combined).

- **TASK-32 (P1):** Added 15 missing medium-traffic Firestore composite indexes.
  - `carouselSlides` (2): `active+createdAt`, `createdBy+createdAt`.
  - `homepageSections` (1): `type+enabled+order`.
  - `categories` (5): `tier+isActive+order`, `rootId+tier+order`, `parentIds(ARRAY_CONTAINS)+order`, `isFeatured+isActive+featuredPriority`, `isLeaf+isActive+order`.
  - `faqs` (4): `showInFooter+isActive+order`, `isPinned+isActive+order`, `showOnHomepage+isActive+priority`, `tags(ARRAY_CONTAINS)+isActive`.
  - `events` (1): `status+type+endsAt` (3-field combined filter).
  - `eventEntries` (2): `eventId+userId` (duplicate entry check), `eventId+reviewStatus+points DESC` (filtered leaderboard).

- **TASK-33 (P0):** Added missing token + newsletter Firestore indexes.
  - `emailVerificationTokens`: `userId+used` (find unused tokens per user — on the critical path for email verification).
  - `passwordResetTokens`: `email+used` (find unused reset tokens — on the critical path for password reset).
  - `newsletterSubscribers`: `status+createdAt` (admin subscriber listing).

- **TASK-34 (P0):** Added `/auction-bids` path to `database.rules.json`.
  - Any authenticated user may subscribe to live bid data at `/auction-bids/$productId` (matches actual `useRealtimeBids` subscription path — confirmed it is `/auction-bids/${productId}`, NOT `/auctions`).
  - Validates `currentBid`, `bidCount`, `updatedAt`, and `lastBid` structure. All writes remain Admin SDK only.
  - **Impact:** Unblocks `useRealtimeBids` live bid subscriptions on auction detail pages (previously blocked by root `.read: false`).

- **TASK-35 (P0):** Added `/order_tracking` path to `database.rules.json`.
  - Only the order owner may subscribe — enforces `auth.token.orderId == $orderId`.
  - Validates `status` + `timestamp` on each event node. All writes Admin SDK only.
  - Proactively in place for the `OrderTrackingView` feature. The `/api/realtime/token` endpoint (which must embed `orderId` claims) is deferred until the endpoint is built.

- **TASK-01 (P0) — already implemented:** `src/app/[locale]/categories/page.tsx` confirmed already uses `categoryService.list()` — no raw `fetch()` present. Marked as resolved.
- **TASK-21 (P0) — already implemented:** `src/hooks/useAuth.ts` confirmed already uses `signInWithEmail` from `@/lib/firebase/auth-helpers` — no direct `firebase/auth` or `@/lib/firebase/config` import present. Marked as resolved.
- **TASK-22 (P0) — already implemented:** `src/contexts/SessionContext.tsx` confirmed already uses `onAuthStateChanged` from `@/lib/firebase/auth-helpers` and only `import type` from `firebase/auth` (type-only, no runtime dependency). Marked as resolved.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-01, TASK-21, TASK-22, TASK-30, TASK-31, TASK-32, TASK-33, TASK-34, TASK-35 as ✅ DONE; added contextual note to TASK-34 clarifying actual RTDB path is `/auction-bids` not `/auctions`.
- `docs/APPLICATION_GRAPH.md`:
  - `/categories` page entry updated from 🔴⚠️ to 🟡 with violation note removed.
  - Realtime DB rules section C updated from ⚠️ to ✅, table updated with 2 new paths.
  - Firestore indexes section D updated from ❌ to ✅ with resolved summary.
  - Mandatory Improvements item #1 (categories raw fetch) struck through as resolved.

---

### Milestone: Seventh Implementation Pass — EventParticipate Form Refactor (2026-02-28)

#### Added

- `src/features/events/components/EventParticipateView.tsx` — New feature-view component extracted from the old 185-line page. Uses `FormField` + `Input` + `Button` from `@/components`; uses `useTranslations('events')` and `useTranslations('loading')` for all rendered text. Handles all survey field types: textarea, select/radio, rating (number), date, text.
- `src/features/events/components/__tests__/EventParticipateView.test.tsx` — 8 test cases covering: spinner, auth redirect, no-survey-event warning, entries-closed alert, field rendering, submit, validation error.
- `messages/en.json` + `messages/hi.json` — Added 4 missing translation keys under `events`: `entriesClosed`, `selectOption`, `fillInRequired`, `notSurveyEvent`.

#### Changed

- `src/app/[locale]/events/[id]/participate/page.tsx` — Reduced from 185 lines to 11-line thin shell delegating to `EventParticipateView`. Removes all raw HTML form elements, `UI_LABELS` usage, inline hooks/state, and business logic from the page layer.
- `src/features/events/index.ts` — Added `EventParticipateView` export.

#### Fixed (Rule violations)

- **TASK-02** (Rule 8): Replaced raw `<textarea>`, `<select>`, `<input>`, `<button>` in participate page with `FormField`, `Input`, `Button` from `@/components`.
- **TASK-03** (Rule 3): Replaced `UI_LABELS.EVENTS.*` and hardcoded strings in JSX with `useTranslations()` calls.
- **TASK-26** (Rule 10): Page reduced from 185 lines to 11 lines; logic extracted to `EventParticipateView` feature component.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-02, TASK-03, TASK-26 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - `/events/[id]/participate` entry changed from 🔴⚠️ to 🟢; violation notes removed; table updated with `EventParticipateView`.
  - Feature module tree: removed `⚠️ MISSING: EventParticipateView`; added it as present.
  - Mandatory Improvements #2, #3, #15 struck through as ✅ RESOLVED.
  - Page-thickness table row for `events/[id]/participate/page.tsx` updated to resolved.

---

### Milestone: Eighth Implementation Pass — Admin Form Media Components (2026-02-28)

#### Changed

- `src/components/admin/blog/BlogForm.tsx` — TASK-06: `content` field replaced with `RichTextEditor` (edit mode) + `dangerouslySetInnerHTML` div (readonly). TASK-07: `coverImage` field replaced with `ImageUpload` (hidden in readonly; readonly mode shows URL text label). Added `typography`, `themed` to THEME_CONSTANTS destructure.
- `src/components/admin/products/ProductForm.tsx` — TASK-08: `mainImage` field replaced with `ImageUpload` (hidden in readonly) + readonly `FormField` fallback. Added missing `import { useTranslations } from "next-intl"` (was called but not imported — pre-existing bug surfaced by cache invalidation).

#### Fixed (Rule violations)

- **TASK-06** (Rule 8): BlogForm `content` uses `RichTextEditor` instead of plain `FormField type="textarea"`.
- **TASK-07** (Rule 8): BlogForm `coverImage` uses `ImageUpload` instead of plain URL text input.
- **TASK-08** (Rule 8): ProductForm `mainImage` uses `ImageUpload` instead of plain URL text input.

#### Tests

- `src/components/admin/blog/__tests__/BlogForm.test.tsx` — Updated to 9 tests, all passing. Added `RichTextEditor` and `ImageUpload` mocks; new cases for RichTextEditor render/onChange, ImageUpload render, ImageUpload hidden in readonly, readonly shows no editor.
- `src/components/admin/products/__tests__/ProductForm.test.tsx` — Updated to 8 tests, all passing. Added `ImageUpload` mock; new cases for ImageUpload in edit mode, ImageUpload hidden in readonly.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-06, TASK-07, TASK-08 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - Mandatory Improvements #4 (`BlogForm` RichTextEditor + ImageUpload) struck through as ✅ RESOLVED (TASK-06/07).
  - Mandatory Improvements #5 (`BlogForm`/`ProductForm` raw checkbox) struck through as ✅ RESOLVED (TASK-04/05).
  - Mandatory Improvements #6 (fragmented image upload): rows for `ProductForm` and `BlogForm` updated to reflect migration to `ImageUpload`; remaining work (TASK-09 docs, TASK-20 `useStorageUpload` removal) called out.

---

### Milestone: Tenth Implementation Pass — MediaUploadField Component (2026-02-28)

#### Added

- `src/components/admin/MediaUploadField.tsx` — New embeddable file upload field for forms. Supports any MIME type (`accept` prop). Renders type-appropriate previews: video player for video URLs, image thumbnail for image URLs, filename link for other files. Uses `useMediaUpload` → `/api/media/upload` (Firebase Admin SDK). Props: `label` (required), `value`, `onChange`, `accept?`, `maxSizeMB?`, `folder?`, `disabled?`, `helperText?`.
- `src/components/admin/__tests__/MediaUploadField.test.tsx` — 9 tests, all passing. Covers: empty state, file-present state, file picker trigger, successful upload, loading spinner, error alert, disabled state, remove button, helper text.

#### Changed

- `src/components/admin/index.ts` — Added `MediaUploadField` export.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-10 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`: Added `MediaUploadField` row to Unused Existing Primitives table.
- `docs/GUIDE.md`: Added `MediaUploadField` entry to Upload Components section.

---

### Milestone: Ninth Implementation Pass — Canonical Upload Path Documentation (2026-02-28)

#### Changed

- `src/components/admin/ImageUpload.tsx` — Added JSDoc comment block declaring it as the **canonical content image upload component** for all form image fields (products, blog, categories, carousel). Documents upload path (`useMediaUpload` → `/api/media/upload`) and defers profile avatars to `AvatarUpload`.
- `src/components/AvatarUpload.tsx` — Added JSDoc comment block declaring it as **profile-avatar-only** specialist. Documents current `useStorageUpload` path with ⚠️ TASK-20 note for mandatory migration to `/api/media/upload`.

#### Documentation Updated

- `docs/IMPLEMENTATION_PLAN.md`: Marked TASK-09 as ✅ DONE.
- `docs/APPLICATION_GRAPH.md`:
  - Mandatory Improvements #6 (fragmented upload) updated to reflect TASK-09 resolved.
  - Unused Existing Primitives table: added `ImageUpload` and `AvatarUpload` rows with scope descriptions.
- `docs/GUIDE.md`: Upload Components section expanded — added `ImageUpload` entry with full props + upload path documentation; updated `AvatarUpload` entry with ⚠️ TASK-20 migration note.

---

### Milestone: Fifth Audit Pass — Firebase Infrastructure Deep Scan (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — New **Firebase Infrastructure** section (under Data Layer) covering all four Firebase services:
  - **Section A — Firestore Security Rules** (`firestore.rules`): Confirmed correct and complete. Backend-only deny-all rule verified; no gaps.
  - **Section B — Firebase Storage Rules** (`storage.rules`): Confirmed correct. Public read / no client writes matches backend-only upload architecture. Advisory note added for future private file paths.
  - **Section C — Firebase Realtime Database Rules** (`database.rules.json`): Two missing paths identified — `/auctions/$productId` (blocks `useRealtimeBids` live bid subscriptions; **critical**) and `/order_tracking/$orderId` (blocks `OrderTrackingView` real-time status events; medium severity). Recommended rule additions documented with full JSON and token claim instructions.
  - **Section D — Firestore Composite Indexes** (`firestore.indexes.json`): Full index cross-reference against every repository query. Documents 1 critical collection name mismatch (`posts` collection group should be `blogPosts`) and 27 missing or incorrect index entries across 12 collections. Includes coverage table (per collection: defined / missing / status), complete numbered list of 27 index entries, and deployment notes.

- `docs/IMPLEMENTATION_PLAN.md` — New **P0-Firebase** section added between P0 and P1. Six new tasks TASK-30 → TASK-35:
  - **TASK-30 (P0 · S)**: Fix critical `blogPosts` collection name mismatch — remove 2 dead `posts` indexes, add 5 correct `blogPosts` indexes, add 3 `notifications` indexes. Closes full-collection-scan defect on all blog listing queries.
  - **TASK-31 (P0 · S)**: Add 5 missing high-traffic indexes — `products` (status+category+createdAt, status+availableQuantity+createdAt), `orders` (userId+productId for review eligibility), `bids` (productId+status+bidAmount for auction leaderboard), `sessions` 4-field (userId+isActive+expiresAt+lastActivity).
  - **TASK-32 (P1 · S)**: Add 15 missing medium-traffic indexes — `carouselSlides` (2), `homepageSections` (1), `categories` (5 including 2 array-contains), `faqs` (4 including 1 array-contains), `events` (1 combined), `eventEntries` (2).
  - **TASK-33 (P0 · XS)**: Add 3 missing token/newsletter indexes — `emailVerificationTokens` (userId+used), `passwordResetTokens` (email+used), `newsletterSubscribers` (status+createdAt).
  - **TASK-34 (P0 · M)**: Add `/auctions/$productId` Realtime DB rule (any authenticated user may subscribe; Admin SDK writes only) + extend `/api/realtime/token` to embed `orderId` claim.
  - **TASK-35 (P0 · S)**: Add `/order_tracking/$orderId` Realtime DB rule (user must have matching `orderId` claim in custom token) + update realtime token endpoint to accept orderId parameter.
  - Header audit note, TOC, Dependency Map, and summary table updated for TASK-30 → TASK-35.

---

### Milestone: Fourth Audit Pass — Data Layer, Component & Hook Coverage (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — Fourth comprehensive audit pass:
  - **Data Layer**: Added 9 missing repositories (`addressRepository`, `blogRepository`, `cartRepository`, `eventRepository`, `eventEntryRepository`, `newsletterRepository`, `notificationRepository`, `payoutRepository`, `wishlistRepository`) and 7 missing DB schema entries (`ADDRESS_FIELDS`, `BLOG_POST_FIELDS`, `CART_FIELDS`, `EVENT_FIELDS`, `NEWSLETTER_FIELDS`, `NOTIFICATION_FIELDS`, `PAYOUT_FIELDS`) to the reference tables.
  - **Tier 1 Components**: Added 11 undocumented UI primitives (`Avatar`, `Divider`, `Dropdown`, `ImageGallery`, `Menu`, `Skeleton`, `Form`, `BackgroundRenderer`, `Typography`, `MonitoringProvider`) with file paths. Added new **Seller Components** subsection documenting `SellerStorefrontView`, `SellerStatCard`, `SellerTabs`, and 8 dashboard sub-components that were entirely undocumented. Added 2 undocumented product components (`ProductFilters`, `ProductSortBar`).
  - **Feature Modules**: Added `⚠️ MISSING` markers for `AdminOrdersView` + `useAdminOrders` (admin), `ForgotPasswordView` + `VerifyEmailView` (auth), `EventParticipateView` (events), and `SellerCreateProductView` + `/seller/products/add` page (seller — functional gap, no product creation flow exists).
  - **Hooks Reference**: Documented 17 previously undocumented hooks — Auth (`useGoogleLogin`, `useAppleLogin`, `useAdminSessions`, `useUserSessions`, `useRevokeSession`, `useRevokeMySession`, `useRevokeUserSessions`), RBAC (`useIsOwner`, `useIsModerator`, `useRoleChecks`), Data Fetch (`useAddress`, `useCreateAddress`, `useUpdateAddress`, `useAllFaqs`, `useCategories`, `useCreateCategory`), Gestures (`useGesture`). Marked `useStorageUpload` as **BANNED (Rule 11)** in the hooks table.
  - **API Routes**: Added `POST /api/reviews/[id]/vote` (review voting) and `GET/PATCH /api/homepage-sections/[id]` (individual section management).
  - **Services**: Added tier-conflict warning paragraph documenting `event.service.ts` dual presence (Tier 1 `src/services/` AND Tier 2 `src/features/events/services/` — Rule 21 violation).
  - **Mandatory Improvements**: Added items 16–18 — `event.service.ts` Rule 21 conflict (→ TASK-27), seller product creation functional gap (→ TASK-28), 17 undocumented hooks (→ TASK-29).

- `docs/IMPLEMENTATION_PLAN.md` — 3 new tasks added (TASK-27 → TASK-29); header audit note and Dependency Map / summary table updated:
  - **TASK-27 (P0 · S)**: Consolidate `event.service.ts` — remove Tier-2 duplicate (`src/features/events/services/event.service.ts`), keep Tier-1 copy (`src/services/event.service.ts`), update all consuming imports. Closes Rule 21 dual-presence violation.
  - **TASK-28 (P1 · M)**: Add `/seller/products/add` page + `SellerCreateProductView` + `POST /api/seller/products`. Closes the functional gap where sellers cannot create product listings. Includes RBAC guard, new constant, new `sellerService.createProduct()` method, and full test coverage.
  - **TASK-29 (P2 · XS — docs only)**: Document all 17 undocumented hooks in `GUIDE.md` and `QUICK_REFERENCE.md`. No code changes required.

---

### Added

- `docs/APPLICATION_GRAPH.md` — comprehensive dependency map covering all 68 pages, feature modules, shared components, hooks, services, API routes, constants, and data layer. Includes a **Mandatory Improvements** section flagging rule violations and refactoring candidates.
- `docs/IMPLEMENTATION_PLAN.md` — 19 ordered implementation tasks (P0/P1/P2) derived from APPLICATION_GRAPH gaps. Added TASK-18 (systemic `UI_LABELS`-in-JSX Rule 2 violation across ~35 client components, batched into 5 groups) and TASK-19 (`FAQPageContent` sort state must use `useUrlTable`).
- `.github/copilot-instructions.md` — added RULE 25 (Exhaustive Component Reuse — mandatory lookup table before writing any markup or HTML element) and RULE 26 (Page Thickness Limit — 150-line max for `page.tsx`, decomposition pattern, enforced size targets). Updated Pre-Code Checklist with 5 new items for Rules 25 and 26.

---

### Milestone: Third Audit Pass — Rule 11 & Rule 2 Deep Scan (2026-02-28)

#### Added

- `docs/APPLICATION_GRAPH.md` — Mandatory Improvements section extended with 7 new violation entries (items 10–15):
  - **Item 10**: `useStorageUpload.ts` + `AvatarUpload.tsx` — Firebase Storage client SDK in frontend hook (Rule 11 Critical). `useStorageUpload` must be deleted; `AvatarUpload` migrated to `useMediaUpload` + `/api/media/upload`.
  - **Item 11**: `useAuth.ts` — imports `signInWithEmailAndPassword` + `auth` from Firebase client SDK (Rule 11 Critical). Must delegate to wrapper in `auth-helpers.ts`.
  - **Item 12**: `SessionContext.tsx` — imports `onAuthStateChanged` + `auth` from Firebase client SDK (Rule 11 Critical). Must use `subscribeToAuthState()` wrapper from `auth-helpers.ts`.
  - **Item 13**: Admin client components (`BlogForm`, `ProductForm`, `BlogTableColumns`, `UserDetailDrawer`, `UserFilters`) — `UI_LABELS` in JSX (Rule 2 violations not covered by existing TASK-18 groups).
  - **Item 14**: `features/events/constants/` option arrays — `UI_LABELS` labels that land in JSX `<select>` options (Rule 2).
  - **Item 15**: `events/[id]/participate/page.tsx` — 185 lines, breaches 150-line Rule 10 limit.
- "Unused Existing Primitives" table — corrected the "File upload" entry: removed `useStorageUpload` reference; replaced with explicit note that only `useMediaUpload` is valid and `useStorageUpload` is banned.
- Refactoring Opportunities table — added `events/[id]/participate/page.tsx` row (185 lines → extract to `EventParticipateView`).

- `docs/IMPLEMENTATION_PLAN.md` — 7 new tasks added (TASK-20 → TASK-26):
  - **TASK-20 (P0 · M)**: Delete `useStorageUpload.ts` + migrate `AvatarUpload.tsx` to `useMediaUpload` + `/api/media/upload` backend flow. Removes last Firebase Storage client SDK usage from frontend.
  - **TASK-21 (P0 · S)**: Add `signInWithEmail()` wrapper to `auth-helpers.ts`; remove `firebase/auth` + `@/lib/firebase/config` direct imports from `useAuth.ts`.
  - **TASK-22 (P0 · S)**: Add `subscribeToAuthState()` wrapper to `auth-helpers.ts`; remove `firebase/auth` + `@/lib/firebase/config` direct imports from `SessionContext.tsx`.
  - **TASK-23 (P0 · S)**: Migrate `BlogForm.tsx` and `ProductForm.tsx` from `UI_LABELS` to `useTranslations` (Rule 2). Recommends combining with TASK-04/05/06/07/08 in same PRs.
  - **TASK-24 (P0 · S)**: Migrate `UserDetailDrawer.tsx`, `UserFilters.tsx`, `BlogTableColumns.tsx` from `UI_LABELS` to `useTranslations` (Rule 2).
  - **TASK-25 (P0 · S)**: Replace `UI_LABELS` labels in `features/events/constants/` option arrays with value-only arrays; consuming components build translated options via `useTranslations`.
  - **TASK-26 (P2 · S)**: Extract `EventParticipateView` from the 185-line participation page to `src/features/events/components/`; depends on TASK-02 + TASK-03 completing first.
- Dependency Map updated: TASK-20 added as prerequisite for TASK-09; TASK-21 + TASK-22 grouped (share `auth-helpers.ts` edit); TASK-23 grouped with TASK-04/05/06/07/08; TASK-26 declared dependent on TASK-02 + TASK-03.

---

### Milestone: i18n Rule 2 Final Audit (2026-02-28)

_Phases 64–67_

#### Changed

- `src/constants/navigation.tsx` — removed `label` from `NavItem` interface; deleted `SIDEBAR_NAV_GROUPS`, `ADMIN_TAB_ITEMS`, `USER_TAB_ITEMS`, `SELLER_TAB_ITEMS` (replaced by inline `useTranslations` in each component).
- `src/constants/index.ts` — removed now-deleted constant exports.
- `src/components/layout/MainNavbar.tsx` — nav labels now resolved via `useTranslations("nav")`.
- `src/components/layout/Sidebar.tsx` — fixed 4 hardcoded `aria-label` attributes to use `useTranslations("accessibility")`.
- `src/components/admin/AdminTabs.tsx` — replaced `ADMIN_TAB_ITEMS` import with inline 15-tab array using `useTranslations("nav")`.
- `src/components/user/UserTabs.tsx` — replaced `USER_TAB_ITEMS` with inline 5-tab array.
- `src/components/seller/SellerTabs.tsx` — replaced `SELLER_TAB_ITEMS` with inline 4-tab array.
- `src/components/contact/ContactInfoSidebar.tsx` — moved `INFO_ITEMS` construction into component body; replaced `UI_LABELS` strings with `useTranslations("contact")`.
- `src/components/user/WishlistButton.tsx` — replaced `UI_LABELS` with `useTranslations("wishlist")` for `aria-label`/`title`.
- `messages/en.json` + `messages/hi.json` — 12 new keys across `nav`, `contact`, `wishlist`, `accessibility` namespaces.

#### Fixed

- `src/hooks/__tests__/useAddressSelector.test.ts` — updated stale field names (`line1`, `pincode` → `addressLine1`, `postalCode`); added required `label` field.

---

### Milestone: Test Coverage — Admin + Feature Hooks (2026-02-27)

_Phases 60–63_

#### Added

- **47 new tests** across 13 admin hook test files (`useAdminAnalytics`, `useAdminBids`, `useAdminBlog`, `useAdminCarousel`, `useAdminCategories`, `useAdminCoupons`, `useAdminFaqs`, `useAdminNewsletter`, `useAdminPayouts`, `useAdminProducts`, `useAdminReviews`, `useAdminSections`, `useAdminUsers`).
- **33 new tests** for shared Tier-1 hooks (`useBlogPosts`, `usePromotions`, `useContactSubmit`, `useCheckout`, `useCouponValidate`, `useMediaUpload`).
- Feature hook tests: `useProducts`, `useAuctions`, `useCategoryProducts`, `useUserOrders`, `useOrderDetail`, `useSellerOrders`, `useSearch`, `usePollVote`, `useFeedbackSubmit`.
- Shared hook tests: `useLogout`, `useFaqVote`, `useAuctionDetail`, `usePlaceBid`, `useAddressSelector`, `useCategorySelector`, `usePublicFaqs`.

#### Fixed

- `src/helpers/auth/__tests__/token.helper.test.ts` — eliminated race condition in `isTokenExpired` boundary test.

---

### Milestone: Rule 20 Compliance — Service → Hook Layer (2026-02-27)

_Phases 46, 58–59_

#### Added

- `src/features/admin/hooks/` — 13 admin view hooks consuming service functions via `useApiQuery`/`useApiMutation`.
- Shared Tier-1 hooks: `useLogout`, `useFaqVote`, `useAuctionDetail`, `usePlaceBid`, `useAddressSelector`, `useContactSubmit`, `useCheckout`, `useCouponValidate`, `useMediaUpload`.
- `useCategories`, `useCreateCategory`, `useAllFaqs`, `usePublicFaqs` added to `src/hooks/`.

#### Changed

- All 13 admin feature view components (`AdminAnalyticsView`, `AdminBidsView`, `AdminUsersView`, etc.) — removed direct `apiClient`/`useApiQuery` calls; use named admin hooks.
- `src/components/contact/ContactForm.tsx`, `cart/PromoCodeInput.tsx`, `admin/ImageUpload.tsx`, `checkout/CheckoutView.tsx`, `faq/FAQPageContent.tsx`, `faq/FAQHelpfulButtons.tsx`, `auctions/AuctionDetailView.tsx`, `auctions/PlaceBidForm.tsx`, `layout/Sidebar.tsx`, `ui/CategorySelectorCreate.tsx`, `ui/AddressSelectorCreate.tsx` — all migrated to named hooks.

#### Result

`src/components/**` — **zero Rule 20 violations** (no `@/services` imports in any `"use client"` file).

---

### Milestone: Service Layer Architecture (2026-02-26)

_Phase 37, Sub-phases 37.2–37.14_

#### Added

- `src/services/` — full service layer: `productService`, `cartService`, `authService`, `userService`, `orderService`, `reviewService`, `bidService`, `couponService`, `faqService`, `categoryService`, `carouselService`, `homepageSectionService`, `mediaService`, `contactService`, `checkoutService`, `newsletterService`, `analyticsService`, `adminService`, `addressService`, `payoutService`, `searchService`, `blogService`, `eventService`.
- All services export named service objects; barrel-exported from `src/services/index.ts`.

#### Changed

- All API calls in hooks, pages, and feature components migrated to use service function layer.
- Oversized pages decomposed into thin page + feature components (7 batches, ~40 page files).

---

### Milestone: i18n Wiring — next-intl (2026-02-24 → 2026-02-28)

_Phases 25a–36_

#### Added

- `src/i18n/` — i18n infrastructure with `next-intl`; `[locale]` route wrapper.
- `messages/en.json` + `messages/hi.json` — complete translation files for all namespaces.
- Zod error map localization; `LocaleSwitcher` UI component.

#### Changed

- All app pages and components migrated from `UI_LABELS` to `useTranslations()` across:
  - Auth pages (login, register, forgot-password, reset-password, verify-email)
  - Public pages (homepage, products, categories, auctions, search, blog, contact, FAQ)
  - User portal (dashboard, profile, orders, addresses, wishlist, sessions)
  - Seller portal (dashboard, products, orders, payouts)
  - Admin section (15 admin pages)
  - Layout & navigation (header, footer, sidebar, bottom nav, breadcrumbs)

---

### Milestone: Events System (2026-02-24)

_Phase 22_

#### Added

- `src/features/events/` — event management module: `EventCard`, `EventGrid`, `EventDetailView`, `PollVoteForm`, `FeedbackForm`, `EventLeaderboard`.
- `src/app/api/events/` — CRUD API routes for events, polls, feedback, leaderboard.
- `src/repositories/` — `EventRepository` with Sieve list support.
- `src/services/eventService` — Tier-2 feature service.
- `src/hooks/useAuctionDetail`, `usePlaceBid` — auction real-time bid hooks with 60s refetch interval.

---

### Milestone: API & Backend Hardening (2026-01 → 2026-02)

_Phases 7.1–7.10_

#### Added

- Sieve query DSL on all list endpoints (`filters`, `sorts`, `page`, `pageSize`) — Firestore-native; replaces in-memory `findAll()` filtering.
- SEO: slug generation for products and FAQs (`slugify` util, Firestore slug index).
- Purchase-verification gate for reviews — order ownership check before review creation.
- Seller email-verification gate — sellers must have verified email before product listing.
- Status-transition validation for products (draft → pending → published flow).
- Audit log for admin site-settings changes (writes to `auditLogs` Firestore collection).
- Admin email notification on new product submitted (Resend integration).
- Bundle analyzer, dynamic imports, and image optimization pass.
- `unitOfWork` — transactional multi-collection write helper using Firestore transactions and batch writes.

#### Changed

- All admin list API routes migrated to `sieveQuery()` in repositories (billing-efficient).
- Performance: lazy-loaded feature pages, `next/image` everywhere, Lighthouse score improvements.

---

### Milestone: Build Chain, ESLint & Next.js 16 (2026-02-21 → 2026-02-25)

_Phases 17–18.19, 23–24_

#### Added

- `THEME_CONSTANTS` (`src/constants/theme.ts`) — centralizes all repeated Tailwind class strings. Full replacement across 100+ components.
- Test suite bootstrap (Phase 18.1–18.19): 245 suites → 392 suites, all green.

#### Changed

- Next.js 16 async `params` / `searchParams` compatibility across all dynamic routes.
- Next.js upgraded to 16.1.6; Turbopack compatibility for Node.js modules (`crypto`, `bcryptjs`, `firebase-admin`).
- ESLint baseline established; zero lint errors.
- Styling constants cleanup — removed raw Tailwind strings from 100+ files.

#### Fixed

- Technical-debt cleanup: removed `TECH_DEBT` comments, dead imports, duplicate validation logic.
- 4 previously-failing test suites fixed across helpers and hooks.

---

### Milestone: Core Feature Build — Components, Pages & Infrastructure (2026-02-21 → 2026-02-24)

_Phases 1–16_

#### Added

- Three-tier pluggable architecture (Tier 1 shared primitives, Tier 2 feature modules, Tier 3 page layer).
- 40+ shared UI primitives: `Button`, `Card`, `Badge`, `Input`, `FormField`, `DataTable`, `SideDrawer`, `Modal`, `ConfirmDeleteModal`, `Tabs`, `Accordion`, `Tooltip`, `Pagination`, `StatusBadge`, `RoleBadge`, `EmptyState`, `FilterDrawer`, `FilterFacetSection`, `ActiveFilterChips`, `SortDropdown`, `TablePagination`, `ResponsiveView`, etc.
- Admin components: `AdminPageHeader`, `AdminFilterBar`, `DrawerFormFooter`, `AdminTabs`.
- User components: `AddressForm`, `AddressCard`, `ProfileHeader`, `ProfileStatsGrid`, `EmailVerificationCard`, `PhoneVerificationCard`, `PasswordChangeForm`.
- All admin, seller, user, public pages scaffolded with props-driven feature components.
- `useUrlTable` hook — URL-driven filter/sort/pagination state (all params in URL query string).
- `FilterDrawer`, `FilterFacetSection`, `ActiveFilterChips` — reusable faceted filter system.
- SEO: `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, per-page metadata.
- PWA service worker (`public/sw.js`, `src/sw.ts`).
- Footer, `MainNavbar`, `Sidebar`, `BottomNavbar` — fully wired with RBAC-aware links.
- FAQ page with paginated accordion + helpfulness voting.
- Homepage dynamic sections + `HomepageSectionsRenderer`.
- Newsletter admin management (subscribe, toggle, export, delete).
- Non-tech-friendly UX: `useLongPress`, `useSwipe`, `usePullToRefresh`, `useBreakpoint` hooks.
- Gesture & accessibility improvements: keyboard navigation, screen-reader labels, WCAG 2.1 AA focus rings.
- Code deduplication: shared `DataTable`, `SideDrawer`, `AdminFilterBar` adopted across all 15 admin pages.
- RBAC: `RBAC_CONFIG`, `ProtectedRoute`, `useHasRole`, `useIsAdmin`, `useIsSeller`, `useRBAC`.

---

## [1.2.0] - 2026-02-05

### Added

- Centralized API client system (`src/lib/api-client.ts`)
- API endpoint constants (`src/constants/api-endpoints.ts`)
- React hooks for data fetching (`useApiQuery`) and mutations (`useApiMutation`)
- Authentication hooks (`useAuth.ts`) with 7 specialized hooks
- Profile management hooks (`useProfile.ts`)
- Error handling with `ApiClientError` class
- Automatic authentication via session cookies
- Request timeout handling (30s default)

### Changed

- Refactored profile page to use new hooks and components
- Refactored auth pages (forgot-password, reset-password, register, verify-email)
- Updated all pages to use `FormField` component
- Updated all pages to use `PasswordStrengthIndicator` component
- Replaced all direct `fetch()` calls with `apiClient`
- Reorganized hook exports in `src/hooks/index.ts`

### Fixed

- TypeScript errors in FormField component usage
- Error message constant references
- Password validation edge cases
- Form field type validation

### Deprecated

- `useApiRequest` hook (use `useApiQuery` or `useApiMutation`)
- Direct usage of `auth-utils` functions (use `useAuth` hooks)

### Removed

- Direct fetch calls from all pages
- Duplicate form validation logic
- Manual password strength calculations

### Security

- Added centralized error handling with status codes
- Implemented proper input validation on all forms
- Added timeout protection for API calls

---

## [1.1.0] - 2026-01-15

### Added

- Profile page with avatar upload
- Email verification functionality
- Password change feature
- Display name and phone number updates

### Changed

- Updated user profile schema
- Enhanced authentication flow

### Fixed

- Session persistence issues
- Profile image upload errors

---

## [1.0.0] - 2026-01-01

### Added

- Initial project setup with Next.js 16.1.1
- Authentication system with NextAuth v5
- User registration and login
- Mobile-first component library (40+ components)
- Dark mode support with theme context
- TypeScript configuration
- Tailwind CSS styling
- Testing setup with Jest
- Documentation structure

### Security

- CSRF protection
- Secure password hashing
- Environment variable management

---

## How to Use This Changelog

### When Making Changes:

1. **Add your changes to the `[Unreleased]` section** at the top
2. **Use the appropriate category**:
   - `Added` - New features
   - `Changed` - Changes to existing functionality
   - `Deprecated` - Soon-to-be removed features
   - `Removed` - Removed features
   - `Fixed` - Bug fixes
   - `Security` - Security improvements

3. **Example Entry**:

```markdown
## [Unreleased]

### Added

- New useDebounce hook for search optimization

### Fixed

- Fixed theme switching bug in mobile view
```

### Before Release:

1. Move unreleased changes to a new version section
2. Add release date
3. Follow semantic versioning (MAJOR.MINOR.PATCH)

---

## Version Guidelines

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (1.1.0) - New features (backward compatible)
- **PATCH** (1.1.1) - Bug fixes (backward compatible)

---

**Note**: All changes should be documented in this file. Do NOT create separate session-specific documentation files.
