/**
 * Rate Limit Middleware
 * 
 * Middleware for rate limiting API requests.
 * Supports role-based limits, custom identifiers, and error handling.
 * 
 * Usage:
 * ```typescript
 * export const GET = withRateLimit(handler, {
 *   config: rateLimitService.rateLimitConfigs.public,
 *   identifier: (req) => req.ip || 'unknown',
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import rateLimitService, { rateLimitConfigs } from '@/_lib/utils/rate-limiter';

// Import the RateLimitConfig type
type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export interface RateLimitOptions {
  /**
   * Rate limit configuration
   * Can be a config object or a function that returns one
   */
  config?: RateLimitConfig | ((req: NextRequest) => RateLimitConfig);

  /**
   * Custom identifier function
   * Default: uses rateLimitService.getClientIdentifier
   */
  identifier?: (req: NextRequest) => string;

  /**
   * Custom error response
   */
  onRateLimitExceeded?: (resetAt: number, retryAfter: number) => NextResponse;

  /**
   * Add rate limit headers to response (default: true)
   */
  addHeaders?: boolean;

  /**
   * Skip rate limiting based on request
   */
  skip?: (req: NextRequest) => boolean;
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Skip rate limiting if specified
    if (options.skip && options.skip(req)) {
      const response = await handler(req, context);
      if (options.addHeaders !== false) {
        response.headers.set('X-RateLimit-Skip', 'true');
      }
      return response;
    }

    try {
      // Get rate limit config
      let config: RateLimitConfig;
      if (typeof options.config === 'function') {
        config = options.config(req);
      } else if (options.config) {
        config = options.config;
      } else {
        // Default: public rate limit
        config = rateLimitConfigs.public;
      }

      // Get identifier
      const identifier = options.identifier
        ? options.identifier(req)
        : rateLimitService.getIdentifier(req);

      // Check rate limit
      const result = await rateLimitService.check(identifier, config);

      // If rate limit exceeded
      if (!result.allowed) {
        // Custom error response
        if (options.onRateLimitExceeded) {
          return options.onRateLimitExceeded(result.resetAt, result.retryAfter || 0);
        }

        // Default error response
        const response = NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            resetAt: result.resetAt,
            retryAfter: result.retryAfter,
          },
          { status: 429 }
        );

        // Add headers
        if (options.addHeaders !== false) {
          response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
          response.headers.set('X-RateLimit-Remaining', '0');
          response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
          response.headers.set('Retry-After', (result.retryAfter || 0).toString());
        }

        return response;
      }

      // Execute handler
      const response = await handler(req, context);

      // Add rate limit headers
      if (options.addHeaders !== false) {
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
      }

      return response;
    } catch (error) {
      console.error('[Rate Limit Middleware] Error:', error);
      
      // On error, allow request but log it
      const response = await handler(req, context);
      if (options.addHeaders !== false) {
        response.headers.set('X-RateLimit-Error', 'true');
      }
      return response;
    }
  };
}

/**
 * Helper: Get rate limit config by user role
 */
export function getRateLimitConfigByRole(req: NextRequest): RateLimitConfig {
  // Try to get user role from headers or token
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return rateLimitConfigs.public;
  }

  // In production, decode JWT and get role
  // For now, check custom header
  const role = req.headers.get('x-user-role') as 'admin' | 'seller' | 'authenticated' | null;
  
  return rateLimitService.getConfig(role || undefined);
}

/**
 * Helper: Skip rate limiting for admin users
 */
export function skipForAdmin(req: NextRequest): boolean {
  const role = req.headers.get('x-user-role');
  return role === 'admin';
}

/**
 * Helper: Create custom rate limit response
 */
export function createRateLimitResponse(
  resetAt: number,
  retryAfter: number,
  customMessage?: string
): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: customMessage || 'Too many requests. Please slow down.',
      resetAt,
      retryAfter,
    },
    { status: 429 }
  );
}

// Export default
export default withRateLimit;
