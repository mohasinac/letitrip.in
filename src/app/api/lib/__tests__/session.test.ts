/**
 * Unit Tests for Session Management
 * Testing JWT tokens, Firestore sessions, and cookie handling
 */

import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../firebase/config";
import {
  cleanupExpiredSessions,
  clearSessionCookie,
  createSession,
  deleteAllUserSessions,
  deleteSession,
  getCurrentUser,
  getSessionToken,
  getUserSessions,
  SessionData,
  setSessionCookie,
  verifySession,
} from "../session";

// Mock dependencies
jest.mock("../firebase/config", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock("jsonwebtoken");

describe("createSession", () => {
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc = {
      set: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
    (jwt.sign as jest.Mock).mockReturnValue("mock-jwt-token");
  });

  describe("Basic Session Creation", () => {
    it("should create session with valid data", async () => {
      const result = await createSession("user123", "test@example.com", "user");

      expect(result).toHaveProperty("sessionId");
      expect(result).toHaveProperty("token");
      expect(result.token).toBe("mock-jwt-token");
      expect(result.sessionId).toMatch(/^sess_/);
    });

    it("should generate JWT with correct payload", async () => {
      await createSession("user123", "test@example.com", "admin");

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user123",
          email: "test@example.com",
          role: "admin",
          sessionId: expect.stringMatching(/^sess_/),
        }),
        expect.any(String),
        expect.objectContaining({
          expiresIn: 604800, // 7 days
        })
      );
    });

    it("should store session in Firestore", async () => {
      await createSession("user123", "test@example.com", "user");

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: expect.stringMatching(/^sess_/),
          userId: "user123",
          email: "test@example.com",
          role: "user",
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
          lastActivity: expect.any(String),
        })
      );
    });

    it("should handle different roles", async () => {
      const roles = ["user", "admin", "seller"];

      for (const role of roles) {
        await createSession("user123", "test@example.com", role);

        expect(jwt.sign).toHaveBeenCalledWith(
          expect.objectContaining({ role }),
          expect.any(String),
          expect.any(Object)
        );
      }
    });
  });

  describe("Request Metadata", () => {
    it("should capture user agent from request", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === "user-agent") return "Mozilla/5.0 Test Browser";
            return null;
          }),
        },
      } as unknown as NextRequest;

      await createSession("user123", "test@example.com", "user", mockRequest);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: "Mozilla/5.0 Test Browser",
        })
      );
    });

    it("should capture IP from x-forwarded-for", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === "x-forwarded-for") return "192.168.1.1";
            return null;
          }),
        },
      } as unknown as NextRequest;

      await createSession("user123", "test@example.com", "user", mockRequest);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: "192.168.1.1",
        })
      );
    });

    it("should fallback to x-real-ip if x-forwarded-for not available", async () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === "x-real-ip") return "10.0.0.1";
            return null;
          }),
        },
      } as unknown as NextRequest;

      await createSession("user123", "test@example.com", "user", mockRequest);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: "10.0.0.1",
        })
      );
    });

    it("should work without request metadata", async () => {
      await createSession("user123", "test@example.com", "user");

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: undefined,
          ipAddress: undefined,
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw error if JWT signing fails", async () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid secret");
      });

      await expect(
        createSession("user123", "test@example.com", "user")
      ).rejects.toThrow("Failed to create session");
    });

    it("should throw error if Firestore write fails", async () => {
      mockDoc.set.mockRejectedValue(new Error("Firestore error"));

      await expect(
        createSession("user123", "test@example.com", "user")
      ).rejects.toThrow("Failed to create session");
    });

    it("should not create Firestore doc if JWT fails", async () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("JWT error");
      });

      try {
        await createSession("user123", "test@example.com", "user");
      } catch {
        // Expected error
      }

      expect(mockDoc.set).not.toHaveBeenCalled();
    });
  });

  describe("Session ID Generation", () => {
    it("should generate unique session IDs", async () => {
      const sessions = await Promise.all([
        createSession("user1", "test1@example.com", "user"),
        createSession("user2", "test2@example.com", "user"),
        createSession("user3", "test3@example.com", "user"),
      ]);

      const sessionIds = sessions.map((s) => s.sessionId);
      const uniqueIds = new Set(sessionIds);

      expect(uniqueIds.size).toBe(3);
    });

    it("should generate session IDs with correct format", async () => {
      const result = await createSession("user123", "test@example.com", "user");

      expect(result.sessionId).toMatch(/^sess_\d+_[a-z0-9]+$/);
    });
  });
});

