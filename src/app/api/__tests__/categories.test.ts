/**
 * @jest-environment node
 */

/**
 * Categories API Integration Tests
 *
 * Tests GET /api/categories and POST /api/categories
 */

import { buildRequest, parseResponse, mockAdminUser } from "./helpers";

// ============================================
// Mocks
// ============================================

const mockFindAll = jest.fn();
const mockFindBy = jest.fn();
const mockGetCategoriesByRootId = jest.fn();
const mockBuildTree = jest.fn();
const mockCreateWithHierarchy = jest.fn();

jest.mock("@/repositories", () => ({
  categoriesRepository: {
    findAll: (...args: unknown[]) => mockFindAll(...args),
    findBy: (...args: unknown[]) => mockFindBy(...args),
    getCategoriesByRootId: (...args: unknown[]) =>
      mockGetCategoriesByRootId(...args),
    buildTree: (...args: unknown[]) => mockBuildTree(...args),
    createWithHierarchy: (...args: unknown[]) =>
      mockCreateWithHierarchy(...args),
  },
}));

const mockRequireRoleFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  requireRoleFromRequest: (...args: unknown[]) =>
    mockRequireRoleFromRequest(...args),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (_schema: unknown, body: any) => {
    if (body && body.name) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: {
        format: () => [{ path: ["name"], message: "Name is required" }],
      },
    };
  },
  formatZodErrors: (errors: any) => errors?.format?.() || [],
  categoryCreateSchema: {},
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

jest.mock("@/db/schema/categories", () => ({}));

import { GET, POST } from "../categories/route";

// ============================================
// Mock data
// ============================================

const mockCategories = [
  {
    id: "cat-1",
    name: "Electronics",
    parentIds: [],
    order: 1,
    tier: 0,
    isFeatured: true,
  },
  {
    id: "cat-2",
    name: "Clothing",
    parentIds: [],
    order: 2,
    tier: 0,
    isFeatured: false,
  },
  {
    id: "cat-3",
    name: "Phones",
    parentIds: ["cat-1"],
    order: 1,
    tier: 1,
    isFeatured: false,
  },
];

const mockTree = [
  {
    id: "cat-1",
    name: "Electronics",
    children: [{ id: "cat-3", name: "Phones", children: [] }],
  },
  { id: "cat-2", name: "Clothing", children: [] },
];

// ============================================
// Tests
// ============================================

describe("Categories API - GET /api/categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAll.mockResolvedValue([...mockCategories]);
    mockBuildTree.mockResolvedValue(mockTree);
  });

  it("returns category tree by default", async () => {
    const req = buildRequest("/api/categories");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTree);
  });

  it("returns flat list when flat=true", async () => {
    const req = buildRequest("/api/categories?flat=true");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it("filters by featured categories", async () => {
    mockFindBy.mockResolvedValue([mockCategories[0]]);
    const req = buildRequest("/api/categories?featured=true");
    const res = await GET(req);

    expect(mockFindBy).toHaveBeenCalledWith("isFeatured", true);
    expect(res.status).toBe(200);
  });

  it("filters by parentId", async () => {
    const req = buildRequest("/api/categories?parentId=cat-1");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(mockFindAll).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("filters by rootId", async () => {
    mockGetCategoriesByRootId.mockResolvedValue([
      mockCategories[0],
      mockCategories[2],
    ]);
    const req = buildRequest("/api/categories?rootId=cat-1");
    const res = await GET(req);

    expect(mockGetCategoriesByRootId).toHaveBeenCalledWith("cat-1");
    expect(res.status).toBe(200);
  });

  it("includes total count in meta", async () => {
    const req = buildRequest("/api/categories");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta).toBeDefined();
    expect(body.meta.total).toBe(mockCategories.length);
  });

  it("handles repository errors gracefully", async () => {
    mockFindAll.mockRejectedValue(new Error("DB error"));
    mockBuildTree.mockRejectedValue(new Error("DB error"));

    const req = buildRequest("/api/categories");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("sets public cache-control headers with stale-while-revalidate", async () => {
    const req = buildRequest("/api/categories");
    const res = await GET(req);
    const cacheControl = res.headers.get("cache-control");
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("stale-while-revalidate");
  });
});

describe("Categories API - POST /api/categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRoleFromRequest.mockResolvedValue(mockAdminUser());
    mockCreateWithHierarchy.mockResolvedValue({
      id: "new-cat",
      name: "New Category",
    });
  });

  it("creates a category with valid data", async () => {
    const req = buildRequest("/api/categories", {
      method: "POST",
      body: { name: "New Category", description: "Test category" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it("requires admin role", async () => {
    const req = buildRequest("/api/categories", {
      method: "POST",
      body: { name: "Test" },
    });
    await POST(req);
    expect(mockRequireRoleFromRequest).toHaveBeenCalledWith(expect.anything(), [
      "admin",
    ]);
  });

  it("returns 400 for invalid body", async () => {
    const req = buildRequest("/api/categories", {
      method: "POST",
      body: { description: "missing name" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Validation failed");
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = require("@/lib/errors");
    mockRequireRoleFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/categories", {
      method: "POST",
      body: { name: "Test" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    const { AuthorizationError } = require("@/lib/errors");
    mockRequireRoleFromRequest.mockRejectedValue(
      new AuthorizationError("Forbidden"),
    );

    const req = buildRequest("/api/categories", {
      method: "POST",
      body: { name: "Test" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("sets createdBy from authenticated user", async () => {
    const admin = mockAdminUser();
    mockRequireRoleFromRequest.mockResolvedValue(admin);

    const req = buildRequest("/api/categories", {
      method: "POST",
      body: { name: "Electronics" },
    });
    await POST(req);

    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: admin.uid }),
    );
  });

  it("handles repository create errors", async () => {
    mockCreateWithHierarchy.mockRejectedValue(new Error("DB error"));

    const req = buildRequest("/api/categories", {
      method: "POST",
      body: { name: "Test" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});
