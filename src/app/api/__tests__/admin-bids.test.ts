/**
 * @jest-environment node
 */

/**
 * Admin Bids API Tests
 *
 * GET /api/admin/bids
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
      const user = (global as any).__mockAdminBidsUser ?? null;
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
        const status = error?.statusCode || 500;
        return NextResponse.json(
          { success: false, error: error?.message || "Internal error" },
          { status },
        );
      }
    };
  },
}));

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockBidList = jest.fn();
jest.mock("@/repositories", () => ({
  bidRepository: {
    list: (...args: unknown[]) => mockBidList(...args),
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

import { GET } from "../admin/bids/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockBidsResult = {
  items: [
    { id: "bid-1", productId: "prod-1", bidAmount: 2000, userId: "user-1" },
    { id: "bid-2", productId: "prod-2", bidAmount: 3500, userId: "user-2" },
  ],
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/bids", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminBidsUser = mockAdminUser();
    mockBidList.mockResolvedValue(mockBidsResult);
  });

  afterEach(() => {
    delete (global as any).__mockAdminBidsUser;
  });

  it("returns paginated bid list for admin", async () => {
    const req = buildRequest("/api/admin/bids");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.bids).toHaveLength(2);
  });

  it("returns 403 for regular user", async () => {
    (global as any).__mockAdminBidsUser = mockRegularUser();
    const req = buildRequest("/api/admin/bids");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    (global as any).__mockAdminBidsUser = null;
    const req = buildRequest("/api/admin/bids");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("forwards Sieve params to bidRepository.list", async () => {
    const req = buildRequest(
      "/api/admin/bids?filters=status==active&sorts=-bidDate&page=2&pageSize=10",
    );
    await GET(req);

    expect(mockBidList).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "status==active", sorts: "-bidDate" }),
    );
  });

  it("passes raw filters string through to bidRepository.list", async () => {
    const req = buildRequest("/api/admin/bids?filters=productId==prod-999");
    await GET(req);

    expect(mockBidList).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "productId==prod-999" }),
    );
  });
});