describe("verifySession", () => {
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc = {
      get: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  describe("Valid Session Verification", () => {
    it("should verify valid JWT and return session data", async () => {
      const mockSessionData: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "sess_123",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockSessionData);

      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const pastActivity = new Date(Date.now() - 600000).toISOString();

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: futureDate,
          lastActivity: pastActivity,
        }),
      });

      const result = await verifySession("valid-token");

      expect(result).toEqual(mockSessionData);
      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token",
        expect.any(String)
      );
    });

    it("should update lastActivity if > 5 minutes old", async () => {
      const mockSessionData: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "sess_123",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockSessionData);

      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const oldActivity = new Date(Date.now() - 600000).toISOString(); // 10 mins ago

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: futureDate,
          lastActivity: oldActivity,
        }),
      });

      await verifySession("valid-token");

      // Give async update time to fire
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockDoc.update).toHaveBeenCalledWith({
        lastActivity: expect.any(String),
      });
    });

    it("should not update lastActivity if < 5 minutes old", async () => {
      const mockSessionData: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "sess_123",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockSessionData);

      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const recentActivity = new Date(Date.now() - 60000).toISOString(); // 1 min ago

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: futureDate,
          lastActivity: recentActivity,
        }),
      });

      await verifySession("valid-token");

      expect(mockDoc.update).not.toHaveBeenCalled();
    });
  });

  describe("Invalid Session Cases", () => {
    it("should return null for invalid JWT", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = await verifySession("invalid-token");

      expect(result).toBeNull();
    });

    it("should return null if session not found in Firestore", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: "user123",
        sessionId: "sess_123",
      });

      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const result = await verifySession("valid-token");

      expect(result).toBeNull();
    });

    it("should delete and return null for expired session", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: "user123",
        sessionId: "sess_123",
      });

      const pastDate = new Date(Date.now() - 86400000).toISOString();

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: pastDate,
          lastActivity: pastDate,
        }),
      });

      const result = await verifySession("expired-token");

      expect(result).toBeNull();
      expect(mockDoc.delete).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle Firestore read errors gracefully", async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: "user123",
        sessionId: "sess_123",
      });

      mockDoc.get.mockRejectedValue(new Error("Firestore error"));

      const result = await verifySession("valid-token");

      expect(result).toBeNull();
    });

    it("should continue if lastActivity update fails", async () => {
      const mockSessionData: SessionData = {
        userId: "user123",
        email: "test@example.com",
        role: "user",
        sessionId: "sess_123",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockSessionData);

      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const oldActivity = new Date(Date.now() - 600000).toISOString();

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: futureDate,
          lastActivity: oldActivity,
        }),
      });

      mockDoc.update.mockRejectedValue(new Error("Update failed"));

      const result = await verifySession("valid-token");

      // Should still return session data even if update fails
      expect(result).toEqual(mockSessionData);
    });
  });
});

describe("deleteSession", () => {
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  it("should delete session from Firestore", async () => {
    await deleteSession("sess_123");

    expect(mockCollection.doc).toHaveBeenCalledWith("sess_123");
    expect(mockDoc.delete).toHaveBeenCalled();
  });

  it("should throw error if delete fails", async () => {
    mockDoc.delete.mockRejectedValue(new Error("Delete failed"));

    await expect(deleteSession("sess_123")).rejects.toThrow(
      "Failed to delete session"
    );
  });
});

describe("deleteAllUserSessions", () => {
  let mockCollection: any;
  let mockBatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
    (adminDb as any).batch = jest.fn().mockReturnValue(mockBatch);
  });

  it("should delete all sessions for a user", async () => {
    const mockDocs = [
      { ref: "ref1", id: "sess1" },
      { ref: "ref2", id: "sess2" },
    ];

    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: mockDocs,
    });

    await deleteAllUserSessions("user123");

    expect(mockBatch.delete).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it("should handle no sessions gracefully", async () => {
    mockCollection.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    await deleteAllUserSessions("user123");

    expect(mockBatch.delete).not.toHaveBeenCalled();
    expect(mockBatch.commit).not.toHaveBeenCalled();
  });

  it("should throw error if deletion fails", async () => {
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [{ ref: "ref1" }],
    });

    mockBatch.commit.mockRejectedValue(new Error("Batch failed"));

    await expect(deleteAllUserSessions("user123")).rejects.toThrow(
      "Failed to delete user sessions"
    );
  });
});

