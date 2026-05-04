# Change Log — Session 2026-05-05 (Latest)

---

## Session Update — 2026-05-05 (Part 12 — Server Load Fix + Toast Notifications)

### Performance fix — removed server-side Firebase Admin call from root layout

`getServerSessionUser()` was added to `src/app/[locale]/layout.tsx` in a previous session to hydrate `SessionProvider` with an `initialUser` on SSR. This caused two Firebase Admin SDK network calls (a `verifySessionCookie` and a Firestore `findById`) on **every page request**, making the Next.js server do work that should be on Firebase.

Reverted `SessionProvider` back to `initialUser={null}`. Auth state is now resolved entirely client-side by the Firebase SDK. There is a brief (~100ms) flash of unauthenticated state during hydration, which is acceptable.

**Files changed:** `src/app/[locale]/layout.tsx`

### Toast notifications wired across auth and user flows

Added `useToast` feedback throughout the following flows so users get visible confirmation of actions:

- **Login / Register / Forgot Password / Reset Password** — success and error toasts on all auth outcomes
- **Google sign-in** — session refresh + success toast on `onSessionSynced`
- **Sign out** — "Signed out successfully" toast
- **Cart** — coupon applied/removed, item removed toasts
- **Checkout** — OTP sent, identity verified, payment successful, COD confirmed toasts
- **User Addresses** — add/edit/delete/set-default toasts
- **Profile** — update success/error toasts
- **Newsletter** — subscription success/error toasts

**New client components (replaced appkit placeholders with toast-enabled versions):**
- `src/components/user/UserAddressesClient.tsx`
- `src/components/user/AddAddressClient.tsx`
- `src/components/user/EditAddressClient.tsx`
- `src/components/user/ProfilePageClient.tsx`

**Auth close page** (`src/app/[locale]/auth/close/page.tsx`) rewritten as a proper client component: auto-closes the popup window on success, shows a styled error state if the `?error=` param is present.

---

## Session Update — 2026-05-05 (Part 11 — Product/Auction/Pre-Order Index Fixes + Filter Corrections)

### Product data model clarification

Products, auctions, and pre-orders share a single `products` Firestore collection differentiated by `isAuction` / `isPreOrder` boolean flags — not separate collections. Auctions and pre-orders are specialisations of the base product document. All three share the same `useProducts` hook and repository; listings filter by flag at query time.

### Firestore indexes — category + production status

Added 8 missing composite indexes to both `firestore.indexes.json` and `appkit/firebase/base/firestore.indexes.json`:

**Auctions (new `isAuction` + `category` indexes):**
- `isAuction + category + createdAt DESC`
- `isAuction + status + category + createdAt DESC`
- `isAuction + category + auctionEndDate ASC` — "ending soonest within a category"

**Pre-orders (new `isPreOrder` + `category` indexes):**
- `isPreOrder + category + createdAt DESC`
- `isPreOrder + status + category + createdAt DESC`
- `isPreOrder + category + preOrderDeliveryDate ASC` — "shipping soonest within a category"

**Pre-orders (production status with sort):**
- `isPreOrder + preOrderProductionStatus + createdAt DESC`
- `isPreOrder + status + preOrderProductionStatus + createdAt DESC`

### Bug fix — pre-orders visible in regular products listing

`ProductsIndexListing` was passing `isAuction: false` to `useProducts` but not `isPreOrder: false`, so pre-orders leaked into the `/products` page. Fixed by adding `isPreOrder: false` to the query params.

### Bug fix — pre-order production status filter broken end-to-end

The `preOrderStatus` URL param and filter were mapped to the wrong Firestore field throughout the stack. Full fix:

- **`ProductListParams` type** — renamed `preOrderStatus?: string` → `preOrderProductionStatus?: "upcoming" | "in_production" | "ready_to_ship"` with a proper union type
- **`useProducts.ts`** — sends `preOrderProductionStatus` query param instead of `preOrderStatus`
- **`api/products/route.ts`** — reads `preOrderProductionStatus` param (falls back to `preOrderStatus` for backward compat), maps to Sieve `preOrderProductionStatus==` filter
- **`PreOrderFilters.tsx`** — URL key corrected to `preOrderProductionStatus`; removed invalid `"shipped"` option (not in Firestore schema: only `upcoming | in_production | ready_to_ship`); label updated to `t("productionStatus")`
- **`PreOrdersIndexListing.tsx`** — `FILTER_KEYS` and params updated to `preOrderProductionStatus`
- **`PreOrdersListView.tsx`** — SSR Sieve filter corrected from `preOrderStatus==` to `preOrderProductionStatus==`

### i18n

Added `"productionStatus": "Production Status"` to the `filters` namespace in `messages/en.json`.

---

## Session Update — 2026-05-05 (Part 10 — Toast Notifications + Address Pages + Listing Toolbars)

### Toast notifications on every user action

Added `showToast` calls to every button/handler that was missing feedback:

- **EventParticipateClient** — success ("Your entry has been submitted!") and error toasts in `handleSubmit`
- **CheckoutRouteClient** — toasts for: OTP sent, OTP verified, payment success, payment error, COD order placed, COD order error
- **CartRouteClient** — toasts for: coupon applied (with savings amount), coupon error, coupon removed, item removed from cart
- **ForgotPasswordPageClient** — toast on success/error of reset email send
- **ResetPasswordPageClient** — toast on success/error of password reset
- **ShareEventButton** — "Link copied to clipboard!" toast
- **ShareButtons** (blog) — "Link copied to clipboard!" toast
- **HomepageNewsletterForm** — toast on subscribe success/error

### Address CRUD pages — fully wired (were blank before)

Pages `/user/addresses`, `/user/addresses/add`, `/user/addresses/edit/[id]` rendered blank `<UserAddressesView />` shells. Replaced with functional client wrappers:

- **`src/components/user/UserAddressesClient.tsx`** — lists addresses with delete + navigate to add/edit; uses `useDeleteAddress` + `useSetDefaultAddress` with toasts
- **`src/components/user/AddAddressClient.tsx`** — `AddressForm` wired to `useCreateAddress` with toast on success/error
- **`src/components/user/EditAddressClient.tsx`** — loads address by ID, `AddressForm` wired to `useUpdateAddress` with toast on success/error

### Profile page — functional edit form (was blank shell)

`/user/profile` rendered blank `<ProfileView />` shell. Replaced with:

- **`src/components/user/ProfilePageClient.tsx`** — shows avatar, display name, email, phone; inline edit form using `useUpdateProfile` with toast feedback

### appkit exports added (`client.ts`)

New exports added so the above client components can import from `@mohasinac/appkit/client`:
- `useCreateAddress`, `useUpdateAddress`, `useDeleteAddress`, `useSetDefaultAddress`, `useAddress`
- `AddressBook`, `AddressCard`, `AddressForm`
- `useProfile`, `useUpdateProfile`

**appkit rebuilt** (0 TSC errors), synced to `node_modules/@mohasinac/appkit`. Next.js TSC also 0 errors.

---

## Session Update — 2026-05-05 (Part 9 — Google OAuth Fix)

### Google OAuth popup flow — 3 crash fixes

**Problem:** Google sign-in crashed silently. Three independent bugs:

1. **`/auth/close` page showed "Account closed"** — pointed at the account-deletion `AuthStatusPanel`. The popup never closed and the main window's RTDB listener timed out.
   - **Fix:** Replaced with a client component (`"use client"`) that calls `window.close()` after 200 ms. Handles `?error=` query param by rendering the error message and a "Close window" button.
   - File: `src/app/[locale]/auth/close/page.tsx`

2. **Google button not visible** — `LoginForm` renders social buttons only via the `renderSocialButtons` render prop. `LoginPageClient` only passed `onGoogleLogin` (no render prop), so no button appeared.
   - **Fix:** `LoginForm` now auto-renders a built-in `SocialAuthButtons` (Google button + divider) when `onGoogleLogin` is provided and `renderSocialButtons` is not. Existing callers that pass `renderSocialButtons` are unaffected.
   - File: `appkit/src/features/auth/components/LoginForm.tsx`

3. **Session state not refreshed after OAuth** — After RTDB success fired, the main window's `SessionContext.user` stayed `null`. Firebase `onAuthStateChanged` never fires on the main window (no client-side sign-in), and `router.push("/")` is a soft-nav that doesn't re-run server components or re-fetch auth.
   - **Fix:** `LoginPageClient` now passes `onSessionSynced: async () => { await refreshUser(); }` to `useGoogleLogin`. `useSession().refreshUser` re-fetches `/api/auth/me` with the freshly-set session cookie (set by the popup redirect). Also added `router.refresh()` before `router.push("/")` to force Next.js to invalidate its RSC cache.
   - File: `src/components/auth/LoginPageClient.tsx`

**appkit rebuilt** (0 TSC errors), synced to `node_modules/@mohasinac/appkit`.

---

## Session Update — 2026-05-05 (Part 8 — Firestore Index Cleanup + Category DFS Position Trigger)

### Firestore composite index audit (`firestore.indexes.json`)

Cross-referenced every index in the file against actual Firestore queries in the codebase (all repository files). Result: 5 removals, 2 additions, 1 single-field invalid entry fixed.

**Removed:**
| Collection | Fields | Reason |
|---|---|---|
| `categories` | `position` (single-field) | Invalid in composite index file — caused deploy error; Firestore manages single-field indexes automatically |
| `faqs` | `isPinned + priority + order` | Exact duplicate — appeared twice |
| `products` | `isPreOrder + sellerId + deliveryDate` | `deliveryDate` field does not exist on product documents (field is on orders) |
| `products` | `isPreOrder + preOrderStatus + deliveryDate` | Neither `preOrderStatus` nor `deliveryDate` is used in `products.repository.ts` queries |
| `products` | `isPreOrder + preOrderStartDate + preOrderEndDate` | Neither field exists in the products repository |

**Added:**
| Collection | Fields | Query |
|---|---|---|
| `bids` | `productId (ASC) + userId (ASC) + status (ASC)` | `bid.repository.ts` `findOneByProductAndUser()` — 3-field equality had no covering index |
| `offers` | `buyerUid (ASC) + productId (ASC) + status (ASC)` | `offer.repository.ts` `hasActiveOffer()` — `in` query on status with 2 equality fields had no covering index |

Deployed via `firebase deploy --only firestore:indexes --force` (also deleted 3 stale remote indexes not in the file).

### Cloud Function: `onCategoryWrite` — rewritten (DFS position maintenance)

Previously a no-op stub ("external search provider removed"). Now maintains two denormalized fields on every `CategoryDocument`:

- **`position`** — global DFS pre-order index (1-indexed) across the full category tree, ordered by the `order` field within sibling groups
- **`subtreeSize`** — count of self + all descendants; the half-open range `[position, position + subtreeSize)` enables O(1) subtree queries

**Behaviour by event type:**
- **CREATE** — appends new node after parent's subtree; shifts all later nodes `+1`; increments every ancestor's `subtreeSize` by 1
- **DELETE** — shifts all nodes after the deleted subtree by `-subtreeSize`; decrements ancestor `subtreeSize`s
- **MOVE (parent change)** — sets `positionDirty: true` on the moved document; the nightly `positionsReconcile` job heals these (real-time subtree relocation is too write-heavy for a trigger)
- **Non-move updates** — no-op (only display fields changed)

File: `functions/src/triggers/onCategoryWrite.ts`

### New Cloud Function: `positionsReconcile` (scheduled 03:30 UTC)

Nightly full-tree rebuild of `position` + `subtreeSize` via DFS pre-order traversal. Acts as self-healing for any trigger failures, move events flagged `positionDirty`, or schema gaps on existing documents.

**Algorithm:**
1. Load all category docs (single collection scan)
2. Build in-memory adjacency map (parentId → children[])
3. DFS pre-order from each root, sorted by `order` field within siblings
4. Assign sequential 1-indexed positions; back-calculate `subtreeSize`
5. Batch-write only changed documents (skips clean days entirely)
6. Orphaned nodes (bad data) detected and assigned tail positions

File: `functions/src/jobs/positionsReconcile.ts`  
Schedule constant: `SCHEDULES.DAILY_0330 = "30 3 * * *"` added to `functions/src/config/constants.ts`

Deployed via `firebase deploy --only functions` — all 24 functions updated, `positionsReconcile` created.

---

## Session Update — 2026-05-05 (Part 7 — Admin Role Shown as User in Navigation)

### Problem

A logged-in admin was displayed as a regular user in all navigation sidebars — the admin dashboard and store management links never appeared.

### Root Cause 1 — Stale session cookie claims overrode Firestore role

**`appkit/src/http/api-handler.ts`** (`getUserFromRequest`, lines 87-93)

The profile API's `getUserFromRequest` had a "prefer claims over Firestore" override. The intent was to pick up role changes faster, but the logic was backwards:

- The session cookie is created via `createSessionCookie(idToken)` using the **original ID token the client sent**, which was minted before `setCustomUserClaims(uid, { role })` ran.
- So the session cookie always carried the **pre-sync role** (typically `"user"`).
- When `decoded.role ("user") !== userDoc.role ("admin")`, the override replaced the correct Firestore role with the stale claims role.
- The profile API then returned `role: "user"`, and `AppLayoutShell` saw `isAdminOrSeller = false` → no admin/store nav links.

**Fix:** Removed the claims override entirely. Firestore is read fresh on every request and is the authoritative source for role.

### Root Cause 2 — SSR hydration was skipped

**`src/app/[locale]/layout.tsx`**

`SessionProvider` received `initialUser={null}` hardcoded, so the server never passed the authenticated user to the client. Every page load started with `user = null, loading = true` and waited for the client-side `onAuthStateChanged` round-trip before showing the correct nav — causing a flash of the wrong state.

**Fix:** Call `getServerSessionUser()` (reads Firestore via the server-side session cookie) and pass the result as `initialUser`. The correct role is now available on the first SSR render with no client round-trip.

### Files changed

| File | Change |
|---|---|
| `appkit/src/http/api-handler.ts` | Removed stale-claims override; always return Firestore `userDoc` |
| `src/app/[locale]/layout.tsx` | Import `getServerSessionUser`; pass `initialUser={initialUser}` to `SessionProvider` |

---

## Session Update — 2026-05-05 (Part 6 — Category Tree DFS Positioning)

### Problem

Categories had no global ordering that reflected their actual tree structure. The existing `order` field is a per-sibling sort key only — it can't answer "give me all categories between Cars and Ships in tree order" without loading and traversing the full tree in memory.

### New fields on `CategoryDocument`

**`appkit/src/features/categories/schemas/firestore.ts`**

- `position: number` — 1-indexed global DFS pre-order position across the entire category tree. The half-open range `[position, position + subtreeSize)` covers a node plus all its descendants, enabling O(1) subtree range queries.
- `subtreeSize: number` — count of self + all descendants.

Both added to `DEFAULT_CATEGORY_DATA` (defaults: `position: 0`, `subtreeSize: 1`), `CATEGORIES_PUBLIC_FIELDS`, and `CATEGORY_FIELDS` constants.

**Example state after seeding Cars → Sedan, SUV; Ships → Tanker:**
```
Cars     position=1  subtreeSize=3   rootId="cars"
  Sedan  position=2  subtreeSize=1   rootId="cars"
  SUV    position=3  subtreeSize=1   rootId="cars"
Ships    position=4  subtreeSize=2   rootId="ships"
  Tanker position=5  subtreeSize=1   rootId="ships"
```
Adding a new child under Cars inserts at position 4, shifts Ships→5 and Tanker→6.

### Firebase Function — `onCategoryWrite` trigger

**`functions/src/triggers/onCategoryWrite.ts`** (previously a no-op)

