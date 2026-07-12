import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockGetAdminDashboardStats,
  mockGetAdminAnalytics,
  mockListAdminOrders,
  mockListAdminUsers,
  mockListAdminBids,
  mockListAdminBlog,
  mockListAdminPayouts,
  mockListAdminProducts,
  mockListAdminStores,
  mockListAdminSessions,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockGetAdminDashboardStats: vi.fn(),
  mockGetAdminAnalytics: vi.fn(),
  mockListAdminOrders: vi.fn(),
  mockListAdminUsers: vi.fn(),
  mockListAdminBids: vi.fn(),
  mockListAdminBlog: vi.fn(),
  mockListAdminPayouts: vi.fn(),
  mockListAdminProducts: vi.fn(),
  mockListAdminStores: vi.fn(),
  mockListAdminSessions: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
  getAdminDashboardStats: mockGetAdminDashboardStats,
  getAdminAnalytics: mockGetAdminAnalytics,
  listAdminOrders: mockListAdminOrders,
  listAdminUsers: mockListAdminUsers,
  listAdminBids: mockListAdminBids,
  listAdminBlog: mockListAdminBlog,
  listAdminPayouts: mockListAdminPayouts,
  listAdminProducts: mockListAdminProducts,
  listAdminStores: mockListAdminStores,
  listAdminSessions: mockListAdminSessions,
}));

vi.mock("@mohasinac/appkit", () => ({
  requireRoleUser: mockRequireRoleUser,
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
}));

import {
  getAdminDashboardStatsAction,
  getAdminAnalyticsAction,
  listAdminOrdersAction,
  listAdminUsersAction,
  listAdminBidsAction,
  listAdminBlogAction,
  listAdminPayoutsAction,
  listAdminProductsAction,
  listAdminStoresAction,
  listAdminSessionsAction,
} from "../admin-read.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@test.com", role: "admin", ...overrides };
}

describe("getAdminDashboardStatsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockGetAdminDashboardStats.mockResolvedValue({ totalOrders: 100 });
  });

  it("requireRoleUser called with ['admin','moderator']", async () => {
    await getAdminDashboardStatsAction();
    expect(mockRequireRoleUser).toHaveBeenCalledWith(["admin", "moderator"]);
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await getAdminDashboardStatsAction();
    expect(result.ok).toBe(false);
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await getAdminDashboardStatsAction();
    expect(result.ok).toBe(false);
  });

  it("admin → getAdminDashboardStats() called", async () => {
    await getAdminDashboardStatsAction();
    expect(mockGetAdminDashboardStats).toHaveBeenCalled();
  });

  it("moderator role → passes (requireRoleUser resolves)", async () => {
    mockRequireRoleUser.mockResolvedValue({ uid: "user-mod-1", role: "moderator" });
    await getAdminDashboardStatsAction();
    expect(mockGetAdminDashboardStats).toHaveBeenCalled();
  });

  it("returns { ok: true, data }", async () => {
    const result = await getAdminDashboardStatsAction();
    expect(result.ok).toBe(true);
  });
});

describe("getAdminAnalyticsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockGetAdminAnalytics.mockResolvedValue({ revenue: 50000 });
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await getAdminAnalyticsAction({ period: "30d" });
    expect(result.ok).toBe(false);
  });

  it("admin/moderator → getAdminAnalytics called with params", async () => {
    await getAdminAnalyticsAction({ period: "30d" });
    expect(mockGetAdminAnalytics).toHaveBeenCalledWith({ period: "30d" });
  });
});

describe("listAdminOrdersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminOrders.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminOrdersAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminOrders called with params passed through unchanged", async () => {
    await listAdminOrdersAction({ page: 2, pageSize: 25, status: "PENDING" });
    expect(mockListAdminOrders).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 25, status: "PENDING" }),
    );
  });
});

describe("listAdminUsersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminUsers.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminUsersAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminUsers called with params", async () => {
    await listAdminUsersAction({ page: 1, role: "seller" });
    expect(mockListAdminUsers).toHaveBeenCalledWith(expect.objectContaining({ role: "seller" }));
  });
});

describe("listAdminProductsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminProducts.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminProductsAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminProducts called with params", async () => {
    await listAdminProductsAction({ storeId: "store-1" });
    expect(mockListAdminProducts).toHaveBeenCalledWith(expect.objectContaining({ storeId: "store-1" }));
  });
});

describe("listAdminPayoutsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminPayouts.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminPayoutsAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminPayouts called", async () => {
    await listAdminPayoutsAction({ status: "PENDING" });
    expect(mockListAdminPayouts).toHaveBeenCalledWith(expect.objectContaining({ status: "PENDING" }));
  });
});

describe("listAdminBidsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminBids.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminBidsAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminBids called with params unchanged", async () => {
    await listAdminBidsAction({ productId: "auction-charizard" });
    expect(mockListAdminBids).toHaveBeenCalledWith(
      expect.objectContaining({ productId: "auction-charizard" }),
    );
  });
});

describe("listAdminBlogAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminBlog.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminBlogAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminBlog called with params", async () => {
    await listAdminBlogAction({ status: "draft" });
    expect(mockListAdminBlog).toHaveBeenCalledWith(expect.objectContaining({ status: "draft" }));
  });
});

describe("listAdminStoresAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminStores.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminStoresAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminStores called with params", async () => {
    await listAdminStoresAction({ isVerified: true });
    expect(mockListAdminStores).toHaveBeenCalledWith(expect.objectContaining({ isVerified: true }));
  });
});

describe("listAdminSessionsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockListAdminSessions.mockResolvedValue({ items: [], total: 0 });
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listAdminSessionsAction({ page: 1 });
    expect(result.ok).toBe(false);
  });

  it("valid → listAdminSessions called with params", async () => {
    await listAdminSessionsAction({ userId: "user-buyer-1" });
    expect(mockListAdminSessions).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-buyer-1" }),
    );
  });
});
