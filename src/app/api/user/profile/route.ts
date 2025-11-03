/**
 * User Profile API Route - GET, PUT
 * 
 * GET: Get user profile (self or admin)
 * PUT: Update user profile (self or admin)
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
 * GET /api/user/profile
 * Protected endpoint - Get user profile
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

    // Get profile using controller
    const profile = await userController.getUserProfile(user.userId, {
      uid: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      sellerId: userData?.sellerId,
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        uid: user.userId,
        ...profile,
      },
    });

  } catch (error: any) {
    console.error('Error in GET /api/user/profile:', error);
    
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
      { success: false, error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Protected endpoint - Update user profile
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

    // Update profile using controller
    const updatedProfile = await userController.updateUserProfile(
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
      data: {
        uid: user.userId,
        ...updatedProfile,
      },
      message: 'Profile updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/user/profile:', error);
    
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
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
