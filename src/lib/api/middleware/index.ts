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
