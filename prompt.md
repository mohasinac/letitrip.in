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
□ CHECK         npm run check exits 0 before the session is marked ✅. (Rule #5)
```

---

## 🚢 PER-SESSION PROD-DEPLOY CHECKLIST (run before the closing commit)

```
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
1. Commit all appkit source changes (no uncommitted source — dist must match git)
2. Bump appkit/package.json version by exactly +0.0.1 (patch only, never minor/major)
3. cd appkit/ && npm run build          # rebuild dist/ from committed source
4. npm publish                          # single publish per session — never publish twice
5. cd ..
```

### Step 3 — Switch letitrip to npm package + rebuild

```
1. Edit letitrip/package.json: "@mohasinac/appkit": "^X.Y.Z"  (new version from Step 2)
2. Delete package-lock.json
3. npm install                          # lockfile must resolve from npm registry (not file:)
   └── Verify: package-lock.json shows "resolved": "https://registry.npmjs.org/..."
               not "resolved": "appkit" + "link": true
4. npm run check                        # must still exit 0 with npm package
```

### Step 4 — Sync Vercel env variables

```
1. List env vars added this session — check src/app/api/**/*.ts for new process.env.*
2. For each NEW var: vercel env add VAR_NAME production preview development
3. For each CHANGED var: edit in Vercel dashboard → Settings → Environment Variables
4. Pull and verify locally: vercel env pull .env.local
```

### Step 5 — Deploy to Vercel prod

```
vercel --prod
```

Auto-deploy is **disabled** (`vercel.json` → `"deploymentEnabled": false`). Always deploy via CLI.
After deploy: smoke-test the production URL for all touched routes.

---

## 📋 SESSION STATE (single source of truth for "where are we")

> Keep exactly **2 LAST** entries, **1 CURRENT**, and a short **NEXT** list. Update on every commit. Older history lives in `newchange.md`.

### ✅ LAST COMPLETED — S-auth-nav: Login/Register cross-links + TitleBar auth buttons + avatar fix + role badge + employee role + seed users (2026-05-14)

- **LoginPageClient** — added `renderCreateAccountLink` (→ `/auth/register`) + `renderForgotPasswordLink` to `<LoginForm>`.
- **RegisterPageClient** — added `renderLoginLink` (→ `/auth/login`) + `renderTermsLink` to `<RegisterForm>`.
- **TitleBarLayout** — replaced `next/image` with `<img>` for profile avatar (any-domain support); added `loginHref`/`registerHref` props; shows "Sign in" + "Register" text buttons in TB1 desktop when user is not logged in.
- **AppLayoutShell** — added `registerHref` prop; passes `loginHref`/`registerHref` to `TitleBar`; replaced full-text `RoleBadge` avatar overlay with a compact 16px colored dot indicator (role initial letter, no text overflow).
- **LayoutShellClient** — passes `registerHref={ROUTES.AUTH.REGISTER}` to `AppLayoutShell`.
- **RoleBadge + Badge** — added `employee` to labels/colors/variant cast; added `appkit-badge--employee` amber CSS (light + dark).
- **Seed users** — added `avatarMetadata` (url+position+zoom) to 3 existing users (Aryan Kapoor, Priya Patel, Siddharth Rao); added `user-deepak-verma` (moderator) + `user-simran-kaur` (employee) with avatarMetadata.
- `appkit` rebuilt to v2.6.7 dist. `npm run check` exits 0.

### ✅ Previous — S-prod-fix: Firebase Lambda tracing + media watermark proxy + store encryption + seed auth gate (2026-05-14)

All prod 500s fixed. `npm run check` exits 0. **Deploy pending** — requires `vercel --prod` + `firebase deploy --only firestore:indexes` + `/demo/seed` Load All.

- **Fix 0** — `appkit/src/configs/next.ts`: replaced piecemeal `build/src/**` paths with broad `/**` org-level globs (`firebase-admin/**`, `@google-cloud/**`, `google-auth-library/**`, `google-gax/**`, `gtoken/**`, `jws/**`, `gaxios/**`). Fixed merge strategy (array-union per route key, not object-spread that replaced defaults). Default `remotePatterns` restricted to Firebase Storage + localhost; consumers extend. `next.config.js` thinned to zero overrides.
- **Fix 3** — Seed panel auth gate: `RoleGuard` on `demo/layout.tsx`, admin role check on `seed/route.ts` GET+POST, `isAdminUser(user)` in `LayoutShellClient.tsx`.
- **Fix 4** — External media watermark: `MEDIA_ENDPOINTS.EXT` + `EXT_URL` in appkit `api-endpoints.ts`. New `appkit/src/utils/media-url.ts` `resolveMediaUrl()` normalises Firebase Storage → `/media/<path>`, external URLs → `/api/media/ext?url=`. `getMediaUrl()` updated. Shared `src/app/api/media/_watermark.ts` extracts all watermark helpers. New `src/app/api/media/ext/route.ts` with SSRF guard (loopback + RFC-1918 + GCP metadata rejected), 8s AbortSignal, 10 MB body cap, watermark applied.
- **Fix 5** — `STORE_SECRET_FIELDS` constant in `pii-schemas.ts`. `StoreRepository` gains `encryptSecrets`/`decryptSecrets` helpers + `mapDoc`/`update`/`create`/`changeSlug` overrides for `whatsappConfig.accessToken` (AES-256-GCM via `encryptSecret`/`decryptSecret`).
- **Pre-existing TS errors fixed** — `support.repository.ts` (`.count()` → `.select().get()`, implicit-any reduce, `prepareForFirestore(message as unknown as Record<string, unknown>)`)  · `checkSoftBan.ts` + `server.ts` (`BannedAction` sourced from `permissions/constants` not re-exported `schemas/firestore`) · `hard-ban/route.ts` (`getProviders` → `getAdminAuth` + `findAll(obj)` → `findActiveByUser` / `findByOwnerId` / `findByStore` / `findBy`) · `unban/route.ts` (same `getProviders` fix) · `LayoutShellClient.tsx` (cast `user` for `isAdminUser`) · `support/tickets/route.ts` (`order.buyerId` → `order.userId`) · appkit dist rebuilt (v2.6.5, still file:./appkit).

### 🔄 CURRENT — Deploy: `vercel --prod` + `/demo/seed` reload (auth-nav session landed)

### ⏳ NEXT UP — bundle checkout finalize + Phase 2+ (S-SBUNI-4 closed 2026-05-13)

| # | Session | Scope | Why this slot |
|---|---------|-------|---------------|
| 1 | **S-SBUNI-RULES** *(one large prod-deployable session — single row under "Phase RULES" in `crud-tracker.md`; lands AFTER S-SBUNI-5 closes)* | **Per-type cart/checkout/order rule registry (XL — one session, single commit cohort).** Extracts every inline `listingType` / `categoryType` branch in cart-add / validate / preflight / splitter / checkout-actions / stock-decrement into one registry at `appkit/src/_internal/shared/checkout/rules/`. Internal sequence inside the session: RULES → SCHEMA → CONSUMERS → SHIPPING → CART-UI → REFUNDS → SMOKE. Brings: one Razorpay payment / N orders linked by `paymentBatchId` (internal ref — orders are the contract); per-store separation strict; **bundle moves to direct-checkout-only** (no cart entry, removes `addBundleToCart`); prize-draw splits orders when entries > `PRIZE_DRAW_MAX_REVEALS_PER_ORDER` (3) with own reveal flow per batch; pre-order reservation-quota preflight; auction/offer single-line / qty=1 / no merge; **full + partial refunds** with Razorpay + manual-with-proof override paths (terminal for contestability — once refunded, no dispute possible); **shipping provider choice moves into cart** per-store with per-item override (`<ShippingPicker>` per tab, subtotal includes chosen fee at cart-time, locked at checkout); `shipping-proof` + `refund-proof` media contexts via signed-URL flow (SB-UNI-Z1). Tabbed cart UI per orderType with `CHECKOUT_MAX_ORDERS_PER_TX = 20` cap. Buy ≠ refund transactions — separate ID spaces. **Full plan**: `~/.claude/plans/also-add-rules-for-golden-clarke.md`. | S-SBUNI-5's inline bundle work becomes the reference impl this refactor abstracts from. Phase 2+ listing types (`classified` / `digital-code` / `live`) then ship as one-rule-per-type additions with zero consumer-code edits — that's the payoff. |
| 2 | **S9** | RBAC complete (RBAC1–10) + inline retrofit of every `TODO(RBAC)` tag left by S1–S8 | Permission system end-to-end — next natural slot now that Phase 1 SB-UNI + S8 are closed |
| – | **Tier SB-UNI Phase 2+ follow-ups** *(pull individually when prioritised)* | Phase 2 (F: ListingType union extends to `classified`/`digital-code`/`live`) · Phase 3 (G–K: TCGPlayer grading, eBay hybrid auction+BIN, classified fields, digital-code subcollection, live-item jurisdiction) · Phase 4 (L: Amazon-style catalog/offer split — 2-cohort) · Phase 5 (M–O: per-type checkout flows) · Phase 6 (P–T: SeedPanel sweep + per-type views + cart awareness + search facets) · Phase 7 (W-1…W-5: CTA registry + 5-wave sweep + lint rule) · Phase 8 (Y-1…Y-7: FormShell + 7-cluster migration) · Phase 9 polish (Z4: HEVC hint; Z5: MediaUploadField error UX) · X4 feature flags + X5 telemetry. | Each is its own cohort — slot when ready. **Phase 1 is fully closed (S-SBUNI-5 2026-05-13).** **SB10-C fully closed S8 follow-up 2026-05-13.** |
| 4 | **S10** | BAN (BAN1–9) + SCAM (SCAM2/4/6–9) | Governance / moderation |
| 5 | **S11** | Quality baseline — drive `audit-ssr-in-appkit` baseline 8→0 + TS9 hex sweep (154 hits) + RA-Tier audits applied inline | Tech-debt closeout |
| 6 | **S-polish-pass** *(slot after S11)* | **10-phase listing quality polish pass.** Full plan: `~/.claude/plans/plan-to-find-and-polished-aho.md`. Task rows in `Tier PL` of `crud-tracker.md`. **Foundational rules** (apply to every listing page this session): (a) no in-memory filtering — all list ops at query layer (Firestore + Sieve or listingProcessor); (b) URL params always human-readable in the browser address bar (`sort=newest&type=auction&page=2`), translated to Sieve DSL internally by `parseListingSearchParams`; (c) all URL state via `useUrlTable` (instant: sort/page/toggles/view) + `usePendingFilters` (deferred: filter drawer). **Phases:** PL1 `SearchableEntitySelect` new appkit component + form wiring (brand/store/category/sublisting/bundle product picker for supported listing types only) · PL2 `ListingToolbar.toggles` prop + `isSold`/sold-out URL-driven toolbar toggles on product/auction/pre-order/bundle listing views + `AdminBundlesView` full `ListingViewShell` upgrade · PL3 orphaned view shell audit + deletion (zero imports + not in future plan = delete) · PL4 missing admin editor pages (`/admin/users/[id]/edit`, `/admin/stores/[id]/edit`, `/admin/orders/[id]`) · PL5 bespoke admin page upgrades (carousels search/pagination, sublisting-categories scaffold, deals+featured sort+bulk) · PL6 in-memory filter elimination (wishlist page → query-layer API with Firestore composites, history tab → query or documented ≤50-row exception) + "coming soon" sweep · PL7 LR-tier 35-file migration (raw HTML → `<Div>/<Text>/<Heading>/<Button>/<MediaImage>/<Stack>/<Row>`) · PL8 Sieve/Firebase adapter fixes (double-query fix, incompatibility doc, `callListingProcessor` extraction to `src/lib/listing-processor.ts`, readable-param translation audit, `validateSieveFilters` to all public list routes) · PL9 listingProcessor extended to blog/events/stores/categories/faqs/coupons/store-products/store-auctions routes · PL10 Vitest setup + unit tests (filter-aliases, validateSieveFilters, listingProcessor, coupon expiry, order timeout, media cleanup, UI tests for ListingToolbar/SearchableEntitySelect/BulkActionBar). | After S11 — quality polish + test foundation |
| – | **S6-followup** | Q6-views: switch the 4 listing views (`ProductsIndexListing`, `AuctionsListView`, `PreOrdersListView`, `StoreProductsPageView`) from `useQuery` to `useInfiniteQuery` to wire the existing `useInfiniteScroll` primitive. Substantial refactor with regression surface. | Pull when prioritised |
| – | **OG-coverage-followup** | Drive `verify-og-coverage.mjs` baseline to 0 — per-feature OG renderers for `bundles/[slug]` (now category route post-SB-UNI-D), `faqs/[category]`, `reviews/[id]`, `scams/[id]`, `sellers/[id]`. | Pull when prioritised |
| – | **S1-polish** | Optional slot-shell polish slots deferred from S1 (admin alerts/charts/recent-activity, user notifications filters, seller analytics charts/top-products). Feature work — new endpoints + hooks. | Pull when prioritised |
| – | **S2-browser-smoke** | User-driven browser smoke for S2 — sign in → cart → consent OTP → COD + Razorpay test card → coupon → auction-add-to-cart-block. Then `vercel --prod`. | One-off post-S2 validation |

**Post-beta backlog** (not in S1–S11; pull only when explicitly scheduled):
AK1–3 (DI refactor) · AP1–16 (GoF patterns) · LP1–3 (custom ESLint rules) · Tier DX 38 tasks (`docs.letitrip.in` portal) · EMG1 → Tier PAY (EMI/installments) · EMG4 → Tier CHAT (live chat) · EMG2/EMG3 (loyalty + gift cards holding bay)

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
- **Rule #6** — code within Vercel Hobby caps (1024 MB / 10 s / 4.5 MB payload)

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
