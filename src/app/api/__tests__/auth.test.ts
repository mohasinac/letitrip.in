/**
 * @jest-environment node
 */

/**
 * Auth API Integration Tests
 *
 * Tests POST /api/auth/login, POST /api/auth/register
 */

import { buildRequest, parseResponse } from "./helpers";

// ============================================
// Mocks
// ============================================

const mockGetUserByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockCreateCustomToken = jest.fn();
const mockGenerateEmailVerificationLink = jest.fn();

jest.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args),
    createUser: (...args: unknown[]) => mockCreateUser(...args),
    createCustomToken: (...args: unknown[]) => mockCreateCustomToken(...args),
    generateEmailVerificationLink: (...args: unknown[]) =>
      mockGenerateEmailVerificationLink(...args),
  }),
}));

const mockFirestoreDoc = jest.fn();
const mockFirestoreSet = jest.fn();
const mockFirestoreUpdate = jest.fn();
const mockFirestoreGet = jest.fn();
const mockFirestoreCollection = jest.fn();

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (...args: unknown[]) => mockFirestoreCollection(...args),
  }),
  FieldValue: {
    serverTimestamp: () => "SERVER_TIMESTAMP",
    increment: (n: number) => `INCREMENT_${n}`,
  },
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

const mockCreateSessionCookie = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  createSessionCookie: (...args: unknown[]) => mockCreateSessionCookie(...args),
}));

const mockCreateSession = jest.fn();
jest.mock("@/repositories", () => ({
  sessionRepository: {
    createSession: (...args: unknown[]) => mockCreateSession(...args),
  },
}));

jest.mock("@/db/schema/users", () => ({
  USER_COLLECTION: "users",
  DEFAULT_USER_DATA: { role: "user", emailVerified: false, disabled: false },
}));

jest.mock("@/db/schema/sessions", () => ({
  parseUserAgent: (ua: string) => ({
    browser: "Test",
    os: "Test",
    device: "Desktop",
  }),
}));

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.name = "AppError";
    }
    toJSON() {
      return { success: false, error: this.message, code: this.code };
    }
  }
  class ValidationError extends AppError {
    constructor(message: string) {
      super(400, message, "VALIDATION_ERROR");
      this.name = "ValidationError";
    }
  }
  class AuthenticationError extends AppError {
    constructor(message: string) {
      super(401, message, "AUTH_ERROR");
      this.name = "AuthenticationError";
    }
  }
  return {
    AppError,
    ValidationError,
    AuthenticationError,
    handleApiError: (error: unknown) => {
      if (error instanceof AppError) {
        const { NextResponse } = require("next/server");
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }
      const { NextResponse } = require("next/server");
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    },
  };
});

jest.mock("@/lib/errors/error-handler", () => {
  const errors = jest.requireMock("@/lib/errors");
  return {
    handleApiError: errors.handleApiError,
    logError: jest.fn(),
  };
});

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    VALIDATION: { INVALID_EMAIL: "Invalid email" },
    PASSWORD: {
      REQUIRED: "Password is required",
      TOO_SHORT: "Password too short",
      NO_UPPERCASE: "Missing uppercase",
      NO_LOWERCASE: "Missing lowercase",
      NO_NUMBER: "Missing number",
    },
    AUTH: { INVALID_CREDENTIALS: "Invalid email or password" },
    USER: {
      ACCOUNT_DISABLED: "Account is disabled",
      EMAIL_ALREADY_REGISTERED: "Email already registered",
    },
  },
  SUCCESS_MESSAGES: {
    AUTH: {
      LOGIN_SUCCESS: "Login successful",
      REGISTER_SUCCESS: "Registration successful",
    },
  },
}));

// Need to mock global fetch for Firebase REST API
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

import { POST as loginPOST } from "../auth/login/route";
import { POST as registerPOST } from "../auth/register/route";

// ============================================
// Setup for Firestore chain mocks
// ============================================

function setupFirestoreChain(docData: any = null) {
  const docRef = {
    get: mockFirestoreGet.mockResolvedValue({
      exists: !!docData,
      data: () => docData,
    }),
    set: mockFirestoreSet.mockResolvedValue(undefined),
    update: mockFirestoreUpdate.mockResolvedValue(undefined),
  };
  mockFirestoreDoc.mockReturnValue(docRef);
  mockFirestoreCollection.mockReturnValue({ doc: mockFirestoreDoc });
}

// ============================================
// Tests
// ============================================

