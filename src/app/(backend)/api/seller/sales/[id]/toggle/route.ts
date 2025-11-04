import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';
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
 * POST /api/seller/sales/[id]/toggle
 * Toggle sale status between active and inactive
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

    // Get sale document
    const docRef = db.collection('sales').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError('Sale not found');
    }

    const saleData = doc.data();

    // Verify ownership (unless admin)
    if (seller.role !== 'admin' && saleData?.sellerId !== seller.uid) {
      throw new AuthorizationError('Not your sale');
    }

    // Toggle status
    const currentStatus = saleData?.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Update status
    await docRef.update({
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: { status: newStatus },
      message: `Sale ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
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

    console.error('Error toggling sale status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle sale status' },
      { status: 500 }
    );
  }
}
