# Firestore Index Bug Fixes — 2026-08-17

> Companion to [`firestore-indexes-audit.md`](firestore-indexes-audit.md) — that file is the index-by-index audit (bucket 1 = trim, bucket 3 = add missing). This file documents **bucket 2**: the application-code bugs the audit surfaced, what was actually broken, and exactly what changed to fix each one. All fixes below are done; `npm run check` + a fresh index deploy still need to run as the closing step (see bottom).

## Why this file exists

The index audit found ~130 composite indexes with no live query behind them. Most were genuinely dead (unused capability, migrated-away collections). But roughly 18 of them were dead because the **application code that was supposed to use them had a bug** — a UI control (a toggle, a sort dropdown, a filter chip) that silently did nothing because it referenced a field name that didn't match the real schema/Sieve config. Removing the unused index was safe either way (nothing was querying it), but fixing the bug is a separate piece of work — this file is the record of that work.

**Ordering rule followed throughout**: for every bug fixed, the matching composite index was added back to `appkit/firebase/base/firestore.indexes.json` *before* relying on the fix, and deployed to Firestore before the code change would ever run against production data. Fix-then-hope (shipping the code first and adding the index later) was explicitly avoided per the note in the audit doc's "Is This Safe?" section.

---

## Bugs fixed

### 1. Products — `isSold` filter ("Hide sold" toggle) was a no-op
**Files**: `appkit/src/features/products/repository/products.repository.ts`
**Problem**: `AdminProductsView.tsx` and `SellerProductsView.tsx` both build a `isSold==false` Sieve filter clause when the "Hide sold" toggle is on — but `isSold` was never declared in `ProductRepository.SIEVE_FIELDS`, so the Sieve processor silently dropped the clause before it ever reached Firestore. The toggle has been visually present but functionally inert.
**Fix**: registered `isSold: { canFilter: true, canSort: true }` in `SIEVE_FIELDS`. No changes needed in the two view files — they were already building the correct filter string.

### 2. Products — `isPartOfBundle` filter was a no-op
**Files**: same repository file.
**Problem**: `src/app/api/products/route.ts` builds `isPartOfBundle==true` when the corresponding query param is set, but the field wasn't registered.
**Fix**: registered `isPartOfBundle: { canFilter: true, canSort: false }`.

### 3. Products — Prize Draw admin sort referenced a non-existent field
**Files**: `appkit/src/features/admin/components/AdminPrizeDrawsView.tsx`, `appkit/src/features/products/repository/products.repository.ts`
**Problem**: The "Draw Date Soon" sort option and the `drawDate` display column both read `item.prizeDrawEndDate` — that field has never existed on `ProductDocument`. The real field is `prizeRevealWindowEnd`.
**Fix**: renamed both references to `prizeRevealWindowEnd`; registered `prizeRevealWindowStart`, `prizeRevealWindowEnd`, and `prizeRevealStatus` in `SIEVE_FIELDS` (previously only reachable via direct Cloud Function queries, not through the admin API).

### 4. Products — Bundle "Most Savings" / "Most Items" sorts were unimplementable
**Files**: `appkit/src/features/products/constants/sieve.ts`
**Problem**: `BUNDLE_SORT_OPTIONS` offered sorts by `savingsAmount` and `bundleItemCount` — neither field exists anywhere on `ProductDocument`, and computing them would require new schema fields plus write-time calculation logic (a feature addition, not a bug fix).
**Fix**: removed the two non-functional sort options rather than inventing the feature. Left a comment explaining why, so a future session doesn't reintroduce them without also adding the underlying computation.

### 5. Bids — admin + user sort dropdowns referenced wrong field names
**Files**: `appkit/src/features/admin/components/AdminBidsView.tsx`, `src/app/[locale]/user/bids/page.tsx`
**Problem**: Both sorted by `bidTime`/`amount`; the real `BidDocument` fields are `bidDate`/`bidAmount`. On the admin side this meant the sort silently no-opped server-side. On the user bids page the sort/filter is 100% client-side JS reading `b.bidTime`/`b.amount` off the fetched objects — since those properties don't exist on the real data, every comparison was `NaN`/`undefined ?? 0`, i.e. the sort was effectively random/unstable.
**Fix**: renamed every reference (`sortOptions`, `defaultSort`, the URL-table default, the row mapper, and the client-side comparator) to `bidDate`/`bidAmount` in both files.

### 6. Reviews — admin view read/sorted by fields that don't exist
**Files**: `appkit/src/features/admin/components/AdminReviewsView.tsx`
**Problem**: Sort dropdown and default sort used `publishedAt` (real field: `createdAt`); the review detail modal read `raw.isVerifiedPurchase` for the "verified" badge (real field: `verified`).
**Fix**: renamed all three to `createdAt` / `verified`.

