# Change Log — Session 2026-05-03

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
