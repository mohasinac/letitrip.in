/**
 * API Middleware Index
 * Centralized exports for middleware components
 */

// Error handling
export {
  ResponseHelper,
  withErrorHandler,
  createApiError,
  throwApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  type ApiResponse,
  type ApiError,
} from "./error-handler";

// Database operations
export {
  DatabaseHelper,
  type PaginationParams,
  type PaginationResult,
  type FilterParams,
  type SortParams,
} from "./database";

// Request validation
export {
  validateRequestBody,
  validateQueryParams,
  validatePathParams,
  withRequestValidation,
  createSortSchema,
  CommonSchemas,
  ValidationHandler,
} from "./validation";

// Auth middleware handlers
export {
  createUserHandler,
  createAdminHandler,
  createSellerHandler,
  withAuth,
  type AuthMiddlewareOptions,
} from "@/lib/auth/api-middleware";

// Legacy API Response helper
export {
  ApiResponse as LegacyApiResponse,
  withRateLimit,
} from "@/lib/auth/middleware";

// Logging
export {
  logger,
  withLogging,
  logPerformance,
  logDatabaseQuery,
  LOG_LEVEL,
} from "./logger";

// Rate limiting
export {
  checkRateLimit,
  RATE_LIMITS,
} from "./rate-limiter";
