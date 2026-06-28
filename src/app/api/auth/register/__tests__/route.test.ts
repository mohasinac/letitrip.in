import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockApplyRateLimit,
  mockGetUserByEmail,
  mockCreateUser,
  mockCreateCustomToken,
  mockGenerateEmailVerificationLink,
  mockSetCustomUserClaims,
  mockCreateSessionCookie,
  mockCreateSession,
  mockUserCreateWithId,
  mockSendVerificationEmail,
  mockFetch,
} = vi.hoisted(() => ({
  mockApplyRateLimit: vi.fn(),
  mockGetUserByEmail: vi.fn(),
  mockCreateUser: vi.fn(),
  mockCreateCustomToken: vi.fn(),
  mockGenerateEmailVerificationLink: vi.fn(),
  mockSetCustomUserClaims: vi.fn(),
  mockCreateSessionCookie: vi.fn(),
  mockCreateSession: vi.fn(),
  mockUserCreateWithId: vi.fn(),
  mockSendVerificationEmail: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    getUserByEmail: mockGetUserByEmail,
    createUser: mockCreateUser,
    createCustomToken: mockCreateCustomToken,
    generateEmailVerificationLink: mockGenerateEmailVerificationLink,
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
  const handleApiError = (error: unknown) => {
    if (error instanceof ValidationError)
      return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { status: 400 });
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  };
  return {
    normalizeError: vi.fn(),
    ValidationError,
    getAdminApp: vi.fn(() => ({})),
    DEFAULT_USER_DATA: { bio: null, photoURL: null, stats: { totalOrders: 0 } },
    parseUserAgent: vi.fn(() => ({ browser: "Chrome" })),
    createSessionCookie: mockCreateSessionCookie,
    sessionRepository: { createSession: mockCreateSession },
    userRepository: { createWithId: mockUserCreateWithId },
    sendVerificationEmailWithLink: mockSendVerificationEmail,
    handleApiError,
    errorResponse: (msg: string, status = 400) =>
      new Response(JSON.stringify({ success: false, error: msg }), { status }),
    ERROR_MESSAGES: {
      VALIDATION: { INVALID_EMAIL: "Invalid email" },
      PASSWORD: { TOO_SHORT: "Password too short", NO_UPPERCASE: "Need uppercase", NO_LOWERCASE: "Need lowercase", NO_NUMBER: "Need number" },
      USER: { EMAIL_ALREADY_REGISTERED: "Email already registered", TERMS_NOT_ACCEPTED: "Must accept terms" },
      AUTH: { API_KEY_NOT_CONFIGURED: "API key missing", TOKEN_EXCHANGE_FAILED: "Token exchange failed" },
      GENERIC: { RATE_LIMIT_EXCEEDED: "Too many requests" },
    },
    SUCCESS_MESSAGES: { AUTH: { REGISTER_SUCCESS: "Registered" } },
    applyRateLimit: mockApplyRateLimit,
    RateLimitPresets: { AUTH: "auth" },
    serverLogger: { info: vi.fn(), error: vi.fn() },
  };
});

vi.stubGlobal("fetch", mockFetch);

import { POST } from "../route";

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  email: "newuser@test.com",
  password: "ValidPass1",
  displayName: "New User",
  acceptTerms: true,
};

const newUserRecord = {
  uid: "uid-new-456",
  email: "newuser@test.com",
  displayName: "New User",
  photoURL: null,
  emailVerified: false,
  metadata: { creationTime: "2026-01-01T00:00:00Z" },
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.FIREBASE_API_KEY = "test-api-key";
  mockApplyRateLimit.mockResolvedValue({ success: true });
  // Simulate user not found (allows registration to proceed)
  const notFoundErr: any = new Error("not found");
  notFoundErr.code = "auth/user-not-found";
  mockGetUserByEmail.mockRejectedValue(notFoundErr);
  mockCreateUser.mockResolvedValue(newUserRecord);
  mockCreateCustomToken.mockResolvedValue("custom-token-xyz");
  mockGenerateEmailVerificationLink.mockResolvedValue("https://verify.link/abc");
  mockSendVerificationEmail.mockResolvedValue(undefined);
  mockCreateSessionCookie.mockResolvedValue("session-cookie-xyz");
  mockCreateSession.mockResolvedValue({ id: "session-reg-id" });
  mockUserCreateWithId.mockResolvedValue(undefined);
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ idToken: "id-token-from-custom" }),
  });
});

