# Advanced Coupon System - Quick Reference Card 📋

## 🎯 Coupon Types Quick Reference

| Type                        | Code                     | Description                      | Example                     |
| --------------------------- | ------------------------ | -------------------------------- | --------------------------- |
| **Percentage**              | `percentage`             | X% off entire cart               | 20% off                     |
| **Fixed**                   | `fixed`                  | Fixed amount off                 | ₹500 off                    |
| **Free Shipping**           | `free_shipping`          | Free delivery                    | Free shipping               |
| **BOGO**                    | `bogo`                   | Buy one get one                  | Traditional BOGO            |
| **Cart Discount**           | `cart_discount`          | Cart-level discount              | ₹100 off cart               |
| **Buy X Get Y Free** ⭐     | `buy_x_get_y_cheapest`   | Buy X items, get Y cheapest free | Buy 2 Get 1 Free            |
| **Buy X Get Y Discount** ⭐ | `buy_x_get_y_percentage` | Buy X items, get Y at discount   | Buy 3 Get 2 at 50% Off      |
| **Tiered Discount** ⭐      | `tiered_discount`        | More items = better discount     | 1-4: 5%, 5-9: 10%, 10+: 20% |
| **Bundle Discount** ⭐      | `bundle_discount`        | Buy products together            | Buy A+B+C = 25% off         |

⭐ = New advanced types

---

## 📖 Advanced Config Structure

### Buy X Get Y (Cheapest/Percentage)

```typescript
advancedConfig: {
  buyQuantity: 2,              // Buy this many
  getQuantity: 1,              // Get this many discounted
  getDiscountType: "free",     // "free" | "percentage" | "fixed"
  getDiscountValue: 0,         // 0 for free, % or amount otherwise
  applyToLowest: true,         // Apply to cheapest items
  repeatOffer: true            // Repeat (Buy 4 Get 2, Buy 6 Get 3)
}
```

### Tiered Discount

```typescript
advancedConfig: {
  tiers: [
    { minQuantity: 1, discountType: "percentage", discountValue: 10 },
    { minQuantity: 5, discountType: "percentage", discountValue: 20 },
    { minQuantity: 10, discountType: "percentage", discountValue: 30 },
  ];
}
```

### Bundle Discount

```typescript
advancedConfig: {
  bundleProducts: [
    { productId: "prod-1", quantity: 1 },
    { productId: "prod-2", quantity: 1 }
  ],
  bundleDiscountType: "percentage",  // "percentage" | "fixed"
  bundleDiscountValue: 25,
  maxDiscountAmount: 1000  // Optional cap
}
```

---

## 🔌 API Quick Reference

### Create Coupon

```bash
POST /api/seller/coupons
Authorization: Bearer {token}

{
  "code": "BUY2GET1",
  "name": "Buy 2 Get 1 Free",
  "type": "buy_x_get_y_cheapest",
  "value": 0,
  "advancedConfig": {
    "buyQuantity": 2,
    "getQuantity": 1,
    "applyToLowest": true,
    "repeatOffer": true
  }
}
```

### Validate Coupon

```bash
POST /api/seller/coupons/validate
Authorization: Bearer {token}

{
  "couponCode": "BUY2GET1",
  "cartItems": [
    { "productId": "1", "name": "Item A", "price": 100, "quantity": 1, "subtotal": 100 },
    { "productId": "2", "name": "Item B", "price": 200, "quantity": 1, "subtotal": 200 }
  ],
  "cartSubtotal": 300
}

Response:
{
  "success": true,
  "discount": {
    "amount": 100,
    "itemDiscounts": [...]
  },
  "message": "Coupon applied successfully"
}
```

---

## 💻 Code Usage Examples

### Import Discount Calculator

```typescript
import { DiscountCalculator } from "@/lib/utils/discountCalculator";
import type { CartItem, DiscountResult } from "@/lib/utils/discountCalculator";
```

### Apply Coupon

```typescript
const cartItems: CartItem[] = [
  { productId: "1", name: "Product A", price: 100, quantity: 2, subtotal: 200 },
  { productId: "2", name: "Product B", price: 150, quantity: 1, subtotal: 150 },
];

const result = DiscountCalculator.applyCoupon(
  coupon,
  cartItems,
  350 // Cart subtotal
);

if (result.success) {
  console.log(`Discount: ₹${result.discountAmount}`);
  console.log(`Message: ${result.message}`);
  console.log(`Details: ${result.details}`);
}
```

### Get Coupon Description

```typescript
const description = DiscountCalculator.getCouponDescription(coupon);
// Returns: "Buy 2 Get 1 Cheapest Free (Repeating)"
```

---

## 🎨 UI Form Fields Reference

### Buy X Get Y Fields

```tsx
<input
  type="number"
  value={formData.advancedConfig.buyQuantity}
  onChange={(e) => setFormData({
    ...formData,
    advancedConfig: {
      ...formData.advancedConfig,
      buyQuantity: parseInt(e.target.value)
    }
  })}
/>

<input
  type="checkbox"
  checked={formData.advancedConfig.repeatOffer}
  onChange={(e) => setFormData({
    ...formData,
    advancedConfig: {
      ...formData.advancedConfig,
      repeatOffer: e.target.checked
    }
  })}
/>
```

