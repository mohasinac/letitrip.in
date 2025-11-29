# Epic E025: Mobile Component Integration

## Overview

Integrate the mobile-optimized components across all areas of the application to provide a consistent, native-like mobile experience. This epic tracks the integration of existing mobile components (`src/components/mobile/`) into all pages, forms, layouts, and user flows.

## Scope

- Integrate mobile components into all existing pages
- Update forms to use mobile-optimized inputs
- Add swipe actions to all list-based views
- Implement pull-to-refresh on data listing pages
- Use MobileDataTable for all tabular data
- Add MobileBottomSheet for modals on mobile
- Integrate MobileActionSheet for context menus
- Add loading skeletons across the app
- Ensure safe area support on all fixed elements
- **Create reusable filter section components**
- **Refactor filters to share common sections (categories, shops, price, ratings)**
- **Optimize homepage and carousels for touch gestures**
- **Add mobile support to search page with filter bottom sheets**
- **Ensure static/legal pages are mobile-readable**

## Components to Integrate

### Existing Mobile Components

| Component                | Description                  | Integration Points                         |
| ------------------------ | ---------------------------- | ------------------------------------------ |
| `MobileBottomSheet`      | Draggable bottom sheet modal | Forms, filters, confirmations              |
| `MobileActionSheet`      | Bottom action menu           | Context menus, bulk actions                |
| `MobilePullToRefresh`    | Pull-to-refresh wrapper      | Product lists, order lists, all data pages |
| `MobileSwipeActions`     | Swipe to reveal actions      | Cart items, orders, wishlist, addresses    |
| `MobileFormInput`        | Touch-optimized input        | All forms app-wide                         |
| `MobileFormSelect`       | Native mobile select         | All select dropdowns                       |
| `MobileSkeleton`         | Loading skeletons            | All loading states                         |
| `MobileDataTable`        | Responsive card/table        | Admin tables, order lists, product lists   |
| `MobileAdminSidebar`     | Admin mobile nav             | Admin layout                               |
| `MobileSellerSidebar`    | Seller mobile nav            | Seller layout                              |
| `MobileInstallPrompt`    | PWA install banner           | Root layout                                |
| `MobileOfflineIndicator` | Offline status               | Root layout                                |
| `MobileQuickActions`     | FAB with menu                | Seller/Admin dashboards                    |

### New Reusable Filter Section Components (To Create)

| Component                     | Description                            | Reused In                          |
| ----------------------------- | -------------------------------------- | ---------------------------------- |
| `MobileCategoryFilterSection` | Hierarchical category tree with search | Products, Auctions, Reviews        |
| `MobileShopFilterSection`     | Shop selector with verified badge      | Products, Auctions                 |
| `MobilePriceRangeSection`     | Min/max price with touch slider        | Products, Auctions                 |
| `MobileRatingFilterSection`   | Star rating with large touch targets   | Products, Shops, Reviews           |
| `MobileStatusFilterSection`   | Generic status checkboxes              | Orders, Auctions, Returns, Coupons |
| `MobileDateRangeSection`      | Touch-friendly date picker             | Orders, Auctions, Analytics        |
| `MobileFilterWrapper`         | MobileBottomSheet wrapper for filters  | All filter panels                  |

### Cards & Catalog Components (To Optimize)

| Component                               | Mobile Optimizations Needed                    | Status  |
| --------------------------------------- | ---------------------------------------------- | ------- |
| `src/components/cards/ProductCard.tsx`  | Touch targets, swipe gallery, mobile layout    | 🔲 Todo |
| `src/components/cards/AuctionCard.tsx`  | Touch targets, countdown sizing, mobile layout | 🔲 Todo |
| `src/components/cards/ShopCard.tsx`     | Touch targets, compact mobile variant          | 🔲 Todo |
| `src/components/cards/CategoryCard.tsx` | Touch targets, mobile grid sizing              | 🔲 Todo |
| `src/components/cards/BlogCard.tsx`     | Touch targets, mobile typography               | 🔲 Todo |
| `src/components/cards/ReviewCard.tsx`   | Touch targets, expandable content              | 🔲 Todo |
| `src/components/cards/CardGrid.tsx`     | Mobile-first columns, responsive gaps          | 🔲 Todo |
| `ProductQuickView.tsx`                  | MobileBottomSheet on mobile, swipe gallery     | 🔲 Todo |
| `AuctionQuickView.tsx`                  | MobileBottomSheet on mobile, swipe gallery     | 🔲 Todo |

### Product Gallery & Zoom Components (To Optimize)

| Component                                   | Mobile Optimizations Needed                      | Status  |
| ------------------------------------------- | ------------------------------------------------ | ------- |
| `src/components/product/ProductGallery.tsx` | Swipe gallery, pinch-to-zoom, mobile lightbox    | 🔲 Todo |
| ProductGallery Lightbox                     | Swipe navigation, pinch-to-zoom, double-tap zoom | 🔲 Todo |
| ProductGallery Thumbnails                   | Horizontal scroll, touch-friendly sizing         | 🔲 Todo |

### Skeleton Components (To Optimize)

| Component                  | Mobile Optimizations Needed          | Status  |
| -------------------------- | ------------------------------------ | ------- |
| `ProductCardSkeleton.tsx`  | Match mobile ProductCard dimensions  | 🔲 Todo |
| `AuctionCardSkeleton.tsx`  | Match mobile AuctionCard dimensions  | 🔲 Todo |
| `ShopCardSkeleton.tsx`     | Match mobile ShopCard dimensions     | 🔲 Todo |
| `CategoryCardSkeleton.tsx` | Match mobile CategoryCard dimensions | 🔲 Todo |

### Scrolling & Catalog Components (To Optimize)

| Component                       | Mobile Optimizations Needed                 | Status  |
| ------------------------------- | ------------------------------------------- | ------- |
| `HorizontalScrollContainer.tsx` | Touch momentum, snap scrolling, swipe hints | 🔲 Todo |
| `ResourceListWrapper.tsx`       | Mobile filter toggle, responsive layout     | 🔲 Todo |

### Pagination Components (To Create)

| Component              | Description                           | Status  |
| ---------------------- | ------------------------------------- | ------- |
| `MobilePagination`     | Touch-friendly page navigation        | 🔲 Todo |
| `MobileInfiniteScroll` | Pull-up to load more for mobile lists | 🔲 Todo |
| `MobileLoadMoreButton` | Large touch-friendly load more button | 🔲 Todo |

### Media Components (To Optimize)

| Component                                          | Mobile Optimizations Needed                     | Status  |
| -------------------------------------------------- | ----------------------------------------------- | ------- |
| `src/components/media/MediaUploader.tsx`           | Touch-friendly drop zone, native file picker    | 🔲 Todo |
| `src/components/media/MediaGallery.tsx`            | Touch reorder, swipe preview, mobile lightbox   | 🔲 Todo |
| `src/components/media/MediaPreviewCard.tsx`        | Touch targets, swipe gestures, mobile sizing    | 🔲 Todo |
| `src/components/media/CameraCapture.tsx`           | Fullscreen mobile capture, orientation handling | 🔲 Todo |
| `src/components/media/VideoRecorder.tsx`           | Fullscreen recording, mobile controls           | 🔲 Todo |
| `src/components/media/ImageEditor.tsx`             | Touch gestures for crop/rotate, pinch-to-zoom   | 🔲 Todo |
| `src/components/media/MediaEditorModal.tsx`        | MobileBottomSheet on mobile, touch controls     | 🔲 Todo |
| `src/components/media/VideoThumbnailGenerator.tsx` | Touch-friendly thumbnail selection              | 🔲 Todo |
| `src/components/media/MediaMetadataForm.tsx`       | MobileFormInput, touch-friendly inputs          | 🔲 Todo |
| `src/components/common/InlineImageUpload.tsx`      | Touch targets, native picker integration        | 🔲 Todo |
| `src/components/common/UploadProgress.tsx`         | Mobile position, swipe to dismiss, compact view | 🔲 Todo |

---

## Features

### F025.1: Layout Integration

**Priority**: P0 (Critical) - **COMPLETED**

#### Integration Status

