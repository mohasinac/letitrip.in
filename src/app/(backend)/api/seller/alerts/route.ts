import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
} from '../../_lib/middleware/error-handler';

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
 * GET /api/seller/alerts?type=all|new_order|pending_approval|low_stock&isRead=true|false&limit=50
 * Get seller alerts with filters
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const db = getAdminDb();

    // Get query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const isReadParam = searchParams.get('isRead');
    const limitParam = parseInt(searchParams.get('limit') || '50');

    // Validate limit
    if (limitParam < 1 || limitParam > 500) {
      throw new ValidationError('Limit must be between 1 and 500');
    }

    // Build query
    let alertsQuery: any = db.collection('alerts').orderBy('createdAt', 'desc');

    // Admin sees all, sellers see only theirs
    if (seller.role !== 'admin') {
      alertsQuery = alertsQuery.where('sellerId', '==', seller.uid);
    }

    // Type filter
    if (type !== 'all') {
      alertsQuery = alertsQuery.where('type', '==', type);
    }

    // Read status filter
    if (isReadParam !== null) {
      alertsQuery = alertsQuery.where('isRead', '==', isReadParam === 'true');
    }

    // Apply limit
    alertsQuery = alertsQuery.limit(limitParam);

    const alertsSnap = await alertsQuery.get();
    const alerts = alertsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    // Calculate stats
    let statsQuery: any = db.collection('alerts');
    if (seller.role !== 'admin') {
      statsQuery = statsQuery.where('sellerId', '==', seller.uid);
    }

    const statsSnap = await statsQuery.get();
    let totalAlerts = 0;
    let unreadAlerts = 0;
    let newOrders = 0;
    let lowStock = 0;

    statsSnap.docs.forEach((doc: any) => {
      const data = doc.data();
      totalAlerts++;
      if (!data.isRead) unreadAlerts++;
      if (data.type === 'new_order') newOrders++;
      if (data.type === 'low_stock') lowStock++;
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      stats: {
        totalAlerts,
        unreadAlerts,
        newOrders,
        lowStock,
      },
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}
