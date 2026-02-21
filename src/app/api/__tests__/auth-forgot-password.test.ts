/**
 * @jest-environment node
 */

/**
 * Auth API — Forgot Password Tests
 *
 * POST /api/auth/forgot-password
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockGeneratePasswordResetLink = jest.fn();
jest.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    generatePasswordResetLink: (...args: unknown[]) =>
      mockGeneratePasswordResetLink(...args),
  }),
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

const mockSendPasswordResetEmailWithLink = jest.fn();
jest.mock("@/lib/email", () => ({
  sendPasswordResetEmailWithLink: (...args: unknown[]) =>
    mockSendPasswordResetEmailWithLink(...args),
}));

jest.mock("@/lib/security/rate-limit", () => ({
  applyRateLimit: jest.fn().mockResolvedValue({ success: true }),
  RateLimitPresets: { PASSWORD_RESET: {} },
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
    toJSON() {
      return { success: false, error: this.message, code: this.code };
    }
  }
  class ValidationError extends AppError {
    constructor(message: string) {
      super(400, message, "VALIDATION_ERROR");
    }
  }
  return { AppError, ValidationError };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    const status = error?.statusCode ?? 500;
    return NextResponse.json(
      { success: false, error: error?.message ?? "Internal server error" },
      { status },
    );
  },
  logError: jest.fn(),
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { INVALID_EMAIL: "Invalid email" },
  },
  SUCCESS_MESSAGES: {
    PASSWORD: { RESET_EMAIL_SENT: "Password reset email sent" },
  },
  UI_LABELS: {
    AUTH: { RATE_LIMIT_EXCEEDED: "Rate limit exceeded" },
  },
}));

import { POST } from "../auth/forgot-password/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth API — POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGeneratePasswordResetLink.mockResolvedValue(
      "https://reset.link?oobCode=abc123",
    );
    mockSendPasswordResetEmailWithLink.mockResolvedValue(undefined);
  });

  it("returns 200 for a known email address", async () => {
    const req = buildRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 200 for an unknown email (no information leak)", async () => {
    mockGeneratePasswordResetLink.mockRejectedValue({
      code: "auth/user-not-found",
      message: "User not found",
    });

    const req = buildRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "unknown@nowhere.com" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    // Must return 200 — no user-existence leakage
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 when email field is missing", async () => {
    const req = buildRequest("/api/auth/forgot-password", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when email format is invalid", async () => {
    const req = buildRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "not-an-email" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("calls sendPasswordResetEmailWithLink after generating the reset link", async () => {
    const req = buildRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    await POST(req);

    expect(mockSendPasswordResetEmailWithLink).toHaveBeenCalledWith(
      "user@example.com",
      expect.any(String),
    );
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const { applyRateLimit } = require("@/lib/security/rate-limit");
    (applyRateLimit as jest.Mock).mockResolvedValueOnce({ success: false });

    const req = buildRequest("/api/auth/forgot-password", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(429);
  });
});
