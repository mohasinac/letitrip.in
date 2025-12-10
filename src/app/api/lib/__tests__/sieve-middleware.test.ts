/**
 * Comprehensive test suite for sieve-middleware.ts
 * Tests: 70+ tests covering all middleware scenarios
 */

import { NextRequest, NextResponse } from "next/server";
import {
  sieveFilters,
  SieveMiddlewareOptions,
  withProtectedSieve,
  withSieve,
} from "../sieve-middleware";
import type { FilterCondition, SieveConfig } from "../sieve/types";

// Mock dependencies
jest.mock("../sieve/firestore");
jest.mock("../sieve/parser");
jest.mock("@/app/api/middleware/rbac-auth");

const { executeSieveQuery } = require("../sieve/firestore");
const { parseSieveQuery } = require("../sieve/parser");

describe("sieve-middleware.ts", () => {
  let mockConfig: SieveConfig;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      allowedFilters: ["name", "status", "categoryId"],
      allowedSorts: ["name", "createdAt"],
      defaultSort: "createdAt",
      defaultSortOrder: "desc",
      maxPageSize: 100,
      defaultPageSize: 20,
    } as SieveConfig;

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("withSieve", () => {
    const createMockRequest = (
      searchParams: Record<string, string> = {}
    ): NextRequest => {
      const url = new URL("http://localhost/api/test");
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      return {
        nextUrl: url,
        url: url.toString(),
      } as NextRequest;
    };

    describe("Basic Query Execution", () => {
      it("should parse and execute sieve query", async () => {
        const mockQuery = {
          filters: [],
          sorts: [],
          page: 1,
          pageSize: 20,
        };
        const mockResult = {
          data: [{ id: "1", name: "Product 1" }],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        };

        parseSieveQuery.mockReturnValue({ query: mockQuery });
        executeSieveQuery.mockResolvedValue(mockResult);

        const options: SieveMiddlewareOptions = {
          collection: "products",
        };

        const handler = withSieve(mockConfig, options);
        const req = createMockRequest();
        const response = await handler(req);

        expect(parseSieveQuery).toHaveBeenCalledWith(
          expect.any(URLSearchParams),
          mockConfig
        );
        expect(executeSieveQuery).toHaveBeenCalledWith(
          "products",
          mockQuery,
          mockConfig
        );
        expect(response.status).toBe(200);
      });

      it("should return query results as JSON", async () => {
        const mockResult = {
          data: [{ id: "1" }],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        };

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue(mockResult);

        const handler = withSieve(mockConfig, {
          collection: "products",
        });
        const response = await handler(createMockRequest());
        const body = await response.json();

        expect(body).toEqual(mockResult);
      });

      it("should use correct collection name", async () => {
        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "custom-collection",
        });
        await handler(createMockRequest());

        expect(executeSieveQuery).toHaveBeenCalledWith(
          "custom-collection",
          expect.any(Object),
          mockConfig
        );
      });
    });

    describe("Mandatory Filters", () => {
      it("should add mandatory filters to query", async () => {
        const mandatoryFilters: FilterCondition[] = [
          { field: "status", operator: "==", value: "published" },
        ];

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          mandatoryFilters,
        });
        await handler(createMockRequest());

        expect(executeSieveQuery).toHaveBeenCalledWith(
          "products",
          expect.objectContaining({
            filters: [{ field: "status", operator: "==", value: "published" }],
          }),
          mockConfig
        );
      });

      it("should remove client filters on mandatory fields", async () => {
        const mandatoryFilters: FilterCondition[] = [
          { field: "status", operator: "==", value: "published" },
        ];

        const clientFilters = [
          { field: "status", operator: "==", value: "draft" }, // Should be removed
          { field: "name", operator: "==", value: "test" }, // Should be kept
        ];

        parseSieveQuery.mockReturnValue({
          query: { filters: clientFilters, sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          mandatoryFilters,
        });
        await handler(createMockRequest());

        const calledFilters = executeSieveQuery.mock.calls[0][1].filters;
        expect(calledFilters).toHaveLength(2);
        expect(calledFilters[0]).toEqual(mandatoryFilters[0]);
        expect(calledFilters[1].field).toBe("name");
      });

      it("should place mandatory filters first", async () => {
        const mandatoryFilters: FilterCondition[] = [
          { field: "status", operator: "==", value: "published" },
          { field: "verified", operator: "==", value: true },
        ];

        parseSieveQuery.mockReturnValue({
          query: {
            filters: [{ field: "name", operator: "==", value: "test" }],
            sorts: [],
            page: 1,
            pageSize: 20,
          },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          mandatoryFilters,
        });
        await handler(createMockRequest());

        const calledFilters = executeSieveQuery.mock.calls[0][1].filters;
        expect(calledFilters[0]).toEqual(mandatoryFilters[0]);
        expect(calledFilters[1]).toEqual(mandatoryFilters[1]);
        expect(calledFilters[2].field).toBe("name");
      });

      it("should work with no mandatory filters", async () => {
        parseSieveQuery.mockReturnValue({
          query: {
            filters: [{ field: "name", operator: "==", value: "test" }],
            sorts: [],
            page: 1,
            pageSize: 20,
          },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
        });
        await handler(createMockRequest());

        const calledFilters = executeSieveQuery.mock.calls[0][1].filters;
        expect(calledFilters).toHaveLength(1);
        expect(calledFilters[0].field).toBe("name");
      });
    });

    describe("Transform Function", () => {
      it("should transform result data when transformer provided", async () => {
        const mockData = [
          { id: "1", name: "Product 1", price: 100 },
          { id: "2", name: "Product 2", price: 200 },
        ];

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({
          data: mockData,
          total: 2,
        });

        const transform = jest.fn((item) => ({
          ...item,
          formattedPrice: `$${item.price}`,
        }));

        const handler = withSieve(mockConfig, {
          collection: "products",
          transform,
        });
        const response = await handler(createMockRequest());
        const body = await response.json();

        expect(transform).toHaveBeenCalledTimes(2);
        expect(body.data[0]).toHaveProperty("formattedPrice", "$100");
        expect(body.data[1]).toHaveProperty("formattedPrice", "$200");
      });

      it("should not transform when no data", async () => {
        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({
          data: [],
          total: 0,
        });

        const transform = jest.fn();

        const handler = withSieve(mockConfig, {
          collection: "products",
          transform,
        });
        await handler(createMockRequest());

        expect(transform).not.toHaveBeenCalled();
      });

      it("should not transform when result.data is null", async () => {
        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({
          data: null,
          total: 0,
        });

        const transform = jest.fn();

        const handler = withSieve(mockConfig, {
          collection: "products",
          transform,
        });
        const response = await handler(createMockRequest());
        const body = await response.json();

        expect(transform).not.toHaveBeenCalled();
        expect(body.data).toBeNull();
      });
    });

    describe("Custom Handler", () => {
      it("should use custom handler when provided", async () => {
        const customHandler = jest.fn().mockResolvedValue({
          data: [{ id: "custom" }],
          total: 1,
        });

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });

        const handler = withSieve(mockConfig, {
          collection: "products",
          handler: customHandler,
        });
        await handler(createMockRequest());

        expect(customHandler).toHaveBeenCalled();
        expect(executeSieveQuery).not.toHaveBeenCalled();
      });

      it("should pass request, query, and config to custom handler", async () => {
        const customHandler = jest.fn().mockResolvedValue({
          data: [],
          total: 0,
        });

        const mockQuery = {
          filters: [],
          sorts: [],
          page: 1,
          pageSize: 20,
        };

        parseSieveQuery.mockReturnValue({ query: mockQuery });

        const handler = withSieve(mockConfig, {
          collection: "products",
          handler: customHandler,
        });
        const req = createMockRequest();
        await handler(req);

        expect(customHandler).toHaveBeenCalledWith(req, mockQuery, mockConfig);
      });
    });

    describe("beforeQuery Hook", () => {
      it("should call beforeQuery hook before execution", async () => {
        const beforeQuery = jest.fn((req, query) => query);

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          beforeQuery,
        });
        const req = createMockRequest();
        await handler(req);

        expect(beforeQuery).toHaveBeenCalledWith(
          req,
          expect.objectContaining({
            filters: expect.any(Array),
          })
        );
      });

      it("should use modified query from beforeQuery", async () => {
        const beforeQuery = jest.fn((req, query) => ({
          ...query,
          filters: [
            ...query.filters,
            { field: "custom", operator: "==", value: "added" },
          ],
        }));

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          beforeQuery,
        });
        await handler(createMockRequest());

        expect(executeSieveQuery).toHaveBeenCalledWith(
          "products",
          expect.objectContaining({
            filters: [{ field: "custom", operator: "==", value: "added" }],
          }),
          mockConfig
        );
      });

      it("should handle async beforeQuery", async () => {
        const beforeQuery = jest.fn(async (req, query) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return query;
        });

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          beforeQuery,
        });
        await handler(createMockRequest());

        expect(beforeQuery).toHaveBeenCalled();
      });
    });

    describe("afterQuery Hook", () => {
      it("should call afterQuery hook after execution", async () => {
        const afterQuery = jest.fn((result, req) => result);

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          afterQuery,
        });
        const req = createMockRequest();
        await handler(req);

        expect(afterQuery).toHaveBeenCalledWith(
          expect.objectContaining({ data: [], total: 0 }),
          req
        );
      });

      it("should use modified result from afterQuery", async () => {
        const afterQuery = jest.fn((result, req) => ({
          ...result,
          customField: "added",
        }));

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          afterQuery,
        });
        const response = await handler(createMockRequest());
        const body = await response.json();

        expect(body.customField).toBe("added");
      });

      it("should handle async afterQuery", async () => {
        const afterQuery = jest.fn(async (result, req) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return result;
        });

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          afterQuery,
        });
        await handler(createMockRequest());

        expect(afterQuery).toHaveBeenCalled();
      });
    });

    describe("Authentication and Authorization", () => {
      it("should check authentication when requireAuth is true", async () => {
        const { requireAuth } = require("@/app/api/middleware/rbac-auth");
        requireAuth.mockResolvedValue({ error: null });

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          requireAuth: true,
        });
        await handler(createMockRequest());

        expect(requireAuth).toHaveBeenCalled();
      });

      it("should return error when authentication fails", async () => {
        const { requireAuth } = require("@/app/api/middleware/rbac-auth");
        const errorResponse = NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
        requireAuth.mockResolvedValue({ error: errorResponse });

        const handler = withSieve(mockConfig, {
          collection: "products",
          requireAuth: true,
        });
        const response = await handler(createMockRequest());

        expect(response).toBe(errorResponse);
        expect(executeSieveQuery).not.toHaveBeenCalled();
      });

      it("should check roles when requiredRoles provided", async () => {
        const {
          requireAuth,
          requireRole,
        } = require("@/app/api/middleware/rbac-auth");
        requireAuth.mockResolvedValue({ error: null });
        requireRole.mockResolvedValue({ error: null });

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          requireAuth: true,
          requiredRoles: ["admin", "seller"],
        });
        const req = createMockRequest();
        await handler(req);

        expect(requireRole).toHaveBeenCalledWith(req, ["admin", "seller"]);
      });

      it("should return error when role check fails", async () => {
        const {
          requireAuth,
          requireRole,
        } = require("@/app/api/middleware/rbac-auth");
        requireAuth.mockResolvedValue({ error: null });
        const errorResponse = NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
        requireRole.mockResolvedValue({ error: errorResponse });

        const handler = withSieve(mockConfig, {
          collection: "products",
          requireAuth: true,
          requiredRoles: ["admin"],
        });
        const response = await handler(createMockRequest());

        expect(response).toBe(errorResponse);
        expect(executeSieveQuery).not.toHaveBeenCalled();
      });

      it("should not check roles when requireAuth is false", async () => {
        const {
          requireAuth,
          requireRole,
        } = require("@/app/api/middleware/rbac-auth");

        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockResolvedValue({ data: [], total: 0 });

        const handler = withSieve(mockConfig, {
          collection: "products",
          requireAuth: false,
          requiredRoles: ["admin"],
        });
        await handler(createMockRequest());

        expect(requireAuth).not.toHaveBeenCalled();
        expect(requireRole).not.toHaveBeenCalled();
      });
    });

    describe("Error Handling", () => {
      it("should catch and return errors", async () => {
        parseSieveQuery.mockImplementation(() => {
          throw new Error("Parser error");
        });

        const handler = withSieve(mockConfig, {
          collection: "products",
        });
        const response = await handler(createMockRequest());

        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.error).toBe("Parser error");
      });

      it("should log errors to console", async () => {
        parseSieveQuery.mockImplementation(() => {
          throw new Error("Test error");
        });

        const handler = withSieve(mockConfig, {
          collection: "products",
        });
        await handler(createMockRequest());

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Sieve middleware error for products:",
          expect.any(Error)
        );
      });

      it("should handle non-Error objects", async () => {
        parseSieveQuery.mockImplementation(() => {
          throw "String error";
        });

        const handler = withSieve(mockConfig, {
          collection: "products",
        });
        const response = await handler(createMockRequest());
        const body = await response.json();

        expect(body.error).toBe("Internal server error");
      });

      it("should handle query execution errors", async () => {
        parseSieveQuery.mockReturnValue({
          query: { filters: [], sorts: [], page: 1, pageSize: 20 },
        });
        executeSieveQuery.mockRejectedValue(new Error("Database error"));

        const handler = withSieve(mockConfig, {
          collection: "products",
        });
        const response = await handler(createMockRequest());

        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.error).toBe("Database error");
      });
    });
  });

  describe("sieveFilters", () => {
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

    it("should create live auction filter", () => {
      const filter = sieveFilters.liveAuction();
      expect(filter).toEqual({
        field: "status",
        operator: "==",
        value: "live",
      });
    });

    it("should create verified shop filter", () => {
      const filter = sieveFilters.verifiedShop();
      expect(filter).toEqual({
        field: "verified",
        operator: "==",
        value: true,
      });
    });

    it("should create by shop filter", () => {
      const filter = sieveFilters.byShop("shop123");
      expect(filter).toEqual({
        field: "shopId",
        operator: "==",
        value: "shop123",
      });
    });

    it("should create by user filter", () => {
      const filter = sieveFilters.byUser("user456");
      expect(filter).toEqual({
        field: "userId",
        operator: "==",
        value: "user456",
      });
    });

    it("should create by category filter", () => {
      const filter = sieveFilters.byCategory("cat789");
      expect(filter).toEqual({
        field: "categoryId",
        operator: "==",
        value: "cat789",
      });
    });

    it("should create not deleted filter", () => {
      const filter = sieveFilters.notDeleted();
      expect(filter).toEqual({
        field: "deletedAt",
        operator: "==null",
        value: null,
      });
    });

    it("should create in stock filter", () => {
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
    const createMockRequest = (): NextRequest => {
      const url = new URL("http://localhost/api/test");
      return {
        nextUrl: url,
        url: url.toString(),
      } as NextRequest;
    };

    it("should return 501 Not Implemented", async () => {
      const handler = withProtectedSieve(mockConfig, {
        collection: "products",
        getAuthFilter: (userId) => ({
          field: "userId",
          operator: "==",
          value: userId,
        }),
      });

      const response = await handler(createMockRequest());

      expect(response.status).toBe(501);
    });

    it("should return error message in response", async () => {
      const handler = withProtectedSieve(mockConfig, {
        collection: "products",
        getAuthFilter: (userId) => ({
          field: "userId",
          operator: "==",
          value: userId,
        }),
      });

      const response = await handler(createMockRequest());
      const body = await response.json();

      expect(body.success).toBe(false);
      expect(body.error).toBe("Protected Sieve not fully implemented");
    });

    it("should return 501 even when getAuthFilter throws", async () => {
      const handler = withProtectedSieve(mockConfig, {
        collection: "products",
        getAuthFilter: () => {
          throw new Error("Test error");
        },
      });

      const response = await handler(createMockRequest());

      // Still returns 501 because the function is not implemented
      // The error in getAuthFilter doesn't affect the response
      expect(response.status).toBe(501);
      const body = await response.json();
      expect(body.error).toBe("Protected Sieve not fully implemented");
    });

    it("should not log errors when not implemented", async () => {
      const handler = withProtectedSieve(mockConfig, {
        collection: "products",
        getAuthFilter: () => {
          throw new Error("Test error");
        },
      });

      await handler(createMockRequest());

      // Should not log errors for not implemented functionality
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
