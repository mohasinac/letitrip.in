/**
 * Tests for POST /api/user/change-password
 * Auth required. Validates schema (changePasswordSchema), then calls
 * getAdminAuth().updateUser(uid, { password: newPassword }).
 * No old-password verification here (done client-side via Firebase SDK reauthentication).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockUpdateUser,
  mockGetAdminAuth,
} = vi.hoisted(() => {
  const mockUpdateUser = vi.fn();
  const mockGetAdminAuth = vi.fn(() => ({ updateUser: mockUpdateUser }));
  return { mockUpdateUser, mockGetAdminAuth };
});

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  getAdminAuth: mockGetAdminAuth,
  SUCCESS_MESSAGES: { USER: { PASSWORD_CHANGED: "Password changed successfully" } },
  changePasswordSchema: {
    safeParse: (data: unknown) => {
      const d = data as { newPassword?: string };
      if (!d?.newPassword || d.newPassword.length < 6) {
        return {
          success: false,
          error: { issues: [{ message: "Password must be at least 6 characters" }] },
        };
      }
      return { success: true, data: d };
    },
  },
  successResponse: (_data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, message: msg }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
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
  new Request("http://localhost/api/user/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockUpdateUser.mockResolvedValue(undefined);
});

describe("POST /api/user/change-password", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ newPassword: "newPass123" }) as never);
    expect(res.status).toBe(401);
  });

  it("missing newPassword → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("too short password → 400", async () => {
    const res = await POST(makeReq({ newPassword: "abc" }) as never);
    expect(res.status).toBe(400);
  });

  it("valid request → calls getAdminAuth().updateUser with uid and newPassword", async () => {
    await POST(makeReq({ newPassword: "NewSecurePass123!" }) as never);
    expect(mockGetAdminAuth).toHaveBeenCalled();
    expect(mockUpdateUser).toHaveBeenCalledWith("buyer-uid", { password: "NewSecurePass123!" });
  });

  it("success → 200 with success message", async () => {
    const res = await POST(makeReq({ newPassword: "NewSecurePass123!" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });

  it("Firebase Auth updateUser fails → error propagates", async () => {
    mockUpdateUser.mockRejectedValue(new Error("auth/weak-password"));
    await expect(POST(makeReq({ newPassword: "NewSecurePass123!" }) as never)).rejects.toThrow();
  });

  it("does NOT call updateUser when body is empty", async () => {
    await POST(makeReq({}) as never);
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
