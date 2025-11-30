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

| Issue                                         | Component                                           | Problem                                                                                          | Fix                                                                                       |
| --------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **User profile in main navbar on mobile**     | `MainNavBar.tsx` (userMenuRef section)              | User profile/avatar shown in header when bottom nav has "Account"                                | Hide user menu on mobile (`hidden lg:block`), use bottom nav Account                      |
| **Admin Sidebar shown on mobile**             | `AdminLayoutClient.tsx`                             | Hamburger menu opens sidebar when bottom nav already exists                                      | Hide sidebar toggle on mobile, use bottom nav instead                                     |
| **Seller Sidebar shown on mobile**            | `SellerLayoutClient.tsx`                            | Hamburger menu opens sidebar when bottom nav already exists                                      | Hide sidebar toggle on mobile, use bottom nav instead                                     |
| **No scroll arrows on nav row**               | `MobileNavRow.tsx`                                  | Horizontal overflow without left/right scroll buttons                                            | Wrap with `HorizontalScrollContainer` component                                           |
| **Back-to-top behind nav**                    | `Footer.tsx` line 188                               | Button at `bottom-20` overlaps with `MobileNavRow` at `bottom-16`                                | Change to `bottom-36 lg:bottom-8` (above both navs)                                       |
| **Mobile filter sidebar overlaps bottom nav** | `MobileFilterSidebar.tsx`, `MobileFilterDrawer.tsx` | Filter sidebars use `bottom-0` which overlaps with BottomNav (h-16) and MobileNavRow (bottom-16) | Add `pb-16` or `pb-32` to content area, use `bottom-16` or `bottom-32` for footer actions |

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

---

## 8. API Routes Analysis

### Route Necessity Criteria

A route is considered **NEEDED** if:

1. ✅ A frontend service (in `src/services/`) calls it
2. ✅ It's used by Firebase Cloud Functions for backend processing
3. ✅ It's a cron/webhook endpoint called by external services

A route is **NOT NEEDED** if:

- ❌ Only referenced in route constants but no service uses it
- ❌ Only has test files but no production usage
- ❌ Duplicate of another route with same functionality
- ❌ Development-only route that shouldn't be in production

**IMPORTANT**: Pages and components must NEVER call `fetch()` directly. All API calls must go through services in `src/services/`.

### Direct fetch() Violations (Must Fix)

| File                              | Line | Direct fetch() Call                                | Fix                                                 |
| --------------------------------- | ---- | -------------------------------------------------- | --------------------------------------------------- |
| `src/app/user/favorites/page.tsx` | 39   | `fetch(\`/api/favorites/list/${activeTab}\`)`      | Use `favoritesService.getList()`                    |
| `src/app/user/favorites/page.tsx` | 54   | `fetch(\`/api/favorites/${activeTab}/${itemId}\`)` | Use `favoritesService.remove()`                     |
| `src/app/admin/demo/page-new.tsx` | 29   | `fetch("/api/admin/demo/generate")`                | Use `demoDataService.generate()`                    |
| `src/app/admin/demo/page-new.tsx` | 61   | `fetch("/api/admin/demo/cleanup-all")`             | Use `demoDataService.cleanupAll()`                  |
| `src/hooks/useSlugValidation.ts`  | 108  | `fetch(\`${endpoint}?...\`)`                       | Create `validationService` or use existing services |

### API Routes Status

