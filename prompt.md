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
5. **Update `prompt.md`** — drop oldest LAST COMPLETED; move current session into LAST COMPLETED (keep only 1); set 🔜 NEXT to the *next* session's tasks.
6. **Update `memory/project_status.md`** — prepend a bullet summary of everything that changed.
7. **Prepend `newchange.md`** — session entry: scope, changed files table, deferred items table.
8. **Update ASCII diagrams** — add/update any diagrams affected by new pages or flows.
9. **Seed data + Firebase** — if any schema changed: update seed files in `appkit/src/seed/`, update `firestore.indexes.json`, update SeedPanel entries, update sievejs config.
10. **Commit** — code commit first, then a separate docs commit.
11. **appkit: build only, do NOT publish** — run `npm run build` in `appkit/` so `dist/` is up to date for local dev. Only bump version + `npm publish` when the user explicitly says to release. Vercel auto-deploy is disabled; only `vercel --prod` when asked.

> **Why:** `prompt.md` is read cold at every session start. Stale LAST COMPLETED and 🔜 NEXT means the next session wastes turns re-deriving context and risks regression.

---

## ✅ LAST COMPLETED — Session 89b ✅ 2026-05-11 (FAQ redesign + WhatsApp section + @types/react dedup)

| Task | What was done |
|------|--------------|
| **FAQSection rewrite** | Category tab bar (Button primary/ghost), multi-open Set state, `defaultOpenCount`, CSS grid expand/collapse animation. `RichText` for HTML answers. `FAQSectionConfig` expanded: `showCategoryTabs`, `visibleTabs: FAQCategoryKey[]`, `allowMultipleOpen`, `defaultOpenCount`. Removed stale `expandedByDefault`. `section-renderer.tsx` faq case updated. ✅ |
| **WhatsAppCommunitySection redesign** | Brand primary→cobalt gradient card. WhatsApp green only for icon + CTA button. `RichText` description, benefits checklist, blockquote testimonial. No inline styles — CSS variables only. `section-renderer.tsx` whatsapp-community case updated. ✅ |
| **@types/react dedup** | Moved `@types/react` from `devDependencies` → `peerDependencies` in appkit. Added `"overrides": { "@types/react": "^19", "@types/react-dom": "^19" }` in root `package.json`. Eliminated 14 pre-existing TS errors (dual instance root cause). ✅ |
| **nav types** | `src/constants/navigation.tsx` now imports `AdminNavGroup`, `StoreNavGroup`, `UserNavGroup`, `MainNavbarItem`, `AppLayoutShellSidebarLink` directly from appkit — no local re-declaration. ✅ |
| **FAQs page** | `src/app/[locale]/faqs/page.tsx` JSON-LD now includes all public FAQs (limit 50, not filtered to `showOnHomepage`). ✅ |
| **appkit** | `file:./appkit` local link — no version bump needed. Both repos: 0 TS errors. |

---

## 🔄 CURRENT — Session 90 🔄 2026-05-11 (AX1 partial — constants built, hook pending)

| Task | Status | What was done / What remains |
|------|--------|------------------------------|
| **AX1 constants** | ✅ done | `appkit/src/features/products/constants/action-defs.ts` — §1 ACTION_ID (11) + ACTION_META + DETAIL_ACTIONS + MOBILE_PRIMARY_ACTIONS + LISTING_BULK_ACTIONS · §2 ROW_ACTION_ID (17) + ROW_ACTION_META + role-based row/bulk action sets · §3 FORM_ACTION_ID (7) + FORM_ACTION_META + FORM_FOOTER_PRESET · §4 DASHBOARD_QUICK_ACTION_ID (17) + DASHBOARD_QUICK_ACTION_META. Exported from `client.ts` + `index.ts`. DrawerFormFooter + FormShell default labels from FORM_ACTION_META. ProductsIndexListing + PreOrdersIndexListing bulk action keys from ACTION_ID. |
| **AX1 hook + migration** | ⏳ pending | `useActionDispatch` hook (NAVIGATE / OPEN_PANEL / TOAST / BULK / COPY) + Zustand `panelStore` + migrate copy-paste `router.push` patterns in admin views |

---

## 🔜 NEXT — Upcoming sessions (safe-first order)

