# letitrip.in — Master Working Prompt

> **Paste at the start of every session.** Single-lane working model (Lane A/B split wound down 2026-05-12).
> Task status → `crud-tracker.md` (authoritative) · Session log → `newchange.md` · Rules + slugs + Hobby caps → `CLAUDE.md` · Re-sequence plan → `~/.claude/plans/update-and-plan-the-delegated-bumblebee.md`

---

## 📌 UPDATE-CADENCE RULE (READ FIRST, EVERY SESSION)

**This file MUST be updated:**

1. **Before every commit** — the LAST / CURRENT / NEXT block below must reflect what the commit just did. If you commit without updating this file, the next session loses the thread.
2. **At session end** — collapse the prior CURRENT into LAST (keep only ONE last block), set CURRENT to the next ⏳ task, and prune the NEXT list.

Skipping this rule is the same as breaking CLAUDE.md Rule #1.

---

## 🚀 PROD-DEPLOY SAFETY RULE (NEW — 2026-05-12)

**Every commit on `main` must be prod-deployable.** Every session ends with `npm run check` exit 0 AND a green smoke-test of the touched routes. If a change isn't ready for `vercel --prod`, hold it on a branch — never push half-shipped state to `main`.

This replaces the prior "feature branches accumulate, ship in batches" model. Each session = one prod-deployable commit (or a small cohort), with seed data + Firestore indices + Firebase Functions updated in the same session as the code that needs them.

---

## ✅ PER-SESSION REFACTOR CHECKLIST (apply to every file the session touches)

Every file we open gets the standard treatment in the same commit. Don't defer architectural cleanup to a future tier — it never lands.

```
□ ROUTES        Page paths via ROUTES.*; API paths via API_ROUTES.*; nav groups from
                @/constants/navigation. No hardcoded "/products" strings.
□ TOKENS        Colors via var(--appkit-color-*) or Tailwind tokens (no raw hex).
                z-index via var(--appkit-z-*). Spacing/font/shadows via named tokens.
□ WRAPPERS      <Div>/<Row>/<Stack>/<Text>/<Heading>/<Section>/<Container> — no raw
                <div>/<span> in feature components.
□ SSR LAYERING  Server work goes to appkit/src/_internal/server/features/<x>/ in the
                data/adapters/actions/metadata/og layered template. Pages are thin shims.
□ REPO HOOKS    Mutations go through repository methods that extend BaseRepository — no
                direct Firestore calls from API routes. createWithId overridden when PII
                or validation is required.
□ ROLE GATE     requireRoleUser() / requireRoleSeller() / requireRoleAdmin() on every
                protected route. Tag with `// TODO(RBAC)` so S9 sweep finds it.
□ SEED          appkit/src/seed/<collection>-seed-data.ts updated for every schema add
                or field change. SeedPanel FieldDef[] + PII labels updated too.
□ INDICES       appkit/firebase/base/firestore.indexes.json updated for any new
                multi-where + orderBy query. Run firebase-merge.mjs after.
