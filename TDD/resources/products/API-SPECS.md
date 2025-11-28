# Products Resource - API Specifications

## Overview

Product management APIs for catalog browsing, CRUD operations, and seller/admin management.

---

## Endpoints

### Public Endpoints

#### GET /api/products

List products with filtering and pagination.

**Query Parameters**:

| Param     | Type    | Default   | Description                    |
| --------- | ------- | --------- | ------------------------------ |
| page      | number  | 1         | Page number                    |
| limit     | number  | 20        | Items per page (max 100)       |
| category  | string  | -         | Category slug or ID            |
| shop      | string  | -         | Shop slug or ID                |
| minPrice  | number  | -         | Minimum price in paise         |
| maxPrice  | number  | -         | Maximum price in paise         |
| status    | string  | active    | Product status                 |
| sortBy    | string  | createdAt | createdAt, price, rating, name |
| order     | string  | desc      | asc/desc                       |
| search    | string  | -         | Search term                    |
| inStock   | boolean | -         | Only in-stock items            |
| isAuction | boolean | false     | Filter auction products        |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "price": 129900,
      "comparePrice": 139900,
      "images": [
        {
          "url": "https://storage.jfv.in/products/iphone-15-pro.jpg",
          "alt": "iPhone 15 Pro"
        }
      ],
      "category": {
        "id": "cat_mobiles",
        "name": "Mobiles",
        "slug": "mobiles"
      },
      "shop": {
        "id": "shop_001",
        "name": "Tech Store",
        "slug": "tech-store"
      },
      "rating": 4.7,
      "reviewCount": 234,
      "inStock": true,
      "quantity": 50,
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

#### GET /api/products/:id

Get product by ID or slug.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Latest iPhone with A17 Pro chip...",
    "shortDescription": "Premium smartphone with...",
    "price": 129900,
    "comparePrice": 139900,
    "sku": "IPH15PRO-256-BLK",
    "barcode": "1234567890123",
    "images": [
      {
        "id": "img_001",
        "url": "https://storage.jfv.in/products/iphone-15-pro.jpg",
        "thumbnailUrl": "https://storage.jfv.in/products/iphone-15-pro-thumb.jpg",
        "alt": "iPhone 15 Pro Front",
        "order": 1
      }
    ],
    "category": {
      "id": "cat_mobiles",
      "name": "Mobiles",
      "slug": "mobiles",
      "breadcrumb": ["Electronics", "Mobiles"]
    },
    "shop": {
      "id": "shop_001",
      "name": "Tech Store",
      "slug": "tech-store",
      "rating": 4.5,
      "isVerified": true
    },
    "attributes": {
      "color": "Space Black",
      "storage": "256GB",
      "ram": "8GB"
    },
    "variants": [
      {
        "id": "var_001",
        "name": "256GB - Space Black",
        "price": 129900,
        "quantity": 50,
        "attributes": {
          "storage": "256GB",
          "color": "Space Black"
        }
      }
    ],
    "specifications": [
      { "key": "Processor", "value": "A17 Pro" },
      { "key": "Display", "value": "6.1\" Super Retina XDR" }
    ],
    "rating": 4.7,
    "reviewCount": 234,
    "soldCount": 1250,
    "viewCount": 45000,
    "quantity": 50,
    "inStock": true,
    "isAuction": false,
    "status": "active",
    "seo": {
      "title": "Buy iPhone 15 Pro Online",
      "description": "Shop iPhone 15 Pro at best price...",
      "keywords": ["iphone", "apple", "smartphone"]
    },
    "createdAt": "2024-01-20T00:00:00Z",
    "updatedAt": "2024-11-28T12:00:00Z"
  }
}
```

**Error Responses**:

| Status | Code        | Message           |
| ------ | ----------- | ----------------- |
| 404    | `NOT_FOUND` | Product not found |

---

#### GET /api/products/:id/reviews

Get product reviews.

**Query Parameters**:

| Param  | Type   | Default   | Description           |
| ------ | ------ | --------- | --------------------- |
| page   | number | 1         | Page number           |
| limit  | number | 10        | Items per page        |
| rating | number | -         | Filter by star rating |
| sortBy | string | createdAt | createdAt, helpful    |

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.7,
      "totalReviews": 234,
      "distribution": {
        "5": 150,
        "4": 50,
        "3": 20,
        "2": 10,
        "1": 4
      }
    },
    "reviews": [
      {
        "id": "rev_001",
        "rating": 5,
        "title": "Excellent phone!",
        "content": "Best purchase ever...",
        "author": {
          "id": "user_123",
          "name": "John D.",
          "avatar": "https://..."
        },
        "images": [],
        "helpfulCount": 42,
        "verifiedPurchase": true,
        "createdAt": "2024-11-01T00:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 234,
    "hasMore": true
  }
}
```

