/**
 * Tests for GET /api/admin/grouped-listings
 *
 * Roles: ROLES_ADMIN_MOD
 * Permission: admin:content:read
 *
 * Business logic:
 * - pageSize param clamped at max 50 (no minimum enforced)
 * - calls groupedListingsRepository.findAll(pageSize)
 * - returns { items, total: items.length }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindAll } = vi.hoisted(() => ({
  mockFindAll: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  groupedListingsRepository: { findAll: mockFindAll },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { request: Request; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ request, user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindAll.mockResolvedValue([
    { id: "group-pokemon-starter-bundle", title: "Pokemon Starter Bundle", storeId: "store-pokemon-palace" },
    { id: "group-digimon-set", title: "Digimon Set", storeId: "store-tokyo-toys-india" },
  ]);
});

describe("GET /api/admin/grouped-listings", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/grouped-listings") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/grouped-listings") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/grouped-listings") as never);
    expect(res.status).toBe(200);
  });

  it("default pageSize is 50", async () => {
    await GET(new Request("http://localhost/api/admin/grouped-listings") as never);
    expect(mockFindAll).toHaveBeenCalledWith(50);
  });

  it("pageSize param respected within 50 max", async () => {
    await GET(new Request("http://localhost/api/admin/grouped-listings?pageSize=20") as never);
    expect(mockFindAll).toHaveBeenCalledWith(20);
  });

  it("pageSize > 50 clamped to 50", async () => {
    await GET(new Request("http://localhost/api/admin/grouped-listings?pageSize=200") as never);
    expect(mockFindAll).toHaveBeenCalledWith(50);
  });

  it("returns { items, total: items.length }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/grouped-listings") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("empty list → { items: [], total: 0 }", async () => {
    mockFindAll.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/admin/grouped-listings") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });
});
