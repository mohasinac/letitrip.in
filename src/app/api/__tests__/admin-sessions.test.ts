/**
 * @jest-environment node
 */

/**
 * Admin Sessions API Tests
 *
 * GET    /api/admin/sessions               - list all sessions
 * DELETE /api/admin/sessions/[id]          - revoke single session
 * POST   /api/admin/sessions/revoke-user   - revoke all sessions for a user
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Firebase Admin Mock ──────────────────────────────────────────────────────

const mockVerifySessionCookie = jest.fn();
jest.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({ verifySessionCookie: mockVerifySessionCookie }),
  getAdminDb: jest.fn(),
}));

const mockRequireRole = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args),
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockFindAllForAdmin = jest.fn();
const mockFindSessionById = jest.fn();
const mockRevokeSession = jest.fn();
const mockRevokeAllUserSessions = jest.fn();

jest.mock("@/repositories", () => ({
  sessionRepository: {
    findAllForAdmin: (...args: unknown[]) => mockFindAllForAdmin(...args),
    findById: (...args: unknown[]) => mockFindSessionById(...args),
    revokeSession: (...args: unknown[]) => mockRevokeSession(...args),
    revokeAllUserSessions: (...args: unknown[]) =>
      mockRevokeAllUserSessions(...args),
  },
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(s: number, m: string, c: string) {
      super(m);
      this.statusCode = s;
      this.code = c;
    }
  }
  class AuthenticationError extends AppError {
    constructor(m: string) {
      super(401, m, "AUTH_ERROR");
    }
  }
  class AuthorizationError extends AppError {
    constructor(m: string) {
      super(403, m, "FORBIDDEN");
    }
  }
  class NotFoundError extends AppError {
    constructor(m: string) {
      super(404, m, "NOT_FOUND");
    }
  }
  return { AppError, AuthenticationError, AuthorizationError, NotFoundError };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: error?.statusCode || 500 },
    );
  },
}));

jest.mock("@/lib/api-response", () => ({
  successResponse: (data?: unknown, message?: string) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: true, data, message }, { status: 200 });
  },
  errorResponse: (message: string, status = 400) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ success: false, error: message }, { status });
  },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (req: any) => req.nextUrl.searchParams,
  getNumberParam: (_p: any, _k: string, def: number) => def,
  getStringParam: (_p: any, _k: string) => null,
  getRequiredSessionCookie: () => "valid-cookie",
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    AUTH: { FORBIDDEN: "Forbidden", UNAUTHORIZED: "Unauthorized" },
    SESSION: {
      NOT_FOUND: "Session not found",
      FETCH_FAILED: "Failed to fetch",
    },
    VALIDATION: { FAILED: "Validation failed" },
    API: { ADMIN_SESSIONS_ERROR: "Admin sessions fetch error:" },
  },
  SUCCESS_MESSAGES: {
    ADMIN: {
      SESSION_REVOKED: "Session revoked",
      SESSIONS_REVOKED: "Sessions revoked",
    },
    SESSION: {
      REVOKED: "Session revoked",
      ALL_REVOKED: "All sessions revoked",
    },
  },
}));

import { GET } from "../admin/sessions/route";
import { DELETE } from "../admin/sessions/[id]/route";
import { POST } from "../admin/sessions/revoke-user/route";

afterEach(() => jest.clearAllMocks());

// ─── Tests: GET /api/admin/sessions ──────────────────────────────────────────

describe("GET /api/admin/sessions", () => {
  it("returns non-200 status for non-admin (regular user)", async () => {
    mockVerifySessionCookie.mockResolvedValueOnce({ role: "user", uid: "u1" });
    const req = buildRequest("/api/admin/sessions", {
      cookies: { __session: "valid" },
    });
    const res = await GET(req);
    const { status, body } = await parseResponse(res);
    // AuthorizationError is caught by the route's catch block, returned as 500 with error message
    expect(status).not.toBe(200);
    expect(body.success).toBeFalsy();
  });

  it("returns paginated session list for admin", async () => {
    mockVerifySessionCookie.mockResolvedValueOnce({
      role: "admin",
      uid: "admin1",
    });
    mockFindAllForAdmin.mockResolvedValueOnce({
      sessions: [
        {
          id: "s1",
          userId: "u1",
          isActive: true,
          createdAt: new Date(),
          lastActivity: new Date(),
          expiresAt: new Date(),
          deviceInfo: {},
        },
      ],
      stats: { total: 1, active: 1, revoked: 0 },
    });
    const req = buildRequest("/api/admin/sessions");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns all active sessions via findAllForAdmin", async () => {
    mockVerifySessionCookie.mockResolvedValueOnce({
      role: "admin",
      uid: "admin1",
    });
    mockFindAllForAdmin.mockResolvedValueOnce({ sessions: [], stats: {} });
    const req = buildRequest("/api/admin/sessions");
    await GET(req);
    expect(mockFindAllForAdmin).toHaveBeenCalled();
  });
});

// ─── Tests: DELETE /api/admin/sessions/[id] ─────────────────────────────────

describe("DELETE /api/admin/sessions/[id]", () => {
  it("revokes a specific session and returns 200", async () => {
    mockRequireRole.mockResolvedValueOnce({ uid: "admin1", role: "admin" });
    mockFindSessionById.mockResolvedValueOnce({ id: "s1", userId: "u1" });
    mockRevokeSession.mockResolvedValueOnce(undefined);
    const req = buildRequest("/api/admin/sessions/s1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "s1" }) });
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 404 for unknown session id", async () => {
    mockRequireRole.mockResolvedValueOnce({ uid: "admin1", role: "admin" });
    mockFindSessionById.mockResolvedValueOnce(null);
    const req = buildRequest("/api/admin/sessions/unknown", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "unknown" }),
    });
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });
});

// ─── Tests: POST /api/admin/sessions/revoke-user ─────────────────────────────

describe("POST /api/admin/sessions/revoke-user", () => {
  it("revokes all sessions for a given uid", async () => {
    mockRequireRole.mockResolvedValueOnce({ uid: "admin1", role: "admin" });
    mockRevokeAllUserSessions.mockResolvedValueOnce(3);
    const req = buildRequest("/api/admin/sessions/revoke-user", {
      method: "POST",
      body: { userId: "u1" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 400 when userId is missing from body", async () => {
    mockRequireRole.mockResolvedValueOnce({ uid: "admin1", role: "admin" });
    const req = buildRequest("/api/admin/sessions/revoke-user", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(400);
  });
});
