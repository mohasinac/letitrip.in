import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  AuthorizationError,
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
 * PUT /api/seller/alerts/[id]/read
 * Mark alert as read/unread
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Parse body
    const body = await request.json();
    const { isRead = true } = body;

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

    // Update alert
    await alertRef.update({
      isRead,
      readAt: isRead ? Timestamp.now() : null,
    });

    return NextResponse.json({
      success: true,
      message: `Alert marked as ${isRead ? 'read' : 'unread'}`,
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error updating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
