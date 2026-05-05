# LetItRip — CRUD & Pages Tracker

> **Last updated:** 2026-05-06 — Part 59 (A2 ✅). 0 TS errors. Next: A1 Admin Products CRUD (3-mode).
> Update after every completed task OR every 30 minutes during a session.
> Status: ⏳ pending | 🔄 in progress | ✅ done | ❌ blocked

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 69 |
| ✅ Done | 22 |
| 🔄 In Progress | 0 |
| ❌ Blocked | 0 |
| ⏳ Remaining | 47 |

---

## Tier 0-pre — Slug Format Enforcement *(foundational, do before seed data and forms)*

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| SL1 | Standardize all slug fields in seed data to use resource-type prefix | M | ✅ | Part 47 | All 20 seed files updated; id===slug enforced; carousel links fixed; appkit committed |
| SL2 | Auto-generate prefixed slugs in all create/edit forms | S | ✅ | Part 48 | CategoryForm: category-/category-brand-; BlogPostForm: blog-; both use slugify() |
| SL3 | Update repository findBySlug methods to use prefixed slugs | S | ✅ | Part 48 | All repos query slug field directly; fixed faqQueryHelpers.bySlug to use top-level slug |
| SL4 | Update generateMetadata in all detail pages for SEO | S | ⏳ | | Canonical URL uses prefixed slug; title + description use entity-specific metadata; `openGraph.url` reflects the full canonical path |
| SL5 | Backend API route slug params — no transformation needed | S | ⏳ | | Route params (`[slug]`) receive the prefixed slug as-is from the URL; pass directly to repository; no stripping or re-prefixing |
| SL6 | Enforce id === slug for all resources (no separate id field where slug is used as route param) | M | ⏳ | | Firestore document ID must equal the slug field. Already done for products via `generateProductId()`. Confirm and enforce for: stores, categories, brands, blog posts, events, FAQs, sections, nav items. Eliminates [id] vs [slug] route confusion in Next.js |

### Slug prefix table (enforced everywhere):

| Resource | Prefix | Example |
|----------|--------|---------|
| Product | `product-` | `product-hot-wheels-redline-vintage` |
| Auction | `auction-` | `auction-pokemon-charizard-1st-edition` |
| Pre-order | `preorder-` | `preorder-dbz-goku-ultra-ego` |
| Store | `store-` | `store-mistys-water-cards` |
| Category | `category-` | `category-action-figures` |
| Brand | `brand-` | `brand-hot-wheels` |
| Event | `event-` | `event-summer-holo-sale-2026` |
| Blog post | `blog-` | `blog-how-to-grade-pokemon-cards` |
| Review | `review-` | `review-[productSlug]-[userId-short]` |
| User profile | `user-` | `user-mohsin-c` |
| FAQ | `faq-` | `faq-how-does-bidding-work` |
| Coupon | `coupon-` | `coupon-summer20` |
| Section | `section-` | `section-hot-wheels-franchise` |
| Nav item | `nav-` | `nav-new-arrivals` |

---

