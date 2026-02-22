/**
 * @jest-environment node
 */

/**
 * Admin Payouts API Tests
 *
 * GET /api/admin/payouts
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
      const user = (global as any).__mockAdminPayoutsUser ?? null;
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

const mockPayoutFindAll = jest.fn();
const mockPayoutList = jest.fn();

jest.mock("@/repositories", () => ({
  payoutRepository: {
    findAll: (...args: unknown[]) => mockPayoutFindAll(...args),
    list: (...args: unknown[]) => mockPayoutList(...args),
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

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getStringParam: (p: any, k: string) => p.get(k) ?? undefined,
  getNumberParam: (p: any, k: string, def: number) => {
    const v = p.get(k);
    return v ? Number(v) : def;
  },
}));

// ─── Import route ─────────────────────────────────────────────────────────────

import { GET } from "../admin/payouts/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockPayouts = [
  { id: "pay-1", sellerId: "seller-1", amount: 5000, status: "pending" },
  { id: "pay-2", sellerId: "seller-2", amount: 3000, status: "approved" },
  { id: "pay-3", sellerId: "seller-3", amount: 1500, status: "rejected" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/payouts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminPayoutsUser = mockAdminUser();
    mockPayoutFindAll.mockResolvedValue(mockPayouts);
    mockPayoutList.mockResolvedValue({
      items: mockPayouts,
      total: 3,
      page: 1,
      pageSize: 50,
      totalPages: 1,
      hasMore: false,
    });
  });

  afterEach(() => {
    delete (global as any).__mockAdminPayoutsUser;
  });

  it("returns 403 for non-admin", async () => {
    (global as any).__mockAdminPayoutsUser = mockRegularUser();
    const { status } = await parseResponse(
      await GET(buildRequest("/api/admin/payouts")),
    );
    expect(status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    (global as any).__mockAdminPayoutsUser = null;
    const { status } = await parseResponse(
      await GET(buildRequest("/api/admin/payouts")),
    );
    expect(status).toBe(401);
  });

  it("returns payout list with summary stats", async () => {
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/admin/payouts")),
    );
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.payouts).toBeDefined();
  });

  it("summary includes pending count and total amount", async () => {
    const { body } = await parseResponse(
      await GET(buildRequest("/api/admin/payouts")),
    );
    expect(body.data.summary).toBeDefined();
    expect(body.data.summary.pending).toBe(1);
    expect(body.data.summary.totalAmount).toBe(9500);
  });

  it("returns empty list when no payouts exist", async () => {
    mockPayoutFindAll.mockResolvedValue([]);
    mockPayoutList.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
      hasMore: false,
    });
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/admin/payouts")),
    );
    expect(status).toBe(200);
    expect(body.data.payouts).toHaveLength(0);
  });
});
