/**
 * Tests for GET /api/admin/orders
 * Admin/moderator can list ALL orders across ALL stores.
 * pageSize clamped to 50. Supports Sieve filters/sorts.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListAll } = vi.hoisted(() => ({
  mockListAll: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  orderRepository: { listAll: mockListAll },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  sortBy: (field: string) => `-${field}`,
  ORDER_FIELDS: { CREATED_AT: "createdAt" },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  serverLogger: { info: vi.fn(), error: vi.fn() },
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

const mockOrder = {
  id: "order-3-20260501-abc123",
  buyerId: "user-ravi",
  storeId: "store-pokemon-palace",
  status: "DELIVERED",
  totalAmount: 150000,
};

const pagedResult = (items: unknown[] = []) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
});

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/orders");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListAll.mockResolvedValue(pagedResult([mockOrder]));
});

describe("GET /api/admin/orders", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403 (requires admin or moderator)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access all orders", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("returns orders from all stores (not scoped)", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { orders: typeof mockOrder[] } };
    expect(json.data.orders).toHaveLength(1);
    expect(json.data.orders[0]!.storeId).toBe("store-pokemon-palace");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "500" }) as never);
    const arg = mockListAll.mock.calls[0][0] as { pageSize: number };
    expect(arg.pageSize).toBe(50);
  });

  it("passes status filter to repository", async () => {
    await GET(makeReq({ filters: "status==PENDING" }) as never);
    const arg = mockListAll.mock.calls[0][0] as { filters: string };
    expect(arg.filters).toBe("status==PENDING");
  });

  it("returns pagination meta", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { meta: { total: number; page: number } } };
    expect(json.data.meta.total).toBe(1);
    expect(json.data.meta.page).toBe(1);
  });
});
