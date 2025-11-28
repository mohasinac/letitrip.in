# Payments Resource - API Specifications

## Overview

Payment processing APIs with Razorpay integration.

---

## Endpoints

### User Endpoints

#### GET /api/payments

List user's payments.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "payment_001",
      "orderId": "order_001",
      "orderNumber": "ORD-2024-001234",
      "amount": 142900,
      "currency": "INR",
      "method": "upi",
      "status": "captured",
      "razorpayId": "pay_test123456",
      "createdAt": "2024-11-10T09:05:00Z"
    }
  ]
}
```

---

#### GET /api/payments/:id

Get payment details.

---

### Internal Endpoints

#### POST /api/payments

Create payment (internal, called during checkout).

---

#### POST /api/payments/verify

Verify Razorpay payment signature.

**Request Body**:

```json
{
  "razorpay_payment_id": "pay_test123456",
  "razorpay_order_id": "order_test123456",
  "razorpay_signature": "signature_string"
}
```

---

### Admin Endpoints

#### GET /api/admin/payments

List all payments.

**Query Parameters**:

| Param  | Type   | Default | Description                |
| ------ | ------ | ------- | -------------------------- |
| status | string | -       | captured/failed/refunded   |
| method | string | -       | upi/card/netbanking/wallet |
| from   | date   | -       | Start date                 |
| to     | date   | -       | End date                   |

---

#### POST /api/admin/payments/:id/refund

Process refund.

**Request Body**:

```json
{
  "amount": 50000,
  "reason": "Customer request"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "refundId": "rfnd_test123456",
    "amount": 50000,
    "status": "processed",
    "processedAt": "2024-11-29T10:00:00Z"
  }
}
```

---

## Payment Methods

- `upi` - UPI payments
- `card` - Debit/Credit cards
- `netbanking` - Net banking
- `wallet` - Digital wallets (Paytm, PhonePe, etc.)
- `cod` - Cash on delivery

## Payment Statuses

- `pending` - Payment initiated
- `authorized` - Payment authorized
- `captured` - Payment captured (successful)
- `failed` - Payment failed
- `refunded` - Fully refunded
- `partially_refunded` - Partially refunded

---

## RBAC Permissions

| Endpoint                        | Guest | User | Seller | Admin |
| ------------------------------- | ----- | ---- | ------ | ----- |
| GET /payments                   | ❌    | ✅   | ✅     | ✅    |
| GET /payments/:id               | ❌    | ✅\* | ✅     | ✅    |
| POST /payments/verify           | ❌    | ✅   | ✅     | ✅    |
| GET /admin/payments             | ❌    | ❌   | ❌     | ✅    |
| POST /admin/payments/:id/refund | ❌    | ❌   | ❌     | ✅    |

\*Own payments only

---

## Service Usage

```typescript
import { paymentService } from "@/services";

// User
const payments = await paymentService.list();
const payment = await paymentService.getById("payment_001");

// Admin
const allPayments = await paymentService.listAdmin({ status: "captured" });
await paymentService.refund("payment_001", { amount: 50000, reason: "..." });
const stats = await paymentService.getStats({
  from: "2024-11-01",
  to: "2024-11-30",
});
```
