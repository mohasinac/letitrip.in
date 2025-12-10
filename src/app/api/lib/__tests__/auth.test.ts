/**
 * Unit Tests for Authentication Module
 * Testing auth helpers for API routes
 */

import { NextRequest } from "next/server";
import { getAuthFromRequest } from "../auth";
import { getFirestoreAdmin } from "../firebase/admin";
import { getSessionToken, verifySession } from "../session";

// Mock dependencies
jest.mock("../session");
jest.mock("../firebase/admin");
jest.mock("../firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn().mockReturnValue({
    auth: jest.fn(),
    firestore: jest.fn(),
  }),
}));

describe("getAuthFromRequest", () => {
  let mockDb: any;
  let mockDoc: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDoc = {
      get: jest.fn(),
    };
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
    };
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("No Authentication", () => {
    it("should return null values when no token present", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(verifySession).not.toHaveBeenCalled();
    });

    it("should return null values when token is undefined", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(undefined);

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });

    it("should return null values when token is empty string", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("");

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });
  });

  describe("Invalid Session", () => {
    it("should return null values when session verification fails", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("invalid-token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(verifySession).toHaveBeenCalledWith("invalid-token");
    });

    it("should return null values when session is undefined", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token");
      (verifySession as jest.Mock).mockResolvedValue(undefined);

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });
  });

  describe("User Not Found", () => {
    it("should return null values when user document doesn't exist", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
      expect(mockCollection.doc).toHaveBeenCalledWith("user123");
    });

    it("should use correct collection name", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const mockRequest = {} as NextRequest;
      await getAuthFromRequest(mockRequest);

      expect(mockDb.collection).toHaveBeenCalledWith("users");
    });
  });

  describe("Successful Authentication", () => {
    it("should return complete auth data with valid session", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        createdAt: new Date(),
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: {
          uid: "user123",
          email: "test@example.com",
          name: "Test User",
        },
        role: "user",
        session: mockSession,
      });
    });

    it("should use session email when user data email missing", async () => {
      const mockSession = {
        userId: "user123",
        email: "session@example.com",
        role: "user",
      };

      const mockUserData = {
        name: "Test User",
        role: "user",
        // email missing
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("session@example.com");
    });

    it("should use empty string for missing name", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      const mockUserData = {
        email: "test@example.com",
        role: "user",
        // name missing
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.name).toBe("");
    });

    it("should prioritize user data role over session role", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Admin User",
        role: "admin",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("admin");
    });

    it("should fall back to session role when user data role missing", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "seller",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        // role missing
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("seller");
    });

    it("should default to 'user' role when both missing", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        // role missing
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        // role missing
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("user");
    });
  });

  describe("Different User Roles", () => {
    it("should handle admin role correctly", async () => {
      const mockSession = {
        userId: "admin123",
        email: "admin@example.com",
        role: "admin",
      };

      const mockUserData = {
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("admin");
    });

    it("should handle seller role correctly", async () => {
      const mockSession = {
        userId: "seller123",
        email: "seller@example.com",
        role: "seller",
      };

      const mockUserData = {
        email: "seller@example.com",
        name: "Seller User",
        role: "seller",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("seller");
    });

    it("should handle custom roles", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "moderator",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Moderator User",
        role: "moderator",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.role).toBe("moderator");
    });
  });

  describe("Error Handling", () => {
    it("should return null values on database error", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockRejectedValue(new Error("Database error"));

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });

    it("should log error on database failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockRejectedValue(new Error("Database error"));

      const mockRequest = {} as NextRequest;
      await getAuthFromRequest(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error getting auth from request:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle session verification error", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Verification failed")
      );

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });

    it("should handle collection access error", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDb.collection.mockImplementation(() => {
        throw new Error("Collection not found");
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result).toEqual({
        user: null,
        role: null,
        session: null,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle null user data", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => null,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("test@example.com");
      expect(result.user?.name).toBe("");
      expect(result.role).toBe("user");
    });

    it("should handle undefined user data", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => undefined,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("test@example.com");
      expect(result.user?.name).toBe("");
      expect(result.role).toBe("user");
    });

    it("should handle empty user data object", async () => {
      const mockSession = {
        userId: "user123",
        email: "session@example.com",
        role: "seller",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({}),
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.email).toBe("session@example.com");
      expect(result.user?.name).toBe("");
      expect(result.role).toBe("seller");
    });

    it("should handle user with special characters in name", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "José O'Connor-Smith",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.name).toBe("José O'Connor-Smith");
    });

    it("should handle very long user names", async () => {
      const longName = "A".repeat(500);
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      const mockUserData = {
        email: "test@example.com",
        name: longName,
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.name).toBe(longName);
    });

    it("should handle user ID with special characters", async () => {
      const specialUserId = "user-123_test@domain";
      const mockSession = {
        userId: specialUserId,
        email: "test@example.com",
        role: "user",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.user?.uid).toBe(specialUserId);
      expect(mockCollection.doc).toHaveBeenCalledWith(specialUserId);
    });
  });

  describe("Session Data Preservation", () => {
    it("should preserve complete session data in result", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        createdAt: new Date("2025-01-01"),
        expiresAt: new Date("2025-12-31"),
        metadata: { ip: "127.0.0.1" },
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.session).toEqual(mockSession);
    });

    it("should maintain session object reference", async () => {
      const mockSession = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
      };

      const mockUserData = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });

      const mockRequest = {} as NextRequest;
      const result = await getAuthFromRequest(mockRequest);

      expect(result.session).toBe(mockSession);
    });
  });

  describe("Integration Flow", () => {
    it("should call functions in correct order", async () => {
      const callOrder: string[] = [];

      (getSessionToken as jest.Mock).mockImplementation(() => {
        callOrder.push("getSessionToken");
        return "token";
      });

      (verifySession as jest.Mock).mockImplementation(async () => {
        callOrder.push("verifySession");
        return {
          userId: "user123",
          email: "test@example.com",
          role: "user",
        };
      });

      mockDoc.get.mockImplementation(async () => {
        callOrder.push("db.get");
        return {
          exists: true,
          data: () => ({
            email: "test@example.com",
            name: "Test User",
            role: "user",
          }),
        };
      });

      const mockRequest = {} as NextRequest;
      await getAuthFromRequest(mockRequest);

      expect(callOrder).toEqual(["getSessionToken", "verifySession", "db.get"]);
    });

    it("should not fetch user data if no token", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const mockRequest = {} as NextRequest;
      await getAuthFromRequest(mockRequest);

      expect(verifySession).not.toHaveBeenCalled();
      expect(mockDb.collection).not.toHaveBeenCalled();
    });

    it("should not fetch user data if session invalid", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const mockRequest = {} as NextRequest;
      await getAuthFromRequest(mockRequest);

      expect(mockDb.collection).not.toHaveBeenCalled();
    });
  });
});
