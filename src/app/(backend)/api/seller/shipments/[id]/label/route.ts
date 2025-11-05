import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../../_lib/middleware/error-handler';



/**
 * Get shipping label
 * GET /api/seller/shipments/[id]/label
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

    // Check if label exists
    if (!shipmentData.shippingLabel) {
      throw new NotFoundError('Shipping label not yet generated');
    }

    // Return label URL
    return NextResponse.json({
      success: true,
      data: {
        labelUrl: shipmentData.shippingLabel,
        trackingNumber: shipmentData.trackingNumber,
        carrier: shipmentData.carrier,
      },
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

    console.error('Error fetching shipping label:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping label' },
      { status: 500 }
    );
  }
}
