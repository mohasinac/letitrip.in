/**
 * Cancel Order API Route - POST
 * 
 * POST: Cancel order (owner/admin only)
 * Business Rule: Customers can cancel within 1 day of payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderController } from '../../../_lib/controllers/order.controller';
import { authenticateUser } from '../../../_lib/auth/middleware';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError 
} from '../../../_lib/middleware/error-handler';

/**
 * POST /api/orders/[id]/cancel
 * Protected endpoint - Cancel order
 * Authorization: Owner (within 1 day of payment), Admin (always)
 */
export async function POST(
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../../../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Cancel order using controller
    await orderController.cancelOrder(
      id,
      reason,
      {
        uid: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        sellerId: userData?.sellerId,
        email: userData?.email,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });

  } catch (error: any) {
    console.error('Error in POST /api/orders/[id]/cancel:', error);
    
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
      { success: false, error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
