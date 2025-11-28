# Returns Resource - API Specifications

## Overview

Return and refund management APIs.

---

## Endpoints

### User Endpoints

#### POST /api/returns

Create return request.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "orderId": "order_001",
  "orderItemId": "item_001",
  "reason": "defective",
  "description": "Product stopped working after 2 days",
  "images": ["https://..."]
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "return_001",
    "returnNumber": "RET-2024-001234",
    "status": "pending",
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Return request submitted"
}
```

**Error Responses**:

| Status | Code               | Message                         |
| ------ | ------------------ | ------------------------------- |
| 400    | `RETURN_EXPIRED`   | Return window has expired       |
| 400    | `ALREADY_RETURNED` | Item already has return request |
| 400    | `NOT_ELIGIBLE`     | Item not eligible for return    |

---

#### GET /api/returns/:id

Get return details.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "return_001",
    "returnNumber": "RET-2024-001234",
    "order": {
      "id": "order_001",
      "orderNumber": "ORD-2024-001234"
    },
    "item": {
      "id": "item_001",
      "product": { "name": "iPhone 15 Pro", "image": "..." },
      "quantity": 1,
      "price": 129900
    },
    "reason": "defective",
    "description": "Product stopped working...",
    "images": ["https://..."],
    "status": "approved",
    "refundAmount": 129900,
    "refundStatus": "processing",
    "timeline": [
      { "status": "submitted", "timestamp": "2024-11-25T10:00:00Z" },
      { "status": "approved", "timestamp": "2024-11-26T14:00:00Z" }
    ],
    "createdAt": "2024-11-25T10:00:00Z"
  }
}
```

---

### Seller Endpoints

#### GET /api/seller/returns

List returns for seller's shop.

**Query Parameters**:

| Param  | Type   | Default | Description               |
| ------ | ------ | ------- | ------------------------- |
| status | string | -       | pending/approved/rejected |

---

#### PATCH /api/seller/returns/:id

Update return (approve/reject).

**Request Body**:

```json
{
  "action": "approve",
  "refundAmount": 129900,
  "notes": "Approved for full refund"
}
```

---

### Admin Endpoints

#### POST /api/admin/returns/:id/approve

Force approve return.

---

#### POST /api/admin/returns/:id/reject

Force reject return.

---

## RBAC Permissions

| Endpoint                   | Guest | User | Seller | Admin |
| -------------------------- | ----- | ---- | ------ | ----- |
| POST /returns              | ❌    | ✅   | ✅     | ✅    |
| GET /returns/:id           | ❌    | ✅\* | ✅\*   | ✅    |
| GET /seller/returns        | ❌    | ❌   | ✅     | ✅    |
| PATCH /seller/returns/:id  | ❌    | ❌   | ✅\*   | ✅    |
| POST /admin/returns/:id/\* | ❌    | ❌   | ❌     | ✅    |

\*Own returns/shop only

---

## Return Reasons

- `defective` - Product is defective/damaged
- `wrong_item` - Received wrong item
- `not_as_described` - Item not as described
- `changed_mind` - Changed mind
- `other` - Other reason

---

## Service Usage

```typescript
import { returnsService } from "@/services";

// User
await returnsService.create({
  orderId: "order_001",
  orderItemId: "item_001",
  reason: "defective",
  description: "...",
});
const returnRequest = await returnsService.getById("return_001");

// Seller
const returns = await returnsService.listSeller({ status: "pending" });
await returnsService.approve("return_001", { refundAmount: 129900 });
await returnsService.reject("return_001", { reason: "Policy violation" });
```
