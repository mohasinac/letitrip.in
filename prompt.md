# letitrip.in — Master Working Prompt

> Paste at the start of every session.
> **Task status** → `crud-tracker.md` (authoritative).
> **Deferred/skipped** → `newchange.md` DEFERRED table (read before starting).
> **Architecture + imports** → `INSTRUCTIONS.md`.
> **Slug prefixes + media patterns** → `CLAUDE.md`.

---

## 🔁 RULE #0 — SESSION PROTOCOL

### At the START of every session (before writing any code):
1. **Update `prompt.md`** — set LAST COMPLETED to the previous session; set 🔜 NEXT to the current session's tasks from `crud-tracker.md`.
2. **Update `memory/project_status.md`** — note what this session will work on and any carry-over from the last session.
3. **Read `newchange.md` DEFERRED table** — check for open gaps that must be resolved before starting new work.

### At the END of every session (before the final commit):
1. **Fix all TypeScript errors** — run `npx tsc --noEmit` in both `letitrip.in/` and `appkit/`. Must be 0 errors.
2. **Recheck all changes** — re-read every file touched this session and verify correctness; no half-finished implementations.
3. **Code quality** — use appkit HTML wrappers (`Div`, `Row`, `Stack`, `Text`, `Heading`), CSS variables (`var(--appkit-color-*)`, `var(--header-height)`), no hardcoded hex, no arbitrary Tailwind breakpoints.
4. **Update `crud-tracker.md`** — mark completed tasks ✅ with session + one-line note; mark session row ✅ Done in roadmap.
5. **Update `prompt.md`** — move this session into LAST COMPLETED; set 🔜 NEXT to the *next* session's tasks.
6. **Update `memory/project_status.md`** — prepend a bullet summary of everything that changed.
7. **Prepend `newchange.md`** — session entry: scope, changed files table, deferred items table.
8. **Update ASCII diagrams** — add/update any diagrams affected by new pages or flows.
9. **Seed data + Firebase** — if any schema changed: update seed files in `appkit/src/seed/`, update `firestore.indexes.json`, update SeedPanel entries, update sievejs config.
10. **Commit** — code commit first, then a separate docs commit.

> **Why:** `prompt.md` is read cold at every session start. Stale LAST COMPLETED and 🔜 NEXT means the next session wastes turns re-deriving context and risks regression.

---

## ⚡ LAST COMPLETED — Session 80 ✅ 2026-05-10 (Alpha: Store Settings)

| Task | What was done |
|------|--------------|
| **C6** | `SellerShippingView` rewritten as full form: method radio (custom/shiprocket), rate fields (standard/express paise), free-shipping threshold toggle, pickup address selector (`StoreAddressSelectorCreate`). Saves via PATCH `/api/store/shipping`. |
| **C7** | `SellerPayoutSettingsView` rewritten: UPI/bank radio, UPI VPA input or bank form (name, masked account number, IFSC, bank name, account type). PATCH `/api/store/payout-settings` with Zod discriminated union + masking on save. |
| **LL8** | `SellerReviewsView` + GET `/api/store/reviews` + POST `/api/store/reviews/[id]/reply`. Star display, filter chips (rating 1–5, reply status), inline reply SideDrawer. `sellerReply`/`sellerRepliedAt` added to `ReviewDocument`. `/store/reviews` page + "Reviews" in "Orders & Reviews" nav group. |
| **VB3** | `SellerPayoutRequestView` + POST `/api/store/payouts/request`. Shows available earnings, pre-fills payment method from payout settings, optional notes. Disabled if pending payout or zero earnings. `requestPayout()` server action wired. |
| **VB10** | `/store/analytics/page.tsx` wired as "use client" fetching from `/api/store/analytics`. Graceful 503 handling. Passes to `SellerAnalyticsStats` + `SellerTopProducts` with rupee formatter. |
| **O3** | `StoreAddressSelectorCreate` wired into `SellerProductShell` `StepShipping` — replaces plain-text fallback; sellers can pick or inline-create a pickup address on any product listing. |
| **UX7** | FormShell pattern confirmed across all store-side forms: SellerStorefrontView (useFormShell), SellerShippingView (StackedViewShell), SellerPayoutSettingsView (StackedViewShell). O3 covers QuickFormDrawer via StoreAddressSelectorCreate. |
| **TypeScript** | Both repos pass `npx tsc --noEmit` 0 errors. |

