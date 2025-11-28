# Favorites Resource - API Specifications

## Overview

User favorites/wishlist management APIs.

---

## Endpoints

### User Endpoints

#### GET /api/favorites

Get user's favorites.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

| Param | Type   | Default | Description          |
| ----- | ------ | ------- | -------------------- |
| type  | string | -       | product/auction/shop |
| page  | number | 1       | Page number          |
| limit | number | 20      | Items per page       |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "fav_001",
      "type": "product",
      "product": {
        "id": "prod_001",
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "price": 129900,
        "image": "https://...",
        "inStock": true
      },
      "addedAt": "2024-11-15T10:00:00Z"
    },
    {
      "id": "fav_002",
      "type": "auction",
      "auction": {
        "id": "auc_001",
        "title": "Vintage Watch",
        "slug": "vintage-watch",
        "currentBid": 15000,
        "image": "https://...",
        "endsAt": "2024-12-01T18:00:00Z"
      },
      "addedAt": "2024-11-20T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

#### POST /api/favorites

Add to favorites.

**Request Body**:

```json
{
  "type": "product",
  "entityId": "prod_001"
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "fav_003",
    "type": "product",
    "entityId": "prod_001",
    "addedAt": "2024-11-29T10:00:00Z"
  },
  "message": "Added to favorites"
}
```

**Error Responses**:

| Status | Code                | Message                        |
| ------ | ------------------- | ------------------------------ |
| 400    | `ALREADY_FAVORITED` | Item already in favorites      |
| 404    | `ENTITY_NOT_FOUND`  | Product/auction/shop not found |

---

#### DELETE /api/favorites/:id

Remove from favorites.

**Response (200)**:

```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

---

#### DELETE /api/favorites/entity/:type/:entityId

Remove by entity (alternative endpoint).

**Example**: `DELETE /api/favorites/entity/product/prod_001`

---

#### GET /api/favorites/check/:type/:entityId

Check if item is favorited.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "isFavorited": true,
    "favoriteId": "fav_001"
  }
}
```

---

#### POST /api/favorites/sync

Sync favorites (merge guest favorites after login).

**Request Body**:

```json
{
  "items": [
    { "type": "product", "entityId": "prod_001" },
    { "type": "product", "entityId": "prod_002" }
  ]
}
```

---

## RBAC Permissions

| Endpoint                        | Guest | User | Seller | Admin |
| ------------------------------- | ----- | ---- | ------ | ----- |
| GET /favorites                  | ❌    | ✅   | ✅     | ✅    |
| POST /favorites                 | ❌    | ✅   | ✅     | ✅    |
| DELETE /favorites/:id           | ❌    | ✅   | ✅     | ✅    |
| DELETE /favorites/entity/:t/:id | ❌    | ✅   | ✅     | ✅    |
| GET /favorites/check/:type/:id  | ❌    | ✅   | ✅     | ✅    |
| POST /favorites/sync            | ❌    | ✅   | ✅     | ✅    |

---

## Favorite Types

- `product` - Regular products
- `auction` - Auction listings
- `shop` - Seller shops

---

## Service Usage

```typescript
import { favoritesService } from "@/services";

// Get favorites
const favorites = await favoritesService.getAll({ type: "product" });

// Add to favorites
await favoritesService.add({ type: "product", entityId: "prod_001" });

// Remove from favorites
await favoritesService.remove("fav_001");
// OR
await favoritesService.removeByEntity("product", "prod_001");

// Check if favorited
const { isFavorited } = await favoritesService.check("product", "prod_001");

// Sync after login
await favoritesService.sync([
  { type: "product", entityId: "prod_001" },
  { type: "product", entityId: "prod_002" },
]);
```

---

## Local Storage (Guest)

For guests, favorites are stored in localStorage:

```typescript
const FAVORITES_KEY = "guest_favorites";

// Structure
{
  "products": ["prod_001", "prod_002"],
  "auctions": ["auc_001"],
  "shops": ["shop_001"]
}
```

On login, call `POST /api/favorites/sync` to merge with server.
