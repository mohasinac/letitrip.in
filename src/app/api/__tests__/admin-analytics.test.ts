/**
 * @jest-environment node
 */

/**
 * Admin Analytics API Tests
 *
 * GET /api/admin/analytics
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockRegularUser,
} from "./helpers";

// ─── createApiHandler mock ───────────────────────────────────────────────────

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => {
    const handler = opts.handler;
    return async (req: any, ctx?: any) => {
      const { NextResponse } = require("next/server");
      const user = (global as any).__mockAdminAnalyticsUser ?? null;
      if (opts.auth && !user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
      const requiredRoles: string[] = opts.roles ?? [];
      if (requiredRoles.length && user && !requiredRoles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
      try {
        return await handler({ request: req, user }, ctx);
      } catch (error: any) {
        return NextResponse.json(
          { success: false, error: error?.message },
          { status: error?.statusCode || 500 },
        );
      }
    };
  },
}));

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockOrderFindAll = jest.fn();
const mockProductFindAll = jest.fn();

jest.mock("@/repositories", () => ({
  orderRepository: {
    findAll: (...args: unknown[]) => mockOrderFindAll(...args),
  },
  productRepository: {
    findAll: (...args: unknown[]) => mockProductFindAll(...args),
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

import { GET } from "../admin/analytics/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const now = new Date();
const mockOrders = [
  {
    id: "ord-1",
    productId: "prod-1",
    productTitle: "Watch",
    totalPrice: 2500,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 5),
  },
  {
    id: "ord-2",
    productId: "prod-2",
    productTitle: "Bag",
    totalPrice: 1200,
    createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 10),
  },
];

const mockProducts = [
  { id: "prod-1", title: "Watch", mainImage: "watch.jpg" },
  { id: "prod-2", title: "Bag", mainImage: "bag.jpg" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminAnalyticsUser = mockAdminUser();
    mockOrderFindAll.mockResolvedValue(mockOrders);
    mockProductFindAll.mockResolvedValue(mockProducts);
  });

  afterEach(() => {
    delete (global as any).__mockAdminAnalyticsUser;
  });

  it("returns 403 for non-admin", async () => {
    (global as any).__mockAdminAnalyticsUser = mockRegularUser();
    const { status } = await parseResponse(
      await GET(buildRequest("/api/admin/analytics")),
    );
    expect(status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    (global as any).__mockAdminAnalyticsUser = null;
    const { status } = await parseResponse(
      await GET(buildRequest("/api/admin/analytics")),
    );
    expect(status).toBe(401);
  });

  it("returns analytics with summary, ordersByMonth, topProducts", async () => {
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/admin/analytics")),
    );
    expect(status).toBe(200);
    expect(body.data.summary).toBeDefined();
    expect(body.data.ordersByMonth).toBeDefined();
    expect(body.data.topProducts).toBeDefined();
  });

  it("summary contains totalOrders and totalRevenue as numbers", async () => {
    const { body } = await parseResponse(
      await GET(buildRequest("/api/admin/analytics")),
    );
    const { summary } = body.data;
    expect(typeof summary.totalOrders).toBe("number");
    expect(typeof summary.totalRevenue).toBe("number");
  });

  it("computes totalOrders and totalRevenue correctly", async () => {
    const { body } = await parseResponse(
      await GET(buildRequest("/api/admin/analytics")),
    );
    expect(body.data.summary.totalOrders).toBe(2);
    expect(body.data.summary.totalRevenue).toBe(3700);
  });

  it("returns zero totals when there are no orders", async () => {
    mockOrderFindAll.mockResolvedValue([]);
    const { body } = await parseResponse(
      await GET(buildRequest("/api/admin/analytics")),
    );
    expect(body.data.summary.totalOrders).toBe(0);
    expect(body.data.summary.totalRevenue).toBe(0);
  });

  it("ordersByMonth has 12 entries", async () => {
    const { body } = await parseResponse(
      await GET(buildRequest("/api/admin/analytics")),
    );
    expect(body.data.ordersByMonth).toHaveLength(12);
  });
});
