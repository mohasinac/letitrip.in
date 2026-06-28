/**
 * Tests for DELETE /api/admin/sessions/[id]
 * Revokes a specific session by ID.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockRevokeSession } = vi.hoisted(() => ({
  mockRevokeSession: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  revokeSession: mockRevokeSession,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, context: { params?: Record<string, string> }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, params: context?.params });
    };
  },
}));

import { DELETE } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/admin/sessions/session-123", { method: "DELETE" });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockRevokeSession.mockResolvedValue(undefined);
});

describe("DELETE /api/admin/sessions/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq() as never, { params: Promise.resolve({ id: "session-123" }) });
    expect(res.status).toBe(401);
  });

  it("buyer role → 403 (admin/moderator only)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await DELETE(makeReq() as never, { params: Promise.resolve({ id: "session-123" }) });
    expect(res.status).toBe(403);
  });

  it("revokeSession called with session id and admin uid", async () => {
    await DELETE(makeReq() as never, { params: Promise.resolve({ id: "session-123" }) });
    expect(mockRevokeSession).toHaveBeenCalledWith("session-123", "admin-uid");
  });

  it("success → 200", async () => {
    const res = await DELETE(makeReq() as never, { params: Promise.resolve({ id: "session-123" }) });
    expect(res.status).toBe(200);
  });
});
