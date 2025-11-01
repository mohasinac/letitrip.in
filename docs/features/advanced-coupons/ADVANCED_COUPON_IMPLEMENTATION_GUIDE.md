# Advanced Coupon System Implementation Guide

## 🎯 New Coupon Types to Implement

### Current Types

- `percentage` - Percentage discount
- `fixed` - Fixed amount discount
- `free_shipping` - Free shipping
- `bogo` - Buy One Get One (basic)
- `cart_discount` - Cart-level discount

### New Enhanced Types

1. **`buy_x_get_y`** - Buy X items, get Y items free/discounted
2. **`buy_x_get_y_cheapest_free`** - Buy X, get Y cheapest items free
3. **`buy_x_get_y_percentage`** - Buy X, get Y items at percentage off
4. **`tiered_discount`** - Different discounts for different quantities
5. **`bundle_discount`** - Discount when buying specific product combinations

---

## 📋 Implementation Plan

### Phase 1: Update Type Definitions ✅

File: `src/types/index.ts`

### Phase 2: Update Coupon Form ✅

File: `src/app/seller/coupons/new/page.tsx`

### Phase 3: Create Discount Calculator ✅

File: `src/lib/utils/discountCalculator.ts`

### Phase 4: Update API Routes ✅

Files:

- `src/app/api/seller/coupons/route.ts`
- `src/app/api/checkout/apply-coupon/route.ts`

### Phase 5: Update UI Display ✅

Files:

- `src/app/seller/coupons/page.tsx`
- Cart/Checkout components

---

## 🔧 Detailed Implementation

### 1. Enhanced Coupon Type Definition

```typescript
export interface SellerCoupon {
  // ...existing fields...

  type:
    | "percentage"
    | "fixed"
    | "free_shipping"
    | "buy_x_get_y" // NEW
    | "buy_x_get_y_cheapest" // NEW
    | "buy_x_get_y_percentage" // NEW
    | "tiered_discount" // NEW
    | "bundle_discount" // NEW
    | "cart_discount";

  value: number;

  // NEW: Advanced Discount Configuration
  advancedConfig?: {
    // For Buy X Get Y types
    buyQuantity?: number; // Buy X items
    getQuantity?: number; // Get Y items
    getDiscountType?: "free" | "percentage" | "fixed";
    getDiscountValue?: number; // Percentage or fixed amount
    applyToLowest?: boolean; // Apply to cheapest items?
    repeatOffer?: boolean; // Repeat for multiples (e.g., buy 2 get 1, buy 4 get 2)?

    // For Tiered Discounts
    tiers?: Array<{
      minQuantity: number;
      maxQuantity?: number;
      discountType: "percentage" | "fixed";
      discountValue: number;
    }>;

    // For Bundle Discounts
    bundleProducts?: Array<{
      productId: string;
      quantity: number;
    }>;
    bundleDiscountType?: "percentage" | "fixed";
    bundleDiscountValue?: number;

    // Maximum discount limit
    maxDiscountAmount?: number;
  };
}
```

### 2. Discount Calculator Utility

