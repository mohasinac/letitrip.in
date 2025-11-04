import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  AuthorizationError,
  ValidationError,
} from '../../../_lib/middleware/error-handler';

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
 * POST /api/seller/alerts/bulk-read
 * Mark multiple alerts as read
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const db = getAdminDb();

    // Parse body
    const body = await request.json();
    const { alertIds = [] } = body;

    // Validate
    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      throw new ValidationError('No alert IDs provided');
    }

    if (alertIds.length > 500) {
      throw new ValidationError('Maximum 500 alerts can be updated at once');
    }

    // Process alerts in batch
    const batch = db.batch();
    let updatedCount = 0;

    for (const alertId of alertIds) {
      const alertRef = db.collection('alerts').doc(alertId);
      const alertSnap = await alertRef.get();

      // Skip if doesn't exist
      if (!alertSnap.exists) {
        continue;
      }

      const alertData = alertSnap.data();

      // Skip if not owned by seller (unless admin)
      if (seller.role !== 'admin' && alertData?.sellerId !== seller.uid) {
        continue;
      }

      // Add to batch
      batch.update(alertRef, {
        isRead: true,
        readAt: Timestamp.now(),
      });
      updatedCount++;
    }

    // Commit batch
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${updatedCount} alerts marked as read`,
      updatedCount,
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error bulk updating alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update alerts' },
      { status: 500 }
    );
  }
}
