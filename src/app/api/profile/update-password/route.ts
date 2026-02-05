/**
 * API Route: Update User Password
 * POST /api/profile/update-password
 * 
 * Updates authenticated user's password
 * Requires current password for verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/auth-server';
import { 
  ValidationError, 
  AuthenticationError, 
  handleApiError 
} from '@/lib/errors';
import { applyRateLimit } from '@/lib/security/rate-limit';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

// Validation schema
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitResult = await applyRateLimit(request, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many password change attempts. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      throw new AuthenticationError('Authentication required');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid input',
        validationResult.error.flatten().fieldErrors
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Check if user has email/password authentication
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new AuthenticationError('User not found in auth context');
    }

    const emailProvider = currentUser.providerData.find(
      (p) => p.providerId === 'password'
    );

    if (!emailProvider || !currentUser.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password change not available. You signed in with a social provider.',
        },
        { status: 400 }
      );
    }

    // Re-authenticate with current password
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new ValidationError('Current password is incorrect');
      }
      throw error;
    }

    // Update password
    await updatePassword(currentUser, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
