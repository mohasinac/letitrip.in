# letitrip.in — Master Working Prompt

> Paste this entire file at the start of every session.
> The AI reads the CURRENT TASK section at the top, starts immediately, and works down the pending queue without asking.

---

## ⚡ CURRENT TASK — START HERE

**Next up: Stores seed — storeId not sellerId**

Store reviews, order grouping, bottom button bar, and all toolbar tasks are done (Parts 27-29). Next task:

Verify seed and store queries use `storeId` for ownership. Check `appkit/src/seed/pokemon-stores-seed-data.ts` — confirm `ownerId` fields match user IDs from `pokemon-users-seed-data.ts`. Check the stores repository query that fetches "my store" for a seller — it must query on `storeId` not `sellerId`. Fix store-not-found errors that appear on `/store/dashboard`.

### ✅ Completed (Part 29 — Store reviews on auction pages):
- `AuctionDetailPageView` now fetches store reviews via `listReviewsBySeller` and renders rating summary + up to 10 reviews.

### ✅ Completed (Part 27/28 — Order grouping verified + Bottom button bar verified):
- `splitCartIntoOrderGroups` already handles: auction=per-item, preorder/standard=per-seller.
- `BuyBar` already wired in all three detail page views.

### ✅ Completed (Part 26 — Mobile toolbar row layout):
- `ListingToolbar`: search on Row 1 (full width mobile); filters + sort + view toggle on Row 2.
- `FilterFacetSection`: selected chips shown when collapsed; search always visible; auto-expands when typing.

### ✅ Completed (Part 24 — Searchable category filter verified):
- `FilterFacetSection` search shows whenever `searchable={true}`.

### ✅ Completed (Part 23 — Offer Logic):
- `SellerOffersPanel`: interactive Accept/Decline/Counter with status filter tabs on `/store/offers`
- `UserOffersPanel`: buyer view with Accept Counter / Withdraw / Checkout on `/user/offers`
- `allowOffers: true` auto-set on all simple published products in all 7 franchise seed files
- `MakeOfferButton` shows no offer amount to buyer — only "Make Offer" text

### ✅ Completed (Part 22 — Collapsible filter sections):
- `RangeFilter` and `SwitchFilter` never collapse (`defaultCollapsed={false}`).
- `FilterFacetSection` collapses only when `options.length > 6`.

### ✅ Completed (Part 21 — Filters apply-on-click verified):
- All three listing components already buffer filters and only write to URL on "Apply Filters" click.

### ✅ Completed (Part 21 — Dark Mode Theming):
- **`prefers-color-scheme` → `.dark` class** — 13 CSS files fixed: Toast, Card, Dropdown, Toggle, Checkbox, Radio, Tabs, Avatar, EmptyState, Slider, DashboardStatsCard, SideModal, ListingLayout.
- **CSS variable tokens** — Button, Modal, Drawer close buttons + panel surfaces now use `var(--appkit-color-*)` tokens instead of hardcoded hex values.

### ✅ Completed (Part 20 — Titlebar/Dashboard Nav Icons):
- Titlebar hamburger visible on all screen sizes. Dashboard FABs + nav toggle use panel icon.

### ✅ Completed (Part 20 — Offer Logic):
- `MakeOfferButton` client component — single-click, no price shown, confirm step, success/pending states
- `renderOfferAction` slot added to `ProductDetailPageView` — shown for `allowOffers=true, type=simple` products
- Wired in `src/app/[locale]/products/[slug]/page.tsx` via `makeOfferAction` server action

### ✅ Completed (Part 19 — Navigation):
- **Mobile bottom nav** — `BottomNavbar` now accepts `navItems` prop; shows first 4 nav items (Home, Products, Auctions, Pre-Orders) + "More" button that opens sidebar.
- **Desktop floating hamburger** — Fixed button at `left: 0, top: calc(var(--header-height) + 6px)` on `lg+` screens. Opens/closes sidebar. `MainNavbar` (desktop nav-link bar) removed.
- **Appkit rebuilt and synced** — `appkit/src/features/layout/BottomNavbar.tsx` + `AppLayoutShell.tsx` updated.

