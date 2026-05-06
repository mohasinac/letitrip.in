# newchange.md — Session Log & Deferred Items

> **Append new session entries below the DEFERRED section, newest first.**
> After completing a task that defers or skips any spec component, add it to DEFERRED below AND log the session entry.

---

## ⚠️ DEFERRED / SKIPPED ITEMS — READ BEFORE EACH SESSION

> These are known gaps from previous sessions. Resolve before marking the parent task fully closed, or create a new explicit task.

| Date | Task | What was deferred / skipped | Status | Fix target |
|------|------|-----------------------------|--------|------------|
| 2026-05-07 | P10 Part A | Per-collection API endpoints (`/api/demo/seed/[collection]/route.ts`) not built — deemed over-engineering. Monolithic route handles per-collection calls correctly. | Intentionally skipped — no plan to build unless needed | — |
| 2026-05-07 | P20 | Carousel section config cast `as unknown as SectionConfig` to silence TS — underlying type mismatch not fixed | ⚠️ Tech debt | CF1 (Session 65) must fix carousel schema to resolve |
| 2026-05-07 | J7/J9 | Notes said "remaining: P5 seed data" — P5 was superseded. Notes updated to "resolved by P16" | ✅ Notes fixed — no code change needed | — |
| 2026-05-07 | P10 Part B | Full SeedPanel UI redesign (collapsible groups, per-collection API calls, progress bar) was never built in Session 63 — task was silently marked ✅ | ✅ Fixed 2026-05-07 | — |

---

## SESSION LOG (newest first)

---

# Change Log — Session 2026-05-07 (Latest)

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
