# Promotions & Coupons Feature

**Feature path:** `src/features/promotions/`  
**Repository:** `couponsRepository`  
**Service:** `couponService`, `promotionsService`  
**Actions:** `validateCouponAction`, `validateCouponForCartAction`, `adminCreateCouponAction`, `adminUpdateCouponAction`, `adminDeleteCouponAction`, `sellerCreateCouponAction`, `sellerUpdateCouponAction`, `sellerDeleteCouponAction`

---

## Overview

Promotions and coupons are separate concepts:

| Entity              | Owner  | Scope                                  |
| ------------------- | ------ | -------------------------------------- |
| **Platform Coupon** | Admin  | Applies to any order, any seller       |
| **Seller Coupon**   | Seller | Applies to that seller's products only |

---

## Public Promotions Page

### `PromotionsView` (`/promotions`)

Showcases currently active promotions:

- Grid of `CouponCard` components
- `ProductSection` — products associated with each promotion

**Data:** `usePromotions()` → `promotionsService.list()` → `GET /api/coupons?featured=1`

### `CouponCard`

Displays a coupon:

- Coupon code (copy-to-clipboard button)
- Discount: `X% off` or `₹X off`
- Minimum order amount
- Expiry date
- "Apply in Cart" link

### `ProductSection`

Horizontally scrollable strip of products that this coupon/promotion applies to.

---

## Cart Coupon Validation

### `PromoCodeInput` (in cart/checkout)

Text input for entering a coupon code:

1. User enters code → clicks "Apply"
2. `useCouponValidate` → `validateCouponForCartAction({ code, cartTotal, productIds })`
3. Success → discount shown in `CartSummary`
4. Error → inline error message

**Types:** `ValidateCouponInput`, `ValidateCouponResult`

Validation rules checked server-side:

- Coupon exists and is active
- Not expired (`expiresAt > now`)
- Usage limit not exceeded
- Minimum order amount met
- Applicable to items in cart (if scoped to products)

---

## Admin Coupon Management

### `AdminCouponsView` (`/admin/coupons`)

DataTable of all platform coupons. Filter by status, type, date.

**Form:** `CouponForm` fields:

| Field               | Description                         |
| ------------------- | ----------------------------------- |
| Code                | Uppercase, auto-generated or manual |
| Discount type       | Percentage or fixed amount          |
| Discount value      | Number                              |
| Min order amount    | Optional threshold                  |
| Max uses            | Global usage limit                  |
| Max per user        | Per-user limit                      |
| Applicable products | Optional product selector           |
| Start date          | Activation date                     |
| Expiry date         | Last valid date                     |
| Status              | Active / Inactive                   |

`couponToFormState(coupon)` converts a Firestore coupon document to form default values.

**Actions:** `adminCreateCouponAction`, `adminUpdateCouponAction`, `adminDeleteCouponAction`

---

## Seller Coupon Management

### `SellerCouponsView` + `SellerCouponForm`

Same form as admin but scoped to the seller's products. Seller cannot create platform-wide coupons.

**Actions:** `sellerCreateCouponAction`, `sellerUpdateCouponAction`, `sellerDeleteCouponAction`

---

## Hooks

| Hook                           | Description                 |
| ------------------------------ | --------------------------- |
| `usePromotions`                | Featured promotions list    |
| `useCouponValidate`            | Coupon validation mutation  |
| `useAdminCoupons(sieveParams)` | Admin paginated coupon list |
| `useSellerCoupons`             | Seller coupon list          |

---

## API Routes

| Method   | Route                      | Description           |
| -------- | -------------------------- | --------------------- |
| `GET`    | `/api/coupons`             | Active coupon listing |
| `POST`   | `/api/coupons/validate`    | Validate coupon code  |
| `GET`    | `/api/admin/coupons`       | Admin coupon list     |
| `PATCH`  | `/api/admin/coupons/[id]`  | Update coupon         |
| `DELETE` | `/api/admin/coupons/[id]`  | Delete coupon         |
| `GET`    | `/api/seller/coupons`      | Seller coupons        |
| `POST`   | `/api/seller/coupons`      | Create seller coupon  |
| `PATCH`  | `/api/seller/coupons/[id]` | Update seller coupon  |
| `DELETE` | `/api/seller/coupons/[id]` | Delete seller coupon  |
