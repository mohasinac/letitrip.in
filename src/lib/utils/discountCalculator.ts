/**
 * Advanced Discount Calculator for Coupon System
 * Supports Buy X Get Y, Tiered Discounts, Bundle Discounts, etc.
 */

import { SellerCoupon } from "@/types";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface DiscountResult {
  success: boolean;
  discountAmount: number;
  itemDiscounts: Array<{
    productId: string;
    quantity: number;
    discountPerItem: number;
    totalDiscount: number;
  }>;
  message: string;
  details?: string;
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
    // Sort items by price (ascending) to get cheapest first
    const sortedItems = [...items].sort((a, b) => a.price - b.price);

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const requiredQty = buyQty + getQty;

    if (totalQuantity < requiredQty) {
      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: `Add ${requiredQty - totalQuantity} more item${requiredQty - totalQuantity > 1 ? "s" : ""} to qualify for Buy ${buyQty} Get ${getQty} Free`,
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
        message: `Buy ${buyQty} Get ${getQty} Free applied`,
        details: `${sets} set${sets > 1 ? "s" : ""} - ${freeItemsCount} item${freeItemsCount > 1 ? "s" : ""} free`,
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
        details: `${getQty} item${getQty > 1 ? "s" : ""} free`,
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
        message: `Add ${requiredQty - totalQuantity} more item${requiredQty - totalQuantity > 1 ? "s" : ""} to qualify for Buy ${buyQty} Get ${getQty} at ${percentage}% Off`,
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
      message: `Buy ${buyQty} Get ${getQty} at ${percentage}% Off`,
      details: repeatOffer
        ? `${sets} set${sets > 1 ? "s" : ""} - ${discountedItemsCount} item${discountedItemsCount > 1 ? "s" : ""} discounted`
        : `${getQty} item${getQty > 1 ? "s" : ""} at ${percentage}% off`,
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

    // Sort tiers by minQuantity descending to find the highest applicable tier
    const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);

    // Find applicable tier
    const applicableTier = sortedTiers.find(
      (tier) =>
        totalQuantity >= tier.minQuantity &&
        (!tier.maxQuantity || totalQuantity <= tier.maxQuantity)
    );

    if (!applicableTier) {
      const lowestTier = tiers.reduce(
        (min, tier) =>
          !min || tier.minQuantity < min.minQuantity ? tier : min,
        null as any
      );
      const needed = lowestTier ? lowestTier.minQuantity - totalQuantity : 0;

      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: `Add ${needed} more item${needed > 1 ? "s" : ""} to qualify for tiered discount`,
      };
    }

    let discountAmount = 0;

    if (applicableTier.discountType === "percentage") {
      discountAmount = (cartSubtotal * applicableTier.discountValue) / 100;
    } else {
      discountAmount = Math.min(applicableTier.discountValue, cartSubtotal);
    }

    const tierRange =
      applicableTier.maxQuantity && applicableTier.maxQuantity < 999
        ? `${applicableTier.minQuantity}-${applicableTier.maxQuantity} items`
        : `${applicableTier.minQuantity}+ items`;

    return {
      success: true,
      discountAmount,
      itemDiscounts: [],
      message: `Tiered Discount Applied: ${applicableTier.discountValue}${applicableTier.discountType === "percentage" ? "%" : "₹"} off`,
      details: `${tierRange}: ${applicableTier.discountValue}${applicableTier.discountType === "percentage" ? "%" : "₹"} off`,
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
    const missingProducts: string[] = [];

    bundleProducts.forEach((bundleItem) => {
      const cartItem = items.find((item) => item.productId === bundleItem.productId);
      if (!cartItem || cartItem.quantity < bundleItem.quantity) {
        missingProducts.push(bundleItem.productId);
      }
    });

    if (missingProducts.length > 0) {
      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: "Add all required products to qualify for bundle discount",
        details: `Missing ${missingProducts.length} product${missingProducts.length > 1 ? "s" : ""}`,
      };
    }

    // Calculate discount on bundle items only
    const bundleSubtotal = bundleProducts.reduce((sum, bundleItem) => {
      const cartItem = items.find((item) => item.productId === bundleItem.productId);
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
      message: `Bundle Discount Applied: ${discountValue}${discountType === "percentage" ? "%" : "₹"} off`,
      details: `${bundleProducts.length} products bundled`,
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
    // Check minimum cart amount
    if (coupon.minimumAmount && cartSubtotal < coupon.minimumAmount) {
      return {
        success: false,
        discountAmount: 0,
        itemDiscounts: [],
        message: `Add ₹${(coupon.minimumAmount - cartSubtotal).toFixed(2)} more to use this coupon`,
      };
    }

    let result: DiscountResult;

    switch (coupon.type) {
      case "percentage":
        const percentageDiscount = (cartSubtotal * coupon.value) / 100;
        const cappedDiscount = coupon.maximumAmount
          ? Math.min(percentageDiscount, coupon.maximumAmount)
          : percentageDiscount;

        result = {
          success: true,
          discountAmount: cappedDiscount,
          itemDiscounts: [],
          message: `${coupon.value}% discount applied`,
          details: coupon.maximumAmount
            ? `Max discount: ₹${coupon.maximumAmount}`
            : undefined,
        };
        break;

      case "fixed":
        result = {
          success: true,
          discountAmount: Math.min(coupon.value, cartSubtotal),
          itemDiscounts: [],
          message: `₹${coupon.value} discount applied`,
        };
        break;

      case "free_shipping":
        result = {
          success: true,
          discountAmount: 0, // Shipping discount handled separately
          itemDiscounts: [],
          message: "Free shipping applied",
        };
        break;

      case "buy_x_get_y_cheapest":
        result = this.calculateBuyXGetYCheapest(
          items,
          coupon.advancedConfig?.buyQuantity || 2,
          coupon.advancedConfig?.getQuantity || 1,
          coupon.advancedConfig?.repeatOffer !== false
        );
        break;

      case "buy_x_get_y_percentage":
        result = this.calculateBuyXGetYPercentage(
          items,
          coupon.advancedConfig?.buyQuantity || 2,
          coupon.advancedConfig?.getQuantity || 1,
          coupon.advancedConfig?.getDiscountValue || 50,
          coupon.advancedConfig?.applyToLowest !== false,
          coupon.advancedConfig?.repeatOffer !== false
        );
        break;

      case "tiered_discount":
        result = this.calculateTieredDiscount(
          items,
          coupon.advancedConfig?.tiers || []
        );
        break;

      case "bundle_discount":
        result = this.calculateBundleDiscount(
          items,
          coupon.advancedConfig?.bundleProducts || [],
          coupon.advancedConfig?.bundleDiscountType || "percentage",
          coupon.advancedConfig?.bundleDiscountValue || 0
        );
        break;

      case "bogo":
      case "cart_discount":
        // Legacy types - handle as percentage
        result = {
          success: true,
          discountAmount: Math.min(
            (cartSubtotal * coupon.value) / 100,
            coupon.maximumAmount || Infinity
          ),
          itemDiscounts: [],
          message: `${coupon.value}% discount applied`,
        };
        break;

      default:
        result = {
          success: false,
          discountAmount: 0,
          itemDiscounts: [],
          message: "Invalid coupon type",
        };
    }

    // Apply maximum discount cap if set in advanced config
    if (
      result.success &&
      coupon.advancedConfig?.maxDiscountAmount &&
      result.discountAmount > coupon.advancedConfig.maxDiscountAmount
    ) {
      result.discountAmount = coupon.advancedConfig.maxDiscountAmount;
      result.details = `${result.details || ""} (Max: ₹${coupon.advancedConfig.maxDiscountAmount})`.trim();
    }

    return result;
  }

  /**
   * Get human-readable description of coupon
   */
  static getCouponDescription(coupon: SellerCoupon): string {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.value}% off${coupon.maximumAmount ? ` (max ₹${coupon.maximumAmount})` : ""}`;

      case "fixed":
        return `₹${coupon.value} off`;

      case "free_shipping":
        return "Free shipping";

      case "buy_x_get_y_cheapest":
        const buy = coupon.advancedConfig?.buyQuantity || 2;
        const get = coupon.advancedConfig?.getQuantity || 1;
        const repeat = coupon.advancedConfig?.repeatOffer !== false;
        return `Buy ${buy} Get ${get} Cheapest Free${repeat ? " (Repeatable)" : ""}`;

      case "buy_x_get_y_percentage":
        const buyQty = coupon.advancedConfig?.buyQuantity || 2;
        const getQty = coupon.advancedConfig?.getQuantity || 1;
        const discount = coupon.advancedConfig?.getDiscountValue || 50;
        return `Buy ${buyQty} Get ${getQty} at ${discount}% Off`;

      case "tiered_discount":
        const tiers = coupon.advancedConfig?.tiers || [];
        if (tiers.length === 0) return "Tiered discount";
        const tierDesc = tiers
          .sort((a, b) => a.minQuantity - b.minQuantity)
          .map((t) => {
            const range = t.maxQuantity
              ? `${t.minQuantity}-${t.maxQuantity}`
              : `${t.minQuantity}+`;
            return `${range}: ${t.discountValue}${t.discountType === "percentage" ? "%" : "₹"}`;
          })
          .join(", ");
        return `Tiered: ${tierDesc}`;

      case "bundle_discount":
        const bundleCount = coupon.advancedConfig?.bundleProducts?.length || 0;
        const bundleDiscount = coupon.advancedConfig?.bundleDiscountValue || 0;
        const bundleType = coupon.advancedConfig?.bundleDiscountType || "percentage";
        return `Bundle ${bundleCount} products: ${bundleDiscount}${bundleType === "percentage" ? "%" : "₹"} off`;

      default:
        return coupon.description || "Discount applied";
    }
  }
}
