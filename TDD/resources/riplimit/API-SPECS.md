# RipLimit API Specifications

## E028: RipLimit Bidding Currency

### Exchange Rate

- **1 INR = 20 RipLimit**
- Minimum Purchase: 200 RipLimit (₹10)
- Maximum Balance: 1,000,000 RipLimit (₹50,000)

---

## Endpoints

### Get Balance

```
GET /api/riplimit/balance
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "availableBalance": 15000,
    "blockedBalance": 11000,
    "totalBalance": 26000,
    "inrEquivalent": {
      "available": 750,
      "blocked": 550,
      "total": 1300
    },
    "hasUnpaidAuctions": false,
    "unpaidAuctionIds": []
  }
}
```

### Get Transactions

```
GET /api/riplimit/transactions?page=1&pageSize=20&type=purchase
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "txn_123",
      "type": "purchase",
      "amount": 10000,
      "inrAmount": 500,
      "status": "completed",
      "description": "RipLimit Purchase",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "txn_124",
      "type": "bid_block",
      "amount": 11000,
      "auctionId": "auc_456",
      "bidId": "bid_789",
      "status": "completed",
      "description": "Bid on Vintage Watch",
      "createdAt": "2025-01-15T11:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Initiate Purchase

```
POST /api/riplimit/purchase
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "amount": 10000,      // RipLimit amount
  "paymentMethod": "upi"
}

Response:
{
  "success": true,
  "data": {
    "purchaseId": "pur_123",
    "ripLimitAmount": 10000,
    "inrAmount": 500,
    "razorpayOrderId": "order_xyz",
    "status": "pending"
  }
}
```

### Verify Purchase

```
POST /api/riplimit/purchase/verify
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "purchaseId": "pur_123",
  "razorpayPaymentId": "pay_xyz",
  "razorpaySignature": "sig_abc"
}

Response:
{
  "success": true,
  "data": {
    "purchaseId": "pur_123",
    "status": "completed",
    "newBalance": 25000
  }
}
```

### Request Refund

```
POST /api/riplimit/refund
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "amount": 5000,       // RipLimit amount to refund
  "reason": "optional"
}

Response (Success):
{
  "success": true,
  "data": {
    "refundId": "ref_123",
    "ripLimitAmount": 5000,
    "inrAmount": 250,
    "processingFee": 0,
    "netAmount": 250,
    "status": "pending",
    "estimatedCompletion": "5-7 business days"
  }
}

Response (Error - Unpaid Auction):
{
  "success": false,
  "error": "Cannot refund while you have unpaid auctions",
  "code": "UNPAID_AUCTION",
  "unpaidAuctionIds": ["auc_456"]
}
```

---

## Admin Endpoints

### Get Stats

```
GET /api/admin/riplimit/stats
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "totalInCirculation": 5000000,
    "totalPurchased": 7500000,
    "totalBlocked": 1200000,
    "totalRefunded": 500000,
    "totalUsedInPayments": 1800000,
    "revenue": {
      "total": 375000,
      "thisMonth": 50000
    }
  }
}
```

### Get User RipLimit

```
GET /api/admin/riplimit/users/:userId
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "account": {
      "availableBalance": 15000,
      "blockedBalance": 11000,
      "hasUnpaidAuctions": false
    },
    "transactions": [ ... ],
    "blockedDetails": [
      {
        "auctionId": "auc_456",
        "auctionTitle": "Vintage Watch",
        "amount": 11000,
        "bidId": "bid_789"
      }
    ]
  }
}
```

### Adjust Balance

```
POST /api/admin/riplimit/users/:userId/adjust
Authorization: Bearer {admin_token}
Content-Type: application/json

Request:
{
  "amount": 1000,           // Positive to add, negative to deduct
  "type": "promotional",    // promotional | adjustment | penalty
  "reason": "Welcome bonus"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "txn_admin_123",
    "newBalance": 16000
  }
}
```

### Clear Unpaid Flag

```
POST /api/admin/riplimit/users/:userId/clear-unpaid
Authorization: Bearer {admin_token}
Content-Type: application/json

Request:
{
  "auctionId": "auc_456",
  "reason": "Manual resolution"
}

Response:
{
  "success": true,
  "data": {
    "hasUnpaidAuctions": false,
    "releasedAmount": 11000
  }
}
```

---

## Data Models

### RipLimitAccount

```typescript
interface RipLimitAccount {
  userId: string;
  availableBalance: number;
  blockedBalance: number;
  hasUnpaidAuctions: boolean;
  unpaidAuctionIds: string[];
  strikeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### RipLimitTransaction

```typescript
interface RipLimitTransaction {
  id: string;
  userId: string;
  type:
    | "purchase"
    | "bid_block"
    | "bid_release"
    | "auction_payment"
    | "refund"
    | "promotional"
    | "adjustment"
    | "penalty";
  amount: number;
  inrAmount?: number;
  auctionId?: string;
  bidId?: string;
  paymentId?: string;
  orderId?: string;
  adminId?: string;
  reason?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  description: string;
  createdAt: Timestamp;
}
```

### RipLimitPurchase

```typescript
interface RipLimitPurchase {
  id: string;
  userId: string;
  ripLimitAmount: number;
  inrAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

### RipLimitRefund

```typescript
interface RipLimitRefund {
  id: string;
  userId: string;
  ripLimitAmount: number;
  inrAmount: number;
  processingFee: number;
  netAmount: number;
  refundMethod: string;
  status: "pending" | "processing" | "completed" | "rejected";
  reason?: string;
  rejectionReason?: string;
  createdAt: Timestamp;
  processedAt?: Timestamp;
}
```
