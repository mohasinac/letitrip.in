/**
 * Admin Orders API
 * GET /api/admin/orders - List all orders (with filters)
 * PATCH /api/admin/orders - Bulk update order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderController } from '../../_lib/controllers/order.controller';
import { getAdminAuth } from '../../_lib/database/admin';
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
 * GET /api/admin/orders
 * List all orders with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: (searchParams.get('status') as any) || 'all',
      sellerId: searchParams.get('sellerId') || 'all',
      paymentMethod: (searchParams.get('paymentMethod') as any) || 'all',
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    // Get orders using controller
    const result = await orderController.getAllOrdersAdmin(filters, user);

    return NextResponse.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/orders:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get orders' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Bulk update order status
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No order IDs provided' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update orders using controller
    const result = await orderController.bulkUpdateOrderStatus(ids, status, user);

    return NextResponse.json({
      success: true,
      message: `${result.updatedCount} order(s) updated successfully`,
      updatedCount: result.updatedCount,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/orders:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update orders' },
      { status: 500 }
    );
  }
}
