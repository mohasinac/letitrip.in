import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockApplyRateLimit,
  mockVerifyIdToken,
  mockVerifySessionCookie,
  mockGetUser,
  mockSetCustomUserClaims,
  mockCreateSessionCookie,
  mockCreateSession,
  mockRevokeSession,
  mockFindUserById,
  mockUserCreateWithId,
  mockGetOptionalSessionCookie,
} = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockVerifyIdToken: vi.fn(),
  mockVerifySessionCookie: vi.fn(),
  mockGetUser: vi.fn(),
  mockSetCustomUserClaims: vi.fn(),
  mockCreateSessionCookie: vi.fn(),
  mockCreateSession: vi.fn(),
  mockRevokeSession: vi.fn(),
  mockFindUserById: vi.fn(),
  mockUserCreateWithId: vi.fn(),
  mockGetOptionalSessionCookie: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    getUser: mockGetUser,
    setCustomUserClaims: mockSetCustomUserClaims,
  })),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  SCHEMA_DEFAULTS: {
    USER_ROLE: "user",
    ADMIN_EMAIL: "admin@letitrip.in",
    UNKNOWN_USER_AGENT: "unknown",
    DEFAULT_DISPLAY_NAME: "User",
  },
}));

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
    normalizeError: vi.fn(),
    ValidationError,
    getAdminApp: vi.fn(() => ({})),
    createSessionCookie: mockCreateSessionCookie,
    verifyIdToken: mockVerifyIdToken,
    verifySessionCookie: mockVerifySessionCookie,
    getOptionalSessionCookie: mockGetOptionalSessionCookie,
    parseUserAgent: vi.fn(() => ({ browser: "Chrome", os: "Windows" })),
    sessionRepository: { createSession: mockCreateSession, revokeSession: mockRevokeSession },
    userRepository: { findById: mockFindUserById, createWithId: mockUserCreateWithId },
    handleApiError,
    ERROR_MESSAGES: { AUTH: { INVALID_CREDENTIALS: "Invalid credentials" } },
    applyRateLimit: mockApplyRateLimit,
    RateLimitPresets: { AUTH: "auth" },
    serverLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
  };
});

import { POST, DELETE } from "../route";

const decodedToken = { uid: "uid-abc", email: "user@test.com" };
const userProfile = { uid: "uid-abc", email: "user@test.com", role: "user" };
const authUser = {
  uid: "uid-abc",
  email: "user@test.com",
  displayName: "Test User",
  photoURL: null,
  emailVerified: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockApplyRateLimit.mockResolvedValue({ success: true });
  mockVerifyIdToken.mockResolvedValue(decodedToken);
  mockVerifySessionCookie.mockResolvedValue(decodedToken);
  mockFindUserById.mockResolvedValue(userProfile);
  mockGetUser.mockResolvedValue(authUser);
  mockSetCustomUserClaims.mockResolvedValue(undefined);
  mockCreateSessionCookie.mockResolvedValue("session-cookie");
  mockCreateSession.mockResolvedValue({ id: "sess-id-xyz" });
  mockUserCreateWithId.mockResolvedValue(undefined);
  mockRevokeSession.mockResolvedValue(undefined);
  mockGetOptionalSessionCookie.mockReturnValue("existing-cookie");
});