---

## Session 101 QA ✅ 2026-05-10 (TypeScript audit + WA3 + quality pass)

| Task | What was done |
|------|--------------|
| **WA3** | `sendWhatsAppBusinessMessage()` + `syncProductsToCatalog()` + `buildPurchaseAnnouncementMessage()` in appkit whatsapp-bot/helpers. GET/PUT `/api/store/whatsapp-settings` (encrypted token, capability gate). POST `/api/store/whatsapp-settings/catalog-sync` (Meta Commerce API batch). `onOrderCreate` Firebase trigger → purchase announcement to admin + store owner. `--appkit-color-warning-surface` CSS token (light + dark). `STORE.WHATSAPP` route + nav link. `whatsapp_catalog_sync` StoreCapability. |
| **Quality** | `LayoutShellClient`: fixed misplaced `import Link` (was after constants). `FormShell`: `amber-100/900` → `var(--appkit-color-warning-surface)`. `dev-next.mjs`: stable Next.js bin path. `transpilePackages` + `tailwind.config.js` dist scan removed. |
| **TypeScript** | Both repos pass `npx tsc --noEmit` 0 errors (fixed 3 WA3 catalog-sync errors). |

---

## Session 100 ✅ 2026-05-10 (77-impl: UX Shells + Seller Product Forms)

| Task | What was done |
|------|--------------|
| **UX1** | `FormShell` + `useFormShell` in `appkit/src/features/shell/FormShell.tsx` — full-viewport overlay, focus trap, scroll lock, dirty guard, unsaved dialog. |
| **UX2** | `QuickFormDrawer` in `appkit/src/features/shell/QuickFormDrawer.tsx` — 40% desktop / 100% mobile, auto-renders `FieldDef[]`, re-init on isOpen. |
| **UX3** | `StepForm`, `StepFormActions`, `StepIndicator` in `appkit/src/features/shell/StepForm.tsx` — controlled multi-step, per-step validate, localStorage. |
| **UX6/C1/VB8/C2/VB9** | `SellerProductShell` — create (5/6-step StepForm) + edit (FormShell section nav); standard/auction/pre-order. Updated `SellerCreateProductView` + `SellerEditProductView`. |
| **C1/C2 pages** | 6 new pages: `/store/auctions/new`, `/store/auctions/[id]/edit`, `/store/pre-orders/new`, `/store/pre-orders/[id]/edit`. `/store/products/new` + edit also wired. All pass server actions via inline `"use server"`. |
| **O2+C5/VB4** | `SellerStorefrontView` complete rewrite — profile/details/policies/social/vacation/visibility sections, dirty tracking, save feedback. Storefront page wired to `updateStoreAction`. |
| **LL6** | `SellerProductsView` — type filter chips (All/Standard/Auction/Pre-order), thumbnail column, type+status badges, price column, row edit/delete actions, CSS variables only. |
| **Bug fix** | `SearchResourceType` + `SearchResourceTypeOption` not exported from `search/components/index.ts` — fixed. |
| **TypeScript** | Both `appkit/` and root `src/` pass `npx tsc --noEmit` with 0 errors. Appkit built. |

> Prior sessions done: 84 (Search Redesign), 83 (SCAM public pages), 82-ext (footer SEO + constants), 82 (SEO & Lighthouse), 80-schema (RBAC+BAN+SCAM), 81 (storeId migration).

---

## Session 79 ✅ 2026-05-10 (Cart Integrity)

