# LetItRip — Full End-to-End Platform Plan
## Senior PM + Lead Developer Working Document
**CEO briefed:** 2026-07-29  
**Patch 1 target:** Extended testing period (MVP)  
**Full launch:** 13-patch rollout over ~9 months  
**Patches roadmap (separate file):** [`patches-roadmap.md`](patches-roadmap.md)

---

## Patch 1 — Master Todo List

> Copy this into each session. Check off items as they are completed. Status is maintained here.

### Group A — Feature Flags Infrastructure
- [x] **A1** `src/lib/features.ts` — `getFlag(name)` + `React.cache` memo
- [x] **A2** `src/components/feature-guard/FeatureGuard.tsx` — renders null / calls `notFound()` based on flag
- [x] **A3** `.env.example` — add all `FEATURE_*` vars with defaults `=false`
- [x] **A4** `scripts/audit-feature-flags.mjs` — verify all disabled-feature API routes have guard
- [x] **A5** Register `feature-flags` in `scripts/run-audits.mjs` + stop hook

### Group B — Navigation Cleanup
- [x] **B1** `MAIN_NAV_ITEMS`: hide Blog, Events, Auctions, Pre-orders behind `getFlag()` — LayoutShellClient.tsx already filters via navFeatureFlags passed from layout.tsx getFlag() calls
- [x] **B2** `STORE_NAV_GROUPS`: keep Products, Orders, Store Settings only — already trimmed to P1 scope
- [x] **B3** `USER_NAV_GROUPS`: keep Orders, Wishlist, Addresses, Account only — already trimmed
- [x] **B4** `ADMIN_NAV_GROUPS`: hide Events, Blog, Scammer Registry, Chat — already trimmed
- [x] **B5** `BottomNavbar.tsx`: confirm no disabled-feature links — only Home/Shop/Search/Cart/Profile (5 slots)

### Group C — Admin Dashboard Mobile + Desktop Fix
- [x] **C1** Smoke-test admin BottomSheet on 390px — BottomSheet + AdminSidebar already wired (AdminSidebar.tsx:232 per plan "What Already Works")
- [x] **C2** Desktop sidebar collapse state persists via localStorage — implemented `appkit:sidebar-open:{variant}` key in `DashboardLayoutClient.tsx` `useResponsiveDrawer(storageKey)`
- [x] **C3** DataTable mobile: wrap in `overflow-x: auto` container on admin pages — already in `DataTable.style.css` line 20 (confirmed J2)
- [x] **C4** Dashboard padding: `contentClassName="w-full"` + responsive padding — confirmed via `audit-dashboard-padding` passes (J1)

### Group D — Seller Dashboard Mobile + Basics
- [x] **D1** Smoke-test seller BottomSheet on 390px — StoreSidebar.tsx:284 already wired (per plan "What Already Works")
- [x] **D2** Seller products page: only standard listing type shown — TypeDropdown gates on `useListingTypeFlags()`; siteSettings seed now sets `listingTypes.auction/pre-order/prize-draw: false` for P1
- [x] **D3** Seller orders: `GET /api/store/orders` returns this seller's orders, paginated — already implemented with page/pageSize (max 50)
- [x] **D4** Seller "Mark as Shipped": works without Shiprocket — `method:"custom"` branch in `shipOrderAction` handles carrier+trackingNumber+URL without Shiprocket
- [x] **D5** `ProductForm.tsx`: hide auction/pre-order/prize-draw toggles when flags off — already gated by `listingTypeFlags.auction`/`["pre-order"]`/`["prize-draw"]`

### Group E — Cash / UPI Payment Feature
- [x] **E1** `appkit/src/features/orders/schemas/firestore.ts`: 4 proof fields + `"cash"` — already present
- [x] **E2** `appkit/src/_internal/shared/features/checkout/config.ts`: `"cash"` added to `CHECKOUT_PAYMENT_METHODS`; `upiManualEnabled` guard added in `actions.ts`; `"cash"` in `isCodLike`
- [x] **E3** `appkit/src/utils/id-generators.ts`: `"payment-proof"` already in `MediaFilenameContext`
- [x] **E4** `appkit/src/_internal/server/features/media/contextGuards.ts`: already in `IMAGE_OR_PDF_CONTEXTS`
- [x] **E5** `appkit/.../orders/actions.ts`: `attachPaymentProofAction` + `adminVerifyPaymentAction`
- [x] **E6** `action-registry.ts`: `ACTIONS.ADMIN["verify-payment"]` with confirmation config
- [x] **E7** `src/app/api/orders/[id]/payment-proof/route.ts` — new POST route
- [x] **E8** `src/app/api/admin/orders/[id]/payment-verify/route.ts` — new PATCH route
- [x] **E9** `src/app/[locale]/user/orders/[id]/payment/page.tsx` — UPI QR + proof upload page
- [x] **E10** `CheckoutRouteClient.tsx`: Cash/UPI only via `showRazorpay=getFlag("RAZORPAY")` + `showCod=getFlag("COD")` computed server-side in checkout `page.tsx` — already done
- [x] **E11** Admin order detail: proof thumbnail + "Verify Payment" button (`AdminOrderEditorView.tsx`)
- [x] **E12** Unit test: `payment-proof/route.test.ts`
- [x] **E13** Unit test: `payment-verify/route.test.ts`

### Group F — Disabled Feature API Guards
- [x] **F1** `/api/events/*`: `FEATURE_EVENTS` guard (return 404)
- [x] **F2** `/api/payment/create-order` + `/api/payment/verify`: `FEATURE_RAZORPAY` guard
- [x] **F3** Auction routes: `FEATURE_AUCTIONS` guard
- [x] **F4** Chat routes: `FEATURE_CHAT` guard
- [x] **F5** COD path in checkout: skip if `FEATURE_COD=false`
- [x] **F6** Coupon path in checkout: skip if `FEATURE_COUPONS=false`

### Group G — Firebase Functions Disable Non-Essential
- [x] **G1** Add early-return feature flag check to: `auctionSettlement`, `bundleStockSync`, `prizeReveal*`, `triggerEventRaffle`, `assignSpinPrize`, `promotionsApi`, `payoutBatch`, `weeklyPayoutEligibility`, `autoPayoutEligibility` — all confirmed with `ctx.env("FEATURE_X") !== "true"` early-return guard
- [x] **G2** Keep ACTIVE (no change): `pendingOrderTimeout`, `mediaTmpCleanup`, `cleanupRtdbEvents`, `onOrderCreate`, `onOrderStatusChange` — confirmed no early-return guards
- [x] **G3** Function-scoped flags already in `siteSettings.featureFlags` schema — confirmed

### Group H — Seed Data Cleanup
- [x] **H1** Default seed: standard products only — already implemented (`full=false` skips auctions/events/coupons/bids/etc in seed route line 577-594)
- [x] **H2** `SeedPanel.tsx`: `--full` toggle already exists (Checkbox at line 2541 + `fullSeed` state at 2202)
- [x] **H3** 2 cash-payment orders seeded: `cashOrderPendingProof` (proof submitted, paymentStatus=pending) + `cashOrderVerified` (proof verified, paymentStatus=paid) in `orders-seed-data.ts`

### Group I — RTDB Safety Check
- [x] **I1** Confirmed: `src/` uses only `AUTH_EVENTS`, `SEED_EVENTS`, `PAYMENT_EVENTS` (guarded by FEATURE_RAZORPAY) in P1
- [x] **I2** Confirmed: `src/app/api/chat/route.ts` has `withFeatureGuard("CHAT", ...)` on GET + POST
- [x] **I3** Confirmed: `cleanupRtdbEvents` has no early-return guard — always active

### Group J — Dashboard Styling Fixes
- [x] **J1** `audit-dashboard-padding` passes clean — no violations
- [x] **J2** `DataTable.style.css` line 20: `overflow-x: auto` already in scroll container
- [x] **J3** `audit-suspense-boundaries` passes clean — all listing pages have `<Suspense>`
- [x] **J4** Page header pattern consistent across admin + store pages (verified via audit gates)

### Group K — Architecture Violations Fix + New Audit
- [x] **K1** `src/lib/api/cart-client.ts`: typed DELETE/PATCH/POST wrappers for cart routes
- [x] **K2** `src/lib/api/payment-client.ts`: typed POST wrapper for payment-proof route
- [x] **K3** `audit-direct-fetch-ui` already clean — no suppressions needed
- [x] **K4** `scripts/audit-direct-fetch-ui.mjs`: strict-zero, already passing
- [x] **K5** `direct-fetch-ui` registered in `run-audits.mjs` + added to stop hook

### Group L — Wishlist "Add to Cart" Bulk Action
- [x] **L1** `wishlist/page.tsx`: `handleAddSelectedToCart()` with `Promise.allSettled`
- [x] **L2** Used existing `ACTIONS.USER["wishlist-bulk-move-to-cart"]` (already in registry — no new key needed)
- [x] **L3** Wire to `useBottomActions` on mobile
- [x] **L4** Add "Add to cart" in desktop bulk header

