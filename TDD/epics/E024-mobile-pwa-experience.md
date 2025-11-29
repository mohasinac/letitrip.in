# Epic E024: Mobile PWA Experience

## Overview

Transform the web application into a fully-featured Progressive Web App (PWA) optimized for mobile devices. This includes mobile-first layouts, touch-optimized interactions, offline capabilities, and seamless support for all user roles (Guest, User, Seller, Admin) across all tasks including forms, checkout, and dashboards.

## Scope

- Mobile-optimized navigation and sidebars for all roles
- Touch-friendly forms and inputs
- Mobile checkout and purchase flow optimization
- Admin/Seller dashboard mobile layouts
- Gesture support and haptic feedback
- Offline mode with service worker caching
- PWA installation prompts
- Mobile-specific UI components
- Performance optimization for mobile networks

## User Roles Involved

- **Guest**: Browse, search, view products/auctions
- **User**: All guest features + cart, checkout, orders, profile, wishlist, bids
- **Seller**: Products/auctions management, orders, analytics, shop management
- **Admin**: Full platform management, user management, content management

---

## Features

### F024.1: Mobile Navigation System

**Priority**: P0 (Critical)

#### User Stories

**US024.1.1**: Enhanced Bottom Navigation

```
As a mobile user
I want a fixed bottom navigation bar
So that I can quickly access main sections with one thumb tap

Acceptance Criteria:
- Given I am on any page on mobile
- When the bottom nav is visible
- Then I see: Home, Products, Auctions, Cart (with badge), Account
- And active item is highlighted
- And tapping navigates to the section
- And cart badge shows real-time count

Mobile Specifics:
- Touch targets minimum 44x44px
- Safe area padding for notched devices
- Haptic feedback on tap (where supported)
```

**US024.1.2**: Mobile Sidebar with Role-Based Menus

```
As a mobile user (any role)
I want a slide-out sidebar with all my available actions
So that I can access role-specific features easily

Acceptance Criteria:
- Given I tap the hamburger menu
- When the sidebar opens
- Then I see my profile section (if logged in)
- And I see navigation grouped by section
- And I see role-specific menus (Admin/Seller) if applicable
- And I can close by swiping left or tapping overlay

Animation:
- Slide in from left with 300ms ease-out
- Overlay fades in simultaneously
- Body scroll locked when open
```

**US024.1.3**: Mobile Header Optimization

```
As a mobile user
I want a compact header that maximizes content space
So that I can see more content on my small screen

Acceptance Criteria:
- Given I am on mobile
- When viewing the header
- Then logo is compact
- And search is accessible via icon tap
- And menu/cart icons are easily tappable
- And header height is minimized (56-64px)
```

### F024.2: Mobile Dashboard Layouts

**Priority**: P0 (Critical)

#### User Stories

**US024.2.1**: Admin Mobile Dashboard

```
As an admin on mobile
I want to access all admin functions
So that I can manage the platform from my phone

Acceptance Criteria:
- Given I am an admin on mobile
- When I access /admin
- Then I see a mobile-optimized sidebar (hamburger toggle)
- And dashboard cards stack vertically
- And tables become card-based lists
- And forms are full-width with large inputs
- And action buttons are easily tappable

Components:
- Mobile admin sidebar (swipeable)
- Responsive data tables (card view on mobile)
- Mobile-friendly modals (full-screen on mobile)
- Touch-friendly bulk selection
```

**US024.2.2**: Seller Mobile Dashboard

```
As a seller on mobile
I want to manage my shop, products, and orders
So that I can run my business from anywhere

Acceptance Criteria:
- Given I am a seller on mobile
- When I access /seller
- Then I see mobile-friendly navigation
- And quick actions are prominent (add product, view orders)
- And stats cards are scrollable horizontally
- And product list uses card layout
- And I can manage orders with swipe actions
```

**US024.2.3**: User Mobile Dashboard

```
As a user on mobile
I want to manage my account, orders, and wishlist
So that I can shop conveniently from my phone

Acceptance Criteria:
- Given I am logged in on mobile
- When I access /user
- Then I see my profile summary
- And quick links to orders, wishlist, addresses
- And order cards are swipeable for actions
- And all forms are mobile-optimized
```

### F024.3: Mobile Forms & Inputs

**Priority**: P0 (Critical)

#### User Stories

**US024.3.1**: Touch-Optimized Form Inputs

```
As a mobile user
I want forms that are easy to fill on touch screens
So that I can complete actions without frustration

Acceptance Criteria:
- Given I am filling a form on mobile
- When I interact with inputs
- Then input height is minimum 48px
- And labels are visible and clear
- And appropriate keyboard type appears (email, number, etc.)
- And auto-complete works correctly
- And error messages are visible below inputs
- And submit buttons are full-width and prominent

Input Enhancements:
- Date picker uses native mobile date input
- Select dropdowns use native mobile select
- Phone input has tel keyboard
- Number inputs have numeric keyboard
```

**US024.3.2**: Address Form Mobile Experience

