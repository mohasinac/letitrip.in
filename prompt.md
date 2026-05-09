# letitrip.in — Master Working Prompt

> Paste at the start of every session.
> **Task status** → `crud-tracker.md` (authoritative).
> **Deferred/skipped** → `newchange.md` DEFERRED table (read before starting).
> **Architecture + imports** → `INSTRUCTIONS.md`.

---

## ⚡ CURRENT TASK — Session 79 ✅ COMPLETE 2026-05-10 (FAQ Expansion + Live Stats + Homepage View Refactor)

| Task | Status | What was done |
|------|--------|--------------|
| **FAQ seed expansion** | ✅ | `faq-seed-data.ts` rewritten: 20 → 53 FAQs across all 7 categories. Platform risk disclaimers + store-set policy language throughout. 8 with `showOnHomepage: true`, 5 with `showInFooter: true`. |
| **FAQ section seed fix** | ✅ | Homepage FAQ section: `displayCount` 5→8, `expandedByDefault` false→true (SEO), `categories` array corrected to proper `FAQCategory` values. |
| **Stats seed — live metrics** | ✅ | Stats section in `homepage-sections-seed-data.ts` updated with actual seed counts (31/8/10/4.7★) and `source: "live"`, `metric`, `suffix` fields. |
| **LiveStatMetric type** | ✅ | `firestore.ts` — new `LiveStatMetric` union type (6 values). `StatsSectionConfig` extended with `source`/`metric`/`suffix` per stat. `FAQSectionConfig.categories` type fixed to correct union. |
| **live-stats.ts** | ✅ | New `appkit/src/features/homepage/lib/live-stats.ts` — batch-fetches only needed Firestore metrics at SSR time. All errors swallowed, static `value` used as fallback. |
| **Homepage view refactor** | ✅ | `MarketplaceHomepageView.tsx` split into 4 files: section-defaults.ts (constants), section-helpers.ts (cleanTitle/parseWelcomeDescription), section-renderer.tsx (full 21-type switch + ad slots), main view (data fetching only). |

## ⚡ PREVIOUS TASK — Session 78 ✅ COMPLETE 2026-05-10 (Carousel + Section Diagrams + Admin Form Builders)

| Task | Status | What was done |
|------|--------|--------------|
| **CF1 regression** | ✅ | HeroCarousel mobile height collapsed to 260px — removed `md:` prefix from all 3 height class applications so `${heightClass}` applies on mobile too. Fixed `slice(0,2)→slice(0,6)` to allow all 6 zone cards. |
| **Seed fix** | ✅ | `carousel-slides-seed-data.ts` slide 1: Hot Wheels card moved from zone 2 to zone 5 (row 2) — now both cards are in different rows as required by the zone grid spec. |
| **asciiDiagrams.md** | ✅ | Added full public-facing layout diagrams for all 21 homepage section types. Added Admin Section Editor shared modal shell + per-type form diagrams for all 21 types with proper UI notation (◉/◯ radio buttons, ☑/☐ checkboxes, boxed text inputs — no abstract shorthand). |
| **HS2/HS5 gap** | ✅ | `AdminSectionsView.tsx`: added typed builders for `carousel` (height/autoplay/dots/arrows), `custom-cards` (layout/columns/card repeater with all fields), and `google-reviews` (placeId/maxReviews/minRating/layout/display toggles). All 21 section types now have typed form builders — zero raw JSON textarea fallback. |

## ⚡ PREVIOUS TASK — Session 77 ✅ COMPLETE 2026-05-10 (Coupon Abuse Prevention)

| Task | Status | What was done |
|------|--------|--------------|
| **CU1** | ✅ | `applyCoupon()` called fire-and-forget at checkout. Accumulates per-coupon discount+orderIds across all order groups. Imported `couponsRepository` into checkout route. |
| **CU2** | ✅ | `getUserCouponUsageCount()` fixed — reads actual `usageCount` field instead of returning 0/1. Per-user limits > 1 now work correctly. |
| **CU3** | ✅ | `applyCoupon()` rewritten — `set({merge:true})` + `increment(usageCount)` + `arrayUnion(orderIds)`. Added `couponCode` param. Imported `arrayUnion` from field-ops. |
| **CU4** | ✅ | `superRefine()` in admin coupon create schema — rejects `percentage` coupons with `discount.value > 100`. |
| **CU5** | ✅ | Admin + store coupon PATCH routes — fetch coupon type, reject 422 if percentage + value > 100. |
| **CU6** | ✅ | New `coupon-usage-seed-data.ts` + `couponUsage` collection type in seed route. 6 realistic usage records seeded under user subcollections. |

