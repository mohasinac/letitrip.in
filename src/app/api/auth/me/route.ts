import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth/firebase-api-auth';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      const token = authHeader.substring(7);
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(token);
      
      // Get user data from Firestore
      const db = getAdminDb();
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();
      
      // If Firestore document doesn't exist yet, return basic Firebase user info
      // This handles race conditions during registration
      if (!userData) {
        console.log('Firestore user document not found for uid:', decodedToken.uid, '- returning Firebase data');
        return NextResponse.json({
          success: true,
          data: {
            id: decodedToken.uid,
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
            phone: null,
            role: 'user', // Default role
            isEmailVerified: decodedToken.email_verified || false,
            isPhoneVerified: false,
            addresses: [],
            profile: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
        }, { headers: corsHeaders });
      }
      
      // Return full user data from Firestore
      return NextResponse.json({
        success: true,
        data: {
          id: decodedToken.uid,
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: userData?.name || userData?.displayName,
          phone: userData?.phone,
          role: userData?.role || 'user',
          isEmailVerified: userData?.isEmailVerified || decodedToken.email_verified || false,
          isPhoneVerified: userData?.isPhoneVerified || false,
          addresses: userData?.addresses || [],
          profile: userData?.profile || {},
          createdAt: userData?.createdAt,
          updatedAt: userData?.updatedAt,
          lastLogin: userData?.lastLogin,
        },
      }, { headers: corsHeaders });

    } catch (error: any) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401, headers: corsHeaders }
      );
    }

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
