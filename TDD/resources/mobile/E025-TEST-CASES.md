# E025: Mobile Component Integration Test Cases

## Overview

Comprehensive test cases for Mobile Component Integration across all application areas. These tests verify that mobile components are properly integrated into all pages, forms, layouts, and user flows.

**Epic**: E025 - Mobile Component Integration  
**Last Updated**: November 29, 2025  
**Status**: 🔲 Pending Implementation

---

## TC-025-001: Form Input Integration Tests

### TC-025-001-01: Login Form Mobile Inputs

```
Scenario: Login form uses MobileFormInput on mobile
Given: User is on /login page on mobile device
When: Form renders
Then: Email input uses MobileFormInput component
And: Password input uses MobileFormInput component
And: Inputs have 48px minimum height
And: Email input has type="email" for mobile keyboard
And: Password input has show/hide toggle
And: Submit button is 48px height with full width
```

### TC-025-001-02: Register Form Mobile Inputs

```
Scenario: Register form uses MobileFormInput on mobile
Given: User is on /register page on mobile device
When: Form renders
Then: All text inputs use MobileFormInput component
And: Phone input has type="tel" for numeric keyboard
And: Terms checkbox has 44x44px touch target
And: Password strength indicator visible
And: Form scrolls smoothly on small screens
```

### TC-025-001-03: Checkout Form Mobile Inputs

```
Scenario: Checkout uses mobile-optimized form components
Given: User is on /checkout on mobile device
When: Address step renders
Then: All address fields use MobileFormInput
And: State/Country use MobileFormSelect with native picker
And: Postal code input has numeric keyboard
And: Phone input has tel keyboard
And: Form submits via MobileBottomSheet on mobile
```

### TC-025-001-04: Seller Product Form Mobile

```
Scenario: Seller product creation uses mobile components
Given: Seller is on /seller/products/new on mobile
When: Product form wizard loads
Then: All text inputs use MobileFormInput
And: Category selector uses MobileFormSelect
And: Price/quantity inputs have numeric keyboard
And: Media uploader is touch-optimized
And: Each wizard step fits on mobile viewport
And: Step navigation is swipeable
```

### TC-025-001-05: Seller Auction Form Mobile

```
Scenario: Seller auction creation uses mobile components
Given: Seller is on /seller/auctions/new on mobile
When: Auction form wizard loads
Then: All inputs use MobileFormInput
And: Date/time pickers use native mobile pickers
And: Starting price has numeric keyboard
And: Duration selector uses MobileFormSelect
And: Preview step shows mobile-optimized layout
```

### TC-025-001-06: Admin Category Form Mobile

```
Scenario: Admin category creation uses mobile components
Given: Admin is on /admin/categories/new on mobile
When: Category wizard loads
Then: Name input uses MobileFormInput
And: Parent category uses hierarchical MobileFormSelect
And: Icon/image upload is touch-friendly
And: SEO fields are collapsible on mobile
```

---

## TC-025-002: Pull-to-Refresh Integration Tests

### TC-025-002-01: Products Page Pull-to-Refresh

```
Scenario: Products page supports pull-to-refresh
Given: User is on /products on mobile
When: User pulls down from top of list
Then: Loading indicator appears at top
And: Pull distance threshold is 80px
When: User releases after threshold
Then: Product list refreshes
And: Loading indicator animates
And: Fresh data loads
And: Scroll position maintained at top
```

### TC-025-002-02: Auctions Page Pull-to-Refresh

```
Scenario: Auctions page supports pull-to-refresh
Given: User is on /auctions on mobile
When: User pulls down from top
Then: Pull-to-refresh triggers
And: Auction countdown timers reset
And: Bid counts update
And: New auctions appear if available
```

### TC-025-002-03: User Orders Pull-to-Refresh

```
Scenario: User orders support pull-to-refresh
Given: User is on /user/orders on mobile
When: User pulls down
Then: Orders list refreshes
And: Status updates reflect current state
And: New orders appear at top
```

### TC-025-002-04: Seller Dashboard Pull-to-Refresh

```
Scenario: Seller dashboard supports pull-to-refresh
Given: Seller is on /seller on mobile
When: Seller pulls down
Then: Dashboard stats refresh
And: Recent orders update
And: Revenue numbers update
And: Pending actions count updates
```