| Route Path                                       | Service Using It                       | Status    | Notes                                |
| ------------------------------------------------ | -------------------------------------- | --------- | ------------------------------------ |
| **Auth Routes** (`/api/auth/`)                   |                                        |           |                                      |
| `/auth/login`                                    | `auth.service.ts`                      | ✅ KEEP   | Login endpoint                       |
| `/auth/register`                                 | `auth.service.ts`                      | ✅ KEEP   | Registration                         |
| `/auth/logout`                                   | `auth.service.ts`                      | ✅ KEEP   | Logout                               |
| `/auth/me`                                       | `auth.service.ts`                      | ✅ KEEP   | Current user                         |
| `/auth/reset-password`                           | `auth.service.ts`                      | ✅ KEEP   | Password reset                       |
| `/auth/sessions`                                 | `auth.service.ts`                      | ✅ KEEP   | Session management                   |
| **User Routes** (`/api/user/`)                   |                                        |           |                                      |
| `/user/profile`                                  | `users.service.ts`                     | ✅ KEEP   | User profile                         |
| `/user/addresses`                                | `address.service.ts`                   | ✅ KEEP   | Address CRUD                         |
| `/user/addresses/[id]`                           | `address.service.ts`                   | ✅ KEEP   | Single address                       |
| **Products Routes** (`/api/products/`)           |                                        |           |                                      |
| `/products`                                      | `products.service.ts`                  | ✅ KEEP   | List/create products                 |
| `/products/[slug]`                               | `products.service.ts`                  | ✅ KEEP   | Get by slug                          |
| `/products/bulk`                                 | `products.service.ts`                  | ✅ KEEP   | Bulk operations                      |
| `/products/validate-slug`                        | `products.service.ts`                  | ✅ KEEP   | Slug validation                      |
| **Auctions Routes** (`/api/auctions/`)           |                                        |           |                                      |
| `/auctions`                                      | `auctions.service.ts`                  | ✅ KEEP   | List/create auctions                 |
| `/auctions/[id]`                                 | `auctions.service.ts`                  | ✅ KEEP   | Single auction                       |
| `/auctions/bulk`                                 | `auctions.service.ts`                  | ✅ KEEP   | Bulk operations                      |
| `/auctions/featured`                             | `auctions.service.ts`                  | ✅ KEEP   | Featured auctions                    |
| `/auctions/live`                                 | `auctions.service.ts`                  | ✅ KEEP   | Live auctions                        |
| `/auctions/my-bids`                              | `auctions.service.ts`                  | ✅ KEEP   | User's bids                          |
| `/auctions/watchlist`                            | `auctions.service.ts`                  | ✅ KEEP   | User's watchlist                     |
| `/auctions/won`                                  | `auctions.service.ts`                  | ✅ KEEP   | Won auctions                         |
| `/auctions/validate-slug`                        | `auctions.service.ts`                  | ✅ KEEP   | Slug validation                      |
| `/auctions/cron`                                 | None                                   | ⚠️ REVIEW | Empty folder - Firebase handles cron |
| **Categories Routes** (`/api/categories/`)       |                                        |           |                                      |
| `/categories`                                    | `categories.service.ts`                | ✅ KEEP   | List/create categories               |
| `/categories/[slug]`                             | `categories.service.ts`                | ✅ KEEP   | Single category                      |
| `/categories/bulk`                               | `categories.service.ts`                | ✅ KEEP   | Bulk operations                      |
| `/categories/tree`                               | `categories.service.ts`                | ✅ KEEP   | Category tree                        |
| `/categories/featured`                           | `categories.service.ts`                | ✅ KEEP   | Featured categories                  |
| `/categories/homepage`                           | `categories.service.ts`                | ✅ KEEP   | Homepage categories                  |
| `/categories/leaves`                             | `categories.service.ts`                | ✅ KEEP   | Leaf categories                      |
| `/categories/reorder`                            | `categories.service.ts`                | ✅ KEEP   | Reorder categories                   |
| `/categories/search`                             | `categories.service.ts`                | ✅ KEEP   | Search categories                    |
| `/categories/validate-slug`                      | `categories.service.ts`                | ✅ KEEP   | Slug validation                      |
| **Shops Routes** (`/api/shops/`)                 |                                        |           |                                      |
| `/shops`                                         | `shops.service.ts`                     | ✅ KEEP   | List/create shops                    |
| `/shops/[slug]`                                  | `shops.service.ts`                     | ✅ KEEP   | Single shop                          |
| `/shops/bulk`                                    | `shops.service.ts`                     | ✅ KEEP   | Bulk operations                      |
| `/shops/following`                               | `shops.service.ts`                     | ✅ KEEP   | Following shops                      |
| `/shops/validate-slug`                           | `shops.service.ts`                     | ✅ KEEP   | Slug validation                      |
| **Cart Routes** (`/api/cart/`)                   |                                        |           |                                      |
| `/cart`                                          | `cart.service.ts`                      | ✅ KEEP   | Cart operations                      |
| `/cart/[itemId]`                                 | `cart.service.ts`                      | ✅ KEEP   | Cart item                            |
| `/cart/count`                                    | `cart.service.ts`                      | ✅ KEEP   | Cart count                           |
| `/cart/merge`                                    | `cart.service.ts`                      | ✅ KEEP   | Merge carts                          |
| `/cart/coupon`                                   | `cart.service.ts`                      | ✅ KEEP   | Apply coupon                         |
| **Checkout Routes** (`/api/checkout/`)           |                                        |           |                                      |
| `/checkout/create-order`                         | `checkout.service.ts`                  | ✅ KEEP   | Order creation                       |
| `/checkout/verify-payment`                       | `checkout.service.ts`                  | ✅ KEEP   | Payment verification                 |
| **Orders Routes** (`/api/orders/`)               |                                        |           |                                      |
| `/orders`                                        | `orders.service.ts`                    | ✅ KEEP   | List/create orders                   |
| `/orders/[id]`                                   | `orders.service.ts`                    | ✅ KEEP   | Single order                         |
| `/orders/bulk`                                   | `orders.service.ts`                    | ✅ KEEP   | Bulk operations                      |
| **Payments Routes** (`/api/payments/`)           |                                        |           |                                      |
| `/payments`                                      | `payouts.service.ts`                   | ✅ KEEP   | Payments list                        |
| `/payments/[id]`                                 | `payouts.service.ts`                   | ✅ KEEP   | Single payment                       |
| **Payouts Routes** (`/api/payouts/`)             |                                        |           |                                      |
| `/payouts`                                       | `payouts.service.ts`                   | ✅ KEEP   | Payouts list                         |
| `/payouts/[id]`                                  | `payouts.service.ts`                   | ✅ KEEP   | Single payout                        |
| `/payouts/bulk`                                  | `payouts.service.ts`                   | ✅ KEEP   | Bulk payouts                         |
| **Coupons Routes** (`/api/coupons/`)             |                                        |           |                                      |
| `/coupons`                                       | `coupons.service.ts`                   | ✅ KEEP   | Coupons list                         |
| `/coupons/[code]`                                | `coupons.service.ts`                   | ✅ KEEP   | Single coupon                        |
| `/coupons/bulk`                                  | `coupons.service.ts`                   | ✅ KEEP   | Bulk operations                      |
| `/coupons/validate-code`                         | `coupons.service.ts`                   | ✅ KEEP   | Code validation                      |
| **Reviews Routes** (`/api/reviews/`)             |                                        |           |                                      |
| `/reviews`                                       | `reviews.service.ts`                   | ✅ KEEP   | Reviews list                         |
| `/reviews/[id]`                                  | `reviews.service.ts`                   | ✅ KEEP   | Single review                        |
| `/reviews/bulk`                                  | `reviews.service.ts`                   | ✅ KEEP   | Bulk operations                      |
| `/reviews/summary`                               | `reviews.service.ts`                   | ✅ KEEP   | Review summary                       |
| **Returns Routes** (`/api/returns/`)             |                                        |           |                                      |
| `/returns`                                       | `returns.service.ts`                   | ✅ KEEP   | Returns list                         |
| `/returns/[id]`                                  | `returns.service.ts`                   | ✅ KEEP   | Single return                        |
| `/returns/bulk`                                  | `returns.service.ts`                   | ✅ KEEP   | Bulk operations                      |
| **Tickets Routes** (`/api/tickets/`)             |                                        |           |                                      |
| `/tickets`                                       | `support.service.ts`                   | ✅ KEEP   | Tickets list                         |
| `/tickets/[id]`                                  | `support.service.ts`                   | ✅ KEEP   | Single ticket                        |
| `/tickets/bulk`                                  | `support.service.ts`                   | ✅ KEEP   | Bulk operations                      |
| **Blog Routes** (`/api/blog/`)                   |                                        |           |                                      |
| `/blog`                                          | `blog.service.ts`                      | ✅ KEEP   | Blog posts                           |
| `/blog/[slug]`                                   | `blog.service.ts`                      | ✅ KEEP   | Single post                          |
| **Favorites Routes** (`/api/favorites/`)         |                                        |           |                                      |
| `/favorites`                                     | `favorites.service.ts`                 | ✅ KEEP   | Favorites operations                 |
| `/favorites/[type]`                              | `favorites.service.ts`                 | ✅ KEEP   | By type                              |
| `/favorites/list`                                | `favorites.service.ts`                 | ✅ KEEP   | List favorites                       |
| `/favorites/count`                               | `favorites.service.ts`                 | ✅ KEEP   | Count                                |
| **Hero Slides Routes** (`/api/hero-slides/`)     |                                        |           |                                      |
| `/hero-slides`                                   | `hero-slides.service.ts`               | ✅ KEEP   | Hero slides                          |
| `/hero-slides/[id]`                              | `hero-slides.service.ts`               | ✅ KEEP   | Single slide                         |
| `/hero-slides/bulk`                              | `hero-slides.service.ts`               | ✅ KEEP   | Bulk operations                      |
| **Homepage Routes** (`/api/homepage/`)           |                                        |           |                                      |
| `/homepage`                                      | `homepage.service.ts`                  | ✅ KEEP   | Homepage data                        |
| `/homepage/banner`                               | `homepage.service.ts`                  | ✅ KEEP   | Banner                               |
| **Header Routes** (`/api/header/`)               |                                        |           |                                      |
| `/header/stats`                                  | `useHeaderStats` hook (via apiService) | ✅ KEEP   | Header statistics                    |
| **Search Routes** (`/api/search/`)               |                                        |           |                                      |
| `/search`                                        | `search.service.ts`                    | ✅ KEEP   | Global search                        |
| **Media Routes** (`/api/media/`)                 |                                        |           |                                      |
| `/media/upload`                                  | `media.service.ts`                     | ✅ KEEP   | File upload                          |
| `/media/delete`                                  | `media.service.ts`                     | ✅ KEEP   | File deletion                        |
| **Location Routes** (`/api/location/`)           |                                        |           |                                      |
| `/location/pincode`                              | `location.service.ts`                  | ✅ KEEP   | Pincode lookup                       |
| **Messages Routes** (`/api/messages/`)           |                                        |           |                                      |
| `/messages`                                      | `messages.service.ts`                  | ✅ KEEP   | Messages                             |
| `/messages/[id]`                                 | `messages.service.ts`                  | ✅ KEEP   | Single message                       |
| `/messages/unread-count`                         | `messages.service.ts`                  | ✅ KEEP   | Unread count                         |
| **Notifications Routes** (`/api/notifications/`) |                                        |           |                                      |
| `/notifications`                                 | `notification.service.ts`              | ✅ KEEP   | Notifications                        |
| `/notifications/unread-count`                    | `notification.service.ts`              | ✅ KEEP   | Unread count                         |
| **RipLimit Routes** (`/api/riplimit/`)           |                                        |           |                                      |
| `/riplimit/balance`                              | `riplimit.service.ts`                  | ✅ KEEP   | User balance                         |
| `/riplimit/transactions`                         | `riplimit.service.ts`                  | ✅ KEEP   | Transactions                         |
| `/riplimit/purchase`                             | `riplimit.service.ts`                  | ✅ KEEP   | Purchase credits                     |
| `/riplimit/refund`                               | `riplimit.service.ts`                  | ✅ KEEP   | Refund                               |
| **Analytics Routes** (`/api/analytics/`)         |                                        |           |                                      |
| `/analytics`                                     | `analytics.service.ts`                 | ✅ KEEP   | Analytics data                       |
| **Health Routes** (`/api/health/`)               |                                        |           |                                      |
| `/health`                                        | System monitoring                      | ✅ KEEP   | Health check                         |
| **Users Routes** (`/api/users/`)                 |                                        |           |                                      |
| `/users`                                         | `users.service.ts`                     | ✅ KEEP   | Users list (admin)                   |
| `/users/[id]`                                    | `users.service.ts`                     | ✅ KEEP   | Single user                          |
| `/users/bulk`                                    | `users.service.ts`                     | ✅ KEEP   | Bulk operations                      |

