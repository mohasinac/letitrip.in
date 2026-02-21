/**
 * @jest-environment node
 */

/**
 * User Orders API Tests
 *
 * GET /api/user/orders
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

const mockFindByUser = jest.fn();
jest.mock("@/repositories", () => ({
  orderRepository: {
    findByUser: (...args: unknown[]) => mockFindByUser(...args),
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (params: URLSearchParams, key: string) => params.get(key),
}));

jest.mock("@/db/schema", () => ({
  // OrderStatus type — only the values matter here for type checking
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
  successResponse: (data?: unknown, message?: string) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status: 200 });
  },
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    AUTH: { UNAUTHORIZED: "Unauthorized" },
    ORDER: { FETCH_FAILED: "Failed to fetch orders" },
  },
  SUCCESS_MESSAGES: {},
}));

import { GET } from "../user/orders/route";

// ─── Test Data ────────────────────────────────────────────────────────────────

const AUTH_USER = { uid: "user-123", email: "user@example.com" };

function makeOrder(id: string, status: string, daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id,
    userId: AUTH_USER.uid,
    status,
    orderDate: date.toISOString(),
    total: 100,
  };
}

const MOCK_ORDERS = [
  makeOrder("order-1", "pending", 1),
  makeOrder("order-2", "shipped", 2),
  makeOrder("order-3", "delivered", 5),
  makeOrder("order-4", "pending", 0),
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("User Orders API — GET /api/user/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue(AUTH_USER);
    mockFindByUser.mockResolvedValue(MOCK_ORDERS);
  });

  it("returns 200 with orders and total", async () => {
    const req = buildRequest("/api/user/orders", { method: "GET" });
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("orders");
    expect(body.data).toHaveProperty("total");
  });

  it("calls orderRepository.findByUser with the authenticated uid", async () => {
    const req = buildRequest("/api/user/orders", { method: "GET" });
    await GET(req);

    expect(mockFindByUser).toHaveBeenCalledWith(AUTH_USER.uid);
  });

  it("returns orders sorted by orderDate descending", async () => {
    const req = buildRequest("/api/user/orders", { method: "GET" });
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const orders = body.data.orders;
    for (let i = 0; i < orders.length - 1; i++) {
      const a = new Date(orders[i].orderDate).getTime();
      const b = new Date(orders[i + 1].orderDate).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });

  it("filters orders by status when ?status= query param is provided", async () => {
    const req = buildRequest("/api/user/orders?status=pending", {
      method: "GET",
    });
    const res = await GET(req);
    const { body } = await parseResponse(res);

    // Only pending orders should be returned
    body.data.orders.forEach((order: any) => {
      expect(order.status).toBe("pending");
    });
  });

  it("ignores invalid status values and returns all orders", async () => {
    const req = buildRequest("/api/user/orders?status=not_a_real_status", {
      method: "GET",
    });
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.total).toBe(MOCK_ORDERS.length);
  });

  it("returns 401 when not authenticated", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockRequireAuth.mockRejectedValue(new AuthenticationError("Unauthorized"));

    const req = buildRequest("/api/user/orders", { method: "GET" });
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
