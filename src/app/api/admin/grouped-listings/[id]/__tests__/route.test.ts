/**
 * Tests for GET/DELETE /api/admin/grouped-listings/[id]
 *
 * GET: ROLES_ADMIN_MOD — findById; 404 if not found; returns { item: doc }
 * DELETE: ROLES_ADMIN_ONLY — delete(id); returns { id } (no 404 guard)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockDelete } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  groupedListingsRepository: { findById: mockFindById, delete: mockDelete },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { params?: unknown; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (_request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ params, user: _user ?? undefined });
    };
  },
}));

import { GET, DELETE } from "../route";

const groupDoc = {
  id: "group-pokemon-starter-bundle",
  title: "Pokemon Starter Bundle",
  storeId: "store-pokemon-palace",
};

const routeParams = { params: Promise.resolve({ id: "group-pokemon-starter-bundle" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(groupDoc);
  mockDelete.mockResolvedValue(undefined);
});

describe("GET /api/admin/grouped-listings/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(200);
  });

  it("not found → 404 with 'Grouped listing not found'", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Grouped listing not found");
  });

  it("found → 200 with { item: doc } (not { data: doc })", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { item: { id: string } } };
    expect(json.data.item.id).toBe("group-pokemon-starter-bundle");
  });
});

describe("DELETE /api/admin/grouped-listings/[id]", () => {
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

  it("calls delete with the group id", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(mockDelete).toHaveBeenCalledWith("group-pokemon-starter-bundle");
  });

  it("success → 200 with { id } (no findById guard on delete)", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("group-pokemon-starter-bundle");
  });
});
