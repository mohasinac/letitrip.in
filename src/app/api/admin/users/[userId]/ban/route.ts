/**
 * Admin User Ban API
 * PUT /api/admin/users/[userId]/ban - Ban or unban user
 */

import { NextRequest, NextResponse } from 'next/server';
import { userController } from '../../../../_lib/controllers/user.controller';
import { getAdminAuth } from '../../../../_lib/database/admin';
import { AuthorizationError, NotFoundError, ValidationError } from '../../../../_lib/middleware/error-handler';

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
 * PUT /api/admin/users/[userId]/ban
 * Ban or unban a user
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get user ID from params
    const { userId } = await context.params;

    // Parse request body
    const body = await request.json();
    const { isBanned } = body;

    if (typeof isBanned !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isBanned must be a boolean value' },
        { status: 400 }
      );
    }

    // Update ban status using controller
    const updatedUser = await userController.banUserAdmin(userId, isBanned, user);

    return NextResponse.json({
      success: true,
      message: isBanned ? 'User has been banned' : 'User has been unbanned',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users/[userId]/ban:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user ban status' },
      { status: 500 }
    );
  }
}

