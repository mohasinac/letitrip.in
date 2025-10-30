import { createApiHandler, successResponse, unauthorizedResponse, getCorsHeaders } from '@/lib/api';
import { verifyFirebaseToken } from '@/lib/auth/firebase-api-auth';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';

/**
 * Handle OPTIONS request for CORS preflight
 * REFACTORED: Uses standardized CORS utilities
 */
export async function OPTIONS() {
  return new Response(null, { headers: getCorsHeaders() });
}

/**
 * GET /api/auth/me
 * REFACTORED: Uses standardized API utilities
 */
export const GET = createApiHandler(async (request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorizedResponse('Not authenticated');
  }

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
    return successResponse({
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
    });
  }
  
  // Return full user data from Firestore
  return successResponse({
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
  });
});
