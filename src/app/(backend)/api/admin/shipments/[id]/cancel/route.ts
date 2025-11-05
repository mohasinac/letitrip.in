/**
 * Admin Shipment Cancel API
 * POST /api/admin/shipments/[id]/cancel - Cancel a shipment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { AuthorizationError, ValidationError, NotFoundError } from '../../../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */


  

/**
 * POST /api/admin/shipments/[id]/cancel
 * Cancel a shipment
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await verifyAdminSession(request);

    // Await params (Next.js 15 requirement)
    const params = await context.params;
    const shipmentId = params.id;

    if (!shipmentId) {
      throw new ValidationError('Shipment ID is required');
    }

    const db = getAdminDb();
    const shipmentRef = db.collection('shipments').doc(shipmentId);

    // Get shipment
    const shipmentDoc = await shipmentRef.get();
    if (!shipmentDoc.exists) {
      throw new NotFoundError('Shipment not found');
    }

    const shipmentData = shipmentDoc.data();

    // Only allow cancellation of pending shipments
    if (shipmentData?.status !== 'pending') {
      throw new ValidationError('Only pending shipments can be cancelled');
    }

    // TODO: Integrate with actual shipping carrier API to cancel
    // For now, just update the status
    await shipmentRef.update({
      status: 'failed',
      updatedAt: new Date(),
      cancelledAt: new Date(),
      cancelledBy: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Shipment cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/shipments/[id]/cancel:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to cancel shipment' },
      { status: 500 }
    );
  }
}