| File                                      | Component                                   | Status  |
| ----------------------------------------- | ------------------------------------------- | ------- |
| `src/app/layout.tsx`                      | MobileInstallPrompt, MobileOfflineIndicator | ✅ Done |
| `src/app/admin/layout.tsx`                | MobileAdminSidebar                          | ✅ Done |
| `src/app/seller/layout.tsx`               | MobileSellerSidebar                         | ✅ Done |
| `src/components/layout/BottomNav.tsx`     | Safe area padding                           | ✅ Done |
| `src/components/layout/MobileSidebar.tsx` | Animations, safe areas                      | ✅ Done |

---

### F025.2: Cart Integration

**Priority**: P0 (Critical)

#### Integration Status

| File                                  | Component                   | Status  |
| ------------------------------------- | --------------------------- | ------- |
| `src/components/cart/CartItem.tsx`    | MobileSwipeActions          | ✅ Done |
| `src/app/cart/page.tsx`               | MobilePullToRefresh         | 🔲 Todo |
| `src/components/cart/CartSummary.tsx` | MobileBottomSheet on mobile | 🔲 Todo |

#### User Stories

**US025.2.1**: Cart Page Pull-to-Refresh

```
As a mobile user viewing my cart
I want to pull down to refresh cart contents
So that I can see updated prices and availability
```

**US025.2.2**: Cart Summary Bottom Sheet

```
As a mobile user at checkout
I want the order summary to be a collapsible bottom sheet
So that I can see more of the page while still having access to totals
```

---

### F025.3: Forms Integration

**Priority**: P0 (Critical)

#### 3A: Inline Forms (Component-based)

| File                                          | Components                         | Status  |
| --------------------------------------------- | ---------------------------------- | ------- |
| `src/components/checkout/AddressForm.tsx`     | MobileBottomSheet, MobileFormInput | ✅ Done |
| `src/components/product/ReviewForm.tsx`       | MobileFormInput, MobileBottomSheet | 🔲 Todo |
| `src/components/seller/ProductInlineForm.tsx` | MobileFormInput, MobileFormSelect  | 🔲 Todo |
| `src/components/seller/AuctionForm.tsx`       | MobileFormInput, MobileFormSelect  | 🔲 Todo |
| `src/components/seller/ShopForm.tsx`          | MobileFormInput, MobileFormSelect  | 🔲 Todo |
| `src/components/seller/CouponForm.tsx`        | MobileFormInput, MobileFormSelect  | 🔲 Todo |
| `src/components/admin/CategoryForm.tsx`       | MobileFormInput, MobileFormSelect  | 🔲 Todo |
| `src/app/login/page.tsx`                      | MobileFormInput                    | 🔲 Todo |
| `src/app/register/page.tsx`                   | MobileFormInput                    | 🔲 Todo |
| `src/components/auth/ForgotPasswordForm.tsx`  | MobileFormInput                    | 🔲 Todo |
| `src/components/auth/ResetPasswordForm.tsx`   | MobileFormInput                    | 🔲 Todo |
| `src/app/user/profile/page.tsx`               | MobileFormInput                    | 🔲 Todo |
| `src/app/contact/page.tsx`                    | MobileFormInput                    | 🔲 Todo |

#### 3B: Full Form Pages - Seller (Multi-step wizards)

| File                                           | Components                                     | Status  |
| ---------------------------------------------- | ---------------------------------------------- | ------- |
| `src/app/seller/products/create/page.tsx`      | MobileFormInput, MobileFormSelect, Step wizard | 🔲 Todo |
| `src/app/seller/products/[slug]/edit/page.tsx` | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/seller/auctions/create/page.tsx`      | MobileFormInput, MobileFormSelect, Step wizard | 🔲 Todo |
| `src/app/seller/auctions/[id]/edit/page.tsx`   | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/seller/my-shops/create/page.tsx`      | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/seller/my-shops/[slug]/edit/page.tsx` | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/seller/coupons/create/page.tsx`       | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/seller/coupons/[code]/edit/page.tsx`  | MobileFormInput, MobileFormSelect              | 🔲 Todo |

#### 3C: Full Form Pages - Admin

| File                                            | Components                                     | Status  |
| ----------------------------------------------- | ---------------------------------------------- | ------- |
| `src/app/admin/products/[id]/edit/page.tsx`     | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/categories/create/page.tsx`      | MobileFormInput, MobileFormSelect, Step wizard | 🔲 Todo |
| `src/app/admin/categories/[slug]/edit/page.tsx` | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/blog/create/page.tsx`            | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/blog/[id]/edit/page.tsx`         | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/coupons/create/page.tsx`         | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/coupons/[id]/edit/page.tsx`      | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/hero-slides/create/page.tsx`     | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/hero-slides/[id]/edit/page.tsx`  | MobileFormInput, MobileFormSelect              | 🔲 Todo |
| `src/app/admin/shops/[id]/edit/page.tsx`        | MobileFormInput, MobileFormSelect              | 🔲 Todo |

#### User Stories

**US025.3.1**: Login Form Mobile Optimization

```
As a mobile user logging in
I want touch-optimized inputs with proper keyboards
So that I can sign in easily on my phone

Acceptance Criteria:
- Email field shows email keyboard
- Password field has show/hide toggle
- Inputs are 48px minimum height
- Submit button is full-width
- Social login buttons are large and tappable
```

**US025.3.2**: Register Form Mobile Optimization

```
As a mobile user registering
I want a mobile-friendly registration experience
So that I can create an account easily

Acceptance Criteria:
- All inputs use MobileFormInput
- Phone input shows numeric keyboard
- Form validates inline
- Submit button is sticky at bottom
```

**US025.3.3**: Review Form Mobile Optimization

```
As a mobile user writing a review
I want a native mobile experience
So that I can share my feedback easily

Acceptance Criteria:
- Form opens as MobileBottomSheet
- Star rating has large touch targets
- Text area auto-grows
- Camera button for photos is prominent
- Submit button is sticky at bottom
```

**US025.3.4**: Multi-Step Wizard Forms Mobile Optimization

```
As a seller creating a product on mobile
I want a mobile-optimized multi-step wizard
So that I can create products easily on my phone

Acceptance Criteria:
- Step indicators are horizontal scrollable on mobile
- Current step is always visible and highlighted
- Form inputs use MobileFormInput with proper keyboard types
- Select dropdowns use MobileFormSelect with native picker
- "Next" / "Back" buttons are large (48px min) and sticky at bottom
- Media upload uses native camera/gallery picker
- Progress is auto-saved between steps
- Each step fits within viewport without scrolling if possible
```

**US025.3.5**: Admin Category Wizard Mobile Optimization

```
As an admin creating a category on mobile
I want a mobile-optimized 4-step wizard
So that I can manage categories from anywhere

Acceptance Criteria:
- Steps: Basic Info → Media → SEO → Display Settings
- Parent category selector uses MobileFormSelect
- Image upload uses native picker
- SEO fields have character counters
- Preview before publish
```

---

### F025.4: User Dashboard Integration

**Priority**: P0 (Critical)

#### Integration Status

| File                                | Components                              | Status  |
| ----------------------------------- | --------------------------------------- | ------- |
| `src/app/user/orders/page.tsx`      | MobileDataTable, MobilePullToRefresh    | ✅ Done |
| `src/app/user/orders/[id]/page.tsx` | MobileActionSheet                       | 🔲 Todo |
| `src/app/user/wishlist/page.tsx`    | MobileSwipeActions, MobilePullToRefresh | 🔲 Todo |
| `src/app/user/addresses/page.tsx`   | MobileSwipeActions, MobilePullToRefresh | 🔲 Todo |
| `src/app/user/profile/page.tsx`     | MobileFormInput                         | 🔲 Todo |
| `src/app/user/bids/page.tsx`        | MobileDataTable, MobilePullToRefresh    | 🔲 Todo |

#### User Stories

**US025.4.1**: Wishlist Swipe Actions

```
As a mobile user viewing my wishlist
I want to swipe items to remove or add to cart
So that I can manage my wishlist quickly

Acceptance Criteria:
- Swipe left reveals "Remove" action (red)
- Swipe right reveals "Add to Cart" action (green)
- Full swipe triggers the action
- Undo toast appears after removal
```

**US025.4.2**: Addresses Swipe Actions

```
As a mobile user managing addresses
I want to swipe addresses for quick actions
So that I can edit or delete addresses easily

Acceptance Criteria:
- Swipe left reveals "Edit" and "Delete" actions
- Swipe right reveals "Set Default" action
- Delete requires confirmation
```

---

### F025.5: Product/Auction Browsing Integration

