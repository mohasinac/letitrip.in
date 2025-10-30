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
