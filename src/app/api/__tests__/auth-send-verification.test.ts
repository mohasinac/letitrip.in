/**
 * @jest-environment node
 */

/**
 * Auth API — Send Verification Email Tests
 *
 * POST /api/auth/send-verification
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockGetUserByEmail = jest.fn();
const mockGenerateEmailVerificationLink = jest.fn();

// send-verification uses getAdminAuth() from @/lib/firebase/admin (NOT firebase-admin/auth)
jest.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args),
    generateEmailVerificationLink: (...args: unknown[]) =>
      mockGenerateEmailVerificationLink(...args),
  }),
}));

const mockSendVerificationEmailWithLink = jest.fn();
jest.mock("@/lib/email", () => ({
  sendVerificationEmailWithLink: (...args: unknown[]) =>
    mockSendVerificationEmailWithLink(...args),
}));

jest.mock("@/utils", () => ({
  isValidEmail: jest.fn((email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  ),
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

jest.mock("@/lib/api-response", () => ({
  successResponse: (data?: unknown, message?: string) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status: 200 });
  },
  errorResponse: (message: string, status = 400, fields?: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: message, fields },
      { status },
    );
  },
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { INVALID_EMAIL: "Invalid email address" },
    EMAIL: {
      ALREADY_VERIFIED: "Email is already verified",
      SEND_FAILED: "Failed to send verification email",
    },
  },
  SUCCESS_MESSAGES: {
    EMAIL: { VERIFICATION_SENT: "Verification email sent" },
  },
}));

import { POST } from "../auth/send-verification/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth API — POST /api/auth/send-verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserByEmail.mockResolvedValue({
      email: "user@example.com",
      emailVerified: false,
    });
    mockGenerateEmailVerificationLink.mockResolvedValue(
      "https://verify.link?oobCode=xyz789",
    );
    mockSendVerificationEmailWithLink.mockResolvedValue(undefined);
  });

  it("returns 200 and sends verification link for an unverified user", async () => {
    const req = buildRequest("/api/auth/send-verification", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("calls sendVerificationEmailWithLink with the email and generated link", async () => {
    const req = buildRequest("/api/auth/send-verification", {
      method: "POST",
      body: { email: "user@example.com" },
    });
    await POST(req);

    expect(mockSendVerificationEmailWithLink).toHaveBeenCalledWith(
      "user@example.com",
      expect.any(String),
    );
  });

  it("returns 400 when email is already verified", async () => {
    mockGetUserByEmail.mockResolvedValueOnce({
      email: "verified@example.com",
      emailVerified: true,
    });

    const req = buildRequest("/api/auth/send-verification", {
      method: "POST",
      body: { email: "verified@example.com" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 for an invalid email format", async () => {
    const req = buildRequest("/api/auth/send-verification", {
      method: "POST",
      body: { email: "not-a-valid-email" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });
});
