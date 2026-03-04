/**
 * @jest-environment node
 */

/**
 * Checkout API Tests
 *
 * POST /api/checkout — Place order(s) from the user's cart
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── requireAuthFromRequest mock ─────────────────────────────────────────────

const mockRequireAuthFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  requireAuthFromRequest: (...args: unknown[]) =>
    mockRequireAuthFromRequest(...args),
}));

// ─── unitOfWork mock ──────────────────────────────────────────────────────────

const mockCartGetOrCreate = jest.fn();
const mockAddressGetById = jest.fn();
const mockProductFindById = jest.fn();
const mockOrderCreate = jest.fn();
const mockRunTransaction = jest.fn();
const mockRunBatch = jest.fn();
const mockCartClear = jest.fn();
const mockProductUpdate = jest.fn();

jest.mock("@/repositories", () => ({
  unitOfWork: {
    carts: {
      getOrCreate: (...args: unknown[]) => mockCartGetOrCreate(...args),
      clear: (...args: unknown[]) => mockCartClear(...args),
    },
    addresses: {
      findById: (...args: unknown[]) => mockAddressGetById(...args),
    },
    products: {
      findById: (...args: unknown[]) => mockProductFindById(...args),
      update: (...args: unknown[]) => mockProductUpdate(...args),
    },
    orders: {
      create: (...args: unknown[]) => mockOrderCreate(...args),
    },
    runTransaction: (...args: unknown[]) => mockRunTransaction(...args),
    runBatch: (...args: unknown[]) => mockRunBatch(...args),
  },
}));

// ─── Email mock ───────────────────────────────────────────────────────────────

jest.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
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

// ─── Route import ─────────────────────────────────────────────────────────────

import { POST } from "../checkout/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUser = {
  uid: "user-001",
  email: "user@example.com",
  displayName: "Test User",
  role: "user",
};

const mockAddress = {
  id: "addr-1",
  fullName: "Test User",
  addressLine1: "123 Main St",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
  country: "India",
};

const mockProduct = {
  id: "prod-1",
  title: "Test Product",
  price: 100,
  status: "published",
  availableQuantity: 10,
  sellerId: "seller-001",
  sellerEmail: "seller@example.com",
};

const mockCartWithItems = {
  userId: "user-001",
  items: [
    {
      itemId: "item-1",
      productId: "prod-1",
      productTitle: "Test Product",
      quantity: 1,
      price: 100,
    },
  ],
};

const mockEmptyCart = { userId: "user-001", items: [] };

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("POST /api/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderCreate.mockResolvedValue({ id: "order-001" });
    mockProductUpdate.mockResolvedValue(undefined);
    mockCartClear.mockResolvedValue(mockEmptyCart);
  });

  it("places order successfully with valid cart and address", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCartWithItems);
    mockAddressGetById.mockResolvedValue(mockAddress);
    mockProductFindById.mockResolvedValue(mockProduct);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1", paymentMethod: "cod" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("orderIds");
    expect(body.data).toHaveProperty("total");
  });

  it("returns 401 when not authenticated", async () => {
    const authErr = Object.assign(new Error("Unauthorized"), {
      statusCode: 401,
    });
    mockRequireAuthFromRequest.mockRejectedValue(authErr);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1", paymentMethod: "cod" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 400 when addressId is missing", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCartWithItems);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { paymentMethod: "cod" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns error when cart is empty", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockEmptyCart);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1", paymentMethod: "cod" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBeGreaterThanOrEqual(400);
  });

  it("returns 404 when address does not exist", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCartWithItems);
    mockAddressGetById.mockResolvedValue(null);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "nonexistent", paymentMethod: "cod" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBeGreaterThanOrEqual(400);
  });

  it("returns error when product is unavailable", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCartWithItems);
    mockAddressGetById.mockResolvedValue(mockAddress);
    mockProductFindById.mockResolvedValue({ ...mockProduct, status: "draft" });

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1", paymentMethod: "cod" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBeGreaterThanOrEqual(400);
  });

  it("returns error when insufficient stock", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue({
      ...mockCartWithItems,
      items: [{ ...mockCartWithItems.items[0], quantity: 100 }],
    });
    mockAddressGetById.mockResolvedValue(mockAddress);
    mockProductFindById.mockResolvedValue({
      ...mockProduct,
      availableQuantity: 1,
    });

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1", paymentMethod: "cod" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBeGreaterThanOrEqual(400);
  });

  it("defaults paymentMethod to cod when not provided", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCartWithItems);
    mockAddressGetById.mockResolvedValue(mockAddress);
    mockProductFindById.mockResolvedValue(mockProduct);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
  });

  it("places order successfully with upi_manual payment method", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCartWithItems);
    mockAddressGetById.mockResolvedValue(mockAddress);
    mockProductFindById.mockResolvedValue(mockProduct);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1", paymentMethod: "upi_manual" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("orderIds");
  });

  it("returns 400 when paymentMethod is an unknown value", async () => {
    mockRequireAuthFromRequest.mockResolvedValue(mockUser);
    mockCartGetOrCreate.mockResolvedValue(mockCartWithItems);

    const req = buildRequest("/api/checkout", {
      method: "POST",
      body: { addressId: "addr-1", paymentMethod: "bitcoin" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });
});
