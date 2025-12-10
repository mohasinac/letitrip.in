/**
 * Unit Tests for Authentication Helper Functions
 * Testing auth utilities for API routes
 */

import { NextRequest } from "next/server";
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
} from "../auth-helpers";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { getFirestoreAdmin } from "../firebase/admin";
import { getCurrentUser } from "../session";

// Mock dependencies
jest.mock("../session");
jest.mock("../firebase/admin");

// Mock Firebase config to prevent initialization errors
jest.mock("../firebase/config", () => ({
  initializeFirebaseAdmin: jest.fn().mockReturnValue({
    auth: jest.fn(),
    firestore: jest.fn(),
  }),
}));

describe("getAuthUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user data when authenticated", async () => {
    const mockUser: AuthUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {} as NextRequest;
    const result = await getAuthUser(mockRequest);

    expect(result).toEqual(mockUser);
    expect(getCurrentUser).toHaveBeenCalledWith(mockRequest);
  });

  it("should return null when not authenticated", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const mockRequest = {} as NextRequest;
    const result = await getAuthUser(mockRequest);

    expect(result).toBeNull();
  });

  it("should pass through different user roles", async () => {
    const roles = ["user", "admin", "seller"];

    for (const role of roles) {
      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role,
      };

      (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await getAuthUser({} as NextRequest);
      expect(result?.role).toBe(role);
    }
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user data when authenticated", async () => {
    const mockUser: AuthUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {} as NextRequest;
    const result = await requireAuth(mockRequest);

    expect(result).toEqual(mockUser);
  });

  it("should throw UnauthorizedError when not authenticated", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const mockRequest = {} as NextRequest;

    await expect(requireAuth(mockRequest)).rejects.toThrow(UnauthorizedError);
    await expect(requireAuth(mockRequest)).rejects.toThrow(
      "Unauthorized - Please log in to continue"
    );
  });

  it("should throw with correct status code", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const mockRequest = {} as NextRequest;

    try {
      await requireAuth(mockRequest);
      fail("Should have thrown error");
    } catch (error: any) {
      expect(error.statusCode).toBe(401);
    }
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user when role matches", async () => {
    const mockUser: AuthUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "admin",
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {} as NextRequest;
    const result = await requireRole(mockRequest, ["admin"]);

    expect(result).toEqual(mockUser);
  });

  it("should return user when role is in allowed list", async () => {
    const mockUser: AuthUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "seller",
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {} as NextRequest;
    const result = await requireRole(mockRequest, ["admin", "seller"]);

    expect(result).toEqual(mockUser);
  });

  it("should throw ForbiddenError when role doesn't match", async () => {
    const mockUser: AuthUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {} as NextRequest;

    await expect(requireRole(mockRequest, ["admin"])).rejects.toThrow(
      ForbiddenError
    );
    await expect(requireRole(mockRequest, ["admin"])).rejects.toThrow(
      "Forbidden - admin role required"
    );
  });

  it("should throw UnauthorizedError when not authenticated", async () => {
    (getCurrentUser as jest.Mock).mockResolvedValue(null);

    const mockRequest = {} as NextRequest;

    await expect(requireRole(mockRequest, ["admin"])).rejects.toThrow(
      UnauthorizedError
    );
  });

  it("should format multiple roles in error message", async () => {
    const mockUser: AuthUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {} as NextRequest;

    try {
      await requireRole(mockRequest, ["admin", "seller"]);
      fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("admin or seller");
    }
  });

  it("should throw with correct status code", async () => {
    const mockUser: AuthUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };

    (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockRequest = {} as NextRequest;

    try {
      await requireRole(mockRequest, ["admin"]);
      fail("Should have thrown error");
    } catch (error: any) {
      expect(error.statusCode).toBe(403);
    }
  });
});