### TC-025-002-05: Admin Dashboard Pull-to-Refresh

```
Scenario: Admin dashboard supports pull-to-refresh
Given: Admin is on /admin on mobile
When: Admin pulls down
Then: All dashboard cards refresh
And: User count updates
And: Order count updates
And: Revenue figures update
```

---

## TC-025-003: Swipe Actions Integration Tests

### TC-025-003-01: Cart Items Swipe Actions

```
Scenario: Cart items have swipe-to-delete
Given: User has items in cart on mobile
When: User swipes left on cart item
Then: Delete action slides in from right (red background)
And: Delete icon/text visible
When: User taps delete or completes swipe
Then: Item removed with animation
And: Cart total updates
And: Undo toast appears for 5 seconds
```

### TC-025-003-02: Wishlist Swipe Actions

```
Scenario: Wishlist items have swipe actions
Given: User is on /user/favorites on mobile
When: User swipes left on wishlist item
Then: Delete action revealed
When: User swipes right on wishlist item
Then: "Add to Cart" action revealed
And: Swipe completes action
```

### TC-025-003-03: Address List Swipe Actions

```
Scenario: Saved addresses have swipe actions
Given: User is on /user/addresses on mobile
When: User swipes left on address
Then: Edit and Delete actions revealed
And: Actions are 44px minimum width
When: User taps Edit
Then: Address form opens in MobileBottomSheet
```

### TC-025-003-04: Seller Products Swipe Actions

```
Scenario: Seller products have swipe actions
Given: Seller is on /seller/products on mobile
When: Seller swipes left on product
Then: Edit, Delete actions revealed
When: Seller swipes right on product
Then: Quick status toggle action revealed
And: Can quickly mark out-of-stock
```

### TC-025-003-05: Seller Orders Swipe Actions

```
Scenario: Seller orders have swipe actions
Given: Seller is on /seller/orders on mobile
When: Seller swipes right on pending order
Then: "Accept" quick action revealed
When: Seller swipes left
Then: "View Details" action revealed
```

### TC-025-003-06: Admin Users Swipe Actions

```
Scenario: Admin users list has swipe actions
Given: Admin is on /admin/users on mobile
When: Admin swipes left on user
Then: Ban/Edit/View actions revealed
And: Ban action has red background
And: Actions fit in swipe container
```

---

## TC-025-004: MobileDataTable Integration Tests

### TC-025-004-01: Orders Table Mobile

```
Scenario: Orders display as cards on mobile
Given: User is on orders page on mobile
When: Orders render
Then: Each order displays as card (not table row)
And: Order ID visible
And: Status badge visible with color
And: Date shown in relative format ("2 days ago")
And: Total amount prominent
And: Tap opens order detail
```

### TC-025-004-02: User Bids Table Mobile

```
Scenario: User bids display as cards on mobile
Given: User is on /user/bids on mobile
When: Bids list renders
Then: Each bid shows as card
And: Auction thumbnail visible
And: Current bid status visible (Winning/Outbid/Won/Lost)
And: Bid amount prominent
And: Time remaining if active
And: Tap opens auction detail
```

### TC-025-004-03: Seller Products Table Mobile

```
Scenario: Seller products display as cards on mobile
Given: Seller is on /seller/products on mobile
When: Products render
Then: Grid of product cards displayed
And: Each card shows image, name, price
And: Stock indicator visible (In Stock/Low/Out)
And: Status badge (Published/Draft)
And: Actions via long-press or swipe
```

### TC-025-004-04: Admin Tables Mobile

```
Scenario: Admin data tables adapt to mobile
Given: Admin views any admin list page on mobile
When: Data renders
Then: Card layout used instead of table
And: Key columns visible per card
And: Pagination uses MobilePagination
And: Bulk select checkbox on each card
And: Bulk action bar at bottom
```

---

## TC-025-005: MobileBottomSheet Integration Tests

### TC-025-005-01: Product Detail Actions

```
Scenario: Product actions use MobileBottomSheet
Given: User is on product detail on mobile
When: User taps "More Options" or share icon
Then: MobileBottomSheet opens from bottom
And: Options include: Share, Add to Wishlist, Report
And: Each option has icon and text
And: Sheet is draggable
And: Tap outside or swipe down closes
```

