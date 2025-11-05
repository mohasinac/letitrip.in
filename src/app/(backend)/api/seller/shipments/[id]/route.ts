import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';



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
    const seller = await verifySellerSession(request);
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