| Task | What was done |
|------|--------------|
| **W1** | `POST /api/cart/validate` — accepts `{ productIds: string[] }`, returns `{ stale, outOfStock }`. No auth required. PUBLISHED → in-stock; OUT_OF_STOCK → oos; SOLD/ARCHIVED/DISCONTINUED/DRAFT/null → stale. |
| **W2** | `POST /api/user/wishlist/validate` — auth required. Batch-checks all user wishlist items, deletes stale from Firestore, returns `{ removedCount, removedProductIds }`. Wishlist page shows info toast + refetches on stale removal. |
| **W3** | `CartRouteClient` split cartItems into in-stock / OOS sections via useMemo. OOS section header shows item count, items grayed with badge. Checkout disabled + warning when all items OOS. |
| **W4** | `CartItemRow` augmented with `href?: string` (title becomes link, opens in new tab) and `isOutOfStock?: boolean` (grayed + badge + locked qty). `getProductHref()` maps slug prefix → ROUTES constant (auction-/preorder-/product-). |
| **R1** | `handleQtyChange` now calls `PATCH /api/cart/[id]` for auth cart with error toast. `handleRemove` calls `DELETE /api/cart/[id]` with success/error toast. Notifications page: mark-all-read and delete mutations show proper success/error/info toasts. |
| **TypeScript** | Both repos pass `npx tsc --noEmit` 0 errors. Fixed 5 pre-existing errors: `helperText`→`helpText` in SellerPayoutSettingsView + SellerShippingView; missing appkit client.ts exports; `API_ROUTES.STORE.PAYOUTS` added; `createApiHandler`→`createRouteHandler` in payouts/request; implicit `any` in analytics page. |

---

## 🔜 NEXT — 🚀 ALPHA RELEASE + Session 81: Store Finance

Alpha gate is complete (sessions 77–80 done). Next session is Store Finance.

| Tasks | Goal |
|-------|------|
| C3 | Store Coupons CRUD — create, list, toggle, delete via /api/store/coupons |
| C4 | Store Orders view — list with status filter, order detail drawer |
| VB1 | Store orders listing wired to real API data |
| VB2 | Store bids listing wired to real API data |
| VB5 | Store shipping config form (alias C6 — already done) |
| VB6 | Store payout settings form (alias C7 — already done) |
| VB7 | Store addresses CRUD — list, add/edit/delete store pickup addresses |
| O4 | Store analytics wired (alias VB10 — already done) |
| LL7 | SellerBidsView — bids received on store's auction listings |
| LL9 | SellerOrdersView — orders listing for seller's store |
| LL10 | SellerPayoutsView — payout history list |

---

## 📅 ROADMAP

### Alpha gate (77–80) — implement before alpha release

| Session | Tasks | Goal |
|---------|-------|------|
| **77-impl** | UX1–UX5, UX9, O1, O2+C5, C1, VB8, C2, VB9, LL6 | Seller Products + UX primitives |
| **78** | D1+VC6, VC1, VC3, VC5, LL1, LL2, LL3 | User Account Core |
| **79** | W1, W2, W3, W4, R1 | Cart Integrity |
| **80-impl** | C6, C7, O3, VB3, VB10, LL8, UX7 | Store Settings |

### 🚀 ALPHA RELEASE after Session 80-impl

### Post-alpha

| Session | Tasks | Goal |
|---------|-------|------|
| 81-impl | C3, VB5, C4, VB6, VB1, VB2, VB7, O4, LL7, LL9, LL10 | Store Finance: coupons, orders, payouts, analytics |
| 83 | VD8, VD9, VD10 | Content rewrites: About, Seller Guide, Legal |
| 84 | L1, L2, L3 | Custom Fields system |
| 85 | SC1, SC2, SC3, SC4 | Sub-listing categories |
| 86 | GP1, GP2 | Grouped listings |
| 87 | S4, S1, S2, S3, S5 | Social feed |
| 88 | RC2, SR1, SR2, SR3, RC1, RC3 | Search redesign + route centralisation |
| 89 | Q5, Q1, Q2, Q3, Q4, Q6 | Query/Sieve + infinite scroll |
| 90 | X7a, X7b | Color token audit |
| 91 | X8a, X8b | Layout token audit |
| 92–95 | P23–P31 | Seed scale expansion |
| 96 | RBAC2, RBAC3, RBAC4 | RBAC: Employee invite + admin RSC guards + permission middleware |
| 97 | RBAC5, RBAC6, RBAC7 | RBAC: Store capability guards + employee UI + permission groups admin |
| 98 | RBAC8, RBAC9, RBAC10 | RBAC: Permission audit log + capabilities admin + seed data |
| 99 | BAN2, BAN3, BAN4 | Bans: Admin ban UI + hard ban cascade + checkout/ticket blocking |
| 100 | EX1–EX5, YT1 | Extended homepage sections: stats live queries, multi-carousel, CTA/filter chips, products multi-row, collection-cards, YouTube cards |
| 101 | AX1, AX2, AX3, A1-ext | Action system: ACTION constants + dispatch hook, URL panel routing, sticky FormActionBar, admin product store picker |
| 102 | FI1–FI6 | Feature Icons: productFeatures collection, seed, admin+store CRUD, product form, card badges |
| 103 | BK1–BK3 | Bulk Actions: public selection mode, sticky action bar, compare overlay |
| 104 | BAN5, BAN6, BAN7 | Bans: Support ticket API + ticket UI + Firebase notification functions |
| 105 | BAN8, BAN9 | Bans: Ticket seed data + analytics |
| 106 | SCAM2, SCAM3, SCAM4 | Scams: Scammer repo + public list page + individual profile page |
| 107 | SCAM5, SCAM6, SCAM7 | Scams: Submit report + scam awareness acknowledgement + admin verify UI |
| 108 | SCAM8, SCAM9 | Scams: Scam type pages + seed data |
| 109+ | VA19, I6, I7, D5, VC7, O5, HS4-E, VC2, VC4, D3, D4, LL4, LL5 | Deferred: Admin CSV export, PDF, watermark CDN, messages, Shiprocket |

