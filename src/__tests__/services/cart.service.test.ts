/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/services/api.service";
import { cartService } from "@/services/cart.service";
import type { CartBE, CartItemBE } from "@/types/backend/cart.types";
import type { AddToCartFormFE, CartItemFE } from "@/types/frontend/cart.types";
import { Timestamp } from "firebase/firestore";

// Mock dependencies
jest.mock("@/services/api.service");

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("CartService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));

  // Mock data
  const mockCartItemBE1: CartItemBE = {
    id: "item1",
    productId: "product1",
    productName: "Test Product 1",
    productSlug: "test-product-1",
    productImage: "https://example.com/product1.jpg",
    variantId: null,
    variantName: null,
    sku: "SKU001",
    price: 100,
    quantity: 2,
    maxQuantity: 50,
    subtotal: 200,
    discount: 10,
    total: 190,
    shopId: "shop1",
    shopName: "Test Shop",
    isAvailable: true,
    addedAt: now,
  };

  const mockCartItemBE2: CartItemBE = {
    id: "item2",
    productId: "product2",
    productName: "Test Product 2",
    productSlug: "test-product-2",
    productImage: "https://example.com/product2.jpg",
    variantId: "variant1",
    variantName: "Blue",
    sku: "SKU002",
    price: 150,
    quantity: 1,
    maxQuantity: 10,
    subtotal: 150,
    discount: 0,
    total: 150,
    shopId: "shop1",
    shopName: "Test Shop",
    isAvailable: true,
    addedAt: now,
  };

  const mockCartBE: CartBE = {
    id: "cart123",
    userId: "user123",
    items: [mockCartItemBE1, mockCartItemBE2],
    itemCount: 3,
    subtotal: 350,
    discount: 10,
    tax: 35,
    total: 375,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  };

  const mockEmptyCartBE: CartBE = {
    id: "cart456",
    userId: "user123",
    items: [],
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    createdAt: now,
    updatedAt: now,
    expiresAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe("get", () => {
    it("should get user cart and transform to FE", async () => {
      mockApiService.get.mockResolvedValue(mockCartBE);

      const cart = await cartService.get();

      expect(mockApiService.get).toHaveBeenCalledWith("/cart");
      expect(cart.id).toBe("cart123");
      expect(cart.userId).toBe("user123");
      expect(cart.items).toHaveLength(2);
      expect(cart.itemCount).toBe(3);
      expect(cart.subtotal).toBe(350);
      expect(cart.total).toBe(375);
    });

    it("should transform cart items with computed fields", async () => {
      mockApiService.get.mockResolvedValue(mockCartBE);

      const cart = await cartService.get();

      expect(cart.items[0]).toMatchObject({
        id: "item1",
        productName: "Test Product 1",
        price: 100,
        quantity: 2,
        formattedPrice: "₹100.00",
        formattedSubtotal: "₹200.00",
        formattedTotal: "₹190.00",
        isOutOfStock: false,
        isLowStock: false,
        canIncrement: true,
        canDecrement: true,
        hasDiscount: true,
      });
    });

    it("should return empty cart when user has no cart", async () => {
      mockApiService.get.mockResolvedValue(mockEmptyCartBE);

      const cart = await cartService.get();

      expect(cart.isEmpty).toBe(true);
      expect(cart.hasItems).toBe(false);
      expect(cart.items).toHaveLength(0);
      expect(cart.itemCount).toBe(0);
    });

    it("should throw error on API failure", async () => {
      mockApiService.get.mockRejectedValue(new Error("Network error"));

      await expect(cartService.get()).rejects.toThrow("Network error");
    });
  });

  describe("addItem", () => {
    it("should add item to cart successfully", async () => {
      const formData: AddToCartFormFE = {
        productId: "product3",
        quantity: 1,
      };

      mockApiService.post.mockResolvedValue(mockCartBE);

      const cart = await cartService.addItem(formData);

      expect(mockApiService.post).toHaveBeenCalledWith("/cart", {
        productId: "product3",
        quantity: 1,
      });
      expect(cart.id).toBe("cart123");
      expect(cart.items).toHaveLength(2);
    });

    it("should add item with variant", async () => {
      const formData: AddToCartFormFE = {
        productId: "product3",
        variantId: "variant2",
        quantity: 2,
      };

      mockApiService.post.mockResolvedValue(mockCartBE);

      const cart = await cartService.addItem(formData);

      expect(mockApiService.post).toHaveBeenCalledWith("/cart", {
        productId: "product3",
        variantId: "variant2",
        quantity: 2,
      });
      expect(cart).toBeDefined();
    });

    it("should throw error if product not found", async () => {
      const formData: AddToCartFormFE = {
        productId: "invalid-product",
        quantity: 1,
      };

      mockApiService.post.mockRejectedValue(new Error("Product not found"));

      await expect(cartService.addItem(formData)).rejects.toThrow(
        "Product not found"
      );
    });

    it("should throw error if quantity exceeds stock", async () => {
      const formData: AddToCartFormFE = {
        productId: "product1",
        quantity: 100,
      };

      mockApiService.post.mockRejectedValue(
        new Error("Quantity exceeds available stock")
      );

      await expect(cartService.addItem(formData)).rejects.toThrow(
        "Quantity exceeds available stock"
      );
    });
  });

  describe("updateItem", () => {
    it("should update item quantity successfully", async () => {
      mockApiService.patch.mockResolvedValue(mockCartBE);

      const cart = await cartService.updateItem("item1", 5);

      expect(mockApiService.patch).toHaveBeenCalledWith("/cart/item1", {
        quantity: 5,
      });
      expect(cart.id).toBe("cart123");
    });

    it("should throw error if item not found", async () => {
      mockApiService.patch.mockRejectedValue(new Error("Item not found"));

      await expect(cartService.updateItem("invalid-item", 3)).rejects.toThrow(
        "Item not found"
      );
    });

    it("should throw error if quantity exceeds stock", async () => {
      mockApiService.patch.mockRejectedValue(
        new Error("Quantity exceeds available stock")
      );

      await expect(cartService.updateItem("item1", 100)).rejects.toThrow(
        "Quantity exceeds available stock"
      );
    });

    it("should handle quantity of 0", async () => {
      mockApiService.patch.mockResolvedValue(mockEmptyCartBE);

      const cart = await cartService.updateItem("item1", 0);

      expect(mockApiService.patch).toHaveBeenCalledWith("/cart/item1", {
        quantity: 0,
      });
      expect(cart).toBeDefined();
    });
  });

  describe("removeItem", () => {
    it("should remove item from cart successfully", async () => {
      mockApiService.delete.mockResolvedValue(mockCartBE);

      const cart = await cartService.removeItem("item1");

      expect(mockApiService.delete).toHaveBeenCalledWith("/cart/item1");
      expect(cart).toBeDefined();
    });

    it("should throw error if item not found", async () => {
      mockApiService.delete.mockRejectedValue(new Error("Item not found"));

      await expect(cartService.removeItem("invalid-item")).rejects.toThrow(
        "Item not found"
      );
    });

    it("should return empty cart if last item removed", async () => {
      mockApiService.delete.mockResolvedValue(mockEmptyCartBE);

      const cart = await cartService.removeItem("item1");

      expect(cart.isEmpty).toBe(true);
      expect(cart.items).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should clear cart successfully", async () => {
      mockApiService.delete.mockResolvedValue({ message: "Cart cleared" });

      const result = await cartService.clear();

      expect(mockApiService.delete).toHaveBeenCalledWith("/cart");
      expect(result.message).toBe("Cart cleared");
    });

    it("should throw error on failure", async () => {
      mockApiService.delete.mockRejectedValue(
        new Error("Failed to clear cart")
      );

      await expect(cartService.clear()).rejects.toThrow("Failed to clear cart");
    });
  });

  describe("mergeGuestCart", () => {
    it("should merge guest cart items with user cart", async () => {
      const guestItems: CartItemFE[] = [
        {
          id: "guest1",
          productId: "product3",
          productName: "Guest Product",
          productSlug: "guest-product",
          productImage: "https://example.com/guest.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU003",
          price: 50,
          quantity: 1,
          maxQuantity: 20,
          subtotal: 50,
          discount: 0,
          total: 50,
          shopId: "shop2",
          shopName: "Guest Shop",
          isAvailable: true,
          addedAt: new Date(),
          formattedPrice: "₹50",
          formattedSubtotal: "₹50",
          formattedTotal: "₹50",
          isOutOfStock: false,
          isLowStock: false,
          canIncrement: true,
          canDecrement: false,
          hasDiscount: false,
          addedTimeAgo: "Just added",
        },
      ];

      mockApiService.post.mockResolvedValue(mockCartBE);

      const cart = await cartService.mergeGuestCart(guestItems);

      expect(mockApiService.post).toHaveBeenCalledWith("/cart/merge", {
        guestCartItems: guestItems,
      });
      expect(cart).toBeDefined();
    });

    it("should handle empty guest cart", async () => {
      mockApiService.post.mockResolvedValue(mockCartBE);

      const cart = await cartService.mergeGuestCart([]);

      expect(mockApiService.post).toHaveBeenCalledWith("/cart/merge", {
        guestCartItems: [],
      });
      expect(cart).toBeDefined();
    });
  });

  describe("applyCoupon", () => {
    it("should apply coupon successfully", async () => {
      mockApiService.post.mockResolvedValue(mockCartBE);

      const cart = await cartService.applyCoupon("SUMMER20");

      expect(mockApiService.post).toHaveBeenCalledWith("/cart/coupon", {
        code: "SUMMER20",
      });
      expect(cart).toBeDefined();
    });

    it("should throw error for invalid coupon", async () => {
      mockApiService.post.mockRejectedValue(new Error("Invalid coupon code"));

      await expect(cartService.applyCoupon("INVALID")).rejects.toThrow(
        "Invalid coupon code"
      );
    });

    it("should throw error for expired coupon", async () => {
      mockApiService.post.mockRejectedValue(new Error("Coupon has expired"));

      await expect(cartService.applyCoupon("EXPIRED")).rejects.toThrow(
        "Coupon has expired"
      );
    });

    it("should throw error for coupon below minimum order value", async () => {
      mockApiService.post.mockRejectedValue(
        new Error("Order value below minimum")
      );

      await expect(cartService.applyCoupon("BIGSPENDER")).rejects.toThrow(
        "Order value below minimum"
      );
    });
  });

  describe("removeCoupon", () => {
    it("should remove coupon successfully", async () => {
      mockApiService.delete.mockResolvedValue(mockCartBE);

      const cart = await cartService.removeCoupon();

      expect(mockApiService.delete).toHaveBeenCalledWith("/cart/coupon");
      expect(cart).toBeDefined();
    });

    it("should throw error on failure", async () => {
      mockApiService.delete.mockRejectedValue(
        new Error("Failed to remove coupon")
      );

      await expect(cartService.removeCoupon()).rejects.toThrow(
        "Failed to remove coupon"
      );
    });
  });

  describe("getItemCount", () => {
    it("should get cart item count", async () => {
      mockApiService.get.mockResolvedValue({ count: 5 });

      const count = await cartService.getItemCount();

      expect(mockApiService.get).toHaveBeenCalledWith("/cart/count");
      expect(count).toBe(5);
    });

    it("should return 0 for empty cart", async () => {
      mockApiService.get.mockResolvedValue({ count: 0 });

      const count = await cartService.getItemCount();

      expect(count).toBe(0);
    });

    it("should throw error on failure", async () => {
      mockApiService.get.mockRejectedValue(new Error("Failed to get count"));

      await expect(cartService.getItemCount()).rejects.toThrow(
        "Failed to get count"
      );
    });
  });

  describe("validate", () => {
    it("should validate cart successfully", async () => {
      const validation = {
        valid: true,
        errors: [],
      };

      mockApiService.get.mockResolvedValue(validation);

      const result = await cartService.validate();

      expect(mockApiService.get).toHaveBeenCalledWith("/cart/validate");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return validation errors", async () => {
      const validation = {
        valid: false,
        errors: [
          {
            itemId: "item1",
            productId: "product1",
            error: "Product out of stock",
          },
          {
            itemId: "item2",
            productId: "product2",
            error: "Price changed",
          },
        ],
      };

      mockApiService.get.mockResolvedValue(validation);

      const result = await cartService.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("Product out of stock");
    });
  });

  describe("Guest Cart - getGuestCart", () => {
    it("should get guest cart from localStorage", () => {
      const guestCart = [
        {
          id: "guest1",
          productId: "product1",
          productName: "Guest Product",
          quantity: 2,
        },
      ];

      localStorageMock.setItem("guest_cart", JSON.stringify(guestCart));

      const cart = cartService.getGuestCart();

      expect(cart).toHaveLength(1);
      expect(cart[0].productId).toBe("product1");
    });

    it("should return empty array if no guest cart", () => {
      const cart = cartService.getGuestCart();

      expect(cart).toEqual([]);
    });

    it("should return empty array on invalid JSON", () => {
      localStorageMock.setItem("guest_cart", "invalid-json{");

      const cart = cartService.getGuestCart();

      expect(cart).toEqual([]);
    });

    it("should return empty array in SSR environment", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const cart = cartService.getGuestCart();

      expect(cart).toEqual([]);

      (global as any).window = originalWindow;
    });
  });

  describe("Guest Cart - setGuestCart", () => {
    it("should set guest cart in localStorage", () => {
      const guestCart: CartItemFE[] = [
        {
          id: "guest1",
          productId: "product1",
          productName: "Guest Product",
          productSlug: "guest-product",
          productImage: "https://example.com/guest.jpg",
          variantId: null,
          variantName: null,
          sku: "SKU001",
          price: 100,
          quantity: 1,
          maxQuantity: 50,
          subtotal: 100,
          discount: 0,
          total: 100,
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
          addedAt: new Date(),
          formattedPrice: "₹100",
          formattedSubtotal: "₹100",
          formattedTotal: "₹100",
          isOutOfStock: false,
          isLowStock: false,
          canIncrement: true,
          canDecrement: false,
          hasDiscount: false,
          addedTimeAgo: "Just added",
        },
      ];

      cartService.setGuestCart(guestCart);

      const stored = localStorageMock.getItem("guest_cart");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].productId).toBe("product1");
    });

    it("should handle SSR environment gracefully", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      expect(() => cartService.setGuestCart([])).not.toThrow();

      (global as any).window = originalWindow;
    });
  });

  describe("Guest Cart - addToGuestCart", () => {
    it("should add new item to guest cart", () => {
      cartService.addToGuestCart({
        productId: "product1",
        productName: "Test Product",
        productSlug: "test-product",
        productImage: "https://example.com/test.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU001",
        price: 100,
        quantity: 1,
        maxQuantity: 50,
        subtotal: 100,
        discount: 0,
        total: 100,
        shopId: "shop1",
        shopName: "Shop 1",
        isAvailable: true,
      });

      const cart = cartService.getGuestCart();
      expect(cart).toHaveLength(1);
      expect(cart[0].productId).toBe("product1");
      expect(cart[0].quantity).toBe(1);
    });

    it("should increment quantity if item already exists", () => {
      // Add item first time
      cartService.addToGuestCart({
        productId: "product1",
        productName: "Test Product",
        productSlug: "test-product",
        productImage: "https://example.com/test.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU001",
        price: 100,
        quantity: 2,
        maxQuantity: 50,
        subtotal: 200,
        discount: 0,
        total: 200,
        shopId: "shop1",
        shopName: "Shop 1",
        isAvailable: true,
      });

      // Add same item again
      cartService.addToGuestCart({
        productId: "product1",
        productName: "Test Product",
        productSlug: "test-product",
        productImage: "https://example.com/test.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU001",
        price: 100,
        quantity: 3,
        maxQuantity: 50,
        subtotal: 300,
        discount: 0,
        total: 300,
        shopId: "shop1",
        shopName: "Shop 1",
        isAvailable: true,
      });

      const cart = cartService.getGuestCart();
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(5); // 2 + 3
    });

    it("should not exceed maxQuantity", () => {
      cartService.addToGuestCart({
        productId: "product1",
        productName: "Test Product",
        productSlug: "test-product",
        productImage: "https://example.com/test.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU001",
        price: 100,
        quantity: 8,
        maxQuantity: 10,
        subtotal: 800,
        discount: 0,
        total: 800,
        shopId: "shop1",
        shopName: "Shop 1",
        isAvailable: true,
      });

      cartService.addToGuestCart({
        productId: "product1",
        productName: "Test Product",
        productSlug: "test-product",
        productImage: "https://example.com/test.jpg",
        variantId: null,
        variantName: null,
        sku: "SKU001",
        price: 100,
        quantity: 5,
        maxQuantity: 10,
        subtotal: 500,
        discount: 0,
        total: 500,
        shopId: "shop1",
        shopName: "Shop 1",
        isAvailable: true,
      });

      const cart = cartService.getGuestCart();
      expect(cart[0].quantity).toBe(10); // Capped at maxQuantity
    });
  });

  describe("Guest Cart - addToGuestCartWithDetails", () => {
    it("should add product with full details", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 2,
      });

      const cart = cartService.getGuestCart();
      expect(cart).toHaveLength(1);
      expect(cart[0].productName).toBe("Test Product");
      expect(cart[0].quantity).toBe(2);
      expect(cart[0].subtotal).toBe(200);
    });

    it("should generate slug from product name", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product Name",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 1,
      });

      const cart = cartService.getGuestCart();
      expect(cart[0].productSlug).toBe("test-product-name");
    });

    it("should handle variant", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 1,
        variantId: "variant1",
      });

      const cart = cartService.getGuestCart();
      expect(cart[0].variantId).toBe("variant1");
    });
  });

  describe("Guest Cart - updateGuestCartItem", () => {
    it("should update item quantity", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 2,
      });

      const cart = cartService.getGuestCart();
      const itemId = cart[0].id;

      cartService.updateGuestCartItem(itemId, 5);

      const updatedCart = cartService.getGuestCart();
      expect(updatedCart[0].quantity).toBe(5);
      expect(updatedCart[0].subtotal).toBe(500);
    });

    it("should remove item if quantity is 0", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 2,
      });

      const cart = cartService.getGuestCart();
      const itemId = cart[0].id;

      cartService.updateGuestCartItem(itemId, 0);

      const updatedCart = cartService.getGuestCart();
      expect(updatedCart).toHaveLength(0);
    });

    it("should not exceed maxQuantity", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 2,
      });

      const cart = cartService.getGuestCart();
      const itemId = cart[0].id;

      cartService.updateGuestCartItem(itemId, 150);

      const updatedCart = cartService.getGuestCart();
      expect(updatedCart[0].quantity).toBe(100); // maxQuantity default
    });

    it("should do nothing if item not found", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 2,
      });

      cartService.updateGuestCartItem("invalid-id", 5);

      const cart = cartService.getGuestCart();
      expect(cart[0].quantity).toBe(2); // Unchanged
    });
  });

  describe("Guest Cart - removeFromGuestCart", () => {
    it("should remove item from guest cart", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product 1",
        price: 100,
        image: "https://example.com/test1.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 1,
      });

      cartService.addToGuestCartWithDetails({
        productId: "product2",
        name: "Test Product 2",
        price: 200,
        image: "https://example.com/test2.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 1,
      });

      const cart = cartService.getGuestCart();
      expect(cart).toHaveLength(2);

      const itemId = cart[0].id;
      cartService.removeFromGuestCart(itemId);

      const updatedCart = cartService.getGuestCart();
      expect(updatedCart).toHaveLength(1);
      expect(updatedCart[0].productId).toBe("product2");
    });

    it("should do nothing if item not found", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 1,
      });

      cartService.removeFromGuestCart("invalid-id");

      const cart = cartService.getGuestCart();
      expect(cart).toHaveLength(1);
    });
  });

  describe("Guest Cart - clearGuestCart", () => {
    it("should clear guest cart", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product",
        price: 100,
        image: "https://example.com/test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 1,
      });

      cartService.clearGuestCart();

      const cart = cartService.getGuestCart();
      expect(cart).toHaveLength(0);
    });

    it("should handle SSR environment", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      expect(() => cartService.clearGuestCart()).not.toThrow();

      (global as any).window = originalWindow;
    });
  });

  describe("Guest Cart - getGuestCartItemCount", () => {
    it("should return total quantity of all items", () => {
      cartService.addToGuestCartWithDetails({
        productId: "product1",
        name: "Test Product 1",
        price: 100,
        image: "https://example.com/test1.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 2,
      });

      cartService.addToGuestCartWithDetails({
        productId: "product2",
        name: "Test Product 2",
        price: 200,
        image: "https://example.com/test2.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
        quantity: 3,
      });

      const count = cartService.getGuestCartItemCount();
      expect(count).toBe(5); // 2 + 3
    });

    it("should return 0 for empty cart", () => {
      const count = cartService.getGuestCartItemCount();
      expect(count).toBe(0);
    });
  });
});
