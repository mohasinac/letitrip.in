/**
 * Rate Limiter Service
 * 
 * In-memory rate limiting service to prevent API abuse.
 * Uses sliding window algorithm for accurate rate limiting.
 * 
 * Rate Limits by Role:
 * - Public (unauthenticated): 100 requests/hour
 * - Customer (authenticated): 1000 requests/hour
 * - Seller (authenticated): 1000 requests/hour
 * - Admin (authenticated): 5000 requests/hour
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
  requests: number[]; // Timestamps of requests for sliding window
}

// In-memory store for rate limiting
const requestStore = new Map<string, RateLimitRecord>();

/**
 * Rate limit configurations by role
 */
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  public: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 requests per hour
  },
  authenticated: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000, // 1000 requests per hour
  },
  seller: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000, // 1000 requests per hour
  },
  admin: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5000, // 5000 requests per hour
  },
};

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}> {
  const now = Date.now();
  let record = requestStore.get(identifier);

  // Clean up old entries (older than window)
  if (record) {
    record.requests = record.requests.filter(
      (timestamp) => timestamp > now - config.windowMs
    );
  }

  // No record or window expired
  if (!record || now > record.resetAt) {
    const resetAt = now + config.windowMs;
    record = {
      count: 1,
      resetAt,
      requests: [now],
    };
    requestStore.set(identifier, record);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Add current request
  record.requests.push(now);
  record.count = record.requests.length;
  requestStore.set(identifier, record);

  // Check if limit exceeded
  if (record.count > config.maxRequests) {
    // Calculate oldest request timestamp
    const oldestRequest = record.requests[0];
    const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get client identifier from request
 * Uses IP address or user ID as identifier
 */
export function getClientIdentifier(req: NextRequest, userId?: string): string {
  // If user ID provided, use it for more accurate rate limiting
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP address from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare

  let ip = 'unknown';

  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp.trim();
  } else if (cfConnectingIp) {
    ip = cfConnectingIp.trim();
  }

  return `ip:${ip}`;
}

/**
 * Get rate limit config by role
 */
export function getRateLimitConfig(role?: string): RateLimitConfig {
  if (!role) {
    return rateLimitConfigs.public;
  }

  if (role === 'admin') {
    return rateLimitConfigs.admin;
  }

  if (role === 'seller') {
    return rateLimitConfigs.seller;
  }

  return rateLimitConfigs.authenticated;
}

/**
 * Clean up old rate limit records
 * Runs periodically to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [identifier, record] of requestStore.entries()) {
    // Remove records older than 2 hours
    if (now > record.resetAt + 60 * 60 * 1000) {
      requestStore.delete(identifier);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Rate Limit] Cleaned up ${cleaned} old records`);
  }
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  totalIdentifiers: number;
  memoryUsage: number;
} {
  return {
    totalIdentifiers: requestStore.size,
    memoryUsage: requestStore.size * 100, // Rough estimate in bytes
  };
}

// Clean up old records every 10 minutes
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(cleanupRateLimitStore, 10 * 60 * 1000);
}

// Export rate limit service
export const rateLimitService = {
  check: checkRateLimit,
  getIdentifier: getClientIdentifier,
  getConfig: getRateLimitConfig,
  cleanup: cleanupRateLimitStore,
  stats: getRateLimitStats,
};

export default rateLimitService;