## Tier 0 — Bug Fixes *(do these first)*

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| J5 | Bids table missing / bid history on auction pages | S | ✅ | Part 48 | Already wired in AuctionDetailPageView; BidHistory renders via belowFold in AuctionDetailView |
| J6 | Offer amount field missing in MakeOfferButton | S | ✅ | Part 49 | Added amount input, note field, min/max validation, error state returns to confirm |
| J1 | Store not found — 404 handling on all store sub-pages | S | ✅ | Part 49 | Fixed in stores/[storeSlug]/layout.tsx: calls notFound() if store is null |
| J2 | Blog page rendering broken | S | ✅ | Part 49 | Added notFound() for missing posts; deduplicated server fetch; ShareButtons uses post.title |
| J3 | Events page rendering broken | S | ✅ | Part 49 | Replaced inline not-found UI with notFound(); removed unused imports |
| J4 | Category pages broken listing | S | ✅ | Part 49 | Added getCategoryBySlug check + notFound() before rendering CategoryDetailPageView |
| J7 | Deals/Promotions sections empty | S | ✅ | Part 49 | Added ?isPromoted=true direct param to buildFilters in products API; sievejs handles bool coercion correctly. Remaining: seed data needs isPromoted=true products (P5) |
| J9 | Featured contents sections empty | S | ✅ | Part 49 | ?featured=true was already in buildFilters; sievejs coerces "true"→boolean; remaining: P5 seed data |
| J8 | Ad slots should render conditionally (not always null) | S | ✅ | Part 51 | `/api/ads?slot=` public route + `useActiveAd` hook + ManualAdBanner; AfterHeroAdSlot wired to `<AdSlot>` |
| M2 | Admin Dashboard stats showing zeroes | S | ✅ | Part 52 | API now returns totalRevenue (sum delivered), pendingOrders, pendingReviews; mapped to DashboardStatsGrid |

---

## Tier 1 — Rich Text System

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| K2 | RichTextRenderer component + isomorphic-dompurify | S | ✅ | Part 53 | SSR-safe `RichTextRenderer` created in appkit/src/ui/rich-text/; exported from ui/index, index, client |
| K4+L3+L4+L5 | Wire renderer in events, blog, stores about, faqs | S | ✅ | Part 53 | Events/blog already wired; StoreAboutView bio→RichText; FAQPageView answers→RichTextRenderer |
| K3 | Wire existing RichTextEditor in admin/seller forms | S | ✅ | Part 53 | AdminEventEditorView + ProductForm already use RichTextEditor; blog/FAQ editors in A4/A5 |

---

## Tier 2 — Product Custom Fields & Detail Sections

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| L1 | Custom fields schema + CustomFieldsEditor component | M | ⏳ | | NEW: `CustomFieldsEditor` (key/type/value/unit row list with add/remove) — check if TagInput or FormField patterns from ui/components are sufficient base |
| L2 | Custom section render in product detail pages (all types) | M | ⏳ | | REUSE: `ProductDetailPageView`, `AuctionDetailView`, `PreOrderDetailView` already exist — add renderCustomFields + renderTypeSection render props |
| O3 | Product pickup address selector + inline create popup | M | ⏳ | | REUSE: `StoreAddressSelectorCreate.tsx` EXISTS in appkit stores/components — adapt pattern; also `AddressSelectorCreate` in account/components |

---

## Tier 3 — Infrastructure

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| E2 | Missing API route handlers (16 new PUT/DELETE endpoints) | M | ✅ | Part 54 | admin/reviews[id], bids[id], contact-submissions[id], faqs[id], newsletter[id] fixed+DELETE added; store/orders[id], coupons[id]; user/notifications list+[id]+read-all |
| E3+E4 | Field-name constants + API route constants | S | ✅ | Part 55 | CATEGORY_FIELDS, BLOG_FIELDS, USER_FIELDS added; COUPON_FIELDS.SCOPE_VALUES added; API_ROUTES expanded with ~45 ADMIN/STORE/USER routes |
| E1+E5 | Route constants for new pages + TypeScript input types | S | ✅ | Part 56 | ROUTES.ADMIN/STORE + create/edit routes; src/types/input-types.ts with 12 input type interfaces |
| F2 | Brands: Firestore schema + API + Admin CRUD + nav item | M | ✅ | Part 57 | BrandDocument, BrandsRepository; GET/POST /api/admin/brands + [id]; public /api/brands; AdminBrandsView + AdminBrandEditorView; Brands in Catalog nav |
| H1 | InlineCreateSelect shared component | M | ⏳ | | REUSE BASE: `DynamicSelect.tsx` EXISTS in appkit ui/components — evaluate if adding "+ Create new" option is sufficient; also reuse `SideDrawer` for the inline form popup |
| I4 | Media Library picker modal (MediaPickerModal) | M | ⏳ | | NEW: `MediaPickerModal` — wraps existing `AdminMediaView` in a Modal; adds onSelect callback; `Modal.tsx` and `AdminMediaView.tsx` both EXIST |

