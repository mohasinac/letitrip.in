# Payments Resource

> **Last Updated**: December 7, 2025  
> **Status**: ✅ Fully Implemented (Phase 1 & 2)  
> **Related Epic**: [E011: Payment System](../../epics/E011-payment-system.md)

---

## Overview

Multi-gateway payment system with international support, webhooks, and comprehensive analytics. Supports Razorpay, PayPal, PayU, PhonePe, Stripe, and Cashfree with multi-currency checkout.

## Database Collections

- `payments` - Payment transaction records
- `payment_refunds` - Refund records
- `payment_webhooks` - Webhook event logs

## Service Layer

**Location**: `src/services/payment.service.ts`, `src/services/payment-gateway.service.ts`

### Key Methods

```typescript
// Payment Operations
async createPayment(orderData: OrderData): Promise<PaymentFE>
async getPayment(paymentId: string): Promise<PaymentFE>
async listPayments(params?: PaymentListParams): Promise<PaymentFE[]>

// Gateway-Specific
async createRazorpayOrder(amount: number, currency: string): Promise<RazorpayOrder>
async verifyRazorpaySignature(data: RazorpayVerifyData): Promise<boolean>
async createPayPalOrder(amount: number, currency: string): Promise<PayPalOrder>
async capturePayPalPayment(orderId: string): Promise<PaymentFE>

// Refunds
async refundPayment(paymentId: string, amount: number): Promise<RefundFE>

// Gateway Management
async getAvailableGateways(country?: string): Promise<PaymentGateway[]>
async convertCurrency(amount: number, from: string, to: string): Promise<number>
```

## API Routes

### Public Routes

```
GET  /api/payments/available-gateways - Get enabled gateways
POST /api/payments/razorpay/order     - Create Razorpay order
POST /api/payments/razorpay/verify    - Verify signature
POST /api/payments/razorpay/capture   - Capture payment
POST /api/payments/razorpay/refund    - Razorpay refund
POST /api/payments/paypal/order       - Create PayPal order
POST /api/payments/paypal/capture     - Capture PayPal payment
POST /api/payments/paypal/refund      - PayPal refund
POST /api/checkout/create-order       - Create order + payment
POST /api/checkout/verify-payment     - Verify and complete
```

### User Routes

```
GET  /api/payments                    - List own payments
GET  /api/payments/:id                - Get payment details
```

### Admin Routes

```
GET  /api/admin/payments              - All payments
GET  /api/admin/settings/payment-gateways - Gateway config
PUT  /api/admin/settings/payment-gateways - Update config
POST /api/admin/settings/payment-gateways/test - Test gateway
POST /api/admin/settings/payment-gateways/toggle - Enable/disable
```

### Webhook Routes (Firebase Functions)

```
POST /webhooks/razorpay               - Razorpay events
POST /webhooks/paypal                 - PayPal events
POST /webhooks/payu                   - PayU events
POST /webhooks/phonepe                - PhonePe events
POST /webhooks/stripe                 - Stripe events
POST /webhooks/cashfree               - Cashfree events
```

## Payment Gateways

| Gateway  | Countries | Currencies          | Status |
| -------- | --------- | ------------------- | ------ |
| Razorpay | India     | INR                 | ✅     |
| PayPal   | Global    | USD, EUR, GBP, etc. | ✅     |
| PayU     | India     | INR                 | ✅     |
| PhonePe  | India     | INR                 | ✅     |
| Stripe   | Global    | 135+ currencies     | ✅     |
| Cashfree | India     | INR                 | ✅     |
| COD      | India     | INR                 | ✅     |

## Features Implemented

### Phase 1 (Backend)

- ✅ Multi-gateway integration (6 gateways)
- ✅ Webhook handlers for all gateways
- ✅ Payment event logging
- ✅ Automatic status updates
- ✅ Refund processing

### Phase 2 (Integration)

- ✅ Multi-currency checkout (INR/USD/EUR/GBP)
- ✅ Dynamic gateway selection by location
- ✅ Currency selector in checkout
- ✅ Real-time currency conversion
- ✅ Payment analytics dashboard
- ✅ Gateway breakdown charts
- ✅ Transaction fee tracking
- ✅ Admin payment settings
- ✅ Gateway testing interface

## Components

- `src/app/checkout/page.tsx` - Multi-currency checkout
- `src/app/checkout/success/page.tsx` - Payment success
- `src/app/admin/settings/payment-gateways/page.tsx` - Gateway config
- `src/app/admin/analytics/payments/page.tsx` - Payment analytics

## RBAC Permissions

| Action             | Admin | Seller | User | Guest |
| ------------------ | ----- | ------ | ---- | ----- |
| View Own Payments  | ✅    | ✅     | ✅   | ❌    |
| View All Payments  | ✅    | ❌     | ❌   | ❌    |
| Process Payment    | ✅    | ❌     | ✅   | ❌    |
| Request Refund     | ✅    | ❌     | ✅   | ❌    |
| Process Refund     | ✅    | ❌     | ❌   | ❌    |
| Configure Gateways | ✅    | ❌     | ❌   | ❌    |
| View Analytics     | ✅    | ✅     | ❌   | ❌    |

## Related Documentation

- [E011 Epic](../../epics/E011-payment-system.md) - User stories
- [RBAC](../../rbac/RBAC-CONSOLIDATED.md) - Permissions
- [Phase 2 Summary](../../PHASE-2-INTEGRATION-SUMMARY-DEC-7-2025.md) - Integration details
