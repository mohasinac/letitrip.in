/**
 * Tests for GET /api/store/bids
 * Requires ROLES_STORE_READ + store:api:write.
 * Seller must have a store → 403 if none found.
 *
 * With productId param:
 *   - Verifies product belongs to store → 403 if not.
 *   - Lists bids for that product only.
 *
 * Without productId param:
 *   - Lists store's auction products (up to 30).
 *   - If no auctions → { bids: [], auctions: [] }.
 *   - Lists bids for all auction product IDs.
 *   - Returns auction summary alongside bids.
 *
 * pageSize clamped to 50 (max), 1 (min).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockBidList,
  mockProductList,
  mockProductFindById,
  mockStoreFindByOwnerId,
} = vi.hoisted(() => ({
  mockBidList: vi.fn(),
  mockProductList: vi.fn(),
  mockProductFindById: vi.fn(),
  mockStoreFindByOwnerId: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_READ: ["seller", "admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  bidRepository: { list: mockBidList },
  productRepository: { list: mockProductList, findById: mockProductFindById },
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  BID_FIELDS: { PRODUCT_ID: "productId", BID_DATE: "bidDate" },
  PRODUCT_FIELDS: { STORE_ID: "storeId", LISTING_TYPE: "listingType" },
  COMMON_FIELDS: { CREATED_AT: "createdAt" },
  SIEVE_OP: { EQ: "==" },
  sieveFilter: (field: string, _op: string, val: string) => `${field}==${val}`,
  sieveAnd: (...parts: string[]) => parts.join(","),
  sortBy: (field: string) => `-${field}`,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const makeReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/store/bids");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const mockStore = { id: "store-pokemon-palace" };
const mockAuctions = [
  { id: "auction-charizard", title: "Charizard PSA-9", storeId: "store-pokemon-palace", listingType: "auction" },
  { id: "auction-pikachu", title: "Pikachu Trophy", storeId: "store-pokemon-palace", listingType: "auction" },
];
const mockBids = [
  { id: "bid-1", productId: "auction-charizard", amount: 50000, bidderId: "user-1" },
  { id: "bid-2", productId: "auction-charizard", amount: 60000, bidderId: "user-2" },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwnerId.mockResolvedValue(mockStore);
  mockProductList.mockResolvedValue({ items: mockAuctions, total: 2 });
  mockProductFindById.mockResolvedValue(mockAuctions[0]);
  mockBidList.mockResolvedValue({ items: mockBids, total: 2 });
});

describe("GET /api/store/bids", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403 (not in ROLES_STORE_READ)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("without productId → lists all auction bids for the store", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { bids: unknown[]; auctions: unknown[] } };
    expect(json.data.bids).toHaveLength(2);
    expect(json.data.auctions).toHaveLength(2);
  });

  it("no auctions for store → returns empty bids and auctions", async () => {
    mockProductList.mockResolvedValue({ items: [], total: 0 });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { bids: unknown[]; total: number } };
    expect(json.data.bids).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });

  it("with productId → verifies product belongs to store", async () => {
    await GET(makeReq({ productId: "auction-charizard" }) as never);
    expect(mockProductFindById).toHaveBeenCalledWith("auction-charizard");
  });

  it("productId belongs to different store → 403", async () => {
    mockProductFindById.mockResolvedValue({ ...mockAuctions[0], storeId: "store-other" });
    const res = await GET(makeReq({ productId: "auction-charizard" }) as never);
    expect(res.status).toBe(403);
  });

  it("productId not found → 403", async () => {
    mockProductFindById.mockResolvedValue(null);
    const res = await GET(makeReq({ productId: "auction-charizard" }) as never);
    expect(res.status).toBe(403);
  });

  it("with valid productId → lists bids for that product with productId in response", async () => {
    mockBidList.mockResolvedValue({ items: [mockBids[0]], total: 1 });
    const res = await GET(makeReq({ productId: "auction-charizard" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { productId: string; bids: unknown[] } };
    expect(json.data.productId).toBe("auction-charizard");
    expect(json.data.bids).toHaveLength(1);
  });

  it("auction summary includes id and title for each auction", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { auctions: { id: string; title: string }[] } };
    expect(json.data.auctions[0].id).toBe("auction-charizard");
    expect(json.data.auctions[0].title).toBe("Charizard PSA-9");
  });

  it("product with no title → uses id as fallback title", async () => {
    mockProductList.mockResolvedValue({
      items: [{ id: "auction-no-title", storeId: "store-pokemon-palace" }], total: 1,
    });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { auctions: { title: string }[] } };
    expect(json.data.auctions[0].title).toBe("auction-no-title");
  });
});