---

## Tier 4 — Seed Data Overhaul

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| P1+P2 | Brands seed (15–20) + Categories seed (hierarchy) | S | ✅ | Part 58 | 15 franchise brands seeded (brand- prefix, id===slug). Categories already fully seeded via pokemonCategoriesSeedData (Hot Wheels, Beyblade, Pokémon + product types) |
| P3+P4 | Carousel slides update + Homepage sections brand/category refs | S | ⏳ | | filterByBrand refs must match `brand-` prefixed slugs. Section ids use `section-` prefix |
| P5 | Products seed: custom fields, pickup address, featured/promoted | M | ⏳ | | ALL product slugs → `product-` prefix; auction slugs → `auction-` prefix; preorder → `preorder-`. id === slug for all. customFields per category |
| P6 | Users & Stores seed: slug fix, shippingConfig, payoutDetails | S | ⏳ | | Store slugs MUST use `store-` prefix (e.g. `store-mistys-water-cards`). id === storeSlug. Fix inconsistent existing store seeds |
| P7+P8+P9 | Blog posts (5), FAQ update, Notifications (10) seed | S | ⏳ | | Blog slugs → `blog-` prefix; FAQ slugs → `faq-` prefix. id === slug. Raw HTML content for blog |

---

## Tier 5 — Admin Core CRUD

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| A2 | Admin Categories CRUD — list + create + edit | S | ✅ | Part 59 | AdminCategoryEditorView in appkit; /admin/categories/new + [id]/edit pages; GET/POST/PUT/DELETE API routes; CATEGORY_BY_ID endpoint added; actionHref on list |
| A1 | Admin Products CRUD — 3-mode (standard/auction/preorder) | L | ⏳ | | LIST: `AdminProductsView` EXISTS. NEW: `AdminProductEditorView`. REUSE: `ProductForm.tsx` EXISTS in products/components as seller form — extend with admin-only fields (isPromoted, featured, sellerId); use `Tabs` for mode selector |
| A3 | Admin Coupons CRUD — complex conditional form | L | ⏳ | | LIST: `AdminCouponsView` EXISTS. NEW: `AdminCouponEditorView`. REUSE: `Select`, `Input`, `Toggle`, `Tabs`, `FormGrid`, `SideDrawer` from ui/components; conditional sections per coupon type |
| A4 | Admin Blog CRUD — with RichTextEditor | M | ⏳ | | LIST: `AdminBlogView` EXISTS. NEW: `AdminBlogEditorView`. REUSE: `RichTextEditor` (K3 already exists), `Input`, `TagInput`, `Toggle`, `SideDrawer` from ui/components |
| A5 | Admin FAQs CRUD — with rich text answer | S | ⏳ | | LIST: `AdminFaqsView` EXISTS. NEW: `AdminFaqEditorView`. REUSE: `RichTextEditor`, `Input`, `Select`, `Toggle`, `SideDrawer` |
| A6+F3 | Admin Carousel CRUD + reorder + live preview | S | ⏳ | | LIST: `AdminCarouselView` EXISTS. NEW: `AdminCarouselEditorView`. REUSE: `SideDrawer`, `Input`, `Toggle`; add drag-reorder handle to existing list |
| N3 | Admin Stores full management (slug, verify, suspend) | M | ⏳ | | LIST: `AdminStoresView` EXISTS. ADD: action buttons (approve/reject/suspend/verify) via `RowActionMenu` (EXISTS in ui/components). API: PUT /api/admin/stores/[uid]. New fields: isVerified, suspensionReason |
| B1 | Admin Users role/ban management | M | ⏳ | | LIST: `AdminUsersView` EXISTS. ADD: role dropdown + ban toggle per row via `RowActionMenu`. REUSE: `RoleBadge`, `StatusBadge`, `SideDrawer` for detail view. API: PUT /api/admin/users/[uid] |
| B2 | Admin Orders status + refund UI | M | ⏳ | | LIST: `AdminOrdersView` EXISTS. ADD: status update + tracking via `SideDrawer` detail view. REUSE: `SideDrawer`, `Select`, `Input`, `BulkActionBar` (all EXIST). API: PUT /api/admin/orders/[id] |
| N2 | Admin Reviews full moderation (approve/reject/feature/reply) | M | ⏳ | | LIST: `AdminReviewsView` EXISTS. ADD: action buttons via `RowActionMenu`. REUSE: `ReviewModal`/`ViewReviewModal` EXISTS for full view. API: PUT /api/admin/reviews/[id] |

