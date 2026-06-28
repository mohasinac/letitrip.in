/**
 * Tests for GET /api/admin/sublisting-categories and POST /api/admin/sublisting-categories
 *
 * GET: ROLES_ANY_STAFF = ["admin", "moderator", "seller"]
 *   - always appends categoryType==sublisting to filters
 *   - pageSize [1,50] default 50
 *   - returns { items, total, page, pageSize, totalPages, hasMore }
 *
 * POST: ROLES_ADMIN_ONLY
 *   - id = categoriesRepository.generateSublistingId(name)
 *   - duplicate check via findBySlugAndType → 409
 *   - categoryType: "sublisting" set on created doc
 *   - parentId optional; when provided, rootId = parentId and parentIds = [parentId]
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockCatList,
  mockFindBySlugAndType,
  mockCreateWithHierarchy,
  mockGenerateSublistingId,
} = vi.hoisted(() => ({
  mockCatList: vi.fn(),
  mockFindBySlugAndType: vi.fn(),
  mockCreateWithHierarchy: vi.fn(),
  mockGenerateSublistingId: vi.fn((name: string) =>
    `sublisting-${name.toLowerCase().replace(/\s+/g, "-")}`,
  ),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ANY_STAFF: ["admin", "moderator", "seller"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  categoriesRepository: {
    list: mockCatList,
    findBySlugAndType: mockFindBySlugAndType,
    createWithHierarchy: mockCreateWithHierarchy,
    generateSublistingId: mockGenerateSublistingId,
  },
  sortBy: (field: string, dir = "ASC") => (dir === "DESC" ? `-${field}` : field),
  CATEGORY_FIELDS: { NAME: "name" },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });

      let body: B | undefined;
      if (opts.schema) {
        let raw: unknown = {};
        try { raw = await request.json(); } catch { /* empty */ }
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = parsed.data;
      }

      return opts.handler({ request, user: _user ?? undefined, body });
    };
  },
}));

import { GET, POST } from "../route";

const mockListResult = {
  items: [{ id: "sublisting-base-set", name: "Base Set", categoryType: "sublisting" }],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCatList.mockResolvedValue(mockListResult);
  mockFindBySlugAndType.mockResolvedValue(null);
  mockCreateWithHierarchy.mockResolvedValue({ id: "sublisting-base-set", name: "Base Set" });
});

describe("GET /api/admin/sublisting-categories", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/sublisting-categories") as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403 (not in ROLES_ANY_STAFF)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(new Request("http://localhost/api/admin/sublisting-categories") as never);
    expect(res.status).toBe(403);
  });

  it("seller → 200 (ROLES_ANY_STAFF includes seller)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/sublisting-categories") as never);
    expect(res.status).toBe(200);
  });

  it("moderator → 200 (ROLES_ANY_STAFF)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/sublisting-categories") as never);
    expect(res.status).toBe(200);
  });

  it("always appends categoryType==sublisting to filters", async () => {
    await GET(new Request("http://localhost/api/admin/sublisting-categories") as never);
    const call = mockCatList.mock.calls[0][0] as { filters: string };
    expect(call.filters).toContain("categoryType==sublisting");
  });

  it("user-provided filters combined with sublisting constraint", async () => {
    await GET(
      new Request("http://localhost/api/admin/sublisting-categories?filters=isActive%3D%3Dtrue") as never,
    );
    const call = mockCatList.mock.calls[0][0] as { filters: string };
    expect(call.filters).toBe("isActive==true,categoryType==sublisting");
  });

  it("default pageSize 50", async () => {
    await GET(new Request("http://localhost/api/admin/sublisting-categories") as never);
    const call = mockCatList.mock.calls[0][0] as { pageSize: string };
    expect(call.pageSize).toBe("50");
  });

  it("pageSize > 50 clamped to 50", async () => {
    await GET(new Request("http://localhost/api/admin/sublisting-categories?pageSize=100") as never);
    const call = mockCatList.mock.calls[0][0] as { pageSize: string };
    expect(call.pageSize).toBe("50");
  });

  it("returns { items, total, page, pageSize, totalPages, hasMore }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/sublisting-categories") as never);
    const json = await res.clone().json() as { data: typeof mockListResult };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.hasMore).toBe(false);
  });
});

describe("POST /api/admin/sublisting-categories", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost/api/admin/sublisting-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ name: "Base Set" }));
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeRequest({ name: "Base Set" }));
    expect(res.status).toBe(403);
  });

  it("seller → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await POST(makeRequest({ name: "Base Set" }));
    expect(res.status).toBe(403);
  });

  it("missing name → 400", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("name > 120 chars → 400", async () => {
    const res = await POST(makeRequest({ name: "A".repeat(121) }));
    expect(res.status).toBe(400);
  });

  it("duplicate name → 409", async () => {
    mockFindBySlugAndType.mockResolvedValue({ id: "sublisting-base-set" });
    const res = await POST(makeRequest({ name: "Base Set" }));
    expect(res.status).toBe(409);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("already exists");
  });

  it("categoryType is 'sublisting' on created document", async () => {
    await POST(makeRequest({ name: "Base Set" }));
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ categoryType: "sublisting" }),
    );
  });

  it("no parentId → rootId = slug, parentIds = []", async () => {
    await POST(makeRequest({ name: "Base Set" }));
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({ parentIds: [], parentId: null }),
    );
  });

  it("with parentId → parentIds = [parentId], rootId = parentId", async () => {
    await POST(makeRequest({ name: "Base Set 1st Edition", parentId: "sublisting-base-set" }));
    expect(mockCreateWithHierarchy).toHaveBeenCalledWith(
      expect.objectContaining({
        parentId: "sublisting-base-set",
        parentIds: ["sublisting-base-set"],
        rootId: "sublisting-base-set",
      }),
    );
  });

  it("success → 200 with created document", async () => {
    const res = await POST(makeRequest({ name: "Base Set" }));
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("sublisting-base-set");
  });
});
