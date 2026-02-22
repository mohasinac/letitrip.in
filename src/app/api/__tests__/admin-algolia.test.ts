/**
 * @jest-environment node
 */

/**
 * Admin Algolia Sync API Tests
 *
 * POST /api/admin/algolia/sync
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
      const user = (global as any).__mockAdminAlgoliaUser ?? null;
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

const mockProductFindAll = jest.fn();
jest.mock("@/repositories", () => ({
  productRepository: {
    findAll: (...args: unknown[]) => mockProductFindAll(...args),
  },
}));

const mockIsAlgoliaConfigured = jest.fn();
const mockIndexProducts = jest.fn();
jest.mock("@/lib/search/algolia", () => ({
  isAlgoliaConfigured: () => mockIsAlgoliaConfigured(),
  indexProducts: (...args: unknown[]) => mockIndexProducts(...args),
  ALGOLIA_INDEX_NAME: "test_products",
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

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    ADMIN: { ALGOLIA_NOT_CONFIGURED: "Algolia is not configured" },
  },
  SUCCESS_MESSAGES: { ADMIN: { ALGOLIA_SYNCED: "Sync complete" } },
}));

// ─── Import route ─────────────────────────────────────────────────────────────

import { POST } from "../admin/algolia/sync/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockProducts = [
  { id: "prod-1", title: "Watch", status: "published" },
  { id: "prod-2", title: "Bag", status: "published" },
  { id: "prod-3", title: "Draft Item", status: "draft" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/admin/algolia/sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminAlgoliaUser = mockAdminUser();
    mockIsAlgoliaConfigured.mockReturnValue(true);
    mockProductFindAll.mockResolvedValue(mockProducts);
    mockIndexProducts.mockResolvedValue({ indexed: 2 });
  });

  afterEach(() => {
    delete (global as any).__mockAdminAlgoliaUser;
  });

  it("returns 403 for non-admin", async () => {
    (global as any).__mockAdminAlgoliaUser = mockRegularUser();
    const { status } = await parseResponse(
      await POST(buildRequest("/api/admin/algolia/sync", { method: "POST" })),
    );
    expect(status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    (global as any).__mockAdminAlgoliaUser = null;
    const { status } = await parseResponse(
      await POST(buildRequest("/api/admin/algolia/sync", { method: "POST" })),
    );
    expect(status).toBe(401);
  });

  it("syncs published products and returns synced count", async () => {
    const { status, body } = await parseResponse(
      await POST(buildRequest("/api/admin/algolia/sync", { method: "POST" })),
    );
    expect(status).toBe(200);
    expect(body.data.indexed).toBe(2);
  });

  it("only indexes published products (not drafts)", async () => {
    await POST(buildRequest("/api/admin/algolia/sync", { method: "POST" }));
    expect(mockIndexProducts).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ status: "published" }),
      ]),
    );
    const calledWith = mockIndexProducts.mock.calls[0][0];
    expect(calledWith.every((p: any) => p.status === "published")).toBe(true);
  });

  it("returns 422 when Algolia is not configured", async () => {
    mockIsAlgoliaConfigured.mockReturnValue(false);
    const { status } = await parseResponse(
      await POST(buildRequest("/api/admin/algolia/sync", { method: "POST" })),
    );
    expect(status).toBe(422);
  });

  it("returns 500 when indexProducts throws", async () => {
    mockIndexProducts.mockRejectedValue(new Error("Algolia unreachable"));
    const { status } = await parseResponse(
      await POST(buildRequest("/api/admin/algolia/sync", { method: "POST" })),
    );
    expect(status).toBe(500);
  });
});
