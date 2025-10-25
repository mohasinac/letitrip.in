/**
 * API Middleware Index
 * Centralized exports for all middleware components
 */

// Error handling
export {
  ResponseHelper,
  withErrorHandler,
  createApiError,
  throwApiError,
  type ApiResponse,
  type ApiError,
} from './error-handler';

// Database operations
export {
  DatabaseHelper,
  type PaginationParams,
  type PaginationResult,
  type FilterParams,
  type SortParams,
} from './database';

// Request validation
export {
  validateRequestBody,
  validateQueryParams,
  validatePathParams,
  withRequestValidation,
  createPaginationSchema,
  createSearchSchema,
  createSortSchema,
  CommonSchemas,
} from './validation';

// Enhanced middleware
export {
  createEnhancedHandler,
  createAuthHandler,
  createAdminHandler,
  createSellerHandler,
  createPublicHandler,
  invalidateCache,
  getCacheStats,
  type EnhancedMiddlewareOptions,
  type ValidatedRequest,
} from './enhanced';

// Legacy compatibility - re-export from original middleware
export {
  createUserHandler,
  createAdminHandler as createLegacyAdminHandler,
  createSellerHandler as createLegacySellerHandler,
  withAuth,
  type AuthMiddlewareOptions,
} from '@/lib/auth/api-middleware';

export {
  ApiResponse as LegacyApiResponse,
  withAuth as legacyWithAuth,
  withAdmin,
  validateBody,
  withRateLimit,
} from '@/lib/auth/middleware';