describe("Auth API - POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FIREBASE_API_KEY = "test-api-key";

    // Default: user exists, password correct
    mockGetUserByEmail.mockResolvedValue({
      uid: "user-123",
      email: "test@example.com",
      displayName: "Test User",
      photoURL: null,
      emailVerified: true,
      disabled: false,
    });

    // Firebase REST API returns id token
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ idToken: "mock-id-token" }),
    });

    setupFirestoreChain({ role: "user", phoneVerified: false });
    mockCreateSessionCookie.mockResolvedValue("mock-session-cookie");
    mockCreateSession.mockResolvedValue({ id: "session-123" });
  });

  it("returns 200 on successful login", async () => {
    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "test@example.com", password: "Password123" },
    });
    const res = await loginPOST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user.uid).toBe("user-123");
  });

  it("returns session ID on successful login", async () => {
    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "test@example.com", password: "Password123" },
    });
    const res = await loginPOST(req);
    const { body } = await parseResponse(res);

    expect(body.sessionId).toBe("session-123");
  });

  it("sets session cookies on successful login", async () => {
    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "test@example.com", password: "Password123" },
    });
    const res = await loginPOST(req);

    const cookies = res.headers.getSetCookie?.() || [];
    const cookieStr = cookies.join("; ");
    expect(cookieStr).toContain("__session");
  });

  it("returns 400 for invalid email format", async () => {
    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "not-an-email", password: "Password123" },
    });
    const res = await loginPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 for missing password", async () => {
    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "test@example.com", password: "" },
    });
    const res = await loginPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 401 for non-existent user", async () => {
    mockGetUserByEmail.mockRejectedValue({ code: "auth/user-not-found" });

    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "noone@example.com", password: "Password123" },
    });
    const res = await loginPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 401 for disabled account", async () => {
    mockGetUserByEmail.mockResolvedValue({
      uid: "user-123",
      email: "disabled@example.com",
      disabled: true,
    });

    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "disabled@example.com", password: "Password123" },
    });
    const res = await loginPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: "INVALID_PASSWORD" } }),
    });

    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "test@example.com", password: "WrongPassword1" },
    });
    const res = await loginPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("creates a session in Firestore", async () => {
    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "test@example.com", password: "Password123" },
    });
    await loginPOST(req);

    expect(mockCreateSession).toHaveBeenCalledWith(
      "user-123",
      expect.any(Object),
    );
  });

  it("updates login metadata", async () => {
    const req = buildRequest("/api/auth/login", {
      method: "POST",
      body: { email: "test@example.com", password: "Password123" },
    });
    await loginPOST(req);

    expect(mockFirestoreUpdate).toHaveBeenCalled();
  });
});

describe("Auth API - POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // User does not exist
    mockGetUserByEmail.mockRejectedValue({ code: "auth/user-not-found" });

    // Create user returns record
    mockCreateUser.mockResolvedValue({
      uid: "new-user-123",
      email: "new@example.com",
      displayName: "New User",
      photoURL: null,
      emailVerified: false,
      metadata: { creationTime: new Date().toISOString() },
    });

    mockCreateCustomToken.mockResolvedValue("custom-token");
    mockCreateSessionCookie.mockResolvedValue("mock-session-cookie");
    mockCreateSession.mockResolvedValue({ id: "session-456" });
    mockGenerateEmailVerificationLink.mockResolvedValue("https://verify.link");
    setupFirestoreChain(null);
  });

  it("returns 201 on successful registration", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: {
        email: "new@example.com",
        password: "Password123",
        displayName: "New User",
        acceptTerms: true,
      },
    });
    const res = await registerPOST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.user.uid).toBe("new-user-123");
  });

  it("creates user with Firebase Admin SDK", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: {
        email: "new@example.com",
        password: "Password123",
        displayName: "New User",
        acceptTerms: true,
      },
    });
    await registerPOST(req);

    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@example.com",
        password: "Password123",
      }),
    );
  });

  it("stores user in Firestore", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: {
        email: "new@example.com",
        password: "Password123",
        acceptTerms: true,
      },
    });
    await registerPOST(req);

    expect(mockFirestoreSet).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "new-user-123",
        email: "new@example.com",
      }),
    );
  });

  it("assigns admin role for admin@letitrip.in", async () => {
    mockGetUserByEmail.mockRejectedValue({ code: "auth/user-not-found" });
    mockCreateUser.mockResolvedValue({
      uid: "admin-123",
      email: "admin@letitrip.in",
      displayName: "Admin",
      photoURL: null,
      emailVerified: false,
      metadata: { creationTime: new Date().toISOString() },
    });

    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: {
        email: "admin@letitrip.in",
        password: "Password123",
        acceptTerms: true,
      },
    });
    await registerPOST(req);

    expect(mockFirestoreSet).toHaveBeenCalledWith(
      expect.objectContaining({ role: "admin" }),
    );
  });

  it("assigns user role for regular emails", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: {
        email: "regular@example.com",
        password: "Password123",
        acceptTerms: true,
      },
    });
    await registerPOST(req);

    expect(mockFirestoreSet).toHaveBeenCalledWith(
      expect.objectContaining({ role: "user" }),
    );
  });

  it("returns 400 for invalid email", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: { email: "bad-email", password: "Password123" },
    });
    const res = await registerPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 for weak password (too short)", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: { email: "test@example.com", password: "Sh0rt" },
    });
    const res = await registerPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 for password missing uppercase", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: { email: "test@example.com", password: "password123" },
    });
    const res = await registerPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 for existing email", async () => {
    // User exists — getUserByEmail succeeds
    mockGetUserByEmail.mockResolvedValue({
      uid: "existing",
      email: "test@example.com",
    });

    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: { email: "test@example.com", password: "Password123" },
    });
    const res = await registerPOST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("creates a session after registration", async () => {
    const req = buildRequest("/api/auth/register", {
      method: "POST",
      body: {
        email: "new@example.com",
        password: "Password123",
        acceptTerms: true,
      },
    });
    await registerPOST(req);

    expect(mockCreateSession).toHaveBeenCalledWith(
      "new-user-123",
      expect.any(Object),
    );
  });
});
