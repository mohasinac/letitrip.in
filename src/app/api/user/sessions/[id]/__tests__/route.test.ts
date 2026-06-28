/**
 * Tests for DELETE /api/user/sessions/[id]
 * Auth required. Any authenticated user.
 * Calls revokeSession(sessionId, uid).
 * revokeSession enforces ownership internally — it verifies the session belongs
 * to the provided uid before revoking. No separate ownership check in this route.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockRevokeSession } = vi.hoisted(() => ({
  mockRevokeSession: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  revokeSession: mockRevokeSession,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { DELETE } from "../route";

const params = { params: Promise.resolve({ id: "session-abc123" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockRevokeSession.mockResolvedValue(undefined);
});

describe("DELETE /api/user/sessions/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(401);
  });

  it("calls revokeSession with sessionId from params and uid from token", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockRevokeSession).toHaveBeenCalledWith("session-abc123", "buyer-uid");
  });

  it("uses uid from auth token (ownership enforced inside revokeSession)", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockRevokeSession).toHaveBeenCalledWith("session-abc123", "specific-uid");
  });

  it("success → 200", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
  });

  it("revokeSession throws (session not found or wrong owner) → error propagates", async () => {
    mockRevokeSession.mockRejectedValue(new Error("Session not found"));
    await expect(
      DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never),
    ).rejects.toThrow("Session not found");
  });
});
