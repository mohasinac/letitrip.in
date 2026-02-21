/**
 * @jest-environment node
 */

/**
 * User Wishlist API Tests
 *
 * GET  /api/user/wishlist
 * POST /api/user/wishlist
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockRequireAuth = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockGetWishlistItems = jest.fn();
const mockAddItem = jest.fn();
const mockProductFindById = jest.fn();

jest.mock("@/repositories", () => ({
  wishlistRepository: {
    getWishlistItems: (...args: unknown[]) => mockGetWishlistItems(...args),
    addItem: (...args: unknown[]) => mockAddItem(...args),
  },
  productRepository: {
    findById: (...args: unknown[]) => mockProductFindById(...args),
  },
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
    }
  }
  return {
    AppError,
    AuthenticationError,
    handleApiError: (error: any) => {
      const { NextResponse } = require("next/server");
      const status = error?.statusCode ?? 500;
      return NextResponse.json(
        { success: false, error: error?.message ?? "Internal server error" },
        { status },
      );
    },
  };
});

jest.mock("@/lib/errors/error-handler", () => {
  const errors = jest.requireMock("@/lib/errors");
  return { handleApiError: errors.handleApiError, logError: jest.fn() };
});

jest.mock("@/lib/api-response", () => ({
  successResponse: (data?: unknown, message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status });
  },
  errorResponse: (message: string, status = 400, fields?: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: message, fields },
      { status },
    );
  },
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    AUTH: { UNAUTHORIZED: "Unauthorized" },
    VALIDATION: { FAILED: "Validation failed" },
    PRODUCT: { NOT_FOUND: "Product not found" },
    WISHLIST: { ALREADY_ADDED: "Already in wishlist" },
  },
  SUCCESS_MESSAGES: {
    WISHLIST: { ADDED: "Added to wishlist" },
  },
}));

import { GET, POST } from "../user/wishlist/route";

// ─── Test Data ────────────────────────────────────────────────────────────────

const AUTH_USER = { uid: "user-123", email: "user@example.com" };

const MOCK_PRODUCT = {
  id: "prod-001",
  title: "Test Product",
  price: 50,
  status: "published",
};

const MOCK_WISHLIST_ITEM = {
  id: "wish-1",
  userId: AUTH_USER.uid,
  productId: "prod-001",
  addedAt: new Date().toISOString(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("User Wishlist API — GET /api/user/wishlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(AUTH_USER);
    mockGetWishlistItems.mockResolvedValue([MOCK_WISHLIST_ITEM]);
    mockProductFindById.mockResolvedValue(MOCK_PRODUCT);
  });

  it("returns 200 with enriched wishlist items", async () => {
    const res = await GET();
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("items");
    expect(body.data).toHaveProperty("meta");
  });

  it("enriches each item with product details", async () => {
    const res = await GET();
    const { body } = await parseResponse(res);

    expect(body.data.items[0]).toHaveProperty("product");
    expect(body.data.items[0].product.id).toBe("prod-001");
  });

  it("excludes items whose product was not found", async () => {
    mockProductFindById.mockResolvedValueOnce(null);

    const res = await GET();
    const { body } = await parseResponse(res);

    expect(body.data.items).toHaveLength(0);
    expect(body.data.meta.total).toBe(0);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockRequireAuth.mockRejectedValue(new AuthenticationError("Unauthorized"));

    const res = await GET();
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});

describe("User Wishlist API — POST /api/user/wishlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(AUTH_USER);
    mockProductFindById.mockResolvedValue(MOCK_PRODUCT);
    mockAddItem.mockResolvedValue(undefined);
  });

  it("returns 201 when product is added to wishlist", async () => {
    const req = buildRequest("/api/user/wishlist", {
      method: "POST",
      body: { productId: "prod-001" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("calls wishlistRepository.addItem with correct args", async () => {
    const req = buildRequest("/api/user/wishlist", {
      method: "POST",
      body: { productId: "prod-001" },
    });
    await POST(req);

    expect(mockAddItem).toHaveBeenCalledWith(AUTH_USER.uid, "prod-001");
  });

  it("returns 400 when productId is missing", async () => {
    const req = buildRequest("/api/user/wishlist", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 404 when product does not exist", async () => {
    mockProductFindById.mockResolvedValueOnce(null);

    const req = buildRequest("/api/user/wishlist", {
      method: "POST",
      body: { productId: "nonexistent-product" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockRequireAuth.mockRejectedValue(new AuthenticationError("Unauthorized"));

    const req = buildRequest("/api/user/wishlist", {
      method: "POST",
      body: { productId: "prod-001" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
