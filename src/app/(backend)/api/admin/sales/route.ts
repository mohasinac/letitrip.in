/**
 * Admin Sales API
 * GET /api/admin/sales - List all sales campaigns
 * DELETE /api/admin/sales - Delete a sale campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../_lib/auth/admin-auth';
import { AuthorizationError, ValidationError } from '../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */


  

/**
 * Enrich sales with seller information
 */
async function enrichSalesWithSellerInfo(sales: any[]) {
  const db = getAdminDb();
  
  return Promise.all(
    sales.map(async (sale) => {
      if (!sale.sellerId) {
        return sale;
      }

      try {
        const sellerDoc = await db.collection('users').doc(sale.sellerId).get();
        const sellerData = sellerDoc.data();

        let shopName = 'Unknown Shop';
        if (sellerData?.shopId) {
          const shopDoc = await db.collection('shops').doc(sellerData.shopId).get();
          shopName = shopDoc.data()?.name || 'Unknown Shop';
        }

        return {
          ...sale,
          sellerEmail: sellerData?.email || 'Unknown',
          shopName,
        };
      } catch (error) {
        return {
          ...sale,
          sellerEmail: 'Unknown',
          shopName: 'Unknown Shop',
        };
      }
    })
  );
}

/**
 * GET /api/admin/sales
 * List all sales campaigns from all sellers with filtering and search
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const db = getAdminDb();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build Firestore query
    let query: any = db.collection('sales');

    // Apply status filter
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    // Order by creation date
    query = query.orderBy('createdAt', 'desc');

    // Execute query
    const snapshot = await query.get();
    
    // Map sales with proper date handling
    let sales = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        startDate: data.startDate?.toDate?.()?.toISOString() || data.startDate,
        endDate: data.endDate?.toDate?.()?.toISOString() || data.endDate,
      };
    });

    // Apply search filter (client-side)
    if (search) {
      const searchLower = search.toLowerCase();
      sales = sales.filter(
        (sale: any) =>
          sale.name?.toLowerCase().includes(searchLower) ||
          sale.description?.toLowerCase().includes(searchLower)
      );
    }

    // Enrich with seller information
    const salesWithSeller = await enrichSalesWithSellerInfo(sales);

    return NextResponse.json({
      success: true,
      data: salesWithSeller,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/sales:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sales
 * Delete a sale campaign (body: {id})
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const body = await request.json();
    const { id } = body;

    if (!id) {
      throw new ValidationError('Sale ID is required');
    }

    const db = getAdminDb();
    await db.collection('sales').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Sale deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/sales:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete sale' },
      { status: 500 }
    );
  }
}
