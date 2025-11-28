# Carts Resource

## Overview

Shopping cart management with coupon support.

## Related Epic

- [E004: Shopping Cart](../../epics/E004-shopping-cart.md)

## Database Collection

- `carts` - Cart documents
- `cart_items` - Cart items

## API Routes

```
/api/cart           - GET    - Get cart
/api/cart           - POST   - Add item
/api/cart/:itemId   - PATCH  - Update quantity
/api/cart/:itemId   - DELETE - Remove item
/api/cart/clear     - DELETE - Clear cart
/api/cart/coupon    - POST   - Apply coupon
/api/cart/coupon    - DELETE - Remove coupon
/api/cart/merge     - POST   - Merge carts
/api/cart/validate  - GET    - Validate cart
```

## Types

- `CartBE` - Backend cart type
- `CartItemBE` - Cart item type

## Service

- `cartService` - Cart operations

## Hooks

- `useCart` - Cart hook

## Components

- `src/components/cart/` - Cart components
- `src/app/cart/` - Cart page

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
