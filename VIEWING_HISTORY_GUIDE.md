# Viewing History Feature Guide

## Overview

The viewing history feature tracks recently viewed products and auctions, providing users with easy access to items they've browsed. The implementation uses browser localStorage for persistence, supports both products and auctions, and includes automatic expiry and deduplication.

---

## Architecture

### Storage Strategy

**LocalStorage-based:**

- No backend API required
- Instant updates
- Works for both guest and authenticated users
- Syncs across tabs in same browser
- Privacy-friendly (stored locally, not on server)

**Key Benefits:**

- ⚡ Fast performance (no network calls)
- 🔒 Privacy-friendly (client-side only)
- 💾 Persistent across sessions
- 🚀 No database load

---

## Implementation Components

### 1. Constants (`/src/constants/navigation.ts`)

```typescript
export const VIEWING_HISTORY_CONFIG = {
  MAX_ITEMS: 50, // Maximum items to store
  STORAGE_KEY: "viewing_history",
  EXPIRY_DAYS: 30, // Auto-delete after 30 days
  TYPES: {
    PRODUCT: "product",
    AUCTION: "auction",
  } as const,
};

export interface ViewingHistoryItem {
  id: string; // Product/auction ID
  type: "product" | "auction";
  title: string; // Item title
  slug: string; // URL slug
  image: string; // Thumbnail URL
  price: number; // Current price
  shop_id: string; // Shop ID
  shop_name: string; // Shop name
  viewed_at: number; // Timestamp
}
```

### 2. Manager Library (`/src/lib/viewing-history.ts`)

**Core Features:**

- Add items to history
- Remove duplicates automatically
- Move existing items to front
- Filter by type (product/auction)
- Auto-expire old items
- Clear history
- Get counts

**API Methods:**

```typescript
// Add item (automatically moves to front if exists)
ViewingHistory.add({
  id: "prod-123",
  type: "product",
  title: "Product Name",
  slug: "product-name",
  image: "/images/product.jpg",
  price: 1999,
  shop_id: "shop-1",
  shop_name: "Shop Name",
});

// Get all items (sorted by most recent)
const all = ViewingHistory.getAll();

// Get by type
const products = ViewingHistory.getByType("product");
const auctions = ViewingHistory.getByType("auction");

// Get recent items (limited)
const recent = ViewingHistory.getRecent(10);
const recentProducts = ViewingHistory.getRecentByType("product", 5);

// Check if exists
const exists = ViewingHistory.has("prod-123", "product");

// Remove item
ViewingHistory.remove("prod-123", "product");

// Clear all
ViewingHistory.clear();

// Get counts
const total = ViewingHistory.count();
const productCount = ViewingHistory.countByType("product");

// Clean expired items
ViewingHistory.cleanExpired();
```

### 3. React Hook (`/src/hooks/useViewingHistory.ts`)

**Features:**

- Reactive state updates
- Automatic cleanup on mount
- Easy component integration
- Type-safe API

**Usage in Components:**

```typescript
import { useViewingHistory } from "@/hooks/useViewingHistory";

function MyComponent() {
  const {
    history, // All items
    products, // Products only
    auctions, // Auctions only
    addToHistory, // Add item
    removeFromHistory, // Remove item
    clearHistory, // Clear all
    hasInHistory, // Check existence
    getRecent, // Get recent items
    count, // Total count
    productCount, // Product count
    auctionCount, // Auction count
  } = useViewingHistory();

  return (
    <div>
      <p>Total viewed: {count}</p>
      <p>Products: {productCount}</p>
      <p>Auctions: {auctionCount}</p>
    </div>
  );
}
```

---

## Integration Guide

### 1. Product Detail Page

```typescript
// /src/app/products/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useViewingHistory } from "@/hooks/useViewingHistory";

export default function ProductPage({ product }) {
  const { addToHistory } = useViewingHistory();

  useEffect(() => {
    // Add to history when product loads
    addToHistory({
      id: product.id,
      type: "product",
      title: product.title,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      shop_id: product.shop_id,
      shop_name: product.shop_name,
    });
  }, [product, addToHistory]);

  return <div>{/* Product details */}</div>;
}
```

### 2. Auction Detail Page

```typescript
// /src/app/auctions/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useViewingHistory } from "@/hooks/useViewingHistory";

export default function AuctionPage({ auction }) {
  const { addToHistory } = useViewingHistory();

  useEffect(() => {
    // Add to history when auction loads
    addToHistory({
      id: auction.id,
      type: "auction",
      title: auction.title,
      slug: auction.slug,
      image: auction.images[0],
      price: auction.current_bid,
      shop_id: auction.shop_id,
      shop_name: auction.shop_name,
    });
  }, [auction, addToHistory]);

  return <div>{/* Auction details */}</div>;
}
```