### TC-025-005-02: Auction Bid Sheet

```
Scenario: Placing bid uses MobileBottomSheet
Given: User is on auction detail on mobile
When: User taps "Place Bid"
Then: MobileBottomSheet opens
And: Current highest bid displayed
And: Bid input with increment buttons
And: Quick bid buttons (+₹100, +₹500, +₹1000)
And: Submit bid button at bottom
And: Sheet height is 70% of screen
```

### TC-025-005-03: Filter Bottom Sheet

```
Scenario: Filters open in MobileBottomSheet
Given: User is on products page on mobile
When: User taps "Filters" button
Then: MobileBottomSheet opens with filter sections
And: Each filter section is collapsible
And: Apply/Clear buttons sticky at bottom
And: Active filter count shown
And: Results count updates in real-time
```

### TC-025-005-04: Review Form Bottom Sheet

```
Scenario: Review form uses MobileBottomSheet
Given: User is on product they purchased
When: User taps "Write a Review"
Then: MobileBottomSheet opens (fullscreen mode)
And: Star rating selector touch-friendly
And: Text area for review
And: Image upload section
And: Submit button fixed at bottom
And: Can dismiss with swipe down
```

### TC-025-005-05: Contact Form Bottom Sheet

```
Scenario: Contact seller uses MobileBottomSheet
Given: User is on product/shop page on mobile
When: User taps "Contact Seller"
Then: MobileBottomSheet opens
And: Product context shown at top
And: Message input area
And: Attachment option
And: Send button at bottom
```

---

## TC-025-006: MobileActionSheet Integration Tests

### TC-025-006-01: Confirm Delete Action

```
Scenario: Delete confirmations use MobileActionSheet
Given: User is about to delete something
When: Delete action triggered
Then: MobileActionSheet slides up
And: Destructive action (Delete) in red
And: Cancel button below
And: Description of what will be deleted
And: Tap outside dismisses (cancel)
```

### TC-025-006-02: Order Status Actions

```
Scenario: Order status changes use MobileActionSheet
Given: Seller is on order detail on mobile
When: Seller taps "Update Status"
Then: MobileActionSheet with status options
And: Current status highlighted
And: Available next statuses shown
And: Cancel button at bottom
```

### TC-025-006-03: Bulk Actions Sheet

```
Scenario: Bulk actions use MobileActionSheet
Given: Admin has selected multiple items
When: Admin taps "Actions"
Then: MobileActionSheet with available bulk actions
And: Destructive actions (Delete All) in red at top
And: Other actions below
And: Count of selected items shown
```

---

## TC-025-007: MobileSkeleton Integration Tests

### TC-025-007-01: Product Cards Loading

```
Scenario: Product cards show skeleton while loading
Given: User navigates to /products on mobile
When: Products are loading
Then: MobileSkeleton placeholders shown
And: Skeleton matches product card dimensions
And: Pulse animation visible
And: Grid layout maintained
And: Skeleton count matches expected items
```

### TC-025-007-02: Order Cards Loading

```
Scenario: Order cards show skeleton while loading
Given: User navigates to orders on mobile
When: Orders are loading
Then: MobileSkeleton cards displayed
And: Skeleton shows card shape
And: Status badge placeholder
And: Animation smooth
```

### TC-025-007-03: Dashboard Stats Loading

```
Scenario: Dashboard stats show skeleton while loading
Given: Seller navigates to dashboard on mobile
When: Dashboard is loading
Then: Stat cards show skeleton
And: Chart areas show skeleton
And: Recent orders section shows skeleton
And: All skeletons have consistent animation
```

---

## TC-025-008: Reusable Filter Section Tests

### TC-025-008-01: Category Filter Section

```
Scenario: MobileCategoryFilterSection works across pages
Given: User opens filters on products page
When: Category section renders
Then: Hierarchical tree displayed
And: Search bar at top for filtering
And: Parent categories expandable
And: Selected categories have checkmarks
And: Same component works on auctions page
And: Same component works on reviews page
```

### TC-025-008-02: Price Range Section

```
Scenario: MobilePriceRangeSection works with touch
Given: User opens price filter on mobile
When: Price section renders
Then: Min/Max inputs with numeric keyboard
And: Touch slider for range selection
And: Preset buttons (Under ₹500, ₹500-2000, etc.)
And: Works identically on products and auctions
```

