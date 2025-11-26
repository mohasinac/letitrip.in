/**
 * @jest-environment node
 */
/**
 * Tests for Shop Detail API Routes
 * GET /api/shops/[slug] - Get shop by slug with RBAC
 * PATCH /api/shops/[slug] - Update shop
 * DELETE /api/shops/[slug] - Delete shop
 */

// Set up environment BEFORE any imports
process.env.FIREBASE_PROJECT_ID = "test-project";

// Mock dependencies BEFORE imports
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/collections");

import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";
import { getUserFromRequest, requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";

const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<typeof getUserFromRequest>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCollections = Collections as jest.Mocked<typeof Collections>;

describe("GET /api/shops/[slug] - Get Shop with RBAC", () => {
  let mockShopsCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockShopsCollection = {
      where: jest.fn(),
      doc: jest.fn(),
    };

    mockCollections.shops.mockReturnValue(mockShopsCollection as any);
  });

  const verifiedShop = {
    id: "shop123",
    slug: "test-shop",
    name: "Test Shop",
    owner_id: "seller123",
    is_verified: true,
    is_banned: false,
    is_featured: true,
    show_on_homepage: true,
    total_products: 50,
    review_count: 100,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  it("should return verified shop for guest user", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => verifiedShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.shop.id).toBe("shop123");
    expect(data.shop.name).toBe("Test Shop");
  });

  it("should hide unverified shop from guest user", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const unverifiedShop = { ...verifiedShop, is_verified: false };

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => unverifiedShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Shop not found");
  });

  it("should hide banned shop from guest user", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const bannedShop = { ...verifiedShop, is_banned: true };

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => bannedShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it("should show own unverified shop to seller owner", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const unverifiedShop = { ...verifiedShop, is_verified: false };

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => unverifiedShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.shop.id).toBe("shop123");
  });

  it("should hide other seller's unverified shop", async () => {
    const mockUser = {
      uid: "other-seller",
      email: "other@test.com",
      name: "Other Seller",
      role: "seller" as const,
    };

    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const unverifiedShop = { ...verifiedShop, is_verified: false };

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => unverifiedShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it("should show all shops to admin including unverified/banned", async () => {
    const mockUser = {
      uid: "admin123",
      email: "admin@test.com",
      name: "Admin User",
      role: "admin" as const,
    };

    mockGetUserFromRequest.mockResolvedValue(mockUser);

    const problematicShop = {
      ...verifiedShop,
      is_verified: false,
      is_banned: true,
    };

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => problematicShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.shop.is_verified).toBe(false);
    expect(data.shop.is_banned).toBe(true);
  });

  it("should return 404 for non-existent shop", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/non-existent");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "non-existent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Shop not found");
  });

  it("should handle database errors gracefully", async () => {
    mockGetUserFromRequest.mockResolvedValue(null);

    mockShopsCollection.where.mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop");

    const response = await GET(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Internal server error");
  });
});

