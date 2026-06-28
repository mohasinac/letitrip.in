/**
 * Tests for GET /api/admin/navigation and POST /api/admin/navigation
 *
 * Nav items stored inside siteSettings.navbarConfig.navItems array.
 * GET: ROLES_ADMIN_MOD — reads from siteSettingsRepository.getSingleton()
 * POST: ROLES_ADMIN_ONLY — appends new item; id generated as `nav-{label-slug}`
 *   order defaults to max existing order + 1
 *   isVisible defaults to true
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockGetSingleton,
  mockUpdateSingleton,
} = vi.hoisted(() => ({
  mockGetSingleton: vi.fn(),
  mockUpdateSingleton: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  siteSettingsRepository: {
    getSingleton: mockGetSingleton,
    updateSingleton: mockUpdateSingleton,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
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

const existingItems = [
  { id: "nav-home", label: "Home", href: "/", order: 0, isVisible: true },
  { id: "nav-products", label: "Products", href: "/products", order: 1, isVisible: true },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockGetSingleton.mockResolvedValue({ navbarConfig: { navItems: existingItems } });
  mockUpdateSingleton.mockResolvedValue(undefined);
});

describe("GET /api/admin/navigation", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/navigation") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/navigation") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/navigation") as never);
    expect(res.status).toBe(200);
  });

  it("returns { items, total } from siteSettings.navbarConfig.navItems", async () => {
    const res = await GET(new Request("http://localhost/api/admin/navigation") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("empty navItems → { items: [], total: 0 }", async () => {
    mockGetSingleton.mockResolvedValue({ navbarConfig: { navItems: [] } });
    const res = await GET(new Request("http://localhost/api/admin/navigation") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });

  it("missing navbarConfig → { items: [], total: 0 }", async () => {
    mockGetSingleton.mockResolvedValue({});
    const res = await GET(new Request("http://localhost/api/admin/navigation") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
  });
});

describe("POST /api/admin/navigation", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost/api/admin/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ label: "Events", href: "/events" }));
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeRequest({ label: "Events", href: "/events" }));
    expect(res.status).toBe(403);
  });

  it("missing label → 400", async () => {
    const res = await POST(makeRequest({ href: "/events" }));
    expect(res.status).toBe(400);
  });

  it("missing href → 400", async () => {
    const res = await POST(makeRequest({ label: "Events" }));
    expect(res.status).toBe(400);
  });

  it("id generated as nav-{label-slug}", async () => {
    const res = await POST(makeRequest({ label: "New Arrivals", href: "/new-arrivals" }));
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("nav-new-arrivals");
  });

  it("id uses lowercase hyphenated label", async () => {
    const res = await POST(makeRequest({ label: "Hot Deals", href: "/deals" }));
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("nav-hot-deals");
  });

  it("order defaults to max existing order + 1", async () => {
    const res = await POST(makeRequest({ label: "Events", href: "/events" }));
    const json = await res.clone().json() as { data: { order: number } };
    // existing max is 1 → new order = 2
    expect(json.data.order).toBe(2);
  });

  it("explicit order overrides default", async () => {
    const res = await POST(makeRequest({ label: "Events", href: "/events", order: 5 }));
    const json = await res.clone().json() as { data: { order: number } };
    expect(json.data.order).toBe(5);
  });

  it("isVisible defaults to true", async () => {
    const res = await POST(makeRequest({ label: "Events", href: "/events" }));
    const json = await res.clone().json() as { data: { isVisible: boolean } };
    expect(json.data.isVisible).toBe(true);
  });

  it("saves updated navItems via updateSingleton", async () => {
    await POST(makeRequest({ label: "Events", href: "/events" }));
    expect(mockUpdateSingleton).toHaveBeenCalledWith(
      expect.objectContaining({
        navbarConfig: expect.objectContaining({
          navItems: expect.arrayContaining([
            expect.objectContaining({ label: "Events", href: "/events" }),
          ]),
        }),
      }),
    );
  });

  it("empty existing items → order 0 for first item", async () => {
    mockGetSingleton.mockResolvedValue({ navbarConfig: { navItems: [] } });
    const res = await POST(makeRequest({ label: "Home", href: "/" }));
    const json = await res.clone().json() as { data: { order: number } };
    expect(json.data.order).toBe(0);
  });
});
