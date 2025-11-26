/**
 * @jest-environment node
 */
/**
 * Tests for Product Detail API Routes
 * GET /api/products/[slug] - Get product by slug
 * PATCH /api/products/[slug] - Update product
 * DELETE /api/products/[slug] - Delete product
 */

// Set up environment BEFORE any imports
process.env.FIREBASE_PROJECT_ID = "test-project";

// Mock dependencies BEFORE imports
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("@/lib/category-hierarchy");

import { NextRequest } from "next/server";
import { PATCH } from "./route";
import { getUserFromRequest, requireAuth } from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { updateCategoryProductCounts } from "@/lib/category-hierarchy";

const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<typeof getUserFromRequest>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockUserOwnsShop = userOwnsShop as jest.MockedFunction<typeof userOwnsShop>;
const mockUpdateCategoryProductCounts = updateCategoryProductCounts as jest.MockedFunction<typeof updateCategoryProductCounts>;

describe("PATCH /api/products/[slug] - Update Product", () => {
  let mockProductsCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProductsCollection = {
      where: jest.fn(),
      doc: jest.fn(),
    };

    mockCollections.products.mockReturnValue(mockProductsCollection as any);
    mockUpdateCategoryProductCounts.mockResolvedValue(undefined);
  });

  const existingProduct = {
    id: "prod123",
    shop_id: "shop123",
    seller_id: "seller123",
    name: "Original Product",
    slug: "original-product",
    description: "Original description",
    price: 99.99,
    category_id: "cat123",
    images: ["https://example.com/original.jpg"],
    status: "draft",
    stock_quantity: 10,
    is_featured: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  it("should update product successfully as owner", async () => {
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

    mockUserOwnsShop.mockResolvedValue(true);

    // Mock finding existing product
    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    // Mock update and refetch
    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: "prod123",
        data: () => ({
          ...existingProduct,
          name: "Updated Product",
          price: 149.99,
          updated_at: expect.any(String),
        }),
      }),
    };
    mockProductsCollection.doc.mockReturnValue(mockDocRef);

    const updateData = {
      name: "Updated Product",
      price: 149.99,
    };

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Updated Product");
    expect(data.data.price).toBe(149.99);
    expect(mockDocRef.update).toHaveBeenCalled();
  });

  it("should allow admin to update any product", async () => {
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

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: "prod123",
        data: () => ({
          ...existingProduct,
          status: "published",
          updated_at: expect.any(String),
        }),
      }),
    };
    mockProductsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Admin doesn't need shop ownership check
    expect(mockUserOwnsShop).not.toHaveBeenCalled();
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

    mockUserOwnsShop.mockResolvedValue(false);

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({ name: "Hacked Product" }),
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe("You do not have permission to update this product");
  });

  it("should return 404 for non-existent product", async () => {
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

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    const request = new NextRequest(
      "http://localhost:3000/api/products/non-existent",
      {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "non-existent" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Product not found");
  });

  it("should reject duplicate slug in same shop", async () => {
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

    mockUserOwnsShop.mockResolvedValue(true);

    // First call: find the product to update
    // Second call: check if new slug exists (chained where)
    let callCount = 0;
    mockProductsCollection.where.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: existing product
        return {
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [
              {
                id: "prod123",
                data: () => existingProduct,
              },
            ],
          }),
        };
      } else {
        // Second call: slug check (needs to chain .where())
        const chainedWhere = {
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            empty: false, // Slug exists
          }),
        };
        return chainedWhere;
      }
    });

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({ slug: "existing-slug" }),
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Product slug already exists in this shop");
  });

  it("should update category counts when category changes", async () => {
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

    mockUserOwnsShop.mockResolvedValue(true);

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: "prod123",
        data: () => ({
          ...existingProduct,
          category_id: "cat456",
          updated_at: expect.any(String),
        }),
      }),
    };
    mockProductsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({ category_id: "cat456" }),
      }
    );

    await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });

    // Should update both old and new category counts
    expect(mockUpdateCategoryProductCounts).toHaveBeenCalledWith("cat123");
    expect(mockUpdateCategoryProductCounts).toHaveBeenCalledWith("cat456");
  });

  it("should update category counts when status changes to published", async () => {
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

    mockUserOwnsShop.mockResolvedValue(true);

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: "prod123",
        data: () => ({
          ...existingProduct,
          status: "published",
          updated_at: expect.any(String),
        }),
      }),
    };
    mockProductsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
      }
    );

    await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });

    expect(mockUpdateCategoryProductCounts).toHaveBeenCalledWith("cat123");
  });

  it("should not allow updating immutable fields", async () => {
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

    mockUserOwnsShop.mockResolvedValue(true);

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    let savedUpdateData: any;
    const mockDocRef = {
      update: jest.fn().mockImplementation(async (data: any) => {
        savedUpdateData = data;
      }),
      get: jest.fn().mockResolvedValue({
        id: "prod123",
        data: () => existingProduct,
      }),
    };
    mockProductsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({
          shop_id: "hacked-shop",
          created_at: "2020-01-01",
          id: "hacked-id",
          name: "Updated Name",
        }),
      }
    );

    await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });

    // Immutable fields should be removed
    expect(savedUpdateData.shop_id).toBeUndefined();
    expect(savedUpdateData.created_at).toBeUndefined();
    expect(savedUpdateData.id).toBeUndefined();
    expect(savedUpdateData.name).toBe("Updated Name");
    expect(savedUpdateData.updated_at).toBeDefined();
  });

  it("should handle category count update errors gracefully", async () => {
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

    mockUserOwnsShop.mockResolvedValue(true);

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        id: "prod123",
        data: () => ({
          ...existingProduct,
          status: "published",
          updated_at: expect.any(String),
        }),
      }),
    };
    mockProductsCollection.doc.mockReturnValue(mockDocRef);

    mockUpdateCategoryProductCounts.mockRejectedValue(
      new Error("Count update failed")
    );

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });
    const data = await response.json();

    // Should still succeed even if count update fails
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should handle database update errors", async () => {
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

    mockUserOwnsShop.mockResolvedValue(true);

    const mockGetQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "prod123",
            data: () => existingProduct,
          },
        ],
      }),
    };
    mockProductsCollection.where.mockReturnValue(mockGetQuery);

    const mockDocRef = {
      update: jest.fn().mockRejectedValue(new Error("Database error")),
    };
    mockProductsCollection.doc.mockReturnValue(mockDocRef);

    const request = new NextRequest(
      "http://localhost:3000/api/products/original-product",
      {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ slug: "original-product" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to update product");
  });
});
