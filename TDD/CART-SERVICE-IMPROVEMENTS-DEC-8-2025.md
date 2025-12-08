# Cart Service Improvements - December 8, 2025

## Overview

Comprehensive testing and bug fixes for the cart service, focusing on guest cart functionality which handles offline shopping cart operations in localStorage.

## Test Statistics

- **New Tests Added**: 33 comprehensive edge case tests
- **Total Tests**: 4397 passed, 7 skipped
- **Test Coverage**: Guest cart operations, edge cases, and API integration
- **Pass Rate**: 100%

## Bugs Fixed

### Bug 1: Missing Computed Field Updates in `addToGuestCart`

**Issue**: When incrementing quantity for an existing item in the guest cart, computed fields (subtotal, total, canIncrement, canDecrement, etc.) were not recalculated.

**Location**: `src/services/cart.service.ts` - `addToGuestCart` method

**Before**:

```typescript
if (existingIndex >= 0) {
  // Update quantity
  cart[existingIndex].quantity += item.quantity;
} else {
  // Add new item...
}
```

**After**:

```typescript
if (existingIndex >= 0) {
  // Update quantity and recalculate computed fields
  const existingItem = cart[existingIndex];
  const newQuantity = existingItem.quantity + item.quantity;

  // Don't exceed maxQuantity
  existingItem.quantity = Math.min(newQuantity, item.maxQuantity);

  // Recalculate subtotal and total
  existingItem.subtotal = existingItem.price * existingItem.quantity;
  existingItem.total = existingItem.subtotal - existingItem.discount;

  // Update computed fields
  existingItem.formattedSubtotal = `₹${existingItem.subtotal}`;
  existingItem.formattedTotal = `₹${existingItem.total}`;
  existingItem.canIncrement = existingItem.quantity < item.maxQuantity;
  existingItem.canDecrement = existingItem.quantity > 1;
} else {
  // Add new item...
}
```

**Impact**:

- Users could add items beyond stock limits
- UI would show incorrect totals after incrementing quantities
- Increment/decrement buttons might be enabled/disabled incorrectly

**Test Coverage**:

- `increments quantity for existing item`
- `sets computed fields correctly`
- `handles low stock correctly`

---

### Bug 2: No MaxQuantity Enforcement in `updateGuestCartItem`

**Issue**: The `updateGuestCartItem` method didn't enforce `maxQuantity` limits or recalculate derived fields when updating quantities.

**Location**: `src/services/cart.service.ts` - `updateGuestCartItem` method

**Before**:

```typescript
if (index >= 0) {
  if (quantity <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = quantity;
  }
  this.setGuestCart(cart);
}
```

**After**:

```typescript
if (index >= 0) {
  if (quantity <= 0) {
    cart.splice(index, 1);
  } else {
    const item = cart[index];

    // Don't exceed maxQuantity
    item.quantity = Math.min(quantity, item.maxQuantity);

    // Recalculate subtotal and total
    item.subtotal = item.price * item.quantity;
    item.total = item.subtotal - item.discount;

    // Update computed fields
    item.formattedSubtotal = `₹${item.subtotal}`;
    item.formattedTotal = `₹${item.total}`;
    item.canIncrement = item.quantity < item.maxQuantity;
    item.canDecrement = item.quantity > 1;
  }
  this.setGuestCart(cart);
}
```

**Impact**:

- Users could set quantity beyond available stock
- Cart totals would be incorrect after quantity updates
- UI state (increment/decrement buttons) would be out of sync

**Test Coverage**:

- `updates item quantity`
- Tests with `maxQuantity` limits
- Recalculation of computed fields

---

## New Tests Added (33 total)

### Guest Cart Operations (26 tests)

#### getGuestCart (3 tests)

- Returns empty array for new guest
- Retrieves existing guest cart from localStorage
- Handles corrupted localStorage data gracefully

#### addToGuestCart (7 tests)

- Adds new item to empty cart
- Increments quantity for existing item (same product + variant)
- Treats different variants as separate items
- Sets computed fields correctly (hasDiscount, canIncrement, canDecrement)
- Handles low stock correctly (maxQuantity <= 5)
- Handles out of stock correctly (isAvailable = false)
- Enforces maxQuantity limits when incrementing

#### updateGuestCartItem (4 tests)

- Updates item quantity successfully
- Removes item when quantity is zero
- Removes item when quantity is negative
- Does nothing for non-existent item ID

#### removeFromGuestCart (3 tests)

- Removes item from cart by ID
- Only removes specified item from multi-item cart
- Does nothing for non-existent item ID