```
As a mobile user
I want to add/edit addresses easily
So that I can manage shipping details on my phone

Acceptance Criteria:
- Given I am on address form (mobile)
- When the form loads
- Then it displays as full-screen modal
- And fields are stacked vertically
- And pincode field triggers numeric keyboard
- And phone field triggers tel keyboard
- And state/city can use autocomplete
- And save button is fixed at bottom
```

**US024.3.3**: Product/Auction Form Mobile Experience

```
As a seller on mobile
I want to add/edit products and auctions
So that I can manage listings from my phone

Acceptance Criteria:
- Given I am creating/editing a product on mobile
- When the form loads
- Then image upload is prominent and uses device camera
- And form sections are collapsible (accordion)
- And price inputs use numeric keyboard
- And rich text editor is mobile-friendly
- And form progress is visible
- And save/publish buttons are sticky at bottom
```

### F024.4: Mobile Checkout Experience

**Priority**: P0 (Critical)

#### User Stories

**US024.4.1**: Streamlined Mobile Checkout

```
As a mobile user
I want a fast, simple checkout process
So that I can complete purchases quickly on my phone

Acceptance Criteria:
- Given I have items in cart
- When I proceed to checkout on mobile
- Then I see a step indicator (Address → Payment → Review)
- And each step is a full-screen view
- And address selection uses card-based UI
- And payment selection is clear with logos
- And order summary is collapsible
- And "Place Order" button is prominent and fixed

Optimizations:
- One-tap address selection if default exists
- Saved payment method quick selection
- Order total always visible
- Express checkout option (Buy Now)
```

**US024.4.2**: Mobile Cart Experience

```
As a mobile user
I want to manage my cart easily on mobile
So that I can review and modify my order

Acceptance Criteria:
- Given I have items in cart
- When viewing cart on mobile
- Then each item shows as a card with image, name, price
- And quantity can be changed with +/- buttons
- And swipe left to remove item
- And total updates in real-time
- And checkout button is sticky at bottom
```

### F024.5: Mobile-Specific Components

**Priority**: P1 (High)

#### User Stories

**US024.5.1**: Pull-to-Refresh

```
As a mobile user
I want to refresh content by pulling down
So that I can get latest data without finding a button

Acceptance Criteria:
- Given I am on a list view (products, orders, etc.)
- When I pull down from top
- Then a loading indicator appears
- And content refreshes
- And indicator disappears when done
```

**US024.5.2**: Swipe Actions on Lists

```
As a mobile user
I want to perform actions by swiping on list items
So that I can take quick actions without tapping through menus

Acceptance Criteria:
- Given I am viewing a list (orders, products, etc.)
- When I swipe left on an item
- Then action buttons appear (edit, delete, etc.)
- And I can tap to perform action
- And swiping further triggers primary action
```

**US024.5.3**: Mobile Action Sheets

```
As a mobile user
I want action menus to appear as bottom sheets
So that they are easy to reach with my thumb

Acceptance Criteria:
- Given I tap on a menu trigger
- When the menu opens
- Then it slides up from bottom
- And options are listed vertically with icons
- And I can dismiss by swiping down or tapping overlay
- And safe area is respected for home indicator
```

**US024.5.4**: Toast Notifications (Mobile)

```
As a mobile user
I want feedback notifications that don't block my view
So that I know actions succeeded without interruption

Acceptance Criteria:
- Given an action completes
- When toast appears
- Then it shows at top (below notch) or bottom (above nav)
- And auto-dismisses after 3 seconds
- And can be swiped to dismiss
- And doesn't block interactions
```

### F024.6: PWA Features

**Priority**: P1 (High)

#### User Stories

**US024.6.1**: Install Prompt

```
As a mobile user
I want to install the app on my home screen
So that I can access it like a native app

Acceptance Criteria:
- Given I visit the site on mobile browser
- When install criteria are met (2+ visits, engagement)
- Then a custom install banner appears
- And I can install with one tap
- And banner dismisses if declined
- And doesn't show again for 7 days if dismissed
```

**US024.6.2**: Offline Support

```
As a mobile user
I want the app to work when I'm offline
So that I can browse cached content without internet

Acceptance Criteria:
- Given I've visited pages before
- When I go offline
- Then cached pages load normally
- And I see offline indicator
- And I can browse cached products/content
- And actions queue for when online (add to cart, etc.)
```

**US024.6.3**: Push Notifications

```
As a mobile user
I want push notifications for important updates
So that I know about orders, auctions, and deals

Acceptance Criteria:
- Given I've enabled notifications
- When important events occur
- Then I receive push notification
- And tapping opens relevant page
- And I can manage preferences in settings

Notification Types:
- Order status updates
- Auction outbid alerts
- Auction ending soon
- Promotional deals (if opted in)
```

### F024.7: Mobile Performance

**Priority**: P1 (High)

#### User Stories

**US024.7.1**: Image Optimization

```
As a mobile user
I want images to load quickly
So that I don't waste data and time

Acceptance Criteria:
- Given I am on a product page
- When images load
- Then appropriate size is served for screen
- And images lazy load below fold
- And blur placeholder shows while loading
- And WebP format used when supported
```

**US024.7.2**: Skeleton Loading States