describe("getUserSessions", () => {
  let mockCollection: any;
  let mockBatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn((id: string) => ({ id })),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
    (adminDb as any).batch = jest.fn().mockReturnValue(mockBatch);
  });

  it("should return active sessions", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const mockDocs = [
      {
        id: "sess1",
        data: () => ({
          sessionId: "sess1",
          userId: "user123",
          expiresAt: futureDate,
        }),
      },
      {
        id: "sess2",
        data: () => ({
          sessionId: "sess2",
          userId: "user123",
          expiresAt: futureDate,
        }),
      },
    ];

    mockCollection.get.mockResolvedValue({
      docs: mockDocs,
    });

    const result = await getUserSessions("user123");

    expect(result).toHaveLength(2);
    expect(result[0].sessionId).toBe("sess1");
  });

  it("should filter out expired sessions", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const pastDate = new Date(Date.now() - 86400000).toISOString();

    const mockDocs = [
      {
        id: "sess1",
        data: () => ({
          sessionId: "sess1",
          expiresAt: futureDate,
        }),
      },
      {
        id: "sess2",
        data: () => ({
          sessionId: "sess2",
          expiresAt: pastDate,
        }),
      },
    ];

    mockCollection.get.mockResolvedValue({
      docs: mockDocs,
    });

    const result = await getUserSessions("user123");

    expect(result).toHaveLength(1);
    expect(result[0].sessionId).toBe("sess1");
  });

  it("should delete expired sessions in batch", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const pastDate = new Date(Date.now() - 86400000).toISOString();

    const mockDocs = [
      {
        id: "sess1",
        data: () => ({
          expiresAt: futureDate,
        }),
      },
      {
        id: "sess2",
        data: () => ({
          expiresAt: pastDate,
        }),
      },
      {
        id: "sess3",
        data: () => ({
          expiresAt: pastDate,
        }),
      },
    ];

    mockCollection.get.mockResolvedValue({
      docs: mockDocs,
    });

    await getUserSessions("user123");

    expect(mockBatch.delete).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it("should handle batch delete errors gracefully", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const pastDate = new Date(Date.now() - 86400000).toISOString();

    const mockDocs = [
      {
        id: "sess1",
        data: () => ({ sessionId: "sess1", expiresAt: futureDate }),
      },
      {
        id: "sess2",
        data: () => ({ sessionId: "sess2", expiresAt: pastDate }),
      },
    ];

    mockCollection.get.mockResolvedValue({
      docs: mockDocs,
    });

    mockBatch.commit.mockRejectedValue(new Error("Batch failed"));

    // Should still return active sessions
    const result = await getUserSessions("user123");
    expect(result).toHaveLength(1);
  });

  it("should throw error if query fails", async () => {
    mockCollection.get.mockRejectedValue(new Error("Query failed"));

    await expect(getUserSessions("user123")).rejects.toThrow(
      "Failed to get user sessions"
    );
  });
});

describe("Cookie Management", () => {
  describe("setSessionCookie", () => {
    it("should set session cookie with correct attributes", () => {
      const response = new NextResponse();
      setSessionCookie(response, "test-token");

      const cookieHeader = response.headers.get("Set-Cookie");
      expect(cookieHeader).toContain("session=test-token");
      expect(cookieHeader).toContain("HttpOnly");
      expect(cookieHeader).toContain("SameSite=Lax");
      expect(cookieHeader).toContain("Path=/");
    });
  });

  describe("clearSessionCookie", () => {
    it("should set expired cookies to clear session", () => {
      const mockHeaders = new Map();
      const response = {
        headers: {
          set: jest.fn((name: string, value: string) => {
            mockHeaders.set(name, value);
          }),
          append: jest.fn((name: string, value: string) => {
            const existing = mockHeaders.get(name);
            if (existing) {
              mockHeaders.set(name, [existing, value]);
            } else {
              mockHeaders.set(name, value);
            }
          }),
          get: jest.fn((name: string) => mockHeaders.get(name)),
        },
      } as unknown as NextResponse;

      clearSessionCookie(response);

      expect(response.headers.set).toHaveBeenCalled();
      expect(response.headers.append).toHaveBeenCalled();

      const setCookieValue = mockHeaders.get("Set-Cookie");
      if (Array.isArray(setCookieValue)) {
        expect(setCookieValue[0]).toContain("Max-Age=0");
        expect(setCookieValue[1]).toContain("Max-Age=0");
      } else {
        expect(setCookieValue).toContain("Max-Age=0");
      }
    });
  });

  describe("getSessionToken", () => {
    it("should extract session token from cookies", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === "cookie") return "session=test-token";
            return null;
          }),
        },
      } as unknown as NextRequest;

      const token = getSessionToken(mockRequest);

      expect(token).toBe("test-token");
    });

    it("should return null if no cookie header", () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      const token = getSessionToken(mockRequest);

      expect(token).toBeNull();
    });

    it("should return null if session cookie not present", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === "cookie") return "other=value";
            return null;
          }),
        },
      } as unknown as NextRequest;

      const token = getSessionToken(mockRequest);

      expect(token).toBeNull();
    });
  });
});

