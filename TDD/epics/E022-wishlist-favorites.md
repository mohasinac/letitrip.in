# Epic E022: Wishlist/Favorites System

## Overview

User wishlist and favorites functionality allowing users to save products and auctions for later viewing, comparison, and purchase notifications.

## Scope

- Add/remove items to favorites
- View favorites list
- Favorites across products and auctions
- Price drop notifications
- Stock notifications
- Share wishlist
- Sync across devices (for logged-in users)

## User Roles Involved

- **Admin**: View system-wide favorites analytics
- **Seller**: View which products are favorited
- **User**: Full favorites access
- **Guest**: Limited (local storage only)

---

## Features

### F022.1: Add to Favorites

**US022.1.1**: Add Product to Favorites (User)

```
Action:
- Click heart icon on product card
- Click "Add to Favorites" on product page
- Toggle favorite status

Response:
- Immediate UI feedback
- Toast notification
- Sync to server (logged-in users)
```

**US022.1.2**: Add Auction to Favorites (User)

- Same as product
- Also adds to auction watchlist

**US022.1.3**: Remove from Favorites (User)

- Toggle off
- Remove from list view

### F022.2: View Favorites

**US022.2.1**: View Favorites List (User)

```
Display:
- Product/Auction image
- Title
- Current price
- Original price (if discounted)
- Stock status
- Add to Cart button
- Remove button
- Date added
```

**US022.2.2**: Filter Favorites (User)

```
Filters:
- Type (Products, Auctions)
- Category
- Price range
- In stock only
- On sale only
```

**US022.2.3**: Sort Favorites (User)

```
Sort options:
- Date added (newest/oldest)
- Price (low to high/high to low)
- Name (A-Z)
```

### F022.3: Favorites Notifications

**US022.3.1**: Price Drop Notification (User)

- Notify when price decreases
- Email notification option
- Push notification option

**US022.3.2**: Back in Stock Notification (User)

- Notify when out-of-stock item is restocked
- Email notification
- Limited-time notification

**US022.3.3**: Auction Starting Soon (User)

- Notify before auction starts
- Configurable reminder time

### F022.4: Favorites Management

**US022.4.1**: Create Multiple Lists (User) - Optional

```
Lists:
- Default wishlist
- Custom named lists
- Move items between lists
```

**US022.4.2**: Share Favorites (User)

- Generate shareable link
- Privacy settings (public/private)

**US022.4.3**: Clear All Favorites (User)

- Bulk delete with confirmation

### F022.5: Guest Favorites

**US022.5.1**: Local Storage Favorites (Guest)

- Store favorites in browser
- Prompt to login to sync
- Merge on login

**US022.5.2**: Sync on Login (User)

- Merge local favorites with server
- Handle duplicates

---

## API Endpoints

| Method | Endpoint                           | Description                 | Auth   |
| ------ | ---------------------------------- | --------------------------- | ------ |
| GET    | `/api/favorites`                   | Get user's favorites        | User   |
| POST   | `/api/favorites`                   | Add to favorites            | User   |
| DELETE | `/api/favorites/:id`               | Remove from favorites       | User   |
| DELETE | `/api/favorites/clear`             | Clear all favorites         | User   |
| GET    | `/api/favorites/check/:itemId`     | Check if item is favorited  | User   |
| POST   | `/api/favorites/sync`              | Sync local favorites        | User   |
| PUT    | `/api/favorites/:id/notifications` | Update notifications        | User   |
| GET    | `/api/admin/favorites/analytics`   | Favorites analytics         | Admin  |
| GET    | `/api/seller/favorites`            | Seller's favorited products | Seller |

---

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

### FavoriteListItem (for multiple lists - optional)

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

---

## UI Components

### Components

| Component        | Location                                        | Description          |
| ---------------- | ----------------------------------------------- | -------------------- |
| FavoriteButton   | `src/components/common/FavoriteButton.tsx`      | Heart toggle button  |
| FavoritesList    | `src/components/favorites/FavoritesList.tsx`    | List of favorites    |
| FavoritesCard    | `src/components/favorites/FavoritesCard.tsx`    | Single favorite item |
| FavoritesFilters | `src/components/favorites/FavoritesFilters.tsx` | Filter controls      |
| FavoritesEmpty   | `src/components/favorites/FavoritesEmpty.tsx`   | Empty state          |

### User Pages

| Page         | Route               | Description           |
| ------------ | ------------------- | --------------------- |
| My Favorites | `/user/favorites`   | User's favorites list |
| Shared List  | `/favorites/:token` | Public shared list    |

---

## Acceptance Criteria

### AC022.1: Add/Remove Favorites

- [ ] User can add product to favorites via heart icon
- [ ] Heart icon shows filled state when favorited
- [ ] User can remove from favorites by clicking again
- [ ] Toast notification confirms action
- [ ] Changes sync to server immediately

### AC022.2: View Favorites

- [ ] Favorites page lists all saved items
- [ ] Items show current price and image
- [ ] Out of stock items are marked
- [ ] Items can be added to cart directly
- [ ] Empty state shows when no favorites

### AC022.3: Filters and Sorting

- [ ] User can filter by type (products/auctions)
- [ ] User can filter by category
- [ ] User can sort by date, price, name
- [ ] Filters persist across sessions

### AC022.4: Notifications

- [ ] User can enable price drop notifications
- [ ] User receives email when price drops
- [ ] User can enable back-in-stock notifications
- [ ] Notifications can be disabled per item

### AC022.5: Guest Experience

- [ ] Guest can add favorites (stored locally)
- [ ] Guest sees prompt to login to sync
- [ ] On login, local favorites merge with server
- [ ] Duplicate items are handled gracefully

---

## Test Documentation

### Unit Tests

| Test File                                       | Coverage        |
| ----------------------------------------------- | --------------- |
| `src/app/api/favorites/route.test.ts`           | Favorites API   |
| `src/components/common/FavoriteButton.test.tsx` | Favorite button |
| `src/app/user/favorites/page.test.tsx`          | Favorites page  |
| `src/hooks/useFavorites.test.ts`                | Favorites hook  |

### Integration Tests

| Test File                                          | Coverage                |
| -------------------------------------------------- | ----------------------- |
| `TDD/acceptance/E022-favorites-acceptance.test.ts` | Full favorites workflow |

---

## Dependencies

- E001: User Management (authentication)
- E002: Product Catalog (product data)
- E003: Auction System (auction data)
- E016: Notifications (alerts)

---

## Implementation Notes

1. Use optimistic UI updates for heart toggle
2. Debounce rapid clicks to prevent double-adds
3. Cache favorites in React Query/SWR for performance
4. Implement periodic price check for notifications
5. Consider using localStorage + IndexedDB for guest favorites
6. Batch sync on login to minimize API calls
7. Heart icon should be accessible (aria-label, keyboard navigation)
