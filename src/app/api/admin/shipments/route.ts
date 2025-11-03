/**
 * Admin Shipments API
 * GET /api/admin/shipments - List all shipments with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import { AuthorizationError } from '../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * Enrich shipments with seller information
 */
async function enrichShipmentsWithSellerInfo(shipments: any[]) {
  const db = getAdminDb();
  
  return Promise.all(
    shipments.map(async (shipment) => {
      if (!shipment.sellerId) {
        return shipment;
      }

      try {
        const sellerDoc = await db.collection('users').doc(shipment.sellerId).get();
        const sellerData = sellerDoc.data();

        let shopName = 'Unknown Shop';
        if (sellerData?.shopId) {
          const shopDoc = await db.collection('shops').doc(sellerData.shopId).get();
          shopName = shopDoc.data()?.name || 'Unknown Shop';
        }

        return {
          ...shipment,
          sellerEmail: sellerData?.email || 'Unknown',
          shopName,
        };
      } catch (error) {
        return {
          ...shipment,
          sellerEmail: 'Unknown',
          shopName: 'Unknown Shop',
        };
      }
    })
  );
}

/**
 * Calculate shipment statistics
 */
async function calculateShipmentStats() {
  const db = getAdminDb();
  const snapshot = await db.collection('shipments').get();
  const allShipments = snapshot.docs.map((doc) => doc.data());

  return {
    total: allShipments.length,
    pending: allShipments.filter((s: any) => s.status === 'pending').length,
    pickupScheduled: allShipments.filter((s: any) => s.status === 'pickup_scheduled').length,
    inTransit: allShipments.filter((s: any) => s.status === 'in_transit').length,
    delivered: allShipments.filter((s: any) => s.status === 'delivered').length,
    failed: allShipments.filter((s: any) => s.status === 'failed').length,
  };
}

/**
 * GET /api/admin/shipments
 * List all shipments from all sellers with filtering and search
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    const db = getAdminDb();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build Firestore query
    let query: any = db.collection('shipments');

    // Apply status filter
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Order by creation date
    query = query.orderBy('createdAt', 'desc');

    // Execute query
    const snapshot = await query.get();
    
    // Map shipments with proper date handling
    let shipments = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        shippedAt: data.shippedAt?.toDate?.()?.toISOString() || data.shippedAt,
        deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || data.deliveredAt,
      };
    });

    // Apply search filter (client-side since Firestore doesn't support text search)
    if (search) {
      const searchLower = search.toLowerCase();
      shipments = shipments.filter(
        (shipment: any) =>
          shipment.trackingNumber?.toLowerCase().includes(searchLower) ||
          shipment.orderNumber?.toLowerCase().includes(searchLower) ||
          shipment.carrier?.toLowerCase().includes(searchLower)
      );
    }

    // Enrich with seller information
    const shipmentsWithSeller = await enrichShipmentsWithSellerInfo(shipments);

    // Calculate statistics
    const stats = await calculateShipmentStats();

    return NextResponse.json({
      success: true,
      data: shipmentsWithSeller,
      stats,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/shipments:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}
