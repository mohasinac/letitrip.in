# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-03-13

### Feature — Checkout: third-party shipping consent + OTP gate

Added a mandatory OTP-verified consent gate when the selected delivery address belongs to a different person than the signed-in buyer.

- **`src/features/cart/components/CheckoutAddressStep.tsx`** — added `isThirdParty()` helper and `onConsentRequired` / `consentVerifiedAddressIds` props; renders a warning banner and blocks progression until consent is OTP-verified
- **`src/features/cart/components/CheckoutView.tsx`** — threads consent state (`consentVerifiedAddressIds`, `ConsentOTPModal`) through the address-selection step; prevents `proceedToPayment` until consent is confirmed for third-party addresses
- **`messages/en.json`** — added 20+ new keys: `checkout.thirdPartyTitle`, `...thirdPartyDesc`, `...thirdPartyCheckbox`, `...consentOtp*`, `...partialOrder*`, `wishlist.searchPlaceholder`, `orders.searchPlaceholder`, `reviews.searchPlaceholder`, `reviews.subtitle`, `auctions.subtitle`, `checkout.upiStep3`, `checkout.codDepositNote`

### Refactor — Schema: `Timestamp` → `Date` normalization

Eliminated `firebase-admin/firestore` `Timestamp` import from schema files so types are portable between Admin SDK and web client contexts.

- **`src/db/schema/events.ts`** — removed `Timestamp` import; `startsAt`, `endsAt`, `createdAt`, `updatedAt`, `reviewedAt`, `submittedAt` changed from `Timestamp` to `Date`
- **`src/db/schema/tokens.ts`** — removed `Timestamp` import; `expiresAt`, `createdAt`, `usedAt` changed from `Timestamp | Date` union to `Date`

### Schema — `ProductDocument`: denormalized rating fields

- **`src/db/schema/products.ts`** — added `avgRating?: number` and `reviewCount?: number` to `ProductDocument` (populated by the new `onReviewWrite` trigger)

### Schema — `SiteSettingsDocument`: navbar + footer runtime config

- **`src/db/schema/site-settings.ts`** — added `navbarConfig?: { hiddenNavItems?: string[] }` (hides nav items by translation key without a redeploy); added `footerConfig?: { trustBar?: { enabled?: boolean; items?: TrustBarItem[] }; newsletterEnabled?: boolean }`; added `TrustBarItem` interface and `DEFAULT_TRUST_BAR_ITEMS` constant (5 default footer trust-bar chips)

### Fix — Schema: remove deprecated `RIPCOIN_EARN_RATE` constant

- **`src/db/schema/ripcoins.ts`** — removed `@deprecated RIPCOIN_EARN_RATE = 10`; callers should use `siteSettingsRepository.getLoyaltyConfig()`

### Fix — Actions: Rule-20 compliance + constant references

- **`src/actions/admin.actions.ts`** — `adminCreateProductAction` replaced inline `apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS, …)` with `adminService.createAdminProduct(input)` (Rule 20: no `apiClient` in Server Actions)
- **`src/actions/bid.actions.ts`** — replaced manual `Timestamp`-coercion guard with `resolveDate(product.auctionEndDate)` from `@/utils`
- **`src/actions/event.actions.ts`** — replaced hardcoded `"events"` and `"eventEntries"` strings with `EVENTS_COLLECTION` / `EVENT_ENTRIES_COLLECTION` constants (Rule 17)

### Refactor — Cloud Functions: merge RTDB cleanup jobs + new triggers

- **`functions/src/jobs/cleanupAuthEvents.ts`** — **deleted**: responsibility merged into new `cleanupRtdbEvents` job (handles both auth and payment RTDB nodes in a single 5-min scheduled run)
- **`functions/src/jobs/cleanupPaymentEvents.ts`** — **deleted**: same merge
- **`functions/src/index.ts`** — updated job manifest table; added `countersReconcile` (03:00 UTC, rebuilds category & store stats); registered new `onReviewWrite` trigger; replaced two separate cleanup jobs with merged `cleanupRtdbEvents`
- **`functions/src/triggers/onProductWrite.ts`** — expanded beyond Algolia sync to also update category `productCount`/`auctionCount` (with ancestor propagation via `categoryRepository.getParentIds`) and store `totalProducts` on every publish/unpublish/category-change/delete event
- **`functions/src/repositories/review.repository.ts`** — added `getApprovedRatingAggregateBySeller(sellerId)` for store-level rating aggregation
- **`functions/src/repositories/index.ts`** — re-exports updated

