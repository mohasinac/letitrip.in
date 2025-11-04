/**
 * Seller Order Detail API
 * GET /api/seller/orders/[id] - Get order by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import { AuthorizationError, NotFoundError } from '../../../_lib/middleware/error-handler';

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
 * GET /api/seller/orders/[id]
 * Get a specific order by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify seller authentication
    const seller = await verifySellerAuth(request);
    const sellerId = seller.uid;

    const { id: orderId } = await context.params;
    const adminDb = getAdminDb();

    // Get order document
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new NotFoundError('Order not found');
    }

    const orderData = orderDoc.data();

    // Verify order belongs to this seller (unless admin)
    if (seller.role !== 'admin' && orderData?.sellerId !== sellerId) {
      throw new AuthorizationError('Access denied');
    }

    // Convert Firestore Timestamps to ISO strings for JSON serialization
    const sanitizedOrder = {
      id: orderDoc.id,
      ...orderData,
      createdAt: orderData?.createdAt?.toDate?.()
        ? orderData.createdAt.toDate().toISOString()
        : orderData?.createdAt || new Date().toISOString(),
      updatedAt: orderData?.updatedAt?.toDate?.()
        ? orderData.updatedAt.toDate().toISOString()
        : orderData?.updatedAt || new Date().toISOString(),
      approvedAt: orderData?.approvedAt?.toDate?.()
        ? orderData.approvedAt.toDate().toISOString()
        : orderData?.approvedAt,
      shippedAt: orderData?.shippedAt?.toDate?.()
        ? orderData.shippedAt.toDate().toISOString()
        : orderData?.shippedAt,
      deliveredAt: orderData?.deliveredAt?.toDate?.()
        ? orderData.deliveredAt.toDate().toISOString()
        : orderData?.deliveredAt,
      cancelledAt: orderData?.cancelledAt?.toDate?.()
        ? orderData.cancelledAt.toDate().toISOString()
        : orderData?.cancelledAt,
      paidAt: orderData?.paidAt?.toDate?.()
        ? orderData.paidAt.toDate().toISOString()
        : orderData?.paidAt,
      refundedAt: orderData?.refundedAt?.toDate?.()
        ? orderData.refundedAt.toDate().toISOString()
        : orderData?.refundedAt,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedOrder,
    });
  } catch (error: any) {
    console.error('Error in GET /api/seller/orders/[id]:', error);

    if (error instanceof AuthorizationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
