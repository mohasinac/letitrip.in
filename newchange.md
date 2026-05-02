# Change Log — Session 2026-05-03

> Full record of every file touched, why it was changed, and what was fixed or built.
> Covers work across both the **appkit** submodule (`appkit/src/`) and the **consumer app** (`src/`).

---

## Summary

| Area | What Changed |
|---|---|
| Category Detail | Complete page rewrite: hero banner, sub-category chips, Products/Auctions/Pre-Orders tabs |
| Listing Toolbars | Sticky filter+search+sort toolbar added to Events, Blog, Stores, Reviews index listings |
| Store Detail | Pre-Orders tab added; StoreHeader rating/metrics redesigned |
| Store Sub-Listings | Products/Auctions/Pre-Orders store listings rewritten with sticky toolbar + grid/list toggle |
| Store Pre-Orders | New listing component, new RSC page view, new route, new consumer app page |
| Card Navigation | Blog, Event, Review cards now navigate on click via Next.js Link |
| Card Design | Author avatar, featured badge, icons, PII-safe names, rich text rendering improved |
| BaseListingCard | Migrated from CSS class file (not imported in app) to Tailwind — fixed card gap/border bug |
| Route Map | `STORE_PRE_ORDERS` route added |

---

## Git Status at End of Session

### Consumer App (`src/`)
| Status | File |
|---|---|
| New | `src/app/[locale]/stores/[storeSlug]/pre-orders/page.tsx` |

### Appkit Submodule (`appkit/src/`) — 49 files changed, +3381 / -1402 lines

---

## Detailed File-by-File Changes

---

### 1. `appkit/src/features/categories/components/CategoryDetailPageView.tsx`
**Type:** Full rewrite (RSC)

**Before:** Minimal page showing breadcrumb + category title + `CategoryProductsListing`.

**After:**
- **Hero section** — full-bleed cover image (`bg-black/55` overlay) or plain zinc background when no image. Breadcrumb nav adapts text colour based on hero presence.
- **Title + Description** — large heading, description rendered as plain text (safe), item count pill (`{productCount} items`).
- **Sub-categories horizontal scroller** — fetches `categoriesRepository.getChildren(category.id)`, renders as horizontal scrollable chip links with no visible scrollbar.
- **Tab shell** — renders `<CategoryDetailTabs categorySlug={slug} initialProductsData={initialData} />`.
- Added `isAuction==false` filter to initial products fetch so only regular products load on the Products tab.

---

### 2. `appkit/src/features/categories/components/CategoryDetailTabs.tsx` *(NEW)*
**Type:** New client component

- Pure `useState` tab management (avoids `useSearchParams` Suspense requirement).
- Tabs: **Products** (`CategoryProductsListing`), **Auctions** (`AuctionsIndexListing`), **Pre-Orders** (`PreOrdersIndexListing`).
- Each tab passes `categorySlug` down so each listing can filter by category.
- Active tab indicator: `border-b-2 border-primary text-primary`.
- Exported from `categories/components/index.ts`.

---

### 3. `appkit/src/features/categories/components/index.ts`
- Added exports for `CategoryDetailTabs` and its props type.

---

### 4. `appkit/src/features/products/components/AuctionsIndexListing.tsx`
- Added `categorySlug?: string` to `AuctionsIndexListingProps`.
- Passes `categorySlug` into `useProducts` params so auction listings can filter by category.
- Also rebuilt with sticky toolbar: Filters drawer (ProductFilters) | Search+commit | SortDropdown | Grid/List toggle.

---

### 5. `appkit/src/features/pre-orders/components/PreOrdersIndexListing.tsx`
- Added `categorySlug?: string` to `PreOrdersIndexListingProps`.
- Passes `categorySlug` into `useProducts` params so pre-order listings can filter by category.
- Also rebuilt with sticky toolbar pattern matching the other index listings.

---

### 6. `appkit/src/features/events/components/EventsIndexListing.tsx`
**Type:** Full rewrite

**Before:** Used old `SlottedListingView` pattern with inline toolbar, no sticky behaviour.

**After:**
- **Sticky toolbar** (`sticky top-0 z-20 backdrop-blur-sm`): Filters button → slide-in drawer with `EventFilters` | Search input + commit on Enter/click | SortDropdown.
- **Filter drawer**: `fixed inset-y-0 left-0 z-50 w-80` panel, backdrop `fixed inset-0 z-40 bg-black/40`, Apply button closes drawer.
- **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- **Skeleton**: 6 `animate-pulse` aspect-video placeholder cards while loading.
- Pagination at bottom with `Pagination` component.

---

### 7. `appkit/src/features/events/components/EventCard.tsx`
**Type:** Enhanced

**Before:** Had a TextLink "View details" button at the bottom only.

**After:**
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
