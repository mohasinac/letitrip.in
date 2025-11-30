# Recently Viewed / Viewing History Feature

## Current State

**Status**: ✅ IMPLEMENTED

### Implemented Files

1. **Service**: `src/services/viewing-history.service.ts`
2. **Context**: `src/contexts/ViewingHistoryContext.tsx`
3. **RecentlyViewed Widget**: `src/components/products/RecentlyViewedWidget.tsx`
4. **History Page**: `src/app/user/history/page.tsx` (full implementation)
5. **Layout Updated**: `src/app/layout.tsx` - includes ViewingHistoryProvider
6. **Product Page Updated**: `src/app/products/[slug]/page.tsx` - tracks views
7. **Homepage Updated**: `src/app/page.tsx` - shows RecentlyViewedWidget

### Features

- Automatic tracking when viewing product detail pages
- Recently Viewed widget (horizontal scrollable)
- Full history page with:
  - Grid view of all viewed products
  - Remove individual items
  - Clear all history with confirmation
  - Relative date display ("Today", "Yesterday", "3 days ago")
- Cross-tab sync via localStorage
- Auto-expiry after 30 days
- Max 50 items stored
- Dark mode support
- Mobile responsive

---

## Existing Infrastructure (Used)

1. **Viewing History Service** - No localStorage/Firebase service
2. **History Tracking** - Product detail page doesn't record views
3. **History Page UI** - Only stub exists
4. **Recently Viewed Widget** - No sidebar/homepage widget
5. **Clear History** - No ability to clear viewing history

---

## Implementation Checklist

### 1. Create Viewing History Service

**File**: `src/services/viewing-history.service.ts`

Implement:

- `addToHistory(product: ViewingHistoryItem): void`
- `getHistory(limit?: number): ViewingHistoryItem[]`
- `clearHistory(): void`
- `removeFromHistory(productId: string): void`
- `getRecentlyViewed(limit: number): ViewingHistoryItem[]`
- Handle duplicate entries (move to top, update timestamp)
- Enforce MAX_ITEMS limit
- Handle expired items (older than EXPIRY_DAYS)

### 2. Create Viewing History Context

**File**: `src/contexts/ViewingHistoryContext.tsx`

Provide:

- `history: ViewingHistoryItem[]`
- `addToHistory: (item: ViewingHistoryItem) => void`
- `clearHistory: () => void`
- `removeFromHistory: (productId: string) => void`
- `recentlyViewed: ViewingHistoryItem[]` (limited subset)

### 3. Update Product Detail Page

**File**: `src/app/products/[slug]/page.tsx`

Add:

- Track product view when page loads
- Create `ViewingHistoryItem` from product data
- Call `addToHistory()` via context

### 4. Create Recently Viewed Widget

**File**: `src/components/products/RecentlyViewedWidget.tsx`

Features:

- Horizontal scrollable product cards
- "View All" link to history page
- Configurable limit (default: 8)
- Empty state: Hidden or "Start browsing to see recently viewed items"
- Exclude current product if on product page

### 5. Implement History Page

**File**: `src/app/user/history/page.tsx`

Features:

- Grid of previously viewed products
- Pagination using sieve system
- Sort by: Recently viewed, Price, Name
- Filter by: Category, Date range
- Clear all history button
- Remove individual items
- "Continue Browsing" CTA when empty
- Quick add to cart/wishlist

### 6. Add to Homepage

**File**: `src/app/page.tsx`

Add:

- `RecentlyViewedWidget` section
- Only show if user has viewing history
- Position after featured products or before footer

### 7. Add to Product Page Sidebar

**File**: `src/app/products/[slug]/page.tsx`

Add:

- "Recently Viewed" sidebar section
- Limit to 5 items
- Exclude current product

### 8. Firebase Sync (Optional - for logged-in users)

**File**: `src/services/viewing-history-sync.service.ts`

For authenticated users:

- Sync localStorage history to Firebase
- Merge history across devices
- Use `viewingHistory` collection

---

## Data Structure

### LocalStorage

```json
{
  "viewing_history": [
    {
      "productId": "abc123",
      "slug": "iphone-14-pro",
      "title": "iPhone 14 Pro 256GB",
      "image": "/products/iphone14.jpg",
      "price": 89999,
      "viewedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Firebase (for logged-in users)

```
/viewingHistory/{userId}/items/{productId}
{
  productId: string
  slug: string
  title: string
  image: string
  price: number
  viewedAt: Timestamp
}
```

---

## UI/UX Guidelines

### Recently Viewed Widget

- Horizontal scroll with arrow buttons
- Card size: Smaller than main product cards
- Show: Image, title (truncated), price
- Hover: Quick actions (view, add to cart)

### History Page

- Grid layout: 4 columns desktop, 2 mobile
- Card includes: View date, price, quick actions
- Infinite scroll or pagination
- Sticky filter/sort bar

### Empty States

- Widget: Don't show or show subtle message
- Page: Illustration + "Start exploring" CTA

---

## Testing Checklist

- [ ] Product view adds to history
- [ ] Duplicate views move to top (not duplicate)
- [ ] MAX_ITEMS limit enforced
- [ ] Expired items removed after EXPIRY_DAYS
- [ ] History persists across sessions
- [ ] Clear history works
- [ ] Remove individual item works
- [ ] Widget shows correct items
- [ ] Current product excluded from widget on product page
- [ ] Mobile scrolling works
- [ ] Dark mode support
- [ ] Firebase sync for logged-in users (if implemented)
