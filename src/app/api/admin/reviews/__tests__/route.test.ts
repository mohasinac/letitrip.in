/**
 * Tests for GET /api/admin/reviews
 * Admin/moderator can list all reviews across all stores.
 * User name search uses blind index.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockReviewListAll } = vi.hoisted(() => ({
  mockReviewListAll: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  REVIEW_FIELDS: { USER_NAME_INDEX: "userNameIndex" },
}));

vi.mock("@mohasinac/appkit", () => ({
  reviewRepository: { listAll: mockReviewListAll },
  piiBlindIndex: (s: string) => `hashed:${s}`,
  buildSieveFilters: (...groups: string[][]) =>
    groups.flat().filter(Boolean).join(",") || undefined,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      if (!_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const pagedResult = {
  items: [{ id: "review-001", rating: 5, status: "approved" }],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/reviews");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockReviewListAll.mockResolvedValue(pagedResult);
});

describe("GET /api/admin/reviews", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("returns all reviews with pagination", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(1);
    expect(json.data.items).toHaveLength(1);
  });

  it("status filter passed to listAll", async () => {
    await GET(makeReq({ filters: "status==pending" }) as never);
    expect(mockReviewListAll).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.stringContaining("status==pending") }),
    );
  });

  it("user name query → blind-indexed on userNameIndex field", async () => {
    await GET(makeReq({ q: "Ravi Kumar" }) as never);
    const callArg = mockReviewListAll.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("userNameIndex==hashed:Ravi Kumar");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "100" }) as never);
    const callArg = mockReviewListAll.mock.calls[0][0] as { pageSize: number };
    expect(callArg.pageSize).toBe(50);
  });
});
