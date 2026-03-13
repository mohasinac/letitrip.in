# Wishlist Feature

**Feature path:** `src/features/wishlist/`  
**Repository:** `wishlistRepository`  
**Service:** `wishlistService`  
**Actions:** `addToWishlistAction`, `removeFromWishlistAction`, `getWishlistAction`

---

## Overview

The wishlist lets authenticated users save products for later. Each wishlist item is a Firestore document linking a `userId` to a `productId`.

---

## Wishlist Page

### `WishlistView` (`/user/wishlist`)

Grid of saved products rendered as `ProductCard` components.

- Empty state with "Explore Products" CTA
- Each card has a filled heart icon to remove

**Data:** `useWishlist(enabled)` → `wishlistService.get()` → `GET /api/user/wishlist`  
**Types:** `WishlistItem`, `WishlistResponse`

---

## Wishlist Button

### `WishlistButton` — `src/features/wishlist/components/WishlistButton.tsx`

Reusable heart icon button placed on `ProductCard` and `ProductDetailView`.

- **Filled heart** — in wishlist
- **Outline heart** — not in wishlist
- Click → optimistic toggle via `useWishlistToggle`

```tsx
<WishlistButton
  productId={product.id}
  initialInWishlist={product.isInWishlist}
/>
```

---

## Hooks

### `useWishlist(enabled)`

Fetches the user's full wishlist. `enabled` is `false` for guests to skip the API call.

**Returns:** `WishlistResponse` — `{ items: WishlistItem[], count: number }`

### `useWishlistToggle(productId, initialInWishlist)`

Optimistic toggle hook:

- Updates local state immediately
- Calls `addToWishlistAction` or `removeFromWishlistAction`
- Rolls back on error

---

## API Routes

| Method   | Route                            | Description          |
| -------- | -------------------------------- | -------------------- |
| `GET`    | `/api/user/wishlist`             | Get wishlist         |
| `POST`   | `/api/user/wishlist`             | Add to wishlist      |
| `DELETE` | `/api/user/wishlist/[productId]` | Remove from wishlist |
