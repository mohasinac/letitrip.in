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

### 6. Update seed data
After every task that adds, changes, or removes a UI feature, data field, or page:

**Ask yourself: does the seed data need to reflect this change?**

Seed files live in:
```
appkit/src/seed/                          ← appkit-level seed documents
src/app/api/demo/seed/route.ts            ← /demo/seed endpoint (runs on local dev)
```

Rules:
- If you **add a new homepage section type** → add at least one sample document to the homepage sections seed
- If you **add a new Firestore field** to a product, auction, event, or store → add that field to the seed
- If you **add a new collection** → add a minimum viable seed entry (1–3 docs)
- If you **fix a bug that was hiding empty data** → add real data to make the fix visually verifiable
- If no seed change is needed, write "Seed: no change needed — [reason]" in the commit

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
- If you fixed a bug from Section 13 (Regression Catalog), add a "✅ Fixed in phase X.Y" note

### 8. Update newchange.md
After **every completed task**, prepend a new entry to `newchange.md` describing what changed. Do not defer to the end.

### 9. Continue
- Move immediately to the next `⏳ Pending` task in the same phase
- Only stop and ask when genuinely blocked

---

## COMPONENT REUSE CHECKLIST — CRITICAL

**EVERY new page or feature must reuse existing appkit components for search, filters, and drawers.
Do NOT create custom implementations.**

### Listing Pages — Always Use These

| Component | Purpose | Mobile | Desktop |
|-----------|---------|--------|---------|
| **`<ListingLayout>`** | Full listing shell with toolbar + sidebar + mobile drawer | ✅ Bottom drawer | ✅ Sidebar |
| **`<SlottedListingView>`** | Lightweight listing slots (no auto toolbar management) | Manual | Manual |
| **`<FilterDrawer>`** | Slide-out mobile filter panel (already inside ListingLayout) | ✅ Yes | N/A |
| **`<SideDrawer>`** | Generic form/edit drawer (addresses, products, etc.) | ✅ Full modal | ✅ Side panel |
| **`<Input>`** | Search/text input | ✅ Yes | ✅ Yes |
| **`<SortDropdown>`** | Sort selector | ✅ Yes | ✅ Yes |
| **`usePendingFilters`** | Hook for deferred filter apply (stage → apply) | ✅ Yes | ✅ Yes |
| **`useUrlTable`** | Hook for pagination/sort/search URL state | ✅ Yes | ✅ Yes |

### ❌ ANTI-PATTERNS — DO NOT DO

```tsx
// ❌ WRONG — Custom drawer
const [filterOpen, setFilterOpen] = useState(false);
// ❌ WRONG — Search only on desktop
{isDesktop && <SearchInput />}
// ❌ WRONG — Duplicating FilterDrawer behavior
import { FilterDrawer } from "@mohasinac/appkit";
return <FilterDrawer isOpen={...} onClose={...}>...</FilterDrawer>
```

### ✅ CORRECT PATTERN

1. Use `ListingLayout` if you need full toolbar + filters + search + sort
2. Use `SlottedListingView` for custom toolbar assembly
3. Use `SideDrawer` for edit/create forms
4. Pass render functions — never create your own drawer/modal
5. Let appkit handle mobile/desktop — no `if (isMobile)` in your code

---

## PRIORITY ORDER

Work through tasks in this exact order. Do not skip ahead.

| Order | Phase / Item | Name | Status |
|-------|-------------|------|--------|
| 1 | **27** | Slot-Shell Page Wiring | ⏳ Next — user/seller/admin dashboards + auction/pre-order detail |
| 2 | **User Request: Navigation** | Bottom nav mobile / hamburger desktop | ⏳ Pending |
| 3 | **User Request: Buy Now + Offer** | Buy Now buttons + Offer logic | ⏳ Pending |
| 4 | **User Request: Filters** | Apply-on-click + collapsible + searchable category | ⏳ Pending |
| 5 | **User Request: Bottom Bar** | Sticky action bar above bottom nav | ⏳ Pending |
| 6 | **User Request: Order Grouping** | By store; coupons on group | ⏳ Pending |
| 7 | **28** | Cart & Checkout | ⏳ Auth cart, Razorpay, order creation |
| 8 | **30** | Admin Events CRUD + Analytics | ⏳ Pending |
| 9 | **33** | Rich Text Completeness | ⏳ Pending |
| 10 | **22 / 23** | Responsive + Final Validation | ⏳ Partial |
| ✅ | **24** | Appkit Core Bugs | Done |
| ✅ | **25** | Product Detail Page | Done |
| ✅ | **26** | Listing Page Toolbars | Done |

