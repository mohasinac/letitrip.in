/**
 * API Middleware Utilities
 *
 * Reusable middleware functions for API routes
 *
 * TODO - Phase 2 Refactoring:
 * - Implement rate limiting with Redis
 * - Add request logging with structured logs
 * - Add performance monitoring (response time tracking)
 * - Implement request ID generation for tracing
 * - Add CORS handling for specific origins
 * - Implement request/response compression
 * - Add API key authentication support
 * - Implement webhook signature verification
 * - Add GraphQL middleware support
 */

import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { validateRequestBody, formatZodErrors } from "@/lib/validation/schemas";
// import { requireAuth, requireRole } from '@/lib/security/authorization';
// import { handleApiError } from '@/lib/errors';
// import { Logger } from '@/classes/Logger';

// ============================================
// TYPES
// ============================================

/**
 * API route handler type
 */
export type ApiRouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> },
) => Promise<NextResponse>;

/**
 * Middleware function type
 */
export type ApiMiddleware = (
  request: NextRequest,
  context?: { params: Record<string, string> },
) => Promise<NextResponse | void>;

/**
 * Middleware options
 */
export interface MiddlewareOptions {
  requireAuth?: boolean;
  requireRoles?: string[];
  validateBody?: z.ZodSchema;
  validateQuery?: z.ZodSchema;
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
}

// ============================================
// MIDDLEWARE FACTORY
// ============================================

/**
 * Create a middleware chain for API routes
 *
 * TODO - Phase 2:
 * - Add middleware composition utilities
 * - Add error recovery strategies
 * - Add middleware profiling
 *
 * @example
 * ```ts
 * const handler = withMiddleware(
 *   async (req) => {
 *     const products = await productRepository.findAll();
 *     return NextResponse.json({ success: true, data: products });
 *   },
 *   {
 *     requireAuth: true,
 *     requireRoles: ['admin'],
 *     validateQuery: productListQuerySchema,
 *   }
 * );
 * ```
 */