**Priority**: P0 (Critical)

#### Integration Status

| File                               | Components                                       | Status  |
| ---------------------------------- | ------------------------------------------------ | ------- |
| `src/app/products/page.tsx`        | MobilePullToRefresh, MobileSkeleton              | 🔲 Todo |
| `src/app/products/[slug]/page.tsx` | MobileActionSheet, MobileBottomSheet             | 🔲 Todo |
| `src/app/auctions/page.tsx`        | MobilePullToRefresh, MobileSkeleton              | 🔲 Todo |
| `src/app/auctions/[id]/page.tsx`   | MobileBottomSheet (bid), MobileActionSheet       | 🔲 Todo |
| `src/app/categories/page.tsx`      | MobilePullToRefresh                              | 🔲 Todo |
| `src/app/search/page.tsx`          | MobilePullToRefresh, MobileBottomSheet (filters) | 🔲 Todo |
| `src/app/shops/page.tsx`           | MobilePullToRefresh                              | 🔲 Todo |
| `src/app/shops/[slug]/page.tsx`    | MobilePullToRefresh                              | 🔲 Todo |

#### User Stories

**US025.5.1**: Products Page Pull-to-Refresh

```
As a mobile user browsing products
I want to pull down to refresh the list
So that I can see new products and updated prices

Acceptance Criteria:
- Pull indicator appears when pulling
- Products refresh on release past threshold
- Loading skeleton shown during refresh
- Maintains scroll position after refresh
```

**US025.5.2**: Filter Bottom Sheet

```
As a mobile user filtering products
I want filters to appear as a bottom sheet
So that I can filter without leaving the page

Acceptance Criteria:
- Filter button opens MobileBottomSheet
- Filters use MobileFormSelect for dropdowns
- Price range uses touch-friendly slider
- Apply/Clear buttons are prominent
- Sheet is draggable with snap points
```

**US025.5.3**: Product Detail Actions

```
As a mobile user on product detail
I want action menu for share/wishlist/report
So that I can access secondary actions easily

Acceptance Criteria:
- Overflow menu opens MobileActionSheet
- Options: Share, Add to Wishlist, Report
- Each option has icon and label
- Tapping outside dismisses sheet
```

**US025.5.4**: Auction Bid Bottom Sheet

```
As a mobile user bidding on auction
I want bid form as a bottom sheet
So that I can bid without losing context

Acceptance Criteria:
- "Place Bid" opens MobileBottomSheet
- Current bid and minimum increment shown
- Bid input uses MobileFormInput with numeric keyboard
- Quick bid buttons (+₹100, +₹500, +₹1000)
- Submit button is prominent
```

---

### F025.6: Seller Dashboard Integration

**Priority**: P1 (High)

#### Integration Status

| File                               | Components                                               | Status  |
| ---------------------------------- | -------------------------------------------------------- | ------- |
| `src/app/seller/page.tsx`          | MobileQuickActions                                       | 🔲 Todo |
| `src/app/seller/products/page.tsx` | MobileDataTable, MobileSwipeActions, MobilePullToRefresh | 🔲 Todo |
| `src/app/seller/orders/page.tsx`   | MobileDataTable, MobileSwipeActions, MobilePullToRefresh | 🔲 Todo |
| `src/app/seller/auctions/page.tsx` | MobileDataTable, MobilePullToRefresh                     | 🔲 Todo |
| `src/app/seller/revenue/page.tsx`  | MobilePullToRefresh                                      | 🔲 Todo |
| `src/app/seller/shops/page.tsx`    | MobileDataTable, MobileSwipeActions                      | 🔲 Todo |
| `src/app/seller/coupons/page.tsx`  | MobileDataTable, MobileSwipeActions                      | 🔲 Todo |

#### User Stories

**US025.6.1**: Seller Dashboard Quick Actions

```
As a seller on mobile
I want a floating action button for quick actions
So that I can quickly add products or create auctions

Acceptance Criteria:
- FAB appears bottom-right above bottom nav
- Tap expands to show: Add Product, Create Auction, View Orders
- Each action navigates to respective form
- FAB hides when scrolling down, appears when scrolling up
```

**US025.6.2**: Seller Products Swipe Actions

```
As a seller managing products on mobile
I want to swipe products for quick actions
So that I can manage inventory efficiently

Acceptance Criteria:
- Swipe left: Edit, Archive, Delete
- Swipe right: Duplicate, Toggle Status
- Bulk selection mode with floating action bar
```

**US025.6.3**: Seller Orders Swipe Actions

```
As a seller managing orders on mobile
I want to swipe orders for quick actions
So that I can process orders faster

Acceptance Criteria:
- Swipe left: View Details, Print Invoice
- Swipe right: Update Status, Contact Customer
- Order card shows status, amount, customer
```

---

### F025.7: Admin Dashboard Integration

**Priority**: P1 (High)

#### Integration Status

| File                                | Components                                               | Status  |
| ----------------------------------- | -------------------------------------------------------- | ------- |
| `src/app/admin/page.tsx`            | MobileQuickActions                                       | 🔲 Todo |
| `src/app/admin/users/page.tsx`      | MobileDataTable, MobileSwipeActions, MobilePullToRefresh | 🔲 Todo |
| `src/app/admin/products/page.tsx`   | MobileDataTable, MobileSwipeActions, MobilePullToRefresh | 🔲 Todo |
| `src/app/admin/orders/page.tsx`     | MobileDataTable, MobilePullToRefresh                     | 🔲 Todo |
| `src/app/admin/shops/page.tsx`      | MobileDataTable, MobileSwipeActions                      | 🔲 Todo |
| `src/app/admin/categories/page.tsx` | MobileDataTable, MobileSwipeActions                      | 🔲 Todo |
| `src/app/admin/reviews/page.tsx`    | MobileDataTable, MobileSwipeActions                      | 🔲 Todo |
| `src/app/admin/blog/page.tsx`       | MobileDataTable, MobileSwipeActions                      | 🔲 Todo |
| `src/app/admin/banners/page.tsx`    | MobileDataTable, MobileSwipeActions                      | 🔲 Todo |
| `src/app/admin/settings/page.tsx`   | MobileFormInput                                          | 🔲 Todo |

#### User Stories

**US025.7.1**: Admin Users Management Mobile

```
As an admin managing users on mobile
I want efficient user management controls
So that I can moderate users from anywhere

Acceptance Criteria:
- Users display as MobileDataTable (cards on mobile)
- Swipe left: View, Edit, Suspend
- Swipe right: Verify, Delete
- Pull to refresh user list
- Search filters as MobileBottomSheet
```

**US025.7.2**: Admin Quick Actions

```
As an admin on mobile dashboard
I want quick access to common actions
So that I can perform admin tasks efficiently

Acceptance Criteria:
- FAB shows: Add User, Add Category, View Reports
- Each action opens relevant form/page
- Badge shows pending actions count
```

---

### F025.8: Checkout Integration

**Priority**: P0 (Critical)

#### Integration Status

| File                                           | Components                         | Status  |
| ---------------------------------------------- | ---------------------------------- | ------- |
| `src/app/checkout/page.tsx`                    | MobileBottomSheet, MobileFormInput | 🔲 Todo |
| `src/components/checkout/AddressSelector.tsx`  | MobileActionSheet                  | 🔲 Todo |
| `src/components/checkout/PaymentMethod.tsx`    | MobileActionSheet                  | 🔲 Todo |
| `src/components/checkout/ShopOrderSummary.tsx` | MobileBottomSheet                  | 🔲 Todo |

#### User Stories

**US025.8.1**: Address Selection Action Sheet

```
As a mobile user selecting address at checkout
I want addresses presented as an action sheet
So that I can quickly select my delivery address

Acceptance Criteria:
- Current address shown with "Change" button
- Tap opens MobileActionSheet with saved addresses
- Each address is tappable card
- "Add New Address" option at bottom
- Selected address highlighted
```

**US025.8.2**: Payment Method Selection

```
As a mobile user selecting payment method
I want payment options as an action sheet
So that I can choose my payment method easily

Acceptance Criteria:
- Current method shown with "Change" button
- MobileActionSheet shows available methods
- Each method shows logo and name
- UPI/Card forms open as MobileBottomSheet
```

---

### F025.9: Loading States Integration

**Priority**: P1 (High)

#### Integration Status

