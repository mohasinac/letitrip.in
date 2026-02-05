/**
 * Centralized Error Handler
 * 
 * Handles all errors consistently across the application.
 * Provides formatted responses for API routes and logging for unexpected errors.
 * 
 * @example
 * ```ts
 * import { handleApiError } from '@/lib/errors';
 * 
 * export async function GET() {
 *   try {
 *     // ... your code
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 */

import { NextResponse } from 'next/server';
import { AppError } from './base-error';
import { ERROR_CODES, ERROR_MESSAGES } from './error-codes';

/**
 * Handle API errors with consistent response format
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      error.toJSON(),
      { status: error.statusCode }
    );
  }

  // Handle validation errors (Zod, etc.)
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: ERROR_CODES.VALIDATION_INVALID_INPUT,
        data: error,
      },
      { status: 400 }
    );
  }

  // Log unexpected errors for debugging
  console.error('Unexpected error:', error);

  // Return generic error response
  return NextResponse.json(
    {
      success: false,
      error: ERROR_MESSAGES[ERROR_CODES.GEN_INTERNAL_ERROR],
      code: ERROR_CODES.GEN_INTERNAL_ERROR,
    },
    { status: 500 }
  );
}

/**
 * Log errors with context
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    ...(context && { context }),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  console.error('[Error]', JSON.stringify(errorInfo, null, 2));
}

/**
 * Check if error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
