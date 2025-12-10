/**
 * Unit Tests for Error Classes and Handlers
 * Tests custom error classes and error handling utilities
 *
 * TESTS COVER:
 * - All custom error class constructors
 * - Error inheritance and property setting
 * - handleApiError with ApiError instances
 * - handleApiError with unknown errors
 * - Error response formatting
 * - Status code handling
 * - Details/errors field handling
 * - Production vs development error messages
 * - Edge cases
 *
 * CODE ISSUES FOUND:
 * 1. console.error in handleApiError exposes full error objects
 * 2. No error sanitization before logging
 * 3. Development error messages may leak implementation details
 * 4. No error tracking/monitoring integration hooks
 * 5. TooManyRequestsError doesn't set Retry-After header
 */

import {
  ApiError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  handleApiError,
} from "@/app/api/lib/errors";
import { NextResponse } from "next/server";

describe("errors", () => {
  describe("ApiError", () => {
    it("should create ApiError with status code and message", () => {
      const error = new ApiError(418, "I'm a teapot");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(418);
      expect(error.message).toBe("I'm a teapot");
      expect(error.name).toBe("ApiError");
      expect(error.errors).toBeUndefined();
    });

    it("should create ApiError with additional errors", () => {
      const additionalErrors = { field1: "error1", field2: "error2" };
      const error = new ApiError(400, "Validation failed", additionalErrors);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed");
      expect(error.errors).toEqual(additionalErrors);
    });

    it("should have correct prototype chain", () => {
      const error = new ApiError(500, "Test error");

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ApiError).toBe(true);
    });

    it("should preserve stack trace", () => {
      const error = new ApiError(500, "Test error");

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ApiError");
    });
  });

  describe("BadRequestError", () => {
    it("should create BadRequestError with default message", () => {
      const error = new BadRequestError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad Request");
      expect(error.name).toBe("BadRequestError");
    });

    it("should create BadRequestError with custom message", () => {
      const error = new BadRequestError("Invalid input");

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid input");
      expect(error.name).toBe("BadRequestError");
    });

    it("should create BadRequestError with errors", () => {
      const errors = { name: "Required", email: "Invalid format" };
      const error = new BadRequestError("Validation failed", errors);

      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
    });
  });

  describe("UnauthorizedError", () => {
    it("should create UnauthorizedError with default message", () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Unauthorized");
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should create UnauthorizedError with custom message", () => {
      const error = new UnauthorizedError("Please log in");

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Please log in");
    });
  });

  describe("ForbiddenError", () => {
    it("should create ForbiddenError with default message", () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe("Forbidden");
      expect(error.name).toBe("ForbiddenError");
    });

    it("should create ForbiddenError with custom message", () => {
      const error = new ForbiddenError("Admin access required");

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe("Admin access required");
    });
  });

  describe("NotFoundError", () => {
    it("should create NotFoundError with default message", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Not Found");
      expect(error.name).toBe("NotFoundError");
    });

    it("should create NotFoundError with custom message", () => {
      const error = new NotFoundError("Product not found");

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Product not found");
    });
  });

  describe("ConflictError", () => {
    it("should create ConflictError with default message", () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Conflict");
      expect(error.name).toBe("ConflictError");
    });

    it("should create ConflictError with custom message", () => {
      const error = new ConflictError("Email already exists");

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Email already exists");
    });
  });

  describe("TooManyRequestsError", () => {
    it("should create TooManyRequestsError with default message", () => {
      const error = new TooManyRequestsError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe("Too Many Requests");
      expect(error.name).toBe("TooManyRequestsError");
    });

    it("should create TooManyRequestsError with custom message", () => {
      const error = new TooManyRequestsError("Rate limit exceeded");

      expect(error.statusCode).toBe(429);
      expect(error.message).toBe("Rate limit exceeded");
    });

    it("should include retryAfter in errors", () => {
      const error = new TooManyRequestsError("Rate limit exceeded", 60);

      expect(error.errors).toEqual({ retryAfter: 60 });
    });

    it("should handle undefined retryAfter", () => {
      const error = new TooManyRequestsError("Rate limit exceeded");

      expect(error.errors).toEqual({ retryAfter: undefined });
    });
  });

  describe("InternalServerError", () => {
    it("should create InternalServerError with default message", () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Internal Server Error");
      expect(error.name).toBe("InternalServerError");
    });

    it("should create InternalServerError with custom message", () => {
      const error = new InternalServerError("Database connection failed");

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Database connection failed");
    });
  });

  describe("handleApiError", () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
      jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      jest.restoreAllMocks();
    });

    it("should handle ApiError and return JSON response", async () => {
      const error = new BadRequestError("Invalid input");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid input");
      expect(data.details).toBeUndefined();
    });

    it("should include details when ApiError has errors", async () => {
      const errorDetails = { name: "Required", email: "Invalid" };
      const error = new BadRequestError("Validation failed", errorDetails);

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toEqual(errorDetails);
    });

    it("should handle UnauthorizedError correctly", async () => {
      const error = new UnauthorizedError("Please log in");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Please log in");
    });

    it("should handle ForbiddenError correctly", async () => {
      const error = new ForbiddenError("Admin only");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Admin only");
    });

    it("should handle NotFoundError correctly", async () => {
      const error = new NotFoundError("Resource not found");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Resource not found");
    });

    it("should handle ConflictError correctly", async () => {
      const error = new ConflictError("Duplicate entry");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("Duplicate entry");
    });

    it("should handle TooManyRequestsError correctly", async () => {
      const error = new TooManyRequestsError("Rate limit", 120);

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit");
      expect(data.details).toEqual({ retryAfter: 120 });
    });

    it("should handle InternalServerError correctly", async () => {
      const error = new InternalServerError("Database error");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Database error");
    });

    it("should handle unknown errors in production", async () => {
      process.env.NODE_ENV = "production";
      const error = new Error("Sensitive error details");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
      expect(data.message).toBe("An unexpected error occurred");
      expect(data.message).not.toContain("Sensitive");
    });

    it("should handle unknown errors in development", async () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Detailed error message");

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
      expect(data.message).toBe("Detailed error message");
    });

    it("should log unknown errors to console", () => {
      const error = new Error("Test error");

      handleApiError(error);

      expect(console.error).toHaveBeenCalledWith("Unhandled error:", error);
    });

    it("should not log ApiError to console", () => {
      const error = new BadRequestError("Test");

      handleApiError(error);

      expect(console.error).not.toHaveBeenCalled();
    });

    it("should handle errors without message", async () => {
      process.env.NODE_ENV = "development";
      const error = {};

      const response = handleApiError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Unknown error");
    });

    it("should handle null error", async () => {
      process.env.NODE_ENV = "development";

      const response = handleApiError(null);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Unknown error");
    });

    it("should handle string errors", async () => {
      process.env.NODE_ENV = "development";

      const response = handleApiError("String error");
      const data = await response.json();

      expect(response.status).toBe(500);
    });

    it("should handle custom status codes", async () => {
      const error = new ApiError(503, "Service Unavailable");

      const response = handleApiError(error);

      expect(response.status).toBe(503);
    });

    it("should preserve error details structure", async () => {
      const complexDetails = {
        field1: { nested: "error1" },
        field2: ["error2", "error3"],
        field3: 123,
      };
      const error = new BadRequestError("Complex error", complexDetails);

      const response = handleApiError(error);
      const data = await response.json();

      expect(data.details).toEqual(complexDetails);
    });
  });

  describe("Error Inheritance", () => {
    it("all custom errors should extend ApiError", () => {
      expect(new BadRequestError()).toBeInstanceOf(ApiError);
      expect(new UnauthorizedError()).toBeInstanceOf(ApiError);
      expect(new ForbiddenError()).toBeInstanceOf(ApiError);
      expect(new NotFoundError()).toBeInstanceOf(ApiError);
      expect(new ConflictError()).toBeInstanceOf(ApiError);
      expect(new TooManyRequestsError()).toBeInstanceOf(ApiError);
      expect(new InternalServerError()).toBeInstanceOf(ApiError);
    });

    it("all custom errors should extend Error", () => {
      expect(new BadRequestError()).toBeInstanceOf(Error);
      expect(new UnauthorizedError()).toBeInstanceOf(Error);
      expect(new ForbiddenError()).toBeInstanceOf(Error);
      expect(new NotFoundError()).toBeInstanceOf(Error);
      expect(new ConflictError()).toBeInstanceOf(Error);
      expect(new TooManyRequestsError()).toBeInstanceOf(Error);
      expect(new InternalServerError()).toBeInstanceOf(Error);
    });

    it("errors should have correct name property", () => {
      expect(new ApiError(500, "").name).toBe("ApiError");
      expect(new BadRequestError().name).toBe("BadRequestError");
      expect(new UnauthorizedError().name).toBe("UnauthorizedError");
      expect(new ForbiddenError().name).toBe("ForbiddenError");
      expect(new NotFoundError().name).toBe("NotFoundError");
      expect(new ConflictError().name).toBe("ConflictError");
      expect(new TooManyRequestsError().name).toBe("TooManyRequestsError");
      expect(new InternalServerError().name).toBe("InternalServerError");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long error messages", async () => {
      const longMessage = "A".repeat(10000);
      const error = new BadRequestError(longMessage);

      const response = handleApiError(error);
      const data = await response.json();

      expect(data.error).toBe(longMessage);
      expect(data.error.length).toBe(10000);
    });

    it("should handle special characters in messages", async () => {
      const message = "Error: <script>alert('xss')</script>";
      const error = new BadRequestError(message);

      const response = handleApiError(error);
      const data = await response.json();

      expect(data.error).toBe(message);
    });

    it("should handle unicode in messages", async () => {
      const message = "错误 🚨 エラー";
      const error = new BadRequestError(message);

      const response = handleApiError(error);
      const data = await response.json();

      expect(data.error).toBe(message);
    });

    it("should handle empty string messages", async () => {
      const error = new BadRequestError("");

      const response = handleApiError(error);
      const data = await response.json();

      expect(data.error).toBe("");
    });

    it("should handle zero retryAfter", () => {
      const error = new TooManyRequestsError("Rate limit", 0);

      expect(error.errors).toEqual({ retryAfter: 0 });
    });

    it("should handle negative retryAfter", () => {
      const error = new TooManyRequestsError("Rate limit", -5);

      expect(error.errors).toEqual({ retryAfter: -5 });
    });

    it("should handle null in error details", async () => {
      const error = new BadRequestError("Test", { field: null });

      const response = handleApiError(error);
      const data = await response.json();

      expect(data.details.field).toBeNull();
    });

    it("should handle undefined in error details", async () => {
      const error = new BadRequestError("Test", { field: undefined });

      const response = handleApiError(error);
      const data = await response.json();

      expect(data.details.field).toBeUndefined();
    });
  });

  describe("Response Format", () => {
    it("should always include error field in response", async () => {
      const errors = [
        new BadRequestError(),
        new UnauthorizedError(),
        new NotFoundError(),
      ];

      for (const error of errors) {
        const response = handleApiError(error);
        const data = await response.json();
        expect(data).toHaveProperty("error");
      }
    });

    it("should only include details when present", async () => {
      const errorWithDetails = new BadRequestError("Test", { field: "error" });
      const errorWithoutDetails = new BadRequestError("Test");

      const response1 = handleApiError(errorWithDetails);
      const data1 = await response1.json();
      expect(data1).toHaveProperty("details");

      const response2 = handleApiError(errorWithoutDetails);
      const data2 = await response2.json();
      expect(data2).not.toHaveProperty("details");
    });

    it("should return NextResponse instances", () => {
      const error = new BadRequestError();
      const response = handleApiError(error);

      expect(response).toBeInstanceOf(NextResponse);
    });
  });
});
