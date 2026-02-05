/**
 * API Route: Add Phone Number
 * POST /api/profile/add-phone
 * 
 * Initiates phone number verification
 * Note: Actual OTP sending is handled client-side by Firebase Auth
 * This endpoint validates and stores the intent
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
import { applyRateLimit } from '@/lib/security/rate-limit';

// Validation schema
const addPhoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+[1-9]\d{9,14}$/, 'Phone number must include country code (e.g., +1234567890)'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 attempts per hour
    const rateLimitResult = await applyRateLimit(request, {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many phone verification attempts. Please try again later.',
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
    const validationResult = addPhoneSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid phone number',
        validationResult.error.flatten().fieldErrors
      );
    }

    const { phoneNumber } = validationResult.data;

    // Check if phone number already in use
    const existingUser = await userRepository.findByPhone(phoneNumber);
    if (existingUser && existingUser.uid !== user.uid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number already in use by another account',
        },
        { status: 409 }
      );
    }

    // Return success - actual linking happens client-side with Firebase Auth
    return NextResponse.json({
      success: true,
      message: 'Phone number validated. Proceed with OTP verification.',
      data: {
        phoneNumber,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
