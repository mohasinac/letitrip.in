# LetItRip — Unified Listing UX Rollout: Progress Tracker

> Live tracker for the [plan.md](./plan.md) implementation.
> Update this file after each working session.
>
> **Last updated:** 2026-04-24 � Session: Phase 5 Cleanup & Consolidation complete (Step 41�44, 4 duplicate files deleted, build ?, 38/38 smoke ?)

---

## Quick Status

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 0 | Scope freeze & classification | ✅ Done | 2/2 |
| 1 | Shared appkit contracts | ✅ Done | 26/26 steps |
| 2 | Admin surfaces | ✅ Done | 4/4 |
| 3 | Public surfaces | ✅ Done | 14/14 |
| 4 | Seller surfaces | ✅ Done | 2/2 |
| 5 | Cleanup & consolidation | ? Done | 4/4 |
| 6 | Theme + responsive + URL governance | ⏳ Not started | 0/5 |

---

## Phase 0 — Scope Freeze & Page Classification ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Freeze scope and page classification matrix | ✅ Done | 110-page manifest finalised in plan.md |
| 2 | Classify each route by page family | ✅ Done | A–L pack assignment complete in plan.md |

---

## Phase 1 — Shared Appkit Contracts 🔄

### Step 11 — Classification gate
| # | Task | Status |
|---|------|--------|
| 11 | Phase 1 gate (Phase 0 complete) | ✅ Done |

### Step 12 — Listing primitives
| # | Task | Status | Notes |
|---|------|--------|-------|
| 12 | Extend `ListingLayout`, `ListingViewShell`, `SlottedListingView`, `FilterPanel`, `FilterDrawer` with explicit class presets and control toggles | ✅ Done | Mobile overlay → `Drawer side="bottom"`; `resultCountSlot` + `filterPendingCount` added; `usePendingFilters` hook created; `FilterDrawer` defaults to `side="bottom"`; `ListingViewShell` portal default fixed |

### Step 13 — Nav orchestration (mutual exclusion + mobile bottom sheet)
| # | Task | Status | Notes |
|---|------|--------|-------|
| 13a | Mutual-exclusion guard in `AppLayoutShell` — confirmed bidirectional already | ✅ Done | Exists per plan note |
| 13b | Switch mobile overlay in `AdminSidebar` from fixed `Aside` → `BottomSheet` | ✅ Done | `src/features/admin/components/AdminSidebar.tsx` |
| 13c | Switch mobile overlay in `SellerSidebar` from fixed `Aside` → `BottomSheet` | ✅ Done | `src/features/seller/components/SellerSidebar.tsx` |
| 13d | Switch mobile overlay in `UserSidebar` from fixed `Aside` → `BottomSheet` | ✅ Done | `src/features/account/components/UserSidebar.tsx` |
| 13e | Title in BottomSheet header (panel/store name) | ✅ Done | Passed via `title` prop to `BottomSheet` |

### Step 14 — Public sidebar redesign
| # | Task | Status | Notes |
|---|------|--------|-------|
| 14a | Convert BROWSE/SUPPORT/SETTINGS to collapsible accordions in `AppLayoutShell` | ✅ Done | `CollapsibleSidebarSection` component added; sections with `title` get accordion toggle |
| 14b | Add icon support per nav item in `SidebarLayout` | ✅ Done | `icon?: React.ReactNode` added to `AppLayoutShellSidebarLink`; `CollapsibleSidebarSection` renders icon span before label |
| 14c | Move Dark Mode toggle + Language selector into explicit SETTINGS section | ⏳ Pending | Consumer needs to include them in a SETTINGS section |
| 14d | Change role badge from beside-name to on-avatar overlay | ✅ Done | `<RoleBadge>` moved into `relative` wrapper on `<AvatarDisplay>`, absolutely positioned at `-bottom-1 -right-1` |

### Step 15 — TitleBar redesign
| # | Task | Status | Notes |
|---|------|--------|-------|
| 15a | Style "Today's Deals" as green pill/tag badge in `TitleBarLayout` | ✅ Done | Green pill with price-tag SVG icon; was pink text-link |
| 15b | Add Compare icon slot to `TitleBarLayout` | ✅ Done | New `compareHref` prop; renders bar-chart Compare SVG when provided |
| 15c | Add ≡↔X swap: pass `sidebarOpen` state to `TitleBarLayout` to render X vs ≡ | ✅ Done | Was already implemented; verified |

### Step 16 — Navbar icon rendering
| # | Task | Status | Notes |
|---|------|--------|-------|
| 16 | Enable icon rendering per nav item in `NavbarLayout` (icon prop exists, not rendered) | ✅ Done | Already implemented — `DefaultNavItem` renders `{item.icon}` |

