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

## ⚡ LAST COMPLETED — Session 83 ⚠️ partial 2026-05-10 (SCAM3 live + SCAM5 form + VD8)

| Task | What was done |
|------|--------------|
| **SCAM3** | Subcollection live data wired: `listPublicIncidents()` + `listPublicComments()` + `findManyById()` in repository; `getScammerProfilePageData()` server action; `/scams/[id]/page.tsx` passes real data; ScamProfileView renders incident cards, comment cards (role/Accused/Victim badges), related scammer links. `/scams/types` import fixed. ✅ |
| **SCAM5** | Full ScamReportForm (3 sections: identity/TagInputs, what-happened/type-helper/char-counter, privacy/agreement); POST `/api/scams/reports` (auth, Zod, paise); `API_ROUTES.SCAMS.REPORTS`. Evidence upload / ban check / rate limit / suggest deferred. ⚠️ |
| **VD8** | `messages/en.json` `about` namespace (25 keys) rewritten — collectibles-specific mission, values, milestones. ✅ |
| **VD9/VD10** | Deferred — user stopped session. ⏳ |
| **TypeScript** | Both repos pass `npx tsc --noEmit` 0 errors. |

---

## 🔜 NEXT — Session 83-cont ⏳ (VD9 + VD10 content + Session 84 Custom Fields)

### Carry-over from Session 83
| Tasks | Goal |
|-------|------|
| VD9 | Expand becomeSeller (~9→25 keys) + rewrite sellerGuide (42 keys) — collectibles-specific |
| VD10 | Legal pages: terms (IT Act/Consumer Protection/collectibles rules), privacy (DPDP Act 2023), cookies (essential/analytics/marketing), refundPolicy (8+ sections) |

### Session 84 — Custom Fields
| Tasks | Goal |
|-------|------|
| L1 | Custom fields schema + CustomFieldsEditor component |
| L2 | Custom section render on product detail pages |
| L3 | Custom sections CRUD in product create/edit forms |

### Session 85 — Sub-listing categories
| Tasks | Goal |
|-------|------|
| SC1→SC4 | Schema → Admin CRUD → form field + carousel → public page |

### Session 86 — Grouped Listings
| Tasks | Goal |
|-------|------|
| GP1→GP2 | Schema + ShowGroupSection + edit-screen group settings panel |

### Session 87 — Social Feed
| Tasks | Goal |
|-------|------|
| S4, S1, S2, S3, S5 | Credentials → API fetcher → section component → admin builder → seed |

### Session 88 — Search + Routes (already mostly done — SR1/SR2/SR3/RC1/RC2 ✅)
| Tasks | Goal |
|-------|------|
| RC4 | Route ambiguity audit + CRUD route pattern standardisation |
| RC3 | Button-vs-Link full sweep (asChild pattern) |

### Session 89 — Query/Sieve
| Tasks | Goal |
|-------|------|
| Q5, Q1, Q2, Q3, Q4, Q6 | Firestore indexes → Firebase Function → param standardisation → infinite scroll |

### Sessions 90–91 — Token Audits
| Tasks | Goal |
|-------|------|
| X7a, X7b | Color token audit |
| X8a, X8b | Layout token audit |

### Sessions 92–95 — Seed Scale
| Tasks | Goal |
|-------|------|
| P24, P25, P28, P29, P30, P31 | Auctions+pre-orders, categories, blog+events+FAQs, coupons+notifications, new collections, seed runner |

### Sessions 96–98 — RBAC
| Tasks | Goal |
|-------|------|
| RBAC1→RBAC10 | Permission constants → server resolver → SSR gates → API guards → Team UI |

### Sessions 99–101 — BAN system
| Tasks | Goal |
|-------|------|
| BAN1→BAN9 | Schema → enforcement → ticket API → admin UI → Firebase functions |

### Sessions 102–108 — SCAM system
| Tasks | Goal |
|-------|------|
| SCAM2, SCAM4, SCAM6, SCAM7, SCAM8 | Admin management + FAQs + acknowledgement + SEO + notifications |

### Sessions 109+ — Deferred
| Tasks | Goal |
|-------|------|
| EX1–EX5, YT1 | Extended homepage sections + YouTube feed |
| FI1–FI6 | Feature icons & badges |
| AX1–AX3 | Action system + URL routing + sticky bars |
| BK3 | Compare overlay |
| G1, G2 | Product templates |
| D2, D3, VC2, VC4, LL4, LL5 | User account forms |
| GD1–GD22 | Guide pages (store/buyer/admin) |
| ARCH1, ARCH6, ARCH7, ARCH9 | Store identity audit |
| SL6, UX8, I7, O5 | Misc deferred |

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
Sessions done:  60–83 (105 tasks ✅, 247 remaining)
                ✅ Foundation → Admin CRUD → Public Catalogue → SEO
                ✅ RBAC/BAN/SCAM schemas (80-schema)
                ✅ sellerId migration (81)
                ✅ Bulk selection + BulkActionsBar (82-ext)
                ✅ UX shells + Seller product forms (77-impl)
                ✅ Cart integrity + wishlist validate (79-impl)
                ✅ Store settings (80-impl)
                ✅ SCAM public pages: registry, profile, types, report form (83)
Next:           VD9 + VD10 → L1/L2/L3 (Custom Fields) → SC1–SC4

⚠️  Firebase fully reset 2026-05-10 — re-seed all collections via /demo/seed
⚠️  RBAC/BAN/SCAM schemas done (80-schema, additive) — UI deferred to sessions 96–104

PHASE               SESSIONS          STATUS
────────────────────────────────────────────────────────
Foundation          60–64             ✅ done
Carousel            65                ✅ done
Sections            66–67             ✅ done
Admin CRUD          68–75             ✅ done
Public Catalogue    76 + 76-infra     ✅ done
SEO + Bulk          82 + 82-ext       ✅ done
RBAC/BAN/SCAM sch.  80-schema         ✅ done
sellerId migration  81                ✅ done
Seller Products     77-impl           ✅ done
Cart Integrity      79-impl           ✅ done
Store Settings      80-impl           ✅ done
SCAM public pages   83                ✅ done (⚠️ VD9/VD10 deferred)
──────── 🚀 ALPHA ────────────────────────────────────
Content rewrites    83-cont           ⏳ VD9 + VD10
Custom Fields       84                ⏳ L1, L2, L3
Sub-listings        85                ⏳ SC1–SC4
Grouped Listings    86                ⏳ GP1, GP2
Social Feed         87                ⏳ S4, S1–S3, S5
Search+Routes       88                ⏳ RC3, RC4
Query/Sieve         89                ⏳ Q1–Q6
Token Audits        90–91             ⏳ X7a/b, X8a/b
Seed Scale          92–95             ⏳ P24–P31
RBAC UI             96–98             ⏳ RBAC1–RBAC10
Bans UI             99–101            ⏳ BAN1–BAN9
Scams UI (cont.)    102–108           ⏳ SCAM2,4,6,7,8
Deferred            109+              ⏳
────────────────────────────────────────────────────────
```
follow all rules and complete all tasks, prioritize pending tasks or tech debt first. check for tsc errors before proceeding to next task. update ascii diagrams after every session.

in the end recheck all the changes , update the tracker , prompt.md file , update our memory . update ascii diagrams and try to optimize and write better quality code so that we have more maintainability. also update or add the seed data and firebase indices and sieverjs and other config and the seedpanel entry for the same. make sure we use our html wrappers and themed contents with variables and no hardcoded text or breakpoints
then commit all changes