describe("getUserShops", () => {
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  it("should return array of shop IDs", async () => {
    const mockDocs = [{ id: "shop1" }, { id: "shop2" }, { id: "shop3" }];

    mockCollection.get.mockResolvedValue({
      docs: mockDocs,
    });

    const result = await getUserShops("user123");

    expect(result).toEqual(["shop1", "shop2", "shop3"]);
    expect(mockCollection.where).toHaveBeenCalledWith(
      "owner_id",
      "==",
      "user123"
    );
    expect(mockCollection.where).toHaveBeenCalledWith("is_banned", "==", false);
  });

  it("should return empty array when user has no shops", async () => {
    mockCollection.get.mockResolvedValue({
      docs: [],
    });

    const result = await getUserShops("user123");

    expect(result).toEqual([]);
  });

  it("should filter out banned shops", async () => {
    mockCollection.get.mockResolvedValue({
      docs: [{ id: "shop1" }],
    });

    await getUserShops("user123");

    expect(mockCollection.where).toHaveBeenCalledWith("is_banned", "==", false);
  });

  it("should use select for performance optimization", async () => {
    mockCollection.get.mockResolvedValue({
      docs: [],
    });

    await getUserShops("user123");

    expect(mockCollection.select).toHaveBeenCalledWith("__name__");
  });

  it("should throw error on database failure", async () => {
    mockCollection.get.mockRejectedValue(new Error("Database error"));

    await expect(getUserShops("user123")).rejects.toThrow(
      "Failed to fetch user shops"
    );
  });
});

describe("getPrimaryShopId", () => {
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  it("should return primary shop ID", async () => {
    mockCollection.get.mockResolvedValue({
      empty: false,
      docs: [{ id: "shop1" }],
    });

    const result = await getPrimaryShopId("user123");

    expect(result).toBe("shop1");
  });

  it("should return null when user has no shops", async () => {
    mockCollection.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const result = await getPrimaryShopId("user123");

    expect(result).toBeNull();
  });

  it("should order by created_at descending", async () => {
    mockCollection.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    await getPrimaryShopId("user123");

    expect(mockCollection.orderBy).toHaveBeenCalledWith("created_at", "desc");
  });

  it("should limit to 1 result", async () => {
    mockCollection.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    await getPrimaryShopId("user123");

    expect(mockCollection.limit).toHaveBeenCalledWith(1);
  });

  it("should filter non-banned shops", async () => {
    mockCollection.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    await getPrimaryShopId("user123");

    expect(mockCollection.where).toHaveBeenCalledWith("is_banned", "==", false);
  });

  it("should throw error on database failure", async () => {
    mockCollection.get.mockRejectedValue(new Error("Database error"));

    await expect(getPrimaryShopId("user123")).rejects.toThrow(
      "Failed to fetch primary shop"
    );
  });
});

describe("verifyShopOwnership", () => {
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

  it("should return true for admin users", async () => {
    const result = await verifyShopOwnership("user123", "shop123", "admin");

    expect(result).toBe(true);
    expect(mockDoc.get).not.toHaveBeenCalled();
  });

  it("should return true when user owns the shop", async () => {
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ owner_id: "user123" }),
    });

    const result = await verifyShopOwnership("user123", "shop123", "seller");

    expect(result).toBe(true);
  });

  it("should return false when user doesn't own the shop", async () => {
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ owner_id: "user456" }),
    });

    const result = await verifyShopOwnership("user123", "shop123", "seller");

    expect(result).toBe(false);
  });

  it("should return false when shop doesn't exist", async () => {
    mockDoc.get.mockResolvedValue({
      exists: false,
    });

    const result = await verifyShopOwnership("user123", "shop123", "seller");

    expect(result).toBe(false);
  });

  it("should return false when shop data is missing owner_id", async () => {
    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({}),
    });

    const result = await verifyShopOwnership("user123", "shop123", "seller");

    expect(result).toBe(false);
  });

  it("should throw error on database failure", async () => {
    mockDoc.get.mockRejectedValue(new Error("Database error"));

    await expect(
      verifyShopOwnership("user123", "shop123", "seller")
    ).rejects.toThrow("Failed to verify shop ownership");
  });
});

