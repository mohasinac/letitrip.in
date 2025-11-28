# Orders Resource

## Overview

Order lifecycle from creation to delivery.

## Related Epic

- [E005: Order Management](../../epics/E005-order-management.md)

## Database Collection

- `orders` - Order documents
- `order_items` - Order items

## API Routes

```
/api/orders              - GET/POST  - List/Create
/api/orders/:id          - GET/PATCH - Get/Update
/api/orders/:id/cancel   - POST      - Cancel order
/api/orders/:id/tracking - GET       - Get tracking
/api/orders/:id/invoice  - GET       - Download invoice
/api/orders/bulk         - POST      - Bulk operations
```

## Types

- `OrderBE` - Backend order type
- `OrderItemBE` - Order item type

## Service

- `orderService` - Order operations

## Components

- `src/app/user/orders/` - User order history
- `src/app/seller/orders/` - Seller order management
- `src/app/admin/orders/` - Admin order management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
