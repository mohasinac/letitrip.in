/**
 * Unit Tests for API Error Classes
 * Testing custom error types and error handling
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
} from "../errors";

describe("ApiError", () => {
  describe("Constructor and Properties", () => {
    it("should create ApiError with status code and message", () => {
      const error = new ApiError(418, "I'm a teapot");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(418);
      expect(error.message).toBe("I'm a teapot");
      expect(error.name).toBe("ApiError");
    });

    it("should create ApiError with additional error details", () => {
      const details = { field: "email", reason: "invalid format" };
      const error = new ApiError(400, "Validation failed", details);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed");
      expect(error.errors).toEqual(details);
    });

    it("should work without error details", () => {
      const error = new ApiError(500, "Server error");

      expect(error.errors).toBeUndefined();
    });

    it("should be throwable", () => {
      expect(() => {
        throw new ApiError(500, "Test error");
      }).toThrow(ApiError);
    });

    it("should have correct stack trace", () => {
      const error = new ApiError(500, "Test");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });
  });
});

describe("BadRequestError", () => {
  it("should create error with 400 status code", () => {
    const error = new BadRequestError();

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad Request");
    expect(error.name).toBe("BadRequestError");
  });

  it("should accept custom message", () => {
    const error = new BadRequestError("Invalid input");

    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
  });

  it("should accept error details", () => {
    const details = { fields: ["email", "password"] };
    const error = new BadRequestError("Missing required fields", details);

    expect(error.errors).toEqual(details);
  });

  it("should be instanceof ApiError", () => {
    const error = new BadRequestError();

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("UnauthorizedError", () => {
  it("should create error with 401 status code", () => {
    const error = new UnauthorizedError();

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
    expect(error.name).toBe("UnauthorizedError");
  });

  it("should accept custom message", () => {
    const error = new UnauthorizedError("Invalid token");

    expect(error.message).toBe("Invalid token");
    expect(error.statusCode).toBe(401);
  });

  it("should be instanceof ApiError", () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("ForbiddenError", () => {
  it("should create error with 403 status code", () => {
    const error = new ForbiddenError();

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Forbidden");
    expect(error.name).toBe("ForbiddenError");
  });

  it("should accept custom message", () => {
    const error = new ForbiddenError("Insufficient permissions");

    expect(error.message).toBe("Insufficient permissions");
    expect(error.statusCode).toBe(403);
  });

  it("should be instanceof ApiError", () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("NotFoundError", () => {
  it("should create error with 404 status code", () => {
    const error = new NotFoundError();

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not Found");
    expect(error.name).toBe("NotFoundError");
  });

  it("should accept custom message", () => {
    const error = new NotFoundError("User not found");

    expect(error.message).toBe("User not found");
    expect(error.statusCode).toBe(404);
  });

  it("should be instanceof ApiError", () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("ConflictError", () => {
  it("should create error with 409 status code", () => {
    const error = new ConflictError();

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Conflict");
    expect(error.name).toBe("ConflictError");
  });

  it("should accept custom message", () => {
    const error = new ConflictError("Email already exists");

    expect(error.message).toBe("Email already exists");
    expect(error.statusCode).toBe(409);
  });

  it("should be instanceof ApiError", () => {
    const error = new ConflictError();

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("TooManyRequestsError", () => {
  it("should create error with 429 status code", () => {
    const error = new TooManyRequestsError();

    expect(error.statusCode).toBe(429);
    expect(error.message).toBe("Too Many Requests");
    expect(error.name).toBe("TooManyRequestsError");
  });

  it("should accept custom message", () => {
    const error = new TooManyRequestsError("Rate limit exceeded");

    expect(error.message).toBe("Rate limit exceeded");
    expect(error.statusCode).toBe(429);
  });

  it("should store retryAfter in errors", () => {
    const error = new TooManyRequestsError("Rate limit exceeded", 60);

    expect(error.errors).toEqual({ retryAfter: 60 });
  });

  it("should work without retryAfter", () => {
    const error = new TooManyRequestsError();

    expect(error.errors).toEqual({ retryAfter: undefined });
  });

  it("should be instanceof ApiError", () => {
    const error = new TooManyRequestsError();

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("InternalServerError", () => {
  it("should create error with 500 status code", () => {
    const error = new InternalServerError();

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Internal Server Error");
    expect(error.name).toBe("InternalServerError");
  });

  it("should accept custom message", () => {
    const error = new InternalServerError("Database connection failed");

    expect(error.message).toBe("Database connection failed");
    expect(error.statusCode).toBe(500);
  });

  it("should be instanceof ApiError", () => {
    const error = new InternalServerError();

    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("handleApiError", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("ApiError Handling", () => {
    it("should handle BadRequestError", () => {
      const error = new BadRequestError("Invalid input");
      const response = handleApiError(error);

      expect(response.status).toBe(400);
    });

    it("should include error message in response", async () => {
      const error = new UnauthorizedError("Token expired");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.error).toBe("Token expired");
    });

    it("should include error details when present", async () => {
      const details = { field: "email", reason: "invalid" };
      const error = new BadRequestError("Validation failed", details);
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.error).toBe("Validation failed");
      expect(data.details).toEqual(details);
    });

    it("should not include details when not present", async () => {
      const error = new NotFoundError("User not found");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.details).toBeUndefined();
    });

    it("should handle TooManyRequestsError with retryAfter", async () => {
      const error = new TooManyRequestsError("Rate limit", 120);
      const response = handleApiError(error);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.details).toEqual({ retryAfter: 120 });
    });
  });

  describe("All Status Codes", () => {
    it("should handle 400 errors", async () => {
      const error = new BadRequestError();
      const response = handleApiError(error);

      expect(response.status).toBe(400);
    });

    it("should handle 401 errors", async () => {
      const error = new UnauthorizedError();
      const response = handleApiError(error);

      expect(response.status).toBe(401);
    });

    it("should handle 403 errors", async () => {
      const error = new ForbiddenError();
      const response = handleApiError(error);

      expect(response.status).toBe(403);
    });

    it("should handle 404 errors", async () => {
      const error = new NotFoundError();
      const response = handleApiError(error);

      expect(response.status).toBe(404);
    });

    it("should handle 409 errors", async () => {
      const error = new ConflictError();
      const response = handleApiError(error);

      expect(response.status).toBe(409);
    });

    it("should handle 429 errors", async () => {
      const error = new TooManyRequestsError();
      const response = handleApiError(error);

      expect(response.status).toBe(429);
    });

    it("should handle 500 errors", async () => {
      const error = new InternalServerError();
      const response = handleApiError(error);

      expect(response.status).toBe(500);
    });
  });

  describe("Unknown Error Handling", () => {
    it("should handle non-ApiError as 500", async () => {
      const error = new Error("Unknown error");
      const response = handleApiError(error);

      expect(response.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Unhandled error:", error);
    });

    it("should include error message in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error = new Error("Database crashed");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.error).toBe("Internal Server Error");
      expect(data.message).toBe("Database crashed");

      process.env.NODE_ENV = originalEnv;
    });

    it("should hide error details in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error = new Error("Sensitive error details");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.error).toBe("Internal Server Error");
      expect(data.message).toBe("An unexpected error occurred");

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle null error", async () => {
      const response = handleApiError(null);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Internal Server Error");
    });

    it("should handle undefined error", async () => {
      const response = handleApiError(undefined);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Internal Server Error");
    });

    it("should handle string error", async () => {
      const response = handleApiError("Something went wrong");

      expect(response.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Unhandled error:",
        "Something went wrong"
      );
    });

    it("should handle error without message property", async () => {
      const error = { code: "ECONNREFUSED" };
      const response = handleApiError(error);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.message).toBe("Unknown error");
    });
  });

  describe("Error Response Format", () => {
    it("should have consistent response structure for ApiError", async () => {
      const error = new BadRequestError("Test");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });

    it("should have consistent response structure for unknown errors", async () => {
      const error = new Error("Test");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data).toHaveProperty("message");
    });
  });

  describe("Edge Cases", () => {
    it("should handle ApiError with empty message", async () => {
      const error = new ApiError(400, "");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.error).toBe("");
      expect(response.status).toBe(400);
    });

    it("should handle ApiError with very long message", async () => {
      const longMessage = "A".repeat(10000);
      const error = new BadRequestError(longMessage);
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.error).toBe(longMessage);
    });

    it("should handle ApiError with special characters", async () => {
      const error = new BadRequestError("Error: <script>alert('xss')</script>");
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.error).toContain("<script>");
    });

    it("should handle complex error details", async () => {
      const complexDetails = {
        nested: { deeply: { value: 123 } },
        array: [1, 2, 3],
        special: "chars: !@#$%",
      };
      const error = new BadRequestError("Complex", complexDetails);
      const response = handleApiError(error);

      const data = await response.json();
      expect(data.details).toEqual(complexDetails);
    });
  });
});
