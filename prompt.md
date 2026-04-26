# letitrip.in — Master Working Prompt

> Use this prompt at the start of every working session.
> Paste the full contents into Claude Code (or any AI coding assistant) as the opening message.
> The AI will orient itself, pick up where we left off, and work through tasks incrementally.

---

## HOW TO USE THIS FILE

1. Open a new Claude Code session
2. Paste this entire file as your first message (or use `/load prompt.md`)
3. The AI will read the tracker, pick the next pending task, and begin
4. At the end of every task: code committed → tracker updated → seed updated → ASCII diagrams updated

---

## Build Issues and Resolutions

### Root Causes of Build Failures
- **Client Components Importing Server Code**: Client components (marked with "use client") were importing from `@mohasinac/appkit`, which includes server-side code like Firebase Admin SDK and Node.js modules (e.g., `fs`, `child_process`). This caused Next.js Turbopack to bundle server-only modules into client bundles, leading to "Can't resolve 'fs'" errors.
- **Barrel Exports Pulling in Unintended Dependencies**: The main `appkit/src/index.ts` barrel file exported everything, including server components and providers, causing transitive imports of server code in client builds.
- **Lack of Separate Entry Points**: No clear separation between client-safe and server-side exports, leading to incorrect imports.

### Correct Way to Export and Import from Appkit
- **Entry Points**:
  - `@mohasinac/appkit/client`: For client components, hooks, UI primitives, and client-safe features. Exports are marked with "use client" and exclude server dependencies.
  - `@mohasinac/appkit/server`: For server components, actions, and server-side logic.
  - `@mohasinac/appkit/ui`: For UI components and layout primitives.
  - `@mohasinac/appkit`: Main entry for general use, but avoid in client components to prevent server code inclusion.
- **Import Guidelines**:
  - Client components (pages with "use client"): Import from `@mohasinac/appkit/client`.
  - Server components and actions: Import from `@mohasinac/appkit` or specific sub-paths.
  - UI/layout: Import from `@mohasinac/appkit/ui` or `@mohasinac/appkit/client`.
- **Export Strategy**:
  - Client-safe items (UI, hooks, client providers) go in `client.ts`.
  - Server items stay in `index.ts` or `server.ts`.
  - Use `serverExternalPackages` in `next.config.js` to exclude server modules from client bundles.
- **Resolution Applied**: Added client exports to `client.ts`, updated client page imports, and configured `serverExternalPackages` to exclude Firebase and Node.js modules.

---

## CONTEXT — READ THESE FIRST

You are working on **letitrip.in**, a Next.js 16 multi-vendor marketplace (India).
Before doing anything else, read both reference files in full:

```
d:\proj\letitrip.in\INSTRUCTIONS.md       ← architecture, all bugs, gap analysis (21 sections)
d:\proj\letitrip.in\new-tracker.md        ← every task, phase, and status (Phases 7–33)
```

Also read the memory index for persistent context across sessions:
```
C:\Users\mohsi\.claude\projects\d--proj-letitrip-in\memory\MEMORY.md
```

The codebase is split into two parts:
- **`appkit/`** — the shared UI/feature library (`@mohasinac/appkit`). All bugs and
  component-level fixes go here. After any change to appkit, run `npm run watch:appkit`
  (or a one-off build) before testing in the Next.js dev server.
- **`src/`** — the letitrip.in Next.js app. Page wiring, route handlers, and
  app-level logic go here. Changes here take effect immediately on the dev server.

---

## YOUR WORKING METHODOLOGY

Follow this exact loop for **every single task** without exception:

### 1. Orient
- Read `new-tracker.md` and find the first task with status `⏳ Pending`
- Read the relevant section of `INSTRUCTIONS.md` for full context on that bug/gap
- Read the actual source files involved before writing a single line of code
- State clearly: "Working on Phase X.Y — [task name]"

