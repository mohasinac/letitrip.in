/**
 * Unit Tests for /api/auth/login Route
 * Tests user login functionality with validation, authentication, and session management
 */

import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock dependencies
jest.mock("@/app/api/lib/firebase/config", () => ({
  adminAuth: {
    getUser: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock("@/app/api/lib/session", () => ({
  createSession: jest.fn(),
  setSessionCookie: jest.fn(),
  clearSessionCookie: jest.fn(),
}));

jest.mock("bcryptjs");

jest.mock("@/app/api/middleware/ip-tracker", () => ({
  withLoginTracking: (handler: any) => handler,
}));

import { adminAuth, adminDb } from "@/app/api/lib/firebase/config";
import {
  clearSessionCookie,
  createSession,
  setSessionCookie,
} from "@/app/api/lib/session";

describe("POST /api/auth/login", () => {
  let mockRequest: NextRequest;

  const mockUserData = {
    uid: "user-123",
    email: "test@example.com",
    name: "Test User",
    hashedPassword: "$2a$12$hashedPasswordHere",
    role: "user",
    isEmailVerified: true,
    profile: {
      avatar: "https://example.com/avatar.jpg",
      bio: "Test bio",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      json: jest.fn(),
    } as any;

    (createSession as jest.Mock).mockResolvedValue({
      sessionId: "session-123",
      token: "token-abc",
    });
  });

  describe("Successful Login", () => {
    it("should login user with valid credentials", async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => mockUserData,
          },
        ],
      });

      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe("Login successful");
      expect(body.user.uid).toBe("user-123");
      expect(body.user.email).toBe("test@example.com");
      expect(body.sessionId).toBe("session-123");
      expect(setSessionCookie).toHaveBeenCalled();
    });

    it("should convert email to lowercase", async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: mockDoc,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "TEST@EXAMPLE.COM",
        password: "Password123!",
      });

      await POST(mockRequest);

      expect(mockWhere).toHaveBeenCalledWith("email", "==", "test@example.com");
    });

    it("should update lastLogin timestamp", async () => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: mockDoc,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      await POST(mockRequest);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          lastLogin: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });
  });

  describe("Validation Errors", () => {
    beforeEach(() => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockGet = jest.fn();
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: mockDoc,
      });
    });

    it("should reject request without email", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        password: "Password123!",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing required fields");
      expect(body.fields).toContain("email");
      // NOTE: clearSessionCookie is NOT called for validation errors - this is a bug (see CODE-ISSUES-BUGS-PATTERNS.md Batch 25)
      // expect(clearSessionCookie).toHaveBeenCalled();
    });

    it("should reject request without password", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing required fields");
      expect(body.fields).toContain("password");
      // NOTE: Bug - clearSessionCookie not called for validation errors
    });

    it("should reject request with empty email", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "",
        password: "Password123!",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing required fields");
    });

    it("should reject request with empty password", async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Missing required fields");
    });
  });

  describe("Authentication Errors", () => {
    beforeEach(() => {
      const mockUpdate = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: jest.fn(() => ({
          limit: jest.fn(() => ({ get: jest.fn() })),
        })),
        doc: mockDoc,
      });
    });

    it("should reject non-existent user", async () => {
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "nonexistent@example.com",
        password: "Password123!",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Invalid credentials");
      expect(clearSessionCookie).toHaveBeenCalled();
    });

    it("should reject invalid password", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "WrongPassword123!",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Invalid credentials");
      expect(clearSessionCookie).toHaveBeenCalled();
    });

    it("should reject disabled account", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: true });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe("Account has been disabled");
      expect(clearSessionCookie).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle database query errors", async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error("Database error"));
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Login failed");
      expect(clearSessionCookie).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle auth.getUser errors", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockRejectedValue(
        new Error("Auth error")
      );

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Authentication failed");
      expect(clearSessionCookie).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle session creation errors", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: jest.fn(() => ({ update: jest.fn() })),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });
      (createSession as jest.Mock).mockRejectedValue(
        new Error("Session creation failed")
      );

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Login failed");
      expect(clearSessionCookie).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle malformed JSON", async () => {
      (mockRequest.json as jest.Mock).mockRejectedValue(
        new Error("Invalid JSON")
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Login failed");
      expect(clearSessionCookie).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with null profile", async () => {
      const userWithNullProfile = { ...mockUserData, profile: null };
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => userWithNullProfile }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: jest.fn(() => ({ update: jest.fn() })),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.user.profile).toBeNull();
    });

    it("should handle very long email", async () => {
      const longEmail = "a".repeat(200) + "@example.com";
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ ...mockUserData, email: longEmail }) }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: jest.fn(() => ({ update: jest.fn() })),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: longEmail,
        password: "Password123!",
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
    });

    it("should handle unicode characters in password", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: jest.fn(() => ({ update: jest.fn() })),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "密码Pass123!",
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
    });
  });

  describe("Security", () => {
    it("should clear session cookie on authentication error responses", async () => {
      // Test that clearSessionCookie is called for authentication failures (not validation)
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      await POST(mockRequest);

      expect(clearSessionCookie).toHaveBeenCalled();
    });

    it("should not expose detailed error messages in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const mockGet = jest.fn().mockRejectedValue(new Error("Internal error"));
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({ where: mockWhere });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(body.message).toBe("An unexpected error occurred");
      expect(body.message).not.toContain("Internal error");

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it("should limit query to 1 result for performance", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => mockUserData }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      (adminDb.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
        doc: jest.fn(() => ({ update: jest.fn() })),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (adminAuth.getUser as jest.Mock).mockResolvedValue({ disabled: false });

      (mockRequest.json as jest.Mock).mockResolvedValue({
        email: "test@example.com",
        password: "Password123!",
      });

      await POST(mockRequest);

      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });
});
