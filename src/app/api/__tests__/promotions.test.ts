/**
 * @jest-environment node
 */

/**
 * Promotions API Tests
 *
 * GET /api/promotions — Returns promoted products, featured products, and active coupons (no auth required)
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Repositories mock ───────────────────────────────────────────────────────

const mockFindPromoted = jest.fn();
const mockFindFeatured = jest.fn();
const mockGetActiveCoupons = jest.fn();

jest.mock("@/repositories", () => ({
  productRepository: {
    findPromoted: (...args: unknown[]) => mockFindPromoted(...args),
    findFeatured: (...args: unknown[]) => mockFindFeatured(...args),
  },
  couponsRepository: {
    getActiveCoupons: (...args: unknown[]) => mockGetActiveCoupons(...args),
  },
}));

// ─── Logger mock ─────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// ─── Error handler mock ───────────────────────────────────────────────────────

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: error?.statusCode || 500 },
    );
  },
}));

// ─── Route import ─────────────────────────────────────────────────────────────

import { GET } from "../promotions/route";

// ─── Test data ────────────────────────────────────────────────────────────────

const publishedProduct = {
  id: "prod-1",
  title: "Promo Product",
  price: 100,
  status: "published",
  isPromoted: true,
};

const draftProduct = {
  id: "prod-2",
  title: "Draft Product",
  price: 50,
  status: "draft",
  isPromoted: true,
};

const validCoupon = {
  id: "coupon-1",
  code: "SAVE10",
  type: "percentage",
  discount: 10,
  validity: {
    isActive: true,
    startDate: new Date(Date.now() - 86_400_000).toISOString(), // yesterday
    endDate: new Date(Date.now() + 86_400_000).toISOString(), // tomorrow
  },
};

const expiredCoupon = {
  id: "coupon-2",
  code: "EXPIRED",
  type: "percentage",
  discount: 20,
  validity: {
    isActive: true,
    startDate: new Date(Date.now() - 172_800_000).toISOString(), // 2 days ago
    endDate: new Date(Date.now() - 86_400_000).toISOString(), // yesterday
  },
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("GET /api/promotions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns promotions data with correct shape", async () => {
    mockFindPromoted.mockResolvedValue([publishedProduct]);
    mockFindFeatured.mockResolvedValue([publishedProduct]);
    mockGetActiveCoupons.mockResolvedValue([validCoupon]);

    const req = buildRequest("/api/promotions");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("promotedProducts");
    expect(body.data).toHaveProperty("featuredProducts");
    expect(body.data).toHaveProperty("activeCoupons");
  });

  it("filters out non-published products", async () => {
    mockFindPromoted.mockResolvedValue([publishedProduct, draftProduct]);
    mockFindFeatured.mockResolvedValue([draftProduct]);
    mockGetActiveCoupons.mockResolvedValue([]);

    const req = buildRequest("/api/promotions");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.promotedProducts).toHaveLength(1);
    expect(body.data.promotedProducts[0].id).toBe("prod-1");
    expect(body.data.featuredProducts).toHaveLength(0);
  });

  it("filters out expired coupons", async () => {
    mockFindPromoted.mockResolvedValue([]);
    mockFindFeatured.mockResolvedValue([]);
    mockGetActiveCoupons.mockResolvedValue([validCoupon, expiredCoupon]);

    const req = buildRequest("/api/promotions");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.activeCoupons).toHaveLength(1);
    expect(body.data.activeCoupons[0].id).toBe("coupon-1");
  });

  it("returns empty arrays when no promotions exist", async () => {
    mockFindPromoted.mockResolvedValue([]);
    mockFindFeatured.mockResolvedValue([]);
    mockGetActiveCoupons.mockResolvedValue([]);

    const req = buildRequest("/api/promotions");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.promotedProducts).toHaveLength(0);
    expect(body.data.featuredProducts).toHaveLength(0);
    expect(body.data.activeCoupons).toHaveLength(0);
  });

  it("is accessible without authentication", async () => {
    mockFindPromoted.mockResolvedValue([]);
    mockFindFeatured.mockResolvedValue([]);
    mockGetActiveCoupons.mockResolvedValue([]);

    // No cookies or auth headers — should still succeed
    const req = buildRequest("/api/promotions");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
  });

  it("returns 500 when repository throws", async () => {
    mockFindPromoted.mockRejectedValue(new Error("DB connection failed"));

    const req = buildRequest("/api/promotions");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(500);
  });
});