## ⚡ PREVIOUS TASK — Session 76 ✅ COMPLETE 2026-05-10

> **Alpha goal**: Public catalogue works correctly for all 3 product types.

| Task | Status | What was done |
|------|--------|--------------|
| **VD7** | ✅ | 32 source files updated LetiTrip→LetItRip. CLAUDE.md + prompt.md brand rule updated. |
| **VD11** | ✅ | Added missing keys to en.json: helpPage namespace (new), howPayoutsWork infoCard*/diagramStep*/cta*, howPreOrdersWork infoCard*/diagramStep*/ctaOrders/diagramStep5Badge. |
| **VD4** | ✅ | Category+brand chips on ProductCard. Brand link + category link on all 3 detail views. brandSlug field added to ProductDocument + ProductItem types. |
| **VD5** | ✅ | Store card with "Visit Store →" button on all 3 detail views (standard/auction/preorder). |
| **VD6** | ✅ | /brands page with BrandsListView confirmed working (Session 75). |
| **VD1** | ✅ | /support page with HelpPageView confirmed working. helpPage i18n namespace added. |
| **VD2** | ✅ | Footer links verified. /support exists. LetItRip brand cleanup covers remaining gaps. |

## ✅ Session 76-content — COMPLETE 2026-05-10 (About + Legal pages + Admin editing)

| Task | Status | What was done |
|------|--------|--------------|
| About page | ✅ | `/about` now renders real LetItRip content. Async server component reads `getTranslations("about")` + `siteSettings.aboutContent.*` override. All sections populated: mission, how it works (buyers/sellers/bidders), values, journey milestones, CTA. |
| PolicyPageView fix | ✅ | Fixed broken namespace map (`privacyPolicy`→`privacy`, `termsOfService`→`terms`, etc.). Added Firestore fetch: if admin HTML set in `siteSettings.legalPages.*`, renders it; otherwise i18n sections. |
| Policy i18n | ✅ | Added `sections[]`, `intro`, `relatedTitle`, `relatedPrivacy/Terms/Cookies/Refund` to `terms`, `privacy`, `cookies`, `refundPolicy` namespaces in `messages/en.json`. All 4 policy pages now show full content. |
| Admin editing | ✅ | New **⓪ About** tab added to `AdminSiteSettingsView` (first tab). Edits hero title/subtitle, mission title/text, CTA title → saved to `siteSettings.aboutContent.*`. Legal HTML already editable via existing ⑫ Legal tab. |
| Metadata | ✅ | SEO `Metadata` exports added to about, privacy, terms, cookies, refund-policy, shipping-policy pages. |
| Diagrams | ✅ | `asciiDiagrams.md` updated: Site Settings now shows 13 groups + ⓪ About tab; new diagrams for About, Privacy, Terms, Cookie, Refund, Shipping pages. |

## 🔜 NEXT SESSION — Session 77-ux: UX Foundation (Form Shells)

> **Must complete before Session 77.** Builds all form primitives used by Sessions 77–80.

| Task | Goal |
|------|------|
| UX1 | **FormShell** — full-viewport slide-in panel: sticky top bar (breadcrumb, title, Preview, Save Draft, Publish), optional 200px left section nav, scrollable body, sticky bottom bar (Discard, Save Draft, Publish →). Mobile: left nav → tab strip. Esc confirm dialog. |
| UX2 | **QuickFormDrawer** — 400px right-anchored overlay for ≤6 field simple creates/edits. Uses SideDrawer primitive. Auto-renders fields from FieldDef[]. |
| UX3 | **StepForm** — multi-step wizard rendered inside FormShell body. Step indicator bar (●=done / ◑=current / ○=locked). Per-step validation gate. Progress auto-saved to localStorage[formId]. |
| UX4 | **MediaPickerDrawer** — full-viewport overlay for all media fields. Grid of existing uploads (24/page), search, filter, multi-select, upload new (drag+drop, tmp/ first with progress bar), reorder, right-click menu. [tmp] badge on unsaved files. |
| UX5 | **PreviewPane** — [👁 Preview] button in FormShell top bar. Replaces panel body with live render of item from draft values. Draft banner + disabled buy/cart/bid buttons. "← Back to Edit" restores. |
| UX9 | **InlineSelectCreate** — Searchable combobox where last option is [+ Create "typed text"]. Opens QuickFormDrawer scoped to resource. On save → auto-selects new item. Extends existing H1 component. |