---

## PHASE 27 — SLOT-SHELL PAGE WIRING (START HERE)

Many pages render an appkit view component but pass no render props, leaving them blank.
The correct reference implementations are:

```
src/app/[locale]/events/[id]/page.tsx        ← best pattern for detail pages
src/app/[locale]/search/[slug]/.../page.tsx  ← best pattern for listing + filters
```

Pages that need render props wired:

| Page | View Component | Slots to wire |
|------|---------------|---------------|
| `/auctions/[id]` | `AuctionDetailView` | gallery, tabs, bid history, related, store reviews |
| `/pre-orders/[id]` | `PreOrderDetailView` | gallery, tabs, related, buy bar |
| `/seller/products` | `SlottedListingView` | search, filters, table, pagination |
| `/seller/orders` | `SlottedListingView` | search, filters, table, pagination |
| `/admin/users` | `SlottedListingView` | search, filters, table, pagination |
| `/admin/products` | `SlottedListingView` | search, filters, table, pagination |
| `/admin/events` | `AdminEventsView` (create if missing) | search, table, create/edit drawer |

---

## REMAINING USER REQUESTS (from mega-request 2026-05-05)

Work through these after Phase 27, in the order listed:

### UX — Navigation & Layout
- **Bottom nav on mobile** — menu items move to bottom nav; hamburger replaces them on desktop (below navbar, not inside it). Same for store and admin layouts.
- **User nav collapsible in sidebar** — auto-collapsed by default; other nav items auto-collapsed.
- **Sticky toolbar** — must stick below breadcrumbs/searchbar, not at `top-14`. Must not disappear while scrolling.
- **Bottom button bar** — Buy/Cart/Wishlist/Bid/Pre-Order icons always visible above bottom nav on product/auction detail pages.
- **Pagination row** — on mobile, pagination is its own row below the sort+grid row, below the sticky toolbar.
- **Mobile toolbar row order** — Row 1: search + confirm; Row 2: sort + grid/list; Row 3: pagination.

### Filters
- **Collapsible filters** — only collapse if there are many options. Range sliders and toggles never collapse.
- **Apply-on-click behavior** — filter toggles/ranges buffer in pending state; only write to URL when "Apply Filters" is clicked. Sort and grid/list toggle remain on-change.
- **Category filter** — searchable dropdown showing currently-selected categories. Same rule: applied on "Apply Filters" only.

### Product Actions
- **Buy Now buttons** — add for simple products, auctions with buyout price, and pre-orders.
- **Offer logic** — re-add for simple products only. User gets 1 offer attempt. Seller can accept/reject from store dashboard. No direct amount displayed to buyer.
- **Order grouping** — auctions are always individual orders. Simple products and pre-orders from the same store are grouped into one order. Coupons apply to the group total.

### Store & Auction Pages
- **Store reviews** — show store reviews and up to 10 other store products at the bottom of auction detail pages.
- **Stores seed** — ensure seed uses `storeId` (not `sellerId`) for ownership; verify store-not-found errors are gone.

### Content & Data
- **Circular/infinite horizontal scrollers** — scrollers must loop back to start rather than stopping at the last item.
- **Events** — richer seed data; public polls (no login) + login-required polls; fix participate button and page rendering.
- **Homepage carousel** — 1 card per row, max 2 rows, beautiful slides.
- **Ads** — do not reserve space if no ad content. Do not render empty sections or carousels.
- **200 products** — verify seed reaches ~200 products across 7 franchises with proper open-source images (no unsplash/random). Add video URLs where appropriate.

### Settings & Theming
- **Cursive font + toggle** — add a better cursive font to the app. Settings page (below theme toggle) controls whether cursive or Roboto is active.

### Logging
- **Firebase logs** — replace `console.log` / file logs with Firebase logging. File-based logs only active in local dev server.

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
- Do not mark seed tasks done unless the data is actually usable

---

## BLOCKED? HERE'S HOW TO HANDLE IT

| Situation | Action |
|-----------|--------|
| Missing exported function in appkit | Check appkit barrel (`appkit/src/index.ts`), then check if it needs to be added |
| Type error you can't resolve | Note it with `// TODO: fix type — <reason>` and continue; do NOT use `any` silently |
| Firestore collection doesn't exist locally | Write the seed entry for it NOW as part of this task; don't defer |
| Appkit build fails | Fix the build error before proceeding — do not commit broken appkit |
| Task already done | Mark ✅ Done, add note "confirmed already implemented", move on |
| ASCII diagram location unclear | Search INSTRUCTIONS.md for the feature keyword |
| Gap table row already shows ✅ | The fix was done before this session — verify in browser, then move on |
| Ambiguous requirement | Check `INSTRUCTIONS.md` section for that feature; if still unclear, ask |