### 3. History Page

```typescript
// /src/app/user/history/page.tsx
"use client";

import { useState } from "react";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { ProductCard } from "@/components/cards/ProductCard";

export default function HistoryPage() {
  const { history, products, auctions, clearHistory, count } =
    useViewingHistory();
  const [filter, setFilter] = useState<"all" | "products" | "auctions">("all");

  const items =
    filter === "products"
      ? products
      : filter === "auctions"
      ? auctions
      : history;

  if (count === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Viewing History</h1>
        <button onClick={clearHistory} className="btn-secondary">
          Clear History
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "tab-active" : "tab"}
        >
          All ({count})
        </button>
        <button
          onClick={() => setFilter("products")}
          className={filter === "products" ? "tab-active" : "tab"}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setFilter("auctions")}
          className={filter === "auctions" ? "tab-active" : "tab"}
        >
          Auctions ({auctions.length})
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <ViewingHistoryCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 4. Recently Viewed Widget

```typescript
// /src/components/common/RecentlyViewed.tsx
"use client";

import { useViewingHistory } from "@/hooks/useViewingHistory";
import { ProductCard } from "@/components/cards/ProductCard";

interface RecentlyViewedProps {
  limit?: number;
  type?: "all" | "products" | "auctions";
  title?: string;
}

