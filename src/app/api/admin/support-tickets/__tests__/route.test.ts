/**
 * Tests for GET /api/admin/support-tickets
 *
 * Roles: ROLES_TRUST_SAFETY = ["admin", "employee"]
 * Permission: admin:support-tickets:read
 *
 * Business logic:
 * - page/pageSize [1,50] default 25
 * - default sort: sortBy(SUPPORT_TICKET_FIELDS.CREATED_AT)
 * - q param → appended as `subject@={q}` to filters (fuzzy subject search)
 * - filters + q → combined as `{filters},subject@={q}`
 * - q alone (no filters) → `subject@={q}`
 * - result from supportRepository.listAll(model) returned as-is
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListAll } = vi.hoisted(() => ({
  mockListAll: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_TRUST_SAFETY: ["admin", "employee"] }));

vi.mock("@mohasinac/appkit", () => ({
  supportRepository: { listAll: mockListAll },
  sortBy: (field: string) => `sort:${field}`,
  SUPPORT_TICKET_FIELDS: { CREATED_AT: "createdAt" },
  getSearchParams: (request: Request) => new URL(request.url).searchParams,
  getStringParam: (params: URLSearchParams, key: string) => params.get(key) ?? "",
  getNumberParam: (
    params: URLSearchParams,
    key: string,
    defaultVal: number,
    opts?: { min?: number; max?: number },
  ) => {
    const raw = params.get(key);
    if (!raw) return defaultVal;
    const n = Number(raw);
    if (isNaN(n)) return defaultVal;
    let v = n;
    if (opts?.min !== undefined) v = Math.max(v, opts.min);
    if (opts?.max !== undefined) v = Math.min(v, opts.max);
    return v;
  },
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
  items: [{ id: "ticket-order-issue-ravi-20260508", status: "open", subject: "Broken item" }],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListAll.mockResolvedValue(mockResult);
});

describe("GET /api/admin/support-tickets", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 403 (not in ROLES_TRUST_SAFETY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    expect(res.status).toBe(403);
  });

  it("employee → 200 (ROLES_TRUST_SAFETY includes employee)", async () => {
    _user = { uid: "emp-uid", role: "employee" };
    const res = await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    expect(res.status).toBe(200);
  });

  it("admin → 200", async () => {
    const res = await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    expect(res.status).toBe(200);
  });

  it("default sort is sortBy(SUPPORT_TICKET_FIELDS.CREATED_AT)", async () => {
    await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    expect(mockListAll).toHaveBeenCalledWith(
      expect.objectContaining({ sorts: "sort:createdAt" }),
    );
  });

  it("default pageSize = 25", async () => {
    await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    expect(mockListAll).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 25 }),
    );
  });

  it("pageSize > 50 clamped to 50", async () => {
    await GET(new Request("http://localhost/api/admin/support-tickets?pageSize=99") as never);
    expect(mockListAll).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 50 }),
    );
  });

  it("q alone → filters = 'subject@={q}'", async () => {
    await GET(new Request("http://localhost/api/admin/support-tickets?q=broken") as never);
    expect(mockListAll).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "subject@=broken" }),
    );
  });

  it("filters alone (no q) → filters passed as-is", async () => {
    await GET(new Request("http://localhost/api/admin/support-tickets?filters=status%3D%3Dopen") as never);
    expect(mockListAll).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "status==open" }),
    );
  });

  it("filters + q → combined as '{filters},subject@={q}'", async () => {
    await GET(
      new Request("http://localhost/api/admin/support-tickets?filters=status%3D%3Dopen&q=billing") as never,
    );
    expect(mockListAll).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "status==open,subject@=billing" }),
    );
  });

  it("no q → filters field not appended with subject@=", async () => {
    await GET(new Request("http://localhost/api/admin/support-tickets?filters=status%3D%3Dopen") as never);
    const call = mockListAll.mock.calls[0][0] as { filters: string | undefined };
    expect(call.filters).not.toContain("subject@=");
  });

  it("returns paginated result from supportRepository.listAll", async () => {
    const res = await GET(new Request("http://localhost/api/admin/support-tickets") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(1);
  });
});
