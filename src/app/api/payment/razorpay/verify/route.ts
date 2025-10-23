/**
 * Razorpay Payment Verification API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/services/razorpay';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// POST: Verify Razorpay payment
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

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification data' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verify payment signature
    const isValidSignature = razorpayService.verifyPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPayment(razorpay_payment_id);

    // Update order status in database if orderId is provided
    if (orderId) {
      const db = getAdminDb();
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        paymentMethod: 'razorpay',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentDetails,
      },
    });
  } catch (error: any) {
    console.error('Verify Razorpay payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.PAYMENT_FAILED },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
