/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per user/IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from './error-handler';
import { logger } from './logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Get rate limit key from request
 */
function getRateLimitKey(request: NextRequest, identifier?: string): string {
  if (identifier) {
    return `ratelimit:${identifier}`;
  }

  // Use IP address as fallback
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  
  return `ratelimit:ip:${ip}`;
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredEntries, 60000);

/**
 * Check rate limit
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or expired - create new
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware
 */
export function withRateLimit(
  config: RateLimitConfig,
  getUserId?: (request: NextRequest) => Promise<string | null>
) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      // Get identifier (user ID or IP)
      let identifier: string | undefined;
      if (getUserId) {
        const userId = await getUserId(request);
        if (userId) {
          identifier = `user:${userId}`;
        }
      }

      const key = getRateLimitKey(request, identifier);

      // Check rate limit
      const { allowed, remaining, resetTime } = checkRateLimit(key, config);

      // Add rate limit headers
      const headers = {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      };

      // Rate limit exceeded
      if (!allowed) {
        logger.warn(`Rate limit exceeded for ${key}`, {
          path: request.nextUrl.pathname,
          resetTime: new Date(resetTime).toISOString(),
        });

        const error = new RateLimitError(
          config.message || 'Too many requests. Please try again later.'
        );

        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
            meta: {
              timestamp: new Date().toISOString(),
              resetTime: new Date(resetTime).toISOString(),
            },
          },
          {
            status: 429,
            headers,
          }
        );
      }

      // Execute handler
      const response = await handler(request, ...args);

      // Add rate limit headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    };
  };
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict rate limit for auth endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts. Please try again later.',
  },

  // Standard rate limit for API endpoints
  STANDARD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },

  // Strict rate limit for expensive operations
  EXPENSIVE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },

  // Relaxed rate limit for read operations
  READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },

  // Very strict for write operations
  WRITE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
} as const;
