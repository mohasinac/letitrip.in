/**
 * API Middleware Utilities
 * 
 * Reusable middleware functions for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ApiErrors } from '@/lib/api-response';
import { ExtendedSession } from '@/types/auth';

/**
 * Require authentication for an API route
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: ApiErrors.unauthorized(), session: null };
  }

  return { error: null, session: session as ExtendedSession };
}

/**
 * Wrapper for API routes with error handling
 */
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      return ApiErrors.internalError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };
}

/**
 * Wrapper for authenticated API routes
 */
export function withAuth(
  handler: (
    request: NextRequest,
    session: ExtendedSession
  ) => Promise<NextResponse>
) {
  return withErrorHandling(async (request: NextRequest) => {
    const { error, session } = await requireAuth(request);

    if (error || !session) {
      return error!;
    }

    return await handler(request, session);
  });
}
