/**
 * Razorpay Webhook Handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/services/razorpay';
import { getAdminDb } from '@/lib/database/admin';
import { HTTP_STATUS } from '@/lib/config/api';

// POST: Handle Razorpay webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verify webhook signature
    const isValidSignature = razorpayService.verifyWebhook(body, signature);
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.event, event.payload);

    const db = getAdminDb();

    // Handle different webhook events
    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity, db);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity, db);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity, db);
        break;

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity, event.payload.payment.entity, db);
        break;

      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity, db);
        break;

      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity, db);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

async function handlePaymentAuthorized(payment: any, db: any) {
  try {
    // Find order by payment ID or order ID
    const ordersSnapshot = await db
      .collection('orders')
      .where('razorpayOrderId', '==', payment.order_id)
      .limit(1)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'authorized',
        paymentId: payment.id,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Handle payment authorized error:', error);
  }
}

async function handlePaymentCaptured(payment: any, db: any) {
  try {
    const ordersSnapshot = await db
      .collection('orders')
      .where('razorpayOrderId', '==', payment.order_id)
      .limit(1)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentId: payment.id,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
}

async function handlePaymentFailed(payment: any, db: any) {
  try {
    const ordersSnapshot = await db
      .collection('orders')
      .where('razorpayOrderId', '==', payment.order_id)
      .limit(1)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'failed',
        status: 'cancelled',
        paymentId: payment.id,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
}

async function handleOrderPaid(order: any, payment: any, db: any) {
  try {
    const ordersSnapshot = await db
      .collection('orders')
      .where('razorpayOrderId', '==', order.id)
      .limit(1)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentId: payment.id,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Handle order paid error:', error);
  }
}

async function handleRefundCreated(refund: any, db: any) {
  try {
    // Log refund creation
    await db.collection('refunds').add({
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      status: 'created',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Handle refund created error:', error);
  }
}

async function handleRefundProcessed(refund: any, db: any) {
  try {
    // Update refund status
    const refundsSnapshot = await db
      .collection('refunds')
      .where('refundId', '==', refund.id)
      .limit(1)
      .get();

    if (!refundsSnapshot.empty) {
      const refundDoc = refundsSnapshot.docs[0];
      await refundDoc.ref.update({
        status: 'processed',
        updatedAt: new Date().toISOString(),
      });
    }

    // Update related order status
    const ordersSnapshot = await db
      .collection('orders')
      .where('paymentId', '==', refund.payment_id)
      .limit(1)
      .get();

    if (!ordersSnapshot.empty) {
      const orderDoc = ordersSnapshot.docs[0];
      await orderDoc.ref.update({
        paymentStatus: 'refunded',
        status: 'refunded',
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Handle refund processed error:', error);
  }
}
