/**
 * PayPal Capture Payment API Route
 * POST: Capture PayPal payment and update order
 */

import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalPaymentHandler } from '../../../_lib/controllers/payment.controller';
import { authenticateUser } from '../../../_lib/auth/middleware';
import { ValidationError } from '../../../_lib/middleware/error-handler';

/**
 * POST /api/payment/paypal/capture
 * Protected endpoint - Capture PayPal payment
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
    const { paypalOrderId, orderId } = body;

    // Fetch user data
    const { getAdminDb } = await import('../../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Capture payment using controller
    const result = await capturePayPalPaymentHandler(
      paypalOrderId,
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
      message: 'Payment captured successfully',
    });

  } catch (error: any) {
    console.error('Error in POST /api/payment/paypal/capture:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to capture payment',
      },
      { status: 500 }
    );
  }
}