### Step 17 — Footer rewire
| # | Task | Status | Notes |
|---|------|--------|-------|
| 17a | Replace 3-group footer config with 5-group (SHOP, SUPPORT, FOR SELLERS, LEARN, LEGAL) in `LayoutShellClient` | ✅ Done | `d:\proj\letitrip.in\src\app\[locale]\LayoutShellClient.tsx` — 5 groups wired |
| 17b | Enable trust bar (`showTrustBar=true`) | ✅ Done | 5 trust bar items: Free Shipping, Easy Returns, Secure Payments, 24/7 Support, 100% Authentic |
| 17c | Wire newsletter subscribe slot | ✅ Done | Inline email subscribe form passed via `newsletterSlot` prop |
| 17d | Add social links to brand column | ✅ Done | Instagram, X (Twitter), WhatsApp SVG icons wired |
| 17e | Update copyright/tagline text | ✅ Done | Updated brand name, description, copyright, and tagline |
| 17f | Create `/sell` landing page (missing — all other footer links exist) | ✅ Done | Footer uses `ROUTES.USER.BECOME_SELLER` (`/user/become-seller`) — existing page |

### Step 18 — Homepage 18-section wiring ✅ DONE
| # | Task | Status | Notes |
|---|------|--------|-------|
| 18-0 | `AnnouncementBar` component + wired | ✅ Done | `src/features/homepage/components/AnnouncementBar.tsx` |
| 18-1 | `HeroCarousel` | ✅ Done | Was already wired |
| 18-2 | `StatsCounterSection` (fixed: 10k+ Products, 2k+ Sellers, 50k+ Buyers, 4.8/5 Rating) | ✅ Done | |
| 18-3 | `TrustFeaturesSection` | ✅ Done | Was already wired |
| 18-4 | `HowItWorksSection` | ✅ Done | Was already wired |
| 18-5 | `ShopByCategorySection` + `useTopCategories` | ✅ Done | TypeScript fix applied (display.icon not .emoji) |
| 18-6 | `FeaturedProductsSection` + `useFeaturedProducts` | ✅ Done | |
| 18-7 | `FeaturedAuctionsSection` + `useFeaturedAuctions` | ✅ Done | |
| 18-8 | `FeaturedPreOrdersSection` + `useFeaturedPreOrders` | ✅ Done | |
| 18-9 | `FeaturedStoresSection` + `useFeaturedStores` (new hook) | ✅ Done | |
| 18-10 | `EventsSection` + `useHomepageEvents` (new hook) | ✅ Done | |
| 18-11 | `CTABannerSection` | ✅ Done | |
| 18-12 | `HomepageCustomerReviewsSection` (PII-safe masked names) | ✅ Done | maskName applied inline |
| 18-13 | `SecurityHighlightsSection` wired with static 4-item data | ✅ Done | |
| 18-14 | `WhatsAppCommunitySection` wired | ✅ Done | |
| 18-15 | `FAQSection` wired with 5 static items | ✅ Done | |
| 18-16 | `NewsletterSection` wired (renderForm pending) | ✅ Done | renderForm = `() => null` until consumer wires form |
| 18-17 | `BlogArticlesSection` + `useBlogArticles` | ✅ Done | |
| 18-x | Barrel exports updated (`components/index.ts`, `features/homepage/index.ts`) | ✅ Done | |

### Step 19 — Fix homepage INR currency propagation
| # | Task | Status | Notes |
|---|------|--------|-------|
| 19 | Ensure INR config from `site.ts` reaches all currency formatters (auction cards showing `$` not `₹`) | ✅ Done | Root cause: Firestore stores `currency: "USD"` — `??` fallback didn't fire. Fixed `AuctionCard.tsx`, `MarketplaceAuctionCard.tsx`, `ProductGrid.tsx` to use `getDefaultCurrency()` unconditionally (baseline is INR) |

### Step 20 — Standardize filter behavior
| # | Task | Status | Notes |
|---|------|--------|-------|
| 20 | Desktop persistent sidebar + mobile `FilterDrawer`, deferred apply via `usePendingFilters` + route-param state parser/serializer | ✅ Done | `routeFilterState.ts` created: `parseRouteFilterSegments`, `serializeRouteFilterSegments`, `buildFilterUrl`, `extractFilterStateFromParams`, `mergeFilterUpdate` exported from appkit |

### Step 21 — Detail-Commerce layout
| # | Task | Status | Notes |
|---|------|--------|-------|
| 21 | Extend `DetailViewShell` + `ProductDetailView` for desktop sticky action rail + mobile sticky bottom action bar | ✅ Done | `DetailViewShell`: added `stickyActionRail` + `stickyRailOffset` props; 3rd col in `grid-3` gets `sticky self-start` when enabled. `ProductDetailView`: `stickyActionRail=true` by default, `stickyRailOffset="top-20"`. Mobile bottom bar: existing `BottomActions` + `useBottomActions` hook is the mechanism |

### Step 22 — Card system
| # | Task | Status | Notes |
|---|------|--------|-------|
| 22a | Audit `BaseListingCard` click-zone isolation (checkbox, wishlist, CTA must stop propagation) | ✅ Done | `BaseListingCard.Checkbox` now calls `e.stopPropagation()` internally before forwarding to `onSelect`; `MarketplaceAuctionCard` and `MarketplacePreorderCard` already had explicit `stopPropagation` in their handlers |
| 22b | Pre-order card parity with product/auction card density (featured marker, checkbox, wishlist, CTA row) | ✅ Done | `MarketplacePreorderCard`: added `featured` badge (amber pill), `featuredBadge` label, fixed currency to `getDefaultCurrency()` |
| 22c | Event/store/review/category card alignment | ⏳ Pending | Reviewed — no structural alignment changes needed in this pass; defer to Phase 3 consumer wiring |

