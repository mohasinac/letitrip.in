/**
 * Tests for GET /api/admin/bids
 *
 * Uses createApiHandler (not createRouteHandler — same mock contract).
 * Roles: ROLES_ADMIN_MOD
 * Permission: admin:bids:read
 *
 * Business logic:
 * - page: min 1, default 1
 * - pageSize: min 1, max 50, default 50 (different from most routes!)
 * - sorts: accepts "sorts" OR "sort" param; default "-bidDate" (descending)
 * - returns { items, total, page, pageSize, totalPages, hasMore }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockBidList } = vi.hoisted(() => ({
  mockBidList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  bidRepository: { list: mockBidList },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { request: Request; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ request, user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

const mockResult = {
  items: [{ id: "bid-charizard-ravi-20260508-x7y8z9", amount: 50000, status: "active" }],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockBidList.mockResolvedValue(mockResult);
});

describe("GET /api/admin/bids", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/bids") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/bids") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/bids") as never);
    expect(res.status).toBe(200);
  });

  it("default pageSize is 50 (not 25 like other routes)", async () => {
    await GET(new Request("http://localhost/api/admin/bids") as never);
    const call = mockBidList.mock.calls[0][0] as { pageSize: number };
    expect(call.pageSize).toBe(50);
  });

  it("pageSize > 50 → clamped to 50", async () => {
    await GET(new Request("http://localhost/api/admin/bids?pageSize=200") as never);
    const call = mockBidList.mock.calls[0][0] as { pageSize: number };
    expect(call.pageSize).toBe(50);
  });

  it("pageSize < 1 → clamped to 1", async () => {
    await GET(new Request("http://localhost/api/admin/bids?pageSize=-5") as never);
    const call = mockBidList.mock.calls[0][0] as { pageSize: number };
    expect(call.pageSize).toBe(1);
  });

  it("page < 1 → clamped to 1", async () => {
    await GET(new Request("http://localhost/api/admin/bids?page=0") as never);
    const call = mockBidList.mock.calls[0][0] as { page: number };
    expect(call.page).toBe(1);
  });

  it("default sort is '-bidDate' (newest first)", async () => {
    await GET(new Request("http://localhost/api/admin/bids") as never);
    const call = mockBidList.mock.calls[0][0] as { sorts: string };
    expect(call.sorts).toBe("-bidDate");
  });

  it("'sorts' param overrides default sort", async () => {
    await GET(new Request("http://localhost/api/admin/bids?sorts=-amount") as never);
    const call = mockBidList.mock.calls[0][0] as { sorts: string };
    expect(call.sorts).toBe("-amount");
  });

  it("'sort' param (alias) also overrides default sort", async () => {
    await GET(new Request("http://localhost/api/admin/bids?sort=amount") as never);
    const call = mockBidList.mock.calls[0][0] as { sorts: string };
    expect(call.sorts).toBe("amount");
  });

  it("filters param forwarded to list()", async () => {
    await GET(new Request("http://localhost/api/admin/bids?filters=status%3D%3Dactive") as never);
    const call = mockBidList.mock.calls[0][0] as { filters: string | undefined };
    expect(call.filters).toBe("status==active");
  });

  it("returns { items, total, page, pageSize, totalPages, hasMore }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/bids") as never);
    const json = await res.clone().json() as { data: typeof mockResult };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(1);
    expect(json.data.hasMore).toBe(false);
  });
});
