# Categories Resource - API Specifications

## Overview

Product category management APIs with multi-parent hierarchy.

---

## Endpoints

### Public Endpoints

#### GET /api/categories

List all categories.

**Query Parameters**:

| Param           | Type   | Default | Description            |
| --------------- | ------ | ------- | ---------------------- |
| type            | string | -       | product/auction        |
| parentId        | string | -       | Get children of parent |
| flat            | bool   | false   | Return flat list       |
| includeProducts | bool   | false   | Include product counts |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "cat_electronics",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "image": "https://...",
      "parentIds": [],
      "type": "product",
      "productCount": 1250,
      "children": [
        {
          "id": "cat_mobiles",
          "name": "Mobile Phones",
          "slug": "mobile-phones",
          "parentIds": ["cat_electronics"],
          "productCount": 450,
          "children": [...]
        }
      ],
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

---

#### GET /api/categories/:slug

Get category by slug.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "cat_mobiles",
    "name": "Mobile Phones",
    "slug": "mobile-phones",
    "description": "Latest smartphones and feature phones",
    "image": "https://...",
    "parentIds": ["cat_electronics"],
    "parents": [
      { "id": "cat_electronics", "name": "Electronics", "slug": "electronics" }
    ],
    "type": "product",
    "productCount": 450,
    "metaTitle": "Mobile Phones - Best Deals",
    "metaDescription": "Shop mobile phones...",
    "isActive": true
  }
}
```

---

#### GET /api/categories/:id/products

Get products in category.

**Query Parameters**:

| Param           | Type   | Default | Description                    |
| --------------- | ------ | ------- | ------------------------------ |
| includeChildren | bool   | true    | Include products from children |
| page            | number | 1       | Page number                    |
| limit           | number | 20      | Items per page                 |

---

### Admin Endpoints

#### POST /api/admin/categories

Create category.

**Request Body**:

```json
{
  "name": "Smartphones",
  "slug": "smartphones",
  "description": "Latest smartphones",
  "parentIds": ["cat_electronics", "cat_mobiles"],
  "type": "product",
  "image": "https://...",
  "sortOrder": 1,
  "isActive": true,
  "metaTitle": "Smartphones - Best Deals",
  "metaDescription": "Shop the latest smartphones..."
}
```

---

#### PATCH /api/admin/categories/:id

Update category.

---

#### DELETE /api/admin/categories/:id

Delete category.

**Query Parameters**:

| Param          | Type   | Default | Description                |
| -------------- | ------ | ------- | -------------------------- |
| reassignTo     | string | -       | Reassign products to       |
| deleteProducts | bool   | false   | Delete associated products |

---

#### PATCH /api/admin/categories/reorder

Reorder categories.

**Request Body**:

```json
{
  "orders": [
    { "id": "cat_001", "sortOrder": 1 },
    { "id": "cat_002", "sortOrder": 2 }
  ]
}
```

---

## RBAC Permissions

| Endpoint                        | Guest | User | Seller | Admin |
| ------------------------------- | ----- | ---- | ------ | ----- |
| GET /categories                 | ✅    | ✅   | ✅     | ✅    |
| GET /categories/:slug           | ✅    | ✅   | ✅     | ✅    |
| GET /categories/:id/products    | ✅    | ✅   | ✅     | ✅    |
| POST /admin/categories          | ❌    | ❌   | ❌     | ✅    |
| PATCH /admin/categories/:id     | ❌    | ❌   | ❌     | ✅    |
| DELETE /admin/categories/:id    | ❌    | ❌   | ❌     | ✅    |
| PATCH /admin/categories/reorder | ❌    | ❌   | ❌     | ✅    |

---

## Multi-Parent Support

Categories support multiple parents for cross-listing:

```json
{
  "name": "Wireless Earbuds",
  "parentIds": ["cat_electronics", "cat_audio", "cat_accessories"]
}
```

This allows the category to appear under:

- Electronics > Wireless Earbuds
- Audio > Wireless Earbuds
- Accessories > Wireless Earbuds

---

## Service Usage

```typescript
import { categoriesService } from "@/services";

// Public
const categories = await categoriesService.getAll({ type: "product" });
const category = await categoriesService.getBySlug("mobile-phones");
const products = await categoriesService.getProducts("cat_001", {
  page: 1,
  limit: 20,
  includeChildren: true,
});

// Admin
await categoriesService.create({
  name: "Smartphones",
  slug: "smartphones",
  parentIds: ["cat_electronics"],
});
await categoriesService.update("cat_001", { name: "Smart Phones" });
await categoriesService.delete("cat_001", { reassignTo: "cat_002" });
await categoriesService.reorder([{ id: "cat_001", sortOrder: 1 }]);
```