### TC-025-008-03: Rating Filter Section

```
Scenario: MobileRatingFilterSection has touch targets
Given: User opens rating filter on mobile
When: Rating section renders
Then: Star buttons are 48px+ touch targets
And: Can select "4 stars & up"
And: Visual feedback on selection
And: Works on products, shops, reviews pages
```

### TC-025-008-04: Status Filter Section

```
Scenario: MobileStatusFilterSection is reusable
Given: User opens filters on orders page
When: Status section renders
Then: Checkboxes for each status (Pending, Processing, etc.)
And: Checkboxes have 44px+ touch targets
And: Multi-select allowed
And: Same component on returns, auctions, coupons pages
```

### TC-025-008-05: Date Range Section

```
Scenario: MobileDateRangeSection uses native pickers
Given: User opens date filter on mobile
When: Date section renders
Then: From/To date inputs
And: Tapping opens native date picker
And: Preset options (Today, This Week, This Month)
And: Works on orders, auctions, analytics
```

---

## TC-025-009: Cards & Catalog Mobile Tests

### TC-025-009-01: ProductCard Touch Targets

```
Scenario: ProductCard has mobile-friendly touch targets
Given: ProductCard renders on mobile
When: Measuring interactive elements
Then: "Add to Cart" button is 48px+ height
And: Wishlist heart icon is 44x44px
And: Quick view button is 44x44px
And: Card tap area covers full card
And: Image swipe gallery works on mobile
```

### TC-025-009-02: AuctionCard Mobile Layout

```
Scenario: AuctionCard optimized for mobile
Given: AuctionCard renders on mobile
When: Card displays
Then: Countdown timer text is readable (14px+)
And: Current bid prominent
And: "Bid Now" button is 48px height
And: Bid count visible
And: Card fits in 2-column grid
```

### TC-025-009-03: CardGrid Mobile Columns

```
Scenario: CardGrid uses mobile-first columns
Given: Product listing on mobile (< 640px)
When: Grid renders
Then: 2-column grid displayed
And: Gap between cards is 12px
And: Cards have consistent height
And: Scrolling is smooth
When: On tablet (640-1024px)
Then: 3-column grid
When: On desktop (> 1024px)
Then: 4-column grid
```

### TC-025-009-04: QuickView as MobileBottomSheet

```
Scenario: ProductQuickView uses MobileBottomSheet
Given: User taps quick view on mobile
When: Quick view opens
Then: MobileBottomSheet slides up
And: Product image gallery swipeable
And: Key info visible (price, stock, description)
And: "Add to Cart" button prominent
And: Can swipe down to dismiss
```

---

## TC-025-010: Horizontal Scroller Tests

### TC-025-010-01: Featured Products Snap Scroll

```
Scenario: Featured products scroll with snap
Given: User views featured products section on mobile
When: User swipes horizontally
Then: Scroll has momentum (continues after finger lift)
And: Items snap to edges (scroll-snap-type: x mandatory)
And: Partial next item visible (hints more content)
And: Arrow buttons hidden on mobile
```

### TC-025-010-02: Hero Carousel Swipe

```
Scenario: Hero carousel supports swipe gestures
Given: User views homepage on mobile
When: User swipes left on hero carousel
Then: Slides to next slide
And: Swipe velocity affects animation speed
And: Dot indicators update
When: User swipes right
Then: Slides to previous slide
And: Loops at edges (optional)
And: Auto-play pauses on touch
```

### TC-025-010-03: Category Slider Touch

```
Scenario: Category slider works with touch
Given: User views category slider on mobile
When: User touches and drags
Then: Scroll follows finger
And: Overscroll bounce on iOS
And: Snap to category items
And: Each category card is full-tap target
```

---

## TC-025-011: Pagination & Infinite Scroll Tests

### TC-025-011-01: MobileInfiniteScroll Products

```
Scenario: Products use infinite scroll on mobile
Given: User is on products page on mobile
And: Initial 20 products loaded
When: User scrolls to bottom
Then: Loading indicator appears at bottom
And: Next 20 products load automatically
And: Scroll position maintained
And: No duplicate products
And: "End of results" shown when all loaded
```

