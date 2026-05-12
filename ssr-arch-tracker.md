# SSR Rearchitecture Tracker — appkit × letitrip.in

> **Approved plan**: `C:\Users\mohsi\.claude\plans\cant-we-do-it-cosmic-flamingo.md`
> **Last updated**: 2026-05-12 — S1–S4 verification sweep (read every ✅ source file). All ✅ items still hold. tsc clean in both repos; audit-violations/verify-entries/verify-css-build all pass. SSR-in-appkit audit down from 31 → 22 violations. Stale items reclassified: S1 cli-move premise stale (no firebase-admin in withFeatures); S1 eslint.config rewrite would delete 280 lines of lir/* coverage (recommend additive spread instead); S4 Functions migration is multi-session scope. Real remaining work: bundles/grouped/sublisting data layers (S3), BrandDetailPageView type alignment (S3), checkout+payments server layers (S4), Functions handlers (S4 batched).
> **Status legend**: ⏳ pending · 🔄 in progress · ✅ done · ❌ blocked · ⚠️ done-but-verify

---

## 🧭 Guiding Principle — Keep SSR Code in appkit Whenever Possible

When wiring SSR for a feature, the **default home for the code is appkit**, not letitrip.in. Only leave a thin shim in letitrip.in when the framework forces it (route file location, edge runtime entry, Next.js conventions).

### What belongs in appkit (`_internal/server/features/<feature>/`)

- **Data layers** — `getXForDetail`, `listX`, `getXInitial`, etc. with `React.cache` dedup
- **Server actions** — `"use server"` mutations, validation, repository calls
- **Response transforms / adapters** — e.g. `OrderDocument → Order` mappers (avoid one-off `_transform.ts` files inside `src/app/api/...`; lift into `_internal/server/features/<feature>/adapters.ts` so API routes + server components + SSR pages share one source of truth)
- **OG image renderers** — keep the `ImageResponse` JSX, font loading, layout, theming as a reusable function in `_internal/server/features/<feature>/og.tsx` (e.g. `renderProductOgImage(doc)`). The letitrip.in `opengraph-image.tsx` file becomes a 3-line shim: fetch doc via appkit data layer → call appkit renderer → return.
- **Metadata builders** — `buildXMetadata(doc)` → `Metadata` object, used by `generateMetadata()` in the route file
- **Sitemap entries** — `listSitemapX()` returning `{ url, lastModified, changeFrequency, priority }[]` so `sitemap.ts` is a thin aggregator
- **Robots / manifest helpers** — if they need data, expose as appkit server functions
- **Schemas / Zod validators / types** — `_internal/shared/features/<feature>/` so both client and server consume the same shapes
- **Feature constants** — page sizes, limits, defaults (`_internal/shared/features/<feature>/config.ts`)

### What MUST stay in letitrip.in (framework-bound only)

- `src/app/.../page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts` files — Next.js requires these at specific paths. **They should be thin shims** (≤30 lines typical) that import from appkit and pass through.
- API route handlers that wire request/response to appkit server functions
- `middleware.ts` / `proxy.ts` (Next.js 16+) — framework convention

### Red flags during this rearchitecture

- A `_transform.ts` / `_adapter.ts` next to an API route that another page would also need → lift to appkit
- An `opengraph-image.tsx` with >40 lines of layout JSX → extract renderer to appkit
- A `page.tsx` that does any non-trivial Firestore querying or data shaping → move to `_internal/server/features/<feature>/data.ts`
- Duplicate fetch logic in `page.tsx` + an API route → both should call the same appkit function

### Action item for current session

- [x] Backfill: `src/app/api/user/orders/_transform.ts` lifted into `_internal/server/features/orders/adapters.ts`; `_transform.ts` is now a 1-line re-export shim; API route responses fixed (OrderDocument→Order shape + correct OrderListResponse)
- [x] Backfill: all 9 `opengraph-image.tsx` files (products, auctions, pre-orders, stores, brands, blog, events, sublisting-categories, profile) reduced to ≤30-line shims; renderers extracted to `_internal/server/features/<feature>/og.tsx`; exported from `server-entry.ts` + `index.ts`

---

## 🧱 Encapsulation + Override Contract — appkit as Building Blocks

The goal is **maximum encapsulation by default, full customizability on demand**. A consumer should be able to drop in an appkit feature and get a complete working surface (route shim → data → render → mutate) with one or two lines of glue code. At the same time, every layer must expose a documented override seam so consumers can swap, decorate, or replace any piece without forking appkit.

### Layered defaults (the "drop-in" path)

Each feature in `_internal/server/features/<feature>/` ships a **full vertical**:

| Layer | Default export | Consumer override seam |
|-------|----------------|------------------------|
| Data fetch | `getXForDetail(slug)` | Pass own fetcher to renderer; or call repository directly and pass `initialX` prop |
| Adapter / transform | `toClientX(doc)` | Re-export and wrap; or pass `transform` option |
| Metadata | `buildXMetadata(doc, opts?)` | Pass partial `Metadata` override; or compose with `mergeMetadata()` |
| OG renderer | `renderXOgImage(doc, opts?)` | Pass `theme`, `layout`, `slots`, or replace with own `ImageResponse` |
| Sitemap entry | `listSitemapX()` | Filter/map result, or skip and write own |
| Server action | `xAction(input)` | Wrap with own validation/auth; or call repository directly |
| View / component | `<XDetailView initialX={…}>` | All sub-slots accept `renderHeader`, `renderActions`, `renderFooter`, `slot*` props |
| Labels / copy | `DEFAULT_X_LABELS` via `LabelsProvider` | Provide partial override map at app level |
| Tokens / theming | `siteSettings.theme` CSS vars | Admin UI writes; or set CSS vars manually on any subtree |

### Override hierarchy (from least to most invasive)

1. **Config / tokens** — `siteSettings.theme`, `appkit.config.js`, `LabelsProvider` partial map. No code changes. Always preferred.
2. **Options object** — `renderXOgImage(doc, { theme, headline, accentColor, layout: "compact" })`, `buildXMetadata(doc, { titleSuffix, ogImagePath })`. Named, type-checked, additive.
3. **Render-prop slots** — `<XDetailView renderActions={(ctx) => <MyActions/>} renderFooter={…}>`. Consumer owns one region, default handles the rest.
4. **Adapter wrap** — `const myToClient = (doc) => decorate(toClientX(doc))`. Compose appkit's transform with your own.
5. **Replace the call** — call repository or another appkit primitive directly; skip the default helper entirely. The route shim grows by a few lines but appkit's lower-level pieces (repositories, schemas, ID generators, ImageResponse helpers) are still in use.
6. **Fork via patch** — only when the override seam doesn't exist *yet*. File a tracker entry; ship the override seam in appkit so the next consumer doesn't need to fork.

### Rules for appkit authors

- **Never hardcode consumer choices.** Brand name, locale, currency, route paths, copy strings — all flow through `appkit.config.js`, `ROUTES`, `LabelsProvider`, or function options. No string literal `"LetItRip"` in a renderer.
- **Default arguments must be ergonomic.** A consumer who passes nothing should get a sensible result. A consumer who passes everything should get full control.
- **All public functions take an optional `opts` object** as the last parameter. Even if it's empty today — the slot is reserved.
- **Render functions are pure JSX/data in, JSX/data out.** No global state, no env reads. Anything environmental comes through `opts` or `JobContext`-style ambient injection.
- **Slots over flags.** Prefer `renderActions={…}` over `showActions={false}` + a flag explosion. Render props compose; booleans don't.
- **Repositories stay reusable.** A consumer who wants to replace `getXForDetail` should still be able to call `xRepository.findBySlug()` from their own server function. Don't gate primitives behind facade functions.
- **No private re-exports.** If consumers need it to override behavior, it's part of the public API and lives in `server-entry.ts` / `client-entry.ts`.

### Rules for consumers (letitrip.in)

- **Reach for the smallest override first.** Need a different OG headline? Pass `opts.headline`, don't copy-paste the renderer.
- **Wrap, don't replace, when adding behavior.** `const ourAction = async (input) => { await audit(input); return appkitAction(input); }` — keeps appkit on the upgrade path.
- **If you find yourself copying >10 lines from appkit into a consumer file**, stop and file a seam request in the tracker. The override is missing.
- **Route files stay thin shims** (CC-11). Customization happens through the override hierarchy above, not by inlining logic in `page.tsx` / `opengraph-image.tsx`.

### Verification

- [ ] Every `_internal/server/features/<feature>/` directory has: `data.ts`, `adapters.ts`, `actions.ts`, `metadata.ts`, `og.tsx` (where applicable), `index.ts` barrel
- [ ] Every public function accepts a final `opts?: XOptions` parameter (even if empty today)
- [ ] Every view component accepts at least one `renderXxx` slot prop or a clear `children` extension point
- [ ] No `"LetItRip"`, `"letitrip.in"`, currency symbols, or hardcoded route strings inside `_internal/`
- [ ] `scripts/audit-ssr-in-appkit.mjs` exits 0 (consumers shouldn't need to inline what appkit could expose)

---

## Summary

| Session | Scope | Status |
|---------|-------|--------|
| S1 | Foundation — entries, tokens, config helpers, CLI, i18n contract | ✅ Done |
| S2 | Reference feature (products) + SEO data layer | ✅ Done |
| S3 | Catalog & Listings + ListingScaffold + DetailScaffold | 🔄 In progress — data layers done; consumer wiring pending |
| S4 | Transactional core + functions migration batch 1 | ⚠️ Server layers done (cart/orders/promotions); consumer wiring + Functions migration pending |
| S5 | Per-user surfaces + Homepage + Search | ⚠️ Server layers done (reviews/wishlist/history/homepage); consumer wiring + Functions migration pending |
| S6 | Seller + Admin + Content + scaffolds completion | ⏳ Pending |
| S7 | Cross-cutting + lift-from-letitrip + Cleanup & Verify | ⏳ Pending |

---

## S1 — Foundation (no feature migration)

> Goal: all structural scaffolding in place. **No features moved yet.** Every S1 gate must pass against the existing un-migrated app.

### Directory & Package Structure

- [x] Create `appkit/src/_internal/client/`, `_internal/server/`, `_internal/shared/` skeleton
- [x] Create `appkit/src/client-entry.ts` (S1 proxy → `./index` + new `_internal/` symbols)
- [x] Create `appkit/src/server-entry.ts` (S1 proxy → `./index` + new `_internal/` symbols)
- [x] Update `appkit/package.json` — conditional `exports` map (`react-server`, `browser`, `import`, `default`)
- [x] Update `appkit/package.json` — `sideEffects: ["**/*.css"]`
- [x] Update `appkit/package.json` — `bin` + `files` for 9 CLI scripts
- [x] Delete `appkit/scripts/test-regex.mjs`

