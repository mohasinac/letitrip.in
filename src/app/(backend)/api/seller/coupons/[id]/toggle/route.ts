import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../../../_lib/auth/admin-auth';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../../_lib/middleware/error-handler';
import { couponController } from '../../../../_lib/controllers/coupon.controller';



/**
 * POST /api/seller/coupons/[id]/toggle - Toggle coupon active/inactive status
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const { id } = await context.params;

    // Use controller to toggle coupon status
    const coupon = await couponController.toggleCouponStatus(id, { uid: session.userId, role: session.role, email: session.email });

    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      status: coupon.status,
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error toggling coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle coupon' },
      { status: 500 }
    );
  }
}
