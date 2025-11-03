import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
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
 * Get shipping label
 * GET /api/seller/shipments/[id]/label
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
