/**
 * API Handler Factory
 * Reduces code duplication by providing common patterns for:
 * - Error handling with consistent responses
 * - Authentication and authorization
 * - Request validation
 * - Response formatting
 *
 * Part of E030: Code Quality & SonarCloud Integration
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getUserFromRequest,
  requireAuth,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { AuthUser, UserRole } from "@/lib/rbac-permissions";
import { handleApiError, ApiError, NotFoundError, BadRequestError } from "./errors";

// ============================================================
// Types
// ============================================================

export interface HandlerContext {
  user: AuthUser | null;
  params: Record<string, string>;
  body?: any;
  searchParams: URLSearchParams;
}

export interface AuthenticatedContext extends HandlerContext {
  user: AuthUser;
}

export type RouteHandler<T extends HandlerContext = HandlerContext> = (
  request: NextRequest,
  context: T
) => Promise<NextResponse>;

export interface HandlerOptions {
  /** Require authentication */
  auth?: boolean;
  /** Required roles (implies auth: true) */
  roles?: UserRole[];
  /** Parse JSON body */
  parseBody?: boolean;
  /** Enable request logging */
  logging?: boolean;
}

// ============================================================
// Error Handler Wrapper
// ============================================================

/**
 * Wrap a handler with consistent error handling
 * Catches all errors and returns appropriate JSON responses
 */
export function withErrorHandler<T extends HandlerContext>(
  handler: RouteHandler<T>
): RouteHandler<T> {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      console.error(`[API Error] ${request.method} ${request.url}:`, error);
      return handleApiError(error);
    }
  };
}

// ============================================================
// Response Helpers
// ============================================================

/**
 * Create a success response with consistent format
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    message?: string;
    meta?: Record<string, any>;
  }
): NextResponse {
  const response: any = {
    success: true,
    data,
  };

  if (options?.message) {
    response.message = options.message;
  }

  if (options?.meta) {
    Object.assign(response, options.meta);
  }

  return NextResponse.json(response, { status: options?.status || 200 });
}

/**
 * Create an error response with consistent format
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: any
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
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    total?: number;
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string | null;
    page?: number;
    totalPages?: number;
  }
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    count: data.length,
    pagination,
  });
}

// ============================================================
// Handler Factory
// ============================================================

/**
 * Create an API handler with common functionality
 *
 * @example
 * // Simple handler with error handling
 * export const GET = createHandler(async (req, ctx) => {
 *   const data = await fetchData();
 *   return successResponse(data);
 * });
 *
 * @example
 * // Authenticated handler
 * export const POST = createHandler(
 *   async (req, ctx) => {
 *     // ctx.user is guaranteed to exist
 *     const data = await createResource(ctx.body, ctx.user.uid);
 *     return successResponse(data, { status: 201 });
 *   },
 *   { auth: true, parseBody: true }
 * );
 *
 * @example
 * // Role-restricted handler
 * export const DELETE = createHandler(
 *   async (req, ctx) => {
 *     await deleteResource(ctx.params.id);
 *     return successResponse({ deleted: true });
 *   },
 *   { roles: ['admin'] }
 * );
 */
