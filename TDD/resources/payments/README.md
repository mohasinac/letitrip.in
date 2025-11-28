# Payments Resource

## Overview

Payment processing with Razorpay.

## Related Epic

- [E011: Payment System](../../epics/E011-payment-system.md)

## Database Collection

- `payments` - Payment documents
- `payment_transactions` - Transaction log

## API Routes

```
/api/payments              - GET/POST  - List/Create
/api/payments/:id          - GET       - Get payment
/api/payments/:id/refund   - POST      - Refund
/api/payments/verify       - POST      - Verify payment
/api/checkout/create-order - POST      - Create Razorpay order
/api/checkout/verify-payment - POST    - Verify and complete
```

## Components

- `src/components/checkout/` - Checkout components
- `src/app/checkout/` - Checkout page
- `src/app/admin/payments/` - Admin payment management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
