/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cart Service Validation Tests
 *
 * Comprehensive tests for input validation and error handling
 * added in Batch 23 code quality improvements.
 */

import { cartService } from "../cart.service";

describe("CartService - Validation Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("getGuestCart validation", () => {
    it("should handle non-array data in localStorage", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_cart", JSON.stringify({ invalid: "object" }));

      const cart = cartService.getGuestCart();

      expect(cart).toEqual([]);
      expect(localStorage.getItem("guest_cart")).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "[Cart] Invalid cart data in localStorage, resetting"
      );

      console.error = originalError;
    });

    it("should handle string data in localStorage", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_cart", JSON.stringify("invalid string"));

      const cart = cartService.getGuestCart();

      expect(cart).toEqual([]);
      expect(console.error).toHaveBeenCalled();

      console.error = originalError;
    });

    it("should handle number data in localStorage", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_cart", JSON.stringify(123));

      const cart = cartService.getGuestCart();

      expect(cart).toEqual([]);
      expect(console.error).toHaveBeenCalled();

      console.error = originalError;
    });

    it("should handle null data in localStorage", () => {
      const originalError = console.error;
      console.error = jest.fn();

      localStorage.setItem("guest_cart", JSON.stringify(null));

      const cart = cartService.getGuestCart();

      expect(cart).toEqual([]);
      expect(console.error).toHaveBeenCalled();

      console.error = originalError;
    });
  });

  describe("addToGuestCart validation", () => {
    it("should throw error for invalid productId", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "" as any,
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid product ID");
    });

    it("should throw error for non-string productId", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: 123 as any,
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid product ID");
    });

    it("should throw error for zero quantity", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: 100,
          quantity: 0,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid quantity");
    });

    it("should throw error for negative quantity", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: 100,
          quantity: -5,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid quantity");
    });

    it("should throw error for non-number quantity", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: 100,
          quantity: "5" as any,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid quantity");
    });

    it("should throw error for zero maxQuantity", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: 100,
          quantity: 1,
          maxQuantity: 0,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid max quantity");
    });

    it("should throw error for negative maxQuantity", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: 100,
          quantity: 1,
          maxQuantity: -10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid max quantity");
    });

    it("should throw error for negative price", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: -100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid price");
    });

    it("should accept zero price (free item)", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Free Sample",
          productSlug: "free-sample",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "FREE",
          price: 0,
          quantity: 1,
          maxQuantity: 1,
          subtotal: 0,
          discount: 0,
          total: 0,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).not.toThrow();

      const cart = cartService.getGuestCart();
      expect(cart).toHaveLength(1);
      expect(cart[0].price).toBe(0);
    });

    it("should throw error for NaN price", () => {
      expect(() => {
        cartService.addToGuestCart({
          productId: "prod1",
          productName: "Test",
          productSlug: "test",
          productImage: "img.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU",
          price: NaN,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop",
          isAvailable: true,
        });
      }).toThrow("[Cart] Invalid price");
    });
  });

  describe("updateGuestCartItem validation", () => {
    beforeEach(() => {
      // Add a valid item first
      cartService.addToGuestCart({
        productId: "prod1",
        productName: "Test",
        productSlug: "test",
        productImage: "img.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU",
        price: 100,
        quantity: 1,
        maxQuantity: 10,
        subtotal: 100,
        discount: 0,
        total: 100,
        shopId: "shop1",
        shopName: "Shop",
        isAvailable: true,
      });
    });

    it("should throw error for empty itemId", () => {
      expect(() => {
        cartService.updateGuestCartItem("", 5);
      }).toThrow("[Cart] Invalid item ID");
    });

    it("should throw error for non-string itemId", () => {
      expect(() => {
        cartService.updateGuestCartItem(123 as any, 5);
      }).toThrow("[Cart] Invalid item ID");
    });

    it("should throw error for NaN quantity", () => {
      const cart = cartService.getGuestCart();
      const itemId = cart[0].id;

      expect(() => {
        cartService.updateGuestCartItem(itemId, NaN);
      }).toThrow("[Cart] Invalid quantity");
    });

    it("should throw error for non-number quantity", () => {
      const cart = cartService.getGuestCart();
      const itemId = cart[0].id;

      expect(() => {
        cartService.updateGuestCartItem(itemId, "5" as any);
      }).toThrow("[Cart] Invalid quantity");
    });

    it("should handle item with invalid maxQuantity by setting default", () => {
      const originalError = console.error;
      console.error = jest.fn();

      // Manually corrupt the item in localStorage
      const cart = cartService.getGuestCart();
      cart[0].maxQuantity = -1 as any;
      localStorage.setItem("guest_cart", JSON.stringify(cart));

      // Update should fix it
      const itemId = cart[0].id;
      cartService.updateGuestCartItem(itemId, 5);

      const updatedCart = cartService.getGuestCart();
      expect(updatedCart[0].maxQuantity).toBe(100); // Default fallback
      expect(console.error).toHaveBeenCalledWith(
        "[Cart] Invalid maxQuantity for item",
        itemId
      );

      console.error = originalError;
    });

    it("should cap quantity at maxQuantity when maxQuantity is corrupted", () => {
      const originalError = console.error;
      console.error = jest.fn();

      // Corrupt maxQuantity
      const cart = cartService.getGuestCart();
      cart[0].maxQuantity = null as any;
      localStorage.setItem("guest_cart", JSON.stringify(cart));

      const itemId = cart[0].id;
      cartService.updateGuestCartItem(itemId, 150);

      const updatedCart = cartService.getGuestCart();
      expect(updatedCart[0].quantity).toBe(100); // Capped at default maxQuantity

      console.error = originalError;
    });
  });

  describe("Race condition prevention", () => {
    it("should handle concurrent addToGuestCart calls", () => {
      const item = {
        productId: "prod1",
        productName: "Test",
        productSlug: "test",
        productImage: "img.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU",
        price: 100,
        quantity: 1,
        maxQuantity: 10,
        subtotal: 100,
        discount: 0,
        total: 100,
        shopId: "shop1",
        shopName: "Shop",
        isAvailable: true,
      };

      // Simulate concurrent calls
      cartService.addToGuestCart(item);
      cartService.addToGuestCart(item);
      cartService.addToGuestCart(item);

      const cart = cartService.getGuestCart();

      // Should only have one item with quantity 3
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(3);
    });

    it("should respect maxQuantity in concurrent calls", () => {
      const item = {
        productId: "prod1",
        productName: "Test",
        productSlug: "test",
        productImage: "img.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU",
        price: 100,
        quantity: 3,
        maxQuantity: 5,
        subtotal: 300,
        discount: 0,
        total: 300,
        shopId: "shop1",
        shopName: "Shop",
        isAvailable: true,
      };

      // Try to add 3 items twice (6 total)
      cartService.addToGuestCart(item);
      cartService.addToGuestCart(item);

      const cart = cartService.getGuestCart();

      // Should be capped at maxQuantity
      expect(cart[0].quantity).toBe(5);
    });
  });

  describe("Data integrity", () => {
    it("should maintain correct subtotal after validation", () => {
      cartService.addToGuestCart({
        productId: "prod1",
        productName: "Test",
        productSlug: "test",
        productImage: "img.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU",
        price: 100,
        quantity: 3,
        maxQuantity: 10,
        subtotal: 300,
        discount: 0,
        total: 300,
        shopId: "shop1",
        shopName: "Shop",
        isAvailable: true,
      });

      const cart = cartService.getGuestCart();
      expect(cart[0].subtotal).toBe(300);
      expect(cart[0].total).toBe(300);
    });

    it("should recalculate computed fields after quantity update", () => {
      cartService.addToGuestCart({
        productId: "prod1",
        productName: "Test",
        productSlug: "test",
        productImage: "img.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU",
        price: 100,
        quantity: 2,
        maxQuantity: 10,
        subtotal: 200,
        discount: 0,
        total: 200,
        shopId: "shop1",
        shopName: "Shop",
        isAvailable: true,
      });

      const cart = cartService.getGuestCart();
      const itemId = cart[0].id;

      cartService.updateGuestCartItem(itemId, 5);

      const updatedCart = cartService.getGuestCart();
      expect(updatedCart[0].quantity).toBe(5);
      expect(updatedCart[0].subtotal).toBe(500);
      expect(updatedCart[0].total).toBe(500);
      expect(updatedCart[0].formattedSubtotal).toBe("₹500");
      expect(updatedCart[0].formattedTotal).toBe("₹500");
    });
  });
});