### 2. Plan (brief)
- In 3–5 bullet points, describe exactly what you will change and why
- If the change touches appkit, note that a rebuild is needed after
- If you find the task is already done or the premise is wrong, document that,
  mark it `✅ Done` with a note, then move to the next task

### 3. Implement
- Make the smallest correct change that completes the task
- No extra refactoring, no speculative abstractions, no cleanup beyond the task
- Prefer editing existing files over creating new ones
- Never skip TypeScript types or leave `any` casts unless unavoidable

### 4. Verify
- **For appkit changes:** run `npm run watch:appkit` and confirm it builds cleanly
- **For all changes:** run `npx tsc --noEmit` and confirm 0 type errors
- **For UI changes:** start `npm run dev` and visually confirm the fix in the browser
- If tests exist that cover this area (`npm run test`), run them

### 5. Commit
- Stage only the files changed for this specific task
- Use this commit format:
  ```
  fix(phase-X.Y): <short description of what was fixed>

  - <bullet: what changed in file A>
  - <bullet: what changed in file B>
  - Root cause: <one sentence>
  ```
- Example:
  ```
  fix(phase-24.1): implement perView in HorizontalScroller

  - Replace void perView with ResizeObserver-based item width calc
  - Maps PerViewConfig breakpoints to container width at runtime
  - Root cause: perView prop was accepted but immediately discarded
  ```

### 6. Update seed data
After every task that adds, changes, or removes a UI feature, data field, or page:

**Ask yourself: does the seed data need to reflect this change?**

Seed files live in:
```
appkit/src/seed/                          ← appkit-level seed documents
src/app/api/demo/seed/route.ts            ← /demo/seed endpoint (runs on local dev)
scripts/seed-firestore.ts                 ← standalone seed script (if it exists)
```

Rules:
- If you **add a new homepage section type** (e.g. `brands`) → add at least one sample
  document to the homepage sections seed so the section renders locally
- If you **add a new Firestore field** to a product, auction, event, or store → add
  that field to the corresponding seed document so local data is realistic
- If you **add a new collection** (e.g. carousel_slides, faq docs) → add a minimum
  viable seed entry (1–3 docs) so the feature can be tested immediately
- If you **fix a bug that was hiding empty data** (e.g. FAQ hardcoded empty) → add real
  FAQ entries to the seed so the fix is visually verifiable
- If you **wire a new detail page section** (tabs, related, bid history) → make sure
  the seed product/auction has enough data to exercise each section (multiple images,
  specs array, at least 2 related items, at least 3 bids)
- If no seed change is needed, write "Seed: no change needed — [reason]" in the commit

Seed commit format (use with the code commit or as a follow-up):
```
seed(phase-X.Y): add <what> seed data for <feature>

- Added N docs to <collection> covering <scenario>
- Fields added: <list>
```

### 7. Update the tracker
After each completed task, update **both** tracker files:

**`new-tracker.md`:**
- Change status from `⏳ Pending` → `✅ Done`
- Add a one-line implementation note if it differed from the plan
- Update the phase progress count in the "Updated Current Status" table

**`INSTRUCTIONS.md`:**
- Find the ASCII diagram or comparison table that references the feature you just fixed
- Update the "Current Build" column/side to reflect the new state
- Change ❌ → ✅ (or ⚠️) in the master gap table (Section 12) for the affected row
- If you fixed a bug from Section 13 (Regression Catalog), add a "✅ Fixed in phase X.Y"
  note under that bug entry

ASCII diagram update rules:
- **Before/after diffs** in INSTRUCTIONS.md §12 and §8 — update the "CURRENT BUILD"
  side to match what now renders
- **Master gap table** (INSTRUCTIONS.md §12) — change the Status column cell from ❌ to ✅
- **Bug entries** (INSTRUCTIONS.md §13) — append `> ✅ Fixed phase X.Y — <one line>`
  after the "Fix needed:" block
- Keep the "LIVE SITE" side unchanged — it is the reference target, not the current state

