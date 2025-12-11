import { NextRequest } from "next/server";

// Mock dependencies BEFORE importing route
jest.mock("../../../lib/firebase/config", () => ({
  adminAuth: {},
  adminDb: {},
}));
jest.mock("../../../lib/session");
jest.mock("@/app/api/lib/utils/rate-limiter");

// Import after mocking
import { apiRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import {
  clearSessionCookie,
  deleteSession,
  getSessionToken,
  verifySession,
} from "../../../lib/session";
import { POST } from "../route";

describe("POST /api/auth/logout", () => {
  let mockRequest: NextRequest;

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

  describe("Successful Logout", () => {
    it("should logout user with valid session", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        uid: "user-123",
      });
      (deleteSession as jest.Mock).mockResolvedValue(undefined);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Logout successful");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
      expect(deleteSession).toHaveBeenCalledWith("session-123");
    });

    it("should handle logout when token exists but session is invalid", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("invalid-token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Logout successful");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
      expect(deleteSession).not.toHaveBeenCalled();
    });

    it("should handle logout when no token present", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Logout successful");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
      expect(verifySession).not.toHaveBeenCalled();
      expect(deleteSession).not.toHaveBeenCalled();
    });

    it("should always clear session cookie", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const response = await POST(mockRequest);

      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });
  });

  describe("Error Handling", () => {
    it("should handle session deletion errors gracefully", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        uid: "user-123",
      });
      (deleteSession as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Logout completed");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should handle session verification errors", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Verification error")
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Logout completed");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should not expose error details in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Sensitive error")
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.error).toBeUndefined();
      expect(data.message).toBe("Logout completed");

      process.env.NODE_ENV = originalEnv;
    });

    it("should expose error details in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Dev error details")
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Dev error details");

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Rate Limiting", () => {
    it("should check rate limit before processing", async () => {
      (apiRateLimiter.check as jest.Mock).mockReturnValue(true);
      (getSessionToken as jest.Mock).mockReturnValue(null);

      await POST(mockRequest);

      expect(apiRateLimiter.check).toHaveBeenCalledWith("192.168.1.1");
    });

    it("should reject request when rate limit exceeded", async () => {
      (apiRateLimiter.check as jest.Mock).mockReturnValue(false);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Too many requests. Please try again later.");
      expect(clearSessionCookie).not.toHaveBeenCalled();
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

      (getSessionToken as jest.Mock).mockReturnValue(null);
      await POST(mockRequest);

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

      (getSessionToken as jest.Mock).mockReturnValue(null);
      await POST(mockRequest);

      expect(apiRateLimiter.check).toHaveBeenCalledWith("198.51.100.1");
    });

    it("should use 'unknown' when no IP headers present", async () => {
      mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      } as any;

      (getSessionToken as jest.Mock).mockReturnValue(null);
      await POST(mockRequest);

      expect(apiRateLimiter.check).toHaveBeenCalledWith("unknown");
    });
  });

  describe("Session Management", () => {
    it("should verify session before deleting", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token-123");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
      });
      (deleteSession as jest.Mock).mockResolvedValue(undefined);

      await POST(mockRequest);

      expect(verifySession).toHaveBeenCalledWith("token-123");
      expect(deleteSession).toHaveBeenCalledWith("session-123");
    });

    it("should not delete session if verification returns null", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token-123");
      (verifySession as jest.Mock).mockResolvedValue(null);

      await POST(mockRequest);

      expect(deleteSession).not.toHaveBeenCalled();
    });

    it("should delete session with correct sessionId", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token-123");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "custom-session-id",
        uid: "user-456",
      });
      (deleteSession as jest.Mock).mockResolvedValue(undefined);

      await POST(mockRequest);

      expect(deleteSession).toHaveBeenCalledWith("custom-session-id");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined token", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(undefined);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Logout successful");
    });

    it("should handle empty string token", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("");

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Logout successful");
    });

    it("should handle session with missing sessionId", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token-123");
      (verifySession as jest.Mock).mockResolvedValue({
        uid: "user-123",
        // sessionId is missing
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(deleteSession).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Security", () => {
    it("should always return 200 status on logout", async () => {
      // Success case
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
      });

      let response = await POST(mockRequest);
      expect(response.status).toBe(200);

      // Error case
      (verifySession as jest.Mock).mockRejectedValue(new Error("Error"));
      response = await POST(mockRequest);
      expect(response.status).toBe(200);

      // No session case
      (getSessionToken as jest.Mock).mockReturnValue(null);
      response = await POST(mockRequest);
      expect(response.status).toBe(200);
    });

    it("should clear cookie even on errors", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token-123");
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Verification failed")
      );

      const response = await POST(mockRequest);

      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should clear cookie when session deletion fails", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token-123");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
      });
      (deleteSession as jest.Mock).mockRejectedValue(
        new Error("Deletion failed")
      );

      const response = await POST(mockRequest);

      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should not leak session information on error", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("token-123");
      (verifySession as jest.Mock).mockResolvedValue({
        sessionId: "session-123",
        uid: "user-123",
        email: "user@example.com",
      });
      (deleteSession as jest.Mock).mockRejectedValue(
        new Error("Database error with sensitive info")
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.uid).toBeUndefined();
      expect(data.email).toBeUndefined();
      expect(data.sessionId).toBeUndefined();
    });
  });
});