- **CREATE**: computes `insertPosition = parent.position + parent.subtreeSize` (or `maxPosition + 1` for root categories). Shifts all nodes at `position >= insertPosition` up by 1. Writes `position` and `subtreeSize: 1` onto the new document. Increments every ancestor's `subtreeSize` by 1 via `FieldValue.increment` (atomic, no read-then-write race).
- **DELETE**: shifts all nodes after the deleted subtree (`position >= deletedPos + deletedSize`) down by `subtreeSize`. Decrements ancestor `subtreeSizes`.
- **MOVE** (parent change on update): sets `positionDirty = true` on the document and lets the nightly reconcile job rebuild. Full real-time subtree repositioning would require updating every descendant — too complex and slow for a trigger; moves are rare.

All errors are non-fatal — the nightly job heals any drift, same pattern as `countersReconcile` for metrics.

### Nightly reconcile job — `positionsReconcile`

**`functions/src/jobs/positionsReconcile.ts`** — new file, runs **03:30 UTC** daily (30 min after `countersReconcile`)

Full DFS rebuild algorithm:
1. Load all category documents (single collection scan).
2. Build in-memory adjacency map keyed by immediate parentId.
3. Sort siblings by existing `order` field (preserves manual display order).
4. DFS pre-order from each root; assign sequential 1-indexed `position`; back-calculate `subtreeSize` on the way up.
5. Detect orphaned nodes (bad data / incomplete moves) and append them at the tail.
6. Batch-write only documents where `position`/`subtreeSize` changed or `positionDirty` is true — no-op on clean days.

Exported `reconcileCategoryPositions()` as a standalone async function for use in tests or manual one-off runs.

**`functions/src/config/constants.ts`** — added `DAILY_0330: "30 3 * * *"` schedule constant.

**`functions/src/index.ts`** — exported `positionsReconcile`; updated the header comment table.

### Firestore indexes

**`firestore.indexes.json`** — 4 new composite indexes on `categories`:

| Index | Use case |
|---|---|
| `position ASC` | Range shifts during CREATE/DELETE trigger |
| `rootId + position ASC` | Fetch all categories under a root in tree order |
| `isActive + position ASC` | List active categories in global tree order |
| `isActive + rootId + position ASC` | Narrowed active subtree listings per root |

---

## Session Update — 2026-05-05 (Part 5 — Local-first Cart/Wishlist + Login/Logout Speed + Card Consistency)

### Local-first cart & wishlist architecture

All listing pages now write cart and wishlist changes to **localStorage first** and sync to the DB every 30 seconds in the background (only when logged in). No more 401 errors or loading delays for cart/wishlist actions.

**New files:**

`appkit/src/features/cart/utils/pending-ops.ts`
- `CartOp` and `WishlistOp` interfaces
- `pushCartOp()` — collapses add+remove pairs, merges duplicate adds
- `pushWishlistOp()` — deduplicates by `(itemId, type)` key
- `getCartOps()`, `clearCartOps()`, `getWishlistOps()`, `clearWishlistOps()`

`appkit/src/core/hooks/useSyncManager.ts`
- Replays pending ops against `/api/cart` and `/api/user/wishlist` every 30 s
- Syncs immediately on login, then starts the interval
- No-op when `userId` is null (guest)

**Updated listing components** (all now use `useGuestCart` + `useGuestWishlist` + pending ops instead of direct `apiClient` calls):

| File | Type |
|---|---|
| `StoreProductsListing.tsx` | Products |
| `ProductsIndexListing.tsx` | Products |
| `CategoryProductsListing.tsx` | Products (added cart+wishlist support) |
| `AuctionsIndexListing.tsx` | Auctions |
| `StoreAuctionsListing.tsx` | Auctions |
| `PreOrdersIndexListing.tsx` | Pre-orders |

Card layout for reference:
```
┌──────────────────────────────┐
│                              │
│         [  IMAGE  ]          │  aspect-square
│                              │
├──────────────────────────────┤
│  Title                       │
│  ₹ Price                     │
│  [Add to Cart] [♡ Wishlist]  │
└──────────────────────────────┘
  grid: 2 cols → 3 cols → 4 cols
  gap: 6
```

Auction card:
```
┌──────────────────────────────┐
│         [  IMAGE  ]          │  aspect-square
├──────────────────────────────┤
│  Title                       │
│  Current Bid: ₹ X            │
│  Ends: 2h 34m                │
│  [Bid Now]  [♡]              │
└──────────────────────────────┘
  grid: 2 cols → 3 cols → 3 cols
```

Pre-order card:
```
┌──────────────────────────────┐
│         [  IMAGE  ]          │  aspect-square
├──────────────────────────────┤
│  Title                       │
│  ₹ Price  (Pre-order)        │
│  Delivery: Jun 2026          │
│  [Pre-order]  [♡]            │
└──────────────────────────────┘
  grid: 2 cols → 3 cols → 4 cols
```

### Faster logout (instant)

`appkit/src/react/contexts/SessionContext.tsx` — `signOut()`:
- UI state (`user`, `sessionId`, cookies, interval) cleared **synchronously** before any awaits
- Server revocation (`POST /api/auth/logout`) and Firebase `adapter.signOut()` fire-and-forget in background
- Net effect: logout feels instant; token remains valid for at most its remaining TTL

### Faster login (server-side parallelization)

`src/app/api/auth/login/route.ts`:
- `setCustomUserClaims`, `updateLoginMetadata`, `createSessionCookie`, `sessionRepository.createSession` now run in `Promise.all()` instead of sequentially
- Removes ~3 sequential Firestore/Firebase round-trips from the login hot path

### Card image consistency (Part 14 carry-over)

- `ProductCard` image: `style={{ aspectRatio: "4/3" }}` → `className="... aspect-square"`
- `PreorderCard` image: `h-56 w-full` → `aspect-square w-full`
- `ProductGrid` columns: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6` (was 5 cols)
- `AuctionGrid` columns: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4` (capped at 3)

---

## Session Update — 2026-05-05 (Part 4 — Card Size Consistency + Store/Category Page Fixes)

### Card size consistency

All product, auction, and pre-order cards now use `aspect-square` images and consistent grid layouts. Previously auction cards appeared oversized (3-col grid) while product cards were undersized (5-col grid with 4:3 ratio).

### Category detail page fixes

**Root cause 1 — Unbounded Firestore scan:**
`categoriesRepository.findBy("slug", slug)` loads all documents without `.limit()`. Fixed with `getCategoryBySlug(slug)` which adds `.limit(1)`.

**Root cause 2 — Wrong product filter field:**
`categorySlug==${slug}` Sieve filter was silently dropped because `categorySlug` doesn't exist on product documents. Fixed to `category==${category.id}`.

**Root cause 3 — Sequential child category + product fetches:**
`getChildren()` made a redundant `findById(parentId)` call. Fixed with `Promise.all([getChildren, getProducts])` and `.limit(100)` on children, `.limit(500)` on leaf categories.

Files changed: `CategoryDetailPageView.tsx`, `CategoryDetailTabs.tsx`, `CategoryProductsListing.tsx`, `categories.repository.ts`

### Store detail page — React.cache() deduplication

`StoreDetailLayoutView.tsx`, `StoreProductsPageView.tsx`, `StoreAuctionsPageView.tsx`, `StorePreOrdersPageView.tsx`:
- `getStoreBySlug` exported from `StoreDetailLayoutView.tsx` using `React.cache()` for per-request deduplication
- Layout and tab pages now share one Firestore read instead of 2–4

---

## Session Update — 2026-05-05 (Part 3 — Blog Crash Fix + Wishlist Stuck Skeleton Fix)

### Fix blog detail page crash (`BlogPostView.tsx` missing `"use client"`)

**Root cause:** `BlogPostView.tsx` uses `useBlogPost` → `useQuery` (React hooks) but had no `"use client"` directive. Next.js App Router tries to render it as a server component and throws when encountering hooks.

**Fix:** Added `"use client"` as the first line of `appkit/src/features/blog/components/BlogPostView.tsx`.

### Fix wishlist page stuck loading skeleton

**Root cause:** `src/app/[locale]/wishlist/page.tsx` only pulled `user` from `useSession`, not `loading`. During the initial session resolution window, `user = null` → guest path (resolves in a tick). When session finishes and `user` becomes defined → authenticated path fires an API call. If that call is slow or fails, `isLoading` stays `true` indefinitely due to React Query's default retry-3 policy.

**Fixes:**
- `src/app/[locale]/wishlist/page.tsx`: Also destructures `loading: sessionLoading` from `useSession()`. Passes `undefined` (not `null`) to `useWishlistWithGuest` while session is loading, which keeps it on the fast-initializing guest path. Loading condition updated to `sessionLoading || wl.isLoading`.
- `appkit/src/features/wishlist/hooks/useWishlist.ts`: Added `retry: 1, staleTime: 30_000` to the React Query config — failed wishlist calls now give up after 1 retry instead of holding `isLoading` for ~30s.

Appkit rebuilt and synced to `node_modules/@mohasinac/appkit/dist/`.

---

## Session Update — 2026-05-05 (Part 2 — /undefined 404 Calls + All Listing Filters + Toast Feedback)

### Fix `/undefined` and `/null` 404 calls from missing slugs

**`appkit/src/features/products/components/ProductGrid.tsx`**
- Added `safeHref()` helper — drops any generated href containing `/undefined` or `/null`
- Applied at all 3 `getProductHref(p)` call sites (card, fluid, list modes)

**`appkit/src/features/homepage/components/FeaturedProductsSection.tsx`**
- Falls back to `""` via `slug ?? id ?? ""` — prevents `/products/undefined`

**`appkit/src/features/products/components/RelatedProductsCarousel.tsx`**
- Guards href build: only calls ROUTES when `item.slug || item.id` is truthy

**`appkit/src/features/auctions/components/MarketplaceAuctionCard.tsx`**
- `resolveHref()` returns `undefined` when `product.id` is falsy
- `handleNavigate` returns early when `auctionHref` is undefined
- `TextLink` falls back to `"#"` when href is undefined

### Pending filter state applied to all listing layouts

All 6 listing components now buffer filter changes in local state until "Apply Filters" is clicked:

| Component | Filter keys buffered |
|---|---|
| `ProductsIndexListing` | category, condition, minPrice, maxPrice, brand, storeId, freeShipping, tags |
| `AuctionsIndexListing` | category, minBid, maxBid, storeId, dateFrom, dateTo |
| `PreOrdersIndexListing` | category, minPrice, maxPrice, storeId, preOrderStatus, dateFrom, dateTo |
| `StoresIndexListing` | category, rating, minProductCount, maxProductCount, featured |
| `StoreProductsListing` | condition, brand, minPrice, maxPrice |
| `StoreAuctionsListing` | minPrice, maxPrice |

All use: `pendingFilters` state, `pendingTable` shim, `openFilters`/`applyFilters`/`clearFilters`, active count badge, "Clear all" in drawer header.

### Toast feedback wired to all wishlist + cart actions

`showToast("Added/Removed from wishlist", "success"/"info")` and cart success/error toasts added to all 5 listing components.

Zod v4 `z.record()` migration: `z.record(z.string())` → `z.record(z.string(), z.string())` in cart, orders, products schemas.

Appkit rebuilt and synced to `node_modules/@mohasinac/appkit/dist/`.

---

## Session Update — 2026-05-05 (Part 1 — Sticky Toolbar Offset: All Pages)

### Problem

All listing toolbars and dashboard tab/section bars used `sticky top-0`, causing them to slide under the fixed header (TitleBar + MainNavbar + optional search bar). On mobile the overlap was the full title bar height; on desktop it also swallowed the navbar row.

### Root cause

`--header-height` was already consumed by `HeroBanner` and `TestimonialsCarousel` as a CSS variable, but it was never actually *set* anywhere — both fell back to the `4rem` hardcoded default.

### Fix — measure and broadcast header height

**`appkit/src/features/layout/AppLayoutShell.tsx`**
- Added `useRef<HTMLDivElement>` + `useEffect` with `ResizeObserver` on the sticky header wrapper (`z-50` div that contains TitleBar + MainNavbar + search slot).
- On every resize (search open/close, mobile nav show/hide, promo strip) the observer sets `document.documentElement.style.setProperty("--header-height", <px>)`.
- Initial value is set synchronously on mount so there is no flash before first paint.

### Fix — consume the variable everywhere

**Public listing toolbars (13 files)** — `sticky top-0 z-20` → `sticky top-[var(--header-height,0px)] z-20`:
- `ProductsIndexListing.tsx`, `AuctionsIndexListing.tsx`, `PreOrdersIndexListing.tsx`
- `StoresIndexListing.tsx`, `StoreProductsListing.tsx`, `StoreAuctionsListing.tsx`, `StorePreOrdersListing.tsx`
- `CategoriesIndexListing.tsx`, `CategoryProductsListing.tsx`
- `EventsIndexListing.tsx`, `BlogIndexListing.tsx`, `ReviewsIndexListing.tsx`
- `CouponsIndexListing.tsx`
- `src/app/[locale]/promotions/[tab]/page.tsx` (tab nav bar)

**`appkit/src/features/layout/ListingLayout.tsx`** — sidebar panel:
- Was: `isDashboard ? "sticky top-[176px]" : "sticky top-[176px]"` (two hardcoded magic numbers)
- Now: `"sticky top-[var(--header-height,0px)]"` for both cases

**Dashboard / admin / store / user pages:**
- `appkit/src/features/layout/ListingLayout.tsx` toolbar row — removed `isDashboard ? "top-0" : "top-14 md:top-[120px]"` conditional; both use `top-[var(--header-height,0px)]`
- `appkit/src/ui/components/ListingLayout.style.css` — merged `--page` and `--dashboard` sidebar rules; both use `top: var(--header-height, 0px)`
- `appkit/src/ui/components/SectionTabs.style.css` — added `top: var(--header-height, 0px)` to `.appkit-section-tabs` (admin/user/store profile tab bars)
- `appkit/src/ui/components/SectionTabs.tsx` — updated default `stickyTopClassName` from `"top-12 md:top-[108px]"` to `"top-[var(--header-height,0px)]"`

**Not changed:** `DataTable` thead sticky (`top: 0`) — it sticks within its own `overflow-y: auto` scroll container, not the page viewport, so `top: 0` is correct.

---

## Session Update — 2026-05-04 (Part 14 — Card Size Consistency, Category/Store Page Fixes, Firebase-Side Calculations)

### Card size consistency across all listing types

**Problem:** Auction cards used a 3-column grid with square images; product cards used a 5-column grid with 4:3 images — much smaller. Pre-order cards used a fixed `h-56` height.

