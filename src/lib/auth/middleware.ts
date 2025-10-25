/**
 * API Middleware
 * Server-side authentication and request validation middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { ZodSchema } from 'zod';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * API Response helper
 */
export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );
  }

  static error(message: string, status = 400, errors?: any) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        errors,
      },
      { status }
    );
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message = 'Not found') {
    return this.error(message, 404);
  }

  static serverError(message = 'Internal server error') {
    return this.error(message, 500);
  }
}

/**
 * Authenticate user from JWT token in cookies or Authorization header
 */
export async function authenticateUser(request: NextRequest): Promise<JWTPayload | null> {
  // Try to get token from cookie first
  let token = request.cookies.get('auth_token')?.value;

  // If not in cookie, try Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Middleware to protect routes - requires authentication
 */
export function withAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await authenticateUser(request);

      if (!user) {
        return ApiResponse.unauthorized('Authentication required');
      }

      return handler(request, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return ApiResponse.serverError();
    }
  };
}

/**
 * Middleware to protect admin routes
 */
export function withAdmin(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await authenticateUser(request);

      if (!user) {
        return ApiResponse.unauthorized('Authentication required');
      }

      if (user.role !== 'admin') {
        return ApiResponse.forbidden('Admin access required');
      }

      return handler(request, user);
    } catch (error) {
      console.error('Admin middleware error:', error);
      return ApiResponse.serverError();
    }
  };
}

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: ApiResponse.error('Validation failed', 400, error.errors || error.message),
    };
  }
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit: number;
  private window: number;

  constructor(limit = 5000, windowMs = 15 * 60 * 1000) {
    this.limit = limit;
    this.window = windowMs;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter((timestamp) => now - timestamp < this.window);

    if (validRequests.length >= this.limit) {
      console.warn(`Rate limit exceeded for ${identifier}: ${validRequests.length}/${this.limit} requests`);
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Skip rate limiting in development
      if (process.env.NODE_ENV === 'development') {
        return handler(request);
      }

      const identifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';

      if (!rateLimiter.check(identifier)) {
        console.warn(`Rate limit exceeded for ${identifier} on ${request.method} ${request.url}`);
        return ApiResponse.error('Too many requests. Please try again later.', 429);
      }

      return handler(request);
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request to proceed
      return handler(request);
    }
  };
}
