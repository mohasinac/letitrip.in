/**
 * Razorpay Create Order API Route
 * POST: Create a Razorpay order for checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrderHandler } from '../../../_lib/controllers/payment.controller';
import { authenticateUser } from '../../../_lib/auth/middleware';
import { ValidationError } from '../../../_lib/middleware/error-handler';

/**
 * POST /api/payment/razorpay/create-order
 * Protected endpoint - Create Razorpay order
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
    const { amount, currency = 'INR' } = body;

    // Fetch user data
    const { getAdminDb } = await import('../../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Create Razorpay order using controller
    const razorpayOrder = await createRazorpayOrderHandler(
      amount,
      currency,
      {
        userId: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        email: userData?.email,
      }
    );

    return NextResponse.json({
      success: true,
      data: razorpayOrder,
    });

  } catch (error: any) {
    console.error('Error in POST /api/payment/razorpay/create-order:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create Razorpay order',
      },
      { status: 500 }
    );
  }
}