Commit the tracker + diagram updates together:
```
docs(phase-X.Y): update tracker and diagrams for <feature>

- new-tracker.md: phase X.Y marked Done
- INSTRUCTIONS.md §12: <row> updated ❌ → ✅
- INSTRUCTIONS.md §13: BUG N marked fixed
```

### 8. Continue
- Move immediately to the next `⏳ Pending` task in the same phase
- Only stop and ask when genuinely blocked (missing env var, ambiguous requirement,
  destructive operation needing confirmation, or external dependency)

---

## PRIORITY ORDER

Work through phases in this exact order. Do not skip ahead.

| Order | Phase | Name | Why first |
|-------|-------|------|-----------|
| 1 | **24** | Appkit Core Bugs | Breaks every carousel, ad slot, homepage — must fix first |
| 2 | **25 + 32** | Product Detail + Detail Tabs | High-traffic page; gallery/lightbox/tabs/BuyBar + bid history |
| 3 | **26 + 31** | Listing Toolbars + Category/Store | All listing pages missing search/filter/sort/pagination |
| 4 | **29 / 18** | Seed Data + Data Verification | Can't test pages without data; verify all detail pages load |
| 5 | **27** | Slot-Shell Page Wiring | User/seller/admin dashboards + auction/preorder detail pages |
| 6 | **30** | Admin Events CRUD + Analytics | Missing AdminEventsView; analytics date range |
| 7 | **28** | Cart & Checkout | Auth cart, Razorpay, order creation |
| 8 | **33** | Rich Text Completeness | Store policies, category desc, event content use plain text |
| 9 | **22** | Responsive Audit | 375px / 768px / 1024px |
| 10 | **23** | Final Validation | Smoke tests, Lighthouse ≥90, cross-browser, launch checklist |

---

## PHASE 24 — APPKIT CORE BUGS (START HERE)

These are the most critical tasks. All other phases depend on them.
Each fix is in `appkit/` — rebuild after every fix.

### 24.1 — HorizontalScroller: implement `perView`

**File:** `appkit/src/ui/components/HorizontalScroller.tsx:67`

**The bug:**
```tsx
void perView;  // prop accepted in interface, immediately discarded
```

**The fix:** Replace `void perView` with a `ResizeObserver` that calculates item width:
```
itemWidth = (containerWidth - (perViewCount - 1) * gap) / perViewCount
```
where `perViewCount` is resolved from the `PerViewConfig` object based on the current
container width. Breakpoint mapping (use `containerWidth`, not `window.innerWidth`):
```
base  →  0px+
xs    →  480px+
sm    →  640px+
md    →  768px+
lg    →  1024px+
xl    →  1280px+
2xl   →  1536px+
```
Apply the calculated width as `style={{ width: itemWidth, flexShrink: 0 }}` on each
`appkit-hscroller__item` div. Clean up the observer on unmount.

### 24.2 — HorizontalScroller CSS: `.dark` selector

**File:** `appkit/src/ui/components/HorizontalScroller.style.css` ~line 71 and ~line 102

**The bug:** Uses `@media (prefers-color-scheme: dark)` (OS-level) but the app uses
Tailwind class-based dark mode (`.dark` on `<html>`).

**The fix:** Find every `@media (prefers-color-scheme: dark) { ... }` block and replace
with `.dark .appkit-hscroller__arrow { ... }` and `.dark .appkit-hscroller__fade--left { ... }`.

### 24.3 — HorizontalScroller: grid slide width

**File:** `appkit/src/ui/components/HorizontalScroller.tsx` ~line 122

**The bug:** In `rows > 1` grid mode, each slide `<div>` has no explicit width, so
scroll snapping lands mid-slide.

**The fix:** Add `style={{ width: "100%", flexShrink: 0 }}` to the slide wrapper div
(the one with `className="appkit-hscroller__slide grid ..."`).

### 24.4 — HeroCarousel: fallback when no slides

