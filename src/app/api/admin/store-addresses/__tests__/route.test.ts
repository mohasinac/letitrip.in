/**
 * Tests for GET /api/admin/store-addresses
 *
 * Roles: ROLES_ADMIN_MOD
 * Permission: admin:store-addresses:read
 *
 * Business logic:
 * - storeId param → listByOwner("store", storeId)
 * - no storeId → listByOwnerType("store", limit)
 * - limit: Math.min(provided, 1000), default 500
 * - maps addresses: { id, storeId (=ownerId), label, city, state, postalCode, isDefault, createdAt (ISO) }
 * - returns { items, total: items.length }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListByOwner,
  mockListByOwnerType,
} = vi.hoisted(() => ({
  mockListByOwner: vi.fn(),
  mockListByOwnerType: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  addressesRepository: {
    listByOwner: mockListByOwner,
    listByOwnerType: mockListByOwnerType,
  },
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

const makeAddr = (overrides: Record<string, unknown> = {}) => ({
  id: "addr-store-001",
  ownerId: "store-pokemon-palace",
  label: "Main Store",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
  isDefault: true,
  createdAt: new Date("2026-05-01T00:00:00Z"),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListByOwner.mockResolvedValue([makeAddr()]);
  mockListByOwnerType.mockResolvedValue([makeAddr()]);
});

describe("GET /api/admin/store-addresses", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    expect(res.status).toBe(200);
  });

  it("no storeId → calls listByOwnerType('store', limit)", async () => {
    await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    expect(mockListByOwnerType).toHaveBeenCalledWith("store", expect.any(Number));
    expect(mockListByOwner).not.toHaveBeenCalled();
  });

  it("with storeId → calls listByOwner('store', storeId)", async () => {
    await GET(
      new Request("http://localhost/api/admin/store-addresses?storeId=store-pokemon-palace") as never,
    );
    expect(mockListByOwner).toHaveBeenCalledWith("store", "store-pokemon-palace");
    expect(mockListByOwnerType).not.toHaveBeenCalled();
  });

  it("default limit 500 when not specified", async () => {
    await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    expect(mockListByOwnerType).toHaveBeenCalledWith("store", 500);
  });

  it("limit capped at 1000", async () => {
    await GET(new Request("http://localhost/api/admin/store-addresses?limit=9999") as never);
    expect(mockListByOwnerType).toHaveBeenCalledWith("store", 1000);
  });

  it("custom limit within bounds passed through", async () => {
    await GET(new Request("http://localhost/api/admin/store-addresses?limit=200") as never);
    expect(mockListByOwnerType).toHaveBeenCalledWith("store", 200);
  });

  it("maps ownerId to storeId in response", async () => {
    const res = await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    const json = await res.clone().json() as { data: { items: { storeId: string }[] } };
    expect(json.data.items[0].storeId).toBe("store-pokemon-palace");
  });

  it("does not expose raw ownerId field (mapped to storeId)", async () => {
    const res = await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    const json = await res.clone().json() as { data: { items: Record<string, unknown>[] } };
    expect(json.data.items[0]).not.toHaveProperty("ownerId");
  });

  it("createdAt converted to ISO string", async () => {
    const res = await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    const json = await res.clone().json() as { data: { items: { createdAt: string }[] } };
    expect(json.data.items[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns { items, total: items.length }", async () => {
    mockListByOwnerType.mockResolvedValue([makeAddr(), makeAddr({ id: "addr-store-002" })]);
    const res = await GET(new Request("http://localhost/api/admin/store-addresses") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(2);
    expect(json.data.items).toHaveLength(2);
  });
});
