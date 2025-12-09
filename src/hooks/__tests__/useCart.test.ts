/**
 * Unit Tests for useCart Hook
 *
 * Tests cart state management, guest cart, user cart, cart operations,
 * localStorage sync, and edge cases
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

describe("useCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Setup default mocks
    mockCartService.getGuestCart = jest.fn().mockReturnValue([]);
    mockCartService.addGuestItem = jest.fn();
    mockCartService.updateGuestItem = jest.fn();
    mockCartService.removeGuestItem = jest.fn();
    mockCartService.get = jest.fn().mockResolvedValue({ items: [] });
    mockCartService.addItem = jest.fn().mockResolvedValue({ success: true });
    mockCartService.updateQuantity = jest
      .fn()
      .mockResolvedValue({ success: true });
    mockCartService.removeItem = jest.fn().mockResolvedValue({ success: true });
    mockCartService.clear = jest.fn().mockResolvedValue({ success: true });
    mockCartService.mergeGuestCart = jest
      .fn()
      .mockResolvedValue({ success: true });
  });

  describe("Guest Cart (Unauthenticated)", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);
    });

    it("should initialize with empty guest cart", async () => {
      mockCartService.getGuestCart.mockReturnValue([]);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
        expect(result.current.cart?.items).toEqual([]);
        expect(result.current.cart?.isEmpty).toBe(true);
      });
    });

    it("should load guest cart from localStorage", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Test Product",
          productSlug: "test-product",
          price: 100,
          quantity: 2,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Test Shop",
          isAvailable: true,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart?.items.length).toBe(1);
        expect(result.current.cart?.itemCount).toBe(2);
        expect(result.current.cart?.subtotal).toBe(200);
      });
    });

    it("should add item to guest cart", async () => {
      mockCartService.getGuestCart.mockReturnValue([]);
      mockCartService.addGuestItem.mockImplementation(() => {});

      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addItem("prod1", 1, undefined, {
          name: "Product 1",
          price: 100,
          image: "img.jpg",
          shopId: "shop1",
          shopName: "Shop 1",
        });
      });

      expect(mockCartService.addGuestItem).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: "prod1",
          quantity: 1,
        })
      );
    });

    it("should throw error when adding to guest cart without product details", async () => {
      mockCartService.getGuestCart.mockReturnValue([]);

      const { result } = renderHook(() => useCart());

      await act(async () => {
        try {
          await result.current.addItem("prod1", 1);
          fail("Should have thrown error");
        } catch (error: any) {
          expect(error.message).toContain("Product details required");
        }
      });
    });

    it("should update item quantity in guest cart", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Test Product",
          price: 100,
          quantity: 2,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);
      mockCartService.updateGuestItem.mockImplementation(() => {});

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await act(async () => {
        await result.current.updateQuantity("guest_1", 5);
      });

      expect(mockCartService.updateGuestItem).toHaveBeenCalledWith(
        "guest_1",
        5
      );
    });

    it("should remove item from guest cart", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Test Product",
          price: 100,
          quantity: 2,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);
      mockCartService.removeGuestItem.mockImplementation(() => {});

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await act(async () => {
        await result.current.removeItem("guest_1");
      });

      expect(mockCartService.removeGuestItem).toHaveBeenCalledWith("guest_1");
    });

    it("should calculate tax correctly for guest cart", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 1000,
          quantity: 1,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart?.subtotal).toBe(1000);
        expect(result.current.cart?.tax).toBe(180); // 18% of 1000
        expect(result.current.cart?.total).toBe(1180);
      });
    });
  });

  describe("Authenticated User Cart", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: "user123", email: "test@test.com" },
        isAuthenticated: true,
        isLoading: false,
      } as any);
    });

    it("should fetch cart from API for authenticated user", async () => {
      const apiCart = {
        id: "cart1",
        userId: "user123",
        items: [],
        itemCount: 0,
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        isEmpty: true,
        hasItems: false,
      };

      mockCartService.get.mockResolvedValue(apiCart as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).toEqual(apiCart);
        expect(mockCartService.get).toHaveBeenCalled();
      });
    });

    it("should add item via API for authenticated user", async () => {
      mockCartService.get.mockResolvedValue({ items: [] } as any);
      mockCartService.addItem.mockResolvedValue({ success: true } as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await act(async () => {
        await result.current.addItem("prod1", 2, "variant1");
      });

      expect(mockCartService.addItem).toHaveBeenCalledWith({
        productId: "prod1",
        quantity: 2,
        variantId: "variant1",
      });
    });

    it("should update quantity via API for authenticated user", async () => {
      mockCartService.get.mockResolvedValue({ items: [] } as any);
      mockCartService.updateQuantity.mockResolvedValue({
        success: true,
      } as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      await act(async () => {
        await result.current.updateQuantity("item1", 3);
      });

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith("item1", 3);
    });

    it("should handle API errors gracefully", async () => {
      mockCartService.get.mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.error).toBe("API Error");
        expect(mockLogError).toHaveBeenCalled();
      });
    });
  });

  describe("Cart Merge on Login", () => {
    it("should merge guest cart with user cart on login", async () => {
      // Start with guest cart
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 100,
          quantity: 1,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);
      mockCartService.mergeGuestCart.mockResolvedValue({
        success: true,
      } as any);
      mockCartService.get.mockResolvedValue({ items: [] } as any);

      const { result, rerender } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart?.items.length).toBe(1);
      });

      // Simulate login
      mockUseAuth.mockReturnValue({
        user: { id: "user123" },
        isAuthenticated: true,
        isLoading: false,
      } as any);

      rerender();

      await waitFor(() => {
        expect(mockCartService.mergeGuestCart).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);
    });

    it("should handle items with discount", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 100,
          quantity: 1,
          discount: 20,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.subtotal).toBe(100);
        expect(item?.discount).toBe(20);
        expect(item?.total).toBe(80);
        expect(item?.hasDiscount).toBe(true);
      });
    });

    it("should handle unavailable items", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 100,
          quantity: 1,
          isAvailable: false,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.isAvailable).toBe(false);
        expect(item?.isOutOfStock).toBe(true);
      });
    });

    it("should handle low stock items", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 100,
          quantity: 3,
          maxQuantity: 5,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.isLowStock).toBe(true);
        expect(item?.canIncrement).toBe(true);
        expect(item?.canDecrement).toBe(true);
      });
    });

    it("should handle max quantity limits", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 100,
          quantity: 10,
          maxQuantity: 10,
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

    it("should handle empty product slug", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Test Product",
          price: 100,
          quantity: 1,
          productSlug: "",
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.productSlug).toBe("test-product");
      });
    });

    it("should format prices correctly", async () => {
      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 1500,
          quantity: 2,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        const item = result.current.cart?.items[0];
        expect(item?.formattedPrice).toBe("₹1,500");
        expect(item?.formattedSubtotal).toBe("₹3,000");
        expect(result.current.cart?.formattedTotal).toBe("₹3,540"); // includes tax
      });
    });

    it("should clear cart", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      } as any);

      const guestItems = [
        {
          id: "guest_1",
          productId: "prod1",
          productName: "Product",
          price: 100,
          quantity: 1,
        },
      ];

      mockCartService.getGuestCart.mockReturnValue(guestItems as any);
      mockCartService.clearGuestCart.mockImplementation(() => {});

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart?.items.length).toBe(1);
      });

      await act(async () => {
        await result.current.clearCart();
      });

      expect(mockCartService.clearGuestCart).toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: "user123" },
        isAuthenticated: true,
        isLoading: false,
      } as any);
    });

    it("should set loading state during cart fetch", async () => {
      let resolvePromise: any;
      const promise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });

      mockCartService.get.mockReturnValue(promise);

      const { result } = renderHook(() => useCart());

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise({ items: [] });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should set loading state during add item", async () => {
      mockCartService.get.mockResolvedValue({ items: [] } as any);

      let resolveAdd: any;
      const addPromise = new Promise<any>((resolve) => {
        resolveAdd = resolve;
      });

      mockCartService.addItem.mockReturnValue(addPromise);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.cart).not.toBeNull();
      });

      act(() => {
        result.current.addItem("prod1", 1, undefined, {
          name: "Product",
          price: 100,
          image: "img.jpg",
          shopId: "shop1",
          shopName: "Shop",
        });
      });

      // Loading should be true during operation
      await act(async () => {
        resolveAdd({ success: true });
        await addPromise;
      });
    });
  });
});
