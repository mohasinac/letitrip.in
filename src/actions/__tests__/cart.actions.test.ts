import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockAddItemToCart,
  mockUpdateCartItem,
  mockRemoveCartItem,
  mockClearCart,
  mockMergeGuestCart,
  mockGetCart,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockAddItemToCart: vi.fn(),
  mockUpdateCartItem: vi.fn(),
  mockRemoveCartItem: vi.fn(),
  mockClearCart: vi.fn(),
  mockMergeGuestCart: vi.fn(),
  mockGetCart: vi.fn(),
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
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  addItemToCart: mockAddItemToCart,
  updateCartItem: mockUpdateCartItem,
  removeCartItem: mockRemoveCartItem,
  clearCart: mockClearCart,
  mergeGuestCart: mockMergeGuestCart,
  getCart: mockGetCart,
  updateCartItemShipping: vi.fn().mockResolvedValue({}),
}));

import {
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
  mergeGuestCartAction,
  getCartAction,
} from "../cart.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeCart(overrides: Record<string, unknown> = {}) {
  return { id: "cart-user-buyer-1", userId: "user-buyer-1", items: [], ...overrides };
}

function makeValidAddInput(overrides: Record<string, unknown> = {}) {
  return {
    productId: "product-hot-wheels-redline",
    productTitle: "Hot Wheels Redline",
    productImage: "/media/product-image-hot-wheels-1.jpg",
    price: 50000,
    currency: "INR",
    quantity: 1,
    storeId: "store-diecast-depot",
    storeName: "Diecast Depot",
    listingType: "standard" as const,
    ...overrides,
  };
}

describe("addToCartAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAddItemToCart.mockResolvedValue(makeCart());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await addToCartAction(makeValidAddInput());
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await addToCartAction(makeValidAddInput());
    expect(result.ok).toBe(false);
  });
});

describe("addToCartAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAddItemToCart.mockResolvedValue(makeCart());
  });

  it("missing productId (empty string) → { ok: false }", async () => {
    const result = await addToCartAction(makeValidAddInput({ productId: "" }));
    expect(result.ok).toBe(false);
  });

  it("price <= 0 → { ok: false }", async () => {
    const result = await addToCartAction(makeValidAddInput({ price: 0 }));
    expect(result.ok).toBe(false);
  });

  it("quantity > 99 → { ok: false }", async () => {
    const result = await addToCartAction(makeValidAddInput({ quantity: 100 }));
    expect(result.ok).toBe(false);
  });

  it("quantity < 1 → { ok: false }", async () => {
    const result = await addToCartAction(makeValidAddInput({ quantity: 0 }));
    expect(result.ok).toBe(false);
  });

  it("listingType not in enum → { ok: false }", async () => {
    const result = await addToCartAction(makeValidAddInput({ listingType: "unknown-type" }));
    expect(result.ok).toBe(false);
  });
});

describe("addToCartAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAddItemToCart.mockResolvedValue(makeCart());
  });

  it("valid standard → addItemToCart called with (uid, parsedData)", async () => {
    await addToCartAction(makeValidAddInput());
    expect(mockAddItemToCart).toHaveBeenCalledWith(
      "user-buyer-1",
      expect.objectContaining({ productId: "product-hot-wheels-redline" }),
    );
  });

  it("offerId present → forwarded to addItemToCart", async () => {
    await addToCartAction(makeValidAddInput({ offerId: "offer-abc" }));
    const arg = mockAddItemToCart.mock.calls[0][1];
    expect(arg.offerId).toBe("offer-abc");
  });

  it("lockedPrice present → forwarded to addItemToCart", async () => {
    await addToCartAction(makeValidAddInput({ lockedPrice: 45000 }));
    const arg = mockAddItemToCart.mock.calls[0][1];
    expect(arg.lockedPrice).toBe(45000);
  });

  it("returns { ok: true, data: CartDocument }", async () => {
    const result = await addToCartAction(makeValidAddInput());
    expect(result.ok).toBe(true);
  });
});

describe("updateCartItemAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateCartItem.mockResolvedValue(makeCart());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await updateCartItemAction("item-1", { quantity: 2 });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await updateCartItemAction("item-1", { quantity: 2 });
    expect(result.ok).toBe(false);
  });

  it("empty itemId → { ok: false, error: /required/i }", async () => {
    const result = await updateCartItemAction("", { quantity: 2 });
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/required/i);
  });

  it("quantity > 99 → { ok: false }", async () => {
    const result = await updateCartItemAction("item-1", { quantity: 100 });
    expect(result.ok).toBe(false);
  });

  it("valid → updateCartItem called with (uid, itemId, parsedData)", async () => {
    await updateCartItemAction("item-1", { quantity: 2 });
    expect(mockUpdateCartItem).toHaveBeenCalledWith(
      "user-buyer-1",
      "item-1",
      expect.objectContaining({ quantity: 2 }),
    );
  });
});

describe("removeFromCartAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockRemoveCartItem.mockResolvedValue(makeCart());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await removeFromCartAction("item-1");
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await removeFromCartAction("item-1");
    expect(result.ok).toBe(false);
  });

  it("empty itemId → { ok: false, error: /required/i }", async () => {
    const result = await removeFromCartAction("");
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/required/i);
  });

  it("valid → removeCartItem called with (uid, itemId)", async () => {
    await removeFromCartAction("item-1");
    expect(mockRemoveCartItem).toHaveBeenCalledWith("user-buyer-1", "item-1");
  });
});

describe("clearCartAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockClearCart.mockResolvedValue(makeCart());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await clearCartAction();
    expect(result.ok).toBe(false);
  });

  it("valid → clearCart called with uid", async () => {
    await clearCartAction();
    expect(mockClearCart).toHaveBeenCalledWith("user-buyer-1");
  });
});

describe("mergeGuestCartAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockMergeGuestCart.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(
      mergeGuestCartAction([{ productId: "product-1", quantity: 1 }]),
    ).rejects.toThrow();
  });

  it("empty items array → throws (schema min(1))", async () => {
    await expect(mergeGuestCartAction([])).rejects.toThrow();
  });

  it("items array > 50 → throws", async () => {
    const items = Array.from({ length: 51 }, (_, i) => ({ productId: `product-${i}`, quantity: 1 }));
    await expect(mergeGuestCartAction(items)).rejects.toThrow();
  });

  it("quantity > 99 in one item → throws", async () => {
    await expect(
      mergeGuestCartAction([{ productId: "product-1", quantity: 100 }]),
    ).rejects.toThrow();
  });

  it("valid → mergeGuestCart called with (uid, parsedItems)", async () => {
    const items = [{ productId: "product-1", quantity: 2 }];
    await mergeGuestCartAction(items);
    expect(mockMergeGuestCart).toHaveBeenCalledWith("user-buyer-1", items);
  });
});

describe("getCartAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockGetCart.mockResolvedValue(makeCart());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getCartAction();
    expect(result.ok).toBe(false);
  });

  it("valid → getCart called with uid", async () => {
    await getCartAction();
    expect(mockGetCart).toHaveBeenCalledWith("user-buyer-1");
  });
});
