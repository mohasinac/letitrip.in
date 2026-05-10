# newchange.md — Session Log & Deferred Items

> **Append new session entries below the DEFERRED section, newest first.**
> After completing a task that defers or skips any spec component, add it to DEFERRED below AND log the session entry.

## Index

- [⚠️ Deferred / Skipped Items](#️-deferred--skipped-items--read-before-each-session)
- [Session Log (newest first)](#session-log-newest-first)

---

## ⚠️ DEFERRED / SKIPPED ITEMS — READ BEFORE EACH SESSION

> These are known gaps from previous sessions. Resolve before marking the parent task fully closed, or create a new explicit task.

| Date | Task | What was deferred / skipped | Status | Fix target |
|------|------|-----------------------------|--------|------------|
| 2026-05-10 | CSS import rule | `@import "@mohasinac/appkit/styles"` in globals.css caused Turbopack PostCSS crash ("Unknown AST node type 0"). Fixed: import via JS in layout.tsx instead. Rule: never @import pre-compiled node_modules CSS through globals.css — use JS imports only. | ✅ Fixed | Ongoing rule |
| 2026-05-08 | A3/VA6 + A4/VA4 | Session 70 added `/admin/blog/new/`, `/admin/blog/[id]/`, `/admin/coupons/new/`, `/admin/coupons/[id]/` alongside existing `[[...action]]` catch-alls — creates Next.js "same specificity" route collision error. Multiple other admin routes likely affected (products, bids, carousel, categories, orders, reviews, sections, users). | ✅ Build error fixed 2026-05-09 — only `/admin/products` had an actual conflict (had both `page.tsx` and `[[...action]]/page.tsx`); all other areas use `[[...action]]` as the sole list page, no conflict. Deleted `products/[[...action]]/page.tsx`. RC4 full audit still ⏳. | RC4 |
| 2026-05-08 | SP1/P10 | Seed data source-of-truth policy formalised: SeedPanel SP1/P10 documentation (slugPattern, mediaFields, PII fields, column metadata) is canonical for all 23 collections. Seed files must be updated in-session with any schema change. P23–P31 sessions expand counts only. | ✅ Policy adopted — no code change needed | Noted in prompt.md + crud-tracker.md |
| 2026-05-07 | P10 Part A | Per-collection API endpoints (`/api/demo/seed/[collection]/route.ts`) not built — monolithic route handles per-collection calls correctly via body param. | ✅ Intentionally resolved — no per-collection route needed | — |
| 2026-05-07 | P20 | Carousel section config cast `as unknown as SectionConfig` to silence TS — underlying type mismatch not fixed | ⚠️ Tech debt — open | CF1 (Session 65) must fix carousel schema to resolve |
| 2026-05-07 | J7/J9 | Notes said "remaining: P5 seed data" — P5 was superseded. Notes updated to "resolved by P16" | ✅ Notes fixed — no code change needed | — |
| 2026-05-07 | P10 Part B | Full SeedPanel UI redesign (collapsible groups, per-collection API calls, progress bar) was never built in Session 63 — task was silently marked ✅ | ✅ Fixed 2026-05-07 | — |
| 2026-05-07 | P10 Part C | SeedPanel: per-resource accordion cards, wrong uiPath values (`/account/*`, `/admin/homepage`, `/admin/settings`), no live polling | ✅ Fixed 2026-05-07 — uiPaths corrected, 15s auto-poll added, per-card expand triggers refresh | — |
| 2026-05-07 | HS4 + HS5 | Google Business Reviews integration (HS4) and Custom Cards section component (HS5) were planned for Session 67 but not started — no code exists for either | ✅ Done 2026-05-08 — Session 67-b | — |
| 2026-05-08 | HS4-D | Per-store Google Reviews: user requested GoogleReviewsSection also available on store About page, configurable per store — not part of HS4 spec (homepage only) | ⏳ New task needed — see tracker | New task HS4-E |

---

## SESSION LOG (newest first)

---

# Session 80-plan — 2026-05-10 (Feature Planning: EX / YT / AX / FI / BK Tiers)

## Scope

Planning-only session (no code written). Designed 5 new feature tiers and documented them in `crud-tracker.md`, `prompt.md`, and `asciiDiagrams.md`.

## New tiers added

| Tier | Tasks | Description |
|------|-------|-------------|
| **EX** | EX1–EX5 | Extended Homepage Sections — Stats live collection queries, multi-carousel (max 5 slides each), Categories/Brands CTA + filter chips, Products multi-row max-20 paginated, common `collection-cards` section type |
| **YT** | YT1 | YouTube video link cards in SocialFeedSection — thumbnail from videoId, play overlay, `--appkit-color-youtube` token |
| **AX** | AX1, AX2, AX3, A1-ext | Centralized `ACTION` constants + `useActionDispatch` hook, URL panel routing (`?panel=create` / `?panel=edit&id=slug`) + `usePanelUrlSync` hook, sticky `FormActionBar` (desktop top / mobile bottom), admin product store picker |
| **FI** | FI1–FI6 | `productFeatures` Firestore collection, 10 platform seed features, admin CRUD, store custom features, product form assignment, `FeatureBadge`/`FeatureBadgeList` on cards and detail pages |
| **BK** | BK1–BK3 | Public listing selection mode + `useProductSelection` hook (max 10), sticky bulk action bar (guest: Compare+Share; auth: +Wishlist), `CompareOverlay` (desktop side-by-side + mobile swipeable) |

## Session roadmap entries added

Sessions 100 (EX+YT), 101 (AX), 102 (FI), 103 (BK) appended to ordered sessions table.

## Task count

19 new tasks added. At time of session: 283 → 302 total, 173 → 192 remaining.
(After Session 80-schema RBAC/BAN/SCAM additions: grows to 330 total, 239 remaining.)

## ASCII diagrams added (asciiDiagrams.md)

Desktop + mobile diagrams for all 10 new feature areas: Stats admin config + rendered grid, Carousel list + edit pages, Categories/Brands with CTA+filter, Products multi-row, Collection Cards Section (admin config + desktop + mobile), YouTube social card (admin config + desktop feed + mobile card), ACTION before/after flow, URL panel auto-open (desktop + mobile), Sticky form bars (desktop + mobile), Feature flags admin table + product card badges + product form tab, Bulk selection mode (desktop + mobile), Bulk action bar, Compare overlay (desktop + mobile).

---

# Session 81 — 2026-05-10 (sellerId → storeId Full Migration — ARCH2/ARCH5/ARCH8)

## Scope

Complete architectural migration replacing `sellerId` (Firebase Auth UID) with `storeId` (= storeSlug = store.id, e.g. `store-pokemon-palace`) across every Firestore collection, repository, action, API route, and seed file. `ownerId` (Auth UID) is now kept ONLY on `StoreDocument.ownerId`.

## Schemas changed (appkit)

- `CartItemDocument` + `CartAppliedCoupon` + `AddToCartInput`: `sellerId/sellerName` → `storeId/storeName`
- `OrderDocument` + `AppliedOrderDiscount`: `sellerId/sellerName` → `storeId/storeName`
- `CouponDocument`: `sellerId + storeSlug` → single `storeId`
- `OfferDocument`: `sellerId/sellerName` → `storeId/storeName`; `OFFER_FIELDS.SELLER_ID/SELLER_NAME` → `STORE_ID/STORE_NAME`
- `PayoutDocument`: `sellerId` → `storeId`; `PAYOUT_FIELDS.SELLER_ID` → `STORE_ID`
- `ConversationDocument`: removed redundant `sellerId` (already had `storeId`)
- `ProductItem` type: added `storeName?` field

## Repositories changed (appkit)

- `offer.repository.ts`: `findBySeller` → `findByStore`, `findPendingBySeller` → `findPendingByStore` (uses `OFFER_FIELDS.STORE_ID`)
- `payout.repository.ts`: `findBySeller` → `findByStore`, `findBySellerAndStatus` → `findByStoreAndStatus`, `getPaidOutOrderIds` field ref updated
- `orders.repository.ts`: `createFromAuction` param `sellerId?` → `storeId?`; `ADMIN_SIEVE_FIELDS` updated
- `products.repository.ts`: `deleteBySeller` → `deleteByStore`
- `coupons.repository.ts`: `getSellerCoupons` → `getStoreCoupons`

## Actions changed (appkit)

- `seller-actions.ts`: `listSellerCoupons` → storeRepository lookup + `getStoreCoupons`; `listSellerMyProducts` **bug fix** → was calling `findByStore(userId)` (critical bug, userId ≠ storeId) → now `findByOwnerId(userId)` → `findByStore(store.id)`
- `offer-actions.ts`: all `offer.sellerId/sellerName` → `offer.storeId/storeName`; `listSellerOffers` → storeRepository lookup; `counterOfferByBuyer` null guard added before `offer.counterAmount` use
- `store-query-actions.ts`: `findBySeller(storeDoc.ownerId)` → `findByStore(storeDoc.id)`
- `seller-coupon-actions.ts`: `storeId: store.id` in create, authorization compares storeId to storeId
- `review-actions.ts`: `findBySeller` → `findByStore`
- `bid-actions.ts`: **bug fix** — `product.storeId === userId` (wrong) → `store.ownerId === userId` via storeRepository lookup

## API routes changed (src/)

- `store/offers/route.ts`: `findBySeller(uid)` → storeRepository lookup → `findByStore(store.id)`; early-return empty if no store
- `store/orders/[id]/route.ts`: **optimized** — replaced 2-DB-call auth check (fetch all store products → check item list) with 1-DB-call (`order.storeId === store.id`); extracted `resolveSellerStoreId` helper; removed unused `productRepository` import
- `store/payouts/route.ts`: early-return if no store (replaces `storeId==__none__` sentinel hack); `storeId` now non-nullable after guard
- `admin/payouts/weekly/route.ts`: `payoutData.sellerId` → `storeId`; fixed `order.storeId ?? order.storeId ?? ""` duplicate → `order.storeId ?? ""`
- `profile/delete-account/route.ts`: `deleteBySeller(uid)` → storeRepository lookup → `deleteByStore(store.id)`

## Seed data changed (appkit)

- `cart-seed-data.ts`: rewritten with real buyer IDs, real store IDs, `storeId/storeName`
- `orders-seed-data.ts`: all `sellerId/sellerName` pairs → `storeId/storeName`
- `coupons-seed-data.ts`: seller-scoped coupons `sellerId+storeSlug` → `storeId`
- `payouts-seed-data.ts`: complete rewrite with real store IDs
- `conversations-seed-data.ts`: removed all `sellerId:` lines
- All product seed files (letitrip-official, anime-figures, beyblade, hot-wheels, transformers, retro-gaming, cosplay-accessories): removed `sellerId/sellerEmail`, renamed `sellerName` → `storeName`, corrected storeId prefix to `store-*`

## Exports changed (appkit index.ts + server.ts)

- `getSellerProducts` → `getProfileStoreProducts` (avoids name clash with stores `getStoreProducts`)
- `getSellerStorefrontProducts` → `getStoreStorefrontProducts`
- Added missing seed data exports: `conversationsSeedData`, `sublistingCategoriesSeedData`, `groupedListingsSeedData`

## UI changed

- `PublicProfileView.tsx`: uses `getProfileStoreProducts`; `toProductItem` maps `storeId/storeName`
- `ProductForm.tsx`: 5× `sellerName` → `storeName`; form field name updated
- `ProductGrid.tsx`: `product.sellerName` → `product.storeName`
- `ProductDetailPageView.tsx`: `sellerName` → `storeName` in document mapper
- `productTableColumns.tsx`: column key `sellerName` → `storeName`
- `SeedPanel.tsx`: added `COLLECTION_META` entries for `conversations`, `sublistingCategories`, `groupedListings`
- `StoreEntity` interface (2 store API routes): added missing `id` field
- `coupon.actions.ts` Zod schema: `sellerId` → `storeId` in cart item validator
- `pre-order.actions.ts`: `sellerId/sellerName` → `storeId/storeName`
- `actions/index.ts`: `getSellerProductsAction` → `getProfileStoreProductsAction`
- `asciiDiagrams.md`: added Architecture > Store Identity section documenting identity model, two-step lookup pattern, checkout three-step, optimized order auth guard, and anti-patterns

## TypeScript

Both `appkit/` and `src/` pass `npx tsc --noEmit` with 0 errors after all changes. appkit rebuilt to `dist/`.

---

# Session 80 — 2026-05-10 (ARCH3 + AdminSectionsView code quality split)

## ARCH3 — Reviews sellerId → storeId

- `appkit/src/features/reviews/types/index.ts`: `ReviewListParams` — `sellerId` removed, replaced with `storeId`.
- `appkit/src/features/reviews/schemas/index.ts` (Zod): `reviewSchema` — `storeSlug` + `storeName` replace `sellerId`; `reviewListParamsSchema` — `storeId` replaces `sellerId`.
- `appkit/src/features/reviews/hooks/useReviews.ts`: `sellerId` condition → `storeId` condition.
- `appkit/src/features/reviews/actions/review-actions.ts`: uses `storeId: product.storeId` at write time.
- `appkit/src/seed/reviews-seed-data.ts`: exports via `SELLER_STORE` map — each review gets `{storeId, storeName}` from seller userId at seed time.

## Categories seed — store identity pattern

- `appkit/src/features/categories/schemas/firestore.ts`: `CategoryDocument` extended with optional `createdByType` and `createdByStoreId`.
- `appkit/src/seed/categories-seed-data.ts`: 6 niche subcategories given seller `createdBy` user IDs; exported with `STORE_CREATOR` map converting `createdBy` userId → `{createdByStoreId}` at export time.
  - pokemon-tcg → user-aryan-kapoor (Pokemon Palace)
  - yugioh-tcg → user-nisha-reddy (CardGame Hub)
  - hot-wheels → user-vikram-mehta (Diecast Depot)
  - beyblade-x → user-rohit-joshi (Beyblade Arena)
  - gunpla → user-amit-sharma (Gundam Galaxy)
  - nendoroids-chibis → user-priya-singh (Tokyo Toys India)

## AdminSectionsView.tsx — code quality split (3595 → 2282 lines)

- `appkit/src/features/admin/components/AdminSectionsView.tsx`: reduced from 3595 → 2282 lines (-1313 lines) by extracting all type declarations, constants, defaults, and build/parse utilities into two new focused modules:
  - **`sections/adminSectionsTypes.ts`** (571 lines): all `SectionType`, `XBuilderState` interfaces, `DEFAULT_X_BUILDER` constants, `SECTION_TYPE_OPTIONS`, `SUPPORTED_TYPED_BUILDERS`, `RESOURCE_SORT_OPTIONS`, `FAQ_CATEGORY_OPTIONS`. All 21 section builder types exported.
  - **`sections/adminSectionsBuildParse.ts`** (751 lines): `parseCsvValues`, `toNumberValue`, `toStringValue`, `toBooleanValue`, `toStringArray` utilities. All 21 `buildXConfig()` functions and all 21 `parseXBuilder()` functions.
- 4 if-chain blocks converted to `switch` statements in `AdminSectionsView.tsx`:
  - `typedConfig` useMemo (21 cases)
  - edit-mode parse effect (21 cases)
  - create-mode reset effect (21 cases)
  - `renderTypedBuilder()` render function (21 cases)
- `socialFeedBuilder` state was missing from the original component — added during this refactor.

## TypeScript

- `appkit/` tsc: 0 errors in refactored files. 3 pre-existing unrelated errors remain (seed export missing for conversations/sublisting-categories/grouped-listings in seed/index.ts).
- `letitrip.in/` tsc: same 3 pre-existing errors — no new errors introduced.

---

# Session 79 — 2026-05-10 (FAQ expansion + Live stats + Homepage view refactor)

## FAQ seed data — expanded to 53 FAQs

- `appkit/src/seed/faq-seed-data.ts`: complete rewrite from 20 to 53 FAQs across 7 categories.
- Platform risk disclaimer woven throughout: LetItRip is a marketplace, not the seller; shipping timelines and return policies are set by individual stores (visit store About page).
- 8 FAQs have `showOnHomepage: true`. 5 have `showInFooter: true`.
- New `general` category FAQs: what-is-letitrip (with platform disclaimer), is-letitrip-safe, how-does-letitrip-work.
- Full `account_security` and `technical_support` categories added.
- Returns/shipping FAQ messaging: "Each store on LetItRip sets its own policy — check that store's About page."

## Homepage section seed fixes

- `appkit/src/seed/homepage-sections-seed-data.ts`: stats section values updated with `source: "live"` + `metric` + `suffix` fields reflecting actual seed data (31 listings / 8 sellers / 10 buyers / 4.7★ rating).
- FAQ section: `displayCount` 5→8, `expandedByDefault` false→true (SEO: answers visible to crawlers without JS), `categories` array fixed to correct `FAQCategory` union values.

## Firestore schema additions

- `appkit/src/features/homepage/schemas/firestore.ts`:
  - Added exported `LiveStatMetric` type (6 values: total_listings, verified_sellers, total_buyers, platform_rating, total_orders, total_reviews).
  - Extended `StatsSectionConfig` stat items with optional `source`, `metric`, `suffix` fields.
  - Fixed `FAQSectionConfig.categories` array element type to use correct `FAQCategory` values (was using wrong legacy strings).

## Live stats system — new file

- `appkit/src/features/homepage/lib/live-stats.ts` (NEW): fetches only the Firestore metrics requested by the current stats section, in parallel. All failures silently caught — static `value` used as fallback. `reviewRepository.findAll()` called with no args, filtered in-memory for `status === "approved"` to compute platform_rating.

## Homepage view refactor — split into 4 files

- `MarketplaceHomepageView.tsx` now imports from 3 new focused modules. File reduced from ~570 to ~65 lines — only handles data fetching + section ordering + rendering orchestration.
- `appkit/src/features/homepage/lib/section-defaults.ts` (NEW): `DEFAULT_TRUST_FEATURES` and `DEFAULT_SECURITY_ITEMS` constants.
- `appkit/src/features/homepage/lib/section-helpers.ts` (NEW): `cleanTitle()` and `parseWelcomeDescription()` utility functions.
- `appkit/src/features/homepage/lib/section-renderer.tsx` (NEW): `renderSection()` with full switch statement for all 21 section types + `MarketplaceHomepageViewAdSlots` type + `FaqItem` type + `AD_SLOT_MAP`. Single responsibility: map a `HomepageSectionDocument` to a React node.

## TypeScript

- `appkit/` tsc: 0 errors.
- `letitrip.in/` tsc: 3 pre-existing errors (missing seed exports for conversations/sublisting-categories/grouped-listings — not caused by this session).

---

# Session 78 — 2026-05-10 (Carousel height fix + Section diagrams + Admin form builders)

## HeroCarousel mobile height regression (CF1)

- `appkit/src/features/homepage/components/HeroCarousel.tsx`: removed `md:` prefix from 3 height class applications in the loading state, section wrapper, and per-slide div. Mobile now respects `${heightClass}` (e.g. `min-h-[80vh]` for "tall") instead of collapsing to `min-h-[260px]`.
- Fixed `slide.cards.slice(0, 2)` → `slice(0, 6)` so all 6 zone positions can render cards.

## Carousel seed card zone fix

- `appkit/src/seed/carousel-slides-seed-data.ts` slide 1 "Hot Wheels" card: `zone: 2 → zone: 5` (moved from row 1, col 2 → row 2, col 2). Cards are now in different rows as the zone grid spec requires.

## asciiDiagrams.md — all 21 section type diagrams

- Added full public-facing layout diagrams for every homepage section type (welcome, carousel, stats, trust-indicators, categories, brands, products, auctions, pre-orders, banner, features, reviews, whatsapp-community, faq, blog-articles, newsletter, stores, events, social-feed, custom-cards, google-reviews).
- Added Admin Section Editor shared modal shell diagram + 21 per-type admin form diagrams using proper UI notation (◉/◯ radio buttons, ☑/☐ checkboxes, `┌──┐│ │└──┘` input boxes).

## AdminSectionsView typed builders (HS2/HS5 gap fix)

- `appkit/src/features/admin/components/AdminSectionsView.tsx`: added typed builders for the three section types that previously fell through to raw JSON textarea:
  - **carousel**: title, height select (viewport/tall/medium), default autoplay delay, pause-on-hover, show-dots, show-arrows
  - **custom-cards**: title, layout select, columns select, auto-scroll + interval, dynamic card repeater (image URL, imageAlt, eyebrow, title, body, link, backgroundColor, textColor, borderRadius, shadowLevel)
  - **google-reviews**: placeId, maxReviews, minRating (0★/3★/4★/5★), layout, showRating, showDate, linkToGoogleMaps, googleMapsUrl (conditional)
- All three wired into: SECTION_TYPE_OPTIONS, SUPPORTED_TYPED_BUILDERS, state, typedConfig useMemo, edit-mode parse effect, create-mode reset effect, renderTypedBuilder. All 21 section types now have typed builders — zero raw JSON textarea exposed.
- tsc 0 errors in AdminSectionsView.tsx (3 pre-existing unrelated seed data TS errors in other files unchanged).

---

# Session 76-listing — 2026-05-10 (Listing view migration sweep)

## All 16 admin listing views migrated to ListingToolbar + useUrlTable + DataTable

Migrated every admin listing view from the `AdminListingScaffold` pattern to `ListingToolbar` + `useUrlTable` + `DataTable` + filter drawer. `AdminListingScaffold` is now unused in all views; only `AdminListingScaffoldRow` type is still imported in a few places.

### Standard pattern (applied to all views)

```
useUrlTable({ defaults: { pageSize, sort } })
pendingFilters local state — buffers drawer changes until Apply
openFilters / applyFilters / clearFilters / resetAll / commitSearch
useAdminListingData → rows, total, isLoading, errorMessage
<ListingToolbar search + filterCount + sortOptions + hasActiveState + extra />
<Pagination sticky when totalPages > 1 />
<DataTable rows columns isLoading emptyLabel getRowHref renderRowActions />
Filter drawer: fixed left, z-50, w-80, chip filter buttons + Apply
Mutations (ConfirmDeleteModal / Modal) rendered as fragments AFTER main div
```

### Files changed (appkit/) — Batch 1

- `AdminBidsView.tsx` — status filter (All/active/outbid/won/cancelled), cancel bid ConfirmDeleteModal
- `AdminCartsView.tsx` — type filter (All/guest/auth), server-side via `filters` param
- `AdminWishlistsView.tsx` — sort only; no filter drawer
- `AdminSessionsView.tsx` — isActive filter, revoke action + ConfirmDeleteModal
- `AdminPayoutsView.tsx` — status filter, mark-paid Modal, CSV export via `extra` prop
- `AdminNotificationsView.tsx` — type filter (10 types), resend + delete + ConfirmDeleteModal
- `AdminAllEventEntriesView.tsx` — status filter, confirm/waitlist/cancel RowActionMenu
- `AdminReturnRequestsView.tsx` — sort only; approve→REFUNDED + reject→DELIVERED both ConfirmDeleteModal
- `AdminStoreAddressesView.tsx` — sort only; read-only view

### Files changed (appkit/) — Batch 2

- `AdminNewsletterView.tsx` — status filter, unsubscribe ConfirmDeleteModal, CSV export via `extra`
- `AdminContactView.tsx` — status filter, AdminContactEditorView drawer preserved, delete ConfirmDeleteModal
- `appkit/src/features/events/components/AdminEventsView.tsx` — status + type filter, `getRowHref` added
- `AdminReviewsView.tsx` — status + rating filters, approve/reject/feature/unfeature/reply/view actions
- `AdminProductsView.tsx` — status + type filters, isFeatured/isPromoted/isOnSale/isSold toggle columns with optimistic `overrides` state

### Files changed (appkit/) — Batch 3 + Fix

- `AdminCarouselView.tsx` — active filter, drag-and-drop reorder preserved (`localRows`/`draggingId` state)
- `AdminSectionsView.tsx` — minimal targeted edit on 2800+ line file; replaced only the `AdminListingScaffold` usage; all custom section form builders preserved unchanged

**DataTable columns fix:** Made `columns` prop optional (`columns?:`). Added `DEFAULT_COLUMNS` with primary/secondary combined cell, status badge (w-32), updatedAt relative date (w-32). Fixed 28 TS2741 errors across all migrated views that omit `columns`.

**actionsSlot → extra:** Fixed wrong prop name `actionsSlot` to `extra` on `AdminPayoutsView` and `AdminNewsletterView` (`ListingToolbar`'s actual prop is `extra?: React.ReactNode`).

Both `npx tsc --noEmit` checks (appkit/ and letitrip.in/) passed clean post-migration.

---

# Session 76-content — 2026-05-10 (About Us + Legal pages + Admin editing)

## About page wired with real content

`src/app/[locale]/about/page.tsx` — converted to async server component.
Reads `getTranslations("about")` for default i18n content and `siteSettingsRepository.getSingleton()`
for optional Firestore overrides (`siteSettings.aboutContent.*`). Passes fully populated `labels`,
`howItems`, `valueItems`, `milestones` props to `AboutView`. Added SEO metadata.

**Files changed:**
- `src/app/[locale]/about/page.tsx` — async, i18n + Firestore-driven props

## PolicyPageView fixed + wired to Firestore

Two bugs fixed in `PolicyPageView.tsx`:
1. Namespace map was wrong (`privacyPolicy`/`termsOfService`/`cookiePolicy` don't exist in en.json).
   Fixed: `privacy:"privacy"`, `terms:"terms"`, `cookies:"cookies"`, `refund:"refundPolicy"`.
2. Added Firestore fetch — if admin has set HTML in `siteSettings.legalPages.*`, it renders that HTML.
   Otherwise falls back to i18n sections.

**Files changed:**
- `appkit/src/features/about/components/PolicyPageView.tsx` — namespace fix + Firestore override

## messages/en.json — policy sections arrays added

All four policy namespaces (`terms`, `privacy`, `cookies`, `refundPolicy`) now export:
`sections` (array of `{heading, body}`), `intro`, `relatedTitle`, `relatedPrivacy`,
`relatedTerms`, `relatedCookies`, `relatedRefund`. PolicyPageView i18n fallback now works correctly.

**Files changed:**
- `messages/en.json` — terms, privacy, cookies, refundPolicy namespaces updated

## AdminSiteSettingsView — ⓪ About tab added

New tab appears first in Site Settings. Fields: hero title, hero subtitle, mission title,
mission text, CTA title. Saved to `siteSettings.aboutContent.*`. Empty = use platform defaults.

**Files changed:**
- `appkit/src/features/admin/components/AdminSiteSettingsView.tsx` — ⓪ About tab + state + mutation

## Metadata added to all static pages

`Metadata` exports added to: about, privacy, terms, cookies, refund-policy, shipping-policy pages.

**Files changed:**
- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/cookies/page.tsx`
- `src/app/[locale]/refund-policy/page.tsx`
- `src/app/[locale]/shipping-policy/page.tsx`

---

# Session 76-infra — 2026-05-10 (J13, J14, J15, INFRA1, INFRA2, Firebase reset)

## J13 — Products listing empty: missing isAuction/isPreOrder on seed docs + missing Firestore indexes

**Root cause 1:** All 20 standard product seed docs had no `isAuction` or `isPreOrder` field.
Firestore `where("isAuction", "==", false)` returns 0 docs when field is absent.

**Root cause 2:** Missing composite index `(status, isAuction, createdAt)` — FAILED_PRECONDITION
silently caught as null initialData → staleTime:Infinity → no client refetch.

**Files changed (appkit/):**
- `appkit/src/seed/products-standard-seed-data.ts` — added `isAuction: false, isPreOrder: false` to all 20 standard product documents
- `appkit/firebase/base/firestore.indexes.json` — added `(status ASC, isAuction ASC, createdAt DESC)` and `(status ASC, isAuction ASC, isPreOrder ASC, createdAt DESC)` composite indexes

## J14 — Blog listing empty: SSR initialData shape mismatch

`BlogIndexPageView` passed `FirebaseSieveResult` (has `.items`) directly as `initialData` to
`BlogIndexListing` which expects `BlogListResponse` (has `.posts`). `posts` always undefined.

**Files changed (appkit/):**
- `appkit/src/features/blog/components/BlogIndexPageView.tsx` — transform SSR result to `BlogListResponse { posts, meta }` before passing; pass `undefined` on SSR failure (not null)

## J15 — Events listing empty: wrong default status filter

`EventsListPageView.buildEventFilters()` defaulted to `"status==published"` — no events have this status.

**Files changed (appkit/):**
- `appkit/src/features/events/components/EventsListPageView.tsx` line 24 — changed default `"status==published"` to `"status==active"`

## INFRA1 — firebase-reset.mjs dry-run crash: .count() not in firebase-admin v10

**Files changed (appkit/):**
- `appkit/scripts/firebase-reset.mjs` — replaced `collectionRef.count().get()` + `.data().count` with `collectionRef.get()` + `.size`

## INFRA2 — New firebase-delete-indexes.mjs utility script

Fixes 409 "index already exists" when partial deploys leave indexes in CREATING state.
Uses firebase-tools OAuth refresh token + Firestore REST API to bulk-delete all composite indexes.
Also fixed 2 duplicate faqs entries in `appkit/firebase/base/firestore.indexes.json`:
`isPinned,priority,order` (positions 34+38) and `isActive,createdAt` (positions 58+206).

**Files changed (appkit/):**
- `appkit/scripts/firebase-delete-indexes.mjs` — NEW utility script
- `appkit/firebase/base/firestore.indexes.json` — removed 2 duplicate faqs index entries

## Firebase full reset + redeploy

Full Firebase project reset (all Firestore, Auth, 24 Cloud Functions, 205 indexes wiped + redeployed clean).
263 composite indexes deployed. Re-seed required: go to `/demo/seed` and seed all 23 collections.

---

# Session 75 — 2026-05-10 (X3, X4, X5, X6)

## X3 — Dark mode + responsive grid for AdminBrandEditorView + AdminCategoryEditorView

**Files changed (appkit/):**
- `AdminBrandEditorView.tsx` — grouped name+slug, logo+banner, website+displayOrder into `sm:grid-cols-2` pairs
- `AdminCategoryEditorView.tsx` — grouped name+slug into `sm:grid-cols-2`; `dark:text-zinc-300` on raw `<label>`, `dark:text-neutral-400` on helper `<p>`

## X4 — Form quality checklist in HOW TO WORK

**Files changed (src/):**
- `prompt.md` — added "Form quality checklist" section (7 items: mobile/tablet/dark/tokens/focus/errors/loading) under HOW TO WORK

## X5 — PageLoader component + replace all 15 loading.tsx skeletons

**Files changed (appkit/):**
- `appkit/src/ui/components/PageLoader.tsx` — NEW: "use client" component; centered spinner + "Loading…" text; 15s `setTimeout` → "Something went wrong. Please refresh." + Refresh button
- `appkit/src/ui/index.ts` — exported `PageLoader`
- `appkit/src/index.ts` — exported `PageLoader` from root

**Files changed (src/):**
- All 15 `src/app/[locale]/**/loading.tsx` — replaced inline skeletons with `<PageLoader />` from `@mohasinac/appkit`

## X6 — Media filename slug convention in upload handlers

**Files changed (appkit/):**
- `appkit/src/utils/id-generators.ts` — added `brand-logo` + `brand-banner` to `MediaFilenameContext` union; added `generateBrandLogoFilename` + `generateBrandBannerFilename` generators; wired into `generateMediaFilename` switch
- `AdminBrandEditorView.tsx` — logo/banner `onUpload` now passes `{ type: "brand-logo/banner", brand: name || slug }`
- `AdminBlogEditorView.tsx` — cover `onUpload` now passes `{ type: "blog-cover", title, category }`

---

# Session 74 — 2026-05-10 (B5/VA16, B6/VA14, B7/VA15, VA17, VA18, LL16, LL17)

## B5/VA16 — AdminBidsView cancel action

**Files changed (appkit/):**
- `AdminBidsView.tsx` — added `cancelMutation` (PATCH `BID_BY_ID` with `{ status: "cancelled" }`), `ConfirmDeleteModal` (variant=warning), `RowActionMenu` with "Cancel bid" (destructive, disabled when already cancelled/voided)
- `RowActionMenu.tsx` — added `disabled` to `RowAction` interface + renders with `opacity-40 cursor-not-allowed`

## B6/VA14 — AdminNewsletterView unsubscribe + CSV export

**Files changed (appkit/):**
- `AdminNewsletterView.tsx` — added `unsubscribeMutation` (DELETE `NEWSLETTER_BY_ID`), `handleExportCsv` (fetch blob download), actionsSlot "Export CSV" button, RowActionMenu "Unsubscribe" (destructive, disabled when already unsubscribed)
- `api-endpoints.ts` — `ADMIN_ENDPOINTS.NEWSLETTER_EXPORT: "/api/admin/newsletter/export"`

**Files changed (src/):**
- `src/app/api/admin/newsletter/export/route.ts` — GET, auth admin/moderator, `newsletterRepository.list()`, streams CSV with headers: id, email, status, source, subscribedAt, createdAt

## B7/VA15 — AdminContactView RowActionMenu + AdminContactEditorView SideDrawer

**Files changed (appkit/):**
- `AdminContactEditorView.tsx` — NEW: SideDrawer with status badge (blue/zinc/green), From section, scrollable message body, "Reply via email" (mailto:), "Mark read" (PATCH action=read), "Archive" (PATCH action=resolved)
- `AdminContactView.tsx` — added RowActionMenu (View/Mark read/Archive/Delete), `deleteMutation`, `AdminContactEditorView` wiring, `ConfirmDeleteModal` for delete
- `index.ts` — exported `AdminContactEditorView` + props type

## VA17 — AdminFeatureFlagsView dedicated endpoint + rollout %

**Files changed (appkit/):**
- `AdminFeatureFlagsView.tsx` — switched from `useSiteSettings` to `useQuery` on `ADMIN_ENDPOINTS.FEATURE_FLAGS`; per-flag toggle + rollout % Input (0–100, disabled when flag off); Save via `apiClient.put`
- `api-endpoints.ts` — `ADMIN_ENDPOINTS.FEATURE_FLAGS: "/api/admin/feature-flags"`

**Files changed (src/):**
- `src/app/api/admin/feature-flags/route.ts` — GET returns `{ flags, rollouts }` from siteSettings; PUT zod-validated, writes `featureFlags` + `featureFlagRollouts` via `updateSingleton`

## VA18 — AdminMediaView copy-URL button

**Files changed (appkit/):**
- `AdminMediaView.tsx` — added `copiedUrl` state, `copyToClipboard` via `navigator.clipboard.writeText`, "Copy URL" button for heroAssetUrl + per-asset "Copy" in gallery list

## LL16 — AdminReturnRequestsView

**Files changed (appkit/):**
- `AdminReturnRequestsView.tsx` — NEW: `AdminListingScaffold` filtered to `?status=RETURN_REQUESTED`, `approveMutation` (→REFUNDED), `rejectMutation` (→DELIVERED), two ConfirmDeleteModals
- `api-endpoints.ts` — `ADMIN_ENDPOINTS.STORE_ADDRESSES: "/api/admin/store-addresses"`
- `route-map.ts` — `ROUTES.ADMIN.RETURN_REQUESTS: "/admin/return-requests"`
- `index.ts` — exported `AdminReturnRequestsView` + props type

**Files changed (src/):**
- `src/app/[locale]/admin/return-requests/page.tsx` — NEW: wraps `AdminReturnRequestsView`
- `src/constants/navigation.tsx` — "Returns" link in Management group

## LL17 — AdminStoreAddressesView

**Files changed (appkit/):**
- `AdminStoreAddressesView.tsx` — NEW: read-only `AdminListingScaffold`, optional `storeId` filter, no mutations
- `route-map.ts` — `ROUTES.ADMIN.STORE_ADDRESSES: "/admin/store-addresses"`
- `index.ts` — exported `AdminStoreAddressesView` + props type

**Files changed (src/):**
- `src/app/api/admin/store-addresses/route.ts` — GET; if `storeId` param → specific store subcollection; else → `collectionGroup("addresses")`
- `src/app/[locale]/admin/store-addresses/page.tsx` — NEW: wraps `AdminStoreAddressesView`
- `src/constants/navigation.tsx` — "Store Addresses" link in Management group

---

# Session 73 — 2026-05-09 (N3, B1/VA10, B2/VA9, N2/VA11, LL11–LL15)

## N3 — Admin Stores editor: isVerified + suspensionReason fields

**Files changed (appkit/):**
- `AdminStoreEditorView.tsx` — added `currentIsVerified` prop, `isVerified`/`suspensionReason` state, Verified toggle, conditional suspensionReason textarea (shown only when status==="suspended"), both fields included in PATCH payload
- `AdminStoresView.tsx` — added `currentIsVerified={Boolean(selectedRow?._raw?.isVerified)}` to `AdminStoreEditorView`

**Files changed (src/):**
- `src/app/api/admin/stores/[uid]/route.ts` — extended `updateStoreSchema` with `isVerified: z.boolean().optional()` and `suspensionReason: z.string().optional()`

## B1/VA10 — AdminUserEditorView SideDrawer + AdminUsersView RowActionMenu

**Files changed (appkit/):**
- `AdminUserEditorView.tsx` — NEW: SideDrawer with role select (user/seller/admin), isDisabled toggle + banReason textarea (conditional), emailVerified toggle, adminNotes textarea; "Delete user" danger button → ConfirmDeleteModal; PATCH + DELETE to ADMIN_ENDPOINTS.USER_BY_ID
- `AdminUsersView.tsx` — added `UserRow` type with `_raw`, drawer state, RowActionMenu "Manage" action → AdminUserEditorView
- `components/index.ts` — exported AdminUserEditorView
- `index.ts` — exported AdminUserEditorView

## B2/VA9 — AdminOrderEditorView SideDrawer + AdminOrdersView RowActionMenu

**Files changed (appkit/):**
- `AdminOrderEditorView.tsx` — NEW: SideDrawer with status select (all 7 statuses), trackingNumber input, carrier select (Delhivery/BlueDart/DTDC/Ekart/India Post/Other), refundAmount input (shown for REFUNDED/RETURN_REQUESTED), notes textarea; PATCH to ADMIN_ENDPOINTS.ORDER_BY_ID
- `AdminOrdersView.tsx` — added `OrderRow` type with `_raw`, drawer state, RowActionMenu "Update order" action → AdminOrderEditorView; filter options updated to uppercase statuses
- `components/index.ts` — exported AdminOrderEditorView
- `index.ts` — exported AdminOrderEditorView

## N2/VA11 — AdminReviewsView moderation actions

**Files changed (appkit/):**
- `AdminReviewsView.tsx` — full rewrite: patchMutation for approve/reject/feature; replyMutation for adminReply; RowActionMenu with Approve/Reject/Feature(Unfeature)/Reply/View actions; Reply uses Modal (1 field rule); View uses ViewReviewModal; Review object constructed from `_raw` with required typed fields

## LL11 — AdminSessionsView + page + nav entry

**Files changed (appkit/):**
- `AdminSessionsView.tsx` — NEW: columns (user/device/browser/OS/IP-masked/lastActivity/expires/isActive badge); active-only filter toggle; Revoke action → ConfirmDeleteModal → DELETE ADMIN_ENDPOINTS.SESSION_BY_ID; maskIp helper (last octet → *)
- `components/index.ts` + `index.ts` — exported AdminSessionsView
- `next/routing/route-map.ts` — added `SESSIONS: "/admin/sessions"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/[locale]/admin/sessions/page.tsx` — NEW thin wrapper

## LL12 — AdminAllEventEntriesView + API routes + page + nav entry

**Files changed (appkit/):**
- `AdminAllEventEntriesView.tsx` — NEW: cross-event entries view; status filter (All/CONFIRMED/WAITLISTED/CANCELLED); RowActionMenu Confirm/Waitlist/Cancel actions → PATCH ADMIN_ENDPOINTS.ADMIN_EVENT_ENTRY_BY_ID
- `api-endpoints.ts` — added `ADMIN_EVENT_ENTRIES` + `ADMIN_EVENT_ENTRY_BY_ID`
- `components/index.ts` + `index.ts` — exported AdminAllEventEntriesView
- `next/routing/route-map.ts` — added `ALL_EVENT_ENTRIES: "/admin/event-entries"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/event-entries/route.ts` — NEW: GET all entries via `eventEntryRepository.findAll(limit)`
- `src/app/api/admin/event-entries/[id]/route.ts` — NEW: PATCH status (CONFIRMED/WAITLISTED/CANCELLED)
- `src/app/[locale]/admin/event-entries/page.tsx` — NEW thin wrapper

## LL13 — AdminNotificationsView + API routes + page + nav entry

**Files changed (appkit/):**
- `AdminNotificationsView.tsx` — NEW: type filter; delete + resend row actions; Resend → POST resend endpoint (marks isRead=false)
- `api-endpoints.ts` — added `ADMIN_NOTIFICATIONS`, `ADMIN_NOTIFICATION_BY_ID`, `ADMIN_NOTIFICATION_RESEND`
- `components/index.ts` + `index.ts` — exported AdminNotificationsView
- `next/routing/route-map.ts` — added `NOTIFICATIONS: "/admin/notifications"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/notifications/route.ts` — NEW: GET via notificationRepository.findAll(limit)
- `src/app/api/admin/notifications/[id]/route.ts` — NEW: DELETE
- `src/app/api/admin/notifications/[id]/resend/route.ts` — NEW: POST (marks isRead=false)
- `src/app/[locale]/admin/notifications/page.tsx` — NEW thin wrapper

## LL14 — AdminCartsView + API route + page + nav entry

**Files changed (appkit/):**
- `AdminCartsView.tsx` — NEW: read-only diagnostic view; guest/auth type filter
- `api-endpoints.ts` — added `ADMIN_CARTS`
- `components/index.ts` + `index.ts` — exported AdminCartsView
- `next/routing/route-map.ts` — added `CARTS: "/admin/carts"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/carts/route.ts` — NEW: GET via cartRepository.findAll(limit)
- `src/app/[locale]/admin/carts/page.tsx` — NEW thin wrapper

## LL15 — AdminWishlistsView + API route + page + nav entry

**Files changed (appkit/):**
- `AdminWishlistsView.tsx` — NEW: read-only wishlist insights view
- `api-endpoints.ts` — added `ADMIN_WISHLISTS`
- `components/index.ts` + `index.ts` — exported AdminWishlistsView
- `next/routing/route-map.ts` — added `WISHLISTS: "/admin/wishlists"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/wishlists/route.ts` — NEW: GET via Firestore collectionGroup("wishlist") (subcollection — no repository cross-user query exists); extracts userId from ref path
- `src/app/[locale]/admin/wishlists/page.tsx` — NEW thin wrapper

**Navigation changes (src/):**
- `src/constants/navigation.tsx` — Events moved from Content group to new dedicated Events group with "All Entries"; Sessions/Notifications/Carts/Wishlists added to System group; Feature Flags + Copilot remain in System group

**tsc:** 0 errors both repos (after `npm run build` in appkit/). **Commit:** pending

---

# Session 72 — 2026-05-09 (ARCH4 + I3)

## ARCH4 — Admin payouts storeId identity + mark-paid + CSV export

**Files changed (appkit/):**
- `AdminPayoutsView.tsx` — stateful rewrite: storeName/storeId identity (sellerName fallback); RowActionMenu "Mark paid" → Modal (transactionId input); Export CSV actionsSlot button; PATCH + CSV fetch mutations; `useQueryClient` invalidation
- `api-endpoints.ts` — added `PAYOUTS_EXPORT: "/api/admin/payouts/export"` to ADMIN_ENDPOINTS

**Files changed (letitrip.in/):**
- `src/app/api/admin/payouts/export/route.ts` — NEW: GET handler, auth admin/moderator, fetches up to 1000 payouts, returns text/csv (id/storeId/storeName/amount/status/transactionId/periodStart/periodEnd/createdAt); storeId/storeName fall back to sellerId/sellerName until ARCH8

**Note:** Seed data still uses sellerId/sellerName. UI will show correct store name once ARCH8 re-seeds payouts with storeId/storeName. Fallback ensures no breakage before ARCH8.

## I3 — Sections seed reset button

**Files changed (appkit/):**
- `AdminSectionsView.tsx` — imports ConfirmDeleteModal + DEMO_ENDPOINTS; `seedResetOpen` state; `resetSeed` mutation (POST DEMO_ENDPOINTS.SEED {action:load,collections:[homepageSections]}); "Reset seed data" outline button in actionsSlot wrapping Div; ConfirmDeleteModal at JSX root

---

# Session 72 — 2026-05-09 (store identity architecture decision)

## ARCH tier — Store identity architecture established

**Decision:** LetiTrip's public-facing identity is the **store**, not the individual seller user. This architectural rule governs all future UI, API, and schema work.

**Rules adopted:**
1. **Public identity** = `storeId` / `storeName` / `storeSlug` — shown in cards, detail pages, reviews, cart, profiles. `sellerId` / `sellerName` are banned from public API responses and client-rendered props.
2. **Admin identity** = may additionally show `ownerId` (display alias for `sellerId`, the Firebase UID of the store owner).
3. **Internal auth** = `sellerId` (Firebase UID) stays in server-only code (checkout, analytics, payout calculation, authorization). Never returned in API responses.
4. **SideDrawer vs Modal rule**: 0 fields → `ConfirmDeleteModal`; 1–2 fields → `Modal`; 3+ fields → `SideDrawer`.
5. **User roles** (public 3-tier): `user` (basic buyer) | `seller` (has ≥1 store) | `admin` (platform admin). `moderator` = internal admin sub-role.

**Tasks created:** ARCH1–ARCH9 (9 new tasks in Tier ARCH of crud-tracker.md).
**Tasks superseded:** M3 → ARCH4; VA13 → ARCH4.
**Current session remaining:** ARCH4 (payouts mark-paid + CSV with store identity) + I3 (seed reset button).

**No code changed in this entry — this is a planning/architecture session entry.**

---

# Session 72 — 2026-05-09 (catalogue release)

## VA3+VA12+RC4 — Categories CRUD fixed + Stores management wired

**Root causes fixed:**
1. `AdminCategoryEditorView.loadCategoryOptions` — was reading `.items` but API returns `.data` array inside successResponse wrapper → fixed response shape parsing
2. `AdminCategoriesView` — no `getRowHref` prop → added, rows now navigate to edit page
3. RC4: `categories/[[...action]]/page.tsx` + `categories/new/page.tsx` + `categories/[id]/edit/page.tsx` coexisted → Next.js "same specificity" build error → deleted `[[...action]]`, created `categories/page.tsx` list page
4. `categories/new/page.tsx` + `[id]/edit/page.tsx` had no `onSaved`/`onDeleted` → added `useRouter` navigation callbacks
5. `AdminStoresView` had no row actions → added `RowActionMenu` with "Manage" → opens `AdminStoreEditorView` SideDrawer
6. `AdminStoreEditorView` didn't exist → built (storeStatus select, adminNotes textarea, isFeatured toggle, PATCH to STORE_BY_ID)
7. `DataTable` + `AdminListingScaffold` had no `renderRowActions` prop → added; `DataTable` renders extra column with action cell (stopPropagation to prevent row navigation conflict)

**Files changed (appkit/):**
- `AdminCategoriesView.tsx` — added `getRowHref` prop
- `AdminCategoryEditorView.tsx` — fixed `loadCategoryOptions` response parsing
- `AdminStoresView.tsx` — added RowActionMenu + AdminStoreEditorView wiring
- `AdminStoreEditorView.tsx` — NEW SideDrawer component
- `DataTable.tsx` — added `renderRowActions` prop + extra column render
- `AdminListingScaffold.tsx` — added `renderRowActions` prop + pass-through to DataTable
- `components/index.ts` + `index.ts` — exported AdminStoreEditorView

**Files changed (src/):**
- `admin/categories/page.tsx` — NEW list page (was [[...action]])
- `admin/categories/[[...action]]/page.tsx` — DELETED (RC4 fix)
- `admin/categories/new/page.tsx` — added useRouter onSaved/onDeleted
- `admin/categories/[id]/edit/page.tsx` — added useRouter + use(params)

**tsc:** 0 errors both repos. **Commits:** 978e1f0 (appkit), 9bb5d3a87 (main)

---

# Session 72 — 2026-05-09

## M1/VA19 — Analytics date range forwarding

**What changed:**
- `src/app/api/admin/analytics/route.ts` — extracts `startDate`/`endDate` from query params and forwards them in the Firebase Function POST body; `handler` signature updated to `({ request })`
- `src/components/admin/AdminAnalyticsClient.tsx` — already existed with date range picker + endpoint wiring (no change needed)
- `AdminAnalyticsView` + charts (`AdminRevenueChart`, `AdminOrdersChart`, `AdminTopProductsTable`) — already wired, no change

**tsc:** 0 errors. **Commit:** a5b2c870f (main)

---

# Session 71 — 2026-05-09 (continued)

## VA8 — AdminSiteSettingsView (12-tab site settings form)

**Files changed (appkit/):**
- `src/features/admin/components/AdminSiteSettingsView.tsx` — NEW: 12-tab settings form; groups: Branding, Appearance, Announcement, SEO, Contact & Social, Watermark, Fees, Integrations, Shipping, Auction Config, Platform Limits, Legal Policies
- `src/features/admin/components/index.ts` — exported `AdminSiteSettingsView`, `AdminSiteSettingsViewProps`
- `src/index.ts` — exported both

**Files changed (src/):**
- `src/app/[locale]/admin/site/page.tsx` — updated to render `AdminSiteSettingsView` (was `AdminSiteView`)
- `src/app/api/admin/site/route.ts` — NEW: GET (getSingleton + credentialsMasked) + PUT (updateSingleton with `z.record(z.string(), z.unknown())` schema)

**Key implementation notes:**
- `useSave` factory pattern — one mutation per tab; each Save button sends only that group's payload
- `MaskedInput` helper — password field with Reveal/Hide toggle for all API keys/secrets
- Native `<input type="color">` for color pickers; `Slider` for watermark size/opacity; plain `<textarea>` for legal HTML
- Fees stored in paise (×100 for threshold + minBidIncrement display)
- Watermark live preview (text only)
- `z.record(z.string(), z.unknown())` — Zod 2-arg form required in newer Zod versions

**tsc:** 0 errors both repos. **Commits:** f931bec (appkit), f1ce1d42d (main)

---

# RC1/RC2 — 2026-05-09

## Navigation centralised + ROUTES completed

### RC1 — `src/constants/navigation.tsx` extended (was: only `MAIN_NAV_ITEMS`)

New exports added:
- `ADMIN_NAV_GROUPS` — admin sidebar (6 groups: Management, Finance, Catalog, Content, Site, System)
- `STORE_NAV_GROUPS` — store sidebar (5 groups: Overview, Listings, Orders, Finance, Store) — added "Orders" group that was previously missing
- `USER_NAV_GROUPS` + `USER_NAV_ALL_ITEMS` — user account sidebar
- `SIDEBAR_SUPPORT_LINKS` — public sidebar Support section (About, Contact, Help)
- `FOOTER_LINK_GROUPS` — all 5 footer columns (Shop, Support, For Sellers, Learn, Legal)

Layout files simplified:
- `src/app/[locale]/admin/layout.tsx` — removed inline `ADMIN_NAV_GROUPS`; imports from config
- `src/app/[locale]/store/layout.tsx` — removed inline `STORE_NAV_GROUPS`; imports from config
- `src/app/[locale]/user/layout.tsx` — removed inline `USER_NAV_GROUPS` + `ALL_NAV_ITEMS`; imports from config

`LayoutShellClient.tsx` simplified:
- `navItems` now maps `MAIN_NAV_ITEMS` + `tNav(key)` (was 9 inline emoji items)
- `sidebarSections` uses `SIDEBAR_SUPPORT_LINKS` from config; **fixed dep array bug** (missing `seedPanelEnabled` + `user?.role`)
- `footer.linkGroups` uses `FOOTER_LINK_GROUPS` from config (removed ~55 inline lines)

### RC2 — New ROUTES constants added to `appkit/src/next/routing/route-map.ts`

| Key | Value |
|-----|-------|
| `ADMIN.EVENTS_NEW` | `/admin/events/new` |
| `ADMIN.EVENTS_EDIT(id)` | `/admin/events/:id/edit` |
| `ADMIN.ADS_NEW` | `/admin/ads/new` |
| `ADMIN.ADS_EDIT(id)` | `/admin/ads/:id/edit` |
| `PUBLIC.SUBLISTING_CATEGORIES` | `/sublisting-categories` |
| `PUBLIC.SUBLISTING_CATEGORY(slug)` | `/sublisting-categories/:slug` |

**0 new TS errors in both repos.**

---

# Session 71 — 2026-05-09

## A5/VA5 — FAQ editor + list wired

**What changed**:
- `appkit/src/features/admin/components/AdminFaqEditorView.tsx` — new FAQ create/edit form: question, answer (RichTextEditor), category, tags, slug (auto from question, faq- prefix), order, priority, visibility toggles (isActive, isPinned, showOnHomepage, showInFooter); create/update/delete via API
- `appkit/src/features/admin/components/AdminFaqsView.tsx` — added `actionHref`/`getRowHref` props
- `src/app/[locale]/admin/faqs/page.tsx` — new dedicated list page
- `src/app/[locale]/admin/faqs/new/page.tsx` — create page
- `src/app/[locale]/admin/faqs/[id]/edit/page.tsx` — edit page
- `src/app/[locale]/admin/faqs/[[...action]]/page.tsx` — deleted (converted to dedicated routes, RC4 partial)
- `src/app/api/admin/faqs/route.ts` — added POST (create FAQ)
- `src/app/api/admin/faqs/[id]/route.ts` — added PATCH alias for PUT
- Seed: no change needed (FAQ seed data shape unchanged)

---

# RC2/RC3 partial — 2026-05-09

## Hardcoded route strings replaced with ROUTES.* constants

**Files changed (src/):**
- `admin/carousel/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/carousel"` → `ROUTES.ADMIN.CAROUSEL`
- `admin/faqs/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/faqs"` + template literal → `ROUTES.ADMIN.FAQS` / `ROUTES.ADMIN.FAQS_EDIT(id)`
- `admin/coupons/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/coupons"` + template literal → `ROUTES.ADMIN.COUPONS` / `ROUTES.ADMIN.COUPONS_EDIT(id)`
- `admin/blog/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/blog"` + template literal → `ROUTES.ADMIN.BLOG` / `ROUTES.ADMIN.BLOG_EDIT(id)`
- `admin/products/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/products"` + template literal → `ROUTES.ADMIN.PRODUCTS` / `ROUTES.ADMIN.PRODUCTS_EDIT(id)`
- `components/user/UserAddressesClient.tsx` — `"/user/addresses/add"` + template literal → `ROUTES.USER.ADDRESSES_ADD` / `ROUTES.USER.ADDRESSES_EDIT(id)`
- `components/user/EditAddressClient.tsx` — `"/user/addresses"` → `ROUTES.USER.ADDRESSES`
- `components/user/AddAddressClient.tsx` — `"/user/addresses"` → `ROUTES.USER.ADDRESSES`
- `components/user/ProfilePageClient.tsx` — `"/user/addresses"` → `ROUTES.USER.ADDRESSES`
- `components/auth/LoginPageClient.tsx` — `"/"` → `ROUTES.HOME`
- `components/auth/RegisterPageClient.tsx` — `"/"` → `ROUTES.HOME`
- `components/routing/CheckoutRouteClient.tsx` — `"/login?returnTo=/checkout"` → `ROUTES.AUTH.LOGIN + returnTo + ROUTES.USER.CHECKOUT`
- `components/routing/CartRouteClient.tsx` — `"/checkout"` → `ROUTES.USER.CHECKOUT`
- `events/[id]/PollInlineClient.tsx` — `<a href="/login">` → `<Link href={ROUTES.AUTH.LOGIN}>`
- `events/[id]/participate/EventParticipateClient.tsx` — `<a href="/login">` → `<Link href={ROUTES.AUTH.LOGIN}>`

**Files changed (appkit/):**
- `features/events/components/EventPollWidget.tsx` — `href="/login"` → `href={ROUTES.AUTH.LOGIN}`

**Remaining (not fixed here):**
- `CartRouteClient.tsx`: `<Button onClick={() => router.push(ROUTES.USER.CHECKOUT)}>` — still a Button-navigates violation; deferred to full RC3 `asChild` sweep
- `RC2` route-map additions (`SUBLISTING_*`, `SEARCH(q)`) — no current consumers, deferred

**0 TS errors both repos after these changes.**

---

# Hotfix — 2026-05-09

## Build error: Next.js "same specificity" route collision in `/admin/products`

**Error**: `You cannot define a route with the same specificity as a optional catch-all route ("/[locale]/admin/products" and "/[locale]/admin/products[[...action]]")`

**Root cause**: After Session 69 added dedicated `products/page.tsx`, `products/new/page.tsx`, and `products/[id]/edit/page.tsx`, the old stub `products/[[...action]]/page.tsx` was left in place. The `[[...action]]` can match the root path `/admin/products`, which collides with the explicit `page.tsx` at that level.

**Fix**: Deleted `src/app/[locale]/admin/products/[[...action]]/page.tsx` (and its directory). The wired list page at `products/page.tsx` (`AdminProductsView` with `actionHref` + `getRowHref`) is the correct implementation.

**Audit result**: Only `products` had this conflict. Other areas using `[[...action]]` (blog, coupons, carousel, categories, bids, orders, reviews, sections, users) do **not** have a sibling root `page.tsx` — they are unaffected. RC4 full audit remains ⏳.

---

# Change Log — Session 70 — 2026-05-08 (Latest)

## A3/VA6 — AdminCouponEditorView

**Files changed:**
- `appkit/src/features/admin/components/AdminCouponEditorView.tsx` — NEW: create/edit coupon form; conditional discount fields per type (percentage/fixed/free_shipping/buy_x_get_y); POST/PATCH via ADMIN_ENDPOINTS.COUPONS
- `appkit/src/features/admin/components/AdminCouponsView.tsx` — added `actionHref` + `getRowHref` props, passed through to `AdminListingScaffold`
- `appkit/src/features/admin/components/index.ts` — exported `AdminCouponEditorView`, `AdminCouponEditorViewProps`
- `appkit/src/index.ts` — exported both near `AdminCouponsView`
- `src/app/[locale]/admin/coupons/[[...action]]/page.tsx` — wired `actionHref` + `getRowHref`
- `src/app/[locale]/admin/coupons/new/page.tsx` — NEW
- `src/app/[locale]/admin/coupons/[id]/edit/page.tsx` — NEW

**tsc:** 0 errors both repos. **Commits:** bef6a00 (appkit), ae7c81824 (main)

---

## A4/VA4 — AdminBlogEditorView

**Files changed:**
- `appkit/src/features/admin/components/AdminBlogEditorView.tsx` — NEW: create/edit blog post form; RichTextEditor for content; auto-computed readTimeMinutes; POST/PATCH via ADMIN_ENDPOINTS.BLOG
- `appkit/src/features/admin/components/AdminBlogView.tsx` — added `actionHref` + `getRowHref` props
- `appkit/src/features/admin/components/index.ts` — exported `AdminBlogEditorView`, `AdminBlogEditorViewProps`
- `appkit/src/index.ts` — exported both near `AdminBlogView`
- `src/app/[locale]/admin/blog/[[...action]]/page.tsx` — wired `actionHref` + `getRowHref`
- `src/app/[locale]/admin/blog/new/page.tsx` — NEW
- `src/app/[locale]/admin/blog/[id]/edit/page.tsx` — NEW

**tsc:** 0 errors both repos. **Commits:** 118e978 (appkit), 4efbfb531 (main)

---

# Change Log — Session 67-b — 2026-05-08

## HS5 — CustomCardsSection component + wiring

**Files changed:**
- `appkit/src/features/homepage/components/CustomCardsSection.tsx` — NEW: renders `cards[]` per layout (grid/row/masonry); `autoScroll` wraps in `SectionCarousel`; each card: image via `MediaImage`, eyebrow, title, body, buttons (variant-styled anchors), formEmbed iframe; bg/text color applied via inline style from CMS-configured CSS token values
- `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` — add `case "custom-cards"` to renderSection switch

**tsc:** 0 errors both repos. **Commit:** bc92ad8 (appkit)

---

## HS4 — Google Business Reviews integration

**Files changed:**
- `appkit/src/features/homepage/lib/google-reviews-fetcher.ts` — NEW: `fetchGoogleReviews(placeId, apiKey, maxReviews, minRating)` calls Google Places API v1, filters/slices reviews, `revalidate: 3600`
- `appkit/src/features/homepage/components/GoogleReviewsSection.tsx` — NEW: async RSC; reads `googleMapsApiKey` + `googlePlaceId` from site_settings; renders review cards (avatar, star rating, date, text, Google logo badge); grid/carousel layout; not-configured empty state
- `appkit/src/server.ts` — export `fetchGoogleReviews`, `GoogleReview`, `GoogleReviewsResult`
- `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` — add `case "google-reviews"` to renderSection switch
- `src/app/api/social-feed/google-reviews/route.ts` — NEW: `GET ?placeId&maxReviews&minRating`; proxy to Google Places API; returns `{ error: "not-configured" }` when key absent; `revalidate: 3600`

**Note (HS4-D):** User requested GoogleReviewsSection also available per-store on store About page — logged as new task HS4-E in tracker.

**tsc:** 0 errors both repos. **Commit:** cb55b7b (appkit), 12b15257f (main)

---

# Change Log — Session 69 (continued-3) — 2026-05-08

## I1 — InlineCreateSelect wired into admin product + category editors

### What changed

| What | File |
|------|------|
| New `CategoryQuickCreateForm` — lightweight form (name, description, isActive); POSTs to `/api/admin/categories`; calls `onSaved(id, name)` | `appkit/src/features/admin/components/CategoryQuickCreateForm.tsx` |
| New `BrandQuickCreateForm` — lightweight form (name, description, isActive); POSTs to `/api/admin/brands`; calls `onSaved(id, name)` | `appkit/src/features/admin/components/BrandQuickCreateForm.tsx` |
| `AdminProductEditorView`: added `renderCategorySelector` + `renderBrandSelector` render props to `ProductForm` — each renders `InlineCreateSelect` with async load + quick-create mini-form in SideDrawer | `appkit/src/features/admin/components/AdminProductEditorView.tsx` |
| `AdminCategoryEditorView`: replaced native `<select>` for parentId with `InlineCreateSelect` + `CategoryQuickCreateForm`; removed `rootCategoriesQuery` (was fetching all root categories upfront) | `appkit/src/features/admin/components/AdminCategoryEditorView.tsx` |
| Exported `CategoryQuickCreateForm`, `BrandQuickCreateForm` + types | `appkit/src/features/admin/components/index.ts`, `appkit/src/index.ts` |

### Notes
- Store selector stays `DynamicSelect` (no store quick-create form exists yet — stores require owner assignment and store-address setup).
- `InlineCreateSelect` injects `+ Create new <Label>` sentinel at bottom of each dropdown page; selecting it opens a `SideDrawer` with the mini-form.
- `tsc --noEmit` passes 0 errors in both repos.

---

# Change Log — Session 69 (continued-2) — 2026-05-08

## VA2 — Product flag quick-toggles + isOnSale/isSold schema

### What changed

| What | File |
|------|------|
| Added `isOnSale?: boolean` and `isSold?: boolean` to `ProductDocument`; added to `DEFAULT_PRODUCT_DATA`, `PRODUCT_INDEXED_FIELDS`, `PRODUCT_PUBLIC_FIELDS`, `PRODUCT_UPDATABLE_FIELDS` | `appkit/src/features/products/schemas/firestore.ts` |
| Added `isOnSale?: boolean` and `isSold?: boolean` to `ProductItem` | `appkit/src/features/products/types/index.ts` |
| Extended `AdminListingScaffoldRow` with 4 optional flag fields: `featured`, `isPromoted`, `isOnSale`, `isSold` | `appkit/src/features/admin/components/AdminListingScaffold.tsx` |
| `AdminProductsView`: maps 4 flags from API; `overrides` state for optimistic updates; "Flags" column with 4 `Toggle size="sm"` per row; `stopPropagation` prevents row-nav on toggle click; `PATCH` on change with toast on error | `appkit/src/features/admin/components/AdminProductsView.tsx` |
| Fixed PATCH schema: `isFeatured` → `featured`; added `isOnSale`, `isSold` | `src/app/api/admin/products/[id]/route.ts` |

### Notes
- Seed data unchanged — `isOnSale`/`isSold` are optional with `false` defaults; existing documents unaffected.
- `tsc --noEmit` passes 0 errors in both repos.

---

# Change Log — Session 69 (continued) — 2026-05-08

## A1 — Admin Products 3-mode editor

### What changed

| What | File |
|------|------|
| New `AdminProductEditorView` — `Tabs` mode selector (Standard/Auction/Pre-order), `storeId` `DynamicSelect` searching `/api/admin/stores`, wraps `ProductForm`, `useToast`, GET+PATCH+POST via `ADMIN_ENDPOINTS` | `appkit/src/features/admin/components/AdminProductEditorView.tsx` |
| Added `actionHref?: string` and `getRowHref?` props; passed through to `AdminListingScaffold` | `appkit/src/features/admin/components/AdminProductsView.tsx` |
| Exported `AdminProductEditorView` + type | `appkit/src/features/admin/components/index.ts`, `appkit/src/index.ts` |
| Replaced `[[...action]]` catch-all with dedicated list page; `actionHref=/admin/products/new`, `getRowHref` for edit links | `src/app/[locale]/admin/products/page.tsx` |
| New create page — `AdminProductEditorView`; redirects to edit page on save | `src/app/[locale]/admin/products/new/page.tsx` |
| New edit page — `AdminProductEditorView` with `productId`; redirects to list on save/delete | `src/app/[locale]/admin/products/[id]/edit/page.tsx` |

### Notes
- `ProductForm` is reused unchanged — no seller-side form regression possible.
- `storeId` DynamicSelect fetches stores by name; sets `storeId` + `sellerName` from the selected store.
- Mode tabs translate to `isAuction`/`isPreOrder` flags that `ProductForm` already consumes to show/hide auction and pre-order sections.
- `npx tsc --noEmit` passes 0 errors in both repos.

---

# Change Log — Session 69 — 2026-05-08

## X2 — Toast standardisation in admin editor components

### What changed

| What | File |
|------|------|
| Added `useToast`; removed `saveMessage` state + validation Alert JSX; wired `showToast` on save success/error/blocked | `appkit/src/features/admin/components/AdminAdEditorView.tsx` |
| Added `useToast`; removed `errorMsg`/`successMsg` state + Alert JSX in sections; wired `showToast` on save/delete success+error | `appkit/src/features/admin/components/AdminBrandEditorView.tsx` |
| Added `useToast`; removed `errorMsg`/`successMsg` state + Alert JSX in sections; wired `showToast` on save/delete success+error | `appkit/src/features/admin/components/AdminCategoryEditorView.tsx` |
| Added `useToast`; removed `saveMessage` state + inline Alert block + `setSaveMessage(null)` calls; loading/error Alerts kept | `appkit/src/features/admin/components/AdminFeatureFlagsView.tsx` |
| Added `useToast`; removed `saveMessage` state + inline Alert block + `setSaveMessage(null)` calls; loading/error Alerts kept | `appkit/src/features/admin/components/AdminNavigationView.tsx` |

### Notes
- `AdminSectionsView` was already using `useToast` — no change needed.
- Loading and error `Alert` components (from `useSiteSettings`) in `AdminFeatureFlagsView` and `AdminNavigationView` were intentionally preserved.
- `npx tsc --noEmit` in `appkit/` passes with 0 errors.

---

# Change Log — Session 68 (continued-2) — 2026-05-08

## Doc sync — media filename slug patterns + ID type corrections in prompt.md and CLAUDE.md

### What changed

| What | File |
|------|------|
| SLUG PREFIX REGISTRY: fixed wrong examples for reviews/orders/bids/payouts (were showing invented IDs, now show generator output format) | `prompt.md` |
| "System-generated IDs" footnote replaced with correct 3-way split: pure slugs / semantic generator IDs / true Firestore auto-IDs | `prompt.md` |
| New "MEDIA FILENAME SLUG PATTERNS" section added — 19-row table covering all `generateMediaFilename` context types with pattern + example | `prompt.md` |
| Slug prefix table: added missing rows (carousel slides, orders, bids, payouts, notifications); fixed review example | `CLAUDE.md` |
| `id === slug` note replaced with 3-way split matching prompt.md (pure slugs / semantic / auto-IDs) | `CLAUDE.md` |
| New "Media Filename Slug Patterns" section added (compact 3-column table matching prompt.md) | `CLAUDE.md` |

### Notes
- Source of truth for all media patterns is `generateMediaFilename()` in `appkit/src/utils/id-generators.ts`.
- No code changes — documentation only.

---

# Change Log — Session 68 (continued) — 2026-05-08

## SeedPanel — featureFlag-gated live-server support + schema documentation

### What changed

| What | File |
|------|------|
| `seedPanel: boolean` added to `SiteSettingsDocument.featureFlags` type | `appkit/src/features/admin/schemas/firestore.ts` |
| `seedPanel: false` in schema defaults, `true` in seed data | `appkit/src/seed/site-settings-seed-data.ts` |
| `seedPanel: z.boolean()` added to featureFlags Zod update schema | `src/validation/request-schemas.ts` |
| GET + POST `/api/demo/seed` — `NODE_ENV !== "development"` replaced with `featureFlags.seedPanel` check | `src/app/api/demo/seed/route.ts` |
| Root layout fetches siteSettings, passes `seedPanelEnabled` to shell | `src/app/[locale]/layout.tsx` |
| Shell — `seedPanelEnabled` prop; nav + devSlot gated on flag + admin role; label → "Seed & Docs" | `src/app/[locale]/LayoutShellClient.tsx` |
| Demo layout upgraded to `ProtectedRoute(requireRole="admin")` | `src/app/[locale]/demo/layout.tsx` |
| SeedPanel reframed as admin data management + documentation panel | `src/components/dev/SeedPanel.tsx` |
| Media slug patterns table added per collection (type / pattern / example) | `src/components/dev/SeedPanel.tsx` |
| Slug pattern fixes — bids/orders/reviews/payouts were wrong `auto-ID` | `src/components/dev/SeedPanel.tsx` |
| SP1 task ✅; summary counts updated | `crud-tracker.md` |

### Notes
- Default `false` in schema, `true` in seed — so new installs start disabled; seeded envs get it on automatically.
- API security: flag check server-side. Role check: page-level `ProtectedRoute` (consistent with all admin pages).
- appkit rebuilt after type change.

### TypeScript
`npx tsc --noEmit` → 0 errors in both repos.

---

# Change Log — Session 68 — 2026-05-07

## Listing toggles (Show Sold / Show Ended / Show Closed) + sort cleanup + auction winner masking

### What changed

| What | File |
|------|------|
| **Products**: `showSold` toggle in toolbar; default passes `status=published` (hides sold items); toggle ON removes status filter | `appkit/src/features/products/components/ProductsIndexListing.tsx` |
| **Auctions**: `showEnded` toggle in toolbar; default passes `dateFrom=now` so only `auctionEndDate >= now` (live auctions); toggle ON removes dateFrom constraint | `appkit/src/features/products/components/AuctionsIndexListing.tsx` |
| **Pre-orders**: `showClosed` toggle in toolbar; default passes `status=published` (hides archived/closed); toggle ON removes status filter | `appkit/src/features/pre-orders/components/PreOrdersIndexListing.tsx` |
| **Auction sort options** replaced with symmetric pairs: Ending Soonest/Latest, Bid Low–High/High–Low, Newly Listed/Oldest Listed | `appkit/src/features/products/components/AuctionsIndexListing.tsx` |
| **Pre-order sort options** extended: Oldest First + Delivery Furthest added | `appkit/src/features/pre-orders/components/PreOrdersIndexListing.tsx` |
| **Product public sort options** extended: Oldest First + Title Z–A added | `appkit/src/features/products/components/ProductFilters.tsx` |
| **Auction card**: "Current bid" → "Winning bid" when `isEnded && hasCurrentBid`; optional masked `winnerDisplayName` shown below winning bid | `appkit/src/features/auctions/components/MarketplaceAuctionCard.tsx` |
| `winningBid` + `wonBy` labels; `maskDisplayName()` util; `winnerDisplayName?` field on card data | `appkit/src/features/auctions/components/MarketplaceAuctionCard.tsx` |
| `winnerDisplayName?: string` added to `ProductItem` | `appkit/src/features/products/types/index.ts` |

### Notes
- `winnerDisplayName` UI wired but data not yet populated — requires repo to denormalize winning bidder name onto product document. Deferred.
- Toggles live in toolbar `extra` slot (same row as sort dropdown), not the filter drawer.
- Auction "ended" is time-based (`auctionEndDate >= now`), matching card-level countdown logic.

### TypeScript
`npx tsc --noEmit` → 0 errors in both `appkit/` and `letitrip.in/`.

---

# Change Log — Session 67 (continued) — 2026-05-07

## React Query SSR hydration fix — staleTime across all listing hooks

### Root cause

React Query's default `staleTime: 0` causes an immediate background refetch on mount even when `initialData` is already present from SSR. The client-side refetch hits a different code path (API route) than the server-side `productRepository.list()` call, which can return empty data. This overwrote the SSR data, causing listings to flash content then go blank (most visible on the store auctions tab).

### Fix

Added `staleTime: opts?.staleTime ?? (opts?.initialData !== undefined ? Infinity : 0)` to all hooks that accept `initialData`. When the server provides data the client skips the redundant refetch on mount; when the user changes filters/sort/page the `queryKey` changes and a fresh fetch fires normally.

### What changed

| What | File |
|------|------|
| `staleTime` option + conditional in `useProducts` (list) and `useProduct` (single) | `appkit/src/features/products/hooks/useProducts.ts` |
| `staleTime` option + conditional in `useStores` | `appkit/src/features/stores/hooks/useStores.ts` |
| `staleTime` option + conditional in `useAuctions` (NOT `useAuctionBids` — that has intentional `refetchInterval: 15s`) | `appkit/src/features/auctions/hooks/useAuctions.ts` |
| `staleTime` option + conditional in `useEvents` | `appkit/src/features/events/hooks/useEvents.ts` |
| `staleTime` option + conditional in `useBlogPosts` and `useBlogPost` | `appkit/src/features/blog/hooks/useBlog.ts` |
| `staleTime` option + conditional in `useReviews` | `appkit/src/features/reviews/hooks/useReviews.ts` |
| `staleTime` changed from hardcoded `5 * 60 * 1000` to `Infinity` when `initialData` present | `appkit/src/features/faq/hooks/useFaqList.ts` |
| Rule #3 added — "schema/logic changes must update older functionality in same session" | `CLAUDE.md` |

### TypeScript

`npx tsc --noEmit` → 0 errors in `appkit/`.

---

# Change Log — Session 66 — 2026-05-07

## Session 66 — HS1 + HS2 + HS3: Homepage Sections schema + all builders + resource builder enhancements

### What changed

| What | File |
|------|------|
| **HS1**: `custom-cards` + `google-reviews` added to `SectionType`, `SectionConfig`, `DEFAULT_SECTION_ORDER`; `CustomCardsSectionConfig` + `GoogleReviewsSectionConfig` interfaces; `sortBy/filterByCategory/maxCount/loop` added to 5 resource configs; `googleMapsApiKey/googlePlaceId` added to `SiteSettingsCredentials`; `"carousel"/"social-feed"/"custom-cards"/"google-reviews"` added to POST Zod enum | `appkit/src/features/homepage/schemas/firestore.ts`, `appkit/src/features/admin/schemas/firestore.ts`, `src/app/api/admin/sections/route.ts` |
| **HS2**: 11 new section builders (welcome, trust-indicators, categories, brands, banner, features, reviews, whatsapp-community, faq, blog-articles, newsletter) — all with typed state, defaults, build/parse functions, and render functions; `SUPPORTED_TYPED_BUILDERS` extended to 18 types | `appkit/src/features/admin/components/AdminSectionsView.tsx` |
| **HS3**: Unified `ResourceSortBy` + `ResourceMaxCount` type aliases; 5 resource builder interfaces (products/auctions/pre-orders/stores/events) extended with `filterByCategory/maxCount/loop`; `RESOURCE_SORT_OPTIONS` constant; sort/filter/maxCount/loop UI controls added to all 5 render functions; `useToast` replaces `Alert`+`formMessage` state; reviews builder: source radio (platform/google) + conditional placeId input; `ReviewsSectionConfig` extended with `source?` + `placeId?` | `appkit/src/features/admin/components/AdminSectionsView.tsx`, `appkit/src/features/homepage/schemas/firestore.ts` |

---

## Session 66 — P10 SeedPanel Phase D (style + schema metadata + search + streaming + sticky toolbar)

### What changed

| What | File |
|------|------|
| Fixed invisible card labels — replaced appkit `Text` with native `<span>`/`<p>` so Tailwind color classes aren't overridden | `src/components/dev/SeedPanel.tsx` |
| Stats always visible — removed `status.length > 0` guard; shows `—` while loading | `src/components/dev/SeedPanel.tsx` |
| Schema field metadata table per collection — real `FieldDef[]` from appkit Firestore schemas; type chip, searchable/filterable/sortable/PII/indexed columns; field-level search + PII-only toggle | `src/components/dev/SeedPanel.tsx` |
| Search + filter + sort + pagination — `searchQuery`, `filterGroup`, `filterStatus`, `sortBy`; `useMemo` filtered list; PAGE_SIZE=8; flat list when filtered, grouped when not; pagination bar | `src/components/dev/SeedPanel.tsx` |
| Single streaming POST replaces N sequential calls — `application/x-ndjson` response; NDJSON line-per-collection; client `ReadableStream.getReader()` loop; removed 15s polling interval | `src/components/dev/SeedPanel.tsx`, `src/app/api/demo/seed/route.ts` |
| Sticky toolbar — `sticky top-[var(--header-height,0px)] z-30 backdrop-blur-md shadow-sm`; contains all interactive controls; scrollable content below; offset tracks AppLayoutShell header dynamically | `src/components/dev/SeedPanel.tsx` |

### Rules reinforced

- Added **"STOP AND ASK"** rule to `crud-tracker.md` Non-Negotiable Rules — Claude must ask user before making any autonomous implementation decision.
- Added **"⚠️ done-but-verify"** status note — acknowledges that some ✅ tasks have browser regressions being fixed in parallel sessions.
- Created `CLAUDE.md` with full project reference — seed schema, stop-and-ask rule, and appkit patterns — loaded automatically by Claude Code in every future conversation.

---

# Change Log — Session 2026-05-07 (Previous)

---

## Session 65 — Carousel (CF1)

### Part 66 — CF1: Hero Carousel full redesign

| What | File |
|------|------|
| `CarouselBackground` type (image/video/color/gradient + dimOverlay); `CarouselCard` with zone 1–6, mobileZone, hover, eyebrow, textAlign, href buttons; `settings` (height/autoplayDelayMs); `CarouselSectionConfig` fixes P20 tech debt | `appkit/src/features/homepage/schemas/firestore.ts` |
| `CarouselSlide` + `CarouselSlideCard` types updated to match new schema; backward-compat aliases kept | `appkit/src/features/homepage/types/index.ts` |
| `HeroCarousel`: full-height (viewport/tall/medium), unified 4-type background renderer, zone→grid mapping, per-slide autoplay delay, configurable hover, no blur | `appkit/src/features/homepage/components/HeroCarousel.tsx` |
| `AdminCarouselView`: actionHref `/admin/carousel/new`, drag-reorder via HTML5 DnD + batch reorder API, thumbnail preview, RowActionMenu with Edit/Delete | `appkit/src/features/admin/components/AdminCarouselView.tsx` |
| NEW `AdminCarouselEditorView`: 4 sections — Slide Info, Background (4-tab), Overlay text, Cards (0–2 with zone picker + hover) | `appkit/src/features/admin/components/AdminCarouselEditorView.tsx` |
| `CAROUSEL`, `CAROUSEL_BY_ID`, `CAROUSEL_REORDER` added to `ADMIN_ENDPOINTS` | `appkit/src/constants/api-endpoints.ts` |
| Carousel seed migrated to CF1 background/zone schema | `appkit/src/seed/carousel-slides-seed-data.ts` |
| `as unknown as SectionConfig` cast removed; proper `CarouselSectionConfig` used | `appkit/src/seed/homepage-sections-seed-data.ts` |
| GET+POST `/api/admin/carousel` | `src/app/api/admin/carousel/route.ts` |
| GET+PUT+DELETE `/api/admin/carousel/[id]` | `src/app/api/admin/carousel/[id]/route.ts` |
| POST `/api/admin/carousel/reorder` | `src/app/api/admin/carousel/reorder/route.ts` |
| New slide page | `src/app/[locale]/admin/carousel/new/page.tsx` |
| Edit slide page | `src/app/[locale]/admin/carousel/[id]/edit/page.tsx` |

---

## Session 64 — Infrastructure (SL4 + E6)

### Part 65 — E6: /support Help Centre page

| What | File |
|------|------|
| New `/support/page.tsx` — reuses `HelpPageView`; full og:/twitter metadata via `generateMetadata` | `src/app/[locale]/support/page.tsx` |
| Added `ROUTES.PUBLIC.SUPPORT = "/support"` to appkit route-map | `appkit/src/next/routing/route-map.ts` |

### Part 64 — SL4: generateMetadata + full social share preview for all page types

| What | File |
|------|------|
| `LETITRIP_SEO` config + typed wrapper functions (`generateMetadata`, `generateProductMetadata`, `generateBlogMetadata`, `generateAuctionMetadata`, `generateCategoryMetadata`, `generateProfileMetadata`, `generateSearchMetadata`) | `src/constants/seo.server.ts` |
| Static og:/twitter metadata on all 10 listing pages (home, products, auctions, pre-orders, stores, categories, brands, blog, events, faqs) | 10 page.tsx files |
| Real-data `generateMetadata` on `products/[slug]` via `getProductById` | `products/[slug]/page.tsx` |
| Real-data `generateMetadata` on `auctions/[id]` via `getProductById` | `auctions/[id]/page.tsx` |
| Real-data `generateMetadata` on `pre-orders/[id]` via `getProductById` | `pre-orders/[id]/page.tsx` |
| `generateMetadata` on store layout via `getStoreBySlug` | `stores/[storeSlug]/layout.tsx` |
| `generateMetadata` on `categories/[slug]` via `getCategoryBySlug` + coverImage | `categories/[slug]/page.tsx` |
| `generateMetadata` on `brands/[slug]` via `getBrandBySlug` + logoURL | `brands/[slug]/page.tsx` |
| Enhanced event detail from title-only → full og:image + twitter:card | `events/[id]/page.tsx` |
| `generateMetadata` on `faqs/[category]` from category param | `faqs/[category]/page.tsx` |
| New `getBrandBySlug()` server action; `BrandsRepository.findBySlug` wrapped and exported from `@mohasinac/appkit` and `@mohasinac/appkit/server` | `appkit/src/features/brands/actions/brand-actions.ts`, `brands/server.ts`, `index.ts`, `server.ts` |

---

## Session 60 — Foundation fixes (E2, J12 + audit of F2/J10/J11/K4/X1/SL5/E7)

### New commits

| Task | What | File |
|------|------|------|
| **E2** | Added `export const DELETE` to admin bids route — admin-only, checks bid exists, calls `bidRepository.delete(id)` | `src/app/api/admin/bids/[id]/route.ts` |
| **J12** | Added `style={{ zIndex: 'var(--appkit-z-dropdown)' }}` to the absolute-positioned inline search dropdown so it renders above hero sections | `appkit/src/features/search/components/Search.tsx` |

### Confirmed already done (tracker corrected)

| Task | Finding |
|------|---------|
| **F2** | `ADMIN_NAV_GROUPS` already has `{ href: ROUTES.ADMIN.BRANDS, label: "Brands" }` in Catalog section (Part 57 did this; tracker note was wrong) |
| **J11** | `ProductDetailPageView` already uses `ROUTES.PUBLIC.STORE_DETAIL(storeSlug)` as the seller href — no user profile redirect |
| **K4+L3+L4+L5** | `EventDetailClient.tsx` already renders `<RichText html={description} />` — tracker audit was incorrect |
| **X1** | Both repos pass `npx tsc --noEmit` with 0 errors — no changes needed |
| **J10** | `AuctionDetailPageView` correctly passes `product.id` (doc ID = slug) as `productId` — code is fine; seed data (P17) must use matching slugs |
| **SL5** | All API route handlers pass slug params unchanged to repository — no stripping or re-prefixing found |
| **E7** | All footer links in `LayoutShellClient.tsx` resolve to existing pages — no dead links |

---

## Part 57 — F2: Brands entity (Firestore schema, repository, API routes, admin CRUD)

### What changed

| File | Change |
|------|--------|
| `appkit/src/features/brands/schemas/index.ts` | NEW — BrandDocument, BrandCreateInput, BrandUpdateInput, BRAND_FIELDS |
| `appkit/src/features/brands/repository/brands.repository.ts` | NEW — BrandsRepository with list/findBySlug/findActive/create/update/delete |
| `appkit/src/repositories/index.ts` | Added brandsRepository export |
| `appkit/src/index.ts` | Exported brandsRepository, BrandDocument types |
| `appkit/src/features/admin/components/AdminBrandsView.tsx` | NEW — list page with active/inactive filter |
| `appkit/src/features/admin/components/AdminBrandEditorView.tsx` | NEW — create/edit form with slug auto-generation |
| `appkit/src/constants/api-endpoints.ts` | Added ADMIN_ENDPOINTS.BRANDS + BRAND_BY_ID |
| `src/app/api/admin/brands/route.ts` | NEW — GET (list) + POST (create) |
| `src/app/api/admin/brands/[id]/route.ts` | NEW — GET/PUT/DELETE |
| `src/app/api/brands/route.ts` | NEW — Public GET (active brands for homepage) |
| `src/app/[locale]/admin/brands/page.tsx` | NEW — list page |
| `src/app/[locale]/admin/brands/new/page.tsx` | NEW — create page |
| `src/app/[locale]/admin/brands/[id]/edit/page.tsx` | NEW — edit page |
| `src/app/[locale]/admin/layout.tsx` | Added "Brands" to Catalog nav group |
| `src/constants/api.ts` | Added BRANDS + ADMIN.BRANDS/BRAND_BY_ID routes |

---

## Part 56 — E1+E5: Route constants for new CRUD pages + TypeScript input types

### What changed

| File | Change |
|------|--------|
| `appkit/src/next/routing/route-map.ts` | ADMIN: PRODUCTS/CATEGORIES/BRANDS/FAQS/COUPONS/BLOG/CAROUSEL NEW+EDIT, ORDER_DETAIL; STORE: AUCTIONS/PRE_ORDERS/COUPONS_EDIT/TEMPLATES/ORDER_DETAIL |
| `src/types/input-types.ts` | NEW — 12 Create/Update input type interfaces for Category, Brand, Coupon, BlogPost, FAQ, CarouselSlide, User, Order, Store, Review, StoreProfile, Shipping, PayoutSettings |

---

## Part 55 — E3+E4: Field-name constants + comprehensive API route constants

### What changed

| File | Change |
|------|--------|
| `src/constants/field-names.ts` | Added `CATEGORY_FIELDS`, `BLOG_FIELDS`, `USER_FIELDS` (with ROLE_VALUES); added `COUPON_FIELDS.SCOPE_VALUES` |
| `src/constants/index.ts` | Re-exported `CATEGORY_FIELDS`, `BLOG_FIELDS`, `USER_FIELDS` |
| `src/constants/api.ts` | Full rewrite — expanded `API_ROUTES` with ~45 ADMIN/STORE/USER route entries |

---

## Part 54 — E2: Missing [id] API route handlers

### What changed

| File | Change |
|------|--------|
| `src/app/api/admin/reviews/[id]/route.ts` | NEW — GET/PATCH/DELETE (approve, reject, feature, delete reviews) |
| `src/app/api/admin/bids/[id]/route.ts` | NEW — GET/PATCH (cancel bid) |
| `src/app/api/admin/contact-submissions/[id]/route.ts` | NEW — GET/PATCH (mark read/resolved)/DELETE |
| `src/app/api/admin/faqs/[id]/route.ts` | NEW — GET/PUT/DELETE |
| `src/app/api/admin/newsletter/[id]/route.ts` | FIXED — was incorrectly using FAQ code; now correct GET + new DELETE (unsubscribe) |
| `src/app/api/store/orders/[id]/route.ts` | NEW — GET/PATCH (seller-scoped, status+tracking update) |
| `src/app/api/store/coupons/[id]/route.ts` | NEW — GET/PATCH/DELETE (seller-scoped with admin override) |
| `src/app/api/user/notifications/route.ts` | NEW — GET (paginated list + unread count) |
| `src/app/api/user/notifications/[id]/route.ts` | NEW — GET/PATCH (mark read)/DELETE |
| `src/app/api/user/notifications/read-all/route.ts` | NEW — POST (mark all read) |

---

## Part 53 — K2/K3/K4: RichTextRenderer + rich text wiring in FAQ, store bio

### What changed

| File | Change |
|------|--------|
| `appkit/src/ui/rich-text/RichTextRenderer.tsx` | New SSR-safe component — renders HTML with prose classes via dangerouslySetInnerHTML; no "use client" so works in Server Components |
| `appkit/src/ui/index.ts` | Exported `RichTextRenderer` + type |
| `appkit/src/index.ts` | Exported `RichTextRenderer` + type |
| `appkit/src/client.ts` | Exported `RichTextRenderer` + type |
| `appkit/.../FAQPageView.tsx` | FAQ answers now render via `RichTextRenderer` instead of plain `<Text>` |
| `appkit/.../StoreAboutView.tsx` | Store bio now renders via `RichText` instead of `<Text whitespace-pre-line>` |

### Why
K2: `RichText` is client-only; Server Component pages need an SSR-safe renderer for CMS HTML content. K4: Blog/events already used `RichText`; FAQs and store bio were plain text — now render formatted HTML.

---

## Part 52 — M2: Admin dashboard real revenue + pending counts

### What changed

| File | Change |
|------|--------|
| `src/app/api/admin/dashboard/route.ts` | Adds `totalRevenue` (sum of delivered order `totalPrice`), `pendingOrders` (findPending count), `pendingReviews` (findPending count) |
| `appkit/.../AdminDashboardView.tsx` | Maps `revenue.total`, `orders.pending`, `reviews.pending` from API into `DashboardStats` |

### Why
Dashboard stat cards showed 0 revenue and no pending counts — API only returned totals, not revenue sum or pending status breakdowns.

---

## Part 51 — J8: Ad slots render conditionally from admin-configured ads

### What changed

| File | Change |
|------|--------|
| `src/app/api/ads/route.ts` | New public GET `/api/ads?slot=<slotId>` — returns highest-priority active ad from `siteSettings.adSettings.inventory` for the given slot/placement ID |
| `src/constants/api.ts` | Added `API_ROUTES.ADS.BY_SLOT` |
| `src/app/api/admin/ads/validation.ts` | `defaultPlacements()` IDs aligned with `AdSlotId` values (`homepage-hero-banner` etc.) |
| `appkit/.../hooks/useActiveAd.ts` | New `useActiveAd(slotId)` hook — fetches from `/api/ads?slot=` on client side |
| `appkit/.../components/AdSlot.tsx` | `AdSlot` now calls `useActiveAd` when no `manualContent` prop; renders `ManualAdBanner` from ad creative if found; null if none |
| `appkit/src/client.ts` | Exported `useActiveAd`, `ActiveAdRecord`, `ActiveAdCreative` |
| `appkit/.../homepage/index.ts` | Exported `useActiveAd` and types |
| `src/components/homepage/AdSlots.tsx` | `AfterHeroAdSlot` etc. now use `<AdSlot id="...">` instead of hard-returning null |

### Why
J8 bug: all 4 homepage ad slot components permanently returned null even after Part 37. The fix makes ad rendering data-driven — admin can activate any ad from the CMS and it will appear in the correct slot without a code deploy.

---
