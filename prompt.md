# letitrip.in — Master Working Prompt

> **Paste at the start of every session.**
> Task status → `crud-tracker.md` (authoritative) · Deferred → `newchange.md` DEFERRED table · Architecture → `INSTRUCTIONS.md` · Slugs/media → `CLAUDE.md`

---

## SESSION STATE

### ✅ Last completed — S6 (2026-05-11)

| Task | Summary |
|------|---------|
| ARCH1 | New `sanitizeProductForPublic`/`sanitizeProductsForPublic` in `appkit/src/features/products/utils/sanitize.ts` — strips `sellerId`/`sellerName`/`sellerEmail`/`ownerId`. Wired into appkit GET list, appkit GET detail, and letitrip top-level `/api/products` GET. |
| ARCH6 | Detail views + list views + store listings + coupons: every public `sellerId`/`sellerName` reference replaced by `storeId`/`storeName`. Deprecated `sellerId` props dropped. Admin `deals`/`featured`: `sellerName` fallback removed. |
| ARCH7 | `PublicProfileView`: seller hero leads with `store.storeName`/`store.storeLogoURL` from live store doc. `AdminUserEditorView`: Identity block shows Owner ID (Firebase UID) + ownedStoreId/storeName. |

### 🔜 Current — S7 (next session)

### 🔜 Next sessions (S1–S13 shown; full table in crud-tracker.md)

| Session | Tasks | Goal | Risk |
|---------|-------|------|------|
| **S1** ✅ | SL6, ARCH9, VD3, HS4-E, A1-ext | Slug audit + field renames + per-store Google Reviews | zero |
| **S2** ✅ | D2, D3, LL4, LL5 | User account: addresses CRUD + order cancellation + listing views | zero |
| **S3** ✅ | VC2, VC4 | Invoice PDF + user settings tabs | zero |
| **S4** ✅ | G1, G2, O1 | Store templates CRUD + slug management | zero |
| **S5** ✅ | UX4, UX8, UX9 | PreviewPane + quick-edit drawer + InlineSelectCreate | zero |
| **S6** ✅ | ARCH1, ARCH6, ARCH7 | Strip sellerId from public API responses | low |
| **S7** | EX5, SB11-A–G | Collection Cards section type + 3 new homepage section types | low |
| **S8** | FI1–FI6 | `productFeatures` collection + admin/store CRUD + card badges | low |
| **S9** | BK3, D5, VC7 | Compare overlay + Messages RTDB | low |
| **S10** | I6, I7 | PDF uploader + Media CDN watermark proxy | medium |
| **S11** | O5 | Shiprocket auto-create | medium |
| **S12** | Q5, Q2, Q4 | Firestore indexes deploy + param standardization | medium |
| **S13** | Q1, Q3, Q6 | listingProcessor Firebase Function + infinite scroll | medium |
| **S14–S18** | P24–P31 | Seed scale (auctions/categories/blog/coupons/validator) | low |
| **S19–S30** | SB1–SB11, TC | Bundle + Prize Draw + Event Raffle system | high |
| **S31–S37** | RBAC1–RBAC10, BAN1–BAN9 | Permission gates + ban enforcement | high |
| **S38–S39** | SCAM2,4,6,7,8,9 | Admin scammer UI + SEO + notifications | medium |
| **S40–S43** | GD1–GD22 | In-app guide pages (store/buyer/admin) | zero |

---

## PLAN SNAPSHOT

```
131 tasks ✅ done · 266 remaining · 397 total (as of S6 done 2026-05-11)
Roadmap reorganized 2026-05-11 → 43 sessions S1–S43 (risk-ordered, all deferred integrated) — S1–S6 ✅

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
Homepage features       S7           ⏳  EX5 + SB11 (collection-cards + 3 new section types)
Feature icons           S8           ⏳  FI1–FI6 productFeatures collection
UX + RTDB               S9           ⏳  BK3 compare overlay + Messages RTDB
Infrastructure          S10–S11      ⏳  PDF + watermark CDN + Shiprocket
Query/Sieve             S12–S13      ⏳  Firebase Function — medium risk
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
2. Read newchange.md DEFERRED table → resolve any open gaps before new work
3. Read every source file you will touch — never code from memory or tracker descriptions alone
4. Run: npx tsc --noEmit in BOTH letitrip.in/ AND appkit/ → must be 0 errors before you begin
5. If context feels fuzzy (too many files in mind) → STOP and start a fresh session
```

### Per-task loop (repeat for every task)

```
1. PLAN      Write 3–5 bullets: what files change and why
2. CODE      Implement the smallest correct change
3. TSC       npx tsc --noEmit → 0 errors (both repos if appkit changed)
4. VERIFY    Visual confirm in browser — do not mark ✅ on TS alone
5. COMMIT    fix/feat/wire/seed(scope): one-line description  (one task per commit)
6. TRACKER   Mark task ✅ in crud-tracker.md, fill Part#, add one-line done note + timestamp
7. NEWCHANGE  Prepend task entry to newchange.md (scope, files changed, deferred items)
8. PROMPT    Update 🔄 CURRENT task status in this file
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
