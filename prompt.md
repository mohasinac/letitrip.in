# letitrip.in — Master Working Prompt

> Paste this entire file at the start of every session.
> Read CURRENT TASK at the top, start immediately, work down the queue without asking.
> Full task status lives in `crud-tracker.md` — check it first.

---

## ⚡ CURRENT TASK — START HERE

**Next up: A1 — Admin Products CRUD (3-mode: standard / auction / pre-order)**

`AdminProductsView` already exists. Need create/edit pages with mode-selector tabs.
A seller-facing `SellerProductEditorView` already exists in appkit — extend it with admin-only fields.

Steps:
1. Read `appkit/src/features/admin/components/AdminProductsView.tsx` — check list + actionHref gap
2. Read existing seller product editor component — understand the form pattern
3. Read `src/app/api/admin/products/route.ts` and `[id]/route.ts` — confirm handlers
4. Create `AdminProductEditorView` in appkit:
   - Mode selector tab (standard / auction / preorder) at top
   - Admin-only fields: isPromoted, featured, sellerId override
   - On save: POST (create) or PUT (edit) to `/api/admin/products` + `/[id]`
5. Export + pages: `/admin/products/new` and `/admin/products/[id]/edit`
6. `npx tsc --noEmit` — 0 errors

After A1: do **A3** (Admin Coupons CRUD), **A4** (Admin Blog CRUD), **A5** (Admin FAQs CRUD).

---

## 📋 FULL PENDING QUEUE

> Canonical status for every task is in **`crud-tracker.md`**. Update it after every task and
> every 30 minutes. Below is the summary by tier.

### Tier 0-pre — Slug Format *(do first — foundational)*
| # | Task |
|---|------|
| SL1 | Standardize all seed slugs to use resource-type prefix |
| SL2 | Auto-generate prefixed slugs in all create/edit forms |
| SL3 | Confirm repository findBySlug works with prefixed slugs |
| SL4 | Update generateMetadata in all detail pages (canonical SEO) |
| SL5 | API route params pass prefixed slug unchanged |
| SL6 | Enforce id === slug for all content resources |

### Tier 0 — Bug Fixes *(all ✅)*
| # | Task | Status |
|---|------|--------|
| J5 | Bids table missing on auction detail pages | ✅ Part 48 |
| J6 | Offer amount field missing in MakeOfferButton | ✅ Part 49 |
| J1 | Store not found 404 on all store sub-pages | ✅ Part 49 |
| J2 | Blog page rendering broken | ✅ Part 49 |
| J3 | Events page rendering broken | ✅ Part 49 |
| J4 | Category pages broken listing | ✅ Part 49 |
| J7 | Deals/Promotions section empty | ✅ Part 49 |
| J9 | Featured contents sections empty | ✅ Part 49 |
| J8 | Ad slots should render conditionally | ✅ Part 51 |
| M2 | Admin Dashboard stats showing zeroes | ✅ Part 52 |

### Tier 1 — Rich Text System *(all ✅)*
| # | Task | Status |
|---|------|--------|
| K2 | RichTextRenderer component | ✅ Part 53 |
| K4+L3+L4+L5 | Wire renderer in events, blog, stores, faqs | ✅ Part 53 |
| K3 | RichTextEditor wired in admin/seller forms | ✅ Part 53 |

### Tier 2 — Product Custom Fields & Detail Sections *(pending)*
| # | Task | Status |
|---|------|--------|
| L1 | Custom fields schema + CustomFieldsEditor component | ⏳ |
| L2 | Custom section render in all product detail page types | ⏳ |
| O3 | Product pickup address selector + inline create popup | ⏳ |

### Tier 3 — Infrastructure *(all ✅)*
| # | Task | Status |
|---|------|--------|
| E2 | Missing API route handlers | ✅ Part 54 |
| E3+E4 | Field-name constants + API route constants | ✅ Part 55 |
| E1+E5 | Route constants + TypeScript input types | ✅ Part 56 |
| F2 | Brands: Firestore schema + API + Admin CRUD | ✅ Part 57 |
| H1 | InlineCreateSelect shared component | ⏳ |
| I4 | Media Library picker modal | ⏳ |

### Tier 4 — Seed Data Overhaul *(P1+P2 done)*
| # | Task | Status |
|---|------|--------|
| P1+P2 | Brands seed + Categories seed | ✅ Part 58 |
| P3+P4 | Carousel + Homepage sections update | ⏳ |
| P5 | Products seed: custom fields, pickup address, featured/promoted | ⏳ |
| P6 | Users & Stores seed: slug fix, shippingConfig, payoutDetails | ⏳ |
| P7+P8+P9 | Blog posts (5), FAQ update, Notifications (10) | ⏳ |