> Sessions ordered safe-first: zero-schema/zero-API changes go before Firebase Function + routing changes.

### Complete Session 90 — Finish AX1
| Task | Goal |
|------|------|
| AX1 remainder | `useActionDispatch` hook (NAVIGATE/OPEN_PANEL/TOAST/BULK/COPY) + Zustand `panelStore` + migrate copy-paste `router.push` patterns in admin views |

### Session 90-colors — Color Token Audit *(zero breaking risk)*
| Task | Goal |
|------|------|
| X7a | Extend CSS color token system — define all missing `--appkit-color-*` tokens |
| X7b | Replace all hardcoded hex violations (one file per commit) |

### Session 91 — Layout Token Audit *(zero breaking risk)*
| Task | Goal |
|------|------|
| X8a | Layout tokens — define missing `--appkit-z-*`, `--appkit-size-*`, `--appkit-shadow-*` tokens |
| X8b | Replace raw px breakpoints, z-index ints, arbitrary Tailwind violations (one file per commit) |

### Session 92 — Action URL Routing *(medium risk — URL params only)*
| Task | Goal |
|------|------|
| AX2 | `?panel=create/edit` deep-links on 10 admin listing pages + `usePanelUrlSync` hook |
| AX3 | `FormActionBar` sticky top (desktop) + bottom (mobile) bars with dirty-state tracking |

### Session 93 — Extended Homepage Sections *(additive, no schema breaks)*
| Task | Goal |
|------|------|
| EX1 | Stats live queries (total products / stores / users / auctions ending-soon counts) |
| EX2 | Multi-carousel section — render multiple carousels from config |
| EX3 | CTA + filter chip section for categories/brands |
| EX4 | Products multi-row section with configurable columns |
| YT1 | YouTube video cards in social feed |
| EX5 | Collection-cards section (supersedes 8 old types — do last, higher migration risk) |

### Session 94 — Feature Icons *(new collection, additive)*
| Task | Goal |
|------|------|
| FI1–FI3 | `productFeatures` schema + seed + admin CRUD |
| FI4–FI6 | Store CRUD + product form integration + card/detail badges |

### Session 95 — Bulk Actions public *(additive UI)*
| Task | Goal |
|------|------|
| BK1, BK2 | Public listing selection mode + sticky bulk action bar |
| BK3 | Compare overlay (desktop table + mobile swipe) |

### Session 96 — Query/Sieve *(medium risk — Firebase Function + API param changes)*
| Task | Goal |
|------|------|
| Q5 | Firestore composite indexes (safe subset — deploy only) |
| Q1–Q4, Q6 | `listingProcessor` Firebase Function + API param standardisation + infinite scroll |

### Sessions 97–101 — Seed Scale *(low risk)*
| Tasks | Goal |
|-------|------|
| P23, P24 | Standard products 100+ + auctions 20 + pre-orders 10 |
| P25, P26 | Categories 55+ + Users 15+ + Brands 25+ |
| P27, P28 | Reviews 60+ + Orders 35+ + Blog 20+ + Events 15+ + FAQs 55+ |
| P29, P30 | Coupons 20+ + Notifications 40+ + Messages + SubCats + Grouped |
| P31 | Zod validation + PII masking + dry-run diff |

### Sessions 102–104 — RBAC UI *(additive, permission-gated)*
| Tasks | Goal |
|-------|------|
| RBAC1→RBAC10 | Permission constants → server resolver → SSR gates → API guards → Team UI |

### Sessions 105–107 — BAN system UI *(additive)*
| Tasks | Goal |
|-------|------|
| BAN1→BAN9 | Schema → enforcement → ticket API → admin UI → Firebase functions |

### Sessions 108–110 — SCAM system UI *(additive)*
| Tasks | Goal |
|-------|------|
| SCAM2, SCAM4, SCAM6, SCAM7, SCAM8 | Admin management + FAQs + acknowledgement + SEO + notifications |

### Sessions 111+ — Deferred
| Tasks | Goal |
|-------|------|
| G1, G2 | Product templates |
| D2, D3, VC2, VC4, LL4, LL5 | User account forms |
| GD1–GD22 | Guide pages (store/buyer/admin) |
| ARCH1, ARCH6, ARCH7, ARCH9 | Store identity audit |
| SL6, UX8, I7, O5, HS4-E | Misc deferred (watermark CDN, Shiprocket, per-store Google Reviews) |

