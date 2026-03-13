/**
 * Rate Limiting
 *
 * Upstash Redis-backed sliding-window rate limiter for API routes.
 * Works correctly across serverless instances on Vercel.
 *
 * Requires environment variables:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Falls back to in-memory rate limiting when Upstash is not configured
 * (e.g. local development without Redis). The dev bypass has been removed —
 * rate limits are enforced in all environments.
 *
 * @example
 * ```ts
 * import { applyRateLimit, RateLimitPresets } from '@/lib/security';
 *
 * export async function POST(request: NextRequest) {
 *   const result = await applyRateLimit(request, RateLimitPresets.AUTH);
 *   if (!result.success) {
 *     return NextResponse.json({ error: result.error }, { status: 429 });
 *   }
 *   // ... handle request
 * }
 * ```
 */

import { NextRequest } from "next/server";

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  window: number;
  /** Custom identifier (default: IP address) */
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

// ─── IP extraction ────────────────────────────────────────────────────────────

function getClientIP(request: NextRequest | Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

// ─── Upstash-backed limiter ───────────────────────────────────────────────────

let upstashLimiter:
  | ((ip: string, limit: number, window: number) => Promise<RateLimitResult>)
  | null = null;

async function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Redis } = await import("@upstash/redis");
  const { Ratelimit } = await import("@upstash/ratelimit");

  const redis = new Redis({ url, token });
  const cache = new Map<string, import("@upstash/ratelimit").Ratelimit>();

  upstashLimiter = async (
    ip: string,
    limit: number,
    window: number,
  ): Promise<RateLimitResult> => {
    const key = `${limit}:${window}`;
    if (!cache.has(key)) {
      cache.set(
        key,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, `${window} s`),
          prefix: "letitrip:rl",
        }),
      );
    }
    const result = await cache.get(key)!.limit(ip);
    const reset = Math.ceil(result.reset / 1000);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset,
      error: result.success
        ? undefined
        : `Rate limit exceeded. Try again after ${new Date(result.reset).toISOString()}`,
    };
  };

  return upstashLimiter;
}

// ─── In-memory fallback (single-instance only) ───────────────────────────────

interface StoreEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, StoreEntry>();

function inMemoryLimit(
  identifier: string,
  limit: number,
  window: number,
): RateLimitResult {
  const now = Date.now();
  const windowMs = window * 1000;
  let entry = memStore.get(identifier);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    memStore.set(identifier, entry);
  }
  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  const reset = Math.ceil(entry.resetAt / 1000);
  if (entry.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
      error: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetAt - now) / 1000)} seconds`,
    };
  }
  return { success: true, limit, remaining, reset };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Rate limit checker. Uses Upstash Redis when configured, in-memory fallback otherwise.
 * Rate limiting is enforced in ALL environments (no dev bypass).
 */
export async function rateLimit(
  request: NextRequest | Request,
  config: RateLimitConfig = { limit: 10, window: 60 },
): Promise<RateLimitResult> {
  const identifier = config.identifier || getClientIP(request);
  const limiter = await getUpstashLimiter();
  if (limiter) {
    return limiter(identifier, config.limit, config.window);
  }
  return inMemoryLimit(identifier, config.limit, config.window);
}

/** Alias */
export const applyRateLimit = rateLimit;

/**
 * Rate limit by an explicit identifier string (e.g. user uid or custom key).
 * Use this in Server Actions where no `Request` object is available.
 *
 * @example
 * const rl = await rateLimitByIdentifier(`cart:${uid}`, RateLimitPresets.API);
 * if (!rl.success) throw new Error("Too many requests");
 */
export async function rateLimitByIdentifier(
  identifier: string,
  config: Omit<RateLimitConfig, "identifier"> = { limit: 60, window: 60 },
): Promise<RateLimitResult> {
  const limiter = await getUpstashLimiter();
  if (limiter) {
    return limiter(identifier, config.limit, config.window);
  }
  return inMemoryLimit(identifier, config.limit, config.window);
}

/** Rate limit presets for common scenarios */
export const RateLimitPresets = {
  STRICT: { limit: 5, window: 60 },
  AUTH: { limit: 10, window: 60 },
  API: { limit: 60, window: 60 },
  GENEROUS: { limit: 100, window: 60 },
  PASSWORD_RESET: { limit: 3, window: 3600 },
  EMAIL_VERIFICATION: { limit: 5, window: 3600 },
} as const;

/** For testing only: clear the in-memory rate limit store. */
export function clearRateLimitStore(): void {
  memStore.clear();
}
