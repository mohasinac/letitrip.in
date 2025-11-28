# Epic E011: Payment System

## Overview

Payment processing integration with Razorpay for orders and auction wins, including refund handling.

## Scope

- Payment processing (Razorpay)
- Payment methods (UPI, Card, Net Banking, Wallet)
- Payment verification
- Refund processing
- COD handling

## User Roles Involved

- **Admin**: Full payment management, refunds
- **Seller**: View payments for own shop
- **User**: Make payments, view own payment history
- **Guest**: No access

---

## Features

### F011.1: Payment Processing

**US011.1.1**: Process Online Payment

```
Payment Methods:
- UPI
- Debit/Credit Card
- Net Banking
- Wallet (Paytm, PhonePe, etc.)
```

### F011.2: Payment Verification

**US011.2.1**: Verify Payment (Webhook)

```
Razorpay webhook for payment confirmation
```

### F011.3: Refund Processing

**US011.3.1**: Initiate Refund
**US011.3.2**: Track Refund Status

### F011.4: COD Handling

**US011.4.1**: COD Order Processing
**US011.4.2**: COD Collection Confirmation

---

## API Endpoints

| Endpoint                       | Method | Auth   | Description           |
| ------------------------------ | ------ | ------ | --------------------- |
| `/api/payments`                | GET    | User   | List payments         |
| `/api/payments`                | POST   | User   | Create payment        |
| `/api/payments/:id`            | GET    | User   | Get payment           |
| `/api/payments/verify`         | POST   | System | Verify payment        |
| `/api/payments/:id/refund`     | POST   | Admin  | Refund payment        |
| `/api/checkout/create-order`   | POST   | User   | Create Razorpay order |
| `/api/checkout/verify-payment` | POST   | User   | Verify and complete   |

---

## Data Models

```typescript
interface PaymentBE {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: "card" | "upi" | "net-banking" | "wallet" | "cod";
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  gatewayId: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  refundId?: string;
  refundAmount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Related Epics

- E005: Order Management (order payments)
- E003: Auction System (auction payments)
- E009: Returns & Refunds (refund processing)
