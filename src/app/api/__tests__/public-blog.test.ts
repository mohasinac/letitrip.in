/**
 * @jest-environment node
 */

/**
 * Public Blog API Tests
 *
 * GET /api/blog
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockListPublished = jest.fn();
jest.mock("@/repositories", () => ({
  blogRepository: {
    listPublished: (...args: unknown[]) => mockListPublished(...args),
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: any, _message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, ...data }, { status });
  },
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
  getStringParam: (params: any, key: string) => params.get(key) ?? undefined,
  getNumberParam: (params: any, key: string, fallback: number) => {
    const val = params.get(key);
    return val ? Number(val) : fallback;
  },
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { GET } from "../blog/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockPosts = [
  {
    id: "post-1",
    title: "Top 10 Products",
    slug: "top-10-products",
    category: "general",
    status: "published",
    publishedAt: new Date("2026-01-01"),
  },
  {
    id: "post-2",
    title: "Travel Guide",
    slug: "travel-guide",
    category: "travel",
    status: "published",
    publishedAt: new Date("2026-01-15"),
  },
];

const mockSieveResult = {
  items: mockPosts,
  total: 2,
  page: 1,
  pageSize: 12,
  totalPages: 1,
  hasMore: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/blog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListPublished.mockResolvedValue(mockSieveResult);
  });

  it("returns paginated blog post list", async () => {
    const req = buildRequest("/api/blog");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.posts).toHaveLength(2);
    expect(body.meta).toBeDefined();
    expect(body.meta.total).toBe(2);
  });

  it("filters by ?category= when provided", async () => {
    const req = buildRequest("/api/blog?category=travel");
    await GET(req);

    expect(mockListPublished).toHaveBeenCalledWith(
      expect.objectContaining({ category: "travel" }),
      expect.any(Object),
    );
  });

  it("filters featured posts when ?featured=true", async () => {
    const req = buildRequest("/api/blog?featured=true");
    await GET(req);

    expect(mockListPublished).toHaveBeenCalledWith(
      expect.objectContaining({ featuredOnly: true }),
      expect.any(Object),
    );
  });

  it("does not pass featuredOnly when ?featured is not true", async () => {
    const req = buildRequest("/api/blog");
    await GET(req);

    expect(mockListPublished).toHaveBeenCalledWith(
      expect.objectContaining({ featuredOnly: false }),
      expect.any(Object),
    );
  });

  it("respects page and pageSize params", async () => {
    const req = buildRequest("/api/blog?page=2&pageSize=6");
    await GET(req);

    expect(mockListPublished).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ page: 2, pageSize: 6 }),
    );
  });

  it("returns empty list when no published posts found", async () => {
    mockListPublished.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
      hasMore: false,
    });

    const req = buildRequest("/api/blog");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.posts).toHaveLength(0);
    expect(body.meta.total).toBe(0);
  });

  it("includes pagination meta in response", async () => {
    const req = buildRequest("/api/blog");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.page).toBe(1);
    expect(body.meta.pageSize).toBe(12);
    expect(body.meta.totalPages).toBe(1);
  });
});
