/**
 * Admin Coupons API
 * GET /api/admin/coupons - Get all coupons
 * DELETE /api/admin/coupons - Delete coupon
 */

import { NextRequest, NextResponse } from 'next/server';
import { couponController } from '../../_lib/controllers/coupon.controller';
import { verifyAdminSession } from '../../_lib/auth/admin-auth';
import { AuthorizationError, NotFoundError, ValidationError } from '../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */


  

/**
 * GET /api/admin/coupons
 * Get all coupons with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await verifyAdminSession(request);

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as any;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get coupons using controller
    const coupons = await couponController.getAllCouponsAdmin(
      {
        status: status || 'all',
        search,
        limit,
        offset,
      },
      user
    );

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error('Error in GET /api/admin/coupons:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coupons
 * Delete a coupon
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await verifyAdminSession(request);

    // Get coupon ID from request body
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Delete coupon using controller
    await couponController.deleteCouponAdmin(id, user);

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/coupons:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
