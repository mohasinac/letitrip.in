# Epic E005: Order Management

## Overview

Complete order lifecycle from creation through fulfillment including payment processing, shipping, and delivery tracking.

## Scope

- Order creation from cart
- Payment integration
- Order status management
- Shipping and tracking
- Order cancellation and refunds
- Order history

## User Roles Involved

- **Admin**: Full order management, refunds
- **Seller**: Manage orders for own shop
- **User**: View own orders, cancel, request returns
- **Guest**: No access

---

## Features

### F005.1: Order Creation

**Priority**: P0 (Critical)

#### User Stories

**US005.1.1**: Create Order from Cart

```
As a user
I want to convert my cart to an order
So that I can complete my purchase

Acceptance Criteria:
- Given I have a valid cart
- When I proceed to checkout
- Then I select shipping address
- And select payment method
- And confirm order
- Then order is created with unique order number

Order Number Format: JFV-YYYYMMDD-XXXXX
```

**US005.1.2**: Apply Address to Order

```
As a user
I want to select a delivery address
So that my order is shipped correctly

Acceptance Criteria:
- Given I am at checkout
- When I select an address
- Then it is attached to the order
- And shipping cost is calculated

Options:
- Select from saved addresses
- Add new address
- Edit address inline
```

**US005.1.3**: Select Payment Method

```
As a user
I want to choose how to pay
So that I can use my preferred payment

Acceptance Criteria:
- Given I am at checkout
- When I select payment method
- Then appropriate payment flow begins

Payment Methods:
- UPI (Razorpay)
- Card (Razorpay)
- Net Banking (Razorpay)
- Wallet (Razorpay)
- COD (Cash on Delivery)
```

### F005.2: Order Payment

**Priority**: P0 (Critical)

#### User Stories

**US005.2.1**: Process Online Payment

```
As a user
I want to pay online
So that my order is confirmed immediately

Acceptance Criteria:
- Given I selected online payment
- When payment succeeds
- Then order status = "confirmed"
- And I receive order confirmation email
- And seller is notified

Technical:
- Razorpay integration
- Webhook for payment confirmation
- Retry mechanism for failed webhooks
```

**US005.2.2**: COD Order

```
As a user
I want to pay on delivery
So that I can inspect before paying

Acceptance Criteria:
- Given I selected COD
- When I confirm order
- Then order status = "pending"
- And COD charge is added if applicable
- And seller sees COD indicator
```

**US005.2.3**: Payment Failure Handling

```
As a user
I want to retry failed payments
So that I can complete my order

Acceptance Criteria:
- Given payment failed
- When I retry payment
- Then new payment attempt is initiated
- And order is confirmed on success

Retry Options:
- Same payment method
- Different payment method
- Within 30 minutes of order creation
```

### F005.3: Order Status Management

**Priority**: P0 (Critical)

#### User Stories

**US005.3.1**: Order Status Flow

```
Order Status Lifecycle:

PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓           ↓           ↓
CANCELLED  CANCELLED  CANCELLED     RTO
                                     ↓
                               REFUNDED
```

**US005.3.2**: View Order Status (User)

```
As a user
I want to see my order status
So that I know when to expect delivery

Acceptance Criteria:
- Given I have orders
- When I view order details
- Then I see current status
- And status history timeline
- And estimated delivery date
```

**US005.3.3**: Update Order Status (Seller)

```
As a seller
I want to update order status
So that customers are informed of progress

Acceptance Criteria:
- Given I have a confirmed order
- When I update status (e.g., to "Processing")
- Then customer is notified
- And status history is updated

Allowed Transitions:
- Confirmed → Processing
- Processing → Shipped (requires tracking)
- Shipped → Delivered
- Any → Cancelled (with restrictions)
```

### F005.4: Shipping Management

**Priority**: P0 (Critical)

#### User Stories

**US005.4.1**: Add Tracking Information

