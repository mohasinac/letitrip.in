/**
 * Tests for POST /api/user/coupons/claim
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockGetCouponByCode,
  mockIsCouponValid,
  mockClaim,
} = vi.hoisted(() => ({
  mockGetCouponByCode: vi.fn(),
  mockIsCouponValid: vi.fn(),
  mockClaim: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  couponsRepository: { getCouponByCode: mockGetCouponByCode },
  claimedCouponsRepository: { claim: mockClaim },
  isCouponValid: mockIsCouponValid,
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  ApiErrors: {
    notFound: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
    badRequest: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation error";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { POST } from "../route";

const validCoupon = {
  id: "coupon-welcome10",
  name: "Welcome 10%",
  description: "10% off your first order",
  code: "WELCOME10",
  type: "percentage",
  scope: "admin",
  storeId: null,
  discount: { value: 10, maxDiscount: 500, minPurchase: 0 },
  restrictions: { firstTimeUserOnly: false, combineWithSellerCoupons: true },
  validity: { isActive: true, startDate: "2026-01-01", endDate: "2027-01-01" },
};

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/user/coupons/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockGetCouponByCode.mockResolvedValue(validCoupon);
  mockIsCouponValid.mockReturnValue(true);
  mockClaim.mockResolvedValue({ id: "claim-1", userId: "buyer-uid", couponCode: "WELCOME10", status: "active" });
});

describe("POST /api/user/coupons/claim", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(res.status).toBe(401);
  });

  it("missing couponCode → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("couponCode too long (>50 chars) → 400", async () => {
    const res = await POST(makeReq({ couponCode: "A".repeat(51) }) as never);
    expect(res.status).toBe(400);
  });

  it("coupon code normalized to uppercase before lookup", async () => {
    await POST(makeReq({ couponCode: "welcome10" }) as never);
    expect(mockGetCouponByCode).toHaveBeenCalledWith("WELCOME10");
  });

  it("coupon code whitespace trimmed before lookup", async () => {
    await POST(makeReq({ couponCode: "  WELCOME10  " }) as never);
    expect(mockGetCouponByCode).toHaveBeenCalledWith("WELCOME10");
  });

  it("unknown coupon code → 404", async () => {
    mockGetCouponByCode.mockResolvedValue(null);
    const res = await POST(makeReq({ couponCode: "INVALID" }) as never);
    expect(res.status).toBe(404);
  });

  it("coupon exists but invalid (expired/inactive) → 400", async () => {
    mockIsCouponValid.mockReturnValue(false);
    const res = await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("valid");
  });

  it("valid coupon → claimedCouponsRepository.claim called with correct params", async () => {
    await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(mockClaim).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "buyer-uid",
        couponId: "coupon-welcome10",
        couponCode: "WELCOME10",
        source: "manual",
      }),
    );
  });

  it("source field forwarded when provided", async () => {
    await POST(makeReq({ couponCode: "WELCOME10", source: "spin" }) as never);
    expect(mockClaim).toHaveBeenCalledWith(
      expect.objectContaining({ source: "spin" }),
    );
  });

  it("source defaults to 'manual' when not provided", async () => {
    await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(mockClaim).toHaveBeenCalledWith(
      expect.objectContaining({ source: "manual" }),
    );
  });

  it("idempotent: second claim for same code → 201 (no error)", async () => {
    const existing = { id: "claim-existing", status: "active" };
    mockClaim.mockResolvedValue(existing);
    const res = await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(res.status).toBe(201);
  });

  it("coupon snapshot stored (name, type, discount)", async () => {
    await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(mockClaim).toHaveBeenCalledWith(
      expect.objectContaining({
        couponSnapshot: expect.objectContaining({
          name: "Welcome 10%",
          type: "percentage",
        }),
      }),
    );
  });

  it("expiresAt set from coupon validity.endDate", async () => {
    await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(mockClaim).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: "2027-01-01" }),
    );
  });

  it("coupon with no endDate → expiresAt is null", async () => {
    mockGetCouponByCode.mockResolvedValue({
      ...validCoupon,
      validity: { ...validCoupon.validity, endDate: null },
    });
    await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(mockClaim).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: null }),
    );
  });

  it("success → 201 with claim data", async () => {
    const res = await POST(makeReq({ couponCode: "WELCOME10" }) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { ok: boolean; data: { claim: { id: string } } };
    expect(json.ok).toBe(true);
    expect(json.data.claim.id).toBe("claim-1");
  });
});
