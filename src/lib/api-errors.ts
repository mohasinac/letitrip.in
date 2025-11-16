/**
 * API Error Classes
 * Standardized error responses for API routes
 */

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 401 Unauthorized - User not authenticated
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - User authenticated but lacks permission
 */
export class ForbiddenError extends ApiError {
  constructor(message = "You don't have permission to access this resource") {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 400 Bad Request - Validation error
 */
export class ValidationError extends ApiError {
  errors?: Record<string, string>;

  constructor(message = "Validation failed", errors?: Record<string, string>) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate)
 */
export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error - Unexpected error
 */
export class InternalServerError extends ApiError {
  constructor(message = "An unexpected error occurred") {
    super(message, 500, false);
  }
}

/**
 * Helper to convert error to JSON response
 */
export function errorToJson(error: Error | ApiError) {
  if (error instanceof ApiError) {
    const response: any = {
      error: error.message,
      statusCode: error.statusCode,
    };

    if (error instanceof ValidationError && error.errors) {
      response.errors = error.errors;
    }

    return response;
  }

  // Generic error
  return {
    error: error.message || "An unexpected error occurred",
    statusCode: 500,
  };
}

/**
 * Helper to check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof ApiError) {
    return error.isOperational;
  }
  return false;
}
