/**
 * Create Order API Route - POST
 * 
 * POST: Create new order with items, addresses, payment method
 * Features: Stock validation, coupon application, order number generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderController } from '../../_lib/controllers/order.controller';
import { authenticateUser } from '../../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError 
} from '../../_lib/middleware/error-handler';

/**
 * POST /api/orders/create
 * Protected endpoint - Create new order
 * Authorization: Authenticated users only
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!body.shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Prepare order data with user info
    const orderData = {
      ...body,
      userName: userData?.name || userData?.displayName || 'Unknown',
      userEmail: userData?.email || '',
    };

    // Create order using controller
    const order = await orderController.createOrder(
      orderData,
      {
        uid: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        sellerId: userData?.sellerId,
        email: userData?.email,
      }
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      order,
      message: 'Order created successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/orders/create:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error.message 
        },
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
      { 
        success: false, 
        error: 'Failed to create order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