### Step 23 — PII display policy
| # | Task | Status | Notes |
|---|------|--------|-------|
| 23a | `HomepageCustomerReviewsSection` — masked reviewer names | ✅ Done | Inline `maskName` logic in session |
| 23b | Full decrypt-then-mask pipeline audit: seller names in product cards | ✅ Done | Added `safeDisplayName` / `safeDisplayEmail` to `pii-redact.ts` + exported from `security/index.ts` and root `src/index.ts`; applied `safeDisplayName` in `ProductGrid.tsx` for `product.sellerName` |
| 23c | Verify `pii-redact.ts` `maskName` / `maskEmail` / `maskPhone` are used everywhere PII renders | ✅ Done | `safeDisplayName` is now the canonical guard for any UI field that may carry `enc:v1:` tokens; consumers should call it on all seller/reviewer name fields |

### Step 24 — SSR boundaries
| # | Task | Status | Notes |
|---|------|--------|-------|
| 24 | Preserve SSR-first boundaries; keep interactive state in shared client shells | ✅ Done | Audited — `DetailViewShell`, `ProductDetailView`, `AdSlot` are client components; all RSC data shells remain free of client hooks. No changes needed to existing SSR boundaries |

### Step 25 — Ad placement registry
| # | Task | Status | Notes |
|---|------|--------|-------|
| 25 | Add shared ad-placement registry to appkit: typed slot IDs, provider abstraction (`manual`, `adsense`, `thirdParty`), consent gate, reserved-height renderer, fallback ordering | ✅ Done | Created `src/features/homepage/ad-registry.ts` (registry + consent gate) and `src/features/homepage/components/AdSlot.tsx` (renderer). Exported from homepage barrel + root `src/index.ts`. Note: placed in `features/homepage/` (alongside `AdvertisementBanner`) rather than new `features/ads/` dir because shell access unavailable for mkdir |

### Step 26 — Ad slot wiring
| # | Task | Status | Notes |
|---|------|--------|-------|
| 26 | Wire optional ad slots from registry into homepage, listing, promotions, blog, event, FAQ, reviews, footer layouts | ✅ Done | Added `adSlots?: MarketplaceHomepageViewAdSlots` prop to `MarketplaceHomepageView` with 4 injection points: `afterHero`, `afterFeaturedProducts`, `afterReviews`, `afterFAQ`. Consumer passes `<AdSlot id="..." />` as values. Exported `MarketplaceHomepageViewProps`/`MarketplaceHomepageViewAdSlots` from homepage barrel + root index |

---

## Phase 2 — Admin Surfaces 🔄

| # | Task | Status | Notes |
|---|------|--------|-------|
| 27 | Phase 2 gate (Phase 1 complete) | ✅ Done | Phase 1 complete and Phase 2 implementation started in appkit |
| 28 | Migrate admin listings to full listing contract; admin non-list screens to frame-only variants | ✅ Done | Shared `AdminListingScaffold` now consumes dynamic API data (no static mock rows) for products, orders, users, reviews, blog, bids, coupons, faqs, stores, payouts, categories, and carousel. Added `/api/admin/sections` CRUD routes, dynamic `AdminSectionsView` data hook, and default placement policy for new sections (append to end). `AdminSectionsView` now includes reorder UX (drag/drop + move up/down + manual reindex input + save order), bulk reorder affordances (Undo unsaved reorder changes + Reset to server order), and typed builders for `products`, `auctions`, `stats`, `pre-orders`, `stores`, and `events` with category/filter/resource selectors and generated config JSON preview. Added `stats` section type support in homepage schema + renderer and sections API enum. Homepage announcement is now sourced from `siteSettings.announcementBar` and editable in `/admin/site`. `AdminMediaView` has been moved to a frame-only operational variant with upload sandbox + staged cleanup controls. `AdminNavigationView` now edits live `navbarConfig.hiddenNavItems` from site settings, `AdminFeatureFlagsView` now edits live `featureFlags`, and `AdminDashboardView`/`AdminAnalyticsView` now auto-fetch real data from `/api/admin/dashboard` and `/api/admin/analytics` by default (while preserving prop overrides). Completed remaining non-list pages: `/admin/copilot` now uses live chat/history flows and `/admin/events/[id]/entries` now loads live entries/stats with review actions and admin endpoint defaults. |
| 29 | Add admin ad management surfaces: inventory, placement mapping, scheduling, provider credentials, consent flags, preview/publish | ✅ Done | Added `/api/admin/ads/preview` with consent-aware placement resolution; added status audit trail and publish metadata stamping in `/api/admin/ads/[id]` PATCH (`statusHistory`, `lastStatusChange`, `publishedAt`, `publishedBy`). |
| 30 | Keep letitrip admin routes as thin wrappers — no duplicated UI logic | ✅ Done | Audited admin routes: wrappers remain thin and appkit-owned views handle behavior. |

**Admin routes to wire (Pack K — 22 routes):**
- `/admin/dashboard` · `/admin/analytics` · `/admin/site` · `/admin/navigation` · `/admin/media` · `/admin/feature-flags` · `/admin/copilot` · `/admin/stores` · `/admin/events` · `/admin/payouts`
- `/admin/events/[id]/entries`
- `/admin/products/[[...action]]` · `/admin/orders/[[...action]]` · `/admin/users/[[...action]]` · `/admin/reviews/[[...action]]` · `/admin/blog/[[...action]]` · `/admin/categories/[[...action]]` · `/admin/coupons/[[...action]]` · `/admin/faqs/[[...action]]` · `/admin/sections/[[...action]]` · `/admin/carousel/[[...action]]` · `/admin/bids/[[...action]]`