| Page/Component   | Skeleton Type       | Status  |
| ---------------- | ------------------- | ------- |
| Product Grid     | ProductCardSkeleton | 🔲 Todo |
| Product Detail   | Custom skeleton     | 🔲 Todo |
| Order List       | OrderCardSkeleton   | 🔲 Todo |
| Cart             | CartItemSkeleton    | 🔲 Todo |
| User Profile     | ProfileSkeleton     | 🔲 Todo |
| Seller Dashboard | StatCardSkeleton    | 🔲 Todo |
| Admin Tables     | TableRowSkeleton    | 🔲 Todo |

#### User Stories

**US025.9.1**: Universal Loading Skeletons

```
As a mobile user waiting for content
I want visual feedback that content is loading
So that I know the app is working

Acceptance Criteria:
- All pages show appropriate skeletons while loading
- Skeletons match the layout of actual content
- Subtle shimmer animation
- Smooth transition to actual content
```

---

### F025.10: Notifications & Confirmations

**Priority**: P1 (High)

#### Integration Status

| Component     | Mobile Integration              | Status  |
| ------------- | ------------------------------- | ------- |
| ConfirmDialog | MobileActionSheet on mobile     | 🔲 Todo |
| Toast         | Position adjustments for mobile | 🔲 Todo |
| Alert dialogs | MobileBottomSheet on mobile     | 🔲 Todo |

#### User Stories

**US025.10.1**: Mobile Confirm Dialogs

```
As a mobile user confirming actions
I want confirmation dialogs as action sheets
So that they're easier to interact with

Acceptance Criteria:
- Destructive confirmations use MobileActionSheet
- Delete/Cancel actions at bottom
- Swipe down to dismiss (cancels action)
- Large touch targets for buttons
```

---

### F025.11: Reusable Filter Sections

**Priority**: P0 (Critical)

#### Overview

Create reusable mobile-optimized filter section components that can be composed into different filter panels. This eliminates duplicate filter code across ProductFilters, AuctionFilters, ReviewFilters, etc.

#### New Components to Create

| Component                     | Description                                 | Used In                     |
| ----------------------------- | ------------------------------------------- | --------------------------- |
| `MobileCategoryFilterSection` | Hierarchical category tree with search      | Products, Auctions, Reviews |
| `MobileShopFilterSection`     | Shop selector with verified badge           | Products, Auctions          |
| `MobilePriceRangeSection`     | Min/max price with touch-friendly slider    | Products, Auctions          |
| `MobileRatingFilterSection`   | Star rating filter with large touch targets | Products, Shops, Reviews    |
| `MobileStatusFilterSection`   | Generic status checkboxes                   | Orders, Auctions, Returns   |
| `MobileDateRangeSection`      | Date picker for filtering                   | Orders, Auctions, Analytics |
| `MobileFilterWrapper`         | MobileBottomSheet wrapper for all filters   | All filter panels           |

#### Integration Status

| File                                         | Reusable Sections                            | Status  |
| -------------------------------------------- | -------------------------------------------- | ------- |
| `src/components/filters/ProductFilters.tsx`  | CategorySection, PriceSection, RatingSection | 🔲 Todo |
| `src/components/filters/AuctionFilters.tsx`  | CategorySection, PriceSection, StatusSection | 🔲 Todo |
| `src/components/filters/ReviewFilters.tsx`   | CategorySection, RatingSection               | 🔲 Todo |
| `src/components/filters/ShopFilters.tsx`     | RatingSection, StatusSection                 | 🔲 Todo |
| `src/components/filters/OrderFilters.tsx`    | StatusSection, DateRangeSection              | 🔲 Todo |
| `src/components/filters/CouponFilters.tsx`   | StatusSection, DateRangeSection              | 🔲 Todo |
| `src/components/filters/UserFilters.tsx`     | StatusSection, RoleSection                   | 🔲 Todo |
| `src/components/filters/CategoryFilters.tsx` | StatusSection                                | 🔲 Todo |
| `src/components/filters/ReturnFilters.tsx`   | StatusSection, DateRangeSection              | 🔲 Todo |

#### User Stories

**US025.11.1**: Mobile Category Filter

```
As a mobile user filtering by category
I want a touch-friendly category selector
So that I can easily browse categories on my phone

Acceptance Criteria:
- Opens as MobileBottomSheet when tapped
- Searchable category list
- Hierarchical tree with expand/collapse
- Checkboxes are 44px+ touch targets
- "Apply" and "Clear" buttons at bottom
- Selected count shown on filter button
```

**US025.11.2**: Mobile Price Range Filter

```
As a mobile user filtering by price
I want a touch-friendly price range selector
So that I can set min/max price easily

Acceptance Criteria:
- Touch-friendly dual-thumb slider
- Input fields for exact values with numeric keyboard
- Quick presets (Under ₹500, ₹500-₹2000, etc.)
- "Apply" button confirms selection
```

**US025.11.3**: Mobile Rating Filter

```
As a mobile user filtering by rating
I want large, easy-to-tap star ratings
So that I can filter quickly

Acceptance Criteria:
- Large star buttons (48px minimum)
- Multi-select capability
- Visual feedback on selection
- Works identically in Products, Shops, Reviews
```

---

### F025.12: Homepage & Carousel Integration

**Priority**: P0 (Critical)

#### Integration Status

| File                                                  | Components                            | Status  |
| ----------------------------------------------------- | ------------------------------------- | ------- |
| `src/app/page.tsx`                                    | MobilePullToRefresh, touch gestures   | 🔲 Todo |
| `src/components/layout/HeroCarousel.tsx`              | Swipe navigation, mobile-sized images | 🔲 Todo |
| `src/components/layout/FeaturedProductsSection.tsx`   | Touch-scroll, snap scrolling          | 🔲 Todo |
| `src/components/layout/FeaturedAuctionsSection.tsx`   | Touch-scroll, snap scrolling          | 🔲 Todo |
| `src/components/layout/FeaturedCategoriesSection.tsx` | Touch-scroll, mobile grid             | 🔲 Todo |
| `src/components/layout/FeaturedShopsSection.tsx`      | Touch-scroll, snap scrolling          | 🔲 Todo |
| `src/components/layout/FeaturedBlogsSection.tsx`      | Touch-scroll, snap scrolling          | 🔲 Todo |
| `src/components/layout/FeaturedReviewsSection.tsx`    | Mobile card layout                    | 🔲 Todo |
| `src/components/common/HorizontalScrollContainer.tsx` | Touch gestures, snap points, momentum | 🔲 Todo |

#### User Stories

**US025.12.1**: Hero Carousel Mobile

```
As a mobile user viewing the homepage
I want to swipe through hero slides
So that I can browse featured content naturally

Acceptance Criteria:
- Swipe left/right to navigate slides
- Touch/drag gestures feel natural with momentum
- Dots indicator is touch-friendly (larger on mobile)
- CTA buttons are 48px minimum height
- Images optimized for mobile viewport
- Pause auto-play on touch interaction
```

**US025.12.2**: Horizontal Product Scroll

```
As a mobile user browsing featured products
I want to swipe horizontally through products
So that I can browse quickly with one hand

Acceptance Criteria:
- Smooth horizontal scroll with momentum
- Snap scrolling (items snap to edges)
- Scroll indicators visible
- Touch targets meet 44px minimum
- No layout shift during scroll
- Cards sized appropriately for mobile (280px width)
```

**US025.12.3**: Homepage Pull-to-Refresh

```
As a mobile user on the homepage
I want to pull down to refresh content
So that I can see latest products and auctions

Acceptance Criteria:
- Pull indicator appears at threshold
- All sections refresh on release
- Smooth animation during refresh
- Loading state shows MobileSkeleton
```

---

### F025.13: Search Page Integration

**Priority**: P0 (Critical)

#### Integration Status

| File                                  | Components                                       | Status  |
| ------------------------------------- | ------------------------------------------------ | ------- |
| `src/app/search/page.tsx`             | MobilePullToRefresh, MobileBottomSheet (filters) | 🔲 Todo |
| `src/components/layout/SearchBar.tsx` | Mobile-optimized search input                    | 🔲 Todo |

#### User Stories

**US025.13.1**: Mobile Search Experience

```
As a mobile user searching for products
I want a mobile-optimized search experience
So that I can find items quickly on my phone

Acceptance Criteria:
- Search bar is sticky at top
- Full-width input on mobile
- Keyboard shows "Search" action button
- Recent searches shown as chips
- Auto-suggestions dropdown is touch-friendly
- Voice search button (if supported)
```