### Routes to DELETE

| Route Path                   | Reason                                        | Action                      |
| ---------------------------- | --------------------------------------------- | --------------------------- |
| `/api/protected/`            | No service uses it, only test route           | ❌ DELETE folder            |
| `/api/temporary-categories/` | No service uses it, temporary migration route | ❌ DELETE folder            |
| `/api/auctions/cron/`        | Empty folder - Firebase handles cron jobs     | ❌ DELETE folder            |
| `/api/test-data/`            | Development only - no production service      | ⚠️ DEV ONLY - block in prod |
| `/api/admin/debug/`          | Debug only - no production use                | ⚠️ DEV ONLY - block in prod |
| `/api/admin/demo/`           | Demo data generation - no production use      | ⚠️ DEV ONLY - block in prod |

### Routes to UNIFY with RBAC

| Route Path            | Current State                       | Unified Route            | RBAC Behavior                                                                                                                                         |
| --------------------- | ----------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/addresses/`     | Only tests, no route implementation | `/api/addresses`         | **User**: Own addresses only. **Seller**: Shop pickup addresses. **Admin**: Any user's addresses. Used by: checkout, orders, shops, auctions, returns |
| `/api/user/addresses` | User-only implementation            | Merge → `/api/addresses` | Keep for backward compatibility, internally route to unified `/api/addresses`                                                                         |

### Unified Address Route Design

**Route**: `/api/addresses`

| Method | Endpoint                     | User Role         | Behavior                                                      |
| ------ | ---------------------------- | ----------------- | ------------------------------------------------------------- |
| GET    | `/addresses`                 | User              | List own addresses                                            |
| GET    | `/addresses`                 | Seller            | List own addresses + shop pickup addresses                    |
| GET    | `/addresses`                 | Admin             | List all addresses (with filters: userId, shopId, type)       |
| GET    | `/addresses/[id]`            | User              | Get own address by ID                                         |
| GET    | `/addresses/[id]`            | Seller            | Get own or shop address                                       |
| GET    | `/addresses/[id]`            | Admin             | Get any address                                               |
| POST   | `/addresses`                 | User              | Create address for self                                       |
| POST   | `/addresses`                 | Seller            | Create address for self or shop (shopId in body)              |
| POST   | `/addresses`                 | Admin             | Create address for any user/shop (userId/shopId in body)      |
| PATCH  | `/addresses/[id]`            | User              | Update own address                                            |
| PATCH  | `/addresses/[id]`            | Seller            | Update own or shop address                                    |
| PATCH  | `/addresses/[id]`            | Admin             | Update any address                                            |
| DELETE | `/addresses/[id]`            | User              | Delete own address                                            |
| DELETE | `/addresses/[id]`            | Seller            | Delete own or shop address                                    |
| DELETE | `/addresses/[id]`            | Admin             | Delete any address                                            |
| PATCH  | `/addresses/[id]/default`    | User              | Set as default for self                                       |
| GET    | `/addresses/user/[userId]`   | Admin             | Get all addresses for a specific user                         |
| GET    | `/addresses/shop/[shopId]`   | All               | Get shop pickup/return addresses (public for shipping info)   |
| GET    | `/addresses/order/[orderId]` | User/Seller/Admin | Get shipping/billing address for order (with ownership check) |

**Address Types**:

- `shipping` - User shipping address
- `billing` - User billing address
- `pickup` - Shop pickup address
- `return` - Shop return address
- `warehouse` - Seller warehouse address

**Used By**:

- Checkout (shipping/billing selection)
- Orders (order shipping address)
- Shops (pickup/return addresses)
- Auctions (winner shipping address)
- Returns (return shipping address)
- User profile (address management)

### Admin Routes Analysis

| Route Path                              | Service Using It                         | Status      | Notes                   |
| --------------------------------------- | ---------------------------------------- | ----------- | ----------------------- |
| `/api/admin/dashboard`                  | Direct fetch                             | ✅ KEEP     | Admin dashboard         |
| `/api/admin/blog/`                      | `blog.service.ts`                        | ✅ KEEP     | Blog management         |
| `/api/admin/categories/`                | `categories.service.ts`                  | ✅ KEEP     | Category management     |
| `/api/admin/riplimit/`                  | Admin RipLimit page                      | ✅ KEEP     | RipLimit admin          |
| `/api/admin/settings/`                  | `settings.service.ts`                    | ✅ KEEP     | Admin settings          |
| `/api/admin/static-assets/`             | `static-assets-client.service.ts`        | ✅ KEEP     | Static asset management |
| `/api/admin/debug/products-by-category` | None                                     | ⚠️ DEV ONLY | Debug route             |
| `/api/admin/demo/*`                     | `demo-data.service.ts` (admin page only) | ⚠️ DEV ONLY | Demo data routes        |

### Seller Routes Analysis

| Route Path              | Service Using It             | Status  | Notes            |
| ----------------------- | ---------------------------- | ------- | ---------------- |
| `/api/seller/dashboard` | Direct fetch                 | ✅ KEEP | Seller dashboard |
| `/api/seller/settings/` | `seller-settings.service.ts` | ✅ KEEP | Seller settings  |

### Services Without API Route Constants (Hardcoded)

These services use hardcoded routes instead of `API_ROUTES` constants:

| Service                      | Hardcoded Routes                                     | Fix                       |
| ---------------------------- | ---------------------------------------------------- | ------------------------- |
| `address.service.ts`         | `/user/addresses`, `/user/addresses/${id}`           | Use `ADDRESS_ROUTES.*`    |
| `media.service.ts`           | `/media/upload`, `/media/delete`                     | Use `MEDIA_ROUTES.*`      |
| `checkout.service.ts`        | `/checkout/create-order`, `/checkout/verify-payment` | Use `CHECKOUT_ROUTES.*`   |
| `hero-slides.service.ts`     | `BASE_PATH = "/api/hero-slides"`                     | Use `HERO_SLIDE_ROUTES.*` |
| `settings.service.ts`        | `baseUrl = "/api/admin/settings"`                    | Use `ADMIN_ROUTES.*`      |
| `seller-settings.service.ts` | `baseUrl = "/api/seller/settings"`                   | Use `SELLER_ROUTES.*`     |
| `support.service.ts`         | Various ticket routes                                | Use `TICKET_ROUTES.*`     |
| `returns.service.ts`         | `/api/returns/${id}/media`                           | Use `RETURNS_ROUTES.*`    |

### API Routes Missing from Constants

Add these to `src/constants/api-routes.ts`:

```typescript
// Address Routes (NEW - Unified RBAC)
export const ADDRESS_ROUTES = {
  LIST: "/addresses",
  BY_ID: (id: string) => `/addresses/${id}`,
  SET_DEFAULT: (id: string) => `/addresses/${id}/default`,
  BY_USER: (userId: string) => `/addresses/user/${userId}`,
  BY_SHOP: (shopId: string) => `/addresses/shop/${shopId}`,
  BY_ORDER: (orderId: string) => `/addresses/order/${orderId}`,
} as const;

// Header Routes (missing)
export const HEADER_ROUTES = {
  STATS: "/header/stats",
} as const;

// Location Routes (missing)
export const LOCATION_ROUTES = {
  PINCODE: "/location/pincode",
} as const;

// Messages Routes (missing)
export const MESSAGES_ROUTES = {
  LIST: "/messages",
  BY_ID: (id: string) => `/messages/${id}`,
  UNREAD_COUNT: "/messages/unread-count",
} as const;

// Notifications Routes (missing)
export const NOTIFICATIONS_ROUTES = {
  LIST: "/notifications",
  UNREAD_COUNT: "/notifications/unread-count",
} as const;

// Favorites Routes (missing - different from existing)
export const FAVORITES_ROUTES = {
  LIST: "/favorites",
  BY_TYPE: (type: string) => `/favorites/${type}`,
  COUNT: "/favorites/count",
} as const;

// Blog Routes (partially missing)
export const BLOG_ROUTES = {
  LIST: "/blog",
  BY_SLUG: (slug: string) => `/blog/${slug}`,
} as const;
```

### Route Cleanup Checklist

- [ ] Delete `/api/addresses/` folder (use `/api/user/addresses`)
- [ ] Delete `/api/protected/` folder
- [ ] Delete `/api/temporary-categories/` folder
- [ ] Delete `/api/auctions/cron/` empty folder
- [ ] Add environment check to block `/api/test-data/*` in production
- [ ] Add environment check to block `/api/admin/debug/*` in production
- [ ] Add environment check to block `/api/admin/demo/*` in production
- [ ] Update services to use API_ROUTES constants instead of hardcoded strings
- [ ] Add missing route constants to `api-routes.ts`

---

## 9. Context-Aware RBAC for API Routes

### Problem Statement

An admin user who is also a seller faces data scope issues:

- On `/admin/products` → Should see ALL products (admin view)
- On `/seller/products` → Should see ONLY their shop's products (seller view)

Currently, the API returns data based solely on role, not the calling context. This causes admins who are sellers to see all products even when editing their own shop.

### Solution: Request Context Header

Add `X-Caller-Context` header to all API requests to indicate the calling context:

```typescript
// In apiService (src/services/api.service.ts)
interface ApiOptions {
  context?: "admin" | "seller" | "user" | "public";
  // ... other options
}

// Usage in service
productsService.getAll({ context: "seller" }); // Only my shop's products
productsService.getAll({ context: "admin" }); // All products
```

### Context Header Values

| Context Value | Meaning                        | Data Scope                  |
| ------------- | ------------------------------ | --------------------------- |
| `public`      | Public page (no auth required) | Published/active items only |
| `user`        | User dashboard                 | User's own data             |
| `seller`      | Seller dashboard               | Seller's shop data only     |
| `admin`       | Admin dashboard                | All data (with filters)     |

### Routes Requiring Context-Aware RBAC

| Route           | Admin Context | Seller Context                  | User Context    |
| --------------- | ------------- | ------------------------------- | --------------- |
| `/api/products` | All products  | Seller's shop products          | N/A (public)    |
| `/api/auctions` | All auctions  | Seller's shop auctions          | N/A (public)    |
| `/api/orders`   | All orders    | Seller's shop orders            | User's orders   |
| `/api/coupons`  | All coupons   | Seller's shop coupons           | N/A             |
| `/api/reviews`  | All reviews   | Reviews on seller's products    | User's reviews  |
| `/api/returns`  | All returns   | Returns on seller's orders      | User's returns  |
| `/api/tickets`  | All tickets   | Tickets from seller's customers | User's tickets  |
| `/api/payouts`  | All payouts   | Seller's payouts                | N/A             |
| `/api/messages` | All messages  | Seller's messages               | User's messages |

### Backend Implementation

```typescript
// In API route handler
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await getAuthFromRequest(request);
  const context = request.headers.get("X-Caller-Context") || "public";

  // Determine effective scope
  let filters = {};

  if (context === "seller" && auth.shopId) {
    // Even if admin, only show seller's shop data
    filters.shopId = auth.shopId;
  } else if (context === "admin" && auth.role === "admin") {
    // Full admin access - no automatic filters
    // Can still apply manual filters from query params
  } else if (context === "user" && auth.userId) {
    filters.userId = auth.userId;
  }

  // Apply filters to query
  // ...
}
```

### Frontend Service Implementation

```typescript
// services/api.service.ts
class ApiService {
  private getContext(): string {
    // Auto-detect from current path
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/admin")) return "admin";
      if (path.startsWith("/seller")) return "seller";
      if (path.startsWith("/user")) return "user";
    }
    return "public";
  }

  async get<T>(url: string, options?: ApiOptions): Promise<T> {
    const context = options?.context || this.getContext();
    const headers = {
      ...this.getHeaders(),
      "X-Caller-Context": context,
    };
    // ... rest of fetch
  }
}
```

### Files to Update

| File                                 | Changes                                           |
| ------------------------------------ | ------------------------------------------------- |
| `src/services/api.service.ts`        | Add context header support, auto-detect from path |
| `src/app/api/products/route.ts`      | Check context header, apply scope filters         |
| `src/app/api/auctions/route.ts`      | Check context header, apply scope filters         |
| `src/app/api/orders/route.ts`        | Check context header, apply scope filters         |
| `src/app/api/coupons/route.ts`       | Check context header, apply scope filters         |
| `src/app/api/reviews/route.ts`       | Check context header, apply scope filters         |
| `src/app/api/returns/route.ts`       | Check context header, apply scope filters         |
| `src/app/api/tickets/route.ts`       | Check context header, apply scope filters         |
| `src/app/api/payouts/route.ts`       | Check context header, apply scope filters         |
| `src/app/api/messages/route.ts`      | Check context header, apply scope filters         |
| `src/app/api/lib/handler-factory.ts` | Add context extraction helper                     |

---

## 10. Sieve Pagination System

### Current State

Sieve is implemented in `src/app/api/lib/sieve/` with:

- ✅ Parser for query params (`?page=1&pageSize=20&sorts=-createdAt&filters=status==published`)
- ✅ 14 resource configurations (products, auctions, orders, users, shops, reviews, categories, coupons, returns, tickets, blog, hero-slides, payouts, favorites)
- ✅ Firestore adapter for translating filters
- ✅ Client-side filter fallback for unsupported operators
- ❌ Frontend Pagination component NOT created yet
- ❌ Services NOT using Sieve yet

### Sieve Query Format

```
?page=1&pageSize=20&sorts=-createdAt,price&filters=status==published,price>100
```

| Param      | Format                               | Example                               |
| ---------- | ------------------------------------ | ------------------------------------- |
| `page`     | Number (1-indexed)                   | `page=1`                              |
| `pageSize` | Number (max from config)             | `pageSize=20`                         |
| `sorts`    | Comma-separated, `-` prefix for desc | `sorts=-createdAt,price`              |
| `filters`  | Comma-separated `field{op}value`     | `filters=status==published,price>100` |

### Filter Operators

| Operator | Meaning                     | Example             |
| -------- | --------------------------- | ------------------- |
| `==`     | Equals                      | `status==published` |
| `!=`     | Not equals                  | `status!=draft`     |
| `>`      | Greater than                | `price>100`         |
| `>=`     | Greater or equal            | `price>=100`        |
| `<`      | Less than                   | `price<1000`        |
| `<=`     | Less or equal               | `price<=1000`       |
| `@=`     | Contains                    | `name@=phone`       |
| `_=`     | Starts with                 | `name_=iPhone`      |
| `@=*`    | Contains (case-insensitive) | `name@=*PHONE`      |
| `==null` | Is null                     | `parentId==null`    |
| `!=null` | Is not null                 | `parentId!=null`    |

### Frontend Pagination Component (TO CREATE)

```typescript
// src/components/common/Pagination.tsx

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageNumbers?: boolean; // Show 1, 2, 3... page numbers
  showJumpTo?: boolean; // Show "Go to page" input
  showInfo?: boolean; // Show "Showing 1-20 of 100"
  compact?: boolean; // Mobile-friendly compact mode
}

// Features:
// - Page numbers with ellipsis (1 2 3 ... 8 9 10)
// - Previous/Next buttons with icons
// - First/Last page buttons
// - Jump to page input
// - Page size selector (10, 20, 50, 100)
// - "Showing X-Y of Z items" info text
// - Mobile-responsive (hides extras in compact mode)
// - Full dark mode support
// - Disabled states for first/last page
// - Keyboard navigation support
```

### useSievePagination Hook (TO CREATE)

```typescript
// src/hooks/useSievePagination.ts

interface UseSievePaginationOptions<T> {
  resource: string;
  initialFilters?: Record<string, string>;
  initialSorts?: string;
  initialPageSize?: number;
  service: {
    getAll: (params: SieveParams) => Promise<SievePaginatedResponse<T>>;
  };
}

interface UseSievePaginationReturn<T> {
  // Data
  data: T[];
  isLoading: boolean;
  error: Error | null;

  // Pagination
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;

  // Filtering & Sorting
  filters: FilterCondition[];
  sorts: SortField[];
  setFilter: (field: string, operator: FilterOperator, value: any) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  setSort: (field: string, direction: SortDirection) => void;

  // URL sync
  syncToURL: () => void;
  loadFromURL: () => void;

  // Refetch
  refetch: () => Promise<void>;
}

// Usage:
const {
  data: products,
  isLoading,
  page,
  totalPages,
  setPage,
  setFilter,
  setSort,
} = useSievePagination({
  resource: "products",
  service: productsService,
  initialPageSize: 20,
});
```

### Pages to Update with Sieve Pagination

| Page                | Current State     | Update Needed                               |
| ------------------- | ----------------- | ------------------------------------------- |
| `/products`         | Custom pagination | Use `useSievePagination` + `<Pagination />` |
| `/auctions`         | Custom pagination | Use `useSievePagination` + `<Pagination />` |
| `/shops`            | Custom pagination | Use `useSievePagination` + `<Pagination />` |
| `/categories`       | No pagination     | Add `useSievePagination` + `<Pagination />` |
| `/reviews`          | Custom pagination | Use `useSievePagination` + `<Pagination />` |
| `/blog`             | Custom pagination | Use `useSievePagination` + `<Pagination />` |
| `/admin/products`   | Custom + filters  | Use `useSievePagination` + `<Pagination />` |
| `/admin/auctions`   | Custom + filters  | Use `useSievePagination` + `<Pagination />` |
| `/admin/orders`     | Custom + filters  | Use `useSievePagination` + `<Pagination />` |
| `/admin/users`      | Custom + filters  | Use `useSievePagination` + `<Pagination />` |
| `/admin/shops`      | Custom + filters  | Use `useSievePagination` + `<Pagination />` |
| `/admin/reviews`    | Custom + filters  | Use `useSievePagination` + `<Pagination />` |
| `/admin/categories` | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/admin/coupons`    | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/admin/returns`    | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/admin/tickets`    | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/admin/payouts`    | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/admin/blog`       | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/seller/products`  | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/seller/auctions`  | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/seller/orders`    | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/seller/coupons`   | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/seller/returns`   | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/user/orders`      | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/user/bids`        | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/user/favorites`   | Custom            | Use `useSievePagination` + `<Pagination />` |
| `/user/watchlist`   | Custom            | Use `useSievePagination` + `<Pagination />` |

### Service Updates for Sieve

Each service needs to support Sieve query params:

```typescript
// services/products.service.ts
interface SieveParams {
  page?: number;
  pageSize?: number;
  sorts?: string;
  filters?: string;
  context?: "admin" | "seller" | "user" | "public";
}

class ProductsService {
  async getAll(
    params: SieveParams = {}
  ): Promise<SievePaginatedResponse<Product>> {
    const queryString = buildSieveQueryString(params);
    return apiService.get(`/products${queryString}`, {
      context: params.context,
    });
  }
}
```

### Implementation Checklist

#### Phase 1: Core Components

- [ ] Create `src/components/common/Pagination.tsx`
- [ ] Create `src/components/common/PaginationSimple.tsx`
- [ ] Create `src/components/common/PaginationCompact.tsx`
- [ ] Create `src/hooks/useSievePagination.ts`
- [ ] Add context header to `api.service.ts`

#### Phase 2: Backend Updates

- [ ] Add context extraction to `handler-factory.ts`
- [ ] Update `/api/products/route.ts` with context + sieve
- [ ] Update `/api/auctions/route.ts` with context + sieve
- [ ] Update `/api/orders/route.ts` with context + sieve
- [ ] Update other routes...

#### Phase 3: Service Updates

- [ ] Update `products.service.ts` with SieveParams
- [ ] Update `auctions.service.ts` with SieveParams
- [ ] Update `orders.service.ts` with SieveParams
- [ ] Update other services...

#### Phase 4: Page Updates

- [ ] Update `/products` page
- [ ] Update `/auctions` page
- [ ] Update `/admin/*` pages
- [ ] Update `/seller/*` pages
- [ ] Update `/user/*` pages

---

## 11. Firebase Functions & Background Jobs Opportunities

### Current Firebase Functions

| Function                   | Trigger        | Schedule       | Purpose                                      |
| -------------------------- | -------------- | -------------- | -------------------------------------------- |
| `processAuctions`          | Pub/Sub Cron   | Every 1 minute | Close ended auctions, notify winners/sellers |
| `triggerAuctionProcessing` | HTTPS Callable | Manual (admin) | Manual trigger for auction processing        |

### Jobs Currently Done via API Routes (Should Move to Firebase Functions)

#### High Priority - Status Change Triggers

| Current Implementation                    | Proposed Firebase Function | Trigger Type         | Benefits                                      |
| ----------------------------------------- | -------------------------- | -------------------- | --------------------------------------------- |
| Order status updates → notifications      | `onOrderStatusChange`      | Firestore `onUpdate` | Real-time notifications, decouple from API    |
| Payment status updates → order status     | `onPaymentStatusChange`    | Firestore `onUpdate` | Auto-confirm orders when payment succeeds     |
| Return status updates → refund processing | `onReturnStatusChange`     | Firestore `onUpdate` | Auto-process refunds, update inventory        |
| Ticket status updates → notifications     | `onTicketStatusChange`     | Firestore `onUpdate` | Notify users of ticket updates                |
| Shop verification → seller notifications  | `onShopVerificationChange` | Firestore `onUpdate` | Notify sellers when shop is verified/rejected |
| Product publish → category counts update  | `onProductStatusChange`    | Firestore `onUpdate` | Keep category product counts accurate         |
| Auction status → category auction counts  | `onAuctionStatusChange`    | Firestore `onUpdate` | Keep category auction counts accurate         |

#### Medium Priority - Scheduled Jobs

| Current Implementation                         | Proposed Firebase Function   | Schedule          | Benefits                                    |
| ---------------------------------------------- | ---------------------------- | ----------------- | ------------------------------------------- |
| Rebuild category counts (manual admin trigger) | `rebuildCategoryCounts`      | Every 6 hours     | Ensure data consistency automatically       |
| Session cleanup (none currently)               | `cleanupExpiredSessions`     | Every hour        | Remove expired sessions, save storage costs |
| Cart cleanup (none currently)                  | `cleanupAbandonedCarts`      | Every 6 hours     | Clean up old abandoned carts                |
| Coupon expiry check (client-side only)         | `expireCoupons`              | Every hour        | Mark expired coupons as inactive            |
| Analytics aggregation (none currently)         | `aggregateAnalytics`         | Daily at midnight | Pre-compute analytics for dashboard         |
| Review moderation queue (manual)               | `processReviewQueue`         | Every 30 minutes  | Auto-moderate reviews, notify admins        |
| Low stock alerts (none currently)              | `checkLowStockAlerts`        | Every 2 hours     | Notify sellers of low stock products        |
| Auction reminders (none currently)             | `sendAuctionReminders`       | Every 15 minutes  | Notify watchers when auction ending soon    |
| Winner payment reminder (none currently)       | `sendWinnerPaymentReminders` | Every 2 hours     | Remind auction winners to pay               |

#### Low Priority - Event-Driven Jobs

| Current Implementation                 | Proposed Firebase Function | Trigger Type         | Benefits                       |
| -------------------------------------- | -------------------------- | -------------------- | ------------------------------ |
| New bid → outbid notifications         | `onNewBid`                 | Firestore `onCreate` | Real-time outbid notifications |
| New review → shop rating recalculation | `onNewReview`              | Firestore `onCreate` | Keep shop ratings updated      |
| New order → inventory update           | `onNewOrder`               | Firestore `onCreate` | Decrement stock counts         |
| User registration → welcome email      | `onUserCreate`             | Firestore `onCreate` | Automated welcome flow         |
| Shop creation → admin notification     | `onShopCreate`             | Firestore `onCreate` | Alert admins for verification  |
| Media upload → thumbnail generation    | `onMediaUpload`            | Storage `onFinalize` | Auto-generate thumbnails       |
| Order delivery → review request        | `onOrderDelivered`         | Firestore `onUpdate` | Request reviews after delivery |

### Proposed Firebase Functions Implementation

```typescript
// functions/src/index.ts additions

// Status Change Triggers
export const onOrderStatusChange = functions
  .region("asia-south1")
  .firestore.document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== after.status) {
      await notificationService.notifyOrderStatusChange({
        orderId: context.params.orderId,
        oldStatus: before.status,
        newStatus: after.status,
        userId: after.user_id,
      });
    }
  });

export const onPaymentStatusChange = functions
  .region("asia-south1")
  .firestore.document("payments/{paymentId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== after.status && after.status === "completed") {
      // Auto-confirm the order
      await db.collection("orders").doc(after.order_id).update({
        status: "confirmed",
        payment_status: "paid",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// Scheduled Jobs
export const cleanupExpiredSessions = functions
  .region("asia-south1")
  .pubsub.schedule("every 1 hours")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const snapshot = await db
      .collection("sessions")
      .where("expiresAt", "<", now)
      .limit(500)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snapshot.size} expired sessions`);
  });

export const rebuildCategoryCounts = functions
  .region("asia-south1")
  .pubsub.schedule("every 6 hours")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    // Rebuild all category counts
    const categories = await db.collection("categories").get();
    for (const doc of categories.docs) {
      // Count products, auctions, etc. for each category
    }
  });

export const sendAuctionReminders = functions
  .region("asia-south1")
  .pubsub.schedule("every 15 minutes")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const soon = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    );
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db
      .collection("auctions")
      .where("status", "==", "active")
      .where("end_time", ">", now)
      .where("end_time", "<=", soon)
      .where("reminder_sent", "==", false)
      .limit(50)
      .get();

    for (const doc of snapshot.docs) {
      // Send reminders to watchers
      await notificationService.sendAuctionEndingReminder(doc.id, doc.data());
      await doc.ref.update({ reminder_sent: true });
    }
  });
```

---

## 12. Infrastructure Configuration Recommendations

### Firestore Indexes (Missing/Needed)

| Collection     | Fields Needed                                   | Purpose                              | Status    |
| -------------- | ----------------------------------------------- | ------------------------------------ | --------- |
| `auctions`     | `status`, `reminder_sent`, `end_time`           | For auction reminder cron job        | ⚠️ NEEDED |
| `sessions`     | `userId`, `expiresAt`                           | For session cleanup (already exists) | ✅ EXISTS |
| `orders`       | `status`, `payment_due_at`                      | For payment reminder jobs            | ⚠️ NEEDED |
| `coupons`      | `status`, `end_date`, `is_active`               | For coupon expiry cron               | ⚠️ NEEDED |
| `products`     | `shop_id`, `stock_count`, `low_stock_threshold` | For low stock alerts                 | ⚠️ NEEDED |
| `won_auctions` | `order_created`, `payment_due_at`, `created_at` | For winner payment reminders         | ⚠️ NEEDED |
| `categories`   | `parent_ids` (array-contains), `level`          | For hierarchy queries                | ✅ EXISTS |

### Firestore Rules Updates Needed

```javascript
// Add to firestore.rules

// Won Auctions collection (for Firebase functions)
match /won_auctions/{docId} {
  allow read: if isOwner(resource.data.user_id) ||
              ownsShop(resource.data.shop_id) ||
              isAdmin();
  allow write: if false; // Only server-side
}

// Notification preferences (for opt-out)
match /notification_preferences/{userId} {
  allow read, write: if isOwner(userId);
}
```

### Storage Rules Updates Needed

```javascript
// Add to storage.rules

// Auction media (separate from products for better organization)
match /auction-images/{auctionId}/{fileName} {
  allow read: if true;
  allow write: if isSeller() && isImage(request.resource.contentType);
}

match /auction-videos/{auctionId}/{fileName} {
  allow read: if true;
  allow write: if isSeller() && isVideo(request.resource.contentType)
               && request.resource.size < 100 * 1024 * 1024;
}

// User avatars
match /user-avatars/{userId}/{fileName} {
  allow read: if true;
  allow write: if isAuthenticated() && request.auth.uid == userId
               && isImage(request.resource.contentType)
               && request.resource.size < 5 * 1024 * 1024;
}

// Category images (admin only)
match /category-images/{categoryId}/{fileName} {
  allow read: if true;
  allow write: if isAdmin() && isImage(request.resource.contentType);
}
```

### Realtime Database Rules Updates Needed

```json
{
  "rules": {
    // Add watchlist for real-time auction updates
    "auction-watchers": {
      "$auctionId": {
        ".read": true,
        "$userId": {
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    },

    // Add typing indicators for messages
    "typing-indicators": {
      "$conversationId": {
        ".read": "auth != null",
        "$userId": {
          ".write": "auth != null && auth.uid == $userId",
          ".validate": "newData.hasChildren(['isTyping', 'timestamp'])"
        }
      }
    },

    // Add presence for online status
    "presence": {
      "$userId": {
        ".read": true,
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

### Vercel Configuration Updates Needed

```json
{
  // Add to vercel.json

  // Increase timeout for admin routes
  "functions": {
    "src/app/api/**": {
      "memory": 1024,
      "maxDuration": 10
    },
    "src/app/api/admin/**": {
      "memory": 1024,
      "maxDuration": 30
    },
    "src/app/api/admin/categories/rebuild-counts/**": {
      "memory": 2048,
      "maxDuration": 60
    },
    "src/app/api/checkout/**": {
      "memory": 1024,
      "maxDuration": 30
    }
  },

  // Add caching headers for static content
  "headers": [
    {
      "source": "/api/categories",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=600"
        }
      ]
    },
    {
      "source": "/api/categories/tree",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=600"
        }
      ]
    },
    {
      "source": "/api/hero-slides",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=120, stale-while-revalidate=300"
        }
      ]
    }
  ],

  // Add rewrites for legacy routes if needed
  "rewrites": [
    { "source": "/shop/:slug", "destination": "/shops/:slug" },
    { "source": "/product/:slug", "destination": "/products/:slug" },
    { "source": "/auction/:slug", "destination": "/auctions/:slug" }
  ]
}
```

### Firebase Configuration (firebase.json) Updates Needed

```json
{
  // Add to firebase.json

  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },

  "storage": {
    "rules": "storage.rules"
  },

  "database": {
    "rules": "database.rules.json"
  },

  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint",
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ],
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log"
    ]
  },

  // Add emulators for local development
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "database": { "port": 9000 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

---

## 13. Implementation Priority Matrix

### Immediate (Week 1-2)

| Task                                        | Type              | Effort | Impact |
| ------------------------------------------- | ----------------- | ------ | ------ |
| Add `onOrderStatusChange` Firebase function | Firebase Function | Medium | High   |
| Add session cleanup cron                    | Firebase Function | Low    | Medium |
| Update Vercel config with proper timeouts   | Config            | Low    | High   |
| Add missing Firestore indexes               | Config            | Low    | High   |

### Short-term (Week 3-4)

| Task                                        | Type              | Effort | Impact |
| ------------------------------------------- | ----------------- | ------ | ------ |
| Add `onPaymentStatusChange` function        | Firebase Function | Medium | High   |
| Add auction reminders cron                  | Firebase Function | Medium | Medium |
| Add low stock alerts cron                   | Firebase Function | Medium | Medium |
| Update storage rules for avatars/categories | Config            | Low    | Low    |

### Medium-term (Month 2)

| Task                                     | Type              | Effort | Impact |
| ---------------------------------------- | ----------------- | ------ | ------ |
| Add analytics aggregation cron           | Firebase Function | High   | High   |
| Add review moderation queue              | Firebase Function | High   | Medium |
| Add presence/typing indicators           | Realtime DB       | Medium | Medium |
| Implement full event-driven architecture | Architecture      | High   | High   |

### Long-term (Month 3+)

| Task                                               | Type         | Effort | Impact |
| -------------------------------------------------- | ------------ | ------ | ------ |
| Migrate all status changes to Firestore triggers   | Architecture | High   | High   |
| Add full offline support with service worker       | PWA          | High   | Medium |
| Implement webhook system for external integrations | Architecture | High   | Medium |

---

## 14. Beyblade Demo Data Architecture (November 2025)

### Category Counts System

The demo data generator now tracks comprehensive category statistics:

| Field                 | Type     | Description                          | Updated By                   |
| --------------------- | -------- | ------------------------------------ | ---------------------------- |
| `product_count`       | `number` | Total products in category           | Products API, Demo Generator |
| `in_stock_count`      | `number` | Products with stock > 0              | Products API, Demo Generator |
| `out_of_stock_count`  | `number` | Products with stock = 0              | Products API, Demo Generator |
| `live_auction_count`  | `number` | Active auctions in category          | Auctions API, Demo Generator |
| `ended_auction_count` | `number` | Completed/ended auctions in category | Auctions API, Demo Generator |

### Category Count Update Flow

```
Product Created/Updated → updateCategoryProductCounts() → Updates:
  - product_count
  - in_stock_count
  - out_of_stock_count
  - All ancestor categories (bottom-up)

Auction Created/Updated → updateCategoryAuctionCounts() → Updates:
  - live_auction_count
  - ended_auction_count
  - All ancestor categories (bottom-up)

Rebuild All → rebuildAllCategoryCounts() → Updates all counts for all categories
```

### Demo Data Generator Flow

```
1. Categories (Beyblade hierarchy: Attack, Defense, Stamina, Balance, etc.)
2. Users (100 users with Beyblade-themed display names for sellers)
3. Shops (50 shops with Beyblade-themed names)
4. Products (1000+ products, updates category product counts)
5. Auctions (250+ auctions, updates category auction counts)
6. Bids (2500+ bids across auctions)
7. Reviews (1500+ reviews)
8. Orders (with payments)
9. Extras (hero slides, coupons, tickets, returns)
```

### Files Involved in Count Tracking

| File                                                   | Responsibility                              |
| ------------------------------------------------------ | ------------------------------------------- |
| `src/lib/category-hierarchy.ts`                        | Count update functions                      |
| `src/app/api/products/route.ts`                        | Calls updateCategoryProductCounts on create |
| `src/app/api/products/[slug]/route.ts`                 | Calls counts on update/delete               |
| `src/app/api/auctions/route.ts`                        | Calls updateCategoryAuctionCounts on create |
| `src/app/api/auctions/[id]/route.ts`                   | Calls counts on update/delete               |
| `src/app/api/admin/demo/generate/products/route.ts`    | Updates counts during demo generation       |
| `src/app/api/admin/demo/generate/auctions/route.ts`    | Updates counts during demo generation       |
| `src/app/api/admin/categories/rebuild-counts/route.ts` | Manual rebuild trigger                      |

---

## 15. Sieve Pagination Migration Plan

### Current State

The codebase has **two pagination systems**:

| System                   | Location                              | Status               |
| ------------------------ | ------------------------------------- | -------------------- |
| Sieve (modern, standard) | `src/app/api/lib/sieve/`              | Fully implemented |
| Cursor/Offset (legacy)   | `src/app/api/lib/utils/pagination.ts` | Being phased out  |

### Sieve Query Format

```
GET /api/products?page=1&pageSize=20&sorts=-createdAt,price&filters=status==published,price>100
```

**Supported Operators:**

| Operator | Description                 | Example             |
| -------- | --------------------------- | ------------------- |
| `==`     | Equals                      | `status==published` |
| `!=`     | Not equals                  | `status!=draft`     |
| `>`      | Greater than                | `price>100`         |
| `>=`     | Greater than or equal       | `price>=100`        |
| `<`      | Less than                   | `stock<10`          |
| `<=`     | Less than or equal          | `stock<=0`          |
| `@=`     | Contains (case-sensitive)   | `name@=blade`       |
| `_=`     | Starts with                 | `name_=Storm`       |
| `@=*`    | Contains (case-insensitive) | `name@=*BLADE`      |
| `==null` | Is null/undefined           | `deletedAt==null`   |
| `!=null` | Is not null                 | `paidAt!=null`      |

### API Routes to Migrate

#### Priority 1 - High Traffic Routes

| Route             | Current Pagination            | Config                  | Complexity |
| ----------------- | ----------------------------- | ----------------------- | ---------- |
| `/api/products`   | `executeCursorPaginatedQuery` | `productsSieveConfig`   | Medium     |
| `/api/auctions`   | `executeCursorPaginatedQuery` | `auctionsSieveConfig`   | Medium     |
| `/api/shops`      | `executeCursorPaginatedQuery` | `shopsSieveConfig`      | Low        |
| `/api/categories` | Manual offset                 | `categoriesSieveConfig` | Low        |
| `/api/reviews`    | Manual limit                  | `reviewsSieveConfig`    | Low        |

#### Priority 2 - Admin Routes

| Route                    | Current Pagination            | Config                  | Complexity |
| ------------------------ | ----------------------------- | ----------------------- | ---------- |
| `/api/admin/products`    | `executeCursorPaginatedQuery` | `productsSieveConfig`   | Medium     |
| `/api/admin/auctions`    | Manual                        | `auctionsSieveConfig`   | Medium     |
| `/api/admin/orders`      | `executeCursorPaginatedQuery` | `ordersSieveConfig`     | Medium     |
| `/api/admin/users`       | `executeCursorPaginatedQuery` | `usersSieveConfig`      | Low        |
| `/api/admin/shops`       | Manual limit                  | `shopsSieveConfig`      | Low        |
| `/api/admin/tickets`     | Manual                        | `ticketsSieveConfig`    | Low        |
| `/api/admin/payouts`     | Manual                        | `payoutsSieveConfig`    | Low        |
| `/api/admin/coupons`     | Manual                        | `couponsSieveConfig`    | Low        |
| `/api/admin/returns`     | Manual                        | `returnsSieveConfig`    | Low        |
| `/api/admin/hero-slides` | Manual                        | `heroSlidesSieveConfig` | Low        |
| `/api/blog/posts`        | Manual                        | `blogSieveConfig`       | Low        |

#### Priority 3 - User/Seller Routes

| Route                  | Current Pagination            | Config                 | Complexity |
| ---------------------- | ----------------------------- | ---------------------- | ---------- |
| `/api/user/orders`     | Manual limit                  | `ordersSieveConfig`    | Low        |
| `/api/user/favorites`  | Manual                        | `favoritesSieveConfig` | Low        |
| `/api/seller/products` | `executeCursorPaginatedQuery` | `productsSieveConfig`  | Medium     |
| `/api/seller/auctions` | `executeCursorPaginatedQuery` | `auctionsSieveConfig`  | Medium     |
| `/api/seller/orders`   | Manual                        | `ordersSieveConfig`    | Low        |

### Migration Pattern

#### Before (Legacy Cursor Pagination)

```typescript
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");
  const cursor = searchParams.get("cursor");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  let query = db
    .collection("products")
    .where("status", "==", "published")
    .orderBy(sortBy, sortOrder);

  if (categoryId) query = query.where("categoryId", "==", categoryId);
  if (minPrice) query = query.where("price", ">=", minPrice);

  const result = await executeCursorPaginatedQuery(
    query,
    searchParams,
    getProductByIdForCursor,
    transformProduct,
    limit,
    100
  );

  return NextResponse.json(result);
}
```

#### After (Sieve Pagination)

```typescript
import {
  parseSieveQuery,
  executeSieveQuery,
  productsSieveConfig,
} from "@/app/api/lib/sieve";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sieveQuery = parseSieveQuery(searchParams, productsSieveConfig);

  // Add mandatory filters (e.g., only published products for public API)
  sieveQuery.filters.push({
    field: "status",
    operator: "==",
    value: "published",
  });

  const result = await executeSieveQuery(
    "products",
    sieveQuery,
    productsSieveConfig
  );

  return NextResponse.json({
    success: true,
    data: result.data.map(transformProduct),
    pagination: result.pagination,
    meta: result.meta,
  });
}
```

### Sieve Config Reference

All configs are in `src/app/api/lib/sieve/config.ts`:

| Config                  | Sortable Fields                                               | Default Sort |
| ----------------------- | ------------------------------------------------------------- | ------------ |
| `productsSieveConfig`   | createdAt, updatedAt, price, name, stock, rating, reviewCount | -createdAt   |
| `auctionsSieveConfig`   | createdAt, endTime, currentBid, startingPrice, bidCount       | -createdAt   |
| `ordersSieveConfig`     | createdAt, updatedAt, totalAmount, status                     | -createdAt   |
| `usersSieveConfig`      | createdAt, updatedAt, displayName, email                      | -createdAt   |
| `shopsSieveConfig`      | createdAt, updatedAt, name, rating, reviewCount, productCount | -createdAt   |
| `reviewsSieveConfig`    | createdAt, rating                                             | -createdAt   |
| `categoriesSieveConfig` | createdAt, updatedAt, name, sortOrder                         | sortOrder    |
| `couponsSieveConfig`    | createdAt, expiresAt, discountPercent, usageCount             | -createdAt   |
| `returnsSieveConfig`    | createdAt, updatedAt, status                                  | -createdAt   |
| `ticketsSieveConfig`    | createdAt, updatedAt, status, priority                        | -createdAt   |
| `blogSieveConfig`       | createdAt, updatedAt, publishedAt, title                      | -publishedAt |
| `heroSlidesSieveConfig` | createdAt, sortOrder                                          | sortOrder    |
| `payoutsSieveConfig`    | createdAt, amount, status                                     | -createdAt   |
| `favoritesSieveConfig`  | createdAt                                                     | -createdAt   |

### Frontend Integration

#### Update Service Methods

```typescript
// src/services/products.service.ts
import { buildSieveQueryString, type SieveParams } from "@/app/api/lib/sieve";

class ProductsService {
  async getProducts(
    params: SieveParams = {}
  ): Promise<SievePaginatedResponse<Product>> {
    const queryString = buildSieveQueryString(params);
    return apiService.get(`/products${queryString});
  }
}
```

#### Create useSievePagination Hook

```typescript
// src/hooks/useSievePagination.ts
import { useState, useCallback } from "react";
import {
  buildSieveQueryString,
  type SieveParams,
} from "@/app/api/lib/sieve";

export function useSievePagination<T>(
  fetchFn: (params: SieveParams) => Promise<SievePaginatedResponse<T>>,
  initialParams: SieveParams = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<SievePaginationMeta | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(
    async (newParams: Partial<SieveParams> = {}) => {
      setLoading(true);
      const mergedParams = { ...params, ...newParams };
      const result = await fetchFn(mergedParams);
      setData(result.data);
      setPagination(result.pagination);
      setParams(mergedParams);
      setLoading(false);
    },
    [params, fetchFn]
  );

  const goToPage = (page: number) => fetch({ page });
  const setPageSize = (pageSize: number) => fetch({ pageSize, page: 1 });
  const setSorts = (sorts: string) => fetch({ sorts, page: 1 });
  const setFilters = (filters: string) => fetch({ filters, page: 1 });

  return {
    data,
    pagination,
    loading,
    fetch,
    goToPage,
    setPageSize,
    setSorts,
    setFilters,
  };
}
```

### Migration Checklist

#### Phase 1: Core Routes (Week 1)

- [ ] `/api/products` -> Sieve
- [ ] `/api/auctions` -> Sieve
- [ ] `/api/shops` -> Sieve
- [ ] `/api/categories` -> Sieve
- [ ] `/api/reviews` -> Sieve

#### Phase 2: Admin Routes (Week 2)

- [ ] `/api/admin/products` -> Sieve
- [ ] `/api/admin/auctions` -> Sieve
- [ ] `/api/admin/orders` -> Sieve
- [ ] `/api/admin/users` -> Sieve
- [ ] `/api/admin/shops` -> Sieve
- [ ] `/api/admin/tickets` -> Sieve
- [ ] `/api/admin/payouts` -> Sieve
- [ ] `/api/admin/coupons` -> Sieve
- [ ] `/api/admin/returns` -> Sieve
- [ ] `/api/admin/hero-slides` -> Sieve
- [ ] `/api/blog/posts` -> Sieve

#### Phase 3: User/Seller Routes (Week 3)

- [ ] `/api/user/orders` -> Sieve
- [ ] `/api/user/favorites` -> Sieve
- [ ] `/api/seller/products` -> Sieve
- [ ] `/api/seller/auctions` -> Sieve
- [ ] `/api/seller/orders` -> Sieve

#### Phase 4: Frontend Integration (Week 4)

- [ ] Create `useSievePagination` hook
- [ ] Update service methods with `buildSieveQueryString`
- [ ] Create standardized Pagination components
- [ ] Update listing pages to use new components

#### Phase 5: Cleanup (Week 5)

- [ ] Remove `executeCursorPaginatedQuery` from pagination.ts
- [ ] Remove legacy pagination params from route handlers
- [ ] Update API documentation with Sieve query format