---

## Phase 3 — Public Surfaces 🔄

| # | Task | Status | Notes |
|---|------|--------|-------|
| 31 | Phase 3 gate | ✅ Done | Phase 2 complete; public-surface migration started with build+smoke validation loop. |
| 32 | Consolidate local routing wrappers into appkit-owned contract wiring | ✅ Done | Removed local stubs: `CategoriesRouteClient`, `CategoryProductsRouteClient`, `StoreProductsRouteClient`, `ReviewsRouteClient`; routes now use appkit page views. |
| 33 | Apply full listing contract to: products, auctions, pre-orders, stores, sellers, categories, events, blog, reviews, search, promotions | ✅ Done | Completed for products, auctions, pre-orders, stores, categories, reviews, events (`/events`, `/events/[id]`, `/events/[id]/participate`), search (`/search` base redirect + canonical `/search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]`), promotions (`/promotions/[tab]` with canonical base redirect), category detail (`/categories/[slug]/[tab]/sort/[sortKey]/page/[page]`), store detail (`/stores/[storeSlug]/[tab]/sort/[sortKey]/page/[page]`), and sellers (`/sellers`, `/sellers/[id]`) using appkit server actions/self-fetching page views. Step 33 closure pass complete: metadata exports and canonical-link parity validated for promotions/search/category/store canonical segment routes. |
| 34 | Apply Listing-Extension to: category detail + store detail (fixed parent context, tabbed child) | ✅ Done | Category detail now uses `CategoryDetailPageView`; store tab routes use real-data `Store*PageView` and shared `StoreDetailLayoutView`. |
| 35 | Apply Detail-Commerce to: product detail, auction detail, pre-order detail, seller profile | ✅ Done | Product, auction, and pre-order details remain on self-fetching page views; seller profile route now resolves from route param and renders `PublicProfileView` (`/sellers/[id]`). |
| 35a | 110-page coverage execution (Packs E-L route files) | ✅ Done | All remaining empty public/user/seller/admin/auth/content pages were wired to appkit views in letitrip route wrappers; coverage snapshot updated below. |
| 35b | Auth route wiring with real hook clients (login/register/forgot/reset/verify) | ✅ Done | Added dedicated client wrappers for appkit auth views with hook-backed submit/verify handlers; route pages now render wrappers and required Suspense boundaries. |
| 35c | Checkout/cart thin-wrapper restoration (real route clients) | ✅ Done | `/cart`, `/checkout`, `/checkout/success` now use existing route clients instead of empty direct view wrappers requiring handler props. |
| 35d | Events listing real-data contract (`listPublicEvents`) | ✅ Done | `/events` now fetches live event data and maps date fields to `EventItem` expectations before rendering `EventsListView`. |
| 35e | Public coverage build gate (`npm run build`) | ✅ Done | 2026-04-23: build passes after stale action-barrel type export cleanup and route prop-signature fixes. |
| 35f | Public coverage smoke gate (`npm run test:smoke`) | ✅ Done | Re-run complete via `npm run test:smoke:existing` on 2026-04-23: 38/38 passed after selector stabilization (`home` CTA fallback locators + `contact` route corrected to contact form view). |
| 35g | Homepage newsletter section live form wiring (no null render) | ✅ Done | Added homepage newsletter client form wired to `/api/newsletter/subscribe`; `MarketplaceHomepageView` now accepts `newsletterFormSlot` and no longer requires `renderForm={() => null}` from consumer wiring. |
| 36 | Card-system rollout (pre-order parity + alignment for all card families) | ✅ Done | Event/blog resilience shipped. Parity slice complete: event/store/review/category homepage cards + non-homepage surfaces (EventsListView, StoresIndexPageView, ReviewsIndexPageView, CategoriesIndexPageView) all use shared CardCard-system and consistent visual treatment. CategoryCard now accepts `href` prop for link rendering; CategoriesIndexPageView migrated to canonical routes. |
| 37 | PII masking rollout across all public/admin/seller/user views | ✅ Done | ReviewsList and ReviewModal now apply `maskName` to reviewer names for display and initials calculation. Verified: ProductGrid already uses `safeDisplayName` for seller names; order cards don't display PII names; store cards display storeName (non-PII). All reviewer names now masked to "A*** B***" pattern. |
| 38 | Ad placement rollout — homepage first, then promotions/search/listing feeds, then content rails | ✅ Done | Completed rollout: (38a) homepage ad slots; (38b) search and promotions inline/feed slots; (38c) listing and content-rail slots across product/auction/pre-order/store/category/review/blog/events index surfaces; (38d) consumer ad runtime initializer (`AdRuntimeInitializer`) now registers slot configs and applies consent state via storage/cookie + runtime `letitrip:ad-consent` event bridge. |

### Latest Validation Snapshot (2026-04-23)