**US025.13.2**: Search Filters on Mobile

```
As a mobile user filtering search results
I want filters as a bottom sheet
So that I can refine results without leaving the page

Acceptance Criteria:
- Filter button shows active filter count
- Opens MobileBottomSheet with reusable filter sections
- Uses MobileCategoryFilterSection, MobilePriceRangeSection
- Tabs show tabs as horizontal scrollable pills on mobile
- Results update after applying filters
```

---

### F025.14: Static Pages Integration

**Priority**: P2 (Medium)

#### Integration Status

| File                                       | Components                            | Status  |
| ------------------------------------------ | ------------------------------------- | ------- |
| `src/app/about/page.tsx`                   | Touch-friendly navigation, safe areas | 🔲 Todo |
| `src/app/faq/page.tsx`                     | Accordion with touch targets          | 🔲 Todo |
| `src/app/contact/page.tsx`                 | MobileFormInput for form fields       | 🔲 Todo |
| `src/app/privacy-policy/page.tsx`          | Readable typography, safe areas       | 🔲 Todo |
| `src/app/terms-of-service/page.tsx`        | Readable typography, safe areas       | 🔲 Todo |
| `src/app/refund-policy/page.tsx`           | Readable typography, safe areas       | 🔲 Todo |
| `src/app/shipping-policy/page.tsx`         | Readable typography, safe areas       | 🔲 Todo |
| `src/app/cookie-policy/page.tsx`           | Readable typography, safe areas       | 🔲 Todo |
| `src/app/fees/page.tsx`                    | Readable tables, horizontal scroll    | 🔲 Todo |
| `src/app/guide/*/page.tsx`                 | Step navigation, touch-friendly       | 🔲 Todo |
| `src/components/faq/FAQSection.tsx`        | Touch-friendly accordions             | 🔲 Todo |
| `src/components/legal/LegalPageLayout.tsx` | Mobile reading mode                   | 🔲 Todo |

#### User Stories

**US025.14.1**: FAQ Accordion Mobile

```
As a mobile user browsing FAQs
I want touch-friendly accordions
So that I can easily expand/collapse questions

Acceptance Criteria:
- Accordion headers are 48px minimum height
- Clear visual feedback on tap
- Smooth expand/collapse animation
- Only one section open at a time (optional)
- Search bar to filter FAQs
```

**US025.14.2**: Legal Pages Mobile Reading

```
As a mobile user reading legal pages
I want a comfortable reading experience
So that I can read policies on my phone

Acceptance Criteria:
- Font size 16px minimum for body text
- Line height 1.6 for readability
- Table of contents as sticky navigation
- Tables horizontally scrollable
- Safe area padding for notched devices
```

---

### F025.15: Cards & Catalog Mobile Optimization

**Priority**: P0 (Critical)

#### Overview

Optimize all card components for mobile touch interactions, ensure proper sizing, and add mobile-specific features like swipe galleries and expandable content.

#### Card Components Integration

| Component              | Mobile Optimizations                                    | Status  |
| ---------------------- | ------------------------------------------------------- | ------- |
| `ProductCard.tsx`      | 44px+ touch targets, swipe image gallery, mobile sizing | 🔲 Todo |
| `AuctionCard.tsx`      | Touch targets, countdown mobile sizing, swipe gallery   | 🔲 Todo |
| `ShopCard.tsx`         | Touch targets, compact mobile variant                   | 🔲 Todo |
| `CategoryCard.tsx`     | Touch targets, mobile grid sizing                       | 🔲 Todo |
| `BlogCard.tsx`         | Touch targets, mobile typography, image sizing          | 🔲 Todo |
| `ReviewCard.tsx`       | Touch targets, expandable long content                  | 🔲 Todo |
| `CardGrid.tsx`         | Mobile-first columns (2 cols), responsive gaps          | 🔲 Todo |
| `ProductQuickView.tsx` | MobileBottomSheet on mobile, swipe gallery              | 🔲 Todo |
| `AuctionQuickView.tsx` | MobileBottomSheet on mobile, bid form optimization      | 🔲 Todo |

#### User Stories

**US025.15.1**: Product Card Mobile Touch

```
As a mobile user browsing products
I want touch-friendly product cards
So that I can interact with products easily

Acceptance Criteria:
- All buttons (Add to Cart, Favorite) are 44px minimum
- Swipe left/right on product image to see more images
- Image dots/indicators are visible and touch-friendly
- Card width optimized for 2-column grid on mobile
- Price and name text is readable (14px+ font)
- Shop name link has adequate touch padding
```

**US025.15.2**: Auction Card Mobile

```
As a mobile user viewing auctions
I want auction cards optimized for mobile
So that I can see countdown and bid quickly

Acceptance Criteria:
- Countdown timer text is large enough to read (14px+)
- "Bid Now" button is prominent and 48px height
- Current bid prominently displayed
- Swipe gallery for multiple images
- Time-sensitive badges (Ending Soon) are visible
```

**US025.15.3**: Quick View on Mobile

```
As a mobile user tapping quick view
I want a mobile-optimized quick view experience
So that I can see product details without leaving the list

Acceptance Criteria:
- Quick view opens as MobileBottomSheet (not modal)
- Image gallery is swipeable
- Add to Cart button is sticky at bottom
- Quantity selector is touch-friendly
- Sheet is draggable with snap points (50%, 90%, dismiss)
```

**US025.15.4**: Review Card Expandable

```
As a mobile user reading reviews
I want long reviews to be expandable
So that I don't have to scroll through very long content

Acceptance Criteria:
- Reviews over 3 lines show "Read more" link
- Tap to expand full review
- Media gallery is swipeable
- Helpful button is 44px minimum
```

---

### F025.16: Horizontal Scrollers & Sliders

**Priority**: P0 (Critical)

#### Overview

Optimize all horizontal scrolling components for touch gestures with momentum scrolling, snap points, and visual feedback.

#### Integration Status

| Component                       | Mobile Optimizations                               | Status  |
| ------------------------------- | -------------------------------------------------- | ------- |
| `HorizontalScrollContainer.tsx` | Touch momentum, snap scrolling, swipe hints        | 🔲 Todo |
| `HeroCarousel.tsx`              | Swipe gestures, mobile image sizes, dot indicators | 🔲 Todo |
| Featured Sections (all)         | Snap scrolling, touch momentum                     | 🔲 Todo |

#### User Stories

**US025.16.1**: Horizontal Scroll Touch Optimization

```
As a mobile user scrolling horizontal lists
I want natural swipe scrolling behavior
So that browsing feels native

Acceptance Criteria:
- Scroll momentum continues after finger lift
- Items snap to edges (scroll-snap-type: x mandatory)
- Scroll indicators show position (dots or bar)
- Partial items visible to hint at more content
- Arrow buttons hidden on mobile (swipe instead)
- Overscroll bounce effect on iOS
```

**US025.16.2**: Hero Carousel Mobile

```
As a mobile user viewing the hero carousel
I want to swipe through slides naturally
So that I can browse featured content

Acceptance Criteria:
- Swipe left/right navigates slides
- Swipe velocity affects transition speed
- Dot indicators are 8px minimum touch size
- Auto-play pauses on touch
- Images are mobile-optimized (aspect ratio, sizing)
- CTA buttons are 48px height minimum
```

---

### F025.17: Pagination & Infinite Scroll

**Priority**: P1 (High)

#### Overview

Create mobile-optimized pagination components and infinite scroll for seamless browsing of large lists.

#### New Components to Create

| Component              | Description                             | Status  |
| ---------------------- | --------------------------------------- | ------- |
| `MobilePagination`     | Touch-friendly page navigation          | 🔲 Todo |
| `MobileInfiniteScroll` | Automatic load-more on scroll           | 🔲 Todo |
| `MobileLoadMoreButton` | Large touch-friendly manual load button | 🔲 Todo |

#### Integration Status

| Page/Component   | Pagination Type                 | Status  |
| ---------------- | ------------------------------- | ------- |
| Products listing | MobileInfiniteScroll preferred  | 🔲 Todo |
| Auctions listing | MobileInfiniteScroll preferred  | 🔲 Todo |
| Search results   | MobileInfiniteScroll + filters  | 🔲 Todo |
| Admin tables     | MobilePagination (page control) | 🔲 Todo |
| Seller tables    | MobilePagination (page control) | 🔲 Todo |
| Order history    | MobileLoadMoreButton            | 🔲 Todo |
| Reviews list     | MobileInfiniteScroll            | 🔲 Todo |

