# Mobile PWA Test Cases

## Overview

Comprehensive test cases for the Mobile PWA Experience (Epic E024). These tests ensure the application works seamlessly on mobile devices for all user roles.

---

## TC-024-001: Bottom Navigation Tests

### TC-024-001-01: Bottom Nav Visibility

```
Scenario: Bottom navigation visible on mobile only
Given: User is on any page
When: Viewport is < 1024px
Then: Bottom navigation is visible
And: Bottom navigation has 5 items (Home, Products, Auctions, Cart, Account)

When: Viewport is >= 1024px
Then: Bottom navigation is hidden
```

### TC-024-001-02: Bottom Nav Active State

```
Scenario: Active navigation item highlighted
Given: User is on /products page
When: Bottom nav renders
Then: Products icon is highlighted (yellow-600)
And: Other icons are default (gray-600)
```

### TC-024-001-03: Cart Badge

```
Scenario: Cart badge shows correct count
Given: User has 5 items in cart
When: Bottom nav renders
Then: Cart icon shows badge with "5"

Given: User has 15 items in cart
When: Bottom nav renders
Then: Cart icon shows badge with "9+"
```

### TC-024-001-04: Touch Targets

```
Scenario: Touch targets meet accessibility requirements
Given: Bottom navigation is rendered
When: Measuring touch target sizes
Then: Each nav item is at least 44x44px
And: Touch area covers full height (64px)
```

---

## TC-024-002: Mobile Sidebar Tests

### TC-024-002-01: Sidebar Open/Close

```
Scenario: Sidebar opens and closes correctly
Given: User taps hamburger menu
When: Sidebar animation completes
Then: Sidebar is visible (left: 0)
And: Overlay is visible (opacity: 50%)
And: Body scroll is disabled

When: User taps overlay
Then: Sidebar slides out
And: Overlay fades out
And: Body scroll is restored
```

### TC-024-002-02: Sidebar Role-Based Menus - Guest

```
Scenario: Guest sees login/register options
Given: User is not authenticated
When: Sidebar opens
Then: "Sign In" button is visible
And: "Register" button is visible
And: Admin menu is NOT visible
And: Seller menu is NOT visible
```

### TC-024-002-03: Sidebar Role-Based Menus - User

```
Scenario: Regular user sees user navigation
Given: User is authenticated with role "user"
When: Sidebar opens
Then: User profile section is visible with name/avatar
And: Navigation section shows Home, Products, etc.
And: Admin menu is NOT visible
And: Seller menu is NOT visible
```

### TC-024-002-04: Sidebar Role-Based Menus - Seller

```
Scenario: Seller sees seller menu
Given: User is authenticated with role "seller"
When: Sidebar opens
Then: User profile section is visible
And: Seller section is visible
And: Seller section is collapsible
And: Admin menu is NOT visible
```

### TC-024-002-05: Sidebar Role-Based Menus - Admin

```
Scenario: Admin sees all menus
Given: User is authenticated with role "admin"
When: Sidebar opens
Then: User profile section is visible
And: Admin section is visible (collapsible)
And: Seller section is visible (collapsible)
```

---

## TC-024-003: Mobile Form Tests

### TC-024-003-01: Input Keyboard Types

```
Scenario: Correct keyboard appears for input types
Given: User is on a form

When: User taps email input
Then: Email keyboard appears (with @ symbol)

When: User taps phone input
Then: Telephone keypad appears

When: User taps number/price input
Then: Numeric keypad appears

When: User taps postal code input
Then: Numeric keypad appears
```

### TC-024-003-02: Form Input Sizes

```
Scenario: Form inputs are touch-friendly
Given: User is on a form
When: Measuring input elements
Then: All inputs are at least 48px height
And: Font size is at least 16px (prevents iOS zoom)
And: Label is visible above input
```

### TC-024-003-03: Form Error Display

```
Scenario: Form errors visible on mobile
Given: User submits form with invalid data
When: Validation fails
Then: Error message appears below relevant input
And: Error is visible without scrolling
And: Invalid input has red border
```

