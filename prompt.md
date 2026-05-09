# letitrip.in — Master Working Prompt

> Paste at the start of every session.
> **Task status** → `crud-tracker.md` (authoritative).
> **Deferred/skipped** → `newchange.md` DEFERRED table (read before starting).
> **Architecture + imports** → `INSTRUCTIONS.md`.

---

## ⚡ CURRENT TASK — Session 72 (catalogue release + store identity architecture)

| Task | Status | What to do |
|------|--------|------------|
| **M1** | ✅ | Analytics date range forwarded to Firebase Function |
| **VA19** | ✅ | Analytics charts + date range picker already wired |
| **VA3** | ✅ | AdminCategoryEditorView fixed (loadCategoryOptions bug, getRowHref, RC4 routes) |
| **VA12** | ✅ | AdminStoreEditorView SideDrawer built; AdminStoresView RowActionMenu wired |
| **M3** | 🚫 | Superseded by ARCH4 |
| **VA13** | 🚫 | Superseded by ARCH4 |
| **ARCH4** | ✅ | Admin payouts: storeId/storeName identity + mark-paid (Modal, 1 field) + CSV export |
| **I3** | ✅ | Seed reset button in AdminSectionsView toolbar |

### Completed last session (71)
| Task | Status | Done |
|------|--------|------|
| **A5** | ✅ | FAQs editor — `AdminFaqEditorView.tsx` built; all fields; create/edit/delete |
| **VA5** | ✅ | FAQ list page wired (`/admin/faqs/page.tsx`); RC4 partial (deleted old `[[...action]]`) |
| **F5** | ✅ | Navigation CMS API routes; nav items stored in siteSettings.navbarConfig.navItems |
| **VA7** | ✅ | Nav CMS list page — `AdminNavigationView` rewritten; up/down reorder; inline visibility toggle; SideDrawer editor |
| **VA8** | ✅ | Site Settings 12-tab form — `AdminSiteSettingsView`; all groups; per-tab save; masked inputs; Slider for watermark |

> ℹ️ **HS4-E new task** — User requested Google Reviews also available per-store on the store About page. Logged as task HS4-E in tracker (⏳).

### Next sessions
| Session | Tasks | Goal |
|---------|-------|------|
| 73 | N3, B1, VA10, B2, VA9, N2, VA11 | Stores / Users / Orders / Reviews management forms |
| 74 | ARCH1–ARCH3, ARCH5 | Public API sanitization + cart items schema + reviews schema |
| 75 | ARCH6–ARCH9 | Product UI cards + seller profile + seed data unification |

---

## ⛔ GOLDEN RULES

```
✅ = fully done per spec, TS passes, verified in browser
Never silently skip a spec bullet — defer with new task or do it now
Never leave stale "remaining: old-task-ID" on ✅ tasks
npx tsc --noEmit must pass before every commit (both repos)
```

### Route definitions — no ambiguity
- NEVER create a `page.tsx` at a path that also has a `[[...action]]` child folder — Next.js rejects it ("same specificity" error)
- **Standard CRUD pattern for all new routes**: `/resource/page.tsx` (list) + `/resource/new/page.tsx` (create) + `/resource/[id]/edit/page.tsx` (edit). Do NOT use `[[...action]]` catch-alls for new CRUD routes.
- Before creating a new page file, check: does a `[[...action]]` folder already exist at the same parent? If yes, either add inside the catch-all OR convert to dedicated routes (preferred) — never add a sibling `page.tsx`.
- All route strings → `ROUTES.*` constants only (`appkit/src/next/routing/route-map.ts`). Zero hardcoded strings like `href="/admin/products"`. See tasks RC2 + RC4.