#### User Stories

**US025.17.1**: Mobile Pagination

```
As a mobile user navigating paginated content
I want touch-friendly pagination controls
So that I can easily navigate between pages

Acceptance Criteria:
- Page buttons are 44px minimum touch target
- Current page clearly highlighted
- First/Last page shortcuts available
- Page count shown (e.g., "Page 3 of 10")
- Swipe left/right to change pages (optional)
```

**US025.17.2**: Infinite Scroll

```
As a mobile user browsing products
I want content to load automatically as I scroll
So that I don't have to tap "Load More" buttons

Acceptance Criteria:
- Load more triggers at 80% scroll position
- Loading indicator at bottom while fetching
- Skeleton placeholders for incoming items
- Error state with "Retry" button
- "You've seen it all" end message
- Scroll position preserved on back navigation
```

**US025.17.3**: Load More Button

```
As a mobile user preferring manual control
I want a large "Load More" button option
So that I control when to load more content

Acceptance Criteria:
- Button is 48px height, full width
- Shows "Load 20 more" with count
- Loading spinner during fetch
- Positioned above footer/bottom nav
```

---

### F025.18: Catalog & List Views

**Priority**: P1 (High)

#### Overview

Optimize the ResourceListWrapper and catalog views for mobile with collapsible filters, responsive grids, and mobile-first layouts.

#### Integration Status

| Component/Page        | Mobile Optimizations                   | Status  |
| --------------------- | -------------------------------------- | ------- |
| `ResourceListWrapper` | Mobile filter toggle, responsive stats | 🔲 Todo |
| Products catalog      | 2-column grid, sticky filter button    | 🔲 Todo |
| Auctions catalog      | 2-column grid, sticky filter button    | 🔲 Todo |
| Shops catalog         | 2-column grid, search bar optimization | 🔲 Todo |
| Categories catalog    | Grid/List toggle for mobile            | 🔲 Todo |
| Reviews catalog       | Single column, expandable cards        | 🔲 Todo |

#### User Stories

**US025.18.1**: Catalog Filter Toggle

```
As a mobile user filtering catalog items
I want a sticky filter button that opens filters
So that filters are accessible without scrolling up

Acceptance Criteria:
- Sticky "Filters" button at bottom of screen
- Shows active filter count badge
- Opens MobileBottomSheet with filter sections
- "Apply" and "Clear" buttons at bottom
- Results count updates in real-time
```

**US025.18.2**: Catalog Grid on Mobile

```
As a mobile user browsing product catalog
I want an optimized grid layout
So that I can see multiple products at once

Acceptance Criteria:
- 2-column grid on mobile (< 640px)
- Cards are appropriately sized (not too small)
- Gap between cards is consistent (12px)
- Grid expands to 3/4 columns on tablet/desktop
- View toggle (grid/list) works on mobile
```

**US025.18.3**: Mobile Stats Cards

```
As a seller/admin viewing dashboard stats
I want stats cards that work on mobile
So that I can see key metrics quickly

Acceptance Criteria:
- Stats cards are 2x2 grid on mobile
- Numbers are large enough to read
- Icons sized appropriately
- Horizontal scroll if needed
- Tap to see detailed view
```

---

### F025.19: Media Upload & Preview Components

**Priority**: P1 (High)

#### Overview

Optimize all media-related components for mobile with touch gestures, native camera/gallery integration, fullscreen capture modes, and mobile-friendly editing tools.

#### Integration Status

| Component                     | Mobile Optimizations                                    | Status  |
| ----------------------------- | ------------------------------------------------------- | ------- |
| `MediaUploader.tsx`           | Touch drop zone, native picker, camera button prominent | 🔲 Todo |
| `MediaGallery.tsx`            | Touch reorder (drag), swipe to preview, mobile lightbox | 🔲 Todo |
| `MediaPreviewCard.tsx`        | Touch targets 44px+, swipe to delete, mobile sizing     | 🔲 Todo |
| `CameraCapture.tsx`           | Fullscreen capture, orientation lock, mobile UI         | 🔲 Todo |
| `VideoRecorder.tsx`           | Fullscreen recording, large controls, duration display  | 🔲 Todo |
| `ImageEditor.tsx`             | Touch crop/rotate, pinch-to-zoom, mobile toolbar        | 🔲 Todo |
| `MediaEditorModal.tsx`        | MobileBottomSheet on mobile, fullscreen option          | 🔲 Todo |
| `VideoThumbnailGenerator.tsx` | Touch thumbnail selection, larger previews              | 🔲 Todo |
| `MediaMetadataForm.tsx`       | MobileFormInput, collapsible sections                   | 🔲 Todo |
| `InlineImageUpload.tsx`       | Larger touch target, native picker                      | 🔲 Todo |
| `UploadProgress.tsx`          | Bottom position on mobile, swipe dismiss, mini mode     | 🔲 Todo |

#### User Stories

**US025.19.1**: Mobile Media Uploader

```
As a mobile user uploading product images
I want a mobile-optimized upload experience
So that I can easily add photos from my phone

Acceptance Criteria:
- Large "Upload" button (48px+ height)
- Camera button prominently displayed
- Tap opens native file picker (camera/gallery)
- Drag-and-drop area works with touch (less emphasis)
- Preview thumbnails are touch-friendly
- Progress shown clearly during upload
- Swipe to remove uploaded items
```

**US025.19.2**: Mobile Camera Capture

```
As a mobile user taking product photos
I want a fullscreen camera experience
So that I can capture quality images easily

Acceptance Criteria:
- Camera opens fullscreen (no browser chrome if possible)
- Large capture button at bottom (64px+)
- Front/back camera toggle visible
- Flash toggle if available
- Preview before confirming
- Pinch-to-zoom if supported
- Orientation handling (portrait/landscape)
- Retake option prominent
```

**US025.19.3**: Mobile Video Recording

```
As a mobile user recording product videos
I want a native-like recording experience
So that I can create product videos easily

Acceptance Criteria:
- Fullscreen recording mode
- Large record button (64px+)
- Duration counter clearly visible
- Pause/resume functionality
- Max duration indicator
- Preview before saving
- Screen recording option visible (if supported)
```

**US025.19.4**: Mobile Image Editor

```
As a mobile user editing uploaded images
I want touch-friendly editing tools
So that I can adjust images on my phone

Acceptance Criteria:
- Pinch-to-zoom on image
- Two-finger rotate gesture
- Touch crop handles (large drag targets)
- Toolbar at bottom with large icons (48px)
- Undo/redo accessible
- Save/cancel buttons prominent
- Fullscreen editing mode
```

**US025.19.5**: Mobile Media Gallery

```
As a mobile user viewing uploaded media
I want to browse and manage media easily
So that I can organize my uploads

Acceptance Criteria:
- Grid view with touch-friendly sizing
- Long-press to select multiple
- Touch-drag to reorder
- Swipe left to reveal delete
- Tap to open in lightbox
- Lightbox supports swipe navigation
- Pinch-to-zoom in lightbox
```

**US025.19.6**: Mobile Lightbox

```
As a mobile user viewing media fullscreen
I want a native-like gallery experience
So that I can browse images naturally

Acceptance Criteria:
- Fullscreen with dark background
- Swipe left/right to navigate
- Pinch-to-zoom supported
- Double-tap to zoom
- Swipe down to dismiss
- Image counter visible (e.g., "3 of 12")
- Share button accessible
```

**US025.19.7**: Mobile Upload Progress

```
As a mobile user with active uploads
I want to see upload status without blocking UI
So that I can continue browsing while uploading

Acceptance Criteria:
- Compact progress indicator at bottom
- Shows count and overall progress
- Tap to expand full list
- Swipe left to dismiss completed
- Notification-style for background uploads
- Retry button easily accessible for failed uploads
```

---

### F025.20: Product Gallery & Zoom

**Priority**: P1 (High)

#### Overview

Optimize the ProductGallery component for mobile devices with touch-friendly image navigation, pinch-to-zoom, double-tap zoom, and swipe gestures for a native-like gallery experience.

#### Integration Status

