/**
 * @jest-environment node
 */

/**
 * Admin Users API Tests
 *
 * GET  /api/admin/users         - list with Sieve
 * PATCH /api/admin/users/[uid]  - update role / disabled
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockRegularUser,
} from "./helpers";

// ─── createApiHandler mock ────────────────────────────────────────────────────

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => {
    const handler = opts.handler;
    return async (req: any, ctx?: any) => {
      const { NextResponse } = require("next/server");
      const user = (global as any).__mockAdminUsersUser ?? null;
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

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockUserList = jest.fn();
const mockUserFindById = jest.fn();

jest.mock("@/repositories", () => ({
  userRepository: {
    list: (...args: unknown[]) => mockUserList(...args),
    findById: (...args: unknown[]) => mockUserFindById(...args),
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
    }
  }
  class AuthorizationError extends AppError {
    constructor(m: string) {
      super(403, m, "FORBIDDEN");
    }
  }
  class NotFoundError extends AppError {
    constructor(m: string) {
      super(404, m, "NOT_FOUND");
    }
  }
  return { AppError, AuthorizationError, NotFoundError };
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
  successResponse: (data?: unknown, message?: string) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status: 200 });
  },
  errorResponse: (message: string, status = 400) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: message }, { status });
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getNumberParam: (_params: any, key: string, def: number) => def,
  getStringParam: (_params: any, key: string) => null,
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    AUTH: { FORBIDDEN: "Forbidden", UNAUTHORIZED: "Unauthorized" },
    USER: {
      NOT_FOUND: "User not found",
      FETCH_FAILED: "Failed to fetch users",
    },
  },
  SUCCESS_MESSAGES: { USER: { UPDATED: "User updated" } },
}));

import { GET } from "../admin/users/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setUser(user: any) {
  (global as any).__mockAdminUsersUser = user;
}

afterEach(() => {
  delete (global as any).__mockAdminUsersUser;
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/users", () => {
  it("returns 403 for non-admin (regular user)", async () => {
    setUser(mockRegularUser());
    const req = buildRequest("/api/admin/users");
    const res = await GET(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(403);
  });

  it("returns 401 when no user is authenticated", async () => {
    setUser(null);
    const req = buildRequest("/api/admin/users");
    const res = await GET(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns paginated user list for admin", async () => {
    setUser(mockAdminUser());
    mockUserList.mockResolvedValueOnce({
      items: [
        { uid: "u1", email: "a@b.com", role: "user", displayName: "User 1" },
      ],
      total: 1,
      page: 1,
      pageSize: 100,
      totalPages: 1,
      hasMore: false,
    });
    const req = buildRequest("/api/admin/users");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUserList).toHaveBeenCalled();
  });

  it("forwards Sieve params to userRepository.list", async () => {
    setUser(mockAdminUser());
    mockUserList.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 100,
      totalPages: 0,
      hasMore: false,
    });
    const req = buildRequest(
      "/api/admin/users?filters=role==admin&sorts=-createdAt",
    );
    await GET(req);
    expect(mockUserList).toHaveBeenCalledWith(
      expect.objectContaining({ sorts: expect.any(String) }),
    );
  });
});
