/**
 * Tests for POST /api/admin/sessions/revoke-user
 * Batch-revokes all sessions for a given userId.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockRevokeAllUserSessions } = vi.hoisted(() => ({
  mockRevokeAllUserSessions: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  sessionRepository: { revokeAllUserSessions: mockRevokeAllUserSessions },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  SUCCESS_MESSAGES: { ADMIN: { SESSIONS_REVOKED: "Sessions revoked" } },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { POST } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/admin/sessions/revoke-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockRevokeAllUserSessions.mockResolvedValue(5);
});

describe("POST /api/admin/sessions/revoke-user", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ userId: "target-uid" }) as never);
    expect(res.status).toBe(401);
  });

  it("buyer role → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeReq({ userId: "target-uid" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing userId → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("empty userId string → 400", async () => {
    const res = await POST(makeReq({ userId: "" }) as never);
    expect(res.status).toBe(400);
  });

  it("revokeAllUserSessions called with userId and admin uid", async () => {
    await POST(makeReq({ userId: "target-uid" }) as never);
    expect(mockRevokeAllUserSessions).toHaveBeenCalledWith("target-uid", "admin-uid");
  });

  it("success → 200 with { userId, revokedCount }", async () => {
    const res = await POST(makeReq({ userId: "target-uid" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { userId: string; revokedCount: number } };
    expect(json.data.userId).toBe("target-uid");
    expect(json.data.revokedCount).toBe(5);
  });

  it("moderator role → 200 (allowed)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeReq({ userId: "target-uid" }) as never);
    expect(res.status).toBe(200);
  });
});
