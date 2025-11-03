/**
 * User Account API Route - GET, PUT, DELETE
 * 
 * GET: Get account settings (self or admin)
 * PUT: Update account settings (self or admin)
 * DELETE: Delete account (self or admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { userController } from '../../_lib/controllers/user.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../../_lib/middleware/error-handler';

/**
 * GET /api/user/account
 * Protected endpoint - Get account settings
 * Authorization: Self or Admin
 */
export async function GET(request: NextRequest) {
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

    // Get account settings using controller
    const settings = await userController.getAccountSettings(user.userId, {
      uid: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      sellerId: userData?.sellerId,
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });

  } catch (error: any) {
    console.error('Error in GET /api/user/account:', error);
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch account settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/account
 * Protected endpoint - Update account settings
 * Authorization: Self or Admin
 */
export async function PUT(request: NextRequest) {
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

    // Fetch user data
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Update account settings using controller
    await userController.updateAccountSettings(
      user.userId,
      body,
      {
        uid: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        sellerId: userData?.sellerId,
        email: userData?.email,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Account settings updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/user/account:', error);
    
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

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update account settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/account
 * Protected endpoint - Delete user account
 * Authorization: Self or Admin
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Delete account using controller
    await userController.deleteAccount(user.userId, {
      uid: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      sellerId: userData?.sellerId,
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/user/account:', error);
    
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