describe("cleanupExpiredSessions", () => {
  let mockCollection: any;
  let mockBatch: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    mockCollection = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
    (adminDb as any).batch = jest.fn().mockReturnValue(mockBatch);
  });

  it("should cleanup expired sessions and return count", async () => {
    const mockDocs = [{ ref: "ref1" }, { ref: "ref2" }, { ref: "ref3" }];

    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: mockDocs,
      size: 3,
    });

    const count = await cleanupExpiredSessions();

    expect(count).toBe(3);
    expect(mockBatch.delete).toHaveBeenCalledTimes(3);
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it("should return 0 if no expired sessions", async () => {
    mockCollection.get.mockResolvedValue({
      empty: true,
      docs: [],
      size: 0,
    });

    const count = await cleanupExpiredSessions();

    expect(count).toBe(0);
    expect(mockBatch.delete).not.toHaveBeenCalled();
  });

  it("should throw error if cleanup fails", async () => {
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [{ ref: "ref1" }],
      size: 1,
    });

    mockBatch.commit.mockRejectedValue(new Error("Cleanup failed"));

    await expect(cleanupExpiredSessions()).rejects.toThrow(
      "Failed to cleanup expired sessions"
    );
  });
});

describe("getCurrentUser", () => {
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc = {
      get: jest.fn(),
    };
    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  it("should return user data for valid session", async () => {
    const mockRequest = {
      headers: {
        get: jest.fn((name: string) => {
          if (name === "cookie") return "session=valid-token";
          return null;
        }),
      },
    } as unknown as NextRequest;

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "user123",
      email: "test@example.com",
      role: "user",
      sessionId: "sess_123",
    });

    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const recentActivity = new Date().toISOString();

    // Create separate mocks for sessions and users collections
    const mockSessionDoc = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: futureDate,
          lastActivity: recentActivity,
        }),
      }),
    };

    const mockUserDoc = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          email: "test@example.com",
          name: "Test User",
          role: "user",
        }),
      }),
    };

    (adminDb.collection as jest.Mock).mockImplementation((name: string) => ({
      doc: jest.fn((id: string) => {
        if (name.includes("sessions")) return mockSessionDoc;
        if (name.includes("users")) return mockUserDoc;
        return mockDoc;
      }),
    }));

    const user = await getCurrentUser(mockRequest);

    expect(user).toEqual({
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    });
  });

  it("should return null if no session token", async () => {
    const mockRequest = {
      headers: {
        get: jest.fn(() => null),
      },
    } as unknown as NextRequest;

    const user = await getCurrentUser(mockRequest);

    expect(user).toBeNull();
  });

  it("should return null if session invalid", async () => {
    const mockRequest = {
      headers: {
        get: jest.fn((name: string) => {
          if (name === "cookie") return "session=invalid-token";
          return null;
        }),
      },
    } as unknown as NextRequest;

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const user = await getCurrentUser(mockRequest);

    expect(user).toBeNull();
  });

  it("should return null if user not found", async () => {
    const mockRequest = {
      headers: {
        get: jest.fn((name: string) => {
          if (name === "cookie") return "session=valid-token";
          return null;
        }),
      },
    } as unknown as NextRequest;

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "user123",
      sessionId: "sess_123",
    });

    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const mockSessionDoc = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: futureDate,
          lastActivity: new Date().toISOString(),
        }),
      }),
    };

    const mockUserDoc = {
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
    };

    (adminDb.collection as jest.Mock).mockImplementation((name: string) => ({
      doc: jest.fn(() => {
        if (name.includes("sessions")) return mockSessionDoc;
        if (name.includes("users")) return mockUserDoc;
        return mockDoc;
      }),
    }));

    const user = await getCurrentUser(mockRequest);

    expect(user).toBeNull();
  });

  it("should use session data as fallback if user data missing", async () => {
    const mockRequest = {
      headers: {
        get: jest.fn((name: string) => {
          if (name === "cookie") return "session=valid-token";
          return null;
        }),
      },
    } as unknown as NextRequest;

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "user123",
      email: "session@example.com",
      role: "admin",
      sessionId: "sess_123",
    });

    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const mockSessionDoc = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          expiresAt: futureDate,
          lastActivity: new Date().toISOString(),
        }),
      }),
    };

    const mockUserDoc = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({}), // Empty user data
      }),
    };

    (adminDb.collection as jest.Mock).mockImplementation((name: string) => ({
      doc: jest.fn(() => {
        if (name.includes("sessions")) return mockSessionDoc;
        if (name.includes("users")) return mockUserDoc;
        return mockDoc;
      }),
    }));

    const user = await getCurrentUser(mockRequest);

    expect(user).toEqual({
      id: "user123",
      email: "session@example.com",
      name: "",
      role: "admin",
    });
  });
});