---

## SEED DATA — FULL REFERENCE

### Where seed files live

```
appkit/src/seed/
  pokemon-homepage-sections-seed-data.ts   ← homepage section documents
  pokemon-carousel-slides-seed-data.ts     ← hero carousel slides
  pokemon-products-seed-data.ts            ← Pokémon product documents
  hot-wheels-seed-data.ts                  ← Hot Wheels product documents
  beyblade-seed-data.ts                    ← Beyblade product documents
  transformers-seed-data.ts                ← Transformers product documents
  anime-figures-seed-data.ts               ← Anime figures product documents
  retro-gaming-seed-data.ts                ← Retro gaming product documents
  cosplay-accessories-seed-data.ts         ← Cosplay accessories product documents
  pokemon-bundle-seed-data.ts              ← allProductsSeedData (all 7 franchises)
  pokemon-stores-seed-data.ts              ← 8 store documents
  reviews-seed-data.ts                     ← review documents
  pokemon-categories-seed-data.ts          ← category documents
  pokemon-users-seed-data.ts               ← user documents (with roles)
  bids-seed-data.ts                        ← bid documents
  wishlists-seed-data.ts                   ← wishlist documents
  cart-seed-data.ts                        ← cart documents
  blog-posts-seed-data.ts                  ← blog post documents
  events-seed-data.ts                      ← event + eventEntry documents
  addresses-seed-data.ts                   ← address documents
  store-addresses-seed-data.ts             ← store address documents
  pokemon-coupons-seed-data.ts             ← coupon documents

src/app/api/demo/seed/route.ts             ← POST /demo/seed (imports + writes all seed files)
```

### Seed upsert behavior
All writes use `batch.set(ref, data, { merge: true })` — always upsert, never skip.
User auth records are always upserted; custom claims are set for non-"user" roles.

### Minimum viable seed per collection

| Collection | Minimum | Key fields |
|------------|---------|------------|
| `carousel_slides` | 2 slides | `active:true`, `order`, `title`, `imageUrl`, `ctaHref` |
| `homepage_sections` | 1 per type | `enabled:true`, `order`, `type`, all type-specific fields |
| `site_settings/singleton` | 1 doc | `announcementText`, `announcementEnabled:true` |
| `products` | 3–5 products | `images[]` (≥2), `specifications[]`, `categoryId`, `sellerId`, `description` |
| `auctions` | 2 auctions | `isAuction:true`, `currentBid`, `reservePrice`, `endsAt`, 3+ bids |
| `events` | 1 event | `title`, `description`, `startDate`, `endDate`, `pollConfig` |
| `stores` | 1 store | `bio`, `returnPolicy`, `shippingPolicy`, `socialLinks[]` |
| `faq_items` | 3–5 entries | `question`, `answer`, `category`, `showOnHomepage:true` |
| `blog_posts` | 2 posts | `title`, `slug`, `content`, `coverImage`, `tags[]`, `status:"published"` |
| `reviews` | 3 reviews | `rating`, `comment`, `productId`, `sellerId`, `status:"approved"` |

---

## SESSION START CHECKLIST

Run these before writing any code:

```bash
# 1. Confirm clean working tree
git status

# 2. Confirm tsc is clean (0 errors before you start)
npx tsc --noEmit

# 3. Confirm appkit builds (already built and synced — skip if no appkit changes pending)
npm run watch:appkit

# 4. Check what phase we're on
# Read new-tracker.md → find first ⏳ Pending task (should be Phase 27)

# 5. Check seed state
# Read appkit/src/seed/ and src/app/api/demo/seed/route.ts
```

---

## QUICK REFERENCE — KEY FILE LOCATIONS

