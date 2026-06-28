/**
 * Tests for GET /api/admin/moderation
 *
 * ROLES_ADMIN_MOD + permission: admin:reviews:read
 * Uses moderationQueueRepository.listPending().
 * Returns { items, total: items.length }.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListPending } = vi.hoisted(() => ({
  mockListPending: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  moderationQueueRepository: { listPending: mockListPending },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

const mockItems = [
  { id: "modq-1", type: "review", status: "pending" },
  { id: "modq-2", type: "review", status: "pending" },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListPending.mockResolvedValue({ items: mockItems });
});

describe("GET /api/admin/moderation", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/moderation") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/moderation") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/moderation") as never);
    expect(res.status).toBe(200);
  });

  it("returns { items, total: items.length } from listPending", async () => {
    const res = await GET(new Request("http://localhost/api/admin/moderation") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("empty queue → { items: [], total: 0 }", async () => {
    mockListPending.mockResolvedValue({ items: [] });
    const res = await GET(new Request("http://localhost/api/admin/moderation") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });
});