| Component             | Mobile Optimizations                                  | Status  |
| --------------------- | ----------------------------------------------------- | ------- |
| `ProductGallery.tsx`  | Swipe navigation, pinch-to-zoom, double-tap, gestures | 🔲 Todo |
| Lightbox (in Gallery) | Fullscreen, swipe dismiss, gesture controls           | 🔲 Todo |
| Thumbnail Strip       | Touch scrolling, larger targets, horizontal scroll    | 🔲 Todo |
| Zoom Controls         | Mobile-sized buttons (48px+), bottom position         | 🔲 Todo |

#### User Stories

**US025.20.1**: Mobile Product Gallery Navigation

```
As a mobile user viewing product images
I want to swipe through images naturally
So that I can browse all product photos easily

Acceptance Criteria:
- Swipe left/right navigates between images
- Swipe velocity affects animation speed
- Current image indicator visible (dots or counter)
- Thumbnails scrollable horizontally with snap
- Tap on thumbnail navigates immediately
- Image loads progressively (blur placeholder)
```

**US025.20.2**: Mobile Zoom Gestures

```
As a mobile user wanting to see product details
I want pinch-to-zoom and double-tap zoom
So that I can examine product closely

Acceptance Criteria:
- Pinch gesture zooms in/out smoothly
- Double-tap toggles between 1x and 2x zoom
- Pan image when zoomed in
- Zoom resets when navigating to next image
- Maximum zoom level is 4x
- Smooth animation for all zoom transitions
- Visual feedback when at max/min zoom
```

**US025.20.3**: Mobile Lightbox Experience

```
As a mobile user viewing images fullscreen
I want a native-like lightbox experience
So that I can focus on product details

Acceptance Criteria:
- Tap image opens fullscreen lightbox
- Fullscreen with dark background (no browser chrome)
- Swipe left/right for navigation
- Swipe down to dismiss lightbox
- Pinch-to-zoom works in lightbox
- Double-tap zoom works in lightbox
- Image counter shows position (e.g., "3 of 8")
- Close button is touch-friendly (48px+ target)
- Navigation arrows hidden (swipe instead)
```

**US025.20.4**: Mobile Thumbnail Strip

```
As a mobile user viewing product gallery
I want an accessible thumbnail strip
So that I can quickly navigate to any image

Acceptance Criteria:
- Thumbnails are horizontally scrollable
- Each thumbnail is minimum 60px wide
- Active thumbnail has visible indicator
- Snap scrolling on thumbnail strip
- Touch momentum scrolling enabled
- Gap between thumbnails is consistent
- Can scroll to any thumbnail easily
```

---

## Implementation Checklist

### Phase 1: Critical User Flows (Week 1-2)

- [x] Root layout (MobileInstallPrompt, MobileOfflineIndicator)
- [x] Admin layout (MobileAdminSidebar)
- [x] Seller layout (MobileSellerSidebar)
- [x] BottomNav safe areas
- [x] MobileSidebar animations
- [x] CartItem swipe actions
- [x] Orders page (MobileDataTable, MobilePullToRefresh)
- [x] AddressForm (MobileBottomSheet, MobileFormInput)
- [ ] Login form (MobileFormInput)
- [ ] Register form (MobileFormInput)
- [ ] Checkout flow (MobileBottomSheet, MobileFormInput)

### Phase 2: Browsing Experience (Week 2-3)

- [ ] Products page (MobilePullToRefresh, MobileSkeleton)
- [ ] Product detail (MobileActionSheet, MobileBottomSheet)
- [ ] Auctions page (MobilePullToRefresh)
- [ ] Auction detail (MobileBottomSheet for bids)
- [ ] Search page (MobileBottomSheet for filters)
- [ ] Cart page (MobilePullToRefresh)
- [ ] Wishlist page (MobileSwipeActions)

### Phase 3: User Dashboard (Week 3-4)

- [ ] User profile (MobileFormInput)
- [ ] User addresses (MobileSwipeActions)
- [ ] User wishlist (MobileSwipeActions, MobilePullToRefresh)
- [ ] User bids (MobileDataTable)
- [ ] Order detail (MobileActionSheet)

### Phase 4: Seller Dashboard (Week 4-5)

- [ ] Seller dashboard (MobileQuickActions)
- [ ] Seller products list (MobileDataTable, MobileSwipeActions)
- [ ] Seller orders (MobileDataTable, MobileSwipeActions)
- [ ] Seller auctions list (MobileDataTable)
- [ ] **Seller product create wizard** (6-step, MobileFormInput, MobileFormSelect)
- [ ] **Seller product edit page** (MobileFormInput, MobileFormSelect)
- [ ] **Seller auction create wizard** (MobileFormInput, MobileFormSelect)
- [ ] **Seller auction edit page** (MobileFormInput, MobileFormSelect)
- [ ] **Seller shop create page** (MobileFormInput, MobileFormSelect)
- [ ] **Seller shop edit page** (MobileFormInput, MobileFormSelect)
- [ ] **Seller coupon create page** (MobileFormInput, MobileFormSelect)
- [ ] **Seller coupon edit page** (MobileFormInput, MobileFormSelect)

### Phase 5: Admin Dashboard (Week 5-6)

- [ ] Admin dashboard (MobileQuickActions)
- [ ] Admin users (MobileDataTable, MobileSwipeActions)
- [ ] Admin products list (MobileDataTable, MobileSwipeActions)
- [ ] Admin orders (MobileDataTable)
- [ ] Admin shops list (MobileDataTable, MobileSwipeActions)
- [ ] Admin categories list (MobileDataTable, MobileSwipeActions)
- [ ] Admin settings (MobileFormInput)
- [ ] **Admin product edit page** (MobileFormInput, MobileFormSelect)
- [ ] **Admin category create wizard** (4-step, MobileFormInput, MobileFormSelect)
- [ ] **Admin category edit page** (MobileFormInput, MobileFormSelect)
- [ ] **Admin blog create page** (MobileFormInput, MobileFormSelect)
- [ ] **Admin blog edit page** (MobileFormInput, MobileFormSelect)
- [ ] **Admin coupon create page** (MobileFormInput, MobileFormSelect)
- [ ] **Admin coupon edit page** (MobileFormInput, MobileFormSelect)
- [ ] **Admin hero-slide create page** (MobileFormInput)
- [ ] **Admin hero-slide edit page** (MobileFormInput)
- [ ] **Admin shop edit page** (MobileFormInput, MobileFormSelect)

### Phase 6: Polish & Edge Cases (Week 6)

- [ ] All confirm dialogs → MobileActionSheet
- [ ] All loading states → MobileSkeleton
- [ ] Review form (MobileBottomSheet)
- [ ] Contact form (MobileFormInput)
- [ ] Feedback collection
- [ ] Performance testing

### Phase 7: Reusable Filter Sections (Week 6-7)

- [ ] Create `MobileCategoryFilterSection` component
- [ ] Create `MobileShopFilterSection` component
- [ ] Create `MobilePriceRangeSection` component
- [ ] Create `MobileRatingFilterSection` component
- [ ] Create `MobileStatusFilterSection` component
- [ ] Create `MobileDateRangeSection` component
- [ ] Create `MobileFilterWrapper` (BottomSheet wrapper)
- [ ] Refactor `ProductFilters.tsx` to use reusable sections
- [ ] Refactor `AuctionFilters.tsx` to use reusable sections
- [ ] Refactor `ReviewFilters.tsx` to use reusable sections
- [ ] Refactor `ShopFilters.tsx` to use reusable sections
- [ ] Refactor `OrderFilters.tsx` to use reusable sections
- [ ] Refactor `CouponFilters.tsx` to use reusable sections
- [ ] Refactor `UserFilters.tsx` to use reusable sections
- [ ] Refactor `ReturnFilters.tsx` to use reusable sections

### Phase 8: Homepage & Carousels (Week 7)

- [ ] Homepage pull-to-refresh
- [ ] HeroCarousel swipe gestures
- [ ] HeroCarousel mobile-optimized images
- [ ] HorizontalScrollContainer snap scrolling
- [ ] HorizontalScrollContainer touch momentum
- [ ] FeaturedProductsSection mobile cards
- [ ] FeaturedAuctionsSection mobile cards
- [ ] FeaturedCategoriesSection mobile grid
- [ ] FeaturedShopsSection mobile cards
- [ ] FeaturedBlogsSection mobile cards
- [ ] FeaturedReviewsSection mobile layout

