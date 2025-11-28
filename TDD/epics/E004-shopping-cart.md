# Epic E004: Shopping Cart

## Overview

Shopping cart functionality for product purchases with coupon support, cart persistence, and seamless checkout transition.

## Scope

- Cart management (add, update, remove items)
- Cart persistence for logged-in users
- Coupon application
- Cart validation before checkout
- Cart merging on login

## User Roles Involved

- **Admin**: View all carts (analytics)
- **Seller**: N/A (sellers can have personal carts as users)
- **User**: Full cart functionality
- **Guest**: No cart (must login)

---

## Features

### F004.1: Add to Cart

**Priority**: P0 (Critical)

#### User Stories

**US004.1.1**: Add Product to Cart

```
As a logged-in user
I want to add products to my cart
So that I can purchase them later

Acceptance Criteria:
- Given I am viewing a product
- When I click "Add to Cart"
- Then the product is added to my cart
- And cart count updates in header
- And I see confirmation toast

Validation:
- Product is published
- Product is in stock
- Quantity <= available stock
```

**US004.1.2**: Add with Quantity

```
As a user
I want to specify quantity when adding
So that I can add multiple items at once

Acceptance Criteria:
- Given I am on product page
- When I select quantity > 1 and add to cart
- Then that quantity is added
- And total updates correctly
```

**US004.1.3**: Add from Product Card

```
As a user
I want to add products directly from listings
So that I can shop faster

Acceptance Criteria:
- Given I am browsing products
- When I click cart icon on product card
- Then product is added with quantity 1
- And I can continue browsing
```

### F004.2: View Cart

**Priority**: P0 (Critical)

#### User Stories

**US004.2.1**: View Cart Contents

```
As a user
I want to view my cart
So that I can see what I'm buying

Acceptance Criteria:
- Given I have items in cart
- When I go to cart page
- Then I see all cart items
- And each item shows: image, name, price, quantity, subtotal
- And I see cart totals

Display:
- Subtotal (before discounts)
- Discount (if coupon applied)
- Tax (estimated)
- Shipping (estimated or free threshold)
- Total
```

**US004.2.2**: Cart Mini-view

```
As a user
I want quick cart preview in header
So that I don't leave current page

Acceptance Criteria:
- Given I have items in cart
- When I click cart icon in header
- Then I see dropdown with items
- And totals
- And quick checkout button
```

### F004.3: Update Cart

**Priority**: P0 (Critical)

#### User Stories

**US004.3.1**: Update Item Quantity

```
As a user
I want to change item quantities
So that I can adjust my order

Acceptance Criteria:
- Given I am viewing my cart
- When I change item quantity
- Then the quantity updates
- And totals recalculate
- And I see updated amounts

Validation:
- Quantity >= 1
- Quantity <= available stock
- Show warning if exceeds stock
```

**US004.3.2**: Remove Item from Cart

```
As a user
I want to remove items from cart
So that I don't purchase unwanted items

Acceptance Criteria:
- Given I have items in cart
- When I click remove on an item
- Then it is removed from cart
- And totals update
```

**US004.3.3**: Clear Entire Cart

```
As a user
I want to clear my entire cart
So that I can start fresh

Acceptance Criteria:
- Given I have items in cart
- When I click "Clear Cart"
- Then confirmation dialog appears
- When I confirm
- Then all items are removed
```

### F004.4: Coupon Application

**Priority**: P1 (High)

#### User Stories

**US004.4.1**: Apply Coupon Code

```
As a user
I want to apply a coupon to my cart
So that I get a discount

Acceptance Criteria:
- Given I have items in cart
- When I enter a valid coupon code
- Then discount is applied
- And totals update
- And coupon details shown

Validation:
- Coupon is active
- Coupon not expired
- Cart meets minimum amount
- User meets coupon criteria (first order, etc.)
```

**US004.4.2**: Remove Coupon

```
As a user
I want to remove applied coupon
So that I can try a different one

Acceptance Criteria:
- Given I have a coupon applied
- When I click remove coupon
- Then discount is removed
- And totals update
```

**US004.4.3**: Auto-apply Coupons

```
As a user
I want eligible coupons auto-applied
So that I don't miss discounts

Acceptance Criteria:
- Given there are auto-apply coupons
- When my cart qualifies
- Then best coupon is auto-applied
- And I'm notified of savings
```

