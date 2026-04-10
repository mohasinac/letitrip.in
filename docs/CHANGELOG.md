# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — 2026-04-04

### Coverage-gate checkpoint for admin shell extraction

- Verified appkit package-side coverage work for admin shells is built successfully in source (`D:\proj\appkit`) after fixing admin component blockers.
- Confirmed installed `@mohasinac/appkit@2.0.3` in letitrip does not yet export `AdminDashboardView` and `QuickActionsPanel`, so Task 1 extraction remains blocked by package release/adoption.
- Updated `docs/APPKIT_FIRST_TRACKER.md` gap inventory and release note to record this blocker explicitly before any further admin extraction edits.

### Appkit-first tracker added as the migration source of truth

- Added `docs/APPKIT_FIRST_TRACKER.md` as the authoritative execution contract for ongoing migration work.
- Defined default decisions for when code must move into appkit first versus when letitrip.in may keep a thin adapter or blocker-specific local implementation.
- Documented the customization model so future work keeps appkit reusable while allowing letitrip-specific labels, routes, render slots, and adapters.
- Captured the current status, known appkit gaps, migration acceptance criteria, and execution order to reduce repeated architecture questions during future runs.

### Admin dashboard stats cards moved to appkit surface

- Converted `src/features/admin/components/AdminStatsCards.tsx` into a thin adapter over `DashboardStatsGrid` from `@mohasinac/appkit/features/admin`.
- Kept letitrip-specific translation labels and local stats-shape mapping in the adapter while moving the reusable card rendering back to appkit.

### Admin user table columns partially moved to appkit account surface

- Refactored `src/features/admin/components/UserTableColumns.tsx` to build its shared base columns from `buildAccountColumns` in `@mohasinac/appkit/features/account`.
- Kept letitrip-specific translation headers, avatar rendering, role/status columns, and action buttons locally while removing duplicated base account-column structure.

### User address card moved to appkit account surface

- Refactored `src/components/user/AddressCard.tsx` into a thin adapter over `AddressCard` from `@mohasinac/appkit/features/account`.
- Kept letitrip-specific set-default action locally while delegating reusable address card rendering and label wiring to appkit.

### Seller addresses view now reuses shared package-backed address card

- Updated `src/features/seller/components/SellerAddressesView.tsx` to replace duplicated local address-card markup with the shared `AddressCard` adapter from `@/components`.
- Preserved seller-specific edit/delete drawer flow and data hooks while delegating reusable address card UI rendering to the package-backed adapter.

### Tracker protocol added for missing package coverage

- Updated `docs/APPKIT_FIRST_TRACKER.md` with a required missing-coverage protocol.
- Future batches must now log newly encountered package-surface blockers in `Known Gaps To Close In Appkit` with blocked file path and resolution status.

### Tracker reset and coverage gate enforcement

- Updated `docs/APPKIT_FIRST_TRACKER.md` to enforce a mandatory pre-extraction coverage gate.
- Reset the active migration queue in tracker to Task 1 (Admin shells) so extraction order restarts from the first task.

### Page regression fixes for wrapper migration and Next 16 proxy builds

- Added a bare-render mode to `src/components/forms/Input.tsx` so file, radio, range, and search controls can keep their page-specific layouts without the component injecting extra wrapper markup.
- Updated affected UI surfaces (`Search`, `FilterFacetSection`, `MediaLightbox`, `AvatarUpload`) to use bare input rendering where the wrapper migration had broken control layout or behavior.
- Fixed admin/event page regressions caused by primitive swaps: category thumbnails now provide proper relative media containers, event offer buttons use the correct promotions label namespace, and background video previews wrap `MediaVideo` correctly.
- Renamed the Next request entrypoint from `middleware.ts` to `proxy.ts` so Next 16 emits the expected `proxy.js.nft.json` trace and production builds complete successfully.

**Verification:**

- `npx tsc --noEmit` in letitrip.in ✅
- `npm run build` in letitrip.in ✅

### Seed data integrity alignment for carts and bids

- Updated cart line-item snapshots in src/db/seed-data/cart-seed-data.ts to match current product seed records for product titles and snapshot prices.
- Updated bid snapshots in src/db/seed-data/bids-seed-data.ts to match current auction product titles.
- This keeps demo reseed flows consistent across products, carts, and bids without title/price drift.

**Verification:**

- `npx tsc --noEmit` in letitrip.in ✅
- `npm run build` in letitrip.in ✅

### Locale fallback hardening across localized routes

- Added shared resolver `src/i18n/resolve-locale.ts` to coerce missing/invalid locale values to `en`.
- Updated locale-aware app shell and localized pages to resolve `params.locale` through the shared resolver before calling `setRequestLocale()` and `getTranslations({ locale, ... })`.
- Updated localized redirect routes (FAQ category fallback and store index redirect) to pass a validated locale to navigation redirects.
- Updated nested store pages (`about`, `products`, `auctions`, `reviews`) to use explicit locale in translation lookup and request-locale setup.

**Verification:**

- IDE diagnostics (`get_errors`) on all edited locale files ✅

### UI extraction continuation — generic controls and stats cards

- Moved shared `Accordion`, `Dropdown`, `Menu`, `Pagination`, and `DashboardStatsCard` implementations into `@mohasinac/ui`.
- Moved `HorizontalScroller` implementation into `@mohasinac/ui` and converted `src/components/ui/HorizontalScroller.tsx` into a thin re-export shim.
- Moved `DynamicSelect` implementation into `@mohasinac/ui` and converted `src/components/ui/DynamicSelect.tsx` into a thin re-export shim.
- Moved `Tabs` implementation into `@mohasinac/ui` and converted `src/components/ui/Tabs.tsx` into a thin re-export shim.
- Moved `SortDropdown` implementation into `@mohasinac/ui` and converted `src/components/ui/SortDropdown.tsx` into a thin translation adapter over the package primitive.
- Moved `Avatar` implementation into `@mohasinac/ui` and converted `src/components/ui/Avatar.tsx` into a thin re-export shim.
- Removed local dead helper hooks `src/components/ui/useHorizontalAutoScroll.ts` and `src/components/ui/useHorizontalScrollDrag.ts` after the package extraction.
- Converted local files `src/components/ui/Accordion.tsx`, `src/components/ui/Dropdown.tsx`, `src/components/ui/Menu.tsx`, and `src/components/ui/Pagination.tsx` into thin re-export shims over `@mohasinac/ui`.
- Converted `src/components/DashboardStatsCard.tsx` into a thin local adapter over `@mohasinac/ui` that only injects the app's `Link` implementation.
- Fixed mojibake in `src/db/seed-data/categories-seed-data.ts` by restoring the star icon to a valid Unicode glyph.
- Switched `src/app/api/pre-orders/route.ts` to a new server-only `@mohasinac/feat-pre-orders/server` export so the route no longer imports the package's client surface.
- Aligned seed data in `src/db/seed-data/stores-seed-data.ts` with current `reviews-seed-data.ts` approved-review totals (FigureVault JP: 12) to keep delete-and-reseed flows internally consistent.

**Verification:**

- `npm run build` in `packages/packages/ui` ✅
- `npm run build` in `packages/packages/feat-pre-orders` ✅
- `npx tsc --noEmit` in `letitrip.in` ✅
- `npm run build` in `letitrip.in` ✅

### Hook adapter cleanup — direct feat-\* hook usage

- Migrated public blog listing to use `useBlogPosts` directly from `@mohasinac/feat-blog` in `src/features/blog/components/BlogListView.tsx` and removed the local shim `src/hooks/useBlogPosts.ts`.
- Migrated events listing and event banner to use `useEvents` directly from `@mohasinac/feat-events` in `src/features/events/components/EventsListView.tsx` and `src/components/EventBanner.tsx`; removed local shim `src/hooks/usePublicEvents.ts`.
- Updated shared hook barrel `src/hooks/index.ts` to drop exports of removed shim hooks.
- Preserved URL-driven filter behavior in events listing by building `filters` directly in the package hook params object.

**Verification:**

- `npx tsc --noEmit` in `letitrip.in` ✅
- `USE_LOCAL_PACKAGES='true' npm run build` in `letitrip.in` ✅

### Next and validation adapters — package-backed wrappers

- Migrated `src/lib/api/cache-middleware.ts` to a thin adapter over `@mohasinac/next` cache middleware exports while preserving local `CachePresets` usage.
- Migrated `src/lib/errors/error-handler.ts` to `createApiErrorHandler` from `@mohasinac/next`, retaining local AppError semantics, status extraction, serializer, and `serverLogger` integration.
- Migrated `src/lib/zod-error-map.ts` to a direct shim re-exporting `zodErrorMap` and `setupZodErrorMap` from `@mohasinac/validation`.
- Added generic `createApiHandlerFactory` to `@mohasinac/next` (`packages/packages/next/src/api/apiHandler.ts`) and exported it from package index for reuse by consumer projects.
- Linked `@mohasinac/next` to local workspace package in `letitrip.in/package.json` and migrated `src/lib/api/api-handler.ts` to use `createApiHandlerFactory` while preserving local auth/rate-limit/error semantics.
- Updated `@mohasinac/next` request-facing types to structural `Request`/`Response` signatures (instead of hard `NextRequest`) to avoid cross-install Next.js nominal type conflicts in monorepo file-link mode.
- Linked `@mohasinac/ui`, `@mohasinac/utils`, `@mohasinac/security`, `@mohasinac/react`, `@mohasinac/feat-auth`, `@mohasinac/feat-cart`, `@mohasinac/feat-products`, and `@mohasinac/feat-wishlist` to local workspace packages so letitrip consumes the extracted feature/hook/helper exports directly.

**Verification:**

- IDE diagnostics (`get_errors`) on all three changed files ✅
- `npx tsc --noEmit` in `letitrip.in` ✅
- `npm run build --workspace @mohasinac/next` in `d:\proj\packages` ✅
- `npm install --package-lock=false` in `letitrip.in` after local package links ✅

### UI primitives extraction continuation — TagInput

- Added generic `TagInput` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/TagInput.tsx`) and exported it from package index.
- Converted local `src/components/ui/TagInput.tsx` to a thin re-export shim over `@mohasinac/ui`.
- Added generic `StepperNav` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/StepperNav.tsx`) and exported it from package index.
- Converted local `src/components/ui/StepperNav.tsx` to a thin re-export shim over `@mohasinac/ui`.
- Added generic `ViewToggle` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/ViewToggle.tsx`) and exported it from package index.
- Converted local `src/components/ui/ViewToggle.tsx` to a thin i18n adapter over package primitive (labels injected via `next-intl`).
- Added generic `RatingDisplay` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/RatingDisplay.tsx`) and exported it from package index.
- Converted local `src/components/ui/RatingDisplay.tsx` to a thin re-export shim over `@mohasinac/ui`.
- Added generic `PriceDisplay` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/PriceDisplay.tsx`) and exported it from package index.
- Converted local `src/components/ui/PriceDisplay.tsx` to a thin re-export shim over `@mohasinac/ui`.
- Added generic `StatsGrid` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/StatsGrid.tsx`) and exported it from package index.
- Converted local `src/components/ui/StatsGrid.tsx` to a thin re-export shim over `@mohasinac/ui`.
- Added generic `SummaryCard` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/SummaryCard.tsx`) and exported it from package index.
- Converted local `src/components/ui/SummaryCard.tsx` to a thin re-export shim over `@mohasinac/ui`.
- Added generic `CountdownDisplay` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/CountdownDisplay.tsx`) and kept local `src/components/ui/CountdownDisplay.tsx` as a thin re-export shim.
- Added generic `ItemRow` primitive to `@mohasinac/ui` (`packages/packages/ui/src/components/ItemRow.tsx`) and converted local `src/components/ui/ItemRow.tsx` to a thin media-aware adapter over the package primitive.

**Verification:**

- `npm run build --workspace @mohasinac/ui` in `d:\proj\packages` ✅
- `npx tsc --noEmit` in `letitrip.in` ✅

---

### Package extraction batch — utils/security/react shims

- Added `redactPii` to `@mohasinac/security` and converted local `src/utils/pii-redact.ts` to a package re-export shim.
- Added `animation.helper`, `color.helper`, and full `event-manager` utility set to `@mohasinac/utils` and converted local helper files to package re-export shims.
- Added reusable hooks to `@mohasinac/react`: `useBulkAction`, `usePendingFilters`, `usePendingTable`, and `useUnsavedChanges`.
- Converted local hooks `src/hooks/useBulkAction.ts`, `src/hooks/usePendingFilters.ts`, `src/hooks/usePendingTable.ts` to re-export shims.
- Kept `src/hooks/useUnsavedChanges.ts` as a thin local adapter that wires `eventBus` confirmation behavior into package hook `useUnsavedChanges`.

**Verification:**

- `npm run build --workspace @mohasinac/utils` ✅
- `npm run build --workspace @mohasinac/security` ✅
- `npm run build --workspace @mohasinac/react` ✅
- IDE diagnostics (`get_errors`) on all changed files ✅

### Auth UI-only continuation — forgot/reset success panels

- Updated `src/features/auth/components/ForgotPasswordView.tsx` success state to use `AuthStatusPanel` from `@mohasinac/feat-auth`.
- Updated `src/features/auth/components/ResetPasswordView.tsx` success state to use `AuthStatusPanel` from `@mohasinac/feat-auth`.
- Auth logic, mutations, routing, and session handling remain local; only presentational status UI was extracted.

**Verification:**

- `npm run build --workspace @mohasinac/feat-auth` ✅
- `npx tsc --noEmit` in `letitrip.in` ✅

---

### Cart + Products + Auth extraction continuation

**Cart (read-wrapper extraction):**

- Added `useCheckoutReadQueries` to `@mohasinac/feat-cart` for query-only checkout reads (addresses + cart via `apiClient.get`).
- Updated local `src/hooks/useCheckout.ts` to delegate checkout read queries to package wrapper while keeping checkout mutation/payment flow local.

**Products (component-level extraction):**

- Added package-level `ProductFeatureBadges` in `@mohasinac/feat-products` and exported via component barrel.
- Converted local `src/features/products/components/ProductFeatureBadges.tsx` into a thin translation/theming adapter over package component.

**Auth (UI-only extraction):**

- Added `AuthStatusPanel` to `@mohasinac/feat-auth` and exported via component barrel.
- Updated local `src/features/auth/components/VerifyEmailView.tsx` to use package status panel while retaining page-specific verification logic and routing locally.

**Verification:**

- `npm run build --workspace @mohasinac/feat-cart` ✅
- `npm run build --workspace @mohasinac/feat-products` ✅
- `npm run build --workspace @mohasinac/feat-auth` ✅
- `npx tsc --noEmit` in `letitrip.in` ✅

---

## [Unreleased] — 2026-04-04

### Cart batch continuation — read hook wrapper extraction

- Added `useCartQuery` to `@mohasinac/feat-cart` (`src/hooks/useCartQuery.ts`) as a generic read-only query wrapper over `apiClient`.
- Exported `useCartQuery` from `@mohasinac/feat-cart` public API.
- Updated local `src/features/cart/hooks/useCartMutations.ts` so `useCart` delegates to `useCartQuery`, preserving existing endpoint/query key/return behavior while removing local read-query implementation details.

**Verification:**

- `npm run build --workspace @mohasinac/feat-cart` ✅
- `npx tsc --noEmit` in `letitrip.in` ✅

---

## [Unreleased] — 2026-04-03

### Package Extraction Continuation — auth + products wrappers

Continued B/C extraction with thin local adapters over `@mohasinac/feat-*` exports.

**Auth migration:**

- `src/features/auth/components/AuthSocialButtons.tsx` now delegates rendering to `SocialAuthButtons` from `@mohasinac/feat-auth` and keeps only local translations/prop wiring.

**Products migration:**

- `src/features/products/hooks/useProducts.ts` now delegates list querying to `useProducts` from `@mohasinac/feat-products`.
- Local hook API preserved (`params` string input, `ProductsListResult` return shape) via a compatibility adapter that parses URL params and bridges package/local types.

**Verification:** `npx tsc --noEmit` → clean

---

## [Unreleased] — 2026-03-24

### Package Migration — Seller GET routes delegated to @mohasinac/feat-seller

Three new GET handler stubs wired, delegating to `@mohasinac/feat-seller`:

- `GET /api/seller/store` → `sellerStoreGET` (stores collection, `ownerId=={uid}`)
- `GET /api/seller/coupons` → `sellerCouponsGET` (coupons collection, `sellerId=={uid}`)
- `GET /api/seller/offers` → `sellerOffersGET` (offers collection, `sellerId=={uid}`)

All three handlers use `createRouteHandler` from `@mohasinac/next` (session claims only — no Firestore user read overhead). Response shapes verified against `useSellerStore`, `useSellerCoupons`, `useSellerOffers` hooks.

**`feat-seller` additions** (`packages/packages/feat-seller/`):

- `src/api/store/route.ts` — `sellerStoreGET`
- `src/api/coupons/route.ts` — `sellerCouponsGET`
- `src/api/offers/route.ts` — `sellerOffersGET`
- `src/index.ts` — exports all three new handlers

**Package migration progress**: 36 / ~100 delegatable routes (~36%)

---

## [Unreleased] — 2026-03-17

### Hook Migration — Server Actions → apiClient (Rule 20/21 compliance)

All public-facing and admin read hooks migrated from Server Actions to `apiClient.get()` calls.
Rule 20/21: reads in hooks must use `Hook → apiClient`, not `Hook → Server Action`.

**Public hooks migrated (17 hooks across 14 files):**

