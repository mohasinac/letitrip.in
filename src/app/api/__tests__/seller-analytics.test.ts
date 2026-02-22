/**
 * @jest-environment node
 */

/**
 * Seller Analytics API Tests
 *
 * GET /api/seller/analytics
 */

import { buildRequest, parseResponse, mockRegularUser } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockRequireAuth = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  requireAuth: () => mockRequireAuth(),
}));

const mockFindBySeller = jest.fn();
const mockFindByProduct = jest.fn();

jest.mock("@/repositories", () => ({
  productRepository: {
    findBySeller: (...args: unknown[]) => mockFindBySeller(...args),
  },
  orderRepository: {
    findByProduct: (...args: unknown[]) => mockFindByProduct(...args),
  },
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(s: number, m: string, c: string) {
      super(m);
      this.statusCode = s;
      this.code = c;
      this.name = this.constructor.name;
    }
  }
  class AuthenticationError extends AppError {
    constructor(m: string) {
      super(401, m, "AUTH_ERROR");
    }
  }
  class AuthorizationError extends AppError {
    constructor(m: string) {
      super(403, m, "FORBIDDEN");
    }
  }
  class ValidationError extends AppError {
    constructor(m: string) {
      super(422, m, "VALIDATION_ERROR");
    }
  }
  class NotFoundError extends AppError {
    constructor(m: string) {
      super(404, m, "NOT_FOUND");
    }
  }
  return {
    AppError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
  };
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

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: any, _msg?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data }, { status });
  },
}));

// ─── Import route ─────────────────────────────────────────────────────────────

import { GET } from "../seller/analytics/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const sellerUser = {
  ...mockRegularUser(),
  uid: "seller-uid-001",
  role: "seller",
};

const mockProducts = [
  {
    id: "prod-1",
    title: "Watch",
    sellerId: "seller-uid-001",
    totalOrders: 5,
    totalRevenue: 10000,
    viewCount: 200,
  },
  {
    id: "prod-2",
    title: "Bag",
    sellerId: "seller-uid-001",
    totalOrders: 2,
    totalRevenue: 3600,
    viewCount: 120,
  },
];

const now = new Date();
const mockOrders = [
  {
    id: "ord-1",
    productId: "prod-1",
    totalPrice: 2500,
    status: "delivered",
    createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
  },
  {
    id: "ord-2",
    productId: "prod-1",
    totalPrice: 3000,
    status: "delivered",
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/seller/analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(sellerUser);
    mockFindBySeller.mockResolvedValue(mockProducts);
    mockFindByProduct.mockResolvedValue(mockOrders);
  });

  it("returns 401 without authentication", async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { statusCode: 401 }),
    );
    const { status } = await parseResponse(
      await GET(buildRequest("/api/seller/analytics")),
    );
    expect(status).toBe(401);
  });

  it("returns analytics data for seller", async () => {
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/seller/analytics")),
    );
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns summary, monthlyRevenue, and topProducts keys", async () => {
    const { body } = await parseResponse(
      await GET(buildRequest("/api/seller/analytics")),
    );
    expect(body.data.summary).toBeDefined();
    expect(body.data.revenueByMonth).toBeDefined();
    expect(body.data.topProducts).toBeDefined();
  });

  it("scopes analytics to current seller's uid", async () => {
    await GET(buildRequest("/api/seller/analytics"));
    expect(mockFindBySeller).toHaveBeenCalledWith("seller-uid-001");
  });

  it("returns zeros when seller has no products", async () => {
    mockFindBySeller.mockResolvedValue([]);
    const { body } = await parseResponse(
      await GET(buildRequest("/api/seller/analytics")),
    );
    expect(body.data.summary.totalOrders).toBe(0);
    expect(body.data.summary.totalRevenue).toBe(0);
  });
});