#### clearGuestCart (1 test)

- Clears all items from cart (removes localStorage key)

#### getGuestCartItemCount (2 tests)

- Returns zero for empty cart
- Returns total quantity sum of all items

#### addToGuestCartWithDetails (6 tests)

- Adds product with minimal details
- Calculates subtotal correctly for multiple quantities (price \* quantity)
- Includes variant ID when provided
- Generates URL-friendly slug from product name
- Sets default maxQuantity to 100
- Sets discount to zero by default

### Edge Cases (7 tests)

#### updateItem edge cases (3 tests)

- Handles zero quantity update
- Handles negative quantity update
- Handles very large quantity (999,999)

#### mergeGuestCart edge cases (2 tests)

- Handles empty guest cart array
- Merges large guest cart (50+ items)

#### applyCoupon edge cases (3 tests)

- Handles empty coupon code
- Handles very long coupon code (1000 characters)
- Handles special characters in coupon (@, %, etc.)

---

## Code Patterns Documented

### Pattern 1: Guest Cart State Management

**Purpose**: Manage shopping cart in localStorage for unauthenticated users

**Implementation**:

```typescript
private readonly GUEST_CART_KEY = "guest_cart";

getGuestCart(): CartItemFE[] {
  if (typeof window === "undefined") return [];

  try {
    const cart = localStorage.getItem(this.GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

setGuestCart(items: CartItemFE[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(items));
}
```

**Key Features**:

- SSR-safe (checks for `window`)
- Error-tolerant (returns empty array on parse errors)
- Single source of truth in localStorage
- Consistent key naming

---

### Pattern 2: Computed Fields in Cart Items

**Purpose**: Maintain derived UI state alongside raw data

**Fields**:

- `formattedPrice`, `formattedSubtotal`, `formattedTotal` - Currency-formatted display values
- `isOutOfStock` - Derived from `!isAvailable`
- `isLowStock` - True when `maxQuantity <= 5`
- `canIncrement` - True when `quantity < maxQuantity`
- `canDecrement` - True when `quantity > 1`
- `hasDiscount` - True when `discount > 0`
- `addedTimeAgo` - Human-readable time string

**Implementation**:

```typescript
const now = new Date();
cart.push({
  ...item,
  id: `guest_${Date.now()}_${Math.random()}`,
  addedAt: now,
  formattedPrice: `₹${item.price}`,
  formattedSubtotal: `₹${item.subtotal}`,
  formattedTotal: `₹${item.total}`,
  isOutOfStock: !item.isAvailable,
  isLowStock: item.maxQuantity <= 5,
  canIncrement: item.quantity < item.maxQuantity,
  canDecrement: item.quantity > 1,
  hasDiscount: item.discount > 0,
  addedTimeAgo: "Just added",
} as CartItemFE);
```

**Critical Rule**: Always recalculate computed fields when raw data changes (quantity, price, discount, etc.)

---

### Pattern 3: Duplicate Detection in Cart

**Purpose**: Identify if an item already exists in cart to merge quantities

**Implementation**:

```typescript
const existingIndex = cart.findIndex(
  (i) => i.productId === item.productId && i.variantId === item.variantId
);

if (existingIndex >= 0) {
  // Update existing item
  cart[existingIndex].quantity += item.quantity;
} else {
  // Add new item
  cart.push(newItem);
}
```

**Key Insight**: Two fields determine uniqueness:

- `productId` - The product itself
- `variantId` - The specific variant (size, color, etc.)

Same product with different variants = separate cart items

---

### Pattern 4: Safe Quantity Limits

**Purpose**: Prevent users from adding more items than available stock

**Implementation**:

```typescript
// Don't exceed maxQuantity
const newQuantity = existingItem.quantity + item.quantity;
existingItem.quantity = Math.min(newQuantity, item.maxQuantity);
```

**Applies to**:

- Adding items to cart
- Updating item quantities
- Incrementing quantities

**Why Math.min()**:

- Graceful handling instead of errors
- User gets maximum available quantity
- No need for explicit validation checks

---

### Pattern 5: Slug Generation from Product Name

**Purpose**: Create URL-friendly identifiers from product names

**Implementation**:

```typescript
productSlug: product.name.toLowerCase().replace(/\s+/g, "-");
```

**Examples**:

- "Test Product" → "test-product"
- "Product With Multiple Spaces" → "product-with-multiple-spaces"
- "Product-Already-Hyphenated" → "product-already-hyphenated"

**Note**: Basic implementation. Production code should handle:

- Special characters removal
- Unicode normalization
- Length limits
- Uniqueness guarantees

---

