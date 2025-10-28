import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth/firebase-api-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        id: user.uid,
        uid: user.uid,
        email: user.email,
        name: user.userData?.name || user.userData?.displayName,
        phone: user.userData?.phone,
        role: user.role,
        isEmailVerified: user.userData?.isEmailVerified || false,
        isPhoneVerified: user.userData?.isPhoneVerified || false,
        addresses: user.userData?.addresses || [],
        profile: user.userData?.profile || {},
        createdAt: user.userData?.createdAt,
        updatedAt: user.userData?.updatedAt,
        lastLogin: user.userData?.lastLogin,
      },
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}