### SeedPanel — always in sync
- Any change to a **schema** (new field, renamed field, removed field), **collection** (new collection, renamed collection), **feature** (new feature type, new seed item type), or **user-facing config** (new slug pattern, new media field, new PII field) → update the SeedPanel source in the SAME session:
  1. Update the `FieldDef[]` array for that collection in `SeedPanel.tsx` (or the appkit schema table source it reads from)
  2. Update `slugPattern` chip if the ID format changed
  3. Update `mediaFields` chips if new image/video fields were added
  4. Update the PII label if new personally-identifiable fields were added
  5. Update the actual seed file in `appkit/src/seed/` so new seed documents match the new shape
- This applies to NEW features/collections being added mid-project too — add a new card to SeedPanel when a new collection is introduced
- Never leave the SeedPanel out of date — it is the canonical documentation and is used to verify data correctness

### ASCII diagrams — draw as you build
- `asciiDiagrams.md` (root of project) is the canonical diagram file — one diagram per page/view
- When you build or significantly change a page/view/form/modal: add or update its diagram in `asciiDiagrams.md`
- Diagrams must show **everything**: all tabs, all columns (for tables), all form fields, all action buttons, all modals/drawers opened from that page, filter states, empty states
- Nothing may be omitted — a tab or field missing from the diagram means it will be forgotten in future sessions
- Format: ASCII box-drawing with label `## [Area] > [Page Name]` heading above each diagram

### Component index — look before you create
- Before writing any new component, util, or constant: check `appkit/index.md` and `src/index.md`
- If an existing entry covers your need, reuse it — never create a same-named or same-purpose duplicate
- After every task that adds, renames, or removes a component/util/constant: update the relevant row in `appkit/index.md` or `src/index.md`
- Format: `| Name | Path | What it does |` — one row per export

### Seed data truth
- SeedPanel SP1/P10 documentation (slugPattern, mediaFields, PII flags, searchable/filterable/sortable column metadata) is **canonical** for all 23 collections
- Seed files in `appkit/src/seed/` updated **in the same session** as any schema change — never defer to a later session
- P23–P31 scale sessions expand counts only; field shapes and metadata are already correct per SP1
- Do NOT re-derive field shapes from memory — read `appkit/src/seed/` source files + SeedPanel schema tables

### UI rules
- Missing data → empty state, never crash/white screen
- Every optional prop needs a default
- Half-renames are banned — rename = one atomic commit covering producer + consumer

### Content
- Brand: **"LetiTrip"** (capital L, lowercase i, capital T) — grep after every content update
- No generic marketplace copy — reference real collectibles niche (Pokémon TCG, Hot Wheels, Beyblades, anime figures)

### Buttons vs links — never mix
```
<Button>          → action / mutation / modal open only — NEVER onClick={router.push}
<Link href={ROUTES.*}> → navigation — ALWAYS ROUTES.* constant, no hardcoded strings
<Button asChild><Link href={ROUTES.*}>Label</Link></Button>  → styled-button navigation
```

### SideDrawer vs Modal — pick by field count
```
0 fields (confirm only) → ConfirmDeleteModal
1–2 form fields         → Modal
3+ form fields          → SideDrawer   ← never cram 3+ inputs into a modal
```

### Store identity — public vs admin vs internal
```
Public routes + UI (product cards, detail pages, reviews, cart, profiles):
  Show:  storeId / storeName / storeSlug
  Never: sellerId / sellerName / ownerId

Admin routes + UI only:
  May additionally show: ownerId (Firebase UID of the store owner)

Internal server logic only (checkout, analytics, payout calculation, auth checks):
  sellerId (= Firebase UID) — stays as-is for auth; NEVER returned in API responses
```

### User roles — 3 public tiers
```
user     → basic buyer (no store)
seller   → has ≥1 store; role assigned on store creation
admin    → platform admin (moderator = admin sub-role, internal only)
```

### No hardcoded values
```
Colors  → var(--appkit-color-*)   No: #hex, rgb(), rgba()
Layout  → @screen md {}, var(--appkit-z-*), var(--appkit-size-*)
         No: raw px breakpoints, z-index ints, Tailwind arbitrary [px]
```