### Confirmed UX design for GP1 + SC3 (Sessions 85–86)
- Both sections live **between the buy-box/actions area and the TABS row** — NOT in belowFold
- Injected via `renderGroupSection` (GP1) and `renderSublistingSection` (SC3) render props on `ProductDetailView` / `AuctionDetailView`
- Card style: small **circular** thumbnail cards (~64 px) in a `HorizontalScroller`, collapsed by default
- Sub-listing cards: circular image + name (2-line truncate) + price chip; click → navigate; current highlighted with ring
- Group cards: circular image + name + price; click → navigate; current highlighted; selectable
- "View whole group →" opens a Modal (SideDrawer if ≥5 parts): thumbnail/name/price/condition/"View" table
- Auctions only get SC3; GP1 is standard products + pre-orders only

---

## ⛔ GOLDEN RULES

```
✅ = fully done per spec, TS passes, verified in browser
Never silently skip a spec bullet — defer with new task or do it now
Never leave stale "remaining: old-task-ID" on ✅ tasks
npx tsc --noEmit must pass before every commit (both repos)
```

### Route definitions
- NEVER create a `page.tsx` at a path that also has a `[[...action]]` child folder — Next.js rejects it
- Standard CRUD: `/resource/page.tsx` (list) + `/resource/new/page.tsx` (create) + `/resource/[id]/edit/page.tsx` (edit). No `[[...action]]` catch-alls for new routes.
- All route strings → `ROUTES.*` constants only (`appkit/src/next/routing/route-map.ts`). Zero hardcoded strings.

### SeedPanel — always in sync
Any schema, collection, feature type, or user-config change → update SeedPanel in the SAME session:
1. Update the `FieldDef[]` array for that collection in `SeedPanel.tsx`
2. Update `slugPattern` chip if the ID format changed
3. Update `mediaFields` chips if new image/video fields were added
4. Update PII label if new personally-identifiable fields were added
5. Update the actual seed file in `appkit/src/seed/`

### ASCII diagrams — draw as you build
- `asciiDiagrams.md` is canonical — one diagram per page/view
- When you build or significantly change a page/view/form/modal: add or update its diagram
- Diagrams must show **everything**: all tabs, columns, form fields, action buttons, modals/drawers, filter states, empty states
- Format: ASCII box-drawing with `## [Area] > [Page Name]` heading

### Component index — look before you create
- Before writing any new component/util/constant: check `appkit/index.md` and `src/index.md`
- After every task that adds, renames, or removes: update the relevant row
- Format: `| Name | Path | What it does |`

### UI rules
- Missing data → empty state, never crash/white screen
- Every optional prop needs a default
- Half-renames are banned — rename = one atomic commit covering producer + consumer

### Content
- Brand: **"LetItRip"** — always this casing (not "LetiTrip", not "Letitrip"). Grep after every content update.
- No generic marketplace copy — reference real collectibles niche (Pokémon TCG, Hot Wheels, Beyblades, anime figures)

### Buttons vs links
```
<Button>                                     → action / mutation / modal open only
<Link href={ROUTES.*}>                       → navigation — always ROUTES.* constant
<Button asChild><Link href={ROUTES.*}>       → styled-button navigation
```

