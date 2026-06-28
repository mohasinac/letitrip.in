/**
 * Tests for GET /api/admin/carts
 *
 * ROLES_ADMIN_MOD + permission: admin:carts:read
 * Uses cartRepository.list() with Sieve filters/sorts from URL params.
 *
 * Pagination: pageSize clamped to [1, 50], default 25.
 * Default sort: sortBy("updatedAt").
 * Returns: { items, total, page, pageSize, totalPages }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockCartList } = vi.hoisted(() => ({
  mockCartList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  cartRepository: { list: mockCartList },
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
  items: [{ id: "cart-abc", userId: "user-ravi-k", items: [] }],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCartList.mockResolvedValue(mockListResult);
});

describe("GET /api/admin/carts", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/carts") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/carts") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/carts") as never);
    expect(res.status).toBe(200);
  });

  it("calls cartRepository.list with default pageSize=25", async () => {
    await GET(new Request("http://localhost/api/admin/carts") as never);
    expect(mockCartList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "25" }),
    );
  });

  it("pageSize param respected (within bounds)", async () => {
    await GET(new Request("http://localhost/api/admin/carts?pageSize=10") as never);
    expect(mockCartList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "10" }),
    );
  });

  it("pageSize > 50 → clamped to 50", async () => {
    await GET(new Request("http://localhost/api/admin/carts?pageSize=100") as never);
    expect(mockCartList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "50" }),
    );
  });

  it("pageSize < 1 (e.g. 0) → clamped to 1", async () => {
    await GET(new Request("http://localhost/api/admin/carts?pageSize=0") as never);
    expect(mockCartList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "1" }),
    );
  });

  it("default sort is sortBy('updatedAt')", async () => {
    await GET(new Request("http://localhost/api/admin/carts") as never);
    expect(mockCartList).toHaveBeenCalledWith(
      expect.objectContaining({ sorts: "sort:updatedAt" }),
    );
  });

  it("custom sorts param passed through", async () => {
    await GET(new Request("http://localhost/api/admin/carts?sorts=sort:userId") as never);
    expect(mockCartList).toHaveBeenCalledWith(
      expect.objectContaining({ sorts: "sort:userId" }),
    );
  });

  it("filters param forwarded to list()", async () => {
    await GET(new Request("http://localhost/api/admin/carts?filters=userId%3D%3Duser-ravi-k") as never);
    expect(mockCartList).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "userId==user-ravi-k" }),
    );
  });

  it("returns { items, total, page, pageSize, totalPages }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/carts") as never);
    const json = await res.clone().json() as {
      data: { items: unknown[]; total: number; page: number; pageSize: number; totalPages: number };
    };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(1);
    expect(json.data.page).toBe(1);
    expect(json.data.pageSize).toBe(25);
    expect(json.data.totalPages).toBe(1);
  });
});
