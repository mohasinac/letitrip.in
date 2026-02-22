/**
 * @jest-environment node
 */

/**
 * Admin Orders API Tests
 *
 * GET    /api/admin/orders
 * GET    /api/admin/orders/[id]
 * PATCH  /api/admin/orders/[id]
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockRegularUser,
} from "./helpers";

// ─── Global mock user for createApiHandler ────────────────────────────────────

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => {
    const handler = opts.handler;
    return async (req: any, ctx?: any) => {
      const { NextResponse } = require("next/server");
      const user = (global as any).__mockAdminOrdersUser ?? null;
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
      let body: any = undefined;
      if (opts.schema) {
        try {
          const rawBody = await req.json().catch(() => ({}));
          const result = opts.schema.safeParse(rawBody);
          if (!result.success) {
            return NextResponse.json(
              { success: false, error: "Validation failed" },
              { status: 422 },
            );
          }
          body = result.data;
        } catch {
          body = undefined;
        }
      }
      try {
        return await handler({ request: req, user, body }, ctx);
      } catch (error: any) {
        const { NextResponse } = require("next/server");
        const status = error?.statusCode || 500;
        return NextResponse.json(
          { success: false, error: error?.message || "Internal error" },
          { status },
        );
      }
    };
  },
}));

// ─── Direct-auth mock (for [id] route that uses getAuthenticatedUser directly)

const mockGetAuthenticatedUser = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

const mockRequireRole = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args),
}));

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockOrderListAll = jest.fn();
const mockOrderFindById = jest.fn();
const mockOrderUpdate = jest.fn();
const mockUserFindById = jest.fn();

jest.mock("@/repositories", () => ({
  orderRepository: {
    listAll: (...args: unknown[]) => mockOrderListAll(...args),
    findById: (...args: unknown[]) => mockOrderFindById(...args),
    update: (...args: unknown[]) => mockOrderUpdate(...args),
  },
  userRepository: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
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
      this.name = this.constructor.name;
    }
  }
  class AuthenticationError extends AppError {
    constructor(msg: string) {
      super(401, msg, "AUTH_ERROR");
    }
  }
  class AuthorizationError extends AppError {
    constructor(msg: string) {
      super(403, msg, "FORBIDDEN");
    }
  }
  class ValidationError extends AppError {
    constructor(msg: string) {
      super(422, msg, "VALIDATION_ERROR");
    }
  }
  class NotFoundError extends AppError {
    constructor(msg: string) {
      super(404, msg, "NOT_FOUND");
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
    const status = error?.statusCode || 500;
    return NextResponse.json(
      { success: false, error: error?.message || "Internal error" },
      { status },
    );
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data: any, _message?: string, status = 200) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data }, { status });
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getStringParam: (params: any, key: string) => params.get(key) ?? undefined,
  getNumberParam: (params: any, key: string, fallback: number) => {
    const val = params.get(key);
    return val ? Number(val) : fallback;
  },
}));

// ─── Import route under test ──────────────────────────────────────────────────

import { GET } from "../admin/orders/route";
import { GET as GET_BY_ID, PATCH } from "../admin/orders/[id]/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockOrders = [
  {
    id: "order-1",
    status: "pending",
    userId: "user-1",
    totalPrice: 2500,
    createdAt: new Date("2026-01-10"),
  },
  {
    id: "order-2",
    status: "delivered",
    userId: "user-2",
    totalPrice: 1200,
    createdAt: new Date("2026-01-15"),
  },
];

// ─── Tests: GET /api/admin/orders ─────────────────────────────────────────────

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminOrdersUser = mockAdminUser();
    mockOrderListAll.mockResolvedValue({
      items: mockOrders,
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    });
  });

  afterEach(() => {
    delete (global as any).__mockAdminOrdersUser;
  });

  it("returns 403 for non-admin user", async () => {
    (global as any).__mockAdminOrdersUser = {
      ...mockRegularUser(),
      role: "seller",
    };

    const req = buildRequest("/api/admin/orders");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("returns 401 without session", async () => {
    (global as any).__mockAdminOrdersUser = null;

    const req = buildRequest("/api/admin/orders");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns all orders with Sieve pagination for admin", async () => {
    const req = buildRequest("/api/admin/orders");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.orders).toHaveLength(2);
  });

  it("passes Sieve params to orderRepository.listAll", async () => {
    const req = buildRequest(
      "/api/admin/orders?filters=status==pending&sorts=-createdAt&page=2&pageSize=25",
    );
    await GET(req);

    expect(mockOrderListAll).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: "status==pending",
        sorts: "-createdAt",
        page: 2,
        pageSize: 25,
      }),
    );
  });

  it("includes pagination meta in response", async () => {
    const req = buildRequest("/api/admin/orders");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.meta.total).toBe(2);
    expect(body.data.meta.page).toBe(1);
  });
});

// ─── Tests: GET /api/admin/orders/[id] ───────────────────────────────────────

describe("GET /api/admin/orders/[id]", () => {
  const ctx = { params: Promise.resolve({ id: "order-1" }) };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminOrdersUser = mockAdminUser();
    mockGetAuthenticatedUser.mockResolvedValue({ uid: "admin-uid-001" });
    mockUserFindById.mockResolvedValue(mockAdminUser());
    mockRequireRole.mockReturnValue(undefined);
    mockOrderFindById.mockResolvedValue(mockOrders[0]);
  });

  it("returns full order detail", async () => {
    const req = buildRequest("/api/admin/orders/order-1");
    const res = await GET_BY_ID(req, ctx);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data).toBeDefined();
  });

  it("returns 404 for unknown orderId", async () => {
    mockOrderFindById.mockResolvedValue(null);

    const req = buildRequest("/api/admin/orders/nonexistent");
    const res = await GET_BY_ID(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 401 without authentication", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const req = buildRequest("/api/admin/orders/order-1");
    const res = await GET_BY_ID(req, ctx);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});

// ─── Tests: PATCH /api/admin/orders/[id] ─────────────────────────────────────

describe("PATCH /api/admin/orders/[id]", () => {
  const ctx = { params: Promise.resolve({ id: "order-1" }) };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminOrdersUser = mockAdminUser();
    mockGetAuthenticatedUser.mockResolvedValue({ uid: "admin-uid-001" });
    mockUserFindById.mockResolvedValue(mockAdminUser());
    mockRequireRole.mockReturnValue(undefined);
    mockOrderFindById.mockResolvedValue(mockOrders[0]);
    mockOrderUpdate.mockResolvedValue({
      ...mockOrders[0],
      status: "confirmed",
    });
  });

  it("updates order status", async () => {
    const req = buildRequest("/api/admin/orders/order-1", {
      method: "PATCH",
      body: { status: "confirmed" },
    });
    const res = await PATCH(req, ctx);
    const { status } = await parseResponse(res);

    expect([200, 201]).toContain(status);
  });

  it("returns 404 when order does not exist", async () => {
    mockOrderFindById.mockResolvedValue(null);

    const req = buildRequest("/api/admin/orders/nonexistent", {
      method: "PATCH",
      body: { status: "confirmed" },
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 400 for invalid status value", async () => {
    const req = buildRequest("/api/admin/orders/order-1", {
      method: "PATCH",
      body: { status: "not-a-valid-status" },
    });
    const res = await PATCH(req, ctx);
    const { status } = await parseResponse(res);

    expect([400, 422]).toContain(status);
  });
});
