/**
 * @jest-environment node
 */

// Mock dependencies BEFORE imports
jest.mock("../lib/firebase/config", () => ({
  adminAuth: {
    getUser: jest.fn(),
    createUser: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
  getFirestoreAdmin: jest.fn(),
}));
jest.mock("../lib/session");
jest.mock("bcryptjs");
jest.mock("@/app/api/lib/utils/rate-limiter", () => ({
  authRateLimiter: { check: jest.fn().mockReturnValue(true) },
  apiRateLimiter: { check: jest.fn().mockReturnValue(true) },
}));

import { NextRequest, NextResponse } from "next/server";
import { POST as loginPOST } from "./login/route";
import { POST as registerPOST } from "./register/route";
import { POST as logoutPOST } from "./logout/route";
import { GET as meGET } from "./me/route";
import { adminAuth, adminDb } from "../lib/firebase/config";
import {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getSessionToken,
  verifySession,
  deleteSession,
} from "../lib/session";
import bcrypt from "bcryptjs";

const mockAdminAuth = adminAuth as jest.Mocked<typeof adminAuth>;
const mockAdminDb = adminDb as jest.Mocked<typeof adminDb>;
const mockCreateSession = createSession as jest.MockedFunction<typeof createSession>;
const mockSetSessionCookie = setSessionCookie as jest.MockedFunction<typeof setSessionCookie>;
const mockClearSessionCookie = clearSessionCookie as jest.MockedFunction<typeof clearSessionCookie>;
const mockGetSessionToken = getSessionToken as jest.MockedFunction<typeof getSessionToken>;
const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
const mockDeleteSession = deleteSession as jest.MockedFunction<typeof deleteSession>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("POST /api/auth/login", () => {
  let mockCollection: any;
  let mockUserDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserDoc = {
      id: "user1",
      data: () => ({
        uid: "user1",
        email: "test@example.com",
        hashedPassword: "hashed_password",
        role: "user",
      }),
    };

    mockCollection = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [mockUserDoc],
      }),
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue(undefined),
      }),
    };

    (mockAdminDb.collection as jest.Mock).mockReturnValue(mockCollection);
    mockCreateSession.mockResolvedValue({
      sessionId: "session1",
      token: "token123",
    });
    mockBcrypt.compare.mockResolvedValue(true as never);
    mockAdminAuth.getUser.mockResolvedValue({ disabled: false } as any);
  });

  it("should require email and password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await loginPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
    expect(data.fields).toEqual(["email", "password"]);
  });

  it("should return 401 when user not found", async () => {
    mockCollection.get.mockResolvedValue({ empty: true, docs: [] });

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@example.com", password: "password" }),
    });

    const response = await loginPOST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid credentials");
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });

  it("should return 401 when password is invalid", async () => {
    mockBcrypt.compare.mockResolvedValue(false as never);

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" }),
    });

    const response = await loginPOST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid credentials");
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });

  it("should return 403 when account is disabled", async () => {
    mockAdminAuth.getUser.mockResolvedValue({ disabled: true } as any);

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });

    const response = await loginPOST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Account has been disabled");
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });

  it("should login successfully with valid credentials", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });

    const response = await loginPOST(request);

    expect(response.status).toBe(200);
    expect(mockCreateSession).toHaveBeenCalledWith(
      "user1",
      "test@example.com",
      "user",
      expect.any(Object)
    );
    expect(mockCollection.doc).toHaveBeenCalledWith("user1");
  });

  it("should update lastLogin timestamp", async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({ update: mockUpdate });

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });

    await loginPOST(request);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        lastLogin: expect.any(String),
        updatedAt: expect.any(String),
      })
    );
  });

  it("should normalize email to lowercase", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "TEST@EXAMPLE.COM", password: "password" }),
    });

    await loginPOST(request);

    expect(mockCollection.where).toHaveBeenCalledWith("email", "==", "test@example.com");
  });
});

