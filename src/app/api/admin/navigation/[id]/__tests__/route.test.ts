/**
 * Tests for PUT/PATCH/DELETE /api/admin/navigation/[id]
 *
 * All verbs: ROLES_ADMIN_ONLY
 *
 * PUT/PATCH: updateNavItemSchema (all fields optional); merges onto existing item; 404 if not found
 * DELETE: filters item out of list; 404 if not found
 * All read/write nav items via siteSettingsRepository.getSingleton / updateSingleton
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockGetSingleton, mockUpdateSingleton } = vi.hoisted(() => ({
  mockGetSingleton: vi.fn(),
  mockUpdateSingleton: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  siteSettingsRepository: {
    getSingleton: mockGetSingleton,
    updateSingleton: mockUpdateSingleton,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: B | undefined;
      if (opts.schema) {
        let raw: unknown = {};
        try { raw = await request.json(); } catch { /* empty */ }
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = parsed.data;
      }
      return opts.handler({ request, params, user: _user ?? undefined, body });
    };
  },
}));

import { PUT, PATCH, DELETE } from "../route";

const navItems = [
  { id: "nav-new-arrivals", label: "New Arrivals", href: "/new", order: 1, isVisible: true },
  { id: "nav-auctions", label: "Auctions", href: "/auctions", order: 2, isVisible: true },
];

const makeSettings = () => ({ navbarConfig: { navItems: [...navItems] } });

const routeParams = { params: { id: "nav-new-arrivals" } };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockGetSingleton.mockResolvedValue(makeSettings());
  mockUpdateSingleton.mockResolvedValue(undefined);
});

describe("PUT /api/admin/navigation/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest({ label: "New Label" }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest({ label: "New Label" }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("nav item not found → 404", async () => {
    const res = await PUT(
      makeRequest({ label: "X" }),
      { params: { id: "nav-nonexistent" } } as never,
    );
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Navigation item not found.");
  });

  it("merges body onto existing item", async () => {
    const res = await PUT(makeRequest({ label: "Fresh Arrivals" }), routeParams as never);
    expect(res.status).toBe(200);
    const saved = mockUpdateSingleton.mock.calls[0][0] as { navbarConfig: { navItems: { label: string }[] } };
    const updatedItem = saved.navbarConfig.navItems[0];
    expect(updatedItem.label).toBe("Fresh Arrivals");
  });

  it("unmentioned fields preserved after merge", async () => {
    const res = await PUT(makeRequest({ label: "Fresh Arrivals" }), routeParams as never);
    expect(res.status).toBe(200);
    const saved = mockUpdateSingleton.mock.calls[0][0] as { navbarConfig: { navItems: { href: string }[] } };
    expect(saved.navbarConfig.navItems[0].href).toBe("/new");
  });

  it("success → 200 with 'Nav item updated' message", async () => {
    const res = await PUT(makeRequest({ label: "Updated" }), routeParams as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Nav item updated");
  });
});

describe("PATCH /api/admin/navigation/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ isVisible: false }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ isVisible: false }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("nav item not found → 404", async () => {
    const res = await PATCH(
      makeRequest({ isVisible: false }),
      { params: { id: "nav-ghost" } } as never,
    );
    expect(res.status).toBe(404);
  });

  it("PATCH behavior identical to PUT — merges fields onto existing item", async () => {
    await PATCH(makeRequest({ isVisible: false }), routeParams as never);
    const saved = mockUpdateSingleton.mock.calls[0][0] as { navbarConfig: { navItems: { isVisible: boolean }[] } };
    expect(saved.navbarConfig.navItems[0].isVisible).toBe(false);
  });

  it("success → 200 with 'Nav item updated'", async () => {
    const res = await PATCH(makeRequest({ order: 5 }), routeParams as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Nav item updated");
  });
});

describe("DELETE /api/admin/navigation/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(403);
  });

  it("nav item not found → 404 (length unchanged = item wasn't there)", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      { params: { id: "nav-ghost" } } as never,
    );
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Navigation item not found.");
  });

  it("saves updated list without the deleted item", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const saved = mockUpdateSingleton.mock.calls[0][0] as { navbarConfig: { navItems: { id: string }[] } };
    expect(saved.navbarConfig.navItems).toHaveLength(1);
    expect(saved.navbarConfig.navItems[0].id).toBe("nav-auctions");
  });

  it("success → 200 with 'Nav item deleted' and null data", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Nav item deleted");
    expect(json.data).toBeNull();
  });
});
