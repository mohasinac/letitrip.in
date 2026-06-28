/**
 * Tests for GET/PATCH/DELETE /api/admin/coupons/[id]
 *
 * GET:    ROLES_ADMIN_MOD + admin:coupons:read. Uses getCouponByCode(id). 404 on null or error.
 * PATCH:  ROLES_ADMIN_MOD + admin:coupons:write.
 *         action=deactivate → calls deactivateCoupon, returns 200.
 *         action=activate   → calls reactivateCoupon, returns 200.
 *         validity.isActive=false → deactivateCoupon.
 *         validity.isActive=true  → reactivateCoupon.
 *         percentage coupon + discount.value > 100 → 422.
 *         No action/validity.isActive → updates data fields only.
 * DELETE: ROLES_ADMIN_ONLY + admin:coupons:delete. Calls deactivateCoupon (no document deletion).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockGetCouponByCode,
  mockFindById,
  mockDeactivate,
  mockReactivate,
} = vi.hoisted(() => ({
  mockGetCouponByCode: vi.fn(),
  mockFindById: vi.fn(),
  mockDeactivate: vi.fn(),
  mockReactivate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  couponsRepository: {
    getCouponByCode: mockGetCouponByCode,
    findById: mockFindById,
    deactivateCoupon: mockDeactivate,
    reactivateCoupon: mockReactivate,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "coupon-welcome10" }) };
const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/coupons/coupon-welcome10", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

const mockPercentCoupon = {
  id: "coupon-welcome10",
  code: "WELCOME10",
  type: "percentage",
  validity: { isActive: true },
};
const mockFixedCoupon = {
  id: "coupon-fixed50",
  code: "FIXED50",
  type: "fixed",
  validity: { isActive: true },
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockGetCouponByCode.mockResolvedValue(mockPercentCoupon);
  mockFindById.mockResolvedValue(mockPercentCoupon);
  mockDeactivate.mockResolvedValue(undefined);
  mockReactivate.mockResolvedValue(undefined);
});

describe("GET /api/admin/coupons/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("uses getCouponByCode (not findById) for lookup", async () => {
    await GET(makeRequest("GET") as never, params as never);
    expect(mockGetCouponByCode).toHaveBeenCalledWith("coupon-welcome10");
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it("coupon not found (null) → 404", async () => {
    mockGetCouponByCode.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("getCouponByCode throws → 404", async () => {
    mockGetCouponByCode.mockRejectedValue(new Error("Not found"));
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("coupon found → 200 with coupon data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    const json = await res.clone().json() as { data: { code: string } };
    expect(json.data.code).toBe("WELCOME10");
  });
});

describe("PATCH /api/admin/coupons/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { action: "deactivate" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest("PATCH", { action: "deactivate" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("action=deactivate → calls deactivateCoupon, returns 200", async () => {
    const res = await PATCH(makeRequest("PATCH", { action: "deactivate" }) as never, params as never);
    expect(res.status).toBe(200);
    expect(mockDeactivate).toHaveBeenCalledWith("coupon-welcome10");
    expect(mockReactivate).not.toHaveBeenCalled();
  });

  it("action=activate → calls reactivateCoupon, returns 200", async () => {
    const res = await PATCH(makeRequest("PATCH", { action: "activate" }) as never, params as never);
    expect(res.status).toBe(200);
    expect(mockReactivate).toHaveBeenCalledWith("coupon-welcome10");
    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  it("validity.isActive=false → calls deactivateCoupon", async () => {
    await PATCH(makeRequest("PATCH", { validity: { isActive: false } }) as never, params as never);
    expect(mockDeactivate).toHaveBeenCalledWith("coupon-welcome10");
  });

  it("validity.isActive=true → calls reactivateCoupon", async () => {
    await PATCH(makeRequest("PATCH", { validity: { isActive: true } }) as never, params as never);
    expect(mockReactivate).toHaveBeenCalledWith("coupon-welcome10");
  });

  it("percentage coupon + discount.value > 100 → 422", async () => {
    mockFindById.mockResolvedValue(mockPercentCoupon);
    const res = await PATCH(
      makeRequest("PATCH", { discount: { value: 150 } }) as never,
      params as never,
    );
    expect(res.status).toBe(422);
  });

  it("fixed coupon + discount.value > 100 → allowed (not a percentage)", async () => {
    mockFindById.mockResolvedValue(mockFixedCoupon);
    // Fixed coupon can have any value
    const res = await PATCH(
      makeRequest("PATCH", { discount: { value: 500 } }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
  });

  it("percentage coupon + discount.value = 100 → allowed (exact cap OK)", async () => {
    const res = await PATCH(
      makeRequest("PATCH", { discount: { value: 100 } }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
  });

  it("no action/validity → returns updated coupon data", async () => {
    const res = await PATCH(
      makeRequest("PATCH", { name: "Welcome 10% Off" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string; name: string } };
    expect(json.data.id).toBe("coupon-welcome10");
    expect(json.data.name).toBe("Welcome 10% Off");
  });
});

describe("DELETE /api/admin/coupons/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY for delete)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("calls deactivateCoupon (not a full document delete)", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockDeactivate).toHaveBeenCalledWith("coupon-welcome10");
  });

  it("success → 200", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
  });
});
