/**
 * Tests for GET /api/store/products
 * Seller can only see their own store's products — storeId filter enforced server-side.
 * No store → 403 (unlike orders which returns empty).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindByOwnerId,
  mockProductList,
} = vi.hoisted(() => ({
  mockFindByOwnerId: vi.fn(),
  mockProductList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_READ: ["seller"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockFindByOwnerId },
  productRepository: { list: mockProductList },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
  },
  createApiHandler: (opts: {
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (!_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const mockStore = { id: "store-palace", ownerId: "seller-uid" };
const pagedResult = {
  items: [{ id: "product-charizard", storeId: "store-palace" }],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/store/products");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockFindByOwnerId.mockResolvedValue(mockStore);
  mockProductList.mockResolvedValue(pagedResult);
});

describe("GET /api/store/products", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer role → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403 (unlike orders route which returns empty)", async () => {
    mockFindByOwnerId.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("storeId filter always appended to prevent cross-store access", async () => {
    await GET(makeReq() as never);
    const callArg = mockProductList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("storeId==store-palace");
  });

  it("client filter combined with storeId filter", async () => {
    await GET(makeReq({ filters: "listingType==auction" }) as never);
    const callArg = mockProductList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("storeId==store-palace");
    expect(callArg.filters).toContain("listingType==auction");
  });

  it("seller cannot bypass storeId filter by providing own storeId in filters", async () => {
    // Even if the seller adds their storeId in the filter, the server's storeId is still used
    await GET(makeReq({ filters: "storeId==store-other" }) as never);
    const callArg = mockProductList.mock.calls[0][0] as { filters: string };
    // The server-enforced storeId==store-palace must be present
    expect(callArg.filters).toContain("storeId==store-palace");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const callArg = mockProductList.mock.calls[0][0] as { pageSize: number };
    expect(callArg.pageSize).toBe(50);
  });

  it("returns products and pagination meta", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: { products: unknown[]; meta: { total: number } }
    };
    expect(json.data.products).toHaveLength(1);
    expect(json.data.meta.total).toBe(1);
  });
});
