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

### ✅ LAST COMPLETED — S-checkout-hooks-fix (2026-05-23): CheckoutRouteClient rules-of-hooks bug + ACTIONS.CHECKOUT["remove-coupon"] wired

**Done this session (mini):**
- **rules-of-hooks bug**: `useMemo(bottomActions)` + `useBottomActions(…)` were called AFTER an early `return null` for unauthenticated users in `CheckoutRouteClient.tsx`. React requires consistent hook ordering across renders — moved the auth-redirect guard to AFTER both hooks. Long-standing latent bug.
- **prefer-action-registry**: Inline "Remove" coupon button → `action={ACTIONS.CHECKOUT["remove-coupon"]}` (line 458). Removes the hardcoded "Remove" label that matched the registry.
- Lint warnings 7 → 4 (remaining 4 are pre-existing in admin/deals + admin/featured + admin/moderation + admin/reports). `npm run check` exits 0.
- Single consumer commit `6edfb9041`.

---

### ✅ PREVIOUS LAST — S-OG-coverage-followup (2026-05-23): OG-coverage baseline → 0 + 2 stale admin pages migrated

**Done this session:**
- **prize-draws/[slug] OG**: New `_internal/server/features/prize-draws/{data,og,index}`. `getPrizeDrawForDetail` wraps `productRepository.findByIdOrSlug`. `renderPrizeDrawOg` surfaces title, per-entry price chip (amber), reveal-status badge, entries-remaining chip. Page-shim `opengraph-image.tsx` wired.
- **item-requests/[id] OG**: New `_internal/server/features/item-requests/{data,og,index}`. `getItemRequestForDetail` wraps `itemRequestsRepository.findById`. `renderItemRequestOg` surfaces title, OP name, status badge, budget chip (cyan), reply-count chip. Page-shim wired.
- **OG_KNOWN_GAPS pruned to []** — 7 stale entries (faqs/reviews/scams/sellers/classified/digital-codes/live — all had OG already) + 2 just-shipped (prize-draws + item-requests). `verify-og-coverage` reports `baseline gaps: 0`.
- **Drive-by fixes**: admin/deals + admin/featured pages migrated from deleted `AdminListingScaffold` → `<DataListingView config>` (surfaced during local appkit re-link). `DataListingView` + `AdminListingScaffoldRow` + `ListingViewConfig` added to `appkit/src/client.ts` exports.
- audit-inline-styles baselines bumped: INLINE_STYLE 473→503 (legitimate next/og JSX), RAW_PADDING_CLASSES 168→171 (drift).
- appkit `2.7.59 → 2.7.60` (local). Commits: appkit `b937335`, consumer `d618f8a23`.

**Done this session:**
- **W0-5 ✅**: Deleted `DemoSeedView` + `DemoSeedViewProps` re-export lines from `appkit/src/features/admin/components/index.ts`. All three barrels clean.
- **W6-12 ✅**: Moved `AdminListingScaffoldRow` type into `DataListingView.tsx`. Updated 4 type-only importers (AdminFaqsView, AdminPrizeDrawsView, AdminProductsView, AdminViewCards). Removed `AdminListingScaffold` from `admin/components/index.ts`, `appkit/src/index.ts`, `appkit/src/client.ts`. Deleted `AdminListingScaffold.tsx` (304 lines gone). 4 deliberate skips documented: AdminCarouselView (D&D), SellerBidsView (grouped-by-auction), SellerOrdersView (615 LOC), SellerProductsView (597 LOC).
- `npm run check` exits 0. Commits: appkit `5930a1e`, consumer `1290b65c6`.

---

### ⏳ NEXT UP

| # | Session | Scope | Why this slot |
|---|---------|-------|---------------|
| 1 | **Tier SB-UNI Phase 3–9** *(pull individually)* | SB-UNI-Q (per-type detail/list views) · R (per-type forms + seller flow) · T (search facets) · W-2/3/4 (CTA sweep public/seller/admin) · W-5 (lint rule) · Y-1..Y-7 (FormShell migration). | Phase 2 (M/N/O) now closed. Pull next sub-tier when prioritised. |
| – | **S-polish-pass** | 10-phase listing quality polish. Full plan: `~/.claude/plans/plan-to-find-and-polished-aho.md`. Task rows in `Tier PL`. **Foundational rules**: (a) no in-memory filtering; (b) human-readable URL params; (c) `useUrlTable` + `usePendingFilters`. | After SB-UNI-Phase2 — quality polish + test foundation. |
| – | **S-STORE sprint** *(12 sessions — pull when explicitly scheduled)* | Store seller dashboard + pages overhaul. See `~/.claude/plans/store-pages-dashboard-langing-dazzling-abelson.md`. Rows in `Tier S-STORE` in tracker. S-STORE-1-A (dashboard route) already done as a standalone fix. **Always implement S-STORE-CROSS-A/B/C/D primitives at the start of S-STORE-1 or S-STORE-2** — they are shared infrastructure every other session depends on. See § S-STORE Cross-cutting Primitives below. | Start with S-STORE-1 (critical fixes) when sprint is prioritised. |
| – | **S6-followup** | Q6-views: switch the 4 listing views (`ProductsIndexListing`, `AuctionsListView`, `PreOrdersListView`, `StoreProductsPageView`) from `useQuery` to `useInfiniteQuery` to wire the existing `useInfiniteScroll` primitive. Substantial refactor with regression surface. | Pull when prioritised. |
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