### After 77-ux → Session 77: Alpha: Seller Products

| Task | Goal |
|------|------|
| O1, O2+C5, C1, VB8, C2, VB9, LL6 | Store profile + all 3 product types create/edit (standard/auction/preorder) + seller listing views |

### Completed last session (76-infra — hotfix + Firebase reset)
| Task | Status | Done |
|------|--------|------|
| **J13** | ✅ | Products listing empty — all 20 standard seed docs missing `isAuction: false / isPreOrder: false`. Firestore `where("isAuction", "==", false)` returns 0 when field absent. Added both fields + 2 new composite indexes to base file. |
| **J14** | ✅ | Blog listing empty — `BlogIndexPageView` SSR passed `FirebaseSieveResult` (`.items`) as `initialData` where `BlogListResponse` (`.posts`) was expected. Fixed: transform to correct shape. |
| **J15** | ✅ | Events listing empty — `EventsListPageView` defaulted to `status==published`; no events have that status. Changed default to `status==active`. |
| **INFRA1** | ✅ | `firebase-reset.mjs` dry-run crash: `collectionRef.count()` is firebase-admin v11+ only. Fixed to `.get().size` (v10 compatible). |
| **INFRA2** | ✅ | Created `appkit/scripts/firebase-delete-indexes.mjs` — OAuth2 refresh-token auth + Firestore REST API bulk index delete. Fixes 409 loop on `firebase:deploy`. |
| **Firebase** | ✅ | Full Firebase reset (all Firestore, Auth, Functions, 205 indexes wiped) + clean redeploy (263 indexes + 24 Cloud Functions). Duplicate `faqs` indexes removed from base file. Re-seed required via `/demo/seed`. |

### Completed session 76 (VD tasks — public catalogue)
| Task | Status | Done |
|------|--------|------|
| **X3** | ✅ | AdminBrandEditorView + AdminCategoryEditorView: sm:grid-cols-2 responsive pairs; dark:text-zinc-300/400 on raw labels/helper text. |
| **X4** | ✅ | 7-point form quality checklist added to HOW TO WORK. |
| **X5** | ✅ | PageLoader component created in appkit (spinner + 15s timeout/refresh). All 15 loading.tsx files replaced. |
| **X6** | ✅ | brand-logo/brand-banner added to MediaFilenameContext. |

### Alpha-gate sessions (76–80) — complete these before any other work
| Session | Tasks | Goal |
|---------|-------|------|
| **76** | VD7, VD11, VD4, VD5, VD6, VD1, VD2 | **Public Catalogue** — brand audit + translation keys + category/brand/store on cards and detail pages |
| **77-ux** | UX1, UX2, UX3, UX4, UX5, UX9 | **UX Foundation** — FormShell, QuickFormDrawer, StepForm, MediaPickerDrawer, PreviewPane, InlineSelectCreate primitives |
| **77** | O1, O2+C5, C1, VB8, C2, VB9, LL6, UX6 | **Seller Lists Products** — store profile edit + all 3 product type create/edit (using UX primitives) + seller listing views |
| **78** | D1+VC6, VC1, VC3, VC5, LL1, LL2, LL3 | **User Account Core** — wishlist, order history/detail, profile edit, notifications |
| **79** | W1, W2, W3, W4, R1 | **Cart Integrity** — stale validation + out-of-stock section + product links in cart |
| **80** | C6, C7, O3, VB3, VB10, LL8, UX7 | **Store Settings** — shipping config + payout settings + store addresses |

### 🚀 ALPHA RELEASE after Session 80

