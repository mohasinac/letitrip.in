# newchange.md — Session Log & Deferred Items

> **Append new session entries below the DEFERRED section, newest first.**
> After completing a task that defers or skips any spec component, add it to DEFERRED below AND log the session entry.

## Index

- [⚠️ Deferred / Skipped Items](#️-deferred--skipped-items--read-before-each-session)
- [Session Log (newest first)](#session-log-newest-first)

---

## ⚠️ DEFERRED / SKIPPED ITEMS — READ BEFORE EACH SESSION

> These are known gaps from previous sessions. Resolve before marking the parent task fully closed, or create a new explicit task.

| Date | Task | What was deferred / skipped | Status | Fix target |
|------|------|-----------------------------|--------|------------|
| 2026-05-10 | CSS import rule | `@import "@mohasinac/appkit/styles"` in globals.css caused Turbopack PostCSS crash ("Unknown AST node type 0"). Fixed: import via JS in layout.tsx instead. Rule: never @import pre-compiled node_modules CSS through globals.css — use JS imports only. | ✅ Fixed | Ongoing rule |
| 2026-05-08 | A3/VA6 + A4/VA4 | Session 70 added `/admin/blog/new/`, `/admin/blog/[id]/`, `/admin/coupons/new/`, `/admin/coupons/[id]/` alongside existing `[[...action]]` catch-alls — creates Next.js "same specificity" route collision error. Multiple other admin routes likely affected (products, bids, carousel, categories, orders, reviews, sections, users). | ✅ Build error fixed 2026-05-09 — only `/admin/products` had an actual conflict (had both `page.tsx` and `[[...action]]/page.tsx`); all other areas use `[[...action]]` as the sole list page, no conflict. Deleted `products/[[...action]]/page.tsx`. RC4 full audit still ⏳. | RC4 |
| 2026-05-08 | SP1/P10 | Seed data source-of-truth policy formalised: SeedPanel SP1/P10 documentation (slugPattern, mediaFields, PII fields, column metadata) is canonical for all 23 collections. Seed files must be updated in-session with any schema change. P23–P31 sessions expand counts only. | ✅ Policy adopted — no code change needed | Noted in prompt.md + crud-tracker.md |
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

# Session 88 — 2026-05-10 (RC4 + RC3: Route audit + Button/Link sweep)

## Scope
RC4: All 10 `[[...action]]` catch-all folders removed from admin routes — replaced with standard `/page.tsx` list pages. RC3: `asChild` prop added to appkit Button, all `<Button onClick={() => router.push()}>` violations fixed. appkit 2.4.11 dist rebuilt.

## Changed Files

| File | Change |
|------|--------|
| `appkit/src/ui/components/Button.tsx` | Added `asChild?: boolean` prop — cloneElement-based Slot pattern; merges button classes onto child element |
| `src/app/[locale]/admin/blog/page.tsx` | NEW — list page replacing `[[...action]]`; uses `ROUTES.ADMIN.BLOG_NEW` + `ROUTES.ADMIN.BLOG_EDIT` |
| `src/app/[locale]/admin/coupons/page.tsx` | NEW — list page replacing `[[...action]]`; uses `ROUTES.ADMIN.COUPONS_NEW` + `ROUTES.ADMIN.COUPONS_EDIT` |
| `src/app/[locale]/admin/carousel/page.tsx` | NEW — list page replacing `[[...action]]` |
| `src/app/[locale]/admin/bids/page.tsx` | NEW — list page replacing `[[...action]]` |
| `src/app/[locale]/admin/deals/page.tsx` | NEW — list page replacing `[[...action]]`; hardcoded hrefs → `ROUTES.ADMIN.PRODUCTS_NEW/EDIT` |
| `src/app/[locale]/admin/featured/page.tsx` | NEW — list page replacing `[[...action]]`; hardcoded hrefs → `ROUTES.ADMIN.PRODUCTS_NEW/EDIT` |
| `src/app/[locale]/admin/orders/page.tsx` | NEW — list page replacing `[[...action]]` |
| `src/app/[locale]/admin/reviews/page.tsx` | NEW — list page replacing `[[...action]]` |
| `src/app/[locale]/admin/sections/page.tsx` | NEW — list page replacing `[[...action]]` |
| `src/app/[locale]/admin/users/page.tsx` | NEW — list page replacing `[[...action]]` |
| `src/app/[locale]/admin/blog/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/coupons/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/carousel/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/bids/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/deals/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/featured/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/orders/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/reviews/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/sections/[[...action]]/page.tsx` | DELETED |
| `src/app/[locale]/admin/users/[[...action]]/page.tsx` | DELETED |
| `src/components/routing/CartRouteClient.tsx` | RC3: checkout `<Button onClick→router.push>` → `<Button asChild><Link>` (with disabled-state conditional) |
| `src/components/user/ProfilePageClient.tsx` | RC3: "Manage Addresses" `<button onClick→router.push>` → `<Link>`; removed unused useRouter import + call |
| `src/components/user/UserAddressesClient.tsx` | RC3: "+ Add Address" `<button onClick→router.push>` → `<Link>`; added Link import |
| `src/app/[locale]/store/sublisting-categories/page.tsx` | RC3: "Edit" `<button onClick→router.push>` → `<Link>`; removed hardcoded `#6366f1` CSS var fallback; removed useRouter |
| `crud-tracker.md` | RC3 ✅, RC4 ✅, Session 88 row marked Done |
| `prompt.md` | LAST COMPLETED updated to Session 88; NEXT updated to Session 89 |
| `newchange.md` | This entry |
| `memory/project_status.md` | Updated with session 88 summary |

## Deferred Items

_None._

---

# Hotfix 87.2 — 2026-05-10 (firebase-admin/database missing in Vercel Lambda)

## Scope
Google OAuth login failing in prod with "Cannot find module '/var/task/node_modules/firebase-admin/lib/database/index.js'". Added `outputFileTracingIncludes` to `next.config.js` to force Vercel to copy the RTDB files into Lambda bundles.

## Root Cause
`appkit/src/providers/db-firebase/admin.ts` uses `(module as any).require("firebase-admin/database")` — intentionally bypasses webpack static analysis. Vercel's output file tracer therefore never sees this dependency, so `lib/database/**` is excluded from the Lambda `/var/task/node_modules/`. At runtime, `module.require("firebase-admin/database")` fails with ENOENT.

## Changed Files

| File | Change |
|------|--------|
| `next.config.js` | Added `experimental.outputFileTracingIncludes` — forces `firebase-admin/lib/database/**` + `/lib/esm/database/**` into every `/api/**` Lambda bundle |
| `newchange.md` | This entry |

## Deferred Items

_None._

---

# Hotfix 87.1 — 2026-05-10 (CSS responsive display utilities + dev memory cap)

## Scope
Main navbar (Home/Products/Auctions/…) and "Today's Deals" pill invisible at desktop breakpoints on both dev and Vercel prod. Root cause: host Tailwind JIT only scans `./src/**`; appkit's `NavbarLayout` (`hidden lg:block`) and `TitleBarLayout` (`hidden lg:flex`) classes never appeared in host source, so they were never generated by the host build. Also capped dev server Node.js heap from 4 GB → 2 GB to match Vercel's prod environment.

## Root Cause
`NavbarLayout.tsx:91` — `className="hidden lg:block ..."` — both `hidden` and `lg:block` must coexist in the CSS for the navbar to appear at ≥1024 px. The appkit pre-built `tailwind-utilities.css` ships these classes but the host's `globals.css` `@tailwind utilities` layer independently re-generates utilities from its own content scan. `lg:block` (and `lg:flex`, `lg:hidden` etc.) are absent from `./src/**` → omitted → cascade conflict at desktop.

## Fix
Added critical responsive display utilities to `tailwind.config.js` `safelist` so the host's own Tailwind always emits them regardless of content scanning.

## Changed Files

| File | Change |
|------|--------|
| `tailwind.config.js` | Added `hidden`, `block`, `flex`, `lg:block`, `lg:flex`, `lg:hidden`, `md:block`, `md:flex`, `md:hidden`, `xl:flex`, `xl:hidden`, `xl:block`, `sm:flex`, `sm:hidden`, `sm:block` to `safelist` |
| `package.json` | `dev:only` memory: `--max-old-space-size=4096` → `2048` to match Vercel 2 GB prod cap |
| `newchange.md` | This entry |
| `prompt.md` | LAST COMPLETED updated with hotfix entry |
| `memory/project_status.md` | Updated with hotfix summary |

## Deferred Items

_None._

---

# Session 87 — 2026-05-10 (Social Feed S1–S5)

## Scope
Social Feed feature complete: API route + fetchers (S1), SocialFeedSection RSC + SocialPostCard (S2), admin sections builder UI (S3), VA8 credential fields for Meta/TikTok/DeviantArt (S4), seed data pre-existing (S5). Fixed pre-existing `dynamic()` chart type errors in AdminAnalyticsCharts + SellerRevenueChart (cast to `React.ComponentType<any>`; also replaced hardcoded hex with CSS variable tokens). Both repos tsc 0 errors. appkit dist rebuilt.

## Changed Files

| File | Change |
|------|--------|
| `appkit/src/features/admin/components/AdminSectionsView.tsx` | Added `renderSocialFeedBuilder()` function; wired in `renderTypedBuilder()` as `case "social-feed"` |
| `appkit/src/features/admin/components/AdminSiteSettingsView.tsx` | Added 7 social credential state vars (`metaPageAccessToken`, `metaPageId`, `tiktokClientKey`, `tiktokClientSecret`, `tiktokAccessToken`, `deviantartClientId`, `deviantartClientSecret`); load from `credentialsMasked`; include in `integrationsMutation`; 3 UI groups in ⑧ Integrations tab |
| `appkit/src/features/admin/components/analytics/AdminAnalyticsCharts.tsx` | Fixed `dynamic()` recharts TS errors (cast to `ComponentType<any>`); replaced hardcoded `#3b82f6`/`#10b981` with `var(--appkit-color-primary/secondary)` |
| `appkit/src/features/seller/components/analytics/SellerRevenueChart.tsx` | Fixed `dynamic()` recharts TS errors (cast to `ComponentType<any>`); replaced hardcoded `#6366f1`/`#6b7280` with `var(--appkit-color-primary)`/`currentColor` |
| `crud-tracker.md` | S1–S5 marked ✅; Session 87 row marked Done |
| `newchange.md` | This entry |
| `prompt.md` | LAST COMPLETED updated to Session 87; NEXT updated to Session 88 |

## Deferred Items

_None._

---

# Session 86 — 2026-05-10 (Grouped Listings GP1+GP2)

## Scope
Full implementation of grouped listings: product schema extension, batch-write repository methods, ShowGroupSection display component, GroupSettingsPanel edit component, all store + admin CRUD API routes, public group fetch route, seed data, Firebase indexes. appkit 2.4.9 published.

## Changed Files

| File | Change |
|------|--------|
| `appkit/src/features/products/schemas/firestore.ts` | Added 5 group fields to `ProductDocument` + updatable/public field arrays |
| `appkit/src/features/products/types/index.ts` | Added group fields to `ProductItem` |
| `appkit/src/features/products/repository/products.repository.ts` | Added 7 group methods: `findByGroupId`, `startGroup`, `updateGroupTitle`, `dissolveGroup`, `linkChildToGroup`, `unlinkChildFromGroup`, `leaveGroup`, `addChildProduct` |
| `appkit/src/features/products/components/ShowGroupSection.tsx` | NEW — circular thumb HorizontalScroller + Modal/SideDrawer table |
| `appkit/src/features/products/components/GroupSettingsPanel.tsx` | NEW — 3-state panel (not-in/is-parent/is-child) with add/link/dissolve/leave |
| `appkit/src/features/products/components/ProductDetailView.tsx` | Added `renderGroupSection` render prop |
| `appkit/src/features/products/components/PreOrderDetailView.tsx` | Added `renderGroupSection` render prop |
| `appkit/src/features/products/components/ProductDetailPageView.tsx` | Wired `ShowGroupSection` via `renderGroupSection` |
| `appkit/src/features/pre-orders/components/PreOrderDetailPageView.tsx` | Wired `ShowGroupSection` via `renderGroupSection` |
| `appkit/src/features/products/components/ProductForm.tsx` | Added `renderGroupSettings` render prop |
| `appkit/src/features/admin/components/AdminProductEditorView.tsx` | Wired `GroupSettingsPanel` via `renderGroupSettings` |
| `appkit/src/features/products/components/index.ts` | Exported `ShowGroupSection`, `GroupSettingsPanel`, `GroupSettingsPanelProps` |
| `appkit/src/features/grouped/schemas/firestore.ts` | `GroupedListingDocument` + `GROUPED_LISTINGS_COLLECTION` |
| `appkit/firebase/base/firestore.indexes.json` | Added 4 indexes: products(groupId+isAuction+status, groupId+status+price), groupedListings(storeId+isActive+createdAt, isFeatured+isActive+createdAt) |
| `src/app/api/products/group/[groupId]/route.ts` | NEW — public GET, returns group members |
| `src/app/api/store/products/[id]/group/route.ts` | NEW — POST/PATCH/DELETE (start/update-title/dissolve) |
| `src/app/api/store/products/[id]/group/children/route.ts` | NEW — POST (create/link child) |
| `src/app/api/store/products/[id]/group/children/[childId]/route.ts` | NEW — DELETE (unlink child) |
| `src/app/api/store/products/[id]/group/leave/route.ts` | NEW — DELETE (child leaves group) |
| `src/app/api/admin/products/[id]/group/route.ts` | NEW — admin POST/PATCH/DELETE |
| `src/app/api/admin/products/[id]/group/children/route.ts` | NEW — admin POST (create/link) |
| `src/app/api/admin/products/[id]/group/children/[childId]/route.ts` | NEW — admin DELETE (unlink) |
| `src/app/api/admin/products/[id]/group/leave/route.ts` | NEW — admin DELETE (leave) |
| `src/constants/api.ts` | Added `PRODUCT_GROUP`, `PRODUCT_GROUP_CHILDREN`, `PRODUCT_GROUP_CHILD`, `PRODUCTS.GROUP` constants |
| `appkit/package.json` | Bumped 2.4.8 → 2.4.9 |
| `package.json` | Updated `@mohasinac/appkit` to `^2.4.9` |

## Deferred Items

| Item | Reason | Fix target |
|------|--------|------------|
| `ShowGroupSection` tab navigation to member detail pages | Needs `ROUTES.PUBLIC.PRODUCT` which depends on slug pattern — currently uses relative path | Future routing pass |
| Child product image upload in `GroupSettingsPanel` | MediaUploadField not wired (children start with empty mainImage) | Seller can edit the child product's full form afterward |

---

# Session 86-hotfix — 2026-05-10 (Google Auth RTDB fault-tolerance + PII encryption fix)

## Scope
Bug fix session. Google OAuth popup flow was silently failing when Firebase RTDB was unavailable: the init route threw, the auth event node was never created, and user profiles were saved with unencrypted PII (or not saved at all). No new features — all changes are hardening existing auth + encryption paths.

## What changed

| File | Change |
|------|--------|
| `src/app/api/auth/event/init/route.ts` | RTDB write wrapped in try/catch; returns `rtdbEnabled: false` when RTDB is down so client knows to skip subscription |
| `src/app/api/auth/google/callback/route.ts` | RTDB anti-replay check wrapped in try/catch (graceful skip when RTDB down); success redirect now passes `uid`, `role`, `isNew` params to `/auth/close` for postMessage payload |
| `src/app/[locale]/auth/close/page.tsx` | Sends `window.opener.postMessage({ type: "letitrip_auth_close", ... })` on mount — both success (with uid/role/isNewUser) and error (with message) — as fallback when RTDB subscription is unavailable |
| `appkit/src/features/auth/hooks/useAuth.ts` (`useGoogleLogin`) | `calledRef` prevents double-resolution when both RTDB and postMessage fire; `popupPending` state keeps `isLoading=true` while popup is open without RTDB; `postMessage` listener effect (empty deps, mounted once); RTDB FAILED no longer short-circuits to `onError` — waits for postMessage; skips RTDB subscription when `rtdbEnabled !== false` |
| `appkit/src/features/auth/repository/user.repository.ts` | Removed `addPiiIndices` from `encryptUserData` — it was spreading original plaintext data back after `encryptPiiFields`, defeating encryption of `email`/`phoneNumber`; added `createWithId` override so Google-auth profile creation goes through `encryptUserData` (base `createWithId` bypassed encryption) |
| `appkit/src/features/products/components/GroupSettingsPanel.tsx` | Pre-existing bug: `<SideDrawer open={…}` → `isOpen={…}` (SideDrawer prop name) |
| `appkit/src/features/products/components/ShowGroupSection.tsx` | Same SideDrawer `open` → `isOpen` fix |
| `appkit/package.json` | Bumped `2.4.7` → `2.4.8` |
| `package.json` | `@mohasinac/appkit` updated to `^2.4.8` |

## Deferred
None — all changes are self-contained bug fixes.

---

# Session 85 — 2026-05-10 (Sub-listing Categories SC1→SC4 + Store CRUD)

## Scope
Full sub-listing category feature: schema, repository, admin CRUD, seller-facing form field + carousel section, public browse page, store-owner CRUD pages. appkit bumped to 2.4.6.

## What changed

| File | Change |
|------|--------|
| `appkit/src/features/products/schemas/sublisting-categories.ts` | Schema: `SublistingCategoryDocument`, `SublistingCategoryCreateInput`, `SublistingCategoryUpdateInput` |
| `appkit/src/features/products/schemas/firestore.ts` | Added `sublistingCategoryId?` to `ProductDocument`, `PRODUCT_PUBLIC_FIELDS`, `PRODUCT_UPDATABLE_FIELDS` |
| `appkit/src/features/products/repository/sublisting-categories.repository.ts` | Full repository: list, findBySlug, create, update, delete (batch unlink), getListingsByCategoryId, incrementProductCount |
| `appkit/src/repositories/index.ts` | Exported `SublistingCategoriesRepository`, `sublistingCategoriesRepository` |
| `appkit/src/index.ts` | Exported new types + `sublistingCategoriesRepository` + components |
| `appkit/src/features/admin/components/AdminSublistingCategoriesView.tsx` | Admin list view (DataTable, search, sort) |
| `appkit/src/features/admin/components/AdminSublistingCategoryEditorView.tsx` | Admin create/edit form (name, itemCode, description, coverImage) |
| `appkit/src/features/admin/components/index.ts` | Exported new admin views |
| `appkit/src/features/products/components/SublistingCategorySelect.tsx` | Self-contained dropdown for ProductForm |
| `appkit/src/features/products/components/SublistingCarouselSection.tsx` | Collapsible carousel (circular thumbs, CSS vars, price chips) |
| `appkit/src/features/products/components/ProductDetailView.tsx` | Added `renderSublistingSection` prop → `afterMain` |
| `appkit/src/features/products/components/AuctionDetailView.tsx` | Added `renderSublistingSection` prop → merged into `afterMain` with mobileBidForm |
| `appkit/src/features/products/components/PreOrderDetailView.tsx` | Added `renderSublistingSection` prop → `afterMain` |
| `appkit/src/features/products/components/ProductDetailPageView.tsx` | Wired `SublistingCarouselSection` via `renderSublistingSection` |
| `appkit/src/features/auctions/components/AuctionDetailPageView.tsx` | Wired `SublistingCarouselSection` via `renderSublistingSection` |
| `appkit/src/features/pre-orders/components/PreOrderDetailPageView.tsx` | Wired `SublistingCarouselSection` via `renderSublistingSection` |
| `appkit/src/features/products/components/index.ts` | Exported `SublistingCategorySelect`, `SublistingCarouselSection` |
| `appkit/src/next/routing/route-map.ts` | Added `ROUTES.STORE.SUBLISTING_CATEGORIES*` and confirmed admin/public routes |
| `appkit/src/constants/api-endpoints.ts` | Added `ADMIN_ENDPOINTS.SUBLISTING_CATEGORIES*` |
| `appkit/src/seed/sublisting-categories-seed-data.ts` | Rewrote with correct schema (12 entries across all verticals) |
| `appkit/firebase/base/firestore.indexes.json` | Added 3 new composite indexes: products(sublistingCategoryId+status+price), sublistingCategories(name+createdAt), sublistingCategories(productCount+createdAt) |
| `appkit/package.json` | Bumped to 2.4.6 |
| `src/app/api/admin/sublisting-categories/route.ts` | Added "seller" to GET roles |
| `src/app/api/store/sublisting-categories/route.ts` | NEW — GET (list) + POST (create, seller-owned) |
| `src/app/api/store/sublisting-categories/[id]/route.ts` | NEW — GET + PUT + DELETE (ownership check for sellers) |
| `src/app/[locale]/admin/sublisting-categories/page.tsx` | Admin list page |
| `src/app/[locale]/admin/sublisting-categories/new/page.tsx` | Admin create page |
| `src/app/[locale]/admin/sublisting-categories/[id]/edit/page.tsx` | Admin edit page |
| `src/app/[locale]/sublisting-categories/[slug]/page.tsx` | NEW — public category browse page (RSC, generateMetadata) |
| `src/app/[locale]/store/sublisting-categories/page.tsx` | NEW — store list + CRUD actions |
| `src/app/[locale]/store/sublisting-categories/new/page.tsx` | NEW — store create form |
| `src/app/[locale]/store/sublisting-categories/[id]/edit/page.tsx` | NEW — store edit form |
| `src/constants/api.ts` | Added `API_ROUTES.STORE.SUBLISTING_CATEGORIES*` |
| `src/constants/navigation.tsx` | Added "Sub-listing Groups" to `STORE_NAV_GROUPS` + "Sub-listings" to `ADMIN_NAV_GROUPS` |
| `src/components/dev/SeedPanel.tsx` | Updated `sublistingCategories` entry (correct schema fields, 12 seeded items) |
| `package.json` | Bumped `@mohasinac/appkit` to `^2.4.6` |

## Deferred
| Item | Reason | Fix target |
|------|--------|------------|
| `SublistingCategorySelect` uses admin endpoint | Sellers allowed on admin GET, so the selector works for all roles. If admin endpoint is ever locked to admin-only, the select needs to switch to store endpoint. | Future if needed |
| Public listing grid uses raw `<img>` | SC4 public page uses `<img>` with `loading="lazy"`. Could be `next/image` but requires known dimensions. | P-image optimization pass |

---

# Hotfix — 2026-05-10 (Tailwind layout broken + appkit self-contained CSS)

## Scope
Root cause: npm package only ships `dist/`, not `src/`. Tailwind content path `src/**` matched nothing → all appkit utility classes purged → complete layout failure.
Fix 1: corrected Tailwind content path in host (immediate fix).
Fix 2: appkit now pre-compiles its own 141 KB Tailwind utilities into `dist/tailwind-utilities.css` (long-term fix). Host no longer scans appkit.
Also fixed: pre-existing SC1 type errors (missing exports, `sublistingCategoryId` in `ProductItem`, `slug` in create input, stray `q` param).

## What changed

| File | Change |
|------|--------|
| `appkit/tailwind.config.js` | NEW — full shared theme config, `preflight: false`, scans `./src/**` |
| `appkit/src/tailwind-input.css` | NEW — `@tailwind utilities;` entry for build step |
| `appkit/src/styles.css` | Added `@import "./tailwind-utilities.css"` |
| `appkit/package.json` | Added `tailwindcss ^3.4.0` devDep; build step adds `tailwindcss … --minify`; pinned `@types/react` to `19.1.0` to avoid React 19.2 default-import regression; bumped `2.4.3 → 2.4.5` |
| `appkit/src/features/products/types/index.ts` | Added `sublistingCategoryId?: string` to `ProductItem` |
| `appkit/src/features/admin/components/AdminSublistingCategoryEditorView.tsx` | Fixed `category:` → `name:` in `generateMediaFilename` call |
| `appkit/src/index.ts` | Exported `AdminSublistingCategoriesView`, `AdminSublistingCategoryEditorView`, `AdminSublistingCategoryEditorViewProps` |
| `tailwind.config.js` | Removed appkit dist scan (appkit self-compiles now); updated comment |
| `package.json` | Bumped `@mohasinac/appkit` to `^2.4.5` |
| `src/app/api/admin/sublisting-categories/route.ts` | Removed stray `q` param from `SieveModel` call; added `slug` to `create()` input |

## Deferred
None.

---

# Session 84 — 2026-05-10 (L1 + L2 + L3 Custom Fields)

## Scope
L1: CustomField/CustomSection schema + CustomFieldsEditor component.
L2: ProductTabsShell customTabs + CustomSectionTabContent + all 3 detail page views.
L3: CustomSectionsEditor in ProductForm.

## What changed

| File | Change |
|------|--------|
| `appkit/src/features/products/schemas/firestore.ts` | Added `CustomField`, `CustomSection`, `CustomFieldType` types; `MAX_CUSTOM_FIELDS=50`, `MAX_CUSTOM_SECTIONS=3`; `ProductDocument` +`customFields?` +`customSections?`. |
| `appkit/src/features/products/schemas/index.ts` | Added Zod schemas for `customFields` and `customSections` arrays. |
| `appkit/src/features/products/types/index.ts` | `ProductItem` +`customFields?` +`customSections?`; re-exports from firestore types. |
| `appkit/src/features/products/components/CustomFieldsEditor.tsx` | NEW — client component: 4-col grid rows (key/type/value/remove); boolean=Yes/No Select; URL type; add/remove; max-50 badge. |
| `appkit/src/features/products/components/CustomSectionsEditor.tsx` | NEW — client component: up to 3 sections; title/textarea/CustomFieldsEditor per section; add/remove panels; counter. |
| `appkit/src/features/products/components/CustomSectionTabContent.tsx` | NEW — RSC: renders section.text as RichText + fields as dl key-value; URL fields = anchor; empty state fallback. |
| `appkit/src/features/products/components/ProductTabsShell.tsx` | Added `customTabs?: CustomTabDef[]`; dynamic tabs after static ones; active border = `var(--appkit-color-primary)`. |
| `appkit/src/features/products/components/ProductDetailPageView.tsx` | Extracts `customSections` from product doc; passes as `customTabs` to `ProductTabsShell`. |
| `appkit/src/features/auctions/components/AuctionDetailPageView.tsx` | Same customSections extraction + customTabs pass-through. |
| `appkit/src/features/pre-orders/components/PreOrderDetailPageView.tsx` | Same customSections extraction + customTabs pass-through. |
| `appkit/src/features/products/components/ProductForm.tsx` | Added "Custom Sections" block before `shippingInfo`; renders `CustomSectionsEditor`. |
| `appkit/src/features/products/components/index.ts` | Exported all 3 new components + `CustomTabDef` type. |

## Deferred

None. L1/L2/L3 fully implemented per spec.

---

# Session 83-cont — 2026-05-10 (VD9 + VD10 content)

## Scope
VD9: becomeSeller expansion + sellerGuide collectibles rewrite.
VD10: Legal pages — terms, privacy, cookies, refundPolicy.

## What changed

| File | Change |
|------|--------|
| `messages/en.json` | `becomeSeller` 9 → 41 keys (8 guide sections, earnings breakdown ₹917.40, 3 seller tiers). `sellerGuide` 42 keys rewritten collectibles-specific. `terms` 7 → 15 sections (IT Act 2000, Consumer Protection Act 2019, prohibited items, Maharashtra jurisdiction). `privacy` 7 → 11 sections (DPDP Act 2023 §5 rights, DPO, data retention, children's privacy). `cookies` with specific cookie names (Firebase, GA4, Razorpay). `refundPolicy` 8 collectibles sections (sealed, graded, auction, pre-order, authenticity, transit damage, return shipping). |
| `scripts/update-content-vd9-vd10.mjs` | One-off patch script (atomic JSON update to avoid editing 1043-line diff manually). |

## Deferred

None.

---

# Alpha Release — 2026-05-10 (appkit publish + Vercel prod deploy)

## Scope

Verify alpha gate (sessions 77–80 ✅), publish `@mohasinac/appkit`, and deploy letitrip to Vercel prod.

## What changed

| File | Change |
|------|--------|
| `appkit/package.json` | Version `2.3.2 → 2.4.3`; added `"sideEffects": false` (critical for Turbopack tree-shaking) |
| `appkit/src/index.ts` | Added `SCAM_CATEGORIES`, `ScamCategoryDefinition` exports |
| `appkit/src/next/routing/route-map.ts` | Added `ROUTES.PUBLIC.SCAM_TYPES = "/scams/types"` |
| `appkit/src/client.ts` | Added SCAM_TYPES, SCAM_CATEGORIES, SCAM_TYPE_LABELS, SCAM_PLATFORM_LABELS + types (SCAM3 partial) |
| `appkit/src/features/scams/actions/scam-actions.ts` | Added `ScammerProfilePageData` + `getScammerProfilePageData()` (parallel fetch: incidents + comments + related) |
| `appkit/src/features/scams/repository/scammer.repository.ts` | Added `listPublicIncidents()`, `listPublicComments()`, `findManyById()` subcollection methods |
| `appkit/src/seed/payouts-seed-data.ts` | Expanded 7 → 25+ records (P27) |
| `package.json` | `@mohasinac/appkit: "file:./appkit"` → `"^2.4.3"` (npm registry) |
| `package-lock.json` | Regenerated clean — resolves from `https://registry.npmjs.org/` (was `"link": true` to local path) |
| `src/app/[locale]/scams/types/page.tsx` | NEW — `/scams/types` static page: all 27 scam patterns by category (SCAM3 partial) |
| `src/app/api/demo/seed/route.ts` | Protect admin user (`user-admin-letitrip`) from seed delete — skip with `PROTECTED_UIDS` set |
| `CLAUDE.md` | Added **appkit Export Rules** section (what belongs in index/client/server.ts + Turbopack trap explanation) and **Appkit Publish & Deploy Rules** section (9-step checklist); added 4 new anti-patterns to Known TS Patterns to Avoid |

## Root cause: Turbopack client-bundle trap

`appkit/src/index.ts` re-exports `providers/storage-firebase` which has a static top-level `import from "firebase-admin/app"`. Local dev uses **webpack**, which externalizes firebase-admin via `next.config.js` `externals`. **Vercel production uses Turbopack**, which ignores webpack `externals` and includes the full import chain in the client bundle → `child_process`/`fs` not found in browser → build failure.

Fix: `"sideEffects": false` in `appkit/package.json` — tells both webpack and Turbopack to tree-shake any re-exported module whose symbols are not consumed. Client components that don't use `firebaseStorageProvider` no longer pull in the firebase-admin chain.

## File:./appkit vs npm registry

`file:./appkit` in `package.json` works locally (webpack + externals handles the firebase chain). It breaks on Vercel because `appkit/dist/` is gitignored, Vercel CLI excludes it when uploading, and `npm ci` links to a dist-less directory. Always publish to npm and update the version pin before deploying.

## Deferred

None.

---

# Session 83 — 2026-05-10 (SCAM3 live data + SCAM5 form + VD8 about rewrite)

## Scope
SCAM3 subcollection live data wired, SCAM5 form built, VD8 about content rewritten. VD9/VD10 deferred.

## What changed

| File | Change |
|------|--------|
| `appkit/src/features/scams/repository/scammer.repository.ts` | Added `listPublicIncidents()`, `listPublicComments()`, `findManyById()` subcollection query methods |
| `appkit/src/features/scams/actions/scam-actions.ts` | Added `getScammerProfilePageData()` server action (parallel fetch of scammer + incidents + comments + relatedScammers) |
| `appkit/src/features/scams/components/ScamProfileView.tsx` | Extended props with `incidents?/comments?/relatedScammers?`; replaced EmptyState placeholders with real data-driven incident cards, comment cards (role/Accused/Victim badges), related scammer links |
| `appkit/src/index.ts` | Exported `getScammerProfilePageData`, `ScammerProfilePageData` |
| `appkit/src/client.ts` | Exported scam constants (SCAM_TYPES, SCAM_CATEGORIES, SCAM_PLATFORM_LABELS, ScamPlatformValues) for client bundles |
| `src/app/[locale]/scams/types/page.tsx` | Fixed import from `@mohasinac/appkit` (was `@mohasinac/appkit/scams`); revalidate=3600 |
| `src/app/[locale]/scams/[id]/page.tsx` | Rewired to `getScammerProfilePageData()`; passes incidents/comments/relatedScammers to ScamProfileView |
| `src/app/[locale]/scams/report/page.tsx` | Full ScamReportForm: 3 sections (identity, what happened, privacy), TagInput for phones/UPIs/emails, live scam type helper, char counter, POST /api/scams/reports |
| `src/app/api/scams/reports/route.ts` | POST route: auth required, Zod validation, paise conversion, creates pending_review doc |
| `src/constants/api.ts` | Added `API_ROUTES.SCAMS.REPORTS` |
| `messages/en.json` | `about` namespace (25 keys) rewritten — collectibles-specific mission, values, milestones, CTA |
| `asciiDiagrams.md` | Updated Scam Registry diagram to ✅; added /scams/types layout, full /scams/[id] detail, /scams/report form |
| `crud-tracker.md` | SCAM3 ✅, VD8 ✅, Session 83 row updated |

## Deferred

| Task | What was deferred | Fix target |
|------|-------------------|------------|
| SCAM5 | Evidence file upload to Firebase Storage (note shown in form, no upload) | I6 / post-alpha |
| SCAM5 | Soft ban check (`report_scammers` permission) | BAN system (Session 99) |
| SCAM5 | Rate limit enforcement (pending count query) | SCAM5 follow-up |
| SCAM5 | Suggested scammers duplicate detection (`GET /api/scams/suggest`) | SCAM5 follow-up |
| VD9 | becomeSeller / sellerGuide namespace expansion | Session 83 follow-up |
| VD10 | Legal policy pages (terms, privacy, cookies, refundPolicy) | Session 83 follow-up |

---

# SCAM3 + SCAM5 — 2026-05-10

## Scope
SCAM3 remaining pieces + SCAM5 form + API.

## What changed

### SCAM3 — /scams/types page + ScamProfileView additions
- `src/app/[locale]/scams/types/page.tsx` — new RSC; 7 category sections from `SCAM_CATEGORIES`; 2-column Card grid per category showing each ScamType label, shortDescription, howItHappens (first 150 chars), howToAvoid as numbered list; `generateMetadata`; breadcrumb; CTA footer.
- `appkit/src/features/scams/components/ScamProfileView.tsx` — added "How to Avoid This Scam" numbered block (from `getScamType`) after "What Happened"; added three EmptyState placeholder sections: "Additional Incidents", "Community Discussion", "Related Profiles"; extended `ScamProfileViewProps` with optional `incidents?`, `comments?`, `relatedScammers?` props.
- `appkit/src/next/routing/route-map.ts` — `ROUTES.PUBLIC.SCAM_TYPES = "/scams/types"` (already in prev commit).
- `appkit/src/index.ts` — added `SCAM_CATEGORIES` + `ScamCategoryDefinition` exports (already in prev commit).

### Deferred (SCAM3)
- Subcollection live data (incidents subcollection API, live comments, live related scammers) — requires backend subcollection queries. Deferred to post-SCAM3.

### SCAM5 — ScamReportForm actual fields + POST /api/scams/reports
- `src/app/[locale]/scams/report/page.tsx` — replaced EmptyState placeholder with full 3-section form: (1) Scammer identity: displayName + TagInput for phones/UPIs/emails; (2) What happened: scamType select with live howItHappens helper below, scamPlatform select, amountLost, itemInvolved, description textarea (min 100 chars + char counter); (3) Privacy: reportedByAnon checkbox + required agreement checkbox. Submit → POST /api/scams/reports → redirect to registry on success.
- `src/app/api/scams/reports/route.ts` — new POST route; auth required; zod schema validates displayName/scamType/scamPlatform/description (min 100); parses comma-sep phones/upiIds/emails; converts ₹ amountLost to paise; creates pending_review doc via `scammerRepository.create()`.
- `src/constants/api.ts` — added `API_ROUTES.SCAMS.REPORTS = "/api/scams/reports"`.
- `appkit/src/index.ts` + `dist/index.d.ts` + `dist/index.js` — exports `scammerRepository` from repositories/index.

### Deferred (SCAM5)
- Evidence file upload to Firebase Storage — deferred to I6/post-alpha. Simple note shown in form.
- Soft ban check (`report_scammers` ban) — deferred.
- Rate limit enforcement (max pending reports per user) — deferred.
- Suggested scammers (duplicate detection via `findByContactField`) — deferred to SCAM5 followup.

---

# P27 Payouts Expansion — 2026-05-10

## Scope
P27 (partial) — payouts seed expansion 7 → 25+

## What changed
| File | Change |
|------|--------|
| `appkit/src/seed/payouts-seed-data.ts` | Expanded 7 → 25+ records. All 8 stores. PAID×14, PENDING×6, PROCESSING×3, FAILED×2. |

## Deferred
None.

---

# Session 81-impl — 2026-05-10 (Store Finance)

## Scope

C3, VB1, C4+VB2+LL7, VB7, LL9, LL10 — Store coupons editor, orders detail drawer, addresses CRUD, bids view, payouts fix.

## What changed

| File | Change |
|------|--------|
| `appkit/src/constants/api-endpoints.ts` | Fixed ALL `SELLER_ENDPOINTS` from `/api/seller/*` → `/api/store/*`. Added `COUPON_BY_ID`, `STORE_ADDRESS_BY_ID`, `BIDS`, `ORDERS_BY_ID`. |
| `appkit/src/features/seller/hooks/useSellerListingData.ts` | Added `refetch` to `UseSellerListingDataResult` interface + return value. |
| `appkit/src/features/seller/components/SellerCouponEditorView.tsx` | NEW — create/edit form for seller coupons. Exports `CouponEditorDraft` + `SellerCouponEditorViewProps`. Fields: code, type, value, maxDiscount, minPurchase, totalLimit, perUserLimit, startDate, endDate, isActive. Code disabled on edit. |
| `appkit/src/features/seller/components/SellerCouponsView.tsx` | Rewritten — added `onCreateClick`, `onEditClick`, `onToggle`, `onDelete` props. Custom DataTable columns with Badge status. renderRowActions with Pencil/Toggle/Trash. `extra` prop for Add Coupon button. |
| `appkit/src/features/seller/components/SellerOrdersView.tsx` | Rewritten — `OrderDetailDrawer` sub-component fetches order, shows items/address/payment, status select + tracking inputs, PATCH save. Main view: custom columns, Eye button opens drawer. |
| `appkit/src/features/seller/components/SellerAddressesView.tsx` | Rewritten — full self-contained CRUD. Lists store addresses as cards with Edit/Delete. Add/Edit SideDrawer form. Uses `SELLER_ENDPOINTS.STORE_ADDRESSES`. |
| `appkit/src/features/seller/components/SellerBidsView.tsx` | NEW — read-only DataTable of bids on store's auctions. Columns: Auction, Bidder, Bid ₹, Status badge, Date. Status filter sidebar. |
| `appkit/src/features/seller/components/index.ts` | Added exports: `SellerCouponEditorView`, `CouponEditorDraft`, `SellerBidsView`, `StoreBidsView`. |
| `appkit/src/index.ts` | Added exports: `SellerCouponEditorView`, `CouponEditorDraft`, `SellerCouponEditorViewProps`, `SellerBidsView`, `SellerBidsViewProps`, `StoreBidsView`. |
| `appkit/src/client.ts` | Added: `SellerCouponEditorView`, `SellerBidsView`, `SellerAddressesView` + type exports. |
| `appkit/src/next/routing/route-map.ts` | Added `ROUTES.STORE.BIDS = "/store/bids"`. |
| `src/app/api/store/addresses/route.ts` | NEW — GET + POST. GET: lists store addresses. POST: creates via storeAddressRepository. |
| `src/app/api/store/addresses/[id]/route.ts` | NEW — PUT + DELETE. PUT: updates address. DELETE: deletes address. Both verify store ownership. |
| `src/app/api/store/bids/route.ts` | NEW — GET. Fetches store's auction productIds, queries bids for those products. Optional `?productId=` filter. |
| `src/app/[locale]/store/coupons/page.tsx` | Rewritten — passes `onCreateClick`, `onEditClick`, `onToggle`, `onDelete` callbacks. |
| `src/app/[locale]/store/coupons/new/page.tsx` | Rewritten — "use client", renders `SellerCouponEditorView`, POSTs to `/api/store/coupons`. |
| `src/app/[locale]/store/coupons/[id]/edit/page.tsx` | NEW — fetches coupon, converts paise→rupees, renders `SellerCouponEditorView` with `initial`. |
| `src/app/[locale]/store/addresses/page.tsx` | Updated — passes `apiBase={API_ROUTES.STORE.ADDRESSES}`. |
| `src/app/[locale]/store/bids/page.tsx` | NEW — renders `SellerBidsView`. |
| `src/constants/api.ts` | Added `STORE.ADDRESSES`, `STORE.ADDRESS_BY_ID`, `STORE.BIDS`. |
| `src/constants/navigation.tsx` | Added Bids nav item to STORE_NAV_GROUPS "Orders & Reviews". |

## TS errors
0 in both repos after build.

---

# Session 79 — 2026-05-10 (Cart Integrity)

## Scope

W1 (cart stale validate endpoint), W2 (wishlist stale validate endpoint), W3 (OOS cart section), W4 (CartItemRow product links + OOS styling), R1 (auth cart mutations + notification toasts). Plus 5 pre-existing TS error fixes.

## What changed

| File | Change |
|------|--------|
| `appkit/src/features/cart/components/CartDrawer.tsx` | `CartItemRow` augmented: `href?: string` (title becomes `<a target="_blank">`), `isOutOfStock?: boolean` (opacity-60, badge, locked qty stepper). |
| `appkit/src/features/seller/components/SellerPayoutSettingsView.tsx` | `helperText` → `helpText` (2 occurrences) — pre-existing TS error fix. |
| `appkit/src/features/seller/components/SellerShippingView.tsx` | `helperText` → `helpText` (2 occurrences) — pre-existing TS error fix. |
| `appkit/src/features/seller/components/index.ts` | Added `SellerReviewsView` export. |
| `appkit/src/client.ts` | Added exports: SellerPayoutSettingsView, SellerShippingView, SellerReviewsView, SellerPayoutRequestView, SellerAnalyticsStats, SellerTopProducts, SellerAnalyticsView, SellerPayoutsView + type exports. |
| `src/app/api/cart/validate/route.ts` | NEW — POST /api/cart/validate. No auth. Accepts `{ productIds: string[] }`. Returns `{ stale, outOfStock }`. |
| `src/app/api/user/wishlist/validate/route.ts` | NEW — POST /api/user/wishlist/validate. Auth required. Batch-checks wishlist items, deletes stale from Firestore. Returns `{ removedCount, removedProductIds }`. |
| `src/app/[locale]/wishlist/page.tsx` | On mount calls /api/user/wishlist/validate, shows info toast + refetches if stale items removed. |
| `src/app/[locale]/user/notifications/page.tsx` | `markAllRead` and `deleteNotif` mutations now show success/error/info toasts via `useToast`. |
| `src/app/[locale]/store/analytics/page.tsx` | Explicit `(v: number)` type on `formatRevenue` callbacks. |
| `src/app/api/store/payouts/request/route.ts` | `createApiHandler` → `createRouteHandler`; explicit cast for `user.displayName`. |
| `src/components/routing/CartRouteClient.tsx` | Full rewrite: stale-validate useEffect (W1), OOS section split (W3), `getProductHref()` (W4), auth PATCH/DELETE with toasts (R1), `SellerGroupSection` sub-component. |
| `src/constants/api.ts` | Added `STORE.PAYOUTS: "/api/store/payouts"`. |

## Deferred items

None.

---

# Session 80 — 2026-05-10 (Alpha: Store Settings)

## Scope

C6 (shipping config form), C7 (payout settings form), LL8 (seller reviews view), VB3 (payout request form), VB10 (analytics wiring), O3 (pickup address selector in product form), UX7 (FormShell pattern confirmation across store forms).

## What changed

| File | Change |
|------|--------|
| `appkit/src/features/seller/components/SellerShippingView.tsx` | Rewritten as full "use client" form: method radio (custom/shiprocket), rate fields (standard/express paise), free-shipping threshold toggle + amount, StoreAddressSelectorCreate for pickup address. PATCH /api/store/shipping. |
| `appkit/src/features/seller/components/SellerPayoutSettingsView.tsx` | Rewritten as full "use client" form: UPI/bank radio, UPI VPA input or bank form (name, masked account number, IFSC, bank name, account type). Shows masked current account in Alert. PATCH /api/store/payout-settings. |
| `appkit/src/features/seller/components/SellerReviewsView.tsx` | NEW — reviews received by store: star display, rating filter chips, reply status chips, inline SideDrawer reply form (textarea, max 1000 chars, POST /api/store/reviews/[id]/reply). |
| `appkit/src/features/seller/components/SellerPayoutRequestView.tsx` | NEW — payout request: fetches payouts summary + payout details, shows available earnings, modal with payment method + optional notes. Disabled if pending payout or zero earnings. |
| `appkit/src/features/seller/components/index.ts` | Added export for `SellerPayoutRequestView`. |
| `appkit/src/features/reviews/schemas/firestore.ts` | Added `sellerReply?: string` and `sellerRepliedAt?: Date` to `ReviewDocument`. |
| `appkit/src/next/routing/route-map.ts` | Added `REVIEWS: "/store/reviews"` to STORE routes. |
| `appkit/src/client.ts` | Added exports: SellerPayoutRequestView, SellerAnalyticsStats, SellerTopProducts, SellerAnalyticsView, SellerPayoutsView + type exports. |
| `appkit/src/features/seller/components/SellerProductShell.tsx` | StepShipping: replaced plain-text fallback with StoreAddressSelectorCreate. |
| `src/app/[locale]/store/shipping/page.tsx` | Wires SellerShippingView with API_ROUTES.STORE.SHIPPING. |
| `src/app/[locale]/store/payout-settings/page.tsx` | Wires SellerPayoutSettingsView with API_ROUTES.STORE.PAYOUT_SETTINGS. |
| `src/app/[locale]/store/reviews/page.tsx` | NEW — /store/reviews page. |
| `src/app/[locale]/store/payouts/page.tsx` | Updated: SellerPayoutRequestView + SellerPayoutsView in Stack. |
| `src/app/[locale]/store/analytics/page.tsx` | Wired as "use client" fetching /api/store/analytics, passes to SellerAnalyticsStats + SellerTopProducts, handles 503 gracefully. |
| `src/app/api/store/reviews/route.ts` | NEW — GET /api/store/reviews: list reviews for seller's store, filter by rating + reply status. |
| `src/app/api/store/reviews/[id]/reply/route.ts` | NEW — POST /api/store/reviews/[id]/reply: validates store ownership, saves sellerReply + sellerRepliedAt. |
| `src/app/api/store/payout-settings/route.ts` | Added PATCH handler with Zod discriminated union (upi/bank_transfer), account number masking, persists to userRepository. |
| `src/app/api/store/payouts/request/route.ts` | NEW — POST /api/store/payouts/request: Zod schema (paymentMethod enum + notes), calls requestPayout(). |
| `src/constants/api.ts` | Added STORE.REVIEWS, STORE.REVIEW_REPLY, STORE.PAYOUTS, STORE.PAYOUTS_REQUEST. |
| `src/constants/navigation.tsx` | "Orders" group renamed "Orders & Reviews"; added Reviews nav item. |

## Deferred

| What | Why | Target |
|------|-----|--------|
| UX9 InlineSelectCreate full wiring | Post-alpha; requires QuickFormDrawer integration for all 8 field types | Session post-alpha |
| UX4 PreviewPane | Post-alpha per spec | Post-alpha |
| UX5 MediaPickerDrawer | Post-alpha per spec | Post-alpha |
| VB7 Store Addresses CRUD | Full CRUD page deferred — O3 covers inline create in product form | Session 81 |

---

# Session 78 — 2026-05-10 (User Account Core)

## Scope

VC1 (order detail), VC3 (profile edit), VC5/D4 (notifications), LL2 (reviews), LL3 (bids), isPublic guard on public profiles, smart sidebar CTA (Become Seller ↔ Store Dashboard), appkit client exports for new views.

## What changed

| File | Change |
|------|--------|
| `src/app/[locale]/user/orders/view/[id]/page.tsx` | Full render: renderBack, renderHeader (status + tracking), renderItems, renderAddress, renderPayment, renderActions (Track + Cancel) |
| `src/app/[locale]/user/reviews/page.tsx` | NEW — My Reviews page with tab filter + star display + status badges |
| `src/app/[locale]/user/bids/page.tsx` | NEW — My Bids page with tab filter + winning/status badges + auction links |
| `src/app/[locale]/user/notifications/page.tsx` | Full UserNotificationsView: tabs (all/unread/orders/bids/system), mark-read, mark-all-read, delete |
| `src/app/[locale]/user/notifications/[tab]/page.tsx` | Changed to `redirect("/user/notifications")` |
| `src/app/api/user/reviews/route.ts` | NEW — GET /api/user/reviews via reviewRepository.findByUser() |
| `src/app/api/user/bids/route.ts` | NEW — GET /api/user/bids via bidRepository.findByUser() |
| `src/app/api/user/profile/route.ts` | Extended PATCH schema: bio (max 500), profileIsPublic (boolean); persists to publicProfile sub-object |
| `src/components/user/ProfilePageClient.tsx` | Added bio textarea, photoURL URL input, isPublic toggle, view-mode Public/Private badge |
| `src/app/[locale]/profile/[userId]/page.tsx` | SSR guard: publicProfile.isPublic === false → notFound() |
| `appkit/src/client.ts` | Export OrderDetailView, UserNotificationsView, useOrder (3 new exports) |

## Deferred

| What | Why | Target |
|------|-----|--------|
| VC2 (invoice download) | Requires @react-pdf/renderer — scope for post-alpha | Session post-79 |
| VC4 (settings: password/email/privacy) | Separate flow, not alpha-blocker | Session post-80 |
| LL4 (address book list) | Post-alpha user account expansion | Session post-80 |
| LL5 (returns list) | Post-alpha | Session post-80 |
| Social links in profile edit | publicProfile.socialLinks not yet in PATCH schema | VC3 follow-up |

---

# Session 103b — 2026-05-10 (Sidebar fix + Wishlist rewrite)

## Scope

Mobile sidebar nav item alignment fix, seedPanelEnabled fallback to true, and full wishlist page rewrite (ghost items + ListingLayout).

## What changed

| File | Change |
|------|--------|
| `appkit/src/features/layout/AppLayoutShell.tsx` | `navItemClass` changed from `block` to `flex items-center gap-2` — icon + label in sidebar Browse items now align on the same row |
| `src/app/[locale]/layout.tsx` | `seedPanelEnabled` fallback `?? false` → `?? true` — Seed nav item visible by default when Firestore returns null |
| `appkit/src/features/wishlist/types/index.ts` | Added `WishlistProductData` and `EnrichedWishlistItem` types; `status` typed as `ProductStatus` union |
| `appkit/src/client.ts` | New exports: `ListingLayout`, `ListingLayoutProps`, `ListingLayoutLabels`, `Select`, `SelectOption`, `SelectProps`, `WishlistItem`, `WishlistResponse`, `WishlistProductData`, `EnrichedWishlistItem` |
| `src/app/[locale]/wishlist/page.tsx` | Full rewrite — ghost items fixed (reads `item.product.*` from enriched API response), `ListingLayout` + search `Input` + sort `Select`, raw `<div>` → `Div`, zero `any` casts |
| `appkit/` dist | Rebuilt via `npm run build`; 0 TS errors both repos |

## Ghost items root cause

`GET /api/user/wishlist` enriches each item with a `product` field. The old page read `item.productTitle` etc. — sparse fields never written to Firestore by `wishlistRepository.addItem`. Fixed by preferring `item.product.*`.

## Tracker

- D1 ✅ Wishlist page wiring
- VC6 ✅ User Wishlist fix broken wiring
- W2 still ⏳ stale validation on mount — deferred

---

# Session 103 QA — 2026-05-10 (Dev server + cart auth + seed 403 fix + SeedPanel collections)

## Scope

Dev server stabilisation, unauthenticated cart API fix, seed route 403 chicken-and-egg fix, SeedPanel missing collection groups, appkit rebuild.

## What changed

| File | Change |
|------|--------|
| `scripts/dev-next.mjs` | Changed `.bin/next` (bash shebang, broken on Windows) → `node_modules/next/dist/bin/next`; added `--webpack` flag |
| `tailwind.config.js` | Removed `node_modules/@mohasinac/*/dist/**` from content paths — caused PostCSS zombie feedback loop with tsc --watch |
| `package.json` | Added `--restart-tries 0` to concurrently dev command to prevent crash-loop zombie accumulation |
| `next.config.js` | Added webpack `externals` function for appkit-local firebase-admin packages + `IgnorePlugin` for optional native deps (`request`, `fast-crc32c`) |
| `appkit/src/features/cart/hooks/useCartCount.ts` | Added `enabled = false` parameter — query now only fires when caller explicitly passes `true` (i.e., when a user session exists). Previously fired unconditionally for every visitor including guests, causing sitewide `GET /api/cart` spam. |
| `appkit/src/features/layout/TitleBar.tsx` | Passes `!!rest.user` to `useCartCount()` — authenticated when `user` prop is present, skips query for guests |
| `src/app/api/demo/seed/route.ts` | `featureFlags.seedPanel` check now defaults to `true` when `site_settings/global` doesn't exist — fixes chicken-and-egg 403 on fresh environments where the seed panel is needed to populate Firestore in the first place |
| `src/components/dev/SeedPanel.tsx` | Added `sublistingCategories` + `groupedListings` to `LISTINGS_COLLECTIONS`; added `conversations` to `TRANSACTIONAL_COLLECTIONS`; added `"moderation"` to group filter chips — all three collections had COLLECTION_META entries but were absent from ALL_COLLECTIONS so never rendered |
| `appkit` | Rebuilt dist (tsc → copy-assets) |
| `scripts/next-memory-forensics.js` | Forensics wrapper for Next.js dev server — measures real server RSS via WMIC, tracks FSWatcher handles, scans .next/ for rebuild loops, writes 9 structured log files to timestamped output directory |

## Behaviour after this change

- Dev server runs stably on Windows via `node node_modules/next/dist/bin/next dev --webpack`
- PostCSS workers no longer accumulate — Tailwind no longer scans dist/ files
- `GET /api/cart` is never called for unauthenticated users — TitleBar cart badge uses guest localStorage count only
- `/api/demo/seed` returns 200 on fresh environments even before siteSettings is seeded
- SeedPanel now shows all 29 seed collections (previously 26 — conversations, sublistingCategories, groupedListings were silently hidden)
- "Trust & Safety" group chip appears in SeedPanel filter bar

## TypeScript

Both repos: 0 errors before and after this session.

---

# Session 102 QA — 2026-05-10 (Seed page public visibility)

## Scope

Made the `/demo/seed` seed panel page and its nav link publicly accessible. Previously both were gated behind admin auth; now the `featureFlags.seedPanel` flag controls link visibility for all users (including guests), and write actions remain API-gated.

## What changed

| File | Change |
|------|--------|
| `src/app/[locale]/demo/layout.tsx` | Removed `ProtectedRoute(requireAuth, requireRole="admin")` — layout is now a public passthrough `<>{children}</>` |
| `src/app/[locale]/LayoutShellClient.tsx` | Removed `&& user?.role === "admin"` guard from sidebar "Seed & Docs" link and title-bar `devSlot`; both now appear whenever `seedPanelEnabled` is `true`, regardless of auth state. Cleaned up stale `user?.role` dep from `useMemo` array. |

## Behaviour after this change

- Any user (including logged-out) can visit `/demo/seed` and read DB state, collection counts, and schema documentation
- The `🌱 Seed` chip in the title bar and "Seed & Docs" in the sidebar sidebar appear for everyone when the flag is on
- Admins still control the flag via Admin → Feature Flags → seedPanel toggle
- Actual seed/clear write actions remain blocked at the API level when the flag is off or the caller is not admin

## Tracker / diagram updates

- `crud-tracker.md` SP1 notes updated — removed stale admin-only guard description
- `asciiDiagrams.md` Seed & Docs panel header updated from "Admin only" to "Public · write actions require admin"; sidebar diagram updated from "(+ Seed & Docs if admin)" to "(+ Seed & Docs if seedPanel on)"

---

# Session 101 QA — 2026-05-10 (TypeScript fix + WA3 + quality pass)

## Scope

TypeScript audit + WA3 WhatsApp Cloud API implementation + code quality fixes.

## TypeScript

Both repos had 0 errors before session. Fixed 3 new errors introduced by WA3 work:
- `catalog-sync/route.ts`: wrong `productRepository.findAll({filters})` call → `findByStore` + in-memory filter
- `catalog-sync/route.ts`: `@mohasinac/appkit/features/whatsapp-bot/server` module not in exports map → added sub-path export to appkit/package.json
- `catalog-sync/route.ts`: `.data` property missing on array result → fixed by using `findByStore`

## WA3

- `appkit/src/features/whatsapp-bot/types/index.ts`: WaBusinessSendInput, CatalogSyncProduct/Input/Result, PurchaseAnnouncementInput types
- `appkit/src/features/whatsapp-bot/helpers/whatsapp.ts`: sendWhatsAppBusinessMessage(), syncProductsToCatalog(), buildPurchaseAnnouncementMessage(), buildGroupShareLink()
- `appkit/src/features/whatsapp-bot/server.ts`: re-exports helpers + types
- `appkit/package.json`: `./features/whatsapp-bot/server` sub-path export added
- `appkit/src/features/auth/permissions/constants.ts`: `whatsapp_catalog_sync` StoreCapability
- `appkit/src/next/routing/route-map.ts`: `STORE.WHATSAPP = "/store/whatsapp"`
- `appkit/src/tokens/tokens.css`: `--appkit-color-warning-surface` (light: amber-50, dark: dark amber)
- `appkit/src/features/shell/FormShell.tsx`: amber hardcoded classes → `var(--appkit-color-warning-surface)` / `var(--appkit-color-warning)`
- `src/app/api/store/whatsapp-settings/route.ts`: GET/PUT — returns/saves WA Business config, token encrypted, capability gate
- `src/app/api/store/whatsapp-settings/catalog-sync/route.ts`: POST — syncs published standard products to Meta Commerce API
- `functions/src/triggers/onOrderCreate.ts`: Firebase trigger → purchase announcement to admin numbers + store owner
- `src/constants/navigation.tsx`: STORE_NAV_GROUPS Settings group → WhatsApp link added
- `src/constants/api.ts`: WHATSAPP_SETTINGS + WHATSAPP_CATALOG_SYNC routes

## Quality pass

- `LayoutShellClient.tsx`: moved misplaced `import Link` from after module-level constants to top of imports
- `scripts/dev-next.mjs`: use stable `node_modules/next/dist/bin/next` path
- `package.json`: `--restart-tries 0` on concurrently dev script
- `next.config.js`: `transpilePackages: ["@mohasinac/appkit"]`
- `tailwind.config.js`: removed redundant dist scan path
- `.gitignore`: added `/memory-forensics-*`
- `appkit/src/seed/site-settings-seed-data.ts`: whatsappPhoneNumberId / CloudApiToken / AdminNotifyNumbers seeded as empty strings

---

# Session 84 — 2026-05-10 (Global Search Redesign — SR1+SR2+SR3)

## Scope

SR1: Search.tsx resource-type dropdown + navigation fix. SR2: /search redirect handler + legacy deep-URL permanentRedirect. SR3: Verified all listing pages pre-fill `?q=` from URL.

## SR1 — Search.tsx

- Added `SearchResourceType` union type + `SearchResourceTypeOption` interface to `appkit/src/features/search/components/Search.tsx`
- New props: `resourceTypes`, `defaultResourceType`, `storageKey`; `onSearch` signature updated to `(query, type)`
- Native `<select>` type picker in both inline and overlay modes; `selectedType` state with localStorage persistence
- `handleDeferredSubmit` now calls `onSearch(query, selectedType)` (was `onChange`) — fixes navigation from inline mode
- `useNavSuggestions` accepts `selectedType` param; dep array updated
- Exported `SearchResourceType` + `SearchResourceTypeOption` from `client.ts`, `index.ts`, `components/index.ts`
- `src/app/[locale]/LayoutShellClient.tsx`: removed standalone close button, added `SEARCH_RESOURCE_TYPES` + `SEARCH_ROUTE_MAP`, `onSearch` navigates `base?q=encoded`
- `src/constants/search.ts`: placeholder → "Search collectibles…", added `resourceTypeLabel`

## SR2 — /search redirect

- `src/app/[locale]/search/page.tsx` rewritten: reads `?q=` + `?type=`, validates type, `redirect()` to listing page
- `src/app/[locale]/search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]/page.tsx` → `permanentRedirect` with tab→route map (backward-compat bookmarks)

## SR3 — Listing pages q-param

- Confirmed all 9 index listing components (Products, Auctions, Pre-Orders, Stores, Categories, Brands, Events, Blog) read `q` from `useUrlTable`
- FAQs: static RSC from translation messages, no toolbar search — deferred (noted in tracker)

---

# Session 100 — 2026-05-10 (77-impl: UX Shells + Seller Product Forms)

## Scope

Completed all pending tasks from sessions 77-ux and 77: UX1 FormShell, UX2 QuickFormDrawer, UX3 StepForm, UX6/C1/VB8/C2/VB9 SellerProductShell, O2+C5 SellerStorefrontView, LL6 SellerProductsView improvements. Fixed pre-existing SearchResourceType export gap.

## UX1 — FormShell (`appkit/src/features/shell/FormShell.tsx`)

Full-viewport overlay with: sticky top bar (breadcrumb, title, save/publish buttons), optional left section nav (200px desktop, horizontal strip mobile), scrollable body (max-w-3xl centered), sticky bottom bar, unsaved-changes dialog (AlertTriangle icon + Stay/Leave). Keyboard trap + Esc + scroll lock. `useFormShell()` hook for dirty state (no context — standalone).

## UX2 — QuickFormDrawer (`appkit/src/features/shell/QuickFormDrawer.tsx`)

40% desktop / 100% mobile independent right drawer. Auto-renders `FieldDef[]` array fields (text, number, select, toggle, date, textarea, email, url). Re-initializes on `isOpen` change for edit mode. Focus trap + Esc keyboard handling. Z: `calc(var(--appkit-z-modal) + 2)`.

## UX3 — StepForm (`appkit/src/features/shell/StepForm.tsx`)

Multi-step wizard: `StepIndicator` (numbered circles, checkmarks for completed), `StepFormActions` (prev/next/complete bar), `StepForm<T>` (controlled step state, per-step `validate()`, localStorage persistence via `formId`). All controlled externally via `currentStep` + `onStepChange`.

## UX6/C1/VB8/C2/VB9 — SellerProductShell (`appkit/src/features/seller/components/SellerProductShell.tsx`)

Single component for all 3 listing types (standard/auction/pre-order). Mode=create: `FormShell` + `StepForm` (5 steps standard, 6 for auction/pre-order). Mode=edit: `FormShell` with section nav + all steps as scrollable sections. Steps: Basic, Media, [Auction|PreOrder], Pricing, Shipping, Publish/SEO. Render props for category/brand/address selectors. Paise↔rupee price helpers. Updated `SellerCreateProductView` + `SellerEditProductView` to use this shell.

## C1/C2 — Auction + Pre-Order Pages (6 new pages)

Created `/store/auctions/new`, `/store/auctions/[id]/edit`, `/store/pre-orders/new`, `/store/pre-orders/[id]/edit`. Updated `/store/products/new` + `/store/products/[id]/edit`. All pages wire server actions (`createSellerProductAction`, `sellerUpdateProductAction`) via inline `"use server"` functions, redirect to listing page on complete.

## O2+C5/VB4 — SellerStorefrontView (complete rewrite)

Full settings form: Store Profile (name, bio, logo, banner), Store Details (category, description), Policies (return, shipping), Contact & Social (website, location, twitter/instagram/facebook/linkedin), Vacation Mode (toggle + message), Visibility (isPublic). `useFormShell` dirty tracking, unsaved-changes indicator, success Alert on save. Updated storefront page to load existing store data + pass `updateStoreAction`.

## LL6 — SellerProductsView (improved)

Added: listing-type filter chips (All/Standard/Auction/Pre-order) with Sieve filter mapping, thumbnail column, type badges (warning=auction, secondary=pre-order, default=standard), status badges with semantic variants, price column (paise→₹), row-level edit+delete actions (via `onDeleteProduct` prop), CSS-variable-only styling (removed hardcoded `zinc-*`/`slate-*`), improved SORT_OPTIONS (+price sort). Pre-existing `SearchResourceType` export gap fixed in `appkit/src/features/search/components/index.ts`.

## DEFERRED

| Task | Reason | Target |
|------|--------|--------|
| UX4 PreviewPane | Needs token-based `/api/preview` endpoint + draft serialisation | post-alpha |
| UX5 MediaPickerDrawer | Needs tmp/ Cloud Function + drag-reorder library | post-alpha |
| UX9 InlineSelectCreate QuickFormDrawer wiring | UX3 pattern exists; per-field wiring is per-form work | Session 101+ |
| O1 Store slug management | Low-impact for alpha; slug set at store creation | post-alpha |

## tsc status: Both repos clean (0 errors). Appkit built + dist updated.

---

# Session 81-seed — 2026-05-10 (Seed Scale Expansion — P23/P26/P27 partial)

## Scope

Completed P23 (standard products 50→100), P26 (users 18→25, brands 13→25), and partial P27 (reviews 35→60, orders 10→35). Also wired the scam registry into the seed system (SCAM1 wiring work).

## SCAM Seed Wiring (completed)

- Added scam registry exports to `appkit/src/index.ts`
- Added `"scammerProfiles"` to `SeedCollectionName` union in `demo-seed-actions.ts`
- Added manifest entry in `manifest.ts`
- Fixed `scamType: "identity_mistaken"` → `"empty_box_ship"` (ContestType ≠ ScamType)
- Added `scammerProfiles` COLLECTION_META entry to `SeedPanel.tsx` with new `"moderation"` GroupKey
- Added 9 Firestore indexes for scammerProfiles collection + subcollections

## P23 — Standard Products 50→100

- `products-standard-seed-data.ts`: +50 products across 8 stores
  - Pokémon Palace +8: Journey Together ETB, Surging Sparks booster box, Charizard ex SIR, Pikachu ex SIR, Paldea Evolved ETB, Obsidian Flames ETB, 151 ETB, Mewtwo ex SIR
  - CardGame Hub +8: OP-05/06/03 booster boxes, YGO 25th anniversary tin, Blue-Eyes LOB NM, Dark Magician LOB PSA9, MTG Duskmourn box
  - Diecast Depot +8: Car Culture German 5-car set, RLC Porsche 918 Spectraflame, Tomica LC300/Civic Type R FL5, Ultra Hots 5-pack, Matchbox Moving Parts 5-car, Corgi DB5 Bond 007
  - Beyblade Arena +5: BX-01 Dran Sword, BX-07 Hells Chain, BX-09 Rd Dragon, BX-12 Phoenix Wing, BX-16 Sword Launcher
  - LetItRip Official +6: figma Link TotK, Funko Gojo, Nendoroid Miku V4X, SHF Ultra Instinct Goku, Funko Tanjiro DLX, MAFEX Miles Morales
  - Tokyo Toys India +7: figma Makima, Nendoroid Zero Two, GSC Aqua 1/7, figma Levi, Nendoroid Killua, ALTER Rem Wedding, Funko Luffy Gear5
  - Gundam Galaxy +6: HG Aerial Rebuild, MG Nu Gundam Ver Ka, RG Eva Unit-01, PG Unleashed RX-78-2, HG Calibarn, MG Strike Freedom
  - Vintage Vault +2: Hot Wheels Twin Mill 1970 Redline, GI Joe Hawk v1 1983 MOC
- Fixed: `customFields` → `specifications` (schema field name), `"like_new"`/`"good"` → `"used"` (valid condition enum)

## P26 — Users 18→25, Brands 13→25

- `users-seed-data.ts`: +7 buyers (Buyers 11–17 — anjali-verma, rohit-verma, pooja-sharma, kiran-reddy, naman-gupta, preeti-joshi, varun-bhat)
- `brands-seed-data.ts`: +12 brands (Kotobukiya, Alter, Max Factory, Medicom Toy, Bushiroad, Panini, Spin Master, JAKKS Pacific, Corgi, Matchbox, Mega Construx, Sideshow Collectibles)

## P27 partial — Reviews 35→60, Orders 10→35

- `reviews-seed-data.ts`: +25 reviews (36–60) across all stores using new buyer cohort
- `orders-seed-data.ts`: +25 orders (11–35) covering all 7 statuses; uses new buyers 11–17 + new product IDs; fixed `payoutStatus: "pending"` → `"eligible"` (OrderPayoutStatus enum)
- SeedPanel COLLECTION_META updated: users target 25, brands 25, products 100, orders 35, reviews 60

## tsc status: Both repos clean. Commits: appkit afc1293, parent 0960cb3.

---

# Session 82 — 2026-05-10 (SEO & Lighthouse — SSR Hydration + JSON-LD + Core Web Vitals)

## Scope

Full SEO and Lighthouse improvement pass across all public-facing pages. Admin/store/user dashboards excluded. 7 tasks implemented: SEO1–SEO7.

## SEO1 — SSR data hydration for homepage sections

**Problem**: Homepage sections (FeaturedProducts, FeaturedAuctions, FeaturedPreOrders, FeaturedStores, ShopByCategory, Brands, BlogArticles, Events) were rendered as loading skeletons in initial HTML — search crawlers got empty carousels.

**Fix**: Added `initialData?` / `initialItems?` props to all 8 section components and their backing hooks. `MarketplaceHomepageView.tsx` now runs parallel `Promise.all` server-side fetches (only for enabled section types via `activeTypes` Set), then passes data as props.

Files changed in appkit:
- `useFeaturedAuctions.ts`, `useFeaturedPreOrders.ts`, `useFeaturedStores.ts`, `useTopBrands.ts`, `useBlogArticles.ts`, `useHomepageEvents.ts` — `initialData?` option added to each hook
- `FeaturedProductsSection.tsx`, `FeaturedAuctionsSection.tsx`, `FeaturedPreOrdersSection.tsx`, `FeaturedStoresSection.tsx`, `ShopByCategorySection.tsx`, `BrandsSection.tsx`, `BlogArticlesSection.tsx`, `EventsSection.tsx` — `initialItems?` prop added
- `section-renderer.tsx` — added `SectionData` interface; `renderSectionElement` + `renderSection` accept `sectionData` param and thread `initialItems` to each section component
- `MarketplaceHomepageView.tsx` — server-side `Promise.all` fetch block; builds `SectionData`; passes to `renderSection`

## SEO2 — JSON-LD structured data on detail pages

**Files changed in src/**:
- `[locale]/products/[slug]/page.tsx` — `productJsonLd` + `breadcrumbJsonLd` injected as `<script type="application/ld+json">` before `<ProductDetailPageView>`
- `[locale]/auctions/[id]/page.tsx` — `auctionJsonLd` + `breadcrumbJsonLd`
- `[locale]/blog/[slug]/page.tsx` — `blogPostJsonLd` + `breadcrumbJsonLd`
- `[locale]/faqs/page.tsx` — converted to async server component; calls `listPublicFaqs`; injects `faqJsonLd` (FAQ schema)

## SEO3 — `next/image` in grid/carousel components

- `ProductGrid.tsx` — replaced two `background-image` inline styles with `<MediaImage>` (`size="card"` for grid view, `size="thumbnail"` for list view) — now WebP/AVIF-optimized with srcset
- `ShopByCategorySection.tsx` — replaced `<img>` with `<Image>` from `next/image`
- `BrandsSection.tsx` — replaced `<img>` with `<Image width={40} height={40}>`

## SEO4 — Metadata for content/help pages

Added `export const metadata: Metadata` to 14 static pages:
`sellers`, `contact`, `help`, `fees`, `how-auctions-work`, `how-checkout-works`, `how-offers-work`, `how-orders-work`, `how-payouts-work`, `how-pre-orders-work`, `how-reviews-work`, `seller-guide`, `security`, `track`

## SEO5 — robots meta for paginated/search pages

- `categories/[slug]/[tab]/sort/[sortKey]/page/[page]/page.tsx` — `noindex` on pages > 1
- `search/[searchSlug]/tab/[tab]/sort/[sortKey]/page/[page]/page.tsx` — `index: false, follow: true` (all search pages)

## SEO6 — Resource hints in root layout

Added to `src/app/layout.tsx` (preconnect only — dns-prefetch is redundant when preconnect is present for the same origin):
```html
<link rel="preconnect" href="https://firebasestorage.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="preconnect" href="https://www.googletagmanager.com" />
```

## SEO7 — Canonical / alternates metadata on listing pages

Already covered by SEO5 route changes (canonicalPath logic + alternates in generateMetadata).

## TypeScript

Both `appkit/` and `src/` pass `npx tsc --noEmit` after all changes. No new errors introduced.

## Quality fixes (review pass after Session 82)

| Fix | File | Issue |
|-----|------|-------|
| Remove redundant `dns-prefetch` alongside `preconnect` | `src/app/layout.tsx` | `preconnect` already covers DNS+TCP+TLS — the `dns-prefetch` entries were no-ops |
| Null-guard breadcrumb JSON-LD | `[locale]/products/[slug]/page.tsx` | Breadcrumb was always rendered even when product 404s — now only rendered when product exists |
| `revalidate = 3600` | `[locale]/track/page.tsx` | Missing revalidate — defaulted to dynamic per-request rendering; page is static HTML (client-side fetching) |
| Null-coalesce `SectionData` fields | `appkit/.../MarketplaceHomepageView.tsx` | `?? []` defaults added so disabled section types get empty arrays instead of `undefined` |

---

# Session 80-plan — 2026-05-10 (Feature Planning: EX / YT / AX / FI / BK Tiers)

## Scope

Planning-only session (no code written). Designed 5 new feature tiers and documented them in `crud-tracker.md`, `prompt.md`, and `asciiDiagrams.md`.

## New tiers added

| Tier | Tasks | Description |
|------|-------|-------------|
| **EX** | EX1–EX5 | Extended Homepage Sections — Stats live collection queries, multi-carousel (max 5 slides each), Categories/Brands CTA + filter chips, Products multi-row max-20 paginated, common `collection-cards` section type |
| **YT** | YT1 | YouTube video link cards in SocialFeedSection — thumbnail from videoId, play overlay, `--appkit-color-youtube` token |
| **AX** | AX1, AX2, AX3, A1-ext | Centralized `ACTION` constants + `useActionDispatch` hook, URL panel routing (`?panel=create` / `?panel=edit&id=slug`) + `usePanelUrlSync` hook, sticky `FormActionBar` (desktop top / mobile bottom), admin product store picker |
| **FI** | FI1–FI6 | `productFeatures` Firestore collection, 10 platform seed features, admin CRUD, store custom features, product form assignment, `FeatureBadge`/`FeatureBadgeList` on cards and detail pages |
| **BK** | BK1–BK3 | Public listing selection mode + `useProductSelection` hook (max 10), sticky bulk action bar (guest: Compare+Share; auth: +Wishlist), `CompareOverlay` (desktop side-by-side + mobile swipeable) |

## Session roadmap entries added

Sessions 100 (EX+YT), 101 (AX), 102 (FI), 103 (BK) appended to ordered sessions table.

## Task count

19 new tasks added. At time of session: 283 → 302 total, 173 → 192 remaining.
(After Session 80-schema RBAC/BAN/SCAM additions: grows to 330 total, 239 remaining.)

## ASCII diagrams added (asciiDiagrams.md)

Desktop + mobile diagrams for all 10 new feature areas: Stats admin config + rendered grid, Carousel list + edit pages, Categories/Brands with CTA+filter, Products multi-row, Collection Cards Section (admin config + desktop + mobile), YouTube social card (admin config + desktop feed + mobile card), ACTION before/after flow, URL panel auto-open (desktop + mobile), Sticky form bars (desktop + mobile), Feature flags admin table + product card badges + product form tab, Bulk selection mode (desktop + mobile), Bulk action bar, Compare overlay (desktop + mobile).

---

# Session 81 — 2026-05-10 (sellerId → storeId Full Migration — ARCH2/ARCH5/ARCH8)

## Scope

Complete architectural migration replacing `sellerId` (Firebase Auth UID) with `storeId` (= storeSlug = store.id, e.g. `store-pokemon-palace`) across every Firestore collection, repository, action, API route, and seed file. `ownerId` (Auth UID) is now kept ONLY on `StoreDocument.ownerId`.

## Schemas changed (appkit)

- `CartItemDocument` + `CartAppliedCoupon` + `AddToCartInput`: `sellerId/sellerName` → `storeId/storeName`
- `OrderDocument` + `AppliedOrderDiscount`: `sellerId/sellerName` → `storeId/storeName`
- `CouponDocument`: `sellerId + storeSlug` → single `storeId`
- `OfferDocument`: `sellerId/sellerName` → `storeId/storeName`; `OFFER_FIELDS.SELLER_ID/SELLER_NAME` → `STORE_ID/STORE_NAME`
- `PayoutDocument`: `sellerId` → `storeId`; `PAYOUT_FIELDS.SELLER_ID` → `STORE_ID`
- `ConversationDocument`: removed redundant `sellerId` (already had `storeId`)
- `ProductItem` type: added `storeName?` field

## Repositories changed (appkit)

- `offer.repository.ts`: `findBySeller` → `findByStore`, `findPendingBySeller` → `findPendingByStore` (uses `OFFER_FIELDS.STORE_ID`)
- `payout.repository.ts`: `findBySeller` → `findByStore`, `findBySellerAndStatus` → `findByStoreAndStatus`, `getPaidOutOrderIds` field ref updated
- `orders.repository.ts`: `createFromAuction` param `sellerId?` → `storeId?`; `ADMIN_SIEVE_FIELDS` updated
- `products.repository.ts`: `deleteBySeller` → `deleteByStore`
- `coupons.repository.ts`: `getSellerCoupons` → `getStoreCoupons`

## Actions changed (appkit)

- `seller-actions.ts`: `listSellerCoupons` → storeRepository lookup + `getStoreCoupons`; `listSellerMyProducts` **bug fix** → was calling `findByStore(userId)` (critical bug, userId ≠ storeId) → now `findByOwnerId(userId)` → `findByStore(store.id)`
- `offer-actions.ts`: all `offer.sellerId/sellerName` → `offer.storeId/storeName`; `listSellerOffers` → storeRepository lookup; `counterOfferByBuyer` null guard added before `offer.counterAmount` use
- `store-query-actions.ts`: `findBySeller(storeDoc.ownerId)` → `findByStore(storeDoc.id)`
- `seller-coupon-actions.ts`: `storeId: store.id` in create, authorization compares storeId to storeId
- `review-actions.ts`: `findBySeller` → `findByStore`
- `bid-actions.ts`: **bug fix** — `product.storeId === userId` (wrong) → `store.ownerId === userId` via storeRepository lookup

## API routes changed (src/)

- `store/offers/route.ts`: `findBySeller(uid)` → storeRepository lookup → `findByStore(store.id)`; early-return empty if no store
- `store/orders/[id]/route.ts`: **optimized** — replaced 2-DB-call auth check (fetch all store products → check item list) with 1-DB-call (`order.storeId === store.id`); extracted `resolveSellerStoreId` helper; removed unused `productRepository` import
- `store/payouts/route.ts`: early-return if no store (replaces `storeId==__none__` sentinel hack); `storeId` now non-nullable after guard
- `admin/payouts/weekly/route.ts`: `payoutData.sellerId` → `storeId`; fixed `order.storeId ?? order.storeId ?? ""` duplicate → `order.storeId ?? ""`
- `profile/delete-account/route.ts`: `deleteBySeller(uid)` → storeRepository lookup → `deleteByStore(store.id)`

## Seed data changed (appkit)

- `cart-seed-data.ts`: rewritten with real buyer IDs, real store IDs, `storeId/storeName`
- `orders-seed-data.ts`: all `sellerId/sellerName` pairs → `storeId/storeName`
- `coupons-seed-data.ts`: seller-scoped coupons `sellerId+storeSlug` → `storeId`
- `payouts-seed-data.ts`: complete rewrite with real store IDs
- `conversations-seed-data.ts`: removed all `sellerId:` lines
- All product seed files (letitrip-official, anime-figures, beyblade, hot-wheels, transformers, retro-gaming, cosplay-accessories): removed `sellerId/sellerEmail`, renamed `sellerName` → `storeName`, corrected storeId prefix to `store-*`

## Exports changed (appkit index.ts + server.ts)

- `getSellerProducts` → `getProfileStoreProducts` (avoids name clash with stores `getStoreProducts`)
- `getSellerStorefrontProducts` → `getStoreStorefrontProducts`
- Added missing seed data exports: `conversationsSeedData`, `sublistingCategoriesSeedData`, `groupedListingsSeedData`

## UI changed

- `PublicProfileView.tsx`: uses `getProfileStoreProducts`; `toProductItem` maps `storeId/storeName`
- `ProductForm.tsx`: 5× `sellerName` → `storeName`; form field name updated
- `ProductGrid.tsx`: `product.sellerName` → `product.storeName`
- `ProductDetailPageView.tsx`: `sellerName` → `storeName` in document mapper
- `productTableColumns.tsx`: column key `sellerName` → `storeName`
- `SeedPanel.tsx`: added `COLLECTION_META` entries for `conversations`, `sublistingCategories`, `groupedListings`
- `StoreEntity` interface (2 store API routes): added missing `id` field
- `coupon.actions.ts` Zod schema: `sellerId` → `storeId` in cart item validator
- `pre-order.actions.ts`: `sellerId/sellerName` → `storeId/storeName`
- `actions/index.ts`: `getSellerProductsAction` → `getProfileStoreProductsAction`
- `asciiDiagrams.md`: added Architecture > Store Identity section documenting identity model, two-step lookup pattern, checkout three-step, optimized order auth guard, and anti-patterns

## TypeScript

Both `appkit/` and `src/` pass `npx tsc --noEmit` with 0 errors after all changes. appkit rebuilt to `dist/`.

---

# Session 80 — 2026-05-10 (ARCH3 + AdminSectionsView code quality split)

## ARCH3 — Reviews sellerId → storeId

- `appkit/src/features/reviews/types/index.ts`: `ReviewListParams` — `sellerId` removed, replaced with `storeId`.
- `appkit/src/features/reviews/schemas/index.ts` (Zod): `reviewSchema` — `storeSlug` + `storeName` replace `sellerId`; `reviewListParamsSchema` — `storeId` replaces `sellerId`.
- `appkit/src/features/reviews/hooks/useReviews.ts`: `sellerId` condition → `storeId` condition.
- `appkit/src/features/reviews/actions/review-actions.ts`: uses `storeId: product.storeId` at write time.
- `appkit/src/seed/reviews-seed-data.ts`: exports via `SELLER_STORE` map — each review gets `{storeId, storeName}` from seller userId at seed time.

## Categories seed — store identity pattern

- `appkit/src/features/categories/schemas/firestore.ts`: `CategoryDocument` extended with optional `createdByType` and `createdByStoreId`.
- `appkit/src/seed/categories-seed-data.ts`: 6 niche subcategories given seller `createdBy` user IDs; exported with `STORE_CREATOR` map converting `createdBy` userId → `{createdByStoreId}` at export time.
  - pokemon-tcg → user-aryan-kapoor (Pokemon Palace)
  - yugioh-tcg → user-nisha-reddy (CardGame Hub)
  - hot-wheels → user-vikram-mehta (Diecast Depot)
  - beyblade-x → user-rohit-joshi (Beyblade Arena)
  - gunpla → user-amit-sharma (Gundam Galaxy)
  - nendoroids-chibis → user-priya-singh (Tokyo Toys India)

## AdminSectionsView.tsx — code quality split (3595 → 2282 lines)

- `appkit/src/features/admin/components/AdminSectionsView.tsx`: reduced from 3595 → 2282 lines (-1313 lines) by extracting all type declarations, constants, defaults, and build/parse utilities into two new focused modules:
  - **`sections/adminSectionsTypes.ts`** (571 lines): all `SectionType`, `XBuilderState` interfaces, `DEFAULT_X_BUILDER` constants, `SECTION_TYPE_OPTIONS`, `SUPPORTED_TYPED_BUILDERS`, `RESOURCE_SORT_OPTIONS`, `FAQ_CATEGORY_OPTIONS`. All 21 section builder types exported.
  - **`sections/adminSectionsBuildParse.ts`** (751 lines): `parseCsvValues`, `toNumberValue`, `toStringValue`, `toBooleanValue`, `toStringArray` utilities. All 21 `buildXConfig()` functions and all 21 `parseXBuilder()` functions.
- 4 if-chain blocks converted to `switch` statements in `AdminSectionsView.tsx`:
  - `typedConfig` useMemo (21 cases)
  - edit-mode parse effect (21 cases)
  - create-mode reset effect (21 cases)
  - `renderTypedBuilder()` render function (21 cases)
- `socialFeedBuilder` state was missing from the original component — added during this refactor.

## TypeScript

- `appkit/` tsc: 0 errors in refactored files. 3 pre-existing unrelated errors remain (seed export missing for conversations/sublisting-categories/grouped-listings in seed/index.ts).
- `letitrip.in/` tsc: same 3 pre-existing errors — no new errors introduced.

---

# Session 79 — 2026-05-10 (FAQ expansion + Live stats + Homepage view refactor)

## FAQ seed data — expanded to 53 FAQs

- `appkit/src/seed/faq-seed-data.ts`: complete rewrite from 20 to 53 FAQs across 7 categories.
- Platform risk disclaimer woven throughout: LetItRip is a marketplace, not the seller; shipping timelines and return policies are set by individual stores (visit store About page).
- 8 FAQs have `showOnHomepage: true`. 5 have `showInFooter: true`.
- New `general` category FAQs: what-is-letitrip (with platform disclaimer), is-letitrip-safe, how-does-letitrip-work.
- Full `account_security` and `technical_support` categories added.
- Returns/shipping FAQ messaging: "Each store on LetItRip sets its own policy — check that store's About page."

## Homepage section seed fixes

- `appkit/src/seed/homepage-sections-seed-data.ts`: stats section values updated with `source: "live"` + `metric` + `suffix` fields reflecting actual seed data (31 listings / 8 sellers / 10 buyers / 4.7★ rating).
- FAQ section: `displayCount` 5→8, `expandedByDefault` false→true (SEO: answers visible to crawlers without JS), `categories` array fixed to correct `FAQCategory` union values.

## Firestore schema additions

- `appkit/src/features/homepage/schemas/firestore.ts`:
  - Added exported `LiveStatMetric` type (6 values: total_listings, verified_sellers, total_buyers, platform_rating, total_orders, total_reviews).
  - Extended `StatsSectionConfig` stat items with optional `source`, `metric`, `suffix` fields.
  - Fixed `FAQSectionConfig.categories` array element type to use correct `FAQCategory` values (was using wrong legacy strings).

## Live stats system — new file

- `appkit/src/features/homepage/lib/live-stats.ts` (NEW): fetches only the Firestore metrics requested by the current stats section, in parallel. All failures silently caught — static `value` used as fallback. `reviewRepository.findAll()` called with no args, filtered in-memory for `status === "approved"` to compute platform_rating.

## Homepage view refactor — split into 4 files

- `MarketplaceHomepageView.tsx` now imports from 3 new focused modules. File reduced from ~570 to ~65 lines — only handles data fetching + section ordering + rendering orchestration.
- `appkit/src/features/homepage/lib/section-defaults.ts` (NEW): `DEFAULT_TRUST_FEATURES` and `DEFAULT_SECURITY_ITEMS` constants.
- `appkit/src/features/homepage/lib/section-helpers.ts` (NEW): `cleanTitle()` and `parseWelcomeDescription()` utility functions.
- `appkit/src/features/homepage/lib/section-renderer.tsx` (NEW): `renderSection()` with full switch statement for all 21 section types + `MarketplaceHomepageViewAdSlots` type + `FaqItem` type + `AD_SLOT_MAP`. Single responsibility: map a `HomepageSectionDocument` to a React node.

## TypeScript

- `appkit/` tsc: 0 errors.
- `letitrip.in/` tsc: 3 pre-existing errors (missing seed exports for conversations/sublisting-categories/grouped-listings — not caused by this session).

---

# Session 78 — 2026-05-10 (Carousel height fix + Section diagrams + Admin form builders)

## HeroCarousel mobile height regression (CF1)

- `appkit/src/features/homepage/components/HeroCarousel.tsx`: removed `md:` prefix from 3 height class applications in the loading state, section wrapper, and per-slide div. Mobile now respects `${heightClass}` (e.g. `min-h-[80vh]` for "tall") instead of collapsing to `min-h-[260px]`.
- Fixed `slide.cards.slice(0, 2)` → `slice(0, 6)` so all 6 zone positions can render cards.

## Carousel seed card zone fix

- `appkit/src/seed/carousel-slides-seed-data.ts` slide 1 "Hot Wheels" card: `zone: 2 → zone: 5` (moved from row 1, col 2 → row 2, col 2). Cards are now in different rows as the zone grid spec requires.

## asciiDiagrams.md — all 21 section type diagrams

- Added full public-facing layout diagrams for every homepage section type (welcome, carousel, stats, trust-indicators, categories, brands, products, auctions, pre-orders, banner, features, reviews, whatsapp-community, faq, blog-articles, newsletter, stores, events, social-feed, custom-cards, google-reviews).
- Added Admin Section Editor shared modal shell diagram + 21 per-type admin form diagrams using proper UI notation (◉/◯ radio buttons, ☑/☐ checkboxes, `┌──┐│ │└──┘` input boxes).

## AdminSectionsView typed builders (HS2/HS5 gap fix)

- `appkit/src/features/admin/components/AdminSectionsView.tsx`: added typed builders for the three section types that previously fell through to raw JSON textarea:
  - **carousel**: title, height select (viewport/tall/medium), default autoplay delay, pause-on-hover, show-dots, show-arrows
  - **custom-cards**: title, layout select, columns select, auto-scroll + interval, dynamic card repeater (image URL, imageAlt, eyebrow, title, body, link, backgroundColor, textColor, borderRadius, shadowLevel)
  - **google-reviews**: placeId, maxReviews, minRating (0★/3★/4★/5★), layout, showRating, showDate, linkToGoogleMaps, googleMapsUrl (conditional)
- All three wired into: SECTION_TYPE_OPTIONS, SUPPORTED_TYPED_BUILDERS, state, typedConfig useMemo, edit-mode parse effect, create-mode reset effect, renderTypedBuilder. All 21 section types now have typed builders — zero raw JSON textarea exposed.
- tsc 0 errors in AdminSectionsView.tsx (3 pre-existing unrelated seed data TS errors in other files unchanged).

---

# Session 76-listing — 2026-05-10 (Listing view migration sweep)

## All 16 admin listing views migrated to ListingToolbar + useUrlTable + DataTable

Migrated every admin listing view from the `AdminListingScaffold` pattern to `ListingToolbar` + `useUrlTable` + `DataTable` + filter drawer. `AdminListingScaffold` is now unused in all views; only `AdminListingScaffoldRow` type is still imported in a few places.

### Standard pattern (applied to all views)

```
useUrlTable({ defaults: { pageSize, sort } })
pendingFilters local state — buffers drawer changes until Apply
openFilters / applyFilters / clearFilters / resetAll / commitSearch
useAdminListingData → rows, total, isLoading, errorMessage
<ListingToolbar search + filterCount + sortOptions + hasActiveState + extra />
<Pagination sticky when totalPages > 1 />
<DataTable rows columns isLoading emptyLabel getRowHref renderRowActions />
Filter drawer: fixed left, z-50, w-80, chip filter buttons + Apply
Mutations (ConfirmDeleteModal / Modal) rendered as fragments AFTER main div
```

### Files changed (appkit/) — Batch 1

- `AdminBidsView.tsx` — status filter (All/active/outbid/won/cancelled), cancel bid ConfirmDeleteModal
- `AdminCartsView.tsx` — type filter (All/guest/auth), server-side via `filters` param
- `AdminWishlistsView.tsx` — sort only; no filter drawer
- `AdminSessionsView.tsx` — isActive filter, revoke action + ConfirmDeleteModal
- `AdminPayoutsView.tsx` — status filter, mark-paid Modal, CSV export via `extra` prop
- `AdminNotificationsView.tsx` — type filter (10 types), resend + delete + ConfirmDeleteModal
- `AdminAllEventEntriesView.tsx` — status filter, confirm/waitlist/cancel RowActionMenu
- `AdminReturnRequestsView.tsx` — sort only; approve→REFUNDED + reject→DELIVERED both ConfirmDeleteModal
- `AdminStoreAddressesView.tsx` — sort only; read-only view

### Files changed (appkit/) — Batch 2

- `AdminNewsletterView.tsx` — status filter, unsubscribe ConfirmDeleteModal, CSV export via `extra`
- `AdminContactView.tsx` — status filter, AdminContactEditorView drawer preserved, delete ConfirmDeleteModal
- `appkit/src/features/events/components/AdminEventsView.tsx` — status + type filter, `getRowHref` added
- `AdminReviewsView.tsx` — status + rating filters, approve/reject/feature/unfeature/reply/view actions
- `AdminProductsView.tsx` — status + type filters, isFeatured/isPromoted/isOnSale/isSold toggle columns with optimistic `overrides` state

### Files changed (appkit/) — Batch 3 + Fix

- `AdminCarouselView.tsx` — active filter, drag-and-drop reorder preserved (`localRows`/`draggingId` state)
- `AdminSectionsView.tsx` — minimal targeted edit on 2800+ line file; replaced only the `AdminListingScaffold` usage; all custom section form builders preserved unchanged

**DataTable columns fix:** Made `columns` prop optional (`columns?:`). Added `DEFAULT_COLUMNS` with primary/secondary combined cell, status badge (w-32), updatedAt relative date (w-32). Fixed 28 TS2741 errors across all migrated views that omit `columns`.

**actionsSlot → extra:** Fixed wrong prop name `actionsSlot` to `extra` on `AdminPayoutsView` and `AdminNewsletterView` (`ListingToolbar`'s actual prop is `extra?: React.ReactNode`).

Both `npx tsc --noEmit` checks (appkit/ and letitrip.in/) passed clean post-migration.

---

# Session 76-content — 2026-05-10 (About Us + Legal pages + Admin editing)

## About page wired with real content

`src/app/[locale]/about/page.tsx` — converted to async server component.
Reads `getTranslations("about")` for default i18n content and `siteSettingsRepository.getSingleton()`
for optional Firestore overrides (`siteSettings.aboutContent.*`). Passes fully populated `labels`,
`howItems`, `valueItems`, `milestones` props to `AboutView`. Added SEO metadata.

**Files changed:**
- `src/app/[locale]/about/page.tsx` — async, i18n + Firestore-driven props

## PolicyPageView fixed + wired to Firestore

Two bugs fixed in `PolicyPageView.tsx`:
1. Namespace map was wrong (`privacyPolicy`/`termsOfService`/`cookiePolicy` don't exist in en.json).
   Fixed: `privacy:"privacy"`, `terms:"terms"`, `cookies:"cookies"`, `refund:"refundPolicy"`.
2. Added Firestore fetch — if admin has set HTML in `siteSettings.legalPages.*`, it renders that HTML.
   Otherwise falls back to i18n sections.

**Files changed:**
- `appkit/src/features/about/components/PolicyPageView.tsx` — namespace fix + Firestore override

## messages/en.json — policy sections arrays added

All four policy namespaces (`terms`, `privacy`, `cookies`, `refundPolicy`) now export:
`sections` (array of `{heading, body}`), `intro`, `relatedTitle`, `relatedPrivacy`,
`relatedTerms`, `relatedCookies`, `relatedRefund`. PolicyPageView i18n fallback now works correctly.

**Files changed:**
- `messages/en.json` — terms, privacy, cookies, refundPolicy namespaces updated

## AdminSiteSettingsView — ⓪ About tab added

New tab appears first in Site Settings. Fields: hero title, hero subtitle, mission title,
mission text, CTA title. Saved to `siteSettings.aboutContent.*`. Empty = use platform defaults.

**Files changed:**
- `appkit/src/features/admin/components/AdminSiteSettingsView.tsx` — ⓪ About tab + state + mutation

## Metadata added to all static pages

`Metadata` exports added to: about, privacy, terms, cookies, refund-policy, shipping-policy pages.

**Files changed:**
- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/cookies/page.tsx`
- `src/app/[locale]/refund-policy/page.tsx`
- `src/app/[locale]/shipping-policy/page.tsx`

---

# Session 76-infra — 2026-05-10 (J13, J14, J15, INFRA1, INFRA2, Firebase reset)

## J13 — Products listing empty: missing isAuction/isPreOrder on seed docs + missing Firestore indexes

**Root cause 1:** All 20 standard product seed docs had no `isAuction` or `isPreOrder` field.
Firestore `where("isAuction", "==", false)` returns 0 docs when field is absent.

**Root cause 2:** Missing composite index `(status, isAuction, createdAt)` — FAILED_PRECONDITION
silently caught as null initialData → staleTime:Infinity → no client refetch.

**Files changed (appkit/):**
- `appkit/src/seed/products-standard-seed-data.ts` — added `isAuction: false, isPreOrder: false` to all 20 standard product documents
- `appkit/firebase/base/firestore.indexes.json` — added `(status ASC, isAuction ASC, createdAt DESC)` and `(status ASC, isAuction ASC, isPreOrder ASC, createdAt DESC)` composite indexes

## J14 — Blog listing empty: SSR initialData shape mismatch

`BlogIndexPageView` passed `FirebaseSieveResult` (has `.items`) directly as `initialData` to
`BlogIndexListing` which expects `BlogListResponse` (has `.posts`). `posts` always undefined.

**Files changed (appkit/):**
- `appkit/src/features/blog/components/BlogIndexPageView.tsx` — transform SSR result to `BlogListResponse { posts, meta }` before passing; pass `undefined` on SSR failure (not null)

## J15 — Events listing empty: wrong default status filter

`EventsListPageView.buildEventFilters()` defaulted to `"status==published"` — no events have this status.

**Files changed (appkit/):**
- `appkit/src/features/events/components/EventsListPageView.tsx` line 24 — changed default `"status==published"` to `"status==active"`

## INFRA1 — firebase-reset.mjs dry-run crash: .count() not in firebase-admin v10

**Files changed (appkit/):**
- `appkit/scripts/firebase-reset.mjs` — replaced `collectionRef.count().get()` + `.data().count` with `collectionRef.get()` + `.size`

## INFRA2 — New firebase-delete-indexes.mjs utility script

Fixes 409 "index already exists" when partial deploys leave indexes in CREATING state.
Uses firebase-tools OAuth refresh token + Firestore REST API to bulk-delete all composite indexes.
Also fixed 2 duplicate faqs entries in `appkit/firebase/base/firestore.indexes.json`:
`isPinned,priority,order` (positions 34+38) and `isActive,createdAt` (positions 58+206).

**Files changed (appkit/):**
- `appkit/scripts/firebase-delete-indexes.mjs` — NEW utility script
- `appkit/firebase/base/firestore.indexes.json` — removed 2 duplicate faqs index entries

## Firebase full reset + redeploy

Full Firebase project reset (all Firestore, Auth, 24 Cloud Functions, 205 indexes wiped + redeployed clean).
263 composite indexes deployed. Re-seed required: go to `/demo/seed` and seed all 23 collections.

---

# Session 75 — 2026-05-10 (X3, X4, X5, X6)

## X3 — Dark mode + responsive grid for AdminBrandEditorView + AdminCategoryEditorView

**Files changed (appkit/):**
- `AdminBrandEditorView.tsx` — grouped name+slug, logo+banner, website+displayOrder into `sm:grid-cols-2` pairs
- `AdminCategoryEditorView.tsx` — grouped name+slug into `sm:grid-cols-2`; `dark:text-zinc-300` on raw `<label>`, `dark:text-neutral-400` on helper `<p>`

## X4 — Form quality checklist in HOW TO WORK

**Files changed (src/):**
- `prompt.md` — added "Form quality checklist" section (7 items: mobile/tablet/dark/tokens/focus/errors/loading) under HOW TO WORK

## X5 — PageLoader component + replace all 15 loading.tsx skeletons

**Files changed (appkit/):**
- `appkit/src/ui/components/PageLoader.tsx` — NEW: "use client" component; centered spinner + "Loading…" text; 15s `setTimeout` → "Something went wrong. Please refresh." + Refresh button
- `appkit/src/ui/index.ts` — exported `PageLoader`
- `appkit/src/index.ts` — exported `PageLoader` from root

**Files changed (src/):**
- All 15 `src/app/[locale]/**/loading.tsx` — replaced inline skeletons with `<PageLoader />` from `@mohasinac/appkit`

## X6 — Media filename slug convention in upload handlers

**Files changed (appkit/):**
- `appkit/src/utils/id-generators.ts` — added `brand-logo` + `brand-banner` to `MediaFilenameContext` union; added `generateBrandLogoFilename` + `generateBrandBannerFilename` generators; wired into `generateMediaFilename` switch
- `AdminBrandEditorView.tsx` — logo/banner `onUpload` now passes `{ type: "brand-logo/banner", brand: name || slug }`
- `AdminBlogEditorView.tsx` — cover `onUpload` now passes `{ type: "blog-cover", title, category }`

---

# Session 74 — 2026-05-10 (B5/VA16, B6/VA14, B7/VA15, VA17, VA18, LL16, LL17)

## B5/VA16 — AdminBidsView cancel action

**Files changed (appkit/):**
- `AdminBidsView.tsx` — added `cancelMutation` (PATCH `BID_BY_ID` with `{ status: "cancelled" }`), `ConfirmDeleteModal` (variant=warning), `RowActionMenu` with "Cancel bid" (destructive, disabled when already cancelled/voided)
- `RowActionMenu.tsx` — added `disabled` to `RowAction` interface + renders with `opacity-40 cursor-not-allowed`

## B6/VA14 — AdminNewsletterView unsubscribe + CSV export

**Files changed (appkit/):**
- `AdminNewsletterView.tsx` — added `unsubscribeMutation` (DELETE `NEWSLETTER_BY_ID`), `handleExportCsv` (fetch blob download), actionsSlot "Export CSV" button, RowActionMenu "Unsubscribe" (destructive, disabled when already unsubscribed)
- `api-endpoints.ts` — `ADMIN_ENDPOINTS.NEWSLETTER_EXPORT: "/api/admin/newsletter/export"`

**Files changed (src/):**
- `src/app/api/admin/newsletter/export/route.ts` — GET, auth admin/moderator, `newsletterRepository.list()`, streams CSV with headers: id, email, status, source, subscribedAt, createdAt

## B7/VA15 — AdminContactView RowActionMenu + AdminContactEditorView SideDrawer

**Files changed (appkit/):**
- `AdminContactEditorView.tsx` — NEW: SideDrawer with status badge (blue/zinc/green), From section, scrollable message body, "Reply via email" (mailto:), "Mark read" (PATCH action=read), "Archive" (PATCH action=resolved)
- `AdminContactView.tsx` — added RowActionMenu (View/Mark read/Archive/Delete), `deleteMutation`, `AdminContactEditorView` wiring, `ConfirmDeleteModal` for delete
- `index.ts` — exported `AdminContactEditorView` + props type

## VA17 — AdminFeatureFlagsView dedicated endpoint + rollout %

**Files changed (appkit/):**
- `AdminFeatureFlagsView.tsx` — switched from `useSiteSettings` to `useQuery` on `ADMIN_ENDPOINTS.FEATURE_FLAGS`; per-flag toggle + rollout % Input (0–100, disabled when flag off); Save via `apiClient.put`
- `api-endpoints.ts` — `ADMIN_ENDPOINTS.FEATURE_FLAGS: "/api/admin/feature-flags"`

**Files changed (src/):**
- `src/app/api/admin/feature-flags/route.ts` — GET returns `{ flags, rollouts }` from siteSettings; PUT zod-validated, writes `featureFlags` + `featureFlagRollouts` via `updateSingleton`

## VA18 — AdminMediaView copy-URL button

**Files changed (appkit/):**
- `AdminMediaView.tsx` — added `copiedUrl` state, `copyToClipboard` via `navigator.clipboard.writeText`, "Copy URL" button for heroAssetUrl + per-asset "Copy" in gallery list

## LL16 — AdminReturnRequestsView

**Files changed (appkit/):**
- `AdminReturnRequestsView.tsx` — NEW: `AdminListingScaffold` filtered to `?status=RETURN_REQUESTED`, `approveMutation` (→REFUNDED), `rejectMutation` (→DELIVERED), two ConfirmDeleteModals
- `api-endpoints.ts` — `ADMIN_ENDPOINTS.STORE_ADDRESSES: "/api/admin/store-addresses"`
- `route-map.ts` — `ROUTES.ADMIN.RETURN_REQUESTS: "/admin/return-requests"`
- `index.ts` — exported `AdminReturnRequestsView` + props type

**Files changed (src/):**
- `src/app/[locale]/admin/return-requests/page.tsx` — NEW: wraps `AdminReturnRequestsView`
- `src/constants/navigation.tsx` — "Returns" link in Management group

## LL17 — AdminStoreAddressesView

**Files changed (appkit/):**
- `AdminStoreAddressesView.tsx` — NEW: read-only `AdminListingScaffold`, optional `storeId` filter, no mutations
- `route-map.ts` — `ROUTES.ADMIN.STORE_ADDRESSES: "/admin/store-addresses"`
- `index.ts` — exported `AdminStoreAddressesView` + props type

**Files changed (src/):**
- `src/app/api/admin/store-addresses/route.ts` — GET; if `storeId` param → specific store subcollection; else → `collectionGroup("addresses")`
- `src/app/[locale]/admin/store-addresses/page.tsx` — NEW: wraps `AdminStoreAddressesView`
- `src/constants/navigation.tsx` — "Store Addresses" link in Management group

---

# Session 73 — 2026-05-09 (N3, B1/VA10, B2/VA9, N2/VA11, LL11–LL15)

## N3 — Admin Stores editor: isVerified + suspensionReason fields

**Files changed (appkit/):**
- `AdminStoreEditorView.tsx` — added `currentIsVerified` prop, `isVerified`/`suspensionReason` state, Verified toggle, conditional suspensionReason textarea (shown only when status==="suspended"), both fields included in PATCH payload
- `AdminStoresView.tsx` — added `currentIsVerified={Boolean(selectedRow?._raw?.isVerified)}` to `AdminStoreEditorView`

**Files changed (src/):**
- `src/app/api/admin/stores/[uid]/route.ts` — extended `updateStoreSchema` with `isVerified: z.boolean().optional()` and `suspensionReason: z.string().optional()`

## B1/VA10 — AdminUserEditorView SideDrawer + AdminUsersView RowActionMenu

**Files changed (appkit/):**
- `AdminUserEditorView.tsx` — NEW: SideDrawer with role select (user/seller/admin), isDisabled toggle + banReason textarea (conditional), emailVerified toggle, adminNotes textarea; "Delete user" danger button → ConfirmDeleteModal; PATCH + DELETE to ADMIN_ENDPOINTS.USER_BY_ID
- `AdminUsersView.tsx` — added `UserRow` type with `_raw`, drawer state, RowActionMenu "Manage" action → AdminUserEditorView
- `components/index.ts` — exported AdminUserEditorView
- `index.ts` — exported AdminUserEditorView

## B2/VA9 — AdminOrderEditorView SideDrawer + AdminOrdersView RowActionMenu

**Files changed (appkit/):**
- `AdminOrderEditorView.tsx` — NEW: SideDrawer with status select (all 7 statuses), trackingNumber input, carrier select (Delhivery/BlueDart/DTDC/Ekart/India Post/Other), refundAmount input (shown for REFUNDED/RETURN_REQUESTED), notes textarea; PATCH to ADMIN_ENDPOINTS.ORDER_BY_ID
- `AdminOrdersView.tsx` — added `OrderRow` type with `_raw`, drawer state, RowActionMenu "Update order" action → AdminOrderEditorView; filter options updated to uppercase statuses
- `components/index.ts` — exported AdminOrderEditorView
- `index.ts` — exported AdminOrderEditorView

## N2/VA11 — AdminReviewsView moderation actions

**Files changed (appkit/):**
- `AdminReviewsView.tsx` — full rewrite: patchMutation for approve/reject/feature; replyMutation for adminReply; RowActionMenu with Approve/Reject/Feature(Unfeature)/Reply/View actions; Reply uses Modal (1 field rule); View uses ViewReviewModal; Review object constructed from `_raw` with required typed fields

## LL11 — AdminSessionsView + page + nav entry

**Files changed (appkit/):**
- `AdminSessionsView.tsx` — NEW: columns (user/device/browser/OS/IP-masked/lastActivity/expires/isActive badge); active-only filter toggle; Revoke action → ConfirmDeleteModal → DELETE ADMIN_ENDPOINTS.SESSION_BY_ID; maskIp helper (last octet → *)
- `components/index.ts` + `index.ts` — exported AdminSessionsView
- `next/routing/route-map.ts` — added `SESSIONS: "/admin/sessions"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/[locale]/admin/sessions/page.tsx` — NEW thin wrapper

## LL12 — AdminAllEventEntriesView + API routes + page + nav entry

**Files changed (appkit/):**
- `AdminAllEventEntriesView.tsx` — NEW: cross-event entries view; status filter (All/CONFIRMED/WAITLISTED/CANCELLED); RowActionMenu Confirm/Waitlist/Cancel actions → PATCH ADMIN_ENDPOINTS.ADMIN_EVENT_ENTRY_BY_ID
- `api-endpoints.ts` — added `ADMIN_EVENT_ENTRIES` + `ADMIN_EVENT_ENTRY_BY_ID`
- `components/index.ts` + `index.ts` — exported AdminAllEventEntriesView
- `next/routing/route-map.ts` — added `ALL_EVENT_ENTRIES: "/admin/event-entries"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/event-entries/route.ts` — NEW: GET all entries via `eventEntryRepository.findAll(limit)`
- `src/app/api/admin/event-entries/[id]/route.ts` — NEW: PATCH status (CONFIRMED/WAITLISTED/CANCELLED)
- `src/app/[locale]/admin/event-entries/page.tsx` — NEW thin wrapper

## LL13 — AdminNotificationsView + API routes + page + nav entry

**Files changed (appkit/):**
- `AdminNotificationsView.tsx` — NEW: type filter; delete + resend row actions; Resend → POST resend endpoint (marks isRead=false)
- `api-endpoints.ts` — added `ADMIN_NOTIFICATIONS`, `ADMIN_NOTIFICATION_BY_ID`, `ADMIN_NOTIFICATION_RESEND`
- `components/index.ts` + `index.ts` — exported AdminNotificationsView
- `next/routing/route-map.ts` — added `NOTIFICATIONS: "/admin/notifications"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/notifications/route.ts` — NEW: GET via notificationRepository.findAll(limit)
- `src/app/api/admin/notifications/[id]/route.ts` — NEW: DELETE
- `src/app/api/admin/notifications/[id]/resend/route.ts` — NEW: POST (marks isRead=false)
- `src/app/[locale]/admin/notifications/page.tsx` — NEW thin wrapper

## LL14 — AdminCartsView + API route + page + nav entry

**Files changed (appkit/):**
- `AdminCartsView.tsx` — NEW: read-only diagnostic view; guest/auth type filter
- `api-endpoints.ts` — added `ADMIN_CARTS`
- `components/index.ts` + `index.ts` — exported AdminCartsView
- `next/routing/route-map.ts` — added `CARTS: "/admin/carts"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/carts/route.ts` — NEW: GET via cartRepository.findAll(limit)
- `src/app/[locale]/admin/carts/page.tsx` — NEW thin wrapper

## LL15 — AdminWishlistsView + API route + page + nav entry

**Files changed (appkit/):**
- `AdminWishlistsView.tsx` — NEW: read-only wishlist insights view
- `api-endpoints.ts` — added `ADMIN_WISHLISTS`
- `components/index.ts` + `index.ts` — exported AdminWishlistsView
- `next/routing/route-map.ts` — added `WISHLISTS: "/admin/wishlists"` to ROUTES.ADMIN

**Files changed (src/):**
- `src/app/api/admin/wishlists/route.ts` — NEW: GET via Firestore collectionGroup("wishlist") (subcollection — no repository cross-user query exists); extracts userId from ref path
- `src/app/[locale]/admin/wishlists/page.tsx` — NEW thin wrapper

**Navigation changes (src/):**
- `src/constants/navigation.tsx` — Events moved from Content group to new dedicated Events group with "All Entries"; Sessions/Notifications/Carts/Wishlists added to System group; Feature Flags + Copilot remain in System group

**tsc:** 0 errors both repos (after `npm run build` in appkit/). **Commit:** pending

---

# Session 72 — 2026-05-09 (ARCH4 + I3)

## ARCH4 — Admin payouts storeId identity + mark-paid + CSV export

**Files changed (appkit/):**
- `AdminPayoutsView.tsx` — stateful rewrite: storeName/storeId identity (sellerName fallback); RowActionMenu "Mark paid" → Modal (transactionId input); Export CSV actionsSlot button; PATCH + CSV fetch mutations; `useQueryClient` invalidation
- `api-endpoints.ts` — added `PAYOUTS_EXPORT: "/api/admin/payouts/export"` to ADMIN_ENDPOINTS

**Files changed (letitrip.in/):**
- `src/app/api/admin/payouts/export/route.ts` — NEW: GET handler, auth admin/moderator, fetches up to 1000 payouts, returns text/csv (id/storeId/storeName/amount/status/transactionId/periodStart/periodEnd/createdAt); storeId/storeName fall back to sellerId/sellerName until ARCH8

**Note:** Seed data still uses sellerId/sellerName. UI will show correct store name once ARCH8 re-seeds payouts with storeId/storeName. Fallback ensures no breakage before ARCH8.

## I3 — Sections seed reset button

**Files changed (appkit/):**
- `AdminSectionsView.tsx` — imports ConfirmDeleteModal + DEMO_ENDPOINTS; `seedResetOpen` state; `resetSeed` mutation (POST DEMO_ENDPOINTS.SEED {action:load,collections:[homepageSections]}); "Reset seed data" outline button in actionsSlot wrapping Div; ConfirmDeleteModal at JSX root

---

# Session 72 — 2026-05-09 (store identity architecture decision)

## ARCH tier — Store identity architecture established

**Decision:** LetiTrip's public-facing identity is the **store**, not the individual seller user. This architectural rule governs all future UI, API, and schema work.

**Rules adopted:**
1. **Public identity** = `storeId` / `storeName` / `storeSlug` — shown in cards, detail pages, reviews, cart, profiles. `sellerId` / `sellerName` are banned from public API responses and client-rendered props.
2. **Admin identity** = may additionally show `ownerId` (display alias for `sellerId`, the Firebase UID of the store owner).
3. **Internal auth** = `sellerId` (Firebase UID) stays in server-only code (checkout, analytics, payout calculation, authorization). Never returned in API responses.
4. **SideDrawer vs Modal rule**: 0 fields → `ConfirmDeleteModal`; 1–2 fields → `Modal`; 3+ fields → `SideDrawer`.
5. **User roles** (public 3-tier): `user` (basic buyer) | `seller` (has ≥1 store) | `admin` (platform admin). `moderator` = internal admin sub-role.

**Tasks created:** ARCH1–ARCH9 (9 new tasks in Tier ARCH of crud-tracker.md).
**Tasks superseded:** M3 → ARCH4; VA13 → ARCH4.
**Current session remaining:** ARCH4 (payouts mark-paid + CSV with store identity) + I3 (seed reset button).

**No code changed in this entry — this is a planning/architecture session entry.**

---

# Session 72 — 2026-05-09 (catalogue release)

## VA3+VA12+RC4 — Categories CRUD fixed + Stores management wired

**Root causes fixed:**
1. `AdminCategoryEditorView.loadCategoryOptions` — was reading `.items` but API returns `.data` array inside successResponse wrapper → fixed response shape parsing
2. `AdminCategoriesView` — no `getRowHref` prop → added, rows now navigate to edit page
3. RC4: `categories/[[...action]]/page.tsx` + `categories/new/page.tsx` + `categories/[id]/edit/page.tsx` coexisted → Next.js "same specificity" build error → deleted `[[...action]]`, created `categories/page.tsx` list page
4. `categories/new/page.tsx` + `[id]/edit/page.tsx` had no `onSaved`/`onDeleted` → added `useRouter` navigation callbacks
5. `AdminStoresView` had no row actions → added `RowActionMenu` with "Manage" → opens `AdminStoreEditorView` SideDrawer
6. `AdminStoreEditorView` didn't exist → built (storeStatus select, adminNotes textarea, isFeatured toggle, PATCH to STORE_BY_ID)
7. `DataTable` + `AdminListingScaffold` had no `renderRowActions` prop → added; `DataTable` renders extra column with action cell (stopPropagation to prevent row navigation conflict)

**Files changed (appkit/):**
- `AdminCategoriesView.tsx` — added `getRowHref` prop
- `AdminCategoryEditorView.tsx` — fixed `loadCategoryOptions` response parsing
- `AdminStoresView.tsx` — added RowActionMenu + AdminStoreEditorView wiring
- `AdminStoreEditorView.tsx` — NEW SideDrawer component
- `DataTable.tsx` — added `renderRowActions` prop + extra column render
- `AdminListingScaffold.tsx` — added `renderRowActions` prop + pass-through to DataTable
- `components/index.ts` + `index.ts` — exported AdminStoreEditorView

**Files changed (src/):**
- `admin/categories/page.tsx` — NEW list page (was [[...action]])
- `admin/categories/[[...action]]/page.tsx` — DELETED (RC4 fix)
- `admin/categories/new/page.tsx` — added useRouter onSaved/onDeleted
- `admin/categories/[id]/edit/page.tsx` — added useRouter + use(params)

**tsc:** 0 errors both repos. **Commits:** 978e1f0 (appkit), 9bb5d3a87 (main)

---

# Session 72 — 2026-05-09

## M1/VA19 — Analytics date range forwarding

**What changed:**
- `src/app/api/admin/analytics/route.ts` — extracts `startDate`/`endDate` from query params and forwards them in the Firebase Function POST body; `handler` signature updated to `({ request })`
- `src/components/admin/AdminAnalyticsClient.tsx` — already existed with date range picker + endpoint wiring (no change needed)
- `AdminAnalyticsView` + charts (`AdminRevenueChart`, `AdminOrdersChart`, `AdminTopProductsTable`) — already wired, no change

**tsc:** 0 errors. **Commit:** a5b2c870f (main)

---

# Session 71 — 2026-05-09 (continued)

## VA8 — AdminSiteSettingsView (12-tab site settings form)

**Files changed (appkit/):**
- `src/features/admin/components/AdminSiteSettingsView.tsx` — NEW: 12-tab settings form; groups: Branding, Appearance, Announcement, SEO, Contact & Social, Watermark, Fees, Integrations, Shipping, Auction Config, Platform Limits, Legal Policies
- `src/features/admin/components/index.ts` — exported `AdminSiteSettingsView`, `AdminSiteSettingsViewProps`
- `src/index.ts` — exported both

**Files changed (src/):**
- `src/app/[locale]/admin/site/page.tsx` — updated to render `AdminSiteSettingsView` (was `AdminSiteView`)
- `src/app/api/admin/site/route.ts` — NEW: GET (getSingleton + credentialsMasked) + PUT (updateSingleton with `z.record(z.string(), z.unknown())` schema)

**Key implementation notes:**
- `useSave` factory pattern — one mutation per tab; each Save button sends only that group's payload
- `MaskedInput` helper — password field with Reveal/Hide toggle for all API keys/secrets
- Native `<input type="color">` for color pickers; `Slider` for watermark size/opacity; plain `<textarea>` for legal HTML
- Fees stored in paise (×100 for threshold + minBidIncrement display)
- Watermark live preview (text only)
- `z.record(z.string(), z.unknown())` — Zod 2-arg form required in newer Zod versions

**tsc:** 0 errors both repos. **Commits:** f931bec (appkit), f1ce1d42d (main)

---

# RC1/RC2 — 2026-05-09

## Navigation centralised + ROUTES completed

### RC1 — `src/constants/navigation.tsx` extended (was: only `MAIN_NAV_ITEMS`)

New exports added:
- `ADMIN_NAV_GROUPS` — admin sidebar (6 groups: Management, Finance, Catalog, Content, Site, System)
- `STORE_NAV_GROUPS` — store sidebar (5 groups: Overview, Listings, Orders, Finance, Store) — added "Orders" group that was previously missing
- `USER_NAV_GROUPS` + `USER_NAV_ALL_ITEMS` — user account sidebar
- `SIDEBAR_SUPPORT_LINKS` — public sidebar Support section (About, Contact, Help)
- `FOOTER_LINK_GROUPS` — all 5 footer columns (Shop, Support, For Sellers, Learn, Legal)

Layout files simplified:
- `src/app/[locale]/admin/layout.tsx` — removed inline `ADMIN_NAV_GROUPS`; imports from config
- `src/app/[locale]/store/layout.tsx` — removed inline `STORE_NAV_GROUPS`; imports from config
- `src/app/[locale]/user/layout.tsx` — removed inline `USER_NAV_GROUPS` + `ALL_NAV_ITEMS`; imports from config

`LayoutShellClient.tsx` simplified:
- `navItems` now maps `MAIN_NAV_ITEMS` + `tNav(key)` (was 9 inline emoji items)
- `sidebarSections` uses `SIDEBAR_SUPPORT_LINKS` from config; **fixed dep array bug** (missing `seedPanelEnabled` + `user?.role`)
- `footer.linkGroups` uses `FOOTER_LINK_GROUPS` from config (removed ~55 inline lines)

### RC2 — New ROUTES constants added to `appkit/src/next/routing/route-map.ts`

| Key | Value |
|-----|-------|
| `ADMIN.EVENTS_NEW` | `/admin/events/new` |
| `ADMIN.EVENTS_EDIT(id)` | `/admin/events/:id/edit` |
| `ADMIN.ADS_NEW` | `/admin/ads/new` |
| `ADMIN.ADS_EDIT(id)` | `/admin/ads/:id/edit` |
| `PUBLIC.SUBLISTING_CATEGORIES` | `/sublisting-categories` |
| `PUBLIC.SUBLISTING_CATEGORY(slug)` | `/sublisting-categories/:slug` |

**0 new TS errors in both repos.**

---

# Session 71 — 2026-05-09

## A5/VA5 — FAQ editor + list wired

**What changed**:
- `appkit/src/features/admin/components/AdminFaqEditorView.tsx` — new FAQ create/edit form: question, answer (RichTextEditor), category, tags, slug (auto from question, faq- prefix), order, priority, visibility toggles (isActive, isPinned, showOnHomepage, showInFooter); create/update/delete via API
- `appkit/src/features/admin/components/AdminFaqsView.tsx` — added `actionHref`/`getRowHref` props
- `src/app/[locale]/admin/faqs/page.tsx` — new dedicated list page
- `src/app/[locale]/admin/faqs/new/page.tsx` — create page
- `src/app/[locale]/admin/faqs/[id]/edit/page.tsx` — edit page
- `src/app/[locale]/admin/faqs/[[...action]]/page.tsx` — deleted (converted to dedicated routes, RC4 partial)
- `src/app/api/admin/faqs/route.ts` — added POST (create FAQ)
- `src/app/api/admin/faqs/[id]/route.ts` — added PATCH alias for PUT
- Seed: no change needed (FAQ seed data shape unchanged)

---

# RC2/RC3 partial — 2026-05-09

## Hardcoded route strings replaced with ROUTES.* constants

**Files changed (src/):**
- `admin/carousel/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/carousel"` → `ROUTES.ADMIN.CAROUSEL`
- `admin/faqs/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/faqs"` + template literal → `ROUTES.ADMIN.FAQS` / `ROUTES.ADMIN.FAQS_EDIT(id)`
- `admin/coupons/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/coupons"` + template literal → `ROUTES.ADMIN.COUPONS` / `ROUTES.ADMIN.COUPONS_EDIT(id)`
- `admin/blog/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/blog"` + template literal → `ROUTES.ADMIN.BLOG` / `ROUTES.ADMIN.BLOG_EDIT(id)`
- `admin/products/new/page.tsx` + `[id]/edit/page.tsx` — `"/admin/products"` + template literal → `ROUTES.ADMIN.PRODUCTS` / `ROUTES.ADMIN.PRODUCTS_EDIT(id)`
- `components/user/UserAddressesClient.tsx` — `"/user/addresses/add"` + template literal → `ROUTES.USER.ADDRESSES_ADD` / `ROUTES.USER.ADDRESSES_EDIT(id)`
- `components/user/EditAddressClient.tsx` — `"/user/addresses"` → `ROUTES.USER.ADDRESSES`
- `components/user/AddAddressClient.tsx` — `"/user/addresses"` → `ROUTES.USER.ADDRESSES`
- `components/user/ProfilePageClient.tsx` — `"/user/addresses"` → `ROUTES.USER.ADDRESSES`
- `components/auth/LoginPageClient.tsx` — `"/"` → `ROUTES.HOME`
- `components/auth/RegisterPageClient.tsx` — `"/"` → `ROUTES.HOME`
- `components/routing/CheckoutRouteClient.tsx` — `"/login?returnTo=/checkout"` → `ROUTES.AUTH.LOGIN + returnTo + ROUTES.USER.CHECKOUT`
- `components/routing/CartRouteClient.tsx` — `"/checkout"` → `ROUTES.USER.CHECKOUT`
- `events/[id]/PollInlineClient.tsx` — `<a href="/login">` → `<Link href={ROUTES.AUTH.LOGIN}>`
- `events/[id]/participate/EventParticipateClient.tsx` — `<a href="/login">` → `<Link href={ROUTES.AUTH.LOGIN}>`

**Files changed (appkit/):**
- `features/events/components/EventPollWidget.tsx` — `href="/login"` → `href={ROUTES.AUTH.LOGIN}`

**Remaining (not fixed here):**
- `CartRouteClient.tsx`: `<Button onClick={() => router.push(ROUTES.USER.CHECKOUT)}>` — still a Button-navigates violation; deferred to full RC3 `asChild` sweep
- `RC2` route-map additions (`SUBLISTING_*`, `SEARCH(q)`) — no current consumers, deferred

**0 TS errors both repos after these changes.**

---

# Hotfix — 2026-05-09

## Build error: Next.js "same specificity" route collision in `/admin/products`

**Error**: `You cannot define a route with the same specificity as a optional catch-all route ("/[locale]/admin/products" and "/[locale]/admin/products[[...action]]")`

**Root cause**: After Session 69 added dedicated `products/page.tsx`, `products/new/page.tsx`, and `products/[id]/edit/page.tsx`, the old stub `products/[[...action]]/page.tsx` was left in place. The `[[...action]]` can match the root path `/admin/products`, which collides with the explicit `page.tsx` at that level.

**Fix**: Deleted `src/app/[locale]/admin/products/[[...action]]/page.tsx` (and its directory). The wired list page at `products/page.tsx` (`AdminProductsView` with `actionHref` + `getRowHref`) is the correct implementation.

**Audit result**: Only `products` had this conflict. Other areas using `[[...action]]` (blog, coupons, carousel, categories, bids, orders, reviews, sections, users) do **not** have a sibling root `page.tsx` — they are unaffected. RC4 full audit remains ⏳.

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
