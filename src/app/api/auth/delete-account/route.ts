/**
 * Auth Delete Account API Route - DELETE, POST
 * 
 * DELETE/POST: Delete user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteAccount } from '../../_lib/controllers/auth.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import { AuthorizationError } from '../../_lib/middleware/error-handler';

/**
 * DELETE /api/auth/delete-account
 * Protected endpoint - Delete account
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Delete account using controller
    const result = await deleteAccount(user.userId, {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/auth/delete-account:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/delete-account
 * Alternative POST endpoint for account deletion
 */
export const POST = DELETE;
