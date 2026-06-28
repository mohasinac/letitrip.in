/**
 * Tests for GET /api/admin/scammers
 * Trust & Safety role required (admin + employee).
 * Supports text search via displayNames@= filter.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListAll } = vi.hoisted(() => ({
  mockListAll: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_TRUST_SAFETY: ["admin", "employee"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  scammerRepository: { listAll: mockListAll },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  sortBy: (field: string) => `-${field}`,
  SCAMMER_FIELDS: { CREATED_AT: "createdAt" },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
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

import { GET } from "../route";

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/scammers");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const pagedResult = (items: unknown[] = []) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
});

const mockScammer = {
  id: "scammer-9876543210-at-paytm",
  displayNames: ["Rajesh Fraud"],
  status: "pending_review",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListAll.mockResolvedValue(pagedResult([mockScammer]));
});

describe("GET /api/admin/scammers", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer role → 403 (trust & safety only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("employee role → 200 (allowed in ROLES_TRUST_SAFETY)", async () => {
    _user = { uid: "emp-uid", role: "employee" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("returns scammers list and meta", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { scammers: typeof mockScammer[]; meta: { total: number } } };
    expect(json.data.scammers).toHaveLength(1);
    expect(json.data.meta.total).toBe(1);
  });

  it("search query (q) appended as displayNames@= filter", async () => {
    await GET(makeReq({ q: "Rajesh" }) as never);
    const callArg = mockListAll.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("displayNames@=Rajesh");
  });

  it("search query combined with existing filters", async () => {
    await GET(makeReq({ q: "Rajesh", filters: "status==verified" }) as never);
    const callArg = mockListAll.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("status==verified");
    expect(callArg.filters).toContain("displayNames@=Rajesh");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const callArg = mockListAll.mock.calls[0][0] as { pageSize: number };
    expect(callArg.pageSize).toBe(50);
  });

  it("no search query → no displayNames filter appended", async () => {
    await GET(makeReq({ filters: "status==pending_review" }) as never);
    const callArg = mockListAll.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).not.toContain("displayNames@=");
    expect(callArg.filters).toBe("status==pending_review");
  });
});