describe("handleAuthError", () => {
  it("should handle ApiError with status code", () => {
    const error = {
      statusCode: 403,
      message: "Forbidden",
    };

    const response = handleAuthError(error);

    expect(response.status).toBe(403);
  });

  it("should include error message in response", async () => {
    const error = {
      statusCode: 401,
      message: "Unauthorized",
    };

    const response = handleAuthError(error);
    const data = await response.json();

    expect(data.error).toBe("Unauthorized");
  });

  it("should include error details when present", async () => {
    const error = {
      statusCode: 400,
      message: "Bad Request",
      errors: { field: "email", reason: "invalid" },
    };

    const response = handleAuthError(error);
    const data = await response.json();

    expect(data.details).toEqual({ field: "email", reason: "invalid" });
  });

  it("should not include details when not present", async () => {
    const error = {
      statusCode: 404,
      message: "Not Found",
    };

    const response = handleAuthError(error);
    const data = await response.json();

    expect(data.details).toBeUndefined();
  });

  it("should handle unknown errors as 500", async () => {
    const error = new Error("Unknown error");

    const response = handleAuthError(error);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Internal server error");
  });

  it("should handle null error", async () => {
    const response = handleAuthError(null);

    expect(response.status).toBe(500);
  });

  it("should handle string error", async () => {
    const response = handleAuthError("Some error");

    expect(response.status).toBe(500);
  });
});

describe("getShopIdFromRequest", () => {
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
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("With shop_id parameter", () => {
    it("should return shop_id when user has access", async () => {
      const mockRequest = {
        url: "https://example.com/api/products?shop_id=shop123",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "seller",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({ owner_id: "user123" }),
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBe("shop123");
    });

    it("should throw ForbiddenError when user doesn't have access", async () => {
      const mockRequest = {
        url: "https://example.com/api/products?shop_id=shop123",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "seller",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({ owner_id: "user456" }),
      });

      await expect(getShopIdFromRequest(mockRequest, mockUser)).rejects.toThrow(
        ForbiddenError
      );
      await expect(getShopIdFromRequest(mockRequest, mockUser)).rejects.toThrow(
        "You do not have access to this shop"
      );
    });

    it("should allow admin to access any shop", async () => {
      const mockRequest = {
        url: "https://example.com/api/products?shop_id=shop123",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({ owner_id: "user456" }),
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBe("shop123");
    });
  });

  describe("Without shop_id parameter", () => {
    it("should return primary shop for sellers", async () => {
      const mockRequest = {
        url: "https://example.com/api/products",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "seller",
      };

      mockCollection.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop123" }],
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBe("shop123");
    });

    it("should return null for sellers with no shops", async () => {
      const mockRequest = {
        url: "https://example.com/api/products",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "seller",
      };

      mockCollection.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBeNull();
    });

    it("should return null for admin without shop_id", async () => {
      const mockRequest = {
        url: "https://example.com/api/products",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "admin123",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      };

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBeNull();
    });

    it("should return null for regular users", async () => {
      const mockRequest = {
        url: "https://example.com/api/products",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle URL with multiple query params", async () => {
      const mockRequest = {
        url: "https://example.com/api/products?page=1&shop_id=shop123&limit=20",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "seller",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({ owner_id: "user123" }),
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      expect(result).toBe("shop123");
    });

    it("should handle empty shop_id parameter", async () => {
      const mockRequest = {
        url: "https://example.com/api/products?shop_id=",
      } as NextRequest;

      const mockUser: AuthUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "seller",
      };

      mockCollection.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop456" }],
      });

      const result = await getShopIdFromRequest(mockRequest, mockUser);

      // Empty string is falsy, should fall back to primary shop
      expect(result).toBe("shop456");
    });
  });
});