### Tier 5 — Admin Core CRUD
| # | Task |
|---|------|
| A2 | Admin Categories CRUD |
| A1 | Admin Products CRUD (3-mode: standard/auction/preorder) |
| A3 | Admin Coupons CRUD |
| A4 | Admin Blog CRUD + RichTextEditor |
| A5 | Admin FAQs CRUD |
| A6+F3 | Admin Carousel CRUD + reorder + preview |
| N3 | Admin Stores full management |
| B1 | Admin Users role/ban management |
| B2 | Admin Orders status + refund UI |
| N2 | Admin Reviews full moderation |

### Tier 6 — Admin Finance & CMS
| # | Task |
|---|------|
| M1 | Admin Analytics dashboard |
| M3 | Admin Payouts processing + CSV export |
| F1 | Homepage Sections CMS (all 12 section types) |
| N1 | Site Settings full wiring (all 6 tab groups) |
| F5 | Navigation CMS |
| I1 | Deals/Featured inline toggles |
| B5 | Bids cancel/void |
| B6 | Newsletter export + unsubscribe |
| B7 | Contact submissions mark-read + archive |
| I3 | Sections seed reset button |

### Tier 7 — Store/Seller
| # | Task |
|---|------|
| O1 | Store slug management |
| O2+C5 | Storefront full edit (bio, policies, branding) |
| C6 | Shipping config |
| C7 | Payout settings |
| G1 | Product Templates CRUD |
| G2 | Template apply in product forms |
| C1 | Store Auctions create/edit |
| C2 | Store Pre-Orders create/edit |
| C3 | Store Coupons edit page |
| C4 | Store Orders detail + status |
| O4 | Store Analytics seller view |
| O5 | Shiprocket auto-create on ship |

### Tier 8 — User Account
| # | Task |
|---|------|
| D1 | Wishlist page wiring |
| D2 | User Profile full edit |
| D3 | User Settings complete |
| D4 | Notifications view + mark read + delete |
| D5 | Messages (deferred) |

---

## HOW TO WORK (follow this loop for every task)

1. **Read `crud-tracker.md`** — check which task is next (⏳), mark it 🔄
2. **Read** the relevant source files before writing a single line
3. **Plan** in 3–5 bullets what to change and why
4. **Implement** the smallest correct change
5. **Verify** — `npx tsc --noEmit` must be 0 errors; visually confirm in browser
6. **Commit** with format: `fix/feat(scope): description` — one task, one commit
7. **Seed** — does this change need seed data? If yes, update. If no, note it.
8. **Update `newchange.md`** — prepend a new Part entry describing what changed
9. **Update `crud-tracker.md`** — mark task ✅, fill Part #, update Summary stats + timestamp
10. **Move to next task** in the queue

### 30-minute rule
> If you are mid-task and 30 minutes have passed: update `crud-tracker.md` timestamp and add
> a progress note to the 🔄 row. Do not wait until the task is done to touch the tracker.

### Build cycle for appkit changes:
```bash
npm run watch:appkit   # keep running while editing appkit/src/
npm run dev            # Next.js dev server
npx tsc --noEmit       # must pass before commit
```

`src/` changes take effect immediately — no rebuild needed.

---

## COMPONENT REUSE — CRITICAL

**Before building any component, check if it already exists in appkit.**

### Confirmed existing components (do NOT recreate):

