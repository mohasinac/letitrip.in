import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../../../_lib/database/admin';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';
import { couponController } from '../../../_lib/controllers/coupon.controller';
import { couponModel } from '../../../_lib/models/coupon.model';

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
 * GET /api/seller/coupons/[id] - Get a specific coupon
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;

    // Get coupon using model
    const coupon = await couponModel.findById(id);

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    // Verify ownership
    if ((coupon as any).sellerId !== seller.sellerId) {
      throw new AuthorizationError('Not your coupon');
    }

    return NextResponse.json({
      success: true,
      coupon,
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

    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/seller/coupons/[id] - Update a coupon
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;

    // Parse request body
    const body = await request.json();

    // Use controller to update coupon
    const coupon = await couponController.updateCoupon(id, body, seller);

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
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

    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seller/coupons/[id] - Delete a coupon
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;

    // Use controller to delete coupon
    await couponController.deleteCoupon(id, seller);

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
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

    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
