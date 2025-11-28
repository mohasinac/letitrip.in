# Epic E018: Payout System

## Overview

Seller payout management for transferring earnings from completed orders.

## Scope

- Payout requests
- Payout processing
- Payout history
- Pending balance tracking

## User Roles Involved

- **Admin**: Process payouts, view all
- **Seller**: Request payouts, view own
- **User**: No access
- **Guest**: No access

---

## Features

### F018.1: Payout Balance

**US018.1.1**: View Pending Balance

```
Available balance from:
- Completed orders
- Minus platform fees
- Minus pending returns
```

### F018.2: Payout Requests

**US018.2.1**: Request Payout (Seller)

```
Requirements:
- Minimum ₹500 balance
- Bank details verified
- No pending disputes
```

### F018.3: Payout Processing

**US018.3.1**: Process Payout (Admin)
**US018.3.2**: Bulk Process Payouts

### F018.4: Payout History

**US018.4.1**: View Payout History

```
Status:
- Pending
- Processing
- Completed
- Failed
```

---

## API Endpoints

| Endpoint               | Method | Auth   | Description         |
| ---------------------- | ------ | ------ | ------------------- |
| `/api/payouts`         | GET    | Seller | List payouts        |
| `/api/payouts`         | POST   | Seller | Request payout      |
| `/api/payouts/:id`     | GET    | Seller | Get payout          |
| `/api/payouts/:id`     | PATCH  | Admin  | Update payout       |
| `/api/payouts/bulk`    | POST   | Admin  | Bulk process        |
| `/api/payouts/pending` | GET    | Seller | Get pending balance |

---

## Data Models

```typescript
interface PayoutBE {
  id: string;
  shopId: string;
  sellerId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "pending" | "processing" | "completed" | "failed";
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  transactionId?: string;
  processedAt?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Related Epics

- E005: Order Management (order completion)
- E006: Shop Management (shop earnings)

---

## Test Documentation

- **API Specs**: `/TDD/resources/payouts/API-SPECS.md`
- **Test Cases**: `/TDD/resources/payouts/TEST-CASES.md`

### Test Coverage

- Unit tests for payout calculations
- Unit tests for fee deductions
- Integration tests for payout lifecycle
- E2E tests for payout request to completion
- RBAC tests for seller and admin operations
