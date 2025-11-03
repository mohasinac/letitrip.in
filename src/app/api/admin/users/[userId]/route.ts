/**
 * Admin User By ID API
 * GET /api/admin/users/[userId] - Get user by ID
 * PUT /api/admin/users/[userId] - Update user
 */

import { NextRequest, NextResponse } from 'next/server';
import { userController } from '../../../_lib/controllers/user.controller';
import { getAdminAuth } from '../../../_lib/database/admin';
import { AuthorizationError, NotFoundError, ValidationError } from '../../../_lib/middleware/error-handler';

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
 * GET /api/admin/users/[userId]
 * Get specific user by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get user ID from params
    const { userId } = await context.params;

    // Get user using controller
    const targetUser = await userController.getUserByIdAdmin(userId, user);

    return NextResponse.json(targetUser);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users/[userId]:', error);

    if (error instanceof AuthorizationError) {
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
      { success: false, error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[userId]
 * Update user details (role, ban status, etc.)
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

    // Update user using controller
    const updatedUser = await userController.updateUserAdmin(userId, body, user);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users/[userId]:', error);

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
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
