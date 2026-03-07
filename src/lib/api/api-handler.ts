/**
 * API Handler Utilities
 *
 * Mandatory wrapper for all JSON API route handlers. Provides:
 * - Authentication via session cookie (requireAuthFromRequest / requireRoleFromRequest)
 * - Rate limiting returning standardised errorResponse(429)
 * - Zod body validation returning ApiErrors.validationError on failure
 * - Dynamic route params forwarded to handler
 * - Centralised error handling via handleApiError
 *
 * @example
 * ```typescript
 * // Static route:
 * export const POST = createApiHandler({
 *   auth: true,
 *   rateLimit: RateLimitPresets.AUTH,
 *   schema: mySchema,
 *   handler: async ({ user, body }) =>
 *     successResponse(result, SUCCESS_MESSAGES.MY_MODULE.SUCCESS),
 * });
 *
 * // Dynamic route (e.g. /api/items/[id]):
 * export const GET = createApiHandler<never, { id: string }>({
 *   handler: async ({ params }) => {
 *     const { id } = params!;
 *     ...
 *   },
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyRateLimit } from "@/lib/security/rate-limit";
import {
  requireAuthFromRequest,
  requireRoleFromRequest,
} from "@/lib/security/authorization";
import { handleApiError } from "@/lib/errors/error-handler";
import { errorResponse, ApiErrors } from "@/lib/api-response";
import { UI_LABELS } from "@/constants";
import type { UserRole } from "@/types/auth";
import type { UserDocument } from "@/db/schema/users";

interface RateLimitConfig {
  limit: number;
  window: number; // seconds
}

interface ApiHandlerOptions<TInput = any, TParams = Record<string, string>> {
  /** Require authentication (implied when roles is set) */
  auth?: boolean;
  /** Required user roles — implies auth: true */
  roles?: UserRole[];
  /** Rate limit configuration */
  rateLimit?: RateLimitConfig;
  /** Zod validation schema for the request body */
  schema?: z.ZodSchema<TInput>;
  /** Handler function — receives typed request, user, body, and resolved route params */
  handler: (data: {
    request: NextRequest;
    user?: UserDocument;
    body?: TInput;
    params?: TParams;
  }) => Promise<NextResponse>;
}

/**
 * Create a type-safe API route handler with built-in auth, validation, and error handling.
 *
 * For dynamic routes, provide the params type as the second generic:
 *   createApiHandler<BodyType, { id: string }>({ ... })
 */
export function createApiHandler<
  TInput = any,
  TParams = Record<string, string>,
>(options: ApiHandlerOptions<TInput, TParams>) {
  return async (
    request: NextRequest,
    context: { params: Promise<TParams> },
  ): Promise<NextResponse> => {
    try {
      // 1. Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await applyRateLimit(
          request,
          options.rateLimit,
        );
        if (!rateLimitResult.success) {
          return errorResponse(UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED, 429);
        }
      }

      // 2. Authentication / authorisation
      let user: UserDocument | undefined;
      if (options.roles && options.roles.length > 0) {
        user = await requireRoleFromRequest(request, options.roles);
      } else if (options.auth) {
        user = await requireAuthFromRequest(request);
      }

      // 3. Body validation
      let validatedBody: TInput | undefined;
      if (options.schema) {
        const body = await request.json();
        const result = options.schema.safeParse(body);
        if (!result.success) {
          return ApiErrors.validationError(result.error.issues);
        }
        validatedBody = result.data;
      }

      // 4. Resolve dynamic route params
      const resolvedParams = await context.params;

      return await options.handler({
        request,
        user,
        body: validatedBody,
        params: resolvedParams,
      });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