| What | Where |
|------|-------|
| **Listing pages** | |
| Auctions listing | `src/app/[locale]/auctions/page.tsx` |
| Products listing | `src/app/[locale]/products/page.tsx` |
| Pre-orders listing | `src/app/[locale]/pre-orders/page.tsx` |
| Stores listing | `src/app/[locale]/stores/page.tsx` |
| **Detail pages** | |
| Auction detail (needs slot wiring) | `src/app/[locale]/auctions/[id]/page.tsx` |
| Pre-order detail (needs slot wiring) | `src/app/[locale]/pre-orders/[id]/page.tsx` |
| Product detail (done) | `appkit/src/features/products/components/ProductDetailPageView.tsx` |
| **Appkit core** | |
| HorizontalScroller | `appkit/src/ui/components/HorizontalScroller.tsx` |
| HeroCarousel | `appkit/src/features/homepage/components/HeroCarousel.tsx` |
| Homepage section switch | `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` |
| ShopByCategorySection (emoji fix) | `appkit/src/features/homepage/components/ShopByCategorySection.tsx` |
| ProductGrid / ProductCard | `appkit/src/features/products/components/ProductGrid.tsx` |
| ImageLightbox | `appkit/src/ui/components/ImageLightbox.tsx` |
| ProductTabs | `appkit/src/features/products/components/ProductTabs.tsx` |
| RelatedProducts | `appkit/src/features/products/components/RelatedProducts.tsx` |
| BuyBar | `appkit/src/features/products/components/BuyBar.tsx` |
| AuctionBidHistory | `appkit/src/features/auctions/components/AuctionBidHistory.tsx` |
| AuctionsView | `appkit/src/features/auctions/components/AuctionsView.tsx` |
| ProductsView | `appkit/src/features/products/components/ProductsView.tsx` |
| ProductFilters | `appkit/src/features/products/components/ProductFilters.tsx` |
| Pagination | `appkit/src/ui/components/Pagination.tsx` |
| SlottedListingView | `appkit/src/ui/components/SlottedListingView.tsx` |
| FilterPanel | `appkit/src/features/filters/FilterPanel.tsx` |
| **Auth & layout** | |
| Layout shell (nav, notification) | `src/app/[locale]/LayoutShellClient.tsx` |
| Auth close page (Google OAuth) | `src/app/[locale]/auth/close/page.tsx` |
| Login page client | `src/components/auth/LoginPageClient.tsx` |
| Auth me route | `src/app/api/auth/me/route.ts` |
| **API routes** | |
| Wishlist CRUD | `src/app/api/wishlist/route.ts` |
| Blog post + related | `src/app/api/blog/[slug]/route.ts` |
| Seed endpoint | `src/app/api/demo/seed/route.ts` |
| **User pages** | |
| Addresses list | `src/components/user/UserAddressesClient.tsx` |
| Add address | `src/components/user/AddAddressClient.tsx` |
| Edit address | `src/components/user/EditAddressClient.tsx` |
| Profile edit | `src/components/user/ProfilePageClient.tsx` |
| **Firebase Functions** | |
| Category DFS trigger | `functions/src/triggers/onCategoryWrite.ts` |
| Nightly position reconcile | `functions/src/jobs/positionsReconcile.ts` |
| **Cart & Checkout (stub)** | |
| Cart (guest-only) | `src/components/routing/CartRouteClient.tsx` |
| Checkout (explicit stub) | `src/components/routing/CheckoutRouteClient.tsx` |
| **Dashboard pages** | |
| User dashboard | `src/app/[locale]/user/*/page.tsx` |
| Seller dashboard | `src/app/[locale]/seller/*/page.tsx` |
| Admin dashboard | `src/app/[locale]/admin/*/page.tsx` |
| **Utilities** | |
| RichText display | `appkit/src/ui/rich-text/RichText.tsx` |
| RichTextEditor | `appkit/src/ui/components/RichTextEditor.tsx` |
| normalizeRichTextHtml | `appkit/src/utils/string.formatter.ts` |
| **Reference docs** | |
| Tracker | `d:\proj\letitrip.in\new-tracker.md` |
| Full gap analysis | `d:\proj\letitrip.in\INSTRUCTIONS.md` |
| This prompt | `d:\proj\letitrip.in\prompt.md` |
| Change log | `d:\proj\letitrip.in\newchange.md` |

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

Before moving to the next task, verify all boxes are checked:

```
□ 1. CODE    — change implemented, tsc 0 errors, browser verified
□ 2. COMMIT  — fix/feat/wire commit made with correct format
□ 3. SEED    — seed data updated (or "no change needed" noted in commit)
□ 4. TRACKER — new-tracker.md status updated ⏳ → ✅, progress count updated
□ 5. DIAGRAM — INSTRUCTIONS.md §12 gap table + §13 bug entry + relevant ASCII updated
□ 6. NEWCHANGE — newchange.md prepended with what changed (do not defer to end of session)
```

If any box is unchecked, the task is **not done**. Do not start the next task.

---

*Last updated: 2026-05-05 — Phases 24–26 complete. Next task: Phase 27 (slot-shell wiring) then remaining user mega-request items.*
