import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';

/**
 * Helper function to verify seller authentication
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
 * Get shipment details
 * GET /api/seller/shipments/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Get shipment
    const shipmentSnap = await db.collection('shipments').doc(id).get();

    if (!shipmentSnap.exists) {
      throw new NotFoundError('Shipment not found');
    }

    const shipmentData = shipmentSnap.data()!;

    // Verify ownership (unless admin)
    if (seller.role !== 'admin' && shipmentData.sellerId !== seller.uid) {
      throw new AuthorizationError('Not your shipment');
    }

    // Format dates
    const shipment = {
      id: shipmentSnap.id,
      ...shipmentData,
      createdAt: shipmentData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: shipmentData.updatedAt?.toDate?.()?.toISOString() || null,
      shippedAt: shipmentData.shippedAt?.toDate?.()?.toISOString() || null,
      deliveredAt: shipmentData.deliveredAt?.toDate?.()?.toISOString() || null,
      trackingHistory: (shipmentData.trackingHistory || []).map(
        (event: any) => ({
          ...event,
          timestamp:
            event.timestamp?.toDate?.()?.toISOString() || event.timestamp,
        })
      ),
    };

    return NextResponse.json({
      success: true,
      data: shipment,
    });
  } catch (error: any) {
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

    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipment' },
      { status: 500 }
    );
  }
}
