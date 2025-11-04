/**
 * Auth Send OTP API Route - POST
 * 
 * POST: Send OTP to phone number
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '../../_lib/controllers/auth.controller';
import { ValidationError } from '../../_lib/middleware/error-handler';

/**
 * POST /api/auth/send-otp
 * Public endpoint - Send OTP
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.phoneNumber && !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const phone = body.phoneNumber || body.phone;

    // Send OTP using controller
    const result = await sendOTP(phone);

    return NextResponse.json({
      success: true,
      message: result.message,
      // OTP returned in development only
      ...(result.otp && { otp: result.otp }),
    });

  } catch (error: any) {
    console.error('Error in POST /api/auth/send-otp:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
