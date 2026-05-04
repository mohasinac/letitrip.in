# letitrip.in — Master Working Prompt

> Paste this entire file at the start of every session.
> The AI reads the CURRENT TASK section at the top, starts immediately, and works down the pending queue without asking.

---

## ⚡ CURRENT TASK — START HERE

**Next up: Cart & Checkout — auth-backed cart + Razorpay end-to-end (Task 21)**

Tasks 17–20 done (Parts 38/38b, 39, 40, 43). Next task:

Multi-coupon + partial checkout done (Part 37b). Remaining:
1. **Auth-backed cart** — guest localStorage cart should sync to Firestore when user signs in; on page load read from Firestore if authenticated, fallback to localStorage.
2. **Razorpay payment flow end-to-end** — verify `/api/checkout` → Razorpay order creation → `/api/payment/verify` → order save works in browser; check for missing env vars, unhandled edge cases.
See `src/components/routing/CartRouteClient.tsx` and `src/components/routing/CheckoutRouteClient.tsx`.

### ✅ Completed (Part 43 — Firebase structured logging):
- `src/lib/logger.ts`: server-side; structured JSON to stdout in prod (Cloud Logging), writes to `logs/app.log` in dev.
- `src/lib/client-logger.ts`: client-side; console in dev only, no-op in prod.
- All 4 `console.log`/`console.error`/`console.warn` calls in `src/` replaced.
- `proxy.ts`: Edge-safe — structured JSON passed to `console.error` for Cloud Logging ingestion.

### ✅ Completed (Part 40 — Cursive font + toggle):
- `Playfair_Display` added to `src/app/layout.tsx` as `--font-cursive`; inline script applies `font-cursive` class on `<html>` from localStorage on load.
- `src/app/globals.css`: `html.font-cursive` overrides body + heading `font-family` to Playfair Display.
- `UserSettingsView`: new `renderAppearance` render prop added (appkit).
- `FontToggleClient`: toggle switch reads/writes `localStorage['font-style']` and toggles `html.font-cursive` class.
- Settings page wires `FontToggleClient` via `renderAppearance`.

### ✅ Completed (Part 39 — User nav collapsible sidebar):
- `UserSidebar` gains `variant="sidebar"` — persistent inline aside on desktop (`md+`), BottomSheet on mobile.
- Nav groups start collapsed; active group auto-expands on mount. `defaultOpen: true` forces group open.
- `src/app/[locale]/user/layout.tsx`: two-column layout — inline sidebar + `<main>`.

### ✅ Completed (Part 37b — Multi-coupon conflict detection + cart UI):
- `CartDocument` uses `appliedCoupons[]` + `selectedItemIds?`; `CartItemDocument` gains `sellerSlug?`.
- `addCoupon`/`removeCoupon(code)`/`clearAllCoupons`/`setSelectedItems` on `CartRepository`.
- `POST /api/cart/coupon`: conflict rules (duplicate, one-per-seller, admin+seller exclusion).
- `PUT /api/cart/selection`: new route — persists selected item IDs for partial checkout.
- Checkout + payment/verify: partial checkout + multi-coupon pro-rating; saves `appliedDiscounts[]`.
- `CartRouteClient`: seller grouping, per-item checkboxes, multi-coupon chips, partial checkout button.

### ✅ Completed (Part 37 — Ads: no empty placeholder space):
- All 4 homepage `AdSlot` components return `null` — no 90px placeholder banners.

### ✅ Completed (Part 36 — Homepage carousel mobile fix):
- `HeroCarousel`: `gridRow: auto` on mobile fixes card overlap; card 90% width + auto height; 260px min-height on mobile.
- Checkout/verify routes: `appliedCoupons[0]` instead of missing `appliedCoupon`; inline discount type.

### ✅ Completed (Part 33 — Events inline poll voting):
- `PollInlineClient` created: inline radio/checkbox poll with login-required auth gate.
- `EventDetailView` `renderContent` wired to show poll options for poll events.
- `PollConfig.requireLogin` added to appkit types; PSA poll seed marked login-required.

### ✅ Completed (Part 32 — Order grouping + coupon persistence):
- `couponCode`/`couponDiscount` added to `OrderDocument`.
- `appliedCoupon` persisted in `CartDocument` via `setCoupon()`/`clearCoupon()` on `CartRepository`.
- `/api/cart/coupon` POST persists to Firestore; DELETE clears it.
- Cart page reads server-persisted coupon; derives `effectiveCoupon = localCoupon ?? serverAppliedCoupon`.
- Both checkout routes (`/api/checkout` and `/api/payment/verify`) pro-rate discount across order groups and clear coupon after successful order.

### ✅ Completed (Part 31 — HorizontalScroller infinite loop):
- `loop` prop added; clones first N items to end; instant-jump at boundaries for seamless wrap.
- TSC fixes: `cart/coupon/route.ts` coupon cast, `CartRouteClient.tsx` state rename.

### ✅ Completed (Part 30 — Stores seed storeId verified correct):
- No issues found: `ownerId`, `sellerId`, and query on `findByOwnerId` all consistent.

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
| ~~3~~ | ~~Filters — apply on click~~ | ✅ Done (Part 21) |
| ~~5~~ | ~~Collapsible filters~~ | ✅ Done (Part 22) |
| ~~6~~ | ~~Category filter — searchable dropdown~~ | ✅ Done (Part 24) |
| ~~7~~ | ~~Sticky toolbar fix~~ | ✅ Done (already correct) |
| ~~8~~ | ~~Mobile toolbar row layout~~ | ✅ Done (Part 26) |
| ~~9~~ | ~~Bottom button bar~~ | ✅ Done (Part 27) |
| ~~10~~ | ~~Order grouping~~ | ✅ Done (Part 28 — already correct) |
| ~~11~~ | ~~Store reviews on auction pages~~ | ✅ Done (Part 29) |
| ~~12~~ | ~~Stores seed — storeId not sellerId~~ | ✅ Done (Part 30 — already correct) |
| ~~13~~ | ~~Circular/infinite horizontal scrollers~~ | ✅ Done (Part 31) |
| ~~14~~ | ~~Events — polls + richer seed~~ | ✅ Done (Part 33) |
| ~~15~~ | ~~Homepage carousel~~ | ✅ Done (Part 36) |
| ~~16~~ | ~~Ads — no empty space~~ | ✅ Done (Part 37) |
| ~~17~~ | ~~200 products + open-source images~~ | ✅ Done (Part 38/38b) |
| ~~18~~ | ~~User nav collapsible~~ | ✅ Done (Part 39) |
| ~~19~~ | ~~Cursive font + toggle~~ | ✅ Done (Part 40) |
| ~~20~~ | ~~Firebase logs~~ | ✅ Done (Part 43) — `src/lib/logger.ts` + `src/lib/client-logger.ts`; all 4 console calls replaced |
| 21 | **Cart & Checkout (Phase 28)** | Multi-coupon + partial checkout done (Part 37b). Remaining: auth-backed cart (Firestore sync), Razorpay payment flow end-to-end verification. See `CartRouteClient.tsx` and `CheckoutRouteClient.tsx`. |
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

*Last updated: 2026-05-05 — Task 20 (Firebase logs) done (Part 43). Task 21 (Cart & Checkout auth-sync + Razorpay) is next.*
