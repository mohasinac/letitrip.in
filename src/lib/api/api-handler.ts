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

import { z } from "zod";
import type { NextRequest, NextResponse } from "next/server";
import { createApiHandlerFactory } from "@mohasinac/next";
import { initProviders } from "@/providers.config";
import { applyRateLimit } from "@/lib/security/rate-limit";
import {
  requireAuthFromRequest,
  requireRoleFromRequest,
} from "@/lib/security/authorization";
import { handleApiError } from "@/lib/errors/error-handler";
import { errorResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
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
  TParams extends Record<string, string> = Record<string, string>,
>(options: ApiHandlerOptions<TInput, TParams>) {
  return localCreateApiHandler<TInput, TParams>({
    ...options,
    handler: async ({ request, user, body, params }) => {
      await initProviders();
      return options.handler({
        request: request as NextRequest,
        user,
        body,
        params,
      });
    },
  });
}

const localCreateApiHandler = createApiHandlerFactory<
  UserRole,
  RateLimitConfig,
  UserDocument
>({
  applyRateLimit: (request, config) =>
    applyRateLimit(request as NextRequest, config),
  requireAuthFromRequest: (request) =>
    requireAuthFromRequest(request as NextRequest),
  requireRoleFromRequest: (request, roles) =>
    requireRoleFromRequest(request as NextRequest, roles as UserRole[]),
  errorResponse,
  handleApiError,
  getRateLimitExceededMessage: () => UI_LABELS.AUTH.RATE_LIMIT_EXCEEDED,
  logTiming: ({ method, path, status, durationMs, error }) => {
    if (error) {
      serverLogger.error("api.timing", {
        method,
        path,
        durationMs,
        error,
      });
      return;
    }

    serverLogger.info("api.timing", {
      method,
      path,
      status,
      durationMs,
    });
  },
});