### Reuse before creating
Search `appkit/src/` before writing anything new.
- Primitives → `appkit/src/ui/`
- Features → `appkit/src/features/[domain]/`
- Pages = thin wrappers only

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
8. newchange.md → prepend new task entry (after EVERY task, not just end of session)
9. prompt.md → update CURRENT TASK status + PLAN SNAPSHOT (after EVERY task)
10. crud-tracker.md → mark ✅, fill Part#, update Summary + timestamp
```

### Checklist per task
```
□ TRACKER    crud-tracker.md marked 🔄 at start
□ DEFERRED   newchange.md DEFERRED table checked
□ CODE       implemented, tsc 0 errors, browser verified
□ COMMIT     correct format, one task, no TS errors
□ SEED       updated or noted "no change needed"
□ NEWCHANGE  newchange.md prepended with task entry — after EVERY task
□ PROMPT     prompt.md CURRENT TASK + PLAN SNAPSHOT updated — after EVERY task
□ TRACKER    marked ✅, Part# filled, Summary + timestamp updated
```

### Build cycle (appkit changes)
```bash
npm run watch:appkit   # terminal 1
npm run dev            # terminal 2
npx tsc --noEmit       # must pass before commit (both repos)
```

---

## ARCHITECTURE ASCII

```
letitrip.in/                       appkit/ (local package)
├── src/
│   ├── app/[locale]/              ├── src/
│   │   ├── (public)/              │   ├── features/
│   │   │   ├── products/          │   │   ├── products/
│   │   │   ├── auctions/          │   │   ├── homepage/
│   │   │   ├── stores/            │   │   ├── admin/
│   │   │   ├── categories/        │   │   ├── auth/
│   │   │   ├── blog/              │   │   ├── search/
│   │   │   └── events/            │   │   └── media/
│   │   ├── admin/                 │   ├── ui/
│   │   ├── store/                 │   │   ├── components/
│   │   └── account/               │   │   └── hooks/
│   ├── actions/                   │   ├── seed/
│   ├── constants/                 │   │   ├── *-seed-data.ts
│   └── components/                │   │   └── manifest.ts
│       └── dev/SeedPanel.tsx      │   └── repositories/
```

```
Request flow:
Browser → Next.js page (RSC) → Server Action / API Route → Repository → Firestore
                                                         ↘ Firebase Storage (media)
                                                         ↘ Firebase Auth (users)
