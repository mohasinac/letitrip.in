import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockAdminCreateCouponDomain,
  mockAdminUpdateCouponDomain,
  mockAdminDeleteCouponDomain,
  mockListAdminCouponsDomain,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockAdminCreateCouponDomain: vi.fn(),
  mockAdminUpdateCouponDomain: vi.fn(),
  mockAdminDeleteCouponDomain: vi.fn(),
  mockListAdminCouponsDomain: vi.fn(),
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
  requireRoleUser: mockRequireRoleUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  adminCreateCoupon: mockAdminCreateCouponDomain,
  adminUpdateCoupon: mockAdminUpdateCouponDomain,
  adminDeleteCoupon: mockAdminDeleteCouponDomain,
  listAdminCoupons: mockListAdminCouponsDomain,
}));

import {
  adminCreateCouponAction,
  adminUpdateCouponAction,
  adminDeleteCouponAction,
  listAdminCouponsAction,
} from "../admin-coupon.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@test.com", role: "admin", ...overrides };
}

function makeValidCreateInput() {
  return {
    code: "WELCOME10",
    name: "Welcome 10% Off",
    type: "percentage" as const,
    discount: { value: 10, minPurchase: 0 },
    usage: {},
    validity: {
      startDate: "2026-07-01",
      endDate: "2026-12-31",
      isActive: true,
    },
    restrictions: {},
  };
}

describe("adminCreateCouponAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminCreateCouponDomain.mockResolvedValue({ id: "coupon-welcome10" });
  });

  it("requireRoleUser called with ['admin'] — NOT ['admin','moderator']", async () => {
    await adminCreateCouponAction(makeValidCreateInput() as any);
    expect(mockRequireRoleUser).toHaveBeenCalledWith(["admin"]);
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminCreateCouponAction(makeValidCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("role 'moderator' → { ok: false } (admin only, not moderator)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminCreateCouponAction(makeValidCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await adminCreateCouponAction(makeValidCreateInput() as any);
    expect(result.ok).toBe(false);
  });

  it("code missing → { ok: false } (min1)", async () => {
    const result = await adminCreateCouponAction({ ...makeValidCreateInput(), code: "" } as any);
    expect(result.ok).toBe(false);
  });

  it("name missing → { ok: false }", async () => {
    const result = await adminCreateCouponAction({ ...makeValidCreateInput(), name: "" } as any);
    expect(result.ok).toBe(false);
  });

  it("type not in enum → { ok: false }", async () => {
    const result = await adminCreateCouponAction({ ...makeValidCreateInput(), type: "bogus" } as any);
    expect(result.ok).toBe(false);
  });

  it("discount.value <= 0 → { ok: false }", async () => {
    const result = await adminCreateCouponAction({
      ...makeValidCreateInput(),
      discount: { value: 0, minPurchase: 0 },
    } as any);
    expect(result.ok).toBe(false);
  });

  it("code normalized to uppercase via .toUpperCase() transform", async () => {
    await adminCreateCouponAction({ ...makeValidCreateInput(), code: "welcome10" } as any);
    const call = mockAdminCreateCouponDomain.mock.calls[0];
    const passedData = call[1];
    expect(passedData.code).toBe("WELCOME10");
  });

  it("validity.startDate parsed to Date object before calling domain", async () => {
    await adminCreateCouponAction(makeValidCreateInput() as any);
    const call = mockAdminCreateCouponDomain.mock.calls[0];
    const passedData = call[1];
    expect(passedData.validity.startDate).toBeInstanceOf(Date);
  });

  it("validity.endDate parsed to Date when provided", async () => {
    await adminCreateCouponAction(makeValidCreateInput() as any);
    const call = mockAdminCreateCouponDomain.mock.calls[0];
    const passedData = call[1];
    expect(passedData.validity.endDate).toBeInstanceOf(Date);
  });

  it("valid → adminCreateCouponDomain called with (admin.uid, parsedData)", async () => {
    await adminCreateCouponAction(makeValidCreateInput() as any);
    expect(mockAdminCreateCouponDomain).toHaveBeenCalledWith(
      "user-admin-1",
      expect.objectContaining({ code: "WELCOME10" }),
    );
  });

  it("no percentage >100% cap in Zod schema (domain handles cap)", async () => {
    // 150% should not fail schema validation (domain handles the business rule)
    await adminCreateCouponAction({
      ...makeValidCreateInput(),
      type: "percentage",
      discountConfig: { value: 150, minPurchase: 0 },
    } as any);
    // Should reach domain (may succeed or fail based on mock)
    expect(mockAdminCreateCouponDomain).toHaveBeenCalled();
  });

  it("returns { ok: true }", async () => {
    const result = await adminCreateCouponAction(makeValidCreateInput() as any);
    expect(result.ok).toBe(true);
  });
});

describe("adminUpdateCouponAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminUpdateCouponDomain.mockResolvedValue({ id: "coupon-welcome10" });
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdateCouponAction("coupon-welcome10", { name: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("couponIdSchema: empty id → { ok: false }", async () => {
    const result = await adminUpdateCouponAction("", { name: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("valid → adminUpdateCouponDomain called with (admin.uid, id, parsedData)", async () => {
    await adminUpdateCouponAction("coupon-welcome10", { name: "Updated" });
    expect(mockAdminUpdateCouponDomain).toHaveBeenCalledWith(
      "user-admin-1",
      "coupon-welcome10",
      expect.objectContaining({ name: "Updated" }),
    );
  });

  it("returns { ok: true }", async () => {
    const result = await adminUpdateCouponAction("coupon-welcome10", { name: "Updated" });
    expect(result.ok).toBe(true);
  });
});

describe("adminDeleteCouponAction — no wrapAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockAdminDeleteCouponDomain.mockResolvedValue(undefined);
  });

  it("role 'seller' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(adminDeleteCouponAction("coupon-welcome10")).rejects.toThrow();
  });

  it("empty id → throws (couponIdSchema)", async () => {
    await expect(adminDeleteCouponAction("")).rejects.toThrow();
  });

  it("valid → adminDeleteCouponDomain called with (admin.uid, id)", async () => {
    await adminDeleteCouponAction("coupon-welcome10");
    expect(mockAdminDeleteCouponDomain).toHaveBeenCalledWith("user-admin-1", "coupon-welcome10");
  });

  it("returns void on success", async () => {
    const result = await adminDeleteCouponAction("coupon-welcome10");
    expect(result).toBeUndefined();
  });
});

describe("listAdminCouponsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminCouponsDomain.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminCouponsAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminCouponsDomain called with params", async () => {
    await listAdminCouponsAction({ type: "percentage" });
    expect(mockListAdminCouponsDomain).toHaveBeenCalledWith(
      expect.objectContaining({ type: "percentage" }),
    );
  });

  it("returns { ok: true, data: { items, total } }", async () => {
    const result = await listAdminCouponsAction({ page: 1 });
    expect(result.ok).toBe(true);
  });
});
