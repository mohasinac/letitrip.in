/**
 * Session-based Authentication Middleware for API Routes
 * Validates HTTP-only session cookies
 * 
 * Location: src/app/(backend)/api/_lib/auth/session-middleware.ts
 * Following backend architecture conventions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSessionFromRequest, SessionData } from './session';

export interface AuthMiddlewareOptions {
  requireAdmin?: boolean;
  requireSeller?: boolean;
  requireAuth?: boolean;
}

/**
 * Authentication middleware for API routes using sessions
 * Returns the authenticated user or error response
 */
export async function withSessionAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = { requireAuth: true }
): Promise<
  { session: SessionData; error?: never } | { session?: never; error: NextResponse }
> {
  try {
    // Get session from HTTP-only cookie
    const session = await getSession();

    // Check if user is authenticated
    if (options.requireAuth && !session) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    if (!session) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    // Check admin role requirement
    if (options.requireAdmin && session.role !== 'admin') {
      return {
        error: NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        ),
      };
    }

    // Check seller role requirement
    if (options.requireSeller && !['seller', 'admin'].includes(session.role)) {
      return {
        error: NextResponse.json(
          { success: false, error: 'Seller or Admin access required' },
          { status: 403 }
        ),
      };
    }

    return { session };
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Verify session from request (for middleware.ts)
 */
export function verifySession(request: NextRequest): SessionData | null {
  return getSessionFromRequest(request);
}

/**
 * Helper to require authentication
 */
export async function requireAuthentication(
  request: NextRequest
): Promise<SessionData | NextResponse> {
  const result = await withSessionAuth(request);
  
  if (result.error) {
    return result.error;
  }
  
  return result.session;
}

/**
 * Helper to require admin role
 */
export async function requireAdmin(
  request: NextRequest
): Promise<SessionData | NextResponse> {
  const result = await withSessionAuth(request, { requireAdmin: true });
  
  if (result.error) {
    return result.error;
  }
  
  return result.session;
}

/**
 * Helper to require seller role
 */
export async function requireSeller(
  request: NextRequest
): Promise<SessionData | NextResponse> {
  const result = await withSessionAuth(request, { requireSeller: true });
  
  if (result.error) {
    return result.error;
  }
  
  return result.session;
}
