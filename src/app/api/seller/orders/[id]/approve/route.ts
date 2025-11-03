/**
 * Seller Order Approve API
 * POST /api/seller/orders/[id]/approve - Approve pending order
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
 * POST /api/seller/orders/[id]/approve
 * Approve a pending order
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
      throw new ValidationError('Only pending_approval orders can be approved');
    }

    // Update order status to approved and then processing
    await orderRef.update({
      status: 'processing',
      approvedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create alert for seller
    await adminDb.collection('alerts').add({
      sellerId,
      orderId,
      orderNumber: orderData?.orderNumber,
      type: 'order_approved',
      title: 'Order Approved',
      message: `Order ${orderData?.orderNumber} has been approved and moved to processing`,
      severity: 'success',
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
      approvedAt: updatedOrderDoc.data()?.approvedAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      message: 'Order approved successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error in POST /api/seller/orders/[id]/approve:', error);

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
      { success: false, error: 'Failed to approve order' },
      { status: 500 }
    );
  }
}
