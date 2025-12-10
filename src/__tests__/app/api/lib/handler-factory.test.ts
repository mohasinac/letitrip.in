/**
 * Unit Tests for Handler Factory
 * Tests API handler creation with error handling, auth, and CRUD operations
 *
 * TESTS COVER:
 * - withErrorHandler wrapper functionality
 * - Response helpers (successResponse, errorResponse, paginatedResponse)
 * - createHandler with auth/parseBody/roles/logging options
 * - createCrudHandlers for standard CRUD operations
 * - getPaginationParams and getFilterParams utilities
 * - Authentication integration
 * - Role-based access control
 * - Request body parsing
 * - Error propagation
 * - Edge cases
 *
 * CODE ISSUES FOUND:
 * 1. createHandler params resolution uses unsafe (context as any).params
 * 2. No request size limits for parseBody
 * 3. logging option only logs to console - no structured logging
 * 4. createCrudHandlers canAccess returns NotFoundError for forbidden - wrong pattern
 * 5. No rate limiting built into handlers
 * 6. PATCH allows partial updates without field validation
 * 7. getPaginationParams limits to 100 but no configurable max
 * 8. getFilterParams doesn't validate filter values
 */

import { BadRequestError } from "@/app/api/lib/errors";
import {
  createCrudHandlers,
  createHandler,
  errorResponse,
  getFilterParams,
  getPaginationParams,
  paginatedResponse,
  successResponse,
  withErrorHandler,
} from "@/app/api/lib/handler-factory";
import {
  getUserFromRequest,
  requireAuth,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { NextRequest, NextResponse } from "next/server";

// Mock dependencies FIRST
jest.mock("@/app/api/middleware/rbac-auth", () => ({
  getUserFromRequest: jest.fn(),
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(),
}));
jest.mock("@/app/api/lib/firebase/config", () => ({
  getFirebaseConfig: jest.fn(() => ({
    projectId: "test-project",
    clientEmail: "test@test.com",
    privateKey: "test-key",
  })),
}));

describe("handler-factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("withErrorHandler", () => {
    it("should execute handler successfully", async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true }));

      const wrappedHandler = withErrorHandler(mockHandler);
      const request = new NextRequest("http://localhost/api/test");

      const response = await wrappedHandler(request, {});

      expect(mockHandler).toHaveBeenCalledWith(request, {});
      expect(response.status).toBe(200);
    });

    it("should catch and handle ApiError", async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new BadRequestError("Invalid input"));

      const wrappedHandler = withErrorHandler(mockHandler);
      const request = new NextRequest("http://localhost/api/test");

      const response = await wrappedHandler(request, {});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid input");
    });

    it("should catch and handle unknown errors", async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new Error("Unknown error"));

      const wrappedHandler = withErrorHandler(mockHandler);
      const request = new NextRequest("http://localhost/api/test");

      const response = await wrappedHandler(request, {});

      expect(response.status).toBe(500);
    });

    it("should pass through NextResponse", async () => {
      const expectedResponse = NextResponse.json({ data: "test" });
      const mockHandler = jest.fn().mockResolvedValue(expectedResponse);

      const wrappedHandler = withErrorHandler(mockHandler);
      const request = new NextRequest("http://localhost/api/test");

      const response = await wrappedHandler(request, {});

      expect(response).toBe(expectedResponse);
    });
  });

  describe("Response Helpers", () => {
    describe("successResponse", () => {
      it("should create success response with data", async () => {
        const data = { id: "123", name: "Test" };

        const response = successResponse(data);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data).toEqual(data);
      });

      it("should accept custom status code", async () => {
        const response = successResponse({ id: "123" }, { status: 201 });

        expect(response.status).toBe(201);
      });

      it("should include message when provided", async () => {
        const response = successResponse(
          { id: "123" },
          { message: "Created successfully" }
        );
        const json = await response.json();

        expect(json.message).toBe("Created successfully");
      });

      it("should handle null data", async () => {
        const response = successResponse(null);
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.data).toBeNull();
      });

      it("should handle array data", async () => {
        const response = successResponse([1, 2, 3]);
        const json = await response.json();

        expect(json.data).toEqual([1, 2, 3]);
      });
    });

    describe("errorResponse", () => {
      it("should create error response", async () => {
        const response = errorResponse("Something went wrong", 400);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error).toBe("Something went wrong");
      });

      it("should include details when provided", async () => {
        const details = { field: "email", issue: "Invalid format" };
        const response = errorResponse("Validation failed", 400, details);
        const json = await response.json();

        expect(json.details).toEqual(details);
      });

      it("should default to 400 status", async () => {
        const response = errorResponse("Error");

        expect(response.status).toBe(400);
      });
    });

    describe("paginatedResponse", () => {
      it("should create paginated response", async () => {
        const items = [{ id: "1" }, { id: "2" }];
        const pagination = {
          page: 1,
          limit: 10,
          total: 100,
          hasNextPage: true,
        };

        const response = paginatedResponse(items, pagination);
        const json = await response.json();

        expect(json.success).toBe(true);
        expect(json.data).toEqual(items);
        expect(json.count).toBe(2);
        expect(json.pagination).toEqual(pagination);
      });

      it("should handle empty items", async () => {
        const pagination = { page: 1, limit: 10, total: 0, hasNextPage: false };

        const response = paginatedResponse([], pagination);
        const json = await response.json();

        expect(json.data).toEqual([]);
        expect(json.count).toBe(0);
        expect(json.pagination.total).toBe(0);
      });

      it("should include cursor when provided", async () => {
        const pagination = {
          page: 1,
          limit: 10,
          total: 100,
          hasNextPage: true,
          nextCursor: "cursor-123",
        };

        const response = paginatedResponse([{ id: "1" }], pagination);
        const json = await response.json();

        expect(json.pagination.nextCursor).toBe("cursor-123");
      });
    });
  });

  describe("createHandler", () => {
    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      role: "user",
    };

    beforeEach(() => {
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
    });

    it("should create handler without authentication", async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(successResponse({ message: "Hello" }));

      const handler = createHandler(mockHandler);
      const request = new NextRequest("http://localhost/api/test");

      await handler(request);

      expect(mockHandler).toHaveBeenCalled();
      expect(getUserFromRequest).toHaveBeenCalledWith(request);
    });

    it("should require authentication when auth=true", async () => {
      (requireAuth as jest.Mock).mockResolvedValue({
        user: mockUser,
        error: null,
      });

      const mockHandler = jest
        .fn()
        .mockResolvedValue(successResponse({ message: "Authenticated" }));

      const handler = createHandler(mockHandler, { auth: true });
      const request = new NextRequest("http://localhost/api/test");

      await handler(request);

      expect(requireAuth).toHaveBeenCalledWith(request);
      expect(mockHandler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ user: mockUser })
      );
    });

    it("should return error when auth fails", async () => {
      const errorResponse = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      (requireAuth as jest.Mock).mockResolvedValue({
        user: null,
        error: errorResponse,
      });

      const mockHandler = jest.fn();
      const handler = createHandler(mockHandler, { auth: true });
      const request = new NextRequest("http://localhost/api/test");

      const response = await handler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response).toBe(errorResponse);
    });

    it("should check roles when specified", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        user: { ...mockUser, role: "admin" },
        error: null,
      });

      const mockHandler = jest.fn().mockResolvedValue(successResponse({}));
      const handler = createHandler(mockHandler, { roles: ["admin"] });
      const request = new NextRequest("http://localhost/api/test");

      await handler(request);

      expect(requireRole).toHaveBeenCalledWith(request, ["admin"]);
    });

    it("should parse JSON body when parseBody=true", async () => {
      const body = { name: "Test", value: 123 };
      const mockHandler = jest.fn().mockResolvedValue(successResponse({}));

      const handler = createHandler(mockHandler, { parseBody: true });

      // Mock request with json() method
      const request = {
        method: "POST",
        url: "http://localhost/api/test",
        headers: new Headers({ "Content-Type": "application/json" }),
        nextUrl: { searchParams: new URLSearchParams() },
        json: jest.fn().mockResolvedValue(body),
      } as any as NextRequest;

      await handler(request);

      expect(request.json).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ body })
      );
    });

    it("should throw BadRequestError for invalid JSON", async () => {
      const mockHandler = jest.fn();
      const handler = createHandler(mockHandler, { parseBody: true });
      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        body: "invalid json{",
      });

      const response = await handler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid JSON");
    });

    it("should not parse body for GET requests", async () => {
      const mockHandler = jest.fn().mockResolvedValue(successResponse({}));
      const handler = createHandler(mockHandler, { parseBody: true });
      const request = new NextRequest("http://localhost/api/test", {
        method: "GET",
      });

      await handler(request);

      const context = mockHandler.mock.calls[0][1];
      expect(context.body).toBeUndefined();
    });

    it("should resolve params from context", async () => {
      const mockHandler = jest.fn().mockResolvedValue(successResponse({}));
      const handler = createHandler(mockHandler);
      const request = new NextRequest("http://localhost/api/test");
      const params = { id: "123" };

      await handler(request, { params: Promise.resolve(params) });

      expect(mockHandler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ params })
      );
    });

    it("should include searchParams in context", async () => {
      const mockHandler = jest.fn().mockResolvedValue(successResponse({}));
      const handler = createHandler(mockHandler);
      const request = new NextRequest(
        "http://localhost/api/test?page=1&limit=10"
      );

      await handler(request);

      const context = mockHandler.mock.calls[0][1];
      expect(context.searchParams.get("page")).toBe("1");
      expect(context.searchParams.get("limit")).toBe("10");
    });

    it("should log request when logging=true", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const mockHandler = jest.fn().mockResolvedValue(successResponse({}));

      const handler = createHandler(mockHandler, { logging: true });
      const request = new NextRequest("http://localhost/api/test");

      await handler(request);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[API]"));

      consoleSpy.mockRestore();
    });
  });

  describe("createCrudHandlers", () => {
    let mockCollection: any;
    let mockDocRef: any;

    beforeEach(() => {
      mockDocRef = {
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };

      mockCollection = {
        doc: jest.fn().mockReturnValue(mockDocRef),
        add: jest.fn(),
      };

      (requireAuth as jest.Mock).mockResolvedValue({
        user: { uid: "user123", role: "admin" },
        error: null,
      });
    });

    describe("GET handler", () => {
      it("should get single resource by ID", async () => {
        const mockData = { name: "Test Product", price: 100 };
        mockDocRef.get.mockResolvedValue({
          exists: true,
          id: "prod123",
          data: () => mockData,
        });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
        });

        const request = new NextRequest(
          "http://localhost/api/products/prod123"
        );
        const response = await handlers.GET(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.data.id).toBe("prod123");
        expect(data.data.name).toBe("Test Product");
      });

      it("should return 404 when resource not found", async () => {
        mockDocRef.get.mockResolvedValue({ exists: false });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
        });

        const request = new NextRequest(
          "http://localhost/api/products/invalid"
        );
        const response = await handlers.GET(request, {
          params: Promise.resolve({ id: "invalid" }),
        });

        expect(response.status).toBe(404);
      });

      it("should apply custom transform", async () => {
        mockDocRef.get.mockResolvedValue({
          exists: true,
          id: "prod123",
          data: () => ({ name: "Test", price: 100 }),
        });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          transform: (id, data) => ({ productId: id, productName: data.name }),
        });

        const request = new NextRequest(
          "http://localhost/api/products/prod123"
        );
        const response = await handlers.GET(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        const data = await response.json();
        expect(data.data.productId).toBe("prod123");
        expect(data.data.productName).toBe("Test");
      });

      it("should check canAccess permission", async () => {
        mockDocRef.get.mockResolvedValue({
          exists: true,
          id: "prod123",
          data: () => ({ owner_id: "other" }),
        });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          canAccess: (user, data) => user?.uid === data.owner_id,
        });

        (requireAuth as jest.Mock).mockResolvedValue({
          user: { uid: "user123" },
          error: null,
        });

        const request = new NextRequest(
          "http://localhost/api/products/prod123"
        );
        const response = await handlers.GET(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        expect(response.status).toBe(404); // Returns 404 instead of 403
      });
    });

    describe("POST handler", () => {
      it("should create new resource", async () => {
        mockCollection.add.mockResolvedValue({ id: "new123" });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          requiredFields: ["name", "price"],
        });

        const body = { name: "New Product", price: 50 };
        const request = {
          method: "POST",
          url: "http://localhost/api/products",
          headers: new Headers({ "Content-Type": "application/json" }),
          nextUrl: { searchParams: new URLSearchParams() },
          json: jest.fn().mockResolvedValue(body),
        } as any as NextRequest;

        const response = await handlers.POST(request, {
          params: Promise.resolve({}),
        });

        expect(response.status).toBe(201);
        expect(mockCollection.add).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "New Product",
            price: 50,
            created_at: expect.any(String),
            updated_at: expect.any(String),
            created_by: "user123",
          })
        );
      });

      it("should validate required fields", async () => {
        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          requiredFields: ["name", "price"],
        });

        const body = { name: "Test" }; // Missing price
        const request = {
          method: "POST",
          url: "http://localhost/api/products",
          headers: new Headers({ "Content-Type": "application/json" }),
          nextUrl: { searchParams: new URLSearchParams() },
          json: jest.fn().mockResolvedValue(body),
        } as any as NextRequest;

        const response = await handlers.POST(request, {
          params: Promise.resolve({}),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toContain("price");
      });

      it("should apply custom validation", async () => {
        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          validate: (data) => {
            if (data.price < 0) return ["Price must be positive"];
            return undefined;
          },
        });

        const body = { name: "Test", price: -10 };
        const request = {
          method: "POST",
          url: "http://localhost/api/products",
          headers: new Headers({ "Content-Type": "application/json" }),
          nextUrl: { searchParams: new URLSearchParams() },
          json: jest.fn().mockResolvedValue(body),
        } as any as NextRequest;

        const response = await handlers.POST(request, {
          params: Promise.resolve({}),
        });

        expect(response.status).toBe(400);
      });
    });

    describe("PATCH handler", () => {
      it("should update existing resource", async () => {
        mockDocRef.get
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({ name: "Old", price: 100 }),
          })
          .mockResolvedValueOnce({
            exists: true,
            id: "prod123",
            data: () => ({ name: "Updated", price: 150 }),
          });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          canModify: () => true,
        });

        const body = { name: "Updated", price: 150 };
        const request = new NextRequest(
          new Request("http://localhost/api/products/prod123", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          })
        );

        const response = await handlers.PATCH(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        expect(response.status).toBe(200);
        expect(mockDocRef.update).toHaveBeenCalled();
      });

      it("should check canModify permission", async () => {
        mockDocRef.get.mockResolvedValue({
          exists: true,
          data: () => ({ owner_id: "other" }),
        });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          canModify: (user, data) => user.uid === data.owner_id,
        });

        const request = new NextRequest(
          new Request("http://localhost/api/products/prod123", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Hacked" }),
          })
        );

        const response = await handlers.PATCH(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        expect(response.status).toBe(403);
      });

      it("should filter by allowedUpdateFields", async () => {
        mockDocRef.get
          .mockResolvedValueOnce({
            exists: true,
            data: () => ({ name: "Old", price: 100, status: "active" }),
          })
          .mockResolvedValueOnce({
            exists: true,
            id: "prod123",
            data: () => ({ name: "New", price: 100, status: "active" }),
          });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          allowedUpdateFields: ["name"],
          canModify: () => true,
        });

        const body = {
          name: "New",
          price: 999,
          status: "deleted",
        };
        const request = {
          method: "PATCH",
          url: "http://localhost/api/products/prod123",
          headers: new Headers({ "Content-Type": "application/json" }),
          nextUrl: { searchParams: new URLSearchParams() },
          json: jest.fn().mockResolvedValue(body),
        } as any as NextRequest;

        await handlers.PATCH(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        const updateCall = mockDocRef.update.mock.calls[0][0];
        expect(updateCall.name).toBe("New");
        expect(updateCall.price).toBeUndefined();
        expect(updateCall.status).toBeUndefined();
      });
    });

    describe("DELETE handler", () => {
      it("should delete resource", async () => {
        mockDocRef.get.mockResolvedValue({
          exists: true,
          data: () => ({ name: "To Delete" }),
        });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          canModify: () => true,
        });

        const request = new NextRequest(
          "http://localhost/api/products/prod123",
          {
            method: "DELETE",
          }
        );

        const response = await handlers.DELETE(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        expect(response.status).toBe(200);
        expect(mockDocRef.delete).toHaveBeenCalled();
      });

      it("should check canModify before delete", async () => {
        mockDocRef.get.mockResolvedValue({
          exists: true,
          data: () => ({ owner_id: "other" }),
        });

        const handlers = createCrudHandlers({
          collection: () => mockCollection,
          resourceName: "Product",
          canModify: (user, data) => user.uid === data.owner_id,
        });

        const request = new NextRequest(
          "http://localhost/api/products/prod123",
          {
            method: "DELETE",
          }
        );

        const response = await handlers.DELETE(request, {
          params: Promise.resolve({ id: "prod123" }),
        });

        expect(response.status).toBe(403);
        expect(mockDocRef.delete).not.toHaveBeenCalled();
      });
    });
  });

  describe("Utility Functions", () => {
    describe("getPaginationParams", () => {
      it("should extract pagination parameters", () => {
        const searchParams = new URLSearchParams({
          limit: "50",
          page: "2",
          sortBy: "name",
          sortOrder: "asc",
        });

        const result = getPaginationParams(searchParams);

        expect(result).toEqual({
          limit: 50,
          page: 2,
          sortBy: "name",
          sortOrder: "asc",
          startAfter: null,
        });
      });

      it("should use default values", () => {
        const searchParams = new URLSearchParams();

        const result = getPaginationParams(searchParams);

        expect(result).toEqual({
          limit: 20,
          page: 1,
          sortBy: "created_at",
          sortOrder: "desc",
          startAfter: null,
        });
      });

      it("should limit maximum to 100", () => {
        const searchParams = new URLSearchParams({ limit: "500" });

        const result = getPaginationParams(searchParams);

        expect(result.limit).toBe(100);
      });

      it("should accept startAfter cursor", () => {
        const searchParams = new URLSearchParams({ startAfter: "cursor123" });

        const result = getPaginationParams(searchParams);

        expect(result.startAfter).toBe("cursor123");
      });

      it("should accept cursor alias for startAfter", () => {
        const searchParams = new URLSearchParams({ cursor: "cursor456" });

        const result = getPaginationParams(searchParams);

        expect(result.startAfter).toBe("cursor456");
      });
    });

    describe("getFilterParams", () => {
      it("should extract allowed filter parameters", () => {
        const searchParams = new URLSearchParams({
          status: "active",
          category: "electronics",
          limit: "20",
          page: "1",
        });

        const result = getFilterParams(searchParams, ["status", "category"]);

        expect(result).toEqual({
          status: "active",
          category: "electronics",
        });
      });

      it("should exclude pagination parameters", () => {
        const searchParams = new URLSearchParams({
          status: "active",
          limit: "50",
          page: "2",
          sortBy: "name",
          sortOrder: "asc",
          startAfter: "cursor",
          cursor: "cursor2",
        });

        const result = getFilterParams(searchParams, ["status"]);

        expect(result).toEqual({ status: "active" });
        expect(result).not.toHaveProperty("limit");
        expect(result).not.toHaveProperty("page");
      });

      it("should only include allowed filters", () => {
        const searchParams = new URLSearchParams({
          status: "active",
          category: "electronics",
          unauthorized: "hack",
        });

        const result = getFilterParams(searchParams, ["status"]);

        expect(result).toEqual({ status: "active" });
        expect(result).not.toHaveProperty("category");
        expect(result).not.toHaveProperty("unauthorized");
      });

      it("should handle empty search params", () => {
        const searchParams = new URLSearchParams();

        const result = getFilterParams(searchParams, ["status", "category"]);

        expect(result).toEqual({});
      });

      it("should handle empty allowed filters", () => {
        const searchParams = new URLSearchParams({
          status: "active",
          category: "electronics",
        });

        const result = getFilterParams(searchParams, []);

        expect(result).toEqual({});
      });

      it("should skip empty values", () => {
        const searchParams = new URLSearchParams({
          status: "active",
          category: "",
        });

        const result = getFilterParams(searchParams, ["status", "category"]);

        expect(result).toEqual({ status: "active" });
        expect(result).not.toHaveProperty("category");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing ID in CRUD operations", async () => {
      const handlers = createCrudHandlers({
        collection: () => ({}),
        resourceName: "Product",
      });

      const request = new NextRequest("http://localhost/api/products");
      const response = await handlers.GET(request, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(400);
    });

    it("should handle very large request bodies", async () => {
      const largeBody = { data: "x".repeat(100000) };
      const mockHandler = jest.fn().mockResolvedValue(successResponse({}));

      const handler = createHandler(mockHandler, { parseBody: true });
      const request = {
        method: "POST",
        url: "http://localhost/api/test",
        headers: new Headers({ "Content-Type": "application/json" }),
        nextUrl: { searchParams: new URLSearchParams() },
        json: jest.fn().mockResolvedValue(largeBody),
      } as any as NextRequest;

      const response = await handler(request);

      // Verify handler was called and request was processed
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();

      // Handler should have been called with parsed body
      const callArgs = mockHandler.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs[1]).toBeDefined();
      expect(callArgs[1].body).toBeDefined();
      expect(callArgs[1].body.data).toBe(largeBody.data);
    });

    it("should handle handler returning non-NextResponse", async () => {
      const mockHandler = jest.fn().mockResolvedValue({ custom: "response" });

      const handler = createHandler(mockHandler);
      const request = new NextRequest("http://localhost/api/test");

      const response = await handler(request);
      // Handler returns whatever the inner handler returns
      expect(response).toEqual({ custom: "response" });
    });
  });
});
