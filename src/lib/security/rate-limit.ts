/**
 * Rate Limiting
 *
 * Simple in-memory rate limiter for API routes.
 * Tracks requests by IP address and enforces limits.
 *
 * @example
 * ```ts
 * import { rateLimit } from '@/lib/security';
 *
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimit(request);
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json({ error: rateLimitResult.error }, { status: 429 });
 *   }
 *   // ... handle request
 * }
 * ```
 */

import { NextRequest } from "next/server";

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  /**
   * Maximum requests allowed in the window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  window: number;

  /**
   * Custom identifier (default: IP address)
   */
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest | Request): string {
  // Try Next.js request IP first
  if ("ip" in request && typeof request.ip === "string") {
    return request.ip;
  }

  // Try headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return "unknown";
}

/**
 * Rate limit checker
 *
 * @param request - Request object
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status
 */
export async function rateLimit(
  request: NextRequest | Request,
  config: RateLimitConfig = { limit: 10, window: 60 },
): Promise<RateLimitResult> {
  const identifier = config.identifier || getClientIP(request);
  const now = Date.now();
  const windowMs = config.window * 1000;

  // Get or create store entry
  let entry = store.get(identifier);

  // Reset if window has passed
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store.set(identifier, entry);
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  const remaining = Math.max(0, config.limit - entry.count);
  const reset = Math.ceil(entry.resetAt / 1000);

  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset,
      error: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetAt - now) / 1000)} seconds`,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining,
    reset,
  };
}

/**
 * Cleanup old entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearRateLimitStore(): void {
  store.clear();
}

/**
 * Apply rate limit to a request (alias for rateLimit)
 */
export const applyRateLimit = rateLimit;

/**
 * Rate limit presets for common scenarios
 */
export const RateLimitPresets = {
  /**
   * Strict: 5 requests per minute
   */
  STRICT: { limit: 5, window: 60 },

  /**
   * Auth: 10 requests per minute (for login/register)
   */
  AUTH: { limit: 10, window: 60 },

  /**
   * API: 60 requests per minute
   */
  API: { limit: 60, window: 60 },

  /**
   * Generous: 100 requests per minute
   */
  GENEROUS: { limit: 100, window: 60 },

  /**
   * Password reset: 3 requests per hour
   */
  PASSWORD_RESET: { limit: 3, window: 3600 },

  /**
   * Email verification: 5 requests per hour
   */
  EMAIL_VERIFICATION: { limit: 5, window: 3600 },
} as const;
