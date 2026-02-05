/**
 * Password Reset API
 * 
 * Endpoints for requesting and completing password resets
 */

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendPasswordResetEmail } from '@/lib/email';
import { withErrorHandling } from '@/lib/api-middleware';
import { successResponse, ApiErrors } from '@/lib/api-response';
import {
  requestResetSchema,
  resetPasswordSchema,
  validateRequest,
} from '@/lib/validation';
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  markPasswordResetTokenAsUsed,
  deleteToken,
} from '@/lib/tokens';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/reset-password/request
 * Request a password reset (send reset link to email)
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, requestResetSchema);

  if (!validation.success) {
    return ApiErrors.validationError(validation.details);
  }

  const { email } = validation.data;

  // Find user by email
  const usersSnapshot = await adminDb
    .collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  // Always return success to not reveal email existence
  const successMessage =
    'If an account exists with that email, a password reset link has been sent.';

  if (usersSnapshot.empty) {
    return successResponse(undefined, successMessage);
  }

  const userDoc = usersSnapshot.docs[0];
  const userData = userDoc.data();

  // Check if user has password (not OAuth-only)
  if (!userData?.passwordHash) {
    return successResponse(undefined, successMessage);
  }

  // Generate reset token
  const token = await createPasswordResetToken(userDoc.id, email);

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, token);
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
    await deleteToken('passwordResetTokens', token);
    // Still return success to not reveal email existence
    return successResponse(undefined, successMessage);
  }

  return successResponse(undefined, successMessage);
});

/**
 * PUT /api/auth/reset-password/confirm
 * Complete password reset using token
 */
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, resetPasswordSchema);

  if (!validation.success) {
    return ApiErrors.validationError(validation.details);
  }

  const { token, newPassword } = validation.data;

  // Verify token
  const result = await verifyPasswordResetToken(token);

  if (!result.valid) {
    return ApiErrors.badRequest(result.error || 'Invalid token');
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update user's password
  await adminDb.collection('users').doc(result.userId!).update({
    passwordHash: newPasswordHash,
    updatedAt: new Date(),
  });

  // Mark token as used
  await markPasswordResetTokenAsUsed(token);

  return successResponse(undefined, 'Password reset successfully');
});
