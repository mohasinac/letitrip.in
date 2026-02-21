/**
 * @jest-environment node
 */

/**
 * Profile API Integration Tests
 *
 * Tests:
 * - PATCH /api/user/profile (update profile)
 * - GET /api/profile/[userId]  (public profile)
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockRegularUser,
  getSeedUsers,
} from "./helpers";

// ============================================
// Mocks for PATCH /api/user/profile
// (uses verifySessionCookie + getRequiredSessionCookie)
// ============================================

const mockVerifySessionCookie = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  verifySessionCookie: (...args: unknown[]) => mockVerifySessionCookie(...args),
}));

const mockGetRequiredSessionCookie = jest.fn().mockReturnValue("test-session");
jest.mock("@/lib/api/request-helpers", () => ({
  getRequiredSessionCookie: (...args: unknown[]) =>
    mockGetRequiredSessionCookie(...args),
}));

const mockFindById = jest.fn();
const mockUpdateProfileWithVerificationReset = jest.fn();
jest.mock("@/repositories", () => ({
  userRepository: {
    findById: (...args: unknown[]) => mockFindById(...args),
    updateProfileWithVerificationReset: (...args: unknown[]) =>
      mockUpdateProfileWithVerificationReset(...args),
  },
}));

jest.mock("@/lib/security/authorization", () => ({
  requireRole: jest.fn(),
}));

jest.mock("@/lib/security/rate-limit", () => ({
  applyRateLimit: jest.fn().mockResolvedValue({ success: true }),
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
      this.name = "AuthenticationError";
    }
  }
  class ValidationError extends AppError {
    fields?: Record<string, string[]>;
    constructor(message: string, fields?: Record<string, string[]>) {
      super(400, message, "VALIDATION_ERROR");
      this.name = "ValidationError";
      this.fields = fields;
    }
    toJSON() {
      return {
        success: false,
        error: this.message,
        code: this.code,
        fields: this.fields,
      };
    }
  }
  class NotFoundError extends AppError {
    constructor(message: string) {
      super(404, message, "NOT_FOUND");
      this.name = "NotFoundError";
    }
  }
  class AuthorizationError extends AppError {
    constructor(message: string) {
      super(403, message, "FORBIDDEN");
      this.name = "AuthorizationError";
    }
  }
  return {
    AppError,
    AuthenticationError,
    ValidationError,
    NotFoundError,
    AuthorizationError,
    handleApiError: (error: unknown) => {
      const { NextResponse } = require("next/server");
      if (error instanceof AppError) {
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }
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
  UI_LABELS: {
    AUTH: { RATE_LIMIT_EXCEEDED: "Rate limit exceeded" },
  },
  ERROR_MESSAGES: {
    AUTH: { UNAUTHORIZED: "Unauthorized" },
    USER: {
      NOT_AUTHENTICATED: "Not authenticated",
      NOT_FOUND: "User not found",
    },
    DATABASE: { NOT_FOUND: "Not found" },
    GENERIC: {
      INTERNAL_ERROR: "Internal server error",
      USER_ID_REQUIRED: "User ID is required",
      PROFILE_PRIVATE: "This profile is private",
    },
    VALIDATION: { INVALID_INPUT: "Invalid input" },
    API: { PROFILE_UPDATE_ERROR: "Profile update error" },
  },
  SUCCESS_MESSAGES: {
    USER: { PROFILE_UPDATED: "Profile updated successfully" },
  },
}));

// ============================================
// Mocks for GET /api/profile/[userId]
// (uses Firestore directly)
// ============================================

const mockFirestoreGet = jest.fn();
const mockFirestoreDoc = jest.fn();
const mockFirestoreCollection = jest.fn();

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (...args: unknown[]) => mockFirestoreCollection(...args),
  }),
}));

jest.mock("@/lib/firebase/admin", () => ({
  getAdminApp: () => ({}),
}));

jest.mock("@/db/schema/users", () => ({
  USER_COLLECTION: "users",
}));

// ============================================
// Imports (after mocks)
// ============================================

import {
  GET as userProfileGET,
  PATCH as updatePATCH,
} from "../user/profile/route";
import { GET as profileGET } from "../profile/[userId]/route";

// ============================================
// Helpers
// ============================================

function setupFirestoreDoc(data: any = null) {
  mockFirestoreGet.mockResolvedValue({
    exists: !!data,
    data: () => data,
  });
  mockFirestoreDoc.mockReturnValue({ get: mockFirestoreGet });
  mockFirestoreCollection.mockReturnValue({ doc: mockFirestoreDoc });
}

function setupAuthenticatedUser(user: any = null) {
  if (user) {
    mockGetRequiredSessionCookie.mockReturnValue("test-session");
    mockVerifySessionCookie.mockResolvedValue({
      uid: user.uid,
      email: user.email,
      phone_number: user.phoneNumber,
    });
    mockFindById.mockResolvedValue(user);
  } else {
    const { AuthenticationError } = jest.requireMock("@/lib/errors");
    mockGetRequiredSessionCookie.mockImplementation(() => {
      throw new AuthenticationError("Unauthorized");
    });
    mockFindById.mockResolvedValue(null);
  }
}

// ============================================
// Tests: PATCH /api/user/profile (update)
// ============================================

describe("Profile API - PATCH /api/user/profile", () => {
  // Use seed data for realistic test users
  const seedUsers = getSeedUsers();
  const defaultUser = seedUsers.johnDoe;

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthenticatedUser(defaultUser);
  });

  it("updates profile and returns 200", async () => {
    mockUpdateProfileWithVerificationReset.mockResolvedValue({
      ...defaultUser,
      displayName: "Updated Name",
    });

    const req = buildRequest("/api/user/profile", {
      method: "PATCH",
      body: { displayName: "Updated Name" },
    });
    const res = await updatePATCH(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.displayName).toBe("Updated Name");
  });

  it("calls updateProfileWithVerificationReset", async () => {
    mockUpdateProfileWithVerificationReset.mockResolvedValue(defaultUser);

    const req = buildRequest("/api/user/profile", {
      method: "PATCH",
      body: { displayName: "New Name" },
    });
    await updatePATCH(req);

    expect(mockUpdateProfileWithVerificationReset).toHaveBeenCalledWith(
      defaultUser.uid,
      expect.objectContaining({ displayName: "New Name" }),
    );
  });

  it("returns verification reset info when email changes", async () => {
    mockUpdateProfileWithVerificationReset.mockResolvedValue({
      ...defaultUser,
      email: "new@example.com",
      emailVerified: false,
    });

    const req = buildRequest("/api/user/profile", {
      method: "PATCH",
      body: { email: "new@example.com" },
    });
    const res = await updatePATCH(req);
    const { body } = await parseResponse(res);

    expect(body.data.verificationReset.emailVerified).toBe(false);
  });

  it("returns 401 when not authenticated", async () => {
    setupAuthenticatedUser(null);

    const req = buildRequest("/api/user/profile", {
      method: "PATCH",
      body: { displayName: "Test" },
    });
    const res = await updatePATCH(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 400 for invalid email in body", async () => {
    const req = buildRequest("/api/user/profile", {
      method: "PATCH",
      body: { email: "not-an-email" },
    });
    const res = await updatePATCH(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(400);
  });

  it("handles repository errors", async () => {
    mockUpdateProfileWithVerificationReset.mockRejectedValue(
      new Error("DB error"),
    );

    const req = buildRequest("/api/user/profile", {
      method: "PATCH",
      body: { displayName: "Name" },
    });
    const res = await updatePATCH(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(500);
  });
});

// ============================================
// Tests: GET /api/profile/[userId]
// ============================================

describe("Profile API - GET /api/profile/[userId]", () => {
  const publicUserData = {
    uid: "user-pub-001",
    displayName: "Public User",
    email: "pub@example.com",
    phoneNumber: "+1234567890",
    photoURL: "https://example.com/photo.jpg",
    avatarMetadata: null,
    role: "user",
    createdAt: new Date(),
    publicProfile: {
      isPublic: true,
      showEmail: true,
      showPhone: false,
    },
    stats: { ordersCount: 5 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to call the dynamic route handler with params
  async function callProfileGET(userId: string) {
    const req = buildRequest(`/api/profile/${userId}`, { method: "GET" });
    return profileGET(req, { params: Promise.resolve({ userId }) });
  }

  it("returns 200 with public profile data", async () => {
    setupFirestoreDoc(publicUserData);

    const res = await callProfileGET("user-pub-001");
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.uid).toBe("user-pub-001");
    expect(body.data.displayName).toBe("Public User");
  });

  it("includes email when showEmail is true", async () => {
    setupFirestoreDoc(publicUserData);

    const res = await callProfileGET("user-pub-001");
    const { body } = await parseResponse(res);

    expect(body.data.email).toBe("pub@example.com");
  });

  it("excludes phone when showPhone is false", async () => {
    setupFirestoreDoc(publicUserData);

    const res = await callProfileGET("user-pub-001");
    const { body } = await parseResponse(res);

    expect(body.data.phoneNumber).toBeUndefined();
  });

  it("returns 404 for non-existent user", async () => {
    setupFirestoreDoc(null);

    const res = await callProfileGET("nonexistent");
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 403 for private profile", async () => {
    setupFirestoreDoc({
      ...publicUserData,
      publicProfile: { isPublic: false },
    });

    const res = await callProfileGET("user-priv-001");
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });

  it("includes stats in public profile", async () => {
    setupFirestoreDoc(publicUserData);

    const res = await callProfileGET("user-pub-001");
    const { body } = await parseResponse(res);

    expect(body.data.stats).toBeDefined();
    expect(body.data.stats.ordersCount).toBe(5);
  });

  it("includes role in public profile", async () => {
    setupFirestoreDoc(publicUserData);

    const res = await callProfileGET("user-pub-001");
    const { body } = await parseResponse(res);

    expect(body.data.role).toBe("user");
  });
});

// ============================================
// Tests: GET /api/user/profile (authenticated)
// ============================================

describe("Profile API - GET /api/user/profile", () => {
  const seedUsers = getSeedUsers();
  const defaultUser = seedUsers.johnDoe;

  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthenticatedUser(defaultUser);
  });

  it("returns 200 with the authenticated user's profile", async () => {
    const req = buildRequest("/api/user/profile", { method: "GET" });
    const res = await userProfileGET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.user?.uid ?? body.data?.uid).toBe(defaultUser.uid);
  });

  it("returns 401 when no session cookie is present", async () => {
    setupAuthenticatedUser(null);

    const req = buildRequest("/api/user/profile", { method: "GET" });
    const res = await userProfileGET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 401 when session cookie is invalid", async () => {
    mockGetRequiredSessionCookie.mockReturnValue("invalid-cookie");
    mockVerifySessionCookie.mockResolvedValueOnce(null);

    const req = buildRequest("/api/user/profile", { method: "GET" });
    const res = await userProfileGET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 401 when user is not found in the repository", async () => {
    mockFindById.mockResolvedValueOnce(null);

    const req = buildRequest("/api/user/profile", { method: "GET" });
    const res = await userProfileGET(req);
    const { status } = await parseResponse(res);

    // Route throws AuthenticationError (401) when user record is missing
    expect(status).toBe(401);
  });
});
