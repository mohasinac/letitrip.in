/**
 * Seller Order Cancel API
 * POST /api/seller/orders/[id]/cancel - Cancel order
 * Rule: Sellers can only cancel within 3 days of payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { AuthorizationError, ValidationError, NotFoundError } from '../../../../_lib/middleware/error-handler';

/**
 * Verify seller authentication
 */


  

/**
 * POST /api/seller/orders/[id]/cancel
 * Cancel an order (Seller)
 * Rule: Sellers can only cancel within 3 days of payment
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify seller authentication
    const seller = await verifySellerSession(request);
    const sellerId = seller.uid;

    const { id: orderId } = await context.params;

    // Validate orderId
    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      throw new ValidationError('Invalid order ID');
    }

    const adminDb = getAdminDb();

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Get order document
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new NotFoundError('Order not found');
    }

    const orderData = orderDoc.data();

    // Verify order belongs to this seller (unless admin)
    if (seller.role !== 'admin' && orderData?.sellerId !== sellerId) {
      throw new AuthorizationError('Access denied');
    }

    // Check if order can be cancelled
    if (
      orderData?.status === 'delivered' ||
      orderData?.status === 'cancelled' ||
      orderData?.status === 'refunded'
    ) {
      throw new ValidationError('Cannot cancel delivered, refunded, or already cancelled orders');
    }

    // Check if payment was made and enforce 3-day rule (only for sellers, not admins)
    if (seller.role === 'seller' && orderData?.paidAt) {
      const paidAt =
        orderData.paidAt instanceof Timestamp
          ? orderData.paidAt.toDate()
          : new Date(orderData.paidAt);

      const now = new Date();
      const timeDiff = now.getTime() - paidAt.getTime();
      const daysSincePayment = timeDiff / (1000 * 60 * 60 * 24);

      if (daysSincePayment > 3) {
        throw new ValidationError(
          'Cancellation window expired. Sellers can only cancel orders within 3 days of payment. Please contact admin for assistance.'
        );
      }
    }

    // Update order status to cancelled
    await orderRef.update({
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: seller.role === 'admin' ? 'admin' : 'seller',
      cancellationReason: reason || `Cancelled by ${seller.role}`,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create alert for seller (if cancelled by admin)
    if (seller.role === 'admin' && orderData?.sellerId) {
      await adminDb.collection('alerts').add({
        sellerId: orderData.sellerId,
        orderId,
        orderNumber: orderData?.orderNumber,
        type: 'order_cancelled',
        title: 'Order Cancelled by Admin',
        message: `Order ${orderData?.orderNumber} has been cancelled by admin`,
        severity: 'warning',
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Create alert for customer
    if (orderData?.userId) {
      await adminDb.collection('alerts').add({
        userId: orderData.userId,
        orderId,
        orderNumber: orderData?.orderNumber,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Your order ${orderData?.orderNumber} has been cancelled`,
        severity: 'warning',
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Get updated order
    const updatedOrderDoc = await orderRef.get();
    const updatedOrder = {
      id: updatedOrderDoc.id,
      ...updatedOrderDoc.data(),
      createdAt: updatedOrderDoc.data()?.createdAt?.toDate?.(),
      updatedAt: updatedOrderDoc.data()?.updatedAt?.toDate?.(),
      cancelledAt: updatedOrderDoc.data()?.cancelledAt?.toDate?.(),
      paidAt: updatedOrderDoc.data()?.paidAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error in POST /api/seller/orders/[id]/cancel:', error);

    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
