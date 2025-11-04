/**
 * Rate Limiter Middleware
 * 
 * Protects API endpoints from abuse
 */

import { NextRequest } from 'next/server';
import { RateLimitError } from './error-handler';

// ============================================================================
// Rate Limit Store
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============================================================================
// Rate Limit Configuration
// ============================================================================

export const RATE_LIMITS = {
  AUTH: { requests: 5, window: 60 * 1000 }, // 5 requests per minute
  STANDARD: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  EXPENSIVE: { requests: 10, window: 60 * 1000 }, // 10 requests per minute (AI, search, etc.)
  READ: { requests: 200, window: 60 * 1000 }, // 200 reads per minute
  WRITE: { requests: 50, window: 60 * 1000 }, // 50 writes per minute
  UPLOAD: { requests: 20, window: 60 * 1000 }, // 20 uploads per minute
  PAYMENT: { requests: 10, window: 60 * 1000 }, // 10 payment requests per minute
} as const;

// ============================================================================
// Rate Limiter Functions
// ============================================================================

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
  key: string,
  limit: { requests: number; window: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or expired entry
  if (!entry || entry.resetAt < now) {
    const resetAt = now + limit.window;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit.requests - 1, resetAt };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > limit.requests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: limit.requests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    // Use token as part of the key (simplified)
    return `user:${token.substring(0, 20)}`;
  }

  // Fall back to IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return `ip:${ip}`;
}

// ============================================================================
// Middleware Wrapper
// ============================================================================

type RouteHandler = (request: NextRequest, context?: any) => Promise<Response>;

/**
 * Wrap API route with rate limiting
 */
export function withRateLimit(
  limit: { requests: number; window: number }
): (handler: RouteHandler) => RouteHandler {
  return (handler: RouteHandler) => {
    return async (request: NextRequest, context?: any) => {
      const clientId = getClientId(request);
      const endpoint = new URL(request.url).pathname;
      const key = `${clientId}:${endpoint}`;

      const result = checkRateLimit(key, limit);

      if (!result.allowed) {
        const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000);
        throw new RateLimitError(
          `Rate limit exceeded. Try again in ${resetIn} seconds.`
        );
      }

      // Add rate limit headers to response
      const response = await handler(request, context);
      
      response.headers.set('X-RateLimit-Limit', String(limit.requests));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

      return response;
    };
  };
}
