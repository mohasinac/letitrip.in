/**
 * Tests for GET + POST /api/admin/coupons
 * Admin coupon management — code normalization, scope forced to "admin",
 * duplicate code check, percentage validation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCouponsList,
  mockGetCouponByCode,
  mockCouponsCreate,
} = vi.hoisted(() => ({
  mockCouponsList: vi.fn(),
  mockGetCouponByCode: vi.fn(),
  mockCouponsCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  couponsRepository: {
    list: mockCouponsList,
    getCouponByCode: mockGetCouponByCode,
    create: mockCouponsCreate,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ERROR_MESSAGES: {
    VALIDATION: { FAILED: "Validation failed" },
    COUPON: { DUPLICATE_CODE: "Coupon code already exists" },
  },
  SUCCESS_MESSAGES: { COUPON: { CREATED: "Coupon created" } },
  serverLogger: { info: vi.fn(), error: vi.fn() },
  // createApiHandler is the alias used by this route
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/coupons");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validCouponBody = {
  code: "WELCOME10",
  name: "Welcome Discount",
  type: "percentage",
  discount: { value: 10, maxDiscount: 500, minPurchase: 0 },
  usage: { currentUsage: 0 },
  validity: { startDate: "2026-01-01", isActive: true },
};

const pagedCoupons = {
  items: [{ id: "coupon-welcome10", code: "WELCOME10" }],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCouponsList.mockResolvedValue(pagedCoupons);
  mockGetCouponByCode.mockResolvedValue(null);
  mockCouponsCreate.mockResolvedValue({ id: "coupon-welcome10", code: "WELCOME10", scope: "admin" });
});

describe("GET /api/admin/coupons", () => {
  it("non-admin/moderator role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
  });

  it("returns all coupons (admin + seller)", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(1);
    expect(json.data.items).toHaveLength(1);
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeGetReq({ pageSize: "200" }) as never);
    const callArg = mockCouponsList.mock.calls[0][0] as { pageSize: number };
    expect(callArg.pageSize).toBeLessThanOrEqual(50);
  });
});

describe("POST /api/admin/coupons", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (admin-only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(403);
  });

  it("percentage discount > 100% → 400 (business validation)", async () => {
    const res = await POST(makePostReq({
      ...validCouponBody,
      type: "percentage",
      discount: { value: 110 },
    }) as never);
    expect(res.status).toBe(400);
  });

  it("duplicate coupon code → 409", async () => {
    mockGetCouponByCode.mockResolvedValue({ id: "existing" });
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(409);
  });

  it("scope forced to 'admin' regardless of body scope field", async () => {
    await POST(makePostReq({ ...validCouponBody, scope: "seller" }) as never);
    expect(mockCouponsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "admin" }),
    );
  });

  it("createdBy set to user uid (not body.createdBy)", async () => {
    await POST(makePostReq({ ...validCouponBody, createdBy: "some-other-uid" }) as never);
    expect(mockCouponsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: "admin-uid" }),
    );
  });

  it("success → 200 with coupon data", async () => {
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { code: string } };
    expect(json.ok).toBe(true);
    expect(json.data.code).toBe("WELCOME10");
  });
});
