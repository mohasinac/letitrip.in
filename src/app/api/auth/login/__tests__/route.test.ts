import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockApplyRateLimit,
  mockGetUserByEmail,
  mockSetCustomUserClaims,
  mockCreateSessionCookie,
  mockCreateSession,
  mockFindUserById,
  mockUpdateLoginMetadata,
  mockParseUserAgent,
  mockFetch,
} = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockGetUserByEmail: vi.fn(),
  mockSetCustomUserClaims: vi.fn(),
  mockCreateSessionCookie: vi.fn(),
  mockCreateSession: vi.fn(),
  mockFindUserById: vi.fn(),
  mockUpdateLoginMetadata: vi.fn(),
  mockParseUserAgent: vi.fn(() => ({ browser: "Chrome", os: "Windows" })),
  mockFetch: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    getUserByEmail: mockGetUserByEmail,
    setCustomUserClaims: mockSetCustomUserClaims,
  })),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  SCHEMA_DEFAULTS: {
    USER_ROLE: "user",
    ADMIN_EMAIL: "admin@letitrip.in",
    UNKNOWN_USER_AGENT: "unknown",
  },
}));

vi.mock("@mohasinac/appkit", () => {
  class ValidationError extends Error {
    constructor(msg: string) { super(msg); this.name = "ValidationError"; }
  }
  class AuthenticationError extends Error {
    constructor(msg: string) { super(msg); this.name = "AuthenticationError"; }
  }
  class AppError extends Error {
    statusCode: number; code: string;
    constructor(statusCode: number, msg: string, code: string) {
      super(msg); this.statusCode = statusCode; this.code = code;
    }
  }
  const handleApiError = (error: unknown) => {
    if (error instanceof AuthenticationError)
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 401 });
    if (error instanceof ValidationError)
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
    if (error instanceof AppError)
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: (error as unknown as { statusCode: number }).statusCode,
      });
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  };
  return {
    normalizeError: vi.fn(),
    ValidationError,
    AuthenticationError,
    AppError,
    getAdminApp: vi.fn(() => ({})),
    parseUserAgent: mockParseUserAgent,
    createSessionCookie: mockCreateSessionCookie,
    sessionRepository: { createSession: mockCreateSession },
    userRepository: { findById: mockFindUserById, updateLoginMetadata: mockUpdateLoginMetadata },
    handleApiError,
    errorResponse: (msg: string, status = 400) =>
      new Response(JSON.stringify({ success: false, error: msg }), { status }),
    ERROR_MESSAGES: {
      VALIDATION: { INVALID_EMAIL: "Invalid email" },
      PASSWORD: { REQUIRED: "Password required" },
      AUTH: { INVALID_CREDENTIALS: "Invalid credentials" },
      USER: { ACCOUNT_DISABLED: "Account disabled" },
      GENERIC: { RATE_LIMIT_EXCEEDED: "Too many requests", SERVER_CONFIG_ERROR: "Server config error" },
    },
    SUCCESS_MESSAGES: { AUTH: { LOGIN_SUCCESS: "Logged in" } },
    applyRateLimit: mockApplyRateLimit,
    RateLimitPresets: { AUTH: "auth" },
    serverLogger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
  };
});

// Mock global fetch for Firebase REST API calls
vi.stubGlobal("fetch", mockFetch);

import { POST } from "../route";

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Test/1.0" },
    body: JSON.stringify(body),
  });
}

const validBody = { email: "user@test.com", password: "ValidPass1" };
const mockUserRecord = {
  uid: "uid-123",
  email: "user@test.com",
  displayName: "Test User",
  photoURL: null,
  emailVerified: true,
  disabled: false,
};
const mockUserData = { uid: "uid-123", email: "user@test.com", role: "user", phoneVerified: false };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.FIREBASE_API_KEY = "test-api-key";
  mockApplyRateLimit.mockResolvedValue({ success: true });
  mockGetUserByEmail.mockResolvedValue(mockUserRecord);
  mockFindUserById.mockResolvedValue(mockUserData);
  mockCreateSessionCookie.mockResolvedValue("mock-session-cookie");
  mockCreateSession.mockResolvedValue({ id: "session-id-abc" });
  mockUpdateLoginMetadata.mockResolvedValue(undefined);
  mockSetCustomUserClaims.mockResolvedValue(undefined);
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ idToken: "mock-id-token" }),
  });
});

describe("POST /api/auth/login", () => {
  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(429);
  });

  it("missing email → 400", async () => {
    const res = await POST(makeReq({ password: "ValidPass1" }) as never);
    expect(res.status).toBe(400);
  });

  it("invalid email format → 400", async () => {
    const res = await POST(makeReq({ email: "not-an-email", password: "pass" }) as never);
    expect(res.status).toBe(400);
  });

  it("missing password → 400", async () => {
    const res = await POST(makeReq({ email: "user@test.com" }) as never);
    expect(res.status).toBe(400);
  });

  it("unknown Firebase user (auth/user-not-found) → 401", async () => {
    const err: any = new Error("user not found");
    err.code = "auth/user-not-found";
    mockGetUserByEmail.mockRejectedValue(err);
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(401);
  });

  it("Firebase getUserByEmail throws unknown error → 500", async () => {
    mockGetUserByEmail.mockRejectedValue(new Error("Firestore unavailable"));
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(500);
  });

  it("account disabled → 401 with account-disabled message", async () => {
    mockGetUserByEmail.mockResolvedValue({ ...mockUserRecord, disabled: true });
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(401);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("disabled");
  });

  it("wrong password (REST API returns non-ok) → 401", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "INVALID_PASSWORD" } }),
    });
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(401);
  });

  it("FIREBASE_API_KEY not configured → 500", async () => {
    delete process.env.FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(500);
  });

  it("valid credentials → createSessionCookie called with idToken", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockCreateSessionCookie).toHaveBeenCalledWith("mock-id-token");
  });

  it("valid credentials → sessionRepository.createSession called", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockCreateSession).toHaveBeenCalledWith("uid-123", expect.objectContaining({ deviceInfo: expect.any(Object) }));
  });

  it("valid credentials → setCustomUserClaims called with user role", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("uid-123", { role: "user" });
  });

  it("valid credentials → updateLoginMetadata called", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockUpdateLoginMetadata).toHaveBeenCalledWith("uid-123");
  });

  it("valid credentials → 200 with user data", async () => {
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { success: boolean; user: { uid: string; role: string } };
    expect(json.success).toBe(true);
    expect(json.user.uid).toBe("uid-123");
    expect(json.user.role).toBe("user");
  });

  it("valid credentials → sets __session cookie", async () => {
    const res = await POST(makeReq(validBody) as never);
    const cookies = res.headers.get("set-cookie");
    expect(cookies).toContain("__session");
  });

  it("valid credentials → sessionId included in response body", async () => {
    const res = await POST(makeReq(validBody) as never);
    const json = await res.clone().json() as { sessionId: string };
    expect(json.sessionId).toBe("session-id-abc");
  });

  it("user not in Firestore → falls back to SCHEMA_DEFAULTS.USER_ROLE", async () => {
    mockFindUserById.mockResolvedValue(null);
    const res = await POST(makeReq(validBody) as never);
    const json = await res.clone().json() as { user: { role: string } };
    expect(json.user.role).toBe("user");
  });
});