---

#### GET /api/products/:id/related

Get related products.

**Query Parameters**:

| Param | Type   | Default | Description     |
| ----- | ------ | ------- | --------------- |
| limit | number | 8       | Number of items |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_002",
      "name": "iPhone 15",
      "slug": "iphone-15",
      "price": 79900,
      "image": "https://...",
      "rating": 4.5,
      "inStock": true
    }
  ]
}
```

---

### Seller Endpoints

#### GET /api/seller/products

List seller's products.

**Headers**: `Authorization: Bearer <seller_token>`

**Query Parameters**:

| Param  | Type   | Default | Description           |
| ------ | ------ | ------- | --------------------- |
| page   | number | 1       | Page number           |
| limit  | number | 20      | Items per page        |
| status | string | -       | active/draft/inactive |
| search | string | -       | Search by name/SKU    |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "price": 129900,
      "quantity": 50,
      "status": "active",
      "soldCount": 1250,
      "revenue": 162375000,
      "createdAt": "2024-01-20T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

#### POST /api/seller/products

Create a new product.

**Headers**: `Authorization: Bearer <seller_token>`

**Request Body**:

```json
{
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "description": "Latest iPhone with A17 Pro chip...",
  "shortDescription": "Premium smartphone...",
  "price": 129900,
  "comparePrice": 139900,
  "sku": "IPH15PRO-256-BLK",
  "categoryId": "cat_mobiles",
  "images": [
    {
      "url": "https://storage.jfv.in/products/iphone.jpg",
      "alt": "iPhone 15 Pro"
    }
  ],
  "attributes": {
    "color": "Space Black",
    "storage": "256GB"
  },
  "specifications": [{ "key": "Processor", "value": "A17 Pro" }],
  "quantity": 50,
  "status": "draft"
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "prod_new_001",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "status": "draft",
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Product created successfully"
}
```

**Error Responses**:

| Status | Code                | Message                     |
| ------ | ------------------- | --------------------------- |
| 400    | `INVALID_DATA`      | Validation error            |
| 400    | `SLUG_EXISTS`       | Product slug already exists |
| 400    | `INVALID_CATEGORY`  | Category not found          |
| 403    | `SHOP_NOT_VERIFIED` | Shop must be verified       |

---

#### PUT /api/seller/products/:id

Update a product.

**Headers**: `Authorization: Bearer <seller_token>`

**Request Body**:

```json
{
  "name": "iPhone 15 Pro Max",
  "price": 159900,
  "quantity": 30,
  "status": "active"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "iPhone 15 Pro Max",
    "price": 159900,
    "quantity": 30,
    "status": "active",
    "updatedAt": "2024-11-29T11:00:00Z"
  },
  "message": "Product updated successfully"
}
```

---

#### DELETE /api/seller/products/:id

Delete a product.

**Headers**: `Authorization: Bearer <seller_token>`

**Response (200)**:

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

#### POST /api/seller/products/bulk

Bulk product operations.

**Headers**: `Authorization: Bearer <seller_token>`

**Request Body**:

```json
{
  "action": "activate",
  "productIds": ["prod_001", "prod_002", "prod_003"]
}
```

**Supported Actions**: `activate`, `deactivate`, `delete`, `archive`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "processed": 3,
    "failed": 0,
    "results": [
      { "id": "prod_001", "success": true },
      { "id": "prod_002", "success": true },
      { "id": "prod_003", "success": true }
    ]
  }
}
```

---

### Admin Endpoints

#### GET /api/admin/products

