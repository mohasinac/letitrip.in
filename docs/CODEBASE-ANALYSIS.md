# Codebase Analysis & Refactoring Plan

> **Last Updated**: November 30, 2025 - Updated with slug-based routing, ContentTypeFilter, and route constants

## Recent Changes (November 2025)

### Slug-Based Routing Migration ✅

- **Seller Auctions**: Changed from `[id]` to `[slug]` based routing
  - Route: `/seller/auctions/[slug]/edit`
  - Uses `auctionsService.getBySlug()` instead of `getById()`
  - All auction links now use `auction.slug` instead of `auction.id`
  - Updated in: admin/auctions, seller/auctions, seller/reviews

### SearchBar Refactoring ✅

- **Removed**: Category dropdown from SearchBar (no longer fetches categories)
- **Added**: ContentTypeFilter component for content type selection
- **Content Types**: All, Products, Auctions, Shops, Categories, Blog
- **Location**: `src/components/layout/SearchBar.tsx`
- **Filter Component**: `src/components/common/ContentTypeFilter.tsx`

### Route Constants Updated ✅

- **SELLER_ROUTES.AUCTION_EDIT**: Now uses slug: `(slug: string) => /seller/auctions/${slug}/edit`
- **All services**: Use API_ROUTES constants from `src/constants/api-routes.ts`
- **All pages**: Use PAGE_ROUTES constants from `src/constants/routes.ts`

## Executive Summary

### Critical Dark Mode Issues (Verified)

| Component/Module                             | Status                          | Impact                                  |
| -------------------------------------------- | ------------------------------- | --------------------------------------- |
| **Checkout Module** (4 components)           | ❌ No dark mode                 | High - Payment flow broken in dark mode |
| **DataTable**                                | ❌ No dark mode + malformed CSS | High - All table views broken           |
| **MobileDataTable**                          | ❌ No dark mode                 | High - Mobile tables broken             |
| **Admin Tables** (returns, tickets, payouts) | ❌ No dark mode                 | High - Admin pages broken in dark mode  |
| **DateTimePicker**                           | ❌ No dark mode                 | Medium - Form inputs broken             |
| **RichTextEditor**                           | ❌ No dark mode                 | Medium - Blog/Product editing broken    |
| **ToggleSwitch**                             | ❌ No dark mode                 | Low - Settings toggles broken           |
| **AdminSidebar** highlight                   | ⚠️ Partial                      | Low - Search highlight not visible      |

### Malformed CSS Classes (Bug)

The following files have malformed CSS: `hover:bg-gray-100:bg-gray-700` should be `hover:bg-gray-100 dark:hover:bg-gray-700`

| File                                     | Line |
| ---------------------------------------- | ---- |
| `src/components/common/DataTable.tsx`    | 125  |
| `src/components/common/ActionMenu.tsx`   | 63   |
| `src/components/common/InlineEditor.tsx` | 102  |
| `src/components/common/TagInput.tsx`     | 265  |

### Components with Full Dark Mode (Verified)

- ✅ All Card components (ProductCard, AuctionCard, ShopCard, CategoryCard, BlogCard, ReviewCard)
- ✅ Auth pages (Login, Register, Forgot Password, Reset Password)
- ✅ MobileFormInput, MobileFormSelect, MobileTextarea
- ✅ ConfirmDialog, SubNavbar
- ✅ SellerSidebar, AdminSidebar (except highlight)

### Inline Forms & Form Wizard UX Issues

| Issue                          | Files Affected                                       | Impact                                 |
| ------------------------------ | ---------------------------------------------------- | -------------------------------------- |
| **Errors via alert()**         | ProductInlineForm, CouponInlineForm, wizard pages    | Blocks user, poor UX                   |
| **Submit only on last step**   | `/seller/products/create`, `/seller/auctions/create` | User must complete all steps first     |
| **Mandatory fields scattered** | 6-step product wizard, 5-step auction wizard         | User confusion, incomplete submissions |
| **Unnecessary flags in forms** | Status dropdowns, featured checkboxes                | Adds clutter, should default to draft  |
| **Too many wizard steps**      | Product (6 steps), Auction (5 steps)                 | Slow task completion                   |

**Solution:** Simplify to 2 steps (Required → Optional), always-visible submit button, inline errors below inputs.

### Mobile Navigation UX Issues

| Issue                                     | Component                              | Problem                                                           | Fix                                                                  |
| ----------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| **User profile in main navbar on mobile** | `MainNavBar.tsx` (userMenuRef section) | User profile/avatar shown in header when bottom nav has "Account" | Hide user menu on mobile (`hidden lg:block`), use bottom nav Account |
| **Admin Sidebar shown on mobile**         | `AdminLayoutClient.tsx`                | Hamburger menu opens sidebar when bottom nav already exists       | Hide sidebar toggle on mobile, use bottom nav instead                |
| **Seller Sidebar shown on mobile**        | `SellerLayoutClient.tsx`               | Hamburger menu opens sidebar when bottom nav already exists       | Hide sidebar toggle on mobile, use bottom nav instead                |
| **No scroll arrows on nav row**           | `MobileNavRow.tsx`                     | Horizontal overflow without left/right scroll buttons             | Wrap with `HorizontalScrollContainer` component                      |
| **Back-to-top behind nav**                | `Footer.tsx` line 188                  | Button at `bottom-20` overlaps with `MobileNavRow` at `bottom-16` | Change to `bottom-36 lg:bottom-8` (above both navs)                  |

### Mobile Navigation Architecture Issues

#### Problem: Nested Navigation Groups Not Accessible on Mobile

Admin and Seller sidebars have grouped navigation (e.g., "Content Management" with children).
The `MobileNavRow` only shows flat links, missing these grouped sections entirely.

**Admin Sidebar Nested Groups (not in MobileNavRow):**

| Group                  | Children                                                      | Current Routes                                                                           |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Content Management** | Homepage Settings, Hero Slides, Featured Sections, Categories | `/admin/homepage`, `/admin/hero-slides`, `/admin/featured-sections`, `/admin/categories` |
| **Marketplace**        | All Shops, Products, All Auctions, Live Auctions              | `/admin/shops`, `/admin/products`, `/admin/auctions`, `/admin/auctions/live`             |
| **User Management**    | All Users, Reviews                                            | `/admin/users`, `/admin/reviews`                                                         |
| **Transactions**       | Orders, Payments, Seller Payouts, Coupons, Returns & Refunds  | `/admin/orders`, `/admin/payments`, `/admin/payouts`, `/admin/coupons`, `/admin/returns` |
| **Support**            | All Tickets                                                   | `/admin/support-tickets`                                                                 |
| **Analytics**          | Overview, Sales                                               | `/admin/analytics`, `/admin/analytics/sales`                                             |
| **Blog**               | All Posts                                                     | `/admin/blog`                                                                            |
| **Settings**           | General                                                       | `/admin/settings/general`                                                                |

**Seller Sidebar Nested Groups (not in MobileNavRow):**

| Group        | Children                     | Current Routes                                |
| ------------ | ---------------------------- | --------------------------------------------- |
| **Products** | All Products, Add Product    | `/seller/products`, `/seller/products/add`    |
| **Auctions** | All Auctions, Create Auction | `/seller/auctions`, `/seller/auctions/create` |

**User Sidebar:** ✅ No nested groups - all flat navigation

**Solution: Tabbed Section Pages with Sub-Navigation**

Create wrapper layouts for grouped sections with tabs that allow mobile users to switch between related pages:

**Admin Tabbed Sections:**

| Group            | Route Pattern           | Tabs                                                 |
| ---------------- | ----------------------- | ---------------------------------------------------- |
| **Content**      | `/admin/content/*`      | Homepage, Hero Slides, Featured Sections, Categories |
| **Marketplace**  | `/admin/marketplace/*`  | Shops, Products, Auctions                            |
| **Users**        | `/admin/users/*`        | All Users, Reviews                                   |
| **Transactions** | `/admin/transactions/*` | Orders, Payments, Payouts, Coupons, Returns          |
| **Analytics**    | `/admin/analytics/*`    | Overview, Sales                                      |

**Seller Tabbed Sections:**

| Group        | Route Pattern        | Tabs                         |
| ------------ | -------------------- | ---------------------------- |
| **Products** | `/seller/products/*` | All Products, Add Product    |
| **Auctions** | `/seller/auctions/*` | All Auctions, Create Auction |

**Implementation Pattern:**

