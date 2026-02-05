/**
 * Email Verification API
 * 
 * Endpoints for sending and verifying email verification links
 */

import { NextRequest } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { sendVerificationEmail } from '@/lib/email';
import { withAuth, withErrorHandling } from '@/lib/api-middleware';
import { successResponse, ApiErrors } from '@/lib/api-response';
import {
  createVerificationToken,
  verifyEmailToken,
  deleteToken,
} from '@/lib/tokens';

/**
 * POST /api/auth/send-verification
 * Send email verification link to current user
 */
export const POST = withAuth(async (request: NextRequest, session) => {
  const userDoc = await adminDb.collection('users').doc(session.user.id).get();

  if (!userDoc.exists) {
    return ApiErrors.notFound('User');
  }

  const userData = userDoc.data();
  const email = userData?.email;

  if (!email) {
    return ApiErrors.badRequest('No email address associated with this account');
  }

  if (userData?.emailVerified) {
    return ApiErrors.badRequest('Email is already verified');
  }

  // Generate verification token
  const token = await createVerificationToken(session.user.id, email);

  // Send verification email
  try {
    await sendVerificationEmail(email, token);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    await deleteToken('emailVerificationTokens', token);
    return ApiErrors.internalError('Failed to send verification email. Please try again.');
  }

  return successResponse(undefined, 'Verification email sent successfully');
});

/**
 * GET /api/auth/verify-email
 * Verify email using token
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return ApiErrors.badRequest('Token is required');
  }

  // Verify token
  const result = await verifyEmailToken(token);

  if (!result.valid) {
    return ApiErrors.badRequest(result.error || 'Invalid token');
  }

  // Update user's emailVerified status
  await adminDb.collection('users').doc(result.userId!).update({
    emailVerified: true,
    updatedAt: new Date(),
  });

  // Update Firebase Auth user
  try {
    await adminAuth.updateUser(result.userId!, {
      emailVerified: true,
    });
  } catch (authError) {
    console.log('Firebase Auth update skipped:', authError);
  }

  return successResponse(undefined, 'Email verified successfully');
});
