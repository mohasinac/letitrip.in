/**
 * User Preferences API Route - GET, PUT
 * 
 * GET: Get user preferences (self or admin)
 * PUT: Update user preferences (self or admin)
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
 * GET /api/user/preferences
 * Protected endpoint - Get user preferences
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

    // Get preferences using controller
    const preferences = await userController.getUserPreferences(user.userId, {
      uid: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      sellerId: userData?.sellerId,
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: preferences,
    });

  } catch (error: any) {
    console.error('Error in GET /api/user/preferences:', error);
    
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
      { success: false, error: error.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Protected endpoint - Update user preferences
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

    // Update preferences using controller
    await userController.updateUserPreferences(
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
      message: 'Preferences updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/user/preferences:', error);
    
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
      { success: false, error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
