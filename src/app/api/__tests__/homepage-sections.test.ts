/**
 * @jest-environment node
 */

/**
 * Homepage Sections API Integration Tests
 *
 * Tests GET /api/homepage-sections and POST /api/homepage-sections
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockRegularUser,
} from "./helpers";

// ============================================
// Mocks
// ============================================

const mockFindAll = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/repositories", () => ({
  homepageSectionsRepository: {
    findAll: (...args: unknown[]) => mockFindAll(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockGetUserFromRequest = jest.fn();
const mockRequireRoleFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  getUserFromRequest: (...args: unknown[]) => mockGetUserFromRequest(...args),
  requireRoleFromRequest: (...args: unknown[]) =>
    mockRequireRoleFromRequest(...args),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (_schema: unknown, body: any) => {
    if (body && body.type && body.config) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: {
        format: () => [{ path: ["type"], message: "Type is required" }],
      },
    };
  },
  formatZodErrors: (errors: any) => errors?.format?.() || [],
  homepageSectionCreateSchema: {},
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
    toJSON() {
      return { success: false, error: this.message, code: this.code };
    }
  }
  class AuthenticationError extends AppError {
    constructor(message: string) {
      super(401, message, "AUTH_ERROR");
      this.name = "AuthenticationError";
    }
  }
  class AuthorizationError extends AppError {
    constructor(message: string) {
      super(403, message, "FORBIDDEN");
      this.name = "AuthorizationError";
    }
  }
  return {
    AppError,
    AuthenticationError,
    AuthorizationError,
    handleApiError: (error: unknown) => {
      const { NextResponse } = require("next/server");
      if (error instanceof AppError) {
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    },
  };
});

jest.mock("@/lib/errors/error-handler", () => {
  const errors = jest.requireMock("@/lib/errors");
  return {
    handleApiError: errors.handleApiError,
    logError: jest.fn(),
  };
});

import { GET, POST } from "../homepage-sections/route";

// ============================================
// Mock data
// ============================================

const mockSections = [
  {
    id: "section-welcome-1707300000001",
    type: "welcome",
    order: 1,
    enabled: true,
    config: {
      h1: "Hero Section",
      subtitle: "Welcome",
      description: "{}",
      showCTA: false,
    },
  },
  {
    id: "section-products-1707300000004",
    type: "products",
    order: 2,
    enabled: true,
    config: {
      title: "Featured Products",
      maxProducts: 18,
      rows: 2,
      itemsPerRow: 3,
      mobileItemsPerRow: 1,
      autoScroll: false,
      scrollInterval: 0,
    },
  },
  {
    id: "section-categories-1707300000003",
    type: "categories",
    order: 3,
    enabled: false,
    config: {
      title: "Top Categories",
      maxCategories: 4,
      autoScroll: false,
      scrollInterval: 3000,
    },
  },
  {
    id: "section-reviews-1707300000009",
    type: "reviews",
    order: 4,
    enabled: true,
    config: {
      title: "Customer Reviews",
      maxReviews: 18,
      itemsPerView: 3,
      mobileItemsPerView: 1,
      autoScroll: true,
      scrollInterval: 5000,
    },
  },
];

// ============================================
// Tests
// ============================================

describe("Homepage Sections API - GET /api/homepage-sections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAll.mockResolvedValue([...mockSections]);
    mockGetUserFromRequest.mockResolvedValue(null);
  });

  it("returns only enabled sections by default", async () => {
    const req = buildRequest("/api/homepage-sections");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    // sec-3 is disabled, so 3 out of 4
    expect(body.data).toHaveLength(3);
    body.data.forEach((s: any) => expect(s.enabled).toBe(true));
  });

  it("returns all sections when includeDisabled=true for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockAdminUser());
    const req = buildRequest("/api/homepage-sections?includeDisabled=true");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data).toHaveLength(4);
  });

  it("returns 403 for non-admin requesting disabled sections", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockRegularUser());
    const req = buildRequest("/api/homepage-sections?includeDisabled=true");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.success).toBe(false);
  });

  it("sorts sections by order ascending", async () => {
    const req = buildRequest("/api/homepage-sections");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const orders = body.data.map((s: any) => s.order);
    for (let i = 0; i < orders.length - 1; i++) {
      expect(orders[i]).toBeLessThanOrEqual(orders[i + 1]);
    }
  });

  it("includes meta with section counts", async () => {
    const req = buildRequest("/api/homepage-sections");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta).toBeDefined();
    expect(body.meta.totalSections).toBeDefined();
    expect(body.meta.enabledSections).toBeDefined();
  });

  it("sets public cache-control headers", async () => {
    const req = buildRequest("/api/homepage-sections");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("public");
  });

  it("sets private cache-control for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockAdminUser());
    const req = buildRequest("/api/homepage-sections?includeDisabled=true");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("private");
  });

  it("handles repository errors gracefully", async () => {
    mockFindAll.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/homepage-sections");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});

describe("Homepage Sections API - POST /api/homepage-sections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRoleFromRequest.mockResolvedValue(mockAdminUser());
    mockFindAll.mockResolvedValue(mockSections);
    mockCreate.mockResolvedValue({
      id: "section-blog-articles-1707300000012",
      type: "blog-articles",
      config: {
        title: "Blog Posts",
        maxArticles: 4,
        showReadTime: true,
        showAuthor: true,
        showThumbnails: true,
      },
    });
  });

  it("creates a section with valid data", async () => {
    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: {
        type: "blog-articles",
        config: {
          title: "Blog Posts",
          maxArticles: 4,
          showReadTime: true,
          showAuthor: true,
          showThumbnails: true,
        },
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("requires admin role", async () => {
    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: {
        type: "blog-articles",
        config: {
          title: "Blog",
          maxArticles: 4,
          showReadTime: true,
          showAuthor: true,
          showThumbnails: true,
        },
      },
    });
    await POST(req);
    expect(mockRequireRoleFromRequest).toHaveBeenCalledWith(expect.anything(), [
      "admin",
    ]);
  });

  it("auto-assigns order position", async () => {
    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: {
        type: "blog-articles",
        config: {
          title: "Blog",
          maxArticles: 4,
          showReadTime: true,
          showAuthor: true,
          showThumbnails: true,
        },
      },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ order: 5 }), // max existing is 4
    );
  });

  it("respects provided order position", async () => {
    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: {
        type: "blog-articles",
        config: {
          title: "Blog",
          maxArticles: 4,
          showReadTime: true,
          showAuthor: true,
          showThumbnails: true,
        },
        order: 2,
      },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ order: 2 }),
    );
  });

  it("returns 400 for invalid body", async () => {
    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: { enabled: true }, // missing type and config
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = require("@/lib/errors");
    mockRequireRoleFromRequest.mockRejectedValue(
      new AuthenticationError("Not authenticated"),
    );

    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: { type: "blog-articles", config: { title: "Blog" } },
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

    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: { type: "blog-articles", config: { title: "Blog" } },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("handles repository create errors", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/homepage-sections", {
      method: "POST",
      body: { type: "blog-articles", config: { title: "Blog" } },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});