**File:** `appkit/src/features/homepage/components/HeroCarousel.tsx` ~line 97

**The bug:** `if (!slides || slides.length === 0) { return null; }` — blank gap locally.

**The fix:** Return a static placeholder hero (height-matching skeleton or a styled div
with a "Coming soon" message) instead of `null`.

### 24.5 — Ad slot key mismatch

**File:** `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` ~line 137

**The bug:**
```tsx
const adSlotKey = `after${section.order}`  // "after0", "after1" — never match
// actual keys: "afterHero", "afterFeaturedProducts", "afterReviews", "afterFAQ"
```

**The fix:** Replace with a type→key map:
```tsx
const AD_SLOT_MAP: Record<string, keyof typeof adSlots> = {
  products:  "afterFeaturedProducts",
  reviews:   "afterReviews",
  faq:       "afterFAQ",
};
const adSlotKey = AD_SLOT_MAP[section.type];
```
Wire `afterHero` directly after the `<HeroCarousel>` block (outside the section loop).

### 24.6 — FAQ section: fetch real data

**File:** `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` ~line 326

**The bug:**
```tsx
case "faq": return <FAQSection tabs={[]} activeTab="" items={[]} ... />;
```

**The fix:** Call `faqRepository.getHomepageFAQs()` (or equivalent) before the switch
and pass real `tabs`, `activeTab`, and `items` to `FAQSection`.

### 24.7 — Add `case "brands":` to homepage section switch

**File:** `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx`

**The bug:** No `case "brands":` — falls to `default: return null` silently.

**The fix:** Add the case, rendering a `BrandsCarousel` or `SectionCarousel` component
for the brands section type. If no `BrandsCarousel` component exists, create a minimal
one that renders brand logos/cards from `section.items`.

### 24.8 — Rebuild + verify

After all 24.1–24.7 fixes: run `npm run watch:appkit` once to confirm a clean build,
then `npm run build` on the Next.js app to confirm 0 errors, 103 routes.

---

## PHASE 25 — PRODUCT DETAIL PAGE

**File:** `appkit/src/features/products/components/ProductDetailPageView.tsx`

### 25.1 — Gallery: `<img>` + ImageLightbox

Replace:
```tsx
<Div role="img" className="aspect-square w-full bg-cover bg-center"
  style={{ backgroundImage: `url(${primaryImage})` }} />
```
With a proper image gallery:
1. Render `<img src={primaryImage} />` inside a clickable wrapper
2. Import `ImageLightbox` from `appkit/src/ui/components/ImageLightbox.tsx`
3. Add `const [lightboxOpen, setLightboxOpen] = useState(false)` and
   `const [lightboxIndex, setLightboxIndex] = useState(0)`
4. On image click → `setLightboxOpen(true); setLightboxIndex(clickedIndex)`
5. Render `<ImageLightbox images={allImages} open={lightboxOpen} index={lightboxIndex} onClose={() => setLightboxOpen(false)} />`

### 25.2 — Thumbnail strip
Below the main image, render `product.images.slice(1)` as a row of clickable thumbnails.
Each thumbnail click calls `setLightboxIndex(i)` and optionally updates the main image.

### 25.3 — Wire `renderTabs` → `ProductTabs`
```tsx
renderTabs={() => (
  <ProductTabs
    renderDescription={() => (
      <RichText html={normalizeRichTextHtml(product.description ?? "")} />
    )}
    renderSpecs={() => (
      <SpecsTable specs={product.specifications ?? []} />
    )}
    renderReviews={() => (
      <ReviewsList productId={product.id} />
    )}
  />
)}
```

### 25.4 — Wire `renderRelated`
```tsx
renderRelated={() => <RelatedProducts productId={product.id} categoryId={product.categoryId} />}
```

### 25.5 — Wire `BuyBar`
Import `BuyBar` and mount it for sticky mobile actions (show once user scrolls past
the action rail, hide when footer enters viewport — use `IntersectionObserver`).