### TC-025-011-02: MobilePagination Admin Tables

```
Scenario: Admin tables use MobilePagination
Given: Admin is on users list on mobile
When: Pagination renders
Then: Current page indicator visible
And: Prev/Next buttons are 48px touch targets
And: Page numbers tap-friendly
And: Can tap to jump to page
And: "X of Y pages" displayed
```

### TC-025-011-03: MobileLoadMoreButton

```
Scenario: Load more button works on orders
Given: User is on orders page on mobile
And: Initial 10 orders loaded
When: User taps "Load More"
Then: Loading spinner on button
And: Next 10 orders added to list
And: Button shows "Load 10 more"
And: Button positioned above bottom nav
```

---

## TC-025-012: Media Upload Mobile Tests

### TC-025-012-01: MediaUploader Touch Zone

```
Scenario: MediaUploader is touch-optimized
Given: User is on product upload form on mobile
When: Media upload section renders
Then: Upload button is 48px+ height
And: Camera icon button prominent
And: Tap opens native file picker
And: Can select from camera or gallery
And: Progress shown clearly during upload
```

### TC-025-012-02: MediaGallery Touch Reorder

```
Scenario: MediaGallery supports touch reorder
Given: User has uploaded multiple images
When: User long-presses an image
Then: Image becomes draggable
And: Other images make space
When: User drops image in new position
Then: Order updates
And: Haptic feedback on mobile
```

### TC-025-012-03: MediaPreviewCard Swipe Delete

```
Scenario: Media can be deleted with swipe
Given: User viewing uploaded media on mobile
When: User swipes left on media item
Then: Delete action revealed
And: Delete button is 44px+ wide
When: User taps delete
Then: Media removed with animation
And: Confirmation if needed
```

### TC-025-012-04: CameraCapture Fullscreen

```
Scenario: Camera capture uses fullscreen mode
Given: User taps camera capture button on mobile
When: Camera opens
Then: Fullscreen camera view
And: Large capture button at bottom (64px+)
And: Camera switch button visible
And: Flash toggle if available
And: Preview before confirming
And: Retake option prominent
```

### TC-025-012-05: ImageEditor Touch Gestures

```
Scenario: Image editor supports touch gestures
Given: User opens image editor on mobile
When: Editing image
Then: Pinch-to-zoom works
And: Two-finger rotate gesture works
And: Crop handles are large drag targets
And: Toolbar at bottom with 48px icons
And: Undo/redo accessible
And: Save/cancel buttons prominent
```

---

## TC-025-013: Product Gallery & Zoom Tests

### TC-025-013-01: ProductGallery Swipe Navigation

```
Scenario: ProductGallery supports swipe navigation
Given: User is on product detail with multiple images
When: User swipes left on main image
Then: Next image slides in
And: Animation is smooth (60fps)
And: Image counter updates ("2 of 5")
And: Thumbnails scroll to show current
When: User swipes right
Then: Previous image slides in
```

### TC-025-013-02: ProductGallery Pinch-to-Zoom

```
Scenario: ProductGallery supports pinch-to-zoom
Given: User viewing product image on mobile
When: User pinches outward on image
Then: Image zooms in smoothly
And: Maximum zoom is 4x
And: Can pan when zoomed in
And: Visual feedback at max zoom
When: User pinches inward
Then: Image zooms out
And: Minimum zoom is 1x (fit)
```

### TC-025-013-03: ProductGallery Double-Tap Zoom

```
Scenario: Double-tap toggles zoom
Given: User viewing product image at 1x
When: User double-taps image
Then: Image zooms to 2x centered on tap point
When: User double-taps again
Then: Image returns to 1x (fit)
And: Transition is animated
```

### TC-025-013-04: ProductGallery Lightbox

```
Scenario: Lightbox opens on image tap
Given: User is on product detail on mobile
When: User taps main product image
Then: Fullscreen lightbox opens
And: Dark background (no browser chrome)
And: Image displayed large
And: Close button visible (48px touch target)
And: Swipe left/right for navigation
And: Swipe down to dismiss
And: Pinch-to-zoom works in lightbox
```

### TC-025-013-05: ProductGallery Thumbnail Strip

