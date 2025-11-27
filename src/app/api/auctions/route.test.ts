/**
 * @jest-environment node
 */

// Mock dependencies BEFORE importing the route
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("@/app/api/lib/utils/pagination");

import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

describe("GET /api/auctions", () => {
  const mockAuctions = [
    {
      id: "auction1",
      shop_id: "shop123",
      name: "Vintage Watch",
      slug: "vintage-watch",
      starting_bid: 1000,
      current_bid: 1500,
      bid_count: 5,
      status: "active",
      category_id: "cat1",
      is_featured: true,
      end_time: "2025-12-31T23:59:59Z",
      created_at: "2025-01-01T10:00:00Z",
    },
    {
      id: "auction2",
      shop_id: "shop123",
      name: "Antique Vase",
      slug: "antique-vase",
      starting_bid: 500,
      current_bid: 500,
      bid_count: 0,
      status: "active",
      category_id: "cat2",
      is_featured: false,
      end_time: "2025-12-25T23:59:59Z",
      created_at: "2025-01-02T10:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication & Authorization", () => {
    it("should allow guests to view active auctions", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuctions.filter((a) => a.status === "active"),
        pagination: { hasNextPage: false, nextCursor: null, count: 2 },
      });

      const req = new NextRequest("http://localhost/api/auctions");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "active");
    });

    it("should require seller to provide shop_id", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        uid: "seller1",
        role: "seller",
      });

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      const req = new NextRequest("http://localhost/api/auctions");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
      expect(json.count).toBe(0);
    });

    it("should allow admin to view all auctions", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue({
        uid: "admin1",
        role: "admin",
      });

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuctions,
        pagination: { hasNextPage: false, nextCursor: null, count: 2 },
      });

      const req = new NextRequest("http://localhost/api/auctions");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.length).toBe(2);
    });
  });

  describe("Filtering", () => {
    it("should filter by shop_id", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuctions,
        pagination: { hasNextPage: false, nextCursor: null, count: 2 },
      });

      const req = new NextRequest(
        "http://localhost/api/auctions?shop_id=shop123"
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "active");
      expect(mockQuery.where).toHaveBeenCalledWith("shop_id", "==", "shop123");
    });

    it("should filter by category_id", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockAuctions[0]],
        pagination: { hasNextPage: false, nextCursor: null, count: 1 },
      });

      const req = new NextRequest(
        "http://localhost/api/auctions?categoryId=cat1"
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("category_id", "==", "cat1");
    });

    it("should filter by featured", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockAuctions[0]],
        pagination: { hasNextPage: false, nextCursor: null, count: 1 },
      });

      const req = new NextRequest(
        "http://localhost/api/auctions?featured=true"
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("is_featured", "==", true);
    });

    it("should filter by price range when sorting by current_bid", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuctions,
        pagination: { hasNextPage: false, nextCursor: null, count: 2 },
      });

      const req = new NextRequest(
        "http://localhost/api/auctions?sortBy=current_bid&minBid=1000&maxBid=2000"
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockQuery.where).toHaveBeenCalledWith("current_bid", ">=", 1000);
      expect(mockQuery.where).toHaveBeenCalledWith("current_bid", "<=", 2000);
    });
  });

  describe("Sorting", () => {
    it("should sort by created_at desc by default", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuctions,
        pagination: { hasNextPage: false, nextCursor: null, count: 2 },
      });

      const req = new NextRequest("http://localhost/api/auctions");
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockQuery.orderBy).toHaveBeenCalledWith("created_at", "desc");
    });

    it("should sort by end_time asc", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuctions,
        pagination: { hasNextPage: false, nextCursor: null, count: 2 },
      });

      const req = new NextRequest(
        "http://localhost/api/auctions?sortBy=end_time&sortOrder=asc"
      );
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockQuery.orderBy).toHaveBeenCalledWith("end_time", "asc");
    });

    it("should sort by current_bid", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);

      (executeCursorPaginatedQuery as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAuctions,
        pagination: { hasNextPage: false, nextCursor: null, count: 2 },
      });

      const req = new NextRequest(
        "http://localhost/api/auctions?sortBy=current_bid&sortOrder=desc"
      );
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(mockQuery.orderBy).toHaveBeenCalledWith("current_bid", "desc");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
      (Collections.auctions as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = new NextRequest("http://localhost/api/auctions");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Failed to list auctions");
    });
  });
});