List all products (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:

| Param  | Type   | Default | Description                 |
| ------ | ------ | ------- | --------------------------- |
| page   | number | 1       | Page number                 |
| limit  | number | 20      | Items per page              |
| status | string | -       | any status including banned |
| shop   | string | -       | Filter by shop              |
| seller | string | -       | Filter by seller ID         |

---

#### PATCH /api/admin/products/:id

Admin update product (including status changes).

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:

```json
{
  "status": "banned",
  "banReason": "Prohibited item"
}
```

---

#### POST /api/admin/products/bulk

Bulk admin operations.

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:

```json
{
  "action": "ban",
  "productIds": ["prod_001", "prod_002"],
  "reason": "Policy violation"
}
```

**Supported Actions**: `approve`, `ban`, `unban`, `delete`, `feature`, `unfeature`

---

## RBAC Permissions

| Endpoint                    | Guest | User | Seller | Admin |
| --------------------------- | ----- | ---- | ------ | ----- |
| GET /products               | ✅    | ✅   | ✅     | ✅    |
| GET /products/:id           | ✅    | ✅   | ✅     | ✅    |
| GET /products/:id/reviews   | ✅    | ✅   | ✅     | ✅    |
| GET /products/:id/related   | ✅    | ✅   | ✅     | ✅    |
| GET /seller/products        | ❌    | ❌   | ✅     | ✅    |
| POST /seller/products       | ❌    | ❌   | ✅     | ✅    |
| PUT /seller/products/:id    | ❌    | ❌   | ✅\*   | ✅    |
| DELETE /seller/products/:id | ❌    | ❌   | ✅\*   | ✅    |
| POST /seller/products/bulk  | ❌    | ❌   | ✅\*   | ✅    |
| GET /admin/products         | ❌    | ❌   | ❌     | ✅    |
| PATCH /admin/products/:id   | ❌    | ❌   | ❌     | ✅    |
| POST /admin/products/bulk   | ❌    | ❌   | ❌     | ✅    |

\*Owner only (shop must match)

---

## Service Usage

```typescript
import { productsService } from "@/services";

// Public operations
const products = await productsService.list({
  category: "mobiles",
  minPrice: 50000,
  maxPrice: 150000,
  sortBy: "price",
  order: "asc",
});

const product = await productsService.getById("prod_001");
const productBySlug = await productsService.getBySlug("iphone-15-pro");

const reviews = await productsService.getReviews("prod_001", {
  page: 1,
  rating: 5,
});

const related = await productsService.getRelated("prod_001", { limit: 8 });

// Seller operations
const myProducts = await productsService.listSeller({ status: "active" });
const newProduct = await productsService.create(productData);
await productsService.update("prod_001", { price: 149900 });
await productsService.delete("prod_001");
await productsService.bulkSeller({
  action: "activate",
  productIds: ["prod_001", "prod_002"],
});

// Admin operations
const allProducts = await productsService.listAdmin({ shop: "shop_001" });
await productsService.adminUpdate("prod_001", { status: "banned" });
await productsService.bulkAdmin({
  action: "ban",
  productIds: ["prod_001"],
  reason: "Policy violation",
});
```

---

## Validation Rules

### Product Creation

- **name**: 3-200 chars, required
- **slug**: 3-200 chars, lowercase, alphanumeric + hyphens, unique per shop
- **description**: Max 10000 chars
- **shortDescription**: Max 500 chars
- **price**: Positive integer (paise), required
- **comparePrice**: Must be >= price if provided
- **sku**: Max 100 chars, unique per shop
- **categoryId**: Valid category ID, required
- **images**: 1-10 images, required
- **quantity**: Non-negative integer, default 0
- **status**: draft/active/inactive

### Image Requirements

- Max file size: 5MB
- Formats: JPEG, PNG, WebP
- Recommended dimensions: 1200x1200
- Alt text: Max 200 chars

---

## Related Files

- `/src/services/products.service.ts`
- `/src/app/api/products/`
- `/src/app/api/seller/products/`
- `/src/app/api/admin/products/`
- `/src/types/backend/product.types.ts`
- `/src/types/frontend/product.types.ts`
