# Live Header Data Test Cases

## E033: Live Header Data

### Unit Tests

#### TC-HEADER-001: Cart Count Logic

```typescript
describe("Cart Count Logic", () => {
  it.todo("should calculate total item count");
  it.todo("should update on add item");
  it.todo("should update on remove item");
  it.todo("should cap display at 99+");
  it.todo("should reset on logout");
});
```

#### TC-HEADER-002: Notification Count Logic

```typescript
describe("Notification Count Logic", () => {
  it.todo("should return unread count");
  it.todo("should decrement on mark read");
  it.todo("should reset on mark all read");
  it.todo("should cap display at 9+");
});
```

#### TC-HEADER-003: Optimistic Updates

```typescript
describe("Optimistic Updates", () => {
  it.todo("should update count before API confirms");
  it.todo("should rollback on API error");
  it.todo("should handle concurrent updates");
});
```

### Component Tests

#### TC-HEADER-004: CartButton Component

```typescript
describe("CartButton Component", () => {
  it.todo("should display cart icon");
  it.todo("should show count badge");
  it.todo("should hide badge when 0");
  it.todo("should show 99+ for > 99 items");
  it.todo("should animate on count change");
  it.todo("should link to cart page");
});
```

#### TC-HEADER-005: CartPreview Component

```typescript
describe("CartPreview Component", () => {
  it.todo("should show on hover (desktop)");
  it.todo("should display 3-5 items");
  it.todo("should show item images");
  it.todo("should show total price");
  it.todo('should have "View Cart" button');
  it.todo('should have "Checkout" button');
  it.todo("should show empty state");
  it.todo("should close on mouse leave");
});
```

#### TC-HEADER-006: NotificationButton Component

```typescript
describe("NotificationButton Component", () => {
  it.todo("should display bell icon");
  it.todo("should show unread count badge");
  it.todo("should hide badge when 0");
  it.todo("should show 9+ for > 9");
  it.todo("should animate on new notification");
});
```

#### TC-HEADER-007: NotificationDropdown Component

```typescript
describe("NotificationDropdown Component", () => {
  it.todo("should show 5 recent notifications");
  it.todo("should show icon, title, time ago");
  it.todo("should highlight unread items");
  it.todo("should mark as read on click");
  it.todo('should have "View All" link');
  it.todo('should have "Mark all read" action');
  it.todo("should show empty state");
});
```

#### TC-HEADER-008: RipLimitBalance Component

```typescript
describe("RipLimitBalance Component", () => {
  it.todo("should show RipLimit icon");
  it.todo("should show available balance");
  it.todo("should format large numbers (12.5K)");
  it.todo("should show low balance warning");
  it.todo("should link to RipLimit page");
  it.todo("should update after purchase");
  it.todo("should update after bid");
});
```

#### TC-HEADER-009: FavoritesButton Component

```typescript
describe("FavoritesButton Component", () => {
  it.todo("should display heart icon");
  it.todo("should show count badge");
  it.todo("should update on add/remove");
  it.todo("should link to favorites page");
  it.todo("should show guest count from localStorage");
});
```

#### TC-HEADER-010: MessagesButton Component

```typescript
describe("MessagesButton Component", () => {
  it.todo("should display messages icon");
  it.todo("should show unread count");
  it.todo("should only show for authenticated users");
  it.todo("should link to messages page");
});
```

#### TC-HEADER-011: UserMenu Component

```typescript
describe("UserMenu Component", () => {
  it.todo("should show user avatar/name");
  it.todo("should open dropdown on click");
  it.todo("should show role badge");
  it.todo("should show account options");
  it.todo("should show role-specific links");
  it.todo("should have logout option");
});
```

### Integration Tests

#### TC-HEADER-012: Header Stats API

```typescript
describe("Header Stats API", () => {
  it.todo("should return all stats in one call");
  it.todo("should include cart count");
  it.todo("should include notification count");
  it.todo("should include messages count");
  it.todo("should include favorites count");
  it.todo("should include RipLimit balance");
  it.todo("should require authentication");
});
```

#### TC-HEADER-013: Real-time Polling

```typescript
describe("Real-time Polling", () => {
  it.todo("should poll notifications every 30s");
  it.todo("should poll messages every 60s");
  it.todo("should not poll cart (action-driven)");
  it.todo("should pause polling when tab inactive");
  it.todo("should resume polling when tab active");
});
```

#### TC-HEADER-014: Auth State Sync

```typescript
describe("Auth State Sync", () => {
  it.todo("should update header on login");
  it.todo("should clear header on logout");
  it.todo("should handle session expiry");
  it.todo("should redirect on session expiry");
});
```

### E2E Tests

#### TC-HEADER-015: Cart Update E2E

```typescript
describe("Cart Update E2E", () => {
  it.todo("should show 0 cart count initially");
  it.todo("should add item to cart");
  it.todo("should see badge update immediately");
  it.todo("should hover to see preview");
  it.todo("should remove item");
  it.todo("should see badge update");
});
```

#### TC-HEADER-016: Notification E2E

```typescript
describe("Notification E2E", () => {
  it.todo("should show notification badge");
  it.todo("should click to open dropdown");
  it.todo("should see recent notifications");
  it.todo("should click notification to mark read");
  it.todo("should see badge decrement");
  it.todo("should mark all as read");
});
```

#### TC-HEADER-017: Login/Logout E2E

```typescript
describe("Login/Logout E2E", () => {
  it.todo("should show login button when logged out");
  it.todo("should login");
  it.todo("should see user menu appear");
  it.todo("should see cart/favorites merge");
  it.todo("should logout");
  it.todo("should see login button again");
});
```

#### TC-HEADER-018: RipLimit E2E

```typescript
describe("RipLimit Header E2E", () => {
  it.todo("should show RipLimit balance");
  it.todo("should purchase more RipLimit");
  it.todo("should see balance update");
  it.todo("should place bid");
  it.todo("should see available balance decrease");
});
```

### Mobile Tests

#### TC-HEADER-019: Mobile Header

```typescript
describe("Mobile Header", () => {
  it.todo("should show compact header");
  it.todo("should show cart badge");
  it.todo("should show notification badge");
  it.todo("should open mobile menu");
  it.todo("should show user info in menu");
});
```

#### TC-HEADER-020: Mobile Dropdowns

```typescript
describe("Mobile Dropdowns", () => {
  it.todo("should use bottom sheet for cart preview");
  it.todo("should use bottom sheet for notifications");
  it.todo("should be touch-friendly");
});
```

### Performance Tests

#### TC-HEADER-021: Header Performance

```typescript
describe("Header Performance", () => {
  it.todo("should load header stats in < 100ms");
  it.todo("should not block page render");
  it.todo("should batch API calls");
  it.todo("should cache stats appropriately");
});
```