### 7. Reviews — malformed index (not a code bug)
The `firestore.indexes.json` entries for `(rating, status, publishedAt)` had a version where `rating` was declared twice in the same composite (`rating, status, rating`) — a copy-paste mistake in the index file itself, not application code. No code path produced this shape. Removed as part of the trim; nothing to fix here.

### 8. Categories — `type` filter always matched zero documents
**Files**: `appkit/src/features/categories/api/route.ts`
**Problem**: `GET /api/categories?type=X` built a `type==X` Sieve clause. `CategoryDocument` has no `type` field — only `categoryType`. (No live caller currently passes `?type=`, so this was dormant rather than user-visible, but it's a real landmine for the next feature that wires up this param.)
**Fix**: changed the built clause to `categoryType==X`, and swapped the `SAFE_CATEGORY_FILTER_FIELDS` allowlist entry from `"type"` to `"categoryType"` so the raw-filter passthrough path is consistent too.

### 9. Categories — "Display order" sort used the wrong field
**Files**: `appkit/src/features/admin/components/AdminBrandsView.tsx`
**Problem**: Both the default sort and the "Display order" sort option used `displayOrder`. The real Firestore field is `order` — `displayOrder` only ever existed as the *wire-format* name accepted by the create/update Zod schemas (`src/app/api/admin/brands/route.ts`), which already correctly maps it to `order` on write (`brandInputToCategoryFields()` in `appkit/src/_internal/server/features/brands/actions.ts:32`). Only the *read* side (the sort) had the bug.
**Fix**: renamed the sort key to `order`. The write path needed no change — it was already correct.

### 10. Categories — "Most Products" / "Most listings" sorts used the wrong field path
**Files**: `appkit/src/features/admin/components/AdminSublistingCategoriesView.tsx`, `appkit/src/features/categories/components/CategoriesIndexListing.tsx`
**Problem**: Both sorted by bare `productCount`; the real (and already Sieve-registered) field is the nested `metrics.productCount`.
**Fix**: renamed both sort keys to `metrics.productCount`.

### 11. Categories — homepage/menu helpers used wrong field names (currently unwired)
**Files**: `appkit/src/_internal/server/features/categories/data.ts`
**Problem**: `listFeaturedCategories()` — despite its own doc comment saying "showOnHomepage: true" — filtered on `isFeatured==true` instead. Both `listFeaturedCategories()` and `listMenuCategories()` sorted by `displayOrder`, which doesn't exist (real field: `order`). Note: neither function currently has a caller anywhere in `src/app` — this was dead code before *and* after the fix, but cheap to correct in case it gets wired up later.
**Fix**: filter changed to `showOnHomepage==true` (matching the function's stated intent); both sorts changed to `order`.

### 12. Stores — three sort options were dead because of a `sieveFields` restriction
**Files**: `appkit/src/features/stores/repository/store.repository.ts`
**Problem**: `StoresIndexListing.tsx` offers "Most Sales" (`stats.itemsSold`) and "Top Rated" (`stats.averageRating`) sorts, and a min/max products-count range filter (`stats.totalProducts`) — but `listStores()`'s inline `sieveFields` object only declared `storeName`, `storeCategory`, `status`, `isPublic`, `createdAt`. All three were silently dropped.
**Fix**: added `stats.itemsSold` (sort), `stats.averageRating` (sort), and `stats.totalProducts` (filter) to the `sieveFields` object.

### 13. Stores — dead index referenced a non-existent field (not fixed — no code bug)
The removed index `status, stats.totalListings DESC` referenced a field that has never existed on `StoreDocument` (real field: `stats.totalProducts`, already correctly used everywhere else). No code anywhere reads or sorts by `totalListings` — confirmed nothing to fix.

### 14. Coupons — seller filter used the wrong Sieve key
**Files**: `appkit/src/features/seller/components/SellerCouponsView.tsx`
**Problem**: The Active/Inactive filter chip built `isActive==X`; the real nested field (and Sieve-registered key) is `validity.isActive`.
**Fix**: changed the built clause to `validity.isActive==X`.

### 15. Event Entries — admin status filter referenced a field missing from the schema entirely
**Files**: `appkit/src/features/events/schemas/firestore.ts`, `appkit/src/features/events/repository/event-entry.repository.ts`, `src/app/api/admin/event-entries/[id]/route.ts`
**Problem**: This one was bigger than a simple rename. `AdminAllEventEntriesView.tsx`'s status filter chip, and the admin PATCH route's Confirm/Waitlist/Cancel row actions, both read/write a `status` field (`CONFIRMED`/`WAITLISTED`/`CANCELLED`) that was **completely absent from the `EventEntryDocument` TypeScript type** — only `reviewStatus` (`pending`/`approved`/`flagged`, a separate moderation workflow) was declared. The PATCH route was writing `status` anyway via `body! as any`, so real documents *do* carry the field — it was schema drift (the type was incomplete), not a fictional field. `eventEntryRepository.SIEVE_FIELDS` didn't declare it either, so the admin filter chip was silently dropped.
**Fix**: added `status?: "CONFIRMED" | "WAITLISTED" | "CANCELLED"` to `EventEntryDocument`, added it to `EVENT_ENTRY_INDEXED_FIELDS`, registered it in `SIEVE_FIELDS` (`canFilter: true`), and removed the `as any` cast in the PATCH route now that it type-checks properly.

### 16. Sessions — admin filter/sort controls were entirely disconnected from the query
**Files**: `appkit/src/features/auth/repository/session.repository.ts`, `src/app/api/admin/sessions/route.ts`
**Problem**: This was the deepest one. `AdminSessionsView.tsx` sends an `isActive` filter chip and a "Least recent" sort option, but `src/app/api/admin/sessions/route.ts` never read `filters`/`sorts` from the request at all — it only read `userId`/`limit`. The repository method it calls, `findAllForAdmin()`, didn't even accept an `isActive` or sort-direction parameter; it hardcoded `.orderBy(lastActivity, "desc")`. Both controls were fully dead end-to-end, not just Sieve-dropped.
**Fix**: extended `findAllForAdmin(options)` to accept `isActive?: boolean` and `sortAscending?: boolean`, applying a `.where(isActive==...)` clause and choosing `orderBy` direction accordingly. Updated the route to parse `isActive==true|false` out of the `filters` string and detect direction from the `sorts` string, then pass both through.

### 17. `productCodes` — index targeted the wrong collection (index-only, not a code bug)
The only real query (`refunds/actions.ts:76-79`) already correctly targets the **subcollection** `products/{id}/codes`. The index declaration in `firestore.indexes.json` named the top-level collection `productCodes`, which doesn't match the subcollection ID (`codes`) — so the index could never have served that query regardless of code correctness. Fixed by replacing the index (`collectionGroup: "productCodes"` → `collectionGroup: "codes"`, `queryScope: COLLECTION_GROUP`) — no application code changed.

### 18. Blog Posts — malformed index (not a code bug)
The removed index `status, featured, publishedAt` referenced a `featured` field that has never existed on `BlogPostDocument` (real field: `isFeatured`, already used correctly everywhere in the blog UI and API route). No code anywhere builds a bare `featured==` clause — confirmed nothing to fix; the index was a stray duplicate of the correct `status, isFeatured, publishedAt` entry.

---

## The index-file incident (and how it was resolved)

Partway through applying the indexes needed for the fixes above, `appkit/firebase/base/firestore.indexes.json` was found to contain duplicate entries and previously-trimmed dead collections (`bundles`, `rc`, etc.) that had reappeared — the working file had somehow diverged from the clean 363-index state left after bucket 1 (trim) + bucket 3 (add missing). Rather than debug the divergence, the file was **rebuilt deterministically**:

1. The original 537-index snapshot (captured verbatim before any edits, as `indexes-by-collection.md`) was reparsed back into the exact JSON shape.
2. The same 192-index removal list from the audit was re-applied.
3. The same 18 bucket-3 "missing index" additions were re-applied.
4. The 26 new indexes needed for the bucket-2 fixes above were added.
5. A duplicate-detection pass confirmed zero repeated index definitions before writing.

Final count: **537 − 192 + 18 + 26 = 389 indexes.**

## Deploy

- `npm run firebase generate` regenerated the root `firestore.indexes.json` from the corrected base file.
- `firebase deploy --only firestore:indexes --force` was run directly (the `npm run firebase deploy` wrapper doesn't forward `--force` to the underlying Firebase CLI call — `appkit/scripts/firebase-merge.mjs` hardcodes `firebase deploy --only ${targets}` with no extra-flag passthrough). Firebase reported **172 orphaned indexes** deleted — these were indexes still live in production from *before* this session's trim, since a non-`--force` deploy only adds, never removes.
- Indexes are settling; `node scripts/wait-for-indexes.mjs` confirms `CREATING=0` when done.

## Round 2 (2026-08-17, same day) — sievejs UI wiring sweep

Prompted by: "was the sievejs filters/query/pagination/sorts present? if not remove from the ui if not needed." The first round found bugs by starting from the Firestore *index* side (an index with no query behind it). This round started from the *UI* side instead — every `sortOptions`/`filterKeys` value across all Admin\*View and Seller\*View listing components — which caught several controls that never had a matching index declared in the first place, so round 1's methodology couldn't have found them.

| # | View(s) | Problem | Fix |
|---|---|---|---|
| 1 | `AdminStoreAddressesView.tsx` | Default sort + both sort options (`storeId`, `city`) were fully disconnected — `src/app/api/admin/store-addresses/route.ts` never read `sorts` at all, just returned an unsorted batch. `storeId` isn't a real field (display alias for `ownerId`); `city` is real but unregistered. | Sort in-memory in the route based on the `sorts` param — collection is low-cardinality (~35 target), no new index needed. |
| 2 | `AdminCartsView.tsx` | "Type" filter chip (Guest/Authenticated) sent `type==X`; `CartDocument` has no `type` field. The real field (`userId`) is *omitted* on guest carts, not stored as `null`, so even a corrected `userId==null` query would return zero guest carts — the fix would require a new denormalized field + backfill (a schema change, not a bug fix). | **Removed the filter chip** (`filterKeys`, `buildFilters`, `renderFilterPanel`, the now-unused `sieveFilter`/`SIEVE_OP`/`FilterChipGroup` imports) rather than ship a half-working fix. |
| 3 | `AdminHistoryView.tsx`, `AdminWishlistsView.tsx` | "Largest first" sort (`itemCount`) was ignored — both routes hardcoded `.sort((a,b) => b.updatedAt - a.updatedAt)` regardless of the `sorts` param. | Both routes now branch on `sorts.includes("itemCount")` and sort by the already-in-memory `itemCount` field (both are one-doc-per-user summaries, already fully loaded before sorting). |
| 4 | `SellerArtView.tsx`, `SellerClassifiedView.tsx`, `SellerDigitalCodesView.tsx`, `SellerLiveView.tsx`, `SellerStickersView.tsx` | "Name A–Z" sort used `productTitle` — the real, Sieve-registered field is `title`. All five are **live, rendered pages** (confirmed via consumer search in `src/app`). | Renamed `"productTitle"` → `"title"` in all five. |
| 5 | `SellerAuctionsView.tsx` | Default sort + both "Ending soon/latest" options used `endsAt` — that's an *events* field; products use `auctionEndDate`. | Renamed to `auctionEndDate`. Component confirmed **orphaned** (zero consumers in `src/app`) — fixed for correctness, not urgency. |
| 6 | `SellerPrizeDrawsView.tsx` | Same `prizeDrawEndDate` bug as `AdminPrizeDrawsView.tsx` (round 1, item 3), just not yet fixed on the seller side. | Renamed to `prizeRevealWindowEnd`, matching the admin fix. Component confirmed **orphaned**. |
| 7 | `SellerPreOrdersView.tsx` | "Delivery Soon" sort used `preorderAvailableDate` — real field is `preOrderDeliveryDate`. | Renamed. Component confirmed **orphaned**. |

**False alarms ruled out during this sweep** (worth recording so they aren't "rediscovered" later): `AdminNewsletterView` labels itself against the `newsletter` collection in the audit tooling's naive endpoint-name guess, but its route actually queries `newsletterRepository` → the real `newsletterSubscribers` collection. Same pattern for `AdminScammersView` (`scammerRepository` → real `scammerProfiles`) and `AdminBundlesView`/`SellerBundlesView` (both routes correctly query `categoriesRepository.listByType("bundle")` with a fully-working in-memory filter/sort implementation, not the dead top-level `bundles` collection). None of these needed changes.

**Also caught and corrected**: 3 index entries (`products isSold+title`, two `addresses` combos) that reappeared in `appkit/firebase/base/firestore.indexes.json` after round 1's deploy — same unexplained duplication as before. Removed again, verified an exact key-for-key match against the intended 389-index set this time, and redeployed. [`firestore-index-requirements.md`](firestore-index-requirements.md) reflects the corrected, verified-exact state.

None of round 2's fixes needed new Firestore indexes — every fix was either an in-memory sort (small/bounded collections) or a rename to a field that already had index coverage.

## Still open

- Bucket 4 (`UNSURE` trims) from the original audit were left untouched, as planned.
- `appkit/index.md` / `codebaseexports.md` were not updated — none of the changes above added or renamed a *public* export; they were internal field registrations, route fixes, and UI control removals.
- This sweep covered every `Admin*View`/`Seller*View` listing component. Public-facing and user-dashboard listing pages (outside these two directories) were not separately swept — if you want that coverage too, say so.
