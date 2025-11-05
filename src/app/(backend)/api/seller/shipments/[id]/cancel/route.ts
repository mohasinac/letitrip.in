import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../../_lib/middleware/error-handler';



/**
 * Cancel shipment
 * POST /api/seller/shipments/[id]/cancel
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerSession(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Get shipment
    const shipmentRef = db.collection('shipments').doc(id);
    const shipmentSnap = await shipmentRef.get();

    if (!shipmentSnap.exists) {
      throw new NotFoundError('Shipment not found');
    }

    const shipmentData = shipmentSnap.data()!;

    // Verify ownership (unless admin)
    if (seller.role !== 'admin' && shipmentData.sellerId !== seller.uid) {
      throw new AuthorizationError('Not your shipment');
    }

    // Check if shipment can be cancelled
    const cancelableStatuses = ['pending', 'pickup_scheduled'];
    if (!cancelableStatuses.includes(shipmentData.status)) {
      throw new ValidationError('Shipment cannot be cancelled at this stage');
    }

    // Create tracking event
    const trackingEvent = {
      status: 'cancelled',
      location: '',
      description: reason || 'Shipment cancelled by seller',
      timestamp: new Date(),
    };

    // Update shipment
    await shipmentRef.update({
      status: 'cancelled',
      cancelReason: reason,
      updatedAt: new Date(),
      trackingHistory: FieldValue.arrayUnion(trackingEvent),
    });

    return NextResponse.json({
      success: true,
      message: 'Shipment cancelled successfully',
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

    console.error('Error cancelling shipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel shipment' },
      { status: 500 }
    );
  }
}
