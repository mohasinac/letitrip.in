/**
 * @jest-environment node
 */

/**
 * Auth API — Logout Tests
 *
 * POST /api/auth/logout
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockRevokeRefreshTokens = jest.fn();
jest.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    revokeRefreshTokens: (...args: unknown[]) =>
      mockRevokeRefreshTokens(...args),
  }),
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

const mockVerifySessionCookie = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  verifySessionCookie: (...args: unknown[]) => mockVerifySessionCookie(...args),
}));

const mockRevokeSession = jest.fn();
jest.mock("@/repositories", () => ({
  sessionRepository: {
    revokeSession: (...args: unknown[]) => mockRevokeSession(...args),
  },
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
  class AuthenticationError extends AppError {
    constructor(message: string) {
      super(401, message, "AUTH_ERROR");
    }
  }
  return {
    AppError,
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

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    AUTH: { UNAUTHORIZED: "Unauthorized", SESSION_EXPIRED: "Session expired" },
    API: {
      LOGOUT_REVOCATION_ERROR: "Revocation error",
      LOGOUT_TOKEN_ERROR: "Token error",
    },
  },
  SUCCESS_MESSAGES: {
    AUTH: { LOGOUT_SUCCESS: "Logged out successfully" },
  },
}));

import { POST } from "../auth/logout/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth API — POST /api/auth/logout", () => {
  const SESSION_COOKIE = "session-cookie-value";
  const SESSION_ID = "session-id-abc";

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifySessionCookie.mockResolvedValue({ uid: "user-uid-123" });
    mockRevokeSession.mockResolvedValue(undefined);
    mockRevokeRefreshTokens.mockResolvedValue(undefined);
  });

  it("returns 200 and clears __session and __session_id cookies", async () => {
    const req = buildRequest("/api/auth/logout", {
      method: "POST",
      cookies: { __session: SESSION_COOKIE, __session_id: SESSION_ID },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    // Verify cookies are being deleted (Set-Cookie header with Max-Age=0 or expires in the past)
    const setCookieHeader = res.headers.get("set-cookie") ?? "";
    expect(setCookieHeader).toContain("__session");
  });

  it("calls sessionRepository.revokeSession when __session_id cookie is present", async () => {
    const req = buildRequest("/api/auth/logout", {
      method: "POST",
      cookies: { __session: SESSION_COOKIE, __session_id: SESSION_ID },
    });
    await POST(req);

    expect(mockRevokeSession).toHaveBeenCalledWith(SESSION_ID, "user");
  });

  it("returns 200 with success body even when no session cookies are present", async () => {
    const req = buildRequest("/api/auth/logout", {
      method: "POST",
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("does not call revokeSession when __session_id cookie is absent", async () => {
    const req = buildRequest("/api/auth/logout", {
      method: "POST",
      cookies: { __session: SESSION_COOKIE },
    });
    await POST(req);

    expect(mockRevokeSession).not.toHaveBeenCalled();
  });
});
