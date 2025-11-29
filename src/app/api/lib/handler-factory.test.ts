/**
 * Tests for API Handler Factory
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import {
  createHandler,
  successResponse,
  errorResponse,
  paginatedResponse,
  getPaginationParams,
  getFilterParams,
  withErrorHandler,
} from "./handler-factory";
import { BadRequestError, NotFoundError } from "./errors";

// Mock the auth middleware
jest.mock("@/app/api/middleware/rbac-auth", () => ({
  getUserFromRequest: jest.fn(),
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}));

import {
  getUserFromRequest,
  requireAuth,
  requireRole,
} from "@/app/api/middleware/rbac-auth";

const mockGetUserFromRequest = getUserFromRequest as jest.Mock;
const mockRequireAuth = requireAuth as jest.Mock;
const mockRequireRole = requireRole as jest.Mock;

describe("Handler Factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserFromRequest.mockResolvedValue(null);
  });

  describe("successResponse", () => {
    it("should create success response with data", async () => {
      const data = { id: "123", name: "Test" };
      const response = successResponse(data);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(response.status).toBe(200);
    });

    it("should include message when provided", async () => {
      const response = successResponse({ id: "1" }, { message: "Created!" });
      const json = await response.json();

      expect(json.message).toBe("Created!");
    });

    it("should use custom status code", async () => {
      const response = successResponse({ id: "1" }, { status: 201 });

      expect(response.status).toBe(201);
    });

    it("should merge meta fields", async () => {
      const response = successResponse(
        { id: "1" },
        { meta: { total: 100, page: 1 } }
      );
      const json = await response.json();

      expect(json.total).toBe(100);
      expect(json.page).toBe(1);
    });
  });

  describe("errorResponse", () => {
    it("should create error response", async () => {
      const response = errorResponse("Something went wrong", 400);
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe("Something went wrong");
      expect(response.status).toBe(400);
    });

    it("should include details when provided", async () => {
      const response = errorResponse("Validation failed", 400, {
        field: "email",
        message: "Invalid format",
      });
      const json = await response.json();

      expect(json.details).toEqual({ field: "email", message: "Invalid format" });
    });
  });

  describe("paginatedResponse", () => {
    it("should create paginated response", async () => {
      const data = [{ id: "1" }, { id: "2" }];
      const response = paginatedResponse(data, {
        limit: 10,
        hasNextPage: true,
        nextCursor: "cursor123",
      });
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.count).toBe(2);
      expect(json.pagination.limit).toBe(10);
      expect(json.pagination.hasNextPage).toBe(true);
      expect(json.pagination.nextCursor).toBe("cursor123");
    });
  });

  describe("withErrorHandler", () => {
    it("should pass through successful responses", async () => {
      const handler = jest.fn().mockResolvedValue(
        successResponse({ id: "1" })
      );
      const wrappedHandler = withErrorHandler(handler);

      const request = new NextRequest("http://localhost/api/test");
      const response = await wrappedHandler(request, { user: null, params: {}, searchParams: new URLSearchParams() });
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.id).toBe("1");
    });

    it("should catch and format ApiError", async () => {
      const handler = jest.fn().mockRejectedValue(
        new BadRequestError("Invalid input")
      );
      const wrappedHandler = withErrorHandler(handler);

      const request = new NextRequest("http://localhost/api/test");
      const response = await wrappedHandler(request, { user: null, params: {}, searchParams: new URLSearchParams() });
      const json = await response.json();

      expect(json.error).toBe("Invalid input");
      expect(response.status).toBe(400);
    });

    it("should catch and format NotFoundError", async () => {
      const handler = jest.fn().mockRejectedValue(
        new NotFoundError("Resource not found")
      );
      const wrappedHandler = withErrorHandler(handler);

      const request = new NextRequest("http://localhost/api/test");
      const response = await wrappedHandler(request, { user: null, params: {}, searchParams: new URLSearchParams() });
      const json = await response.json();

      expect(json.error).toBe("Resource not found");
      expect(response.status).toBe(404);
    });

    it("should handle unknown errors", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("Unknown error"));
      const wrappedHandler = withErrorHandler(handler);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const request = new NextRequest("http://localhost/api/test");
      const response = await wrappedHandler(request, { user: null, params: {}, searchParams: new URLSearchParams() });

      expect(response.status).toBe(500);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("createHandler", () => {
    it("should create a basic handler", async () => {
      const handler = createHandler(async (req, ctx) => {
        return successResponse({ message: "Hello" });
      });

      const request = new NextRequest("http://localhost/api/test");
      const response = await handler(request);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.message).toBe("Hello");
    });

    it("should handle authentication when auth: true", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "user123", email: "test@test.com", role: "user" },
      });

      const handler = createHandler(
        async (req, ctx) => {
          return successResponse({ userId: ctx.user.uid });
        },
        { auth: true }
      );

      const request = new NextRequest("http://localhost/api/test");
      const response = await handler(request);
      const json = await response.json();

      expect(json.data.userId).toBe("user123");
      expect(mockRequireAuth).toHaveBeenCalled();
    });

    it("should return auth error when not authenticated", async () => {
      const authErrorResponse = new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
      mockRequireAuth.mockResolvedValue({ error: authErrorResponse });

      const handler = createHandler(
        async (req, ctx) => {
          return successResponse({ data: "secret" });
        },
        { auth: true }
      );

      const request = new NextRequest("http://localhost/api/test");
      const response = await handler(request);

      expect(response.status).toBe(401);
    });

    it("should handle role requirements", async () => {
      mockRequireRole.mockResolvedValue({
        user: { uid: "admin123", email: "admin@test.com", role: "admin" },
      });

      const handler = createHandler(
        async (req, ctx) => {
          return successResponse({ role: ctx.user!.role });
        },
        { roles: ["admin"] }
      );

      const request = new NextRequest("http://localhost/api/test");
      const response = await handler(request);
      const json = await response.json();

      expect(json.data.role).toBe("admin");
      expect(mockRequireRole).toHaveBeenCalledWith(request, ["admin"]);
    });

    it("should parse JSON body when parseBody: true", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "user123", email: "test@test.com", role: "user" },
      });

      const handler = createHandler(
        async (req, ctx) => {
          return successResponse({ received: ctx.body });
        },
        { auth: true, parseBody: true }
      );

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await handler(request);
      const json = await response.json();

      expect(json.data.received).toEqual({ name: "Test" });
    });

    it("should throw BadRequestError for invalid JSON body", async () => {
      mockRequireAuth.mockResolvedValue({
        user: { uid: "user123", email: "test@test.com", role: "user" },
      });

      const handler = createHandler(
        async (req, ctx) => {
          return successResponse({ received: ctx.body });
        },
        { auth: true, parseBody: true }
      );

      const request = new NextRequest("http://localhost/api/test", {
        method: "POST",
        body: "invalid json",
        headers: { "Content-Type": "application/json" },
      });

      const response = await handler(request);

      expect(response.status).toBe(400);
    });

    it("should resolve params from context", async () => {
      const handler = createHandler(async (req, ctx) => {
        return successResponse({ id: ctx.params.id });
      });

      const request = new NextRequest("http://localhost/api/test/123");
      const response = await handler(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const json = await response.json();

      expect(json.data.id).toBe("123");
    });

    it("should provide searchParams in context", async () => {
      const handler = createHandler(async (req, ctx) => {
        return successResponse({
          filter: ctx.searchParams.get("filter"),
          page: ctx.searchParams.get("page"),
        });
      });

      const request = new NextRequest(
        "http://localhost/api/test?filter=active&page=2"
      );
      const response = await handler(request);
      const json = await response.json();

      expect(json.data.filter).toBe("active");
      expect(json.data.page).toBe("2");
    });
  });

  describe("getPaginationParams", () => {
    it("should extract pagination params with defaults", () => {
      const searchParams = new URLSearchParams();
      const params = getPaginationParams(searchParams);

      expect(params.limit).toBe(20);
      expect(params.startAfter).toBeNull();
      expect(params.page).toBe(1);
      expect(params.sortBy).toBe("created_at");
      expect(params.sortOrder).toBe("desc");
    });

    it("should extract custom pagination params", () => {
      const searchParams = new URLSearchParams({
        limit: "50",
        startAfter: "cursor123",
        page: "3",
        sortBy: "name",
        sortOrder: "asc",
      });
      const params = getPaginationParams(searchParams);

      expect(params.limit).toBe(50);
      expect(params.startAfter).toBe("cursor123");
      expect(params.page).toBe(3);
      expect(params.sortBy).toBe("name");
      expect(params.sortOrder).toBe("asc");
    });

    it("should cap limit at 100", () => {
      const searchParams = new URLSearchParams({ limit: "500" });
      const params = getPaginationParams(searchParams);

      expect(params.limit).toBe(100);
    });

    it("should accept cursor as alias for startAfter", () => {
      const searchParams = new URLSearchParams({ cursor: "abc123" });
      const params = getPaginationParams(searchParams);

      expect(params.startAfter).toBe("abc123");
    });
  });

  describe("getFilterParams", () => {
    it("should extract allowed filter params", () => {
      const searchParams = new URLSearchParams({
        status: "active",
        category: "electronics",
        notAllowed: "value",
        limit: "10",
      });

      const filters = getFilterParams(searchParams, ["status", "category"]);

      expect(filters).toEqual({
        status: "active",
        category: "electronics",
      });
      expect(filters.notAllowed).toBeUndefined();
      expect(filters.limit).toBeUndefined();
    });

    it("should exclude pagination params", () => {
      const searchParams = new URLSearchParams({
        status: "active",
        limit: "10",
        startAfter: "abc",
        cursor: "xyz",
        page: "1",
        sortBy: "name",
        sortOrder: "asc",
      });

      const filters = getFilterParams(searchParams, [
        "status",
        "limit",
        "startAfter",
      ]);

      expect(filters).toEqual({ status: "active" });
    });

    it("should handle empty values", () => {
      const searchParams = new URLSearchParams({
        status: "active",
        category: "",
      });

      const filters = getFilterParams(searchParams, ["status", "category"]);

      expect(filters).toEqual({ status: "active" });
    });
  });
});
