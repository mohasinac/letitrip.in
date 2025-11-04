/**
 * Seller Orders API
 * GET /api/seller/orders - List seller's orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import { AuthorizationError } from '../../_lib/middleware/error-handler';

/**
 * Verify seller authentication
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
 * GET /api/seller/orders
 * List all orders for the authenticated seller
 */
export async function GET(request: NextRequest) {
  try {
    // Verify seller authentication
    const seller = await verifySellerAuth(request);
    
    // For admins, get all orders. For sellers, filter by their ID
    const sellerId = seller.role === 'admin' ? null : seller.uid;

    const adminDb = getAdminDb();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query - admins see all orders, sellers see only their orders
    let query;
    if (sellerId) {
      query = adminDb.collection('orders').where('sellerId', '==', sellerId);
    } else {
      // Admin - get all orders
      query = adminDb.collection('orders');
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Order by creation date (newest first)
    query = query.orderBy('createdAt', 'desc').limit(limit);

    // Execute query
    const snapshot = await query.get();

    // Map documents to orders and convert timestamps
    let orders = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString(),
      };
    });

    // Apply search filter if provided (client-side for flexibility)
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(
        (order: any) =>
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.customerEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate stats
    let allOrdersSnapshot;
    if (sellerId) {
      allOrdersSnapshot = await adminDb
        .collection('orders')
        .where('sellerId', '==', sellerId)
        .get();
    } else {
      // Admin - get all orders
      allOrdersSnapshot = await adminDb.collection('orders').get();
    }

    const allOrders = allOrdersSnapshot.docs.map((doc: any) => doc.data());

    const stats = {
      total: allOrders.length,
      pendingApproval: allOrders.filter((o: any) => o.status === 'pending_approval').length,
      processing: allOrders.filter((o: any) => o.status === 'processing').length,
      shipped: allOrders.filter((o: any) => o.status === 'shipped').length,
      delivered: allOrders.filter((o: any) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o: any) => o.status === 'cancelled').length,
      totalRevenue: allOrders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: orders,
      stats,
    });
  } catch (error: any) {
    console.error('Error in GET /api/seller/orders:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
