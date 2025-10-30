import { createApiHandler, successResponse, validationErrorResponse, errorResponse, getCorsHeaders, HTTP_STATUS } from '@/lib/api';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/database/config';
import { z } from 'zod';

/**
 * Handle OPTIONS request for CORS preflight
 * REFACTORED: Uses standardized CORS utilities
 */
export async function OPTIONS() {
  return new Response(null, { headers: getCorsHeaders() });
}

const sendOTPSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Use international format (+1234567890)'),
  recaptchaToken: z.string().min(1, 'Recaptcha verification required'),
});

/**
 * POST /api/auth/send-otp
 * REFACTORED: Uses standardized API utilities
 */
export const POST = createApiHandler(async (request) => {
  const body = await request.json();
  
  // Validate input
  const validation = sendOTPSchema.safeParse(body);
  if (!validation.success) {
    return validationErrorResponse(validation.error);
  }

  const { phoneNumber, recaptchaToken } = validation.data;

  // In a real implementation, you would verify the recaptcha token here
  // For now, we'll assume it's valid

  // Store verification ID in session or temporary storage
  // This is a simplified approach - in production, use proper session management
  const verificationId = `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In a real app, you would:
  // 1. Verify recaptcha token with Google
  // 2. Send actual SMS via Firebase Auth
  // 3. Store verification ID securely
  
  // For demo purposes, we'll simulate the process
  console.log(`Sending OTP to ${phoneNumber}`);
  
  return successResponse(
    {
      verificationId,
      expiresIn: 300, // 5 minutes
    },
    'OTP sent successfully'
  );
});
