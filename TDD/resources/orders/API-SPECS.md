# Orders Resource - API Specifications

## Overview

Order management APIs for checkout, order lifecycle, tracking, and admin/seller operations.

---

## Endpoints

### User Endpoints

#### GET /api/user/orders

Get current user's orders.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

| Param  | Type   | Default   | Description                                    |
| ------ | ------ | --------- | ---------------------------------------------- |
| page   | number | 1         | Page number                                    |
| limit  | number | 10        | Items per page                                 |
| status | string | -         | pending/processing/shipped/delivered/cancelled |
| sortBy | string | createdAt | createdAt, total                               |
| order  | string | desc      | asc/desc                                       |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "order_001",
      "orderNumber": "ORD-2024-001234",
      "status": "delivered",
      "paymentStatus": "paid",
      "items": [
        {
          "id": "item_001",
          "product": {
            "id": "prod_001",
            "name": "iPhone 15 Pro",
            "image": "https://..."
          },
          "quantity": 1,
          "price": 129900
        }
      ],
      "subtotal": 129900,
      "discount": 5000,
      "shipping": 0,
      "tax": 22482,
      "total": 147382,
      "shop": {
        "id": "shop_001",
        "name": "Tech Store"
      },
      "shippingAddress": {
        "name": "John Doe",
        "addressLine1": "123 Main St",
        "city": "Mumbai"
      },
      "tracking": {
        "number": "DTDC123456789",
        "carrier": "DTDC",
        "url": "https://..."
      },
      "createdAt": "2024-11-10T09:00:00Z",
      "deliveredAt": "2024-11-20T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15
  }
}
```

---

#### GET /api/user/orders/:id

Get order details.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "orderNumber": "ORD-2024-001234",
    "status": "delivered",
    "paymentStatus": "paid",
    "paymentMethod": "razorpay",
    "items": [
      {
        "id": "item_001",
        "product": {
          "id": "prod_001",
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "image": "https://...",
          "sku": "IPH15PRO-256"
        },
        "variant": {
          "id": "var_001",
          "name": "256GB - Black"
        },
        "quantity": 1,
        "price": 129900,
        "subtotal": 129900
      }
    ],
    "pricing": {
      "subtotal": 129900,
      "discount": 5000,
      "couponCode": "SAVE5000",
      "shipping": 0,
      "tax": 22482,
      "total": 147382
    },
    "shop": {
      "id": "shop_001",
      "name": "Tech Store",
      "slug": "tech-store"
    },
    "shippingAddress": {
      "id": "addr_001",
      "name": "John Doe",
      "phone": "+919876543210",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "billingAddress": {
      "sameAsShipping": true
    },
    "tracking": {
      "number": "DTDC123456789",
      "carrier": "DTDC",
      "url": "https://tracking.dtdc.com/DTDC123456789",
      "status": "delivered",
      "events": [
        {
          "status": "delivered",
          "location": "Mumbai",
          "timestamp": "2024-11-20T14:30:00Z",
          "description": "Delivered to customer"
        },
        {
          "status": "out_for_delivery",
          "location": "Mumbai Hub",
          "timestamp": "2024-11-20T08:00:00Z",
          "description": "Out for delivery"
        }
      ]
    },
    "timeline": [
      {
        "status": "placed",
        "timestamp": "2024-11-10T09:00:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2024-11-10T09:05:00Z"
      },
      {
        "status": "processing",
        "timestamp": "2024-11-11T10:00:00Z"
      },
      {
        "status": "shipped",
        "timestamp": "2024-11-15T14:00:00Z"
      },
      {
        "status": "delivered",
        "timestamp": "2024-11-20T14:30:00Z"
      }
    ],
    "payment": {
      "method": "upi",
      "provider": "razorpay",
      "transactionId": "pay_test123456",
      "paidAt": "2024-11-10T09:05:00Z"
    },
    "notes": "Please leave at door if not home",
    "canCancel": false,
    "canReturn": true,
    "returnDeadline": "2024-12-05T14:30:00Z",
    "createdAt": "2024-11-10T09:00:00Z",
    "updatedAt": "2024-11-20T14:30:00Z"
  }
}
```

---

#### POST /api/orders/:id/cancel

