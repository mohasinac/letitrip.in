import {
  ApiError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "../api-errors";

describe("API Error Classes", () => {
  describe("ApiError", () => {
    it("creates a basic API error", () => {
      const error = new ApiError("Test error", 500);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("ApiError");
    });

    it("creates non-operational error", () => {
      const error = new ApiError("Test error", 500, false);

      expect(error.isOperational).toBe(false);
    });

    it("has stack trace", () => {
      const error = new ApiError("Test error", 500);

      expect(error.stack).toBeDefined();
    });
  });

  describe("UnauthorizedError", () => {
    it("creates 401 error with default message", () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Authentication required");
    });

    it("creates 401 error with custom message", () => {
      const error = new UnauthorizedError("Please log in");

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Please log in");
    });
  });

  describe("ForbiddenError", () => {
    it("creates 403 error with default message", () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe(
        "You don't have permission to access this resource"
      );
    });

    it("creates 403 error with custom message", () => {
      const error = new ForbiddenError("Admin access required");

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe("Admin access required");
    });
  });

  describe("NotFoundError", () => {
    it("creates 404 error with default message", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Resource not found");
    });

    it("creates 404 error with custom message", () => {
      const error = new NotFoundError("User not found");

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("User not found");
    });
  });

  describe("ValidationError", () => {
    it("creates 400 error with default message", () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed");
    });

    it("creates 400 error with custom message and errors", () => {
      const errors = {
        email: "Invalid email format",
        password: "Password too short",
      };
      const error = new ValidationError("Invalid input", errors);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid input");
      expect(error.errors).toEqual(errors);
    });

    it("creates 400 error with only message", () => {
      const error = new ValidationError("Invalid data");

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid data");
      expect(error.errors).toBeUndefined();
    });
  });

  describe("ConflictError", () => {
    it("creates 409 error with default message", () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Resource already exists");
    });

    it("creates 409 error with custom message", () => {
      const error = new ConflictError("Email already registered");

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Email already registered");
    });
  });

  describe("RateLimitError", () => {
    it("creates 429 error with default message", () => {
      const error = new RateLimitError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe("Too many requests, please try again later");
    });

    it("creates 429 error with custom message", () => {
      const error = new RateLimitError("Rate limit exceeded");

      expect(error.statusCode).toBe(429);
      expect(error.message).toBe("Rate limit exceeded");
    });
  });

  describe("InternalServerError", () => {
    it("creates 500 error with default message", () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("An unexpected error occurred");
    });

    it("creates 500 error with custom message", () => {
      const error = new InternalServerError("Database connection failed");

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Database connection failed");
    });
  });

  describe("Error inheritance", () => {
    it("all errors inherit from ApiError", () => {
      expect(new UnauthorizedError()).toBeInstanceOf(ApiError);
      expect(new ForbiddenError()).toBeInstanceOf(ApiError);
      expect(new NotFoundError()).toBeInstanceOf(ApiError);
      expect(new ValidationError()).toBeInstanceOf(ApiError);
      expect(new ConflictError()).toBeInstanceOf(ApiError);
      expect(new RateLimitError()).toBeInstanceOf(ApiError);
      expect(new InternalServerError()).toBeInstanceOf(ApiError);
    });

    it("all errors inherit from Error", () => {
      expect(new ApiError("test", 500)).toBeInstanceOf(Error);
      expect(new UnauthorizedError()).toBeInstanceOf(Error);
      expect(new ForbiddenError()).toBeInstanceOf(Error);
    });
  });

  describe("Error handling patterns", () => {
    it("can catch and check error type", () => {
      try {
        throw new NotFoundError("User not found");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.statusCode).toBe(404);
        }
      }
    });

    it("can distinguish operational from non-operational errors", () => {
      const operational = new ApiError("Operational", 500, true);
      const nonOperational = new ApiError("Non-operational", 500, false);

      expect(operational.isOperational).toBe(true);
      expect(nonOperational.isOperational).toBe(false);
    });

    it("validation error can include field-specific errors", () => {
      const fieldErrors = {
        email: "Required field",
        age: "Must be a positive number",
      };
      const error = new ValidationError("Form validation failed", fieldErrors);

      expect(error.errors).toBeDefined();
      expect(error.errors?.email).toBe("Required field");
      expect(error.errors?.age).toBe("Must be a positive number");
    });
  });
});