export function RecentlyViewed({
  limit = 10,
  type = "all",
  title = "Recently Viewed",
}: RecentlyViewedProps) {
  const { getRecent, getRecentByType } = useViewingHistory();

  const items =
    type === "all"
      ? getRecent(limit)
      : getRecentByType(type === "products" ? "product" : "auction", limit);

  if (items.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {items.map((item) => (
          <ViewingHistoryCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
```

### 5. Homepage Integration

```typescript
// /src/app/page.tsx
import { RecentlyViewed } from "@/components/common/RecentlyViewed";

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}

      {/* Featured products */}

      {/* Recently viewed - shows below featured */}
      <RecentlyViewed limit={10} type="all" />

      {/* Other sections */}
    </div>
  );
}
```

---

## Component Examples

### ViewingHistoryCard

```typescript
// /src/components/user/ViewingHistoryItem.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import type { ViewingHistoryItem } from "@/constants/navigation";

interface ViewingHistoryCardProps {
  item: ViewingHistoryItem;
  onRemove?: (id: string, type: "product" | "auction") => void;
}

export function ViewingHistoryCard({
  item,
  onRemove,
}: ViewingHistoryCardProps) {
  const href =
    item.type === "product"
      ? `/products/${item.slug}`
      : `/auctions/${item.slug}`;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <Link href={href}>
        <div className="aspect-square relative">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover rounded-t-lg"
          />
          {item.type === "auction" && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
              Auction
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={href}>
          <h3 className="font-semibold mb-2 line-clamp-2 hover:text-blue-600">
            {item.title}
          </h3>
        </Link>

        <p className="text-lg font-bold text-green-600 mb-2">
          {formatPrice(item.price)}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{item.shop_name}</span>
          <span>{formatRelativeTime(item.viewed_at)}</span>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(item.id, item.type)}
            className="mt-2 text-red-500 text-sm hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
```

### ClearHistoryButton

```typescript
// /src/components/user/ClearHistoryButton.tsx
"use client";

import { useState } from "react";
import { useViewingHistory } from "@/hooks/useViewingHistory";

export function ClearHistoryButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const { clearHistory, count } = useViewingHistory();

  if (count === 0) return null;

  const handleClear = () => {
    clearHistory();
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)} className="btn-secondary">
        Clear History
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Clear Viewing History?</h3>
            <p className="text-gray-600 mb-6">
              This will remove all {count} items from your viewing history. This
              action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button onClick={handleClear} className="btn-primary flex-1">
                Clear History
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Navigation Integration

### Updated User Menu

```typescript
// /src/constants/navigation.ts (already updated)
export const USER_MENU_ITEMS = [
  { id: "orders", name: "My Orders", link: "/user/orders", icon: "package" },
  { id: "bids", name: "My Bids", link: "/user/bids", icon: "gavel" },
  { id: "watchlist", name: "Watchlist", link: "/user/watchlist", icon: "eye" },
  {
    id: "won-auctions",
    name: "Won Auctions",
    link: "/user/won-auctions",
    icon: "trophy",
  },
  { id: "history", name: "History", link: "/user/history", icon: "clock" }, // ← Viewing history
  {
    id: "messages",
    name: "My Messages",
    link: "/user/messages",
    icon: "message-square",
  },
  {
    id: "favorites",
    name: "My Favorites",
    link: "/user/favorites",
    icon: "heart",
  },
  {
    id: "returns",
    name: "Returns & Refunds",
    link: "/user/returns",
    icon: "rotate-ccw",
  },
  {
    id: "settings",
    name: "Account Settings",
    link: "/user/settings",
    icon: "settings",
  },
  { id: "logout", name: "Logout", link: "/logout", icon: "log-out" },
];
```

---

## Data Flow

```
┌─────────────────────┐
│  Product/Auction    │
│   Detail Page       │
└──────────┬──────────┘
           │
           │ useEffect
           ▼
┌─────────────────────┐
│ useViewingHistory() │
│   addToHistory()    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ViewingHistory    │
│    Manager          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   localStorage      │
│  viewing_history    │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   History Page      │
│   Homepage Widget   │
│   Search Results    │
└─────────────────────┘
```

---

## Storage Format

**LocalStorage Key:** `viewing_history`

**Data Structure:**

```json
[
  {
    "id": "prod-123",
    "type": "product",
    "title": "Gaming Laptop",
    "slug": "gaming-laptop",
    "image": "/images/laptop.jpg",
    "price": 89999,
    "shop_id": "shop-1",
    "shop_name": "Tech Store",
    "viewed_at": 1699300000000
  },
  {
    "id": "auction-456",
    "type": "auction",
    "title": "Vintage Watch",
    "slug": "vintage-watch",
    "image": "/images/watch.jpg",
    "price": 15000,
    "shop_id": "shop-2",
    "shop_name": "Collectibles",
    "viewed_at": 1699299000000
  }
]
```

**Size Estimation:**

- Average item: ~200 bytes
- Max 50 items: ~10 KB
- Well within localStorage limits (5-10 MB)

---

## Features

### ✅ Implemented

1. **Automatic Tracking**

   - Products added when viewed
   - Auctions added when viewed
   - No user action required

2. **Smart Deduplication**

   - Viewing same item moves it to front
   - No duplicates in history
   - Latest view time updated

3. **Type Filtering**

   - View all items together
   - Filter by products only
   - Filter by auctions only

4. **Expiry Management**

   - Auto-delete after 30 days
   - Cleanup on app load
   - Configurable expiry period

5. **Performance**

   - Client-side storage (fast)
   - No API calls needed
   - Instant updates

6. **Privacy**
   - Stored locally only
   - Not sent to server
   - User can clear anytime

### 📋 To Implement

1. **UI Components**

   - [ ] `/src/app/user/history/page.tsx` - History page
   - [ ] `/src/components/user/ViewingHistoryList.tsx` - List component
   - [ ] `/src/components/user/ViewingHistoryItem.tsx` - Item card
   - [ ] `/src/components/common/RecentlyViewed.tsx` - Widget

2. **Integration Points**

   - [ ] Add to product detail pages
   - [ ] Add to auction detail pages
   - [ ] Add widget to homepage
   - [ ] Add widget to search results
   - [ ] Add to header navigation

3. **Optional Enhancements**
   - [ ] Sync with server for authenticated users
   - [ ] Cross-device sync
   - [ ] History analytics
   - [ ] Personalized recommendations based on history

---

## Testing Checklist

- [ ] Test adding products to history
- [ ] Test adding auctions to history
- [ ] Test deduplication (viewing same item twice)
- [ ] Test expiry (mock old timestamps)
- [ ] Test clearing history
- [ ] Test filtering by type
- [ ] Test localStorage unavailable (incognito mode)
- [ ] Test max items limit (51st item)
- [ ] Test across tabs (same browser)
- [ ] Test mobile responsiveness

---

## SEO Considerations

**History Page:**

- Not indexed (noindex meta tag)
- User-specific content
- No canonical URL needed

**Recently Viewed Widget:**

- Rendered client-side
- No impact on SEO
- Improves user engagement

---

## Accessibility

- [ ] Keyboard navigation for history items
- [ ] Screen reader support
- [ ] ARIA labels for actions
- [ ] Focus indicators
- [ ] Clear visual hierarchy

---

## Migration Strategy

If later moving to server-side storage:

1. Create API endpoints:

   - `POST /api/viewing-history` - Add item
   - `GET /api/viewing-history` - Get all
   - `DELETE /api/viewing-history` - Clear

2. Migrate localStorage data:

   ```typescript
   // One-time migration
   const localHistory = ViewingHistory.getAll();
   await fetch("/api/viewing-history/migrate", {
     method: "POST",
     body: JSON.stringify(localHistory),
   });
   ViewingHistory.clear();
   ```

3. Update ViewingHistoryManager to use API

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Status:** Implementation Ready
