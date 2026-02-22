/**
 * @jest-environment node
 */

/**
 * Admin Coupons API Tests
 *
 * GET  /api/admin/coupons
 * POST /api/admin/coupons
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
      const user = (global as any).__mockAdminCouponsUser ?? null;
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

const mockCouponList = jest.fn();
const mockCouponGetByCode = jest.fn();
const mockCouponCreate = jest.fn();

jest.mock("@/repositories", () => ({
  couponsRepository: {
    list: (...args: unknown[]) => mockCouponList(...args),
    getCouponByCode: (...args: unknown[]) => mockCouponGetByCode(...args),
    create: (...args: unknown[]) => mockCouponCreate(...args),
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
  errorResponse: (message: string, status = 400) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: message }, { status });
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

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { FAILED: "Validation failed" },
    COUPON: { DUPLICATE_CODE: "Coupon code already exists" },
  },
  SUCCESS_MESSAGES: { COUPON: { CREATED: "Coupon created" } },
}));

jest.mock("@/db/schema", () => ({}));

// ─── Import routes ────────────────────────────────────────────────────────────

import { GET, POST } from "../admin/coupons/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCouponsResult = {
  items: [
    {
      id: "coupon-1",
      code: "SAVE10",
      type: "percentage",
      validity: { isActive: true },
    },
    {
      id: "coupon-2",
      code: "FLAT50",
      type: "fixed",
      validity: { isActive: false },
    },
  ],
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

const validCouponBody = {
  code: "NEWCODE",
  name: "New Coupon",
  type: "percentage",
  discount: { value: 15 },
  usage: { currentUsage: 0 },
  validity: { startDate: "2026-01-01", isActive: true },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/coupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminCouponsUser = mockAdminUser();
    mockCouponList.mockResolvedValue(mockCouponsResult);
  });

  afterEach(() => {
    delete (global as any).__mockAdminCouponsUser;
  });

  it("returns 403 for non-admin", async () => {
    (global as any).__mockAdminCouponsUser = mockRegularUser();
    const { status } = await parseResponse(
      await GET(buildRequest("/api/admin/coupons")),
    );
    expect(status).toBe(403);
  });

  it("returns coupon list with Sieve", async () => {
    const { status, body } = await parseResponse(
      await GET(buildRequest("/api/admin/coupons")),
    );
    expect(status).toBe(200);
    expect(body.data.coupons).toHaveLength(2);
  });

  it("forwards filters and sorts to couponsRepository.list", async () => {
    await GET(
      buildRequest("/api/admin/coupons?filters=code==SAVE10&sorts=-createdAt"),
    );
    expect(mockCouponList).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "code==SAVE10", sorts: "-createdAt" }),
    );
  });
});

describe("POST /api/admin/coupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminCouponsUser = mockAdminUser();
    mockCouponGetByCode.mockResolvedValue(null);
    mockCouponCreate.mockResolvedValue({
      id: "coupon-new",
      ...validCouponBody,
    });
  });

  afterEach(() => {
    delete (global as any).__mockAdminCouponsUser;
  });

  it("creates coupon and returns 200", async () => {
    const req = buildRequest("/api/admin/coupons", {
      method: "POST",
      body: validCouponBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(200);
  });

  it("returns 400 when validation fails", async () => {
    const req = buildRequest("/api/admin/coupons", {
      method: "POST",
      body: { code: "X" },
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(400);
  });

  it("returns 409 when coupon code already exists", async () => {
    mockCouponGetByCode.mockResolvedValue({ id: "existing" });
    const req = buildRequest("/api/admin/coupons", {
      method: "POST",
      body: validCouponBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(409);
  });

  it("returns 403 for non-admin", async () => {
    (global as any).__mockAdminCouponsUser = mockRegularUser();
    const req = buildRequest("/api/admin/coupons", {
      method: "POST",
      body: validCouponBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(403);
  });
});
