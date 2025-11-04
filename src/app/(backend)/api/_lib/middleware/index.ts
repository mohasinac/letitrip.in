/**
 * Middleware Index
 * 
 * Export all middleware for easy importing
 */

// Error Handler
export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ResponseHelper,
  withErrorHandler,
} from './error-handler';

// Logger
export {
  ApiLogger,
  logger,
  withLogging,
} from './logger';

// Cache Middleware (HOC style)
export { withCache, generateUrlCacheKey, skipIfAuthenticated, cacheOnlyGet } from './cache';

// Rate Limit Middleware (HOC style)
export { withRateLimit, getRateLimitConfigByRole, skipForAdmin, createRateLimitResponse } from './rate-limit';