```typescript
// src/lib/utils/discountCalculator.ts

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface DiscountResult {
  success: boolean;
  discountAmount: number;
  itemDiscounts: Array<{
    productId: string;
    quantity: number;
    discountPerItem: number;
    totalDiscount: number;
  }>;
  message: string;
}

export class DiscountCalculator {
  /**
   * Buy X Get Y - Cheapest Items Free
   * Example: Buy 2 Get 1 Cheapest Free
   */
  static calculateBuyXGetYCheapest(
    items: CartItem[],
    buyQty: number,
    getQty: number,
    repeatOffer: boolean = true
  ): DiscountResult {
    // Sort items by price (ascending)
    const sortedItems = [...items].sort((a, b) => a.price - b.price);

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const requiredQty = buyQty + getQty;

    if (totalQuantity < requiredQty) {
      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: `Add ${requiredQty - totalQuantity} more items to qualify`,
      };
    }

    let discountAmount = 0;
    const itemDiscounts: any[] = [];

    if (repeatOffer) {
      // Calculate how many complete sets qualify
      const sets = Math.floor(totalQuantity / requiredQty);
      const freeItemsCount = sets * getQty;

      // Apply discount to cheapest items
      let remainingFree = freeItemsCount;

      for (const item of sortedItems) {
        if (remainingFree === 0) break;

        const freeQty = Math.min(item.quantity, remainingFree);
        const itemDiscount = freeQty * item.price;

        discountAmount += itemDiscount;
        itemDiscounts.push({
          productId: item.productId,
          quantity: freeQty,
          discountPerItem: item.price,
          totalDiscount: itemDiscount,
        });

        remainingFree -= freeQty;
      }

      return {
        success: true,
        discountAmount,
        itemDiscounts,
        message: `Buy ${buyQty} Get ${getQty} applied (${sets} sets)`,
      };
    } else {
      // Single application only
      let remainingFree = getQty;

      for (const item of sortedItems) {
        if (remainingFree === 0) break;

        const freeQty = Math.min(item.quantity, remainingFree);
        const itemDiscount = freeQty * item.price;

        discountAmount += itemDiscount;
        itemDiscounts.push({
          productId: item.productId,
          quantity: freeQty,
          discountPerItem: item.price,
          totalDiscount: itemDiscount,
        });

        remainingFree -= freeQty;
      }

      return {
        success: true,
        discountAmount,
        itemDiscounts,
        message: `Buy ${buyQty} Get ${getQty} Cheapest Free applied`,
      };
    }
  }

  /**
   * Buy X Get Y - At Percentage Off
   * Example: Buy 3 Get 2 at 50% Off
   */
  static calculateBuyXGetYPercentage(
    items: CartItem[],
    buyQty: number,
    getQty: number,
    percentage: number,
    applyToLowest: boolean = true,
    repeatOffer: boolean = true
  ): DiscountResult {
    const sortedItems = applyToLowest
      ? [...items].sort((a, b) => a.price - b.price)
      : [...items];

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const requiredQty = buyQty + getQty;

    if (totalQuantity < requiredQty) {
      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: `Add ${requiredQty - totalQuantity} more items to qualify`,
      };
    }

    let discountAmount = 0;
    const itemDiscounts: any[] = [];

    const sets = repeatOffer ? Math.floor(totalQuantity / requiredQty) : 1;
    const discountedItemsCount = sets * getQty;

    let remainingDiscounted = discountedItemsCount;

    for (const item of sortedItems) {
      if (remainingDiscounted === 0) break;

      const discountQty = Math.min(item.quantity, remainingDiscounted);
      const discountPerItem = (item.price * percentage) / 100;
      const itemDiscount = discountQty * discountPerItem;

      discountAmount += itemDiscount;
      itemDiscounts.push({
        productId: item.productId,
        quantity: discountQty,
        discountPerItem,
        totalDiscount: itemDiscount,
      });

      remainingDiscounted -= discountQty;
    }

    return {
      success: true,
      discountAmount,
      itemDiscounts,
      message: `Buy ${buyQty} Get ${getQty} at ${percentage}% off applied`,
    };
  }

  /**
   * Tiered Discount
   * Example: 2-3 items: 10% off, 4-5 items: 20% off, 6+ items: 30% off
   */
  static calculateTieredDiscount(
    items: CartItem[],
    tiers: Array<{
      minQuantity: number;
      maxQuantity?: number;
      discountType: "percentage" | "fixed";
      discountValue: number;
    }>
  ): DiscountResult {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Find applicable tier
    const applicableTier = tiers
      .sort((a, b) => b.minQuantity - a.minQuantity)
      .find(
        (tier) =>
          totalQuantity >= tier.minQuantity &&
          (!tier.maxQuantity || totalQuantity <= tier.maxQuantity)
      );

    if (!applicableTier) {
      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: `Add more items to qualify for tiered discount`,
      };
    }

    let discountAmount = 0;

    if (applicableTier.discountType === "percentage") {
      discountAmount = (cartSubtotal * applicableTier.discountValue) / 100;
    } else {
      discountAmount = applicableTier.discountValue;
    }

    return {
      success: true,
      discountAmount,
      itemDiscounts: [],
      message: `${totalQuantity} items: ${applicableTier.discountValue}${
        applicableTier.discountType === "percentage" ? "%" : "₹"
      } off applied`,
    };
  }

  /**
   * Bundle Discount
   * Example: Buy Product A + Product B together, get 15% off
   */
  static calculateBundleDiscount(
    items: CartItem[],
    bundleProducts: Array<{ productId: string; quantity: number }>,
    discountType: "percentage" | "fixed",
    discountValue: number
  ): DiscountResult {
    // Check if cart contains all bundle products with required quantities
    const bundleComplete = bundleProducts.every((bundleItem) => {
      const cartItem = items.find(
        (item) => item.productId === bundleItem.productId
      );
      return cartItem && cartItem.quantity >= bundleItem.quantity;
    });

    if (!bundleComplete) {
      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: "Add all bundle products to qualify",
      };
    }

    // Calculate discount on bundle items only
    const bundleSubtotal = bundleProducts.reduce((sum, bundleItem) => {
      const cartItem = items.find(
        (item) => item.productId === bundleItem.productId
      );
      return sum + (cartItem ? cartItem.price * bundleItem.quantity : 0);
    }, 0);

    let discountAmount = 0;

    if (discountType === "percentage") {
      discountAmount = (bundleSubtotal * discountValue) / 100;
    } else {
      discountAmount = Math.min(discountValue, bundleSubtotal);
    }

    return {
      success: true,
      discountAmount,
      itemDiscounts: [],
      message: `Bundle discount applied: ${discountValue}${
        discountType === "percentage" ? "%" : "₹"
      } off`,
    };
  }

  /**
   * Main coupon application logic
   */
  static applyCoupon(
    coupon: SellerCoupon,
    items: CartItem[],
    cartSubtotal: number
  ): DiscountResult {
    switch (coupon.type) {
      case "percentage":
        return {
          success: true,
          discountAmount: Math.min(
            (cartSubtotal * coupon.value) / 100,
            coupon.maximumAmount || Infinity
          ),
          itemDiscounts: [],
          message: `${coupon.value}% discount applied`,
        };

      case "fixed":
        return {
          success: true,
          discountAmount: Math.min(coupon.value, cartSubtotal),
          itemDiscounts: [],
          message: `₹${coupon.value} discount applied`,
        };

      case "buy_x_get_y_cheapest":
        return this.calculateBuyXGetYCheapest(
          items,
          coupon.advancedConfig?.buyQuantity || 2,
          coupon.advancedConfig?.getQuantity || 1,
          coupon.advancedConfig?.repeatOffer !== false
        );

      case "buy_x_get_y_percentage":
        return this.calculateBuyXGetYPercentage(
          items,
          coupon.advancedConfig?.buyQuantity || 2,
          coupon.advancedConfig?.getQuantity || 1,
          coupon.advancedConfig?.getDiscountValue || 50,
          coupon.advancedConfig?.applyToLowest !== false,
          coupon.advancedConfig?.repeatOffer !== false
        );

      case "tiered_discount":
        return this.calculateTieredDiscount(
          items,
          coupon.advancedConfig?.tiers || []
        );

      case "bundle_discount":
        return this.calculateBundleDiscount(
          items,
          coupon.advancedConfig?.bundleProducts || [],
          coupon.advancedConfig?.bundleDiscountType || "percentage",
          coupon.advancedConfig?.bundleDiscountValue || 0
        );

      default:
        return {
          success: false,
          discountAmount: 0,
          itemDiscounts: [],
          message: "Invalid coupon type",
        };
    }
  }
}
```

