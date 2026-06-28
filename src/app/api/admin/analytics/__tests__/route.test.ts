/**
 * Tests for GET /api/admin/analytics
 * Auth required. Role: ROLES_ADMIN_MOD. Permission: admin:analytics:view.
 * Delegates to callFirebaseFunction("adminAnalytics", { startDate, endDate }).
 * Function not configured (returns null) → 503.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockCallFirebaseFunction, mockServerLogger } = vi.hoisted(() => ({
  mockCallFirebaseFunction: vi.fn(),
  mockServerLogger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
}));
vi.mock("@/lib/firebase-gateway", () => ({
  callFirebaseFunction: mockCallFirebaseFunction,
}));

vi.mock("@mohasinac/appkit", () => ({
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  serverLogger: mockServerLogger,
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const makeReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/admin/analytics");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const mockAnalyticsData = {
  summary: { totalRevenue: 500000, totalOrders: 42 },
  ordersByMonth: [],
  topProducts: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCallFirebaseFunction.mockResolvedValue(mockAnalyticsData);
});

describe("GET /api/admin/analytics", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("calls callFirebaseFunction with adminAnalytics and date params", async () => {
    await GET(makeReq({ startDate: "2026-01-01", endDate: "2026-01-31" }) as never);
    expect(mockCallFirebaseFunction).toHaveBeenCalledWith("adminAnalytics", {
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
  });

  it("no date params → passes undefined for both", async () => {
    await GET(makeReq() as never);
    expect(mockCallFirebaseFunction).toHaveBeenCalledWith("adminAnalytics", {
      startDate: undefined,
      endDate: undefined,
    });
  });

  it("function returns data → 200 with analytics", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockAnalyticsData };
    expect(json.data.summary).toBeDefined();
    expect(json.data.topProducts).toBeDefined();
  });

  it("function returns null → 503 service unavailable", async () => {
    mockCallFirebaseFunction.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(503);
  });

  it("function not configured (null) → logs error", async () => {
    mockCallFirebaseFunction.mockResolvedValue(null);
    await GET(makeReq() as never);
    expect(mockServerLogger.error).toHaveBeenCalled();
  });
});