| Component | Location | Use for |
|-----------|----------|---------|
| `RichTextEditor` | `appkit/src/ui/components/RichTextEditor.tsx` | Editing rich content — just import and wire |
| `BidHistory` | `appkit/src/features/products/components/BidHistory.tsx` | Bid history display on auction pages |
| `MakeOfferForm` | `appkit/src/features/products/components/MakeOfferForm.tsx` | Offer submission form |
| `PlaceBidForm` | `appkit/src/features/products/components/PlaceBidForm.tsx` | Auction bid form |
| `ProductForm` | `appkit/src/features/products/components/ProductForm.tsx` | Seller product create/edit — extend for auction/preorder modes |
| `AddressForm` | `appkit/src/features/account/components/AddressForm.tsx` | Address create/edit |
| `AddressSelectorCreate` | `appkit/src/features/account/components/AddressSelectorCreate.tsx` | Pick or create address inline |
| `StoreAddressSelectorCreate` | `appkit/src/features/stores/components/StoreAddressSelectorCreate.tsx` | Store pickup address pick/create |
| `DynamicSelect` | `appkit/src/ui/components/DynamicSelect.tsx` | Async selects — base for inline-create selects |
| `RowActionMenu` | `appkit/src/ui/components/RowActionMenu.tsx` | Per-row action menus in list views |
| `BulkActionBar` | `appkit/src/ui/components/BulkActionsBar.tsx` | Bulk actions toolbar on lists |
| `ConfirmDeleteModal` | `appkit/src/ui/components/ConfirmDeleteModal.tsx` | Confirm destructive actions |
| `WishlistView` | exported from `@mohasinac/appkit/client` | User wishlist page |
| `ProfileView` | `appkit/src/features/account/components/ProfileView.tsx` | User profile display |
| `MessagesView` | `appkit/src/features/account/components/MessagesView.tsx` | Messaging (with ChatList + ChatWindow) |
| `UserNotificationsView` | `appkit/src/features/account/components/UserNotificationsView.tsx` | Notifications list |
| `ReviewModal` | `appkit/src/features/reviews/components/ReviewModal.tsx` | Full review detail modal |
| `AdminListingScaffold` | `appkit/src/features/admin/components/AdminListingScaffold.tsx` | Admin list page template |
| `AdminAnalyticsCharts` | `appkit/src/features/admin/components/analytics/` | Revenue/orders charts (already exist) |
| `SideDrawer` | `appkit/src/ui/components/SideDrawer.tsx` | All create/edit side forms |
| `ListingLayout` | `appkit/src/ui/components/ListingLayout.tsx` | Public listing pages |
| `SlottedListingView` | `appkit/src/ui/components/SlottedListingView.tsx` | Dashboard listing tables |
| `usePendingFilters` | `@mohasinac/appkit/client` | Deferred filter state |
| `useUrlTable` | `@mohasinac/appkit/client` | URL-backed pagination/sort/search |
| `FilterDrawer` | Inside `ListingLayout` | Do not duplicate |
| `useProfile` / `useUpdateProfile` | `@mohasinac/appkit/client` | User profile hooks |
| `useAddresses` etc. | `@mohasinac/appkit/client` | Address management hooks |
| `useGuestWishlist` etc. | `@mohasinac/appkit/client` | Wishlist hooks |
| `ImageCropModal` | `@mohasinac/appkit/client` | Avatar / image crop |

### New components to create (confirmed do NOT exist):
- `RichTextRenderer` — wraps DOMPurify + dangerouslySetInnerHTML with prose styling
- `AdminCategoryEditorView` — category create/edit form
- `AdminCouponEditorView` — coupon create/edit form (complex conditional)
- `AdminBlogEditorView` — blog post create/edit form
- `AdminFaqEditorView` — FAQ create/edit form
- `AdminCarouselEditorView` — carousel slide create/edit form
- `AdminProductEditorView` — admin product form (extends ProductForm with admin fields)
- `AdminBrandEditorView` + `AdminBrandsView` — new brands feature
- `MediaPickerModal` — wraps AdminMediaView in a Modal with onSelect callback
- `CustomFieldsEditor` — key/type/value/unit row builder

Anti-patterns:
```tsx
// ❌ custom filter drawer state
const [filterOpen, setFilterOpen] = useState(false);
// ❌ recreating what exists
import { MyRichTextEditor } from "./MyRichTextEditor"; // use appkit RichTextEditor
// ❌ raw dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: content }} />
// ✅ use RichTextRenderer (new) for display
<RichTextRenderer html={content} />
// ✅ use existing RichTextEditor for editing
import { RichTextEditor } from "@mohasinac/appkit/client";
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
- Do not skip `crud-tracker.md` update — update after every task AND every 30 minutes
- Do not update `INSTRUCTIONS.md §12 "LIVE SITE"` column — it is the reference, not current state
- Do not skip seed data when a UI fix exposed empty data
- Do not use `dangerouslySetInnerHTML` without going through `RichTextRenderer`

---

## SLUG FORMAT RULES — ENFORCED EVERYWHERE

All slug fields MUST start with the resource type prefix. This is the established appkit
convention (already used in `id-generators.ts` for Firestore document IDs) and must now be
applied consistently to all `slug` fields stored in Firestore and used in URLs.

### Prefix table (never deviate):

| Resource | Prefix | Example slug |
|----------|--------|-------------|
| Product (standard) | `product-` | `product-hot-wheels-redline-vintage` |
| Auction | `auction-` | `auction-pokemon-charizard-1st-edition` |
| Pre-order | `preorder-` | `preorder-dbz-goku-ultra-ego-tsume-art` |
| Store | `store-` | `store-mistys-water-cards` |
| Category | `category-` | `category-action-figures` |
| Brand | `brand-` | `brand-hot-wheels` |
| Event | `event-` | `event-summer-holo-sale-2026` |
| Blog post | `blog-` | `blog-how-to-grade-pokemon-cards` |
| Review | `review-` | `review-[productSlug]-[userId-short]` |
| User (public profile) | `user-` | `user-mohsin-c` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-summer20` |
| Section | `section-` | `section-hot-wheels-franchise` |
| Navigation item | `nav-` | `nav-new-arrivals` |