---

## 📝 Usage Examples

### Example 1: Buy 2 Get 1 Cheapest Free

```typescript
const coupon = {
  type: "buy_x_get_y_cheapest",
  advancedConfig: {
    buyQuantity: 2,
    getQuantity: 1,
    repeatOffer: true, // Buy 4 get 2, buy 6 get 3, etc.
  },
};
```

### Example 2: Buy 3 Get 2 at 50% Off

```typescript
const coupon = {
  type: "buy_x_get_y_percentage",
  advancedConfig: {
    buyQuantity: 3,
    getQuantity: 2,
    getDiscountValue: 50,
    applyToLowest: true, // Apply to cheapest 2 items
    repeatOffer: true,
  },
};
```

### Example 3: Tiered Discount

```typescript
const coupon = {
  type: "tiered_discount",
  advancedConfig: {
    tiers: [
      {
        minQuantity: 2,
        maxQuantity: 3,
        discountType: "percentage",
        discountValue: 10,
      },
      {
        minQuantity: 4,
        maxQuantity: 5,
        discountType: "percentage",
        discountValue: 20,
      },
      { minQuantity: 6, discountType: "percentage", discountValue: 30 },
    ],
  },
};
```

### Example 4: Bundle Discount

```typescript
const coupon = {
  type: "bundle_discount",
  advancedConfig: {
    bundleProducts: [
      { productId: "prod123", quantity: 1 },
      { productId: "prod456", quantity: 1 },
    ],
    bundleDiscountType: "percentage",
    bundleDiscountValue: 15,
  },
};
```

---

## 🎨 UI Updates Needed

1. **Coupon Type Selector** - Add new options with descriptions
2. **Advanced Config Section** - Show/hide based on coupon type
3. **Preview/Calculator** - Show examples of discount calculations
4. **Coupon Display** - Show human-readable descriptions in cart

---

## ✅ Next Steps

1. Update `src/types/index.ts` with new types
2. Create `src/lib/utils/discountCalculator.ts`
3. Update coupon form UI to support new types
4. Update API routes to use new calculator
5. Test with various cart scenarios
6. Update coupon list display
7. Add frontend cart integration

Would you like me to proceed with the implementation?