describe("POST /api/auth/session — create session from ID token", () => {
  const makePostReq = (body: unknown) =>
    new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await POST(makePostReq({ idToken: "tok" }) as never);
    expect(res.status).toBe(429);
  });

  it("missing idToken → 400", async () => {
    const res = await POST(makePostReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("invalid idToken (verifyIdToken returns null) → 400", async () => {
    mockVerifyIdToken.mockResolvedValue(null);
    const res = await POST(makePostReq({ idToken: "bad-token" }) as never);
    expect(res.status).toBe(400);
  });

  it("existing user profile → setCustomUserClaims with existing role", async () => {
    await POST(makePostReq({ idToken: "valid-tok" }) as never);
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("uid-abc", { role: "user" });
    expect(mockUserCreateWithId).not.toHaveBeenCalled();
  });

  it("no user profile (OAuth) → creates profile via createWithId", async () => {
    mockFindUserById.mockResolvedValue(null);
    await POST(makePostReq({ idToken: "valid-tok" }) as never);
    expect(mockUserCreateWithId).toHaveBeenCalledWith(
      "uid-abc",
      expect.objectContaining({ uid: "uid-abc" }),
    );
  });

  it("no user profile + admin email → role set to admin", async () => {
    mockFindUserById.mockResolvedValue(null);
    mockGetUser.mockResolvedValue({ ...authUser, email: "admin@letitrip.in" });
    mockVerifyIdToken.mockResolvedValue({ uid: "uid-abc", email: "admin@letitrip.in" });
    await POST(makePostReq({ idToken: "valid-tok" }) as never);
    expect(mockUserCreateWithId).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ role: "admin" }),
    );
  });

  it("valid token → createSessionCookie called", async () => {
    await POST(makePostReq({ idToken: "valid-tok" }) as never);
    expect(mockCreateSessionCookie).toHaveBeenCalledWith("valid-tok");
  });

  it("valid token → sessionRepository.createSession called with uid", async () => {
    await POST(makePostReq({ idToken: "valid-tok" }) as never);
    expect(mockCreateSession).toHaveBeenCalledWith("uid-abc", expect.any(Object));
  });

  it("valid token → 200 with sessionId", async () => {
    const res = await POST(makePostReq({ idToken: "valid-tok" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { success: boolean; sessionId: string };
    expect(json.success).toBe(true);
    expect(json.sessionId).toBe("sess-id-xyz");
  });

  it("valid token → sets __session cookie", async () => {
    const res = await POST(makePostReq({ idToken: "valid-tok" }) as never);
    const cookies = res.headers.get("set-cookie");
    expect(cookies).toContain("__session");
  });

  it("IP from x-forwarded-for anonymized (last octet replaced)", async () => {
    const req = new Request("http://localhost/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.100",
      },
      body: JSON.stringify({ idToken: "valid-tok" }),
    });
    await POST(req as never);
    const call = mockCreateSession.mock.calls[0][1] as { deviceInfo: { ip: string } };
    expect(call.deviceInfo.ip).toBe("192.168.1.xxx");
  });
});

describe("DELETE /api/auth/session — logout/revoke session", () => {
  // NextRequest.cookies is not available on plain Request — add it manually
  const makeDeleteReq = (sessionCookie?: string, sessionId?: string) => {
    const headers: Record<string, string> = {};
    const cookieParts: string[] = [];
    if (sessionCookie) cookieParts.push(`__session=${sessionCookie}`);
    if (sessionId) cookieParts.push(`__session_id=${sessionId}`);
    if (cookieParts.length) headers["Cookie"] = cookieParts.join("; ");
    const req = new Request("http://localhost/api/auth/session", { method: "DELETE", headers });
    Object.defineProperty(req, "cookies", {
      value: {
        get: (name: string) => {
          const raw = headers["Cookie"] ?? "";
          for (const part of raw.split(";")) {
            const [k, v] = part.trim().split("=");
            if (k?.trim() === name) return { value: v?.trim() };
          }
          return undefined;
        },
      },
    });
    return req;
  };

  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await DELETE(makeDeleteReq("cookie", "sess-id") as never);
    expect(res.status).toBe(429);
  });

  it("valid session + sessionId → revokeSession called", async () => {
    await DELETE(makeDeleteReq("valid-cookie", "sess-id") as never);
    expect(mockRevokeSession).toHaveBeenCalledWith("sess-id", "uid-abc");
  });

  it("no session cookie → revokeSession NOT called", async () => {
    mockGetOptionalSessionCookie.mockReturnValue(null);
    await DELETE(makeDeleteReq(undefined, "sess-id") as never);
    expect(mockRevokeSession).not.toHaveBeenCalled();
  });

  it("expired session cookie (verifySessionCookie throws) → still clears cookies", async () => {
    mockVerifySessionCookie.mockRejectedValue(new Error("expired"));
    const res = await DELETE(makeDeleteReq("expired-cookie", "sess-id") as never);
    expect(res.status).toBe(200);
  });

  it("always → 200 and clears __session + __session_id cookies", async () => {
    const res = await DELETE(makeDeleteReq("valid-cookie", "sess-id") as never);
    expect(res.status).toBe(200);
    const cookies = res.headers.get("set-cookie");
    // Cookies being cleared (max-age=0 or similar)
    expect(cookies).toMatch(/__session/);
  });
});
