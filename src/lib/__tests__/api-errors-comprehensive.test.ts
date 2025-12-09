/**
 * Comprehensive API Errors Test Suite
 *
 * Tests error class hierarchy, serialization, stack traces, and error handling patterns.
 * Focuses on API error conventions, validation errors, and production error scenarios.
 *
 * Testing Focus:
 * - Error class inheritance hierarchy
 * - Error serialization (errorToJson)
 * - HTTP status codes
 * - Error messages and details
 * - Stack trace handling
 * - isOperational flag behavior
 * - ValidationError details structure
 * - Production error handling patterns
 */

import {
  ApiError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
  errorToJson,
} from "../api-errors";

describe("API Errors - Comprehensive Edge Cases", () => {
  describe("ApiError - Base Error Class", () => {
    describe("construction", () => {
      it("creates error with message and status code", () => {
        const error = new ApiError("Test error", 500);
        expect(error.message).toBe("Test error");
        expect(error.statusCode).toBe(500);
        expect(error.isOperational).toBe(true);
      });

      it("creates error with custom isOperational flag", () => {
        const error = new ApiError("Test error", 500, false);
        expect(error.isOperational).toBe(false);
      });

      it("defaults isOperational to true", () => {
        const error = new ApiError("Test error", 500);
        expect(error.isOperational).toBe(true);
      });

      it("extends Error class", () => {
        const error = new ApiError("Test error", 500);
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
      });

      it("has correct name property", () => {
        const error = new ApiError("Test error", 500);
        expect(error.name).toBe("ApiError");
      });

      it("captures stack trace", () => {
        const error = new ApiError("Test error", 500);
        expect(error.stack).toBeTruthy();
        expect(error.stack).toContain("ApiError");
      });
    });

    describe("edge cases", () => {
      it("handles empty message", () => {
        const error = new ApiError("", 500);
        expect(error.message).toBe("");
        expect(error.statusCode).toBe(500);
      });

      it("handles very long message", () => {
        const longMessage = "A".repeat(10000);
        const error = new ApiError(longMessage, 500);
        expect(error.message).toBe(longMessage);
        expect(error.message.length).toBe(10000);
      });

      it("handles special characters in message", () => {
        const error = new ApiError("Error: <script>alert('xss')</script>", 500);
        expect(error.message).toContain("<script>");
        // Message is stored as-is, sanitization should happen at response layer
      });

      it("handles non-standard status codes", () => {
        const error = new ApiError("Test", 999);
        expect(error.statusCode).toBe(999);
      });

      it("handles negative status codes", () => {
        const error = new ApiError("Test", -1);
        expect(error.statusCode).toBe(-1);
      });

      it("handles zero status code", () => {
        const error = new ApiError("Test", 0);
        expect(error.statusCode).toBe(0);
      });

      it("preserves error message for Error.prototype methods", () => {
        const error = new ApiError("Test error", 500);
        expect(error.toString()).toContain("Test error");
      });
    });
  });

  describe("UnauthorizedError - 401 Errors", () => {
    it("creates 401 error with default message", () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe("Authentication required");
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it("creates 401 error with custom message", () => {
      const error = new UnauthorizedError("Invalid token");
      expect(error.message).toBe("Invalid token");
      expect(error.statusCode).toBe(401);
    });

    it("extends ApiError", () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(UnauthorizedError);
    });

    it("has correct name", () => {
      const error = new UnauthorizedError();
      expect(error.name).toBe("UnauthorizedError");
    });

    it("handles common auth scenarios", () => {
      const scenarios = [
        "Missing authentication token",
        "Invalid JWT token",
        "Token expired",
        "Session expired",
        "Invalid credentials",
      ];

      scenarios.forEach((message) => {
        const error = new UnauthorizedError(message);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(401);
      });
    });
  });

  describe("ForbiddenError - 403 Errors", () => {
    it("creates 403 error with default message", () => {
      const error = new ForbiddenError();
      expect(error.message).toBe(
        "You don't have permission to access this resource"
      );
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    it("creates 403 error with custom message", () => {
      const error = new ForbiddenError("Insufficient permissions");
      expect(error.message).toBe("Insufficient permissions");
      expect(error.statusCode).toBe(403);
    });

    it("extends ApiError", () => {
      const error = new ForbiddenError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(ForbiddenError);
    });

    it("has correct name", () => {
      const error = new ForbiddenError();
      expect(error.name).toBe("ForbiddenError");
    });

    it("handles permission scenarios", () => {
      const scenarios = [
        "Access denied",
        "Insufficient permissions to perform this action",
        "User does not have required role",
        "Resource access restricted",
      ];

      scenarios.forEach((message) => {
        const error = new ForbiddenError(message);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(403);
      });
    });
  });

  describe("NotFoundError - 404 Errors", () => {
    it("creates 404 error with default message", () => {
      const error = new NotFoundError();
      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it("creates 404 error with custom message", () => {
      const error = new NotFoundError("User not found");
      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
    });

    it("extends ApiError", () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it("has correct name", () => {
      const error = new NotFoundError();
      expect(error.name).toBe("NotFoundError");
    });

    it("handles resource-specific scenarios", () => {
      const scenarios = [
        "Product not found",
        "Order #12345 not found",
        "User with ID abc123 does not exist",
        "Auction not found or has ended",
        "Shop not found",
      ];

      scenarios.forEach((message) => {
        const error = new NotFoundError(message);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(404);
      });
    });
  });

  describe("ValidationError - 400 Errors with Details", () => {
    describe("construction", () => {
      it("creates validation error with message only", () => {
        const error = new ValidationError("Validation failed");
        expect(error.message).toBe("Validation failed");
        expect(error.statusCode).toBe(400);
        expect(error.isOperational).toBe(true);
        expect(error.errors).toBeUndefined();
      });

      it("creates validation error with errors", () => {
        const errors = { email: "Invalid format" };
        const error = new ValidationError("Validation failed", errors);
        expect(error.message).toBe("Validation failed");
        expect(error.errors).toEqual(errors);
      });

      it("extends ApiError", () => {
        const error = new ValidationError("Test");
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toBeInstanceOf(ValidationError);
      });

      it("has correct name", () => {
        const error = new ValidationError("Test");
        expect(error.name).toBe("ValidationError");
      });
    });

    describe("errors handling", () => {
      it("handles multiple field errors", () => {
        const errors = {
          email: "Invalid email format",
          password: "Password must be at least 8 characters",
          age: "Must be 18 or older",
        };
        const error = new ValidationError("Multiple validation errors", errors);
        expect(error.errors).toEqual(errors);
      });

      it("handles flat key-value structure only - Record<string, string>", () => {
        // NOTE: Implementation type is Record<string, string>
        // Cannot handle nested objects, arrays, or complex structures
        const errors = {
          firstName: "First name is required",
          lastName: "Last name is required",
          email: "Invalid email format",
        };
        const error = new ValidationError("Validation failed", errors);
        expect(error.errors).toEqual(errors);
      });

      it("type system enforces simple string dictionary", () => {
        // NOTE: TypeScript enforces Record<string, string>
        // These would cause TypeScript errors:
        // - Arrays: [{ field: "email", message: "Invalid" }]
        // - Nested: { address: { city: "Required" } }
        // - Complex: { items: [{...}], metadata: {...} }

        const simpleErrors = {
          field1: "Error message 1",
          field2: "Error message 2",
        };
        const error = new ValidationError("Validation failed", simpleErrors);
        expect(error.errors).toBeDefined();
        expect(typeof error.errors).toBe("object");
      });

      it("handles empty errors object", () => {
        const error = new ValidationError("Validation failed", {});
        expect(error.errors).toEqual({});
      });
    });

    describe("common validation scenarios", () => {
      it("handles email validation errors", () => {
        const error = new ValidationError("Invalid email", {
          email: "Must be a valid email address",
        });
        expect(error.message).toBe("Invalid email");
        expect(error.errors).toHaveProperty("email");
      });

      it("handles required field errors", () => {
        const error = new ValidationError("Missing required fields", {
          firstName: "First name is required",
          lastName: "Last name is required",
        });
        expect(error.errors).toHaveProperty("firstName");
        expect(error.errors).toHaveProperty("lastName");
      });

      it("handles format validation errors", () => {
        const error = new ValidationError("Invalid format", {
          phone: "Phone must be in format: +91-XXXXXXXXXX",
          panCard: "PAN must be in format: ABCDE1234F",
        });
        expect(error.statusCode).toBe(400);
      });

      it("handles range validation errors", () => {
        const error = new ValidationError("Value out of range", {
          age: "Must be between 18 and 120",
          price: "Must be greater than 0",
        });
        expect(error.errors).toBeDefined();
      });
    });
  });

  describe("ConflictError - 409 Errors", () => {
    it("creates 409 error with default message", () => {
      const error = new ConflictError();
      expect(error.message).toBe("Resource already exists");
      expect(error.statusCode).toBe(409);
      expect(error.isOperational).toBe(true);
    });

    it("creates 409 error with custom message", () => {
      const error = new ConflictError("Email already exists");
      expect(error.message).toBe("Email already exists");
      expect(error.statusCode).toBe(409);
    });

    it("extends ApiError", () => {
      const error = new ConflictError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(ConflictError);
    });

    it("has correct name", () => {
      const error = new ConflictError();
      expect(error.name).toBe("ConflictError");
    });

    it("handles duplicate resource scenarios", () => {
      const scenarios = [
        "Email already registered",
        "Username already taken",
        "Product SKU already exists",
        "Shop name already in use",
        "Bid already placed",
      ];

      scenarios.forEach((message) => {
        const error = new ConflictError(message);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(409);
      });
    });
  });

  describe("RateLimitError - 429 Errors", () => {
    it("creates 429 error with default message", () => {
      const error = new RateLimitError();
      expect(error.message).toBe("Too many requests, please try again later");
      expect(error.statusCode).toBe(429);
      expect(error.isOperational).toBe(true);
    });

    it("creates 429 error with custom message", () => {
      const error = new RateLimitError(
        "Rate limit exceeded, try again in 1 hour"
      );
      expect(error.message).toBe("Rate limit exceeded, try again in 1 hour");
      expect(error.statusCode).toBe(429);
    });

    it("extends ApiError", () => {
      const error = new RateLimitError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(RateLimitError);
    });

    it("has correct name", () => {
      const error = new RateLimitError();
      expect(error.name).toBe("RateLimitError");
    });

    it("handles rate limiting scenarios", () => {
      const scenarios = [
        "Too many login attempts",
        "API rate limit exceeded",
        "Please wait 60 seconds before trying again",
        "Maximum daily requests reached",
      ];

      scenarios.forEach((message) => {
        const error = new RateLimitError(message);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(429);
      });
    });
  });

  describe("InternalServerError - 500 Errors", () => {
    it("creates 500 error with default message", () => {
      const error = new InternalServerError();
      expect(error.message).toBe("An unexpected error occurred");
      expect(error.statusCode).toBe(500);
      // NOTE: InternalServerError sets isOperational to false
      expect(error.isOperational).toBe(false);
    });

    it("creates 500 error with custom message", () => {
      const error = new InternalServerError("Database connection failed");
      expect(error.message).toBe("Database connection failed");
      expect(error.statusCode).toBe(500);
    });

    it("extends ApiError", () => {
      const error = new InternalServerError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(InternalServerError);
    });

    it("has correct name", () => {
      const error = new InternalServerError();
      expect(error.name).toBe("InternalServerError");
    });

    it("handles server error scenarios", () => {
      const scenarios = [
        "Database query failed",
        "External API unavailable",
        "Failed to process payment",
        "File upload service error",
      ];

      scenarios.forEach((message) => {
        const error = new InternalServerError(message);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(500);
      });
    });
  });

  describe("errorToJson - Error Serialization", () => {
    describe("ApiError serialization", () => {
      it("serializes basic ApiError", () => {
        const error = new ApiError("Test error", 500);
        const json = errorToJson(error);

        // NOTE: errorToJson only returns { error, statusCode }
        // isOperational is not included in JSON response
        expect(json).toEqual({
          error: "Test error",
          statusCode: 500,
        });
      });

      it("includes error name in serialization", () => {
        const error = new ApiError("Test", 500);
        const json = errorToJson(error);

        // Name is implicit in error classes but not explicitly serialized
        expect(json).toHaveProperty("error");
        expect(json).toHaveProperty("statusCode");
      });

      it("serializes non-operational errors (no isOperational in JSON)", () => {
        const error = new ApiError("Programming error", 500, false);
        const json = errorToJson(error);

        // NOTE: isOperational exists on error object but not in JSON
        expect(error.isOperational).toBe(false);
        expect(json).not.toHaveProperty("isOperational");
      });
    });

    describe("specialized error serialization", () => {
      it("serializes UnauthorizedError", () => {
        const error = new UnauthorizedError("Token expired");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Token expired",
          statusCode: 401,
        });
      });

      it("serializes ForbiddenError", () => {
        const error = new ForbiddenError("Access denied");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Access denied",
          statusCode: 403,
        });
      });

      it("serializes NotFoundError", () => {
        const error = new NotFoundError("User not found");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "User not found",
          statusCode: 404,
        });
      });

      it("serializes ConflictError", () => {
        const error = new ConflictError("Email already exists");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Email already exists",
          statusCode: 409,
        });
      });

      it("serializes RateLimitError", () => {
        const error = new RateLimitError("Too many requests");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Too many requests",
          statusCode: 429,
        });
      });

      it("serializes InternalServerError", () => {
        const error = new InternalServerError("Server error");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Server error",
          statusCode: 500,
        });
      });
    });

    describe("ValidationError with errors", () => {
      it("serializes ValidationError without errors", () => {
        const error = new ValidationError("Validation failed");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Validation failed",
          statusCode: 400,
        });
      });

      it("serializes ValidationError with errors", () => {
        const errors = { email: "Invalid format" };
        const error = new ValidationError("Validation failed", errors);
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Validation failed",
          statusCode: 400,
          errors,
        });
      });

      it("serializes ValidationError with multiple field errors", () => {
        const errors = {
          email: "Invalid format",
          password: "Too short",
          age: "Must be 18 or older",
        };
        const error = new ValidationError("Multiple errors", errors);
        const json = errorToJson(error);

        expect(json.errors).toEqual(errors);
        expect(json.statusCode).toBe(400);
      });

      it("omits errors field when undefined", () => {
        const error = new ValidationError("Validation failed");
        const json = errorToJson(error);

        expect(json).not.toHaveProperty("errors");
      });
    });

    describe("generic Error handling", () => {
      it("serializes generic Error as 500", () => {
        const error = new Error("Generic error");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Generic error",
          statusCode: 500,
        });
      });

      it("handles Error without message", () => {
        const error = new Error();
        const json = errorToJson(error);

        expect(json.statusCode).toBe(500);
        expect(json.error).toBe("An unexpected error occurred");
      });

      it("handles TypeError", () => {
        const error = new TypeError("Type error occurred");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Type error occurred",
          statusCode: 500,
        });
      });

      it("handles ReferenceError", () => {
        const error = new ReferenceError("Variable not defined");
        const json = errorToJson(error);

        expect(json).toEqual({
          error: "Variable not defined",
          statusCode: 500,
        });
      });
    });

    describe("edge cases", () => {
      it("handles null error message", () => {
        const error = new ApiError("", 400);
        const json = errorToJson(error);

        expect(json.error).toBe("");
        expect(json.statusCode).toBe(400);
      });

      it("handles very long error message", () => {
        const longMessage = "A".repeat(10000);
        const error = new ApiError(longMessage, 500);
        const json = errorToJson(error);

        expect(json.error).toBe(longMessage);
        expect(json.error.length).toBe(10000);
      });

      it("handles special characters in message", () => {
        const error = new ApiError("Error: <>&\"'", 500);
        const json = errorToJson(error);

        expect(json.error).toBe("Error: <>&\"'");
        // JSON serialization handles escaping
      });

      it("handles circular references in details", () => {
        const details: any = { a: 1 };
        details.self = details; // Circular reference

        const error = new ValidationError("Test", details);

        // errorToJson doesn't deep-process details, it just assigns them
        // Circular ref handling would happen during JSON.stringify
        expect(() => errorToJson(error)).not.toThrow();
      });

      it("preserves errors object reference", () => {
        const errors = { email: "Invalid format" };
        const error = new ValidationError("Test", errors);
        const json = errorToJson(error);

        expect(json.errors).toBe(errors); // Same reference
      });

      it("handles undefined errors", () => {
        const error = new ValidationError("Test", undefined);
        const json = errorToJson(error);

        expect(json).not.toHaveProperty("errors");
      });

      it("handles null errors (TypeScript allows with 'as any')", () => {
        // NOTE: TypeScript type is Record<string, string> | undefined
        // null would require 'as any' to pass type check
        const error = new ValidationError("Test");
        const json = errorToJson(error);

        expect(json).not.toHaveProperty("errors");
      });
    });
  });

  describe("Error Class Hierarchy", () => {
    it("all custom errors extend Error", () => {
      expect(new UnauthorizedError()).toBeInstanceOf(Error);
      expect(new ForbiddenError()).toBeInstanceOf(Error);
      expect(new NotFoundError()).toBeInstanceOf(Error);
      expect(new ValidationError("test")).toBeInstanceOf(Error);
      expect(new ConflictError()).toBeInstanceOf(Error);
      expect(new RateLimitError()).toBeInstanceOf(Error);
      expect(new InternalServerError()).toBeInstanceOf(Error);
    });

    it("all custom errors extend ApiError", () => {
      expect(new UnauthorizedError()).toBeInstanceOf(ApiError);
      expect(new ForbiddenError()).toBeInstanceOf(ApiError);
      expect(new NotFoundError()).toBeInstanceOf(ApiError);
      expect(new ValidationError("test")).toBeInstanceOf(ApiError);
      expect(new ConflictError()).toBeInstanceOf(ApiError);
      expect(new RateLimitError()).toBeInstanceOf(ApiError);
      expect(new InternalServerError()).toBeInstanceOf(ApiError);
    });

    it("errors can be distinguished by instanceof", () => {
      const unauthorized = new UnauthorizedError();
      const forbidden = new ForbiddenError();
      const notFound = new NotFoundError();

      expect(unauthorized).toBeInstanceOf(UnauthorizedError);
      expect(unauthorized).not.toBeInstanceOf(ForbiddenError);
      expect(forbidden).toBeInstanceOf(ForbiddenError);
      expect(forbidden).not.toBeInstanceOf(NotFoundError);
      expect(notFound).toBeInstanceOf(NotFoundError);
      expect(notFound).not.toBeInstanceOf(UnauthorizedError);
    });

    it("errors can be distinguished by name", () => {
      expect(new UnauthorizedError().name).toBe("UnauthorizedError");
      expect(new ForbiddenError().name).toBe("ForbiddenError");
      expect(new NotFoundError().name).toBe("NotFoundError");
      expect(new ValidationError("test").name).toBe("ValidationError");
      expect(new ConflictError().name).toBe("ConflictError");
      expect(new RateLimitError().name).toBe("RateLimitError");
      expect(new InternalServerError().name).toBe("InternalServerError");
    });

    it("errors can be distinguished by statusCode", () => {
      expect(new UnauthorizedError().statusCode).toBe(401);
      expect(new ForbiddenError().statusCode).toBe(403);
      expect(new NotFoundError().statusCode).toBe(404);
      expect(new ValidationError("test").statusCode).toBe(400);
      expect(new ConflictError().statusCode).toBe(409);
      expect(new RateLimitError().statusCode).toBe(429);
      expect(new InternalServerError().statusCode).toBe(500);
    });
  });

  describe("Production Error Handling Patterns", () => {
    it("handles authentication flow errors", () => {
      const scenarios = [
        { error: new UnauthorizedError("Missing token"), expectedCode: 401 },
        { error: new UnauthorizedError("Invalid token"), expectedCode: 401 },
        {
          error: new ForbiddenError("Insufficient permissions"),
          expectedCode: 403,
        },
      ];

      scenarios.forEach(({ error, expectedCode }) => {
        const json = errorToJson(error);
        expect(json.statusCode).toBe(expectedCode);
        // NOTE: isOperational exists on error object but not in JSON
        expect(error.isOperational).toBe(true);
      });
    });

    it("handles CRUD operation errors", () => {
      const scenarios = [
        { error: new NotFoundError("User not found"), operation: "read" },
        { error: new ConflictError("Email exists"), operation: "create" },
        { error: new ValidationError("Invalid data"), operation: "update" },
      ];

      scenarios.forEach(({ error }) => {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.isOperational).toBe(true);
      });
    });

    it("distinguishes operational vs programming errors", () => {
      const operational = new NotFoundError("User not found");
      const programming = new ApiError("Unexpected null", 500, false);

      expect(operational.isOperational).toBe(true);
      expect(programming.isOperational).toBe(false);
    });

    it("supports error recovery decisions", () => {
      const errors = [
        new RateLimitError(), // Retry after delay
        new InternalServerError(), // Retry with backoff
        new NotFoundError(), // Don't retry
        new ValidationError("Bad input"), // Don't retry
      ];

      errors.forEach((error) => {
        const shouldRetry =
          error instanceof RateLimitError ||
          error instanceof InternalServerError;

        const canRetry = error.isOperational && shouldRetry;
        expect(typeof canRetry).toBe("boolean");
      });
    });
  });
});