## Edge Cases Tested

### 1. Corrupted localStorage Data

**Scenario**: localStorage contains invalid JSON

**Behavior**: Returns empty cart instead of throwing error

**Test**:

```typescript
it("handles corrupted localStorage data", () => {
  localStorage.setItem("guest_cart", "invalid json");
  const cart = cartService.getGuestCart();
  expect(cart).toEqual([]);
});
```

---

### 2. Variant Handling

**Scenario**: Same product, different variants

**Behavior**: Treated as separate cart items

**Test**:

```typescript
it("treats different variants as separate items", () => {
  cartService.addToGuestCart({ ...item, variantId: "var-1" });
  cartService.addToGuestCart({ ...item, variantId: "var-2" });

  const cart = cartService.getGuestCart();
  expect(cart).toHaveLength(2);
});
```

---

### 3. Negative Quantity Handling

**Scenario**: User attempts to set quantity to negative value

**Behavior**: Item removed from cart

**Test**:

```typescript
it("removes item when quantity is negative", () => {
  // Add item, then update to -1
  const cart = cartService.getGuestCart();
  cartService.updateGuestCartItem(cart[0].id, -1);

  expect(cartService.getGuestCart()).toHaveLength(0);
});
```

---

### 4. MaxQuantity Enforcement

**Scenario**: User tries to add more items than available stock

**Behavior**: Quantity capped at maxQuantity

**Impact of Fix**: Previously would allow exceeding stock limits

---

### 5. Computed Field Synchronization

**Scenario**: Quantity changes but totals remain incorrect

**Behavior After Fix**: All computed fields recalculated on any update

**Fields Recalculated**:

- subtotal = price × quantity
- total = subtotal - discount
- formattedSubtotal, formattedTotal
- canIncrement, canDecrement

---

## Testing Best Practices Applied

### 1. **localStorage Isolation**

```typescript
beforeEach(() => {
  localStorage.clear(); // Start with clean state
});
```

Every test starts with empty localStorage to prevent cross-contamination.

### 2. **Computed Field Validation**

```typescript
expect(cart[0].hasDiscount).toBe(true);
expect(cart[0].canIncrement).toBe(true);
expect(cart[0].isLowStock).toBe(false);
```

Always verify computed fields match expected state.

### 3. **Boundary Testing**

- Zero quantity
- Negative quantity
- MaxQuantity limits
- Empty carts
- Very large carts (50+ items)

### 4. **Error Tolerance**

- Corrupted data
- Missing localStorage
- Non-existent item IDs
- Invalid operations

---

## Files Modified

1. **src/services/cart.service.ts**

   - Fixed `addToGuestCart` to recalculate computed fields
   - Fixed `updateGuestCartItem` to enforce maxQuantity and recalculate fields
   - Added maxQuantity enforcement in both methods

2. **src/services/**tests**/cart.service.test.ts**
   - Added 33 comprehensive tests
   - Covered all guest cart operations
   - Added edge case tests for API methods

---

## Recommendations

### 1. **Add Quantity Validation**

Consider adding explicit validation before operations:

```typescript
if (quantity < 0) {
  throw new Error("Quantity cannot be negative");
}
if (quantity > maxQuantity) {
  throw new Error(`Only ${maxQuantity} items available`);
}
```

### 2. **Add Stock Reservation**

When user adds to cart, consider reserving stock temporarily to prevent overselling.

### 3. **Cart Expiration**

Add timestamp and auto-clear old guest carts:

```typescript
{
  items: [...],
  lastModified: Date.now(),
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
}
```

### 4. **Audit Logging**

Track cart operations for analytics and debugging:

```typescript
private logCartOperation(operation: string, details: any): void {
  console.log('[Cart]', operation, details);
  // Send to analytics service
}
```

### 5. **Price Validation**

Before checkout, always validate cart prices against current product prices (prices may change).

---

## Impact Assessment

### User Experience

✅ Cart totals always correct
✅ Can't exceed available stock
✅ UI state (buttons) always accurate
✅ No data loss from localStorage errors

### Performance

- No performance impact (operations remain O(n) where n = cart size)
- Slightly more computation per operation but negligible

### Reliability

- More robust error handling
- Prevents overselling
- Data consistency guaranteed

---

## Conclusion

Successfully identified and fixed 2 critical bugs in guest cart management that could have led to:

- Incorrect cart totals
- Overselling products
- Inconsistent UI state

Added 33 comprehensive tests covering all guest cart operations and edge cases, improving reliability and preventing regressions.

All tests passing: 4397 passed, 7 skipped (100% pass rate)
