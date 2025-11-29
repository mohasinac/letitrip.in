# Epic E033: Live Header Data

## ⚠️ MANDATORY: Follow Project Standards

Before implementing, read **[AI Agent Development Guide](/docs/ai/AI-AGENT-GUIDE.md)**

**Key Requirements:**

- API routes access database via `getFirestoreAdmin()`
- Services call APIs via `apiService`, NEVER access database directly
- Use `COLLECTIONS` constant from `src/constants/database.ts`

---

## Status: ✅ IMPLEMENTED (Session 11 - November 29, 2025)

## Implementation Details

### API Routes Created

| Endpoint                          | Method | Description                                                         |
| --------------------------------- | ------ | ------------------------------------------------------------------- |
| `/api/header/stats`               | GET    | Combined stats (cart, notifications, messages, favorites, RipLimit) |
| `/api/cart/count`                 | GET    | Cart item count only                                                |
| `/api/notifications/unread-count` | GET    | Unread notification count                                           |
| `/api/messages/unread-count`      | GET    | Unread message count                                                |

### Response Format

```typescript
// GET /api/header/stats
interface HeaderStatsResponse {
  cartCount: number;
  notificationCount: number;
  messagesCount: number;
  favoritesCount: number;
  ripLimitBalance: number | null;
  hasUnpaidAuctions: boolean;
}
```

### ⚠️ Cleanup Notes

Review and potentially consolidate these existing implementations:

- `src/hooks/useCart.ts` - May have duplicate cart count logic
- `src/hooks/useNotifications.ts` - May have duplicate notification count logic
- Header component - Should be updated to use new `/api/header/stats` endpoint
- Consider removing individual count fetching in favor of the combined endpoint

---

## Overview

Make the header component dynamic with real-time data for cart count, notifications, user state, and other relevant information. The header should update automatically when data changes without requiring page refresh.

## Scope

- Real-time cart item count
- Real-time notification count
- Live user authentication state
- RipLimit balance display (after E028)
- Wishlist count
- Unread messages count (after E023)
- Optimistic UI updates

---

## Features

### F033.1: Live Cart Count

**Priority**: P0 (Critical)

Display real-time cart item count in header.

#### User Stories

**US033.1.1**: Cart Badge Count

```
As a user adding items to cart
I want the cart icon to update immediately
So that I know items were added

Acceptance Criteria:
- Cart icon shows item count badge
- Count updates immediately on add/remove
- Optimistic update (show before API confirms)
- Rollback on error
- Shows 0 or hides badge when empty
- Count shows 99+ for more than 99 items
- Animates on change (subtle pulse)
```

**US033.1.2**: Cart Preview on Hover

```
As a user hovering over cart icon
I want to see a quick preview
So that I can see what's in my cart

Acceptance Criteria:
- Dropdown shows on hover (desktop)
- Shows first 3-5 items with images
- Shows total price
- "View Cart" and "Checkout" buttons
- Shows "Cart is empty" if empty
- Closes on mouse leave
```

---

### F033.2: Live Notification Count

**Priority**: P1 (High)

Display unread notification count in header.

#### User Stories

**US033.2.1**: Notification Badge

```
As a user with unread notifications
I want to see the count in header
So that I know to check them

Acceptance Criteria:
- Bell icon shows unread count badge
- Updates in real-time via polling/WebSocket
- Shows 9+ for more than 9
- Badge disappears when all read
- Red/accent color for badge
- Animates when new notification arrives
```

**US033.2.2**: Notification Dropdown

```
As a user clicking notification icon
I want to see recent notifications
So that I can quickly view them

Acceptance Criteria:
- Dropdown shows 5 most recent
- Each shows icon, title, time ago
- Unread items highlighted
- Click marks as read
- "View All" link to notifications page
- "Mark all as read" action
```

**US033.2.3**: Real-time Notification Updates

```
As a user with the app open
I want notifications to appear live
So that I'm informed immediately

Acceptance Criteria:
- New notifications appear without refresh
- Polling every 30 seconds (fallback)
- WebSocket for instant updates (if available)
- Sound/vibration option (user preference)
- Toast notification for important alerts
```

---

### F033.3: Live User State

**Priority**: P0 (Critical)

Header reflects current authentication state.

#### User Stories

**US033.3.1**: Auth State Sync

```
As a user logging in/out
I want the header to update immediately
So that I see correct navigation options

Acceptance Criteria:
- Login shows user menu immediately
- Logout clears user menu immediately
- Session expiry redirects to login
- Shows user avatar if available
- Shows "Login" button when logged out
- Role-based menu items (seller, admin)
```

**US033.3.2**: User Menu

```
As a logged-in user
I want quick access to my account
So that I can navigate easily

Acceptance Criteria:
- User avatar/name clickable
- Dropdown with account options
- Shows role badge (seller, admin)
- Quick links to orders, favorites, etc.
- Logout option
- Mobile: Opens mobile sidebar instead
```

---

### F033.4: RipLimit Balance

**Priority**: P1 (High)

Display user's RipLimit balance in header.

#### User Stories

**US033.4.1**: Balance Display

```
As a user with RipLimit
I want to see my balance in header
So that I know how much I can bid

Acceptance Criteria:
- Shows RipLimit icon with balance
- Shows available balance (not blocked)
- Click opens balance details
- Updates after purchase
- Updates after bid placed/released
- Formats large numbers (12.5K instead of 12500)
```

**US033.4.2**: Low Balance Warning

```
As a user with low RipLimit
I want to see a warning
So that I can top up before bidding

Acceptance Criteria:
- Warning icon when balance < 1000
- Tooltip explains low balance
- Quick link to purchase more
- Dismissible warning
```