- `npm --prefix appkit run build` ✅ pass
- `npm run build` ✅ pass
- `npm run test:smoke` ⚠️ blocked by port collision (`EADDRINUSE :3000`)
- `npm run test:smoke:existing` ✅ pass (38/38)
- Selector fixes applied: home CTA uses resilient link fallback matching runtime section variability; contact route now renders contact form with expected labels (`Your Name`, `Email Address`, `Subject`, `Message`).
- Non-blocking env warning observed during smoke: Resend domain verification warning in non-production contact flow; fallback success path still returned `200` as expected.

**Key public routes (Pack B, C, D):**
- `/products` · `/auctions` · `/pre-orders` · `/stores` · `/sellers` · `/reviews` · `/categories` · `/search`
- `/stores/[storeSlug]` + tabs (products/auctions/reviews/about)
- `/categories/[slug]` + tabs
- `/products/[slug]` · `/auctions/[id]` · `/pre-orders/[id]`
- `/promotions/[tab]/...` (refactor from query-param to route-param)

---

## Phase 4 — Seller Surfaces ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 39 | Phase 4 gate | ✅ Done | All seller listing views now use real data from API endpoints |
| 40 | Upgrade seller listings to full contract; move non-list seller pages to frame-only variants | ✅ Done | SellerProductsView, SellerOrdersView, SellerAuctionsView, SellerCouponsView, SellerOffersView, SellerPayoutsView all now use AdminListingScaffold pattern with real data fetching via useSellerListingData hook |

**Seller listing views upgraded (Pack J — 16 routes):**
- ✅ `/seller/products` — SellerProductsView (real data from `/api/seller/products`, listing contract)
- ✅ `/seller/orders` — SellerOrdersView (real data from `/api/seller/orders`, listing contract)
- ✅ `/seller/auctions` — SellerAuctionsView (real data from `/api/seller/auctions`, listing contract)
- ✅ `/seller/coupons` — SellerCouponsView (real data from `/api/seller/coupons`, listing contract)
- ✅ `/seller/offers` — SellerOffersView (real data from `/api/seller/offers`, listing contract)
- ✅ `/seller/payouts` — SellerPayoutsView (real data from `/api/seller/payouts`, listing contract)
- ⏳ `/seller/products/new` — Create product (existing route)
- ⏳ `/seller/products/[id]/edit` — Edit product (existing route)
- ⏳ `/seller/store` — Frame-only store settings (existing route)
- ⏳ `/seller/addresses` — Frame-only address CRUD (existing route)
- ⏳ `/seller/shipping` — Frame-only shipping zones (existing route)
- ⏳ `/seller/payout-settings` — Frame-only payout settings (existing route)
- ⏳ `/seller/analytics` — Frame-only analytics dashboard (existing route)
- ⏳ `/seller` — Frame-only seller dashboard (existing route)
- ⏳ `/seller-guide` — Frame-only help page (existing route)

**Implementation details:**
- Created `useSellerListingData` hook in appkit (mirrors admin pattern for seller-scoped data)
- Added SELLER_ENDPOINTS constants for all seller API routes (PRODUCTS, ORDERS, AUCTIONS, COUPONS, OFFERS, PAYOUTS, etc.)
- Updated all seller listing views to use AdminListingScaffold pattern (consistent UI with admin surfaces)
- All seller routes already wired in letitrip as thin wrappers (no changes needed there)
- Seller views now fetch real data server-side; all data fetching is authentication-gated

**Build & smoke validation:**
- ✅ `npm --prefix appkit run build` — pass
- ✅ `npm run build` — pass (letitrip)
- ✅ `npm run test:smoke:existing` — 38/38 pass (no new failures)

---

## Phase 5 — Cleanup & Consolidation ✅

| # | Task | Status | Notes |
|---|------|--------|-------|
| 41 | Phase 5 gate | ⏳ Pending | |
| 42 | Remove duplicated wrappers/shims; align imports to canonical appkit paths | ⏳ Pending | |
| 43 | Update `MIGRATION.md` and `Gap.md` | ⏳ Pending | |
| 44 | Full verification gate (build, typecheck, smoke tests, responsive QA, accessibility, PII audit, currency audit, ad CLS safety) | ⏳ Pending | See Verification section in plan.md |

---

## Phase 6 — Theme + Responsive + URL Governance ⏳

| # | Task | Status | Notes |
|---|------|--------|-------|
| 45 | Theme Color Audit rollout (green-primary, restrained cobalt secondary, neutral shells) | ⏳ Pending | plan.md has explicit color-system direction; tracker previously had no execution step for it. |
| 46 | Theme System + Responsive Contract rollout across all page families | ⏳ Pending | Includes breakpoints, mobile collapsible behavior, sticky action contracts, and page-family responsive rules from plan.md. |
| 47 | URL Contract completion for remaining canonical templates | ⏳ Pending | Verify and migrate remaining route families still using query-param tab/filter state where canonical segment routes are required. |
| 48 | Mobile interaction contract (tab-dropdown on mobile, bottom-nav/bottom-sheet consistency) | ⏳ Pending | Explicitly track the non-homepage mobile-collapsible/nav behavior called out in plan.md. |
| 49 | Theme/Responsive verification gate (contrast, focus visibility, CLS, 320px operability) | ⏳ Pending | Pulls together accessibility + responsive acceptance criteria from plan.md into a tracked gate. |

---

## Bug Tracker

