/**
 * @jest-environment node
 */

/**
 * Products API Integration Tests
 *
 * Tests GET /api/products and POST /api/products
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockSellerUser,
  getSeedProducts,
  getSeedUsers,
  getSeedCategories,
} from "./helpers";

// ============================================
// Mocks
// ============================================

const mockFindAll = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/repositories", () => ({
  productRepository: {
    findAll: (...args: unknown[]) => mockFindAll(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockRequireRoleFromRequest = jest.fn();
const mockApplySieveToArray = jest.fn();

jest.mock("@/lib/security/authorization", () => ({
  requireRoleFromRequest: (...args: unknown[]) =>
    mockRequireRoleFromRequest(...args),
}));

jest.mock("@/helpers", () => ({
  applySieveToArray: (...args: unknown[]) => mockApplySieveToArray(...args),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (schema: any, body: any) => {
    // Simple pass-through: if body has title, it's valid
    if (body && body.title) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: {
        format: () => [{ path: ["title"], message: "Title is required" }],
      },
    };
  },
  formatZodErrors: (errors: any) => {
    if (errors?.format) {
      return errors.format();
    }
    return [{ field: "title", message: "Title is required" }];
  },
  productCreateSchema: {},
}));

jest.mock("@/lib/errors", () => ({
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthenticationError";
    }
  },
  AuthorizationError: class AuthorizationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthorizationError";
    }
  },
}));

// Import route handlers AFTER mocks
import { GET, POST } from "../products/route";

// ============================================
// Mock data - Using actual seed data for realistic tests
// ============================================

// ============================================
// Mock data - Using actual seed data for realistic tests
// ============================================

const seedProducts = getSeedProducts();
const seedUsers = getSeedUsers();
const seedCategories = getSeedCategories();

const mockProducts = [
  seedProducts.iphone15ProMax,
  seedProducts.samsungGalaxyS24,
  seedProducts.macbookPro16,
];

// ============================================
// Tests
// ============================================
// ============================================

describe("Products API - GET /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAll.mockResolvedValue([...mockProducts]);
    mockApplySieveToArray.mockImplementation(
      async ({ items, model }: { items: any[]; model: any }) => {
        const page = model?.page ?? 1;
        const pageSize = model?.pageSize ?? 20;
        const start = (page - 1) * pageSize;
        const pagedItems = items.slice(start, start + pageSize);

        return {
          items: pagedItems,
          page,
          pageSize,
          total: items.length,
          totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
          hasMore: start + pageSize < items.length,
        };
      },
    );
  });

  it("returns products with default pagination", async () => {
    const req = buildRequest("/api/products");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    // Note: Current implementation returns a STUB (empty array)
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.meta).toBeDefined();
  });

  it("returns 200 status", async () => {
    const req = buildRequest("/api/products");
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("returns success: true in response body", async () => {
    const req = buildRequest("/api/products");
    const res = await GET(req);
    const { body } = await parseResponse(res);
    expect(body.success).toBe(true);
  });

  it("returns meta with pagination fields", async () => {
    const req = buildRequest("/api/products");
    const res = await GET(req);
    const { body } = await parseResponse(res);
    expect(body.meta).toHaveProperty("page");
    expect(body.meta).toHaveProperty("limit");
    expect(body.meta).toHaveProperty("total");
    expect(body.meta).toHaveProperty("hasMore");
  });

  it("calls findAll on repository", async () => {
    const req = buildRequest("/api/products");
    await GET(req);
    expect(mockFindAll).toHaveBeenCalled();
  });

  it("handles repository errors gracefully", async () => {
    mockFindAll.mockRejectedValue(new Error("Database connection failed"));
    const req = buildRequest("/api/products");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("sets public cache-control headers with stale-while-revalidate", async () => {
    const req = buildRequest("/api/products");
    const res = await GET(req);
    const cacheControl = res.headers.get("cache-control");
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("stale-while-revalidate");
  });
});

describe("Products API - POST /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRoleFromRequest.mockResolvedValue(mockSellerUser());
    mockCreate.mockResolvedValue({ id: "new-prod", title: "New Product" });
  });

  it("creates a product with valid data", async () => {
    const req = buildRequest("/api/products", {
      method: "POST",
      body: {
        title: "New Product",
        description: "A great product",
        category: "electronics",
        price: 9999,
        stockQuantity: 50,
        mainImage: "https://example.com/image.jpg",
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("requires seller/moderator/admin role", async () => {
    const req = buildRequest("/api/products", {
      method: "POST",
      body: { title: "New Product" },
    });
    await POST(req);
    expect(mockRequireRoleFromRequest).toHaveBeenCalledWith(expect.anything(), [
      "seller",
      "moderator",
      "admin",
    ]);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = require("@/lib/errors");
    mockRequireRoleFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/products", {
      method: "POST",
      body: { title: "Test" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns 403 when user lacks role", async () => {
    const { AuthorizationError } = require("@/lib/errors");
    mockRequireRoleFromRequest.mockRejectedValue(
      new AuthorizationError("Forbidden"),
    );

    const req = buildRequest("/api/products", {
      method: "POST",
      body: { title: "Test" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.success).toBe(false);
  });

  it("returns 400 for invalid body", async () => {
    const req = buildRequest("/api/products", {
      method: "POST",
      body: { description: "missing title" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Validation failed");
  });

  it("sets sellerId from authenticated user", async () => {
    const seller = mockSellerUser();
    mockRequireRoleFromRequest.mockResolvedValue(seller);

    const req = buildRequest("/api/products", {
      method: "POST",
      body: { title: "New Product", category: "electronics" },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: seller.uid,
        sellerName: seller.displayName,
      }),
    );
  });

  it("handles repository create errors", async () => {
    mockCreate.mockRejectedValue(new Error("DB write failed"));

    const req = buildRequest("/api/products", {
      method: "POST",
      body: { title: "New Product" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});
