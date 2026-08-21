import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCartGetOrCreate,
  mockCartAddCoupon,
  mockCartRemoveCoupon,
  mockCartClearAllCoupons,
  mockValidateCouponForCart,
  mockClaimedClaim,
  mockDetectCouponConflict,
} = vi.hoisted(() => ({
  mockCartGetOrCreate: vi.fn(),
  mockCartAddCoupon: vi.fn(),
  mockCartRemoveCoupon: vi.fn(),
  mockCartClearAllCoupons: vi.fn(),
  mockValidateCouponForCart: vi.fn(),
  mockClaimedClaim: vi.fn(),
  mockDetectCouponConflict: vi.fn(() => null),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  cartRepository: {
    getOrCreate: mockCartGetOrCreate,
    addCoupon: mockCartAddCoupon,
    removeCoupon: mockCartRemoveCoupon,
    clearAllCoupons: mockCartClearAllCoupons,
  },
  claimedCouponsRepository: { claim: mockClaimedClaim },
  validateCouponForCart: mockValidateCouponForCart,
  detectCouponConflict: mockDetectCouponConflict,
  ApiErrors: {
    badRequest: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
    notFound: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) return new Response(JSON.stringify({ ok: false, error: "Validation" }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { POST, DELETE } from "../route";

const mockDetectConflict = mockDetectCouponConflict as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, method = "POST"): Request {
  return new Request("http://localhost/api/cart/coupon", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const baseCart = {
  userId: "user-1",
  items: [{ productId: "product-x", storeId: "store-A", price: 1000, quantity: 1, listingType: "standard", itemId: "item-1" }],
  appliedCoupons: [],
};

const validCouponResult = {
  valid: true,
  coupon: { id: "coupon-1", scope: "admin", restrictions: {} },
  discountAmount: 100,
  eligibleSubtotal: 1000,
  eligibleProductIds: ["product-x"],
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "user-1", role: "user" };
  mockCartGetOrCreate.mockResolvedValue({ ...baseCart });
  mockValidateCouponForCart.mockResolvedValue(validCouponResult);
  mockCartAddCoupon.mockResolvedValue(undefined);
  mockCartRemoveCoupon.mockResolvedValue(undefined);
  mockCartClearAllCoupons.mockResolvedValue(undefined);
  mockClaimedClaim.mockResolvedValue(undefined);
  mockDetectConflict.mockReturnValue(null);
});

describe("POST /api/cart/coupon", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ code: "SAVE10" }) as never);
    expect(res.status).toBe(401);
  });

  it("missing code → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("code > 50 chars → 400", async () => {
    const res = await POST(makeReq({ code: "A".repeat(51) }) as never);
    expect(res.status).toBe(400);
  });

  it("empty cart → 400 'Your cart is empty'", async () => {
    mockCartGetOrCreate.mockResolvedValue({ ...baseCart, items: [] });
    const res = await POST(makeReq({ code: "SAVE10" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("cart is empty");
  });

  it("same code already in appliedCoupons → 400 'already applied'", async () => {
    mockCartGetOrCreate.mockResolvedValue({
      ...baseCart,
      appliedCoupons: [{ code: "SAVE10", scope: "admin" }],
    });
    const res = await POST(makeReq({ code: "SAVE10" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("already applied");
  });

  it("validateCouponForCart returns valid: false → 400 with error", async () => {
    mockValidateCouponForCart.mockResolvedValue({ valid: false, error: "Coupon expired" });
    const res = await POST(makeReq({ code: "OLD10" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Coupon expired");
  });

  it("detectCouponConflict returns a message → 400 with conflict message", async () => {
    mockDetectConflict.mockReturnValue("Store coupon already applied");
    const res = await POST(makeReq({ code: "NEW10" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Store coupon");
  });

  it("second seller coupon same storeId: detectCouponConflict called with correct args", async () => {
    mockCartGetOrCreate.mockResolvedValue({
      ...baseCart,
      appliedCoupons: [{ code: "STORE10", scope: "seller", storeId: "store-A" }],
    });
    mockValidateCouponForCart.mockResolvedValue({
      ...validCouponResult,
      coupon: { id: "coupon-2", scope: "seller", storeId: "store-A", restrictions: {} },
    });
    await POST(makeReq({ code: "STORE20" }) as never);
    expect(mockDetectConflict).toHaveBeenCalledWith(
      [{ code: "STORE10", scope: "seller", storeId: "store-A" }],
      expect.objectContaining({ scope: "seller", storeId: "store-A" }),
    );
  });

  it("success → cartRepository.addCoupon called", async () => {
    await POST(makeReq({ code: "SAVE10" }) as never);
    expect(mockCartAddCoupon).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ code: "SAVE10" }),
    );
  });

  it("coupon has id → claimedCouponsRepository.claim called fire-and-forget", async () => {
    await POST(makeReq({ code: "SAVE10" }) as never);
    expect(mockClaimedClaim).toHaveBeenCalledWith(
      expect.objectContaining({ couponId: "coupon-1", couponCode: "SAVE10" }),
    );
  });

  it("coupon with no ID → claimedCouponsRepository.claim NOT called", async () => {
    mockValidateCouponForCart.mockResolvedValue({
      ...validCouponResult,
      coupon: { scope: "admin", restrictions: {} },
    });
    await POST(makeReq({ code: "NOID10" }) as never);
    expect(mockClaimedClaim).not.toHaveBeenCalled();
  });

  it("success → 200 with { code, discountAmount, eligibleSubtotal, scope }", async () => {
    const res = await POST(makeReq({ code: "save10" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { code: string; discountAmount: number } };
    expect(json.data.code).toBe("SAVE10"); // normalized to uppercase
    expect(json.data.discountAmount).toBe(100);
  });
});

describe("DELETE /api/cart/coupon", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq({ code: "SAVE10" }, "DELETE") as never);
    expect(res.status).toBe(401);
  });

  it("specific code → cartRepository.removeCoupon called", async () => {
    await DELETE(makeReq({ code: "save10" }, "DELETE") as never);
    expect(mockCartRemoveCoupon).toHaveBeenCalledWith("user-1", "SAVE10");
  });

  it("no code → cartRepository.clearAllCoupons called", async () => {
    await DELETE(makeReq({}, "DELETE") as never);
    expect(mockCartClearAllCoupons).toHaveBeenCalledWith("user-1");
  });

  it("returns 200 with { removed: true, code }", async () => {
    const res = await DELETE(makeReq({ code: "SAVE10" }, "DELETE") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { removed: boolean; code: string } };
    expect(json.data.removed).toBe(true);
    expect(json.data.code).toBe("SAVE10");
  });
});
