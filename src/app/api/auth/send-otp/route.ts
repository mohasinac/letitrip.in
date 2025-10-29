import { NextRequest, NextResponse } from 'next/server';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/database/config';
import { z } from 'zod';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const sendOTPSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Use international format (+1234567890)'),
  recaptchaToken: z.string().min(1, 'Recaptcha verification required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, recaptchaToken } = sendOTPSchema.parse(body);

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
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        verificationId,
        expiresIn: 300, // 5 minutes
      },
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Send OTP error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send OTP. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
