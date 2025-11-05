import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../_lib/auth/admin-auth';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../_lib/middleware/error-handler';



/**
 * Get all shipments for seller
 * GET /api/seller/shipments?status=all|pending|in_transit|delivered
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const db = getAdminDb();

    // Get query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';

    // Build query
    let shipmentsQuery: any = db.collection('shipments');

    // Admin sees all, sellers see only their shipments
    if (seller.role !== 'admin') {
      shipmentsQuery = shipmentsQuery.where('sellerId', '==', seller.uid);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      shipmentsQuery = shipmentsQuery.where('status', '==', statusFilter);
    }

    // Order by creation date
    shipmentsQuery = shipmentsQuery.orderBy('createdAt', 'desc');

    const shipmentsSnap = await shipmentsQuery.get();
    const shipments = shipmentsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      shippedAt: doc.data().shippedAt?.toDate?.()?.toISOString() || null,
      deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || null,
    }));

    // Calculate stats
    let statsQuery: any = db.collection('shipments');
    if (seller.role !== 'admin') {
      statsQuery = statsQuery.where('sellerId', '==', seller.uid);
    }

    const statsSnap = await statsQuery.get();
    const stats = {
      total: 0,
      pending: 0,
      pickup_scheduled: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      failed: 0,
    };

    statsSnap.docs.forEach((doc: any) => {
      const data = doc.data();
      stats.total++;
      
      switch (data.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'pickup_scheduled':
          stats.pickup_scheduled++;
          break;
        case 'in_transit':
          stats.in_transit++;
          break;
        case 'out_for_delivery':
          stats.out_for_delivery++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'failed':
        case 'returned':
          stats.failed++;
          break;
      }
    });

    return NextResponse.json({
      success: true,
      data: shipments,
      stats,
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

    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}