### Post-alpha sessions
| Session | Tasks | Goal |
|---------|-------|------|
| 81 | C3, VB5, C4, VB6, VB1, VB2, VB7, O4, LL7, LL9, LL10 | Store Finance: coupons, orders, payouts, analytics |
| 82 | ARCH4, VA19 | Admin Payouts processing + CSV export |
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
| 96+ | I6, I7, D5, VC7, O5, HS4-E, VC2, VC4, D3, D4, LL4, LL5 | Deferred: PDF, watermark CDN, messages, Shiprocket |

### Confirmed UX design for GP1 + SC3 (planned for Sessions 85–86)
- **Both sections** live **between the buy-box/actions area and the TABS row** — NOT in belowFold
- Injected via `renderGroupSection` (GP1) and `renderSublistingSection` (SC3) render props on `ProductDetailView` / `AuctionDetailView`
- **Card style**: small **circular** thumbnail cards (~64 px) in a `HorizontalScroller`, collapsed by default
- **Sub-listing cards**: circular image + name (2-line truncate) + price chip; click → navigate; current listing highlighted with ring
- **Group cards**: circular image + name + price; click → navigate; current product highlighted; selectable
- **"View whole group →"** button opens a Modal (SideDrawer if ≥5 parts): table with columns thumbnail (with image-preview toggle), name, price, condition, "View" link
- Auctions only get the sub-listing row (SC3); group row (GP1) is standard products + pre-orders only
- See `asciiDiagrams.md` §"Public > Product Detail" for full ASCII layout

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
- Brand: **"LetItRip"** — always this exact casing (not "LetiTrip", not "Letitrip"). Domain is letitrip.in but brand display name is LetItRip. Grep after every content update.
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

### Form quality checklist (every VA/VB/VC editor form)
Every form built in Tier V must pass all 7 checks before marking ✅:
```
□ MOBILE     Works at 375px — no overflow, no clipped inputs
□ TABLET     Works at 768px — responsive grid kicks in (sm:grid-cols-2 where appropriate)
□ DARK       All labels, textareas, helper text have dark: variants; no invisible text
□ TOKENS     No hardcoded hex/rgb — all colors via var(--appkit-color-*) or Tailwind semantic class
□ FOCUS      Focus rings visible on all interactive elements
□ ERRORS     Error states styled (red border, error message) — not plain browser default
□ LOADING    Submit button shows isLoading + disabled during mutation; no double-submit
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
Sessions done: 60–76, 67-b, 76-infra, 76-content
Current:       77 ⏳ next — Seller Products (O1, O2+C5, C1, VB8, C2, VB9, LL6)
Next:          78 (D1+VC6, VC1, VC3, VC5, LL1–LL3) — User account core
               79 (W1–W4, R1) — Cart integrity
               80 (C6, C7, O3, VB3, VB10, LL8) — Store settings
               🚀 ALPHA after session 80

⚠️  Firebase was fully reset 2026-05-10 — re-seed all 23 collections via /demo/seed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE               SESSIONS    STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Foundation          60–64       ✅ done
Carousel            65          ✅ done (CF1)
Sections-1          66          ✅ done (HS1+HS2+HS3)
Sections-2          67, 67-b    ✅ done (HS4+HS5)
Admin CRUD          68–75       ✅ done
──────── ALPHA GATE ─────────────────────────────────────
Public Catalogue    76          ✅ done (VD7+VD11+VD4+VD5+VD6+VD1+VD2)
Infra/Hotfix        76-infra    ✅ done (J13+J14+J15+INFRA1+INFRA2; Firebase reset)
Content pages       76-content  ✅ done (About + Legal pages + admin editing)
Seller Products     77          ⏳
User Account Core   78          ⏳
Cart Integrity      79          ⏳
Store Settings      80          ⏳
─────── 🚀 ALPHA RELEASE ────────────────────────────────
Store Finance       81          ⏳
Admin Finance       82          ⏳
Content             83          ⏳
Custom Fields       84          ⏳
Sub-listings        85          ⏳
Grouped Listings    86          ⏳
Social Feed         87          ⏳
Search+Routes       88          ⏳
Query/Sieve         89          ⏳
Color Tokens        90          ⏳
Layout Tokens       91          ⏳
Seed Scale          92–95       ⏳
Deferred            96+         ⏳
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
follow all rules and complete all end tasks, prioritize pending tasks or techdebt first, also check for any tsc errors before proceeding next task or todo item. update the ascii diagrams for sure after a session.