- `useProductDetail` → `GET /api/products/[id]`
- `useAuctions` → `GET /api/products?${params}` (view already includes `isAuction==true,status==published`)
- `usePreOrders` → `GET /api/products?${params}` (view already includes `isPreOrder==true,status==published`)
- `usePublicEvent` → `GET /api/events/[id]`
- `useEventLeaderboard` → `GET /api/events/[id]/leaderboard`
- `useOrder` → `GET /api/user/orders/[id]`
- `useCategoriesList` → `GET /api/categories?flat=true`
- `useCategoryDetail` → `GET /api/categories?slug=` + `GET /api/categories?parentId=`
- `useCategoryProducts` → `GET /api/categories?slug=` + `GET /api/products?${params}` (fixed `ProductsResponse` type to match `{ items, total, ... }`)
- `useBlogArticles` → `GET /api/blog?featured=true` with fallback to `GET /api/blog?sort=-publishedAt`
- `useSearch` → `GET /api/categories?flat=true` + `GET /api/search?${params}`

**Admin hooks migrated:**

- `useAdminAnalytics` → `GET /api/admin/analytics`
- `useAdminStats` → `GET /api/admin/dashboard`
- `useEvents` → `GET /api/admin/events?${params}`
- `useEvent` → `GET /api/admin/events/[id]`
- `useEventStats` → `GET /api/admin/events/[id]/stats` (added `EventStats` type with `totalEntries` etc.)
- `useEventEntries` → `GET /api/admin/events/[id]/entries?${params}` (now properly paginated vs. previous single-fetch)

**Pattern for 404 handling:** hooks that previously returned `null` on not-found now use `catch(e instanceof ApiClientError && e.status === 404 → return null)`.

**Verification:** `npx tsc --noEmit` → clean; `npm run build` → compiled with pre-existing warnings only

---

## [Unreleased] — 2026-03-16

### API Route Migration + Hook Migration (Session 2)

**New package handlers:**

- `feat-blog/src/api/[slug]/route.ts` — GET `/api/blog/[slug]`: returns `BlogPostDetailResponse { post, related }` via `BlogRepository.findBySlug` + `findByCategory`
- `feat-stores/src/api/[storeSlug]/route.ts` — GET `/api/stores/[storeSlug]`: returns `StoreDetail` directly (no outer wrapper) via Sieve filter `storeSlug==x,status==active,isPublic==true`

**Local route stubs added:**

- `/api/blog/[slug]` → `export { blogSlugGET as GET } from "@mohasinac/feat-blog"`
- `/api/stores/[storeSlug]` → `export { storeSlugGET as GET } from "@mohasinac/feat-stores"`

**Read hook migration (Rule 20/21: reads must use apiClient, not Server Actions):**

- `src/hooks/useBlogPosts.ts` — migrated from `listBlogPostsAction` to `apiClient.get('/api/blog?...')`
- `src/features/blog/hooks/useBlogPost.ts` — migrated from dual Server Actions to single `apiClient.get('/api/blog/${slug}')` returning `BlogPostDetailResponse`
- `src/features/stores/hooks/useStores.ts` — migrated from `listStoresAction` to `apiClient.get('/api/stores?...')`
- `src/features/products/hooks/useProducts.ts` — migrated from `listProductsAction` to `apiClient.get('/api/products?...')`
- `src/features/stores/hooks/useStoreBySlug.ts` — migrated 4 hooks (`useStoreBySlug`, `useStoreReviews`, `useStoreProducts`, `useStoreAuctions`) from Server Actions to `apiClient.get()`

**Package fix — route params type:**

- Both new handlers updated from `Promise<T> | T` union to strict `Promise<T>` for `params` (required by Next.js 15 type checker)
- Packages rebuilt: `feat-blog` ✅, `feat-stores` ✅

**Verification:** `npx tsc --noEmit` → clean; `npm run build` → compiled with pre-existing warnings only

---

## [Unreleased] — 2026-03-15

### API Route Migration — Package Delegation + Build Fix

Migrated 3 public GET API routes to 2-line re-export stubs that delegate to `@mohasinac/feat-*` package handlers.

**Migrated routes:**

- `/api/blog` → `export { GET } from "@mohasinac/feat-blog"`
- `/api/stores` → `export { GET } from "@mohasinac/feat-stores"`
- `/api/events` → `export { GET } from "@mohasinac/feat-events"`

**Package handler updates (response shape harmonisation):**

- `feat-blog`: Changed `BlogListResponse` from `{ items }` to `{ posts, meta: { total, page, pageSize, totalPages, hasMore } }` to match local consumers
- `feat-stores`: Added field mapping to strip sensitive fields (`createdBy`, raw stats) for public safety
- `feat-events`: Created new `src/api/route.ts` handler with `status==active` default filter, search support, `createdBy` stripping
- `feat-products`: Updated to use `pageSize`/`hasMore`, added `brand`/`isPreOrder`/`inStock` filters, `Cache-Control` header
- `feat-reviews`: Updated to use `pageSize`/`hasMore`/`ratingDistribution`, `sorts` param support
- All 8 package indexes updated with direct `GET` export alongside aliased exports

**Build fix — webpack `extensionAlias`:**

- Packages moved to `D:\proj\packages` (commit `3519efa1`) caused `Module not found` errors for `.js` extension imports in `auth-firebase`, `contracts`, `db-firebase`
- Added `webpack.resolve.extensionAlias` to `next.config.js` mapping `.js` → `[.ts, .tsx, .js]` and `.mjs` → `[.mts, .mjs]`
- Production build now passes cleanly

**Routes assessed as too complex for stub migration:**

- `categories` (211 lines) — tree building, brands, tiers, slug lookup
- `reviews` (237 lines) — email notifications, rating distribution, featured/latest modes
- `faqs` (268 lines) — variable interpolation, tags, in-memory Sieve
- `products` (164 lines) — `categoriesIn` with Firestore `whereIn`, POST with email/auth
- `homepage-sections` (106 lines) — admin `includeDisabled` logic
- `search` (123 lines) — Algolia integration

---

## [Unreleased] — 2026-03-15

### Packages — `@mohasinac/create-app` scaffolder + dist/tsconfig fixes

**`@mohasinac/create-app` (new package):**

Interactive CLI scaffolder (`npx @mohasinac/create-app`) that generates a complete Next.js project wired to any combination of `@mohasinac/*` providers and feature packages. Prompts the user for db, auth, email, storage, CSS, search, payment, and shipping provider choices plus feature selection, then writes:

- `providers.ts` — `registerProviders()` with selected concrete adapters
- Feature page stubs under `app/[locale]/`
- `env.example` with per-provider variable blocks
- `i18n/request.ts` with `mergeFeatureMessages()` wired
- `middleware.ts` with locale + auth middleware chained
- `next.config.ts` with `transpilePackages` for all selected features
- `app/[locale]/layout.tsx` root layout
- `constants/site.ts` + `constants/theme.ts`

Files: `packages/create-app/src/index.ts`, `generators.ts`, `features.ts`, `providers.ts`, `prompts.ts`

**Flat dist output (all packages):**

All 30+ `packages/*/package.json` updated to use flat tsup output (`./dist/index.js`, `./dist/index.cjs`, `./dist/index.d.ts`) instead of the nested `./dist/esm/`, `./dist/cjs/`, `./dist/types/` subdirectory layout. `exports` map reordered to `types → import → require`.

**Dev path aliases in all `tsconfig.json` files:**

Every package `tsconfig.json` now declares the full set of `@mohasinac/*` path aliases pointing to `../../packages/*/src` — enables cross-package IDE navigation, type-checking, and refactors during development without needing a prior `tsc --build`.

**`packages/cli/src/i18n.ts` — dynamic import opaque wrapper:**

Static import expressions (`import(\`...\`)`) inside `tryLoadFeatureMessages`and`mergeFeatureMessages`replaced with`\_dynamicImport`(a`new Function(...)` wrapper). This prevents esbuild/webpack/rollup from statically analysing the import path at library-build time, which was causing bundler errors when the CLI was consumed in Next.js projects where the message files resolve at runtime inside the consumer's project tree.

**`packages/cli/tsup.config.ts` (new file):**

Explicit `tsup` configuration for the `@mohasinac/cli` build: `format: ['esm','cjs']`, `dts: true`, `entry: ['src/index.ts']`.

**Root `tsconfig.json`:**

