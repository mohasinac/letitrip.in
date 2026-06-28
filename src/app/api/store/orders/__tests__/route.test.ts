/**
 * Tests for GET /api/store/orders
 * Scoped to authenticated seller's store: fetch store → products → orders.
 * Seller with no store or no products gets empty result (not 403).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindByOwnerId,
  mockFindByStore,
  mockListForSeller,
} = vi.hoisted(() => ({
  mockFindByOwnerId: vi.fn(),
  mockFindByStore: vi.fn(),
  mockListForSeller: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockFindByOwnerId },
  productRepository: { findByStore: mockFindByStore },
  orderRepository: { listForSeller: mockListForSeller },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  sortBy: (field: string) => `-${field}`,
  ORDER_FIELDS: { ORDER_DATE: "createdAt" },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  serverLogger: { info: vi.fn(), error: vi.fn() },
  // Route imports createApiHandler as createRouteHandler; export both names
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

const mockStore = { id: "store-palace", ownerId: "seller-uid" };
const mockProducts = [
  { id: "product-charizard", storeId: "store-palace" },
  { id: "product-pikachu", storeId: "store-palace" },
];
const mockOrdersResult = {
  items: [{ id: "order-1", status: "PENDING", storeId: "store-palace" }],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
};

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/store/orders");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockFindByOwnerId.mockResolvedValue(mockStore);
  mockFindByStore.mockResolvedValue(mockProducts);
  mockListForSeller.mockResolvedValue(mockOrdersResult);
});

describe("GET /api/store/orders", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer role → 403 (seller-only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 200 with empty orders (not 403)", async () => {
    mockFindByOwnerId.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { orders: unknown[]; meta: { total: number } } };
    expect(json.data.orders).toHaveLength(0);
    expect(json.data.meta.total).toBe(0);
  });

  it("seller with no products → 200 with empty orders", async () => {
    mockFindByStore.mockResolvedValue([]);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { orders: unknown[] } };
    expect(json.data.orders).toHaveLength(0);
    // listForSeller should NOT be called when no products
    expect(mockListForSeller).not.toHaveBeenCalled();
  });

  it("findByStore called with seller's storeId (not another store)", async () => {
    await GET(makeReq() as never);
    expect(mockFindByStore).toHaveBeenCalledWith("store-palace");
  });

  it("listForSeller called with product IDs from seller's store", async () => {
    await GET(makeReq() as never);
    expect(mockListForSeller).toHaveBeenCalledWith(
      expect.arrayContaining(["product-charizard", "product-pikachu"]),
      expect.any(Object),
    );
  });

  it("filters passed through to listForSeller", async () => {
    await GET(makeReq({ filters: "status==SHIPPED" }) as never);
    expect(mockListForSeller).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ filters: "status==SHIPPED" }),
    );
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    expect(mockListForSeller).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ pageSize: 50 }),
    );
  });

  it("success → 200 with orders and pagination meta", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { orders: unknown[]; meta: { total: number } } };
    expect(json.data.orders).toHaveLength(1);
    expect(json.data.meta.total).toBe(1);
  });
});
