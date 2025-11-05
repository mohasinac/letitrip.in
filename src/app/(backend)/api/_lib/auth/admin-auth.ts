/**
 * Admin Authentication Helper
 * Session-based authentication for admin routes
 * 
 * Location: src/app/(backend)/api/_lib/auth/admin-auth.ts
 */

import { NextRequest } from 'next/server';
import { getSession, SessionData } from './session';
import { AuthorizationError } from '../middleware/error-handler';

/**
 * Verify admin authentication using session
 * Use this in admin API routes instead of Bearer token auth
 */
export async function verifyAdminSession(request: NextRequest): Promise<SessionData> {
  try {
    // Get session from HTTP-only cookie
    const session = await getSession();

    if (!session) {
      throw new AuthorizationError('Authentication required');
    }

    // Check if user has admin role
    if (session.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return session;
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      throw error;
    }
    throw new AuthorizationError('Invalid or expired session');
  }
}

/**
 * Verify seller or admin authentication using session
 */
export async function verifySellerSession(request: NextRequest): Promise<SessionData> {
  try {
    const session = await getSession();

    if (!session) {
      throw new AuthorizationError('Authentication required');
    }

    if (!['seller', 'admin'].includes(session.role)) {
      throw new AuthorizationError('Seller or Admin access required');
    }

    return session;
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      throw error;
    }
    throw new AuthorizationError('Invalid or expired session');
  }
}
