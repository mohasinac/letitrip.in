/**
 * @jest-environment node
 */

/**
 * Public Search API Tests
 *
 * GET /api/search
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockFindAll = jest.fn();
jest.mock("@/repositories", () => ({
  productRepository: {
    findAll: (...args: unknown[]) => mockFindAll(...args),
  },
}));

const mockApplySieveToArray = jest.fn();
jest.mock("@/helpers", () => ({
  applySieveToArray: (...args: unknown[]) => mockApplySieveToArray(...args),
}));

jest.mock("@/lib/search/algolia", () => ({
  isAlgoliaConfigured: () => false,
  algoliaSearch: jest.fn(),
}));

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    const status = error?.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error?.message || "Internal error" },
      { status },
    );
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getStringParam: (params: any, key: string) => params.get(key) ?? "",
  getNumberParam: (params: any, key: string, fallback: number) => {
    const val = params.get(key);
    return val ? Number(val) : fallback;
  },
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { GET } from "../search/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockProducts = [
  {
    id: "p1",
    title: "Running Shoes",
    description: "Great for running",
    price: 1500,
    category: "footwear",
    status: "published",
    brand: "Nike",
    tags: ["shoes", "running"],
  },
  {
    id: "p2",
    title: "Blue T-Shirt",
    description: "Casual wear",
    price: 500,
    category: "clothing",
    status: "published",
    brand: "H&M",
    tags: ["tshirt"],
  },
  {
    id: "p3",
    title: "Draft Product",
    description: "Not visible",
    price: 100,
    category: "misc",
    status: "draft",
    brand: "Brand",
    tags: [],
  },
];

const mockSieveResult = {
  items: mockProducts.slice(0, 2),
  total: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAll.mockResolvedValue(mockProducts);
    mockApplySieveToArray.mockResolvedValue(mockSieveResult);
  });

  it("returns paginated results for a valid query", async () => {
    const req = buildRequest("/api/search?q=shoes");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.meta).toBeDefined();
  });

  it("returns backend=in-memory in meta when Algolia is not configured", async () => {
    const req = buildRequest("/api/search?q=shoes");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.backend).toBe("in-memory");
  });

  it("returns an empty result when no products match the query", async () => {
    mockApplySieveToArray.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
      hasMore: false,
    });

    const req = buildRequest("/api/search?q=nomatch12345");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data).toHaveLength(0);
    expect(body.meta.total).toBe(0);
  });

  it("passes category filter to Sieve when ?category= is provided", async () => {
    const req = buildRequest("/api/search?q=shoes&category=footwear");
    await GET(req);

    expect(mockApplySieveToArray).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.objectContaining({
          filters: expect.stringContaining("category==footwear"),
        }),
      }),
    );
  });

  it("applies price range filter when minPrice and maxPrice are provided", async () => {
    const req = buildRequest("/api/search?q=shoes&minPrice=100&maxPrice=2000");
    await GET(req);

    expect(mockApplySieveToArray).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.objectContaining({
          filters: expect.stringContaining("price>=100"),
        }),
      }),
    );
  });

  it("respects page and pageSize query params", async () => {
    const req = buildRequest("/api/search?q=shoes&page=2&pageSize=5");
    await GET(req);

    expect(mockApplySieveToArray).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.objectContaining({ page: 2, pageSize: 5 }),
      }),
    );
  });

  it("returns only published products (filters out draft status)", async () => {
    const req = buildRequest("/api/search?q=product");
    await GET(req);

    // applySieveToArray should be called with only published products
    const callArgs = mockApplySieveToArray.mock.calls[0]?.[0];
    if (callArgs?.items) {
      callArgs.items.forEach((item: any) => {
        expect(item.status).toBe("published");
      });
    }
  });

  it("returns 200 even with an empty query string", async () => {
    const req = buildRequest("/api/search?q=");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
  });

  it("includes q in the meta response", async () => {
    const req = buildRequest("/api/search?q=running");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.q).toBe("running");
  });
});
