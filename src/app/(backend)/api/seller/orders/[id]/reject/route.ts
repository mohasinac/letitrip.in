/**
 * Seller Order Reject API
 * POST /api/seller/orders/[id]/reject - Reject pending order
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { AuthorizationError, ValidationError, NotFoundError } from '../../../../_lib/middleware/error-handler';

/**
 * Verify seller authentication
 */
async function verifySellerAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'seller' && role !== 'admin') {
      throw new AuthorizationError('Seller access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'seller' | 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * POST /api/seller/orders/[id]/reject
 * Reject a pending order
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify seller authentication
    const seller = await verifySellerAuth(request);
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

    if (!reason || reason.trim().length === 0) {
      throw new ValidationError('Rejection reason is required');
    }

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

    // Check if order is in pending_approval status
    if (orderData?.status !== 'pending_approval') {
      throw new ValidationError('Only pending_approval orders can be rejected');
    }

    // Update order status to rejected
    await orderRef.update({
      status: 'rejected',
      rejectedAt: FieldValue.serverTimestamp(),
      rejectionReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create alert for seller
    await adminDb.collection('alerts').add({
      sellerId,
      orderId,
      orderNumber: orderData?.orderNumber,
      type: 'order_rejected',
      title: 'Order Rejected',
      message: `Order ${orderData?.orderNumber} has been rejected`,
      severity: 'error',
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Get updated order
    const updatedOrderDoc = await orderRef.get();
    const updatedOrder = {
      id: updatedOrderDoc.id,
      ...updatedOrderDoc.data(),
      createdAt: updatedOrderDoc.data()?.createdAt?.toDate?.(),
      updatedAt: updatedOrderDoc.data()?.updatedAt?.toDate?.(),
      rejectedAt: updatedOrderDoc.data()?.rejectedAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      message: 'Order rejected successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error in POST /api/seller/orders/[id]/reject:', error);

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
      { success: false, error: 'Failed to reject order' },
      { status: 500 }
    );
  }
}
