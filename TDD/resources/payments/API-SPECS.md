# Payments Resource - API Specifications

## Overview

Payment processing APIs with multi-gateway support (Phase 1: 6 gateways implemented).

**Phase 1 Implementation**: Complete payment gateway configuration and webhook handling for:

- Razorpay (India)
- PayU (India)
- Cashfree (India)
- Stripe (International)
- PayPal (International)
- PhonePe (India)

**Related**: [E039: Phase 1 Backend Infrastructure](/TDD/epics/E039-phase1-backend-infrastructure.md)

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

## Phase 1: Payment Gateway Configuration (Admin Only)

### POST /api/admin/settings/payment-gateways

Configure payment gateway credentials.

**Request Body**:

```json
{
  "gateway": "razorpay",
  "keyId": "rzp_live_...",
  "keySecret": "...",
  "enabled": true
}
```

**Supported Gateways**:

- `razorpay` - Razorpay (India)
- `payu` - PayU (India)
- `cashfree` - Cashfree (India)
- `stripe` - Stripe (International)
- `paypal` - PayPal (International)
- `phonepe` - PhonePe (India)

---

### GET /api/admin/settings/payment-gateways

List all configured payment gateways.

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "gateway": "razorpay",
      "enabled": true,
      "configured": true,
      "lastTested": "2024-12-06T10:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/settings/payment-gateways/:gateway/test

Test payment gateway connection.

**Response (200)**:

```json
{
  "success": true,
  "message": "Gateway connection successful",
  "details": {
    "gateway": "razorpay",
    "testTime": "2024-12-06T10:00:00Z"
  }
}
```

---

## Phase 1: Payment Webhooks (Firebase Functions)

### Webhook Handlers (Auto-deployed)

**Firebase Functions**:

- `functions/src/webhooks/payments/razorpayWebhook.ts`
- `functions/src/webhooks/payments/payuWebhook.ts`
- `functions/src/webhooks/payments/cashfreeWebhook.ts`
- `functions/src/webhooks/payments/stripeWebhook.ts`
- `functions/src/webhooks/payments/paypalWebhook.ts`
- `functions/src/webhooks/payments/phonepeWebhook.ts`

**Webhook URLs**:

```
https://us-central1-[project-id].cloudfunctions.net/handleRazorpayWebhook
https://us-central1-[project-id].cloudfunctions.net/handlePayuWebhook
https://us-central1-[project-id].cloudfunctions.net/handleCashfreeWebhook
https://us-central1-[project-id].cloudfunctions.net/handleStripeWebhook
https://us-central1-[project-id].cloudfunctions.net/handlePaypalWebhook
https://us-central1-[project-id].cloudfunctions.net/handlePhonepeWebhook
```

**Events Handled**:

- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `refund.processed` - Refund completed
- `refund.failed` - Refund failed

**Webhook Processing**:

1. Verify webhook signature (gateway-specific)
2. Extract event data
3. Update payment record in Firestore
4. Update order status if payment captured
5. Trigger notifications (email/WhatsApp)
6. Log event to `paymentWebhookEvents` collection

---

### GET /api/admin/webhooks/payments

View payment webhook logs (Admin only).

**Query Parameters**:

| Param   | Type   | Default | Description       |
| ------- | ------ | ------- | ----------------- |
| gateway | string | -       | Filter by gateway |
| status  | string | -       | success/failed    |
| from    | date   | -       | Start date        |
| to      | date   | -       | End date          |
| limit   | number | 50      | Results per page  |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "webhook_001",
      "gateway": "razorpay",
      "event": "payment.captured",
      "paymentId": "pay_test123456",
      "status": "success",
      "processedAt": "2024-12-06T10:05:00Z",
      "data": {
        "amount": 142900,
        "orderId": "order_001"
      }
    }
  ],
  "pagination": {
    "total": 1234,
    "page": 1,
    "limit": 50
  }
}
```

---

### POST /api/admin/webhooks/payments/:id/retry

Retry failed webhook processing (Admin only).

**Response (200)**:

```json
{
  "success": true,
  "message": "Webhook reprocessed successfully"
}
```

---

## Payment Methods

- `upi` - UPI payments (PhonePe, Google Pay, etc.)
- `card` - Debit/Credit cards
- `netbanking` - Net banking
- `wallet` - Digital wallets (Paytm, PhonePe, Amazon Pay, etc.)
- `cod` - Cash on delivery (manual confirmation)
- `emi` - EMI payments (via gateways)

## Payment Statuses

- `pending` - Payment initiated
- `authorized` - Payment authorized
- `captured` - Payment captured (successful)
- `failed` - Payment failed
- `refunded` - Fully refunded
- `partially_refunded` - Partially refunded

---

## RBAC Permissions

| Endpoint                                            | Guest | User | Seller | Admin |
| --------------------------------------------------- | ----- | ---- | ------ | ----- |
| GET /payments                                       | ❌    | ✅   | ✅     | ✅    |
| GET /payments/:id                                   | ❌    | ✅\* | ✅     | ✅    |
| POST /payments/verify                               | ❌    | ✅   | ✅     | ✅    |
| GET /admin/payments                                 | ❌    | ❌   | ❌     | ✅    |
| POST /admin/payments/:id/refund                     | ❌    | ❌   | ❌     | ✅    |
| **Phase 1: Gateway Configuration**                  |       |      |        |       |
| POST /admin/settings/payment-gateways               | ❌    | ❌   | ❌     | ✅    |
| GET /admin/settings/payment-gateways                | ❌    | ❌   | ❌     | ✅    |
| PUT /admin/settings/payment-gateways/:gateway       | ❌    | ❌   | ❌     | ✅    |
| POST /admin/settings/payment-gateways/:gateway/test | ❌    | ❌   | ❌     | ✅    |

## Service Usage

```typescript
import { paymentService } from "@/services";

