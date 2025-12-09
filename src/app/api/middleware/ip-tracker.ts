/**
 * IP Tracker Middleware
 *
 * Middleware to track IP addresses and user activities in API routes.
 *
 * Usage in API routes:
 * ```typescript
 * import { withIPTracking } from "@/app/api/middleware/ip-tracker";
 *
 * async function handler(request: Request) {
 *   // Your API logic
 * }
 *
 * export const POST = withIPTracking(handler, "login");
 * ```
 */

import { logError } from "@/lib/firebase-error-logger";
import {
  ActivityAction,
  ipTrackerService,
} from "@/services/ip-tracker.service";
import { NextResponse } from "next/server";

export interface IPTrackingOptions {
  action: ActivityAction;
  checkRateLimit?: boolean;
  maxAttempts?: number;
  windowMinutes?: number;
  extractUserId?: (request: Request) => Promise<string | undefined>;
}

/**
 * Middleware wrapper to track IP and apply rate limiting
 */
export function withIPTracking(
  handler: (request: Request, context?: any) => Promise<Response>,
  options: IPTrackingOptions | ActivityAction,
) {
  return async (request: Request, context?: any): Promise<Response> => {
    try {
      // Normalize options
      const opts: IPTrackingOptions =
        typeof options === "string" ? { action: options } : options;

      const {
        action,
        checkRateLimit = false,
        maxAttempts = 5,
        windowMinutes = 15,
        extractUserId,
      } = opts;

      // Extract IP and user agent
      const ipAddress = ipTrackerService.getIPFromRequest(request);
      const userAgent = ipTrackerService.getUserAgentFromRequest(request);

      // Check rate limit if enabled
      if (checkRateLimit) {
        const rateLimitResult = await ipTrackerService.checkRateLimit({
          ipAddress,
          action,
          maxAttempts,
          windowMs: windowMinutes * 60000, // Convert minutes to milliseconds
        });

        if (!rateLimitResult.allowed) {
          // Log failed attempt
          await ipTrackerService.logActivity({
            ipAddress,
            userAgent,
            action: `${action}_rate_limited` as ActivityAction,
            metadata: {
              remainingAttempts: rateLimitResult.remainingAttempts,
              resetAt: rateLimitResult.resetAt.toISOString(),
            },
          });

          return NextResponse.json(
            {
              success: false,
              error: "Rate limit exceeded",
              message: `Too many attempts. Please try again after ${rateLimitResult.resetAt.toLocaleTimeString()}.`,
              resetAt: rateLimitResult.resetAt.toISOString(),
            },
            { status: 429 },
          );
        }
      }

      // Execute the handler
      const response = await handler(request, context);

      // Extract user ID if function provided
      let userId: string | undefined;
      if (extractUserId) {
        try {
          userId = await extractUserId(request);
        } catch (error) {
          // Ignore user ID extraction errors
        }
      }

      // Log activity after successful response (status 2xx)
      if (response.ok) {
        await ipTrackerService.logActivity({
          userId,
          ipAddress,
          userAgent,
          action,
          metadata: {
            statusCode: response.status,
          },
        });
      } else {
        // Log failed action
        await ipTrackerService.logActivity({
          userId,
          ipAddress,
          userAgent,
          action: `${action}_failed` as ActivityAction,
          metadata: {
            statusCode: response.status,
          },
        });
      }

      return response;
    } catch (error) {
      const ipAddress = ipTrackerService.getIPFromRequest(request);
      const userAgent = ipTrackerService.getUserAgentFromRequest(request);
      
      logError(error as Error, {
        component: "IPTrackerMiddleware.withIPTracking",
        action: "ip_tracking_middleware",
        metadata: {
          action: typeof options === "string" ? options : options.action,
          ipAddress,
          userAgent,
          url: request.url,
          method: request.method,
        },
      });

      // On middleware error, continue with the request
      return handler(request, context);
    }
  };
}

/**
 * Simplified wrapper for login endpoint with rate limiting
 */
export function withLoginTracking(
  handler: (request: Request, context?: any) => Promise<Response>,
) {
  return withIPTracking(handler, {
    action: "login",
    checkRateLimit: true,
    maxAttempts: 5,
    windowMinutes: 15,
  });
}

/**
 * Simplified wrapper for registration endpoint
 */
export function withRegistrationTracking(
  handler: (request: Request, context?: any) => Promise<Response>,
) {
  return withIPTracking(handler, {
    action: "register",
    checkRateLimit: true,
    maxAttempts: 3,
    windowMinutes: 60,
  });
}

/**
 * Track activity manually (for use inside handlers)
 */
export async function trackActivity(
  request: Request,
  action: ActivityAction,
  userId?: string,
  metadata?: Record<string, any>,
): Promise<void> {
  const ipAddress = ipTrackerService.getIPFromRequest(request);
  const userAgent = ipTrackerService.getUserAgentFromRequest(request);

  await ipTrackerService.logActivity({
    userId,
    ipAddress,
    userAgent,
    action,
    metadata,
  });
}