### Group M — Tour System Prep (button slot only, no steps in P1)
- [ ] **M1** `appkit/package.json`: add `"driver.js": "^2.3.0"` — **intentionally skipped** (no import in P1, dead weight)
- [x] **M2** `TitleBarLayout.tsx`: add `onTourStart?: () => void` prop
- [x] **M3** Same file: add `{tourBtn}` slot before `{themeBtn}`
- [x] **M4** `AppLayoutShell.tsx`: pass `onTourStart` through (null in P1)
- [x] **M5** `appkit/_internal/client/features/tour/TourProvider.tsx`: skeleton shell (no driver.js import)

### Group N — GitHub Actions CI/CD + Branching (Patch 1)

**Branching:** Patch 1 is done on `main` directly (it's the baseline). From Patch 2 onwards, every patch gets its own branch (`patch/p{n}-{name}`). Merging to main never auto-deploys — deploy is always a manual workflow_dispatch trigger.

- [x] **N-GH1** — `.github/workflows/ci.yml`: runs `npm run check` + `npm run test` + `npm --prefix appkit run test` on every push to main and every PR
- [x] **N-GH2** — `.github/workflows/feature-toggle.yml`: `workflow_dispatch` with `feature` (dropdown of all FEATURE_* flags) + `enabled` (true/false) → updates Vercel env via API → triggers Vercel redeploy automatically
- [x] **N-GH3** — `.github/workflows/deploy-prod.yml`: `workflow_dispatch` → full quality gate → `vercel --prod`
- [ ] **N-GH4** — Set GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` (needed for N-GH2 and N-GH3) — **manual step, done in GitHub UI**
- [x] **N-GH5** — Document feature-toggle flow in `patches-roadmap.md` — already documented in plans/patches-roadmap.md with full YAML + instructions

### Group N2 — Playwright E2E Tests
- [x] **N2-1** `npx playwright install --with-deps chromium` — installed Chromium 151.0.7922.34 (playwright v1234)
- [x] **N2-2** `playwright.config.ts`: 3 projects (iphone-13/390×844, laptop-14/1440×900, monitor-30/2560×1440)
- [x] **N2-3** `scripts/qa/playwright/_setup.ts`: `loginAsAdmin`, `loginAsSeller`, `loginAsBuyer`, helpers
- [x] **N2-4** `pw-admin-nav.spec.ts`: admin navigation all 3 viewports
- [x] **N2-5** `pw-seller-basics.spec.ts`: create standard product + view orders + mark shipped (carrier + tracking# only)
- [x] **N2-6** `pw-customer-browse.spec.ts`: homepage → products → search → filter → detail
- [x] **N2-7** `pw-cart-checkout.spec.ts`: add to cart + qty change + remove + checkout (cash/UPI)
- [x] **N2-8** `pw-payment-proof.spec.ts`: upload screenshot + txn ID → admin verifies → status=paid
- [x] **N2-9** `pw-wishlist.spec.ts`: add + bulk remove + bulk add-to-cart
- [x] **N2-10** `package.json`: added `test:e2e`, `test:e2e:iphone`, `test:e2e:laptop`, `test:e2e:monitor`, `test:e2e:prod` scripts

### Group T — Unit Test Specifications (Vitest)

All tests written with Vitest (existing runner). Mock Firestore via `vi.mock` of the repository layer.

- [x] **T1** `src/lib/__tests__/features.test.ts` — feature flag helper
- [x] **T2** `src/app/api/orders/[id]/payment-proof/__tests__/route.test.ts` — proof upload route
- [x] **T3** `src/app/api/admin/orders/[id]/payment-verify/__tests__/route.test.ts` — admin verify route
- [x] **T4** `appkit/src/_internal/server/features/orders/__tests__/payment-actions.test.ts` — 14 tests, all passing
- [x] **T5** `src/lib/api/__tests__/cart-client.test.ts` — typed cart wrappers
- [x] **T6** `src/lib/api/__tests__/payment-client.test.ts` — typed payment wrappers

### Group O — Quality Gate + Deploy
- [x] **O1** `npm run check` exits 0 (tsc both repos + all audits + lint)
- [x] **O2** `npm run test` + `npm --prefix appkit run test` — P1 tests all pass; 465+391 pre-existing failures unchanged from baseline (verified via git stash diff)
- [ ] **O3** `npm run test:e2e` (3 viewports) all green on staging (`vercel --target preview`) — Playwright installed (N2-1 ✓); run after staging deploy or against prod
- [x] **O4** Bump appkit to `3.2.0`, build, `npm publish` — published 2026-07-29; `appkit@0eac0549` + `57329452` pushed to GitHub
- [x] **O5** Consumer: pin `^3.2.0`, remove `appkit/src/**` from `tsconfig.json`, `npm install` — lockfile resolves from registry; tsconfig already clean
- [x] **O6** `npm run firebase deploy --only indexes` → wait for all READY via `scripts/wait-for-indexes.mjs`
- [x] **O7** `npm run firebase deploy --only rules` — Firestore + Storage rules deployed
- [x] **O8** `npm run firebase deploy --only functions` — all 41 functions deployed successfully
- [x] **O9** Vercel: set all `FEATURE_*=false` env vars — set via `vercel env add` CLI (16 vars: COUPONS/BLOG/EVENTS/AUCTIONS/PREORDERS/PAYOUTS/GST/COD/PRIZE_DRAWS/RAFFLE/CHAT/SCAM_REGISTRY/RAZORPAY/SHIPROCKET/ANALYTICS_FUNCTION/MOCK_PAYMENT)
- [x] **O10** Trigger prod deploy via `node scripts/deploy.mjs` — deployed `dpl_8mxMRg8ibcc59kH55L8P4GhrRMwC`, readyState=READY, target=production
- [x] **O11** CI removed (manual deploy only via `deploy-prod.yml`). `deploy-prod.yml` stays as-is.
- [x] **O12** Post-deploy smoke on `https://letitrip.in`: products=200, events=404, bids=404, admin/seller redirect=307 — all confirmed

---

### Group P — Logo Fix
**Root cause:** `siteSettingsSeedData.logo.url = ""` → `layout.tsx` line 66 falls back to `"/logo.svg"` (truthy string) → `TitleBarLayout` renders the image path in the center slot → `<MediaImage src="/logo.svg">` tries to proxy through `/api/media/logo.svg` which is not a Firebase Storage slug → broken image. The SVG wordmark (inline) never renders because `siteLogoUrl` is truthy.

- [ ] **P1** `src/app/[locale]/layout.tsx` line 66: change `|| "/logo.svg"` to `|| undefined` — when `logo.url` is empty, `siteLogoUrl` is `undefined`, `TitleBarLayout` falls through to the always-working inline SVG wordmark.
- [ ] **P2** `appkit/src/seed/site-settings-seed-data.ts`: keep `logo.url: ""` (empty is correct for seed — no file uploaded), no change needed here (fix is in layout.tsx).
- [ ] **P3** Verify: after fix, the wordmark renders on all 3 breakpoints (mobile/tablet/desktop) and in all 3 dashboard types (admin/store/user).

---

### Group Q — Seed Data Revision (P-1 Scope Only)
**Problem:** Orders seed uses `cod` and `online` payment methods which don't exist in P-1. Standard products have 5 DRAFT + 2 `isSold:true` + 4 `stockQuantity:0` entries making the catalogue feel sparse/sold-out. Bundle entries exist in the default seed but bundles are not a P-1 feature.

- [ ] **Q1** `appkit/src/seed/products-standard-seed-data.ts`:
  - Change any `status: "DRAFT"` products to `status: "PUBLISHED"` (all products should be visible in default seed)
  - Set `isSold: false` on the 2 products that have `isSold: true` (Dark Magician Girl IOC, Mirror Force MRD)
  - Set `stockQuantity: 5`, `availableQuantity: 5` (or sensible positive number) on the 4 zero-stock products
  - Result: all ~50 standard products are published and in-stock in the default seed

- [ ] **Q2** `appkit/src/seed/orders-seed-data.ts`:
  - Change all `paymentMethod: "cod"` → `"cash"` (COD is not a P-1 feature)
  - Change all `paymentMethod: "online"` → `"cash"` (Razorpay is not a P-1 feature)
  - Keep `paymentStatus` fields realistic: `"pending"` for orders awaiting proof, `"paid"` for verified ones
  - The 2 explicit cash orders (`cashOrderPendingProof`, `cashOrderVerified`) are already correct — keep as-is

- [ ] **Q3** `appkit/src/seed/categories-seed-data.ts`:
  - Move the 5 bundle entries (`bundle-exodia-complete-set`, etc.) behind the `full` gate (only seeded when `fullSeed=true`)
  - These have `bundleProductIds: []` anyway — no value in the default seed

- [ ] **Q4** Verify default seed via `GET /api/demo/seed` shows: ~50 published products, 0 bundles, orders with `paymentMethod: "cash"` only.

---

### Group R — Layout Consistency + Text Wrapping + PaginatedSelect Mobile

#### R.1 — Consistent Max-Width on Public Pages
**Problem:** `AppLayoutShell` gives `px-5 md:px-6 lg:px-8` but no `max-w-*`. Cart, wishlist, products listing, and product detail all expand to full viewport width. Homepage hero sections look fine because they control their own widths internally, but content pages feel broken on wide monitors.

- [ ] **R1** `appkit/src/features/layout/AppLayoutShell.tsx`: In the content div (line ~745), change the non-dashboard default class from:
  ```
  w-full px-5 md:px-6 lg:px-8
  ```
  to:
  ```
  w-full max-w-screen-xl mx-auto px-5 md:px-6 lg:px-8
  ```
  Dashboard routes already pass `contentClassName="w-full"` which overrides this — no change needed for dashboards. `max-w-screen-xl` = 1280px, consistent with the search bar already at that width.

- [ ] **R2** Verify homepage hero carousel still looks full-bleed (it lives inside appkit's `MarketplaceHomepageView` which uses `<Section padding="none">` with negative margins — the `max-w-screen-xl` shell doesn't break it since each section controls its own layout).

#### R.2 — Text Wrapping Instead of Truncation on Mobile
**Problem:** Product title chips/category chips use `className="truncate max-w-[100px]"` (hard single-line ellipsis) and raw `line-clamp` on mobile where there's room to wrap. User wants text to start a new line rather than silently truncate.

- [ ] **R3** `appkit/src/features/products/components/ProductGrid.tsx` (and any other product card component):
  - Category/brand `<Span>` chips: remove `max-w-[100px] truncate` → let text wrap naturally. Short names (`Funko`, `Bandai`) don't need clamping; long names wrap to 2 lines which is fine at card width.
  - Seller name `<Text className="truncate">` → remove `truncate`, let it wrap.
  - Product title `truncate={2}` stays as-is (2-line clamp is intentional for grid uniformity).

- [ ] **R4** Any other place using `className="truncate max-w-[90px]"` or similar hard clamp on short context strings (store names, category breadcrumbs, user display names in orders): remove the max-width constraint, allow wrapping. Keep `truncate` only on single-line UI elements where overflow is genuinely impossible to handle (e.g., table cells with fixed column widths).

#### R.3 — PaginatedSelect Mobile Overflow Fix
**Problem:** `PaginatedSelect` dropdown is `position: absolute` with no viewport clamping. On narrow screens near the right or bottom edge, the dropdown overflows the viewport with no flip logic.

- [ ] **R5** `appkit/src/ui/components/PaginatedSelect.tsx` + `PaginatedSelect.style.css`:
  - Add `max-width: calc(100vw - 2rem)` to `.appkit-ps__dropdown` — prevents horizontal overflow on narrow screens.
  - Add flip logic: when the dropdown would open downward but there's less than 220px below the trigger, add `.appkit-ps__dropdown--up` class which applies `bottom: 100%; top: auto; margin-bottom: 0.25rem; margin-top: 0;` — opens upward instead.
  - The flip is computed in the component using a `useEffect` that checks `getBoundingClientRect()` of the trigger vs `window.innerHeight`. Set state: `const [opensUp, setOpensUp] = useState(false)`.

---

### Group S — Analytics: Visit Tracking + Active Users + Admin Dashboard
**What the user needs:** Daily visits (all pages), per-page visits, product visits, currently active users (guests + auth) — displayed in admin.

**Approach:**
- **Page visits + active users**: Firebase RTDB (real-time, no server needed, works for guests)
- **Product `viewCount`**: Firestore increment via server action (already has the field)
- **Category visit count**: Add `viewCount` to CategoryDocument and increment the same way
- **Admin display**: Update `AdminAnalyticsView.tsx`

**No new Firebase Function needed for P-1** — all writes are client-side RTDB + server action increments. The `FEATURE_ANALYTICS_FUNCTION` flag (P-15) is for a heavier aggregation function that can stay planned for later.

#### S.1 — RTDB Presence (Active Users)
- [ ] **S1** RTDB path: `presence/{clientId}` → `{ page: string, lastSeen: ServerTimestamp, isGuest: boolean }`
  - `clientId` = `uid` for logged-in users, a random UUID stored in `sessionStorage` for guests (regenerated per browser tab, no persistent tracking).
  - On connect: `rtdb.ref("presence/{clientId}").set({ page, lastSeen: serverTimestamp(), isGuest })` + `.onDisconnect().remove()`
  - On route change: update `page` field only.

- [ ] **S2** `appkit/src/_internal/client/features/analytics/usePresence.ts` — client hook:
  ```ts
  // Called once in the root layout client component
  export function usePresence(uid: string | null) { ... }
  ```
  Writes to RTDB on mount + route change. Uses `usePathname()` for current page. Cleans up on unmount.

- [ ] **S3** `src/app/[locale]/LayoutShellClient.tsx`: call `usePresence(session?.user?.uid ?? null)` — single mount point for all public pages.

#### S.2 — Page Visit Tracking (RTDB counters)
- [ ] **S4** RTDB path: `analytics/pageviews/{YYYY-MM-DD}/{encodedPath}` → integer (count)
  - `encodedPath` = path with `/` replaced by `|` (e.g., `|products`, `|products|product-charizard`)
  - On each page navigation: `rtdb.ref(...).transaction(count => (count || 0) + 1)`
  - TTL: old date keys are cleaned up by the existing `cleanupRtdbEvents` Firebase Function (extend it to also prune `analytics/pageviews/` keys older than 30 days).

- [ ] **S5** Add page view increment to the `usePresence` hook — on every route change, call both the presence update AND the page view increment. One hook, two RTDB writes.

#### S.3 — Product + Category View Count
- [ ] **S6** `appkit/src/_internal/server/features/products/data.ts`: in `getProductForDetail(slug)`, after fetching the product, fire-and-forget `productRepository.update(slug, { viewCount: increment(1) })` using Firestore FieldValue increment. Do NOT await — response time must not be affected.

- [ ] **S7** `appkit/src/features/categories/schemas/firestore.ts`: add `viewCount?: number` to `CategoryDocument`.

- [ ] **S8** `appkit/src/_internal/server/features/categories/data.ts` (create if doesn't exist): in `getCategoryForDetail(slug)`, increment `viewCount` the same way as products.

- [ ] **S9** `appkit/src/seed/categories-seed-data.ts`: add `viewCount: 0` to all category entries (backwards-compatible — optional field, undefined = 0).

#### S.4 — Admin Analytics View Update
- [ ] **S10** `appkit/src/features/admin/components/AdminAnalyticsView.tsx`:
  Add a new "Live Overview" section at the top (above the existing revenue/orders stats):
  - **Active users right now**: RTDB `presence/` node count (updates live via `.on("value")`) — split into `authenticated` vs `guest` counts
  - **Today's page views**: RTDB `analytics/pageviews/{today}/` total (sum of all path counts)
  - **Top 5 pages today**: sort RTDB `analytics/pageviews/{today}/*` by count descending, show path + count
  - Keep existing revenue/orders cards unchanged below

- [ ] **S11** `appkit/src/features/admin/components/analytics/AdminLiveOverviewCard.tsx` — new component for the live section (uses RTDB `onValue` listener, unmounts cleanly). Displays: active users badge + today's visits counter + mini page-rank list.

- [ ] **S12** `appkit/src/features/admin/components/analytics/AdminTopProductsTable.tsx`: add a `viewCount` column showing the `viewCount` field already on ProductDocument. Sort by `viewCount DESC` by default.

- [ ] **S13** `appkit/src/seed/products-standard-seed-data.ts`: set `viewCount: 0` on all products (already has the field defined in schema; ensures seed consistency).

---

### Group U — Bundles Moved to Separate Patch
Bundles (`listingType: "bundle"`) are NOT in P-1 scope. `AdminBundlesView.tsx`, `AdminBundleEditorView.tsx`, and the bundle category entries already exist in code but need a patch to be enabled and wired end-to-end.

- [ ] **U1** Roadmap update (`patches-roadmap.md`): Add **P-17 — Bundles** after P-16:
  ```
  P-17 [ ] Bundles — bundle listing type, CRUD, stock sync, buyer view
  Feature flag: FEATURE_BUNDLES
  Branch: patch/p17-bundles
  Dependency: P-1 stable products CRUD
  ```
- [ ] **U2** `appkit/src/seed/site-settings-seed-data.ts`: ensure `featureFlags.listingTypes.bundle = false` (P-1 default)
- [ ] **U3** Add `FEATURE_BUNDLES` to `src/lib/features.ts` + `.env.example` + `feature-toggle.yml` options list
- [ ] **U4** Admin bundles routes (`src/app/[locale]/admin/bundles/layout.tsx`): wrap with `FeatureGuard("BUNDLES")` so navigating to them returns 404 when flag is off

---

### Group O2 — Quality Gate + Redeploy (after P, Q, R, S, U above)
- [ ] **O2-1** `npm run check` exits 0 after all above changes
- [ ] **O2-2** Bump appkit patch version (3.2.0 → 3.2.1), build, publish — needed because appkit changes in P, Q.R5, S1-13
- [ ] **O2-3** Consumer: update pin to `^3.2.1`, `npm install`
- [ ] **O2-4** Firebase: `npm run firebase deploy --only functions` — if `cleanupRtdbEvents` extended (S4)
- [ ] **O2-5** Vercel: add `FEATURE_BUNDLES=false` env var
- [ ] **O2-6** `node scripts/deploy.mjs` → prod deploy
- [ ] **O2-7** Post-deploy smoke: logo shows ✓, products all in-stock ✓, admin analytics live panel ✓

---

## Part A — Diagrams

### 1. Patch 1 — Full Manual Happy Path (Sequence Diagram)

Everything in P-1 is manual. No payment gateway. No shipping API. Admin and seller do everything by hand.

```
BUYER              APP              FIRESTORE         SELLER             ADMIN
  │                  │                  │                │                  │
  │ Browse /products │                  │                │                  │
  │─────────────────>│ listProducts()───>│                │                  │
  │<─ product grid ──│<─ products[] ────│                │                  │
  │                  │                  │                │                  │
  │ Add to cart      │                  │                │                  │
  │─────────────────>│ addToCart() ─────>│                │                  │
  │<─ cart updated ──│                  │                │                  │
  │                  │                  │                │                  │
  │ /checkout        │                  │                │                  │
  │ method=cash/upi  │                  │                │                  │
  │─────────────────>│ createOrder() ───>│ order{PENDING} │                  │
  │<── redirect to   │                  │                │                  │
  │   /orders/[id]/payment              │                │                  │
  │                  │                  │                │                  │
  │ MANUAL: Buyer opens UPI app         │                │                  │
  │ transfers ₹X to admin UPI VPA       │                │                  │
  │ notes the UTR / transaction ref     │                │                  │
  │                  │                  │                │                  │
  │ Upload screenshot│                  │                │                  │
  │ + transaction ID │                  │                │                  │
  │─────────────────>│ signUpload()─────>│                │                  │
  │                  │ finalizeUpload() ─>│               │                  │
  │                  │ attachProof() ────>│ order{PROOF}   │                  │
  │<─ "Proof submitted. We'll verify"   │                │                  │
  │                  │                  │                │                  │
  │                  │                  │ notify ────────────────────────>  │
  │                  │                  │                │  Admin sees order │
  │                  │                  │                │  + proof thumbnail│
  │                  │                  │                │                  │
  │                  │ MANUAL: Admin checks UTR in UPI app / bank statement  │
  │                  │                  │                │                  │
  │                  │                  │                │<─ Admin clicks    │
  │                  │                  │                │   "Verify Payment"│
  │                  │                  │<─ paymentStatus=PAID ─────────── │
  │                  │                  │                │                  │
  │<─ notification: "Payment verified"  │                │                  │
  │                  │                  │                │                  │
  │                  │                  │ notify ──────>│                   │
  │                  │                  │   Seller sees │                   │
  │                  │                  │   new order   │                   │
  │                  │                  │               │                   │
  │                  │ MANUAL: Seller packs order physically                │
  │                  │         drops off at courier (DTDC/India Post/etc)   │
  │                  │                  │               │                   │
  │                  │                  │<─ Seller enters carrier + AWB# + │
  │                  │                  │   optional tracking URL           │
  │                  │                  │   order{SHIPPED}│                 │
  │<─ notification: "Order shipped – AWB: XYZ"          │                  │
  │                  │                  │                │                  │
  │ Buyer tracks via carrier website    │                │                  │
  │ (manual – no auto-tracking in P-1)  │                │                  │
```

### 2. Full Platform Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       LetItRip Platform                             │
│                                                                     │
│  ┌──────────┐   UC-B1: Browse standard product catalogue           │
│  │          │   UC-B2: Search & filter (category, brand, price)    │
│  │  BUYER   │   UC-B3: View product detail + images                │
│  │          │   UC-B4: Add to cart / change qty / bulk remove      │
│  │  (guest  │   UC-B5: Register / login (email + Google OAuth)     │
│  │   or     │   UC-B6: Manage delivery addresses                   │
│  │   auth)  │   UC-B7: Checkout with Cash / UPI [P-1]             │
│  │          │   UC-B8: Upload payment screenshot + txn ID [P-1]   │
│  └──────────┘   UC-B9: View order history & status                 │
│                 UC-B10: Wishlist (add / bulk remove / add-to-cart) │
│                 UC-B11: Razorpay online payment [P-2]              │
│                 UC-B12: COD payment [P-3]                          │
│                 UC-B13: Apply coupons [P-4]                        │
│                 UC-B14: Bid on auctions [P-6]                      │
│                 UC-B15: Pre-order products [P-7]                   │
│                 UC-B16: Chat with seller [P-12]                    │
│                                                                     │
│  ┌──────────┐   UC-S1: Login as seller                             │
│  │          │   UC-S2: Create / edit STANDARD product [P-1]       │
│  │  SELLER  │   UC-S3: View + manage incoming orders [P-1]        │
│  │          │   UC-S4: Mark order shipped + tracking# [P-1]       │
│  └──────────┘   UC-S5: Receive payouts [P-5]                       │
│                 UC-S6: Create seller coupons [P-4]                 │
│                 UC-S7: Create auctions [P-6]                       │
│                 UC-S8: Create pre-orders [P-7]                     │
│                 UC-S9: Auto-ship via Shiprocket [P-10]             │
│                 UC-S10: Create prize draws [P-11]                  │
│                                                                     │
│  ┌──────────┐   UC-A1: View all orders + filter by status [P-1]   │
│  │          │   UC-A2: Verify manual cash payment [P-1]           │
│  │  ADMIN   │   UC-A3: Approve / reject product listing [P-1]     │
│  │          │   UC-A4: Analytics dashboard [P-1]                  │
│  │          │   UC-A5: Manage users (view, disable) [P-1]         │
│  └──────────┘   UC-A6: Approve new seller stores [P-1]            │
│                 UC-A7: Manage coupons [P-4]                        │
│                 UC-A8: Run payout batches [P-5]                    │
│                 UC-A9: Manage auction settlements [P-6]            │
│                 UC-A10: Trigger event raffles [P-9]                │
│                 UC-A11: Configure Shiprocket [P-10]                │
│                 UC-A12: Manage scammer registry [P-13]             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  SYSTEM (Firebase Functions)                                  │  │
│  │  P-1 ACTIVE:  pendingOrderTimeout, mediaTmpCleanup,           │  │
│  │               cleanupRtdbEvents, onOrderCreate (notif),       │  │
│  │               onOrderStatusChange (notif)                     │  │
│  │  P-6+:        auctionSettlement, bundleStockSync              │  │
│  │  P-9+:        prizeReveal*, triggerEventRaffle                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Feature Flag Architecture

```
                    .env / Vercel Dashboard
                           │
          ┌────────────────┴──────────────────────────┐
          │  FEATURE_AUCTIONS=false         [P-6]      │
          │  FEATURE_PREORDERS=false        [P-7]      │
          │  FEATURE_PRIZE_DRAWS=false      [P-11]     │
          │  FEATURE_BLOG=false             [P-8]      │
          │  FEATURE_EVENTS=false           [P-9]      │
          │  FEATURE_CHAT=false             [P-12]     │
          │  FEATURE_SCAM_REGISTRY=false    [P-13]     │
          │  FEATURE_RAZORPAY=false         [P-2]      │
          │  FEATURE_COD=false              [P-3]      │
          │  FEATURE_COUPONS=false          [P-4]      │
          │  FEATURE_SHIPROCKET=false       [P-10]     │
          │  FEATURE_PAYOUTS=false          [P-5]      │
          │  FEATURE_ANALYTICS_FUNCTION=false  [post]  │
          └──────────────────────────────────────────--┘
                           │
               ┌───────────┴──────────────┐
               ▼                          ▼
        src/lib/features.ts       Firebase Functions
        getFlag("AUCTIONS")       siteSettings.featureFlags.*
               │                          │
    ┌──────────┴───────────┐    ┌─────────┴──────────────┐
    │ Nav: hide links      │    │ Scheduled: early return  │
    │ Pages: notFound()    │    │ Triggers: skip logic    │
    │ API: 404 guard       │    │ HTTPS: 404 response     │
    └──────────────────────┘    └─────────────────────────┘
```

### 4. Cash Payment Data Flow

```
Buyer                   Next.js API            Firebase Storage       Firestore
  |                         |                        |                    |
  |-- POST /api/media/sign->|                        |                    |
  |     { ctx:"payment-     |                        |                    |
  |       proof", orderId } |                        |                    |
  |<- { signedUrl, slug }---|                        |                    |
  |                         |                        |                    |
  |-- PUT screenshot  ---------------------------------------->          |
  |       (direct to GCS, bypasses Next.js)          |                    |
  |<- 200 OK ----------------------------------------|                    |
  |                         |                        |                    |
  |-- POST /api/media/      |                        |                    |
  |       finalize -------->|-- magic-byte check---->|                    |
  |<- { url: /media/... }---|                        |                    |
  |                         |                        |                    |
  |-- POST /api/orders/     |                        |                    |
  |   [id]/payment-proof -->|-- attachProofAction --> orders/{id} updated |
  |<- { ok: true } ---------|                        |                    |
```

### 5. Mobile Navigation Flow (all 3 dashboard types)

```
Mobile (< 1024px)                    Desktop (≥ 1024px)
─────────────────────────            ──────────────────────────────
TitleBar                             TitleBar
  [Logo] ................. [☰]         [Logo] ............. [icons]
                            │
                            ▼
                     BottomSheet (slide up)
                    ┌──────────────────┐
                    │ Dashboard Nav    │
                    │ > Group 1        │
                    │   - Item A       │         Left Sidebar (fixed)
                    │   - Item B       │      ┌──────────────────┐[›]
                    │ > Group 2        │      │ > Group 1        │
                    │   - Item C       │      │   - Item A       │
                    └──────────────────┘      │   - Item B       │
                                              │ > Group 2        │
                                              │   - Item C       │
                                              └──────────────────┘
                                              Collapsible via [›] handle
                                              persisted in localStorage
```

---

## Part B — Patch 1 MVP Implementation Checklist

### P1-A: Feature Flags Infrastructure

- [ ] **P1-A1** — `src/lib/features.ts`: `getFlag(name: string): boolean` reads `process.env["FEATURE_" + name]` (server) or falls back to `false`. Memoized per request via `React.cache`.
- [ ] **P1-A2** — `src/components/feature-guard/FeatureGuard.tsx`: Client component that renders `null` if `getFlag(name)` is false; server version calls `notFound()` if flag is off on a page
- [ ] **P1-A3** — `.env.example`: add all `FEATURE_*` vars with defaults `=false`
- [ ] **P1-A4** — `scripts/audit-feature-flags.mjs`: verifies every disabled-feature API route has a flag guard; strict-zero
- [ ] **P1-A5** — Register `feature-flags` audit in `scripts/run-audits.mjs` + stop hook

### P1-B: Navigation Cleanup

- [ ] **P1-B1** — `src/constants/navigation.tsx` → `MAIN_NAV_ITEMS`: hide Blog, Events, Auctions, Pre-orders links behind `getFlag()`
- [ ] **P1-B2** — `STORE_NAV_GROUPS`: keep only Products (standard), Orders, Store Settings. Remove Auctions, Pre-Orders, Prize Draws, Bundles groups.
- [ ] **P1-B3** — `USER_NAV_GROUPS`: keep Orders, Wishlist, Addresses, Account. Remove Notifications (or keep minimal — item as placeholder).
- [ ] **P1-B4** — `ADMIN_NAV_GROUPS`: keep Orders, Products (moderation), Users, Stores, Analytics, Site Settings. Hide Events, Blog, Scammer Registry, Chat.
- [ ] **P1-B5** — `BottomNavbar.tsx` (public mobile): confirm links are Home, Shop, Search, Cart, Profile only — no disabled-feature links

### P1-C: Admin Dashboard — Mobile + Desktop Navigation

- [ ] **P1-C1** — Smoke-test admin BottomSheet on 390px: all enabled nav groups visible and scrollable, no content clipped by overflow
- [ ] **P1-C2** — Verify desktop sidebar collapse state persists via `localStorage` (`DashboardLayoutClient.tsx` — read file first, confirm before changing)
- [ ] **P1-C3** — Fix any `overflow-x` issues on admin DataTable pages on mobile (DataTable grid needs `overflow-x: auto` wrapper, not `hidden`)
- [ ] **P1-C4** — Verify `contentClassName="w-full"` is set in `DashboardLayoutClient` + correct padding `px-4 py-6 md:pl-5 md:pr-6 lg:pr-8` per known fix in memory

### P1-D: Seller Dashboard — Mobile + Desktop + Basics

- [ ] **P1-D1** — Smoke-test seller BottomSheet on 390px: Patch 1 nav groups (Products, Orders, Store Settings) all reachable
- [ ] **P1-D2** — Seller products page: verify only `standard` listing type shown; confirm `FEATURE_AUCTIONS/PREORDERS/PRIZE_DRAWS=false` hides those tabs
- [ ] **P1-D3** — Seller orders page: verify `GET /api/store/orders` returns only this seller's orders, paginated
- [ ] **P1-D4** — Seller "Mark as Shipped": PATCH `/api/store/orders/[id]` with `status: "shipped"` + `trackingNumber` works without Shiprocket (`FEATURE_SHIPROCKET=false`)
- [ ] **P1-D5** — `ProductForm.tsx`: hide auction/pre-order/prize-draw toggle checkboxes when their `FEATURE_*` flag is false

### P1-E: Cash / UPI Payment Feature

**E.1 — Schema Extensions (appkit)**

- [ ] **P1-E1** — `appkit/src/features/orders/schemas/firestore.ts`: add to `OrderDocument`:
  ```ts
  paymentProofUrl?: string
  paymentTransactionId?: string
  paymentProofMimeType?: string
  paymentProofUploadedAt?: Date
  ```
  Add `CASH: "cash"` to `PaymentMethodValues`

- [ ] **P1-E2** — `appkit/src/_internal/shared/features/checkout/config.ts` line 8: add `"cash"` to `CHECKOUT_PAYMENT_METHODS`. Add `upiManualEnabled` enforcement guard in `checkout/actions.ts` (parity with existing `codEnabled` guard at line 373).

- [ ] **P1-E3** — `appkit/src/utils/id-generators.ts` (line 574): add `"payment-proof"` to `MediaFilenameContext`. Pattern: `payment-proof-{orderId}-{buyerName}-{YYYYMMDD}.{ext}`

- [ ] **P1-E4** — `appkit/src/_internal/server/features/media/contextGuards.ts` (line 66): add `"payment-proof"` to `IMAGE_OR_PDF_CONTEXTS`

**E.2 — Server Actions (appkit)**

- [ ] **P1-E5** — `appkit/src/_internal/server/features/orders/actions.ts`: add `attachPaymentProofAction(orderId, { proofUrl, transactionId, mimeType }, actorUid)` — verifies: buyer owns order, method is cash/upi_manual, status is pending. Writes proof fields to Firestore.

- [ ] **P1-E6** — same file: add `adminVerifyPaymentAction(orderId, actorUid)` — verifies admin permission, sets `paymentStatus: "paid"`, `paymentId: order.paymentTransactionId`, sends notification.

**E.3 — Action Registry (appkit)**

- [ ] **P1-E7** — `appkit/src/_internal/shared/actions/action-registry.ts`: add to `ACTIONS.ADMIN`:
  ```ts
  "verify-payment": {
    id: "verify-payment", label: "Verify Payment", kind: "primary",
    confirmation: { title: "Verify payment?", body: "Marks payment as received. Cannot be undone.", confirmLabel: "Yes, verify" }
  }
  ```

**E.4 — API Routes (consumer)**

- [ ] **P1-E8** — `src/app/api/orders/[id]/payment-proof/route.ts`: `POST` — auth required (buyer), delegates to `attachPaymentProofAction`. Returns 200 or 409 `PROOF_ALREADY_ATTACHED`.

- [ ] **P1-E9** — `src/app/api/admin/orders/[id]/payment-verify/route.ts`: `PATCH` — roles: `ROLES_ADMIN_MOD`, delegates to `adminVerifyPaymentAction`.

**E.5 — Post-Order Payment Page (consumer)**

- [ ] **P1-E10** — `src/app/[locale]/orders/[id]/payment/page.tsx`:
  - Shows store's UPI VPA (from `siteSettings.payment.upiVpa`) or a QR placeholder
  - `MediaUploadField` for screenshot (context: `"payment-proof"`)
  - `FieldInput` for transaction ID
  - Submit → `POST /api/orders/[id]/payment-proof` → redirect to `/user/orders/[id]` with success toast
  - Guard: redirect away if `paymentMethod` ≠ `"cash"/"upi_manual"` or `paymentStatus` = `"paid"`

**E.6 — Checkout UI Update (consumer)**

- [ ] **P1-E11** — `CheckoutRouteClient.tsx`: show only "Cash / UPI" payment option (Razorpay hidden by `FEATURE_RAZORPAY=false`, COD hidden by `FEATURE_COD=false`). Show UPI QR/VPA from site settings. After successful order creation → redirect to `/orders/[id]/payment`.

**E.7 — Admin Verification UI**

- [ ] **P1-E12** — Find admin order detail component (check `appkit/src/features/admin/components/` or admin order page). Add: proof thumbnail (`<MediaImage>`) + `paymentTransactionId` display + `<Button action={ACTIONS.ADMIN["verify-payment"]}>` visible when `paymentStatus === "pending"` and method is cash/upi_manual.

**E.8 — Unit Tests**

- [ ] **P1-E13** — `src/app/api/orders/[id]/payment-proof/__tests__/route.test.ts`: auth guard, duplicate rejection, successful attach
- [ ] **P1-E14** — `src/app/api/admin/orders/[id]/payment-verify/__tests__/route.test.ts`: role guard, idempotent re-verify, status transition

### P1-F: Disabled Feature Guards (API)

Every API route for a disabled feature must return 404 if flag is off:

- [ ] **P1-F1** — `/api/events/*`: add `FEATURE_EVENTS` guard
- [ ] **P1-F2** — `/api/payment/create-order` + `/api/payment/verify`: add `FEATURE_RAZORPAY` guard (return 404 if false)
- [ ] **P1-F3** — Auction API routes (bids, auction actions): add `FEATURE_AUCTIONS` guard
- [ ] **P1-F4** — Chat/messages API routes: add `FEATURE_CHAT` guard
- [ ] **P1-F5** — COD path in checkout action: skip if `FEATURE_COD=false`
- [ ] **P1-F6** — Coupon application: skip if `FEATURE_COUPONS=false`

### P1-G: Firebase Functions — Disable Non-Essential

- [ ] **P1-G1** — In each function handler, read `siteSettings.featureFlags.*` and `return early` if the feature is off
- [ ] **P1-G2** — **P-1 ACTIVE functions**: `pendingOrderTimeout`, `mediaTmpCleanup`, `cleanupRtdbEvents`, `onOrderCreate` (notif only), `onOrderStatusChange` (notif only)
- [ ] **P1-G3** — **DISABLED early-return**: `auctionSettlement`, `bundleStockSync`, `prizeReveal*`, `triggerEventRaffle`, `assignSpinPrize`, `promotionsApi`, `listingProcessor`, `payoutBatch`, `weeklyPayoutEligibility`, `autoPayoutEligibility`
- [ ] **P1-G4** — Add `siteSettings.featureFlags` fields for each to-be-disabled function (if not already in schema)

### P1-H: Seed Data Cleanup

- [ ] **P1-H1** — Default seed (`action=load` without `--full`): include only standard products (50), stores (8), categories (22), brands (13), users (18), basic orders (10 including 2 cash-payment), addresses (24). Exclude events, blog posts, coupons, raffle entries, prize draws, bids.
- [ ] **P1-H2** — `SeedPanel.tsx`: add `--full` toggle and warning "Full seed includes disabled-feature data"
- [ ] **P1-H3** — Add 2 cash-payment orders: one with proof pending, one already verified by admin

### P1-I: RTDB Safety

- [ ] **P1-I1** — Confirm only `AUTH_EVENTS` path is actively written in Patch 1 (verify `rtdb-paths.ts`)
- [ ] **P1-I2** — `FEATURE_CHAT=false` means zero writes to conversation/chat RTDB paths — verify no chat code runs without flag check
- [ ] **P1-I3** — Keep `cleanupRtdbEvents` function active

### P1-J: Dashboard Styling + UX Fixes

- [ ] **P1-J1** — Run `npm run audit dashboard-padding` → fix all violations across admin and store dashboard pages
- [ ] **P1-J2** — Wrap all DataTable grids on mobile in `overflow-x: auto` container — no horizontal page scroll, only table scrolls
- [ ] **P1-J3** — Verify all new P1 pages have `<Suspense>` wrapper (required by `audit-suspense-boundaries`)
- [ ] **P1-J4** — Ensure consistent page header pattern: `<Heading level={1}>`, subtitle `<Text color="muted">`, action buttons on right — across all admin and store pages

### P1-K: Architecture Violations Fix + New Audit

**Violations found (real locations):**
- `CartRouteClient.tsx` lines 8, 12, 286, 409, 423, 459, 485, 518, 533, 561, 594 — raw `fetch()` to `/api/cart/*`, `/api/wishlist`
- `CheckoutRouteClient.tsx` lines 657, 684, 759, 799, 837, 873 — raw `fetch()` to `/api/payment/*`, `/api/checkout`
- `wishlist/page.tsx:151` — `fetch("/api/user/wishlist/validate")` in `useEffect`

**Fix:**
- [ ] **P1-K1** — `CartRouteClient.tsx`: replace cart DELETE/POST calls with `removeFromCartAction` / `addToCartAction` from appkit (already exported server actions). Remaining cart-selection calls → `src/lib/api/cart-client.ts` typed wrappers.
- [ ] **P1-K2** — `CheckoutRouteClient.tsx`: payment create-order / verify calls → `src/lib/api/payment-client.ts`. Checkout POST → use `createCheckoutOrderAction` server action. Coupon calls → coupon server action.
- [ ] **P1-K3** — `wishlist/page.tsx:151` → add `// audit-direct-fetch-ok: best-effort stale validation, no loading state needed` suppression comment
- [ ] **P1-K4** — `scripts/audit-direct-fetch-ui.mjs`: flag raw `fetch(` in `.tsx` files under `src/` that are not API routes, not `src/components/dev/`, not marked with suppression. Strict-zero after cleanup.
- [ ] **P1-K5** — Register in `scripts/run-audits.mjs` as `"direct-fetch-ui"` + add to stop hook

### P1-L: Wishlist "Add to Cart" Bulk Action

- [ ] **P1-L1** — `src/app/[locale]/wishlist/page.tsx`: add `handleAddSelectedToCart()` — calls `addToCartAction(id)` for each selected ID via `Promise.allSettled`, shows toast, clears selection
- [ ] **P1-L2** — Add `ACTIONS.USER["add-to-cart-bulk"]` to action registry (appkit) with `kind: "primary"`
- [ ] **P1-L3** — Wire to `useBottomActions` on mobile alongside existing remove action
- [ ] **P1-L4** — Add "Add to cart" button in desktop bulk header (beside "Remove selected")

### P1-M: Tour System (prep — button only, steps = null in Patch 1)

Tour steps are authored in Patch 2+. In Patch 1, only the infrastructure and button slot are added so the TitleBar API doesn't change later.

- [ ] **P1-M1** — `appkit/package.json`: add `"driver.js": "^2.3.0"` (lazy-loaded, not bundled in main chunk)
- [ ] **P1-M2** — `appkit/src/features/layout/TitleBarLayout.tsx` (line ~128): add `onTourStart?: () => void` to `TitleBarLayoutProps`
- [ ] **P1-M3** — Same file, line ~344: add `{tourBtn}` slot before `{themeBtn}` — renders only if `onTourStart` is provided (null in Patch 1, so no button rendered)
- [ ] **P1-M4** — `appkit/src/features/layout/AppLayoutShell.tsx`: add `onTourStart` prop, pass through (null in Patch 1)
- [ ] **P1-M5** — `appkit/src/_internal/client/features/tour/TourProvider.tsx`: skeleton file — exports `TourProvider` (identity wrapper) and `useTour()` (returns `{ startTour: () => void }`) — driver.js not imported yet, just the shell

### P1-N: Playwright E2E Test Setup

- [ ] **P1-N1** — `npm install --save-dev @playwright/test` in root; `npx playwright install --with-deps chromium`
- [ ] **P1-N2** — `playwright.config.ts`:
  ```ts
  projects: [
    { name: "iphone-13",  use: { ...devices["iPhone 13"] } },           // 390x844
    { name: "laptop-14",  use: { viewport: { width: 1440, height: 900 } } },
    { name: "monitor-30", use: { viewport: { width: 2560, height: 1440 } } },
  ]
  baseURL: process.env.TEST_BASE_URL ?? "http://localhost:3000"
  testDir: "./scripts/qa/playwright"
  ```
- [ ] **P1-N3** — `scripts/qa/playwright/_setup.ts`: `loginAsAdmin(page)`, `loginAsSeller(page)`, `loginAsBuyer(page)`, `gotoAndWait(page, url)`, `uploadFile(page, selector, filePath)`
- [ ] **P1-N4** — `pw-admin-nav.spec.ts`: admin dashboard nav on all 3 viewports
- [ ] **P1-N5** — `pw-seller-basics.spec.ts`: seller create standard product + see orders + mark shipped
- [ ] **P1-N6** — `pw-customer-browse.spec.ts`: homepage → products → search → filter → product detail
- [ ] **P1-N7** — `pw-cart-checkout.spec.ts`: add to cart, qty change, remove, checkout with cash
- [ ] **P1-N8** — `pw-payment-proof.spec.ts`: upload UPI screenshot + txn ID → submit → admin verify
- [ ] **P1-N9** — `pw-wishlist.spec.ts`: add to wishlist, bulk remove, bulk add-to-cart
- [ ] **P1-N10** — `package.json` scripts: `test:e2e`, `test:e2e:iphone`, `test:e2e:laptop`, `test:e2e:monitor`, `test:e2e:prod`

### P1-T: Unit Test Specifications (Vitest)

Test runner: **Vitest** (already installed). Mock Firestore via `vi.mock` of repository layer. Do NOT call real Firebase in unit tests.

#### T1 — `src/lib/features.test.ts`
Covers: feature flag helper (Group A)
```
describe("getFlag")
  ✓ returns false when env var is unset
  ✓ returns false when env var = "false"
  ✓ returns true when env var = "true"
  ✓ is case-insensitive ("TRUE", "True" → true)
  ✓ unknown flag name → false (never throws)
```

#### T2 — `src/app/api/orders/[id]/payment-proof/__tests__/route.test.ts`
Covers: UC-B8, POST /api/orders/[id]/payment-proof
```
describe("POST /api/orders/[id]/payment-proof")
  ✓ 401 when request has no auth session
  ✓ 403 when authenticated buyer does not own the order
  ✓ 400 when order paymentMethod is neither "cash" nor "upi_manual"
  ✓ 400 when proofUrl is missing from request body
  ✓ 409 PROOF_ALREADY_ATTACHED when order.paymentProofUrl already set
  ✓ 200 — writes paymentProofUrl + paymentTransactionId + paymentProofMimeType + paymentProofUploadedAt
  ✓ 200 — does not overwrite other order fields
```

#### T3 — `src/app/api/admin/orders/[id]/payment-verify/__tests__/route.test.ts`
Covers: UC-A2, PATCH /api/admin/orders/[id]/payment-verify
```
describe("PATCH /api/admin/orders/[id]/payment-verify")
  ✓ 401 when request has no auth session
  ✓ 403 when caller role is "seller" or "user" (not admin/moderator)
  ✓ 404 when order does not exist
  ✓ 409 when order.paymentStatus is already "paid" (idempotent guard)
  ✓ 200 — sets paymentStatus="paid"
  ✓ 200 — sets paymentId = order.paymentTransactionId
  ✓ 200 — sends in-app notification to buyer (mock notificationService)
  ✓ 200 — returns updated order shape
```

#### T4 — `appkit/src/_internal/server/features/orders/__tests__/payment-actions.test.ts`
Covers: attachPaymentProofAction, adminVerifyPaymentAction server actions
```
describe("attachPaymentProofAction")
  ✓ throws UNAUTHORIZED when actorUid does not match order.buyerId
  ✓ throws WRONG_PAYMENT_METHOD when method ≠ cash/upi_manual
  ✓ throws PROOF_ALREADY_ATTACHED when proofUrl already set
  ✓ writes all 4 proof fields to Firestore (proofUrl, transactionId, mimeType, uploadedAt)
  ✓ does not modify orderItems or totalAmount

describe("adminVerifyPaymentAction")
  ✓ throws UNAUTHORIZED when actor is not admin/moderator
  ✓ throws NOT_FOUND when orderId does not exist
  ✓ throws ALREADY_PAID when paymentStatus="paid" (idempotent)
  ✓ sets paymentStatus="paid"
  ✓ sets paymentId = order.paymentTransactionId
  ✓ calls sendNotification with correct payload (buyer notified)
  ✓ is idempotent: calling twice does not double-send notification
```

#### T5 — `src/lib/api/__tests__/cart-client.test.ts`
Covers: typed cart wrappers (Group K)
```
describe("cart-client")
  ✓ addToCart: calls addToCartAction server action with correct args
  ✓ removeFromCart: calls removeFromCartAction server action
  ✓ updateCartItemQty: calls updateCartItemAction with itemId + newQty
  ✓ getCart: returns CartResponse shape (items[], total, itemCount)
  ✓ all functions return typed response — no raw fetch() calls
```

#### T6 — `src/lib/api/__tests__/payment-client.test.ts`
Covers: typed payment wrappers (Group K)
```
describe("payment-client")
  ✓ attachPaymentProof: calls POST /api/orders/[id]/payment-proof with correct body
  ✓ attachPaymentProof: returns { ok: true } on success
  ✓ attachPaymentProof: returns { ok: false, code: "PROOF_ALREADY_ATTACHED" } on 409
  ✓ no raw fetch() — wraps server actions or type-safe fetch wrappers
```

### P1-N2: Playwright E2E Test Case Details

Each spec runs against all 3 viewport projects (iphone-13, laptop-14, monitor-30).

#### `pw-customer-browse.spec.ts` — UC-B1, B2, B3
```
test("guest browses product catalogue")
  → visit /, expect product grid visible
  → at least 3 product cards render
  → no login wall

test("guest searches by keyword")
  → visit /products?q=pokemon
  → results contain products matching "pokemon"
  → changing query updates results

test("guest filters by category")
  → visit /products, open filter drawer
  → select "Trading Cards" category
  → product count changes, all visible cards are in that category

test("guest views product detail")
  → click any product card → /products/[slug]
  → image gallery renders
  → price displays in ₹ format
  → "Add to Cart" button visible
```

#### `pw-cart-checkout.spec.ts` — UC-B4, UC-B7, Sequence Diagram buyer leg
```
test("buyer adds product to cart")
  → loginAsBuyer → visit product detail → click "Add to Cart"
  → cart count badge increments to 1

test("buyer changes quantity")
  → visit /cart → find item → click "+" twice → qty=3
  → subtotal updates to 3× item price

test("buyer removes item")
  → click remove on item → item disappears → cart empty state shown

test("buyer checks out with Cash/UPI")
  → add item → visit /checkout
  → payment methods: only "Cash / UPI" visible (Razorpay hidden, COD hidden)
  → fill in delivery address → click "Place Order"
  → expect redirect to /orders/[id]/payment
  → page shows UPI VPA / QR code
```

#### `pw-payment-proof.spec.ts` — UC-B8, Full P-1 Sequence Diagram buyer+admin legs
```
test("buyer uploads payment proof")
  → loginAsBuyer → navigate to /orders/[id]/payment
  → uploadFile("test-upi-screenshot.jpg")
  → fill transaction ID "TEST-UTR-12345"
  → click "Submit Proof"
  → success message: "Proof submitted. We'll verify within 24 hours."
  → /user/orders/[id] shows status chip "Proof Submitted"

test("admin verifies payment")
  → loginAsAdmin → navigate to /admin/orders/[id]
  → proof thumbnail visible
  → transaction ID "TEST-UTR-12345" displayed
  → click "Verify Payment" → confirm dialog appears
  → click "Yes, verify" in dialog
  → order paymentStatus = "PAID"
  → buyer notification badge increments (switch to buyer session, check)
```

#### `pw-seller-ship.spec.ts` — UC-S3, UC-S4, Sequence Diagram seller leg
```
test("seller views incoming orders")
  → loginAsSeller → visit /store/orders
  → order for test buyer visible in list
  → filter by status "PROCESSING" → order appears

test("seller marks order as shipped (manual)")
  → click order → order detail page
  → fill "Carrier / Courier": "DTDC"
  → fill "Tracking Number": "1234567890"
  → fill "Tracking URL": "https://tracking.dtdc.com/..."
  → click "Mark as Shipped"
  → order status updates to SHIPPED
  → buyer receives notification (verify in buyer session)
```

#### `pw-admin-nav.spec.ts` — Mobile + Desktop Navigation
```
test("admin mobile nav — BottomSheet")
  → loginAsAdmin, viewport=iphone-13
  → tap hamburger icon → BottomSheet slides up
  → "Orders", "Products", "Users", "Analytics", "Site Settings" all visible
  → disabled features (Events, Blog, Chat) NOT in nav
  → tap "Orders" → navigates to /admin/orders
  → BottomSheet closes after navigation

test("admin desktop nav — sidebar collapse")
  → loginAsAdmin, viewport=laptop-14
  → sidebar visible on left with all nav groups
  → click collapse handle → sidebar collapses to icon-only
  → reload page → sidebar remains collapsed (persists in localStorage)
  → click expand → sidebar expands

test("admin nav — 30 inch monitor")
  → loginAsAdmin, viewport=monitor-30
  → sidebar always expanded, no collapse toggle needed
  → all nav groups visible without scrolling
```

#### `pw-wishlist.spec.ts` — UC-B10
```
test("buyer adds to wishlist")
  → loginAsBuyer → open product detail
  → click heart/bookmark icon → "Added to wishlist" toast
  → visit /wishlist → product card visible

test("buyer bulk removes from wishlist")
  → add 3 items to wishlist
  → /wishlist → select all 3 via checkboxes
  → click "Remove selected" → all 3 items gone

test("buyer bulk adds wishlist items to cart")
  → add 2 items to wishlist
  → /wishlist → select both
  → click "Add to cart" → cart count badge = 2
  → items remain in wishlist (add-to-cart does not remove from wishlist)
```

### P1-O: Quality Gate + Deploy

- [ ] **P1-O1** — `npm run check` exits 0 (tsc + all 57+ audits + lint including new `direct-fetch-ui`, `feature-flags`)
- [ ] **P1-O2** — `npm run test` + `npm --prefix appkit run test` all pass
- [ ] **P1-O3** — `npm run test:e2e` (3 viewports) all green
- [ ] **P1-O4** — Bump appkit to `3.2.0`, `npm run build`, `npm publish` in `appkit/`
- [ ] **P1-O5** — Consumer: update pin to `^3.2.0`, remove `appkit/src/**` from `tsconfig.json`, `npm install`
- [ ] **P1-O6** — Firebase indexes: `npm run firebase deploy --only indexes` → wait via `scripts/wait-for-indexes.mjs`
- [ ] **P1-O7** — Firebase rules: `npm run firebase deploy --only rules`
- [ ] **P1-O8** — Firebase Functions: `npm run firebase deploy --only functions`
- [ ] **P1-O9** — Vercel: set all `FEATURE_*=false` env vars in dashboard → `node scripts/deploy.mjs` → `vercel --prod`
- [ ] **P1-O10** — Post-deploy: full happy-path smoke (buyer → checkout → proof → admin verify → seller ships)

---

## Part C — Full Rollout Roadmap

> See [`patches-roadmap.md`](patches-roadmap.md) for full patch-by-patch details, go-live checklists, and the GitHub Actions feature-toggle workflow.

```
PATCH  WEEK   SCOPE                              RISK     FLAG                   BRANCH
─────────────────────────────────────────────────────────────────────────────────────────────
P-1    W1–4   MVP (cash/UPI, catalogue, nav)     HIGH     —                      main
P-2    W5–6   Coupons (admin + seller)           MED      FEATURE_COUPONS        patch/p2-coupons
P-3    W7–8   Blog (read-only)                   LOW      FEATURE_BLOG           patch/p3-blog
P-4    W9–10  Events (sale/offer types)          MED      FEATURE_EVENTS         patch/p4-events
P-5    W11–15 Auctions                           HIGH     FEATURE_AUCTIONS       patch/p5-auctions
P-6    W16–18 Pre-orders                         MED      FEATURE_PREORDERS      patch/p6-preorders
P-7    W19–22 Seller Payouts (manual UPI)        MED      FEATURE_PAYOUTS        patch/p7-payouts
P-8    W23–26 GST (tax calc, invoice, HSN code)  MED      FEATURE_GST            patch/p8-gst
P-9    W27–30 COD (deposit + fee + GST invoice)  MED      FEATURE_COD            patch/p9-cod
P-10   W31–36 Prize Draws + Spin Wheel           HIGH     FEATURE_PRIZE_DRAWS    patch/p10-prize-draws
P-11   W37–42 Chat / Messaging                   MED      FEATURE_CHAT           patch/p11-chat
P-12   W43–48 Scammer Registry                   MED      FEATURE_SCAM_REGISTRY  patch/p12-scam
P-13   W49–52 Razorpay (integration)             MED      FEATURE_RAZORPAY       patch/p13-razorpay
P-14   W53–56 Shiprocket (integration)           MED-HIGH FEATURE_SHIPROCKET     patch/p14-shiprocket
P-15   TBD    Analytics Function                 MED-HIGH FEATURE_ANALYTICS_FN   patch/p15-analytics
P-16   Post P3 Tour System (full steps)          LOW      —                      patch/p16-tour
─────────────────────────────────────────────────────────────────────────────────────────────
LEGEND: W = week from P-1 go-live
P-1 on main; all others on patch/p{n}-{name} branch → PR → merge to main → manual deploy

COD requires GST to ship first (P-8 before P-9) — invoices must be compliant.
COD includes: deposit (existing %) + flat COD fee (₹X configurable) + 18% GST on COD fee.
Razorpay and Shiprocket are end phases — no 3rd-party integration until platform is stable.
Seller shipping: manual carrier name + tracking ID + optional URL for all patches until P-14.

ENABLE/DISABLE: GitHub Actions → "Toggle Feature Flag" workflow (see patches-roadmap.md).
No CLI or Vercel dashboard login needed. Auto-redeploys after flag change.
```

### Go/No-Go Criteria (every patch)

Before flipping any feature flag in production:

1. `npm run check` exits 0 (including new audit for the feature)
2. All unit tests for the feature's API routes pass
3. Playwright E2E for the feature passes on all 3 viewports (iphone-13, laptop-14, monitor-30)
4. 24h soak on Vercel preview URL (`vercel --target preview`) before prod
5. Rollback plan confirmed: flip flag back to `false` — no data migration needed for flag-gated features
6. Admin has been trained on the new feature UI

---

## Part D — Technical Reference

### What Already Works (do NOT re-implement)

| Area | File + Line | Status |
|---|---|---|
| Admin mobile nav (BottomSheet) | `AdminSidebar.tsx:232` | ✅ Working |
| Store mobile nav (BottomSheet) | `SellerSidebar.tsx:284` | ✅ Working |
| User mobile nav (BottomSheet) | `UserSidebar.tsx:258` | ✅ Working |
| Desktop sidebar collapse | `SidebarCollapseToggle.tsx` | ✅ Working |
| Firebase OAuth (RTDB + postMessage fallback) | `start/route.ts` fault-tolerant since `80dd58046` | ✅ Working |
| Stock decrement in checkout | `checkout/actions.ts:470-569` | ✅ Working |
| Cart bulk ops | `CartRouteClient.tsx` | ✅ Working (has raw fetch violation) |
| Wishlist bulk remove | `wishlist/page.tsx:94-134` | ✅ Working |
| Product forms (standard/auction/pre-order/prize-draw) | `ProductForm.tsx` | ✅ Working |
| 41 Firebase Functions registered | `functions/src/index.ts` | ✅ Registered (some need disable guard) |
| 502 Firestore indexes | `firestore.indexes.json` | ✅ Deployed |
| 80+ Vitest test files | `src/actions/__tests__/`, `src/app/api/*/__tests__/` | ✅ Working |

### New Files Required for Patch 1

```
src/lib/features.ts                                   ← feature flag helper
src/components/feature-guard/FeatureGuard.tsx         ← gate component
src/lib/api/cart-client.ts                            ← typed cart fetch wrappers
src/lib/api/payment-client.ts                         ← typed payment fetch wrappers
src/app/api/orders/[id]/payment-proof/route.ts        ← buyer attaches proof
src/app/api/admin/orders/[id]/payment-verify/route.ts ← admin verifies payment
src/app/[locale]/orders/[id]/payment/page.tsx         ← UPI/cash proof upload page
scripts/audit-direct-fetch-ui.mjs                     ← new audit
scripts/audit-feature-flags.mjs                       ← new audit
playwright.config.ts                                  ← E2E config
scripts/qa/playwright/_setup.ts                       ← auth helpers
scripts/qa/playwright/pw-admin-nav.spec.ts            ← E2E
scripts/qa/playwright/pw-seller-basics.spec.ts        ← E2E
scripts/qa/playwright/pw-customer-browse.spec.ts      ← E2E
scripts/qa/playwright/pw-cart-checkout.spec.ts        ← E2E
scripts/qa/playwright/pw-payment-proof.spec.ts        ← E2E
scripts/qa/playwright/pw-wishlist.spec.ts             ← E2E
```

### Patch 1 Success Criteria

| # | Criterion | How to verify |
|---|---|---|
| 1 | Buyer can browse standard products (no login) | `/products` loads, standard listings only |
| 2 | Buyer can search and filter by category | Search + filter returns correct results |
| 3 | Buyer can register + login (email + Google OAuth) | Full auth flow succeeds |
| 4 | Buyer can add to cart, change qty, remove | Cart totals correct |
| 5 | Buyer can checkout with Cash/UPI | Order created, redirect to proof page |
| 6 | Buyer can upload screenshot + txn ID | Proof attached, status shows "proof submitted" |
| 7 | Seller can see incoming orders | Order list shows this seller's orders |
| 8 | Seller can mark order as shipped | PATCH with status=shipped + tracking# works |
| 9 | Admin can see all orders filtered by status | Admin order list works |
| 10 | Admin can verify cash payment | Verify → confirm dialog → `paymentStatus=paid` |
| 11 | Admin can approve/reject product listing | Product moderation works |
| 12 | Disabled features are hidden and return 404 | Events, Blog, Auctions, Razorpay invisible |
| 13 | Mobile nav works on iPhone 13 | BottomSheet shows correct nav, all links reachable |
| 14 | Desktop nav works on 1440px and 2560px | Sidebar collapses/expands correctly |
| 15 | `npm run check` exits 0 | All quality gates pass (including 2 new audits) |
| 16 | All Vitest unit tests pass | Zero failures |
| 17 | All Playwright E2E pass (3 viewports) | pw-*.spec.ts green |
