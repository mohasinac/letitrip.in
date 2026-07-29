import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  deleteCartItem,
  updateCartItemQty,
  validateCart,
} from "../cart-client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("cart-client typed wrappers", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("deleteCartItem calls DELETE /api/cart/:itemId", async () => {
    mockFetch.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    await deleteCartItem("item-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cart/item-1",
      expect.objectContaining({ method: "DELETE", credentials: "include" }),
    );
  });

  test("updateCartItemQty calls PATCH /api/cart/:itemId with quantity in body", async () => {
    mockFetch.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    await updateCartItemQty("item-2", 3);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cart/item-2",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ quantity: 3 }),
      }),
    );
  });

  test("validateCart calls POST /api/cart/validate with productIds", async () => {
    mockFetch.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    await validateCart(["product-1", "product-2"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cart/validate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ productIds: ["product-1", "product-2"] }),
      }),
    );
  });

  test("deleteCartItem URL-encodes special chars in itemId", async () => {
    mockFetch.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    await deleteCartItem("item/with/slashes");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/cart/item%2Fwith%2Fslashes",
      expect.anything(),
    );
  });
});