```
As a seller
I want to add tracking details
So that customer can track shipment

Acceptance Criteria:
- Given order is in Processing status
- When I add tracking number and carrier
- Then order status changes to Shipped
- And customer receives tracking link
- And tracking is displayed on order page

Carriers:
- India Post
- Delhivery
- BlueDart
- DTDC
- Ecom Express
```

**US005.4.2**: Track Shipment

```
As a user
I want to track my shipment
So that I know delivery progress

Acceptance Criteria:
- Given order is shipped
- When I view tracking
- Then I see carrier and tracking number
- And tracking link to carrier website
```

**US005.4.3**: Confirm Delivery

```
As a seller
I want to mark order as delivered
So that transaction is complete

Acceptance Criteria:
- Given order is shipped
- When delivery is confirmed
- Then order status = "Delivered"
- And customer can now review

Auto-confirm:
- After carrier confirms delivery
- Or 7 days after shipped (if no update)
```

### F005.5: Order Cancellation

**Priority**: P1 (High)

#### User Stories

**US005.5.1**: Cancel Order (User)

```
As a user
I want to cancel my order
So that I don't receive unwanted items

Acceptance Criteria:
- Given my order is Pending or Confirmed
- When I request cancellation
- Then order is cancelled
- And refund is initiated (if paid)

Restrictions:
- Cannot cancel after Shipped
- Cannot cancel COD after Processing
```

**US005.5.2**: Cancel Order (Seller)

```
As a seller
I want to cancel orders
So that I can handle issues

Acceptance Criteria:
- Given an order needs cancellation
- When I cancel with reason
- Then order is cancelled
- And customer is notified
- And refund is initiated

Reasons:
- Out of stock
- Customer request
- Unable to fulfill
- Fraudulent order
```

**US005.5.3**: Process Refund

```
As an admin
I want to process refunds
So that cancelled orders are refunded

Acceptance Criteria:
- Given order is cancelled and paid
- When refund is processed
- Then money returns to original payment method
- And refund status is tracked
- And customer is notified

Timeline:
- Card/UPI: 5-7 business days
- Net Banking: 7-10 business days
```

### F005.6: Order History

**Priority**: P1 (High)

#### User Stories

**US005.6.1**: View Order History (User)

```
As a user
I want to see my order history
So that I can reference past purchases

Acceptance Criteria:
- Given I have past orders
- When I view order history
- Then I see all orders
- And can filter by status, date

Filters:
- Status: All, Active, Completed, Cancelled
- Date range
- Search by order number
```

**US005.6.2**: View Order Details

```
As a user
I want to see order details
So that I have complete information

Acceptance Criteria:
- Given I click on an order
- When details page loads
- Then I see:
  - Order number and date
  - Items with images and prices
  - Shipping address
  - Payment details
  - Status timeline
  - Tracking (if shipped)
  - Actions (cancel, return, review)
```

**US005.6.3**: Download Invoice

```
As a user
I want to download invoice
So that I have receipt for records

Acceptance Criteria:
- Given order is delivered
- When I click "Download Invoice"
- Then PDF invoice is generated
- And includes GST details if applicable
```

### F005.7: Seller Order Management

**Priority**: P0 (Critical)

#### User Stories

**US005.7.1**: View Shop Orders

```
As a seller
I want to see all orders for my shop
So that I can fulfill them

Acceptance Criteria:
- Given I have shop orders
- When I view orders page
- Then I see orders for my shop only
- And can filter by status

Filters:
- Status: Pending, Confirmed, Processing, Shipped, Delivered
- Date range
- Search
```

**US005.7.2**: Bulk Order Processing

```
As a seller
I want to process orders in bulk
So that I save time

Acceptance Criteria:
- Given I have multiple orders
- When I select orders
- Then I can bulk update status
- And bulk add tracking (same carrier)

Bulk Actions:
- Mark as Processing
- Mark as Shipped (with tracking)
- Export to CSV
```

### F005.8: Admin Order Management

**Priority**: P1 (High)