### Dev tooling — Violation script + instruction docs sync

- **`scripts/check-violations.js`** — Updated `CNST-003` `KNOWN_COLLECTIONS` list to match actual Firestore string values from `src/db/schema/`: corrected camelCase names (`carouselSlides`, `homepageSections`, `siteSettings`, `emailVerificationTokens`, `passwordResetTokens`, `blogPosts`, `chatRooms`, `eventEntries`, `ripcoins`); removed stale underscore names; added missing collections (`stores`, `newsletterSubscribers`, `sms_counters`, `couponUsage`, `wishlist` subcollection)
- **`.github/instructions/rules-constants.instructions.md`** — RULE 17 collection constants list expanded: added `CART_COLLECTION`, `STORE_COLLECTION`, `BLOG_POSTS_COLLECTION`, `CHAT_ROOM_COLLECTION`, `EVENTS_COLLECTION`, `EVENT_ENTRIES_COLLECTION`, `NEWSLETTER_SUBSCRIBERS_COLLECTION`, `NOTIFICATIONS_COLLECTION`, `PAYOUT_COLLECTION`, `RIPCOIN_COLLECTION`, `SMS_COUNTERS_COLLECTION`, `ADDRESS_SUBCOLLECTION`, `COUPON_USAGE_SUBCOLLECTION`
- **`.github/instructions/rules-docs-seed.instructions.md`** — Fixed seed-data paths: all `scripts/seed-data/` references corrected to `src/db/seed-data/`; `scripts/seed-all-data.ts` reference replaced with `/api/demo/seed/route.ts`
- **`src/db/seed-data/index.ts`** — Removed export for deleted `products-seed-data.ts`
- **`src/app/api/demo/seed/route.ts`** — Removed `products` collection (seed file deleted); added `stores` collection; removed dead `ALGOLIA_INDEX_NAME` import and products clear block
- **`src/app/api/demo/seed/__tests__/route.test.ts`** — Fixed Jest mock path from wrong `../../../../../../scripts/seed-data` → correct `@/db/seed-data`; removed `productsSeedData` mock; added `storesSeedData: []`

### Refactor — Layout primitives applied codebase-wide

Applied `Container`, `Stack`, `Row`, `Grid` primitives (introduced earlier this session) across 35+ files, eliminating inline `THEME_CONSTANTS` template-literal patterns and raw Tailwind grid/flex blocks.

**Container replacements** (`THEME_CONSTANTS.page.container.*` → `<Container>`):

- `src/features/stores/components/StoresListView.tsx`, `src/features/products/components/ProductsView.tsx`, `src/features/events/components/EventsListView.tsx`, `src/features/products/components/PreOrdersView.tsx`, `src/features/blog/components/BlogListView.tsx`, `src/features/products/components/AuctionsView.tsx`, `src/features/categories/components/CategoriesListView.tsx`, `src/features/reviews/components/ReviewsListView.tsx`

**Grid replacements** (`grid grid-cols-1 sm:grid-cols-2 gap-4` / `THEME_CONSTANTS.grid.cols4` → `<Grid cols={…}>`):

- `src/components/products/ProductForm.tsx` (9 blocks + Stack root; THEME_CONSTANTS import removed entirely)
- `src/features/admin/components/SiteContactForm.tsx`, `SiteSocialLinksForm.tsx`, `SiteCommissionsForm.tsx`
- `src/features/seller/components/SellerPayoutSettingsView.tsx` (2 blocks), `SellerPayoutRequestForm.tsx`, `SellerShippingView.tsx` (cols-2 + cols-3), `SellerStoreView.tsx` (2 blocks)
- `src/features/admin/components/SectionForm.tsx`

**Row replacements** (`THEME_CONSTANTS.flex.center` / `.flex.between` → `<Row>`):

- `src/features/wishlist/components/WishlistView.tsx`, `src/features/user/components/UserSettingsView.tsx`, `UserOrdersView.tsx`, `UserEditAddressView.tsx`, `UserAddressesView.tsx`, `OrderDetailView.tsx`, `src/features/seller/components/SellerAddressesView.tsx`, `src/features/admin/components/AlgoliaDashboardView.tsx`

**Stack replacements** (`flex flex-col gap-*` → `<Stack>`):

- `src/features/stores/components/StoreReviewsView.tsx`, `src/features/admin/components/AdminPriorityAlerts.tsx`, `src/features/user/components/MessagesView.tsx`

