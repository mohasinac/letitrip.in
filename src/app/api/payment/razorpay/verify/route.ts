/**
 * Razorpay Verify Payment API Route
 * POST: Verify Razorpay payment signature and update order
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayPaymentHandler } from '../../../_lib/controllers/payment.controller';
import { authenticateUser } from '../../../_lib/auth/middleware';
import { ValidationError } from '../../../_lib/middleware/error-handler';

/**
 * POST /api/payment/razorpay/verify
 * Protected endpoint - Verify Razorpay payment
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    // Fetch user data
    const { getAdminDb } = await import('../../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Verify payment using controller
    const result = await verifyRazorpayPaymentHandler(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      {
        userId: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        email: userData?.email,
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Payment verified successfully',
    });

  } catch (error: any) {
    console.error('Error in POST /api/payment/razorpay/verify:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to verify payment',
      },
      { status: 500 }
    );
  }
}