describe("POST /api/auth/register", () => {
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue(undefined),
      }),
    };

    (mockAdminDb.collection as jest.Mock).mockReturnValue(mockCollection);
    mockAdminAuth.createUser.mockResolvedValue({ uid: "newuser1" } as any);
    mockBcrypt.hash.mockResolvedValue("hashed_password" as never);
    mockCreateSession.mockResolvedValue({
      sessionId: "session1",
      token: "token123",
    });
  });

  it("should require email, password, and name", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await registerPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing required fields");
    expect(data.fields).toEqual(["email", "password", "name"]);
  });

  it("should validate email format", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      }),
    });

    const response = await registerPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format");
  });

  it("should require password at least 8 characters", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "short",
        name: "Test User",
      }),
    });

    const response = await registerPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Password must be at least 8 characters long");
  });

  it("should reject duplicate email", async () => {
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [{ id: "existing" }],
    });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      }),
    });

    const response = await registerPOST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("User already exists");
  });

  it("should create user with valid data", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      }),
    });

    const response = await registerPOST(request);

    expect(response.status).toBe(201);
    expect(mockAdminAuth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newuser@example.com",
        displayName: "New User",
      })
    );
  });

  it("should default role to 'user' when not provided", async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({ set: mockSet });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      }),
    });

    await registerPOST(request);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "user",
      })
    );
  });

  it("should reject invalid roles", async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({ set: mockSet });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        role: "superadmin", // invalid
      }),
    });

    await registerPOST(request);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "user", // defaults to user
      })
    );
  });

  it("should hash password before storing", async () => {
    const mockSet = jest.fn().mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({ set: mockSet });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      }),
    });

    await registerPOST(request);

    expect(mockBcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        hashedPassword: "hashed_password",
      })
    );
  });
});

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSessionToken.mockReturnValue("token123");
    mockVerifySession.mockResolvedValue({
      sessionId: "session1",
      userId: "user1",
    } as any);
    mockDeleteSession.mockResolvedValue(undefined);
  });

  it("should logout successfully with valid session", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });

    const response = await logoutPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Logout successful");
    expect(mockDeleteSession).toHaveBeenCalledWith("session1");
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });

  it("should clear cookie even without session", async () => {
    mockGetSessionToken.mockReturnValue(null);

    const request = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });

    const response = await logoutPOST(request);

    expect(response.status).toBe(200);
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });

  it("should clear cookie even on error", async () => {
    mockVerifySession.mockRejectedValue(new Error("Verification failed"));

    const request = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });

    const response = await logoutPOST(request);

    expect(response.status).toBe(200);
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });
});

describe("GET /api/auth/me", () => {
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCollection = {
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            uid: "user1",
            email: "test@example.com",
            name: "Test User",
            role: "user",
            isEmailVerified: true,
            createdAt: "2025-01-01T00:00:00.000Z",
          }),
        }),
      }),
    };

    (mockAdminDb.collection as jest.Mock).mockReturnValue(mockCollection);
    mockGetSessionToken.mockReturnValue("token123");
    mockVerifySession.mockResolvedValue({
      sessionId: "session1",
      userId: "user1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    } as any);
  });

  it("should return 401 when no session token", async () => {
    mockGetSessionToken.mockReturnValue(null);

    const request = new NextRequest("http://localhost:3000/api/auth/me");
    const response = await meGET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 when session is invalid", async () => {
    mockVerifySession.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/auth/me");
    const response = await meGET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid or expired session");
  });

  it("should return 404 when user not found", async () => {
    mockCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    const request = new NextRequest("http://localhost:3000/api/auth/me");
    const response = await meGET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should return user data and session info", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/me");
    const response = await meGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toMatchObject({
      uid: "user1",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    });
    expect(data.session).toHaveProperty("sessionId", "session1");
    expect(data.session).toHaveProperty("expiresAt");
  });

  it("should handle database errors", async () => {
    mockCollection.doc.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    const request = new NextRequest("http://localhost:3000/api/auth/me");
    const response = await meGET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to get user data");
  });
});