---

## PHASE 26 — LISTING PAGE TOOLBARS (PHASE 15 REDO)

For each listing page, the pattern is:

```tsx
// src/app/[locale]/auctions/page.tsx
import { AuctionsView } from "@mohasinac/appkit";
import { ProductFilters } from "@mohasinac/appkit";
import { Pagination } from "@mohasinac/appkit";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const { items, total, page, pageSize } = await fetchAuctions(params);

  return (
    <AuctionsView
      renderSearch={(value, onChange) => (
        <SearchInput value={value} onChange={onChange} placeholder="Search auctions..." />
      )}
      renderSort={(value, onChange) => (
        <SortSelect value={value} onChange={onChange} options={AUCTION_SORT_OPTIONS} />
      )}
      renderFilters={() => (
        <ProductFilters urlTable={buildUrlTable(params)} />
      )}
      renderResults={() => (
        <MarketplaceAuctionGrid items={items} />
      )}
      renderPagination={() => (
        <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} />
      )}
    />
  );
}
```

Build a `buildUrlTable(searchParams)` helper that creates a `UrlTable`-compatible
adapter from Next.js `searchParams`. Reuse across all listing pages.

Apply the same pattern to:
- `/products/page.tsx` → `ProductsView`
- `/pre-orders/page.tsx` → matching view
- `/stores/page.tsx` → matching view

---

## APPKIT BUILD CYCLE REMINDER

Every time you change anything inside `appkit/src/`:

```bash
# Terminal 1 (keep running during development):
npm run watch:appkit

# Terminal 2:
npm run dev

# After all appkit changes for a phase:
npm run build    # verify 0 errors
npx tsc --noEmit # verify 0 type errors
```

Changes to `src/` (Next.js app) take effect immediately — no rebuild needed.

---

## COMMIT CONVENTIONS

Every completed task produces **up to 3 commits** in this order:

```
1. fix/feat/wire  — the code change
2. seed           — seed data update (skip if no seed change needed)
3. docs           — tracker + ASCII diagram updates
```

Commit type prefixes:
```
fix(phase-X.Y):  <verb> <what>           ← bug fix in appkit or src/
feat(phase-X.Y): <verb> <what>           ← new feature or component
wire(phase-X.Y): <page> slot-shells      ← render-prop wiring in pages
seed(phase-X.Y): <collection> seed data  ← Firestore seed additions/updates
docs(phase-X.Y): tracker + diagrams      ← new-tracker.md + INSTRUCTIONS.md
```

Group related small fixes into one commit per phase task.
Never commit broken TypeScript (tsc must be 0 errors).
Never commit without updating `new-tracker.md` AND the relevant INSTRUCTIONS.md diagrams.

---

## WHAT NOT TO DO

- Do not refactor code outside the scope of the current task
- Do not add comments explaining what code does — only add comments for non-obvious WHY
- Do not create new abstraction layers unless the task explicitly requires it
- Do not run `git push` — local commits only unless asked
- Do not mark a task ✅ Done if tsc has errors or the browser shows a regression
- Do not batch multiple phase tasks into one commit — one task, one commit
- Do not skip the tracker update — it is the shared source of truth
- Do not skip the seed update — if a fix exposes empty data, the fix is only half done
- Do not skip the ASCII diagram update — INSTRUCTIONS.md must stay in sync with reality
- Do not update INSTRUCTIONS.md §12 "LIVE SITE" column — it is the reference target, never the current state
- Do not mark seed tasks done unless the data is actually usable (at least 1 doc per new collection, realistic fields)

---

## BLOCKED? HERE'S HOW TO HANDLE IT

