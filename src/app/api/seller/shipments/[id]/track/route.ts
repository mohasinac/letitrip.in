import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { FieldValue } from 'firebase-admin/firestore';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../../_lib/middleware/error-handler';

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
 * Add tracking update to shipment
 * POST /api/seller/shipments/[id]/track
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Parse request body
    const body = await request.json();
    const { status, location, description } = body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

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

    // Create tracking event
    const trackingEvent = {
      status,
      location: location || '',
      description: description || `Shipment ${status.replace(/_/g, ' ')}`,
      timestamp: new Date(),
    };

    // Update shipment
    const updateData: any = {
      status,
      updatedAt: new Date(),
      trackingHistory: FieldValue.arrayUnion(trackingEvent),
    };

    // Update specific timestamps based on status
    if (status === 'in_transit' && !shipmentData.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered' && !shipmentData.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await shipmentRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Tracking updated successfully',
      data: trackingEvent,
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

    console.error('Error updating tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tracking' },
      { status: 500 }
    );
  }
}
