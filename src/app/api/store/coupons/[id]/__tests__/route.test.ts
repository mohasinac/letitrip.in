/**
 * Tests for GET/PATCH/DELETE /api/store/coupons/[id]
 * All verbs: ROLES_STORE_WRITE + store:api:write.
 * Seller can only access their own store's coupons.
 *   → coupon.storeId !== seller's store → 404 (not 403, to prevent enumeration).
 * Admin bypasses store scope check.
 * PATCH: action=deactivate/activate → calls deactivate/reactivateCoupon.
 *        percentage coupon + discount.value > 100 → 422.
 *        restrictions merged with existing (partial merge, not replace).
 * DELETE: Full document deletion (unlike admin coupon DELETE which only deactivates).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCouponFindById,
  mockCouponUpdate,
  mockCouponDelete,
  mockDeactivate,
  mockReactivate,
  mockStoreFindByOwnerId,
} = vi.hoisted(() => ({
  mockCouponFindById: vi.fn(),
  mockCouponUpdate: vi.fn(),
  mockCouponDelete: vi.fn(),
  mockDeactivate: vi.fn(),
  mockReactivate: vi.fn(),
  mockStoreFindByOwnerId: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  couponsRepository: {
    findById: mockCouponFindById,
    update: mockCouponUpdate,
    delete: mockCouponDelete,
    deactivateCoupon: mockDeactivate,
    reactivateCoupon: mockReactivate,
  },
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
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
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
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

const params = { params: { id: "coupon-palace15" } };
const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/store/coupons/coupon-palace15", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const mockOtherStore = { id: "store-diecast", ownerId: "other-seller" };

const mockPercentCoupon = {
  id: "coupon-palace15",
  code: "PALACE15",
  type: "percentage",
  storeId: "store-pokemon-palace",
  restrictions: { firstTimeUserOnly: false, combineWithSellerCoupons: true },
  validity: { isActive: true },
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockCouponFindById.mockResolvedValue(mockPercentCoupon);
  mockStoreFindByOwnerId.mockResolvedValue(mockStore);
  mockCouponUpdate.mockResolvedValue({ ...mockPercentCoupon, name: "Updated" });
  mockCouponDelete.mockResolvedValue(undefined);
  mockDeactivate.mockResolvedValue(undefined);
  mockReactivate.mockResolvedValue(undefined);
});

describe("GET /api/store/coupons/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("coupon not found → 404", async () => {
    mockCouponFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("coupon belongs to different store → 404 (not 403, prevents enumeration)", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(mockOtherStore);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("seller has no store → 404", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("admin bypasses store scope check", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    // Admin has no store; storeFindByOwnerId returns null for admin
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("seller's own coupon → 200", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { code: string } };
    expect(json.data.code).toBe("PALACE15");
  });
});

describe("PATCH /api/store/coupons/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { action: "deactivate" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("coupon from another store → 404", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(mockOtherStore);
    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("action=deactivate → calls deactivateCoupon", async () => {
    await PATCH(makeRequest("PATCH", { action: "deactivate" }) as never, params as never);
    expect(mockDeactivate).toHaveBeenCalledWith("coupon-palace15");
    expect(mockCouponUpdate).not.toHaveBeenCalled();
  });

  it("action=activate → calls reactivateCoupon", async () => {
    await PATCH(makeRequest("PATCH", { action: "activate" }) as never, params as never);
    expect(mockReactivate).toHaveBeenCalledWith("coupon-palace15");
  });

  it("percentage coupon + discount.value > 100 → 422", async () => {
    const res = await PATCH(
      makeRequest("PATCH", { discount: { value: 110 } }) as never,
      params as never,
    );
    expect(res.status).toBe(422);
  });

  it("percentage coupon + discount.value = 100 → allowed", async () => {
    const res = await PATCH(
      makeRequest("PATCH", { discount: { value: 100 } }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
  });

  it("restrictions are merged with existing (partial merge)", async () => {
    await PATCH(
      makeRequest("PATCH", { restrictions: { firstTimeUserOnly: true } }) as never,
      params as never,
    );
    const updateArg = mockCouponUpdate.mock.calls[0][1] as { restrictions: Record<string, unknown> };
    // Should have merged existing combineWithSellerCoupons: true + new firstTimeUserOnly: true
    expect(updateArg.restrictions.firstTimeUserOnly).toBe(true);
    expect(updateArg.restrictions.combineWithSellerCoupons).toBe(true);
  });

  it("no restrictions in body → restrictions not set in update", async () => {
    await PATCH(makeRequest("PATCH", { name: "New Name" }) as never, params as never);
    const updateArg = mockCouponUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect("restrictions" in updateArg).toBe(false);
  });

  it("success → 200", async () => {
    const res = await PATCH(makeRequest("PATCH", { name: "Updated" }) as never, params as never);
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/store/coupons/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("coupon not found → 404", async () => {
    mockCouponFindById.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("coupon from another store → 404", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(mockOtherStore);
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(404);
    expect(mockCouponDelete).not.toHaveBeenCalled();
  });

  it("seller's own coupon → deleted (full deletion, not just deactivate)", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    expect(mockCouponDelete).toHaveBeenCalledWith("coupon-palace15");
    // deactivate not called for store DELETE (only admin uses deactivate for DELETE)
    expect(mockDeactivate).not.toHaveBeenCalled();
  });

  it("admin can delete any coupon", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
    expect(mockCouponDelete).toHaveBeenCalled();
  });
});