### How to generate (always use the appkit utility):

```typescript
// appkit/src/utils/string.formatter.ts
import { slugify } from "@mohasinac/appkit";

// In seed data or form save handlers:
const slug = `product-${slugify(product.title)}`;
const slug = `auction-${slugify(product.title)}`;
const slug = `store-${slugify(storeName)}`;
const slug = `category-${slugify(categoryName)}`;
const slug = `brand-${slugify(brandName)}`;
const slug = `blog-${slugify(post.title)}`;
const slug = `event-${slugify(event.title)}`;
```

### Rules:
1. **Seed data** — every document with a `slug` field must use the prefixed format. Update any
   existing seeds that are missing the prefix (e.g., `"electronics"` → `"category-electronics"`,
   `"mistys-water-cards"` → `"store-mistys-water-cards"`)
2. **Forms** — slug input in create/edit forms must auto-generate from the title using the
   prefixed format and show a preview (`/stores/store-mistys-water-cards`)
3. **Repository findBySlug** — slug lookups in `products.repository.ts` and others must
   query the prefixed slug field (no transformation needed — slug is stored with prefix)
4. **API routes** — route params like `[slug]` receive the prefixed slug unchanged; pass
   directly to the repository
5. **Navigation / `generateMetadata`** — canonical URL for each page type is the standard
   route path; slug prefix reinforces SEO signal (e.g., `/products/product-hot-wheels-xxx`)
6. **Sitemap** — when building a sitemap, slug prefix confirms resource type without reading
   the document type field
7. **Slug uniqueness** — uniqueness is enforced across the same collection only; prefixes
   prevent cross-collection collisions if slugs are ever shared in a global namespace

### ID === Slug (critical for Next.js route stability):

Firestore document IDs MUST equal the slug field. This eliminates the `[id]` vs `[slug]`
route conflict in Next.js — there is only one identifier, which is both the doc ID and the
URL slug.

```typescript
// ✅ correct — id and slug are the same value
const slug = `product-${slugify(product.title)}`;
const doc = { id: slug, slug, ...rest };
db.collection("products").doc(slug).set(doc);

// ❌ wrong — separate id and slug
const doc = { id: firestore.doc().id, slug: "hot-wheels-vintage", ...rest };
```

Resources that MUST have id === slug:
products, auctions, pre-orders, stores, categories, brands, blog posts, events,
FAQs, sections, nav items.

Resources where id is NOT the slug (use system-generated IDs):
orders, bids, offers, reviews, carts, notifications, sessions, users (Firebase Auth UID).

### What NOT to do:
```typescript
// ❌ no prefix
slug: slugify(product.title)              // "hot-wheels-redline-vintage"
// ❌ wrong resource prefix
slug: `product-${slugify(auction.title)}` // auctions must use "auction-"
// ❌ manual string (not using slugify)
slug: "My Store Name"                     // not URL-safe
// ❌ id ≠ slug (causes [id] vs [slug] Next.js confusion)
{ id: "abc123", slug: "product-hot-wheels-xxx" }
// ✅ correct
const slug = `product-${slugify(product.title)}`;
{ id: slug, slug, ...rest }
```

---

## IMPORT RULES

- Client components → import from `@mohasinac/appkit/client`
- Server components/actions → import from `@mohasinac/appkit` or `@mohasinac/appkit/server`
- UI/layout → import from `@mohasinac/appkit/ui` or `@mohasinac/appkit/client`
- Never import server-only modules in client components

