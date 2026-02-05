/**
 * API Route: Verify Phone Number
 * POST /api/profile/verify-phone
 * 
 * Confirms phone number verification after OTP is verified client-side
 * Updates user profile in Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/auth-server';
import { userRepository } from '@/repositories';
import {
  ValidationError,
  AuthenticationError,
  handleApiError,
} from '@/lib/errors';

// Validation schema
const verifyPhoneSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{9,14}$/, 'Invalid phone number format'),
  verified: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      throw new AuthenticationError('Authentication required');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyPhoneSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid input',
        validationResult.error.flatten().fieldErrors
      );
    }

    const { phoneNumber, verified } = validationResult.data;

    // Update user profile in Firestore
    await userRepository.update(user.uid, {
      phoneNumber,
      phoneVerified: verified,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        phoneNumber,
        verified,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
