/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/lib/utils/pagination");

const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<
  typeof getFirestoreAdmin
>;
const mockExecuteCursorPaginatedQuery =
  executeCursorPaginatedQuery as jest.MockedFunction<
    typeof executeCursorPaginatedQuery
  >;

describe("GET /api/reviews", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnThis(),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb as any);
  });

  it("should list published reviews for public users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    // Mock the stats query (separate collection call)
    mockDb.get.mockResolvedValue({
      docs: [],
    });

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [
        { id: "rev1", product_id: "prod1", rating: 5, status: "published" },
        { id: "rev2", product_id: "prod1", rating: 4, status: "published" },
      ],
      count: 2,
      pagination: { nextCursor: null, hasNextPage: false, limit: 20, count: 2 },
    });

    const req = new NextRequest(
      "http://localhost/api/reviews?product_id=prod1",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(2);
  });

  it("should allow admin to filter by status", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    });

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [{ id: "rev1", status: "pending" }],
      count: 1,
      pagination: { nextCursor: null, hasNextPage: false, limit: 20, count: 1 },
    });

    const req = new NextRequest("http://localhost/api/reviews?status=pending");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it("should filter by shop_id", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [{ id: "rev1", shop_id: "shop1", status: "published" }],
      count: 1,
      pagination: { nextCursor: null, hasNextPage: false, limit: 20, count: 1 },
    });

    const req = new NextRequest("http://localhost/api/reviews?shop_id=shop1");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it("should filter by verified purchases", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [{ id: "rev1", verified_purchase: true, status: "published" }],
      count: 1,
      pagination: { nextCursor: null, hasNextPage: false, limit: 20, count: 1 },
    });

    const req = new NextRequest("http://localhost/api/reviews?verified=true");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it("should sort by rating with min/max filters", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [{ id: "rev1", rating: 4, status: "published" }],
      count: 1,
      pagination: { nextCursor: null, hasNextPage: false, limit: 20, count: 1 },
    });

    const req = new NextRequest(
      "http://localhost/api/reviews?sortBy=rating&minRating=4&maxRating=5",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it("should include stats when filtering by product", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    mockExecuteCursorPaginatedQuery.mockResolvedValue({
      success: true,
      data: [
        { id: "rev1", product_id: "prod1", rating: 5, status: "published" },
      ],
      count: 1,
      pagination: { nextCursor: null, hasNextPage: false, limit: 20, count: 1 },
    });

    // Mock stats query that's called after pagination
    mockDb.get.mockResolvedValue({
      docs: [
        { data: () => ({ rating: 5, status: "published" }) },
        { data: () => ({ rating: 4, status: "published" }) },
        { data: () => ({ rating: 5, status: "published" }) },
      ],
    });

    const req = new NextRequest(
      "http://localhost/api/reviews?product_id=prod1",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats).toBeDefined();
    expect(data.stats.totalReviews).toBe(3);
    expect(data.stats.averageRating).toBeCloseTo(4.7);
    expect(data.stats.ratingDistribution).toEqual({
      5: 2,
      4: 1,
      3: 0,
      2: 0,
      1: 0,
    });
  });

  it("should handle database errors", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    mockExecuteCursorPaginatedQuery.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/reviews");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch reviews");
  });
});

describe("POST /api/reviews", () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnThis(),
      add: jest.fn(),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb as any);
  });

  it("should require authentication", async () => {
    const errorResponse = NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: errorResponse,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        product_id: "prod1",
        rating: 5,
        comment: "Great!",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should create review with valid data", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValueOnce({ empty: true }); // No existing review
    mockDb.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ shop_id: "shop1" }),
    }); // Product exists

    mockDb.add.mockResolvedValue({ id: "rev1" });

    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        product_id: "prod1",
        rating: 5,
        title: "Excellent",
        comment: "Great product!",
        images: ["img1.jpg"],
        order_id: "order1",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.review.id).toBe("rev1");
    expect(data.review.rating).toBe(5);
    expect(data.review.verified_purchase).toBe(true);
    expect(mockDb.add).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user1",
        product_id: "prod1",
        shop_id: "shop1",
        rating: 5,
        title: "Excellent",
        comment: "Great product!",
        status: "published",
      }),
    );
  });

  it("should reject missing required fields", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({ product_id: "prod1" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing required fields");
  });

  it("should reject invalid rating range", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);

    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({ product_id: "prod1", rating: 6, comment: "Test" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Rating must be between 1 and 5");
  });

  it("should prevent duplicate reviews", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: "existing_rev" }],
    });

    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({ product_id: "prod1", rating: 5, comment: "Test" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("You have already reviewed this product");
  });

  it("should reject if product not found", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);

    mockDb.get.mockResolvedValueOnce({ empty: true }); // No existing review
    mockDb.get.mockResolvedValueOnce({ exists: false }); // Product not found

    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({ product_id: "prod1", rating: 5, comment: "Test" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Product not found");
  });

  it("should handle database errors", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user1@test.com", role: "user" as const },
      error: null,
    } as any);
    mockDb.get.mockRejectedValue(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/reviews", {
      method: "POST",
      body: JSON.stringify({ product_id: "prod1", rating: 5, comment: "Test" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to create review");
  });
});