```

```
Seed data flow:
/demo/seed page
  → SeedPanel.tsx (per-resource accordion cards)
  → POST /api/demo/seed { action, collections, dryRun }
  → demo-seed-actions.ts (runner)
  → appkit/src/seed/*-seed-data.ts files
  → Firestore batch.set(ref, data, { merge: true })
```

```
Product type matrix:
┌────────────────┬──────────────┬────────────────┬────────────────┐
│ Type           │ Prefix       │ isAuction      │ isPreOrder     │
├────────────────┼──────────────┼────────────────┼────────────────┤
│ Standard       │ product-     │ false          │ false          │
│ Auction        │ auction-     │ true           │ false          │
│ Pre-order      │ preorder-    │ false          │ true           │
│ Grouped        │ group-       │ false          │ false (bundle) │
└────────────────┴──────────────┴────────────────┴────────────────┘
```

```
Homepage section types (homepageSections collection — 21 types as of HS1):
welcome · carousel · stats · trust-indicators · categories · brands
products · pre-orders · auctions · banner · features · reviews
whatsapp-community · faq · blog-articles · newsletter · stores · events
social-feed · custom-cards · google-reviews
```

---

## SLUG PREFIX REGISTRY

| Resource | Prefix | Example |
|----------|--------|---------|
| Product (standard) | `product-` | `product-hot-wheels-redline-1969` |
| Auction | `auction-` | `auction-pokemon-charizard-psa9` |
| Pre-order | `preorder-` | `preorder-pokemon-sv5-booster-box` |
| Grouped | `group-` | `group-pokemon-starter-bundle` |
| Store | `store-` | `store-mistys-water-cards` |
| Category | `category-` | `category-pokemon-cards` |
| Brand | `brand-` | `brand-bandai` |
| Event | `event-` | `event-pokemon-tournament-june` |
| Blog post | `blog-` | `blog-how-to-grade-pokemon-cards` |
| Review | `review-` | `review-charizard-psa9-ravi-20260508` |
| User | `user-` | `user-seller-cards` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-welcome10` |
| Section | `section-` | `section-featured-products` |
| Carousel slide | `slide-` | `slide-hero-homepage` |
| Order | `order-` | `order-3-20260508-a1b2c3` |
| Bid | `bid-` | `bid-charizard-psa9-ravi-20260508-x7y8z9` |
| Notification | `notif-` | `notif-order-shipped-001` |
| Payout | `payout-` | `payout-mistys-cards-20260508-q1w2e3` |
| Sub-listing category | `sublisting-` | `sublisting-base-set-charizard` |

**Rule:** `id === slug` for products, stores, categories, brands, blog, events, FAQs, sections, nav items, carousel slides — these are pure slugs with no timestamp or random suffix.

**Semantic generator IDs** (slug-like with date + random suffix — NOT Firestore auto-IDs):
- orders → `order-{itemCount}-{YYYYMMDD}-{rand6}`
- bids → `bid-{productName}-{userFirstName}-{YYYYMMDD}-{rand6}`
- reviews → `review-{productName}-{userFirstName}-{YYYYMMDD}`
- payouts → `payout-{sellerName}-{YYYYMMDD}-{rand6}`

**True Firestore auto-IDs** (no slug, no prefix): carts, wishlists, eventEntries, notifications, sessions.

---

## MEDIA FILENAME SLUG PATTERNS

All media files stored in Firebase Storage use SEO slugs generated by `generateMediaFilename(ctx)` in `appkit/src/utils/id-generators.ts`. The `ctx.type` field selects the pattern.

| Context Type | Storage Pattern | Example Filename |
|---|---|---|
| `user-avatar` | `user-avatar-{displayName}-{YYYYMMDD}.{ext}` | `user-avatar-ravi-kumar-20260508.jpg` |
| `store-logo` | `store-logo-{storeName}-{YYYYMMDD}.{ext}` | `store-logo-mistys-water-cards-20260508.png` |
| `store-banner` | `store-banner-{storeName}-{YYYYMMDD}.{ext}` | `store-banner-mistys-water-cards-20260508.jpg` |
| `category-image` | `category-image-{categoryName}-{YYYYMMDD}.{ext}` | `category-image-action-figures-20260508.jpg` |
| `product-image` | `product-image-{productName}-{n}-{YYYYMMDD}.{ext}` | `product-image-charizard-psa9-1-20260508.jpg` |
| `product-video` | `product-video-{productName}-{YYYYMMDD}.{ext}` | `product-video-charizard-psa9-20260508.mp4` |
| `auction-image` | `auction-image-{productName}-{n}-{YYYYMMDD}.{ext}` | `auction-image-charizard-1st-edition-1-20260508.jpg` |
| `preorder-image` | `preorder-image-{productName}-{n}-{YYYYMMDD}.{ext}` | `preorder-image-goku-ultra-ego-1-20260508.jpg` |
| `rich-text-image` | `rich-text-image-{context}-{YYYYMMDD}-{rand4}.{ext}` | `rich-text-image-blog-post-20260508-a1b2.jpg` |
| `review-image` | `review-image-{productName}-{n}-{YYYYMMDD}.{ext}` | `review-image-hot-wheels-redline-1-20260508.jpg` |
| `review-video` | `review-video-{productName}-{YYYYMMDD}.{ext}` | `review-video-hot-wheels-redline-20260508.mp4` |
| `blog-cover` | `blog-cover-{postTitle}-{YYYYMMDD}.{ext}` | `blog-cover-how-to-grade-pokemon-cards-20260508.jpg` |
| `blog-content-image` | `blog-content-image-{postTitle}-{n}-{YYYYMMDD}.{ext}` | `blog-content-image-how-to-grade-pokemon-cards-1-20260508.jpg` |
| `blog-additional-image` | `blog-additional-image-{postTitle}-{n}-{YYYYMMDD}.{ext}` | `blog-additional-image-how-to-grade-pokemon-cards-2-20260508.jpg` |
| `event-cover` | `event-cover-{eventTitle}-{YYYYMMDD}.{ext}` | `event-cover-pokemon-tournament-june-20260508.jpg` |
| `event-image` | `event-image-{eventTitle}-{n}-{YYYYMMDD}.{ext}` | `event-image-pokemon-tournament-june-1-20260508.jpg` |
| `event-winner-image` | `event-winner-image-{eventTitle}-{winnerName}-{YYYYMMDD}.{ext}` | `event-winner-image-pokemon-tournament-june-ravi-kumar-20260508.jpg` |
| `event-additional-image` | `event-additional-image-{eventTitle}-{n}-{YYYYMMDD}.{ext}` | `event-additional-image-pokemon-tournament-june-3-20260508.jpg` |
| `carousel-image` | `carousel-image-{slideTitle}-{YYYYMMDD}.{ext}` | `carousel-image-hero-homepage-20260508.jpg` |
| `invoice` | `invoice-{orderId}-{YYYYMMDD}.pdf` | `invoice-order-3-20260508-a1b2c3-20260508.pdf` |
| `payout-doc` | `payout-doc-{sellerName}-{YYYYMMDD}.pdf` | `payout-doc-mistys-water-cards-20260508.pdf` |

All files are stored in Firebase Storage (private bucket), served to clients via the `/api/media/[...slug]` Vercel proxy which applies watermarking. Never write raw `firebasestorage.googleapis.com` URLs into Firestore — always use the `/media/<slug>` path.

---

## COMPONENT REUSE

| Component | Location | Use for |
|-----------|----------|---------|
| `RichTextEditor` | `appkit/src/ui/components/RichTextEditor.tsx` | Rich content editing |
| `RichTextRenderer` | `appkit/src/ui/components/RichTextRenderer.tsx` | Displaying rich HTML (DOMPurify) |
| `ListingLayout` | `appkit/src/ui/components/ListingLayout.tsx` | Public listing pages |
| `SlottedListingView` | `appkit/src/ui/components/SlottedListingView.tsx` | Admin/seller listing tables |
| `SideDrawer` | `appkit/src/ui/components/SideDrawer.tsx` | Create/edit side forms |
| `RowActionMenu` | `appkit/src/ui/components/RowActionMenu.tsx` | Per-row actions |
| `ConfirmDeleteModal` | `appkit/src/ui/components/ConfirmDeleteModal.tsx` | Confirm destructive actions |
| `AdminListingScaffold` | `appkit/src/features/admin/components/AdminListingScaffold.tsx` | Admin list page template |
| `DynamicSelect` | `appkit/src/ui/components/DynamicSelect.tsx` | Async selects |
| `InlineCreateSelect` | `appkit/src/ui/components/InlineCreateSelect.tsx` | Create-on-the-fly dropdown |
| `MediaUploadField` | `appkit/src/features/media/upload/MediaUploadField.tsx` | All image/media fields |
| `MediaPickerModal` | `appkit/src/features/media/components/MediaPickerModal.tsx` | Upload + URL tab picker |
| `useUrlTable` | `@mohasinac/appkit/client` | URL-backed pagination/sort/search |
| `usePendingFilters` | `@mohasinac/appkit/client` | Deferred filter state |
| `ProductForm` | `appkit/src/features/products/components/ProductForm.tsx` | Seller product create/edit |
| `AddressForm` | `appkit/src/features/account/components/AddressForm.tsx` | Address create/edit |
| `PlaceBidForm` | `appkit/src/features/products/components/PlaceBidForm.tsx` | Auction bid form |
| `BulkActionBar` | `appkit/src/ui/components/BulkActionsBar.tsx` | Bulk actions |

---

## IMPORT RULES

```ts
// Client components ("use client")
import { ... } from "@mohasinac/appkit/client"

// Server components / actions
import { ... } from "@mohasinac/appkit"   // or /server

// UI primitives only
import { ... } from "@mohasinac/appkit/ui"

// Never import server-only in client components
```

Seed upsert: always `batch.set(ref, data, { merge: true })`.

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| Task tracker | `crud-tracker.md` |
| Deferred items + session log | `newchange.md` |
| Architecture + import rules | `INSTRUCTIONS.md` |
| Seed files | `appkit/src/seed/` |
| Seed API | `src/app/api/demo/seed/route.ts` |
| SeedPanel UI | `src/components/dev/SeedPanel.tsx` |
| Public layout shell | `src/app/[locale]/LayoutShellClient.tsx` |
| Cart | `src/components/routing/CartRouteClient.tsx` |
| Checkout | `src/components/routing/CheckoutRouteClient.tsx` |
| Slug utility | `appkit/src/utils/string.formatter.ts` (`slugify`) |
| Field constants | `src/constants/field-names.ts` |
| API constants | `src/constants/api.ts` |
| Route constants | `@mohasinac/appkit/client` (`ROUTES`) |
| SEO metadata | `src/constants/seo.server.ts` |

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

## PLAN SNAPSHOT — ASCII (update each session)

```
Sessions done: 60–71, 67-b (73 tasks ✅)
Current:       72 ✅ complete — ARCH4+I3 done (payouts storeId + mark-paid/CSV + seed reset)
Next:          73 (N3, B1, VA10, B2, VA9, N2, VA11) — Stores/Users/Orders/Reviews forms
               74 (ARCH1–ARCH3, ARCH5) — Public API sanitization + cart/reviews schema
               75 (ARCH6–ARCH9) — Product cards + seller profile + seed data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE          SESSIONS    STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Foundation     60–64       ✅ done (45/199 tasks)
Carousel       65          ✅ done (CF1)
Sections-1     66          ✅ done (HS1+HS2+HS3)
Sections-2     67, 67-b    ✅ done — HS4+HS5 complete (Session 67-b)
Admin CRUD     68–73       🔄 in progress (Sessions 68–71 done; 72–73 remaining)
Store Identity 74–75       ⏳ ARCH1–ARCH9 (storeId/storeName public identity)
Store CRUD     75–76       ⏳
User Account   77          ⏳
Custom Fields  78          ⏳
Public Pages   79–80       ⏳
Cart/Checkout  81          ⏳
Social Feed    82          ⏳
Query/Sieve    83          ⏳
Grouped/Sub    84–85       ⏳
Search+Routes  86          ⏳
Tokens         87–88       ⏳
Deferred       89+         ⏳
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEED DATA TARGETS (from P23+):
  Standard products    20  →  100+  (P23)
  Auctions              6  →   20   (P24)
  Pre-orders            5  →   10   (P24)
  Categories           23  →   55+  (P25)
  Users                 9  →   15+  (P26)
  Brands               13  →   25+  (P26)
  Reviews              15  →   60+  (P27)
  Orders               10  →   35+  (P27)
  FAQs                 21  →   55+  (P28)
  Blog posts            8  →   20+  (P28)
  Coupons               5  →   20+  (P29)
  Notifications        10  →   40+  (P29)
  New: storeCoupons     0  →   10+  (P29)
  New: messages         0  →   50+  (P30)
  New: sublistingCats   0  →   20+  (SC1)
  New: groupedListings  0  →    8+  (GP1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
