/**
 * @jest-environment node
 */

/**
 * Cart API Tests
 *
 * GET    /api/cart            — Get current user's cart (auth required)
 * POST   /api/cart            — Add item to cart (auth required)
 * DELETE /api/cart            — Clear entire cart (auth required)
 * PATCH  /api/cart/[itemId]   — Update item quantity (auth required)
 * DELETE /api/cart/[itemId]   — Remove item from cart (auth required)
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── requireAuthFromRequest mock ─────────────────────────────────────────────

const mockRequireAuthFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  requireAuthFromRequest: (...args: unknown[]) =>
    mockRequireAuthFromRequest(...args),
}));

// ─── Repositories mock ───────────────────────────────────────────────────────

const mockCartGetOrCreate = jest.fn();
const mockCartGetItemCount = jest.fn();
const mockCartGetSubtotal = jest.fn();
const mockCartUpdateItem = jest.fn();
const mockCartRemoveItem = jest.fn();
const mockCartClearCart = jest.fn();
const mockCartAddItem = jest.fn();
const mockProductFindById = jest.fn();

jest.mock("@/repositories", () => ({
  cartRepository: {
    getOrCreate: (...args: unknown[]) => mockCartGetOrCreate(...args),
    getItemCount: (...args: unknown[]) => mockCartGetItemCount(...args),
    getSubtotal: (...args: unknown[]) => mockCartGetSubtotal(...args),
    updateItem: (...args: unknown[]) => mockCartUpdateItem(...args),
    removeItem: (...args: unknown[]) => mockCartRemoveItem(...args),
    clearCart: (...args: unknown[]) => mockCartClearCart(...args),
    addItem: (...args: unknown[]) => mockCartAddItem(...args),
  },
  productRepository: {
    findById: (...args: unknown[]) => mockProductFindById(...args),
  },
}));

// ─── Logger mock ─────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// ─── Error classes ────────────────────────────────────────────────────────────

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  }
  class AuthenticationError extends AppError {
    constructor(m: string) {
      super(401, m, "AUTH_ERROR");
    }
  }
  class NotFoundError extends AppError {
    constructor(m: string) {
      super(404, m, "NOT_FOUND");
    }
  }
  class ValidationError extends AppError {
    constructor(m: string) {
      super(422, m, "VALIDATION_ERROR");
    }
  }
  return { AppError, AuthenticationError, NotFoundError, ValidationError };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: error?.statusCode || 500 },
    );
  },
}));

// ─── Route imports ────────────────────────────────────────────────────────────

import { GET, POST, DELETE as DELETE_CART } from "../cart/route";
import {
  PATCH as PATCH_ITEM,
  DELETE as DELETE_ITEM,
} from "../cart/[itemId]/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUser = { uid: "user-001", email: "user@example.com", role: "user" };
const mockCart = {
  userId: "user-001",
  items: [{ itemId: "item-1", productId: "prod-1", quantity: 2, price: 100 }],
};
const mockProduct = {
  id: "prod-1",
  status: "published",
  availableQuantity: 10,
};

// ─── GET /api/cart ────────────────────────────────────────────────────────────

describe("GET /api/cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartGetItemCount.mockReturnValue(1);
    mockCartGetSubtotal.mockReturnValue(100);
  });

  it("returns cart for authenticated user", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCart);

    const req = buildRequest("/api/cart");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("cart");
    expect(body.data).toHaveProperty("itemCount");
    expect(body.data).toHaveProperty("subtotal");
  });

  it("returns 401 when not authenticated", async () => {
    const authErr = Object.assign(new Error("Unauthorized"), {
      statusCode: 401,
    });
    mockRequireAuthFromRequest.mockRejectedValue(authErr);

    const req = buildRequest("/api/cart");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("calls cartRepository.getOrCreate with user uid", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCart);

    const req = buildRequest("/api/cart");
    await GET(req);

    expect(mockCartGetOrCreate).toHaveBeenCalledWith(mockUser.uid);
  });
});

// ─── POST /api/cart ───────────────────────────────────────────────────────────

describe("POST /api/cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartGetItemCount.mockReturnValue(2);
    mockCartGetSubtotal.mockReturnValue(200);
  });

  it("adds item to cart for authenticated user", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockProductFindById.mockResolvedValue(mockProduct);
    mockCartGetOrCreate.mockResolvedValue(mockCart);

    const req = buildRequest("/api/cart", {
      method: "POST",
      body: { productId: "prod-1", quantity: 1 },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    const authErr = Object.assign(new Error("Unauthorized"), {
      statusCode: 401,
    });
    mockRequireAuthFromRequest.mockRejectedValue(authErr);

    const req = buildRequest("/api/cart", {
      method: "POST",
      body: { productId: "prod-1", quantity: 1 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 400 when productId is missing", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);

    const req = buildRequest("/api/cart", {
      method: "POST",
      body: { quantity: 1 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 404 when product does not exist", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockProductFindById.mockResolvedValue(null);

    const req = buildRequest("/api/cart", {
      method: "POST",
      body: { productId: "nonexistent", quantity: 1 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 400 when product is out of stock", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockProductFindById.mockResolvedValue({
      ...mockProduct,
      status: "out_of_stock",
    });

    const req = buildRequest("/api/cart", {
      method: "POST",
      body: { productId: "prod-1", quantity: 1 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when quantity is invalid (< 1)", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);

    const req = buildRequest("/api/cart", {
      method: "POST",
      body: { productId: "prod-1", quantity: 0 },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });
});

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────

describe("DELETE /api/cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartGetItemCount.mockReturnValue(0);
    mockCartGetSubtotal.mockReturnValue(0);
  });

  it("clears cart for authenticated user", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartClearCart.mockResolvedValue({ userId: "user-001", items: [] });

    const req = buildRequest("/api/cart", { method: "DELETE" });
    const res = await DELETE_CART(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.itemCount).toBe(0);
  });

  it("returns 401 when not authenticated", async () => {
    const authErr = Object.assign(new Error("Unauthorized"), {
      statusCode: 401,
    });
    mockRequireAuthFromRequest.mockRejectedValue(authErr);

    const req = buildRequest("/api/cart", { method: "DELETE" });
    const res = await DELETE_CART(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});

// ─── PATCH /api/cart/[itemId] ─────────────────────────────────────────────────

describe("PATCH /api/cart/[itemId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartGetItemCount.mockReturnValue(1);
    mockCartGetSubtotal.mockReturnValue(100);
  });

  it("updates item quantity for authenticated user", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartUpdateItem.mockResolvedValue(mockCart);

    const req = buildRequest("/api/cart/item-1", {
      method: "PATCH",
      body: { quantity: 3 },
    });
    const res = await PATCH_ITEM(req, {
      params: Promise.resolve({ itemId: "item-1" }),
    });
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockCartUpdateItem).toHaveBeenCalledWith("user-001", "item-1", {
      quantity: 3,
    });
  });

  it("returns 401 when not authenticated", async () => {
    const authErr = Object.assign(new Error("Unauthorized"), {
      statusCode: 401,
    });
    mockRequireAuthFromRequest.mockRejectedValue(authErr);

    const req = buildRequest("/api/cart/item-1", {
      method: "PATCH",
      body: { quantity: 3 },
    });
    const res = await PATCH_ITEM(req, {
      params: Promise.resolve({ itemId: "item-1" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 400 when quantity is invalid", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);

    const req = buildRequest("/api/cart/item-1", {
      method: "PATCH",
      body: { quantity: 0 },
    });
    const res = await PATCH_ITEM(req, {
      params: Promise.resolve({ itemId: "item-1" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });
});

// ─── DELETE /api/cart/[itemId] ────────────────────────────────────────────────

describe("DELETE /api/cart/[itemId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartGetItemCount.mockReturnValue(0);
    mockCartGetSubtotal.mockReturnValue(0);
  });

  it("removes item from cart for authenticated user", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartRemoveItem.mockResolvedValue({ userId: "user-001", items: [] });

    const req = buildRequest("/api/cart/item-1", { method: "DELETE" });
    const res = await DELETE_ITEM(req, {
      params: Promise.resolve({ itemId: "item-1" }),
    });
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockCartRemoveItem).toHaveBeenCalledWith("user-001", "item-1");
  });

  it("returns 401 when not authenticated", async () => {
    const authErr = Object.assign(new Error("Unauthorized"), {
      statusCode: 401,
    });
    mockRequireAuthFromRequest.mockRejectedValue(authErr);

    const req = buildRequest("/api/cart/item-1", { method: "DELETE" });
    const res = await DELETE_ITEM(req, {
      params: Promise.resolve({ itemId: "item-1" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
