# Firestore Composite Index Audit

> Generated 2026-08-17. Source of truth audited: `appkit/firebase/base/firestore.indexes.json` (537 composite indexes across 69 collections). Every index below was cross-referenced against live query code in `appkit/src/**` repositories, `src/app/api/**` routes, `appkit/src/_internal/server/functions|jobs/**`, and `functions/src/**` (Firebase Functions), by 6 parallel research passes.
>
> **This file is a research artifact, not yet acted on.** No index has been deleted and no code has been changed. See "Recommended Actions" at the bottom for what to do next — nothing here should be applied without a decision from the team, per CLAUDE.md Rule #1.
>
> **Verdict legend**
> - **KEEP** — a live query/sort/filter combination was found that requires exactly this composite index. Evidence cited as `file:line`.
> - **TRIM-CANDIDATE** — no matching query was found anywhere in the searched surface. Either the code path is dead (repository method never called, whole collection unused, superseded by a migration) or the UI control that would drive it is wired to a field name that doesn't actually exist in the schema/sieve config (a **bug**, called out separately).
> - **UNSURE** — partial evidence; a plausible code path exists (e.g. field is `canFilter`/`canSort` in a generic Sieve config) but no concrete caller combining exactly these fields was found. Treat as "ask before trimming," not "safe to delete."
>
> **Caveat on Sieve-backed collections**: many repositories extend `FirebaseSieveRepository` and expose a generic `sieveQuery(model, fields)` where the actual `where`/`orderBy` combination is built at runtime from a client-supplied filter/sort string, constrained by a `SieveFields` allowlist (`canFilter`/`canSort` per field). For these, "KEEP" evidence is usually a concrete UI sort-dropdown option or filter chip wired to that field, not a static `.where()` call in the repository itself. A field can be *declared* filterable/sortable in the allowlist yet have **no index provisioned for it in combination with other declared fields** — that undeclared combination is a live `FAILED_PRECONDITION` risk in production even though it wasn't "found in code" as a `.where()` chain. Conversely, several UI sort/filter controls turned out to be wired to field names that were never added to the allowlist — those are silently no-ops today (see "Bugs Found," not an indexing problem).

---

