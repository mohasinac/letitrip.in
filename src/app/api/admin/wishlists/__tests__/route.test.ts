/**
 * Tests for GET /api/admin/wishlists
 *
 * ROLES_ADMIN_MOD + permission: admin:wishlists:read
 * Uses wishlistRepository.findAllSummaries() — returns all user wishlist summaries.
 *
 * Business logic:
 * - limit param: Math.min(provided, 500), default 200
 * - Results sorted descending by updatedAt before slicing
 * - Each row: { id: `wishlist-${userId}`, userId, itemCount, limit: WISHLIST_MAX, isFull: itemCount >= WISHLIST_MAX, updatedAt: ISO string }
 * - Returns { items: [...], total: sorted.length }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindAllSummaries } = vi.hoisted(() => ({
  mockFindAllSummaries: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  wishlistRepository: { findAllSummaries: mockFindAllSummaries },
  WISHLIST_MAX: 20,
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const now = new Date("2026-06-01T12:00:00Z");
const earlier = new Date("2026-05-01T12:00:00Z");

const summaries = [
  { userId: "user-ravi-k", itemCount: 20, updatedAt: earlier },
  { userId: "user-priya-m", itemCount: 5, updatedAt: now },
  { userId: "user-akash-s", itemCount: 0, updatedAt: new Date("2026-04-01T12:00:00Z") },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindAllSummaries.mockResolvedValue([...summaries]);
});

describe("GET /api/admin/wishlists", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    expect(res.status).toBe(200);
  });

  it("results sorted descending by updatedAt", async () => {
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    const json = await res.clone().json() as { data: { items: { userId: string }[] } };
    expect(json.data.items[0].userId).toBe("user-priya-m"); // most recent
    expect(json.data.items[1].userId).toBe("user-ravi-k");
    expect(json.data.items[2].userId).toBe("user-akash-s"); // oldest
  });

  it("id is `wishlist-{userId}`", async () => {
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    const json = await res.clone().json() as { data: { items: { id: string; userId: string }[] } };
    expect(json.data.items[0].id).toBe("wishlist-user-priya-m");
  });

  it("isFull: true when itemCount >= WISHLIST_MAX (20)", async () => {
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    const json = await res.clone().json() as { data: { items: { userId: string; isFull: boolean; itemCount: number }[] } };
    const ravi = json.data.items.find(i => i.userId === "user-ravi-k")!;
    expect(ravi.itemCount).toBe(20);
    expect(ravi.isFull).toBe(true);
    const priya = json.data.items.find(i => i.userId === "user-priya-m")!;
    expect(priya.isFull).toBe(false);
  });

  it("updatedAt is ISO string", async () => {
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    const json = await res.clone().json() as { data: { items: { updatedAt: string }[] } };
    expect(() => new Date(json.data.items[0].updatedAt)).not.toThrow();
    expect(json.data.items[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("each item carries limit: WISHLIST_MAX (20)", async () => {
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    const json = await res.clone().json() as { data: { items: { limit: number }[] } };
    expect(json.data.items[0].limit).toBe(20);
  });

  it("total equals number of items in response", async () => {
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(json.data.items.length);
  });

  it("limit param caps the result set", async () => {
    // 3 summaries but limit=2
    const res = await GET(new Request("http://localhost/api/admin/wishlists?limit=2") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("limit param cannot exceed 500", async () => {
    mockFindAllSummaries.mockResolvedValue(
      Array.from({ length: 600 }, (_, i) => ({
        userId: `user-${i}`,
        itemCount: 1,
        updatedAt: new Date(Date.now() - i * 1000),
      })),
    );
    const res = await GET(new Request("http://localhost/api/admin/wishlists?limit=1000") as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(500);
  });

  it("empty summaries → { items: [], total: 0 }", async () => {
    mockFindAllSummaries.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/admin/wishlists") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });
});
