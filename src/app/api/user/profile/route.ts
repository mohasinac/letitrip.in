/**
 * User Profile API
 * 
 * Endpoints for updating user profile information
 */

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAuth } from '@/lib/api-middleware';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { updateProfileSchema, validateRequest } from '@/lib/validation';

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export const GET = withAuth(async (request: NextRequest, session) => {
  const userDoc = await adminDb.collection('users').doc(session.user.id).get();

  if (!userDoc.exists) {
    return ApiErrors.notFound('User');
  }

  const userData = userDoc.data();

  return successResponse({
    user: {
      uid: userDoc.id,
      email: userData?.email || null,
      phoneNumber: userData?.phoneNumber || null,
      displayName: userData?.displayName || null,
      photoURL: userData?.photoURL || null,
      role: userData?.role || 'user',
      emailVerified: userData?.emailVerified || false,
      createdAt: userData?.createdAt?.toDate?.() || new Date(),
      updatedAt: userData?.updatedAt?.toDate?.() || new Date(),
    },
  });
});

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
export const PUT = withAuth(async (request: NextRequest, session) => {
  const validation = await validateRequest(request, updateProfileSchema);

  if (!validation.success) {
    return ApiErrors.validationError(validation.details);
  }

  const { displayName, phoneNumber, photoURL } = validation.data;

  // Prepare update data
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (displayName !== undefined) updateData.displayName = displayName;
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (photoURL !== undefined) updateData.photoURL = photoURL;

  // Update Firestore
  await adminDb.collection('users').doc(session.user.id).update(updateData);

  return successResponse(
    {
      user: {
        ...updateData,
        uid: session.user.id,
      },
    },
    'Profile updated successfully'
  );
});
