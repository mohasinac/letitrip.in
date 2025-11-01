# Advanced Coupon Form - Visual Guide 🎨

## What You Should See Now

When you select an advanced coupon type in the form, you'll now see additional configuration sections appear below the "Discount Value" field.

---

## 1. Buy X Get Y Cheapest Free / Buy X Get Y at Discount

**When you select**: "Buy X Get Y Cheapest Free" OR "Buy X Get Y at Discount"

**You'll see**:

```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 Buy X Get Y Configuration                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Buy Quantity (X) *          Get Quantity (Y) *              │
│  ┌────────┐                  ┌────────┐                      │
│  │   2    │                  │   1    │                      │
│  └────────┘                  └────────┘                      │
│  Customer must buy           Customer gets this              │
│  this many items             many discounted                 │
│                                                               │
│  [Only for "at Discount" type:]                              │
│  Discount Type               Discount Value                  │
│  ┌─────────────────┐         ┌────────┐                      │
│  │ Percentage Off ▼│         │  50    │                      │
│  └─────────────────┘         └────────┘                      │
│                                                               │
│  ☑ Apply to cheapest items (recommended)                     │
│  ☑ Repeat offer (e.g., Buy 2 Get 1 → Buy 4 Get 2)           │
│                                                               │
│  ℹ️ Example: Buy 2 Get 1 Cheapest Free (Repeating)          │
└─────────────────────────────────────────────────────────────┘
```

**Fields**:

- **Buy Quantity (X)**: How many items customer must purchase (e.g., 2)
- **Get Quantity (Y)**: How many items get discounted (e.g., 1)
- **Discount Type** (only for "at Discount"): Free / Percentage Off / Fixed Amount Off
- **Discount Value** (only if not Free): The discount amount
- **Apply to cheapest items**: Checkbox - applies discount to lowest priced items
- **Repeat offer**: Checkbox - repeats the offer (Buy 4 Get 2, Buy 6 Get 3, etc.)

---

## 2. Tiered Discount

**When you select**: "Tiered Discount (More Items = More Discount)"

**You'll see**:

```
┌─────────────────────────────────────────────────────────────┐
│ 📈 Tiered Discount Configuration          [+ Add Tier]      │
├─────────────────────────────────────────────────────────────┤
│ Define different discount levels based on cart quantity.     │
│ Higher quantities get better discounts.                      │
│                                                               │
│ ┌──────────────── Tier 1 ─────────────────┐                 │
│ │ Min Qty │ Max Qty │ Type │ Value │ 🗑️   │                 │
│ │    1    │    4    │  %   │  10   │      │                 │
│ └─────────────────────────────────────────┘                 │
│                                                               │
│ ┌──────────────── Tier 2 ─────────────────┐                 │
│ │ Min Qty │ Max Qty │ Type │ Value │ 🗑️   │                 │
│ │    5    │    9    │  %   │  20   │      │                 │
│ └─────────────────────────────────────────┘                 │
│                                                               │
│ ┌──────────────── Tier 3 ─────────────────┐                 │
│ │ Min Qty │ Max Qty │ Type │ Value │ 🗑️   │                 │
│ │   10    │    0    │  %   │  30   │      │                 │
│ └─────────────────────────────────────────┘                 │
│                                                               │
│ (Max Qty = 0 means unlimited)                                │
└─────────────────────────────────────────────────────────────┘
```

**Fields per Tier**:

- **Min Quantity**: Minimum items for this tier
- **Max Quantity**: Maximum items (0 = unlimited)
- **Type**: % (Percentage) or ₹ (Fixed amount)
- **Value**: The discount value
- **🗑️ Button**: Remove this tier

**Example**:

- 1-4 items = 10% off
- 5-9 items = 20% off
- 10+ items = 30% off

---

## 3. Bundle Discount

**When you select**: "Bundle Discount (Buy Products Together)"

**You'll see**:

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 Bundle Discount Configuration                             │
├─────────────────────────────────────────────────────────────┤
│ Define specific products that must be purchased together     │
│ to qualify for this discount.                                │
│                                                               │
│  Discount Type               Discount Value                  │
│  ┌─────────────────┐         ┌────────┐                      │
│  │ Percentage Off ▼│         │  25    │                      │
│  └─────────────────┘         └────────┘                      │
│                                                               │
│  Bundle Products                                             │
│  ┌─────────────────────────────────────────┐                │
│  │         📦                                │                │
│  │   Product selector coming soon            │                │
│  │   Bundle products can be configured       │                │
│  │   via API for now                         │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

