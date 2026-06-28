/**
 * Tests for PATCH /api/admin/admin-notifications/[id]
 *
 * Roles: ROLES_ADMIN_ONLY
 * Permission: admin:notifications:write
 *
 * Business logic:
 * - findById(id) → 404 if not found (via ApiErrors.notFound)
 * - update(id, body) with raw parseJsonBody (no schema)
 * - returns updated document
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUpdate } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  adminNotificationsRepository: { findById: mockFindById, update: mockUpdate },
  ApiErrors: {
    notFound: (msg: string) => new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  parseJsonBody: async (request: Request) => {
    try { return await request.json(); } catch { return {}; }
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ request, params, user: _user ?? undefined });
    };
  },
}));

import { PATCH } from "../route";

const routeParams = { params: Promise.resolve({ id: "notif-admin-001" }) };
const mockNotif = { id: "notif-admin-001", title: "System Alert", isRead: false };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockNotif);
  mockUpdate.mockResolvedValue({ ...mockNotif, isRead: true });
});

describe("PATCH /api/admin/admin-notifications/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ isRead: true }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ isRead: true }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("notification not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ isRead: true }), routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Not found");
  });

  it("calls update with the id and parsed body", async () => {
    await PATCH(makeRequest({ isRead: true, priority: "high" }), routeParams as never);
    expect(mockUpdate).toHaveBeenCalledWith("notif-admin-001", { isRead: true, priority: "high" });
  });

  it("no schema — any body passes (raw parseJsonBody)", async () => {
    const res = await PATCH(makeRequest({ arbitrary: "field" }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("success → 200 with updated document", async () => {
    const res = await PATCH(makeRequest({ isRead: true }), routeParams as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { isRead: boolean } };
    expect(json.data.isRead).toBe(true);
  });
});