---

## Tier 6 — Admin Finance & CMS

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| M1 | Admin Analytics dashboard — charts + date range | M | ⏳ | | VIEW: `AdminAnalyticsView` EXISTS + `AdminRevenueChart`/`AdminOrdersChart`/`AdminTopProductsTable` all EXIST in appkit analytics/ — wire to real API; REUSE: `DashboardStatsCard`, `StatsGrid` |
| M3 | Admin Payouts processing + export CSV | M | ⏳ | | LIST: `AdminPayoutsView` EXISTS. ADD: mark-paid action via `RowActionMenu` + `BulkActionBar`. API: PUT /api/admin/payouts/[id]; GET /api/admin/payouts/export |
| F1 | Homepage Sections CMS — AdminSectionsView all types | L | ⏳ | | LIST: `AdminSectionsView` EXISTS (62KB). Complete type-specific config forms using `SideDrawer` + `Select` + `Input` + `Toggle`. REUSE all ui/components |
| N1 | Site Settings full wiring — all 6 tab groups | M | ⏳ | | VIEW: `AdminSiteView` EXISTS. Complete with `Tabs` (EXISTS in ui/components) for 6 groups; `Input`, `Toggle`, `Select` for each setting |
| F5 | Navigation CMS — dynamic nav items in Firestore | M | ⏳ | | VIEW: `AdminNavigationView` EXISTS. Complete CRUD using `SideDrawer` + `Input` + `Toggle` + drag-reorder. API: PUT/DELETE /api/admin/navigation/[id] |
| I1 | Deals/Featured inline toggles on admin products list | S | ⏳ | | REUSE: `RowActionMenu` (EXISTS) — add toggle actions to `AdminProductsView` rows via existing PUT /api/admin/products/[id] |
| B5 | Bids cancel/void | S | ⏳ | | LIST: `AdminBidsView` EXISTS. ADD: cancel via `RowActionMenu`. REUSE: `ConfirmDeleteModal` (EXISTS). API: PUT /api/admin/bids/[id] |
| B6 | Newsletter export CSV + unsubscribe | S | ⏳ | | LIST: `AdminNewsletterView` EXISTS. ADD: unsubscribe via `RowActionMenu` + export button in toolbar. API: DELETE /api/admin/newsletter/[id]; GET /api/admin/newsletter/export |
| B7 | Contact submissions mark-read + archive | S | ⏳ | | LIST: `AdminContactView` EXISTS. ADD: status actions via `RowActionMenu` + `SideDrawer` for detail. API: PUT /api/admin/contact-submissions/[id] |
| I3 | Sections seed reset button in admin sections toolbar | S | ⏳ | | Add a Button to `AdminSectionsView` toolbar. REUSE: `Button` + `ConfirmDeleteModal` (EXISTS). POST /api/demo/seed |

---

