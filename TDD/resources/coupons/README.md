# Coupons Resource

## Overview

Discount coupon management.

## Related Epic

- [E008: Coupon System](../../epics/E008-coupon-system.md)

## Database Collection

- `coupons` - Coupon documents
- `coupon_usage` - Usage tracking

## API Routes

```
/api/coupons              - GET/POST  - List/Create
/api/coupons/:code        - GET/PATCH - Get/Update
/api/coupons/:code        - DELETE    - Delete
/api/coupons/validate-code - POST     - Validate
/api/coupons/bulk         - POST      - Bulk operations
```

## Types

- `CouponBE` - Backend coupon type

## Service

- `couponService` - Coupon operations

## Components

- `src/app/seller/coupons/` - Seller coupon management
- `src/app/admin/coupons/` - Admin coupon management

## Status: 📋 Documentation Pending

- [ ] Detailed user stories
- [ ] API specifications
- [ ] Test cases
