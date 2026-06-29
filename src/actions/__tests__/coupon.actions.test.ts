import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockValidateCoupon,
  mockValidateCouponForCart,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockValidateCoupon: vi.fn(),
  mockValidateCouponForCart: vi.fn(),
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
  validateCoupon: mockValidateCoupon,
  validateCouponForCart: mockValidateCouponForCart,
}));

import { validateCouponAction, validateCouponForCartAction } from "../coupon.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeCouponResult(overrides: Record<string, unknown> = {}) {
  return { valid: true, discount: 1000, code: "WELCOME10", ...overrides };
}

function makeCartItem(overrides: Record<string, unknown> = {}) {
  return {
    productId: "product-hot-wheels-redline",
    storeId: "store-diecast-depot",
    price: 50000,
    quantity: 1,
    listingType: "standard" as const,
    ...overrides,
  };
}

describe("validateCouponAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockValidateCoupon.mockResolvedValue(makeCouponResult());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await validateCouponAction({ code: "WELCOME10", orderTotal: 50000 });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false, error: /too many/i }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await validateCouponAction({ code: "WELCOME10", orderTotal: 50000 });
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/too many/i);
  });
});

describe("validateCouponAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockValidateCoupon.mockResolvedValue(makeCouponResult());
  });

  it("code empty string → { ok: false }", async () => {
    const result = await validateCouponAction({ code: "", orderTotal: 50000 });
    expect(result.ok).toBe(false);
  });

  it("code > 50 chars → { ok: false }", async () => {
    const result = await validateCouponAction({ code: "x".repeat(51), orderTotal: 50000 });
    expect(result.ok).toBe(false);
  });

  it("orderTotal < 0 → { ok: false }", async () => {
    const result = await validateCouponAction({ code: "WELCOME10", orderTotal: -1 });
    expect(result.ok).toBe(false);
  });
});

describe("validateCouponAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockValidateCoupon.mockResolvedValue(makeCouponResult({ valid: true, discount: 5000 }));
  });

  it("valid → validateCoupon called with (uid, code, orderTotal)", async () => {
    await validateCouponAction({ code: "WELCOME10", orderTotal: 50000 });
    expect(mockValidateCoupon).toHaveBeenCalledWith("user-buyer-1", "WELCOME10", 50000);
  });

  it("returns validateCoupon result as-is", async () => {
    const result = await validateCouponAction({ code: "WELCOME10", orderTotal: 50000 });
    expect(result.ok).toBe(true);
    expect((result as { data: Record<string, unknown> }).data).toMatchObject({ valid: true, discount: 5000 });
  });
});

describe("validateCouponForCartAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockValidateCouponForCart.mockResolvedValue({ valid: true });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await validateCouponForCartAction({ code: "WELCOME10", cartItems: [makeCartItem()] });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await validateCouponForCartAction({ code: "WELCOME10", cartItems: [makeCartItem()] });
    expect(result.ok).toBe(false);
  });
});

describe("validateCouponForCartAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockValidateCouponForCart.mockResolvedValue({ valid: true });
  });

  it("code empty → { ok: false }", async () => {
    const result = await validateCouponForCartAction({ code: "", cartItems: [makeCartItem()] });
    expect(result.ok).toBe(false);
  });

  it("cartItems empty array → { ok: false }", async () => {
    const result = await validateCouponForCartAction({ code: "WELCOME10", cartItems: [] });
    expect(result.ok).toBe(false);
  });

  it("cartItem with listingType not in enum → { ok: false }", async () => {
    const result = await validateCouponForCartAction({
      code: "WELCOME10",
      cartItems: [makeCartItem({ listingType: "bundle" })],
    });
    expect(result.ok).toBe(false);
  });
});

describe("validateCouponForCartAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockValidateCouponForCart.mockResolvedValue({ valid: true, discount: 2500 });
  });

  it("valid → validateCouponForCart called with (uid, code, parsedItems)", async () => {
    const items = [makeCartItem()];
    await validateCouponForCartAction({ code: "WELCOME10", cartItems: items });
    expect(mockValidateCouponForCart).toHaveBeenCalledWith(
      "user-buyer-1",
      "WELCOME10",
      expect.arrayContaining([expect.objectContaining({ productId: "product-hot-wheels-redline" })]),
    );
  });

  it("returns validateCouponForCart result as-is", async () => {
    const result = await validateCouponForCartAction({
      code: "WELCOME10",
      cartItems: [makeCartItem()],
    });
    expect(result.ok).toBe(true);
    expect((result as { data: Record<string, unknown> }).data).toMatchObject({ valid: true, discount: 2500 });
  });
});
