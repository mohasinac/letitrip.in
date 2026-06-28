/**
 * Tests for GET /api/admin/newsletter
 *
 * Uses createApiHandler (imported as createRouteHandler).
 * Roles: ROLES_ADMIN_ONLY
 * Permission: admin:newsletter:read
 *
 * Business logic:
 * - Runs 4 parallel calls to newsletterRepository.list():
 *   1. total count (unfiltered, pageSize=1)
 *   2. active subscriber count (status==active, pageSize=1)
 *   3. unsubscribed count (status==unsubscribed, pageSize=1)
 *   4. paginated results (with provided filters/sorts)
 * - Returns { ...sieveResult, meta: { total, active, unsubscribed } }
 * - Default pageSize: 50 (max 50 — same as contact-submissions)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockNewsletterList } = vi.hoisted(() => ({
  mockNewsletterList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  newsletterRepository: { list: mockNewsletterList },
  sortBy: (field: string, dir = "ASC") => (dir === "DESC" ? `-${field}` : field),
  NEWSLETTER_SUBSCRIBER_FIELDS: {
    STATUS: "status",
    STATUS_VALUES: { ACTIVE: "active", UNSUBSCRIBED: "unsubscribed" },
  },
  COMMON_FIELDS: { CREATED_AT: "createdAt" },
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
  serverLogger: { info: vi.fn() },
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

const makeListResult = (total: number, items: unknown[] = []) => ({
  items,
  total,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  data: items,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  // 4 parallel calls in order: total, active, unsubscribed, paginated
  mockNewsletterList
    .mockResolvedValueOnce(makeListResult(1000))  // total
    .mockResolvedValueOnce(makeListResult(750))   // active
    .mockResolvedValueOnce(makeListResult(150))   // unsubscribed
    .mockResolvedValueOnce(makeListResult(10, [{ id: "sub-001", email: "a@b.com" }])); // paginated
});

describe("GET /api/admin/newsletter", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/newsletter") as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/newsletter") as never);
    expect(res.status).toBe(403);
  });

  it("admin → 200", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter") as never);
    expect(res.status).toBe(200);
  });

  it("makes exactly 4 calls to newsletterRepository.list", async () => {
    await GET(new Request("http://localhost/api/admin/newsletter") as never);
    expect(mockNewsletterList).toHaveBeenCalledTimes(4);
  });

  it("meta.total reflects unfiltered count", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter") as never);
    const json = await res.clone().json() as { data: { meta: { total: number; active: number; unsubscribed: number } } };
    expect(json.data.meta.total).toBe(1000);
  });

  it("meta.active reflects filtered active count", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter") as never);
    const json = await res.clone().json() as { data: { meta: { active: number } } };
    expect(json.data.meta.active).toBe(750);
  });

  it("meta.unsubscribed reflects filtered unsubscribed count", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter") as never);
    const json = await res.clone().json() as { data: { meta: { unsubscribed: number } } };
    expect(json.data.meta.unsubscribed).toBe(150);
  });

  it("active count query uses status==active filter", async () => {
    await GET(new Request("http://localhost/api/admin/newsletter") as never);
    const calls = mockNewsletterList.mock.calls.map((c) => (c[0] as { filters?: string }).filters);
    expect(calls).toContain("status==active");
  });

  it("unsubscribed count query uses status==unsubscribed filter", async () => {
    await GET(new Request("http://localhost/api/admin/newsletter") as never);
    const calls = mockNewsletterList.mock.calls.map((c) => (c[0] as { filters?: string }).filters);
    expect(calls).toContain("status==unsubscribed");
  });

  it("total count query has no status filter", async () => {
    await GET(new Request("http://localhost/api/admin/newsletter") as never);
    const firstCall = mockNewsletterList.mock.calls[0][0] as { filters?: string };
    expect(firstCall.filters).toBeFalsy();
  });

  it("default pageSize is 50", async () => {
    await GET(new Request("http://localhost/api/admin/newsletter") as never);
    // 4th call is the paginated one
    const fourthCall = mockNewsletterList.mock.calls[3][0] as { pageSize: string };
    expect(fourthCall.pageSize).toBe("50");
  });

  it("pageSize > 50 clamped to 50", async () => {
    mockNewsletterList.mockReset();
    mockNewsletterList
      .mockResolvedValueOnce(makeListResult(1000))
      .mockResolvedValueOnce(makeListResult(750))
      .mockResolvedValueOnce(makeListResult(150))
      .mockResolvedValueOnce(makeListResult(10));
    await GET(new Request("http://localhost/api/admin/newsletter?pageSize=200") as never);
    const fourthCall = mockNewsletterList.mock.calls[3][0] as { pageSize: string };
    expect(fourthCall.pageSize).toBe("50");
  });

  it("filters passed to the paginated (4th) call", async () => {
    mockNewsletterList.mockReset();
    mockNewsletterList
      .mockResolvedValueOnce(makeListResult(1000))
      .mockResolvedValueOnce(makeListResult(750))
      .mockResolvedValueOnce(makeListResult(150))
      .mockResolvedValueOnce(makeListResult(3));
    await GET(
      new Request("http://localhost/api/admin/newsletter?filters=status%3D%3Dactive") as never,
    );
    const fourthCall = mockNewsletterList.mock.calls[3][0] as { filters: string };
    expect(fourthCall.filters).toBe("status==active");
  });
});
