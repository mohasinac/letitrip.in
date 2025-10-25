/**
 * Legacy API Response helper
 * Used by a few remaining API routes - consider migrating to @/lib/api/middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { ZodSchema } from 'zod';

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
 * Simple rate limiting middleware (in-memory)
 * Note: Use Redis/Upstash for production
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
    const validRequests = userRequests.filter((timestamp) => now - timestamp < this.window);

    if (validRequests.length >= this.limit) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return handler(request);
    }

    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    if (!rateLimiter.check(identifier)) {
      return ApiResponse.error('Too many requests. Please try again later.', 429);
    }

    return handler(request);
  };
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

