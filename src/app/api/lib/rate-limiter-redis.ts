/**
 * Redis-Backed Rate Limiter
 * Production-ready rate limiting using Redis for distributed systems
 */

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "ioredis";

// Initialize Redis client
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn(
      "⚠️ REDIS_URL not configured. Falling back to in-memory rate limiting.",
    );
    return null;
  }

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error("❌ Redis connection failed after 3 retries");
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Exponential backoff
      },
      reconnectOnError: (err) => {
        console.error("Redis connection error:", err.message);
        return true; // Try to reconnect
      },
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected for rate limiting");
    });

    redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
    });
  }

  return redis;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

/**
 * Check rate limit using Redis (production) or fallback to in-memory
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const redisClient = getRedisClient();

  if (redisClient) {
    return checkRateLimitRedis(redisClient, identifier, config);
  } else {
    return checkRateLimitMemory(identifier, config);
  }
}

/**
 * Redis-based rate limiting using sorted sets
 */
async function checkRateLimitRedis(
  redis: Redis,
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, keyPrefix = "rate_limit" } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    pipeline.zcard(key);

    // Add current request with unique identifier
    const requestId = `${now}-${Math.random().toString(36).substring(7)}`;
    pipeline.zadd(key, now, requestId);

    // Set expiry on the key (cleanup)
    pipeline.expire(key, Math.ceil(windowMs / 1000) + 10);

    // Execute pipeline
    const results = await pipeline.exec();

    if (!results) {
      throw new Error("Redis pipeline execution failed");
    }

    // Get count from ZCARD result (index 1)
    const count = (results[1][1] as number) || 0;

    const allowed = count < maxRequests;
    const remaining = Math.max(0, maxRequests - count - 1);
    const resetAt = now + windowMs;

    return {
      allowed,
      remaining,
      resetAt,
      limit: maxRequests,
    };
  } catch (error) {
    console.error("Redis rate limit error:", error);
    // Fallback to allowing request if Redis fails
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: now + windowMs,
      limit: maxRequests,
    };
  }
}

/**
 * In-memory rate limiting fallback
 */
interface MemoryStore {
  [key: string]: {
    requests: number[];
  };
}

const memoryStore: MemoryStore = {};

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    Object.keys(memoryStore).forEach((key) => {
      if (memoryStore[key].requests.length === 0) {
        delete memoryStore[key];
      }
    });
  },
  5 * 60 * 1000,
);

async function checkRateLimitMemory(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, keyPrefix = "rate_limit" } = config;
  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Initialize or get existing data
  if (!memoryStore[key]) {
    memoryStore[key] = { requests: [] };
  }

  // Remove old requests outside window
  memoryStore[key].requests = memoryStore[key].requests.filter(
    (time) => time > windowStart,
  );

  // Add current request
  memoryStore[key].requests.push(now);

  const count = memoryStore[key].requests.length;
  const allowed = count <= maxRequests;
  const remaining = Math.max(0, maxRequests - count);
  const resetAt = now + windowMs;

  return {
    allowed,
    remaining,
    resetAt,
    limit: maxRequests,
  };
}

/**
 * Middleware wrapper for API routes with Redis rate limiting
 */
export async function withRedisRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig,
) {
  // Get client identifier
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]
    : req.headers.get("x-real-ip") || "unknown";

  // Include endpoint in identifier for more granular limits
  const endpoint = new URL(req.url).pathname;
  const identifier = `${ip}:${endpoint}`;

  // Check rate limit
  const result = await checkRateLimit(identifier, config);

  // If rate limit exceeded
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: config.message || "Too many requests. Please try again later.",
        retryAfter,
        limit: result.limit,
        remaining: 0,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
        },
      },
    );
  }

  // Execute handler
  const response = await handler(req);

  // Add rate limit headers to successful responses
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set(
    "X-RateLimit-Reset",
    String(Math.floor(result.resetAt / 1000)),
  );

  return response;
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Authentication endpoints (stricter)
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message:
      "Too many authentication attempts. Please try again in 15 minutes.",
    keyPrefix: "rate_limit:auth",
  },

  // API endpoints (moderate)
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many API requests. Please slow down.",
    keyPrefix: "rate_limit:api",
  },

  // Search endpoints (moderate)
  SEARCH: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many search requests. Please slow down.",
    keyPrefix: "rate_limit:search",
  },

  // Upload endpoints (stricter)
  UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many upload requests. Please wait a moment.",
    keyPrefix: "rate_limit:upload",
  },

  // Payment endpoints (very strict)
  PAYMENT: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many payment attempts. Please wait a moment.",
    keyPrefix: "rate_limit:payment",
  },

  // Public endpoints (lenient)
  PUBLIC: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests. Please slow down.",
    keyPrefix: "rate_limit:public",
  },
};

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return {
      connected: false,
      error: "Redis not configured",
    };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;

    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cleanup function to close Redis connection gracefully
 */
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("✅ Redis connection closed");
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * import { withRedisRateLimit, RATE_LIMITS } from '@/app/api/lib/rate-limiter-redis';
 *
 * export async function POST(req: NextRequest) {
 *   return withRedisRateLimit(req, async (request) => {
 *     // Your handler code here
 *     return NextResponse.json({ success: true });
 *   }, RATE_LIMITS.AUTH);
 * }
 * ```
 */
