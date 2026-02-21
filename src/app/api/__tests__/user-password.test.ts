/**
 * @jest-environment node
 */

/**
 * User Change Password API Tests
 *
 * POST /api/user/change-password
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockVerifySessionCookie = jest.fn();
const mockUpdateUser = jest.fn();
jest.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    verifySessionCookie: (...args: unknown[]) =>
      mockVerifySessionCookie(...args),
    updateUser: (...args: unknown[]) => mockUpdateUser(...args),
  }),
}));

const mockGetRequiredSessionCookie = jest
  .fn()
  .mockReturnValue("test-session-cookie");
jest.mock("@/lib/api/request-helpers", () => ({
  getRequiredSessionCookie: (...args: unknown[]) =>
    mockGetRequiredSessionCookie(...args),
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
  class AuthenticationError extends AppError {
    constructor(message: string) {
      super(401, message, "AUTH_ERROR");
    }
  }
  return {
    AppError,
    ValidationError,
    AuthenticationError,
    handleApiError: (error: any) => {
      const { NextResponse } = require("next/server");
      const status = error?.statusCode ?? 500;
      return NextResponse.json(
        { success: false, error: error?.message ?? "Internal server error" },
        { status },
      );
    },
  };
});

jest.mock("@/lib/errors/error-handler", () => {
  const errors = jest.requireMock("@/lib/errors");
  return { handleApiError: errors.handleApiError, logError: jest.fn() };
});

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

jest.mock("@/utils", () => ({
  isRequired: jest.fn((val: string) => !!val && val.trim() !== ""),
  minLength: jest.fn((val: string, min: number) => !!val && val.length >= min),
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { REQUIRED_FIELD: "Required" },
    PASSWORD: {
      TOO_SHORT: "Password too short",
      SAME_AS_CURRENT: "New password must differ from current",
    },
    AUTH: { SESSION_EXPIRED: "Session expired", UNAUTHORIZED: "Unauthorized" },
    USER: { PASSWORD_CHANGED: "Password changed" },
  },
  SUCCESS_MESSAGES: {
    PASSWORD: { CHANGED: "Password changed successfully" },
    USER: { PASSWORD_CHANGED: "Password updated" },
  },
}));

import { POST } from "../user/change-password/route";

// ─── Test Data ────────────────────────────────────────────────────────────────

const DECODED_TOKEN = { uid: "user-123", email: "user@example.com" };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("User Change Password API — POST /api/user/change-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifySessionCookie.mockResolvedValue(DECODED_TOKEN);
    mockUpdateUser.mockResolvedValue({});
  });

  it("returns 200 when password is changed successfully", async () => {
    const req = buildRequest("/api/user/change-password", {
      method: "POST",
      body: {
        currentPassword: "OldPassword123",
        newPassword: "NewSecure456",
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("calls admin auth updateUser with the new password", async () => {
    const req = buildRequest("/api/user/change-password", {
      method: "POST",
      body: {
        currentPassword: "OldPassword123",
        newPassword: "NewSecure456",
      },
    });
    await POST(req);

    expect(mockUpdateUser).toHaveBeenCalledWith(
      DECODED_TOKEN.uid,
      expect.objectContaining({ password: "NewSecure456" }),
    );
  });

  it("returns 400 when newPassword is too short (< 8 chars)", async () => {
    const req = buildRequest("/api/user/change-password", {
      method: "POST",
      body: {
        currentPassword: "OldPassword123",
        newPassword: "short",
      },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when newPassword is same as currentPassword", async () => {
    const req = buildRequest("/api/user/change-password", {
      method: "POST",
      body: {
        currentPassword: "SamePassword123",
        newPassword: "SamePassword123",
      },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when currentPassword is missing", async () => {
    const req = buildRequest("/api/user/change-password", {
      method: "POST",
      body: { newPassword: "NewSecure456" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 401 when session cookie is missing", async () => {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockGetRequiredSessionCookie.mockImplementationOnce(() => {
      throw new AuthenticationError("Unauthorized");
    });

    const req = buildRequest("/api/user/change-password", {
      method: "POST",
      body: {
        currentPassword: "OldPassword123",
        newPassword: "NewSecure456",
      },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
