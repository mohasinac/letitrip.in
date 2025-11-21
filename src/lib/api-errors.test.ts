/**
 * Tests for api-errors.ts
 * Testing API error classes and helper functions
 */

import { describe, it, expect } from "@jest/globals";
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  errorToJson,
  isOperationalError,
} from "./api-errors";

describe("ApiError", () => {
  it("should create ApiError with correct properties", () => {
    const error = new ApiError("Test error", 400, true);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe("ApiError");
  });

  it("should capture stack trace", () => {
    const error = new ApiError("Test error", 400);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("ApiError");
  });
});

describe("UnauthorizedError", () => {
  it("should create unauthorized error", () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe("Authentication required");
    expect(error.statusCode).toBe(401);
    expect(error.isOperational).toBe(true);
  });

  it("should accept custom message", () => {
    const error = new UnauthorizedError("Custom auth message");
    expect(error.message).toBe("Custom auth message");
  });
});

describe("ForbiddenError", () => {
  it("should create forbidden error", () => {
    const error = new ForbiddenError();
    expect(error.message).toBe(
      "You don't have permission to access this resource"
    );
    expect(error.statusCode).toBe(403);
    expect(error.isOperational).toBe(true);
  });

  it("should accept custom message", () => {
    const error = new ForbiddenError("Custom forbidden message");
    expect(error.message).toBe("Custom forbidden message");
  });
});

describe("NotFoundError", () => {
  it("should create not found error", () => {
    const error = new NotFoundError();
    expect(error.message).toBe("Resource not found");
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });

  it("should accept custom message", () => {
    const error = new NotFoundError("Custom not found message");
    expect(error.message).toBe("Custom not found message");
  });
});

describe("ValidationError", () => {
  it("should create validation error", () => {
    const error = new ValidationError("Invalid input");
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it("should accept validation details", () => {
    const details = { field: "email", issue: "invalid format" };
    const error = new ValidationError("Validation failed", details);
    expect(error.message).toBe("Validation failed");
    expect(error.errors).toEqual(details);
  });
});

describe("ConflictError", () => {
  it("should create conflict error", () => {
    const error = new ConflictError();
    expect(error.message).toBe("Resource already exists");
    expect(error.statusCode).toBe(409);
    expect(error.isOperational).toBe(true);
  });

  it("should accept custom message", () => {
    const error = new ConflictError("Custom conflict message");
    expect(error.message).toBe("Custom conflict message");
  });
});

describe("RateLimitError", () => {
  it("should create rate limit error", () => {
    const error = new RateLimitError();
    expect(error.message).toBe("Too many requests, please try again later");
    expect(error.statusCode).toBe(429);
    expect(error.isOperational).toBe(true);
  });

  it("should accept custom message", () => {
    const error = new RateLimitError("Custom rate limit message");
    expect(error.message).toBe("Custom rate limit message");
  });
});

describe("InternalServerError", () => {
  it("should create internal server error", () => {
    const error = new InternalServerError();
    expect(error.message).toBe("An unexpected error occurred");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
  });

  it("should accept custom message", () => {
    const error = new InternalServerError("Custom server error");
    expect(error.message).toBe("Custom server error");
  });
});

describe("errorToJson", () => {
  it("should convert ApiError to JSON", () => {
    const error = new ApiError("Test error", 400, true);
    const json = errorToJson(error);
    expect(json).toEqual({
      error: "Test error",
      statusCode: 400,
    });
  });

  it("should convert ValidationError with details to JSON", () => {
    const details = { field: "email" };
    const error = new ValidationError("Invalid", details);
    const json = errorToJson(error);
    expect(json).toEqual({
      error: "Invalid",
      statusCode: 400,
      errors: details,
    });
  });

  it("should handle non-ApiError", () => {
    const error = new Error("Regular error");
    const json = errorToJson(error);
    expect(json).toEqual({
      error: "Regular error",
      statusCode: 500,
    });
  });
});

describe("isOperationalError", () => {
  it("should return true for operational ApiError", () => {
    const error = new ApiError("Test", 400, true);
    expect(isOperationalError(error)).toBe(true);
  });

  it("should return false for non-operational ApiError", () => {
    const error = new ApiError("Test", 500, false);
    expect(isOperationalError(error)).toBe(false);
  });

  it("should return false for non-ApiError", () => {
    const error = new Error("Regular error");
    expect(isOperationalError(error)).toBe(false);
  });
});
