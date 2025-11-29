import { NextRequest, NextResponse } from "next/server";
import {
  apiRateLimiter,
  authRateLimiter,
  strictRateLimiter,
} from "@/app/api/lib/utils/rate-limiter";

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
          error: message,
          retryAfter: 60, // 1 minute
        },
        {
          status: 429,
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
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig,
) {
  const rateLimitResult = await rateLimit(config)(req);

  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult; // Rate limit exceeded
  }

  return await handler(req);
}