```
/admin/content/homepage     → Shows Homepage with Content tabs at top
/admin/content/hero-slides  → Shows Hero Slides with Content tabs at top
/seller/products            → Shows All Products with Products tabs at top
/seller/products/add        → Shows Add Product with Products tabs at top
```

#### SubNavbar Items Should Be in MobileSidebar

The `SubNavbar` (Home, Products, Auctions, Shops, Categories, Reviews, Blog) is hidden on mobile (`hidden lg:block`).
These items should be added to `MobileSidebar` along with role-based links (Admin, Seller, User, Login, Register).

**Current MobileSidebar Content:**

- User profile section
- Admin menu (if admin)
- Seller menu (if seller)
- Main categories
- Quick links

**Missing from MobileSidebar:**

- SubNavbar items (Home, Products, Auctions, Shops, Categories, Reviews, Blog)
- Should be shown prominently at the top

---

## 1. Pages Analysis

### Public Pages

| Page                 | Components Used                                                                                                                           | Mobile Ready | Dark Mode | Navigation Path            | Hardcoded Values                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------- | -------------------------- | ------------------------------------------------- |
| `/` (Home)           | HeroCarousel, FeaturedCategories, FeaturedProducts, FeaturedAuctions, ShopsNav, FeaturedShops, FeaturedBlogs, FeaturedReviews, FAQSection | ✅ Yes       | ✅ Yes    | `/`                        | Company name in constants                         |
| `/products`          | ProductCard, UnifiedFilterSidebar, ProductCardSkeletonGrid, EmptyStates                                                                   | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.PRODUCTS`   | None                                              |
| `/products/[slug]`   | ProductGallery, ProductInfo, ProductDescription, ProductVariants, ProductReviews, SimilarProducts                                         | ✅ Yes       | ✅ Yes    | Dynamic                    | None                                              |
| `/auctions`          | AuctionCard, CardGrid, UnifiedFilterSidebar, AuctionCardSkeletonGrid                                                                      | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.AUCTIONS`   | Stats grid (3 cards)                              |
| `/auctions/[slug]`   | AuctionCardSkeletonGrid, LiveCountdown, AutoBidSetup, LiveBidHistory                                                                      | ✅ Yes       | ✅ Yes    | Dynamic                    | None                                              |
| `/shops`             | ShopCard, UnifiedFilterSidebar, ShopCardSkeleton                                                                                          | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.SHOPS`      | None                                              |
| `/shops/[slug]`      | ShopHeader, ProductCard, CardGrid                                                                                                         | ✅ Yes       | ✅ Yes    | Dynamic                    | None                                              |
| `/categories`        | CategoryCard                                                                                                                              | ⚠️ Partial   | ✅ Yes    | `PUBLIC_ROUTES.CATEGORIES` | None                                              |
| `/categories/[slug]` | ProductCard, CategoryFilters                                                                                                              | ✅ Yes       | ✅ Yes    | Dynamic                    | None                                              |
| `/search`            | ProductCard, ShopCard, CategoryCard, CardGrid, **ContentTypeFilter**                                                                      | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.SEARCH`     | **Uses ContentTypeFilter tabs for result types**  |
| `/cart`              | CartItem, CartSummary                                                                                                                     | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.CART`       | None                                              |
| `/checkout`          | AddressForm, AddressSelector, PaymentMethod, ShopOrderSummary                                                                             | ✅ Yes       | ❌ No     | `PUBLIC_ROUTES.CHECKOUT`   | None - **All checkout components lack dark mode** |
| `/blog`              | BlogCard                                                                                                                                  | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.BLOG`       | None                                              |
| `/reviews`           | ReviewCard                                                                                                                                | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.REVIEWS`    | None                                              |

### Auth Pages

| Page               | Components Used            | Mobile Ready | Dark Mode | Navigation Path          | Hardcoded Values |
| ------------------ | -------------------------- | ------------ | --------- | ------------------------ | ---------------- |
| `/login`           | AuthGuard, MobileFormInput | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.LOGIN`    | None             |
| `/register`        | AuthGuard, MobileFormInput | ✅ Yes       | ✅ Yes    | `PUBLIC_ROUTES.REGISTER` | None             |
| `/forgot-password` | MobileFormInput            | ✅ Yes       | ✅ Yes    | -                        | None             |
| `/reset-password`  | MobileFormInput            | ✅ Yes       | ✅ Yes    | -                        | None             |

### User Dashboard Pages

| Page              | Components Used | Mobile Ready | Dark Mode  | Navigation Path         | Hardcoded Values                |
| ----------------- | --------------- | ------------ | ---------- | ----------------------- | ------------------------------- |
| `/user`           | UserSidebar     | ✅ Yes       | ✅ Yes     | `USER_ROUTES.DASHBOARD` | None                            |
| `/user/orders`    | MobileDataTable | ✅ Yes       | ❌ No      | `USER_ROUTES.ORDERS`    | MobileDataTable lacks dark mode |
| `/user/favorites` | ProductCard     | ✅ Yes       | ✅ Yes     | `USER_ROUTES.FAVORITES` | None                            |
| `/user/watchlist` | AuctionCard     | ✅ Yes       | ✅ Yes     | `USER_ROUTES.WATCHLIST` | None                            |
| `/user/bids`      | MobileDataTable | ✅ Yes       | ❌ No      | `USER_ROUTES.BIDS`      | MobileDataTable lacks dark mode |
| `/user/addresses` | AddressForm     | ✅ Yes       | ❌ No      | `USER_ROUTES.ADDRESSES` | AddressForm lacks dark mode     |
| `/user/settings`  | Forms           | ✅ Yes       | ⚠️ Partial | `USER_ROUTES.SETTINGS`  | None                            |
| `/user/following` | ShopCard        | ✅ Yes       | ✅ Yes     | `USER_ROUTES.FOLLOWING` | None                            |
| `/user/riplimit`  | Button, Card    | ✅ Yes       | ✅ Yes     | -                       | RipLimit exchange rate          |

### Seller Dashboard Pages

| Page               | Components Used                                           | Mobile Ready | Dark Mode  | Navigation Path           | Hardcoded Values          |
| ------------------ | --------------------------------------------------------- | ------------ | ---------- | ------------------------- | ------------------------- |
| `/seller`          | SellerSidebar, SalesChart, TopProducts, AnalyticsOverview | ✅ Yes       | ✅ Yes     | `SELLER_ROUTES.DASHBOARD` | Stats cards               |
| `/seller/products` | ProductTable, ProductInlineForm, UnifiedFilterSidebar     | ✅ Yes       | ✅ Yes     | `SELLER_ROUTES.PRODUCTS`  | None                      |
| `/seller/auctions` | AuctionForm, UnifiedFilterSidebar                         | ✅ Yes       | ✅ Yes     | `SELLER_ROUTES.AUCTIONS`  | None                      |
| `/seller/orders`   | DataTable                                                 | ✅ Yes       | ❌ No      | `SELLER_ROUTES.ORDERS`    | DataTable lacks dark mode |
| `/seller/my-shops` | ShopCard, ShopForm                                        | ✅ Yes       | ✅ Yes     | `SELLER_ROUTES.MY_SHOPS`  | None                      |
| `/seller/coupons`  | CouponForm, CouponInlineForm                              | ✅ Yes       | ⚠️ Partial | `SELLER_ROUTES.COUPONS`   | None                      |

### Admin Dashboard Pages

| Page                 | Components Used                    | Mobile Ready | Dark Mode | Navigation Path            | Hardcoded Values     |
| -------------------- | ---------------------------------- | ------------ | --------- | -------------------------- | -------------------- |
| `/admin`             | AdminSidebar, Dashboard components | ✅ Yes       | ✅ Yes    | `ADMIN_ROUTES.OVERVIEW`    | Stats metrics        |
| `/admin/products`    | Inline table                       | ✅ Yes       | ⚠️ Check  | `ADMIN_ROUTES.PRODUCTS`    | Needs verification   |
| `/admin/users`       | Inline table                       | ✅ Yes       | ⚠️ Check  | `ADMIN_ROUTES.USERS`       | Needs verification   |
| `/admin/categories`  | CategoryForm, CategorySelector     | ✅ Yes       | ✅ Yes    | `ADMIN_ROUTES.CATEGORIES`  | None                 |
| `/admin/hero-slides` | HeroSlide components               | ✅ Yes       | ✅ Yes    | `ADMIN_ROUTES.HERO_SLIDES` | None                 |
| `/admin/riplimit`    | Button, Card                       | ✅ Yes       | ✅ Yes    | -                          | RipLimit values      |
| `/admin/returns`     | Inline table                       | ✅ Yes       | ❌ No     | -                          | No dark mode classes |
| `/admin/tickets`     | Inline table                       | ✅ Yes       | ❌ No     | -                          | No dark mode classes |
| `/admin/payouts`     | Inline table, TableCheckbox        | ✅ Yes       | ❌ No     | -                          | No dark mode classes |
| `/admin/auctions`    | Inline table, TableCheckbox        | ✅ Yes       | ⚠️ Check  | `ADMIN_ROUTES.AUCTIONS`    | Needs verification   |

