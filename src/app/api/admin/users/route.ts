/**
 * Admin Users API
 * GET /api/admin/users - List all users
 */

import { NextRequest, NextResponse } from 'next/server';
import { userController } from '../../_lib/controllers/user.controller';
import { getAdminAuth } from '../../_lib/database/admin';
import { AuthorizationError } from '../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * GET /api/admin/users
 * List all users with optional role filter
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      role: (searchParams.get('role') as any) || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    // Get users using controller
    const result = await userController.getAllUsersAdmin(filters, user);

    return NextResponse.json(result.users);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}