```
Scenario: Thumbnail strip is touch-friendly
Given: Product has 8+ images
When: Thumbnail strip renders on mobile
Then: Thumbnails scroll horizontally
And: Each thumbnail is 60px+ wide
And: Active thumbnail has visible indicator
And: Snap scrolling enabled
And: Touch momentum scrolling works
And: Tap on thumbnail navigates to that image
```

---

## TC-025-014: Layout Integration Tests

### TC-025-014-01: Root Layout Mobile Components

```
Scenario: Root layout includes mobile PWA components
Given: Any page loads on mobile
When: Layout renders
Then: MobileInstallPrompt appears (if criteria met)
And: MobileOfflineIndicator shows when offline
And: Bottom navigation visible (< 1024px)
And: Safe area padding applied for notched devices
```

### TC-025-014-02: Admin Layout Mobile

```
Scenario: Admin layout uses MobileAdminSidebar
Given: Admin is on /admin on mobile
When: Layout renders
Then: MobileAdminSidebar component used
And: Hamburger menu visible in header
And: Sidebar slides from left
And: All admin sections accessible
And: Active section highlighted
```

### TC-025-014-03: Seller Layout Mobile

```
Scenario: Seller layout uses MobileSellerSidebar
Given: Seller is on /seller on mobile
When: Layout renders
Then: MobileSellerSidebar component used
And: Hamburger menu in header
And: Dashboard, Products, Orders, etc. accessible
And: Quick action FAB visible
```

---

## TC-025-015: Static Pages Mobile Tests

### TC-025-015-01: About Page Mobile

```
Scenario: About page is mobile-readable
Given: User opens /about on mobile
When: Page renders
Then: Text is readable (16px+ font)
And: Images responsive
And: Sections stack vertically
And: Touch targets for CTAs are 48px+
```

### TC-025-015-02: FAQ Page Accordion Mobile

```
Scenario: FAQ accordion works on mobile
Given: User opens /faq on mobile
When: FAQ renders
Then: Each question is tap-to-expand
And: Question row is 48px+ height
And: Expanded answer readable
And: Multiple can be expanded
And: Smooth animation
```

### TC-025-015-03: Legal Pages Mobile Reading

```
Scenario: Legal pages are mobile-optimized
Given: User opens /privacy-policy on mobile
When: Page renders
Then: Text has comfortable line height (1.6+)
And: Margins provide breathing room
And: Links are tap-friendly
And: Table of contents is sticky (optional)
And: Same applies to /terms-of-service, /cookie-policy
```

### TC-025-015-04: Contact Page Mobile Form

```
Scenario: Contact page uses mobile form components
Given: User opens /contact on mobile
When: Form renders
Then: All inputs use MobileFormInput
And: Subject uses MobileFormSelect
And: Message textarea is touch-friendly
And: Submit button is 48px height
And: Success message visible after submit
```

---

## Test Data Requirements

### User Accounts

- Guest user (not logged in)
- Regular user with orders, addresses, favorites
- Seller with shop, products, auctions
- Admin user

### Products/Auctions

- Products with 1 image
- Products with 5+ images (gallery testing)
- Auctions at various states (active, ending soon, ended)

### Forms

- Pre-filled forms for testing
- Invalid data for error state testing
- Long text content for overflow testing

---

## Test Environment

### Devices/Viewports

- iPhone SE (375x667) - Small mobile
- iPhone 13 (390x844) - Standard mobile
- iPhone 13 Pro Max (428x926) - Large mobile
- iPad Mini (768x1024) - Tablet
- Pixel 5 (393x851) - Android mobile
- Samsung Galaxy (360x800) - Small Android

### Browsers

- Safari iOS (primary mobile browser)
- Chrome Mobile (Android)
- Firefox Mobile
- Samsung Internet

### Network Conditions

- 4G (for baseline performance)
- Slow 3G (for performance testing)
- Offline (for PWA testing)

---

## Success Metrics

- All form inputs render correctly on mobile: 100%
- Touch targets meet 44px minimum: 100%
- Pull-to-refresh works on all data pages: 100%
- Swipe actions work on all list items: 100%
- Loading skeletons appear for all async data: 100%
- All modals use MobileBottomSheet on mobile: 100%
- All filters use MobileBottomSheet on mobile: 100%
- All confirmation dialogs use MobileActionSheet: 100%