---

## 2. Components Analysis

### UI Components (`/src/components/ui/`)

| Component     | Used In    | Safe to Delete | Mobile Ready | Dark Mode | Similar To       | Can Merge   |
| ------------- | ---------- | -------------- | ------------ | --------- | ---------------- | ----------- |
| `Button`      | Everywhere | ❌ No          | ✅ Yes       | ✅ Yes    | -                | -           |
| `Input`       | Forms      | ❌ No          | ✅ Yes       | ✅ Yes    | MobileInput      | ✅ Consider |
| `Textarea`    | Forms      | ❌ No          | ✅ Yes       | ✅ Yes    | MobileTextarea   | ✅ Consider |
| `Select`      | Forms      | ❌ No          | ✅ Yes       | ✅ Yes    | MobileFormSelect | ✅ Consider |
| `Card`        | Many       | ❌ No          | ✅ Yes       | ✅ Yes    | BaseCard         | ✅ Consider |
| `BaseCard`    | Cards      | ❌ No          | ✅ Yes       | ✅ Yes    | Card             | ✅ Consider |
| `BaseTable`   | Tables     | ❌ No          | ✅ Yes       | ✅ Yes    | DataTable        | ✅ Consider |
| `Checkbox`    | Forms      | ❌ No          | ✅ Yes       | ✅ Yes    | -                | -           |
| `FormActions` | Forms      | ❌ No          | ✅ Yes       | ✅ Yes    | -                | -           |
| `FormLayout`  | Forms      | ❌ No          | ✅ Yes       | ✅ Yes    | -                | -           |

### Card Components (`/src/components/cards/`)

| Component              | Used In          | Safe to Delete | Mobile Ready | Dark Mode  | Similar To       | Can Merge   |
| ---------------------- | ---------------- | -------------- | ------------ | ---------- | ---------------- | ----------- |
| `ProductCard`          | Products, Search | ❌ No          | ✅ Yes       | ✅ Yes     | BaseCard         | ✅ Extend   |
| `AuctionCard`          | Auctions         | ❌ No          | ✅ Yes       | ✅ Yes     | ProductCard      | ✅ Consider |
| `ShopCard`             | Shops            | ❌ No          | ✅ Yes       | ✅ Yes     | BaseCard         | ✅ Extend   |
| `CategoryCard`         | Categories       | ❌ No          | ✅ Yes       | ✅ Yes     | BaseCard         | ✅ Extend   |
| `BlogCard`             | Blog             | ❌ No          | ✅ Yes       | ✅ Yes     | BaseCard         | ✅ Extend   |
| `ReviewCard`           | Reviews          | ❌ No          | ✅ Yes       | ✅ Yes     | BaseCard         | ✅ Extend   |
| `ProductCardSkeleton`  | Loading          | ❌ No          | ✅ Yes       | ✅ Yes     | -                | -           |
| `ShopCardSkeleton`     | Loading          | ❌ No          | ✅ Yes       | ✅ Yes     | -                | -           |
| `CategoryCardSkeleton` | Loading          | ❌ No          | ✅ Yes       | ✅ Yes     | -                | -           |
| `AuctionCardSkeleton`  | Loading          | ❌ No          | ✅ Yes       | ✅ Yes     | -                | -           |
| `CardGrid`             | Card layouts     | ❌ No          | ✅ Yes       | ✅ Yes     | -                | -           |
| `ProductQuickView`     | Product hover    | ❌ No          | ⚠️ Partial   | ⚠️ Partial | AuctionQuickView | ✅ Merge    |
| `AuctionQuickView`     | Auction hover    | ❌ No          | ⚠️ Partial   | ⚠️ Partial | ProductQuickView | ✅ Merge    |

### Common Components (`/src/components/common/`)

| Component              | Used In            | Safe to Delete | Mobile Ready | Dark Mode  | Similar To           | Hardcoding                                                      |
| ---------------------- | ------------------ | -------------- | ------------ | ---------- | -------------------- | --------------------------------------------------------------- |
| `FilterSidebar`        | Old pages          | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | None                                                            |
| `UnifiedFilterSidebar` | Products, Auctions | ❌ No          | ✅ Yes       | ✅ Yes     | MobileFilterDrawer   | None                                                            |
| `MobileFilterSidebar`  | Old mobile         | ⚠️ Check       | ✅ Yes       | ⚠️ Partial | UnifiedFilterSidebar | None                                                            |
| `MobileFilterDrawer`   | Old mobile         | ⚠️ Check       | ✅ Yes       | ⚠️ Partial | UnifiedFilterSidebar | None                                                            |
| `DataTable`            | Tables             | ❌ No          | ✅ Yes       | ❌ No      | ResponsiveTable      | ✅ Consider - **CRITICAL: No dark mode + malformed CSS**        |
| `ResponsiveTable`      | Tables             | ⚠️ Check       | ✅ Yes       | ⚠️ Partial | DataTable            | ✅ Consider                                                     |
| `LoadingSkeleton`      | Loading            | ❌ No          | ✅ Yes       | ✅ Yes     | Skeleton             | ✅ Consider                                                     |
| `Skeleton`             | Loading            | ❌ No          | ✅ Yes       | ✅ Yes     | LoadingSkeleton      | ✅ Consider                                                     |
| `EmptyState`           | No data            | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | None                                                            |
| `ErrorBoundary`        | Error handling     | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | None                                                            |
| `ErrorState`           | Errors             | ❌ No          | ✅ Yes       | ⚠️ Partial | ErrorMessage         | ✅ Consider                                                     |
| `ErrorMessage`         | Forms              | ❌ No          | ✅ Yes       | ⚠️ Partial | ErrorState           | ✅ Consider                                                     |
| `Toast`                | Notifications      | ❌ No          | ✅ Yes       | ✅ Yes     | Admin/Toast          | ✅ Merge                                                        |
| `SearchBar`            | Search             | ❌ No          | ✅ Yes       | ✅ Yes     | Layout/SearchBar     | ✅ Merge                                                        |
| `FavoriteButton`       | Products, Auctions | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | None                                                            |
| `OptimizedImage`       | Images             | ❌ No          | ✅ Yes       | N/A        | -                    | None                                                            |
| `ThemeToggle`          | Header             | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | None                                                            |
| `StatusBadge`          | Status display     | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | Colors hardcoded                                                |
| `ConfirmDialog`        | Delete confirm     | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | None                                                            |
| `DateTimePicker`       | Forms              | ❌ No          | ⚠️ Partial   | ❌ No      | -                    | None                                                            |
| `RichTextEditor`       | Blog, Products     | ❌ No          | ⚠️ Partial   | ❌ No      | -                    | None                                                            |
| `ContentTypeFilter`    | SearchBar, Search  | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | Content types: all, products, auctions, shops, categories, blog |
| `CategorySelector`     | Admin, Forms       | ❌ No          | ✅ Yes       | ✅ Yes     | -                    | **No longer used in SearchBar (replaced by ContentTypeFilter)** |

### Mobile Components (`/src/components/mobile/`)

