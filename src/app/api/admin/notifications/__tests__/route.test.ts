/**
 * Tests for GET /api/admin/notifications
 *
 * ROLES_ADMIN_MOD + permission: admin:notifications:read
 * Uses notificationRepository.list() with Sieve filters/sorts from URL params.
 *
 * Pagination: pageSize clamped to [1, 50], default 25.
 * Default sort: sortBy("createdAt").
 * Returns: { items, total, page, pageSize, totalPages }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockNotifList } = vi.hoisted(() => ({
  mockNotifList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  notificationRepository: { list: mockNotifList },
  sortBy: (field: string) => `sort:${field}`,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
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

const mockListResult = {
  items: [{ id: "notif-order-shipped-001", userId: "user-ravi-k", type: "order_shipped", isRead: false }],
  total: 5,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockNotifList.mockResolvedValue(mockListResult);
});

describe("GET /api/admin/notifications", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/notifications") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/notifications") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/notifications") as never);
    expect(res.status).toBe(200);
  });

  it("default sort is sortBy('createdAt')", async () => {
    await GET(new Request("http://localhost/api/admin/notifications") as never);
    expect(mockNotifList).toHaveBeenCalledWith(
      expect.objectContaining({ sorts: "sort:createdAt" }),
    );
  });

  it("default pageSize is 25", async () => {
    await GET(new Request("http://localhost/api/admin/notifications") as never);
    expect(mockNotifList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "25" }),
    );
  });

  it("pageSize > 50 → clamped to 50", async () => {
    await GET(new Request("http://localhost/api/admin/notifications?pageSize=200") as never);
    expect(mockNotifList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "50" }),
    );
  });

  it("pageSize < 1 → clamped to 1", async () => {
    await GET(new Request("http://localhost/api/admin/notifications?pageSize=-5") as never);
    expect(mockNotifList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "1" }),
    );
  });

  it("filters param forwarded", async () => {
    await GET(new Request("http://localhost/api/admin/notifications?filters=isRead%3D%3Dfalse") as never);
    expect(mockNotifList).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "isRead==false" }),
    );
  });

  it("returns paginated result shape", async () => {
    const res = await GET(new Request("http://localhost/api/admin/notifications") as never);
    const json = await res.clone().json() as {
      data: { items: unknown[]; total: number; page: number; pageSize: number; totalPages: number };
    };
    expect(json.data.total).toBe(5);
    expect(json.data.items).toHaveLength(1);
  });
});
