/**
 * API Handler Utilities
 *
 * Reusable utilities for API route handlers with:
 * - Authentication
 * - Rate limiting
 * - Validation
 * - Error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { requireRole } from "@/lib/security/authorization";
import {
  handleApiError,
  AuthenticationError,
  ValidationError,
} from "@/lib/errors";
import { UI_LABELS, ERROR_MESSAGES } from "@/constants";
import type { UserRole } from "@/types/auth";

interface RateLimitConfig {
  limit: number;
  window: number; // seconds
}

interface ApiHandlerOptions<TInput = any> {
  /** Require authentication */
  auth?: boolean;
  /** Required user roles */
  roles?: UserRole[];
  /** Rate limit configuration */
  rateLimit?: RateLimitConfig;
  /** Zod validation schema */
  schema?: z.ZodSchema<TInput>;
  /** Handler function */
  handler: (data: {
    request: NextRequest;
    user?: any;
    body?: TInput;
  }) => Promise<NextResponse>;
}

/**
 * Create an API route handler with built-in auth, validation, and rate limiting
 */
export function createApiHandler<TInput = any>(
  options: ApiHandlerOptions<TInput>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await applyRateLimit(
          request,
          options.rateLimit,
        );
        if (!rateLimitResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED,
            },
            { status: 429 },
          );
        }
      }

      // Authentication
      let user;
      if (options.auth) {
        user = await getAuthenticatedUser();
        if (!user) {
          throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
        }

        // Role-based authorization
        if (options.roles && options.roles.length > 0) {
          requireRole(user, options.roles);
        }
      }

      // Body validation
      let validatedBody;
      if (options.schema) {
        const body = await request.json();
        const result = options.schema.safeParse(body);

        if (!result.success) {
          throw new ValidationError(
            ERROR_MESSAGES.VALIDATION.INVALID_INPUT,
            result.error.flatten().fieldErrors as Record<string, string[]>,
          );
        }

        validatedBody = result.data;
      }

      // Call handler
      return await options.handler({
        request,
        user,
        body: validatedBody,
      });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Standard success response
 */
export function successResponse<T = any>(
  data: T,
  message?: string,
  status: number = 200,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
}

/**
 * Standard error response
 */
export function errorResponse(
  error: string,
  status: number = 400,
  code?: string,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    { status },
  );
}
