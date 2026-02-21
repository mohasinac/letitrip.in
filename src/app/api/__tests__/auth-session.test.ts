/**
 * @jest-environment node
 */

/**
 * Auth API — Session Tests
 *
 * POST /api/auth/session
 */

import { buildRequest, parseResponse } from "./helpers";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockVerifyIdToken = jest.fn();
const mockCreateSessionCookie = jest.fn();
const mockGetOptionalSessionCookie = jest.fn();

jest.mock("@/lib/firebase/auth-server", () => ({
  verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
  createSessionCookie: (...args: unknown[]) => mockCreateSessionCookie(...args),
  verifySessionCookie: jest.fn(),
  getOptionalSessionCookie: (...args: unknown[]) =>
    mockGetOptionalSessionCookie(...args),
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getOptionalSessionCookie: jest.fn().mockReturnValue(null),
}));

// Dynamic imports used inside session/route.ts need individual mocks
const mockGetUser = jest.fn();
jest.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    getUser: (...args: unknown[]) => mockGetUser(...args),
  }),
}));

const mockFirestoreDoc = jest.fn();
const mockFirestoreSet = jest.fn();
const mockFirestoreGet = jest.fn();
const mockFirestoreCollection = jest.fn();

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (...args: unknown[]) => mockFirestoreCollection(...args),
  }),
  FieldValue: {
    serverTimestamp: () => "SERVER_TIMESTAMP",
  },
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

const mockFindById = jest.fn();
const mockCreateSession = jest.fn();
jest.mock("@/repositories", () => ({
  userRepository: { findById: (...args: unknown[]) => mockFindById(...args) },
  sessionRepository: {
    createSession: (...args: unknown[]) => mockCreateSession(...args),
  },
}));

jest.mock("@/db/schema", () => ({
  parseUserAgent: () => ({ browser: "Test", os: "Test", device: "Desktop" }),
  SCHEMA_DEFAULTS: {
    ADMIN_EMAIL: "admin@test.com",
    USER_ROLE: "user",
    DEFAULT_DISPLAY_NAME: "User",
    UNKNOWN_USER_AGENT: "unknown",
  },
}));

jest.mock("@/db/schema/users", () => ({
  USER_COLLECTION: "users",
  DEFAULT_USER_DATA: { role: "user" },
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
  return {
    AppError,
    ValidationError,
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
    AUTH: { INVALID_CREDENTIALS: "Invalid credentials" },
  },
  UI_LABELS: {
    AUTH: { ID_TOKEN_REQUIRED: "ID token is required" },
  },
}));

import { POST } from "../auth/session/route";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth API — POST /api/auth/session", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockVerifyIdToken.mockResolvedValue({ uid: "user-123", email: "u@e.com" });
    mockCreateSessionCookie.mockResolvedValue("session-cookie-value");
    mockFindById.mockResolvedValue({ uid: "user-123", email: "u@e.com" });
    mockCreateSession.mockResolvedValue({ id: "session-id-abc" });

    // Set up Firestore collection chain
    const mockDocRef = {
      set: mockFirestoreSet,
      get: mockFirestoreGet.mockResolvedValue({
        exists: true,
        data: () => ({ uid: "user-123" }),
      }),
    };
    mockFirestoreDoc.mockReturnValue(mockDocRef);
    mockFirestoreCollection.mockReturnValue({ doc: mockFirestoreDoc });
  });

  it("returns 200 with sessionId when idToken is valid", async () => {
    const req = buildRequest("/api/auth/session", {
      method: "POST",
      body: { idToken: "valid-firebase-id-token" },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body).toHaveProperty("sessionId");
  });

  it("returns 400 when idToken is missing", async () => {
    const req = buildRequest("/api/auth/session", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("returns 400 when idToken verification fails (returns null)", async () => {
    mockVerifyIdToken.mockResolvedValueOnce(null);

    const req = buildRequest("/api/auth/session", {
      method: "POST",
      body: { idToken: "bad-token" },
    });
    const res = await POST(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("calls createSession with the verified uid", async () => {
    const req = buildRequest("/api/auth/session", {
      method: "POST",
      body: { idToken: "valid-firebase-id-token" },
    });
    await POST(req);

    expect(mockCreateSession).toHaveBeenCalledWith(
      "user-123",
      expect.any(Object),
    );
  });
});
