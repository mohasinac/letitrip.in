import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRedirect,
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockProductRepositoryFindByIdOrSlug,
  mockAddItemToCart,
  mockGetDefaultCurrency,
} = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockProductRepositoryFindByIdOrSlug: vi.fn(),
  mockAddItemToCart: vi.fn(),
  mockGetDefaultCurrency: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  ROUTES: { USER: { CHECKOUT: "/en/user/checkout" } },
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  addItemToCart: mockAddItemToCart,
  productRepository: { findByIdOrSlug: mockProductRepositoryFindByIdOrSlug },
  getDefaultCurrency: mockGetDefaultCurrency,
}));

import { reservePreOrderAction } from "../pre-order.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", role: "user", ...overrides };
}

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "preorder-goku-ultra-ego",
    title: "Goku Ultra Ego",
    price: 49900,
    currency: "INR",
    storeId: "store-gundam-galaxy",
    storeName: "Gundam Galaxy",
    images: ["https://example.com/goku.jpg"],
    listingType: "pre-order",
    ...overrides,
  };
}

describe("reservePreOrderAction — no wrapAction (throws raw)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockProductRepositoryFindByIdOrSlug.mockResolvedValue(makeProduct());
    mockAddItemToCart.mockResolvedValue(undefined);
    mockGetDefaultCurrency.mockReturnValue("INR");
    mockRedirect.mockReturnValue(undefined);
  });

  it("empty productId (manual guard) → throws BEFORE auth check", async () => {
    await expect(reservePreOrderAction("")).rejects.toThrow(/product id/i);
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
  });

  it("unauthenticated (requireAuthUser throws) → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow(/too many/i);
  });

  it("rate limit key is pre-order:reserve:{uid}", async () => {
    await reservePreOrderAction("preorder-goku-ultra-ego");
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "pre-order:reserve:user-buyer-1",
      expect.anything(),
    );
  });

  it("product not found (findByIdOrSlug returns null) → throws", async () => {
    mockProductRepositoryFindByIdOrSlug.mockResolvedValue(null);
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow(/not found/i);
  });

  it("product not found (findByIdOrSlug rejects) → throws", async () => {
    mockProductRepositoryFindByIdOrSlug.mockRejectedValue(new Error("Network error"));
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow(/not found/i);
  });

  it("product.price <= 0 (manual guard) → throws", async () => {
    mockProductRepositoryFindByIdOrSlug.mockResolvedValue(makeProduct({ price: 0 }));
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow(/price/i);
  });

  it("product.price is null → throws", async () => {
    mockProductRepositoryFindByIdOrSlug.mockResolvedValue(makeProduct({ price: null }));
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow(/price/i);
  });

  it("product.storeId is empty → throws", async () => {
    mockProductRepositoryFindByIdOrSlug.mockResolvedValue(makeProduct({ storeId: "" }));
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow(/store/i);
  });

  it("valid → addItemToCart called with (user.uid, cart item)", async () => {
    await reservePreOrderAction("preorder-goku-ultra-ego");
    expect(mockAddItemToCart).toHaveBeenCalledWith(
      "user-buyer-1",
      expect.objectContaining({
        productId: "preorder-goku-ultra-ego",
        listingType: "pre-order",
        price: 49900,
        storeId: "store-gundam-galaxy",
        quantity: 1,
      }),
    );
  });

  it("valid → redirect called to checkout route", async () => {
    await reservePreOrderAction("preorder-goku-ultra-ego");
    expect(mockRedirect).toHaveBeenCalledWith("/en/user/checkout");
  });

  it("addItemToCart throws → propagates", async () => {
    mockAddItemToCart.mockRejectedValue(new Error("Cart full"));
    await expect(reservePreOrderAction("preorder-goku-ultra-ego")).rejects.toThrow("Cart full");
  });

  it("product images array → uses first image as productImage", async () => {
    await reservePreOrderAction("preorder-goku-ultra-ego");
    const call = mockAddItemToCart.mock.calls[0];
    expect(call[1].productImage).toBe("https://example.com/goku.jpg");
  });

  it("product mainImage fallback when images not an array", async () => {
    mockProductRepositoryFindByIdOrSlug.mockResolvedValue(
      makeProduct({ images: undefined, mainImage: "https://example.com/main.jpg" }),
    );
    await reservePreOrderAction("preorder-goku-ultra-ego");
    const call = mockAddItemToCart.mock.calls[0];
    expect(call[1].productImage).toBe("https://example.com/main.jpg");
  });
});
