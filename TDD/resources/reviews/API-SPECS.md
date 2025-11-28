# Reviews Resource - API Specifications

## Overview

Review management APIs for products and shops.

---

## Endpoints

### Public Endpoints

#### GET /api/reviews

List reviews with filters.

**Query Parameters**:

| Param     | Type   | Default   | Description                |
| --------- | ------ | --------- | -------------------------- |
| productId | string | -         | Filter by product          |
| shopId    | string | -         | Filter by shop             |
| rating    | number | -         | Filter by star rating      |
| sortBy    | string | createdAt | createdAt, rating, helpful |

---

### User Endpoints

#### POST /api/reviews

Create a review.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "productId": "prod_001",
  "orderId": "order_001",
  "rating": 5,
  "title": "Excellent product!",
  "content": "Really happy with this purchase...",
  "images": ["https://..."]
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "review_001",
    "rating": 5,
    "title": "Excellent product!",
    "status": "pending",
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Review submitted for moderation"
}
```

**Error Responses**:

| Status | Code               | Message                        |
| ------ | ------------------ | ------------------------------ |
| 400    | `NOT_PURCHASED`    | You must purchase to review    |
| 400    | `ALREADY_REVIEWED` | You already reviewed this item |

---

#### PUT /api/reviews/:id

Update own review.

---

#### DELETE /api/reviews/:id

Delete own review.

---

#### POST /api/reviews/:id/helpful

Mark review as helpful.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "helpfulCount": 43
  }
}
```

---

### Admin Endpoints

#### PATCH /api/admin/reviews/:id

Moderate review.

**Request Body**:

```json
{
  "action": "approve",
  "status": "approved"
}
```

**Actions**: `approve`, `reject`, `flag`, `unflag`

---

## RBAC Permissions

| Endpoint                  | Guest | User | Seller | Admin |
| ------------------------- | ----- | ---- | ------ | ----- |
| GET /reviews              | ✅    | ✅   | ✅     | ✅    |
| POST /reviews             | ❌    | ✅   | ✅     | ✅    |
| PUT /reviews/:id          | ❌    | ✅\* | ✅\*   | ✅    |
| DELETE /reviews/:id       | ❌    | ✅\* | ✅\*   | ✅    |
| POST /reviews/:id/helpful | ❌    | ✅   | ✅     | ✅    |
| PATCH /admin/reviews/:id  | ❌    | ❌   | ❌     | ✅    |

\*Own review only

---

## Service Usage

```typescript
import { reviewsService } from "@/services";

const reviews = await reviewsService.list({ productId: "prod_001" });
await reviewsService.create({ productId: "prod_001", rating: 5, ... });
await reviewsService.update("review_001", { content: "Updated..." });
await reviewsService.delete("review_001");
await reviewsService.markHelpful("review_001");

// Admin
await reviewsService.moderate("review_001", { action: "approve" });
```

---

## Validation Rules

- **rating**: 1-5 stars, required
- **title**: 3-100 chars
- **content**: 10-2000 chars
- **images**: Max 5 images
- Must have purchased the product
- One review per product per user