describe("POST /api/auctions", () => {
  const mockSeller = {
    uid: "seller123",
    email: "seller@test.com",
    role: "seller",
  };

  const mockAdmin = {
    uid: "admin123",
    email: "admin@test.com",
    role: "admin",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication & Authorization", () => {
    it("should require authentication", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: null,
        error: new Response(
          JSON.stringify({ success: false, error: "Unauthorized" }),
          { status: 401 }
        ),
      });

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
    });

    it("should require seller or admin role", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: { uid: "user1", role: "user" },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Only sellers and admins can create auctions");
    });

    it("should allow seller to create auction for own shop", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockSeller,
        error: null,
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(true);

      const mockCountQuery = {
        get: jest.fn().mockResolvedValue({
          data: () => ({ count: 2 }),
        }),
      };
      const mockActiveQuery = {
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnValue(mockCountQuery),
      };
      const mockSlugQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true }),
      };
      const mockAddDoc = {
        id: "auction123",
        get: jest.fn().mockResolvedValue({
          id: "auction123",
          data: () => ({
            shop_id: "shop123",
            name: "Test Auction",
            slug: "test-auction",
            starting_bid: 1000,
            current_bid: 1000,
            status: "active",
          }),
        }),
      };

      (Collections.auctions as jest.Mock)
        .mockReturnValueOnce(mockActiveQuery)
        .mockReturnValueOnce(mockSlugQuery)
        .mockReturnValueOnce({ add: jest.fn().mockResolvedValue(mockAddDoc) });

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          shop_id: "shop123",
          name: "Test Auction",
          slug: "test-auction",
          starting_bid: 1000,
          end_time: "2025-12-31T23:59:59Z",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("auction123");
    });

    it("should prevent seller from creating auction for other shop", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockSeller,
        error: null,
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(false);

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          shop_id: "other-shop",
          name: "Test Auction",
          slug: "test-auction",
          starting_bid: 1000,
          end_time: "2025-12-31T23:59:59Z",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Cannot create auction for this shop");
    });

    it("should allow admin to create auction for any shop", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockAdmin,
        error: null,
      });

      const mockSlugQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true }),
      };
      const mockAddDoc = {
        id: "auction123",
        get: jest.fn().mockResolvedValue({
          id: "auction123",
          data: () => ({
            shop_id: "any-shop",
            name: "Test Auction",
            slug: "test-auction",
            starting_bid: 1000,
            current_bid: 1000,
            status: "active",
          }),
        }),
      };

      (Collections.auctions as jest.Mock)
        .mockReturnValueOnce(mockSlugQuery)
        .mockReturnValueOnce({ add: jest.fn().mockResolvedValue(mockAddDoc) });

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          shop_id: "any-shop",
          name: "Test Auction",
          slug: "test-auction",
          starting_bid: 1000,
          end_time: "2025-12-31T23:59:59Z",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
    });
  });

  describe("Validation", () => {
    it("should require all mandatory fields", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockSeller,
        error: null,
      });

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Auction",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Missing required fields");
    });

    it("should reject duplicate slug", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockAdmin,
        error: null,
      });

      const mockSlugQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: false }),
      };

      (Collections.auctions as jest.Mock).mockReturnValue(mockSlugQuery);

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          shop_id: "shop123",
          name: "Test Auction",
          slug: "existing-slug",
          starting_bid: 1000,
          end_time: "2025-12-31T23:59:59Z",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Auction slug already exists");
    });

    it("should enforce active auction limit per shop for seller", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockSeller,
        error: null,
      });
      (userOwnsShop as jest.Mock).mockResolvedValue(true);

      const mockCountQuery = {
        get: jest.fn().mockResolvedValue({
          data: () => ({ count: 5 }), // At limit
        }),
      };
      const mockActiveQuery = {
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnValue(mockCountQuery),
      };

      (Collections.auctions as jest.Mock).mockReturnValue(mockActiveQuery);

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          shop_id: "shop123",
          name: "Test Auction",
          slug: "test-auction",
          starting_bid: 1000,
          end_time: "2025-12-31T23:59:59Z",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Active auction limit reached for this shop");
    });
  });

  describe("Success Cases", () => {
    it("should create auction with default values", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockAdmin,
        error: null,
      });

      const mockSlugQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true }),
      };
      const mockAddDoc = {
        id: "auction123",
        get: jest.fn().mockResolvedValue({
          id: "auction123",
          data: () => ({
            shop_id: "shop123",
            name: "Test Auction",
            slug: "test-auction",
            description: "",
            starting_bid: 1000,
            current_bid: 1000,
            bid_count: 0,
            status: "active",
          }),
        }),
      };

      (Collections.auctions as jest.Mock)
        .mockReturnValueOnce(mockSlugQuery)
        .mockReturnValueOnce({ add: jest.fn().mockResolvedValue(mockAddDoc) });

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          shop_id: "shop123",
          name: "Test Auction",
          slug: "test-auction",
          starting_bid: 1000,
          end_time: "2025-12-31T23:59:59Z",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.current_bid).toBe(1000);
      expect(json.data.bid_count).toBe(0);
      expect(json.data.status).toBe("active");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockAdmin,
        error: null,
      });

      (Collections.auctions as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = new NextRequest("http://localhost/api/auctions", {
        method: "POST",
        body: JSON.stringify({
          shop_id: "shop123",
          name: "Test Auction",
          slug: "test-auction",
          starting_bid: 1000,
          end_time: "2025-12-31T23:59:59Z",
        }),
      });
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Failed to create auction");
    });
  });
});