Cancel an order (user initiated).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "reason": "Changed my mind",
  "comment": "Found a better deal elsewhere"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "status": "cancelled",
    "cancelReason": "Changed my mind",
    "refundStatus": "processing",
    "refundAmount": 147382,
    "cancelledAt": "2024-11-11T10:00:00Z"
  },
  "message": "Order cancelled successfully. Refund will be processed within 5-7 business days."
}
```

**Error Responses**:

| Status | Code                | Message                        |
| ------ | ------------------- | ------------------------------ |
| 400    | `CANNOT_CANCEL`     | Order cannot be cancelled      |
| 400    | `ALREADY_SHIPPED`   | Order has already been shipped |
| 400    | `ALREADY_CANCELLED` | Order is already cancelled     |

---

#### GET /api/orders/:id/invoice

Get order invoice PDF.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "invoiceUrl": "https://storage.jfv.in/invoices/INV-2024-001234.pdf",
    "invoiceNumber": "INV-2024-001234",
    "generatedAt": "2024-11-10T09:05:00Z"
  }
}
```

---

### Checkout Endpoints

#### POST /api/checkout/create-order

Create order from cart.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "shippingAddressId": "addr_001",
  "billingAddressId": "addr_001",
  "paymentMethod": "razorpay",
  "couponCode": "SAVE5000",
  "notes": "Please leave at door if not home"
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "orderId": "order_new_001",
    "orderNumber": "ORD-2024-001235",
    "total": 147382,
    "paymentRequired": true,
    "razorpayOrderId": "order_test123456",
    "razorpayKey": "rzp_test_xxxxx",
    "currency": "INR"
  },
  "message": "Order created. Please complete payment."
}
```

**Error Responses**:

| Status | Code                | Message                       |
| ------ | ------------------- | ----------------------------- |
| 400    | `CART_EMPTY`        | Cart is empty                 |
| 400    | `INVALID_ADDRESS`   | Invalid shipping address      |
| 400    | `ITEM_OUT_OF_STOCK` | Some items are out of stock   |
| 400    | `INVALID_COUPON`    | Coupon is invalid or expired  |
| 400    | `PRICE_CHANGED`     | Some item prices have changed |

---

#### POST /api/checkout/verify-payment

Verify payment after Razorpay callback.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "orderId": "order_new_001",
  "razorpay_payment_id": "pay_test123456",
  "razorpay_order_id": "order_test123456",
  "razorpay_signature": "signature_string"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "orderId": "order_new_001",
    "orderNumber": "ORD-2024-001235",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paidAt": "2024-11-29T10:05:00Z"
  },
  "message": "Payment verified successfully"
}
```

---

### Seller Endpoints

#### GET /api/seller/orders

List seller's orders.

**Headers**: `Authorization: Bearer <seller_token>`

**Query Parameters**:

| Param  | Type   | Default | Description                          |
| ------ | ------ | ------- | ------------------------------------ |
| page   | number | 1       | Page number                          |
| limit  | number | 20      | Items per page                       |
| status | string | -       | pending/processing/shipped/delivered |
| from   | date   | -       | Start date                           |
| to     | date   | -       | End date                             |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "order_001",
      "orderNumber": "ORD-2024-001234",
      "status": "pending",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": 2,
      "total": 147382,
      "paymentStatus": "paid",
      "createdAt": "2024-11-29T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "total": 150,
    "stats": {
      "pending": 12,
      "processing": 25,
      "shipped": 45,
      "delivered": 68
    }
  }
}
```

---

#### GET /api/seller/orders/:id

Get order details (seller view).

**Headers**: `Authorization: Bearer <seller_token>`

_Similar to user view but includes additional seller-specific fields_

---

#### PATCH /api/seller/orders/:id

Update order status.

**Headers**: `Authorization: Bearer <seller_token>`

**Request Body**:

```json
{
  "status": "shipped",
  "trackingNumber": "DTDC123456789",
  "trackingCarrier": "DTDC",
  "trackingUrl": "https://tracking.dtdc.com/DTDC123456789"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "status": "shipped",
    "tracking": {
      "number": "DTDC123456789",
      "carrier": "DTDC",
      "url": "https://..."
    },
    "updatedAt": "2024-11-29T11:00:00Z"
  },
  "message": "Order updated. Customer has been notified."
}
```

---

#### POST /api/seller/orders/bulk

Bulk order operations.

**Headers**: `Authorization: Bearer <seller_token>`

**Request Body**:

```json
{
  "action": "mark_shipped",
  "orderIds": ["order_001", "order_002"],
  "trackingCarrier": "DTDC"
}
```

**Supported Actions**: `mark_processing`, `mark_shipped`, `mark_delivered`, `print_labels`, `export`

---

### Admin Endpoints

#### GET /api/admin/orders

List all orders.

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:

| Param   | Type   | Default | Description         |
| ------- | ------ | ------- | ------------------- |
| shop    | string | -       | Filter by shop      |
| seller  | string | -       | Filter by seller    |
| payment | string | -       | paid/pending/failed |

---

#### PATCH /api/admin/orders/:id

Admin order update (refund, override status, etc.).

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:

```json
{
  "action": "force_refund",
  "refundAmount": 50000,
  "reason": "Customer complaint resolved"
}
```

**Supported Actions**: `force_refund`, `override_status`, `add_note`, `assign_support`

---

## Order Lifecycle

```
CART → [checkout/create-order] → PENDING
                                    ↓
                        [checkout/verify-payment]
                                    ↓
                               CONFIRMED
                                    ↓
                        [seller updates status]
                                    ↓
                              PROCESSING
                                    ↓
                        [seller adds tracking]
                                    ↓
                               SHIPPED
                                    ↓
                     [tracking/delivery confirmed]
                                    ↓
                              DELIVERED
