# Favorites Resource

## Overview

User favorites and wishlist functionality for products and auctions.

## Database Collections

- `favorites` - User favorites
- `auction_watchlist` - Auction watchlist (legacy, merged with favorites)

## API Routes

```
# User Routes
/api/favorites                    - GET       - Get user's favorites
/api/favorites                    - POST      - Add to favorites
/api/favorites/:id                - DELETE    - Remove from favorites
/api/favorites/clear              - DELETE    - Clear all favorites
/api/favorites/check/:itemId      - GET       - Check if item is favorited
/api/favorites/sync               - POST      - Sync local favorites (on login)
/api/favorites/:id/notifications  - PUT       - Update notification preferences

# Seller Routes
/api/seller/favorites             - GET       - Get seller's favorited products

# Admin Routes
/api/admin/favorites/analytics    - GET       - Favorites analytics
```

## Components

- `src/app/user/favorites/` - User favorites page
- `src/app/user/watchlist/` - Auction watchlist (legacy)
- `src/components/common/FavoriteButton.tsx` - Heart toggle button
- `src/components/favorites/` - Favorites list components

## Data Models

### Favorite

```typescript
interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: "product" | "auction";
  itemSnapshot: {
    title: string;
    image: string;
    price: number;
    originalPrice?: number;
    shopId: string;
    shopName: string;
    slug: string;
  };
  notifications: {
    priceDropEnabled: boolean;
    backInStockEnabled: boolean;
    auctionReminderEnabled?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### FavoriteList (Optional - Multiple Lists)

```typescript
interface FavoriteList {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  shareToken?: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Related Epic

- E022: Wishlist/Favorites System

## Status: 📋 Documentation Complete

- [x] User stories (E022)
- [x] API specifications
- [ ] Test cases