### Seed upsert behavior
All Firestore writes use `batch.set(ref, data, { merge: true })` — always upsert.
User auth records are always upserted; custom claims set for non-"user" roles.

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| **Tracker** | `d:\proj\letitrip.in\crud-tracker.md` |
| **Change log** | `d:\proj\letitrip.in\newchange.md` |
| **Gap analysis** | `d:\proj\letitrip.in\INSTRUCTIONS.md` |
| **Public layout** | `src/app/[locale]/LayoutShellClient.tsx` |
| **Admin layout** | `src/app/[locale]/admin/layout.tsx` |
| **Store layout** | `src/app/[locale]/store/layout.tsx` |
| **User layout** | `src/app/[locale]/user/layout.tsx` |
| **Cart** | `src/components/routing/CartRouteClient.tsx` |
| **Checkout** | `src/components/routing/CheckoutRouteClient.tsx` |
| **Seed files** | `appkit/src/seed/` |
| **Slug utility** | `appkit/src/utils/string.formatter.ts` (`slugify`) |
| **ID generators** | `appkit/src/utils/id-generators.ts` (prefix patterns) |
| **Field constants** | `src/constants/field-names.ts` |
| **API constants** | `src/constants/api.ts` |
| **Route constants** | `@mohasinac/appkit/client` (ROUTES) |
| **HeroCarousel** | `appkit/src/features/homepage/components/HeroCarousel.tsx` |
| **ProductDetailPageView** | `appkit/src/features/products/components/ProductDetailPageView.tsx` |
| **AdminSidebar** | `appkit/src/features/admin/components/AdminSidebar.tsx` |
| **StoreSidebar** | `appkit/src/features/store/components/StoreSidebar.tsx` |
| **UserSidebar** | `appkit/src/features/user/components/UserSidebar.tsx` |
| **Wishlist API** | `src/app/api/wishlist/route.ts` |
| **Auth me route** | `src/app/api/auth/me/route.ts` |
| **Seed endpoint** | `src/app/api/demo/seed/route.ts` |

---

## REFERENCE IMPLEMENTATIONS

Copy patterns from these files:
```
src/app/[locale]/events/[id]/page.tsx         ← detail page with all render props wired
src/app/[locale]/admin/events/page.tsx        ← admin list with full CRUD links
src/app/[locale]/admin/events/new/page.tsx    ← admin create page (AdminEventEditorView)
src/app/[locale]/admin/ads/[id]/edit/page.tsx ← admin edit page (AdminAdEditorView)
src/app/[locale]/store/products/new/page.tsx  ← seller create page pattern
```

---

## PER-TASK CHECKLIST

```
□ 1. TRACKER  — crud-tracker.md marked 🔄 at start
□ 2. CODE     — implemented, tsc 0 errors, browser verified
□ 3. COMMIT   — committed with correct format, one task per commit
□ 4. SEED     — updated or noted "no change needed" in commit
□ 5. NEWCHANGE — newchange.md prepended with new Part entry
□ 6. TRACKER  — marked ✅, Part# filled, Summary stats updated, timestamp refreshed
```

---

## ✅ COMPLETED TASKS (archive — Parts 1–44)

- **Part 44** — Franchise homepage sections + filterByBrand (9 new sections 18–26)
- **Part 43** — Firebase structured logging (`src/lib/logger.ts` + `src/lib/client-logger.ts`)
- **Part 42** — Bid button scroll fix + coupon product-type conflicts
- **Part 41** — Auction bid form wired + real product images in seed
- **Part 40** — Cursive font + settings toggle (Playfair Display, FontToggleClient)
- **Part 39** — User nav collapsible sidebar (UserSidebar variant="sidebar")
- **Part 37b** — Multi-coupon + partial checkout (appliedCoupons[], selectedItemIds)
- **Part 37** — Ads: no empty placeholder space (AdSlot returns null)
- **Part 36** — Homepage carousel mobile fix (gridRow: auto on mobile)
- **Part 33** — Events inline poll voting (PollInlineClient)
- **Part 32** — Order grouping + coupon persistence
- **Part 31** — HorizontalScroller infinite loop
- **Part 30** — Stores seed storeId verified correct
- **Part 29** — Store reviews on auction pages
- **Parts 27/28** — Order grouping + Bottom button bar verified
- **Part 26** — Mobile toolbar row layout
- **Part 24** — Searchable category filter verified
- **Part 23** — Offer logic (SellerOffersPanel + UserOffersPanel)
- **Part 22** — Collapsible filter sections
- **Part 21** — Filters apply-on-click + Dark Mode Theming
- **Part 20** — Titlebar/Dashboard Nav Icons + MakeOfferButton
- **Part 19** — Navigation (mobile bottom nav + desktop hamburger)
- **Parts 1–18** — Buy Now, navigation, auctions/pre-orders, seeding, slugs, filters

*Last updated: 2026-05-05 — crud-tracker.md created; 63 tasks queued. Task J5 (bids table) is next.*
