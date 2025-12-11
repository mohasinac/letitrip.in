/**
 * Extended Unit Tests for useCart Hook
 *
 * Additional comprehensive tests for edge cases, error handling,
 * guest/user transitions, and complex cart scenarios
 */

import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { cartService } from "@/services/cart.service";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCart } from "../useCart";

// Mock dependencies
jest.mock("@/services/cart.service");
jest.mock("@/contexts/AuthContext");
jest.mock("@/lib/firebase-error-logger");

const mockCartService = cartService as jest.Mocked<typeof cartService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe("useCart - Extended Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Setup default mocks
    mockCartService.getGuestCart = jest.fn().mockReturnValue([]);
    mockCartService.addGuestItem = jest.fn();
    mockCartService.updateGuestItem = jest.fn();
    mockCartService.removeGuestItem = jest.fn();
    mockCartService.clearGuestCart = jest.fn();
    mockCartService.get = jest.fn().mockResolvedValue({
      id: "cart1",
      userId: "user1",
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: null,
      formattedSubtotal: "₹0",
      formattedDiscount: "₹0",
      formattedTax: "₹0",
      formattedTotal: "₹0",
      isEmpty: true,
      hasItems: false,
      hasUnavailableItems: false,
      hasDiscount: false,
      itemsByShop: new Map(),
      shopIds: [],
      canCheckout: false,
      validationErrors: [],
      validationWarnings: [],
      expiresIn: null,
    });
    mockCartService.addItem = jest.fn().mockResolvedValue({ success: true });
    mockCartService.updateQuantity = jest
      .fn()
      .mockResolvedValue({ success: true });
    mockCartService.removeCartItem = jest
      .fn()
      .mockResolvedValue({ success: true });
    mockCartService.clearCart = jest.fn().mockResolvedValue({ success: true });
    mockCartService.mergeGuestCart = jest
      .fn()
      .mockResolvedValue({ success: true });
    mockCartService.applyCoupon = jest.fn().mockResolvedValue({
      discount: 50,
      tax: 18,
      total: 150,
    });
    mockCartService.removeCoupon = jest.fn().mockResolvedValue({
      tax: 18,
      total: 200,
    });
  });

  describe("Edge Cases - Guest Cart", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);
    });

    it("should handle empty product details gracefully", async () => {
      mockCartService.getGuestCart.mockReturnValue([]);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.addItem("prod1", 1);
        });
      }).rejects.toThrow("Product details required for guest cart");
    });

    it("should calculate tax correctly for guest cart", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product 1",
          productSlug: "product-1",
          price: 1000,
          quantity: 2,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
          discount: 100,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
        // subtotal = (1000 * 2) - 100 = 1900
        // tax = 1900 * 0.18 = 342
        // total = 1900 + 342 = 2242
        expect(result.current.cart?.subtotal).toBe(1900);
        expect(result.current.cart?.tax).toBe(342);
        expect(result.current.cart?.total).toBe(2242);
      });
    });

    it("should generate unique IDs for guest items", async () => {
      mockCartService.getGuestCart.mockReturnValue([]);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      const productDetails = {
        name: "Test Product",
        price: 100,
        image: "test.jpg",
        shopId: "shop1",
        shopName: "Shop 1",
      };

      await act(async () => {
        await result.current.addItem("prod1", 1, undefined, productDetails);
      });

      expect(mockCartService.addGuestItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^guest_\d+_0\.\d+$/),
          productId: "prod1",
        })
      );
    });

    it("should transform guest items with all required fields", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Test Product",
          price: 500,
          quantity: 3,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item).toMatchObject({
          id: expect.any(String),
          productId: "prod1",
          productName: "Test Product",
          productSlug: expect.any(String),
          price: 500,
          quantity: 3,
          subtotal: 1500,
          total: 1500,
          isAvailable: true,
          formattedPrice: expect.any(String),
          formattedSubtotal: expect.any(String),
          formattedTotal: expect.any(String),
          canIncrement: true,
          canDecrement: true,
          hasDiscount: false,
        });
      });
    });

    it("should handle missing optional fields in guest items", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Test Product",
          price: 100,
          quantity: 1,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
          // Missing: variantId, variantName, sku, maxQuantity, discount
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.variantId).toBeNull();
        expect(item?.variantName).toBeNull();
        expect(item?.sku).toBe("");
        expect(item?.maxQuantity).toBe(100);
        expect(item?.discount).toBe(0);
      });
    });
  });

  describe("Edge Cases - Authenticated Cart", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);
    });

    it("should handle API errors gracefully on load", async () => {
      const error = new Error("Network error");
      mockCartService.get.mockRejectedValue(error);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
        expect(mockLogError).toHaveBeenCalledWith(error, {
          component: "useCart.loadCart",
        });
      });
    });

    it("should handle API errors on addItem", async () => {
      const error = new Error("Product out of stock");
      mockCartService.addItem.mockRejectedValue(error);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.addItem("prod1", 1, "variant1");
        });
      }).rejects.toThrow("Product out of stock");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "useCart.addItem",
        metadata: { productId: "prod1", quantity: 1, variant: "variant1" },
      });
    });

    it("should handle API errors on updateQuantity", async () => {
      const error = new Error("Invalid quantity");
      mockCartService.updateQuantity.mockRejectedValue(error);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.updateQuantity("item1", 10);
        });
      }).rejects.toThrow("Invalid quantity");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "useCart.updateQuantity",
        metadata: { itemId: "item1", quantity: 10 },
      });
    });

    it("should handle API errors on removeItem", async () => {
      const error = new Error("Item not found");
      mockCartService.removeCartItem.mockRejectedValue(error);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.removeItem("item1");
        });
      }).rejects.toThrow("Item not found");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "useCart.removeItem",
        metadata: { itemId: "item1" },
      });
    });

    it("should handle API errors on clearCart", async () => {
      const error = new Error("Clear failed");
      mockCartService.clearCart.mockRejectedValue(error);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.clearCart();
        });
      }).rejects.toThrow("Clear failed");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "useCart.clearCart",
      });
    });
  });

  describe("Coupon Functionality", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);
    });

    it("should apply coupon and update cart totals", async () => {
      mockCartService.get.mockResolvedValue({
        id: "cart1",
        userId: "user1",
        items: [],
        itemCount: 1,
        subtotal: 200,
        discount: 0,
        tax: 36,
        total: 236,
      } as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await act(async () => {
        await result.current.applyCoupon("SAVE50");
      });

      expect(mockCartService.applyCoupon).toHaveBeenCalledWith("SAVE50");
      expect(result.current.cart?.discount).toBe(50);
      expect(result.current.cart?.total).toBe(150);
    });

    it("should not apply coupon for guest users", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      mockCartService.getGuestCart.mockReturnValue([]);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.applyCoupon("SAVE50");
        });
      }).rejects.toThrow("Please login to apply coupons");

      expect(mockCartService.applyCoupon).not.toHaveBeenCalled();
    });

    it("should handle coupon errors", async () => {
      const error = new Error("Invalid coupon code");
      mockCartService.applyCoupon.mockRejectedValue(error);

      mockCartService.get.mockResolvedValue({
        id: "cart1",
        userId: "user1",
        items: [],
      } as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await expect(async () => {
        await act(async () => {
          await result.current.applyCoupon("INVALID");
        });
      }).rejects.toThrow("Invalid coupon code");

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "useCart.applyCoupon",
        metadata: { code: "INVALID" },
      });
    });

    it("should remove coupon and recalculate totals", async () => {
      mockCartService.get.mockResolvedValue({
        id: "cart1",
        userId: "user1",
        items: [],
        itemCount: 1,
        subtotal: 200,
        discount: 50,
        tax: 18,
        total: 150,
      } as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await act(async () => {
        await result.current.removeCoupon();
      });

      expect(mockCartService.removeCoupon).toHaveBeenCalled();
      expect(result.current.cart?.discount).toBe(0);
      expect(result.current.cart?.total).toBe(200);
    });

    it("should not error when removing coupon as guest", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      mockCartService.getGuestCart.mockReturnValue([]);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await act(async () => {
        await result.current.removeCoupon();
      });

      expect(mockCartService.removeCoupon).not.toHaveBeenCalled();
    });
  });

  describe("Guest Cart Merging", () => {
    it("should merge guest cart on login", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product 1",
          productSlug: "product-1",
          price: 100,
          quantity: 2,
          variantId: "variant1",
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      // Start as guest
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      const { result, rerender } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart?.items.length).toBe(1);
      });

      // User logs in
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);

      rerender();

      await waitFor(() => {
        expect(mockCartService.mergeGuestCart).toHaveBeenCalledWith([
          {
            productId: "prod1",
            quantity: 2,
            variantId: "variant1",
          },
        ]);
        expect(mockCartService.clearGuestCart).toHaveBeenCalled();
        expect(result.current.isMerging).toBe(false);
      });
    });

    it("should not merge if no guest items", async () => {
      mockCartService.getGuestCart.mockReturnValue([]);

      // Start as guest
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      const { rerender } = renderHook(() => useCart());

      // User logs in
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);

      rerender();

      await waitFor(() => {
        expect(mockCartService.mergeGuestCart).not.toHaveBeenCalled();
      });
    });

    it("should handle merge errors gracefully", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product 1",
          productSlug: "product-1",
          price: 100,
          quantity: 2,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const error = new Error("Merge failed");
      mockCartService.mergeGuestCart.mockRejectedValue(error);

      // Start as guest
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      const { result, rerender } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      // User logs in
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.error).toBe("Merge failed");
        expect(result.current.isMerging).toBe(false);
        expect(mockLogError).toHaveBeenCalledWith(error, {
          component: "useCart.mergeGuestCart",
        });
      });
    });

    it("should show merge success message temporarily", async () => {
      jest.useFakeTimers();

      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product 1",
          productSlug: "product-1",
          price: 100,
          quantity: 1,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      // Start as guest
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      const { result, rerender } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      // User logs in
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.mergeSuccess).toBe(true);
      });

      // Fast-forward 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(result.current.mergeSuccess).toBe(false);
      });

      jest.useRealTimers();
    });
  });

  describe("Cart Refresh", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);
    });

    it("should refresh cart data", async () => {
      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      const callCount = mockCartService.get.mock.calls.length;

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockCartService.get).toHaveBeenCalledTimes(callCount + 1);
    });
  });

  describe("Loading States", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);
    });

    it("should set loading state during initial load", async () => {
      let resolveGet: any;
      mockCartService.get.mockReturnValue(
        new Promise((resolve) => {
          resolveGet = resolve;
        })
      );

      const { result } = renderHook(() => useCart());

      expect(result.current.loading).toBe(true);

      resolveGet({ items: [] });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should set merging state during guest cart merge", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product 1",
          productSlug: "product-1",
          price: 100,
          quantity: 1,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      let resolveMerge: any;
      mockCartService.mergeGuestCart.mockReturnValue(
        new Promise((resolve) => {
          resolveMerge = resolve;
        })
      );

      // Start as guest
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      const { result, rerender } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      // User logs in
      mockUseAuth.mockReturnValue({
        user: { uid: "user1", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.isMerging).toBe(true);
      });

      resolveMerge({ success: true });

      await waitFor(() => {
        expect(result.current.isMerging).toBe(false);
      });
    });
  });

  describe("Quantity Constraints", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);
    });

    it("should respect maxQuantity in guest cart", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Limited Product",
          productSlug: "limited-product",
          price: 100,
          quantity: 5,
          maxQuantity: 5,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.canIncrement).toBe(false);
        expect(item?.canDecrement).toBe(true);
      });
    });

    it("should show low stock indicator", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Low Stock Product",
          productSlug: "low-stock-product",
          price: 100,
          quantity: 1,
          maxQuantity: 3,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.isLowStock).toBe(true);
      });
    });

    it("should prevent decrement below 1", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          productSlug: "product",
          price: 100,
          quantity: 1,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.canDecrement).toBe(false);
      });
    });
  });
});
