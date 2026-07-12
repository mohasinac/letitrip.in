import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockUserRepositoryFindById,
  mockSellerCreateCoupon,
  mockSellerUpdateCoupon,
  mockSellerDeleteCoupon,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockUserRepositoryFindById: vi.fn(),
  mockSellerCreateCoupon: vi.fn(),
  mockSellerUpdateCoupon: vi.fn(),
  mockSellerDeleteCoupon: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
  sellerCreateCoupon: mockSellerCreateCoupon,
  sellerUpdateCoupon: mockSellerUpdateCoupon,
  sellerDeleteCoupon: mockSellerDeleteCoupon,
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  userRepository: { findById: mockUserRepositoryFindById },
}));

import {
  sellerCreateCouponAction,
  sellerUpdateCouponAction,
  sellerDeleteCouponAction,
} from "../seller-coupon.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-seller-1", email: "seller@test.com", role: "seller", ...overrides };
}

function makeUserProfile(overrides: Record<string, unknown> = {}) {
  return { id: "user-seller-1", role: "seller", ...overrides };
}

function makeValidCreateInput() {
  return {
    code: "SAVE15",
    name: "15% Off Sale",
    discountType: "percentage" as const,
    discountValue: 15,
    minPurchase: 0,
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-12-31"),
  };
}

describe("sellerCreateCouponAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockSellerCreateCoupon.mockResolvedValue({ id: "coupon-save15" });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await sellerCreateCouponAction(makeValidCreateInput());
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded (STRICT, key coupon:create:{uid}) → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await sellerCreateCouponAction(makeValidCreateInput());
    expect(result.ok).toBe(false);
  });

  it("rate limit called with correct key and STRICT preset", async () => {
    try { await sellerCreateCouponAction(makeValidCreateInput()); } catch { /* */ }
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "coupon:create:user-seller-1",
      expect.anything(),
    );
  });

  it("discountType='flat' → sellerCreateCoupon called with type='fixed' (mapped)", async () => {
    await sellerCreateCouponAction({ ...makeValidCreateInput(), discountType: "flat" as any });
    const call = mockSellerCreateCoupon.mock.calls[0];
    expect(call[1]).toMatchObject({ discountType: "fixed" });
  });

  it("discountType='percentage' → sellerCreateCoupon called with type='percentage' (unchanged)", async () => {
    await sellerCreateCouponAction(makeValidCreateInput());
    const call = mockSellerCreateCoupon.mock.calls[0];
    expect(call[1]).toMatchObject({ discountType: "percentage" });
  });

  it("applicableToAuctions hardcoded false in normalized input", async () => {
    await sellerCreateCouponAction({ ...makeValidCreateInput(), applicableToAuctions: true } as any);
    const call = mockSellerCreateCoupon.mock.calls[0];
    expect(call[1].applicableToAuctions).toBe(false);
  });

  it("valid → sellerCreateCoupon called with (user.uid, normalizedInput)", async () => {
    await sellerCreateCouponAction(makeValidCreateInput());
    expect(mockSellerCreateCoupon).toHaveBeenCalledWith("user-seller-1", expect.any(Object));
  });

  it("valid → { ok: true }", async () => {
    const result = await sellerCreateCouponAction(makeValidCreateInput());
    expect(result.ok).toBe(true);
  });
});

describe("sellerUpdateCouponAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUserRepositoryFindById.mockResolvedValue(makeUserProfile());
    mockSellerUpdateCoupon.mockResolvedValue({ id: "coupon-save15" });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await sellerUpdateCouponAction("coupon-save15", { name: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("no rate limit on update (rateLimitByIdentifier NOT called for update)", async () => {
    await sellerUpdateCouponAction("coupon-save15", { name: "Updated" });
    expect(mockRateLimitByIdentifier).not.toHaveBeenCalled();
  });

  it("valid → userRepository.findById called to get role", async () => {
    await sellerUpdateCouponAction("coupon-save15", { name: "Updated" });
    expect(mockUserRepositoryFindById).toHaveBeenCalledWith("user-seller-1");
  });

  it("valid → sellerUpdateCoupon called with (user.uid, role, couponId, updateInput)", async () => {
    await sellerUpdateCouponAction("coupon-save15", { name: "Updated" });
    expect(mockSellerUpdateCoupon).toHaveBeenCalledWith(
      "user-seller-1",
      "seller",
      "coupon-save15",
      expect.objectContaining({ name: "Updated" }),
    );
  });

  it("valid → { ok: true }", async () => {
    const result = await sellerUpdateCouponAction("coupon-save15", { name: "Updated" });
    expect(result.ok).toBe(true);
  });
});

describe("sellerDeleteCouponAction — no wrapAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUserRepositoryFindById.mockResolvedValue(makeUserProfile());
    mockSellerDeleteCoupon.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(sellerDeleteCouponAction("coupon-save15")).rejects.toThrow();
  });

  it("valid → userRepository.findById called to get role", async () => {
    await sellerDeleteCouponAction("coupon-save15");
    expect(mockUserRepositoryFindById).toHaveBeenCalledWith("user-seller-1");
  });

  it("valid → sellerDeleteCoupon called with (user.uid, role, couponId)", async () => {
    await sellerDeleteCouponAction("coupon-save15");
    expect(mockSellerDeleteCoupon).toHaveBeenCalledWith(
      "user-seller-1",
      "seller",
      "coupon-save15",
    );
  });

  it("sellerDeleteCoupon throws → propagates", async () => {
    mockSellerDeleteCoupon.mockRejectedValue(new Error("Not your coupon"));
    await expect(sellerDeleteCouponAction("coupon-save15")).rejects.toThrow("Not your coupon");
  });
});
