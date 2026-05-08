# newchange.md — Session Log & Deferred Items

> **Append new session entries below the DEFERRED section, newest first.**
> After completing a task that defers or skips any spec component, add it to DEFERRED below AND log the session entry.

---

## ⚠️ DEFERRED / SKIPPED ITEMS — READ BEFORE EACH SESSION

> These are known gaps from previous sessions. Resolve before marking the parent task fully closed, or create a new explicit task.

| Date | Task | What was deferred / skipped | Status | Fix target |
|------|------|-----------------------------|--------|------------|
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