### Phase 9: Search & Static Pages (Week 7-8)

- [ ] Search page mobile filters (MobileBottomSheet)
- [ ] SearchBar mobile optimization
- [ ] Search results tabs as horizontal pills
- [ ] About page mobile layout
- [ ] FAQ accordion touch targets
- [ ] Contact page MobileFormInput
- [ ] Legal pages mobile reading mode
- [ ] Fees page horizontal scrollable tables
- [ ] Guide pages step navigation

### Phase 10: Cards & Catalog (Week 8-9)

- [ ] ProductCard touch targets (44px+ buttons)
- [ ] ProductCard swipe image gallery
- [ ] ProductCard mobile sizing optimization
- [ ] AuctionCard touch targets
- [ ] AuctionCard countdown mobile sizing
- [ ] AuctionCard swipe image gallery
- [ ] ShopCard mobile compact variant
- [ ] CategoryCard mobile grid sizing
- [ ] BlogCard mobile typography
- [ ] ReviewCard expandable long content
- [ ] CardGrid mobile-first columns (2-col default)
- [ ] ProductQuickView → MobileBottomSheet on mobile
- [ ] AuctionQuickView → MobileBottomSheet on mobile
- [ ] All skeleton components mobile sizing

### Phase 11: Horizontal Scrollers & Sliders (Week 9)

- [ ] HorizontalScrollContainer touch momentum
- [ ] HorizontalScrollContainer snap scrolling (scroll-snap-type: x mandatory)
- [ ] HorizontalScrollContainer swipe hints (partial items visible)
- [ ] HorizontalScrollContainer hide arrows on mobile
- [ ] HeroCarousel swipe navigation
- [ ] HeroCarousel dot indicators touch-friendly (8px min)
- [ ] HeroCarousel mobile image optimization
- [ ] All Featured\*Section components snap scrolling

### Phase 12: Pagination & Infinite Scroll (Week 9-10)

- [ ] Create `MobilePagination` component
- [ ] Create `MobileInfiniteScroll` component
- [ ] Create `MobileLoadMoreButton` component
- [ ] Products listing → MobileInfiniteScroll
- [ ] Auctions listing → MobileInfiniteScroll
- [ ] Search results → MobileInfiniteScroll
- [ ] Admin tables → MobilePagination
- [ ] Seller tables → MobilePagination
- [ ] Order history → MobileLoadMoreButton
- [ ] Reviews list → MobileInfiniteScroll

### Phase 13: Catalog & List Views (Week 10)

- [ ] ResourceListWrapper mobile filter toggle
- [ ] ResourceListWrapper responsive stats cards
- [ ] Products catalog 2-column grid + sticky filter button
- [ ] Auctions catalog 2-column grid + sticky filter button
- [ ] Shops catalog 2-column grid
- [ ] Categories catalog Grid/List toggle
- [ ] Reviews catalog single column expandable

### Phase 14: Media Upload & Preview (Week 10-11)

- [ ] MediaUploader touch-friendly drop zone
- [ ] MediaUploader native file picker integration
- [ ] MediaUploader camera button prominence
- [ ] MediaGallery touch reorder (drag)
- [ ] MediaGallery swipe to preview
- [ ] MediaGallery mobile lightbox
- [ ] MediaPreviewCard touch targets (44px+)
- [ ] MediaPreviewCard swipe to delete
- [ ] CameraCapture fullscreen mode
- [ ] CameraCapture orientation handling
- [ ] CameraCapture mobile-sized controls (64px capture button)
- [ ] VideoRecorder fullscreen recording
- [ ] VideoRecorder large controls
- [ ] VideoRecorder duration display
- [ ] ImageEditor touch crop/rotate
- [ ] ImageEditor pinch-to-zoom
- [ ] ImageEditor mobile toolbar (bottom, 48px icons)
- [ ] MediaEditorModal → MobileBottomSheet on mobile
- [ ] VideoThumbnailGenerator touch selection
- [ ] MediaMetadataForm MobileFormInput
- [ ] InlineImageUpload larger touch target
- [ ] UploadProgress mobile position (bottom)
- [ ] UploadProgress swipe dismiss
- [ ] UploadProgress compact/mini mode
- [ ] Mobile Lightbox swipe navigation
- [ ] Mobile Lightbox pinch-to-zoom
- [ ] Mobile Lightbox double-tap zoom

### Phase 15: Product Gallery & Zoom (Week 11)

- [ ] ProductGallery swipe navigation between images
- [ ] ProductGallery pinch-to-zoom gesture
- [ ] ProductGallery double-tap zoom toggle
- [ ] ProductGallery pan when zoomed
- [ ] ProductGallery lightbox fullscreen mode
- [ ] ProductGallery lightbox swipe dismiss
- [ ] ProductGallery lightbox navigation gestures
- [ ] ProductGallery thumbnail strip horizontal scroll
- [ ] ProductGallery thumbnail snap scrolling
- [ ] ProductGallery thumbnail touch targets (60px+)
- [ ] ProductGallery image counter display
- [ ] ProductGallery zoom reset on navigation
- [ ] ProductGallery progressive image loading

---

## Technical Guidelines

### Integration Pattern

```tsx
// Example: Integrating MobilePullToRefresh
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";

export default function ProductsPage() {
  const handleRefresh = async () => {
    await refetchProducts();
  };

  return (
    <MobilePullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen">{/* Page content */}</div>
    </MobilePullToRefresh>
  );
}
```

```tsx
// Example: Integrating MobileSwipeActions
import {
  MobileSwipeActions,
  createDeleteAction,
  createEditAction,
} from "@/components/mobile/MobileSwipeActions";

function ListItem({ item, onEdit, onDelete }) {
  return (
    <>
      {/* Mobile: Swipe actions */}
      <div className="sm:hidden">
        <MobileSwipeActions
          rightActions={[createDeleteAction(() => onDelete(item.id))]}
          leftActions={[createEditAction(() => onEdit(item.id))]}
        >
          <ItemContent item={item} />
        </MobileSwipeActions>
      </div>

      {/* Desktop: Regular with action buttons */}
      <div className="hidden sm:block">
        <ItemContent item={item} showActions />
      </div>
    </>
  );
}
```

```tsx
// Example: Integrating MobileFormInput
import { MobileFormInput } from "@/components/mobile/MobileFormInput";

function ContactForm() {
  return (
    <form>
      {/* Mobile-optimized inputs */}
      <div className="sm:hidden">
        <MobileFormInput
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      {/* Desktop inputs */}
      <div className="hidden sm:block">
        <input type="email" className="input" {...register("email")} />
      </div>
    </form>
  );
}
```

### CSS Utilities Available

```css
/* Safe areas */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
.pl-safe {
  padding-left: env(safe-area-inset-left);
}
.pr-safe {
  padding-right: env(safe-area-inset-right);
}

/* Touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
.touch-target-lg {
  min-height: 48px;
  min-width: 48px;
}

/* Mobile inputs */
.mobile-input {
  min-height: 48px;
  font-size: 16px;
}
.mobile-btn {
  min-height: 48px;
}

/* Animations */
.animate-slide-in-left {
  animation: slide-in-left 0.3s ease-out;
}
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

---

## Acceptance Criteria

- [ ] All list views have pull-to-refresh on mobile
- [ ] All list items have swipe actions where applicable
- [ ] All forms use MobileFormInput on mobile
- [ ] All modals use MobileBottomSheet on mobile
- [ ] All context menus use MobileActionSheet on mobile
- [ ] All loading states use MobileSkeleton
- [ ] All fixed elements have safe area padding
- [ ] All touch targets are minimum 44px
- [ ] All pages work on 320px width screens

---

## Dependencies

- E024: Mobile PWA Experience (component creation) - ✅ Complete

## Related Epics

- E001: User Management
- E004: Shopping Cart
- E005: Order Management
- E006: Shop Management
- E007: Product Management
- E008: Auction Management
- E011: Payment System
- E017: Admin Dashboard

---

## Metrics

### Success Metrics

- Mobile bounce rate decreases by 20%
- Mobile conversion rate increases by 15%
- Mobile session duration increases by 25%
- Mobile task completion rate > 90%

### Performance Metrics

- First Contentful Paint < 1.5s on 3G
- Largest Contentful Paint < 2.5s on 3G
- Time to Interactive < 3s on 3G
- Cumulative Layout Shift < 0.1
