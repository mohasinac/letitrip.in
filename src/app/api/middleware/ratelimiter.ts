/**
 * @fileoverview TypeScript Module
 * @module src/app/api/middleware/ratelimiter
 * @description This file contains functionality related to ratelimiter
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import {
  apiRateLimiter,
  authRateLimiter,
  strictRateLimiter,
} from "@/app/api/lib/utils/rate-limiter";

/**
 * RateLimitConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for RateLimitConfig
 */
interface RateLimitConfig {
  /** Max Requests */
  maxRequests?: number;
  /** Window Ms */
  windowMs?: number;
  /** Message */
  message?: string;
  /** Limiter Type */
  limiterType?: "api" | "auth" | "search";
}

/**
 * Function: Rate Limit
 */
/**
 * Performs rate limit operation
 *
 * @param {RateLimitConfig} [config] - The config
 *
 * @returns {any} The ratelimit result
 *
 * @example
 * rateLimit(config);
 */

/**
 * Performs rate limit operation
 *
 * @param {RateLimitConfig} [config] - The config
 *
 * @returns {any} The ratelimit result
 *
 * @example
 * rateLimit(config);
 */

export function rateLimit(config: RateLimitConfig = {}) {
  const {
    message = "Too many requests, please try again later.",
    limiterType = "api",
  } = config;

  return async (req: NextRequest) => {
    // Get client identifier (IP or session)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : req.headers.get("x-real-ip") || "unknown";

    // Select appropriate rate limiter
    const limiter =
      limiterType === "auth"
        ? authRateLimiter
        : limiterType === "search"
          ? strictRateLimiter
          : apiRateLimiter;

    const allowed = limiter.check(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          /** Error */
          error: message,
          retryAfter: 60, // 1 minute
        },
        {
          /** Status */
          status: 429,
          /** Headers */
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": String(limiter instanceof Object ? 200 : 200),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    return null; // Allow request
  };
}

// Middleware wrapper for API routes
/**
 * Function: With Rate Limit
 */
/**
 * Performs with rate limit operation
 *
 * @param {NextRequest} req - The req
 * @param {(req} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to withratelimit result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withRateLimit(req, handler);
 */

/**
 * Performs with rate limit operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {(req} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to withratelimit result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withRateLimit(/** Req */
  req, /** Handler */
  handler);
 */

export async function withRateLimit(
  /** Req */
  req: NextRequest,
  /** Handler */
  handler: (req: NextRequest) => Promise<NextResponse>,
  /** Config */
  config?: RateLimitConfig,
) {
  const rateLimitResult = await rateLimit(config)(req);

  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult; // Rate limit exceeded
  }

  return await handler(req);
}