### ✅ Previously done:
- Part 18: Slug URL fixes for auctions/pre-orders/products seed
- Part 17: FAQ page crash fix, welcome section re-added to seed, all 12 homepage sections
- Part 16: Detail pages (BidHistory, auction/pre-order tabs, product Buy Now), dashboard FABs, grouped nav

---

## 📋 FULL PENDING QUEUE

| # | Task | Notes |
|---|------|-------|
| 1 | **Buy Now buttons** | ⚠️ Verify in browser — Product detail, auction buyout, pre-order Add to Cart wired in Part 16 |
| 2 | **Offer logic** | Simple products only. 1 attempt per user. No amount shown to buyer. Seller accepts/rejects from store dashboard offers page. Check `appkit/src/features/offers/` for existing hooks/components. |
| 3 | **Filters — apply on click** | All filter toggles/ranges must buffer in `usePendingFilters` state. Only write to URL on "Apply Filters" click. Sort dropdown and grid/list toggle remain on-change. Check `ProductFilters.tsx`, `AuctionFilters.tsx`, `PreOrderFilters.tsx` — each must use `usePendingFilters`. |
| 5 | **Collapsible filters** | Only collapse filter groups that have many options (> 6 items). Range sliders and boolean toggles never collapse. Add collapse toggle to `FilterPanel.tsx`. |
| 6 | **Category filter — searchable dropdown** | Replace the current category list/chips in `ProductFilters` with a searchable `<select>` or combobox that shows selected categories inline. Apply via "Apply Filters" only. |
| 7 | **Sticky toolbar fix** | Listing page toolbar currently uses `top-14`. Must stick below breadcrumbs/searchbar as user scrolls. Audit `ListingLayout.tsx` or `ProductsIndexListing.tsx` — compute correct top offset based on actual header height. |
| 8 | **Mobile toolbar row layout** | Row 1: search + confirm button. Row 2: sort + grid/list toggle. Row 3: pagination. Currently these are collapsed or in wrong order on mobile. Fix in `ListingLayout.tsx`. |
| 9 | **Bottom button bar** | On product/auction/pre-order detail pages: a fixed bar above the bottom nav showing Buy Now / Add to Cart / Wishlist / Bid icons. Must always be visible on mobile without scrolling. |
| 10 | **Order grouping** | Auctions → always individual orders. Simple products + pre-orders from the same store → grouped into one order. Coupons apply to group total. Update checkout flow in `CheckoutRouteClient.tsx` + order creation API. |
| 11 | **Store reviews on auction pages** | At the bottom of auction detail: show store rating summary + up to 10 most recent store reviews. Wire `renderStoreReviews` slot if it exists in `AuctionDetailView`, otherwise add it. |
| 12 | **Stores seed — storeId not sellerId** | Verify seed and store queries use `storeId` for ownership. Check `pokemon-stores-seed-data.ts` ownerId fields match `pokemon-users-seed-data.ts` user IDs. Fix store-not-found errors. |
| 13 | **Circular/infinite horizontal scrollers** | `HorizontalScroller` currently stops at the last item. Add infinite-loop mode: clone first/last slides and jump seamlessly. Add `loop` prop to the component in appkit. |
| 14 | **Events — polls + richer seed** | Add public polls (no login required) and login-required polls to `EventDetailView`. Add `pollConfig` to events seed data. Fix participate button if broken. |
| 15 | **Homepage carousel** | 1 card per row on mobile, max 2 rows, proper slide dimensions. Check `HeroCarousel` and `pokemon-carousel-slides-seed-data.ts`. |
| 16 | **Ads — no empty space** | If `adSlots` prop has no content for a slot, render nothing (no reserved height). Fix in `MarketplaceHomepageView.tsx` and any listing page ad slots. |
| 17 | **200 products + open-source images** | Verify `allProductsSeedData` across 7 franchises reaches ~200 products. Replace any `picsum.photos` or random image URLs with proper open-source image URLs (Wikimedia Commons, official TCG image APIs, etc.). Add `videoUrl` field where appropriate. |
| 18 | **User nav collapsible** | In user sidebar, nav groups are auto-collapsed by default. User can expand. Implement in `UserSidebar` (appkit). |
| 19 | **Cursive font + toggle** | Add a quality cursive/display font (e.g. Playfair Display or Dancing Script from Google Fonts). Settings page: toggle below theme toggle to switch between cursive and Roboto. Store preference in localStorage. |
| 20 | **Firebase logs** | Replace `console.log`/`console.error` with Firebase logging (Firebase Performance or custom structured logging). File-based logs only in local dev. |
| 21 | **Cart & Checkout (Phase 28)** | Auth-backed cart (not just localStorage). Razorpay payment integration. Order creation API. See `CartRouteClient.tsx` and `CheckoutRouteClient.tsx`. |
| 22 | **Admin Events CRUD (Phase 30)** | `AdminEventsView` component in appkit. Create/edit events from admin panel. |
| 23 | **Rich Text (Phase 33)** | Store bio, return/shipping policies, category descriptions, event content — all currently plain text. Wire `RichTextEditor` in create/edit forms. |
| 24 | **Responsive audit (Phase 22/23)** | 375px / 768px / 1024px viewport testing. Lighthouse ≥ 90. |

