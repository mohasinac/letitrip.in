/**
 * Rate Limit Middleware for API Routes
 *
 * This middleware provides rate limiting functionality for Next.js API routes
 * using the RateLimiter from src/lib/rate-limiter.ts.
 *
 * @module api/_middleware/rate-limit
 */

import { RateLimitError, RateLimiter, RateLimiters } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limit configuration options
 */
export interface RateLimitOptions {
  /**
   * The rate limiter instance to use
   * Can be a pre-configured limiter or a custom instance
   */
  limiter?: RateLimiter;

  /**
   * Custom identifier function
   * Default uses IP address from request headers
   */
  getIdentifier?: (request: NextRequest) => string;

  /**
   * Custom error response handler
   */
  onRateLimitExceeded?: (
    error: RateLimitError,
    request: NextRequest
  ) => NextResponse;

  /**
   * Skip rate limiting based on request
   * Useful for excluding certain conditions (e.g., whitelisted IPs)
   */
  skip?: (request: NextRequest) => boolean;
}

/**
 * API route handler type
 */
export type ApiRouteHandler = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse> | NextResponse;

/**
 * Default identifier function - extracts IP from request
 */
function getDefaultIdentifier(request: NextRequest): string {
  // Try various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Default rate limit exceeded handler
 */
function getDefaultErrorHandler(
  error: RateLimitError,
  request: NextRequest
): NextResponse {
  return NextResponse.json(
    {
      error: "Too Many Requests",
      message: error.message,
      retryAfter: error.retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": error.retryAfter.toString(),
        "X-RateLimit-Consumed": error.consumedPoints.toString(),
        "X-RateLimit-Remaining": Math.max(0, error.remainingPoints).toString(),
        "X-RateLimit-Reset": Math.ceil(
          Date.now() / 1000 + error.retryAfter
        ).toString(),
      },
    }
  );
}

/**
 * Higher-order function that wraps an API route handler with rate limiting
 *
 * @example
 * ```typescript
 * // Using pre-configured limiter
 * export const GET = withRateLimit(
 *   async (request: NextRequest) => {
 *     return NextResponse.json({ data: 'Hello' });
 *   },
 *   { limiter: RateLimiters.api }
 * );
 *
 * // Using custom limiter
 * const customLimiter = new RateLimiter({ points: 10, duration: 60 });
 * export const POST = withRateLimit(handler, { limiter: customLimiter });
 *
 * // Custom identifier (e.g., by user ID)
 * export const PUT = withRateLimit(handler, {
 *   getIdentifier: (req) => req.headers.get('x-user-id') || 'anonymous',
 * });
 * ```
 */
export function withRateLimit(
  handler: ApiRouteHandler,
  options: RateLimitOptions = {}
): ApiRouteHandler {
  const {
    limiter = RateLimiters.api,
    getIdentifier = getDefaultIdentifier,
    onRateLimitExceeded = getDefaultErrorHandler,
    skip,
  } = options;

  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ) => {
    try {
      // Skip rate limiting if skip function returns true
      if (skip && skip(request)) {
        return await handler(request, context);
      }

      // Get identifier for this request
      const identifier = getIdentifier(request);

      // Consume 1 point from the rate limiter
      const result = await limiter.consume(identifier, 1);

      // Add rate limit headers to the response
      const response = await handler(request, context);

      // Clone the response to add headers
      const headers = new Headers(response.headers);
      headers.set("X-RateLimit-Consumed", result.consumedPoints.toString());
      headers.set("X-RateLimit-Remaining", result.remainingPoints.toString());
      headers.set(
        "X-RateLimit-Reset",
        Math.ceil(Date.now() / 1000 + result.msBeforeNext / 1000).toString()
      );

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      // Handle rate limit errors
      if (error instanceof RateLimitError) {
        return onRateLimitExceeded(error, request);
      }

      // Re-throw non-rate-limit errors
      throw error;
    }
  };
}

/**
 * Pre-configured middleware wrappers for common use cases
 */
export const RateLimitMiddleware = {
  /**
   * For authentication endpoints (5 requests per 15 minutes)
   */
  auth: (handler: ApiRouteHandler) =>
    withRateLimit(handler, { limiter: RateLimiters.auth }),

  /**
   * For general API endpoints (100 requests per minute)
   */
  api: (handler: ApiRouteHandler) =>
    withRateLimit(handler, { limiter: RateLimiters.api }),

  /**
   * For public endpoints (300 requests per minute)
   */
  public: (handler: ApiRouteHandler) =>
    withRateLimit(handler, { limiter: RateLimiters.public }),

  /**
   * For password reset endpoints (3 requests per hour)
   */
  passwordReset: (handler: ApiRouteHandler) =>
    withRateLimit(handler, { limiter: RateLimiters.passwordReset }),

  /**
   * For search endpoints (60 requests per minute)
   */
  search: (handler: ApiRouteHandler) =>
    withRateLimit(handler, { limiter: RateLimiters.search }),
};

/**
 * Utility function to create a custom rate limited handler
 *
 * @example
 * ```typescript
 * export const POST = createRateLimitedHandler(
 *   async (request) => {
 *     return NextResponse.json({ success: true });
 *   },
 *   {
 *     points: 50,
 *     duration: 60,
 *     getIdentifier: (req) => req.headers.get('authorization') || 'anonymous',
 *   }
 * );
 * ```
 */
export function createRateLimitedHandler(
  handler: ApiRouteHandler,
  config: {
    points: number;
    duration: number;
    getIdentifier?: (request: NextRequest) => string;
    onRateLimitExceeded?: (
      error: RateLimitError,
      request: NextRequest
    ) => NextResponse;
    skip?: (request: NextRequest) => boolean;
  }
): ApiRouteHandler {
  const { points, duration, ...options } = config;
  const limiter = new RateLimiter({ points, duration });

  return withRateLimit(handler, { limiter, ...options });
}
