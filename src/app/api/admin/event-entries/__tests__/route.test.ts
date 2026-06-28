/**
 * Tests for GET /api/admin/event-entries
 *
 * Roles: ROLES_ADMIN_MOD
 * Permission: admin:event-entries:read
 *
 * Business logic:
 * - default sort: sortBy("submittedAt")
 * - pageSize: clamped [1,50], default 25
 * - filters and sorts forwarded as-is
 * - Returns { items, total, page, pageSize, totalPages }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockEntryList } = vi.hoisted(() => ({
  mockEntryList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  eventEntryRepository: { list: mockEntryList },
  sortBy: (field: string) => `sort:${field}`,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
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
  items: [{ id: "entry-001", eventId: "event-summer-holo-sale-2026", status: "CONFIRMED" }],
  total: 5,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockEntryList.mockResolvedValue(mockResult);
});

describe("GET /api/admin/event-entries", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/event-entries") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/event-entries") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/event-entries") as never);
    expect(res.status).toBe(200);
  });

  it("default sort is sortBy('submittedAt')", async () => {
    await GET(new Request("http://localhost/api/admin/event-entries") as never);
    const call = mockEntryList.mock.calls[0][0] as { sorts: string };
    expect(call.sorts).toBe("sort:submittedAt");
  });

  it("default pageSize is 25", async () => {
    await GET(new Request("http://localhost/api/admin/event-entries") as never);
    const call = mockEntryList.mock.calls[0][0] as { pageSize: string };
    expect(call.pageSize).toBe("25");
  });

  it("pageSize > 50 clamped to 50", async () => {
    await GET(new Request("http://localhost/api/admin/event-entries?pageSize=99") as never);
    const call = mockEntryList.mock.calls[0][0] as { pageSize: string };
    expect(call.pageSize).toBe("50");
  });

  it("pageSize < 1 clamped to 1", async () => {
    await GET(new Request("http://localhost/api/admin/event-entries?pageSize=-1") as never);
    const call = mockEntryList.mock.calls[0][0] as { pageSize: string };
    expect(call.pageSize).toBe("1");
  });

  it("custom sorts param overrides default", async () => {
    await GET(new Request("http://localhost/api/admin/event-entries?sorts=-createdAt") as never);
    const call = mockEntryList.mock.calls[0][0] as { sorts: string };
    expect(call.sorts).toBe("-createdAt");
  });

  it("eventId filter forwarded to list()", async () => {
    await GET(
      new Request("http://localhost/api/admin/event-entries?filters=eventId%3D%3Devent-summer-holo") as never,
    );
    const call = mockEntryList.mock.calls[0][0] as { filters: string | undefined };
    expect(call.filters).toBe("eventId==event-summer-holo");
  });

  it("returns { items, total, page, pageSize, totalPages }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/event-entries") as never);
    const json = await res.clone().json() as { data: typeof mockResult };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(5);
    expect(json.data.totalPages).toBe(1);
  });
});
