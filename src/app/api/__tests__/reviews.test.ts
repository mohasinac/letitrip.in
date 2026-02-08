/**
 * @jest-environment node
 */

/**
 * Reviews API Integration Tests
 *
 * Tests GET /api/reviews and POST /api/reviews
 */

import {
  buildRequest,
  parseResponse,
  mockRegularUser,
  mockSellerUser,
} from "./helpers";

// ============================================
// Mocks
// ============================================

const mockFindByProduct = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/repositories", () => ({
  reviewRepository: {
    findByProduct: (...args: unknown[]) => mockFindByProduct(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockRequireAuthFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  requireAuthFromRequest: (...args: unknown[]) =>
    mockRequireAuthFromRequest(...args),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (_schema: unknown, body: any) => {
    if (body && body.productId && body.rating && body.title && body.comment) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: {
        format: () => [{ path: ["rating"], message: "Rating is required" }],
      },
    };
  },
  formatZodErrors: (errors: any) => errors?.format?.() || [],
  reviewCreateSchema: {},
}));

jest.mock("@/lib/errors", () => ({
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthenticationError";
    }
  },
}));

import { GET, POST } from "../reviews/route";

// ============================================
// Mock data
// ============================================

const mockReviews = [
  {
    id: "rev-1",
    productId: "prod-1",
    userId: "user-1",
    userName: "Alice",
    rating: 5,
    title: "Great product",
    comment: "Love it!",
    status: "approved",
    verified: true,
    helpfulCount: 10,
    createdAt: new Date("2026-02-01"),
  },
  {
    id: "rev-2",
    productId: "prod-1",
    userId: "user-2",
    userName: "Bob",
    rating: 3,
    title: "Okay product",
    comment: "Average",
    status: "approved",
    verified: false,
    helpfulCount: 2,
    createdAt: new Date("2026-02-03"),
  },
  {
    id: "rev-3",
    productId: "prod-1",
    userId: "user-3",
    userName: "Charlie",
    rating: 1,
    title: "Bad",
    comment: "Broken",
    status: "pending",
    verified: false,
    helpfulCount: 0,
    createdAt: new Date("2026-02-05"),
  },
];

// ============================================
// Tests
// ============================================

describe("Reviews API - GET /api/reviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindByProduct.mockResolvedValue([...mockReviews]);
  });

  it("requires productId parameter", async () => {
    const req = buildRequest("/api/reviews");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("productId");
  });

  it("returns reviews for a product", async () => {
    const req = buildRequest("/api/reviews?productId=prod-1");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockFindByProduct).toHaveBeenCalledWith("prod-1");
  });

  it("returns rating distribution in meta", async () => {
    const req = buildRequest("/api/reviews?productId=prod-1");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.ratingDistribution).toBeDefined();
    expect(body.meta.ratingDistribution).toHaveProperty("5");
    expect(body.meta.ratingDistribution).toHaveProperty("1");
  });

  it("returns averageRating in meta", async () => {
    const req = buildRequest("/api/reviews?productId=prod-1");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.averageRating).toBeDefined();
    expect(typeof body.meta.averageRating).toBe("number");
  });

  it("only returns approved reviews by default", async () => {
    const req = buildRequest("/api/reviews?productId=prod-1");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    // 2 approved reviews out of 3 total
    expect(body.data.length).toBe(2);
    body.data.forEach((review: any) => {
      expect(review.status).toBe("approved");
    });
  });

  it("supports pagination", async () => {
    const req = buildRequest("/api/reviews?productId=prod-1&page=1&limit=1");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(1);
    expect(body.meta.hasMore).toBe(true);
    expect(body.data.length).toBe(1);
  });

  it("handles repository errors gracefully", async () => {
    mockFindByProduct.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/reviews?productId=prod-1");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("sets public cache-control headers with stale-while-revalidate", async () => {
    const req = buildRequest("/api/reviews?productId=prod-1");
    const res = await GET(req);
    const cacheControl = res.headers.get("cache-control");
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("stale-while-revalidate");
  });
});

describe("Reviews API - POST /api/reviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuthFromRequest.mockResolvedValue(mockRegularUser());
    mockFindByProduct.mockResolvedValue([]); // No existing reviews
    mockCreate.mockResolvedValue({ id: "new-rev", rating: 5, title: "Great" });
  });

  it("creates a review with valid data", async () => {
    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: {
        productId: "prod-1",
        rating: 5,
        title: "Great",
        comment: "Love it",
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("requires authentication", async () => {
    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    await POST(req);
    expect(mockRequireAuthFromRequest).toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = require("@/lib/errors");
    mockRequireAuthFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 400 for invalid body", async () => {
    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1" }, // missing rating, title, comment
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("prevents duplicate reviews from same user", async () => {
    const user = mockRegularUser();
    mockRequireAuthFromRequest.mockResolvedValue(user);
    mockFindByProduct.mockResolvedValue([
      { id: "existing", userId: user.uid, rating: 4 },
    ]);

    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Again", comment: "test" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toContain("already reviewed");
  });

  it("sets userId from authenticated user", async () => {
    const user = mockRegularUser();
    mockRequireAuthFromRequest.mockResolvedValue(user);

    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: user.uid }),
    );
  });

  it("sets status to pending for moderation", async () => {
    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("handles repository create errors", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});
