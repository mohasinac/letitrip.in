/**
 * Middleware exports
 * Central export point for all middleware functions
 */

// Export auth (includes requireAuth and AuthenticatedRequest)
export { requireAuth } from "./auth";
export type { AuthenticatedRequest } from "./auth";

// Export rbac-auth (selective to avoid duplicates)
export { getUserFromRequest, requireRole } from "./rbac-auth";

// Export cache
export { cacheManager, withCache } from "./cache";

// Export logger
export { apiLogger } from "./logger";

// Export rate limiter
export { rateLimit } from "./ratelimiter";

/**
 * Utility type for middleware handlers
 */
export type MiddlewareHandler<T = any> = (
  req: Request,
  handler: (req: Request) => Promise<T>,
  options?: MiddlewareOptions
) => Promise<T>;

/**
 * Middleware options interface
 */
export interface MiddlewareOptions {
  cache?: {
    ttl?: number;
    key?: string;
  };
  rateLimit?: {
    maxRequests?: number;
    windowMs?: number;
  };
  auth?: {
    required?: boolean;
    roles?: string[];
  };
}

/**
 * Generic middleware wrapper
 * Apply multiple middlewares in sequence
 */
export async function withMiddleware<T = any>(
  req: Request,
  handler: (req: Request) => Promise<T>,
  options: MiddlewareOptions = {}
): Promise<T> {
  let processedReq = req;

  // Apply middlewares based on options
  if (options.rateLimit) {
    // Rate limiting would be applied here
    // For now, just pass through
  }

  if (options.cache) {
    // Cache would be checked here
    // For now, just pass through
  }

  if (options.auth?.required) {
    // Auth would be applied here
    // For now, just pass through
  }

  // Execute the actual handler
  return handler(processedReq);
}
