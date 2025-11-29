# Epic E028: RipLimit Bidding Currency

## Overview

Implement RipLimit, a virtual bidding currency that users purchase with real money (₹1 = 20 RipLimit). RipLimit is used exclusively for auction bidding, providing a secure bidding system where:

- Users must have sufficient RipLimit to place bids
- RipLimit is blocked when a bid is placed
- Blocked RipLimit is released if outbid or auction cancelled
- RipLimit is converted to actual payment upon winning
- Users with unpaid auctions cannot bid or withdraw RipLimit
- Fully refundable if not used

## Core Concepts

### RipLimit Economics

- **Exchange Rate**: 20 RipLimit = ₹1
- **Minimum Purchase**: 200 RipLimit (₹10)
- **Maximum Balance**: No limit - users can purchase as much as they want
- **Bid Requirement**: Bid amount in INR × 20 = Required RipLimit
- **Multi-Auction Bidding**: Users can bid on multiple auctions simultaneously as long as their available RipLimit covers all active bids

### Example Scenarios

```
Scenario 1: Placing a Bid
- Auction current bid: ₹500
- User wants to bid: ₹550
- Required RipLimit: 550 × 20 = 11,000 RipLimit
- User has 15,000 RipLimit available
- After bid: 4,000 available, 11,000 blocked

Scenario 2: Getting Outbid
- User's blocked RipLimit: 11,000
- Someone bids ₹600
- User's 11,000 RipLimit is released
- User now has 15,000 available again

Scenario 3: Winning Auction
- User wins at ₹550
- 11,000 RipLimit remains blocked
- User has 24 hours to pay
- Payment uses blocked RipLimit as credit
- User pays ₹0 (RipLimit covers it) OR
- Partial: bid ₹1000, has 11,000 RipLimit
  - RipLimit covers ₹550
  - User pays remaining ₹450

Scenario 4: Multi-Auction Bidding
- User has 50,000 RipLimit available
- Bids ₹500 on Auction A → Blocks 10,000 RipLimit (40,000 available)
- Bids ₹800 on Auction B → Blocks 16,000 RipLimit (24,000 available)
- Bids ₹1,000 on Auction C → Blocks 20,000 RipLimit (4,000 available)
- Gets outbid on Auction B → Releases 16,000 RipLimit (20,000 available)
- Can now bid on more auctions with 20,000 available RipLimit
- Can purchase more RipLimit anytime to increase bidding capacity
```

---

## Features

### F028.1: RipLimit Account

**Priority**: P0 (Critical)

Each user has a RipLimit account with balances.

```typescript
interface RipLimitAccount {
  userId: string;
  availableBalance: number; // Can be used for bidding
  blockedBalance: number; // Locked in active bids
  totalBalance: number; // available + blocked
  hasUnpaidAuctions: boolean; // If true, cannot bid/withdraw
  unpaidAuctionIds: string[]; // List of unpaid won auctions
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface RipLimitTransaction {
  id: string;
  userId: string;
  type:
    | "purchase"
    | "bid_block"
    | "bid_release"
    | "auction_payment"
    | "refund"
    | "withdrawal";
  amount: number; // RipLimit amount
  inrAmount?: number; // INR equivalent
  auctionId?: string; // Related auction
  bidId?: string; // Related bid
  paymentId?: string; // Related payment
  status: "pending" | "completed" | "failed" | "cancelled";
  description: string;
  createdAt: Timestamp;
}
```

#### User Stories

**US028.1.1**: View RipLimit Balance

```
As a user
I want to see my RipLimit balance
So that I know how much I can bid

Acceptance Criteria:
- Balance shown in header/auction pages
- Shows available and blocked separately
- Shows INR equivalent
- Updates in real-time when bidding
- Warning if balance is low
```

**US028.1.2**: View Transaction History

```
As a user
I want to see my RipLimit transactions
So that I can track my purchases and bids

Acceptance Criteria:
- Shows all transactions with type, amount, date
- Filterable by type (purchase, bid, refund)
- Shows related auction/order details
- Export to CSV available
```

---

### F028.2: Purchase RipLimit

**Priority**: P0 (Critical)

Users can purchase RipLimit using standard payment methods.

```typescript
interface RipLimitPurchase {
  id: string;
  userId: string;
  ripLimitAmount: number;
  inrAmount: number;
  paymentId: string;
  paymentMethod: "upi" | "card" | "netbanking" | "wallet";
  status: "pending" | "completed" | "failed";
  createdAt: Timestamp;
}
```

#### User Stories

**US028.2.1**: Purchase RipLimit Page

```
As a user
I want to purchase RipLimit
So that I can participate in auctions

Acceptance Criteria:
- Shows current balance
- Preset amounts: ₹100, ₹500, ₹1000, ₹5000
- Custom amount input
- Shows RipLimit to receive (amount × 20)
- Payment via existing payment flow (Razorpay)
- Immediate balance update on success
- Receipt/confirmation email
```

**US028.2.2**: Quick Purchase During Bidding

