/**
 * Orders API Route - GET, POST
 * 
 * GET: List user's orders (authenticated)
 * POST: Create new order (authenticated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderController } from '../_lib/controllers/order.controller';
import { authenticateUser } from '../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../_lib/middleware/error-handler';

/**
 * GET /api/orders
 * Protected endpoint - List user's orders
 * Authorization: User (own orders), Seller (own orders), Admin (all orders)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Extract filters
    const filters = {
      status: searchParams.get('status') as any,
      paymentStatus: searchParams.get('paymentStatus') as any,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const pagination = {
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Fetch user data for sellerId
    const { getAdminDb } = await import('../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    let orders;

    // Route based on role
    if (user.role === 'admin') {
      orders = await orderController.getAllOrders(filters, pagination);
    } else if (user.role === 'seller' && userData?.sellerId) {
      orders = await orderController.getSellerOrders(userData.sellerId, filters, pagination);
    } else {
      orders = await orderController.getUserOrders(user.userId, filters, pagination);
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });

  } catch (error: any) {
    console.error('Error in GET /api/orders:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Protected endpoint - Create new order (deprecated, use /api/orders/create)
 * Redirects to create endpoint for consistency
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Use POST /api/orders/create to create orders',
      redirect: '/api/orders/create'
    },
    { status: 301 }
  );
}
