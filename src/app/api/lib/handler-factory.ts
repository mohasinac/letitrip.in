/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/handler-factory
 * @description This file contains functionality related to handler-factory
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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
import {
  handleApiError,
  ApiError,
  NotFoundError,
  BadRequestError,
} from "./errors";

// ============================================================
// Types
// ============================================================

/**
 * HandlerContext interface
 * 
 * @interface
 * @description Defines the structure and contract for HandlerContext
 */
export interface HandlerContext {
  /** User */
  user: AuthUser | null;
  /** Params */
  params: Record<string, string>;
  /** Body */
  body?: any;
  /** Search Params */
  searchParams: URLSearchParams;
}

/**
 * AuthenticatedContext interface
 * 
 * @interface
 * @description Defines the structure and contract for AuthenticatedContext
 */
export interface AuthenticatedContext extends HandlerContext {
  /** User */
  user: AuthUser;
}

/**
 * RouteHandler type
 * 
 * @typedef {Object} RouteHandler
 * @description Type definition for RouteHandler
 */
export type RouteHandler<T extends HandlerContext = HandlerContext> = (
  /** Request */
  request: NextRequest,
  /** Context */
  context: T,
) => Promise<NextResponse>;

/**
 * HandlerOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for HandlerOptions
 */
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
/**
 * Performs with error handler operation
 *
 * @param {RouteHandler<T>} handler - The handler
 *
 * @returns {Promise<any>} Promise resolving to witherrorhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withErrorHandler(handler);
 */

/**
 * Performs with error handler operation
 *
 * @param {RouteHandler<T>} /** Handler */
  handler - The /**  handler */
  handler
 *
 * @returns {Promise<any>} Promise resolving to witherrorhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * withErrorHandler(/** Handler */
  handler);
 */

/**
 * Performs with error handler operation
 *
 * @param {RouteHandler<T>} handler - The handler
 *
 * @returns {RouteHandler<T>} The witherrorhandler result
 *
 * @example
 * withErrorHandler(handler);
 */
