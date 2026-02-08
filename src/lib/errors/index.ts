/**
 * Error Handling Module
 *
 * Centralized error classes, codes, messages, and handlers.
 * Import from this file for consistent error handling across the application.
 *
 * @example
 * ```ts
 * import {
 *   ApiError,
 *   ValidationError,
 *   ERROR_CODES,
 *   ERROR_MESSAGES,
 *   handleApiError
 * } from '@/lib/errors';
 *
 * // Throw typed errors
 * throw new ApiError(500, ERROR_MESSAGES[ERROR_CODES.GEN_INTERNAL_ERROR]);
 *
 * // Handle in API route
 * catch (error) {
 *   return handleApiError(error);
 * }
 * ```
 */

// Error Classes (Client & Server Safe)
export { AppError } from "./base-error";
export { ApiError } from "./api-error";
export { ValidationError } from "./validation-error";
export { AuthenticationError } from "./authentication-error";
export { AuthorizationError } from "./authorization-error";
export { NotFoundError } from "./not-found-error";
export { DatabaseError } from "./database-error";

// Error Codes & Messages (Client & Server Safe)
export { ERROR_CODES, ERROR_MESSAGES } from "./error-codes";

// Error Handler (Server-Only - import directly from './error-handler' in API routes)
// Do not export here to avoid importing server-logger in client components
// export { handleApiError, logError, isAppError } from './error-handler';
