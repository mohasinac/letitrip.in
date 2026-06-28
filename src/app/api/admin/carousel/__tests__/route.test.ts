/**
 * Tests for GET/POST /api/admin/carousel
 * GET: Lists carousel slides. Requires admin:carousel:read (ROLES_ADMIN_MOD).
 * POST: Creates a slide. Requires admin:carousel:write (ROLES_ADMIN_ONLY).
 *       Validates createSlideSchema.
 *       createdBy set from user.uid.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; permissions?: string[] } | null = null;

const {
  mockCarouselList,
  mockCarouselCreate,
} = vi.hoisted(() => ({
  mockCarouselList: vi.fn(),
  mockCarouselCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  carouselRepository: {
    list: mockCarouselList,
    create: mockCarouselCreate,
  },
  sortBy: (field: string, dir = "DESC") => `${dir === "DESC" ? "-" : ""}${field}`,
  CAROUSEL_FIELDS: { ORDER: "order" },
  getNumberParam: (params: URLSearchParams, key: string, def: number) =>
    Number(params.get(key) ?? def),
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (params: URLSearchParams, key: string) => params.get(key) ?? "",
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/admin/carousel");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};
const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockSlide = { id: "slide-hero", title: "Hero Slide", order: 0, active: true };
const validSlideBody = {
  title: "New Hero Banner",
  background: { type: "image", url: "/media/banner.jpg" },
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockCarouselList.mockResolvedValue({ items: [mockSlide], total: 1, page: 1, pageSize: 25 });
  mockCarouselCreate.mockResolvedValue(mockSlide);
});

describe("GET /api/admin/carousel", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD includes moderator)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
  });

  it("admin → 200 with carousel slides", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(1);
  });

  it("calls carouselRepository.list with pagination params", async () => {
    await GET(makeGetReq({ page: "2", pageSize: "10" }) as never);
    expect(mockCarouselList).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      pageSize: 10,
    }));
  });
});

describe("POST /api/admin/carousel", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validSlideBody) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (only ROLES_ADMIN_ONLY for write)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq(validSlideBody) as never);
    expect(res.status).toBe(403);
  });

  it("missing title → 400", async () => {
    const res = await POST(makePostReq({ background: { type: "image" } }) as never);
    expect(res.status).toBe(400);
  });

  it("slide created with createdBy=user.uid", async () => {
    await POST(makePostReq(validSlideBody) as never);
    expect(mockCarouselCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: "admin-uid" }),
    );
  });

  it("success → 201 with created slide", async () => {
    const res = await POST(makePostReq(validSlideBody) as never);
    expect(res.status).toBe(201);
  });
});
