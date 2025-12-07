/**
 * API Route Helpers
 *
 * Higher-order functions and utilities to reduce boilerplate in API routes.
 * Provides authentication, error handling, and common patterns.
 *
 * @example
 * ```typescript
 * import { withAuth } from "@/app/api/lib/route-helpers";
 *
 * export const GET = withAuth(async (request, user) => {
 *   // Your route logic here
 *   // User is guaranteed to exist
 *   return createSuccessResponse({ message: "Hello" });
 * }, { requiredRole: "admin" });
 * ```
 */

import { getCurrentUser, type UserData } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// Types
// ============================================================================

export interface AuthOptions {
  /**
   * Required role for this route
   * If specified, user must have this role to access
   */
  requiredRole?: "admin" | "seller" | "buyer";

  /**
   * Allow unauthenticated access but still parse user if present
   */
  optional?: boolean;
}

export interface RouteContext {
  /**
   * Current authenticated user (if any)
   */
  user: UserData | null;

  /**
   * Request URL
   */
  url: URL;

  /**
   * Path parameters (for dynamic routes)
   */
  params?: Record<string, string>;
}

export type AuthenticatedRouteHandler = (
  request: NextRequest,
  user: UserData,
  context: RouteContext
) => Promise<NextResponse>;

export type OptionalAuthRouteHandler = (
  request: NextRequest,
  user: UserData | null,
  context: RouteContext
) => Promise<NextResponse>;

export type PublicRouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Promise<NextResponse>;

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Higher-order function for authenticated routes
 *
 * Automatically handles:
 * - User authentication
 * - Role checking
 * - Error handling
 * - Logging
 *
 * @param handler - Route handler function
 * @param options - Authentication options
 *
 * @example
 * ```typescript
 * export const GET = withAuth(async (request, user) => {
 *   return createSuccessResponse({ userId: user.id });
 * }, { requiredRole: "admin" });
 * ```
 */
export function withAuth(
  handler: AuthenticatedRouteHandler | OptionalAuthRouteHandler,
  options: AuthOptions = {}
): (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    routeContext?: { params?: Promise<Record<string, string>> }
  ) => {
    try {
      // Parse user from session
      const user = await getCurrentUser(request);

      // Check authentication
      if (!user && !options.optional) {
        return createErrorResponse("Unauthorized. Please log in.", 401);
      }

      // Check role if specified
      if (user && options.requiredRole && user.role !== options.requiredRole) {
        return createErrorResponse(
          `Forbidden. ${options.requiredRole} access required.`,
          403
        );
      }

      // Build context (await params if it's a Promise)
      const params = routeContext?.params
        ? await routeContext.params
        : undefined;
      const context: RouteContext = {
        user,
        url: new URL(request.url),
        params,
      };

      // Call handler
      if (options.optional) {
        return await (handler as OptionalAuthRouteHandler)(
          request,
          user,
          context
        );
      } else {
        return await handler(request, user!, context);
      }
    } catch (error) {
      return handleRouteError(error, request.url);
    }
  };
}

/**
 * Higher-order function for public routes with error handling
 *
 * @param handler - Route handler function
 *
 * @example
 * ```typescript
 * export const GET = withErrorHandler(async (request, context) => {
 *   const data = await fetchData();
 *   return createSuccessResponse(data);
 * });
 * ```
 */
export function withErrorHandler(
  handler: PublicRouteHandler
): (
  request: NextRequest,
  routeContext?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    routeContext?: { params?: Promise<Record<string, string>> }
  ) => {
    try {
      // Await params if it's a Promise
      const params = routeContext?.params
        ? await routeContext.params
        : undefined;
      const context: RouteContext = {
        user: null,
        url: new URL(request.url),
        params,
      };

      return await handler(request, context);
    } catch (error) {
      return handleRouteError(error, request.url);
    }
  };
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Centralized route error handler
 *
 * Handles different error types and returns appropriate responses
 */
export function handleRouteError(error: unknown, url: string): NextResponse {
  // Log error
  logError(error as Error, { context: url });

  // Handle specific error types
  if (error instanceof ValidationError) {
    return createErrorResponse(error.message, 400, error.details);
  }

  if (error instanceof NotFoundError) {
    return createErrorResponse(error.message, 404);
  }

  if (error instanceof UnauthorizedError) {
    return createErrorResponse(error.message, 401);
  }

  if (error instanceof ForbiddenError) {
    return createErrorResponse(error.message, 403);
  }

  // Default error response
  return createErrorResponse("Internal server error", 500);
}

// ============================================================================
// Custom Error Classes
// ============================================================================

export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// ============================================================================
// Response Formatters
// ============================================================================

/**
 * Standard success response
 *
 * @param data - Response data
 * @param meta - Optional metadata (pagination, etc.)
 *
 * @example
 * ```typescript
 * return createSuccessResponse({ items: products });
 * ```
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

/**
 * Standard error response
 *
 * @param message - Error message
 * @param status - HTTP status code
 * @param details - Optional error details
 *
 * @example
 * ```typescript
 * return createErrorResponse("Invalid input", 400, { field: "email" });
 * ```
 */
export function createErrorResponse(
  message: string,
  status: number,
  details?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Paginated response with metadata
 *
 * @param data - Array of items
 * @param pagination - Pagination info
 *
 * @example
 * ```typescript
 * return createPaginatedResponse(products, {
 *   page: 1,
 *   limit: 10,
 *   total: 100
 * });
 * ```
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse {
  return createSuccessResponse(data, {
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  });
}

// ============================================================================
// Query Parameter Helpers
// ============================================================================

/**
 * Parse pagination parameters from URL search params
 *
 * @param searchParams - URL search parameters
 * @param defaults - Default values
 *
 * @example
 * ```typescript
 * const { page, limit, sortBy, order } = parsePaginationParams(
 *   new URL(request.url).searchParams
 * );
 * ```
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
  } = {}
) {
  return {
    page: parseInt(searchParams.get("page") || String(defaults.page || 1)),
    limit: Math.min(
      parseInt(searchParams.get("limit") || String(defaults.limit || 10)),
      100 // Max limit
    ),
    sortBy: searchParams.get("sortBy") || defaults.sortBy || "created_at",
    order: (searchParams.get("order") || defaults.order || "desc") as
      | "asc"
      | "desc",
  };
}

/**
 * Parse filter parameters from URL search params
 *
 * @param searchParams - URL search parameters
 * @param allowedFilters - List of allowed filter keys
 *
 * @example
 * ```typescript
 * const filters = parseFilterParams(
 *   new URL(request.url).searchParams,
 *   ["status", "category", "minPrice", "maxPrice"]
 * );
 * ```
 */
export function parseFilterParams(
  searchParams: URLSearchParams,
  allowedFilters: string[]
): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const key of allowedFilters) {
    const value = searchParams.get(key);
    if (value !== null) {
      // Convert to appropriate type
      if (value === "true") filters[key] = true;
      else if (value === "false") filters[key] = false;
      else if (!isNaN(Number(value))) filters[key] = Number(value);
      else filters[key] = value;
    }
  }

  return filters;
}

/**
 * Parse search query parameter
 *
 * @param searchParams - URL search parameters
 *
 * @example
 * ```typescript
 * const searchQuery = parseSearchParam(new URL(request.url).searchParams);
 * ```
 */
export function parseSearchParam(searchParams: URLSearchParams): string | null {
  const query =
    searchParams.get("q") ||
    searchParams.get("query") ||
    searchParams.get("search");
  return query ? query.trim() : null;
}
