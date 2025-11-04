/**
 * Error Handler Middleware
 * 
 * Centralized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

// ============================================================================
// Custom Error Classes
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'INTERNAL_ERROR');
    this.name = 'InternalServerError';
  }
}

// ============================================================================
// Response Helpers
// ============================================================================

export class ResponseHelper {
  static success<T>(data: T, message?: string, statusCode: number = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        ...(message && { message }),
      },
      { status: statusCode }
    );
  }

  static error(
    message: string,
    statusCode: number = 500,
    code?: string,
    errors?: Record<string, string[]>
  ) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: code || 'ERROR',
          ...(errors && { errors }),
        },
      },
      { status: statusCode }
    );
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ) {
    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
        ...(message && { message }),
      },
      { status: 200 }
    );
  }
}

// ============================================================================
// Error Handler Wrapper
// ============================================================================

type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse>;

/**
 * Wrap API route with error handling
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('[API Error]', error);

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });

        return ResponseHelper.error(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          errors
        );
      }

      // Handle custom API errors
      if (error instanceof ApiError) {
        return ResponseHelper.error(
          error.message,
          error.statusCode,
          error.code,
          error.errors
        );
      }

      // Handle Firebase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        const message = getFirebaseErrorMessage(firebaseError.code);
        return ResponseHelper.error(message, 500, firebaseError.code);
      }

      // Handle unknown errors
      const message = error instanceof Error ? error.message : 'Internal server error';
      return ResponseHelper.error(message, 500, 'INTERNAL_ERROR');
    }
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Invalid credentials',
    'auth/email-already-in-use': 'Email already in use',
    'auth/weak-password': 'Password is too weak',
    'auth/invalid-email': 'Invalid email address',
    'permission-denied': 'Permission denied',
    'not-found': 'Document not found',
    'already-exists': 'Document already exists',
    'resource-exhausted': 'Quota exceeded',
    'unauthenticated': 'Authentication required',
  };

  return messages[code] || 'An error occurred';
}
