/**
 * Tests for GET /api/store/payouts
 * Returns payouts for seller's store + earnings summary.
 * No store → returns zero summary.
 * hasPendingPayout = true when pending or processing payouts exist.
 * totalPaidOut = sum of COMPLETED payouts.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockPayoutList,
  mockPayoutFindByStatus,
  mockOrderListAll,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockPayoutList: vi.fn(),
  mockPayoutFindByStatus: vi.fn(),
  mockOrderListAll: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  payoutRepository: { list: mockPayoutList, findByStoreAndStatus: mockPayoutFindByStatus },
  orderRepository: { listAll: mockOrderListAll },
  DEFAULT_PLATFORM_FEE_RATE: 0.05,
  PayoutStatusValues: { COMPLETED: "COMPLETED", PENDING: "PENDING", PROCESSING: "PROCESSING" },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  sortBy: (field: string) => `-${field}`,
  sieveAnd: (...filters: string[]) => filters.join(","),
  sieveFilter: (field: string, _op: string, val: string) => `${field}==${val}`,
  SIEVE_OP: { EQ: "==" },
  COMMON_FIELDS: { CREATED_AT: "createdAt" },
  ORDER_FIELDS: { STORE_ID: "storeId", STATUS: "status", PAYOUT_STATUS: "payoutStatus", ORDER_DATE: "createdAt" },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
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
  const url = new URL("http://localhost/api/store/payouts");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };

const pagedPayouts = (items: unknown[] = []) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
});

const emptyOrders = { items: [], total: 0 };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockPayoutList.mockResolvedValue(pagedPayouts());
  mockPayoutFindByStatus.mockResolvedValue([]);
  mockOrderListAll.mockResolvedValue(emptyOrders);
});

describe("GET /api/store/payouts", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("no store → returns zero summary", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { summary: { availableEarnings: number; hasPendingPayout: boolean } } };
    expect(json.data.summary.availableEarnings).toBe(0);
    expect(json.data.summary.hasPendingPayout).toBe(false);
  });

  it("payouts scoped to seller's store via storeId filter", async () => {
    await GET(makeReq() as never);
    const listArg = mockPayoutList.mock.calls[0][0] as { filters: string };
    expect(listArg.filters).toContain("storeId==store-pokemon-palace");
  });

  it("totalPaidOut = sum of COMPLETED payout amounts", async () => {
    // First call: COMPLETED, second: PENDING, third: PROCESSING
    mockPayoutFindByStatus
      .mockResolvedValueOnce([{ amount: 100000 }, { amount: 50000 }]) // COMPLETED
      .mockResolvedValueOnce([])  // PENDING
      .mockResolvedValueOnce([]); // PROCESSING
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { summary: { totalPaidOut: number } } };
    expect(json.data.summary.totalPaidOut).toBe(150000);
  });

  it("hasPendingPayout = true when pending payout exists", async () => {
    mockPayoutFindByStatus
      .mockResolvedValueOnce([])  // COMPLETED
      .mockResolvedValueOnce([{ amount: 50000 }])  // PENDING
      .mockResolvedValueOnce([]); // PROCESSING
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { summary: { hasPendingPayout: boolean } } };
    expect(json.data.summary.hasPendingPayout).toBe(true);
  });

  it("hasPendingPayout = true when processing payout exists", async () => {
    mockPayoutFindByStatus
      .mockResolvedValueOnce([])   // COMPLETED
      .mockResolvedValueOnce([])   // PENDING
      .mockResolvedValueOnce([{ amount: 75000 }]); // PROCESSING
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { summary: { hasPendingPayout: boolean } } };
    expect(json.data.summary.hasPendingPayout).toBe(true);
  });

  it("hasPendingPayout = false when no pending or processing payouts", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { summary: { hasPendingPayout: boolean } } };
    expect(json.data.summary.hasPendingPayout).toBe(false);
  });

  it("earnings computed from eligible DELIVERED orders", async () => {
    mockOrderListAll.mockResolvedValue({
      items: [{ id: "o1", totalPrice: 100000 }, { id: "o2", totalPrice: 50000 }],
      total: 2,
    });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as {
      data: { summary: { grossEarnings: number; platformFee: number; availableEarnings: number } }
    };
    expect(json.data.summary.grossEarnings).toBe(150000);
    // 5% platform fee
    expect(json.data.summary.platformFee).toBeCloseTo(7500, 0);
    expect(json.data.summary.availableEarnings).toBeCloseTo(142500, 0);
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const arg = mockPayoutList.mock.calls[0][0] as { pageSize: string };
    expect(Number(arg.pageSize)).toBeLessThanOrEqual(50);
  });

  it("returns pagination meta", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { meta: { total: number; page: number } } };
    expect(json.data.meta.page).toBe(1);
  });
});