**Fields**:

- **Discount Type**: Percentage Off or Fixed Amount Off
- **Discount Value**: The discount amount
- **Bundle Products**: Product selector (coming soon - currently via API)

---

## How to Test

### Test 1: Buy 2 Get 1 Cheapest Free

1. Navigate to: http://localhost:3000/seller/coupons/new
2. Fill in Code: "BUY2GET1"
3. Fill in Name: "Buy 2 Get 1 Free"
4. Select Discount Type: "Buy X Get Y Cheapest Free"
5. **NEW SECTION APPEARS** ✨
6. Set Buy Quantity: 2
7. Set Get Quantity: 1
8. Check "Apply to cheapest items"
9. Check "Repeat offer"
10. Click "Create Coupon"

### Test 2: Tiered Discount

1. Navigate to: http://localhost:3000/seller/coupons/new
2. Fill in Code: "TIER20"
3. Fill in Name: "Volume Discount"
4. Select Discount Type: "Tiered Discount (More Items = More Discount)"
5. **NEW SECTION APPEARS** ✨
6. Click "+ Add Tier" button
7. Fill Tier 1: Min 1, Max 4, Type %, Value 10
8. Click "+ Add Tier" again
9. Fill Tier 2: Min 5, Max 9, Type %, Value 20
10. Click "+ Add Tier" again
11. Fill Tier 3: Min 10, Max 0, Type %, Value 30
12. Click "Create Coupon"

### Test 3: Buy 3 Get 2 at 50% Off

1. Navigate to: http://localhost:3000/seller/coupons/new
2. Fill in Code: "BUY3GET2"
3. Fill in Name: "Buy 3 Get 2 Half Off"
4. Select Discount Type: "Buy X Get Y at Discount"
5. **NEW SECTION APPEARS** ✨
6. Set Buy Quantity: 3
7. Set Get Quantity: 2
8. Set Discount Type: "Percentage Off"
9. Set Discount Value: 50
10. Check "Apply to cheapest items"
11. Click "Create Coupon"

---

## Styling Features

The advanced configuration sections have:

- ✅ **Highlighted border** - Light primary color border (border-2 border-primary/20)
- ✅ **Background color** - Subtle background (bg-surface/50)
- ✅ **Icons** - Visual indicators (🎁 Gift, 📈 TrendingUp, 📦 Package)
- ✅ **Helper text** - Explanations under each field
- ✅ **Live preview** - Shows example of what customer will see
- ✅ **Responsive design** - Works on mobile and desktop

---

## Troubleshooting

### If sections don't appear:

1. **Refresh the page** - Hard refresh (Ctrl+Shift+R)
2. **Check browser console** - Look for JavaScript errors
3. **Verify dropdown selection** - Make sure you selected an advanced type
4. **Check dev server** - Ensure it's running: `npm run dev`

### If form doesn't submit:

1. Fill all required fields (marked with \*)
2. Check browser console for validation errors
3. Ensure dates are valid (End Date must be after Start Date)
4. Verify all numeric fields have valid numbers

---

## Next Steps After Creating Coupon

After successfully creating an advanced coupon:

1. **View in list**: Navigate to `/seller/coupons`
2. **Check description**: Should show smart description like "Buy 2 Get 1 Cheapest Free (Repeating)"
3. **Edit coupon**: Click Edit to modify advanced config
4. **Test validation**: Use the `/api/seller/coupons/validate` endpoint with sample cart

---

## API Integration

Once coupon is created, you can validate it:

```bash
POST /api/seller/coupons/validate
Content-Type: application/json
Authorization: Bearer {your-token}

{
  "couponCode": "BUY2GET1",
  "cartItems": [
    { "productId": "1", "name": "Item A", "price": 100, "quantity": 1, "subtotal": 100 },
    { "productId": "2", "name": "Item B", "price": 200, "quantity": 1, "subtotal": 200 },
    { "productId": "3", "name": "Item C", "price": 150, "quantity": 1, "subtotal": 150 }
  ],
  "cartSubtotal": 450
}
```

Expected response:

```json
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

**Status**: ✅ Advanced UI is now live!  
**Last Updated**: November 1, 2025  
**Browser Support**: Chrome, Firefox, Safari, Edge