```

### Cancellation Flow

```
PENDING/CONFIRMED/PROCESSING → [cancel request]
                                     ↓
                               CANCELLED
                                     ↓
                          [automatic refund trigger]
                                     ↓
                            REFUND_PROCESSING
                                     ↓
                               REFUNDED
```

---

## RBAC Permissions

| Endpoint                      | Guest | User | Seller | Admin |
| ----------------------------- | ----- | ---- | ------ | ----- |
| GET /user/orders              | ❌    | ✅   | ✅     | ✅    |
| GET /user/orders/:id          | ❌    | ✅\* | ✅     | ✅    |
| POST /orders/:id/cancel       | ❌    | ✅\* | ✅     | ✅    |
| GET /orders/:id/invoice       | ❌    | ✅\* | ✅\*   | ✅    |
| POST /checkout/create-order   | ❌    | ✅   | ✅     | ✅    |
| POST /checkout/verify-payment | ❌    | ✅   | ✅     | ✅    |
| GET /seller/orders            | ❌    | ❌   | ✅     | ✅    |
| GET /seller/orders/:id        | ❌    | ❌   | ✅\*   | ✅    |
| PATCH /seller/orders/:id      | ❌    | ❌   | ✅\*   | ✅    |
| POST /seller/orders/bulk      | ❌    | ❌   | ✅\*   | ✅    |
| GET /admin/orders             | ❌    | ❌   | ❌     | ✅    |
| PATCH /admin/orders/:id       | ❌    | ❌   | ❌     | ✅    |

\*Owner only

---

## Service Usage

```typescript
import { ordersService, checkoutService } from "@/services";

// User operations
const orders = await ordersService.getUserOrders({
  page: 1,
  status: "delivered",
});
const order = await ordersService.getById("order_001");
await ordersService.cancel("order_001", { reason: "Changed mind" });
const invoice = await ordersService.getInvoice("order_001");

// Checkout
const checkoutResult = await checkoutService.createOrder({
  shippingAddressId: "addr_001",
  paymentMethod: "razorpay",
  couponCode: "SAVE10",
});

await checkoutService.verifyPayment({
  orderId: checkoutResult.orderId,
  razorpay_payment_id: "...",
  razorpay_order_id: "...",
  razorpay_signature: "...",
});

// Seller operations
const sellerOrders = await ordersService.getSellerOrders({ status: "pending" });
await ordersService.updateStatus("order_001", {
  status: "shipped",
  trackingNumber: "DTDC123456789",
});
await ordersService.bulkSeller({
  action: "mark_shipped",
  orderIds: ["order_001", "order_002"],
});

// Admin operations
const allOrders = await ordersService.getAdminOrders({ shop: "shop_001" });
await ordersService.adminAction("order_001", {
  action: "force_refund",
  amount: 50000,
});
```

---

## Validation Rules

### Order Creation

- **shippingAddressId**: Valid address ID owned by user
- **paymentMethod**: razorpay/cod/wallet
- **couponCode**: Valid and not expired
- Cart must not be empty
- All items must be in stock
- Price validation against current prices

### Order Cancellation

- Can cancel: pending, confirmed, processing (before shipping)
- Cannot cancel: shipped, delivered, already cancelled
- Refund auto-triggered for prepaid orders

### Status Update (Seller)

- Valid transitions only:
  - pending → processing
  - processing → shipped (requires tracking)
  - shipped → delivered
- Cannot skip statuses

---

## Related Files

- `/src/services/orders.service.ts`
- `/src/services/checkout.service.ts`
- `/src/app/api/orders/`
- `/src/app/api/checkout/`
- `/src/app/api/seller/orders/`
- `/src/app/api/admin/orders/`
- `/src/types/backend/order.types.ts`