---

### F033.5: Favorites Count

**Priority**: P2 (Medium)

Show favorites/wishlist count in header.

#### User Stories

**US033.5.1**: Favorites Badge

```
As a user with favorites
I want to see my favorites count
So that I can track my wishlist

Acceptance Criteria:
- Heart icon with count badge
- Updates on add/remove
- Shows 99+ for more than 99
- Click opens favorites page
- Guest: Shows local storage count
```

---

### F033.6: Messages Count

**Priority**: P2 (Medium)

Show unread messages count.

#### User Stories

**US033.6.1**: Messages Badge

```
As a seller with unread messages
I want to see the count in header
So that I can respond promptly

Acceptance Criteria:
- Messages icon with unread count
- Only visible for sellers/users with conversations
- Updates in real-time
- Click opens messages page
- Shows 9+ for more than 9
```

---

## Technical Implementation

### Header Context

```typescript
// contexts/HeaderContext.tsx
interface HeaderContextType {
  cartCount: number;
  notificationCount: number;
  favoritesCount: number;
  messagesCount: number;
  ripLimitBalance: number | null;
  user: User | null;

  // Actions
  refreshCart: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

// Real-time updates via polling
const POLL_INTERVALS = {
  cart: 0, // Only updates on action
  notifications: 30000, // 30 seconds
  messages: 60000, // 1 minute
  ripLimit: 0, // Only updates on action
};
```

### Optimistic Updates

```typescript
// Example: Cart add with optimistic update
const addToCart = async (productId: string) => {
  // Optimistic: Increment immediately
  setCartCount((prev) => prev + 1);

  try {
    await cartService.addItem(productId);
    // Confirmed: Already updated
  } catch (error) {
    // Rollback: Decrement on error
    setCartCount((prev) => prev - 1);
    toast.error("Failed to add to cart");
  }
};
```

### Header Component Structure

```tsx
// components/layout/Header/
├── Header.tsx              # Main header container
├── HeaderLogo.tsx          # Logo component
├── HeaderSearch.tsx        # Search bar (E032)
├── HeaderNav.tsx           # Navigation links
├── HeaderActions.tsx       # Right side actions
├── CartButton.tsx          # Cart with badge
├── NotificationButton.tsx  # Notifications with badge
├── FavoritesButton.tsx     # Favorites with badge
├── MessagesButton.tsx      # Messages with badge
├── RipLimitBalance.tsx     # RipLimit display
├── UserMenu.tsx            # User dropdown
├── CartPreview.tsx         # Cart hover preview
├── NotificationDropdown.tsx # Notification dropdown
└── MobileHeader.tsx        # Mobile-specific header
```

---

## API Endpoints

### Header Data Endpoint

```typescript
// GET /api/header/stats
// Returns all header stats in one call (for initial load)
interface HeaderStatsResponse {
  cartCount: number;
  notificationCount: number;
  messagesCount: number;
  favoritesCount: number;
  ripLimitBalance: number | null;
  hasUnpaidAuctions: boolean;
}
```

### Real-time Endpoints

```typescript
// Individual endpoints for real-time updates
GET / api / cart / count; // Cart item count
GET / api / notifications / unread - count; // Unread notifications
GET / api / messages / unread - count; // Unread messages
GET / api / favorites / count; // Favorites count
GET / api / riplimit / balance; // RipLimit balance
```

---

## Implementation Checklist

### Phase 1: Cart (Week 1)

- [ ] Create CartButton with badge
- [ ] Implement optimistic cart updates
- [ ] Create CartPreview dropdown
- [ ] Connect to cart context/API
- [ ] Add animation on count change

### Phase 2: Notifications (Week 1)

- [ ] Create NotificationButton with badge
- [ ] Create NotificationDropdown
- [ ] Implement polling for updates
- [ ] Mark as read functionality
- [ ] Connect to notifications API

### Phase 3: User State (Week 2)

- [ ] Update UserMenu component
- [ ] Handle auth state changes
- [ ] Role-based menu items
- [ ] Session expiry handling

### Phase 4: RipLimit & Others (Week 2)

- [ ] Create RipLimitBalance component
- [ ] Create FavoritesButton with badge
- [ ] Create MessagesButton with badge
- [ ] Connect to respective APIs

### Phase 5: Header Stats API (Week 2)

- [ ] Create /api/header/stats endpoint
- [ ] Optimize for single request on load
- [ ] Add caching
- [ ] Implement individual count endpoints

### Phase 6: Mobile Optimization (Week 3)

- [ ] Mobile header layout
- [ ] Touch-friendly dropdowns
- [ ] Bottom sheet alternatives for dropdowns

### Phase 7: Testing (Week 3)

- [ ] Unit tests for header components
- [ ] Integration tests for real-time updates
- [ ] E2E tests for user flows

---

## Acceptance Criteria

- [ ] Cart count updates immediately on add/remove
- [ ] Notification count updates in real-time
- [ ] User menu reflects current auth state
- [ ] RipLimit balance shown for users with balance
- [ ] All badges animate on change
- [ ] Cart preview shows on hover
- [ ] Notification dropdown shows recent items
- [ ] Mobile header is touch-optimized
- [ ] Performance: Header load < 100ms

---

## Dependencies

- E016: Notifications (for notification data)
- E023: Messaging (for messages count)
- E028: RipLimit (for balance display)
- E022: Favorites (for favorites count)

## Related Epics

- E004: Shopping Cart
- E024: Mobile PWA Experience

---

## Test Documentation

**Test Cases**: `TDD/resources/header/TEST-CASES.md`
