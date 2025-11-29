/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/cache", () => ({
  withCache: jest.fn((req, handler) => handler(req)),
}));

const mockCollections = Collections as jest.Mocked<typeof Collections>;

describe("GET /api/reviews/summary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate review statistics", async () => {
    const mockGet = jest.fn().mockResolvedValue({
      docs: [
        { data: () => ({ rating: 5 }) },
        { data: () => ({ rating: 5 }) },
        { data: () => ({ rating: 4 }) },
        { data: () => ({ rating: 3 }) },
        { data: () => ({ rating: 1 }) },
      ],
    });

    const mockWhere = jest.fn().mockReturnThis();
    mockCollections.reviews.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    mockWhere.mockReturnThis();

    const req = new NextRequest(
      "http://localhost/api/reviews/summary?productId=prod1",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.totalReviews).toBe(5);
    expect(data.averageRating).toBe(3.6);
    expect(data.ratingDistribution).toEqual([
      { rating: 5, count: 2 },
      { rating: 4, count: 1 },
      { rating: 3, count: 1 },
      { rating: 2, count: 0 },
      { rating: 1, count: 1 },
    ]);
  });

  it("should handle products with no reviews", async () => {
    const mockGet = jest.fn().mockResolvedValue({ docs: [] });
    const mockWhere = jest.fn().mockReturnThis();

    mockCollections.reviews.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/reviews/summary?productId=prod1",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalReviews).toBe(0);
    expect(data.averageRating).toBe(0);
    expect(data.ratingDistribution).toEqual([
      { rating: 5, count: 0 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ]);
  });

  it("should require productId parameter", async () => {
    const req = new NextRequest("http://localhost/api/reviews/summary");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Product ID is required");
  });

  it("should only count approved reviews", async () => {
    const mockGet = jest.fn().mockResolvedValue({
      docs: [{ data: () => ({ rating: 5 }) }, { data: () => ({ rating: 4 }) }],
    });

    const mockWhere = jest.fn().mockReturnThis();
    mockCollections.reviews.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/reviews/summary?productId=prod1",
    );
    await GET(req);

    expect(mockWhere).toHaveBeenCalledWith("product_id", "==", "prod1");
    expect(mockWhere).toHaveBeenCalledWith("is_approved", "==", true);
  });

  it("should handle all 5-star reviews", async () => {
    const mockGet = jest.fn().mockResolvedValue({
      docs: [
        { data: () => ({ rating: 5 }) },
        { data: () => ({ rating: 5 }) },
        { data: () => ({ rating: 5 }) },
      ],
    });

    const mockWhere = jest.fn().mockReturnThis();
    mockCollections.reviews.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/reviews/summary?productId=prod1",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(data.averageRating).toBe(5);
    expect(data.ratingDistribution).toEqual([
      { rating: 5, count: 3 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ]);
  });

  it("should handle database errors", async () => {
    const mockWhere = jest.fn().mockReturnThis();
    const mockGet = jest.fn().mockRejectedValue(new Error("DB error"));

    mockCollections.reviews.mockReturnValue({
      where: mockWhere,
      get: mockGet,
    } as any);

    const req = new NextRequest(
      "http://localhost/api/reviews/summary?productId=prod1",
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch review summary");
  });
});