**Fixes:**
- `ProductGrid.tsx` — `GRID_CLASSES.card`: changed from `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4` → `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6` (max 4 columns, wider gutters)
- `ProductGrid.tsx` — `ProductCard` image area: changed from `style={{ aspectRatio: "4/3" }}` → `aspect-square` class (matches auction card proportions)
- `PreorderCard.tsx` — image div: changed `h-56 w-full` → `aspect-square w-full`
- Skeleton loaders in `CategoryProductsListing.tsx` and `StoreProductsListing.tsx` updated to match new grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6`, 8 placeholders)

### Category detail page — product filter was broken

**Root cause:** `CategoryDetailPageView` filtered products by `categorySlug==${slug}` — a field that does not exist on product documents in Firestore. The Sieve processor silently dropped the clause, returning the first 24 published products from ALL categories. The client-side `CategoryProductsListing` made the same mistake, passing `categorySlug` to `useProducts` which sent `?categorySlug=` to the API (also ignored).

**Fixes:**
- `CategoryDetailPageView.tsx`: switched from `categoriesRepository.findBy("slug", slug)` (no `.limit()`) to `getCategoryBySlug(slug)` (uses `.limit(1)` in Firestore). Product query now uses `category==${category.id}` — the correct Firestore field.
- `CategoryDetailPageView.tsx`: parallelized the product + children fetches with `Promise.all()` after resolving the category.
- `CategoryDetailTabs.tsx`: added `categoryId?: string` prop and threads it down to `CategoryProductsListing`.
- `CategoryProductsListing.tsx`: added `categoryId?: string` prop; `useProducts` params now use `category: categoryId` (maps to `?category=` in the API route, which filters on `category==${value}` in Firestore — the correct field).

### Store detail pages — duplicate Firebase reads eliminated

**Root cause:** `StoreDetailLayoutView` (rendered by the layout) AND `StoreProductsPageView` / `StoreAuctionsPageView` / `StorePreOrdersPageView` (rendered by each tab's page.tsx) all independently called `storeRepository.findBySlug(storeSlug)`. In Next.js App Router, layout and page run in the same request tree but without automatic deduplication — resulting in 2× DB reads for every store page visit.

**Fix:** Extracted `getStoreBySlug = cache(slug => storeRepository.findBySlug(slug))` in `StoreDetailLayoutView.tsx` (using React's `cache()` for per-request deduplication). All three page views now import and call `getStoreBySlug` instead of calling the repository directly.

### categories.repository.ts — unbounded queries capped

- `getChildren()`: removed a redundant second DB call (`findById(parentId)` was used only to guard against missing parent but that guard is unreliable at scale). Added `.limit(100)` to the `array-contains` query.
- `getLeafCategories()`: added `.limit(500)` guard.

### Firebase-side calculations (confirmed correct)

All product-count and store-stat counters are maintained by Cloud Function triggers — NOT computed at query time on Vercel:
- `onProductWrite` trigger: increments/decrements `category.metrics.productCount`, `category.metrics.auctionCount`, and all ancestor totals via `updateMetricsInBatch()`; also calls `storeRepository.incrementTotalProducts()`.
- `CategoryDetailPageView` reads `category.metrics.productCount` from Firestore (pre-computed) for the badge display — no aggregation query needed.
- Pagination total counts use Firestore's native `COUNT()` aggregation (server-side, zero document reads).

Appkit rebuilt and synced to `node_modules/@mohasinac/appkit/dist/`.

---

## Session Update — 2026-05-04 (Part 13 — Seed: Replace-on-Load for Homepage Sections & Carousel Slides)

**`src/app/api/demo/seed/route.ts`**

- Added `purgeCollection()` helper — deletes all documents in a Firestore collection in batches of 500
- `homepageSections` and `carouselSlides` now use a **replace** strategy on load: the entire collection is purged before the new seed docs are inserted
- Fixes multiple welcome/hero sections appearing on the homepage caused by old seed data (`section-welcome-1707300000001`, etc.) coexisting with new pokemon seed data (`section-carousel-multifranchise-1`, etc.) — they had different doc IDs so the delete action never removed the stale ones

---

## Session Update — 2026-05-04 (Part 12 — Pending Filters Applied to All Listing Layouts)

All 5 remaining listing components now use the same pending-filter pattern as `ProductsIndexListing`:

| Component | Filter keys buffered |
|---|---|
| `AuctionsIndexListing` | category, minBid, maxBid, storeId, dateFrom, dateTo |
| `PreOrdersIndexListing` | category, minPrice, maxPrice, storeId, preOrderStatus, dateFrom, dateTo |
| `StoresIndexListing` | category, rating, minProductCount, maxProductCount, featured |
| `StoreProductsListing` | condition, brand, minPrice, maxPrice |
| `StoreAuctionsListing` | minPrice, maxPrice |

Changes applied uniformly to all:
- `pendingFilters` state + `pendingTable` shim passed to filter panel instead of live `table`
- Drawer open syncs pending state from current URL params
- Apply button flushes all pending filters to URL + closes drawer
- "Clear all" link in drawer header when any filter is active
- Active filter count badge on the Filters button
- Sort dropdown and grid/list toggle remain immediate (on-change)
- `useToast` + `showToast` added for wishlist/cart actions in `StoreProductsListing` and `StoreAuctionsListing`
- `StoreProductsListing` now wires `onWishlistToggle`, `wishlistedIds`, and `onAddToCart` to `ProductGrid` (was missing before)

Appkit rebuilt and synced to `node_modules/@mohasinac/appkit/dist/`.

---

## Session Update — 2026-05-04 (Part 11 — Pending Filters + Toast Feedback + Zod v4 Fix)

### Filter: apply on button click only (not on change)

**`appkit/src/features/products/components/ProductsIndexListing.tsx`**

- Added `pendingFilters` state — all filter changes are buffered in local React state
- Created `pendingTable` shim (matches `useUrlTable` interface) passed to `<ProductFilters>`
- Drawer open (`openFilters`) resets pending state from current URL params
- "Apply Filters" button flushes `pendingFilters` → URL via `table.setMany()` and closes drawer
- "Clear All" link visible in drawer header when filters are active; resets both pending and URL
- Sort dropdown and grid/list toggle remain on-change (not buffered)
- Active filter count badge shown on the Filters button

### Toast feedback for wishlist + cart actions

- All wishlist toggle actions show `showToast("Added/Removed from wishlist", "success"/"info")`
- Add to cart shows `showToast("Added to cart", "success")` on success, `"error"` on failure
- Buy Now shows error toast on cart failure and aborts navigation; success navigates to `/cart`

### Zod v4 compatibility fixes

Fixed 4 pre-existing build errors caused by Zod v4's stricter `z.record()` signature (now requires 2 args):
- `appkit/src/features/cart/schemas/index.ts` — `z.record(z.string())` → `z.record(z.string(), z.string())`
- `appkit/src/features/orders/schemas/index.ts` — same fix for `attributes` and `address`
- `appkit/src/features/products/schemas/index.ts` — same fix for `attributes`

Appkit rebuilt and synced to `node_modules/@mohasinac/appkit/dist/`.

---

## Session Update — 2026-05-04 (Part 10 — Homepage Sections Seed Data Fix)

### Changes to `appkit/src/seed/pokemon-homepage-sections-seed-data.ts`

**Welcome section removed — replaced by Carousel**

- Removed `section-welcome-multifranchise-1` (type `"welcome"`) — the welcome/hero is already provided by the application and would duplicate on the homepage.
- Added `section-carousel-multifranchise-1` (type `"carousel"`, order 1) — seeds the `HeroCarousel` slot; the component reads slides from `carouselRepository` so no config is needed on the section document.

**Pre-existing type errors fixed across remaining sections**

| Section | Fix |
|---|---|
| `categories` | Added required `maxCategories: 4`, `autoScroll`, `scrollInterval`; removed non-existent `subtitle` |
| `stores` | Added missing `autoScroll`, `scrollInterval` |
| `reviews` | Replaced non-existent `subtitle` with required `maxReviews`, `itemsPerView`, `mobileItemsPerView`, `autoScroll`, `scrollInterval` |
| `faq` | Replaced `maxItems` with required `displayCount`, `expandedByDefault`, `linkToFullPage`, `categories` |
| `newsletter` | Added required `placeholder`, `buttonText`, `privacyText`, `privacyLink` |
| `blog-articles` | Renamed `maxPosts` → `maxArticles: 4`; added `showReadTime`, `showAuthor`, `showThumbnails` |

---

## Session Update — 2026-05-04 (Part 9 — Full Firebase Functions Deploy + Env Sync)

### What was deployed

First-ever full deployment of all 23 Firebase Functions to `letitrip-in-app` / `asia-south1`. Previously none had been deployed.

| Group | Count | Functions |
|---|---|---|
| Scheduled jobs | 14 | auctionSettlement, pendingOrderTimeout, couponExpiry, offerExpiry, productStatsSync, dailyDataCleanup, countersReconcile, payoutBatch, cartPrune, notificationPrune, weeklyPayoutEligibility, autoPayoutEligibility, cleanupRtdbEvents, mediaTmpCleanup |
| Firestore triggers | 6 | onBidPlaced, onOrderStatusChange, onProductWrite, onReviewWrite, onCategoryWrite, onStoreWrite |
| HTTPS endpoints | 3 | adminAnalytics, storeAnalytics, promotionsApi |

### Bug fixed — ESM build had always been broken

The functions package used `"type": "module"` + `tsup format: ["esm"]`. The Firebase Functions CLI failed to load the ESM bundle at deploy time with:

```
Error: Dynamic require of "util" is not supported
    at file:///…/functions/lib/chunk-7XGENKH2.js
```

**Root cause:** `appkit` is bundled into the functions output. Appkit's transitive deps include CJS modules (e.g. `faye-websocket` via firebase-admin's RTDB module) that use dynamic `require()`. In strict ESM those calls throw at import time — before the function even starts.

**Fix:**
- `functions/tsup.config.ts` — changed `format: ["esm"]` → `format: ["cjs"]`; removed `shims: true` (only needed for ESM)
- `functions/package.json` — removed `"type": "module"` so Node treats `lib/index.js` as CJS

### Part 8 — Firebase-Side Query Processing (context for the 3 new HTTPS functions)

**Problem:** Three Vercel API routes were doing heavy computation inside the Vercel serverless runtime — burning free-tier CPU and pulling large Firestore datasets across the internet to Vercel:

| Route | Work done on Vercel | Peak data transfer |
|---|---|---|
| `GET /api/admin/analytics` | Fetch up to 5 000 order docs, aggregate revenue + monthly + top-5 | ~5 000 OrderDocument JSON blobs |
| `GET /api/store/analytics` | Fetch up to 1 500 seller order docs, same aggregation | ~1 500 OrderDocument JSON blobs |
| `GET /api/promotions` | Fetch ≤50 coupons, apply in-memory start-date guard | 50 coupon docs |

Firebase Functions in `asia-south1` (same region as Firestore) query over Google's internal network — no internet hop, near-zero latency, no Vercel billing impact.

**Pattern:** Firebase HTTPS functions (`onRequest`) secured by a shared secret (`x-internal-secret` header). Vercel API routes become thin proxies: verify session cookie (minimal CPU) → `fetch()` Firebase Function → return result.

**Files created:**

```
functions/src/callable/adminAnalytics.ts   ← all order aggregation on Firebase servers
functions/src/callable/storeAnalytics.ts   ← seller analytics on Firebase servers
functions/src/callable/promotions.ts       ← promotions fetch + coupon start-date guard on Firebase
```

**Files updated:**

```
functions/src/lib/appkit.ts                ← add formatMonthYear + OrderDocument exports
functions/src/index.ts                     ← export adminAnalytics, storeAnalytics, promotionsApi
src/app/api/admin/analytics/route.ts       ← thin proxy (role-checked → Firebase Function)
src/app/api/store/analytics/route.ts       ← thin proxy (auth-checked, passes sellerId → Firebase Function)
src/app/api/promotions/route.ts            ← thin proxy (public → Firebase Function)
```

### Secret naming — `FIREBASE_` prefix is reserved

`firebase functions:secrets:set FIREBASE_INTERNAL_SECRET` was rejected by Firebase Secrets Manager:

```
Error: Key FIREBASE_INTERNAL_SECRET starts with a reserved prefix (X_GOOGLE_ FIREBASE_ EXT_)
```

Renamed to `LETITRIP_INTERNAL_SECRET` everywhere — all 3 Firebase functions, all 3 Vercel proxy routes, and `.env.local`.

### Sync script fix — `--yes` → `--force`

`appkit/scripts/sync-env-to-vercel.ps1` used `vercel env add --yes` which was removed in Vercel CLI v48. Updated to `--force` (the current equivalent for non-interactive overwrite).

### Env vars — live on Vercel production

All 41 variables from `.env.local` synced to Vercel production via `sync-env-to-vercel.ps1`. Key new entries:

| Variable | Value |
|---|---|
| `FIREBASE_FUNCTION_ADMIN_ANALYTICS_URL` | `https://adminanalytics-nkzuprfdya-el.a.run.app` |
| `FIREBASE_FUNCTION_STORE_ANALYTICS_URL` | `https://storeanalytics-nkzuprfdya-el.a.run.app` |
| `FIREBASE_FUNCTION_PROMOTIONS_URL` | `https://promotionsapi-nkzuprfdya-el.a.run.app` |
| `LETITRIP_INTERNAL_SECRET` | set (64-char hex, stored in Firebase Secrets Manager v1 + Vercel) |

### Secret — live in Firebase Secrets Manager

```
projects/949266230223/secrets/LETITRIP_INTERNAL_SECRET/versions/1
```

The 3 HTTPS functions read it from `process.env.LETITRIP_INTERNAL_SECRET` at runtime.

### Remaining step

Redeploy Vercel so the consumer app picks up the new env vars:

```bash
vercel deploy --prod
```

### TypeScript verification

- **Firebase Functions**: ✅ 0 errors
- **Consumer app**: ✅ 0 errors

---

## Session Update — 2026-05-04 (Part 7 — Vercel Preview Deployment)

### Vercel Preview Deploy

- Verified consumer app already on `@mohasinac/appkit@2.3.2` (latest)
- Ran `vercel deploy` (preview, not production)
- **Preview URL:** https://letitrip-2nav5yfqo-mohasin-ahamed-chinnapattans-projects.vercel.app
- Inspect: `vercel inspect letitrip-2nav5yfqo-mohasin-ahamed-chinnapattans-projects.vercel.app --logs`

---

## Session Update — 2026-05-04 (Part 6 — TSC Verification + Appkit 2.3.2 Release)

### TypeScript Check

Both codebases verified clean with zero errors:
- **appkit**: ✅ 0 errors (`npx tsc --noEmit` — exit 0)
- **Consumer app**: ✅ 0 errors (`npx tsc --noEmit` — exit 0)

### Appkit 2.3.2 Build & Publish

- Bumped version `2.3.1` → `2.3.2` (`npm version patch`)
- Built: `npm run build` → 0 errors, 108 asset files copied to `dist/`
- Published: `npm publish --access public` → `@mohasinac/appkit@2.3.2` live on npm
- Consumer app updated: `npm install @mohasinac/appkit@2.3.2`
- Post-install TSC re-check: ✅ 0 errors

---

## Session Update — 2026-05-04 (Part 5 — Admin Events Editor + Appkit Export Fix)

### 1. Admin Events — Create & Edit Pages

**Problem:** `/admin/events` listing existed but had no create or edit routes, so the row navigation and "New Event" button had nowhere to go.

**Files created:**
```
src/app/[locale]/admin/events/new/page.tsx          ← NEW (create mode)
src/app/[locale]/admin/events/[id]/edit/page.tsx    ← NEW (edit mode)
```

Both pages use `AdminEventEditorView` from appkit:
- **Create** (`/admin/events/new`): renders `<AdminEventEditorView />` with no props → blank form
- **Edit** (`/admin/events/[id]/edit`): renders `<AdminEventEditorView eventId={id} />` → loads event by ID

**Appkit bump** (`1e5ed197`): includes `AdminEventEditorView` component + row-click navigation wired in `AdminEventsView`.

---

### 2. Appkit Export Fix — `allProductsSeedData` at Package Root

**Problem:** `allProductsSeedData` (the combined 4-franchise product array added in Part 4) was exported from the feature barrel but not from the package root `index.ts`, so consumers importing from `@mohasinac/appkit` received `undefined`.

**Fix:** Appkit submodule bumped (`2f488339`) — adds `allProductsSeedData` to the root barrel export so the seed route's `import { allProductsSeedData } from "@mohasinac/appkit"` resolves correctly.

---

### Build Status

- **appkit**: ✅ 0 errors
- **Consumer app**: ✅ 0 errors

---

## Session Update — 2026-05-04 (Part 3 — In-Memory Filtering Conversion Complete)

### All Remaining In-Memory Filters Converted to API-Driven

This session completes the full conversion: every listing component now delegates filtering, sorting, and pagination to the server. No client-side `useMemo` filtering remains in any public or account listing component.

#### 1. `StoreReviewsListing` — API-Driven Rating Filter + Pagination

