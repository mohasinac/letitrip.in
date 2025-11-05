import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import {
  AuthorizationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';



/**
 * DELETE /api/seller/alerts/[id]
 * Delete a specific alert
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerSession(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Get alert
    const alertRef = db.collection('alerts').doc(id);
    const alertSnap = await alertRef.get();

    if (!alertSnap.exists) {
      throw new NotFoundError('Alert not found');
    }

    const alertData = alertSnap.data();

    // Verify ownership (unless admin)
    if (seller.role !== 'admin' && alertData?.sellerId !== seller.uid) {
      throw new AuthorizationError('Not your alert');
    }

    // Delete alert
    await alertRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