---

## HOW TO WORK (follow this loop for every task)

### Each task:
1. **Read** the relevant source files before writing a single line
2. **Plan** in 3–5 bullets what to change and why
3. **Implement** the smallest correct change
4. **Verify** — `npx tsc --noEmit` must be 0 errors; visually confirm in browser
5. **Commit** with format: `fix/feat(nav): description` — one task, one commit
6. **Seed** — does this change need seed data? If yes, update. If no, note it.
7. **Update `newchange.md`** — prepend a new Part entry describing what changed
8. **Move to next task** in the queue above

### Build cycle for appkit changes:
```bash
npm run watch:appkit   # keep running while editing appkit/src/
npm run dev            # Next.js dev server
npx tsc --noEmit       # must pass before commit
```

`src/` changes take effect immediately — no rebuild needed.

---

## COMPONENT REUSE — CRITICAL

Never create custom drawers, filter panels, or listing layouts. Always use:

| Component | Use for |
|-----------|---------|
| `ListingLayout` | Any public listing page (products, auctions, pre-orders, stores) |
| `SlottedListingView` | Admin/seller dashboard listing tables |
| `usePendingFilters` | Deferred filter state (stage changes, apply on click) |
| `useUrlTable` | URL-backed pagination / sort / search state |
| `SideDrawer` | Edit/create forms (addresses, products) |
| `FilterDrawer` | Already inside `ListingLayout` — do not duplicate |

Anti-patterns:
```tsx
// ❌ custom state for filter drawer
const [filterOpen, setFilterOpen] = useState(false);
// ❌ desktop-only search
{isDesktop && <SearchInput />}
```

---

## COMMIT FORMAT

```
fix(phase-X.Y): <verb> <what>
feat(nav): <verb> <what>
wire(phase-X.Y): <page> slot-shells
seed(phase-X.Y): <collection> seed data

- bullet: file A — what changed
- bullet: file B — what changed
- Root cause: one sentence
```

Never commit with TSC errors. Never batch multiple tasks in one commit.

---

## WHAT NOT TO DO

