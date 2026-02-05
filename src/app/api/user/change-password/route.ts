/**
 * Change Password API
 * 
 * Endpoint for authenticated users to change their password
 */

import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { sendPasswordChangedEmail } from '@/lib/email';
import { withAuth } from '@/lib/api-middleware';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { changePasswordSchema, validateRequest } from '@/lib/validation';
import bcrypt from 'bcryptjs';

/**
 * POST /api/user/change-password
 * Change user password
 */
export const POST = withAuth(async (request: NextRequest, session) => {
  const validation = await validateRequest(request, changePasswordSchema);

  if (!validation.success) {
    return ApiErrors.validationError(validation.details);
  }

  const { currentPassword, newPassword } = validation.data;

  // Get user document
  const userDoc = await adminDb.collection('users').doc(session.user.id).get();

  if (!userDoc.exists) {
    return ApiErrors.notFound('User');
  }

  const userData = userDoc.data();

  // Check if user has a password (not OAuth-only user)
  if (!userData?.passwordHash) {
    return ApiErrors.badRequest(
      'Password change not available for OAuth accounts'
    );
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(
    currentPassword,
    userData.passwordHash
  );

  if (!isValidPassword) {
    return ApiErrors.badRequest('Current password is incorrect');
  }

  // Check if new password is same as current
  if (currentPassword === newPassword) {
    return ApiErrors.badRequest(
      'New password must be different from current password'
    );
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update password in Firestore
  await adminDb.collection('users').doc(session.user.id).update({
    passwordHash: newPasswordHash,
    updatedAt: new Date(),
  });

  // Update password in Firebase Auth if user exists there
  try {
    await adminAuth.updateUser(session.user.id, {
      password: newPassword,
    });
  } catch (authError) {
    console.log(
      'Firebase Auth update skipped (user may not exist in Auth):',
      authError
    );
  }

  // Send password changed notification email
  if (userData?.email) {
    try {
      await sendPasswordChangedEmail(userData.email);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the request if notification email fails
    }
  }

  return successResponse(undefined, 'Password changed successfully');
});