| Component                | Used In        | Safe to Delete | Mobile Ready | Dark Mode  | Similar To    | Can Merge                                  |
| ------------------------ | -------------- | -------------- | ------------ | ---------- | ------------- | ------------------------------------------ |
| `MobileActionSheet`      | Mobile UI      | ❌ No          | ✅ Yes       | ✅ Yes     | -             | -                                          |
| `MobileBottomSheet`      | Mobile modals  | ❌ No          | ✅ Yes       | ✅ Yes     | -             | -                                          |
| `MobileDataTable`        | Mobile tables  | ❌ No          | ✅ Yes       | ❌ No      | DataTable     | ✅ Merge with DataTable - **No dark mode** |
| `MobileFormInput`        | Mobile forms   | ❌ No          | ✅ Yes       | ✅ Yes     | Input         | ✅ Merge with Input                        |
| `MobileFormSelect`       | Mobile forms   | ❌ No          | ✅ Yes       | ✅ Yes     | Select        | ✅ Merge with Select                       |
| `MobileSkeleton`         | Mobile loading | ❌ No          | ✅ Yes       | ⚠️ Partial | Skeleton      | ✅ Merge with Skeleton                     |
| `MobileTextarea`         | Mobile forms   | ❌ No          | ✅ Yes       | ✅ Yes     | Textarea      | ✅ Merge with Textarea                     |
| `MobileInstallPrompt`    | PWA            | ❌ No          | ✅ Yes       | ⚠️ Partial | -             | -                                          |
| `MobileOfflineIndicator` | PWA            | ❌ No          | ✅ Yes       | ⚠️ Partial | -             | -                                          |
| `MobilePullToRefresh`    | Mobile UX      | ❌ No          | ✅ Yes       | ⚠️ Partial | -             | -                                          |
| `MobileQuickActions`     | Mobile FAB     | ❌ No          | ✅ Yes       | ⚠️ Partial | -             | -                                          |
| `MobileSwipeActions`     | Mobile lists   | ❌ No          | ✅ Yes       | ⚠️ Partial | -             | -                                          |
| `MobileAdminSidebar`     | Admin mobile   | ❌ No          | ✅ Yes       | ✅ Yes     | AdminSidebar  | ✅ Merge                                   |
| `MobileSellerSidebar`    | Seller mobile  | ❌ No          | ✅ Yes       | ✅ Yes     | SellerSidebar | ✅ Merge                                   |

### Layout Components (`/src/components/layout/`)

| Component            | Used In     | Safe to Delete | Mobile Ready    | Dark Mode  | Similar To | Hardcoding                            |
| -------------------- | ----------- | -------------- | --------------- | ---------- | ---------- | ------------------------------------- |
| `Header`             | App layout  | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `Footer`             | App layout  | ❌ No          | ✅ Yes          | ✅ Yes     | -          | Footer links                          |
| `BottomNav`          | Mobile nav  | ❌ No          | ✅ Yes          | ✅ Yes     | -          | Nav items                             |
| `Breadcrumb`         | Navigation  | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `MainNavBar`         | Desktop nav | ❌ No          | ❌ Desktop only | ✅ Yes     | -          | None                                  |
| `MobileSidebar`      | Mobile nav  | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `SubNavbar`          | Sub nav     | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `HeroCarousel`       | Home        | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `FeaturedCategories` | Home        | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `FeaturedProducts`   | Home        | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `FeaturedAuctions`   | Home        | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `ShopsNav`           | Home        | ❌ No          | ✅ Yes          | ✅ Yes     | -          | None                                  |
| `SearchBar`          | Header      | ❌ No          | ✅ Yes          | ✅ Yes     | -          | **Uses ContentTypeFilter (Nov 2025)** |
| `SpecialEventBanner` | Promotions  | ⚠️ Check       | ✅ Yes          | ⚠️ Partial | -          | None                                  |

### Admin Components (`/src/components/admin/`)

| Component         | Used In          | Safe to Delete | Mobile Ready | Dark Mode  | Similar To         | Hardcoding |
| ----------------- | ---------------- | -------------- | ------------ | ---------- | ------------------ | ---------- |
| `AdminSidebar`    | Admin layout     | ❌ No          | ✅ Yes       | ✅ Yes     | MobileAdminSidebar | ✅ Merge   |
| `AdminPageHeader` | Admin pages      | ❌ No          | ✅ Yes       | ✅ Yes     | -                  | None       |
| `CategoryForm`    | Admin categories | ❌ No          | ✅ Yes       | ✅ Yes     | -                  | None       |
| `LoadingSpinner`  | Loading          | ❌ No          | ✅ Yes       | ⚠️ Partial | Loader2 icon       | ✅ Remove  |
| `Toast`           | Notifications    | ❌ No          | ✅ Yes       | ⚠️ Partial | Common/Toast       | ✅ Merge   |
| `ToggleSwitch`    | Settings         | ❌ No          | ✅ Yes       | ❌ No      | -                  | None       |

### Checkout Components (`/src/components/checkout/`) - ⚠️ NO DARK MODE

| Component          | Used In        | Safe to Delete | Mobile Ready | Dark Mode | Similar To | Hardcoding |
| ------------------ | -------------- | -------------- | ------------ | --------- | ---------- | ---------- |
| `PaymentMethod`    | Checkout page  | ❌ No          | ✅ Yes       | ❌ No     | -          | None       |
| `AddressSelector`  | Checkout page  | ❌ No          | ✅ Yes       | ❌ No     | -          | None       |
| `AddressForm`      | Checkout, User | ❌ No          | ✅ Yes       | ❌ No     | -          | None       |
| `ShopOrderSummary` | Checkout page  | ❌ No          | ✅ Yes       | ❌ No     | -          | None       |

### Filter Components (`/src/components/filters/`)

| Component         | Used In         | Safe to Delete | Mobile Ready | Dark Mode  | Similar To           | Hardcoding |
| ----------------- | --------------- | -------------- | ------------ | ---------- | -------------------- | ---------- |
| `ProductFilters`  | Products page   | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `AuctionFilters`  | Auctions page   | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `ShopFilters`     | Shops page      | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `CategoryFilters` | Categories page | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `OrderFilters`    | Orders          | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `ReviewFilters`   | Reviews         | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `CouponFilters`   | Coupons         | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `ReturnFilters`   | Returns         | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |
| `UserFilters`     | Users           | ⚠️ Check       | ⚠️ Partial   | ⚠️ Partial | UnifiedFilterSidebar | ✅ Replace |

---

## 3. Services Analysis

### Service Usage & Route Constants

| Service                           | Used In                       | All Functions Used | Can Merge                               | Uses API Constants |
| --------------------------------- | ----------------------------- | ------------------ | --------------------------------------- | ------------------ |
| `api.service.ts`                  | All services                  | ✅ Yes             | -                                       | ✅ Yes             |
| `auth.service.ts`                 | Auth pages, Header            | ✅ Yes             | -                                       | ✅ Yes             |
| `products.service.ts`             | Products pages, Seller        | ✅ Yes             | -                                       | ✅ Yes             |
| `auctions.service.ts`             | Auctions pages, Seller        | ✅ Yes             | -                                       | ✅ Yes             |
| `shops.service.ts`                | Shops pages, Seller           | ✅ Yes             | -                                       | ✅ Yes             |
| `categories.service.ts`           | Categories, Filters           | ✅ Yes             | -                                       | ✅ Yes             |
| `orders.service.ts`               | Checkout, User, Seller, Admin | ✅ Yes             | -                                       | ✅ Yes             |
| `cart.service.ts`                 | Cart, Checkout                | ✅ Yes             | -                                       | ✅ Yes             |
| `users.service.ts`                | Admin                         | ✅ Yes             | -                                       | ✅ Yes             |
| `reviews.service.ts`              | Product pages, Reviews        | ✅ Yes             | -                                       | ✅ Yes             |
| `favorites.service.ts`            | FavoriteButton                | ✅ Yes             | -                                       | ✅ Yes             |
| `coupons.service.ts`              | Checkout, Seller              | ✅ Yes             | -                                       | ✅ Yes             |
| `returns.service.ts`              | User, Seller, Admin           | ✅ Yes             | ⚠️ Hardcoded `/api/returns/${id}/media` | ⚠️ Partial         |
| `media.service.ts`                | Image uploads                 | ✅ Yes             | ⚠️ Hardcoded `/api/media/*` paths       | ⚠️ Partial         |
| `support.service.ts`              | Support tickets               | ✅ Yes             | ⚠️ Hardcoded `/api/support/attachments` | ⚠️ Partial         |
| `checkout.service.ts`             | Checkout                      | ✅ Yes             | ⚠️ Hardcoded `/api/checkout/*` paths    | ⚠️ Partial         |
| `hero-slides.service.ts`          | Home, Admin                   | ✅ Yes             | ⚠️ Hardcoded `BASE_PATH`                | ⚠️ Partial         |
| `settings.service.ts`             | Admin                         | ✅ Yes             | ⚠️ Hardcoded `baseUrl`                  | ⚠️ Partial         |
| `seller-settings.service.ts`      | Seller                        | ✅ Yes             | ⚠️ Hardcoded `baseUrl`                  | ⚠️ Partial         |
| `homepage.service.ts`             | Home                          | ✅ Yes             | -                                       | ✅ Yes             |
| `homepage-settings.service.ts`    | Home, Admin                   | ✅ Yes             | -                                       | ✅ Yes             |
| `blog.service.ts`                 | Blog                          | ✅ Yes             | -                                       | ✅ Yes             |
| `address.service.ts`              | Checkout, User                | ✅ Yes             | -                                       | ✅ Yes             |
| `analytics.service.ts`            | Admin, Seller                 | ✅ Yes             | -                                       | ✅ Yes             |
| `messages.service.ts`             | Messages                      | ⚠️ Check           | -                                       | ⚠️ Check           |
| `notification.service.ts`         | Notifications                 | ⚠️ Check           | -                                       | ⚠️ Check           |
| `payouts.service.ts`              | Seller, Admin                 | ✅ Yes             | -                                       | ✅ Yes             |
| `location.service.ts`             | Address forms                 | ✅ Yes             | -                                       | ✅ Yes             |
| `test-data.service.ts`            | Demo only                     | ⚠️ Dev only        | ✅ Remove in prod                       | -                  |
| `demo-data.service.ts`            | Demo only                     | ⚠️ Dev only        | ✅ Remove in prod                       | -                  |
| `error-tracking.service.ts`       | Error handling                | ✅ Yes             | -                                       | -                  |
| `riplimit.service.ts`             | RipLimit                      | ✅ Yes             | -                                       | ✅ Yes             |
| `static-assets-client.service.ts` | Admin                         | ✅ Yes             | -                                       | ✅ Yes             |