## Tier 7 — Store/Seller

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| O1 | Store slug management — create + change flow | S | ⏳ | | REUSE: `BecomeSellerView` EXISTS — add slug preview. In storefront: `Input` + availability check. API: PUT /api/store/profile with storeSlug |
| O2+C5 | Storefront full edit — bio, policies, branding, vacation mode | M | ⏳ | | Check if `SellerStorefrontView` is stub — complete with `RichTextEditor` (EXISTS) for bio/policies; `Toggle` for vacation mode; `AvatarDisplay` for logo/banner |
| C6 | Shipping config — method + prices + pickup address add | M | ⏳ | | REUSE: `StoreAddressSelectorCreate.tsx` EXISTS in stores/components for pickup address; `Radio`/`Toggle` for method selector. API: GET/PUT /api/store/shipping |
| C7 | Payout settings — UPI/bank config | M | ⏳ | | REUSE: `Radio` for UPI/bank toggle; `Input` for account fields. API: GET/PUT /api/store/payout-settings; return masked account number only |
| G1 | Product Templates CRUD | M | ⏳ | | NEW collection: product_templates. REUSE: `AdminListingScaffold` pattern for list; `SideDrawer` for create/edit; `Select`/`Input` for fields |
| G2 | Template apply in product/auction/preorder create forms | S | ⏳ | | REUSE: `DynamicSelect` (EXISTS) for template picker at top of `ProductForm`; add "Save as template" `Button` in form footer |
| C1 | Store Auctions create/edit | M | ⏳ | | REUSE: `ProductForm.tsx` EXISTS — check if it has isAuction mode; if yes, wire new pages with mode=auction pre-set; if no, extend ProductForm with auction field group behind isAuction tab |
| C2 | Store Pre-Orders create/edit | M | ⏳ | | REUSE: `ProductForm.tsx` EXISTS — same as C1; extend with isPreOrder field group; wire /store/pre-orders/new and /store/pre-orders/[id]/edit |
| C3 | Store Coupons edit page | S | ⏳ | | REUSE: existing seller coupon create form pattern — add /store/coupons/[id]/edit page pointing to same form component with couponId prop |
| C4 | Store Orders detail + status + tracking | M | ⏳ | | REUSE: `SideDrawer`, `Select`, `Input`, `StatusBadge` (all EXIST) for order detail drawer. API: PUT /api/store/orders/[id] for status+tracking |
| O4 | Store Analytics seller view | M | ⏳ | | VIEW: `SellerAnalyticsView` may exist — check; if stub, REUSE `AdminRevenueChart`/`AdminOrdersChart` with seller-scoped data. API: GET /api/store/analytics |
| O5 | Shiprocket auto-create on ship | M | ⏳ | | Server-side only: extend PUT /api/store/orders/[id] to call Shiprocket API when status=shipped + method=shiprocket; deferred if complex |

---

## Tier 8 — User Account

| # | Task | Complexity | Status | Part | Notes |
|---|------|-----------|--------|------|-------|
| D1 | Wishlist page wiring | S | ⏳ | | REUSE: `WishlistView` EXISTS (exported from client.ts) — check /wishlist page.tsx exists; wire API. REUSE: `useGuestWishlist`/`useWishlistWithGuest` hooks EXIST |
| D2 | User Profile full edit | S | ⏳ | | REUSE: `ProfileView` EXISTS + `useProfile`/`useUpdateProfile` hooks EXIST — check which fields are wired; add missing publicProfile fields; `ImageCropModal` EXISTS for avatar |
| D3 | User Settings complete — password, email, privacy | M | ⏳ | | REUSE: `UserSettingsView` EXISTS — complete renderAppearance + add password change section; `Toggle` + `Input` for settings |
| D4 | Notifications view + mark read + delete | S | ⏳ | | REUSE: `UserNotificationsView` EXISTS + `NotificationBell` EXISTS — complete API wiring; `Tabs` (EXISTS) for tab filtering |
| I2 | Admin Payout processing | M | ⏳ | | Covered in M3 (Tier 6) |
| D5 | Messages — conversation view (deferred) | L | ⏳ | | REUSE: `MessagesView`, `ChatList`, `ChatWindow` all EXIST in account/components — wire Firebase RTDB; deferred to last |