```
As a mobile user
I want to see loading states while content loads
So that I know the app is working

Acceptance Criteria:
- Given content is loading
- When I view the page
- Then skeleton placeholders appear
- And they match the layout of actual content
- And they animate subtly
- And content replaces them smoothly
```

---

## Component Architecture

### New Mobile Components

```
src/components/mobile/
├── MobileBottomSheet.tsx       # Bottom sheet modal component
├── MobileActionSheet.tsx       # Action menu as bottom sheet
├── MobilePullToRefresh.tsx     # Pull to refresh wrapper
├── MobileSwipeActions.tsx      # Swipeable list item actions
├── MobileFormInput.tsx         # Touch-optimized form input
├── MobileFormSelect.tsx        # Native mobile select wrapper
├── MobileFormDatePicker.tsx    # Native date picker
├── MobileInstallPrompt.tsx     # PWA install banner
├── MobileOfflineIndicator.tsx  # Offline status indicator
├── MobileSkeleton.tsx          # Loading skeleton components
├── MobileAdminSidebar.tsx      # Admin sidebar for mobile
├── MobileSellerSidebar.tsx     # Seller sidebar for mobile
├── MobileDataTable.tsx         # Card-based data display for mobile
├── MobileQuickActions.tsx      # Floating action button with menu
└── index.ts                    # Barrel export
```

### Updated Layout Components

```
src/components/layout/
├── BottomNav.tsx               # Enhanced with gestures, badges
├── MobileSidebar.tsx           # Enhanced with role menus
├── Header.tsx                  # Mobile-optimized header
└── MainNavBar.tsx              # Compact mobile version

src/app/admin/
└── layout.tsx                  # Add mobile sidebar support

src/app/seller/
└── layout.tsx                  # Add mobile sidebar support
```

---

## API Endpoints

No new API endpoints required. Mobile experience uses existing APIs with optimized payloads.

## Data Models

No new data models. Uses existing FE/BE models.

---

## Test Scenarios

### Unit Tests

- [ ] MobileBottomSheet opens/closes correctly
- [ ] MobileSwipeActions triggers correct callbacks
- [ ] MobileFormInput renders with correct keyboard type
- [ ] BottomNav shows correct badge count
- [ ] MobileSidebar shows role-specific menus

### Integration Tests

- [ ] Mobile checkout flow completes successfully
- [ ] Mobile address form saves correctly
- [ ] Mobile product form creates product
- [ ] Mobile sidebar navigation works for all roles
- [ ] Pull to refresh updates content

### E2E Tests

- [ ] Complete mobile checkout from cart to order confirmation
- [ ] Admin manages users from mobile
- [ ] Seller creates product from mobile
- [ ] User manages addresses from mobile
- [ ] PWA installs correctly

### Mobile-Specific Tests

- [ ] Touch targets meet 44px minimum
- [ ] Safe area insets applied correctly
- [ ] Keyboard doesn't cover active input
- [ ] Scroll behavior correct with fixed elements
- [ ] Viewport scales correctly

---

## Dependencies

- No new npm packages required (use existing)
- Service Worker for offline support
- Web App Manifest (already exists)
- CSS media queries and container queries

## Related Epics

- E001: User Management (mobile profile)
- E004: Shopping Cart (mobile cart)
- E005: Order Management (mobile orders)
- E006: Shop Management (mobile shop dashboard)
- E011: Payment System (mobile checkout)

---

## Implementation Priority

### Phase 1: Core Mobile Experience (P0)

1. Enhanced BottomNav with gestures
2. Mobile Sidebar improvements for all roles
3. Mobile Admin/Seller sidebar
4. Mobile form components

### Phase 2: Checkout & Purchases (P0)

1. Mobile cart experience
2. Mobile checkout flow
3. Mobile address form
4. Mobile payment selection

### Phase 3: Dashboard Optimization (P1)

1. Mobile admin dashboard layout
2. Mobile seller dashboard layout
3. Mobile data tables (card view)
4. Mobile action sheets

### Phase 4: PWA Features (P1)

1. Install prompt
2. Offline support
3. Push notifications
4. Skeleton loading states

---

## Technical Specifications

### Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) {
  /* sm - Large phones */
}
@media (min-width: 768px) {
  /* md - Tablets */
}
@media (min-width: 1024px) {
  /* lg - Desktop - Hide mobile UI */
}
@media (min-width: 1280px) {
  /* xl - Large desktop */
}
```

### Touch Target Sizes

- Minimum: 44x44px
- Recommended: 48x48px
- With spacing: 8px between targets

### Safe Areas

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

### Viewport Configuration

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

---

## Acceptance Criteria Summary

- [ ] All pages responsive and usable on 320px width
- [ ] Bottom navigation visible on all mobile pages
- [ ] Mobile sidebar accessible for all authenticated roles
- [ ] Forms submit successfully on mobile
- [ ] Checkout completes successfully on mobile
- [ ] Admin can perform all actions on mobile
- [ ] Seller can manage shop on mobile
- [ ] PWA installable from browser
- [ ] Offline mode shows cached content
- [ ] Performance: LCP < 2.5s on 3G
