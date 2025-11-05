/**
 * Admin Shipment Track API
 * POST /api/admin/shipments/[id]/track - Update tracking information for a shipment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { AuthorizationError, ValidationError, NotFoundError } from '../../../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */


  

/**
 * POST /api/admin/shipments/[id]/track
 * Update tracking information for a shipment
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

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

    // TODO: Integrate with actual shipping carrier API (Shiprocket, etc.)
    // For now, just update the timestamp
    await shipmentRef.update({
      updatedAt: new Date(),
      lastTracked: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Tracking updated successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/shipments/[id]/track:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update tracking' },
      { status: 500 }
    );
  }
}
