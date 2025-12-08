/**
 * CART TRANSFORMATION TESTS
 * Tests for FE/BE transformation functions
 */

import { Timestamp } from "firebase/firestore";
import { CartBE, CartItemBE } from "../../backend/cart.types";
import { AddToCartFormFE } from "../../frontend/cart.types";
import {
  createEmptyCart,
  toBEAddToCartRequest,
  toFECart,
  toFECartSummary,
} from "../cart.transforms";

// Helper to transform cart item (internal function, testing through toFECart)
function toFECartItem(itemBE: CartItemBE) {
  const cart: CartBE = {
    id: "test-cart",
    userId: "test-user",
    items: [itemBE],
    itemCount: itemBE.quantity,
    subtotal: itemBE.subtotal,
    discount: itemBE.discount,
    tax: 0,
    shipping: 0,
    total: itemBE.total,
    expiresAt: null,
    createdAt: itemBE.addedAt,
    updatedAt: itemBE.addedAt,
  };
  return toFECart(cart).items[0];
}

describe("Cart Transformations", () => {
  const mockTimestamp = Timestamp.fromDate(new Date(Date.now() - 3600000)); // 1 hour ago
  const mockExpiresTimestamp = Timestamp.fromDate(
    new Date(Date.now() + 7200000)
  ); // 2 hours from now

  const mockCartItemBE: CartItemBE = {
    id: "item-123",
    productId: "prod-123",
    productName: "Test Product",
    productSlug: "test-product",
    productImage: "https://example.com/product.jpg",
    variantId: null,
    variantName: null,
    sku: "SKU-123",
    price: 1000,
    quantity: 2,
    maxQuantity: 10,
    subtotal: 2000,
    discount: 200,
    total: 1800,
    shopId: "shop-123",
    shopName: "Test Shop",
    isAvailable: true,
    addedAt: mockTimestamp,
  };

  const mockCartBE: CartBE = {
    id: "cart-123",
    userId: "user-123",
    items: [mockCartItemBE],
    itemCount: 2,
    subtotal: 2000,
    discount: 200,
    tax: 180,
    total: 2030,
    expiresAt: mockExpiresTimestamp,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  describe("toFECartItem", () => {
    it("should transform backend cart item to frontend", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.id).toBe("item-123");
      expect(result.productId).toBe("prod-123");
      expect(result.productName).toBe("Test Product");
      expect(result.productSlug).toBe("test-product");
      expect(result.sku).toBe("SKU-123");
      expect(result.price).toBe(1000);
      expect(result.quantity).toBe(2);
      expect(result.maxQuantity).toBe(10);
      expect(result.subtotal).toBe(2000);
      expect(result.discount).toBe(200);
      expect(result.total).toBe(1800);
    });

    it("should format prices correctly", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.formattedPrice).toContain("1,000");
      expect(result.formattedSubtotal).toContain("2,000");
      expect(result.formattedTotal).toContain("1,800");
    });

    it("should calculate stock status flags correctly - in stock", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.isOutOfStock).toBe(false);
      expect(result.isLowStock).toBe(false);
    });

    it("should detect out of stock", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        isAvailable: false,
        maxQuantity: 0,
      };

      const result = toFECartItem(item);

      expect(result.isOutOfStock).toBe(true);
      expect(result.isLowStock).toBe(false);
    });

    it("should detect low stock", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        maxQuantity: 3,
      };

      const result = toFECartItem(item);

      expect(result.isOutOfStock).toBe(false);
      expect(result.isLowStock).toBe(true);
    });

    it("should calculate canIncrement correctly", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.canIncrement).toBe(true);
    });

    it("should set canIncrement to false at max quantity", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        quantity: 10,
        maxQuantity: 10,
      };

      const result = toFECartItem(item);

      expect(result.canIncrement).toBe(false);
    });

    it("should set canIncrement to false when unavailable", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        isAvailable: false,
      };

      const result = toFECartItem(item);

      expect(result.canIncrement).toBe(false);
    });

    it("should calculate canDecrement correctly", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.canDecrement).toBe(true);
    });

    it("should set canDecrement to false at quantity 1", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        quantity: 1,
      };

      const result = toFECartItem(item);

      expect(result.canDecrement).toBe(false);
    });

    it("should detect hasDiscount correctly", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.hasDiscount).toBe(true);
    });

    it("should detect no discount", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        discount: 0,
      };

      const result = toFECartItem(item);

      expect(result.hasDiscount).toBe(false);
    });

    it("should format addedTimeAgo correctly", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.addedTimeAgo).toBeTruthy();
      expect(typeof result.addedTimeAgo).toBe("string");
    });

    it("should handle variant information", () => {
      const itemWithVariant: CartItemBE = {
        ...mockCartItemBE,
        variantId: "variant-123",
        variantName: "Size: Large, Color: Blue",
      };

      const result = toFECartItem(itemWithVariant);

      expect(result.variantId).toBe("variant-123");
      expect(result.variantName).toBe("Size: Large, Color: Blue");
    });

    it("should handle null variant information", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.variantId).toBeNull();
      expect(result.variantName).toBeNull();
    });

    it("should parse addedAt date from Timestamp", () => {
      const result = toFECartItem(mockCartItemBE);

      expect(result.addedAt).toBeInstanceOf(Date);
    });

    it("should parse addedAt date from ISO string", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        addedAt: new Date().toISOString() as any,
      };

      const result = toFECartItem(item);

      expect(result.addedAt).toBeInstanceOf(Date);
    });

    it("should handle null addedAt date", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        addedAt: null as any,
      };

      const result = toFECartItem(item);

      expect(result.addedAt).toBeInstanceOf(Date);
    });
  });

  describe("toFECart", () => {
    it("should transform backend cart to frontend", () => {
      const result = toFECart(mockCartBE);

      expect(result.id).toBe("cart-123");
      expect(result.userId).toBe("user-123");
      expect(result.items).toHaveLength(1);
      expect(result.itemCount).toBe(2);
      expect(result.subtotal).toBe(2000);
      expect(result.discount).toBe(200);
      expect(result.tax).toBe(180);
      expect(result.total).toBe(2030);
    });

    it("should format cart totals correctly", () => {
      const result = toFECart(mockCartBE);

      expect(result.formattedSubtotal).toContain("2,000");
      expect(result.formattedDiscount).toContain("200");
      expect(result.formattedTax).toContain("180");
      expect(result.formattedTotal).toContain("2,030");
    });

    it("should calculate isEmpty correctly - not empty", () => {
      const result = toFECart(mockCartBE);

      expect(result.isEmpty).toBe(false);
    });

    it("should calculate isEmpty correctly - empty", () => {
      const emptyCart: CartBE = {
        ...mockCartBE,
        items: [],
        itemCount: 0,
      };

      const result = toFECart(emptyCart);

      expect(result.isEmpty).toBe(true);
    });

    it("should calculate hasDiscount correctly", () => {
      const result = toFECart(mockCartBE);

      expect(result.hasDiscount).toBe(true);
    });

    it("should detect no discount", () => {
      const cart: CartBE = {
        ...mockCartBE,
        discount: 0,
      };

      const result = toFECart(cart);

      expect(result.hasDiscount).toBe(false);
    });

    it("should format expiresIn correctly", () => {
      const result = toFECart(mockCartBE);

      expect(result.expiresIn).toBeTruthy();
      expect(result.expiresIn).toContain("hour");
    });

    it("should handle null expiresAt", () => {
      const cart: CartBE = {
        ...mockCartBE,
        expiresAt: null,
      };

      const result = toFECart(cart);

      expect(result.expiresIn).toBeNull();
    });

    it("should detect expired cart", () => {
      const expiredCart: CartBE = {
        ...mockCartBE,
        expiresAt: Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
      };

      const result = toFECart(expiredCart);

      expect(result.expiresIn).toBe("Expired");
    });

    it("should transform all cart items", () => {
      const multiItemCart: CartBE = {
        ...mockCartBE,
        items: [
          mockCartItemBE,
          { ...mockCartItemBE, id: "item-456", productId: "prod-456" },
          { ...mockCartItemBE, id: "item-789", productId: "prod-789" },
        ],
        itemCount: 6,
      };

      const result = toFECart(multiItemCart);

      expect(result.items).toHaveLength(3);
      expect(result.items[0].id).toBe("item-123");
      expect(result.items[1].id).toBe("item-456");
      expect(result.items[2].id).toBe("item-789");
    });

    it("should have itemsByShop grouping", () => {
      const result = toFECart(mockCartBE);

      expect(result.itemsByShop).toBeInstanceOf(Map);
      expect(result.shopIds).toContain("shop-123");
    });

    it("should calculate canCheckout correctly", () => {
      const result = toFECart(mockCartBE);

      expect(result.canCheckout).toBe(true);
    });

    it("should set canCheckout to false for empty cart", () => {
      const emptyCart: CartBE = {
        ...mockCartBE,
        items: [],
        itemCount: 0,
      };

      const result = toFECart(emptyCart);

      expect(result.canCheckout).toBe(false);
    });

    it("should parse dates correctly", () => {
      const result = toFECart(mockCartBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it("should handle ISO string dates", () => {
      const cart: CartBE = {
        ...mockCartBE,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
        expiresAt: new Date(Date.now() + 7200000).toISOString() as any,
      };

      const result = toFECart(cart);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe("toBEAddToCartRequest", () => {
    it("should transform add to cart form to backend request", () => {
      const formData: AddToCartFormFE = {
        productId: "prod-123",
        quantity: 3,
        variantId: null,
      };

      const result = toBEAddToCartRequest(formData);

      expect(result.productId).toBe("prod-123");
      expect(result.quantity).toBe(3);
      expect(result.variantId).toBeNull();
    });

    it("should handle variant selection", () => {
      const formData: AddToCartFormFE = {
        productId: "prod-123",
        quantity: 1,
        variantId: "variant-456",
      };

      const result = toBEAddToCartRequest(formData);

      expect(result.productId).toBe("prod-123");
      expect(result.quantity).toBe(1);
      expect(result.variantId).toBe("variant-456");
    });

    it("should handle null variantId", () => {
      const formData: AddToCartFormFE = {
        productId: "prod-123",
        quantity: 1,
        variantId: null,
      };

      const result = toBEAddToCartRequest(formData);

      expect(result.variantId).toBeNull();
    });
  });

  describe("toFECartSummary", () => {
    it("should transform cart to summary", () => {
      const cartFE = toFECart(mockCartBE);
      const result = toFECartSummary(cartFE);

      expect(result.itemCount).toBe(2);
      expect(result.subtotal).toBe(2000);
      expect(result.discount).toBe(200);
      expect(result.tax).toBe(180);
      expect(result.total).toBe(2030);
      expect(result.savings).toBe(200);
    });

    it("should format all amounts correctly", () => {
      const cartFE = toFECart(mockCartBE);
      const result = toFECartSummary(cartFE);

      expect(result.formattedSubtotal).toContain("2,000");
      expect(result.formattedDiscount).toContain("200");
      expect(result.formattedTax).toContain("180");
      expect(result.formattedTotal).toContain("2,030");
      expect(result.formattedSavings).toContain("200");
    });
  });

  describe("createEmptyCart", () => {
    it("should create empty cart with correct structure", () => {
      const result = createEmptyCart("user-123");

      expect(result.userId).toBe("user-123");
      expect(result.items).toEqual([]);
      expect(result.itemCount).toBe(0);
      expect(result.isEmpty).toBe(true);
      expect(result.hasItems).toBe(false);
      expect(result.canCheckout).toBe(false);
    });

    it("should have zero values for all amounts", () => {
      const result = createEmptyCart("user-123");

      expect(result.subtotal).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.total).toBe(0);
    });

    it("should have no validation errors or warnings", () => {
      const result = createEmptyCart("user-123");

      expect(result.validationErrors).toEqual([]);
      expect(result.validationWarnings).toEqual([]);
    });
  });

  describe("formatRelativeTime", () => {
    it("should format 'Just added' for items added less than 1 minute ago", () => {
      const recentItem: CartItemBE = {
        ...mockCartItemBE,
        addedAt: Timestamp.fromDate(new Date(Date.now() - 30000)), // 30 seconds ago
      };

      const result = toFECartItem(recentItem);

      expect(result.addedTimeAgo).toBe("Just added");
    });

    it("should format minutes correctly", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        addedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60000)), // 5 minutes ago
      };

      const result = toFECartItem(item);

      expect(result.addedTimeAgo).toContain("5 mins ago");
    });

    it("should format hours correctly", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        addedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 3600000)), // 3 hours ago
      };

      const result = toFECartItem(item);

      expect(result.addedTimeAgo).toContain("3 hours ago");
    });

    it("should format days correctly", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        addedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 86400000)), // 2 days ago
      };

      const result = toFECartItem(item);

      expect(result.addedTimeAgo).toContain("2 days ago");
    });
  });

  describe("formatExpiresIn", () => {
    it("should format minutes correctly", () => {
      const cart: CartBE = {
        ...mockCartBE,
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 60000)), // 30 minutes
      };

      const result = toFECart(cart);

      expect(result.expiresIn).toContain("minute");
    });

    it("should format hours correctly", () => {
      const cart: CartBE = {
        ...mockCartBE,
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 3600000)), // 5 hours
      };

      const result = toFECart(cart);

      expect(result.expiresIn).toContain("hour");
    });

    it("should show 'Expired' for past expiry", () => {
      const cart: CartBE = {
        ...mockCartBE,
        expiresAt: Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
      };

      const result = toFECart(cart);

      expect(result.expiresIn).toBe("Expired");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle cart with zero values", () => {
      const zeroCart: CartBE = {
        ...mockCartBE,
        items: [],
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      };

      const result = toFECart(zeroCart);

      expect(result.isEmpty).toBe(true);
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
      expect(result.hasDiscount).toBe(false);
    });

    it("should handle item with zero quantity (edge case)", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        quantity: 0,
      };

      const result = toFECartItem(item);

      expect(result.quantity).toBe(0);
      expect(result.canDecrement).toBe(false);
    });

    it("should handle item with negative discount (edge case)", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        discount: -100,
      };

      const result = toFECartItem(item);

      expect(result.discount).toBe(-100);
      expect(result.hasDiscount).toBe(false); // hasDiscount checks for > 0
    });

    it("should handle very large quantities", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        quantity: 1000,
        maxQuantity: 10000,
      };

      const result = toFECartItem(item);

      expect(result.quantity).toBe(1000);
      expect(result.canIncrement).toBe(true);
    });

    it("should handle very large prices", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        price: 9999999,
        subtotal: 19999998,
        total: 19999998,
      };

      const result = toFECartItem(item);

      expect(result.price).toBe(9999999);
      expect(result.formattedPrice).toBeTruthy();
    });

    it("should handle empty product image", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        productImage: "",
      };

      const result = toFECartItem(item);

      expect(result.productImage).toBe("");
    });

    it("should handle null shop information", () => {
      const item: CartItemBE = {
        ...mockCartItemBE,
        shopId: null as any,
        shopName: null as any,
      };

      const result = toFECartItem(item);

      expect(result.shopId).toBeNull();
      expect(result.shopName).toBeNull();
    });
  });
});
