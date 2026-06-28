/**
 * Tests for GET /api/admin/history
 *
 * ROLES_ADMIN_MOD + permission: admin:sessions:read (re-uses sessions permission)
 * Uses historyRepository.findAllSummaries().
 *
 * Business logic:
 * - limit param: Math.min(provided, 500), default 200
 * - Sorted descending by updatedAt before slicing
 * - Each row: { id: `history-${userId}`, userId, itemCount, limit: HISTORY_MAX, updatedAt: ISO string }
 * - Returns { items: [...], total: sorted.length }
 *
 * NOTE: No isFull field (history silently evicts, no hard cap like wishlist).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindAllSummaries } = vi.hoisted(() => ({
  mockFindAllSummaries: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  historyRepository: { findAllSummaries: mockFindAllSummaries },
  HISTORY_MAX: 50,
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
  { userId: "user-ravi-k", itemCount: 50, updatedAt: earlier },
  { userId: "user-priya-m", itemCount: 12, updatedAt: now },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindAllSummaries.mockResolvedValue([...summaries]);
});

describe("GET /api/admin/history", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    expect(res.status).toBe(200);
  });

  it("results sorted descending by updatedAt", async () => {
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    const json = await res.clone().json() as { data: { items: { userId: string }[] } };
    expect(json.data.items[0].userId).toBe("user-priya-m");
    expect(json.data.items[1].userId).toBe("user-ravi-k");
  });

  it("id is `history-{userId}`", async () => {
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    const json = await res.clone().json() as { data: { items: { id: string }[] } };
    expect(json.data.items[0].id).toBe("history-user-priya-m");
  });

  it("each item carries limit: HISTORY_MAX (50)", async () => {
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    const json = await res.clone().json() as { data: { items: { limit: number }[] } };
    expect(json.data.items[0].limit).toBe(50);
  });

  it("updatedAt is ISO string", async () => {
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    const json = await res.clone().json() as { data: { items: { updatedAt: string }[] } };
    expect(json.data.items[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("total equals items.length", async () => {
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(json.data.items.length);
  });

  it("limit param caps the result", async () => {
    const res = await GET(new Request("http://localhost/api/admin/history?limit=1") as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(1);
  });

  it("limit > 500 is capped at 500", async () => {
    mockFindAllSummaries.mockResolvedValue(
      Array.from({ length: 600 }, (_, i) => ({
        userId: `user-${i}`,
        itemCount: 1,
        updatedAt: new Date(Date.now() - i * 1000),
      })),
    );
    const res = await GET(new Request("http://localhost/api/admin/history?limit=9999") as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(500);
  });

  it("no isFull field on history items (unlike wishlists)", async () => {
    const res = await GET(new Request("http://localhost/api/admin/history") as never);
    const json = await res.clone().json() as { data: { items: Record<string, unknown>[] } };
    expect(json.data.items[0]).not.toHaveProperty("isFull");
  });
});