export function createHandler<TAuth extends boolean = false>(
  handler: RouteHandler<TAuth extends true ? AuthenticatedContext : HandlerContext>,
  options: HandlerOptions & { auth?: TAuth } = {}
): (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse> {
  const { auth = false, roles, parseBody = false, logging = false } = options;

  // If roles are specified, auth is implicitly required
  const requireAuthentication = auth || (roles && roles.length > 0);

  return withErrorHandler(async (request, _context) => {
    // Logging
    if (logging) {
      console.log(`[API] ${request.method} ${request.url}`);
    }

    // Resolve params
    const params = _context?.params ? await (_context as any).params : {};
    const searchParams = request.nextUrl.searchParams;

    // Initialize context
    const context: HandlerContext = {
      user: null,
      params,
      searchParams,
    };

    // Authentication
    if (requireAuthentication) {
      if (roles && roles.length > 0) {
        const authResult = await requireRole(request, roles);
        if (authResult.error) return authResult.error;
        context.user = authResult.user;
      } else {
        const authResult = await requireAuth(request);
        if (authResult.error) return authResult.error;
        context.user = authResult.user;
      }
    } else {
      context.user = await getUserFromRequest(request);
    }

    // Parse body
    if (parseBody && ["POST", "PUT", "PATCH"].includes(request.method)) {
      try {
        context.body = await request.json();
      } catch {
        throw new BadRequestError("Invalid JSON body");
      }
    }

    // Call the handler
    return await handler(request, context as any);
  }) as any;
}

// ============================================================
// CRUD Handler Factory
// ============================================================

export interface CrudHandlerConfig<T = any> {
  /** Collection reference or name */
  collection: () => FirebaseFirestore.CollectionReference;
  /** Resource name for error messages */
  resourceName: string;
  /** Transform document data before returning */
  transform?: (id: string, data: any) => T;
  /** Validate create/update data */
  validate?: (data: any, isUpdate: boolean) => string[] | undefined;
  /** Check if user can access resource */
  canAccess?: (user: AuthUser | null, resourceData: any) => boolean;
  /** Check if user can modify resource */
  canModify?: (user: AuthUser, resourceData: any) => boolean;
  /** Fields allowed for updates */
  allowedUpdateFields?: string[];
  /** Required fields for creation */
  requiredFields?: string[];
}

/**
 * Create standard CRUD handlers for a resource
 *
 * @example
 * const { GET, POST, PATCH, DELETE } = createCrudHandlers({
 *   collection: () => Collections.products(),
 *   resourceName: 'Product',
 *   transform: (id, data) => ({ id, ...data }),
 *   canModify: (user, data) => user.role === 'admin' || data.owner_id === user.uid,
 * });
 */
export function createCrudHandlers<T = any>(config: CrudHandlerConfig<T>) {
  const {
    collection,
    resourceName,
    transform = (id, data) => ({ id, ...data }),
    validate,
    canAccess = () => true,
    canModify = (user) => user.role === "admin",
    allowedUpdateFields,
    requiredFields = [],
  } = config;

  // GET single resource
  const GET = createHandler(
    async (request, ctx) => {
      const { id } = ctx.params;
      if (!id) {
        throw new BadRequestError("ID is required");
      }

      const doc = await collection().doc(id).get();

      if (!doc.exists) {
        throw new NotFoundError(`${resourceName} not found`);
      }

      const data = doc.data();

      // Check access
      if (!canAccess(ctx.user, data)) {
        throw new NotFoundError(`${resourceName} not found`);
      }

      return successResponse(transform(doc.id, data));
    }
  );

  // POST create resource
  const POST = createHandler(
    async (request, ctx) => {
      const body = ctx.body;

      // Validate required fields
      const missingFields = requiredFields.filter((f) => !body[f]);
      if (missingFields.length > 0) {
        throw new BadRequestError(
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }

      // Custom validation
      if (validate) {
        const errors = validate(body, false);
        if (errors && errors.length > 0) {
          throw new BadRequestError(errors.join(", "));
        }
      }

      // Create document
      const now = new Date().toISOString();
      const docData = {
        ...body,
        created_at: now,
        updated_at: now,
        created_by: ctx.user.uid,
      };

      const docRef = await collection().add(docData);

      return successResponse(transform(docRef.id, docData), {
        status: 201,
        message: `${resourceName} created successfully`,
      });
    },
    { auth: true, parseBody: true }
  );

  // PATCH update resource
  const PATCH = createHandler(
    async (request, ctx) => {
      const { id } = ctx.params;
      if (!id) {
        throw new BadRequestError("ID is required");
      }

      const doc = await collection().doc(id).get();

      if (!doc.exists) {
        throw new NotFoundError(`${resourceName} not found`);
      }

      const existingData = doc.data();

      // Check modify permission
      if (!canModify(ctx.user, existingData)) {
        return errorResponse("You don't have permission to modify this resource", 403);
      }

      const body = ctx.body;

      // Custom validation
      if (validate) {
        const errors = validate(body, true);
        if (errors && errors.length > 0) {
          throw new BadRequestError(errors.join(", "));
        }
      }

      // Filter allowed fields if specified
      let updates = body;
      if (allowedUpdateFields) {
        updates = {};
        for (const field of allowedUpdateFields) {
          if (field in body) {
            updates[field] = body[field];
          }
        }
      }

      // Update document
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: ctx.user.uid,
      };

      await collection().doc(id).update(updateData);

      // Fetch updated document
      const updatedDoc = await collection().doc(id).get();

      return successResponse(transform(updatedDoc.id, updatedDoc.data()), {
        message: `${resourceName} updated successfully`,
      });
    },
    { auth: true, parseBody: true }
  );

  // DELETE resource
  const DELETE = createHandler(
    async (request, ctx) => {
      const { id } = ctx.params;
      if (!id) {
        throw new BadRequestError("ID is required");
      }

      const doc = await collection().doc(id).get();

      if (!doc.exists) {
        throw new NotFoundError(`${resourceName} not found`);
      }

      const existingData = doc.data();

      // Check modify permission
      if (!canModify(ctx.user, existingData)) {
        return errorResponse("You don't have permission to delete this resource", 403);
      }

      await collection().doc(id).delete();

      return successResponse(
        { deleted: true, id },
        { message: `${resourceName} deleted successfully` }
      );
    },
    { auth: true }
  );

  return { GET, POST, PATCH, DELETE };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Extract pagination params from search params
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  return {
    limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
    startAfter: searchParams.get("startAfter") || searchParams.get("cursor"),
    page: parseInt(searchParams.get("page") || "1"),
    sortBy: searchParams.get("sortBy") || "created_at",
    sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
  };
}

/**
 * Extract filter params from search params (excluding pagination params)
 */
export function getFilterParams(
  searchParams: URLSearchParams,
  allowedFilters: string[]
): Record<string, string> {
  const filters: Record<string, string> = {};
  const paginationKeys = ["limit", "startAfter", "cursor", "page", "sortBy", "sortOrder"];

  searchParams.forEach((value, key) => {
    if (
      value &&
      !paginationKeys.includes(key) &&
      allowedFilters.includes(key)
    ) {
      filters[key] = value;
    }
  });

  return filters;
}
