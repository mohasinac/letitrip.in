# Carts Resource - API Specifications

## Overview

Shopping cart management APIs for guest and authenticated users.

---

## Endpoints

### GET /api/cart

Get current user's cart.

**Headers**: `Authorization: Bearer <token>` (optional for guest)

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "cart_001",
    "items": [
      {
        "id": "item_001",
        "product": {
          "id": "prod_001",
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "image": "https://...",
          "price": 129900,
          "comparePrice": 139900,
          "inStock": true,
          "quantity": 50
        },
        "variant": {
          "id": "var_001",
          "name": "256GB - Black"
        },
        "quantity": 1,
        "price": 129900,
        "subtotal": 129900,
        "addedAt": "2024-11-28T10:00:00Z"
      }
    ],
    "summary": {
      "itemCount": 1,
      "subtotal": 129900,
      "estimatedTax": 23382,
      "estimatedShipping": 0,
      "estimatedTotal": 153282
    },
    "updatedAt": "2024-11-28T10:00:00Z"
  }
}
```

---

### POST /api/cart

Add item to cart.

**Headers**: `Authorization: Bearer <token>` (optional)

**Request Body**:

```json
{
  "productId": "prod_001",
  "variantId": "var_001",
  "quantity": 1
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "itemId": "item_001",
    "cart": {
      /* full cart object */
    }
  },
  "message": "Item added to cart"
}
```

**Error Responses**:

| Status | Code              | Message                   |
| ------ | ----------------- | ------------------------- |
| 400    | `OUT_OF_STOCK`    | Product is out of stock   |
| 400    | `INVALID_PRODUCT` | Product not found         |
| 400    | `MAX_QUANTITY`    | Maximum quantity exceeded |

---

### PATCH /api/cart/:itemId

Update cart item quantity.

**Request Body**:

```json
{
  "quantity": 2
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "itemId": "item_001",
    "quantity": 2,
    "subtotal": 259800,
    "cart": {
      /* updated cart */
    }
  }
}
```

---

### DELETE /api/cart/:itemId

Remove item from cart.

**Response (200)**:

```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### DELETE /api/cart/clear

Clear entire cart.

**Response (200)**:

```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

### POST /api/cart/merge

Merge guest cart with user cart after login.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "guestCartId": "guest_cart_123"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "mergedItemCount": 3,
    "cart": {
      /* merged cart */
    }
  }
}
```

---

### POST /api/cart/validate

Validate cart before checkout.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": [],
    "priceChanges": []
  }
}
```

**Response with Issues**:

```json
{
  "success": true,
  "data": {
    "valid": false,
    "issues": [
      {
        "itemId": "item_002",
        "type": "out_of_stock",
        "message": "Product is no longer available"
      }
    ],
    "priceChanges": [
      {
        "itemId": "item_001",
        "oldPrice": 129900,
        "newPrice": 119900,
        "message": "Price has decreased"
      }
    ]
  }
}
```

---

## RBAC Permissions

| Endpoint            | Guest | User | Seller | Admin |
| ------------------- | ----- | ---- | ------ | ----- |
| GET /cart           | ✅    | ✅   | ✅     | ✅    |
| POST /cart          | ✅    | ✅   | ✅     | ✅    |
| PATCH /cart/:id     | ✅\*  | ✅\* | ✅\*   | ✅    |
| DELETE /cart/:id    | ✅\*  | ✅\* | ✅\*   | ✅    |
| DELETE /cart/clear  | ✅\*  | ✅\* | ✅\*   | ✅    |
| POST /cart/merge    | ❌    | ✅   | ✅     | ✅    |
| POST /cart/validate | ✅    | ✅   | ✅     | ✅    |

\*Own cart only

---

## Service Usage

```typescript
import { cartService } from "@/services";

const cart = await cartService.get();
await cartService.add({ productId: "prod_001", quantity: 1 });
await cartService.updateQuantity("item_001", 2);
await cartService.remove("item_001");
await cartService.clear();
await cartService.merge("guest_cart_id");
const validation = await cartService.validate();
```

---

## Validation Rules

- **productId**: Valid active product, required
- **quantity**: 1-10 per item, must not exceed stock
- Cart max items: 50
- Guest cart expires after 7 days
