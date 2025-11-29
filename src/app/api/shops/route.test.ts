/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";
import { Collections } from "@/app/api/lib/firebase/collections";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { withCache } from "@/app/api/middleware/cache";

jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/middleware/cache");

const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockWithCache = withCache as jest.MockedFunction<typeof withCache>;

describe("GET /api/shops", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock withCache to just execute the handler
    mockWithCache.mockImplementation(async (req, handler) => {
      return handler(req);
    });
  });

  it("should return verified shops for public users", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockShops = [
      {
        id: "shop1",
        data: () => ({
          name: "Shop 1",
          slug: "shop-1",
          owner_id: "user1",
          is_verified: true,
          is_banned: false,
          created_at: new Date(),
        }),
      },
      {
        id: "shop2",
        data: () => ({
          name: "Shop 2",
          slug: "shop-2",
          owner_id: "user2",
          is_verified: true,
          is_banned: false,
          created_at: new Date(),
        }),
      },
    ];

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: mockShops,
      }),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(mockQuery.where).toHaveBeenCalledWith("is_banned", "==", false);
    expect(mockQuery.where).toHaveBeenCalledWith("is_verified", "==", true);
  });

  it("should return own shops for sellers", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "seller1",
      email: "seller@test.com",
      role: "seller",
    } as any);

    const mockShops = [
      {
        id: "shop1",
        data: () => ({
          name: "My Shop",
          slug: "my-shop",
          owner_id: "seller1",
          is_verified: true,
          created_at: new Date(),
        }),
      },
    ];

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: mockShops,
        size: 1,
      }),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockQuery.where).toHaveBeenCalledWith("owner_id", "==", "seller1");
  });

  it("should return all shops for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "admin1",
      email: "admin@test.com",
      role: "admin",
    } as any);

    const mockShops = [
      {
        id: "shop1",
        data: () => ({
          name: "Shop 1",
          slug: "shop-1",
          is_verified: true,
          is_banned: false,
        }),
      },
      {
        id: "shop2",
        data: () => ({
          name: "Banned Shop",
          slug: "banned-shop",
          is_verified: true,
          is_banned: true,
        }),
      },
    ];

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: mockShops,
      }),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    // Admin should see all shops including banned ones
  });

  it("should filter featured shops", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [],
      }),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops?featured=true");
    await GET(req);

    expect(mockQuery.where).toHaveBeenCalledWith("is_featured", "==", true);
  });

  it("should apply sorting", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [],
      }),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest(
      "http://localhost/api/shops?sortBy=rating&sortOrder=desc",
    );
    await GET(req);

    expect(mockQuery.orderBy).toHaveBeenCalledWith("rating", "desc");
  });

  it("should handle pagination", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockShops = Array.from({ length: 21 }, (_, i) => ({
      id: `shop${i}`,
      data: () => ({
        name: `Shop ${i}`,
        slug: `shop-${i}`,
        is_verified: true,
        is_banned: false,
      }),
    }));

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: mockShops,
      }),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops?limit=20");
    const response = await GET(req);
    const data = await response.json();

    expect(data.pagination.hasNextPage).toBe(true);
    expect(data.pagination.nextCursor).toBeDefined();
  });

  it("should check if seller can create more shops", async () => {
    mockGetUserFromRequest.mockResolvedValue({
      uid: "seller1",
      email: "seller@test.com",
      role: "seller",
    } as any);

    const mockGet = jest.fn();
    mockGet
      .mockResolvedValueOnce({ empty: true, docs: [] }) // Main query
      .mockResolvedValueOnce({ size: 0 }); // User shops count

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: mockGet,
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops");
    const response = await GET(req);
    const data = await response.json();

    expect(data.canCreateMore).toBe(true);
  });

  it("should handle empty results", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: true,
        docs: [],
      }),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it("should handle database errors", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockRejectedValue(new Error("Database error")),
    };

    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Database error");
  });
});

describe("POST /api/shops", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      ),
    } as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Shop",
        slug: "test-shop",
        description: "A test shop",
      }),
    });
    const response = await POST(req);

    expect(response.status).toBe(401);
  });

  it("should only allow sellers and admins", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "user1", email: "user@test.com", role: "user" },
    } as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Shop",
        slug: "test-shop",
        description: "A test shop",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("sellers and admins");
  });

  it("should require name, slug, and description", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 0 }),
    };
    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({ name: "Test Shop" }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("name, slug, description");
  });

  it("should enforce one shop limit for sellers", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ size: 1 }), // Already has 1 shop
    };
    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({
        name: "Second Shop",
        slug: "second-shop",
        description: "Another shop",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("only create 1 shop");
  });

  it("should reject duplicate slug", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest
        .fn()
        .mockResolvedValueOnce({ size: 0 }) // User shops check
        .mockResolvedValueOnce({ empty: false }), // Slug check - exists
    };
    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Shop",
        slug: "existing-slug",
        description: "A test shop",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("slug already exists");
  });

  it("should create shop successfully for seller", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const mockAdd = jest.fn().mockResolvedValue({ id: "newshop1" });
    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest
        .fn()
        .mockResolvedValueOnce({ size: 0 }) // User shops check
        .mockResolvedValueOnce({ empty: true }), // Slug check - unique
      add: mockAdd,
    };
    mockCollections.shops.mockReturnValue(mockQuery as any);

    const shopData = {
      name: "New Shop",
      slug: "new-shop",
      description: "A brand new shop",
      location: "New York",
      phone: "+1234567890",
      email: "shop@test.com",
    };

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify(shopData),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.shop.id).toBe("newshop1");
    expect(data.shop.name).toBe("New Shop");
    expect(data.shop.owner_id).toBe("seller1");
    expect(data.shop.is_verified).toBe(false);
    expect(data.shop.is_featured).toBe(false);
  });

  it("should allow admin to create unlimited shops", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "admin1", email: "admin@test.com", role: "admin" },
    } as any);

    const mockAdd = jest.fn().mockResolvedValue({ id: "adminshop1" });
    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }), // Slug check only
      add: mockAdd,
    };
    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({
        name: "Admin Shop",
        slug: "admin-shop",
        description: "Created by admin",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should set default values for optional fields", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    let capturedData: any;
    const mockAdd = jest.fn().mockImplementation((data) => {
      capturedData = data;
      return Promise.resolve({ id: "newshop1" });
    });
    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest
        .fn()
        .mockResolvedValueOnce({ size: 0 })
        .mockResolvedValueOnce({ empty: true }),
      add: mockAdd,
    };
    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({
        name: "Minimal Shop",
        slug: "minimal-shop",
        description: "Just the basics",
      }),
    });
    await POST(req);

    expect(capturedData.logo).toBeNull();
    expect(capturedData.banner).toBeNull();
    expect(capturedData.rating).toBe(0);
    expect(capturedData.review_count).toBe(0);
    expect(capturedData.product_count).toBe(0);
    expect(capturedData.is_banned).toBe(false);
  });

  it("should handle database errors", async () => {
    mockRequireAuth.mockResolvedValue({
      user: { uid: "seller1", email: "seller@test.com", role: "seller" },
    } as any);

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest
        .fn()
        .mockResolvedValueOnce({ size: 0 })
        .mockResolvedValueOnce({ empty: true }),
      add: jest.fn().mockRejectedValue(new Error("Database error")),
    };
    mockCollections.shops.mockReturnValue(mockQuery as any);

    const req = new NextRequest("http://localhost/api/shops", {
      method: "POST",
      body: JSON.stringify({
        name: "Error Shop",
        slug: "error-shop",
        description: "This will fail",
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