### Services with Hardcoded API Routes (Need Refactoring)

```typescript
// media.service.ts - Uses hardcoded paths
"/api/media/upload"
"/api/media/upload-multiple"
"/api/media/delete"

// support.service.ts
"/api/support/attachments"

// returns.service.ts
"/api/returns/${id}/media"

// checkout.service.ts
"/api/checkout/create-order"
"/api/checkout/verify-payment"

// hero-slides.service.ts
private readonly BASE_PATH = "/api/hero-slides";

// settings.service.ts
private baseUrl = "/api/admin/settings";

// seller-settings.service.ts
private baseUrl = "/api/seller/settings";
```

---

## 4. Hooks Analysis

| Hook                        | Used In                  | Similar Hooks                             | Uses Services       | Hardcoding      |
| --------------------------- | ------------------------ | ----------------------------------------- | ------------------- | --------------- |
| `useCart`                   | Cart, Products, Checkout | -                                         | ✅ cartService      | None            |
| `useDebounce`               | Search, Filters          | -                                         | -                   | None            |
| `useFilters`                | Filter pages             | -                                         | -                   | None            |
| `useIsMobile`               | Many pages               | useBreakpoint, useViewport, useDeviceType | -                   | Breakpoint: 768 |
| `useLoadingState`           | Async operations         | useSafeLoad                               | -                   | None            |
| `useSafeLoad`               | Error handling           | useLoadingState                           | -                   | None            |
| `useMediaUpload`            | Media forms              | useMediaUploadWithCleanup                 | ✅ mediaService     | None            |
| `useMediaUploadWithCleanup` | Media forms              | useMediaUpload                            | ✅ mediaService     | None            |
| `useNavigationGuard`        | Forms                    | -                                         | -                   | None            |
| `useSlugValidation`         | Forms                    | -                                         | -                   | None            |
| `useHeaderStats`            | Header                   | -                                         | ⚠️ Direct API calls | ⚠️ Check        |

### useMobile.ts Exports (Potential Consolidation)

- `useIsMobile(breakpoint = 768)` - Basic mobile detection
- `useIsTouchDevice()` - Touch detection
- `useViewport()` - Viewport dimensions
- `useBreakpoint(breakpoint)` - Specific breakpoint matching
- `useDeviceType()` - Device type (mobile/tablet/desktop)
- `isIOS()` - iOS detection utility
- `isAndroid()` - Android detection utility
- `getDeviceType()` - Device type utility
- `breakpoints` - Breakpoint constants

---

## 5. Refactoring Plan

### Phase 1: Component Consolidation (Priority: HIGH)

#### 1.1 Merge Duplicate Filter Components

**Goal:** Replace all individual filter components with `UnifiedFilterSidebar`

**Components to remove:**

- `FilterSidebar`
- `MobileFilterSidebar`
- `MobileFilterDrawer`
- `ProductFilters`
- `AuctionFilters`
- `ShopFilters`
- `CategoryFilters`
- `OrderFilters`
- `ReviewFilters`
- `CouponFilters`
- `ReturnFilters`
- `UserFilters`

**Action:** Each page already uses `UnifiedFilterSidebar` - verify and remove unused filter components.

#### 1.2 Merge Mobile Form Components into Base Components

**Goal:** Make Input, Select, Textarea responsive by default

**Changes:**

- Add `isMobile` prop or use CSS media queries
- Merge `MobileFormInput` → `Input`
- Merge `MobileFormSelect` → `Select`
- Merge `MobileTextarea` → `Textarea`
- Merge `MobileSkeleton` → `Skeleton`
- Merge `MobileDataTable` → `DataTable`

#### 1.3 Consolidate Card Components

**Goal:** Extend `BaseCard` for all card types

**Changes:**

- Make `ProductCard`, `AuctionCard`, `ShopCard`, `CategoryCard`, `BlogCard`, `ReviewCard` extend `BaseCard`
- Share common props: image, title, badges, actions, dark mode styling

#### 1.4 Merge Toast Components

**Goal:** Single Toast system

**Action:** Remove `admin/Toast.tsx`, use `common/Toast.tsx` everywhere

#### 1.5 Merge SearchBar Components

**Goal:** Single SearchBar component

**Action:** Consolidate `common/SearchBar` and `layout/SearchBar`

#### 1.6 Merge Sidebar Components

**Goal:** Responsive sidebars with mobile variants built-in

**Changes:**

- `AdminSidebar` + `MobileAdminSidebar` → single responsive component
- `SellerSidebar` + `MobileSellerSidebar` → single responsive component

### Phase 2: Dark Mode Completion (Priority: HIGH)

#### 2.1 Components Needing Dark Mode

**Critical (No Dark Mode - Uses light-only classes):**

- `DateTimePicker` - Uses `bg-white`, `bg-gray-100`, `border-gray-300` without dark variants
- `RichTextEditor` - Uses `bg-white`, `text-gray-700`, `border-gray-200` without dark variants
- `PaymentMethod` - Uses `text-gray-900`, `border-gray-200`, `text-gray-600` without dark variants
- `AddressSelector` - Uses `text-gray-900`, `border-gray-200`, `bg-gray-100` without dark variants
- `AddressForm` - Uses light-only colors
- `ShopOrderSummary` - Uses light-only colors
- `ToggleSwitch` - Uses `bg-gray-200`, `text-gray-900`, `text-gray-500` without dark variants
- `AdminSidebar` - Search highlight uses `bg-yellow-200` without dark variant

**Checkout Module (Entire module lacks dark mode):**

- All 4 checkout components need dark mode implementation

**Already Have Dark Mode (Verified):**

- `MobileFormInput` ✅ - Has `dark:text-white`, `dark:bg-gray-700`, `dark:border-gray-600`
- `MobileFormSelect` ✅ - Has full dark mode support
- `MobileTextarea` ✅ - Has full dark mode support
- `ConfirmDialog` ✅ - Has `dark:bg-gray-800`, `dark:text-white`, `dark:border-gray-600`
- `SubNavbar` ✅ - Has `dark:bg-gray-900`, `dark:border-gray-700`, `dark:text-gray-300`
- `SellerSidebar` ✅ - Has full dark mode including search highlight `bg-blue-200 dark:bg-blue-700`
- Auth pages ✅ - Login, Register use MobileFormInput with full dark mode

#### 2.2 Dark Mode Standards

```css
/* Light mode defaults */
bg-white text-gray-900 border-gray-200

/* Dark mode additions */
dark:bg-gray-800 dark:text-white dark:border-gray-700

/* Input styling */
bg-white dark:bg-gray-800
border-gray-300 dark:border-gray-600
text-gray-900 dark:text-white
placeholder-gray-400 dark:placeholder-gray-500
```

### Phase 3: Mobile Responsiveness Audit (Priority: MEDIUM)

#### 3.1 Ensure All Components Have

