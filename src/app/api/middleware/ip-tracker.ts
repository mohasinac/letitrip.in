/**
 * @fileoverview TypeScript Module
 * @module src/app/api/middleware/ip-tracker
 * @description This file contains functionality related to ip-tracker
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * IPTrackingOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for IPTrackingOptions
 */
export interface IPTrackingOptions {
  /** Action */
  action: ActivityAction;
  /** Check Rate Limit */
  checkRateLimit?: boolean;
  /** Max Attempts */
  maxAttempts?: number;
  /** Window Minutes */
  windowMinutes?: number;
  /** Extract User Id */
  extractUserId?: (request: Request) => Promise<string | undefined>;
}

/**
 * Middleware wrapper to track IP and apply rate limiting
 */
/**
 * Performs with i p tracking operation
 *
 * @param {(request} handler - The handler
 * @param {any} [context] - The context
 *
 * @returns {Promise<any>} Promise resolving to withiptracking result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withIPTracking(handler, context);
 */

/**
 * Performs with i p tracking operation
 *
 * @param {(request} /** Handler */
  handler - The /**  handler */
  handler
 * @param {any} [context] - The context
 *
 * @returns {any} The withiptracking result
 *
 * @example
 * withIPTracking(/** Handler */
  handler, context);
 */

export function withIPTracking(
  /** Handler */
  handler: (request: Request, context?: any) => Promise<Response>,
  /** Options */
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
        const rateLimitResult = await ipTrackerService.checkRateLimit(
          ipAddress,
          action,
          maxAttempts,
          windowMinutes,
        );

        if (!rateLimitResult.allowed) {
          // Log failed attempt
          await ipTrackerService.logActivity({
            ipAddress,
            userAgent,
            /** Action */
            action: `${action}_rate_limited` as ActivityAction,
            /** Metadata */
            metadata: {
              /** Remaining Attempts */
              remainingAttempts: rateLimitResult.remainingAttempts,
              /** Reset At */
              resetAt: rateLimitResult.resetAt.toISOString(),
            },
          });

          return NextResponse.json(
            {
              /** Success */
              success: false,
              /** Error */
              error: "Rate limit exceeded",
              /** Message */
              message: `Too many attempts. Please try again after ${rateLimitResult.resetAt.toLocaleTimeString()}.`,
              /** Reset At */
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
          /** Metadata */
          metadata: {
            /** Status Code */
            statusCode: response.status,
          },
        });
      } else {
        // Log failed action
        await ipTrackerService.logActivity({
          userId,
          ipAddress,
          userAgent,
          /** Action */
          action: `${action}_failed` as ActivityAction,
          /** Metadata */
          metadata: {
            /** Status Code */
            statusCode: response.status,
          },
        });
      }

      return response;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "IPTrackerMiddleware.withIPTracking",
        /** Action */
        action: "ip_tracking_middleware",
        /** Metadata */
        metadata: {
          /** Action */
          action: typeof options === "string" ? options : options.action,
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
/**
 * Performs with login tracking operation
 *
 * @param {(request} handler - The handler
 * @param {any} [context] - The context
 *
 * @returns {any} The withlogintracking result
 *
 * @example
 * withLoginTracking(handler, context);
 */

/**
 * Performs with login tracking operation
 *
 * @param {(request} /** Handler */
  handler - The /**  handler */
  handler
 * @param {any} [context] - The context
 *
 * @returns {any} The withlogintracking result
 *
 * @example
 * withLoginTracking(/** Handler */
  handler, context);
 */

export function withLoginTracking(
  /** Handler */
  handler: (request: Request, context?: any) => Promise<Response>,
) {
  return withIPTracking(handler, {
    /** Action */
    action: "login",
    /** Check Rate Limit */
    checkRateLimit: true,
    /** Max Attempts */
    maxAttempts: 5,
    /** Window Minutes */
    windowMinutes: 15,
  });
}

/**
 * Simplified wrapper for registration endpoint
 */
/**
 * Performs with registration tracking operation
 *
 * @param {(request} handler - The handler
 * @param {any} [context] - The context
 *
 * @returns {any} The withregistrationtracking result
 *
 * @example
 * withRegistrationTracking(handler, context);
 */

/**
 * Performs with registration tracking operation
 *
 * @param {(request} /** Handler */
  handler - The /**  handler */
  handler
 * @param {any} [context] - The context
 *
 * @returns {any} The withregistrationtracking result
 *
 * @example
 * withRegistrationTracking(/** Handler */
  handler, context);
 */

export function withRegistrationTracking(
  /** Handler */
  handler: (request: Request, context?: any) => Promise<Response>,
) {
  return withIPTracking(handler, {
    /** Action */
    action: "register",
    /** Check Rate Limit */
    checkRateLimit: true,
    /** Max Attempts */
    maxAttempts: 3,
    /** Window Minutes */
    windowMinutes: 60,
  });
}

/**
 * Track activity manually (for use inside handlers)
 */
/**
 * Performs track activity operation
 *
 * @returns {Promise<any>} Promise resolving to trackactivity result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * trackActivity();
 */

/**
 * Performs track activity operation
 *
 * @returns {Promise<any>} Promise resolving to trackactivity result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * trackActivity();
 */

export async function trackActivity(
  /** Request */
  request: Request,
  /** Action */
  action: ActivityAction,
  /** User Id */
  userId?: string,
  /** Metadata */
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
