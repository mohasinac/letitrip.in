/**
 * Auth Me API Route - GET
 * Session-based authentication with HTTP-only cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../_lib/auth/session';
import { getAdminDb } from '../../_lib/database/admin';

/**
 * GET /api/auth/me
 * Protected endpoint - Get current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from HTTP-only cookie
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data from Firestore
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(session.userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: session.userId,
        uid: session.userId,
        email: session.email,
        role: session.role,
        name: userData?.name,
        displayName: userData?.name,
        avatar: userData?.avatar,
        phone: userData?.phone,
        isEmailVerified: userData?.isEmailVerified,
        createdAt: userData?.createdAt,
        updatedAt: userData?.updatedAt,
      },
    });

  } catch (error: any) {
    console.error('Error in GET /api/auth/me:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get user information' },
      { status: 500 }
    );
  }
}