- Minimum touch target: 48px
- Responsive padding: `px-3 md:px-4`
- Responsive text sizes: `text-sm md:text-base`
- Safe area insets where needed
- Proper focus states

#### 3.2 Pages Needing Mobile Audit

- `/categories` (main page)
- `/checkout`
- Auth pages
- Settings pages

### Phase 4: Service Refactoring (Priority: MEDIUM)

#### 4.1 Use API Route Constants

**Files to update:**

```typescript
// Update these services to use API_ROUTES constants
media.service.ts → Use MEDIA_ROUTES
support.service.ts → Use TICKET_ROUTES
returns.service.ts → Use RETURNS_ROUTES
checkout.service.ts → Use CHECKOUT_ROUTES
hero-slides.service.ts → Use HERO_SLIDE_ROUTES
settings.service.ts → Use ADMIN_ROUTES
seller-settings.service.ts → Use SELLER_ROUTES
```

#### 4.2 Add Missing Constants to api-routes.ts

```typescript
// Add if missing
MEDIA_ROUTES.UPLOAD = "/media/upload";
MEDIA_ROUTES.UPLOAD_MULTIPLE = "/media/upload-multiple";
MEDIA_ROUTES.DELETE = "/media/delete";

SUPPORT_ROUTES = {
  ATTACHMENTS: "/support/attachments",
};
```

### Phase 5: Cleanup (Priority: LOW)

#### 5.1 Remove Unused Components

After Phase 1 merges, verify and remove:

- Old filter components
- Duplicate mobile components
- `admin/LoadingSpinner` (use Lucide `Loader2`)

#### 5.2 Remove Development-Only Services in Production

- `test-data.service.ts`
- `demo-data.service.ts`

#### 5.3 Remove Hardcoded Values

- Move inline colors to Tailwind config
- Use constants for navigation items
- Use constants for form validation rules

---

## 6. Implementation Checklist

### Immediate Actions (Week 1)

- [ ] Audit all filter component usages
- [ ] Create responsive Input/Select/Textarea variants
- [ ] Add dark mode to auth pages
- [ ] Update services to use API_ROUTES constants

### Short-term (Week 2-3)

- [ ] Merge mobile form components into base components
- [ ] Consolidate sidebar components
- [ ] Complete dark mode for remaining components
- [ ] Remove duplicate filter components

### Medium-term (Week 4-6)

- [ ] Refactor card components to extend BaseCard
- [ ] Mobile audit all pages
- [ ] Performance optimization (lazy loading)
- [ ] Remove unused components

### Long-term (Ongoing)

- [ ] Component library documentation
- [ ] Design system tokens
- [ ] Storybook integration
- [ ] Automated accessibility testing

---

## 7. Files to Create/Modify

### New Files

```
src/components/ui/ResponsiveInput.tsx      # Merged Input + MobileFormInput
src/components/ui/ResponsiveSelect.tsx     # Merged Select + MobileFormSelect
src/components/ui/ResponsiveTextarea.tsx   # Merged Textarea + MobileTextarea
src/components/common/ResponsiveTable.tsx  # Merged DataTable + MobileDataTable
```

### Files to Delete (After Migration)

```
src/components/filters/ProductFilters.tsx
src/components/filters/AuctionFilters.tsx
src/components/filters/ShopFilters.tsx
src/components/filters/CategoryFilters.tsx
src/components/filters/OrderFilters.tsx
src/components/filters/ReviewFilters.tsx
src/components/filters/CouponFilters.tsx
src/components/filters/ReturnFilters.tsx
src/components/filters/UserFilters.tsx
src/components/common/FilterSidebar.tsx
src/components/common/MobileFilterSidebar.tsx
src/components/common/MobileFilterDrawer.tsx
src/components/mobile/MobileFormInput.tsx
src/components/mobile/MobileFormSelect.tsx
src/components/mobile/MobileTextarea.tsx
src/components/mobile/MobileSkeleton.tsx
src/components/mobile/MobileDataTable.tsx
src/components/admin/Toast.tsx
src/components/admin/LoadingSpinner.tsx
```

### Files to Modify (Dark Mode)

```
# Checkout Module (Critical - entire flow lacks dark mode)
src/components/checkout/PaymentMethod.tsx      # Critical - No dark mode classes
src/components/checkout/AddressSelector.tsx    # Critical - No dark mode classes
src/components/checkout/AddressForm.tsx        # Critical - No dark mode classes
src/components/checkout/ShopOrderSummary.tsx   # Critical - No dark mode classes

# Common Components
src/components/common/DateTimePicker.tsx       # Critical - No dark mode classes
src/components/common/RichTextEditor.tsx       # Critical - No dark mode classes
src/components/common/DataTable.tsx            # Critical - No dark mode + malformed CSS
src/components/common/ActionMenu.tsx           # Bug - Malformed CSS line 63
src/components/common/InlineEditor.tsx         # Bug - Malformed CSS line 102
src/components/common/TagInput.tsx             # Bug - Malformed CSS line 265

# Mobile Components
src/components/mobile/MobileDataTable.tsx      # Critical - No dark mode classes

# Admin Components
src/components/admin/ToggleSwitch.tsx          # Critical - No dark mode classes
src/components/admin/AdminSidebar.tsx          # Fix search highlight bg-yellow-200

# Admin Pages (inline tables with no dark mode)
src/app/admin/returns/page.tsx                 # Critical - No dark mode classes
src/app/admin/tickets/page.tsx                 # Critical - No dark mode classes
src/app/admin/payouts/page.tsx                 # Critical - No dark mode classes

# Verify these
src/components/layout/SpecialEventBanner.tsx   # Verify and add if missing
src/components/admin/LoadingSpinner.tsx        # Verify and add if missing
```

### Files to Modify (Mobile Navigation UX)

```
# Main navbar - hide user profile on mobile (bottom nav has Account)
src/components/layout/MainNavBar.tsx           # Line ~391: Add hidden lg:block to userMenuRef div
                                               # User menu duplicates bottom nav Account button

# Back-to-top button position
src/components/layout/Footer.tsx               # Line 188: Change bottom-20 to bottom-36 lg:bottom-8

# Mobile nav row - add HorizontalScroll for all variants
src/components/layout/MobileNavRow.tsx         # Wrap nav with HorizontalScrollContainer for scroll arrows

# Admin sidebar toggle on mobile (redundant with bottom nav)
src/app/admin/AdminLayoutClient.tsx            # Hide hamburger menu toggle since bottom nav exists

# Seller sidebar toggle on mobile (redundant with bottom nav)
src/app/seller/SellerLayoutClient.tsx          # Hide hamburger menu toggle since bottom nav exists

# User layout - already clean (no sidebar toggle)
src/app/user/UserLayoutClient.tsx              # ✅ No changes needed - already uses MobileNavRow only
```

### Files to Create (Tabbed Section Layouts for Mobile)

```
# Admin Content Section - tabbed layout for grouped navigation
src/app/admin/content/layout.tsx               # NEW: Tabs for Homepage, Hero Slides, Featured, Categories
src/app/admin/content/homepage/page.tsx        # Move from /admin/homepage
src/app/admin/content/hero-slides/page.tsx     # Move from /admin/hero-slides
src/app/admin/content/featured-sections/page.tsx  # Move from /admin/featured-sections
src/app/admin/content/categories/page.tsx      # Move from /admin/categories

# Admin Marketplace Section
src/app/admin/marketplace/layout.tsx           # NEW: Tabs for Shops, Products, Auctions
src/app/admin/marketplace/shops/page.tsx       # Move from /admin/shops
src/app/admin/marketplace/products/page.tsx    # Move from /admin/products
src/app/admin/marketplace/auctions/page.tsx    # Move from /admin/auctions

# Admin Transactions Section
src/app/admin/transactions/layout.tsx          # NEW: Tabs for Orders, Payments, Payouts, Coupons, Returns
src/app/admin/transactions/orders/page.tsx     # Move from /admin/orders
src/app/admin/transactions/payments/page.tsx   # Move from /admin/payments
src/app/admin/transactions/payouts/page.tsx    # Move from /admin/payouts
src/app/admin/transactions/coupons/page.tsx    # Move from /admin/coupons
src/app/admin/transactions/returns/page.tsx    # Move from /admin/returns

# Admin Analytics Section
src/app/admin/analytics/layout.tsx             # NEW: Tabs for Overview, Sales
src/app/admin/analytics/overview/page.tsx      # Move from /admin/analytics
src/app/admin/analytics/sales/page.tsx         # Already at /admin/analytics/sales

# Admin User Management Section
src/app/admin/user-management/layout.tsx       # NEW: Tabs for Users, Reviews
src/app/admin/user-management/users/page.tsx   # Move from /admin/users
src/app/admin/user-management/reviews/page.tsx # Move from /admin/reviews

# Seller Products Section - tabbed layout
src/app/seller/products/layout.tsx             # NEW: Tabs for All Products, Add Product
# (pages already exist at /seller/products and /seller/products/add)

# Seller Auctions Section - tabbed layout
src/app/seller/auctions/layout.tsx             # NEW: Tabs for All Auctions, Create Auction
# (pages already exist at /seller/auctions and /seller/auctions/create)

# Reusable Tab Component for Section Navigation
src/components/common/SectionTabs.tsx          # NEW: Horizontal tabs component for mobile section nav
```

