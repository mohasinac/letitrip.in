# Coupons Resource - API Specifications

## Overview

Coupon management APIs for discounts and promotions.

---

## Endpoints

### Public Endpoints

#### POST /api/coupons/validate

Validate a coupon code.

**Request Body**:

```json
{
  "code": "SAVE10",
  "cartTotal": 129900,
  "productIds": ["prod_001", "prod_002"]
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "code": "SAVE10",
    "type": "percentage",
    "value": 10,
    "discount": 12990,
    "message": "Coupon applied: 10% off"
  }
}
```

**Invalid Response**:

```json
{
  "success": true,
  "data": {
    "valid": false,
    "code": "SAVE10",
    "reason": "expired",
    "message": "This coupon has expired"
  }
}
```

---

### Seller Endpoints

#### GET /api/seller/coupons

List seller's coupons.

---

#### POST /api/seller/coupons

Create coupon.

**Request Body**:

```json
{
  "code": "SHOP20",
  "type": "percentage",
  "value": 20,
  "minOrderValue": 1000,
  "maxDiscount": 5000,
  "usageLimit": 100,
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "applicableProducts": [],
  "applicableCategories": []
}
```

---

#### PUT /api/seller/coupons/:id

Update coupon.

---

#### DELETE /api/seller/coupons/:id

Delete coupon.

---

### Admin Endpoints

#### GET /api/admin/coupons

List all coupons.

---

#### POST /api/admin/coupons

Create platform-wide coupon.

---

## RBAC Permissions

| Endpoint                   | Guest | User | Seller | Admin |
| -------------------------- | ----- | ---- | ------ | ----- |
| POST /coupons/validate     | ✅    | ✅   | ✅     | ✅    |
| GET /seller/coupons        | ❌    | ❌   | ✅     | ✅    |
| POST /seller/coupons       | ❌    | ❌   | ✅     | ✅    |
| PUT /seller/coupons/:id    | ❌    | ❌   | ✅\*   | ✅    |
| DELETE /seller/coupons/:id | ❌    | ❌   | ✅\*   | ✅    |
| GET /admin/coupons         | ❌    | ❌   | ❌     | ✅    |
| POST /admin/coupons        | ❌    | ❌   | ❌     | ✅    |

\*Own coupons only

---

## Service Usage

```typescript
import { couponsService } from "@/services";

const validation = await couponsService.validate({
  code: "SAVE10",
  cartTotal: 129900,
});

// Seller
const coupons = await couponsService.listSeller();
await couponsService.create({ code: "SHOP20", type: "percentage", ... });
await couponsService.update("coupon_001", { endDate: "2024-12-31" });
await couponsService.delete("coupon_001");
```

---

## Coupon Types

- **percentage**: Percentage discount (e.g., 10% off)
- **fixed**: Fixed amount discount (e.g., ₹500 off)
- **free_shipping**: Free shipping

## Validation Rules

- **code**: 3-20 chars, uppercase alphanumeric + underscore
- **value**: Positive number (percentage: 1-100, fixed: any positive)
- **minOrderValue**: Non-negative
- **maxDiscount**: For percentage coupons
- **usageLimit**: Total uses allowed
- **startDate**: Today or future
- **endDate**: After startDate
