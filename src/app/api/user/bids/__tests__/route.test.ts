/**
 * Tests for GET /api/user/bids
 *
 * Business logic (rewritten to Sieve pagination — see bidRepository.list()):
 * - page: min 1, default 1
 * - pageSize: min 1, max 50, default 50
 * - sort: accepts "sort" param; default "-bidDate" (newest first)
 * - status: optional, adds a second AND'd filter clause
 * - always scoped to the requesting user via a userId== filter
 * - returns { bids, total, page, pageSize, totalPages, hasMore }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockBidList } = vi.hoisted(() => ({
  mockBidList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/features", () => ({ withFeatureGuard: (_name: string, fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_AUTHENTICATED: ["user", "seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  bidRepository: { list: mockBidList },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: { uid: string; role: string }; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
  sieveFilter: (field: string, op: string, value: unknown) => `${field}${op}${value}`,
  sieveAnd: (...clauses: (string | null | undefined | false)[]) => clauses.filter(Boolean).join(","),
  sortBy: (field: string, dir: "ASC" | "DESC" = "DESC") => `${dir === "DESC" ? "-" : ""}${field}`,
  SIEVE_OP: { EQ: "==" },
  BID_FIELDS: { USER_ID: "userId", STATUS: "status", BID_DATE: "bidDate" },
}));

import { GET } from "../route";

function makeReq(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/user/bids");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

const mockResult = {
  items: [{ id: "bid-1", bidAmount: 5000, status: "active" }],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "bidder-uid", role: "user" };
  mockBidList.mockResolvedValue(mockResult);
});

describe("GET /api/user/bids", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("scopes the query to the requesting user's uid", async () => {
    await GET(makeReq() as never);
    const call = mockBidList.mock.calls[0][0] as { filters: string };
    expect(call.filters).toBe("userId==bidder-uid");
  });

  it("adds a status filter when provided", async () => {
    await GET(makeReq({ status: "outbid" }) as never);
    const call = mockBidList.mock.calls[0][0] as { filters: string };
    expect(call.filters).toBe("userId==bidder-uid,status==outbid");
  });

  it("defaults to newest-first (-bidDate)", async () => {
    await GET(makeReq() as never);
    const call = mockBidList.mock.calls[0][0] as { sorts: string };
    expect(call.sorts).toBe("-bidDate");
  });

  it("'sort' param overrides the default sort", async () => {
    await GET(makeReq({ sort: "bidDate" }) as never);
    const call = mockBidList.mock.calls[0][0] as { sorts: string };
    expect(call.sorts).toBe("bidDate");
  });

  it("pageSize capped at 50", async () => {
    await GET(makeReq({ pageSize: "100" }) as never);
    const call = mockBidList.mock.calls[0][0] as { pageSize: number };
    expect(call.pageSize).toBeLessThanOrEqual(50);
  });

  it("pageSize >= 1 (never below 1)", async () => {
    await GET(makeReq({ pageSize: "0" }) as never);
    const call = mockBidList.mock.calls[0][0] as { pageSize: number };
    expect(call.pageSize).toBeGreaterThanOrEqual(1);
  });

  it("page < 1 → clamped to 1", async () => {
    await GET(makeReq({ page: "0" }) as never);
    const call = mockBidList.mock.calls[0][0] as { page: number };
    expect(call.page).toBe(1);
  });

  it("page param forwarded to list()", async () => {
    await GET(makeReq({ page: "3" }) as never);
    const call = mockBidList.mock.calls[0][0] as { page: number };
    expect(call.page).toBe(3);
  });

  it("returns { bids, total, page, pageSize, totalPages, hasMore }", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: { bids: unknown[]; total: number; page: number; totalPages: number; hasMore: boolean };
    };
    expect(json.data.bids).toHaveLength(1);
    expect(json.data.total).toBe(1);
    expect(json.data.page).toBe(1);
    expect(json.data.hasMore).toBe(false);
  });
});