### Tiered Discount - Add Tier

```tsx
<button
  onClick={() => {
    setFormData({
      ...formData,
      advancedConfig: {
        ...formData.advancedConfig,
        tiers: [
          ...(formData.advancedConfig.tiers || []),
          { minQuantity: 1, discountType: "percentage", discountValue: 0 },
        ],
      },
    });
  }}
>
  Add Tier
</button>
```

---

## 🧮 Calculation Logic Reference

### Buy X Get Y - Cheapest Free

1. **Group items by price**
2. **Calculate sets**: `totalQuantity / (buyQuantity + getQuantity)`
3. **Sort items by price (ascending)**
4. **Apply free discount to cheapest Y items per set**
5. **If repeatOffer**: Process remaining items

### Tiered Discount

1. **Count total cart quantity**
2. **Find applicable tier** (highest minQuantity ≤ cart quantity)
3. **Calculate discount**: `subtotal * (discountValue / 100)`
4. **Apply max cap if set**

### Bundle Discount

1. **Check all bundle products in cart**
2. **Validate minimum quantities**
3. **Calculate bundle total**
4. **Apply discount**: `bundleTotal * (discountValue / 100)`
5. **Return discount amount**

---

## 📂 File Locations

| Component                   | Path                                              |
| --------------------------- | ------------------------------------------------- |
| **Type Definitions**        | `src/types/index.ts`                              |
| **Calculator**              | `src/lib/utils/discountCalculator.ts`             |
| **Create Form**             | `src/app/seller/coupons/new/page.tsx`             |
| **List Page**               | `src/app/seller/coupons/page.tsx`                 |
| **API - List/Create**       | `src/app/api/seller/coupons/route.ts`             |
| **API - Get/Update/Delete** | `src/app/api/seller/coupons/[id]/route.ts`        |
| **API - Validate**          | `src/app/api/seller/coupons/validate/route.ts`    |
| **API - Toggle Status**     | `src/app/api/seller/coupons/[id]/toggle/route.ts` |

---

## 🔍 Debugging Tips

### Check Coupon Config

```typescript
console.log("Coupon Type:", coupon.type);
console.log("Advanced Config:", coupon.advancedConfig);
```

### Debug Discount Calculation

```typescript
const result = DiscountCalculator.applyCoupon(coupon, items, subtotal);
console.log("Success:", result.success);
console.log("Discount:", result.discountAmount);
console.log("Message:", result.message);
console.log("Details:", result.details);
console.log("Item Discounts:", result.itemDiscounts);
```

### Common Issues

1. **No discount applied**

   - Check `minimumAmount` requirement
   - Verify cart has required items (bundle)
   - Check if coupon is active

2. **Wrong discount amount**

   - Verify `buyQuantity` and `getQuantity` values
   - Check `applyToLowest` setting
   - Verify tier `minQuantity` values

3. **UI not showing**
   - Check coupon `type` matches exactly
   - Verify conditional rendering logic
   - Check `advancedConfig` is initialized

---

## ✅ Testing Checklist

### Basic Validation

- [ ] Coupon code is unique
- [ ] Dates are valid (start < end)
- [ ] Discount values are positive
- [ ] Form submits successfully

### Buy X Get Y

- [ ] Cheapest items are discounted
- [ ] Repeating offers work correctly
- [ ] Partial sets handled properly
- [ ] Different discount types work

### Tiered Discount

- [ ] Correct tier is selected
- [ ] Edge cases (exact quantity match)
- [ ] Percentage and fixed amounts work
- [ ] Multiple tiers work correctly

### Bundle Discount

- [ ] All products must be in cart
- [ ] Quantity requirements validated
- [ ] Discount applies to bundle only
- [ ] Works with multiple bundles

---

## 🚀 Quick Start

### 1. Create a Simple Coupon

```bash
# Navigate to seller coupons
http://localhost:3000/seller/coupons/new

# Select type: "Buy X Get Y Cheapest Free"
# Fill: Buy 2, Get 1
# Enable: Repeat offer
# Save
```

### 2. Test in Cart

```typescript
// In your cart component
const validateCoupon = async (code: string) => {
  const response = await fetch("/api/seller/coupons/validate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      couponCode: code,
      cartItems: cart.items,
      cartSubtotal: cart.total,
    }),
  });

  const result = await response.json();
  if (result.success) {
    setDiscount(result.discount.amount);
  }
};
```

### 3. Display Results

```tsx
{
  discount > 0 && (
    <div>
      <p>Coupon Applied: {coupon.code}</p>
      <p>Discount: ₹{discount}</p>
      <p>Final Total: ₹{total - discount}</p>
    </div>
  );
}
```

---

## 📞 Support

For issues or questions:

1. Check `ADVANCED_COUPON_SYSTEM_COMPLETE.md` for detailed docs
2. Review `ADVANCED_COUPON_IMPLEMENTATION_GUIDE.md` for examples
3. Check browser console for errors
4. Verify API responses in Network tab

---

**Version**: 1.0.0  
**Last Updated**: November 1, 2025  
**Status**: Production Ready ✅
