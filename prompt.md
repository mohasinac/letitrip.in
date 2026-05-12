# letitrip.in — Master Working Prompt (Lane A · CRUD)

> **Paste at the start of every CRUD-lane session.** Lane B (SSR) uses `ssrprompt.md`.
> Task status → `crud-tracker.md` (authoritative) · Deferred → `newchange.md` DEFERRED table · Architecture → `INSTRUCTIONS.md` · Slugs/media → `CLAUDE.md` · Lane plan → `~/.claude/plans/what-do-you-think-abundant-turing.md`

---

## 📌 UPDATE-CADENCE RULE (READ FIRST, EVERY SESSION)

**This file MUST be updated:**

1. **Before every commit** — the LAST / CURRENT / NEXT block below must reflect what the commit just did. If you commit without updating this file, the next session loses the thread.
2. **At session end** — collapse the prior CURRENT into LAST (keep only ONE last block), set CURRENT to the next ⏳ task, and prune the NEXT list.
3. **When Lane B (SSR) finishes any session that affects a feature also on the CRUD roadmap** — re-read `ssrprompt.md` LAST block and copy any cross-lane note here under `[CROSS-LANE NOTES]`.

Skipping this rule is the same as breaking CLAUDE.md Rule #1.

---

## 📋 LANE A — SESSION STATE (single source of truth for "where are we")

> Keep exactly **1 LAST**, **1 CURRENT**, and a short **NEXT** list. Update on every commit.

### ✅ LAST COMPLETED — S14–S21 + S45 + SB1 data layer (2026-05-12)

Single long arc this date. Eight session-IDs of work, each its own commit.

