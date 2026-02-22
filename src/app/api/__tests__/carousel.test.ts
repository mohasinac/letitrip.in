/**
 * @jest-environment node
 */

/**
 * Carousel API Integration Tests
 *
 * Tests GET /api/carousel and POST /api/carousel
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
const mockGetActiveSlides = jest.fn();
const mockCreate = jest.fn();
const mockIncrementViews = jest.fn();

jest.mock("@/repositories", () => ({
  carouselRepository: {
    findAll: (...args: unknown[]) => mockFindAll(...args),
    getActiveSlides: (...args: unknown[]) => mockGetActiveSlides(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    incrementViews: (...args: unknown[]) =>
      Promise.resolve(mockIncrementViews(...args)),
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
    if (body && body.title && body.media) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: {
        format: () => [{ path: ["title"], message: "Title is required" }],
      },
    };
  },
  formatZodErrors: (errors: any) => errors?.format?.() || [],
  carouselCreateSchema: {},
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

import { GET, POST } from "../carousel/route";

// ============================================
// Mock data
// ============================================

const mockSlides = [
  {
    id: "slide-1",
    title: "Summer Sale",
    active: true,
    order: 1,
    gridCards: [],
    buttons: [],
  },
  {
    id: "slide-2",
    title: "New Arrivals",
    active: true,
    order: 2,
    gridCards: [],
    buttons: [],
  },
  {
    id: "slide-3",
    title: "Flash Deal",
    active: false,
    order: 3,
    gridCards: [],
    buttons: [],
  },
];

// ============================================
// Tests
// ============================================

describe("Carousel API - GET /api/carousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActiveSlides.mockResolvedValue(mockSlides.filter((s) => s.active));
    mockFindAll.mockResolvedValue([...mockSlides]);
    mockGetUserFromRequest.mockResolvedValue(null);
  });

  it("returns active slides by default", async () => {
    const req = buildRequest("/api/carousel");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockGetActiveSlides).toHaveBeenCalled();
  });

  it("returns all slides when includeInactive=true for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockAdminUser());
    const req = buildRequest("/api/carousel?includeInactive=true");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.success).toBe(true);
    expect(mockFindAll).toHaveBeenCalled();
  });

  it("returns 403 for non-admin requesting inactive slides", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockRegularUser());
    const req = buildRequest("/api/carousel?includeInactive=true");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(403);
    expect(body.success).toBe(false);
  });

  it("sorts slides by order", async () => {
    mockGetActiveSlides.mockResolvedValue([
      { id: "s2", order: 2, active: true },
      { id: "s1", order: 1, active: true },
    ]);
    const req = buildRequest("/api/carousel");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data[0].order).toBeLessThanOrEqual(body.data[1].order);
  });

  it("limits public response to max 5 slides", async () => {
    mockGetActiveSlides.mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        id: `s${i}`,
        order: i,
        active: true,
      })),
    );
    const req = buildRequest("/api/carousel");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  it("sets public cache-control headers", async () => {
    const req = buildRequest("/api/carousel");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("public");
  });

  it("sets private cache-control for admin", async () => {
    mockGetUserFromRequest.mockResolvedValue(mockAdminUser());
    const req = buildRequest("/api/carousel?includeInactive=true");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("private");
  });

  it("handles repository errors gracefully", async () => {
    mockGetActiveSlides.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/carousel");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});

describe("Carousel API - POST /api/carousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireRoleFromRequest.mockResolvedValue(mockAdminUser());
    mockGetActiveSlides.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ id: "new-slide", title: "New Slide" });
  });

  it("creates a slide with valid data", async () => {
    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Summer Sale",
        media: { type: "image", url: "/img.jpg" },
        active: true,
        gridCards: [],
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("requires admin role", async () => {
    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Test",
        media: { type: "image", url: "/img.jpg" },
        gridCards: [],
      },
    });
    await POST(req);
    expect(mockRequireRoleFromRequest).toHaveBeenCalledWith(expect.anything(), [
      "admin",
    ]);
  });

  it("enforces max 5 active slides limit", async () => {
    mockGetActiveSlides.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, active: true })),
    );

    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Extra",
        media: { type: "image", url: "/img.jpg" },
        active: true,
        gridCards: [],
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.error).toContain("Maximum 5");
  });

  it("allows inactive slide creation even with 5 active", async () => {
    mockGetActiveSlides.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, active: true })),
    );

    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Draft",
        media: { type: "image", url: "/img.jpg" },
        active: false,
        gridCards: [],
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 400 for invalid body", async () => {
    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: { order: 1 }, // missing title and media
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

    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Test",
        media: { type: "image", url: "/i.jpg" },
        gridCards: [],
      },
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

    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Test",
        media: { type: "image", url: "/i.jpg" },
        gridCards: [],
      },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("sets createdBy from authenticated user", async () => {
    const admin = mockAdminUser();
    mockRequireRoleFromRequest.mockResolvedValue(admin);

    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Test",
        media: { type: "image", url: "/i.jpg" },
        active: false,
        gridCards: [],
      },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: admin.uid }),
    );
  });

  it("handles repository create errors", async () => {
    mockCreate.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/carousel", {
      method: "POST",
      body: {
        title: "Test",
        media: { type: "image", url: "/i.jpg" },
        gridCards: [],
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});