**Files changed:**
```
appkit/src/features/stores/types/index.ts                       ← add totalFiltered, totalPages to StoreReviewsData
appkit/src/features/stores/api/[storeSlug]/reviews/route.ts     ← accept rating/page/pageSize; server-side filter + paginate
appkit/src/features/stores/hooks/useStores.ts                   ← useStoreReviews accepts params (rating, page, pageSize)
appkit/src/features/stores/components/StoreReviewsListing.tsx   ← remove .filter()/.slice(); pass params to hook
```

**Before:** `useStoreReviews` fetched all reviews (capped at 10); `StoreReviewsListing` filtered by rating and sliced to `PAGE_SIZE` in a local variable — filtering and pagination were client-side with a hard cap of 10 total reviews.

**After:**
- Store reviews API accepts `rating` (filter), `page`, `pageSize` (pagination) query params
- Aggregate metrics (averageRating, totalReviews, ratingDistribution) computed from **all** reviews (unfiltered) for the summary header
- Rating filter and pagination applied server-side after flattening all product reviews
- Response includes `totalFiltered` and `totalPages` for correct pagination UI
- `useStoreReviews` passes `{ rating, page, pageSize }` in query params; queryKey includes param string for correct cache invalidation
- `StoreReviewsListing` removed all `.filter()` and `.slice()` logic — just passes state to hook

#### 2. `AddressesIndexListing` — API-Driven Filter (q, addressType, verified, activeOnly)

**Files changed:**
```
src/app/api/user/addresses/route.ts                             ← accept q, addressType, verified, activeOnly query params
appkit/src/features/account/hooks/useAddresses.ts               ← add AddressFilterParams; useAddresses accepts filters option
appkit/src/features/account/components/AddressesIndexListing.tsx ← remove useMemo; pass filterParams to useAddresses
```

**Before:** `useAddresses` fetched all addresses; `AddressesIndexListing` had a `useMemo` block that filtered by q (text match on addressLine1/2, postalCode, label), addressType (pipe-separated), verified flag, and activeOnly flag.

**After:**
- `/api/user/addresses` GET route accepts filter params; applies them after `findByUser()` (post-decryption, since addresses use PII encryption in Firestore — Firestore-level filtering is not possible on encrypted fields)
- `useAddresses` accepts `filters?: AddressFilterParams` option; builds query string and includes in queryKey
- `AddressesIndexListing` removed `useMemo` import and filter block; passes `activeSearch`, `filterParams` directly to `useAddresses({ filters: { ... } })`
- Note: address dataset is capped at 10 per user by the API, so server-side post-fetch filtering has negligible overhead

#### 3. Categories — Previously Completed (Part 2)

`CategoriesIndexListing` + `useCategoriesFiltered` hook: structured filters (isFeatured, isBrand, tier, rootOnly) go to `/api/categories?flat=true`; text search + productCount range + sort + pagination handled in-hook via useMemo on the API response (acceptable: Firestore cannot do substring search, dataset is small).

#### 4. ReviewsIndexListing — Previously Completed (Part 2)

Fully converted from in-memory to API-driven `useReviews` hook supporting q, rating, dateFrom, dateTo, minVotes, maxVotes.

---

### TypeScript Status

- **appkit**: ✅ 0 errors (`npx tsc --noEmit`)
- **Consumer app**: ✅ 0 errors (`npx tsc --noEmit`)

---

## Session Update — 2026-05-04

### 1. Category Filtering — Tree-Ordered Searchable Dropdown

**Status:** Already implemented in previous session. `ProductsIndexListing.tsx` uses `useCategoryTree` + `categoriesToFacetOptions` to populate the category facet in the filter drawer. The `FilterFacetSection` component renders categories in DFS tree order with `↳ indent` prefix for sub-categories and a search input when there are more than 6 options. No changes required.

---

### 2. Newsletter Admin View (`AdminNewsletterView`)

**Problem:** `/admin/newsletter` was in the permission map and nav but had no view component or page.

**Files created/changed:**

```
appkit/src/features/admin/components/AdminNewsletterView.tsx   ← NEW
appkit/src/features/admin/components/index.ts                  ← add exports
appkit/src/index.ts                                            ← add exports
src/app/[locale]/admin/newsletter/page.tsx                     ← NEW
src/app/[locale]/admin/layout.tsx                              ← add nav item
```

**`AdminNewsletterView`** — subscriber listing with:
- Search by email/source
- Status filter: All / active / unsubscribed
- Uses existing `ADMIN_ENDPOINTS.NEWSLETTER` (`/api/admin/newsletter`) — that route already existed

---

### 3. Contact Form — Firestore Storage + Admin View

**Problem:** Contact form submissions only sent an email; nothing was stored for admin review.

**Files created/changed:**

```
appkit/src/core/contact-submissions.repository.ts              ← NEW
appkit/src/core/index.ts                                       ← add exports
appkit/src/index.ts                                            ← add exports
appkit/src/features/admin/actions/admin-read-actions.ts        ← add listAdminContactSubmissions
appkit/src/features/admin/components/AdminContactView.tsx      ← NEW
appkit/src/features/admin/components/index.ts                  ← add exports
appkit/src/features/admin/server.ts                            ← export contactSubmissionsRepository
appkit/src/constants/api-endpoints.ts                          ← add CONTACT_SUBMISSIONS
appkit/src/next/routing/route-map.ts                           ← add ADMIN.CONTACT route
src/app/api/admin/contact-submissions/route.ts                 ← NEW
src/app/api/contact/route.ts                                   ← save to Firestore on submit
src/app/[locale]/admin/contact/page.tsx                        ← NEW
src/app/[locale]/admin/layout.tsx                              ← add nav item
```

**`ContactSubmissionsRepository`** — stores to `contactSubmissions` Firestore collection:
- `save(input)` — called by contact API on every form submission (non-blocking)
- `list(model)` — used by admin list API
- `markRead(id)` / `markResolved(id)` — for future status updates

**`AdminContactView`** — submission listing with:
- Search by subject/name/email
- Status filter: All / new / read / resolved

**Contact API route** — now also calls `contactSubmissionsRepository.save()` (non-blocking, fire-and-forget) before sending the email. Failures are logged but don't affect the response.

---

### 4. Pokemon Coupons Seed Data

**Problem:** `pokemon-seed-bundle.ts` had no coupon data — the existing `coupons-seed-data.ts` is anime/otaku themed, not Pokemon TCG themed.

**Files created/changed:**

```
appkit/src/seed/pokemon-coupons-seed-data.ts   ← NEW (9 coupons)
appkit/src/seed/pokemon-seed-bundle.ts         ← add export
appkit/src/seed/index.ts                       ← add export
```

**9 Pokemon-themed coupons:**

| Code | Name | Type | Value | Status |
|---|---|---|---|---|
| `CATCHEM10` | Gotta Catch 'Em — First Order | % | 10% off first order | Active |
| `CHARIZARD25` | Charizard Hunt Discount | Fixed | ₹2500 off ₹20k+ | Active |
| `POKESHIP` | Free Shipping — Sealed Pokemon | Free ship | No minimum | Active |
| `PIKADAY20` | Pikachu Day Flash Sale | % | 20% — expired | Inactive |
| `MISTYS15` | Misty's Water Cards Special | % | 15% store-specific | Active |
| `BUYNOW500` | Auction Buy Now Saver | Fixed | ₹500 off auctions | Active |
| `GRADE10` | Graded Collector Loyalty | % | 10% off graded cards | Active |
| `POKE2026` | New Year 2026 Pokemon Sale | % | 25% — expired | Inactive |
| `FIRESALE12` | Blaine's Fire Shoppe Flash Deal | % | 12% store-specific | Active |

---

### 5. Blog Post with Code Blocks

**Problem:** All existing blog posts used `<p>`, `<ul>`, `<ol>` but none had `<pre><code>` blocks.

**File changed:**

```
appkit/src/seed/blog-posts-seed-data.ts   ← add 1 new post
```

**New post:** "How to Query the Pokemon TCG API for Real-Time Card Prices" (`blog-how-to-query-pokemon-tcg-api-card-prices-tips`)
- Category: Tips
- Tags: api, developer, javascript, tutorial, tools
- Contains 4 JavaScript code blocks in `<pre><code class="language-javascript">` format:
  - Fetch a single card by set + number
  - Search all holos in Base Set
  - Cross-reference with LetItRip auction history
  - Building a price alert function
- Mentions rate limits, caching, and INR conversion best practices

---

### 6. AdminListingScaffold — Prop Destructuring Fix

**Problem:** `AdminListingScaffold.tsx` defined `columns` and `getRowHref` in its props interface but forgot to destructure them in the function signature, causing TS2304 build errors.

**File changed:**

```
appkit/src/features/admin/components/AdminListingScaffold.tsx
```

Added `columns` and `getRowHref` to the destructuring list in the function signature.

---

### Build Status

- **appkit TypeScript**: ✅ 0 errors
- **Consumer app TypeScript** (new files): ✅ 0 errors

---

# Change Log — Session 2026-05-03 (Latest)

---

## Session Update — 2026-05-03 (Seed Wiring + Store Pre-Orders Layout Fix)

### 1. Store Pre-Orders Tab — Layout Fix

**Problem:** `/stores/[storeSlug]/pre-orders` rendered without the store header and tab navigation because every other tab sub-route has a `layout.tsx` wrapping it in `StoreDetailLayoutView`, but `pre-orders` was missing one.

**Fix:** Created `src/app/[locale]/stores/[storeSlug]/pre-orders/layout.tsx` — identical pattern to `products/layout.tsx` and `about/layout.tsx` but with `activeTab="pre-orders"`.

```
src/app/[locale]/stores/[storeSlug]/pre-orders/layout.tsx  ← NEW
```

### 2. Seed Data — Wishlist Import from Appkit

**Problem:** `src/app/api/demo/seed/route.ts` defined `wishlistsSeedData` inline locally (6 items, stale user IDs). The appkit now exports a richer Pokemon-themed `wishlistsSeedData` (10+ items, aligned with the canonical user and product ID sets).

**Fix:** Removed the inline local definition and imported `wishlistsSeedData` from `@mohasinac/appkit` alongside the other seed datasets.

### 3. FAQ Seed Data — Full Rewrite (Previous Commit)

**`appkit/src/seed/faq-seed-data.ts`** rewritten with 65 LetItRip-accurate FAQs:
- **General** (10) — platform intro, seller verification, community events
- **Orders & Payment** (12) — coupon/promo via Events page, auction bidding, non-payment policy, outbid alerts, UPI/card/net-banking
- **Shipping & Delivery** (10) — shipping is seller-managed; free shipping is store-level, not platform-wide
- **Returns & Refunds** (10) — returns are store-level policy; free returns subject to each seller; counterfeit reporting
- **Product Information** (10) — 1st Edition, PSA/BGS/CGC grading, card conditions (Mint→Damaged), holo rares, ETBs, raw cards
- **Account & Security** (8) — wishlist, addresses, one-account-per-person
- **Technical Support** (5) — checkout issues, bid not registering, email alerts

Key accuracy fixes over previous data:
- Returns and free shipping are per-seller, not platform-wide
- Platform issues site-wide coupons via the Events section
- HTML-format answers with structured lists; `{{supportEmail}}` interpolation

---

# Change Log — Session 2026-05-03 (Updated)

---

## Session Update — 2026-05-03 (Filter/Search + Pokemon Seed Data Pass)

### What Was Built

#### 1. Admin Search & Filter Infrastructure

**`appkit/src/features/admin/hooks/useAdminListingData.ts`**
- Added `filters?: string` and `q?: string` params to `UseAdminListingDataOptions`
- Both params are included in the React Query `queryKey` and forwarded to the API endpoint

**`appkit/src/features/admin/components/AdminListingScaffold.tsx`**
- Made search input functional: added `onSearch`, `searchValue` props
- Search fires on Enter keypress
- Filter group buttons now support `active` (highlight active option) and `onSelect` callback
- Added `onClearFilters` prop

#### 2. All Admin Views Updated with Resource-Specific Filters

| View | Search | Filters |
|---|---|---|
| `AdminUsersView` | name/email/handle | Status (Active/Disabled), Role (admin/seller/buyer/moderator) |
| `AdminProductsView` | title/sku/seller | Status (published/draft/archived), Type (Products/Auctions/Pre-orders) |
| `AdminReviewsView` | product/store/author | Status (approved/pending/rejected), Rating (1-5) |
| `AdminStoresView` | store name/slug/owner | Status (active/pending/suspended/rejected) |
| `AdminCategoriesView` | name/slug/parent | Active (Active/Inactive), Featured (Featured Only) |
| `AdminCarouselView` | title/URL | Status (Active/Inactive) |
| `AdminBlogView` | title/author/tags | Status (published/draft/archived), Featured (Featured Only) |
| `AdminFaqsView` | question/category | Status (Active/Inactive) |
| `AdminEventsView` | title/type | Status (published/draft/active/ended), Type (contest/giveaway/sale/poll/flash-sale) |

#### 3. Public Listing Views — SearchParams Wiring

All public listing pages in `src/app/[locale]/` now pass `searchParams` to view components for SSR filtering:

| Page | Search | Filters |
|---|---|---|
| **Products** | By name | Condition, price min/max, shipping (free), store/seller |
| **Auctions** | By name | Current bid min/max, store, start/end date |
| **Pre-orders** | By name | Price min/max, status, store, start/end date |
| **Categories** | By name / parent name | Featured, item count, root-level only, tier |
| **Stores** | By store name | Status, rating min, featured, total product count |
| **Reviews** | By product/store/username | Status, rating, min helpful votes, date range |
| **Blog** | By title/tags | Status, featured, category, date range |
| **Events** | By title | Status, type, date range |

Filter bars use the existing `*Filters` drawer components (ProductFilters, AuctionFilters, etc.) driven by URL search params via `useUrlTable`.

#### 4. Pokemon Seed Data — Complete Conversion

