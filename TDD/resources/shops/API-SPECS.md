# Shops Resource - API Specifications

## Overview

Shop management APIs for marketplace shop profiles, verification, and seller operations.

---

## Endpoints

### Public Endpoints

#### GET /api/shops

List shops.

**Query Parameters**:

| Param    | Type    | Default | Description               |
| -------- | ------- | ------- | ------------------------- |
| page     | number  | 1       | Page number               |
| limit    | number  | 20      | Items per page            |
| verified | boolean | -       | Filter verified shops     |
| category | string  | -       | Filter by category        |
| sortBy   | string  | rating  | rating, products, reviews |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "shop_001",
      "name": "Tech Store",
      "slug": "tech-store",
      "logo": "https://...",
      "description": "Premium electronics...",
      "isVerified": true,
      "rating": 4.5,
      "reviewCount": 156,
      "productCount": 45,
      "categories": ["electronics", "mobiles"]
    }
  ],
  "meta": { "page": 1, "total": 100 }
}
```

---

#### GET /api/shops/:id

Get shop by ID or slug.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "shop_001",
    "name": "Tech Store",
    "slug": "tech-store",
    "logo": "https://...",
    "banner": "https://...",
    "description": "Premium electronics store...",
    "shortDescription": "Your tech destination",
    "isVerified": true,
    "verifiedAt": "2024-01-15T00:00:00Z",
    "contact": {
      "email": "contact@techstore.com",
      "phone": "+919876543210"
    },
    "address": {
      "city": "Mumbai",
      "state": "Maharashtra"
    },
    "stats": {
      "rating": 4.5,
      "reviewCount": 156,
      "productCount": 45,
      "totalSales": 1250,
      "responseRate": 98,
      "avgResponseTime": "< 1 hour"
    },
    "policies": {
      "returnPolicy": "7 days return...",
      "shippingPolicy": "Free shipping above ₹500"
    },
    "social": {
      "website": "https://techstore.com",
      "instagram": "@techstore"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /api/shops/:id/products

Get shop's products.

---

#### GET /api/shops/:id/reviews

Get shop reviews.

---

### Seller Endpoints

#### GET /api/seller/shop

Get seller's own shop.

**Headers**: `Authorization: Bearer <seller_token>`

---

#### PUT /api/seller/shop

Update shop details.

**Request Body**:

```json
{
  "name": "Updated Store Name",
  "description": "New description...",
  "logo": "https://...",
  "policies": {
    "returnPolicy": "Updated policy..."
  }
}
```

---

### Admin Endpoints

#### PATCH /api/admin/shops/:id

Admin shop management.

**Request Body**:

```json
{
  "action": "verify",
  "isVerified": true,
  "notes": "Verification complete"
}
```

**Actions**: `verify`, `unverify`, `ban`, `unban`, `feature`, `unfeature`

---

## RBAC Permissions

| Endpoint               | Guest | User | Seller | Admin |
| ---------------------- | ----- | ---- | ------ | ----- |
| GET /shops             | ✅    | ✅   | ✅     | ✅    |
| GET /shops/:id         | ✅    | ✅   | ✅     | ✅    |
| GET /seller/shop       | ❌    | ❌   | ✅     | ✅    |
| PUT /seller/shop       | ❌    | ❌   | ✅\*   | ✅    |
| PATCH /admin/shops/:id | ❌    | ❌   | ❌     | ✅    |

\*Own shop only

---

## Service Usage

```typescript
import { shopsService } from "@/services";

const shops = await shopsService.list({ verified: true });
const shop = await shopsService.getById("shop_001");
const products = await shopsService.getProducts("shop_001");

// Seller
const myShop = await shopsService.getSeller();
await shopsService.update({ name: "New Name" });

// Admin
await shopsService.verify("shop_001");
await shopsService.ban("shop_001", { reason: "Policy violation" });
```
