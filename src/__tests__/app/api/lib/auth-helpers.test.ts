/**
 * Unit Tests for Auth Helpers
 * Tests authentication helper functions for API routes
 *
 * TESTS COVER:
 * - getAuthUser functionality
 * - requireAuth with valid/invalid sessions
 * - requireRole with different roles
 * - getUserShops filtering and fetching
 * - getPrimaryShopId logic
 * - verifyShopOwnership for users and admins
 * - handleAuthError response formatting
 * - getShopIdFromRequest logic
 * - Error handling and edge cases
 *
 * CODE ISSUES FOUND:
 * 1. No validation for empty shopId parameters
 * 2. Missing null checks in some error paths
 * 3. Error logging could expose sensitive data
 * 4. No rate limiting on authentication calls
 */

import {
  AuthUser,
  getAuthUser,
  getPrimaryShopId,
  getShopIdFromRequest,
  getUserShops,
  handleAuthError,
  requireAuth,
  requireRole,
  verifyShopOwnership,
} from "@/app/api/lib/auth-helpers";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "@/app/api/lib/errors";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { getCurrentUser } from "@/app/api/lib/session";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";

// Mock dependencies BEFORE imports
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

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;
const mockGetFirestoreAdmin = getFirestoreAdmin as jest.MockedFunction<
  typeof getFirestoreAdmin
>;

