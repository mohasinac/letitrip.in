/**
 * @jest-environment node
 */
import { GET } from "./route";
import { NextRequest } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// Mock Firebase config BEFORE imports
jest.mock("../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
  getFirestoreAdmin: jest.fn(),
}));

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/utils/rate-limiter", () => ({
  apiRateLimiter: {
    check: jest.fn(() => true),
  },
}));

describe("GET /api/search", () => {
  const mockGet = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockLimit.mockReturnThis();
    mockOrderBy.mockReturnThis();
    mockWhere.mockReturnThis();
    mockGet.mockResolvedValue({ docs: [], empty: true });

    (Collections.products as jest.Mock).mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });

    (Collections.auctions as jest.Mock).mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    });

    (Collections.shops as jest.Mock).mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    });

    (Collections.categories as jest.Mock).mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    });
  });

  describe("Basic Search", () => {
    it("should search products by default", async () => {
      mockGet.mockResolvedValue({
        docs: [
          {
            id: "prod1",
            data: () => ({ name: "Product 1", price: 100, stock: 10 }),
          },
        ],
      });

      const req = new NextRequest("http://localhost/api/search?q=product");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.type).toBe("products");
      expect(data.data).toHaveLength(1);
      expect(mockWhere).toHaveBeenCalledWith("is_deleted", "==", false);
      expect(mockWhere).toHaveBeenCalledWith("status", "==", "published");
    });

    it("should search auctions when type=auctions", async () => {
      mockGet.mockResolvedValue({
        docs: [
          {
            id: "auction1",
            data: () => ({ title: "Auction 1", current_bid: 500 }),
          },
        ],
      });

      const req = new NextRequest(
        "http://localhost/api/search?q=auction&type=auctions",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.type).toBe("auctions");
      expect(mockWhere).toHaveBeenCalledWith("status", "in", [
        "active",
        "live",
      ]);
    });

    it("should handle empty query", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest("http://localhost/api/search");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });
  });

  describe("Filtering", () => {
    it("should filter by shop_slug (products)", async () => {
      mockGet
        .mockResolvedValueOnce({
          docs: [{ id: "shop1", data: () => ({ slug: "test-shop" }) }],
          empty: false,
        })
        .mockResolvedValueOnce({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/search?shop_slug=test-shop",
      );
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith("shop_id", "==", "shop1");
    });

    it("should return 404 for invalid shop_slug", async () => {
      mockGet.mockResolvedValue({ docs: [], empty: true });

      const req = new NextRequest(
        "http://localhost/api/search?shop_slug=invalid",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Shop not found");
    });

    it("should filter by category_slug", async () => {
      mockGet
        .mockResolvedValueOnce({
          docs: [{ id: "cat1", data: () => ({ slug: "electronics" }) }],
          empty: false,
        })
        .mockResolvedValueOnce({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/search?category_slug=electronics",
      );
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith("category_id", "==", "cat1");
    });

    it("should return 404 for invalid category_slug", async () => {
      mockGet.mockResolvedValue({ docs: [], empty: true });

      const req = new NextRequest(
        "http://localhost/api/search?category_slug=invalid",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Category not found");
    });

    it("should filter by price range (products)", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/search?min_price=100&max_price=500",
      );
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith("price", ">=", 100);
      expect(mockWhere).toHaveBeenCalledWith("price", "<=", 500);
    });

    it("should filter by in_stock", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest("http://localhost/api/search?in_stock=true");
      await GET(req);

      expect(mockWhere).toHaveBeenCalledWith("stock", ">", 0);
    });
  });

  describe("Sorting", () => {
    it("should sort products by latest (default)", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest("http://localhost/api/search");
      await GET(req);

      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
    });

    it("should sort products by price ascending", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest("http://localhost/api/search?sort=price-asc");
      await GET(req);

      expect(mockOrderBy).toHaveBeenCalledWith("price", "asc");
    });

    it("should sort products by price descending", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/search?sort=price-desc",
      );
      await GET(req);

      expect(mockOrderBy).toHaveBeenCalledWith("price", "desc");
    });

    it("should sort auctions by ending soon (default)", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest("http://localhost/api/search?type=auctions");
      await GET(req);

      expect(mockOrderBy).toHaveBeenCalledWith("end_time", "asc");
    });
  });

  describe("Pagination", () => {
    it("should paginate results", async () => {
      const mockItems = Array.from({ length: 30 }, (_, i) => ({
        id: `prod${i}`,
        data: () => ({ name: `Product ${i}`, price: 100 + i }),
      }));

      mockGet.mockResolvedValue({ docs: mockItems });

      const req = new NextRequest(
        "http://localhost/api/search?page=2&limit=10",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.data).toHaveLength(10);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(10);
      expect(data.pagination.total).toBe(30);
      expect(data.pagination.hasMore).toBe(true);
    });

    it("should limit results to max 100", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest("http://localhost/api/search?limit=200");
      await GET(req);

      expect(mockLimit).toHaveBeenCalledWith(100); // Capped at 100
    });

    it("should handle last page correctly", async () => {
      const mockItems = Array.from({ length: 25 }, (_, i) => ({
        id: `prod${i}`,
        data: () => ({ name: `Product ${i}` }),
      }));

      mockGet.mockResolvedValue({ docs: mockItems });

      const req = new NextRequest(
        "http://localhost/api/search?page=3&limit=10",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.data).toHaveLength(5);
      expect(data.pagination.hasMore).toBe(false);
    });
  });

  describe("Relevance Scoring", () => {
    it("should score results by relevance when sort=relevance", async () => {
      const mockItems = [
        {
          id: "prod1",
          data: () => ({
            name: "laptop computer",
            description: "gaming laptop",
            tags: ["electronics"],
            is_featured: true,
          }),
        },
        {
          id: "prod2",
          data: () => ({
            name: "computer mouse",
            description: "wireless mouse",
            tags: [],
            is_featured: false,
          }),
        },
      ];

      mockGet.mockResolvedValue({ docs: mockItems });

      const req = new NextRequest(
        "http://localhost/api/search?q=laptop&sort=relevance",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data[0].id).toBe("prod1"); // "laptop" in name scores higher
    });

    it("should filter out zero-score items", async () => {
      const mockItems = [
        {
          id: "prod1",
          data: () => ({ name: "irrelevant", description: "nothing here" }),
        },
        {
          id: "prod2",
          data: () => ({ name: "laptop", description: "gaming laptop" }),
        },
      ];

      mockGet.mockResolvedValue({ docs: mockItems });

      const req = new NextRequest(
        "http://localhost/api/search?q=laptop&sort=relevance",
      );
      const response = await GET(req);
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(data.data[0].id).toBe("prod2");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest("http://localhost/api/search");
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Search failed");
    });

    it("should handle invalid numeric params gracefully", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const req = new NextRequest(
        "http://localhost/api/search?page=invalid&limit=abc",
      );
      const response = await GET(req);

      expect(response.status).toBe(200); // Falls back to defaults
      expect(mockLimit).toHaveBeenCalled();
    });
  });
});
