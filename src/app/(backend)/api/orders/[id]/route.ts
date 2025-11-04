/**
 * Order by ID API Route - GET, PUT
 * 
 * GET: View order details (owner/seller/admin)
 * PUT: Update order (seller/admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderController } from '../../_lib/controllers/order.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../../_lib/middleware/error-handler';

/**
 * GET /api/orders/[id]
 * Protected endpoint - Get order by ID
 * Authorization: Owner, Seller (if order is for their product), Admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user data for sellerId
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Get order using controller
    const order = await orderController.getOrderById(id, {
      uid: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      sellerId: userData?.sellerId,
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error: any) {
    console.error('Error in GET /api/orders/[id]:', error);
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Protected endpoint - Update order
 * Authorization: Seller (if order is for their product), Admin
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Fetch user data for sellerId
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Update order using controller
    const order = await orderController.updateOrder(
      id,
      body,
      {
        uid: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        sellerId: userData?.sellerId,
        email: userData?.email,
      }
    );

    return NextResponse.json({
      success: true,
      order,
      message: 'Order updated successfully',
    });

  } catch (error: any) {
    console.error('Error in PUT /api/orders/[id]:', error);
    
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

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
