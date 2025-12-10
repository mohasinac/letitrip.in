/**
 * Unit Tests for Auth Module (auth.ts)
 * Tests the getAuthFromRequest functionality
 *
 * TESTS COVER:
 * - Getting authentication from request with valid session
 * - Handling missing session tokens
 * - Handling invalid/expired sessions
 * - User data fetching from Firestore
 * - Role retrieval and fallback logic
 * - Error handling for database failures
 * - Edge cases (missing user data, missing fields)
 *
 * CODE ISSUES FOUND:
 * 1. Silent failures - returns null instead of throwing errors in some cases
 * 2. Multiple database calls could be optimized
 * 3. No caching for frequently accessed user data
 * 4. Email fallback from session might be stale
 * 5. Error logging exposes potentially sensitive session data
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  getSessionToken,
  SessionData,
  verifySession,
} from "@/app/api/lib/session";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest } from "next/server";

// Mock dependencies
jest.mock("@/app/api/lib/session");
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/app/api/lib/firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn(),
  getFirebaseConfig: jest.fn(() => ({
    projectId: "test-project",
    clientEmail: "test@test.com",
    privateKey: "test-key",
  })),
}));

const mockGetSessionToken = getSessionToken as jest.MockedFunction<
  typeof getSessionToken
>;
const mockVerifySession = verifySession as jest.MockedFunction<
  typeof verifySession
>;
const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<
  typeof getFirestoreAdmin
>;

describe("auth.ts - getAuthFromRequest", () => {
  let mockRequest: NextRequest;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock request
    mockRequest = {
      url: "https://example.com/api/test",
      headers: new Map([["cookie", "session=test-token"]]),
    } as unknown as NextRequest;

    // Create mock Firestore
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
  });

  describe("Successful Authentication", () => {
    it("should return complete auth result for valid session", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
        created_at: "2024-01-01",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user).toEqual({
        uid: "user123",
        email: "test@example.com",
        name: "Test User",
      });
      expect(result.role).toBe("user");
      expect(result.session).toEqual(mockSession);
    });

    it("should fetch user data from correct collection", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          email: "test@example.com",
          name: "Test User",
          role: "user",
        }),
      });

      await getAuthFromRequest(mockRequest);

      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.USERS);
      expect(mockDb.doc).toHaveBeenCalledWith("user123");
    });

    it("should use email from user data over session email", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "old@example.com", // Old email in session
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "new@example.com", // Updated email in Firestore
        name: "Test User",
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("new@example.com");
    });

    it("should use role from user data over session role", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user", // Old role in session
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "admin", // Updated role in Firestore
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("admin");
    });

    it("should handle admin role", async () => {
      const mockSession: SessionData = {
        userId: "admin123",
        email: "admin@example.com",
        role: "admin",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("admin");
    });

    it("should handle seller role", async () => {
      const mockSession: SessionData = {
        userId: "seller123",
        email: "seller@example.com",
        role: "seller",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "seller@example.com",
        name: "Seller User",
        role: "seller",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("seller");
    });
  });

  describe("Missing or Invalid Session", () => {
    it("should return null result when no session token", async () => {
      mockGetSessionToken.mockReturnValue(null);

      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(mockVerifySession).not.toHaveBeenCalled();
    });

    it("should return null result when session verification fails", async () => {
      mockGetSessionToken.mockReturnValue("invalid-token");
      mockVerifySession.mockResolvedValue(null);

      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(mockDb.collection).not.toHaveBeenCalled();
    });

    it("should return null result when session is expired", async () => {
      mockGetSessionToken.mockReturnValue("expired-token");
      mockVerifySession.mockResolvedValue(null);

      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });

    it("should return null result when user does not exist", async () => {
      const mockSession: SessionData = {
        userId: "nonexistent",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({ exists: false });

      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });
  });

  describe("Fallback Logic", () => {
    it("should fallback to session email if user data has no email", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "session@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        // No email field
        name: "Test User",
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("session@example.com");
    });

    it("should use empty string if user data has no name", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        // No name field
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.name).toBe("");
    });

    it("should fallback to session role if user data has no role", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "seller",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        // No role field
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("seller");
    });

    it("should default to 'user' role if no role in data or session", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: null as any, // No role in session
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        // No role field
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("user");
    });
  });

  describe("Error Handling", () => {
    it("should return null result on getSessionToken error", async () => {
      mockGetSessionToken.mockImplementation(() => {
        throw new Error("Token error");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting auth from request:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should return null result on verifySession error", async () => {
      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockRejectedValue(new Error("Verification error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting auth from request:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should return null result on Firestore error", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockRejectedValue(new Error("Database error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting auth from request:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should log errors to console", async () => {
      mockGetSessionToken.mockImplementation(() => {
        throw new Error("Test error");
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      await getAuthFromRequest(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting auth from request:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle undefined user data gracefully", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => undefined,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("test@example.com");
      expect(result.user?.name).toBe("");
      expect(result.role).toBe("user");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as name", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "",
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.name).toBe("");
    });

    it("should handle null values in user data", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: null,
        name: null,
        role: null,
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("test@example.com"); // Fallback to session
      expect(result.user?.name).toBe(""); // Empty string for null
      expect(result.role).toBe("user"); // Fallback to session
    });

    it("should handle session with extra fields", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
        iat: 1234567890,
        exp: 1234567899,
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.session).toEqual(mockSession);
      expect(result.session?.iat).toBe(1234567890);
      expect(result.session?.exp).toBe(1234567899);
    });

    it("should handle user data with extra fields", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
        phone: "+1234567890",
        address: "123 Main St",
        created_at: "2024-01-01",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user).toEqual({
        uid: "user123",
        email: "test@example.com",
        name: "Test User",
      });
      // Extra fields should not be included in user object
    });

    it("should handle very long user names", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const longName = "A".repeat(1000);
      const mockUserData = {
        email: "test@example.com",
        name: longName,
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.name).toBe(longName);
      expect(result.user?.name.length).toBe(1000);
    });

    it("should handle special characters in user data", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test+tag@example.com",
        name: "Test User <script>alert('xss')</script>",
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("test+tag@example.com");
      expect(result.user?.name).toBe("Test User <script>alert('xss')</script>");
    });

    it("should handle empty session token string", async () => {
      mockGetSessionToken.mockReturnValue("");

      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });

    it("should handle whitespace-only name", async () => {
      const mockSession: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "session123",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "   ",
        role: "user",
      };

      mockGetSessionToken.mockReturnValue("test-token");
      mockVerifySession.mockResolvedValue(mockSession);
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.name).toBe("   ");
    });
  });
});