### SideDrawer vs Modal
```
0 fields (confirm only) → ConfirmDeleteModal
1–2 form fields         → Modal
3+ form fields          → SideDrawer
```

### Store identity
```
Public routes + UI:   storeId / storeName / storeSlug  — never sellerId / ownerId
Admin routes only:    may additionally show ownerId (Firebase UID)
Internal server only: sellerId (= Firebase UID) — never returned in API responses
```

### User roles — 5 tiers
```
user      → basic buyer (no store)
seller    → has ≥1 store; role assigned on store creation
moderator → content moderation sub-role (internal)
employee  → internal staff; access governed by permissions[] array, not role
admin     → platform admin; bypasses ALL permission checks
```

### No hardcoded values
```
Colors  → var(--appkit-color-*)         No: #hex, rgb(), rgba()
Layout  → var(--appkit-z-*), @screen    No: raw px breakpoints, z-index ints
```

### Reuse before creating
Search `appkit/src/` first. Primitives → `appkit/src/ui/`. Features → `appkit/src/features/[domain]/`. Pages = thin wrappers only.

---

## HOW TO WORK (every task)

```
1. crud-tracker.md → find next ⏳, mark 🔄
2. newchange.md DEFERRED table → any relevant unresolved items?
3. Read every source file you'll touch — never code from memory
4. Plan 3–5 bullets: what changes and why
5. Implement smallest correct change
6. Verify: npx tsc --noEmit + browser visual confirm
7. Commit → fix/feat/wire/seed(scope): description
8. newchange.md → prepend new task entry (after EVERY task)
9. prompt.md → update LAST COMPLETED (after EVERY task)
10. crud-tracker.md → mark ✅, fill Part#, update Summary + timestamp
```

### Checklist per task
```
□ TRACKER    crud-tracker.md marked 🔄 at start
□ DEFERRED   newchange.md DEFERRED table checked
□ CODE       implemented, tsc 0 errors, browser verified
□ COMMIT     correct format, one task, no TS errors
□ SEED       updated or noted "no change needed"
□ NEWCHANGE  newchange.md prepended — after EVERY task
□ PROMPT     prompt.md LAST COMPLETED updated — after EVERY task
□ TRACKER    marked ✅, Part# filled, Summary + timestamp updated
```

### Form quality checklist (every VA/VB/VC editor form)
```
□ MOBILE     Works at 375px — no overflow, no clipped inputs
□ TABLET     Works at 768px — responsive grid kicks in
□ DARK       All labels/textareas/helper text have dark: variants
□ TOKENS     No hardcoded hex/rgb — var(--appkit-color-*) or Tailwind semantic
□ FOCUS      Focus rings visible on all interactive elements
□ ERRORS     Error states styled (red border, error message)
□ LOADING    Submit button shows isLoading + disabled; no double-submit
```

### Build cycle (appkit changes)
```bash
npm run watch:appkit   # terminal 1
npm run dev            # terminal 2
npx tsc --noEmit       # must pass before commit (both repos)
```

---

## REFERENCE IMPLEMENTATIONS

```
src/app/[locale]/events/[id]/page.tsx              ← detail page (all render props wired)
src/app/[locale]/admin/events/page.tsx             ← admin list (full CRUD)
src/app/[locale]/admin/events/new/page.tsx         ← admin create pattern
src/app/[locale]/admin/ads/[id]/edit/page.tsx      ← admin edit pattern
src/app/[locale]/store/products/new/page.tsx       ← seller create pattern
```

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| Task tracker | `crud-tracker.md` |
| Deferred items + session log | `newchange.md` |
| Architecture + import rules | `INSTRUCTIONS.md` |
| Slug prefixes + media patterns | `CLAUDE.md` |
| Seed files | `appkit/src/seed/` |
| Seed API | `src/app/api/demo/seed/route.ts` |
| SeedPanel UI | `src/components/dev/SeedPanel.tsx` |
| Public layout shell | `src/app/[locale]/LayoutShellClient.tsx` |
| Cart | `src/components/routing/CartRouteClient.tsx` |
| Checkout | `src/components/routing/CheckoutRouteClient.tsx` |
| API constants | `src/constants/api.ts` |
| Route constants | `@mohasinac/appkit/client` (`ROUTES`) |
| SEO metadata | `src/constants/seo.server.ts` |
| RBAC permissions | `appkit/src/features/auth/permissions/constants.ts` |
| Support ticket schema | `appkit/src/features/support/schemas/firestore.ts` |
| Scam schema + constants | `appkit/src/features/scams/` |