```
As a user bidding on an auction
I want to quickly add RipLimit if insufficient
So that I don't miss the auction

Acceptance Criteria:
- "Add RipLimit" button in bid modal
- Shows required amount
- Quick purchase options
- Returns to bid flow after purchase
- Bid proceeds with new balance
```

---

### F028.3: Bid Integration

**Priority**: P0 (Critical)

Integrate RipLimit with the auction bidding system.

#### User Stories

**US028.3.1**: Check RipLimit Before Bid

```
As a user placing a bid
I want the system to check my RipLimit
So that I only bid if I can afford it

Acceptance Criteria:
- Bid modal shows available RipLimit
- Shows required RipLimit for bid
- Shows shortfall if insufficient
- Prevents bid if insufficient
- Link to purchase more RipLimit
```

**US028.3.2**: Block RipLimit on Bid

```
As a user who placed a bid
I want my RipLimit blocked
So that I can't spend it elsewhere

Acceptance Criteria:
- RipLimit blocked immediately on bid
- Available balance decreases
- Blocked balance increases
- Transaction record created
- Cannot bid more than available
```

**US028.3.3**: Release RipLimit on Outbid

```
As a user who was outbid
I want my RipLimit released
So that I can bid on other auctions

Acceptance Criteria:
- RipLimit released immediately when outbid
- Available balance increases
- Notification sent to user
- Transaction record created
- Can immediately rebid or bid elsewhere
```

**US028.3.4**: Unpaid Auction Restriction

```
As a platform
I want to restrict users with unpaid auctions
So that we reduce non-payment issues

Acceptance Criteria:
- User with unpaid auction cannot place new bids
- User cannot request RipLimit refund
- Warning shown on auction pages
- Link to pay pending auction
- Restriction lifts after payment
- After 48 hours, auction cancelled and user flagged
```

---

### F028.4: Auction Win Payment

**Priority**: P0 (Critical)

When user wins an auction, RipLimit is used for payment.

#### User Stories

**US028.4.1**: Win Checkout with RipLimit

```
As an auction winner
I want to use my blocked RipLimit as payment
So that I can complete the purchase

Acceptance Criteria:
- Checkout shows blocked RipLimit amount
- RipLimit covers bid amount (or partial)
- User pays difference if RipLimit insufficient
- RipLimit deducted on successful payment
- Full RipLimit used if covers entire amount
- Clear breakdown of RipLimit vs card payment
```

**US028.4.2**: Auction Payment Timeout

```
As a platform
I want to handle non-payment scenarios
So that sellers aren't stuck waiting

Acceptance Criteria:
- 24 hour payment window
- Reminders at 12h, 6h, 1h remaining
- After 24h, auction marked unpaid
- User flagged with unpaid auction
- User cannot bid until resolved
- After 48h, auction cancelled
- User receives strike (3 strikes = ban)
- Seller can relist auction
```

---

### F028.5: RipLimit Refund

**Priority**: P1 (High)

Users can request refund of unused RipLimit.

#### User Stories

**US028.5.1**: Request Refund

```
As a user with unused RipLimit
I want to request a refund
So that I can get my money back

Acceptance Criteria:
- Only available balance can be refunded
- Minimum refund: 1000 RipLimit (₹50)
- Cannot refund if unpaid auctions exist
- Refund to original payment method
- Processing time: 5-7 business days
- Transaction fee: None (first refund/month)
- ₹10 fee for additional refunds
```

---

### F028.6: Admin RipLimit Management

**Priority**: P1 (High)

Admin tools for managing RipLimit.

#### User Stories

**US028.6.1**: View RipLimit Dashboard

```
As an admin
I want to see RipLimit statistics
So that I can monitor the system

Acceptance Criteria:
- Total RipLimit in circulation
- Total RipLimit purchased (revenue)
- Total RipLimit blocked in bids
- Total RipLimit refunded
- Top users by balance
- Recent transactions
```

**US028.6.2**: Manage User RipLimit

```
As an admin
I want to manage user RipLimit
So that I can handle support issues

Acceptance Criteria:
- View user's RipLimit history
- Add promotional RipLimit (bonus)
- Adjust balance (with reason)
- Force release blocked RipLimit
- Clear unpaid auction flag
- Ban/restrict user's RipLimit access
```

---

## API Endpoints

### RipLimit Account

```
GET    /api/riplimit/balance           # Get user's balance
GET    /api/riplimit/transactions      # Get transaction history
POST   /api/riplimit/purchase          # Initiate purchase
POST   /api/riplimit/purchase/verify   # Verify purchase payment
POST   /api/riplimit/refund            # Request refund
```

### Bid Integration (modified)

```
POST   /api/auctions/:id/bid           # Modified to check RipLimit
# Request now includes:
# - bidAmount (INR)
# - ripLimitAmount (calculated by backend)
```

### Admin

