# letitrip.in — Master Working Prompt

> Paste this entire file at the start of every session.
> The AI reads the CURRENT TASK section at the top, starts immediately, and works down the pending queue without asking.

---

## ⚡ CURRENT TASK — START HERE

**Next up: User Request — Navigation Overhaul**

The main public layout (`LayoutShellClient.tsx` → `AppLayoutShell`) currently shows a top hamburger sidebar on mobile. The user wants menu items moved to a **bottom nav bar** on mobile, and a **hamburger icon below the navbar** on desktop (not inside the top bar).

Dashboard sidebars (admin/store/user) already have a mobile FAB — those are done. This task is about the **public AppLayoutShell only**.

### What to do

1. **Check if `AppLayoutShell` already supports a `bottomNav` prop** — read `appkit/src/ui/components/AppLayoutShell.tsx` (or wherever the component lives). If a `bottomNavItems` / `bottomNav` prop exists, wire it in `LayoutShellClient.tsx` with the same `navItems` array.

2. **If no bottom nav prop exists**, add it to `AppLayoutShell` in appkit:
   - On `< lg` screens: render a fixed bottom bar (`fixed bottom-0 left-0 right-0 z-40 pb-safe`) showing up to 5 icon+label items from `navItems`. The rest go in the hamburger sidebar.
   - On `>= lg` screens: render the existing top nav bar unchanged.
   - Rebuild appkit after changes.

3. **Desktop hamburger** — user wants a hamburger icon **below** the navbar (not inside the title bar). On `>= lg` screens, add a small hamburger trigger anchored below the sticky title bar (e.g. `top-14` offset, left side) that opens the existing sidebar drawer. This replaces the inline nav links on desktop.

4. **Same treatment for store and admin layouts** if they have a persistent sidebar nav — confirm or add a compact sidebar-open trigger below the top bar on desktop.

5. Run `npx tsc --noEmit` — 0 errors before committing.

6. Commit:
   ```
   feat(nav): bottom nav on mobile + below-navbar hamburger on desktop
   ```

7. Update `newchange.md` at the top with a new Part entry.

---

## 📋 FULL PENDING QUEUE (work in this order after navigation)

| # | Task | Notes |
|---|------|-------|
| 1 | **Navigation** | ↑ described above — START HERE |
| 2 | **Buy Now buttons** | Add for: (a) simple products, (b) auctions with `buyoutPrice`, (c) pre-orders. Wire in `ProductDetailPageView`, `AuctionDetailView`, `PreOrderDetailView`. Appkit `BuyBar` already exists — check if it has a buyout path first. |
| 3 | **Offer logic** | Re-add for simple products only. 1 attempt per user. No amount shown to buyer. Seller accepts/rejects from store dashboard offers page. Check `appkit/src/features/offers/` for existing hooks/components. |
| 4 | **Filters — apply on click** | All filter toggles/ranges must buffer in `usePendingFilters` state. Only write to URL on "Apply Filters" click. Sort dropdown and grid/list toggle remain on-change. Check `ProductFilters.tsx`, `AuctionFilters.tsx`, `PreOrderFilters.tsx` — each must use `usePendingFilters`. |
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