describe("POST /api/auth/register", () => {
  it("rate limit exceeded → 429", async () => {
    mockApplyRateLimit.mockResolvedValue({ success: false });
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(429);
  });

  it("missing email → 400", async () => {
    const res = await POST(makeReq({ ...validBody, email: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("invalid email format → 400", async () => {
    const res = await POST(makeReq({ ...validBody, email: "not-email" }) as never);
    expect(res.status).toBe(400);
  });

  it("password too short (<8 chars) → 400", async () => {
    const res = await POST(makeReq({ ...validBody, password: "Ab1" }) as never);
    expect(res.status).toBe(400);
  });

  it("password without uppercase → 400", async () => {
    const res = await POST(makeReq({ ...validBody, password: "lowercase1" }) as never);
    expect(res.status).toBe(400);
  });

  it("password without lowercase → 400", async () => {
    const res = await POST(makeReq({ ...validBody, password: "UPPERCASE1" }) as never);
    expect(res.status).toBe(400);
  });

  it("password without number → 400", async () => {
    const res = await POST(makeReq({ ...validBody, password: "NoNumberHere" }) as never);
    expect(res.status).toBe(400);
  });

  it("acceptTerms: false → 400", async () => {
    const res = await POST(makeReq({ ...validBody, acceptTerms: false }) as never);
    expect(res.status).toBe(400);
  });

  it("email already registered (getUserByEmail succeeds) → 400 with EMAIL_ALREADY_REGISTERED", async () => {
    mockGetUserByEmail.mockResolvedValue({ uid: "existing", email: validBody.email });
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("registered");
  });

  it("valid input → auth.createUser called with correct email/password", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "newuser@test.com", password: "ValidPass1" }),
    );
  });

  it("valid input → userRepository.createWithId called with role: user", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockUserCreateWithId).toHaveBeenCalledWith(
      "uid-new-456",
      expect.objectContaining({ role: "user", emailVerified: false }),
    );
  });

  it("admin email → userRepository.createWithId called with role: admin", async () => {
    const adminBody = { ...validBody, email: "admin@letitrip.in" };
    mockCreateUser.mockResolvedValue({ ...newUserRecord, email: "admin@letitrip.in" });
    await POST(makeReq(adminBody) as never);
    expect(mockUserCreateWithId).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ role: "admin" }),
    );
  });

  it("valid input → createSessionCookie called", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockCreateSessionCookie).toHaveBeenCalledWith("id-token-from-custom");
  });

  it("valid input → sessionRepository.createSession called", async () => {
    await POST(makeReq(validBody) as never);
    expect(mockCreateSession).toHaveBeenCalledWith("uid-new-456", expect.any(Object));
  });

  it("valid input → 201 with user data", async () => {
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { success: boolean; user: { uid: string; role: string; emailVerified: boolean } };
    expect(json.success).toBe(true);
    expect(json.user.uid).toBe("uid-new-456");
    expect(json.user.role).toBe("user");
    expect(json.user.emailVerified).toBe(false);
  });

  it("valid input → sets __session cookie", async () => {
    const res = await POST(makeReq(validBody) as never);
    const cookies = res.headers.get("set-cookie");
    expect(cookies).toContain("__session");
  });

  it("token exchange fails (no idToken in response) → 400", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ error: "bad token" }),
    });
    const res = await POST(makeReq(validBody) as never);
    expect(res.status).toBe(400);
  });
});