## Contents
- [products (109)](#products-109)
- [orders (34)](#orders-34)
- [bids (16)](#bids-16)
- [payouts (9)](#payouts-9)
- [offers (9)](#offers-9)
- [reviews (27)](#reviews-27)
- [categories (31)](#categories-31)
- [blogPosts (30)](#blogposts-30)
- [faqs (19)](#faqs-19)
- [stores (18)](#stores-18)
- [users (19)](#users-19)
- [sessions (9)](#sessions-9)
- [coupons (23)](#coupons-23)
- [eventEntries (12)](#evententries-12)
- [events (27)](#events-27)
- [Smaller collections (batch 1, 20 collections)](#smaller-collections-batch-1)
- [Smaller collections (batch 2, 27 collections)](#smaller-collections-batch-2)
- [Bugs Found (not index problems — code problems)](#bugs-found-not-index-problems--code-problems)
- [Missing-Index Candidates](#missing-index-candidates)
- [Is This Safe? (read before deploying)](#is-this-safe-read-before-deploying)
- [Recommended Actions](#recommended-actions)
- [Update 2026-08-19 — index shape mismatch found and fixed](#update-2026-08-19--index-shape-mismatch-2-field-vs-3-field-found-and-fixed)

---

## products (109)

Driven by `appkit/src/features/products/repository/products.repository.ts` `SIEVE_FIELDS` (L461-511) + `FILTER_ALIASES` (L521-607), consumed identically by the public API, admin API, store API, and the `listingProcessor` Firebase Function (`appkit/src/_internal/server/jobs/core/listingProcessor.ts:100-101`). Sort dropdowns: `appkit/src/features/products/constants/sieve.ts`.

**Critical mechanism**: any Sieve filter/sort field not present in `SIEVE_FIELDS` is **silently dropped** — no error, no query clause. This is confirmed in the `sievejs` package itself (`node_modules/@mohasinac/sievejs/src/processor.js:172-190,238-293`). This affects ~15 of the 109 indexes below (the `isSold` family) — see "Bugs Found."

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | isTestData, testDataExpiresAt | KEEP | `_helpers.ts:37-38` test-data sandbox sweep |
| 2 | isSold, title | TRIM-CANDIDATE | `isSold` absent from SIEVE_FIELDS — filter never reaches Firestore (bug, see below) |
| 3 | grading.service, grading.grade, createdAt | TRIM-CANDIDATE | Schema-comment only; no query code anywhere |
| 4 | card.setName, card.cardNumber, status | TRIM-CANDIDATE | Schema-comment only; no query code |
| 5 | listingType, classified.meetupArea.city, createdAt | TRIM-CANDIDATE | Only the parent `classified.meetupArea` object is filterable; `.city` is display-only |
| 6 | listingType, liveItem.species, status | KEEP | `liveItem.species` is canFilter (`:507`) + listingType alias + status |
| 7 | catalogProductId, price, condition | TRIM-CANDIDATE | Zero `.where("catalogProductId"...)` found |
| 8 | storeId, createdAt | KEEP | `store/products/route.ts:37-47`, `stores/[storeSlug]/products/route.ts:49` |
| 9, 50, 59, 103 | (listingType,) status, createdAt (both directions) | KEEP | `scope==published` alias; `BASE_TIME_SORTS` (`sieve.ts:17-20`) |
| 10, 51, 63 | storeId, (listingType,) status, createdAt | KEEP | `SellerProductsView.tsx:285-291` + storeId enforcement |
| 11 | storeId, status, itemsSold | TRIM-CANDIDATE | `itemsSold` doesn't exist on `ProductDocument` |
| 12, 52 | categorySlugs (array), (listingType,) createdAt | KEEP | `FILTER_ALIASES.category` (`:585-588`) |
| 13 | isPromoted, promotionEndDate | TRIM-CANDIDATE | `promotionEndDate` has zero references anywhere |
| 14, 82 | isPromoted, status, createdAt | KEEP | `FILTER_ALIASES.promoted` (`:591-597`) |
| 15, 81 | featured, status, createdAt | KEEP | `FILTER_ALIASES.featuredPublic` (`:599-606`) |
| 16, 80 | status, categorySlugs, createdAt | KEEP | as #12 + `opts.status` |
| 17 | status, availableQuantity, createdAt | UNSURE | field is Sieve-declared but `src/app/api/products/route.ts:117-123` deliberately excludes this combo to avoid index blowup |
| 18, 19, 20, 21, 45 | status/categorySlugs, price (both directions) | KEEP | `BASE_PRICE_SORTS` (`sieve.ts:22-25`) + category alias |
| 22, 23, 24 | subcategory, createdAt/price | KEEP | `search.repository.ts:23-24` real filter, backed by live `productRepository` |
| 25, 26, 27 | brand, createdAt/price | KEEP | `src/app/api/products/route.ts:44,90-91`, per-store route; `brand` is a separate live facet from `brandSlug` |
| 28, 29 | condition, createdAt/price | KEEP | `SAFE_PRODUCT_FILTER_FIELDS` (`route.ts:45,93-94`) |
| 30 | sellerName, createdAt | TRIM-CANDIDATE | Not in SIEVE_FIELDS; admin table's sortable seller column is `storeName`, not `sellerName` |
| 31 | status, viewCount | KEEP | "Most Viewed" (`sieve.ts:41`) |
| 32 | status, stockQuantity | UNSURE | canSort but no confirmed sort-combo caller |
| 33, 84 | status, updatedAt | KEEP | "Recently Updated" (`sieve.ts:40`) |
| 34 | storeId, updatedAt | UNSURE | reachable only via unrestricted admin `sorts=` passthrough, no confirmed UI trigger |
| 35, 41, 53, 68 | (listingType,) status, auctionEndDate | KEEP | "Ending Soon" (`sieve.ts:59,67`) |
| 36 | listingType, auctionEndDate, status | TRIM-CANDIDATE (wrong shape) | field order can't serve the real 3-equality+range query — see Missing-Index list |
| 37 | storeId, auctionEndDate | UNSURE | no confirmed combo |
| 38, 90 | (listingType,) status, startingBid | KEEP | "Lowest Starting Bid" (`sieve.ts:63`) |
| 39, 40, 42, 94, 95 | (listingType/storeId,) status, preOrderDeliveryDate | KEEP | PREORDER_SORT_OPTIONS (`sieve.ts:84-85`) |
| 43 | sublistingCategoryId, status, price | KEEP | `categories.repository.ts:597-603` `getSublistingListings` |
| 44 | groupId, status, price | UNSURE | `findByGroupId()` only filters groupId+listingType, no price ordering confirmed |
| 46 | brandSlug, createdAt | UNSURE | not in SIEVE_FIELDS; no direct filter path found — looks like the newer field that was never wired in |
| 47, 58 | storeId, (listingType,) status | KEEP | `SellerProductsView.tsx:285-291` |
| 48, 49 | isPromoted/featured, createdAt | KEEP | alias + default sort |
| 54, 64, 105 | listingType, preOrderDeliveryDate / prizeDrawEndDate | 54 KEEP, 64/105 TRIM-CANDIDATE (bug) | `prizeDrawEndDate` sort option exists in `AdminPrizeDrawsView.tsx:118` but the field is absent from SIEVE_FIELDS — silently dropped |
| 55, 56 | listingType, prizeRevealStatus, prizeRevealWindowEnd/Start | KEEP | `prizeRevealOpen.ts:16-18`, `prizeRevealClose.ts:20-22` (Cloud Function jobs) |
| 57 | listingType, status, featured, createdAt | KEEP | combination of featured/status aliases |
| 60, 61 | listingType, price | KEEP | BASE_PRICE_SORTS + listingType |
| 62 | listingType, createdAt ASC | KEEP | "Oldest First"/"Just Started" (`sieve.ts:19,67`) |
| 65, 66, 78, 79, 104 | listingType, (status,) title | KEEP | "Name: A–Z/Z–A" (`sieve.ts:36-37`) |
| 67 | listingType, viewCount | KEEP | as #31 with listingType |
| 69, 70, 88, 89 | listingType, (status, isSold,) currentBid | 69/70 KEEP, 88/89 TRIM-CANDIDATE | 69/70 = AUCTION_SORT_OPTIONS; 88/89 blocked by the isSold gap |
| 71, 72 | listingType, prizeRevealWindowStart | KEEP | "Reveal: Soonest/Furthest" (`sieve.ts:109-110`) |
| 73 | listingType, isPartOfBundle | UNSURE | route pushes this literal filter (`route.ts:172-175`) but the field isn't in SIEVE_FIELDS — likely also silently dropped |
| 74-79 | listingType, status, isSold, createdAt/price/title | TRIM-CANDIDATE (bug) | isSold gap |
| 83 | listingType, status, isOnSale | TRIM-CANDIDATE | never used as a filter/sort clause; absent from SIEVE_FIELDS |
| 85 | listingType, status, avgRating | TRIM-CANDIDATE | write-only field (`productStatsSync.ts:14-15`), never filtered/sorted |
| 86 | listingType, status, reviewCount | TRIM-CANDIDATE | same as #85 |
| 87 | listingType, status, isSold, auctionEndDate | TRIM-CANDIDATE | isSold gap |
| 91, 92, 93, 96, 97 | listingType, status, bidCount/buyNowPrice/preOrderCurrentCount/preOrderDepositAmount | KEEP | AUCTION/PREORDER_SORT_OPTIONS (`sieve.ts:64-66,88-89`) |
| 98 | listingType, status, isSold, savingsAmount | TRIM-CANDIDATE | double break: isSold gap + `savingsAmount` also absent from SIEVE_FIELDS |
| 99 | listingType, status, bundleItemCount | UNSURE | sort option exists (`sieve.ts:100`) but field absent from SIEVE_FIELDS — likely dropped |
| 100, 101, 102 | searchTokens (array), (listingType, status,) createdAt | KEEP | `products.repository.ts:631-638` tokenized search |
| 106, 107, 108, 109 | isSold, status, createdAt/title/price | TRIM-CANDIDATE (bug) | isSold gap |

---

## orders (34)

`appkit/src/features/orders/repository/orders.repository.ts`. **`sellerId` does not exist on `OrderDocument`** (`appkit/src/features/orders/schemas/firestore.ts`) — seller-scoped queries actually use `productId in [...ids]` (`orders.repository.ts:339-353`). This makes indexes #6-12 dead as a group, not independently.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | userId, createdAt | KEEP | `listForUser` (`:355-373`) |
| 2 | userId, status, createdAt | KEEP | same + `OrderFilters.tsx:112-119` status facet |
| 3 | paymentBatchId, createdAt | TRIM-CANDIDATE | `findByPaymentBatchId` (`:431-438`) has no orderBy; field is `canSort:false` |
| 4 | productId, createdAt | KEEP | SELLER/ADMIN sieve fields |
| 5 | userId, productId | KEEP | `hasUserPurchased`, `countByUserAndProduct` (`:227-265`) |
| 6-10 | sellerId (+status/paymentStatus/paymentMethod), createdAt | TRIM-CANDIDATE | `sellerId` field doesn't exist — see Bugs Found |
| 11, 12 | sellerId, totalPrice | TRIM-CANDIDATE | same `sellerId` issue |
| 13 | storeId, status, createdAt ASC | KEEP | `findFulfillmentQueue` (`:168-179`) |
| 14 | status, paymentStatus, createdAt ASC | KEEP | `getTimedOutPending` (`:444-465`) |
| 15 | userId, orderDate | KEEP | `findRecentByUser` (`:207-225`) |
| 16 | payoutStatus, status, updatedAt ASC | KEEP | `getEligibleAutomatic` (`:501-521`); previously confirmed real in `newchange.md:1270` |
| 17 | emiEnabled, emiComplete | KEEP | `getActiveEmiOrders` (`:529-544`) |
| 18 | payoutStatus, shippingMethod, status | UNSURE | all 3 fields sieve-declared; previously confirmed real (`newchange.md:1270`) but no current live caller found |
| 19 | status, createdAt | KEEP | `AdminOrdersView.tsx:74-80` default sort |
| 20 | paymentStatus, createdAt | KEEP | `OrderFilters.tsx:121-126,156-159` |
| 21 | paymentMethod, createdAt | UNSURE | sieve-capable, no confirmed UI facet |
| 22 | shippingMethod, createdAt | UNSURE | sieve-capable, no confirmed UI facet |
| 23 | payoutStatus, createdAt | KEEP | `OrderFilters.tsx:164-172` admin facet |
| 24 | status, totalPrice | KEEP | amount sort option + status facet |
| 25 | status, orderDate | KEEP | orderDate sort option + status facet |
| 26 | userId, productId, status | KEEP | `countByUserAndProduct` (`:254-265`) |
| 27 | userId, bundleId, status | KEEP | `countByUserAndBundle` (`:272-283`) |
| 28 | prizeDrawProductId, paymentStatus, status | KEEP | `prizeRevealOpen.ts:43-52` |
| 29 | paymentStatus, prizeRevealDeadline | UNSURE | only found combined with `status in[...]` (see #33) |
| 30 | productId, orderDate | UNSURE | sieve-plausible, no concrete caller |
| 31 | storeId, status, payoutStatus, orderDate | KEEP | `computeSellerEarnings` (`store/payouts/route.ts:27-34`) |
| 32 | paymentStatus, status, createdAt ASC | KEEP | mirrors #14 |
| 33 | paymentStatus, status, prizeRevealDeadline | KEEP | `prizeRevealExpiry.ts:16-26`, `prizeRevealReminder.ts:21-28` |
| 34 | status, createdAt ASC | KEEP | "Oldest" sort (`AdminOrdersView.tsx:78-79`) |

---

## bids (16)

`appkit/src/features/auctions/repository/bid.repository.ts`, `SIEVE_FIELDS` (`:470-482`).

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | productId, bidDate | KEEP | `bid-actions.ts:287-303`, `store/bids/route.ts:26-56` |
| 2 | userId, bidDate | UNSURE | `userId` is `canSort:false` — no confirmed sort combo |
| 3 | productId, isWinning | KEEP | `findWinningBid` (`:203-225`) |
| 4 | productId, bidAmount | KEEP | `findByProductSorted`, `findHighestBid` (`:230-275`) |
| 5 | status, createdAt | UNSURE | plausible, no confirmed trigger (admin sort is broken — see #14-16) |
| 6 | productId, status, bidDate | UNSURE | plausible, not found as explicit code |
| 7 | productId, status, bidAmount | KEEP | `getActiveByProduct`, `findHighestBid` (`:127-254`) |
| 8 | productId, isWinning, status | KEEP | `getWinningBid` (`:147-167`) |
| 9 | userId, createdAt | KEEP | `findByUserPaginated` (`:100-115`); `user/bids/route.ts:20` |
| 10 | userId, bidAmount | UNSURE | no evidence found |
| 11 | status, bidDate | UNSURE | no evidence found |
| 12 | productId, userId, status | KEEP | `findOneByProductAndUser` (`:438-464`) |
| 13 | userId, status, createdAt | UNSURE | sieve-plausible only |
| 14 | status, bidTime | TRIM-CANDIDATE | `bidTime` doesn't exist on `BidDocument`/SIEVE_FIELDS — bug, see below |
| 15 | status, bidTime ASC | TRIM-CANDIDATE | same |
| 16 | status, amount | TRIM-CANDIDATE | not a sortable sieve field (`bidAmount` is the real field) |

---

## payouts (9)

`appkit/src/features/payments/repository/payout.repository.ts`. **`PayoutDocument` has no `sellerId` field.**

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | sellerId, createdAt | TRIM-CANDIDATE | field doesn't exist |
| 2 | status, createdAt | KEEP | `AdminPayoutsView.tsx:152-159`; `admin/payouts/route.ts:68-92` |
| 3 | sellerName, createdAt | TRIM-CANDIDATE | `admin/payouts/route.ts:112-113` deliberately drops `sorts` for the name/email search path to avoid needing this index |
| 4 | sellerName, status, createdAt | TRIM-CANDIDATE | same reasoning |
| 5 | sellerId, status, createdAt | TRIM-CANDIDATE | field doesn't exist |
| 6 | storeId, createdAt | KEEP | `findByStore` (`:117-130`) |
| 7 | storeId, status, createdAt | KEEP | `findByStoreAndStatus` (`:135-152`) |
| 8 | status, createdAt ASC | KEEP | `admin/payouts/route.ts:68-92` summary counts |
| 9 | status, amount | KEEP | "Highest amount" sort (`AdminPayoutsView.tsx:158`) |

---

## offers (9)

`appkit/src/features/offers/repository/offer.repository.ts`. **`OfferDocument` has no `sellerId` field** — offers are `storeId`-scoped.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | buyerUid, productId, createdAt ASC | KEEP | `countByBuyerAndProduct` (`:175-187`) |
| 2 | buyerUid, productId, status | KEEP | `hasActiveOffer` (`:159-168`) |
| 3 | buyerUid, createdAt | KEEP | `findByBuyer`; `user/offers/route.ts:15` |
| 4 | sellerId, createdAt | TRIM-CANDIDATE | field doesn't exist; only reference is an unwired dead route (`features/seller/api/offers/route.ts:39`, no consumer under `src/app/api/seller/offers/**`) |
| 5 | sellerId, status, createdAt | TRIM-CANDIDATE | same dead route |
| 6 | productId, status, createdAt | TRIM-CANDIDATE | no code path found |
| 7 | status, expiresAt | KEEP | `findExpired`/`findExpiredActive` (`:147-267`), `offerExpiry.ts` job |
| 8 | storeId, createdAt | KEEP | `findByStore` (`:109-135`) |
| 9 | storeId, status, createdAt ASC | KEEP | `findPendingByStore` (`:137-144`); `store/offers/route.ts:36-41` |

---

## reviews (27)

`appkit/src/features/reviews/repository/reviews.repository.ts`. `ReviewDocument` has **no `publishedAt` or `isVerifiedPurchase` field** (real fields: none for publishedAt — reviews use `createdAt`; `verified` not `isVerifiedPurchase`).

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | productId, createdAt | KEEP | `listReviewsByProduct` (`review-actions.ts:236-251`) |
| 2 | status, createdAt | KEEP | `reviews/route.ts:98-121` |
| 3 | userId, status, createdAt | KEEP | `findApprovedByUser` (`:145-154`) |
| 4 | productId, status, createdAt | KEEP | `findApprovedByProduct` (`:118-127`) |
| 5 | featured, status, createdAt | KEEP | `findFeatured` (`:164-174`) |
| 6 | status, rating | KEEP | "Highest Rated" (`ReviewFilters.tsx:21-26`) |
| 7 | status, rating, createdAt | KEEP | rating filter + default sort (`reviews/route.ts:44-49,81`) |
| 8 | storeId, status, createdAt | KEEP | `findApprovedByStore` (`:129-139`) |
| 9 | userId, createdAt | UNSURE | `userId` is `canSort:false` — no direct evidence |
| 10 | storeId, rating | KEEP | `store/reviews/route.ts:38` + seller "Highest rating" sort |
| 11 | productId, rating | UNSURE | product listings always add `status` too (see Missing-Index) |
| 12 | productId, helpfulCount | UNSURE | no sort-by-helpful UI for product view found |
| 13 | verified, createdAt | UNSURE | `verified` canFilter only, no confirmed +createdAt sort trigger |
| 14 | featured, createdAt | UNSURE | `findFeatured` always adds status too (see #5) |
| 15 | storeId, createdAt | KEEP | `store/reviews/route.ts:35-43` default (no rating filter) |
| 16 | status, helpfulCount | UNSURE | added in a prior session (`newchange.md:1251`) but no current sort-by-helpful UI found |
| 17 | status, hasImages, createdAt | KEEP | `hasImages==true` filter (`reviews/route.ts:68-69`) |
| 18 | status, hasImages, rating | KEEP | same filter + rating sort |
| 19 | status, createdAt ASC | KEEP | "Oldest First" sort option |
| 20 | status, publishedAt | TRIM-CANDIDATE | `publishedAt` doesn't exist — bug, see below |
| 21 | status, publishedAt ASC | TRIM-CANDIDATE | same |
| 22 | status, rating ASC | KEEP | "Lowest Rated" sort |
| 23 | status, isVerifiedPurchase, publishedAt | TRIM-CANDIDATE | neither field exists on schema |
| 24 | rating, status, publishedAt | TRIM-CANDIDATE | `publishedAt` bug |
| 25 | rating, status, publishedAt ASC | TRIM-CANDIDATE | same |
| 26 | rating, status, rating DES | TRIM-CANDIDATE — **likely copy-paste bug** | `rating` appears twice in the same index; no code path produces this shape |
| 27 | rating, status, rating ASC | TRIM-CANDIDATE — **likely copy-paste bug** | same |

---

## categories (31)

`appkit/src/features/categories/repository/categories.repository.ts`. Unified collection discriminated by `categoryType` (SB-UNI-Categories). **Note**: bare `tier`/`rootId` indexes (#4, #5, #17) coexist with `categoryType`-prefixed ones — both patterns are live for different call sites.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | isTestData, testDataExpiresAt | KEEP | `_helpers.ts:37-38` |
| 2 | type, order | TRIM-CANDIDATE — **bug** | `CategoryDocument` has no `type` field, only `categoryType` (`schemas/firestore.ts:141`) — this query always matches zero docs |
| 3 | isFeatured, order | KEEP | `api/route.ts:96,135,161-164` |
| 4 | rootId, tier | UNSURE | live query is the 3-field `getCategoriesByRootId` (see #11) |
| 5 | isActive, tier | TRIM-CANDIDATE | only the 3-field variant (#15) was found |
| 6 | isFeatured, featuredPriority | TRIM-CANDIDATE | only the 3-field variant (#13) was found |
| 7 | isActive, isSearchable | UNSURE | `isSearchable` filter-only, no orderBy pairing found |
| 8 | isLeaf, isActive | TRIM-CANDIDATE | only the 3-field variant (#14) was found |
| 9 | showOnHomepage, isActive, order | TRIM-CANDIDATE | no live query filters `showOnHomepage`; a code comment claims it but the code actually filters `isFeatured` (comment/code mismatch) |
| 10 | tier, isActive, order | KEEP | `getRootCategories`/`getCategoriesByTier` (`:172-214`) |
| 11 | rootId, tier, order | KEEP | `getCategoriesByRootId` (`:228-234`) |
| 12 | parentIds (array), order | KEEP | `getChildren` (`:250-251`) + public API |
| 13 | isFeatured, isActive, featuredPriority | KEEP | `getFeaturedCategories` (`:269-276`) |
| 14 | isLeaf, isActive, order | KEEP (partial) | `getLeafCategories` matches isLeaf+isActive; `order` suffix unconfirmed |
| 15 | isActive, tier, order | KEEP | `buildTree()` default branch (`:439-443`) |
| 16 | isActive, isBrand, order | KEEP | `getBrandCategories` (`:291-296`) |
| 17 | tier, order | KEEP | public API `tier==N` + hardcoded order |
| 18 | categoryType, isActive, order | KEEP | `findActiveBrands` (`:629-635`), `bundleStockSync.ts:56-58` |
| 19 | categoryType, bundleProductIds (array), __name__ | KEEP | `onProductStockChange.ts:60-63` |
| 20 | categoryType, createdAt | KEEP | `AdminBrandsView.tsx:83`, `admin/brands/route.ts:53-58` |
| 21 | categoryType, createdByStoreId, isActive, createdAt | TRIM-CANDIDATE | seller/admin bundle routes filter/sort **in-memory**, not via this composite |
| 22 | order, name | UNSURE | public categories listing sorts client-side, never hits Firestore with this combo |
| 23 | categoryType, order, name | KEEP | `admin/brands/route.ts:15,53-58` |
| 24 | parentId, isActive, displayOrder | TRIM-CANDIDATE — **field-name bug** | real field is `order`, not `displayOrder` (see Bugs Found) |
| 25 | categoryType, isActive, displayOrder | TRIM-CANDIDATE — **field-name bug** | same |
| 26 | categoryType, isActive, name | KEEP | `AdminBrandsView.tsx:75,81` |
| 27 | categoryType, isActive, name DES | KEEP | same, "Z–A" |
| 28 | categoryType, isActive, createdAt | KEEP | same view, createdAt sort |
| 29 | categoryType, name | KEEP | AdminSublistingCategoriesView / AdminBundlesView default sort |
| 30 | categoryType, name DES | KEEP | same |
| 31 | categoryType, productCount | TRIM-CANDIDATE — **field-name bug** | real field is `metrics.productCount`, sort silently no-ops |

---

## blogPosts (30)

`appkit/src/features/blog/repository/*`. **`BlogPostDocument` has only `isFeatured`, not `featured`.**

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | isTestData, testDataExpiresAt | KEEP | `_helpers.ts:37` |
| 2 | isFeatured, publishedAt ASC | KEEP | `AdminBlogView.tsx:60` |
| 3 | isFeatured, title | KEEP | `AdminBlogView.tsx:62` |
| 4 | status, publishedAt | KEEP | `blog/api/route.ts:38-50` public default |
| 5 | status, createdAt | KEEP | `AdminBlogView.tsx:61` |
| 6 | status, category, publishedAt | KEEP | `blog/api/route.ts:41-50` |
| 7 | status, featured, publishedAt | TRIM-CANDIDATE — **bug, dup of #26** | `featured` field doesn't exist, real field is `isFeatured` |
| 8 | authorId, createdAt | UNSURE | sieve-declared, no combined caller found |
| 9 | isFeatured, status, publishedAt | KEEP | `AdminBlogView.tsx:54-55,80-84` |
| 10 | title, status, publishedAt | UNSURE | title is search-only (`@=*`), no direct combo found |
| 11 | category, createdAt | UNSURE | category always paired with status in live code |
| 12 | authorName, createdAt | TRIM-CANDIDATE | canSort but no UI/route exposes it |
| 13 | authorName, publishedAt | TRIM-CANDIDATE | same |
| 14 | status, views | KEEP | "Most Viewed" (`BlogFilters.tsx:36`) |
| 15 | status, updatedAt | UNSURE | sortable, no live sort-option wired |
| 16 | status, readTimeMinutes | KEEP | "Longest Read" (`BlogFilters.tsx:26`) |
| 17 | category, publishedAt | UNSURE | overlaps #6 minus status |
| 18 | isFeatured, publishedAt | KEEP | `AdminBlogView.tsx:54-59` |
| 19 | isFeatured, createdAt | TRIM-CANDIDATE | no isFeatured+createdAt-only combo found |
| 20 | isFeatured, updatedAt | TRIM-CANDIDATE | no match |
| 21 | authorId, publishedAt | TRIM-CANDIDATE | no match |
| 22 | category, updatedAt | TRIM-CANDIDATE | no match |
| 23 | status, title | KEEP | "Title A–Z" (public) |
| 24 | category, title | TRIM-CANDIDATE | no match |
| 25 | isFeatured, status, updatedAt | TRIM-CANDIDATE | no updatedAt sort option wired |
| 26 | status, isFeatured, publishedAt | KEEP | dup of #9 with different field order — same query |
| 27 | status, publishedAt ASC | KEEP | "Published: Oldest" (`BlogFilters.tsx:28`) |
| 28 | isFeatured, status, publishedAt ASC | KEEP | #9's filters + "Published: Oldest" |
| 29 | isFeatured, status, createdAt | KEEP | #9's filters + "Newest draft" sort |
| 30 | isFeatured, status, title | KEEP | #9's filters + "Title A–Z" |

---

## faqs (19)

`appkit/src/features/faqs/repository/faqs.repository.ts`.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | isPinned, priority, order | UNSURE | `getPinnedFAQs` (`:255-266`) does isPinned+isActive+order, not `priority` |
| 2 | category, order | UNSURE | live category queries always add `isActive` too (#3) |
| 3 | category, isActive, order | KEEP | `getFAQsByCategory` (`:222-230`) |
| 4 | showOnHomepage, priority ASC | TRIM-CANDIDATE | live homepage query always adds `isActive` and uses DESC (#11) |
| 5 | category, isActive, showOnHomepage, priority, order | TRIM-CANDIDATE | no 5-field combo found |
| 6 | isActive, stats.helpful | KEEP | `getMostHelpful` (`:279-285`) |
| 7 | isActive, stats.helpful, priority, order | KEEP | `FAQPageContent.tsx:84-89` "helpful" sort |
| 8 | isActive, createdAt | KEEP | `FAQPageContent.tsx:89` "newest" sort |
| 9 | showInFooter, isActive, order | KEEP | `getFooterFAQs` (`:244-252`) |
| 10 | isPinned, isActive, order | KEEP | `getPinnedFAQs` (no category) |
| 11 | showOnHomepage, isActive, priority DES | KEEP | `getHomepageFAQs` (`:233-241`) |
| 12 | isActive, priority, order | KEEP | `admin/faqs/route.ts:14,40-53` default sorts |
| 13 | isActive, category, priority, order | KEEP | public `/api/faqs` category filter + default sorts |
| 14 | showOnHomepage, isActive, priority, order | UNSURE | `getHomepageFAQs` matches first 3 fields only, no `order` tiebreak confirmed |
| 15 | tags (array), isActive | KEEP | `searchByTag`/`list()` (`:184-276`) |
| 16 | tags (array), isActive, priority, order | UNSURE | plausible via default sieve sort, not independently confirmed |
| 17 | searchTokens (array), isActive, priority, order | UNSURE | same caveat as #16 |
| 18 | isActive, question | KEEP | `FAQPageContent.tsx:88` "alphabetical" sort |
| 19 | priority, order | KEEP | `admin/faqs/route.ts:14` default sort, no filters |

---

## stores (18)

`appkit/src/features/stores/repository/store.repository.ts`, `SIEVE_FIELDS` (`:165-171`). **`StoreDocument.stats` has `totalProducts`, not `totalListings`.**

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | isTestData, testDataExpiresAt | KEEP | `_helpers.ts:37` |
| 2 | status, createdAt | KEEP | `AdminStoresView.tsx:83-89` default |
| 3 | status, isPublic, createdAt | KEEP | `stores/route.ts:70` baseline |
| 4 | status, isPublic, storeName ASC | KEEP | baseline + "Name A–Z" |
| 5 | storeCategory, status, createdAt | UNSURE | always co-occurs with `isPublic` too (4-field combo not declared) |
| 6 | ownerId, createdAt | TRIM-CANDIDATE | `findByOwnerId` is a single-doc equality lookup ("one store per seller"), no orderBy needed |
| 7 | storeCategory, storeName | UNSURE | storeCategory filter never combined with storeName sort |
| 8 | storeName, isPublic, status, createdAt | TRIM-CANDIDATE | storeName filter is prefix/`@=*` search, not equality, in this combo |
| 9 | isPublic, status, createdAt, storeName DES | TRIM-CANDIDATE | no multi-orderBy query found |
| 10 | status, isPublic, stats.itemsSold | TRIM-CANDIDATE — **bug** | "Most Sales" sort option exists but `sieveFields` doesn't mark `stats.itemsSold` sortable — dead |
| 11 | storeCategory, status, stats.averageRating | TRIM-CANDIDATE | same sieveFields restriction, plus no storeCategory+rating combo found |
| 12 | status, isPublic, storeName DES | TRIM-CANDIDATE | no "Name Z-A" sort option exists for stores |
| 13 | status, stats.averageRating | TRIM-CANDIDATE — **bug** | "Top Rated" sort option exists but is dead, same as #10 |
| 14 | status, stats.totalReviews | TRIM-CANDIDATE | field only ever written, never queried/sorted |
| 15 | status, stats.totalListings | TRIM-CANDIDATE — **field-name bug** | field doesn't exist; real field is `stats.totalProducts` |
| 16 | status, storeName ASC | KEEP | `AdminStoresView.tsx:90` |
| 17 | status, isVerified, createdAt | TRIM-CANDIDATE | `isVerified` only used for admin display, never filtered/sorted |
| 18 | status, createdAt ASC | KEEP | `AdminStoresView.tsx:89` "Oldest" |

---

## users (19)

`appkit/src/features/auth/repository/user.repository.ts`.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1, 2, 4, 5, 6, 17, 18, 19 | disabled/role combos + createdAt/displayName | KEEP | `AdminUsersView.tsx:165-206` filters + sorts |
| 3 | emailVerified, createdAt | TRIM-CANDIDATE | `findVerified()` filters only, no orderBy |
| 7 | displayName, createdAt | TRIM-CANDIDATE | `admin/users/route.ts:58-68` deliberately drops sort during name/email search |
| 8 | role, storeStatus, createdAt | TRIM-CANDIDATE | only consumer (`listSellersForAdmin`) is never called |
| 9 | role, updatedAt | TRIM-CANDIDATE | no sort-by-updatedAt option anywhere |
| 10 | emailVerified, updatedAt | TRIM-CANDIDATE | no combo found |
| 11 | disabled, updatedAt | TRIM-CANDIDATE | no updatedAt sort in AdminUsersView |
| 12, 13 | storeStatus, createdAt/updatedAt | TRIM-CANDIDATE | no `storeStatus==` filter anywhere live |
| 14, 15, 16 | permissionGroup, role, createdAt/displayName | KEEP | `AdminTeamView.tsx:100-134`, `admin/team/route.ts:42-50` |

---

## sessions (9)

`appkit/src/features/auth/repository/session.repository.ts`.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | userId, isActive, lastActivity | TRIM-CANDIDATE | no direct query matches this exact shape |
| 2 | userId, createdAt | KEEP | `findAllByUser` (`:167-185`); `user/sessions/route.ts:20` |
| 3 | isActive, expiresAt ASC | TRIM-CANDIDATE | cleanup jobs filter `expiresAt` only, no `isActive` |
| 4 | isActive, lastActivity | TRIM-CANDIDATE | userId-less admin path orders by lastActivity with no filter (single-field, no composite needed) |
| 5 | userId, isActive, expiresAt | KEEP (redundant) | subsumed as a prefix of #7 |
| 6 | isActive, expiresAt, lastActivity | KEEP | `getAllActiveSessions`/`getStats` (`:197-287`) |
| 7 | userId, isActive, expiresAt, lastActivity | KEEP | `findActiveByUser` (`:147-165`), `hardBanCascade.ts:116` |
| 8 | isActive, lastActivity ASC | TRIM-CANDIDATE — **bug** | `admin/sessions/route.ts:25-40` hardcodes lastActivity DESC; the "Least recent" sort + isActive filter chip in `AdminSessionsView.tsx:76-140` are sent but silently ignored by the handler |
| 9 | isActive, createdAt | TRIM-CANDIDATE | no matching query |

---

## coupons (23)

`appkit/src/features/promotions/repository/coupons.repository.ts`.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | validity.isActive, validity.endDate ASC | KEEP | `getActiveCoupons`/`getCouponsExpiringSoon`; `jobs/core/promotions.ts:48-53` |
| 2 | type, validity.isActive | KEEP (redundant) | equality-only prefix of #10 |
| 3 | createdBy, createdAt | TRIM-CANDIDATE | `getCouponsByCreator` defined but never called |
| 4 | type, createdAt | KEEP | `AdminCouponsView.tsx:96-114` |
| 5 | validity.isActive, createdAt | KEEP | `CouponsIndexListing.tsx:17-27,87-104` |
| 6 | validity.isActive, validity.startDate ASC | KEEP | `CouponsIndexListing.tsx:92` dateFrom filter |
| 7 | type, validity.endDate ASC | UNSURE | only reachable combined with forced isActive (see Missing-Index) |
| 8 | type, validity.startDate ASC | UNSURE | same caveat |
| 9 | validity.isActive, discount.value | TRIM-CANDIDATE | no discount.value sort anywhere |
| 10 | validity.isActive, type, createdAt | KEEP | `/api/coupons` + `CouponsIndexListing` type filter |
| 11 | storeId, createdAt | KEEP | `store/coupons/route.ts:40-44`, `SellerCouponsView.tsx:102-114` |
| 12 | storeId, validity.isActive, createdAt | TRIM-CANDIDATE — **bug** | `SellerCouponsView.tsx:116-117` filters on sieve key `"isActive"`, not `"validity.isActive"` — mismatched key, silently dropped |
| 13 | storeId, type, createdAt | UNSURE | route forwards arbitrary filters but no UI sends type alongside storeId |
| 14, 15 | storeId, validity.endDate/startDate | TRIM-CANDIDATE | no evidence |
| 16 | storeId, discount.value | TRIM-CANDIDATE | no sort by discount.value found |
| 17 | storeId, usage.currentUsage | TRIM-CANDIDATE | no sort by usage.currentUsage found |
| 18 | storeId, code | KEEP | `SellerCouponsView.tsx:102-105` "Code A–Z" |
| 19, 20, 21 | scope-based | TRIM-CANDIDATE | `scope==` filter exists only in an unwired generic package template; the real app route proxies to a Firebase Function instead |
| 22 | type, createdAt ASC | KEEP | "Oldest" sort + type filter |
| 23 | type, code | KEEP | "Code A–Z" sort + type filter |

---

## eventEntries (12)

`appkit/src/features/events/repository/event-entry.repository.ts`. **Schema split**: the live `SIEVE_FIELDS`/`EVENT_ENTRY_INDEXED_FIELDS` use `eventId, userId, reviewStatus (pending/approved/flagged), submittedAt, points`. A second, older field set (`status` CONFIRMED/WAITLISTED/CANCELLED + `createdAt`, from `appkit/src/constants/field-names.ts:390-409`) is what CLAUDE.md documents, but it's only equality-checked in `triggerEventRaffle.ts` — `createdAt` is never actually written by `createEntry()`.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | userId, submittedAt | KEEP | `user/events/route.ts:19-23` |
| 2 | eventId, reviewStatus, submittedAt | KEEP | `admin/events/[id]/entries/route.ts:41-48` |
| 3 | eventId, points | TRIM-CANDIDATE | `getLeaderboard` sorts **in-memory**, no Firestore orderBy |
| 4 | eventId, userId | KEEP | `assignSpinPrize.ts:57-62`, `hasUserEntered`/`countUserEntries` |
| 5 | eventId, reviewStatus, points | TRIM-CANDIDATE | no query combines these three |
| 6 | userId, points | TRIM-CANDIDATE | no matching query |
| 7 | reviewStatus, submittedAt | TRIM-CANDIDATE | sitewide (no eventId) reviewStatus filter never used |
| 8 | eventId, status, points | KEEP | `triggerEventRaffle.ts:63-67` (equality prefix; points used for in-memory top-N sort) |
| 9 | eventId, status, createdAt ASC | KEEP (weak) | same query, but `createdAt` is never written by `createEntry()` — pool is likely always empty in practice |
| 10 | userId, eventId, createdAt | TRIM-CANDIDATE | no query combines these three; `createdAt` unused field |
| 11, 12 | status, submittedAt | TRIM-CANDIDATE — **bug** | `AdminAllEventEntriesView.tsx:68-91` filters on sieve key `"status"`, but `SIEVE_FIELDS` (`:27-34`) has no `status` key — silently dropped |

---

## events (27)

`appkit/src/features/events/repository/events.repository.ts`. `stats.flaggedEntries` confirmed real and actively maintained (`:160-174`), just never sorted-by in any UI.

| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | isTestData, testDataExpiresAt | KEEP | `_helpers.ts:37-38` |
| 2, 3, 4, 5 | status + createdAt/startsAt/endsAt | KEEP | `EventsListPageView.tsx:17-43`, `listActive()` (`:58-72`), `AdminEventsView.tsx:64-91` |
| 6 | type, status | KEEP (redundant) | equality-only prefix of #11/#23/#24 |
| 7 | type, status, endsAt ASC | KEEP | `EVENT_ADMIN_SORT_OPTIONS`/`EventFilters.tsx:20-25` |
| 8, 14, 15 | createdBy + createdAt/startsAt/endsAt | TRIM-CANDIDATE | `createdBy` is write-only, never filtered |
| 9, 10 | type, createdAt/startsAt | KEEP | `AdminEventsView.tsx` type filter + sorts |
| 11, 23, 24 | type, status, startsAt (dup declarations) | KEEP | `AdminEventsView.tsx` status+type filters + startsAt sort |
| 12, 13 | status, endsAt DES / type, endsAt ASC | KEEP (weak) | reachable via `EventFilters.tsx` sort options, not confirmed rendered in `AdminEventsView`'s own dropdown |
| 16 | status, stats.totalEntries | KEEP | "Most Entries" (`EventFilters.tsx:38`) |
| 17, 18 | status, stats.approvedEntries/flaggedEntries | TRIM-CANDIDATE | fields real and sortable but no sort-option constant or UI ever uses them |
| 19, 20 | type, title / type, stats.totalEntries | KEEP | `EVENT_PUBLIC_SORT_OPTIONS` |
| 21, 22, 27 | hasRaffle + status(+startsAt/raffleWinnerUserId) | TRIM-CANDIDATE | `hasRaffle` never used in any `.where()` clause; `triggerEventRaffle.ts` fetches a known `eventId` directly, no scan job exists |
| 25, 26 | status, title | KEEP | `AdminEventsView.tsx` "Title A–Z" |

---

## Smaller collections (batch 1)

*20 collections, `appkit/src/features/store-extensions/repository/*.ts` and `appkit/src/core/*.repository.ts` mostly.*

### addresses (5)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | ownerType, ownerId, createdAt | KEEP | `listByOwner()` |
| 2 | ownerType, ownerId, isDefault | KEEP | `clearDefaultFlag()` |
| 3 | banStatus, bannedAt | KEEP | `listByBanStatus()` |
| 4 | ownerType, storeId | TRIM-CANDIDATE | `storeId` doesn't exist on `AddressDocument`; store lookups actually use `ownerType`+`ownerId` |
| 5 | ownerType, city | TRIM-CANDIDATE | no query filters by `city` anywhere |

### adminNotifications (2) — all TRIM-CANDIDATE
Only method is `listUnread()` = single-field `isRead==false`, no orderBy, no `category` filter anywhere.

### analyticsAlerts (2) / analyticsCards (2) — all TRIM-CANDIDATE
Both repos do `findBy("ownerId")` + **in-memory** JS filtering on `scope`/`isActive`/`metric`/`isVisible`/`position` — never a Firestore-level composite.

### brands (2) — all TRIM-CANDIDATE
No repository targets `"brands"` at all. Migrated into `categories` with `categoryType:"brand"` (explicit migration comment: `categories.repository.ts:625-637`).

### bundles (6) — all TRIM-CANDIDATE
No repository consumer anywhere. Live bundle CRUD operates on `categoryType:"bundle"` rows inside `categories`, loaded and sorted **in-memory** ("Bundles are low cardinality" comment in `admin/bundles/route.ts`).

### carouselSlides (4)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | active, order | KEEP | `getActiveSlides()` |
| 2 | active, createdAt | KEEP | `getInactiveSlides()` |
| 3 | createdBy, createdAt | KEEP | `getSlidesByCreator()` |
| 4 | carouselId, order | TRIM-CANDIDATE | no `.where("carouselId",...)` query found; parent carousels fetch slides individually by ID |

### carousels (1) — TRIM-CANDIDATE
Only query (`listCarousels()`) sorts by `name`; no `createdBy`/`createdAt` combo anywhere.

### carts (2) — both TRIM-CANDIDATE
`type` field doesn't exist on `CartDocument` — real sieve fields are `userId, sessionId, updatedAt, createdAt`.

### catalogProducts (2) — both TRIM-CANDIDATE (whole collection unused)
Zero consumers anywhere except the schema file itself; scaffolded speculatively.

### catalogueItems (4)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | ownerId, createdAt | KEEP | `listByOwner()` |
| 2 | ownerId, visibility, createdAt | KEEP | `listPublicByOwner()` |
| 3 | listingStatus, createdAt | KEEP | `listPendingApproval()`, `admin/catalogue/route.ts:27-31` |
| 4 | ownerId, listingStatus | TRIM-CANDIDATE | both filterable but never combined by any caller |

### chatRooms (4)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | buyerId, updatedAt | TRIM-CANDIDATE | every buyer query also filters `adminDeleted` (#3) |
| 2 | ownerId, updatedAt | TRIM-CANDIDATE | superseded by #4 |
| 3 | buyerId, adminDeleted, updatedAt | KEEP | `listForUser()` (`:136-141`) |
| 4 | ownerId, adminDeleted, updatedAt | KEEP | `listForUser()` (`:142-147`) |

### claimedCoupons (2) — both TRIM-CANDIDATE
Single-field `.where(userId)` only, no orderBy; expiry checked in JS after fetch, not queried.

### comments (1) / incidents (1) — scam-registry subcollections, UNSURE
Live subcollection queries exist (`listPublicIncidents`/`listPublicComments`), filtering `status`+`createdAt` / `isHidden`+`createdAt`, but **never filter by `scammerId`** (it's implicit via the subcollection doc path). The declared `COLLECTION_GROUP` index leads with `scammerId`, which the real query never applies as a `.where()` clause — the index's shape doesn't match how the query is actually issued. Worth a closer look before trimming (subcollection index semantics are subtle).

### contests (1) — TRIM-CANDIDATE
Schema-only stub (`ScammerContestDocument`) — zero repository methods, zero API routes.

### contactSubmissions (2) — both KEEP
`AdminContactView.tsx:100-125` status filter + Newest/Oldest sort options, both directions live.

### conversations (2) — both KEEP
`conversations.repository.ts:134-145`.

### copilotLogs (1) — KEEP
`findByConversation()` (`:82-93`).

### customRoles (1) — TRIM-CANDIDATE
`listActive()` = unfiltered `findAll(50)` + in-memory filter, no `scope`/`createdAt` query.

### groupedListings (2) — UNSURE
Exact-matching composite query exists in `_internal/server/features/grouped/data.ts:114-136`, but that function (and its siblings) appear to have **no live callers** anywhere in `src/app` — no storefront page or homepage-section case consumes it. Worth confirming with the team whether this is pending integration or abandoned before trimming.

### homepageSections (2)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | enabled, order | KEEP | `getEnabledSections()`/`getDisabledSections()` |
| 2 | type, enabled, order | TRIM-CANDIDATE | `getSectionByType()` filters only `type`, no `enabled`/`order` combo found |

### itemRequests (3) — all TRIM-CANDIDATE
Repo explicitly documented as "no sieve pagination support" — `findBy` + in-memory sort/cap only.

### jobs (1) — KEEP
`getStaleFinishedRefs()` (`:50-59`).

### listingTemplates (3) — all TRIM-CANDIDATE
`listByStore()` = single-field `findBy("storeId")` + in-memory `isActive` filter; `isShared`/`listingType` never filtered for this collection.

### lotteryEntries (5)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | eventId, submittedAt ASC | KEEP | `events/[id]/lottery-entries/route.ts:16-21` |
| 2 | productId, submittedAt ASC | KEEP | `products/[id]/lottery-entries/route.ts` |
| 3 | eventId, status, submittedAt ASC | TRIM-CANDIDATE | `status` filterable but no caller passes it |
| 4 | productId, status, submittedAt ASC | TRIM-CANDIDATE | same |
| 5 | userId, submittedAt | KEEP | `listForUser()` |

### moderationQueue (3) — all TRIM-CANDIDATE
`listPending()` = single-field `status==pending`, no orderBy; `mediaType`/`entityType`/`entityId` never queried.

---

## Smaller collections (batch 2)

*27 collections.*

### newsletter (2) — both TRIM-CANDIDATE (whole collection dead)
No repository/route targets literal collection `"newsletter"`. Dead duplicate of `newsletterSubscribers`.

### newsletterSubscribers (1) — KEEP
`admin/newsletter/route.ts:45-77`.

### notifications (8)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | userId, createdAt | KEEP | `notification.repository.ts:86-90` |
| 2 | userId, isRead, createdAt | KEEP | `user/notifications/route.ts:31,36-38` |
| 3 | userId, type, createdAt | KEEP | same route |
| 4 | isRead, createdAt ASC | KEEP | `getOldReadRefs()` TTL prune (`:260-267`) |
| 5 | userId, priority | TRIM-CANDIDATE | sort applied **client-side in JS**, never sent to the API |
| 6 | userId, relatedType, createdAt | TRIM-CANDIDATE | `relatedType` only ever written, never queried |
| 7 | type, createdAt | KEEP | `AdminNotificationsView.tsx:103-126` |
| 8 | type, createdAt ASC | KEEP | same |

### pageViews (1) — KEEP · passwordResetTokens (1) — KEEP
`page-views.repository.ts:67-72`; `token.repository.ts:203-210`.

### payoutMethods (3) — all TRIM-CANDIDATE (whole collection)
Only single-field `findBy("storeId")`, no sort; `sellerId` written but never queried; `isDefault` never filtered.

### procurementShipments (1) — KEEP
`shipments.repository.ts:91-105`, `AdminShipmentsView.tsx:66-98`.

### productCodes (1) — TRIM-CANDIDATE, **but this is a bug, not simple bloat**
Query exists (`refunds/actions.ts:76-79`, `orderId==`+`status==`) but runs against the **subcollection** `products/{id}/codes`, not the top-level `productCodes` collection this index declares. The index can never serve the real query. Recommend: delete this entry, add a `codes` collectionGroup index instead.

### productFeatures (3) — all KEEP
`product-features.repository.ts:94-195`.

### productTemplates (1, camelCase) — TRIM-CANDIDATE (naming-bug duplicate)
### product_templates (1, snake_case) — KEEP
Only `product_templates` is the real collection literal (`PRODUCT_TEMPLATE_COLLECTION`); `productTemplates` has zero references.

### rc (4) — all TRIM-CANDIDATE (dead feature)
"RipCoins" virtual currency system fully removed in git commit `48f86f250` ("chore: remove RC (RipCoins) virtual currency system"). These 4 indexes are leftovers.

### reports (3) — all TRIM-CANDIDATE
`listForEntity()`/`listPending()` filter single-field only + in-memory; `reporterId` write-only.

### roleOverrides (2) — both TRIM-CANDIDATE
Repository exported but **never called anywhere** in `src/app`.

### savedPaymentMethods (1) — KEEP
`saved-payment-methods.repository.ts:224-235`, `admin/payment-methods/route.ts`.

### scammerProfiles (6)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | status, createdAt | KEEP | `ScamRegistryView.tsx:35` default sort |
| 2 | status, views | KEEP | `AdminScammersView.tsx:98-132` |
| 3 | status, scamType, createdAt | KEEP | `ScamRegistryView.tsx:35,124,142` |
| 4 | status, scamPlatform, createdAt | UNSURE | sieve-filterable, no UI wires a platform filter |
| 5 | status, incidentCount | KEEP | `AdminScammersView.tsx:106`, `ScamRegistryView.tsx:37` |
| 6 | isContested, status, updatedAt | UNSURE | field written on contest actions, no confirmed query combo |

### scammers (4) — all TRIM-CANDIDATE (dead duplicate)
No repository targets literal `"scammers"` — only React-Query cache-key strings match. Real collection is `scammerProfiles`.

### serverErrors (3) — all KEEP
`_internal/server/features/maintenance/data.ts:30-63`.

### shipmentItems (3)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | lotId, createdAt ASC | UNSURE | sieve-capable; only caller never sends a `sorts` param |
| 2 | lotId, linkedProductId | KEEP | `hasLinkedItemsInLot` (`:43-49`) |
| 3 | shipmentId, linkedProductId | KEEP | `hasLinkedItems` (`shipments.repository.ts:64-71`) |

### shipmentLots (5) — all KEEP
`AdminShipmentProjectionsView.tsx:12-15`, `listByShipment` (`:23-28`).

### shippingConfigs (2) — both TRIM-CANDIDATE · storeCategories (2) — both TRIM-CANDIDATE
Both do single-field `findBy("storeId")` only; sort dropdowns exist in the UI but the routes ignore query params.

### storeGoogleConfig (1) — TRIM-CANDIDATE
`getByStore()` uses `findOneBy("storeId")` only; `isConnected` never filtered.

### storeWhatsAppConfig (1) — TRIM-CANDIDATE
Repository exported but never called anywhere.

### supportTickets (11)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | status, createdAt | KEEP | `AdminSupportTicketsView.tsx:117-150` |
| 2 | userId, createdAt | KEEP | `getUserTickets` (`:61-77`) |
| 3 | userId, status, createdAt | UNSURE | reachable via raw `filters` param, no dedicated UI |
| 4 | assignedTo, status, createdAt | UNSURE | no "my queue" UI found |
| 5 | status, priority, createdAt | KEEP | `AdminSupportTicketsView.tsx:117-151` |
| 6 | category, status, createdAt | UNSURE | no UI filter control found |
| 7 | userId, orderId, status, __name__ | KEEP | `getActiveOrderTicket` (`:97-111`) |
| 8 | userId, category, status, __name__ | KEEP | `getActiveCategoryTicket` (`:113-127`) |
| 9, 10, 11 | priority, status, createdAt/updatedAt | KEEP | `AdminSupportTicketsView.tsx:122-151` |

### testerChecklistItems (3)
| # | Fields | Verdict | Why |
|---|---|---|---|
| 1 | isActive, order | KEEP | `listActive()` (`:67-74`) |
| 2 | groupKey, order | TRIM-CANDIDATE | grouping done client-side in JS |
| 3 | pageKey, order | TRIM-CANDIDATE | same |

### testerChecklistResponses (5) — all KEEP
`admin/tester-feedback/route.ts:19-40`.

---

## Bugs Found (not index problems — code problems)

These are real defects surfaced as a byproduct of the index audit. They are **not** things to fix by editing `firestore.indexes.json`; they need a code change in the referenced file. Several of them explain why a TRIM-CANDIDATE index looked "dead" — the query it was meant to serve never actually runs.

| Area | Bug | File |
|---|---|---|
| Products | `isSold` filter ("Hide sold" toggle in Admin + Seller product views) is not declared in `SIEVE_FIELDS`, so it's silently dropped by the Sieve processor — the toggle currently does nothing at the query level. Affects ~15 product indexes. | `appkit/src/features/products/repository/products.repository.ts:461-511`; callers at `AdminProductsView.tsx:217`, `SellerProductsView.tsx:289` |
| Products | `isPartOfBundle`, `isOnSale`, `bundleItemCount`, `savingsAmount`, `prizeDrawEndDate` all have live UI sort/filter options but are absent from `SIEVE_FIELDS` — same silently-dropped-filter bug class | same file |
| Orders / Offers / Payouts | `sellerId` is referenced by 12 declared indexes across these 3 collections but **does not exist as a field** on any of the three schemas — real seller-scoping uses `storeId` or `productId in [...]` | `orders.repository.ts:339-353`, `features/seller/schemas/firestore.ts`, `features/payments/schemas/firestore.ts` |
| Bids | UI sorts reference `bidTime`/`amount`, but the real schema fields are `bidDate`/`bidAmount` | `AdminBidsView.tsx:74-80`, `user/bids/page.tsx:11-16` |
| Reviews | UI reads/sorts `publishedAt`/`isVerifiedPurchase`, neither of which exists on `ReviewDocument` (real fields: `createdAt`, `verified`) | `AdminReviewsView.tsx:93,116-123` |
| Reviews | Index #26/#27 declare `rating` twice in the same composite (`rating, status, rating`) — almost certainly a copy-paste error, likely meant to be `rating, status, publishedAt` (which is itself broken per the bug above) | `firestore.indexes.json` reviews section |
| Categories | Index #2 filters a `type` field that doesn't exist (`categoryType` is the real field) — always matches zero docs | `appkit/src/features/categories/api/route.ts:94,133,161-164` |
| Categories | `displayOrder` referenced in 2 indexes doesn't exist on `CategoryDocument` — real field is `order`; `displayOrder` is only a UI/brand-form label mapped to `order` at submit time | schema + `admin/brands` forms |
| Categories | `productCount` sort silently no-ops — real field is `metrics.productCount` | `AdminSublistingCategoriesView.tsx:49`, `CategoriesIndexListing.tsx:91` |
| Categories | Code comment claims a `showOnHomepage` filter that the code actually implements as `isFeatured` — comment/code mismatch | `_internal/server/features/categories/data.ts:24-28` |
| blogPosts | Index #7 filters a `featured` field that doesn't exist (`isFeatured` is real) — duplicate of #26 with the wrong name | schema vs. index declaration |
| Stores | 3 sort options ("Most Sales," "Top Rated," and by extension similar ones) reference `stats.itemsSold`/`stats.averageRating`, but `sieveFields` never marks them `canSort` — dead sorts in the UI today | `store.repository.ts:165-171`, `StoresIndexListing.tsx:34-35` |
| Stores | Index #15 references `stats.totalListings`, which doesn't exist — real field is `stats.totalProducts` | `stores/schemas/firestore.ts:102-105` |
| Coupons | `SellerCouponsView.tsx` filters on sieve key `"isActive"`, but the real nested field/sieve key is `"validity.isActive"` — mismatched key, filter silently dropped | `SellerCouponsView.tsx:116-117` |
| eventEntries | `AdminAllEventEntriesView.tsx` filters on sieve key `"status"`, but the live `SIEVE_FIELDS` for this repository has no `status` key at all (only `reviewStatus`) — filter silently dropped | `AdminAllEventEntriesView.tsx:68-91`, `event-entry.repository.ts:27-34` |
| eventEntries | `createEntry()` never writes `createdAt`, only `submittedAt` — any query ordering by `createdAt` (index #9's actual use) is likely operating over an always/mostly-empty field | `event-entry.repository.ts` create path |
| Sessions | `AdminSessionsView.tsx` sends an `isActive` filter chip and a "Least recent" sort option that `admin/sessions/route.ts` ignores entirely (hardcodes `lastActivity desc`, no filter) — dead controls in the UI | `admin/sessions/route.ts:25-40`, `AdminSessionsView.tsx:76-140` |
| productCodes | The declared index targets the top-level `productCodes` collection, but the only real query runs against the **subcollection** `products/{id}/codes` — index can never serve it | `refunds/actions.ts:76-79` vs. `firestore.indexes.json` |

---

## Missing-Index Candidates

Real `.where()+.orderBy()` combinations found in live code that don't match any declared index — genuine `FAILED_PRECONDITION` risk in production if that code path is exercised.

| Collection | Query | Where | Notes |
|---|---|---|---|
| products | `listingType==, status==, auctionEndDate<now` (no explicit orderBy) | `getExpiredAuctions`, `products.repository.ts:683-689` | Closest existing index (#36) has the wrong field order (range field not last); used by the auction-settlement job |
| products | `status==draft, updatedAt<cutoff` | `getStaleDraftRefs`, `products.repository.ts:765-773` | Existing #33 is `status,updatedAt DESC` — direction mismatch; used by the daily `draftPrune` job |
| orders | `productId in [...ids], status==, createdAt` | `listForSeller`, `orders.repository.ts:339-353` + `SellerOrdersView.tsx` status filter | This is what #6-10 (the dead `sellerId` indexes) should probably have been |
| orders | `productId in [...ids], totalPrice` | `listForSeller` + `ORDER_SELLER_SORT_OPTIONS` (`OrderFilters.tsx:54-61`) | Same — likely what #11-12 should have been |
| reviews | `storeId==, rating==, createdAt` (3-field) | `store/reviews/route.ts:35-43` | Not covered by #10 (storeId,rating, no createdAt) or #15 (storeId,createdAt, no rating) |
| reviews | `productId==, status==approved, rating` (3-field) | `reviews/route.ts:137-142` | #11 lacks `status` |
| sessions | `userId==, lastActivity` (no `isActive`) | `findAllForAdmin({userId})`, `session.repository.ts:302-313` | All 9 declared session indexes include `isActive`; this branch has none |
| coupons | `validity.isActive==, type==, validity.endDate` (3-field) | `CouponsIndexListing` combined filters | No 3-field index covers this combo |
| coupons | `validity.isActive==, name` | Storefront "Name A–Z/Z–A" sort (`COUPON_SORT_OPTIONS`) | No index includes `name` at all |
| events | `status==, type==, createdAt` and `status==, type==, title` | `AdminEventsView.tsx:68-118` simultaneous filter chips | Only the `startsAt` variant (#11/#23/#24) is declared |
| categories | `categoryType==, order` (2-field, no `isActive`) | `admin/brands`/`admin/sublisting-categories` default-sort fallback | Distinct from #23 (adds `name`) |
| categories | `showOnHomepage==true, order` (2-field) | public `api/route.ts:137,161-164` | Closest (#9) also requires `isActive`, not applied on this path |

This list is **not exhaustive** — the Sieve-backed repositories (products, orders, bids, payouts, offers, reviews, coupons, blogPosts, categories, faqs, stores, users, sessions) all accept client-supplied filter/sort strings, so any combination not explicitly wired into a component's sort/filter constants is a latent risk even where nothing "found in code" flagged it.

---

## Is This Safe? (read before deploying)

**Question raised 2026-08-17**: don't the 192 removed indexes back real toolbar/filter/sort controls in the UI?

**Short answer: no currently-working control depends on any of them** — but *why* splits into two very different situations, and the difference matters for what to do next.

### Category A — no control exists at all (~60 indexes)
Whole collections (`bundles`, `rc`, `scammers`, `payoutMethods`, `storeWhatsAppConfig`, etc.) either have no UI consumer at all, or their repository does `findBy()` + filters/sorts **in JavaScript after the fetch** — it never asks Firestore for that field combination in the first place. There's nothing for the index to have been backing.

### Category B — the control exists in the UI, but was already silently broken (~130 indexes)
This is the subtler and more important case. Concrete examples, all confirmed by reading the actual code before removing anything:

| Control | What it looks like it does | What actually happens |
|---|---|---|
| "Hide sold" toggle, admin/seller product views | Filters out sold products | `isSold` was never registered in the products Sieve field allowlist (`products.repository.ts:461-511`) — the filter is **silently dropped** before it reaches Firestore. The toggle has been doing nothing. |
| Admin bid sort by "time" / "amount" | Sorts bids | Schema fields are `bidDate`/`bidAmount`, not `bidTime`/`amount` — sort silently no-ops server-side; the user-facing bids page additionally sorts 100% client-side in JS and never queries Firestore with these fields at all. |
| Seller order/offer/payout scoping | Filters orders to the logged-in seller | References `sellerId`, which doesn't exist on any of the three schemas — real scoping already uses `storeId` / `productId in [...]` instead. |

In every Category B case, **Firestore was never actually being asked for that composite shape** — the Sieve processor (or the route handler, or client-side-only code) drops the field before a query is ever issued. Removing the unused index changes nothing about what currently happens when you click the toggle or pick the sort — it was already a no-op.

### The real risk — and it's about the *next* step, not this one
You separately asked me to fix these bugs (bucket 2). Once, say, `isSold` gets properly registered in the Sieve config, the query **will** start asking Firestore for `(listingType, status, isSold, createdAt)` — and if the matching index isn't back in place first, that goes from "silently does nothing" to a hard `FAILED_PRECONDITION` error, which is worse than today's silent no-op.

**Rule going forward**: for every bug fixed under bucket 2, add its composite index back to `appkit/firebase/base/firestore.indexes.json` and deploy it *before* shipping the code that starts issuing that query — never fix-then-hope. This is the same ordering CLAUDE.md already documents for any new composite query (Root Cause #2: "Missing Firestore composite indexes... Add to `firestore.indexes.json` and deploy" before the query goes live).

---

## Recommended Actions

> **Update 2026-08-17**: Buckets 1, 2, and 3 below have been **applied** and deployed. Current index count: 389 — see [`firestore-index-requirements.md`](firestore-index-requirements.md) for the up-to-date per-index mapping. A follow-up sweep of every `Admin*View`/`Seller*View` listing component's actual sort/filter wiring (not just the index side) found and fixed several more UI bugs the index-first methodology couldn't have caught — see [`firestore-index-bugfixes.md`](firestore-index-bugfixes.md) "Round 2". Bucket 4 (`UNSURE` trims) remains untouched.

These are grouped by confidence so a decision can be made per group rather than all-or-nothing.

### 1. High-confidence trims — whole collections with zero live consumers — ✅ APPLIED
`bundles` (6), `catalogProducts` (2), `brands` (2, migrated into `categories`), `newsletter` (2, dead dup of `newsletterSubscribers`), `productTemplates` camelCase (1, naming-bug dup of `product_templates`), `scammers` (4, dead dup of `scammerProfiles`), `rc` (4, feature removed in git history), `payoutMethods` (3), `reports` (3), `roleOverrides` (2), `shippingConfigs` (2), `storeCategories` (2), `storeGoogleConfig` (1), `storeWhatsAppConfig` (1), `contests` (1), `carousels` (1), `carts` (2), `adminNotifications` (2), `analyticsAlerts` (2), `analyticsCards` (2), `claimedCoupons` (2), `customRoles` (1), `itemRequests` (3), `listingTemplates` (3), `moderationQueue` (3), `testerChecklistItems` #2-3 (2).

**Also applied in the same pass** — every other *definitive* (non-UNSURE) `TRIM-CANDIDATE` row across every collection table above, including the field-name-bug-driven ones (`isSold`, `sellerId`, `bidTime`/`amount`, `publishedAt`/`isVerifiedPurchase`, `categories.type`/`displayOrder`/`productCount`, `blogPosts.featured`, `stores` stats-field mismatches, the reviews #26/#27 duplicate-field index) and the plain-unused ones (unwired sort options, methods never called). Rationale: none of these indexes serve a live query today regardless of *why* — removing them has zero functional impact now, and if a bug fix later re-enables one of these fields, the 3-line index addition is trivial to redo alongside that fix (and should be re-derived from the actual fixed implementation, not guessed in advance). **192 indexes removed in total.**

### 2. Fix the underlying bugs — ✅ APPLIED (2026-08-17)
All ~18 bugs from the "Bugs Found" table were fixed. Full writeup with before/after detail per bug is in [`firestore-index-bugfixes.md`](firestore-index-bugfixes.md). Summary: `isSold` registered in the products Sieve config (the "Hide sold" toggle now actually filters), `isPartOfBundle` + prize-reveal fields registered, the two unimplementable bundle sorts (`savingsAmount`/`bundleItemCount` — fields that never existed) removed rather than faked, bids/reviews/categories/coupons/stores field-name mismatches corrected, and the `eventEntries.status` field formalized (added to the schema — it was already being written via an `as any` cast, just never typed or filterable). The sessions admin bug went deepest: the route never read `filters`/`sorts` at all and the repository method didn't accept an `isActive` parameter — both were wired end-to-end. 26 new composite indexes were added to back the now-live queries, deployed *before* relying on the fixes.

### 3. Add the missing indexes — ✅ APPLIED
18 indexes added, covering the auction-expiry job, draft-pruning job, seller-orders listing, reviews store/product rating sorts, categories fallback paths, sessions admin-lookup, coupons combined filters, and events admin filter+sort combos. The `productCodes`/`codes` collection-name mismatch was fixed as a rename-and-correct rather than a straight add.

### 4. Lower-confidence trims (UNSURE rows) — ⏳ NOT DONE, left alone deliberately
Scattered throughout the per-collection tables — mostly Sieve-declared fields with no confirmed live caller, or code that exists but has no wired-up entry point (`groupedListings`, `scammerProfiles` #4/#6, `shipmentItems` #1, `supportTickets` #3/#4/#6, `comments`/`incidents` subcollection-scope mismatch, several `bids`/`orders`/`reviews`/`categories`/`blogPosts`/`faqs`/`payouts` rows). These were intentionally **not** removed — confidence was lower and a false trim here risks a `FAILED_PRECONDITION` in a code path the research didn't fully rule out.

### What actually happened
- `appkit/firebase/base/firestore.indexes.json`: 537 → 389 indexes (−192 from bucket 1, +18 from bucket 3, +26 from bucket 2's fixes).
- Deployed to production Firestore with `firebase deploy --only firestore:indexes --force` — `--force` was required to actually *delete* the 172 orphaned indexes still live from before this session (a plain `deploy` only adds, never removes). Confirmed settled via `wait-for-indexes.mjs` (`CREATING=0`).
- Along the way, the working file briefly diverged (duplicate entries, previously-trimmed collections reappearing) — resolved by rebuilding the file deterministically from the original 537-index ground-truth snapshot rather than debugging the divergence. See `firestore-index-bugfixes.md` for the full incident note.
- ~18 application-code bugs fixed (bucket 2) — see `firestore-index-bugfixes.md`.
- `npm run check`: TypeScript clean (0 errors, both `appkit` and consumer, after rebuilding `appkit/dist`), lint clean (0 errors). Blocked only by one pre-existing, unrelated audit failure (`audit-unknown-leakage` in `tester-checklist-response.repository.ts`, already modified before this session started) — left alone as out of scope.
- Bucket 4 (`UNSURE` rows) still untouched, as planned.

---

## Update 2026-08-19 — index *shape* mismatch (2-field vs 3-field) found and fixed

Between this file's 2026-08-17 close-out (389 indexes) and 2026-08-19, unrelated feature/schema work in other sessions added further indices in the ordinary course of shipping (new Sieve fields, new collections such as `carts`, growth in `testerChecklistResponses`, etc.) — this file's per-collection tables above were **not** re-audited line-by-line against those additions; they still reflect the 2026-08-17 state plus the specific 2026-08-19 fix documented here. Before today's fix, `appkit/firebase/base/firestore.indexes.json` stood at **404** composite indexes.

A separate pass on 2026-08-19 found that the 2026-08-17 cleanup had, in ~26 cases across 8 collections, left a **shorter index in place of the one the actual query needed** — e.g. a 2-field `(listingType, status)` index where the real filter+sort combination the view issues is 3 or 4 fields deep (`listingType, status, brand, createdAt`), or a bare `(status, createdAt)` shape where the live query also carries `isSold`/`stockQuantity`/`storeId`. These are not the same failure class as bucket-1/3 above (dead index vs missing index) — the index that *looked* like it matched was actually one field short of the query Firestore was really being asked to run, which is a silent `FAILED_PRECONDITION` risk distinct from "no index at all." Affected collections: `products` (17 new), `orders` (2), `categories` (2), `offers` (1), `newsletterSubscribers` (1), `notifications` (1), `events` (1), `faqs` (1) — **26 indexes total**, all additive (no existing entry removed or modified, per the project's index-change rule).

- `appkit/firebase/base/firestore.indexes.json`: 404 → **430** indexes (+26, all new composites, zero removals).
- Merged into the root `firestore.indexes.json` via `npm run firebase generate`, deployed via `firebase deploy --only indexes`, and confirmed fully built (`node scripts/wait-for-indexes.mjs` → `CREATING=0`) before this update was written.
- Per-index detail (fields + which query each backs) is itemized in [`firestore-index-requirements.md`](firestore-index-requirements.md) under the matching collection sections, tagged `(2026-08-19)`.
- `appkit/scripts/audit-listing-indices.mjs`'s `REPO_TO_COLLECTION` map was also widened the same day (23 previously-`[UNKNOWN_REPO]` repository variables mapped to their real collections) — rerunning it after the widening surfaced **zero** new missing-index findings beyond the 26 above, so this list is not expected to grow further from that specific gap.