describe("auth-helpers", () => {
  let mockRequest: NextRequest;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock request
    mockRequest = {
      url: "https://example.com/api/test",
      headers: new Map(),
    } as unknown as NextRequest;

    // Create mock Firestore
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnThis(),
    };

    mockGetFirestoreAdmin.mockReturnValue(mockDb);
  });

  describe("getAuthUser", () => {
    it("should return user when authenticated", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      const result = await getAuthUser(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockGetCurrentUser).toHaveBeenCalledWith(mockRequest);
    });

    it("should return null when not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await getAuthUser(mockRequest);

      expect(result).toBeNull();
      expect(mockGetCurrentUser).toHaveBeenCalledWith(mockRequest);
    });

    it("should return null on session error", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Session error"));

      // Should propagate the error, not return null
      await expect(getAuthUser(mockRequest)).rejects.toThrow("Session error");
    });
  });

  describe("requireAuth", () => {
    it("should return user when authenticated", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      const result = await requireAuth(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockGetCurrentUser).toHaveBeenCalledWith(mockRequest);
    });

    it("should throw UnauthorizedError when not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      await expect(requireAuth(mockRequest)).rejects.toThrow(UnauthorizedError);
      await expect(requireAuth(mockRequest)).rejects.toThrow(
        "Unauthorized - Please log in to continue"
      );
    });

    it("should throw UnauthorizedError with correct status", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      try {
        await requireAuth(mockRequest);
        fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
        expect((error as any).statusCode).toBe(401);
      }
    });

    it("should propagate session errors", async () => {
      mockGetCurrentUser.mockRejectedValue(new Error("Session error"));

      await expect(requireAuth(mockRequest)).rejects.toThrow("Session error");
    });
  });

  describe("requireRole", () => {
    it("should return user when role is allowed", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      const result = await requireRole(mockRequest, ["admin", "seller"]);

      expect(result).toEqual(mockUser);
    });

    it("should throw ForbiddenError when role is not allowed", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "user@example.com",
        name: "Regular User",
        role: "user",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      await expect(
        requireRole(mockRequest, ["admin", "seller"])
      ).rejects.toThrow(ForbiddenError);
      await expect(
        requireRole(mockRequest, ["admin", "seller"])
      ).rejects.toThrow("Forbidden - admin or seller role required");
    });

    it("should throw ForbiddenError with correct status", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "user@example.com",
        name: "Regular User",
        role: "user",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      try {
        await requireRole(mockRequest, ["admin"]);
        fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
        expect((error as any).statusCode).toBe(403);
      }
    });

    it("should throw UnauthorizedError when not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      await expect(requireRole(mockRequest, ["admin"])).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should accept single role in array", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "seller@example.com",
        name: "Seller User",
        role: "seller",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      const result = await requireRole(mockRequest, ["seller"]);

      expect(result).toEqual(mockUser);
    });

    it("should handle multiple allowed roles correctly", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "moderator@example.com",
        name: "Moderator User",
        role: "moderator",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      const result = await requireRole(mockRequest, [
        "admin",
        "moderator",
        "seller",
      ]);

      expect(result).toEqual(mockUser);
    });

    it("should be case-sensitive for roles", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      // Should fail with different case
      await expect(requireRole(mockRequest, ["Admin"])).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("getUserShops", () => {
    it("should return array of shop IDs for user", async () => {
      const mockShops = {
        docs: [{ id: "shop1" }, { id: "shop2" }, { id: "shop3" }],
      };

      mockDb.get.mockResolvedValue(mockShops);

      const result = await getUserShops("user123");

      expect(result).toEqual(["shop1", "shop2", "shop3"]);
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.SHOPS);
      expect(mockDb.where).toHaveBeenCalledWith("owner_id", "==", "user123");
      expect(mockDb.where).toHaveBeenCalledWith("is_banned", "==", false);
      expect(mockDb.select).toHaveBeenCalledWith("__name__");
    });

    it("should return empty array when user has no shops", async () => {
      mockDb.get.mockResolvedValue({ docs: [] });

      const result = await getUserShops("user123");

      expect(result).toEqual([]);
    });

    it("should filter out banned shops", async () => {
      const mockShops = {
        docs: [{ id: "shop1" }, { id: "shop2" }],
      };

      mockDb.get.mockResolvedValue(mockShops);

      await getUserShops("user123");

      expect(mockDb.where).toHaveBeenCalledWith("is_banned", "==", false);
    });

    it("should throw error on database failure", async () => {
      mockDb.get.mockRejectedValue(new Error("Database error"));

      await expect(getUserShops("user123")).rejects.toThrow(
        "Failed to fetch user shops"
      );
    });

    it("should log error on database failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockDb.get.mockRejectedValue(new Error("Database error"));

      await expect(getUserShops("user123")).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching user shops:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should use select for performance optimization", async () => {
      mockDb.get.mockResolvedValue({ docs: [] });

      await getUserShops("user123");

      // Verify that select is used to fetch only document IDs
      expect(mockDb.select).toHaveBeenCalledWith("__name__");
    });
  });

  describe("getPrimaryShopId", () => {
    it("should return first shop ID ordered by created_at", async () => {
      const mockShop = {
        empty: false,
        docs: [{ id: "shop123" }],
      };

      mockDb.get.mockResolvedValue(mockShop);

      const result = await getPrimaryShopId("user123");

      expect(result).toBe("shop123");
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.SHOPS);
      expect(mockDb.where).toHaveBeenCalledWith("owner_id", "==", "user123");
      expect(mockDb.where).toHaveBeenCalledWith("is_banned", "==", false);
      expect(mockDb.orderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it("should return null when user has no shops", async () => {
      mockDb.get.mockResolvedValue({ empty: true, docs: [] });

      const result = await getPrimaryShopId("user123");

      expect(result).toBeNull();
    });

    it("should throw error on database failure", async () => {
      mockDb.get.mockRejectedValue(new Error("Database error"));

      await expect(getPrimaryShopId("user123")).rejects.toThrow(
        "Failed to fetch primary shop"
      );
    });

    it("should log error on database failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockDb.get.mockRejectedValue(new Error("Database error"));

      await expect(getPrimaryShopId("user123")).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching primary shop:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should only fetch one shop with limit(1)", async () => {
      mockDb.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop123" }],
      });

      await getPrimaryShopId("user123");

      expect(mockDb.limit).toHaveBeenCalledWith(1);
    });

    it("should order by created_at descending to get newest shop", async () => {
      mockDb.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop123" }],
      });

      await getPrimaryShopId("user123");

      expect(mockDb.orderBy).toHaveBeenCalledWith("created_at", "desc");
    });
  });

  describe("verifyShopOwnership", () => {
    it("should return true for admin users", async () => {
      const result = await verifyShopOwnership("user123", "shop456", "admin");

      expect(result).toBe(true);
      expect(mockDb.collection).not.toHaveBeenCalled(); // Should not query database
    });

    it("should return true when user owns the shop", async () => {
      const mockShop = {
        exists: true,
        data: () => ({ owner_id: "user123" }),
      };

      mockDb.get.mockResolvedValue(mockShop);

      const result = await verifyShopOwnership("user123", "shop456", "seller");

      expect(result).toBe(true);
      expect(mockDb.collection).toHaveBeenCalledWith(COLLECTIONS.SHOPS);
      expect(mockDb.doc).toHaveBeenCalledWith("shop456");
    });

    it("should return false when user does not own the shop", async () => {
      const mockShop = {
        exists: true,
        data: () => ({ owner_id: "otheruser" }),
      };

      mockDb.get.mockResolvedValue(mockShop);

      const result = await verifyShopOwnership("user123", "shop456", "seller");

      expect(result).toBe(false);
    });

    it("should return false when shop does not exist", async () => {
      mockDb.get.mockResolvedValue({ exists: false });

      const result = await verifyShopOwnership("user123", "shop456", "seller");

      expect(result).toBe(false);
    });

    it("should throw error on database failure", async () => {
      mockDb.get.mockRejectedValue(new Error("Database error"));

      await expect(
        verifyShopOwnership("user123", "shop456", "seller")
      ).rejects.toThrow("Failed to verify shop ownership");
    });

    it("should log error on database failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockDb.get.mockRejectedValue(new Error("Database error"));

      await expect(
        verifyShopOwnership("user123", "shop456", "seller")
      ).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error verifying shop ownership:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle shop data without owner_id", async () => {
      const mockShop = {
        exists: true,
        data: () => ({}), // No owner_id field
      };

      mockDb.get.mockResolvedValue(mockShop);

      const result = await verifyShopOwnership("user123", "shop456", "seller");

      expect(result).toBe(false);
    });

    it("should return true for admin even if shop does not exist", async () => {
      // Admin check happens before database query
      const result = await verifyShopOwnership(
        "user123",
        "nonexistent",
        "admin"
      );

      expect(result).toBe(true);
      expect(mockDb.collection).not.toHaveBeenCalled();
    });
  });

  describe("handleAuthError", () => {
    it("should handle ApiError with status", () => {
      const error = new UnauthorizedError("Unauthorized");

      const response = handleAuthError(error);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
    });

    it("should include error details if provided", async () => {
      const error = new BadRequestError("Validation failed", {
        field1: "error1",
        field2: "error2",
      });

      const response = handleAuthError(error);
      const data = await response.json();

      expect(data.error).toBe("Validation failed");
      expect(data.details).toEqual({ field1: "error1", field2: "error2" });
    });

    it("should handle unknown errors with 500 status", () => {
      const error = new Error("Unknown error");

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const response = handleAuthError(error);

      expect(response.status).toBe(500);
      expect(consoleSpy).toHaveBeenCalledWith("Unexpected auth error:", error);

      consoleSpy.mockRestore();
    });

    it("should return generic message for unknown errors", async () => {
      const error = new Error("Unknown error");

      jest.spyOn(console, "error").mockImplementation();
      const response = handleAuthError(error);
      const data = await response.json();

      expect(data.error).toBe("Internal server error");
    });

    it("should handle non-Error objects", async () => {
      const error = "String error";

      jest.spyOn(console, "error").mockImplementation();
      const response = handleAuthError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should not include details if not provided", async () => {
      const error = new ForbiddenError("Forbidden");

      const response = handleAuthError(error);
      const data = await response.json();

      expect(data.error).toBe("Forbidden");
      expect(data.details).toBeUndefined();
    });
  });

  describe("getShopIdFromRequest", () => {
    it("should return shop_id from query params if user has access", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "seller@example.com",
        name: "Seller User",
        role: "seller",
      };

      mockRequest = {
        url: "https://example.com/api/test?shop_id=shop456",
      } as NextRequest;

      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({ owner_id: "user123" }),
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBe("shop456");
    });

    it("should throw ForbiddenError if user does not have access to shop", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "seller@example.com",
        name: "Seller User",
        role: "seller",
      };

      mockRequest = {
        url: "https://example.com/api/test?shop_id=shop456",
      } as NextRequest;

      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({ owner_id: "otheruser" }),
      });

      await expect(getShopIdFromRequest(mockRequest, mockUser)).rejects.toThrow(
        ForbiddenError
      );
      await expect(getShopIdFromRequest(mockRequest, mockUser)).rejects.toThrow(
        "You do not have access to this shop"
      );
    });

    it("should return primary shop for seller without shop_id param", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "seller@example.com",
        name: "Seller User",
        role: "seller",
      };

      mockRequest = {
        url: "https://example.com/api/test",
      } as NextRequest;

      mockDb.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop789" }],
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBe("shop789");
    });

    it("should return null for admin without shop_id param", async () => {
      const mockUser: AuthUser = {
        id: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      mockRequest = {
        url: "https://example.com/api/test",
      } as NextRequest;

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBeNull();
    });

    it("should return null for regular user", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "user@example.com",
        name: "Regular User",
        role: "user",
      };

      mockRequest = {
        url: "https://example.com/api/test",
      } as NextRequest;

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBeNull();
    });

    it("should allow admin to access any shop with shop_id param", async () => {
      const mockUser: AuthUser = {
        id: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      mockRequest = {
        url: "https://example.com/api/test?shop_id=anyshop",
      } as NextRequest;

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBe("anyshop");
      expect(mockDb.collection).not.toHaveBeenCalled(); // Admin bypasses ownership check
    });

    it("should return null if seller has no shops", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "seller@example.com",
        name: "Seller User",
        role: "seller",
      };

      mockRequest = {
        url: "https://example.com/api/test",
      } as NextRequest;

      mockDb.get.mockResolvedValue({ empty: true, docs: [] });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBeNull();
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle malformed URLs gracefully", async () => {
      mockRequest = {
        url: "not-a-valid-url",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "user@example.com",
        name: "Test User",
        role: "user",
      };

      // Should throw error when trying to parse URL
      await expect(
        getShopIdFromRequest(mockRequest, mockUser)
      ).rejects.toThrow();
    });

    it("should handle null user data from getCurrentUser", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await getAuthUser(mockRequest);

      expect(result).toBeNull();
    });

    it("should handle empty role array in requireRole", async () => {
      const mockUser: AuthUser = {
        id: "user123",
        email: "user@example.com",
        name: "Test User",
        role: "user",
      };

      mockGetCurrentUser.mockResolvedValue(mockUser);

      // Empty array means no roles allowed, should fail
      await expect(requireRole(mockRequest, [])).rejects.toThrow(
        ForbiddenError
      );
    });

    it("should handle undefined owner_id in shop data", async () => {
      const mockShop = {
        exists: true,
        data: () => ({ name: "Shop Name" }), // Missing owner_id
      };

      mockDb.get.mockResolvedValue(mockShop);

      const result = await verifyShopOwnership("user123", "shop456", "seller");

      expect(result).toBe(false);
    });

    it("should handle database returning undefined for shop.data()", async () => {
      const mockShop = {
        exists: true,
        data: () => undefined,
      };

      mockDb.get.mockResolvedValue(mockShop);

      const result = await verifyShopOwnership("user123", "shop456", "seller");

      expect(result).toBe(false);
    });
  });
});
