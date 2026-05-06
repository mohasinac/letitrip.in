# letitrip.in — Master Working Prompt

> Paste at the start of every session.
> **Task status** → `crud-tracker.md` (authoritative).
> **Deferred/skipped** → `newchange.md` DEFERRED table (read before starting).
> **Architecture + imports** → `INSTRUCTIONS.md`.

---

## ⚡ CURRENT TASK — Session 65

| Task | What to do |
|------|------------|
| **CF1** | Hero Carousel full redesign — schema (`background`/`zone`/`settings`/`hover`), component (full-height, 4 bg types, configurable hover, per-slide autoplay, no blur), admin list (drag-reorder + RowActionMenu), admin editor (zone picker, 4-tab bg, cards 0–2, button repeater, live preview), API GET/POST/PUT/DELETE/reorder. Also fix P20 tech debt: update `homepage-sections-seed-data.ts` carousel section (removes `as unknown as SectionConfig` cast). |

**Pre-work:** `npx tsc --noEmit` → 0 errors in both repos before touching anything.

### Next sessions
| Session | Tasks | Goal |
|---------|-------|------|
| 66 | HS1, HS2, HS3 | Section schema + 11 missing builders + enhance 7 existing |
| 67 | HS4, HS5 | Google Reviews + Custom Cards section |
| 68 | X2, A1, VA2, I1 | Toast standard + Products 3-mode editor |

---

## ⛔ GOLDEN RULES

```
✅ = fully done per spec, TS passes, verified in browser
Never silently skip a spec bullet — defer with new task or do it now
Never leave stale "remaining: old-task-ID" on ✅ tasks
npx tsc --noEmit must pass before every commit (both repos)
```

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
8. newchange.md → prepend new session Part entry
9. crud-tracker.md → mark ✅, fill Part#, update Summary + timestamp
```

### Checklist per task
```
□ TRACKER   crud-tracker.md marked 🔄 at start
□ DEFERRED  newchange.md DEFERRED table checked
□ CODE      implemented, tsc 0 errors, browser verified
□ COMMIT    correct format, one task, no TS errors
□ SEED      updated or noted "no change needed"
□ NEWCHANGE newchange.md prepended with session Part entry
□ TRACKER   marked ✅, Part# filled, Summary + timestamp updated
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
Homepage section types (homepageSections collection):
hero · featured-products · trending · new-arrivals · flash-sale
brand-list · category-grid · ad-banner · faq-preview · blog-preview
events-preview · social-feed · google-reviews · custom-cards
store-spotlight · deals · pre-orders-preview · auction-countdown
sublisting-carousel
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
| Review | `review-` | `review-product-xxx-user-yyy` |
| User | `user-` | `user-seller-cards` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-welcome10` |
| Section | `section-` | `section-featured-products` |
| Carousel slide | `slide-` | `slide-hero-homepage` |
| Order | `order-` | `order-ravi-001` |
| Bid | `bid-` | `bid-charizard-auction-ravi-1` |
| Notification | `notif-` | `notif-order-shipped-001` |
| Payout | `payout-` | `payout-store-cardgame-001` |
| Sub-listing category | `sublisting-` | `sublisting-base-set-charizard` |

**Rule:** `id === slug` for products, stores, categories, brands, blog, events, FAQs, sections, nav items, carousel slides.
**System-generated IDs** (not slug): orders, bids, reviews, carts, notifications, sessions, users.

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
✗ Skip newchange.md update after completing a task
✗ Skip crud-tracker.md update — after every task AND every 30 minutes
✗ Use dangerouslySetInnerHTML without RichTextRenderer
✗ Use as unknown as Foo without a ⚠️ Tech debt: note in tracker
✗ Leave stale "remaining: old-task-ID" notes on ✅ entries
✗ Update INSTRUCTIONS.md §12 "LIVE SITE" column — it is a reference snapshot
```

---

## PLAN SNAPSHOT — ASCII (update each session)

```
Sessions done: 60–64 (45 tasks ✅)
Current:       65 (CF1 — Carousel redesign)
Next:          66 (HS1–3), 67 (HS4–5), 68 (X2+A1+VA2+I1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE          SESSIONS    STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Foundation     60–64       ✅ done (45/199 tasks)
Carousel       65          🔄 CF1 in progress
Sections       66–67       ⏳
Admin CRUD     68–73       ⏳
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