#### User Stories

**US005.8.1**: View All Orders (Admin)

```
As an admin
I want to see all platform orders
So that I can monitor activity

Acceptance Criteria:
- Given I am an admin
- When I view orders
- Then I see all orders across shops
- And can filter by shop, status, date
```

**US005.8.2**: Override Order Status (Admin)

```
As an admin
I want to override order status
So that I can resolve issues

Acceptance Criteria:
- Given an order needs intervention
- When I update status
- Then it changes regardless of normal flow
- And audit log is created
```

**US005.8.3**: Process Manual Refund (Admin)

```
As an admin
I want to manually process refunds
So that I can handle edge cases

Acceptance Criteria:
- Given refund is needed outside normal flow
- When I initiate manual refund
- Then refund is processed
- And order is updated
- And customer is notified
```

---

## API Endpoints

| Endpoint                   | Method | Auth         | Description       |
| -------------------------- | ------ | ------------ | ----------------- |
| `/api/orders`              | GET    | User         | List own orders   |
| `/api/orders`              | POST   | User         | Create order      |
| `/api/orders/:id`          | GET    | User         | Get order details |
| `/api/orders/:id`          | PATCH  | Seller/Admin | Update order      |
| `/api/orders/:id/cancel`   | POST   | User/Seller  | Cancel order      |
| `/api/orders/:id/tracking` | GET    | User         | Get tracking info |
| `/api/orders/:id/invoice`  | GET    | User         | Download invoice  |
| `/api/orders/bulk`         | POST   | Seller/Admin | Bulk operations   |

---

## Data Models

### OrderBE (Backend)

```typescript
interface OrderBE {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  shopId: string | null;
  shopName: string | null;
  sellerId: string | null;
  items: OrderItemBE[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  couponId: string | null;
  couponCode: string | null;
  couponDiscount: number;
  paymentMethod: "card" | "upi" | "net-banking" | "wallet" | "cod";
  paymentStatus: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentId: string | null;
  paymentGateway: string | null;
  paidAt: Timestamp | null;
  shippingMethod: "standard" | "express" | "overnight" | "pickup";
  shippingAddress: ShippingAddressBE;
  shippingProvider: string | null;
  trackingNumber: string | null;
  estimatedDelivery: Timestamp | null;
  deliveredAt: Timestamp | null;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  cancelledAt: Timestamp | null;
  cancelReason: string | null;
  refundAmount: number | null;
  refundedAt: Timestamp | null;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Test Scenarios

### Unit Tests

- [ ] Calculate order totals
- [ ] Generate order number
- [ ] Validate status transitions
- [ ] Calculate shipping cost

### Integration Tests

- [ ] Create order from cart
- [ ] Process payment and update order
- [ ] Update shipping and notify customer
- [ ] Cancel order and process refund

### E2E Tests

- [ ] Complete purchase flow (cart → order → payment → delivery)
- [ ] Order cancellation with refund
- [ ] Seller order fulfillment
- [ ] Admin order intervention

---

## Business Rules

1. **Order Number**: Unique, format JFV-YYYYMMDD-XXXXX
2. **Payment Timeout**: Online payment must complete within 30 minutes
3. **Cancellation Window**: Cannot cancel after shipped
4. **Refund Timeline**: Automatic within 7 days of cancellation
5. **COD Limit**: Max ₹10,000 per order

## Related Epics

- E004: Shopping Cart (order source)
- E009: Returns & Refunds (post-delivery returns)
- E011: Payment System (order payments)
- E018: Payout System (seller payments)

---

## Test Documentation

- **API Specs**: `/TDD/resources/orders/API-SPECS.md`
- **Test Cases**: `/TDD/resources/orders/TEST-CASES.md`

### Test Coverage

- Unit tests for order totals and status transitions
- Unit tests for order number generation
- Integration tests for order lifecycle
- E2E tests for complete purchase flow
- RBAC tests for seller and admin order management