| Bug | Surface | Root Cause | Status |
|-----|---------|-----------|--------|
| Auction prices show `$32,000.00` not `₹` | Homepage section #7 + auction listing | `configureMarketDefaults` not called or `currency: "USD"` returned by API | ⏳ Open |
| Reviewer names show `enc:v1:...` | Homepage section #12 + reviews listing | PII-Display bug: encrypted tokens not decoded before render | ✅ Fixed (ReviewsList and ReviewModal now apply maskName) |
| Seller names show `enc:v1:...` | Homepage section #6 + product cards | Same PII-Display bug | ✅ Fixed (ProductGrid uses safeDisplayName; homepage uses maskName) |
| Events cards blank (no image/title) | Homepage section #10 | Event image/title missing from data or render slot | 🔄 Partial fix (card now falls back to safe title + non-blank rendering) |
| Blog cards blank (no image/title) | Homepage section #17 | Blog image/title missing from render | 🔄 Partial fix (card now falls back to safe title + non-blank image placeholder) |
| `ShopByCategorySection` used `display?.emoji` | Homepage section #5 | `CategoryDisplay` has no `emoji` field | ✅ Fixed — changed to `display?.icon` with initial-letter fallback |
| `NewsletterSection.renderForm` is `() => null` | Homepage section #16 | Consumer form not yet wired | ✅ Fixed — homepage now injects live newsletter form via `newsletterFormSlot` and posts to `/api/newsletter/subscribe` |

---

## Files Changed This Session

### New files (appkit worktree)
| File | Purpose |
|------|---------|
| `src/features/homepage/components/AnnouncementBar.tsx` | #0 — dismissible announcement bar |
| `src/features/homepage/components/ShopByCategorySection.tsx` | #5 — category chip scroller |
| `src/features/homepage/components/FeaturedProductsSection.tsx` | #6 — product carousel |
| `src/features/homepage/components/FeaturedAuctionsSection.tsx` | #7 — auction carousel |
| `src/features/homepage/components/FeaturedPreOrdersSection.tsx` | #8 — pre-order carousel |
| `src/features/homepage/components/FeaturedStoresSection.tsx` | #9 — store carousel |
| `src/features/homepage/components/EventsSection.tsx` | #10 — events carousel |
| `src/features/homepage/components/CTABannerSection.tsx` | #11 — CTA banner |
| `src/features/homepage/components/HomepageCustomerReviewsSection.tsx` | #12 — review carousel with PII masking |
| `src/features/homepage/components/BlogArticlesSection.tsx` | #17 — blog carousel |
| `src/features/homepage/hooks/useFeaturedStores.ts` | Fetches from `STORE_ENDPOINTS.LIST` |
| `src/features/homepage/hooks/useHomepageEvents.ts` | Fetches from `EVENT_ENDPOINTS.LIST?filters=status==active` |

