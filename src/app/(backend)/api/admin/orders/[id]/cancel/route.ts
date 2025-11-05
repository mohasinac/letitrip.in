/**
 * Admin Order Cancel API
 * POST /api/admin/orders/[id]/cancel - Cancel an order (admin override)
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderController } from '../../../../_lib/controllers/order.controller';
import { getAdminAuth } from '../../../../_lib/database/admin';
import { AuthorizationError } from '../../../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */


  

/**
 * POST /api/admin/orders/[id]/cancel
 * Cancel an order (admin can cancel any order)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await verifyAdminSession(request);

    // Get order ID from params
    const { id } = await context.params;

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    // Cancel order using controller (admin can cancel any order)
    const order = await orderController.cancelOrder(id, reason, user);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/orders/[id]/cancel:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
