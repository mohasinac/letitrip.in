/**
 * Tests for GET /api/admin/payouts
 * Admin-only payout list with parallel summary counts.
 * Key: summary always uses full unfiltered data; email search uses blind index.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockPayoutList } = vi.hoisted(() => ({
  mockPayoutList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  payoutRepository: { list: mockPayoutList },
  piiBlindIndex: (s: string) => `hashed:${s}`,
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  buildSieveFilters: (...groups: string[][]) =>
    groups.flat().filter(Boolean).join(",") || undefined,
  sortBy: (field: string, dir = "DESC") => `${dir === "ASC" ? "" : "-"}${field}`,
  sieveFilter: (field: string, op: string, value: string) => `${field}${op}${value}`,
  SIEVE_OP: { EQ: "==" },
  PAYOUT_FIELDS: {
    STATUS: "status",
    SELLER_EMAIL_INDEX: "sellerEmailIndex",
    SELLER_NAME: "sellerName",
  },
  PayoutStatusValues: {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
  },
  COMMON_FIELDS: { CREATED_AT: "createdAt" },
  serverLogger: { info: vi.fn(), error: vi.fn() },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
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

const makeEmptyResult = (total = 0) => ({
  items: [],
  total,
  page: 1,
  pageSize: 50,
  totalPages: 0,
  hasMore: false,
});

const makePayoutItem = (overrides = {}) => ({
  id: "payout-001",
  storeId: "store-palace",
  amount: 5000,
  status: "PENDING",
  ...overrides,
});

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/payouts");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  // Default: all summary count queries + main list return same structure
  mockPayoutList.mockResolvedValue(makeEmptyResult());
});

describe("GET /api/admin/payouts", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403 (admin/mod only)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("parallel summary count queries always fired (5 calls: all+pending+processing+completed+failed, plus main)", async () => {
    await GET(makeReq() as never);
    // 5 summary count queries + 1 main paginated query
    expect(mockPayoutList.mock.calls.length).toBe(6);
  });

  it("summary counts reflect correct status filters", async () => {
    // First call: all (no filter), next 4: per-status, last: main paginated
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(100)); // all
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(30));  // pending
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(20));  // processing
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(40));  // completed
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(10));  // failed
    mockPayoutList.mockResolvedValueOnce({ // main paginated result
      items: [makePayoutItem()],
      total: 100,
      page: 1,
      pageSize: 50,
      totalPages: 2,
      hasMore: true,
    });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { summary: { total: number; pending: number; processing: number; completed: number; failed: number } }
    };
    expect(json.data.summary.total).toBe(100);
    expect(json.data.summary.pending).toBe(30);
    expect(json.data.summary.processing).toBe(20);
    expect(json.data.summary.completed).toBe(40);
    expect(json.data.summary.failed).toBe(10);
  });

  it("email query (contains @) → uses blind index for sellerEmailIndex field", async () => {
    mockPayoutList.mockResolvedValue(makeEmptyResult());
    await GET(makeReq({ q: "seller@test.com" }) as never);
    // Find the call that has the blind index filter
    const allCalls = mockPayoutList.mock.calls as Array<[{ filters?: string }]>;
    const mainCall = allCalls[allCalls.length - 1][0];
    expect(mainCall.filters).toContain("sellerEmailIndex==hashed:seller@test.com");
  });

  it("name query (no @) → uses sellerName field directly", async () => {
    mockPayoutList.mockResolvedValue(makeEmptyResult());
    await GET(makeReq({ q: "pokemon palace" }) as never);
    const allCalls = mockPayoutList.mock.calls as Array<[{ filters?: string }]>;
    const mainCall = allCalls[allCalls.length - 1][0];
    expect(mainCall.filters).toContain("sellerName==pokemon palace");
  });

  it("returns payouts array and meta in response", async () => {
    mockPayoutList.mockResolvedValue(makeEmptyResult());
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(0)); // all
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(0)); // pending
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(0)); // processing
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(0)); // completed
    mockPayoutList.mockResolvedValueOnce(makeEmptyResult(0)); // failed
    mockPayoutList.mockResolvedValueOnce({
      items: [makePayoutItem({ amount: 5000 }), makePayoutItem({ id: "payout-002", amount: 3000 })],
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
      hasMore: false,
    });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: {
        payouts: { amount: number }[];
        summary: { totalAmount: number };
        meta: { total: number };
      }
    };
    expect(json.data.payouts).toHaveLength(2);
    expect(json.data.summary.totalAmount).toBe(8000);
  });
});