### F004.5: Cart Validation

**Priority**: P0 (Critical)

#### User Stories

**US004.5.1**: Stock Validation

```
As a user
I want to know if items are unavailable
So that I can adjust my cart before checkout

Acceptance Criteria:
- Given I view my cart
- When an item is out of stock
- Then I see warning on that item
- And cannot proceed to checkout until resolved
```

**US004.5.2**: Price Change Notification

```
As a user
I want to know if prices changed
So that I'm not surprised at checkout

Acceptance Criteria:
- Given item prices changed since I added
- When I view my cart
- Then I see notification of price changes
- And new prices are reflected
```

**US004.5.3**: Product Availability Check

```
As a user
I want to know if products were removed
So that I can update my cart

Acceptance Criteria:
- Given a product in my cart is no longer available
- When I view my cart
- Then I see item marked as unavailable
- And option to remove it
```

### F004.6: Cart Persistence

**Priority**: P0 (Critical)

#### User Stories

**US004.6.1**: Cart Saved to Account

```
As a logged-in user
I want my cart saved to my account
So that I can access it from any device

Acceptance Criteria:
- Given I add items to cart
- When I log out and log back in
- Then my cart is preserved
- And I can checkout
```

**US004.6.2**: Cart Merge on Login

```
As a user
I want carts to merge when I login
So that I don't lose items

Acceptance Criteria:
- Given I have items in guest session
- When I login and have existing cart
- Then items are merged
- And I see combined cart

Merge Strategy:
- Add new items
- Use higher quantity for duplicates
- Notify user of merge
```

---

## API Endpoints

| Endpoint             | Method | Auth | Description                |
| -------------------- | ------ | ---- | -------------------------- |
| `/api/cart`          | GET    | User | Get current cart           |
| `/api/cart`          | POST   | User | Add item to cart           |
| `/api/cart/:itemId`  | PATCH  | User | Update item quantity       |
| `/api/cart/:itemId`  | DELETE | User | Remove item                |
| `/api/cart/clear`    | DELETE | User | Clear cart                 |
| `/api/cart/coupon`   | POST   | User | Apply coupon               |
| `/api/cart/coupon`   | DELETE | User | Remove coupon              |
| `/api/cart/validate` | GET    | User | Validate cart for checkout |
| `/api/cart/merge`    | POST   | User | Merge guest cart           |

---

## Data Models

### CartBE (Backend)

```typescript
interface CartBE {
  id: string;
  userId: string;
  items: CartItemBE[];
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp | null;
}

interface CartItemBE {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: string | null;
  variantName: string | null;
  sku: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  subtotal: number;
  discount: number;
  total: number;
  shopId: string | null;
  shopName: string | null;
  isAvailable: boolean;
  addedAt: Timestamp;
}
```

---

## Test Scenarios

### Unit Tests

- [ ] Calculate cart totals correctly
- [ ] Apply percentage discount
- [ ] Apply fixed discount
- [ ] Validate quantity limits
- [ ] Handle unavailable items

### Integration Tests

- [ ] Add item and verify cart update
- [ ] Update quantity and verify totals
- [ ] Apply coupon and verify discount
- [ ] Validate cart before checkout
- [ ] Merge carts on login

### E2E Tests

- [ ] Add to cart → view cart → checkout
- [ ] Apply coupon → complete purchase
- [ ] Out of stock handling in cart
- [ ] Multi-device cart sync

---

## Business Rules

1. **Max Cart Items**: 50 items per cart
2. **Max Quantity**: Cannot exceed product stock
3. **Cart Expiry**: Guest carts expire after 7 days
4. **Coupon Stacking**: Only one coupon per cart (unless specified)
5. **Free Shipping**: Applied if cart total >= shop threshold

## Related Epics

- E002: Product Catalog (products in cart)
- E005: Order Management (cart to order)
- E008: Coupon System (cart discounts)
- E011: Payment System (checkout)

---

## Test Documentation

- **API Specs**: `/TDD/resources/carts/API-SPECS.md`
- **Test Cases**: `/TDD/resources/carts/TEST-CASES.md`

### Test Coverage

- Unit tests for cart totals calculation
- Unit tests for coupon application
- Integration tests for CRUD operations
- E2E tests for add to cart → checkout flow
- Session merge tests for login scenarios
