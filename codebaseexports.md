# Codebase Exports Catalog

> **Auto-generated catalog of every export from every source file in the LetItRip monorepo.**
> Update this file after every code change to track impact across the codebase.
> Last updated: 2026-05-22

---

## Table of Contents

1. [UI Components (appkit/src/ui/)](#1-ui-components)
2. [Feature View Components](#2-feature-view-components)
3. [Internal Server Features](#3-internal-server-features)
4. [Internal Client Features](#4-internal-client-features)
5. [Internal Shared](#5-internal-shared)
6. [Repositories](#6-repositories)
7. [Hooks](#7-hooks)
8. [Server Actions](#8-server-actions)
9. [API Routes (src/app/api/)](#9-api-routes)
10. [Constants](#10-constants)
11. [Types & Interfaces](#11-types--interfaces)
12. [Utils & Helpers](#12-utils--helpers)
13. [Registries](#13-registries)
14. [Schemas (Zod)](#14-schemas-zod)
15. [Seed Data](#15-seed-data)
16. [Page Shims (src/app/)](#16-page-shims)
17. [Config](#17-config)
18. [Tokens & Design System](#18-tokens--design-system)
19. [Route Map](#19-route-map)
20. [Firebase Jobs](#20-firebase-jobs)

---

## 1. UI Components

### Layout Primitives (appkit/src/ui/components/Layout.tsx)

| Export | Type | Props | Purpose |
|--------|------|-------|---------|
| `Container` | Component | `size?: ContainerSize, as?: ElementType, className?` | Page-level max-width + centering + responsive px |
| `Stack` | Component | `gap?: GapKey, centered?, align?, as?, className?` | Vertical flex column |
| `Row` | Component | `gap?: GapKey, centered?, align?, justify?, wrap?, as?, className?` | Horizontal flex row |
| `Grid` | Component | `cols?: GridCols, gap?: GapKey, as?, className?` | Responsive CSS grid (30+ presets) |
| `GapKey` | Type | — | `"none"\|"px"\|"xs"\|"sm"\|"2.5"\|"3"\|"md"\|"5"\|"lg"\|"xl"\|"2xl"` |
| `ContainerSize` | Type | — | `"sm"\|"md"\|"lg"\|"xl"\|"2xl"\|"full"\|"wide"\|"ultra"` |
| `GridCols` | Type | — | `1-6\|"cards"\|"productCards"\|"storeCards"\|"sidebar"\|"halves"\|"twoThird"\|"autoSm"\|"autoMd"\|"autoLg"` + 15 more |
| `ViewPortal` | Type | — | `"admin"\|"seller"\|"user"\|"public"` |
| `GRID_MAP` | Const | — | Grid column class map (30 presets) |
| `GAP_MAP` | Const | — | Gap class map (11 sizes) |
| `CONTAINER_MAP` | Const | — | Container size class map (8 sizes) |

### Semantic Elements (appkit/src/ui/components/Semantic.tsx)

| Export | Type | Props | Purpose |
|--------|------|-------|---------|
| `Section` | Component (forwardRef) | `className?, children` | `<section>` wrapper |
| `Article` | Component | `className?, children?` | `<article>` wrapper |
| `Main` | Component | `className?, children` | `<main>` wrapper |
| `Aside` | Component (forwardRef) | `className?, children` | `<aside>` wrapper |
| `Nav` | Component | `aria-label (required), className?, children` | `<nav>` with enforced aria-label |
| `BlockHeader` / `Header` | Component | `className?, children` | `<header>` for block-level use |
| `BlockFooter` / `Footer` | Component | `className?, children` | `<footer>` for block-level use |
| `Ul` | Component | `className?, children` | `<ul>` wrapper |
| `Ol` | Component | `className?, children` | `<ol>` wrapper |
| `Li` | Component | `className?, children` | `<li>` wrapper |

### Typography (appkit/src/ui/components/Typography.tsx)

| Export | Type | Props | Purpose |
|--------|------|-------|---------|
| `Heading` | Component | `level?: 1-6, variant?: "primary"\|"secondary"\|"muted"\|"none", className?` | Semantic headings h1-h6 |
| `Text` | Component | `variant?, size?: "xs"-"xl", weight?, as?: ElementType, className?` | Paragraph text with semantic colors |
| `Label` | Component | `required?, className?` | Form labels with optional asterisk |
| `Caption` | Component | `variant?: "default"\|"accent"\|"inverse", className?` | Small caption text |
| `Span` | Component | `variant?, size?, weight?, className?` | Inline styled text fragment |

### Div (appkit/src/ui/components/Div.tsx)

| Export | Type | Props | Purpose |
|--------|------|-------|---------|
| `Div` | Component | `data-section (required), className?, children?` | Thin div wrapper (1140+ usages) |

### Form Components

| File | Export | Props | Purpose |
|------|--------|-------|---------|
| `Button.tsx` | `Button` | `variant, size, color, loading?, disabled?, action?, asChild?, href?` | Primary CTA with action-def auto-resolution |
| `Input.tsx` | `Input` | `type, size, error?, icon?, className?` | Text input with error state |
| `Select.tsx` | `Select` | `options[], value, onChange, placeholder?, size?` | Dropdown select |
| `Textarea.tsx` | `Textarea` | `rows?, maxLength?, error?, className?` | Multi-line text input |
| `Toggle.tsx` | `Toggle` | `checked, onChange, size?, disabled?` | Switch toggle (pill style) |
| `Checkbox.tsx` | `Checkbox` | `checked, onChange, indeterminate?, label?` | Checkbox with label |
| `RadioGroup.tsx` | `RadioGroup` | `options[], value, onChange, direction?` | Radio button group |
| `SearchInput.tsx` | `SearchInput` | `value, onChange, placeholder?, onClear?` | Search with clear button |
| `DatePicker.tsx` | `DatePicker` | `value, onChange, min?, max?` | Date input |
| `FileInput.tsx` | `FileInput` | `accept?, multiple?, onChange, maxSize?` | File upload input |
| `RichTextEditor.tsx` | `RichTextEditor` | `value, onChange, placeholder?` | TipTap-based HTML editor |

### Feedback & Overlay Components

| File | Export | Props | Purpose |
|------|--------|-------|---------|
| `Modal.tsx` | `Modal` | `isOpen, onClose, title?, size?, children` | Centered modal dialog |
| `SideDrawer.tsx` | `SideDrawer` | `isOpen, onClose, title?, side?, width?, children` | Slide-in drawer panel |
| `SideModal.tsx` | `SideModal` | `isOpen, onClose, title?, children` | Side-anchored modal |
| `Toast.tsx` | `showToast` | `(message, variant?)` | Toast notification helper |
| `Badge.tsx` | `Badge` | `variant, size?, children` | Status/count badge |
| `Alert.tsx` | `Alert` | `variant, title?, children` | Alert banner |
| `Tooltip.tsx` | `Tooltip` | `content, children, side?` | Hover tooltip |
| `ConfirmDialog.tsx` | `ConfirmDialog` | `isOpen, onConfirm, onCancel, title, message` | Confirmation dialog |
| `PageLoader.tsx` | `PageLoader` | `timeout?` | Full-page loading spinner (15s timeout) |
| `Skeleton.tsx` | `Skeleton` | `width?, height?, rounded?` | Loading placeholder |

### Data Display Components

| File | Export | Props | Purpose |
|------|--------|-------|---------|
| `DataTable.tsx` | `DataTable` | `columns[], data[], selectable?, sortable?, pagination?` | Full-featured data table |
| `Card.tsx` | `Card` | `variant?, padding?, shadow?, hover?, className?` | Generic card container |
| `Accordion.tsx` | `Accordion` | `items[], multiple?, defaultOpen?` | Expandable content panels |
| `Tabs.tsx` | `Tabs` | `tabs[], activeTab, onChange` | Tab navigation |
| `EmptyState.tsx` | `EmptyState` | `icon?, title, description?, action?` | Empty content placeholder |
| `Avatar.tsx` | `Avatar` | `src?, name?, size?` | User avatar with fallback initials |
| `ProgressBar.tsx` | `ProgressBar` | `value, max?, variant?` | Progress indicator |
| `Breadcrumb.tsx` | `Breadcrumb` | `items[]` | Navigation breadcrumb trail |
| `Pagination.tsx` | `Pagination` | `currentPage, totalPages, onPageChange` | Page navigation |
| `Tag.tsx` | `Tag` | `variant?, removable?, onRemove?` | Removable tag/chip |

### DataTable Column Helpers (appkit/src/ui/helpers/columns/)

| File | Export | Purpose |
|------|--------|---------|
| `text-column.ts` | `textColumn(key, label, opts?)` | Plain text cell |
| `date-column.ts` | `dateColumn(key, label, opts?)` | Formatted date cell |
| `currency-column.ts` | `currencyColumn(key, label, opts?)` | INR paise → formatted cell |
| `badge-column.ts` | `badgeColumn(key, label, variantMap)` | Status badge cell |
| `image-column.ts` | `imageColumn(key, label, opts?)` | Thumbnail image cell |
| `boolean-column.ts` | `booleanColumn(key, label, opts?)` | Yes/No toggle cell |
| `actions-column.ts` | `actionsColumn(actions[])` | Row action menu cell |
| `link-column.ts` | `linkColumn(key, label, hrefFn)` | Clickable link cell |
| `checkbox-column.ts` | `checkboxColumn()` | Selection checkbox cell |
| `custom-column.ts` | `customColumn(key, label, renderFn)` | Custom render cell |
| `rating-column.ts` | `ratingColumn(key, label)` | Star rating cell |
| `user-column.ts` | `userColumn(key, label)` | Avatar + name cell |
| `progress-column.ts` | `progressColumn(key, label)` | Progress bar cell |

---

## 2. Feature View Components

### Products (appkit/src/features/products/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `ProductDetailView` | `product, store, features?, renderActions?, renderBreadcrumb?` | Full product detail page layout | `/products/[slug]`, `/stores/[slug]/products/[id]` |
| `ProductCard` | `product, onAddToCart?, onWishlist?, selectable?` | Product listing card | Grid views |
| `InteractiveProductCard` | `product, selected?, onSelect?, onQuickView?` | Card with selection + quick-view | Admin/store listings |
| `SellerProductsView` | `storeId, portal, renderToolbar?, renderBulkActions?` | Full seller product listing with tabs | `/store/products`, `/admin/products` |
| `AdminProductsView` | `renderToolbar?, renderBulkActions?, renderRowActions?` | Admin product management view | `/admin/products` |
| `ProductForm` | `initialData?, storeId?, onSubmit, mode: "create"\|"edit"` | Product create/edit form | `/store/products/new`, `/admin/products/new` |
| `ProductGrid` | `products[], cols?, gap?` | Responsive product grid | Public listing pages |
| `BaseListingCard` | `product, renderBadge?, renderActions?, Checkbox` | Base card primitive for all listing types | All marketplace cards |
| `TypeDropdown` | `value, onChange, options[]` | Listing type filter dropdown | Seller/admin listings |

### Auctions (appkit/src/features/auctions/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `AuctionDetailView` | `auction, bids[], renderActions?` | Auction detail with bid history | `/auctions/[slug]` |
| `AuctionCard` | `auction, onBid?` | Auction listing card with countdown | Grid views |
| `BidForm` | `auction, currentBid, onSubmit` | Place bid form | Auction detail |
| `BidHistory` | `bids[], productId` | Bid history table | Auction detail |
| `AuctionTimer` | `endDate, onExpire?` | Countdown timer | Auction cards/detail |

### Orders (appkit/src/features/orders/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `OrderDetailView` | `order, renderActions?, renderTimeline?` | Full order detail layout | `/user/orders/[id]`, `/store/orders/[id]`, `/admin/orders/[id]` |
| `OrderTimeline` | `events[]` | Visual status timeline | Order detail |
| `OrderSummary` | `order` | Price breakdown summary | Order detail, checkout |
| `InvoiceView` | `order, store, buyer` | Printable invoice layout | `/user/orders/[id]/invoice` |

### Cart & Checkout (appkit/src/features/cart/, checkout/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `CartView` | `cart, onUpdate?, onRemove?, renderCoupons?` | Full cart page view | `/user/cart` |
| `CartItem` | `item, onQuantityChange?, onRemove?` | Single cart item row | Cart view |
| `CartSummary` | `cart, appliedCoupons?` | Cart totals sidebar | Cart view |
| `CheckoutView` | `cart, addresses[], onPlaceOrder` | Checkout flow page | `/user/checkout` |
| `CheckoutSummary` | `items[], totals` | Checkout price summary | Checkout view |

### Reviews (appkit/src/features/reviews/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `ReviewCard` | `review, onHelpful?, onReport?` | Single review display | Review lists |
| `ReviewForm` | `productId, onSubmit` | Write review form | Product detail |
| `ReviewSummary` | `ratings, totalReviews` | Star distribution chart | Product/store detail |
| `ReviewsList` | `reviews[], pagination?` | Paginated review list | Product detail, store about |

### Stores (appkit/src/features/stores/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `StoreCard` | `store, onFollow?` | Store listing card | Stores grid |
| `StoreDetailView` | `store, renderProducts?, renderReviews?` | Store landing page | `/stores/[slug]` |
| `StoreAboutView` | `store, reviews?, renderContact?` | Store about page | `/stores/[slug]/about` |

### Categories (appkit/src/features/categories/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `CategoryCard` | `category` | Category tile card | Category grids |
| `CategoryTree` | `tree[], selected?, onSelect?` | Hierarchical tree navigation | Admin categories, filter drawer |
| `CategoryBreadcrumb` | `path[]` | Category hierarchy breadcrumb | Product detail |

### Blog (appkit/src/features/blog/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `BlogPostCard` | `post` | Blog listing card | Blog index |
| `BlogPostView` | `post, relatedPosts?` | Full blog post page | `/blog/[slug]` |
| `BlogPostForm` | `initialData?, onSubmit` | Blog post editor | `/admin/blog/new`, `/admin/blog/[id]/edit` |

### Events (appkit/src/features/events/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `EventCard` | `event` | Event listing card | Events grid |
| `EventDetailView` | `event, renderParticipate?, renderLeaderboard?` | Event detail tabs | `/events/[id]` |
| `SpinWheelView` | `prizes[], onSpin, spinning?` | Animated spin wheel | Event detail (spin type) |

### Homepage (appkit/src/features/homepage/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `HeroCarousel` | `slides[], autoplay?` | Homepage hero carousel | Homepage |
| `HomepageSection` | `section, data?` | Dynamic section renderer | Homepage |
| `WelcomeSection` | `config` | Welcome banner | Homepage |
| `FeaturedProductsSection` | `products[]` | Featured products grid | Homepage |
| `TrustIndicators` | `items[]` | Trust badges bar | Homepage |
| `CarouselEditor` | `carousel, slides[], onSave` | Admin carousel editor | `/admin/carousels/[id]` |

### Media (appkit/src/features/media/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `ImageUpload` | `value?, onChange, context, storeSlug?` | Single image upload with focal crop | Product forms |
| `MediaUploadField` | `value?, onChange, accept?, label?` | Single file upload (Upload/YouTube/External tabs) | Forms |
| `MediaUploadList` | `value?, onChange, maxItems?, multiple` | Multi-file upload list | Product image galleries |
| `MediaPreview` | `url, type?, onRemove?` | Media file preview | Upload fields |

### Forms (appkit/src/features/forms/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `FormShell` | `onSubmit, schema?, mode?, renderActions?, splitPreview?` | Form wrapper with validation + submit | All create/edit forms |
| `FormField` | `name, label, type, required?, options?` | Dynamic form field renderer | FormShell children |
| `FormSection` | `title?, description?, children` | Grouping section within form | Complex forms |

### Layout (appkit/src/features/layout/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `AppLayoutShell` | `renderTitleBar?, renderNavbar?, renderBottomNav?, renderSidebar?, contentClassName?` | Root app shell | All pages |
| `DashboardLayoutClient` | `navGroups[], renderHeader?, renderBreadcrumb?, portal` | Dashboard sidebar + content layout | Admin/store/user dashboards |
| `StackedViewShell` | `title, renderToolbar?, renderBulkActions?, renderPagination?, renderContent?, renderFilters?` | Full listing view shell with all slots | All listing pages |
| `RoleGuard` | `allowedRoles[], fallback?` | Role-based component gate | Dashboard pages |
| `SidebarCollapseToggle` | `collapsed, onToggle` | Dashboard sidebar toggle | Dashboard layout |

### Admin Views (appkit/src/features/admin/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `AdminDashboardView` | `stats, quickActions?` | Admin dashboard home | `/admin` |
| `AdminSiteSettingsView` | `settings, onSave` | 14-tab site settings editor | `/admin/site` |
| `AdminUsersView` | `renderToolbar?, renderRowActions?` | User management listing | `/admin/users` |
| `AdminStoresView` | `renderToolbar?, renderRowActions?` | Store management listing | `/admin/stores` |
| `AdminOrdersView` | `renderToolbar?, renderRowActions?` | Order management listing | `/admin/orders` |
| `AdminReviewsView` | `renderToolbar?, renderRowActions?` | Review moderation listing | `/admin/reviews` |
| `AdminEventsView` | `renderToolbar?, renderRowActions?` | Event management listing | `/admin/events` |
| `AdminBlogView` | `renderToolbar?, renderRowActions?` | Blog management listing | `/admin/blog` |
| `AdminCouponsView` | `renderToolbar?, renderRowActions?` | Coupon management listing | `/admin/coupons` |
| `AdminPayoutsView` | `renderToolbar?, renderRowActions?` | Payout management listing | `/admin/payouts` |
| `AdminFAQsView` | `renderToolbar?, renderRowActions?` | FAQ management listing | `/admin/faqs` |
| `AdminCategoriesView` | `renderToolbar?, renderRowActions?` | Category management with tree | `/admin/categories` |
| `AdminBrandsView` | `renderToolbar?, renderRowActions?` | Brand management listing | `/admin/brands` |

### Seller/Store Views (appkit/src/features/seller/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `SellerDashboardView` | `store, stats, quickActions?` | Seller dashboard home | `/store` |
| `SellerOrdersView` | `storeId, renderToolbar?, renderRowActions?` | Seller order listing | `/store/orders` |
| `SellerReviewsView` | `storeId, renderToolbar?` | Store review listing | `/store/reviews` |
| `SellerCouponsView` | `storeId, renderToolbar?` | Store coupon listing | `/store/coupons` |
| `SellerPayoutsView` | `storeId, renderToolbar?` | Payout history | `/store/payouts` |
| `SellerAnalyticsView` | `storeId` | Store analytics dashboard | `/store/analytics` |
| `StorefrontSettingsView` | `store, onSave` | Storefront customization | `/store/storefront` |

### User/Account Views (appkit/src/features/account/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `UserDashboardView` | `user, stats?` | User account dashboard | `/user` |
| `UserOrdersView` | `userId, renderToolbar?` | User order history | `/user/orders` |
| `UserWishlistView` | `userId, renderBulkActions?` | Wishlist management | `/user/wishlist` |
| `UserAddressesView` | `userId` | Address management | `/user/addresses` |
| `UserSettingsView` | `user, onSave` | Profile/password settings | `/user/settings` |
| `NotificationPreferencesPanel` | `preferences, onSave` | Per-channel notification prefs | User settings |
| `BecomeSellerView` | `user` | Seller application form | `/user/become-seller` |

### Wishlist & History (appkit/src/features/wishlist/, history/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `WishlistView` | `items[], onRemove?, onMoveToCart?, onBulkAction?` | Full wishlist page | `/user/wishlist` |
| `WishlistCapWatcher` | `itemCount, max` | Toast warning near cap | Wishlist views |
| `HistoryView` | `items[]` | Browsing history page | `/user/history` |

### Search (appkit/src/features/search/components/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `SearchView` | `results, query, renderFilters?` | Search results page | `/search` |
| `SearchOverlay` | `isOpen, onClose, onSearch` | Full-screen search modal | Navbar |
| `SearchInput` | `value, onChange, onSubmit?` | Search input with suggestions | Search overlay |

### Classified / Digital Code / Live (appkit/src/_internal/client/features/)

| Export | Props | Purpose | Used By |
|--------|-------|---------|---------|
| `ClassifiedDetailView` | `product, store` | Classified listing detail | `/classified/[slug]` |
| `DigitalCodeDetailView` | `product, store, codes?` | Digital code listing detail | `/digital-codes/[slug]` |
| `CodeRevealPanel` | `code, revealed?, onReveal?` | Theatrical code reveal animation | Digital code detail |
| `LiveItemDetailView` | `product, store, streamStatus?` | Live item listing detail | `/live/[slug]` |

---

## 3. Internal Server Features

### Data Fetchers (appkit/src/_internal/server/features/)

| Feature | Function | Signature | Purpose |
|---------|----------|-----------|---------|
| **products** | `getProductForDetail` | `(slug) => ProductDocument \| null` | Product detail page data |
| **auctions** | `getAuctionForDetail` | `(slug) => ProductDocument \| null` | Auction detail data |
| **auctions** | `getProductFeaturesForAuction` | `(auctionId) => ProductFeature[]` | Auction product features |
| **pre-orders** | `getPreOrderForDetail` | `(slug) => ProductDocument \| null` | Pre-order detail data |
| **bundles** | `getBundleForDetail` | `(slug, opts?) => CategoryDocument \| null` | Bundle detail data |
| **bundles** | `listBundleMembers` | `(bundleId) => ProductDocument[]` | Bundle member products |
| **bundles** | `listFeaturedBundles` | `() => CategoryDocument[]` | Featured bundles |
| **blog** | `getBlogPostForDetail` | `(slug) => BlogPostDocument \| null` | Blog post data |
| **brands** | `getBrandForDetail` | `(slug) => CategoryDocument \| null` | Brand detail data |
| **cart** | `getCartForUser` | `(userId) => CartDocument` | User cart data |
| **categories** | `getCategoryForDetail` | `(slug) => CategoryDocument \| null` | Category detail data |
| **categories** | `listRootCategories` | `() => CategoryDocument[]` | Root categories |
| **categories** | `getCategoryTree` | `(rootId?) => CategoryTreeNode[]` | Full category tree |
| **events** | `getEventForDetail` | `(id) => EventDocument \| null` | Event detail data |
| **history** | `getHistoryForUser` | `(userId) => HistoryDocument` | User browsing history |
| **homepage** | Homepage section fetchers | Various | Homepage data |
| **orders** | `getOrderForDetail` | `(orderId) => OrderDocument \| null` | Order detail data |
| **orders** | `getOrdersForBuyer` | `(userId, model) => SieveResult` | User order history |
| **promotions** | `getCouponByCode` | `(code) => CouponDocument \| null` | Coupon lookup |
| **reviews** | `getReviewsForProduct` | `(productId) => ReviewDocument[]` | Product reviews |
| **reviews** | `getReviewsForStore` | `(storeId) => ReviewDocument[]` | Store reviews |
| **scams** | Scam data fetchers | Various | Scam report data |
| **search** | `getSearchResults` | `(query, opts) => SearchResult` | Full-text search |
| **stores** | Store data fetchers | Various | Store detail data |
| **wishlist** | `getWishlistForUser` | `(userId) => WishlistDocument` | User wishlist |
| **classified** | Classified data fetchers | Various | Classified listing data |
| **digital-code** | Digital code data fetchers | Various | Digital code data |
| **live** | Live item data fetchers | Various | Live listing data |

### OG Image Renderers (appkit/src/_internal/server/features/*/og.tsx)

| Feature | Function | Purpose |
|---------|----------|---------|
| products | `renderProductOgImage(doc, opts?)` | Product OG image |
| auctions | `renderAuctionOgImage(doc, opts?)` | Auction OG image |
| pre-orders | `renderPreOrderOgImage(doc, opts?)` | Pre-order OG image |
| bundles | `renderBundleOgImage(doc, opts?)` | Bundle OG image |
| blog | `renderBlogOgImage(doc, opts?)` | Blog post OG image |
| brands | `renderBrandOgImage(doc, opts?)` | Brand OG image |
| events | `renderEventOgImage(doc, opts?)` | Event OG image |
| reviews | `renderReviewOgImage(doc, opts?)` | Review OG image |
| scams | `renderScamOgImage(doc, opts?)` | Scam report OG image |
| stores | `renderStoreOgImage(doc, opts?)` | Store OG image |
| profile | `renderUserProfileOgImage(doc, opts?)` | User profile OG image |
| faqs | `renderFaqOgImage(doc, opts?)` | FAQ OG image |
| seo | `buildDefaultOgImage(opts?)` | Default fallback OG image |

### Metadata Builders

| Feature | Function | Purpose |
|---------|----------|---------|
| bundles | `buildBundleMetadata(doc, opts?)` | Bundle page Metadata |
| classified | Classified metadata | Classified page Metadata |
| digital-code | Digital code metadata | Digital code page Metadata |
| live | Live item metadata | Live item page Metadata |
| seo | `buildRobots(opts?)` | robots.txt |
| seo | `buildManifest(opts?)` | PWA manifest.json |
| seo | `buildSitemap(opts?)` | XML sitemap |

### Service/Validation Functions

| Feature | Function | Purpose |
|---------|----------|---------|
| auctions | `assertAuctionActive`, `assertBidAmount`, `computeMinBid`, `shouldAutoExtend` | Auction business logic |
| blog | `assertBlogPostExists`, `computeReadTime` | Blog validation |
| brands | `assertBrandExists`, `assertBrandSlugUnique` | Brand validation |
| cart | `assertCartCapacity`, `upsertCartItem`, `mergeGuestItems` | Cart operations |
| events | `assertEventActive`, `isEventAcceptingRegistrations` | Event validation |
| orders | `assertOrderOwnership`, `assertOrderCancellable` | Order validation |
| pre-orders | `assertPreOrderAvailable`, `computeDeposit`, `isPreOrderOpen` | Pre-order logic |
| promotions | `validateCoupon`, `computeDiscount` | Coupon validation |
| reviews | Review validation | Review business logic |
| payments | `resolvePaymentFee` | Payment fee calculation |

---

## 4. Internal Client Features

| File | Export | Type | Purpose |
|------|--------|------|---------|
| `layout/DashboardLayoutClient.tsx` | `DashboardLayoutClient` | Component | Dashboard layout with responsive sidebar |
| `layout/RoleGuard.tsx` | `RoleGuard` | Component | Role-based access control wrapper |
| `layout/SidebarCollapseToggle.tsx` | `SidebarCollapseToggle` | Component | Sidebar collapse toggle button |
| `layout/filterNavItems.ts` | `filterNavItems<T>` | Function | Generic nav item filter utility |
| `filters/filter-load-options.ts` | `makeCategoryLoadOptions`, `makeBrandLoadOptions`, `makeStoreLoadOptions`, `makeProductLoadOptions`, `makeUserLoadOptions`, `makeAddressLoadOptions` | Functions | Dynamic select option loaders for filters |
| `classified/ClassifiedDetailView.tsx` | `ClassifiedDetailView` | Component | Classified listing detail view |
| `digital-code/CodeRevealPanel.tsx` | `CodeRevealPanel` | Component | Digital code reveal panel |
| `digital-code/DigitalCodeDetailView.tsx` | `DigitalCodeDetailView` | Component | Digital code detail view |
| `live/LiveItemDetailView.tsx` | `LiveItemDetailView` | Component | Live item detail view |
| `i18n/LabelsProvider.tsx` | `LabelsProvider`, `useLabels<K>` | Component + Hook | i18n label provider and accessor |
| `scaffolds/AppShell.tsx` | `AppShell` | Component | Root app shell scaffold |
| `scaffolds/DashboardScaffold.tsx` | `DashboardScaffold` | Component | Dashboard scaffold |

---

## 5. Internal Shared

### Error Classes (appkit/src/_internal/shared/errors/)

| Export | Extends | Purpose |
|--------|---------|---------|
| `AppkitError` | `Error` | Base error class |
| `NotFoundError` | `AppkitError` | 404 resource not found |
| `ValidationError` | `AppkitError` | 400 input validation failed |
| `UnauthorizedError` | `AppkitError` | 401/403 access denied |
| `ConflictError` | `AppkitError` | 409 state conflict |
| `CapacityError` | `AppkitError` | 429 capacity/rate limit |
| `ExpiredError` | `AppkitError` | 410 resource expired |

### Feature-Specific Errors

| Feature | Error Classes |
|---------|--------------|
| auctions | `AuctionNotFoundError`, `AuctionEndedError`, `BidTooLowError`, `BidOnOwnAuctionError`, `AuctionReserveNotMetError` |
| blog | `BlogPostNotFoundError`, `BlogPostNotPublishedError`, `BlogSlugConflictError` |
| brands | `BrandNotFoundError`, `BrandSlugConflictError` |
| cart | `CartFullError`, `CartItemNotFoundError`, `CartQuantityError` |
| events | `EventNotFoundError`, `EventNotActiveError`, `EventEndedError`, `EventFullError`, `AlreadyRegisteredError` |
| orders | `OrderNotFoundError`, `OrderCancelError`, `OrderOwnershipError`, `OrderReturnWindowError` |
| pre-orders | `PreOrderNotFoundError`, `PreOrderSoldOutError`, `PreOrderNotOpenError`, `PreOrderDepositError` |
| products | `ProductNotFoundError`, `ProductValidationError`, `ProductOwnershipError`, `ProductStatusError`, `ProductStockError` |
| promotions | `CouponNotFoundError`, `CouponExpiredError`, `CouponUsageLimitError`, `CouponPerUserLimitError`, `CouponMinPurchaseError`, `CouponScopeError` |
| reviews | `ReviewNotFoundError`, `DuplicateReviewError`, `ReviewOwnershipError`, `ReviewNotVerifiedError` |
| wishlist | `WishlistCapError` |

### Checkout Rules (appkit/src/_internal/shared/checkout/rules/)

| Export | Type | Purpose |
|--------|------|---------|
| `CHECKOUT_RULES` | Registry | Per-listing-type checkout rules |
| `CATEGORY_CHECKOUT_RULES` | Registry | Per-category checkout overrides |
| `getListingRule(type)` | Function | Look up listing rule |
| `getCategoryRule(category)` | Function | Look up category rule |
| `pickOrderType(items)` | Function | Determine order type from items |
| `getSplitKey(item)` | Function | Get cart-split key |
| `runSyncPreflight(items)` | Function | Pre-checkout validation |
| `standardRule` | Rule | Standard product checkout |
| `auctionRule` | Rule | Auction checkout |
| `preOrderRule` | Rule | Pre-order checkout |
| `prizeDrawRule` | Rule | Prize draw checkout |
| `offerRule` | Rule | Offer/negotiation checkout |
| `bundleRule` | Rule | Bundle checkout |
| `classifiedRule` | Rule | Classified checkout |
| `digitalCodeRule` | Rule | Digital code checkout |
| `liveRule` | Rule | Live item checkout |

### Checkout Limits

| Constant | Value | Purpose |
|----------|-------|---------|
| `CART_MAX_ITEMS` | 50 | Max items in cart |
| `CHECKOUT_MAX_ORDERS_PER_TX` | 5 | Max orders per checkout |
| `PRIZE_DRAW_MAX_REVEALS_PER_ORDER` | 10 | Max prize reveals |
| `BUNDLE_MAX_QTY_PER_TX` | 3 | Max bundles per checkout |
| `STANDARD_MAX_QTY_PER_LINE` | 10 | Max qty per line item |

### Listing Type System (appkit/src/_internal/shared/listing-types/)

| Export | Type | Purpose |
|--------|------|---------|
| `LISTING_TYPE_REGISTRY` | Registry | All listing type plugins |
| `pluginFor(type)` | Function | Get plugin for listing type |
| `LISTING_TYPE_CAPABILITIES` | Map | Capability matrix per type |
| `capabilityFor(type)` | Function | Get capabilities for type |
| `canAddToCart(type)` | Function | Check cart eligibility |
| `canBid(type)` | Function | Check bid eligibility |
| `supportsShipping(type)` | Function | Check shipping support |
| `hasInstantFulfillment(type)` | Function | Check instant fulfillment |
| `isListingTypeEnabled(type)` | Function | Feature flag check |
| `cartRequiresShipping(items)` | Function | Check if cart needs shipping |
| `cartIsDigitalOnly(items)` | Function | Check if cart is all-digital |

### Feature Configs (appkit/src/_internal/shared/features/*/config.ts)

| Feature | Key Constants |
|---------|--------------|
| auctions | `AUCTIONS_PAGE_SIZE`, `AUCTION_DEFAULT_EXTENSION_MINUTES`, `AUCTION_MIN_BID_INCREMENT_PAISE`, `AUCTION_SNIPING_WINDOW_SECONDS` |
| blog | `BLOG_PAGE_SIZE`, `BLOG_FEATURED_LIMIT`, `BLOG_RELATED_LIMIT` |
| brands | `BRANDS_PAGE_SIZE`, `BRANDS_FEATURED_LIMIT` |
| cart | `CART_MAX_ITEMS=50`, `CART_SESSION_TTL_DAYS`, `CART_GUEST_STORAGE_KEY` |
| categories | `CATEGORIES_PAGE_SIZE`, `CATEGORIES_MAX_DEPTH`, `CATEGORIES_FEATURED_LIMIT` |
| checkout | `CHECKOUT_DEFAULT_COMMISSIONS`, `CHECKOUT_PAYMENT_METHODS` |
| events | `EVENTS_PAGE_SIZE`, `EVENT_MAX_ENTRIES_DEFAULT` |
| history | `HISTORY_MAX=50`, `HISTORY_GUEST_STORAGE_KEY` |
| homepage | `HOMEPAGE_MAX_SECTIONS`, `HOMEPAGE_FEATURED_REVIEWS_LIMIT` |
| layout | `SIDE_DRAWER_WIDTH`, `DASHBOARD_SIDEBAR_WIDTH`, `DASHBOARD_ACCENT_CLASSES` |
| orders | `ORDERS_PAGE_SIZE`, `ORDER_CANCELLABLE_STATUSES`, `ORDER_RETURN_WINDOW_DAYS` |
| payments | `PAYMENTS_DEFAULT_PLATFORM_FEE_PERCENT`, `PAYMENTS_DEFAULT_GST_PERCENT` |
| pre-orders | `PRE_ORDERS_PAGE_SIZE`, `PRE_ORDER_DEFAULT_DEPOSIT_PERCENT` |
| products | `PRODUCTS_PAGE_SIZE`, `PRODUCTS_FEATURED_LIMIT`, `PRODUCTS_RELATED_LIMIT` |
| promotions | `COUPONS_PAGE_SIZE`, `COUPON_CODE_PATTERN` |
| reviews | `REVIEWS_PAGE_SIZE`, `REVIEW_BODY_MAX_LENGTH`, `REVIEW_MAX_RATING=5` |
| stores | `STORES_PAGE_SIZE`, `STORES_PRODUCTS_PAGE_SIZE` |
| wishlist | `WISHLIST_MAX=20`, `WISHLIST_GUEST_STORAGE_KEY` |
| bundles | `BUNDLE_MIN_ITEMS`, `BUNDLE_MAX_ITEMS`, `BUNDLES_PAGE_SIZE` |

### Serialization

| Export | Purpose |
|--------|---------|
| `toClient<T>(doc)` | Firestore doc → client-safe shape (strips server fields) |
| `clientInitial<T>(doc)` | Server data → initial client state |

### Media Limits

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_IMAGE_BYTES` | 10 MB | Max image upload size |
| `MAX_PDF_BYTES` | 20 MB | Max PDF upload size |
| `MAX_VIDEO_BYTES` | 100 MB | Max video upload size |
| `ALLOWED_IMAGE_MIMES` | jpg, png, webp, gif, avif | Accepted image types |
| `ALLOWED_VIDEO_MIMES` | mp4, webm | Accepted video types |
| `classifyMime(mime)` | — | Returns "image"/"video"/"document" |
| `isAllowedMime(mime)` | — | Validates MIME type |

---

## 6. Repositories

### Repository Classes (appkit/src/repositories/)

| Repository | Collection | Key Methods | Instance |
|------------|-----------|-------------|----------|
| **UserRepository** | `users` | `findByUid`, `findByEmail`, `findByPhone`, `findByRole`, `create`, `createWithId`, `update`, `updateRole`, `updateProfile`, `markEmailAsVerified`, `disable`, `enable`, `countByRole`, `list`, `listSellers` | `userRepository` |
| **ProductsRepository** | `products` | `findById` (cached), `findBySlug` (cached), `findByStore`, `findByCategory`, `findFeatured`, `findAuctions`, `findPreOrders`, `list`, `create`, `update`, `delete`, `updateAvailableQuantity`, `updateBid`, `incrementViewCount`, `startGroup`, `dissolveGroup`, `linkChildToGroup`, `getPublishedIds` | `productRepository` |
| **OrdersRepository** | `orders` | `create`, `findByUser`, `findByProduct`, `findByStatus`, `updateStatus`, `updatePaymentStatus`, `cancelOrder`, `hasUserPurchased`, `listForSeller`, `listForUser`, `listAll`, `postRefundEvent`, `createFromAuction` | `orderRepository` |
| **StoreRepository** | `stores` | `findBySlug`, `findByOwnerId`, `create`, `update`, `updateStore`, `setStatus`, `listStores`, `listAllStores`, `incrementTotalProducts`, `incrementItemsSold`, `setStats`, `isSlugAvailable`, `changeSlug`, `listIds` | `storeRepository` |
| **ReviewsRepository** | `reviews` | `create`, `update`, `findByProduct`, `findApprovedByProduct`, `findApprovedByStore`, `findByUser`, `approve`, `reject`, `getAverageRating`, `getRatingDistribution`, `listForProduct`, `listForStore`, `listAll` | `reviewRepository` |
| **BidRepository** | `bids` | `create`, `findByProduct`, `findByUser`, `findHighestBid`, `findWinningBid`, `setWinningBid`, `endAuction`, `cancelProductBids`, `list` | `bidRepository` |
| **CartRepository** | `carts` | `findByUserId`, `getOrCreate`, `addItem`, `updateItem`, `removeItem`, `clearCart`, `addCoupon`, `removeCoupon`, `setSelectedItems` | `cartRepository` |
| **AddressesRepository** | `addresses` | `createWithId` (PII encrypted), `update`, `listByOwner`, `countByOwner`, `createForOwner`, `deleteForOwner`, `setDefault`, `deleteAllForOwner` | `addressesRepository` |
| **CategoriesRepository** | `categories` | `list`, `createWithHierarchy`, `getCategoryBySlug`, `getRootCategories`, `getLeafCategories`, `getCategoriesByTier`, `getChildren`, `getFeaturedCategories`, `getBrandCategories`, `buildTree`, `listByType`, `findBySlugAndType`, `findActiveBrands` | `categoriesRepository` |
| **CouponsRepository** | `coupons` | `create`, `getCouponByCode`, `getActiveCoupons`, `validateCoupon`, `applyCoupon`, `getUserCouponUsageCount`, `getStoreCoupons`, `validateCouponForCart`, `list` | `couponsRepository` |
| **FAQsRepository** | `faqs` | `create`, `update`, `list`, `getFAQBySlug`, `getFAQsByCategory`, `getHomepageFAQs`, `getPinnedFAQs`, `searchByTag`, `getMostHelpful`, `incrementViews`, `markHelpful` | `faqsRepository` |
| **BlogRepository** | `blogPosts` | `create`, `update`, `delete`, `findBySlug`, `incrementViews`, `findRelated`, `listPublished`, `listAll` | `blogRepository` |
| **EventsRepository** | `events` | `list`, `listActive`, `createEvent`, `updateEvent`, `changeStatus`, `incrementTotalEntries`, `incrementApprovedEntries` | `eventRepository` |
| **CarouselsRepository** | `carousels` | `create`, `listCarousels`, `createCarousel`, `updateCarousel`, `addSlide`, `removeSlide`, `reorderSlides`, `getCarouselWithSlides` | `carouselsRepository` |
| **SessionRepository** | `sessions` | `list`, `listForUser`, `createSession`, `updateActivity`, `revokeSession`, `revokeAllUserSessions`, `findActiveByUser`, `cleanupExpiredSessions`, `getStats` | `sessionRepository` |
| **GroupedListingsRepository** | `groupedListings` | `findById`, `listByStore` | `groupedListingsRepository` |
| **TokenRepository** | `emailVerificationTokens` + `passwordResetTokens` | `findByToken`, `findByUserId`, `findByEmail`, `create`, `deleteExpired`, `markAsUsed` (password only) | `tokenRepository` |
| **SmsCounterRepository** | `smsCounters` | SMS rate limiting | `smsCounterRepository` |

### Exported Facade

| Export | Purpose |
|--------|---------|
| `unitOfWork` | Atomic multi-collection transaction facade |

---

## 7. Hooks

### State & UI Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useUrlTable(config)` | `appkit/src/ui/hooks/useUrlTable.ts` | URL-synced table state (filters, sort, page, search) |
| `useMediaQuery(query)` | `appkit/src/ui/hooks/useMediaQuery.ts` | CSS media query listener |
| `useClickOutside(ref, handler)` | `appkit/src/ui/hooks/useClickOutside.ts` | Click-outside detection |
| `useDebounce(value, delay)` | `appkit/src/ui/hooks/useDebounce.ts` | Value debouncing |
| `useThrottle(value, delay)` | `appkit/src/ui/hooks/useThrottle.ts` | Value throttling |
| `useLocalStorage(key, initial)` | `appkit/src/ui/hooks/useLocalStorage.ts` | Persistent local storage state |
| `useKeyboardShortcut(key, handler)` | `appkit/src/ui/hooks/useKeyboardShortcut.ts` | Keyboard shortcut binding |
| `useIntersectionObserver(ref, opts)` | `appkit/src/ui/hooks/useIntersectionObserver.ts` | Viewport intersection detection |
| `useLongPress(callback, opts)` | `appkit/src/ui/hooks/useLongPress.ts` | Long-press gesture detection |
| `useScrollDirection()` | `appkit/src/ui/hooks/useScrollDirection.ts` | Scroll up/down detection |

### Feature Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth()` | `appkit/src/features/auth/hooks/useAuth.ts` | Auth state + login/logout/signup |
| `useCart()` | `appkit/src/features/cart/hooks/useCart.ts` | Cart state + CRUD operations |
| `useWishlist()` | `appkit/src/features/wishlist/hooks/useWishlist.ts` | Wishlist state + add/remove |
| `useHistory()` | `appkit/src/features/history/hooks/useHistory.ts` | Browsing history tracking |
| `useSearch(query)` | `appkit/src/features/search/hooks/useSearch.ts` | Search with debounced results |
| `useNotifications()` | `appkit/src/features/notifications/hooks/useNotifications.ts` | Notification state + mark-read |
| `useMessages()` | `appkit/src/features/messages/hooks/useMessages.ts` | Chat message polling |
| `useStore()` | `appkit/src/features/stores/hooks/useStore.ts` | Current store context |
| `useToast()` | `appkit/src/ui/hooks/useToast.ts` | Toast notification dispatch |
| `useConfirm()` | `appkit/src/ui/hooks/useConfirm.ts` | Confirmation dialog promise |
| `useSideDrawer()` | `appkit/src/ui/hooks/useSideDrawer.ts` | Side drawer open/close state |
| `useFilterDrawer()` | `appkit/src/features/products/hooks/useFilterDrawer.ts` | Filter drawer state |
| `useBidding(auctionId)` | `appkit/src/features/auctions/hooks/useBidding.ts` | Auction bidding state |
| `useCheckout()` | `appkit/src/features/checkout/hooks/useCheckout.ts` | Checkout flow state |

---

## 8. Server Actions

### Product Actions (appkit/src/_internal/server/features/)

| Action | Feature | Purpose |
|--------|---------|---------|
| `placeBidAction` | auctions | Place auction bid |
| `reservePreOrderAction` | pre-orders | Reserve pre-order item |
| `addToCartAction` | cart | Add item to cart |
| `removeFromCartAction` | cart | Remove item from cart |
| `clearCartAction` | cart | Clear all cart items |
| `mergeGuestCartAction` | cart | Merge guest cart on login |
| `createCheckoutOrderAction` | checkout | Create order from checkout |
| `attachPaymentAction` | checkout | Attach payment to order |
| `verifyAndPlaceRazorpayOrderAction` | checkout | Verify Razorpay payment |
| `addBundleToCartAction` | bundles | Add bundle to cart |

### Content Actions

| Action | Feature | Purpose |
|--------|---------|---------|
| `createBlogPostAction` | blog | Create blog post |
| `updateBlogPostAction` | blog | Update blog post |
| `deleteBlogPostAction` | blog | Delete blog post |
| `publishBlogPostAction` | blog | Publish draft post |
| `unpublishBlogPostAction` | blog | Unpublish post |
| `createBrandAction` | brands | Create brand |
| `updateBrandAction` | brands | Update brand |
| `deleteBrandAction` | brands | Delete brand |
| `toggleBrandActiveAction` | brands | Toggle brand active state |

### User Actions

| Action | Feature | Purpose |
|--------|---------|---------|
| `cancelOrderAction` | orders | Cancel user order |
| `requestReturnAction` | orders | Request order return |
| `updateOrderStatusAction` | orders | Update order status (admin/seller) |
| `trackProductViewAction` | history | Track product page view |
| `mergeGuestHistoryAction` | history | Merge guest history on login |
| `applyCouponAction` | promotions | Apply coupon to cart |
| `createCouponAction` | promotions | Create coupon (admin/seller) |
| `updateCouponAction` | promotions | Update coupon |
| `deactivateCouponAction` | promotions | Deactivate coupon |
| `searchAction` | search | Execute search |
| Wishlist actions | wishlist | Add/remove wishlist items |
| Message actions | messages | Send/manage messages |
| Auth actions | auth | Login, logout, signup |
| Account actions | account | Profile updates |
| Site settings actions | site-settings | Admin config updates |
| Payout actions | payouts | Payout operations |
| Refund actions | refunds | Refund processing |
| Raffle actions | raffle | Raffle trigger/spin |
| `triggerEventRaffleAction` | raffle | Trigger event raffle draw |
| `assignSpinPrizeAction` | raffle | Assign spin wheel prize |

---

## 9. API Routes

### Auth Routes (src/app/api/auth/)

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | Session logout |
| `/api/auth/forgot-password` | POST | Password reset request |
| `/api/auth/reset-password` | POST | Password reset execution |
| `/api/auth/verify-email` | POST | Email verification |
| `/api/auth/google` | POST | Google OAuth callback |
| `/api/auth/session` | GET | Session validation |
| `/api/auth/refresh` | POST | Session refresh |

### Product Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/products` | GET, POST | List/create products |
| `/api/products/[id]` | GET, PUT, DELETE | Product CRUD |
| `/api/products/featured` | GET | Featured products |
| `/api/products/search` | GET | Product search |
| `/api/auctions` | GET, POST | List/create auctions |
| `/api/auctions/[id]` | GET, PUT, DELETE | Auction CRUD |
| `/api/auctions/[id]/bids` | GET, POST | Auction bids |

### Store Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/store/products` | GET, POST | Store product management |
| `/api/store/products/[id]` | GET, PUT, DELETE | Store product CRUD |
| `/api/store/orders` | GET | Store order listing |
| `/api/store/orders/[id]` | GET, PATCH | Store order management |
| `/api/store/coupons` | GET, POST | Store coupon management |
| `/api/store/coupons/[id]` | GET, PUT, DELETE | Store coupon CRUD |
| `/api/store/reviews` | GET | Store review listing |
| `/api/store/payouts` | GET, POST | Payout management |
| `/api/store/analytics` | GET | Store analytics |
| `/api/store/shipping` | GET, PUT | Shipping config |
| `/api/store/addresses` | GET, POST | Store addresses |
| `/api/store/whatsapp/catalog` | POST | WhatsApp catalog sync |
| `/api/store/whatsapp/import` | POST | WhatsApp catalog import |
| `/api/store/offers` | GET | Offer management |
| `/api/store/offers/[id]` | PUT | Accept/reject offer |

### Admin Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/users` | GET | User listing |
| `/api/admin/users/[id]` | GET, PUT, DELETE | User management |
| `/api/admin/stores` | GET | Store listing |
| `/api/admin/stores/[id]` | PUT | Store verification/suspension |
| `/api/admin/products` | GET | Product listing |
| `/api/admin/products/[id]` | PUT | Product approval/rejection |
| `/api/admin/orders` | GET | Order listing |
| `/api/admin/orders/[id]` | PUT | Order status management |
| `/api/admin/reviews` | GET | Review moderation |
| `/api/admin/reviews/[id]` | PUT | Approve/reject review |
| `/api/admin/events` | GET, POST | Event management |
| `/api/admin/events/[id]` | GET, PUT, DELETE | Event CRUD |
| `/api/admin/events/[id]/trigger-raffle` | POST | Trigger event raffle |
| `/api/admin/payouts` | GET | Payout listing |
| `/api/admin/payouts/[id]` | PUT | Grant/hold payout |
| `/api/admin/payouts/[id]/deduction` | POST | Manual refund deduction |
| `/api/admin/blog` | GET, POST | Blog management |
| `/api/admin/blog/[id]` | GET, PUT, DELETE | Blog post CRUD |
| `/api/admin/coupons` | GET, POST | Coupon management |
| `/api/admin/coupons/[id]` | GET, PUT, DELETE | Coupon CRUD |
| `/api/admin/categories` | GET, POST | Category management |
| `/api/admin/categories/[id]` | GET, PUT, DELETE | Category CRUD |
| `/api/admin/brands` | GET, POST | Brand management |
| `/api/admin/brands/[id]` | GET, PUT, DELETE | Brand CRUD |
| `/api/admin/faqs` | GET, POST | FAQ management |
| `/api/admin/faqs/[id]` | GET, PUT, DELETE | FAQ CRUD |
| `/api/admin/site-settings` | GET, PUT | Site settings |
| `/api/admin/carousels` | GET, POST | Carousel management |
| `/api/admin/carousels/[id]` | GET, PUT, DELETE | Carousel CRUD |
| `/api/admin/sessions` | GET | Session listing |
| `/api/admin/sessions/[id]` | DELETE | Session revocation |
| `/api/admin/notifications` | GET | Notification listing |

### User Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/user/cart` | GET, POST, PUT, DELETE | Cart operations |
| `/api/user/wishlist` | GET, POST, DELETE | Wishlist operations |
| `/api/user/history` | GET | Browsing history |
| `/api/user/history/merge` | POST | Merge guest history |
| `/api/user/orders` | GET | Order history |
| `/api/user/orders/[id]` | GET | Order detail |
| `/api/user/addresses` | GET, POST | Address management |
| `/api/user/addresses/[id]` | PUT, DELETE | Address CRUD |
| `/api/user/profile` | GET, PUT | Profile management |
| `/api/user/notifications` | GET | User notifications |
| `/api/user/messages` | GET | User messages |
| `/api/user/claimed-coupons` | GET, POST | Claimed coupons |
| `/api/user/offers` | GET | User offers |
| `/api/user/bids` | GET | User bid history |

### Media Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/media/sign` | POST | Generate signed upload URL |
| `/api/media/finalize` | POST | Validate + stamp uploaded file |
| `/api/media/[...slug]` | GET | Proxy + watermark media files |
| `/api/media/ext` | GET | External image proxy |

### Public Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/products` | GET | Public product listing |
| `/api/categories` | GET | Public category listing |
| `/api/brands` | GET | Public brand listing |
| `/api/stores` | GET | Public store listing |
| `/api/events` | GET | Public event listing |
| `/api/events/[id]/spin` | POST | Spin wheel endpoint |
| `/api/reviews` | GET | Public review listing |
| `/api/search` | GET | Public search |
| `/api/newsletter` | POST | Newsletter signup |
| `/api/contact` | POST | Contact form |

### Demo Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/demo/seed` | GET, POST | Seed data status + load/delete |

---

## 10. Constants

### Consumer App Constants (src/constants/)

| File | Export | Purpose |
|------|--------|---------|
| `api.ts` | `API_ROUTES` | All API endpoint strings (AUTH, PRODUCTS, ORDERS, STORE, ADMIN, etc.) |
| `api-roles.ts` | `USER_ROLE`, `ROLES_ADMIN_ONLY`, `ROLES_ADMIN_MOD`, `ROLES_TRUST_SAFETY`, `ROLES_STORE_WRITE`, `ROLES_STORE_READ`, `ROLES_ANY_STAFF` | Role tuple presets for route handlers |
| `brand.ts` | `BRAND` (NAME, SHORT_NAME, DESCRIPTION, SOCIAL_URLS), `getBrandCopyright(year)` | Brand identity constants |
| `config.ts` | `BUSINESS_DAY_CONFIG`, `TOKEN_CONFIG`, `PASSWORD_CONFIG`, `VALIDATION_CONFIG`, `API_CONFIG`, `PAGINATION_CONFIG`, `FILE_UPLOAD_CONFIG`, `LOCALE_CONFIG` | Application configuration |
| `dashboard-tabs.ts` | `STORE_LISTINGS_TABS`, `STORE_ORDERS_TABS`, `ADMIN_PRODUCTS_TABS`, `ADMIN_ORDERS_TABS`, `USER_ORDERS_TABS` + 7 more | Dashboard tab presets per role |
| `faq.ts` | `FAQ_CATEGORIES` (7 categories) | FAQ categorization |
| `field-names.ts` | Re-exports 30+ field-name constants from appkit | Canonical field name strings |
| `footer.tsx` | `FOOTER_TRUST_BAR_ITEMS`, `FOOTER_SOCIAL_LINKS`, `FOOTER_BOTTOM_LINKS` | Footer layout data |
| `homepage-data.ts` | `TRUST_INDICATORS`, `TRUST_FEATURES`, `SITE_FEATURES` | Homepage section data |
| `languages.ts` | `SUPPORTED_LANGUAGES` (13), `LANGUAGES_PAGE_SIZE` | i18n language list |
| `navigation.tsx` | `MAIN_NAV_ITEMS` (12), `SIDEBAR_SUPPORT_LINKS`, `FOOTER_LINK_GROUPS`, `ADMIN_NAV_GROUPS`, `STORE_NAV_GROUPS`, `USER_NAV_GROUPS`, `getUserNavGroups(role)` | All navigation structures |
| `routes.ts` | `ROUTES` (re-export from appkit) | All page path constants |
| `search.ts` | `SEARCH_LABELS` | Search overlay strings |
| `seo.ts` | `SEO_CONFIG` | Default SEO metadata |
| `seo.server.ts` | `generateMetadata()`, `generateProductMetadata()`, `generateCategoryMetadata()`, `generateBlogMetadata()` + 3 more | Server-side metadata generators |
| `theme.ts` | `THEME_CONSTANTS` | Extended design system with brand overrides |
| `tickets.ts` | `TICKET_CATEGORIES` (8), `TICKET_STATUSES` (5) | Support ticket config |

---

## 11. Types & Interfaces

### Core Document Types (appkit/src/features/*/schemas/firestore.ts)

| Type | Collection | Key Fields |
|------|-----------|------------|
| `UserDocument` | users | id, email, displayName, role, stats, photoURL |
| `ProductDocument` | products | id, title, slug, storeId, price, listingType, status, images[] |
| `OrderDocument` | orders | id, buyerId, storeId, items[], totalAmount, status, paymentStatus |
| `StoreDocument` | stores | id, ownerId, storeName, status, isVerified, shippingConfig |
| `ReviewDocument` | reviews | id, productId, buyerId, rating, title, body, status |
| `BidDocument` | bids | id, productId, bidderId, amount, status |
| `CartDocument` | carts | id, userId, items[], appliedCoupons |
| `CategoryDocument` | categories | id, name, slug, categoryType, parentId, tier, metrics |
| `CouponDocument` | coupons | id, code, type, scope, discount, validity, usage |
| `FAQDocument` | faqs | id, question, answer, category, seo, stats |
| `BlogPostDocument` | blogPosts | id, title, slug, content, category, status |
| `EventDocument` | events | id, title, type, status, startsAt, endsAt, raffle fields |
| `EventEntryDocument` | eventEntries | id, eventId, userId, status, spin fields |
| `AddressDocument` | addresses | id, ownerType, ownerId, fullName, phone, city, state |
| `SessionDocument` | sessions | id, userId, isActive, expiresAt, deviceInfo |
| `NotificationDocument` | notifications | id, userId, type, title, body, isRead |
| `PayoutDocument` | payouts | id, storeId, sellerId, amount, status |
| `WishlistDocument` | wishlists | id, userId, items[] (max 20) |
| `HistoryDocument` | history | id, userId, items[] (max 50) |
| `CarouselDocument` | carousels | id, name, slideIds[], status |
| `CarouselSlideDocument` | carouselSlides | id, title, background, cards[], settings |
| `HomepageSectionDocument` | homepageSections | id, type, order, enabled, config |
| `SiteSettingsDocument` | siteSettings | Singleton — branding, fees, integrations, shipping |
| `ConversationDocument` | conversations | id, participants[], lastMessage, lastMessageAt |
| `ScammerDocument` | scammerProfiles | id, displayNames[], reports[], flags |
| `SupportTicketDocument` | supportTickets | id, subject, category, status, priority, messages[] |

### Layout Types

| Type | Purpose |
|------|---------|
| `SidebarNavItem` | Navigation item with icon, label, href |
| `SidebarNavGroup` | Group of nav items with title |
| `MainNavItem` | Top navbar item |
| `BrandingConfig` | Site branding configuration |
| `FooterConfig` | Footer layout configuration |
| `LayoutConfig` | Full layout configuration |
| `DashboardLayoutConfig` | Dashboard-specific layout config |

### Action Types

| Type | Purpose |
|------|---------|
| `ActionDef` | Action definition: label, kind, permissions, confirmation |
| `ActionConfirmation` | Confirmation dialog config: title, body, confirmLabel |
| `ActionKind` | `"primary"\|"secondary"\|"danger"\|"ghost"` |
| `ActionResource` | Resource bucket identifier |
| `ActionTree` | Full action registry tree type |

---

## 12. Utils & Helpers

### String Utilities (appkit/src/utils/string.formatter.ts)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `capitalize` | `(str) => string` | First letter uppercase |
| `capitalizeWords` | `(str) => string` | Each word capitalized |
| `truncate` | `(str, maxLength, suffix?) => string` | Truncate with ellipsis |
| `stripHtml` | `(html) => string` | Remove HTML tags |
| `escapeHtml` | `(str) => string` | XSS-safe escape |
| `slugify` | `(str) => string` | URL-safe slug |
| `maskString` | `(str, start?, end?, char?) => string` | Mask sensitive data |
| `randomString` | `(length?) => string` | Random alphanumeric |
| `proseMirrorToHtml` | `(json) => string` | TipTap JSON → HTML |
| `normalizeRichTextHtml` | `(value) => string` | Any rich text → HTML |

### Number Utilities (appkit/src/utils/number.formatter.ts)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `formatCurrency` | `(amount, currency?, locale?) => string` | Currency formatting |
| `formatNumber` | `(num, locale?, opts?) => string` | Number formatting |
| `formatPercentage` | `(num, decimals?) => string` | Percentage formatting |
| `formatFileSize` | `(bytes) => string` | File size formatting |
| `formatCompactNumber` | `(num) => string` | Compact: 1.5K, 2.3M |
| `formatOrdinal` | `(num) => string` | Ordinal: 1st, 2nd |

### Date Utilities (appkit/src/utils/date.formatter.ts)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `resolveDate` | `(value) => Date \| null` | Coerce any → Date |
| `formatDate` | `(date, format, locale?) => string` | Date formatting |
| `formatDateTime` | `(date, format, locale?) => string` | Date+time formatting |
| `formatRelativeTime` | `(date) => string` | "X minutes ago" |
| `isToday` / `isPast` / `isFuture` | `(date) => boolean` | Date comparison |
| `nowISO` | `() => string` | Current ISO string |

### Array Utilities (appkit/src/utils/array.helper.ts)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `groupBy` | `(array, key) => Record<string, T[]>` | Group by field |
| `unique` | `(array) => T[]` | Deduplicate |
| `uniqueBy` | `(array, key) => T[]` | Deduplicate by field |
| `sortBy` | `(array, key, order) => T[]` | Sort by field |
| `chunk` | `(array, size) => T[][]` | Split into chunks |
| `paginate` | `(array, page, perPage) => PaginationResult` | In-memory pagination |

### Object Utilities (appkit/src/utils/object.helper.ts)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `deepMerge` | `(target, source) => T` | Deep recursive merge |
| `pick` | `(obj, keys) => Pick<T, K>` | Select keys |
| `omit` | `(obj, keys) => Omit<T, K>` | Exclude keys |
| `deepClone` | `(obj) => T` | Deep clone |
| `isEqual` | `(a, b) => boolean` | Deep equality |
| `cleanObject` | `(obj, opts?) => Partial<T>` | Remove null/undefined |

### ID Generators (appkit/src/utils/id-generators.ts)

| Function | Format | Purpose |
|----------|--------|---------|
| `generateProductId` | `product-{name}-{category}-{condition}-{seller}-{n}` | Product slug |
| `generateAuctionId` | `auction-{name}-{category}-{condition}-{seller}-{n}` | Auction slug |
| `generatePreOrderId` | `preorder-{name}-...` | Pre-order slug |
| `generateOrderId` | `order-{count}-{YYYYMMDD}-{rand6}` | Order ID |
| `generateBidId` | `bid-{product}-{user}-{YYYYMMDD}-{rand}` | Bid ID |
| `generateReviewId` | `review-{product}-{user}-{YYYYMMDD}` | Review ID |
| `generateCategoryId` | `category-{name}` | Category slug |
| `generateUserId` | `user-{first}-{last}-{email}` | User slug |
| `generateCouponId` | `coupon-{CODE}` | Coupon ID |
| `generateBlogPostId` | `blog-{title}-{category}` | Blog post slug |
| `generateMediaFilename` | `{context}-{name}-{n}-{YYYYMMDD}.{ext}` | SEO media filename |
| `generateBarcodeFromId` | 12-digit numeric | Barcode from ID |
| `generateQRCodeData` | URL string | QR code URL |

### Sieve Builder (appkit/src/utils/sieve-builder.ts)

| Function | Purpose |
|----------|---------|
| `SIEVE_OP` | Operator constants: EQ, NEQ, GT, LT, GTE, LTE, CONTAINS, etc. |
| `sieveFilter(field, op, value)` | Build single filter clause |
| `sieveMultiEq(field, values)` | Multiple equality (OR) |
| `sieveAnd(...clauses)` | Join with AND |
| `expandSieveParam(field, value, op?)` | URL param → Sieve clause |

### Event Management (appkit/src/utils/event-manager.ts)

| Function | Purpose |
|----------|---------|
| `throttle(fn, delay)` | Throttle function calls |
| `debounce(fn, delay)` | Debounce function calls |
| `addGlobalScrollHandler(cb, opts?)` | Register scroll listener |
| `addGlobalResizeHandler(cb, opts?)` | Register resize listener |
| `addGlobalClickHandler(sel, cb)` | Register delegated click |
| `addGlobalKeyHandler(key, cb)` | Register keyboard shortcut |
| `isMobileDevice()` | UA-based mobile check |
| `hasTouchSupport()` | Touch capability check |
| `getViewportDimensions()` | Window inner size |
| `isInViewport(el, offset?)` | Visibility check |
| `smoothScrollTo(el, opts?)` | Smooth scroll |
| `preventBodyScroll(prevent)` | Lock/unlock body scroll |

### Other Utilities

| File | Function | Purpose |
|------|----------|---------|
| `color.helper.ts` | `hexToRgb`, `rgbToHex`, `getContrastColor` | Color conversion |
| `cookie.converter.ts` | `parseCookies`, `getCookie`, `hasCookie`, `deleteCookie` | Cookie management |
| `business-day.ts` | `getBusinessDayStart`, `getBusinessDaysElapsed`, `getBusinessDaysRemaining` | IST business day math |
| `auth-error.ts` | `isAuthError(err, status?)` | Auth error detection |
| `filter.helper.ts` | `buildSieveFilters(...entries)` | Sieve filter string builder |
| `listing-params.ts` | `parseListingParams(url)`, `serializeListingParams(params)` | URL listing param parsing |
| `media-url.ts` | `resolveMediaUrl(url)` | Media URL → watermark proxy |
| `schema-ui.ts` | `deriveFormFields(schema, opts?)` | Zod schema → form field config |
| `search-tokens.ts` | `buildSearchTokens(...sources)`, `tokenizeQuery(query)` | Search tokenization |
| `action-response.ts` | `handleActionError(err)` | Error → ActionResult mapping |
| `animation.helper.ts` | `easings` (10 easing functions) | Pure easing math |
| `pagination.helper.ts` | `calculatePagination(opts)` | Pagination metadata |
| `type.converter.ts` | `stringToBoolean`, `arrayToObject`, `firestoreTimestampToDate` + 5 more | Type conversion |

---

## 13. Registries

### Action Registry (appkit/src/_internal/shared/actions/action-registry.ts)

23 resource buckets with 250+ action definitions:

| Bucket | Action Count | Key Actions |
|--------|-------------|-------------|
| `PRODUCT` | 7 | add-to-cart, buy-now, add-to-wishlist, share, compare, make-offer, remove-from-wishlist |
| `AUCTION` | 4 | place-bid, buy-it-now, watch, unwatch |
| `PRE_ORDER` | 3 | add-to-cart, reserve-now, cancel-reservation |
| `PRIZE_DRAW` | 3 | buy-now, enter-draw, reveal-code |
| `CLASSIFIED` | 1 | contact-seller |
| `DIGITAL_CODE` | 1 | claim-code |
| `LIVE` | 1 | inquire |
| `BUNDLE` | 1 | buy-now |
| `STORE` | 36 | edit/delete/publish listing, mark-shipped, whatsapp-connect, whatsapp-catalog-sync, save-changes, print-labels, create/update/delete-template, and more |
| `USER` | 18 | cancel-order, request-return, save-settings, wishlist-bulk-remove, track-order, reorder, download-invoice, write-review, claim-coupon, and more |
| `ADMIN` | 50+ | approve/reject-product, ban/unban-user, verify/suspend-store, approve/reject-review, grant/hold-payout, export-csv, toggle-featured/promoted, and more |
| `CART` | 4 | clear-cart, remove-item, checkout, continue-shopping |
| `CHECKOUT` | 11 | place-order, pay-online, pay-cod, apply/remove-coupon, send/verify/resend-otp, admin-bypass |
| `NAV` | 3 | sign-in, sign-up, sign-out |
| `MEDIA` | 3 | copy-url, clear-previews, discard-staged |
| `SUPPORT` | 3 | create-ticket, reply-ticket, close-ticket |
| `BLOG` | 3 | create-post, edit-post, delete-post |
| `EVENT` | 2 | register, cancel-registration |
| `SELLER` | 1 | cancel-bid |

### Action Defs (appkit/src/features/products/constants/action-defs.ts)

| Preset | Type | Purpose |
|--------|------|---------|
| `ACTION_META` | Record | 40+ Tier 1 public CTA definitions |
| `ROW_ACTION_META` | Record | 30+ Tier 2 row/table action definitions |
| `FORM_ACTION_META` | Record | 7 Tier 3 form footer actions |
| `DASHBOARD_QUICK_ACTION_META` | Record | 17 Tier 4 dashboard shortcuts |
| `ADMIN_ROW_ACTIONS` | Record | Per-entity admin row action presets (28 entity types) |
| `SELLER_ROW_ACTIONS` | Record | Per-entity seller row action presets (19 entity types) |
| `USER_ROW_ACTIONS` | Record | Per-entity user row action presets (7 entity types) |
| `ADMIN_BULK_ACTIONS` | Record | Admin bulk action presets |
| `SELLER_BULK_ACTIONS` | Record | Seller bulk action presets |
| `DETAIL_ACTIONS` | Record | Detail page action groups (product, auction, preorder) |
| `MOBILE_PRIMARY_ACTIONS` | Record | Mobile CTA presets per listing type |
| `FORM_FOOTER_PRESET` | Record | Form footer presets (drawer, editor, modal, settings) |
| `DASHBOARD_QUICK_ACTIONS` | Record | Dashboard quick action presets (admin, seller, user) |

---

## 14. Schemas (Zod)

### Auth Schemas

| Schema | Validates | Fields |
|--------|-----------|--------|
| `loginSchema` | Login form | email, password (min 6) |
| `registerSchema` | Registration | email, password, displayName? |
| `forgotPasswordSchema` | Password reset request | email |
| `resetPasswordSchema` | Password reset | token, password |
| `userRoleSchema` | Role validation | "user"\|"seller"\|"moderator"\|"employee"\|"admin" |

### Product Schemas

| Schema | Validates | Key Fields |
|--------|-----------|------------|
| `productInputSchema` | Product create | title, description, price, categorySlug, images[], customFields[] |
| `productUpdateSchema` | Product update | All product fields (partial) |
| `auctionInputSchema` | Auction create | + startingBid, reservePrice, endDate |
| `preOrderInputSchema` | Pre-order create | + deliveryDate, depositPercent, maxQuantity |
| `productListParamsSchema` | Product query | q, category, status, minPrice, maxPrice, listingType, sort |
| `setFeaturedSchema` | Featured toggle | productId, featured (boolean) |
| `setStatusSchema` | Status change | productId, status |

### Order/Cart/Checkout Schemas

| Schema | Validates | Key Fields |
|--------|-----------|------------|
| `createOrderSchema` | Order creation | items[], addressId, paymentMethod |
| `updateOrderStatusSchema` | Status update | orderId, status, tracking? |
| `cancelOrderSchema` | Cancellation | orderId, reason |
| `addToCartSchema` | Cart add | productId, quantity, attributes? |
| `applyCouponSchema` | Coupon application | code, cartItems? |
| `placeBidSchema` | Bid placement | productId, amount |

### Content Schemas

| Schema | Validates | Key Fields |
|--------|-----------|------------|
| `blogPostInputSchema` | Blog create | title, slug, content, category, coverImage |
| `eventInputSchema` | Event create | title, type, status, startDate, endDate |
| `createReviewSchema` | Review create | productId, rating (1-5), title, body, images[] |
| `createCouponSchema` | Coupon create | code, type, discount, validity, restrictions |
| `bundleCreateSchema` | Bundle create | name, items[], pricing, stockMode |

---

## 15. Seed Data

| File | Collection | Records | Key Data |
|------|-----------|---------|----------|
| `users-seed-data.ts` | users | 18 | 1 admin + 7 sellers + 10 buyers |
| `stores-seed-data.ts` | stores | 8 | LetItRip Official + 7 themed stores |
| `products-standard-seed-data.ts` | products | 62 | Standard marketplace products |
| `products-auctions-seed-data.ts` | products | 20 | Auction listings |
| `products-preorders-seed-data.ts` | products | 12 | Pre-order listings |
| `products-prize-draws-seed-data.ts` | products | 8 | Prize draw listings |
| `products-classifieds-seed-data.ts` | products | 6 | Classified listings |
| `products-digital-codes-seed-data.ts` | products | 5 | Digital code listings |
| `products-live-items-seed-data.ts` | products | 4 | Live item listings |
| `orders-seed-data.ts` | orders | 50 | Orders across buyer/store combos |
| `reviews-seed-data.ts` | reviews | 65 | Reviews (16 with seller responses) |
| `bids-seed-data.ts` | bids | 15+ | Auction bids |
| `coupons-seed-data.ts` | coupons | 12 | Admin + seller coupons |
| `claimed-coupons-seed-data.ts` | claimedCoupons | 8 | Coupon claims |
| `coupon-usage-seed-data.ts` | couponUsage | 5 | Usage tracking |
| `categories-seed-data.ts` | categories | 55 | 6 roots + sub-hierarchy + 25 brands |
| `carousels-seed-data.ts` | carousels | 5 | Homepage carousels |
| `carousel-slides-seed-data.ts` | carouselSlides | 30+ | Carousel slide assets |
| `homepage-sections-seed-data.ts` | homepageSections | 12 | Homepage layout sections |
| `faq-seed-data.ts` | faqs | 85 | FAQs across categories |
| `blog-posts-seed-data.ts` | blogPosts | 25+ | Blog posts with images |
| `events-seed-data.ts` | events | 8 | Events (sale/poll/raffle) |
| `sessions-seed-data.ts` | sessions | 18 | User sessions |
| `addresses-seed-data.ts` | addresses | 12 | User shipping addresses |
| `store-addresses-seed-data.ts` | addresses | 8 | Store pickup addresses |
| `carts-seed-data.ts` | carts | 8 | Shopping carts |
| `wishlists-seed-data.ts` | wishlists | 8 | Wish lists |
| `history-seed-data.ts` | history | 10 | Browsing history |
| `conversations-seed-data.ts` | conversations | 15 | Buyer-seller messages |
| `notifications-seed-data.ts` | notifications | 40 | In-app notifications |
| `payouts-seed-data.ts` | payouts | 12 | Seller payouts |
| `offers-seed-data.ts` | offers | 10 | Price offers |
| `grouped-listings-seed-data.ts` | groupedListings | 6 | Grouped displays |
| `support-tickets-seed-data.ts` | supportTickets | 20 | Support tickets |
| `scammers-seed-data.ts` | scammerProfiles | 5 | Scammer profiles |
| `site-settings-seed-data.ts` | siteSettings | 1 | Platform config singleton |
| `product-features-seed-data.ts` | productFeatures | 15 | Product feature attributes |
| `store-extensions-seed-data.ts` | store-extensions | 50+ | Store tools + RBAC + moderation |

**Total: 39 seed files, 550+ records across 30+ collections**

---

## 16. Page Shims

### Public Pages (src/app/[locale]/)

| Path | Delegates To | Purpose |
|------|-------------|---------|
| `/` | Homepage sections | Landing page |
| `/products` | `SellerProductsView` (public portal) | Product listing |
| `/products/[slug]` | `ProductDetailView` | Product detail |
| `/auctions` | Auction listing view | Auction listing |
| `/auctions/[slug]` | `AuctionDetailView` | Auction detail |
| `/pre-orders` | Pre-order listing view | Pre-order listing |
| `/pre-orders/[slug]` | Pre-order detail view | Pre-order detail |
| `/bundles` | Bundle listing view | Bundle listing |
| `/bundles/[slug]` | Bundle detail view | Bundle detail |
| `/prize-draws` | Prize draw listing view | Prize draw listing |
| `/prize-draws/[slug]` | Prize draw detail view | Prize draw detail |
| `/stores` | Store listing view | Store listing |
| `/stores/[slug]` | `StoreDetailView` | Store landing |
| `/stores/[slug]/products` | Store products view | Store products |
| `/stores/[slug]/about` | `StoreAboutView` | Store about page |
| `/stores/[slug]/reviews` | Store reviews view | Store reviews |
| `/categories` | Category listing view | Category listing |
| `/categories/[slug]` | Category detail view | Category products |
| `/brands/[slug]` | Brand detail view | Brand products |
| `/events` | Event listing view | Event listing |
| `/events/[id]` | `EventDetailView` (tab layout) | Event detail |
| `/blog` | Blog listing view | Blog index |
| `/blog/[slug]` | `BlogPostView` | Blog post |
| `/search` | `SearchView` | Search results |
| `/reviews` | Review listing view | All reviews |
| `/faqs` | FAQ listing view | FAQ index |
| `/classified` | Classified listing view | Classified listing |
| `/classified/[slug]` | `ClassifiedDetailView` | Classified detail |
| `/digital-codes` | Digital code listing view | Digital code listing |
| `/digital-codes/[slug]` | `DigitalCodeDetailView` | Digital code detail |
| `/live` | Live item listing view | Live listing |
| `/live/[slug]` | `LiveItemDetailView` | Live item detail |
| `/about`, `/contact`, `/help`, `/terms`, `/privacy` | Static content | Legal/info pages |

### Auth Pages (src/app/[locale]/auth/)

| Path | Purpose |
|------|---------|
| `/auth/login` | Login form |
| `/auth/register` | Registration form |
| `/auth/forgot-password` | Password reset request |
| `/auth/reset-password` | Password reset form |
| `/auth/verify-email` | Email verification |

### User Dashboard (src/app/[locale]/user/)

| Path | View Component | Purpose |
|------|---------------|---------|
| `/user` | `UserDashboardView` | Account dashboard |
| `/user/orders` | `UserOrdersView` | Order history |
| `/user/orders/[id]` | `OrderDetailView` | Order detail |
| `/user/orders/[id]/invoice` | `InvoiceView` | Printable invoice |
| `/user/wishlist` | `UserWishlistView` | Wishlist |
| `/user/history` | `HistoryView` | Browsing history |
| `/user/addresses` | `UserAddressesView` | Address management |
| `/user/settings` | `UserSettingsView` | Profile settings |
| `/user/notifications` | Notifications view | User notifications |
| `/user/messages` | Messages view | Chat messages |
| `/user/cart` | `CartView` | Shopping cart |
| `/user/checkout` | `CheckoutView` | Checkout flow |
| `/user/become-seller` | `BecomeSellerView` | Seller application |

### Store Dashboard (src/app/[locale]/store/)

| Path | View Component | Purpose |
|------|---------------|---------|
| `/store` | `SellerDashboardView` | Store dashboard |
| `/store/products` | `SellerProductsView` | Product management |
| `/store/products/new` | `ProductForm` (create) | New product |
| `/store/products/[id]/edit` | `ProductForm` (edit) | Edit product |
| `/store/orders` | `SellerOrdersView` | Order management |
| `/store/orders/[id]` | `OrderDetailView` | Order detail |
| `/store/coupons` | `SellerCouponsView` | Coupon management |
| `/store/reviews` | `SellerReviewsView` | Review management |
| `/store/payouts` | `SellerPayoutsView` | Payout history |
| `/store/analytics` | `SellerAnalyticsView` | Store analytics |
| `/store/storefront` | `StorefrontSettingsView` | Store customization |
| `/store/shipping` | Shipping config view | Shipping settings |
| `/store/addresses` | Store addresses view | Pickup addresses |
| `/store/whatsapp` | WhatsApp integration view | Catalog sync |

### Admin Dashboard (src/app/[locale]/admin/)

| Path | View Component | Purpose |
|------|---------------|---------|
| `/admin` | `AdminDashboardView` | Admin dashboard |
| `/admin/products` | `AdminProductsView` | Product management |
| `/admin/users` | `AdminUsersView` | User management |
| `/admin/stores` | `AdminStoresView` | Store management |
| `/admin/orders` | `AdminOrdersView` | Order management |
| `/admin/reviews` | `AdminReviewsView` | Review moderation |
| `/admin/events` | `AdminEventsView` | Event management |
| `/admin/blog` | `AdminBlogView` | Blog management |
| `/admin/coupons` | `AdminCouponsView` | Coupon management |
| `/admin/payouts` | `AdminPayoutsView` | Payout management |
| `/admin/faqs` | `AdminFAQsView` | FAQ management |
| `/admin/categories` | `AdminCategoriesView` | Category management |
| `/admin/brands` | `AdminBrandsView` | Brand management |
| `/admin/carousels` | Carousel management view | Homepage carousels |
| `/admin/carousels/[id]` | `CarouselEditor` | Carousel editor |
| `/admin/site` | `AdminSiteSettingsView` | Site settings (14 tabs) |
| `/admin/sessions` | Sessions management view | Active sessions |

---

## 17. Config

| File | Purpose |
|------|---------|
| `appkit/src/configs/next.ts` | `defineNextConfig()` — webpack aliases, Firebase externals, output file tracing, image domains |
| `appkit/src/configs/tailwind.ts` | Tailwind config extension with appkit content paths |
| `appkit/appkit.config.js` | Brand/theme/i18n/Firebase configuration for host app override |
| `next.config.js` | Next.js config consuming `defineNextConfig` |
| `tailwind.config.js` | Tailwind config consuming appkit extension |
| `postcss.config.js` | PostCSS with tailwindcss + autoprefixer |
| `tsconfig.json` (root) | TypeScript config with path aliases |
| `appkit/tsconfig.json` | Appkit TypeScript config |
| `firebase.json` | Firebase hosting + functions config |
| `firestore.indexes.json` | Composite Firestore indexes (auto-generated from appkit) |
| `firestore.rules` | Firestore security rules |
| `storage.rules` | Firebase Storage rules (`allow write: if false`) |
| `.env.local` | Environment variables (Firebase keys, API secrets) |
| `vercel.json` | Vercel deployment config (auto-deploy disabled) |

---

## 18. Tokens & Design System

### Token Map (appkit/src/tokens/index.ts)

| Token Group | Key | Purpose |
|-------------|-----|---------|
| `COLORS` | Brand colors with full 50-950 scales | Primary, secondary, cobalt, accent, semantic |
| `RADIUS` | Border radius tokens | sm, md, lg, xl, 2xl, card, btn, full |
| `SHADOWS` | Shadow values | sm, md, lg, xl, soft, glow, glowPink |
| `Z_INDEX` | Layering tokens | dropdown, navbar, bottomNav, overlay, sidebar, modal, toast |
| `LAYOUT` | Dimension tokens | navbarHeight, sidebarWidth, maxContentWidth, responsive gaps |
| `TYPOGRAPHY` | Text scale | h1-h6, pageTitle, body, small, display (responsive sizing) |
| `SPACING` | Spacing patterns | section, formGroup, stack, inline, pageY, padding map, gap map |
| `GRID` | Grid presets | cols1-6, cards, productCards, sidebar, auto-fill |
| `INPUT` | Form input styles | base, error, success, disabled, withIcon |
| `CARD` | Card styles | standard, elevated, interactive, glass, image, body, footer |
| `FLEX` | Flex compositions | row, col, center, between, rowCenter, colCenter (16 presets) |
| `PATTERNS` | Common patterns | pageContainer, formContainer, listItem, iconButton, modalOverlay, emptyState |
| `MOTION` | Motion tokens | fadeIn, slideUp, scaleIn, skeleton, transition (respects prefers-reduced-motion) |
| `TEXT` | Text tokens | h1-h4, body, price, muted, error, success |
| `TOUCH` | Touch targets | WCAG 2.5.5 compliant sizes |
| `SKELETON` | Loading placeholders | pulse, shimmer variants |
| `TRANSITIONS` | Transition classes | default, fast, slow, colors, transform |
| `ICON` | Icon tokens | Color variants (muted, primary, success, danger), sizes (sm-xl) |
| `THEME_CONSTANTS` | Complete system | All above + form, tooltip, breakpoints, base, homepage, carousel |

### CSS Variables (appkit/src/tokens/tokens.css)

| Variable | Purpose |
|----------|---------|
| `--appkit-color-primary` / `--appkit-color-secondary` | Theme colors |
| `--appkit-color-success` / `--appkit-color-warning` / `--appkit-color-error` / `--appkit-color-info` | Semantic status colors |
| `--appkit-color-surface` / `--appkit-color-surface-elevated` | Surface backgrounds |
| `--appkit-color-text` / `--appkit-color-text-secondary` / `--appkit-color-text-muted` | Text colors |
| `--appkit-color-border` / `--appkit-color-border-subtle` | Border colors |
| `--appkit-z-modal` / `--appkit-z-dropdown` / `--appkit-z-overlay` | Z-index tokens |
| `--header-height` | Runtime header height (set by AppLayoutShell) |
| `--glow-color` / `--glow-ring` / `--glow-strong` | Themed glow effects |

---

## 19. Route Map

### ROUTES Object (appkit/src/next/routing/route-map.ts)

| Section | Route Count | Examples |
|---------|------------|---------|
| `PUBLIC` | 80+ | PRODUCTS, PRODUCT_DETAIL, AUCTIONS, STORES, STORE_DETAIL, CATEGORIES, BRANDS, BLOG, EVENTS, SEARCH, FAQS, CLASSIFIED, DIGITAL_CODES, LIVE |
| `AUTH` | 7 | LOGIN, REGISTER, FORGOT_PASSWORD, RESET_PASSWORD, VERIFY_EMAIL, OAUTH_LOADING, CLOSE |
| `USER` | 30+ | ORDERS, WISHLIST, HISTORY, ADDRESSES, CART, CHECKOUT, NOTIFICATIONS, MESSAGES, BECOME_SELLER, OFFERS, BIDS |
| `STORE` | 60+ | PRODUCTS, ORDERS, COUPONS, ANALYTICS, PAYOUTS, SHIPPING, WHATSAPP, BUNDLES, PRIZE_DRAWS, CLASSIFIED, DIGITAL_CODES, LIVE_ITEMS, PRINT_CENTER |
| `ADMIN` | 70+ | USERS, SITE, CAROUSELS, CATEGORIES, BRANDS, PRODUCTS, ORDERS, BLOG, EVENTS, PAYOUTS, SUPPORT_TICKETS, SCAMMERS, MODERATION, ROLES, PERMISSIONS |
| `DEMO` | 1 | SEED |
| `BLOG` | 2 | LIST, ARTICLE |

### Helper Functions

| Function | Purpose |
|----------|---------|
| `createRouteMap(overrides)` | Merge custom routes with defaults |
| `PUBLIC_ROUTES` | Array of public routes (no auth) |
| `PROTECTED_ROUTES` | Array of protected routes (auth required) |
| `AUTH_ROUTES` | Array of auth routes |

---

## 20. Firebase Jobs

### Scheduled Jobs (appkit/src/_internal/server/jobs/)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `adminAnalytics` | Daily | Admin dashboard stats aggregation |
| `storeAnalytics` | Daily | Per-store analytics aggregation |
| `auctionSettlement` | Every 5 min | Settle ended auctions (winner determination) |
| `bundleStockSync` | Daily | Reconcile bundle stock with member products |
| `cartPrune` | Daily | Delete stale guest carts |
| `couponExpiry` | Hourly | Deactivate expired coupons |
| `dailyDataCleanup` | Daily | Purge expired tokens + sessions |
| `draftPrune` | Weekly | Delete old draft products |
| `mediaTmpCleanup` | Daily | Clean tmp/ upload files |
| `notificationPrune` | Daily | Purge old read notifications |
| `offerExpiry` | Hourly | Expire stale offers |
| `pendingOrderTimeout` | Every 15 min | Cancel timed-out pending orders |
| `payoutBatch` | Daily | Batch eligible payouts |
| `weeklyPayoutEligibility` | Weekly | Mark orders eligible for payout |
| `autoPayoutEligibility` | Daily | Auto-approve eligible payouts |
| `positionsReconcile` | Daily | Reconcile homepage section positions |
| `countersReconcile` | Daily | Reconcile collection counters |
| `productStatsSync` | Daily | Sync product view/order stats |
| `promotions` | Hourly | Activate/deactivate scheduled promotions |
| `cleanupRtdbEvents` | Daily | Clean stale RTDB event entries |

### Event-Triggered Jobs

| Job | Trigger | Purpose |
|-----|---------|---------|
| `onProductWrite` | Firestore write | Update category metrics, search index |
| `onProductStockChange` | Firestore write | Bundle stock sync trigger |
| `onCategoryWrite` | Firestore write | Rebuild category tree cache |
| `onOrderCreate` | Firestore create | Send notifications, update stats |
| `onOrderStatusChange` | Firestore update | Track delivery, trigger refunds |
| `onReviewWrite` | Firestore write | Update store rating aggregates |
| `onBidPlaced` | Firestore create | Outbid notifications, auto-extend |
| `onStoreWrite` | Firestore write | Update store search index |
| `onUserBanChange` | Firestore update | Cascade ban effects |
| `onScamReport*` | Firestore create | Auto-flag, notify admins |
| `onSupportTicket*` | Firestore create/update | Notification routing |

### Callable/HTTPS Jobs

| Job | Type | Purpose |
|-----|------|---------|
| `triggerEventRaffle` | HTTPS | Execute raffle draw (crypto.randomInt) |
| `assignSpinPrize` | HTTPS | Assign spin wheel prize |
| `prizeReveal*` | Callable | Prize draw code reveal + pool management |
| `listingProcessor` | HTTPS | Advanced product listing queries |

### Job Runtime Types

| Type | Purpose |
|------|---------|
| `JobContext` | Logger + admin SDK access |
| `JobLogger` | Structured logging interface |
| `ScheduleHandler` | Scheduled job function signature |
| `FirestoreTriggerHandler` | Firestore trigger function signature |
| `CallableHandler` | Callable function signature |
| `BindHttpsOptions` | HTTPS handler config (secrets, CORS) |
| `bindSchedule()` | Firebase scheduled function adapter |
| `bindDocumentWritten()` | Firestore write trigger adapter |
| `bindDocumentCreated()` | Firestore create trigger adapter |
| `bindCallable()` | Firebase callable adapter |
| `bindHttps()` | Firebase HTTPS adapter |