### TC-024-003-04: Address Form Mobile

```
Scenario: Address form works on mobile
Given: User opens address form on mobile
When: Form renders
Then: Form is full-screen modal
And: All fields are stacked vertically
And: Save button is fixed at bottom
And: Can scroll form content independently
```

---

## TC-024-004: Mobile Checkout Tests

### TC-024-004-01: Cart Item Display

```
Scenario: Cart items display correctly on mobile
Given: User has items in cart
When: Viewing cart on mobile
Then: Each item shows as card with:
  - Product image (thumbnail)
  - Product name
  - Price
  - Quantity selector (+/- buttons)
And: Total is visible at bottom
And: Checkout button is sticky at bottom
```

### TC-024-004-02: Cart Quantity Update

```
Scenario: Update quantity on mobile cart
Given: User has item with quantity 2
When: User taps "+" button
Then: Quantity becomes 3
And: Subtotal updates immediately
And: Cart total updates

When: User taps "-" button twice
Then: Quantity becomes 1
And: Item is not removed (minimum 1)
```

### TC-024-004-03: Checkout Step Navigation

```
Scenario: Navigate through checkout steps on mobile
Given: User is on checkout
When: On Address step
Then: Step indicator shows step 1 of 3
And: Address cards are displayed
And: "Continue" button visible

When: User selects address and continues
Then: Step indicator shows step 2 of 3
And: Payment options displayed

When: User selects payment and continues
Then: Step indicator shows step 3 of 3
And: Order review displayed
And: "Place Order" button visible
```

### TC-024-004-04: Checkout Address Selection

```
Scenario: Select address on mobile checkout
Given: User has multiple saved addresses
When: On address step
Then: Each address shows as card
And: Default address is pre-selected
And: Tapping card selects that address
And: "Add New Address" button visible
```

---

## TC-024-005: Mobile Admin Dashboard Tests

### TC-024-005-01: Admin Sidebar Toggle

```
Scenario: Admin sidebar on mobile
Given: Admin is on /admin on mobile
When: Page loads
Then: Sidebar is hidden by default
And: Hamburger menu is visible

When: Admin taps hamburger
Then: Sidebar slides in from left
And: All admin menu items accessible
```

### TC-024-005-02: Admin Data Tables Mobile

```
Scenario: Data tables display as cards on mobile
Given: Admin views /admin/users on mobile
When: Table renders
Then: Each user shows as card (not table row)
And: Key info visible (name, email, role, status)
And: Actions accessible via tap

Given: Admin views on desktop
When: Table renders
Then: Traditional table layout shown
```

### TC-024-005-03: Admin Bulk Actions Mobile

```
Scenario: Bulk actions work on mobile
Given: Admin is viewing users list on mobile
When: Admin enters selection mode
Then: Checkboxes appear on each card
And: Selection count shown at top
And: Bulk action menu accessible at bottom
```

---

## TC-024-006: Mobile Seller Dashboard Tests

### TC-024-006-01: Seller Quick Actions

```
Scenario: Seller quick actions accessible
Given: Seller is on /seller on mobile
When: Dashboard loads
Then: Quick action buttons visible:
  - Add Product
  - View Orders
  - Create Auction
And: Each button tappable and leads to correct page
```

### TC-024-006-02: Seller Product Management

```
Scenario: Manage products on mobile
Given: Seller is viewing products list
When: On mobile viewport
Then: Products display as cards
And: Each card shows image, name, price, stock
And: Tapping card opens product detail
And: Edit/Delete accessible via menu
```

### TC-024-006-03: Seller Order Actions

```
Scenario: Process orders on mobile
Given: Seller has pending orders
When: Viewing orders on mobile
Then: Orders display as cards
And: Status badge visible
And: Customer info visible
And: Quick action buttons (Accept, Ship, etc.) accessible
```

---

## TC-024-007: PWA Tests

