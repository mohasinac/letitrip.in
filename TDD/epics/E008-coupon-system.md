# Epic E008: Coupon System

## Overview

Discount coupon management for shops with various discount types, usage limits, and automatic application.

## Scope

- Coupon creation and management
- Discount types (percentage, flat, BOGO, tiered, free shipping)
- Usage limits and validation
- Auto-apply functionality
- Coupon analytics

## User Roles Involved

- **Admin**: Full coupon management across platform
- **Seller**: Manage own shop coupons
- **User**: Apply coupons to cart
- **Guest**: View public coupons

---

## Features

### F008.1: Coupon Creation

**US008.1.1**: Create Coupon (Seller)

```
As a seller
I want to create coupons for my shop
So that I can attract customers

Coupon Types:
- Percentage discount (e.g., 20% off)
- Flat discount (e.g., ₹100 off)
- Buy One Get One (BOGO)
- Tiered discount (spend more, save more)
- Free shipping
```

### F008.2: Coupon Configuration

**US008.2.1**: Set Coupon Restrictions

```
Restrictions:
- Minimum purchase amount
- Maximum discount amount
- Usage limit (total)
- Usage limit per user
- Valid date range
- First order only
- New users only
- Applicable categories/products
- Excluded categories/products
```

### F008.3: Coupon Application

**US008.3.1**: Apply Coupon to Cart
**US008.3.2**: Validate Coupon
**US008.3.3**: Auto-apply Best Coupon

### F008.4: Coupon Discovery

**US008.4.1**: View Available Coupons
**US008.4.2**: Featured Coupons

---

## API Endpoints

| Endpoint                     | Method | Auth         | Description         |
| ---------------------------- | ------ | ------------ | ------------------- |
| `/api/coupons`               | GET    | Public       | List public coupons |
| `/api/coupons`               | POST   | Seller       | Create coupon       |
| `/api/coupons/:code`         | GET    | Public       | Get coupon          |
| `/api/coupons/:code`         | PATCH  | Seller/Admin | Update coupon       |
| `/api/coupons/:code`         | DELETE | Seller/Admin | Delete coupon       |
| `/api/coupons/validate-code` | POST   | User         | Validate coupon     |
| `/api/coupons/bulk`          | POST   | Seller/Admin | Bulk operations     |
| `/api/cart/coupon`           | POST   | User         | Apply to cart       |

---

## Data Models

```typescript
interface CouponBE {
  id: string;
  shopId: string;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "flat" | "bogo" | "tiered" | "free-shipping";
  discountValue?: number;
  maxDiscountAmount?: number;
  tiers?: TieredDiscountBE[];
  bogoConfig?: BogoConfigBE;
  minPurchaseAmount: number;
  minQuantity: number;
  applicability: "all" | "category" | "product";
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  usageLimit?: number;
  usageLimitPerUser: number;
  usageCount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  status: "active" | "inactive" | "expired" | "used-up";
  firstOrderOnly: boolean;
  newUsersOnly: boolean;
  canCombineWithOtherCoupons: boolean;
  autoApply: boolean;
  isPublic: boolean;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Related Epics

- E004: Shopping Cart (coupon application)
- E005: Order Management (coupon in orders)

---

## Test Documentation

- **API Specs**: `/TDD/resources/coupons/API-SPECS.md`
- **Test Cases**: `/TDD/resources/coupons/TEST-CASES.md`

### Test Coverage

- Unit tests for discount calculations
- Unit tests for coupon validation logic
- Integration tests for CRUD operations
- E2E tests for coupon application flow
- RBAC tests for seller and admin management