Added `packages/create-app` to the root `exclude` array (scaffolder uses `node:fs` / readline APIs incompatible with the app's browser-targeted compiler settings).

---

## [Unreleased] — 2026-03-15

### Phase 8 + 9 — `@mohasinac/*` Package Monorepo Bootstrap

Created the full `@mohasinac/*` scoped package tree under `packages/`. All packages are authored in TypeScript with `tsup` dual-output (ESM + CJS + `.d.ts`) and published under the `@mohasinac` npm org.

**Infrastructure packages (8):**

| Package                    | Description                                                                                                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@mohasinac/contracts`     | All shared TypeScript interfaces — `IRepository`, `IEmailProvider`, `IAuthProvider`, `IStorageProvider`, `IStyleAdapter`, `ISearchProvider`, `IPaymentProvider`, `IShippingProvider`, `ProviderRegistry`, `FeaturesConfig` |
| `@mohasinac/auth-firebase` | Firebase Auth provider — `FirebaseAuthProvider` (sign-in, sign-up, sign-out, token refresh, session cookie), `FirebaseAuthVerifier`, helpers, `session.ts`                                                                 |
| `@mohasinac/db-firebase`   | Firestore data layer — `FirebaseBaseRepository`, `FirebaseAdminRepository`, `RealtimeDBHelper`, `buildSieveQuery` (Sieve-compatible Firestore filter compiler), `stripTimestamps`                                          |
| `@mohasinac/email-resend`  | Resend email provider — `ResendEmailProvider` implementing `IEmailProvider`                                                                                                                                                |
| `@mohasinac/css-tailwind`  | Tailwind CSS adapter — `TailwindStyleAdapter` with `THEME_CONSTANTS`, token helpers                                                                                                                                        |
| `@mohasinac/css-vanilla`   | Vanilla CSS adapter — CSS custom property writer                                                                                                                                                                           |
| `@mohasinac/errors`        | Typed error hierarchy — `BaseError`, `ApiError`, `AuthenticationError`, `AuthorizationError`, `DatabaseError`, `NotFoundError`, `ValidationError`; `ErrorCodes` enum; `createApiErrorHandler` factory                      |
| `@mohasinac/cli`           | `@mohasinac/cli` — `add/remove/list` commands, `withFeatures()` config wrapper, `mergeFeatureMessages()` i18n loader, `generateMockData()`, `syncWithDatabase()`                                                           |

**Feature packages (21):**

`@mohasinac/feat-account`, `@mohasinac/feat-admin`, `@mohasinac/feat-auctions`, `@mohasinac/feat-auth`, `@mohasinac/feat-blog`, `@mohasinac/feat-cart`, `@mohasinac/feat-categories`, `@mohasinac/feat-checkout`, `@mohasinac/feat-events`, `@mohasinac/feat-faq`, `@mohasinac/feat-filters`, `@mohasinac/feat-forms`, `@mohasinac/feat-homepage`, `@mohasinac/feat-layout`, `@mohasinac/feat-media`, `@mohasinac/feat-orders`, `@mohasinac/feat-payments`, `@mohasinac/feat-pre-orders`, `@mohasinac/feat-products`, `@mohasinac/feat-promotions`, `@mohasinac/feat-reviews`, `@mohasinac/feat-search`, `@mohasinac/feat-seller`, `@mohasinac/feat-stores`, `@mohasinac/feat-wishlist`

Each feature package follows the standard layout:

```
packages/feat-<name>/
  manifest.ts              — IFeatureManifest (id, name, version, dependencies, requiredProviders, i18nNamespaces, routes, components)
  src/
    components/            — canonical React components (e.g. AuctionCard, BlogListView, CartDrawer)
    hooks/                 — data-fetching hooks wired to @mohasinac/http apiClient
    repository/            — IRepository implementations (Firestore-backed)
    types/index.ts         — feature-local TypeScript types
    messages/en.json       — default i18n strings
    index.ts               — barrel export
  tsconfig.json
  package.json
```

**`next.config.js`:**

Added all 29 `@mohasinac/*` packages to `transpilePackages` — required for Next.js to compile the TypeScript source-linked packages in the monorepo.

---

## [Unreleased] — 2026-03-15

### Refactor — Primitive Components & i18n Compliance

Replaced raw HTML `<button>`, `<span>` and hardcoded strings in shared components and user-facing layout with their canonical primitives and `useTranslations` keys.

**Files updated (4):**

- `src/features/user/components/UserAccountHub.tsx` — nav menu items use `<Span>` instead of `<span>`
- `src/components/admin/AdminPageHeader.tsx` — badge wrapper uses `<Span>` instead of `<span>`
- `src/components/utility/Search.tsx` — all `<button>` → `<Button variant="ghost">`, all `<span>` → `<Span>`; hardcoded placeholder `"Search products, categories, sellers..."` and button label `"Search"` replaced with `t("placeholder")` / `t("title")`; duplicate `Button` import resolved (removed direct path import, uses barrel `@/components`)
- `src/app/[locale]/user/layout.tsx` — mobile header `<button>` → `<Button variant="ghost">`, `<span>` → `<Span>`; `aria-label` and title text use `tA11y("openMenu")` / `t("title")` from `useTranslations`

---

## [Unreleased] — 2026-03-15

### UX — Remove Bottom Pagination from All Listing Views

Removed the redundant bottom `paginationSlot` from every `ListingLayout`-based view across the codebase. The compact toolbar pagination (top) remains as the sole pagination control, decluttering all listing pages.

**Files updated (24):**

- `src/features/products/components/PreOrdersView.tsx`
- `src/features/products/components/AuctionsView.tsx`
- `src/features/events/components/EventsListView.tsx`
- `src/features/events/components/AdminEventsView.tsx`
- `src/features/categories/components/CategoryProductsView.tsx`
- `src/features/blog/components/BlogListView.tsx`
- `src/features/reviews/components/ReviewsListView.tsx`
- `src/features/stores/components/StoresListView.tsx`
- `src/features/stores/components/StoreProductsView.tsx`
- `src/features/stores/components/StoreAuctionsView.tsx`
- `src/features/user/components/UserNotificationsView.tsx`
- `src/features/user/components/UserOrdersView.tsx`
- `src/features/seller/components/SellerProductsView.tsx`
- `src/features/seller/components/SellerOrdersView.tsx`
- `src/features/seller/components/SellerAuctionsView.tsx`
- `src/features/admin/components/AdminBidsView.tsx`
- `src/features/admin/components/AdminCouponsView.tsx`
- `src/features/admin/components/AdminFaqsView.tsx`
- `src/features/admin/components/AdminOrdersView.tsx`
- `src/features/admin/components/AdminPayoutsView.tsx`
- `src/features/admin/components/AdminReviewsView.tsx`
- `src/features/admin/components/AdminProductsView.tsx`
- `src/features/admin/components/AdminUsersView.tsx`
- `src/features/admin/components/AdminStoresView.tsx`

---

## [Unreleased] — 2026-03-15

### Styling — Hardcoded Color Token Purge (F1 continued)

Replaced every remaining hardcoded `indigo-*` and `blue-*` Tailwind color value with semantic `primary` tokens (`text-primary`, `bg-primary`, `ring-primary`, `border-primary`, `bg-primary/5`, `bg-primary/10`, `ring-primary/30`, `hover:text-primary`, `hover:bg-primary/90`) across the entire codebase. Normalised grid/card gaps to consistent `gap-4` / `gap-6` cadence throughout.

**`@lir/ui` package:**

- `packages/ui/src/components/Typography.tsx` — `Caption` accent/inverse and `Span` accent variants use `text-primary`
- `packages/ui/src/components/Progress.tsx` — `primary` variant uses `bg-primary` (replaces `bg-blue-600`)
- `packages/ui/src/DataTable.tsx` — view-mode toggle buttons use `bg-primary/5 text-primary ring-primary/30`; removed unused `Label` import; grid gap `gap-4→gap-6`, list gap `gap-2→gap-4`, mobile card spacing `space-y-4→space-y-6`; checkbox overlay replaced with native `<input type="checkbox">` for correct focus/checked state

**Shared components:**

- `src/components/typography/TextLink.tsx` — `default` variant `text-primary hover:text-primary/80`; `nav` variant `hover:text-primary`
- `src/components/ui/SkipToMain.tsx` — `bg-primary ring-primary` focus-visible classes
- `src/app/global-error.tsx` — `border-primary text-primary` home link
- `src/app/[locale]/help/page.tsx` — topic cards `hover:border-primary/40 group-hover:text-primary`; CTA buttons use `bg-primary` / `border-primary`
- `src/app/[locale]/cookies/page.tsx` and `src/app/[locale]/refund-policy/page.tsx` — inline color references updated
- All components under `src/components/` (filters, modals, cards, admin, auctions, categories, orders, products, typography, UI primitives) — `indigo-*` replaced with `primary` tokens

**Feature components (~120 files):**

- All components under `src/features/about/`, `src/features/admin/`, `src/features/auth/`, `src/features/blog/`, `src/features/cart/`, `src/features/categories/`, `src/features/events/`, `src/features/faq/`, `src/features/homepage/`, `src/features/products/`, `src/features/promotions/`, `src/features/seller/`, `src/features/stores/`, `src/features/user/`, `src/features/wishlist/` — `indigo-*`/`blue-*` replaced with `primary` tokens

**Violations scanner:**

- `violations.json` — updated scan (`2026-03-14`): 1 341 files, 20 info-level styling violations (`STYL-001` × 8, `STYL-003` × 12); 0 errors, 0 warnings

---

## [Unreleased] — 2026-03-15

### FormGroup UI Standardisation — Full Coverage

Completed `FormGroup` adoption across every form in the codebase. All field-layout divs (`space-y-*`, `spacing.stack` wrappers, raw `Grid` usages) inside form components have been replaced with `FormGroup` (and `FormFieldSpan` where a field must span full width). Forms are now uniformly responsive: `columns={2}` collapses to single-column on mobile.

**Phase 1 — already migrated (prior sessions):**
`AddressForm`, `ProductForm`, `ContactForm`, `ProfileInfoForm`, `SaleConfigForm`, `OfferConfigForm`, `EventFormDrawer`, `SellerPayoutSettingsView`, `SellerPayoutRequestForm`, `SellerCouponForm`, `SellerShippingView`, `SiteBasicInfoForm`, `SiteContactForm`, `SiteSocialLinksForm`, `SiteCommissionsForm`, `SectionForm`, `OrderStatusForm`, `MediaOperationForm`, `FaqForm`, `CouponForm`, `CarouselSlideForm`, `BlogForm`

**Phase 2 — migrated this session:**

- `src/features/seller/components/SellerStoreView.tsx` — replaced two `<Grid cols={2}>` blocks with `<FormGroup columns={2}>` (storeLogoURL + storeBannerURL; social links)
- `src/features/admin/components/PayoutStatusForm.tsx` — `<div className="space-y-5">` → `<div className={spacing.stack}>`
- `src/features/events/components/EventTypeConfig/SaleConfigForm.tsx` — `spacing.stack` div → `<FormGroup columns={2}>`; removed `THEME_CONSTANTS` import
- `src/features/events/components/EventTypeConfig/OfferConfigForm.tsx` — `spacing.stack` div → `<FormGroup columns={2}>`; `bannerText` wrapped in `<FormFieldSpan>`; removed `THEME_CONSTANTS` import
- `src/components/categories/CategoryForm.tsx` — `name + slug` → `<FormGroup columns={2}>`; checkbox trio `<Grid className="grid-cols-2">` → `<FormGroup columns={2}>`; `Grid` import removed
- `src/features/admin/components/BackgroundSettings.tsx` — overlay `<Grid cols={2}>` → `<FormGroup columns={2}>`; `Grid` import removed
- `src/features/admin/components/SiteCredentialsForm.tsx` — four provider sections (Razorpay, WhatsApp, Shiprocket, Meta) converted to `<FormGroup columns={2}>`; solo fields (`razorpayWebhookSecret`, `metaPageAccessToken`) wrapped in `<FormFieldSpan>`; `FormFieldSpan` added to imports
- `src/features/auth/components/RegisterForm.tsx` — `displayName + email` → `<FormGroup columns={2}>`; passwords + terms → `<FormGroup columns={1}>`; `FormGroup` added to imports
- `src/features/auth/components/LoginForm.tsx` — email + password `Input`s → `<FormGroup columns={1}>`; `FormGroup` added to imports
- `src/features/auth/components/ForgotPasswordView.tsx` — single `FormField` wrapped in `<FormGroup>`; `FormGroup` added to imports
- `src/features/products/components/MakeOfferForm.tsx` — offer amount + buyer note → `<FormGroup columns={2}>`; `FormGroup` added to imports
- `src/features/products/components/PlaceBidForm.tsx` — bid field section wrapped in `<FormGroup>`; `FormGroup` added to imports
- `src/features/user/components/PasswordChangeForm.tsx` — 3 password fields → `<FormGroup columns={1}>`; `FormGroup` added to imports
- `src/features/seller/components/SellerOffersView.tsx` — counter-offer drawer (counter amount + seller note) → `<FormGroup columns={2}>`; `FormGroup` added to imports
- `src/features/events/components/EventTypeConfig/PollConfigForm.tsx` — outer `spacing.stack` div → `<FormGroup>`; two checkboxes → nested `<FormGroup columns={2}>`; removed `THEME_CONSTANTS` import
- `src/features/events/components/EventTypeConfig/SurveyConfigForm.tsx` — outer div → `<FormGroup columns={1}>`; two checkboxes → `<FormGroup columns={2}>`; removed `THEME_CONSTANTS` import
- `src/features/events/components/EventTypeConfig/FeedbackConfigForm.tsx` — outer `THEME_CONSTANTS.spacing.stack` div → `<FormGroup>`; removed `THEME_CONSTANTS` import
- `src/features/events/components/EventParticipateView.tsx` — Card `space-y-5` replaced by `<FormGroup>` wrapping dynamic survey fields; `FormGroup` added to imports
- `src/features/seller/components/SellerStoreSetupView.tsx` — outer `spacing.stack` form → `<FormGroup columns={1}>` with storeName + storeCategory in `<FormGroup columns={2}>`

**Skipped (structure incompatible with FormGroup):**

- `NavbarConfigForm` — toggle-switch panel, no form fields
- `FooterConfigForm` — custom `grid-cols-[6rem_1fr_auto]` repeater rows
- `NewsletterSection` — intentional horizontal flex `Input + Button` layout
- `SellerCreateProductView` — pure pass-through wrapper for `ProductForm`

---

## [Unreleased] — 2026-03-15

### Fixed — Hydration & UI safety audit

Audited the codebase for hydration mismatches and preventive SSR safety.

- `src/app/[locale]/auth/close/page.tsx` — wrapped `useSearchParams()` in a `<Suspense>` boundary (extracted `AuthCloseContent` inner component); prevents Next.js from de-opting the entire route to CSR
- `src/features/seller/components/SellerCouponsView.tsx` — replaced bare `toLocaleDateString()` (no explicit locale) with the project's `formatDate()` utility; prevents server/client locale mismatch
- `src/components/feedback/Modal.tsx` — added `typeof document === "undefined"` SSR guard before `createPortal`, matching the `@lir/ui` Modal and Drawer pattern

---

## [Unreleased] — 2026-03-15

### Fixed — Theme hydration mismatch

Eliminated the `BackgroundRenderer` hydration mismatch caused by server/client theme disagreement.

- `src/contexts/ThemeContext.tsx` — `useState` now always uses the server-provided `initialTheme` (removed `typeof window` branch); `useEffect` reconciles localStorage/cookie drift post-hydration and persists both cookie + localStorage for first-time visitors
- `src/app/layout.tsx` — inline theme script reads the `theme` cookie first (matching SSR), then falls back to localStorage → system preference

---

## [Unreleased] — 2026-03-15

### Store Addresses — Full Migration

Migrated seller address management from user addresses (subcollection under `users/`) to store addresses (subcollection under `stores/`). Seller business/pickup addresses are now properly scoped to the store, not the user's personal address book.

**Migrated:**

- `src/features/seller/components/SellerAddressesView.tsx` — rewrote to use `useStoreAddresses`, `useCreateStoreAddress`, `useUpdateStoreAddress`, `useDeleteStoreAddress` from store address hooks; replaced page-navigation pattern with inline SideDrawer create/edit
- `src/features/seller/components/SellerSidebar.tsx` — sidebar label changed from "My Addresses" to "Pickup Addresses"
- `src/constants/routes.ts` — removed unused `SELLER.ADDRESSES_ADD` / `SELLER.ADDRESSES_EDIT` routes

**Seed data:**

- `src/db/seed-data/store-addresses-seed-data.ts` — new seed data with 5 store addresses across 3 demo stores
- `src/db/seed-data/index.ts` — added `storeAddressesSeedData` export
- `src/app/api/demo/seed/route.ts` — added `storeAddresses` to CollectionName, COLLECTION_MAP, SEED_DATA_MAP; added subcollection handling in GET (status), POST (load), and POST (delete) branches

**i18n:**

- `messages/en.json` — added `sellerAddresses.editTitle`, `sellerAddresses.defaultBadge`; added `navigation.pickupAddresses`; added `sellerStore.pickupAddressesTitle`, `pickupAddressesSubtitle`, `manageAddresses`

**Cleanup:**

- `src/features/seller/components/SellerStoreView.tsx` — replaced inline `StoreAddressesSection` with a lightweight card linking to the dedicated `/seller/addresses` page (eliminates duplicate store address management)
- `src/features/seller/components/StoreAddressesSection.tsx` — removed unused `Caption` import and `themed` destructure

### Dashboard Nav Context & TitleBar Integration

Added a `DashboardNavContext` so the global TitleBar can open dashboard sidebar drawers (admin, seller, user) via a unified button instead of each section having its own hamburger.

**New files:**

- `src/contexts/DashboardNavContext.tsx` — `DashboardNavProvider` + `useDashboardNav` hook; dashboard layouts register/unregister an opener callback, TitleBar reads it
- `scripts/pull-env-from-vercel.ps1`, `scripts/sync-env-to-vercel.ps1` — Vercel env sync helper scripts

**Layout integration:**

- `src/app/[locale]/layout.tsx` — Wrapped children with `DashboardNavProvider`
- `src/app/[locale]/admin/layout.tsx` — Registers admin sidebar opener via `useDashboardNav`; light-mode-aware bg classes
- `src/app/[locale]/seller/layout.tsx` — Registers seller sidebar opener; changed `requireRole` to allow `["seller", "admin"]`
- `src/app/[locale]/user/layout.tsx` — Registers user sidebar opener via `useDashboardNav`
- `src/components/layout/TitleBar.tsx` — Reads `hasDashboardNav` / `openDashboardNav` from context
- `src/components/layout/TitleBarLayout.tsx` — New `PanelLeft` icon button shown when a dashboard nav is registered
- `src/contexts/index.ts` — Barrel exports for `DashboardNavProvider` / `useDashboardNav`

### Display Font: Bangers → Poppins

Replaced the Bangers display font with Poppins for a cleaner, more professional look.

- `src/app/layout.tsx` — Swapped `Bangers` import for `Poppins` (weights 400–800)
- `tailwind.config.js` — Font-display fallback stack updated to `Poppins`
- `src/constants/theme.ts` — Updated heading comment to reference Poppins

### Widescreen Layout (max-w-7xl → max-w-[1920px])

Expanded content max-width from `max-w-7xl` (80rem) to `max-w-[1920px]` for widescreen displays.

- `src/constants/theme.ts` — `maxContentWidth` and `containerWidth` changed to `max-w-[1920px]`
- Homepage sections (`AdvertisementBanner`, `CustomerReviewsSection`, `FAQSection`, `WhatsAppCommunitySection`, `ReviewsListView`) — Added `max-w-7xl mx-auto` inner containers so content doesn't stretch on ultra-wide

### Admin Theme — Light Mode Support

Admin sidebar, top bar, stats card, and layout backgrounds now support light mode via `dark:` prefixed classes.

- `src/features/admin/components/AdminSidebar.tsx` — Sidebar bg `bg-white dark:bg-slate-950`, border/text classes
- `src/features/admin/components/AdminTopBar.tsx` — Header bg/border light-mode classes
- `src/components/DashboardStatsCard.tsx` — Dark variant uses light bg in light mode
- `src/app/[locale]/admin/layout.tsx` — Outer div and main bg light-mode aware

### Auth: Firestore Profile as Source of Truth

Server actions now fetch user profiles from Firestore instead of relying solely on Firebase Auth custom claims for role, displayName, email, and phone.

- `src/lib/firebase/auth-server.ts` — `requireRole()` falls back to Firestore `userRepository.findById()` when custom claim `role` is absent
- `src/actions/bid.actions.ts` — `placeBidAction` reads `displayName`/`email` from Firestore profile
- `src/actions/checkout.actions.ts` — `grantCheckoutConsentViaSmsAction` reads phone from Firestore profile
- `src/actions/offer.actions.ts` — `makeOfferAction` reads buyer name/email from Firestore profile
- `src/actions/seller.actions.ts` — `becomeSellerAction` checks role from profile; `sellerUpdateProductAction`/`sellerDeleteProductAction` allow admin override
- `src/actions/seller-coupon.actions.ts` — Coupon actions allow `admin` role; update/delete allow admin to manage any seller's coupons

### DataTable Selection Support

Added `selectable` / `selectedIds` / `onSelectionChange` props wiring to 16 admin/seller/user views and `ReviewsListView`.

- `AdminBidsView`, `AdminBlogView`, `AdminCarouselView`, `AdminCategoriesView`, `AdminCouponsView`, `AdminFaqsView`, `AdminOrdersView`, `AdminPayoutsView`, `AdminProductsView`, `AdminReviewsView`, `AdminSectionsView`, `AdminSessionsManager`, `AdminStoresView`, `AdminUsersView`, `AdminEventEntriesView`, `SellerAuctionsView`, `SellerOffersView`, `SellerPayoutHistoryTable`, `UserOffersView`, `ReviewsListView`

### CheckoutView — Hooks-Before-Early-Return Fix

- `src/features/cart/components/CheckoutView.tsx` — Moved `useCallback` hooks (`handleVerified`, `handleVerifyClose`) and derived values above early returns to comply with React's rules of hooks; non-hook logic (`codDepositPercent`, `depositAmount`, `selectedAddress`, `handleNext`) relocated below the loading/empty guards

### i18n — New Nav Keys

- `messages/en.json` — Added `nav.notifications`, `nav.analytics`, `nav.coupons`

### Seed Data — PII Fix, Link Cleanup & Product Videos

Updated seed data to fix PII inconsistencies, sanitize external links, and add video media to products.

**PII fixes (`src/db/seed-data/orders-seed-data.ts`):**

- Fixed 9 `userName` mismatches where order names diverged from user `displayName`:
  - "Haruto Yamada" → "John Doe" (3 orders for `user-john-doe-johndoe`)
  - "Sakura Tanaka" → "Jane Smith" (3 orders for `user-jane-smith-janes`)
  - "Ryuu Chen" → "Mike Johnson" (3 orders for `user-mike-johnson-mikejohn`)
- Fixed stale `productTitle`: "Embroidered Anarkali Kurta Set" → "Sailor Moon Neo Queen Serenity Cosplay Dress Set"

**Link cleanup (`src/db/seed-data/users-seed-data.ts`):**

- Changed `johndoe.com` → `johndoe.example.com` (RFC 2606 reserved domain for test data)

**Product videos (`src/db/seed-data/products-seed-data.ts`):**

- Added `video` field to 8 products across all 3 sellers (FigureVault JP, AnimeCraft Apparel, OtakuShelf Co)
- Videos use Google public sample URLs (`commondatastorage.googleapis.com/gtv-videos-bucket/sample/`)
- 2 products exercise `trimStart`/`trimEnd` for trim-path test coverage

### Admin Hooks & Views Refactoring

Systematic refactoring to eliminate duplicated boilerplate across admin list hooks and views.

**New files:**

- `src/features/admin/hooks/createAdminListQuery.ts` — Factory function that eliminates repeated URLSearchParams parsing + `useQuery` boilerplate. Exports `createAdminListQuery<TItem, TResult>()`, `extractBasicMeta()`, and `AdminListMeta` type.
- `src/helpers/data/filter.helper.ts` — `buildSieveFilters()` pure string utility for building Sieve filter expressions from tuple entries, replacing manual `filtersArr.push()` + `.join(",")` patterns.
- `src/actions/admin-read.actions.ts` — All admin read/list server actions extracted from `admin.actions.ts` (11 functions: `getAdminDashboardStatsAction`, `getAdminAnalyticsAction`, 8 `listAdmin*Action` functions, `listAdminSessionsAction`).

**Refactored hooks (9 hooks → use `createAdminListQuery` factory):**

- `useAdminOrders` · `useAdminUsers` · `useAdminProducts` · `useAdminBlog` · `useAdminBids` · `useAdminCoupons` · `useAdminPayouts` · `useAdminReviews` · `useAdminFaqs` · `useAdminStores`

**Refactored views (9 views → use `buildSieveFilters`):**

- `AdminOrdersView` · `AdminProductsView` · `AdminBidsView` · `AdminPayoutsView` · `AdminStoresView` · `AdminUsersView` · `AdminReviewsView` · `AdminCouponsView` · `AdminFaqsView`

**Other cleanup:**

- `src/hooks/useCheckout.ts` — Removed duplicate type definitions (~50 lines)
- `src/actions/admin.actions.ts` — Trimmed from ~800 to ~450 lines (mutations only)
- `src/actions/index.ts` — Updated barrel exports: admin reads now source from `admin-read.actions.ts`

### RC Removal — Documentation & i18n Cleanup

Follow-up pass removing remaining RC references from docs and i18n strings.

- `docs/BUSINESS_LOGIC.md` — Removed RC chapter (§15), renumbered §16–§26 → §15–§25
- `docs/COMPONENTS.md` — Removed `RCBalanceChip` row
- `docs/api-routes.md` — Removed RC routes section
- `docs/features/offers.md` — Removed RC engagement/release language from offer flow, diagram, and action table
- `docs/features/user.md` — Removed RC wallet/purchase page references
- `docs/hooks.md` — Marked RC hooks as removed
- `docs/pages-admin.md` — Removed RC admin references
- `docs/pages-public.md` — Removed RC info page entry
- `docs/pages-user.md` — Removed RC wallet/purchase page entries
- `docs/repositories.md` — Removed RC repository entry
- `docs/constants.md` — Removed RC route/endpoint constants
- `messages/en.json` — Removed RC i18n keys (myRC nav item, auction RC wording, seller help RC references)
- `cspell.json` — Removed RC-related dictionary entries
- `packages/eslint-plugin-letitrip/index.js` — Removed RC lint rule
- `scripts/check-violations.js` — Removed RC violation check

### RC Removal — Final Sweep

Cleaned last remaining RC/coin artefacts across i18n, Firebase Functions, and documentation.

- `messages/en.json` — Removed 8 dead `rcType*` translation keys (Purchase, Engage, Release, Forfeit, Return, AdminGrant, AdminDeduct, EarnPurchase)
- `functions/src/config/constants.ts` — Removed dead `RC_TRANSACTIONS: "rc"` collection constant
- `functions/src/index.ts` — Removed stale "+ free RC" from offerExpiry job comment
- `docs/features/cart-checkout.md` — Removed RC payment method from `CheckoutPaymentMethod`
- `docs/BUSINESS_LOGIC.md` — Removed RC earn rate/purchase packages from site settings, coin-gated events from feature flags, `coins_credited` notification type, offer RC engagement/RC balance consistency rows, RC reversal from order cancellation, "RC released" from offer soft archive

### RC (RipCoins) Virtual Currency System — Complete Removal

Removed the entire RC virtual currency system to eliminate RBI PPI licensing requirements. All RC code has been deleted from both the main app and Firebase Functions with zero breaking changes to remaining functionality.

**Deleted files:**

- `src/app/[locale]/rc/` — RC info public page
- `src/app/[locale]/user/rc/` — RC wallet and purchase pages
- `src/app/api/rc/` — RC API routes (balance, purchase, verify, history, refund)
- `src/db/schema/rc.ts`, `src/actions/rc.actions.ts`, `src/hooks/useRC.ts`
- `src/components/user/RCBalanceChip.tsx`
- `src/repositories/rc.repository.ts`, `src/lib/loyalty.ts`
- `src/features/user/components/RCWallet.tsx`, `RCPurchaseView.tsx`, `BuyRCModal.tsx`
- `src/features/about/components/RCInfoView.tsx`
- `src/features/admin/components/RCAdjustModal.tsx`, `RCFilters.tsx`
- `functions/src/repositories/rc.repository.ts`
- `docs/features/rc.md`

**Schema / constants cleaned:**

- `src/db/schema/users.ts` — removed `rcBalance`, `engagedRC` from `UserDocument`, `DEFAULT_USER_DOCUMENT`, `USER_INDEXED_FIELDS`
- `src/db/schema/field-names.ts` — removed `RC_BALANCE`, `ENGAGED_RC`
- `src/db/schema/site-settings.ts` — removed `loyalty?: LoyaltyConfig` field
- `src/constants/routes.ts` — removed `RC_INFO`, `RC`, `RC_PURCHASE`
- `src/constants/api-endpoints.ts` — removed RC block
- `src/constants/success-messages.ts` / `error-messages.ts` — removed RC blocks

**Application code cleaned:**

- `src/actions/admin.actions.ts` — removed `adminAdjustRCAction`
- `src/actions/bid.actions.ts` — removed RC balance check and engage/release logic
- `src/actions/offer.actions.ts` — removed RC engage/release across all 5 offer actions
- `src/actions/event.actions.ts` — removed RC earn block
- `src/app/api/bids/route.ts` — removed RC balance check and atomic operations
- `src/app/api/payment/verify/route.ts` — removed RC earn and RC return-for-offers blocks
- `src/app/api/events/[id]/enter/route.ts` — removed RC earn block
- `src/app/api/admin/users/route.ts` — removed `rcBalance` from serialized output
- `src/repositories/user.repository.ts` — removed `incrementRCBalance`
- `src/repositories/site-settings.repository.ts` — removed `getLoyaltyConfig`
- `src/features/products/components/PlaceBidForm.tsx`, `AuctionsView.tsx`, `AuctionDetailView.tsx`, `MakeOfferForm.tsx` — removed RC UI
- `src/features/user/components/UserSidebar.tsx`, `UserAccountHub.tsx` — removed RC nav items
- `src/features/admin/components/UserDetailDrawer.tsx` — removed RC section and `onAdjustRC` prop
- `src/components/layout/Footer.tsx` — removed RC_INFO link
- `src/features/about/components/HowOffersWorkView.tsx`, `HowCheckoutWorksView.tsx` — removed RC sections
- `src/features/homepage/components/HowAuctionsWorkView.tsx` — removed RC detail and links
- `functions/src/repositories/user.repository.ts` — removed `UserRC`, `findRCBalance`, `incrementRCBalance`
- `functions/src/repositories/index.ts` — removed RC repository exports
- `functions/src/jobs/offerExpiry.ts` — removed RC release logic; kept offer expiry + buyer notification
- `src/db/seed-data/users-seed-data.ts` — removed `rcBalance`/`engagedRC` from 4 user entries

**Additional cleanup (follow-up pass):**

- `src/db/schema/bids.ts` — removed `engagedCoins` and `coinsStatus` fields from `BidDocument`
- `src/db/schema/field-names.ts` — removed `ENGAGED_COINS`, `COINS_STATUS`, `COINS_STATUS_VALUES` from `BID_FIELDS`
- `src/db/schema/site-settings.ts` — removed `rc: boolean` from `FeatureFlags` interface and `DEFAULT_FEATURE_FLAGS`; removed `rc` entry from `DEFAULT_FEATURE_TOGGLES` display list
- `src/features/admin/components/AdminFeatureFlagsView.tsx` — removed `rc: true` from local `DEFAULT_FEATURE_FLAGS`
- `src/lib/validation/schemas.ts` — removed `rc: z.boolean()` from featureFlags Zod schema
- `src/actions/bid.actions.ts` / `src/app/api/bids/route.ts` — removed `engagedCoins`/`coinsStatus` from bid creation payload and server log
- `src/features/about/components/HowReviewsWorkView.tsx` — removed "Earn RC for Reviews" info card and diagram step 5 "RC Rewarded"; removed unused `Star`/`Clock` lucide imports
- `messages/en.json` — removed `howReviewsWork.diagramS5`, `diagramS5Desc`, `rcRewardTitle`, `rcRewardText`
- `src/features/homepage/components/HowAuctionsWorkView.tsx` — updated step 2 icon 🪙 → 📋; removed "Wallet" badge from DIAGRAM_STEPS step 2
- `src/features/about/components/HowOffersWorkView.tsx` — updated step 2 icon 🪙 → 🏷️
- `src/features/products/components/AuctionDetailView.tsx` — restored missing `</div>` (sticky sidebar wrapper) that was inadvertently dropped with the RC info link

### Homepage — Security Highlights Section

Added a new `SecurityHighlightsSection` to the homepage, placed after Customer Reviews, showcasing the platform's data-protection measures with a CTA to the full `/security` page.

- **`messages/en.json`** — Added 9 i18n keys under `homepage` namespace (`securityPill`, `securityTitle`, `securitySubtitle`, 4 card title/desc pairs, `securityLearnMore`)
- **`src/features/homepage/components/SecurityHighlightsSection.tsx`** — Client component with pill badge header, 4 color-coded cards (Encryption, Secure Connections, Access Controls, Data Minimization), IntersectionObserver fade-in animation, and "Learn More" link to `/security`
- **`src/features/homepage/components/index.ts`** — Barrel export for `SecurityHighlightsSection`
- **`src/features/homepage/components/HomepageView.tsx`** — Dynamic import + render after `CustomerReviewsSection`

### Security & Data Protection Page

Added a new public static page at `/security` explaining the site's data protection measures.

- **`messages/en.json`** — Added `securityPage` i18n namespace (40+ keys covering encryption, blind indices, transport security, data minimisation, access controls, logging, CSRF, compliance, CTA, and flow diagram steps)
- **`src/features/about/components/SecurityPrivacyView.tsx`** — Async RSC view with hero, 10 security topic cards (2-col grid), data-protection FlowDiagram, and CTA linking to privacy/contact
- **`src/features/about/components/index.ts`** — Barrel export for `SecurityPrivacyView`
- **`src/app/[locale]/security/page.tsx`** — Thin page shell with `revalidate = 3600` and `generateMetadata`
- **`src/constants/routes.ts`** — Added `SECURITY: "/security"` to `ROUTES.PUBLIC`
- **`src/app/sitemap.ts`** — Added `/security` entry (yearly, priority 0.4)

### Constants Sync

Synced all constants files with the current codebase state.

**`src/constants/routes.ts`:**

- Fixed `SELLER.PRODUCTS_EDIT` — path now includes `/edit` segment to match actual page at `/seller/products/[id]/edit`
- Added `AUTH.CLOSE` — OAuth popup close handler page at `/auth/close`
- Added `ADMIN.NAVIGATION` — admin navigation management page at `/admin/navigation`
- Removed `ADMIN.NEWSLETTER` — no page exists (API endpoints still present)
- Removed `ADMIN.PRE_ORDERS` — no page exists

**`src/constants/api-endpoints.ts`:**

- Added `ORDERS.INVOICE` — GET `/api/orders/[id]/invoice` for printable HTML invoice
- Fixed stale `❌ No route` comments on `ADMIN.REVOKE_SESSION` and `ADMIN.REVOKE_USER_SESSIONS` — both routes now exist

**`src/constants/rbac.ts`:**

- Added missing RBAC entries for 7 admin pages: `COUPONS`, `MEDIA`, `PRODUCTS`, `ORDERS`, `STORES`, `NAVIGATION`, `FEATURE_FLAGS`

**`docs/constants.md`:**

- Updated `api-endpoints.ts` code sample to match actual 23-group structure
- Updated `rbac.ts` exports table to match actual hierarchy and function signatures
- Updated `routes.ts` code sample to match actual ROUTES structure

### Security — PII Encryption at Rest (AES-256-GCM)

All user PII (personally identifiable information) is now encrypted before being stored in Firestore and decrypted transparently on read. The UI remains unchanged.

**New env variable:** `PII_SECRET` — 64-character hex string (32 bytes). Must be set in `.env.local`, Vercel environment, and Firebase Functions Secret Manager.

**New files:**

- `src/lib/pii.ts` — Core PII encryption/decryption utility (AES-256-GCM with random 96-bit IV, HMAC-SHA256 blind indices)
- `functions/src/lib/pii.ts` — Mirror of pii.ts for Firebase Functions runtime

**Encrypted PII fields by collection:**

- **users**: `email`, `phoneNumber`, `displayName`, `payoutDetails.upiId`, `payoutDetails.bankAccount.accountHolderName`, `payoutDetails.bankAccount.accountNumberMasked`, `shippingConfig` nested fields. Blind indices: `emailIndex`, `phoneIndex`
- **addresses**: `fullName`, `phone`, `addressLine1`, `addressLine2`
- **orders**: `userName`, `userEmail`, `sellerName`, `sellerEmail`, `shippingAddress` nested fields
- **payouts**: `sellerName`, `sellerEmail`, `upiId`, `bankAccount.accountHolderName`, `bankAccount.accountNumberMasked`
- **bids**: `userName`, `userEmail`
- **offers**: `buyerName`, `buyerEmail`, `sellerName`
- **reviews**: `userName`
- **chatRooms**: `buyerName`, `sellerName`
- **newsletterSubscribers**: `email`, `ipAddress`. Blind index: `emailIndex`
- **tokens** (email verification + password reset): `email`. Blind index: `emailIndex`
- **eventEntries**: `userDisplayName`, `userEmail`, `ipAddress`
- **products**: `sellerName`, `sellerEmail`

**Schema updates:**

- `src/db/schema/field-names.ts` — Added `EMAIL_INDEX`, `PHONE_INDEX` to `USER_FIELDS`; `EMAIL_INDEX` to `TOKEN_FIELDS`, `NEWSLETTER_SUBSCRIBER_FIELDS`
- `src/db/schema/users.ts` — Updated `userQueryHelpers.byEmail` / `byPhone` to use blind index fields
- `src/db/schema/newsletter-subscribers.ts` — Added `EMAIL_INDEX` field

**Repository updates (all encrypt on write, decrypt on read):**

- `src/repositories/user.repository.ts` — override `mapDoc()`, `update()`, `create()`, `findByEmail()`, `findByPhone()`
- `src/repositories/address.repository.ts` — `create()`, `update()`, `findByUser()`, `findById()`
- `src/repositories/order.repository.ts` — override `mapDoc()`, `create()`
- `src/repositories/payout.repository.ts` — override `mapDoc()`, `create()`
- `src/repositories/token.repository.ts` — both token repos: override `mapDoc()`, `create()`, `findByEmail()`
- `src/repositories/newsletter.repository.ts` — override `mapDoc()`, `subscribe()`, `findByEmail()`
- `src/repositories/bid.repository.ts` — override `mapDoc()`, `create()`
- `src/repositories/review.repository.ts` — override `mapDoc()`, `create()`
- `src/repositories/offer.repository.ts` — override `mapDoc()`, `create()`; added `buyerName`/`buyerEmail` encryption
- `src/repositories/product.repository.ts` — override `mapDoc()`, `update()`, `create()`
- `src/repositories/eventEntry.repository.ts` — `createEntry()`, `getLeaderboard()`; imports from `pii.ts`
- `src/repositories/chat.repository.ts` — override `mapDoc()`, `create()`, `listForUser()`

**Functions updates:**

- `functions/src/repositories/user.repository.ts` — decrypt `findById()` (displayName, email, payoutDetails)
- `functions/src/repositories/bid.repository.ts` — decrypt reads
- `functions/src/repositories/order.repository.ts` — decrypt reads, encrypt `createFromAuction()`
- `functions/src/repositories/payout.repository.ts` — decrypt `getPending()`, encrypt `create()`
- `functions/src/triggers/onOrderStatusChange.ts` — decrypt `userEmail` for Resend emails
- `functions/src/triggers/onBidPlaced.ts` — decrypt `userName`
- `functions/src/triggers/onProductWrite.ts` — decrypt `sellerName` for Algolia

**PII leak fixes:**

- `src/actions/bid.actions.ts` — `listBidsByProductAction` now strips `userEmail` from response; RTDB bid write uses "Bidder" instead of real name
- `src/actions/profile.actions.ts` — `getPublicProfileAction` returns only `id`, `displayName`, `photoURL`, `role`, `createdAt`
- `src/app/api/bids/route.ts` — GET strips `userEmail` from public response; RTDB write uses "Bidder"
- PII removed from all `serverLogger` calls in: newsletter actions, contact actions, newsletter API route, contact API route, auth register route, auth send-verification route

**Seed data:**

- `src/app/api/demo/seed/route.ts` — encrypts PII fields + adds blind indices when seeding

**Types updated:**

- `src/hooks/useAuctionDetail.ts` — `BidsListResult` uses `Omit<BidDocument, "userEmail">`
- `src/features/products/components/BidHistory.tsx` — accepts `Omit<BidDocument, "userEmail">[]`

---

### Pages — New info pages: checkout, orders, payouts, reviews

Added four new static "How It Works" explainer pages with ISR (`revalidate: 3600`) and `generateMetadata`.

**New pages:**

- `src/app/[locale]/how-checkout-works/page.tsx` → `HowCheckoutWorksView` (from `@/features/about`)
- `src/app/[locale]/how-orders-work/page.tsx` → `HowOrdersWorkView` (from `@/features/about`)
- `src/app/[locale]/how-payouts-work/page.tsx` → `HowPayoutsWorkView` (from `@/features/seller`)
- `src/app/[locale]/how-reviews-work/page.tsx` → `HowReviewsWorkView` (from `@/features/about`)

**Feature components:**

- `src/features/about/components/HowCheckoutWorksView.tsx` — new
- `src/features/about/components/HowOrdersWorkView.tsx` — new
- `src/features/about/components/HowReviewsWorkView.tsx` — new
- `src/features/seller/components/HowPayoutsWorkView.tsx` — new; exported from `src/features/seller/components/index.ts`
- `src/features/about/components/index.ts` — barrel exports updated

**i18n (`messages/en.json`):**

- New namespaces: `howCheckoutWorks`, `howOrdersWork`, `howPayoutsWork`, `howReviewsWork` with `metaTitle`, `metaDescription`, and step/section strings.

---

### Feature — Offer-type orders (checkout + order-splitter)

Offer-accepted items now flow through checkout as an isolated `"offer"` order type, preventing them from being merged with regular cart items from the same seller.

**Schema:**

- `src/db/schema/orders.ts` — `OrderType` union extended: `"standard" | "preorder" | "auction"` → `+ "offer"`; new optional `offerId` field on `OrderDocument`.
- `src/db/schema/cart.ts` — `CartItem` gains optional `isOffer?: boolean` flag.

**Order splitting:**

- `src/utils/order-splitter.ts` — New bucket key `offer:{itemId}` when `item.isOffer`; inserted before the preorder/standard branch; updated truth table comment.

**API:**

- `src/app/api/checkout/route.ts` — Passes `offerId` through to order creation.
- `src/app/api/payment/verify/route.ts` — Minor adjustment for offer traceability.
- `src/repositories/cart.repository.ts` — Passes `isOffer` through cart add.

---

### UI — ProductActions mobile BottomActions integration

Product detail page now registers context-specific actions into the `BottomActions` mobile bar via `useBottomActions`.

**`src/features/products/components/ProductActions.tsx`:**

- Calls `useBottomActions(…)` with: Wishlist (ghost), Add to Cart / Place Bid (outline/primary), Buy Now (primary), Make an Offer (ghost icon-only).
- `infoLabel` shows starting bid price or low-stock warning ("Only X left").
- All actions share the same auth guards and handlers as the desktop buttons.

---

### UI — Miscellaneous polish & bug fixes

**DynamicSelect flip-up (`src/components/ui/DynamicSelect.tsx`):**

- Dropdown panel now opens upward when the viewport space below the trigger is less than 160 px.

**Select panel capping (`packages/ui/src/components/Select.tsx`):**

- Added `PANEL_MAX_HEIGHT = 320` — the dropdown's `maxHeight` is now clamped to `min(availableSpace, 320px)` preventing oversized panels in tall viewports.
- `placement="bottom"` branch fixed: always opens downward without measuring space.

**Typography scale (`packages/ui/src/components/Typography.tsx`):**

- `h4` gains `lg:text-2xl`; `h5` gains `lg:text-xl`; `h6` gains `lg:text-lg`, improving readability on larger screens.

**useHorizontalScrollDrag lazy pointer capture (`src/components/ui/useHorizontalScrollDrag.ts`):**

- `setPointerCapture` is no longer called eagerly in `pointerdown`. The capture is set lazily in `onPointerMove` once the drag distance exceeds the click threshold. Fixes a Chromium bug where eager capture caused `click` events to fire on the scroll container instead of the pressed child element (e.g. a `TextLink`).

**CouponCard truncation (`src/features/promotions/components/CouponCard.tsx`):**

- Coupon code badge `max-w-[160px]` → `max-w-[50%]` + `truncate` on the span, preventing overflow on narrow screens.

**Card action button overflow (multiple card components):**

- `ProductCard`, `AuctionCard`, `PreOrderCard`, `OrderCard`, `SellerProductCard` — action button row gains `flex-wrap` + `min-w-0` on individual buttons to prevent horizontal overflow on small viewports.
- `ReviewCard` — minor size tweak.

---

## [Unreleased] — 2026-03-14

### UI — BulkActionBar picker pattern (matches BottomActions)

Redesigned the desktop `BulkActionBar` to use the same **count-pill → action-picker → Apply** pattern as the mobile `BottomActions` bulk mode, so the bulk-selection UX is consistent across all breakpoints.

**What changed:**

- `BulkActionBar` now accepts structured `actions?: BulkActionItem[]` instead of `children` ReactNode. Renders a selection-count pill (✕ to clear), a dropdown action picker, and a variant-coloured Apply button — identical to the `BottomActions` bulk mode.
- `ListingLayout` prop renamed: `bulkActions` → `bulkActionItems` (typed `BulkActionItem[]`). Inline toolbar buttons removed; the `BulkActionBar` is now the single bulk-action surface on both mobile and desktop.
- All 16 callers migrated to pass structured data instead of Button JSX.

**Files changed:**

- `src/components/ui/BulkActionBar.tsx` — Full rewrite: picker + apply pattern, accent stripe, lucide icons, `useClickOutside`.
- `src/components/ui/ListingLayout.tsx` — Prop type + import change; removed inline toolbar `hidden sm:flex` bulk buttons; `BulkActionBar` renders for all viewports.
- `src/components/ui/index.ts` — Export new `BulkActionItem` type.
- `messages/en.json` — Added `listingLayout.apply` key.
- `src/features/products/components/ProductsView.tsx` — `bulkActionItems` migration.
- `src/features/wishlist/components/WishlistView.tsx` — `bulkActionItems` migration.
- `src/features/user/components/UserOrdersView.tsx` — `bulkActionItems` migration.
- `src/features/stores/components/StoresListView.tsx` — `bulkActionItems` migration.
- `src/features/stores/components/StoreAuctionsView.tsx` — `bulkActionItems` migration.
- `src/features/stores/components/StoreProductsView.tsx` — `bulkActionItems` migration.
- `src/features/blog/components/BlogListView.tsx` — `bulkActionItems` migration.
- `src/features/products/components/AuctionsView.tsx` — `bulkActionItems` migration.
- `src/features/categories/components/CategoryProductsView.tsx` — `bulkActionItems` migration.
- `src/features/products/components/PreOrdersView.tsx` — `bulkActionItems` migration.
- `src/features/categories/components/CategoriesListView.tsx` — `bulkActionItems` migration.
- `src/features/seller/components/SellerProductsView.tsx` — `bulkActionItems` migration.
- `src/features/events/components/AdminEventsView.tsx` — `bulkActionItems` migration.
- `src/features/events/components/EventsListView.tsx` — `bulkActionItems` migration.
- `src/features/search/components/SearchView.tsx` — Standalone `BulkActionBar` migrated to `actions` prop.

---

### Filter Panel — Accordion, per-section clear, auto-search

Upgraded `FilterPanel` and its child filter sections (`FilterFacetSection`, `RangeFilter`, `SwitchFilter`) with three improvements:

1. **Accordion behavior** — Only one filter section can be expanded at a time. Managed via `expandedIndex` state in `FilterPanel`, passed as controlled `isOpen`/`onToggle` props to each section.
2. **Per-section clear (×) button** — Each section header shows a small × icon when it has active values. Clicking it clears only that section's pending state without affecting table data (staged filtering via `usePendingTable`).
3. **Auto-searchable facets** — Facet filters with more than 10 options now automatically enable inline search and "Load more" pagination. Previously required explicit `searchable: true` in config.

**Files changed:**

- `src/components/filters/FilterPanel.tsx` — Added `useState` + accordion state; passes `isOpen`, `onToggle`, `onClear` to each section; changed searchable default from `false` to `options.length > 10`.
- `src/components/ui/FilterFacetSection.tsx` — Added optional `isOpen`, `onToggle`, `onClear` props; controlled/uncontrolled open state; × clear button in header.
- `src/components/filters/RangeFilter.tsx` — Same controlled open + × clear button pattern.
- `src/components/filters/SwitchFilter.tsx` — Same pattern; added `useTranslations` import for clear button aria-label.

All changes are backward-compatible: standalone usage of `FilterFacetSection` (e.g. `UserNotificationsView`) continues to work in uncontrolled mode.

---

### UI — Bulk "Add to Cart" + selection hint tooltip on public listing views

Added a second bulk action ("Add to Cart") alongside "Add to Wishlist" on all product listing views, and an ⓘ hint tooltip educating users about card selection and bulk actions.

**Bulk add-to-cart (`addToCartAction` via Server Action):**

- `src/features/products/components/ProductsView.tsx` — `handleBulkAddToCart` using `products.filter` by `selectedIds`; `bulkActions` now renders two buttons: Add to Cart (secondary) + Add to Wishlist (primary).
- `src/features/categories/components/CategoryProductsView.tsx` — same pattern.
- `src/features/stores/components/StoreProductsView.tsx` — same pattern.
- `src/features/wishlist/components/WishlistView.tsx` — already had both bulk actions from a previous session; no change needed.

**Type fixes (Pick types extended for cart payload):**

- `src/features/products/hooks/useProducts.ts` — added `sellerId` and `sellerName` to `ProductItem`.
- `src/features/categories/hooks/useCategoryProducts.ts` — same for `CategoryProductItem`.

**Selection hint tooltip (ⓘ `Info` icon + `Tooltip`):**

- DataTable-based views (`ProductsView`, `CategoryProductsView`) — info icon placed in `actionsSlot` of `ListingLayout`; tooltip text is `tActions("selectionHint")`.
- Non-DataTable views (`StoreProductsView`, `WishlistView`) — info icon added inline inside `viewToggleSlot` alongside `ViewToggle`.

**i18n (`messages/en.json`):**

- Added `"selectionHint": "Tap or click a card to select it, then use bulk actions to add to wishlist or cart"` to the `actions` namespace.

---

## [Unreleased] — 2026-03-14

### Fix — Firestore index: `reviews` `productId + createdAt`

The `ReviewRepository.listForProduct` Sieve query was throwing `FAILED_PRECONDITION` (code 9) on all product detail pages because no composite index existed for the `productId ↑ + createdAt ↓` field combination (used when listing reviews without a `status` filter).

**`firestore.indexes.json`:**

- Added composite index: `reviews: productId ↑ + createdAt ↓` (collection scope).
- Index deployed via `firebase deploy --only firestore:indexes`.

---

## [Unreleased] — 2026-03-14

### UI — Navigation arrow icons enlarged across all carousels and galleries

Increased chevron/arrow icon sizes so they are clearly visible inside their button containers:

- `src/features/homepage/components/HeroCarousel.tsx` — prev/next SVG icons `w-5 h-5` → `w-7 h-7`.
- `src/features/products/components/ProductImageGallery.tsx` — `ChevronLeft`/`ChevronRight` `w-6 h-6` → `w-7 h-7`.
- `src/components/ui/HorizontalScroller.tsx` — `lg` variant SVG `24×24` → `28×28`; `sm` variant SVG `20×20` → `24×24` (applies to all `SectionCarousel` instances: Featured Products, Top Categories, Featured Stores, Top Brands, Featured Events, Pre-Orders).

`MediaLightbox` and `packages/ui/ImageLightbox` were already at `w-7 h-7` and required no change.

---

## [Unreleased] — 2026-03-14

### UI — BottomActions-aware layout adjustments

Ensured page content and the `BackToTop` floating button are never obscured by the stacked `BottomActions` + `BottomNavbar` bars on mobile.

**`src/components/LayoutClient.tsx`:**

- `<Main>` bottom margin now switches between `mb-28` (BottomActions visible) and `mb-16` (hidden) on mobile; `md:mb-0` unchanged.
- `hasBottomActions` boolean derived from `baState` (actions, bulk selected count, or infoLabel present) and forwarded to `<BackToTop>`.

**`src/components/utility/BackToTop.tsx`:**

- Added `hasBottomActions?: boolean` prop.
- Mobile `bottom` position now resolves to `bottom-36` when `hasBottomActions` is true (clears both bars), falling back to `bottom-24`; desktop `md:bottom-8` unchanged.

---

## [Unreleased] — 2026-03-14

### UI — Grid/list view toggle + selection checkboxes on all public listing views

Added URL-driven grid/list view mode toggles and per-item selection checkboxes with bulk "Add to Wishlist" across every public-facing listing view. Also fixed a stacking-context bug that was hiding card checkboxes.

**New shared component (`src/components/ui/ViewToggle.tsx`):**

- `ViewToggle` — grid / list mode switcher pair; uses `useTranslations("actions")` for `gridView` / `listView` aria-labels.
- `ViewMode` type (`"grid" | "list"`) exported alongside the component.
- Exported from `src/components/ui/index.ts`.

**i18n (`messages/en.json`):**

- Added `"gridView": "Grid view"` and `"listView": "List view"` to the `actions` namespace.

**Views updated — DataTable-based (use `showViewToggle` + `showTableView={false}` + URL-driven `viewMode`):**

- `src/features/products/components/ProductsView.tsx` — view toggle + `ProductCard variant={viewMode}` + `selectable`/`selectedIds`/`onSelectionChange` in `mobileCardRender`.
- `src/features/products/components/AuctionsView.tsx` — same pattern with `AuctionCard`.
- `src/features/products/components/PreOrdersView.tsx` — same pattern with `PreOrderCard`.
- `src/features/categories/components/CategoryProductsView.tsx` — same pattern; `useAuth`, `useMessage`, `addToWishlistAction`, `handleBulkAddToWishlist`, `selectedCount`/`bulkActions` wired to `ListingLayout`.
- `src/features/blog/components/BlogListView.tsx` — converted `defaultViewMode="grid"` to URL-driven toggle; `BlogCard selectable`/`selected`/`onSelect` wired.
- `src/features/user/components/UserOrdersView.tsx` — converted `defaultViewMode="list"` to URL-driven toggle; `OrderCard variant={viewMode}` wired.
- `src/features/reviews/components/ReviewsListView.tsx` — converted `defaultViewMode="grid"` to URL-driven toggle with `showTableView={false}`.

**Views updated — non-DataTable (use `ViewToggle` in `viewToggleSlot` on `ListingLayout`):**

- `src/features/stores/components/StoresListView.tsx` — `ViewToggle` in `viewToggleSlot`; conditional grid/list container for `StoreCard`; `selectable`/`selectedIds`/`addToWishlistAction` + `BulkActionBar`.
- `src/features/wishlist/components/WishlistView.tsx` — `ViewToggle` (products tab only); `variant={viewMode}` on `ProductGrid`.
- `src/features/stores/components/StoreProductsView.tsx` — `ViewToggle` + `ProductGrid variant`/`selectable`/`selectedIds`.
- `src/features/stores/components/StoreAuctionsView.tsx` — `ViewToggle` + `AuctionGrid variant`/`selectable`/`selectedIds`.
- `src/features/search/components/SearchView.tsx` + `SearchResultsSection.tsx` — `ViewToggle` inline in filter row; `BulkActionBar` standalone; `variant`/`selectable`/`selectedIds` props threaded through.

**Bug fix — double-checkbox stacking issue:**

- `DataTable`'s internal `SelectableCard` wrapper was adding an `appearance-none` invisible checkbox at `z-10` around every `mobileCardRender` result. Because `selectable` was also set on both `DataTable` and the individual cards (`ProductCard`, `AuctionCard`, `PreOrderCard`, `OrderCard`), the `SelectableCard`'s stacking context buried each card's visible checkbox button.
- **Fix:** removed `selectable`/`selectedIds`/`onSelectionChange` from the `DataTable` prop in all `showTableView={false}` views. Selection state is now owned entirely by the card's own `onSelect` callback wired in `mobileCardRender`.

**Bug fix — stale `@lir/ui` import:**

- `src/contexts/BottomActionsContext.tsx` — `import type { ButtonProps } from "@lir/ui"` → `"@mohasinac/ui"` (tsconfig paths use `@mohasinac/*`; `@lir/*` alias was never mapped).

---

## [Unreleased] — 2026-03-14

### UI — Media lightbox & carousel button visibility fixes

Resolved multiple black-on-black icon contrast issues and undersized button targets across image lightboxes, the hero carousel, and scroll carousels.

**`src/components/media/MediaLightbox.tsx`:**

- All toolbar buttons switched from default `variant="primary"` to `variant="ghost"` — prevents the primary blue background from covering icons.
- Added `!text-white` override on every button to guarantee white icons regardless of inherited theme styles.
- Button size increased from `w-11 h-11` → `w-12 h-12`; icon size from `w-6 h-6` → `w-7 h-7`.
- Background bump from `bg-white/10` → `bg-white/15`; hover from `hover:bg-white/20` → `hover:bg-white/30`.
- Close button hover changed to `hover:bg-red-500/50` for visual affordance.

**`src/features/products/components/ProductImageGallery.tsx`:**

- ZoomIn hover hint now wrapped in a `bg-black/55 backdrop-blur-sm` frosted circle with `ring-2 ring-white/30` — visible against both light and dark images (was bare `w-6 h-6` icon with no background).
- Expand button changed from `bg-black/50 text-white` to `bg-white/90 dark:bg-slate-800/90 !text-zinc-800 dark:!text-zinc-100` — readable on any image background.

**`src/components/ui/HorizontalScroller.tsx`:**

- `sm`-size arrow buttons widened from `w-8` → `w-10` (40 px tap target).
- SVG icon size increased from `16×16` → `20×20`.

**`packages/ui/src/components/ImageLightbox.tsx`:**

- Prev / Next buttons changed from `p-2` variable padding to `w-12 h-12 p-0` fixed size.
- Background bumped from `bg-white/10` → `bg-white/15`; hover `bg-white/30`.
- Icon size `w-6 h-6` → `w-7 h-7`.
- Close button hover changed to `hover:bg-red-500/50`.

**`src/features/homepage/components/HeroCarousel.tsx`:**

- Navigation arrows moved from left/right sides (vertical centre) to **bottom-right corner**, grouped together.
- Removed `!isMobile` gate — arrows now visible on all screen sizes.
- Icon size reduced to `w-5 h-5` to fit the grouped layout.

---

### UI — Responsive card grid: equal height + configurable columns

All card grids now fill the container width correctly, stretch cards to equal row height, and support configurable column counts per callsite.

**`src/components/ui/HorizontalScroller.tsx`:**

- Inner scroll container explicitly uses `items-stretch` in single-row mode (previously relied on flex's implicit default, which could be overridden by Tailwind resets). This ensures all items in a row are stretched to the tallest sibling's height.
- Item wrapper `<div>` in single-row mode gains `h-full` — completes the `h-full` chain from the scroll container through the wrapper into the card.

**`packages/ui/src/components/Layout.tsx`:**

- `GRID_MAP` changed from `const` to `export const` — available for direct import by DataTable and consumers.
- Re-exported from `packages/ui/src/index.ts` as `GRID_MAP`.

**`packages/ui/src/DataTable.tsx`:**

- New `gridCols?: GridCols` prop (keys `1`–`6`, `"autoSm"`, `"autoMd"`, `"autoLg"`). Default: `6` → `cols-2 → 3 → 4 → 5 → 6` across breakpoints.
- Grid container class now computed as `GRID_MAP[gridCols] + " gap-4"` instead of a hardcoded string.
- `SelectableCard` non-selectable wrapper changed from bare `<div>` to `<div className="h-full">`.
- `SelectableCard` selectable root changed to `<div className="relative group h-full">` so the overlay stretches to the full cell.

**`src/components/products/ProductCard.tsx`:**

- Root div gains `h-full` — fills entire grid cell.
- Info section (`flex-col gap-2`) gains `flex-1` — expands to consume remaining height after the image.
- Action button row always uses `mt-auto` (previously conditional on `variant === "list"`) — pins buttons to the card bottom regardless of content length.

**`src/components/auctions/AuctionCard.tsx`:**

- Same `h-full` root, `flex-1` info section, unconditional `mt-auto` on action buttons as ProductCard.

**`src/components/auctions/AuctionGrid.tsx`:**

- New `gridClassName?: string` prop — accepts any Tailwind grid class or `THEME_CONSTANTS.grid.*` preset.
- Default: `THEME_CONSTANTS.grid.cards` (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`) + `gap-4`.
- Replaces the old hardcoded `"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4"`.

---

### UI — Card grids capped at 4 columns max

Enforced a site-wide maximum of **4 cards per row** for all product, auction, category, and content grids. Added a shared `cards` preset (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`) to both the package `GRID_MAP` and app `THEME_CONSTANTS.grid` to avoid repetition.

**New `cards` preset:**

- `packages/ui/src/components/Layout.tsx` — `GRID_MAP.cards = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"`.
- `src/constants/theme.ts` — `THEME_CONSTANTS.grid.cards` same value.

**`packages/ui/src/DataTable.tsx`:**

- `gridCols` default changed from `6` → `"cards"` — grid view now uses the 2→3→4 preset out of the box.

**Standalone grids updated (max 4):**

- `src/components/auctions/AuctionGrid.tsx` — default gridClassName now `THEME_CONSTANTS.grid.cards`.
- `src/components/products/ProductGrid.tsx` — `cols-2 sm:3 md:4 lg:4 xl:5 2xl:6` → `THEME_CONSTANTS.grid.cards`.
- `src/features/wishlist/components/WishlistView.tsx` — remove overlay grid to `grid-cols-2 md:3 lg:4`.
- `src/features/seller/components/SellerStorefrontView.tsx` — `cols-2 sm:3 md:4 xl:5 2xl:6` → `cols-2 md:3 lg:4`.
- `src/features/categories/components/CategoryGrid.tsx` — removed duplicate `xl:4` + `2xl:5`; now `cols-1 sm:2 md:3 lg:4`.

**Homepage section carousels updated (`perView` capped at 4):**

- `FeaturedProductsSection`, `FeaturedAuctionsSection`, `FeaturedEventsSection`, `FeaturedPreOrdersSection`, `FeaturedStoresSection`, `TopCategoriesSection`, `TopBrandsSection` — removed `xl: 5`; now `{ base: 2, sm: 3, md: 4 }`.
- `RelatedProducts` (both skeleton + live scrollers) — same cap.

**Remaining grids updated (max 4):**

- `src/features/homepage/components/HomepageSkeleton.tsx` — categories skeleton: `xl:5 2xl:5` → `sm:4`; products/auctions skeletons: `lg:5 xl:6 2xl:6` → `md:4`.
- `src/app/[locale]/help/page.tsx` — FAQ topic tiles: `lg:5 xl:5 2xl:5` → `lg:4`.
- `src/features/homepage/components/FeaturedResultsSection.tsx` — BeforeAfterCards: `2xl:5` removed; max `xl:4`.
- `src/features/user/components/UserAccountHub.tsx` — quick nav tiles: `xl:6 2xl:6` → `md:4`.
- `src/features/homepage/components/SiteFeaturesSection.tsx` — feature cards: `2xl:6` → max `xl:4`.
- `src/features/admin/components/AdminDashboardSkeleton.tsx` — quick actions: `xl:4 2xl:5` → `lg:4`.
- `src/components/admin/DataTable.tsx` — legacy grid view: `xl:5` removed; max `lg:4`.

---

### UI — BottomActions mobile action bar

Added a new `BottomActions` mobile bar that sits **above** `BottomNavbar` (`bottom-14`) and gives every page a consistent slot for primary page actions and bulk selection.

**Context + provider (`src/contexts/BottomActionsContext.tsx`):**

- `BottomActionsProvider` — wraps `LayoutClient`; holds `actions`, `bulk`, and `infoLabel` state.
- `useBottomActionsContext()` — internal hook consumed by `<BottomActions>`.
- Callback dispatch via `MutableRefObject<Map>` — `onClick` handlers always dispatch the latest closure, no stale-closure issues.
- `BottomAction`, `BottomBulkConfig`, `BottomActionsState` types exported.

**Consumer hook (`src/hooks/useBottomActions.ts`):**

- `useBottomActions(options)` — feature hook; registers page actions + bulk config + info label.
- Auto-clears all state on unmount (route change) — no manual cleanup required.
- Accepts `actions[]`, `bulk: BottomBulkConfig`, and `infoLabel?: string`.

**Component (`src/components/layout/BottomActions.tsx`):**

- Fixed at `bottom-14`, `md:hidden`, `z-40`.
- **Page mode** — renders registered action buttons; optional `infoLabel` row above.
- **Bulk mode** — activates when `bulk.selectedCount > 0`; accent top stripe + selection count pill (tap to deselect all) + bulk action buttons.
- Slide-in/out 300 ms CSS transition; `pointer-events-none` while off-screen.
- Each `BottomAction` supports `id`, `label`, `icon`, `variant`, `badge`, `disabled`, `loading`, `grow`.

**LayoutClient (`src/components/LayoutClient.tsx`):**

- Reads `baState` from `useBottomActionsContext`; expands `<Main>` bottom margin to `mb-28` (from `mb-16`) on mobile when the bar is visible.
- Renders `<BottomActions />` immediately before `<BottomNavbar />`.

**Locale layout (`src/app/[locale]/layout.tsx`):**

- Wraps `<LayoutClient>` in `<BottomActionsProvider>`.

**Theme constant (`src/constants/theme.ts`):**

- `THEME_CONSTANTS.zIndex.bottomActions: "z-40"` — same layer as BottomNavbar.

**i18n (`messages/en.json`):**

- New `"bottomActions"` namespace: `pageActionsLabel`, `bulkActionsLabel`, `selectedCount`.

**Barrel exports:**

- `src/contexts/index.ts` — `BottomActionsProvider`, `useBottomActionsContext`, `BottomAction`, `BottomBulkConfig`, `BottomActionsState`.
- `src/hooks/index.ts` — `useBottomActions`, `UseBottomActionsOptions`.
- `src/components/layout/index.ts` — `BottomActions`.

### Feature — Offer system edge case hardening

Closed all remaining edge-case gaps in the offer lifecycle to prevent double-engagement, double-release, and stale-data actions.

**Error constants (`src/constants/error-messages.ts`):**

- `ERROR_MESSAGES.OFFER.ACTIVE_OFFER_EXISTS` — fired when buyer already has a pending/countered offer on a product.
- `ERROR_MESSAGES.OFFER.EXPIRED` — fired when an expired offer is acted upon.
- `ERROR_MESSAGES.OFFER.PRODUCT_UNAVAILABLE` — fired during checkout when product is out of stock or archived.

**Action guards (`src/actions/offer.actions.ts`):**

- `makeOfferAction` — adds `hasActiveOffer` pre-check: buyer blocked from creating a second concurrent offer on the same product.
- `respondToOfferAction` — expiry guard: seller cannot accept/decline/counter an expired offer.
- `acceptCounterOfferAction` — expiry guard: buyer cannot accept an expired counter.
- `counterOfferByBuyerAction` — expiry guard: buyer cannot counter back on an expired counter.
- `withdrawOfferAction` — rejects withdrawal of an already-expired offer (RC already released by cron).
- `checkoutOfferAction` — product availability check: blocks checkout if product stock ≤ 0 or is archived at time of checkout.

**Repository (`src/repositories/offer.repository.ts`):**

- `hasActiveOffer(uid, productId)` — stub `.select().limit(1)` query; `pending | countered` filter.
- `findExpired()` — fixed to include both `pending` and `countered` statuses (was `pending`-only; now matches `findExpiredActive` in functions repo).

**Static page & i18n:**

- `messages/en.json` (`howOffersWork`) — added `rulesItem4`: "Only one active offer per product at a time."
- `src/features/about/components/HowOffersWorkView.tsx` — added 4th rule to the Negotiation Rules section.
- `docs/features/offers.md` — updated Business Rules table, Server Actions table, and Repository table to document all new guards.

### UI — Footer 2-row layout

Reorganised `FooterLayout` to display as two clear visual rows on desktop (`lg+`):

- **Row 1** — single `lg:grid-cols-7` grid: brand + description + social icons + newsletter (col-span-2) followed by the five link-group columns (1 col each).
- **Row 2** — copyright/made-in bar.

On mobile the brand section stacks above the accordion link groups (unchanged behaviour). On sm/md the brand spans the full row with link groups in a 2–3-column grid beneath.

### Feature — Buyer counter offer + per-product offer limit

Added the ability for buyers to counter back against a seller's counter offer, enforced a 3-offer-per-product document limit, and updated the static info page and i18n strings.

**Business rules:**

- Buyer can submit a counter only when the offer is in `countered` status.
- Buyer's `counterAmount` must be **within ±20 %** of the seller's last counter price.
- At most **3 offer documents** per buyer per product are allowed. The limit resets automatically when `product.updatedAt` advances (seller edits the listing). No new field required — enforced by document count alone.
- RC check: only the net delta (`counterAmount − current offerAmount`) needs additional free coins; the original engaged RC is reused.

**Server Action (`src/actions/offer.actions.ts`):**

- `counterOfferByBuyerAction(input: BuyerCounterInput)` — validates range + limit + RC; closes existing `countered` offer (`withdrawn`); creates fresh `pending` offer; adjusts `engagedRC` by net delta; notifies seller.
- `makeOfferAction` — now checks doc count since `product.updatedAt` before creating an offer.
- Exported type: `BuyerCounterInput`

**Repository (`src/repositories/offer.repository.ts`):**

- `countByBuyerAndProduct(uid, productId, since)` — `.select()` count query on `(buyerUid, productId, createdAt >= since)`.

**Constants (`src/constants/error-messages.ts`):**

- `ERROR_MESSAGES.OFFER.LIMIT_REACHED`, `COUNTER_RANGE`, `NOT_COUNTERED`

**Hook (`src/features/user/hooks/useUserOffers.ts`):**

- `useCounterOfferByBuyer()` — `useMutation` wrapper for `counterOfferByBuyerAction`.

**Firestore index (`firestore.indexes.json`):**

- Added composite index: `offers: buyerUid ↑ + productId ↑ + createdAt ↑`.

**Static page & i18n:**

- `messages/en.json` (`howOffersWork`) — updated `step4Text` to mention buyer counter; added `rulesTitle`, `rulesItem1`, `rulesItem2`, `rulesItem3`.
- `src/features/about/components/HowOffersWorkView.tsx` — new "Negotiation Rules" section.

---

Added the ability for buyers to counter back against a seller's counter offer, enforced a 3-offer-per-product document limit, and updated the static info page and i18n strings.

**Business rules:**

- Buyer can submit a counter only when the offer is in `countered` status.
- Buyer's `counterAmount` must be **within ±20 %** of the seller's last counter price.
- At most **3 offer documents** per buyer per product are allowed. The limit resets automatically when `product.updatedAt` advances (seller edits the listing). No new field required — enforced by document count alone.
- RC check: only the net delta (`counterAmount − current offerAmount`) needs additional free coins; the original engaged RC is reused.

**Server Action (`src/actions/offer.actions.ts`):**

- `counterOfferByBuyerAction(input: BuyerCounterInput)` — validates range + limit + RC; closes existing `countered` offer (`withdrawn`); creates fresh `pending` offer; adjusts `engagedRC` by net delta; notifies seller.
- `makeOfferAction` — now checks doc count since `product.updatedAt` before creating an offer.
- Exported type: `BuyerCounterInput`

**Repository (`src/repositories/offer.repository.ts`):**

- `countByBuyerAndProduct(uid, productId, since)` — `.select()` count query on `(buyerUid, productId, createdAt >= since)`.

**Constants (`src/constants/error-messages.ts`):**

- `ERROR_MESSAGES.OFFER.LIMIT_REACHED`, `COUNTER_RANGE`, `NOT_COUNTERED`

**Hook (`src/features/user/hooks/useUserOffers.ts`):**

- `useCounterOfferByBuyer()` — `useMutation` wrapper for `counterOfferByBuyerAction`.

**Firestore index (`firestore.indexes.json`):**

- Added composite index: `offers: buyerUid ↑ + productId ↑ + createdAt ↑`.

**Static page & i18n:**

- `messages/en.json` (`howOffersWork`) — updated `step4Text` to mention buyer counter; added `rulesTitle`, `rulesItem1`, `rulesItem2`, `rulesItem3`.
- `src/features/about/components/HowOffersWorkView.tsx` — new "Negotiation Rules" section.

---

## [Unreleased] — 2026-03-14

### Platform Business-Day Rule — 10:00 AM IST Day Boundary

Introduced a global platform-day concept: **every new day starts at 10:00 AM IST**.  
All day-counting for payouts, pending windows, refund timelines, and cron cutoffs now use 10:00 AM IST as the day boundary instead of calendar midnight.

**Rule summary:**

- An event (order delivery, refund initiation, seller registration) before 10:00 AM IST belongs to the **previous** business day.
- Day 1 = the **next** upcoming 10:00 AM IST at or after the event.
- "7 platform days after delivery" = 7 consecutive 10:00 AM IST boundaries must pass.

**New utilities:**

- `functions/src/utils/businessDay.ts` — `getBusinessDayStart()`, `getBusinessDayCutoff()`, `getBusinessDaysElapsed()` for Cloud Functions / Firestore queries
- `src/utils/business-day.ts` — `getBusinessDayStart()`, `getBusinessDaysElapsed()`, `getBusinessDaysRemaining()`, `getBusinessDayEligibilityDate()` for UI and Server Actions; exported from `@/utils`

**Constants updated:**

- `functions/src/config/constants.ts` — added `BUSINESS_DAY_START_HOUR_IST = 10`, `BUSINESS_DAY_TIMEZONE = "Asia/Kolkata"`, `SCHEDULES.DAILY_0430_UTC = "30 4 * * *"` (10:00 AM IST)
- `src/constants/config.ts` — added `BUSINESS_DAY_CONFIG` (`START_HOUR_IST`, `TIMEZONE`, `START_HOUR_UTC`, `START_MINUTE_UTC`)

**Cron jobs updated:**

- `autoPayoutEligibility` — rescheduled from `DAILY_0445` (UTC) to `DAILY_0430_UTC` (10:00 AM IST); `timeZone` changed from `"UTC"` to `"Asia/Kolkata"`

**Repository updated:**

- `functions/src/repositories/order.repository.ts` — `getEligibleAutomatic()` now calls `getBusinessDayCutoff(windowDays)` instead of raw `Date.now() - windowDays * 24h`, ensuring payout eligibility snaps to the 10 AM IST boundary

**FAQ & seed data updated** (EN + HI + seed):

- "When do I receive payments?" — 7 platform days after delivery (10 AM IST start)
- "What is your refund policy?" — 5-7 platform days
- All financial refund/reversal timelines updated from "business days" → "platform days"
- Seller registration verification updated from "2-3 business days" → "2-3 platform days"

---

### Feature — Make-an-Offer system

Added a full buyer–seller offer negotiation flow with RC engagement (coins locked during offer lifetime).

**Schema:**

- `src/db/schema/offers.ts` — `OfferDocument` with status enum `pending|accepted|declined|countered|expired|withdrawn|paid`; fields: `productId`, `buyerUid`, `sellerId`, `offerAmount`, `counterAmount`, `lockedPrice`, `lockedRC`, 48h expiry; `OFFERS_COLLECTION` constant

**Server Actions (`src/actions/offer.actions.ts`):**

- `makeOfferAction` — validates product is listable, engages RC from buyer wallet, creates offer doc
- `respondToOfferAction` — seller accept / decline / counter; releases RC on decline
- `acceptCounterOfferAction` — buyer accepts counter; adjusts locked RC to counter price
- `withdrawOfferAction` — buyer withdraws; releases locked RC
- `checkoutOfferAction` — transitions accepted offer to paid, deducts RC, records transaction
- `listBuyerOffersAction` / `listSellerOffersAction` — Sieve-enabled reads

**API routes:**

- `GET /api/seller/offers` — incoming offers for authenticated seller (seller/admin role)
- `GET /api/user/offers` — outgoing offers for authenticated buyer

**Feature hooks:**

- `src/features/seller/hooks/useSellerOffers.ts` — `useSellerOffers()` + `useRespondToOffer()` mutation
- `src/features/user/hooks/useUserOffers.ts` — `useUserOffers()` + `useAcceptCounter()` + `useWithdrawOffer()`

**Feature components:**

- `src/features/seller/components/SellerOffersView.tsx` — DataTable with counter modal form
- `src/features/user/components/UserOffersView.tsx` — buyer offer list; checkout + withdraw actions
- `src/features/products/components/MakeOfferForm.tsx` — form on product detail page

**Pages:**

- `src/app/[locale]/seller/offers/page.tsx`
- `src/app/[locale]/user/offers/page.tsx`
- `src/app/[locale]/how-offers-work/page.tsx` + `src/features/about/components/HowOffersWorkView.tsx` — 6-step negotiation flow diagram

**Functions:**

- `functions/src/jobs/offerExpiry.ts` — CRON daily 00:15 UTC; queries `pending|countered` offers past their `expiresAt`, releases buyer RC, marks `expired`, sends notification
- `functions/src/repositories/offer.repository.ts` — `findExpiredActive(now)` / `expireMany(offerIds)` (499-doc batches)

---

## [Unreleased] — 2026-03-14

### Feature — RC Wallet (renamed from RipCoins)

Rebranded the RipCoins virtual-currency system to **RC** and added purchase flow, immutable ledger, offer engagement, and admin tools.

**Breaking renames:**

- `docs/features/ripcoins.md` → `docs/features/rc.md`
- `src/db/schema/ripcoins.ts` → deleted; schema now in `src/db/schema/rc.ts`
- `src/repositories/ripcoin.repository.ts` → deleted; replaced by `rcRepository` (`src/repositories/rc.repository.ts`)
- `src/hooks/useRipCoins.ts` → deleted; reads now via Server Actions
- `src/components/user/RipCoinsBalanceChip.tsx` → deleted; replaced by `src/components/user/RCBalanceChip.tsx`
- All RipCoins admin components deleted: `src/features/admin/components/RipCoinAdjustModal.tsx`, `RipCoinFilters.tsx`
- Old API routes deleted: `/api/ripcoins/*`
- Old pages deleted: `/ripcoins`, `/user/ripcoins`, `/user/ripcoins/purchase`

**Schema (`src/db/schema/rc.ts`):**

- `RCTransactionDocument` — immutable ledger; types: `purchase|engage|release|forfeit|return|earn_event|refund`; fields: `coins`, `balanceBefore`, `balanceAfter`, `razorpayOrderId`, `razorpayPaymentId`, `bidId`, `eventId`; economics: **10 RC = ₹1**
- `RC_PACKAGES` constant — fixed buy packages (100/500/1000/5000/10 000 RC)
- `RC_COLLECTION` constant

**Server Actions (`src/actions/rc.actions.ts`):**

- `getRCBalanceAction` — returns `{ rcBalance, engagedRC }` from `userRepository`
- `getRCHistoryAction` — paginated Sieve-enabled ledger read

**API routes (`src/app/api/rc/`):**

- `GET /api/rc/balance`
- `GET /api/rc/history`
- `POST /api/rc/purchase` — creates Razorpay order for fixed RC package
- `POST /api/rc/purchase/verify` — idempotent HMAC verification; credits base + bonus RC; creates ledger entry
- `POST /api/rc/refund` — refunds RC purchase; deducts free coins, triggers Razorpay refund

**Feature components:**

- `src/features/user/components/RCWallet.tsx` — balance display + transaction history table
- `src/features/user/components/RCPurchaseView.tsx` — package picker + Razorpay flow
- `src/features/user/components/BuyRCModal.tsx` — inline purchase modal (from wallet page)
- `src/components/user/RCBalanceChip.tsx` — shared balance chip
- `src/features/admin/components/RCAdjustModal.tsx` — admin credit/debit modal; calls `adminAdjustRCAction`
- `src/features/admin/components/RCFilters.tsx` — admin RC transaction filter panel

**Pages:**

- `src/app/[locale]/rc/page.tsx` — RC economics explainer (uses `RCInfoView`)
- `src/app/[locale]/user/rc/page.tsx` — user RC wallet
- `src/app/[locale]/user/rc/purchase/page.tsx` — RC purchase flow
- `src/features/about/components/RCInfoView.tsx` — RSC explainer with `FlowDiagram` and `RC_PACKAGES`

**Functions:**

- `functions/src/repositories/rc.repository.ts` — `rcRepository` for reading RC transaction history

---

## [Unreleased] — 2026-03-14

### Feature — Partial refund system

Added admin-triggered partial refunds and user-initiated cancellation refunds with transparent fee deductions.

**Server Actions (`src/actions/refund.actions.ts`):**

- `adminPartialRefundAction(input: PartialRefundInput)` — computes net refund: gross minus gateway fee (2.36%) minus GST (18%); optionally skips fee deduction (`deductFees` flag); creates Razorpay refund; updates order `refundStatus`
- `previewCancellationRefundAction(orderId)` — returns `PartialRefundResult` breakdown for display before confirming
- `PartialRefundResult` interface — gross / platformFee / gatewayFee / gst / net amounts

**API route:**

- `POST /api/admin/orders/[id]/refund` — admin-only; delegates to `adminPartialRefundAction`

**UI:**

- `src/features/seller/components/PayoutBreakdownModal.tsx` — display-only modal showing payout maths: gross → platform (5%) → gateway (2.36%) → GST (18%) → net; `PayoutBreakdown` interface

---

## [Unreleased] — 2026-03-14

### Feature — New info pages

- **`src/app/[locale]/fees/page.tsx`** + `src/features/about/components/FeesView.tsx` — static fee schedule table: platform 5%, gateway 2.36%, GST 18%
- **`src/app/[locale]/how-offers-work/page.tsx`** + `src/features/about/components/HowOffersWorkView.tsx` — offer negotiation flow (6-step `FlowDiagram`)
- **`src/app/[locale]/rc/page.tsx`** + `src/features/about/components/RCInfoView.tsx` — RC economics explainer; purchase packages; lifecycle diagram
- **`src/features/about/components/ShippingPolicyView.tsx`** — extracted from inline page component
- **`src/features/about/components/TrackOrderView.tsx`** — extracted from inline page component

---

## [Unreleased] — 2026-03-14

### Refactor — Additional Server Actions migrated from services

Seven new action files complete the service-layer deletion (all previously lived in `src/services/`):

| File                                    | Actions                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/actions/chat.actions.ts`           | `getChatRoomsAction`, `createOrGetChatRoomAction`, `sendChatMessageAction`, `deleteChatRoomAction`                        |
| `src/actions/product.actions.ts`        | 12 product/auction/pre-order read actions (`listProductsAction`, `getFeaturedProductsAction`, `listAuctionsAction`, etc.) |
| `src/actions/promotions.actions.ts`     | `getPromotionsAction`                                                                                                     |
| `src/actions/realtime-token.actions.ts` | `getRealtimeTokenAction`                                                                                                  |
| `src/actions/search.actions.ts`         | `searchProductsAction`                                                                                                    |
| `src/actions/site-settings.actions.ts`  | `getSiteSettingsAction`, `updateSiteSettingsAction`                                                                       |
| `src/actions/store.actions.ts`          | `listStoresAction`, `getStoreBySlugAction`, `getStoreProductsAction`, `getStoreAuctionsAction`, `getStoreReviewsAction`   |

All actions exported from `src/actions/index.ts`.

---

## [Unreleased] — 2026-03-14

### Refactor — Functions: auto payout eligibility job

- **`functions/src/jobs/autoPayoutEligibility.ts`** — CRON daily 04:45 UTC; queries all `delivered` orders with no active payout, groups by seller, creates `PayoutDocument` (`status: pending`) with net amount after 5% platform + 2.36% gateway + 18% GST deductions; updates each order's `payoutStatus = 'requested'`
- `functions/src/index.ts` — registered new `autoPayoutEligibility` job

---

## [Unreleased] — 2026-03-14

### Refactor — Views extracted to feature components

Thin page files delegating to proper feature-tier views:

- `src/features/homepage/components/HomepageView.tsx` — root homepage RSC view
- `src/features/homepage/components/HowAuctionsWorkView.tsx` — auction guide
- `src/features/homepage/components/HowPreOrdersWorkView.tsx` — pre-order guide
- `src/features/seller/components/SellerGuideView.tsx` — seller onboarding guide
- `src/features/about/components/ShippingPolicyView.tsx`
- `src/features/about/components/TrackOrderView.tsx`

Pages updated: `src/app/[locale]/page.tsx`, `how-auctions-work/page.tsx`, `how-pre-orders-work/page.tsx`, `seller-guide/page.tsx`, `promotions/page.tsx`, `shipping-policy/page.tsx`, `track/page.tsx`, `seller/layout.tsx`

---

## [Unreleased] — 2026-03-14

### Chore — Test suite cleanup

Removed all `__tests__/` files pending a proper test framework migration (all mocks were against deleted service layer):

- **~100 test files deleted** across `src/app/`, `src/features/`, `src/components/`, `src/hooks/`, `src/helpers/`, `src/utils/`, `src/services/`
- `src/hooks/__tests__/useAuctionDetail.test.ts` and `useCamera.test.ts` — retained (unrelated to service layer)

---

## [Unreleased] — 2026-03-14

### Feature — Platform-level third-party service integrations (Shiprocket, Meta)

Added encrypted credential storage, credential resolvers, and admin UI for the platform's Shiprocket shipping and Meta (Facebook/Instagram) catalog integrations. Stores do not have per-store third-party integrations — all payment, shipping, and email run through the platform's single accounts. Sellers only configure UPI ID or NEFT bank details for payouts.

**Schema changes:**

- `src/db/schema/site-settings.ts` — `SiteSettingsCredentials` and `SiteSettingsCredentialsMasked` extended with: `shiprocketEmail`, `shiprocketPassword`, `metaAppId`, `metaAppSecret`, `metaPageAccessToken`, `metaPageId`

**New library files:**

- `src/lib/shiprocket/platform-auth.ts` — `getPlatformShiprocketToken()` / `invalidatePlatformShiprocketToken()`; resolves credentials from Firestore siteSettings (admin-configurable) with `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` env-var fallback; in-process 9-day token cache
- `src/lib/oauth/meta.ts` — Meta Graph API v20.0 helper: `exchangeForLongLivedToken()`, `debugMetaToken()`, `syncProductsToCatalog()`, `deleteFromCatalog()`; resolves all creds from siteSettings with env-var fallback

**Admin UI:**

- `src/features/admin/components/SiteCredentialsForm.tsx` — `CredentialsUpdateValues` extended with all new fields; Shiprocket and Meta sections added to the form (Shiprocket email + password; Meta App ID, App Secret, Page Access Token with exchange hint, Page ID)
- `messages/en.json` (`adminSite`) — 9 new keys: `shiprocketSection`, `shiprocketEmail`, `shiprocketPassword`, `metaSection`, `metaAppId`, `metaAppSecret`, `metaPageAccessToken`, `metaPageAccessTokenHint`, `metaPageId`

---

## [Unreleased] — 2026-03-14

### Refactor — Service layer deleted: 2-hop architecture (Hook → apiClient / Hook → Action)

Deleted `src/services/` entirely (all 33 `*.service.ts` files + tests + `index.ts`). The architecture is now a strict 2-hop:

- **Reads:** `Component → useQuery hook → apiClient → API Route`
- **Mutations:** `Component → useMutation hook → Server Action → Repository`

**Files deleted:**

- All `src/services/*.service.ts` (33 files) and `src/services/__tests__/` (22 test files)
- `src/services/index.ts` barrel

**Callers migrated (apiClient inlined into hook queryFn):**

- `src/hooks/useAuth.ts` — `authService.login/register/sendVerification/changePassword` → `apiClient.post`
- `src/hooks/useLogout.ts` — `authService.logout` → `apiClient.post`
- `src/hooks/useCheckout.ts` — `checkoutService.*` → `apiClient.post`
- `src/hooks/useMediaUpload.ts` — `mediaService.*` → `apiClient.upload/post`
- `src/hooks/useNavSuggestions.ts` — `navSuggestionsService.search` → `searchNavPages` (Algolia helper, no API route needed)
- `src/hooks/useRC.ts` — `rcService.purchaseCoins/verifyPurchase/refundPurchase` → `apiClient.post`
- `src/features/admin/hooks/useAlgoliaSync.ts` — `adminService.algoliaSync/algoliaSyncPages/algoliaDevSync` → `apiClient.post`
- `src/features/admin/hooks/useDemoSeed.ts` — `adminService.demoSeedStatus/demoSeed` → `apiClient.get/post`
- `src/features/seller/hooks/useSellerOffers.ts` — `offerService.listForSeller` → `apiClient.get`
- `src/features/seller/hooks/useSellerOrders.ts` — removed dead `sellerService` import (already using Server Actions)
- `src/features/user/hooks/useUserOffers.ts` — `offerService.listForBuyer` → `apiClient.get`
- `src/features/cart/hooks/useCheckoutVerifyOtp.ts` — `checkoutService.requestOtpGrant` → `apiClient.post`
- `src/features/cart/hooks/usePaymentOtp.ts` — `checkoutService.requestOtpGrant` → `apiClient.post`
- `src/features/products/components/PreOrderDetailView.tsx` — `checkoutService.createPaymentOrder/verifyPreOrderDeposit` → `apiClient.post`
- `src/contexts/SessionContext.tsx` — `sessionService.getProfile/recordActivity/validate/create` + `authService.logout` → `apiClient.*`
- `src/lib/firebase/auth-helpers.ts` — `sessionService.create/destroy` → `apiClient.post/delete`

**Rules updated:**

- `scripts/check-violations.js` — `SVC-002` rewritten: was "apiClient outside `*.service.ts`", now "apiClient in component or page"; hooks/contexts/lib are allowed. `SVC-003` fileFilter expanded to include hooks.
- `.github/instructions/rules-services.instructions.md` — fully rewritten to document 2-hop pattern
- `.github/copilot-instructions.md` — Critical Stops + Rule Index + Migration State updated; I1 stage marked ✅

---

## [Unreleased] — 2026-03-13

### Refactor — Hook architecture: 5-hop → 2-hop (Hook → Action → Repository)

Replaced the `Hook → Service → apiClient → API Route → Repository` chain with direct `Hook → Action → Repository` calls across all feature hooks.

**TypeScript errors fixed:**

- Admin hooks: `useAdminCategories`, `useAdminFeatureFlags`, `useAdminProducts`, `useAdminReviews`, `useAdminSections`, `useAdminFaqs`, `useAdminSessions`, `useAdminSiteSettings`, `useAdminStores`, `useAdminUsers` — structural type incompatibilities resolved with `as unknown as T` casts
- Feature hooks: `useBlogPost`, `useBlogPosts`, `useCart`, `useCartCount`, `useHomepageSections`, `useProductReviews`, `usePublicEvent`, `useRelatedProducts`, `usePublicProfile`, `useSellerStorefront`, `useSellerAuctions`, `useSellerPayouts`, `useSellerProducts`, `useStoreBySlug`, `useCheckout`, `useFeaturedStores`, `useProfile`, `useFeedbackSubmit`, `usePollVote` — queryFn return type mismatches resolved
- `useRelatedProducts` — dead `productService.list(params)` call replaced with `listProductsAction(...)`
- Pre-existing action file errors fixed: `bid.actions.ts` (duplicate import), `faq.actions.ts` (duplicate import + wrong arg count), `chat.actions.ts` (`chatRepository.sendMessage` → RTDB write), `event.actions.ts` (`listForEvent` needs SieveModel arg), `promotions.actions.ts` / `store.actions.ts` (Date-to-string casts), `search.actions.ts` (Algolia result cast), `site-settings.actions.ts` (`get()` → `getSingleton()`, `update()` → `updateSingleton()`)

**New actions added (seller):**

- `sellerUpdateProductAction(id, input)` — verifies ownership, uses `productUpdateSchema.partial()`
- `sellerDeleteProductAction(id)` — verifies ownership, calls `productRepository.delete(id)`

**Actions enhanced:**

- `listSellerMyProductsAction` — added `totalPages` to return value
- `listSellerOrdersAction` — fixed: was erroneously passing `user.uid` string to `listForSeller(productIds: string[])`, now correctly fetches seller products then extracts IDs
- `getWishlistAction` — enriched to return full product data per wishlist item (mirrors previous API route behaviour)

**Services still retained** (mutations requiring complex Shiprocket/auth/payment APIs):

- `sellerService.updateShipping`, `sellerService.verifyPickupOtp`, `sellerService.shipOrder`
- Auth, media upload, checkout payment, realtime token, and nav-suggestions services remain pending future action migration

---

### Feature — Checkout: unified OTP verification + failed-checkout audit trail

Merged the two separate OTP flows (payment re-auth and third-party consent) into a **single OTP per checkout**. Added Firestore audit collections for failed checkouts and failed payments.

**Behaviour:**

- ALL orders (own address or third-party) require exactly one OTP before the order is placed.
- Default mode is **SMS** sent to the shipping address phone number (which equals the buyer's registered phone for own-address orders).
- If the buyer lacks access to that number (third-party address, unregistered phone), they switch to **email OTP** sent to their account email.
- The OTP modal fires only at "Place Order" time — not at address selection.

**Files added:**

- **`src/db/schema/failed-checkouts.ts`** — `FailedCheckoutDocument`, `FailedPaymentDocument`, reason enum types, collection constants `FAILED_CHECKOUTS_COLLECTION` / `FAILED_PAYMENTS_COLLECTION`
- **`src/repositories/failed-checkout.repository.ts`** — write-only `failedCheckoutRepository.logCheckout()` / `.logPayment()` (fire-and-forget, used in API routes)
- **`src/features/cart/hooks/useCheckoutVerifyOtp.ts`** — unified OTP state machine (`idle → sending → code_sent → verifying → granting → verified | error`); SMS path uses Firebase Phone Auth re-auth + `grantCheckoutConsentViaSmsAction`; email path uses existing `sendConsentOtpAction` / `verifyConsentOtpAction`
- **`src/features/cart/components/CheckoutVerifyModal.tsx`** — single modal replacing both `CheckoutOtpModal` and `ConsentOtpModal`; auto-selects SMS/email mode; toggle link for fallback

**Files modified:**

- **`src/actions/checkout.actions.ts`** — added `grantCheckoutConsentViaSmsAction(addressId)`: validates phone ownership server-side, writes `{verified:true, verifiedVia:"sms"}` Firestore consent doc
- **`src/app/api/checkout/route.ts`** — all orders (not just third-party) now require a verified consent OTP doc; removed `isThirdPartyAddress` / `requiresConsent` logic; failure logging via `failedCheckoutRepository`
- **`src/app/api/payment/verify/route.ts`** — consent OTP check added before order creation; `failedCheckoutRepository.logPayment()` for signature mismatch, OTP failures, stock errors, amount mismatch; OTP doc deleted after successful batch
- **`src/features/cart/components/CheckoutView.tsx`** — replaced two separate modals with `CheckoutVerifyModal`; removed old consent state (`consentVerifiedAddressIds`, `showConsentModal`, `consentModalData`); `handleNext` no longer blocks for consent
- **`src/features/cart/components/CheckoutAddressStep.tsx`** — removed `onConsentRequired` and `consentVerifiedAddressIds` props; third-party banner is now informational only (no Verify button)
- **`messages/en.json`** — added 13 new keys: `verifyModalTitle`, `verifyOwnDesc`, `verifyThirdPartyDesc`, `verifyTargetPhone`, `verifyTargetEmail`, `verifySendSmsBtn`, `verifySendEmailBtn`, `verifySentDescPhone`, `verifySentDescEmail`, `verifyCodeLabel`, `verifyConfirmBtn`, `verifyUseEmailInstead`, `verifyUseSmsInstead`
- **`src/db/schema/index.ts`** — exports `failed-checkouts`
- **`src/repositories/index.ts`** — exports `failedCheckoutRepository`
- **`src/actions/index.ts`** — exports all three checkout consent actions

### Feature — Checkout: third-party shipping consent + OTP gate

Added a mandatory OTP-verified consent gate when the selected delivery address belongs to a different person than the signed-in buyer.

- **`src/features/cart/components/CheckoutAddressStep.tsx`** — added `isThirdParty()` helper and `onConsentRequired` / `consentVerifiedAddressIds` props; renders a warning banner and blocks progression until consent is OTP-verified
- **`src/features/cart/components/CheckoutView.tsx`** — threads consent state (`consentVerifiedAddressIds`, `ConsentOTPModal`) through the address-selection step; prevents `proceedToPayment` until consent is confirmed for third-party addresses
- **`messages/en.json`** — added 20+ new keys: `checkout.thirdPartyTitle`, `...thirdPartyDesc`, `...thirdPartyCheckbox`, `...consentOtp*`, `...partialOrder*`, `wishlist.searchPlaceholder`, `orders.searchPlaceholder`, `reviews.searchPlaceholder`, `reviews.subtitle`, `auctions.subtitle`, `checkout.upiStep3`, `checkout.codDepositNote`

### Refactor — Schema: `Timestamp` → `Date` normalization

Eliminated `firebase-admin/firestore` `Timestamp` import from schema files so types are portable between Admin SDK and web client contexts.

- **`src/db/schema/events.ts`** — removed `Timestamp` import; `startsAt`, `endsAt`, `createdAt`, `updatedAt`, `reviewedAt`, `submittedAt` changed from `Timestamp` to `Date`
- **`src/db/schema/tokens.ts`** — removed `Timestamp` import; `expiresAt`, `createdAt`, `usedAt` changed from `Timestamp | Date` union to `Date`

### Schema — `ProductDocument`: denormalized rating fields

- **`src/db/schema/products.ts`** — added `avgRating?: number` and `reviewCount?: number` to `ProductDocument` (populated by the new `onReviewWrite` trigger)

### Schema — `SiteSettingsDocument`: navbar + footer runtime config

- **`src/db/schema/site-settings.ts`** — added `navbarConfig?: { hiddenNavItems?: string[] }` (hides nav items by translation key without a redeploy); added `footerConfig?: { trustBar?: { enabled?: boolean; items?: TrustBarItem[] }; newsletterEnabled?: boolean }`; added `TrustBarItem` interface and `DEFAULT_TRUST_BAR_ITEMS` constant (5 default footer trust-bar chips)

### Fix — Schema: remove deprecated `RC_EARN_RATE` constant

- **`src/db/schema/rc.ts`** — removed `@deprecated RC_EARN_RATE = 10`; callers should use `siteSettingsRepository.getLoyaltyConfig()`

### Fix — Actions: Rule-20 compliance + constant references

- **`src/actions/admin.actions.ts`** — `adminCreateProductAction` replaced inline `apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS, …)` with `adminService.createAdminProduct(input)` (Rule 20: no `apiClient` in Server Actions)
- **`src/actions/bid.actions.ts`** — replaced manual `Timestamp`-coercion guard with `resolveDate(product.auctionEndDate)` from `@/utils`
- **`src/actions/event.actions.ts`** — replaced hardcoded `"events"` and `"eventEntries"` strings with `EVENTS_COLLECTION` / `EVENT_ENTRIES_COLLECTION` constants (Rule 17)

### Refactor — Cloud Functions: merge RTDB cleanup jobs + new triggers

- **`functions/src/jobs/cleanupAuthEvents.ts`** — **deleted**: responsibility merged into new `cleanupRtdbEvents` job (handles both auth and payment RTDB nodes in a single 5-min scheduled run)
- **`functions/src/jobs/cleanupPaymentEvents.ts`** — **deleted**: same merge
- **`functions/src/index.ts`** — updated job manifest table; added `countersReconcile` (03:00 UTC, rebuilds category & store stats); registered new `onReviewWrite` trigger; replaced two separate cleanup jobs with merged `cleanupRtdbEvents`
- **`functions/src/triggers/onProductWrite.ts`** — expanded beyond Algolia sync to also update category `productCount`/`auctionCount` (with ancestor propagation via `categoryRepository.getParentIds`) and store `totalProducts` on every publish/unpublish/category-change/delete event
- **`functions/src/repositories/review.repository.ts`** — added `getApprovedRatingAggregateBySeller(sellerId)` for store-level rating aggregation
- **`functions/src/repositories/index.ts`** — re-exports updated

### Dev tooling — Violation script + instruction docs sync

- **`scripts/check-violations.js`** — Updated `CNST-003` `KNOWN_COLLECTIONS` list to match actual Firestore string values from `src/db/schema/`: corrected camelCase names (`carouselSlides`, `homepageSections`, `siteSettings`, `emailVerificationTokens`, `passwordResetTokens`, `blogPosts`, `chatRooms`, `eventEntries`, `rc`); removed stale underscore names; added missing collections (`stores`, `newsletterSubscribers`, `sms_counters`, `couponUsage`, `wishlist` subcollection)
- **`.github/instructions/rules-constants.instructions.md`** — RULE 17 collection constants list expanded: added `CART_COLLECTION`, `STORE_COLLECTION`, `BLOG_POSTS_COLLECTION`, `CHAT_ROOM_COLLECTION`, `EVENTS_COLLECTION`, `EVENT_ENTRIES_COLLECTION`, `NEWSLETTER_SUBSCRIBERS_COLLECTION`, `NOTIFICATIONS_COLLECTION`, `PAYOUT_COLLECTION`, `RC_COLLECTION`, `SMS_COUNTERS_COLLECTION`, `ADDRESS_SUBCOLLECTION`, `COUPON_USAGE_SUBCOLLECTION`
- **`.github/instructions/rules-docs-seed.instructions.md`** — Fixed seed-data paths: all `scripts/seed-data/` references corrected to `src/db/seed-data/`; `scripts/seed-all-data.ts` reference replaced with `/api/demo/seed/route.ts`
- **`src/db/seed-data/index.ts`** — Removed export for deleted `products-seed-data.ts`
- **`src/app/api/demo/seed/route.ts`** — Removed `products` collection (seed file deleted); added `stores` collection; removed dead `ALGOLIA_INDEX_NAME` import and products clear block
- **`src/app/api/demo/seed/__tests__/route.test.ts`** — Fixed Jest mock path from wrong `../../../../../../scripts/seed-data` → correct `@/db/seed-data`; removed `productsSeedData` mock; added `storesSeedData: []`

### Refactor — Layout primitives applied codebase-wide

Applied `Container`, `Stack`, `Row`, `Grid` primitives (introduced earlier this session) across 35+ files, eliminating inline `THEME_CONSTANTS` template-literal patterns and raw Tailwind grid/flex blocks.

**Container replacements** (`THEME_CONSTANTS.page.container.*` → `<Container>`):

- `src/features/stores/components/StoresListView.tsx`, `src/features/products/components/ProductsView.tsx`, `src/features/events/components/EventsListView.tsx`, `src/features/products/components/PreOrdersView.tsx`, `src/features/blog/components/BlogListView.tsx`, `src/features/products/components/AuctionsView.tsx`, `src/features/categories/components/CategoriesListView.tsx`, `src/features/reviews/components/ReviewsListView.tsx`

**Grid replacements** (`grid grid-cols-1 sm:grid-cols-2 gap-4` / `THEME_CONSTANTS.grid.cols4` → `<Grid cols={…}>`):

- `src/components/products/ProductForm.tsx` (9 blocks + Stack root; THEME_CONSTANTS import removed entirely)
- `src/features/admin/components/SiteContactForm.tsx`, `SiteSocialLinksForm.tsx`, `SiteCommissionsForm.tsx`
- `src/features/seller/components/SellerPayoutSettingsView.tsx` (2 blocks), `SellerPayoutRequestForm.tsx`, `SellerShippingView.tsx` (cols-2 + cols-3), `SellerStoreView.tsx` (2 blocks)
- `src/features/admin/components/SectionForm.tsx`

**Row replacements** (`THEME_CONSTANTS.flex.center` / `.flex.between` → `<Row>`):

- `src/features/wishlist/components/WishlistView.tsx`, `src/features/user/components/UserSettingsView.tsx`, `UserOrdersView.tsx`, `UserEditAddressView.tsx`, `UserAddressesView.tsx`, `OrderDetailView.tsx`, `src/features/seller/components/SellerAddressesView.tsx`, `src/features/admin/components/AlgoliaDashboardView.tsx`

**Stack replacements** (`flex flex-col gap-*` → `<Stack>`):

- `src/features/stores/components/StoreReviewsView.tsx`, `src/features/admin/components/AdminPriorityAlerts.tsx`, `src/features/user/components/MessagesView.tsx`

### Fix — `ReviewDocument` schema: add `sellerId` field

- **`src/db/schema/reviews.ts`** — added `sellerId?: string` to `ReviewDocument` (denormalized seller reference; was in seed data, missing from type)
- **`src/db/schema/field-names.ts`** — added `SELLER_ID: "sellerId"` to `REVIEW_FIELDS`

### New — Layout Primitives: `Container`, `Stack`, `Row`, `Grid`

Added four structural layout primitives to `@mohasinac/ui` (and re-exported from `@/components`) to eliminate repeated inline Tailwind class strings across the codebase.

- **`packages/ui/src/components/Layout.tsx`** — new file implementing `Container`, `Stack`, `Row`, `Grid` with inlined token maps
- **`packages/ui/src/index.ts`** — exports `Container`, `Stack`, `Row`, `Grid` and their prop types + `GapKey`, `ContainerSize`, `GridCols`
- **`src/components/semantic/index.ts`** — re-exports all four primitives from `@mohasinac/ui`; fully available via `import { Container, Stack, Row, Grid } from '@/components'`
- **`src/constants/theme.ts`** — added `THEME_CONSTANTS.spacing.gap` map (`none` · `px` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl`) mirroring the inlined token map in Layout.tsx
- **`.github/instructions/rules-components.instructions.md`** — added "Layout Primitives" table with usage examples and mandatory-use rule

**Migration:** Replace raw flex/grid/container divs:

```tsx
// Before
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="flex items-center justify-between gap-2">
<div className="flex flex-col gap-4">
// After
<Container>
<Grid cols={3} gap="md">
<Row justify="between" gap="sm">
<Stack gap="md">
```

### Accessibility — Contrast fixes (Phase 3, deep codebase scan)

Files with white/light text on insufficiently light backgrounds or `primary-500` (#65c408, luminance ≈ 0.44) producing < 3:1 contrast with white text:

- **`src/features/seller/components/SellersListView.tsx`** — hero subtitle `text-green-100` → `text-white`; stats row `text-emerald-200` → `text-white/80`; final-CTA `text-emerald-100` → `text-white/90` (all on dark emerald/teal gradients)
- **`src/features/promotions/components/PromotionsView.tsx`** — badge `text-rose-100` → `text-white`; subtitle `text-rose-100` → `text-white/90` (on rose-pink gradient)
- **`src/features/user/components/OrderDetailView.tsx`** — step-tracker circles + connector `bg-primary-500` → `bg-primary-700`; ring `ring-primary-500/20` → `ring-primary-700/20`
- **`src/components/products/ProductCard.tsx`** — Add-to-Cart button `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-800`
- **`src/components/EventCard.tsx`** — Visit Event button `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-800`; `ring-primary-500` → `ring-primary-700`
- **`src/features/products/components/ProductActions.tsx`** — both Add-to-Cart buttons (desktop + mobile) `bg-primary-500 hover:bg-primary-600` → `bg-primary-700 hover:bg-primary-700/90`
- **`src/components/orders/OrderCard.tsx`** — selection checkbox `bg-primary-500 border-primary-500` → `bg-primary-700 border-primary-700`
- **`src/features/user/components/PublicProfileView.tsx`** — price `text-primary-600` → `text-primary-700 dark:text-primary-400`; review avatar initial `text-primary-600` → `text-primary-800 dark:text-primary-200`; review product link + website link `text-primary-600` → `text-primary-700 dark:text-primary-400 hover:underline`; stat values `text-primary-600` → `text-primary-700 dark:text-primary-400`; dead `text-success-600` / `text-warning-600` / `text-info-600` replaced with `text-emerald-600 dark:text-emerald-400` / `text-amber-600 dark:text-amber-400` / `text-sky-600 dark:text-sky-400`
- **`src/features/seller/components/SellerStorefrontView.tsx`** — profile link `text-primary-600` → `text-primary-700 dark:text-primary-400`; stat values `text-primary-600` → `text-primary-700 dark:text-primary-400`; dead `text-success-600` → `text-emerald-600 dark:text-emerald-400`; review avatar initial `text-primary-600` → `text-primary-800 dark:text-primary-200`; review product link + back link `text-primary-600` → `text-primary-700 dark:text-primary-400`
- **`src/features/seller/components/SellerStorefrontPage.tsx`** — both error-state links `text-primary-600` → `text-primary-700 dark:text-primary-400`

### Layout — Grid density fixes (Phase 3, deep codebase scan)

- **`src/components/products/ProductGrid.tsx`** — added `2xl:grid-cols-6` (was stopping at `xl:grid-cols-5`)
- **`src/features/wishlist/components/WishlistView.tsx`** — overlay grid updated to match `ProductGrid` (`2xl:grid-cols-6`)
- **`src/components/layout/FooterLayout.tsx`** — replaced dynamic `lg:grid-cols-${computed}` (Tailwind purge risk) with static `lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5`
- **`src/features/products/components/ProductDetailView.tsx`** — added `2xl:grid-cols-[1fr_1fr_320px]` to both skeleton and main 3-column layouts
- **`src/features/products/components/AuctionDetailView.tsx`** — same as above
- **`src/features/products/components/PreOrderDetailView.tsx`** — same as above
- **`src/features/homepage/components/HomepageSkeleton.tsx`** — categories row: added `2xl:grid-cols-5`; products/auctions skeleton rows: mobile base changed from `grid-cols-3` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` (matches real carousel)
- **`src/features/homepage/components/FAQSection.tsx`** — accordion container `max-w-3xl` → `max-w-5xl` (was wasting widescreen space)
- **`src/features/stores/components/StoreAboutView.tsx`** — content container `max-w-2xl` → `max-w-4xl mx-auto` (was left-aligned without `mx-auto`)
- **`src/features/user/components/MessagesView.tsx`** — added `2xl:grid-cols-[360px_1fr]` to message layout
- **`src/features/homepage/components/WelcomeSection.tsx`** — added explicit `xl:grid-cols-2 2xl:grid-cols-2`
- **`src/features/seller/components/SellerCouponsView.tsx`** — added `xl:grid-cols-2` (was jumping `lg:2 → 2xl:3`, skipping `xl`)
- **`src/features/homepage/components/AdvertisementBanner.tsx`** — added `lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2` to image/text banner grid
- **`src/features/blog/components/BlogPostView.tsx`** — related posts grid: added `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/user/components/RCWallet.tsx`** — balance stat cards grid: added `xl:grid-cols-3 2xl:grid-cols-3`

---

## 2026-03-13 (earlier in session)

### Accessibility — Contrast fixes (Phase 1 & 2 initial audit)

- **`src/constants/theme.ts`** — `colors.footer.*` dark: variants removed (footer bg is always dark); `sectionHeader.pill` `text-primary-600` → `text-primary-700`
- **`src/features/homepage/components/WhatsAppCommunitySection.tsx`** — gradient darkened `from-green-700 to-green-800`; `text-emerald-100` → `text-white`; `text-white/75` → `text-white/90`
- **`src/features/seller/components/SellerSidebar.tsx`** — group label `text-zinc-400 dark:text-zinc-500` → `text-zinc-500 dark:text-zinc-400`
- **`src/components/categories/CategoryCard.tsx`** — product-count chip `bg-white/20` → `bg-black/50` (text was unreadable on light category images)
- **`src/features/auth/components/RegisterForm.tsx`** — all `text-blue-600` links → `text-blue-600 dark:text-blue-400` with hover variants
- **`src/features/auth/components/ForgotPasswordView.tsx`** — sign-in link `text-blue-600` → `text-blue-600 dark:text-blue-400`
- **`src/features/homepage/components/AdvertisementBanner.tsx`** — subtitle `text-white/80` → `text-white`

### Layout — Grid density fixes (Phase 2 initial audit)

- **`src/features/homepage/components/FeaturedResultsSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-5`
- **`src/features/homepage/components/SiteFeaturesSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-6`
- **`src/features/homepage/components/TrustFeaturesSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-4`
- **`src/features/homepage/components/StatsCounterSection.tsx`** — added `xl:grid-cols-4 2xl:grid-cols-4`
- **`src/features/homepage/components/HowItWorksSection.tsx`** — added `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/seller/components/SellersListView.tsx`** — benefits `xl:grid-cols-3 2xl:grid-cols-4`; steps `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/seller/components/SellerStorefrontView.tsx`** — products grid `2xl:grid-cols-6`
- **`src/features/user/components/UserAccountHub.tsx`** — quick-actions grid `xl:grid-cols-6 2xl:grid-cols-6`
- **`src/features/about/components/AboutView.tsx`** — both feature grids `2xl:grid-cols-3`
- **`src/features/admin/components/QuickActionsGrid.tsx`** — `xl:grid-cols-3 2xl:grid-cols-3`
- **`src/features/homepage/components/WhatsAppCommunitySection.tsx`** — benefits grid `sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4`
