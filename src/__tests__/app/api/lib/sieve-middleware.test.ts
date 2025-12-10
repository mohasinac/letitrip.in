/**
 * Unit Tests for Sieve Middleware
 * Tests the withSieve middleware for API route pagination
 *
 * TESTS COVER:
 * - Request parsing and query construction
 * - Mandatory filters enforcement
 * - Authentication and authorization
 * - Transform functions
 * - Before/after query hooks
 * - Custom handlers
 * - Error handling
 * - Protected sieve functionality
 * - Filter helper functions
 */

import {
  sieveFilters,
  SieveMiddlewareOptions,
  withProtectedSieve,
  withSieve,
} from "@/app/api/lib/sieve-middleware";
import { executeSieveQuery } from "@/app/api/lib/sieve/firestore";
import { parseSieveQuery } from "@/app/api/lib/sieve/parser";
import type { SieveConfig } from "@/app/api/lib/sieve/types";
import { NextRequest, NextResponse } from "next/server";

// Mock dependencies
jest.mock("@/app/api/lib/sieve/parser");
jest.mock("@/app/api/lib/sieve/firestore");
jest.mock("@/app/api/middleware/rbac-auth", () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

const mockParseSieveQuery = parseSieveQuery as jest.MockedFunction<
  typeof parseSieveQuery
>;
const mockExecuteSieveQuery = executeSieveQuery as jest.MockedFunction<
  typeof executeSieveQuery
>;

describe("sieve-middleware", () => {
  let mockRequest: NextRequest;
  let mockConfig: SieveConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock request
    mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams({
          page: "1",
          pageSize: "20",
          filters: "status==active",
        }),
      },
      headers: new Map(),
    } as unknown as NextRequest;

    // Create mock config
    mockConfig = {
      allowedFilters: ["status", "categoryId", "shopId"],
      allowedSorts: ["createdAt", "price", "name"],
      defaultSort: "createdAt",
      defaultSortDirection: "desc",
      maxPageSize: 100,
      defaultPageSize: 20,
    };

    // Setup default mocks
    mockParseSieveQuery.mockReturnValue({
      query: {
        filters: [{ field: "status", operator: "==", value: "active" }],
        sorts: [{ field: "createdAt", direction: "desc" }],
        page: 1,
        pageSize: 20,
      },
      errors: [],
    });

    mockExecuteSieveQuery.mockResolvedValue({
      data: [
        { id: "1", name: "Product 1", status: "active" },
        { id: "2", name: "Product 2", status: "active" },
      ],
      meta: {
        page: 1,
        pageSize: 20,
        totalCount: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  describe("withSieve - Basic Functionality", () => {
    it("should handle basic sieve query successfully", async () => {
      const options: SieveMiddlewareOptions = {
        collection: "products",
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.meta.page).toBe(1);
      expect(mockParseSieveQuery).toHaveBeenCalledWith(
        mockRequest.nextUrl.searchParams,
        mockConfig
      );
      expect(mockExecuteSieveQuery).toHaveBeenCalledWith(
        "products",
        expect.objectContaining({
          filters: [{ field: "status", operator: "==", value: "active" }],
          page: 1,
          pageSize: 20,
        }),
        mockConfig
      );
    });

    it("should apply transform function to results", async () => {
      const transformFn = jest.fn((item) => ({
        ...item,
        transformed: true,
      }));

      const options: SieveMiddlewareOptions = {
        collection: "products",
        transform: transformFn,
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(transformFn).toHaveBeenCalledTimes(2);
      expect(data.data[0].transformed).toBe(true);
      expect(data.data[1].transformed).toBe(true);
    });

    it("should handle empty results", async () => {
      mockExecuteSieveQuery.mockResolvedValue({
        data: [],
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.meta.totalCount).toBe(0);
    });
  });

  describe("withSieve - Mandatory Filters", () => {
    it("should enforce mandatory filters", async () => {
      const options: SieveMiddlewareOptions = {
        collection: "products",
        mandatoryFilters: [
          { field: "status", operator: "==", value: "published" },
        ],
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      expect(mockExecuteSieveQuery).toHaveBeenCalledWith(
        "products",
        expect.objectContaining({
          filters: expect.arrayContaining([
            { field: "status", operator: "==", value: "published" },
          ]),
        }),
        mockConfig
      );
    });

    it("should prevent client from overriding mandatory filters", async () => {
      // Client tries to filter by status=active
      mockParseSieveQuery.mockReturnValue({
        query: {
          filters: [{ field: "status", operator: "==", value: "active" }],
          sorts: [],
          page: 1,
          pageSize: 20,
        },
        errors: [],
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
        mandatoryFilters: [
          { field: "status", operator: "==", value: "published" }, // Force published
        ],
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      const executedQuery = mockExecuteSieveQuery.mock.calls[0][1];

      // Should only have the mandatory filter, client's filter removed
      expect(executedQuery.filters).toHaveLength(1);
      expect(executedQuery.filters[0]).toEqual({
        field: "status",
        operator: "==",
        value: "published",
      });
    });

    it("should add mandatory filters while preserving non-conflicting filters", async () => {
      mockParseSieveQuery.mockReturnValue({
        query: {
          filters: [
            { field: "categoryId", operator: "==", value: "cat123" },
            { field: "status", operator: "==", value: "active" }, // Will be overridden
          ],
          sorts: [],
          page: 1,
          pageSize: 20,
        },
        errors: [],
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
        mandatoryFilters: [
          { field: "status", operator: "==", value: "published" },
        ],
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      const executedQuery = mockExecuteSieveQuery.mock.calls[0][1];

      // Should have mandatory filter + non-conflicting filter
      expect(executedQuery.filters).toHaveLength(2);
      expect(executedQuery.filters[0]).toEqual({
        field: "status",
        operator: "==",
        value: "published",
      });
      expect(executedQuery.filters[1]).toEqual({
        field: "categoryId",
        operator: "==",
        value: "cat123",
      });
    });

    it("should handle multiple mandatory filters", async () => {
      const options: SieveMiddlewareOptions = {
        collection: "products",
        mandatoryFilters: [
          { field: "status", operator: "==", value: "published" },
          { field: "verified", operator: "==", value: true },
        ],
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      const executedQuery = mockExecuteSieveQuery.mock.calls[0][1];

      expect(executedQuery.filters).toContainEqual({
        field: "status",
        operator: "==",
        value: "published",
      });
      expect(executedQuery.filters).toContainEqual({
        field: "verified",
        operator: "==",
        value: true,
      });
    });
  });

  describe("withSieve - Hooks", () => {
    it("should call beforeQuery hook and modify query", async () => {
      const beforeQueryFn = jest.fn(async (req, query) => ({
        ...query,
        filters: [
          ...query.filters,
          { field: "featured", operator: "==", value: true },
        ],
      }));

      const options: SieveMiddlewareOptions = {
        collection: "products",
        beforeQuery: beforeQueryFn,
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      expect(beforeQueryFn).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          filters: expect.any(Array),
        })
      );

      const executedQuery = mockExecuteSieveQuery.mock.calls[0][1];
      expect(executedQuery.filters).toContainEqual({
        field: "featured",
        operator: "==",
        value: true,
      });
    });

    it("should call afterQuery hook and modify response", async () => {
      const afterQueryFn = jest.fn(async (result, req) => ({
        ...result,
        data: result.data.map((item: any) => ({
          ...item,
          modified: true,
        })),
      }));

      const options: SieveMiddlewareOptions = {
        collection: "products",
        afterQuery: afterQueryFn,
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(afterQueryFn).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
        }),
        mockRequest
      );

      expect(data.data[0].modified).toBe(true);
      expect(data.data[1].modified).toBe(true);
    });

    it("should call hooks in correct order", async () => {
      const callOrder: string[] = [];

      const options: SieveMiddlewareOptions = {
        collection: "products",
        beforeQuery: jest.fn(async (req, query) => {
          callOrder.push("beforeQuery");
          return query;
        }),
        afterQuery: jest.fn(async (result, req) => {
          callOrder.push("afterQuery");
          return result;
        }),
        transform: jest.fn((item) => {
          callOrder.push("transform");
          return item;
        }),
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      expect(callOrder).toEqual([
        "beforeQuery",
        "transform",
        "transform",
        "afterQuery",
      ]);
    });
  });

  describe("withSieve - Custom Handler", () => {
    it("should use custom handler when provided", async () => {
      const customHandler = jest.fn(async (req, sieveQuery, config) => ({
        data: [{ id: "custom", name: "Custom Result" }],
        meta: {
          page: 1,
          pageSize: 1,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }));

      const options: SieveMiddlewareOptions = {
        collection: "products",
        handler: customHandler,
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(customHandler).toHaveBeenCalled();
      expect(mockExecuteSieveQuery).not.toHaveBeenCalled();
      expect(data.data[0].id).toBe("custom");
    });

    it("should pass correct parameters to custom handler", async () => {
      const customHandler = jest.fn(async () => ({
        data: [],
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }));

      const options: SieveMiddlewareOptions = {
        collection: "products",
        handler: customHandler,
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      expect(customHandler).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          filters: expect.any(Array),
          page: 1,
          pageSize: 20,
        }),
        mockConfig
      );
    });
  });

  describe("withSieve - Authentication", () => {
    it("should require authentication when requireAuth is true", async () => {
      const { requireAuth } = await import("@/app/api/middleware/rbac-auth");
      const mockRequireAuth = requireAuth as jest.MockedFunction<
        typeof requireAuth
      >;

      mockRequireAuth.mockResolvedValue({
        user: { uid: "user123", email: "test@example.com", name: "Test User" },
        error: null,
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
        requireAuth: true,
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      expect(mockRequireAuth).toHaveBeenCalledWith(mockRequest);
    });

    it("should return error if authentication fails", async () => {
      const { requireAuth } = await import("@/app/api/middleware/rbac-auth");
      const mockRequireAuth = requireAuth as jest.MockedFunction<
        typeof requireAuth
      >;

      const errorResponse = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      mockRequireAuth.mockResolvedValue({
        user: null,
        error: errorResponse,
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
        requireAuth: true,
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);

      expect(response).toBe(errorResponse);
      expect(mockExecuteSieveQuery).not.toHaveBeenCalled();
    });

    it("should check roles when requiredRoles is specified", async () => {
      const { requireAuth, requireRole } = await import(
        "@/app/api/middleware/rbac-auth"
      );
      const mockRequireAuth = requireAuth as jest.MockedFunction<
        typeof requireAuth
      >;
      const mockRequireRole = requireRole as jest.MockedFunction<
        typeof requireRole
      >;

      mockRequireAuth.mockResolvedValue({
        user: { uid: "user123", email: "test@example.com", name: "Test User" },
        error: null,
      });
      mockRequireRole.mockResolvedValue({
        user: { uid: "user123", email: "test@example.com", name: "Test User" },
        error: null,
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
        requireAuth: true,
        requiredRoles: ["admin", "seller"],
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      expect(mockRequireAuth).toHaveBeenCalled();
      expect(mockRequireRole).toHaveBeenCalledWith(mockRequest, [
        "admin",
        "seller",
      ]);
    });

    it("should return error if role check fails", async () => {
      const { requireAuth, requireRole } = await import(
        "@/app/api/middleware/rbac-auth"
      );
      const mockRequireAuth = requireAuth as jest.MockedFunction<
        typeof requireAuth
      >;
      const mockRequireRole = requireRole as jest.MockedFunction<
        typeof requireRole
      >;

      mockRequireAuth.mockResolvedValue({
        user: { uid: "user123", email: "test@example.com", name: "Test User" },
        error: null,
      });

      const errorResponse = NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
      mockRequireRole.mockResolvedValue({
        user: null,
        error: errorResponse,
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
        requireAuth: true,
        requiredRoles: ["admin"],
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);

      expect(response).toBe(errorResponse);
      expect(mockExecuteSieveQuery).not.toHaveBeenCalled();
    });
  });

  describe("withSieve - Error Handling", () => {
    it("should handle errors from executeSieveQuery", async () => {
      mockExecuteSieveQuery.mockRejectedValue(new Error("Database error"));

      const options: SieveMiddlewareOptions = {
        collection: "products",
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database error");
    });

    it("should handle errors from beforeQuery hook", async () => {
      const options: SieveMiddlewareOptions = {
        collection: "products",
        beforeQuery: jest.fn(() => {
          throw new Error("BeforeQuery error");
        }),
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("BeforeQuery error");
    });

    it("should handle errors from transform function", async () => {
      const options: SieveMiddlewareOptions = {
        collection: "products",
        transform: jest.fn(() => {
          throw new Error("Transform error");
        }),
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Transform error");
    });

    it("should handle errors from afterQuery hook", async () => {
      const options: SieveMiddlewareOptions = {
        collection: "products",
        afterQuery: jest.fn(() => {
          throw new Error("AfterQuery error");
        }),
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("AfterQuery error");
    });

    it("should handle non-Error exceptions", async () => {
      mockExecuteSieveQuery.mockRejectedValue("String error");

      const options: SieveMiddlewareOptions = {
        collection: "products",
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("sieveFilters - Helper Functions", () => {
    it("should create published filter", () => {
      const filter = sieveFilters.published();
      expect(filter).toEqual({
        field: "status",
        operator: "==",
        value: "published",
      });
    });

    it("should create active filter", () => {
      const filter = sieveFilters.active();
      expect(filter).toEqual({
        field: "status",
        operator: "==",
        value: "active",
      });
    });

    it("should create liveAuction filter", () => {
      const filter = sieveFilters.liveAuction();
      expect(filter).toEqual({
        field: "status",
        operator: "==",
        value: "live",
      });
    });

    it("should create verifiedShop filter", () => {
      const filter = sieveFilters.verifiedShop();
      expect(filter).toEqual({
        field: "verified",
        operator: "==",
        value: true,
      });
    });

    it("should create byShop filter with shopId", () => {
      const filter = sieveFilters.byShop("shop123");
      expect(filter).toEqual({
        field: "shopId",
        operator: "==",
        value: "shop123",
      });
    });

    it("should create byUser filter with userId", () => {
      const filter = sieveFilters.byUser("user123");
      expect(filter).toEqual({
        field: "userId",
        operator: "==",
        value: "user123",
      });
    });

    it("should create byCategory filter with categoryId", () => {
      const filter = sieveFilters.byCategory("cat123");
      expect(filter).toEqual({
        field: "categoryId",
        operator: "==",
        value: "cat123",
      });
    });

    it("should create notDeleted filter", () => {
      const filter = sieveFilters.notDeleted();
      expect(filter).toEqual({
        field: "deletedAt",
        operator: "==null",
        value: null,
      });
    });

    it("should create inStock filter", () => {
      const filter = sieveFilters.inStock();
      expect(filter).toEqual({
        field: "stock",
        operator: ">",
        value: 0,
      });
    });

    it("should create featured filter", () => {
      const filter = sieveFilters.featured();
      expect(filter).toEqual({
        field: "featured",
        operator: "==",
        value: true,
      });
    });
  });

  describe("withProtectedSieve", () => {
    it("should return not implemented error (501)", async () => {
      const options: SieveMiddlewareOptions & { getAuthFilter: any } = {
        collection: "products",
        getAuthFilter: (userId: string) => ({
          field: "userId",
          operator: "==",
          value: userId,
        }),
      };

      const handler = withProtectedSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(501);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Protected Sieve not fully implemented");
    });

    it("should handle errors gracefully", async () => {
      // Mock to throw error
      jest.spyOn(console, "error").mockImplementation(() => {});

      const options: SieveMiddlewareOptions & { getAuthFilter: any } = {
        collection: "products",
        getAuthFilter: () => {
          throw new Error("Test error");
        },
      };

      const handler = withProtectedSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      // withProtectedSieve is not fully implemented (returns 501 immediately)
      expect(response.status).toBe(501);
      expect(data.error).toBe("Protected Sieve not fully implemented");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null transform result", async () => {
      mockExecuteSieveQuery.mockResolvedValue({
        data: null as any,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const options: SieveMiddlewareOptions = {
        collection: "products",
        transform: jest.fn((item) => item),
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeNull();
    });

    it("should handle empty mandatory filters array", async () => {
      const options: SieveMiddlewareOptions = {
        collection: "products",
        mandatoryFilters: [],
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);

      expect(response.status).toBe(200);
      expect(mockExecuteSieveQuery).toHaveBeenCalled();
    });

    it("should handle sync beforeQuery hook", async () => {
      const beforeQueryFn = jest.fn((req, query) => ({
        ...query,
        page: 2,
      }));

      const options: SieveMiddlewareOptions = {
        collection: "products",
        beforeQuery: beforeQueryFn,
      };

      const handler = withSieve(mockConfig, options);
      await handler(mockRequest);

      const executedQuery = mockExecuteSieveQuery.mock.calls[0][1];
      expect(executedQuery.page).toBe(2);
    });

    it("should handle sync afterQuery hook", async () => {
      const afterQueryFn = jest.fn((result) => ({
        ...result,
        modified: true,
      }));

      const options: SieveMiddlewareOptions = {
        collection: "products",
        afterQuery: afterQueryFn,
      };

      const handler = withSieve(mockConfig, options);
      const response = await handler(mockRequest);
      const data = await response.json();

      expect(data.modified).toBe(true);
    });
  });
});