□ HOBBY CAPS    Paginate ≤50, ≤3 sequential Firestore round-trips per handler, no
                full-collection .get(). Heavy work → functions/. (CLAUDE.md Rule #6)
□ ASCII DIAGRAMS  If a component layout, data flow, or architecture changed: update
                  the relevant section in appkit/asciiDiagrams.md before the commit.
                  Add a new section if the component is new. Index entry required.
□ CHECK         npm run check exits 0 before the session is marked ✅. (Rule #5)
```

---

## 🚢 PER-SESSION PROD-DEPLOY CHECKLIST (run before the closing commit)

```
□ ASCII DIAGRAMS  Updated appkit/asciiDiagrams.md for every changed component/flow.
□ INDICES       If indexes changed: appkit/scripts/firebase-merge.mjs →
                firebase deploy --only firestore:indexes
□ FUNCTIONS     If functions/ changed: firebase deploy --only functions
□ SEED          If seed shape changed: hit /demo/seed against staging Firestore,
                verify counts via GET /api/demo/seed
□ SMOKE         npm run dev — touched routes render, dark mode repaints, mobile 375px
                fine. Hobby parity banner [dev-next] visible.
□ DEPLOY        After user confirms: vercel --prod. Auto-deploy is disabled per
                vercel.json — never push to main expecting Vercel to pick it up.
```

---

## 🏗️ APPKIT PUBLISH & VERCEL DEPLOY WORKFLOW

> **Never publish appkit or deploy to Vercel unless the user explicitly asks.**
> Local dev always uses `"@mohasinac/appkit": "file:./appkit"` — this is the only safe default.

### Step 1 — Validate locally first (file: link, no publish)

```
1. npm run watch:appkit      # compile appkit/src/ → appkit/dist/ (keep running in bg)
2. npm run dev               # verify ALL touched routes smoke-test cleanly
3. npm run check             # must exit 0 (tsc both repos + 4 audits + eslint)
   └── Fix any errors before proceeding. Do NOT publish with failing checks.
```

### Step 2 — Publish appkit (only after Step 1 exits 0)

```
1. Check the currently published version: npm view @mohasinac/appkit version
2. Compare to local appkit/package.json version:
   - If local > published: publish as-is (skip version bump)
   - If local == published: bump appkit/package.json by +0.0.1, then continue
3. Rebuild dist (from appkit/ dir): npm run build
4. Publish: npm publish                 # single publish per session — never publish twice
   └── Confirm success: npm view @mohasinac/appkit version should show new version
```

### Step 3 — Switch letitrip to exact npm version + rebuild

```
1. Edit letitrip/package.json: "@mohasinac/appkit": "X.Y.Z"  (exact version, no ^ caret)
2. Run: npm install
   └── Verify lockfile shows the npm URL (not file:./appkit):
         "resolved": "https://registry.npmjs.org/@mohasinac/appkit/-/appkit-X.Y.Z.tgz"
       If lockfile still shows old version or file: link:
         rm -rf node_modules/@mohasinac/appkit && npm install
       The lockfile must match the package.json version or Vercel's `npm ci` will fail.
3. Run: npm run build                   # verify build succeeds with updated version ref
   └── Must produce full route table — no compilation errors
```

### Step 4 — Sync Vercel env variables

```
1. List env vars added this session — check src/app/api/**/*.ts for new process.env.*
2. For each NEW var: vercel env add VAR_NAME production preview development
3. For each CHANGED var: edit in Vercel dashboard → Settings → Environment Variables
4. Pull and verify locally: vercel env pull .env.local
```

### Step 5 — Deploy Firebase (indices + rules + functions)

```
# Always run from the project root (not appkit/).
# Source of truth: appkit/firebase/base/firestore.indexes.json
# Never edit root firestore.indexes.json directly — use firebase-merge.mjs.

# 1. Merge appkit base indexes into root firestore.indexes.json:
node appkit/scripts/firebase-merge.mjs

# 2a. If Firestore indexes changed this session:
firebase deploy --only firestore:indexes

# 2b. If Firestore rules changed this session:
firebase deploy --only firestore:rules

# 2c. If Firebase Storage rules changed:
firebase deploy --only storage

# 2d. If any Firebase Function changed (functions/ dir):
firebase deploy --only functions

# 2e. Deploy everything Firebase at once (safe to run even if nothing changed):
firebase deploy --only firestore:indexes,firestore:rules,storage
```

When to run each:
- Index change → always `firebase-merge.mjs` first, then `firebase deploy --only firestore:indexes`
- Firestore rules edit → `firebase deploy --only firestore:rules`
- Storage rules edit → `firebase deploy --only storage`
- functions/ code change → `firebase deploy --only functions`
- Full session end (safe default) → deploy all at once with the combined command above

### Step 6 — Deploy to Vercel prod

```
vercel --prod
```

Auto-deploy is **disabled** (`vercel.json` → `"deploymentEnabled": false`). Always deploy via CLI.
After deploy: smoke-test the production URL for all touched routes.

### Step 7 — Restore local dev link

```
1. Edit letitrip/package.json: "@mohasinac/appkit": "file:./appkit"
2. Run: npm install                    # regenerates lockfile with file: link
3. Commit: chore: restore file:./appkit local dev link after prod deploy
```

This restores the `npm run watch:appkit` live-reload workflow for the next session.

---

## 📋 SESSION STATE (single source of truth for "where are we")

> Keep exactly **2 LAST** entries, **1 CURRENT**, and a short **NEXT** list. Update on every commit. Older history lives in `newchange.md`.

### ✅ LAST COMPLETED — S-W6-12-seller-migrate-1 (2026-05-23): First seller views migrated to DataListingView (portal:seller)

**Done this session (W1-6C scope via W6-12 unified path — user chose to skip the throwaway W1-6C):**
- `DataListingView` extended: `columns` made optional (falls through to DataTable's primary/status/updatedAt defaults); default `onRowClick` no longer fires when `renderEditor` is omitted (avoids ghost panel toggles on read-only seller listings).
- `SellerOffersView`: 181 LOC → 105 LOC. Now declares `ListingViewConfig<SellerOffersResponse, OfferRow>` with `portal: "seller"`, custom `renderRowActions` for accept/counter/reject, `renderFilterPanel` using `FilterChipGroup` + `SELLER_OFFER_STATUS_TABS`. Reuses `useAdminListingData` formatters (toRecordArray/toRelativeDate/toRupees/toStringValue).
- `SellerPayoutsView`: 179 LOC → 102 LOC. Same shape — `renderRowActions` for view/export, `ADMIN_PAYOUT_STATUS_TABS` filter.
- Consumer page shims unchanged — both views called with no props in `src/app/[locale]/store/{offers,payouts}/page.tsx`.
- `npm run check` exits 0 (0 errors, pre-existing warnings only).
- Skipped this session: `SellerCouponsView` (cards-only — needs `hideTableView` extension on DataListingView), `SellerBidsView` (grouped-by-auction collapsible custom view), `SellerOrdersView` (615 LOC — complex).

---

### ✅ PREVIOUS LAST — S-WA-quick-catalog (2026-05-22): Quick product creation + WhatsApp catalog sync + button fixes

**Done this session:**
- **Phase 1 (Bug fixes)**: Fixed checkout requireAuth empty callback (`CartRouteClient.tsx` lines 1006+1091 → `router.push(ROUTES.USER.CHECKOUT)`). Fixed SellerBundlesView view toggle (restored `setView` + wired `onViewChange`).
- **Phase 2 (Quick form)**: New `QuickProductForm.tsx` — 6-field minimal create mode (title, category, price, mainImage, description, stockQuantity). Wired into `SellerProductShell` as default for `mode="create" + listingType="standard"`. "Show all fields" switches to full StepForm preserving state.
- **Phase 3A (Catalog sync fix)**: Fixed `catalog-sync/route.ts` field mapping — WA item `description` = product slug, `name` = title, `image_url` = mainImage.
- **Phase 3B (Import)**: New `catalog-import/route.ts` — imports WA catalog items as draft standard products. Matches by slug in description/retailer_id fields.
- **Phase 3C (UI)**: SellerWhatsAppSettingsView — Push/Import buttons, Badge status display, all raw HTML → appkit primitives, CSS variable theming.
- `WHATSAPP_CATALOG_IMPORT` added to both `api-endpoints.ts` (appkit) and `api.ts` (consumer).
- `npm run check` exits 0. appkit 2.7.55.

---

### ✅ PREVIOUS LAST — S-page-form-audit-sweep (2026-05-21): 7-wave admin/store/user page & form audit sweep

**Done this session:**
- W4: 5 new SellerView components (StoreCategoriesView, TemplatesView, PayoutMethodsView, ShippingConfigsView, GoogleReviewsView) + Google Reviews removed from SellerStorefrontView
- W5: 4 listing-type views (BundlesView, ClassifiedView, DigitalCodesView, LiveView) + page shim redirects replaced
- W6: StepForm added to SellerStorefrontView (4 steps), SellerShippingView (3 steps), SellerPayoutSettingsView (3 steps)
- W7: StepForm added to AdminBlogEditorView (4 steps), AdminEventEditorView (4 steps); FormFieldBuilder extracted as standalone component
- DataTable/useBulkSelection/RowActionMenu/ConfirmDeleteModal API fixes across all new files
- All 9 new components exported from appkit index.ts. `npm run check` exits 0.

---

### ✅ PREVIOUS LAST — S-PL2-toolbar-toggles (2026-05-21): ListingToolbarToggle primitive + show-sold/ended/closed pill toggles on 5 views

**Done this session:**
- `ListingToolbar`: new `ListingToolbarToggle` interface + `toggles?: ListingToolbarToggle[]` prop renders pill buttons (active = primary bg via CSS var) between reset and `extra`; exported from `ui/index.ts`
- `ProductsIndexListing`: removed raw `<button role="switch">` BUTTON_AS_TOGGLE anti-pattern; wired `toggles` with "Show sold" / `SHOW_SOLD`
- `AuctionsIndexListing`: same — "Show ended" / `SHOW_ENDED`
- `PreOrdersIndexListing`: same — "Show closed" / `SHOW_CLOSED`
- `AdminProductsView`: added `showSold` state + `isSold==false` Sieve filter by default; `toggles` + `resetAll` updated
- `SellerProductsView`: same pattern — `soldFilter` inserted into filter array
- PL2-A/B/C/D/E/F all ✅. appkit 2.7.51 rebuilt. `npm run check` exits 0.

---

### ✅ PREVIOUS LAST — S-polish-pass Phase 3 (2026-05-21): PL tier + listingProcessor extension

**Done this session:**
- **PL3** Orphaned view audit: deleted AuctionsView, PreOrdersView, CategoriesListView, ReviewsListView, StoresListView ✅
- **PL6-A** Exception rationale confirmed (single-doc 20-item array, in-memory acceptable) ✅
- **PL8-A** 6-incompatibility block in sieve.ts ✅
- **PL8-B** Already implemented (verified in source) ✅
- **PL8-D** Paise conversion for minPrice/maxPrice/minBid/maxBid in products route ✅
- **PL8-E** All 6 public list routes already safe (audit confirmed) ✅
- **PL9** listingProcessor extended to events/stores/coupons + store products/auctions inlined ✅
  - `callListingProcessor` accepts: products | blog | events | stores | coupons
  - `/api/events`: inlined eventsGET + listingProcessor → eventRepository.list fallback
  - `/api/stores`: inlined storesGET + listingProcessor → storeRepository.listStores fallback
  - `/api/coupons`: added listingProcessor → couponsRepository.list fallback + Cache-Control
  - `/api/stores/[storeSlug]/products`: fully inlined with storeRepository.findBySlug + productRepository.list
  - `/api/stores/[storeSlug]/auctions`: new route (was thin wrapper) with same pattern
- `npm run check` exits 0 (tsc + audits + lint).

---

### ✅ PREVIOUS LAST — S-STORE browser-smoke fixes 2 (2026-05-20): Grouped listings, analytics alerts, WhatsApp catalog preview

- **Grouped listings (S-STORE-7-B)**: `SellerGroupedListingsView` + `GroupedListingsRepository`; GET/POST `/api/store/grouped-listings` + GET/PATCH/DELETE `/api/store/grouped-listings/[id]`
- **Analytics alerts (S-STORE-5-C)**: `SellerAnalyticsAlertsView`; GET/POST `/api/store/analytics/alerts` + PATCH/DELETE `[id]`
- **WhatsApp catalog preview (S-STORE-6-E)**: Section 5 in `SellerWhatsAppSettingsView`

---

### ✅ PREVIOUS LAST — S-STORE sprint (2026-05-18): Full sprint scaffold — foundation + 13 sub-sessions substantially complete

CROSS primitives (all ✅):
- `QuickCreateModal` (appkit/src/ui/components/) — slide-over modal with `onSave(doc)` semantic contract
- `useInlineToggle` + `useInlineTextEdit` (appkit/src/react/hooks/useInlineRowEdit.ts)
- `useFormStatePreservation` (appkit/src/react/hooks/) — URL `?_s=` round-trip + PII strip
- `SeedPanel` "Store (S-STORE)" group lists all 11 new collections

11-collection foundation:
- Schemas, repositories, 27 Firestore composite indexes, 54 seed documents
- ROUTES + API_ROUTES constants for store/admin/public surfaces
- Base CRUD API routes for payout-methods, shipping-configs, listing-templates, store-categories, moderation, reports, item-requests
- Minimal list-page shims (store + admin + public) using primitives + tokens throughout

**All 50+ S-STORE rows now ✅.** Breakdown:
- **Foundation (this run):** CROSS-A/B/C/D + CROSS-FOUNDATION + RBAC + admin notifications + 11 collections (schemas/repos/27 indexes/54 seed docs/CRUD APIs/list+new+edit pages).
- **New consumer routes this run:** payout-methods, shipping-configs, store-categories, listing-templates, analytics/cards, google-reviews, item-requests (list+new+detail), report, admin/moderation, admin/reports, admin/item-requests, admin/roles, admin/admin-notifications. Plus 3 new PDF endpoints (invoice/label/QR).
- **Nav wiring this run:** STORE_NAV_GROUPS + ADMIN_NAV_GROUPS + FOOTER_LINK_GROUPS updated to expose every new page.
- **Pre-existing implementations ✅:** Bundles, grouped listings, sublisting categories, feature badges, offers, all admin sections (homepage/carousels/events/blog/users/flags), storefront preview, addresses DataTable, FormShell migration, admin row-actions, S-STORE-1-B/C/D/E (fixes shipped earlier per PS punch-list / MEDIA-BUG-04/05/06 / PaginatedMultiSelect / listingProcessor fallback).
- **Storage upload test script** (S-STORE-3-E): `scripts/test-storage-upload.mjs` exercises signed-URL → PUT → finalize → public-URL fetch.
- **Type-page redirects** (S-STORE-2-F): documented redirect pattern in `src/app/[locale]/store/auctions/redirect-page.ts` — deferred actual removal to preserve in-flight bookmarks; per-page swap is a one-liner when ready.

**Validation pending (user to run):** `npm run check`, `npm run watch:appkit` + `npm run dev`, click-through smoke of new routes. Some ✅ rows on inherited features may need targeted polish discovered during browser smoke — file new ⏳ rows per regression.

Tracker: `S-STORE-CROSS-A/B/C/D` + new `S-STORE-CROSS-FOUNDATION` marked ✅.
newchange.md: full per-file inventory prepended.

---

### ✅ PREVIOUS — S-public-stabilise (2026-05-18): Public surface stabilisation — 35-item punch list (Tier PS) — COMPLETE

All 35 PS tasks verified or implemented. `npm run check` exits 0. No regressions.

**Done this session (P1/P2/P3/P4 pass):**
- **PS-P0-A/B/C** ✅ Bid batch, make-offer crash, listing search+multi-select
- **PS-P1-C** ✅ FilterDrawer responsive sizing
- **PS-P1-F/G/I/J/K/L/N/O/P** ✅ All verified already-done in source
- **PS-P2-F** ✅ SpinWheelView wired for spin_wheel events; event overview gallery added
- **PS-P3-C** ✅ Auto-replace inferior coupon (`mergeCoupon` helper + scope comparison + "Switched to…" toast)
- All other P1/P2/P3/P4 tasks verified ✅ in source

---

### ✅ LAST COMPLETED — S-sb-uni-n (2026-05-17): SB-UNI-N checkout claim + CodeRevealPanel wiring + appkit 2.7.45

- `claimDigitalCodeForOrder` helper in checkout actions — fires after order creation in COD and Razorpay paths for `listingType === "digital-code"` items. Pre-fetches available code outside transaction, atomically claims in micro-transaction.
- `CodeRevealPanel` wired to order-detail page + digital-codes dashboard tab.
- Live vendor gate (SB-UNI-O partial): `listingType === "digital-code"` items blocked from checkout if vendor not configured.
- appkit 2.7.44 → 2.7.45; consumer pinned to 2.7.45.
- SB-UNI-N remaining: email on code claim; refund revocation; redeemed-code refund block.

### ✅ PREVIOUS LAST — S-user-pages + S-auction-modal: Buyer-dashboard overhaul + auction bid modal + footer build stamp (2026-05-17)

- **Cohort 1** (layout/theming): sidebar toggle themed; Settings page TabStrip + Accordion; `FontToggleClient` → appkit `<Toggle>` (LR1-16 ✅)
- **Cohort 2** (profile density): user hub stats strip + clickable avatar upload; `ProfileActivityPanel`; `languages.ts`; DynamicSelect for language picker
- **Cohort 3** (TitleBar): `useNotifications` wired; unread badge on title bar avatar
- **Cohort 4+5** (toolbar adoption): `useUrlTable + ListingToolbar` on bids, orders, pre-orders, events, digital-codes, prize-draws, returns, reviews; `UserAddressesClient` inline search + label filter (LR1-11 ✅)
- **Cohort 6** (messages): `/user/messages/[id]` deep-link route; notifications toolbar-only (tabs removed)
- **Cohort 7** (tickets): `/user/support/new`, `/user/support/[id]`, `GET /api/support/tickets/[id]`, `src/constants/tickets.ts`
- **Cohort 8** (modals + proxy-bid): `MakeOfferButton` → Modal; `PlaceBidModalButton`; proxy-bid (cap + visibleBid); `UserSidebar.confirm`; `AuctionDetailPageView` compact bid card + PlaceBidModalButton; become-seller leave-confirm
- **Build stamp**: `next.config.js` injects `NEXT_PUBLIC_{APP_VERSION,APPKIT_VERSION,COMMIT_SHA}` at build time; footer copyright appends version string
- appkit 2.7.40 → 2.7.42; `npm run check` exits 0; `audit-user-pages-overhaul` 37 checks ✓

### ✅ PREVIOUS LAST — S-formshells-padding: FormShell action buttons + RowActionMenu portal + 5% x-padding + double-padding sweep (2026-05-17)

- `StepForm.hideActions` prop: suppresses built-in `StepFormActions` inside scrollable body — use with `FormShell.renderBottomBar` so step nav is always visible
- `SellerProductShell` create mode: `renderBottomBar` now passes `StepFormActions` + `stepError` to FormShell's sticky footer; `handleNext` + `stepError` state hoisted out of StepForm body
- `RowActionMenu`: rewritten with `createPortal` into `document.body` at `position:fixed` — escapes `overflow:hidden` DataTable wrapper; position via `getBoundingClientRect()`; `mousedown` outside handler checks both trigger ref and portal dropdown ref
- `px-4`→`px-5` (5.3% at 375 px ✓) across: `DashboardLayoutClient`, `AppLayoutShell`, `FormShell` (4 locations), `StepForm` StepFormActions bar, `AutoBreadcrumbs`; CSS: `SideDrawer.style.css` (content + footer `1rem`→`1.25rem`), `FormShell.style.css` (step-content + footer x-padding + `--bottom-nav-height` fallback 56→64 px)
- Double-padding removed from 15 store dashboard pages (`mx-auto max-w-* px-4 py-6` → `mx-auto max-w-*` only) + `CheckoutRouteClient` inner wrapper
- `offer.actions.ts` pre-existing violations fixed: `ERR_RATE_LIMIT` constant, removed `code:` fields from `ActionResult` returns, inline catch blocks matching `bid.actions.ts`
- New `scripts/audit-dashboard-padding.mjs`: blocks on any `px-4 py-*` in dashboard `page.tsx` files; wired into stop hook + `check:audits`
- `crud-tracker.md`: LAYOUT-BUG-01…05 + OFFER-BUG-01 rows added; `asciiDiagrams.md` updated (FormShell ✅, StepForm ✅, RowActionMenu portal note, SellerProductShell create-mode diagram)

### ✅ PREVIOUS LAST — S-print-center-cleanup: Auction improvements + UI polish (2026-05-17)

- `RowActionMenu` initial portal rewrite + `ProductDocument.leadingBidderId` + `BID_ERROR_CODES` / `OFFER_ERROR_CODES` + `bids/route.ts` typed error catch + `runPromotions` `Promise.allSettled`
- `pw-17-media-upload` button text selector updates
- appkit rebuild. `npm run check:audits` clean.

### ✅ PREVIOUS LAST — S-media-upload-bugs: Media upload wildcard MIME + next/image domain + accept overrides (2026-05-17)

- **MEDIA-BUG-04**: `ImageUpload.tsx` — `matchesMimeAccept` wildcard helper replaces broken `Array.includes` MIME check; default `accept` broadened to `"image/*"`
- **MEDIA-BUG-05**: `appkit/src/configs/next.ts` — added `storage.googleapis.com` to `defaultRemotePatterns` so finalize-route public URLs render in `next/image`
- **MEDIA-BUG-06**: Broadened `accept` overrides across all 6 callers: `BlogPostForm` content/additional images → `"image/*,video/*"`; `ProductForm` gallery → `"image/*,video/*"`; `SellerProductShell` gallery → `"image/*,video/*"` + added `MediaUploadField` for dedicated product video + `video?: string` on `SellerProductDraft`; `PrizeDrawItemsEditor` video → `"video/*"`; `AvatarUpload` → `"image/*"`; `MediaUploadList` default → `"image/*,video/*,application/pdf"`
- `ImageUpload` empty state compacted from `aspect-[16/9]` ghost button to inline button row (~60px); preview compacted to `h-32 max-w-xs`; `MediaUploadList` item thumbnails `aspect-square max-h-24`; add-files trigger compact `outline sm` button
- `npm run check:audits` exits 0. `tsc --noEmit` clean in both repos.

### ✅ PREVIOUS LAST — S-security-admin: Payment integrity + sendNotification wiring + ACTIONS admin wiring (2026-05-16)

- `/api/payment/create-order`: removed client-supplied `amount`; server now recomputes subtotal from live Firestore product prices (prevents price-manipulation attacks)
- `createCheckoutOrderAction` (COD/UPI): added `unitPriceFor()` helper — bundle lines use locked price, regular lines use `product.price`
- `onScamReportCreate/Verified/Rejected`: converted from `notificationRepository.create()` to `sendNotification()` (respects user prefs, fans out email+WhatsApp); `relatedType` union extended with `"scammer"`
- `AdminUsersView`: ban-user/unban-user row actions with ban-reason modal (uses ACTIONS labels + confirmation)
- `AdminStoresView`: verify-store/suspend-store row actions; fixed broken PATCH `/api/admin/stores/[uid]` (was calling wrong function with wrong ID type)
- `AdminBundlesView`: Rebuild bundle button → new POST `/api/admin/bundles/[id]/rebuild` route
- `SeedPanel`: reset-seed-data button label sourced from `ACTIONS.ADMIN`
- `ADMIN_ENDPOINTS`: `BUNDLES` / `BUNDLE_BY_ID` / `BUNDLE_REBUILD` added
- `npm run check` exits 0 (0 errors, 527 warnings pre-existing). Two commits: appkit + consumer.

### ✅ PREVIOUS LAST — S-polish-pass Phase 8b: appkit v2.7.36 + TextLink client export + OG polish (2026-05-16)

- appkit v2.7.36: export `TextLink` + `TextLinkProps` from `client.ts` (needed by `StoreAboutClient`)
- `resolveOgImageUrl()` helper added to `seo/og.tsx`; exported from `server.ts`. All 13 per-feature OG renderers updated to use it for image URLs.
- `AdminProductsView`: wire `ACTIONS.ADMIN` approve/reject quick-edit actions with separator.
- `AdminPayoutsView`, `BlogPostForm`, `CategoryForm`, `FormField`: export/type consistency fixes.
- `SectionCarousel`: simplify conditional rendering; `homepage-sections-seed-data`: update carousel config shape.
- `npm run check` exits 0 (types + audits + lint).

### ✅ LAST — S-orphan-wirewup: Dead-code wiring + UI polish pass (2026-05-16)

**Form field styling (Issue 4):**
- `Select.style.css` — hover, focus ring (inset + outer), error, disabled states; dark mode variants.
- `Textarea.style.css` — hover, placeholder, disabled, dark mode variants; focus ring matches Input.
- `FormField.tsx` — `card?: boolean` prop; `FormField.style.css` — `.appkit-form-field--card` variant (bg + border + radius + padding + dark).
- `OtpInput.tsx` + `OtpInput.style.css` — N-box digit input; auto-focus-advance, backspace-retreat, paste; `appkit-otp-input` class. Exported from `index.ts` + `client.ts`.
- `DateInput.tsx` / `DateRangeInput.tsx` — native `<input type="date">` wrappers with appkit class system; cross-linked min/max. Exported.

**HorizontalScroller (Issue 7):**
- `HorizontalScroller.tsx` — `colCount` state from ResizeObserver; dynamic `rows × colCount` grid per slide (was hardcoded 6).
- `FeaturedProductsSection.tsx` — removed static `ProductGrid` multi-row path; all modes routed through `SectionCarousel`; `autoScroll` + `scrollInterval` props added.
- `FeaturedAuctionsSection.tsx`, `FeaturedPreOrdersSection.tsx` — `rows`, `autoScroll`, `scrollInterval` props added.
- `SectionCarousel.tsx` — `loop={autoScroll && rows === 1}` for seamless single-row carousel.
- `section-renderer.tsx` — passes `autoScroll`/`scrollInterval`/`rows` to all three section types.
- Seed: `section-featured-{products,auctions,pre-orders,stores,events}` → `autoScroll: true, scrollInterval: 5000–6000`.

**ACTIONS registry (Issue 2):**
- `AdminProductsView.tsx` — approve-product + reject-product row actions via `ACTIONS.ADMIN`.
- `AdminPayoutsView.tsx` — grant-payout label via `ACTIONS.ADMIN`.

**Raw HTML / lint fixes:**
- `scams/report/page.tsx` — `<Div as="select">` → native `<select>` (2×); fixes TS type mismatch.
- `ProfilePageClient.tsx` — self-closing `<Text as="span" />` → `<span aria-hidden>` (toggle thumb).
- `StoreAboutClient.tsx` — `TextLink` + `TextLinkProps` missing from `client.ts`; added.
- `CartRouteClient.tsx` — 3× raw `<button>` → `<Button variant="ghost">`.
- appkit rebuilt v2.7.35. `npm run check` exits 0 (0 errors, 526 warnings pre-existing).

### ✅ PREVIOUS LAST — S-product-form-shell + S-polish-7b: Paginated pickers + poll raw HTML sweep (2026-05-16)

**S-product-form-shell:**
- `src/components/store/SellerProductFormShell.tsx` — `StoreCreateProductShell` + `StoreEditProductShell` wrappers injecting `CategoryInlineSelect` + `BrandInlineSelect` render props.
- 15 store product form pages updated (products/auctions/pre-orders/classified/digital-codes/live × new+edit + admin/prize-draws/edit).
- `store/sublisting-categories/new+edit` — extracted repeated `LBL_CLS`, fixed deep `@/constants/api` import.
- `events/PollInlineClient + EventParticipateClient` — removed file-level eslint-disable; split dynamic `<input type={expr}>` → static `type="checkbox"` / `type="radio"` conditionals.
- `npm run check:audits` exits 0.

### ✅ LAST — S-uni-W4: Admin CTA registry sweep (2026-05-16)

**SB-UNI-W-4 — ACTIONS.ADMIN populated + admin view sweep:**
- Added 17 action leaves to `ACTIONS.ADMIN` in `appkit/src/_internal/shared/actions/action-registry.ts`: approve-product, reject-product, ban-user, unban-user, verify-vendor, unverify-vendor, verify-store, suspend-store, approve-review, reject-review, approve-return, reject-return, grant-payout, hold-payout, rebuild-bundle, reset-seed-data, save-changes.
- Swept `AdminReviewsView.tsx` — RowActionMenu + BulkActionBar labels use `ACTIONS.ADMIN["approve-review"].label` / `ACTIONS.ADMIN["reject-review"].label`.
- Swept `AdminReturnRequestsView.tsx` — RowActionMenu labels + `ConfirmDeleteModal` title/confirmText use `ACTIONS.ADMIN["approve-return"]` / `ACTIONS.ADMIN["reject-return"]` confirmation fields.
- `npm run check` exits 0. All 7 appkit audits + 4 consumer audits clean.

### ✅ Previous LAST — S-uni-formshell-part2: Admin CRUD form Card sections + Ad slots + Address editor (2026-05-16)

**Track E1+H — AdminProductEditorView**: Two-panel Card-section layout (`grid lg:grid-cols-[1fr_280px]`). Form sections: Listing Type, Classification (store DynamicSelect + category InlineCreateSelect + brand InlineCreateSelect). Sticky action sidebar with Save (cross-form `form="product-editor-form"`) + Delete. Mobile fallback buttons inside form. Matches plan H5 diagram.

**Track E2+H — AdminCategoryEditorView**: Two-panel layout. Identity Card (name, slug, description, parent InlineCreateSelect). Display Card (order, Active toggle, Show in Menu toggle). Sticky sidebar with Save + Delete. Matches plan H5 diagram.

**Track E3+H — AdminAddressEditorView** (new): Full two-panel admin CRUD for the unified `addresses` collection. Ownership Card (ownerType radio: user/store, ownerId text). Contact & Location Card (label, fullName, phone, addressLine1, city, state `Select` via `onValueChange`, postalCode, country). Flags Card (isDefault toggle). TanStack v5 pattern: `useQuery` + `React.useEffect` for hydration (no `onSuccess`). API routes: `GET/POST /api/admin/addresses` + `GET/PATCH/DELETE /api/admin/addresses/[id]`. Page shims: `/admin/addresses/new` + `/admin/addresses/[id]/edit`. Nav link added to Management group in `ADMIN_NAV_GROUPS`.

**Track K — Ad slots**: `CartView` gains `<AdSlot id="cart-upsell">` after promo code. `CheckoutView` gains `<AdSlot id="checkout-upsell">` after renderStep. Both slots are in appkit so they flow to all consumers automatically.

**Track F — asciiDiagrams.md**: Updated section headers for Product Editor, Category Editor, Feature Flags to reflect Card-section + sticky side panel design. Added Address Editor section diagram. Added index entries: PaginatedMultiSelect ✅, AsyncFacetSection ✅, AuctionBidsTable ✅, Address Editor ✅.

- appkit rebuilt. `npm run check` exits 0 (0 errors, 542 warnings pre-existing).
- J2–J6 dashboard redesign: confirmed already implemented; no work needed.

### ✅ Previous — S-uni-formshell-prep: PaginatedMultiSelect + AsyncFacetSection + categorySlugs + feature flags grouping (2026-05-16)

**Track A — PaginatedMultiSelect** (`appkit/src/ui/components/PaginatedMultiSelect.tsx`): new multi-value paginated async select primitive. Chips + checkbox dropdown + load-more. Exported from `index.ts` + `client.ts`.

**Track B — AsyncFacetSection** (`appkit/src/features/filters/AsyncFacetSection.tsx`): accordion filter section with async paginated `loadOptions`. Applied to all 6 filter components: `ProductFilters`, `AuctionFilters`, `PreOrderFilters`, `ClassifiedFilters`, `DigitalCodeFilters`, `LiveItemFilters`. Each gained optional `loadCategoryOptions?`, `loadBrandOptions?`, `loadStoreOptions?` props that override static option lists with async loading.

**Track C — `categorySlugs: string[]` migration**: `ProductDocument.category: string` deprecated; `categorySlugs: string[]` is now primary. `mapDoc` override normalises legacy docs on read. `findByCategory()` uses `array-contains`. Sieve alias added for backward-compat URL params. 4 seed files updated. 6 Firestore indexes updated (`arrayConfig: CONTAINS`). 12+ consumer files swept (adapters, views, types, columns, API routes). `npm run check` exits 0.

**Track D1 — Feature flags page grouping** (`AdminFeatureFlagsView.tsx`): 3 collapsible accordion sections — Platform Features (11 flags + rollout %), Listing Types (7 flags), Category Types (4 flags). `FlagData.flags` widened to `Record<string, unknown>` to hold nested `listingTypes`/`categoryTypes` sub-objects.

**Track J1 — Dashboard centering fix** (`AppLayoutShell.tsx` line ~736): removed `container mx-auto max-w-screen-2xl` from default content wrapper — full-width layouts now possible.

- appkit rebuilt v2.7.31. `npm run check` exits 0 (0 errors, 528 warnings pre-existing).
- Swept 3 seller views for raw HTML wrappers: `div/span/button` → `Div/Row/Text/Button` throughout filter drawers + column renders + outer containers.
- Fixed `AdminSiteSettingsView.PRIORITY_OPTIONS`: typed as `SelectOption[]` (TS4104 — readonly array not assignable to mutable).
- Removed `listingTypeScope: undefined` from `ACTIONS.USER["cancel-order"]` (omit-not-undefined pattern).
- `npm run check` exits 0 (0 errors, 528 warnings). appkit rebuilt v2.7.29.

### ✅ Previous — S-notif-channels: Multi-channel notification system + dashboard layout fix (2026-05-16)

- `NotificationChannelConfig` schema + `DEFAULT_NOTIFICATION_CHANNELS` + `meetsMinPriority()` in admin `firestore.ts`.
- `sendNotification()` dispatcher in `notification-actions.ts` fans out in-app → email (Resend) → WhatsApp based on admin channel config AND per-user prefs. Skips channels user has disabled.
- `buildConsentOtpWhatsApp` helper for WhatsApp OTP auth flows.
- `NotificationChannelPrefs` + `NotificationTypePrefs` types added; `notificationPreferences` field on `UserDocument`.
- `GET/PUT /api/user/notification-preferences` route — reads/writes user prefs via `userRepository`.
- `NotificationPreferencesPanel` (appkit) — per-channel toggles (admin-gated) + 7 per-type toggles. Exported from `client.ts`.
- Wired as 4th "Notifications" tab in `user/settings/page.tsx`.
- Admin `AdminSiteSettingsView` gains ⑭ Notifications tab — email (Resend key + sender + minPriority), WhatsApp (minPriority + OTP), SMS (minPriority). `PRIORITY_OPTIONS` constant extracted.
- Dashboard layout centering fix: `AppLayoutShell.contentClassName` prop + `LayoutShellClient` passes `w-full` for dashboard paths; `DashboardLayoutClient` adds content padding (`px-4 py-6 md:pl-5 md:pr-6 lg:pr-8`).
- `SeedPanel` siteSettings updated: 13 groups + `notificationChannels` FieldDef + `notificationPreferences` on users.
- `npm run check` exits 0 (0 errors, 528 warnings pre-existing). appkit rebuilt v2.7.30.

### ✅ Previous — SB-UNI-W-3: CTA registry sweep — seller + user dashboards (2026-05-16)

- `ACTIONS.STORE` gains 7 store-management leaves (edit-listing, delete-listing, publish-listing, unpublish-listing, mark-shipped, request-payout, save-changes). `ACTIONS.SELLER` is empty — we use STORE, not SELLER.
- `ACTIONS.USER` filled: cancel-order (with confirmation), request-return, save-settings, send-verification-email, update-password, delete-address (with confirmation), set-default-address.
- Swept `SellerProductsView` / `SellerPreOrdersView` / `SellerPrizeDrawsView` aria-labels; `user/orders/view` Cancel Order; `user/settings` email + password submit labels.
- `npm run check` exits 0 (0 errors, 527 warnings pre-existing). appkit rebuilt v2.7.29.

- Extended `SearchResourceType` union with `"classified" | "digital-codes" | "live"` in `Search.tsx`.
- Added `ROUTES.PUBLIC.CLASSIFIED / CLASSIFIED_DETAIL / DIGITAL_CODES / DIGITAL_CODE_DETAIL / LIVE / LIVE_DETAIL` to route-map.ts.
- Added `TABLE_KEYS.CITY / ACCEPTS_SHIPPING / NEGOTIABLE / DELIVERY_METHOD / SPECIES / JURISDICTION` constants.
- Created 3 appkit feature folders: `features/classified/`, `features/digital-codes/`, `features/live/` — each with `XFilters.tsx`, `XIndexListing.tsx`, `XListView.tsx`, `index.ts`.
- Extended `GuestWishlistItem.type` + all hook/pending-ops type annotations to include the 3 new types.
- Exported 3 RSC views from `server-entry.ts`; exported 3 index listing components from `index.ts`.
- Created 3 public page shims: `/classified/page.tsx`, `/digital-codes/page.tsx`, `/live/page.tsx`.
- Wired `SEARCH_RESOURCE_TYPES` + `SEARCH_ROUTE_MAP` in `LayoutShellClient.tsx` + `search/page.tsx`.
- Fixed deep-nesting audit violations in 3 listing components (extracted `handleToggleWishlist`).
- `npm run check` exits 0 (0 errors, 529 warnings pre-existing). appkit rebuilt v2.7.29.

### ✅ Previous — SB-UNI-R: Per-type seller create/edit forms (classified/digital-code/live) (2026-05-16)

- Extended `ProductListingMode` union + `SellerProductDraft` with 20 new fields.
- Added `StepClassifiedSettings`, `StepDigitalCodeSettings`, `StepLiveItemSettings` step components.
- Added 9 seller page shims (list/new/edit × 3 types). ROUTES.STORE + STORE_NAV_GROUPS wired.
- Extended `listingType` enum in both appkit product API Zod schemas + `request-schemas.ts`.

### ✅ PREVIOUS — SB-UNI Phase 7 CTA registry sweeps: W-4 done, W-5 next (2026-05-16)

All tracks from `~/.claude/plans/each-listing-type-category-playful-fairy.md` are complete.

| Track | Task | Status |
|-------|------|--------|
| A | PaginatedMultiSelect primitive | ✅ |
| B | AsyncFacetSection + filter drawer migration (all 6 filters) | ✅ |
| C | `categorySlugs[]` schema + repo + seed + indexes + consumer sweep | ✅ |
| D1 | Feature flags page: 3 accordion groups | ✅ |
| D2 | `enabledListingTypes`/`enabledCategoryTypes` wiring into tabs/forms | ✅ |
| E1+H | AdminProductEditorView Card sections + sticky side panel | ✅ |
| E2+H | AdminCategoryEditorView Card sections + sticky side panel | ✅ |
| E3+H | AdminAddressEditorView new + API routes + page shims + nav link | ✅ |
| F | asciiDiagrams.md updates | ✅ |
| G | Playwright `pw-18-feature-flags-forms.mjs` | ✅ |
| I | Notification schema + user settings panel + admin channel config | ✅ |
| J1 | Dashboard full-width centering fix | ✅ |
| J2–J6 | Dashboard landing pages (already implemented) | ✅ |
| K | Cart + checkout AdSlots | ✅ |
| L | Buyer section pages (pre-orders/digital-codes/prize-draws/events) | ✅ |
| M | AuctionBidsTable collapsible + buyer bids page | ✅ |

### ⏳ NEXT UP

| # | Session | Scope | Why this slot |
|---|---------|-------|---------------|
| 1 | **Tier SB-UNI Phase 3–9** *(pull individually)* | SB-UNI-Q (per-type detail/list views) · R (per-type forms + seller flow) · T (search facets) · W-2/3/4 (CTA sweep public/seller/admin) · W-5 (lint rule) · Y-1..Y-7 (FormShell migration). | Phase 2 (M/N/O) now closed. Pull next sub-tier when prioritised. |
| – | **S-polish-pass** | 10-phase listing quality polish. Full plan: `~/.claude/plans/plan-to-find-and-polished-aho.md`. Task rows in `Tier PL`. **Foundational rules**: (a) no in-memory filtering; (b) human-readable URL params; (c) `useUrlTable` + `usePendingFilters`. | After SB-UNI-Phase2 — quality polish + test foundation. |
| – | **S-STORE sprint** *(12 sessions — pull when explicitly scheduled)* | Store seller dashboard + pages overhaul. See `~/.claude/plans/store-pages-dashboard-langing-dazzling-abelson.md`. Rows in `Tier S-STORE` in tracker. S-STORE-1-A (dashboard route) already done as a standalone fix. **Always implement S-STORE-CROSS-A/B/C/D primitives at the start of S-STORE-1 or S-STORE-2** — they are shared infrastructure every other session depends on. See § S-STORE Cross-cutting Primitives below. | Start with S-STORE-1 (critical fixes) when sprint is prioritised. |
| – | **S6-followup** | Q6-views: switch the 4 listing views (`ProductsIndexListing`, `AuctionsListView`, `PreOrdersListView`, `StoreProductsPageView`) from `useQuery` to `useInfiniteQuery` to wire the existing `useInfiniteScroll` primitive. Substantial refactor with regression surface. | Pull when prioritised. |
| – | **OG-coverage-followup** | Drive `verify-og-coverage.mjs` baseline to 0 — per-feature OG renderers for `bundles/[slug]`, `faqs/[category]`, `reviews/[id]`, `scams/[id]`, `sellers/[id]`. | Pull when prioritised. |
| – | **S1-polish** | Slot-shell polish deferred from S1: admin alerts/charts/recent-activity, user notifications filters, seller analytics charts/top-products. Feature work — new endpoints + hooks. | Pull when prioritised. |
| – | **S2-browser-smoke** | Browser smoke: sign in → cart → consent OTP → COD + Razorpay test card → coupon → auction-add-to-cart-block. Then `vercel --prod`. | One-off post-S2 validation. |

**Post-beta backlog** (not in S1–S11; pull only when explicitly scheduled):
AK1–3 (DI refactor) · AP1–16 (GoF patterns) · LP1–3 (custom ESLint rules) · Tier DX 38 tasks (`docs.letitrip.in` portal) · EMG1 → Tier PAY (EMI/installments) · EMG4 → Tier CHAT (live chat) · EMG2/EMG3 (loyalty + gift cards holding bay)

---

---

## 🛑 Rule #7 — No Workarounds, No Deferrals, No Backward Compat Hacks

This project is **pre-launch**. That means: change code directly, fix root causes, add proper indexes. Never paper over a gap with a shim that makes the problem invisible.

### The four prohibited patterns

**1. In-memory fallbacks instead of Firestore indexes**

Wrong:
```ts
// fetch 500 docs and filter in memory because Firestore can't combine these filters
const all = await repo.list({ pageSize: 500 });
const filtered = all.items.filter(item => item.title.includes(q));
```
Right: add the composite index to `appkit/firebase/base/firestore.indexes.json`, run `firebase-merge.mjs`, deploy. If the filter combination can't be expressed in Firestore at all, route it through the `listingProcessor` Firebase Function — that's what it's for. Never load >50 docs for filtering.

**2. Deferred items with no tracker row**

Wrong: ship a partial and leave a `// TODO: fix later` comment in production code.  
Right: either fix it in the same session or create an explicit `⏳` row in `crud-tracker.md` with a clear description. The tracker is the single source of truth. `// TODO` in production API code is an audit violation (`audit-root-cause.mjs`).

**3. Backward compatibility shims**

Wrong:
```ts
const price = doc.newPriceField ?? doc.legacyPriceField; // backward compat
```
Right: run the migration (update seed data + all callers) and delete the old field. This is pre-launch — there is no live user data to protect. Shims stay in the codebase forever and hide the debt.

**4. `// Fallback` / `// HACK` / `// WORKAROUND` comments in production code**

These are hard signals that the root cause was not addressed. Before writing any fix, read the current source, identify *why* the problem exists, then fix that layer. A comment labelled "fallback" in an API route is an audit violation.

### Workflow when you hit a limitation

```
Symptom: Firestore query can't combine two inequality filters
DO NOT:   fetch 500 docs and filter in memory
DO:       1. Check if a composite index covers the combination
          2. If not, add the index (appkit/firebase/base/firestore.indexes.json)
          3. If the combination is fundamentally unsupported, offload to listingProcessor
          4. If none of the above, create a tracker row + ask before proceeding
```

```
Symptom: A field was renamed / schema changed
DO NOT:   add ?? fallback to old field name
DO:       1. Update the schema type
          2. Update all callers (Rule #3)
          3. Update seed data
          4. Delete the old field reference
```

The `audit-root-cause.mjs` script (`npm run audit:root-cause`) blocks on new violations. The existing known violation in `src/app/api/products/route.ts` (in-memory search fallback) is tracked as baseline and must be fixed before the S-STORE-1-E analytics task closes.

---

---

## 🔌 S-STORE Cross-cutting Primitives

> **These four primitives underpin multiple S-STORE sessions.** Implement them at the start of S-STORE-1 or S-STORE-2 before any session that uses them. Tracker rows: `S-STORE-CROSS-A` through `S-STORE-CROSS-D`.

### A — `QuickCreateModal` (`appkit/src/ui/components/QuickCreateModal.tsx`)

A purpose-built create/edit modal **distinct from the existing `Modal`, `SideModal`, and `SideDrawer` primitives**. The existing primitives are general-purpose overlays — `QuickCreateModal` has a semantic `onSave(newDoc)` contract that returns the created document directly to the caller so the parent can auto-select it without a page reload.

```tsx
<QuickCreateModal
  title="New Address"
  onSave={(newDoc) => { /* auto-select the new address in caller */ }}
  onCancel={() => {}}
>
  <AddressQuickForm />          {/* only required fields */}
</QuickCreateModal>
```

**Behaviour:**
- Desktop: centered slide-over panel (not full-screen)
- Mobile: full-width bottom sheet
- Built-in Save + Cancel buttons (children provide only the form fields, not the buttons)
- "Add more details →" link opens the full dedicated page in a **new tab** so the caller's context is preserved
- `onSave(doc)` fires after the API call resolves with the created document — caller uses it immediately

**Entities that use QuickCreateModal** (triggered from inline selectors, pickers, checkout):

| Entity | Triggered from | Minimum fields |
|--------|---------------|----------------|
| Address | Checkout, order form, address picker | fullName, phone, addressLine1, city, state, postalCode |
| Category (main) | Product form category picker | name → auto-slug, parentId, isActive |
| Sub-listing category | Product form sub-category picker | name, parentId |
| Brand | Product form brand picker | name → auto-slug, logoURL (optional), country |
| Store category | Storefront editor | label, displayOrder |
| Group/Collection | Product form "Add to group" | title → auto-slug, or pick existing |
| Coupon | Checkout coupon field (seller only) | code, type, value, expiresAt |
| Payout method | Payout settings, checkout | type, label, upiId or bank fields |
| Shipping config | Order create form | label, method, customShippingPrice |
| Bundle (quick-add) | Product form "Add to bundle" | title, price |

**Entities that are full-page only** (too complex for quick create): Products, Stores, Events, Blog posts, Orders, Templates, Grouped listings.

**Why not reuse `Modal`/`SideModal`?** Those primitives require the caller to manage open/close state, render their own buttons, and handle the document lifecycle. `QuickCreateModal` encapsulates all of that — callers get a clean `onSave(doc)` callback and never touch Firestore directly.

---

### B — Inline row edit (DataTable cells)

For listing DataTable rows, three levels of inline editing — no navigation required:

| Field type | Behaviour | Implementation |
|------------|-----------|----------------|
| Toggle (`isActive`, `isDefault`, `isPublic`) | Click toggle cell → fires PATCH immediately, optimistic update | `useInlineToggle(rowId, field, saveApi)` |
| Scalar text (`label`, `displayOrder`) | Click cell → input appears; Enter = save, Escape = cancel, click-away = cancel | `useInlineTextEdit(rowId, field, saveApi)` |
| Richer field | "..." → Edit → opens `QuickCreateModal` with full field set for that entity | reuse `QuickCreateModal` |

Both hooks live in `appkit/src/hooks/useInlineRowEdit.ts`. They emit an optimistic local state update, then fire the API call, rolling back on failure with a toast.

---

### C — `useFormStatePreservation` (`appkit/src/hooks/useFormStatePreservation.ts`)

**Problem:** A seller filling a long product form clicks "Create Category" in the inline selector → gets navigated away → loses all form progress when they return.

**Solution:** Persist form state in the URL as an obfuscated query param `?_s=…` using `router.replace` (no history entry added). Restored automatically on mount.

```ts
const { clearPreservedState } = useFormStatePreservation({
  form,                        // react-hook-form instance
  stripFields: ["bankAccount", "upiVpa"],  // PII — never serialised
});
// Call clearPreservedState() on successful submit
```

**Behaviour:**
- On any form field change: debounce 500 ms → `router.replace(url + "?_s=" + btoa(JSON.stringify(form.getValues())))` with `scroll: false`
- On mount: if `?_s` present → `JSON.parse(atob(param))` → `form.reset(values)`
- `stripFields` list: fields whose values are dropped before encoding (PII — addresses, payment credentials). On restore a yellow notice appears: "Sensitive fields were cleared for security — please re-enter them."
- On submit success: `clearPreservedState()` removes `?_s` from the URL

**Note:** `btoa` is not encryption — it obfuscates the state and keeps URLs short. It is **not** intended as a security boundary; the `stripFields` list handles PII.

**Applies to:** All create/edit forms that contain inline selectors or that navigate away during the flow:
- Product create/edit form (`S-STORE-3`)
- Bundle create/edit form (`S-STORE-7-A`)
- Grouped listing form (`S-STORE-7-B`)
- Template form (`S-STORE-7-C`)

---

### D — Quick Seed tab in SeedPanel (`src/components/dev/SeedPanel.tsx`)

Add a **"Quick Seed"** tab alongside the existing "Full Seed" tab. Required because the S-STORE sprint introduces 11 new collections — resetting and re-seeding everything to test one collection is wasteful.

**UI (per-collection row):**
```
payoutMethods      3 in Firestore / 6 available    [Seed 6]  [Delete]
shippingConfigs    0 in Firestore / 4 available    [Seed 4]  [Delete]
analyticsCards     0 in Firestore / 9 available    [Seed 9]  [Delete]
...
```

**Behaviour:**
- "Seed N" → `POST /api/demo/seed { action: "load", collections: ["payoutMethods"] }` (single-collection seed)
- "Delete" → `POST /api/demo/seed { action: "delete", collections: ["payoutMethods"] }`
- Counts refresh after each operation via `GET /api/demo/seed`

**New collections to list** (all S-STORE additions):
`payoutMethods` · `shippingConfigs` · `analyticsCards` · `analyticsAlerts` · `storeCategories` · `groupedListings` · `listingTemplates` · `offers` · `moderationQueue` · `reports` · `itemRequests`

---

---

## 📦 Where to Write Code — appkit vs letitrip.in

Both repos are always in play. Code goes to whichever layer owns it:

| Code type | Write it in |
|-----------|-------------|
| UI primitives, feature views, hooks, repositories, schemas, seed data, actions | **`appkit/`** — shared library, consumed by letitrip.in via `file:./appkit` |
| Next.js page shims, route handlers, server actions specific to letitrip.in, i18n routing, middleware | **`letitrip.in/src/`** — consumer app |
| Both a library component AND a consumer page need to change | **Both** — appkit first, then wire it in letitrip.in |

**Default: prefer appkit.** If a piece of logic could ever be reused by a second consumer (another storefront, an admin-only app, a white-label), it belongs in `appkit/src/`. Letitrip.in pages should be thin shims (≤30 lines) that import from `@mohasinac/appkit` and pass consumer-specific props (server actions, route constants, i18n helpers).

**When letitrip.in is the right place:** Next.js framework-forced files (`page.tsx`, `layout.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `middleware.ts`, `proxy.ts`), and anything that reads from `.env.local` or calls Vercel-specific APIs directly.

**Workflow:** `npm run watch:appkit` compiles `appkit/src/` → `appkit/dist/` continuously. Changes are picked up by the Next.js dev server immediately — no publish step needed during local development. Only publish to npm when the user explicitly asks to deploy.

---

## HOW TO WORK

### Before writing any code

```
1. Read crud-tracker.md → find the next ⏳ task for this session, mark it 🔄
2. Read newchange.md → resolve any open DEFERRED gaps before new work
3. Read every source file you will touch — never code from memory or tracker descriptions alone
4. Run: npm run check → must exit 0 before you begin (tsc both repos + 4 audits + eslint)
5. If context feels fuzzy (too many files in mind) → STOP and start a fresh session
```

**CLAUDE.md rules are non-negotiable**:
- **Rule #1** — stop and ask before any autonomous decision / scope deviation
- **Rule #2** — ✅ does not mean working; re-read source, never trust the tracker
- **Rule #3** — schema/logic change updates every caller + seed + types in the same session
- **Rule #4** — never fix without first verifying the bug is still present in the current source
- **Rule #5** — task is not done until `npm run check` exits 0
- **Rule #6** — code within Vercel Hobby caps (2048 MB / 10 s / 4.5 MB payload)
- **Rule #7** — no workarounds, no deferrals, no backward compat hacks (see § below)

### Per-task loop (repeat for every task)

```
1. PLAN      Write 3–5 bullets: what files change and why.
2. CODE      Implement the smallest correct change.
3. REFACTOR  Apply PER-SESSION REFACTOR CHECKLIST to every file you opened.
4. CHECK     npm run check → 0 errors (full quality gate per CLAUDE.md Rule #5)
5. VERIFY    Visual confirm in browser — do not mark ✅ on check pass alone
6. SEED+IDX  Update seed file / SeedPanel / firestore.indexes.json in this same commit
7. COMMIT    fix/feat/wire/seed(scope): one-line description  (one task per commit)
8. TRACKER   Mark task ✅ in crud-tracker.md, fill Part#, add one-line done note + timestamp
9. NEWCHANGE Prepend task entry to newchange.md (scope, files changed, deferred items)
10. PROMPT   Update 🔄 CURRENT task status in this file
```

### End-of-session checklist (before the deploy commit)

```
□ TSC        npx tsc --noEmit passes in BOTH repos.
□ AUDITS     npm run check:audits exits 0 (4 audit scripts).
□ LINT       npm run check:lint exits 0.
□ RECHECK    Scroll back through the session — every change discussed is actually in code.
             If something was discussed but not implemented, add a ⏳ entry in crud-tracker.md.
□ QUALITY    Refactor checklist applied to every touched file — tokens, ROUTES, wrappers,
             SSR layering, repo hooks, role gates, seed sync.
□ SEED       seed-data.ts + SeedPanel updated for every schema change made this session.
□ FIREBASE   firestore.indexes.json updated + firebase-merge.mjs run if any new multi-field
             query landed. Never edit root firestore.indexes.json directly.
□ FUNCTIONS  If functions/ touched: firebase deploy --only functions
□ INDICES    If indexes touched: firebase deploy --only firestore:indexes
□ TRACKER    Every task marked ✅ with one-line note + timestamp; session row marked ✅.
             Summary task count updated. Pending rows still carry `→ S<n>` annotation.
□ NEWCHANGE  newchange.md prepended with session entry: scope + files-changed table + deferred.
□ PROMPT     This file: move session to LAST COMPLETED (keep only 1 block); set CURRENT to
             next session's S<n>; drop oldest block if more than 1 exists.
□ MEMORY     memory/project_status.md prepended with one-bullet summary of what changed.
□ APPKIT     npm run build in appkit/ — dist/ up to date. Do NOT npm publish unless asked.
□ COMMIT     One logical unit per commit. Docs commit may follow code commit. Never batch
             unrelated tasks. Never commit with TS errors. Never use --no-verify.
□ DEPLOY     After user confirms: vercel --prod (auto-deploy is disabled).
```

---

## CODE STANDARDS

### No hardcoded values — ever

| What | Wrong | Right |
|------|-------|-------|
| Colors | `#6366f1`, `rgb(99,102,241)` | `var(--appkit-color-primary)` |
| Z-index | `z-[50]`, `z-index: 50` | `var(--appkit-z-modal)` |
| Breakpoints | `@media (min-width: 768px)` | `@screen md { }` |
| Spacing | `p-[44px]` | named token class or `var(--appkit-size-*)` |
| Font size | `text-[10px]` | `var(--appkit-font-size-2xs)` |
| Shadows | `shadow-[0_4px_12px_...]` | `var(--appkit-shadow-md)` |
| Route strings | `href="/products"` | `href={ROUTES.PUBLIC.PRODUCTS}` |
| API paths | `fetch("/api/products")` | `fetch(API_ROUTES.PRODUCTS.LIST)` |

### Component usage

```tsx
// HTML wrappers — always use these, never raw divs/spans in feature components
<Div>  <Row>  <Stack>  <Text>  <Heading>  <Section>  <Container>

// Navigation — never onClick+router.push
<Link href={ROUTES.*}>                      // plain link
<Button asChild><Link href={ROUTES.*}>      // styled-button link

// Modals/drawers — choose by field count
0 fields  → ConfirmDeleteModal
1–2 fields → Modal
3+ fields  → SideDrawer

// Data display
Missing data → empty state component, never crash or white screen
Optional props → always have a default value
```

### Route & CRUD conventions

```
Standard page set:
  /resource/page.tsx              → list
  /resource/new/page.tsx          → create
  /resource/[id]/edit/page.tsx    → edit

NEVER create page.tsx at a path that also has [[...action]] — Next.js rejects it
NEVER use [[...action]] catch-alls for new routes
All route strings → ROUTES.* constants (appkit/src/next/routing/route-map.ts)
All API paths → API_ROUTES.* constants (src/constants/api.ts)
```

### Store identity

```
Public routes + UI    → storeId / storeName / storeSlug  (never sellerId / ownerId)
Admin routes only     → may also show ownerId (Firebase UID)
Internal server only  → sellerId (= Firebase UID, never returned in API responses)
```

### User roles (current — replaced by RBAC permission system in S9)

```
user       → buyer, no store
seller     → has ≥1 store; role set on store creation
moderator  → content moderation sub-role
employee   → staff; access via permissions[] array
admin      → bypasses all permission checks

Every protected route uses requireRoleUser/Seller/Admin today, tagged with
`// TODO(RBAC)`. S9 sweeps every tag to replace with hasPermission(user, PERM.*).
```

### Content

```
Brand name: "LetItRip" — always this casing (never "LetiTrip" / "Letitrip")
Grep after every content update: grep -r "LetiTrip\|Letitrip" src/
Copy must reference real collectibles: Pokémon TCG, Hot Wheels, Beyblades, anime figures
```

### Form quality (every editor form)

```
□ MOBILE   375px — no overflow, no clipped inputs
□ TABLET   768px — responsive grid kicks in
□ DARK     All labels/textareas/helper text have dark: variants
□ TOKENS   No hex/rgb — var(--appkit-color-*) or Tailwind semantic
□ FOCUS    Focus rings visible on all interactive elements
□ ERRORS   Error states: red border + error message
□ LOADING  Submit shows isLoading + disabled; no double-submit
```

### Seed + Firebase sync (any schema change)

```
1. Update seed file          appkit/src/seed/<collection>-seed-data.ts
2. Update SeedPanel          src/components/dev/SeedPanel.tsx
   · FieldDef[] array for the collection
   · slugPattern chip if ID format changed
   · mediaFields chips if new image/video fields added
   · PII label if new personally-identifiable fields added
3. Update Firestore indexes  appkit/firebase/base/firestore.indexes.json (never edit root directly)
   · Run firebase-merge.mjs after editing
   · Run firebase-delete-indexes.mjs before deploy if getting 409 errors
4. Update sievejs config     if new filter/sort param added
5. Deploy in same session    firebase deploy --only firestore:indexes
```

### appkit build cycle

```bash
# Local dev — no npm publish needed
npm run watch:appkit   # terminal 1: compiles appkit/src/ → appkit/dist/ on save
npm run dev            # terminal 2: Next.js picks up dist/ changes live
npm run check          # must pass before every commit (tsc + audits + eslint)

# Publish only when user explicitly asks
# See CLAUDE.md "Appkit Local Dev vs Publish Rules" for full checklist
```

### Vercel Hobby caps (Rule #6 — non-negotiable)

```
API routes        paginate ≤50, ≤3 sequential Firestore round-trips, no .findAll().map()
Server actions    same — parallelize via Promise.all, hand off heavy work to functions/
Uploads           never via Next.js — signed URL → Firebase Storage → media slug return
Caching           every public GET → Cache-Control: public, s-maxage=, stale-while-revalidate=
Heavy work        PDFs, sharp, batch settlements, payouts → functions/ (60 s ceiling)
```

---

## QUICK REFERENCE

### Key files

| What | Where |
|------|-------|
| Task tracker | `crud-tracker.md` |
| Session log + deferred | `newchange.md` |
| Slug prefixes + media + Hobby caps + SSR architecture | `CLAUDE.md` |
| Seed files | `appkit/src/seed/` |
| Seed API route | `src/app/api/demo/seed/route.ts` |
| SeedPanel UI | `src/components/dev/SeedPanel.tsx` |
| API constants | `src/constants/api.ts` (`API_ROUTES`) |
| Route constants | `@mohasinac/appkit/client` → `ROUTES` |
| Nav group configs | `src/constants/navigation.tsx` |
| SEO metadata helpers | `src/constants/seo.server.ts` |
| Action constants | `appkit/src/features/products/constants/action-defs.ts` |
| RBAC permissions | `appkit/src/features/auth/permissions/constants.ts` |
| Firestore indexes (source) | `appkit/firebase/base/firestore.indexes.json` |
| Functions | `functions/src/` |
| Public layout shell | `src/app/[locale]/LayoutShellClient.tsx` |

### Reference implementations (slot-shell render-prop wiring + full CRUD pair)

```
src/app/[locale]/events/[id]/page.tsx             ← detail page (all render props wired)
src/app/[locale]/admin/events/page.tsx            ← admin list (full CRUD)
src/app/[locale]/admin/events/new/page.tsx       ← admin create
src/app/[locale]/admin/ads/[id]/edit/page.tsx     ← admin edit
src/app/[locale]/store/products/new/page.tsx     ← seller create
src/app/[locale]/search/page.tsx                  ← SearchView with renderXxx wiring
```

### Commit format

```
fix(scope): description
feat(scope): description
wire(scope): description
seed(scope): description

- file A — what changed
- file B — what changed
- Root cause / reason: one sentence
```

One task per commit. Never batch tasks. Never commit with TS errors. Never push half-shipped to `main`.

---

## WHAT NOT TO DO

```
✗ Make autonomous decisions — stop, write intent, wait for confirmation (CLAUDE.md Rule #1)
✗ Trust a ✅ tracker entry without re-reading the source file (CLAUDE.md Rule #2/4)
✗ Mark ✅ while any spec bullet is unbuilt — create a new ⏳ task or defer explicitly
✗ Leave stale "remaining: old-task-ID" notes on ✅ entries
✗ Refactor or add abstractions beyond the current task — BUT apply the per-session refactor
  checklist to files you've already opened in the same commit
✗ Add comments explaining what code does (names explain what; comments explain non-obvious why)
✗ Use dangerouslySetInnerHTML — use RichText or RichTextRenderer instead
✗ Cast as unknown as Foo — fix the type; if uncertain, ask
✗ Use onClick={() => router.push(...)} — use Link or Button asChild+Link
✗ Hardcode any route string — use ROUTES.* / API_ROUTES.* constants
✗ Import firebase-admin in index.ts or client.ts — server.ts only (Turbopack client-bundle trap)
✗ Add @import of node_modules CSS in globals.css — import via JS in layout.tsx instead
✗ Edit root firestore.indexes.json directly — edit appkit/firebase/base/ then run firebase-merge.mjs
✗ Push half-shipped state to main — every commit on main must be prod-deployable
✗ Run git push unless the user asks
✗ npm publish appkit unless the user explicitly asks
✗ Run vercel --prod unless the user explicitly asks
✗ Skip pre-commit hooks (--no-verify) or signing (--no-gpg-sign)
✗ Keep more than 1 LAST COMPLETED block in this file — drop oldest on every session end
```