// User - View own payments
const payments = await paymentService.list();
const payment = await paymentService.getById("payment_001");

// Admin - Manage all payments
const allPayments = await paymentService.listAdmin({ status: "captured" });
await paymentService.refund("payment_001", {
  amount: 50000,
  reason: "Customer request",
});
const stats = await paymentService.getStats({
  from: "2024-11-01",
  to: "2024-11-30",
});

// Admin - Configure gateways (Phase 1)
await paymentService.configureGateway({
  gateway: "razorpay",
  keyId: "rzp_live_...",
  keySecret: "...",
  enabled: true,
});

// Admin - Test gateway connection
const testResult = await paymentService.testGateway("razorpay");

// Admin - View webhook logs
const webhookLogs = await paymentService.getWebhookLogs({
  gateway: "razorpay",
  status: "success",
  from: "2024-12-01",
  to: "2024-12-06",
});

// Admin - Retry failed webhook
await paymentService.retryWebhook("webhook_001");
```

---

## Phase 1 Implementation Details

### Payment Gateway Configuration

**File**: `src/app/api/admin/settings/payment-gateways/route.ts`
**Lines**: 180 lines
**Features**:

- Multi-gateway support (6 gateways)
- Secure credential storage (encrypted)
- Gateway enable/disable toggle
- Connection testing
- Configuration validation

### Payment Webhooks

**Files**:

- `functions/src/webhooks/payments/razorpayWebhook.ts` (192 lines)
- `functions/src/webhooks/payments/payuWebhook.ts` (185 lines)
- `functions/src/webhooks/payments/cashfreeWebhook.ts` (178 lines)
- `functions/src/webhooks/payments/stripeWebhook.ts` (189 lines)
- `functions/src/webhooks/payments/paypalWebhook.ts` (167 lines)
- `functions/src/webhooks/payments/phonepeWebhook.ts` (155 lines)

**Total**: 1,066 lines across 6 Firebase Functions

**Features**:

- Signature verification (gateway-specific)
- Event processing (captured/failed/refund)
- Order status updates
- Notification triggering (email/WhatsApp)
- Audit logging to Firestore
- Error handling and retry logic

### Environment Variables

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# PayU
PAYU_MERCHANT_KEY=...
PAYU_MERCHANT_SALT=...

# Cashfree
CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# PhonePe
PHONEPE_MERCHANT_ID=...
PHONEPE_SALT_KEY=...
```

### Firestore Collections

**paymentGatewayConfigs**:

```typescript
{
  gateway: "razorpay",
  keyId: "rzp_live_...", // Encrypted
  keySecret: "...",      // Encrypted
  webhookSecret: "...",  // Encrypted
  enabled: true,
  configured: true,
  lastTested: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

**paymentWebhookEvents**:

```typescript
{
  gateway: "razorpay",
  event: "payment.captured",
  paymentId: "pay_test123456",
  orderId: "order_001",
  status: "success",
  data: { /* raw webhook payload */ },
  processedAt: Timestamp,
  createdAt: Timestamp,
}
```

---

## Testing

**Unit Tests**: `src/app/api/admin/settings/payment-gateways/route.test.ts`  
**Integration Tests**: `functions/src/webhooks/payments/__tests__/`  
**E2E Tests**: `tests/e2e/payments/`

**Test Coverage**:

- Gateway configuration (CRUD)
- Webhook signature verification
- Event processing
- Order status updates
- Notification triggering
- Error handling

---

## Related Documentation

- **[E039: Phase 1 Backend Infrastructure](/TDD/epics/E039-phase1-backend-infrastructure.md)** - Complete payment system
- **[RBAC Consolidated](/TDD/rbac/RBAC-CONSOLIDATED.md)** - Payment permissions
- **[API Implementation Roadmap](/TDD/resources/api-implementation-roadmap.md)** - Payment API tracking

---

_Last updated: December 6, 2025 - Phase 1 payment gateway system complete_

```st payments = await paymentService.list();
const payment = await paymentService.getById("payment_001");

// Admin
const allPayments = await paymentService.listAdmin({ status: "captured" });
await paymentService.refund("payment_001", { amount: 50000, reason: "..." });
const stats = await paymentService.getStats({
  from: "2024-11-01",
  to: "2024-11-30",
});
```
