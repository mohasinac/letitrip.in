/**
 * Unit Tests for Auth Middleware
 * Tests authentication and authorization middleware functions
 */

// Mock Firebase before importing modules
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(() => ({ collection: jest.fn() })),
}));

jest.mock("@/app/api/lib/firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn(),
}));

import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, verifySession } from "../../lib/session";
import { optionalAuth, requireAuth, requireRole } from "../auth";

jest.mock("../../lib/session");

describe("Auth Middleware", () => {
  let mockRequest: NextRequest;
  let mockHandler: jest.Mock;
  const mockSession = {
    userId: "user-123",
    email: "test@example.com",
    role: "user",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      url: "http://localhost:3000/api/test",
      method: "GET",
      headers: new Headers(),
      cookies: { get: jest.fn() },
    } as any;

    mockHandler = jest
      .fn()
      .mockResolvedValue(NextResponse.json({ success: true }));
  });

  describe("requireAuth", () => {
    it("should allow authenticated requests", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);

      const response = await requireAuth(mockRequest, mockHandler);

      expect(getSessionToken).toHaveBeenCalledWith(mockRequest);
      expect(verifySession).toHaveBeenCalledWith("valid-token");
      expect(mockHandler).toHaveBeenCalled();

      const req = mockHandler.mock.calls[0][0];
      expect(req.session).toEqual(mockSession);
    });

    it("should reject requests without token", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const response = await requireAuth(mockRequest, mockHandler);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body).toEqual({
        error: "Unauthorized",
        message: "No session token found",
      });
    });

    it("should reject requests with invalid session", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("invalid-token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const response = await requireAuth(mockRequest, mockHandler);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body).toEqual({
        error: "Unauthorized",
        message: "Invalid or expired session",
      });
    });

    it("should handle verification errors", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Verification failed")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await requireAuth(mockRequest, mockHandler);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("requireRole", () => {
    it("should allow requests with correct role", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);

      const response = await requireRole(mockRequest, mockHandler, [
        "user",
        "admin",
      ]);

      expect(mockHandler).toHaveBeenCalled();

      const req = mockHandler.mock.calls[0][0];
      expect(req.session).toEqual(mockSession);
    });

    it("should reject requests without token", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const response = await requireRole(mockRequest, mockHandler, ["admin"]);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });

    it("should reject requests with invalid session", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("invalid-token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const response = await requireRole(mockRequest, mockHandler, ["admin"]);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });

    it("should reject requests with insufficient permissions", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);

      const response = await requireRole(mockRequest, mockHandler, [
        "admin",
        "moderator",
      ]);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body).toEqual({
        error: "Forbidden",
        message: "Insufficient permissions",
      });
    });

    it("should allow admin role", async () => {
      const adminSession = { ...mockSession, role: "admin" };
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(adminSession);

      const response = await requireRole(mockRequest, mockHandler, ["admin"]);

      expect(mockHandler).toHaveBeenCalled();
    });

    it("should handle multiple allowed roles", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);

      const response = await requireRole(mockRequest, mockHandler, [
        "user",
        "seller",
        "admin",
      ]);

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should attach session when available", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockResolvedValue(mockSession);

      const response = await optionalAuth(mockRequest, mockHandler);

      expect(mockHandler).toHaveBeenCalled();

      const req = mockHandler.mock.calls[0][0];
      expect(req.session).toEqual(mockSession);
    });

    it("should continue without session when token missing", async () => {
      (getSessionToken as jest.Mock).mockReturnValue(null);

      const response = await optionalAuth(mockRequest, mockHandler);

      expect(mockHandler).toHaveBeenCalled();

      const req = mockHandler.mock.calls[0][0];
      expect(req.session).toBeUndefined();
    });

    it("should continue without session when verification fails", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("invalid-token");
      (verifySession as jest.Mock).mockResolvedValue(null);

      const response = await optionalAuth(mockRequest, mockHandler);

      expect(mockHandler).toHaveBeenCalled();

      const req = mockHandler.mock.calls[0][0];
      expect(req.session).toBeUndefined();
    });

    it("should handle errors gracefully", async () => {
      (getSessionToken as jest.Mock).mockReturnValue("valid-token");
      (verifySession as jest.Mock).mockRejectedValue(
        new Error("Verification error")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const response = await optionalAuth(mockRequest, mockHandler);

      expect(mockHandler).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