```
GET    /api/admin/riplimit/stats       # Dashboard stats
GET    /api/admin/riplimit/users       # Users with balances
GET    /api/admin/riplimit/users/:id   # Specific user's history
POST   /api/admin/riplimit/users/:id/adjust  # Adjust balance
POST   /api/admin/riplimit/users/:id/clear-unpaid  # Clear flag
```

---

## Database Schema

### Firestore Collections

```
riplimit_accounts/{userId}
  - availableBalance: number
  - blockedBalance: number
  - hasUnpaidAuctions: boolean
  - unpaidAuctionIds: string[]
  - createdAt: timestamp
  - updatedAt: timestamp

riplimit_transactions/{transactionId}
  - userId: string
  - type: string
  - amount: number
  - inrAmount: number
  - auctionId: string | null
  - bidId: string | null
  - paymentId: string | null
  - status: string
  - description: string
  - createdAt: timestamp

riplimit_purchases/{purchaseId}
  - userId: string
  - ripLimitAmount: number
  - inrAmount: number
  - paymentId: string
  - paymentMethod: string
  - status: string
  - createdAt: timestamp

riplimit_refunds/{refundId}
  - userId: string
  - ripLimitAmount: number
  - inrAmount: number
  - status: string
  - processedAt: timestamp | null
  - createdAt: timestamp
```

---

## UI Components

### New Components

| Component                 | Location                 | Description                     |
| ------------------------- | ------------------------ | ------------------------------- |
| `RipLimitBalance`         | Header, Auction pages    | Shows available/blocked balance |
| `RipLimitPurchaseModal`   | Purchase page, Bid modal | Purchase flow                   |
| `RipLimitTransactionList` | User dashboard           | Transaction history             |
| `RipLimitRequiredBadge`   | Auction cards, Bid modal | Shows required RipLimit         |
| `InsufficientRipLimit`    | Bid modal                | Warning with purchase option    |
| `UnpaidAuctionWarning`    | Auction pages            | Warning for unpaid auctions     |
| `RipLimitRefundForm`      | User settings            | Refund request form             |
| `AdminRipLimitDashboard`  | Admin panel              | Stats and management            |

### Page Updates

| Page                  | Changes                                      |
| --------------------- | -------------------------------------------- |
| `/auctions/[slug]`    | Show RipLimit balance, required amount       |
| `/user/riplimit`      | NEW: Purchase, balance, transactions, refund |
| `/user/bids`          | Show RipLimit blocked per bid                |
| `/checkout` (auction) | Show RipLimit payment option                 |
| `/admin/riplimit`     | NEW: Dashboard and management                |

---

## Implementation Checklist

### Phase 1: Core Infrastructure (Week 1)

- [ ] Create RipLimit types and interfaces
- [ ] Create Firestore schema
- [ ] Create RipLimit service
- [ ] Create API endpoints (balance, transactions)
- [ ] Write unit tests for service

### Phase 2: Purchase Flow (Week 1-2)

- [ ] Create purchase API endpoint
- [ ] Integrate with Razorpay
- [ ] Create purchase verification
- [ ] Create RipLimitBalance component
- [ ] Create RipLimitPurchaseModal
- [ ] Create /user/riplimit page
- [ ] Write integration tests

### Phase 3: Bid Integration (Week 2-3)

- [ ] Modify bid API to check RipLimit
- [ ] Implement block/release logic
- [ ] Create InsufficientRipLimit component
- [ ] Update AuctionBidModal
- [ ] Handle outbid release
- [ ] Write bid integration tests

### Phase 4: Win & Payment (Week 3)

- [ ] Modify auction win flow
- [ ] Implement RipLimit payment in checkout
- [ ] Handle partial payment
- [ ] Implement payment timeout
- [ ] Create unpaid auction handling
- [ ] Write payment tests

### Phase 5: Refunds & Admin (Week 4)

- [ ] Create refund API
- [ ] Create RipLimitRefundForm
- [ ] Create admin dashboard
- [ ] Create admin management APIs
- [ ] Write admin tests

### Phase 6: Polish (Week 4)

- [ ] Real-time balance updates
- [ ] Email notifications
- [ ] Error handling
- [ ] Edge cases
- [ ] Performance optimization
- [ ] Documentation

---

## Acceptance Criteria

- [ ] Users can purchase RipLimit with all payment methods
- [ ] RipLimit balance displays correctly everywhere
- [ ] Bids correctly block RipLimit
- [ ] Outbid correctly releases RipLimit
- [ ] Winning auction uses RipLimit for payment
- [ ] Users with unpaid auctions cannot bid
- [ ] Refunds process correctly
- [ ] Admin can manage RipLimit
- [ ] All transactions are logged
- [ ] Real-time updates work

---

## Dependencies

- E003: Auction System
- E011: Payment System
- E001: User Management

## Related Epics

- E016: Notifications
- E017: Analytics (RipLimit metrics)

---

## Test Documentation

**Test Cases**: `TDD/resources/riplimit/TEST-CASES.md`
**API Specs**: `TDD/resources/riplimit/API-SPECS.md`