### Fix — `ReviewDocument` schema: add `sellerId` field

- **`src/db/schema/reviews.ts`** — added `sellerId?: string` to `ReviewDocument` (denormalized seller reference; was in seed data, missing from type)
- **`src/db/schema/field-names.ts`** — added `SELLER_ID: "sellerId"` to `REVIEW_FIELDS`

### New — Layout Primitives: `Container`, `Stack`, `Row`, `Grid`

Added four structural layout primitives to `@mohasinac/ui` (and re-exported from `@/components`) to eliminate repeated inline Tailwind class strings across the codebase.

- **`packages/ui/src/components/Layout.tsx`** — new file implementing `Container`, `Stack`, `Row`, `Grid` with inlined token maps
- **`packages/ui/src/index.ts`** — exports `Container`, `Stack`, `Row`, `Grid` and their prop types + `GapKey`, `ContainerSize`, `GridCols`
- **`src/components/semantic/index.ts`** — re-exports all four primitives from `@mohasinac/ui`; fully available via `import { Container, Stack, Row, Grid } from '@/components'`
- **`src/constants/theme.ts`** — added `THEME_CONSTANTS.spacing.gap` map (`none` · `px` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl`) mirroring the inlined token map in Layout.tsx
- **`.github/instructions/rules-components.instructions.md`** — added "Layout Primitives" table with usage examples and mandatory-use rule

**Migration:** Replace raw flex/grid/container divs:

```tsx
// Before
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="flex items-center justify-between gap-2">
<div className="flex flex-col gap-4">
// After
<Container>
<Grid cols={3} gap="md">
<Row justify="between" gap="sm">
<Stack gap="md">
```

### Accessibility — Contrast fixes (Phase 3, deep codebase scan)

Files with white/light text on insufficiently light backgrounds or `primary-500` (#65c408, luminance ≈ 0.44) producing < 3:1 contrast with white text:

- **`src/features/seller/components/SellersListView.tsx`** — hero subtitle `text-green-100` → `text-white`; stats row `text-emerald-200` → `text-white/80`; final-CTA `text-emerald-100` → `text-white/90` (all on dark emerald/teal gradients)
- **`src/features/promotions/components/PromotionsView.tsx`** — badge `text-rose-100` → `text-white`; subtitle `text-rose-100` → `text-white/90` (on rose-pink gradient)
- **`src/features/user/components/OrderDetailView.tsx`** — step-tracker circles + connector `bg-primary-500` → `bg-primary-700`; ring `ring-primary-500/20` → `ring-primary-700/20`
- **`src/components/products/ProductCard.tsx`** — Add-to-Cart button `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-800`
- **`src/components/EventCard.tsx`** — Visit Event button `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-800`; `ring-primary-500` → `ring-primary-700`
- **`src/features/products/components/ProductActions.tsx`** — both Add-to-Cart buttons (desktop + mobile) `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-700/90`
- **`src/components/orders/OrderCard.tsx`** — selection checkbox `bg-primary-500 border-primary-500` → `bg-primary-700 border-primary-700`
- **`src/features/user/components/PublicProfileView.tsx`** — price `text-primary-600` → `text-primary-700 dark:text-primary-400`; review avatar initial `text-primary-600` → `text-primary-800 dark:text-primary-200`; review product link + website link `text-primary-600` → `text-primary-700 dark:text-primary-400 hover:underline`; stat values `text-primary-600` → `text-primary-700 dark:text-primary-400`; dead `text-success-600` / `text-warning-600` / `text-info-600` replaced with `text-emerald-600 dark:text-emerald-400` / `text-amber-600 dark:text-amber-400` / `text-sky-600 dark:text-sky-400`
- **`src/features/seller/components/SellerStorefrontView.tsx`** — profile link `text-primary-600` → `text-primary-700 dark:text-primary-400`; stat values `text-primary-600` → `text-primary-700 dark:text-primary-400`; dead `text-success-600` → `text-emerald-600 dark:text-emerald-400`; review avatar initial `text-primary-600` → `text-primary-800 dark:text-primary-200`; review product link + back link `text-primary-600` → `text-primary-700 dark:text-primary-400`
- **`src/features/seller/components/SellerStorefrontPage.tsx`** — both error-state links `text-primary-600` → `text-primary-700 dark:text-primary-400`

### Layout — Grid density fixes (Phase 3, deep codebase scan)

- **`src/components/products/ProductGrid.tsx`** — added `2xl:grid-cols-6` (was stopping at `xl:grid-cols-5`)
- **`src/features/wishlist/components/WishlistView.tsx`** — overlay grid updated to match `ProductGrid` (`2xl:grid-cols-6`)
- **`src/components/layout/FooterLayout.tsx`** — replaced dynamic `lg:grid-cols-${computed}` (Tailwind purge risk) with static `lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5`
- **`src/features/products/components/ProductDetailView.tsx`** — added `2xl:grid-cols-[1fr_1fr_320px]` to both skeleton and main 3-column layouts
- **`src/features/products/components/AuctionDetailView.tsx`** — same as above
- **`src/features/products/components/PreOrderDetailView.tsx`** — same as above
- **`src/features/homepage/components/HomepageSkeleton.tsx`** — categories row: added `2xl:grid-cols-5`; products/auctions skeleton rows: mobile base changed from `grid-cols-3` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` (matches real carousel)
- **`src/features/homepage/components/FAQSection.tsx`** — accordion container `max-w-3xl` → `max-w-5xl` (was wasting widescreen space)
- **`src/features/stores/components/StoreAboutView.tsx`** — content container `max-w-2xl` → `max-w-4xl mx-auto` (was left-aligned without `mx-auto`)
- **`src/features/user/components/MessagesView.tsx`** — added `2xl:grid-cols-[360px_1fr]` to message layout
- **`src/features/homepage/components/WelcomeSection.tsx`** — added explicit `xl:grid-cols-2 2xl:grid-cols-2`
- **`src/features/seller/components/SellerCouponsView.tsx`** — added `xl:grid-cols-2` (was jumping `lg:2 → 2xl:3`, skipping `xl`)
- **`src/features/homepage/components/AdvertisementBanner.tsx`** — added `lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2` to image/text banner grid
- **`src/features/blog/components/BlogPostView.tsx`** — related posts grid: added `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/user/components/RipCoinsWallet.tsx`** — balance stat cards grid: added `xl:grid-cols-3 2xl:grid-cols-3`

---

## 2026-03-13 (earlier in session)

### Accessibility — Contrast fixes (Phase 1 & 2 initial audit)

- **`src/constants/theme.ts`** — `colors.footer.*` dark: variants removed (footer bg is always dark); `sectionHeader.pill` `text-primary-600` → `text-primary-700`
- **`src/features/homepage/components/WhatsAppCommunitySection.tsx`** — gradient darkened `from-green-700 to-green-800`; `text-emerald-100` → `text-white`; `text-white/75` → `text-white/90`
- **`src/features/seller/components/SellerSidebar.tsx`** — group label `text-zinc-400 dark:text-zinc-500` → `text-zinc-500 dark:text-zinc-400`
- **`src/components/categories/CategoryCard.tsx`** — product-count chip `bg-white/20` → `bg-black/50` (text was unreadable on light category images)
- **`src/features/auth/components/RegisterForm.tsx`** — all `text-blue-600` links → `text-blue-600 dark:text-blue-400` with hover variants
- **`src/features/auth/components/ForgotPasswordView.tsx`** — sign-in link `text-blue-600` → `text-blue-600 dark:text-blue-400`
- **`src/features/homepage/components/AdvertisementBanner.tsx`** — subtitle `text-white/80` → `text-white`

### Layout — Grid density fixes (Phase 2 initial audit)

- **`src/features/homepage/components/FeaturedResultsSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-5`
- **`src/features/homepage/components/SiteFeaturesSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-6`
- **`src/features/homepage/components/TrustFeaturesSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-4`
- **`src/features/homepage/components/StatsCounterSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-4`
- **`src/features/homepage/components/HowItWorksSection.tsx`** — added `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/seller/components/SellersListView.tsx`** — benefits `xl:grid-cols-3 2xl:grid-cols-4`; steps `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/seller/components/SellerStorefrontView.tsx`** — products grid `2xl:grid-cols-6`
- **`src/features/user/components/UserAccountHub.tsx`** — quick-actions grid `xl:grid-cols-6 2xl:grid-cols-6`
- **`src/features/about/components/AboutView.tsx`** — both feature grids `2xl:grid-cols-3`
- **`src/features/admin/components/QuickActionsGrid.tsx`** — `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/homepage/components/WhatsAppCommunitySection.tsx`** — benefits grid `sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4`