---

## 📅 PLAN SNAPSHOT

```
Sessions done:  60–89b + AX1-partial (107 tasks ✅, 283 remaining per tracker)

PHASE                   SESSIONS          STATUS
────────────────────────────────────────────────────────────────────
Foundation              60–64             ✅ done
Carousel                65                ✅ done
Sections                66–67             ✅ done
Admin CRUD              68–75             ✅ done
Public Catalogue        76 + 76-infra     ✅ done
SEO + Bulk              82 + 82-ext       ✅ done
RBAC/BAN/SCAM sch.      80-schema         ✅ done
sellerId migration      81                ✅ done
Seller Products         77-impl           ✅ done
Cart Integrity          79-impl           ✅ done
User Account Core       78-impl           ✅ done
Store Settings          80-impl           ✅ done
Store Finance           81-impl           ✅ done (post-alpha)
Content rewrites        83/84             ✅ VD8/VD9/VD10 done
Custom Fields           84                ✅ L1, L2, L3 done
Sub-listings            85                ✅ SC1–SC4 done
Grouped Listings        86                ✅ GP1, GP2 done
Social Feed             87                ✅ S1–S5 done
Search + Routes         88                ✅ RC3, RC4 done
UX Polish               89a               ✅ VD12, J16, J17, wishlist filter
FAQ + WA redesign       89b               ✅ FAQSection, WhatsApp, @types/react dedup
──────────────────── 🚀 ALPHA deployed to Vercel prod 2026-05-10 ──────────────
Action constants        90 (partial)      🔄 AX1 constants ✅; hook+migration ⏳
Color tokens            90-colors         ⏳ X7a, X7b
Layout tokens           91                ⏳ X8a, X8b
Action URLs + bars      92                ⏳ AX2, AX3
Extended sections       93                ⏳ EX1–EX5, YT1
Feature icons           94                ⏳ FI1–FI6
Bulk actions            95                ⏳ BK1–BK3
Query/Sieve             96                ⏳ Q1–Q6 (Firebase Function — higher risk)
Seed Scale              97–101            ⏳ P23–P31
RBAC UI                 102–104           ⏳ RBAC1–RBAC10
Bans UI                 105–107           ⏳ BAN1–BAN9
Scams UI (cont.)        108–110           ⏳ SCAM2,4,6,7,8
Deferred                111+              ⏳
────────────────────────────────────────────────────────────────────

⚠️  Firebase fully reset 2026-05-10 — re-seed all collections via /demo/seed
⚠️  RBAC/BAN/SCAM schemas done (80-schema, additive) — UI deferred to sessions 102–110
⚠️  appkit consumed via file:./appkit — no npm publish during local dev
```

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
9. prompt.md → update CURRENT / LAST COMPLETED (after EVERY task)
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
□ PROMPT     prompt.md CURRENT + LAST COMPLETED updated — after EVERY task
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
npm run watch:appkit   # terminal 1 — compiles appkit/src/ → appkit/dist/ on save
npm run dev            # terminal 2 — Next.js picks up appkit/dist/ changes live
npx tsc --noEmit       # must pass before commit (both repos)
```

**appkit is consumed via `file:./appkit` during local dev** — no npm publish needed.
Only publish to npm when the user explicitly asks. Vercel auto-deploy is disabled (`vercel.json`).
See CLAUDE.md "Appkit Local Dev vs Publish Rules" for the full publish checklist.

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
| Action constants | `appkit/src/features/products/constants/action-defs.ts` |

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
✗ Keep more than 1 LAST COMPLETED block in this file — drop oldest on every session end
```

---

follow all rules and complete all tasks, prioritize pending tasks or tech debt first. check for tsc errors before proceeding to next task. update ascii diagrams after every session.

in the end recheck all the changes, update the tracker, prompt.md file, update our memory. update ascii diagrams and try to optimize and write better quality code so that we have more maintainability. also update or add the seed data and firebase indices and sieverjs and other config and the seedpanel entry for the same. make sure we use our html wrappers and themed contents with variables and no hardcoded text or breakpoints.
then commit all changes
