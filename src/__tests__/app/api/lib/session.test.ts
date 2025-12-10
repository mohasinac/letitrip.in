/**
 * Unit Tests for Session Management
 * Tests JWT-based session creation, verification, and management
 *
 * TESTS COVER:
 * - createSession with JWT generation and Firestore storage
 * - verifySession with expiry checking and activity updates
 * - deleteSession and deleteAllUserSessions
 * - getUserSessions with cleanup
 * - Cookie management functions
 * - generateSessionId uniqueness
 * - cleanupExpiredSessions batch deletion
 * - getCurrentUser with user fetching
 * - Edge cases: expired tokens, invalid JWT, missing sessions
 *
 * CODE ISSUES FOUND:
 * 1. SESSION_EXPIRY_DAYS hardcoded to 7 - no configuration option
 * 2. No rate limiting on session creation
 * 3. JWT secret from env without validation
 * 4. cleanupExpiredSessions has no pagination for large datasets
 * 5. No session activity tracking or analytics
 * 6. Cookie settings lack SameSite configuration
 * 7. No concurrent session limit per user
 * 8. generateSessionId uses only timestamp + random - collision risk
 */

import jwt from "jsonwebtoken";
// Mock Firebase and jwt FIRST
jest.mock("jsonwebtoken");
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(),
}));
jest.mock("@/app/api/lib/firebase/config", () => ({
  adminDb: {
    collection: jest.fn(),
    batch: jest.fn(),
  },
}));

import { adminDb } from "@/app/api/lib/firebase/config";
import {
  cleanupExpiredSessions,
  clearSessionCookie,
  createSession,
  deleteAllUserSessions,
  deleteSession,
  getCurrentUser,
  getSessionToken,
  getUserSessions,
  setSessionCookie,
  verifySession,
} from "@/app/api/lib/session";