| Situation | Action |
|-----------|--------|
| Missing exported function in appkit | Check appkit barrel (`appkit/src/index.ts`), then check if it needs to be added |
| Type error you can't resolve | Note it with `// TODO: fix type — <reason>` and continue; do NOT use `any` silently |
| Firestore collection doesn't exist locally | Write the seed entry for it NOW as part of this task; don't defer |
| Seed file not found | Check `appkit/src/seed/` and `src/app/api/demo/seed/route.ts`; create `scripts/seed-firestore.ts` if neither covers the case |
| Appkit build fails | Fix the build error before proceeding — do not commit broken appkit |
| Task already done | Mark ✅ Done, add note "confirmed already implemented in pass N", move on |
| ASCII diagram location unclear | Search INSTRUCTIONS.md for the feature keyword; diagrams are in §8 (carousel), §9 (listing), §12 (gap table), §13 (bugs), §14 (product detail) |
| Gap table row already shows ✅ | The fix was done before this session — verify in browser, then move on |
| Ambiguous requirement | Check `INSTRUCTIONS.md` section for that feature; if still unclear, ask |

---

## SEED DATA — FULL REFERENCE

### Where seed files live

```
appkit/src/seed/
  pokemon-homepage-sections-seed-data.ts   ← homepage section documents
  pokemon-carousel-slides-seed-data.ts     ← hero carousel slides (if exists)
  pokemon-products-seed-data.ts            ← product documents
  pokemon-auctions-seed-data.ts            ← auction documents
  pokemon-events-seed-data.ts              ← event documents
  pokemon-stores-seed-data.ts              ← store documents
  pokemon-reviews-seed-data.ts             ← review documents
  pokemon-blog-seed-data.ts                ← blog post documents
  pokemon-faq-seed-data.ts                 ← FAQ entries (if exists)
  pokemon-categories-seed-data.ts          ← category documents

src/app/api/demo/seed/route.ts             ← POST /demo/seed (imports + writes all seed files)
scripts/seed-firestore.ts                  ← standalone script (create if missing)
```

### Minimum viable seed per collection

| Collection | Minimum | Key fields to include |
|------------|---------|----------------------|
| `carousel_slides` | 2 slides | `active:true`, `order`, `title`, `imageUrl`, `ctaHref`, `ctaLabel` |
| `homepage_sections` | 1 per type used | `enabled:true`, `order`, `type`, all type-specific fields |
| `site_settings/singleton` | 1 doc | `announcementText`, `announcementEnabled:true` |
| `products` | 3–5 products | `images[]` (≥2), `specifications[]`, `categoryId`, `sellerId`, `description` (HTML) |
| `auctions` | 2 auctions | `isAuction:true`, `currentBid`, `reservePrice`, `endsAt`, at least 3 bid history entries |
| `events` | 1 event | `title`, `description` (HTML), `startDate`, `endDate`, `pollConfig` |
| `stores` | 1 store | `bio` (HTML), `returnPolicy` (HTML), `shippingPolicy` (HTML), `socialLinks[]` |
| `faq_items` | 3–5 entries | `question`, `answer` (HTML), `category`, `showOnHomepage:true` |
| `blog_posts` | 2 posts | `title`, `slug`, `content` (HTML), `coverImage`, `tags[]`, `status:"published"` |
| `reviews` | 3 reviews | `rating`, `comment` (HTML), `productId`, `sellerId`, `status:"approved"` |
| `categories` | 3 categories | `name`, `slug`, `description` (HTML), `imageUrl`, `parentId` (null for root) |

### After adding seed to `route.ts`, test it

```bash
# Start dev server
npm run dev

# Hit the seed endpoint (run once)
curl -X POST http://localhost:3000/api/demo/seed

# Then open the browser and verify each seeded page loads
```

### What triggers a seed update

| Task type | Seed action required |
|-----------|---------------------|
| Fixed a homepage section type (BUG 4 FAQ, BUG 5 brands) | Add 1 doc of that type to homepage_sections seed |
| Added a new field to a Firestore model | Add that field to all relevant seed documents |
| Wired a new detail page section (tabs, related, bid history) | Ensure seed products/auctions have enough data (images[], specs[], bids) |
| Created a new Firestore collection | Add minimum viable docs to seed |
| Fixed a bug that was hiding empty data | Add data to make the fix visually verifiable |
| Pure code refactor with no data impact | Write "Seed: no change needed — code-only" in commit |

