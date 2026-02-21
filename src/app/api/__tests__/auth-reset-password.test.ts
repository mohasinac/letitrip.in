/**
 * @jest-environment node
 */

/**
 * Auth API — Reset Password Tests
 *
 * PUT /api/auth/reset-password
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({}),
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
    VALIDATION: {
      REQUIRED_FIELD: "Required field",
      TOKEN_REQUIRED: "Token is required",
    },
    PASSWORD: {
      TOO_SHORT: "Password too short",
      RESET_FAILED: "Password reset failed",
    },
  },
  SUCCESS_MESSAGES: {
    PASSWORD: { CHANGED: "Password changed successfully" },
    USER: { PASSWORD_CHANGED: "Password changed successfully" },
  },
}));

jest.mock("@/utils", () => ({
  isRequired: jest.fn((val: string) => !!val && val.trim() !== ""),
  minLength: jest.fn((val: string, min: number) => !!val && val.length >= min),
}));

import { PUT } from "../auth/reset-password/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth API — PUT /api/auth/reset-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 for a valid token and new password", async () => {
    const req = buildRequest("/api/auth/reset-password", {
      method: "PUT",
      body: { token: "valid-oob-token", newPassword: "newSecure123" },
    });
    const res = await PUT(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 when token is missing", async () => {
    const req = buildRequest("/api/auth/reset-password", {
      method: "PUT",
      body: { newPassword: "newSecure123" },
    });
    const res = await PUT(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when newPassword is missing", async () => {
    const req = buildRequest("/api/auth/reset-password", {
      method: "PUT",
      body: { token: "valid-oob-token" },
    });
    const res = await PUT(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when newPassword is too short (< 8 chars)", async () => {
    const req = buildRequest("/api/auth/reset-password", {
      method: "PUT",
      body: { token: "valid-oob-token", newPassword: "short" },
    });
    const res = await PUT(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });
});
