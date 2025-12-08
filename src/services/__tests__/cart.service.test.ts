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
});