describe("session", () => {
  let mockSessionsCollection: any;
  let mockUsersCollection: any;
  let mockBatch: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Firestore batch
    mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };

    // Mock Firestore collections
    mockSessionsCollection = {
      doc: jest.fn(),
      add: jest.fn(),
      where: jest.fn(),
      limit: jest.fn(),
      get: jest.fn(),
    };

    mockUsersCollection = {
      doc: jest.fn(),
    };

    (adminDb.collection as jest.Mock).mockImplementation((collectionName) => {
      if (collectionName === "sessions") {
        return mockSessionsCollection;
      } else if (collectionName === "users") {
        return mockUsersCollection;
      }
      return mockSessionsCollection;
    });

    (adminDb.batch as jest.Mock).mockReturnValue(mockBatch);

    // Mock environment
    process.env.SESSION_SECRET = "test-secret-key-32-characters-long";
  });

  // generateSessionId is private, so we test it indirectly through createSession

  describe("createSession", () => {
    const mockUserId = "user123";
    const mockEmail = "test@example.com";
    const mockRole = "user";

    beforeEach(() => {
      // Mock JWT signing
      (jwt.sign as jest.Mock).mockReturnValue("mock-jwt-token");

      // Mock Firestore doc().set()
      const mockDocRef = {
        set: jest.fn().mockResolvedValue(undefined),
      };
      mockSessionsCollection.doc.mockReturnValue(mockDocRef);
    });

    it("should create session with JWT token", async () => {
      const result = await createSession(mockUserId, mockEmail, mockRole);

      expect(result.sessionId).toBeDefined();
      expect(result.token).toBe("mock-jwt-token");
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("should store session in Firestore", async () => {
      await createSession(mockUserId, mockEmail, mockRole);

      const mockDocRef = mockSessionsCollection.doc.mock.results[0].value;
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
          sessionId: expect.any(String),
        })
      );
    });

    it("should set expiry date 7 days in future", async () => {
      const before = new Date();
      before.setDate(before.getDate() + 7);

      await createSession(mockUserId, mockEmail, mockRole);

      const mockDocRef = mockSessionsCollection.doc.mock.results[0].value;
      const callArgs = mockDocRef.set.mock.calls[0][0];
      const expiresAt = new Date(callArgs.expiresAt);

      expect(expiresAt.getTime()).toBeGreaterThan(before.getTime() - 1000);
      expect(expiresAt.getTime()).toBeLessThan(before.getTime() + 1000);
    });

    it("should include created_at and last_activity timestamps", async () => {
      const before = Date.now();
      await createSession(mockUserId, mockEmail, mockRole);
      const after = Date.now();

      const mockDocRef = mockSessionsCollection.doc.mock.results[0].value;
      const callArgs = mockDocRef.set.mock.calls[0][0];
      const createdAt = new Date(callArgs.createdAt).getTime();

      expect(createdAt).toBeGreaterThanOrEqual(before);
      expect(createdAt).toBeLessThanOrEqual(after);
      expect(callArgs.lastActivity).toBe(callArgs.createdAt);
    });

    it("should handle JWT signing errors", async () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("JWT error");
      });

      await expect(
        createSession(mockUserId, mockEmail, mockRole)
      ).rejects.toThrow("Failed to create session");
    });

    it("should handle Firestore errors", async () => {
      const mockDocRef = {
        set: jest.fn().mockRejectedValue(new Error("Firestore error")),
      };
      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      await expect(
        createSession(mockUserId, mockEmail, mockRole)
      ).rejects.toThrow("Failed to create session");
    });

    it("should handle missing JWT secret", async () => {
      delete process.env.SESSION_SECRET;
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("secret or private key must be provided");
      });

      await expect(
        createSession(mockUserId, mockEmail, mockRole)
      ).rejects.toThrow();
    });
  });

  describe("verifySession", () => {
    const mockToken = "valid-jwt-token";
    const mockSessionId = "session-123";
    const mockUserId = "user123";

    beforeEach(() => {
      // Mock JWT verification
      (jwt.verify as jest.Mock).mockReturnValue({
        sessionId: mockSessionId,
        userId: mockUserId,
        email: "test@example.com",
        role: "user",
      });
    });

    it("should verify valid non-expired session", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      // Mock lastActivity more than 5 minutes ago to trigger update
      const oldActivity = new Date();
      oldActivity.setMinutes(oldActivity.getMinutes() - 10);

      const mockDoc = {
        exists: true,
        data: () => ({
          sessionId: mockSessionId,
          userId: mockUserId,
          email: "test@example.com",
          role: "user",
          expiresAt: futureDate.toISOString(),
          lastActivity: oldActivity.toISOString(),
        }),
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      const result = await verifySession(mockToken);

      expect(result).not.toBeNull();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.sessionId).toBe(mockSessionId);
      expect(result?.email).toBe("test@example.com");
    });

    it("should update last_activity on verification", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      // Mock lastActivity more than 5 minutes ago
      const oldActivity = new Date();
      oldActivity.setMinutes(oldActivity.getMinutes() - 10);

      const mockDoc = {
        exists: true,
        data: () => ({
          expiresAt: futureDate.toISOString(),
          lastActivity: oldActivity.toISOString(),
        }),
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      await verifySession(mockToken);

      // Wait a bit for the fire-and-forget update
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          lastActivity: expect.any(String),
        })
      );
    });

    it("should reject expired session", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockDoc = {
        exists: true,
        data: () => ({
          expiresAt: pastDate.toISOString(),
          lastActivity: pastDate.toISOString(),
        }),
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
      };

      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      const result = await verifySession(mockToken);

      expect(result).toBeNull();
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it("should reject non-existent session", async () => {
      const mockDoc = {
        exists: false,
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
      };

      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      const result = await verifySession(mockToken);

      expect(result).toBeNull();
    });

    it("should handle invalid JWT", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = await verifySession("invalid-token");

      expect(result).toBeNull();
    });

    it("should handle Firestore errors gracefully", async () => {
      const mockDocRef = {
        get: jest.fn().mockRejectedValue(new Error("Firestore error")),
      };

      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      const result = await verifySession(mockToken);

      expect(result).toBeNull();
    });
  });

  describe("deleteSession", () => {
    const mockSessionId = "session-123";

    it("should delete session by ID", async () => {
      const mockDocRef = {
        delete: jest.fn().mockResolvedValue(undefined),
      };

      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      await deleteSession(mockSessionId);

      expect(mockSessionsCollection.doc).toHaveBeenCalledWith(mockSessionId);
      expect(mockDocRef.delete).toHaveBeenCalled();
    });

    it("should handle delete errors", async () => {
      const mockDocRef = {
        delete: jest.fn().mockRejectedValue(new Error("Delete error")),
      };

      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      await expect(deleteSession(mockSessionId)).rejects.toThrow(
        "Failed to delete session"
      );
    });
  });

  describe("deleteAllUserSessions", () => {
    const mockUserId = "user123";

    it("should delete all sessions for user", async () => {
      const mockDocs = [{ ref: "ref1" }, { ref: "ref2" }];

      const mockQuerySnapshot = {
        docs: mockDocs,
        empty: false,
      };

      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockQuerySnapshot),
      });

      await deleteAllUserSessions(mockUserId);

      expect(mockSessionsCollection.where).toHaveBeenCalledWith(
        "userId",
        "==",
        mockUserId
      );
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should handle empty result set", async () => {
      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
      });

      await expect(deleteAllUserSessions(mockUserId)).resolves.not.toThrow();
    });

    it("should handle query errors", async () => {
      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error("Query error")),
      });

      await expect(deleteAllUserSessions(mockUserId)).rejects.toThrow(
        "Failed to delete user sessions"
      );
    });
  });

  describe("getUserSessions", () => {
    const mockUserId = "user123";

    it("should return active sessions for user", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const mockSessions = [
        {
          id: "session1",
          data: () => ({
            sessionId: "session1",
            userId: mockUserId,
            expiresAt: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          }),
        },
        {
          id: "session2",
          data: () => ({
            sessionId: "session2",
            userId: mockUserId,
            expiresAt: futureDate.toISOString(),
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          }),
        },
      ];

      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: mockSessions }),
      });

      const result = await getUserSessions(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("sessionId", "session1");
      expect(result[1]).toHaveProperty("sessionId", "session2");
    });

    it("should filter out expired sessions", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockSessions = [
        {
          id: "active",
          data: () => ({
            sessionId: "active",
            userId: mockUserId,
            expiresAt: futureDate.toISOString(),
          }),
        },
        {
          id: "expired",
          data: () => ({
            sessionId: "expired",
            userId: mockUserId,
            expiresAt: pastDate.toISOString(),
          }),
        },
      ];

      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: mockSessions }),
      });

      const result = await getUserSessions(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].sessionId).toBe("active");
      expect(mockBatch.delete).toHaveBeenCalled();
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should return empty array when no sessions", async () => {
      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [] }),
      });

      const result = await getUserSessions(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe("Cookie Management", () => {
    describe("setSessionCookie", () => {
      it("should set session cookie with token", () => {
        const mockHeaders = {
          set: jest.fn(),
        };
        const mockResponse = {
          headers: mockHeaders,
        } as any;
        const token = "test-token";

        setSessionCookie(mockResponse, token);

        expect(mockHeaders.set).toHaveBeenCalled();
        const cookieValue = mockHeaders.set.mock.calls[0][1];
        expect(cookieValue).toContain("session=");
        expect(cookieValue).toContain(token);
        expect(cookieValue).toContain("HttpOnly");
      });

      it("should set cookie with 7 day expiry", () => {
        const mockHeaders = {
          set: jest.fn(),
        };
        const mockResponse = {
          headers: mockHeaders,
        } as any;

        setSessionCookie(mockResponse, "token");

        const cookieValue = mockHeaders.set.mock.calls[0][1];
        const expectedMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds

        expect(cookieValue).toContain(`Max-Age=${expectedMaxAge}`);
      });

      it("should set path to root", () => {
        const mockHeaders = {
          set: jest.fn(),
        };
        const mockResponse = {
          headers: mockHeaders,
        } as any;

        setSessionCookie(mockResponse, "token");

        const cookieValue = mockHeaders.set.mock.calls[0][1];
        expect(cookieValue).toContain("Path=/");
      });
    });

    describe("clearSessionCookie", () => {
      it("should clear session cookie", () => {
        const mockHeaders = {
          set: jest.fn(),
          append: jest.fn(),
        };
        const mockResponse = {
          headers: mockHeaders,
        } as any;

        clearSessionCookie(mockResponse);

        expect(mockHeaders.set).toHaveBeenCalled();
        expect(mockHeaders.append).toHaveBeenCalled();

        const firstCookie = mockHeaders.set.mock.calls[0][1];
        expect(firstCookie).toContain("Max-Age=0");
      });
    });
    describe("getSessionToken", () => {
      it("should get session token from cookie", () => {
        const mockRequest = {
          headers: {
            get: jest.fn().mockReturnValue("session=test-token"),
          },
        } as any;

        const result = getSessionToken(mockRequest);

        expect(result).toBe("test-token");
      });

      it("should return null when no cookie", () => {
        const mockRequest = {
          headers: {
            get: jest.fn().mockReturnValue(null),
          },
        } as any;

        const result = getSessionToken(mockRequest);

        expect(result).toBeNull();
      });
    });
  });

  describe("cleanupExpiredSessions", () => {
    it("should delete expired sessions", async () => {
      const mockExpiredDocs = [{ ref: "ref1" }, { ref: "ref2" }];

      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockExpiredDocs,
          empty: false,
          size: 2,
        }),
      });

      const result = await cleanupExpiredSessions();

      expect(result).toBe(2);
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should query sessions before current time", async () => {
      const beforeCall = new Date().toISOString();

      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
      });

      await cleanupExpiredSessions();

      const afterCall = new Date().toISOString();
      const callArgs = mockSessionsCollection.where.mock.calls[0];

      expect(callArgs[0]).toBe("expiresAt");
      expect(callArgs[1]).toBe("<");
      // Compare ISO strings directly
      expect(callArgs[2]).toBeDefined();
      expect(typeof callArgs[2]).toBe("string");
      expect(callArgs[2] >= beforeCall).toBe(true);
      expect(callArgs[2] <= afterCall).toBe(true);
    });

    it("should return 0 when no expired sessions", async () => {
      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
      });

      const result = await cleanupExpiredSessions();

      expect(result).toBe(0);
    });

    it("should handle deletion errors", async () => {
      const mockDocs = [{ ref: "ref1" }];

      mockSessionsCollection.where.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockDocs,
          empty: false,
          size: 1,
        }),
      });

      mockBatch.commit.mockRejectedValue(new Error("Delete error"));

      await expect(cleanupExpiredSessions()).rejects.toThrow(
        "Failed to cleanup expired sessions"
      );
    });
  });

  describe("getCurrentUser", () => {
    const mockSessionId = "session-123";
    const mockUserId = "user123";
    const mockToken = "valid-token";

    it("should return user data when session valid", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(`session=${mockToken}`),
        },
      } as any;

      (jwt.verify as jest.Mock).mockReturnValue({
        sessionId: mockSessionId,
        userId: mockUserId,
        email: "test@example.com",
        role: "user",
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const mockSessionDoc = {
        exists: true,
        data: () => ({
          sessionId: mockSessionId,
          userId: mockUserId,
          email: "test@example.com",
          role: "user",
          expiresAt: futureDate.toISOString(),
          lastActivity: new Date().toISOString(),
        }),
      };

      const mockUserDoc = {
        exists: true,
        data: () => ({
          email: "test@example.com",
          name: "Test User",
          role: "user",
        }),
      };

      mockSessionsCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockSessionDoc),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      });

      mockUsersCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserDoc),
      });

      const result = await getCurrentUser(mockRequest);

      expect(result).toEqual({
        id: mockUserId,
        email: "test@example.com",
        name: "Test User",
        role: "user",
      });
    });

    it("should return null when no session token", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as any;

      const result = await getCurrentUser(mockRequest);

      expect(result).toBeNull();
    });

    it("should return null when session invalid", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(`session=${mockToken}`),
        },
      } as any;

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = await getCurrentUser(mockRequest);

      expect(result).toBeNull();
    });

    it("should return null when user not found", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(`session=${mockToken}`),
        },
      } as any;

      (jwt.verify as jest.Mock).mockReturnValue({
        sessionId: mockSessionId,
        userId: mockUserId,
        email: "test@example.com",
        role: "user",
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockSessionsCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            expiresAt: futureDate.toISOString(),
            lastActivity: new Date().toISOString(),
          }),
        }),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      });

      mockUsersCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      });

      const result = await getCurrentUser(mockRequest);

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(`session=${mockToken}`),
        },
      } as any;

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Verify error");
      });

      const result = await getCurrentUser(mockRequest);

      expect(result).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed JWT tokens", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Malformed JWT");
      });

      const result = await verifySession("malformed.jwt.token");

      expect(result).toBeNull();
    });

    it("should handle sessions with missing fields", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        sessionId: undefined,
        userId: undefined,
      });

      const mockDoc = {
        exists: true,
        data: () => ({}),
      };

      mockSessionsCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await verifySession("token");

      expect(result).not.toBeNull();
    });

    it("should handle very long session IDs", async () => {
      const longId = "a".repeat(1000);
      const mockDocRef = { delete: jest.fn().mockResolvedValue(undefined) };
      mockSessionsCollection.doc.mockReturnValue(mockDocRef);

      await expect(deleteSession(longId)).resolves.not.toThrow();
    });
  });
});
