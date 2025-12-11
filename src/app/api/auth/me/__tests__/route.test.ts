import { NextRequest } from "next/server";

// Mock dependencies BEFORE importing route
jest.mock("../../../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {
    collection: jest.fn(),
  },
}));
jest.mock("../../../lib/session");
jest.mock("@/app/api/lib/utils/rate-limiter");

// Import after mocking
import { apiRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { COLLECTIONS } from "@/constants/database";
import { adminDb } from "../../../lib/firebase/config";
import { getSessionToken, verifySession } from "../../../lib/session";
import { GET } from "../route";

describe("GET /api/auth/me", () => {
  let mockRequest: NextRequest;

  const mockUserData = {
    uid: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    isEmailVerified: true,
    profile: {
      avatar: "https://example.com/avatar.jpg",
      bio: "Test bio",
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    lastLogin: "2024-01-15T10:30:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for rate limiter
    (apiRateLimiter.check as jest.Mock).mockReturnValue(true);

    // Default request
    mockRequest = {
      headers: {
        get: jest.fn((key) => {
          if (key === "x-forwarded-for") return "192.168.1.1";
          return null;
        }),
      },
    } as any;
  });

  describe("Successful Responses", () => {
    beforeEach(() => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
        exp: 1705320000, // Unix timestamp
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);
    });

    it("should return current user data with valid session", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        uid: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isEmailVerified: true,
        profile: {
          avatar: "https://example.com/avatar.jpg",
          bio: "Test bio",
        },
        createdAt: "2024-01-01T00:00:00.000Z",
        lastLogin: "2024-01-15T10:30:00.000Z",
      });
    });

    it("should return session information", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.session).toEqual({
        sessionId: "session-123",
        expiresAt: "2024-01-15T12:00:00.000Z", // exp * 1000 converted to ISO (1705320000 * 1000)
      });
    });

    it("should query correct user document", async () => {
      await GET(mockRequest);

      expect(adminDb.collection).toHaveBeenCalledWith(COLLECTIONS.USERS);
      const mockDoc = (adminDb.collection as jest.Mock).mock.results[0].value
        .doc;
      expect(mockDoc).toHaveBeenCalledWith("user-123");
    });

    it("should handle session without expiry", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
        // exp is undefined
      });

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.session.expiresAt).toBeNull();
    });

    it("should handle user with partial profile", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          uid: "user-123",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          isEmailVerified: false,
          profile: null,
        }),
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.profile).toBeNull();
    });
  });

  describe("Authentication Errors", () => {
    it("should reject request without token", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(data.message).toBe("No session found");
      expect(verifySession).not.toHaveBeenCalled();
    });

    it("should reject request with empty token", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("");

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should reject request with invalid session", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("invalid-token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(data.message).toBe("Invalid or expired session");
    });

    it("should reject request with expired session", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("expired-token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe("Invalid or expired session");
    });
  });

  describe("User Not Found", () => {
    beforeEach(() => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "non-existent-user",
      });
    });

    it("should return 404 when user document does not exist", async () => {
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
    });

    it("should query user document even if not found", async () => {
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      await GET(mockRequest);

      expect(mockDoc).toHaveBeenCalledWith("non-existent-user");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
      });
    });

    it("should handle session verification errors", async () => {
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Verification failed")
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to get user data");
    });

    it("should handle database query errors", async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error("Database error"));
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to get user data");
    });

    it("should not expose error details in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Sensitive error details")
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.message).toBe("An unexpected error occurred");
      expect(data.message).not.toContain("Sensitive");

      process.env.NODE_ENV = originalEnv;
    });

    it("should expose error details in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Dev error details")
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.message).toBe("Dev error details");

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);
    });

    it("should check rate limit before processing", async () => {
      await GET(mockRequest);

      expect(apiRateLimiter.check).toHaveBeenCalledWith("192.168.1.1");
    });

    it("should reject request when rate limit exceeded", async () => {
      (apiRateLimiter.check as jest.Mock).mockReturnValue(false);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Too many requests. Please try again later.");
      expect(getSessionToken).not.toHaveBeenCalled();
    });

    it("should use x-forwarded-for header for rate limiting", async () => {
      mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === "x-forwarded-for") return "203.0.113.1";
            return null;
          }),
        },
      } as any;

      await GET(mockRequest);

      expect(apiRateLimiter.check).toHaveBeenCalledWith("203.0.113.1");
    });

    it("should use x-real-ip header as fallback", async () => {
      mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === "x-real-ip") return "198.51.100.1";
            return null;
          }),
        },
      } as any;

      await GET(mockRequest);

      expect(apiRateLimiter.check).toHaveBeenCalledWith("198.51.100.1");
    });

    it("should use 'unknown' when no IP headers present", async () => {
      mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      } as any;

      await GET(mockRequest);

      expect(apiRateLimiter.check).toHaveBeenCalledWith("unknown");
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
      });
    });

    it("should handle user data with undefined fields", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          uid: "user-123",
          email: "test@example.com",
          // All other fields undefined
        }),
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.name).toBeUndefined();
      expect(data.user.role).toBeUndefined();
      expect(data.user.profile).toBeUndefined();
    });

    it("should handle session with very large exp timestamp", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
        exp: 9999999999, // Far future
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session.expiresAt).toBeTruthy();
    });

    it("should handle session with zero exp timestamp", async () => {
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
        exp: 0,
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Zero is falsy, so it returns null (exp ? ... : null pattern)
      expect(data.session.expiresAt).toBeNull();
    });

    it("should handle null user data from document", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => null,
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      // null?.uid returns undefined, not null
      expect(data.user.uid).toBeUndefined();
      expect(data.user.email).toBeUndefined();
    });
  });

  describe("Security", () => {
    beforeEach(() => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-123",
      });

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          ...mockUserData,
          hashedPassword: "hashed-password-value",
          internalField: "sensitive-data",
        }),
      });
      const mockDoc = jest.fn(() => ({ get: mockGet }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);
    });

    it("should not expose hashed password", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.user.hashedPassword).toBeUndefined();
    });

    it("should not expose internal fields", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.user.internalField).toBeUndefined();
    });

    it("should only return whitelisted fields", async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      const userKeys = Object.keys(data.user);
      const allowedKeys = [
        "uid",
        "email",
        "name",
        "role",
        "isEmailVerified",
        "profile",
        "createdAt",
        "lastLogin",
      ];

      expect(userKeys.every((key) => allowedKeys.includes(key))).toBe(true);
    });

    it("should verify session token from request", async () => {
      await GET(mockRequest);

      expect(getSessionToken).toHaveBeenCalledWith(mockRequest);
    });

    it("should verify session before querying database", async () => {
      await GET(mockRequest);

      expect(verifySession).toHaveBeenCalledWith("valid-token");
      expect(adminDb.collection).toHaveBeenCalled();
    });
  });
});