### TypeScript Project References

- [x] `appkit/tsconfig.client.json` — `composite: true`, includes `_internal/client/**`
- [x] `appkit/tsconfig.server.json` — `composite: true`, includes `_internal/server/**`
- [x] `appkit/tsconfig.shared.json` — `composite: true`, includes `_internal/shared/**`
- [x] `appkit/tsconfig.base.json` — consumer-facing base (`ES2020`, `moduleResolution:"bundler"`, `strict`)

### Token Consolidation

- [x] Create `_internal/shared/tokens/index.ts` — `SEMANTIC_COLORS`, `SEMANTIC_COLORS_DARK`, `SEMANTIC_RADIUS`, `SEMANTIC_SHADOWS`, `SEMANTIC_Z_INDEX`, `MOTION_TOKENS`, `BREAKPOINTS`, `PLATFORM_LIMITS`, `Responsive<T>`
- [x] Dark-mode surface + text tokens (`surface`, `surfaceMuted`, `textPrimary`, `border`, `link`, etc.)
- [x] Create `_internal/shared/constants/index.ts` (stub; feature constants added per-feature in S2+)
- [x] Create `_internal/shared/config/schema.ts` — `AppkitConfig` interface

### CSS Variable Bridge (admin-controlled theming)

- [x] Add `theme?: { primary, secondary, accent, primaryDark, secondaryDark, accentDark }` to `SiteSettingsDocument`
- [x] `LayoutShellClient` injects `:root { --appkit-color-* }` + `.dark { --appkit-color-* }` from `siteSettings.theme`
- [x] `layout.tsx` passes `siteTheme` prop through