describe("PATCH /api/shops/[slug] - Update Shop", () => {
  let mockShopsCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockShopsCollection = {
      where: jest.fn(),
      doc: jest.fn(),
    };

    mockCollections.shops.mockReturnValue(mockShopsCollection as any);
  });

  const existingShop = {
    id: "shop123",
    slug: "test-shop",
    name: "Test Shop",
    owner_id: "seller123",
    is_verified: false,
    is_banned: false,
    created_at: "2024-01-01T00:00:00Z",
  };

  it("should allow owner to update their shop", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: "shop123",
        data: () => ({
          ...existingShop,
          name: "Updated Shop Name",
        }),
      }),
    };
    mockShopsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Shop Name" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.shop.name).toBe("Updated Shop Name");
    expect(mockDocRef.update).toHaveBeenCalled();
  });

  it("should reject update from non-owner seller", async () => {
    const mockUser = {
      uid: "other-seller",
      email: "other@test.com",
      name: "Other Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "PATCH",
      body: JSON.stringify({ name: "Hacked Name" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Access denied");
  });

  it("should allow admin to update any shop", async () => {
    const mockUser = {
      uid: "admin123",
      email: "admin@test.com",
      name: "Admin User",
      role: "admin" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: "shop123",
        data: () => ({
          ...existingShop,
          is_verified: true,
        }),
      }),
    };
    mockShopsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "PATCH",
      body: JSON.stringify({ is_verified: true }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should prevent seller from updating verification flags", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    let savedUpdates: any;
    const mockDocRef = {
      update: jest.fn().mockImplementation(async (data: any) => {
        savedUpdates = data;
      }),
      get: jest.fn().mockResolvedValue({
        id: "shop123",
        data: () => existingShop,
      }),
    };
    mockShopsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Updated Name",
        is_verified: true,
        is_featured: true,
      }),
    });

    await PATCH(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });

    // Seller updates should not include admin-only fields
    expect(savedUpdates.is_verified).toBeUndefined();
    expect(savedUpdates.is_featured).toBeUndefined();
    expect(savedUpdates.name).toBe("Updated Name");
  });

  it("should reject duplicate slug", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    let callCount = 0;
    mockShopsCollection.where.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: find shop
        return {
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [
              {
                id: "shop123",
                data: () => existingShop,
              },
            ],
          }),
        };
      } else {
        // Second call: check slug uniqueness
        return {
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false, // Slug exists
          }),
        };
      }
    });

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "PATCH",
      body: JSON.stringify({ slug: "existing-slug" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Slug already in use");
  });

  it("should return 404 for non-existent shop", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockShopsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/non-existent", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "non-existent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Shop not found");
  });
});

describe("DELETE /api/shops/[slug] - Delete Shop", () => {
  let mockShopsCollection: any;
  let mockProductsCollection: any;
  let mockOrdersCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockShopsCollection = {
      where: jest.fn(),
      doc: jest.fn(),
    };

    mockProductsCollection = {
      where: jest.fn(),
    };

    mockOrdersCollection = {
      where: jest.fn(),
    };

    mockCollections.shops.mockReturnValue(mockShopsCollection as any);
    mockCollections.products.mockReturnValue(mockProductsCollection as any);
    mockCollections.orders.mockReturnValue(mockOrdersCollection as any);
  });

  const existingShop = {
    id: "shop123",
    slug: "test-shop",
    name: "Test Shop",
    owner_id: "seller123",
  };

  it("should allow owner to delete empty shop", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockShopQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockShopQuery);

    // No active products (chained where calls)
    const mockProductQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockProductQuery);

    // No pending orders (chained where calls)
    const mockOrderQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockOrdersCollection.where.mockReturnValue(mockOrderQuery);

    const mockDocRef = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    mockShopsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Shop deleted successfully");
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  it("should prevent deletion if active products exist", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockShopQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockShopQuery);

    // Has active products (chained where calls)
    const mockProductQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ id: "prod1" }],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockProductQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Cannot delete shop with active products");
  });

  it("should prevent deletion if pending orders exist", async () => {
    const mockUser = {
      uid: "seller123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockShopQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockShopQuery);

    // No active products (chained where calls)
    const mockProductQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockProductQuery);

    // Has pending orders (chained where calls)
    const mockOrderQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ id: "order1" }],
      }),
    };
    mockOrdersCollection.where.mockReturnValue(mockOrderQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Cannot delete shop with pending orders");
  });

  it("should reject deletion from non-owner", async () => {
    const mockUser = {
      uid: "other-seller",
      email: "other@test.com",
      name: "Other Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockShopQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockShopQuery);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Access denied");
  });

  it("should allow admin to delete any shop", async () => {
    const mockUser = {
      uid: "admin123",
      email: "admin@test.com",
      name: "Admin User",
      role: "admin" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const mockShopQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => existingShop,
          },
        ],
      }),
    };
    mockShopsCollection.where.mockReturnValue(mockShopQuery);

    const mockProductQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockProductQuery);

    const mockOrderQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockOrdersCollection.where.mockReturnValue(mockOrderQuery);

    const mockDocRef = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    mockShopsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest("http://localhost:3000/api/shops/test-shop", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ slug: "test-shop" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