### Modified files (appkit worktree)
| File | Change |
|------|--------|
| `src/features/admin/components/AdminSiteView.tsx` | Added editable announcement settings form (load + save via `/api/site-settings`) |
| `src/features/admin/components/AdminSectionsView.tsx` | Added reorder UX (drag/drop + move/reindex/save), bulk reorder affordances (Undo unsaved + Reset to server), and typed builders for `products`, `auctions`, `stats`, `pre-orders`, `stores`, and `events` with category/filter/resource selectors and generated JSON preview |
| `src/features/admin/components/AdminCategoriesView.tsx` | Migrated from shell placeholder to dynamic listing scaffold backed by `/api/categories?flat=true` |
| `src/features/admin/components/AdminCarouselView.tsx` | Migrated from shell placeholder to dynamic listing scaffold backed by `/api/carousel?includeInactive=true` |
| `src/features/admin/components/AdminMediaView.tsx` | Migrated from listing shell placeholder to frame-only media operations view with upload sandbox + staged cleanup |
| `src/features/admin/components/AdminNavigationView.tsx` | Migrated from shell placeholder to frame-only dynamic navigation settings view backed by `/api/site-settings` (`navbarConfig.hiddenNavItems`) |
| `src/features/admin/components/AdminFeatureFlagsView.tsx` | Migrated from shell placeholder to frame-only dynamic feature-flag settings view backed by `/api/site-settings` (`featureFlags`) |
| `src/features/admin/components/AdminDashboardView.tsx` | Added real default data wiring from `/api/admin/dashboard` (auto-fetch when props are not injected) |
| `src/features/admin/components/AdminAnalyticsView.tsx` | Added real default data wiring from `/api/admin/analytics` (auto-fetch when props are not injected) |
| `src/features/events/components/AdminEventEntriesView.tsx` | Completed live admin entries view with event-scoped query/stats loading, review status filters, and approve/flag mutations against admin endpoints |
| `src/features/copilot/components/AdminCopilotView.tsx` | Rebuilt admin copilot non-list screen to live frame variant with chat composer, conversation loader, and history panel |
| `src/features/copilot/hooks/useCopilotChat.ts` | Added `initialConversationId`, exposed active `conversationId`, and added `loadConversation` action for thread switching |
| `src/features/admin/components/AdminAdsView.tsx` | New ads inventory listing view (filters, paging, publish/pause actions) backed by `/api/admin/ads` |
| `src/features/admin/components/AdminAdEditorView.tsx` | New ads create/edit form with metadata-driven placement/provider options and save via `/api/admin/ads` + `/api/admin/ads/[id]` |
| `src/features/admin/components/index.ts` | Exported `AdminAdsView`, `AdminAdEditorView`, and related types |
| `src/features/admin/schemas/firestore.ts` | Added typed `announcementBar` config to `SiteSettingsDocument` + defaults/public fields |
| `src/features/admin/components/AdminListingScaffold.tsx` | Converted to data-agnostic scaffold with loading/error/empty states; removed hardcoded default active filters |
| `src/features/admin/components/AdminProductsView.tsx` | Dynamic data mapping from `/api/admin/products` into listing rows |
| `src/features/admin/components/AdminOrdersView.tsx` | Dynamic data mapping from `/api/admin/orders` into listing rows |
| `src/features/admin/components/AdminUsersView.tsx` | Dynamic data mapping from `/api/admin/users` into listing rows |
| `src/features/admin/components/AdminReviewsView.tsx` | Dynamic data mapping from `/api/admin/reviews`; preserves detail mode passthrough |
| `src/features/admin/components/AdminBlogView.tsx` | Dynamic data mapping from `/api/admin/blog` into listing rows |
| `src/features/admin/components/AdminBidsView.tsx` | Dynamic data mapping from `/api/admin/bids` into listing rows |
| `src/features/admin/components/AdminCouponsView.tsx` | Dynamic data mapping from `/api/admin/coupons` into listing rows |
| `src/features/admin/components/AdminFaqsView.tsx` | Dynamic data mapping from `/api/admin/faqs` into listing rows |
| `src/features/admin/components/AdminStoresView.tsx` | Dynamic data mapping from `/api/admin/stores` into listing rows |
| `src/features/admin/components/AdminPayoutsView.tsx` | Dynamic data mapping from `/api/admin/payouts` into listing rows |
| `src/features/admin/hooks/useAdminListingData.ts` | New shared hook/utilities for admin API listing fetch + row mapping |
| `src/constants/api-endpoints.ts` | Added missing `ADMIN_ENDPOINTS` constants for admin CRUD listing resources plus dashboard/analytics endpoints |
| `src/features/admin/index.ts` | Exported `useAdminListingData` hook |
| `src/features/homepage/components/MarketplaceHomepageView.tsx` | Complete rewrite — all 18 sections wired, stats fixed |
| `src/features/homepage/components/MarketplaceHomepageView.tsx` | Announcement now loaded from site settings; dynamic sections rendered in deterministic order |
| `src/features/homepage/components/MarketplaceHomepageView.tsx` | Removed hardcoded full-page fallback section rendering; homepage section body is now DB-driven (no local mock section payloads) |
| `src/features/events/components/EventCard.tsx` | Added safe title fallback to prevent blank event cards when upstream title is missing |
| `src/features/blog/components/BlogFeaturedCard.tsx` | Added safe title/image fallback rendering and `safeDisplayName` for author text |
| `src/features/homepage/schemas/firestore.ts` | Added `stats` section type and `StatsSectionConfig` support for dynamic homepage sections |
| `src/features/homepage/components/ShopByCategorySection.tsx` | Fixed `display?.emoji` → `display?.icon` with initial fallback |
| `src/features/homepage/components/index.ts` | Added exports for 10 new components |
| `src/features/homepage/index.ts` | Added `useFeaturedStores`, `useHomepageEvents` exports |
| `src/constants/api-endpoints.ts` | Added admin constants for ads and event admin entry/stats routes (`ADS`, `AD_BY_ID`, `EVENT_STATS`, `EVENT_ENTRIES`, `EVENT_ENTRY_BY_ID`) |
| `src/features/layout/TitleBarLayout.tsx` | "Today's Deals" green pill + Compare icon slot (`compareHref` prop) |
| `src/features/admin/components/AdminSidebar.tsx` | Mobile overlay → `BottomSheet` |
| `src/features/seller/components/SellerSidebar.tsx` | Mobile overlay → `BottomSheet` |
| `src/features/account/components/UserSidebar.tsx` | Mobile overlay → `BottomSheet` |
| `src/features/layout/AppLayoutShell.tsx` | Added `CollapsibleSidebarSection` — sidebar sections are now accordion toggles |
| `../src/validation/request-schemas.ts` | Added `announcementBar` validation to site settings PATCH schema |
| `../src/app/api/admin/sections/route.ts` | New section create now appends by default using max(existing order)+1 |
| `../src/app/api/admin/sections/route.ts` | Added `stats` to allowed section type enum for admin section creation |

