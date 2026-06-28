import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockApplyRateLimit,
  mockGeneratePasswordResetLink,
  mockSendPasswordResetEmail,
} = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockGeneratePasswordResetLink: vi.fn(),
  mockSendPasswordResetEmail: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    generatePasswordResetLink: mockGeneratePasswordResetLink,
  })),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  getAdminApp: vi.fn(() => ({})),
  sendPasswordResetEmailWithLink: mockSendPasswordResetEmail,
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ERROR_MESSAGES: {
    VALIDATION: { INVALID_EMAIL: "Invalid email" },
    GENERIC: { RATE_LIMIT_EXCEEDED: "Too many requests" },
  },
  SUCCESS_MESSAGES: { PASSWORD: { RESET_EMAIL_SENT: "Password reset email sent" } },
  applyRateLimit: mockApplyRateLimit,
  RateLimitPresets: { PASSWORD_RESET: "password_reset" },
  serverLogger: { info: vi.fn(), error: vi.fn() },
  createRouteHandler: (opts: {
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
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

import { POST } from "../route";

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockApplyRateLimit.mockResolvedValue({ success: true });
  mockGeneratePasswordResetLink.mockResolvedValue("https://reset.link/abc123");
  mockSendPasswordResetEmail.mockResolvedValue(undefined);
});

describe("POST /api/auth/forgot-password", () => {
  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await POST(makeReq({ email: "user@test.com" }) as never);
    expect(res.status).toBe(429);
  });

  it("missing email → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("invalid email format → 400", async () => {
    const res = await POST(makeReq({ email: "not-an-email" }) as never);
    expect(res.status).toBe(400);
  });

  it("unknown email (auth/user-not-found) → 200 (no enumeration)", async () => {
    const err: any = new Error("not found");
    err.code = "auth/user-not-found";
    mockGeneratePasswordResetLink.mockRejectedValue(err);
    const res = await POST(makeReq({ email: "nobody@test.com" }) as never);
    // Should still return 200 so we don't expose whether the email exists
    expect(res.status).toBe(200);
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("known email → generatePasswordResetLink called", async () => {
    await POST(makeReq({ email: "user@test.com" }) as never);
    expect(mockGeneratePasswordResetLink).toHaveBeenCalledWith("user@test.com");
  });

  it("known email → sendPasswordResetEmailWithLink called with link", async () => {
    await POST(makeReq({ email: "user@test.com" }) as never);
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      "user@test.com",
      "https://reset.link/abc123",
    );
  });

  it("known email → 200 success response", async () => {
    const res = await POST(makeReq({ email: "user@test.com" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });

  it("generatePasswordResetLink throws unexpected error → error propagated", async () => {
    mockGeneratePasswordResetLink.mockRejectedValue(new Error("Firebase quota exceeded"));
    await expect(POST(makeReq({ email: "user@test.com" }) as never)).rejects.toThrow("quota exceeded");
  });
});
