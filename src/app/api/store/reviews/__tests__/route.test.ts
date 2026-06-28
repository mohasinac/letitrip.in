/**
 * Tests for GET /api/store/reviews
 * Returns reviews scoped to the authenticated seller's store.
 * If no store found → empty result (not error).
 * replied filter applied client-side (sellerReply not indexed).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockReviewListForStore,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockReviewListForStore: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  reviewRepository: { listForStore: mockReviewListForStore },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  sortBy: (field: string) => `-${field}`,
  REVIEW_FIELDS: { CREATED_AT: "createdAt" },
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
  const url = new URL("http://localhost/api/store/reviews");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid", storeSlug: "pokemon-palace" };

const makeReviews = (overrides: Partial<{ sellerReply: string; rating: number }>[]) =>
  overrides.map((o, i) => ({
    id: `review-${i}`,
    storeId: "store-pokemon-palace",
    productId: "product-1",
    rating: o.rating ?? 5,
    body: "Great product",
    sellerReply: o.sellerReply ?? undefined,
  }));

const pagedResult = (items: unknown[]) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockReviewListForStore.mockResolvedValue(pagedResult(makeReviews([{ rating: 5 }, { rating: 3 }])));
});

describe("GET /api/store/reviews", () => {
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

  it("no store found → returns empty result (not 404)", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { reviews: unknown[]; meta: { total: number } } };
    expect(json.data.reviews).toHaveLength(0);
    expect(json.data.meta.total).toBe(0);
  });

  it("returns reviews scoped to seller's store only", async () => {
    await GET(makeReq() as never);
    expect(mockReviewListForStore).toHaveBeenCalledWith("store-pokemon-palace", expect.any(Object));
  });

  it("replies filter=true → only reviews with sellerReply returned", async () => {
    const mixed = makeReviews([
      { sellerReply: "Thank you!" },
      {},
      { sellerReply: "Noted." },
    ]);
    mockReviewListForStore.mockResolvedValue(pagedResult(mixed));
    const res = await GET(makeReq({ replied: "true" }) as never);
    const json = await res.clone().json() as { data: { reviews: { sellerReply?: string }[] } };
    expect(json.data.reviews).toHaveLength(2);
    expect(json.data.reviews.every((r) => !!r.sellerReply)).toBe(true);
  });

  it("replies filter=false → only reviews without sellerReply returned", async () => {
    const mixed = makeReviews([
      { sellerReply: "Thank you!" },
      {},
      {},
    ]);
    mockReviewListForStore.mockResolvedValue(pagedResult(mixed));
    const res = await GET(makeReq({ replied: "false" }) as never);
    const json = await res.clone().json() as { data: { reviews: { sellerReply?: string }[] } };
    expect(json.data.reviews).toHaveLength(2);
    expect(json.data.reviews.every((r) => !r.sellerReply)).toBe(true);
  });

  it("no replied filter → all reviews returned", async () => {
    const mixed = makeReviews([{ sellerReply: "Thanks" }, {}, {}]);
    mockReviewListForStore.mockResolvedValue(pagedResult(mixed));
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { reviews: unknown[] } };
    expect(json.data.reviews).toHaveLength(3);
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeReq({ pageSize: "200" }) as never);
    const arg = mockReviewListForStore.mock.calls[0][1] as { pageSize: string };
    expect(Number(arg.pageSize)).toBeLessThanOrEqual(50);
  });

  it("returns pagination meta", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { meta: { total: number; page: number } } };
    expect(json.data.meta.total).toBe(2);
  });
});
