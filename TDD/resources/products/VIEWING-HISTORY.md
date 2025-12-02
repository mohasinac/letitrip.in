# Viewing History Feature - Resource Documentation

## Overview

Automatic product viewing history tracking with localStorage persistence, 30-day expiry, and max 50 items limit.

## Files

### Core Implementation

| File                                               | Purpose                    | Lines |
| -------------------------------------------------- | -------------------------- | ----- |
| `src/services/viewing-history.service.ts`          | History data management    | ~150  |
| `src/contexts/ViewingHistoryContext.tsx`           | React context provider     | ~90   |
| `src/components/products/RecentlyViewedWidget.tsx` | Horizontal carousel widget | ~180  |
| `src/app/user/history/page.tsx`                    | Full history page          | ~220  |

### Integration Points

- `src/app/products/[slug]/page.tsx` - Auto-tracks product views
- `src/app/page.tsx` - Shows RecentlyViewedWidget on homepage
- `src/app/layout.tsx` - Wraps with ViewingHistoryProvider

## Configuration

```typescript
// In viewing-history.service.ts
const HISTORY_CONFIG = {
  MAX_ITEMS: 50,
  EXPIRY_DAYS: 30,
  STORAGE_KEY: "viewing_history",
};
```

## Service API

### ViewingHistoryService Methods

```typescript
interface ViewingHistoryItem {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  viewedAt: string; // ISO timestamp
}

class ViewingHistoryService {
  // Add product to history (moves to top if exists)
  addToHistory(item: ViewingHistoryItem): void;

  // Get all history items (newest first)
  getHistory(limit?: number): ViewingHistoryItem[];

  // Get recently viewed (default: 8 items)
  getRecentlyViewed(limit?: number): ViewingHistoryItem[];

  // Remove single item
  removeFromHistory(productId: string): void;

  // Clear all history
  clearHistory(): void;

  // Internal: Remove expired items
  private cleanExpiredItems(): void;
}
```

## Context API

```typescript
interface ViewingHistoryContextValue {
  history: ViewingHistoryItem[];
  recentlyViewed: ViewingHistoryItem[]; // Last 8 items
  addToHistory: (item: ViewingHistoryItem) => void;
  removeFromHistory: (productId: string) => void;
  clearHistory: () => void;
}
```

## Component Usage

### Auto-Tracking in Product Page

```tsx
// src/app/products/[slug]/page.tsx
import { useViewingHistory } from "@/contexts/ViewingHistoryContext";

const ProductPage = ({ product }) => {
  const { addToHistory } = useViewingHistory();

  useEffect(() => {
    if (product) {
      addToHistory({
        productId: product.id,
        slug: product.slug,
        title: product.name,
        image: product.images[0],
        price: product.price,
        viewedAt: new Date().toISOString(),
      });
    }
  }, [product?.id]);

  // ... rest of component
};
```

### RecentlyViewedWidget

```tsx
import { RecentlyViewedWidget } from "@/components/products/RecentlyViewedWidget";

// On homepage or product page sidebar
<RecentlyViewedWidget
  limit={8}
  excludeProductId={currentProduct?.id} // Optional: exclude current product
  title="Recently Viewed"
/>;
```

**Props**:

- `limit?: number` - Max items to show (default: 8)
- `excludeProductId?: string` - Product to exclude (usually current)
- `title?: string` - Widget heading (default: "Recently Viewed")
- `className?: string` - Additional CSS classes

**Features**:

- Horizontal scrollable carousel
- Product cards with image, title, price
- Quick actions: Add to cart, view details
- "View All" link to full history page
- Hidden if no history

### History Page (`/user/history`)

**Features**:

- Grid view of all viewed products (4 cols desktop, 2 mobile)
- Relative date display: "Today", "Yesterday", "3 days ago"
- Remove individual items (trash icon)
- "Clear All History" button with confirmation
- Empty state: "Start browsing to see recently viewed items"
- Sort by: Recently viewed (default), Price, Name
- Filter by: Category, Date range (optional)

## Storage Schema

```typescript
// localStorage key: 'viewing_history'
interface HistoryStorage {
  items: ViewingHistoryItem[];
  updatedAt: string; // ISO timestamp
}

// Example
{
  items: [
    {
      productId: 'abc123',
      slug: 'iphone-14-pro',
      title: 'iPhone 14 Pro 256GB',
      image: '/products/iphone14.jpg',
      price: 89999,
      viewedAt: '2025-12-03T10:30:00Z'
    },
    // ... more items
  ],
  updatedAt: '2025-12-03T10:30:00Z'
}
```

## Business Rules

