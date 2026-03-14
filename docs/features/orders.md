# Orders Feature

**Repository:** `orderRepository`  
**Service:** `orderService`  
**Actions:** `cancelOrderAction`, `adminUpdateOrderAction`  
**Features:** `src/features/user/`, `src/features/seller/`, `src/features/admin/`

---

## Overview

Orders are created at checkout and flow through a status lifecycle. Three roles interact with orders differently:

| Role       | Capabilities                                                            |
| ---------- | ----------------------------------------------------------------------- |
| **User**   | View order history, view details, track shipment, cancel pending orders |
| **Seller** | View incoming orders, ship orders, request payouts                      |
| **Admin**  | View all orders, update any status, resolve disputes                    |

---

## Order Status Lifecycle

```
pending_payment
     │
     ▼
  confirmed   ←── payment verified
     │
     ▼
  processing  ←── seller preparing
     │
     ▼
   shipped    ←── seller ships (ShipRocket AWB created)
     │
     ▼
  delivered   ←── delivery confirmed
     │
     ▼
  completed   ←── auto after delivery + return window closed

  (any state) → cancelled  ←── user or admin
  (any state) → refunded   ←── admin
```

---

## User Order Pages

### `UserOrdersView` (`/user/orders`)

Paginated order history:

- Filter by status, date range
- Each row: `OrderCard` (order ID, date, item count, total, status badge)
- Data: `useUserOrders(params)` → `orderService.list(params)` → `GET /api/user/orders`

### `OrderDetailView` (`/user/orders/view/[id]`)

Full order breakdown:

- Items list with images, names, quantities, prices
- Delivery address
- Payment method + transaction ID
- Status timeline
- Invoice download: `GET /api/orders/[id]/invoice` → PDF generation

Hook: `useOrderDetail(id)` → `orderService.getById(id)`

### `UserOrderTrackView` / `OrderTrackingView` (`/user/orders/[id]/track`)

Live shipment tracking:

- ShipRocket tracking events timeline
- Courier name + AWB number
- Estimated delivery date
- Map view (if courier supports)

### Cancel Order

`cancelOrderAction({ orderId })` — only available when order status is `pending_payment` or `confirmed`. Triggers refund if payment was made.

---

## Seller Order Pages

### `SellerOrdersView` (`/seller/orders`)

The seller's incoming order queue:

- Filter by status, date range
- Search by order ID or customer name
- Data: `useSellerOrders(params)` → `GET /api/seller/orders`

### Ship Order

Each confirmed order has a "Ship Order" action:

1. Seller clicks "Ship"
2. `useShipOrder` → `POST /api/seller/orders/[id]/ship`
3. Backend creates ShipRocket shipment, assigns AWB
4. Order status → `shipped`
5. Tracking info saved to order document

### Bulk Payout Request

`useBulkRequestPayout` → `POST /api/seller/orders/bulk`  
Seller selects delivered orders and requests payout for all in one action.

An order becomes **payout-eligible** after **7 platform days** past delivery. A platform day starts at 10:00 AM IST — delivery before 10 AM counts from that same day's 10 AM boundary. Auto-payout runs daily at 10 AM IST via the `autoPayoutEligibility` Cloud Function.

---

## Admin Order Pages

### `AdminOrdersView` (`/admin/orders`)

All platform orders across all sellers.

Columns: order ID, customer name, seller name, items count, total, status, payment status, date.

### Status Update

`OrderStatusForm` + `adminUpdateOrderAction`:

- Override order status (e.g. mark delivered, trigger refund)
- Add internal note

---

## Shared Components

### `OrderCard`

**File:** `src/components/orders/OrderCard.tsx`  
Summary card showing:

- Order ID + date
- Item thumbnail strip
- Total
- Status `StatusBadge`
- CTA link to detail page

---

## API Routes — Orders

| Method  | Route                          | Description                 |
| ------- | ------------------------------ | --------------------------- |
| `GET`   | `/api/user/orders`             | User order list             |
| `GET`   | `/api/orders/[id]`             | Order detail                |
| `POST`  | `/api/user/orders/[id]/cancel` | Cancel order                |
| `GET`   | `/api/orders/[id]/invoice`     | Download invoice PDF        |
| `GET`   | `/api/seller/orders`           | Seller order list           |
| `POST`  | `/api/seller/orders/[id]/ship` | Ship an order               |
| `POST`  | `/api/seller/orders/bulk`      | Bulk payout request         |
| `GET`   | `/api/admin/orders/[id]`       | Admin order detail          |
| `PATCH` | `/api/admin/orders/[id]`       | Admin status update         |
| `POST`  | `/api/webhooks/shiprocket`     | ShipRocket delivery webhook |

---

## ShipRocket Integration

Shipment creation happens server-side in `POST /api/seller/orders/[id]/ship`:

1. Fetch order + seller pickup address
2. Call ShipRocket API to create shipment
3. Get AWB (Air Waybill) number
4. Save AWB + courier to `order.shippingDetails`
5. Update order status to `shipped`

The `POST /api/webhooks/shiprocket` handles delivery status callbacks and auto-advances order status to `delivered`.