---

## COMMIT FORMAT

```
fix(scope): description
feat(scope): description
wire(scope): description
seed(scope): description

- file A — what changed
- file B — what changed
- Root cause / reason: one sentence
```

One task per commit. Never commit with TS errors. Never batch tasks.

---

## WHAT NOT TO DO

```
✗ Refactor beyond the current task
✗ Add comments explaining what code does
✗ Run git push unless asked
✗ Mark ✅ if any spec bullet is unbuilt — log deferral in newchange.md DEFERRED first
✗ Skip newchange.md update after completing a task — update after EVERY task
✗ Skip prompt.md update after completing a task — update after EVERY task
✗ Skip crud-tracker.md update — after every task AND every 30 minutes
✗ Use dangerouslySetInnerHTML without RichTextRenderer
✗ Use as unknown as Foo without a ⚠️ Tech debt: note in tracker
✗ Leave stale "remaining: old-task-ID" notes on ✅ entries
✗ Update INSTRUCTIONS.md §12 "LIVE SITE" column — it is a reference snapshot
```

---

## PLAN SNAPSHOT

```
Sessions done:  60–76 + 76-infra + 76-content + 77 (coupons) + 78 (carousel) + 79 (FAQ/stats)
                + 80-arch + 80-plan + 80-schema + 81 (sellerId migration)
                + 82 (SEO1–7) + 82-ext (BK1+BK2: hover/long-press bulk selection, Set-based useBulkSelection,
                  full-width BulkActionsBar, ListingToolbar bulkMode, all marketplace cards updated)
Next:           77-impl — Seller Products + UX primitives
Alpha gate:     77-impl → 78-impl → 79-impl → 80-impl → 🚀 ALPHA

⚠️  Firebase fully reset 2026-05-10 — re-seed all collections via /demo/seed
⚠️  RBAC/BAN/SCAM schemas done (80-schema, additive) — UI deferred to sessions 96–104
⚠️  SCAM seed data + indexes + SeedPanel wired (80-schema-ext) — 3 scammer profiles seeded; `scammerProfiles` in SeedPanel Trust & Safety group; 9 Firestore indexes added; all schema constants exported from @mohasinac/appkit

PHASE               SESSIONS          STATUS
────────────────────────────────────────────────────────
Foundation          60–64             ✅ done
Carousel            65                ✅ done
Sections            66–67             ✅ done
Admin CRUD          68–75             ✅ done
──────── ALPHA GATE ──────────────────────────────────
Public Catalogue    76                ✅ done
Infra/Hotfix        76-infra          ✅ done
Content pages       76-content        ✅ done
Schema/arch prep    80-plan+schema    ✅ done (RBAC/BAN/SCAM schemas)
sellerId migration  81                ✅ done
Seller Products     77-impl           ⏳
User Account Core   78-impl           ⏳
Cart Integrity      79-impl           ⏳
Store Settings      80-impl           ⏳
──────── 🚀 ALPHA ────────────────────────────────────
Store Finance       81-impl           ⏳
Admin Finance       82                ⏳
Content             83                ⏳
Custom Fields       84                ⏳
Sub-listings        85                ⏳
Grouped Listings    86                ⏳
Social Feed         87                ⏳
Search+Routes       88                ⏳
Query/Sieve         89                ⏳
Token Audits        90–91             ⏳
Seed Scale          92–95             ⏳
RBAC UI             96–98             ⏳
Bans UI             99–101            ⏳
Scams UI            102–104           ⏳
Deferred            105+              ⏳
────────────────────────────────────────────────────────
```
follow all rules and complete all tasks, prioritize pending tasks or tech debt first. check for tsc errors before proceeding to next task. update ascii diagrams after every session.

in the end recheck all the changes , update the tracker , prompt.md file , update our memory . update ascii diagrams and try to optimize and write better quality code so that we have more maintainability. also update or add the seed data and firebase indices and sieverjs and other config and the seedpanel entry for the same. make sure we use our html wrappers and themed contents with variables and no hardcoded text or breakpoints
then commit all changes