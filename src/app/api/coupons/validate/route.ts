/**
 * Coupon Validation API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { couponService } from '@/lib/services/coupon';
import { getAdminAuth } from '@/lib/firebase/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// POST: Validate coupon
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const token = authHeader.split(' ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    const { code, cartItems, subtotal } = await request.json();

    if (!code || !cartItems || typeof subtotal !== 'number') {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.VALIDATION_ERROR },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const validationResult = await couponService.validateCoupon({
      code,
      userId: decodedToken.uid,
      cartItems,
      subtotal,
    });

    return NextResponse.json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
