/**
 * @jest-environment node
 */
/**
 * Tests for Products API Routes
 * GET /api/products - List products with filtering
 * POST /api/products - Create new product
 *
 * Note: PATCH and DELETE tests are in [slug]/route.test.ts
 */

// Set up environment BEFORE any imports
process.env.FIREBASE_PROJECT_ID = "test-project";

// Mock dependencies BEFORE imports
jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/collections");
jest.mock("@/app/api/lib/firebase/queries");
jest.mock("@/app/api/middleware/cache");
jest.mock("@/lib/category-hierarchy");
jest.mock("@/app/api/lib/utils/pagination");

import { NextRequest, NextResponse } from "next/server";
import { POST } from "./route";
import {
  getUserFromRequest,
  requireAuth,
} from "@/app/api/middleware/rbac-auth";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";
import { updateCategoryProductCounts } from "@/lib/category-hierarchy";

const mockGetUserFromRequest = getUserFromRequest as jest.MockedFunction<
  typeof getUserFromRequest
>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCollections = Collections as jest.Mocked<typeof Collections>;
const mockUserOwnsShop = userOwnsShop as jest.MockedFunction<
  typeof userOwnsShop
>;
const mockUpdateCategoryProductCounts =
  updateCategoryProductCounts as jest.MockedFunction<
    typeof updateCategoryProductCounts
  >;

describe("POST /api/products - Create Product", () => {
  let mockProductsCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProductsCollection = {
      add: jest.fn(),
      where: jest.fn(),
    };

    mockCollections.products.mockReturnValue(mockProductsCollection as any);
    mockUpdateCategoryProductCounts.mockResolvedValue(undefined);
  });

  const validProductData = {
    shop_id: "shop123",
    name: "Test Product",
    slug: "test-product",
    description: "Test description",
    price: 99.99,
    category_id: "cat123",
    images: ["https://example.com/image1.jpg"],
    status: "draft",
    stock_quantity: 10,
    is_featured: false,
  };

  it("should create a product successfully as seller", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    // Mock slug uniqueness check (no existing product)
    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);

    mockProductsCollection.add.mockResolvedValue({ id: "prod123" });

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("prod123");
    expect(data.data.name).toBe("Test Product");
    expect(data.data.shop_id).toBe("shop123");
    expect(mockProductsCollection.add).toHaveBeenCalled();
  });

  it("should reject product creation from non-seller user", async () => {
    const mockUser = {
      uid: "user123",
      email: "user@test.com",
      name: "Regular User",
      role: "user" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Only sellers and admins can create products");
    expect(mockProductsCollection.add).not.toHaveBeenCalled();
  });

  it("should allow admin to create product", async () => {
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

    // Admin still needs ownership check but bypasses the permission check
    mockUserOwnsShop.mockResolvedValue(false);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod456" });

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    // Admin bypasses shop ownership check due to role check
    expect(mockUserOwnsShop).toHaveBeenCalledWith("shop123", "admin123");
  });

  it("should reject product without shop_id", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const invalidData = { ...validProductData };
    delete (invalidData as any).shop_id;

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Validation failed");
    expect(data.errors.shop_id).toBe("Shop ID is required");
  });

  it("should reject product with short name", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const invalidData = { ...validProductData, name: "ab" };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors.name).toBe("Name must be at least 3 characters");
  });

  it("should reject product with short slug", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const invalidData = { ...validProductData, slug: "ab" };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors.slug).toBe("Slug must be at least 3 characters");
  });

  it("should reject product with invalid price", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const invalidData = { ...validProductData, price: 0 };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors.price).toBe("Price must be greater than 0");
  });

  it("should reject product without category_id", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    const invalidData = { ...validProductData };
    delete (invalidData as any).category_id;

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors.category_id).toBe("Category is required");
  });

  it("should reject seller creating product for shop they don't own", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(false);

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe(
      "You do not have permission to add products to this shop",
    );
    expect(mockProductsCollection.add).not.toHaveBeenCalled();
  });

  it("should reject duplicate slug", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    // Mock existing product with same slug
    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: false }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Product slug already exists");
    expect(mockProductsCollection.add).not.toHaveBeenCalled();
  });

  it("should accept camelCase field names", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod789" });

    const camelCaseData = {
      shopId: "shop123",
      name: "Test Product",
      slug: "test-product-camel",
      description: "Test description",
      price: 99.99,
      categoryId: "cat123",
      images: [],
      status: "draft",
      stockCount: 5,
      featured: true,
    };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(camelCaseData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.shop_id).toBe("shop123");
    expect(data.data.category_id).toBe("cat123");
    expect(data.data.is_featured).toBe(true);
  });

  it("should handle published product and update category counts", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod999" });

    const publishedData = { ...validProductData, status: "published" };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(publishedData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(mockUpdateCategoryProductCounts).toHaveBeenCalledWith("cat123");
  });

  it("should not update category counts for draft product", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod111" });

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData), // status: "draft"
    });

    await POST(request);

    expect(mockUpdateCategoryProductCounts).not.toHaveBeenCalled();
  });

  it("should handle category count update errors gracefully", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod222" });

    mockUpdateCategoryProductCounts.mockRejectedValue(
      new Error("Count update failed"),
    );

    const publishedData = { ...validProductData, status: "published" };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(publishedData),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still succeed even if count update fails
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it("should handle null stock_quantity", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod333" });

    const dataWithoutStock = { ...validProductData };
    delete (dataWithoutStock as any).stock_quantity;

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(dataWithoutStock),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.stock_quantity).toBeNull();
  });

  it("should set default values for optional fields", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod444" });

    const minimalData = {
      shop_id: "shop123",
      name: "Minimal Product",
      slug: "minimal-product",
      price: 50,
      category_id: "cat123",
    };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(minimalData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.description).toBe("");
    expect(data.data.status).toBe("draft");
    expect(data.data.is_featured).toBe(false);
    expect(data.data.images).toEqual([]);
  });

  it("should handle database add errors", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to create product");
  });

  it("should handle unauthenticated requests", async () => {
    mockRequireAuth.mockResolvedValue({
      user: null,
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      ),
    } as any);

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized");
  });

  it("should include timestamps in created product", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);
    mockProductsCollection.add.mockResolvedValue({ id: "prod555" });

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(validProductData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.created_at).toBeDefined();
    expect(data.data.updated_at).toBeDefined();
    expect(typeof data.data.created_at).toBe("string");
  });

  it("should convert price to number", async () => {
    const mockUser = {
      uid: "user123",
      email: "seller@test.com",
      name: "Test Seller",
      role: "seller" as const,
    };

    mockRequireAuth.mockResolvedValue({
      user: mockUser,
      error: null,
    } as any);

    mockUserOwnsShop.mockResolvedValue(true);

    const mockQuery = {
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true }),
    };
    mockProductsCollection.where.mockReturnValue(mockQuery);

    let savedData: any;
    mockProductsCollection.add.mockImplementation(async (data: any) => {
      savedData = data;
      return { id: "prod666" };
    });

    const dataWithStringPrice = { ...validProductData, price: "150.50" as any };

    const request = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(dataWithStringPrice),
    });

    await POST(request);

    expect(typeof savedData.price).toBe("number");
    expect(savedData.price).toBe(150.5);
  });
});
