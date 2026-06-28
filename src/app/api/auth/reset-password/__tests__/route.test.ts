/**
 * Tests for PUT /api/auth/reset-password
 *
 * This is an acknowledgement endpoint — Firebase handles the actual password
 * change client-side via confirmPasswordReset(). The route validates the
 * schema and rate-limits, but does NOT call any Firebase Admin API to change
 * the password server-side (by design, see the route comment).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _body: unknown;

const { mockApplyRateLimit, mockServerLogger } = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockServerLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  resetPasswordSchema: {
    safeParse: (data: unknown) => {
      const d = data as { token?: unknown; newPassword?: unknown };
      if (!d?.token || typeof d.token !== "string")
        return { success: false, error: { issues: [{ message: "Token is required" }] } };
      if (!d?.newPassword || typeof d.newPassword !== "string" || (d.newPassword as string).length < 8)
        return { success: false, error: { issues: [{ message: "Password too short" }] } };
      return { success: true, data: d };
    },
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  SUCCESS_MESSAGES: { USER: { PASSWORD_CHANGED: "Password changed successfully" } },
  serverLogger: mockServerLogger,
  applyRateLimit: mockApplyRateLimit,
  RateLimitPresets: { PASSWORD_RESET: "password_reset" },
  createRouteHandler: (opts: {
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { body?: unknown; request?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = _body; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body ?? _body);
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation error";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ body, request });
    };
  },
}));

import { PUT } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/auth/reset-password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockApplyRateLimit.mockResolvedValue({ success: true });
  _body = undefined;
});

describe("PUT /api/auth/reset-password", () => {
  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await PUT(makeReq({ token: "tok", newPassword: "Password1" }) as never);
    expect(res.status).toBe(429);
  });

  it("missing token → 400", async () => {
    const res = await PUT(makeReq({ newPassword: "Password1" }) as never);
    expect(res.status).toBe(400);
  });

  it("missing newPassword → 400", async () => {
    const res = await PUT(makeReq({ token: "some-token" }) as never);
    expect(res.status).toBe(400);
  });

  it("newPassword too short (< 8 chars) → 400", async () => {
    const res = await PUT(makeReq({ token: "tok", newPassword: "abc" }) as never);
    expect(res.status).toBe(400);
  });

  it("valid request → 200 (acknowledgement, no Firebase Admin call needed)", async () => {
    const res = await PUT(makeReq({ token: "valid-reset-token", newPassword: "Password123" }) as never);
    expect(res.status).toBe(200);
  });

  it("valid request → server logger called (logging the acknowledgement)", async () => {
    await PUT(makeReq({ token: "valid-reset-token", newPassword: "Password123" }) as never);
    expect(mockServerLogger.info).toHaveBeenCalled();
  });

  it("valid request → response does NOT include any sensitive token data", async () => {
    const res = await PUT(makeReq({ token: "valid-reset-token", newPassword: "Password123" }) as never);
    const json = await res.clone().json() as { data?: { token?: string; newPassword?: string } };
    expect(json.data?.token).toBeUndefined();
    expect(json.data?.newPassword).toBeUndefined();
  });
});
