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

## 📋 SESSION STATE (single source of truth for "where are we")

> Keep exactly **1 LAST**, **1 CURRENT**, and a short **NEXT** list. Update on every commit.

### ✅ LAST COMPLETED — SB-UNI tracker planning (2026-05-13)

Planning-only session: added new **Tier SB-UNI — Platform Model Restructure** section to `crud-tracker.md` with 41 ⏳ rows across Phases 0–9. **Primary cohort is a single new session `S-SBUNI`** covering Phase 0 (X1–X3 infra) + Phase 1 (A/B/C/D/V/E collection unifications). **Z1–Z3 media upload reliability appended to `S7-PrizeDraws-3`** as a prerequisite — media upload is broken across all listing types (Rule #6 violation: route does `request.formData()` for files >4.5 MB Vercel cap), can't wait for follow-up sessions. **Phases 2–8 NOT slotted into specific sessions** — pulled individually as priorities emerge (CTA registry, FormShell, marketplace expansion, catalog/offer split). Plan file at `~/.claude/plans/like-we-c-created-transient-reef.md` carries full design rationale + 14 confirmed user decisions + deferred-decision log. No code changes this session.

Primary cohort scope (S-SBUNI single session):
- **Phase 0** infra — `assertNever` + `LISTING_TYPE_CAPABILITIES` capability registry + listing-type plugin folder layout + `schemaVersion` field on every Firestore doc.
- **Phase 1** unification — addresses top-level (`ownerType`), sublistings + brands + bundles fold into `categories` (`categoryType: "category"|"brand"|"sublisting"|"bundle"`), `GroupedListingDocument` re-scoped as theme-group (drop pricing fields, add min-2-active visibility rule), duplicate `bundles/` feature folders deleted entirely, discriminator audit cleanup (`moderator` role grep, missing query helpers, index field-name drift). Sequence inside session: X1 → X2 → X3 → B → C → D → V → E → A.

Re-points flip several ✅ rows to ⚠️ done-but-verify: F2 (Brands schema/API/admin), VB7 (Store Addresses CRUD), LL4 (UserAddressesView), LL17 (AdminStoreAddressesView), VD6 (Brands listing page), I1 (InlineCreateSelect brand quick-create), SB1-A (ListingType enum drops `"bundle"`), SB3-D/G/J (bundle stock sync + admin pages + Zod repoint at categories), SB11 (homepage bundle sections), GP1/GP2 (grouped listings schema).

### 🔄 CURRENT — none (awaiting next session)

Next session is `S7-PrizeDraws-3` (existing in-flight cohort + Z1–Z3 media upload prereq). `S-SBUNI` follows whenever scheduled.

### ⏳ NEXT UP — single SB-UNI session + Z1–Z3 appended to S7-PrizeDraws-3

| # | Session | Scope | Why this slot |
|---|---------|-------|---------------|
| 1 | **S7-PrizeDraws-3** | Carry from S7-PrizeDraws-2: **SB7-D leftovers** — admin products list tabs + store-dashboard listings tabs + search-results tabs (incl. prize-draws + bundles); **SB7-C bundles-tab** once `BundlesIndexListing-by-category` exists; **SB10-A** centralised `CATEGORY_PAGE_TABS` constant; **SB6-D post-auth badge** "X/Y entries used" for authed buyer; **SB8-F back-end population** — extend checkout actions (`prize-bundle-gates.ts` / `createCheckoutOrderAction` + Razorpay) to write `OrderItem.listingType` + `prizeRevealStatus` + `prizeRevealDeadline` when an entry is purchased; **Q1-funcs-dryrun + Q1-ops** firebase deploy (7 new functions + listingProcessor) + Vercel env (`FIREBASE_FUNCTION_LISTING_URL`, `LETITRIP_INTERNAL_SECRET`), Firestore indices for prize-draws + entries, re-seed `/demo/seed`. **PLUS appended 2026-05-13 — SB-UNI-Z1 + Z2 + Z3** (media upload reliability — signed-URL flow replacing `/api/media/upload`; MIME widening to allow 3gpp/3gpp2/x-matroska; limits centralized in `_internal/shared/media/limits.ts`). Resolves Rule #6 violation. Media upload is broken across all listing types and must be fixed before any new form work. | Finish prize-draws cohort + fix media upload as a single deploy |
| 2 | **S-SBUNI** *(new, single session)* | **Tier SB-UNI Phase 0 + Phase 1** — Future-expansion infra (X1 `assertNever` + `LISTING_TYPE_CAPABILITIES` registry; X2 listing-type plugin folders under `_internal/shared/listing-types/`; X3 `schemaVersion` field + per-feature `migrations.ts` shells) + collection unification (B sublistings → `categoryType:"sublisting"`; C brands → `categoryType:"brand"`; D bundles → `categoryType:"bundle"` with `bundleQueryRule` + drop `listingType:"bundle"` + `CartItem.listingType` "bundle"; V `GroupedListingDocument` re-scope (drop bundle-pricing fields, add `groupTheme`/`minActiveMembers`/`activeMemberCount`/`visibilityStatus`) + delete duplicate `appkit/src/features/bundles/` + `_internal/server/features/bundles/` + `_internal/shared/features/bundles/` folders + new `onProductStockChange` Function; E discriminator audit cleanup incl. `moderator` role grep + listingType helpers + index field-name drift fix; A addresses top-level with `ownerType` + delete user+store subcollections). Sequence: X1 → X2 → X3 → B → C → D → V → E → A. Seed-only, no live data, **delete-outright** (no compat shims). Flips F2/VB7/LL4/LL17/VD6/I1/SB1-A/SB3-D/SB3-G/SB3-J/SB11/GP1/GP2 to ⚠️ done-but-verify with re-point notes. | Single prod-deployable cohort — see plan + Tier SB-UNI section in `crud-tracker.md` for full design |
| – | **Tier SB-UNI follow-ups** *(pull individually when prioritised)* | Phase 2 (F: ListingType union extends to `classified`/`digital-code`/`live`) · Phase 3 (G–K: TCGPlayer grading, eBay hybrid auction+BIN, classified fields, digital-code subcollection, live-item jurisdiction) · Phase 4 (L: Amazon-style catalog/offer split — 2-cohort) · Phase 5 (M–O: per-type checkout flows) · Phase 6 (P–T: SeedPanel sweep + per-type views + cart awareness + search facets) · Phase 7 (W-1…W-5: CTA registry + 5-wave sweep + lint rule) · Phase 8 (Y-1…Y-7: FormShell + 7-cluster migration) · Phase 9 polish (Z4: HEVC hint; Z5: MediaUploadField error UX) · X4 feature flags + X5 telemetry. | Each is its own cohort — slot when ready |
| 3 | **S8** | Event Raffles + tab constants + homepage sections: SB9 + SB10 + SB11 | Final SB tier completion |
| 4 | **S9** | RBAC complete (RBAC1–10) + inline retrofit of every `TODO(RBAC)` tag left by S1–S8 | Permission system end-to-end |
| 5 | **S10** | BAN (BAN1–9) + SCAM (SCAM2/4/6–9) | Governance / moderation |
| 6 | **S11** | Quality baseline — drive `audit-ssr-in-appkit` baseline 8→0 + TS9 hex sweep (154 hits) + RA-Tier audits applied inline | Tech-debt closeout |
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
