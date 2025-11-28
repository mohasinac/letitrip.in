# Payouts Resource - API Specifications

## Overview

Seller payout management APIs.

---

## Endpoints

### Seller Endpoints

#### GET /api/seller/payouts

List seller's payouts.

**Headers**: `Authorization: Bearer <seller_token>`

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "payout_001",
      "amount": 50000,
      "status": "processed",
      "bankAccount": "xxxx1234",
      "transactionId": "TXN123456",
      "requestedAt": "2024-11-15T00:00:00Z",
      "processedAt": "2024-11-17T10:00:00Z"
    }
  ],
  "meta": {
    "availableBalance": 75000,
    "pendingPayout": 0,
    "totalEarnings": 250000
  }
}
```

---

#### POST /api/seller/payouts/request

Request payout.

**Request Body**:

```json
{
  "amount": 50000
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "payout_002",
    "amount": 50000,
    "status": "pending",
    "estimatedProcessing": "2-3 business days",
    "requestedAt": "2024-11-29T10:00:00Z"
  },
  "message": "Payout request submitted"
}
```

**Error Responses**:

| Status | Code                   | Message                        |
| ------ | ---------------------- | ------------------------------ |
| 400    | `INSUFFICIENT_BALANCE` | Insufficient available balance |
| 400    | `MIN_AMOUNT`           | Minimum payout is ₹500         |
| 400    | `PENDING_PAYOUT`       | You have a pending payout      |
| 400    | `BANK_NOT_VERIFIED`    | Please verify bank account     |

---

#### GET /api/seller/revenue

Get revenue details.

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "totalEarnings": 250000,
    "availableBalance": 75000,
    "pendingSettlement": 25000,
    "totalWithdrawn": 150000,
    "pendingPayout": 0,
    "breakdown": {
      "thisMonth": 45000,
      "lastMonth": 55000
    }
  }
}
```

---

### Admin Endpoints

#### GET /api/admin/payouts

List all payouts.

**Query Parameters**:

| Param  | Type   | Default | Description                         |
| ------ | ------ | ------- | ----------------------------------- |
| status | string | -       | pending/processing/processed/failed |
| shop   | string | -       | Filter by shop                      |

---

#### GET /api/admin/payouts/pending

List pending payouts for processing.

---

#### POST /api/admin/payouts/process

Process pending payouts.

**Request Body**:

```json
{
  "payoutIds": ["payout_001", "payout_002"]
}
```

---

#### PATCH /api/admin/payouts/:id

Update payout status.

**Request Body**:

```json
{
  "status": "processed",
  "transactionId": "TXN123456"
}
```

---

## Payout Statuses

- `pending` - Requested, awaiting processing
- `processing` - Being processed
- `processed` - Successfully transferred
- `failed` - Transfer failed

---

## RBAC Permissions

| Endpoint                     | Guest | User | Seller | Admin |
| ---------------------------- | ----- | ---- | ------ | ----- |
| GET /seller/payouts          | ❌    | ❌   | ✅     | ✅    |
| POST /seller/payouts/request | ❌    | ❌   | ✅     | ✅    |
| GET /seller/revenue          | ❌    | ❌   | ✅     | ✅    |
| GET /admin/payouts           | ❌    | ❌   | ❌     | ✅    |
| GET /admin/payouts/pending   | ❌    | ❌   | ❌     | ✅    |
| POST /admin/payouts/process  | ❌    | ❌   | ❌     | ✅    |

---

## Service Usage

```typescript
import { payoutsService } from "@/services";

// Seller
const payouts = await payoutsService.list();
const revenue = await payoutsService.getRevenue();
await payoutsService.request({ amount: 50000 });

// Admin
const pending = await payoutsService.getPending();
await payoutsService.process(["payout_001", "payout_002"]);
await payoutsService.updateStatus("payout_001", {
  status: "processed",
  transactionId: "TXN123456",
});
```

---

## Payout Rules

- Minimum payout: ₹500
- Maximum payout per request: ₹500,000
- Processing time: 2-3 business days
- Bank account must be verified
- Cannot request if pending payout exists