export function withErrorHandler<T extends HandlerContext>(
  /** Handler */
  handler: RouteHandler<T>,
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
/**
 * Performs success response operation
 *
 * @returns {string} The successresponse result
 *
 * @example
 * successResponse();
 */

/**
 * Performs success response operation
 *
 * @returns {any} The successresponse result
 *
 * @example
 * successResponse();
 */

export function successResponse<T>(
  /** Data */
  data: T,
  /** Options */
  options?: {
    /** Status */
    status?: number;
    /** Message */
    message?: string;
    /** Meta */
    meta?: Record<string, any>;
  },
): NextResponse {
  const response: any = {
    /** Success */
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
/**
 * Performs error response operation
 *
 * @param {string} message - The message
 * @param {number} [status] - The status
 * @param {any} [details] - The details
 *
 * @returns {string} The errorresponse result
 *
 * @example
 * errorResponse("example", 123, details);
 */

/**
 * Performs error response operation
 *
 * @returns {string} The errorresponse result
 *
 * @example
 * errorResponse();
 */

export function errorResponse(
  /** Message */
  message: string,
  /** Status */
  status: number = 400,
  /** Details */
  details?: any,
): NextResponse {
  return NextResponse.json(
    {
      /** Success */
      success: false,
      /** Error */
      error: message,
      ...(details && { details }),
    },
    { status },
  );
}

/**
 * Create a paginated response
 */
/**
 * Performs paginated response operation
 *
 * @returns {number} The paginatedresponse result
 *
 * @example
 * paginatedResponse();
 */

/**
 * Performs paginated response operation
 *
 * @returns {any} The paginatedresponse result
 *
 * @example
 * paginatedResponse();
 */

export function paginatedResponse<T>(
  /** Data */
  data: T[],
  /** Pagination */
  pagination: {
    /** Total */
    total?: number;
    /** Limit */
    limit: number;
    /** Has Next Page */
    hasNextPage: boolean;
    /** Next Cursor */
    nextCursor?: string | null;
    /** Page */
    page?: number;
    /** Total Pages */
    totalPages?: number;
  },
): NextResponse {
  return NextResponse.json({
    /** Success */
    success: true,
    data,
    /** Count */
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
 * /**
 * Deletes 
 *
 * @param {any} *async(req - The *async(req
 * @param {any} ctx - The ctx
 *
 * @returns {Promise<any>} The delete result
 *
 * @example
 * DELETE(*async(req, ctx);
 */
/**
 * DELETE constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for delete
 */
export const DELETE = createHandler(
 *   async (req, ctx) => {
 *     await deleteResource(ctx.params.id);
 *     return successResponse({ deleted: true });
 *   },
 *   { roles: ['admin'] }
 * );
 */
/**
 * Creates a new handler
 *
 * @returns {any} The handler result
 *
 * @example
 * createHandler();
 */

/**
 * Creates a new handler
 *
 * @returns {any} The handler result
 *
 * @example
 * createHandler();
 */

export function createHandler<TAuth extends boolean = false>(
  /** Handler */
  handler: RouteHandler<
    TAuth extends true ? AuthenticatedContext : HandlerContext
  >,
  /** Options */
  options: HandlerOptions & { auth?: TAuth } = {},
): (
  /** Request */
  request: NextRequest,
  /** Context */
  context?: { params?: Promise<Record<strin/**
 * Performs require authentication operation
 *
 * @param {any} roles&&roles.length>0 - The roles&&roles.length>0
 *
 * @returns {Promise<any>} The requireauthentication result
 *
 */
g, string>> },
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
      /** User */
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

/**
 * CrudHandlerConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for CrudHandlerConfig
 */
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
/**
 * Creates a new crud handlers
 *
 * @param {CrudHandlerConfig<T>} config - The config
 *
 * @returns {any} The crudhandlers result
 *
 * @example
 * createCrudHandlers(config);
 */

/**
 * Creates a new crud handlers
 *
 * @param {CrudHandlerConfig<T>} config - The config
 *
 * @returns {any} The crudhandlers result
 *
 * @example
 * createCrudHandlers(con/**
 * Retrieves 
 *
 * @param {any} async(request - The async(request
 * @param {any} ctx - The ctx
 *
 * @returns {Promise<any>} The get result
 *
 */
fig);
 */

export function createCrudHandlers<T = any>(config: CrudHandlerConfig<T>) {
  const {
    collection,
    resourceName,
    transform = (id, data) => ({ id, ...data }),
    validate,
    canAccess = () => true,
    canModify = (user) => user.role ==/**
 * GET constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for get
 */
= "admin",
    allowedUpdateFields,
    requiredFields = [],
  } = config;

  // GET single resource
  const GET = createHandler(async (r/**
 * Performs p o s t operation
 *
 * @param {any} async(request - The async(request
 * @param {any} ctx - The ctx
 *
 * @returns {Promise<any>} The post result
 *
 */
equest, ctx) => {
    const { id } = ctx.params;
    if (!id) {
      throw new BadRequestError("ID is required");
    }

    const doc = await collection().doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError(`${resourceName} not found`);
    }

    const data = doc.data();

    // Che/**
 * POST constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for post
 */
ck access
    if (!canAccess(ctx.user, data)) {
      throw new NotFoundError(`${resourceName} not found`);
    }

    return successResponse(transform(doc.id, data));
  });

  // POST create resource
  const POST = createHandler(
    async (request, ctx) => {
      const body = ctx.body;

      // Validate required fields
      const missingFields = requiredFields.filter((f) => !body[f]);
      if (missingFields.length > 0) {
        throw new BadRequestError(
          `Missing required fields: ${missingFields.join(", ")}`,
        );
      }

      // Custom validation
      if (validate) {
        const errors = v/**
 * Performs p a t c h operation
 *
 * @param {any} async(request - The async(request
 * @param {any} ctx - The ctx
 *
 * @returns {Promise<any>} The patch result
 *
 */
alidate(body, false);
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

      const docRef = aw/**
 * PATCH constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for patch
 */
ait collection().add(docData);

      return successResponse(transform(docRef.id, docData), {
        /** Status */
        status: 201,
        /** Message */
        message: `${resourceName} created successfully`,
      });
    },
    { auth: true, parseBody: true },
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
        return errorResponse(
          "You don't have permission to modify this resource",
          403,
        );
      }

      const body = ctx.body;

      // Custom validation
      if (validate) {
        const errors = validate(body, true);
        if (errors && errors.length > 0) {
          throw new BadRequestError(errors.join(", "));
        /**
 * Deletes 
 *
 * @param {any} async(request - The async(request
 * @param {any} ctx - The ctx
 *
 * @returns {Promise<any>} The delete result
 *
 */
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
        updated_by: c/**
 * DELETE constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for delete
 */
tx.user.uid,
      };

      await collection().doc(id).update(updateData);

      // Fetch updated document
      const updatedDoc = await collection().doc(id).get();

      return successResponse(transform(updatedDoc.id, updatedDoc.data()), {
        /** Message */
        message: `${resourceName} updated successfully`,
      });
    },
    { auth: true, parseBody: true },
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
        return errorResponse(
          "You don't have permission to delete this resource",
          403,
        );
      }

      await collection().doc(id).delete();

      return successResponse(
        { deleted: true, id },
        { message: `${resourceName} deleted successfully` },
      );
    },
    { auth: true },
  );

  return { GET, POST, PATCH, DELETE };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Extract pagination params from search params
 */
/**
 * Retrieves pagination params
 *
 * @param {URLSearchParams} searchParams - The search params
 *
 * @returns {any} The paginationparams result
 *
 * @example
 * getPaginationParams(searchParams);
 */

/**
 * Retrieves pagination params
 *
 * @param {URLSearchParams} searchParams - The search params
 *
 * @returns {any} The paginationparams result
 *
 * @example
 * getPaginationParams(searchParams);
 */

export function getPaginationParams(searchParams: URLSearchParams) {
  return {
    /** Limit */
    limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
    /** Start After */
    start/**
 * Performs pagination keys operation
 *
 * @param {any} (value - The (value
 * @param {any} key - The key
 *
 * @returns {any} The paginationkeys result
 *
 */
After: searchParams.get("startAfter") || searchParams.get("cursor"),
    /** Page */
    page: parseInt(searchParams.get("page") || "1"),
    /** Sort By */
    sortBy: searchParams.get("sortBy") || "created_at",
    /** Sort Order */
    sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
  };
}

/**
 * Extract filter params from search params (excluding pagination params)
 */
/**
 * Retrieves filter params
 *
 * @param {URLSearchParams} searchParams - The search params
 * @param {string[]} allowedFilters - The allowed filters
 *
 * @returns {string} The filterparams result
 *
 * @example
 * getFilterParams(searchParams, allowedFilters);
 */

/**
 * Retrieves filter params
 *
 * @returns {string} The filterparams result
 *
 * @example
 * getFilterParams();
 */

export function getFilterParams(
  /** Search Params */
  searchParams: URLSearchParams,
  /** Allowed Filters */
  allowedFilters: string[],
): Record<string, string> {
  const filters: Record<string, string> = {};
  const paginationKeys = [
    "limit",
    "startAfter",
    "cursor",
    "page",
    "sortBy",
    "sortOrder",
  ];

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
