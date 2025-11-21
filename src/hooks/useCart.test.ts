/// <reference types="@testing-library/jest-dom" />

import { renderHook, act, waitFor } from "@testing-library/react";
import { useCart } from "./useCart";
import { cartService } from "@/services/cart.service";

// Mock the AuthContext
const mockUser = { id: "user1", email: "test@example.com" };
const mockAuthContextValue = {
  user: null as any,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
};

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthContextValue,
}));

// Mock cartService
jest.mock("@/services/cart.service", () => ({
  cartService: {
    get: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    applyCoupon: jest.fn(),
    removeCoupon: jest.fn(),
    mergeGuestCart: jest.fn(),
    getGuestCart: jest.fn(),
    addToGuestCartWithDetails: jest.fn(),
    updateGuestCartItem: jest.fn(),
    removeFromGuestCart: jest.fn(),
    clearGuestCart: jest.fn(),
  },
}));

describe("useCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Guest user", () => {
    beforeEach(() => {
      mockAuthContextValue.user = null;
      mockAuthContextValue.isAuthenticated = false;
    });

    it("loads guest cart from localStorage", async () => {
      const mockGuestItems = [
        {
          productId: "prod1",
          quantity: 2,
          price: 100,
          productName: "Test Product",
          variantId: null,
          variantName: null,
          sku: "",
          maxQuantity: 100,
          discount: 0,
          isAvailable: true,
          addedAt: new Date(),
        },
      ];
      (cartService.getGuestCart as jest.Mock).mockReturnValue(mockGuestItems);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.cart).toBeTruthy();
        expect(result.current.cart?.items).toHaveLength(1);
        expect(result.current.cart?.itemCount).toBe(2);
      });

      expect(cartService.getGuestCart).toHaveBeenCalled();
    });

    it("adds item to guest cart", async () => {
      (cartService.getGuestCart as jest.Mock).mockReturnValue([]);
      (cartService.addToGuestCartWithDetails as jest.Mock).mockImplementation(
        () => {}
      );

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem("prod1", 1, undefined, {
          name: "Test Product",
          price: 100,
          image: "test.jpg",
          shopId: "shop1",
          shopName: "Test Shop",
        });
      });

      expect(cartService.addToGuestCartWithDetails).toHaveBeenCalledWith({
        productId: "prod1",
        quantity: 1,
        variantId: undefined,
        name: "Test Product",
        price: 100,
        image: "test.jpg",
        shopId: "shop1",
        shopName: "Test Shop",
      });
    });

    it("updates item in guest cart", async () => {
      const mockGuestItems = [
        {
          id: "item1",
          productId: "prod1",
          quantity: 2,
          price: 100,
          productName: "Test Product",
          variantId: null,
          variantName: null,
          sku: "",
          maxQuantity: 100,
          discount: 0,
          isAvailable: true,
          addedAt: new Date(),
        },
      ];
      (cartService.getGuestCart as jest.Mock).mockReturnValue(mockGuestItems);
      (cartService.updateGuestCartItem as jest.Mock).mockImplementation(
        () => {}
      );

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateItem("item1", 3);
      });

      expect(cartService.updateGuestCartItem).toHaveBeenCalledWith("item1", 3);
    });

    it("removes item from guest cart", async () => {
      const mockGuestItems = [
        {
          id: "item1",
          productId: "prod1",
          quantity: 2,
          price: 100,
          productName: "Test Product",
          variantId: null,
          variantName: null,
          sku: "",
          maxQuantity: 100,
          discount: 0,
          isAvailable: true,
          addedAt: new Date(),
        },
      ];
      (cartService.getGuestCart as jest.Mock).mockReturnValue(mockGuestItems);
      (cartService.removeFromGuestCart as jest.Mock).mockImplementation(
        () => {}
      );

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.removeItem("item1");
      });

      expect(cartService.removeFromGuestCart).toHaveBeenCalledWith("item1");
    });

    it("clears guest cart", async () => {
      const mockGuestItems = [
        {
          id: "item1",
          productId: "prod1",
          quantity: 2,
          price: 100,
          productName: "Test Product",
          variantId: null,
          variantName: null,
          sku: "",
          maxQuantity: 100,
          discount: 0,
          isAvailable: true,
          addedAt: new Date(),
        },
      ];
      (cartService.getGuestCart as jest.Mock).mockReturnValue(mockGuestItems);
      (cartService.clearGuestCart as jest.Mock).mockImplementation(() => {});

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.clearCart();
      });

      expect(cartService.clearGuestCart).toHaveBeenCalled();
    });
  });

  describe("Authenticated user", () => {
    beforeEach(() => {
      mockAuthContextValue.user = mockUser;
      mockAuthContextValue.isAuthenticated = true;
    });

    it("loads cart from API", async () => {
      const mockCart = {
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
      };
      (cartService.get as jest.Mock).mockResolvedValue(mockCart);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.cart).toEqual(mockCart);
      });

      expect(cartService.get).toHaveBeenCalled();
    });

    it("adds item to authenticated cart", async () => {
      (cartService.get as jest.Mock).mockResolvedValue({
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
      (cartService.addItem as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addItem("prod1", 1, "variant1");
      });

      expect(cartService.addItem).toHaveBeenCalledWith({
        productId: "prod1",
        quantity: 1,
        variantId: "variant1",
      });
    });

    it("applies coupon", async () => {
      const mockCart = {
        id: "cart1",
        userId: "user1",
        items: [],
        itemCount: 0,
        subtotal: 100,
        discount: 0,
        tax: 18,
        total: 118,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: null,
        formattedSubtotal: "₹100",
        formattedDiscount: "₹0",
        formattedTax: "₹18",
        formattedTotal: "₹118",
        isEmpty: false,
        hasItems: true,
        hasUnavailableItems: false,
        hasDiscount: false,
        itemsByShop: new Map(),
        shopIds: [],
        canCheckout: true,
        validationErrors: [],
        validationWarnings: [],
        expiresIn: null,
      };
      (cartService.get as jest.Mock).mockResolvedValue(mockCart);
      (cartService.applyCoupon as jest.Mock).mockResolvedValue({
        discount: 10,
        tax: 16.2,
        total: 106.2,
      });

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let resultValue;
      await act(async () => {
        resultValue = await result.current.applyCoupon("TEST10");
      });

      expect(cartService.applyCoupon).toHaveBeenCalledWith("TEST10");
      expect(resultValue).toEqual({
        discount: 10,
        tax: 16.2,
        total: 106.2,
      });
      expect(result.current.cart?.discount).toBe(10);
    });
  });

  it("handles errors", async () => {
    mockAuthContextValue.user = null;
    mockAuthContextValue.isAuthenticated = false;
    (cartService.getGuestCart as jest.Mock).mockImplementation(() => {
      throw new Error("Failed to load cart");
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Failed to load cart");
    });
  });
});
