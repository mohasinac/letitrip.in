/**
 * Razorpay Create Order API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/services/razorpay';
import { getAdminAuth } from '@/lib/firebase/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// POST: Create Razorpay order
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

    const { amount, currency, receipt, notes } = await request.json();

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!receipt || typeof receipt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Receipt is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Create Razorpay order
    const order = await razorpayService.createOrder({
      amount: Math.round(amount * 100), // Convert to paisa
      currency: currency || 'INR',
      receipt,
      notes: {
        ...notes,
        userId: decodedToken.uid,
      },
    });

    return NextResponse.json({
      success: true,
      data: order,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error: any) {
    console.error('Create Razorpay order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.PAYMENT_FAILED },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
