/**
 * Tests for GET + POST /api/store/coupons
 * Seller coupon management — scope forced to "seller", storeId from owner,
 * code normalized to uppercase, paise conversion, percentage guard.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindByOwnerId,
  mockCouponsList,
  mockGetCouponByCode,
  mockCouponsCreate,
} = vi.hoisted(() => ({
  mockFindByOwnerId: vi.fn(),
  mockCouponsList: vi.fn(),
  mockGetCouponByCode: vi.fn(),
  mockCouponsCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_STORE_READ: ["seller"],
  ROLES_STORE_WRITE: ["seller"],
}));

vi.mock("@mohasinac/appkit", () => ({
  couponsRepository: {
    list: mockCouponsList,
    getCouponByCode: mockGetCouponByCode,
    create: mockCouponsCreate,
  },
  storeRepository: { findByOwnerId: mockFindByOwnerId },
  sortBy: (field: string) => `-${field}`,
  COUPON_FIELDS: { CREATED_AT: "createdAt" },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    forbidden: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
    badRequest: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation error";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const mockStore = { id: "store-palace", ownerId: "seller-uid", storeName: "Pokemon Palace" };

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/store/coupons");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/store/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validCouponBody = {
  code: "palace15",
  type: "percentage",
  value: 15,
  minPurchase: 500,
  maxDiscount: 200,
  totalLimit: 100,
  perUserLimit: 1,
  startDate: "2026-07-01",
  endDate: "2026-12-31",
  isActive: true,
};

const pagedCoupons = { items: [{ id: "coupon-palace15", code: "PALACE15" }], total: 1 };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockFindByOwnerId.mockResolvedValue(mockStore);
  mockCouponsList.mockResolvedValue(pagedCoupons);
  mockGetCouponByCode.mockResolvedValue(null);
  mockCouponsCreate.mockResolvedValue({ id: "coupon-palace15", code: "PALACE15", scope: "seller" });
});

describe("GET /api/store/coupons", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("no store for this seller → 403", async () => {
    mockFindByOwnerId.mockResolvedValue(null);
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("returns only this store's coupons (storeId filter applied)", async () => {
    await GET(makeGetReq() as never);
    const callArg = mockCouponsList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("storeId==store-palace");
  });

  it("additional filters combined with storeId filter", async () => {
    await GET(makeGetReq({ filters: "isActive==true" }) as never);
    const callArg = mockCouponsList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("isActive==true");
    expect(callArg.filters).toContain("storeId==store-palace");
  });

  it("success → 200 with coupon list", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { coupons: unknown[]; total: number } };
    expect(json.data.total).toBe(1);
    expect(json.data.coupons).toHaveLength(1);
  });
});

describe("POST /api/store/coupons", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(401);
  });

  it("no store for seller → 403", async () => {
    mockFindByOwnerId.mockResolvedValue(null);
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(403);
  });

  it("code normalized to uppercase (transformed by schema)", async () => {
    await POST(makePostReq({ ...validCouponBody, code: "palace15" }) as never);
    expect(mockCouponsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ code: "PALACE15" }),
    );
  });

  it("percentage > 100% → 400", async () => {
    const res = await POST(makePostReq({ ...validCouponBody, type: "percentage", value: 110 }) as never);
    expect(res.status).toBe(400);
  });

  it("scope forced to 'seller' (cannot override with body.scope)", async () => {
    await POST(makePostReq({ ...validCouponBody, scope: "admin" }) as never);
    expect(mockCouponsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "seller" }),
    );
  });

  it("storeId set from seller's own store (cannot override)", async () => {
    await POST(makePostReq({ ...validCouponBody, storeId: "other-store" }) as never);
    expect(mockCouponsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: "store-palace" }),
    );
  });

  it("fixed-amount value converted to paise (multiplied by 100)", async () => {
    await POST(makePostReq({ ...validCouponBody, type: "fixed", value: 50 }) as never);
    expect(mockCouponsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ discount: expect.objectContaining({ value: 5000 }) }),
    );
  });

  it("percentage value NOT converted to paise", async () => {
    await POST(makePostReq({ ...validCouponBody, type: "percentage", value: 15 }) as never);
    expect(mockCouponsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ discount: expect.objectContaining({ value: 15 }) }),
    );
  });

  it("duplicate code → 400", async () => {
    mockGetCouponByCode.mockResolvedValue({ id: "existing" });
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(400);
  });

  it("success → 200 with created coupon", async () => {
    const res = await POST(makePostReq(validCouponBody) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { code: string } };
    expect(json.ok).toBe(true);
    expect(json.data.code).toBe("PALACE15");
  });
});
