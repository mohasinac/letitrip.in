/**
 * Centralized Error Handler Middleware
 * Provides consistent error handling and logging across all API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { FirebaseError } from "firebase/app";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Custom error classes for better error handling
 */
export class ValidationError extends Error {
  statusCode = 422;
  code = 'VALIDATION_ERROR';
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]> | string) {
    super(typeof errors === 'string' ? errors : 'Validation failed');
    this.name = 'ValidationError';
    this.errors = typeof errors === 'string' ? {} : errors;
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';

  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  code = 'CONFLICT';

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';

  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends Error {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';

  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
  }
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Response helper utilities
 */
export class ResponseHelper {
  private static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  static success<T>(data: T, message?: string, status = 200): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      },
    };

    return NextResponse.json(response, { status });
  }

  static error(
    message: string,
    status = 400,
    errors?: any,
    code?: string,
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      },
    };

    console.error(
      `API Error [${status}${code ? ` - ${code}` : ""}]: ${message}`,
      {
        errors,
        timestamp: response.meta?.timestamp,
        requestId: response.meta?.requestId,
      },
    );

    return NextResponse.json(response, { status });
  }

  static badRequest(message = "Bad Request", errors?: any): NextResponse {
    return this.error(message, 400, errors, "BAD_REQUEST");
  }

  static unauthorized(message = "Authentication required"): NextResponse {
    return this.error(message, 401, null, "UNAUTHORIZED");
  }

  static forbidden(message = "Access denied"): NextResponse {
    return this.error(message, 403, null, "FORBIDDEN");
  }

  static notFound(message = "Resource not found"): NextResponse {
    return this.error(message, 404, null, "NOT_FOUND");
  }

  static conflict(message = "Resource conflict"): NextResponse {
    return this.error(message, 409, null, "CONFLICT");
  }

  static validationError(
    message = "Validation failed",
    errors?: any,
  ): NextResponse {
    return this.error(message, 422, errors, "VALIDATION_ERROR");
  }

  static tooManyRequests(message = "Too many requests"): NextResponse {
    return this.error(message, 429, null, "RATE_LIMIT_EXCEEDED");
  }

  static serverError(message = "Internal server error"): NextResponse {
    return this.error(message, 500, null, "INTERNAL_ERROR");
  }
}

/**
 * Error handler middleware wrapper
 */
export function withErrorHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error: any) {
      console.error("Unhandled API error:", error);

      // Handle specific error types
      if (error instanceof ValidationError) {
        return ResponseHelper.validationError(error.message, error.errors);
      }

      if (error instanceof AuthenticationError) {
        return ResponseHelper.unauthorized(error.message);
      }

      if (error instanceof AuthorizationError) {
        return ResponseHelper.forbidden(error.message);
      }

      if (error instanceof NotFoundError) {
        return ResponseHelper.notFound(error.message);
      }

      if (error instanceof ConflictError) {
        return ResponseHelper.conflict(error.message);
      }

      if (error instanceof RateLimitError) {
        return ResponseHelper.tooManyRequests(error.message);
      }

      if (error instanceof ZodError) {
        return ResponseHelper.validationError(
          "Validation failed",
          error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        );
      }

      if (error.name === "FirebaseError" || error instanceof FirebaseError) {
        const firebaseErrorMap: Record<
          string,
          { status: number; message: string }
        > = {
          "permission-denied": { status: 403, message: "Access denied" },
          "not-found": { status: 404, message: "Resource not found" },
          "already-exists": { status: 409, message: "Resource already exists" },
          "invalid-argument": { status: 400, message: "Invalid request data" },
          unauthenticated: { status: 401, message: "Authentication required" },
          "resource-exhausted": { status: 429, message: "Rate limit exceeded" },
        };

        const mapped = firebaseErrorMap[error.code] || {
          status: 500,
          message: "Database error",
        };
        return ResponseHelper.error(
          mapped.message,
          mapped.status,
          null,
          error.code,
        );
      }

      if (error.statusCode || error.status) {
        return ResponseHelper.error(
          error.message || "Unknown error",
          error.statusCode || error.status,
          error.details,
          error.code,
        );
      }

      // Generic server error
      return ResponseHelper.serverError(
        process.env.NODE_ENV === "development" ? error.message : undefined,
      );
    }
  };
}

/**
 * Creates a custom API error
 */
export function createApiError(
  message: string,
  statusCode = 500,
  code?: string,
  details?: any,
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Throws a custom API error
 */
export function throwApiError(
  message: string,
  statusCode = 500,
  code?: string,
  details?: any,
): never {
  throw createApiError(message, statusCode, code, details);
}