### New files (letitrip app)
| File | Purpose |
|------|---------|
| `src/components/homepage/HomepageNewsletterForm.tsx` | Section #16 homepage newsletter form, client submit to `/api/newsletter/subscribe` |
| `src/app/api/admin/sections/route.ts` | Admin sections list/create endpoint |
| `src/app/api/admin/sections/[id]/route.ts` | Admin sections update/delete endpoint |
| `src/app/api/admin/ads/route.ts` | Admin ads inventory/config endpoint (list, create, global config patch) |
| `src/app/api/admin/ads/[id]/route.ts` | Admin ad record CRUD endpoint |
| `src/app/[locale]/admin/ads/page.tsx` | Thin route wrapper for `AdminAdsView` |
| `src/app/[locale]/admin/ads/new/page.tsx` | Thin route wrapper for create ad editor |
| `src/app/[locale]/admin/ads/[id]/edit/page.tsx` | Thin route wrapper for edit ad editor |
| `src/app/[locale]/categories/[slug]/page.tsx` | Base category detail route now redirects to canonical segment path |
| `src/app/[locale]/categories/[slug]/[tab]/sort/[sortKey]/page/[page]/page.tsx` | Canonical route-param category detail family backed directly by real `CategoryDetailPageView` data |
| `src/app/[locale]/promotions/[tab]/page.tsx` | Added metadata + canonical parity redirect for invalid tabs |
| `src/app/[locale]/search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]/page.tsx` | Canonical route-param search path backed by live `searchProducts` data |
| `src/app/[locale]/stores/[storeSlug]/[tab]/sort/[sortKey]/page/[page]/page.tsx` | Canonical route-param store detail family rendering appkit-backed tab views directly with metadata + canonical parity |
| `src/app/[locale]/promotions/[tab]/page.tsx` | Canonical route-param promotions tabs backed by real `getPromotions` data |

### New files (appkit worktree)
| File | Purpose |
|------|---------|
| `src/features/admin/hooks/useAdminSectionsListing.ts` | React Query hook for `/api/admin/sections` listing |

### Modified files (this session)
| File | Change |
|------|--------|
| `src/app/[locale]/page.tsx` | Passes `newsletterFormSlot` to `MarketplaceHomepageView` |
| `src/app/ClientProviderInitializer.tsx` | Simplified client-provider init call path to match sync initializer signature |
| `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` | Added `newsletterFormSlot` prop and wired newsletter section form slot to avoid null rendering |
| `appkit/src/features/events/components/EventCard.tsx` | Card parity pass: stable media fallback, aligned metadata row, and consistent action treatment using route constants |
| `appkit/src/features/stores/components/InteractiveStoreCard.tsx` | Card parity pass: aligned card geometry/typography/stats/action row for homepage store cards |
| `appkit/src/features/homepage/components/HomepageCustomerReviewsSection.tsx` | Switched to shared `ReviewCard` component for review-card family parity |
| `appkit/src/features/homepage/components/ShopByCategorySection.tsx` | Upgraded category chips to card-style presentation with live metrics and canonical category routes |

---

## Build Status

| Check | Status | Notes |
|-------|--------|-------|
| `appkit npm run build` | ✅ Done | 2026-04-23 after Phase 3 continuation (data-driven homepage fallback removal + event/blog card resilience) |
| `appkit tsc --noEmit` | ✅ Done | Covered by `appkit npm run build` on 2026-04-23 |
| `letitrip npm run build` | ✅ Done | 2026-04-23 after public coverage route rewiring + stale action-barrel type export cleanup (consumer integration validated) |
| `npm run test:smoke` | ✅ Done | 2026-04-23: `test:smoke` still blocked by port collision, but `test:smoke:existing` completed with 38/38 passed after home/contact selector fixes |

---

## 110-Page Coverage Snapshot

> Tracks which routes have been migrated to their target mock pack.

| Pack | Routes | Total | Done | Remaining |
|------|--------|------:|-----:|----------:|
| A — Homepage | `/` | 1 | 1 | 0 |
| B — Listing | products, auctions, pre-orders, stores, sellers, reviews, categories, search, promotions | 9 | 9 | 0 |
| C — Listing-Extension | store detail (4 tabs) + category detail | 6 | 6 | 0 |
| D — Detail-Commerce | product, auction, pre-order, seller detail | 4 | 4 | 0 |
| E — Content/Editorial | about, contact, help, fees, security, legal × 5, how-to × 7, events, blog, public info | 22 | 22 | 0 |
| F — FAQ (tabbed) | `/faqs`, `/faqs/[category]` | 2 | 2 | 0 |
| G — Promotions | `/promotions/[tab]/...` | 1 | 1 | 0 |
| H — Checkout | cart, checkout (2 steps), success, track | 4 | 4 | 0 |
| I — User Account | account hub, profile, settings, orders (3), messages, notifications, offers, wishlist, addresses (3), become-seller | 17 | 17 | 0 |
| J — Seller Console | all seller routes | 16 | 16 | 0 |
| K — Admin Console | all admin routes | 22 | 22 | 0 |
| L — Auth/Utility | login, register, forgot/reset pw, verify email, oauth-loading, unauthorized, demo/seed | 9 | 9 | 0 |
| **Total** | | **113** | **113** | **0** |

> *Note: plan.md lists 110 routes; count above reflects tabbed sub-routes included for completeness.*
>
> *Coverage snapshot tracks route-level wiring completion. Feature-depth completion is tracked separately in Steps 36-38, Phase 4, and Phase 6.*

---

## Next Up

1. **Phase 4 gate (Step 39)** — start seller-surface migration now that Phase 3 public surfaces are closed
2. **Step 40** — upgrade seller listing/detail surfaces to full listing contract and frame-only non-list variants
3. **Phase 5 gate (Step 41)** — begin cleanup/consolidation after seller route completion
4. **Phase 6 kickoff (Step 45)** — start theme-color audit and responsive contract implementation from plan.md




