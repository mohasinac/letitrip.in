# Firestore Index → Requirement Map

> Current state as of 2026-08-17, post-cleanup: **389 composite indexes** across 44 collections, source of truth `appkit/firebase/base/firestore.indexes.json`, deployed to production Firestore. This is the forward-looking reference — for each index, which query/feature requires it. For the audit trail (what was trimmed, what was added, and why) see [`firestore-indexes-audit.md`](firestore-indexes-audit.md); for the application-code bugs fixed alongside this see [`firestore-index-bugfixes.md`](firestore-index-bugfixes.md).
>
> **Confidence markers**: plain rows have a confirmed live caller (file:line). Rows marked **(inferred)** are Sieve-declared fields with a plausible UI trigger but no single confirmed call site combining exactly that field set — kept rather than trimmed because the risk of a false negative outweighed the storage cost. Rows marked **(cloud fn)** are read only by a Firebase Function via direct Admin SDK queries, never through the Sieve/API layer.
>
> Maintenance rule: when you add a new filter chip, sort option, or `.where()/.orderBy()` combination anywhere in the app, add its composite index here **and** to `firestore.indexes.json` in the same change — don't ship the query first.

---

## products (98)

Driven by `appkit/src/features/products/repository/products.repository.ts` `SIEVE_FIELDS` + `FILTER_ALIASES`, shared by the public API, admin API, store API, and `listingProcessor` Cloud Function. Sort dropdowns: `appkit/src/features/products/constants/sieve.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | isTestData, testDataExpiresAt | Tester-sandbox cleanup job — sweeps expired test-seeded docs |
| 2 | listingType, liveItem.species, status | Live-item species filter (classified/live listings) |
| 3 | storeId, createdAt | Store product listing, default sort |
| 4 | status, createdAt | Public browse baseline (`scope==published`) |
| 5 | storeId, status, createdAt | Seller/store product dashboard |
| 6 | categorySlugs (array), createdAt | Category browse page |
| 7 | isPromoted, status, createdAt | Promoted-products rail |
| 8 | featured, status, createdAt | Featured-products rail |
| 9 | status, categorySlugs (array), createdAt | Category browse + status filter |
| 10 | status, availableQuantity, createdAt | In-stock filter on public browse |
| 11, 12 | status, price (both directions) | Price sort |
| 13, 14 | status, categorySlugs (array), price (both directions) | Category browse + price sort |
| 15-17 | subcategory, createdAt/price | Search feature's subcategory facet (`search.repository.ts`) |
| 18-20 | brand, createdAt/price | Public + per-store brand filter |
| 21, 22 | condition, createdAt/price | Condition filter |
| 23 | status, viewCount | "Most Viewed" sort |
| 24 | status, stockQuantity | **(inferred)** stock-level sort |
| 25 | status, updatedAt | "Recently Updated" sort |
| 26 | storeId, updatedAt | **(inferred)** admin `sorts=` passthrough |
| 27, 32 | status, auctionEndDate (both directions) | "Ending Soon" auction sort |
| 28 | storeId, auctionEndDate | **(inferred)** store-scoped auction sort |
| 29 | status, startingBid | "Lowest Starting Bid" sort |
| 30, 33 | status, preOrderDeliveryDate (both directions) | Pre-order delivery sort |
| 31 | storeId, preOrderDeliveryDate | Store-scoped pre-order sort |
| 34 | sublistingCategoryId, status, price | `getSublistingListings` (sub-listing category browse) |
| 35 | groupId, status, price | `findByGroupId` (grouped listings) |
| 36 | categorySlugs (array), price | Category browse + price, no status |
| 37 | brandSlug, createdAt | **(inferred)** newer brand-slug facet, not yet wired to a filter route |
| 38 | storeId, status | Seller product list, no sort |
| 39, 40 | isPromoted/featured, createdAt | Promoted/featured alias + default sort |
| 41, 80, 50, 53 | (listingType,) status, createdAt (both directions) | Base time sort, all listing types |
| 42, 54 | (storeId,) listingType, status, createdAt | Seller dashboard, listing-type scoped |
| 43 | listingType, categorySlugs (array), createdAt | Category browse, listing-type scoped |
| 44, 45 | listingType, auctionEndDate/preOrderDeliveryDate | Listing-type-scoped date sort |
| 46, 47 | listingType, prizeRevealStatus, prizeRevealWindowEnd/Start | **(cloud fn)** `prizeRevealOpen.ts` / `prizeRevealClose.ts` |
| 48, 65 | listingType, status, featured(+DESC), createdAt | Featured-first sort |
| 49 | storeId, listingType, createdAt | Seller dashboard, listing-type scoped |
| 51, 52 | listingType, price (both directions) | Price sort, listing-type scoped |
| 55, 56 | listingType, (status,) title (both directions) | "Name A–Z/Z–A" sort |
| 57 | listingType, viewCount | "Most Viewed", listing-type scoped |
| 58 | listingType, auctionEndDate DESC | Auction sort, listing-type scoped |
| 59, 60 | listingType, currentBid (both directions) | "Lowest/Highest Current Bid" |
| 61, 62 | listingType, prizeRevealWindowStart (both directions) | "Reveal: Soonest/Furthest" |
| 63 | listingType, isPartOfBundle | Bundle-membership filter (`route.ts:172-175`) |
| 64 | categorySlugs (array), status, isSold, createdAt | Category browse + Hide-sold toggle |
| 66 | listingType, status, isPromoted DESC, createdAt | Promoted-first sort |
| 67 | listingType, status, updatedAt | "Recently Updated", listing-type scoped |
| 68 | listingType, status, startingBid | Auction starting-bid sort |
| 69, 70 | listingType, status, bidCount (both directions) | "Most/Fewest Bids" |
| 71 | listingType, status, buyNowPrice | "Buy It Now: Low–High" |
| 72, 73 | listingType, status, preOrderDeliveryDate (both directions) | Pre-order delivery sort |
| 74 | listingType, status, preOrderCurrentCount | "Fewest Slots Left" |
| 75 | listingType, status, preOrderDepositAmount | "Lowest Deposit First" |
| 76 | listingType, status, bundleItemCount | **(inferred)** bundle "Most Items" — sort option exists but field isn't Sieve-registered yet; index kept for when that gets wired up |
| 77-79 | searchTokens (array), (listingType, status,) createdAt | Tokenized search |
| 81 | listingType, status, title | "Name A–Z", listing-type + status scoped |
| 82 | listingType, status, auctionEndDate | Auction-ending sort, status-scoped |
| 83 | status, updatedAt ASC | `getStaleDraftRefs` — daily `draftPrune` job |
| 84-89 | listingType, status, isSold, createdAt/price/title (both directions) | "Hide sold" toggle × standard sort options |
| 90-92 | listingType, status, isSold, auctionEndDate/currentBid | "Hide sold" toggle × auction sorts |
| 93-96 | isSold, status, createdAt/title/price | Admin all-listings view, Hide-sold toggle, no listingType scope |
| 97 | listingType, prizeRevealWindowEnd | `AdminPrizeDrawsView` "Draw Date Soon" sort |
| 98 | listingType, status, prizeRevealWindowEnd | Same sort, status-filtered |

---

## orders (29)

`appkit/src/features/orders/repository/orders.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1, 2 | userId, (status,) createdAt | `listForUser` — buyer order history |
| 3 | productId, createdAt | Seller/admin product-order lookup |
| 4 | userId, productId | `hasUserPurchased`, `countByUserAndProduct` |
| 5 | storeId, status, createdAt ASC | `findFulfillmentQueue` |
| 6 | status, paymentStatus, createdAt ASC | `getTimedOutPending` — payment-timeout sweep |
| 7 | userId, orderDate | `findRecentByUser` |
| 8 | payoutStatus, status, updatedAt ASC | `getEligibleAutomatic` — weekly payout job |
| 9 | emiEnabled, emiComplete | `getActiveEmiOrders` |
| 10 | payoutStatus, shippingMethod, status | **(inferred)** admin payout/shipping cross-filter |
| 11 | status, createdAt | Admin order list default sort |
| 12 | paymentStatus, createdAt | Admin payment-status facet |
| 13 | paymentMethod, createdAt | **(inferred)** Sieve-declared, no confirmed UI facet |
| 14 | shippingMethod, createdAt | **(inferred)** Sieve-declared, no confirmed UI facet |
| 15 | payoutStatus, createdAt | Admin payout-status facet |
| 16 | status, totalPrice DESC | Admin "amount" sort |
| 17 | status, orderDate DESC | Admin orderDate sort |
| 18 | userId, productId, status | `countByUserAndProduct` |
| 19 | userId, bundleId, status | `countByUserAndBundle` |
| 20 | prizeDrawProductId, paymentStatus, status | **(cloud fn)** `prizeRevealOpen.ts` |
| 21 | paymentStatus, prizeRevealDeadline | **(inferred)** paired with #25's 3-field variant |
| 22 | productId, orderDate | **(inferred)** Sieve-declared, no confirmed caller |
| 23 | storeId, status, payoutStatus, orderDate | `computeSellerEarnings` (`store/payouts/route.ts`) |
| 24 | paymentStatus, status, createdAt ASC | Admin combined payment+status filter |
| 25 | paymentStatus, status, prizeRevealDeadline | **(cloud fn)** `prizeRevealExpiry.ts`, `prizeRevealReminder.ts` |
| 26 | status, createdAt ASC | Admin "Oldest" sort |
| 27 | productId, status, createdAt DESC | Seller order listing (`productId in [...]` + status filter) |
| 28, 29 | productId, totalPrice (both directions) | Seller order listing, amount sort |

