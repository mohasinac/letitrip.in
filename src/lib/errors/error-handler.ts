/**
 * Centralized Error Handler
 *
 * Handles all errors consistently across the application.
 * Provides formatted responses for API routes and logging for unexpected errors.
 *
 * @example
 * ```ts
 * import { handleApiError } from '@/lib/errors';
 *
 * export async function GET() {
 *   try {
 *     // ... your code
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 */

import { createApiErrorHandler } from "@mohasinac/next";
import { AppError } from "./base-error";
import { ERROR_CODES, ERROR_MESSAGES } from "./error-codes";
import { serverLogger } from "@/lib/server-logger";

/**
 * Handle API errors with consistent response format
 */
export function handleApiError(error: unknown): Response {
  return apiErrorHandler(error);
}

const apiErrorHandler = createApiErrorHandler<AppError>({
  isAppError,
  getStatusCode: (err) => err.statusCode,
  toJSON: (err) => err.toJSON(),
  logger: serverLogger,
  internalErrorCode: ERROR_CODES.GEN_INTERNAL_ERROR,
  internalErrorMessage: ERROR_MESSAGES[ERROR_CODES.GEN_INTERNAL_ERROR],
});

/**
 * Log errors with context
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const errorData = {
    ...(context && { context }),
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  };

  serverLogger.error("Application error", errorData);
}

/**
 * Check if error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