- Do not refactor beyond the current task
- Do not add comments explaining what code does
- Do not run `git push` unless asked
- Do not skip `newchange.md` update — always prepend after completing a task
- Do not update `INSTRUCTIONS.md §12 "LIVE SITE"` column — it is the reference, not current state
- Do not skip seed data when a UI fix exposed empty data

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| **Public layout** | `src/app/[locale]/LayoutShellClient.tsx` |
| **Admin layout** | `src/app/[locale]/admin/layout.tsx` |
| **Store layout** | `src/app/[locale]/store/layout.tsx` |
| **User layout** | `src/app/[locale]/user/layout.tsx` |
| **AppLayoutShell** | `appkit/src/ui/components/AppLayoutShell.tsx` (or similar) |
| **HorizontalScroller** | `appkit/src/ui/components/HorizontalScroller.tsx` |
| **HeroCarousel** | `appkit/src/features/homepage/components/HeroCarousel.tsx` |
| **Homepage sections** | `appkit/src/features/homepage/components/MarketplaceHomepageView.tsx` |
| **ProductGrid/Card** | `appkit/src/features/products/components/ProductGrid.tsx` |
| **ProductDetailPageView** | `appkit/src/features/products/components/ProductDetailPageView.tsx` |
| **ProductFilters** | `appkit/src/features/products/components/ProductFilters.tsx` |
| **AuctionsView** | `appkit/src/features/auctions/components/AuctionsView.tsx` |
| **BuyBar** | `appkit/src/features/products/components/BuyBar.tsx` |
| **ListingLayout** | `appkit/src/ui/components/ListingLayout.tsx` (or SlottedListingView) |
| **FilterPanel** | `appkit/src/features/filters/FilterPanel.tsx` |
| **UserSidebar** | `appkit/src/features/user/components/UserSidebar.tsx` |
| **AdminSidebar** | `appkit/src/features/admin/components/AdminSidebar.tsx` |
| **StoreSidebar** | `appkit/src/features/store/components/StoreSidebar.tsx` |
| **Wishlist API** | `src/app/api/wishlist/route.ts` |
| **Blog API** | `src/app/api/blog/[slug]/route.ts` |
| **Auth me route** | `src/app/api/auth/me/route.ts` |
| **Seed endpoint** | `src/app/api/demo/seed/route.ts` |
| **User addresses** | `src/components/user/UserAddressesClient.tsx` |
| **Profile page** | `src/components/user/ProfilePageClient.tsx` |
| **Cart** | `src/components/routing/CartRouteClient.tsx` |
| **Checkout** | `src/components/routing/CheckoutRouteClient.tsx` |
| **Auctions listing** | `src/app/[locale]/auctions/page.tsx` |
| **Products listing** | `src/app/[locale]/products/page.tsx` |
| **Pre-orders listing** | `src/app/[locale]/pre-orders/page.tsx` |
| **Tracker** | `d:\proj\letitrip.in\new-tracker.md` |
| **Gap analysis** | `d:\proj\letitrip.in\INSTRUCTIONS.md` |
| **Change log** | `d:\proj\letitrip.in\newchange.md` |
| **Seed files** | `appkit/src/seed/` |

---

## REFERENCE IMPLEMENTATIONS

Copy patterns from these files:
```
src/app/[locale]/events/[id]/page.tsx       ← detail page with all render props wired
src/app/[locale]/search/[slug]/.../page.tsx ← listing page with filters + search + sort
```

---

## PER-TASK CHECKLIST

```
□ 1. CODE     — implemented, tsc 0 errors, browser verified
□ 2. COMMIT   — committed with correct format, one task per commit
□ 3. SEED     — updated or noted "no change needed" in commit
□ 4. TRACKER  — new-tracker.md updated ⏳ → ✅ if applicable
□ 5. NEWCHANGE — newchange.md prepended with new Part entry
```

---

## BUILD ISSUES & RESOLUTIONS (reference)

### Import rules
- Client components → import from `@mohasinac/appkit/client`
- Server components/actions → import from `@mohasinac/appkit` or `@mohasinac/appkit/server`
- UI/layout → import from `@mohasinac/appkit/ui` or `@mohasinac/appkit/client`
- Never import server-only modules in client components

### Seed upsert behavior
All Firestore writes use `batch.set(ref, data, { merge: true })` — always upsert.
User auth records are always upserted; custom claims set for non-"user" roles.

---

*Last updated: 2026-05-05 — Phases 24–27 done. Navigation overhaul is next.*
