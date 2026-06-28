/**
 * Tests for POST /api/auth/logout
 * Revokes Firebase refresh tokens, revokes Firestore session, clears cookies.
 * Uses raw NextRequest/NextResponse (NOT createRouteHandler).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockApplyRateLimit,
  mockVerifySessionCookie,
  mockRevokeRefreshTokens,
  mockGetOptionalSessionCookie,
  mockRevokeSession,
  mockNormalizeError,
} = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockVerifySessionCookie: vi.fn(),
  mockRevokeRefreshTokens: vi.fn(),
  mockGetOptionalSessionCookie: vi.fn(),
  mockRevokeSession: vi.fn(),
  mockNormalizeError: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({ revokeRefreshTokens: mockRevokeRefreshTokens })),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => {
  class ValidationError extends Error {
    constructor(msg: string) { super(msg); this.name = "ValidationError"; }
  }
  const handleApiError = (error: unknown) => {
    if (error instanceof ValidationError)
      return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { status: 400 });
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  };
  return {
    normalizeError: mockNormalizeError,
    ValidationError,
    getAdminApp: vi.fn(() => ({})),
    verifySessionCookie: mockVerifySessionCookie,
    getOptionalSessionCookie: mockGetOptionalSessionCookie,
    sessionRepository: { revokeSession: mockRevokeSession },
    handleApiError,
    ERROR_MESSAGES: {
      API: {
        LOGOUT_TOKEN_ERROR: "Logout token error",
        LOGOUT_REVOCATION_ERROR: "Logout revocation error",
      },
    },
    SUCCESS_MESSAGES: { AUTH: { LOGOUT_SUCCESS: "Logged out successfully" } },
    serverLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
    applyRateLimit: mockApplyRateLimit,
    RateLimitPresets: { AUTH: "auth" },
  };
});

// next/server must be mocked so NextResponse.json returns a real Response
vi.mock("next/server", () => ({
  NextRequest: class {
    cookies: { get: (name: string) => { value: string } | undefined };
    constructor(url: string, init?: RequestInit & { cookies?: Record<string, string> }) {
      const cookieStore = init?.cookies ?? {};
      this.cookies = {
        get: (name: string) => cookieStore[name] ? { value: cookieStore[name]! } : undefined,
      };
      void url;
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      const res = new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { "Content-Type": "application/json" },
      });
      // Attach cookie management shim
      const deletedCookies: string[] = [];
      Object.defineProperty(res, "cookies", {
        value: {
          delete: (name: string) => deletedCookies.push(name),
          _deleted: deletedCookies,
        },
      });
      return res;
    },
  },
}));

import { POST } from "../route";

const makeReq = (sessionCookie?: string, sessionId?: string) => {
  const cookieStore: Record<string, string> = {};
  if (sessionCookie) cookieStore["__session"] = sessionCookie;
  if (sessionId) cookieStore["__session_id"] = sessionId;
  return { cookies: { get: (name: string) => cookieStore[name] ? { value: cookieStore[name] } : undefined } } as never;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockApplyRateLimit.mockResolvedValue({ success: true });
  mockGetOptionalSessionCookie.mockReturnValue("valid-session-cookie");
  mockVerifySessionCookie.mockResolvedValue({ uid: "uid-abc" });
  mockRevokeRefreshTokens.mockResolvedValue(undefined);
  mockRevokeSession.mockResolvedValue(undefined);
});

describe("POST /api/auth/logout", () => {
  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await POST(makeReq("cookie", "sess-id"));
    expect(res.status).toBe(429);
  });

  it("valid session cookie → verifySessionCookie called", async () => {
    await POST(makeReq("valid-cookie", "sess-id"));
    expect(mockVerifySessionCookie).toHaveBeenCalledWith("valid-session-cookie");
  });

  it("valid session → revokeRefreshTokens called with uid", async () => {
    await POST(makeReq("valid-cookie", "sess-id"));
    expect(mockRevokeRefreshTokens).toHaveBeenCalledWith("uid-abc");
  });

  it("valid session + sessionId → sessionRepository.revokeSession called", async () => {
    await POST(makeReq("valid-cookie", "sess-id"));
    expect(mockRevokeSession).toHaveBeenCalledWith("sess-id", "uid-abc");
  });

  it("no session cookie → revokeRefreshTokens NOT called", async () => {
    mockGetOptionalSessionCookie.mockReturnValue(null);
    await POST(makeReq(undefined, "sess-id"));
    expect(mockRevokeRefreshTokens).not.toHaveBeenCalled();
  });

  it("no sessionId → revokeSession NOT called", async () => {
    await POST(makeReq("valid-cookie"));
    expect(mockRevokeSession).not.toHaveBeenCalled();
  });

  it("expired/invalid session cookie (verifySessionCookie throws) → still returns 200", async () => {
    mockVerifySessionCookie.mockRejectedValue(new Error("expired"));
    const res = await POST(makeReq("expired", "sess-id"));
    expect(res.status).toBe(200);
  });

  it("revokeSession throws → still returns 200 (error swallowed)", async () => {
    mockRevokeSession.mockRejectedValue(new Error("Firestore error"));
    const res = await POST(makeReq("valid-cookie", "sess-id"));
    expect(res.status).toBe(200);
  });

  it("success → 200 with success: true", async () => {
    const res = await POST(makeReq("valid-cookie", "sess-id"));
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { success: boolean };
    expect(json.success).toBe(true);
  });
});