---

## ASCII DIAGRAM UPDATE GUIDE

After every task, check these specific locations in `INSTRUCTIONS.md` and update:

### Section 12 — Master Gap Table (`## 12. Live Site vs Current Build`)

Find the row matching the feature you just implemented. Change the Status:

```markdown
| Feature name | ✅ Live | ❌ Missing | Root cause |
                           ↓ change to:
| Feature name | ✅ Live | ✅ Done (phase X.Y) | was: root cause |
```

If partially done: use `⚠️ Partial (phase X.Y — what's left)`.

### Section 13 — Regression Catalog (`## 13. Regression Catalog — Specific Bugs`)

Find the BUG entry. After the "Fix needed:" block, append:

```markdown
> ✅ Fixed phase X.Y — <one line describing what was changed>
```

### Section 8 — Carousel System (`## 8. Carousel & Horizontal Slider System`)

After fixing perView (24.1), update the comparison diagram:

```
CURRENT BUILD (after fix):             ← change this side only
  ┌──────┐ ┌──────┐ ┌──────┐  ←→
  │ card │ │ card │ │ card │
  └──────┘ └──────┘ └──────┘
  perView={base:1,sm:2,md:3} respected
  ResizeObserver calculates item width
```

### Section 9 — Listing Pages (`## 9. Listing Pages`)

After wiring toolbars (phases 26, 31), update the before/after ASCII to show the toolbar:

```
CURRENT BUILD (after fix):
  ┌─────────────────────────────────────┐
  │ [Search...] [Sort ▾] [Filters ▾]    │  ← add this
  │─────────────────────────────────────│
  │ [card] [card] [card]                 │
  │ ‹ 1 2 3 ... ›                        │  ← add this
  └─────────────────────────────────────┘
```

### Section 14 — Product Detail (`## 14. Product Detail Page`)

After phases 25 and 32, update the "What the current build has" table:

```
COL 1 — Gallery (after fix):   COL 2 — Info:      COL 3 — Actions:
  - <img> tag ✅                 (unchanged)        (unchanged)
  - Click → lightbox ✅
  - Thumbnail strip ✅
  - "N / M" counter ✅

BELOW FOLD (after fix):
  - ProductTabs ✅ (Description / Specs / Reviews)
  - RelatedProducts carousel ✅
```

### Section 21 — Remaining Pages

After wiring auction/pre-order detail (phases 27, 32), update the status table:

```markdown
| Auction detail | `/auctions/[id]` | ✅ In PageView | ✅ All 6 slots wired | ✅ Functional |
```

---

## SESSION START CHECKLIST

Run these before writing any code:

```bash
# 1. Confirm clean working tree
git status

# 2. Confirm tsc is clean (0 errors before you start)
npx tsc --noEmit

# 3. Confirm appkit builds
npm run watch:appkit  # or: cd appkit && npm run build

# 4. Check what phase we're on
# Read new-tracker.md → find first ⏳ Pending task

# 5. Check seed state (know what data you have)
# Read appkit/src/seed/ and src/app/api/demo/seed/route.ts
```

---

## QUICK REFERENCE — KEY FILE LOCATIONS

