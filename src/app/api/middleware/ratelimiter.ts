import {
  apiRateLimiter,
  authRateLimiter,
  strictRateLimiter,
} from "@/app/api/lib/utils/rate-limiter";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "../lib/utils/ip-utils";

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  message?: string;
  limiterType?: "api" | "auth" | "search";
}

export function rateLimit(config: RateLimitConfig = {}) {
  const {
    message = "Too many requests, please try again later.",
    limiterType = "api",
  } = config;

  return async (req: NextRequest) => {
    try {
      // Get client identifier (IP or session)
      const ip = getClientIp(req);

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
            error: message,
            retryAfter: 60, // 1 minute
          },
          {
            status: 429,
            headers: {
              "Retry-After": "60",
              "X-RateLimit-Limit": String(config.maxRequests || 200),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      return null; // Allow request
    } catch (error) {
      // Log error but fail open (allow request)
      console.error("Rate limiter error:", error);
      return null; // Allow request if rate limiter fails
    }
  };
}

// Middleware wrapper for API routes
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  const rateLimitResult = await rateLimit(config)(req);

  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult; // Rate limit exceeded
  }

  return await handler(req);
}
