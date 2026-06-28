/**
 * Tests for POST /api/auth/send-verification
 * Generates a Firebase email verification link and sends it via Resend.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockApplyRateLimit,
  mockGetAdminAuth,
  mockGetUserByEmail,
  mockGenerateEmailVerificationLink,
  mockSendVerificationEmailWithLink,
} = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockGetAdminAuth: vi.fn(),
  mockGetUserByEmail: vi.fn(),
  mockGenerateEmailVerificationLink: vi.fn(),
  mockSendVerificationEmailWithLink: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  getAdminAuth: mockGetAdminAuth,
  sendVerificationSchema: {
    safeParse: (data: unknown) => {
      const d = data as { email?: unknown };
      if (!d?.email || typeof d.email !== "string")
        return { success: false, error: { issues: [{ message: "Email is required" }] } };
      if (!String(d.email).includes("@"))
        return { success: false, error: { issues: [{ message: "Invalid email" }] } };
      return { success: true, data: d };
    },
  },
  sendVerificationEmailWithLink: mockSendVerificationEmailWithLink,
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ERROR_MESSAGES: { EMAIL: { ALREADY_VERIFIED: "Email is already verified" } },
  SUCCESS_MESSAGES: { EMAIL: { VERIFICATION_SENT: "Verification email sent" } },
  serverLogger: { info: vi.fn(), error: vi.fn() },
  applyRateLimit: mockApplyRateLimit,
  RateLimitPresets: { AUTH: "auth" },
  createRouteHandler: (opts: {
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { body?: unknown; request?: unknown }) => Promise<Response>;
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

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/auth/send-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockAuthInstance = {
  getUserByEmail: mockGetUserByEmail,
  generateEmailVerificationLink: mockGenerateEmailVerificationLink,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockApplyRateLimit.mockResolvedValue({ success: true });
  mockGetAdminAuth.mockReturnValue(mockAuthInstance);
  mockGetUserByEmail.mockResolvedValue({ email: "user@test.com", emailVerified: false });
  mockGenerateEmailVerificationLink.mockResolvedValue("https://verify.link/abc");
  mockSendVerificationEmailWithLink.mockResolvedValue(undefined);
});

describe("POST /api/auth/send-verification", () => {
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

  it("email already verified → 400 with ALREADY_VERIFIED", async () => {
    mockGetUserByEmail.mockResolvedValue({ email: "user@test.com", emailVerified: true });
    const res = await POST(makeReq({ email: "user@test.com" }) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("already verified");
  });

  it("valid unverified email → generateEmailVerificationLink called", async () => {
    await POST(makeReq({ email: "user@test.com" }) as never);
    expect(mockGenerateEmailVerificationLink).toHaveBeenCalledWith(
      "user@test.com",
      expect.objectContaining({ handleCodeInApp: false }),
    );
  });

  it("valid unverified email → sendVerificationEmailWithLink called with email and link", async () => {
    await POST(makeReq({ email: "user@test.com" }) as never);
    expect(mockSendVerificationEmailWithLink).toHaveBeenCalledWith(
      "user@test.com",
      "https://verify.link/abc",
    );
  });

  it("success → 200", async () => {
    const res = await POST(makeReq({ email: "user@test.com" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
