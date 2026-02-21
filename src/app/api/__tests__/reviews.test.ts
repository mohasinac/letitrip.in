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
const mockListForProduct = jest.fn();
const mockCreate = jest.fn();
const mockHasUserPurchased = jest.fn();

jest.mock("@/repositories", () => ({
  reviewRepository: {
    findByProduct: (...args: unknown[]) => mockFindByProduct(...args),
    listForProduct: (...args: unknown[]) => mockListForProduct(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
  orderRepository: {
    hasUserPurchased: (...args: unknown[]) => mockHasUserPurchased(...args),
  },
  productRepository: {
    findById: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock("@/lib/email", () => ({
  sendNewReviewNotificationEmail: jest.fn().mockResolvedValue(undefined),
  sendNewProductSubmittedEmail: jest.fn().mockResolvedValue(undefined),
  sendSiteSettingsChangedEmail: jest.fn().mockResolvedValue(undefined),
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
  AppError: class AppError extends Error {
    constructor(
      message: string,
      public statusCode: number = 500,
    ) {
      super(message);
      this.name = "AppError";
    }
  },
  AuthenticationError: class AuthenticationError extends Error {
    statusCode = 401;
    constructor(message: string) {
      super(message);
      this.name = "AuthenticationError";
    }
  },
}));

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    const status = error.statusCode ?? 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status },
    );
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
    mockListForProduct.mockImplementation(
      async (_productId: string, model: any) => {
        const page = model?.page ?? 1;
        const pageSize = model?.pageSize ?? 10;
        const filters = model?.filters as string | undefined;

        let filteredItems = [...mockReviews];
        if (filters?.includes("status==approved")) {
          filteredItems = filteredItems.filter(
            (review) => review.status === "approved",
          );
        }

        const start = (page - 1) * pageSize;
        const pagedItems = filteredItems.slice(start, start + pageSize);

        return {
          items: pagedItems,
          page,
          pageSize,
          total: filteredItems.length,
          totalPages: Math.max(1, Math.ceil(filteredItems.length / pageSize)),
          hasMore: start + pageSize < filteredItems.length,
        };
      },
    );
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
    const req = buildRequest("/api/reviews?productId=prod-1&page=1&pageSize=1");
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
    mockHasUserPurchased.mockResolvedValue(true); // User has purchased by default
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

  // ──────────────────────────────────────────
  // Purchase verification gate (Phase 7.3)
  // ──────────────────────────────────────────

  it("returns 403 when user has not purchased the product", async () => {
    mockHasUserPurchased.mockResolvedValue(false);

    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error).toContain("purchase");
  });

  it("sets verified=true when user has purchased the product", async () => {
    mockHasUserPurchased.mockResolvedValue(true);

    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ verified: true }),
    );
  });

  it("checks purchase against correct userId and productId", async () => {
    const user = mockRegularUser();
    mockRequireAuthFromRequest.mockResolvedValue(user);

    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-42", rating: 4, title: "Nice", comment: "ok" },
    });
    await POST(req);

    expect(mockHasUserPurchased).toHaveBeenCalledWith(user.uid, "prod-42");
  });

  it("does not create a review when purchase check fails (403 blocks create)", async () => {
    mockHasUserPurchased.mockResolvedValue(false);

    const req = buildRequest("/api/reviews", {
      method: "POST",
      body: { productId: "prod-1", rating: 5, title: "Great", comment: "test" },
    });
    await POST(req);

    expect(mockCreate).not.toHaveBeenCalled();
  });
});