- **S14 P24** — auctions 11→20, bids 26→60 via `buildBidLadder()`; pre-orders 8 left near-met.
- **S15 P25** — categories 23→33 via `mkLeaves()`; remaining 22 deferred.
- **S16 P28** — blog 8→20 (12 rich posts), eventEntries 14→25; events 17 + FAQs 53 near-met (skipped).
- **S17 P29** — coupons 10→20, notifications 10→40 via `buildNotificationBatch()`, carts 5→15 via `mkCart()`; guest carts dropped (Zod/TS type gap); wishlists skipped.
- **S18 P31** — seed runner validator hook (`validate(doc) => string[]`) + dry-run diff (`db.getAll` 30-doc chunks) + bounded retry (`isRetryableError` heuristic) + `SeedAbortedError`. PII masking already-better-implemented (AES-256-GCM beats spec's sha256).
- **S45 EMG** triage — EMG1+EMG4 🎯 ready-to-graduate, EMG2+EMG3 ⏳ holding, EMG5 🚫 deleted.
- **S19 SB1 schemas** — additive `ListingType` (+ prize-draw, + bundle), `PrizeDrawItem`, BundleDocument feature, OrderDocument prize/bundle fields.
- **S20 SB1 surface** — `bundlesRepository` (180 LOC, txn `markItemSold`, array-contains `findContainingProduct`), 14 ROUTES, 5 API_ROUTES, 8 new composite indexes.
- **S21 SB1-G data** — productRepository LISTING_TYPE_VALUES + scope-alias rewrites; seed wrappers stamp listingType on every doc; /api/products translates `?isAuction=true` to `listingType==auction`; new `isAuctionListing`/`isPreOrderListing`/`isStandardListing` predicates; bundles seed (3 entries) + SeedPanel meta + plumbing through manifest/SeedCollectionName/route. SB1-D 🚫 not-needed per user (no real data).

Tracker count: 162 → ~172 done (S14/S15/S16/S17/S18/S19/S20/S21/S45 closed; SB1-A/C/G/I ⚠️ partial; SB1-D 🚫).

### 🔄 CURRENT — none (between sessions; awaiting next-session kickoff)

**Critical pending work**:
1. **Phase-2 listingType consumer sweep** — 36 Lane A files reading `.isAuction`/`.isPreOrder` on product objects. Mechanical-but-careful — own focused session per logical area (products components, search columns/repo, action files, route handlers).
2. **Phase-3 Lane B `_internal/` migration** — 7 files in `appkit/src/_internal/server/features/{products,auctions,pre-orders}/` + jobs handlers. `[CRUD→SSR]` seam request filed at top of `newchange.md`.
3. **Phase-4 schema field removal** — coordinated commit dropping boolean fields + legacy indexes once Phases 2 + 3 land.

### ⏳ NEXT UP — Lane A queue (read `crud-tracker.md` Summary for full list)

| # | Session | Tier / Tasks | Goal |
|---|---------|--------------|------|
| 1 | **SB1 cleanup** | Phase 2 + Phase 4 (Phase 3 = Lane B) | Sweep 36 `.isAuction`/`.isPreOrder` reads → `isAuctionListing(p)` predicates; then drop schema booleans |
| 2 | **S21 forms** | SB2-A/B + SB3-A/B/C | ProductForm subcategory/video fix + BundleItemsPicker + BundleForm + NonRefundableConsentModal |
| 3 | **S22** | SB3-D–J | Bundle stock-sync + reverse refs + store/admin/public views + listing+detail pages + API routes |
| 4 | **S23–S24** | SB4-A–I | Prize draw editor + reveal API (crypto.randomInt) + PrizeRevealModal |
| 5 | **S25** | SB5-A–E | Nav constants + FAQ seed + seller guide pages + homepage section seed |
| 6 | **S26–S30** | SB6-A–E, SB7-A–D, SB8-A–F, SB9-A–I, SB1-L | Limits / badges / auto-refund Functions / Event Raffle / 7 Firebase Functions |
| 7 | **S31–S37** | RBAC1–RBAC10, BAN1–BAN9 | Permission gates + ban enforcement |
| 8 | **S38–S39** | SCAM2/4/6/7/8/9 | Admin scammer UI + SEO + notifications |
| 9 | **S40–S43** | GD1–GD22 | In-app guide pages |
| 10 | **S44** | OG1–OG5 | OpenGraph backlog (Lane B-exclusive — handoff candidate) |

### [CROSS-LANE NOTES]

_Empty._ Add an entry here when Lane B (SSR) ships something Lane A consumers should wire (new appkit data fn, new view prop, new server action). Format: `YYYY-MM-DD [SSR→CRUD] <one-line>`.

---

## 🛤️ LANE DISCIPLINE — READ BEFORE TOUCHING ANY FILE

This repo runs two parallel Claude sessions in separate worktrees. You are **Lane A (CRUD)**. Lane B (SSR) edits `appkit/src/_internal/server/**`, OG/sitemap/robots/manifest, Functions, and `ssr-arch-tracker.md` in a different worktree at the same time. Step on its files and you create a merge conflict it will silently lose.

### Lane A may write (CRUD)

- `appkit/src/features/**` — feature views, forms, schemas, repositories (add methods only)
- `appkit/src/seed/**`, `appkit/src/ui/**`
- `src/app/api/**` — API route handlers + their sibling `_transform.ts` / `_schemas.ts`
- `src/app/[locale]/**/page.tsx` for **render-prop wiring** (renderXxx slots, initialData props) when the feature is not on Lane B's active list
- `src/constants/**`, `src/components/**`
- `crud-tracker.md` — **exclusive owner**
- `newchange.md` — append-only, prefix each block `[CRUD]`

### Lane A is READ-ONLY on (do not write)

- `appkit/src/_internal/**` — Lane B owns. Call functions from here, do not add/move files.
- `appkit/src/server-entry.ts`, `appkit/src/client-entry.ts`, `appkit/src/configs/**`, `appkit/tsconfig.*.json`, `appkit/package.json` exports map
- `appkit/functions/**`
- `scripts/audit-ssr-in-appkit.mjs` (+ its baseline)
- Every `opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/[locale]/robots.ts`, `manifest.ts`
- `ssr-arch-tracker.md`

### Coordination protocol

Before touching any feature, read the top of `newchange.md` for the `[ACTIVE-FEATURES]` block:

```
[ACTIVE-FEATURES]
- products → Lane A (Tier V form polish)
- bundles → Lane B (S3 data layer)
```

- If your target feature is owned by Lane B, **pick a different task** — do not push through.
- When you start a task, prepend a line for your feature (`<feature> → Lane A (<tier> <task-id>)`); when done, remove the line in the same commit that closes the task.
- If Lane B added a new appkit function you need (data layer, adapter, server action) and it's missing, file the seam request as a one-line `[CRUD→SSR]` entry at the top of `newchange.md` and pick another task while you wait.

### Rebase cadence

At the start of every turn: `git fetch && git rebase origin/main`. Before every commit: `npm run check` exits 0. If you hit a merge conflict in a file Lane B owns, **abort the rebase and ping Lane B** — do not edit its file to resolve.

---

## SESSION STATE

### ✅ Last completed — S13 + follow-up (2026-05-12)

| Task | Summary |
|------|---------|
| Q1 | `functions/src/callable/listingProcessor.ts` — HTTPS Function in `asia-south1` (`x-internal-secret` auth, `minInstances:0`, `maxInstances:20`). Accepts `{ collection, q, f, s, p, ps, cursor, baseOpts }`. Cursor is opaque base64 of `{ page }`. Now dispatches to **20 collections** via a `LISTERS` table: products, categories, brands, orders, reviews, coupons, bids, payouts, blogPosts, events, faqs, notifications, scammers, sublistingCategories, productFeatures, homepageSections, users (direct) + stores (`baseOpts.activeOnly`), eventEntries (`baseOpts.eventId`), productTemplates (`baseOpts.storeId`). `ListingValidationError` → 400. Deployed to Cloud Run. |
| Q3 | `src/app/api/products/route.ts` — `callListingProcessor()` helper forwards to the Function when `FIREBASE_FUNCTION_LISTING_URL`+`LETITRIP_INTERNAL_SECRET` env are set; otherwise local `productRepository.list` fallback. `PUBLIC_LISTING_CACHE_CONTROL` constant matches Function-side header. `ids=` batch mode unchanged. **`/api/pre-orders` deferred** — current handler queries non-existent `preorders` collection; spec decision needed. |
| Q6 | `appkit/src/react/hooks/useInfiniteScroll.ts` — IntersectionObserver primitive (in-flight guard + auto-disable on `hasMore:false` + unmount cleanup). Exported from `@mohasinac/appkit/client`. **View wiring deferred** — `useProducts` (useQuery-based) → `useInfiniteQuery` refactor has too much regression surface across the 4 listing views to bundle with the hook. |
| Sieve aliases | `SieveOptions.aliases` plumbed through the Sieve adapter (`appkit/src/providers/db-firebase/sieve.ts`). `expandFilterAliases()` pure helper exported. `productRepository.FILTER_ALIASES` registered: `listingType==auction\|preorder\|product` (with `!=`), `scope==publicProducts\|publicAuctions\|publicPreorders\|published`, `promoted==true`, `featuredPublic==true`. Auto-applied inside `productRepository.list`, so the Vercel route, listingProcessor, and SSR views all benefit. |
| Ops | `firebase deploy` — listingProcessor live (asia-south1, public URL), `firestore.indexes.json` deployed (catches up Q5/S12 + S8 follow-up + S9 conversation indexes), `firestore.rules` + `storage.rules` released. `package.json` UTF-8 BOM stripped (was breaking tsup→esbuild→postcss). `functions/.gitignore` anchored `/lib/` so source `functions/src/lib/*.ts` is now tracked. |

### ✅ Last completed — TS Tech-Debt Sweep (2026-05-12)

| Task | Summary |
|------|---------|
| TS Phase 1 audit | Verified-done closed without code change: TS2 (Seller pickup uses StoreAddressSelectorCreate), TS3 (CartRouteClient coupon flow), TS4 (AdminCategoryEditorView InlineCreateSelect), TS5 (comma-tag input kept), TS6 (ProductFeaturesSelector wired), TS8 (`as unknown as SectionConfig` cast already removed), TS18 (Razorpay client flow already wired in `CheckoutRouteClient:157–233`). |
| TS9 | Deferred — `~/proj/letitrip.in` has **154** hardcoded hex hits in `.tsx` (audit estimated ~13). Scope blown; needs its own multi-commit color-purity session split by area. |
| TS1 | `CheckoutRouteClient.tsx` now passes `renderAddNew` to `CheckoutAddressStep`; `SideDrawer` + `AddressForm` + `useCreateAddress` wire inline create at checkout; empty state replaced with [+ Add new address]. |
| TS7 | Wrapped `/promotions/[tab]/page.tsx` and `/stores/[storeSlug]/products/page.tsx` in `ProductFeaturesProvider`. SearchResultsClient is orphan (unused after SR1 redirect). `/wishlist/page.tsx` (use-client) wrap deferred — needs server-wrapper refactor. RelatedProductsCarousel already inherits features from `ProductDetailPageView`. |
| TS10 | `UserWishlistRepository.getWishlistItems` now filters stale entries (Promise.all over `products/{id}.get()`) — silently drops snapshots whose source product has been deleted. |
| TS11 | `EventDetailView` gains `renderDescription`, `renderGallery`, `renderWinners` render-prop slots between header and content. |
| TS12 | `BlogPostView` gains `renderAuthorBio?: (post) => ReactNode` slot rendered above article content. |
| TS13 | New `POST/GET /api/preview` route (Firestore `previewDrafts/{token}` with 30-min TTL) + new `/[locale]/preview/[token]/page.tsx` resolver with draft banner. |
| TS14 | New admin-only `GET /api/admin/media?prefix=&pageToken=&pageSize=` at `src/app/api/admin/media/route.ts` using `getAdminStorage().bucket().getFiles({ prefix, maxResults, pageToken, autoPaginate:false })`. |
| TS15 | `AdminMediaView` embeds new `MediaBrowser` component above upload sandbox: prefix dropdown, filename search, paginated grid, Copy URL per tile. |
| TS16 | `MediaPickerModal` gains "Existing" tab between Upload and External URL — search + prefix filter + click-to-select + [Use selected]. |
| TS17 | ⏳ Pending user ops — run `firebase deploy --only firestore:indexes` to push pending composites. |
| TS19 | `npx tsc --noEmit` clean in both repos; tracker counts updated (149 → 159 done). Browser smoke-tests pending user. |

### 🔜 Current — S14 (next session)

> S13 done. Q1+Q3+Q6 shipped with Q3-pre-orders, Q6-views, and Q1-ops (Firebase deploy + Vercel env) deferred (see newchange.md). Roadmap continues at S14 (P24 — auctions 6→20 + pre-orders 5→10 + bids 20→120+ seed scale). After that, S15–S18 (more seed scale) then S19+ (SB Bundle/Prize Draw).
>
> **📐 New from 2026-05-12** — `crud-tracker.md` now carries a global **Task Shape (mandatory from S14 onward)** banner + per-tier layered shape blocks (Constants / Types / Validation / Data / Service / Actions / Repository / Orchestration / Views / Consumer wiring / OG + sitemap / Error handling / Verification) matching `ssr-arch-tracker.md`. **Two new tiers** added: **Tier OG** (OpenGraph image backlog audit — categories, faq, user, sub-listing, audit script) and **Tier EMG** (Emerging Patterns holding bay — first row **EMG1 EMI / installment payment** captures the seed-FAQ mention with no implementation). Two new sessions in the Next sessions table: **S44** (Tier OG) and **S45** (Tier EMG triage). Read these before starting any new feature work — every new task from S14 onward must conform to the layered shape and target `appkit/src/_internal/server/features/<x>/`.

### 🔜 Next sessions (S1–S13 shown; full table in crud-tracker.md)

| Session | Tasks | Goal | Risk |
|---------|-------|------|------|
| **S1** ✅ | SL6, ARCH9, VD3, HS4-E, A1-ext | Slug audit + field renames + per-store Google Reviews | zero |
| **S2** ✅ | D2, D3, LL4, LL5 | User account: addresses CRUD + order cancellation + listing views | zero |
| **S3** ✅ | VC2, VC4 | Invoice PDF + user settings tabs | zero |
| **S4** ✅ | G1, G2, O1 | Store templates CRUD + slug management | zero |
| **S5** ✅ | UX4, UX8, UX9 | PreviewPane + quick-edit drawer + InlineSelectCreate | zero |
| **S6** ✅ | ARCH1, ARCH6, ARCH7 | Strip sellerId from public API responses | low |
| **S7** ✅ | EX5, SB11-A–G | Collection Cards section type + 3 new homepage section types | low |
| **S44** ✅ | WL1–WL8 + follow-ups | Tier WL — Wishlist 20-cap + History 50-FIFO + Cart 50-cap + admin views | low |
| **S8** ✅ | FI1–FI6 | `productFeatures` collection + admin/store CRUD + card badges | low |
| **S9** ✅ | BK3, D5, VC7 | Compare overlay + Messages RTDB | low |
| **S10** ✅ | I6, I7 | PDF uploader + Media CDN watermark proxy | medium |
| **S11** ✅ | O5 | Shiprocket auto-create | medium |
| **S12** ✅ | Q5, Q2, Q4 | Firestore indexes deploy + param standardization | medium |
| **S13** ✅ | Q1, Q3, Q6 | listingProcessor Function + /api/products thin-proxy + useInfiniteScroll primitive. Q3-pre-orders + Q6-views deferred. | medium |
| **TS** ✅ | TS1–TS19 | Tech-debt sweep — verify-first closed 6 already-done; deferred TS9 (154 hex hits); implemented TS1/10/11/12/13/14/15/16/19; TS7 partial; TS17 ops pending | medium-high |
| **S14–S18** | P24–P31 | Seed scale (auctions/categories/blog/coupons/validator) | low |
| **S19–S30** | SB1–SB11, TC | Bundle + Prize Draw + Event Raffle system | high |
| **S31–S37** | RBAC1–RBAC10, BAN1–BAN9 | Permission gates + ban enforcement | high |
| **S38–S39** | SCAM2,4,6,7,8,9 | Admin scammer UI + SEO + notifications | medium |
| **S40–S43** | GD1–GD22 | In-app guide pages (store/buyer/admin) | zero |
| **S44** | OG1–OG5 | OpenGraph backlog: categories / faq / user / sub-listing detail OG + audit script | zero |
| **S45** | EMG1–EMG5 triage | Emerging Patterns review: graduate EMG1 (EMI) and any others to their own session, or delete if no longer relevant | zero |

---

## PLAN SNAPSHOT

```
139 tasks ✅ done · 258 remaining · 397 total (as of S7 done 2026-05-11)
Roadmap reorganized 2026-05-11 → 43 sessions S1–S43 (risk-ordered, all deferred integrated) — S1–S7 ✅

COMPLETED (sessions 60–93)
──────────────────────────────────────────────────
Foundation + Seed       60–64        ✅
Carousel                65           ✅
Homepage Sections       66–67        ✅
Admin CRUD              68–75        ✅
Public Catalogue        76           ✅
Seller Products         77           ✅
User Account Core       78           ✅
Cart Integrity          79           ✅
Store Settings + Fin    80–81        ✅
SEO + Lighthouse        82           ✅
Content + CustomFields  83–84        ✅  VD8/L1–L3 (VD9/VD10 deferred → S1/S2)
Sub-listings            85           ✅  SC1–SC4
Grouped Listings        86           ✅  GP1/GP2
Social Feed             87           ✅  S1–S5
Search + Routes         88           ✅  RC3/RC4
UX Polish + FAQ + WA    89a/89b      ✅
────────── 🚀 ALPHA on Vercel prod 2026-05-10 ──────────
Action constants        90           ✅  AX1
Color + Layout tokens   90c/91       ✅  X7a+X7b+X8a+X8b
Action URLs + bars      92           ✅  AX2+AX3 (usePanelUrlSync, 8 inline panels, FormActionBar)
Extended sections       93           ✅  EX1–EX4+YT1

PENDING (new S-numbering, risk-ordered)
──────────────────────────────────────────────────
Zero-risk UI            S1–S6        ✅  audits + user account + store forms + API sanitization
Homepage features       S7           ✅  EX5 + SB11 (collection-cards + 3 new section types)
Feature icons           S8           ✅  FI1–FI6 productFeatures collection (one-shot session)
UX + RTDB               S9           ⏳  BK3 compare overlay + Messages RTDB
Infrastructure          S10–S11      ⏳  PDF + watermark CDN + Shiprocket
Query/Sieve             S12          ✅  Q5 indices + Q2 short params + Q4 listing views
Query/Sieve             S13          ⏳  Q1/Q3/Q6 listingProcessor + infinite scroll
Tech-debt sweep         TS           ✅  Verify-first audit + 10 implementations; TS9 deferred (154 hex); TS17 ops pending
Seed scale              S14–S18      ⏳  auctions/categories/blog/coupons/validator
Bundle + Prize Draw     S19–S30      ⏳  SB1–SB11 + TC (largest feature — new collections)
RBAC + BAN              S31–S37      ⏳  security gates — do after all features stable
SCAM UI                 S38–S39      ⏳  admin scammer + SEO + notifications
In-app Guides           S40–S43      ⏳  GD1–GD22 (zero-risk static content)
──────────────────────────────────────────────────

⚠️  Firebase reset 2026-05-10 — re-seed all collections via /demo/seed
⚠️  RBAC/BAN/SCAM schemas done (additive) — UI deferred to S31–S39
⚠️  appkit via file:./appkit locally — do NOT npm publish unless user asks
```

---

## HOW TO WORK

### Before writing any code

```
1. Read crud-tracker.md → find the next ⏳ task for this session, mark it 🔄
2. Read newchange.md [ACTIVE-FEATURES] block → confirm Lane B is NOT on the same feature
3. Read newchange.md DEFERRED table → resolve any open gaps before new work
4. Read every source file you will touch — never code from memory or tracker descriptions alone
5. Run: npm run check → must exit 0 before you begin (tsc both repos + 4 audits + eslint)
6. If context feels fuzzy (too many files in mind) → STOP and start a fresh session
```

**CLAUDE.md rules are non-negotiable**:
- **Rule #1** — stop and ask before any autonomous decision / scope deviation
- **Rule #2** — ✅ does not mean working; re-read source, never trust the tracker
- **Rule #3** — schema/logic change updates every caller + seed + types in the same session
- **Rule #4** — never fix without first verifying the bug is still present in the current source
- **Rule #5** — task is not done until `npm run check` exits 0

### Per-task loop (repeat for every task)

```
1. PLAN      Write 3–5 bullets: what files change and why. Stop if a Lane B file appears.
2. LANE      Prepend [ACTIVE-FEATURES] line in newchange.md for this feature
3. CODE      Implement the smallest correct change
4. CHECK     npm run check → 0 errors (NOT just tsc — full quality gate per CLAUDE.md Rule #5)
5. VERIFY    Visual confirm in browser — do not mark ✅ on check pass alone
6. COMMIT    fix/feat/wire/seed(scope): one-line description  (one task per commit)
7. TRACKER   Mark task ✅ in crud-tracker.md, fill Part#, add one-line done note + timestamp
8. LANE-CLR  Remove the [ACTIVE-FEATURES] line in the same commit that closes the task
9. NEWCHANGE  Prepend task entry to newchange.md prefixed [CRUD] (scope, files changed, deferred items)
10. PROMPT   Update 🔄 CURRENT task status in this file
```

### Per-task checklist

```
□ TRACKER    Marked 🔄 at start; marked ✅ with note at end
□ DEFERRED   newchange.md DEFERRED table checked before starting
□ CODE       Implemented, tsc 0 errors, browser-verified
□ SEED       Seed file updated — or explicitly noted "no seed change needed"
□ FIREBASE   firestore.indexes.json updated if new query added; firebase-merge.mjs run
□ SIEVEJS    Sieve config updated if new filter/sort param added
□ SEEDPANEL  SeedPanel FieldDef[], slugPattern, mediaFields, PII label updated if schema changed
□ DIAGRAMS   asciiDiagrams.md updated/added if page or flow changed
□ INDEX      src/index.md + appkit/index.md updated if any component/hook/repo/constant added or renamed
□ COMMIT     Correct format, one task only, no TS errors
□ NEWCHANGE  newchange.md prepended after every task
□ PROMPT     This file updated (CURRENT status) after every task
```

### End-of-session checklist (before final commit)

```
□ TSC        npx tsc --noEmit passes in BOTH repos — fix every error before proceeding; never
             commit with TS errors

□ RECHECK    Scroll back through the ENTIRE session chat and every file touched — confirm that
             every change discussed is actually present in the code. No half-finished work, no
             discussed change left out. If something was discussed but not implemented, add a
             ⏳ entry in crud-tracker.md before closing.

□ QUALITY    Code review for maintainability on everything written this session:
             · HTML wrappers only — Div/Row/Stack/Text/Heading; no raw <div>/<span> in feature code
             · CSS variables only — var(--appkit-color-*), var(--header-height), var(--appkit-z-*)
             · No hardcoded hex/rgb/hsl colors anywhere
             · No hardcoded px breakpoints — use @screen md or Tailwind responsive prefixes
             · No arbitrary Tailwind values (p-[44px], text-[10px]) — use named tokens
             · No hardcoded route strings — use ROUTES.* constants
             · Rename any unclear identifier; remove dead code introduced this session
             · Split any function > ~40 lines into smaller focused units

□ SEED       appkit/src/seed/<collection>-seed-data.ts updated to match every schema change
             made this session. New required fields must have values in ALL seed documents.

□ SEEDPANEL  src/components/dev/SeedPanel.tsx updated if any collection schema changed:
             · FieldDef[] array for new/changed fields
             · slugPattern chip if ID format changed
             · mediaFields chips if new image/video fields added
             · PII label if new personally-identifiable fields added

□ FIREBASE   appkit/firebase/base/firestore.indexes.json updated for any new multi-field
             query or orderBy added this session. Run firebase-merge.mjs after editing.
             Never edit root firestore.indexes.json directly.

□ SIEVE      Sieve/query config updated if any new filter, sort, or search param was added.

□ INDEX      src/index.md AND appkit/index.md: add, update, or remove every component, hook,
             repository, constant, or action that changed this session. Both files are living
             documents — a reader must be able to discover any symbol from them.

□ DIAGRAMS   asciiDiagrams.md: add or update every diagram for any page, flow, or data model
             that changed this session.

□ TRACKER    crud-tracker.md: every task done this session marked ✅ with a one-line note and
             timestamp; session row marked ✅ Done; summary task count updated.

□ MEMORY     memory/project_status.md prepended with a bullet summary of what changed.

□ NEWCHANGE  newchange.md prepended with session entry: scope + files-changed table +
             deferred table.

□ PROMPT     This file: move session to LAST COMPLETED (keep only 1 block); set CURRENT to
             next session; drop oldest block if more than 1 exists.
             SKIP this step entirely if the session was a single small fix or hotfix — a
             one-line note in newchange.md is sufficient.

□ APPKIT     npm run build in appkit/ — dist/ is up to date. Do NOT npm publish unless asked.

□ COMMIT     Fix all remaining TS errors first. Then:
             · Code commit first (fix/feat/wire/seed — one logical unit per commit)
             · Docs commit second (tracker + prompt + memory + diagrams + index files)
             · Never batch unrelated tasks in a single commit
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
```

### Store identity

```
Public routes + UI    → storeId / storeName / storeSlug  (never sellerId / ownerId)
Admin routes only     → may also show ownerId (Firebase UID)
Internal server only  → sellerId (= Firebase UID, never returned in API responses)
```

### User roles

```
user       → buyer, no store
seller     → has ≥1 store; role set on store creation
moderator  → content moderation sub-role
employee   → staff; access via permissions[] array, not role string
admin      → bypasses all permission checks
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
```

### appkit build cycle

```bash
# Local dev — no npm publish needed
npm run watch:appkit   # terminal 1: compiles appkit/src/ → appkit/dist/ on save
npm run dev            # terminal 2: Next.js picks up dist/ changes live
npx tsc --noEmit       # must pass before every commit (both repos)

# Publish only when user explicitly asks
# See CLAUDE.md "Appkit Publish & Deploy Rules" for full checklist
```

---

## QUICK REFERENCE

### Key files

| What | Where |
|------|-------|
| Task tracker | `crud-tracker.md` |
| Session log + deferred | `newchange.md` |
| Architecture + imports | `INSTRUCTIONS.md` |
| Slug prefixes + media | `CLAUDE.md` |
| Seed files | `appkit/src/seed/` |
| Seed API route | `src/app/api/demo/seed/route.ts` |
| SeedPanel UI | `src/components/dev/SeedPanel.tsx` |
| API constants | `src/constants/api.ts` |
| Route constants | `@mohasinac/appkit/client` → `ROUTES` |
| Nav group configs | `src/constants/navigation.tsx` |
| SEO metadata helpers | `src/constants/seo.server.ts` |
| Action constants | `appkit/src/features/products/constants/action-defs.ts` |
| RBAC permissions | `appkit/src/features/auth/permissions/constants.ts` |
| ASCII diagrams | `asciiDiagrams.md` |
| Public layout shell | `src/app/[locale]/LayoutShellClient.tsx` |

### Reference implementations

```
src/app/[locale]/events/[id]/page.tsx             ← detail page (all render props wired)
src/app/[locale]/admin/events/page.tsx            ← admin list (full CRUD)
src/app/[locale]/admin/events/new/page.tsx        ← admin create
src/app/[locale]/admin/ads/[id]/edit/page.tsx     ← admin edit
src/app/[locale]/store/products/new/page.tsx      ← seller create
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

One task per commit. Never batch tasks. Never commit with TS errors.

---

## WHAT NOT TO DO

```
✗ Make autonomous decisions — stop, write intent, wait for confirmation (CLAUDE.md Rule #1)
✗ Trust a ✅ tracker entry without re-reading the source file (CLAUDE.md Rule #2/4)
✗ Mark ✅ while any spec bullet is unbuilt — create a new ⏳ task or defer explicitly
✗ Leave stale "remaining: old-task-ID" notes on ✅ entries
✗ Refactor or add abstractions beyond the current task
✗ Add comments explaining what code does (names explain what; comments explain non-obvious why)
✗ Use dangerouslySetInnerHTML — use RichText or RichTextRenderer instead
✗ Cast as unknown as Foo — fix the type; if uncertain, ask
✗ Use onClick={() => router.push(...)} — use Link or Button asChild+Link
✗ Hardcode any route string — use ROUTES.* constants
✗ Import firebase-admin in index.ts or client.ts — server.ts only (Turbopack client-bundle trap)
✗ Add @import of node_modules CSS in globals.css — import via JS in layout.tsx instead
✗ Edit root firestore.indexes.json directly — edit appkit/firebase/base/ then run firebase-merge.mjs
✗ Run git push unless the user asks
✗ npm publish appkit unless the user explicitly asks
✗ Run vercel --prod unless the user explicitly asks
✗ Keep more than 1 LAST COMPLETED block in this file — drop oldest on every session end
✗ Update INSTRUCTIONS.md §12 "LIVE SITE" column — it is a read-only reference snapshot
```