| What | Where |
|------|-------|
| HorizontalScroller (perView BUG) | `appkit/src/ui/components/HorizontalScroller.tsx:67` |
| HorizontalScroller CSS (dark mode BUG) | `appkit/src/ui/components/HorizontalScroller.style.css:71` |
| HeroCarousel (null return BUG) | `appkit/src/features/homepage/components/HeroCarousel.tsx:97` |
| Homepage section switch (ad slot / FAQ / brands BUGs) | `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx:137` |
| Product detail page (gallery / tabs BUG) | `appkit/src/features/products/components/ProductDetailPageView.tsx` |
| ImageLightbox (built, unused) | `appkit/src/ui/components/ImageLightbox.tsx` |
| ProductTabs (built, unused) | `appkit/src/features/products/components/ProductTabs.tsx` |
| RelatedProducts (built, unused) | `appkit/src/features/products/components/RelatedProducts.tsx` |
| BuyBar (built, unused) | `appkit/src/features/products/components/BuyBar.tsx` |
| AuctionBidHistory (built, unused) | `appkit/src/features/auctions/components/AuctionBidHistory.tsx` |
| AuctionsView (toolbar shell, unused) | `appkit/src/features/auctions/components/AuctionsView.tsx` |
| ProductsView (toolbar shell, unused) | `appkit/src/features/products/components/ProductsView.tsx` |
| ProductFilters (built, unused) | `appkit/src/features/products/components/ProductFilters.tsx` |
| Pagination (built, unused) | `appkit/src/ui/components/Pagination.tsx` |
| SlottedListingView | `appkit/src/ui/components/SlottedListingView.tsx` |
| RichText display | `appkit/src/ui/rich-text/RichText.tsx` |
| RichTextEditor | `appkit/src/ui/components/RichTextEditor.tsx` |
| normalizeRichTextHtml | `appkit/src/utils/string.formatter.ts` |
| Cart (guest-only BUG) | `src/components/routing/CartRouteClient.tsx` |
| Checkout (explicit stub) | `src/components/routing/CheckoutRouteClient.tsx` |
| Auctions page (bare, no toolbar) | `src/app/[locale]/auctions/page.tsx` |
| Products page (bare, no toolbar) | `src/app/[locale]/products/page.tsx` |
| Auction detail (no render props) | `src/app/[locale]/auctions/[id]/page.tsx` |
| Pre-order detail (no render props) | `src/app/[locale]/pre-orders/[id]/page.tsx` |
| Store about (plain text policies) | `appkit/src/features/stores/components/StoreAboutView.tsx` |
| User dashboard pages | `src/app/[locale]/user/*/page.tsx` |
| Seller dashboard pages | `src/app/[locale]/seller/*/page.tsx` |
| Admin events (missing view) | `appkit/src/features/admin/components/` (need to create AdminEventsView) |
| Tracker | `d:\proj\letitrip.in\new-tracker.md` |
| Full gap analysis | `d:\proj\letitrip.in\INSTRUCTIONS.md` |
| This prompt | `d:\proj\letitrip.in\prompt.md` |

---

## REFERENCE IMPLEMENTATIONS (CORRECT PATTERN TO COPY)

These pages do everything right — fetch data server-side AND wire all render props:

```
src/app/[locale]/events/[id]/page.tsx        ← best pattern for detail pages
src/app/[locale]/search/[slug]/.../page.tsx  ← best pattern for listing + filters
src/app/[locale]/promotions/[tab]/page.tsx   ← best pattern for tabbed listing
```

When wiring any slot-shell, open one of these first and follow the same structure.

---

## PER-TASK COMPLETION CHECKLIST

Before moving to the next task, verify all 5 boxes are checked:

```
□ 1. CODE    — change implemented, tsc 0 errors, browser verified
□ 2. COMMIT  — fix/feat/wire commit made with correct format
□ 3. SEED    — seed data updated (or "no change needed" noted in commit)
□ 4. TRACKER — new-tracker.md status updated ⏳ → ✅, progress count updated
□ 5. DIAGRAM — INSTRUCTIONS.md §12 gap table + §13 bug entry + relevant ASCII updated
□ 6. Build Issues and Resolutions — check and fix any build issues 
```

If any box is unchecked, the task is **not done**. Do not start the next task.

---

*Last updated: 2026-04-25 — Pass 16 complete. Next task: Phase 24.1 (HorizontalScroller perView).*