### TC-024-007-01: Install Prompt

```
Scenario: PWA install prompt appears
Given: User visits site on mobile browser
And: Meets install criteria (engagement threshold)
When: Install prompt triggers
Then: Custom install banner appears
And: "Install" button visible
And: "Not Now" option available

When: User taps "Install"
Then: Native install prompt appears
And: If accepted, app installs to home screen
```

### TC-024-007-02: Offline Mode

```
Scenario: App works offline
Given: User has visited pages before
And: Service worker is registered
When: Device goes offline
Then: Offline indicator appears
And: Cached pages still load
And: Cached images display
And: Actions show "Will sync when online" message
```

### TC-024-007-03: Offline Data Sync

```
Scenario: Offline actions sync when online
Given: User is offline
And: User adds item to cart
When: Device goes online
Then: Cart syncs to server
And: Cart count updates correctly
```

---

## TC-024-008: Accessibility Tests

### TC-024-008-01: Touch Target Sizes

```
Scenario: All interactive elements meet touch requirements
Given: App is rendered on mobile
When: Measuring all buttons, links, and interactive elements
Then: All touch targets are at least 44x44px
And: Adjacent touch targets have 8px spacing
```

### TC-024-008-02: Focus States

```
Scenario: Focus states visible for keyboard/screen reader
Given: User navigates with keyboard or screen reader
When: Focusing interactive elements
Then: Clear focus ring visible
And: Focus order is logical
And: Skip links available
```

### TC-024-008-03: Screen Reader Announcements

```
Scenario: Dynamic content announced
Given: Screen reader is active
When: Cart updates
Then: "Cart updated" announced
When: Form submitted
Then: Success/error message announced
When: Page loads
Then: Page title announced
```

---

## TC-024-009: Performance Tests

### TC-024-009-01: Mobile Load Time

```
Scenario: Page loads quickly on mobile
Given: 3G network simulation
When: Loading homepage
Then: LCP < 2.5 seconds
And: FID < 100ms
And: CLS < 0.1
```

### TC-024-009-02: Image Loading

```
Scenario: Images optimized for mobile
Given: Product listing page with images
When: Images load
Then: Correct size served for viewport
And: Images lazy load below fold
And: Placeholder shown while loading
And: WebP format used if supported
```

---

## TC-024-010: Gesture Tests

### TC-024-010-01: Swipe to Delete

```
Scenario: Swipe to remove cart item
Given: User is in cart on mobile
When: User swipes left on item
Then: Delete action revealed
When: User continues swipe or taps delete
Then: Item removed from cart
And: Undo toast appears
```

### TC-024-010-02: Pull to Refresh

```
Scenario: Pull to refresh updates content
Given: User is on product listing
When: User pulls down from top
Then: Loading indicator appears
When: Pull exceeds threshold and released
Then: Content refreshes
And: Loading indicator disappears
```

### TC-024-010-03: Sidebar Swipe

```
Scenario: Close sidebar by swiping
Given: Sidebar is open
When: User swipes left on sidebar
Then: Sidebar closes
And: Overlay fades out
```

---

## Test Data Requirements

### User Accounts

- Guest user (not logged in)
- Regular user with orders and addresses
- Seller with products and shop
- Admin user

### Product Data

- Products with various image sizes
- Products with long titles/descriptions
- Products with variants

### Cart Data

- Empty cart
- Cart with single item
- Cart with multiple items from different shops

### Address Data

- User with single address
- User with multiple addresses (including default)

---

## Test Environment

### Devices/Viewports

- iPhone SE (375x667)
- iPhone 12/13 (390x844)
- iPhone 12/13 Pro Max (428x926)
- Pixel 5 (393x851)
- Samsung Galaxy S21 (360x800)
- iPad Mini (768x1024)

### Browsers

- Chrome Mobile
- Safari iOS
- Firefox Mobile
- Samsung Internet

### Network Conditions

- Fast 3G
- Slow 3G
- Offline
