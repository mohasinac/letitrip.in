/**
 * Track Order API Route - GET
 * 
 * GET: Track order by order number and email (public access)
 * No authentication required - uses order number + email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderController } from '../../_lib/controllers/order.controller';
import { 
  ValidationError, 
  NotFoundError 
} from '../../_lib/middleware/error-handler';

/**
 * GET /api/orders/track?orderNumber=XXX&email=XXX
 * Public endpoint - Track order by order number and email
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const orderNumber = searchParams.get('orderNumber');
    const email = searchParams.get('email');

    if (!orderNumber || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order number and email are required',
        },
        { status: 400 }
      );
    }

    // Track order using controller
    const order = await orderController.trackOrder(
      orderNumber.toUpperCase(),
      email.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error: any) {
    console.error('Error in GET /api/orders/track:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to track order' 
      },
      { status: 500 }
    );
  }
}