### Files to Modify (MobileSidebar - Add SubNavbar Items)

```
# Add SubNavbar items to MobileSidebar
src/components/layout/MobileSidebar.tsx        # Add: Home, Products, Auctions, Shops, Categories, Reviews, Blog
                                               # Show prominently at top of sidebar
                                               # Show role-based links: Admin, Seller, User dashboard
                                               # Show Login/Register for unauthenticated users

# Update MobileNavRow with grouped sections
src/components/layout/MobileNavRow.tsx         # Update adminMobileNavItems to include:
                                               # - Content (grouped)
                                               # - Marketplace (grouped)
                                               # - Transactions (grouped)
                                               # - Analytics (grouped)
                                               # - Support, Blog, Settings
                                               # Update sellerMobileNavItems to include:
                                               # - Products (grouped with Add Product)
                                               # - Auctions (grouped with Create Auction)
```

---

## Inline Forms & Form Wizard UX Improvements

### Overview

Current inline forms and multi-step form wizards need optimization for faster user task completion. Key issues:

| Issue                               | Current State                                            | Improvement                                           |
| ----------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| **Unnecessary flags in forms**      | Forms show featured/flagged checkboxes, status dropdowns | Remove flags, default to `status: "draft"`, no emojis |
| **Errors shown via alert()**        | `alert("Error message")` blocks user                     | Show inline errors below each input field             |
| **Mandatory fields scattered**      | Required fields on multiple wizard steps                 | Group ALL mandatory fields on Step 1                  |
| **Submit only on last step**        | Finish button appears only on final step                 | Show Submit/Finish button always visible from Step 1  |
| **Too many steps for simple tasks** | 6-step product wizard, 5-step auction wizard             | Collapse to 2-3 essential steps                       |

### Inline Form Files to Modify

```
src/components/seller/ProductInlineForm.tsx    # 174 lines
- Remove: status field (default to "draft" internally)
- Remove: alert() calls for errors
- Add: Field-level error state with messages below inputs
- Add: Auto-save draft on blur (optional enhancement)

src/components/seller/CouponInlineForm.tsx     # 166 lines
- Remove: alert() calls for errors
- Add: Field-level error display below inputs
- Keep: Essential fields only (code, name, type, value, dates)

src/components/seller/ShopInlineForm.tsx       # Verify and apply same patterns

src/components/common/InlineEditor.tsx         # 233 lines
- Fix: Malformed CSS at line 102 (hover:bg-gray-100:bg-gray-700)
- Add: Error message display below input
- Improve: Loading state UX
```

### Form Wizard Files to Restructure

#### Product Create Wizard: `/seller/products/create/page.tsx` (748 lines)

**Current 6 Steps:**

1. Basic Info (name, slug, category, brand, SKU)
2. Pricing & Stock (price, stock, weight)
3. Product Details (description, condition, features, specs)
4. Media (images, videos)
5. Shipping & Policies (shipping class, return policy, warranty)
6. SEO & Publish (meta title/desc, featured, status)

**Proposed 2-Step Simplified:**

1. **Essential Info** (all mandatory fields):
   - Name*, Slug*, Category*, SKU*, Price*, Stock*
   - At least 1 image\* (simplified upload)
2. **Optional Details** (all optional):
   - Brand, Compare at Price, Weight, Description
   - Condition (default: new), Features, Specs
   - Additional images/videos
   - Shipping class, Return policy, Warranty
   - Meta title/desc

**Key Changes:**

- Remove: `featured` checkbox (admin-only action)
- Remove: `status` dropdown (default to "draft")
- Add: "Create Product" button visible on both steps
- Add: "Save & Add Another" button for bulk creation
- Add: Inline validation errors below each field

#### Auction Create Wizard: `/seller/auctions/create/page.tsx` (580 lines)

**Current 5 Steps:**

1. Basic Info (title, slug, category, type, condition, description)
2. Bidding Rules (starting bid, increment, reserve, buy now)
3. Schedule (start time, end time, auto-extend)
4. Media (images, videos)
5. Review & Publish (shipping terms, return policy, status, featured)

**Proposed 2-Step Simplified:**

1. **Auction Setup** (all mandatory fields):
   - Title*, Slug*, Category*, Starting Bid*, End Time\*
   - At least 1 image\*
2. **Optional Details**:
   - Description, Condition
   - Bid increment, Reserve price, Buy now price
   - Custom start time (default: immediately)
   - Auto-extend settings
   - Additional images/videos
   - Shipping terms, Return policy

**Key Changes:**

- Remove: `featured` checkbox (admin-only)
- Remove: `status` dropdown (default to "scheduled")
- Add: "Create Auction" button visible on both steps
- Add: Quick-create with just title, starting bid, end time, 1 image

### Error Display Pattern

**Current (blocking):**

```tsx
if (!formData.code) {
  alert("Coupon code is required");
  return;
}
```

**Improved (inline):**

```tsx
interface FieldErrors {
  [fieldName: string]: string | null;
}

const [errors, setErrors] = useState<FieldErrors>({});

// Validation
const validateForm = () => {
  const newErrors: FieldErrors = {};
  if (!formData.code) newErrors.code = "Coupon code is required";
  if (!formData.name) newErrors.name = "Display name is required";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Field with error
<div>
  <label>Coupon Code *</label>
  <input
    className={`... ${errors.code ? "border-red-500" : "border-gray-300"}`}
    value={formData.code}
    onChange={(e) => {
      setFormData({ ...formData, code: e.target.value });
      setErrors({ ...errors, code: null }); // Clear error on change
    }}
  />
  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
</div>;
```

### Always-Visible Submit Pattern

**Current (submit only on last step):**

```tsx
{
  currentStep < STEPS.length ? (
    <button onClick={handleNext}>Next</button>
  ) : (
    <button onClick={handleSubmit}>Create Product</button>
  );
}
```

**Improved (submit always visible):**

```tsx
<div className="flex items-center justify-between">
  {/* Left side: Navigation */}
  <div className="flex gap-2">
    {currentStep > 1 && <button onClick={handlePrevious}>Previous</button>}
    {currentStep < STEPS.length && (
      <button onClick={handleNext}>Next: {STEPS[currentStep].name}</button>
    )}
  </div>

  {/* Right side: Always visible submit */}
  <div className="flex gap-2">
    <button onClick={handleSaveDraft} className="btn-secondary">
      Save Draft
    </button>
    <button
      onClick={handleSubmit}
      disabled={!canSubmit}
      className="btn-primary"
    >
      {loading ? "Creating..." : "Create Product"}
    </button>
  </div>
</div>
```

### Mandatory Fields Step 1 Pattern

**Group all required fields on Step 1:**

```tsx
const STEPS = [
  {
    id: 1,
    name: "Required Info",
    description: "All mandatory fields",
    fields: [
      "name",
      "slug",
      "categoryId",
      "sku",
      "price",
      "stockCount",
      "images",
    ],
    isRequired: true,
  },
  {
    id: 2,
    name: "Additional Details",
    description: "Optional enhancements",
    fields: [
      "brand",
      "description",
      "features",
      "specifications",
      "metaTitle",
      "metaDescription",
    ],
    isRequired: false,
  },
];

// Validate only required fields for submission
const canSubmit = () => {
  const requiredFields = STEPS.find((s) => s.isRequired)?.fields || [];
  return requiredFields.every((field) => {
    if (field === "images") return formData.images.length > 0;
    return !!formData[field];
  });
};
```

### Default Status Pattern

**Remove status field from UI, set internally:**

