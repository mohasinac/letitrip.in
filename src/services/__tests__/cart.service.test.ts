import type { AddToCartFormFE, CartItemFE } from "@/types/frontend/cart.types";
import { apiService } from "../api.service";
import { cartService } from "../cart.service";

// Mock the api service
jest.mock("../api.service");

// Mock transforms
jest.mock("@/types/transforms/cart.transforms", () => ({
  toFECart: jest.fn((data) => data),
  toBEAddToCartRequest: jest.fn((data) => data),
}));

describe("CartService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("fetches user cart successfully", async () => {
      const mockCart = {
        id: "cart-1",
        userId: "user-1",
        items: [{ id: "item-1", productId: "prod-1", quantity: 2 }],
        total: 599.98,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.get();

      expect(result).toEqual(mockCart);
      expect(apiService.get).toHaveBeenCalledWith("/cart");
    });

    it("handles empty cart", async () => {
      const mockCart = {
        id: "cart-1",
        userId: "user-1",
        items: [],
        total: 0,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.get();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("addItem", () => {
    it("adds item to cart successfully", async () => {
      const mockCart = {
        id: "cart-1",
        items: [{ id: "item-1", productId: "prod-1", quantity: 1 }],
        total: 299.99,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockCart);

      const formData: AddToCartFormFE = {
        productId: "prod-1",
        quantity: 1,
      };

      const result = await cartService.addItem(formData);

      expect(result).toEqual(mockCart);
      expect(apiService.post).toHaveBeenCalledWith("/cart", formData);
    });

    it("adds item with options", async () => {
      const mockCart = {
        id: "cart-1",
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            quantity: 1,
            selectedOptions: { size: "M", color: "blue" },
          },
        ],
        total: 299.99,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockCart);

      const formData: AddToCartFormFE = {
        productId: "prod-1",
        quantity: 1,
        selectedOptions: { size: "M", color: "blue" },
      };

      const result = await cartService.addItem(formData);

      expect(result.items[0]).toHaveProperty("selectedOptions");
    });
  });

  describe("updateItem", () => {
    it("updates item quantity successfully", async () => {
      const mockCart = {
        id: "cart-1",
        items: [{ id: "item-1", productId: "prod-1", quantity: 5 }],
        total: 1499.95,
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.updateItem("item-1", 5);

      expect(result).toEqual(mockCart);
      expect(apiService.patch).toHaveBeenCalledWith("/cart/item-1", {
        quantity: 5,
      });
    });

    it("handles updating to zero quantity", async () => {
      const mockCart = {
        id: "cart-1",
        items: [],
        total: 0,
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.updateItem("item-1", 0);

      expect(result.items).toHaveLength(0);
    });
  });

  describe("removeItem", () => {
    it("removes item from cart successfully", async () => {
      const mockCart = {
        id: "cart-1",
        items: [],
        total: 0,
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.removeItem("item-1");

      expect(result).toEqual(mockCart);
      expect(apiService.delete).toHaveBeenCalledWith("/cart/item-1");
    });
  });

  describe("clear", () => {
    it("clears cart successfully", async () => {
      const mockResponse = { message: "Cart cleared successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cartService.clear();

      expect(result).toEqual(mockResponse);
      expect(apiService.delete).toHaveBeenCalledWith("/cart");
    });
  });

  describe("mergeGuestCart", () => {
    it("merges guest cart with user cart", async () => {
      const mockCart = {
        id: "cart-1",
        userId: "user-1",
        items: [
          { id: "item-1", productId: "prod-1", quantity: 2 },
          { id: "item-2", productId: "prod-2", quantity: 1 },
        ],
        total: 899.97,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockCart);

      const guestItems: CartItemFE[] = [
        { id: "guest-1", productId: "prod-2", quantity: 1 } as CartItemFE,
      ];

      const result = await cartService.mergeGuestCart(guestItems);

      expect(result.items).toHaveLength(2);
      expect(apiService.post).toHaveBeenCalledWith("/cart/merge", {
        guestCartItems: guestItems,
      });
    });
  });

  describe("applyCoupon", () => {
    it("applies coupon to cart successfully", async () => {
      const mockCart = {
        id: "cart-1",
        items: [{ id: "item-1", productId: "prod-1", quantity: 1 }],
        total: 299.99,
        discount: 30,
        finalTotal: 269.99,
        coupon: { code: "SAVE10", discount: 30 },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.applyCoupon("SAVE10");

      expect(result.discount).toBe(30);
      expect(result.coupon?.code).toBe("SAVE10");
      expect(apiService.post).toHaveBeenCalledWith("/cart/coupon", {
        code: "SAVE10",
      });
    });

    it("handles invalid coupon", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Invalid coupon code")
      );

      await expect(cartService.applyCoupon("INVALID")).rejects.toThrow(
        "Invalid coupon code"
      );
    });
  });

  describe("removeCoupon", () => {
    it("removes coupon from cart successfully", async () => {
      const mockCart = {
        id: "cart-1",
        items: [{ id: "item-1", productId: "prod-1", quantity: 1 }],
        total: 299.99,
        discount: 0,
        finalTotal: 299.99,
        coupon: null,
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockCart);

      const result = await cartService.removeCoupon();

      expect(result.discount).toBe(0);
      expect(result.coupon).toBeNull();
      expect(apiService.delete).toHaveBeenCalledWith("/cart/coupon");
    });
  });

  describe("getItemCount", () => {
    it("returns cart item count", async () => {
      const mockResponse = { count: 5 };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cartService.getItemCount();

      expect(result).toBe(5);
      expect(apiService.get).toHaveBeenCalledWith("/cart/count");
    });

    it("returns zero for empty cart", async () => {
      const mockResponse = { count: 0 };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cartService.getItemCount();

      expect(result).toBe(0);
    });
  });

  describe("validate", () => {
    it("validates cart successfully", async () => {
      const mockResponse = {
        valid: true,
        errors: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cartService.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns validation errors", async () => {
      const mockResponse = {
        valid: false,
        errors: [
          {
            itemId: "item-1",
            productId: "prod-1",
            error: "Product out of stock",
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await cartService.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe("Product out of stock");
    });
  });

  describe("guest cart operations", () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    describe("getGuestCart", () => {
      it("returns empty array for new guest", () => {
        const cart = cartService.getGuestCart();

        expect(cart).toEqual([]);
      });

      it("retrieves existing guest cart", () => {
        const mockCart = [{ id: "guest_1", productId: "prod-1", quantity: 2 }];
        localStorage.setItem("guest_cart", JSON.stringify(mockCart));

        const cart = cartService.getGuestCart();

        expect(cart).toEqual(mockCart);
      });

      it("handles corrupted localStorage data", () => {
        // Suppress console.error for this test
        const originalError = console.error;
        console.error = jest.fn();

        localStorage.setItem("guest_cart", "invalid json");

        const cart = cartService.getGuestCart();

        expect(cart).toEqual([]);
        expect(localStorage.getItem("guest_cart")).toBeNull(); // Should be cleared

        // Restore console.error
        console.error = originalError;
      });
    });

    describe("addToGuestCart", () => {
      it("adds new item to empty cart", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();

        expect(cart).toHaveLength(1);
        expect(cart[0].productId).toBe("prod-1");
        expect(cart[0].quantity).toBe(1);
      });

      it("increments quantity for existing item", () => {
        // Add item first time
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        // Add same item again
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 2,
          maxQuantity: 10,
          subtotal: 200,
          discount: 0,
          total: 200,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();

        expect(cart).toHaveLength(1);
        expect(cart[0].quantity).toBe(3); // 1 + 2
      });

      it("treats different variants as separate items", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: "var-1",
          variantName: "Small",
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: "var-2",
          variantName: "Large",
          sku: "SKU124",
          price: 120,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 120,
          discount: 0,
          total: 120,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();

        expect(cart).toHaveLength(2);
      });

      it("sets computed fields correctly", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 10,
          total: 90,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].hasDiscount).toBe(true);
        expect(cart[0].canIncrement).toBe(true);
        expect(cart[0].canDecrement).toBe(false); // quantity is 1
        expect(cart[0].isLowStock).toBe(false); // maxQuantity is 10
      });

      it("handles low stock correctly", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 3, // Low stock
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].isLowStock).toBe(true);
      });

      it("handles out of stock correctly", () => {
        // Out of stock items should have isAvailable:false, but maxQuantity should still be valid
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 1, // Changed from 0 - maxQuantity must be >= 1
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: false, // This makes it out of stock
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].isOutOfStock).toBe(true);
      });
    });

    describe("updateGuestCartItem", () => {
      it("updates item quantity", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();
        const itemId = cart[0].id;

        cartService.updateGuestCartItem(itemId, 5);

        const updatedCart = cartService.getGuestCart();
        expect(updatedCart[0].quantity).toBe(5);
      });

      it("removes item when quantity is zero", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();
        const itemId = cart[0].id;

        cartService.updateGuestCartItem(itemId, 0);

        const updatedCart = cartService.getGuestCart();
        expect(updatedCart).toHaveLength(0);
      });

      it("removes item when quantity is negative", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();
        const itemId = cart[0].id;

        cartService.updateGuestCartItem(itemId, -1);

        const updatedCart = cartService.getGuestCart();
        expect(updatedCart).toHaveLength(0);
      });

      it("does nothing for non-existent item", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        cartService.updateGuestCartItem("non-existent", 5);

        const cart = cartService.getGuestCart();
        expect(cart).toHaveLength(1);
        expect(cart[0].quantity).toBe(1); // Unchanged
      });
    });

    describe("removeFromGuestCart", () => {
      it("removes item from cart", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();
        const itemId = cart[0].id;

        cartService.removeFromGuestCart(itemId);

        const updatedCart = cartService.getGuestCart();
        expect(updatedCart).toHaveLength(0);
      });

      it("only removes specified item from multi-item cart", () => {
        // Add two items
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Product 1",
          productSlug: "product-1",
          productImage: "image1.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Shop 1",
          isAvailable: true,
        });

        cartService.addToGuestCart({
          productId: "prod-2",
          productName: "Product 2",
          productSlug: "product-2",
          productImage: "image2.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU456",
          price: 200,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 200,
          discount: 0,
          total: 200,
          shopId: "shop-1",
          shopName: "Shop 1",
          isAvailable: true,
        });

        const cart = cartService.getGuestCart();
        const firstItemId = cart[0].id;

        cartService.removeFromGuestCart(firstItemId);

        const updatedCart = cartService.getGuestCart();
        expect(updatedCart).toHaveLength(1);
        expect(updatedCart[0].productId).toBe("prod-2");
      });

      it("does nothing for non-existent item", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        cartService.removeFromGuestCart("non-existent");

        const cart = cartService.getGuestCart();
        expect(cart).toHaveLength(1);
      });
    });

    describe("clearGuestCart", () => {
      it("clears all items from cart", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Test Product",
          productSlug: "test-product",
          productImage: "image.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 1,
          maxQuantity: 10,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop-1",
          shopName: "Test Shop",
          isAvailable: true,
        });

        cartService.clearGuestCart();

        const cart = cartService.getGuestCart();
        expect(cart).toHaveLength(0);
      });
    });

    describe("getGuestCartItemCount", () => {
      it("returns zero for empty cart", () => {
        const count = cartService.getGuestCartItemCount();

        expect(count).toBe(0);
      });

      it("returns total quantity of all items", () => {
        cartService.addToGuestCart({
          productId: "prod-1",
          productName: "Product 1",
          productSlug: "product-1",
          productImage: "image1.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU123",
          price: 100,
          quantity: 3,
          maxQuantity: 10,
          subtotal: 300,
          discount: 0,
          total: 300,
          shopId: "shop-1",
          shopName: "Shop 1",
          isAvailable: true,
        });

        cartService.addToGuestCart({
          productId: "prod-2",
          productName: "Product 2",
          productSlug: "product-2",
          productImage: "image2.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU456",
          price: 200,
          quantity: 2,
          maxQuantity: 10,
          subtotal: 400,
          discount: 0,
          total: 400,
          shopId: "shop-1",
          shopName: "Shop 1",
          isAvailable: true,
        });

        const count = cartService.getGuestCartItemCount();

        expect(count).toBe(5); // 3 + 2
      });
    });

    describe("addToGuestCartWithDetails", () => {
      it("adds product with minimal details", () => {
        cartService.addToGuestCartWithDetails({
          productId: "prod-1",
          name: "Test Product",
          price: 100,
          image: "image.jpg",
          shopId: "shop-1",
          shopName: "Test Shop",
          quantity: 1,
        });

        const cart = cartService.getGuestCart();

        expect(cart).toHaveLength(1);
        expect(cart[0].productName).toBe("Test Product");
        expect(cart[0].price).toBe(100);
        expect(cart[0].quantity).toBe(1);
        expect(cart[0].subtotal).toBe(100);
        expect(cart[0].total).toBe(100);
      });

      it("calculates subtotal correctly for multiple quantities", () => {
        cartService.addToGuestCartWithDetails({
          productId: "prod-1",
          name: "Test Product",
          price: 50,
          image: "image.jpg",
          shopId: "shop-1",
          shopName: "Test Shop",
          quantity: 3,
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].subtotal).toBe(150); // 50 * 3
        expect(cart[0].total).toBe(150);
      });

      it("includes variant ID when provided", () => {
        cartService.addToGuestCartWithDetails({
          productId: "prod-1",
          name: "Test Product",
          price: 100,
          image: "image.jpg",
          shopId: "shop-1",
          shopName: "Test Shop",
          quantity: 1,
          variantId: "var-1",
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].variantId).toBe("var-1");
      });

      it("generates slug from product name", () => {
        cartService.addToGuestCartWithDetails({
          productId: "prod-1",
          name: "Test Product With Spaces",
          price: 100,
          image: "image.jpg",
          shopId: "shop-1",
          shopName: "Test Shop",
          quantity: 1,
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].productSlug).toBe("test-product-with-spaces");
      });

      it("sets default maxQuantity to 100", () => {
        cartService.addToGuestCartWithDetails({
          productId: "prod-1",
          name: "Test Product",
          price: 100,
          image: "image.jpg",
          shopId: "shop-1",
          shopName: "Test Shop",
          quantity: 1,
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].maxQuantity).toBe(100);
      });

      it("sets discount to zero by default", () => {
        cartService.addToGuestCartWithDetails({
          productId: "prod-1",
          name: "Test Product",
          price: 100,
          image: "image.jpg",
          shopId: "shop-1",
          shopName: "Test Shop",
          quantity: 1,
        });

        const cart = cartService.getGuestCart();

        expect(cart[0].discount).toBe(0);
      });
    });
  });

  describe("edge cases", () => {
    describe("updateItem edge cases", () => {
      it("handles zero quantity update", async () => {
        const mockCart = {
          id: "cart-1",
          items: [],
          total: 0,
        };

        (apiService.patch as jest.Mock).mockResolvedValue(mockCart);

        const result = await cartService.updateItem("item-1", 0);

        expect(apiService.patch).toHaveBeenCalledWith("/cart/item-1", {
          quantity: 0,
        });
      });

      it("handles negative quantity update", async () => {
        const mockCart = {
          id: "cart-1",
          items: [],
          total: 0,
        };

        (apiService.patch as jest.Mock).mockResolvedValue(mockCart);

        const result = await cartService.updateItem("item-1", -5);

        expect(apiService.patch).toHaveBeenCalledWith("/cart/item-1", {
          quantity: -5,
        });
      });

      it("handles very large quantity", async () => {
        const mockCart = {
          id: "cart-1",
          items: [{ id: "item-1", quantity: 999999 }],
          total: 999999,
        };

        (apiService.patch as jest.Mock).mockResolvedValue(mockCart);

        const result = await cartService.updateItem("item-1", 999999);

        expect(result.items[0].quantity).toBe(999999);
      });
    });

    describe("mergeGuestCart edge cases", () => {
      it("handles empty guest cart", async () => {
        const mockCart = {
          id: "cart-1",
          items: [],
          total: 0,
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockCart);

        const result = await cartService.mergeGuestCart([]);

        expect(apiService.post).toHaveBeenCalledWith("/cart/merge", {
          guestCartItems: [],
        });
      });

      it("merges large guest cart", async () => {
        const guestItems = Array.from({ length: 50 }, (_, i) => ({
          id: `guest_${i}`,
          productId: `prod-${i}`,
          quantity: 1,
        })) as CartItemFE[];

        const mockCart = {
          id: "cart-1",
          items: guestItems,
          total: 5000,
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockCart);

        const result = await cartService.mergeGuestCart(guestItems);

        expect(result.items).toHaveLength(50);
      });
    });

    describe("applyCoupon edge cases", () => {
      it("handles empty coupon code", async () => {
        (apiService.post as jest.Mock).mockRejectedValue(
          new Error("Coupon code required")
        );

        await expect(cartService.applyCoupon("")).rejects.toThrow(
          "Coupon code required"
        );
      });

      it("handles very long coupon code", async () => {
        const longCode = "A".repeat(1000);

        (apiService.post as jest.Mock).mockRejectedValue(
          new Error("Invalid coupon code")
        );

        await expect(cartService.applyCoupon(longCode)).rejects.toThrow();
      });

      it("handles special characters in coupon", async () => {
        const mockCart = {
          id: "cart-1",
          discount: 10,
          coupon: { code: "SAVE@10%" },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockCart);

        const result = await cartService.applyCoupon("SAVE@10%");

        expect(result.coupon?.code).toBe("SAVE@10%");
      });
    });
  });
});