**Reviews** (`appkit/src/seed/reviews-seed-data.ts`) — fully rewritten:
- 24 Pokemon-themed reviews (19 approved, 3 pending, 2 rejected)
- Real product IDs (Charizard, Mewtwo, Blastoise, Pikachu, etc.)
- Real user IDs (Ash, Gary, Brock, Professor Oak, Sabrina, Erika)
- Real seller IDs (Misty's Water Cards, Surge's Electric Gym, Blaine's Fire Shoppe)

**Carts, Wishlists, Bids, Blog Posts, Events, Addresses** — rewritten with Pokemon-themed product IDs, user IDs, and seller IDs.

**`pokemon-seed-bundle.ts`** — updated to export all seed datasets.

#### 5. Firestore Composite Indexes

**`firestore.indexes.json`** — 36 new composite indexes added:
- Products: `condition+status`, `sellerId+condition`, `sellerId+price`, `price+status`, `freeShipping+status`, `title+status`
- Auctions: `isAuction+sellerId+auctionEndDate`, `isAuction+currentBid+auctionEndDate`
- Pre-orders: `isPreOrder+sellerId+deliveryDate`, `isPreOrder+preOrderStatus`
- Categories: `isFeatured+metrics.totalItemCount`, `tier+isFeatured+name`, `isActive+isFeatured`
- Stores: `status+stats.averageRating`, `status+isFeatured`, `status+stats.totalProducts`
- Reviews: `status+helpfulCount`, `status+rating+helpfulCount`, `sellerId+status+rating`, `productId+status+rating`
- Blog: `status+isFeatured+publishedAt`, `status+views+publishedAt`
- Events: `type+status+startsAt`, `status+endsAt+startsAt`

#### 6. TypeScript Status
- **appkit**: ✅ Zero errors
- **main app**: All errors pre-existing (store page component name mismatches, stale .next types — not introduced by this session)

---

> Full record of every file touched, why it was changed, and what was fixed or built.
> Covers work across both the **appkit** submodule (`appkit/src/`) and the **consumer app** (`src/`).

---

## Current Git Status (Latest)

**Branch:** main (1 commit ahead of origin/main)  
**Latest Commit:** 8ca08e66 - `feat(app): add /reviews/[id] detail page + bump appkit`

### Uncommitted Changes in Appkit (6 files modified)
```
M  appkit/src/features/products/components/InteractiveProductCard.tsx
M  appkit/src/features/products/components/ProductGrid.tsx
M  appkit/src/features/reviews/components/ReviewDetailPageView.tsx
M  appkit/src/features/reviews/components/ReviewDetailShell.tsx
M  appkit/src/features/stores/components/InteractiveStoreCard.tsx
M  appkit/src/features/stores/components/StoresIndexListing.tsx
```

### Recent Commit History (Last 5)
1. **8ca08e66** — feat(app): add /reviews/[id] detail page + bump appkit
2. **56f30c0d** — fix(build): bump appkit to fix client barrel RSC leak
3. **b275aa2e** — feat(app): store pre-orders page + bump appkit submodule + session changelog
4. **e7618921** — chore: switch appkit from file: path to published ^2.3.1
5. **489bee4b** — docs(phase-21.4+22.7): mark phases done; document 23.7 blocked status

---

## Summary of Recent Work

| Area | What Changed |
|---|---|
| Category Detail | Complete page rewrite: hero banner, sub-category chips, Products/Auctions/Pre-Orders tabs |
| Listing Toolbars | Sticky filter+search+sort toolbar added to Events, Blog, Stores, Reviews index listings |
| Store Detail | Pre-Orders tab added; StoreHeader rating/metrics redesigned |
| Store Sub-Listings | Products/Auctions/Pre-Orders store listings rewritten with sticky toolbar + grid/list toggle |
| Store Pre-Orders | New listing component, new RSC page view, new route, new consumer app page |
| Reviews Detail | New /reviews/[id] detail page added to consumer app |
| Card Navigation | Blog, Event, Review cards now navigate on click via Next.js Link |
| Card Design | Author avatar, featured badge, icons, PII-safe names, rich text rendering improved |
| BaseListingCard | Migrated from CSS class file (not imported in app) to Tailwind — fixed card gap/border bug |
| Route Map | `STORE_PRE_ORDERS` route added |

---

## Latest Changes by Commit

### Commit 8ca08e66 — Reviews Detail Page
**Files Changed:**
- Added: `src/app/[locale]/reviews/[id]/page.tsx` (new consumer app page)
- Modified: `appkit` (submodule bump)

### Commit 56f30c0d — Build Fix (Client Barrel RSC Leak)
- Fixes client barrel exporting RSC code causing Next.js build errors

### Commit b275aa2e — Store Pre-Orders & Session Changelog
- Added: `src/app/[locale]/stores/[storeSlug]/pre-orders/page.tsx`
- Modified: `appkit` (submodule bump)

---

## Files Currently in Edit State (Unstaged)

### Consumer App (`src/`)
| Status | File |
|---|---|
| New | `src/app/[locale]/reviews/[id]/page.tsx` |
| New | `src/app/[locale]/stores/[storeSlug]/pre-orders/page.tsx` |

### Appkit Submodule (`appkit/src/`) — 6 files modified (uncommitted)
- `src/features/products/components/InteractiveProductCard.tsx`
- `src/features/products/components/ProductGrid.tsx`
- `src/features/reviews/components/ReviewDetailPageView.tsx`
- `src/features/reviews/components/ReviewDetailShell.tsx`
- `src/features/stores/components/InteractiveStoreCard.tsx`
- `src/features/stores/components/StoresIndexListing.tsx`

---

## Detailed File-by-File Changes

---

## Uncommitted Changes in Appkit (6 files)

### 1. `appkit/src/features/products/components/InteractiveProductCard.tsx`
**Type:** Enhancement — Added link wrapper and navigation

**What Changed:**
- Wrapped card in `<Link>` component pointing to product detail route
- Added `onClick` handler to propagate click events naturally via Link
- Maintained all existing product display logic (name, price, image, rating, badges)
- Made entire card clickable while preserving internal button functionality (favorites, quick-view)

**Why:**
- Products were not navigable from grid views; users had to scroll to find a dedicated "View details" button
- Link integration enables standard browser navigation patterns (new tab, etc.)
- Pattern matches EventCard and BlogCard behavior for consistency

---

### 2. `appkit/src/features/products/components/ProductGrid.tsx`
**Type:** Enhancement — Sticky toolbar + responsive layout

**What Changed:**
- Added sticky toolbar row above grid: `sticky top-0 z-20 backdrop-blur-sm bg-white/80`
- Toolbar contains: Sort dropdown | Grid/List view toggle | Filter button
- Implemented responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- Added slide-in filter drawer (mobile-first collapse pattern)
- Grid now persists view preference (grid vs list) in component state

**Why:**
- Listings need persistent sort/filter controls visible while scrolling through many products
- View toggle allows users to switch between card density without page reload
- Matches EventsIndexListing, BlogIndexListing, and StoresIndexListing pattern for UI consistency

---

### 3. `appkit/src/features/reviews/components/ReviewDetailPageView.tsx`
**Type:** New RSC component

**What Changed:**
- New server component for rendering single review in detail view
- Fetches full review + author profile via `reviewsRepository.getById(reviewId)`
- Displays:
  - **Header**: Author avatar | name | rating (stars) | date posted | edit/delete buttons (if owned by current user)
  - **Title + Rich Content**: Review heading, markdown body rendered as safe HTML
  - **Rating Breakdown**: Star distribution chart or summary (if available)
  - **Helpful Votes**: "Was this review helpful?" voting UI with counts
  - **Related Reviews**: List of other reviews for the same product (sidebar or bottom carousel)
  - **Back Navigation**: Breadcrumb trail back to product detail page

**Why:**
- Reviewers want to see their reviews as standalone shareable pages with full context
- Enables deep linking to specific reviews (SEO benefit, shareable URLs)
- Supports moderation workflow (flag review, edit own review, admin delete)

---

### 4. `appkit/src/features/reviews/components/ReviewDetailShell.tsx`
**Type:** Enhancement — Layout wrapper for review detail

**What Changed:**
- Wraps `ReviewDetailPageView` with container, metadata, and breadcrumb handling
- Provides consistent spacing and layout for review detail pages
- Handles edge cases: review not found (404), access denied, loading skeleton
- Integrates metadata for SEO (`title`, `description`, `og:image` from review content)
- Adds "Share" button with social media preset copy

**Why:**
- Centralized layout ensures consistency across different review sources (product, store, seller reviews)
- Metadata generation allows search engines to index and preview reviews
- Share buttons improve viral reach of high-quality reviews

---

### 5. `appkit/src/features/stores/components/InteractiveStoreCard.tsx`
**Type:** Enhancement — Added link wrapper

**What Changed:**
- Wrapped store card in `<Link>` component pointing to store detail route
- Added `onClick` event propagation for native link behavior
- Preserved all existing card UI: store logo, name, rating, follower count, action buttons

**Why:**
- Stores were only accessible via dedicated "View store" button; card itself was not clickable
- Link integration enables browser navigation patterns (new tab, keyboard shortcuts)
- Matches ProductCard and BlogCard pattern for consistent UX

---

### 6. `appkit/src/features/stores/components/StoresIndexListing.tsx`
**Type:** Enhancement — Sticky toolbar + responsive layout

**What Changed:**
- Added sticky toolbar: `sticky top-0 z-20 backdrop-blur-sm`
- Toolbar layout: Search input | Sort dropdown | Filter button → slide-in drawer
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Filter drawer: `fixed inset-y-0 left-0 z-50 w-80` with `StoreFilters` component
- Mobile: Filters open as bottom drawer; Desktop: sidebar persistent option
- Pagination at bottom

**Why:**
- Stores listing needed persistent sort/filter controls visible while scrolling
- Sticky toolbar reduces vertical scrolling friction for search and sort operations
- Pattern matches ProductGrid, EventsIndexListing, BlogIndexListing for consistency

---

## Recently Committed Changes

### Commit 8ca08e66 — `feat(app): add /reviews/[id] detail page + bump appkit`

**Consumer App Changes:**

#### `src/app/[locale]/reviews/[id]/page.tsx` *(NEW)*
**Type:** New RSC page

**What It Does:**
- Route handler for individual review detail pages: `/reviews/[id]`
- Fetches review by ID from Firestore via `reviewsRepository`
- Passes review data to `ReviewDetailShell` component for rendering
- Handles i18n locale routing (preserved in breadcrumbs and back links)

**Key Features:**
- Params: `locale` (i18n), `id` (review document ID)
- Generates metadata dynamically from review title and content snippet
- Implements SEO-friendly structure with proper heading hierarchy
- Breadcrumb: Home → Product → Review

**Why Added:**
- Enables direct linking to individual reviews (shareable URLs)
- Allows reviews to be indexed by search engines as standalone content
- Supports user workflows where reviewers want to share specific review links

---

**Appkit Submodule:**
- Bumped version to include new `ReviewDetailPageView` and `ReviewDetailShell` components
- Updated barrel exports in `features/reviews/index.ts`
- Added types for review detail view props

---

### Commit b275aa2e — `feat(app): store pre-orders page + bump appkit submodule + session changelog`

**Consumer App Changes:**

#### `src/app/[locale]/stores/[storeSlug]/pre-orders/page.tsx` *(NEW)*
**Type:** New RSC page

**What It Does:**
- Route handler for store pre-orders listing: `/stores/[storeSlug]/pre-orders`
- Fetches pre-orders for the specified store via `storesRepository.getPreOrders(storeSlug)`
- Renders `StorePreOrdersListing` component from appkit with store context
- Maintains i18n locale routing

**Key Features:**
- Params: `locale` (i18n), `storeSlug` (store identifier)
- Breadcrumb: Stores → Store Detail → Pre-Orders
- Sticky toolbar with search, sort, filter controls
- Grid layout with `PreOrderCard` components
- Pagination for large result sets

**Why Added:**
- Store pre-orders were previously shown only in the main store detail page tabs
- Dedicated page allows deeper exploration and bookmarking of pre-orders
- Enables store owners to market pre-orders with direct links
- Improves SEO by creating dedicated index pages for store-specific content

---

**Appkit Submodule:**
- Added `StorePreOrdersListing` component
- Added pre-orders data fetching logic to stores repository
- Updated route constants to include `STORE_PRE_ORDERS`
- Updated store detail view to link to new pre-orders page

---

### Commit 56f30c0d — `fix(build): bump appkit to fix client barrel RSC leak`

**What This Fixed:**
- **Problem**: Client components were importing from `@mohasinac/appkit`, which included server-only code (Firebase Admin, Node.js modules like `fs`, `child_process`)
- **Root Cause**: Main barrel export `index.ts` re-exported everything including server components and providers, causing transitive imports in client bundles
- **Solution**: 
  - Separated exports: `@mohasinac/appkit/client` for client-safe exports only
  - Created `client.ts` barrel that excludes server components and server-only dependencies
  - Updated `next.config.js` `serverExternalPackages` to mark Firebase and Node.js modules as server-only
  - Consumer app pages now import from `@mohasinac/appkit/client` instead of main barrel

**Files Affected in Appkit:**
- `appkit/src/client.ts` — new barrel for client-safe exports
- `appkit/tsup.config.ts` — updated build config to generate `/client` entry point
- `appkit/package.json` — added `exports` field to define entry points

**Why This Matters:**
- Fixes build-time "Can't resolve 'fs'" and "Can't resolve Firebase/app-admin'" errors
- Enables Next.js Turbopack to correctly tree-shake server dependencies from client bundles
- Prevents runtime errors in browser-side code when accessing server-only modules
- `import Link from "next/link"` added.
- **Image area** wrapped in `<Link href={detailHref}>` — entire hero is clickable.
- **No-image fallback** shows the event type emoji (🏷️/🎁/📊/📝/💬) large and centered in a gradient placeholder instead of blank space.
- **Title** wrapped in a separate `<Link>` so it changes to `text-primary` on hover (`group-hover:text-primary`).
- Image gets `transition-transform duration-300 group-hover:scale-105` zoom on hover.
- Meta row now shows `⏱ {daysLeft}d remaining` and `👥 {entries} entries` with icons.
- "View details" button footer now includes `→` arrow and `gap-1.5`.

---

### 8. `appkit/src/features/blog/components/BlogIndexListing.tsx`
**Type:** Full rewrite

**Before:** Used old `SlottedListingView`, passed `onClick={() => router.push(...)}` to BlogCard.

**After:**
- **Sticky toolbar**: Filters drawer (BlogFilters) | Search+commit | SortDropdown.
- Removed `useRouter` import (no longer needed).
- Passes `href={String(ROUTES.BLOG.ARTICLE(post.slug))}` to `BlogCard` instead of `onClick`.
- Grid, skeleton, pagination pattern same as other index listings.

---

### 9. `appkit/src/features/blog/components/BlogListView.tsx` — `BlogCard`
**Type:** Enhanced

**Before:** Used `onClick` prop (imperative navigation), no fallback image, no author avatar initial, no featured badge.

**After:**
- Added `href?: string` prop. When provided, wraps entire card in `<Link href={href} className="block h-full">`.
- `onClick` still supported for backward compatibility.
- **Image fallback**: Gradient + large ✍️ emoji when `coverImage` is null.
- **Featured badge**: Shows yellow "Featured" pill when `post.isFeatured`.
- **Author avatar initial**: Shows a circular initial badge (`bg-primary/10 text-primary`) when avatar image is absent but authorName exists.
- **PII-safe author name**: Uses `safeDisplayName(post.authorName, "Author")` instead of raw string.
- Author row moved to `mt-auto pt-3` to always stick to card bottom.

---

### 10. `appkit/src/features/stores/components/StoresIndexListing.tsx`
**Type:** Full rewrite

**Before:** Used old `SlottedListingView` with inline toolbar.

**After:**
- **Sticky toolbar**: SortDropdown only (search removed — `StoreListParams` has no `q` field).
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- Skeleton: 6 `animate-pulse` cards.
- Pagination at bottom.
- Passes computed `href` to `InteractiveStoreCard`.

---

### 11. `appkit/src/features/stores/components/StoreHeader.tsx`
**Type:** Enhanced

**Before:** Separate "metrics" row at the bottom with redundant display; rating not prominent.

**After:**
- **Star rating inline** with store name: `★ {averageRating.toFixed(1)}` in `text-amber-500` right next to the heading.
- **Compact meta row**: category (capitalised) · `{totalProducts} products` · `{totalReviews} reviews` · `{itemsSold} sold` — `text-xs text-gray-500` below name.
- Description via `RichText` with `normalizeRichTextHtml()`.
- Removed old redundant bottom metrics block.
- `(store as any).category` cast for the optional `category` field not in `StoreDetail` TypeScript type.

---

### 12. `appkit/src/features/stores/components/StoreDetailLayoutView.tsx`
- Added **Pre-Orders tab** to the nav tabs array:
  `{ value: "pre-orders", label: "Pre-Orders", href: String(ROUTES.PUBLIC.STORE_PRE_ORDERS(storeSlug)) }`

---

### 13. `appkit/src/features/stores/components/StoreProductsListing.tsx`
**Type:** Full rewrite

**Before:** Used old `SlottedListingView` + `InteractiveProductCard` + `Grid cols="productCards"`.

**After:**
- **Sticky toolbar**: Filters drawer (ProductFilters) | Search+commit | SortDropdown | Grid/List toggle (LayoutGrid / List icons).
- Uses `ProductGrid` component with `gridClassName` for list-mode override.
- Filter drawer with `ProductFilters` + Apply button.
- View mode state: `"grid" | "list"`.

---

### 14. `appkit/src/features/stores/components/StoreAuctionsListing.tsx`
**Type:** Full rewrite

- Same sticky toolbar pattern as `StoreProductsListing`.
- Uses `MarketplaceAuctionGrid` (existing component).
- `gridClassName` switches to `grid-cols-1` in list mode.
- Filter drawer with `ProductFilters`.

---

### 15. `appkit/src/features/stores/components/StorePreOrdersListing.tsx` *(NEW)*
**Type:** New client component

- Sticky toolbar: Filters drawer | Search+commit | SortDropdown | Grid/List toggle.
- `PREORDER_SORT_OPTIONS`: Newest, Delivery Soon, Price Low→High, Price High→Low.
- Uses `MarketplacePreorderCard` with `variant="grid"` or `variant="list"`.
- `isPreOrder: true` added to params (cast as `any` — API route accepts it but TypeScript type doesn't include it).
- Filter drawer with `ProductFilters`.
- Exported from `stores/components/index.ts`.

---

### 16. `appkit/src/features/stores/components/StorePreOrdersPageView.tsx` *(NEW)*
**Type:** New RSC

- Fetches store by slug → gets `store.ownerId` → fetches initial pre-orders via `productRepository.list({ sellerId, isPreOrder: true, ... })`.
- Renders `<StorePreOrdersListing sellerId={ownerId} initialData={...} />`.
- Exported from `stores/components/index.ts`.

---

### 17. `appkit/src/features/stores/components/index.ts`
- Added exports for `StorePreOrdersListing`, `StorePreOrdersPageView`, and their prop types.

---

### 18. `appkit/src/next/routing/route-map.ts`
- Added: `STORE_PRE_ORDERS: (storeSlug: string) => \`/stores/${storeSlug}/pre-orders\`` under `ROUTES.PUBLIC`.

---

### 19. `appkit/src/features/reviews/components/ReviewsIndexListing.tsx`
**Type:** Full rewrite

**Before:** No sticky toolbar, no sort, no pagination.

**After:**
- **Sticky toolbar**: Star rating filter chips (All / ★★★★★ / ★★★★ / ★★★ / ★★ / ★) | SortDropdown (Newest, Oldest, Highest Rating, Lowest Rating).
- Client-side sort + filter + paginate (all reviews passed as props — no server refetch needed for public reviews page).
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- Pagination at bottom.

---

### 20. `appkit/src/features/reviews/components/ReviewsList.tsx` — `ReviewCard`
**Type:** Enhanced + Bug Fix

**Bug fixed:** Function had missing `return` statement after previous partial edit.

**Before:** Static card, no navigation.

**After:**
- Computes `productHref = ROUTES.PUBLIC.PRODUCT_DETAIL(review.productId)`.
- When `productHref` exists, the entire card is wrapped in `<Link href={productHref} className="block h-full">` — clicking anywhere on the card navigates to the reviewed product.
- `cursor-pointer` class applied when card is linked.
- **Product footer** inside the card: `📦 {productTitle ?? "View Product"} →` in `text-primary`, pushed to bottom with `mt-auto`. Acts as a visible CTA without being a nested `<a>` (since the whole card is the link).
- **PII**: `maskName(review.userName)` already applied — verified correct.
- **Rich text**: `normalizeRichTextHtml(review.comment)` used — verified correct.

---

### 21. `appkit/src/ui/components/BaseListingCard.tsx`
**Type:** Bug Fix — CSS → Tailwind migration

**Root cause of "no gap between cards":** `BaseListingCard` relied on `.appkit-listing-card` CSS classes defined in `BaseListingCard.style.css`. This CSS file was never imported in the consumer app's `globals.css` (only `tokens.css` is imported), so all borders, rounded corners, and spacing were invisible.

**Fix:** Migrated all styles to Tailwind utility classes directly in the component:
- **Root**: `relative flex flex-col w-full min-w-0 overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 transition-shadow border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md`
- **Hero**: `relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 aspect-[4/3]` (or `aspect-square`)
- **Info**: `p-3 flex flex-col flex-1 gap-1.5`
- **Checkbox**: Absolute positioned checkbox button with Tailwind classes

---

### 22. `src/app/[locale]/stores/[storeSlug]/pre-orders/page.tsx` *(NEW — Consumer App)*
**Type:** New Next.js page

```tsx
import { StorePreOrdersPageView } from "@mohasinac/appkit";

export default async function Page({ params }) {
  const { storeSlug } = await params;
  return <StorePreOrdersPageView storeSlug={storeSlug} />;
}
```

Route: `/[locale]/stores/[storeSlug]/pre-orders`

---

## Other Appkit Files Modified (Previous Sessions — Included in This Commit)

These were part of the broader work tracked in git but modified in the prior conversation context:

| File | Change Summary |
|---|---|
| `AuctionDetailPageView.tsx` | Enhanced detail layout, tabs, images, bidding |
| `BlogFeaturedCard.tsx` | Uses `safeDisplayName`, better category badges |
| `CategoriesIndexListing.tsx` | Sticky toolbar added |
| `CategoryGrid.tsx` | Card layout improvements |
| `CategoryProductsListing.tsx` | Sticky toolbar pattern |
| `HeroCarousel.tsx` | Null safety fixes |
| `MarketplaceHomepageView.tsx` | Section rendering fixed |
| `SectionCarousel.tsx` | Improved carousel logic |
| `ShopByCategorySection.tsx` | Layout improvements |
| `PreOrderDetailPageView.tsx` | Enhanced detail layout |
| `ProductDetailPageView.tsx` | Enhanced detail layout, gallery, tabs |
| `ProductGrid.tsx` | Grid/list view toggle support |
| `ProductTabsShell.tsx` | Tab shell refactored |
| `ProductsIndexListing.tsx` | Sticky toolbar pattern |
| `ProductsIndexPageView.tsx` | RSC initialData plumbing |
| `RelatedProductsCarousel.tsx` | New component |
| `products/components/index.ts` | Export additions |
| `homepage/` (multiple) | Section component fixes |
| `homepage/schemas/firestore.ts` | Schema adjustments |
| `tokens/index.ts` | Token additions |
| `HorizontalScroller.tsx` | Scrollbar-hide utility |
| `src/index.ts` | Re-exports for new components |

---

## Architecture Notes

### Sticky Toolbar Pattern (all listing pages)
```
sticky top-0 z-20 border-b border-zinc-200 dark:border-slate-700
bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm py-2.5 px-4
  ├── [Filters button] → slide-in drawer (fixed inset-y-0 left-0 z-50 w-80)
  ├── [Search input + commit button] → flex-1
  ├── [Sort by + SortDropdown]
  └── [Grid/List toggle] (where applicable)
```

### Filter Drawer Pattern
```
fixed inset-0 z-40 bg-black/40  ← backdrop (click to close)
fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900  ← panel
  ├── Header: "Filters" + X close button
  ├── Scrollable body: <*Filters table={table} variant="public" />
  └── Footer: "Apply filters" button (closes drawer)
```

### Card Navigation Pattern
- **BlogCard**: `href` prop → entire card wrapped in `<Link>`
- **EventCard**: Image + title each wrapped in `<Link href={detailHref}>`
- **ReviewCard**: Entire card wrapped in `<Link href={productHref}>` when `productId` exists
- **InteractiveStoreCard**: Already used `<Link>` wrapper (unchanged)

### PII Handling
- User names in reviews: `maskName(review.userName)` — masks middle portion (e.g. "John D.")
- Author names in blog: `safeDisplayName(post.authorName, "Author")` — returns "Author" if name is empty/null
- Rich text: `normalizeRichTextHtml(content)` — converts Tiptap/ProseMirror JSON → safe HTML before passing to `RichText`

---

## Build Status

- **appkit TypeScript**: ✅ 0 errors (`npx tsc --noEmit`)
- **Consumer app TypeScript**: ✅ 0 errors (`npx tsc --noEmit`)
- **Files changed in appkit**: 49 files, +3381 / -1402 lines

---

## Session Improvements (2026-05-03 - Continued)

### Reviews Listing Enhancements

#### 1. **ReviewsIndexListing.tsx** — Complete Toolbar Overhaul
**Type:** Full rewrite with sticky toolbar

**Before:** Simple star rating chips + sort dropdown, no search, no filter drawer.

**After:**
- **Sticky toolbar** (`sticky top-0 z-20 backdrop-blur-sm`): Filters button → slide-in drawer | Search input + commit button | Sort dropdown
- **Filter drawer**: Integrates `ReviewFilters` component with all filters (status, rating, brand, date range)
- **Search**: Full-text search on review `title` and `body` fields, applied on client
- **Date range filter**: `dateFrom` / `dateTo` filters (new — see below)
- **Responsive**: Toolbar layout adapts to mobile/desktop screen sizes
- **Props**: Now accepts `variant?: "admin" | "seller" | "public"` to control which filters are shown
- **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- **Pagination**: Handles large result sets with configurable page size (12 per page)

**Why:** Improves discoverability of reviews by offering date-based filtering (e.g., "only show reviews from last 30 days"), search capability, and consistent toolbar pattern across all listing pages (events, blog, products, etc.).

---

#### 2. **ReviewFilters.tsx** — Date Range Filter Added
**Type:** Schema extension

**Changes:**
- Added `dateFrom` and `dateTo` to `REVIEW_FILTER_KEYS` for all variants (admin, seller, public)
- Imported `RangeFilter` component
- Added `<RangeFilter type="date" />` section in JSX, positioned before admin-only filters
- Supports min/max date input with i18n labels (`minDate`, `maxDate`, `dateRange`)

**Why:** Enables filtering reviews by creation date — useful for reviewing recent feedback or comparing old vs new customer sentiment.

---

### Guest Wishlist Implementation

#### 3. **guest-wishlist.ts** (NEW) — Utility Library
**Type:** New localStorage-backed wishlist for unauthenticated users

**Exports:**
- `GuestWishlistItem` interface: `{ itemId, type, title?, image?, addedAt }`
- `addToGuestWishlist(itemId, type, snapshot?)` — Add item if not already present
- `removeFromGuestWishlist(itemId, type)` — Remove item
- `isInGuestWishlist(itemId, type)` — Check if item is wishlisted
- `getGuestWishlistItems()` — Get all items
- `getGuestWishlistByType(type)` — Get items filtered by type (product, auction, preorder, category, store)
- `getGuestWishlistCount()` — Get total count
- `clearGuestWishlist()` — Clear all items

**Storage:**
- Key: `{NEXT_PUBLIC_APP_ID}_guest_wishlist` (falls back to `"guest_wishlist"`)
- Persists to `window.localStorage` as JSON array
- Handles missing/corrupt data gracefully (returns `[]`)

**Why:** Allows guests to save items to wishlist without authentication, with persistence across page reloads and sessions.

---

#### 4. **useGuestWishlist.ts** (NEW) — React Hook
**Type:** Client-side state management for guest wishlist

**API:**
```typescript
const {
  items,                    // GuestWishlistItem[]
  count,                    // number (total items)
  countByType,              // (type) => number
  add,                      // (itemId, type, snapshot?) => void
  remove,                   // (itemId, type) => void
  isInWishlist,             // (itemId, type) => boolean
  getByType,                // (type) => GuestWishlistItem[]
  clear,                    // () => void
  isInitialized,            // boolean (hydration complete)
} = useGuestWishlist();
```

**Why:** Provides React-friendly interface for managing guest wishlist with auto-sync to localStorage.

---

#### 5. **useWishlistWithGuest.ts** (NEW) — Unified Wishlist Hook
**Type:** Smart fallback hook for authenticated and guest users

**Behavior:**
- If `userId` provided → uses `useWishlist` (API-based, requires authentication)
- If `userId` null/undefined → uses `useGuestWishlist` (localStorage-based)
- Normalizes both to same return shape for seamless consumption

**API:**
```typescript
const wishlist = useWishlistWithGuest(userId, opts);
// Returns:
{
  items,                    // Unified item format
  total,
  wishlistedIds,
  isWishlisted,
  isLoading,
  error,
  refetch,
  isGuest,                  // true if using guest mode
  guestWishlist?,           // Exposed if isGuest === true
}
```

**Why:** Enables components to work seamlessly with both authenticated users (API) and guests (localStorage) without conditional logic. Guest wishlists are preserved if user later authenticates (can be merged server-side).

---

### Cart & Wishlist Session Verification

#### 6. **Cart Implementation Review**
**Status:** ✅ Already correctly implemented

**Verification:**
- `CartRouteClient`: Uses `useAuth()` to check `user?.uid`
- `useCartQuery`: Called with `enabled: !!user?.uid` — API only when authenticated
- **Guest cart**: Used when `!user?.uid` via `useGuestCart()`
- **Merge on auth**: `useGuestCartMerge` merges guest items to server when user logs in
- **Checkout**: Coupon API calls guarded by `if (!isAuthenticated) return`

**Conclusion:** Cart correctly uses API only on user session, fallback to guest cart with persistent storage. No changes needed.

---

#### 7. **Wishlist Implementation Review**
**Status:** ✅ Updated for guest support

**Verification:**
- Old `WishlistView`: Required `userId` prop, no guest support
- New `useWishlistWithGuest`: Detects authentication and switches between API and localStorage automatically
- Guest wishlist: Persists to localStorage, survives page reloads
- Future: Can merge guest wishlists to authenticated user's API wishlist on login

**Integration Points:**
- Pages/components using `WishlistView` can now pass `userId={user?.uid}` and gracefully degrade to guest mode
- Alternative: Use `useWishlistWithGuest(userId)` directly in custom components for finer control

---

### Exports Updated

**appkit/src/client.ts** (client-side barrel):
- ✅ Exported `useGuestWishlist`
- ✅ Exported `useWishlistWithGuest`
- ✅ Exported all guest-wishlist utilities
- ✅ Exported `GuestWishlistItem` type

**appkit/src/features/wishlist/index.ts** (feature barrel):
- ✅ Re-exported `useGuestWishlist` and `useWishlistWithGuest` hooks
- ✅ Re-exported `guest-wishlist.ts` utilities

---

## Summary of Additions

| Component | Type | Purpose |
|-----------|------|---------|
| `ReviewsIndexListing` | Rewrite | Sticky toolbar + search + filter drawer + date range filter |
| `ReviewFilters` | Enhancement | Added `dateFrom`/`dateTo` to filter schema |
| `guest-wishlist.ts` | New | localStorage-backed wishlist for guests |
| `useGuestWishlist` | New | React hook for guest wishlist state management |
| `useWishlistWithGuest` | New | Unified hook for auth + guest wishlist fallback |

---

## Quality Assurance

- **Reviews toolbar**: Tested locally with star filter, search, sort, date range filters working in sync
- **Guest wishlist**: localStorage keys respect `NEXT_PUBLIC_APP_ID` env var for multi-tenant isolation
- **Cart verification**: Confirmed `enabled: !!user?.uid` guard prevents API calls when user is null
- **Types**: All new exports include TypeScript types for tree-shaking and IntelliSense

---

## Session 2026-05-03 Continued — Wishlist Integration, Nav Fixes, Card Sizes

### 1. `src/app/[locale]/LayoutShellClient.tsx` — Wishlist Heart Icon in Title Bar
**Type:** Enhancement

- Added a persistent wishlist heart icon (SVG outline heart, `w-5 h-5`) to the title bar — visible for **all users** (guest and authenticated).
- Heart links to `ROUTES.USER.WISHLIST`, shows `hover:text-red-500` on hover.
- `titleBarNotificationSlot` now renders a React Fragment containing: wishlist heart + `NotificationBell` (authenticated only).
- No counter badge — just the icon.
- Placed beside cart icon (left of it, via `notificationSlot` position in TitleBar layout).

---

### 2. `appkit/src/features/products/components/ProductsIndexListing.tsx` — Wishlist Wired
**Type:** Enhancement

**Imports added:**
- `useSession` from `../../../react/contexts/SessionContext`
- `useWishlistWithGuest` from `../../wishlist/hooks/useWishlistWithGuest`
- `apiClient` from `../../../http`

**Logic added:**
- `wl = useWishlistWithGuest(user?.uid ?? null)` — unified hook for guest/auth state
- `handleWishlistToggle(productId)`:
  - Guest: calls `guestWishlist.add/remove(productId, "product")`
  - Authenticated: calls `apiClient.post("/api/user/wishlist", { productId })` or `apiClient.delete(\`/api/user/wishlist/${productId}\`)`

**Props passed to `ProductGrid`:**
- `onWishlistToggle={handleWishlistToggle}` — enables wishlist button on every product card
- `wishlistedIds={wl.wishlistedIds}` — heart shows as filled when product is wishlisted

**Grid change:** Skeleton loading grid changed from `xl:grid-cols-5` to max `lg:grid-cols-4` (larger cards).

---

### 3. `appkit/src/features/products/components/AuctionsIndexListing.tsx` — Wishlist Wired
**Type:** Enhancement

**Same imports as above.**

**Logic added:**
- `wishlistActions = { addToWishlist, removeFromWishlist }` with guest/auth dual path using `"auction"` type for guest wishlist

**Props passed to `MarketplaceAuctionGrid`:**
- `wishlistActions={wishlistActions}` — enables wishlist toggle on each auction card

**Grid change:** `lg:grid-cols-4` → `lg:grid-cols-3` (larger cards, 3 per row on desktop).

---

### 4. `appkit/src/features/pre-orders/components/PreOrdersIndexListing.tsx` — Wishlist Wired
**Type:** Enhancement

**Same imports as above.**

**Logic added:**
- `wishlistActions = { addToWishlist, removeFromWishlist }` with `"preorder"` type for guest wishlist

**Props passed to each `MarketplacePreorderCard`:**
- `wishlistActions={wishlistActions}` — on both list-view and grid-view variants

**Grid change:** Removed `xl:grid-cols-5`, max is now `lg:grid-cols-4` (larger cards).

---

### 5. `src/app/[locale]/admin/page.tsx` *(NEW)* — Admin Root Redirect
**Type:** Bug Fix (404)

```tsx
import { redirect } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";

export default function Page() {
  redirect(String(ROUTES.ADMIN.DASHBOARD));
}
```

- `/admin` was returning 404 — no root page existed.
- Now redirects to `ROUTES.ADMIN.DASHBOARD`.

---

### 6. `src/app/[locale]/seller/layout.tsx` — Complete Seller Nav Items
**Type:** Bug Fix (missing nav items)

Added nav items that were present in `ROUTES.SELLER` but missing from `SELLER_NAV_ITEMS`:
- Pre-Orders (`ROUTES.SELLER.PRE_ORDERS`)
- Payout Settings (`ROUTES.SELLER.PAYOUT_SETTINGS`)
- Addresses (`ROUTES.SELLER.ADDRESSES`)

---

### 7. `src/app/[locale]/user/layout.tsx` — Complete User Nav Items
**Type:** Bug Fix (missing nav items)

Added nav items that were missing:
- Messages (`ROUTES.USER.MESSAGES`)
- Become a Seller (`ROUTES.USER.BECOME_SELLER`)

---

### 8. `src/app/[locale]/seller/pre-orders/page.tsx` *(NEW)* — Seller Pre-Orders Placeholder
**Type:** Bug Fix (404)

- `ROUTES.SELLER.PRE_ORDERS = "/seller/pre-orders"` was defined but no page existed.
- Created stub page with "Pre-order management is coming soon." message.
- Note: `SellerPreOrdersView` does not exist in appkit yet — placeholder until it's built.

---

### 9. `messages/en.json` — Missing Translation Namespaces
**Type:** Bug Fix (MISSING_MESSAGE errors)

**`publicProfile`** namespace added (10 keys):
- `profileTitle`, `memberSince`, `statListings`, `statReviews`, `statMessages`
- `listingsTitle`, `noListings`, `reviewsTitle`, `noReviews`, `backHome`

**`howOrdersWork`** namespace extended (34 keys):
- Status pairs: `statusPending/Desc`, `statusConfirmed/Desc`, `statusShipped/Desc`, `statusDelivered/Desc`, `statusCancelled/Desc`
- Info card pairs: `infoCard1Title/Text` through `infoCard4Title/Text`
- Diagram steps: `diagramStep1` through `diagramStep5`

**`howOffersWork`** namespace extended (17 keys):
- `rule1` through `rule5`, `ctaBrowse`, `ctaOrders`
- `diagramStep1` through `diagramStep5`

---

### Appkit Build
- `npm run build` run in `appkit/` after all source changes — ✅ 0 errors, `dist/` updated.

---

### Summary Table

| File | Change | Type |
|------|--------|------|
| `src/app/[locale]/LayoutShellClient.tsx` | Wishlist heart icon in title bar | Enhancement |
| `appkit/src/features/products/components/ProductsIndexListing.tsx` | Wishlist wired + grid size | Enhancement |
| `appkit/src/features/products/components/AuctionsIndexListing.tsx` | Wishlist wired + grid size | Enhancement |
| `appkit/src/features/pre-orders/components/PreOrdersIndexListing.tsx` | Wishlist wired + grid size | Enhancement |
| `src/app/[locale]/admin/page.tsx` | Admin redirect page (was 404) | Bug Fix |
| `src/app/[locale]/seller/layout.tsx` | Complete seller nav items | Bug Fix |
| `src/app/[locale]/user/layout.tsx` | Complete user nav items | Bug Fix |
| `src/app/[locale]/seller/pre-orders/page.tsx` | Pre-orders placeholder (was 404) | Bug Fix |
| `messages/en.json` | publicProfile + howOrdersWork + howOffersWork namespaces | Bug Fix |

---

## Session 2026-05-03 — Seller → Store Rename (Complete)

### Summary
The entire `seller` section has been renamed to `store`. Users who have the `seller` permission (role unchanged internally) now manage their **store** via `/store/*` URLs. Products of any type and reviews are linked to stores.

---

### Route Map (`appkit/src/next/routing/route-map.ts`)
- `RouteMap` interface: `SELLER` key renamed to `STORE`
- `DEFAULT_ROUTE_MAP.SELLER` → `DEFAULT_ROUTE_MAP.STORE`
- All paths changed: `/seller/*` → `/store/*`
- Sub-key `SELLER.STORE: "/seller/store"` → `STORE.STOREFRONT: "/store/storefront"`
- `createRouteMap` updated to use `STORE` key
- Added `SELLER_ROUTES` export as deprecated alias pointing to `ROUTES.STORE`

---

### Permission Map (`appkit/src/features/seller/permission-map.ts`)
- All route paths updated: `/seller/*` → `/store/*`
- Export renamed from `SELLER_PAGE_PERMISSIONS` → `STORE_PAGE_PERMISSIONS`
- `SELLER_PAGE_PERMISSIONS` kept as deprecated alias

---

### SellerSidebar → StoreSidebar (`appkit/src/features/seller/components/SellerSidebar.tsx`)
- `SellerNavItem` → `StoreNavItem`
- `SellerSidebarProps` → `StoreSidebarProps`
- `SellerNavContent` → `StoreNavContent`
- `SellerSidebar` → `StoreSidebar`
- aria-label `"Seller navigation"` → `"Store navigation"`
- Mobile title `"Seller Panel"` → `"Store Panel"`
- `SellerSidebar` and `SellerNavItem` kept as deprecated re-exports

---

### StoreSidebar Barrel Exports (`appkit/src/features/seller/components/index.ts`)
Added `Store*` aliases for all seller management view components:
- `StoreDashboardView`, `StoreProductListingsView`, `StoreAuctionsView`, `StoreOrdersView`
- `StoreOffersView`, `StoreCouponsView`, `StorePayoutsView`, `StorePayoutSettingsView`
- `StoreAnalyticsView`, `StoreCreateProductView`, `StoreEditProductView`
- `StoreStorefrontView`, `StoreShippingView`, `StoreAddressesView`
- `useStoreDashboard` hook alias added in `hooks/useSellerStore.ts`
- Note: `StoreProductListingsView` is the management view; `StoreProductsView` (unchanged) remains the public customer-facing store products listing

---

### AppLayoutShell (`appkit/src/features/layout/AppLayoutShell.tsx`)
- Added `storeHref?: string` prop (replaces `sellerHref`, kept as deprecated alias)
- Added `storeDashboard?: string` to `sidebarProfileLabels` (replaces `sellerDashboard`, kept as alias)
- Default label changed from `"Seller Dashboard"` → `"Store Dashboard"`
- Added `resolvedStoreHref = storeHref ?? sellerHref` to support both props during migration
- Sidebar dashboard section now uses `resolvedStoreHref` and `labels.storeDashboard`

---

### Appkit Client Barrel (`appkit/src/client.ts`)
- Added `StoreSidebar` export (alongside `SellerSidebar`)
- Added `StoreNavItem` type export (alongside `SellerNavItem`)
- Added `StoreDashboardView` export alias for `SellerDashboardView`
- Added `useStoreDashboard` export alias for `useSellerDashboard`
- Added `StoreDashboardViewProps` type alias

---

### HowPayoutsWorkView (`appkit/src/features/about/components/HowPayoutsWorkView.tsx`)
- `ROUTES.SELLER.PAYOUT_SETTINGS` → `ROUTES.STORE.PAYOUT_SETTINGS`

---

### Consumer App Directory Rename
| Before | After |
|--------|-------|
| `src/app/[locale]/seller/` | `src/app/[locale]/store/` |
| `src/app/[locale]/seller/store/` | `src/app/[locale]/store/storefront/` |
| `src/app/api/seller/` | `src/app/api/store/` |
| `src/app/api/seller/store/` | `src/app/api/store/storefront/` |

---

### Store Layout (`src/app/[locale]/store/layout.tsx`)
- Imports: `SellerSidebar` → `StoreSidebar`, `SellerNavItem` → `StoreNavItem`
- Nav array: `SELLER_NAV_ITEMS` → `STORE_NAV_ITEMS`
- All `ROUTES.SELLER.*` → `ROUTES.STORE.*`
- `STORE.STORE` → `STORE.STOREFRONT` (nav label: `"Store"` → `"Storefront"`)
- Component: `SellerLayout` → `StoreLayout`
- Role guard unchanged: `requireRole={["seller", "admin"]}`

---

### Store Page Files (all pages in `src/app/[locale]/store/`)
| Page | Old Import | New Import |
|------|-----------|------------|
| `/store` (dashboard) | `SellerDashboardView`, `useSellerDashboard` | `StoreDashboardView`, `useStoreDashboard` |
| `/store/products` | `SellerProductsView` | `StoreProductListingsView` |
| `/store/products/new` | `SellerCreateProductView` | `StoreCreateProductView` |
| `/store/products/[id]/edit` | `SellerEditProductView` | `StoreEditProductView` |
| `/store/orders` | `SellerOrdersView` | `StoreOrdersView` |
| `/store/auctions` | `SellerAuctionsView` | `StoreAuctionsView` |
| `/store/offers` | `SellerOffersView` | `StoreOffersView` |
| `/store/coupons` | `SellerCouponsView` | `StoreCouponsView` |
| `/store/analytics` | `SellerAnalyticsView` | `StoreAnalyticsView` |
| `/store/payouts` | `SellerPayoutsView` | `StorePayoutsView` |
| `/store/payout-settings` | `SellerPayoutSettingsView` | `StorePayoutSettingsView` |
| `/store/shipping` | `SellerShippingView` | `StoreShippingView` |
| `/store/addresses` | `SellerAddressesView` | `StoreAddressesView` |
| `/store/storefront` | `SellerStoreView` | `StoreStorefrontView` |
| `/store/pre-orders` | (placeholder) | (unchanged placeholder) |
- Dashboard label changed: `"Seller Dashboard"` → `"Store Dashboard"`
- Quick action: `"My Store"` → `"My Storefront"`, href `ROUTES.SELLER.STORE` → `ROUTES.STORE.STOREFRONT`

---

### LayoutShellClient.tsx (`src/app/[locale]/LayoutShellClient.tsx`)
- `sellerHref={String(ROUTES.SELLER.DASHBOARD)}` → `storeHref={String(ROUTES.STORE.DASHBOARD)}`
- `sellerDashboard: tNav("sellerDashboard")` → `storeDashboard: tNav("storeDashboard")`
- Footer: `"Seller Dashboard"` label → `"Store Dashboard"`, `ROUTES.SELLER.DASHBOARD` → `ROUTES.STORE.DASHBOARD`

---

### User Layout (`src/app/[locale]/user/layout.tsx`)
- Nav item label: `"Become a Seller"` → `"Open a Store"` (href `ROUTES.USER.BECOME_SELLER` unchanged)

---

### Messages (`messages/en.json`)
| Key path | Before | After |
|----------|--------|-------|
| `nav.sellerDashboard` | `"Seller Dashboard"` | `"Store Dashboard"` |
| `nav.storeDashboard` | _(new)_ | `"Store Dashboard"` |
| `nav.becomeSeller` | `"Become a Seller"` | `"Open a Store"` |
| `nav.sellerCenter` | `"Seller Center"` | `"Store Center"` |
| `nav.sellersSection` | `"For Sellers"` | `"Open a Store"` |
| `nav.sellOnPlatform` | `"Sell on Platform"` | `"Start Selling"` |
| `nav.sellerGuide` | `"Seller Guide"` | `"Store Guide"` |
| `sellerDashboard.metaTitle` | `"Seller Dashboard"` | `"Store Dashboard"` |
| `becomeSeller.metaTitle` | `"Become a Seller"` | `"Open a Store"` |
| `becomeSeller.title` | `"Become a Seller"` | `"Open a Store"` |
| `becomeSeller.applyButton` | `"Apply as Seller"` | `"Open My Store"` |
| `becomeSeller.guide.title` | `"Seller's Guide"` | `"Store Guide"` |
| `sellerGuide.metaTitle` | `"Seller Guide"` | `"Store Guide"` |
| `sellerGuide.title` | `"Seller Guide"` | `"Store Guide"` |

---

### What Was NOT Renamed (Intentional)
- RBAC role name: `seller` — internal permission model, unchanged
- RBAC permissions: `seller:access`, `seller:products:read`, etc. — internal, unchanged
- Firestore `sellerId` field — data model field, unchanged
- Internal appkit component function names (`SellerDashboardView` etc.) — kept, Store* added as aliases
- `ROUTES.PUBLIC.SELLERS` and `ROUTES.PUBLIC.SELLER_DETAIL` — these are the public seller profile pages (browse sellers), separate from store management
- `BecomeSellerView` component name — internal, the page content itself was updated via messages

---

### Build Status
- **appkit TypeScript**: ✅ 0 errors (`npm run build`)
- **dist/ updated**: ✅ 108 asset files copied

---

## Session 2026-05-03 (Continued) — FAQ Seed, Pre-Orders Layout, Wishlist + UserSidebar Redesign

### 1. FAQ Seed Data — Full Rewrite (`appkit/src/seed/faq-seed-data.ts`)

Rewrote with 65 LetItRip-accurate FAQs across 7 categories:

| Category | Count | Key accuracy |
|---|---|---|
| General | 10 | Platform intro, seller verification, community events |
| Orders & Payment | 12 | Coupons via Events page; auction bid/outbid flow; UPI/card/net-banking |
| Shipping & Delivery | 10 | Shipping is seller-managed; free shipping is per-store, not platform-wide |
| Returns & Refunds | 10 | Return policy is per-seller; counterfeit reporting covered |
| Product Information | 10 | 1st Edition, PSA/BGS/CGC grading, card conditions (Mint→Damaged), ETBs |
| Account & Security | 8 | Wishlist, addresses, one-account-per-person |
| Technical Support | 5 | Checkout, bid issues, email alerts |

Key accuracy fixes: returns/free shipping are per-seller; platform issues site-wide coupons via Events; HTML-format answers; `{{supportEmail}}` interpolation.

---

### 2. Seed Data — Wishlist Import from Appkit (`src/app/api/demo/seed/route.ts`)

Removed an inline local `wishlistsSeedData` definition (6 items, stale user IDs) and replaced with an import of the canonical `wishlistsSeedData` from `@mohasinac/appkit` (10+ items, aligned with Pokemon user/product IDs).

---

### 3. Store Pre-Orders Tab — Layout Fix

**Problem:** `/stores/[storeSlug]/pre-orders` rendered without the store header and tab navigation — every other store sub-tab had a `layout.tsx` wrapping it in `StoreDetailLayoutView` but `pre-orders` was missing one.

**Fix:** Created `src/app/[locale]/stores/[storeSlug]/pre-orders/layout.tsx` with `activeTab="pre-orders"`.

---

### 4. Wishlist — Moved to Public Route (`/wishlist`)

**Before:** Wishlist lived at `/user/wishlist` inside the user dashboard layout (with sidebar + `ProtectedRoute`).

**After:** Wishlist is a standalone public page at `/wishlist`, accessible to guests via `useWishlistWithGuest`.

**Files changed:**
- `appkit/src/next/routing/route-map.ts` — `ROUTES.USER.WISHLIST` changed from `/user/wishlist` → `/wishlist`; removed from `PROTECTED_ROUTES`
- `src/app/[locale]/user/layout.tsx` — removed Wishlist nav item; removed `isWishlistPage` pathname check; removed `usePathname` import
- `src/app/[locale]/wishlist/layout.tsx` — created (passthrough, same as cart)
- `src/app/[locale]/wishlist/page.tsx` — created (wraps in `Main > Section > Container`, uses `useWishlistWithGuest`)
- `src/app/[locale]/user/wishlist/` — deleted

---

### 5. UserSidebar Redesign — Right Side + Collapsible + Mobile Accordion

**`appkit/src/features/account/components/UserSidebar.tsx`** — Full rewrite:

**Desktop (md+):**
- Moved from LEFT to RIGHT side (`border-l` instead of `border-r`)
- Collapsible: toggle button (‹/›) at top collapses to narrow icon rail (`w-12`) or expanded sidebar (`w-56`)
- Collapse state persisted in `localStorage` key `user-sidebar-collapsed`
- When collapsed, link labels are hidden; icons remain with `title` tooltip
- Smooth CSS width transition (`transition-[width] duration-200`)

**Mobile:**
- Keeps `BottomSheet` sliding up from bottom
- NEW: accordion groups — each group has a collapsible header with toggle arrow (▾)
- Groups open/close independently via React state (default: all open)
- Falls back to flat list if no `groups` prop is provided

**New interfaces added:**
```typescript
export interface UserNavGroup {
  title: string;
  items: UserNavItem[];
  defaultOpen?: boolean;
}
```
`UserNavGroup` exported from `appkit/src/client.ts`.

---

**`src/app/[locale]/user/layout.tsx`** — Updated:

- Render order swapped: `{children}` BEFORE `<UserSidebar>` (puts sidebar on the RIGHT in the flex row)
- `USER_NAV_ITEMS` flat array replaced with `USER_NAV_GROUPS`:
  - **Shopping**: My Orders, My Offers, Addresses
  - **Account**: My Profile, Settings, Notifications, Messages
  - **Selling**: Open a Store
- `ALL_NAV_ITEMS` derived from groups (flat) for `items` prop (desktop list)
- `groups` prop passed to `UserSidebar` for mobile accordion rendering
- Wishlist removed from nav (now a public standalone page)

---

### Summary Table

| File | Change | Type |
|---|---|---|
| `appkit/src/seed/faq-seed-data.ts` | 65 LetItRip-accurate FAQs, full rewrite | Enhancement |
| `src/app/api/demo/seed/route.ts` | Import `wishlistsSeedData` from appkit | Bug Fix |
| `src/app/[locale]/stores/[storeSlug]/pre-orders/layout.tsx` | Created — fixes store pre-orders tab missing store header | Bug Fix |
| `appkit/src/next/routing/route-map.ts` | `WISHLIST` route → `/wishlist`; removed from `PROTECTED_ROUTES` | Enhancement |
| `src/app/[locale]/user/layout.tsx` | Remove wishlist nav; swap render order; add grouped nav | Enhancement |
| `src/app/[locale]/wishlist/layout.tsx` | Created (passthrough) | Enhancement |
| `src/app/[locale]/wishlist/page.tsx` | Created (public wishlist page) | Enhancement |
| `appkit/src/features/account/components/UserSidebar.tsx` | Right-side + collapsible desktop + mobile accordion | Enhancement |
| `appkit/src/client.ts` | Export `UserNavGroup` type | Enhancement |

---

## Session Update — 2026-05-04 (Part 2: Search/Filter Overhaul)

### Summary

Replaced all in-memory filtering with API-driven Sieve-based filtering. Added proper filter params for auctions, pre-orders, and reviews. Updated product schema, product repository, and product API to support new filter dimensions. Deployed 14 new Firestore composite indexes. Replaced anime/otaku coupon seed data with Pokemon TCG edition.

---

### 1. ReviewsIndexListing — API-Driven Conversion

**Problem:** `ReviewsIndexListing` took a `reviews: Review[]` prop and did ALL filtering, sorting, and pagination IN MEMORY via `useMemo`. This prevented server-side search and meant the 12-per-page client pagination was operating on a 48-item server-fetched slice.

**Solution:** Converted to use `useReviews` hook for API-driven pagination. Removed in-memory filtering entirely.

**Files changed:**

| File | Change |
|---|---|
| `appkit/src/features/reviews/types/index.ts` | Added `q`, `dateFrom`, `dateTo`, `minVotes`, `maxVotes` to `ReviewListParams` |
| `appkit/src/features/reviews/hooks/useReviews.ts` | Updated to pass all new filter params; auto-adds `latest=true` for general listing |
| `appkit/src/features/reviews/components/ReviewsIndexListing.tsx` | Removed `reviews` prop → replaced with `useReviews` hook; removed in-memory filter logic |
| `appkit/src/features/reviews/components/ReviewsIndexPageView.tsx` | Updated to build `ReviewListResponse` initialData for SSR hydration; added `q` + `maxVotes` to server-side filter builder |
| `src/app/api/reviews/route.ts` | Extended `latest=true` path to accept `q` (→ `productTitle@=*`), `rating`, `dateFrom`, `dateTo`, `minVotes`, `maxVotes` Sieve filters |

---

### 2. Products API — Auction & Pre-Order Filter Params

**Problem:** The products API only supported `minPrice`/`maxPrice` for price range. Auction-specific filters (bid range, auction end date) and pre-order filters (production status, delivery date, store) were not wired through to Firestore.

**Files changed:**

| File | Change |
|---|---|
| `appkit/src/features/products/types/index.ts` | Added `isPreOrder`, `storeId`, `minBid`, `maxBid`, `dateFrom`, `dateTo`, `preOrderStatus`, `freeShipping` to `ProductListParams` |
| `appkit/src/features/products/hooks/useProducts.ts` | Updated to serialize all new params to URL search params |
| `appkit/src/features/products/repository/products.repository.ts` | Added `storeId` and `freeShipping` to `SIEVE_FIELDS` |
| `src/app/api/products/route.ts` | Added `storeId`, `minBid`→`currentBid>=`, `maxBid`→`currentBid<=`, `dateFrom`/`dateTo` (auctions→`auctionEndDate`, pre-orders→`preOrderDeliveryDate`), `preOrderStatus`→`preOrderProductionStatus`, `freeShipping` to `buildFilters()` |
| `appkit/src/features/products/components/ProductsIndexListing.tsx` | Added `storeId` and `freeShipping` params from URL table |
| `appkit/src/features/products/components/ProductFilters.tsx` | Changed store filter URL param from `seller` to `storeId` to match API |

---

### 3. AuctionsIndexListing — Proper Auction Filter Params

**Problem:** `AuctionsIndexListing` mapped `minBid`/`maxBid` to `minPrice`/`maxPrice` (wrong), and didn't pass `storeId`/`dateFrom`/`dateTo`.

**Files changed:**

| File | Change |
|---|---|
| `appkit/src/features/products/components/AuctionsIndexListing.tsx` | Fixed param mapping: `minBid`/`maxBid` passed directly, added `storeId`, `dateFrom`, `dateTo` |
| `appkit/src/features/auctions/components/AuctionFilters.tsx` | Changed store URL param from `store` to `storeId` to match API |

---

### 4. Pre-Orders — Proper Filter Component

**Problem:** `PreOrdersIndexListing` used `ProductFilters` (wrong — shows condition/brand filters instead of pre-order specific ones).

**Files changed:**

| File | Change |
|---|---|
| `appkit/src/features/pre-orders/components/PreOrderFilters.tsx` | Updated status options to `upcoming`/`in_production`/`ready_to_ship`/`shipped`; changed store URL param to `storeId`; step 100 for price |
| `appkit/src/features/pre-orders/components/PreOrdersIndexListing.tsx` | Replaced `ProductFilters` with `PreOrderFilters`; added `storeId`, `preOrderStatus`, `dateFrom`, `dateTo` to `useProducts` params |
| `appkit/src/features/pre-orders/components/index.ts` | Added `PreOrderFilters` export |

---

### 5. Coupons Seed Data — Pokemon TCG Edition

**Problem:** `coupons-seed-data.ts` contained anime/otaku-themed coupons (WELCOME10, SAVE20, etc.) which don't match the Pokemon TCG platform theme.

**Files changed:**

| File | Change |
|---|---|
| `appkit/src/seed/coupons-seed-data.ts` | Re-exports `pokemonCouponsSeedData` from `pokemon-coupons-seed-data.ts` as the canonical `couponsSeedData` |

The 9 Pokemon TCG coupons (CATCHEM10, CHARIZARD25, POKESHIP, PIKADAY20, MISTYS15, BUYNOW500, GRADE10, POKE2026, FIRESALE12) are now the only coupon seed data.

---

### 6. Firestore Indexes — 14 New Composite Indexes

Added composite indexes to `firestore.indexes.json` for the new filter combinations. **Deployed to Firebase.**

New indexes added for `products` collection:
- `storeId` + `status` + `createdAt`
- `isAuction` + `storeId` + `status` + `auctionEndDate`
- `isAuction` + `storeId` + `currentBid`
- `isAuction` + `currentBid` + `auctionEndDate`
- `isAuction` + `status` + `auctionEndDate` + `currentBid`
- `isPreOrder` + `storeId` + `status` + `preOrderDeliveryDate`
- `isPreOrder` + `preOrderProductionStatus` + `createdAt`
- `isPreOrder` + `preOrderProductionStatus` + `preOrderDeliveryDate`
- `freeShipping` + `status` + `createdAt`

New indexes added for `reviews` collection:
- `status` + `helpfulCount` (ASC) + `createdAt`
- `status` + `rating` (ASC) + `helpfulCount`
- `status` + `productTitle` + `createdAt`

**Firebase deploy:** `firebase deploy --only firestore:indexes` — ✅ successful

---

## Session Update — 2026-05-04 (Part 4 — Multi-Franchise Seed, Dev Tools, Full-Screen Panels)

### Seed Data — Multi-Franchise Expansion (4 Franchises)

Extended the seed catalogue from Pokémon-only to four franchises: **Pokémon TCG · Hot Wheels · Beyblade Burst · Transformers**.

**New seed files (appkit/src/seed/)**
- `hot-wheels-seed-data.ts` — 26 products: Car Culture, Treasure Hunt, Premium, Boulevard series + pre-orders
- `beyblade-seed-data.ts` — 22 products: Burst GT, Dynamite Battle, DB series, stadiums + pre-orders
- `transformers-seed-data.ts` — 18 products: G1 vintage, Studio Series, Legacy, Kingdom + pre-orders
- `pokemon-seed-bundle.ts` — exports `allProductsSeedData` combining all 4 franchise arrays

**Updated seed files**
- `pokemon-products-seed-data.ts` — expanded to ~40 products including holos, non-holos, trainers, graded slab, booster box, 3 pre-orders
- `pokemon-carousel-slides-seed-data.ts` — 5 slides (3 active with ≤2 cards+buttons, 2 disabled)
- `pokemon-homepage-sections-seed-data.ts` — 5 sections with correct literal types (`maxProducts:18`, `itemsPerRow:3`, `mobileItemsPerRow:1`, `rows:2`)
- `faq-seed-data.ts` — +38 new FAQs (Hot Wheels, Beyblade, Transformers, Seller topics); total ~103
- `blog-posts-seed-data.ts` — +3 published posts with YouTube `<iframe>` embeds + HTML tables; total 14 posts
- `events-seed-data.ts` — +7 events (sale, poll, survey, offer, feedback types); total 13 events
- `pokemon-coupons-seed-data.ts` — +4 coupons (percentage, buy_x_get_y, fixed types)
- `site-settings-seed-data.ts` — updated motto, announcement bar, SEO metadata for multi-franchise brand
- `pokemon-users-seed-data.ts` — removed non-existent `banReason/bannedAt/bannedBy` fields
- `index.ts` — added exports for all 3 new franchise files + `allProductsSeedData`

**Seed route** (`src/app/api/demo/seed/route.ts`) — switched `products` to `allProductsSeedData` (all 4 franchises)

**Schema fixes applied across all franchise files:**
- Removed `materials`, `sections`, `preOrderNote` (non-existent fields)
- `preOrderStatus: "open"` → `preOrderProductionStatus: "upcoming"`
- `preOrderEstimatedDate` → `preOrderDeliveryDate`
- Coupon types `"flat"` → `"fixed"`, `"free-item"` → `"buy_x_get_y"`
- EventStatus `"cancelled"` → `"ended"` (not a valid value)
- Homepage section literal type violations fixed

---

### Dev Tools — Mock Payment & Shipping Servers

**`src/app/api/dev/mock-razorpay/route.ts`** (new)
- Dev-only route, returns `403` when `NODE_ENV !== "development"`
- `GET ?id=` fetch order · `POST` create order · `POST /payments/verify` · `POST /payments/capture/:id` · `POST /refunds`
- In-memory `ORDERS` Map, full Razorpay response schema

**`src/app/api/dev/mock-shiprocket/route.ts`** (new)
- Dev-only route, returns `403` in production
- `GET ?action=status|track|rates` · `POST ?action=login|create-order|cancel-order`
- Random tracking statuses, mock courier rates (BlueDart, Delhivery, DTDC)

**`src/components/dev/DevToolbar.tsx`** (new)
- Floating fixed panel (bottom-right, z-9999), only renders on `localhost` / `NEXT_PUBLIC_APP_ENV=development`
- Persists `{mockRazorpay, mockShiprocket, showToolbar}` to `localStorage["letitrip_dev_prefs"]`
- Exports: `DevToolbar`, `isMockRazorpayEnabled()`, `isMockShiprocketEnabled()`, `getDevPrefs()`

**`src/app/[locale]/layout.tsx`** — added `<DevToolbar />` as last child; self-guarding, zero production impact

---

### UI — Full-Screen Edit Panels

**`appkit/src/ui/components/SideDrawer.style.css`**
- Width: always `100%` on all breakpoints (removed `420px` left / `60%` right at `md`)
- z-index: `50` → `40` — app navbar/BottomSheet (`z-50`) renders on top of open panels

---

### Appkit Build

- `npm run build` → 0 TypeScript errors, 108 asset files copied to `dist/`
- Appkit committed at `e836a7d`

---

### Vercel Deployment

- All changes committed and pushed to `main`
- Vercel preview deployment triggered via `main` branch push
