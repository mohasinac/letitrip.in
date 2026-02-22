/**
 * @jest-environment node
 */

/**
 * Admin Newsletter API Tests
 *
 * GET    /api/admin/newsletter
 * PATCH  /api/admin/newsletter/[id]
 * DELETE /api/admin/newsletter/[id]
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
      const user = (global as any).__mockAdminNewsletterUser ?? null;
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

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockNewsletterList = jest.fn();
const mockNewsletterGetStats = jest.fn();
const mockNewsletterFindById = jest.fn();
const mockNewsletterUnsubscribe = jest.fn();
const mockNewsletterResubscribe = jest.fn();
const mockNewsletterDelete = jest.fn();

jest.mock("@/repositories", () => ({
  newsletterRepository: {
    list: (...args: unknown[]) => mockNewsletterList(...args),
    getStats: (...args: unknown[]) => mockNewsletterGetStats(...args),
    findById: (...args: unknown[]) => mockNewsletterFindById(...args),
    unsubscribeById: (...args: unknown[]) => mockNewsletterUnsubscribe(...args),
    resubscribeById: (...args: unknown[]) => mockNewsletterResubscribe(...args),
    delete: (...args: unknown[]) => mockNewsletterDelete(...args),
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

// ─── Import routes under test ─────────────────────────────────────────────────

import { GET } from "../admin/newsletter/route";
import { PATCH, DELETE } from "../admin/newsletter/[id]/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockSubscribers = [
  { id: "sub-1", email: "user1@example.com", status: "active" },
  { id: "sub-2", email: "user2@example.com", status: "unsubscribed" },
];

const mockStats = { total: 2, active: 1, unsubscribed: 1, sources: {} };

// ─── Tests: GET /api/admin/newsletter ────────────────────────────────────────

describe("GET /api/admin/newsletter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminNewsletterUser = mockAdminUser();
    mockNewsletterList.mockResolvedValue({
      items: mockSubscribers,
      total: 2,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    });
    mockNewsletterGetStats.mockResolvedValue(mockStats);
  });

  afterEach(() => {
    delete (global as any).__mockAdminNewsletterUser;
  });

  it("returns 403 for non-admin user", async () => {
    (global as any).__mockAdminNewsletterUser = {
      ...mockRegularUser(),
      role: "seller",
    };

    const req = buildRequest("/api/admin/newsletter");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("returns 401 without session", async () => {
    (global as any).__mockAdminNewsletterUser = null;

    const req = buildRequest("/api/admin/newsletter");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns paginated subscriber list for admin", async () => {
    const req = buildRequest("/api/admin/newsletter");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.subscribers).toHaveLength(2);
  });

  it("passes Sieve params to newsletterRepository.list", async () => {
    const req = buildRequest(
      "/api/admin/newsletter?filters=status==active&sorts=-createdAt",
    );
    await GET(req);

    expect(mockNewsletterList).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: "status==active",
        sorts: "-createdAt",
      }),
    );
  });

  it("includes stats in response", async () => {
    const req = buildRequest("/api/admin/newsletter");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.stats).toBeDefined();
  });
});

// ─── Tests: PATCH /api/admin/newsletter/[id] ─────────────────────────────────

describe("PATCH /api/admin/newsletter/[id]", () => {
  const ctx = { params: Promise.resolve({ id: "sub-1" }) };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminNewsletterUser = mockAdminUser();
    mockNewsletterFindById.mockResolvedValue(mockSubscribers[0]);
    mockNewsletterUnsubscribe.mockResolvedValue(undefined);
    mockNewsletterResubscribe.mockResolvedValue(undefined);
  });

  it("unsubscribes a subscriber when status=unsubscribed", async () => {
    const req = buildRequest("/api/admin/newsletter/sub-1", {
      method: "PATCH",
      body: { status: "unsubscribed" },
    });
    const res = await PATCH(req, ctx);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(mockNewsletterUnsubscribe).toHaveBeenCalledWith("sub-1");
  });

  it("resubscribes a subscriber when status=active", async () => {
    const req = buildRequest("/api/admin/newsletter/sub-1", {
      method: "PATCH",
      body: { status: "active" },
    });
    const res = await PATCH(req, ctx);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
    expect(mockNewsletterResubscribe).toHaveBeenCalledWith("sub-1");
  });

  it("returns 404 when subscriber is not found", async () => {
    mockNewsletterFindById.mockResolvedValue(null);

    const req = buildRequest("/api/admin/newsletter/nonexistent", {
      method: "PATCH",
      body: { status: "unsubscribed" },
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 422 for invalid status value", async () => {
    const req = buildRequest("/api/admin/newsletter/sub-1", {
      method: "PATCH",
      body: { status: "invalid-status" },
    });
    const res = await PATCH(req, ctx);
    const { status } = await parseResponse(res);

    expect(status).toBe(422);
  });
});

// ─── Tests: DELETE /api/admin/newsletter/[id] ────────────────────────────────

describe("DELETE /api/admin/newsletter/[id]", () => {
  const ctx = { params: Promise.resolve({ id: "sub-1" }) };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminNewsletterUser = mockAdminUser();
    mockNewsletterFindById.mockResolvedValue(mockSubscribers[0]);
    mockNewsletterDelete.mockResolvedValue(undefined);
  });

  it("permanently removes subscriber record", async () => {
    const req = buildRequest("/api/admin/newsletter/sub-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, ctx);
    const { status } = await parseResponse(res);

    expect(status).toBe(200);
    expect(mockNewsletterDelete).toHaveBeenCalledWith("sub-1");
  });

  it("returns 404 when subscriber does not exist", async () => {
    mockNewsletterFindById.mockResolvedValue(null);

    const req = buildRequest("/api/admin/newsletter/nonexistent", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });
});