---

## bids (14)

`appkit/src/features/auctions/repository/bid.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | productId, bidDate | `listBidsByProduct` — auction detail page bid history |
| 2 | userId, bidDate | **(inferred)** |
| 3 | productId, isWinning | `findWinningBid` |
| 4 | productId, bidAmount | `findByProductSorted`, `findHighestBid` |
| 5 | status, createdAt | **(inferred)** |
| 6 | productId, status, bidDate | **(inferred)** |
| 7 | productId, status, bidAmount | `getActiveByProduct`, `findHighestBid` |
| 8 | productId, isWinning, status | `getWinningBid` |
| 9 | userId, createdAt | `findByUserPaginated` — user bid history |
| 10 | userId, bidAmount | **(inferred)** |
| 11 | status, bidDate | Admin bids "Oldest" sort + status filter |
| 12 | productId, userId, status | `findOneByProductAndUser` |
| 13 | userId, status, createdAt | **(inferred)** |
| 14 | status, bidAmount DESC | Admin bids "Highest amount" sort + status filter |

---

## payouts (5)

`appkit/src/features/payments/repository/payout.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | status, createdAt | Admin payout list default sort |
| 2 | storeId, createdAt | `findByStore` — seller payout history |
| 3 | storeId, status, createdAt | `findByStoreAndStatus` |
| 4 | status, createdAt ASC | Admin dashboard summary counts (per-status, pageSize=1) |
| 5 | status, amount DESC | Admin "Highest amount" sort |