```tsx
// Before: UI shows status dropdown
const [formData, setFormData] = useState({
  // ...
  status: "draft" as const,
});

// After: Remove from UI, keep in submit
const handleSubmit = async () => {
  await productsService.create({
    ...formData,
    status: "draft", // Always create as draft
    featured: false, // Admin-only flag
  });
};
```

### Files Summary

| File                                          | Priority | Changes                                         |
| --------------------------------------------- | -------- | ----------------------------------------------- |
| `src/app/seller/products/create/page.tsx`     | High     | 6→2 steps, inline errors, always-visible submit |
| `src/app/seller/auctions/create/page.tsx`     | High     | 5→2 steps, inline errors, always-visible submit |
| `src/components/seller/ProductInlineForm.tsx` | Medium   | Remove status/flags, inline errors              |
| `src/components/seller/CouponInlineForm.tsx`  | Medium   | Inline errors, remove alert()                   |
| `src/components/seller/ShopInlineForm.tsx`    | Medium   | Same patterns                                   |
| `src/components/common/InlineEditor.tsx`      | Low      | Fix malformed CSS, better error display         |

### Quick Actions for Common Tasks

**Add "Quick Create" options for frequent tasks:**

```tsx
// Quick Product Creation Modal
<QuickCreateModal
  type="product"
  requiredFields={["name", "price", "image"]}
  onSuccess={(product) => router.push(`/seller/products/${product.slug}/edit`)}
/>

// Auto-generates: slug from name, SKU from timestamp, default category
```

This enables:

- **Quick Product**: Name + Price + 1 Image → Create
- **Quick Auction**: Title + Starting Bid + End Date + 1 Image → Create
- **Full Form**: Access to all fields for detailed entries

---

## Reusable Form Components

Created standardized form components in `src/components/forms/` with:

- Consistent styling across all forms
- Full dark mode support
- Built-in error display below inputs
- Helper text support
- Compact mode for inline forms

### Components Created

| Component           | Purpose                                  | File                    |
| ------------------- | ---------------------------------------- | ----------------------- |
| `FormInput`         | Text, email, password inputs             | `FormInput.tsx`         |
| `FormNumberInput`   | Number inputs with prefix/suffix (₹, kg) | `FormNumberInput.tsx`   |
| `FormTextarea`      | Multiline text with char count           | `FormTextarea.tsx`      |
| `FormSelect`        | Dropdown select with options             | `FormSelect.tsx`        |
| `FormCheckbox`      | Checkbox with label and description      | `FormCheckbox.tsx`      |
| `FormListInput`     | Add/remove list items (features)         | `FormListInput.tsx`     |
| `FormKeyValueInput` | Key-value pairs (specifications)         | `FormKeyValueInput.tsx` |
| `FormSection`       | Grouped fields with title                | `FormSection.tsx`       |
| `FormRow`           | Horizontal field grouping                | `FormSection.tsx`       |
| `FormActions`       | Form buttons (submit, cancel)            | `FormSection.tsx`       |

### Usage Examples

**Before (repeated inline styles):**

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Product Name *
  </label>
  <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    placeholder="Enter product name"
  />
  <p className="mt-1 text-xs text-gray-500">Minimum 3 characters</p>
</div>
```

**After (using FormInput):**

```tsx
import { FormInput } from "@/components/forms";

<FormInput
  label="Product Name"
  required
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  placeholder="Enter product name"
  helperText="Minimum 3 characters"
  error={errors.name}
/>;
```

**Number with Currency:**

```tsx
import { FormNumberInput } from "@/components/forms";

<FormNumberInput
  label="Price"
  required
  prefix="₹"
  value={formData.price}
  onChange={(e) =>
    setFormData({ ...formData, price: parseFloat(e.target.value) })
  }
  allowDecimals
  error={errors.price}
/>;
```

**Features List:**

```tsx
import { FormListInput } from "@/components/forms";

<FormListInput
  label="Features"
  value={formData.features}
  onChange={(features) => setFormData({ ...formData, features })}
  placeholder="Add a feature and press Enter"
  maxItems={10}
/>;
```

**Specifications Key-Value:**

```tsx
import { FormKeyValueInput } from "@/components/forms";

<FormKeyValueInput
  label="Specifications"
  value={formData.specifications}
  onChange={(specs) => setFormData({ ...formData, specifications: specs })}
  keyPlaceholder="Spec name (e.g., Color)"
  valuePlaceholder="Value (e.g., Black)"
/>;
```

**Form Layout:**

```tsx
import { FormSection, FormRow, FormActions } from "@/components/forms";

<FormSection title="Pricing & Stock" description="Set product pricing">
  <FormRow columns={2}>
    <FormNumberInput label="Price" prefix="₹" required />
    <FormNumberInput label="Stock" required />
  </FormRow>
</FormSection>

<FormActions align="between">
  <button onClick={handleCancel}>Cancel</button>
  <button onClick={handleSubmit}>Create Product</button>
</FormActions>
```

### Files to Update (Use New Components)

| File                                          | Action                                     |
| --------------------------------------------- | ------------------------------------------ |
| `src/app/seller/products/create/page.tsx`     | Replace inline inputs with form components |
| `src/app/seller/auctions/create/page.tsx`     | Replace inline inputs with form components |
| `src/components/seller/ProductInlineForm.tsx` | Use FormInput, FormSelect                  |
| `src/components/seller/CouponInlineForm.tsx`  | Use FormInput, FormSelect, FormNumberInput |
| `src/components/seller/ShopInlineForm.tsx`    | Use FormInput, FormTextarea                |

---

## Route Parameter Strategy (November 2025)

### Slug-Based Routes (User-Friendly URLs) ✅

All public-facing and seller-facing resource URLs use slugs for SEO and readability:

| Route Pattern                  | Example                               | Service Method                  |
| ------------------------------ | ------------------------------------- | ------------------------------- |
| `/products/[slug]`             | `/products/iphone-15-pro`             | `productsService.getBySlug()`   |
| `/auctions/[slug]`             | `/auctions/vintage-watch-auction`     | `auctionsService.getBySlug()`   |
| `/shops/[slug]`                | `/shops/tech-paradise`                | `shopsService.getBySlug()`      |
| `/categories/[slug]`           | `/categories/electronics`             | `categoriesService.getBySlug()` |
| `/blog/[slug]`                 | `/blog/top-10-auction-tips`           | `blogService.getBySlug()`       |
| `/seller/products/[slug]/edit` | `/seller/products/iphone-15-pro/edit` | `productsService.getBySlug()`   |
| `/seller/auctions/[slug]/edit` | `/seller/auctions/vintage-watch/edit` | `auctionsService.getBySlug()`   |
| `/seller/my-shops/[slug]`      | `/seller/my-shops/my-tech-store`      | `shopsService.getBySlug()`      |

### ID-Based Routes (Internal/Order References)

Some routes still use IDs where they represent user-visible identifiers (like order numbers):

| Route Pattern         | Example                          | Reason                                      |
| --------------------- | -------------------------------- | ------------------------------------------- |
| `/user/orders/[id]`   | `/user/orders/ORD-2024-001234`   | Order numbers are user-friendly identifiers |
| `/seller/orders/[id]` | `/seller/orders/ORD-2024-001234` | Consistent with user orders                 |
| `/admin/orders/[id]`  | `/admin/orders/ORD-2024-001234`  | Internal reference                          |
| `/user/tickets/[id]`  | `/user/tickets/TKT-2024-000567`  | Ticket numbers are user-friendly            |

### Admin Routes (Internal, Not SEO-Critical)

Admin routes may use IDs since they're not public-facing:

| Route Pattern                  | Uses | Notes                    |
| ------------------------------ | ---- | ------------------------ |
| `/admin/products/[id]`         | ID   | Internal admin reference |
| `/admin/auctions/[id]`         | ID   | Internal admin reference |
| `/admin/users/[id]`            | ID   | Internal admin reference |
| `/admin/hero-slides/[id]/edit` | ID   | Internal admin reference |

### Key Guidelines

1. **Public URLs**: Always use slugs for SEO and shareability
2. **Seller URLs**: Use slugs for resources (products, auctions, shops)
3. **Order/Ticket References**: Keep IDs since they're user-visible reference numbers
4. **Admin Internal URLs**: Can use IDs since not public-facing
5. **API Calls**: Services support both `getById()` and `getBySlug()` methods
6. **Route Constants**: Defined in `src/constants/routes.ts`
