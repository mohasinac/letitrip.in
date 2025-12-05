/**
 * @fileoverview TypeScript Module
 * @module src/lib/api-errors
 * @description This file contains functionality related to api-errors
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * API Error Classes
 * Standardized error responses for API routes
 */

export class ApiError extends Error {
  /** Status Code */
  statusCode: number;
  /** Is Operational */
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
  /** Errors */
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
/**
 * Performs error to json operation
 *
 * @param {Error | ApiError} error - Error object
 *
 * @returns {any} The errortojson result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * errorToJson(error);
 */

/**
 * Performs error to json operation
 *
 * @param {Error | ApiError} error - Error object
 *
 * @returns {any} The errortojson result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * errorToJson(error);
 */

export function errorToJson(error: Error | ApiError) {
  if (error instanceof ApiError) {
    const response: any = {
      /** Error */
      error: error.message,
      /** Status Code */
      statusCode: error.statusCode,
    };

    if (error instanceof ValidationError && error.errors) {
      response.errors = error.errors;
    }

    return response;
  }

  // Generic error
  return {
    /** Error */
    error: error.message || "An unexpected error occurred",
    /** Status Code */
    statusCode: 500,
  };
}

/**
 * Helper to check if error is operational (expected) vs programming error
 */
/**
 * Checks if operational error
 *
 * @param {Error} error - Error object
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isOperationalError(error);
 */

/**
 * Checks if operational error
 *
 * @param {Error} error - Error object
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isOperationalError(error);
 */

export function isOperationalError(error: Error): boolean {
  if (error instanceof ApiError) {
    return error.isOperational;
  }
  return false;
}