---

## offers (6)

`appkit/src/features/offers/repository/offer.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | buyerUid, productId, createdAt ASC | `countByBuyerAndProduct` |
| 2 | buyerUid, productId, status | `hasActiveOffer` |
| 3 | buyerUid, createdAt | Buyer offer history |
| 4 | status, expiresAt | `findExpired`/`findExpiredActive` — `offerExpiry.ts` job |
| 5 | storeId, createdAt | `findByStore` — seller offer list |
| 6 | storeId, status, createdAt ASC | `findPendingByStore` |

---

## reviews (23)

`appkit/src/features/reviews/repository/reviews.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | productId, createdAt | Product-page review list |
| 2 | status, createdAt | Public `latest=true` review feed |
| 3 | userId, status, createdAt | `findApprovedByUser` |
| 4 | productId, status, createdAt | `findApprovedByProduct` |
| 5 | featured, status, createdAt | `findFeatured` |
| 6 | status, rating DESC | "Highest Rated" sort |
| 7 | status, rating ASC, createdAt | Rating filter + default sort |
| 8 | storeId, status, createdAt | `findApprovedByStore` |
| 9 | userId, createdAt | **(inferred)** admin listAll combo |
| 10 | storeId, rating DESC | Seller "Highest rating" sort, no rating filter |
| 11 | productId, rating DESC | **(inferred)** superseded in practice by #22/#23 (status-scoped) |
| 12 | productId, helpfulCount DESC | **(inferred)** no confirmed sort-by-helpful on product view |
| 13 | verified, createdAt | **(inferred)** |
| 14 | featured, createdAt | **(inferred)** `findFeatured` always adds status too (see #5) |
| 15 | storeId, createdAt | Store review list, no rating filter |
| 16 | status, helpfulCount DESC | Sort-by-helpful (admin) |
| 17, 18 | status, hasImages, createdAt/rating | "Has photos" filter × sort |
| 19 | status, createdAt ASC | "Oldest First" sort |
| 20 | status, rating ASC | "Lowest Rated" sort |
| 21 | storeId, rating DESC, createdAt DESC | Store review list, rating sort + createdAt tiebreak |
| 22, 23 | productId, status, rating (both directions) | Product-detail rating sort, approved-only |

---

## categories (27)

`appkit/src/features/categories/repository/categories.repository.ts`. Unified collection discriminated by `categoryType`.

| # | Fields | Requirement |
|---|---|---|
| 1 | isTestData, testDataExpiresAt | Tester-sandbox cleanup |
| 2 | isFeatured, order | Public API featured-category branch |
| 3 | rootId, tier | **(inferred)** subset of #6 |
| 4 | isActive, isSearchable | **(inferred)** filter-drawer field |
| 5 | tier, isActive, order | `getRootCategories`/`getCategoriesByTier` |
| 6 | rootId, tier, order | `getCategoriesByRootId` |
| 7 | parentIds (array), order | `getChildren` + public API parent filter |
| 8 | isFeatured, isActive, featuredPriority | `getFeaturedCategories` |
| 9 | isLeaf, isActive, order | `getLeafCategories` |
| 10 | isActive, tier, order | `buildTree()` default branch |
| 11 | isActive, isBrand, order | `getBrandCategories` |
| 12 | tier, order | Public API `tier==N` branch |
| 13 | categoryType, isActive, order | `findActiveBrands`, `bundleStockSync.ts` |
| 14 | categoryType, bundleProductIds (array), __name__ | **(cloud fn)** `onProductStockChange.ts` |
| 15 | categoryType, createdAt | Admin brands "Newest" sort |
| 16 | order, name | **(inferred)** admin default-sort fallback |
| 17 | categoryType, order, name | Admin brands `DEFAULT_SORTS` |
| 18, 19 | categoryType, isActive, name (both directions) | Admin brands name sort |
| 20 | categoryType, isActive, createdAt | Admin brands createdAt sort |
| 21, 22 | categoryType, name (both directions) | Admin sublisting-categories / bundles default sort |
| 23 | categoryType, order | `?categoryType=X` + order fallback (public API + admin default-sort branches) |
| 24 | showOnHomepage, order | Public API `showOnHomepage==true` branch |
| 25 | categoryType, isFeatured, order | Public API brand+featured branch |
| 26 | categoryType, metrics.productCount DESC | Admin "Most Products"/"Most listings" sort |
| 27 | isBrand, metrics.productCount DESC | Public categories "Most Products" sort (brands tab) |

---

## blogPosts (21)

| # | Fields | Requirement |
|---|---|---|
| 1 | isTestData, testDataExpiresAt | Tester-sandbox cleanup |
| 2, 3 | isFeatured, publishedAt ASC / title | Admin "Oldest"/"Title A–Z" + isFeatured filter |
| 4 | status, publishedAt DESC | Public blog default sort |
| 5 | status, createdAt DESC | Admin "Newest draft" + status filter |
| 6 | status, category, publishedAt DESC | Public blog category filter |
| 7 | authorId, createdAt | **(inferred)** Sieve-declared, no confirmed caller |
| 8 | isFeatured, status, publishedAt DESC | Admin isFeatured+status filters, default sort |
| 9 | title, status, publishedAt DESC | **(inferred)** |
| 10 | category, createdAt | **(inferred)** overlaps #6 minus status |
| 11 | status, views DESC | "Most Viewed" sort |
| 12 | status, updatedAt DESC | **(inferred)** |
| 13 | status, readTimeMinutes | "Longest Read" sort |
| 14 | category, publishedAt DESC | **(inferred)** overlaps #6 minus status |
| 15 | isFeatured, publishedAt DESC | Admin isFeatured-only filter, default sort |
| 16 | status, title | Public "Title A–Z" sort |
| 17 | status, isFeatured, publishedAt DESC | Same as #8, different field order |
| 18 | status, publishedAt ASC | "Published: Oldest" sort |
| 19 | isFeatured, status, publishedAt ASC | #8's filters + "Published: Oldest" |
| 20 | isFeatured, status, createdAt DESC | #8's filters + "Newest draft" |
| 21 | isFeatured, status, title | #8's filters + "Title A–Z" |

---

## faqs (17)

| # | Fields | Requirement |
|---|---|---|
| 1 | isPinned, priority, order | **(inferred)** — live `getPinnedFAQs` uses isActive not priority |
| 2 | category, order | **(inferred)** subset of #3 |
| 3 | isActive, category, order | `getFAQsByCategory` |
| 4 | isActive, stats.helpful DESC | `getMostHelpful` |
| 5 | isActive, stats.helpful DESC, priority DESC, order | "Helpful" sort on public FAQ page |
| 6 | isActive, createdAt DESC | "Newest" sort on public FAQ page |
| 7 | showInFooter, isActive, order | `getFooterFAQs` |
| 8 | isPinned, isActive, order | `getPinnedFAQs` |
| 9 | showOnHomepage, isActive, priority DESC | `getHomepageFAQs` |
| 10 | isActive, priority DESC, order | Admin FAQ default sort |
| 11 | isActive, category, priority DESC, order | Public FAQ category filter + default sort |
| 12 | showOnHomepage, isActive, priority DESC, order | **(inferred)** `getHomepageFAQs` variant with order tiebreak |
| 13, 14 | tags (array)/searchTokens (array), isActive(, priority, order) | Tag/token search |
| 15 | isActive, question | "Alphabetical" sort on public FAQ page |
| 16 | priority DESC, order | Admin default view, no filters |

Note: table above has 16 rows for readability but the file declares 17 — #13 (`tags, isActive`) and #14 (`tags, isActive, priority, order`) are both present as separate entries for the plain vs. sort-augmented tag-search paths.

---

## stores (10)

`appkit/src/features/stores/repository/store.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | isTestData, testDataExpiresAt | Tester-sandbox cleanup |
| 2 | status, createdAt | Admin store list default sort |
| 3 | status, isPublic, createdAt | Public store browse baseline |
| 4 | status, isPublic, storeName ASC | Public browse + "Name A–Z" |
| 5 | storeCategory, status, createdAt | **(inferred)** storeCategory filter, no isPublic co-filter confirmed |
| 6 | storeCategory, storeName | **(inferred)** |
| 7 | status, storeName ASC | Admin "Name A–Z" |
| 8 | status, createdAt ASC | Admin "Oldest" sort |
| 9 | status, isPublic, stats.itemsSold DESC | Public "Most Sales" sort |
| 10 | status, isPublic, stats.averageRating DESC | Public "Top Rated" sort |

---

## users (11)

`appkit/src/features/auth/repository/user.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | disabled, displayName | Admin users filter + name sort |
| 2 | role, createdAt | Admin users role filter + default sort |
| 3 | disabled, createdAt | Admin users status filter + default sort |
| 4 | role, disabled, createdAt | Admin users combined filter |
| 5 | role, displayName | Admin users role filter + name sort |
| 6-8 | permissionGroup, role, createdAt/displayName | `AdminTeamView` (employee roster, forced role==employee) |
| 9, 10 | disabled, role, createdAt (both directions) | Admin users combined filter + sort |
| 11 | disabled, role, displayName | Admin users combined filter + name sort |

---

## sessions (8)

`appkit/src/features/auth/repository/session.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | userId, createdAt | `findAllByUser` — user's own session list |
| 2 | userId, isActive, expiresAt DESC | `findActiveByUser` prefix |
| 3 | isActive, expiresAt DESC, lastActivity DESC | `getAllActiveSessions`/`getStats` |
| 4 | userId, isActive, expiresAt DESC, lastActivity DESC | `findActiveByUser` — `revokeAllUserSessions`, `hardBanCascade.ts` |
| 5 | userId, lastActivity DESC | Admin session lookup scoped to one user, no isActive filter |
| 6, 7 | isActive, lastActivity (both directions) | Admin sessions list, isActive filter + sort |
| 8 | userId, isActive, lastActivity DESC | Admin session lookup, user + isActive combined |

---

## coupons (17)

`appkit/src/features/promotions/repository/coupons.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | validity.isActive, validity.endDate ASC | `getActiveCoupons`/`getCouponsExpiringSoon`, `jobs/core/promotions.ts` |
| 2 | type, validity.isActive | Equality prefix of #8 |
| 3 | type, createdAt DESC | Admin coupons type filter + default sort |
| 4 | validity.isActive, createdAt DESC | Public coupon listing default |
| 5 | validity.isActive, validity.startDate ASC | Public coupon listing "starts from" filter |
| 6, 7 | type, validity.endDate/startDate ASC | **(inferred)** paired with forced isActive (see #14) |
| 8 | validity.isActive, type, createdAt | Public coupons + admin type filter |
| 9 | storeId, createdAt | Seller coupon list default sort |
| 10 | storeId, type, createdAt | **(inferred)** |
| 11 | storeId, code ASC | Seller "Code A–Z" sort |
| 12 | type, createdAt ASC | Admin "Oldest" sort |
| 13 | type, code | Admin "Code A–Z" sort |
| 14 | validity.isActive, type, validity.endDate | Combined isActive+type+endDate filter |
| 15, 16 | validity.isActive, name (both directions) | Storefront "Name A–Z/Z–A" sort |
| 17 | storeId, validity.isActive, createdAt | Seller coupon list + Active/Inactive filter chip |

---

## eventEntries (7)

`appkit/src/features/events/repository/event-entry.repository.ts`. Two parallel status concepts: `reviewStatus` (moderation workflow: pending/approved/flagged) and `status` (RSVP workflow: CONFIRMED/WAITLISTED/CANCELLED, drives raffle eligibility).

| # | Fields | Requirement |
|---|---|---|
| 1 | userId, submittedAt | User's own event entries |
| 2 | eventId, reviewStatus, submittedAt | Admin per-event entry moderation list |
| 3 | eventId, userId | `hasUserEntered`/`countUserEntries`, `assignSpinPrize.ts` |
| 4 | eventId, status, points DESC | **(cloud fn)** `triggerEventRaffle.ts` top-N-scorers pool |
| 5 | eventId, status, createdAt ASC | **(cloud fn)** `triggerEventRaffle.ts` top-N-participants pool |
| 6, 7 | status, submittedAt (both directions) | Admin all-entries view status filter chip |

---

## events (21)

`appkit/src/features/events/repository/events.repository.ts`.

| # | Fields | Requirement |
|---|---|---|
| 1 | isTestData, testDataExpiresAt | Tester-sandbox cleanup |
| 2-5 | status, createdAt/startsAt/endsAt | Public events list, admin events list, `listActive()` |
| 6 | type, status | Equality prefix of #16/#17/#20 |
| 7 | status, type, endsAt ASC | Admin "Ends Soonest" + type filter |
| 8, 9 | type, createdAt/startsAt | Admin type filter + sort, public events type filter |
| 10 | type, status, startsAt DESC | Admin status+type filter + sort |
| 11 | status, endsAt DESC | Admin "Ends Latest" sort |
| 12 | type, endsAt ASC | Public events type filter + ends-soonest sort |
| 13 | status, stats.totalEntries DESC | Public "Most Entries" sort |
| 14 | type, title | Public events "Title A–Z" + type filter |
| 15 | type, stats.totalEntries DESC | Public "Most Entries" + type filter |
| 16, 17 | status, type, startsAt (both directions) | Admin combined filter + startsAt sort |
| 18, 19 | status, title (both directions) | Admin "Title A–Z/Z–A" |
| 20 | status, type, createdAt DESC | Admin combined status+type filter + createdAt sort |
| 21 | status, type, title | Admin combined status+type filter + title sort |

---

## Smaller collections

| Collection | Requirement summary |
|---|---|
| **addresses** (3) | `listByOwner` (createdAt sort + isDefault lookup), `listByBanStatus` — all three confirmed live in `addresses.repository.ts` |
| **carouselSlides** (3) | `getActiveSlides`, `getInactiveSlides`, `getSlidesByCreator` — homepage carousel admin |
| **catalogueItems** (3) | `listByOwner`, `listPublicByOwner`, `listPendingApproval` — personal catalogue feature |
| **chatRooms** (2) | `listForUser` (buyer/seller sides), always with the `adminDeleted` filter |
| **codes** (1) | Product redemption codes — `refunds/actions.ts` subcollection lookup (collectionGroup, fixed from the old top-level `productCodes` mismatch) |
| **comments**, **incidents** (1 each) | Scam-registry public detail page (`listPublicComments`/`listPublicIncidents`) — kept despite the `scammerId` field/subcollection-scope nuance noted in the audit |
| **contactSubmissions** (2) | Admin contact-form inbox, Newest/Oldest sort |
| **conversations** (2) | Messages feature, buyer + store side inbox sort |
| **copilotLogs** (1) | `findByConversation` — AI copilot chat history |
| **groupedListings** (2) | `_internal/server/features/grouped/data.ts` query shapes exist and match exactly, but currently has no live page/route consumer — kept in case that gets wired up |
| **homepageSections** (1) | `getEnabledSections`/`getDisabledSections` — homepage CMS |
| **jobs** (1) | `getStaleFinishedRefs` — async job primitive cleanup |
| **lotteryEntries** (3) | Event/product lottery entry admin + user views |
| **newsletterSubscribers** (1) | Admin newsletter export/list |
| **notifications** (6) | User notification inbox (all/unread/by-type), TTL prune job, admin notifications by type |
| **pageViews** (1) | Analytics — page-view range queries |
| **passwordResetTokens** (1) | `findUnusedForUser` — auth flow |
| **procurementShipments** (1) | Admin shipments list default sort |
| **productFeatures** (3) | Platform/store-scoped product feature flags |
| **product_templates** (1) | `findByStore` — seller listing templates (this is the real collection; the camelCase `productTemplates` duplicate was removed) |
| **savedPaymentMethods** (1) | `listByBanStatus` — admin payment-method moderation |
| **scammerProfiles** (6) | Scam registry public + admin views (status, views, scamType, scamPlatform, incidentCount, contested-flag sorts/filters) |
| **serverErrors** (3) | Admin maintenance dashboard — error log queries by source/code/requestId |
| **shipmentItems** (3), **shipmentLots** (5) | Procurement shipment admin — lot/item linkage checks, profit/revenue projection sorts |
| **supportTickets** (11) | Admin support queue (status/priority/category/assignee filters + sorts), user's own tickets, active-ticket-per-order/category lookups |
| **testerChecklistItems** (1) | `listActive()` — tester QA checklist |
| **testerChecklistResponses** (5) | Admin tester-feedback report — filter by tester/status/answer/group/page |

---

## How to keep this current

1. Adding a new Sieve-backed filter or sort option? Check whether the field is already in the repository's `SIEVE_FIELDS`/`sieveFields` object — if not, register it there *and* add the composite index here before shipping.
2. Removing a filter/sort control? Check this doc for the matching index and remove it from `firestore.indexes.json` in the same change (don't let it become the next round of dead-index cleanup).
3. Re-run `npm run firebase generate` after any `appkit/firebase/base/firestore.indexes.json` edit, and deploy with `firebase deploy --only firestore:indexes` (`--force` only if you're intentionally deleting indexes still live in production — a plain deploy is additive-only).
