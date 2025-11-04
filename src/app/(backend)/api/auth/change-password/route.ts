/**
 * Auth Change Password API Route - POST
 * 
 * POST: Change user's password
 */

import { NextRequest, NextResponse } from 'next/server';
import { changePassword } from '../../_lib/controllers/auth.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import {
  ValidationError,
  AuthorizationError,
} from '../../_lib/middleware/error-handler';

/**
 * POST /api/auth/change-password
 * Protected endpoint - Change password
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is required' },
        { status: 400 }
      );
    }

    if (!body.newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Change password using controller
    const result = await changePassword(
      user.userId,
      {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      },
      {
        userId: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        email: userData?.email,
      }
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error: any) {
    console.error('Error in POST /api/auth/change-password:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