### i18n Labels Contract

- [x] Create `_internal/client/i18n/LabelsProvider.tsx` — `LabelsProvider`, `useLabels`, `AppkitLabelSet`
- [x] Export from `client-entry.ts`

### Config Helpers (`appkit/src/configs/`)

- [x] `configs/next.ts` — `defineNextConfig(override)` with firebase-admin externals baked in
- [x] `configs/postcss.ts` — `definePostcssConfig(override)` with autoprefixer
- [x] `configs/tailwind.ts` — `defineTailwindConfig(override)` with `darkMode:"class"` + full semantic color CSS-var palette
- [x] `configs/eslint.ts` — `defineEslintConfig(override)` with route-string lint rule
- [x] `appkit/package.json` — `./configs` conditional export

### ESLint Boundary Rules (appkit-internal)

- [x] `appkit/.eslintrc.json` — `no-restricted-imports` for `_internal/client/**` → no firebase-admin, no `_internal/server`
- [x] `appkit/.eslintrc.json` — `_internal/server/**` → no `_internal/client`
- [x] `appkit/.eslintrc.json` — `_internal/shared/**` → no firebase-admin, no react, no `_internal/client`, no `_internal/server`

### CLI Scripts

- [x] `scripts/audit-violations.mjs` — boundary violation scanner
- [x] `scripts/verify-entries.mjs` — client entry firebase-admin check
- [x] `scripts/verify-css-build.mjs` — compiled CSS class completeness check
- [x] `scripts/smoke-ssr.mjs` — route smoke against local `next start`
- [x] `scripts/smoke-bundle.mjs` — bundle forbidden-token grep
- [x] `scripts/smoke-theme.mjs` — Playwright theme repaint verification
- [x] `scripts/init-config.mjs` — starter `appkit.config.js` generator
- [x] `scripts/labels-extract.mjs` — walks dist to extract `DEFAULT_*_LABELS`
- [x] `letitrip.in/appkit.config.js` generated

### S1 Deferred Items (complete before S2 starts)