1. **Auto-Tracking**: Product view automatically added when detail page loads
2. **Duplicate Handling**: Viewing same product moves it to top (updates timestamp)
3. **Max Items**: Oldest items removed when > 50 items
4. **Expiry**: Items older than 30 days automatically removed
5. **Exclusion**: Current product excluded from widget on product page
6. **Persistence**: Stored in localStorage, survives browser restarts
7. **Cross-Tab Sync**: Updates across browser tabs via storage events
8. **Guest Users**: Works for unauthenticated users (localStorage only)

## UI/UX Guidelines

### RecentlyViewedWidget

- **Layout**: Horizontal scroll with arrow buttons
- **Card Size**: Smaller than main product cards
- **Spacing**: 16px gap between cards
- **Arrows**: Show on hover (desktop), always visible (mobile)
- **Empty State**: Hidden or subtle "Start browsing" message

### History Page

- **Grid**: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Card Layout**:
  - Product image (top)
  - Product name (truncated to 2 lines)
  - Price (prominent)
  - "Viewed [relative date]" (gray text)
  - Quick actions: View, Add to cart, Remove
- **Clear All Button**: Red, confirmation dialog before clearing
- **Empty State**: Illustration + "Start exploring" CTA

### Date Formatting

```typescript
// Relative date examples
- Viewed today at 3:30 PM → "Today"
- Viewed yesterday → "Yesterday"
- Viewed 3 days ago → "3 days ago"
- Viewed Dec 1, 2025 → "Dec 1"
- Viewed Nov 15, 2024 → "Nov 15, 2024"
```

## Testing

### Unit Tests

```typescript
// ViewingHistoryService
- Add item to empty history
- Add duplicate item (moves to top)
- Enforce MAX_ITEMS limit (oldest removed)
- Remove expired items (older than 30 days)
- Remove single item
- Clear all items
- Get recently viewed (limit 8)

// Date formatting
- Format "today" correctly
- Format "yesterday" correctly
- Format "3 days ago" correctly
- Format older dates with full date
```

### Integration Tests

```typescript
// Product Page
- Viewing product adds to history
- Viewing same product updates timestamp
- Product excluded from own widget

// RecentlyViewedWidget
- Shows last 8 items
- Horizontal scroll works
- "View All" links to /user/history
- Hidden when no history

// History Page
- Displays all history items in grid
- Remove individual item works
- "Clear All" shows confirmation
- Confirmation clears all items
- Empty state shown when no history
```

### E2E Tests

```typescript
- User views Product A
- User views Product B
- User views Product C
- RecentlyViewedWidget shows C, B, A (newest first)
- User clicks "View All"
- History page shows 3 products in grid
- User removes Product B
- Grid updates to show 2 products (C, A)
- User closes browser and reopens
- History persists (localStorage)
- User views Product A again
- A moves to top of list
```

## Performance Considerations

- **Lazy Loading**: Widget only loads when visible (Intersection Observer)
- **Batch Fetching**: Fetch product details in batch for history page
- **Debouncing**: Debounce localStorage writes (500ms)
- **Memoization**: Memoize history items to avoid re-renders
- **Pagination**: History page uses pagination if > 50 items

## Accessibility

- RecentlyViewedWidget has role="complementary" and aria-label
- Carousel has keyboard navigation (Arrow keys)
- "View All" link has aria-label "View full browsing history"
- History page has h1 "Browsing History"
- Remove buttons have aria-label "Remove [product name] from history"
- Empty state has aria-live="polite" for screen readers

## Firebase Sync (Optional - Future)

For logged-in users, optionally sync to Firebase:

```typescript
// Collection: /viewingHistory/{userId}/items/{productId}
interface ViewingHistoryDB {
  userId: string;
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  viewedAt: Timestamp;
  device?: string; // 'web', 'mobile'
}

// Sync strategy
- On login: Merge localStorage with Firebase data
- On view: Write to both localStorage and Firebase
- On device change: Pull history from Firebase
- Conflict resolution: Latest viewedAt wins
```

## Privacy Considerations

- History stored locally only (no server tracking)
- Users can clear history anytime
- No tracking of guest users without consent
- GDPR compliant (data stored client-side)
- Can be disabled in user settings (future)

## Future Enhancements

- [ ] Filter by category on history page
- [ ] Filter by date range
- [ ] Search within history
- [ ] Export history as CSV
- [ ] Set custom expiry days (7, 30, 90, never)
- [ ] Pin favorite products in history
- [ ] Share history with others
- [ ] View history for auctions (separate feature)
- [ ] Desktop notification "You viewed this before"

## Related Documentation

- Epic: `TDD/epics/E002-product-catalog.md` (F002.9: Viewing History)
- Implementation: `docs/11-viewing-history.md`
- Test Cases: `TDD/resources/products/TEST-CASES.md` (History section)
