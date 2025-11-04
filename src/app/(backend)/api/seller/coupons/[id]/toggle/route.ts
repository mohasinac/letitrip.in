import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../../_lib/middleware/error-handler';
import { couponController } from '../../../../_lib/controllers/coupon.controller';

/**
 * Helper function to verify seller authentication
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
      sellerId: decodedToken.uid,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * POST /api/seller/coupons/[id]/toggle - Toggle coupon active/inactive status
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;

    // Use controller to toggle coupon status
    const coupon = await couponController.toggleCouponStatus(id, seller);

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
