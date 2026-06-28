/**
 * Tests for GET /api/store/dashboard
 * Returns aggregated stats for the authenticated seller's store.
 * Revenue excludes CANCELLED and REFUNDED orders.
 * averageRating computed from approved reviews.
 * paise → rupees conversion for revenue.
 * No store → returns zeros.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockProductFindByStore,
  mockOrderListForSeller,
  mockReviewFindApproved,
  mockPayoutFindByStoreAndStatus,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockProductFindByStore: vi.fn(),
  mockOrderListForSeller: vi.fn(),
  mockReviewFindApproved: vi.fn(),
  mockPayoutFindByStoreAndStatus: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  productRepository: { findByStore: mockProductFindByStore },
  orderRepository: { listForSeller: mockOrderListForSeller },
  reviewRepository: { findApprovedByStore: mockReviewFindApproved },
  payoutRepository: { findByStoreAndStatus: mockPayoutFindByStoreAndStatus },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  sieveFilter: (field: string, _op: string, val: string) => `${field}==${val}`,
  SIEVE_OP: { EQ: "==" },
  serverLogger: { info: vi.fn(), error: vi.fn() },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

const makeReq = () => new Request("http://localhost/api/store/dashboard");

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const makeProduct = (id: string, status = "published") => ({ id, status } as const);
const makeOrder = (id: string, status: string, totalAmount: number) => ({ id, status, totalAmount });
const makeReview = (rating: number) => ({ id: `review-${rating}`, rating });
const makePayout = (amount: number) => ({ id: "payout-1", amount });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockProductFindByStore.mockResolvedValue([
    makeProduct("product-1"),
    makeProduct("product-2", "draft"),
  ]);
  mockOrderListForSeller.mockResolvedValue({ items: [], total: 0 });
  mockReviewFindApproved.mockResolvedValue([]);
  mockPayoutFindByStoreAndStatus.mockResolvedValue([]);
});

describe("GET /api/store/dashboard", () => {
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

  it("no store → returns all zeros (not error)", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { totalRevenue: number; activeListings: number } };
    expect(json.data.totalRevenue).toBe(0);
    expect(json.data.activeListings).toBe(0);
  });

  it("activeListings counts only published products", async () => {
    mockProductFindByStore.mockResolvedValue([
      makeProduct("p1", "published"),
      makeProduct("p2", "draft"),
      makeProduct("p3", "published"),
    ]);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { activeListings: number } };
    expect(json.data.activeListings).toBe(2);
  });

  it("totalRevenue excludes CANCELLED and REFUNDED orders", async () => {
    mockOrderListForSeller.mockResolvedValueOnce({
      items: [
        makeOrder("o1", "DELIVERED", 100000),   // included
        makeOrder("o2", "CANCELLED", 50000),    // excluded
        makeOrder("o3", "REFUNDED", 30000),     // excluded
        makeOrder("o4", "PROCESSING", 80000),   // included
      ],
      total: 4,
    }).mockResolvedValueOnce({ items: [], total: 0 }); // pending orders call
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { totalRevenue: number } };
    // Revenue: (100000 + 80000) paise = 180000 paise = 1800 rupees
    expect(json.data.totalRevenue).toBe(1800);
  });

  it("totalRevenue converts paise to rupees", async () => {
    mockOrderListForSeller.mockResolvedValueOnce({
      items: [makeOrder("o1", "DELIVERED", 150000)], // 1500 rupees
      total: 1,
    }).mockResolvedValueOnce({ items: [], total: 0 });
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { totalRevenue: number } };
    expect(json.data.totalRevenue).toBe(1500);
  });

  it("averageRating computed from approved reviews", async () => {
    mockReviewFindApproved.mockResolvedValue([
      makeReview(5), makeReview(4), makeReview(3),
    ]);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { averageRating: number } };
    expect(json.data.averageRating).toBe(4); // (5+4+3)/3 = 4.0
  });

  it("no reviews → averageRating is undefined", async () => {
    mockReviewFindApproved.mockResolvedValue([]);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { averageRating: number | undefined } };
    expect(json.data.averageRating).toBeUndefined();
  });

  it("pendingPayouts sums pending payout amounts in rupees", async () => {
    mockPayoutFindByStoreAndStatus.mockResolvedValue([
      makePayout(100000),  // 1000 rupees
      makePayout(50000),   // 500 rupees
    ]);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { pendingPayouts: number } };
    expect(json.data.pendingPayouts).toBe(1500);
  });

  it("no products → order queries skipped, returns zeros", async () => {
    mockProductFindByStore.mockResolvedValue([]);
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { totalOrders: number; activeListings: number } };
    expect(json.data.totalOrders).toBe(0);
    expect(json.data.activeListings).toBe(0);
    // listForSeller not called when no products
    expect(mockOrderListForSeller).not.toHaveBeenCalled();
  });

  it("currency is always ₹", async () => {
    const res = await GET(makeReq() as never);
    const json = await res.clone().json() as { data: { currency: string } };
    expect(json.data.currency).toBe("₹");
  });
});
