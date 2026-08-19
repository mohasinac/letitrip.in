/**
 * Tests for GET /api/admin/dashboard
 *
 * Uses createApiHandler (aliased as createRouteHandler in the source) from @mohasinac/appkit.
 * ROLES_ADMIN_MOD + permission: admin:dashboard:view
 *
 * Parallel fetches: userRepository (count, countActive, countNewSince, countDisabled, countByRole),
 *                   productRepository (count), orderRepository (count, findPending)
 *                   reviewRepository (findPending)
 * All sub-calls use .catch(() => default) — individual failures don't crash the endpoint.
 *
 * Revenue: read from the pre-computed analyticsRollupRepository.getDashboardRollup()
 * doc (written daily by the revenueRollup scheduled Function) rather than scanning
 * every delivered order per request — see appkit/src/_internal/server/jobs/core/revenueRollup.ts.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockUserCount,
  mockUserCountActive,
  mockUserCountNewSince,
  mockUserCountDisabled,
  mockUserCountByRole,
  mockProductCount,
  mockOrderCount,
  mockOrderFindPending,
  mockReviewFindPending,
  mockGetDashboardRollup,
} = vi.hoisted(() => ({
  mockUserCount: vi.fn(),
  mockUserCountActive: vi.fn(),
  mockUserCountNewSince: vi.fn(),
  mockUserCountDisabled: vi.fn(),
  mockUserCountByRole: vi.fn(),
  mockProductCount: vi.fn(),
  mockOrderCount: vi.fn(),
  mockOrderFindPending: vi.fn(),
  mockReviewFindPending: vi.fn(),
  mockGetDashboardRollup: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: {
    count: mockUserCount,
    countActive: mockUserCountActive,
    countNewSince: mockUserCountNewSince,
    countDisabled: mockUserCountDisabled,
    countByRole: mockUserCountByRole,
  },
  productRepository: { count: mockProductCount },
  orderRepository: {
    count: mockOrderCount,
    findPending: mockOrderFindPending,
  },
  reviewRepository: { findPending: mockReviewFindPending },
  analyticsRollupRepository: { getDashboardRollup: mockGetDashboardRollup },
  // The source imports createApiHandler but aliases it as createRouteHandler
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
}));

import { GET } from "../route";

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockUserCount.mockResolvedValue(25);
  mockUserCountActive.mockResolvedValue(20);
  mockUserCountNewSince.mockResolvedValue(5);
  mockUserCountDisabled.mockResolvedValue(2);
  mockUserCountByRole.mockResolvedValue(1);
  mockProductCount.mockResolvedValue(70);
  mockOrderCount.mockResolvedValue(10);
  mockOrderFindPending.mockResolvedValue([{}, {}, {}]); // 3 pending
  mockReviewFindPending.mockResolvedValue([{}, {}]); // 2 pending reviews
  mockGetDashboardRollup.mockResolvedValue({ totalRevenue: 400000, deliveredOrderCount: 3, computedAt: new Date() });
});

describe("GET /api/admin/dashboard", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    expect(res.status).toBe(200);
  });

  it("returns correct user stats", async () => {
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as {
      data: { users: { total: number; active: number; new: number; disabled: number; admins: number } };
    };
    expect(json.data.users.total).toBe(25);
    expect(json.data.users.active).toBe(20);
    expect(json.data.users.new).toBe(5);
    expect(json.data.users.disabled).toBe(2);
    expect(json.data.users.admins).toBe(1);
  });

  it("returns correct product total", async () => {
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as { data: { products: { total: number } } };
    expect(json.data.products.total).toBe(70);
  });

  it("returns correct order stats", async () => {
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as {
      data: { orders: { total: number; pending: number } };
    };
    expect(json.data.orders.total).toBe(10);
    expect(json.data.orders.pending).toBe(3);
  });

  it("returns pending reviews count", async () => {
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as { data: { reviews: { pending: number } } };
    expect(json.data.reviews.pending).toBe(2);
  });

  it("returns revenue.total from the pre-computed dashboard rollup", async () => {
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as { data: { revenue: { total: number } } };
    expect(json.data.revenue.total).toBe(400000);
  });

  it("reads revenue via analyticsRollupRepository.getDashboardRollup()", async () => {
    await GET(new Request("http://localhost/api/admin/dashboard") as never);
    expect(mockGetDashboardRollup).toHaveBeenCalled();
  });

  it("countByRole called with 'admin'", async () => {
    await GET(new Request("http://localhost/api/admin/dashboard") as never);
    expect(mockUserCountByRole).toHaveBeenCalledWith("admin");
  });

  it("individual repo failure → defaults to 0 (all use .catch())", async () => {
    mockUserCount.mockRejectedValue(new Error("DB error"));
    mockProductCount.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: { users: { total: number }; products: { total: number } };
    };
    expect(json.data.users.total).toBe(0);
    expect(json.data.products.total).toBe(0);
  });

  it("no rollup doc yet → revenue.total = 0", async () => {
    mockGetDashboardRollup.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as { data: { revenue: { total: number } } };
    expect(json.data.revenue.total).toBe(0);
  });

  it("rollup read failure → revenue.total defaults to 0", async () => {
    mockGetDashboardRollup.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as { data: { revenue: { total: number } } };
    expect(json.data.revenue.total).toBe(0);
  });

  it("newThisMonth mirrors 'new' count (same value)", async () => {
    const res = await GET(new Request("http://localhost/api/admin/dashboard") as never);
    const json = await res.clone().json() as { data: { users: { new: number; newThisMonth: number } } };
    expect(json.data.users.newThisMonth).toBe(json.data.users.new);
  });
});
