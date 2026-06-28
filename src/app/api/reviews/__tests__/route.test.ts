import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindFeatured,
  mockListAll,
  mockFindApprovedByProduct,
  mockListForProduct,
  mockCreateReview,
  mockUserFindById,
  mockIsSoftBanned,
} = vi.hoisted(() => ({
  mockFindFeatured: vi.fn(),
  mockListAll: vi.fn(),
  mockFindApprovedByProduct: vi.fn(),
  mockListForProduct: vi.fn(),
  mockCreateReview: vi.fn(),
  mockUserFindById: vi.fn(),
  mockIsSoftBanned: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit/server", () => ({
  isSoftBanned: mockIsSoftBanned,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), { status: init?.status ?? 200, headers: { "Content-Type": "application/json" } }),
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  reviewRepository: {
    findFeatured: mockFindFeatured,
    listAll: mockListAll,
    findApprovedByProduct: mockFindApprovedByProduct,
    listForProduct: mockListForProduct,
  },
  userRepository: { findById: mockUserFindById },
  createReview: mockCreateReview,
  parseJsonBody: async (req: Request) => req.clone().json().catch(() => ({})),
  REVIEW_FIELDS: {
    CREATED_AT: "createdAt",
    STATUS: "status",
    STATUS_VALUES: { APPROVED: "approved" },
  },
  SIEVE_OP: { EQ: "==" },
  sortBy: (field: string) => `${field}:desc`,
  sieveFilter: (field: string, op: string, val: string) => `${field}${op}${val}`,
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (error: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET, POST } from "../route";

function makeGetReq(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/reviews");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

function makePostReq(body: unknown): Request {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const defaultListResult = {
  items: [{ id: "review-1", rating: 5, status: "approved" }],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasMore: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockFindFeatured.mockResolvedValue([{ id: "review-featured", rating: 5 }]);
  mockListAll.mockResolvedValue({ ...defaultListResult });
  mockFindApprovedByProduct.mockResolvedValue([{ rating: 5 }, { rating: 4 }]);
  mockListForProduct.mockResolvedValue({ ...defaultListResult });
  mockCreateReview.mockResolvedValue({ id: "review-new", status: "pending" });
  mockUserFindById.mockResolvedValue({ uid: "buyer-uid", softBans: [] });
  mockIsSoftBanned.mockReturnValue(false);
});

describe("GET /api/reviews — featured mode", () => {
  it("featured=true → calls reviewRepository.findFeatured", async () => {
    await GET(makeGetReq({ featured: "true" }) as never);
    expect(mockFindFeatured).toHaveBeenCalled();
  });

  it("featured=true → Cache-Control header set", async () => {
    const res = await GET(makeGetReq({ featured: "true" }) as never);
    const cc = res.headers.get("Cache-Control");
    expect(cc).toMatch(/public/);
    expect(cc).toMatch(/max-age/);
  });
});

describe("GET /api/reviews — latest mode", () => {
  it("latest=true → calls reviewRepository.listAll with status==approved filter", async () => {
    await GET(makeGetReq({ latest: "true" }) as never);
    expect(mockListAll).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.stringContaining("status==approved") }),
    );
  });

  it("latest=true → Cache-Control header set", async () => {
    const res = await GET(makeGetReq({ latest: "true" }) as never);
    expect(res.headers.get("Cache-Control")).toMatch(/public/);
  });
});

describe("GET /api/reviews — by product", () => {
  it("missing productId → 400", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("productId");
  });

  it("valid productId → calls findApprovedByProduct for aggregates", async () => {
    await GET(makeGetReq({ productId: "product-1" }) as never);
    expect(mockFindApprovedByProduct).toHaveBeenCalledWith("product-1");
  });

  it("valid productId → calls listForProduct for paginated results", async () => {
    await GET(makeGetReq({ productId: "product-1" }) as never);
    expect(mockListForProduct).toHaveBeenCalledWith("product-1", expect.any(Object));
  });

  it("returns averageRating computed from approved reviews", async () => {
    mockFindApprovedByProduct.mockResolvedValue([{ rating: 5 }, { rating: 3 }]);
    const res = await GET(makeGetReq({ productId: "product-1" }) as never);
    const json = await res.clone().json() as { data: { averageRating: number } };
    expect(json.data.averageRating).toBe(4); // (5+3)/2
  });

  it("no approved reviews → averageRating = 0", async () => {
    mockFindApprovedByProduct.mockResolvedValue([]);
    const res = await GET(makeGetReq({ productId: "product-1" }) as never);
    const json = await res.clone().json() as { data: { averageRating: number } };
    expect(json.data.averageRating).toBe(0);
  });

  it("returns ratingDistribution with all 5 star levels", async () => {
    mockFindApprovedByProduct.mockResolvedValue([{ rating: 5 }, { rating: 5 }, { rating: 3 }]);
    const res = await GET(makeGetReq({ productId: "product-1" }) as never);
    const json = await res.clone().json() as { data: { ratingDistribution: Record<string, number> } };
    expect(json.data.ratingDistribution[5]).toBe(2);
    expect(json.data.ratingDistribution[3]).toBe(1);
    expect(json.data.ratingDistribution[1]).toBe(0);
  });

  it("Cache-Control header set", async () => {
    const res = await GET(makeGetReq({ productId: "product-1" }) as never);
    expect(res.headers.get("Cache-Control")).toMatch(/public/);
  });
});

describe("POST /api/reviews", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ productId: "p-1", rating: 5, body: "Great!" }) as never);
    expect(res.status).toBe(401);
  });

  it("user soft-banned for write_reviews → 403", async () => {
    mockUserFindById.mockResolvedValue({
      uid: "buyer-uid",
      softBans: [{ action: "write_reviews", reason: "Spam" }],
    });
    mockIsSoftBanned.mockReturnValue(true);
    const res = await POST(makePostReq({ productId: "p-1", rating: 5 }) as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Spam");
  });

  it("user soft-banned for different action → not blocked", async () => {
    mockUserFindById.mockResolvedValue({
      uid: "buyer-uid",
      softBans: [{ action: "place_bids", reason: "Shill bidding" }],
    });
    mockIsSoftBanned.mockReturnValue(false);
    const res = await POST(makePostReq({ productId: "p-1", rating: 5 }) as never);
    expect(res.status).toBe(201);
  });

  it("valid request → calls createReview with uid and body", async () => {
    await POST(makePostReq({ productId: "p-1", rating: 4, body: "Good!" }) as never);
    expect(mockCreateReview).toHaveBeenCalledWith("buyer-uid", expect.any(Object));
  });

  it("success → 201 with review data", async () => {
    const res = await POST(makePostReq({ productId: "p-1", rating: 5, body: "Excellent!" }) as never);
    expect(res.status).toBe(201);
  });
});