export function withMiddleware(
  handler: ApiRouteHandler,
  options: MiddlewareOptions = {},
): ApiRouteHandler {
  return async (
    request: NextRequest,
    context?: { params: Record<string, string> },
  ) => {
    try {
      // TODO - Phase 2: Implement authentication check
      // if (options.requireAuth) {
      //   const user = await requireAuth(request);
      //   if (!user) {
      //     return NextResponse.json(
      //       { success: false, error: 'Authentication required' },
      //       { status: 401 }
      //     );
      //   }
      //
      //   // Check role requirements
      //   if (options.requireRoles && options.requireRoles.length > 0) {
      //     const hasRole = options.requireRoles.includes(user.role);
      //     if (!hasRole) {
      //       return NextResponse.json(
      //         { success: false, error: 'Insufficient permissions' },
      //         { status: 403 }
      //       );
      //     }
      //   }
      // }

      // TODO - Phase 2: Implement request body validation
      // if (options.validateBody && request.method !== 'GET') {
      //   const body = await request.json();
      //   const validation = validateRequestBody(options.validateBody, body);
      //
      //   if (!validation.success) {
      //     return NextResponse.json(
      //       {
      //         success: false,
      //         error: 'Validation failed',
      //         fields: formatZodErrors(validation.errors),
      //       },
      //       { status: 400 }
      //     );
      //   }
      //
      //   // Attach validated data to request (extend NextRequest type)
      //   (request as any).validatedBody = validation.data;
      // }

      // TODO - Phase 2: Implement query parameter validation
      // if (options.validateQuery) {
      //   const { searchParams } = new URL(request.url);
      //   const query = Object.fromEntries(searchParams.entries());
      //   const validation = validateRequestBody(options.validateQuery, query);
      //
      //   if (!validation.success) {
      //     return NextResponse.json(
      //       {
      //         success: false,
      //         error: 'Invalid query parameters',
      //         fields: formatZodErrors(validation.errors),
      //       },
      //       { status: 400 }
      //     );
      //   }
      //
      //   // Attach validated query to request
      //   (request as any).validatedQuery = validation.data;
      // }

      // TODO - Phase 2: Implement rate limiting
      // if (options.rateLimit) {
      //   const isRateLimited = await checkRateLimit(
      //     request,
      //     options.rateLimit.requests,
      //     options.rateLimit.window
      //   );
      //
      //   if (isRateLimited) {
      //     return NextResponse.json(
      //       { success: false, error: 'Rate limit exceeded' },
      //       {
      //         status: 429,
      //         headers: {
      //           'Retry-After': options.rateLimit.window.toString(),
      //         },
      //       }
      //     );
      //   }
      // }

      // Execute the actual handler
      return await handler(request, context);
    } catch (error) {
      // TODO - Phase 2: Use centralized error handler
      console.error("Middleware error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

// ============================================
// INDIVIDUAL MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Authentication middleware
 * TODO - Phase 2: Implement with Firebase Admin SDK
 */
export async function authMiddleware(
  request: NextRequest,
): Promise<NextResponse | void> {
  // TODO: Implement authentication check
  // const token = request.cookies.get('__session')?.value;
  // if (!token) {
  //   return NextResponse.json(
  //     { success: false, error: 'Authentication required' },
  //     { status: 401 }
  //   );
  // }
  //
  // try {
  //   const decodedToken = await admin.auth().verifySessionCookie(token);
  //   // Attach user to request
  //   (request as any).user = decodedToken;
  // } catch (error) {
  //   return NextResponse.json(
  //     { success: false, error: 'Invalid or expired token' },
  //     { status: 401 }
  //   );
  // }
}

/**
 * Role-based authorization middleware
 * TODO - Phase 2: Implement role checking
 */
export function requireRoleMiddleware(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | void> => {
    // TODO: Check user role
    // const user = (request as any).user;
    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }
    //
    // if (!allowedRoles.includes(user.role)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Insufficient permissions' },
    //     { status: 403 }
    //   );
    // }
  };
}

/**
 * Request validation middleware
 * TODO - Phase 2: Implement with Zod schemas
 */
export function validateBodyMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<NextResponse | void> => {
    // TODO: Validate request body
    // try {
    //   const body = await request.json();
    //   const validation = validateRequestBody(schema, body);
    //
    //   if (!validation.success) {
    //     return NextResponse.json(
    //       {
    //         success: false,
    //         error: 'Validation failed',
    //         fields: formatZodErrors(validation.errors),
    //       },
    //       { status: 400 }
    //     );
    //   }
    //
    //   // Attach validated data
    //   (request as any).validatedBody = validation.data;
    // } catch (error) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid JSON body' },
    //     { status: 400 }
    //   );
    // }
  };
}

/**
 * Rate limiting middleware
 * TODO - Phase 2: Implement with Redis/in-memory store
 */
export function rateLimitMiddleware(requests: number, windowSeconds: number) {
  return async (request: NextRequest): Promise<NextResponse | void> => {
    // TODO: Implement rate limiting
    // const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    // const key = `ratelimit:${identifier}:${request.nextUrl.pathname}`;
    //
    // const current = await redis.incr(key);
    // if (current === 1) {
    //   await redis.expire(key, windowSeconds);
    // }
    //
    // if (current > requests) {
    //   return NextResponse.json(
    //     { success: false, error: 'Rate limit exceeded' },
    //     {
    //       status: 429,
    //       headers: {
    //         'Retry-After': windowSeconds.toString(),
    //         'X-RateLimit-Limit': requests.toString(),
    //         'X-RateLimit-Remaining': '0',
    //         'X-RateLimit-Reset': (Date.now() + windowSeconds * 1000).toString(),
    //       },
    //     }
    //   );
    // }
    //
    // // Add rate limit headers
    // const remaining = requests - current;
    // // TODO: Attach headers to response
  };
}

/**
 * CORS middleware
 * TODO - Phase 2: Implement CORS handling
 */
export function corsMiddleware(allowedOrigins: string[] = ["*"]) {
  return async (request: NextRequest): Promise<NextResponse | void> => {
    // TODO: Implement CORS
    // const origin = request.headers.get('origin');
    //
    // // Handle preflight requests
    // if (request.method === 'OPTIONS') {
    //   return new NextResponse(null, {
    //     status: 204,
    //     headers: {
    //       'Access-Control-Allow-Origin': origin || '*',
    //       'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    //       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    //       'Access-Control-Max-Age': '86400',
    //     },
    //   });
    // }
  };
}

/**
 * Request logging middleware
 * TODO - Phase 2: Implement structured logging
 */
export async function loggingMiddleware(request: NextRequest): Promise<void> {
  // TODO: Implement request logging
  // const logger = Logger.getInstance();
  // const requestId = crypto.randomUUID();
  //
  // logger.info('API Request', {
  //   requestId,
  //   method: request.method,
  //   url: request.url,
  //   userAgent: request.headers.get('user-agent'),
  //   ip: request.ip,
  //   timestamp: new Date().toISOString(),
  // });
  //
  // // Attach request ID for tracing
  // (request as any).requestId = requestId;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extract user from request
 * TODO - Phase 2: Implement user extraction from token
 */
export async function getUserFromRequest(
  request: NextRequest,
): Promise<any | null> {
  // TODO: Extract and verify user from session cookie
  // const token = request.cookies.get('__session')?.value;
  // if (!token) return null;
  //
  // try {
  //   const decodedToken = await admin.auth().verifySessionCookie(token);
  //   const user = await userRepository.findById(decodedToken.uid);
  //   return user;
  // } catch (error) {
  //   return null;
  // }
  return null;
}

/**
 * Parse and validate query parameters
 * TODO - Phase 2: Implement query parsing with Zod
 */
export function parseQuery<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
): T | null {
  // TODO: Parse and validate query parameters
  // const { searchParams } = new URL(request.url);
  // const query = Object.fromEntries(searchParams.entries());
  // const validation = validateRequestBody(schema, query);
  //
  // if (!validation.success) {
  //   return null;
  // }
  //
  // return validation.data;
  return null as any;
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Create error response
 */
export function errorResponse(
  error: string,
  status = 500,
  details?: unknown,
): NextResponse {
  return NextResponse.json({ success: false, error, details }, { status });
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  },
  status = 200,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        ...meta,
        totalPages: Math.ceil(meta.total / meta.limit),
      },
    },
    { status },
  );
}
