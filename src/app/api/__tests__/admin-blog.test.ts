/**
 * @jest-environment node
 */

/**
 * Admin Blog API Tests
 *
 * GET  /api/admin/blog
 * POST /api/admin/blog
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
      const user = (global as any).__mockAdminBlogUser ?? null;
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
              {
                success: false,
                error: "Validation failed",
                issues: result.error.issues,
              },
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

const mockBlogFindAll = jest.fn();
const mockBlogListAll = jest.fn();
const mockBlogCreate = jest.fn();

jest.mock("@/repositories", () => ({
  blogRepository: {
    findAll: (...args: unknown[]) => mockBlogFindAll(...args),
    listAll: (...args: unknown[]) => mockBlogListAll(...args),
    create: (...args: unknown[]) => mockBlogCreate(...args),
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

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { REQUIRED_FIELD: "This field is required" },
  },
  SUCCESS_MESSAGES: {
    BLOG: { CREATED: "Post created" },
  },
}));

// ─── Import routes ────────────────────────────────────────────────────────────

import { GET, POST } from "../admin/blog/route";

// ─── Mock data ────────────────────────────────────────────────────────────────

const allPosts = [
  { id: "post-1", title: "Hello", status: "published", isFeatured: true },
  { id: "post-2", title: "Draft post", status: "draft", isFeatured: false },
];

const sieveResult = {
  items: allPosts,
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

const validPostBody = {
  title: "New Post",
  slug: "new-post",
  excerpt: "Short excerpt here",
  content: "Full content here",
  category: "news",
  authorId: "admin-uid-001",
  authorName: "Admin User",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/blog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminBlogUser = mockAdminUser();
    mockBlogFindAll.mockResolvedValue(allPosts);
    mockBlogListAll.mockResolvedValue(sieveResult);
  });

  afterEach(() => {
    delete (global as any).__mockAdminBlogUser;
  });

  it("returns 403 for non-admin", async () => {
    (global as any).__mockAdminBlogUser = mockRegularUser();
    const req = buildRequest("/api/admin/blog");
    const { status } = await parseResponse(await GET(req));
    expect(status).toBe(403);
  });

  it("returns all articles including drafts", async () => {
    const req = buildRequest("/api/admin/blog");
    const { status, body } = await parseResponse(await GET(req));
    expect(status).toBe(200);
    expect(body.data.posts).toHaveLength(2);
  });

  it("includes summary stats in meta", async () => {
    const req = buildRequest("/api/admin/blog");
    const { body } = await parseResponse(await GET(req));
    expect(body.data.meta.published).toBe(1);
    expect(body.data.meta.drafts).toBe(1);
    expect(body.data.meta.featured).toBe(1);
  });
});

describe("POST /api/admin/blog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockAdminBlogUser = mockAdminUser();
    mockBlogCreate.mockResolvedValue({ id: "post-new", ...validPostBody });
  });

  afterEach(() => {
    delete (global as any).__mockAdminBlogUser;
  });

  it("creates article and returns 200", async () => {
    const req = buildRequest("/api/admin/blog", {
      method: "POST",
      body: validPostBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(200);
  });

  it("returns 422 when required fields are missing", async () => {
    const req = buildRequest("/api/admin/blog", {
      method: "POST",
      body: { title: "Only Title" },
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(422);
  });

  it("returns 403 for non-admin", async () => {
    (global as any).__mockAdminBlogUser = mockRegularUser();
    const req = buildRequest("/api/admin/blog", {
      method: "POST",
      body: validPostBody,
    });
    const { status } = await parseResponse(await POST(req));
    expect(status).toBe(403);
  });
});