- [ ] Move `appkit/src/cli/index.ts` → `_internal/server/cli/` and trim firebase-admin plumbing from `withFeatures` — **PREMISE STALE (verified 2026-05-12)**: file has zero firebase-admin imports; `withFeatures` only manages `transpilePackages`. No `./cli` export in `package.json` and zero consumer imports of `@mohasinac/appkit/cli` outside docs. Move would be cosmetic. Recommend reclassifying as ✅ (no work needed) or rescoping to "delete the file if truly unused after grep confirms".
- [x] Rewrite `letitrip.in/next.config.js` to use `defineNextConfig()` — IgnorePlugin also moved into helper
- [x] Rewrite `letitrip.in/postcss.config.js` to use `definePostcssConfig()`
- [ ] Rewrite `letitrip.in/tailwind.config.js` to use `defineTailwindConfig()` — deferred to S7; existing config already has `darkMode:"class"` + no appkit scan; safelist cleanup is a post-migration task
- [ ] Rewrite `letitrip.in/eslint.config.js` to use `defineEslintConfig()` — **VERIFIED 2026-05-12**: actual file is `eslint.config.mjs` (315 lines of lir/* rules + per-package overrides). Wholesale replacement with `defineEslintConfig()` (which only adds 1 `no-restricted-syntax` warn) would delete project lint coverage. Correct path: spread `defineEslintConfig()` into the existing config (additive). Quick win when scoped that way.
- [x] `letitrip.in/tsconfig.json` → `extends "@mohasinac/appkit/tsconfig.base.json"`; fixed `tsconfig.base.json` (`jsx:"react-jsx"`, removed bad path aliases)

### S1 Success Gates

- [x] `npx tsc --noEmit` — 0 errors in `appkit/` (re-verified 2026-05-12)
- [x] `npx tsc --noEmit` — 0 errors in `letitrip.in/` (re-verified 2026-05-12)
- [x] `node scripts/audit-violations.mjs` — 0 violations (re-verified 2026-05-12)
- [x] `node scripts/verify-entries.mjs` — client entry firebase-admin free (re-verified 2026-05-12)
- [x] `node scripts/verify-css-build.mjs` — OK (re-verified 2026-05-12)

---

## S2 — Reference Feature: `products` + SEO Data Layer

> Products is the template all other features follow. End-to-end migration with full verification.

### New Files (appkit)

- [x] `_internal/shared/features/products/config.ts` — `PRODUCTS_PAGE_SIZE`, `PRODUCTS_FEATURED_LIMIT`, `PRODUCTS_RELATED_LIMIT`, `PRODUCTS_SITEMAP_LIMIT`
- [x] `_internal/server/features/products/data.ts` — `getProductForDetail` (React.cache), `getReviewsForProduct`, `listSitemapProducts`
- [x] `_internal/server/features/products/index.ts` — barrel
- [x] Export `getProductForDetail`, `getReviewsForProduct`, `listSitemapProducts` from `server-entry.ts`
- [x] `appkit/package.json` `"types"` condition → `dist/server-entry.d.ts` (superset — fixes TS resolution for new symbols)
- [ ] `_internal/shared/features/products/types.ts` — `ProductDetailInitial`, `ProductInput` (deferred; `ProductDocument` already serves)
- [ ] `_internal/shared/features/products/schema.ts` — Zod schema (deferred; existing schema sufficient)
- [ ] `_internal/server/features/products/repository.ts` — move from old path (deferred to full CC-1 pass)
- [ ] `_internal/server/features/products/actions.ts` — `"use server"` mutations (deferred; existing actions work)
- [ ] `_internal/client/features/products/` — presentational view split (deferred; view is already server-component)

### Consumer Changes (letitrip.in)

- [x] `src/app/[locale]/products/[slug]/page.tsx` — uses `getProductForDetail()` + React.cache dedup; passes `initialProduct` to `ProductDetailPageView` (skips internal re-fetch)
- [x] `src/app/[locale]/products/[slug]/opengraph-image.tsx` — `ImageResponse` 1200×630 via `getProductForDetail()`; edge runtime; product image bg + title + price
- [x] `appkit/src/features/products/components/ProductDetailPageView.tsx` — `initialProduct?` prop added; skips internal repo call when provided
- [ ] `src/app/[locale]/admin/products/page.tsx` — deferred
- [ ] `src/app/[locale]/admin/products/[id]/page.tsx` — deferred
- [ ] `src/app/sitemap.ts` — already SSR via `getAdminDb()` directly; `listSitemapProducts()` migration deferred (no regression)
- [ ] `src/app/[locale]/robots.ts` / `manifest.ts` — not found; create if needed (deferred)
- [ ] `public/auth.html` / `public/error.html` — keep (static fallback pages, intentional)

### S2 Verification

- [x] `npx tsc --noEmit` clean in both repos (re-verified 2026-05-12)
- [x] `node scripts/audit-violations.mjs` exits 0 (re-verified 2026-05-12)
- [x] `node scripts/verify-entries.mjs` exits 0 (re-verified 2026-05-12)
- [x] `node scripts/verify-css-build.mjs` OK (re-verified 2026-05-12)
- [x] `src/app/[locale]/products/[slug]/page.tsx` confirmed wires `initialProduct={product}` from `getProductForDetail()` (React.cache shared with generateMetadata)
- [x] `src/app/[locale]/products/[slug]/opengraph-image.tsx` confirmed 23-line shim → `renderProductOgImage()` from appkit
- [ ] `curl http://localhost:3000/en/products/<slug> | grep <product-title>` — title in initial HTML (manual, requires running server)
- [ ] Open product page with JS disabled — full page renders (manual)
- [ ] Per-product OG image: `curl -sI http://localhost:3000/en/products/<slug>/opengraph-image` → 200 image/png

---

## S3 — Catalog & Listings + Scaffolds

> Migrate: categories, brands, auctions, pre-orders, bundles, grouped, sublisting, stores.
> Extract: `<ListingScaffold>`, `<DetailScaffold>`.

### Features to Migrate

- [x] `categories` — `_internal/server/features/categories/data.ts` done (`getCategoryForDetail`, `listRootCategories`, `listFeaturedCategories`, `listMenuCategories`, `getCategoryTree`, `listSitemapCategories`); nav uses static `MAIN_NAV_ITEMS` (no client fetch to replace); CC-8 layout wiring deferred to S6
- [x] `brands` — `_internal/server/features/brands/data.ts` (`getBrandForDetail`) + actions done; `BrandDetailPageView.initialBrand?` deferred — view calls `categoriesRepository.getCategoryBySlug` (CategoryDocument), `getBrandForDetail` returns BrandDocument; type alignment needed before prop can be added
- [x] `auctions` — `_internal/server/features/auctions/data.ts` + `AuctionDetailPageView.initialAuction?` prop + `auctions/[id]/page.tsx` wired ✅
- [x] `pre-orders` — `_internal/server/features/pre-orders/data.ts` + `PreOrderDetailPageView.initialPreOrder?` prop + `pre-orders/[id]/page.tsx` wired ✅
- [ ] `bundles` — `server/data: getBundle(slug)` with items pre-resolved
- [ ] `grouped` — `server/data: getGroupedListing(slug)`
- [ ] `sublisting` — `server/data: getSublisting(slug)`
- [x] `stores` — `_internal/server/features/stores/data.ts` done (`getStoreForDetail`, `listStoreProductsInitial`, `listStoreAuctionsInitial`, `listStorePreOrdersInitial`, `listSitemapStores`); `StoreDetailLayoutView` already SSR via `getStoreBySlug` (React.cache); `StoreProductsPageView` already server component; `stores/[storeSlug]/layout.tsx` has `generateMetadata` ✅
- [x] `blog` — `_internal/server/features/blog/data.ts` (`getBlogPostForDetail`) + actions done; `blog/[slug]/page.tsx` already SSR-wired; `blog/page.tsx` already SSR (static metadata + server component)
- [x] `events` — `_internal/server/features/events/data.ts` (`getEventForDetail`) + actions done; `events/[id]/page.tsx` already SSR-wired (async server component with `Promise.all` fetch)

### Consumer page: pass initialData to views (stop double-fetch)

- [x] `AuctionDetailPageView` — `initialAuction?` prop added; `auctions/[id]/page.tsx` passes fetched doc ✅
- [x] `PreOrderDetailPageView` — `initialPreOrder?` prop added; `pre-orders/[id]/page.tsx` passes fetched doc ✅
- [ ] `BrandDetailPageView` — `initialBrand?` deferred; type mismatch (view uses CategoryDocument via `categoriesRepository`, but `getBrandForDetail` returns BrandDocument from `brandsRepository`)

### New Scaffolds (appkit)

- [ ] `_internal/client/scaffolds/ListingScaffold.tsx` — responsive sticky-rail filters + grid + toolbar (deferred to S6)
- [ ] `_internal/client/scaffolds/DetailScaffold.tsx` — sticky purchase rail on `lg+`, inline below (deferred to S6)

### Per-feature opengraph-image.tsx

- [x] `auctions/[id]/opengraph-image.tsx` — done
- [x] `pre-orders/[id]/opengraph-image.tsx` — done
- [x] `stores/[storeSlug]/opengraph-image.tsx` — done
- [x] `brands/[slug]/opengraph-image.tsx` — done
- [x] `blog/[slug]/opengraph-image.tsx` — done (green accent, cover image bg, excerpt + author)
- [x] `events/[id]/opengraph-image.tsx` — done (purple accent, coverImageUrl bg, type badge + date)
- [x] `sublisting-categories/[slug]/opengraph-image.tsx` — done (amber accent, cover image, product count)
- [x] `profile/[userId]/opengraph-image.tsx` — done (teal accent, avatar circle, role badge, private-profile guard)

### S3 Verification

- [x] All 9 OG renderers verified as ≤41-line shims importing `renderXxxOgImage` from appkit (auctions/pre-orders/products/stores/brands/blog/events/sublisting-categories/profile) — re-verified 2026-05-12
- [x] auctions/[id], pre-orders/[id], products/[slug] page.tsx all pass `initialAuction/initialPreOrder/initialProduct` to view (React.cache dedups generateMetadata + page render) — re-verified 2026-05-12
- [x] brands/[slug]/page.tsx confirmed NOT yet wiring `initialBrand` (still `<BrandDetailPageView slug={slug} />`) — type mismatch deferred remains accurate
- [x] SSR-in-appkit audit: 22 violations remaining (down from baseline 31). False positives in audit script: OG renderers DO import from appkit but resolve via `react-server` condition to server-entry, not direct `/server` subpath; `_transform.ts` is now a 1-line re-export shim but audit script flags any file at that path. Real residual: sitemap/manifest/robots/root-OG (S2 deferred) + 4 hardcoded "LetItRip" strings inside `_internal/` (config files + blog/actions.ts:18) — should pipe through `appkit.config.js`/opts
- [ ] Listing toolbars (filter, sort, pagination) function without regression — manual browser test required
- [ ] Viewport sweep xs → 2xl on every migrated page — manual
- [ ] Dark mode toggle — all migrated pages repaint via CSS variables — manual

---

## S4 — Transactional Core + Functions Migration Batch 1

> Migrate: cart, checkout, payments, orders, promotions.
> Functions: promotions, onOrderCreate, onOrderStatusChange, auctionSettlement, autoPayoutEligibility, couponExpiry, offerExpiry.

### Features to Migrate (server layers ✅ — consumer wiring ⏳)

- [x] `cart` — `_internal/server/features/cart/` service+actions done (upsertCartItem, mergeGuestItems, clearCart, removeFromCart); consumer API routes wiring pending
- [ ] `checkout` — `server/actions: createOrder, attachPayment`; Razorpay webhook route preserved
- [ ] `payments` — `server/actions: createPaymentIntent`; `/api/payments/webhook` preserved
- [x] `orders` — `_internal/server/features/orders/` data+service+actions done (getOrder, listOrdersForBuyer, listOrdersForSeller, updateOrderStatus, cancelOrder, requestReturn); API routes fixed: `src/app/api/user/orders/_transform.ts` (shared adapter), `[id]/route.ts` now maps OrderDocument→Order, list `route.ts` now returns correct OrderListResponse shape (items: Order[])
- [x] `promotions` — `_internal/server/features/promotions/` data+service+actions done (getCouponByCode, validateCoupon, createCoupon, applyCouponToOrder); consumer pages pending

### Functions Migration

- [ ] `_internal/server/jobs/runtime/types.ts` — `CallableHandler`, `FirestoreTriggerHandler`, `ScheduleHandler`, `JobContext`
- [ ] `_internal/server/jobs/runtime/adapters/firebase.ts` — `bindToFirebase(handlers)`
- [ ] `_internal/server/jobs/handlers/promotions.ts`
- [ ] `_internal/server/jobs/handlers/onOrderCreate.ts`
- [ ] `_internal/server/jobs/handlers/onOrderStatusChange.ts`
- [ ] `_internal/server/jobs/handlers/auctionSettlement.ts`
- [ ] `_internal/server/jobs/handlers/autoPayoutEligibility.ts`
- [ ] `_internal/server/jobs/handlers/couponExpiry.ts`
- [ ] `_internal/server/jobs/handlers/offerExpiry.ts`
- [ ] `firebase deploy --only functions --dry-run` — same function names, same triggers

### S4 Verification

- [x] cart/orders/promotions feature dirs verified (data + actions + service + index, plus `orders/adapters.ts` with `orderDocumentToOrder` mapping all OrderDocument fields → Order shape) — re-verified 2026-05-12
- [x] `src/app/api/user/orders/_transform.ts` confirmed as 1-line re-export of `orderDocumentToOrder` from appkit
- [x] `src/app/api/user/orders/[id]/route.ts` + `route.ts` (list) confirmed mapping via `orderDocumentToOrder` and returning correct OrderListResponse shape `{ items, total, page, perPage, totalPages }`
- [x] server-entry.ts exports verified for cart (getCartForUser, addToCartAction, removeFromCartAction, clearCartAction, mergeGuestCartAction, CART_MAX_ITEMS, CART_GUEST_STORAGE_KEY), orders (getOrderForDetail, getOrdersForBuyer, getRecentOrdersForBuyer, createOrderAction, cancelOrderAction, requestReturnAction, updateOrderStatusAction, ORDERS_PAGE_SIZE, orderDocumentToOrder), promotions (getCouponByCode, applyCouponAction, createCouponAction, updateCouponAction, deactivateCouponAction)
- [ ] Razorpay test payment cycle end-to-end — manual; checkout server layer still pending
- [ ] Cart persists across devices when logged in — manual
- [ ] Per-user coupon limit enforced at checkout — manual; depends on checkout server layer
- [ ] All order list pages SSR rendered — manual; user/orders/page.tsx still client

---

## S5 — Per-User Surfaces + Homepage + Search

> Migrate: reviews, wishlist, history, homepage, search.
> Functions: onReviewWrite, onBidPlaced, cartPrune, notificationPrune, dailyDataCleanup, countersReconcile, cleanupRtdbEvents.

### Features to Migrate (server layers ✅ — consumer wiring ⏳)

- [x] `reviews` — `_internal/server/features/reviews/` data+actions done (getReviewsForProduct, getReviewsForStore, createReview, replyToReview, deleteReview, markReviewHelpful); consumer pages pending
- [x] `wishlist` — `_internal/server/features/wishlist/` data+actions done; `[locale]/wishlist/page.tsx` appropriately stays `"use client"` — depends on localStorage (guest) + auth session; no SSR wiring needed
- [x] `history` — `_internal/server/features/history/` data+actions done; `[locale]/user/history/page.tsx` appropriately stays `"use client"` — localStorage + auth merge is inherently client-side; no SSR wiring needed
- [x] `homepage` — `_internal/server/features/homepage/` data done (getHomepageInitial, getHomepageSections, getHeroCarouselSlides); `[locale]/page.tsx` ALREADY SSR — `MarketplaceHomepageView` is an async server component that handles all data fetching internally ✅
- [x] `search` — `_internal/server/features/search/` data+actions done; `[locale]/search/page.tsx` ALREADY SSR — pure redirect server component (no data fetch needed) ✅

### Functions Migration

- [ ] `_internal/server/jobs/handlers/onReviewWrite.ts`
- [ ] `_internal/server/jobs/handlers/onBidPlaced.ts`
- [ ] `_internal/server/jobs/handlers/cartPrune.ts`
- [ ] `_internal/server/jobs/handlers/notificationPrune.ts`
- [ ] `_internal/server/jobs/handlers/dailyDataCleanup.ts`
- [ ] `_internal/server/jobs/handlers/countersReconcile.ts`
- [ ] `_internal/server/jobs/handlers/cleanupRtdbEvents.ts`

### S5 Verification

- [ ] Homepage SSR has all section content in initial HTML
- [ ] Wishlist cap toast fires at 20 items
- [ ] History 50-FIFO silent evict works
- [ ] `/search?q=pokemon` SSR rendered with results

---

## S6 — Seller + Admin + Content + Scaffolds Completion

> Migrate: seller, admin (incl. AdminSectionsView demolition), events, blog, faq, cms, before-after, about, corporate, contact, consultation.
> Extract: `<DashboardScaffold>`, `<AppShell>`.

### AdminSectionsView Demolition (CC-2)

- [ ] Split 2,768-LOC `AdminSectionsView.tsx` into one file per section type (~21 files, ~150 LOC each)
- [ ] Each: `_internal/client/features/homepage/sections/<Type>Editor.tsx`
- [ ] Form state in client component; saves call `server/actions: updateHomepageSection(id, patch)`

### Features to Migrate

- [ ] `seller` — pre-fetch all dashboard tiles server-side
- [ ] `admin` — `AdminSiteSettingsView` (776 LOC), `AdminCarouselEditorView` (597 LOC) split
- [ ] `events` — `server/data: getEvent(slug), listEvents`; slot-shell pattern preserved
- [ ] `blog` — `server/data: getBlogPost(slug), listRelatedPosts`; `/blog/[slug]` SSR
- [ ] `faq` — `server/data: listFaqs, getFaq`; FAQ search still client-side
- [ ] `cms` — `server/data: getCmsPage(slug)`
- [ ] `before-after` — pure RSC if no interaction
- [ ] `about`, `corporate` — pure RSC
- [ ] `contact`, `consultation` — `server/actions: submitContact, submitConsultation`

### New Scaffolds

- [ ] `_internal/client/scaffolds/DashboardScaffold.tsx` — sidebar: bottom-nav xs, off-canvas sm, sticky lg+
- [ ] `_internal/client/scaffolds/AppShell.tsx` — header/footer/locale/notifications/search slot

### Functions Migration

- [ ] `_internal/server/jobs/handlers/listingProcessor.ts`
- [ ] `_internal/server/jobs/handlers/adminAnalytics.ts`
- [ ] `_internal/server/jobs/handlers/storeAnalytics.ts`
- [ ] `_internal/server/jobs/handlers/onProductWrite.ts`
- [ ] `_internal/server/jobs/handlers/onCategoryWrite.ts`
- [ ] `_internal/server/jobs/handlers/onStoreWrite.ts`
- [ ] `_internal/server/jobs/handlers/mediaTmpCleanup.ts`

### CC-8: `[locale]/layout.tsx` SSR Loading

- [ ] Parallel server-side fetches for category tree + session (from cookie)
- [ ] Remove client-side `useEffect` fetches in dashboard nav

---

## S7 — Cross-Cutting + Lift-from-letitrip + Cleanup

> Migrate: account, auth, media, messages, scams, support, layout, shell, copilot, filters, forms.
> Lift: consumer-side view wrappers into appkit.
> Final cleanup: API-route attrition, next.config.js, tailwind.config.js.

### Features to Migrate

- [ ] `auth` — session stays client; email-verify/reset mutations → server actions; OAuth routes kept
- [ ] `account` — `server/data: getAccount(uid)`; client form action
- [ ] `media` — `server/actions: requestUploadUrl, finalizeMedia`; tmp/ → finalized rename preserved
- [ ] `messages` — `server/data: listConversations`; RTDB ping channel preserved; `server/actions: sendMessage`
- [ ] `scams` — `server/data: getScamProfile`; SSR (no admin UI yet)
- [ ] `support` — `server/actions: createTicket`; `server/data: listTickets(uid)`
- [ ] `layout`, `shell`, `filters`, `forms` — pure client; no fetches
- [ ] `copilot` — audit; classify as pure client tool or add server actions for mutations
- [ ] `cron` + `whatsapp-bot` — move out of `features/`; `loyalty` stays skeleton

### Lift from letitrip into appkit

- [ ] `components/auth/{Login,Register,ForgotPassword,ResetPassword,VerifyEmail}PageClient.tsx` → `_internal/client/features/auth/<X>View.tsx`
- [ ] `components/user/{Profile,UserAddresses,AddAddress,EditAddress}Client.tsx` → `_internal/client/features/account/<X>View.tsx`
- [ ] `components/routing/{Cart,Checkout,CheckoutSuccess}RouteClient.tsx` → `_internal/client/features/<f>/<X>View.tsx`
- [ ] `components/routing/RoutePlaceholderView.tsx` → `_internal/client/scaffolds/RoutePlaceholder.tsx`
- [ ] `components/homepage/AdSlots.tsx` → `_internal/client/ads/AdSlot.tsx`
- [ ] `components/homepage/HomepageNewsletterForm.tsx` → `_internal/client/features/homepage/NewsletterForm.tsx`
- [ ] `components/ads/AdRuntimeInitializer.tsx` → `_internal/client/ads/AdRuntimeInitializer.tsx`
- [ ] `components/user/FontToggleClient.tsx` → `_internal/client/preferences/FontToggle.tsx`
- [ ] `components/admin/AdminAnalyticsClient.tsx` → `_internal/client/features/admin/AnalyticsView.tsx`
- [ ] `LayoutShellClient.tsx` → slim ~30-line wrapper around `<AppShell>` from appkit

### Final Functions Migration

- [ ] `letitrip.in/functions/src/index.ts` → 3-line `bindToFirebase(handlers)` only
- [ ] All remaining handlers moved into appkit `_internal/server/jobs/handlers/`

### Final Cleanup (CC-9, CC-10)

- [ ] Remove `serverExternalPackages` appkit entries from `letitrip.in/next.config.js`
- [ ] Remove `outputFileTracingIncludes` appkit workaround from `letitrip.in/next.config.js`
- [ ] Remove `webpack.externals` appkit block from `letitrip.in/next.config.js`
- [ ] Remove any appkit `content` glob or `safelist` from `letitrip.in/tailwind.config.js`
- [ ] Delete all API routes with no non-React consumers (~200 routes)
- [ ] Theme-swap experiment across every migrated feature — all repaint

### Final Verification

- [ ] `npx tsc --noEmit` clean in both repos
- [ ] `node scripts/audit-violations.mjs` exits 0
- [ ] `node scripts/verify-entries.mjs` exits 0
- [ ] `npx appkit-smoke-ssr` exits 0
- [ ] `npx appkit-smoke-bundle` exits 0
- [ ] `publint` clean
- [ ] Lighthouse SEO ≥ pre-migration on all public pages
- [ ] `letitrip.in/src/components/` has ≤5 files (only dev tools + consumer wrappers)
- [ ] CLAUDE.md updated with new patterns

---

## Cross-Cutting Checklist (ongoing across all sessions)

- [ ] CC-1: Demolish `appkit/src/index.ts` (8,933 lines) → replaced by two thin entries
- [ ] CC-2: Demolish `AdminSectionsView.tsx` (2,768 LOC) → per-section-type files (S6)
- [ ] CC-3: Hydration helpers `toClient()` + `clientInitial<T>()` in `shared/serialization/`
- [ ] CC-4: ESLint boundary rules inside appkit — extended per session ✅ (S1)
- [ ] CC-5: `appkit/scripts/` reduced to 6 build scripts + CLI binaries ✅ (S1 partial)
- [ ] CC-6: Delete dead REST hooks after each feature migrates
- [ ] CC-7: API-route attrition — delete routes with no non-React consumers
- [ ] CC-8: `[locale]/layout.tsx` SSR loading — category tree + session server-side (S6)
- [ ] CC-9: `next.config.js` cleanup — remove appkit workarounds (S7)
- [ ] CC-10: Tailwind cleanup — no appkit `content` glob or `safelist` (S7 ✅ via `defineTailwindConfig`)
- [ ] CC-11: Keep-in-appkit audit — every new SSR file (data layer, transform/adapter, OG renderer, metadata builder, sitemap entry) lives under `appkit/src/_internal/`; route files in letitrip.in stay shims. See "Guiding Principle" section above. Run `npm run audit:ssr-in-appkit` (script: `scripts/audit-ssr-in-appkit.mjs`) — flags fat route files (opengraph-image, sitemap, robots, manifest) above shim thresholds and forbidden `_transform.ts` / `_adapter.ts` sidecars under `src/app/api/**`. Baseline at script creation: **31 violations** (8 OG renderers, sitemap.ts 416 LOC, manifest/robots, 1 `_transform.ts`). Goal: drive to 0 over S3–S7.

---

## Dark Mode & Responsive Contract (S1 ✅ foundation, S2+ per-feature)

### Foundation (S1 done)
- [x] `SEMANTIC_COLORS` — full light-mode token set (brand, state, surface, text)
- [x] `SEMANTIC_COLORS_DARK` — full dark-mode token set
- [x] `Responsive<T>` type — `T | Partial<Record<Breakpoint, T>>`
- [x] `BREAKPOINTS` constant — xs/sm/md/lg/xl/2xl
- [x] `defineTailwindConfig` — `darkMode:"class"` + full semantic color CSS-var palette
- [x] `LayoutShellClient` injects `:root { ... }` (light) + `.dark { ... }` (dark) CSS variable blocks
- [x] `siteSettings.theme` schema includes `primaryDark`, `secondaryDark`, `accentDark`

### Per-Feature (S2+ — check each migration)
- [ ] Every migrated component uses semantic tokens — no raw hex, no colour-name Tailwind utilities
- [ ] Every migrated component uses `Responsive<T>` props for layout-affecting values
- [ ] Viewport sweep xs → 2xl — no horizontal scroll on xs, no oversized line lengths on 2xl
- [ ] Dark mode toggle — all migrated pages repaint correctly via CSS variables
- [ ] Theme-swap experiment — admin-override colors propagate to all migrated components
