import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "./ratelimiter";
import { withCache } from "./cache";
import { withLogger } from "./logger";

interface MiddlewareConfig {
  rateLimit?: {
    maxRequests?: number;
    windowMs?: number;
    message?: string;
  };
  cache?: {
    ttl?: number;
    key?: string;
    revalidate?: number;
  };
  logger?: {
    context?: any;
  };
}

// Compose all middleware
export async function withMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: MiddlewareConfig = {},
) {
  // Apply middleware in order: Logger -> RateLimit -> Cache -> Handler
  return withLogger(
    req,
    async (loggedReq) => {
      return withRateLimit(
        loggedReq,
        async (rateLimitedReq) => {
          return withCache(rateLimitedReq, handler, config.cache);
        },
        config.rateLimit,
      );
    },
    config.logger?.context,
  );
}

// Export individual middleware
export { withRateLimit } from "./ratelimiter";
export { withCache, cacheManager } from "./cache";
export { withLogger, apiLogger } from "./logger";
